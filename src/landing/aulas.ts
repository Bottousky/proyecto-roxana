// Pasillo de Aulas: puertas DOM/CSS/SVG + router de hash + shell de aula (placeholder).
// No importar ./index.ts desde acá (evita import circular).
import { readSchoolState, type AulaId, type AulaEstado } from './schoolModel.ts';

export interface Aula {
  id: AulaId;
  motif: string;
  disciplina: string;
  nombre: string;
  desc: string;
}

export const AULAS: Aula[] = [
  { id: 'electronica', motif: 'Ω', disciplina: 'Electrónica', nombre: 'Ohmdal', desc: 'Corriente, resistencia, la chispa que lo mueve.' },
  { id: 'programacion', motif: '{ }', disciplina: 'Programación', nombre: 'Bitland', desc: 'Lógica, bucles, estructuras de pensamiento.' },
  { id: 'fisica', motif: 'Δ', disciplina: 'Física', nombre: 'Physica', desc: 'Movimiento, energía y las leyes que lo gobiernan.' },
  { id: 'matematica', motif: '∑', disciplina: 'Matemática', nombre: 'Arithmos', desc: 'Números como fuerzas, ecuaciones como equilibrio.' },
];

const AULA_IDS: AulaId[] = ['electronica', 'programacion', 'fisica', 'matematica'];

/** Función pura: parsea el hash de ubicación a un AulaId, o null si no aplica. */
export function parseAulaHash(hash: string): AulaId | null {
  if (!hash) return null;
  const clean = hash.startsWith('#') ? hash.slice(1) : hash;
  const parts = clean.split('/');
  if (parts.length !== 2 || parts[0] !== 'aula') return null;
  const candidate = parts[1];
  return (AULA_IDS as string[]).includes(candidate) ? (candidate as AulaId) : null;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/* ---------- sonido de puerta (WebAudio sintetizado, lazy) ---------- */

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (audioCtx) return audioCtx;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Crujido de puerta (ruido filtrado con barrido) + thunk grave de pestillo. */
export function playDoorOpen(short = false): void {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') void ctx.resume();

    const now = ctx.currentTime;
    const creakDur = short ? 0.12 : 0.55;

    // Ruido blanco para el crujido
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * creakDur));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.value = 4;
    bandpass.frequency.setValueAtTime(280, now);
    bandpass.frequency.linearRampToValueAtTime(short ? 500 : 900, now + creakDur);

    const creakGain = ctx.createGain();
    creakGain.gain.setValueAtTime(0.0001, now);
    creakGain.gain.linearRampToValueAtTime(short ? 0.05 : 0.09, now + creakDur * 0.3);
    creakGain.gain.exponentialRampToValueAtTime(0.0001, now + creakDur);

    noise.connect(bandpass);
    bandpass.connect(creakGain);
    creakGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + creakDur + 0.02);

    // Thunk grave del pestillo al final
    const thunkStart = now + creakDur * 0.85;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, thunkStart);
    osc.frequency.exponentialRampToValueAtTime(45, thunkStart + 0.18);

    const thunkGain = ctx.createGain();
    thunkGain.gain.setValueAtTime(0.0001, thunkStart);
    thunkGain.gain.linearRampToValueAtTime(0.16, thunkStart + 0.015);
    thunkGain.gain.exponentialRampToValueAtTime(0.0001, thunkStart + 0.22);

    osc.connect(thunkGain);
    thunkGain.connect(ctx.destination);
    osc.start(thunkStart);
    osc.stop(thunkStart + 0.24);
  } catch {
    // degradar en silencio
  }
}

/* ---------- puertas ---------- */

function badgeLabelFor(estado: AulaEstado, school: ReturnType<typeof readSchoolState>): string {
  if (estado === 'cerrada') return 'Próximamente';
  if (estado === 'off') return 'Disponible';
  if (estado === 'enCurso') return `En curso — ${school.electronica.unidadesCompletadas}/${school.electronica.totalUnidades} unidades`;
  return 'Arco I completado';
}

