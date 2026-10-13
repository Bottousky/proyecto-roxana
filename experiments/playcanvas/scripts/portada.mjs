// La portada del estilo X e Y es el reino de verdad (ciclo 28): una toma del propio juego, sin
// interfaz, con el viajero y Ohm en 3D. Prueba varios encuadres y guarda cada uno.
// Uso: OUT=carpeta node scripts/portada.mjs   (servidor en 4190)
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { chromePath, gpuArgs, nameTraveller } from './chrome.mjs';
const out = process.env.OUT || 'output/portada'; await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('http://127.0.0.1:4190/?estilo=xy&gente=3d', { waitUntil: 'networkidle' });
await page.locator('#title-settings').click();
await page.locator('#import-save').setInputFiles(process.env.IMPORT || 'output/playcanvas-playthrough/verified-save.json');
await page.locator('#transition').waitFor({ state: 'hidden', timeout: 120000 });
await nameTraveller(page);
for (let i = 0; i < 100 && await page.evaluate(() => window.__ohmdal.mode !== 'world'); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(140); }
const area = process.env.AREA || 'plaza';
if (await page.evaluate(() => window.__ohmdal.state.area) !== area) {
  await page.keyboard.press('m'); await page.locator('details.kmap-travel > summary').click(); await page.locator(`[data-area="${area}"]`).click();
  await page.waitForFunction(a => window.__ohmdal.state.area === a && window.__ohmdal.mode === 'world', area, { timeout: 60000 });
}
await page.addStyleTag({ content: '#hud,#toast,#interaction,#arrival,#touch-controls,#field-meter,#ohm-bubble,.hud-top,.hud-bottom,#objective{display:none!important}' });
// Each pose: player and Ohm (area metres), camera position and target (kingdom metres), vertical FOV.
if (process.env.SKYTEST) await page.evaluate(() => { window.__skyTest = true; });
const poses = JSON.parse(process.env.POSES || JSON.stringify([
  { name: 'fuente', player: [1.4, 3.2], ohm: [2.9, 3.6], cam: [7, 4.2, 13], at: [-1, 2.2, -4], fov: 42 },
  { name: 'alta', player: [1.4, 3.2], ohm: [2.9, 3.6], cam: [10, 11, 20], at: [-2, 1, -6], fov: 40 },
  { name: 'baja', player: [0.6, 5.2], ohm: [2.1, 5.6], cam: [3.5, 1.8, 11], at: [-1.5, 3.2, -6], fov: 50 },
]));
for (const p of poses) {
  await page.evaluate(p => {
    const w = window.__ohmdal.world;
    w.player.position.set(p.player[0], 0, p.player[1]); w.ohm.position.set(p.ohm[0], 0, p.ohm[1]);
    w.portadaUpdate ??= w.update;
    w.update = (dt, st, input) => { w.portadaUpdate(dt, st, input); w.camera.setPosition(...p.cam); w.camera.lookAt(...p.at); w.camera.camera.fov = p.fov; if (window.__skyTest) { const c = w.camera.camera.clearColor; c.set(1, 0, 0, 1); w.camera.camera.clearColor = c; } };
  }, p);
  // Face the camera: a short step toward it, then stand.
  await page.keyboard.down('ArrowDown'); await page.waitForTimeout(150); await page.keyboard.up('ArrowDown');
  await page.evaluate(p => { const w = window.__ohmdal.world; w.player.position.set(p.player[0], 0, p.player[1]); }, p);
  await page.waitForTimeout(Number(process.env.WAIT || 7000));
  await page.screenshot({ path: `${out}/portada-${p.name}.png` });
  console.log('toma', p.name);
}
await browser.close();
