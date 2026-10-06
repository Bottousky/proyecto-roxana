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

class Game {
  constructor() {
    this.settings = loadSettings();
    this.state = loadState() || null;
    this.renderer = new BoardRenderer(document.getElementById('board'));
    this.overlay = document.getElementById('overlay');
    this.overlayCtx = this.overlay.getContext('2d');
    this.camera = new Camera();
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
    this.camera.safe = {left: 0, right: 0, top: playing ? 56 : 0, bottom};
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

  addEvidence(kind, data = {}) {
    if (!this.state) return;
    this.state.evidence.push({t: new Date().toISOString(), seg: this.state.segment, kind, ...data});
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

  async start(fresh) {
    this.audio.unlock();
    if (fresh) {
      clearState();
      this.state = newState();
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
      this.saveNow();
      await this.chapter.ending?.(d, this);
      if (d.epoch === epoch) this.toTitle();
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
    if (!this.state?.segment) return;
    delete this.state.scratch[this.state.segment];
    this.runFrom(this.state.segment);
  }

  availableMoments() {
    if (!this.state) return [];
    return this.state.moments.map(id => this.chapter.segments.find(s => s.id === id)).filter(Boolean).map(s => ({id: s.id, title: s.moment}));
  }

  async replayMoment(id) {
    const seg = this.chapter.segments.find(s => s.id === id);
    if (!seg) return;
    this.togglePause(false);
    const d = this.director;
    const back = this.state.segment;
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
    this.ui.showPause(true);
    this.ui.showTab('options');
  }

  togglePause(force) {
    if (this.mode !== 'play') {
      if (force === false || (force === undefined && !this.ui.pause$.hidden)) {
        this.ui.pause$.hidden = true;
        document.querySelector('#title [data-act=options]')?.focus({preventScroll: true});
      }
      return;
    }
    const on = force ?? !this.paused;
    if (on === this.paused) return;
    this.paused = on;
    this.ui.showPause(on);
    if (on) this.saveNow();
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
      Promise.all([document.fonts.load('400 40px Kalam'), document.fonts.load('700 40px Kalam'), document.fonts.load('700 20px "Atkinson Hyperlegible"')]),
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
