/* ============================================================
   InkFlow Admin — Zero-dependency E2E smoke test

   Drives the BUILT app in real headless Chrome (or Edge) over the Chrome
   DevTools Protocol. No Playwright/Puppeteer — uses Node's global fetch +
   WebSocket (Node 22+). Self-manages `vite preview` and the browser, so
   `npm run test:e2e` is one command.

   Requires: a prior `npm run build` (serves dist/), and Chrome or Edge
   installed at a standard path. NOT wired into the release gate — run on
   demand.
   ============================================================ */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 4188;
const ORIGIN = `http://localhost:${PORT}`;
const CDP = 'http://localhost:9222';

const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
];

function findBrowser() {
  return CHROME_PATHS.find(p => existsSync(p));
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitFor(label, fn, { tries = 40, gap = 250 } = {}) {
  for (let i = 0; i < tries; i++) {
    try {
      const v = await fn();
      if (v) return v;
    } catch {
      /* not ready yet */
    }
    await sleep(gap);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

// Minimal CDP page client over a single websocket.
async function connectPage() {
  const targets = await (await fetch(`${CDP}/json`)).json();
  const page = targets.find(t => t.type === 'page');
  if (!page) throw new Error('no CDP page target');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    } else if (m.method) {
      listeners.forEach(l => l(m));
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id;
      pending.set(i, { resolve, reject });
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  return { ws, send, onEvent: fn => listeners.push(fn) };
}

export { PORT, ORIGIN, CDP, findBrowser, sleep, waitFor, connectPage, spawn, mkdtempSync, rmSync, tmpdir, join };
