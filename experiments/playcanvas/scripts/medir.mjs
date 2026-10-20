// Rendimiento medido, para comparar antes y después de cada optimización (2026-10-19). Sobre una build
// de producción servida con la ruta del sitio (vite preview de dist-pages, o el sitio publicado):
//  · carga de la escuela (raíz) y del título del juego, con red 4G emulada: pedidos, bytes por tipo,
//    primer pintado, LCP, tareas largas y tiempo de script;
//  · visita repetida en el mismo navegador: bytes que vuelven a bajar;
//  · partida nueva hasta el mundo: tiempo y bytes;
//  · uso en el mundo (Plaza, sin red emulada): ms de hilo principal por cuadro y cuadros por segundo.
// Uso: SITE=http://127.0.0.1:4192/proyecto-roxana/ OUT=salida.json node scripts/medir.mjs
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { chromePath, gpuArgs } from './chrome.mjs';

const site = process.env.SITE || 'http://127.0.0.1:4192/proyecto-roxana/';
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const report = { site, at: new Date().toISOString() };
const NET = { offline: false, latency: 40, downloadThroughput: 9e6 / 8, uploadThroughput: 3e6 / 8 }; // 4G: 9 Mb/s, 40 ms

async function session({ net = true, cpu = 1 } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage(), cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable'); await cdp.send('Performance.enable');
  if (net) await cdp.send('Network.emulateNetworkConditions', NET);
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  const requests = new Map(), errors = [];
  cdp.on('Network.responseReceived', e => { const r = requests.get(e.requestId) || {}; Object.assign(r, { url: e.response.url, type: e.type, status: e.response.status, cached: e.response.fromDiskCache || e.response.fromServiceWorker || e.response.fromPrefetchCache }); requests.set(e.requestId, r); });
  cdp.on('Network.loadingFinished', e => { const r = requests.get(e.requestId) || {}; r.bytes = e.encodedDataLength; requests.set(e.requestId, r); });
  cdp.on('Network.requestServedFromCache', e => { const r = requests.get(e.requestId) || {}; r.cached = true; requests.set(e.requestId, r); });
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    window.__perf = { lcp: 0, long: 0, longCount: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__perf.long += e.duration; window.__perf.longCount++; } }).observe({ type: 'longtask', buffered: true });
  });
  const summary = () => {
    const all = [...requests.values()].filter(r => r.url && !r.url.startsWith('data:'));
    const byType = {}; let bytes = 0, fromCache = 0;
    for (const r of all) { const b = r.bytes || 0; if (r.cached) { fromCache++; continue; } bytes += b; const t = (r.type || 'Other'); byType[t] = (byType[t] || 0) + b; }
    return { requests: all.length, fromCache, bytesMB: +(bytes / 1048576).toFixed(2), byTypeMB: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, +(v / 1048576).toFixed(2)]).sort((a, b) => b[1] - a[1])) };
  };
  const vitals = () => page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0], fcp = performance.getEntriesByName('first-contentful-paint')[0]; return { fcp: Math.round(fcp?.startTime || 0), lcp: Math.round(window.__perf.lcp), domContentLoaded: Math.round(n?.domContentLoadedEventEnd || 0), load: Math.round(n?.loadEventEnd || 0), longTasksMs: Math.round(window.__perf.long), longTasks: window.__perf.longCount, heapMB: +((performance.memory?.usedJSHeapSize || 0) / 1048576).toFixed(1) }; });
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  return { context, page, cdp, requests, errors, summary, vitals, metrics, reset: () => requests.clear() };
}

