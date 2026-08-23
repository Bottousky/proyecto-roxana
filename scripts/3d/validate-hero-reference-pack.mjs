#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const arg = process.argv[2];
const allowedModes = new Set(['reconstruct', 'adapt', 'design-approved']);

function fail(message) {
  console.error(`HERO_REFERENCE_GATE FAIL: ${message}`);
  process.exit(1);
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') fail(`${label} must be a non-empty string`);
}

function requireArray(value, label, { nonEmpty = false } = {}) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  if (nonEmpty && value.length === 0) fail(`${label} must contain at least one item`);
  for (const [index, item] of value.entries()) {
    if (typeof item !== 'string' || item.trim() === '') fail(`${label}[${index}] must be a non-empty string`);
  }
}

function repoPath(relativePath, label) {
  requireString(relativePath, label);
  const resolved = path.resolve(root, relativePath);
  const rel = path.relative(root, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) fail(`${label} must stay inside the repository`);
  return resolved;
}

async function requireExistingRepoPath(relativePath, label) {
  const resolved = repoPath(relativePath, label);
  try {
    await access(resolved);
  } catch {
    fail(`${label} does not exist: ${relativePath}`);
  }
}

if (!arg || arg === '--help' || arg === '-h') {
  console.log('Usage: node scripts/3d/validate-hero-reference-pack.mjs <hero-reference.json>');
  process.exit(arg ? 0 : 1);
}

const manifestPath = repoPath(arg, 'manifest path');
let pack;
try {
  pack = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch (error) {
  fail(`cannot parse ${arg}: ${error.message}`);
}

if (pack.schemaVersion !== 1) fail('schemaVersion must be 1');
requireString(pack.assetId, 'assetId');
requireString(pack.world, 'world');
requireString(pack.name, 'name');
requireString(pack.mode, 'mode');
if (!allowedModes.has(pack.mode)) fail(`mode must be one of: ${[...allowedModes].join(', ')}`);
requireString(pack.status, 'status');
if (pack.status !== 'approved') fail(`status must be approved before hero production (got ${pack.status})`);

await requireExistingRepoPath(pack.primaryReference, 'primaryReference');
requireArray(pack.supportingReferences, 'supportingReferences');
for (const [index, reference] of pack.supportingReferences.entries()) {
  await requireExistingRepoPath(reference, `supportingReferences[${index}]`);
}

if (!pack.physicalAnchors || typeof pack.physicalAnchors !== 'object') fail('physicalAnchors is required');
if (pack.physicalAnchors.unit !== 'meter') fail('physicalAnchors.unit must be meter');
requireString(pack.physicalAnchors.frontAxis, 'physicalAnchors.frontAxis');
requireString(pack.physicalAnchors.upAxis, 'physicalAnchors.upAxis');
if (typeof pack.physicalAnchors.groundedPivot !== 'boolean') fail('physicalAnchors.groundedPivot must be boolean');

requireArray(pack.mustPreserve, 'mustPreserve', { nonEmpty: true });
requireArray(pack.mayResolve, 'mayResolve');
requireArray(pack.forbidden, 'forbidden');

if (!pack.authoring || typeof pack.authoring !== 'object') fail('authoring is required');
requireString(pack.authoring.preferredRoute, 'authoring.preferredRoute');
if (typeof pack.authoring.generativeProviderRequired !== 'boolean') {
  fail('authoring.generativeProviderRequired must be boolean');
}

if (pack.mode === 'design-approved') {
  requireString(pack.approvalNote, 'approvalNote');
}

console.log(`HERO_REFERENCE_GATE PASS: ${pack.assetId}`);
console.log(`mode=${pack.mode} primary=${pack.primaryReference}`);
console.log(`mustPreserve=${pack.mustPreserve.length} supportingRefs=${pack.supportingReferences.length}`);
