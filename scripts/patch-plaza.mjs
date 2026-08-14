import { readFileSync, writeFileSync } from 'fs';

const path = 'C:\\YO\\Proyectos\\Roxana\\src\\ohmdal\\architecture\\plazaKit.ts';
const fileBuf = readFileSync(path);

// Leemos el segmento "viejo" directamente del archivo.
const startIdx = fileBuf.indexOf('Muro de per');
const endIdx = fileBuf.indexOf('return pieces;', startIdx) + 'return pieces;'.length + 1;
const oldBuf = fileBuf.slice(startIdx, endIdx);

console.log('Old segment length:', oldBuf.length);

// Construimos el segmento "nuevo" como bytes latin1, manteniendo el formato del archivo
// (que en este caso es utf-8: las tildes son c3ad para í, c3b3 para ó).
const newText = [
  '/**',
  ' * Pretiles de perímetro: bordes bajos de banqueta, no muros.',
  ' *',
  ' * La Plaza es un espacio público, no una habitación. Estos pretiles a 1.2 m de altura',
  ' * dejan ver el Taller al este, el Manantial más allá y el cielo arriba, y al mismo',
  ' * tiempo definen el límite de la Plaza como lugar.',
  ' */',
  'function perimeterWall(z: number): THREE.BufferGeometry[] {',
  '  const pieces: THREE.BufferGeometry[] = [];',
  '  const paintFn = stonePaint(1.3);',
  '  for (let x = PLAZA_BOUNDS.minX; x < PLAZA_BOUNDS.maxX - 0.5; x += 2) {',
  '    const span = Math.min(2, PLAZA_BOUNDS.maxX - x);',
  '    const height = 1.2 + noise(x, z) * 0.12;',
  '    pieces.push(block(span - 0.08, height, 0.55, x + span / 2, 0, z, STONE_TILE_METERS, paintFn));',
  '    // Cada cuatro tramos, un banquito de Plaza: explica la escala humana y rompe la línea.',
  '    if (Math.round(x) % 4 === 0) {',
  '      pieces.push(block(0.5, 0.5, 0.4, x, 0, z, paintFn));',
  '    }',
  '  }',
  '  return pieces;',
  '}',
  '',
  '/**',
  ' * Árboles de la Plaza: troncos cilíndricos y copas cónicas. Repartidos a los costados',
  ' * del pasillo central — no tapan el pedestal de Ohm ni la campana, pero enmarcan el',
  ' * lugar como pueblo y no como plaza vacía.',
  ' */',
  'function plazaTree(x: number, z: number, scale = 1): THREE.BufferGeometry[] {',
  '  const pieces: THREE.BufferGeometry[] = [];',
  '  const trunkPaint = stonePaint(1.4);',
  '  const leavesPaint = stonePaint(2.4);',
  '  const trunkHeight = 1.2 * scale;',
  '  const crownRadius = 0.9 * scale;',
  '  const crownHeight = 2.2 * scale;',
  '  pieces.push(block(0.22, trunkHeight, 0.22, x, 0, z, STONE_TILE_METERS, trunkPaint));',
  '  pieces.push(block(crownRadius * 1.4, crownHeight * 0.45, crownRadius * 1.4, x, trunkHeight, z, STONE_TILE_METERS, leavesPaint));',
  '  pieces.push(block(crownRadius * 1.0, crownHeight * 0.35, crownRadius * 1.0, x, trunkHeight + crownHeight * 0.45, z, STONE_TILE_METERS, leavesPaint));',
  '  pieces.push(block(crownRadius * 0.55, crownHeight * 0.20, crownRadius * 0.55, x, trunkHeight + crownHeight * 0.80, z, STONE_TILE_METERS, leavesPaint));',
  '  return pieces;',
  '}',
].join('\r\n');

const newBuf = Buffer.from(newText, 'utf8');

console.log('New segment length:', newBuf.length);

const newFile = Buffer.concat([
  fileBuf.slice(0, startIdx),
  newBuf,
  fileBuf.slice(endIdx),
]);

writeFileSync(path, newFile);
console.log('REPLACED. New file size:', newFile.length);
