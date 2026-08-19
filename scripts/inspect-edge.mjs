/* Inspect a specific pixel region of an image. */
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const path = process.argv[2] || 'screenshots/c4_01_spawn_portal_south.png';
const data = readFileSync(path);
const png = PNG.sync.read(data);
console.log(`size: ${png.width}x${png.height}`);

// Sample some pixels along the bottom edge.
for (const y of [510, 520, 530, 539]) {
  for (const x of [100, 480, 800]) {
    const idx = (png.width * y + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    console.log(`  (${x}, ${y}) = ${hex} (rgb ${r}, ${g}, ${b})`);
  }
}
