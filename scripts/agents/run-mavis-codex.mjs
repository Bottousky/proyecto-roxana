#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const onceMode = process.argv.includes('--once');
const configPath = path.join(root, 'agent-work', 'orchestrator', 'config.json');
const lastMessageRel = path.join('.playtest', 'orchestrator', 'mavis-codex-last.txt');
const lastMessagePath = path.join(root, lastMessageRel);

let config;
try {
  config = JSON.parse(await readFile(configPath, 'utf8'));
} catch (error) {
  console.error(`[MAVIS/CODEX] Cannot read ${configPath}: ${error.message}`);
  process.exit(1);
}

const runtime = config.orchestratorRuntime || {};
const activeLoop = config.activeLoop;
const activeTask = config.activeTask;
const loopPath = path.join(root, activeLoop);
const pollMinutes = Number.isFinite(config.pollMinutes) && config.pollMinutes > 0 ? config.pollMinutes : 7;
const model = runtime.model || 'gpt-5.6-luna';
const effort = runtime.effort || 'low';
const maxConsecutiveErrors = Number.isInteger(runtime.maxConsecutiveErrors) ? runtime.maxConsecutiveErrors : 3;

await mkdir(path.dirname(lastMessagePath), { recursive: true });

let stopped = false;
let currentChild = null;
let timer = null;
let tick = 0;
let consecutiveErrors = 0;

function markerFrom(text) {
  const match = String(text || '').match(/MAVIS_TICK_STATE:\s*(CONTINUE|WAITING|HUMAN_GATE|COMPLETE)/i);
  return match ? match[1].toUpperCase() : null;
}

function terminalError(text) {
  const value = String(text || '').toLowerCase();
  return [
    'quota reached',
    'usage limit',
    'rate limit exceeded',
    'insufficient_quota',
    'authentication',
    'unauthorized',
    'forbidden',
    'please login',
  ].some((needle) => value.includes(needle));
}

async function repoState() {
  try {
    const state = JSON.parse(await readFile(loopPath, 'utf8'));
    return {
      complete: state.status === 'complete',
      humanGate: state.humanGate ?? null,
      stage: state.currentStage ?? null,
    };
  } catch (error) {
    return { complete: false, humanGate: null, stage: null, error: error.message };
  }
}

function schedule(delayMs, reason) {
  if (stopped) return;
  if (onceMode) {
    console.warn(`[MAVIS/CODEX] --once complete (${reason}).`);
    stopped = true;
    return;
  }
  clearTimeout(timer);
  console.warn(`[MAVIS/CODEX] Next control tick in ${Math.round(delayMs / 1000)}s (${reason}).`);
  timer = setTimeout(() => {
    timer = null;
    void runTick(false);
  }, delayMs);
}

function promptFor(firstTick) {
  return `You are Mavis, the operational orchestrator for Proyecto Roxana.\n\nExecute ${activeTask}. Reconstruct durable state from the repository, especially ${activeLoop}; do not depend on conversational memory.\n\nThis is ${firstTick ? 'the first' : 'a fresh'} control tick in a resilient daemon. Start with npm run orchestrator:status. If the next action is safe and specified, execute it now: dispatch the configured worker, launch a fresh independent reviewer, run gates, integrate an unambiguous PASS, update state, commit/push, or advance the stage. Do not duplicate active workers. Do not self-approve builder work. Respect Git safety and all HUMAN_GATE rules.\n\nImportant temporary routing: Gemini/Antigravity quota is exhausted. Follow the Codex Luna + MiniMax GMI/OpenCode routing in config/task. Do not invoke Antigravity while that routing is active.\n\nEnd with exactly one marker on its own line: MAVIS_TICK_STATE: CONTINUE, MAVIS_TICK_STATE: WAITING, MAVIS_TICK_STATE: HUMAN_GATE, or MAVIS_TICK_STATE: COMPLETE.`;
}

