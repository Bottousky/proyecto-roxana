import { spawnSync } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..', '..');
const manifestsDirectory = path.join(repositoryRoot, 'assets', 'manifests');
const outputPath = path.join(manifestsDirectory, 'assets.index.json');
const checkOnly = process.argv.includes('--check');

const entries = await readdir(manifestsDirectory, { withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
  .map((entry) => path.join(manifestsDirectory, entry.name))
  .filter((file) => !file.endsWith('assets.schema.json'))
  .filter((file) => !file.endsWith('assets.index.json'))
  .sort();

const validator = path.join(scriptDirectory, 'validate-asset-manifests.mjs');
const validation = spawnSync(process.execPath, [validator, ...files], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

if (validation.status !== 0) {
  if (validation.stdout) process.stdout.write(validation.stdout);
  if (validation.stderr) process.stderr.write(validation.stderr);
  process.exit(validation.status ?? 1);
}
const assets = [];
for (const file of files) {
  const manifest = JSON.parse(await readFile(file, 'utf8'));
  assets.push({
    id: manifest.id,
    displayName: manifest.displayName,
    world: manifest.world,
    category: manifest.category,
    sourceMethod: manifest.sourceMethod,
    status: manifest.status,
    manifest: path.relative(repositoryRoot, file).replaceAll('\\', '/'),
    runtime: manifest.runtime,
  });
}

assets.sort((left, right) => left.id.localeCompare(right.id));
const index = {
  generatedAt: new Date().toISOString(),
  assetCount: assets.length,
  assets,
};

if (checkOnly) {
  console.log(`OK índice calculado: ${assets.length} asset(s)`);
} else {
  await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  console.log(`Índice escrito en ${path.relative(repositoryRoot, outputPath).replaceAll('\\', '/')}`);
}
