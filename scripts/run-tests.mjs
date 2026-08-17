import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const testsDir = resolve('tests');
const files = readdirSync(testsDir)
  .filter((name) => name.endsWith('.test.ts') && !name.startsWith('_legacy'))
  .sort();

for (const file of files) {
  process.stdout.write(`RUN ${file}\n`);
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', resolve(testsDir, file)],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

