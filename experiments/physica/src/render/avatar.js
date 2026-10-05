// The explorer: a student of the Instituto shrunk into Physica. Silhouette: big head with
// brass goggles, a deep teal coat, a long saffron scarf and the Bitácora satchel. Pose and
// expression are derived from the simulated state (support, velocity, local field); the
// scarf and hair tuft are chains in the same field, so they stream upward inside the region.
// Representation only: nothing here moves the simulated body.
import * as THREE from 'three';

const C = {
  coat: '#2b5266', coatDark: '#1d3a4a', skin: '#e9b48e', hair: '#3a2419', scarf: '#f1a92f', scarfDark: '#c9761c',
  trousers: '#d9c29a', boots: '#5a3626', brass: '#c9a24c', leather: '#8a5432', ink: '#1b1410', glow: '#9ff3e6',
};

function mat(color, o = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...o }); }
function outline(mesh, s = 1.07) {
  const o = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color: '#2a160e', side: THREE.BackSide }));
  o.scale.setScalar(s); mesh.add(o); return o;
}

export class Explorer {
  constructor(field) {
    this.field = field;
    this.root = new THREE.Group();
    this.body = new THREE.Group(); this.root.add(this.body);
    const m = { coat: mat(C.coat), coatDark: mat(C.coatDark), skin: mat(C.skin, { roughness: 0.6 }), hair: mat(C.hair),
      trousers: mat(C.trousers), boots: mat(C.boots), brass: mat(C.brass, { metalness: 0.75, roughness: 0.35 }),
      leather: mat(C.leather), ink: new THREE.MeshBasicMaterial({ color: C.ink }), white: new THREE.MeshBasicMaterial({ color: '#fbf6ec' }),
      glow: new THREE.MeshBasicMaterial({ color: C.glow }), scarf: new THREE.MeshStandardMaterial({ color: C.scarf, roughness: 0.8, side: THREE.DoubleSide }) };
    this.m = m;

    // Legs pivot at the hips.
    this.legs = [-1, 1].map(s => {
      const hip = new THREE.Group(); hip.position.set(0, 0.3, s * 0.075);
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.058, 0.13, 4, 10), m.trousers); thigh.position.y = -0.1; hip.add(thigh);
      const knee = new THREE.Group(); knee.position.y = -0.17; hip.add(knee);
      const boot = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.06, 4, 10), m.boots); boot.position.set(0.025, -0.07, 0); boot.rotation.z = Math.PI / 2; knee.add(boot);
      for (const p of [thigh, boot]) p.castShadow = true;
      this.body.add(hip); return { hip, knee };
    });

    // Coat: flared lathe.
    const prof = [[0.0, 0.22], [0.17, 0.22], [0.165, 0.32], [0.14, 0.48], [0.13, 0.6], [0.07, 0.66], [0.0, 0.66]].map(p => new THREE.Vector2(p[0], p[1]));
    const coat = new THREE.Mesh(new THREE.LatheGeometry(prof, 18), m.coat); coat.castShadow = true; outline(coat, 1.05);
    this.body.add(coat);
    for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), m.brass); b.position.set(0.135 - i * 0.004, 0.55 - i * 0.09, 0.02); this.body.add(b); }
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.148, 0.018, 6, 20), m.leather); belt.rotation.x = Math.PI / 2; belt.position.y = 0.4; this.body.add(belt);
    // Satchel with the Bitácora.
    const satchel = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.13, 0.07), m.leather); satchel.position.set(-0.04, 0.33, 0.17); satchel.rotation.y = 0.1; satchel.castShadow = true; this.body.add(satchel);
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.152, 0.05, 0.075), m.coatDark); flap.position.set(-0.04, 0.38, 0.17); this.body.add(flap);

    // Head.
    this.neck = new THREE.Group(); this.neck.position.y = 0.66; this.body.add(this.neck);
    this.head = new THREE.Group(); this.head.position.y = 0.17; this.neck.add(this.head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.19, 22, 18), m.skin); skull.castShadow = true; outline(skull, 1.05); this.head.add(skull);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.2, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), m.hair);
    hair.rotation.x = -0.35; hair.position.set(-0.01, 0.015, -0.02); this.head.add(hair);
    const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), m.hair); fringe.position.set(0.1, 0.12, 0.08); fringe.scale.set(1.2, 0.7, 1); this.head.add(fringe);
    // Goggles on the forehead.
    for (const z of [-0.07, 0.07]) {
      const g = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.014, 8, 16), m.brass); g.position.set(0.13, 0.11, z); g.rotation.y = Math.PI / 2 - 0.3; this.head.add(g);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), new THREE.MeshStandardMaterial({ color: '#6fb9b3', metalness: 0.2, roughness: 0.15 }));
      lens.position.copy(g.position); lens.position.x += 0.005; lens.rotation.y = Math.PI / 2 - 0.3; this.head.add(lens);
    }
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.195, 0.012, 6, 28), m.coatDark); strap.position.y = 0.1; strap.rotation.x = Math.PI / 2; strap.rotation.z = 0.25; this.head.add(strap);
    // Eyes and mouth, on the side the head faces (+x local).
    this.eyes = [-1, 1].map(s => {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.027, 10, 8), m.ink); e.position.set(0.17, 0.0, s * 0.072); e.scale.set(0.6, 1.25, 1);
      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), m.white); shine.position.set(0.02, 0.012, 0.006); e.add(shine);
      this.head.add(e); return e;
    });
    this.mouth = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.006, 6, 12), m.ink); this.mouth.position.set(0.18, -0.085, 0.01); this.mouth.rotation.y = Math.PI / 2; this.head.add(this.mouth);
    const cheekMat = new THREE.MeshBasicMaterial({ color: '#e98a6a', transparent: true, opacity: 0.45 });
    for (const s of [-1, 1]) { const ch = new THREE.Mesh(new THREE.CircleGeometry(0.025, 10), cheekMat); ch.position.set(0.165, -0.05, s * 0.11); ch.rotation.y = Math.PI / 2 + s * 0.5; this.head.add(ch); }

    // Arms pivot at the shoulders.
    this.arms = [-1, 1].map(s => {
      const sh = new THREE.Group(); sh.position.set(0, 0.58, s * 0.16);
      const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.16, 4, 8), m.coat); up.position.y = -0.1; up.castShadow = true; sh.add(up);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), m.skin); hand.position.y = -0.22; sh.add(hand);
      if (s < 0) { // wrist device: the Instituto's clock
        const dev = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16), m.brass); dev.position.set(0, -0.17, -0.045); dev.rotation.x = Math.PI / 2; sh.add(dev);
        const face = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), m.glow); face.position.set(0, -0.17, -0.057); face.rotation.y = Math.PI; sh.add(face);
        this.device = face;
      }
      this.body.add(sh); return sh;
    });

    // Scarf: neck wrap plus a tail that is a chain in the field.
    const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.04, 8, 18), m.scarf); wrap.rotation.x = Math.PI / 2; wrap.position.y = 0.65; this.body.add(wrap);
    this.scarf = { n: 7, len: 0.085, pts: [] };
    this.tuft = { n: 2, len: 0.07, pts: [] };
    this.scarfGeo = new THREE.BufferGeometry();
    this.scarfPos = new Float32Array(this.scarf.n * 4 * 3);
    const idx = []; for (let i = 0; i < this.scarf.n; i++) { const v = i * 4; idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); }
    this.scarfGeo.setAttribute('position', new THREE.BufferAttribute(this.scarfPos, 3).setUsage(THREE.DynamicDrawUsage));
    this.scarfGeo.setIndex(idx); this.scarfGeo.computeVertexNormals();
    this.scarfMesh = new THREE.Mesh(this.scarfGeo, m.scarf); this.scarfMesh.frustumCulled = false; this.scarfMesh.castShadow = true;
    this.tuftMesh = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 8), m.hair); this.tuftMesh.castShadow = true;

    this.state = { yaw: -0.6, walk: 0, squash: 0, surprise: 0, blink: 0, nextBlink: 2, look: 0, armUp: 0, tuck: 0, lean: 0, carry: 0, push: 0 };
    this._a = { x: 0, y: 0 };
  }

  addTo(scene) { scene.add(this.root, this.scarfMesh, this.tuftMesh); this.root.traverse(o => { if (o.isMesh) o.castShadow = true; }); }

  onEvent(e, avatarId) {
    if (e.body !== avatarId) return;
    if (e.type === 'enter') this.state.surprise = 1;
    if (e.type === 'mantle') { this.state.armUp = 1.2; this.state.squash = 0.12; }
    if (e.type === 'impact' && e.speed > 1.2) this.state.squash = Math.min(0.28, e.speed * 0.05);
  }

  /** p: interpolated position (centre of the sim box); s: sim avatar state. */
  update(dt, time, p, s, ctx) {
    const st = this.state, feetY = p.y - s.hh;
    this.root.position.set(p.x, feetY, 0);
    const g = { x: s.gx ?? 0, y: s.gy ?? -9.8 }, gUp = g.y > 0.8;
    const air = !s.grounded;
    // Facing: three-quarter toward the camera. rotation.y = θ sends the face (+x local) to
    // (cos θ, 0, −sin θ): θ = −0.6 looks right and a little toward the camera (+z);
    // θ = −(π − 0.6) looks left the same way. Turning passes through facing the camera.
    const yawT = s.facing > 0 ? -0.6 : -(Math.PI - 0.6);
    st.yaw += (yawT - st.yaw) * Math.min(1, dt * 10);
    this.body.rotation.y = st.yaw;

    const speed = Math.abs(s.vx);
    if (!air) st.walk += speed * dt * 5.4;
    const stride = air ? 0 : Math.min(1, speed / 2.6);
    st.armUp += ((air ? (gUp ? 1 : 0.55) : 0) - st.armUp) * Math.min(1, dt * (air ? 5 : 8));
    st.tuck += ((air && gUp ? 1 : air ? 0.4 : 0) - st.tuck) * Math.min(1, dt * 6);
    st.carry += ((ctx.holding ? 1 : 0) - st.carry) * Math.min(1, dt * 10);
    st.push += ((ctx.pushing ? 1 : 0) - st.push) * Math.min(1, dt * 8);
    st.squash *= Math.exp(-dt * 9);
    st.surprise = Math.max(0, st.surprise - dt * 0.7);

    const sw = Math.sin(st.walk), bob = Math.abs(Math.cos(st.walk)) * 0.035 * stride;
    const breathe = Math.sin(time * 2.1) * 0.008;
    this.body.position.y = bob + breathe * (1 - stride);
    this.body.scale.set(1 + st.squash * 0.6, 1 - st.squash, 1 + st.squash * 0.6);
    // Lean: into the push, against the control acceleration, back when floating up.
    const leanT = st.push * 0.28 + (air ? -(s.vx * 0.04) : 0) + (s.control ?? 0) * 0.006;
    st.lean += (leanT - st.lean) * Math.min(1, dt * 8);
    // Euler XYZ applies z in the body's own frame, whose forward is +x: lean toward the face.
    this.body.rotation.z = -st.lean;

    this.legs.forEach((l, i) => {
      const ph = i ? sw : -sw;
      l.hip.rotation.z = ph * 0.65 * stride + st.tuck * 0.9;
      l.knee.rotation.z = -(Math.max(0, -ph) * 0.7 * stride) - st.tuck * 1.5;
    });
    this.arms.forEach((a, i) => {
      const ph = i ? -sw : sw;
      const swing = ph * 0.55 * stride * (1 - st.carry) * (1 - st.push);
      const up = st.armUp * (gUp ? 2.5 : 1.9) + Math.sin(time * 7 + i) * 0.15 * st.armUp * (gUp ? 0.4 : 1);
      a.rotation.z = swing + up * (1 - st.carry) + st.carry * 1.35 + st.push * 1.2;
      a.rotation.x = (i ? 1 : -1) * (0.08 + st.armUp * 0.5 + st.carry * 0.25);
    });
    // Head: look along motion; up when the field lifts; surprise widens the eyes.
    const lookT = air ? Math.atan2(s.vy, Math.max(0.5, Math.abs(s.vx))) * 0.35 : (ctx.lookAt ?? 0);
    st.look += (lookT - st.look) * Math.min(1, dt * 5);
    this.head.rotation.z = st.look;
    st.nextBlink -= dt;
    if (st.nextBlink < 0) { st.blink = 0.14; st.nextBlink = 2.5 + Math.random() * 3; }
    st.blink = Math.max(0, st.blink - dt);
    const eyeY = st.blink > 0 ? 0.15 : 1.25 + st.surprise * 0.5;
    for (const e of this.eyes) e.scale.set(0.6, eyeY, 1 + st.surprise * 0.3);
    this.mouth.scale.setScalar(0.6 + st.surprise * 1.4);
    if (this.device) this.device.material.color.setHSL(0.47, 0.8, 0.55 + 0.2 * Math.sin(time * 3));

    this.updateChains(dt, p, feetY, g);
  }

  worldOf(local) { return this.body.localToWorld(local.clone()); }

  updateChains(dt, p, feetY, g) {
    this.root.updateMatrixWorld(true);
    const anchor = this.worldOf(new THREE.Vector3(-0.1, 0.63, 0.04));
    const tip = this.worldOf(new THREE.Vector3(-0.05, 1.0, 0.0));
    this.chain(this.scarf, anchor, dt, g, 0.05);
    this.chain(this.tuft, tip, dt, { x: g.x, y: g.y }, 0.12, true);
    // tuft points along the hair's chain, flipped (hair stands against gravity's pull only weakly)
    const q = this.tuft.pts;
    const dx = q[2].x - q[0].x, dy = q[2].y - q[0].y;
    this.tuftMesh.position.set(q[1].x, q[1].y, tip.z);
    this.tuftMesh.rotation.set(0, 0, Math.atan2(dy, dx) - Math.PI / 2);
    // ribbon
    const P = this.scarfPos, pts = this.scarf.pts;
    let o = 0;
    for (let i = 0; i < this.scarf.n; i++) {
      const a = pts[i], b = pts[i + 1], w0 = 0.055 * (1 - i / this.scarf.n * 0.35), w1 = 0.055 * (1 - (i + 1) / this.scarf.n * 0.35);
      const ddx = b.x - a.x, ddy = b.y - a.y, l = Math.hypot(ddx, ddy) || 1, nx = -ddy / l * 0.25, ny = ddx / l * 0.25;
      P[o++] = a.x + nx * w0; P[o++] = a.y + ny * w0; P[o++] = a.z + w0;
      P[o++] = a.x - nx * w0; P[o++] = a.y - ny * w0; P[o++] = a.z - w0;
      P[o++] = b.x + nx * w1; P[o++] = b.y + ny * w1; P[o++] = b.z + w1;
      P[o++] = b.x - nx * w1; P[o++] = b.y - ny * w1; P[o++] = b.z - w1;
    }
    this.scarfGeo.attributes.position.needsUpdate = true;
    this.scarfGeo.computeVertexNormals();
  }

  chain(c, root, dt, g, damping, stiff = false) {
    if (!c.pts.length) for (let i = 0; i <= c.n; i++) c.pts.push({ x: root.x, y: root.y - c.len * i, z: root.z, px: root.x, py: root.y - c.len * i });
    const ps = c.pts; ps[0].x = root.x; ps[0].y = root.y; ps[0].z = root.z;
    const h = Math.min(dt, 1 / 30), d = 1 - damping;
    for (let i = 1; i < ps.length; i++) {
      const q = ps[i];
      this.field.at(q.x, q.y, this._a);
      const nx = q.x + (q.x - q.px) * d + this._a.x * h * h, ny = q.y + (q.y - q.py) * d + this._a.y * h * h;
      q.px = q.x; q.py = q.y; q.x = nx; q.y = ny; q.z = root.z;
    }
    for (let k = 0; k < 4; k++) for (let i = 0; i < ps.length - 1; i++) {
      const a = ps[i], b = ps[i + 1], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1e-6, df = (l - c.len) / l;
      if (i === 0) { b.x -= dx * df; b.y -= dy * df; } else { a.x += dx * df / 2; a.y += dy * df / 2; b.x -= dx * df / 2; b.y -= dy * df / 2; }
    }
    if (stiff) { // hair keeps some shape: pull the tip toward the head's up axis
      const up = this.worldOf(new THREE.Vector3(-0.08, 1.16, 0)), t = ps[ps.length - 1];
      t.x += (up.x - t.x) * 0.15; t.y += (up.y - t.y) * 0.15;
    }
  }
}
