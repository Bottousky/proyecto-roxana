// Interfaz en el DOM: texto, elecciones, objetos tocables accesibles, pausa y opciones.
// La escena se dibuja en canvas; todo lo que se lee o se toca también existe aquí.

const SPEED = {slow: 26, normal: 44, fast: 95, instant: Infinity};
const $ = (sel, root = document) => root.querySelector(sel);

export class UI {
  constructor(game) {
    this.game = game;
    this.caption$ = $('#caption');
    this.who$ = $('#caption .who');
    this.line$ = $('#caption .line');
    this.choices$ = $('#choices');
    this.spots$ = $('#spots');
    this.describe$ = $('#describe');
    this.sr$ = $('#sr-live');
    this.hint$ = $('#hint-btn');
    this.skip$ = $('#skip-btn');
    this.toast$ = $('#toast');
    this.pause$ = $('#pause');
    this.spotEls = new Map();
    this.spots = [];
    this.waiting = null;
    this.typing = null;
    this.choiceResolve = null;
    this.describeTimer = 0;
    this.interactive = false;
    this.#bind();
  }

  get settings() {
    return this.game.settings;
  }

  #bind() {
    this.caption$.addEventListener('click', e => {
      e.stopPropagation();
      this.advance();
    });
    $('#board').addEventListener('click', () => {
      if (this.waiting) this.advance();
    });
    document.addEventListener('keydown', e => {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        this.game.togglePause();
        return;
      }
      if (!this.pause$.hidden) return;
      const onControl = e.target instanceof HTMLElement && e.target.closest('button, input, select, a');
      if ((e.key === 'Enter' || e.key === ' ') && this.waiting && !onControl) {
        e.preventDefault();
        this.advance();
      }
    });
    this.hint$.addEventListener('click', () => this.game.requestHint());
    this.skip$.addEventListener('click', () => this.game.director.setSkipping(true));
    $('#menu-btn').addEventListener('click', () => this.game.togglePause());
    // pestañas de la pausa
    for (const tab of this.pause$.querySelectorAll('[role=tab]')) {
      tab.addEventListener('click', () => this.showTab(tab.dataset.tab));
    }
    this.pause$.addEventListener('click', e => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'resume') this.game.togglePause(false);
      if (act === 'title') this.game.toTitle();
      if (act === 'restart-seg') this.game.restartSegment();
      const moment = e.target.closest('[data-moment]')?.dataset.moment;
      if (moment) this.game.replayMoment(moment);
    });
    for (const el of this.pause$.querySelectorAll('[data-opt]')) {
      el.addEventListener('input', () => this.#readOption(el));
      el.addEventListener('change', () => this.#readOption(el));
    }
  }

  #readOption(el) {
    const key = el.dataset.opt;
    let v;
    if (el.type === 'checkbox') v = el.checked;
    else if (el.type === 'range') v = Number(el.value);
    else v = el.value;
    this.game.setSetting(key, v);
  }

  syncOptions() {
    for (const el of this.pause$.querySelectorAll('[data-opt]')) {
      const key = el.dataset.opt;
      let v = this.settings[key];
      if (key === 'reducedMotion') v = this.game.reducedMotion;
      if (el.type === 'checkbox') el.checked = !!v;
      else el.value = String(v);
    }
  }

  applySettings() {
    const s = this.settings;
    document.body.classList.toggle('clean', !!s.clean);
    document.documentElement.style.setProperty('--scale', String(s.textScale));
  }

  // ——— Texto ———

  caption(who, text) {
    this.#closeWaiting();
    this.noteToken = null;
    const thought = who === null;
    this.who$.textContent = who === 'punto' ? 'Punto' : who && who !== 'student' ? who : '';
    this.line$.classList.toggle('thought', thought);
    const shown = who === 'student' ? `—${text}` : text;
    this.caption$.hidden = false;
    this.caption$.classList.remove('done');
    document.body.classList.add('captioning');
    this.sr$.textContent = (who === 'punto' ? 'Punto: ' : '') + shown;
    const cps = SPEED[this.settings.textSpeed] ?? 44;
    return new Promise(resolve => {
      this.waiting = {resolve};
      if (!isFinite(cps) || this.game.director.skipping) {
        this.line$.textContent = shown;
        this.#typed(shown);
        return;
      }
      let shownChars = 0;
      this.line$.textContent = '';
      const start = performance.now();
      const step = () => {
        if (!this.typing) return;
        if (this.game.paused) {
          this.typing.raf = requestAnimationFrame(step);
          return;
        }
        const n = Math.min(shown.length, Math.floor(((performance.now() - start) / 1000) * cps) + 1);
        if (n !== shownChars) {
          shownChars = n;
          this.line$.textContent = shown.slice(0, n);
        }
        if (n >= shown.length) {
          this.typing = null;
          this.#typed(shown);
        } else this.typing.raf = requestAnimationFrame(step);
      };
      this.typing = {full: shown, raf: requestAnimationFrame(step)};
    });
  }

  #typed(shown) {
    this.caption$.classList.add('done');
    if (this.settings.autoAdvance && this.waiting) {
      const w = this.waiting;
      const ms = Math.max(1700, 900 + shown.length * 55);
      const arm = () => {
        w.timer = setTimeout(() => {
          if (this.waiting !== w) return;
          if (this.game.paused) arm();
          else this.advance();
        }, ms);
      };
      arm();
    }
  }

  finishTyping() {
    if (this.typing) {
      cancelAnimationFrame(this.typing.raf);
      this.line$.textContent = this.typing.full;
      const full = this.typing.full;
      this.typing = null;
      this.#typed(full);
      return true;
    }
    return false;
  }

  advance() {
    if (this.game.paused) return;
    if (!this.waiting && !this.typing && !this.caption$.hidden && this.noteToken) {
      this.noteToken = null;
      this.hideCaption();
      return;
    }
    if (this.finishTyping()) return;
    if (!this.waiting) return;
    const w = this.waiting;
    this.waiting = null;
    clearTimeout(w.timer);
    this.game.audio.tap(0.12, 1.6);
    w.resolve();
  }

  #closeWaiting() {
    if (this.typing) cancelAnimationFrame(this.typing.raf);
    this.typing = null;
    if (this.waiting) clearTimeout(this.waiting.timer);
  }

  hideCaption() {
    this.#closeWaiting();
    this.waiting = null;
    this.caption$.hidden = true;
    document.body.classList.remove('captioning');
  }

  /** Pensamiento breve que no espera al jugador: se va solo. */
  note(who, text) {
    this.#closeWaiting();
    this.waiting = null;
    const shown = who === 'student' ? `—${text}` : text;
    this.who$.textContent = who === 'punto' ? 'Punto' : '';
    this.line$.classList.toggle('thought', who === null);
    this.line$.textContent = shown;
    this.caption$.hidden = false;
    this.caption$.classList.remove('done');
    document.body.classList.add('captioning');
    this.sr$.textContent = shown;
    clearTimeout(this.noteTimer);
    const token = {};
    this.noteToken = token;
    this.noteTimer = setTimeout(() => {
      if (this.noteToken === token && !this.waiting) this.hideCaption();
    }, Math.max(3200, 1400 + shown.length * 60));
  }

  describe(text) {
    this.sr$.textContent = text;
    if (!this.settings.describe) return;
    this.describe$.textContent = text;
    this.describe$.hidden = false;
    clearTimeout(this.describeTimer);
    this.describeTimer = setTimeout(() => { this.describe$.hidden = true; }, Math.max(3500, text.length * 70));
  }

  // ——— Elecciones ———

  choose(options, {prompt} = {}) {
    this.hideCaption();
    const box = this.choices$;
    box.replaceChildren();
    if (prompt) {
      const p = document.createElement('p');
      p.className = 'prompt';
      p.textContent = prompt;
      box.append(p);
    }
    box.setAttribute('aria-label', prompt || 'Elegí');
    return new Promise(resolve => {
      this.choiceResolve = resolve;
      for (const o of options) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = o.text;
        b.dataset.id = o.id;
        b.addEventListener('click', e => {
          e.stopPropagation();
          box.hidden = true;
          box.replaceChildren();
          this.choiceResolve = null;
          this.game.audio.tap(0.3, 1.2);
          resolve(o.id);
        });
        box.append(b);
      }
      box.hidden = false;
      box.querySelector('button')?.focus({preventScroll: true});
    });
  }

  // ——— Objetos tocables ———

  setInteractive(on) {
    this.interactive = on;
    if (on) this.hideCaption();
  }

  /** Lista de {id, label, kind, rect(), text?, selected?, disabled?, onActivate, onHover?} */
  setSpots(list) {
    this.spots = list;
    const keep = new Set(list.map(s => s.id));
    for (const [id, el] of this.spotEls) {
      if (!keep.has(id)) {
        el.remove();
        this.spotEls.delete(id);
      }
    }
    list.forEach((s, i) => {
      let el = this.spotEls.get(s.id);
      if (!el) {
        el = document.createElement('button');
        el.type = 'button';
        el.addEventListener('click', e => {
          e.stopPropagation();
          const spot = this.spots.find(x => x.id === el.dataset.id);
          if (!spot || spot.disabled || this.game.paused) return;
          spot.onActivate?.(spot.id);
        });
        el.addEventListener('pointerenter', () => this.spots.find(x => x.id === el.dataset.id)?.onHover?.(true));
        el.addEventListener('pointerleave', () => this.spots.find(x => x.id === el.dataset.id)?.onHover?.(false));
        el.addEventListener('focus', () => this.spots.find(x => x.id === el.dataset.id)?.onHover?.(true));
        el.addEventListener('blur', () => this.spots.find(x => x.id === el.dataset.id)?.onHover?.(false));
        el.dataset.id = s.id;
        this.spotEls.set(s.id, el);
      }
      el.className = `spot ${s.kind || 'dot'}${s.selected ? ' selected' : ''}`;
      el.setAttribute('aria-label', s.label);
      if (s.kind === 'word') el.textContent = s.text || s.label;
      else el.textContent = '';
      el.setAttribute('aria-pressed', s.selected ? 'true' : 'false');
      el.setAttribute('aria-disabled', s.disabled ? 'true' : 'false');
      // orden de tabulación = orden de la lista
      if (this.spots$.children[i] !== el) this.spots$.insertBefore(el, this.spots$.children[i] || null);
    });
  }

  positionSpots(view, cam) {
    for (const s of this.spots) {
      const el = this.spotEls.get(s.id);
      if (!el) continue;
      const r = s.rect();
      const [x0, y0] = cam.toScreen(view, r.x, r.y);
      const [x1, y1] = cam.toScreen(view, r.x + r.w, r.y + r.h);
      // guarda: algo tocable fuera de cuadro es un bloqueo para quien juega
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const out = cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight;
      const now = performance.now();
      if (out && !cam.moving) {
        el.dataset.outSince ??= String(now);
        if (!el.dataset.warned && now - Number(el.dataset.outSince) > 1500) {
          el.dataset.warned = '1';
          console.error(`[spot fuera de cuadro] ${s.id} (${Math.round(cx)}, ${Math.round(cy)})`);
        }
      } else {
        delete el.dataset.outSince;
        delete el.dataset.warned;
      }
      el.style.left = `${(x0 + x1) / 2}px`;
      el.style.top = `${(y0 + y1) / 2}px`;
      if (s.kind !== 'word') {
        el.style.width = `${Math.max(44, x1 - x0)}px`;
        el.style.height = `${Math.max(44, y1 - y0)}px`;
      }
    }
  }

  setHint(available, fresh = false) {
    this.hint$.hidden = !available;
    this.hint$.classList.toggle('fresh', fresh);
  }

  setSkippable(on) {
    this.skip$.hidden = !on;
  }

  toast(text, ms = 1800) {
    this.toast$.textContent = text;
    this.toast$.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast$.hidden = true; }, ms);
  }

  reset() {
    this.hideCaption();
    if (this.choiceResolve) this.choiceResolve = null;
    this.choices$.hidden = true;
    this.choices$.replaceChildren();
    this.setSpots([]);
    this.setHint(false);
    this.setSkippable(false);
    this.describe$.hidden = true;
  }

  // ——— Pausa ———

  showPause(on) {
    this.pause$.hidden = !on;
    const playing = this.game.mode === 'play';
    for (const act of ['restart-seg', 'title']) this.pause$.querySelector(`[data-act=${act}]`).hidden = !playing;
    if (on) {
      this.syncOptions();
      this.renderJournal();
      this.renderMoments();
      this.renderHistory();
      $('.where', this.pause$).textContent = this.game.whereText();
      this.showTab('menu');
      this.pause$.querySelector('[data-act=resume]')?.focus({preventScroll: true});
    } else {
      $('#menu-btn').focus({preventScroll: true});
    }
  }

  showTab(name) {
    for (const t of this.pause$.querySelectorAll('[role=tab]')) t.setAttribute('aria-selected', String(t.dataset.tab === name));
    for (const p of this.pause$.querySelectorAll('.panel')) p.hidden = p.dataset.panel !== name;
  }

  renderHistory() {
    const ol = $('.history', this.pause$);
    ol.replaceChildren();
    for (const l of this.game.state.log.slice(-60)) {
      const li = document.createElement('li');
      if (l.who === 'punto') {
        const w = document.createElement('span');
        w.className = 'who';
        w.textContent = 'Punto ';
        li.append(w);
      }
      const t = document.createElement('span');
      t.textContent = l.who === 'student' ? `—${l.text}` : l.text;
      if (l.who === null) t.className = 'thought';
      li.append(t);
      ol.append(li);
    }
    if (!ol.children.length) ol.innerHTML = '<li>Todavía no se dijo nada.</li>';
  }

  renderJournal() {
    const panel = $('[data-panel=journal]', this.pause$);
    panel.replaceChildren();
    const entries = this.game.state.journal;
    if (!entries.length) {
      const p = document.createElement('p');
      p.textContent = 'La Bitácora todavía está en blanco. Lo que entiendas acá quedará anotado con tus propias pruebas.';
      panel.append(p);
      return;
    }
    for (const e of entries) {
      const div = document.createElement('article');
      div.className = 'entry';
      const h = document.createElement('h3');
      h.textContent = e.title;
      const abbr = document.createElement('p');
      abbr.className = 'abbr';
      abbr.textContent = e.abbr;
      div.append(h, abbr);
      for (const line of e.body || []) {
        const p = document.createElement('p');
        p.textContent = line;
        div.append(p);
      }
      if (e.seen?.length) {
        const ul = document.createElement('ul');
        ul.className = 'seen';
        for (const s of e.seen) {
          const li = document.createElement('li');
          li.textContent = s;
          ul.append(li);
        }
        div.append(ul);
      }
      if (e.moment) {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.moment = e.moment;
        b.textContent = 'Desplegar: volver a ver por qué';
        div.append(b);
      }
      panel.append(div);
    }
  }

  renderMoments() {
    const panel = $('[data-panel=moments]', this.pause$);
    panel.replaceChildren();
    const list = this.game.availableMoments();
    if (!list.length) {
      panel.innerHTML = '<p>Los momentos importantes quedan acá para volver a verlos.</p>';
      return;
    }
    for (const m of list) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'moment';
      b.dataset.moment = m.id;
      b.textContent = m.title;
      panel.append(b);
    }
  }
}
