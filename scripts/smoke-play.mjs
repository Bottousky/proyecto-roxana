// scripts/smoke-play.mjs
//
// Smoke test no destructivo del runtime de Roxana:
//   - levanta Vite en background;
//   - abre /jugar con Playwright headless;
//   - espera el canvas;
//   - captura console errors;
//   - toma screenshot a .playtest/;
//   - cierra.
//
// No toca gameplay, no abre otras rutas, no inyecta asserts.
// Ejecutar con:   node scripts/smoke-play.mjs
// o via npm:       npm run smoke:play
//
// Salida:
//   0  smoke OK (con warnings si los hubo)
//   1  smoke FAIL (timeout, error fatal de runtime, sin dev server)
//   2  no se pudo iniciar Playwright (binario faltante)

import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, '.playtest');
const NAV_TIMEOUT_MS = 25_000;
const IDLE_TIMEOUT_MS = 8_000;

await mkdir(OUT, { recursive: true });

// pick a free port (or honor env override)
async function pickFreePort() {
  if (process.env.ROXANA_SMOKE_PORT) return parseInt(process.env.ROXANA_SMOKE_PORT, 10);
  return await new Promise((resolvePort, rejectPort) => {
    const srv = createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolvePort(port));
    });
    srv.on('error', rejectPort);
  });
}

const PORT = await pickFreePort();
// IMPORTANT: on Windows, "localhost" resolves to ::1 (IPv6) before 127.0.0.1.
// Vite binds to whatever --host says; we bind to 127.0.0.1 explicitly and use
// the matching numeric URL so DNS resolution does not pick the wrong family.
const URL_BASE = `http://127.0.0.1:${PORT}`;
const URL_TARGET = `${URL_BASE}/jugar`;

// --- 1. start Vite ---------------------------------------------------------

console.log(`[smoke] starting vite on port ${PORT} ...`);
// On Windows + Node 24, .cmd files require shell:true. We pass everything as a
// single command string to keep argv shape stable and avoid the EINVAL path.
const vite = spawn('npx.cmd vite --port ' + PORT + ' --strictPort', {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
  windowsHide: true,
});

process.on('uncaughtException', (err) => { console.error('[smoke] uncaught:', err); process.exit(3); });
process.on('unhandledRejection', (err) => { console.error('[smoke] unhandled rejection:', err); process.exit(3); });

let viteKilled = false;
const viteBuf = [];
vite.stdout.on('data', (chunk) => { viteBuf.push(chunk.toString()); });
vite.stderr.on('data', (chunk) => { viteBuf.push(`[stderr] ${chunk.toString()}`); });
vite.on('error', (err) => { console.error('[smoke] vite spawn error:', err); process.exit(2); });
vite.on('exit', (code, sig) => {
  if (code !== 0 && !viteKilled) {
    console.error(`[smoke] vite exited code=${code} sig=${sig}`);
    console.error('--- vite log ---');
    console.error(viteBuf.join(''));
    process.exit(2);
  }
});

