#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const onceMode = process.argv.includes('--once');
const configPath = path.join(root, 'agent-work', 'orchestrator', 'config.json');
const statusPath = path.join(root, '.playtest', 'orchestrator', 'status.json');
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
const control = config.controlPlane || {};
const activeLoop = config.activeLoop;
const activeTask = config.activeTask;
const model = runtime.model || 'gpt-5.6-luna';
const effort = runtime.effort || 'low';
const maxConsecutiveErrors = Number.isInteger(runtime.maxConsecutiveErrors) ? runtime.maxConsecutiveErrors : 3;
const maxTickMinutes = Number.isFinite(runtime.maxTickMinutes) && runtime.maxTickMinutes > 0 ? runtime.maxTickMinutes : 8;
const activePollSeconds = Number(control.activePollSeconds || 45);
const idlePollSeconds = Number(control.idlePollSeconds || 15);
const postActionPollSeconds = Number(control.postActionPollSeconds || 10);
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
    void runTick();
  }, delayMs);
}

async function refreshSnapshot() {
  const result = spawnSync(process.execPath, ['scripts/agents/orchestrator-status.mjs'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'ignore', 'pipe'],
    timeout: 120_000,
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.error?.message || 'orchestrator-status failed').trim());
  }
  return JSON.parse(await readFile(statusPath, 'utf8'));
}

function classify(snapshot) {
  if (snapshot?.loop?.status === 'complete') return 'COMPLETE';
  if (snapshot?.loop?.humanGate) return 'HUMAN_GATE';
  if ((snapshot?.control?.passCandidates || []).length > 0) return 'PROCESS_PASS';
  if ((snapshot?.control?.activeWorkers || []).length > 0) return 'WAIT_ACTIVE';
  if ((snapshot?.control?.failedWorkers || []).length > 0) return 'REPAIR';
  return 'DISPATCH';
}

function workerSummary(snapshot) {
  return Object.entries(snapshot?.workers || {}).map(([id, worker]) => ({
    id,
    model: config.workers?.[id]?.model || null,
    runtime: worker.runtime?.classification || 'UNKNOWN',
    evidence: worker.reportSignals?.evidenceStatus || null,
    candidateReady: Boolean(worker.candidateReady),
    branch: worker.branch,
    sha: worker.sha,
    baseSha: worker.reportSignals?.baseSha || null,
    implementationSha: worker.reportSignals?.implementationSha || null,
    dirty: worker.worktree?.status?.clean === false,
  }));
}

function actionPrompt(action, snapshot) {
  const primary = primaryWorker
    ? `${primaryWorker.id}: ${primaryWorker.model || primaryWorker.provider || 'configured worker'} via ${primaryWorker.runner || 'configured runner'}`
    : 'none configured';
  const compact = {
    stage: snapshot?.loop?.currentStage || null,
    iteration: snapshot?.loop?.iteration ?? null,
    canonicalSha: snapshot?.canonical?.sha || null,
    action,
    activeWorkers: snapshot?.control?.activeWorkers || [],
    passCandidates: snapshot?.control?.passCandidates || [],
    failedWorkers: snapshot?.control?.failedWorkers || [],
    workers: workerSummary(snapshot),
  };

  return `You are Mavis, the cheap operational control plane for Proyecto Roxana.\n\nSTATE_MACHINE_ACTION: ${action}\nThis action was classified deterministically by the harness. Do not replace it with a different high-level action.\n\nDurable task: ${activeTask}\nDurable loop: ${activeLoop}\nPrimary configured worker: ${primary}\nCurrent machine snapshot:\n${JSON.stringify(compact, null, 2)}\n\nRead config/task/reports needed for this action only. Keep this control tick short and operational. Do not implement gameplay yourself. Do not wait for long-running workers inside this tick.\n\nAction rules:\n- DISPATCH: prepare/sync one safe isolated worker lane and start exactly one configured builder asynchronously. Prefer the primary Gemini lane. If a fresh provider attempt immediately proves quota/auth unavailable, start the permitted Luna fallback in the same tick. After a successful async launch, stop; do not poll the worker or tail logs repeatedly.\n- REPAIR: inspect the newest FAIL/ERROR/STALE evidence, create one bounded repair packet (max 5 fixes, max 1 structural fix), and start exactly one permitted worker asynchronously. Prefer Gemini when usable; use Luna when Gemini is quota-limited or the bounded Codex repair is cheaper. Do not wait for completion.\n- PROCESS_PASS: validate Candidate Protocol v2, ancestry, cleanliness and required gates. Launch/use a fresh independent reviewer that did not build the candidate. Only integrate mechanically if review and required gates are PASS. If review cannot finish safely inside this bounded tick, persist/launch the review rather than doing implementation work.\n\nNever return WAITING merely because you launched a worker: the outer state machine owns waiting. Never duplicate a RUNNING worker. Never self-approve builder work. Respect no-force/no-hard-reset/no-paid-spend/HUMAN_GATE rules. If a real human gate exists, record it in the loop state.\n\nEnd with one concise status line describing what you executed, then one marker: MAVIS_TICK_STATE: CONTINUE, MAVIS_TICK_STATE: HUMAN_GATE, or MAVIS_TICK_STATE: COMPLETE.`;
}

function codexInvocation(args) {
  if (process.platform !== 'win32') return { command: 'codex', args, description: 'codex ...' };
  const command = process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe';
  return {
    command,
    args: ['/d', '/s', '/c', 'codex', ...args],
    description: `${command} /d /s /c codex ...`,
  };
}

