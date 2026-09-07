#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const safeMode = process.argv.includes('--safe');
const configPath = path.join(process.cwd(), 'agent-work', 'orchestrator', 'config.json');
let config;
try {
  config = JSON.parse(await readFile(configPath, 'utf8'));
} catch (error) {
  console.error(`[MAVIS/INTERACTIVE] Cannot read orchestrator config: ${error.message}`);
  process.exit(1);
}
if (config.enabled !== true) {
  console.warn('[MAVIS/INTERACTIVE] Orchestrator is disabled; no provider was launched.');
  process.exit(0);
}

const command = process.platform === 'win32' ? 'agy.cmd' : 'agy';
const args = [
  '--agent', 'mavis',
  '--model', 'gemini-3.7-flash-medium',
  '--effort', 'medium',
];

if (!safeMode) args.push('--dangerously-skip-permissions');

const child = spawn(command, args, {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: false,
});

child.on('error', (error) => {
  console.error(`Failed to launch interactive Mavis: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 0);
});
