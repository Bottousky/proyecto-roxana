import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { resolve, basename, dirname } from 'node:path';

const workspace = resolve(import.meta.dirname, '..');
const inputs = process.argv.slice(2).length
  ? process.argv.slice(2).map((file) => resolve(file))
  : [
      resolve(workspace, 'assets/school3d/school-overview.original.glb'),
      resolve(workspace, 'assets/school3d/school-overview.glb'),
      resolve(workspace, 'assets/school3d/electronics-room.original.glb'),
      resolve(workspace, 'assets/school3d/electronics-room.glb'),
    ];

function parseGlbJson(buffer) {
  if (buffer.readUInt32LE(0) !== 0x46546c67) throw new Error('No es un GLB');
  if (buffer.readUInt32LE(4) !== 2) throw new Error('Versión GLB no soportada');
  const jsonLength = buffer.readUInt32LE(12);
  const jsonType = buffer.readUInt32LE(16);
  if (jsonType !== 0x4e4f534a) throw new Error('GLB sin chunk JSON inicial');
  return JSON.parse(buffer.subarray(20, 20 + jsonLength).toString('utf8').trim());
}

function inspect(json, bytes, file) {
  let vertices = 0;
  let triangles = 0;
  let primitives = 0;
  for (const mesh of json.meshes ?? []) {
    for (const primitive of mesh.primitives ?? []) {
      primitives += 1;
      const positionAccessor = json.accessors?.[primitive.attributes?.POSITION];
      const indexAccessor = json.accessors?.[primitive.indices];
      vertices += positionAccessor?.count ?? 0;
      triangles += Math.floor((indexAccessor?.count ?? positionAccessor?.count ?? 0) / 3);
    }
  }
  return {
    file: basename(file),
    bytes,
    mebibytes: Number((bytes / 1_048_576).toFixed(3)),
    nodes: json.nodes?.length ?? 0,
    meshes: json.meshes?.length ?? 0,
    primitives,
    estimatedDrawCalls: primitives,
    vertices,
    triangles,
    materials: json.materials?.length ?? 0,
    textures: json.textures?.length ?? 0,
    images: json.images?.length ?? 0,
    animations: json.animations?.length ?? 0,
    extensionsUsed: json.extensionsUsed ?? [],
  };
}

const reports = [];
for (const file of inputs) {
  const [buffer, info] = await Promise.all([readFile(file), stat(file)]);
  reports.push(inspect(parseGlbJson(buffer), info.size, file));
}

const byName = Object.fromEntries(reports.map((report) => [report.file, report]));
const overviewOriginal = byName['school-overview.original.glb'];
const overviewCompressed = byName['school-overview.glb'];
const electronicsOriginal = byName['electronics-room.original.glb'];
const electronicsCompressed = byName['electronics-room.glb'];
const compression = (original, compressed) => original && compressed
  ? {
      bytesSaved: original.bytes - compressed.bytes,
      compressedRatio: Number((compressed.bytes / original.bytes).toFixed(4)),
      reductionPercent: Number(((1 - compressed.bytes / original.bytes) * 100).toFixed(1)),
    }
  : null;

const result = {
  generatedAt: new Date().toISOString(),
  delivery: {
    geometryCompression: 'KHR_draco_mesh_compression',
    textures: 'none: baked vertex colours; KTX2 conversion is not applicable',
    lighting: 'Cycles COMBINED baked into COLOR_0',
  },
  files: reports,
  compression: {
    overview: compression(overviewOriginal, overviewCompressed),
    electronics: compression(electronicsOriginal, electronicsCompressed),
  },
};

const outputJson = resolve(workspace, 'artifacts/performance/asset-report.json');
const outputMarkdown = resolve(workspace, 'artifacts/performance/asset-report.md');
await mkdir(dirname(outputJson), { recursive: true });
await writeFile(outputJson, `${JSON.stringify(result, null, 2)}\n`);

const lines = [
  '# Reporte de assets de la escuela',
  '',
  '| Archivo | MiB | Triángulos | Draw calls estimados | Materiales | Texturas |',
  '|---|---:|---:|---:|---:|---:|',
  ...reports.map((report) =>
    `| ${report.file} | ${report.mebibytes} | ${report.triangles} | ${report.estimatedDrawCalls} | ${report.materials} | ${report.textures} |`),
  '',
  `- Overview Draco: ${result.compression.overview?.reductionPercent ?? 'n/a'} % de reducción.`,
  `- Electrónica Draco: ${result.compression.electronics?.reductionPercent ?? 'n/a'} % de reducción.`,
  '- Iluminación: vertex colors horneados; el runtime no carga mapas de luz.',
  '- KTX2: no aplica en este vertical slice porque el GLB no contiene texturas raster.',
  '',
];
await writeFile(outputMarkdown, `${lines.join('\n')}\n`);
console.log(`Reporte escrito en ${outputJson}`);

