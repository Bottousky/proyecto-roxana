#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const args = process.argv.slice(2);

function valueOf(flag, fallback = null) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const workerId = valueOf('--worker');
if (!workerId) {
  console.error('Usage: node scripts/agents/dispatch-worker-detached.mjs --worker <workerId>');
  process.exit(2);
}

const allowedScripts = {
  geminiPlayerFacing: 'scripts/agents/run-gemini-builder.mjs',
  lunaPlayerFacing: 'scripts/agents/run-luna-builder.mjs',
  minimaxPlayerFacing: 'scripts/agents/run-minimax-builder.mjs',
};

const runnerScript = allowedScripts[workerId];
if (!runnerScript) {
  console.error(`Unsupported workerId: ${workerId}`);
  process.exit(2);
}

const config = JSON.parse(await readFile(path.join(root, 'agent-work', 'orchestrator', 'config.json'), 'utf8'));
const worker = config.workers?.[workerId];
if (!worker) {
  console.error(`Worker ${workerId} is not configured.`);
  process.exit(2);
}

const child = spawn(process.execPath, [runnerScript], {
  cwd: root,
  detached: true,
  stdio: 'ignore',
  windowsHide: true,
  shell: false,
});

child.unref();

console.log(JSON.stringify({
  dispatched: true,
  workerId,
  pid: child.pid || null,
  branch: worker.branch || null,
  model: worker.model || worker.provider || null,
  stageSource: config.activeLoop || null,
}));
