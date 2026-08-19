/* Debug screenshot: ver el render limpio de la Plaza en el centro. */
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

  // Contar cuántos sprites hay en el scene para detectar leaks.
  const info = await page.evaluate(() => {
    const game = (window).__game;
    const scene = game?.scene?.getScene('explore');
    return {
      activeAreaId: scene?.activeAreaId,
      chunks: Object.keys(scene?.chunks ?? {}),
      worldMinY: scene?.worldMinY,
      cameraScroll: { x: scene?.cameras?.main?.scrollX, y: scene?.cameras?.main?.scrollY },
      cameraBounds: { x: scene?.cameras?.main?._bounds?.x, y: scene?.cameras?.main?._bounds?.y, w: scene?.cameras?.main?._bounds?.width, h: scene?.cameras?.main?._bounds?.height },
    };
  });
  console.log('  [info]', JSON.stringify(info, null, 2));

  await browser.close();
}

main().catch((e) => {
  console.error('DEBUG CAPTURE FAILED:', e);
  process.exit(1);
});
