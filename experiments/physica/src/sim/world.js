// Deterministic simulation of a Physica scene. It knows nothing about rendering.
//
// Authority: every free body (test spheres, the explorer) is integrated here and only here,
// at a fixed step DT. Rendering interpolates between the last two states; it never moves
// a body. Held and reeled bodies are not integrated: their holder sets them (one authority
// per degree of freedom at any time).
//
// Integration (velocity Verlet): with a0 sampled where the body is and a1 where it lands,
//   x += v·dt + ½·a0·dt²,  v += ½·(a0 + a1)·dt
// Exact for constant a, so free fall and uniform regions match the closed forms; time-
// reversible, so crossing a transition band does not pump energy into a body (a forward
// sample would add ~0.1 m per bounce at the cascade's top). Velocity changes only through
// the field, contacts and explicit impulses: crossing a boundary never resets or flips it.
//
// Units: metres, seconds, kilograms. x to the right, y up.
// Lanes (2.5D): lane 0 is the explorer's path; lane 1, just behind it, is the experiment
// lane where the supports' spheres move. Bodies only touch bodies of their own lane; rock
// touches everything. So an instrument can never block the path, and the path never
// disturbs a running experiment.
import { Field } from './field.js';

export const DT = 1 / 120;
export const TRACE_EVERY = 12;          // one mark every 0.1 s of simulated time
export const TRACE_MAX_MARKS = 90;
export const AVATAR = {
  hw: 0.26, hh: 0.55, mass: 45,
  walk: 3.0,            // m/s target speed on a support
  aGround: 22,          // m/s² locomotion authority while supported
  aAir: 3.5,            // m/s² air steering: a declared control assist, horizontal only
  reach: 1.05,          // m, interaction distance
  mantle: 0.45,         // m: an edge this far above the feet can be climbed (declared assist)
  mantleTime: 0.28,     // s the climb takes; the climb, not the field, moves the body meanwhile
  chainDown: 1.0,       // m/s pulling oneself down a chain against an upward pull (effort)
  chainUp: 1.4,         // m/s climbing back up
  step: 0.36,           // m: a step this high is taken while walking (declared assist)
  stepTime: 0.14,       // s
};
export const SPHERE = { r: 0.17, mass: 1.2, restitution: 0.35, friction: 0.32 };
const BOUNCE_MIN = 0.7;  // m/s: slower normal impacts settle instead of bouncing
const REEL_SPEED = 3.2;  // m/s, the reel's motor drags the sphere home along its thread

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const THREE_clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class World {
  constructor(level) {
    this.level = level;
    // Depth: a level may declare the diorama's depth; its regions and solids without their own
    // z0/z1 take it (on the 2.5D path, z = 0, nothing changes). Behind it, only what is declared.
    const dio = level.diorama || {};
    this.field = new Field({ zones: level.zones.map(z => ({ ...dio, ...z })) });
    this.solids = level.solids.map(s => ({ friction: 0.6, ...dio, ...s }));
    this.doors = (level.doors || []).map(d => ({ ...d, open: false, openT: 0, opening: false }));
    this.depthAreas = level.depthAreas || [];
    // Gates inside depth (Hito B): an area behind one (`gate` on the area) is walkable once it is open.
    this.gates = (level.gates || []).map(g => ({ ...g, open: false, opening: false, openT: 0 }));
    // Carriers (the cable car, B3): a kinematic solid running between two stops at constant speed,
    // with a short grip and brake ramp; what stands on it is carried, and an area travels with it.
    this.carriers = (level.carriers || []).map(c => {
      const solid = { id: c.id, x0: 0, x1: 0, y0: c.y - c.h, y1: c.y, z0: c.z0, z1: c.z1, friction: 0.6, carrier: c.id };
      this.solids.push(solid);
      const k = { ...c, x: c.stops[0], v: 0, dx: 0, leg: 0, t: 0, phase: 'parada', solid };
      this.placeCarrier(k); return k;
    });
    // The car's recorder (D22): during a trip it marks every 0.5 s where the explorer is, in two
    // records at once: chalk on the platform's kerb (the ground's frame, from the kerb's zero) and
    // ink on the car's tape (the car's frame, from the car's west end).
    this.recorder = { state: 'off', carrier: null, marks: [], trip: 0, startStep: 0, lastStep: 0 };
    // The explorer's jalón (D23): at the rack, in hand, or planted on the platform (x, z) or on a car
    // (c: from the car's west end). While planted, the recorder also reads from it.
    this.jalon = { state: level.jalones ? 'rack' : 'none', x: 0, z: 0, c: 0, carrier: null, version: 0 };
    // The neighbour's errand at the east stop.
    this.errand = { state: 'none', round: 0, placed: 0, tries: [] }; // (placed: the target her jalón stands at)
    this.depthBlockers = level.depthBlockers || [];
    this.citySeen = false;
    this.bodies = [];
    this.stands = [];
    this.traces = [];
    this.events = [];
    this.stepCount = 0;
    this.t = 0;
    this.nextId = 1;
    this.traceSeq = 0;
    this.input = { x: 0, y: 0, act: false, reset: false, adjust: 0 };
    // Chains: the first one is offered only after a first attempt (try, then tools).
    this.chains = (level.chains || (level.chain ? [level.chain] : [])).map((c, i) => ({ id: c.id || `cadena-${i}`, gated: i === 0, ...c }));
    this.chain = this.chains[0] || null;
    this.bells = (level.bells || (level.bell ? [{ id: 'cascada', ...level.bell }] : [])).map(b => ({ ...b, rung: 0 }));
    this.bell = this.bells[0] || null;
    this._a = { x: 0, y: 0 };
    this._a1 = { x: 0, y: 0 };

    const sp = level.spawn;
    this.avatar = this.addBody({ kind: 'avatar', shape: 'box', x: sp.x, y: sp.y + AVATAR.hh, hw: AVATAR.hw, hh: AVATAR.hh,
      mass: AVATAR.mass, restitution: 0, friction: 0 });
    this.avatar.facing = 1;
    this.avatar.holding = null;

    for (const s of level.stands || []) {
      const st = { ...s, state: 'armed', body: null, clampY: s.clampY };
      st.body = this.addBody(this.sphereSpec(s.clampX, s.clampY, { tag: s.id, lane: 1, z: s.z ?? 0 }));
      st.body.heldBy = { type: 'stand', stand: st };
      this.stands.push(st);
    }
    for (const l of level.loose || []) {
      const b = this.addBody(this.sphereSpec(l.x, l.y + SPHERE.r, { tag: l.id }));
      b.home = { x: l.x, y: l.y + SPHERE.r };
      b.heldBy = { type: 'shelf' };   // stored on the table until someone takes it
    }
    for (const b of this.bodies) this.snapshotPrev(b);
  }

  sphereSpec(x, y, extra = {}) {
    return { kind: 'sphere', shape: 'circle', x, y, r: SPHERE.r, mass: SPHERE.mass, restitution: SPHERE.restitution,
      friction: SPHERE.friction, ...extra };
  }

  addBody(spec) {
    const b = { id: this.nextId++, lane: 0, z: 0, vz: 0, vx: 0, vy: 0, ax: 0, ay: 0, heldBy: null, support: null, supportSteps: 0,
      zoneW: {}, px: spec.x, py: spec.y, ...spec };
    this.bodies.push(b);
    return b;
  }

  snapshotPrev(b) { b.px = b.x; b.py = b.y; b.pz = b.z; }

  emit(type, data) { this.events.push({ type, step: this.stepCount, t: this.t, ...data }); }

  /** Advance one fixed step. */
  step() {
    const inp = this.input;
    for (const b of this.bodies) { this.snapshotPrev(b); b.carryDx = 0; }
    this.updateCarriers();
    if (inp.reset) {
      inp.reset = false;
      // R restarts what is at stake: the explorer if it has been adrift, otherwise the experiment.
      const av0 = this.avatar, inWater = av0.support?.solid?.noFooting;
      if (av0.z < -0.3 && av0.lastDepth && !this.inArea(av0)) { // off every walkable area in depth: back to where it last stood
        Object.assign(av0, { x: av0.lastDepth.x, y: av0.lastDepth.y, z: av0.lastDepth.z, vx: 0, vy: 0, vz: 0, carrier: null }); this.snapshotPrev(av0);
        this.emit('footing', { body: av0.id, x: av0.x, y: av0.y });
      } else if ((av0.airSteps > 0.3 / DT || inWater) && av0.lastSupport) this.returnToFooting();
      else this.resetExperiment();
    }
    if (inp.act) { inp.act = false; this.interact(); }
    if (inp.adjust) { const d = inp.adjust; inp.adjust = 0; this.adjust(d); }

    const av = this.avatar;
    if (av.heldBy?.type === 'mantle') this.updateMantle(av);
    if (av.heldBy?.type === 'chain') this.updateChain(av, inp.y, av.heldBy.chain);
    const vyBefore = av.vy, airBefore = av.supportSteps === 0 && !av.heldBy;
    for (const b of this.bodies) {
      if (b.heldBy) continue;
      const a0 = this.fieldOn(b, this._a);
      let c = 0;
      if (b === av) { c = this.locomotion(av, inp.x); av.control = c; }
      const ax0 = a0.x + c, ay0 = a0.y;
      b.x += b.vx * DT + 0.5 * ax0 * DT * DT;
      b.y += b.vy * DT + 0.5 * ay0 * DT * DT;
      const a1 = this.fieldOn(b, this._a1);
      b.vx += 0.5 * (ax0 + a1.x + c) * DT;
      b.vy += 0.5 * (ay0 + a1.y) * DT;
      b.gx = a1.x; b.gy = a1.y; b.ax = a1.x + c; b.ay = a1.y;
      b.support = null;
    }

    for (const door of this.doors) if (door.opening && !door.open) {
      door.openT = Math.min(door.swing || 0, door.openT + DT);
      if (door.openT >= (door.swing || 0)) { door.open = true; door.opening = false; this.emit('door-open', { door: door.id }); }
    }
    for (const g of this.gates) if (g.opening && !g.open) {
      g.openT = Math.min(g.swing, g.openT + DT);
      if (g.openT >= g.swing) { g.open = true; g.opening = false; this.emit('gate-open', { gate: g.id }); }
    }
    if (!av.heldBy) this.depthStep(av, inp);

    for (let pass = 0; pass < 3; pass++) {
      for (const b of this.bodies) if (!b.heldBy) this.collideSolids(b, pass === 0);
      this.collideBodies(pass === 0);
    }
    this.updateFrames();
    this.updateRecorder();
    // her jalón is moved to the next target once the car has left the stop where it was met (not in front
    // of the explorer aboard: lined up by eye, the new spot would be read off, not predicted)
    const er = this.errand; if (er.placed !== er.round && this.carriers[0] && this.carriers[0].phase !== 'parada') { er.placed = er.round; this.emit('errand-moved', { target: this.level.encargo.targets[er.round] }); }
    const J = this.level.jalones;
    if (J && this.jalon.state === 'hand' && av.z > J.limitZ) { Object.assign(this.jalon, { state: 'rack', carrier: null, version: this.jalon.version + 1 }); this.emit('jalon', { state: 'rack' }); }

    for (const b of this.bodies) {
      if (b.heldBy) continue;
      b.supportSteps = b.support ? b.supportSteps + 1 : 0;
      if (b === av) {
        av.airSteps = av.supportSteps ? 0 : (av.airSteps || 0) + 1;
        if (av.supportSteps > 10) av.letGoY = null;
        const sd = av.support?.solid;
        if (av.supportSteps > 30 && sd && !sd.noFooting && av.x - av.hw >= sd.x0 + 0.1 && av.x + av.hw <= sd.x1 - 0.1 && av.z === 0) av.lastSupport = { x: av.x, y: av.y };
        // Having stood on the Mirador, the explorer has seen the city: the arch can be opened.
        if (!this.citySeen && sd && sd.id === this.level.citySolid && av.supportSteps > 10) { this.citySeen = true; this.emit('city-seen', {}); }
      }
      if (b.y < -30 || b.y > 60 || Math.abs(b.x) > 200) this.recover(b);
    }
    if (inp.x > 0.1) av.facing = 1; else if (inp.x < -0.1) av.facing = -1;

    // The explorer's highest point in flight: what its own crossing reached.
    if (airBefore && !av.heldBy && av.supportSteps === 0 && vyBefore > 0 && av.vy <= 0) {
      const terrace = this.solids.find(s => s.id === this.level.goalSolid);
      if (terrace && av.x < terrace.x0 && av.y - av.hh < terrace.y1) this.shortSeen = true;
      this.emit('apex', { body: av.id, x: av.x, y: av.y - av.hh, centre: av.y, from: av.letGoY ?? null });
    }
    this.updateHeld();
    this.updateStands();
    this.updateBell();
    this.updateZoneEvents();
    this.stepCount++;
    this.t = this.stepCount * DT;
    this.updateTraces();
  }

  fieldOn(b, out) {
    return b.shape === 'box' ? this.field.onBody(b.x, b.y, b.hw, b.hh, out, b.z) : this.field.onBody(b.x, b.y, b.r * 0.7, b.r * 0.7, out, b.z);
  }

  /**
   * Climbing an edge: pressing against a wall whose top is just above the feet, with no
   * support, the explorer grabs the edge and pulls itself onto it. A declared assist (it acts
   * through the explorer's own hands, not through the field) with a fixed duration.
   */
  tryMantle(av, s, nx) {
    const ix = this.input.x;
    if (av.heldBy || ix * nx >= -0.1) return;
    const feet = av.y - av.hh, rise = s.y1 - feet;
    // Walking: steps up to AVATAR.step are taken. In the air: edges up to AVATAR.mantle are grabbed.
    const grounded = av.supportSteps > 0;
    if (grounded ? (rise <= 0.01 || rise > AVATAR.step) : (rise < -0.02 || rise > AVATAR.mantle || Math.abs(av.vy) > 3)) return;
    const to = { x: (nx < 0 ? s.x0 : s.x1) - nx * (av.hw + 0.06), y: s.y1 + av.hh + 0.002 };
    for (const o of this.solids) {
      if (o === s || (o.only && o.only !== 'box') || !this.atDepth(o, av.z)) continue;
      if (to.x + av.hw > o.x0 && to.x - av.hw < o.x1 && to.y + av.hh > o.y0 && to.y - av.hh < o.y1) return;
    }
    av.heldBy = { type: 'mantle', from: { x: av.x, y: av.y }, to, t: 0, time: grounded ? AVATAR.stepTime : AVATAR.mantleTime };
    av.vx = 0; av.vy = 0;
    this.emit(grounded ? 'step-up' : 'mantle', { body: av.id, x: to.x, y: to.y });
  }

  updateMantle(av) {
    const m = av.heldBy; m.t += DT;
    const k = Math.min(1, m.t / m.time), up = Math.min(1, k * 1.6), across = Math.max(0, (k - 0.35) / 0.65);
    av.x = m.from.x + (m.to.x - m.from.x) * across; av.y = m.from.y + (m.to.y - m.from.y) * up;
    if (k >= 1) { av.heldBy = null; av.vx = 0; av.vy = 0; av.supportSteps = 1; }
  }

  returnToFooting() {
    const av = this.avatar, p = av.lastSupport;
    if (av.holding) { av.holding.heldBy = null; av.holding.vx = av.holding.vy = 0; av.holding = null; }
    av.heldBy = null; av.x = p.x; av.y = p.y; av.vx = av.vy = 0; av.airSteps = 0; this.snapshotPrev(av);
    this.emit('footing', { body: av.id, x: p.x, y: p.y });
  }

  /** Horizontal acceleration the explorer applies to itself. Declared assist, never vertical. */
  locomotion(av, ix) {
    // Aboard a car the explorer steps with care, at half pace (declared assist): 1.5 m/s, the car's
    // own speed, so a walk along its deck lasts a few of the recorder's marks.
    const target = clamp(ix, -1, 1) * AVATAR.walk * (av.carrier ? 0.5 : 1);
    const supported = av.supportSteps > 0;
    av.grounded = supported;
    if (supported) return clamp((target - av.vx) / DT, -AVATAR.aGround, AVATAR.aGround);
    if (Math.abs(ix) < 0.1) return 0;
    return clamp((target - av.vx) * 6, -AVATAR.aAir, AVATAR.aAir);
  }

  /** A contact supports a body when its normal opposes the local effective gravity. */
  supportsAgainst(b, nx, ny) {
    const g = Math.hypot(b.gx ?? 0, b.gy ?? 0);
    if (g < 0.4) return false;
    return -(nx * b.gx + ny * b.gy) / g > 0.6;
  }

  contact(b, nx, ny, mu, other = null, record = true, solid = null) {
    const vn = b.vx * nx + b.vy * ny;
    if (this.supportsAgainst(b, nx, ny)) b.support = { nx, ny, other, solid };
    if (vn >= 0) return;
    const e = -vn > BOUNCE_MIN ? b.restitution : 0;
    b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny;
    if (mu > 0) {
      const tx = -ny, ty = nx, vt = b.vx * tx + b.vy * ty;
      const dv = Math.min(Math.abs(vt), mu * -vn) * Math.sign(vt);
      b.vx -= dv * tx; b.vy -= dv * ty;
    }
    if (record && -vn > 0.45) this.emit('impact', { body: b.id, kind: b.kind, speed: -vn, x: b.x, y: b.y, nx, ny });
  }

  /** Whether a solid exists at depth z (solids without z0/z1 span all depth). Every query over
   *  solids goes through here: contacts, and the free space a step-up or a grab needs. */
  atDepth(s, z) { return s.z0 === undefined || (z >= s.z0 && z <= s.z1); }

  /** The door whose threshold strip the explorer stands in, if any. */
  doorAt(av) { return this.doors.find(d => av.x > d.x0 - 0.6 && av.x < d.x1 + 0.6 && Math.abs(av.y - av.hh - d.y) < 0.15) || null; }

  /**
   * Walking in depth. On the 2.5D path the explorer lives at z = 0. Through an open door, ▲
   * walks away from the camera (−z) and ▼ back; in depth the explorer moves only within the
   * level's walkable areas (the strip in front of the door, the passage, the neighbourhood).
   * Assist (declared): in the strip, walking in depth eases the explorer toward the door's
   * centre, so getting through takes no aiming. Gravity and supports are the same as anywhere.
   */
  placeCarrier(k) { k.solid.x0 = k.x - k.len / 2; k.solid.x1 = k.x + k.len / 2; }

  /**
   * The carriers' motion, a function of time: at each stop it waits `dwell`, grips the cable over
   * `ramp` seconds (constant acceleration), runs at `speed`, and brakes symmetrically to the next
   * stop. Exact per step (no accumulated error). What stood on it last step moves with it.
   */
  updateCarriers() {
    for (const k of this.carriers) {
      const from = k.stops[k.leg % 2], to = k.stops[(k.leg + 1) % 2], dir = Math.sign(to - from), D = Math.abs(to - from);
      const tr = k.ramp, a = k.speed / tr, T = D / k.speed + tr, before = k.x;
      k.t += DT;
      const tau = k.t - k.dwell;
      if (tau <= 0) { k.x = from; k.v = 0; k.phase = 'parada'; }
      else if (tau >= T) { k.x = to; k.v = 0; k.phase = 'parada'; k.leg++; k.t = 0; this.emit('carrier-stop', { carrier: k.id, x: to }); }
      else {
        const s = tau < tr ? 0.5 * a * tau * tau : tau < T - tr ? 0.5 * a * tr * tr + k.speed * (tau - tr) : D - 0.5 * a * (T - tau) ** 2;
        if (k.phase === 'parada') this.emit('carrier-start', { carrier: k.id, from, to });
        k.x = from + dir * s; k.v = dir * (tau < tr ? a * tau : tau < T - tr ? k.speed : a * (T - tau));
        k.phase = tau < tr ? 'arranca' : tau < T - tr ? 'marcha' : 'frena';
      }
      if (tau <= 0 && tau > -1.5 && tau - DT <= -1.5) this.emit('carrier-warn', { carrier: k.id }); // a bell before it goes
      k.px = before; k.dx = k.x - before; this.placeCarrier(k);
      for (const b of this.bodies) if (b.carrier === k && !b.heldBy) { b.x += k.dx; b.carryDx = k.dx; }
    }
  }

  /**
   * The frame of a body's velocity: while it stands on a carrier, relative to it (it travels with
   * the carrier's displacement); otherwise relative to the ground. Changing support converts it:
   * stepping onto a moving car takes its velocity away, stepping off adds it back, so whatever leaves
   * a moving car (the explorer, a dropped sphere) leaves at the car's speed plus its own.
   */
  updateFrames() {
    for (const b of this.bodies) {
      if (b.heldBy) continue;
      const k = this.carriers.find(c => b.support?.solid === c.solid) || null;
      if (k === (b.carrier || null)) continue;
      if (b.carrier) b.vx += b.carrier.v;
      if (k) b.vx -= k.v;
      b.carrier = k;
    }
  }

  inArea(b) { return this.areasNow().some(r => b.x - b.hw >= r.x0 - 1e-6 && b.x + b.hw <= r.x1 + 1e-6 && b.z - b.hw >= r.z0 - 1e-6 && b.z + b.hw <= r.z1 + 1e-6); }

  /** The neighbour's errand: an eastward recorded trip whose last chalk falls at her jalón's foot. */
  checkErrand(k, marks) {
    const e = this.errand, E = this.level.encargo;
    if (!E || e.state !== 'asked' || marks.length < 2 || marks.at(-1).k <= marks[0].k) return;
    const target = E.targets[e.round], g = marks.at(-1).g, miss = g - target, c = marks.at(-1).c, zero = marks.at(-1).k - k.len / 2;
    // Only a trip made standing still counts (all the ink in one column): where to stand is decided
    // before setting off, not steered by eye during the ride.
    const still = marks.every(m => Math.abs(m.c - marks[0].c) < 0.05);
    const roundTries = e.tries.filter(t => t.round === e.round).length + 1;
    const t = { round: e.round, target, g, miss, c, zero, still };
    e.tries.push(t);
    const base = { ...t, tries: roundTries, rounds: E.targets.length };
    if (!still) { this.emit('errand-walked', base); return; }
    if (Math.abs(miss) > E.tol) { this.emit('errand-miss', base); return; }
    if (e.round < E.targets.length - 1) { e.round++; this.emit('errand-done', { ...base, next: E.targets[e.round] }); }
    else { e.state = 'done'; this.emit('errand-done', { ...base, final: true }); }
  }

  /** Where the planted jalón is on the ground now (null if not planted). */
  jalonX() {
    const j = this.jalon;
    return j.state === 'ground' ? j.x : j.state === 'car' ? j.carrier.x - j.carrier.len / 2 + j.c : null;
  }

  updateRecorder() {
    const r = this.recorder, k = r.carrier, av = this.avatar;
    if (!k || r.state === 'off' || r.state === 'done' || r.state === 'cut') return;
    const jx = this.jalonX(), jok = r.jal && this.jalon.version === r.jal.version;
    const mark = () => { r.version = (r.version || 0) + 1; r.marks.push({ t: (this.stepCount - r.startStep) * DT, g: av.x - k.kerb0, c: av.x - (k.x - k.len / 2), k: k.x - k.kerb0, ...(jok ? { j: av.x - jx } : {}) }); r.lastStep = this.stepCount; };
    if (r.state === 'armed') {
      if (av.carrier !== k) { r.state = 'off'; this.emit('record-cancel', {}); return; }
      // (the previous trip's marks stay until this one starts: arming does not erase what is to be read)
      if (k.phase !== 'parada') {
        // the jalón as it is at departure (a third zero, if planted); moving it during the trip drops it
        const jl = this.jalon;
        r.jal = jl.state === 'ground' || jl.state === 'car' ? { frame: jl.state === 'car' ? 'carro' : 'anden', at: jl.state === 'ground' ? jl.x - k.kerb0 : jl.c, version: jl.version } : null;
        r.state = 'on'; r.startStep = this.stepCount; r.marks = [];
        const jx0 = this.jalonX();
        r.marks.push({ t: 0, g: av.x - k.kerb0, c: av.x - (k.x - k.len / 2), k: k.x - k.kerb0, ...(r.jal ? { j: av.x - jx0 } : {}) }); r.version = (r.version || 0) + 1; r.lastStep = this.stepCount;
        this.emit('record-start', { trip: r.trip });
      }
      return;
    }
    if (av.carrier !== k) { r.state = 'cut'; this.emit('record-done', { trip: r.trip, aborted: true, marks: r.marks.slice() }); return; }
    if (k.phase === 'parada') {
      // on arriving: a mark, unless the grid's last one fell (almost) now — no duplicate in the same place
      if (this.stepCount - r.lastStep <= 2) r.marks.pop(); // (mark() bumps the version: the replaced one is redrawn)
      mark(); r.state = 'done';
      const jal = r.jal && this.jalon.version === r.jal.version ? r.jal : null;
      this.emit('record-done', { trip: r.trip, aborted: false, marks: r.marks.slice(), jal });
      this.checkErrand(k, r.marks);
      return;
    }
    if ((this.stepCount - r.startStep) % Math.round(0.5 / DT) === 0) { mark(); this.emit('record-mark', { trip: r.trip, n: r.marks.length }); }
  }

  /** The walkable areas now: those behind a closed gate left out, those on a carrier where it is. */
  areasNow() {
    return this.depthAreas.filter(r => !r.gate || this.gates.find(g => g.id === r.gate)?.open).map(r => {
      if (!r.carrier) return r;
      const k = this.carriers.find(c => c.id === r.carrier), i = r.inset ?? 0;
      return { ...r, x0: k.x - k.len / 2 + i, x1: k.x + k.len / 2 - i };
    });
  }

  depthStep(av, inp) {
    const iy = Math.abs(inp.y) > 0.2 ? inp.y : 0;
    if (av.z === 0) {
      const door = this.doorAt(av);
      if (!(door?.open && iy > 0 && av.supportSteps > 0 && !av.holding)) { av.vz = 0; return; }
    }
    // On a car, with ▲▼ released, the explorer settles 0.6 m in from the platform's side: the whole body
    // on the deck (not straddling its edge), the car's ruler just ahead of the feet, the kerb in view.
    const k = av.carrier, kz = k ? k.z1 - 0.6 : 0;
    const target = k && iy === 0 && av.supportSteps > 0 ? THREE_clamp((kz - av.z) * 3, -AVATAR.walk * 0.6, AVATAR.walk * 0.6) : -iy * AVATAR.walk, dv = target - av.vz, lim = AVATAR.aGround * DT;
    av.vz += Math.max(-lim, Math.min(lim, dv));
    let nz = av.z + av.vz * DT;
    if (nz >= 0) { av.z = 0; av.vz = 0; return; } // back on the 2.5D path
    const door = this.doors.find(d => d.open && av.x > d.x0 - 0.6 && av.x < d.x1 + 0.6 && nz > d.z - 1.2);
    if (door && iy !== 0) { const cx = (door.x0 + door.x1) / 2; av.x += Math.max(-1, Math.min(1, (cx - av.x) * 4)) * AVATAR.walk * 0.6 * DT; }
    // Back from the far side: the passage is behind the camera, out of sight. Walking back (▼)
    // near the near wall of the area beyond leads to the passage's mouth (declared assist).
    const back = this.doors.find(d => d.open && d.mouthZ !== undefined && iy < 0 && av.z < d.mouthZ + 0.1 && av.z > d.mouthZ - 2.5);
    if (back) { const cx = (back.x0 + back.x1) / 2; av.x += Math.max(-1, Math.min(1, (cx - av.x) * 2)) * AVATAR.walk * 0.8 * DT; }
    // An area can funnel ▼ towards its way out (the platform → the street), within a band of its edge.
    const fun = iy < 0 && this.areasNow().find(r => r.funnel && av.x >= r.x0 && av.x <= r.x1 && av.z >= r.z0 && av.z <= r.z1 && av.z > r.funnel.z - r.funnel.band);
    if (fun) av.x += Math.max(-1, Math.min(1, (fun.funnel.x - av.x) * 2)) * AVATAR.walk * 0.8 * DT;
    const feet = av.y - av.hh;
    const blocks = (b, x, z) => b.top > feet + AVATAR.step && (b.circle
      ? Math.hypot(Math.max(Math.abs(x - b.circle.x) - av.hw, 0), Math.max(Math.abs(z - b.circle.z) - av.hw, 0)) < b.circle.r
      : x + av.hw > b.x0 && x - av.hw < b.x1 && z + av.hw > b.z0 && z - av.hw < b.z1);
    const areas = this.areasNow();
    const inside = (x, z) => !this.depthBlockers.some(b => blocks(b, x, z)) && areas.some(r => x - av.hw >= r.x0 && x + av.hw <= r.x1 && z - av.hw >= r.z0 && z + av.hw <= r.z1);
    // Against a round blocker (the fountain's basin) a glancing step slides along it at 45°, at the
    // same walking speed: head-on (more than 45° into it) it still stops.
    const round = (x, z) => this.depthBlockers.find(b => b.circle && blocks(b, x, z))?.circle;
    if (inside(av.x, nz)) av.z = nz;
    else {
      const c = round(av.x, nz), sx = c ? Math.sign(av.x - c.x) : 0, k = Math.SQRT1_2, sz2 = av.z + (nz - av.z) * k, slid = av.x + sx * Math.abs(nz - av.z) * k;
      if (sx && inside(slid, sz2)) { av.x = slid; av.z = sz2; } else av.vz = 0;
    }
    if (!inside(av.x, av.z)) {
      const c = round(av.x, av.z), sz = c ? Math.sign(av.z - c.z) : 0, k2 = Math.SQRT1_2, sx2 = av.px + (av.x - av.px) * k2, slid = av.z + sz * Math.abs(av.x - av.px) * k2;
      if (sz && slid < 0 && inside(sx2, slid)) { av.x = sx2; av.z = slid; }
      else { av.x = av.px + (av.carryDx || 0); av.vx = 0; } // sideways into a wall: stop there (where the car carried it, on a car)
    }
    // still outside (a moving area's edge): to the nearest valid x, on whichever side
    if (!inside(av.x, av.z)) {
      const opts = areas.filter(r => av.z - av.hw >= r.z0 && av.z + av.hw <= r.z1).map(r => Math.min(Math.max(av.x, r.x0 + av.hw), r.x1 - av.hw));
      if (opts.length) av.x = opts.reduce((p, q) => (Math.abs(q - av.x) < Math.abs(p - av.x) ? q : p));
    }
    if (av.supportSteps > 0 && inside(av.x, av.z)) av.lastDepth = { x: av.x, y: av.y, z: av.z };
  }

  collideSolids(b, record) {
    for (const s of this.solids) {
      if (s.only && s.only !== b.shape) continue;
      if (!this.atDepth(s, b.z)) continue; // not at this depth
      if (b.shape === 'circle') {
        const cx = clamp(b.x, s.x0, s.x1), cy = clamp(b.y, s.y0, s.y1);
        let dx = b.x - cx, dy = b.y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 >= b.r * b.r) continue;
        let nx, ny, pen;
        if (d2 > 1e-12) { const d = Math.sqrt(d2); nx = dx / d; ny = dy / d; pen = b.r - d; }
        else {
          const o = [[b.x - s.x0, -1, 0], [s.x1 - b.x, 1, 0], [b.y - s.y0, 0, -1], [s.y1 - b.y, 0, 1]].sort((p, q) => p[0] - q[0])[0];
          nx = o[1]; ny = o[2]; pen = o[0] + b.r;
        }
        b.x += nx * pen; b.y += ny * pen;
        this.contact(b, nx, ny, Math.min(b.friction, s.friction), null, record, s);
      } else {
        const ox = Math.min(b.x + b.hw, s.x1) - Math.max(b.x - b.hw, s.x0);
        const oy = Math.min(b.y + b.hh, s.y1) - Math.max(b.y - b.hh, s.y0);
        if (ox <= 0 || oy <= 0) continue;
        let nx = 0, ny = 0;
        if (oy <= ox) { ny = b.y > (s.y0 + s.y1) / 2 ? 1 : -1; b.y += ny * oy; }
        else { nx = b.x > (s.x0 + s.x1) / 2 ? 1 : -1; b.x += nx * ox; }
        this.contact(b, nx, ny, 0, null, record, s);
        if (nx && b === this.avatar) this.tryMantle(b, s, nx);
      }
    }
  }

  collideBodies(record) {
    const free = this.bodies.filter(b => !b.heldBy);
    for (let i = 0; i < free.length; i++) for (let j = i + 1; j < free.length; j++) {
      const a = free[i], c = free[j];
      if (a.lane !== c.lane || Math.abs(a.z - c.z) > 0.5) continue;
      let nx, ny, pen;
      if (a.shape === 'circle' && c.shape === 'circle') {
        const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy), rr = a.r + c.r;
        if (d >= rr || d < 1e-9) continue;
        nx = dx / d; ny = dy / d; pen = rr - d;
      } else {
        const box = a.shape === 'box' ? a : c, ball = box === a ? c : a;
        const cx = clamp(ball.x, box.x - box.hw, box.x + box.hw), cy = clamp(ball.y, box.y - box.hh, box.y + box.hh);
        const dx = ball.x - cx, dy = ball.y - cy, d = Math.hypot(dx, dy);
        if (d >= ball.r || d < 1e-9) continue;
        nx = dx / d; ny = dy / d; pen = ball.r - d;
        if (box !== a) { nx = -nx; ny = -ny; }
      }
      // n points from a to c. Separate in inverse proportion to mass, then exchange impulse.
      const ia = 1 / a.mass, ic = 1 / c.mass, k = pen / (ia + ic);
      a.x -= nx * k * ia; a.y -= ny * k * ia; c.x += nx * k * ic; c.y += ny * k * ic;
      const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
      if (rv < 0) {
        const e = -rv > BOUNCE_MIN ? Math.min(a.restitution, c.restitution) || 0.2 : 0;
        const jn = -(1 + e) * rv / (ia + ic);
        a.vx -= jn * nx * ia; a.vy -= jn * ny * ia; c.vx += jn * nx * ic; c.vy += jn * ny * ic;
        if (record && -rv > 0.45) this.emit('impact', { body: c.id, kind: 'pair', speed: -rv, x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 });
      }
      if (this.supportsAgainst(a, -nx, -ny)) a.support = { nx: -nx, ny: -ny, other: c };
      if (this.supportsAgainst(c, nx, ny)) c.support = { nx, ny, other: a };
    }
  }

  handPoint() {
    const av = this.avatar;
    return { x: av.x + av.facing * (av.hw + SPHERE.r + 0.04), y: av.y + 0.12 };
  }

  updateHeld() {
    for (const b of this.bodies) {
      const h = b.heldBy;
      if (!h) continue;
      if (h.type === 'hand') { const p = this.handPoint(); b.x = p.x; b.y = p.y; b.vx = this.avatar.vx; b.vy = this.avatar.vy; }
      else if (h.type === 'stand') { b.x = h.stand.clampX; b.y = h.stand.clampY; b.vx = 0; b.vy = 0; }
      else if (h.type === 'shelf') { b.x = b.home.x; b.y = b.home.y; b.vx = 0; b.vy = 0; }
    }
  }

  updateStands() {
    for (const st of this.stands) {
      const b = st.body;
      if (st.state === 'free') {
        // A slack thread exerts no force. At full length it becomes taut and stops outward motion.
        const dx = b.x - st.clampX, dy = b.y - st.clampY, d = Math.hypot(dx, dy);
        if (d > st.threadMax) {
          const nx = dx / d, ny = dy / d;
          b.x = st.clampX + nx * st.threadMax; b.y = st.clampY + ny * st.threadMax;
          const vr = b.vx * nx + b.vy * ny;
          if (vr > 0) { b.vx -= vr * nx; b.vy -= vr * ny; this.emit('taut', { stand: st.id }); }
        }
      } else if (st.state === 'reeling') {
        const dx = st.clampX - b.x, dy = st.clampY - b.y, d = Math.hypot(dx, dy), s = REEL_SPEED * DT;
        if (d <= s) { st.state = 'armed'; b.heldBy = { type: 'stand', stand: st }; b.x = st.clampX; b.y = st.clampY; b.vx = b.vy = 0; this.emit('armed', { stand: st.id }); }
        else { b.x += dx / d * s; b.y += dy / d * s; b.vx = dx / d * REEL_SPEED; b.vy = dy / d * REEL_SPEED; }
      }
    }
  }

  /** Bodies being reeled are driven by the reel, not by the field. */
  isDriven(b) { return this.stands.some(st => st.state === 'reeling' && st.body === b); }

  interactables() {
    const av = this.avatar, out = [];
    if (av.heldBy?.type === 'chain') { out.push({ kind: 'letgo', verb: 'Soltarse', d: 0, x: av.x, y: av.y + 0.5, hint: '▲▼ subir o bajar' }); return out; }
    if (av.holding) {
      // At a chain's lip, say why it is not offered: the hands are full.
      const atChain = Math.abs(av.z) < 0.3 && this.chains.some(ch => !(ch.gated && !(this.shortSeen || this.bell?.rung)) && av.supportSteps > 0 &&
        av.x > ch.lipX - 0.75 && av.x < ch.x && Math.abs(av.y - av.hh - ch.lipY) < 0.1);
      // A cause, not an order (the other prompts are infinitives); the box clears the head.
      // At the lip, in the free band between the head and the two hanging spheres (both at 2 m):
      // higher, it covered one or both of them.
      const atDoor = this.doorAt(av)?.open;
      out.push({ kind: 'drop', verb: 'Soltar', d: 0, x: av.x - (atChain ? 0.15 : 0), y: av.y + (atChain ? 0.2 : 0),
        reason: atChain ? 'Manos ocupadas: así no se puede bajar por la cadena.' : atDoor ? 'Manos ocupadas: con la esfera no se entra por el arco.' : null });
      return out;
    }
    // A chain is offered within 0.75 m of its lip, at its real distance from where it is taken
    // (standing at the lip). It used to count as distance 0 there, which took E away from a
    // support whose post stands within that reach (the Pozo's P, 0.15 m from it).
    // A gated chain is offered once the explorer has fallen short once, or has heard the bell.
    // (the chains hang on the 2.5D path: not offered in depth, where the street crosses their x)
    for (const ch of this.chains) {
      if (Math.abs(av.z) > 0.3) break;
      if (ch.gated && !(this.shortSeen || this.bell?.rung)) continue;
      if (av.supportSteps > 0 && av.x > ch.lipX - 0.75 && av.x < ch.x && Math.abs(av.y - av.hh - ch.lipY) < 0.1) {
        // Over the explorer at the lip, not over the chasm: a sphere just let go rises there.
        out.push({ kind: 'chain', chain: ch.id, verb: 'Bajar por la cadena', d: Math.abs(av.x - (ch.lipX - av.hw - 0.05)), x: ch.lipX - 1.1, y: ch.lipY + 1.0 });
      }
      // In the air beside a chain the explorer can catch it: a way out of any oscillation.
      if (!(ch.gated && !(this.shortSeen || this.bell?.rung)) && av.supportSteps === 0 && !av.heldBy && Math.abs(av.x - (ch.x - ch.side)) < 0.45 && av.y > ch.stopY - 0.05 && av.y < ch.lipY + av.hh) {
        out.push({ kind: 'chain-air', chain: ch.id, verb: 'Agarrarse de la cadena', d: 0, x: ch.x, y: av.y + 0.7 });
      }
      // From the floor at the chain's foot it can be climbed back up.
      if (av.supportSteps > 0 && Math.abs(av.x - (ch.x - ch.side)) < 0.6 && Math.abs(av.y - av.hh - ch.floorY) < 0.1 && ch.stopY <= ch.floorY + av.hh + 0.01) {
        out.push({ kind: 'chain-foot', chain: ch.id, verb: 'Subir por la cadena', d: 0, x: ch.x, y: ch.floorY + 1.4 });
      }
    }
    // Supports are reached at their own depth (the Orilla's at z = 0, the square's behind the wall).
    for (const st of this.stands) {
      const d = Math.abs(av.x - st.x);
      if (st.z === undefined && av.z < -0.3) continue; // the path's supports, not from the threshold
      if (d > AVATAR.reach + 0.4 || Math.abs(av.y - AVATAR.hh - st.baseY) > 0.8 || Math.abs(av.z - (st.z ?? 0)) > 1.2) continue;
      const verb = st.state === 'armed' ? 'Soltar la esfera' : st.state === 'free' ? 'Recoger con el carrete' : null;
      const hint = st.state === 'armed' && st.rail ? '▲▼ altura de la pinza' : null;
      // The prompt sits over the sphere it refers to, not over the post: two supports stand side
      // by side and each one's arm reaches to the other side of the other's.
      // Reeling in is done at the post, where the reel is; the sphere may be anywhere by then.
      const armed = st.state === 'armed';
      // A level can move a prompt off its sphere (`prompt: { dx, dy }`) where it would cover an instrument.
      const off = st.prompt ?? { dx: 0, dy: 0.2 };
      if (verb) out.push({ kind: 'stand', id: st.id, body: st.body.id, verb, hint, d, x: armed ? st.body.x + off.dx : st.x, y: armed ? st.body.y + off.dy : st.baseY + 1.2, z: st.z ?? 0 });
    }
    // Gates in depth: offered at the gate, until opened.
    for (const g of this.gates) {
      if (g.open || g.opening || av.supportSteps === 0) continue;
      const d = Math.abs(av.z - g.z);
      if (d < 1.0 && av.x > g.x0 - 0.3 && av.x < g.x1 + 0.3) out.push({ kind: 'gate', id: g.id, verb: g.verb || 'Abrir', d, x: (g.x0 + g.x1) / 2, y: g.y + 2.5, z: g.z });
    }
    if (av.z < -0.3) {
      // In depth nothing else of the 2.5D path is in reach. Standing still beyond the passage
      // (whose mouth is behind the camera), the way back is named.
      const door = this.doors.find(d => d.mouthZ !== undefined && av.z < d.mouthZ);
      // Beside a car waiting at a stop, ▲ boards it.
      for (const c of this.carriers) if (c.phase === 'parada' && av.supportSteps > 0 && !av.carrier && Math.abs(av.x - c.x) < c.len / 2 - 0.3 && av.z < c.z1 + 1.6 && av.z > c.z1) out.push({ kind: 'board', key: '▲', verb: 'Subir al carro', d: 0.5, x: av.x + 0.85, y: av.y + 0.1, z: av.z });
      // The jalón (D23): taken from the rack, planted where the explorer stands (platform or car), picked up beside it.
      const jl = this.jalon, Jr = this.level.jalones, standing = av.supportSteps > 0;
      let jalonHere = false;
      const recordable = av.carrier && av.carrier.phase === 'parada' && av.supportSteps > 0 && this.recorder.state !== 'armed' && this.recorder.state !== 'on' && jl.state !== 'hand';
      if (standing && jl.state === 'rack' && !av.holding && !av.carrier && Math.abs(av.x - Jr.x) < 0.9 && Math.abs(av.z - Jr.z) < 1.3) out.push({ kind: 'jalon-take', verb: 'Tomar un jalón', d: Math.abs(av.x - Jr.x), x: Jr.x, y: av.y + 1.2, z: Jr.z });
      if (standing && jl.state === 'hand' && (av.carrier || av.support?.solid?.id === 'anden')) out.push({ kind: 'jalon-plant', verb: 'Clavar el jalón', hint: av.carrier ? 'en el carro: viaja con él' : 'en el andén', d: 0.2, x: av.x + 0.85, y: av.y + 0.6, z: av.z });
      if (standing && ((jl.state === 'ground' && !av.carrier) || (jl.state === 'car' && av.carrier === jl.carrier))) {
        const d = Math.abs(av.x - this.jalonX());
        // (at a waiting car the recorder comes first: the jalón is picked up once it is set, or while it runs)
        if (d < 0.5 && !recordable) { jalonHere = true; out.push({ kind: 'jalon-pick', verb: 'Levantar el jalón', d: d + 0.1, x: this.jalonX(), y: av.y + 1.2, z: av.z }); }
      }
      // The neighbour at the east stop and her errand.
      const En = this.level.encargo;
      if (En && standing && !av.carrier && Math.hypot(av.x - En.vecina.x, av.z - En.vecina.z) < 2.2) out.push({ kind: 'talk', verb: this.errand.state === 'none' ? 'Hablar con la vecina' : this.errand.state === 'done' ? 'Saludar a la vecina' : 'Preguntarle a la vecina', d: 0.3, x: En.vecina.x, y: av.y + 1.3, z: En.vecina.z });
      // Aboard a car waiting at a stop, its recorder can be set for the next trip.
      if (recordable && !jalonHere) out.push({ kind: 'record', verb: 'Registrar el viaje', hint: 'tiza en el andén y tinta en el carro, cada 0,5 s · ▼ bajar', d: 0.4, x: av.x + 0.85, y: av.y + 0.6, z: av.z });
      // On the car, ▼ steps off it: named while it waits at a stop, not while it runs.
      const onCar = this.carriers.find(k => av.support?.solid === k.solid);
      if (onCar) { if (onCar.phase === 'parada' && av.supportSteps > 0 && !out.length) out.push({ kind: 'back', key: '▼', verb: 'Bajar del carro', d: 9, x: av.x + 0.85, y: av.y + 0.1, z: av.z }); }
      else if (door && Math.hypot(av.vx, av.vz) < 0.1 && av.supportSteps > 0 && !out.length) out.push({ kind: 'back', key: '▼', verb: 'Volver', d: 9, x: av.x + 0.85, y: av.y + 0.1, z: av.z }); // beside, not over what is ahead
      return out.sort((p, q) => p.d - q.d);
    }
    for (const door of this.doors) {
      if (door.open || door.opening || !this.citySeen || av.supportSteps === 0) continue;
      const lx = door.lever ? door.lever.x : (door.x0 + door.x1) / 2, d = Math.abs(av.x - lx);
      if (d < 0.9 && Math.abs(av.y - av.hh - door.y) < 0.15) out.push({ kind: 'door', id: door.id, verb: door.verb || 'Abrir', d, x: lx, y: door.y + 1.6 });
    }
    // An open door is walked through, not used: the prompt names the key (▲), E does nothing.
    const open = this.doors.find(d => d.open && this.doorAt(av) === d);
    if (open && av.supportSteps > 0) out.push({ kind: 'enter', key: '▲', verb: 'Entrar', d: Math.abs(av.x - (open.x0 + open.x1) / 2) + 0.3, x: (open.x0 + open.x1) / 2, y: open.y + 2.6 });
    for (const b of this.bodies) {
      if (b.kind !== 'sphere' || this.standOf(b) || (b.heldBy && b.heldBy.type !== 'shelf')) continue;
      const d = Math.hypot(av.x - b.x, (av.y - 0.2) - b.y);
      if (d < AVATAR.reach && av.supportSteps > 0) out.push({ kind: 'pick', id: b.id, verb: 'Levantar', d, x: b.x, y: b.y + 0.35 });
    }
    return out.sort((p, q) => p.d - q.d);
  }

  standOf(b) { return this.stands.find(st => st.body === b) || null; }

  interact() {
    const it = this.interactables()[0];
    if (!it) return;
    const av = this.avatar;
    if (it.kind === 'door') { const door = this.doors.find(d => d.id === it.id); door.opening = true; this.emit('door-opening', { door: door.id }); return; }
    if (it.kind === 'gate') { const g = this.gates.find(x => x.id === it.id); g.opening = true; this.emit('gate-opening', { gate: g.id }); return; }
    if (it.kind === 'jalon-take') { Object.assign(this.jalon, { state: 'hand', version: this.jalon.version + 1 }); this.emit('jalon', { state: 'hand' }); return; }
    if (it.kind === 'jalon-plant') {
      const jl = this.jalon, k = av.carrier;
      // where the explorer stands, to 0.1 m of its own ruler (the tape or the kerb), within the surface
      const snap = v => Math.round(v * 10) / 10, kerb0 = this.carriers[0]?.kerb0 ?? 0, an = this.depthAreas.find(r => r.id === 'anden');
      if (k) Object.assign(jl, { state: 'car', carrier: k, c: clamp(snap(av.x - (k.x - k.len / 2)), 0.1, k.len - 0.1), z: av.z });
      else Object.assign(jl, { state: 'ground', carrier: null, x: clamp(kerb0 + snap(av.x - kerb0), an ? an.x0 + 0.1 : -Infinity, an ? an.x1 - 0.1 : Infinity), z: av.z });
      jl.version++; this.emit('jalon', { state: jl.state, at: jl.state === 'car' ? jl.c : jl.x - (this.carriers[0]?.kerb0 ?? 0) }); return;
    }
    if (it.kind === 'jalon-pick') { Object.assign(this.jalon, { state: 'hand', carrier: null, version: this.jalon.version + 1 }); this.emit('jalon', { state: 'hand' }); return; }
    if (it.kind === 'talk') { const e = this.errand; if (e.state === 'none') e.state = 'asked'; this.emit('errand', { state: e.state, round: e.round, target: this.level.encargo.targets[e.round], last: e.tries.at(-1) || null }); return; }
    if (it.kind === 'record') { Object.assign(this.recorder, { state: 'armed', carrier: av.carrier, trip: this.recorder.trip + 1 }); this.emit('record-armed', { trip: this.recorder.trip }); return; }
    if (it.kind === 'enter' || it.kind === 'back' || it.kind === 'board') return;
    if (it.kind === 'drop') {
      const b = av.holding; av.holding = null; b.heldBy = null; b.bellRungThisFlight = false;
      b.vx = av.vx + (av.carrier?.v ?? 0); b.vy = av.vy; b.carrier = null; // (in the ground's frame: from a moving car, at its speed)
      this.emit('drop', { body: b.id });
      this.startTrace(b, 'mano');
    } else if (it.kind === 'pick') {
      const b = this.bodies.find(x => x.id === it.id);
      b.heldBy = { type: 'hand' }; av.holding = b;
      this.emit('pick', { body: b.id });
    } else if (it.kind === 'chain' || it.kind === 'chain-foot' || it.kind === 'chain-air') {
      const ch = this.chains.find(c => c.id === it.chain);
      // Catching it in the air the hands absorb the motion: an explicit impulse from the chain.
      av.heldBy = { type: 'chain', chain: ch }; av.vx = av.vy = 0; av.supportSteps = 0; av.airSteps = 0;
      av.x = ch.x - ch.side; av.y = it.kind === 'chain' ? ch.lipY + av.hh : it.kind === 'chain-foot' ? ch.stopY : Math.max(ch.stopY, Math.min(ch.lipY + av.hh, av.y));
      this.emit('grab', { body: av.id, chain: ch.id, air: it.kind === 'chain-air' });
      this.emit('grab', { body: av.id });
    } else if (it.kind === 'letgo') {
      const ch = av.heldBy.chain;
      av.heldBy = null; av.vx = 0; av.vy = 0; av.supportSteps = 0; av.airSteps = 0; av.letGoY = av.y; av.letGoChain = ch.id;
      this.emit('letgo', { body: av.id, x: av.x, y: av.y, chain: ch.id });
    } else if (it.kind === 'stand') {
      const st = this.stands.find(s => s.id === it.id);
      if (st.state === 'armed') {
        st.state = 'free'; st.body.heldBy = null; st.body.vx = 0; st.body.vy = 0; st.body.bellRungThisFlight = false;
        this.emit('release', { stand: st.id, body: st.body.id });
        this.startTrace(st.body, st.id);
      } else if (st.state === 'free') {
        st.state = 'reeling'; st.body.heldBy = { type: 'reel', stand: st };
        this.emit('reel', { stand: st.id });
        this.endTraceOf(st.body, 'recogida');
      }
    }
  }

  /** ▲▼ at an armed support with a rail moves its clamp in fixed steps along the rail. */
  adjust(dir) {
    const it = this.interactables()[0];
    if (!it || it.kind !== 'stand') return;
    const st = this.stands.find(s => s.id === it.id);
    if (!st.rail || st.state !== 'armed') return;
    const y = Math.round((st.clampY + dir * st.rail.step) * 100) / 100;
    if (y < st.rail.min - 1e-9 || y > st.rail.max + 1e-9) { this.emit('stop', { stand: st.id }); return; }
    st.clampY = y; st.body.y = y; this.snapshotPrev(st.body);
    this.emit('adjust', { stand: st.id, y });
  }

  /** On the chain the explorer's hands are the authority: it moves along the chain only. */
  updateChain(av, iy, ch) {
    av.x = ch.x - ch.side; av.vx = 0;
    const v = iy < -0.2 ? -AVATAR.chainDown : iy > 0.2 ? AVATAR.chainUp : 0;
    const top = ch.lipY + av.hh, bottom = ch.stopY;
    let y = av.y + v * DT;
    if (y >= top && iy > 0.2) {          // back over the lip onto firm ground
      av.heldBy = null; av.x = ch.lipX - (av.hw + 0.1); av.y = top + 0.002; av.vy = 0;
      this.emit('ungrab', { body: av.id }); return;
    }
    y = Math.max(bottom, Math.min(top, y));
    av.vy = (y - av.y) / DT; av.y = y;
    av.climbing = v !== 0;
  }

  /** A bell at a height: anything that reaches it rings it once per pass. */
  updateBell() {
    for (const bl of this.bells) for (const b of this.bodies) {
      if (b.kind !== 'sphere' || b.heldBy) continue;
      // Once per flight: the clapper rings on the first touch after a release, not on every bounce.
      const near = Math.hypot(b.x - bl.x, b.y - bl.y) < bl.r + b.r, key = `atBell_${bl.id}`;
      if (near && !b[key] && !b.bellRungThisFlight) { this.emit('bell', { body: b.id, bell: bl.id, speed: Math.hypot(b.vx, b.vy) }); bl.rung++; b.bellRungThisFlight = true; }
      b[key] = near;
    }
  }

  startTrace(b, source) {
    this.endTraceOf(b, 'nueva');
    const tr = { id: ++this.traceSeq, source, body: b.id, startStep: this.stepCount, marks: [], done: false };
    tr.marks.push(this.mark(b, 0));
    this.traces.push(tr);
    const same = this.traces.filter(t => t.source === source);
    if (same.length > 3) this.traces.splice(this.traces.indexOf(same[0]), 1);
  }

  endTraceOf(b, why) { for (const t of this.traces) if (t.body === b.id && !t.done) { t.done = true; t.end = why; } }

  mark(b, tRel) {
    const a = this.fieldOn(b, { x: 0, y: 0 });
    return { t: +tRel.toFixed(4), x: b.x, y: b.y, vx: b.vx, vy: b.vy, gx: a.x, gy: a.y };
  }

  updateTraces() {
    for (const tr of this.traces) {
      if (tr.done) continue;
      const n = this.stepCount - tr.startStep;
      if (n % TRACE_EVERY) continue;
      const b = this.bodies.find(x => x.id === tr.body);
      tr.marks.push(this.mark(b, n * DT));
      const resting = b.supportSteps > 30 && Math.hypot(b.vx, b.vy) < 0.05;
      const last = tr.marks[tr.marks.length - 1], prev = tr.marks[tr.marks.length - 2];
      if (prev && prev.vy < -0.05) tr.descended = true;
      // One excursion: the trace closes when a descent turns into a rise (a bounce or a return).
      const turned = tr.descended && prev && prev.vy < 0 && last.vy >= 0;
      if (tr.marks.length >= TRACE_MAX_MARKS || resting || b.heldBy || turned) {
        tr.done = true; tr.end = resting ? 'reposo' : b.heldBy ? 'tomada' : turned ? 'vuelta' : 'límite';
      }
    }
  }

  updateZoneEvents() {
    for (const b of this.bodies) {
      for (const z of this.field.zones) {
        const w = this.field.weight(z, b.x, b.y), prev = b.zoneW[z.id] ?? w;
        if (prev < 0.5 && w >= 0.5) this.emit('enter', { body: b.id, kind: b.kind, zone: z.id, x: b.x, y: b.y });
        if (prev >= 0.5 && w < 0.5) this.emit('exit', { body: b.id, kind: b.kind, zone: z.id, x: b.x, y: b.y });
        b.zoneW[z.id] = w;
      }
    }
  }

  /** Local restart: test bodies return to their supports; the explorer stays where it is. */
  resetExperiment() {
    const av = this.avatar;
    if (av.holding) { av.holding.heldBy = null; av.holding = null; }
    for (const st of this.stands) {
      st.state = 'armed'; st.body.heldBy = { type: 'stand', stand: st };
      st.body.x = st.clampX; st.body.y = st.clampY; st.body.vx = st.body.vy = 0;
    }
    if (av.heldBy?.type === 'chain') { /* the explorer stays on the chain */ }
    for (const b of this.bodies) if (b.home) { b.x = b.home.x; b.y = b.home.y; b.vx = b.vy = 0; b.heldBy = { type: 'shelf' }; }
    for (const t of this.traces) if (!t.done) { t.done = true; t.end = 'reinicio'; }
    for (const b of this.bodies) this.snapshotPrev(b);
    this.emit('reset', {});
  }

  recover(b) {
    if (b === this.avatar) { const sp = this.level.spawn; b.x = sp.x; b.y = sp.y + b.hh; }
    else if (b.home) { b.x = b.home.x; b.y = b.home.y; b.heldBy = { type: 'shelf' }; }
    else { const st = this.standOf(b); if (st) { st.state = 'armed'; b.heldBy = { type: 'stand', stand: st }; b.x = st.clampX; b.y = st.clampY; } }
    b.vx = b.vy = 0; this.snapshotPrev(b);
    this.emit('recover', { body: b.id });
  }

  drainEvents() { const e = this.events; this.events = []; return e; }
}

/** Integrate a free point through the field (no contacts): the path water and spray follow. */
export function ballisticPath(field, x, y, vx, vy, { steps = 600, every = 6, stopY = -Infinity, z = 0 } = {}) {
  const pts = [{ x, y, vx, vy, t: 0 }], a = { x: 0, y: 0 }, b = { x: 0, y: 0 };
  for (let i = 1; i <= steps; i++) {
    field.at(x, y, a, z);
    x += vx * DT + 0.5 * a.x * DT * DT; y += vy * DT + 0.5 * a.y * DT * DT;
    field.at(x, y, b, z);
    vx += 0.5 * (a.x + b.x) * DT; vy += 0.5 * (a.y + b.y) * DT;
    if (i % every === 0) pts.push({ x, y, vx, vy, t: i * DT });
    if (y < stopY) break;
  }
  return pts;
}
