// El Monte Quieto y la Casa de Compuertas en el juego: una vista libre en diagonal desde el
// Manantial y la vista de juego desde su lado oeste, en cada estado (apagada, canal con agua,
// compuerta que lagrimea, embalse bajo, luz firme o titilante). Parte de una bitácora terminada
// (IMPORT=archivo.json) y ajusta el estado sólo para mirar. Uso: GAME_URL=… IMPORT=… OUT=carpeta node scripts/qa-quiet-mount.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { chromePath, gpuArgs } from './chrome.mjs';

const url = process.env.GAME_URL || 'http://127.0.0.1:4190/', out = process.env.OUT || 'output/qa-quiet-mount';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('#title-settings').click();
await page.locator('#import-save').setInputFiles(process.env.IMPORT || 'output/playcanvas-playthrough/verified-save.json');
await page.locator('#transition').waitFor({ state: 'hidden', timeout: 120000 });
for (let i = 0; i < 100 && await page.evaluate(() => window.__ohmdal.mode !== 'world'); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(140); }
// To the Manantial by the map, as a player would.
await page.keyboard.press('m'); await page.locator('details.kmap-travel > summary').click(); await page.locator('[data-area="spring"]').click();
await page.waitForFunction(() => window.__ohmdal.state.area === 'spring' && window.__ohmdal.mode === 'world', {}, { timeout: 60000 });
await page.waitForTimeout(2500);
await page.addStyleTag({ content: '#hud,#toast,#interaction,#arrival{display:none!important}' });
const states = {
  apagada: { spring_sluice: false, pump: false, beacon_lens: false, irrigation: false },
  'canal-con-agua': { spring_sluice: true, pump: false, beacon_lens: false, irrigation: false },
  lagrimea: { spring_sluice: true, pump: true, beacon_lens: false, irrigation: false },
  'luz-firme': { beacon_lens: true, forge: 12 },
  'luz-titilante': { beacon_lens: true, forge: 18 },
};
for (const [name, set] of Object.entries(states)) {
  await page.evaluate(set => {
    const o = window.__ohmdal, s = o.state, w = o.world;
    for (const [k, v] of Object.entries(set)) if (k !== 'forge') s.flags[k] = v;
    // The Terrazas' agreement comes from the forge's brake: a light brake keeps the forge strong.
    if (set.forge !== undefined && s.puzzles.irrigation) { s.flags.irrigation = true; s.puzzles.irrigation.values.forge = set.forge === 12 ? 6 : 12; s.puzzles.irrigation.values.warmth = 12; s.puzzles.irrigation.values.flow = 12; }
    w.updateFlags(s);
  }, set);
  // A free, diagonal look from above the Manantial toward the mountain (inspection: nothing fades for the player).
  await page.evaluate(() => { const w = window.__ohmdal.world; w.setInspection(true); w.freeLook ??= w.update; w.update = (dt, st, input) => { w.freeLook(dt, st, input); w.camera.setPosition(22, 26, -58); w.camera.lookAt(-30, 7, -88); w.camera.camera.fov = 38; }; });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${name}-diagonal.png` });
  await page.evaluate(() => { const w = window.__ohmdal.world; w.update = w.freeLook; w.setInspection(false); });
  await page.waitForTimeout(600);
}
// The gameplay view from the Manantial's west side.
await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(2600); await page.keyboard.up('ArrowLeft');
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/juego-lado-oeste.png` });
console.log(`capturas en ${out} · errores ${errors.length}`, errors.slice(0, 3));
await browser.close();
