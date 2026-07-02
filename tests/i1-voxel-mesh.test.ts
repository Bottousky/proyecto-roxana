// Tests del mesher voxel puro (src/experiences/instituto/voxelMesh.ts).
// Corre con: node --experimental-strip-types tests/i1-voxel-mesh.test.ts
import {
  buildVoxelFaces,
  createGrid,
  fillBox,
  getVoxel,
  hexToRgb,
  setVoxel,
} from '../src/experiences/instituto/voxelMesh.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

const PALETTE = ['#ff0000', '#00ff00'];

// 1. Un voxel aislado emite exactamente 6 caras (24 vértices, 36 índices).
{
  const g = createGrid(3, 3, 3);
  setVoxel(g, 1, 1, 1, 1);
  const mesh = buildVoxelFaces(g, PALETTE);
  assert(mesh.faceCount === 6, 'un voxel aislado emite 6 caras');
  assert(mesh.positions.length === 6 * 4 * 3, '24 vértices');
  assert(mesh.indices.length === 6 * 6, '36 índices');
}

// 2. Dos voxels adyacentes ocultan las caras internas: 10 caras, no 12.
{
  const g = createGrid(4, 3, 3);
  setVoxel(g, 1, 1, 1, 1);
  setVoxel(g, 2, 1, 1, 2);
  const mesh = buildVoxelFaces(g, PALETTE);
  assert(mesh.faceCount === 10, 'dos voxels adyacentes emiten 10 caras (culling interno)');
}

// 3. Una caja rellena 3×3×3 solo emite superficie: 9 caras por lado = 54.
{
  const g = createGrid(5, 5, 5);
  fillBox(g, 1, 1, 1, 3, 3, 3, 1);
  const mesh = buildVoxelFaces(g, PALETTE);
  assert(mesh.faceCount === 54, 'caja 3×3×3: 54 caras de superficie, ninguna interior');
}

// 4. El color de paleta llega al vértice, modulado por el sombreado de cara.
{
  const g = createGrid(1, 1, 1);
  setVoxel(g, 0, 0, 0, 1); // rojo puro
  const mesh = buildVoxelFaces(g, PALETTE);
  let sawFullRed = false;
  let sawShadedRed = false;
  for (let i = 0; i < mesh.colors.length; i += 3) {
    assert(mesh.colors[i + 1] === 0 && mesh.colors[i + 2] === 0, 'sin componentes verde/azul');
    if (mesh.colors[i] === 1) sawFullRed = true;
    if (mesh.colors[i] === 0.5) sawShadedRed = true;
  }
  assert(sawFullRed, 'la cara superior conserva el color pleno');
  assert(sawShadedRed, 'la cara inferior queda sombreada a 0.5');
}

// 5. fillBox y getVoxel respetan límites de la grilla (sin crash ni escritura fuera).
{
  const g = createGrid(2, 2, 2);
  fillBox(g, -5, -5, -5, 10, 10, 10, 2);
  assert(getVoxel(g, 0, 0, 0) === 2, 'fillBox recorta a la grilla');
  assert(getVoxel(g, -1, 0, 0) === 0, 'fuera de la grilla siempre es vacío');
  setVoxel(g, 99, 0, 0, 1); // no debe lanzar
}

// 6. hexToRgb convierte correctamente.
{
  const [r, g, b] = hexToRgb('#c9a55a');
  assert(Math.abs(r - 201 / 255) < 1e-9, 'componente roja');
  assert(Math.abs(g - 165 / 255) < 1e-9, 'componente verde');
  assert(Math.abs(b - 90 / 255) < 1e-9, 'componente azul');
}

console.log('I1 voxel mesh tests: OK');
