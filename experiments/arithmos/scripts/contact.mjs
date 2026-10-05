// Hoja de contacto: compone cuadros de una película en una sola imagen (con su tiempo).
// Uso: node scripts/contact.mjs <dir film> <salida.png> <desde> <hasta> [cols]
import {chromium} from 'playwright';
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const [, , dir, out, from = '0', to = '9999', cols = '4'] = process.argv;
const html = await readFile(`${dir}/index.html`, 'utf8');
const frames = JSON.parse(html.match(/const F=(\[.*?\]);/s)[1]).filter(([, t]) => t >= +from && t <= +to);
const pick = frames.filter((_, i) => i % Math.max(1, Math.floor(frames.length / 16)) === 0).slice(0, 16);
const browser = await chromium.launch({channel: 'chrome'});
const page = await browser.newPage({viewport: {width: 1600, height: 900}});
const base = resolve(dir);
await writeFile(`${base}/_contact.html`, `<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(${cols},1fr);gap:2px">${pick.map(([n, t]) => `<div style="position:relative"><img src="${n}" style="width:100%;display:block"><b style="position:absolute;left:4px;top:2px;color:#ff0;font:13px monospace;background:#000a">${t.toFixed(1)}s</b></div>`).join('')}</body>`);
await page.goto(`file://${base}/_contact.html`);
await page.waitForTimeout(500);
const h = await page.evaluate(() => document.body.scrollHeight);
await page.setViewportSize({width: 1600, height: h});
await page.screenshot({path: out, fullPage: true});
await browser.close();
console.log(pick.length, 'cuadros');