async function killVite(code) {
  if (viteKilled) return;
  viteKilled = true;
  try {
    if (process.platform === 'win32') {
      // kill cmd.exe, npx.cmd, and the vite.js child via taskkill /T
      spawn('taskkill', ['/pid', String(vite.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      vite.kill('SIGTERM');
    }
  } catch (_) { /* ignore */ }
  await sleep(300);
  // Only exit when caller asked for a code (early-abort path). Normal
  // cleanup lets the script continue to the report and process.exit at the end.
  if (code !== undefined) process.exit(code);
}

// wait for vite to bind the port. Check both IPv4 and IPv6 because
// Windows may resolve "localhost" to either depending on the adapter.
async function portReachable(port, timeoutMs) {
  const net = await import('node:net');
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    for (const host of ['127.0.0.1', '::1']) {
      const ok = await new Promise((res) => {
        const sock = new net.Socket();
        sock.setTimeout(500);
        const finish = (val) => { try { sock.destroy(); } catch (_) { } res(val); };
        sock.once('connect', () => finish(true));
        sock.once('timeout', () => finish(false));
        sock.once('error', () => finish(false));
        try { sock.connect(port, host); } catch (_) { finish(false); }
      });
      if (ok) return host;
    }
    await sleep(300);
  }
  return null;
}

const boundHost = await portReachable(PORT, 30_000);
if (!boundHost) {
  console.error('[smoke] vite no se levanto en 30s; log:');
  console.error(viteBuf.join('').slice(-1500));
  await killVite(2);
}

// Vite's /jugar rewrite resolves to /src/jugar/. Playwright must use the bound host.
// IPv6 hosts need to be wrapped in brackets: http://[::1]:port/
const URL_BASE_FINAL = boundHost.includes(':') ? `http://[${boundHost}]:${PORT}` : `http://${boundHost}:${PORT}`;
const URL_TARGET_FINAL = `${URL_BASE_FINAL}/jugar`;

// give Vite an extra moment after port opens
await sleep(500);

// --- 2. Playwright smoke ---------------------------------------------------

let pw;
try {
  pw = await import('playwright');
} catch (err) {
  console.error('[smoke] no se pudo cargar playwright:', err.message);
  await killVite(2);
}

const browser = await pw.chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 960, height: 540 } });
const page = await ctx.newPage();

const consoleMsgs = [];
const pageErrors = [];
page.on('console', (msg) => {
  const t = msg.type();
  if (t === 'error' || t === 'warning') {
    consoleMsgs.push({ type: t, text: msg.text() });
  }
});
page.on('pageerror', (err) => pageErrors.push(String(err)));

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const screenshot = resolve(OUT, `smoke-${stamp}.png`);

let navOk = false;
let canvasPresent = false;
let verdict = 'PASS';
const notes = [];

try {
  await page.goto(URL_TARGET_FINAL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
  navOk = true;
} catch (err) {
  console.error('[smoke] navigation failed:', err.message);
  verdict = 'FAIL';
  notes.push('navigation timeout');
}

// wait for either a Phaser canvas (game started) OR the title screen
// (the Ohmdal title screen is shown before user interaction; Phaser only
// initialises after the player dismisses it). Either state counts as "page
// rendered" for the smoke test.
if (navOk) {
  try {
    await page.waitForFunction(
      () => !!document.querySelector('canvas') || !!document.querySelector('#title-screen, .title-card'),
      null,
      { timeout: IDLE_TIMEOUT_MS }
    );
    canvasPresent = true;
  } catch (err) {
    verdict = 'FAIL';
    notes.push('canvas/title no aparecio');
    try {
      const debug = await page.evaluate(() => ({
        title: document.title,
        url: location.href,
        bodyStart: (document.body ? document.body.innerHTML : '').slice(0, 400),
      }));
      console.log('[smoke] page debug:', JSON.stringify(debug, null, 2));
    } catch (e) { /* ignore */ }
  }
  // extra settle for first frames
  if (canvasPresent) {
    await sleep(1500);
    try {
      await page.screenshot({ path: screenshot, fullPage: false });
    } catch (err) {
      notes.push(`screenshot fallo: ${err.message}`);
    }
  }
}

// categorize console
const fatalConsole = consoleMsgs.filter((m) => m.type === 'error');
const warnConsole = consoleMsgs.filter((m) => m.type === 'warning');
if (fatalConsole.length > 0 && verdict === 'PASS') verdict = 'PARTIAL';
if (pageErrors.length > 0) {
  verdict = 'FAIL';
  notes.push('pageerror observado');
}

await browser.close();
await killVite(); // normal cleanup, do not exit here

// --- 3. report -------------------------------------------------------------

const report = {
  verdict,
  url: URL_TARGET_FINAL,
  canvasPresent,
  pageErrors,
  consoleErrors: fatalConsole,
  consoleWarnings: warnConsole,
  notes,
  screenshot: screenshot,
  viteLogTail: viteBuf.join('').split('\n').slice(-5).join('\n'),
};

console.log('--- SMOKE REPORT ---');
console.log(JSON.stringify(report, null, 2));

const code = verdict === 'FAIL' ? 1 : 0;
process.exit(code);
