import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const skillDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(skillDirectory, '..', '..', '..', '..');
const validator = path.join(repositoryRoot, 'scripts', '3d', 'validate-asset-manifests.mjs');
const manifests = process.argv.slice(2);

if (manifests.length === 0) {
  console.error('Uso: node validate-manifest.mjs <manifest.json> [...]');
  process.exit(2);
}

const result = spawnSync(process.execPath, [validator, ...manifests], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
