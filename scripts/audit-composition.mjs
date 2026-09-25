import fs from 'node:fs';
import { AREAS } from '../src/content.js';
import { buildCollisionWorld } from '../tests/helpers/world-fixture.js';
import { auditComposition, compositionFailures } from '../tests/helpers/composition-audit.js';

const args = process.argv.slice(2), outputAt = args.indexOf('--output');
const output = outputAt >= 0 ? args[outputAt + 1] : null;
const areas = args.filter((arg, index) => !arg.startsWith('--') && (outputAt < 0 || index !== outputAt + 1));
const reports = [];
for (const id of areas.length ? areas : Object.keys(AREAS)) {
  if (!AREAS[id]) throw new Error(`Unknown area: ${id}`);
  const world = buildCollisionWorld(id);
  try { reports.push(auditComposition(world)); } finally { world.dispose(); }
}
if (output) fs.writeFileSync(output, JSON.stringify({ capturedAt: new Date().toISOString(), reports }, null, 2) + '\n');
for (const report of reports) {
  console.log(`${report.area}: ${report.buildings.length} buildings`);
  for (const building of report.buildings) console.log(`  ${building.id}: door ${building.door.blocked}/${building.door.total} obscured; facade ${building.facade.blocked}/${building.facade.total}; alpha planes ${building.alphaDoor.blocked}/${building.alphaDoor.total} (unverified pixels)`);
  for (const failure of compositionFailures(report)) console.log(`  FAIL ${failure}`);
  for (const overlap of report.silhouetteOverlaps) console.log(`  NOTE ${overlap.a} / ${overlap.b}: projected envelope overlap ${Math.round(overlap.fraction * 100)}%`);
  for (const overlap of report.roofBoundsOverlaps) console.log(`  NOTE ${overlap.a} / ${overlap.b}: roof envelopes overlap ${overlap.overlap.join(' × ')} m`);
}
