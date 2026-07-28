import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PROFILES = {
  mobile: {
    maxDrawCalls: 150,
    maxTriangles: 300000,
    maxPixelRatio: 1.5,
  },
  desktop: {
    maxDrawCalls: 250,
    maxTriangles: 700000,
    maxPixelRatio: 2,
  },
};

export function snapshotRendererInfo(rendererInfo, options = {}) {
  const profileName = options.profile ?? 'desktop';
  const profile = PROFILES[profileName];
  if (!profile) throw new Error(`Perfil desconocido: ${profileName}`);

  const render = rendererInfo.render ?? {};
  const memory = rendererInfo.memory ?? {};
  const programs = Array.isArray(rendererInfo.programs) ? rendererInfo.programs.length : null;
  const drawCalls = Number(render.calls ?? rendererInfo.drawCalls ?? 0);
  const triangles = Number(render.triangles ?? rendererInfo.triangles ?? 0);
  const pixelRatio = options.pixelRatio ?? rendererInfo.pixelRatio ?? null;

  return {
    capturedAt: new Date().toISOString(),
    profile: profileName,
    viewport: options.viewport ?? rendererInfo.viewport ?? null,
    metrics: {
      fps: rendererInfo.fps ?? null,
      drawCalls,
      triangles,
      points: Number(render.points ?? rendererInfo.points ?? 0),
      lines: Number(render.lines ?? rendererInfo.lines ?? 0),
      geometries: Number(memory.geometries ?? rendererInfo.geometries ?? 0),
      textures: Number(memory.textures ?? rendererInfo.textures ?? 0),
      programs,
      pixelRatio,
    },
    gates: {
      drawCalls: {
        limit: profile.maxDrawCalls,
        pass: drawCalls < profile.maxDrawCalls,
      },
      triangles: {
        limit: profile.maxTriangles,
        pass: triangles <= profile.maxTriangles,
      },
      pixelRatio: {
        limit: profile.maxPixelRatio,
        pass: pixelRatio === null ? null : pixelRatio <= profile.maxPixelRatio,
      },
    },
  };
}
function parseArguments(argumentsList) {
  const options = {
    input: null,
    output: null,
    profile: 'desktop',
    viewport: null,
    pixelRatio: null,
  };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === '--input' || argument === '--output' || argument === '--profile'
      || argument === '--viewport' || argument === '--pixel-ratio') {
      const key = argument.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      options[key] = argumentsList[index + 1];
      index += 1;
    }
  }

  if (options.pixelRatio !== null) options.pixelRatio = Number(options.pixelRatio);
  return options;
}

const invokedDirectly = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const options = parseArguments(process.argv.slice(2));
  if (!options.input) {
    console.error(
      'Uso: node scripts/3d/report-runtime-budget.mjs '
      + '--input renderer-info.json [--profile mobile|desktop] [--output reporte.json]',
    );
    process.exit(2);
  }

  const input = JSON.parse(await readFile(path.resolve(options.input), 'utf8'));
  const report = snapshotRendererInfo(input.rendererInfo ?? input, options);
  const serialized = `${JSON.stringify(report, null, 2)}\n`;

  if (options.output) {
    await writeFile(path.resolve(options.output), serialized, 'utf8');
    console.log(`Reporte escrito en ${options.output}`);
  } else {
    process.stdout.write(serialized);
  }

  const failed = Object.values(report.gates).some((gate) => gate.pass === false);
  if (failed) process.exitCode = 1;
}
