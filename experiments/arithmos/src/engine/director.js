// Director: las escenas son funciones asincrónicas que usan estas primitivas.
//
// - El tiempo de juego se detiene en pausa.
// - Saltar completa animaciones al instante (mismo estado final) hasta la próxima
//   próxima línea de diálogo o interacción: lo que se dice nunca se saltea.
// - Abortar (cargar, salir) invalida la escena en curso sin dejar promesas colgadas.

export class Abort extends Error {
  constructor() {
    super('escena interrumpida');
    this.name = 'Abort';
  }
}

export class Director {
  constructor(game) {
    this.game = game;
    this.timers = new Set();
    this.skipping = false;
    this.epoch = 0;
    this.replay = false; // reviendo un momento: no cuenta como progreso ni evidencia
    this.onSkipChange = null;
  }

  get world() { return this.game.world; }
  get cam() { return this.game.camera; }
  get ui() { return this.game.ui; }
  get audio() { return this.game.audio; }

  update(dt) {
    for (const t of [...this.timers]) t.step(dt);
  }

  check(epoch) {
    if (epoch !== this.epoch) throw new Abort();
  }

  /** Interrumpe todo lo que esté corriendo. */
  abort() {
    this.epoch++;
    for (const t of [...this.timers]) t.cancel();
    this.timers.clear();
    this.setSkipping(false);
    this.ui.reset();
  }

  setSkipping(on) {
    if (this.skipping === on) return;
    this.skipping = on;
    if (on) {
      for (const t of [...this.timers]) t.finish();
      this.cam.finish();
      for (const o of this.world.objects) {
        o.arriveNow?.();
        o.finishPose?.();
      }
      this.audio.stopLoops?.();
      this.ui.finishTyping();
    }
    this.onSkipChange?.(on);
  }

  /** Avanza `sec` segundos de juego llamando fn(k) con k en [0,1]. */
  tween(sec, fn = null, ease = k => k) {
    const epoch = this.epoch;
    if (this.skipping || sec <= 0) {
      fn?.(1);
      return Promise.resolve().then(() => this.check(epoch));
    }
    return new Promise((resolve, reject) => {
      let t = 0;
      const timer = {
        step: dt => {
          t += dt;
          const k = Math.min(1, t / sec);
          fn?.(ease(k));
          if (k >= 1) {
            this.timers.delete(timer);
            resolve();
          }
        },
        finish: () => {
          fn?.(1);
          this.timers.delete(timer);
          resolve();
        },
        cancel: () => {
          this.timers.delete(timer);
          reject(new Abort());
        },
      };
      this.timers.add(timer);
    }).then(() => this.check(epoch));
  }

  wait(sec) {
    return this.tween(sec);
  }

  all(...promises) {
    return Promise.all(promises);
  }

  /** Viaje de cámara. */
  async shot(rect, sec = 1.6, ease) {
    const dur = this.game.reducedMotion ? 0 : sec;
    this.cam.go(rect, this.skipping ? 0 : dur, ease);
    await this.tween(dur);
    this.cam.finish();
  }

  async walk(fig, x, y, speed) {
    const dur = fig.walkTo(x, y ?? fig.y, speed);
    await this.tween(dur);
    fig.arriveNow();
  }

  /** Dibuja un objeto (Drawing/Label/Link) con sonido de tiza. */
  async draw(obj, sec = 1, {sound = true, key = 'progress'} = {}) {
    obj[key] = this.skipping ? 1 : obj[key] ?? 0;
    // ?anim=2: el dibujo dura lo que dura su plan de mano; `sec` es el tope (si el plan es más largo, se acelera)
    const planned = this.game.anim === 2 && key === (obj.planKey ?? 'progress') && typeof obj.planDuration === 'function' ? obj.planDuration() : null;
    if (planned) sec = Math.min(sec, planned);
    const env = planned ? obj.soundEnvelope(sec) : null;
    const voice = sound && !this.skipping ? this.audio.chalkStart?.(sec, 1, env) : null;
    try {
      await this.tween(sec, k => { obj[key] = k; });
    } finally {
      voice?.stop();
    }
    obj[key] = 1;
  }

  async fadeTo(obj, value, sec = 0.6, key = 'fade') {
    const from = obj[key];
    await this.tween(sec, k => { obj[key] = from + (value - from) * k; });
  }

  /** Línea de diálogo. who: null (pensamiento), 'student', 'punto'... */
  async say(who, text, opts = {}) {
    const epoch = this.epoch;
    this.game.logLine(who, text, opts);
    // "saltar animación" adelanta movimientos, no lo que se dice ni se concluye
    if (this.skipping) this.setSkipping(false);
    if (who === 'student') this.world.get('student')?.talk?.(Math.min(2.2, 0.6 + text.length * 0.03));
    else if (who && who !== 'punto') this.world.get(who.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))?.talk?.(Math.min(2.2, 0.6 + text.length * 0.03));
    await this.ui.caption(who, text, opts);
    this.check(epoch);
  }

  think(text, opts = {}) {
    return this.say(null, text, opts);
  }

  /** Descripción de una acción visual (lector de pantalla y opción "describir acciones"). */
  describe(text) {
    this.ui.describe(text);
  }

  /** Elección entre opciones escritas. Detiene el salto. */
  async choose(options, opts = {}) {
    const epoch = this.epoch;
    this.setSkipping(false);
    // en una respuesta evaluativa, la posición no debe delatar la correcta
    const id = await this.ui.choose(options, {shuffle: !!opts.evaluate, ...opts});
    this.check(epoch);
    return id;
  }

  /**
   * Interacción con objetos del mundo. `spots` es una función que devuelve la
   * lista actual de puntos interactivos; `run` recibe un controlador y resuelve
   * cuando la interacción termina.
   */
  async interact(run) {
    const epoch = this.epoch;
    this.setSkipping(false);
    this.ui.setInteractive(true);
    try {
      const result = await run({
        epoch,
        alive: () => epoch === this.epoch,
      });
      this.check(epoch);
      return result;
    } finally {
      if (epoch === this.epoch) {
        this.ui.setInteractive(false);
        this.ui.setSpots([]);
      }
    }
  }

  evidence(kind, data = {}) {
    if (this.replay) return;
    this.game.addEvidence(kind, data);
  }
}
