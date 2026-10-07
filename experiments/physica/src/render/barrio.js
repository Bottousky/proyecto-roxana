// Behind the Terraza's back wall (Hito B, B2): the walled arch, the passage through the rock and a
// neighbourhood of the city. The arch reads as decoration until the city has been seen; its
// infill is a stone leaf on a brass pivot (the mechanism shows its axis) that swings into the
// passage. Behind: familiar conditions — the fountain's water falls as water always falls,
// computed from the same field as the cascade's. Geometry for collisions lives in the level
// (passage and neighbourhood floors, walkable areas); this module only draws.
import * as THREE from 'three';
import { waterMaterial, waterTube, fieldPath } from './water.js';
import { Vegetation, PLANT } from './vegetation.js';
import { ARCH, BARRIO, TERRACE_Y } from '../sim/levels/cascada.js';

const Y = TERRACE_Y;

/** Canvas textures (procedural, tileable): masonry, flagstones, a façade with windows. */
function canvasTex(w, h, draw, repeat = true) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
let s = 21; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
const masonry = () => canvasTex(256, 256, (g, W, H) => { // the arch's infill: ashlar in the wall's own stone
  g.fillStyle = '#6e4a34'; g.fillRect(0, 0, W, H);
  const rows = 8, rh = H / rows;
  for (let r = 0; r < rows; r++) for (let x = -(r % 2) * 24; x < W; x += 48) {
    const v = 150 + rnd() * 34; g.fillStyle = `rgb(${v + 22},${v * 0.74},${v * 0.55})`; // the strata's sandstone
    g.fillRect(x + 2, r * rh + 2, 44, rh - 4);
  }
});
const flagstones = () => canvasTex(512, 512, (g, W, H) => {
  g.fillStyle = '#9c8564'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 64) for (let x = (y / 64) % 2 ? -48 : 0; x < W; x += 96) {
    const v = rnd(); g.fillStyle = `rgb(${214 + v * 22},${190 + v * 20},${150 + v * 18})`;
    g.fillRect(x + 3, y + 3, 90, 58);
    g.fillStyle = 'rgba(120,80,50,.08)'; for (let k = 0; k < 6; k++) g.fillRect(x + 3 + rnd() * 80, y + 3 + rnd() * 50, 6 + rnd() * 10, 2);
  }
});
const facade = (lit) => canvasTex(256, 256, (g, W, H) => { // one bay: cream wall, a window with brass frame
  g.fillStyle = '#efe2c4'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(160,120,80,.10)'; for (let k = 0; k < 40; k++) g.fillRect(rnd() * W, rnd() * H, 20 + rnd() * 30, 2);
  g.fillStyle = '#b8893c'; g.fillRect(70, 48, 116, 150);
  g.fillStyle = lit ? '#f4c879' : '#2f5560'; g.fillRect(80, 58, 96, 130);
  g.fillStyle = '#b8893c'; g.fillRect(124, 58, 8, 130); g.fillRect(80, 118, 96, 7);
  g.fillStyle = '#c96b48'; g.fillRect(60, 198, 136, 12); // sill
});

/** A box with per-face repeats so a façade texture keeps its bay size. */
function building(scene, { x0, x1, z0, z1, h, mats, roof = 'flat', front = 'z1' }) {
  const w = x1 - x0, d = z1 - z0, grp = new THREE.Group();
  const geo = new THREE.BoxGeometry(w, h, d);
  const face = (along) => { const m = mats.facade[rnd() < 0.3 ? 1 : 0].clone(); m.map = m.map.clone(); m.map.repeat.set(Math.max(1, Math.round(along / 1.6)), Math.max(1, Math.round(h / 1.6))); m.map.needsUpdate = true; return m; };
  const body = new THREE.Mesh(geo, [face(d), face(d), mats.roofTop, mats.roofTop, face(w), face(w)]);
  body.position.set((x0 + x1) / 2, Y + h / 2, (z0 + z1) / 2); body.castShadow = body.receiveShadow = true; grp.add(body);
  // terracotta cornice and a plinth: the strata's colours, ordered
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, 0.22, d + 0.24), mats.terracotta); cornice.position.set(body.position.x, Y + h + 0.11, body.position.z); grp.add(cornice);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.45, d + 0.06), mats.plinth); plinth.position.set(body.position.x, Y + 0.225, body.position.z); grp.add(plinth);
  if (roof === 'pitched') {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.01, Math.min(w, d) * 0.62, 1.1, 4, 1), mats.terracotta);
    r.rotation.y = Math.PI / 4; r.scale.set(w / Math.min(w, d), 1, d / Math.min(w, d)); r.position.set(body.position.x, Y + h + 0.77, body.position.z); r.castShadow = true; grp.add(r);
  }
  scene.add(grp); return grp;
}

