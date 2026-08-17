// Captura el momento del despertar de Ohm en la Plaza.
// Empieza en la Plaza, abre el puzzle del pedestal, lo resuelve, captura.
import { chromium } from 'playwright';

const BASE = process.env.OHMDAL_URL ?? 'http://localhost:5173';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.on('pageerror', (e) => console.error('PAGEERROR:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });

await page.goto(BASE + '/jugar?dev=1', { waitUntil: 'load' });
await page.waitForTimeout(800);

// Limpiar el save para que el primer click sea "Empezar de nuevo"
await page.evaluate(() => localStorage.removeItem('roxana-slice-v1'));
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(700);

// Empezar juego (Empezar de nuevo)
await page.evaluate(() => document.getElementById('btn-new')?.click());
await page.waitForTimeout(1500);

// Cerrar cualquier dialog que se haya abierto (narrativa de entrada)
const closeDialogs = async () => {
  for (let i = 0; i < 6; i++) {
    const visible = await page.evaluate(() => !document.getElementById('dialog')?.classList.contains('hidden'));
    if (!visible) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
  }
};
await closeDialogs();
await page.waitForTimeout(400);

// Verificar que __travel existe y saltar a la plaza
const travelInfo = await page.evaluate(() => {
  return { has: typeof window.__travel === 'function', room: window.__state?.room ?? null };
});
console.log('travel:', travelInfo);

await page.evaluate(() => window.__travel?.('ohmdal', 'plaza'));
await page.waitForTimeout(1500);

// Cerrar dialogs en la plaza si los hay
await closeDialogs();
await page.waitForTimeout(500);

// Capturar estado de la plaza
await page.screenshot({ path: 'artifacts/awakening-00-plaza.png' });
console.log('captured 00 (plaza)');

const press = async (key, ms = 220) => {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
  await page.waitForTimeout(80);
};

// Spawn por defecto es puerta (480, 90). El pedestal esta en (480, 342).
// Bajamos recto al sur hasta estar cerca.
for (let i = 0; i < 4; i++) await press('ArrowDown', 200);
await page.waitForTimeout(300);
await page.screenshot({ path: 'artifacts/awakening-01-approach.png' });
console.log('captured 01 (approach)');

// interactuar con el pedestal (tecla E)
await press('KeyE', 80);
await page.waitForTimeout(900);
await page.screenshot({ path: 'artifacts/awakening-02-puzzle.png' });
console.log('captured 02 (puzzle)');

// captura 1 seg luego, y luego cada 200ms
for (let i = 3; i < 15; i++) {
  await page.waitForTimeout(200);
  await page.screenshot({ path: `artifacts/awakening-0${i}-frame.png` });
  console.log('captured 0' + i);
}

await browser.close();
console.log('done');
