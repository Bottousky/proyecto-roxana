import { readFileSync, writeFileSync } from 'fs';

const path = 'C:\\YO\\Proyectos\\Roxana\\src\\ohmdal\\architecture\\plazaKit.ts';
let fileBuf = readFileSync(path);

// Localizar el inicio del `stonePieces = [` block y añadir los árboles al principio.
const marker = 'const stonePieces = [\n    ...perimeterWall(PLAZA_BOUNDS.minZ + 0.2),';
const insert = `const treePositions: Array<readonly [number, number, number]> = [
  // Cuatro árboles flanqueando el pasillo central, sin tapar el pedestal ni la campana.
  [-19, -4.5, 0.95],
  [-19, 4.5, 0.95],
  [-6, -4.5, 1.1],
  [-6, 4.5, 1.1],
  [-12, -5, 0.85],
  [-12, 5, 0.85],
];
const treePieces: THREE.BufferGeometry[] = [];
for (const [tx, tz, ts] of treePositions) {
  for (const piece of plazaTree(tx, tz, ts)) treePieces.push(piece);
}
const stonePieces = [
  ...treePieces,
  ...perimeterWall(PLAZA_BOUNDS.minZ + 0.2),`;

if (!fileBuf.includes(marker)) {
  console.error('MARKER NOT FOUND');
  process.exit(1);
}

fileBuf = fileBuf.replace(marker, insert);
writeFileSync(path, fileBuf);
console.log('OK. New file size:', fileBuf.length);
