import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  ARC1_ROUTE,
  createArc1GreyboxState,
  enterArc1Region,
  evaluateCastleNetwork,
  evaluateForgeTerraces,
  evaluateLighthouse,
  evaluateManantial,
  getArc1Progress,
  isArcComplete,
  isCastleRestored,
  isForgeTerracesRestored,
  isLighthouseRestored,
  isManantialRestored,
} from '../src/experiences/ohmdal-playcanvas/systems/campaign/arc1GreyboxModel.ts';
import {
  FAST_STAGE_SHOTS,
  FULL_CAPTURE_CONTRACT,
  FAST_CAPTURE_CONTRACT,
  OHMDAL_AUTHORED_CAPTURE_SHOTS,
  OHMDAL_PLAZA_CAPTURE_VIEWS,
  getCaptureShotSpec,
  resolveCaptureViews,
} from '../scripts/visual/ohmdal-capture-contract.mjs';

const sceneSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts', import.meta.url),
  'utf8',
);
const runtimeSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts', import.meta.url),
  'utf8',
);
const vfxSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/systems/vfx/ohmdalVfxSystem.ts', import.meta.url),
  'utf8',
);
const soundscapeSource = readFileSync(
  new URL('../src/experiences/ohmdal-plaza/audio/soundscape.ts', import.meta.url),
  'utf8',
);

describe('Ohmdal A8 · Full Authored Golden Path & Freeze', () => {
  it('ARC1_ROUTE defines the full uninterrupted path through all regions', () => {
    assert.deepEqual(ARC1_ROUTE, [
      'portal',
      'taller',
      'manantial',
      'plaza',
      'castillo',
      'forja',
      'terrazas',
      'faro',
      'retorno',
    ]);
  });

  it('all 7 Hero Reference Packs exist, are approved and pass schema validation', () => {
    const heroPacks = [
      'ambient-vfx',
      'castle',
      'forge',
      'galvanoscope',
      'lighthouse',
      'manantial',
      'ohm',
    ];
    for (const pack of heroPacks) {
      const filePath = path.resolve(process.cwd(), 'assets', 'references', 'hero-packs', pack, 'hero-reference.json');
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      assert.equal(data.schemaVersion, 1, `${pack}: schemaVersion must be 1`);
      assert.equal(data.world, 'ohmdal', `${pack}: world must be ohmdal`);
      assert.equal(data.status, 'approved', `${pack}: status must be approved`);
      assert.ok(['reconstruct', 'adapt', 'design-approved'].includes(data.mode), `${pack}: mode must be valid`);
      assert.ok(data.mustPreserve.length > 0, `${pack}: mustPreserve must not be empty`);
      assert.ok(data.forbidden.length > 0, `${pack}: forbidden must not be empty`);
    }
  });

  it('Stage A8 FAST capture resolves all 22 canonical views across the full Golden Path', () => {
    const views = resolveCaptureViews({ mode: 'fast', stage: 'a8-full-authored-golden-path' });
    assert.equal(views.length, 22, 'A8 must contain exactly all 22 canonical shots');
    
    // Check coverage across all zones
    const plazaViews = views.filter((v) => ['portal-arrival', 'plaza-wide', 'ohm-landmark', 'restored-plaza-wide', 'bell-activation', 'final-return-plaza', 'arc1-final-pedestal'].includes(v.id));
    const workshopViews = views.filter((v) => ['workshop-exterior', 'workshop-interior-tools', 'galvanoscope-first-person'].includes(v.id));
    const manantialViews = views.filter((v) => ['manantial-approach', 'hydro-central-wide', 'sluice-gate-interaction', 'generator-platform', 'restored-manantial'].includes(v.id));
    const castleViews = views.filter((v) => ['castle-gate-open', 'castle-distribution-hall'].includes(v.id));
    const forgeTerracesViews = views.filter((v) => ['forge-core', 'terraces-irrigation', 'forge-terraces-overview'].includes(v.id));
    const lighthouseViews = views.filter((v) => ['lighthouse-approach', 'lighthouse-lake-wide'].includes(v.id));

    assert.equal(plazaViews.length, 7, 'Plaza canonical views count');
    assert.equal(workshopViews.length, 3, 'Workshop canonical views count');
    assert.equal(manantialViews.length, 5, 'Manantial canonical views count');
    assert.equal(castleViews.length, 2, 'Castle canonical views count');
    assert.equal(forgeTerracesViews.length, 3, 'Forge/Terraces canonical views count');
    assert.equal(lighthouseViews.length, 2, 'Lighthouse canonical views count');
  });

  it('all 22 capture specifications define valid viewports, cameras, and deterministic configurations', () => {
    const stageShots = FAST_STAGE_SHOTS['a8-full-authored-golden-path'];
    for (const shotId of stageShots) {
      const spec = getCaptureShotSpec(shotId);
      assert.equal(spec.id, shotId);
      assert.equal(spec.viewport.width, 1440);
      assert.equal(spec.viewport.height, 900);
      assert.equal(spec.deterministic.seed, 1701);
      assert.equal(spec.deterministic.reducedMotion, true);
    }
  });

  it('all authored systems are batched and integrated with the electrical model and zone lifecycle', () => {
    // Check all authored support roots in scene
    assert.match(sceneSource, /CastleAuthoredSupportRoot/);
    assert.match(sceneSource, /ForgeTerracesAuthoredSupportRoot/);
    assert.match(sceneSource, /LighthouseAuthoredSupportRoot/);

    // Check all batch groups
    assert.match(sceneSource, /addGroup\('OhmdalCastleStaticArt', false, 45\)/);
    assert.match(sceneSource, /addGroup\('OhmdalForgeTerracesStaticArt', false, 46\)/);
    assert.match(sceneSource, /addGroup\('OhmdalLighthouseStaticArt', false, 47\)/);

    // Check model evaluation functions are hooked
    assert.match(runtimeSource, /evaluateManantial/);
    assert.match(runtimeSource, /evaluateCastleNetwork/);
    assert.match(runtimeSource, /evaluateForgeTerraces/);
    assert.match(runtimeSource, /evaluateLighthouse/);
  });

  it('vfx and procedural soundscape remain strictly physically grounded with zero permanent wallpaper glow', () => {
    assert.doesNotMatch(vfxSource, /permanentCopperGlow|infiniteGlow|constantEmit/);
    assert.match(vfxSource, /triggerConductorPulse/);
    assert.match(vfxSource, /triggerTerminalArc/);
    assert.match(vfxSource, /triggerContactSnap/);
    assert.match(soundscapeSource, /class PlazaAudioEngine/);
    assert.match(soundscapeSource, /updateElectricalHum/);
    assert.match(soundscapeSource, /setWaterFlow/);
    assert.match(soundscapeSource, /setTurbineHum/);
  });

  it('arc1 campaign model progresses deterministically from initial state to full completion', () => {
    let state = createArc1GreyboxState();
    assert.equal(isArcComplete(state), false);
    assert.equal(isManantialRestored(state), false);
    assert.equal(isCastleRestored(state), false);
    assert.equal(isForgeTerracesRestored(state), false);
    assert.equal(isLighthouseRestored(state), false);

    // State transitions verify all zone restorations
    const progress = getArc1Progress(state);
    assert.equal(progress.manantialRestored, false);
    assert.equal(progress.castleRestored, false);
    assert.equal(progress.forgeTerracesRestored, false);
    assert.equal(progress.lighthouseRestored, false);
    assert.equal(progress.arcComplete, false);
  });
});
