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
    assert.deepEqual(fast.map((view) => view.id), [...OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES].slice(0, 3));
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

  it('define el FAST A3 de Manantial con anchors métricos y estado eléctrico explícito', () => {
    const authoredNames = [...OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES];
    const fast = resolveCaptureViews({ mode: 'fast', stage: 'a3-manantial-central-authored' });
    assert.deepEqual(fast.map((view) => view.id), authoredNames.slice(3, 8));

    const approach = getCaptureShotSpec('manantial-approach');
    assert.equal(approach.runtimeHook, 'setCaptureShot');
    assert.deepEqual(approach.anchor.position, [9, 3.4, 13.5]);
    assert.equal(approach.world.zone, 'manantial');
    assert.equal(approach.world.storyStep, 'inside_manantial');
    assert.equal(approach.world.manantial.gateOpen, false);
    assert.equal(approach.world.manantial.restored, false);

    const wide = getCaptureShotSpec('hydro-central-wide');
    assert.deepEqual(wide.anchor.position, [-11, 8.5, 13]);
    assert.equal(wide.anchor.pitch, -18);
    assert.equal(wide.world.manantial.excitationEnabled, false);

    const sluice = getCaptureShotSpec('sluice-gate-interaction');
    assert.deepEqual(sluice.anchor.position, [-8, 3.2, 15]);
    assert.equal(sluice.world.interaction, 'intake-gate');
    assert.equal(sluice.world.comparison, 'before-after');

    const generator = getCaptureShotSpec('generator-platform');
    assert.deepEqual(generator.anchor.position, [8.5, 4.2, 15.5]);
    assert.equal(generator.world.measurementPoint, 'generator');
    assert.equal(generator.world.manantial.gateOpen, true);
    assert.equal(generator.world.manantial.restored, false);

    const restored = getCaptureShotSpec('restored-manantial');
    assert.deepEqual(restored.anchor.position, [-11, 8.5, 13]);
    assert.equal(restored.world.storyStep, 'manantial_restored');
    assert.equal(restored.world.manantial.restored, true);
    assert.equal(restored.world.manantial.protectiveTrip, false);
    for (const shot of fast) assert.equal(getCaptureShotSpec(shot.id).runtimeHook, 'setCaptureShot');
  });

  it('define el FAST A4 de Castillo con seam de Plaza y metadata de red determinista', () => {
    const authoredNames = [...OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES];
    const fast = resolveCaptureViews({ mode: 'fast', stage: 'a4-castle-authored' });
    assert.deepEqual(fast.map((view) => view.id), authoredNames.slice(8, 12));
    assert.equal(fast.length, 4);

    const restoredPlaza = getCaptureShotSpec('restored-plaza-wide');
    assert.equal(restoredPlaza.runtimeHook, 'setCaptureShot');
    assert.deepEqual(restoredPlaza.anchor.position, [0, 11.5, -13.2]);
    assert.equal(restoredPlaza.world.zone, 'plaza');
    assert.equal(restoredPlaza.world.storyStep, 'restored_plaza');
    assert.equal(restoredPlaza.world.plaza.bellPulls, 0);
    assert.equal(restoredPlaza.world.plaza.castleGateOpened, false);
    assert.equal(restoredPlaza.world.manantial.restored, true);

    const bell = getCaptureShotSpec('bell-activation');
    assert.deepEqual(bell.anchor.position, [-9, 2.6, 0]);
    assert.equal(bell.anchor.yaw, 238);
    assert.equal(bell.world.interaction, 'bell');
    assert.equal(bell.world.plaza.bellPulls, 1);
    assert.equal(bell.world.plaza.castleGateOpened, true);

    const gate = getCaptureShotSpec('castle-gate-open');
    assert.deepEqual(gate.anchor.position, [55, 4, -17]);
    assert.equal(gate.world.zone, 'castle');
    assert.equal(gate.world.storyStep, 'inside_castle');
    assert.equal(gate.anchor.yaw, 222);
    assert.equal(gate.world.plaza.castleGateOpened, true);
    assert.equal(gate.world.manantial.restored, true);
    assert.equal(gate.world.castle.topology, 'unwired');

    const hall = getCaptureShotSpec('castle-distribution-hall');
    assert.deepEqual(hall.anchor.position, [51.5, 6, -10]);
    assert.equal(hall.world.zone, 'castle');
    assert.equal(hall.world.probeTarget, 'castle_bus_in');
    assert.equal(hall.world.plaza.castleGateOpened, true);
    assert.equal(hall.world.manantial.restored, true);
    assert.equal(hall.world.castle.returnContinuity, false);
    assert.equal(hall.world.castle.protectiveTrip, false);
    for (const shot of fast) assert.equal(getCaptureShotSpec(shot.id).runtimeHook, 'setCaptureShot');
  });

  it('define el FAST A5 de Forja/Terrazas con trade-off térmico/riego y metadata determinista', () => {
    const authoredNames = [...OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES];
    const fast = resolveCaptureViews({ mode: 'fast', stage: 'a5-forge-terraces-authored' });
    assert.deepEqual(fast.map((view) => view.id), authoredNames.slice(12, 15));
    assert.equal(fast.length, 3);

    const core = getCaptureShotSpec('forge-core');
    assert.equal(core.runtimeHook, 'setCaptureShot');
    assert.deepEqual(core.anchor.position, [121.5, 2.8, -4.5]);
    assert.equal(core.world.zone, 'forge-terraces');
    assert.equal(core.world.storyStep, 'inside_forge_terraces');
    assert.equal(core.world.probeTarget, 'forge_heater');
    assert.deepEqual(core.world.forgeTerraces.allocation, { forge: 5, terraces: 3 });
    assert.equal(core.world.forgeTerraces.conductor, 'medium');
    assert.equal(core.world.forgeTerraces.energized, true);
    assert.equal(core.world.forgeTerraces.protectiveTrip, false);

    const irrigation = getCaptureShotSpec('terraces-irrigation');
    assert.deepEqual(irrigation.anchor.position, [114.0, 4.5, 10.0]);
    assert.equal(irrigation.world.zone, 'forge-terraces');
    assert.equal(irrigation.world.storyStep, 'forge_terraces_restored');
    assert.equal(irrigation.world.probeTarget, 'terraces_pump');
    assert.equal(irrigation.world.forgeTerraces.restored, true);

    const overview = getCaptureShotSpec('forge-terraces-overview');
    assert.deepEqual(overview.anchor.position, [120.0, 9.5, -13.5]);
    assert.equal(overview.world.zone, 'forge-terraces');
    assert.equal(overview.world.comparison, 'before-after');
    assert.equal(overview.world.probeTarget, 'forge_bus');
    for (const shot of fast) assert.equal(getCaptureShotSpec(shot.id).runtimeHook, 'setCaptureShot');
  });

  it('define el FAST A6 de Faro/Lago/Retorno con culminación DC, backtracking a Plaza y cierre de pedestal', () => {
    const authoredNames = [...OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES];
    const fast = resolveCaptureViews({ mode: 'fast', stage: 'a6-lighthouse-lake-return-authored' });
    assert.deepEqual(fast.map((view) => view.id), authoredNames.slice(15));
    assert.equal(fast.length, 4);

    const approach = getCaptureShotSpec('lighthouse-approach');
    assert.equal(approach.runtimeHook, 'setCaptureShot');
    assert.deepEqual(approach.anchor.position, [180.0, 2.8, -10.5]);
    assert.equal(approach.world.zone, 'lighthouse');
    assert.equal(approach.world.storyStep, 'inside_lighthouse');
    assert.equal(approach.world.probeTarget, 'lighthouse_bus');
    assert.equal(approach.world.lighthouse.mode, 'dc');
    assert.equal(approach.world.lighthouse.restored, false);

    const lakeWide = getCaptureShotSpec('lighthouse-lake-wide');
    assert.deepEqual(lakeWide.anchor.position, [172.0, 5.2, 2.0]);
    assert.equal(lakeWide.anchor.yaw, 120);
    assert.equal(lakeWide.anchor.pitch, -16);
    assert.equal(lakeWide.world.zone, 'lighthouse');
    assert.equal(lakeWide.world.probeTarget, 'lighthouse_beacon');
    assert.equal(lakeWide.world.lighthouse.restored, true);

    const returnPlaza = getCaptureShotSpec('final-return-plaza');
    assert.deepEqual(returnPlaza.anchor.position, [0, 6.5, 6.5]);
    assert.equal(returnPlaza.world.zone, 'plaza');
    assert.equal(returnPlaza.world.storyStep, 'returned_to_plaza');
    assert.equal(returnPlaza.world.comparison, 'before-after');
    assert.equal(returnPlaza.world.plaza.castleGateOpened, true);
    assert.equal(returnPlaza.world.lighthouse.restored, true);

    const pedestal = getCaptureShotSpec('arc1-final-pedestal');
    assert.deepEqual(pedestal.anchor.position, [0, 1.8, -7.5]);
    assert.equal(pedestal.world.zone, 'plaza');
    assert.equal(pedestal.world.storyStep, 'arc1_complete');
    assert.equal(pedestal.world.probeTarget, 'plaza_banco');
    assert.equal(pedestal.world.lighthouse.restored, true);
    for (const shot of fast) assert.equal(getCaptureShotSpec(shot.id).runtimeHook, 'setCaptureShot');
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
