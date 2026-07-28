import { access, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const GLTF_TRANSFORM_VERSION = '4.4.2';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..', '..');
const argumentsList = process.argv.slice(2);
let input = null;
let output = null;
let execute = false;

for (let index = 0; index < argumentsList.length; index += 1) {
  const argument = argumentsList[index];
  if (argument === '--input') {
    input = argumentsList[index + 1];
    index += 1;
  } else if (argument === '--output') {
    output = argumentsList[index + 1];
    index += 1;
  } else if (argument === '--execute') {
    execute = true;
  }
}

if (!input || !output) {
  console.error(
    'Uso: node scripts/3d/optimize-glb.mjs --input master.glb --output runtime.glb [--execute]',
  );
  process.exit(2);
}

const absoluteInput = path.resolve(repositoryRoot, input);
const absoluteOutput = path.resolve(repositoryRoot, output);
await access(absoluteInput);
const inputBytes = (await stat(absoluteInput)).size;
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const commandArguments = [
  '--yes',
  `@gltf-transform/cli@${GLTF_TRANSFORM_VERSION}`,
  'optimize',
  absoluteInput,
  absoluteOutput,
  '--compress',
  'draco',
];
const relativeOutput = path.relative(repositoryRoot, absoluteOutput).replaceAll('\\', '/');

console.log(JSON.stringify({
  mode: execute ? 'execute' : 'dry-run',
  input: path.relative(repositoryRoot, absoluteInput).replaceAll('\\', '/'),
  inputBytes,
  output: relativeOutput,
  tool: `@gltf-transform/cli@${GLTF_TRANSFORM_VERSION}`,
  compression: 'draco',
  followUp: [
    `node scripts/3d/validate-glb.mjs ${relativeOutput}`,
    'comparar peso, carga CPU y captura visual antes de reemplazar el runtime',
  ],
}, null, 2));

if (!execute) process.exit(0);

const result = spawnSync(npxCommand, commandArguments, {
  cwd: repositoryRoot,
  stdio: 'inherit',
});
if (result.status !== 0) process.exit(result.status ?? 1);

const outputBytes = (await stat(absoluteOutput)).size;
console.log(`Optimización terminada: ${inputBytes} -> ${outputBytes} bytes`);
