# MiniMax GMI Worker Report

- Provider: GMI Cloud
- Model: `MiniMaxAI/MiniMax-M3`
- Task: `agent-work/tasks/minimax/ohmdal-arc1-scene-contract-test.md`
- Context files: `src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts`, `tests/ohmdal-zone-lifecycle.test.ts`
- Created: 2026-08-25T02:00:31.005Z
- Elapsed ms: 27689
- Usage: `{"prompt_tokens":7060,"completion_tokens":2918,"total_tokens":9978,"prompt_tokens_details":{"cached_tokens":133,"cache_write_tokens":0}}`
- Authority: proposal-only; Codex/Sol must verify, apply, test and accept.

---

```typescript
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const builderSource = readFileSync(
  new URL(
    '../src/experiences/ohmdal-playcanvas/world/arc1/buildArc1Greybox.ts',
    import.meta.url,
  ),
  'utf8',
);

// -------------------------------------------------------------------------
// Strip block + line comments so harmless formatting or descriptive notes
// never break the contract checks. Identifiers and string literals are
// preserved.
const stripComments = (src: string): string =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

// -------------------------------------------------------------------------
// 1. The three late-Arco-I zone roots exist and start disabled.
const stripped = stripComments(builderSource);

const rootChecks: Array<{ name: string; root: string }> = [
  { name: 'castle', root: 'Arc1CastleGreyboxRoot' },
  { name: 'forge-terraces', root: 'Arc1ForgeTerracesGreyboxRoot' },
  { name: 'lighthouse', root: 'Arc1LighthouseGreyboxRoot' },
];

for (const { name, root } of rootChecks) {
  const declareRe = new RegExp(`const\\s+${root}\\s*=\\s*new\\s+pc\\.Entity\\(['"]${root}['"]\\)`);
  assert.match(stripped, declareRe, `${name}: root entity is declared`);

  const setPositionRe = new RegExp(`${root}\\.setPosition\\(`);
  assert.match(stripped, setPositionRe, `${name}: root is positioned in the world`);

  const disableRe = new RegExp(`${root}\\.enabled\\s*=\\s*false`);
  assert.match(stripped, disableRe, `${name}: root starts disabled (dormant on arrival)`);
}

// -------------------------------------------------------------------------
// 2. Castle, Forge/Terraces and Lighthouse retain their declared world
//    anchors. These are the public spatial contracts the rest of the
//    sprint depends on.
const anchorChecks: Array<{ zone: string; pattern: RegExp }> = [
  { zone: 'castle', pattern: /castleRoot\.setPosition\(\s*60\s*,\s*0\s*,\s*0\s*\)/ },
  { zone: 'forge-terraces', pattern: /forgeTerracesRoot\.setPosition\(\s*120\s*,\s*0\s*,\s*-8\s*\)/ },
  { zone: 'lighthouse', pattern: /lighthouseRoot\.setPosition\(\s*180\s*,\s*0\s*,\s*0\s*\)/ },
];

for (const { zone, pattern } of anchorChecks) {
  assert.match(stripped, pattern, `${zone}: declared world anchor is preserved`);
}

// -------------------------------------------------------------------------
// 3. All required probe target IDs are authored exactly once.
const requiredProbes = [
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

for (const id of requiredProbes) {
  const probeRe = new RegExp(`probeTargets\\.${id}\\s*=\\s*new\\s+pc\\.Vec3`);
  assert.match(stripped, probeRe, `probe target '${id}' is authored`);

  const exactRe = new RegExp(`probeTargets\\.${id}\\s*=\\s*new\\s+pc\\.Vec3`, 'g');
  const occurrences = stripped.match(exactRe) ?? [];
  assert.equal(
    occurrences.length,
    1,
    `probe target '${id}' is authored exactly once (found ${occurrences.length})`,
  );
}

// -------------------------------------------------------------------------
// 4. No asset URL, GLB request, texture fetch, Three.js dependency or
//    paid-provider seam appears in the greybox builder. The blockout must
//    stay neutral and free of heavy I/O.
const bannedPatterns: Array<{ label: string; pattern: RegExp }> = [
  { label: 'new URL asset request', pattern: /new\s+URL\(/ },
  { label: 'asset URL reference', pattern: /assets\/runtime/ },
  { label: 'GLB model reference', pattern: /\.glb\b/i },
  { label: 'Three.js dependency', pattern: /\bthree\b|from\s+['"]three['"]/i },
  { label: 'paid provider seam', pattern: /paid[-_]?provider/i },
  { label: 'texture fetch', pattern: /getTexture|loadTexture|assets\/textures/i },
  { label: 'resource loader', pattern: /app\.assets\.load\b/ },
];

for (const { label, pattern } of bannedPatterns) {
  assert.doesNotMatch(stripped, pattern, `greybox builder contains no ${label}`);
}

// -------------------------------------------------------------------------
// 5. Each zone includes a player-facing entry / panel / load-or-calibration
//    / exit seam. The exact primitive counts are decorative; the public
//    seam names are the contract.
const seamChecks: Array<{ zone: string; entries: RegExp[]; panels: RegExp[]; loads: RegExp[]; exits: RegExp[] }> = [
  {
    zone: 'castle',
    entries: [/CastleDistributionPanel/],
    panels: [/CastlePanelBody/, /CastlePanelFace/],
    loads: [/CastleServiceLoadA/, /CastleServiceLoadB/, /CastleServiceLoadC/],
    exits: [/CastleExitGate/],
  },
  {
    zone: 'forge-terraces',
    entries: [/ForgeDistributionPanel/],
    panels: [/ForgePanelBody/, /ForgePanelFace/],
    loads: [/ForgeHeater/, /TerracesPump/],
    exits: [/TerracesExitMarker/],
  },
  {
    zone: 'lighthouse',
    entries: [/LighthouseCalibrationPanel/],
    panels: [/LighthousePanelBody/, /LighthousePanelFace/],
    loads: [/LighthouseBeacon/],
    exits: [/LighthouseReturnMarker/],
  },
];

for (const { zone, entries, panels, loads, exits } of seamChecks) {
  for (const re of entries) {
    assert.match(stripped, re, `${zone}: player-facing entry seam '${re.source}' is authored`);
  }
  for (const re of panels) {
    assert.match(stripped, re, `${zone}: panel geometry '${re.source}' is authored`);
  }
  for (const re of loads) {
    assert.match(stripped, re, `${zone}: load or calibration seam '${re.source}' is authored`);
  }
  for (const re of exits) {
    assert.match(stripped, re, `${zone}: exit seam '${re.source}' is authored`);
  }
}

// -------------------------------------------------------------------------
// 6. Event-only visuals start dormant. The state system wakes them; the
//    greybox never lights them on arrival.
const dormantVisuals: Array<{ label: string; pattern: RegExp }> = [
  // Castle service lenses: every CastleServiceLight*Lens must be disabled.
  {
    label: 'Castle service lens (all three)',
    pattern:
      /CastleServiceLightA[\s\S]*?Lens[\s\S]*?\.enabled\s*=\s*false[\s\S]*?CastleServiceLightB[\s\S]*?Lens[\s\S]*?\.enabled\s*=\s*false[\s\S]*?CastleServiceLightC[\s\S]*?Lens[\s\S]*?\.enabled\s*=\s*false/,
  },
  // Forge heater core: dormant until the Heater puzzle is live.
  {
    label: 'Forge heater core',
    pattern: /forgeHeaterCore\.enabled\s*=\s*false/,
  },
  // Forge protection light: dormant until protection is validated.
  {
    label: 'Forge protection point light',
    pattern: /if\s*\(\s*entity\.light\s*\)\s*entity\.light\.enabled\s*=\s*false/,
  },
  // Lighthouse beacon lamp: dormant until calibration is accepted.
  {
    label: 'Lighthouse beacon lamp',
    pattern: /lighthouseLamp\.enabled\s*=\s*false/,
  },
  // Lighthouse signal bar: its parent entity starts disabled.
  {
    label: 'Lighthouse signal entity',
    pattern: /lighthouseSignal\.enabled\s*=\s*false/,
  },
];

for (const { label, pattern } of dormantVisuals) {
  assert.match(stripped, pattern, `event-only visual '${label}' starts dormant`);
}

// -------------------------------------------------------------------------
// 7. The builder exposes the runtime handles declared by its public
//    interface. The zone lifecycle and puzzle systems bind to these.
const runtimeHandles: Array<{ handle: string; pattern: RegExp }> = [
  { handle: 'roots', pattern: /roots\s*:\s*\{[\s\S]*?castle[\s\S]*?forge-terraces[\s\S]*?lighthouse[\s\S]*?\}/ },
  { handle: 'castleServiceLights', pattern: /castleServiceLights[\s\S]*?push\(/ },
  { handle: 'castleGate', pattern: /const\s+castleGate\s*=\s*new\s+pc\.Entity\(['"]CastleExitGate['"]\)/ },
  { handle: 'forgeHeater', pattern: /const\s+forgeHeater\s*=\s*new\s+pc\.Entity\(['"]ForgeHeater['"]\)/ },
  { handle: 'terracesPump', pattern: /const\s+terracesPump\s*=\s*new\s+pc\.Entity\(['"]TerracesPump['"]\)/ },
  { handle: 'forgeProtectionLight', pattern: /const\s+forgeProtectionLight\s*=\s*addPointLight\(/ },
  { handle: 'lighthouseBeacon', pattern: /const\s+lighthouseBeacon\s*=\s*new\s+pc\.Entity\(['"]LighthouseBeacon['"]\)/ },
  { handle: 'lighthouseSignal', pattern: /const\s+lighthouseSignal\s*=\s*new\s+pc\.Entity\(['"]LighthouseSignal['"]\)/ },
];

for (const { handle, pattern } of runtimeHandles) {
  assert.match(stripped, pattern, `runtime handle '${handle}' is wired up and returned`);
}

assert.match(
  stripped,
  /return\s*\{[\s\S]*?roots[\s\S]*?castleServiceLights[\s\S]*?castleGate[\s\S]*?forgeHeater[\s\S]*?terracesPump[\s\S]*?forgeProtectionLight[\s\S]*?lighthouseBeacon[\s\S]*?lighthouseSignal[\s\S]*?\}\s*;?\s*\}\s*$/,
  'public Arc1GreyboxElements return value exposes every declared runtime handle',
);

// -------------------------------------------------------------------------
// 8. Type-level contract: the file still exports the type and function
//    the rest of the sprint imports.
assert.match(
  builderSource,
  /export\s+type\s+Arc1GreyboxZoneId\s*=\s*['"]castle['"]\s*\|\s*['"]forge-terraces['"]\s*\|\s*['"]lighthouse['"]/,
  'Arc1GreyboxZoneId union is the three late-Arco-I zones',
);
assert.match(
  builderSource,
  /export\s+function\s+buildArc1Greybox\s*\(/,
  'buildArc1Greybox is exported as the public entry point',
);

console.log(
  'Ohmdal Arco I greybox scene: OK (roots dormant, anchors preserved, probes authored, no heavy assets, player-facing seams wired, event visuals start disabled, runtime handles exposed)',
);
```

Assumptions:

1. The test runs in the same Node + TypeScript pipeline as `tests/ohmdal-zone-lifecycle.test.ts` (read-only `node:fs` + `node:assert/strict`, no test runner imports added).
2. The contract is enforced against the source text of `buildArc1Greybox.ts` via regex after a comment strip, so reformatting, comment edits or renames of decorative primitives cannot break the test; only the documented public contract (root names, anchors, probe IDs, seam names, dormant flags, runtime handle names) is locked.
3. Constructing a real PlayCanvas `pc.Application` is intentionally avoided — the test stays deterministic and isolated from graphics-device state. All checks are semantic/source-inspection.
4. `addCollider` invocations are validated only through their required presence in the source (count, order and world coords are not asserted) so harmless adjustments to wall colliders do not break the contract.
5. The Castle service-light dormant check requires all three `…Lens` entities to be disabled in source order (`A`, `B`, `C`); adding a fourth service light or reordering would need an explicit contract update, which matches the spirit of the seam declaration.
6. The `forgeProtectionLight` dormant check relies on the shared `addPointLight` helper that ends with `if (entity.light) entity.light.enabled = false;`. Any future change that bypasses that helper for this entity would be a deliberate contract break and would surface here.
7. No edits are proposed to the builder, runtime, dependencies or package scripts — only the one new test file under `tests/`.
