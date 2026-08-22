#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const args = process.argv.slice(2);

function valueOf(flag, fallback = null) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function has(flag) {
  return args.includes(flag);
}

function run(command, commandArgs, options = {}) {
  return spawnSync(command, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    shell: false,
    ...options,
  });
}

function workspaceFingerprint() {
  const status = run('git', ['status', '--porcelain=v1', '--untracked-files=all']);
  const diff = run('git', ['diff', '--binary', 'HEAD']);
  const staged = run('git', ['diff', '--binary', '--cached', 'HEAD']);
  if (status.status !== 0 || diff.status !== 0 || staged.status !== 0) return null;
  return createHash('sha256')
    .update(status.stdout)
    .update('\n--DIFF--\n')
    .update(diff.stdout)
    .update('\n--STAGED--\n')
    .update(staged.stdout)
    .digest('hex');
}

function printHelp() {
  console.log(`Roxana Antigravity peer runner\n\n` +
    `Check install/auth/models:\n` +
    `  node scripts/agents/run-antigravity.mjs --check\n\n` +
    `Run a read-only Gemini peer task:\n` +
    `  node scripts/agents/run-antigravity.mjs --task <task.md> --out <report.md> [--model <slug>] [--effort low|medium|high] [--timeout 10m]\n\n` +
    `The runner uses the local Antigravity CLI (agy) and cached Google sign-in. It never uses a Gemini API key.`);
}

if (has('--help') || has('-h')) {
  printHelp();
  process.exit(0);
}

if (has('--check')) {
  const models = run('agy', ['models']);
  if (models.error) {
    console.error('Antigravity CLI (agy) is missing or not runnable. See docs/80-production/AI_TOOLING.md.');
    process.exit(2);
  }
  if (models.status !== 0) {
    console.error(models.stderr.trim() || 'agy models failed. Launch `agy` interactively once and complete Google sign-in.');
    process.exit(3);
  }
  console.log(models.stdout.trim());
  process.exit(0);
}

const taskArg = valueOf('--task');
const outArg = valueOf('--out');
const model = valueOf('--model', process.env.ROXANA_GEMINI_MODEL || null);
const effort = valueOf('--effort', process.env.ROXANA_GEMINI_EFFORT || 'medium');
const timeout = valueOf('--timeout', '10m');

if (!taskArg || !outArg) {
  printHelp();
  process.exit(1);
}
if (!['low', 'medium', 'high'].includes(effort)) {
  console.error(`Invalid --effort ${effort}. Expected low|medium|high.`);
  process.exit(1);
}

const taskPath = path.resolve(root, taskArg);
const outPath = path.resolve(root, outArg);
const allowedReportRoot = path.resolve(root, 'agent-work/reports/gemini');
if (!(outPath === allowedReportRoot || outPath.startsWith(`${allowedReportRoot}${path.sep}`))) {
  console.error('Gemini peer reports must be written under agent-work/reports/gemini/.');
  process.exit(1);
}

let task;
try {
  task = await readFile(taskPath, 'utf8');
} catch (error) {
  console.error(`Cannot read task file: ${taskPath}`);
  console.error(error.message);
  process.exit(1);
}

const prompt = `Follow GEMINI.md in this repository.\n\n` +
  `You are a READ-ONLY peer/reviewer for Proyecto Roxana. Do not edit, create, delete, rename, or format repository files. Do not run shell commands. Do not inspect .env files, credential stores, auth profiles, home-directory secrets, tokens, or keys. Use repository files and visual artifacts only as evidence. Codex remains the technical authority.\n\n` +
  `Return the complete requested report in your final response only; a local wrapper will persist it. Cite repository paths and clearly separate facts, inferences, uncertainties, and blockers.\n\n` +
  `TASK FILE: ${path.relative(root, taskPath)}\n\n${task}`;

const before = workspaceFingerprint();
const agyArgs = ['-p', prompt, '--output-format', 'json', '--effort', effort, '--print-timeout', timeout, '--sandbox'];
if (model) agyArgs.push('--model', model);

const result = run('agy', agyArgs);
if (result.error || result.status !== 0) {
  console.error(result.stderr.trim() || result.error?.message || `agy exited ${result.status}`);
  process.exit(result.status || 4);
}

let envelope;
try {
  envelope = JSON.parse(result.stdout);
} catch {
  console.error('Antigravity returned non-JSON output; refusing to persist an unverifiable report.');
  console.error(result.stdout.slice(0, 2000));
  process.exit(5);
}

if (envelope.status !== 'SUCCESS' || typeof envelope.response !== 'string') {
  console.error(`Antigravity status=${envelope.status || 'UNKNOWN'}: ${envelope.error || 'no response'}`);
  process.exit(6);
}

const after = workspaceFingerprint();
if (before && after && before !== after) {
  console.error('Gemini peer task changed the workspace. Report was NOT persisted. Inspect `git diff` and revert/keep changes manually before retrying.');
  process.exit(7);
}

await mkdir(path.dirname(outPath), { recursive: true });
const meta = [
  '---',
  'generated_by: antigravity-cli',
  `task: ${path.relative(root, taskPath).replaceAll('\\', '/')}`,
  `model: ${model || 'antigravity-default'}`,
  `effort: ${effort}`,
  `generated_at: ${new Date().toISOString()}`,
  '---',
  '',
].join('\n');
await writeFile(outPath, `${meta}${envelope.response.trim()}\n`, 'utf8');

const usage = envelope.usage || {};
console.log(`Gemini peer report: ${path.relative(root, outPath)}`);
if (usage.total_tokens != null) console.log(`Antigravity reported tokens: ${usage.total_tokens}`);
