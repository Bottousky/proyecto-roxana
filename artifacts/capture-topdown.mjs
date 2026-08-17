// Captura pantallas del topdown (Phaser) en cada sala del Arco I.
// Salida: artifacts/topdown-<sala>.png
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('artifacts', { recursive: true });

const ROOMS = [
  { id: 'plaza',            spawn: { x: 480, y: 90 }, name: 'plaza' },
  { id: 'taller',           spawn: { x: 480, y: 410 }, name: 'taller' },
  { id: 'puerta',           spawn: { x: 480, y: 445 }, name: 'puerta' },
  { id: 'manantial_ohm',    spawn: { x: 605, y: 430 }, name: 'manantial' },
  { id: 'castle_gate',      spawn: { x: 830, y: 370 }, name: 'castle_gate' },
  { id: 'castle_gallery',   spawn: { x: 480, y: 445 }, name: 'castle_gallery' },
  { id: 'castle_branches',  spawn: { x: 480, y: 445 }, name: 'castle_branches' },
  { id: 'castle_heart',     spawn: { x: 480, y: 430 }, name: 'castle_heart' },
  { id: 'forge_yard',       spawn: { x: 825, y: 410 }, name: 'forge_yard' },
  { id: 'forge_infirmary',  spawn: { x: 205, y: 430 }, name: 'forge_infirmary' },
  { id: 'forge_longchannel',spawn: { x: 115, y: 300 }, name: 'forge_longchannel' },
  { id: 'forge_hall',       spawn: { x: 125, y: 375 }, name: 'forge_hall' },
  { id: 'terraces_top',     spawn: { x: 510, y: 105 }, name: 'terraces_top' },
  { id: 'terraces_mid',     spawn: { x: 480, y: 105 }, name: 'terraces_mid' },
  { id: 'terraces_mural',   spawn: { x: 130, y: 330 }, name: 'terraces_mural' },
  { id: 'terraces_aqueduct',spawn: { x: 450, y: 110 }, name: 'terraces_aqueduct' },
  { id: 'lighthouse_hall',  spawn: { x: 245, y: 420 }, name: 'lighthouse_hall' },
  { id: 'lighthouse_bench', spawn: { x: 715, y: 420 }, name: 'lighthouse_bench' },
  { id: 'clock_tower',      spawn: { x: 480, y: 200 }, name: 'clock_tower' },
  { id: 'lighthouse_lantern',spawn:{ x: 480, y: 200 }, name: 'lighthouse_lantern' },
];

const BASE = process.env.OHMDAL_URL ?? 'http://localhost:5173';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();

page.on('pageerror', (e) => console.error('PAGEERROR:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.error('CONSOLE:', m.text());
});

// Navegamos al entry del topdown: /jugar (no /, que es la landing del Instituto)
await page.goto(BASE + '/jugar?dev=1', { waitUntil: 'load' });
await page.waitForFunction(() => window.dispatchEvent(new CustomEvent('roxana:game-ready')), null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(900);

// El script necesita entrar en el juego antes de poder cambiar de sala.
// En la primera carga no hay save -> solo esta visible "Empezar de nuevo".
// En cargas siguientes, "Continuar viaje" aparece ademas.
const startGame = async () => {
  await page.evaluate(() => {
    const btn = document.getElementById('btn-new') ?? document.getElementById('btn-continue');
    if (btn) btn.click();
  });
  await page.waitForTimeout(1100);
};
await startGame();
// wait for the title screen
await page.waitForTimeout(1200);

// Una vez dentro del juego, podemos mover al jugador con la API global de dev.
for (const r of ROOMS) {
  await page.evaluate((roomId) => {
    if (typeof window.__travel === 'function') {
      window.__travel('ohmdal', roomId);
    } else {
      // fallback: pegar la sala y recargar via continue (carga el save nuevo)
      const cur = JSON.parse(localStorage.getItem('roxana-slice-v1') ?? '{}');
      cur.room = roomId;
      localStorage.setItem('roxana-slice-v1', JSON.stringify(cur));
      location.reload();
    }
  }, r.id);
  // En el caso reload-fallback, hay que re-llamar startGame() luego
  if (!await page.evaluate(() => typeof window.__travel === 'function')) {
    await page.waitForTimeout(1300);
    await startGame();
  } else {
    await page.waitForTimeout(900);
  }
  const file = `artifacts/topdown-${r.name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log('captured', file);
}

await browser.close();
console.log('done');
