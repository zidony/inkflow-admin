import { readFileSync } from 'node:fs';
import { PAGES, results, check, setup, teardown, sleep, connectPage, ORIGIN } from './harness.mjs';

// Bootstrap JS ships from a CDN that is slow/unreachable in headless CI. The
// confirm modal needs it, so we inject the local node_modules bundle to keep
// the modal test deterministic offline (matches the same Bootstrap users get).
const BOOTSTRAP_BUNDLE = readFileSync('node_modules/bootstrap/dist/js/bootstrap.bundle.min.js', 'utf8');

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

  // ---- 3) ActionBus + service layer: optimistic delete via confirm modal ----
  await navigate('post-list.html');

  // The confirm modal needs Bootstrap (CDN) loaded; it can be slow/blocked in
  // headless CI. Briefly wait, then inject the local bundle if absent so the
  // modal test is deterministic. (If we clicked delete with no Bootstrap,
  // confirmDialog would fall back to native confirm() and hang headless.)
  let bootstrapReady = await evaluate(`(async ()=>{
    for (let i=0;i<8;i++){ if (window.bootstrap?.Modal) return true; await new Promise(r=>setTimeout(r,250)); }
    return false;
  })()`);
  if (!bootstrapReady) {
    await send('Runtime.evaluate', { expression: BOOTSTRAP_BUNDLE });
    bootstrapReady = await evaluate('!!window.bootstrap?.Modal');
  }
  check('Confirm modal: Bootstrap available (CDN or injected)', bootstrapReady === true);

  if (bootstrapReady) {
    // 3a) Cancel path: open the confirm modal, cancel, row count unchanged.
    const cancelPath = await evaluate(`(async ()=>{
      const before=document.querySelectorAll('.ink-table tbody tr').length;
      document.querySelector('.ink-table tbody tr [data-action="delete"]')?.click();
      await new Promise(r=>setTimeout(r,500)); // modal show animation
      const modalShown=!!document.querySelector('#ink-confirm-modal.show');
      document.querySelector('#ink-confirm-modal [data-ink-confirm-cancel]')?.click();
      await new Promise(r=>setTimeout(r,500)); // modal hide animation
      return { before, modalShown, after: document.querySelectorAll('.ink-table tbody tr').length };
    })()`);
    check(
      'Confirm modal: cancel keeps the row',
      cancelPath.modalShown && cancelPath.after === cancelPath.before,
      cancelPath
    );

    // 3b) Confirm path: open the modal, confirm, row is removed + toast.
    const del = await evaluate(`(async ()=>{
      const before=document.querySelectorAll('.ink-table tbody tr').length;
      document.querySelector('.ink-table tbody tr [data-action="delete"]')?.click();
      await new Promise(r=>setTimeout(r,500));
      document.querySelector('#ink-confirm-modal [data-ink-confirm-ok]')?.click();
      return { before };
    })()`);
    await evaluate('new Promise(r=>setTimeout(r,700))', true); // modal hide + 320ms fade + removal
    const delAfter = await evaluate(`({
      after: document.querySelectorAll('.ink-table tbody tr').length,
      toast: !!document.querySelector('[role="status"],[role="alert"]')
    })`);
    check(
      'ActionBus+service: confirm modal delete removes row + toast',
      delAfter.after === del.before - 1 && delAfter.toast,
      { ...del, ...delAfter }
    );
  }

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