async function scheduleFromFreshState(reasonPrefix = 'fresh state') {
  let snapshot;
  try {
    snapshot = await refreshSnapshot();
  } catch (error) {
    consecutiveErrors += 1;
    console.error(`[MAVIS/CODEX] status refresh failed: ${error.message}`);
    if (consecutiveErrors >= maxConsecutiveErrors) {
      console.error('[MAVIS/CODEX] CIRCUIT BREAKER OPEN. Repository state is preserved.');
      stopped = true;
      return;
    }
    schedule(60_000, `${reasonPrefix}: status refresh retry`);
    return;
  }

  const next = classify(snapshot);
  console.warn(`[MAVIS/CODEX] State machine => ${next}`);
  if (next === 'COMPLETE') {
    console.warn(`[MAVIS/CODEX] Loop COMPLETE at ${snapshot.loop?.currentStage || 'unknown'}.`);
    stopped = true;
    return;
  }
  if (next === 'HUMAN_GATE') {
    console.warn(`[MAVIS/CODEX] HUMAN_GATE: ${JSON.stringify(snapshot.loop?.humanGate)}`);
    stopped = true;
    return;
  }
  if (next === 'WAIT_ACTIVE') {
    schedule(activePollSeconds * 1000, `${reasonPrefix}: worker runtime RUNNING`);
    return;
  }
  schedule(postActionPollSeconds * 1000, `${reasonPrefix}: ${next.toLowerCase()} remains executable`);
}

async function runTick() {
  if (stopped || currentChild) return;

  let snapshot;
  try {
    snapshot = await refreshSnapshot();
  } catch (error) {
    consecutiveErrors += 1;
    console.error(`[MAVIS/CODEX] Cannot refresh state: ${error.message}`);
    if (consecutiveErrors >= maxConsecutiveErrors) {
      console.error('[MAVIS/CODEX] CIRCUIT BREAKER OPEN. Repository state is preserved.');
      stopped = true;
      return;
    }
    schedule(60_000, 'recoverable status refresh error');
    return;
  }

  const action = classify(snapshot);
  console.warn(`\n[MAVIS/CODEX] State machine action=${action} stage=${snapshot.loop?.currentStage || 'unknown'}`);

  if (action === 'COMPLETE') {
    stopped = true;
    return;
  }
  if (action === 'HUMAN_GATE') {
    console.warn(`[MAVIS/CODEX] HUMAN_GATE: ${JSON.stringify(snapshot.loop?.humanGate)}`);
    stopped = true;
    return;
  }
  if (action === 'WAIT_ACTIVE') {
    const active = (snapshot.control?.activeWorkers || []).join(', ');
    console.warn(`[MAVIS/CODEX] Mechanical wait: active worker(s)=${active || 'unknown'}. No model tick spent.`);
    schedule(activePollSeconds * 1000, 'worker runtime RUNNING');
    return;
  }

  tick += 1;
  const thisTick = tick;
  await writeFile(lastMessagePath, '', 'utf8');
  console.warn(`[MAVIS/CODEX] >>> model control tick ${thisTick} action=${action} model=${model} effort=${effort}`);

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
  if (process.platform === 'win32') console.warn(`[MAVIS/CODEX] Windows launcher: ${invocation.description}`);

  let child;
  let watchdogExpired = false;
  try {
    child = spawn(invocation.command, invocation.args, {
      cwd: root,
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: false,
      windowsHide: false,
    });
  } catch (error) {
    consecutiveErrors += 1;
    console.error(`[MAVIS/CODEX] Launch failed: ${error.message}`);
    schedule(60_000, 'recoverable Codex launch error');
    return;
  }
  currentChild = child;

  clearTickWatchdog();
  tickWatchdog = setTimeout(() => {
    if (stopped || currentChild !== child) return;
    watchdogExpired = true;
    console.error(`[MAVIS/CODEX] Model tick ${thisTick} exceeded ${maxTickMinutes} minute(s). Killing only the control tick; worker processes remain independently tracked.`);
    terminateProcessTree(child);
    currentChild = null;
    clearTickWatchdog();
    schedule(idlePollSeconds * 1000, 'control tick watchdog');
  }, maxTickMinutes * 60_000);

  child.on('error', (error) => {
    console.error(`[MAVIS/CODEX] Process error: ${error.message}`);
  });

  child.on('exit', async (code, signal) => {
    clearTickWatchdog();
    if (watchdogExpired) return;
    currentChild = null;

    let lastMessage = '';
    try { lastMessage = await readFile(lastMessagePath, 'utf8'); } catch {}
    if (lastMessage.trim()) console.log(`\n${lastMessage.trim()}\n`);

    if (signal || code !== 0) {
      consecutiveErrors += 1;
      console.error(`[MAVIS/CODEX] Model tick failed code=${code ?? 'null'} signal=${signal || 'none'} consecutive=${consecutiveErrors}/${maxConsecutiveErrors}`);
      if (consecutiveErrors >= maxConsecutiveErrors) {
        console.error('[MAVIS/CODEX] CIRCUIT BREAKER OPEN. Repository state is preserved.');
        stopped = true;
        return;
      }
      schedule(60_000, 'recoverable model tick failure');
      return;
    }

    consecutiveErrors = 0;
    await scheduleFromFreshState(`after ${action}`);
  });

  child.stdin.write(actionPrompt(action, snapshot));
  child.stdin.end();
}

process.on('SIGINT', () => {
  console.warn('\n[MAVIS/CODEX] Ctrl+C received. Stopping control plane...');
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
console.warn(`[MAVIS/CODEX] Control plane: state-machine; model=${model}/${effort}`);
console.warn(`[MAVIS/CODEX] Primary worker: ${primaryWorker?.model || primaryWorker?.id || 'none'}`);
console.warn(`[MAVIS/CODEX] Worker TTL=${control.workerTtlMinutes || 90}m; active poll=${activePollSeconds}s; model tick watchdog=${maxTickMinutes}m.`);
void runTick();
