import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..', '..');
const args = process.argv.slice(2);
let input = null;
let contains = [];

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (!arg.startsWith('--') && input === null) input = arg;
  else if (arg === '--contains') contains = args[++index].split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  else {
    console.error(`Argumento desconocido: ${arg}`);
    process.exit(2);
  }
}

if (!input) {
  console.error('Uso: node scripts/3d/inventory-vendor-pack.mjs <folder> [--contains wall,arch,barrel]');
  process.exit(2);
}

const root = path.resolve(repositoryRoot, input);
const info = await stat(root);
if (!info.isDirectory()) throw new Error(`${input} no es una carpeta`);

const allowed = new Set(['.gltf', '.glb', '.fbx', '.obj', '.blend']);
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute);
    else if (allowed.has(path.extname(entry.name).toLowerCase())) {
      const relative = path.relative(repositoryRoot, absolute).replaceAll('\\', '/');
      const fileInfo = await stat(absolute);
      files.push({ path: relative, bytes: fileInfo.size, extension: path.extname(entry.name).toLowerCase() });
    }
  }
}

await walk(root);
files.sort((a, b) => a.path.localeCompare(b.path));

const filtered = contains.length === 0
  ? files
  : files.filter((file) => contains.some((token) => file.path.toLowerCase().includes(token)));

const counts = {};
for (const file of files) counts[file.extension] = (counts[file.extension] ?? 0) + 1;

console.log(JSON.stringify({
  root: path.relative(repositoryRoot, root).replaceAll('\\', '/'),
  total3dFiles: files.length,
  counts,
  contains,
  matches: filtered,
}, null, 2));
