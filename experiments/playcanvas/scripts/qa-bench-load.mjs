// Carga visual de cada banco recién abierto: si la pantalla necesita desplazarse para ver el
// tablero y el encargo, cuántos bloques de texto y controles compiten a la vez, y cuántos nombres
// del tablero quedan pisados por un cable. Abre cada banco con el acceso de depuración (medición,
// no recorrido). Uso: GAME_URL=… SIZE=1440x900 [SHOTS=carpeta] node scripts/qa-bench-load.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { chromePath, gpuArgs } from './chrome.mjs';

const url = process.env.GAME_URL || 'http://127.0.0.1:4190/';
const [width, height] = (process.env.SIZE || '1440x900').split('x').map(Number);
const shots = process.env.SHOTS; if (shots) await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('#new-game').click();
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', {}, { timeout: 60000 });
const ids = ['awaken', 'workshop', 'gate', 'pump', 'distribution', 'irrigation', 'beacon_supply', 'beacon_network', 'beacon_lens'];
const rows = [];
for (const id of ids) {
  await page.evaluate(id => { document.querySelector('#dialogue')?.classList.add('hidden'); const w = window.__ohmdal.workbench; document.querySelector('#workbench').classList.remove('hidden'); w.open(id, undefined); }, id);
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => {
    const root = document.querySelector('#workbench'), vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; for (let o = e; o && o !== document; o = o.parentElement) { const c = getComputedStyle(o); if (c.display === 'none' || c.visibility === 'hidden') return false; } return !e.closest('details:not([open]) > :not(summary)'); };
    const scroller = [...root.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY));
    const board = root.querySelector('.wb-board').getBoundingClientRect(), aside = root.querySelector('.wb-aside')?.getBoundingClientRect();
    const texts = [...root.querySelectorAll('p,h1,h2,h3,h4,li,summary,label,.wb-observation strong,.wb-observation span')].filter(e => vis(e) && e.textContent.trim().length > 2 && !e.closest('.wb-board') && e.getBoundingClientRect().top < innerHeight);
    const controls = [...root.querySelectorAll('button,input,summary,select')].filter(e => vis(e) && !e.closest('.wb-board') && e.getBoundingClientRect().top < innerHeight);
    // Labels crossed by a wire: sample each cable path on screen.
    const labels = [...root.querySelectorAll('.wb-terminal-label,.wb-engraving')].filter(vis).map(e => ({ e, r: e.getBoundingClientRect() }));
    const crossed = new Set();
    for (const path of root.querySelectorAll('.wb-wire-casing')) { const m = path.getScreenCTM(), len = path.getTotalLength(); for (let s = 0; s < len; s += 4) { const p = path.getPointAtLength(s), x = m.a * p.x + m.c * p.y + m.e, y = m.b * p.x + m.d * p.y + m.f; for (const l of labels) if (x > l.r.left && x < l.r.right && y > l.r.top && y < l.r.bottom) crossed.add(l.e.textContent.trim()); } }
    // What must be seen together: the board, what each piece shows, the brief and the controls.
    const caseBox = root.querySelector('.wb-case').getBoundingClientRect(), limit = Math.min(innerHeight, caseBox.bottom);
    const primary = ['.wb-board', '.wb-observation', '.wb-brief', '.wb-controls-aside'].map(s => [...root.querySelectorAll(s)].find(vis)).filter(Boolean);
    const hidden = primary.filter(e => e.getBoundingClientRect().bottom > limit + 1).map(e => e.className.split(' ')[0]);
    return { hidden, scroll: scroller ? scroller.scrollHeight - scroller.clientHeight : 0, boardFits: board.bottom <= innerHeight && board.top >= 0, asideBottom: aside ? Math.round(aside.bottom - innerHeight) : 0, texts: texts.length, controls: controls.length, crossed: [...crossed] };
  });
  if (shots) await page.screenshot({ path: `${shots}/${width}x${height}-${id}.png` });
  rows.push({ id, ...m });
  await page.evaluate(() => { window.__ohmdal.workbench.close?.(false); document.querySelector('#workbench').classList.add('hidden'); });
}
console.log(`${width}×${height}`);
for (const r of rows) console.log(`${r.id.padEnd(15)} principal ${r.hidden.length ? 'CORTADO: ' + r.hidden.join(', ') : 'a la vista'} · desplaza ${String(r.scroll).padStart(4)} px · tablero ${r.boardFits ? 'entero' : 'cortado'} · textos ${String(r.texts).padStart(2)} · controles ${String(r.controls).padStart(2)} · nombres pisados ${r.crossed.length}${r.crossed.length ? ' (' + r.crossed.join(', ') + ')' : ''}`);
const sum = k => rows.reduce((a, r) => a + (typeof r[k] === 'number' ? r[k] : r[k].length), 0);
console.log(`bancos con lo principal a la vista ${rows.filter(r => !r.hidden.length).length}/9 · total · textos ${sum('texts')} · controles ${sum('controls')} · nombres pisados ${sum('crossed')} · bancos que desplazan ${rows.filter(r => r.scroll > 0).length}/9`);
await browser.close();
