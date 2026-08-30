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

const worktreeArg = valueOf('--worktree', path.resolve(root, '../Roxana-gemini'));
const worktreeDir = path.resolve(root, worktreeArg);
const model = valueOf('--model', 'gemini-3.7-flash-high');
const effort = valueOf('--effort', 'high');
const timeout = valueOf('--timeout', '45m');
const taskArg = valueOf('--task', 'agent-work/tasks/workers/ohmdal-authored-primary-gemini.md');
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

const taskPath = path.resolve(worktreeDir, taskArg);
let taskContent = '';
try {
  taskContent = await readFile(taskPath, 'utf8');
} catch (err) {
  log(`Warning: could not read task file at ${taskPath}: ${err.message}`);
}

const prompt = `
Follow GEMINI.md in this repository.

You are the Primary Authored Builder for Proyecto Roxana.
Harness: Antigravity CLI. Model: ${model}. Effort: ${effort}. Mode: workspace-write.
You are running in the isolated worktree Roxana-gemini on branch worker/gemini-authored.

Execute your worker task: ${taskArg}
Inspect agent-work/loops/ohmdal-arco1-authored-pass/state.json to identify the active stage: a5-forge-terraces-authored.

TASK DETAILS:
${taskContent}

CRITICAL EXECUTION RULES:
1. Complete the A5 Forja/Terrazas authored pass in this worktree.
2. Verify all gates:
   npm run loop:ohmdal-arco1-authored:validate
   npm run build
   npm test
   npm run visual:ohmdal-plaza:fast -- --stage a5-forge-terraces-authored
   npm run playtest:ohmdal-golden-path
3. Commit your implementation changes to branch worker/gemini-authored.
4. Record your evidence in agent-work/reports/workers/ohmdal-authored-gemini-current.md adhering strictly to Candidate Protocol v2 machine-readable headers:
   CANDIDATE_MODE: implementation
   BASE_SHA: <40-hex base commit SHA>
   IMPLEMENTATION_SHA: <40-hex commit SHA of your implementation>
   EVIDENCE_STATUS: PASS
   SELF_ACCEPTANCE: false
5. Commit the report and push worker/gemini-authored to origin.
6. Stop after pushing evidence. Do not begin A6.
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
