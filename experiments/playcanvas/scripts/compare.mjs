// Antes/después lado a lado, con rótulos, para registrar evidencia comparable.
// Uso: node scripts/compare.mjs salida.png "antes" a.png "después" b.png [ancho=1440]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromePath } from './chrome.mjs';

const [out, labelA, fileA, labelB, fileB, width = '1440'] = process.argv.slice(2);
const data = file => `data:image/png;base64,${readFileSync(resolve(file)).toString('base64')}`;
const half = Number(width) / 2;
const html = `<!doctype html><body style="margin:0;background:#111;display:flex;font:600 15px system-ui;color:#fff">
${[[labelA, fileA], [labelB, fileB]].map(([label, file]) => `<figure style="margin:0;width:${half}px;position:relative"><img src="${data(file)}" style="width:100%;display:block"><figcaption style="position:absolute;left:10px;bottom:10px;background:#000b;padding:4px 9px">${label}</figcaption></figure>`).join('')}</body>`;
const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage({ viewport: { width: Number(width), height: 400 } });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: resolve(out), fullPage: true });
await browser.close();
console.log(resolve(out));
