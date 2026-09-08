// Playwright CLI expression: a paced 30-second recording of actual UI actions.
async (page) => {
  const context = await page.context().browser().newContext({
    viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1,
    recordVideo: { dir: 'output/playwright/bitland/video', size: { width: 1440, height: 960 } },
  });
  const began = Date.now();
  const clip = await context.newPage();
  await clip.goto('http://127.0.0.1:4313/');
  await clip.waitForFunction(() => Boolean(window.bitlandEvidence));
  // These holds are intentional staging for a review clip, not test synchronization.
  await clip.locator('#overview').click();
  await clip.waitForTimeout(2000);
  await clip.locator('#overview').click();
  await clip.waitForTimeout(1500);
  await clip.getByRole('button', { name: 'Paso corto: abierto', exact: true }).click();
  await clip.getByRole('button', { name: '◎ Abrir courier' }).click();
  for (let i = 0; i < 3; i++) {
    await clip.getByRole('button', { name: 'Un paso →' }).click();
    await clip.waitForTimeout(650);
  }
  await clip.getByText('Ver qué ejecutó', { exact: true }).click();
  await clip.waitForTimeout(1800);
  await clip.getByRole('combobox', { name: 'Instrucción 3', exact: true }).selectOption('sense');
  await clip.waitForTimeout(1200);
  await clip.getByRole('button', { name: '↺ Probar desde el muelle' }).click();
  await clip.getByRole('button', { name: 'Cerrar programa' }).click();
  await clip.getByRole('button', { name: '▶ Ejecutar', exact: true }).click();
  await clip.waitForFunction(() => window.bitlandEvidence.snapshot().led);
  await clip.getByRole('button', { name: 'Ⅱ Pausar', exact: true }).click();
  await clip.waitForTimeout(2200);
  await clip.locator('#overview').click();
  const elapsed = Date.now() - began;
  if (elapsed < 30000) await clip.waitForTimeout(30000 - elapsed);
  const state = await clip.evaluate(() => window.bitlandEvidence.snapshot());
  const video = clip.video();
  await context.close();
  const elapsedMs = Date.now() - began;
  return { path: await video.path(), elapsedMs, delivered: state.delivered, led: state.led,
    passed: elapsedMs <= 33000 && state.delivered.length === 1 && state.led,
    criterion: 'Uncut recording <=33 seconds, one delivery, final actuator lit. Human comprehension is a separate gate.' };
}
