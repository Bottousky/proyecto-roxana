// La Bitácora formalises after the experience. Every number in a note is read from the
// experiment that just happened (its trace marks and contact events), never written ahead.
// Notes never block play and nothing asks the player to answer anything.
import { DT } from './sim/world.js';
import { FUENTE, TERRACE_Y } from './sim/levels/cascada.js';

const KEY = 'physica.v2';   // v1 saved positions belong to the earlier geometry
const fmt = (v, d = 1) => v.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
/**
 * The readings shown for a recorded trip, one rule for the whole family (D24, after review): to the
 * decimetre, rounding ties the same way every time (a still explorer sat exactly on 1,85 and the ramp
 * put the car on x,x25 marks: plain rounding flickered with floating-point noise); the car's zero (Z) and
 * the tape (C) are rounded, and the kerb is their sum (G = Z + C), so every shown number adds up — in
 * the table, the notes, the bubbles and the errand alike.
 */
export const rnd = v => Math.round(v * 10 + 1e-6) / 10;
export function lecturas(marks, half) {
  return marks.map(m => { const Z = rnd(m.k - half), C = rnd(m.c); return { t: rnd(m.t), Z, C, G: rnd(Z + C) }; });
}
/** The shown reading of an errand try: where its last chalk is, and by how much it missed. */
export function shownTry(t) { const G = rnd(rnd(t.zero) + rnd(t.c)); return { G, Z: rnd(t.zero), C: rnd(t.c), miss: rnd(G - t.target) }; }

/** A recorded trip as a short table (D24): a row every 2 s and the arrival; t, kerb = car's zero + tape. */
export function tripTable(marks, half) {
  const L = lecturas(marks, half), rows = [];
  L.forEach((r, i) => { if (i === L.length - 1 || Math.abs(r.t / 2 - Math.round(r.t / 2)) < 1e-6) rows.push({ t: r.t, g: r.G, z: r.Z, c: r.C }); });
  return rows;
}

/**
 * What each observer says about a recorded trip: the boy on the far pavement (the ground) and the
 * passenger on the car. «No te moviste» only when every mark stayed in one place; having walked and come
 * back is said as such (a displacement of 0 is not the same as not moving).
 */
export function describeTrip(marks, half) {
  const L = lecturas(marks, half), a = L[0], b = L.at(-1), T = b.t - a.t;
  const DG = rnd(b.G - a.G), DK = rnd(b.Z - a.Z), DC = rnd(b.C - a.C);
  const stillInk = marks.every(m => Math.abs(m.c - marks[0].c) < 0.05), stillGround = marks.every(m => Math.abs(m.g - marks[0].g) < 0.05);
  const dir = v => (v > 0 ? 'hacia el este' : 'hacia el oeste');
  const anden = Math.abs(DG) < 0.05
    ? (stillGround ? ['Desde la vereda: 0,0 m', 'no te moviste.'] : ['Desde la vereda: 0,0 m', 'te moviste, pero volviste', 'al mismo lugar.'])
    : [`Desde la vereda: ${sgn(DG)} m`, `en ${fmt(T)} s, ${dir(DG)}.`, `El carro: ${sgn(DK)} m.`];
  const carro = Math.abs(DC) < 0.05
    ? (stillInk ? ['Desde el carro: 0,0 m', 'no te moviste.', `La vereda se fue ${fmt(Math.abs(DK))} m ${DK > 0 ? 'al oeste' : 'al este'}.`] : ['Desde el carro: 0,0 m', 'caminaste, pero terminaste', 'donde empezaste.'])
    : [`Desde el carro: ${sgn(DC)} m`, `${dir(DC)}, por la cubierta.`];
  return { anden, carro, DG, DK, DC, T };
}

/** A displacement with its sign (the true minus sign): +15,0 · −3,2 · 0,0. */
const sgn = (v, d = 1) => (v >= 0.05 ? '+' : v <= -0.05 ? '−' : '') + fmt(Math.abs(v) < 0.05 ? 0 : Math.abs(v), d);

/** Height where a rising trace stops accelerating upward: its second differences change sign. */
export function boundaryFromMarks(marks) {
  const d = i => marks[i + 1].y - 2 * marks[i].y + marks[i - 1].y;
  for (let i = 2; i < marks.length - 1; i++) {
    if (marks[i].vy > 0 && d(i - 1) > 0 && d(i) <= 0) return marks[i].y;
  }
  return null;
}

