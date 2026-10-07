// La cascada ascendente: the diorama. Composition, left to right — a familiar waterfall
// feeds a stream along the Orilla that sinks through a grate into the rock; it wells up at
// the bottom of the chasm, and from that deepest start the region lifts it higher than
// anything else: it crests over the high Terraza and falls again, familiarly, past the
// railing. Two ordinary falls frame the anomaly.
import * as THREE from 'three';
import { rockMaterial, strataBlock, setWetZones } from './rock.js';
import { waterMaterial, waterTube, waterSheet, fieldPath, foamMound } from './water.js';
import { Particles } from './particles.js';
import { Moss, Plumbs } from './flora.js';
import { Vegetation } from './vegetation.js';
import { buildBarrio } from './barrio.js';
import { makeMaterials, Stand, sphereMesh, fieldAnchor, conduit, Traces, chainProp, Bell, ApexMarks } from './props.js';
import { STREAM_SPEED, TERRACE_Y, BELL_LINE, WELL, MIRADOR_Y, MIRADOR_LINE, ARCH, BARRIO } from '../sim/levels/cascada.js';

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

export function buildScene(world, opts = {}) {
  const { quality = 'high' } = opts;
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
  // Rock wetted by water: the chasm pool's walls and floor, the cascade's landing on the
  // Terraza, the left fall's basin, the right fall's shelf and the Pozo's water line.
  setWetZones([
    [0, -5, -3.6, 4.5, -3.35, 1.6],
    [4.5, 4.2, -2.8, 6.6, 4.5, -0.7],
    [-21.8, -0.4, -3.6, -18.8, 0.25, -0.6],
    [19.5, -1.8, -3.6, 23.5, -1.2, 1.6],
    [11, -1.2, -3.6, 12.6, -0.45, 1.6],
    [4.35, 2.6, -2.6, 4.65, 4.45, -0.8],   // the Terraza's face where the crest spills over
  ]);
  const rock = rockMaterial({ mossAmount: 1 });
  rock.side = THREE.DoubleSide;
  const add = (geo, mat = rock, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.castShadow = shadow; scene.add(m); return m; };

  // Walkable ground. Tops are exactly the simulation's solids.
  add(strataBlock({ x0: -22, x1: 0, y0: -9, y1: 0, z0: Z_BACK, z1: Z_FRONT, seed: 1, sides: ['e'] }));
  // Terraza, the Pozo cut through it, the Mirador and its steps (front lanes only: the stream
  // runs behind them at the Terraza's level).
  add(strataBlock({ x0: 4.5, x1: WELL.x0, y0: -9, y1: TERRACE_Y, z0: Z_BACK, z1: Z_FRONT, seed: 1, sides: ['w', 'e'] }));
  add(strataBlock({ x0: WELL.x0, x1: WELL.x1, y0: -11, y1: WELL.floorY - 0.2, z0: Z_BACK, z1: Z_FRONT, seed: 1, sides: [] }));
  add(strataBlock({ x0: WELL.x1, x1: 17.7, y0: -9, y1: TERRACE_Y, z0: Z_BACK, z1: -1.0, seed: 1, sides: ['w'] }));
  add(strataBlock({ x0: WELL.x1, x1: 16.5, y0: -9, y1: MIRADOR_Y, z0: -1.0, z1: Z_FRONT, seed: 1, sides: ['w', 'e'] }));
  add(strataBlock({ x0: 16.5, x1: 17.1, y0: -9, y1: MIRADOR_Y - 0.3, z0: -1.0, z1: Z_FRONT, seed: 1, sides: ['e'], rim: 0.06 }));
  add(strataBlock({ x0: 17.1, x1: 17.7, y0: -9, y1: MIRADOR_Y - 0.6, z0: -1.0, z1: Z_FRONT, seed: 1, sides: ['e'], rim: 0.06 }));
  add(strataBlock({ x0: 17.7, x1: 19.5, y0: -9, y1: TERRACE_Y, z0: Z_BACK, z1: Z_FRONT, seed: 1, sides: ['e'] }));
  add(strataBlock({ x0: 19.5, x1: 24, y0: -9, y1: -1.5, z0: Z_BACK, z1: Z_FRONT, seed: 1, sides: ['w'] }));
  add(strataBlock({ x0: -0.6, x1: 5.1, y0: -11, y1: -4.6, z0: Z_BACK, z1: Z_FRONT, seed: 1, sides: [] }));
  // Back walls: a stepped skyline of strata. The chasm keeps its own back wall.
  // Behind the Terraza the wall is cut by the walled arch's passage (Hito B): the blocks on either
  // side are its walls, a lintel spans it and the block under it is its floor.
  const backs = [[-26, -14, 8.2, 21], [-14, -6, 6.1, 22], [-6, 0, 5.0, 23], [0, 4.5, 6.6, 24], [4.5, ARCH.x0, 8.6, 25], [ARCH.x1, 12, 8.6, 25], [12, 26, 10.6, 26]];
  const backRock = rockMaterial({ mossAmount: 0.7, shade: 0.38, detail: 0.35 }); backRock.side = THREE.DoubleSide;
  // Back walls receive shadows but do not cast them (nothing in front of them needs their shade).
  // One relief seed and one darkening reference for all the back walls: no seams between them.
  // The stretch of wall between the Terraza and the square: from the square the camera may need it
  // out of the way (setWallCut).
  // (the same rock, with a dissolve: it fades out in ~0.2 s instead of popping)
  const dissolve = { value: 0 }, cutRock = rockMaterial({ mossAmount: 0.7, shade: 0.38, detail: 0.35, dissolve }); cutRock.side = THREE.DoubleSide;
  // (the blocks take the dissolving rock only while the cut is under way: its discard would cost the
  // early depth test in every 2.5D frame. Its program is compiled at start-up with the rest: the
  // passage's ceiling is made of it)
  const wallCut = [], wallExtras = [];
  for (const [x0, x1, top] of backs) {
    const m = add(strataBlock({ x0, x1, y0: -11, y1: top, z0: -9, z1: Z_BACK, seed: 2, sides: ['w', 'e'], step: 0.32, topRef: 11 }), backRock, false);
    if (x1 > BARRIO.x0 - 0.5 && x0 < BARRIO.x1 + 0.5) wallCut.push(m);
  }
  wallCut.push(add(strataBlock({ x0: ARCH.x0, x1: ARCH.x1, y0: TERRACE_Y + ARCH.h, y1: 8.6, z0: -9, z1: Z_BACK, seed: 2, sides: [], step: 0.32, topRef: 11 }), backRock, false));
  wallCut.push(add(strataBlock({ x0: ARCH.x0, x1: ARCH.x1, y0: -11, y1: TERRACE_Y, z0: -9, z1: Z_BACK, seed: 2, sides: [], step: 0.32, topRef: 11 }), backRock, false));
  const barrio = buildBarrio(scene, { M, streamZ: Z_STREAM, wallRock: backRock, cutRock, field, zBack: Z_BACK, world });
  let wallIsCut = false, frontView = true;
  // `now`: the camera is inside the rock, the wall must be gone this frame
  const setWallCut = (v, now = false) => { wallIsCut = v; if (now && v) dissolve.value = 1; };
  const updateCut = dt => {
    dissolve.value = THREE.MathUtils.clamp(dissolve.value + (wallIsCut ? 1 : -1) * dt / 0.22, 0, 1);
    const mat = dissolve.value > 0 ? cutRock : backRock;
    for (const m of wallCut) { m.visible = dissolve.value < 1; m.material = mat; }
    for (const m of wallExtras) m.visible = dissolve.value <= 0.5;
    barrio.setDissolve(dissolve.value);
  };
  // World edges: tall rock you can see, not an invisible wall.
  add(strataBlock({ x0: -30, x1: -22, y0: -9, y1: 13, z0: -9, z1: Z_FRONT + 0.6, seed: 1, sides: ['e'], step: 0.32 }), backRock, false);

  // Distance, in layers (art-source/physica/*-v2.png, see art/PROCEDENCIA.md):
  //  (a row of extruded 3D mesas in between was tried and removed: flat cardboard next to both)
  //  · the painted far mesas (z −110), with an empty hazy valley behind the Mirador;
  //  · the city (z −90), shown by an explicit switch once discovered from the Mirador — not
  //    hidden by whatever happens to occlude it.
  // The paintings carry their own haze and do not take the scene's fog.
  const loadTex = (f) => { const t = new THREE.TextureLoader().load(import.meta.env.BASE_URL + 'textures/' + f); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const painted = (file, { w, h, z, x, y, order, tint = '#ffffff' }) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: loadTex(file), transparent: true, fog: false, depthWrite: false, color: tint }));
    m.position.set(x, y, z); m.renderOrder = order; scene.add(m); return m;
  };
  // Far mesas: the valley (u ≈ 0.65 of the painting) lies behind the Mirador (x ≈ 13).
  painted('backdrop-mesas.png', { w: 230, h: 153, z: -110, x: 13 + (0.5 - 0.62) * 230, y: 30, order: -6, tint: '#fbefe2' });
  const city = painted('city-layer.png', { w: 66, h: 44, z: -90, x: 13, y: 6, order: -5, tint: '#e9dfe6' });
  city.material.opacity = 0.92;
  city.visible = false;
  // Valley haze: the city's base dissolves into it instead of ending on a cut line, and a wide
  // band below covers the paintings' lower edges.
  const hazeTex = (() => {
    const W = 256, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H;
    const k = c.getContext('2d'), img = k.createImageData(W, H);
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = y / (H - 1), u = x / (W - 1), side = sm(0, 0.22, u) * sm(1, 0.78, u);
      const a = sm(0.05, 0.62, v) * side, i = (y * W + x) * 4;
      img.data[i] = 236; img.data[i + 1] = 190; img.data[i + 2] = 150; img.data[i + 3] = Math.round(a * 255);
    }
    k.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(150, 40), new THREE.MeshBasicMaterial({ map: hazeTex, transparent: true, fog: false, depthWrite: false }));
  haze.position.set(13, -9, -86); haze.renderOrder = -4; scene.add(haze);
  const hazeLow = new THREE.Mesh(new THREE.PlaneGeometry(460, 70), new THREE.MeshBasicMaterial({ map: hazeTex, transparent: true, fog: false, depthWrite: false }));
  hazeLow.position.set(13, -48, -95); hazeLow.renderOrder = -5; scene.add(hazeLow);

  // Stream curbs along the Orilla and the Terraza.
  const curb = (x0, x1, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.14, 0.18), M.stone); b.position.set((x0 + x1) / 2, y + 0.07, z); b.castShadow = b.receiveShadow = true; scene.add(b); };
  const DRAIN_X = -1.7;
  curb(-19.4, DRAIN_X + 0.5, 0, Z_STREAM + 0.82); curb(-19.4, DRAIN_X + 0.5, 0, Z_STREAM - 0.82);
  // The stream's end: a stone basin with an iron grate; the water goes into the rock.
  const basin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 1.9), M.stone); basin.position.set(DRAIN_X, 0.1, Z_STREAM); basin.castShadow = basin.receiveShadow = true; scene.add(basin);
  for (let i = -3; i <= 3; i++) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 1.3), M.brassDark); bar.position.set(DRAIN_X + i * 0.1, 0.205, Z_STREAM); scene.add(bar); }
  // Water: everything from the field.
  const water = [];
  // Draw order for transparent water: sheets (2), then streams (3), then foam (4); sorting by
  // bounding-sphere centre let the chasm pool cover the column's root.
  const mkWater = (geo, opts, order = 3) => { const m = waterMaterial(opts); const mesh = new THREE.Mesh(geo, m); mesh.renderOrder = order; scene.add(mesh); water.push(m); return mesh; };
  const mkSheet = (geo, opts) => mkWater(geo, opts, 2), mkFoam = (geo, opts) => mkWater(geo, { veil: 1, opacity: 0.85, ...opts }, 4);
  // Each stream is a body plus a torn, foamy veil around it (apparent volume without a fluid
  // simulation); foam mounds where water wells up or lands.
  const stream = (path, o, mat = {}) => {
    mkWater(waterTube(path, o), { streak: 1.3, wobble: 0.025, ...mat });
    mkWater(waterTube(path, { ...o, thick: o.thick * 1.55, wide: o.wide * 1.18, segs: 18 }), { streak: 1.3, veil: 1, wobble: 0.07, opacity: 0.85, ...mat });
  };
  const leftFall = fieldPath(field, -20.3, 7.6, 0.9, 0, p => p.y <= 0.05);
  stream(leftFall, { zc: -3.05, thick: 0.5, wide: 1.2, foamStart: 0.15, foamEnd: 0.3, spread: 0.5 });
  const lfEnd = leftFall[leftFall.length - 1];
  mkFoam(foamMound({ x: lfEnd.x, y: 0.03, z: -2.95, r: 0.5, h: 0.4 }), { wobble: 0.05 });
  mkSheet(waterSheet({ x0: -21.4, x1: -18.9, y: 0.03, z0: -3.5, z1: -0.9, speed: 0.8, foamAt: [{ r: 1.0 }], radial: { x: lfEnd.x, z: -3.05 } }), { opacity: 0.9 });
  mkSheet(waterSheet({ x0: -18.9, x1: DRAIN_X, y: 0.035, z0: Z_STREAM - 0.72, z1: Z_STREAM + 0.72, speed: STREAM_SPEED, foamAt: [{ x: DRAIN_X, r: 0.8 }], tOffset: -18.9 / STREAM_SPEED }), { streak: 1.4 });
  // The chasm pool, and the water that wells up from it and rises: integrated from the field.
  const spring = world.level.spring;
  // The chasm pool: ripples travel outward from where the water wells up.
  mkSheet(waterSheet({ x0: 0.05, x1: 4.45, y: -3.86, z0: -3.45, z1: 1.45, speed: 0.35, foamAt: [{ r: 0.9 }], radial: { x: spring.x, z: Z_STREAM } }), { opacity: 0.95, deep: '#0f5a63', shallow: '#3aa9a6' });
  const arch = fieldPath(field, spring.x, spring.y, spring.vx, spring.vy, p => p.vy < 0 && p.y <= TERRACE_Y + 0.04 && p.x > 4.6);
  // The crest is where the column slows to its apex: there it widens and breaks into froth.
  const apexI = arch.reduce((bi, p, i) => (p.y > arch[bi].y ? i : bi), 0), apexT = arch[apexI].t;
  // Same width and lane as the channels it joins; glassy where it wells up, white only where it
  // breaks at the crest and where it lands (the familiar falls are white at their foot instead).
  stream(arch, { zc: Z_STREAM, thick: 0.6, wide: 1.3, foamStart: 0.12, foamEnd: 0.32, spread: 0, foamAt: [{ t: apexT, dt: 0.35, w: 0.6 }] }, { streak: 1.5 });
  const archMesh = null;
  mkFoam(foamMound({ x: spring.x, y: -3.86, z: Z_STREAM, r: 0.5, h: 0.28 }), { wobble: 0.04 });
  // The crest: where the column turns over, the water spreads into a torn crown of froth
  // (a stream cannot stay a thick ribbon around a curve tighter than its own thickness).
  const ap = arch[apexI];
  mkFoam(foamMound({ x: ap.x, y: ap.y - 0.32, z: Z_STREAM, r: 0.58, h: 0.62 }), { wobble: 0.06 });
  const land = arch[arch.length - 1];
  mkFoam(foamMound({ x: land.x + 0.1, y: TERRACE_Y + 0.03, z: Z_STREAM, r: 0.45, h: 0.3 }), { wobble: 0.05 });
  curb(land.x - 0.4, 18.9, TERRACE_Y, Z_STREAM + 0.82); curb(land.x - 0.4, 18.9, TERRACE_Y, Z_STREAM - 0.82);
  // The Terraza's stream crosses the Pozo on a small aqueduct.
  const aq = new THREE.Mesh(new THREE.BoxGeometry(WELL.x1 - WELL.x0 + 0.3, 0.42, 1.75), M.stone); aq.position.set((WELL.x0 + WELL.x1) / 2, TERRACE_Y - 0.21, Z_STREAM); aq.castShadow = aq.receiveShadow = true; scene.add(aq);
  // Water at the bottom of the Pozo, and two seeping pipes in its wall: above the region's
  // floor their drops rise, below it they fall.
  mkSheet(waterSheet({ x0: WELL.x0 + 0.02, x1: WELL.x1 - 0.02, y: WELL.floorY + 0.28, z0: Z_BACK, z1: Z_FRONT - 0.1, speed: 0.2 }), { opacity: 0.88 });
  for (const py of [WELL.regionY0 + 0.75, WELL.regionY0 - 0.5]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 10), M.brassDark); pipe.rotation.z = Math.PI / 2; pipe.position.set(WELL.x0 + 0.12, py, -1.2); scene.add(pipe);
  }
  mkSheet(waterSheet({ x0: land.x - 0.3, x1: 19.55, y: TERRACE_Y + 0.035, z0: Z_STREAM - 0.72, z1: Z_STREAM + 0.72, speed: STREAM_SPEED, foamAt: [{ x: land.x, r: 1.0 }], tOffset: land.t }), { streak: 1.4 });
  const rightFall = fieldPath(field, 19.55, TERRACE_Y + 0.03, 1.5, 0, p => p.y <= -1.45);
  stream(rightFall, { zc: Z_STREAM, thick: 0.46, wide: 1.5, foamStart: 0.15, foamEnd: 0.3, spread: 0.5 });
  const rfEnd = rightFall[rightFall.length - 1];
  mkFoam(foamMound({ x: rfEnd.x, y: -1.47, z: Z_STREAM, r: 0.6, h: 0.4 }), { wobble: 0.05 });
  mkSheet(waterSheet({ x0: 19.6, x1: 23.5, y: -1.47, z0: -3.4, z1: 1.2, speed: 0.9, foamAt: [{ r: 1.3 }], radial: { x: rfEnd.x, z: Z_STREAM } }), { opacity: 0.9 });

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
  arch.zc = Z_STREAM; arch.wide = 1.3;
  parts.addEmitter({ rate: 60 * k, make: sprayFrom(arch, 0.04, 0.06) });
  parts.addEmitter({ rate: 70 * k, make: sprayFrom(arch, 0.55, 0.7) });
  const apexF = apexI / (arch.length - 1);
  parts.addEmitter({ rate: 110 * k, make: sprayFrom(arch, apexF, 0.1) });   // the crest breaking
  parts.addEmitter({ rate: 50 * k, make: sprayFrom(arch, 0.98, 0.04) });
  parts.addEmitter({ rate: 40 * k, make: sprayFrom(leftFall, 0.97, 0.06) });
  parts.addEmitter({ rate: 30 * k, make: sprayFrom(rightFall, 0.97, 0.06) });
  // Mist: large, faint, slow — it hangs around the crest.
  // (the rising drops fade before reaching the aqueduct's stone; particles do not collide)
  for (const py of [WELL.regionY0 + 0.75, WELL.regionY0 - 0.5]) parts.addEmitter({ rate: 7 * k, make: ps => ({ x: WELL.x0 + 0.3, y: py, z: -1.2 + (ps.rnd() - 0.5) * 0.1,
    vx: 0.35 + ps.rnd() * 0.15, vy: 0, life: py > WELL.regionY0 ? 1.15 : 1.0, size: 0.06, alpha: 0.85, color: [0.8, 0.97, 1], drag: 0.3 }) });
  parts.addEmitter({ rate: 9 * k, make: ps => { const p = pick(arch, 0.7 + ps.rnd() * 0.25); return { x: p.x + (ps.rnd() - 0.5), y: p.y, z: Z_STREAM + (ps.rnd() - 0.5) * 1.8, vx: (ps.rnd() - 0.5) * 0.3, vy: 0, life: 3 + ps.rnd() * 2, size: 0.9 + ps.rnd() * 0.8, alpha: 0.12, color: [1, 0.98, 0.95], drag: 4 }; } });
  // Pollen from the chasm moss: heavy drag, so it drifts at its terminal speed.
  parts.addEmitter({ rate: 26 * k, make: ps => ({ x: 0.2 + ps.rnd() * 4.1, y: -4.3 + ps.rnd() * 6, z: -3.2 + ps.rnd() * 4.6, vx: 0, vy: 0, vz: 0,
    life: 7 + ps.rnd() * 6, size: 0.035 + ps.rnd() * 0.03, alpha: 0.9, color: [1, 0.93, 0.66], drag: 3.2 }) });
  // ... and from the Orilla's grass, where the same pollen falls.
  parts.addEmitter({ rate: 8 * k, make: ps => ({ x: -12 + ps.rnd() * 11, y: 0.2 + ps.rnd() * 2.5, z: -3 + ps.rnd() * 4.4, life: 5 + ps.rnd() * 4, size: 0.035, alpha: 0.8, color: [1, 0.93, 0.66], drag: 3.2 }) });

  // Moss beards on the chasm walls and along the lips: they hang along the local pull.
  const moss = new Moss(field);
  let ms = 77; const mr = () => (ms = (ms * 16807) % 2147483647) / 2147483647;
  // Olive and sage, close together: wide differences made tonal steps between neighbouring pieces.
  const mossCols = ['#7d8f4e', '#87985a', '#74874a', '#8fa062'];
  // Instruments first: no root within 0.55 m (height) of an anchor ring on the same wall.
  const zc = field.zones[0];
  const ringsAt = (x, z) => (z < -2 ? [[0, zc.y0], [4.5, zc.y0], [0, zc.y1], [4.5, zc.y1]]
    : [[WELL.x0, WELL.regionY0], [WELL.x1, WELL.regionY0], [WELL.x0, TERRACE_Y - 0.25], [WELL.x1, TERRACE_Y - 0.25]]).filter(r => Math.abs(r[0] - x) < 0.2);
  const clear = (x, y, z) => !ringsAt(x, z).some(r => Math.abs(r[1] - y) < 0.55);
  // Two layers at the back, at uneven heights (four at a fixed step stacked into a solid band; one
  // near the measuring plane sat right behind the ruler's labels).
  for (let y = -0.25; y > -4.5; y -= 0.36 + mr() * 0.22) for (const z of [-3.3, -2.9]) {
    const y0 = y + (mr() - 0.5) * 0.15, y1 = y + TERRACE_Y + (mr() - 0.5) * 0.15, zz = z + (mr() - 0.5) * 0.2;
    if (clear(0, y0, zz)) moss.add({ root: [0.02, y0, zz], n: 6, len: 0.07 + mr() * 0.07, dir: [0.2, -1], wall: { value: 0.03, side: 1 }, width: 0.22, color: mossCols[Math.floor(mr() * 4)] });
    if (clear(4.5, y1, zz)) moss.add({ root: [4.48, y1, zz], n: 6, len: 0.07 + mr() * 0.07, dir: [-0.2, -1], wall: { value: 4.47, side: -1 }, width: 0.22, color: mossCols[Math.floor(mr() * 4)] });
  }
  // Along each lip a continuous fringe: pieces close together, overlapping, of uneven length,
  // with a few gaps; the fringe is thicker in some stretches than in others.
  const fringe = (x0, x1, y) => {
    for (let x = x0; x < x1; x += 0.13 + mr() * 0.12) {
      if (mr() < 0.2) { x += 0.4 + mr() * 0.9; continue; }
      // mostly short, now and then a long beard (lengths up to ~3:1), so it is not a trim
      const long = mr() < 0.14, len = long ? 0.09 + mr() * 0.05 : 0.03 + mr() * 0.04;
      moss.add({ root: [x, y - 0.1, Z_FRONT + 0.12 + mr() * 0.03], n: 5, len, dir: [0, -1], width: (long ? 0.24 : 0.18) + mr() * 0.1, color: mossCols[Math.floor(mr() * 4)] });
    }
  };
  fringe(-14, -0.2, 0); fringe(4.8, 18.5, TERRACE_Y); fringe(WELL.x1 + 0.2, 16.3, MIRADOR_Y);
  // In the Pozo: behind the measuring plane (in front, it covered the numbers), clear of its anchors.
  // (From 0.6 m under the lip: a beard rising in the Pozo's region from higher up stuck out of
  // the shaft's mouth into the air.)
  for (let y = TERRACE_Y - 0.6; y > WELL.floorY + 0.4; y -= 0.38) for (const z of [-3.2, -1.5]) {
    if (clear(WELL.x0, y, z)) moss.add({ root: [WELL.x0 + 0.02, y, z], n: 5, len: 0.08, dir: [0.2, -1], wall: { value: WELL.x0 + 0.03, side: 1 }, width: 0.15, color: mossCols[Math.floor(mr() * 4)] });
    if (clear(WELL.x1, y, z)) moss.add({ root: [WELL.x1 - 0.02, y, z], n: 5, len: 0.08, dir: [-0.2, -1], wall: { value: WELL.x1 - 0.03, side: -1 }, width: 0.15, color: mossCols[Math.floor(mr() * 4)] });
  }
  scene.add(moss.build());

  // Measuring mast with plumb bobs on the Orilla's lip, reaching over the chasm.
  const plumbs = new Plumbs(field, M);
  const mastX = -0.42, mastZ = -0.8;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 6.0, 10), M.brassDark); mast.position.set(mastX, 3.0, mastZ); mast.castShadow = true; scene.add(mast);
  const mastFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.12, 12), M.stone); mastFoot.position.set(mastX, 0.06, mastZ); scene.add(mastFoot);
  // Not a ladder: angled brackets at uneven heights, closer together around the region's top
  // edge (y = 3) where the bobs flip, their tips staggered so the bobs never line up as a rail.
  // None inside the field's transition band (2.7–3.3): a bob there lies sideways and reads as broken,
  // and B's arm crosses at 2.92. The nearest pair, one pointing up below and one hanging above,
  // frames the edge, which is marked on the mast by a brass collar.
  // (The first hanging one is at 4.1: lower, its bracket crosses the edge's brass anchor wheel.)
  for (const [y, tipX] of [[0.65, 0.5], [1.15, 0.6], [2.3, 0.5], [4.1, 0.56], [4.8, 0.5], [5.5, 0.58]]) {
    const rise = 0.28, dx = tipX - mastX, L = Math.hypot(dx, rise);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(L, 0.028, 0.028), M.brass);
    arm.position.set(mastX + dx / 2, y - rise / 2, mastZ); arm.rotation.z = Math.atan2(rise, dx); scene.add(arm); // no shadow: it drew a lattice on the wall
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 6, 12), M.brassDark); hook.position.set(tipX, y, mastZ); scene.add(hook);
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.05), M.ink); tick.position.set(mastX - 0.06, y - rise, mastZ + 0.03); scene.add(tick);
    plumbs.addBob([tipX, y, mastZ]);
  }
  // The edge on the mast: a band in the glow of the anchors that mark the region's corners (the
  // same mark for the same thing), wider than the mast, with a short pointer toward the bobs; just
  // above B's arm (2.92), which lights cream when B is active.
  const edgeCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 18), M.core); edgeCollar.position.set(mastX, 3.04, mastZ); scene.add(edgeCollar);
  const edgePointer = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.035), M.core); edgePointer.position.set(mastX + 0.3, 3.04, mastZ); scene.add(edgePointer);
  // A second plumb mast down the Pozo: the bobs show where its region ends below.
  const wmX = WELL.x1 - 0.15, wmTip = WELL.x1 - 0.65;
  const wmZ = -0.4;   // close to the measuring plane, so its bobs line up with the numbers
  const wmast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, TERRACE_Y - WELL.floorY, 10), M.brassDark); wmast.position.set(wmX, (TERRACE_Y + WELL.floorY) / 2, wmZ); scene.add(wmast);
  for (let y = WELL.floorY + 0.5; y <= TERRACE_Y - 0.4 + 1e-6; y += 0.5) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(wmX - wmTip, 0.025, 0.025), M.brass); arm.position.set((wmX + wmTip) / 2, y, wmZ); scene.add(arm);
    plumbs.addBob([wmTip, y, wmZ]);
  }
  scene.add(plumbs.group);

  // The apparatus that sustains the region: four anchors and their supply conduits,
  // running back into the rock toward something that is not part of this landscape.
  const anchors = [];
  const zr = world.field.zones[0];
  for (const [x, y] of [[0, zr.y0], [4.5, zr.y0], [0, zr.y1], [4.5, zr.y1]]) {
    const a = fieldAnchor(M, { x, y, z: Z_BACK + 0.12 }); scene.add(a); anchors.push(a);
  }
  // In the narrow Pozo the anchors sit near the lanes (z −0.9), not on the far back wall, so
  // they appear at their true heights next to the numbers.
  for (const [x, y] of [[WELL.x0 + 0.12, WELL.regionY0], [WELL.x1 - 0.12, WELL.regionY0], [WELL.x0 + 0.12, TERRACE_Y - 0.25], [WELL.x1 - 0.12, TERRACE_Y - 0.25]]) {
    const a = fieldAnchor(M, { x, y, z: -0.9 }); a.scale.setScalar(0.45); scene.add(a); anchors.push(a);
  }
  const conduits = [
    conduit(M, [[0, 3, Z_BACK + 0.05], [-0.8, 4.2, Z_BACK - 0.2], [-2.5, 4.9, Z_BACK - 0.6], [-4, 5.3, -5.5]]),
    // (kept west of the arch's passage, which it used to cross)
    conduit(M, [[4.5, 3, Z_BACK + 0.05], [5.2, 4.6, Z_BACK - 0.2], [5.9, 6.5, Z_BACK - 0.5], [6.4, 7.6, -5.5]]),
    conduit(M, [[0, -3.4, Z_BACK + 0.05], [1.2, -4.3, Z_BACK - 0.2], [2.25, -4.5, -5.2]]),
    conduit(M, [[4.5, -3.4, Z_BACK + 0.05], [3.3, -4.3, Z_BACK - 0.2], [2.25, -4.5, -5.2]]),
  ];
  for (const c of conduits) scene.add(c);
  wallExtras.push(conduits[1]); // it runs into that stretch of wall

  // Supports, table and test spheres.
  const standById = new Map();
  const stands = world.stands.map(st => {
    // At its own depth: the square's support stands behind the wall, inside the neighbourhood.
    const deep = st.z !== undefined && st.z < -1;
    const s = new Stand({ ...st, z: deep ? st.z - 0.35 : -1.0, laneZ: deep ? st.z : LANE_Z[1],
      ruler: st.id === 'A' ? { x: st.x + 0.5, y0: 0, y1: 3, z: -0.75 } : deep ? { x: st.clampX + 0.35, y0: st.baseY, y1: st.baseY + 3, z: st.z - 0.25 } : null }, M); // (beyond the sphere: the explorer stands between it and the post)
    (deep ? barrio.town : scene).add(s.group); standById.set(st.id, s); return s;
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
  const chainGs = world.chains.map(ch => { const g = chainProp(ch, M); g.userData.id = ch.id; scene.add(g); return g; });
  const bells = new Map(world.bells.map(bl => {
    // The cascade's bell hangs from the Orilla side (beside the plumb mast): a gallows from the
    // Terraza crossed the column right at its crest and sliced it visually.
    const b = bl.id === 'pozo' ? new Bell(bl, MIRADOR_Y, M, WELL.x1 + 0.35) : new Bell(bl, 0, M, -0.42);
    scene.add(b.group); return [bl.id, b];
  }));
  const apexMarks = new ApexMarks(scene, M, { bellLine: BELL_LINE });
  const wellMarks = new ApexMarks(scene, M, { bellLine: MIRADOR_LINE, x0: WELL.x1 - 0.45, x1: WELL.x1 - 0.05 });

  const sphereMeshes = new Map();
  for (const b of world.bodies) if (b.kind === 'sphere') { const m = sphereMesh(b.r, M); scene.add(m); sphereMeshes.set(b.id, m); }

  // Vegetation with identity (painted plants, vegetation.js): tufts, flowers, moss cushions and
  // succulents on the walkable tops, reeds along the channels, ferns out of the faces of the
  // chasm and of the Pozo. The ferns' tips follow the local field: they flip at each region's edge.
  // Instruments come first: no tall plant behind a support, the mast, a bell or the table.
  const instrumentX = [-2.9, -1.0, mastX, 10.1, WELL.x1 + 0.35, -5.5];
  const veg = new Vegetation(scene, field, {
    quality,
    tops: [[-21, -0.25, 0], [4.75, WELL.x0 - 0.1, TERRACE_Y], [WELL.x1 + 0.1, 16.4, MIRADOR_Y], [17.8, 18.7, TERRACE_Y]],
    avoid: (x, z, tall) => Math.abs(z - Z_STREAM) < 0.95 || (x > -6.5 && x < -4.5 && z < -0.2) || (x > ARCH.x0 - 0.8 && x < ARCH.x1 + 0.8 && z < 0.5) ||
      (tall && z < 0.3 && instrumentX.some(ix => Math.abs(x - ix) < 0.6)),
    streams: [{ x0: -18.5, x1: DRAIN_X - 0.7, y: 0, z: Z_STREAM, half: 0.82 }, { x0: land.x + 0.6, x1: WELL.x0 - 0.4, y: TERRACE_Y, z: Z_STREAM, half: 0.82 },
      { x0: WELL.x1 + 0.4, x1: 18.4, y: TERRACE_Y, z: Z_STREAM, half: 0.82 }],
    // Ferns on the Terraza's face only: it crosses the region's top edge (y = 3), so they curl up
    // below it and droop above it. A gap at 2.75–3.6 leaves the edge's anchor in view (it is on the
    // back wall and, seen from the camera, lands there). They stay behind the measurement plane
    // (labels at z 0.08), short enough to keep clear of the rising column, and a second layer
    // behind the water lane thickens the band around the edge.
    // Above the edge they are shorter (the crest passes close to the face there) and start higher,
    // so their droop stays clear of the edge's anchor ring.
    walls: [{ x: 4.5, nx: -1, z: [[-0.75, -0.45]], bands: [[-0.9, 2.6]], step: 0.5 },
      { x: 4.5, nx: -1, z: [[-0.75, -0.45]], bands: [[3.9, 4.3]], step: 0.36, scale: 0.68 },
      { x: 4.5, nx: -1, z: [[-3.1, -2.7]], bands: [[1.4, 2.3], [3.9, 4.3]], step: 0.5, scale: 0.85 }],
  });

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
      const z = b.z ? b.z : b.heldBy?.type === 'shelf' ? -0.62 : b.heldBy?.type === 'hand' ? 0.08 : LANE_Z[b.lane];
      m.position.set(x, y, z);
      m.visible = z > -4 || (barrio.town.visible && !frontView); // behind the wall: only with the neighbourhood, seen from beyond the arch
      if (b.support) m.rotation.z -= dx / b.r;
    }
    world.stands.forEach((st, i) => { const b = st.body; v3.set(b.px + (b.x - b.px) * alpha, b.py + (b.y - b.py) * alpha + b.r * 0.9, b.z || LANE_Z[1]); stands[i].update(dt, { ...st, sagSign: 1 }, v3); });
    for (const b of bells.values()) b.update(dt);
    apexMarks.update(dt);
    for (const g of chainGs) {
      const av = world.avatar, held = av.heldBy?.type === 'chain' && av.heldBy.chain.id === g.userData.id;
      const y = held ? av.py + (av.y - av.py) * alpha : g.userData.restY;
      g.userData.ring.position.y = y; g.userData.pointer.position.y = y;
    }
    traces.sync(world.traces, id => { const b = world.bodies.find(x => x.id === id); return (b?.z || LANE_Z[b?.lane ?? 0]) + 0.22; });
    for (const it of traces.items.values()) if (it.z < -4) it.group.visible = !frontView; // behind the wall: seen from beyond the arch
    if ((time * 30 | 0) % 2 === 0) { const av = world.avatar; veg.update(time, { x: av.x, y: av.y - av.hh }); }
    barrio.update(dt, time); updateCut(dt);
  }

  function onEvent(e) {
    if (e.type === 'bell') bells.get(e.bell || 'cascada')?.ring(e.speed);

    // Landing in the Pozo's water splashes.
    if (e.type === 'impact' && e.kind === 'avatar' && e.x > WELL.x0 && e.x < WELL.x1 && e.y < WELL.floorY + 1.2) {
      parts.burst(26, ps => ({ x: e.x + (ps.rnd() - 0.5) * 0.5, y: WELL.floorY + 0.3, z: (ps.rnd() - 0.5) * 0.8, vx: (ps.rnd() - 0.5) * 2, vy: 1.5 + ps.rnd() * 2.5,
        vz: (ps.rnd() - 0.5) * 1.5, life: 0.6 + ps.rnd() * 0.5, size: 0.06 + ps.rnd() * 0.06, alpha: 0.9, color: [0.85, 0.98, 1], drag: 0.5 }));
    }
    // Chalk the buckle's peak on the Terraza's face for every attempt in the chasm.
    if (e.type === 'apex' && e.body === world.avatar.id && e.x > 0 && e.x < 4.6 && e.centre > 2.5) apexMarks.add(e.centre, e.from);
    if (e.type === 'apex' && e.body === world.avatar.id && e.x > WELL.x0 && e.x < WELL.x1 && e.centre > TERRACE_Y) wellMarks.add(e.centre, e.from);
  }

  // The sphere a prompt refers to: a soft ring around it while that prompt is shown.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.016, 8, 40), new THREE.MeshBasicMaterial({ color: '#fff1c8', transparent: true, opacity: 0.8, depthWrite: false }));
  ring.visible = false; ring.renderOrder = 8; scene.add(ring);
  let ringId = null, activeStand = null;
  // The active support: its sphere ringed, and its arm and clamp lit, so the prompt, the sphere
  // and the post the explorer stands at read as one apparatus.
  function highlight(h) {
    ringId = h?.body ?? null; ring.visible = ringId != null;
    const st = h ? standById.get(h.stand) : null;
    if (st !== activeStand) { activeStand?.setActive(false); st?.setActive(true); activeStand = st; }
  }
  function updateRing(time) {
    activeStand?.pulse(time);
    if (ringId == null) return;
    const m = sphereMeshes.get(ringId); if (!m) { ring.visible = false; return; }
    ring.position.copy(m.position); ring.position.z += 0.05;
    const k = 1 + 0.06 * Math.sin(time * 5); ring.scale.set(k, k, k); ring.material.opacity = 0.55 + 0.3 * Math.sin(time * 5);
  }
  return { scene, sun, hemi, update: (dt, time, alpha) => { update(dt, time, alpha); updateRing(time); }, onEvent, highlight, setCityVisible: v => { city.visible = v; }, setWallCut, setFront: (v, cam) => { frontView = v; barrio.setFront(v, cam); }, clearChalk: id => (id === 'mirador' ? wellMarks : apexMarks).clear(), arch, archMesh, sphereMeshes, M, plumbs, moss, parts, veg };
}
