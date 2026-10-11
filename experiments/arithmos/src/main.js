// Arithmos — controlador del juego.

import {BoardRenderer} from './engine/renderer.js';
import {Camera} from './engine/camera.js';
import {World} from './engine/world.js';
import {Director, Abort} from './engine/director.js';
import {UI} from './engine/ui.js';
import {Sound} from './engine/audio.js';
import {loadState, saveState, newState, loadSettings, saveSettings, clearState} from './engine/save.js';
import {CHAPTERS} from './chapters.js';
import {titleScene} from './title.js';
import {anim as animLevel} from './engine/anim.js';
import {ownerName, schoolName} from './engine/bitacora.js';

// Fotos de la pizarra al cerrar cada capítulo (la Bitácora las pega en su hoja): aparte de la partida, que es chica.
const PHOTOS_KEY = 'roxana.arithmos.fotos.v1';

class Game {
  constructor() {
    this.settings = loadSettings();
    this.state = loadState() || null;
    this.renderer = new BoardRenderer(document.getElementById('board'));
    this.overlay = document.getElementById('overlay');
    this.overlayCtx = this.overlay.getContext('2d');
    this.camera = new Camera();
    // ?anim=2: animación del laboratorio (adaptadores, ARITHMOS_ANIMATION_MIGRATION.md). Hoy: cámara y dibujos de tiza.
    this.anim = new URLSearchParams(location.search).get('anim') === '2' ? 2 : 1;
    this.camera.pathMode = this.anim === 2;
    animLevel.level = this.anim;
    this.world = new World();
    this.audio = new Sound();
    this.ui = new UI(this);
    this.director = new Director(this);
    this.director.onSkipChange = on => this.ui.setSkippable(this.cinematic && !on);
    this.paused = false;
    this.mode = 'title';
    this.boil = 0;
    this.boilT = 0;
    this.last = performance.now();
    this.hint = null;
    this.cinematic = false;
    this.saveTimer = 0;
    this.frameTimes = [];
    this.applySettings();
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => this.applySettings());
    window.addEventListener('resize', () => this.layout());
    document.getElementById('rotate')?.addEventListener('click', e => {
      if (e.target.closest('[data-act=rotate-ok]')) { this.rotateOk = true; this.layout(); }
    });
    this.layout();
    requestAnimationFrame(t => this.frame(t));
  }

  // ——— Preferencias ———

  get reducedMotion() {
    return this.settings.reducedMotion ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  setSetting(key, value) {
    this.settings[key] = value;
    saveSettings(this.settings);
    this.applySettings();
  }

  applySettings() {
    this.ui.applySettings();
    this.audio.setVolumes({master: this.settings.master, music: this.settings.music, sfx: this.settings.sfx});
    this.camera.drift = !this.reducedMotion;
    this.camera.allowShake = !this.reducedMotion;
    const coarse = matchMedia('(pointer: coarse)').matches || matchMedia('(hover: none)').matches;
    this.world.calm = this.reducedMotion ? 0.12 : coarse ? 0.25 : 1;
    this.renderer.grain = this.settings.clean ? 0.45 : 1;
    this.world.clean = !!this.settings.clean;
    this.layout();
  }

  layout() {
    const h = innerHeight, w = innerWidth;
    const playing = this.mode === 'play';
    const textScale = this.settings.textScale || 1;
    // la franja del texto queda reservada: la cámara no salta cuando aparece un diálogo
    const bottom = !playing ? 0 : h >= 560 ? Math.min(h * 0.3, 175 * textScale) : Math.min(h * 0.2, 80 * textScale);
    this.baseBottom = bottom;
    // en pantallas bajas (teléfono acostado) el margen de arriba es menor: los botones van en la esquina
    this.camera.safe = {left: 0, right: 0, top: playing ? (h < 560 ? 36 : 56) : 0, bottom};
    // teléfono en vertical: se avisa una vez que conviene girarlo
    const rotate = document.getElementById('rotate');
    if (rotate) rotate.hidden = !(playing && w < 700 && h > w * 1.15 && !this.rotateOk);
  }

  // ——— Bucle ———

  frame(now) {
    const raw = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const dt = this.paused ? 0 : raw;
    if (raw > 0) {
      this.frameTimes.push(raw);
      if (this.frameTimes.length > 240) this.frameTimes.shift();
    }
    this.boilT += dt;
    if (!this.reducedMotion && this.boilT > 0.125) {
      this.boilT = 0;
      this.boil = (this.boil + 1) % 3000;
    }
    this.director.update(dt);
    this.ui.setSkippable(this.cinematic && !this.director.skipping && !this.ui.waiting && this.ui.choices$.hidden && !this.paused);
    // si el panel de elecciones crece (texto grande, pantalla baja), la escena se corre hacia arriba
    if (this.mode === 'play') {
      const panel = this.ui.choices$.hidden ? 0 : this.ui.choices$.offsetHeight;
      // en pantallas bajas, mientras se toca la escena y no hay texto abajo, la escena usa ese lugar
      // (también mientras se esconden las opciones para mirar la pizarra)
      const peeking = !!this.ui.peekBack$ && !this.ui.peekBack$.hidden;
      const free = innerHeight < 560 && ((this.ui.interactive && this.ui.choices$.hidden && !this.ui.waiting) || peeking);
      const want = Math.max(free ? 16 : (this.baseBottom || 0), panel + 8);
      const cur = this.camera.safe.bottom;
      this.camera.safe.bottom = cur + (want - cur) * Math.min(1, raw * 6);
      // mientras la escena se reacomoda (se cierra el panel, crece la pizarra), los botones todavía se mueven
      this.camera.settling = Math.abs(want - cur) > 3;
    }
    this.camera.update(dt);
    this.world.update(dt);
    this.render();
    requestAnimationFrame(t => this.frame(t));
  }

  render() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = this.renderer;
    r.resize(innerWidth, innerHeight, dpr);
    const view = this.camera.view(r.w, r.h, dpr);
    this.view = view;
    const ctx = r.beginChalk(view);
    this.world.render(ctx, view, this.boil);
    const dctx = r.beginDust(view);
    this.world.renderDust(dctx, view);
    r.present(view);
    const o = this.overlay;
    if (o.width !== r.w || o.height !== r.h) {
      o.width = r.w;
      o.height = r.h;
    }
    const oc = this.overlayCtx;
    oc.setTransform(1, 0, 0, 1, 0, 0);
    oc.clearRect(0, 0, o.width, o.height);
    if (this.settings.clean) {
      oc.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.world.renderClean(oc, view, this.camera);
    }
    this.ui.positionSpots(view, this.camera);
  }

  // ——— Estado ———

  queueSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveNow(), 250);
  }

  saveNow() {
    clearTimeout(this.saveTimer);
    if (!this.state || this.director.replay || this.devNoSave) return;
    saveState(this.state);
  }

  // ——— Bitácora ———

  /** Dueño del tomo: el nombre del registro de Dirección (escuela 3D) o el que se dio al empezar. */
  owner() {
    return ownerName(this.state, schoolName());
  }

  chapterTitles() {
    return Object.fromEntries(Object.entries(CHAPTERS).map(([n, c]) => [n, c.title]));
  }

  journalPhotos() {
    try { return JSON.parse(localStorage.getItem(PHOTOS_KEY) || '{}') || {}; } catch { return {}; }
  }

  /** Anota la entrada del capítulo y pega la foto de la pizarra tal como quedó (con lo que escribió el jugador). */
  addJournal(entry) {
    this.state.journal = this.state.journal.filter(e => e.id !== entry.id).concat([entry]);
    if (!this.director.replay && !this.devNoSave) this.#photograph(entry.id);
    this.ui.toast('Anotado en la Bitácora (≡)');
    this.saveNow();
  }

  #photograph(id) {
    try {
      const photos = this.journalPhotos();
      photos[id] = this.photographBoard();
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
    } catch { /* sin almacenamiento o sin lugar: la hoja queda sin foto */ }
  }

  /** La pizarra como foto (JPEG, ≤ 720 px), recortada a donde hay tiza, con aire y en 16:9 (lo de la Bitácora). */
  photographBoard() {
    this.render();
    const board = document.getElementById('board'), W = board.width, H = board.height;
    const probe = document.createElement('canvas');
    probe.width = 240;
    probe.height = Math.max(1, Math.round(240 * H / W));
    const pc = probe.getContext('2d', {willReadFrequently: true});
    pc.drawImage(board, 0, 0, probe.width, probe.height);
    pc.drawImage(this.overlay, 0, 0, probe.width, probe.height);
    const px = pc.getImageData(0, 0, probe.width, probe.height).data;
    let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
    for (let y = 0; y < probe.height; y++) for (let x = 0; x < probe.width; x++) {
      const i = 4 * (y * probe.width + x);
      if (0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2] > 110) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    }
    const k = W / probe.width;
    let r = x1 < 0 ? {x: 0, y: 0, w: W, h: H} : {x: x0 * k, y: y0 * k, w: (x1 - x0 + 1) * k, h: (y1 - y0 + 1) * k};
    // aire alrededor, proporción 16:9 y nunca más chica que un tercio de la pizarra
    const pad = 0.08 * Math.max(r.w, r.h * 16 / 9);
    let w = Math.max(r.w + 2 * pad, (r.h + 2 * pad) * 16 / 9, W / 3), h = w * 9 / 16;
    if (h > H) { h = H; w = Math.min(W, h * 16 / 9); }
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    r = {x: Math.min(Math.max(0, cx - w / 2), W - w), y: Math.min(Math.max(0, cy - h / 2), H - h), w, h};
    const c = document.createElement('canvas');
    c.width = Math.min(720, Math.round(r.w));
    c.height = Math.round(c.width * r.h / r.w);
    const ctx = c.getContext('2d');
    ctx.drawImage(board, r.x, r.y, r.w, r.h, 0, 0, c.width, c.height);
    ctx.drawImage(this.overlay, r.x, r.y, r.w, r.h, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.8);
  }

  addEvidence(kind, data = {}) {
    if (!this.state) return;
    // los datos nunca pisan el tipo, la escena ni la hora
    this.state.evidence.push({...data, t: new Date().toISOString(), seg: this.state.segment, run: this.state.run || 1, kind});
    this.queueSave();
  }

  logLine(who, text) {
    if (!this.state || this.director.replay) return;
    this.state.log.push({who, text});
    this.queueSave();
  }

  get flags() {
    return this.state.flags;
  }

  scratch(seg = this.state.segment) {
    this.state.scratch[seg] ??= {};
    return this.state.scratch[seg];
  }

  // ——— Partida ———

  get chapter() {
    return CHAPTERS[this.state?.chapter || 1];
  }

  segmentIndex(id) {
    return this.chapter.segments.findIndex(s => s.id === id);
  }

  whereText() {
    if (this.mode !== 'play' || !this.state) return '';
    const seg = this.chapter.segments.find(s => s.id === this.state.segment);
    return `Capítulo ${this.chapter.number} · ${this.chapter.title}${seg ? ` · ${seg.title}` : ''}`;
  }

  async start(fresh, owner = '') {
    this.audio.unlock();
    if (fresh) {
      clearState();
      this.state = newState();
      this.state.owner = owner;
      try { localStorage.removeItem(PHOTOS_KEY); } catch { /* sin almacenamiento */ }
    }
    document.getElementById('title').hidden = true;
    document.getElementById('corner').hidden = false;
    this.mode = 'play';
    this.layout();
    const seg = this.state.segment || this.chapter.segments[0].id;
    this.runFrom(seg);
  }

  async runFrom(segId) {
    const d = this.director;
    d.abort();
    d.replay = false;
    const epoch = d.epoch;
    const segs = this.chapter.segments;
    let i = Math.max(0, this.segmentIndex(segId));
    this.world.clear();
    this.renderer.dim = 1;
    this.renderer.tint = [1, 1, 1];
    try {
      for (; i < segs.length; i++) {
        const seg = segs[i];
        this.state.segment = seg.id;
        this.saveNow();
        this.hint = null;
        this.ui.setHint(false);
        this.setCinematic(false);
        seg.setup(this);
        await seg.play(d, this);
        if (d.epoch !== epoch) return;
        if (!this.state.completed.includes(seg.id)) this.state.completed.push(seg.id);
        if (seg.moment && !this.state.moments.includes(seg.id)) this.state.moments.push(seg.id);
        this.saveNow();
      }
      this.state.segment = segs[segs.length - 1].id;
      this.flags.chapterDone = true;
      this.state.chaptersDone = [...new Set([...(this.state.chaptersDone || []), this.chapter.number])];
      this.saveNow();
      await this.chapter.ending?.(d, this);
      if (d.epoch !== epoch) return;
      const next = CHAPTERS[this.chapter.number + 1];
      if (next) {
        this.state.chapter = next.number;
        this.state.segment = next.segments[0].id;
        this.saveNow();
        this.runFrom(this.state.segment);
      } else {
        this.state.finished = true;
        this.saveNow();
        this.toTitle();
      }
    } catch (e) {
      if (!(e instanceof Abort)) this.fail(e);
    }
  }

  setCinematic(on) {
    this.cinematic = on;
    this.ui.setSkippable(on && !this.director.skipping);
  }

  restartSegment() {
    this.togglePause(false);
    if (this.director.replay && this.replayBack) {
      this.director.replay = false;
      this.runFrom(this.replayBack);
      return;
    }
    if (!this.state?.segment) return;
    delete this.state.scratch[this.state.segment];
    this.runFrom(this.state.segment);
  }

  /** Volver a jugar un capítulo terminado: partida nueva de ese capítulo (la evidencia se separa). */
  replayChapter(n) {
    const ch = CHAPTERS[n];
    if (!ch || !this.state) return;
    this.state.run = (this.state.run || 1) + 1;
    this.state.chapter = n;
    this.state.segment = ch.segments[0].id;
    this.state.finished = false;
    for (const seg of ch.segments) delete this.state.scratch[seg.id];
    this.saveNow();
    this.start(false);
  }

  findSegment(id) {
    for (const ch of Object.values(CHAPTERS)) {
      const seg = ch.segments.find(s => s.id === id);
      if (seg) return seg;
    }
    return null;
  }

  availableMoments() {
    if (!this.state) return [];
    return this.state.moments.map(id => this.findSegment(id)).filter(Boolean).map(s => ({id: s.id, title: s.moment}));
  }

  async replayMoment(id) {
    const seg = this.findSegment(id);
    if (!seg) return;
    this.togglePause(false);
    const d = this.director;
    const back = this.state.segment;
    this.replayBack = back;
    d.abort();
    d.replay = true;
    const epoch = d.epoch;
    try {
      this.setCinematic(true);
      this.world.clear();
      seg.setup(this, {replay: true});
      await seg.play(d, this, {replay: true});
      if (d.epoch !== epoch) return;
      d.replay = false;
      this.runFrom(back);
    } catch (e) {
      if (!(e instanceof Abort)) this.fail(e);
    } finally {
      if (d.epoch === epoch) d.replay = false;
    }
  }

  setHint(provider) {
    this.hint = provider ? {provider, level: 0} : null;
    this.ui.setHint(!!provider);
  }

  requestHint() {
    if (!this.hint || this.paused) return;
    const lines = this.hint.provider();
    const level = Math.min(this.hint.level, lines.length - 1);
    this.hint.level++;
    this.addEvidence('hint', {level: level + 1});
    let item = lines[level];
    // la demostración se hace una vez; después, la ayuda vuelve a ser una explicación
    if (typeof item === 'function') {
      if (this.hint.demoUsed) item = [...lines].reverse().find(l => typeof l === 'string');
      else this.hint.demoUsed = true;
    }
    if (typeof item === 'function') item();
    else this.note(item);
  }

  /** Pensamiento breve que no detiene la interacción. */
  note(text, who = null) {
    this.logLine(who, text);
    this.ui.note(who, text);
  }

  openOptions() {
    this.ui.showPause(true, 'options');
  }

  togglePause(force) {
    if (this.mode !== 'play') {
      if (force === false || (force === undefined && !this.ui.pause$.hidden)) {
        this.ui.showPause(false);
        document.querySelector('#title [data-act=options]')?.focus({preventScroll: true});
      }
      return;
    }
    const on = force ?? !this.paused;
    if (on === this.paused) return;
    this.paused = on;
    this.ui.showPause(on);
    if (on) this.saveNow();
    // el sonido también se detiene: nada sigue sonando sobre una imagen congelada
    try { on ? this.audio.ctx?.suspend() : this.audio.ctx?.resume(); } catch { /* sin audio */ }
  }

  toTitle() {
    this.director.abort();
    this.paused = false;
    this.ui.showPause(false);
    this.mode = 'title';
    document.getElementById('corner').hidden = true;
    this.layout();
    titleScene(this);
  }

  fail(e) {
    console.error(e);
    const el = document.getElementById('fatal');
    el.hidden = false;
    el.textContent = `Algo se rompió en el pizarrón (${e.message}). Tu progreso está guardado: recargá la página para seguir.`;
  }
}

async function boot() {
  try {
    await Promise.race([
      Promise.all([document.fonts.load('400 40px Kalam'), document.fonts.load('700 40px Kalam'), document.fonts.load('400 40px Tiza', '4a'), document.fonts.load('700 40px Tiza', '4a'), document.fonts.load('300 40px Tiza', '4a'), document.fonts.load('700 20px "Atkinson Hyperlegible"')]),
      new Promise(r => setTimeout(r, 2500)),
    ]);
    const game = new Game();
    window.__game = game;
    document.getElementById('corner').hidden = true;
    // desarrollo: ?seg=c1.marea abre esa escena en una partida temporal (no se guarda)
    const seg = new URLSearchParams(location.search).get('seg');
    if (seg) {
      game.devNoSave = true;
      game.state = newState();
      game.state.segment = seg;
      game.state.chapter = Number(seg.match(/^c(\d+)\./)?.[1] || 1);
      game.start(false);
    } else titleScene(game);
    window.__ready = true;
  } catch (e) {
    const el = document.getElementById('fatal');
    el.hidden = false;
    el.textContent = e.message;
    console.error(e);
  }
}

boot();
