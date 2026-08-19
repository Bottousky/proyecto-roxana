import { chromium } from 'playwright';
async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto('http://localhost:5173/jugar/?from=portal&room=plaza', { waitUntil: 'load' });
  await page.waitForFunction(() => { const s = (window).__game?.scene?.getScene('explore'); return s && s.activeRoom && s.activeRoom.id === 'plaza'; }, { timeout: 25000 });
  for (let i = 0; i < 8; i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(100); }
  await page.waitForTimeout(300);
  await page.evaluate(() => { const w = window; if (w.__roxana) w.__roxana.state.flags.ohmAwake = true; });

  const read = () => page.evaluate(() => {
    const s = (window).__game?.scene?.getScene('explore');
    const cam = s?.cameras?.main;
    return {
      ar: s?.activeRoom ? { id: s.activeRoom.id, w: s.activeRoom.width, h: s.activeRoom.height, pl: { x: +s.activeRoom.playerLocal.x.toFixed(0), y: +s.activeRoom.playerLocal.y.toFixed(0) } } : null,
      cam: cam?._bounds ? { x: cam._bounds.x, y: cam._bounds.y, w: cam._bounds.w, h: cam._bounds.h } : null,
    };
  });
  async function teleportAndWait(x, y) {
    await page.evaluate(([tx, ty]) => { const s = (window).__game.scene.getScene('explore'); s.doorCooldown = 0; s.player.setPosition(tx, ty); s.cameras.main.centerOn(tx, ty); }, [x, y]);
    await page.waitForTimeout(1500);
  }

  const boot = await read();
  console.log('[boot] activeRoom:', JSON.stringify(boot.ar));

  // Plaza→Taller
  await teleportAndWait(1880, 540);
  let r = await read();
  console.log('[R4 plaza→taller] activeRoom:', JSON.stringify(r.ar), '=>', r.ar.id === 'taller' ? 'PASS' : 'FAIL');
  console.log('[R4] playerLocal == entry grafo (480,410)?', r.ar.pl.x === 480 && r.ar.pl.y === 410 ? 'PASS' : 'FAIL ' + JSON.stringify(r.ar.pl));
  console.log('[R4] camera taller (960x540) local?', r.cam && r.cam.w === 960 && r.cam.h === 540 ? 'PASS' : 'FAIL ' + JSON.stringify(r.cam));

  // Taller→Plaza
  await teleportAndWait(480, 480);
  r = await read();
  console.log('[R4 taller→plaza] activeRoom:', JSON.stringify(r.ar), '=>', r.ar.id === 'plaza' ? 'PASS' : 'FAIL');
  console.log('[R4] playerLocal == plaza entry taller (1820,540)?', r.ar.pl.x === 1820 && r.ar.pl.y === 540 ? 'PASS' : 'FAIL ' + JSON.stringify(r.ar.pl));
  console.log('[R4] plaza 1920x1080 tras volver?', r.ar.w === 1920 && r.ar.h === 1080 ? 'PASS' : 'FAIL');

  // Exit bloqueado: plaza→puerta (locked, frenoDone false)
  await teleportAndWait(960, 40);
  r = await read();
  console.log('[R4 locked puerta] sigue plaza (no transiciona)?', r.ar.id === 'plaza' ? 'PASS' : 'FAIL');

  console.log('[errors]', errors.length ? errors.join('\n  ') : 'ninguno');
  await browser.close();
}
main().catch((e) => { console.error('RUN_ERROR', e); process.exit(1); });
