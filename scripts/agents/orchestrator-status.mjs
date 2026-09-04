#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { classifyWorkerRuntime, readWorkerRuntime } from './orchestrator-runtime.mjs';

const root = process.cwd();
const configPath = path.join(root, 'agent-work', 'orchestrator', 'config.json');

function runGit(args, cwd = root) {
  return spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout: 30_000,
    shell: false,
  });
}

function text(result) {
  return (result.stdout || '').trim();
}

function resolveRef(candidates) {
  for (const candidate of candidates) {
    const result = runGit(['rev-parse', '--verify', candidate]);
    if (result.status === 0) return { ref: candidate, sha: text(result) };
  }
  return null;
}

function fileAtRef(ref, filePath) {
  if (!ref) return { exists: false, content: null };
  const spec = `${ref}:${filePath.replaceAll('\\', '/')}`;
  const exists = runGit(['cat-file', '-e', spec]);
  if (exists.status !== 0) return { exists: false, content: null };
  const shown = runGit(['show', spec]);
  return shown.status === 0
    ? { exists: true, content: shown.stdout }
    : { exists: true, content: null };
}

function aheadBehind(baseRef, workerRef) {
  if (!baseRef || !workerRef) return { ahead: null, behind: null };
  const result = runGit(['rev-list', '--left-right', '--count', `${baseRef}...${workerRef}`]);
  if (result.status !== 0) return { ahead: null, behind: null };
  const [baseOnly, workerOnly] = text(result).split(/\s+/).map(Number);
  return { ahead: workerOnly, behind: baseOnly };
}

function latestCommit(ref) {
  if (!ref) return null;
  const result = runGit(['log', '-1', '--format=%H%x09%s', ref]);
  if (result.status !== 0) return null;
  const [sha, ...subject] = text(result).split('\t');
  return { sha, subject: subject.join('\t') };
}

function isAncestor(ancestor, descendant) {
  if (!ancestor || !descendant) return false;
  return runGit(['merge-base', '--is-ancestor', ancestor, descendant]).status === 0;
}

