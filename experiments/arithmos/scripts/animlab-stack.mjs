// Apila imágenes en columna en una sola PNG, con su nombre (comparar recortes de dos versiones o de varios instantes).
// Uso: node scripts/animlab-stack.mjs salida.png a.png b.png ...
import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
const [, , out, ...files] = process.argv;
const imgs = await Promise.all(files.map(async f => `data:image/png;base64,${(await readFile(f)).toString('base64')}`));
const b = await chromium.launch({channel: 'chrome'});
const p = await b.newPage({viewport: {width: 1260, height: 400}});
await p.setContent(`<body style="margin:0;background:#000">${imgs.map((s, i) => `<div style="position:relative"><img src="${s}" style="width:1260px;display:block;margin-bottom:3px"><span style="position:absolute;left:6px;top:4px;color:#fff;font:14px sans-serif;background:#000a">${files[i].split('/').pop()}</span></div>`).join('')}</body>`);
await p.screenshot({path: out, fullPage: true});
await b.close();
