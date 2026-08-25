import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestRelativePath = 'assets/references/region-packs/manifest.json';
const manifestPath = resolve(repoRoot, manifestRelativePath);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
  status?: unknown;
  spatialAuthority?: unknown;
  visualAuthority?: unknown;
  areas?: Array<{
    id?: unknown;
    brief?: unknown;
    shots?: unknown;
    heroGateCandidates?: Array<{
      id?: unknown;
      mode?: unknown;
      status?: unknown;
      autoApproveDesign?: unknown;
      finalModelingBlockedUntilHeroPack?: unknown;
    }>;
  }>;
};

const canonicalShots = [
  'portal-arrival',
  'plaza-wide',
  'ohm-landmark',
  'workshop-exterior',
  'workshop-interior-tools',
  'galvanoscope-first-person',
  'manantial-approach',
  'hydro-central-wide',
  'sluice-gate-interaction',
  'generator-platform',
  'restored-manantial',
  'restored-plaza-wide',
  'bell-activation',
  'castle-gate-open',
  'castle-distribution-hall',
  'forge-core',
  'terraces-irrigation',
  'forge-terraces-overview',
  'lighthouse-approach',
  'lighthouse-lake-wide',
  'final-return-plaza',
  'arc1-final-pedestal',
] as const;

const expectedAreas = [
  'plaza',
  'workshop',
  'manantial',
  'castillo',
  'forja',
  'terrazas',
  'faro',
  'final-return',
] as const;

describe('Ohmdal Arco I · region-pack manifest', () => {
  it('declara las ocho áreas, briefs existentes y autoridades explícitas', () => {
    assert.equal(manifest.status, 'approved-for-support-authoring');
    assert.ok(Array.isArray(manifest.areas));
    assert.deepEqual(
      manifest.areas?.map((area) => area.id),
      expectedAreas,
    );
    assert.equal(typeof manifest.spatialAuthority, 'string');
    assert.match(manifest.spatialAuthority as string, /greybox/i);
    assert.match(manifest.spatialAuthority as string, /Golden Path/i);
    assert.equal(typeof manifest.visualAuthority, 'string');
    assert.ok(
      existsSync(resolve(repoRoot, manifest.visualAuthority as string)),
      'la autoridad visual debe apuntar a un archivo del repo',
    );

    for (const area of manifest.areas ?? []) {
      assert.equal(typeof area.brief, 'string', `${String(area.id)} requiere brief`);
      assert.ok(
        existsSync(resolve(repoRoot, area.brief as string)),
        `brief inexistente para ${String(area.id)}: ${String(area.brief)}`,
      );
    }
  });

  it('cubre exactamente los 22 shots canónicos y limita duplicados al contrato cross-area', () => {
    const shotOwners = new Map<string, string[]>();
    for (const area of manifest.areas ?? []) {
      assert.ok(Array.isArray(area.shots), `${String(area.id)} requiere shots`);
      for (const shot of (area.shots ?? []) as string[]) {
        const owners = shotOwners.get(shot) ?? [];
        owners.push(String(area.id));
        shotOwners.set(shot, owners);
      }
    }

    const coveredShots = [...shotOwners.keys()].sort();
    assert.deepEqual(coveredShots, [...canonicalShots].sort());

    const duplicateOwners = Object.fromEntries(
      [...shotOwners.entries()]
        .filter(([, owners]) => owners.length > 1)
        .map(([shot, owners]) => [shot, [...owners].sort()]),
    );
    assert.deepEqual(duplicateOwners, {
      'final-return-plaza': ['final-return', 'plaza'],
      'forge-terraces-overview': ['forja', 'terrazas'],
    });
  });

  it('clasifica los cuatro héroes como adapt sin autoaprobar ni abrir modelado final', () => {
    const candidates = (manifest.areas ?? []).flatMap((area) =>
      (area.heroGateCandidates ?? []).map((candidate) => ({
        area: String(area.id),
        ...candidate,
      })),
    );

    assert.deepEqual(
      candidates
        .map((candidate) => `${candidate.area}:${String(candidate.id)}`)
        .sort(),
      [
        'castillo:central-distribution-bus-landmark',
        'faro:lighthouse-calibration-mechanism',
        'forja:primary-load-protection-assembly',
        'manantial:turbine-generator-assembly',
      ].sort(),
    );
    assert.equal(candidates.length, 4);
    for (const candidate of candidates) {
      assert.equal(candidate.mode, 'adapt');
      assert.equal(candidate.status, 'approved-for-reference-pack');
      assert.equal(candidate.autoApproveDesign, false);
      assert.equal(candidate.finalModelingBlockedUntilHeroPack, true);
    }
  });
});
