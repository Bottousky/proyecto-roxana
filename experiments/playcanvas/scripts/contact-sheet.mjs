// Hoja de contactos: una secuencia de capturas en una grilla, para juzgar una escena en movimiento.
// Uso: node scripts/contact-sheet.mjs salida.png columnas captura1.png captura2.png …
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { chromePath } from './chrome.mjs';

const [out, columns, ...files] = process.argv.slice(2);
const cell = file => `<figure style="margin:0;position:relative"><img src="data:image/png;base64,${readFileSync(resolve(file)).toString('base64')}" style="width:100%;display:block"><figcaption style="position:absolute;left:6px;top:6px;background:#000b;color:#fff;font:600 13px system-ui;padding:2px 6px">${basename(file, '.png').replace(/^scene-/, '')}</figcaption></figure>`;
const html = `<!doctype html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${Number(columns) || 3},1fr);gap:4px">${files.map(cell).join('')}</body>`;
const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage({ viewport: { width: 2400, height: 600 } });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: resolve(out), fullPage: true });
await browser.close();
console.log(resolve(out));
