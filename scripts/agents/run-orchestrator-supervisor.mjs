#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const args = process.argv.slice(2);

function valueOf(flag, fallback) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function numberOf(flag, fallback) {
  const parsed = Number(valueOf(flag, String(fallback)));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const hours = numberOf('--hours', 8);
const maxCycles = Math.max(1, Math.floor(numberOf('--max-cycles', 40)));
const activePollSeconds = numberOf('--active-poll-seconds', 60);
const actionPollSeconds = numberOf('--action-poll-seconds', 45);
const externalWaitSeconds = numberOf('--external-wait-seconds', 180);
const errorWaitSeconds = numberOf('--error-wait-seconds', 120);
const maxConsecutiveErrors = Math.max(1, Math.floor(numberOf('--max-errors', 3)));
const maxCycleMinutes = numberOf('--max-cycle-minutes', 20);
const model = valueOf('--model', 'gpt-5.6-luna');
const effort = valueOf('--effort', 'low');

const configPath = path.join(root, 'agent-work', 'orchestrator', 'config.json');
const promptPath = path.join(root, 'agent-work', 'orchestrator', 'CODEX_CYCLE_PROMPT.md');
const statusPath = path.join(root, '.playtest', 'orchestrator', 'status.json');
const lastMessageRel = path.join('.playtest', 'orchestrator', 'supervisor-last-message.txt');
const lastMessagePath = path.join(root, lastMessageRel);
const supervisorLogPath = path.join(root, '.playtest', 'orchestrator', 'supervisor.log');

await mkdir(path.dirname(supervisorLogPath), { recursive: true });

let config;
let basePrompt;
try {
  [config, basePrompt] = await Promise.all([
    readFile(configPath, 'utf8').then(JSON.parse),
    readFile(promptPath, 'utf8'),
  ]);
} catch (error) {
  console.error(`[ORCH/SUPERVISOR] bootstrap failed: ${error.message}`);
  process.exit(1);
}

const startedAt = Date.now();
const deadline = startedAt + hours * 60 * 60 * 1000;
let smartCycles = 0;
let consecutiveErrors = 0;
let stopped = false;
let currentControlChild = null;

function stamp() {
  return new Date().toISOString();
}

async function log(message) {
  const line = `[ORCH/SUPERVISOR ${stamp()}] ${message}`;
  console.log(line);
  try { await appendFile(supervisorLogPath, `${line}\n`, 'utf8'); } catch {}
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function remainingText() {
  const ms = Math.max(0, deadline - Date.now());
  const hoursLeft = ms / 3_600_000;
  return `${hoursLeft.toFixed(2)}h remaining`;
}

function refreshStatus() {
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
  return readFile(statusPath, 'utf8').then(JSON.parse);
}

function currentStageActiveWorkers(snapshot) {
  const stage = snapshot?.loop?.currentStage || null;
  return Object.entries(snapshot?.workers || {})
    .filter(([, worker]) => worker?.runtime?.classification === 'RUNNING'
      && (!worker.runtime.stage || worker.runtime.stage === stage))
    .map(([id]) => id);
}

function terminalState(snapshot) {
  if (snapshot?.loop?.status === 'complete') return 'COMPLETE';
  if (snapshot?.loop?.humanGate) return 'HUMAN_GATE';
  return null;
}

function markerFrom(text) {
  const match = String(text || '').match(/ORCH_CYCLE_STATE:\s*(ACTION_TAKEN|WAIT_EXTERNAL|HUMAN_GATE|COMPLETE|ERROR)/i);
  return match ? match[1].toUpperCase() : null;
}

function codexInvocation(codexArgs) {
  if (process.platform !== 'win32') {
    return { command: 'codex', args: codexArgs };
  }
  return {
    command: process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe',
    args: ['/d', '/s', '/c', 'codex', ...codexArgs],
  };
}

async function runCodexCycle(snapshot) {
  smartCycles += 1;
  await writeFile(lastMessagePath, '', 'utf8');

  const compactSnapshot = {
    generatedAt: snapshot?.generatedAt || null,
    canonicalSha: snapshot?.canonical?.sha || null,
    loop: snapshot?.loop || null,
    control: snapshot?.control || null,
    workers: Object.fromEntries(Object.entries(snapshot?.workers || {}).map(([id, worker]) => [id, {
      branch: worker.branch,
      sha: worker.sha,
      runtime: worker.runtime,
      evidenceStatus: worker.reportSignals?.evidenceStatus || null,
      candidateReady: Boolean(worker.candidateReady),
      worktreeClean: worker.worktree?.status?.clean ?? null,
      baseSha: worker.reportSignals?.baseSha || null,
      implementationSha: worker.reportSignals?.implementationSha || null,
    }])),
  };

  const prompt = `${basePrompt.trim()}\n\n## Snapshot inicial del supervisor\n\nEsta sesión es efímera y corresponde al ciclo inteligente ${smartCycles}/${maxCycles}. El supervisor seguirá corriendo después de que termines. No te quedes esperando procesos externos.\n\n\`\`\`json\n${JSON.stringify(compactSnapshot, null, 2)}\n\`\`\`\n`;

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

  await log(`smart cycle ${smartCycles}/${maxCycles}: launching Codex ${model}/${effort} stage=${snapshot?.loop?.currentStage || 'unknown'}`);

  return await new Promise((resolve) => {
    let settled = false;
    let timeout = null;
    let child;

    const finish = async (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      currentControlChild = null;
      let lastMessage = '';
      try { lastMessage = await readFile(lastMessagePath, 'utf8'); } catch {}
      resolve({ ...result, lastMessage, marker: markerFrom(lastMessage) });
    };

    try {
      child = spawn(invocation.command, invocation.args, {
        cwd: root,
        stdio: ['pipe', 'inherit', 'inherit'],
        shell: false,
        windowsHide: false,
      });
      currentControlChild = child;
    } catch (error) {
      void finish({ ok: false, error: error.message, code: null, signal: null });
      return;
    }

    child.on('error', (error) => {
      void finish({ ok: false, error: error.message, code: null, signal: null });
    });

    child.on('exit', (code, signal) => {
      void finish({ ok: !signal && code === 0, error: null, code, signal });
    });

    timeout = setTimeout(() => {
      if (settled) return;
      // Safety first: do not taskkill the whole tree because the orchestrator may
      // already have dispatched an independent worker/reviewer. Stop the supervisor
      // rather than risk killing useful child work or launching duplicates.
      void finish({
        ok: false,
        error: `Codex control cycle exceeded ${maxCycleMinutes} minute(s); supervisor stopping conservatively`,
        code: null,
        signal: 'SUPERVISOR_TIMEOUT',
        fatal: true,
      });
    }, maxCycleMinutes * 60_000);

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

async function main() {
  await log(`START hours=${hours} maxCycles=${maxCycles} model=${model}/${effort} canonical=${config.canonicalBranch}`);

  while (!stopped && Date.now() < deadline && smartCycles < maxCycles) {
    let snapshot;
    try {
      snapshot = await refreshStatus();
      consecutiveErrors = 0;
    } catch (error) {
      consecutiveErrors += 1;
      await log(`status error ${consecutiveErrors}/${maxConsecutiveErrors}: ${error.message}`);
      if (consecutiveErrors >= maxConsecutiveErrors) {
        await log('STOP circuit breaker: repeated status errors');
        break;
      }
      await sleep(errorWaitSeconds * 1000);
      continue;
    }

    const terminal = terminalState(snapshot);
    if (terminal === 'COMPLETE') {
      await log(`COMPLETE stage=${snapshot.loop?.currentStage || 'unknown'}`);
      break;
    }
    if (terminal === 'HUMAN_GATE') {
      await log(`HUMAN_GATE ${JSON.stringify(snapshot.loop?.humanGate)}`);
      break;
    }

    const activeWorkers = currentStageActiveWorkers(snapshot);
    if (activeWorkers.length > 0) {
      await log(`mechanical wait: current-stage worker(s) RUNNING=${activeWorkers.join(', ')}; ${remainingText()}`);
      await sleep(activePollSeconds * 1000);
      continue;
    }

    const result = await runCodexCycle(snapshot);
    await log(`cycle result ok=${result.ok} marker=${result.marker || 'NONE'} code=${result.code ?? 'null'} signal=${result.signal || 'none'}`);

    if (result.lastMessage?.trim()) {
      const compact = result.lastMessage.trim().split(/\r?\n/).slice(-12).join(' | ');
      await log(`last: ${compact}`);
    }

    if (result.fatal) {
      await log(`STOP conservative timeout: ${result.error}`);
      break;
    }

    if (!result.ok || result.marker === 'ERROR') {
      consecutiveErrors += 1;
      await log(`control error ${consecutiveErrors}/${maxConsecutiveErrors}: ${result.error || `exit ${result.code}`}`);
      if (consecutiveErrors >= maxConsecutiveErrors) {
        await log('STOP circuit breaker: repeated control-cycle errors');
        break;
      }
      await sleep(errorWaitSeconds * 1000);
      continue;
    }

    consecutiveErrors = 0;
    if (result.marker === 'COMPLETE' || result.marker === 'HUMAN_GATE') {
      await log(`STOP marker=${result.marker}; refreshing durable state on next manual run if needed`);
      break;
    }

    const waitSeconds = result.marker === 'WAIT_EXTERNAL'
      ? externalWaitSeconds
      : actionPollSeconds;
    await log(`sleep ${waitSeconds}s after ${result.marker || 'unmarked successful cycle'}; ${remainingText()}`);
    await sleep(waitSeconds * 1000);
  }

  if (Date.now() >= deadline) await log(`STOP time budget reached (${hours}h)`);
  else if (smartCycles >= maxCycles) await log(`STOP smart-cycle budget reached (${maxCycles})`);
  await log(`END smartCycles=${smartCycles}`);
}

process.on('SIGINT', () => {
  stopped = true;
  console.warn('\n[ORCH/SUPERVISOR] Ctrl+C: stopping supervisor. External workers/reviewers are intentionally left untouched.');
  if (currentControlChild) {
    try { currentControlChild.stdin.end(); } catch {}
  }
});

await main();