function buildDoorHtml(a: Aula, estado: AulaEstado, school: ReturnType<typeof readSchoolState>): string {
  const activa = estado !== 'cerrada';
  const badgeLabel = badgeLabelFor(estado, school);
  const claseViva = activa ? 'rx-puerta-viva' : 'rx-puerta-apagada';

  const candado = activa
    ? ''
    : `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="var(--muted)" stroke-width="1.6" style="position:absolute; top:14px; right:14px; opacity:0.85;">
        <rect x="4" y="11" width="16" height="10" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>`;

  const picaporte = activa
    ? `<span style="position:absolute; right:10%; top:50%; width:9px; height:9px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #ffe9a8, var(--accent) 60%, var(--accent-dim)); box-shadow:0 0 8px color-mix(in srgb, var(--accent) 55%, transparent);"></span>`
    : `<span style="position:absolute; right:10%; top:50%; width:8px; height:8px; border-radius:50%; background:var(--border);"></span>`;

  return `
    <div
      class="rx-puerta ${claseViva}"
      data-aula-id="${a.id}"
      data-activa="${activa ? '1' : '0'}"
      role="button"
      tabindex="0"
      aria-label="${a.disciplina} — ${a.nombre}${activa ? '' : ' (próximamente)'}"
      title="${activa ? '' : 'Próximamente'}"
    >
      <div class="rx-puerta-marco">
        <div class="rx-puerta-hoja">
          <div class="rx-puerta-panel rx-puerta-panel-arriba"></div>
          <div class="rx-puerta-panel rx-puerta-panel-abajo"></div>
          ${picaporte}
        </div>
      </div>
      ${candado}
      <div class="rx-puerta-placa">
        <div class="rx-puerta-disciplina">${a.disciplina} — ${a.nombre}</div>
        <div class="rx-puerta-badge ${activa ? 'rx-puerta-badge-activa' : ''}">${badgeLabel}</div>
      </div>
    </div>
  `;
}

function rattleDoor(doorEl: HTMLElement): void {
  if (prefersReducedMotion()) return;
  doorEl.classList.remove('rx-rattle');
  // forzar reflow para poder re-disparar la animación
  void doorEl.offsetWidth;
  doorEl.classList.add('rx-rattle');
  window.setTimeout(() => doorEl.classList.remove('rx-rattle'), 420);
}

/* ---------- shell del aula (overlay full-screen) ---------- */

let overlayEl: HTMLElement | null = null;
let lastFocusedDoor: HTMLElement | null = null;
let scrollYBeforeOpen = 0;

function ensureOverlay(): HTMLElement {
  if (overlayEl) return overlayEl;

  const overlay = document.createElement('div');
  overlay.id = 'aula-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 500; display: none;
    background: var(--bg);
  `;

  overlay.innerHTML = `
    <div id="aula-bg" data-aula="electronica" style="position:absolute; inset:0; background: radial-gradient(ellipse at 50% 30%, #2a2318 0%, #16141c 55%, #0e0d12 100%);">
      <!-- TODO(M3): fondo generado assets/instituto/aula-electronica-fondo-v1.png + hotspots -->
    </div>
    <div style="position:relative; z-index:1; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:24px;">
      <div style="font-family:'IBM Plex Mono', monospace; font-size:12.5px; letter-spacing:0.24em; text-transform:uppercase; color:var(--accent-dim); margin-bottom:18px;">Aula</div>
      <h2 id="aula-titulo" style="font-family:'Spectral', serif; font-weight:600; font-size:clamp(30px,5vw,54px); margin:0 0 20px; color:var(--text);">Aula de Electrónica</h2>
      <p style="font-size:16px; line-height:1.6; color:var(--muted); max-width:520px; margin:0;">
        <!-- TODO(guion): intro del aula (M3) -->
        El aula está tomando forma.
      </p>
    </div>
    <button id="aula-salir" aria-label="Salir del aula" style="
      position:absolute; top:20px; right:20px; z-index:2;
      background: transparent; color: var(--muted); border: 1px solid var(--border);
      border-radius: 9px; padding: 9px 16px; font-family:inherit; font-size:13.5px; font-weight:600;
      cursor:pointer; transition: color 0.15s, border-color 0.15s;
    ">Salir del aula ×</button>
  `;

  document.body.appendChild(overlay);
  overlayEl = overlay;

  overlay.querySelector('#aula-salir')?.addEventListener('click', () => closeAula());

  overlay.addEventListener('keydown', (e) => {
    const ev = e as KeyboardEvent;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      closeAula();
      return;
    }
    if (ev.key === 'Tab') {
      // trap de foco básico: único elemento enfocable es el botón salir
      const btn = overlay.querySelector<HTMLElement>('#aula-salir');
      if (btn) {
        ev.preventDefault();
        btn.focus();
      }
    }
  });

  return overlay;
}

function lockScroll(): void {
  scrollYBeforeOpen = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollYBeforeOpen}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
}

function unlockScroll(): void {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflow = '';
  window.scrollTo(0, scrollYBeforeOpen);
}

interface OpenOptions {
  fromDoorEl?: HTMLElement | null;
  playSound?: boolean;
}

function openAulaDirect(overlay: HTMLElement): void {
  // Entrada directa (carga con hash ya seteado) o reduced-motion: crossfade corto.
  overlay.style.display = 'block';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.2s ease-out';
  lockScroll();
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });
  focusOverlay(overlay);
}

function openAulaWithFlip(overlay: HTMLElement, doorEl: HTMLElement, withSound: boolean): void {
  const rect = doorEl.getBoundingClientRect();

  const clone = doorEl.cloneNode(true) as HTMLElement;
  clone.classList.remove('rx-rattle');
  clone.style.cssText = `
    position: fixed;
    top: ${rect.top}px; left: ${rect.left}px;
    width: ${rect.width}px; height: ${rect.height}px;
    margin: 0; z-index: 600;
    transition: top 0.4s cubic-bezier(0.4,0,0.2,1), left 0.4s cubic-bezier(0.4,0,0.2,1),
                width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1);
    pointer-events: none;
  `;
  document.body.appendChild(clone);

  if (withSound) playDoorOpen(false);

  lockScroll();

  requestAnimationFrame(() => {
    clone.style.top = '0px';
    clone.style.left = '0px';
    clone.style.width = '100vw';
    clone.style.height = '100vh';
  });

  window.setTimeout(() => {
    // Fase 2: bisagra 3D
    const hinge = document.createElement('div');
    hinge.style.cssText = `
      position: fixed; inset: 0; z-index: 601; perspective: 1600px;
      pointer-events: none;
    `;
    const leaf = document.createElement('div');
    leaf.style.cssText = `
      position: absolute; inset: 0; background: var(--panel2);
      border-right: 1px solid var(--border);
      transform-origin: left center;
      transition: transform 0.6s cubic-bezier(0.6,0,0.4,1);
      transform: rotateY(0deg);
    `;
    hinge.appendChild(leaf);
    document.body.appendChild(hinge);

    overlay.style.display = 'block';
    overlay.style.opacity = '1';
    overlay.style.transition = '';

    requestAnimationFrame(() => {
      leaf.style.transform = 'rotateY(-115deg)';
    });

    window.setTimeout(() => {
      hinge.remove();
      clone.remove();
      focusOverlay(overlay);
    }, 650);
  }, 420);
}

function openAula(aulaId: AulaId, opts: OpenOptions = {}): void {
  const overlay = ensureOverlay();
  const titulo = overlay.querySelector('#aula-titulo');
  const bg = overlay.querySelector('#aula-bg');
  const aula = AULAS.find((a) => a.id === aulaId);
  if (titulo && aula) titulo.textContent = `Aula de ${aula.disciplina}`;
  if (bg) bg.setAttribute('data-aula', aulaId);

  lastFocusedDoor = opts.fromDoorEl ?? (document.activeElement as HTMLElement | null);

  if (prefersReducedMotion() || !opts.fromDoorEl) {
    if (opts.playSound && prefersReducedMotion()) playDoorOpen(true);
    openAulaDirect(overlay);
  } else {
    openAulaWithFlip(overlay, opts.fromDoorEl, opts.playSound !== false);
  }

  if (location.hash !== `#aula/${aulaId}`) {
    location.hash = `#aula/${aulaId}`;
  }
}

