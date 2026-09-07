import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const baseUrl = (process.env.OHMDAL_QA_URL ?? 'http://127.0.0.1:54321').replace(/\/$/, '');
const outputPath = resolve('output/playwright/ohmdal-quality-c1-c4/world-ambience-offline.json');
const modulePath = '/src/experiences/ohmdal-playcanvas/systems/audio/arc1WorldAmbience.ts';

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-gpu'],
});

try {
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  const report = await page.evaluate(async (moduleUrl) => {
    const module = await import(moduleUrl);
    if (typeof OfflineAudioContext === 'undefined') {
      throw new Error('OfflineAudioContext no está disponible en este navegador');
    }

    const renderFrame = async (frame) => {
      const sampleRate = 48_000;
      const context = new OfflineAudioContext(2, sampleRate, sampleRate);
      const ambience = new module.Arc1WorldAmbience();
      if (!ambience.attachContext(context)) throw new Error('no se pudo adjuntar OfflineAudioContext');
      ambience.update(frame);
      if (!ambience.unlockFromGesture()) throw new Error('no se pudo iniciar ambiente offline');
      const rendered = await context.startRendering();
      let sumSquares = 0;
      let peak = 0;
      let finite = true;
      for (let channel = 0; channel < rendered.numberOfChannels; channel += 1) {
        const samples = rendered.getChannelData(channel);
        for (const sample of samples) {
          finite &&= Number.isFinite(sample);
          sumSquares += sample * sample;
          peak = Math.max(peak, Math.abs(sample));
        }
      }
      const sampleCount = rendered.length * rendered.numberOfChannels;
      ambience.dispose();
      return {
        rms: Math.sqrt(sumSquares / sampleCount),
        peak,
        finite,
      };
    };

    const active = await renderFrame({
      position: [-4.2, 1.8, 20.5],
      region: 'manantial',
      electrical: { manantialWaterFlow: 1, manantialMachinePower: 1 },
    });
    const hidden = await renderFrame({
      position: [-4.2, 1.8, 20.5],
      region: 'manantial',
      hidden: true,
      electrical: { manantialWaterFlow: 1, manantialMachinePower: 1 },
    });
    const transitionActive = module.planArc1WorldAmbience({
      position: [0, 1, 0],
      region: 'plaza',
      electrical: { fountainPowered: true },
    });
    const transitionQuiet = module.planArc1WorldAmbience({
      position: [0, 1, 0],
      region: 'plaza',
      hidden: true,
      electrical: { fountainPowered: true },
    });
    return {
      browser: navigator.userAgent,
      active,
      hidden,
      transition: {
        activeFountain: transitionActive.levels['plaza-fountain'],
        hiddenFountain: transitionQuiet.levels['plaza-fountain'],
      },
    };
  }, new URL(modulePath, `${baseUrl}/`).href);

  assert.equal(report.active.finite, true, 'el render activo no contiene NaN/Infinity');
  assert.ok(report.active.rms > 0.000001, `el render activo quedó inaudible: RMS ${report.active.rms}`);
  assert.ok(report.active.peak <= 1, `el pico excede la salida normalizada: ${report.active.peak}`);
  assert.equal(report.hidden.finite, true, 'el render oculto no contiene NaN/Infinity');
  assert.ok(report.hidden.rms < 0.000001, `hidden debe silenciar el ambiente: RMS ${report.hidden.rms}`);
  assert.equal(report.transition.hiddenFountain, 0, 'la transición a hidden apaga la capa de fuente');
  assert.ok(report.transition.activeFountain > 0, 'la transición activa conserva la capa de fuente');

  await mkdir(resolve('output/playwright/ohmdal-quality-c1-c4'), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify({ ...report, result: 'PASS' }, null, 2)}\n`, 'utf8');
  console.log(`Arc 1 world ambience OfflineAudioContext: PASS (${outputPath})`);
} finally {
  await browser.close();
}
