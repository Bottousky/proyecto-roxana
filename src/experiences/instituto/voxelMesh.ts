// Mesher voxel puro: grilla de voxels → arrays de caras visibles (culling de
// caras interiores) con color por vértice y sombreado por orientación horneado.
// Sin Three.js ni DOM: testeable en Node. La conversión a BufferGeometry vive
// en schoolScene.ts.

export interface VoxelGrid {
  sx: number;
  sy: number;
  sz: number;
  /** 0 = vacío; n>0 = índice de paleta + 1. */
  data: Uint8Array;
}

export function createGrid(sx: number, sy: number, sz: number): VoxelGrid {
  return { sx, sy, sz, data: new Uint8Array(sx * sy * sz) };
}

function index(g: VoxelGrid, x: number, y: number, z: number): number {
  return x + g.sx * (y + g.sy * z);
}

export function getVoxel(g: VoxelGrid, x: number, y: number, z: number): number {
  if (x < 0 || y < 0 || z < 0 || x >= g.sx || y >= g.sy || z >= g.sz) return 0;
  return g.data[index(g, x, y, z)];
}

export function setVoxel(g: VoxelGrid, x: number, y: number, z: number, color: number): void {
  if (x < 0 || y < 0 || z < 0 || x >= g.sx || y >= g.sy || z >= g.sz) return;
  g.data[index(g, x, y, z)] = color;
}

/** Rellena la caja [x0..x1]×[y0..y1]×[z0..z1] (inclusive) con un color de paleta. */
export function fillBox(
  g: VoxelGrid,
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
  color: number,
): void {
  for (let z = Math.max(0, z0); z <= Math.min(g.sz - 1, z1); z++) {
    for (let y = Math.max(0, y0); y <= Math.min(g.sy - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(g.sx - 1, x1); x++) {
        g.data[index(g, x, y, z)] = color;
      }
    }
  }
}

export interface VoxelMeshData {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint32Array;
  /** Cantidad de caras emitidas (cada una = 4 vértices, 2 triángulos). */
  faceCount: number;
}

interface FaceDef {
  /** Dirección al vecino que debe estar vacío para emitir la cara. */
  dir: [number, number, number];
  /** Esquinas de la cara (en unidades de voxel, relativas al mínimo del voxel). */
  corners: [number, number, number][];
  /** Factor de sombreado horneado según orientación (look voxel nítido). */
  shade: number;
}

// Sombreado clásico voxel: techo claro, piso oscuro, Z medio, X más apagado.
const FACES: FaceDef[] = [
  { dir: [0, 1, 0], shade: 1.0, corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
  { dir: [0, -1, 0], shade: 0.5, corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { dir: [0, 0, 1], shade: 0.8, corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { dir: [0, 0, -1], shade: 0.8, corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] },
  { dir: [1, 0, 0], shade: 0.66, corners: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] },
  { dir: [-1, 0, 0], shade: 0.66, corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] },
];

/** '#rrggbb' → [r, g, b] en 0..1. */
export function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 0xff) / 255, ((value >> 8) & 0xff) / 255, (value & 0xff) / 255];
}

/**
 * Emite solo las caras expuestas (vecino vacío o fuera de la grilla).
 * `palette` mapea índice de voxel-1 → color hex.
 */
export function buildVoxelFaces(g: VoxelGrid, palette: string[]): VoxelMeshData {
  const rgb = palette.map(hexToRgb);
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  let faceCount = 0;

  for (let z = 0; z < g.sz; z++) {
    for (let y = 0; y < g.sy; y++) {
      for (let x = 0; x < g.sx; x++) {
        const voxel = g.data[index(g, x, y, z)];
        if (voxel === 0) continue;
        const color = rgb[voxel - 1] ?? [1, 0, 1];

        for (const face of FACES) {
          if (getVoxel(g, x + face.dir[0], y + face.dir[1], z + face.dir[2]) !== 0) continue;

          const base = positions.length / 3;
          for (const [cx, cy, cz] of face.corners) {
            positions.push(x + cx, y + cy, z + cz);
            normals.push(face.dir[0], face.dir[1], face.dir[2]);
            colors.push(color[0] * face.shade, color[1] * face.shade, color[2] * face.shade);
          }
          indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
          faceCount++;
        }
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    indices: new Uint32Array(indices),
    faceCount,
  };
}
