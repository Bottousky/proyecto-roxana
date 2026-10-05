// Keyboard, gamepad and touch feed one small intent: horizontal axis, act, reset, journal.
export class Input {
  constructor(root) {
    this.keys = new Set(); this.axis = 0; this.pressed = new Set(); this.touchAxis = 0; this.lastDevice = 'keyboard';
    this.padPrev = {};
    addEventListener('keydown', e => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      this.keys.add(k); this.lastDevice = 'keyboard';
      if (k === 'e' || k === ' ' || k === 'enter') this.pressed.add('act');
      if (k === 'r') this.pressed.add('reset');
      if (k === 'j' || k === 'tab') this.pressed.add('journal');
      if (k === 'escape' || k === 'p') this.pressed.add('pause');
      if (['arrowleft', 'arrowright', ' ', 'tab'].includes(k)) e.preventDefault();
    });
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.keys.clear());
    this.bindTouch(root);
  }

  bindTouch(root) {
    const pad = document.createElement('div');
    pad.className = 'touch';
    pad.innerHTML = `<div class="touch-move"><button data-axis="-1" aria-label="Izquierda">◀</button><button data-axis="1" aria-label="Derecha">▶</button></div>
      <div class="touch-act"><button data-act="journal" aria-label="Bitácora">✎</button><button data-act="reset" aria-label="Reiniciar">↺</button><button data-act="act" class="big" aria-label="Usar">E</button></div>`;
    root.appendChild(pad);
    const held = new Map();
    const upd = () => { let a = 0; for (const v of held.values()) a += v; this.touchAxis = Math.max(-1, Math.min(1, a)); };
    pad.querySelectorAll('[data-axis]').forEach(b => {
      const v = +b.dataset.axis;
      b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture(e.pointerId); held.set(e.pointerId, v); this.lastDevice = 'touch'; upd(); });
      const end = e => { held.delete(e.pointerId); upd(); };
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
    for (const gp of navigator.getGamepads?.() || []) {
      if (!gp) continue;
      const x = gp.axes[0] || 0;
      if (Math.abs(x) > 0.2) { a += x; this.lastDevice = 'gamepad'; }
      if (gp.buttons[14]?.pressed) a -= 1;
      if (gp.buttons[15]?.pressed) a += 1;
      const edge = (i, name) => { const p = !!gp.buttons[i]?.pressed; if (p && !this.padPrev[i]) { this.pressed.add(name); this.lastDevice = 'gamepad'; } this.padPrev[i] = p; };
      edge(0, 'act'); edge(2, 'act'); edge(3, 'reset'); edge(8, 'journal'); edge(9, 'pause');
    }
    this.axis = Math.max(-1, Math.min(1, a));
    const out = { axis: this.axis, act: this.pressed.has('act'), reset: this.pressed.has('reset'), journal: this.pressed.has('journal'), pause: this.pressed.has('pause') };
    this.pressed.clear();
    return out;
  }
}
