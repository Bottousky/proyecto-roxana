// QA end-to-end playthrough audit for Physica.
//
// Escenario:
//   1. Abre /physica/ y entra.
//   2. Para cada escena (2-8): resetea flags, intenta la acción NO canónica,
//      verifica que el flag NO flippe. Luego intenta la acción canónica y
//      verifica que el flag SÍ flippe.
//   3. Captura screenshots en docs/physica/screenshots/qa-<scene>-<state>.png.
//
// Notas:
//   - Usa probes del harness inyectados en babylonRuntime.ts (sólo en dev).
//   - No modifica babylonWorld.ts ni main.ts. Sólo observa.
//
// Ejecución:
//   node scripts/qa-physica-playthrough.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const URL = 'http://localhost:5173/physica/';
const OUT = path.resolve('docs/physica/screenshots');
fs.mkdirSync(OUT, { recursive: true });

const consoleLogs = [];
const pageErrors = [];

function log(...args) {
  console.log('[qa]', ...args);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getSnapshot(page) {
  return await page.evaluate(() => {
    if (typeof window.__pxSnapshot !== 'function') return null;
    return window.__pxSnapshot();
  });
}

async function press(page, action, down) {
  await page.evaluate(
    ({ action, down }) => {
      if (typeof window.__pxPress === 'function') window.__pxPress(action, down);
    },
    { action, down },
  );
}

async function teleport(page, x, y) {
  await page.evaluate(
    ({ x, y }) => {
      if (typeof window.__pxTeleport === 'function') window.__pxTeleport(x, y);
    },
    { x, y },
  );
}

async function setFlag(page, flags) {
  await page.evaluate((flags) => {
    const key = 'roxana-physica-v1';
    const payload = { flags };
    localStorage.setItem(key, JSON.stringify(payload));
  }, flags);
}

async function clearSave(page) {
  await page.evaluate(() => {
    localStorage.removeItem('roxana-physica-v1');
  });
}

async function getFlags(page) {
  const snap = await getSnapshot(page);
  return snap?.flags ?? null;
}

async function waitForCanvas(page) {
  await page.waitForSelector('canvas', { state: 'visible', timeout: 60000 });
  // Da tiempo para que Babylon, Havok, shaders y assets carguen.
  await page.waitForTimeout(5000);
  await page.waitForFunction(
    () => {
      const c = document.querySelector('canvas');
      return c instanceof HTMLCanvasElement && c.width > 100 && c.height > 100;
    },
    undefined,
    { timeout: 30000 },
  );
}

async function advance(page, ms) {
  await page.evaluate((ms) => {
    if (typeof window.advanceTime === 'function') window.advanceTime(ms);
  }, ms);
}

async function stepPhysics(page, ms, n = 10) {
  const chunk = Math.max(1, Math.floor(ms / n));
  for (let i = 0; i < n; i++) await advance(page, chunk);
}

async function tryScene(page, sceneKey, run) {
  log(`\n=== Escena ${sceneKey} ===`);
  await run();
}

async function snapShot(page, name) {
  const canvas = page.locator('canvas').first();
  const file = path.join(OUT, `qa-${name}.png`);
  await canvas.screenshot({ path: file, animations: 'disabled' });
  const sz = fs.statSync(file).size;
  log(`  screenshot: ${file} (${sz} bytes)`);
  return file;
}

const SCENES = [
  // x de inicio por escena, según constantes de babylonWorld.ts.
  { key: '2-cascada', x: -2, y: 0.8 },
  { key: '3-equilibrio', x: 17, y: 0.8 },
  { key: '4-referencia', x: 38, y: 1.6 },
  { key: '5-vector', x: 55, y: 4.5 },
  { key: '6-plano', x: 70, y: 2.9 },
  { key: '7-estacion', x: 90, y: 4.8 },
  { key: '8-metropoli', x: 100, y: 20.5 },
];

async function run() {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'],
    });
  } catch {
    log('Chromium falló, intentando Chrome instalado...');
    browser = await chromium.launch({
      headless: true,
      channel: 'chrome',
      args: ['--enable-webgl', '--ignore-gpu-blocklist'],
    });
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  page.on('console', (m) => {
    consoleLogs.push(`[${m.type()}] ${m.text()}`);
    log(`[browser:${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => {
    pageErrors.push(e.message);
    log(`[page-error] ${e.message}`);
  });

  log(`Abriendo: ${URL}`);
  const resp = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!resp || !resp.ok()) throw new Error(`HTTP ${resp?.status()} en ${URL}`);

  await page.waitForSelector('#px-continue');
  await page.click('#px-continue');
  await waitForCanvas(page);

  // El harness sólo se monta cuando import.meta.env.DEV === true.
  await page.waitForFunction(() => typeof window.__pxSnapshot === 'function', undefined, { timeout: 30000 });

  // Reset save.
  await clearSave(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#px-continue');
  await page.click('#px-continue');
  await waitForCanvas(page);
  await page.waitForFunction(() => typeof window.__pxSnapshot === 'function', undefined, { timeout: 30000 });

  const flagsReport = {};

  // === Escena 2 ===
  await tryScene(page, '2-cascada', async () => {
    // Teleport a la cornisa.
    await teleport(page, -2, 0.8);
    await advance(page, 500);
    await snapShot(page, 'e2-cascada-fresh');

    const before = await getFlags(page);
    log('  flags antes (no-act):', JSON.stringify(before));

    // Acción no canónica: caminar a la derecha sin presionar E. Sólo caminar.
    await press(page, 'right', true);
    await advance(page, 4000);
    await press(page, 'right', false);
    await advance(page, 500);

    const afterWalk = await getFlags(page);
    log('  flags tras caminar:', JSON.stringify(afterWalk));
    await snapShot(page, 'e2-cascada-after-walk');
    flagsReport['e2_cascada_walk'] = {
      cascadaObservada_before: before?.cascadaObservada ?? null,
      cascadaObservada_after: afterWalk?.cascadaObservada ?? null,
    };

    // Acción canónica: tomar una piedra + lanzar.
    await teleport(page, -4, 0.8);
    await advance(page, 300);
    await snapShot(page, 'e2-cascada-pre-pickup');
    await press(page, 'act', true); await press(page, 'act', false);
    await advance(page, 500);
    // Q = pred-sube
    await press(page, 'pred-sube', true); await press(page, 'pred-sube', false);
    await advance(page, 100);
    await snapShot(page, 'e2-cascada-carried-with-pred');
    // E = lanzar
    await press(page, 'act', true); await press(page, 'act', false);
    await advance(page, 3000);

    const afterCanonical = await getFlags(page);
    log('  flags tras canónica:', JSON.stringify(afterCanonical));
    await snapShot(page, 'e2-cascada-after-launch');
    flagsReport['e2_cascada_canonical'] = {
      cascadaObservada: afterCanonical?.cascadaObservada ?? null,
      piedrasInFlight: afterCanonical?.piedras?.filter((p) => p.inFlight).length ?? 0,
    };
  });

  // === Escena 3 (equilibrio) ===
  await tryScene(page, '3-equilibrio', async () => {
    await setFlag(page, {});
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#px-continue');
    await page.click('#px-continue');
    await waitForCanvas(page);
    await page.waitForFunction(() => typeof window.__pxSnapshot === 'function', undefined, { timeout: 30000 });

    // No-act: caminar por la zona sin tocar la losa.
    await teleport(page, 17, 0.8);
    await advance(page, 200);
    await snapShot(page, 'e3-equilibrio-fresh');
    await press(page, 'right', true);
    await advance(page, 4000);
    await press(page, 'right', false);
    await advance(page, 500);
    const afterWalk = await getFlags(page);
    log('  flags tras caminar:', JSON.stringify(afterWalk));
    await snapShot(page, 'e3-equilibrio-after-walk');
    flagsReport['e3_walk'] = { equilibrioResuelto: afterWalk?.equilibrioResuelto ?? null };

    // Canónica: levantar la losa y colocarla.
    await teleport(page, 19.5, 2.5);
    await advance(page, 200);
    await snapShot(page, 'e3-equilibrio-pre-pickup');
    await press(page, 'act', true); await press(page, 'act', false);
    await advance(page, 300);
    // Colocar la losa: el código la "coloca" cuando se vuelve a pulsar E en el mismo punto.
    await press(page, 'act', true); await press(page, 'act', false);
    await advance(page, 4000);
    const afterPlace = await getFlags(page);
    log('  flags tras colocar losa:', JSON.stringify(afterPlace));
    await snapShot(page, 'e3-equilibrio-after-place');
    flagsReport['e3_canonical'] = { equilibrioResuelto: afterPlace?.equilibrioResuelto ?? null };
  });

  // === Escena 4 (referencia) ===
  await tryScene(page, '4-referencia', async () => {
    await setFlag(page, {});
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#px-continue');
    await page.click('#px-continue');
    await waitForCanvas(page);
    await page.waitForFunction(() => typeof window.__pxSnapshot === 'function', undefined, { timeout: 30000 });

    // No-act: caminar por el valle sin pulsar E.
    await teleport(page, 38, 1.6);
    await advance(page, 200);
    await snapShot(page, 'e4-referencia-fresh');
    await press(page, 'right', true);
    await advance(page, 4000);
    await press(page, 'right', false);
    await advance(page, 500);
    const afterWalk = await getFlags(page);
    log('  flags tras caminar:', JSON.stringify(afterWalk));
    await snapShot(page, 'e4-referencia-after-walk');
    flagsReport['e4_walk'] = { referenciaAnclada: afterWalk?.referenciaAnclada ?? null };

    // Canónica: pararse en una plataforma drift y pulsar E. (Plataforma #1 ~ x=38).
    await teleport(page, 38, 1.6);
    await advance(page, 300);
    // Esperar a que la plataforma esté en el sitio (drift).
    await advance(page, 1000);
    await snapShot(page, 'e4-referencia-pre-anchor');
    await press(page, 'act', true); await press(page, 'act', false);
    await advance(page, 500);
    const afterAnchor = await getFlags(page);
    log('  flags tras anclar:', JSON.stringify(afterAnchor));
    await snapShot(page, 'e4-referencia-after-anchor');
    flagsReport['e4_canonical'] = { referenciaAnclada: afterAnchor?.referenciaAnclada ?? null };
  });

  // === Escena 5 (vector) ===
  await tryScene(page, '5-vector', async () => {
    await setFlag(page, {});
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#px-continue');
    await page.click('#px-continue');
    await waitForCanvas(page);
    await page.waitForFunction(() => typeof window.__pxSnapshot === 'function', undefined, { timeout: 30000 });

    // No-act: caminar por la zona sin tomar saquito.
    await teleport(page, 55, 4.5);
    await advance(page, 200);
    await snapShot(page, 'e5-vector-fresh');
    await press(page, 'right', true);
    await advance(page, 4000);
    await press(page, 'right', false);
    await advance(page, 500);
    const afterWalk = await getFlags(page);
    log('  flags tras caminar:', JSON.stringify(afterWalk));
    await snapShot(page, 'e5-vector-after-walk');
    flagsReport['e5_walk'] = { vectorComun: afterWalk?.vectorComun ?? null };

    // Canónica: tomar el primer saquito (x~54) y lanzar. Teletransporte directo al saquito.
    await teleport(page, 54, 4.5);
    await advance(page, 200);
    await snapShot(page, 'e5-vector-pre-pickup');
    await press(page, 'act', true); await press(page, 'act', false);
    // Avanzar la simulación: el saquito está en flight y debe cruzar el receptor.
    await advance(page, 2500);
    const afterLaunch = await getFlags(page);
    log('  flags tras lanzar:', JSON.stringify(afterLaunch));
    await snapShot(page, 'e5-vector-after-launch');
    flagsReport['e5_canonical'] = { vectorComun: afterLaunch?.vectorComun ?? null };
  });

  // === Escena 6 (plano inclinado) ===
  await tryScene(page, '6-plano', async () => {
    await setFlag(page, {});
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#px-continue');
    await page.click('#px-continue');
    await waitForCanvas(page);
    await page.waitForFunction(() => typeof window.__pxSnapshot === 'function', undefined, { timeout: 30000 });

    // No-act: caminar por la zona sin tocar la rampa ni la roca.
    // y=2.9 = altura de la roca (roca6Y = rampaAlturaBase + 0.9 = 2.9).
    await teleport(page, 70, 2.9);
    await advance(page, 200);
    await snapShot(page, 'e6-plano-fresh');
    await press(page, 'right', true);
    await advance(page, 4000);
    await press(page, 'right', false);
    await advance(page, 500);
    const afterWalk = await getFlags(page);
    log('  flags tras caminar:', JSON.stringify(afterWalk));
    await snapShot(page, 'e6-plano-after-walk');
    flagsReport['e6_walk'] = { planoInclinado: afterWalk?.planoInclinado ?? null };

    // Canónica: colocar la rampa (E cerca) y luego empujar la roca por la rampa.
    // rampaX = W_E6_INICIO + 8 = 70.
    await teleport(page, 70, 2.5);
    await advance(page, 200);
    await snapShot(page, 'e6-plano-pre-place');
    await press(page, 'act', true); await press(page, 'act', false);
    await advance(page, 300);
    // Ahora empujar la roca por la rampa: hay que caminar hacia la derecha.
    await teleport(page, rampaXFromWorld(70), 2.7);
    await advance(page, 200);
    await snapShot(page, 'e6-plano-pre-push');
    await press(page, 'right', true);
    await advance(page, 5000);
    await press(page, 'right', false);
    await advance(page, 1000);
    const afterPush = await getFlags(page);
    log('  flags tras empujar:', JSON.stringify(afterPush));
    await snapShot(page, 'e6-plano-after-push');
    flagsReport['e6_canonical'] = { planoInclinado: afterPush?.planoInclinado ?? null };
  });

  function rampaXFromWorld(_x) {
    // El push funciona si avatar está dentro de Math.abs(avatar.x - roca6X) < 1.2.
    // roca6X parte de rampaX = W_E6_INICIO + 8 = 70. La roca se mueve hacia la derecha.
    // Para empujar, el avatar debe acompañar la roca. Empezamos a su altura (2.7).
    return 70;
  }

  // === Escena 7 (estación) ===
  await tryScene(page, '7-estacion', async () => {
    // Prerrequisito: planoInclinadoOk debe estar seteado.
    await setFlag(page, { planoInclinado: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#px-continue');
    await page.click('#px-continue');
    await waitForCanvas(page);
    await page.waitForFunction(() => typeof window.__pxSnapshot === 'function', undefined, { timeout: 30000 });

    // No-act: caminar por la estación sin pulsar E.
    await teleport(page, 90, 4.8);
    await advance(page, 200);
    await snapShot(page, 'e7-estacion-fresh');
    await press(page, 'right', true);
    await advance(page, 2000);
    await press(page, 'right', false);
    await advance(page, 500);
    const afterWalk = await getFlags(page);
    log('  flags tras caminar:', JSON.stringify(afterWalk));
    await snapShot(page, 'e7-estacion-after-walk');
    flagsReport['e7_walk'] = { estacionEstabilizada: afterWalk?.estacionEstabilizada ?? null };

    // Canónica: pulsar E cerca de la estación.
    await teleport(page, 90, 4.8);
    await advance(page, 200);
    await snapShot(page, 'e7-estacion-pre-act');
    await press(page, 'act', true); await press(page, 'act', false);
    await advance(page, 1000);
    const afterAct = await getFlags(page);
    log('  flags tras E:', JSON.stringify(afterAct));
    await snapShot(page, 'e7-estacion-after-act');
    flagsReport['e7_canonical'] = { estacionEstabilizada: afterAct?.estacionEstabilizada ?? null };
  });

  // === Escena 8 (metrópoli) ===
  await tryScene(page, '8-metropoli', async () => {
    await setFlag(page, {});
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#px-continue');
    await page.click('#px-continue');
    await waitForCanvas(page);
    await page.waitForFunction(() => typeof window.__pxSnapshot === 'function', undefined, { timeout: 30000 });

    // No-act: teleportar a la izquierda de la plataforma y avanzar tiempo sin caminar.
    await teleport(page, 50, 0.8);
    await advance(page, 1000);
    const before = await getFlags(page);
    log('  flags antes:', JSON.stringify(before));
    await snapShot(page, 'e8-metropoli-pre');

    // Canónica "no canonical": caminar hasta W_E8_INICIO (90) sin pulsar E.
    await teleport(page, 89, 0.8);
    await advance(page, 200);
    await press(page, 'right', true);
    await advance(page, 2000);
    await press(page, 'right', false);
    await advance(page, 500);
    const afterWalk = await getFlags(page);
    log('  flags tras caminar:', JSON.stringify(afterWalk));
    await snapShot(page, 'e8-metropoli-after-walk');
    flagsReport['e8_walk'] = { metropolisRevelada: afterWalk?.metropolisRevelada ?? null };

    // Reset y canónica hipotética: pulsar E sobre la plataforma.
    await setFlag(page, {});
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#px-continue');
    await page.click('#px-continue');
    await waitForCanvas(page);
    await page.waitForFunction(() => typeof window.__pxSnapshot === 'function', undefined, { timeout: 30000 });

    // Subir a la plataforma de observación. La escalera lleva de abajo a Y_E8 = 20.
    await teleport(page, 100, 20.5);
    await advance(page, 500);
    const afterTeleport = await getFlags(page);
    log('  flags tras teleport:', JSON.stringify(afterTeleport));
    await snapShot(page, 'e8-metropoli-after-teleport');
    flagsReport['e8_teleport'] = { metropolisRevelada: afterTeleport?.metropolisRevelada ?? null };
  });

  // === Resumen ===
  log('\n=== RESUMEN ===');
  log(JSON.stringify(flagsReport, null, 2));
  fs.writeFileSync(path.join(OUT, 'qa-flags-report.json'), JSON.stringify(flagsReport, null, 2));
  log('\nErrores de página:', pageErrors.length);
  for (const e of pageErrors) log('  -', e);

  await browser.close();
}

run().catch((e) => {
  console.error('QA falló:', e);
  process.exit(1);
});