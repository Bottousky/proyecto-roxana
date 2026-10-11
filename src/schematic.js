import { PUZZLES, initialPuzzleSnapshot, evaluatePuzzle, isSealed, stoneIn, stoneRings, RING_HEX } from './puzzle-model.js';

// A circuit as it would be drawn in a field notebook: the symbols the Instituto uses (a cell, a
// zigzag for a resistance, a circle with a cross for a lamp…), wires drawn square, by hand, a little
// unsteady. The installation's own copper goes in graphite; what the player added, in blue ink;
// numbers, in red pencil. «before» draws the bench as it was found; «after», as the player left it.

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (n, d = 1) => (Math.abs(n) < .5 * 10 ** -d ? 0 : n).toLocaleString('es-AR', { maximumFractionDigits: d });
const f = n => +n.toFixed(1);

// Deterministic wobble: the same page always looks drawn by the same hand.
function hand(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - .5; };
}

/** A stroke through points, each segment slightly bowed, as a pen pulled along a ruler it doesn't have. */
function stroke(points, rnd, wobble = 2.2) {
  let d = `M${f(points[0].x + rnd() * 1.2)} ${f(points[0].y + rnd() * 1.2)}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len, bow = rnd() * wobble * Math.min(1, len / 120);
    d += ` Q${f((a.x + b.x) / 2 + nx * bow)} ${f((a.y + b.y) / 2 + ny * bow)} ${f(b.x + rnd() * 1.2)} ${f(b.y + rnd() * 1.2)}`;
  }
  return d;
}
const twice = (points, rnd, cls) => `<path class="${cls}" d="${stroke(points, rnd)}"/><path class="${cls} sk-second" d="${stroke(points, rnd, 3)}"/>`;

/** The same square routes the bench uses: a bus down from «Fuente +», a return along the bottom. */
function route(p, [a, b], members) {
  const P = id => p.ports.find(n => n.id === id);
  if (a === 'positive' || b === 'positive') {
    const pos = P('positive'), t = P(a === 'positive' ? b : a), targets = members('positive');
    const trunk = targets.length > 1 ? Math.min(...targets.map(n => n.x)) - 40 : (pos.x + t.x) / 2;
    return [pos, { x: trunk, y: pos.y }, { x: trunk, y: t.y }, t];
  }
  if (a === 'negative' || b === 'negative') {
    const neg = P('negative'), o = P(a === 'negative' ? b : a), bottom = Math.max(455, ...p.ports.map(n => n.y + 70));
    const trunk = Math.min(965, Math.max(...members('negative').map(n => n.x)) + 40);
    if (Math.abs(o.y - neg.y) < 4 && o.x > neg.x) return [o, neg];
    return [o, { x: trunk, y: o.y }, { x: trunk, y: bottom }, { x: neg.x + 90, y: bottom }, { x: neg.x + 90, y: neg.y }, neg];
  }
  const pa = P(a), pb = P(b), mid = (pa.y + pb.y) / 2;
  // A cable joining both ends of one piece jumps over it, as a bridge drawn above the symbol.
  if (p.components.some(c => (c.a === a && c.b === b) || (c.a === b && c.b === a))) return [pa, { x: pa.x, y: pa.y - 84 }, { x: pb.x, y: pb.y - 84 }, pb];
  if (Math.abs(pa.y - pb.y) < 30) return [pa, pb];
  // Down first, then in along the row, when that reaches the piece from its own outer side: the wire
  // then never climbs through the piece's label.
  const outer = p.components.some(c => (c.a === b && pa.x < pb.x) || (c.b === b && pa.x > pb.x));
  return outer ? [pa, { x: pa.x, y: pb.y }, pb] : [pa, { x: pa.x, y: mid }, { x: pb.x, y: mid }, pb];
}

// Pieces drawn with something above the line (rays, heat, a flame) have their name written a little higher.
const LIFT = c => (['lens', 'heater', 'forge'].includes(c.kind) ? 6 : 0);
const zig = (x0, x1, y, rnd, n = 6, h = 11) => { const pts = [{ x: x0, y }], step = (x1 - x0) / n; for (let i = 0; i < n; i++) pts.push({ x: x0 + step * (i + .5), y: y + (i % 2 ? h : -h) }); pts.push({ x: x1, y }); return twice(pts, rnd, 'sk-ink'); };

/** The arrow across a resistance that can be turned: drawn through the zigzag, its head even on both sides. */
function adjust(x0, x1, y, rnd) {
  const from = { x: x0 + 4, y: y + 24 }, tip = { x: x1 - 2, y: y - 26 }, len = Math.hypot(tip.x - from.x, tip.y - from.y);
  const ux = (tip.x - from.x) / len, uy = (tip.y - from.y) / len, wing = s => ({ x: tip.x - 15 * (ux * Math.cos(.45) - s * uy * Math.sin(.45)), y: tip.y - 15 * (uy * Math.cos(.45) + s * ux * Math.sin(.45)) });
  return twice([from, tip], rnd, 'sk-ink') + `<path class="sk-ink" d="M${f(wing(1).x)} ${f(wing(1).y)} L${f(tip.x)} ${f(tip.y)} L${f(wing(-1).x)} ${f(wing(-1).y)}"/>`;
}

/** One symbol between two terminals (all bench pieces lie left to right), with its leads. */
function symbol(c, a, b, state, rnd, knob) {
  const y = a.y, cx = (a.x + b.x) / 2, w = Math.min(96, (b.x - a.x) * .55), x0 = cx - w / 2, x1 = cx + w / 2;
  const lead = (from, to) => twice([{ x: from, y }, { x: to, y }], rnd, 'sk-ink');
  let body = '', leads = lead(a.x, x0) + lead(x1, b.x), note = '';
  const ring = r => `<path class="sk-ink" d="${stroke(Array.from({ length: 13 }, (_, i) => ({ x: cx + Math.cos(i / 12 * Math.PI * 2) * r, y: y + Math.sin(i / 12 * Math.PI * 2) * r })), rnd, .8)}"/>`;
  const circleLeads = r => lead(a.x, cx - r) + lead(cx + r, b.x);
  switch (c.kind) {
    case 'lamp': leads = circleLeads(20); body = ring(20) + twice([{ x: cx - 14, y: y - 14 }, { x: cx + 14, y: y + 14 }], rnd, 'sk-ink') + twice([{ x: cx + 14, y: y - 14 }, { x: cx - 14, y: y + 14 }], rnd, 'sk-ink'); break;
    case 'lens': leads = circleLeads(20); body = ring(20) + ring(9) + [0, 1, 2, 3, 4].map(i => { const t = -Math.PI / 2 + (i - 2) * .45; return twice([{ x: cx + Math.cos(t) * 25, y: y + Math.sin(t) * 25 }, { x: cx + Math.cos(t) * 34, y: y + Math.sin(t) * 34 }], rnd, 'sk-ink'); }).join(''); break;
    case 'orb': leads = circleLeads(22); body = ring(22) + `<text class="sk-glyph" x="${cx}" y="${y + 10}">♥</text>`; break;
    case 'motor': leads = circleLeads(22); body = ring(22) + `<text class="sk-glyph" x="${cx}" y="${y + 10}">M</text>`; break;
    case 'coil': body = twice([{ x: x0, y }, { x: x0 + 4, y }], rnd, 'sk-ink') + `<path class="sk-ink" d="M${x0 + 4} ${y} ${[0, 1, 2, 3].map(i => `a${(w - 8) / 8} ${(w - 8) / 8} 0 0 1 ${(w - 8) / 4} 0`).join(' ')}"/>`; break;
    case 'heater': body = zig(x0, x1, y, rnd) + [-1, 0, 1].map(i => `<path class="sk-pencil" d="M${cx + i * 24 + 6} ${y - 15} q4 -4 0 -8 q-4 -4 0 -8"/>`).join(''); break;
    case 'forge': body = zig(x0 + 6, x1 - 6, y, rnd, 5) + twice([{ x: x0, y: y - 20 }, { x: x1, y: y - 20 }, { x: x1, y: y + 20 }, { x: x0, y: y + 20 }, { x: x0, y: y - 20 }], rnd, 'sk-ink') + `<path class="sk-red" d="M${cx - 5} ${y - 22} q4 -7 2 -12 q8 6 4 12"/>`; break;
    case 'switch': {
      const closed = state.switches?.[c.switchKey];
      body = `<circle class="sk-dot" cx="${x0}" cy="${y}" r="4"/><circle class="sk-dot" cx="${x1}" cy="${y}" r="4"/>` + twice([{ x: x0, y }, closed ? { x: x1, y: y - 3 } : { x: x1 - 6, y: y - 30 }], rnd, 'sk-ink');
      break;
    }
    case 'cloth': {
      // A conductor inside a cloth cover: the cover drawn dashed. A cut conductor shows its gap.
      const open = !Number.isFinite(c.resistance);
      body = `<rect class="sk-cover" x="${x0 - 6}" y="${y - 12}" width="${w + 12}" height="24" rx="11"/>` + (open ? twice([{ x: x0, y }, { x: cx - 9, y }], rnd, 'sk-ink') + twice([{ x: cx + 9, y }, { x: x1, y }], rnd, 'sk-ink') : twice([{ x: x0, y }, { x: x1, y }], rnd, 'sk-ink'));
      if (open) note = `<text class="sk-red-note" x="${cx}" y="${y + 54}">corte</text><path class="sk-red" d="M${cx} ${y + 24} L${cx} ${y + 8}"/>`;
      break;
    }
    case 'joint': {
      const bad = c.resistance > 1;
      body = bad ? zig(x0 + 10, x1 - 10, y, rnd, 4, 9) + twice([{ x: x0, y }, { x: x0 + 10, y }], rnd, 'sk-ink') + twice([{ x: x1 - 10, y }, { x: x1, y }], rnd, 'sk-ink') : twice([{ x: x0, y }, { x: x1, y }], rnd, 'sk-ink') + `<circle class="sk-dot" cx="${cx}" cy="${y}" r="5"/>`;
      if (bad) note = `<text class="sk-red-note" x="${cx}" y="${y + 92}">óxido</text>`;
      break;
    }
    default: {
      // A stone in a socket: the zigzag with its rings painted across it. An empty socket keeps its copper strap.
      const st = stoneIn(knob, state.values?.[c.valueKey]);
      if (st?.strap) { body = twice([{ x: x0, y }, { x: x1, y }], rnd, 'sk-ink') + `<path class="sk-pencil" d="M${x0 + 4} ${y - 9} H${x1 - 4} M${x0 + 4} ${y + 9} H${x1 - 4}"/>`; note = `<text class="sk-value" x="${cx}" y="${y + 50}">puente</text>`; break; }
      body = st ? `<rect class="sk-stone" x="${f(x0)}" y="${y - 17}" width="${f(w)}" height="34" rx="17"/>` + stoneRings(st.value).map((ring, i) => `<rect class="sk-ring" x="${f(x0 + w * [.2, .33, .46, .72][i] + rnd() * 1.2)}" y="${y - 16}" width="${f(w * .08)}" height="32" fill="${RING_HEX[ring]}"/>`).join('') + `<rect class="sk-ink" x="${f(x0)}" y="${y - 17}" width="${f(w)}" height="34" rx="17" fill="none"/>`
        : zig(x0, x1, y, rnd) + (c.valueKey ? adjust(x0, x1, y, rnd) : '');
    }
  }
  return leads + body + note;
}

/** The resistance a piece has on this montage, or null when the notebook doesn't write one. */
function ohms(c, state, knob) {
  const r = c.valueKey ? state.values?.[c.valueKey] : c.resistance;
  if (stoneIn(knob, r)?.strap) return null;
  if (c.kind === 'cloth' || c.kind === 'switch' || (c.kind === 'joint' && c.resistance <= 1)) return null;
  return Number.isFinite(r) ? r : null;
}

// Roughly how wide the hand writes: enough to centre a line and keep two labels apart.
const width = (text, size) => String(text).length * size * .44;

/** «Ω» drawn by the same hand: the notebook's lettering has no Greek, and a borrowed glyph looks typed. */
export function omega(x, y, k = 1, cls = 'sk-omega') {
  const d = [[6, 0], [-6, -6, -9, -12, -7, -18], [2, -7, 8, -10, 13, -10], [5, 0, 11, 3, 13, 10], [2, 6, -1, 12, -7, 18], [6, 0]]
    .map(seg => (seg.length === 2 ? 'l' : 'c') + seg.map(v => f(v * k)).join(' ')).join(' ');
  return `<path class="${cls}" d="M${f(x)} ${f(y)} ${d}"/>`;
}
const OMEGA = 24 * .85;

/** Value and, after a working montage, what reached the piece: under the symbol, or both on one line when the row below is close. */
function figures(cx, y, r, reading, { room, crossed }) {
  const n = r == null ? '' : num(r, 0), nw = n ? n.length * 20 + 12 + OMEGA : 0, wide = nw + width(reading, 36) + (n ? 22 : 0);
  // Two lines when there is room; one line when the row below is close, unless that line would cross
  // a wire coming down beside the piece: then two tight lines.
  const tight = reading && room < 18 && crossed(cx - wide / 2, cx + wide / 2), inline = reading && room < 18 && !tight;
  const rw = inline ? wide - nw : 0, left = cx - (nw + rw) / 2;
  let out = n ? `<text class="sk-value" x="${f(left + nw - OMEGA - 12)}" y="${y + 50}" text-anchor="end">${n}</text>${omega(left + nw - OMEGA, y + 49, .85)}` : '';
  if (reading) out += inline
    ? `<text class="sk-red-note" x="${f(left + nw + (n ? 22 : 0))}" y="${y + 50}" text-anchor="start">${reading}</text>`
    : `<text class="sk-red-note${tight ? ' sk-tight' : ''}" x="${cx}" y="${y + (n ? (tight ? 80 : 84) : 50)}">${reading}</text>`;
  return out;
}

/**
 * Draw a bench in notebook ink. `mode` is «before» (as found) or «after» (the player's montage);
 * after it, the pieces that work carry what reached them, in red pencil.
 */
export function renderSchematic(id, snapshot, { mode = 'after', caption } = {}) {
  const p = PUZZLES[id];
  if (!p) return '';
  const state = mode === 'before' ? initialPuzzleSnapshot(id) : snapshot;
  if (!state?.wires) return '';
  const rnd = hand(`${id}:${mode}`), P = Object.fromEntries(p.ports.map(n => [n.id, n]));
  const wires = state.wires.filter(w => P[w[0]] && P[w[1]]);
  const members = end => wires.filter(w => w.includes(end)).map(w => P[w[0] === end ? w[1] : w[0]]);
  const initial = initialPuzzleSnapshot(id).wires, same = (u, v) => u.every(n => v.includes(n));
  const mine = w => mode === 'after' && !isSealed(id, w) && !initial.some(v => same(v, w));
  const result = mode === 'after' ? evaluatePuzzle(id, { ...JSON.parse(JSON.stringify(state)), sourceOn: true, tripped: false }) : null;

  const paths = wires.map(w => route(p, w, members));
  const copper = paths.map((pts, i) => twice(pts, rnd, mine(wires[i]) ? 'sk-blue' : 'sk-ink')).join('');
  const uprights = paths.flatMap(pts => pts.slice(1).map((q, i) => [pts[i], q])).filter(([u, v]) => Math.abs(u.x - v.x) < 2 && Math.abs(u.y - v.y) > 2);
  const degree = Object.fromEntries(p.ports.map(n => [n.id, wires.filter(w => w.includes(n.id)).length + p.components.filter(c => c.a === n.id || c.b === n.id).length]));
  const dots = p.ports.filter(n => !['positive', 'negative'].includes(n.id)).map(n => `<circle class="${degree[n.id] >= 3 ? 'sk-node' : 'sk-dot'}" cx="${n.x}" cy="${n.y}" r="${degree[n.id] >= 3 ? 6 : 3.5}"/>`).join('');

  // The cell: long and short plates, «+» on top, its push written beside it.
  const pos = P.positive, neg = P.negative, mid = (pos.y + neg.y) / 2;
  const cell = twice([{ x: pos.x, y: pos.y }, { x: pos.x, y: mid - 10 }], rnd, 'sk-ink') + twice([{ x: pos.x, y: mid + 10 }, { x: pos.x, y: neg.y }], rnd, 'sk-ink')
    + `<path class="sk-plate" d="M${pos.x - 24} ${mid - 10} H${pos.x + 24}"/><path class="sk-plate sk-thick" d="M${pos.x - 12} ${mid + 10} H${pos.x + 12}"/>`
    + `<text class="sk-sign" x="${pos.x - 38}" y="${mid - 12}">+</text><text class="sk-sign" x="${pos.x - 38}" y="${mid + 40}">−</text><text class="sk-value" x="${pos.x + 38}" y="${mid + 13}" text-anchor="start">${num(p.voltage, 0)} V</text>`
    + `<circle class="sk-dot" cx="${pos.x}" cy="${pos.y}" r="4"/><circle class="sk-dot" cx="${neg.x}" cy="${neg.y}" r="4"/>`;

  const xs = p.ports.map(n => n.x), ys = p.ports.map(n => n.y), bottom = wires.some(w => w.includes('negative')) ? Math.max(455, ...ys.map(y => y + 70)) : Math.max(...ys);
  const placed = p.components.filter(c => P[c.a] && P[c.b]).map(c => ({ c, a: P[c.a], b: P[c.b], cx: (P[c.a].x + P[c.b].x) / 2, y: P[c.a].y }));
  const pieces = placed.map(({ c, a, b, cx, y }) => {
    const knob = p.knobs?.find(k => k.key === c.valueKey);
    const name = c.label.replace(/ · .*/, ''), branch = result?.solution.branches[c.id];
    const reading = result && branch && (c.goal || (p.constraints ?? []).some(k => k.branch === c.id)) && Math.abs(branch.current ?? 0) > .01
      ? `${num(Math.abs(branch.voltage), 1)} V · ${num(Math.abs(branch.current), 2)} A` : '';
    // Room under the piece: the next row's label, or the return drawn along the bottom.
    const below = Math.min(bottom - 12, ...placed.filter(o => o.y > y + 30 && Math.abs(o.cx - cx) < 300).map(o => o.y - 34 - LIFT(o.c) - 30));
    // A label never runs into its neighbour's: the hand writes smaller when the row is tight.
    const room = Math.min(Infinity, ...placed.filter(o => o !== placed.find(q => q.c === c) && Math.abs(o.y - y) < 30).map(o => Math.abs(o.cx - cx) - 18));
    const size = Math.max(28, Math.min(42, 42 * room / width(name, 42)));
    return `<g class="sk-piece">${symbol(c, a, b, state, rnd, knob)}<text class="sk-label" x="${cx}" y="${y - 34 - LIFT(c)}"${size < 42 ? ` style="font-size:${f(size)}px"` : ''}>${esc(name)}</text>${figures(cx, y, ohms(c, state, knob), reading, { room: below - (y + 84), crossed: (x0, x1) => uprights.some(([u, v]) => u.x > x0 && u.x < x1 && Math.min(u.y, v.y) < y + 50 && Math.max(u.y, v.y) > y + 26) })}</g>`;
  }).join('');

  // Conventional current leaves «+»: one small arrow on the first lead, when something flows.
  const flowing = result && Math.abs(result.current) > .01;
  const arrow = flowing ? `<path class="sk-blue" d="M${pos.x + 26} ${pos.y - 12} h22 m-7 -6 l7 6 l-7 6"/><text class="sk-blue-note" x="${pos.x + 37}" y="${pos.y - 24}">${num(result.current, 2)} A</text>` : '';

  const top = Math.min(...ys) - (wires.some(w => p.components.some(c => w.includes(c.a) && w.includes(c.b))) ? 110 : 80);
  const vb = [Math.min(...xs) - 70, top, Math.max(...xs) + 80 - (Math.min(...xs) - 70), bottom + 40 - top].map(f);
  const title = caption ?? (mode === 'before' ? 'Así estaba' : 'Así lo dejé');
  return `<figure class="dj-schematic dj-schematic-${mode}"><figcaption>${esc(title)}</figcaption><svg viewBox="${vb.join(' ')}" role="img" aria-label="${esc(`${title}: esquema de ${p.title}`)}"><g class="sk-sheet">${copper}${cell}${pieces}${dots}${arrow}</g></svg></figure>`;
}

// ── Small symbols for the glossary: the same hand, at the size of a word ─────────────────
const SYMBOLS = {
  battery: '<path class="sk-plate" d="M30 14 V46"/><path class="sk-plate sk-thick" d="M42 22 V38"/><path class="sk-ink" d="M6 30 H30 M42 30 H74"/><text class="sk-sign" x="22" y="12">+</text>',
  resistor: '<path class="sk-ink" d="M4 30 H16 L21 19 L29 41 L37 19 L45 41 L53 19 L58 30 H76"/>',
  lamp: '<circle class="sk-ink" cx="40" cy="30" r="15"/><path class="sk-ink" d="M29 19 L51 41 M51 19 L29 41 M4 30 H25 M55 30 H76"/>',
  loop: '<rect class="sk-ink" x="10" y="10" width="60" height="40" rx="4"/><path class="sk-blue" d="M36 6 l8 4 l-8 4"/>',
  charges: '<path class="sk-ink" d="M4 22 H76 M4 38 H76"/>' + [12, 26, 40, 54, 68].map(x => `<circle class="sk-blue-dot" cx="${x}" cy="30" r="3.4"/>`).join(''),
  arrow: '<path class="sk-ink" d="M4 30 H76"/><path class="sk-blue" d="M30 22 H52 m-7 -6 l7 6 l-7 6"/>',
  cable: '<rect class="sk-cover" x="6" y="18" width="68" height="24" rx="11"/><path class="sk-ink" d="M2 30 H78"/>',
  probe: '<path class="sk-ink" d="M14 46 L30 18 M66 46 L50 18"/><circle class="sk-red-dot" cx="30" cy="16" r="4"/><circle class="sk-dot" cx="50" cy="16" r="4"/>',
  polarity: '<text class="sk-sign" x="18" y="38">+</text><text class="sk-sign" x="62" y="38">−</text><path class="sk-blue" d="M30 30 H50 m-7 -6 l7 6 l-7 6"/>',
  drop: '<path class="sk-ink" d="M4 14 H30 L50 46 H76"/><text class="sk-red-note" x="62" y="30">ΔV</text>',
  series: '<path class="sk-ink" d="M2 30 H76"/><circle class="sk-ink" cx="26" cy="30" r="9"/><circle class="sk-ink" cx="54" cy="30" r="9"/>',
  parallel: '<path class="sk-ink" d="M6 14 V46 M74 14 V46 M6 14 H74 M6 46 H74"/><circle class="sk-paper" cx="40" cy="14" r="9"/><circle class="sk-paper" cx="40" cy="46" r="9"/>',
  power: '<circle class="sk-ink" cx="40" cy="34" r="13"/><path class="sk-red" d="M40 4 v10 M22 10 l6 8 M58 10 l-6 8"/>',
  heat: '<path class="sk-ink" d="M4 40 H76"/><path class="sk-red" d="M24 30 q6 -7 0 -14 q-6 -7 0 -14 M40 30 q6 -7 0 -14 q-6 -7 0 -14 M56 30 q6 -7 0 -14 q-6 -7 0 -14"/>',
  ohm: omega(22, 48, 1.5, 'sk-ink'),
  rings: '<path class="sk-ink" d="M2 30 H12 M68 30 H78"/><rect class="sk-ink" x="12" y="17" width="56" height="26" rx="12"/>' + ['marron', 'negro', 'negro', 'oro'].map((c, i) => `<rect x="${[21, 30, 39, 54][i]}" y="18" width="5" height="24" fill="${RING_HEX[c]}"/>`).join(''),
  loopsum: '<rect class="sk-ink" x="8" y="10" width="64" height="40" rx="4"/><path class="sk-blue" d="M30 6 l8 4 l-8 4"/><text class="sk-red-note" x="40" y="38">Σ</text>',
  nodesum: '<path class="sk-ink" d="M4 30 H40 M40 30 L74 8 M40 30 H76 M40 30 L74 52"/><circle class="sk-node" cx="40" cy="30" r="5"/><path class="sk-blue" d="M14 24 h12 m-5 -4 l5 4 l-5 4"/>',
  node: '<path class="sk-ink" d="M4 30 H40 L74 10 M40 30 L74 50"/><circle class="sk-node" cx="40" cy="30" r="5"/>',
  divider: '<path class="sk-ink" d="M20 2 V10 L12 13 L28 19 L12 25 L20 28 V32 L12 35 L28 41 L12 47 L20 50 V58 M20 30 H60"/><circle class="sk-node" cx="20" cy="30" r="4"/><text class="sk-red-note" x="66" y="34">V</text>',
};
export function wordSymbol(key) { return SYMBOLS[key] ? `<svg class="dj-word-symbol" viewBox="0 0 80 60" aria-hidden="true">${SYMBOLS[key]}</svg>` : ''; }
