/* ============================================================
   InkFlow Admin — Responsive sweep (zero-dependency, CDP)

   Renders every built page at desktop / tablet / mobile widths in real
   headless Chrome and flags horizontal overflow (the most common responsive
   bug: scrollWidth > innerWidth ⇒ the page scrolls sideways). Captures a
   screenshot per page at mobile + desktop for eyeballing, and checks the
   mobile sidebar drawer opens/closes.

   Reuses the smoke harness (preview + browser lifecycle). Not wired into the
   release gate — run on demand:  npm run test:responsive
   ============================================================ */

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { PAGES, results, check, setup, teardown, sleep, connectPage, ORIGIN } from './harness.mjs';

const SHOTS_DIR = 'test/e2e/screenshots';

// width, height, label, mobile flag (touch + mobile UA hints), screenshot?
const VIEWPORTS = [
  { w: 1440, h: 900, label: 'desktop', mobile: false, shoot: true },
  { w: 768, h: 1024, label: 'tablet', mobile: true, shoot: false },
  { w: 390, h: 844, label: 'mobile', mobile: true, shoot: true },
  { w: 320, h: 640, label: 'mobile-xs', mobile: true, shoot: false }
];

// A few px of tolerance: sub-pixel rounding / scrollbar gutters aren't real bugs.
const OVERFLOW_TOLERANCE = 2;

async function run() {
  await setup();
  const { send } = await connectPage();
  await send('Page.enable');
  await send('Runtime.enable');

  rmSync(SHOTS_DIR, { recursive: true, force: true });
  mkdirSync(SHOTS_DIR, { recursive: true });

  async function evaluate(expression) {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (r.exceptionDetails) throw new Error('PAGE EX: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
  }

  async function setViewport({ w, h, mobile }) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile,
      screenWidth: w,
      screenHeight: h
    });
    await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  }

  async function navigate(path) {
    await send('Page.navigate', { url: `${ORIGIN}/${path}` });
    // Poll readyState instead of relying on load events (robust across renavigations).
    for (let i = 0; i < 60; i++) {
      const ready = await evaluate('document.readyState === "complete"').catch(() => false);
      if (ready) break;
      await sleep(100);
    }
    await sleep(450); // module init + bus start + chart lazy import on dashboard
  }

  async function screenshot(name) {
    const { data } = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    writeFileSync(`${SHOTS_DIR}/${name}.png`, Buffer.from(data, 'base64'));
  }

  // ---- Overflow sweep: every page × every viewport ----
  const overflowByViewport = Object.fromEntries(VIEWPORTS.map(v => [v.label, []]));

  for (const page of PAGES) {
    for (const vp of VIEWPORTS) {
      await setViewport(vp);
      await navigate(page);

      const metrics = await evaluate(`(()=>{
        const doc = document.documentElement;
        const overflowX = Math.max(doc.scrollWidth - window.innerWidth, 0);
        // Identify the widest offending element to make the report actionable.
        let widest = null, widestRight = window.innerWidth;
        for (const el of document.body.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          if (r.right > widestRight + 1 && r.width > 0) {
            widestRight = r.right;
            widest = (el.tagName.toLowerCase()) +
              (el.id ? '#'+el.id : '') +
              (el.className && typeof el.className==='string' ? '.'+el.className.trim().split(/\\s+/).slice(0,2).join('.') : '');
          }
        }
        return { innerWidth: window.innerWidth, scrollWidth: doc.scrollWidth, overflowX, widest };
      })()`);

      const ok = metrics.overflowX <= OVERFLOW_TOLERANCE;
      if (!ok) overflowByViewport[vp.label].push({ page, ...metrics });
      check(`no horizontal overflow: ${page} @ ${vp.label} (${vp.w}px)`, ok, ok ? '' : metrics);

      if (vp.shoot) {
        await screenshot(`${page.replace(/\.html$/, '')}--${vp.label}`);
      }
    }
  }

  // ---- Mobile sidebar drawer: open via toggle, close via overlay ----
  const mobileVp = VIEWPORTS.find(v => v.label === 'mobile');
  await setViewport(mobileVp);
  await navigate('index.html');
  const drawer = await evaluate(`(async ()=>{
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !toggle) return { ok:false, reason:'missing sidebar/toggle' };
    toggle.click();
    await new Promise(r=>setTimeout(r,300));
    const opened = sidebar.classList.contains('mobile-open');
    overlay?.click();
    await new Promise(r=>setTimeout(r,300));
    const closed = !sidebar.classList.contains('mobile-open');
    return { ok: opened && closed, opened, closed };
  })()`);
  check('mobile sidebar drawer opens via toggle and closes via overlay', drawer.ok, drawer);

  // ---- Summary ----
  const failed = results.filter(r => !r.ok);
  console.log('\n==== Responsive sweep summary ====');
  for (const vp of VIEWPORTS) {
    const bad = overflowByViewport[vp.label];
    console.log(`  ${vp.label} (${vp.w}px): ${bad.length ? bad.length + ' overflow page(s): ' + bad.map(b => b.page).join(', ') : 'clean'}`);
  }
  console.log(`  screenshots: ${SHOTS_DIR}/ (desktop + mobile per page)`);
  console.log(`\n==== ${results.length - failed.length}/${results.length} responsive checks passed ====`);
  return failed.length;
}

let exitCode = 1;
try {
  exitCode = (await run()) ? 1 : 0;
} catch (err) {
  console.error('Responsive sweep ERROR:', err.message);
  exitCode = 1;
} finally {
  teardown();
  await sleep(200);
}
process.exit(exitCode);
