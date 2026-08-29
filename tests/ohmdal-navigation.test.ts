import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { OhmdalNavigationRegistry } from '../src/experiences/ohmdal-playcanvas/systems/navigation/ohmdalNavigation.ts';
import {
  OHMDAL_TRANSITION_ANCHORS,
  directionForAnchor,
  yawForAnchor,
} from '../src/experiences/ohmdal-playcanvas/systems/navigation/ohmdalSpawnAnchors.ts';

const runtimeSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts', import.meta.url),
  'utf8',
);
const worldSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/playcanvasWorld.ts', import.meta.url),
  'utf8',
);
const workshopSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/world/workshop/buildWorkshopInterior.ts', import.meta.url),
  'utf8',
);
const arc1Source = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts', import.meta.url),
  'utf8',
);
const manantialSource = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/world/manantial/buildManantialShell.ts', import.meta.url),
  'utf8',
);

const transitionIds = [
  'portal-to-plaza',
  'plaza-to-workshop', 'workshop-to-plaza',
  'plaza-to-manantial', 'manantial-to-plaza',
  'plaza-to-castle', 'castle-to-plaza',
  'castle-to-forge-terraces', 'forge-terraces-to-castle',
  'forge-terraces-to-lighthouse', 'lighthouse-to-forge-terraces',
] as const;

for (const id of transitionIds) {
  const transition = OHMDAL_TRANSITION_ANCHORS[id];
  assert(transition, `${id} debe tener anchor`);
  const [dx, , dz] = directionForAnchor(transition.anchor);
  const yaw = yawForAnchor(transition.anchor);
  const rad = (yaw * Math.PI) / 180;
  const forward = [-Math.sin(rad), -Math.cos(rad)];
  const length = Math.hypot(dx, dz);
  const dot = (forward[0] * dx + forward[1] * dz) / length;
  assert.ok(dot >= 0.99, `${id} debe mirar hacia la zona destino (dot=${dot})`);
  assert.ok(Math.hypot(
    transition.anchor.position[0] - transition.sourceDoor[0],
    transition.anchor.position[2] - transition.sourceDoor[2],
  ) > 0.8, `${id} debe dejar holgura para no hacer ping-pong inmediato`);
}

const navigation = new OhmdalNavigationRegistry();
navigation.registerSolid({ id: 'plaza.closed-gate', zone: 'plaza', x: 0, z: 11.5, width: 7.8, depth: 2.4 });
navigation.registerSolid({ id: 'workshop.wall', zone: 'workshop', x: -60, z: 5, width: 12, depth: 0.4 });
navigation.registerSolid({ id: 'castle.closed-gate', zone: 'castle', x: 60, z: 8, width: 5.6, depth: 0.22, enabled: false });
navigation.registerSolid({ id: 'forge.wall', zone: 'forge-terraces', x: 106, z: 4, width: 0.5, depth: 48 });
navigation.registerSolid({ id: 'lighthouse.wall', zone: 'lighthouse', x: 166, z: 0, width: 0.5, depth: 30 });

navigation.setZoneActive('plaza', true);
assert.equal(navigation.collides(-60, 5, 0.4), false, 'un zone inactivo no bloquea movimiento');
assert.equal(navigation.collides(0, 11.5, 0.4), true, 'la puerta cerrada bloquea el umbral');
navigation.setSolidEnabled('plaza.closed-gate', false);
assert.equal(navigation.collides(0, 11.5, 0.4), false, 'la puerta abierta crea una apertura');
navigation.setZoneActive('plaza', false);
navigation.setZoneActive('workshop', true);
assert.equal(navigation.collides(-60, 5, 0.4), true, 'el muro del Taller bloquea al activar su zona');

function advanceUntilBlocked(x: number, z: number, dx: number, dz: number): [number, number] {
  for (let step = 0; step < 200; step += 1) {
    const nextX = x + dx;
    const nextZ = z + dz;
    if (navigation.collides(nextX, nextZ, 0.4)) return [x, z];
    x = nextX;
    z = nextZ;
  }
  return [x, z];
}

const wallStop = advanceUntilBlocked(-60, 0, 0, 0.1);
assert.ok(wallStop[1] < 5, 'el desafío de muro no penetra el muro del Taller');
assert.ok(navigation.diagnostics().solids.every((solid) => solid.kind === 'solid'), 'diagnóstico clasifica sólidos');

for (const source of [worldSource, workshopSource, manantialSource, arc1Source]) {
  assert.match(source, /addCollider/, 'cada zona authored conserva un mapeo auditable de colisión');
}
for (const id of [
  'workshop.wall-north', 'workshop.wall-south-west', 'workshop.wall-south-east',
  'manantial.powerhouse', 'manantial.retaining-west', 'manantial.retaining-east',
  'castle.wall-west', 'castle.wall-east', 'castle.exit-gate',
  'forge-terraces.wall-west', 'forge-terraces.wall-east',
  'lighthouse.wall-west', 'lighthouse.wall-east',
]) assert.match(`${workshopSource}\n${manantialSource}\n${arc1Source}`, new RegExp(id.replace(/[.-]/g, '\\$&')), `${id} debe estar registrado`);

assert.match(runtimeSource, /world\.navigation\.collides\(x, z, 0\.4\)/, 'movimiento usa navegación por zona');
assert.match(runtimeSource, /getCollisionDiagnostics\(\)/, 'el hook de diagnóstico de colisión está expuesto');
assert.doesNotMatch(runtimeSource, /teleportPlayer\(\s*-?\d+/, 'los teleports no reciben yaw literal');
assert.match(workshopSource, /WorkshopDoorwayProxyFacade/, 'Taller tiene proxy escénico para su abertura');
assert.match(workshopSource, /WorkshopCeilingPanel/, 'Taller queda encerrado por techo');

console.log('Ohmdal navigation/collision contracts: OK');
