// Accessibility checks beyond the keyboard (A16): a gamepad operating the options panel (an
// emulated pad: Start, d-pad, A, B), touch on a phone (the action buttons and the prompts stay on
// screen at the largest text), ?reduced against a stored "off", and the intro with reduced motion
// (cuts, not travelling). Development inspection.
//   node scripts/accesibilidad.mjs [url] [outDir]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const url = process.argv[2] || 'http://127.0.0.1:4210/';
const out = process.argv[3] || 'accesibilidad-out';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const res = {};
const ready = p => p.waitForFunction(() => window.__physica && window.__physica.world.stepCount > 60, null, { timeout: 60000 });

// 1. Gamepad.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } }), page = await ctx.newPage();
  await page.addInitScript(() => {
    const pad = { id: 'emulado', connected: true, index: 0, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
    window.__pad = pad; navigator.getGamepads = () => [pad];
  });
  await page.goto(url + '?nopause&fresh&nointro'); await ready(page);
  await page.evaluate(() => { try { localStorage.removeItem('physica.ajustes.v1'); } catch {} });
  const press = async i => { await page.evaluate(i => { window.__pad.buttons[i].pressed = true; }, i); await page.waitForTimeout(90); await page.evaluate(i => { window.__pad.buttons[i].pressed = false; }, i); await page.waitForTimeout(140); };
  const st = () => page.evaluate(() => ({ paused: !document.getElementById('pause').hidden, focus: document.activeElement?.id || document.activeElement?.name || document.activeElement?.tagName, volume: +document.getElementById('opt-volume').value, reduced: window.__physica.reduced, ui: getComputedStyle(document.documentElement).getPropertyValue('--ui').trim(), journal: !!document.querySelector('.journal:not([hidden])') }));
  const steps = [];
  await press(9); steps.push({ what: 'Start', ...await st() });
  await press(15); await press(15); steps.push({ what: 'cruz ▶ ×2 en el volumen', ...await st() });
  await press(13); await press(0); steps.push({ what: 'cruz ▼, A: movimiento reducido', ...await st() });
  await press(13); await press(15); await press(15); steps.push({ what: 'cruz ▼, ▶ ×2: tamaño del texto', ...await st() });
  await press(8); steps.push({ what: 'Select (no debe abrir la Bitácora)', ...await st() });
  await press(1); steps.push({ what: 'B: cierra', ...await st() });
  await page.screenshot({ path: join(out, 'mando-tras-cerrar.png') });
  res.mando = steps; await ctx.close();
}
// 2. Touch, phone, largest text: action buttons on screen, pause corner, prompt kept inside.
for (const [w, h] of [[390, 844], [430, 932]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }), page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem('physica.ajustes.v1', JSON.stringify({ volume: 0.8, reduced: null, text: 1.5 })); } catch {} });
  await page.goto(url + '?nopause&fresh&nointro'); await ready(page);
  await page.evaluate(() => { const a = window.__physica.world.avatar; a.x = a.px = -2.85; a.y = a.py = a.hh; });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const box = el => { const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]; };
    const inside = b => b[0] >= 0 && b[1] >= 0 && b[2] <= innerWidth && b[3] <= innerHeight;
    const buttons = [...document.querySelectorAll('.touch button, .touch-pause')].map(b => ({ label: b.getAttribute('aria-label'), box: box(b) }));
    const prompt = document.getElementById('prompt'), title = document.getElementById('title'), hint = document.getElementById('hint');
    return { vw: innerWidth, allButtonsInside: buttons.every(b => inside(b.box)), buttons, promptInside: prompt.hidden ? 'oculto' : inside(box(prompt)), promptBox: box(prompt),
      hintBox: box(hint), titleBox: box(title), hintOverTitle: box(hint)[1] < box(title)[3] && box(hint)[3] > box(title)[1] };
  });
  await page.screenshot({ path: join(out, `tactil-${w}x${h}.png`) });
  res[`tactil ${w}×${h}`] = r; await ctx.close();
}
// 3. ?reduced wins over a stored "off"; and the intro with reduced motion cuts instead of travelling.
for (const reducedParam of [false, true]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } }), page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem('physica.ajustes.v1', JSON.stringify({ volume: 0.8, reduced: false, text: 1 })); } catch {} });
  await page.addInitScript(() => {
    window.__camLog = []; const tick = () => { const c = window.__physica?.state?.().camera; if (c) window.__camLog.push([c.x, c.y, c.z]); requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  });
  await page.goto(url + '?nopause&fresh' + (reducedParam ? '&reduced' : ''));
  await page.waitForTimeout(6500);
  const r = await page.evaluate(() => {
    const L = window.__camLog, d = []; for (let i = 1; i < L.length; i++) d.push(Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1], L[i][2] - L[i - 1][2]));
    return { reduced: window.__physica.reduced, frames: d.length, travellingFrames: d.filter(v => v > 0.02 && v < 2).length, cuts: d.filter(v => v >= 2).length, maxStep: +Math.max(...d).toFixed(2) };
  });
  res[reducedParam ? 'intro con ?reduced (guardado: no)' : 'intro sin ?reduced (guardado: no)'] = r; await ctx.close();
}
// 4. The Bitácora open behind the panel: a click on the panel's text and Shift+Tab must not reach it.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } }), page = await ctx.newPage();
  await page.goto(url + '?nopause&fresh&nointro'); await ready(page);
  const tap = async k => { await page.keyboard.down(k); await page.waitForTimeout(70); await page.keyboard.up(k); await page.waitForTimeout(150); };
  await tap('j'); await tap('Escape');
  await page.click('#pause p'); const seen = [];
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(80); seen.push(await page.evaluate(() => !!document.activeElement.closest('#pause'))); }
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  res['Bitácora detrás del panel'] = await page.evaluate(s => ({ focusAlwaysInPanel: s.every(Boolean), journalStillOpen: !!document.querySelector('.journal:not([hidden])'), journalInert: document.querySelector('.journal').inert }), seen);
  await ctx.close();
}
// 5. Gamepad scrolling: 1.5× text, «Controles» open, ▼ until «Seguir»; every focused control must be visible.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } }), page = await ctx.newPage();
  await page.addInitScript(() => {
    try { localStorage.setItem('physica.ajustes.v1', JSON.stringify({ volume: 0.8, reduced: null, text: 1.5 })); } catch {}
    const pad = { id: 'emulado', connected: true, index: 0, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
    window.__pad = pad; navigator.getGamepads = () => [pad];
  });
  await page.goto(url + '?nopause&fresh&nointro'); await ready(page);
  const press = async i => { await page.evaluate(i => { window.__pad.buttons[i].pressed = true; }, i); await page.waitForTimeout(90); await page.evaluate(i => { window.__pad.buttons[i].pressed = false; }, i); await page.waitForTimeout(160); };
  await press(9); await press(13); await press(13); await press(13); await press(0); // volume → reduced → size → «Controles», A opens it
  const opened = await page.evaluate(() => document.querySelector('#pause details').open && getComputedStyle(document.documentElement).getPropertyValue('--ui').trim());
  const trail = [];
  for (let i = 0; i < 12; i++) {
    await press(13);
    trail.push(await page.evaluate(() => { const el = document.activeElement, b = el.getBoundingClientRect(), box = document.querySelector('#pause > div').getBoundingClientRect();
      return { focus: el.id || el.tagName, visible: b.top >= box.top - 1 && b.bottom <= box.bottom + 1, scrollTop: Math.round(document.querySelector('#pause > div').scrollTop) }; }));
    if (trail.at(-1).focus === 'resume') break;
  }
  res['mando: desplazamiento con Controles abierto'] = { opened, reachedSeguir: trail.at(-1).focus === 'resume', allFocusedVisible: trail.every(t => t.visible), maxScroll: Math.max(...trail.map(t => t.scrollTop)), steps: trail.length };
  await page.screenshot({ path: join(out, 'mando-controles-abiertos.png') });
  await ctx.close();
}
writeFileSync(join(out, 'accesibilidad.json'), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
await browser.close();
