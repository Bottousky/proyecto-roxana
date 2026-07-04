import { portalGateUrl } from '../shared/portalLink.ts';

const LIGHT = '#dfe9ff';
const DURATION = 1180;
let active = false;
let audioCtx: AudioContext | null = null;

function reduced(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

function ctx(): AudioContext | null {
  if (audioCtx) return audioCtx;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    audioCtx = Ctor ? new Ctor() : null;
    return audioCtx;
  } catch {
    return null;
  }
}

function playPortalCrossing(short = false): void {
  const audio = ctx();
  if (!audio) return;
  try {
    if (audio.state === 'suspended') void audio.resume();
    const now = audio.currentTime;
    const dur = short ? 0.18 : 0.95;
    const hum = audio.createOscillator(), filter = audio.createBiquadFilter(), humGain = audio.createGain();
    hum.type = 'sawtooth';
    hum.frequency.setValueAtTime(58, now); hum.frequency.exponentialRampToValueAtTime(short ? 140 : 420, now + dur);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(360, now); filter.frequency.exponentialRampToValueAtTime(1800, now + dur);
    humGain.gain.setValueAtTime(0.0001, now); humGain.gain.linearRampToValueAtTime(short ? 0.06 : 0.11, now + 0.04);
    humGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    hum.connect(filter); filter.connect(humGain); humGain.connect(audio.destination);
    hum.start(now); hum.stop(now + dur + 0.03);

    const crackleDur = short ? 0.08 : 0.22;
    const buffer = audio.createBuffer(1, Math.max(1, Math.floor(audio.sampleRate * crackleDur)), audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() > 0.72 ? Math.random() * 2 - 1 : 0;
    const noise = audio.createBufferSource(), highpass = audio.createBiquadFilter(), crackleGain = audio.createGain();
    noise.buffer = buffer;
    highpass.type = 'highpass'; highpass.frequency.value = 2400;
    crackleGain.gain.setValueAtTime(short ? 0.05 : 0.08, now + dur * 0.48);
    crackleGain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.48 + crackleDur);
    noise.connect(highpass); highpass.connect(crackleGain); crackleGain.connect(audio.destination);
    noise.start(now + dur * 0.48); noise.stop(now + dur * 0.48 + crackleDur);
  } catch {
    // degradar en silencio
  }
}

function overlay(): { root: HTMLDivElement; canvas: HTMLCanvasElement } {
  const root = document.createElement('div'), canvas = document.createElement('canvas');
  root.className = 'rx-portal-transition';
  root.setAttribute('aria-hidden', 'true'); root.style.background = LIGHT;
  canvas.className = 'rx-portal-transition-canvas';
  root.appendChild(canvas); document.body.appendChild(root);
  return { root, canvas };
}

function goSoon(delay: number): void {
  window.setTimeout(() => { window.location.href = portalGateUrl(); }, delay);
}

function fadeOut(): void {
  playPortalCrossing(true);
  const { root } = overlay();
  requestAnimationFrame(() => { root.style.opacity = '1'; });
  goSoon(220);
}

function draw(canvas: HTMLCanvasElement, origin: DOMRect, start: number): void {
  const g = canvas.getContext('2d');
  if (!g) return goSoon(0);
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr); canvas.height = Math.floor(window.innerHeight * dpr);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ffd34d';
  const cx = origin.left + origin.width / 2, cy = origin.top + origin.height / 2;
  const maxR = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) * 1.1;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / DURATION), eased = 1 - (1 - t) ** 3;
    g.clearRect(0, 0, innerWidth, innerHeight);
    const glow = g.createRadialGradient(cx, cy, 0, cx, cy, maxR * eased);
    glow.addColorStop(0, 'rgba(255,255,255,0.98)'); glow.addColorStop(0.22, 'rgba(223,233,255,0.74)');
    glow.addColorStop(0.62, 'rgba(80,178,255,0.18)'); glow.addColorStop(1, 'rgba(223,233,255,0)');
    g.fillStyle = glow; g.fillRect(0, 0, innerWidth, innerHeight);
    g.globalCompositeOperation = 'lighter';
    for (let ray = 0; ray < 22; ray++) {
      const a = (Math.PI * 2 * ray) / 22 + Math.sin(t * 9 + ray) * 0.12;
      const length = maxR * (0.22 + eased * 0.88) * (0.72 + ((ray * 37) % 19) / 55);
      g.beginPath();
      g.moveTo(cx, cy);
      for (let i = 1; i <= 9; i++) {
        const p = i / 9;
        const wobble = (Math.random() - 0.5) * (18 + 54 * p) * (1 - t * 0.25);
        g.lineTo(cx + Math.cos(a) * length * p + Math.cos(a + Math.PI / 2) * wobble, cy + Math.sin(a) * length * p + Math.sin(a + Math.PI / 2) * wobble);
      }
      g.strokeStyle = ray % 3 === 0 ? accent : 'rgba(223,233,255,0.95)'; g.lineWidth = ray % 3 === 0 ? 1.4 : 2.2;
      g.shadowColor = '#8fd6ff'; g.shadowBlur = 18;
      g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
    if (t > 0.82) {
      g.fillStyle = `rgba(223,233,255,${(t - 0.82) / 0.18})`; g.fillRect(0, 0, innerWidth, innerHeight);
    }
    if (t < 1) requestAnimationFrame(tick);
    else window.location.href = portalGateUrl();
  };
  requestAnimationFrame(tick);
}

export function startPortalTransition(hotspot: HTMLElement): void {
  if (active) return;
  active = true;
  if (reduced()) return fadeOut();
  playPortalCrossing(false);
  const { root, canvas } = overlay();
  root.style.opacity = '1';
  draw(canvas, hotspot.getBoundingClientRect(), performance.now());
}
