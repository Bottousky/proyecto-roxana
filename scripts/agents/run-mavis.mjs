#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline';

const root = process.cwd();
const safeMode = process.argv.includes('--safe');
const onceMode = process.argv.includes('--once');
const configPath = path.join(root, 'agent-work', 'orchestrator', 'config.json');
const loopPath = path.join(root, 'agent-work', 'loops', 'ohmdal-arco1-authored-pass', 'state.json');

let pollMinutes = 7;
try {
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  if (Number.isFinite(config.pollMinutes) && config.pollMinutes > 0) {
    pollMinutes = config.pollMinutes;
  }
} catch {
  // Keep the launcher usable even if config parsing temporarily fails.
}

const command = process.platform === 'win32' ? 'agy.cmd' : 'agy';
const args = [
  '--input-format', 'stream-json',
  '--output-format', 'stream-json',
  '--agent', 'mavis',
  '--model', 'gemini-3.7-flash-medium',
  '--effort', 'medium',
];

if (!safeMode) {
  args.push('--dangerously-skip-permissions');
  console.warn('[MAVIS] FULL PERMISSIONS ENABLED: Antigravity will auto-approve all tool calls for this session.');
  console.warn('[MAVIS] Repo-level rules still forbid force-push, destructive resets, secret access and unapproved paid spend.');
} else {
  console.warn('[MAVIS] SAFE MODE: Antigravity permission policy remains enabled.');
}

console.warn(`[MAVIS] CONTINUOUS CONTROL LOOP enabled. Poll interval while waiting: ${pollMinutes} minute(s).`);
console.warn('[MAVIS] Ctrl+C stops the daemon. A normal model turn ending does NOT stop Mavis.');

const child = spawn(command, args, {
  cwd: root,
  stdio: ['pipe', 'pipe', 'inherit'],
  shell: false,
  windowsHide: false,
});

let stopped = false;
let waitingTimer = null;
let turn = 0;

const bootstrapPrompt = `
You are Mavis, the operational orchestrator for Proyecto Roxana.
Execute agent-work/tasks/orchestrator/ohmdal-authored-mavis.md and use the repository as source of truth.

This process is a persistent control loop. The wrapper will send you another turn after each result, so do not treat a normal final response as the end of orchestration.

CRITICAL AUTONOMY RULE:
- Never finish a turn merely by describing an immediately executable next action.
- If the next safe action is dispatching a worker, launching a reviewer, running gates, integrating an unambiguous PASS, updating state, committing or pushing, EXECUTE IT before returning.
- Only return WAITING when progress genuinely depends on an already-running worker/process/evidence that is not ready yet.
- Do not duplicate active workers.
- Escalate only a real HUMAN_GATE defined by repo governance.

At the end of every turn include exactly one marker on its own line:
MAVIS_TICK_STATE: CONTINUE
or
MAVIS_TICK_STATE: WAITING
or
MAVIS_TICK_STATE: HUMAN_GATE
or
MAVIS_TICK_STATE: COMPLETE

Use CONTINUE when another safe action is immediately executable after this turn.
Use WAITING only when there is genuinely nothing safe to do until external evidence/process state changes.
Start by running npm run orchestrator:status and continue from the current canonical stage now.
`.trim();

const followupPrompt = `
AUTONOMOUS MAVIS CONTROL TICK.
Re-read compact repo state with npm run orchestrator:status and continue agent-work/tasks/orchestrator/ohmdal-authored-mavis.md from the current canonical state.

Do not merely report the next action if it is immediately executable: execute it now. Dispatch workers/reviewers, run gates, integrate mechanical PASS candidates, advance state and push when the repo contract allows it. Do not duplicate active workers. Stop only for a real HUMAN_GATE or loop COMPLETE.

Finish with exactly one marker:
MAVIS_TICK_STATE: CONTINUE | WAITING | HUMAN_GATE | COMPLETE
(one concrete value, not the whole list).
`.trim();

function sendPrompt(content) {
  if (stopped || child.killed || !child.stdin.writable) return;
  turn += 1;
  console.warn(`\n[MAVIS] >>> control tick ${turn}`);
  child.stdin.write(`${JSON.stringify({ event: 'user', message: { content } })}\n`);
}