async function runTick(firstTick) {
  if (stopped || currentChild) return;

  const before = await repoState();
  if (before.complete) {
    console.warn(`[MAVIS/CODEX] Loop COMPLETE at ${before.stage || 'unknown'}.`);
    stopped = true;
    return;
  }
  if (before.humanGate) {
    console.warn(`[MAVIS/CODEX] HUMAN_GATE already recorded: ${JSON.stringify(before.humanGate)}`);
    stopped = true;
    return;
  }

  tick += 1;
  await writeFile(lastMessagePath, '', 'utf8');
  console.warn(`\n[MAVIS/CODEX] >>> control tick ${tick} model=${model} effort=${effort}`);

  const command = process.platform === 'win32' ? 'codex.cmd' : 'codex';
  const args = [
    'exec',
    '--model', model,
    '--ephemeral',
    '--color', 'never',
    '--output-last-message', lastMessageRel.replaceAll('\\', '/'),
    '--dangerously-bypass-approvals-and-sandbox',
    '-c', `model_reasoning_effort="${effort}"`,
    '-',
  ];

  let stderr = '';
  const child = spawn(command, args, {
    cwd: root,
    stdio: ['pipe', 'inherit', 'pipe'],
    shell: false,
    windowsHide: false,
  });
  currentChild = child;

  child.stderr.on('data', (chunk) => {
    const text = String(chunk);
    stderr += text;
    process.stderr.write(text);
  });

  child.on('error', (error) => {
    stderr += `\n${error.message}`;
  });

  child.on('exit', async (code, signal) => {
    currentChild = null;
    let lastMessage = '';
    try { lastMessage = await readFile(lastMessagePath, 'utf8'); } catch {}

    const after = await repoState();
    if (after.complete) {
      console.warn(`[MAVIS/CODEX] Loop COMPLETE at ${after.stage || 'unknown'}.`);
      stopped = true;
      return;
    }
    if (after.humanGate) {
      console.warn(`[MAVIS/CODEX] HUMAN_GATE recorded: ${JSON.stringify(after.humanGate)}`);
      stopped = true;
      return;
    }

    if (signal || code !== 0) {
      consecutiveErrors += 1;
      const reason = [stderr.trim(), lastMessage.trim()].filter(Boolean).join('\n');
      console.error(`[MAVIS/CODEX] Tick failed code=${code ?? 'null'} signal=${signal || 'none'} consecutive=${consecutiveErrors}/${maxConsecutiveErrors}`);
      if (reason) console.error(`[MAVIS/CODEX] Error detail:\n${reason.slice(-5000)}`);
      if (terminalError(reason) || consecutiveErrors >= maxConsecutiveErrors) {
        console.error('[MAVIS/CODEX] CIRCUIT BREAKER OPEN. Stopping instead of retrying forever. Repository state is preserved.');
        stopped = true;
        return;
      }
      schedule(60_000, 'recoverable Codex execution error');
      return;
    }

    consecutiveErrors = 0;
    if (lastMessage.trim()) console.log(`\n${lastMessage.trim()}\n`);
    const marker = markerFrom(lastMessage);
    if (marker === 'COMPLETE' || marker === 'HUMAN_GATE') {
      stopped = true;
      return;
    }
    if (marker === 'WAITING') {
      schedule(pollMinutes * 60_000, 'waiting for worker/evidence');
      return;
    }
    if (marker === 'CONTINUE') {
      schedule(2_000, 'immediately executable next action');
      return;
    }
    schedule(10_000, 'missing tick marker; fail-safe continuation');
  });

  child.stdin.write(promptFor(firstTick));
  child.stdin.end();
}

process.on('SIGINT', () => {
  console.warn('\n[MAVIS/CODEX] Ctrl+C received. Stopping daemon...');
  stopped = true;
  clearTimeout(timer);
  timer = null;
  if (currentChild) {
    try { currentChild.stdin.end(); } catch {}
    try { currentChild.kill('SIGINT'); } catch {}
  }
});

console.warn(`[MAVIS/CODEX] Active task: ${activeTask}`);
console.warn(`[MAVIS/CODEX] Active loop: ${activeLoop}`);
console.warn(`[MAVIS/CODEX] Circuit breaker: ${maxConsecutiveErrors} consecutive failures.`);
void runTick(true);