/** The marks of the first rise, up to just below where the acceleration changed. */
export function firstRise(marks, yb) {
  const out = [];
  for (const m of marks) { if (yb != null && m.y >= yb - 0.25) break; out.push(m); }
  return out;
}

/** Least-squares a for y = y0 + v0·t + ½·a·t² over marks (t relative to the first). */
export function fitAcceleration(marks) {
  if (marks.length < 4) return null;
  // Normal equations for [y0, v0, a/2] on basis [1, t, t²].
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], b = [0, 0, 0];
  for (const m of marks) {
    const f = [1, m.t, m.t * m.t];
    for (let i = 0; i < 3; i++) { b[i] += f[i] * m.y; for (let j = 0; j < 3; j++) S[i][j] += f[i] * f[j]; }
  }
  const det = M => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
  const D = det(S); if (Math.abs(D) < 1e-12) return null;
  const col = k => S.map((row, i) => row.map((v, j) => (j === k ? b[i] : v)));
  return 2 * det(col(2)) / D;
}

export class Journal {
  constructor(root, world) {
    this.world = world; this.notes = []; this.open = false; this.flags = {};
    this.panel = document.createElement('aside'); this.panel.className = 'journal'; this.panel.hidden = true;
    this.toastEl = document.createElement('div'); this.toastEl.className = 'toast'; this.toastEl.hidden = true;
    root.append(this.panel, this.toastEl);
    this.toastT = 0;
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s?.notes) { this.notes = s.notes; this.flags = s.flags || {}; this.footing = s.footing || null; }
      // A saved footing must still be firm ground in this geometry.
      const f = this.footing, av = world.avatar;
      if (f && !world.solids.some(o => !o.only && world.atDepth(o, 0) && f.x >= o.x0 && f.x <= o.x1 && Math.abs(f.y - av.hh - o.y1) < 0.01)) this.footing = null;
    } catch { /* storage unavailable: start empty */ }
    this.render();
  }

  ids() { return this.notes.map(n => n.id); }
  has(id) { return this.notes.some(n => n.id === id); }
  save() { try { localStorage.setItem(KEY, JSON.stringify({ notes: this.notes, flags: this.flags, footing: this.world.avatar.lastSupport || this.footing })); } catch { /* not persisted */ } }

  /** Adds a note, or rewrites it if it exists (a running record, like the errand's attempts). */
  put(id, title, body, data = null, { quiet = false } = {}) {
    const i = this.notes.findIndex(x => x.id === id);
    if (i < 0 && !quiet) return this.add(id, title, body, data);
    if (i >= 0) this.notes.splice(i, 1); // (rewritten notes move to the end: the latest)
    this.notes.push({ id, title, body, data, at: Date.now() });
    this.save(); this.render(); this.onAdd?.(id);
    if (!quiet) { this.toastEl.innerHTML = `<b>Bitácora</b> · ${title} <kbd>J</kbd>`; this.toastEl.hidden = false; this.toastT = 5; }
  }

  add(id, title, body, data = null) {
    if (this.has(id)) return;
    this.notes.push({ id, title, body, data, at: Date.now() });
    this.save(); this.render(); this.onAdd?.(id);
    this.toastEl.innerHTML = `<b>Bitácora</b> · ${title} <kbd>J</kbd>`; this.toastEl.hidden = false; this.toastT = 5;
  }

  toggle() { this.open = !this.open; this.panel.hidden = !this.open; if (this.open) { this.toastEl.hidden = true; this.render(); } }

  onEvent(e) {
    const w = this.world;
    // The neighbour's errand (D23): asked, its attempts (where the last chalk fell, short or over, not the
    // answer; a walked trip does not count), met — and then her jalón moves to a new reading.
    // The errand's state is kept in the flags (restored into the world on loading).
    if (e.type === 'errand' && e.state === 'asked' && e.round === 0) this.add('encargo', 'El encargo de la vecina',
      `En la parada este, una vecina clavó su jalón en el cordón del andén, en ${fmt(e.target)} m. Te pidió que la última marca de tiza de tu registrador, en un viaje hacia la parada este hecho quieto, quede al pie de su jalón (el recuadro en el cordón). El cartel de la parada este dice dónde se detiene ahí el cero de la cinta del carro.`, { target: e.target });
    if (e.type === 'errand-miss' || e.type === 'errand-walked' || e.type === 'errand-done') {
      const tries = (this.flags.errandTries ||= []);
      const sh = shownTry(e);
      tries.push({ round: e.round, g: sh.G, miss: sh.miss, still: e.still, met: e.type === 'errand-done' });
      const line = (t, i) => `${i + 1}) ${t.still ? `tu última tiza en ${fmt(t.g, 1)} m: ${t.met ? 'al pie del jalón' : `${t.miss < 0 ? 'faltaron' : 'sobraron'} ${fmt(Math.abs(t.miss), 1)} m`}` : 'caminaste durante el viaje: no cuenta'}`;
      const rounds = [...new Set(tries.map(t => t.round))];
      const body = rounds.map(r => { const ts = tries.filter(t => t.round === r).slice(-5); return `Jalón en ${fmt(this.world.level.encargo.targets[r])} m: ${ts.map(line).join('; ')}.`; }).join(' ');
      this.put('encargo-intentos', 'El encargo: los intentos', `${body} El carro siempre se detiene igual; lo que cambia es dónde vas parado en él.`, { tries });
    }
    if (e.type === 'errand-done') {
      const sh = shownTry(e), sum = `${fmt(sh.Z)} + ${fmt(sh.C)} = ${fmt(sh.G)} m`;
      const id = e.round === 0 ? 'encargo-cumplido' : `encargo-cumplido-${e.round + 1}`;
      this.add(id, e.round === 0 ? 'El encargo, cumplido' : 'Otra vez, en otro lugar',
        `Tu última tiza quedó en ${fmt(sh.G)} m del cordón, al pie del jalón de la vecina (${fmt(e.target)} m). Ibas parado en ${fmt(sh.C)} m de la cinta, y el cero de la cinta se detuvo en ${fmt(sh.Z)} m del cordón: ${sum}. Una posición en el andén es la posición del carro más la posición sobre el carro.${e.tries > 1 ? ` Lo lograste en el intento ${e.tries}.` : ''}${e.next !== undefined ? ` Cuando el carro salió, la vecina corrió su jalón a ${fmt(e.next)} m: «¿Y ahora?»` : ''}`, { g: e.g, c: e.c, zero: e.zero, tries: e.tries, round: e.round });
    }
    if (e.type === 'errand' || e.type === 'errand-miss' || e.type === 'errand-walked' || e.type === 'errand-done' || e.type === 'errand-moved') {
      const er = this.world.errand; this.flags.errand = { state: er.state, round: er.round, placed: er.placed, tries: er.tries.map(t => ({ ...t })) }; this.save();
    }
    // The car's recorder (D22): two records of one trip, written with that trip's numbers. A note is
    // composed per trip: the first one says what the two records are; the sum (walking on the car) and
    // the sign (westward) are explained the first time they appear, in whichever note that is.
    if (e.type === 'record-done' && !e.aborted && e.marks.length >= 2) {
      const m0 = e.marks[0], m1 = e.marks.at(-1), n = e.marks.length, half = e.half ?? 1.8;
      // (the family's one rule for shown readings: lecturas)
      const L = lecturas(e.marks, half), T = L.at(-1).t - L[0].t, G0 = L[0].G, G1 = L.at(-1).G, C0 = L[0].C, C1 = L.at(-1).C, DG = rnd(G1 - G0), DK = rnd(L.at(-1).Z - L[0].Z), DC = rnd(C1 - C0);
      const walked = Math.abs(m1.c - m0.c) >= 0.5 || e.marks.some(m => Math.abs(m.c - m0.c) >= 0.5), west = DK < 0;
      const sameInk = e.marks.every(m => Math.abs(m.c - m0.c) < 0.05);
      const data = { g0: m0.g, g1: m1.g, c0: m0.c, c1: m1.c, dg: DG, dc: DC, dk: DK, T, n };
      const sum = walked && !this.flags.sumSaid ? ` El desplazamiento respecto del andén es el del carro más el tuyo sobre el carro: ${sgn(DK)} + (${sgn(DC)}) = ${sgn(DK + DC)} m.` : '';
      const sign = west && !this.flags.signSaid ? ` Hacia el oeste las lecturas del cordón bajan: el desplazamiento es negativo. La distancia recorrida fue ${fmt(Math.abs(DG))} m; el signo dice hacia dónde.` : '';
      let id = null, title = '', body = '';
      if (!this.has('registro')) {
        id = 'registro'; title = 'Dos registros del mismo viaje';
        body = `El registrador marcó cada 0,5 s dónde estabas, con tiza en el cordón del andén y con tinta en la cinta del carro: ${n} marcas en cada uno. En el cordón pasaste de ${fmt(G0)} m a ${fmt(G1)} m, un desplazamiento de ${sgn(DG)} m en ${fmt(T)} s. En la cinta, de ${fmt(C0)} m a ${fmt(C1)} m: ${sgn(DC)} m${sameInk ? ', todas las marcas en el mismo lugar' : ''}. Fue un solo viaje: las dos descripciones son correctas, cada una respecto de su regla.${sum}${sign}`;
      } else if (sum && !this.has('registro-caminando')) {
        id = 'registro-caminando'; title = 'Caminando sobre el carro';
        // what shows most: marks that stayed in one place on the kerb (walking against the car at its speed)
        const stay = e.marks.reduce((best, m, i) => Math.max(best, e.marks.filter((o, j) => j >= i && Math.abs(o.g - m.g) < 0.05).length), 0);
        const still = stay >= 3 ? ` Durante ${fmt((stay - 1) * 0.5)} s ${stay} marcas de tiza quedaron en el mismo lugar del cordón: respecto del andén no te movías, mientras en la cinta avanzabas 0,75 m cada 0,5 s. Caminabas tan rápido como el carro, al revés.` : '';
        body = `Esta vez caminaste sobre el carro mientras andaba. Respecto del carro te desplazaste ${sgn(DC)} m; el carro, ${sgn(DK)} m; y respecto del andén, ${sgn(DG)} m.${still}${sum}${sign}`;
      } else if (sign && !this.has('registro-oeste')) {
        id = 'registro-oeste'; title = 'Hacia el oeste';
        body = `En el cordón pasaste de ${fmt(G0)} m a ${fmt(G1)} m, un desplazamiento de ${sgn(DG)} m.${sign}`;
      }
      if (id) { if (sum) this.flags.sumSaid = true; if (sign) this.flags.signSaid = true; this.add(id, title, body, data); }
      // the latest recorded trip, always: its table and what the two observers said (D24); quiet when the
      // trip already got its own note (its title is the one to show)
      const d = describeTrip(e.marks, half);
      this.put('registro-tabla', 'El último viaje registrado, en tabla',
        `Lo que dijo el chico de la vereda de enfrente: «${d.anden.join(' ')}» Lo que dijo la pasajera: «${d.carro.join(' ')}» Los dos tienen razón: cada uno describe el viaje respecto de su lugar (la vereda y el andén son el mismo suelo). En cada fila de la tabla, la lectura del cordón es dónde está el cero del carro más la lectura de la cinta.`,
        { table: tripTable(e.marks, half) }, { quiet: !!id });
    }
    // (after the trip's own note) Readings from the explorer's jalón (a third zero): positions change with the zero, displacements do not.
    if (e.type === 'record-done' && !e.aborted && e.jal && e.marks.length >= 2 && e.marks[0].j !== undefined) {
      // (from the same shown readings: from the jalón = kerb − its reading on the kerb, or tape − its reading on the tape)
      const L = lecturas(e.marks, e.half ?? 1.8), at = rnd(e.jal.at), car = e.jal.frame === 'carro';
      const J0 = rnd((car ? L[0].C : L[0].G) - at), J1 = rnd((car ? L.at(-1).C : L.at(-1).G) - at), DJ = rnd(J1 - J0), DG = rnd(L.at(-1).G - L[0].G), DC = rnd(L.at(-1).C - L[0].C);
      if (e.jal.frame === 'anden' && !this.has('jalon-anden')) this.add('jalon-anden', 'Un cero que elegiste',
        `Tu jalón estaba clavado en el andén, en ${fmt(rnd(e.jal.at))} m del cordón. Desde él pasaste de ${sgn(J0)} m a ${sgn(J1)} m: ${sgn(DJ)} m. En el cordón, el desplazamiento fue ${sgn(DG)} m: el mismo. Las posiciones son otras porque el cero está en otro lugar; el desplazamiento no depende de dónde pongas el cero.`, { J0, J1, DJ, DG });
      if (e.jal.frame === 'carro' && !this.has('jalon-carro')) this.add('jalon-carro', 'Un cero que viaja',
        `Tu jalón estaba clavado en el carro, en ${fmt(rnd(e.jal.at))} m de la cinta. Desde él pasaste de ${sgn(J0)} m a ${sgn(J1)} m: ${sgn(DJ)} m, el mismo desplazamiento que en la cinta (${sgn(DC)} m), no el del cordón (${sgn(DG)} m). El jalón viajaba con el carro: medir desde él es medir respecto del carro.`, { J0, J1, DJ, DC, DG });
    }
    if (e.type === 'city-seen' && !this.has('arco')) this.add('arco', 'El arco tapiado',
      'Desde el Mirador se ve una ciudad, lejos, detrás del paisaje. En la Terraza, el muro del fondo tiene un arco tapiado con una palanca de latón: entre sus piedras pasa luz.');
    if (e.type === 'impact' && !this.has('caida')) {
      const tr = w.traces.find(t => t.source === 'A' && t.body === e.body);
      if (tr && tr.marks.length >= 3) {
        const t0 = tr.startStep * DT;
        const tFall = e.t - t0;
        const h = tr.marks[0].y - e.y;
        const before = tr.marks.filter(m => m.t < tFall - 0.02);
        const a = fitAcceleration(before);
        this.flags.aA = a; this.flags.hA = tr.marks[0].y;
        this.add('caida', 'Una caída conocida',
          `Desde el soporte de la orilla la esfera bajó ${fmt(h, 2)} m en ${fmt(tFall, 2)} s. Entre marca y marca pasa siempre el mismo tiempo, 0,1 s, y la distancia entre ellas crece: cada décima de segundo va más rápido que la anterior.` +
          (this.flags.aC != null && a != null ? ` Detrás del muro, en la plaza, el soporte igual había medido ${fmt(Math.abs(this.flags.aC), 1)} m/s²; acá, ${fmt(Math.abs(a), 1)} m/s²: ${Math.abs(Math.abs(a) - Math.abs(this.flags.aC)) < 0.3 ? 'la misma caída' : 'no es la misma'}.` : ''),
          { h, tFall, a });
      }
    }
    if (e.type === 'impact' && !this.has('plaza')) {
      const tr = w.traces.find(t => t.source === 'C' && t.body === e.body);
      if (tr && tr.marks.length >= 3) {
        const tFall = e.t - tr.startStep * DT, h = tr.marks[0].y - e.y;
        const a = fitAcceleration(tr.marks.filter(m => m.t < tFall - 0.02));
        this.flags.aC = a;
        // Only what was measured: the comparison needs both falls (the Orilla's note adds it if
        // support A is released afterwards).
        const vs = a == null ? '' : this.flags.aA != null
          ? ` En la Orilla, el soporte igual había medido ${fmt(Math.abs(this.flags.aA), 1)} m/s²: ${Math.abs(Math.abs(a) - Math.abs(this.flags.aA)) < 0.3 ? 'la misma caída, de los dos lados del muro' : 'no es la misma'}.`
          : ' Para compararla falta soltar el soporte igual de la Orilla.';
        const acc = a == null ? '' : `, acelerando ${fmt(Math.abs(a), 1)} m/s² hacia abajo`;
        // The title claims the sameness only once both falls are measured.
        this.add('plaza', this.flags.aA != null && a != null ? 'La misma caída, detrás del muro' : 'Una caída detrás del muro',
          `En la plaza, desde un soporte igual al de la Orilla, la esfera bajó ${fmt(h, 2)} m en ${fmt(tFall, 2)} s${acc}.${vs}`, { h, tFall, a });
      }
    }
    if (e.type === 'exit' && e.zone === 'cascada' && !this.has('subida')) {
      const tr = w.traces.find(t => t.source === 'B' && t.body === e.body && !t.done);
      if (tr && tr.marks.length >= 4) this.flags.pendingB = tr.id;
    }
    if (e.type === 'enter' && e.zone === 'cascada' && this.flags.pendingB && !this.has('subida')) {
      const tr = w.traces.find(t => t.id === this.flags.pendingB);
      if (tr && tr.body === e.body) {
        // Back inside: the trace now holds the whole excursion. Fit only the stretch before the
        // measured acceleration changed — read from the marks, not from the configuration.
        const yb = boundaryFromMarks(tr.marks);
        this.flags.aB = fitAcceleration(firstRise(tr.marks, yb));
        this.flags.yB = yb;
        const h0 = tr.marks[0].y, peak = Math.max(...tr.marks.map(m => m.y));
        const hA = this.flags.hA;
        const same = hA != null && Math.abs(hA - h0) < 0.01;
        this.add('subida', 'Soltada, subió',
          `Desde el soporte del borde, a ${fmt(h0, 1)} m${same ? ', la misma altura que en la orilla,' : ''} la esfera no cayó: sin que nadie la empujara salió hacia arriba y cada marca quedó más lejos de la anterior.${yb != null ? ` Cerca de ${fmt(yb, 1)} m dejó de acelerar hacia arriba` : ' Más arriba dejó de acelerar hacia arriba'}, frenó, llegó a ${fmt(peak, 2)} m y volvió a bajar.`,
          { h0, peak, yb, a: this.flags.aB });
      }
    }
    if (e.type === 'letgo') this.flags.letGo = e.y - w.avatar.hh;
    if (e.type === 'release' && e.stand === 'B') {
      const st = w.stands.find(s => s.id === 'B');
      if (this.flags.bFrom != null && !this.flags.bRang) (this.flags.bSilent ||= []).push(this.flags.bFrom);
      this.flags.bFrom = st.clampY; this.flags.bRang = false;
    }
    if (e.type === 'bell') this.flags.bRang = true;
    if (e.type === 'bell' && !this.has('campana') && this.flags.bFrom != null) {
      const silent = (this.flags.bSilent || []).filter(y => y > this.flags.bFrom);
      const before = silent.length ? ` Antes, desde ${fmt(Math.min(...silent), 1)} m, no había llegado.` : '';
      this.add('campana', 'La campana de la Terraza',
        `Soltada desde ${fmt(this.flags.bFrom, 1)} m, la esfera llegó a la campana, cuya línea pintada en la pared está a ${fmt(w.level.bellLine, 1)} m. No hubo que empujarla.${before}`,
        { from: this.flags.bFrom, silent });
    }
    if (e.type === 'apex' && e.body === w.avatar.id && e.x > 0 && e.x < 4.7 && e.centre > 2.5) {
      (this.flags.attempts ||= []).push({ from: e.from, apex: e.centre });
      const line = w.level.bellLine;
      if (!this.has('corto') && !this.has('cruce') && e.centre < line - 0.05) this.add('corto', 'No alcanzó',
        `Tu hebilla llegó a ${fmt(e.centre, 2)} m; la línea de la campana, en la pared, está a ${fmt(line, 1)} m. La tiza queda en la pared con el lugar desde donde empezaste. Algo se puede cambiar antes de entrar.`,
        { apex: e.centre, line });
    }
    // El Pozo: every attempt from its chain, measured, and how it ended.
    if (e.type === 'letgo' && e.chain === 'pozo') this.flags.wellTry = { from: e.y, apex: null };
    if (e.type === 'grab' && this.flags.wellTry) this.closeWellTry('cadena');
    if (e.type === 'footing' && this.flags.wellTry) this.closeWellTry('rescate');
    if (e.type === 'enter' && e.body === w.avatar.id && e.zone === 'cascada') { this.flags.climbFrom = w.avatar.y - w.avatar.hh; this.flags.climbTop = -Infinity; }
    if (e.type === 'exit' && e.body === w.avatar.id && e.zone === 'cascada') this.flags.wasInside = true;
  }

  update(dt) {
    // Behind the wall, once: the neighbourhood, and the water that falls as on the Orilla.
    if (this.world.avatar.z < -9.2 && !this.has('barrio')) this.add('barrio', 'Detrás del muro',
      (() => {
        // The fountain's central jet leaves at the spring's speed; here it rises only v²/2g.
        const v = this.world.level.spring?.vy ?? 2.95, g = Math.abs(this.world.field.at(FUENTE.x, TERRACE_Y + 2, { x: 0, y: 0 }, FUENTE.z).y);
        return `El arco llevaba a un barrio de la ciudad. El chorro del centro de la fuente sale hacia arriba a ${fmt(v, 2)} m/s, la misma velocidad vertical que la surgencia de la sima: allá la región lo sigue empujando y el agua sube hasta crestar sobre la Terraza; acá sube ${fmt(v * v / (2 * g), 2)} m y vuelve a caer. Detrás del muro no hay ninguna región.`;
      })());
    const w = this.world, av = w.avatar;
    if (this.flags.climbFrom != null && !this.has('cruce') && !av.heldBy) this.flags.climbTop = Math.max(this.flags.climbTop ?? -Infinity, av.y - av.hh);
    if (!this.has('profundidad')) {
      // Two releases of B from different heights, each with its own peak, read from the traces.
      const runs = new Map();
      for (const t of w.traces) if (t.source === 'B' && t.done && t.marks.length > 4) runs.set(+t.marks[0].y.toFixed(2), Math.max(...t.marks.map(m => m.y)));
      if (runs.size >= 2) {
        const list = [...runs].sort((a, b) => b[0] - a[0]);
        const lines = list.map(([y0, pk]) => `desde ${fmt(y0, 1)} m llegó a ${fmt(pk, 2)} m`).join('; ');
        this.add('profundidad', 'Más abajo, más alto', `Soltada desde distintas alturas en el soporte del borde: ${lines}. Cuanto más abajo empieza, más alto termina: adentro gana velocidad en cada metro que sube.`, { runs: list });
      }
    }
    const terraceY = w.solids.find(s => s.id === 'terraza').y1;
    if (!this.has('cruce') && this.flags.wasInside && av.x > 4.7 && av.supportSteps > 20 && Math.abs(av.y - av.hh - terraceY) < 0.05) {
      const at = this.flags.attempts || [], last = at[at.length - 1];
      const prev = at.slice(0, -1).filter(a => (a.from ?? 0.55) !== (last?.from ?? 0.55)).pop();
      const where = v => v == null ? 'desde el borde' : `soltándote con la hebilla a ${fmt(v, 1)} m`;
      let body = last ? `Esta vez, ${where(last.from)}, tu hebilla llegó a ${fmt(last.apex, 2)} m y alcanzaste el borde de la Terraza.` : 'Llegaste a la Terraza.';
      if (last && prev) body += ` Antes, ${where(prev.from)}, había llegado a ${fmt(prev.apex, 2)} m.${(prev.from ?? 0.55) > (last.from ?? 0.55) && prev.apex < last.apex ? ' Empezar más abajo dentro de la región te llevó más alto, como al agua que sube desde el fondo.' : ''}`;
      this.add('cruce', 'El cruce', body, { last, prev });
    }
    if (!this.has('medida') && this.has('caida') && this.has('subida') && this.flags.aA != null && this.flags.aB != null) {
      this.add('medida', 'Dos condiciones, dos aceleraciones',
        `Con las marcas de tus dos experimentos: afuera, la velocidad de la esfera cambió ${fmt(Math.abs(this.flags.aA), 1)} m/s por segundo, hacia abajo. Adentro de la región, ${fmt(Math.abs(this.flags.aB), 1)} m/s por segundo, hacia arriba. No cambia la esfera: cambia el lugar.`,
        { aA: this.flags.aA, aB: this.flags.aB, formula: 'y = y₀ + ½·a·t²' });
    }
    const wt = this.flags.wellTry;
    // Highest point of the attempt, measured from the explorer's own trajectory (also when the
    // edge grab ends the flight before an apex event).
    if (wt && !av.heldBy && av.supportSteps === 0) wt.apex = Math.max(wt.apex ?? -Infinity, av.y);
    if (wt && av.supportSteps > 20) this.closeWellTry(av.support?.solid?.id);
    if (this.toastT > 0) { this.toastT -= dt; if (this.toastT <= 0) this.toastEl.hidden = true; }
    // Keep the last firm footing saved so a reload resumes where the explorer stood.
    const ls = av.lastSupport;
    if (ls && (!this.footing || Math.abs(ls.x - this.footing.x) > 0.5 || Math.abs(ls.y - this.footing.y) > 0.1)) { this.footing = { ...ls }; this.save(); }
  }

  /** Classify a Pozo attempt by its cause, with numbers taken from the attempt itself. */
  closeWellTry(on) {
    const w = this.world, wt = this.flags.wellTry, line = w.level.miradorLine;
    this.flags.wellTry = null;
    const rose = wt.apex != null && wt.apex > wt.from + 0.05;
    let outcome;
    if (on === 'mirador') outcome = 'mirador';
    else if (on === 'pozo-fondo') outcome = rose ? 'corto' : (wt.from > w.chains.find(c => c.id === 'pozo').stopY + 0.05 ? 'cae' : 'agua');
    else outcome = rose && wt.apex >= line ? 'direccion' : 'corto';
    (this.flags.wellTries ||= []).push({ ...wt, outcome });
    const where = v => `con la hebilla a ${fmt(v, 1)} m`;
    if (outcome === 'cae' && !this.has('pozo-cae')) this.add('pozo-cae', 'Más abajo, nada',
      `Te soltaste ${where(wt.from)} y en lugar de subir caíste al agua: ahí la región del pozo ya no levantaba. Más abajo no siempre es más alto: hay que estar adentro.`, { ...wt });
    if (outcome === 'corto' && !this.has('pozo-corto')) this.add('pozo-corto', 'Corto en el pozo',
      `Te soltaste ${where(wt.from)}; tu hebilla llegó a ${fmt(wt.apex, 2)} m. La línea del Mirador está a ${fmt(line, 2)} m.`, { ...wt });
    if (outcome === 'direccion' && !this.has('pozo-direccion')) this.add('pozo-direccion', 'Alto, pero lejos',
      `Te soltaste ${where(wt.from)} y tu hebilla pasó la línea del Mirador (${fmt(wt.apex, 2)} m), pero no fuiste hacia él a tiempo.`, { ...wt });
    if (outcome === 'mirador' && !this.has('mirador')) {
      const tries = this.flags.wellTries.slice(0, -1);
      const uniq = list => [...new Set(list.map(t => fmt(t.from, 1)))];
      const fell = uniq(tries.filter(t => t.outcome === 'cae')), short = uniq(tries.filter(t => t.outcome === 'corto'));
      let body = `Te soltaste ${where(wt.from)} y llegaste al Mirador: tu hebilla subió hasta ${fmt(wt.apex, 2)} m, sobre su línea de ${fmt(line, 2)} m.`;
      if (fell.length) body += ` Desde ${fell.join(' y ')} m caíste: ahí la región del pozo ya no levantaba.`;
      if (short.length) body += ` Desde ${short.join(' y ')} m no alcanzaste.`;
      if (fell.length && short.length) body += ' La respuesta estaba en el medio: lo bastante abajo para subir alto, pero adentro de la región.';
      this.add('mirador', 'El Mirador', body, { tries: this.flags.wellTries });
    }
  }

  render() {
    const table = rows => `<table class="tabla"><tr><th>t (s)</th><th>cordón (m)</th><th>=</th><th>dónde está el 0 del carro (m)</th><th>+</th><th>cinta (m)</th></tr>${rows.map(r => `<tr><td>${fmt(r.t)}</td><td>${fmt(r.g)}</td><td>=</td><td>${fmt(r.z)}</td><td>+</td><td>${fmt(r.c)}</td></tr>`).join('')}</table>`;
    const notes = this.notes.map(n => `<article><h3>${n.title}</h3><p>${n.body}</p>${n.data?.table ? table(n.data.table) : ''}${n.data?.formula ? `<p class="formal">Si querés escribirlo: <code>${n.data.formula}</code>, con <i>a</i> distinta en cada lugar.</p>` : ''}</article>`).join('');
    this.panel.innerHTML = `<header><img class="portrait" alt="" src="${import.meta.env?.BASE_URL ?? './'}textures/explorer-portrait.png"><b>Bitácora</b><span>Physica · La cascada ascendente</span><button data-close aria-label="Cerrar">✕</button></header>
      ${notes || '<p class="empty">Todavía no anotaste nada. Las notas aparecen cuando algo pasa delante tuyo.</p>'}`;
    this.panel.querySelector('[data-close]').onclick = () => this.toggle();
  }
}
