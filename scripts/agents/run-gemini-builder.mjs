#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createWriteStream, mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline';

const root = process.cwd();
const args = process.argv.slice(2);

function valueOf(flag, fallback = null) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

let orchestratorConfig = {};
try {
  orchestratorConfig = JSON.parse(await readFile(path.join(root, 'agent-work', 'orchestrator', 'config.json'), 'utf8'));
} catch {
  // Explicit CLI args and historical defaults keep this runner usable.
}

const configuredWorkers = Object.values(orchestratorConfig.workers || {});
const configuredGeminiWorker = configuredWorkers.find((worker) => String(worker.task || '').includes('gemini')) || configuredWorkers[0] || {};

const configuredWorktree = configuredGeminiWorker.worktreeHint
  ? path.resolve(root, configuredGeminiWorker.worktreeHint)
  : path.resolve(root, '../Roxana-gemini');
const worktreeArg = valueOf('--worktree', configuredWorktree);
const worktreeDir = path.resolve(root, worktreeArg);
const model = valueOf('--model', configuredGeminiWorker.model || 'gemini-3.8-flash-high');
const effort = valueOf('--effort', configuredGeminiWorker.effort || 'high');
const timeout = valueOf('--timeout', '45m');
const taskArg = valueOf('--task', configuredGeminiWorker.task || 'agent-work/tasks/workers/ohmdal-authored-primary-gemini.md');
const loopArg = valueOf('--loop', orchestratorConfig.activeLoop || 'agent-work/loops/ohmdal-arco1-authored-pass/state.json');
const workerBranch = valueOf('--branch', configuredGeminiWorker.branch || 'worker/gemini-authored');
const reportArg = valueOf('--report', configuredGeminiWorker.report || 'agent-work/reports/workers/ohmdal-authored-gemini-current.md');
const logArg = valueOf('--log', path.join(root, '.playtest', 'orchestrator', 'gemini-builder.log'));

const logDir = path.dirname(path.resolve(root, logArg));
mkdirSync(logDir, { recursive: true });
const logStream = createWriteStream(path.resolve(root, logArg), { flags: 'a' });

function log(msg) {
  const line = `[GEMINI_BUILDER ${new Date().toISOString()}] ${msg}\n`;
  process.stderr.write(line);
  logStream.write(line);
}

log(`Starting Gemini builder in ${worktreeDir}`);
log(`Model: ${model}, effort: ${effort}, task: ${taskArg}`);
log(`Loop: ${loopArg}, branch: ${workerBranch}, report: ${reportArg}`);

const taskPath = path.resolve(worktreeDir, taskArg);
let taskContent = '';
try {
  taskContent = await readFile(taskPath, 'utf8');
} catch (err) {
  log(`Warning: could not read task file at ${taskPath}: ${err.message}`);
}

const statePath = path.resolve(worktreeDir, loopArg);
let activeStage = 'unknown-stage';
try {
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  if (state.currentStage) activeStage = state.currentStage;
} catch (err) {
  log(`Warning: could not read loop state at ${statePath}: ${err.message}`);
}

const prompt = `
Follow GEMINI.md in this repository.

You are the primary implementation builder for the active Proyecto Roxana production loop.
Harness: Antigravity CLI. Model: ${model}. Effort: ${effort}. Mode: workspace-write.
You are running in an isolated worktree on branch ${workerBranch}.

Execute your worker task: ${taskArg}
Inspect ${loopArg} and implement exactly the active stage: ${activeStage}.

TASK DETAILS:
${taskContent}

CRITICAL EXECUTION RULES:
1. Complete exactly the current ${activeStage} candidate described by the task; do not skip ahead without orchestrator acceptance.
2. Run the task-required validation. At minimum validate the loop state, build and tests; run player-facing Golden Path/browser evidence when the task requires it.
3. Commit substantive implementation changes to branch ${workerBranch}.
4. Record evidence in ${reportArg} using Candidate Protocol v2 machine-readable headers:
   CANDIDATE_MODE: implementation|validation-only
   BASE_SHA: <exact 40-hex base commit SHA>
   IMPLEMENTATION_SHA: <exact 40-hex implementation SHA>|NONE
   EVIDENCE_STATUS: PASS|FAIL
   SELF_ACCEPTANCE: false
5. Commit the report and push ${workerBranch} to origin.
6. Stop after pushing evidence. Do not accept your own work or mutate canonical acceptance state.
`.trim();

const agyArgs = [
  '--input-format', 'stream-json',
  '--output-format', 'stream-json',
  '--model', model,
  '--effort', effort,
  '--print-timeout', timeout,
  '--dangerously-skip-permissions',
];

const command = process.platform === 'win32'
  ? (process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe')
  : 'agy';

const childArgs = process.platform === 'win32'
  ? ['/d', '/s', '/c', ['agy', ...agyArgs].join(' ')]
  : agyArgs;

log(`Spawning command: ${command} ${childArgs.join(' ')}`);

const child = spawn(command, childArgs, {
  cwd: worktreeDir,
  stdio: ['pipe', 'pipe', 'inherit'],
  shell: false,
  windowsHide: false,
});

const rl = readline.createInterface({ input: child.stdout });

rl.on('line', (line) => {
  logStream.write(`${line}\n`);
  try {
    const event = JSON.parse(line);
    if (event.event === 'init') {
      log(`Initialized session: model=${event.init?.model || model}`);
    } else if (event.event === 'step_update') {
      const step = event.step_update || {};
      if (step.step_type === 'tool' && step.state === 'ACTIVE') {
        log(`Tool call: ${step.tool_name}`);
      }
    } else if (event.event === 'result') {
      log(`Result status: ${event.result?.status}`);
      if (event.result?.response) {
        log(`Response:\n${event.result.response.slice(0, 1000)}...`);
      }
    }
  } catch {
    // Non-JSON stdout
  }
});

child.on('error', (err) => {
  log(`Process error: ${err.message}`);
});

child.on('exit', (code, signal) => {
  log(`Process exited with code=${code}, signal=${signal}`);
  logStream.end();
  process.exit(code ?? 0);
});

child.stdin.write(`${JSON.stringify({ event: 'user', message: { content: prompt } })}\n`);
child.stdin.end();