async function readLoopTerminalState() {
  try {
    const state = JSON.parse(await readFile(loopPath, 'utf8'));
    return {
      complete: state.status === 'complete',
      humanGate: state.humanGate ?? null,
      stage: state.currentStage ?? null,
    };
  } catch {
    return { complete: false, humanGate: null, stage: null };
  }
}

function markerFrom(response) {
  const match = response.match(/MAVIS_TICK_STATE:\s*(CONTINUE|WAITING|HUMAN_GATE|COMPLETE)/i);
  return match ? match[1].toUpperCase() : null;
}

function scheduleNext(delayMs, reason) {
  if (stopped || onceMode) {
    child.stdin.end();
    return;
  }
  clearTimeout(waitingTimer);
  console.warn(`[MAVIS] Next control tick in ${Math.round(delayMs / 1000)}s (${reason}).`);
  waitingTimer = setTimeout(() => sendPrompt(followupPrompt), delayMs);
}

const rl = readline.createInterface({ input: child.stdout });

rl.on('line', async (line) => {
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    if (line.trim()) console.log(line);
    return;
  }

  if (event.event === 'init') {
    const init = event.init || {};
    console.warn(`[MAVIS] Antigravity stream active: model=${init.model || 'pinned'} agent=${init.agent || 'mavis'} permission=${init.permission_mode || 'unknown'}`);
    return;
  }

  if (event.event === 'step_update') {
    const step = event.step_update || {};
    if (step.step_type === 'tool' && step.state === 'ACTIVE' && step.tool_name) {
      console.warn(`[MAVIS] tool: ${step.tool_name}`);
    }
    return;
  }

  if (event.event !== 'result') return;

  const result = event.result || {};
  const response = String(result.response || '').trim();
  if (response) {
    console.log(`\n${response}\n`);
  }

  const repoState = await readLoopTerminalState();
  if (repoState.complete) {
    console.warn(`[MAVIS] Loop COMPLETE at stage ${repoState.stage || 'unknown'}.`);
    stopped = true;
    child.stdin.end();
    return;
  }
  if (repoState.humanGate) {
    console.warn(`[MAVIS] HUMAN_GATE recorded in repo: ${JSON.stringify(repoState.humanGate)}`);
    stopped = true;
    child.stdin.end();
    return;
  }

  const marker = markerFrom(response);
  if (marker === 'COMPLETE' || marker === 'HUMAN_GATE') {
    stopped = true;
    child.stdin.end();
    return;
  }

  if (result.status && result.status !== 'SUCCESS') {
    scheduleNext(60_000, `Antigravity result=${result.status}; retry sensor tick`);
    return;
  }

  if (marker === 'WAITING') {
    scheduleNext(pollMinutes * 60_000, 'waiting for worker/evidence');
    return;
  }

  if (marker === 'CONTINUE') {
    scheduleNext(2_000, 'immediately executable next action');
    return;
  }

  // Fail-safe: a model that forgets the marker must never silently stop the factory.
  scheduleNext(10_000, 'missing tick marker; fail-safe continuation');
});

child.on('error', (error) => {
  console.error(`[MAVIS] Failed to launch Antigravity CLI: ${error.message}`);
  if (process.platform === 'win32') {
    console.error('[MAVIS] Expected agy.cmd on PATH. Verify `Get-Command agy`.');
  }
  process.exit(1);
});

child.on('exit', (code, signal) => {
  clearTimeout(waitingTimer);
  if (!stopped && signal) {
    console.error(`[MAVIS] Antigravity exited via signal ${signal}.`);
    process.exit(1);
  }
  if (!stopped && code !== 0) {
    console.error(`[MAVIS] Antigravity exited unexpectedly with code ${code}.`);
    process.exit(code ?? 1);
  }
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  console.warn('\n[MAVIS] Ctrl+C received. Stopping continuous control loop...');
  stopped = true;
  clearTimeout(waitingTimer);
  try { child.stdin.end(); } catch {}
  try { child.kill('SIGINT'); } catch {}
});

sendPrompt(bootstrapPrompt);
