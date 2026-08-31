#!/usr/bin/env node

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const DEFAULT_BASE_URL = 'https://api.gmi-serving.com/v1';
const DEFAULT_MODEL = 'MiniMaxAI/MiniMax-M3';
const REPORT_ROOT = path.resolve(ROOT, 'agent-work/reports/minimax-gmi');

function parseArgs(argv) {
  const args = { contexts: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--check') args.check = true;
    else if (token === '--task') args.task = argv[++index];
    else if (token === '--out') args.out = argv[++index];
    else if (token === '--model') args.model = argv[++index];
    else if (token === '--context') args.contexts.push(argv[++index]);
    else if (token === '--help' || token === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

function usage() {
  console.log(`Roxana GMI/MiniMax evaluation runner\n\nUsage:\n  node scripts/agents/run-gmi-minimax.mjs --check\n  node scripts/agents/run-gmi-minimax.mjs --task <task.md> --out <agent-work/reports/minimax-gmi/report.md> [--context <file>]... [--model <id>]\n\nEnvironment:\n  GMI_API_KEY              required (prefer repo-root .env.local)\n  GMI_BASE_URL             default ${DEFAULT_BASE_URL}\n  GMI_MINIMAX_MODEL        default ${DEFAULT_MODEL}\n  GMI_MAX_TOKENS           default 12000\n  GMI_MAX_CONTEXT_CHARS    default 300000\n`);
}

function parseEnvText(text) {
  const values = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const equals = line.indexOf('=');
    if (equals <= 0) continue;
    const key = line.slice(0, equals).trim();
    let value = line.slice(equals + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

async function loadLocalEnv() {
  // Evaluation convenience only. These files are gitignored; never print secret values.
  for (const relative of ['.env.local', '.env']) {
    const file = path.resolve(ROOT, relative);
    if (!existsSync(file)) continue;
    const parsed = parseEnvText(await readFile(file, 'utf8'));
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] == null) process.env[key] = value;
    }
  }
}

function requireKey() {
  const key = process.env.GMI_API_KEY;
  if (!key) {
    throw new Error('GMI_API_KEY is missing. Put it in repo-root .env.local or the process environment; never commit it.');
  }
  return key;
}

function config(args) {
  return {
    apiKey: requireKey(),
    baseUrl: String(process.env.GMI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    model: args.model || process.env.GMI_MINIMAX_MODEL || DEFAULT_MODEL,
    maxTokens: Number.parseInt(process.env.GMI_MAX_TOKENS || '12000', 10),
    maxContextChars: Number.parseInt(process.env.GMI_MAX_CONTEXT_CHARS || '300000', 10),
  };
}

async function apiFetch(url, options, apiKey) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  const bodyText = await response.text();
  let body;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = bodyText;
  }
  if (!response.ok) {
    const detail = typeof body === 'string' ? body.slice(0, 1200) : JSON.stringify(body)?.slice(0, 1200);
    throw new Error(`GMI request failed ${response.status}: ${detail}`);
  }
  return body;
}

async function check(args) {
  const cfg = config(args);
  const payload = await apiFetch(`${cfg.baseUrl}/models`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, cfg.apiKey);
  const models = Array.isArray(payload?.data) ? payload.data : [];
  const exact = models.find((entry) => entry?.id === cfg.model);
  const fallback = models.find((entry) => String(entry?.id || '').toLowerCase().includes('minimax-m3'));
  const found = exact || fallback;
  if (!found) throw new Error(`MiniMax M3 not found on this GMI key. Requested model=${cfg.model}`);
  console.log(`GMI_MINIMAX_CHECK PASS model=${found.id}`);
}

function resolveInput(relative, label) {
  if (!relative) throw new Error(`${label} is required`);
  const file = path.resolve(ROOT, relative);
  if (!existsSync(file)) throw new Error(`${label} does not exist: ${relative}`);
  return file;
}

function resolveReport(relative) {
  if (!relative) throw new Error('--out is required for task runs');
  const file = path.resolve(ROOT, relative);
  const rel = path.relative(REPORT_ROOT, file);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`MiniMax evaluation output must stay under agent-work/reports/minimax-gmi/: ${relative}`);
  }
  return file;
}

async function buildPrompt(args, cfg) {
  const taskFile = resolveInput(args.task, '--task');
  const task = await readFile(taskFile, 'utf8');
  const contexts = [];
  let chars = task.length;

  for (const relative of args.contexts) {
    const file = resolveInput(relative, '--context');
    const text = await readFile(file, 'utf8');
    chars += text.length;
    if (chars > cfg.maxContextChars) {
      throw new Error(`Task + contexts exceed GMI_MAX_CONTEXT_CHARS=${cfg.maxContextChars}. Distill context instead of dumping the repo.`);
    }
    contexts.push({ relative, text });
  }

  const contextBlock = contexts.length
    ? `\n\n## ATTACHED REPO CONTEXT\n${contexts.map(({ relative, text }) => `\n### ${relative}\n\n${text}`).join('\n')}`
    : '';

  return {
    taskFile: path.relative(ROOT, taskFile).replaceAll('\\', '/'),
    contextFiles: contexts.map(({ relative }) => relative.replaceAll('\\', '/')),
    user: `${task}${contextBlock}`,
  };
}

async function runTask(args) {
  const cfg = config(args);
  const outFile = resolveReport(args.out);
  const prompt = await buildPrompt(args, cfg);
  const started = Date.now();

  const payload = await apiFetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.2,
      max_tokens: cfg.maxTokens,
      messages: [
        {
          role: 'system',
          content: [
            'You are MiniMax M3 acting as a bounded Roxana production worker.',
            'Codex/Sol is the sole technical integrator and final authority.',
            'You have no filesystem or shell access in this lane. Never claim you ran tests or edited files.',
            'Work only from the task and attached context. Return concrete implementation material: reasoning summary, exact edits, unified diffs or complete file bodies as requested.',
            'Preserve canon and explicit constraints. Call out uncertainty instead of inventing lore.',
            'Prefer small, testable, reusable changes and exposed parameters for technical-art/VFX work.',
          ].join(' '),
        },
        { role: 'user', content: prompt.user },
      ],
    }),
  }, cfg.apiKey);

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('GMI returned no assistant content');
  const elapsedMs = Date.now() - started;
  const usage = payload?.usage ?? null;
  const createdAt = new Date().toISOString();
  const report = [
    '# MiniMax GMI Worker Report',
    '',
    `- Provider: GMI Cloud`,
    `- Model: \`${cfg.model}\``,
    `- Task: \`${prompt.taskFile}\``,
    `- Context files: ${prompt.contextFiles.length ? prompt.contextFiles.map((item) => `\`${item}\``).join(', ') : 'none'}`,
    `- Created: ${createdAt}`,
    `- Elapsed ms: ${elapsedMs}`,
    `- Usage: \`${JSON.stringify(usage)}\``,
    '- Authority: proposal-only; Codex/Sol must verify, apply, test and accept.',
    '',
    '---',
    '',
    content.trim(),
    '',
  ].join('\n');

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, report, 'utf8');
  console.log(`GMI_MINIMAX_TASK PASS model=${cfg.model} out=${path.relative(ROOT, outFile)} elapsedMs=${elapsedMs}`);
}

async function main() {
  await loadLocalEnv();
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  if (args.check) {
    await check(args);
    return;
  }
  if (!args.task) {
    usage();
    throw new Error('Use --check or provide --task and --out');
  }
  await runTask(args);
}

main().catch((error) => {
  console.error(`GMI_MINIMAX FAIL: ${error.message}`);
  process.exit(1);
});
