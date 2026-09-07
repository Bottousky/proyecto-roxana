import * as pc from 'playcanvas';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const hash = (x: number, z: number) => {
  const value = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return value - Math.floor(value);
};
function noise(x: number, z: number): number {
  const ix = Math.floor(x), iz = Math.floor(z), u = smooth(x - ix), v = smooth(z - iz);
  const a = hash(ix, iz) * (1 - u) + hash(ix + 1, iz) * u;
  const b = hash(ix, iz + 1) * (1 - u) + hash(ix + 1, iz + 1) * u;
  return a * (1 - v) + b * v;
}
function height(x: number, z: number): number {
  // Scenic land stays below the existing navigable quay and all its props.
  if (Math.abs(x) <= 14.5 && Math.abs(z) <= 15.5) return -0.22;
  const western = smooth((-x - 18) / 115);
  const eastern = smooth((x - 150 - noise(z / 100, 2) * 36) / 155);
  const ends = smooth((Math.abs(z) - 150 - noise(x / 95, 4) * 32) / 155);
  const ridge = Math.max(western, eastern, ends);
  const detail = noise(x / 105, z / 105) * 0.65 + noise(x / 39, z / 39) * 0.25 + noise(x / 14, z / 14) * 0.1;
  // An irregular near bank gives the quay a landward shoulder and a shoreline
  // at human scale; its inner plateau remains below the validated room floor.
  const coast = 8 + smooth((Math.abs(z) - 16) / 28) * (9 + noise(z / 12, 6) * 12);
  const bank = smooth((coast - x) / 15) * (1 - smooth((-x - 42) / 55));
  const shoulder = bank * (1.1 + noise(x / 11, z / 17) * 4.0)
    * Math.max(smooth((Math.abs(z) - 15.5) / 8), smooth((-x - 14.5) / 8));
  return -0.48 + shoulder + ridge * ridge * (14 + detail * 52);
}

/** Zone-local L2 landforms: real parallax outside the existing collision shell. */
export function createLighthouseLandscape(app: pc.Application, parent: pc.Entity): pc.Entity {
  const segments = 128, halfExtent = 640;
  const coordinate = (index: number) => {
    const t = index / segments * 2 - 1;
    return Math.sign(t) * Math.pow(Math.abs(t), 1.85) * halfExtent;
  };
  const positions: number[] = [], colors: number[] = [], indices: number[] = [];
  for (let row = 0; row <= segments; row += 1) {
    for (let col = 0; col <= segments; col += 1) {
      const x = coordinate(col), z = coordinate(row), y = height(x, z);
      positions.push(x, y, z);
      const slope = Math.hypot(height(x + 2, z) - height(x - 2, z), height(x, z + 2) - height(x, z - 2)) / 4;
      const rock = smooth(slope * 1.1 + (y - 26) / 75);
      const variation = noise(x / 17, z / 17) * 0.045;
      const haze = smooth((Math.hypot(x, z) - 170) / 400) * 0.66;
      const ground = [0.25 + rock * 0.23 + variation, 0.29 + rock * 0.17 + variation, 0.23 + rock * 0.19 + variation];
      const atmosphere = [0.55, 0.66, 0.68];
      colors.push(...ground.map((component, i) => component * (1 - haze) + atmosphere[i]! * haze), 1);
    }
  }
  for (let row = 0; row < segments; row += 1) {
    for (let col = 0; col < segments; col += 1) {
      const a = row * (segments + 1) + col, b = a + 1, c = a + segments + 1, d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const mesh = new pc.Mesh(app.graphicsDevice);
  mesh.setPositions(positions);
  mesh.setNormals(pc.calculateNormals(positions, indices));
  mesh.setColors(colors);
  mesh.setIndices(indices);
  mesh.update(pc.PRIMITIVE_TRIANGLES);
  const material = new pc.StandardMaterial();
  material.name = 'LighthouseErodedLandscape';
  material.diffuse.set(0.55, 0.59, 0.52);
  material.diffuseVertexColor = true;
  material.metalness = 0;
  material.gloss = 0.08;
  material.update();
  const root = new pc.Entity('LighthouseScenicLandforms');
  root.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, material, root)], castShadows: false });
  parent.addChild(root);
  const oldBank = parent.findByName('LighthouseWesternBank') as pc.Entity | null;
  if (oldBank) oldBank.enabled = false;
  return root;
}
