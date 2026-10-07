// La Bitácora formalises after the experience. Every number in a note is read from the
// experiment that just happened (its trace marks and contact events), never written ahead.
// Notes never block play and nothing asks the player to answer anything.
import { DT } from './sim/world.js';
import { FUENTE, TERRACE_Y } from './sim/levels/cascada.js';

const KEY = 'physica.v2';   // v1 saved positions belong to the earlier geometry
const fmt = (v, d = 1) => v.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
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

  add(id, title, body, data = null) {
    if (this.has(id)) return;
    this.notes.push({ id, title, body, data, at: Date.now() });
    this.save(); this.render(); this.onAdd?.(id);
    this.toastEl.innerHTML = `<b>Bitácora</b> · ${title} <kbd>J</kbd>`; this.toastEl.hidden = false; this.toastT = 5;
  }

  toggle() { this.open = !this.open; this.panel.hidden = !this.open; if (this.open) { this.toastEl.hidden = true; this.render(); } }

  onEvent(e) {
    const w = this.world;
    // The car's recorder (D22): two records of one trip, written with that trip's numbers. A note is
    // composed per trip: the first one says what the two records are; the sum (walking on the car) and
    // the sign (westward) are explained the first time they appear, in whichever note that is.
    if (e.type === 'record-done' && !e.aborted && e.marks.length >= 2) {
      const m0 = e.marks[0], m1 = e.marks.at(-1), T = m1.t - m0.t, n = e.marks.length;
      // (rounded as shown, from the rounded readings: the sum adds up and so do the readings)
      const r1 = v => Math.round(v * 10) / 10, G0 = r1(m0.g), G1 = r1(m1.g), C0 = r1(m0.c), DG = r1(G1 - G0), DK = r1(m1.k - m0.k), DC = r1(DG - DK), C1 = r1(C0 + DC);
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
        body = `En el cordón pasaste de ${fmt(m0.g)} m a ${fmt(m1.g)} m, un desplazamiento de ${sgn(DG)} m.${sign}`;
      }
      if (id) { if (sum) this.flags.sumSaid = true; if (sign) this.flags.signSaid = true; this.add(id, title, body, data); }
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
    const notes = this.notes.map(n => `<article><h3>${n.title}</h3><p>${n.body}</p>${n.data?.formula ? `<p class="formal">Si querés escribirlo: <code>${n.data.formula}</code>, con <i>a</i> distinta en cada lugar.</p>` : ''}</article>`).join('');
    this.panel.innerHTML = `<header><img class="portrait" alt="" src="${import.meta.env?.BASE_URL ?? './'}textures/explorer-portrait.png"><b>Bitácora</b><span>Physica · La cascada ascendente</span><button data-close aria-label="Cerrar">✕</button></header>
      ${notes || '<p class="empty">Todavía no anotaste nada. Las notas aparecen cuando algo pasa delante tuyo.</p>'}`;
    this.panel.querySelector('[data-close]').onclick = () => this.toggle();
  }
}
