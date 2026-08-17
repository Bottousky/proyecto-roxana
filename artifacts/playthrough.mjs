// Playthrough natural del topdown: nuevo juego, abrir puzzle, despertar,
// caminar al taller, luego a la puerta, abrir la puerta, ir al manantial.
// Captura cada paso para validar el arco end-to-end.
import { chromium } from 'playwright';

const BASE = process.env.OHMDAL_URL ?? 'http://localhost:5173';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.on('pageerror', (e) => console.error('PAGEERROR:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });

const closeDialogs = async () => {
  for (let i = 0; i < 6; i++) {
    const visible = await page.evaluate(() => !document.getElementById('dialog')?.classList.contains('hidden'));
    if (!visible) break;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(220);
  }
};

const wait = (ms) => page.waitForTimeout(ms);

const teleport = async (x, y) => {
  await page.evaluate(([px, py]) => window.__pos?.(px, py), [x, y]);
  await wait(500);
};

const travel = async (room) => {
  await page.evaluate((r) => window.__travel?.('ohmdal', r), room);
  await wait(1300);
  await closeDialogs();
  await wait(300);
};

const cap = async (name) => {
  await page.screenshot({ path: `artifacts/play-${name}.png` });
  console.log('cap', name);
};

await page.goto(BASE + '/jugar?dev=1', { waitUntil: 'load' });
await wait(700);
await page.evaluate(() => localStorage.removeItem('roxana-slice-v1'));
await page.reload({ waitUntil: 'load' });
await wait(700);
await page.evaluate(() => document.getElementById('btn-new')?.click());
await wait(1500);
await closeDialogs();
await wait(500);

// 1) Plaza - estado inicial
await travel('plaza');
await cap('01-plaza-start');

// 2) Walk to pedestal
await teleport(480, 342);
await cap('02-pedestal');

// 3) Open puzzle
await page.keyboard.press('KeyE');
await wait(900);
await cap('03-puzzle-open');

// 4) Solve puzzle
await page.evaluate(() => {
  const slots = Array.from(document.querySelectorAll('rect.gap-slot'));
  for (const id of ['g1', 'g4', 'g5']) {
    const slot = slots.find((s) => s.getAttribute('data-gap') === id);
    if (slot) slot.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
});
await wait(900);
await cap('04-puzzle-solved');

// 5) Click Continuar to trigger awakening
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('#bench button')).find((b) => /continuar/i.test(b.textContent ?? ''));
  if (btn) btn.click();
});
await wait(400);  // mid-awakening
await cap('05-awakening-peak');
await wait(1200);  // post-awakening, dialog visible
await cap('06-after-awakening');

// 6) Close dialogs, walk to Taller
await closeDialogs();
await wait(300);
await travel('taller');
await cap('07-taller');

// 7) Walk to Puerta
await travel('puerta');
await cap('08-puerta');

// 8) Walk to Manantial (via the ruta)
await travel('manantial_ohm');
await cap('09-manantial');

await browser.close();
console.log('done');
