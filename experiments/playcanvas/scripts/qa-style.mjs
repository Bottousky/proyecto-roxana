// Capturas para comparar estilos (ciclo 27): el mismo lugar y el mismo punto en HD-2D y en X e Y,
// un plano general y un primer plano del viajero, de frente, con Ohm a un costado.
// Uso: AREA=plaza AT=2,6 OUT=carpeta node scripts/qa-style.mjs [estilo …]   (estilos: hd2d, xy, xy3d)
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { chromePath, gpuArgs, nameTraveller } from './chrome.mjs';

const area = process.env.AREA || 'plaza', at = (process.env.AT || '2,6').split(',').map(Number), out = process.env.OUT || 'output/qa-style';
await mkdir(out, { recursive: true });
const looks = process.argv.slice(2).length ? process.argv.slice(2) : ['hd2d', 'xy', 'dibujo', 'xy3d'];
const query = { hd2d: '?estilo=hd2d', xy: '?estilo=xy', xy3d: '?estilo=xy&gente=3d', dibujo: '?estilo=xy&gente=dibujo' };

// A crop around the traveller, from the camera's own projection.
const crop = async (page, file, size = 320) => {
  const [x, y] = await page.evaluate(() => { const w = window.__ohmdal.world, p = w.player.position, [ox, oz] = w.data.areas[w.area.id].offset, v = w.camera.getPosition().clone().set(p.x + ox, 1.1, p.z + oz), s = w.camera.camera.worldToScreen(v); return [s.x, s.y]; });
  await page.screenshot({ path: file, clip: { x: Math.max(0, x - size / 2), y: Math.max(0, y - size / 2), width: size, height: size } });
};
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
for (const look of looks) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto((process.env.GAME_URL || 'http://127.0.0.1:4190/') + query[look] + (process.env.EXTRA ? '&' + process.env.EXTRA : ''), { waitUntil: 'networkidle' });
  await page.locator('#title-settings').click();
  await page.locator('#import-save').setInputFiles(process.env.IMPORT || 'output/playcanvas-playthrough/verified-save.json');
  await page.locator('#transition').waitFor({ state: 'hidden', timeout: 120000 });
  await nameTraveller(page);
  for (let i = 0; i < 100 && await page.evaluate(() => window.__ohmdal.mode !== 'world'); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(140); }
  if (await page.evaluate(() => window.__ohmdal.state.area) !== area) {
    await page.keyboard.press('m'); await page.locator('details.kmap-travel > summary').click(); await page.locator(`[data-area="${area}"]`).click();
    await page.waitForFunction(a => window.__ohmdal.state.area === a && window.__ohmdal.mode === 'world', area, { timeout: 60000 });
  }
  // Stand at the spot facing the camera, Ohm a step to the side.
  await page.evaluate(([x, z]) => { const w = window.__ohmdal.world; w.player.position.set(x, 0, z); w.ohm.position.set(x + 1.6, 0, z + .4); }, at);
  await page.keyboard.down('ArrowDown'); await page.waitForTimeout(120); await page.keyboard.up('ArrowDown');
  await page.evaluate(([x, z]) => { const w = window.__ohmdal.world; w.player.position.set(x, 0, z); w.ohm.position.set(x + 1.6, 0, z + .4); }, at);
  await page.addStyleTag({ content: '#hud,#toast,#interaction,#arrival,#touch-controls,#field-meter{display:none!important}' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${area}-${look}${process.env.TAG ? '-' + process.env.TAG : ''}.png` });
  // Close-up: the camera's own zoom, as the game frames a conversation.
  await page.evaluate(() => { const w = window.__ohmdal.world; w.closeUp = w.restPose; w.restPose = p => { const r = w.closeUp(p); return { ...r, zoom: 3.2, focus: [p[0], r.focus[1], p[2] - .6] }; }; });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${area}-${look}-cerca.png` });
  await crop(page, `${out}/${area}-${look}-retrato${process.env.TAG ? '-' + process.env.TAG : ''}.png`);
  // Walking sideways, mid-stride.
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(700);
  await crop(page, `${out}/${area}-${look}-camina.png`);
  await page.waitForTimeout(260); await crop(page, `${out}/${area}-${look}-camina2.png`);
  await page.keyboard.up('ArrowLeft');
  if (process.env.GESTOS) {
    // Talking and cheering, on the traveller (the world's own signals).
    await page.evaluate(([x, z]) => { const w = window.__ohmdal.world; w.player.position.set(x, 0, z); w.speaking = { actor: w.playerActor, t: 1 }; if (w.playerActor.figure) w.playerActor.figure.heading = 0; }, at);
    for (const k of [0, 1, 2]) { await page.waitForTimeout(330); await crop(page, `${out}/${area}-${look}-habla${k}.png`); }
    await page.evaluate(() => { const w = window.__ohmdal.world; w.speaking = null; const p = w.player.position; w.celebration = { t: 0, x: p.x, z: p.z, actors: [w.playerActor, w.ohmActor] }; });
    for (const k of [0, 1, 2]) { await page.waitForTimeout(k ? 300 : 900); await crop(page, `${out}/${area}-${look}-festeja${k}.png`); }
  }
  console.log(look, errors.length ? errors.slice(0, 2) : 'sin errores');
  await page.close();
}
await browser.close();
