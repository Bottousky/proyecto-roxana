#!/usr/bin/env node

import { spawn } from 'node:child_process';
import process from 'node:process';

const safeMode = process.argv.includes('--safe');
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