// 1. La escuela, primera visita y visita repetida.
{
  const s = await session(); const t0 = Date.now();
  await s.page.goto(site, { waitUntil: 'networkidle', timeout: 180000 }); await s.page.waitForTimeout(3000);
  const m = await s.metrics();
  report.escuela = { ...s.summary(), ...(await s.vitals()), networkIdleMs: Date.now() - t0, scriptMs: Math.round(m.ScriptDuration * 1000), errors: s.errors };
  s.reset(); await s.page.reload({ waitUntil: 'networkidle', timeout: 180000 }); await s.page.waitForTimeout(2000);
  report.escuelaRepetida = s.summary();
  await s.context.close();
}
// 2. El título del juego, primera visita, partida nueva hasta el mundo, y visita repetida.
{
  const s = await session(); const t0 = Date.now();
  await s.page.goto(site + 'ohmdal.html', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await s.page.locator('#new-game').waitFor({ state: 'visible', timeout: 180000 });
  const titleMs = Date.now() - t0; await s.page.waitForLoadState('networkidle', { timeout: 180000 }).catch(() => {});
  const m = await s.metrics();
  report.titulo = { ...s.summary(), ...(await s.vitals()), titleReadyMs: titleMs, networkIdleMs: Date.now() - t0, scriptMs: Math.round(m.ScriptDuration * 1000), errors: s.errors };
  s.reset(); const t1 = Date.now();
  await s.page.locator('#new-game').click();
  for (let i = 0; i < 60 && !(await s.page.locator('#hud').isVisible().catch(() => false)); i++) {
    if (await s.page.locator('#player-name').isVisible().catch(() => false)) { await s.page.locator('#player-name').fill('Medición'); await s.page.locator('#name-form button[type="submit"]').click(); }
    await s.page.waitForTimeout(250);
  }
  report.partidaNueva = { ...s.summary(), worldMs: Date.now() - t1, heapMB: (await s.vitals()).heapMB };
  // Everything a first session downloads: until the network has been quiet for a while.
  for (let i = 0; i < 40; i++) { await s.page.keyboard.press('Enter'); await s.page.waitForTimeout(300); } // the arrival scene, read as a player would
  await s.page.waitForLoadState('networkidle', { timeout: 240000 }).catch(() => {}); await s.page.waitForTimeout(3000);
  report.partidaNuevaTotal = { ...s.summary(), quietMs: Date.now() - t1, heapMB: (await s.vitals()).heapMB };
  s.reset(); await s.page.goto(site + 'ohmdal.html', { waitUntil: 'networkidle', timeout: 180000 });
  report.tituloRepetido = s.summary();
  await s.context.close();
}
// 3. Uso en el mundo: la Plaza, de pie y caminando, sin red emulada.
{
  const s = await session({ net: false });
  await s.page.goto(site + 'ohmdal.html', { waitUntil: 'networkidle', timeout: 180000 });
  await s.page.locator('#new-game').click();
  for (let i = 0; i < 80 && !(await s.page.locator('#hud').isVisible().catch(() => false)); i++) {
    if (await s.page.locator('#player-name').isVisible().catch(() => false)) { await s.page.locator('#player-name').fill('Medición'); await s.page.locator('#name-form button[type="submit"]').click(); }
    await s.page.waitForTimeout(250);
  }
  // Talk the scene away so the world runs, then measure standing and walking.
  for (let i = 0; i < 80; i++) { const talking = await s.page.locator('#dialogue').isVisible().catch(() => false); if (!talking && i > 10) break; await s.page.keyboard.press('Enter'); await s.page.waitForTimeout(300); }
  const sample = async (label, act) => {
    await s.page.evaluate(() => { window.__frames = 0; const f = () => { window.__frames++; window.__raf = requestAnimationFrame(f); }; window.__raf = requestAnimationFrame(f); });
    const a = await s.metrics(), t = Date.now(); await act(); const b = await s.metrics(), secs = (Date.now() - t) / 1000;
    const frames = await s.page.evaluate(() => { cancelAnimationFrame(window.__raf); return window.__frames; });
    return { label, fps: +(frames / secs).toFixed(1), mainThreadMsPerFrame: +(((b.TaskDuration - a.TaskDuration) * 1000) / Math.max(1, frames)).toFixed(2), scriptMsPerFrame: +(((b.ScriptDuration - a.ScriptDuration) * 1000) / Math.max(1, frames)).toFixed(2), layoutsPerSec: +((b.LayoutCount - a.LayoutCount) / secs).toFixed(1), styleRecalcsPerSec: +((b.RecalcStyleCount - a.RecalcStyleCount) / secs).toFixed(1) };
  };
  report.mundo = [
    await sample('quieto (Portal)', () => s.page.waitForTimeout(8000)),
    await sample('caminando (Portal)', async () => { await s.page.keyboard.down('w'); await s.page.waitForTimeout(2500); await s.page.keyboard.up('w'); await s.page.keyboard.down('d'); await s.page.waitForTimeout(2500); await s.page.keyboard.up('d'); await s.page.keyboard.down('s'); await s.page.waitForTimeout(3000); await s.page.keyboard.up('s'); }),
  ];
  report.mundoErrores = s.errors;
  await s.context.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
if (process.env.OUT) await writeFile(process.env.OUT, JSON.stringify(report, null, 1));
