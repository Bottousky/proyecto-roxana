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

let pollMinutes = 7;
let activeLoop = 'agent-work/loops/ohmdal-arco1-authored-pass/state.json';
let activeTask = 'agent-work/tasks/orchestrator/ohmdal-authored-mavis.md';
try {
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  if (Number.isFinite(config.pollMinutes) && config.pollMinutes > 0) {
    pollMinutes = config.pollMinutes;
  }
  if (typeof config.activeLoop === 'string' && config.activeLoop.trim()) {
    activeLoop = config.activeLoop.trim();
  }
  if (typeof config.activeTask === 'string' && config.activeTask.trim()) {
    activeTask = config.activeTask.trim();
  }
} catch {
  // Keep the daemon usable even if config parsing temporarily fails.
}

const loopPath = path.join(root, activeLoop);

const agyArgs = [
  '--input-format', 'stream-json',
  '--output-format', 'stream-json',
  '--agent', 'mavis',
  '--model', 'gemini-3.7-flash-medium',
  '--effort', 'medium',
  '--print-timeout', '30m',
];

if (!safeMode) {
  agyArgs.push('--dangerously-skip-permissions');
  console.warn('[MAVIS] FULL PERMISSIONS ENABLED: Antigravity will auto-approve all tool calls for each control tick.');
  console.warn('[MAVIS] Repo-level rules still forbid force-push, destructive resets, secret access and unapproved paid spend.');
} else {
  console.warn('[MAVIS] SAFE MODE: Antigravity permission policy remains enabled.');
}

console.warn(`[MAVIS] RESILIENT CONTROL DAEMON enabled. Worker poll interval: ${pollMinutes} minute(s).`);
console.warn(`[MAVIS] Active task: ${activeTask}`);
console.warn(`[MAVIS] Active loop: ${activeLoop}`);
console.warn('[MAVIS] Each control tick gets a fresh Antigravity process; repo state is the durable memory.');
console.warn('[MAVIS] Ctrl+C stops the daemon. An Antigravity crash/error only restarts the next tick.');

const bootstrapPrompt = `
You are Mavis, the operational orchestrator for Proyecto Roxana.
Execute ${activeTask} and use the repository as the durable source of truth.

You are running inside a resilient control daemon. This Antigravity process is only ONE control tick and may be replaced by a fresh process on the next tick. Persist meaningful state in Git/reports/loop state, not conversational memory.

CRITICAL AUTONOMY RULE:
- Never finish merely by describing an immediately executable next action.
- If the next safe action is dispatching a worker, launching a reviewer, running gates, integrating an unambiguous PASS, updating state, committing or pushing, EXECUTE IT before returning.
- Only return WAITING when progress genuinely depends on an already-running worker/process/evidence that is not ready yet.
- Do not duplicate active workers.
- Escalate only a real HUMAN_GATE defined by repo governance.

At the end include exactly one marker on its own line:
MAVIS_TICK_STATE: CONTINUE
or
MAVIS_TICK_STATE: WAITING
or
MAVIS_TICK_STATE: HUMAN_GATE
or
MAVIS_TICK_STATE: COMPLETE

Start by running npm run orchestrator:status and continue from the current canonical stage now.
`.trim();

const followupPrompt = `
AUTONOMOUS MAVIS CONTROL TICK.
This is a fresh Antigravity process. Reconstruct state from the repository; do not depend on prior conversational memory.

Run npm run orchestrator:status and continue ${activeTask} from the current canonical state.

Do not merely report an immediately executable next action: execute it now. Dispatch workers/reviewers, run gates, integrate mechanical PASS candidates, advance state and push when repo governance allows it. Do not duplicate active workers. Stop only for a real HUMAN_GATE or loop COMPLETE.

Finish with exactly one concrete marker on its own line:
MAVIS_TICK_STATE: CONTINUE
or
MAVIS_TICK_STATE: WAITING
or
MAVIS_TICK_STATE: HUMAN_GATE
or
MAVIS_TICK_STATE: COMPLETE
`.trim();

let stopped = false;
let waitingTimer = null;
let currentChild = null;
let tick = 0;

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

function windowsInvocation() {
  const command = process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe';
  return {
    command,
    args: ['/d', '/s', '/c', ['agy', ...agyArgs].join(' ')],
    description: `${command} /d /s /c agy ...`,
  };
}

function nativeInvocation() {
  return { command: 'agy', args: agyArgs, description: 'agy ...' };
}

function scheduleNext(delayMs, reason) {
  if (stopped) return;
  if (onceMode) {
    console.warn(`[MAVIS] --once complete (${reason}).`);
    stopped = true;
    return;
  }
  clearTimeout(waitingTimer);
  console.warn(`[MAVIS] Next control tick in ${Math.round(delayMs / 1000)}s (${reason}).`);
  waitingTimer = setTimeout(() => {
    waitingTimer = null;
    void runTick(false);
  }, delayMs);
}

