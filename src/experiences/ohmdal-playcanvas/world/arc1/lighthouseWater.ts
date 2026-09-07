import * as pc from 'playcanvas';
import { createLighthouseLandscape } from './lighthouseLandscape.ts';
// @ts-expect-error Version-matched Engine scripts have no declaration files.
import { Water } from 'playcanvas/scripts/esm/water.mjs';

// The 2.21.4 script subscribes directly to app.update. Gate that callback so
// an inactive region cannot keep requesting depth or advancing water time.
class ZonedWater extends Water {
  static scriptName = 'ohmdalZonedWater';
  declare enabled: boolean;
  motionPaused = false;
  _frameUpdate(dt: number): void {
    if (!this.enabled) return;
    super._frameUpdate(this.motionPaused ? 0 : dt);
  }
}

/** Bounded lake, owned by the Faro zone. Engine water supplies waves and reflections. */
export function createLighthouseWater(app: pc.Application, root: pc.Entity, camera: pc.Entity, sun: pc.Entity, shoreMaterial: pc.StandardMaterial) {
  const worldLayer = app.scene.layers.getLayerByName('World')!;
  const waterLayer = new pc.Layer({ name: 'OhmdalLakeWater' });
  app.scene.layers.insert(waterLayer, app.scene.layers.getTransparentIndex(worldLayer) + 1);
  camera.camera!.layers = [...camera.camera!.layers, waterLayer.id];
  const surface = new pc.Entity('LighthouseLakeSurface');
  // Starts at the existing quayside; the scenic expanse lies outside navigation.
  surface.setLocalPosition(507.5, 0.2, 4);
  // Spend vertices at the shoreline seen on foot, not on the distant lake.
  // 12,288 triangles replace the uniform 64,800 while improving near-quay
  // sampling from 5.6 metres to below one metre. Extent and water level match.
  const positions: number[] = [], normals: number[] = [], uvs: number[] = [], indices: number[] = [];
  const columns = 64, rows = 96;
  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows * 2 - 1;
    const z = Math.sign(t) * Math.pow(Math.abs(t), 1.8) * 600;
    for (let col = 0; col <= columns; col += 1) {
      const x = Math.pow(col / columns, 2) * 1000 - 500;
      positions.push(x, 0, z); normals.push(0, 1, 0);
      uvs.push((x + 500) / 1000, (z + 600) / 1200);
    }
  }
  for (let row = 0; row < rows; row += 1) for (let col = 0; col < columns; col += 1) {
    const a = row * (columns + 1) + col, b = a + columns + 1;
    indices.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const mesh = new pc.Mesh(app.graphicsDevice);
  mesh.setPositions(positions); mesh.setNormals(normals); mesh.setUvs(0, uvs); mesh.setIndices(indices);
  mesh.update();
  surface.addComponent('render', {
    meshInstances: [new pc.MeshInstance(mesh, new pc.StandardMaterial())],
    layers: [waterLayer.id], castShadows: false,
  });
  surface.addComponent('script');
  const water = surface.script!.create(ZonedWater as unknown as typeof pc.Script, { properties: {
    cameraEntity: camera, lightEntity: sun,
    reflectionSource: 'sky', refraction: false, depthEffects: true,
    shallowColor: new pc.Color(0.22, 0.38, 0.4), deepColor: new pc.Color(0.025, 0.085, 0.11),
    opacity: 0.9, depthFade: 2, foam: false, specularIntensity: 0.04, reflectionStrength: 0.2,
    skyBlur: 2, bumpiness: 0.1,
    waves: true, waveAmplitude: 0.015, swellAmplitude: 0.015,
    waveLength: 4, swellLength: 12, waveSpeed: 0.45, swellSpeed: 0.3,
  } }) as unknown as ZonedWater;
  root.addChild(surface);
  // The quay sits on the western bank. Continue that land beyond the room
  // boundary so the lake edge does not reveal the empty background.
  const bank = new pc.Entity('LighthouseWesternBank');
  bank.setLocalPosition(-492.5, -0.12, 4);
  bank.addComponent('render', {
    meshInstances: [new pc.MeshInstance(pc.Mesh.fromGeometry(app.graphicsDevice,
      new pc.PlaneGeometry({ halfExtents: new pc.Vec2(500, 600) })), shoreMaterial)],
    castShadows: false,
  });
  root.addChild(bank);
  createLighthouseLandscape(app, root);
  const oldWater = root.findByName('LighthouseDockWater') as pc.Entity | null;
  if (oldWater) {
    if (oldWater.render) oldWater.render.batchGroupId = -1;
    oldWater.enabled = false;
  }
  // Parapets make the existing navigation limits visible while opening the lake horizon.
  for (const name of ['LighthouseWallEast', 'LighthouseWallNorth', 'LighthouseWallSouth']) {
    const wall = root.findByName(name) as pc.Entity | null;
    if (!wall) continue;
    const scale = wall.getLocalScale().clone();
    const position = wall.getLocalPosition().clone();
    scale.y = 1.1; position.y = 0.55;
    wall.setLocalScale(scale); wall.setLocalPosition(position);
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const setPaused = (paused: boolean) => {
    water.motionPaused = paused || reducedMotion.matches;
  };
  setPaused(false);
  app.once('destroy', () => app.scene.layers.remove(waterLayer));
  return setPaused;
}
