import { PAGES, results, check, setup, teardown, sleep, connectPage, ORIGIN } from './harness.mjs';

async function run() {
  await setup();
  const { send, onEvent } = await connectPage();

  await send('Page.enable');
  await send('Runtime.enable');

  // Collect console errors / page exceptions per navigation.
  let pageErrors = [];
  onEvent(m => {
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      pageErrors.push(m.params.args.map(a => a.value ?? a.description ?? '').join(' '));
    }
    if (m.method === 'Runtime.exceptionThrown') {
      pageErrors.push(m.params.exceptionDetails?.text || 'exception');
    }
  });

  async function evaluate(expression) {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (r.exceptionDetails) throw new Error('PAGE EX: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
  }

  async function navigate(path) {
    pageErrors = [];
    const loaded = new Promise(res => {
      const off = m => {
        if (m.method === 'Page.loadEventFired') res();
      };
      onEvent(off);
    });
    await send('Page.navigate', { url: `${ORIGIN}/${path}` });
    await loaded;
    await evaluate('new Promise(r=>setTimeout(r,400))'); // DOMContentLoaded init + bus start
  }

  // ---- 1) Every page: loads, no console errors, bus + theme wired ----
  for (const page of PAGES) {
    await navigate(page);
    const probe = await evaluate(`({
      title: document.title,
      hasBody: !!document.body && document.body.childElementCount > 0,
      themeFnAfterInit: typeof window.inkflowToggleTheme,
      hasToastShim: typeof window.showToast
    })`);
    const ok =
      probe.hasBody &&
      probe.themeFnAfterInit === 'function' &&
      probe.hasToastShim === 'function' &&
      pageErrors.length === 0;
    check(`page loads clean: ${page}`, ok, pageErrors.length ? { pageErrors } : probe.title);
  }

  // ---- 2) ActionBus: theme toggle on dashboard ----
  await navigate('index.html');
  const theme = await evaluate(`(()=>{
    const before = document.documentElement.getAttribute('data-theme')||'light';
    document.querySelector('[data-action="toggle-theme"]')?.click();
    return { before, after: document.documentElement.getAttribute('data-theme') };
  })()`);
  check('ActionBus: theme toggle flips data-theme', theme.before !== theme.after, theme);

  // ---- 3) ActionBus + service layer: optimistic delete on a list ----
  await navigate('post-list.html');
  const del = await evaluate(`(()=>{
    window.confirm=()=>true;
    const before=document.querySelectorAll('.ink-table tbody tr').length;
    document.querySelector('.ink-table tbody tr [data-action="delete"]')?.click();
    return { before };
  })()`);
  await evaluate('new Promise(r=>setTimeout(r,500))'); // 320ms fade + removal
  const delAfter = await evaluate(`({
    after: document.querySelectorAll('.ink-table tbody tr').length,
    toast: !!document.querySelector('[role="status"],[role="alert"]')
  })`);
  check(
    'ActionBus+service: optimistic delete removes row + toast',
    delAfter.after === del.before - 1 && delAfter.toast,
    { ...del, ...delAfter }
  );

  // ---- 4) ListFilter: #4 fix — "all" tab keeps an active search ----
  const filt = await evaluate(`(()=>{
    const vis=()=>[...document.querySelectorAll('.ink-table tbody tr')].filter(r=>r.style.display!=='none');
    const first=vis()[0];
    const q=((first?.querySelector('.ink-link,.ink-title,a')||first)?.textContent||'').trim().split(' ').filter(w=>w.length>=2)[0]||'';
    const input=document.getElementById('list-search');
    input.value=q; input.dispatchEvent(new Event('input',{bubbles:true}));
    const afterSearch=vis().length;
    document.querySelector('.ink-filter-tab[data-filter="all"]')?.click();
    return { q, afterSearch, afterAllTab: vis().length };
  })()`);
  check('ListFilter: "all" tab does not clobber active search', filt.afterSearch === filt.afterAllTab, filt);

  // ---- 5) ActionBus: settings nav switches sections ----
  await navigate('settings.html');
  const setres = await evaluate(`(()=>{
    const cur=document.querySelector('.ink-settings-nav-item.active')?.dataset.section||'';
    const btn=[...document.querySelectorAll('[data-action="switch-settings"][data-section]')].find(b=>(b.getAttribute('data-section')||'')!==cur);
    const sec=btn?.getAttribute('data-section');
    btn?.click();
    const el=sec?document.getElementById('section-'+sec):null;
    return { section:sec, shown: el?!el.classList.contains('d-none'):null };
  })()`);
  check('ActionBus: settings switch-settings shows section', setres.shown === true, setres);

  // ---- 6) ActionBus: notification mark-one-read ----
  await navigate('notification-center.html');
  const notif = await evaluate(`(()=>{
    const before=document.querySelectorAll('.ink-notif-row.unread').length;
    document.querySelector('[data-action="read-one"]')?.click();
    return { before, after: document.querySelectorAll('.ink-notif-row.unread').length };
  })()`);
  check('ActionBus: notification read-one marks one read', notif.after === notif.before - 1, notif);

  const failed = results.filter(r => !r.ok);
  console.log(`\n==== ${results.length - failed.length}/${results.length} smoke checks passed ====`);
  return failed.length;
}

let exitCode = 1;
try {
  exitCode = (await run()) ? 1 : 0;
} catch (err) {
  console.error('E2E smoke ERROR:', err.message);
  exitCode = 1;
} finally {
  teardown();
  await sleep(200);
}
process.exit(exitCode);
