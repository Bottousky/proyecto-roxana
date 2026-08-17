// Captura cada sala del arco con TODOS los flags avanzados (estado "finished")
// para validar el efecto acumulado: luces, fogatas, agua en terrazas, etc.
import { chromium } from 'playwright';

const BASE = process.env.OHMDAL_URL ?? 'http://localhost:5173';
const ROOMS = [
  { id: 'plaza',                    name: 'plaza-on' },
  { id: 'taller',                   name: 'taller-on' },
  { id: 'puerta',                   name: 'puerta-open' },
  { id: 'manantial_ohm',            name: 'manantial' },
  { id: 'castle_gate',              name: 'castle_gate' },
  { id: 'castle_gallery',           name: 'castle_gallery' },
  { id: 'castle_branches',          name: 'castle_branches' },
  { id: 'castle_heart',             name: 'castle_heart' },
  { id: 'forge_yard',               name: 'forge_yard' },
  { id: 'forge_infirmary',          name: 'forge_infirmary' },
  { id: 'forge_longchannel',        name: 'forge_longchannel' },
  { id: 'forge_hall',               name: 'forge_hall-on' },
  { id: 'terraces_top',             name: 'terraces_top' },
  { id: 'terraces_mid',             name: 'terraces_mid' },
  { id: 'terraces_mural',           name: 'terraces_mural' },
  { id: 'terraces_aqueduct',        name: 'terraces_aqueduct' },
  { id: 'lighthouse_hall',          name: 'lighthouse_hall' },
  { id: 'lighthouse_bench',         name: 'lighthouse_bench' },
  { id: 'clock_tower',              name: 'clock_tower' },
  { id: 'lighthouse_lantern',       name: 'lighthouse_lantern-on' },
];

const FLAGS_FINISHED = {
  ohmAwake: true,
  ohmAwakeEverSeen: true,
  frenoDone: true,
  puertaDone: true,
  unit2Completed: true,
  unit3Completed: true,
  unit4Completed: true,
  unit5Completed: true,
  castleRestored: true,
  forgeRestored: true,
  valleyRestored: true,
  finished: true,
  solvedBellPaths: true,
  solvedGalleryChain: true,
  solvedBranches: true,
  solvedFuseInfirmary: true,
  solvedLongChannel: true,
  solvedSteps: true,
  solvedSingleStone: true,
  solvedLadder: true,
  solvedStoredSpark: true,
  solvedSleepingRiver: true,
  solvedClock: true,
  solvedLighthouse: true,
  unidad1: { ohmDespierto: true, despertarHecho: true, frenoHecho: true, puertaAbierta: true },
  unidad2: { campana: true, cadenaGaleria: true, ramales: true, repartidor: true },
  unidad3: { patio: true, enfermeria: true, canalLargo: true, naveCompleta: true },
  unidad4: { compuerta: true, reparto: true, piedraUnica: true, escalera: true },
  unidad5: { chispaAlmacenada: true, rioDespierto: true, reloj: true, linterna: true },
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.on('pageerror', (e) => console.error('PAGEERROR:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });

await page.goto(BASE + '/jugar?dev=1', { waitUntil: 'load' });
await page.waitForTimeout(700);

// Empezar juego nuevo
await page.evaluate(() => document.getElementById('btn-new')?.click());
await page.waitForTimeout(1500);

// Cerrar dialogs
const closeDialogs = async () => {
  for (let i = 0; i < 6; i++) {
    const visible = await page.evaluate(() => !document.getElementById('dialog')?.classList.contains('hidden'));
    if (!visible) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
};
await closeDialogs();

// Setear TODOS los flags a "finished" para validar el efecto acumulado.
const flagKey = 'roxana-slice-v1';
await page.evaluate(({ key, flags }) => {
  const cur = JSON.parse(localStorage.getItem(key) ?? '{}');
  cur.flags = { ...cur.flags, ...flags };
  localStorage.setItem(key, JSON.stringify(cur));
}, { key: flagKey, flags: FLAGS_FINISHED });
await page.waitForTimeout(300);

// Capturar cada sala
for (const r of ROOMS) {
  await page.evaluate(({ key, roomId }) => {
    const cur = JSON.parse(localStorage.getItem(key) ?? '{}');
    cur.room = roomId;
    localStorage.setItem(key, JSON.stringify(cur));
    if (typeof window.__travel === 'function') {
      window.__travel('ohmdal', roomId);
    }
  }, { key: flagKey, roomId: r.id });
  await page.waitForTimeout(1300);
  await closeDialogs();
  await page.waitForTimeout(300);
  const file = `artifacts/endgame-${r.name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log('captured', file);
}

await browser.close();
console.log('done');
