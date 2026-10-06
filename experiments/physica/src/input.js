// Keyboard, gamepad and touch feed one small intent: horizontal axis, act, reset, journal.
export class Input {
  constructor(root) {
    this.keys = new Set(); this.axis = 0; this.axisY = 0; this.pressed = new Set(); this.touchAxis = 0; this.touchAxisY = 0; this.lastDevice = 'keyboard';
    this.padPrev = {};
    addEventListener('keydown', e => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      // While the options panel is open, keys belong to it (its controls and its focus trap),
      // except Escape / P, which close it: nothing reaches the game behind it.
      if (document.getElementById('pause')?.hidden === false && k !== 'escape' && k !== 'p') return;
      this.keys.add(k); this.lastDevice = 'keyboard';
      if (k === 'e' || k === ' ' || k === 'enter') this.pressed.add('act');
      if (k === 'r') this.pressed.add('reset');
      if (k === 'j' || k === 'tab') this.pressed.add('journal');
      if (k === 'escape' || k === 'p') this.pressed.add('pause');
      if (k === 'w' || k === 'arrowup') this.pressed.add('up');
      if (k === 's' || k === 'arrowdown') this.pressed.add('down');
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'tab'].includes(k)) e.preventDefault();
    });
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.keys.clear());
    this.bindTouch(root);
  }

  bindTouch(root) {
    const pad = document.createElement('div');
    pad.className = 'touch';
    pad.innerHTML = `<div class="touch-move"><button data-axis="-1" aria-label="Izquierda">◀</button><div class="touch-vert"><button data-vaxis="1" aria-label="Arriba">▲</button><button data-vaxis="-1" aria-label="Abajo">▼</button></div><button data-axis="1" aria-label="Derecha">▶</button></div>
      <div class="touch-act"><button data-act="journal" aria-label="Bitácora">✎</button><button data-act="reset" aria-label="Reiniciar">↺</button><button data-act="act" class="big" aria-label="Usar">E</button></div>`;
    root.appendChild(pad);
    // Pause and options: its own corner, so the action buttons keep the bottom bar's width.
    const pauseBtn = document.createElement('button'); pauseBtn.className = 'touch-pause'; pauseBtn.dataset.act = 'pause';
    pauseBtn.setAttribute('aria-label', 'Pausa y opciones'); pauseBtn.textContent = '⏸'; root.appendChild(pauseBtn);
    pauseBtn.addEventListener('pointerdown', e => { e.preventDefault(); this.pressed.add('pause'); this.lastDevice = 'touch'; });
    const held = new Map();
    const upd = () => { let a = 0; for (const v of held.values()) a += v; this.touchAxis = Math.max(-1, Math.min(1, a)); };
    pad.querySelectorAll('[data-axis]').forEach(b => {
      const v = +b.dataset.axis;
      b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); held.set(e.pointerId, v); this.lastDevice = 'touch'; upd(); });
      const end = e => { held.delete(e.pointerId); upd(); };
      b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end); b.addEventListener('lostpointercapture', end);
    });
    const vheld = new Map();
    const vupd = () => { let a = 0; for (const v of vheld.values()) a += v; this.touchAxisY = Math.max(-1, Math.min(1, a)); };
    pad.querySelectorAll('[data-vaxis]').forEach(b => {
      const v = +b.dataset.vaxis;
      b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); vheld.set(e.pointerId, v); this.pressed.add(v > 0 ? 'up' : 'down'); this.lastDevice = 'touch'; vupd(); });
      const end = e => { vheld.delete(e.pointerId); vupd(); };
      b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end); b.addEventListener('lostpointercapture', end);
    });
    pad.querySelectorAll('[data-act]').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); this.pressed.add(b.dataset.act); this.lastDevice = 'touch'; }));
    addEventListener('touchstart', () => { document.body.classList.add('has-touch'); this.lastDevice = 'touch'; }, { passive: true, once: true });
    if (matchMedia('(pointer: coarse)').matches) document.body.classList.add('has-touch');
  }

  poll() {
    let a = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) a -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) a += 1;
    a += this.touchAxis;
    let ay = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) ay += 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) ay -= 1;
    ay += this.touchAxisY;
    for (const gp of navigator.getGamepads?.() || []) {
      if (!gp) continue;
      const x = gp.axes[0] || 0;
      if (Math.abs(x) > 0.2) { a += x; this.lastDevice = 'gamepad'; }
      if (gp.buttons[14]?.pressed) a -= 1;
      if (gp.buttons[15]?.pressed) a += 1;
      const y = -(gp.axes[1] || 0);
      if (Math.abs(y) > 0.3) ay += y;
      // The stick also steps B's clamp: one step each time it crosses half travel.
      const sy = y > 0.5 ? 1 : y < -0.5 ? -1 : 0;
      if (sy && sy !== this.stickPrev) this.pressed.add(sy > 0 ? 'up' : 'down');
      this.stickPrev = sy;
      if (gp.buttons[12]?.pressed) ay += 1;
      if (gp.buttons[13]?.pressed) ay -= 1;
      const edge = (i, name) => { const p = !!gp.buttons[i]?.pressed; if (p && !this.padPrev[i]) { this.pressed.add(name); this.lastDevice = 'gamepad'; } this.padPrev[i] = p; };
      edge(0, 'act'); edge(2, 'act'); edge(3, 'reset'); edge(8, 'journal'); edge(9, 'pause'); edge(12, 'up'); edge(13, 'down');
      // For menus: B backs out; the d-pad and the stick step left and right.
      edge(1, 'back'); edge(14, 'left'); edge(15, 'right');
      const sx = x > 0.5 ? 1 : x < -0.5 ? -1 : 0;
      if (sx && sx !== this.stickPrevX) this.pressed.add(sx > 0 ? 'right' : 'left');
      this.stickPrevX = sx;
    }
    this.axis = Math.max(-1, Math.min(1, a)); this.axisY = Math.max(-1, Math.min(1, ay));
    const out = { axis: this.axis, axisY: this.axisY, act: this.pressed.has('act'), reset: this.pressed.has('reset'), journal: this.pressed.has('journal'), pause: this.pressed.has('pause'),
      adjust: this.pressed.has('up') ? 1 : this.pressed.has('down') ? -1 : 0,
      back: this.pressed.has('back'), step: this.pressed.has('right') ? 1 : this.pressed.has('left') ? -1 : 0 };
    this.pressed.clear();
    return out;
  }
}