export function buildBarrio(scene, { M, wallRock, field, zBack, streamZ, world }) {
  const door = world.doors[0];
  const mats = {
    facade: [new THREE.MeshStandardMaterial({ map: facade(false), roughness: 0.85 }), new THREE.MeshStandardMaterial({ map: facade(true), roughness: 0.85, emissive: '#3a2610', emissiveIntensity: 0.25 })],
    roofTop: new THREE.MeshStandardMaterial({ color: '#b65e3f', roughness: 0.9 }),
    terracotta: new THREE.MeshStandardMaterial({ color: '#b5603f', roughness: 0.8 }),
    plinth: new THREE.MeshStandardMaterial({ color: '#8f6a4c', roughness: 0.9 }),
  };
  const cx = (ARCH.x0 + ARCH.x1) / 2, aw = ARCH.x1 - ARCH.x0, zf = zBack + 0.012;

  // ---- the arch on the wall: pilasters, a semicircular tympanum, the brass keystone ----
  const frame = new THREE.Group(); scene.add(frame);
  for (const x of [ARCH.x0 - 0.15, ARCH.x1 + 0.15]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, ARCH.h, 0.24), M.enamel); p.position.set(x, Y + ARCH.h / 2, zf + 0.1); p.castShadow = true; frame.add(p); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(aw / 2 + 0.15, 0.15, 10, 32, Math.PI), M.enamel); ring.position.set(cx, Y + ARCH.h, zf + 0.1); frame.add(ring);
  const tympanum = new THREE.Mesh(new THREE.CircleGeometry(aw / 2, 32, 0, Math.PI), new THREE.MeshStandardMaterial({ map: masonry(), roughness: 0.95 })); tympanum.position.set(cx, Y + ARCH.h, zf + 0.02); frame.add(tympanum);
  const key = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.3), M.brass); key.position.set(cx, Y + ARCH.h + aw / 2 + 0.12, zf + 0.12); frame.add(key);
  // ---- the infill: a stone leaf on a brass pivot at the west jamb, swinging into the passage ----
  const pivot = new THREE.Group(); pivot.position.set(ARCH.x0 + 0.04, Y, zf - 0.02); scene.add(pivot);
  const leafMap = masonry(); leafMap.repeat.set(aw / 1.0, ARCH.h / 1.0);
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(aw - 0.08, ARCH.h - 0.04, 0.2), new THREE.MeshStandardMaterial({ map: leafMap, roughness: 0.95 }));
  leaf.position.set((aw - 0.08) / 2, ARCH.h / 2, -0.1); leaf.castShadow = leaf.receiveShadow = true; pivot.add(leaf);
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, ARCH.h + 0.3, 12), M.brass); axle.position.set(0, ARCH.h / 2, -0.02); pivot.add(axle);
  for (const yy of [0.25, ARCH.h - 0.25]) { const k = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 6, 12), M.brassDark); k.rotation.x = Math.PI / 2; k.position.set(0, yy, -0.02); pivot.add(k); }
  // ---- the mechanism, readable from the 2.5D view: a crank on the Terraza (in front of the
  // path), a brass shaft running into depth to the arch, a bevel gear turning the leaf's axle ----
  const lx = door.lever.x, shaftY = Y + 0.95;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.0, 12), M.brassDark); post.position.set(lx, Y + 0.5, -0.35); post.castShadow = true; scene.add(post);
  const crank = new THREE.Group(); crank.position.set(lx, shaftY, -0.24); scene.add(crank);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 24), M.brass); crank.add(wheel);
  for (const r of [0, Math.PI / 2]) { const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.03), M.brass); spoke.rotation.z = r; crank.add(spoke); }
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 8), M.leatherDark || M.brassDark); handle.rotation.x = Math.PI / 2; handle.position.set(0.22, 0, 0.08); crank.add(handle);
  const shaftLen = -0.3 - (zBack + 0.1);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, shaftLen, 10), M.brass); shaft.rotation.x = Math.PI / 2; shaft.position.set(lx, shaftY, (-0.3 + zBack + 0.1) / 2); shaft.castShadow = true; scene.add(shaft);
  for (let z = -0.9; z > zBack + 0.3; z -= 0.9) { const brace = new THREE.Mesh(new THREE.BoxGeometry(0.08, shaftY - Y, 0.08), M.brassDark); brace.position.set(lx, Y + (shaftY - Y) / 2, z); scene.add(brace); }
  const gear = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 14), M.brass); gear.rotation.x = Math.PI / 2; gear.position.set(lx, shaftY, zBack + 0.05); scene.add(gear);
  // light through the infill's joints, once the city has been seen (the Mirador points here)
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(aw - 0.12, ARCH.h - 0.1), new THREE.MeshBasicMaterial({ color: '#ffd89a', transparent: true, opacity: 0, depthWrite: false }));
  glow.position.set(cx, Y + ARCH.h / 2, zf + 0.115); scene.add(glow);
  const glowMap = canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.strokeStyle = '#fff'; g.lineWidth = 3;
    const rows = 8, rh = H / rows; for (let r = 1; r < rows; r++) { g.beginPath(); g.moveTo(0, r * rh); g.lineTo(W, r * rh); g.stroke(); }
    for (let r = 0; r < rows; r++) for (let x = -(r % 2) * 24; x < W; x += 48) { g.beginPath(); g.moveTo(x, r * rh); g.lineTo(x, (r + 1) * rh); g.stroke(); } }, false);
  glow.material.alphaMap = glowMap; glow.material.needsUpdate = true;
  // the footbridge over the Terraza's stream (a solid in the level, behind the 2.5D path)
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(aw + 0.3, 0.46, 2.0), M.stone); bridge.position.set(cx, Y - 0.07, streamZ); bridge.castShadow = bridge.receiveShadow = true; scene.add(bridge);

  // ---- the passage: the back wall is cut (scene.js); here its ceiling and two lamps ----
  // (the ceiling and the lamps go with the wall when it is cut away for the camera)
  // (lights are dimmed, not hidden: changing how many lights there are recompiles every lit material)
  const inWall = [], wallLights = [];
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(aw, -9 - zBack), wallRock); inWall.push(ceil); ceil.rotation.x = Math.PI / 2; ceil.position.set(cx, Y + ARCH.h, (zBack - 9) / 2); scene.add(ceil);
  const lampMat = new THREE.MeshBasicMaterial({ color: '#ffe2a8' });
  for (const [x, z] of [[ARCH.x0 + 0.05, -5.4], [ARCH.x1 - 0.05, -7.6]]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), lampMat); l.position.set(x, Y + 1.8, z); scene.add(l); inWall.push(l);
    const light = new THREE.PointLight('#ffc77a', 2.2, 4.5, 2); light.position.set(x + (x < cx ? 0.2 : -0.2), Y + 1.7, z); scene.add(light); wallLights.push(light);
  }

  // ---- the neighbourhood (drawn once the arch starts opening: before, it showed over the canyon's wall) ----
  const town = new THREE.Group(); town.visible = false; scene.add(town);
  scene = town; // everything below belongs to it
  const W = BARRIO.x1 - BARRIO.x0, D = -8.7 - BARRIO.z0, pz = (BARRIO.z0 - 8.7) / 2;
  const paveMap = flagstones(); paveMap.repeat.set(W / 3, D / 3);
  // (it starts at the passage's mouth: reaching into the passage it fought with the rock's top)
  const paveMat = new THREE.MeshStandardMaterial({ map: paveMap, roughness: 0.9 });
  const pave = new THREE.Mesh(new THREE.BoxGeometry(W + 6, 0.3, -9 - (BARRIO.z0 - 3.5)), paveMat);
  pave.position.set((BARRIO.x0 + BARRIO.x1) / 2, Y - 0.15, (-9 + BARRIO.z0 - 3.5) / 2); pave.receiveShadow = true; scene.add(pave);
  const lane = paveMap.clone(); lane.repeat.set(aw / 3, (zBack + 9) / 3); lane.needsUpdate = true;
  const passageFloor = new THREE.Mesh(new THREE.PlaneGeometry(aw, zBack + 9), new THREE.MeshStandardMaterial({ map: lane, roughness: 0.9 }));
  passageFloor.rotation.x = -Math.PI / 2; passageFloor.position.set(cx, Y + 0.004, (zBack - 9) / 2); passageFloor.receiveShadow = true; scene.add(passageFloor);
  // Under the wall the square's floor goes on: drawn only while the wall is cut away for the camera
  // (from the square, near the wall, the camera can be where the rock is).
  const under = [[BARRIO.x0 - 3, ARCH.x0], [ARCH.x1, BARRIO.x1 + 3]].map(([x0, x1]) => {
    const map = paveMap.clone(); map.repeat.set((x1 - x0) / 3, (zBack + 9) / 3); map.needsUpdate = true;
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.3, zBack + 9), new THREE.MeshStandardMaterial({ map, roughness: 0.9 }));
    m.position.set((x0 + x1) / 2, Y - 0.15, (zBack - 9) / 2); m.receiveShadow = true; m.visible = false; scene.add(m); return m;
  });
  // façades around three sides (the fourth is the rock the passage comes through)
  const west = [[-9.5, -12.6, 4.2], [-12.6, -16.4, 3.4, 'pitched'], [-16.4, -19.0, 4.8], [-19.0, -22.2, 3.8, 'pitched']];
  for (const [z1, z0, h, roof] of west) building(scene, { x0: BARRIO.x0 - 2.6, x1: BARRIO.x0 - 0.05, z0, z1, h, mats, roof });
  for (const [z1, z0, h, roof] of west) building(scene, { x0: BARRIO.x1 + 0.05, x1: BARRIO.x1 + 2.6, z0, z1, h: h + 0.4, mats, roof: roof ? undefined : 'pitched' });
  for (const [x0, x1, h, roof] of [[BARRIO.x0 - 2.6, 3.6, 3.8, 'pitched'], [3.6, 6.3, 4.6], [9.7, 12.4, 4.4, 'pitched'], [12.4, BARRIO.x1 + 2.6, 3.6]]) building(scene, { x0, x1, z0: BARRIO.z0 - 3.2, z1: BARRIO.z0 - 0.05, h, mats, roof });
  // the observatory closing the axis of the passage: a copper dome on a drum
  const obs = building(scene, { x0: 6.3, x1: 9.7, z0: BARRIO.z0 - 3.4, z1: BARRIO.z0 - 0.05, h: 5.2, mats });
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.7, 28), M.enamel); drum.position.set(8, Y + 5.55, BARRIO.z0 - 1.7); obs.add(drum);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.25, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4f9a86', metalness: 0.45, roughness: 0.4 }));
  dome.position.set(8, Y + 5.9, BARRIO.z0 - 1.7); dome.castShadow = true; obs.add(dome);
  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.0, 2.6), new THREE.MeshStandardMaterial({ color: '#2a1a12' })); slit.position.set(8, Y + 6.6, BARRIO.z0 - 1.7); obs.add(slit);

  // the fountain: a basin and a bowl whose four jets fall the familiar way (the same field)
  const fx = cx, fz = -15.2;
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.5, 40, 1, true), M.stone); basin.position.set(fx, Y + 0.25, fz); scene.add(basin);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.09, 8, 40), M.enamel); rim.rotation.x = Math.PI / 2; rim.position.set(fx, Y + 0.5, fz); scene.add(rim);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.52, 40), waterMaterial({ opacity: 0.9, streak: 0.3 })); pool.rotation.x = -Math.PI / 2; pool.position.set(fx, Y + 0.38, fz); pool.renderOrder = 2; scene.add(pool);
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.25, 16), M.enamel); column.position.set(fx, Y + 0.95, fz); scene.add(column);
  // the bowl: open, of the column's enamel (brass with nothing to reflect read black from below),
  // its water a little under the lip
  const bowlMat = M.enamel.clone(); bowlMat.side = THREE.DoubleSide;
  const bowlProfile = [[0.2, 0], [0.52, 0.2], [0.6, 0.25], [0.54, 0.26], [0.47, 0.18], [0, 0.17]].map(([r, y]) => new THREE.Vector2(r, y));
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(bowlProfile, 28), bowlMat); bowl.position.set(fx, Y + 1.49, fz); scene.add(bowl);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.575, 0.025, 6, 28), M.brass); lip.rotation.x = Math.PI / 2; lip.position.set(fx, Y + 1.745, fz); scene.add(lip);
  // computed where the jet really is (in depth too), then drawn around the fountain's centre
  // The central jet leaves at the chasm spring's speed (level.spring.vy): here, with no region, it
  // rises v²/2g ≈ 0.44 m and falls back into the bowl. The bowl overflows at four lips.
  const vJet = world.level.spring?.vy ?? 2.95;
  const jetUp = fieldPath(field, fx, Y + 1.74, 0.05, vJet, p => p.vy < 0 && p.y <= Y + 1.74, 2, fz).map(p => ({ ...p, x: p.x - fx }));
  const jetMat = waterMaterial({ streak: 1.2, opacity: 0.8 });
  const central = new THREE.Mesh(waterTube(jetUp, { zc: 0, thick: 0.11, wide: 0.13, foamStart: 0.7, foamEnd: 1.0, spread: 0 }), jetMat);
  central.position.set(fx, 0, fz); central.renderOrder = 3; scene.add(central);
  const bowlWater = new THREE.Mesh(new THREE.CircleGeometry(0.53, 28), waterMaterial({ opacity: 0.9, streak: 0.4 })); bowlWater.rotation.x = -Math.PI / 2; bowlWater.position.set(fx, Y + 1.725, fz); bowlWater.renderOrder = 2; scene.add(bowlWater);
  const spill = fieldPath(field, fx + 0.61, Y + 1.75, 0.35, 0, p => p.y <= Y + 0.4, 2, fz).map(p => ({ ...p, x: p.x - fx }));
  const spillGeo = waterTube(spill, { zc: 0, thick: 0.02, wide: 0.08, foamStart: 0.9, foamEnd: 1.0, spread: 0 });
  for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(spillGeo, jetMat); m.position.set(fx, 0, fz); m.rotation.y = k * Math.PI / 2 + Math.PI / 4; m.renderOrder = 3; scene.add(m); }
  // lamps at the corners of the square
  for (const [x, z] of [[BARRIO.x0 + 0.6, -10], [BARRIO.x1 - 0.6, -10], [BARRIO.x0 + 0.6, BARRIO.z0 + 0.6], [BARRIO.x1 - 0.6, BARRIO.z0 + 0.6]]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.6, 10), M.brassDark); post.position.set(x, Y + 1.3, z); post.castShadow = true; scene.add(post);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), lampMat); globe.position.set(x, Y + 2.7, z); scene.add(globe);
  }
  // gardens: the painted plants, in four beds around the fountain
  const spots = [];
  for (const [bx, bz] of [[fx - 3.2, fz - 2.6], [fx + 3.2, fz - 2.6], [fx - 3.2, fz + 2.8], [fx + 3.2, fz + 2.8]]) {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.35, 1.2), M.stone); bed.position.set(bx, Y + 0.175, bz); scene.add(bed);
    for (let i = 0; i < 7; i++) spots.push({ cell: [PLANT.saffron, PLANT.coral, PLANT.tuft, PLANT.tallGrass, PLANT.succulent][Math.floor(rnd() * 5)], x: bx + (rnd() - 0.5) * 1.6, y: Y + 0.35, z: bz + (rnd() - 0.5) * 0.9, h: 0.3 + rnd() * 0.35 });
  }
  const garden = new Vegetation(scene, field, { tops: [], spots, quality: 'high' });

  return {
    town,
    setCut(v) { for (const m of under) m.visible = v; for (const m of inWall) m.visible = !v; for (const l of wallLights) l.intensity = v ? 0 : 2.2; },
    // Driven by the simulation's door (one authority): the leaf swings 90° into the passage as the
    // crank and its shaft turn; the joints glow once the city has been seen.
    update(dt, time) {
      const t = door.open ? 1 : (door.openT || 0) / (door.swing || 1);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      pivot.rotation.y = e * Math.PI / 2;
      crank.rotation.z = -e * Math.PI * 3; shaft.rotation.y = -e * Math.PI * 3; gear.rotation.y = -e * Math.PI * 3;
      // Drawn once the arch opens. Drawn from the Mirador on, it peeked over the wall as a house on
      // the cliff and cost ~195 draw calls in every 2.5D frame at the Terraza (iteration 14): what
      // shows over the wall is to be its own designed silhouette.
      town.visible = door.open || door.opening;
      glow.material.opacity = world.citySeen && !door.open ? (0.35 + 0.15 * Math.sin(time * 2)) * (1 - e) : 0;
      jetMat.uniforms.uTime.value = time; pool.material.uniforms.uTime.value = time; bowlWater.material.uniforms.uTime.value = time;
      garden.update(time, null);
    },
  };
}
