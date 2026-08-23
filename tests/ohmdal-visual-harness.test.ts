import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  OHMDAL_VISUAL_CAMERA_PRESETS,
  isSoftwareRenderer,
  percentile,
} from '../src/experiences/ohmdal-playcanvas/visualHarness.ts';
import { OHM_HERO_TUNING } from '../src/experiences/ohmdal-playcanvas/ohmHeroTuning.ts';

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
});