function focusOverlay(overlay: HTMLElement): void {
  const btn = overlay.querySelector<HTMLElement>('#aula-salir');
  btn?.focus();
}

function closeAula(): void {
  const overlay = overlayEl;
  if (!overlay || overlay.style.display === 'none') return;
  overlay.style.transition = 'opacity 0.2s ease-out';
  overlay.style.opacity = '0';
  window.setTimeout(() => {
    overlay.style.display = 'none';
  }, prefersReducedMotion() ? 0 : 200);
  unlockScroll();

  if (location.hash.startsWith('#aula/')) {
    location.hash = '#aulas';
  }

  lastFocusedDoor?.focus();
}

function isOverlayOpen(): boolean {
  return overlayEl !== null && overlayEl.style.display !== 'none' && overlayEl.style.display !== '';
}

/* ---------- init + router ---------- */

export function initAulas(): void {
  const grid = document.getElementById('aulas-grid');
  if (!grid) return;

  const school = readSchoolState();
  grid.innerHTML = AULAS.map((a) => buildDoorHtml(a, school.aulas[a.id], school)).join('');
  grid.classList.add('rx-aulas-grid');

  grid.querySelectorAll<HTMLElement>('[data-aula-id]').forEach((doorEl) => {
    const activa = doorEl.dataset.activa === '1';
    const aulaId = doorEl.dataset.aulaId as AulaId;

    const activate = () => {
      if (!activa) {
        rattleDoor(doorEl);
        return;
      }
      openAula(aulaId, { fromDoorEl: doorEl, playSound: true });
    };

    doorEl.addEventListener('click', activate);
    doorEl.addEventListener('keydown', (e) => {
      const ev = e as KeyboardEvent;
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        activate();
      }
    });
  });

  ensureOverlay();

  window.addEventListener('hashchange', () => {
    const aulaId = parseAulaHash(location.hash);
    if (aulaId) {
      const estado = readSchoolState().aulas[aulaId];
      if (estado !== 'cerrada') {
        if (!isOverlayOpen()) openAula(aulaId, { playSound: false });
      }
    } else if (isOverlayOpen()) {
      closeAula();
    }
  });

  // Estado inicial desde el hash (carga directa): sin puerta de origen → crossfade.
  const initialAulaId = parseAulaHash(location.hash);
  if (initialAulaId) {
    const estado = readSchoolState().aulas[initialAulaId];
    if (estado !== 'cerrada') {
      openAula(initialAulaId, { playSound: false });
    }
  }
}
