import * as pc from 'playcanvas';

const smooth = (v: number) => { const t = Math.max(0, Math.min(1, v)); return t * t * (3 - 2 * t); };
const linear = (c: number) => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
function ground(x: number, z: number): number {
  const edge = Math.max(Math.abs(x) - 15, -z - 13, z - 37, 0);
  if (edge < 1) return -.38;
  const shoulder = smooth((edge - 1) / 12);
  const ridge = (cx: number, cz: number, h: number, spread: number) => h * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / spread ** 2);
  const variation = Math.sin(x * .19 + Math.cos(z * .17)) * Math.sin(z * .22) * .9;
  return -.38 + shoulder * (1.5 + ridge(-31, 22, 10, 22) + ridge(35, -5, 8, 26)
    + ridge(-13, 68, 15, 35) + ridge(31, 71, 11, 27) + variation);
}

/** L2 supporting land outside the surveyed forge/terraces circulation. */
export function createForgeLandscape(app: pc.Application, parent: pc.Entity): void {
  const n = 72, positions: number[] = [], colors: number[] = [], indices: number[] = [];
  for (let row = 0; row <= n; row += 1) for (let col = 0; col <= n; col += 1) {
    const x = col / n * 210 - 105, z = row / n * 220 - 80, y = ground(x, z);
    positions.push(x, y, z);
    const slope = Math.hypot(ground(x + 1, z) - ground(x - 1, z), ground(x, z + 1) - ground(x, z - 1)) / 2;
    const garden = smooth((z - 4) / 38) * (1 - smooth((slope - .15) / .8));
    const mineral = Math.sin(y * 1.6 + x * .16) * .018;
    colors.push(linear(.25 - garden * .065 + mineral), linear(.23 + garden * .02 + mineral), linear(.19 - garden * .06 + mineral), 1);
  }
  for (let row = 0; row < n; row += 1) for (let col = 0; col < n; col += 1) {
    const a = row * (n + 1) + col, b = a + n + 1;
    indices.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const mesh = new pc.Mesh(app.graphicsDevice);
  mesh.setPositions(positions); mesh.setNormals(pc.calculateNormals(positions, indices));
  mesh.setColors(colors); mesh.setIndices(indices); mesh.update();
  const material = new pc.StandardMaterial();
  material.name = 'ForgeMineralAndGardenShoulder';
  material.diffuseVertexColor = true;
  material.gloss = .06; material.update();
  const entity = new pc.Entity('ForgeTerracesLandscape');
  entity.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, material, entity)], castShadows: false });
  parent.addChild(entity);
  app.once('destroy', () => { mesh.destroy(); material.destroy(); });
}
