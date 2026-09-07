import * as pc from 'playcanvas';

/** Revolved construction profile, metres; open centre reveals the water. */
function lathe(app: pc.Application, profile: readonly (readonly [number, number])[], segments = 48): pc.Mesh {
  const p: number[] = [], uv: number[] = [], ix: number[] = [];
  let surfaceDistance = 0;
  for (let row = 0; row < profile.length; row += 1) {
    const [radius, y] = profile[row]!;
    if (row > 0) surfaceDistance += Math.hypot(radius - profile[row - 1]![0], y - profile[row - 1]![1]);
    for (let step = 0; step <= segments; step += 1) {
      const angle = step / segments * Math.PI * 2;
      p.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      uv.push(step / segments * Math.PI * 2, surfaceDistance / 2);
    }
  }
  for (let row = 0; row < profile.length - 1; row += 1) for (let step = 0; step < segments; step += 1) {
    const a = row * (segments + 1) + step, c = a + segments + 1;
    ix.push(a, c, a + 1, a + 1, c, c + 1);
  }
  const normals = pc.calculateNormals(p, ix);
  const mesh = new pc.Mesh(app.graphicsDevice);
  mesh.setPositions(p); mesh.setNormals(normals); mesh.setUvs(0, uv);
  mesh.setVertexStream(pc.SEMANTIC_TANGENT, pc.calculateTangents(p, normals, uv, ix), 4);
  mesh.setIndices(ix); mesh.update();
  return mesh;
}

export function createFountainAssembly(app: pc.Application, plaza: pc.Entity, basin: pc.Entity,
  water: pc.Entity, stone: pc.StandardMaterial, bronze: pc.StandardMaterial): (dt: number, powered: boolean, paused: boolean, reduced: boolean) => void {
  const rim = lathe(app, [[2.76, -.39], [2.9, -.30], [2.9, .28], [2.85, .39], [2.53, .39], [2.47, .28], [2.47, -.19]]);
  basin.render!.meshInstances = [new pc.MeshInstance(rim, stone, basin)];
  basin.setLocalScale(1, 1, 1);
  basin.render!.castShadows = true;
  const mechanism = new pc.Entity('FountainPumpHousing');
  mechanism.setLocalPosition(5.5, .37, 3.8);
  const pump = lathe(app, [[.50, 0], [.50, .12], [.31, .20], [.24, .96], [.32, 1.03], [.32, 1.12], [.13, 1.17], [0, 1.17]], 24);
  mechanism.addComponent('render', { meshInstances: [new pc.MeshInstance(pump, bronze, mechanism)], castShadows: true });
  plaza.addChild(mechanism);
  const poolMaterial = new pc.StandardMaterial();
  poolMaterial.name = 'FountainStillWater';
  poolMaterial.diffuse.set(.09, .22, .20);
  poolMaterial.useMetalness = true; poolMaterial.metalness = .12; poolMaterial.gloss = .74;
  poolMaterial.update();
  for (const instance of water.render!.meshInstances) instance.material = poolMaterial;

  // Built-in ParticleSystem follows the version-matched particles-spark example
  // (graphics/particles-spark.example.mjs, Engine v2.21.4), with four bounded
  // water trajectories. The Engine's default soft particle texture is reused.
  const emitters: pc.Entity[] = [];
  for (let index = 0; index < 4; index += 1) {
    const angle = index / 4 * Math.PI * 2, dx = Math.cos(angle), dz = Math.sin(angle);
    const emitter = new pc.Entity(`FountainWaterJet${index}`);
    emitter.setLocalPosition(5.5 + dx * .23, 1.37, 3.8 + dz * .23);
    emitter.addComponent('particlesystem', {
      numParticles: 56, lifetime: .85, rate: .015, loop: true, preWarm: true,
      emitterExtents: new pc.Vec3(.016, .016, .016),
      velocityGraph: new pc.CurveSet([0, dx * 1.9, 1, dx * 1.9], [0, 2.2, 1, -4.6], [0, dz * 1.9, 1, dz * 1.9]),
      scaleGraph: new pc.Curve([0, .026, .65, .035, 1, .015]),
      alphaGraph: new pc.Curve([0, .56, .8, .45, 1, 0]),
      colorGraph: new pc.CurveSet([0, .48], [0, .68], [0, .70]),
      blendType: pc.BLEND_NORMAL, lighting: false,
    });
    emitter.enabled = false;
    plaza.addChild(emitter); emitters.push(emitter);
  }
  let lastState = '';
  app.once('destroy', () => { rim.destroy(); pump.destroy(); poolMaterial.destroy(); });
  return (_dt, powered, paused, reduced) => {
    const key = `${powered}:${paused}:${reduced}`;
    if (key === lastState) return;
    lastState = key;
    for (const emitter of emitters) {
      emitter.enabled = powered && !reduced;
      if (paused) emitter.particlesystem!.pause();
      else emitter.particlesystem!.unpause();
    }
  };
}