async function decideAfterTick({ response, resultStatus, exitCode, signal, launchError }) {
  const repoState = await readLoopTerminalState();
  if (repoState.complete) {
    console.warn(`[MAVIS] Loop COMPLETE at stage ${repoState.stage || 'unknown'}.`);
    stopped = true;
    return;
  }
  if (repoState.humanGate) {
    console.warn(`[MAVIS] HUMAN_GATE recorded in repo: ${JSON.stringify(repoState.humanGate)}`);
    stopped = true;
    return;
  }

  const marker = markerFrom(response || '');
  if (marker === 'COMPLETE' || marker === 'HUMAN_GATE') {
    stopped = true;
    return;
  }

  if (launchError) {
    scheduleNext(60_000, `Antigravity launch error: ${launchError}`);
    return;
  }

  if (signal) {
    scheduleNext(60_000, `Antigravity exited via signal ${signal}; fresh-process retry`);
    return;
  }

  if (resultStatus && resultStatus !== 'SUCCESS') {
    scheduleNext(60_000, `Antigravity result=${resultStatus}; fresh-process retry`);
    return;
  }

  // The Antigravity CLI has occasionally returned code 1 after emitting a useful
  // result. Treat process failure as recoverable transport failure, never as a
  // reason to kill the Mavis daemon. If we got a valid marker, trust the marker.
  if (marker === 'WAITING') {
    scheduleNext(pollMinutes * 60_000, 'waiting for worker/evidence');
    return;
  }
  if (marker === 'CONTINUE') {
    scheduleNext(2_000, 'immediately executable next action');
    return;
  }

  if (exitCode != null && exitCode !== 0) {
    scheduleNext(60_000, `Antigravity exit code ${exitCode}; fresh-process retry`);
    return;
  }

  // Fail-safe: missing marker must not silently stop the factory.
  scheduleNext(10_000, 'missing tick marker; fail-safe continuation');
}

async function runTick(firstTick) {
  if (stopped || currentChild) return;

  const preState = await readLoopTerminalState();
  if (preState.complete) {
    console.warn(`[MAVIS] Loop already COMPLETE at stage ${preState.stage || 'unknown'}.`);
    stopped = true;
    return;
  }
  if (preState.humanGate) {
    console.warn(`[MAVIS] HUMAN_GATE already recorded: ${JSON.stringify(preState.humanGate)}`);
    stopped = true;
    return;
  }

  tick += 1;
  console.warn(`\n[MAVIS] >>> control tick ${tick} (fresh Antigravity process)`);

  const invocation = process.platform === 'win32' ? windowsInvocation() : nativeInvocation();
  if (process.platform === 'win32') {
    console.warn(`[MAVIS] Windows launcher: ${invocation.description}`);
  }

  let child;
  try {
    child = spawn(invocation.command, invocation.args, {
      cwd: root,
      stdio: ['pipe', 'pipe', 'inherit'],
      shell: false,
      windowsHide: false,
    });
  } catch (error) {
    console.error(`[MAVIS] Failed to spawn Antigravity: ${error.message}`);
    await decideAfterTick({ response: '', resultStatus: null, exitCode: null, signal: null, launchError: error.message });
    return;
  }

  currentChild = child;
  let response = '';
  let resultStatus = null;
  let sawResult = false;
  let launchError = null;

  const rl = readline.createInterface({ input: child.stdout });

  rl.on('line', (line) => {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      if (line.trim()) console.log(line);
      return;
    }

    if (event.event === 'init') {
      const init = event.init || {};
      console.warn(`[MAVIS] Antigravity tick active: model=${init.model || 'pinned'} agent=${init.agent || 'mavis'} permission=${init.permission_mode || 'unknown'}`);
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

    sawResult = true;
    const result = event.result || {};
    resultStatus = result.status || null;
    response = String(result.response || '').trim();
    if (response) console.log(`\n${response}\n`);
  });

  child.on('error', (error) => {
    launchError = error.message;
    console.error(`[MAVIS] Antigravity process error: ${error.message}`);
  });

  child.on('exit', async (code, signal) => {
    rl.close();
    currentChild = null;
    if (!stopped) {
      if (code !== 0 && !sawResult) {
        console.error(`[MAVIS] Antigravity tick exited with code ${code ?? 'null'} before a result; daemon will recover.`);
      } else if (code !== 0) {
        console.warn(`[MAVIS] Antigravity tick exited with code ${code}; result was captured and daemon will continue safely.`);
      }
      await decideAfterTick({ response, resultStatus, exitCode: code, signal, launchError });
    }
  });

  const prompt = firstTick ? bootstrapPrompt : followupPrompt;
  child.stdin.write(`${JSON.stringify({ event: 'user', message: { content: prompt } })}\n`);
  // One prompt per Antigravity process. Closing stdin makes the CLI finish this
  // tick and exit; the daemon then starts a clean process for the next tick.
  child.stdin.end();
}

process.on('SIGINT', () => {
  console.warn('\n[MAVIS] Ctrl+C received. Stopping resilient control daemon...');
  stopped = true;
  clearTimeout(waitingTimer);
  waitingTimer = null;
  if (currentChild) {
    try { currentChild.stdin.end(); } catch {}
    try { currentChild.kill('SIGINT'); } catch {}
  }
});

void runTick(true);
