import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import validator from 'gltf-validator';

const workspace = process.cwd();
const targets = process.argv.slice(2);
const files = targets.length
  ? targets
  : [
      'assets/school3d/school-overview.glb',
      'assets/school3d/electronics-room.glb',
    ];

const reports = [];

for (const relativePath of files) {
  const absolutePath = path.resolve(workspace, relativePath);
  const bytes = await readFile(absolutePath);
  const report = await validator.validateBytes(new Uint8Array(bytes), {
    uri: relativePath.replaceAll('\\', '/'),
    maxIssues: 1000,
  });

  reports.push({
    file: relativePath.replaceAll('\\', '/'),
    issues: report.issues,
    info: report.info,
  });
}

const outputDirectory = path.join(workspace, 'artifacts', 'validation');
const outputPath = path.join(outputDirectory, 'gltf-validation.json');
await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ files: reports }, null, 2)}\n`, 'utf8');

for (const report of reports) {
  const { numErrors, numWarnings, numInfos, numHints } = report.issues;
  console.log(
    `${report.file}: ${numErrors} errors, ${numWarnings} warnings, ${numInfos} infos, ${numHints} hints`,
  );
}

if (reports.some((report) => report.issues.numErrors > 0)) {
  process.exitCode = 1;
}

