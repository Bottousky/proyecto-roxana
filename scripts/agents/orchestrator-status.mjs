#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

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

function reportSignals(content) {
  if (typeof content !== 'string') {
    return {
      selfAcceptanceFalse: false,
      candidateCommitMentioned: false,
      reportsGreenEvidence: false,
    };
  }
  return {
    selfAcceptanceFalse: /SELF_ACCEPTANCE\s*:\s*false/i.test(content),
    candidateCommitMentioned: /candidate(?:\s+commit)?(?:\s+sha)?\s*[:=]\s*`?[0-9a-f]{7,40}/i.test(content)
      || /candidate commit/i.test(content),
    reportsGreenEvidence: /\bPASS\b|\bgreen\b|22\/22|zero (?:console|page) errors?/i.test(content),
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

// Best-effort refresh. A network failure must not make the local sensor unusable.
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

for (const [workerId, worker] of Object.entries(config.workers || {})) {
  const localRef = `refs/heads/${worker.branch}`;
  const remoteRef = `refs/remotes/origin/${worker.branch}`;
  const resolved = resolveRef([localRef, remoteRef, worker.branch]);
  const relation = aheadBehind(canonical.ref, resolved?.ref || null);
  const report = fileAtRef(resolved?.ref || null, worker.report);
  const signals = reportSignals(report.content);
  const worktree = worktrees.find((item) => item.branch === worker.branch) || null;
  const wtStatus = worktreeStatus(worktree?.path || null);

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
    worktree: worktree
      ? { ...worktree, status: wtStatus }
      : null,
    blockedUntil: worker.blockedUntil || null,
    candidateReady: Boolean(
      resolved
      && relation.ahead != null
      && relation.ahead > 0
      && report.exists
      && signals.selfAcceptanceFalse
      && signals.candidateCommitMentioned
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

const snapshot = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  orchestrator: config.orchestratorId,
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
  workers: workerSnapshots,
  worktrees,
};

const outDir = path.join(root, '.playtest', 'orchestrator');
const outPath = path.join(outDir, 'status.json');
await mkdir(outDir, { recursive: true });
await writeFile(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

console.log(JSON.stringify(snapshot, null, 2));
console.error(`ORCHESTRATOR_STATUS ${path.relative(root, outPath)}`);
