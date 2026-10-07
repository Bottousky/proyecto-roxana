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
      if (this.swallowClick) { this.swallowClick = false; return; }
      if (this.waiting) this.advance();
    });
    // Tocar por cercanía: gana el objeto cuyo dibujo está más cerca del dedo, no el botón de arriba.
    const stage = $('#stage');
    stage.addEventListener('pointerdown', e => this.#pointer(e), {capture: true});
    stage.addEventListener('pointermove', e => this.#hover(e));
    this.spots$.addEventListener('keydown', e => this.#arrows(e));
    this.spots$.addEventListener('focusin', e => {
      const id = e.target?.dataset?.id;
      if (id) this.rovingId = id;
      this.#roving();
    });
    document.addEventListener('keydown', e => {
      this.trapFocus(e);
      if (e.defaultPrevented) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        this.game.togglePause();
        return;
      }
      if (!this.pause$.hidden) return;
      const onControl = e.target instanceof HTMLElement && e.target.closest('button, input, select, a');
      // con un diálogo en pantalla, Enter lo avanza aunque el foco quede en un objeto tocable
      const onSpot = e.target instanceof HTMLElement && e.target.closest('#spots');
      if ((e.key === 'Enter' || e.key === ' ') && this.waiting && (!onControl || onSpot)) {
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
      tab.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const tabs = [...this.pause$.querySelectorAll('[role=tab]')].filter(t => !t.hidden);
        const i = tabs.indexOf(tab);
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
        this.showTab(n.dataset.tab);
        n.focus();
        e.preventDefault();
      });
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

  #nearest(x, y, slop = 26) {
    let best = null, bestD = Infinity;
    for (const s of this.spots) {
      if (s.disabled) continue;
      const r = this.spotEls.get(s.id)?._r;
      if (!r) continue;
      const dx = Math.max(r.x0 - x, 0, x - r.x1), dy = Math.max(r.y0 - y, 0, y - r.y1);
      const edge = Math.hypot(dx, dy);
      if (edge > slop) continue;
      // si el dedo cae dentro de varios, decide la distancia al centro del dibujo
      const score = edge > 0 ? edge + 1000 : Math.hypot(x - r.cx, y - r.cy);
      if (score < bestD) { bestD = score; best = s; }
    }
    return best;
  }

  #pointer(e) {
    if (this.game.paused || !this.spots.length) return;
    if (e.target.closest?.('#caption, #choices, #corner, #pause, #skip-btn, #title, #fatal, .word')) return;
    const s = this.#nearest(e.clientX, e.clientY, e.pointerType === 'touch' ? 30 : 18);
    if (!s) return;
    e.preventDefault();
    e.stopPropagation();
    this.swallowClick = true;
    setTimeout(() => { this.swallowClick = false; }, 400);
    s.onActivate?.(s.id);
  }

  #hover(e) {
    const s = this.spots.length ? this.#nearest(e.clientX, e.clientY, 18) : null;
    const id = s?.id || null;
    if (id === this.hoverId) return;
    const prev = this.spots.find(x => x.id === this.hoverId);
    prev?.onHover?.(false);
    this.spotEls.get(this.hoverId)?.classList.remove('hover');
    this.hoverId = id;
    s?.onHover?.(true);
    this.spotEls.get(id)?.classList.add('hover');
  }

  /** Flechas: pasar al objeto más cercano en esa dirección. Tab sale del grupo. */
  #arrows(e) {
    const dirs = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
    const dir = dirs[e.key];
    if (!dir) return;
    const cur = this.spotEls.get(e.target?.dataset?.id)?._r;
    if (!cur) return;
    e.preventDefault();
    let best = null, bestD = Infinity;
    for (const s of this.spots) {
      const r = this.spotEls.get(s.id)?._r;
      if (!r || s.id === e.target.dataset.id) continue;
      const dx = r.cx - cur.cx, dy = r.cy - cur.cy;
      const along = dx * dir[0] + dy * dir[1];
      if (along <= 2) continue;
      const across = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]);
      const d = along + across * 2.5;
      if (d < bestD) { bestD = d; best = s; }
    }
    if (best) this.spotEls.get(best.id)?.focus({preventScroll: true});
  }

  #roving() {
    const ids = this.spots.map(s => s.id);
    if (!ids.includes(this.rovingId)) this.rovingId = ids[0];
    for (const [id, el] of this.spotEls) el.tabIndex = id === this.rovingId ? 0 : -1;
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
    this.lineToken = null;
    this.caption$.classList.remove('note');
    const thought = who === null;
    this.who$.textContent = who === 'punto' ? 'Punto' : who && who !== 'student' ? who : '';
    this.line$.classList.toggle('thought', thought);
    const shown = who === 'student' ? `—${text}` : text;
    this.caption$.hidden = false;
    this.caption$.classList.remove('done');
    document.body.classList.add('captioning');
    // el nombre de quien habla también llega al lector de pantalla (en pantalla va arriba, chico)
    this.sr$.textContent = (who === 'punto' ? 'Punto: ' : who && who !== 'student' ? `${who}: ` : '') + shown;
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
    // si no llega otra línea enseguida, el texto viejo no debe quedar sobre la acción
    const token = {};
    this.lineToken = token;
    setTimeout(() => {
      if (this.lineToken === token && !this.waiting && !this.typing && !this.noteToken) this.hideCaption();
    }, 160);
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
    // un aviso no espera respuesta: no debe quedarse con los toques dirigidos a la escena
    this.caption$.classList.add('note');
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

  choose(options, {prompt, shuffle = false} = {}) {
    this.hideCaption();
    if (shuffle) {
      options = [...options];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
    }
    this.choiceShownAt = performance.now();
    const box = this.choices$;
    box.replaceChildren();
    if (prompt) {
      const p = document.createElement('p');
      p.className = 'prompt';
      p.textContent = prompt;
      box.append(p);
    }
    box.setAttribute('aria-label', prompt || 'Elegí');
    const back = this.#peekBack();
    back.hidden = true;
    return new Promise(resolve => {
      this.choiceResolve = resolve;
      for (const o of options) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = o.text;
        b.dataset.id = o.id;
        b.addEventListener('click', e => {
          e.stopPropagation();
          // nada de elegir sin leer: ni en pausa, ni con un Enter que venía de antes
          if (this.game.paused || performance.now() - this.choiceShownAt < 450) return;
          box.hidden = true;
          back.hidden = true;
          box.replaceChildren();
          this.choiceResolve = null;
          this.game.audio.tap(0.3, 1.2);
          resolve(o.id);
        });
        box.append(b);
      }
      // en pantallas bajas las opciones tapan la pizarra: se pueden esconder un momento para mirarla (último en el orden)
      if (innerHeight < 560) {
        const peek = document.createElement('button');
        peek.type = 'button';
        peek.className = 'peek';
        peek.textContent = 'ver la pizarra';
        peek.setAttribute('aria-label', 'ver la pizarra: esconde las opciones un momento');
        peek.addEventListener('click', e => {
          e.stopPropagation();
          box.hidden = true;
          back.hidden = false;
          back.focus({preventScroll: true});
        });
        box.append(peek);
      }
      box.hidden = false;
      box.scrollTop = 0;
      setTimeout(() => { if (!box.hidden && !this.game.paused) box.querySelector('button:not(.peek)')?.focus({preventScroll: true}); }, 460);
    });
  }

  /** El botón para volver a las opciones después de mirar la pizarra (uno solo, se reusa). */
  #peekBack() {
    if (this.peekBack$) return this.peekBack$;
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'peek-back';
    b.hidden = true;
    b.textContent = 'volver a las opciones';
    b.addEventListener('click', e => {
      e.stopPropagation();
      b.hidden = true;
      this.choices$.hidden = false;
      // al volver, la misma guarda contra elegir sin leer
      this.choiceShownAt = performance.now();
      this.choices$.querySelector('button:not(.peek)')?.focus({preventScroll: true});
    });
    document.body.append(b);
    this.peekBack$ = b;
    return b;
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
    this.#roving();
    // ubicar ya los botones nuevos: si no, hasta el próximo cuadro quedan en el origen y un toque rápido cae en otro
    if (this.lastView) this.positionSpots(this.lastView, this.lastCam);
  }

  positionSpots(view, cam) {
    this.lastView = view;
    this.lastCam = cam;
    for (const s of this.spots) {
      const el = this.spotEls.get(s.id);
      if (!el) continue;
      const r = s.rect();
      const [x0, y0] = cam.toScreen(view, r.x, r.y);
      const [x1, y1] = cam.toScreen(view, r.x + r.w, r.y + r.h);
      // guarda: algo tocable fuera de cuadro es un bloqueo para quien juega
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      // fuera de cuadro o pegado al borde (menos de 56 px): difícil de ver y de tocar
      const out = cx < 56 || cy < 56 || cx > innerWidth - 56 || cy > innerHeight - 56;
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
        el._r = {x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2};
      } else {
        // el tamaño del texto se mide una vez (medir en cada cuadro forzaría el maquetado)
        if (!el._size || el._sizeText !== el.textContent) {
          el._size = [el.offsetWidth, el.offsetHeight];
          el._sizeText = el.textContent;
        }
        const cxw = (x0 + x1) / 2, cyw = (y0 + y1) / 2;
        el._r = {x0: cxw - el._size[0] / 2, y0: cyw - el._size[1] / 2, x1: cxw + el._size[0] / 2, y1: cyw + el._size[1] / 2, cx: cxw, cy: cyw};
      }
    }
    if (!cam.moving && !cam.settling && this.spots.some(x => x.kind === 'word')) this.checkOverlaps();
  }

  /** Guarda de pruebas: un botón de texto no debe tapar otro objeto tocable. */
  checkOverlaps() {
    const words = this.spots.filter(s => s.kind === 'word');
    for (const wsp of words) {
      const a = this.spotEls.get(wsp.id)?._r;
      if (!a) continue;
      for (const o of this.spots) {
        // los que deambulan pasan por debajo un momento y siguen: no cuentan como tapados
        if (o === wsp || o.disabled || o.wanders) continue;
        const b = this.spotEls.get(o.id)?._r;
        if (!b) continue;
        // un botón de texto no debe tapar el centro de otro objeto, ni montarse sobre otro botón de texto
        const covers = o.kind === 'word'
          ? Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > 4 && Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > 4 && wsp.id < o.id
          : b.cx > a.x0 && b.cx < a.x1 && b.cy > a.y0 && b.cy < a.y1;
        if (covers) {
          const key = `${wsp.id}/${o.id}`;
          this.overlapWarned ??= new Set();
          if (!this.overlapWarned.has(key)) {
            this.overlapWarned.add(key);
            console.error(`[spot tapado] "${wsp.text || wsp.id}" tapa a ${o.id}`);
          }
        }
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
    if (this.peekBack$) this.peekBack$.hidden = true;
    this.setSpots([]);
    this.setHint(false);
    this.setSkippable(false);
    this.describe$.hidden = true;
  }

  // ——— Pausa ———

  showPause(on, tab = 'menu') {
    this.pause$.hidden = !on;
    const playing = this.game.mode === 'play';
    const replay = this.game.director.replay;
    for (const sel of ['#spots', '#choices', '#caption', '#corner', '#skip-btn', '#title', '#board', '#peek-back']) {
      const el = $(sel);
      if (el) el.inert = on;
    }
    for (const act of ['restart-seg', 'title']) this.pause$.querySelector(`[data-act=${act}]`).hidden = !playing;
    this.pause$.querySelector('[data-act=restart-seg]').textContent = replay ? 'Salir del recuerdo' : 'Repetir esta escena';
    for (const t of ['menu', 'moments', 'history']) this.pause$.querySelector(`[role=tab][data-tab=${t}]`).hidden = !playing;
    $('#pause-title').textContent = playing ? 'Pausa' : 'Opciones';
    if (on) {
      this.syncOptions();
      this.renderJournal();
      this.renderMoments();
      this.renderHistory();
      $('.where', this.pause$).textContent = this.game.whereText();
      this.showTab(playing ? tab : tab === 'menu' ? 'options' : tab);
      const first = this.pause$.querySelector('.panel:not([hidden]) button, .panel:not([hidden]) input, .panel:not([hidden]) select');
      first?.focus({preventScroll: true});
    } else if (playing) {
      // el foco vuelve a la escena: Enter avanza el texto, no reabre la pausa
      if (!this.choices$.hidden) setTimeout(() => this.choices$.querySelector('button:not(.peek)')?.focus({preventScroll: true}), 0);
      else if (this.peekBack$ && !this.peekBack$.hidden) setTimeout(() => this.peekBack$.focus({preventScroll: true}), 0);
      else $('#stage').focus({preventScroll: true});
    }
  }

  /** Tab no sale del diálogo de pausa. */
  trapFocus(e) {
    if (this.pause$.hidden || e.key !== 'Tab') return;
    const items = [...this.pause$.querySelectorAll('button, input, select')].filter(el => !el.hidden && el.offsetParent !== null && !el.closest('[hidden]'));
    if (!items.length) return;
    const i = items.indexOf(document.activeElement);
    const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i === items.length - 1 ? 0 : i + 1);
    e.preventDefault();
    items[next].focus();
  }

  showTab(name) {
    for (const t of this.pause$.querySelectorAll('[role=tab]')) {
      t.setAttribute('aria-selected', String(t.dataset.tab === name));
      t.setAttribute('aria-controls', `panel-${t.dataset.tab}`);
      t.tabIndex = t.dataset.tab === name ? 0 : -1;
    }
    for (const p of this.pause$.querySelectorAll('.panel')) p.id = `panel-${p.dataset.panel}`;
    for (const p of this.pause$.querySelectorAll('.panel')) p.hidden = p.dataset.panel !== name;
  }

  renderHistory() {
    const ol = $('.history', this.pause$);
    ol.replaceChildren();
    for (const l of (this.game.state?.log || []).slice(-60)) {
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
    const entries = this.game.state?.journal || [];
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
      // primero lo que pasó en esta partida; después lo que eso dice
      if (e.seen?.length) {
        const hs = document.createElement('h4');
        hs.textContent = 'Lo que pasó';
        const ul = document.createElement('ul');
        ul.className = 'seen';
        for (const s of e.seen) {
          const li = document.createElement('li');
          li.textContent = s;
          ul.append(li);
        }
        div.append(hs, ul);
      }
      if (e.body?.length) {
        const hb = document.createElement('h4');
        hb.textContent = 'Lo que eso dice';
        div.append(hb);
      }
      for (const line of e.body || []) {
        const p = document.createElement('p');
        p.textContent = line;
        div.append(p);
      }
      const moments = this.game.mode !== 'play' ? [] : e.moments || (e.moment ? [{id: e.moment, label: 'Desplegar: volver a ver por qué'}] : []);
      for (const m of moments) {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.moment = m.id;
        b.textContent = m.label;
        div.append(b, document.createElement('br'));
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
