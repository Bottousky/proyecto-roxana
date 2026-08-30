import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { OHMDAL_VFX_TUNING } from '../src/experiences/ohmdal-playcanvas/systems/vfx/ohmdalVfxSystem.ts';
import { PlazaAudioEngine } from '../src/experiences/ohmdal-plaza/audio/soundscape.ts';

const vfxSystemSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/systems/vfx/ohmdalVfxSystem.ts', import.meta.url),
  'utf8',
);
const runtimeSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts', import.meta.url),
  'utf8',
);
const soundscapeSource = readFileSync(
  new URL('../src/experiences/ohmdal-plaza/audio/soundscape.ts', import.meta.url),
  'utf8',
);

describe('Ohmdal A7 · VFX, Audio and Ambient System', () => {
  it('hero-reference.json contains valid authored specification for A7', () => {
    const heroRefPath = path.resolve(process.cwd(), 'assets/references/hero-packs/ambient-vfx/hero-reference.json');
    const content = JSON.parse(readFileSync(heroRefPath, 'utf8'));
    assert.equal(content.schemaVersion, 1);
    assert.equal(content.assetId, 'rx_ambient_vfx_audio_hero_01');
    assert.equal(content.world, 'ohmdal');
    assert.equal(content.status, 'approved');
    assert.ok(content.mustPreserve.some((rule: string) => rule.includes('energy is an event, not wallpaper')));
    assert.ok(content.forbidden.some((rule: string) => rule.includes('permanent copper glow')));
  });

  it('OHMDAL_VFX_TUNING conforms to event-driven physical requirements', () => {
    assert.ok(OHMDAL_VFX_TUNING.conductorPulse.speed > 0);
    assert.ok(OHMDAL_VFX_TUNING.conductorPulse.duration < 1.0, 'Pulse must be transient, not permanent wallpaper');
    assert.ok(OHMDAL_VFX_TUNING.conductorPulse.mobileScale < 1.0, 'Mobile scales down particle width');
    assert.ok(OHMDAL_VFX_TUNING.terminalArcBurst.duration < 0.5, 'Terminal arc burst is instantaneous micro-arc');
    assert.ok(OHMDAL_VFX_TUNING.waterMist.particleCount >= 6);
    assert.ok(OHMDAL_VFX_TUNING.heatRamp.coolDownRate > 0);
    assert.ok(OHMDAL_VFX_TUNING.protectionTrip.flashDuration < 0.5);
  });

  it('OhmdalVfxSystem adheres to clean particle pool lifecycle, mobile scaling and no permanent glow', () => {
    assert.match(vfxSystemSource, /class OhmdalVfxSystem/);
    assert.match(vfxSystemSource, /triggerConductorPulse/);
    assert.match(vfxSystemSource, /triggerTerminalArc/);
    assert.match(vfxSystemSource, /triggerContactSnap/);
    assert.match(vfxSystemSource, /triggerDustWake/);
    assert.match(vfxSystemSource, /setWaterMist/);
    assert.match(vfxSystemSource, /dispose\(\)/);
    // Non-permanent glow discipline
    assert.doesNotMatch(vfxSystemSource, /permanentCopperGlow|infiniteGlow|constantEmit/);
    // Reduced motion & mobile checks
    assert.match(vfxSystemSource, /reducedMotion/);
    assert.match(vfxSystemSource, /isMobile/);
  });

  it('playcanvasRuntime wires VFX and procedural audio to all Arc 1 interaction events', () => {
    assert.match(runtimeSource, /const vfx = new OhmdalVfxSystem/);
    assert.match(runtimeSource, /vfx\.update\(dt\)/);
    assert.match(runtimeSource, /vfx\.dispose\(\)/);
    // Manantial water mist and turbine sound
    assert.match(runtimeSource, /vfx\.setWaterMist\('manantial'/);
    assert.match(runtimeSource, /audio\.setWaterFlow/);
    assert.match(runtimeSource, /audio\.setTurbineHum/);
    // Castle & Forge conductor pulses and breakers
    assert.match(runtimeSource, /vfx\.triggerConductorPulse/);
    assert.match(runtimeSource, /audio\.playHeavyBreakerClunk/);
    assert.match(runtimeSource, /audio\.playForgeRoar/);
    // Lighthouse calibration and synchronization
    assert.match(runtimeSource, /audio\.playBeaconSync/);
    assert.match(runtimeSource, /audio\.playGalvanometerClick/);
  });

  it('PlazaAudioEngine provides all required procedural methods safely under SSR/Node', () => {
    assert.match(soundscapeSource, /class PlazaAudioEngine/);
    assert.match(soundscapeSource, /updateElectricalHum/);
    assert.match(soundscapeSource, /setWaterFlow/);
    assert.match(soundscapeSource, /setTurbineHum/);
    assert.match(soundscapeSource, /playHeavyBreakerClunk/);
    assert.match(soundscapeSource, /playBreakerTrip/);
    assert.match(soundscapeSource, /playBreakerReset/);
    assert.match(soundscapeSource, /playForgeRoar/);
    assert.match(soundscapeSource, /playPumpRhythm/);
    assert.match(soundscapeSource, /playBeaconSync/);

    const audio = new PlazaAudioEngine();
    assert.doesNotThrow(() => {
      audio.updateElectricalHum(0.5);
      audio.setWaterFlow(0.8);
      audio.setTurbineHum(0.7);
      audio.playSwitchClunk();
      audio.playHeavyBreakerClunk();
      audio.playRelayEngage();
      audio.playBreakerTrip();
      audio.playBreakerReset();
      audio.playBellChime();
      audio.playWireScrape();
      audio.playProbeContact(24);
      audio.playDiscoveryChime();
      audio.playForgeRoar(0.8);
      audio.playPumpRhythm();
      audio.playBeaconSync();
      audio.playVocalChirp('Ohm');
      audio.playVocalChirp('Edda');
      audio.playVocalChirp('Lumen');
      const muted = audio.toggleMute();
      assert.equal(typeof muted, 'boolean');
      audio.toggleMute();
    });
  });
});
