import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..', '..');
const USER_AGENT = 'ProyectoRoxanaAssetPipeline/1.0 (+https://github.com/Bottousky/proyecto-roxana)';

const args = process.argv.slice(2);
let slug = null;
let resolution = '2k';
let requestedMaps = ['diff', 'nor_gl', 'rough', 'ao'];
let outputRoot = 'assets/source/vendor/polyhaven';
let dryRun = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (!arg.startsWith('--') && slug === null) {
    slug = arg;
  } else if (arg === '--resolution') {
    resolution = args[++index];
  } else if (arg === '--maps') {
    requestedMaps = args[++index].split(',').map((value) => value.trim()).filter(Boolean);
  } else if (arg === '--out') {
    outputRoot = args[++index];
  } else if (arg === '--dry-run') {
    dryRun = true;
  } else {
    console.error(`Argumento desconocido: ${arg}`);
    process.exit(2);
  }
}

if (!slug) {
  console.error('Uso: node scripts/3d/fetch-polyhaven.mjs <slug> [--resolution 2k] [--maps diff,nor_gl,rough,ao] [--out assets/source/vendor/polyhaven] [--dry-run]');
  process.exit(2);
}

const mapAliases = {
  diff: [/\bdiff\b/i, /diffuse/i, /albedo/i, /base.?colou?r/i],
  nor_gl: [/nor[_-]?gl/i, /normal[^/]*gl/i, /normal.*open.?gl/i],
  rough: [/\brough\b/i, /roughness/i],
  ao: [/(^|[/_.-])ao([/_.-]|$)/i, /ambient.?occlusion/i],
  arm: [/(^|[/_.-])arm([/_.-]|$)/i, /ao.?rough.?metal/i],
  metal: [/\bmetal\b/i, /metallic/i],
  disp: [/\bdisp\b/i, /displacement/i, /height/i],
  bump: [/\bbump\b/i],
  spec: [/\bspec\b/i, /specular/i],
};

const preferredExtensions = {
  diff: ['.jpg', '.png'],
  nor_gl: ['.png', '.jpg'],
  rough: ['.jpg', '.png'],
  ao: ['.jpg', '.png'],
  arm: ['.jpg', '.png'],
  metal: ['.jpg', '.png'],
  disp: ['.png', '.jpg', '.exr'],
  bump: ['.png', '.jpg'],
  spec: ['.jpg', '.png'],
};

for (const mapName of requestedMaps) {
  if (!mapAliases[mapName]) {
    console.error(`Mapa no soportado: ${mapName}. Permitidos: ${Object.keys(mapAliases).join(', ')}`);
    process.exit(2);
  }
}

function flattenFiles(value, breadcrumb = [], output = []) {
  if (!value || typeof value !== 'object') return output;

  if (typeof value.url === 'string') {
    output.push({
      breadcrumb,
      searchText: `${breadcrumb.join('/')} ${value.url}`,
      url: value.url,
      size: typeof value.size === 'number' ? value.size : null,
      md5: typeof value.md5 === 'string' ? value.md5 : null,
    });
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === 'url' || key === 'size' || key === 'md5') continue;
    if (child && typeof child === 'object') flattenFiles(child, [...breadcrumb, key], output);
  }

  return output;
}

function matchesResolution(candidate) {
  const text = candidate.searchText.toLowerCase();
  const token = resolution.toLowerCase();
  return text.includes(`/${token}/`) || text.includes(`_${token}.`) || text.includes(`_${token}_`) || text.includes(`/${token}.`) || candidate.breadcrumb.some((part) => part.toLowerCase() === token);
}

function matchesMap(candidate, mapName) {
  if (mapName === 'rough' && /(^|[/_.-])arm([/_.-]|$)/i.test(candidate.searchText)) return false;
  if (mapName === 'ao' && /(^|[/_.-])arm([/_.-]|$)/i.test(candidate.searchText)) return false;
  return mapAliases[mapName].some((pattern) => pattern.test(candidate.searchText));
}

