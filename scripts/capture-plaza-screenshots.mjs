/* Screenshot capture del commit 4 — Plaza 1920×1080. */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
  const page = await context.newPage();

  // Captura de consola para diagnosticar.
  page.on('console', (msg) => console.log('  [browser]', msg.text()));
  page.on('pageerror', (err) => console.log('  [pageerror]', err.message));

  // 1. Cargar /jugar con la query que mete al jugador en la Plaza
  //    (origen = portal escolar).
  await page.goto('http://localhost:4173/jugar/?from=portal&room=plaza', { waitUntil: 'load' });

  // 2. Phaser monta ExplorationScene tras el "Empezar de nuevo".
  //    Como llegamos por portal, debería ir directo a la Plaza.
  //    Esperar a que `window.__game` exista y a que el jugador esté
  //    en el chunk 'plaza'.
  await page.waitForFunction(() => {
    const game = (window).__game;
    const scene = game?.scene?.getScene('explore');
    return scene && scene.activeAreaId === 'plaza';
  }, { timeout: 15000 });
  console.log('  [boot] active area:', await page.evaluate(() => (window).__game?.scene?.getScene('explore')?.activeAreaId));

  // Helper: teletransportar al jugador (world coords; en Plaza local == world).
  async function teleport(x, y) {
    await page.evaluate(([tx, ty]) => {
      const game = (window).__game;
      const scene = game?.scene?.getScene('explore');
      if (scene && scene.player) {
        scene.player.setPosition(tx, ty);
        if (scene.cameras?.main) {
          scene.cameras.main.centerOn(tx, ty);
        }
      }
    }, [x, y]);
  }
  async function snap(label, x, y) {
    await teleport(x, y);
    await page.waitForTimeout(600);
    const path = `screenshots/c4_${label}.png`;
    await page.screenshot({ path });
    return path;
  }

  const out = [];
  out.push({ label: '01_spawn_portal_south', path: await snap('01_spawn_portal_south', 960, 1040) });
  out.push({ label: '02_centro', path: await snap('02_centro', 960, 640) });
  out.push({ label: '03_extremo_oeste', path: await snap('03_extremo_oeste', 60, 500) });
  out.push({ label: '04_extremo_este', path: await snap('04_extremo_este', 1860, 540) });
  out.push({ label: '05_extremo_norte', path: await snap('05_extremo_norte', 960, 100) });
  out.push({ label: '06_extremo_sur', path: await snap('06_extremo_sur', 960, 1000) });
  out.push({ label: '07_cuadrante_NW', path: await snap('07_cuadrante_NW', 400, 250) });
  out.push({ label: '08_cuadrante_NE', path: await snap('08_cuadrante_NE', 1500, 250) });
  out.push({ label: '09_cuadrante_SW', path: await snap('09_cuadrante_SW', 400, 850) });
  out.push({ label: '10_cuadrante_SE', path: await snap('10_cuadrante_SE', 1500, 850) });

  writeFileSync('screenshots/c4_manifest.json', JSON.stringify(out, null, 2));
  console.log('SCREENSHOTS:');
  console.log(JSON.stringify(out, null, 2));

  await browser.close();
}

main().catch((e) => {
  console.error('SCREENSHOT CAPTURE FAILED:', e);
  process.exit(1);
});

