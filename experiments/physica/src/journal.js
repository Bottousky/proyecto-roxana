// La Bitácora formalises after the experience. Every number in a note is read from the
// experiment that just happened (its trace marks and contact events), never written ahead.
// Notes never block play and nothing asks the player to answer anything.
import { SPHERE, DT } from './sim/world.js';

const KEY = 'physica.v1';
const fmt = (v, d = 1) => v.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });

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
    try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s?.notes) { this.notes = s.notes; this.flags = s.flags || {}; } } catch { /* storage unavailable: start empty */ }
    this.render();
  }

  ids() { return this.notes.map(n => n.id); }
  has(id) { return this.notes.some(n => n.id === id); }
  save() { try { localStorage.setItem(KEY, JSON.stringify({ notes: this.notes, flags: this.flags })); } catch { /* not persisted */ } }

  add(id, title, body, data = null) {
    if (this.has(id)) return;
    this.notes.push({ id, title, body, data, at: Date.now() });
    this.save(); this.render();
    this.toastEl.innerHTML = `<b>Bitácora</b> · ${title} <kbd>J</kbd>`; this.toastEl.hidden = false; this.toastT = 5;
  }

  toggle() { this.open = !this.open; this.panel.hidden = !this.open; if (this.open) { this.toastEl.hidden = true; this.render(); } }

  onEvent(e) {
    const w = this.world;
    if (e.type === 'impact' && !this.has('caida')) {
      const tr = w.traces.find(t => t.source === 'A' && t.body === e.body);
      if (tr && tr.marks.length >= 3) {
        const t0 = tr.startStep * DT;
        const tFall = e.t - t0;
        const h = tr.marks[0].y - e.y;
        const before = tr.marks.filter(m => m.t < tFall - 0.02);
        const a = fitAcceleration(before);
        this.flags.aA = a;
        this.add('caida', 'Una caída conocida',
          `Desde el soporte de la orilla la esfera bajó ${fmt(h, 2)} m en ${fmt(tFall, 2)} s. Entre marca y marca pasa siempre el mismo tiempo, 0,1 s, y la distancia entre ellas crece: cada décima de segundo va más rápido que la anterior.`,
          { h, tFall, a });
      }
    }
    if (e.type === 'exit' && e.zone === 'cascada' && !this.has('subida')) {
      const tr = w.traces.find(t => t.source === 'B' && t.body === e.body && !t.done);
      if (tr && tr.marks.length >= 4) {
        const z = w.field.zones[0], inside = tr.marks.filter(m => m.y < z.y1 - z.band / 2 - SPHERE.r);
        this.flags.aB = fitAcceleration(inside);
        this.flags.pendingB = tr.id;
      }
    }
    if (e.type === 'enter' && e.zone === 'cascada' && this.flags.pendingB && !this.has('subida')) {
      const tr = w.traces.find(t => t.id === this.flags.pendingB);
      if (tr && tr.body === e.body) {
        const h0 = tr.marks[0].y, peak = Math.max(...tr.marks.map(m => m.y));
        this.add('subida', 'Soltada, subió',
          `Desde el soporte del borde la esfera no cayó: sin que nadie la empujara, salió hacia arriba y cada marca quedó más lejos de la anterior. Pasó el borde de la región, a ${fmt(w.field.zones[0].y1, 1)} m, frenó, llegó a ${fmt(peak, 2)} m y volvió a entrar bajando. Adentro frena y vuelve a subir.`,
          { h0, peak, a: this.flags.aB });
      }
    }
    if (e.type === 'exit' && e.body === w.avatar.id && e.zone === 'cascada') this.flags.wasInside = true;
  }

  update(dt) {
    const w = this.world, av = w.avatar;
    if (!this.has('cruce') && this.flags.wasInside && av.x > 4.7 && av.supportSteps > 20 && Math.abs(av.y - av.hh - 3) < 0.05) {
      this.add('cruce', 'Por el camino del agua',
        `Caminaste fuera del borde y la región te levantó como al agua: subiste más de tres metros sin saltar y bajaste en la Terraza. Afuera de la región todo vuelve a caer como siempre.`);
    }
    if (!this.has('medida') && this.has('caida') && this.has('subida') && this.flags.aA != null && this.flags.aB != null) {
      this.add('medida', 'Dos condiciones, dos aceleraciones',
        `Con las marcas de tus dos experimentos: afuera, la velocidad de la esfera cambió ${fmt(Math.abs(this.flags.aA), 1)} m/s por segundo, hacia abajo. Adentro de la región, ${fmt(Math.abs(this.flags.aB), 1)} m/s por segundo, hacia arriba. No cambia la esfera: cambia el lugar.`,
        { aA: this.flags.aA, aB: this.flags.aB, formula: 'y = y₀ + ½·a·t²' });
    }
    if (this.toastT > 0) { this.toastT -= dt; if (this.toastT <= 0) this.toastEl.hidden = true; }
  }

  render() {
    const notes = this.notes.map(n => `<article><h3>${n.title}</h3><p>${n.body}</p>${n.data?.formula ? `<p class="formal">Si querés escribirlo: <code>${n.data.formula}</code>, con <i>a</i> distinta en cada lugar.</p>` : ''}</article>`).join('');
    this.panel.innerHTML = `<header><b>Bitácora</b><span>Physica · La cascada ascendente</span><button data-close aria-label="Cerrar">✕</button></header>
      ${notes || '<p class="empty">Todavía no anotaste nada. Las notas aparecen cuando algo pasa delante tuyo.</p>'}`;
    this.panel.querySelector('[data-close]').onclick = () => this.toggle();
  }
}
