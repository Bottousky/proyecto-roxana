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
const maxTickMinutes = Number.isFinite(runtime.maxTickMinutes) && runtime.maxTickMinutes > 0 ? runtime.maxTickMinutes : 20;
const configuredWorkers = Object.entries(config.workers || {})
  .map(([id, worker]) => ({ id, ...worker }))
  .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
const primaryWorker = configuredWorkers[0] || null;

await mkdir(path.dirname(lastMessagePath), { recursive: true });

let stopped = false;
let currentChild = null;
let timer = null;
let tickWatchdog = null;
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

function clearTickWatchdog() {
  clearTimeout(tickWatchdog);
  tickWatchdog = null;
}

function terminateProcessTree(child) {
  if (!child) return;
  if (process.platform === 'win32' && child.pid) {
    try {
      const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
      killer.unref();
      return;
    } catch {}
  }
  try { child.kill('SIGTERM'); } catch {}
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
  const primary = primaryWorker
    ? `${primaryWorker.id}: ${primaryWorker.model || primaryWorker.provider || 'configured worker'} via ${primaryWorker.runner || 'configured runner'}`
    : 'none configured';
  return `You are Mavis, the operational orchestrator for Proyecto Roxana.\n\nExecute ${activeTask}. Reconstruct durable state from the repository, especially ${activeLoop}; do not depend on conversational memory.\n\nThis is ${firstTick ? 'the first' : 'a fresh'} control tick in a resilient daemon. Start with npm run orchestrator:status. If the next action is safe and specified, execute it now: dispatch the configured worker, launch a fresh independent reviewer, run gates, integrate an unambiguous PASS, update state, commit/push, or advance the stage. Do not duplicate active workers. Do not self-approve builder work. Respect Git safety and all HUMAN_GATE rules.\n\nLive routing is authoritative. Primary configured worker: ${primary}. Read ${configPath.replaceAll('\\', '/')} and ${activeTask} every tick; do not rely on stale provider/quota assumptions from previous runs. A stale FAIL report or dirty worker worktree is not WAITING if a bounded repair or alternate clean worker can act now. Before returning WAITING, re-check that the worker process is still alive and that no newer report/commit has appeared; if the worker already finished, process its evidence in this tick instead.\n\nEnd with exactly one marker on its own line: MAVIS_TICK_STATE: CONTINUE, MAVIS_TICK_STATE: WAITING, MAVIS_TICK_STATE: HUMAN_GATE, or MAVIS_TICK_STATE: COMPLETE.`;
}

function codexInvocation(args) {
  if (process.platform !== 'win32') {
    return { command: 'codex', args, description: 'codex ...' };
  }
  const command = process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe';
  return {
    command,
    args: ['/d', '/s', '/c', 'codex', ...args],
    description: `${command} /d /s /c codex ...`,
  };
}

async function handleLaunchFailure(error) {
  consecutiveErrors += 1;
  console.error(`[MAVIS/CODEX] Launch failed: ${error.message} consecutive=${consecutiveErrors}/${maxConsecutiveErrors}`);
  if (consecutiveErrors >= maxConsecutiveErrors) {
    console.error('[MAVIS/CODEX] CIRCUIT BREAKER OPEN. Stopping instead of retrying forever. Repository state is preserved.');
    stopped = true;
    return;
  }
  schedule(60_000, 'recoverable Codex launcher error');
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
  const thisTick = tick;
  await writeFile(lastMessagePath, '', 'utf8');
  console.warn(`\n[MAVIS/CODEX] >>> control tick ${thisTick} model=${model} effort=${effort}`);

  const codexArgs = [
    'exec',
    '--model', model,
    '--ephemeral',
    '--color', 'never',
    '--output-last-message', lastMessageRel.replaceAll('\\', '/'),
    '--dangerously-bypass-approvals-and-sandbox',
    '-c', `model_reasoning_effort="${effort}"`,
    '-',
  ];
  const invocation = codexInvocation(codexArgs);
  if (process.platform === 'win32') {
    console.warn(`[MAVIS/CODEX] Windows launcher: ${invocation.description}`);
  }

  let stderr = '';
  let child;
  let watchdogExpired = false;
  try {
    child = spawn(invocation.command, invocation.args, {
      cwd: root,
      stdio: ['pipe', 'inherit', 'pipe'],
      shell: false,
      windowsHide: false,
    });
  } catch (error) {
    await handleLaunchFailure(error);
    return;
  }
  currentChild = child;

  clearTickWatchdog();
  tickWatchdog = setTimeout(() => {
    if (stopped || currentChild !== child) return;
    watchdogExpired = true;
    console.error(`[MAVIS/CODEX] Tick ${thisTick} exceeded ${maxTickMinutes} minute(s). Terminating the stuck Codex process tree and re-evaluating durable repo state.`);
    terminateProcessTree(child);
    currentChild = null;
    clearTickWatchdog();
    schedule(10_000, 'stuck control tick watchdog');
  }, maxTickMinutes * 60_000);

  child.stderr.on('data', (chunk) => {
    const text = String(chunk);
    stderr += text;
    process.stderr.write(text);
  });

  child.on('error', (error) => {
    stderr += `\n${error.message}`;
  });

  child.on('exit', async (code, signal) => {
    clearTickWatchdog();
    if (watchdogExpired) return;
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
  clearTickWatchdog();
  if (currentChild) {
    try { currentChild.stdin.end(); } catch {}
    terminateProcessTree(currentChild);
    currentChild = null;
  }
});

console.warn(`[MAVIS/CODEX] Active task: ${activeTask}`);
console.warn(`[MAVIS/CODEX] Active loop: ${activeLoop}`);
console.warn(`[MAVIS/CODEX] Primary worker: ${primaryWorker?.model || primaryWorker?.id || 'none'}`);
console.warn(`[MAVIS/CODEX] Circuit breaker: ${maxConsecutiveErrors} consecutive failures.`);
console.warn(`[MAVIS/CODEX] Tick watchdog: ${maxTickMinutes} minute(s).`);
void runTick(true);