function changedFiles(baseSha, headSha) {
  if (!baseSha || !headSha) return [];
  const result = runGit(['diff', '--name-only', `${baseSha}..${headSha}`]);
  if (result.status !== 0) return [];
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

function parseWorktrees() {
  const result = runGit(['worktree', 'list', '--porcelain']);
  if (result.status !== 0) return [];
  const blocks = result.stdout.trim().split(/\r?\n\r?\n/).filter(Boolean);
  return blocks.map((block) => {
    const item = {};
    for (const line of block.split(/\r?\n/)) {
      const firstSpace = line.indexOf(' ');
      const key = firstSpace === -1 ? line : line.slice(0, firstSpace);
      const value = firstSpace === -1 ? true : line.slice(firstSpace + 1);
      item[key] = value;
    }
    const branch = typeof item.branch === 'string'
      ? item.branch.replace(/^refs\/heads\//, '')
      : null;
    return {
      path: item.worktree || null,
      head: item.HEAD || null,
      branch,
      detached: Boolean(item.detached),
      locked: item.locked || false,
      prunable: item.prunable || false,
    };
  });
}

function worktreeStatus(worktreePath) {
  if (!worktreePath) return null;
  const result = runGit(['status', '--porcelain=v1', '--untracked-files=all'], worktreePath);
  if (result.status !== 0) return { accessible: false, clean: null, entries: [] };
  const entries = result.stdout.split(/\r?\n/).filter(Boolean);
  return {
    accessible: true,
    clean: entries.length === 0,
    entries: entries.slice(0, 30),
    truncated: entries.length > 30,
  };
}

function field(content, name) {
  if (typeof content !== 'string') return null;
  const match = content.match(new RegExp(`^\\s*${name}\\s*:\\s*([^\\r\\n]+)`, 'im'));
  return match ? match[1].trim().replace(/^`|`$/g, '') : null;
}

function reportSignals(content) {
  const candidateMode = field(content, 'CANDIDATE_MODE');
  const baseSha = field(content, 'BASE_SHA');
  const implementationSha = field(content, 'IMPLEMENTATION_SHA');
  const evidenceStatus = field(content, 'EVIDENCE_STATUS');
  const selfAcceptance = field(content, 'SELF_ACCEPTANCE');
  return {
    protocolV2: ['implementation', 'validation-only'].includes(candidateMode || ''),
    candidateMode,
    baseSha,
    implementationSha,
    evidenceStatus,
    selfAcceptanceFalse: /^false$/i.test(selfAcceptance || ''),
    explicitPass: /^PASS$/i.test(evidenceStatus || ''),
  };
}

function validateCandidateProtocol({ canonicalSha, resolved, worker, report, signals }) {
  const reasons = [];
  if (!resolved) reasons.push('worker branch/ref missing');
  if (!report.exists) reasons.push('evidence report missing');
  if (!signals.protocolV2) reasons.push('report does not use candidate protocol v2');
  if (!signals.selfAcceptanceFalse) reasons.push('SELF_ACCEPTANCE:false missing');
  if (!signals.explicitPass) reasons.push('EVIDENCE_STATUS:PASS missing');
  if (!/^[0-9a-f]{40}$/i.test(signals.baseSha || '')) reasons.push('BASE_SHA must be exact 40-hex SHA');

  if (reasons.length > 0 || !resolved) return { ready: false, reasons, implementationFiles: [] };

  const baseSha = signals.baseSha;
  if (!isAncestor(baseSha, resolved.ref)) reasons.push('BASE_SHA is not an ancestor of worker branch');

  let implementationFiles = [];
  if (signals.candidateMode === 'implementation') {
    if (!/^[0-9a-f]{40}$/i.test(signals.implementationSha || '')) {
      reasons.push('IMPLEMENTATION_SHA must be exact 40-hex SHA for implementation candidate');
    } else {
      if (!isAncestor(baseSha, signals.implementationSha)) reasons.push('implementation SHA is not descended from BASE_SHA');
      if (!isAncestor(signals.implementationSha, resolved.ref)) reasons.push('implementation SHA is not contained in worker branch');
      implementationFiles = changedFiles(baseSha, signals.implementationSha);
      const substantive = implementationFiles.filter((file) => file !== worker.report);
      if (substantive.length === 0) reasons.push('implementation candidate has no substantive file delta beyond report');
    }
  } else if (signals.candidateMode === 'validation-only') {
    if (!/^NONE$/i.test(signals.implementationSha || '')) reasons.push('validation-only candidate requires IMPLEMENTATION_SHA:NONE');
    if (baseSha !== canonicalSha) reasons.push('validation-only BASE_SHA must equal current canonical SHA');
    const branchFiles = changedFiles(baseSha, resolved.ref);
    const outOfReport = branchFiles.filter((file) => file !== worker.report);
    if (outOfReport.length > 0) reasons.push(`validation-only branch contains non-report changes: ${outOfReport.join(', ')}`);
  }

  return {
    ready: reasons.length === 0,
    reasons,
    implementationFiles,
  };
}

let config;
try {
  config = JSON.parse(await readFile(configPath, 'utf8'));
} catch (error) {
  console.error(`Cannot read orchestrator config: ${configPath}`);
  console.error(error.message);
  process.exit(1);
}

const fetchResult = runGit(['fetch', 'origin', '--prune']);
const fetchOk = fetchResult.status === 0;

const canonical = resolveRef([
  `refs/remotes/origin/${config.canonicalBranch}`,
  `refs/heads/${config.canonicalBranch}`,
  config.canonicalBranch,
]);
if (!canonical) {
  console.error(`Cannot resolve canonical branch ${config.canonicalBranch}`);
  process.exit(2);
}

const canonicalStatusResult = runGit(['status', '--porcelain=v1', '--untracked-files=all']);
const canonicalEntries = canonicalStatusResult.status === 0
  ? canonicalStatusResult.stdout.split(/\r?\n/).filter(Boolean)
  : [];

const worktrees = parseWorktrees();
const workerSnapshots = {};
const ttlMinutes = Number(config.controlPlane?.workerTtlMinutes || 90);

for (const [workerId, worker] of Object.entries(config.workers || {})) {
  const localRef = `refs/heads/${worker.branch}`;
  const remoteRef = `refs/remotes/origin/${worker.branch}`;
  const resolved = resolveRef([localRef, remoteRef, worker.branch]);
  const relation = aheadBehind(canonical.ref, resolved?.ref || null);
  const report = fileAtRef(resolved?.ref || null, worker.report);
  const signals = reportSignals(report.content);
  const worktree = worktrees.find((item) => item.branch === worker.branch) || null;
  const wtStatus = worktreeStatus(worktree?.path || null);
  const protocol = validateCandidateProtocol({
    canonicalSha: canonical.sha,
    resolved,
    worker,
    report,
    signals,
  });
  const runtime = await readWorkerRuntime(root, workerId);
  const runtimeClassification = classifyWorkerRuntime(runtime, ttlMinutes);

  workerSnapshots[workerId] = {
    branch: worker.branch,
    ref: resolved?.ref || null,
    sha: resolved?.sha || null,
    latestCommit: latestCommit(resolved?.ref || null),
    aheadOfCanonical: relation.ahead,
    behindCanonical: relation.behind,
    expectedTask: worker.task,
    expectedReport: worker.report,
    reportExists: report.exists,
    reportSignals: signals,
    protocolValidation: protocol,
    worktree: worktree
      ? { ...worktree, status: wtStatus }
      : null,
    runtime: runtime
      ? { ...runtime, classification: runtimeClassification }
      : { classification: 'UNKNOWN' },
    active: runtimeClassification === 'RUNNING',
    stale: runtimeClassification === 'STALE',
    blockedUntil: worker.blockedUntil || null,
    candidateReady: Boolean(
      protocol.ready
      && runtimeClassification !== 'RUNNING'
      && (wtStatus == null || wtStatus.clean === true)
    ),
  };
}

let loopState = null;
try {
  loopState = JSON.parse(await readFile(path.join(root, config.activeLoop), 'utf8'));
} catch {
  // Keep sensor useful even if the state file is temporarily unavailable.
}

const activeWorkers = Object.entries(workerSnapshots)
  .filter(([, worker]) => worker.active)
  .map(([workerId]) => workerId);
const passCandidates = Object.entries(workerSnapshots)
  .filter(([, worker]) => worker.candidateReady)
  .map(([workerId]) => workerId);
const failedWorkers = Object.entries(workerSnapshots)
  .filter(([, worker]) => ['FAIL', 'ERROR', 'STALE'].includes(worker.runtime?.classification)
    || /^FAIL$/i.test(worker.reportSignals?.evidenceStatus || ''))
  .map(([workerId]) => workerId);

const snapshot = {
  schemaVersion: 3,
  generatedAt: new Date().toISOString(),
  orchestrator: config.orchestratorId,
  candidateProtocol: 'v2-explicit',
  canonical: {
    branch: config.canonicalBranch,
    ref: canonical.ref,
    sha: canonical.sha,
    latestCommit: latestCommit(canonical.ref),
    localWorktreeClean: canonicalStatusResult.status === 0 ? canonicalEntries.length === 0 : null,
    localWorktreeChanges: canonicalEntries.slice(0, 30),
  },
  fetch: {
    ok: fetchOk,
    error: fetchOk ? null : (fetchResult.stderr || fetchResult.error?.message || 'git fetch failed').trim(),
  },
  loop: loopState
    ? {
        status: loopState.status,
        currentStage: loopState.currentStage,
        iteration: loopState.iteration,
        humanGate: loopState.humanGate ?? null,
        queue: loopState.queue,
      }
    : null,
  control: {
    workerTtlMinutes: ttlMinutes,
    activeWorkers,
    passCandidates,
    failedWorkers,
  },
  workers: workerSnapshots,
  worktrees,
};

const outDir = path.join(root, '.playtest', 'orchestrator');
const outPath = path.join(outDir, 'status.json');
await mkdir(outDir, { recursive: true });
await writeFile(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

console.log(JSON.stringify(snapshot, null, 2));
console.error(`ORCHESTRATOR_STATUS ${path.relative(root, outPath)}`);
