// La flecha dorada como única guía (ciclo 31): desde una partida guardada, sólo clics sobre la
// flecha, hasta llegar al lugar pedido. Prueba que seguirla nunca deje al jugador dando vueltas.
// Uso: GAME_URL=… SAVE=dev-tramos/x.json AREA=terraces POS=x,z HASTA=lake node scripts/qa-flecha.mjs
// (HASTA=puzzle: hasta que se abra una mesa; FLAGS=a,b agrega banderas a la partida.)
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { chromePath, gpuArgs } from './chrome.mjs';

const url = process.env.GAME_URL || 'http://127.0.0.1:4190/?flecha=siempre', until = process.env.HASTA || 'lake';
const save = JSON.parse(await readFile(process.env.SAVE || 'dev-tramos/lake.json', 'utf8'));
if (process.env.FLAGS) for (const f of process.env.FLAGS.split(',')) save.flags[f] = true;
if (process.env.AREA) { save.area = process.env.AREA; save.position = process.env.POS ? process.env.POS.split(',').map(Number) : null; }
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', e => console.log('ERROR', e.message));
await page.addInitScript(text => { if (!sessionStorage.getItem('f')) { localStorage.setItem('ohmdal.playcanvas.arc1.v1', text); sessionStorage.setItem('f', '1'); } }, JSON.stringify(save));
await page.goto(url); await page.waitForFunction(() => window.__ohmdal?.mode, {}, { timeout: 30000 });
await page.locator('#continue').first().click().catch(() => {});
await page.waitForTimeout(2500);
const state = () => page.evaluate(() => { const g = window.__ohmdal, w = g.world, p = w?.getPlayerPosition?.(), m = w?.guideMarker;
  let s = null; if (m?.enabled) { const q = w.camera.camera.worldToScreen(m.getPosition()), r = w.canvas.getBoundingClientRect(); s = [q.x + r.left, q.y + r.top]; }
  return { mode: g.mode, area: g.state.area, near: w?.getNearby?.()?.id, label: document.querySelector('#interaction-label')?.textContent, p: p && p.map(v => +v.toFixed(1)), guide: w?.guide && [w.guide.x, w.guide.z], arrow: s }; });
let ok = false;
for (let i = 0; i < 90; i++) {
  const s = await state();
  if (until === 'puzzle' && s.mode === 'puzzle') { console.log(i, 'mesa:', await page.locator('.wb-title, .workbench h2, [role=dialog] h2').first().innerText().catch(() => '?')); ok = true; break; }
  if (s.mode === 'dialogue' || s.mode === 'cinematic') { await page.keyboard.press('Enter'); await page.waitForTimeout(400); continue; }
  console.log(i, JSON.stringify(s));
  if (s.area === until) { ok = true; break; }
  if (s.arrow) await page.mouse.click(s.arrow[0], s.arrow[1]);
  await page.waitForTimeout(1500);
}
console.log(ok ? `LLEGÓ a ${until}` : `NO llegó a ${until}`);
await browser.close(); process.exit(ok ? 0 : 1);
