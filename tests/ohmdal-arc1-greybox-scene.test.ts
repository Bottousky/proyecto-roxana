import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('../src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts', import.meta.url),
  'utf8',
);
const code = source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

for (const root of [
  { variable: 'castleRoot', entity: 'Arc1CastleGreyboxRoot', anchor: '60, 0, 0' },
  { variable: 'forgeTerracesRoot', entity: 'Arc1ForgeTerracesGreyboxRoot', anchor: '120, 0, -8' },
  { variable: 'lighthouseRoot', entity: 'Arc1LighthouseGreyboxRoot', anchor: '180, 0, 0' },
]) {
  assert.match(
    code,
    new RegExp(`const\\s+${root.variable}\\s*=\\s*new\\s+pc\\.Entity\\(['"]${root.entity}['"]\\)`),
    `${root.entity} exists`,
  );
  assert.match(code, new RegExp(`${root.variable}\\.setPosition\\(\\s*${root.anchor.replaceAll(', ', '\\s*,\\s*')}\\s*\\)`));
  assert.match(code, new RegExp(`${root.variable}\\.enabled\\s*=\\s*false`), `${root.entity} starts dormant`);
}

const probeIds = [
  'castle_bus_in',
  'castle_service_a',
  'castle_service_b',
  'castle_service_c',
  'forge_bus',
  'forge_heater',
  'terraces_pump',
  'lighthouse_bus',
  'lighthouse_reference',
  'lighthouse_beacon',
];
for (const id of probeIds) {
  const pattern = new RegExp(`probeTargets\\.${id}\\s*=\\s*new\\s+pc\\.Vec3`, 'g');
  assert.equal(code.match(pattern)?.length, 1, `${id} is authored exactly once`);
}

for (const banned of [
  /new\s+URL\(/,
  /assets\/runtime/i,
  /\.glb\b/i,
  /from\s+['"]three['"]/i,
  /app\.assets\.load\b/,
  /loadTexture/i,
  /meshy|tripo/i,
]) {
  assert.doesNotMatch(code, banned, `late-arc greybox avoids heavy/external seam ${banned}`);
}

for (const semanticName of [
  'CastleDistributionPanel',
  'CastleServiceLoadA',
  'CastleServiceLoadB',
  'CastleServiceLoadC',
  'CastleExitGate',
  'ForgeDistributionPanel',
  'ForgeHeater',
  'TerracesPump',
  'TerracesExitMarker',
  'LighthouseCalibrationPanel',
  'LighthouseBeacon',
  'LighthouseReturnMarker',
]) {
  assert.match(code, new RegExp(`['"]${semanticName}['"]`), `${semanticName} seam exists`);
}

assert.match(code, /const\s+lens\s*=\s*addSphere[\s\S]*?lens\.enabled\s*=\s*false/, 'Castle service lenses start dormant');
assert.match(code, /forgeHeaterCore\.enabled\s*=\s*false/, 'Forge core starts dormant');
assert.match(code, /entity\.light\.enabled\s*=\s*false/, 'point lights start dormant');
assert.match(code, /lighthouseLamp\.enabled\s*=\s*false/, 'Lighthouse lamp starts dormant');
assert.match(code, /lighthouseSignal\.enabled\s*=\s*false/, 'Lighthouse signal starts dormant');

for (const handle of [
  'roots',
  'castleServiceLights',
  'castleGate',
  'forgeHeater',
  'terracesPump',
  'forgeProtectionLight',
  'lighthouseBeacon',
  'lighthouseSignal',
]) {
  assert.match(code, new RegExp(`\\b${handle}\\b`), `runtime handle ${handle} remains public`);
}

assert.match(source, /export\s+function\s+buildArc1Greybox\s*\(/);
assert.match(source, /export\s+interface\s+Arc1GreyboxElements\s*\{/);

console.log('Ohmdal Arco I greybox scene: OK (dormant roots, probes, seams, no heavy assets)');
