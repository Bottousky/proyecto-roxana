// Beyond the square's north street (Hito B, B3 «Introducción», D21): an avenue across, its platform
// (andén) with a kerb marked every metre, the track with its rails and the endless cable, the engine
// house whose drum always turns (the cable always runs; the car grips it), and the cable car with
// a ruler along its side. Geometry for collisions lives in the level; this module only draws. The
// static parts go into the neighbourhood's group (merged by material there); the car, the drum and
// the pulleys are returned to be kept apart and driven by `update`.
import * as THREE from 'three';
import { TERRACE_Y, CALLE, AVENIDA, CARRO, JALONES, ENCARGO } from '../sim/levels/cascada.js';
import { mergeStatic } from './merge.js';
import { describeTrip, shownTry } from '../journal.js';

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

/** A surveyor's pole (jalón): red and white bands every 0.2 m, a steel point. Origin at its point. */
export function jalonMesh(M, h = 1.6) {
  const c = document.createElement('canvas'); c.width = 8; c.height = 64; const g = c.getContext('2d');
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f4ece0' : '#c8321f'; g.fillRect(0, i * 8, 8, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, h / 1.6);
  const grp = new THREE.Group();
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h - 0.12, 10), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); rod.position.y = 0.12 + (h - 0.12) / 2; rod.castShadow = true; grp.add(rod);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 10), M.brassDark); tip.rotation.x = Math.PI; tip.position.y = 0.06; grp.add(tip);
  return grp;
}

