#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const configPath = path.join(root, 'agent-work', 'orchestrator', 'config.json');

function parseEnvText(text) {
  const values = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const equals = line.indexOf('=');
    if (equals <= 0) continue;
    const key = line.slice(0, equals).trim();
    let value = line.slice(equals + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

for (const relative of ['.env.local', '.env']) {
  const file = path.join(root, relative);
  if (!existsSync(file)) continue;
  const parsed = parseEnvText(await readFile(file, 'utf8'));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] == null) process.env[key] = value;
  }
}

const config = JSON.parse(await readFile(configPath, 'utf8'));
const worker = config.workers?.minimaxPlayerFacing;
if (!worker) throw new Error('config.workers.minimaxPlayerFacing is missing');

const worktreeDir = path.resolve(root, worker.worktreeHint || '../Roxana-minimax-player-facing');
const task = worker.task;
const report = worker.report;
const model = process.env.ROXANA_MINIMAX_OPENCODE_MODEL || worker.model || 'gmicloud/MiniMaxAI/MiniMax-M3';
const statePath = path.join(worktreeDir, config.activeLoop);

if (!existsSync(worktreeDir)) {
  throw new Error(`MiniMax worktree does not exist: ${worktreeDir}. Mavis must create/sync it before dispatch.`);
}
if (!existsSync(path.join(worktreeDir, task))) {
  throw new Error(`MiniMax task missing in worktree: ${task}`);
}

let stage = 'unknown';
try {
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  stage = state.currentStage || stage;
} catch {}

const prompt = [
  'You are the MiniMax M3 implementation worker for Proyecto Roxana.',
  `Read and execute ${task}.`,
  `The active stage is ${stage}. Implement exactly that stage, not later stages.`,
  `Canonical base is origin/${config.canonicalBranch}; your worker branch is ${worker.branch}.`,
  `Write Candidate Protocol v2 evidence to ${report}.`,
  'Run the required focused tests/build/browser checks, commit implementation, then commit the evidence report and push the worker branch.',
  'Do not mark the canonical loop stage passed and do not self-approve.',
  'Do not use paid generation. If GMI indicates the promotional/free route is unavailable or would charge, stop and report the provider failure instead of spending.',
].join('\n');

const command = process.platform === 'win32' ? 'opencode.cmd' : 'opencode';
const args = [
  'run',
  '--model', model,
  '--format', 'json',
  '--auto',
  prompt,
];

console.warn(`[MINIMAX_BUILDER] worktree=${worktreeDir}`);
console.warn(`[MINIMAX_BUILDER] model=${model}`);
console.warn(`[MINIMAX_BUILDER] stage=${stage}`);

const child = spawn(command, args, {
  cwd: worktreeDir,
  stdio: 'inherit',
  shell: false,
  windowsHide: false,
  env: process.env,
});

child.on('error', (error) => {
  console.error(`[MINIMAX_BUILDER] launch failed: ${error.message}`);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`[MINIMAX_BUILDER] exited via signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});
