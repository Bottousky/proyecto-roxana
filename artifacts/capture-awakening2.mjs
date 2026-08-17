// Captura la secuencia completa del despertar de Ohm:
// 1) En la Plaza, caminar al pedestal
// 2) Abrir el puzzle (tecla E)
// 3) Cubrir los 3 huecos correctos (g1, g4, g5)
// 4) Avanzar y capturar el momento del despertar
import { chromium } from 'playwright';

const BASE = process.env.OHMDAL_URL ?? 'http://localhost:5173';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.on('pageerror', (e) => console.error('PAGEERROR:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });

await page.goto(BASE + '/jugar?dev=1', { waitUntil: 'load' });
await page.waitForTimeout(700);
await page.evaluate(() => localStorage.removeItem('roxana-slice-v1'));
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(700);
await page.evaluate(() => document.getElementById('btn-new')?.click());
await page.waitForTimeout(1300);

// Cerrar dialogs de bienvenida
for (let i = 0; i < 6; i++) {
  const visible = await page.evaluate(() => !document.getElementById('dialog')?.classList.contains('hidden'));
  if (!visible) break;
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}

// Saltar a la plaza
await page.evaluate(() => window.__travel?.('ohmdal', 'plaza'));
await page.waitForTimeout(2000);
await page.screenshot({ path: 'artifacts/awk-debug-travel.png' });
console.log('debug-travel shot');

// Cerrar dialogs
for (let i = 0; i < 4; i++) {
  const visible = await page.evaluate(() => !document.getElementById('dialog')?.classList.contains('hidden'));
  if (!visible) break;
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}

await page.screenshot({ path: 'artifacts/awk-00-plaza.png' });
console.log('00 plaza');

// El pedestal esta en (480, 342). Spawn en puerta (480, 90).
// Teleport directo al pedestal via dev hook
const teleported = await page.evaluate(() => window.__pos?.(480, 342) ?? false);
console.log('teleported:', teleported);
await page.waitForTimeout(600);

// si no estamos al pie del pedestal, igual capturamos y seguimos
const prompt = await page.evaluate(() => {
  const p = document.getElementById('prompt');
  return { visible: p && !p.classList.contains('hidden'), text: p?.textContent ?? null };
});
console.log('prompt:', prompt);

// Posicion esperada: ~(480, 90 + 8*30) = (480, 330) ≈ pedestal
// Pero el spawn puede tener un poco de offset, asi que usamos
// la camara: tomamos un screenshot y vemos donde quedo el personaje.
await page.screenshot({ path: 'artifacts/awk-01-approach.png' });
console.log('01 approach');

if (prompt.visible && /pedestal|Ohm|piedra/i.test(prompt.text ?? '')) {
  // abrir el puzzle
  const press = async (key, ms = 200) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(ms);
    await page.keyboard.up(key);
    await page.waitForTimeout(50);
  };
  await press('KeyE', 100);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'artifacts/awk-02-puzzle.png' });
  console.log('02 puzzle open');

  // Cubrir los huecos correctos: g1, g4, g5
  // El bench es un div #bench con .bench-stage > svg > rect.gap-slot
  const covered = await page.evaluate(() => {
    const slots = Array.from(document.querySelectorAll('rect.gap-slot'));
    const order = ['g1', 'g4', 'g5']; // solucion correcta: arriba + vuelta larga
    const results = [];
    for (const id of order) {
      const slot = slots.find((s) => s.getAttribute('data-gap') === id);
      if (!slot) { results.push({ id, ok: false, reason: 'no-slot' }); continue; }
      slot.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      results.push({ id, ok: true });
    }
    return results;
  });
  console.log('covered:', covered);
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'artifacts/awk-03-solved.png' });
  console.log('03 solved (puzzle closed/awakening should start)');

  // cerrar el bench clickeando "Continuar" para disparar la awakening
  const closed = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('#bench button'));
    const cont = buttons.find((b) => /continuar/i.test(b.textContent ?? ''));
    if (cont) { cont.click(); return true; }
    return false;
  });
  console.log('continuar clicked:', closed);
  await page.waitForTimeout(300);

  // captura del momento del despertar: cada 200ms por 3s
  for (let i = 4; i < 22; i++) {
    await page.waitForTimeout(200);
    await page.screenshot({ path: `artifacts/awk-${String(i).padStart(2, '0')}-awakening.png` });
    console.log(String(i).padStart(2, '0') + ' awakening');
  }
} else {
  console.log('no pedestal prompt; current text:', prompt.text);
}

await browser.close();
console.log('done');