/** A small sign texture with lines of text. */
function signTexture(lines, { w = 256, h = 160, bg = '#f1e6cc', ink = '#3a2a1c', band = '#b5603f' } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = band; g.fillRect(0, 0, w, 30);
  g.fillStyle = '#f6ecd6'; g.font = 'bold 22px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lines[0], w / 2, 16);
  const step = (h - 40) / Math.max(1, lines.length - 1);
  g.fillStyle = ink; lines.slice(1).forEach((l, i) => { g.font = `${i === lines.length - 2 ? `bold ${Math.min(40, w / 2.4)}px` : '24px'} Inter, system-ui, sans-serif`; g.fillText(l, w / 2, 36 + step * (i + 0.6)); });
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
  // The stops: a post right where the car's tape zero (its west end) stops, its sign pointing down at a
  // yellow plate on the kerb with the zero of the car's tape (the same yellow), and a bell.
  let westPlate = null;
  CARRO.stops.forEach((x, si) => {
    const x0 = x - CARRO.len / 2, zero = Math.round((x0 - CARRO.kerb0) * 10) / 10, pz = AVENIDA.andenZ0 + 0.75;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.6, 10), M.brassDark); post.position.set(x0 - 0.45, Y + 1.3, pz); post.castShadow = true; scene.add(post);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.04), M.brassDark); arm.position.set(x0 - 0.2, Y + 2.62, pz); scene.add(arm);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.62), new THREE.MeshStandardMaterial({ map: signTexture([si === 0 ? 'PARADA OESTE' : 'PARADA ESTE', 'aquí para el 0', 'del carro:', `${String(zero).replace('.', ',')} m ↓`], { h: 200 }), roughness: 0.7 }));
    sign.position.set(x0, Y + 2.25, pz + 0.03); scene.add(sign);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.66, 0.03), M.brassDark); back.position.set(x0, Y + 2.25, pz); scene.add(back);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.34), new THREE.MeshStandardMaterial({ map: signTexture(['', '0'], { w: 64, h: 100, bg: '#d9a441', band: '#d9a441', ink: '#1e140c' }), roughness: 0.5 }));
    plate.rotation.x = -Math.PI / 2; plate.position.set(x0 + 0.11, Y + 0.0665, AVENIDA.andenZ0 + 0.52); scene.add(plate);
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.013, 0.5), M.ink); pin.position.set(x0, Y + 0.066, AVENIDA.andenZ0 + 0.4); scene.add(pin);
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.13, 0.18, 12, 1, true), M.brass); bell.position.set(x0 - 0.45, Y + 1.9, pz + 0.08); scene.add(bell);
  });
  const eastZero = Math.round((CARRO.stops[1] - CARRO.len / 2 - CARRO.kerb0) * 10) / 10, fmtM = v => String(v).replace('.', ',');
  // The line's plate, on the car (seen aboard, where the place on the car is chosen): where the car's zero
  // stops at each stop, and the neighbour's errand once asked. (On the west stop's post it read as that
  // stop's name, and it fell out of the frame from 2.5 m of the tape.)
  const westZero = Math.round((CARRO.stops[0] - CARRO.len / 2 - CARRO.kerb0) * 10) / 10;
  const lc = document.createElement('canvas'); lc.width = 360; lc.height = 230; const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace;
  const linePlate = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.61), new THREE.MeshStandardMaterial({ map: lt, roughness: 0.7 }));
  westPlate = { c: lc, t: lt, key: '' };
  const drawWestPlate = target => {
    const key = String(target); if (key === westPlate.key) return; westPlate.key = key;
    const g = lc.getContext('2d'); g.fillStyle = '#f1e6cc'; g.fillRect(0, 0, 360, 230); g.fillStyle = '#b5603f'; g.fillRect(0, 0, 360, 36);
    g.fillStyle = '#f6ecd6'; g.font = 'bold 24px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LÍNEA DEL CARRO', 180, 19);
    g.fillStyle = '#3a2a1c'; g.font = '23px Inter, system-ui, sans-serif'; g.fillText('El 0 del carro para en:', 180, 60);
    g.font = 'bold 26px Inter, system-ui, sans-serif'; g.fillText(`← oeste ${fmtM(westZero)} m   ·   este ${fmtM(eastZero)} m →`, 180, 96);
    if (target != null) { g.fillStyle = '#3f6f7a'; g.fillRect(10, 130, 340, 90); g.fillStyle = '#f6ecd6'; g.font = 'bold 23px Inter, system-ui, sans-serif'; g.fillText('Encargo: tu última tiza', 180, 154); g.fillText(`en ${fmtM(target)} m, viajando quieto`, 180, 182); g.font = '20px Inter, system-ui, sans-serif'; g.fillText('hacia la parada este →', 180, 206); }
    lt.needsUpdate = true;
  };
  drawWestPlate(null);
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
  // the line's plate on a short post at the deck's west end, facing the camera
  // (east of the canopy's corner post, which covered a smaller one)
  const lpPost = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), M.brassDark); lpPost.position.set(-CARRO.len / 2 + 0.62, Y + 0.55, D / 2 - 0.12); car.add(lpPost);
  linePlate.position.set(-CARRO.len / 2 + 0.62, Y + 1.38, D / 2 - 0.1); car.add(linePlate);
  car.position.set(k.x, 0, zc); scene.add(car);
  // the jalones' rack (two spare poles stay in it), and the neighbour's jalón on the kerb
  const rack = new THREE.Group(); rack.position.set(JALONES.x, Y, JALONES.z - 0.15);
  const rackBar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.06), M.wood); rackBar.position.y = 1.0; rack.add(rackBar);
  for (const sx of [-0.32, 0.32]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.05, 0.06), M.wood); leg.position.set(sx, 0.52, 0); rack.add(leg); }
  for (const sx of [-0.2, 0.0]) { const p = jalonMesh(M); p.position.set(sx, 0.02, -0.06); p.rotation.x = -0.12; rack.add(p); }
  scene.add(rack);
  // her jalón (moved to the next target once one is met), its flag, and a box on the kerb's chalk band
  // that is the tolerance (±15 cm): the last chalk must fall inside it
  const her = new THREE.Group(); scene.add(her);
  const herJalon = jalonMesh(M); herJalon.position.set(0, Y + 0.06, AVENIDA.andenZ0 + 0.3); her.add(herJalon);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.15), new THREE.MeshStandardMaterial({ color: '#3f6f7a', side: THREE.DoubleSide })); flag.geometry.translate(0.12, 0, 0); flag.position.set(0, Y + 1.58, AVENIDA.andenZ0 + 0.3); her.add(flag);
  const tol = ENCARGO.tol;
  for (const dx of [-tol, tol]) { const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.016, 0.3).rotateX(-Math.PI / 2), M.ink); bar.position.set(dx, Y + 0.0668, AVENIDA.andenZ0 + 0.2); her.add(bar); }
  for (let i = 0; i < 5; i++) for (const dz of [0.06, 0.34]) { const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.012).rotateX(-Math.PI / 2), M.ink); dash.position.set(-tol + 0.03 + i * 0.06, Y + 0.0668, AVENIDA.andenZ0 + dz); her.add(dash); }
  // her speech bubble (what she asks, how the last try went), over her head
  const makeBubble = (parent, x, y, z, scale = 1) => { const c = document.createElement('canvas'); c.width = 512; c.height = 200; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); sp.scale.set(2.0 * scale, 0.78 * scale, 1); sp.renderOrder = 10; sp.visible = false; sp.position.set(x, y, z); parent.add(sp); return { sp, c, t, key: '' }; };
  const bub = makeBubble(scene, ENCARGO.vecina.x - 0.15, Y + 2.62, ENCARGO.vecina.z, 0.78); // (smaller, right over her: wider, it covered the passenger's number or left the frame)
  const say = (lines, b = bub) => {
    const key = lines.join('|'); if (key === b.key) return; b.key = key;
    const g = b.c.getContext('2d'); g.clearRect(0, 0, 512, 200);
    g.fillStyle = 'rgba(250,243,228,0.96)'; g.strokeStyle = '#3a2a1c'; g.lineWidth = 4; g.beginPath(); g.roundRect(6, 6, 500, 160, 26); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(330, 164); g.lineTo(380, 196); g.lineTo(370, 160); g.fill();
    g.fillStyle = '#2b1d12'; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((l, i) => { g.font = `${i === 0 ? 'bold 38px' : '30px'} Inter, system-ui, sans-serif`; g.fillText(l, 256, 52 + i * 46 + (lines.length === 2 ? 22 : 0)); });
    b.t.needsUpdate = true;
  };
  let seenTries = 0, wave = 0;
  // the two observers (D24): a passenger on the car's bench, a boy on the platform; their bubbles
  let obs = null;
  const setObservers = (passenger, kid) => {
    // (the passenger on the bench's east half, the boy across the track to the west: apart on screen)
    car.add(passenger.g); passenger.g.position.set(0.55, Y + 0.56, -D / 2 + 0.34);
    obs = { kid, kidBub: makeBubble(scene, kid.g.position.x, Y + 2.6, kid.g.position.z, 1.45), carBub: makeBubble(car, 0.55, Y + 2.05, -D / 2 + 0.6, 1.0) };
  };
  // the explorer's jalón carries its own tape, signed, with its zero at the pole (−3 … 0 … +3)
  const signedTape = (left, right) => {
    const px = 128, w = Math.round((left + right) * px), c = document.createElement('canvas'); c.width = w; c.height = 72; const g = c.getContext('2d');
    g.fillStyle = '#efe7f4'; g.fillRect(0, 0, w, 72); g.fillStyle = '#3b2a52'; g.font = 'bold 30px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
    for (let m = Math.ceil(-left * 2) / 2; m <= right + 1e-6; m += 0.5) {
      const x = Math.round((m + left) * px), int = Math.abs(m - Math.round(m)) < 1e-6;
      g.fillRect(x - (m === 0 ? 4 : int ? 2 : 1), 0, m === 0 ? 8 : int ? 4 : 2, m === 0 ? 72 : int ? 30 : 16);
      if (int && m !== 0 && x > 16 && x < w - 16) g.fillText((m < 0 ? '−' : '+') + Math.abs(Math.round(m)), x, 34);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  };
  const jTape = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.95 }));
  jTape.visible = false; scene.add(jTape);
  let jTapeKey = '';
  // the explorer's jalón: drawn where the simulation says it is (rack, hand, platform, car)
  const myJalon = jalonMesh(M); scene.add(myJalon);
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
  const makeCount = parent => { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); sp.scale.set(0.5, 0.25, 1); sp.visible = false; sp.renderOrder = 9; parent.add(sp); return { sp, c, t }; };
  const inkCounts = [makeCount(car), makeCount(car)], chalkCount = makeCount(scene); // (the two largest ink columns; the chalk's too)
  // (what is counted is written too: '×22' alone beside the kerb's '22' read as a reading)
  const writeCount = ({ sp, c, t }, n, what) => { const g = c.getContext('2d'); g.clearRect(0, 0, 128, 64); g.fillStyle = 'rgba(30,20,12,0.85)'; g.beginPath(); g.roundRect(4, 8, 120, 48, 14); g.fill(); g.fillStyle = '#f6e7c4'; g.font = 'bold 24px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${what} ×${n}`, 64, 33); t.needsUpdate = true; };
  let lastMarks = 0, flash = 0;
  let shownTrip = -1, shown = 0;
  let spin = 0;
  return {
    keep: [car, drum, retW, retE, cable, myJalon, her, jTape], // (her group moves with the target: not merged)
    setObservers,
    update(dt, time, alpha = 1) {
      car.position.x = (k.px ?? k.x) + (k.x - (k.px ?? k.x)) * alpha;
      const jl = world.jalon, av = world.avatar;
      // her jalón where the current target is; her flag waves for a while after a success
      const er = world.errand, tgt = ENCARGO.targets[Math.min(er.round, ENCARGO.targets.length - 1)];
      her.position.x = CARRO.kerb0 + ENCARGO.targets[Math.min(er.placed ?? er.round, ENCARGO.targets.length - 1)];
      if (er.tries.length !== seenTries) { const t = er.tries.at(-1); seenTries = er.tries.length; if (t && t.still && Math.abs(t.miss) <= ENCARGO.tol) wave = 4; }
      wave = Math.max(0, wave - dt); flag.position.y = Y + 1.58 + (wave > 0 ? 0.25 : 0); flag.rotation.y = wave > 0 ? Math.sin(time * 9) * 0.6 : 0;
      drawWestPlate(er.state === 'asked' ? tgt : null);
      // what she says (visible near her, on the platform or the car)
      const near = av.z < -35; // (anywhere on the platform or the car: the west stop is where the place is chosen)
      const last = er.tries.at(-1), fmt1 = v => v.toFixed(1).replace('.', ',').replace('-', '−');
      if (er.state === 'none') bub.sp.visible = false;
      else {
        bub.sp.visible = near;
        if (er.state === 'done') say(wave > 0 ? ['¡Justo ahí!', 'Gracias.'] : ['Gracias por las tizas.']);
        else if (wave > 0) say(['¡Justo ahí!', `¿Y ahora en ${fmt1(tgt)} m?`]);
        else if (!last || last.round !== er.round) say(['Tu última tiza, al pie', `de mi jalón: ${fmt1(tgt)} m`, 'viajando quieto → parada este']);
        else if (!last.still) say(['Caminaste en el viaje:', 'así no vale.', 'Elegí tu lugar antes de salir.']);
        else { const sh = shownTry(last); say([sh.miss < 0 ? `Faltaron ${fmt1(-sh.miss)} m  →` : `←  Sobraron ${fmt1(sh.miss)} m`, `Tu tiza: ${fmt1(sh.G)} m · mi jalón: ${fmt1(tgt)} m`]); }
      }
      // what each observer says about the last recorded trip (after it, near them)
      if (obs) {
        // only about the trip that just ended: from its arrival until the car leaves that stop
        const r = world.recorder, show = r.state === 'done' && r.marks.length >= 2 && av.z < -35 && k.phase === 'parada' && k.leg === r.endLeg;
        const d = show ? describeTrip(r.marks, CARRO.len / 2) : null;
        obs.kidBub.sp.visible = !!d && Math.abs(av.x - obs.kid.g.position.x) < 12; obs.carBub.sp.visible = !!d && (av.carrier === k || Math.abs(av.x - k.x) < 8);
        if (d) { say(d.anden, obs.kidBub); say(d.carro, obs.carBub); }
      }
      // the explorer's jalón's own tape, when planted
      const tk = `${jl.state}|${jl.version}`;
      if (tk !== jTapeKey) {
        jTapeKey = tk;
        if (jl.state === 'ground') { jTape.material.map?.dispose(); jTape.material.map = signedTape(5, 5); jTape.material.needsUpdate = true; jTape.scale.set(10, 1, 1); jTape.userData.off = 0; if (jTape.parent !== scene) scene.add(jTape); }
        else if (jl.state === 'car') { jTape.material.map?.dispose(); jTape.material.map = signedTape(jl.c, CARRO.len - jl.c); jTape.material.needsUpdate = true; jTape.scale.set(CARRO.len, 1, 1); jTape.userData.off = CARRO.len / 2 - jl.c; car.add(jTape); }
        jTape.visible = jl.state === 'ground' || jl.state === 'car';
      }
      if (jl.state === 'ground') jTape.position.set(jl.x, Y + 0.008, Math.max(jl.z + 0.22, AVENIDA.andenZ0 + 0.5)); // (never under the kerb)
      else if (jl.state === 'car') jTape.position.set(-CARRO.len / 2 + jl.c + jTape.userData.off, Y + 0.009, jl.z - zc + 0.22);
      myJalon.rotation.set(0, 0, 0);
      if (jl.state === 'rack') myJalon.position.set(JALONES.x + 0.2, Y + 0.02, JALONES.z - 0.21), myJalon.rotation.x = -0.12;
      else if (jl.state === 'hand') { const ax = av.px + (av.x - av.px) * alpha; myJalon.position.set(ax + av.facing * 0.28, av.y - av.hh + 0.25, av.z + 0.12); myJalon.rotation.z = -av.facing * 0.18; }
      else if (jl.state === 'ground') myJalon.position.set(jl.x, Y, jl.z);
      else if (jl.state === 'car') myJalon.position.set(car.position.x - CARRO.len / 2 + jl.c, Y, jl.z);
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
        inkCounts.forEach((L, j) => { const g = ig[j]; L.sp.visible = !!g; if (g) { writeCount(L, g[1], 'tinta'); L.sp.position.set(r.marks[g[0]].c - CARRO.len / 2 + 0.28, Y + 0.25, D / 2 - 0.17); } });
        const gg = [...gGroups].filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1])[0];
        chalkCount.sp.visible = !!gg; if (gg) { writeCount(chalkCount, gg[1], 'tiza'); chalkCount.sp.position.set(CARRO.kerb0 + r.marks[gg[0]].g + 0.3, Y + 0.25, AVENIDA.andenZ0 + 0.3); }
      }
      if ((r.version || 0) !== lastMarks) { if (r.state === 'on') flash = 0.15; lastMarks = r.version || 0; }
      flash = Math.max(0, flash - dt);
      // the lamp: amber set, green marking (a flash at each mark), cream done, red cut; the hand: one division per mark
      recLamp.material.color.set(r.state === 'armed' ? '#f0b04a' : r.state === 'on' ? (flash > 0 ? '#e9ffe6' : '#4fc65e') : r.state === 'done' ? '#efe6c8' : r.state === 'cut' ? '#d0402a' : '#3a2a1c');
      recHand.rotation.z = -r.marks.length * Math.PI * 2 / 24;
    },
  };
}
