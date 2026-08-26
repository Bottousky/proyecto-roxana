import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES,
  OHMDAL_VISUAL_CAMERA_PRESETS,
  isSoftwareRenderer,
  percentile,
} from '../src/experiences/ohmdal-playcanvas/visualHarness.ts';
import { OHM_HERO_TUNING } from '../src/experiences/ohmdal-playcanvas/ohmHeroTuning.ts';
import {
  FAST_CAPTURE_CONTRACT,
  FAST_STAGE_SHOTS,
  FULL_CAPTURE_CONTRACT,
  OHMDAL_AUTHORED_CAPTURE_SHOTS,
  assertRendererDiagnostics,
  fastLaunchOptions,
  getCaptureShotSpec,
  resolveCaptureViews,
} from '../scripts/visual/ohmdal-capture-contract.mjs';

describe('Ohmdal PlayCanvas · Visual Harness contract', () => {
  it('expone las ocho cámaras canónicas de la Plaza', () => {
    assert.deepEqual(Object.keys(OHMDAL_VISUAL_CAMERA_PRESETS), [
      'portal-arrival',
      'workshop-approach',
      'ohm-landmark',
      'omega-gate',
      'plaza-wide',
      'active-play-desktop',
      'active-play-mobile',
      'no-post',
    ]);
  });

  it('mantiene portal, Ohm, Taller y Puerta sobre presets métricos explícitos', () => {
    assert.deepEqual(OHMDAL_VISUAL_CAMERA_PRESETS['portal-arrival'].position, [0, 1.68, -9.4]);
    assert.equal(OHMDAL_VISUAL_CAMERA_PRESETS['workshop-approach'].yaw, 90);
    assert.equal(OHMDAL_VISUAL_CAMERA_PRESETS['omega-gate'].yaw, 180);
    assert.ok(OHMDAL_VISUAL_CAMERA_PRESETS['plaza-wide'].position[1] > 10);
  });

  it('calibra Ohm + pedestal una sola vez desde bounds exactos', () => {
    assert.equal(OHM_HERO_TUNING.boundsSource, 'vertices');
    assert.deepEqual(OHM_HERO_TUNING.dims, [1.16, 1.47, 1.16]);
    assert.equal(OHM_HERO_TUNING.groundOffset, 0);
    assert.equal(OHM_HERO_TUNING.scale, 1);
    assert.equal(OHM_HERO_TUNING.yaw, 180);
  });

  it('calcula percentiles deterministas y detecta renderers de software', () => {
    assert.equal(percentile([4, 1, 3, 2], 0.5), 2);
    assert.equal(percentile([], 0.95), null);
    assert.equal(isSoftwareRenderer('ANGLE (Google, Vulkan 1.3 SwiftShader Device)'), true);
    assert.equal(isSoftwareRenderer('NVIDIA GeForce RTX 4070'), false);
    assert.equal(isSoftwareRenderer(null), null);
  });

  it('mantiene FULL completo y separa FAST como subconjunto de etapa', () => {
    const full = resolveCaptureViews({ mode: 'full' });
    const fast = resolveCaptureViews({ mode: 'fast', stage: 'a0-baseline-capture-readiness' });
    assert.equal(FULL_CAPTURE_CONTRACT.includesMobile, true);
    assert.equal(FULL_CAPTURE_CONTRACT.includesNoPost, true);
    assert.equal(FULL_CAPTURE_CONTRACT.includesTouchSmoke, true);
    assert.equal(full.length, 8);
    assert.ok(full.some((view) => view.id === 'active-play-mobile'));
    assert.ok(full.some((view) => view.id === 'no-post'));
    assert.deepEqual(fast.map((view) => view.id), FAST_STAGE_SHOTS['a0-baseline-capture-readiness']);
    assert.equal(FAST_CAPTURE_CONTRACT.currentStageOnly, true);
    assert.equal(FAST_CAPTURE_CONTRACT.includesMobile, false);
    assert.equal(FAST_CAPTURE_CONTRACT.includesNoPost, false);
    assert.ok(fast.length < full.length);
  });

  it('define el FAST A2 del Taller con IDs canónicos y metadata determinista', () => {
    const fast = resolveCaptureViews({ mode: 'fast', stage: 'a2-plaza-workshop-authored' });
    assert.deepEqual(fast.map((view) => view.id), [...OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES]);
    assert.deepEqual(Object.keys(OHMDAL_AUTHORED_CAPTURE_SHOTS), [...OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES]);

    const exterior = getCaptureShotSpec('workshop-exterior');
    assert.equal(exterior.runtimeHook, 'setCaptureShot');
    assert.equal(exterior.state, 'workshop-exterior');
    assert.equal(exterior.camera, 'workshop-exterior');
    assert.deepEqual(exterior.anchor.position, [-2.8, 1.8, -4.15]);
    assert.equal(exterior.world.zone, 'plaza');
    assert.equal(exterior.deterministic.seed, 1701);

    const interior = getCaptureShotSpec('workshop-interior-tools');
    assert.equal(interior.world.zone, 'workshop');
    assert.equal(interior.world.storyStep, 'inside_workshop');
    assert.deepEqual(interior.anchor.position, [-60, 1.9, -2.45]);

    const galvanoscope = getCaptureShotSpec('galvanoscope-first-person');
    assert.equal(galvanoscope.world.tool, 'galvanoscope');
    assert.equal(galvanoscope.world.probeTarget, 'lumen_taller_banco');
    assert.equal(galvanoscope.anchor.yaw, 270);

    // A0 aliases remain on the existing hook pair and never require A2 wiring.
    const alias = getCaptureShotSpec('workshop-approach');
    assert.equal(alias.runtimeHook, 'setStateAndCamera');
    assert.equal(alias.state, 'portal-arrival');
    assert.equal(alias.camera, 'workshop-approach');
  });

  it('FAST solicita aceleración GPU sin forzar SwiftShader y exige diagnostics', () => {
    const launch = fastLaunchOptions({ headless: true, platform: 'win32' });
    assert.equal(launch.headless, true);
    assert.ok(launch.args.includes('--enable-gpu'));
    assert.ok(launch.args.includes('--ignore-gpu-blocklist'));
    assert.ok(launch.args.includes('--use-angle=d3d11'));
    assert.equal(launch.args.some((arg) => /swiftshader|disable-gpu/i.test(arg)), false);
    const diagnostics = assertRendererDiagnostics({
      browser: { renderer: 'NVIDIA GeForce RTX 4070', softwareRendered: false },
    }, 'test');
    assert.equal(diagnostics.browser.softwareRendered, false);
  });
});
