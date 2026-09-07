import * as pc from 'playcanvas';

/** Scenic maintenance craft. The authored origin is its waterline, not its keel. */
export function loadLighthouseWorkboat(app: pc.Application, parent: pc.Entity) {
  const root = new pc.Entity('LighthouseMooredWorkboat');
  root.setLocalPosition(10.5, 0.2, -0.4);
  root.setLocalEulerAngles(0, 90, 0);
  parent.addChild(root);
  const asset = new pc.Asset('ohmdal-lighthouse-workboat', 'container', {
    url: new URL('../../../../../assets/runtime/ohmdal/regional-heroes/lighthouse-workboat/lighthouse-workboat.glb', import.meta.url).href,
  });
  app.assets.add(asset);
  let disposed = false;
  let settled = false;
  let resolveReady!: () => void;
  let rejectReady!: (error: unknown) => void;
  let mooringMesh: pc.Mesh | null = null;
  const ready = new Promise<void>((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    root.destroy();
    mooringMesh?.destroy();
    asset.off(); asset.unload(); app.assets.remove(asset);
    if (!settled) { settled = true; resolveReady(); }
  };
  const fail = (error: unknown) => {
    if (disposed || settled) return;
    settled = true;
    dispose();
    rejectReady(error);
  };
  asset.once('error', fail);
  asset.ready(loaded => {
    if (disposed) return;
    try {
      const visual = (loaded.resource as pc.ContainerResource).instantiateRenderEntity({ castShadows: true });
      // Calibration: 1.895 x 1.246 x 5.451 m, bow +Z. Preserve the
      // authored waterline and centre anchor; the raised sole stays dry.
      root.addChild(visual);
      const ropeMaterial = (visual.findComponents('render') as pc.RenderComponent[])
        .flatMap(render => render.meshInstances)
        .find(instance => instance.material.name === 'LighthouseWorkboatHempRope')?.material;
      if (!ropeMaterial) throw new Error('Workboat missing hemp rope material');
      // Two slack lines connect the existing bollards to the near gunwale.
      // One small mesh keeps these scenic details to a single extra draw.
      const positions: number[] = [], normals: number[] = [], indices: number[] = [];
      const segments = 12, sides = 6, radius = 0.018;
      for (const z of [-2.2, 2.3]) {
        const offset = positions.length / 3;
        for (let segment = 0; segment <= segments; segment += 1) {
          const t = segment / segments;
          const endX = z < 0 ? -0.79 : -0.42;
          const span = endX + 4;
          const x = -4 + span * t;
          const y = 1.45 - 0.84 * t - 0.28 * Math.sin(Math.PI * t);
          const slope = (-0.84 - 0.28 * Math.PI * Math.cos(Math.PI * t)) / span;
          const n = new pc.Vec3(-slope, 1, 0).normalize();
          for (let side = 0; side < sides; side += 1) {
            const angle = side / sides * Math.PI * 2;
            const ny = Math.cos(angle), nz = Math.sin(angle);
            positions.push(x + n.x * ny * radius, y + n.y * ny * radius, z + nz * radius);
            normals.push(n.x * ny, n.y * ny, nz);
          }
        }
        for (let segment = 0; segment < segments; segment += 1) for (let side = 0; side < sides; side += 1) {
          const a = offset + segment * sides + side, b = offset + segment * sides + (side + 1) % sides;
          indices.push(a, b, a + sides, b, b + sides, a + sides);
        }
      }
      mooringMesh = new pc.Mesh(app.graphicsDevice);
      mooringMesh.setPositions(positions); mooringMesh.setNormals(normals); mooringMesh.setIndices(indices); mooringMesh.update();
      const lines = new pc.Entity('LighthouseMooringLines');
      lines.addComponent('render', { meshInstances: [new pc.MeshInstance(mooringMesh, ropeMaterial)], castShadows: false });
      root.addChild(lines);
      settled = true;
      resolveReady();
    } catch (error) { fail(error); }
  });
  try { app.assets.load(asset); } catch (error) { fail(error); }
  return { root, ready, dispose };
}
