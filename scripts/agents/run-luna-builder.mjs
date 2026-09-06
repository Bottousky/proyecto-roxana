#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { evidenceStatusFromFile, writeWorkerRuntime } from './orchestrator-runtime.mjs';

const root = process.cwd();
const workerId = 'lunaPlayerFacing';
const config = JSON.parse(await readFile(path.join(root, 'agent-work', 'orchestrator', 'config.json'), 'utf8'));
const worker = config.workers?.[workerId];
if (!worker) throw new Error(`config.workers.${workerId} is missing`);

const worktreeDir = path.resolve(root, worker.worktreeHint || '../Roxana-luna-player-facing');
if (!existsSync(worktreeDir)) throw new Error(`Luna worktree does not exist: ${worktreeDir}`);

let stage = 'unknown';
try {
  const state = JSON.parse(await readFile(path.join(worktreeDir, config.activeLoop), 'utf8'));
  stage = state.currentStage || stage;
} catch {}

const model = worker.model || 'gpt-5.6-luna';
const effort = worker.effort || 'low';
const prompt = `Read and execute ${worker.task}. Active stage: ${stage}. Work only in branch ${worker.branch} based on origin/${config.canonicalBranch}. Implement exactly the current stage, run required gates, commit implementation, write Candidate Protocol v2 evidence to ${worker.report}, commit evidence, push, then stop. Never self-approve or advance canonical loop state.`;

const codexArgs = [
  'exec',
  '--model', model,
  '--ephemeral',
  '--color', 'never',
  '--dangerously-bypass-approvals-and-sandbox',
  '-c', `model_reasoning_effort="${effort}"`,
  '-',
];

function codexInvocation(args) {
  if (process.platform !== 'win32') return { command: 'codex', args, description: 'codex ...' };
  const command = process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe';
  return {
    command,
    args: ['/d', '/s', '/c', 'codex', ...args],
    description: `${command} /d /s /c codex ...`,
  };
}

console.warn(`[LUNA_BUILDER] worktree=${worktreeDir}`);
console.warn(`[LUNA_BUILDER] model=${model} effort=${effort} stage=${stage}`);
const invocation = codexInvocation(codexArgs);
if (process.platform === 'win32') console.warn(`[LUNA_BUILDER] Windows launcher: ${invocation.description}`);

await writeWorkerRuntime(root, workerId, {
  status: 'RUNNING',
  startedAt: new Date().toISOString(),
  finishedAt: null,
  stage,
  branch: worker.branch,
  model,
  effort,
  worktree: worktreeDir,
  report: worker.report,
  pid: process.pid,
  childPid: null,
  exitCode: null,
  signal: null,
  evidenceStatus: null,
  error: null,
});

let child;
let launchError = null;
try {
  child = spawn(invocation.command, invocation.args, {
    cwd: worktreeDir,
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: false,
    windowsHide: false,
  });
  await writeWorkerRuntime(root, workerId, { childPid: child.pid || null });
} catch (error) {
  launchError = error;
  await writeWorkerRuntime(root, workerId, {
    status: 'ERROR',
    finishedAt: new Date().toISOString(),
    error: error.message,
  });
  console.error(`[LUNA_BUILDER] launch failed synchronously: ${error.message}`);
  process.exit(1);
}

child.on('error', (error) => {
  launchError = error;
  console.error(`[LUNA_BUILDER] launch failed: ${error.message}`);
});

child.on('exit', async (code, signal) => {
  const reportFile = path.join(worktreeDir, worker.report);
  const evidenceStatus = await evidenceStatusFromFile(reportFile);
  let status = 'FINISHED';
  if (evidenceStatus === 'PASS') status = 'PASS';
  else if (evidenceStatus === 'FAIL') status = 'FAIL';
  else if (launchError || signal || (code ?? 0) !== 0) status = 'ERROR';

  await writeWorkerRuntime(root, workerId, {
    status,
    finishedAt: new Date().toISOString(),
    exitCode: code ?? null,
    signal: signal || null,
    evidenceStatus,
    error: launchError?.message || null,
  });

  if (signal) process.exit(1);
  process.exit(code ?? 0);
});

child.stdin.write(prompt);
child.stdin.end();
