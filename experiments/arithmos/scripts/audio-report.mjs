// Análisis objetivo del audio procedural (niveles y reparto espectral). No equivale a escucharlo.
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
import {startServer} from './serve.mjs';
const out = process.argv[2] || 'audio-report.json';
const server = await startServer(4400 + Math.floor(Math.random() * 100));
const port = server.address().port;
const browser = await chromium.launch({channel: 'chrome'});
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/lab/audio.html`);
await page.waitForFunction(() => window.__ready === true, null, {timeout: 120000});
const rows = await page.evaluate(() => window.__audio);
await writeFile(out, JSON.stringify(rows, null, 2));
for (const r of rows) console.log(`${r.name.padEnd(18)} pico ${String(r.peakDb).padStart(6)} dBFS  rms ${String(r.rmsDb).padStart(6)} dBFS  altas≥6k ${(r.highShare * 100).toFixed(1)}%${r.clipped ? '  SATURA' : ''}`);
await browser.close();
server.close();
