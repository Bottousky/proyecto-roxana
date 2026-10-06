// La cascada ascendente: the diorama. Composition, left to right — a familiar waterfall
// feeds a stream along the Orilla that sinks through a grate into the rock; it wells up at
// the bottom of the chasm, and from that deepest start the region lifts it higher than
// anything else: it crests over the high Terraza and falls again, familiarly, past the
// railing. Two ordinary falls frame the anomaly.
import * as THREE from 'three';
import { rockMaterial, strataBlock, mesaShape } from './rock.js';
import { waterMaterial, waterTube, waterSheet, fieldPath } from './water.js';
import { Particles } from './particles.js';
import { Moss, Plumbs } from './flora.js';
import { makeMaterials, Stand, sphereMesh, fieldAnchor, conduit, Traces, chainProp, Bell, ApexMarks } from './props.js';
import { STREAM_SPEED, TERRACE_Y, BELL_LINE } from '../sim/levels/cascada.js';

const Z_STREAM = -1.7, Z_FRONT = 1.6, Z_BACK = -3.6;
export const LANE_Z = [0, -0.5];   // explorer's path, experiment lane

function skyDome() {
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uTop: { value: new THREE.Color('#8fc2c4') }, uMid: { value: new THREE.Color('#f2d7b0') }, uLow: { value: new THREE.Color('#f0b98a') }, uSun: { value: new THREE.Vector3(-0.35, 0.42, -0.84).normalize() } },
    vertexShader: 'varying vec3 vD; void main(){ vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform vec3 uTop,uMid,uLow,uSun; varying vec3 vD;
      void main(){ float h=vD.y; vec3 c=mix(uMid,uTop,smoothstep(.02,.55,h)); c=mix(uLow,c,smoothstep(-.2,.05,h));
        float s=max(dot(vD,uSun),0.); c+=vec3(1.,.82,.55)*(pow(s,14.)*.5+pow(s,300.)*1.2);
        gl_FragColor=vec4(c,1.); }`,
  });
  const s = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), m);
  s.renderOrder = -10;
  return s;
}

export function buildScene(world, { quality = 'high' } = {}) {
  const scene = new THREE.Scene();
  const field = world.field;
  const fogColor = new THREE.Color('#efcfa8');
  scene.fog = new THREE.Fog(fogColor, 34, 150);
  scene.add(skyDome());

  const hemi = new THREE.HemisphereLight('#d4ece6', '#a45a3c', 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffe0b2', 2.6);
  sun.position.set(-9, 16, 12); sun.castShadow = true;
  const sm = quality === 'low' ? 1024 : 2048;
  sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 12, bottom: -10, near: 1, far: 60 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  const M = makeMaterials();
  const rock = rockMaterial({ mossAmount: 1 });
  rock.side = THREE.DoubleSide;
  const add = (geo, mat = rock, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.castShadow = shadow; scene.add(m); return m; };

  // Walkable ground. Tops are exactly the simulation's solids.
  add(strataBlock({ x0: -22, x1: 0, y0: -9, y1: 0, z0: Z_BACK, z1: Z_FRONT, seed: 3, sides: ['e'] }));
  add(strataBlock({ x0: 4.5, x1: 19.5, y0: -9, y1: TERRACE_Y, z0: Z_BACK, z1: Z_FRONT, seed: 7, sides: ['w', 'e'] }));
  add(strataBlock({ x0: 19.5, x1: 24, y0: -9, y1: -1.5, z0: Z_BACK, z1: Z_FRONT, seed: 11, sides: ['w'] }));
  add(strataBlock({ x0: -0.6, x1: 5.1, y0: -11, y1: -4.6, z0: Z_BACK, z1: Z_FRONT, seed: 5, sides: [] }));
  // Back walls: a stepped skyline of strata. The chasm keeps its own back wall.
  const backs = [[-26, -14, 8.2, 21], [-14, -6, 6.1, 22], [-6, 0, 5.0, 23], [0, 4.5, 6.6, 24], [4.5, 12, 8.6, 25], [12, 26, 10.6, 26]];
  const backRock = rockMaterial({ mossAmount: 0.7, shade: 0.38 }); backRock.side = THREE.DoubleSide;
  // Back walls receive shadows but do not cast them (nothing in front of them needs their shade).
  for (const [x0, x1, top, seed] of backs) add(strataBlock({ x0, x1, y0: -11, y1: top, z0: -9, z1: Z_BACK, seed, sides: ['w', 'e'] }), backRock, false);
  // World edges: tall rock you can see, not an invisible wall.
  add(strataBlock({ x0: -30, x1: -22, y0: -9, y1: 13, z0: -9, z1: Z_FRONT + 0.6, seed: 31, sides: ['e'] }), backRock, false);

  // Distance: mesas in haze, and behind them, barely, the ordered skyline of a city.
  const far1 = rockMaterial({ fogFade: 0.35, mossAmount: 0.3 }), far2 = rockMaterial({ fogFade: 0.62, mossAmount: 0 });
  add(mesaShape([[-70, -12], [-70, 9], [-52, 10], [-48, 14], [-30, 14.5], [-26, 8], [-10, 8.6], [-6, 16], [8, 16.4], [12, 11], [30, 11.5], [34, 18], [52, 18], [56, 9], [80, 9], [80, -12]], -26, 3), far1, false);
  add(mesaShape([[-90, -12], [-90, 18], [-60, 19], [-55, 24], [-30, 24.5], [-24, 20], [4, 21], [9, 27], [30, 27.5], [36, 21], [70, 22], [90, 26], [90, -12]], -48, 3), far2, false);
  const city = new THREE.Group();
  const cityMat = new THREE.MeshBasicMaterial({ color: '#c9a98f', fog: true });
  const winMat = new THREE.MeshBasicMaterial({ color: '#ffe3a8', fog: true });
  let seed = 9; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const w = 1.6 + r() * 2.2, h = 14 + r() * 16, x = -16 + i * 1.9 + r() * 0.8;
    const t = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2), cityMat); t.position.set(x, h / 2 + 4, -70); city.add(t);
    for (let k = 0; k < 4; k++) { const wi = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.5), winMat); wi.position.set(x + (r() - 0.5) * w * 0.7, 6 + r() * (h - 3), -68.95); city.add(wi); }
  }
  scene.add(city);

  // Stream curbs along the Orilla and the Terraza.
  const curb = (x0, x1, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.14, 0.18), M.stone); b.position.set((x0 + x1) / 2, y + 0.07, z); b.castShadow = b.receiveShadow = true; scene.add(b); };
  const DRAIN_X = -1.7;
  curb(-19.4, DRAIN_X + 0.5, 0, Z_STREAM + 0.82); curb(-19.4, DRAIN_X + 0.5, 0, Z_STREAM - 0.82);
  // The stream's end: a stone basin with an iron grate; the water goes into the rock.
  const basin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 1.9), M.stone); basin.position.set(DRAIN_X, 0.1, Z_STREAM); basin.castShadow = basin.receiveShadow = true; scene.add(basin);
  for (let i = -3; i <= 3; i++) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 1.3), M.brassDark); bar.position.set(DRAIN_X + i * 0.1, 0.205, Z_STREAM); scene.add(bar); }
  // Water: everything from the field.
  const water = [];
  const mkWater = (geo, opts) => { const m = waterMaterial(opts); const mesh = new THREE.Mesh(geo, m); mesh.renderOrder = 3; scene.add(mesh); water.push(m); return mesh; };
  const leftFall = fieldPath(field, -20.3, 7.6, 0.9, 0, p => p.y <= 0.05);
  mkWater(waterTube(leftFall, { zc: -3.05, thick: 0.5, wide: 1.2, foamStart: 0.15, foamEnd: 0.3, spread: 0.5 }), { streak: 1.2 });
  mkWater(waterSheet({ x0: -21.4, x1: -19.2, y: 0.03, z0: -3.5, z1: -0.9, speed: 0.8, foamAt: [{ x: -20.1, r: 1.2 }] }), { opacity: 0.85 });
  mkWater(waterSheet({ x0: -19.4, x1: DRAIN_X, y: 0.035, z0: Z_STREAM - 0.72, z1: Z_STREAM + 0.72, speed: STREAM_SPEED, foamAt: [{ x: DRAIN_X, r: 0.8 }], tOffset: -19.4 / STREAM_SPEED }), { streak: 1.4 });
  // The chasm pool, and the water that wells up from it and rises: integrated from the field.
  const spring = world.level.spring;
  mkWater(waterSheet({ x0: 0.05, x1: 4.45, y: -3.86, z0: -3.45, z1: 1.45, speed: 0.4, foamAt: [{ x: spring.x, r: 1.3 }] }), { opacity: 0.88 });
  const arch = fieldPath(field, spring.x, spring.y, spring.vx, 0, p => p.vy < 0 && p.y <= TERRACE_Y + 0.04 && p.x > 4.6);
  arch.unshift({ x: spring.x - 0.05, y: -3.86, vx: 0.2, vy: 0.4, t: -0.25 });
  const archMesh = mkWater(waterTube(arch, { zc: -2.15, thick: 0.62, wide: 2.3, foamStart: 0.5, foamEnd: 0.32, spread: 0.2 }), { streak: 1.5 });
  const land = arch[arch.length - 1];
  curb(land.x - 0.4, 18.9, TERRACE_Y, Z_STREAM + 0.82); curb(land.x - 0.4, 18.9, TERRACE_Y, Z_STREAM - 0.82);
  mkWater(waterSheet({ x0: land.x - 0.3, x1: 19.55, y: TERRACE_Y + 0.035, z0: Z_STREAM - 0.72, z1: Z_STREAM + 0.72, speed: STREAM_SPEED, foamAt: [{ x: land.x, r: 1.0 }], tOffset: land.t }), { streak: 1.4 });
  const rightFall = fieldPath(field, 19.55, TERRACE_Y + 0.03, 1.5, 0, p => p.y <= -1.45);
  mkWater(waterTube(rightFall, { zc: Z_STREAM, thick: 0.46, wide: 1.5, foamStart: 0.15, foamEnd: 0.3, spread: 0.5 }), { streak: 1.2 });
  mkWater(waterSheet({ x0: 19.6, x1: 23.5, y: -1.47, z0: -3.4, z1: 1.2, speed: 0.9, foamAt: [{ x: rightFall[rightFall.length - 1].x, r: 1.4 }] }), { opacity: 0.85 });

  // Particles: spray off the water, pollen over the chasm.
  const parts = new Particles(field, quality === 'low' ? 700 : 1500);
  scene.add(parts.points);
  const pick = (path, t) => path[Math.max(0, Math.min(path.length - 1, Math.floor(t * (path.length - 1))))];
  const sprayFrom = (path, spot, spread, color = [0.92, 1, 0.98]) => ps => {
    const p = pick(path, spot + (ps.rnd() - 0.5) * spread);
    return { x: p.x, y: p.y, z: (path.zc ?? Z_STREAM) + (ps.rnd() - 0.5) * (path.wide ?? 1.4), vx: p.vx * (0.8 + ps.rnd() * 0.4) + (ps.rnd() - 0.5) * 0.8,
      vy: p.vy * (0.8 + ps.rnd() * 0.4) + (ps.rnd() - 0.5) * 0.8, vz: (ps.rnd() - 0.5) * 1.2, life: 0.8 + ps.rnd() * 1.4, size: 0.05 + ps.rnd() * 0.07, alpha: 0.75, color, drag: 0.6 };
  };
  const k = quality === 'low' ? 0.5 : 1;
  arch.zc = -2.15; arch.wide = 2.2;
  parts.addEmitter({ rate: 60 * k, make: sprayFrom(arch, 0.04, 0.06) });
  parts.addEmitter({ rate: 70 * k, make: sprayFrom(arch, 0.55, 0.7) });
  parts.addEmitter({ rate: 60 * k, make: sprayFrom(arch, 0.82, 0.12) });
  parts.addEmitter({ rate: 50 * k, make: sprayFrom(arch, 0.98, 0.04) });
  parts.addEmitter({ rate: 40 * k, make: sprayFrom(leftFall, 0.97, 0.06) });
  parts.addEmitter({ rate: 30 * k, make: sprayFrom(rightFall, 0.97, 0.06) });
  // Mist: large, faint, slow — it hangs around the crest.
  parts.addEmitter({ rate: 9 * k, make: ps => { const p = pick(arch, 0.7 + ps.rnd() * 0.25); return { x: p.x + (ps.rnd() - 0.5), y: p.y, z: -2.15 + (ps.rnd() - 0.4) * 2.4, vx: (ps.rnd() - 0.5) * 0.3, vy: 0, life: 3 + ps.rnd() * 2, size: 0.9 + ps.rnd() * 0.8, alpha: 0.12, color: [1, 0.98, 0.95], drag: 4 }; } });
  // Pollen from the chasm moss: heavy drag, so it drifts at its terminal speed.
  parts.addEmitter({ rate: 26 * k, make: ps => ({ x: 0.2 + ps.rnd() * 4.1, y: -4.3 + ps.rnd() * 6, z: -3.2 + ps.rnd() * 4.6, vx: 0, vy: 0, vz: 0,
    life: 7 + ps.rnd() * 6, size: 0.035 + ps.rnd() * 0.03, alpha: 0.9, color: [1, 0.93, 0.66], drag: 3.2 }) });
  // ... and from the Orilla's grass, where the same pollen falls.
  parts.addEmitter({ rate: 8 * k, make: ps => ({ x: -12 + ps.rnd() * 11, y: 0.2 + ps.rnd() * 2.5, z: -3 + ps.rnd() * 4.4, life: 5 + ps.rnd() * 4, size: 0.035, alpha: 0.8, color: [1, 0.93, 0.66], drag: 3.2 }) });

  // Moss beards on the chasm walls and along the lips: they hang along the local pull.
  const moss = new Moss(field);
  let ms = 77; const mr = () => (ms = (ms * 16807) % 2147483647) / 2147483647;
  const mossCols = ['#6f8f45', '#86a356', '#56743a', '#9bb466'];
  for (let y = -0.25; y > -4.5; y -= 0.32) for (const z of [-3.3, -2.9, 0.9, 1.4]) {
    moss.add({ root: [0.02, y + (mr() - 0.5) * 0.15, z + (mr() - 0.5) * 0.2], n: 6, len: 0.09 + mr() * 0.05, dir: [0.2, -1], wall: { value: 0.03, side: 1 }, width: 0.06, color: mossCols[Math.floor(mr() * 4)] });
    moss.add({ root: [4.48, y + TERRACE_Y + (mr() - 0.5) * 0.15, z + (mr() - 0.5) * 0.2], n: 6, len: 0.09 + mr() * 0.05, dir: [-0.2, -1], wall: { value: 4.47, side: -1 }, width: 0.06, color: mossCols[Math.floor(mr() * 4)] });
  }
  for (let y = 2.75 - 3; y > -4.5; y -= 0.32) { /* right wall below the terrace already covered */ }
  for (let x = -14; x < -0.2; x += 0.45 + mr() * 0.3) moss.add({ root: [x, -0.12, Z_FRONT + 0.12], n: 5, len: 0.09, dir: [0, -1], width: 0.055, color: mossCols[Math.floor(mr() * 4)] });
  for (let x = 4.8; x < 18.5; x += 0.45 + mr() * 0.3) moss.add({ root: [x, TERRACE_Y - 0.12, Z_FRONT + 0.12], n: 5, len: 0.09, dir: [0, -1], width: 0.055, color: mossCols[Math.floor(mr() * 4)] });
  scene.add(moss.build());

  // Measuring mast with plumb bobs on the Orilla's lip, reaching over the chasm.
  const plumbs = new Plumbs(field, M);
  const mastX = -0.42, mastZ = -0.8, armTip = 0.55;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 6.0, 10), M.brassDark); mast.position.set(mastX, 3.0, mastZ); mast.castShadow = true; scene.add(mast);
  const mastFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.12, 12), M.stone); mastFoot.position.set(mastX, 0.06, mastZ); scene.add(mastFoot);
  for (let y = 0.5; y <= 5.51; y += 0.5) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(armTip - mastX, 0.03, 0.03), M.brass); arm.position.set((armTip + mastX) / 2, y, mastZ); arm.castShadow = true; scene.add(arm);
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.05), M.ink); tick.position.set(mastX - 0.06, y, mastZ + 0.03); scene.add(tick);
    plumbs.addBob([armTip, y, mastZ]);
  }
  scene.add(plumbs.group);

  // The apparatus that sustains the region: four anchors and their supply conduits,
  // running back into the rock toward something that is not part of this landscape.
  const anchors = [];
  const zr = world.field.zones[0];
  for (const [x, y] of [[0, zr.y0], [4.5, zr.y0], [0, zr.y1], [4.5, zr.y1]]) {
    const a = fieldAnchor(M, { x, y, z: Z_BACK + 0.12 }); scene.add(a); anchors.push(a);
  }
  const conduits = [
    conduit(M, [[0, 3, Z_BACK + 0.05], [-0.8, 4.2, Z_BACK - 0.2], [-2.5, 4.9, Z_BACK - 0.6], [-4, 5.3, -5.5]]),
    conduit(M, [[4.5, 3, Z_BACK + 0.05], [5.4, 4.6, Z_BACK - 0.2], [7, 6.2, Z_BACK - 0.5], [9, 7.2, -5.5]]),
    conduit(M, [[0, -3.4, Z_BACK + 0.05], [1.2, -4.3, Z_BACK - 0.2], [2.25, -4.5, -5.2]]),
    conduit(M, [[4.5, -3.4, Z_BACK + 0.05], [3.3, -4.3, Z_BACK - 0.2], [2.25, -4.5, -5.2]]),
  ];
  for (const c of conduits) scene.add(c);

  // Supports, table and test spheres.
  const stands = world.stands.map(st => {
    const s = new Stand({ ...st, z: -1.0, laneZ: LANE_Z[1], ruler: st.id === 'A' ? { x: st.x + 0.5, y0: 0, y1: 3, z: -0.75 } : null }, M);
    scene.add(s.group); return s;
  });
  const table = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.62), M.woodLight); top.position.set(-5.5, 0.73, -0.62); table.add(top);
  for (const [dx, dz] of [[-0.8, -0.85], [0.8, -0.85], [-0.8, -0.4], [0.8, -0.4]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), M.wood); l.position.set(-5.5 + dx, 0.35, dz); table.add(l); }
  for (const dx of [-0.9, 0.9]) { const lip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.62), M.wood); lip.position.set(-5.5 + dx, 0.84, -0.62); table.add(lip); }
  table.traverse(o => { o.castShadow = o.receiveShadow = true; });
  scene.add(table);
  const railing = new THREE.Group();
  for (let z = -3.2; z <= 1.4; z += 0.7) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.2, 8), M.brassDark); p.position.set(18.98, TERRACE_Y + 0.6, z); railing.add(p); }
  for (const y of [TERRACE_Y + 0.75, TERRACE_Y + 1.15]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 4.7, 8), M.brass); b.rotation.x = Math.PI / 2; b.position.set(18.98, y, -0.9); railing.add(b); }
  railing.traverse(o => { o.castShadow = true; });
  scene.add(railing);

  // The descent chain, the bell at the Terraza's height, and chalk marks of the explorer's peaks.
  const chainG = world.chain ? chainProp(world.chain, M) : null;
  if (chainG) scene.add(chainG);
  const bell = world.bell ? new Bell(world.bell, TERRACE_Y, M) : null;
  if (bell) scene.add(bell.group);
  const apexMarks = new ApexMarks(scene, M, { bellLine: BELL_LINE });

  const sphereMeshes = new Map();
  for (const b of world.bodies) if (b.kind === 'sphere') { const m = sphereMesh(b.r, M); scene.add(m); sphereMeshes.set(b.id, m); }

  // Grass tufts on the walkable tops, leaning against the local pull with the wind.
  const blades = [];
  const bladeGeo = new THREE.ConeGeometry(0.025, 0.28, 3); bladeGeo.translate(0, 0.14, 0);
  const grass = new THREE.InstancedMesh(bladeGeo, new THREE.MeshLambertMaterial({ color: '#8fa35a' }), quality === 'low' ? 500 : 1100);
  let gs = 5; const gr = () => (gs = (gs * 16807) % 2147483647) / 2147483647;
  const tops = [[-21, -0.25, 0], [4.75, 18.7, TERRACE_Y]];
  for (let i = 0; i < grass.count; i++) {
    const [x0, x1, y] = tops[i % 2 ? 1 : 0];
    const x = x0 + gr() * (x1 - x0);
    let z = -3.3 + gr() * 4.8;
    if (Math.abs(z - Z_STREAM) < 0.95) z = gr() < 0.5 ? Z_STREAM - 1.0 - gr() * 0.5 : Z_STREAM + 1.0 + gr() * 0.3;
    if (Math.abs(z) < 0.35 && gr() < 0.75) z += 0.6;
    blades.push({ x, y, z, s: 0.6 + gr() * 0.8, rot: gr() * 6.28, ph: gr() * 6.28 });
    grass.setColorAt(i, new THREE.Color().setHSL(0.2 + gr() * 0.06, 0.35 + gr() * 0.2, 0.36 + gr() * 0.16));
  }
  grass.receiveShadow = true;
  scene.add(grass);
  const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3(), ga = { x: 0, y: 0 };
  const updateGrass = time => {
    blades.forEach((b, i) => {
      field.at(b.x, b.y + 0.1, ga);
      const g = Math.hypot(ga.x, ga.y) || 1;
      // Blades stand against the pull; where it weakens (the lip's band) the wind bends them more.
      const lean = (1 - Math.min(1, g / 9.8)) * 0.9 + Math.sin(time * 1.7 + b.ph) * 0.12;
      tmpE.set(0, b.rot, lean); tmpQ.setFromEuler(tmpE);
      tmpS.set(b.s, b.s, b.s);
      tmpP.set(b.x, b.y, b.z);
      tmpM.compose(tmpP, tmpQ, tmpS); grass.setMatrixAt(i, tmpM);
    });
    grass.instanceMatrix.needsUpdate = true;
  };
  updateGrass(0);

  const traces = new Traces(scene);
  const v3 = new THREE.Vector3();

  function update(dt, time, alpha) {
    for (const m of water) m.uniforms.uTime.value = time;
    parts.update(Math.min(dt, 1 / 20));
    moss.update(Math.min(dt, 1 / 30), time);
    plumbs.update(Math.min(dt, 1 / 30), time);
    for (const a of anchors) {
      const { inner, core } = a.userData;
      inner.rotation.z += dt * 1.6; inner.rotation.x = Math.sin(time * 0.7) * 0.4;
      core.material.color.setHSL(0.47, 0.6, 0.72 + 0.12 * Math.sin(time * 4.2));
    }
    for (const c of conduits) for (const { mesh, u } of c.userData.collars) mesh.material.color.setHSL(0.47, 0.55, 0.45 + 0.35 * Math.max(0, Math.sin(time * 4.2 - u * 9)));
    for (const b of world.bodies) {
      const m = sphereMeshes.get(b.id); if (!m) continue;
      const x = b.px + (b.x - b.px) * alpha, y = b.py + (b.y - b.py) * alpha;
      const dx = x - m.position.x;
      const z = b.heldBy?.type === 'shelf' ? -0.62 : b.heldBy?.type === 'hand' ? 0.08 : LANE_Z[b.lane];
      m.position.set(x, y, z);
      if (b.support) m.rotation.z -= dx / b.r;
    }
    world.stands.forEach((st, i) => { const b = st.body; v3.set(b.px + (b.x - b.px) * alpha, b.py + (b.y - b.py) * alpha + b.r * 0.9, LANE_Z[1]); stands[i].update(dt, { ...st, sagSign: 1 }, v3); });
    bell?.update(dt); apexMarks.update(dt);
    if (chainG) {
      const av = world.avatar, held = av.heldBy?.type === 'chain';
      const y = held ? av.py + (av.y - av.py) * alpha : chainG.userData.restY;
      chainG.userData.ring.position.y = y; chainG.userData.pointer.position.y = y;
    }
    traces.sync(world.traces, id => { const b = world.bodies.find(x => x.id === id); return LANE_Z[b?.lane ?? 0] + 0.22; });
    if ((time * 30 | 0) % 2 === 0) updateGrass(time);
  }

  function onEvent(e) {
    if (e.type === 'bell') bell?.ring(e.speed);
    // Chalk the buckle's peak on the Terraza's face for every attempt in the chasm.
    if (e.type === 'apex' && e.body === world.avatar.id && e.x > 0 && e.x < 4.6 && e.centre > 2.5) apexMarks.add(e.centre, e.from);
  }

  return { scene, sun, hemi, update, onEvent, clearChalk: () => apexMarks.clear(), arch, archMesh, sphereMeshes, M, plumbs, moss, parts };
}