function extensionRank(candidate, mapName) {
  const extension = path.extname(new URL(candidate.url).pathname).toLowerCase();
  const preferred = preferredExtensions[mapName] ?? [];
  const index = preferred.indexOf(extension);
  return index === -1 ? preferred.length + 10 : index;
}

function chooseCandidate(candidates, mapName) {
  const matching = candidates
    .filter(matchesResolution)
    .filter((candidate) => matchesMap(candidate, mapName))
    .sort((left, right) => {
      const extensionDifference = extensionRank(left, mapName) - extensionRank(right, mapName);
      if (extensionDifference !== 0) return extensionDifference;
      return (left.size ?? Number.MAX_SAFE_INTEGER) - (right.size ?? Number.MAX_SAFE_INTEGER);
    });

  return matching[0] ?? null;
}

async function apiJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Poly Haven API ${response.status}: ${await response.text()}`);
  return response.json();
}

async function download(candidate, destination) {
  const response = await fetch(candidate.url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`Download ${response.status}: ${candidate.url}`);
  const bytes = Buffer.from(await response.arrayBuffer());

  if (candidate.md5) {
    const actualMd5 = createHash('md5').update(bytes).digest('hex');
    if (actualMd5 !== candidate.md5) {
      throw new Error(`MD5 inválido para ${candidate.url}: esperado ${candidate.md5}, recibido ${actualMd5}`);
    }
  }

  await writeFile(destination, bytes);
  return bytes.length;
}

const filesUrl = `https://api.polyhaven.com/files/${encodeURIComponent(slug)}`;
const assetPage = `https://polyhaven.com/a/${encodeURIComponent(slug)}`;
const filesJson = await apiJson(filesUrl);
const candidates = flattenFiles(filesJson);
const selected = {};

for (const mapName of requestedMaps) {
  const candidate = chooseCandidate(candidates, mapName);
  if (!candidate) {
    const resolutionExamples = candidates
      .filter(matchesResolution)
      .slice(0, 20)
      .map((entry) => entry.breadcrumb.join('/'));
    throw new Error(
      `No encontré ${mapName}@${resolution} para ${slug}. Rutas disponibles de ejemplo:\n${resolutionExamples.join('\n')}`,
    );
  }
  selected[mapName] = candidate;
}

const absoluteOutput = path.resolve(repositoryRoot, outputRoot, slug);
const plan = {
  provider: 'Poly Haven',
  slug,
  sourceUrl: assetPage,
  apiUrl: filesUrl,
  license: 'CC0-1.0',
  resolution,
  maps: Object.fromEntries(
    Object.entries(selected).map(([mapName, candidate]) => [mapName, {
      url: candidate.url,
      size: candidate.size,
      md5: candidate.md5,
      breadcrumb: candidate.breadcrumb,
    }]),
  ),
  output: path.relative(repositoryRoot, absoluteOutput).replaceAll('\\', '/'),
};

console.log(JSON.stringify(plan, null, 2));
if (dryRun) process.exit(0);

await mkdir(absoluteOutput, { recursive: true });
await writeFile(path.join(absoluteOutput, 'polyhaven-files.json'), JSON.stringify(filesJson, null, 2));

const downloads = [];
for (const [mapName, candidate] of Object.entries(selected)) {
  const originalName = path.basename(new URL(candidate.url).pathname);
  const extension = path.extname(originalName) || '.bin';
  const fileName = `${slug}_${mapName}_${resolution}${extension}`;
  const destination = path.join(absoluteOutput, fileName);
  const bytes = await download(candidate, destination);
  downloads.push({ map: mapName, file: fileName, bytes, sourceUrl: candidate.url, md5: candidate.md5 });
}

const provenance = {
  ...plan,
  downloadedAt: new Date().toISOString(),
  userAgent: USER_AGENT,
  downloads,
  note: 'Raw vendor material. assets/source is intentionally ignored by git; promote only normalized runtime derivatives plus provenance in repo docs/manifests.',
};
await writeFile(path.join(absoluteOutput, 'provenance.json'), JSON.stringify(provenance, null, 2));
console.log(`Descargado en ${plan.output}`);
