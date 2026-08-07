// Captura 1280x720 de una escena concreta de Physica. Reusa la URL padre en
// :5173, navega al estado del mundo indicado, espera a que el render se
// estabilice y guarda un PNG en docs/physica/screenshots/<out>.png.
//
// Uso:
//   node scripts/physica-shot.mjs e2-cascada-fresh
//   node scripts/physica-shot.mjs e2-cascada-dolly
//   node scripts/physica-shot.mjs e3-equilibrio-fresh
//
// El script define "estados" por nombre: cada uno describe teleport + acciones
// + tiempo a avanzar antes de la captura.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const URL = 'http://localhost:5173/physica/';
const OUT_DIR = path.resolve('docs/physica/screenshots');

const STATES = {
  'e2-cascada-fresh': async (page) => {
    await teleport(page, -2, 0.8);
    await advance(page, 800);
  },
  'e2-cascada-dolly': async (page) => {
    await teleport(page, 6.5, 0.8);
    await advance(page, 1500);
  },
  'e2-cascada-cornisa-left': async (page) => {
    await teleport(page, -10, 0.8);
    await advance(page, 1500);
  },
  'e2-cascada-cornisa-right': async (page) => {
    await teleport(page, 10, 0.8);
    await advance(page, 1500);
  },
  'e2-wide': async (page) => {
    // vista panorámica: cámara más alejada para ver composición completa
    await page.evaluate(() => {
      const cam = window.__pxCamera;
      if (cam) {
        cam.position.set(0, 5, 80);
        cam.setTarget(new BABYLON.Vector3(2, 2, 0));
      }
    }).catch(() => {});
    await advance(page, 500);
  },
  'e3-equilibrio-fresh': async (page) => {
    await teleport(page, 17, 0.8);
    await advance(page, 800);
  },
  'e4-referencia-fresh': async (page) => {
    await teleport(page, 38, 1.6);
    await advance(page, 1500);
  },
  'e5-vector-fresh': async (page) => {
    await teleport(page, 55, 4.5);
    await advance(page, 1500);
  },
  'e6-plano-fresh': async (page) => {
    // y=2.9 = altura de la roca6 (roca6Y = rampaAlturaBase + 0.9 = 2.9).
    await teleport(page, 70, 2.9);
    await advance(page, 1500);
  },
  'e7-estacion-fresh': async (page) => {
    await setFlag(page, { planoInclinado: true });
    await reload(page);
    await teleport(page, 86, 4.8);
    await advance(page, 1500);
  },
  'e8-metropoli-teleport': async (page) => {
    await setFlag(page, { metropolisRevelada: true, planoInclinado: true, estacionEstabilizada: true });
    await reload(page);
    await teleport(page, 100, 20.5);
    await advance(page, 1500);
  },
};

async function setFlag(page, flags) {
  await page.evaluate((flags) => {
    const key = 'roxana-physica-v1';
    localStorage.setItem(key, JSON.stringify({ flags }));
  }, flags);
}

async function reload(page) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#px-continue');
  await page.click('#px-continue');
  await page.waitForSelector('canvas', { state: 'visible', timeout: 60000 });
  await page.waitForFunction(() => typeof window.__pxSnapshot === 'function', undefined, { timeout: 30000 });
  await page.waitForTimeout(2000);
}

async function teleport(page, x, y) {
  await page.evaluate(({ x, y }) => {
    if (typeof window.__pxTeleport === 'function') window.__pxTeleport(x, y);
  }, { x, y });
}

async function advance(page, ms) {
  const chunk = 100;
  for (let i = 0; i < ms; i += chunk) {
    await page.evaluate((chunk) => {
      if (typeof window.advanceTime === 'function') window.advanceTime(chunk);
    }, Math.min(chunk, ms - i));
  }
}

async function main() {
  const outName = process.argv[2] ?? 'e2-cascada-fresh';
  const state = STATES[outName];
  if (!state) {
    console.error('Estado no conocido:', outName, '\nEstados disponibles:');
    for (const k of Object.keys(STATES)) console.error('  -', k);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `shot-${outName}.png`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => console.log(`[browser:${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => console.log(`[page-error] ${e.message}`));

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('#px-continue');
  await page.click('#px-continue');
  await page.waitForSelector('canvas', { state: 'visible', timeout: 60000 });
  await page.waitForFunction(() => typeof window.__pxSnapshot === 'function', undefined, { timeout: 30000 });
  await page.waitForTimeout(3000);
  // limpia save
  await page.evaluate(() => localStorage.removeItem('roxana-physica-v1'));
  await reload(page);

  await state(page);

  // Captura 1280x720 — WebGL headless responde mejor con `canvas.screenshot()`.
  const canvas = page.locator('canvas').first();
  await canvas.screenshot({ path: outFile });
  const sz = fs.statSync(outFile).size;
  console.log(`[shot] ${outFile} (${sz} bytes)`);

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
