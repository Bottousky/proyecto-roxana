import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import validator from 'gltf-validator';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..', '..');
const argumentsList = process.argv.slice(2);
let outputPath = null;
const files = [];

for (let index = 0; index < argumentsList.length; index += 1) {
  const argument = argumentsList[index];
  if (argument === '--json') {
    outputPath = argumentsList[index + 1];
    index += 1;
  } else {
    files.push(argument);
  }
}

if (files.length === 0) {
  console.error('Uso: node scripts/3d/validate-glb.mjs <archivo.glb> [...] [--json reporte.json]');
  process.exit(2);
}

const reports = [];
for (const input of files) {
  const absolutePath = path.resolve(repositoryRoot, input);
  const bytes = await readFile(absolutePath);
  const report = await validator.validateBytes(new Uint8Array(bytes), {
    uri: path.relative(repositoryRoot, absolutePath).replaceAll('\\', '/'),
    maxIssues: 1000,
  });
  reports.push({
    file: path.relative(repositoryRoot, absolutePath).replaceAll('\\', '/'),
    issues: report.issues,
    info: report.info,
  });
}

for (const report of reports) {
  const { numErrors, numWarnings, numInfos, numHints } = report.issues;
  console.log(
    `${report.file}: ${numErrors} error(es), ${numWarnings} warning(s), `
      + `${numInfos} info(s), ${numHints} hint(s)`,
  );
}

if (outputPath) {
  const absoluteOutput = path.resolve(repositoryRoot, outputPath);
  await mkdir(path.dirname(absoluteOutput), { recursive: true });
  await writeFile(
    absoluteOutput,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), files: reports }, null, 2)}\n`,
    'utf8',
  );
  console.log(`Reporte escrito en ${path.relative(repositoryRoot, absoluteOutput).replaceAll('\\', '/')}`);
}

if (reports.some((report) => report.issues.numErrors > 0)) process.exitCode = 1;
