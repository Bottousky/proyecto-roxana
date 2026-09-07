import assert from 'node:assert/strict';
import {
  Arc1WorldAmbience,
  planArc1WorldAmbience,
  type Arc1WorldAmbienceFrame,
} from '../src/experiences/ohmdal-playcanvas/systems/audio/arc1WorldAmbience.ts';
import { PlazaAudioEngine } from '../src/experiences/ohmdal-plaza/audio/soundscape.ts';

const plaza: Arc1WorldAmbienceFrame = {
  position: [0, 1, 0],
  region: 'plaza',
  electrical: { fountainPowered: false },
};
const atManantial: Arc1WorldAmbienceFrame = {
  position: [-4.2, 1.8, 20.5],
  region: 'manantial',
  electrical: { manantialWaterFlow: 1, manantialMachinePower: 1 },
};

const quietPlaza = planArc1WorldAmbience(plaza);
assert.ok(quietPlaza.levels['plaza-wind'] > 0, 'la Plaza conserva viento suave');
assert.equal(quietPlaza.levels['plaza-fountain'], 0, 'la fuente apagada permanece silenciosa');

const liveFountain = planArc1WorldAmbience({
  ...plaza,
  electrical: { fountainPowered: true },
});
assert.ok(liveFountain.levels['plaza-fountain'] > 0, 'la fuente sólo suena cuando el circuito la alimenta');

const liveManantial = planArc1WorldAmbience(atManantial);
assert.ok(liveManantial.levels['manantial-water'] > 0);
assert.ok(liveManantial.levels['manantial-machine'] > 0);
assert.equal(liveManantial.levels['forge-heat'], 0);

const liveForge = planArc1WorldAmbience({
  position: [124.2, 2.4, -8],
  region: 'forja',
  electrical: { forgeHeaterPower: 0.8, terracesPumpPower: 1 },
});
assert.ok(liveForge.levels['forge-heat'] > 0, 'la Forja responde al heater energizado');
assert.equal(liveForge.levels['terraces-water'], 0, 'la Forja no reproduce el bombeo de Terrazas');

const liveTerraces = planArc1WorldAmbience({
  position: [120, 1.2, 16],
  region: 'terrazas',
  electrical: { terracesPumpPower: 1 },
});
assert.ok(liveTerraces.levels['terraces-water'] > 0);
assert.equal(liveTerraces.levels['forge-heat'], 0);

const quietBeacon = planArc1WorldAmbience({
  position: [180, 3, 0],
  region: 'faro',
  electrical: { lighthouseBeaconPower: 0 },
});
assert.ok(quietBeacon.levels['lighthouse-wind'] > 0);
assert.ok(quietBeacon.levels['lighthouse-lake'] > 0);
assert.equal(quietBeacon.levels['lighthouse-beacon'], 0, 'el hum del Faro exige baliza emisora');

const liveBeacon = planArc1WorldAmbience({
  position: [180, 3, 8],
  region: 'faro',
  electrical: { lighthouseBeaconPower: 1 },
});
assert.ok(liveBeacon.levels['lighthouse-beacon'] > 0);

const farFromFountain = planArc1WorldAmbience({
  ...plaza,
  position: [15, 1, 0],
  electrical: { fountainPowered: true },
});
assert.ok(
  farFromFountain.levels['plaza-fountain'] < liveFountain.levels['plaza-fountain'],
  'la intensidad cae al alejarse de la fuente',
);
assert.notEqual(liveFountain.pans['plaza-fountain'], farFromFountain.pans['plaza-fountain']);

const fountainFacingRight = planArc1WorldAmbience({
  position: [0, 1, 3.8],
  headingDegrees: 0,
  region: 'plaza',
  electrical: { fountainPowered: true },
});
const fountainFacingLeft = planArc1WorldAmbience({
  position: [0, 1, 3.8],
  headingDegrees: 180,
  region: 'plaza',
  electrical: { fountainPowered: true },
});
assert.ok(fountainFacingRight.pans['plaza-fountain'] > 0, 'la fuente queda a la derecha mirando al norte');
assert.ok(fountainFacingLeft.pans['plaza-fountain'] < 0, 'el paneo cambia al girar 180 grados');

const reducedMotion = planArc1WorldAmbience({ ...atManantial, reducedMotion: true });
assert.ok(reducedMotion.levels['manantial-machine'] < liveManantial.levels['manantial-machine']);
assert.equal(reducedMotion.levels['manantial-water'], liveManantial.levels['manantial-water']);

for (const flag of ['paused', 'hidden', 'muted'] as const) {
  const silent = planArc1WorldAmbience({ ...atManantial, [flag]: true });
  assert.ok(Object.values(silent.levels).every((level) => level === 0), `${flag} debe silenciar todas las capas`);
}

// The PlayCanvas adapter shares PlazaAudioEngine's context when one exists,
// while remaining safe before the first browser gesture and after disposal.
const spatialBed = new Arc1WorldAmbience();
const audio = new PlazaAudioEngine({ ambientBed: false, worldAmbience: spatialBed });
audio.updateWorldAmbience(atManantial);
assert.ok(spatialBed.getPlan().levels['manantial-water'] > 0);
assert.equal(audio.isMuted, false);
assert.equal(audio.toggleMute(), true);
assert.ok(Object.values(spatialBed.getPlan().levels).every((level) => level === 0));
assert.equal(audio.toggleMute(), false);
audio.dispose();
assert.doesNotThrow(() => audio.updateWorldAmbience(atManantial));
assert.doesNotThrow(() => audio.dispose());

console.log('Ohmdal Arc 1 world ambience: OK (state gates, spatial falloff and lifecycle flags)');
