import { chromium } from 'playwright';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';

const out = 'output/playwright';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(process.env.LANDING_URL || 'http://127.0.0.1:5186');
  await page.waitForFunction(
    () => document.documentElement.dataset.scene === 'ready',
  );
  await page.waitForTimeout(3500);
  const metrics = await page.evaluate(() => window.__roxanaSchool3D);
  await page.screenshot({ path: `${out}/desktop-final.png` });
  await page.screenshot({ path: `${out}/full-page.png`, fullPage: true });
  await writeFile(
    `${out}/scene-metrics.json`,
    JSON.stringify(metrics, null, 2),
  );

  // Art exports from the real renderer, distinct from the unmodified QA captures above.
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.addStyleTag({
    content: `
    .site-header{height:82px;padding:0 50px}.site-nav{display:none}
    #school-experience.hero{height:548px;min-height:548px}
    .hero-copy{left:50px;top:50%;width:43%;transform:translateY(-50%)}
    .hero-copy h1{font-size:64px}.hero-copy .eyebrow{font-size:8px}
    .hero-lead{font-size:14px;margin:22px 0}.hero-note{font-size:10px}
    .school-stage{top:0;bottom:0;right:0;width:59%}
    .scene-toolbar,.scene-coordinate,#school3d-labels{visibility:hidden}
  `,
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/instituto-social.png` });

  await page.setViewportSize({ width: 1200, height: 900 });
  await page.addStyleTag({
    content: `
    .site-header,.hero-copy{display:none}
    #school-experience.hero{height:900px;min-height:900px}
    .school-stage{inset:0!important;width:1200px!important;height:900px!important}
  `,
  });
  await page.waitForTimeout(700);
  await page
    .locator('.school-stage')
    .screenshot({ path: `${out}/instituto-poster.png` });

  if (process.argv.includes('--promote')) {
    await copyFile(
      `${out}/instituto-social.png`,
      'public/instituto-social.png',
    );
    await copyFile(
      `${out}/instituto-poster.png`,
      'public/instituto-poster.png',
    );
  }
  console.log(
    JSON.stringify(
      {
        metrics,
        exported: [
          'desktop-final.png',
          'full-page.png',
          'instituto-social.png',
          'instituto-poster.png',
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
