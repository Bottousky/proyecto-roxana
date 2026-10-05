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
};
export const SPHERE = { r: 0.17, mass: 1.2, restitution: 0.35, friction: 0.32 };
const BOUNCE_MIN = 0.7;  // m/s: slower normal impacts settle instead of bouncing
const REEL_SPEED = 3.2;  // m/s, the reel's motor drags the sphere home along its thread

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class World {
  constructor(level) {
    this.level = level;
    this.field = new Field({ zones: level.zones });
    this.solids = level.solids.map(s => ({ friction: 0.6, ...s }));
    this.bodies = [];
    this.stands = [];
    this.traces = [];
    this.events = [];
    this.stepCount = 0;
    this.t = 0;
    this.nextId = 1;
    this.traceSeq = 0;
    this.input = { x: 0, act: false, reset: false };
    this._a = { x: 0, y: 0 };
    this._a1 = { x: 0, y: 0 };

    const sp = level.spawn;
    this.avatar = this.addBody({ kind: 'avatar', shape: 'box', x: sp.x, y: sp.y + AVATAR.hh, hw: AVATAR.hw, hh: AVATAR.hh,
      mass: AVATAR.mass, restitution: 0, friction: 0 });
    this.avatar.facing = 1;
    this.avatar.holding = null;

    for (const s of level.stands || []) {
      const st = { ...s, state: 'armed', body: null };
      st.body = this.addBody(this.sphereSpec(s.clampX, s.clampY, { tag: s.id, lane: 1 }));
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
    const b = { id: this.nextId++, lane: 0, vx: 0, vy: 0, ax: 0, ay: 0, heldBy: null, support: null, supportSteps: 0,
      zoneW: {}, px: spec.x, py: spec.y, ...spec };
    this.bodies.push(b);
    return b;
  }

  snapshotPrev(b) { b.px = b.x; b.py = b.y; }

  emit(type, data) { this.events.push({ type, step: this.stepCount, t: this.t, ...data }); }

  /** Advance one fixed step. */
  step() {
    const inp = this.input;
    for (const b of this.bodies) this.snapshotPrev(b);
    if (inp.reset) { inp.reset = false; this.resetExperiment(); }
    if (inp.act) { inp.act = false; this.interact(); }

    const av = this.avatar;
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

    for (let pass = 0; pass < 3; pass++) {
      for (const b of this.bodies) if (!b.heldBy) this.collideSolids(b, pass === 0);
      this.collideBodies(pass === 0);
    }

    for (const b of this.bodies) {
      if (b.heldBy) continue;
      b.supportSteps = b.support ? b.supportSteps + 1 : 0;
      if (b.y < -30 || b.y > 60 || Math.abs(b.x) > 200) this.recover(b);
    }
    if (inp.x > 0.1) av.facing = 1; else if (inp.x < -0.1) av.facing = -1;

    this.updateHeld();
    this.updateStands();
    this.updateZoneEvents();
    this.stepCount++;
    this.t = this.stepCount * DT;
    this.updateTraces();
  }

  fieldOn(b, out) {
    return b.shape === 'box' ? this.field.onBody(b.x, b.y, b.hw, b.hh, out) : this.field.onBody(b.x, b.y, b.r * 0.7, b.r * 0.7, out);
  }

  /** Horizontal acceleration the explorer applies to itself. Declared assist, never vertical. */
  locomotion(av, ix) {
    const target = clamp(ix, -1, 1) * AVATAR.walk;
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

  contact(b, nx, ny, mu, other = null, record = true) {
    const vn = b.vx * nx + b.vy * ny;
    if (this.supportsAgainst(b, nx, ny)) b.support = { nx, ny, other };
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

  collideSolids(b, record) {
    for (const s of this.solids) {
      if (s.only && s.only !== b.shape) continue;
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
        this.contact(b, nx, ny, Math.min(b.friction, s.friction), null, record);
      } else {
        const ox = Math.min(b.x + b.hw, s.x1) - Math.max(b.x - b.hw, s.x0);
        const oy = Math.min(b.y + b.hh, s.y1) - Math.max(b.y - b.hh, s.y0);
        if (ox <= 0 || oy <= 0) continue;
        let nx = 0, ny = 0;
        if (oy <= ox) { ny = b.y > (s.y0 + s.y1) / 2 ? 1 : -1; b.y += ny * oy; }
        else { nx = b.x > (s.x0 + s.x1) / 2 ? 1 : -1; b.x += nx * ox; }
        this.contact(b, nx, ny, 0, null, record);
      }
    }
  }

  collideBodies(record) {
    const free = this.bodies.filter(b => !b.heldBy);
    for (let i = 0; i < free.length; i++) for (let j = i + 1; j < free.length; j++) {
      const a = free[i], c = free[j];
      if (a.lane !== c.lane) continue;
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
    if (av.holding) { out.push({ kind: 'drop', verb: 'Soltar', d: 0, x: av.x, y: av.y }); return out; }
    for (const st of this.stands) {
      const d = Math.abs(av.x - st.x);
      if (d > AVATAR.reach + 0.4 || Math.abs(av.y - AVATAR.hh - st.baseY) > 0.8) continue;
      const verb = st.state === 'armed' ? 'Soltar la esfera' : st.state === 'free' ? 'Recoger con el carrete' : null;
      if (verb) out.push({ kind: 'stand', id: st.id, verb, d, x: st.x, y: st.baseY + 1.2 });
    }
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
    if (it.kind === 'drop') {
      const b = av.holding; av.holding = null; b.heldBy = null;
      b.vx = av.vx; b.vy = av.vy;
      this.emit('drop', { body: b.id });
      this.startTrace(b, 'mano');
    } else if (it.kind === 'pick') {
      const b = this.bodies.find(x => x.id === it.id);
      b.heldBy = { type: 'hand' }; av.holding = b;
      this.emit('pick', { body: b.id });
    } else if (it.kind === 'stand') {
      const st = this.stands.find(s => s.id === it.id);
      if (st.state === 'armed') {
        st.state = 'free'; st.body.heldBy = null; st.body.vx = 0; st.body.vy = 0;
        this.emit('release', { stand: st.id, body: st.body.id });
        this.startTrace(st.body, st.id);
      } else if (st.state === 'free') {
        st.state = 'reeling'; st.body.heldBy = { type: 'reel', stand: st };
        this.emit('reel', { stand: st.id });
        this.endTraceOf(st.body, 'recogida');
      }
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
      if (tr.marks.length >= TRACE_MAX_MARKS || resting || b.heldBy) { tr.done = true; tr.end = resting ? 'reposo' : b.heldBy ? 'tomada' : 'límite'; }
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
export function ballisticPath(field, x, y, vx, vy, { steps = 600, every = 6, stopY = -Infinity } = {}) {
  const pts = [{ x, y, vx, vy, t: 0 }], a = { x: 0, y: 0 }, b = { x: 0, y: 0 };
  for (let i = 1; i <= steps; i++) {
    field.at(x, y, a);
    x += vx * DT + 0.5 * a.x * DT * DT; y += vy * DT + 0.5 * a.y * DT * DT;
    field.at(x, y, b);
    vx += 0.5 * (a.x + b.x) * DT; vy += 0.5 * (a.y + b.y) * DT;
    if (i % every === 0) pts.push({ x, y, vx, vy, t: i * DT });
    if (y < stopY) break;
  }
  return pts;
}
