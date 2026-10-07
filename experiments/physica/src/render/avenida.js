// Beyond the square's north street (Hito B, B3 «Introducción», D21): an avenue across, its platform
// (andén) with a kerb marked every metre, the track with its rails and the endless cable, the engine
// house whose drum always turns (the cable always runs; the car grips it), and the cable car with
// a ruler along its side. Geometry for collisions lives in the level; this module only draws. The
// static parts go into the neighbourhood's group (merged by material there); the car, the drum and
// the pulleys are returned to be kept apart and driven by `update`.
import * as THREE from 'three';
import { TERRACE_Y, CALLE, AVENIDA, CARRO } from '../sim/levels/cascada.js';
import { mergeStatic } from './merge.js';

const Y = TERRACE_Y;

/** A ruler strip: ticks every `step` m, a number every `every` m; `len` metres long. */
function rulerTexture(len, { step = 1, every = 2, px = 96, from = 0, bg = '#efe2c4', ink = '#3a2a1c' } = {}) {
  const c = document.createElement('canvas'); c.width = Math.round(len * px); c.height = 96;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = ink; g.font = 'bold 34px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
  for (let i = 0; i * step <= len + 1e-6; i++) {
    const m = i * step, x = Math.min(c.width - 2, Math.round(m * px)), major = Math.abs(m / every - Math.round(m / every)) < 1e-6;
    g.fillRect(x - (major ? 3 : 2), 0, major ? 6 : 4, major ? 44 : 26);
    // (the zero is labelled too, left-aligned at the edge: it is the reference)
    if (major && x < c.width - 20) { g.textAlign = x < 20 ? 'left' : 'center'; g.fillText(String(Math.round(from + m)), x < 20 ? x + 6 : x, 50); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function buildAvenida(scene, { M, mats, building, footprints, paveMat, world }) {
  const k = world.carriers.find(c => c.id === CARRO.id);
  const xw = AVENIDA.x0 - 2, xe = AVENIDA.x1 + 2, L = xe - xw;
  // (the square's paving at its own scale here: its texture repeat is set for the square)
  const pave = (w, d) => { const m = paveMat.clone(); m.map = paveMat.map.clone(); m.map.repeat.set(w / 3, d / 3); m.map.needsUpdate = true; return m; };
  // ---- the platform and its marked kerb ----
  const anden = new THREE.Mesh(new THREE.BoxGeometry(AVENIDA.x1 - AVENIDA.x0 + 4, 0.3, AVENIDA.andenZ1 - AVENIDA.andenZ0 + 1.2), pave(AVENIDA.x1 - AVENIDA.x0 + 4, AVENIDA.andenZ1 - AVENIDA.andenZ0 + 1.2));
  anden.position.set((AVENIDA.x0 + AVENIDA.x1) / 2, Y - 0.15, (AVENIDA.andenZ0 + AVENIDA.andenZ1 + 1.2) / 2); anden.receiveShadow = true; scene.add(anden);
  const kerbLen = AVENIDA.x1 - AVENIDA.x0;
  // (the marks are a strip on the kerb's top, read from behind the explorer: a box repeated them on its sides)
  const kerb = new THREE.Mesh(new THREE.BoxGeometry(kerbLen, 0.06, 0.36), M.stone);
  kerb.position.set((AVENIDA.x0 + AVENIDA.x1) / 2, Y + 0.03, AVENIDA.andenZ0 + 0.18); kerb.receiveShadow = true; scene.add(kerb);
  const marks = new THREE.Mesh(new THREE.PlaneGeometry(kerbLen, 0.3), new THREE.MeshStandardMaterial({ map: rulerTexture(kerbLen), roughness: 0.8 }));
  marks.rotation.x = -Math.PI / 2; marks.position.set((AVENIDA.x0 + AVENIDA.x1) / 2, Y + 0.061, AVENIDA.andenZ0 + 0.18); marks.receiveShadow = true; scene.add(marks);
  // ---- the avenue's south side beside the street: paved, with a low parapet (no buildings: the
  // camera, 4.6 m behind the explorer on the platform, passes there) ----
  for (const [x0, x1] of [[xw, CALLE.x0 - 0.02], [CALLE.x1 + 0.02, xe]]) {
    const yard = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.3, 9.5), pave(x1 - x0, 9.5)); yard.position.set((x0 + x1) / 2, Y - 0.15, AVENIDA.andenZ1 + 4.75); yard.receiveShadow = true; scene.add(yard);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.75, 0.3), M.stone); wall.position.set((x0 + x1) / 2, Y + 0.375, -31.4); wall.castShadow = wall.receiveShadow = true; scene.add(wall);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 + 0.06, 0.08, 0.4), M.enamel); cap.position.set((x0 + x1) / 2, Y + 0.79, -31.4); scene.add(cap);
  }
  // ---- the track: its bed, two rails, the cable in its slot ----
  const bedMat = new THREE.MeshStandardMaterial({ color: '#4a3b30', roughness: 1 });
  const bed = new THREE.Mesh(new THREE.BoxGeometry(L, 0.2, AVENIDA.andenZ0 - AVENIDA.z0), bedMat); bed.position.set((xw + xe) / 2, Y - 0.65, (AVENIDA.andenZ0 + AVENIDA.z0) / 2); bed.receiveShadow = true; scene.add(bed);
  for (const z of [CARRO.z0 + 0.45, CARRO.z1 - 0.45]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(L, 0.08, 0.08), M.brassDark); rail.position.set((xw + xe) / 2, Y - 0.51, z); scene.add(rail); }
  const zc = (CARRO.z0 + CARRO.z1) / 2;
  // the cable runs all the time (marks every 0.5 m that move along it): the car grips it to go
  const cc = document.createElement('canvas'); cc.width = 64; cc.height = 8; const cg = cc.getContext('2d'); cg.fillStyle = '#2a1a12'; cg.fillRect(0, 0, 64, 8); cg.fillStyle = '#d8c39a'; cg.fillRect(0, 0, 10, 8);
  const cableTex = new THREE.CanvasTexture(cc); cableTex.wrapS = THREE.RepeatWrapping; cableTex.repeat.set((L - 1) / 0.5, 1); cableTex.colorSpace = THREE.SRGBColorSpace;
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, L - 1, 8, 1, true), new THREE.MeshBasicMaterial({ map: cableTex }));
  cable.geometry.rotateZ(Math.PI / 2); // (its texture's u now runs along x)
  { const uv = cable.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i), uv.getX(i)); }
  cable.position.set((xw + xe) / 2 + 0.5, Y - 0.42, zc); scene.add(cable);
  // the far kerb of the avenue
  const farKerb = new THREE.Mesh(new THREE.BoxGeometry(L, 0.5, 0.4), M.stone); farKerb.position.set((xw + xe) / 2, Y - 0.3, AVENIDA.z0 - 0.2); scene.add(farKerb);
  const farWalk = new THREE.Mesh(new THREE.BoxGeometry(L, 0.3, 1.6), pave(L, 1.6)); farWalk.position.set((xw + xe) / 2, Y - 0.15, AVENIDA.z0 - 1.2); scene.add(farWalk);
  // ---- the north side: a row of façades; across the street, the powerhouse; the clock tower behind ----
  for (const [x0, x1, h, roof] of [[xw, 3.0, 7.0, 'pitched'], [3.0, 8.4, 8.4], [8.4, 9.6, 6.0], [12.5, 16.8, 7.6, 'pitched'], [16.8, xe, 6.6]]) building(scene, { x0, x1, z0: AVENIDA.z0 - 6.2, z1: AVENIDA.z0 - 2.0, h, mats, roof, footprints });
  // The powerhouse: a stone hall with a great arch, in which the drum that drives the cable turns.
  // Seen straight ahead coming down the street, and from the platform.
  const PH = { x0: 9.6, x1: 12.5, z0: AVENIDA.z0 - 6.2, z1: AVENIDA.z0 - 2.0, h: 5.4 }, phx = (PH.x0 + PH.x1) / 2;
  footprints.push({ ...PH, roof: 'flat' });
  const hall = new THREE.MeshStandardMaterial({ color: '#b59a7c', roughness: 0.9 });
  const piers = [[PH.x0, phx - 1.0], [phx + 1.0, PH.x1]];
  for (const [x0, x1] of piers) { const p = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, PH.h, PH.z1 - PH.z0), hall); p.position.set((x0 + x1) / 2, Y + PH.h / 2, (PH.z0 + PH.z1) / 2); p.castShadow = p.receiveShadow = true; scene.add(p); }
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.0, PH.h - 3.4, PH.z1 - PH.z0), hall); top.position.set(phx, Y + 3.4 + (PH.h - 3.4) / 2, (PH.z0 + PH.z1) / 2); scene.add(top);
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.4, 0.2), new THREE.MeshStandardMaterial({ color: '#2e2219', roughness: 1 })); back.position.set(phx, Y + 1.7, PH.z0 + 0.1); scene.add(back);
  const archT = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.12, 8, 20, Math.PI), M.enamel); archT.position.set(phx, Y + 2.4, PH.z1 + 0.06); scene.add(archT);
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(PH.x1 - PH.x0 + 0.3, 0.3, PH.z1 - PH.z0 + 0.3), mats.terracotta); cornice.position.set(phx, Y + PH.h + 0.15, (PH.z0 + PH.z1) / 2); scene.add(cornice);
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 3.2, 12), mats.terracotta); chimney.position.set(PH.x1 - 0.5, Y + PH.h + 1.6, PH.z0 + 0.7); scene.add(chimney);
  const wheelGroup = () => {
    const g = new THREE.Group();
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.09, 8, 32), M.brass); g.add(rim);
    for (let i = 0; i < 6; i++) { const spoke = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.08), M.brassDark); spoke.rotation.z = (i / 6) * Math.PI; g.add(spoke); }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 14), M.brassDark); hub.rotation.x = Math.PI / 2; g.add(hub);
    return g;
  };
  const drum = wheelGroup(); drum.position.set(phx, Y + 1.75, PH.z1 - 0.9); scene.add(drum);
  // the cable comes up from the track to the drum: two strands
  for (const dx of [-0.6, 0.6]) {
    const a0 = new THREE.Vector3(phx + dx, Y - 0.42, zc), a1 = new THREE.Vector3(phx + dx * 1.6, Y + 0.6, PH.z1 - 0.9), len = a0.distanceTo(a1);
    const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 6), M.ink); strand.position.copy(a0).add(a1).multiplyScalar(0.5);
    strand.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a1.clone().sub(a0).normalize()); scene.add(strand);
  }
  // return wheels at both ends of the line
  const retW = wheelGroup(); retW.scale.setScalar(0.45); retW.rotation.x = -Math.PI / 2; retW.position.set(xw + 0.6, Y - 0.42, zc); scene.add(retW);
  const retE = wheelGroup(); retE.scale.setScalar(0.45); retE.rotation.x = -Math.PI / 2; retE.position.set(xe - 0.6, Y - 0.42, zc); scene.add(retE);
  // stop posts on the platform, with a bell, at each stop
  for (const x of CARRO.stops) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.6, 10), M.brassDark); post.position.set(x + CARRO.len / 2 + 0.4, Y + 1.3, AVENIDA.andenZ0 + 0.9); post.castShadow = true; scene.add(post);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.42, 0.04), M.enamel); sign.position.set(x + CARRO.len / 2 + 0.4, Y + 2.35, AVENIDA.andenZ0 + 0.9); scene.add(sign);
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 0.05), mats.terracotta); band.position.set(x + CARRO.len / 2 + 0.4, Y + 2.35, AVENIDA.andenZ0 + 0.9); scene.add(band);
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.13, 0.18, 12, 1, true), M.brass); bell.position.set(x + CARRO.len / 2 + 0.4, Y + 2.0, AVENIDA.andenZ0 + 0.98); scene.add(bell);
  }
  // ---- the car: a deck on wheels, a bench, a lantern at each end, a ruler along its side ----
  const car = new THREE.Group();
  const D = CARRO.z1 - CARRO.z0, deckMat = new THREE.MeshStandardMaterial({ color: '#8a5a36', roughness: 0.75 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(CARRO.len, CARRO.h, D), deckMat); deck.position.y = Y - CARRO.h / 2; deck.castShadow = deck.receiveShadow = true; car.add(deck);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(CARRO.len + 0.04, 0.08, D + 0.04), M.brass); trim.position.y = Y - 0.04; car.add(trim);
  // the car's own ruler, on its deck along the platform's side (its side face is below the platform's level)
  // (its full length: its zero is the car's west end, from where the recorder measures)
  const ruler = new THREE.Mesh(new THREE.PlaneGeometry(CARRO.len, 0.34), new THREE.MeshStandardMaterial({ map: rulerTexture(CARRO.len, { step: 0.5, every: 1, px: 128, bg: '#d9a441', ink: '#1e140c' }), roughness: 0.5, metalness: 0.2 }));
  ruler.rotation.x = -Math.PI / 2; ruler.position.set(0, Y + 0.005, D / 2 - 0.17); ruler.receiveShadow = true; car.add(ruler);
  for (const sx of [-1, 1]) for (const z of [-D / 2 + 0.45, D / 2 - 0.45]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16), M.brassDark); wh.rotation.x = Math.PI / 2; wh.position.set(sx * (CARRO.len / 2 - 0.5), Y - 0.5, z); car.add(wh); }
  const bench = new THREE.Mesh(new THREE.BoxGeometry(CARRO.len - 0.6, 0.12, 0.45), M.woodLight); bench.position.set(0, Y + 0.45, -D / 2 + 0.3); bench.castShadow = true; car.add(bench);
  for (const sx of [-1, 1]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.4), M.wood); leg.position.set(sx * (CARRO.len / 2 - 0.5), Y + 0.22, -D / 2 + 0.3); car.add(leg); }
  // a canopy on four posts and a rail along the far side: the deck reads as a vehicle
  // (the canopy over the bench only: over the whole deck it hid half the view from aboard)
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(CARRO.len + 0.2, 0.08, D * 0.45), mats.terracotta); canopy.position.set(0, Y + 2.3, -D / 2 + D * 0.225); canopy.castShadow = true; car.add(canopy);
  for (const sx of [-1, 1]) for (const z of [-D / 2 + 0.06, -D / 2 + D * 0.45 - 0.06]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.3, 8), M.brassDark); p.position.set(sx * (CARRO.len / 2 - 0.06), Y + 1.15, z); car.add(p); }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(CARRO.len - 0.1, 0.05, 0.05), M.brass); rail.position.set(0, Y + 0.9, -D / 2 + 0.06); car.add(rail);
  for (const sx of [-1, 1]) { const endRail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, D - 0.9), M.brass); endRail.position.set(sx * (CARRO.len / 2 - 0.06), Y + 0.9, -0.4); car.add(endRail); }
  const lampMat = new THREE.MeshBasicMaterial({ color: '#ffe2a8' });
  for (const sx of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.5, 8), M.brassDark); post.position.set(sx * (CARRO.len / 2 - 0.12), Y + 0.75, D / 2 - 0.12); car.add(post);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), lampMat); lamp.position.set(sx * (CARRO.len / 2 - 0.12), Y + 1.58, D / 2 - 0.12); car.add(lamp);
  }
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.1), M.brassDark); grip.position.set(0, Y - 0.62, zc - (CARRO.z0 + CARRO.z1) / 2); car.add(grip);
  // the recorder (D22): a brass clockwork box at the deck's east corner, its lamp saying its state
  // (beside the bench, behind where the explorer stands: walking the deck it went through the box)
  const RZ = -D / 2 + 0.75, RX = CARRO.len / 2 - 0.22;
  const recBox = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.22), M.brass); recBox.position.set(RX, Y + 0.7, RZ); recBox.castShadow = true; car.add(recBox);
  const recPost = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.58, 8), M.brassDark); recPost.position.set(RX, Y + 0.29, RZ); car.add(recPost);
  const recDial = new THREE.Mesh(new THREE.CircleGeometry(0.085, 20), M.enamel); recDial.position.set(RX, Y + 0.71, RZ + 0.115); car.add(recDial);
  car.position.set(k.x, 0, zc); scene.add(car);
  // each moving part is merged within itself (one mesh per material: the car ~30 meshes → a handful)
  for (const g of [car, drum, retW, retE]) mergeStatic(g);
  // (added after merging: they change) the recorder's lamp and hand; its marks
  const recLamp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: '#3a2a1c' })); recLamp.position.set(RX, Y + 0.88, RZ); car.add(recLamp);
  const recHand = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.07, 0.01), M.ink); recHand.geometry.translate(0, 0.035, 0); recHand.position.set(RX, Y + 0.71, RZ + 0.12); car.add(recHand);
  const TRIP = Math.abs(CARRO.stops[1] - CARRO.stops[0]) / CARRO.speed + CARRO.ramp, MAXM = Math.ceil(TRIP / 0.5) + 4, mtx = new THREE.Matrix4();
  // one colour per mark, the same in the three records (chalk, ink, the car's notch): mark n pairs up by
  // colour, cycling every 6 marks (3 s), plus a thread from each notch to its chalk (its length is the tape's reading)
  const hues = ['#d6402a', '#e9a032', '#3f9a4a', '#2f7fd0', '#7a4fc2', '#c23f8e'].map(c => new THREE.Color(c));
  // chalk on the kerb: a short blue bar across its strip at each mark (the ground's record; white on
  // the cream kerb did not read)
  // (alternating two blues, and the ink two reds, mark by mark: the n-th chalk and the n-th ink pair up)
  const chalk = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.08, 0.12).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff' }), MAXM);
  chalk.count = 0; chalk.frustumCulled = false; scene.add(chalk);
  // the car's own notch on the kerb at each mark (its west end, the tape's zero): from notch to chalk,
  // the tape's reading — the sum, mark by mark, on the ground
  const notch = new THREE.InstancedMesh(new THREE.CircleGeometry(0.07, 3).rotateX(-Math.PI / 2).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff' }), MAXM);
  notch.count = 0; notch.frustumCulled = false; scene.add(notch);
  const thread = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 0.018).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 }), MAXM);
  thread.count = 0; thread.frustumCulled = false; scene.add(thread);
  const v3 = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  // ink on the car's tape: a dark red mark at each mark; the ones in the same place stack across the
  // tape into a column (many marks in one place, not one)
  const ink = new THREE.InstancedMesh(new THREE.CircleGeometry(0.032, 14).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff' }), MAXM);
  ink.count = 0; ink.frustumCulled = false; car.add(ink);
  // how many ink marks a column holds, written beside it (×22): one bar would read as one mark
  const makeCount = parent => { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); sp.scale.set(0.42, 0.21, 1); sp.visible = false; sp.renderOrder = 9; parent.add(sp); return { sp, c, t }; };
  const inkCounts = [makeCount(car), makeCount(car)], chalkCount = makeCount(scene); // (the two largest ink columns; the chalk's too)
  const writeCount = ({ sp, c, t }, n) => { const g = c.getContext('2d'); g.clearRect(0, 0, 128, 64); g.fillStyle = 'rgba(30,20,12,0.85)'; g.beginPath(); g.roundRect(4, 8, 120, 48, 14); g.fill(); g.fillStyle = '#f6e7c4'; g.font = 'bold 34px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`×${n}`, 64, 33); t.needsUpdate = true; };
  let lastMarks = 0, flash = 0;
  let shownTrip = -1, shown = 0;
  let spin = 0;
  return {
    keep: [car, drum, retW, retE, cable],
    update(dt, time, alpha = 1) {
      car.position.x = (k.px ?? k.x) + (k.x - (k.px ?? k.x)) * alpha;
      // the cable runs at the car's cruising speed, always: its marks move along, the wheels turn
      spin += dt * CARRO.speed; drum.rotation.z = -spin / 1.15; retW.rotation.z = retE.rotation.z = spin / (1.15 * 0.45);
      cableTex.offset.x = -spin / 0.5;
      // the recorder: its marks (the latest recorded trip), its lamp (amber set, green marking)
      const r = world.recorder;
      if (r.trip !== shownTrip || (r.version || 0) !== shown) {
        shownTrip = r.trip; shown = r.version || 0; const n = Math.min(MAXM, r.marks.length);
        const inkGroups = new Map(), gGroups = new Map();
        for (let i = 0; i < n; i++) {
          const m = r.marks[i], col = hues[i % hues.length];
          // coincident marks stack ACROSS each strip (never along it: that would falsify the reading)
          const onG = r.marks.slice(0, i).filter(o => Math.abs(o.g - m.g) < 0.06).length;
          const gk = r.marks.findIndex(o => Math.abs(o.g - m.g) < 0.06); gGroups.set(gk, (gGroups.get(gk) || 0) + 1);
          const gz = AVENIDA.andenZ0 + 0.27 - Math.min(0.2, onG * 0.035);
          mtx.makeTranslation(CARRO.kerb0 + m.g, Y + 0.066, gz); chalk.setMatrixAt(i, mtx); chalk.setColorAt(i, col);
          const nx = CARRO.kerb0 + m.k - CARRO.len / 2;
          mtx.makeTranslation(nx, Y + 0.067, AVENIDA.andenZ0 + 0.06); notch.setMatrixAt(i, mtx); notch.setColorAt(i, col);
          // the thread from the notch to the chalk, slightly offset per mark so overlapping ones stay apart
          const x0 = nx, x1 = CARRO.kerb0 + m.g, tz = AVENIDA.andenZ0 + 0.1 + (i % hues.length) * 0.012;
          v3.set((x0 + x1) / 2, Y + 0.0665, tz); sc.set(Math.max(0.01, Math.abs(x1 - x0)), 1, 1); mtx.compose(v3, q, sc); thread.setMatrixAt(i, mtx); thread.setColorAt(i, col);
          const stack = r.marks.slice(0, i).filter(o => Math.abs(o.c - m.c) < 0.06).length;
          const ck = r.marks.findIndex(o => Math.abs(o.c - m.c) < 0.06); inkGroups.set(ck, (inkGroups.get(ck) || 0) + 1);
          mtx.makeTranslation(m.c - CARRO.len / 2, Y + 0.012, D / 2 - 0.17 - 0.14 + Math.min(0.28, stack * 0.0125)); ink.setMatrixAt(i, mtx); ink.setColorAt(i, col);
        }
        chalk.count = ink.count = notch.count = thread.count = n;
        for (const im of [chalk, ink, notch, thread]) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
        // a count beside each group of 3 or more (the two largest on the tape, the largest on the kerb)
        const ig = [...inkGroups].filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]);
        inkCounts.forEach((L, j) => { const g = ig[j]; L.sp.visible = !!g; if (g) { writeCount(L, g[1]); L.sp.position.set(r.marks[g[0]].c - CARRO.len / 2 + 0.28, Y + 0.25, D / 2 - 0.17); } });
        const gg = [...gGroups].filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1])[0];
        chalkCount.sp.visible = !!gg; if (gg) { writeCount(chalkCount, gg[1]); chalkCount.sp.position.set(CARRO.kerb0 + r.marks[gg[0]].g + 0.3, Y + 0.25, AVENIDA.andenZ0 + 0.3); }
      }
      if ((r.version || 0) !== lastMarks) { if (r.state === 'on') flash = 0.15; lastMarks = r.version || 0; }
      flash = Math.max(0, flash - dt);
      // the lamp: amber set, green marking (a flash at each mark), cream done, red cut; the hand: one division per mark
      recLamp.material.color.set(r.state === 'armed' ? '#f0b04a' : r.state === 'on' ? (flash > 0 ? '#e9ffe6' : '#4fc65e') : r.state === 'done' ? '#efe6c8' : r.state === 'cut' ? '#d0402a' : '#3a2a1c');
      recHand.rotation.z = -r.marks.length * Math.PI * 2 / 24;
    },
  };
}
