/* Inspect sprites in a world region. */
import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
  const page = await context.newPage();

  page.on('pageerror', (err) => console.log('  [pageerror]', err.message));

  await page.goto('http://localhost:4173/jugar/?from=portal&room=plaza', { waitUntil: 'load' });

  await page.waitForFunction(() => {
    const game = (window).__game;
    const scene = game?.scene?.getScene('explore');
    return scene && scene.activeAreaId === 'plaza';
  }, { timeout: 15000 });

  // Listar sprites que cubran world (100, 1059) (zona de franja sin decor).
  const info = await page.evaluate(() => {
    const game = (window).__game;
    const scene = game?.scene?.getScene('explore');
    const probeX = 100;
    const probeY = 1059;
    const candidates = (scene.children?.list ?? []).filter((o) => {
      const w = o.displayWidth ?? o.width ?? 0;
      const h = o.displayHeight ?? o.height ?? 0;
      if (w === 0 || h === 0) return false;
      const left = o.x - w / 2;
      const right = o.x + w / 2;
      const top = o.y - h / 2;
      const bottom = o.y + h / 2;
      return probeX >= left && probeX <= right && probeY >= top && probeY <= bottom;
    }).map((o) => ({
      type: o.type,
      x: o.x,
      y: o.y,
      depth: o.depth,
      visible: o.visible,
      alpha: o.alpha,
      texture: o.texture?.key,
      frame: o.frame?.name,
      tint: o.tint,
      displayWidth: o.displayWidth,
      displayHeight: o.displayHeight,
    }));
    return candidates;
  });
  console.log('  [sprites in 100,1059]', JSON.stringify(info, null, 2));

  await browser.close();
}

main().catch((e) => {
  console.error('SPRITE INSPECT FAILED:', e);
  process.exit(1);
});
