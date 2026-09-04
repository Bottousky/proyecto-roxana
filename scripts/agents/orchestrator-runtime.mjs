#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const DEFAULT_WORKER_TTL_MINUTES = 90;

export function workerRuntimePath(root, workerId) {
  return path.join(root, '.playtest', 'orchestrator', 'workers', `${workerId}.json`);
}

export async function readWorkerRuntime(root, workerId) {
  try {
    return JSON.parse(await readFile(workerRuntimePath(root, workerId), 'utf8'));
  } catch {
    return null;
  }
}

export async function writeWorkerRuntime(root, workerId, patch) {
  const file = workerRuntimePath(root, workerId);
  await mkdir(path.dirname(file), { recursive: true });
  const previous = await readWorkerRuntime(root, workerId) || {};
  const next = {
    schemaVersion: 1,
    workerId,
    ...previous,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(file, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

export function classifyWorkerRuntime(runtime, ttlMinutes = DEFAULT_WORKER_TTL_MINUTES, nowMs = Date.now()) {
  if (!runtime) return 'UNKNOWN';
  const status = String(runtime.status || '').toUpperCase();
  if (status !== 'RUNNING') return status || 'UNKNOWN';

  const startedMs = Date.parse(runtime.startedAt || runtime.updatedAt || '');
  if (!Number.isFinite(startedMs)) return 'STALE';
  const ageMs = nowMs - startedMs;
  return ageMs > ttlMinutes * 60_000 ? 'STALE' : 'RUNNING';
}

export function evidenceStatusFromText(content) {
  if (typeof content !== 'string') return null;
  const match = content.match(/^\s*EVIDENCE_STATUS\s*:\s*(PASS|FAIL)\s*$/im);
  return match ? match[1].toUpperCase() : null;
}

export async function evidenceStatusFromFile(file) {
  try {
    return evidenceStatusFromText(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}
