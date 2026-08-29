#!/usr/bin/env node

import { spawn } from 'node:child_process';
import process from 'node:process';

const safeMode = process.argv.includes('--safe');

const args = [
  '--agent', 'mavis',
  '--model', 'gemini-3.7-flash-medium',
  '--effort', 'medium',
];

if (!safeMode) {
  args.push('--dangerously-skip-permissions');
  console.warn('[MAVIS] FULL PERMISSIONS ENABLED: Antigravity will auto-approve all tool calls for this session.');
  console.warn('[MAVIS] Repo-level rules still forbid force-push, destructive resets, secret access and unapproved paid spend.');
} else {
  console.warn('[MAVIS] SAFE MODE: Antigravity permission prompts remain enabled.');
}

const child = spawn('agy', args, {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('error', (error) => {
  console.error(`Failed to launch Mavis via Antigravity CLI: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Mavis exited via signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});
