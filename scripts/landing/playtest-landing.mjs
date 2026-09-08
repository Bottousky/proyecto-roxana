import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.LANDING_URL || 'http://127.0.0.1:5186';
const out = 'output/playwright';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const errors = [];
const active = [];
const check = (name, details = {}) => {
  results.push({ name, ...details });
  console.log(`PASS ${name}`);
};
async function setup(options = {}) {
  const context = await browser.newContext(options);
  active.push(context);
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  return { context, page };
}
async function ready(page, suffix = '/') {
  await page.goto(`${base}${suffix}`);
  await page.waitForFunction(
    () => document.documentElement.dataset.scene === 'ready',
    null,
    { timeout: 45000 },
  );
}
async function sceneSettled(page) {
  await page.waitForTimeout(850); // authored 760ms camera transition, not network polling
}
try {
  const { page } = await setup({ viewport: { width: 1440, height: 1000 } });
  await ready(page);
  await page.screenshot({ path: `${out}/desktop.png` });
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(
    await page.locator('#school3d-panel').evaluate((el) => el.inert),
    true,
  );
  assert.equal(
    await page.locator('#school3d-room-list').evaluate((el) => el.inert),
    true,
  );
  check('Desktop scene loaded, hidden controls inert');

  await page
    .getByRole('button', { name: 'Explorar el Instituto', exact: true })
    .click();
  await page.locator('#school3d-panel.is-open').waitFor();
  assert.match(await page.locator('#school3d-title').innerText(), /Hall/);
  await sceneSettled(page);
  await page.screenshot({ path: `${out}/hall.png` });
  await page.locator('#school3d-panel-close').click();
  await page.locator('#school3d-panel.is-open').waitFor({ state: 'hidden' });
  assert.equal(
    await page.locator('#school3d-panel').evaluate((el) => el.inert),
    true,
  );
  check('Explore, select Hall, return to overview');

  const ids = [
    'programacion',
    'audiovisual',
    'electronica',
    'matematica',
    'biblioteca',
    'hall',
    'logros',
    'fisica',
    'direccion',
    'visitantes',
    'preceptoria',
  ];
  for (const id of ids) {
    await page.locator('#school3d-rooms-toggle').click();
    await page.locator(`#school3d-room-list [data-room="${id}"]`).click();
    await page.locator('#school3d-panel.is-open').waitFor();
    assert.equal(
      await page.locator('#school-experience').getAttribute('data-room'),
      id,
    );
    const href = await page.locator('#school3d-action').getAttribute('href');
    assert(href && href !== '#', `${id} has a meaningful destination`);
    if (href.startsWith('#'))
      assert.equal(await page.locator(href).count(), 1, `${id} target exists`);
    await page.locator('#school3d-panel-close').click();
  }
  check('All 11 rooms selectable, destinations present');

  await page.locator('#school3d-canvas').focus();
  await page.keyboard.press('ArrowRight');
  await page.locator('#school3d-panel.is-open').waitFor();
  assert.equal(
    await page.locator('#school-experience').getAttribute('data-room'),
    'programacion',
  );
  await page.keyboard.press('Escape');
  assert.equal(
    await page
      .locator('#school3d-canvas')
      .evaluate((el) => document.activeElement === el),
    true,
  );
  await page.locator('#school3d-rooms-toggle').click();
  await page.keyboard.press('Escape');
  assert.equal(
    await page.locator('#school3d-rooms-toggle').getAttribute('aria-expanded'),
    'false',
  );
  check('Keyboard room navigation, Escape and focus restoration');

  await page.goto(`${base}/#sala/electronica`);
  await page.locator('#school3d-panel.is-open').waitFor();
  assert.equal(
    await page.locator('#school-experience').getAttribute('data-room'),
    'electronica',
  );
  await sceneSettled(page);
  await page.screenshot({ path: `${out}/electronics.png` });
  await page.locator('#school3d-panel-close').click();
  await page.goBack();
  await page.locator('#school3d-panel.is-open').waitFor();
  assert.equal(
    await page.locator('#school-experience').getAttribute('data-room'),
    'electronica',
  );
  check('Room deep link and browser history');

  await page.locator('[data-open-dialog="settings-dialog"]').first().click();
  await page.locator('#setting-quality').selectOption('low');
  await page.locator('#setting-motion').check();
  await page.locator('#setting-labels').uncheck();
  await page.keyboard.press('Escape');
  await page.reload();
  await page.waitForFunction(
    () => document.documentElement.dataset.scene === 'ready',
  );
  const preferences = await page.evaluate(() => ({
    ...document.documentElement.dataset,
  }));
  assert.equal(preferences.quality, 'low');
  assert.equal(preferences.motion, 'reduced');
  assert.equal(preferences.labels, 'false');
  check('Quality, reduced motion and labels persist on reload');

  for (const id of [
    'settings-dialog',
    'progress-dialog',
    'guide-dialog',
    'privacy-dialog',
    'credits-dialog',
  ]) {
    await page.locator(`[data-open-dialog="${id}"]`).first().click();
    await page.locator(`#${id}[open]`).waitFor();
    await page.keyboard.press('Tab');
    assert(
      await page
        .locator(`#${id}`)
        .evaluate((el) => el.contains(document.activeElement)),
      `${id} contains focus`,
    );
    await page.keyboard.press('Escape');
    assert.equal(await page.locator(`#${id}`).evaluate((el) => el.open), false);
  }
  await page.locator('[data-world="bitland"]').click();
  assert.equal(await page.locator('#world-title').innerText(), 'Bitland');
  await page.keyboard.press('Escape');
  const summary = page.locator('#preguntas summary').first();
  await summary.click();
  assert(
    (await page.locator('#preguntas details').first().getAttribute('open')) !==
      null,
  );
  check('Dialogs, focus containment, world information and FAQ');

  // Fixture is a read-only compatibility check; this does not unlock gameplay.
  await page.evaluate(() =>
    localStorage.setItem(
      'roxana-slice-v1',
      JSON.stringify({ flags: { finished: true, playedUnit2Intro: true } }),
    ),
  );
  await page.locator('[data-open-dialog="progress-dialog"]').click();
  assert.match(await page.locator('#progress-content').innerText(), /1 \/ 5/);
  assert.equal(
    await page.locator('#progress-play').getAttribute('href'),
    '/jugar',
  );
  await page.keyboard.press('Escape');
  await page.evaluate(() => localStorage.removeItem('roxana-slice-v1'));
  check('Bitácora displays the actual portal save');

  await page.goto(base);
  await page.waitForFunction(
    () => document.documentElement.dataset.scene === 'ready',
  );
  await page.locator('#sound-toggle').click();
  assert.equal(
    await page.locator('#sound-toggle').getAttribute('aria-pressed'),
    'true',
  );
  await page.locator('#sound-toggle').click();
  assert.equal(
    await page.locator('#sound-toggle').getAttribute('aria-pressed'),
    'false',
  );
  check('Opt-in audio can be enabled and muted');

  // Real primary CTA, preserving the portal arrival query through routing.
  await page.locator('[data-play]').first().click();
  await page.waitForURL(/\/src\/jugar\//);
  assert.equal(new URL(page.url()).searchParams.get('room'), 'plaza');
  await page.locator('#game canvas').waitFor({ timeout: 45000 });
  await page
    .locator('#boot-curtain')
    .waitFor({ state: 'detached', timeout: 45000 });
  await page.waitForTimeout(700);
  // Advance the first conversation through the same key used by a player.
  const before = await page.locator('#dialog-text').innerText();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(350);
  const after = await page.locator('#dialog-text').innerText();
  assert(
    before.length > 0 || after.length > 0,
    'A real arrival dialogue is present',
  );
  await page.screenshot({ path: `${out}/portal-game.png` });
  check('Primary CTA reaches the playable Ohmdal canvas');
  await page.keyboard.press('e', { delay: 180 });
  await page.locator('#confirm-exit-ohmdal').waitFor();
  // The existing desktop game uses keyboard controls for this confirmation.
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/#sala\/electronica/);
  await page.locator('#school3d-panel.is-open').waitFor();
  check('The in-world return portal reopens the Institute classroom');

  const { page: mobile } = await setup({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  await ready(mobile);
  assert.equal(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await mobile.screenshot({ path: `${out}/mobile.png` });
  await mobile.locator('.menu-toggle').tap();
  await mobile.locator('#site-nav a[href="#mundos"]').tap();
  assert.equal(
    await mobile.locator('.menu-toggle').getAttribute('aria-expanded'),
    'false',
  );
  assert.equal(
    await mobile.locator('#site-nav').evaluate((el) => el.inert),
    true,
  );
  await mobile.locator('#school3d-rooms-toggle').tap();
  await mobile.locator('#school3d-room-list [data-room="electronica"]').tap();
  await mobile.locator('#school3d-panel.is-open').waitFor();
  await mobile.locator('#school3d-action').scrollIntoViewIfNeeded();
  const visible = await mobile.locator('#school3d-action').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= innerHeight;
  });
  assert(visible, 'Mobile selected-room CTA is reachable');
  await mobile.screenshot({ path: `${out}/mobile-electronics.png` });
  await mobile.locator('#school3d-panel-close').tap();
  await mobile.locator('[data-open-dialog="settings-dialog"]').first().tap();
  await mobile.locator('#setting-motion').check();
  await mobile.locator('#settings-dialog [data-close-dialog]').tap();
  check(
    '390px touch: navigation, room selection, accessible panel and settings',
  );

  const { context: blockedContext, page: blocked } = await setup({
    viewport: { width: 1280, height: 900 },
  });
  await blockedContext.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    }),
  );
  await ready(blocked);
  await blocked.locator('[data-open-dialog="settings-dialog"]').first().click();
  await blocked.locator('#setting-motion').check();
  assert.match(
    await blocked.locator('#settings-status').innerText(),
    /no permite guardarlos/,
  );
  await blocked.keyboard.press('Escape');
  await blocked.locator('#school3d-rooms-toggle').click();
  await blocked
    .locator('#school3d-room-list [data-room="electronica"]')
    .click();
  await blocked.locator('#school3d-panel.is-open').waitFor();
  check('Blocked storage does not prevent visiting or changing settings');

  const { context: failedContext, page: failed } = await setup({
    viewport: { width: 1280, height: 900 },
  });
  await failedContext.route('**/*.glb*', (route) => route.abort());
  await failed.goto(base);
  await failed.locator('#school3d-fallback').waitFor();
  await failed.locator('#school3d-fallback a').click();
  assert.equal(new URL(failed.url()).hash, '#mundos');
  check('Failed 3D download retains a useful fallback and world navigation');

  const { page: nojs } = await setup({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await nojs.goto(base);
  assert.match(await nojs.locator('h1').innerText(), /conocimiento/);
  assert.equal(await nojs.locator('#preguntas details').count(), 6);
  check('Content, links and native FAQ survive without JavaScript');

  assert.deepEqual(errors, [], 'No uncaught JavaScript exceptions');
  await writeFile(
    `${out}/landing-results.json`,
    JSON.stringify({ base, results, errors }, null, 2),
  );
  console.log(`Completed ${results.length} checks.`);
} catch (error) {
  console.error(error);
  await writeFile(
    `${out}/landing-results.json`,
    JSON.stringify({ base, results, errors, failure: String(error) }, null, 2),
  );
  process.exitCode = 1;
} finally {
  await Promise.all(active.map((context) => context.close()));
  await browser.close();
}
