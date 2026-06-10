import { uiOpen } from './overlay';

const KNOB_MAX = 40;

let _vx = 0;
let _vy = 0;

export function initJoystick(): void {
  const zone = document.getElementById('joystick-zone')!;
  const base = document.getElementById('joystick-base')!;
  const knob = document.getElementById('joystick-knob')!;

  let touchId: number | null = null;

  zone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    document.body.classList.add('touch-device');
    if (touchId !== null) return;
    touchId = e.changedTouches[0].identifier;
    base.style.opacity = '1';
  }, { passive: false });

  zone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (uiOpen()) { _vx = 0; _vy = 0; return; }
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier !== touchId) continue;
      const br = base.getBoundingClientRect();
      const dx = t.clientX - (br.left + br.width / 2);
      const dy = t.clientY - (br.top + br.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist === 0) { _vx = 0; _vy = 0; break; }
      const nx = dx / dist;
      const ny = dy / dist;
      const clamped = Math.min(dist, KNOB_MAX);
      _vx = nx * (clamped / KNOB_MAX);
      _vy = ny * (clamped / KNOB_MAX);
      knob.style.transform = `translate(${nx * clamped}px, ${ny * clamped}px)`;
    }
  }, { passive: false });

  const endTouch = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId) {
        touchId = null;
        _vx = 0;
        _vy = 0;
        knob.style.transform = 'translate(0, 0)';
        base.style.opacity = ''; // vuelve al valor CSS (preview)
        break;
      }
    }
  };

  zone.addEventListener('touchend', endTouch, { passive: false });
  zone.addEventListener('touchcancel', endTouch, { passive: false });

  window.addEventListener('touchstart', () => {
    document.body.classList.add('touch-device');
  }, { once: true, passive: true });
}

export function getJoystickDir(): { vx: number; vy: number } {
  return { vx: _vx, vy: _vy };
}
