/* ============================================================
   InkFlow Admin — E2E smoke runner

   1. Serves dist/ via `vite preview`.
   2. Launches headless Chrome/Edge with CDP.
   3. For every built page: asserts it loads with no console errors and the
      ActionBus + core managers are live.
   4. Drives key flows on representative pages: ActionBus (theme/delete/
      settings nav/notification read) and the unified ListFilter (search ∧
      status, and the "all" tab not clobbering an active search).
   5. Tears everything down.
   ============================================================ */

import {
  PORT,
  ORIGIN,
  CDP,
  findBrowser,
  sleep,
  waitFor,
  connectPage,
  spawn,
  mkdtempSync,
  rmSync,
  tmpdir,
  join
} from './cdp-client.mjs';

const PAGES = [
  'index.html',
  'post-list.html',
  'post-edit.html',
  'category-list.html',
  'category-edit.html',
  'tag-list.html',
  'tag-edit.html',
  'comment-list.html',
  'comment-edit.html',
  'user-list.html',
  'user-edit.html',
  'image-list.html',
  'image-edit.html',
  'link-list.html',
  'link-edit.html',
  'notification-center.html',
  'settings.html',
  'login.html'
];

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + JSON.stringify(detail) : ''}`);
};

let preview;
let browser;
let userDataDir;

async function setup() {
  const bin = findBrowser();
  if (!bin) throw new Error('No Chrome/Edge found at standard paths; cannot run E2E smoke.');

  preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'ignore'
  });
  await waitFor('preview server', async () => {
    const res = await fetch(`${ORIGIN}/index.html`);
    return res.ok;
  });

  userDataDir = mkdtempSync(join(tmpdir(), 'inkflow-e2e-'));
  browser = spawn(
    bin,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-debugging-port=9222',
      `--user-data-dir=${userDataDir}`,
      'about:blank'
    ],
    { stdio: 'ignore' }
  );
  await waitFor('CDP endpoint', async () => {
    const res = await fetch(`${CDP}/json/version`);
    return res.ok;
  });
}

function teardown() {
  try {
    browser?.kill();
  } catch {
    /* ignore */
  }
  try {
    preview?.kill();
  } catch {
    /* ignore */
  }
  try {
    if (userDataDir) rmSync(userDataDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

export { PAGES, results, check, setup, teardown, sleep, connectPage, ORIGIN };
