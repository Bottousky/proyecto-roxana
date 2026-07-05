// Pasillo de Aulas: puertas DOM/CSS/SVG + router de hash + shell de aula (placeholder).
// No importar ./index.ts desde acá (evita import circular).
import aulaBgUrl from '../../assets/instituto/aula-electronica-fondo-v1.png';
import { pizarronViewModel } from './aulaModel.ts';
import { parseAulaHash } from './aulaRouter.ts';
import { startPortalTransition } from './portal.ts';
import { readSchoolState, type AulaId, type AulaEstado } from './schoolModel.ts';

export { parseAulaHash } from './aulaRouter.ts';

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
    creakGain.gain.linearRampToValueAtTime(short ? 0.1 : 0.2, now + creakDur * 0.3);
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
    thunkGain.gain.linearRampToValueAtTime(0.32, thunkStart + 0.015);
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
    : `<svg class="rx-puerta-candado" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <rect x="4" y="11" width="16" height="10" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>`;

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
      <div class="rx-puerta-cartel">${a.disciplina} — ${a.nombre}</div>
      <div class="rx-puerta-marco">
        <div class="rx-puerta-luz" aria-hidden="true"></div>
        <div class="rx-puerta-hoja">
          <div class="rx-puerta-ventana" aria-hidden="true">${a.motif}</div>
          <div class="rx-puerta-panel rx-puerta-panel-a"></div>
          <div class="rx-puerta-panel rx-puerta-panel-b"></div>
          <span class="rx-puerta-picaporte" aria-hidden="true"></span>
        </div>
        ${candado}
      </div>
      <div class="rx-puerta-pie">
        <span class="rx-puerta-badge ${activa ? 'rx-puerta-badge-activa' : ''}">${badgeLabel}</span>
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
let activePizarronPanel: HTMLElement | null = null;
let aulaToastTimer: number | null = null;
let aulaPanX = 0;
// true mientras corre la animación de apertura (el overlay aún puede estar
// display:none): evita que el handler de hashchange haga un segundo open
// directo que pise la transición.
let aulaOpening = false;

function ensureOverlay(): HTMLElement {
  if (overlayEl) return overlayEl;

  const overlay = document.createElement('div');
  overlay.id = 'aula-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 500; display: none;
    background: var(--bg); overflow: hidden;
  `;

  overlay.innerHTML = `
    <div id="aula-bg" class="rx-aula-bg" data-aula="electronica">
      <div class="rx-aula-stage" aria-label="Aula de Electrónica">
        <img class="rx-aula-image" src="${aulaBgUrl}" width="1792" height="1024" alt="" aria-hidden="true" />
        <div class="rx-aula-portal-glow" aria-hidden="true"></div>
        <div class="rx-aula-hotspot rx-aula-hotspot-pizarron" data-hotspot="pizarron" role="button" tabindex="0" aria-label="El pizarrón">
          <div class="rx-pizarron-thumbnail" aria-hidden="true"></div>
          <span class="rx-aula-hotspot-label">El pizarrón</span>
        </div>
        <div class="rx-aula-hotspot rx-aula-hotspot-portal" data-hotspot="portal" role="button" tabindex="0" aria-label="El portal">
          <span class="rx-aula-hotspot-label"><span>El portal</span><small>Cruza.</small></span>
        </div>
        <div class="rx-aula-hotspot rx-aula-hotspot-proyector" data-hotspot="proyector" role="button" tabindex="0" aria-label="El proyector">
          <span class="rx-aula-hotspot-label">El proyector</span>
        </div>
        <p class="rx-aula-entry-line">Huele a cobre y a polvo. Algo, al fondo, todavía respira.</p>
      </div>
    </div>
    <div class="rx-aula-title-sign" aria-live="polite">
      <span class="rx-aula-title-kicker">Instituto Roxana</span>
      <h2 id="aula-titulo" class="rx-aula-title">Aula de Electrónica</h2>
    </div>
    <button id="aula-salir" aria-label="Volver al hall" class="rx-aula-exit" type="button">
      <span class="rx-aula-exit-arrow" aria-hidden="true">←</span>
      <span>Volver al hall</span>
    </button>
    <div id="aula-toast" class="rx-aula-toast" role="status" aria-live="polite"></div>
  `;

  // El root contiene las variables de color del Instituto. Mantener el overlay
  // dentro de él evita que los controles del aula pierdan la paleta compartida.
  (document.getElementById('root') ?? document.body).appendChild(overlay);
  overlayEl = overlay;

  overlay.querySelector('#aula-salir')?.addEventListener('click', () => closeAula());
  bindAulaHotspots(overlay);
  bindAulaPan(overlay);

  overlay.addEventListener('keydown', (e) => {
    const ev = e as KeyboardEvent;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (activePizarronPanel) {
        closePizarronPanel();
      } else {
        closeAula();
      }
      return;
    }
    if (ev.key === 'Tab') {
      trapOverlayFocus(overlay, ev);
    }
  });

  return overlay;
}

function bindAulaHotspots(overlay: HTMLElement): void {
  overlay.querySelectorAll<HTMLElement>('[data-hotspot]').forEach((hotspot) => {
    const activate = () => activateHotspot(hotspot);
    hotspot.addEventListener('click', activate);
    hotspot.addEventListener('focus', () => panStageToHotspot(hotspot));
    hotspot.addEventListener('keydown', (e) => {
      const ev = e as KeyboardEvent;
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        activate();
      }
    });
  });
}

function bindAulaPan(overlay: HTMLElement): void {
  const stage = overlay.querySelector<HTMLElement>('.rx-aula-stage');
  if (!stage) return;

  let pointerId: number | null = null;
  let startX = 0;
  let startPan = 0;

  stage.addEventListener('pointerdown', (e) => {
    const ev = e as PointerEvent;
    if ((ev.target as HTMLElement).closest('[data-hotspot]')) return;
    pointerId = ev.pointerId;
    startX = ev.clientX;
    startPan = aulaPanX;
    stage.setPointerCapture(pointerId);
  });

  stage.addEventListener('pointermove', (e) => {
    const ev = e as PointerEvent;
    if (pointerId !== ev.pointerId) return;
    applyAulaPan(stage, startPan + ev.clientX - startX);
  });

  const release = (e: PointerEvent) => {
    if (pointerId !== e.pointerId) return;
    if (stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId);
    pointerId = null;
  };

  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  // Si el viewport cambia con el aula abierta, re-clampear el pan
  // (evita bandas vacías al pasar de móvil a desktop o rotar).
  window.addEventListener('resize', () => applyAulaPan(stage, aulaPanX));
}

function applyAulaPan(stage: HTMLElement, nextPan: number): void {
  const overflow = Math.max(0, stage.getBoundingClientRect().width - window.innerWidth);
  const limit = overflow / 2;
  aulaPanX = Math.max(-limit, Math.min(limit, nextPan));
  stage.style.transform = `translate(calc(-50% + ${aulaPanX}px), -50%)`;
}

function panStageToHotspot(hotspot: HTMLElement): void {
  const stage = hotspot.closest<HTMLElement>('.rx-aula-stage');
  if (!stage) return;

  const stageRect = stage.getBoundingClientRect();
  const hotspotRect = hotspot.getBoundingClientRect();
  const targetCenter = window.innerWidth / 2;
  const hotspotCenter = hotspotRect.left + hotspotRect.width / 2;
  const needsPan = hotspotRect.left < 12 || hotspotRect.right > window.innerWidth - 12;
  if (!needsPan && stageRect.width <= window.innerWidth + 2) return;

  applyAulaPan(stage, aulaPanX + targetCenter - hotspotCenter);
}

function activateHotspot(hotspot: HTMLElement): void {
  const hotspotId = hotspot.dataset.hotspot;
  if (hotspotId === 'pizarron') {
    openPizarronPanel();
    return;
  }
  if (hotspotId === 'proyector') {
    showAulaToast('La cinta está rebobinada. Pronto habrá función.');
    return;
  }
  if (hotspotId === 'portal') {
    startPortalTransition(hotspot);
  }
}

function openPizarronPanel(): void {
  const overlay = overlayEl;
  if (!overlay || activePizarronPanel) return;

  const vm = pizarronViewModel(readSchoolState());
  const layer = document.createElement('div');
  layer.className = 'rx-pizarron-layer';
  layer.innerHTML = `
    <section class="rx-pizarron-panel" role="dialog" aria-modal="true" aria-labelledby="pizarron-title">
      <button class="rx-pizarron-close" type="button" aria-label="Cerrar">×</button>
      <h3 id="pizarron-title">${vm.titulo}</h3>
      ${pizarronContentHtml(vm)}
    </section>
  `;

  layer.addEventListener('click', (e) => {
    if (e.target === layer) closePizarronPanel();
  });
  layer.querySelector('.rx-pizarron-close')?.addEventListener('click', () => closePizarronPanel());

  overlay.appendChild(layer);
  activePizarronPanel = layer;
  layer.querySelector<HTMLElement>('.rx-pizarron-close')?.focus();
}

function pizarronContentHtml(vm: ReturnType<typeof pizarronViewModel>): string {
  const body = vm.lineas
    ? `<ul class="rx-pizarron-list">${vm.lineas
        .map((linea) => `<li><span class="rx-pizarron-mark">${linea.marca}</span><span>${linea.texto}</span></li>`)
        .join('')}</ul>`
    : `<p class="rx-pizarron-empty">${vm.vacio ?? ''}</p>`;
  const pie = vm.pie ? `<p class="rx-pizarron-foot">${vm.pie}</p>` : '';
  return `${body}${pie}`;
}

function syncPizarronThumbnail(overlay: HTMLElement): void {
  const thumbnail = overlay.querySelector<HTMLElement>('.rx-pizarron-thumbnail');
  if (!thumbnail) return;
  const vm = pizarronViewModel(readSchoolState());
  thumbnail.innerHTML = `<h3>${vm.titulo}</h3>${pizarronContentHtml(vm)}`;
}

function closePizarronPanel(): void {
  const panel = activePizarronPanel;
  if (!panel) return;
  activePizarronPanel = null;
  panel.remove();
  overlayEl?.querySelector<HTMLElement>('[data-hotspot="pizarron"]')?.focus();
}

function showAulaToast(message: string): void {
  const toast = overlayEl?.querySelector<HTMLElement>('#aula-toast');
  if (!toast) return;
  if (aulaToastTimer !== null) window.clearTimeout(aulaToastTimer);
  toast.textContent = message;
  toast.classList.add('rx-aula-toast-visible');
  aulaToastTimer = window.setTimeout(() => {
    toast.classList.remove('rx-aula-toast-visible');
    aulaToastTimer = null;
  }, 2200);
}

function trapOverlayFocus(overlay: HTMLElement, ev: KeyboardEvent): void {
  const root = activePizarronPanel ?? overlay;
  const focusables = Array.from(
    root.querySelectorAll<HTMLElement>('button, [href], [role="button"], [tabindex]:not([tabindex="-1"])'),
  ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

  if (focusables.length === 0) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;

  if (ev.shiftKey && active === first) {
    ev.preventDefault();
    last.focus();
  } else if (!ev.shiftKey && active === last) {
    ev.preventDefault();
    first.focus();
  }
}

function syncAulaState(overlay: HTMLElement): void {
  const school = readSchoolState();
  const bg = overlay.querySelector<HTMLElement>('#aula-bg');
  const stage = overlay.querySelector<HTMLElement>('.rx-aula-stage');
  if (!bg) return;

  if (stage) applyAulaPan(stage, 0);
  syncPizarronThumbnail(overlay);

  bg.classList.toggle('rx-aula-off', school.aulas.electronica === 'off');
  bg.classList.toggle('rx-aula-viva', school.aulas.electronica === 'enCurso' || school.aulas.electronica === 'completada');

  bg.classList.remove('rx-aula-entered');
  void bg.offsetWidth;
  bg.classList.add('rx-aula-entered');

  const titleSign = overlay.querySelector<HTMLElement>('.rx-aula-title-sign');
  titleSign?.classList.remove('rx-aula-title-sign-entered');
  if (titleSign) void titleSign.offsetWidth;
  titleSign?.classList.add('rx-aula-title-sign-entered');
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

function openAulaThroughDoor(overlay: HTMLElement, doorEl: HTMLElement, withSound: boolean): void {
  // Fase 1: la hoja se abre en su propio marco (bisagra 3D en CSS,
  // clase rx-puerta-abriendo) dejando ver la luz del interior.
  aulaOpening = true;
  doorEl.classList.add('rx-puerta-abriendo');
  if (withSound) playDoorOpen(false);
  lockScroll();

  const marco = doorEl.querySelector<HTMLElement>('.rx-puerta-marco') ?? doorEl;

  window.setTimeout(() => {
    // Fase 2: el aula se revela expandiéndose desde el hueco de la puerta
    // (container transform con clip-path) mientras el escenario hace un
    // dolly-in: scale desde el centro de la puerta hacia 1 (sensación de
    // "entrar"). Nada se estira ni deforma.
    const rect = marco.getBoundingClientRect();
    const top = Math.max(0, rect.top);
    const left = Math.max(0, rect.left);
    const right = Math.max(0, window.innerWidth - rect.right);
    const bottom = Math.max(0, window.innerHeight - rect.bottom);

    const bg = overlay.querySelector<HTMLElement>('.rx-aula-bg');
    if (bg) {
      const cx = (((rect.left + rect.right) / 2) / window.innerWidth) * 100;
      const cy = (((rect.top + rect.bottom) / 2) / window.innerHeight) * 100;
      bg.style.transformOrigin = `${cx}% ${cy}%`;
      bg.style.transform = 'scale(1.16)';
      bg.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    overlay.style.display = 'block';
    overlay.style.opacity = '1';
    overlay.style.transition = 'clip-path 0.65s cubic-bezier(0.55, 0, 0.2, 1)';
    overlay.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round 6px)`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.clipPath = 'inset(0px 0px 0px 0px round 0px)';
        if (bg) bg.style.transform = 'scale(1)';
      });
    });

    window.setTimeout(() => {
      overlay.style.clipPath = '';
      overlay.style.transition = '';
      if (bg) {
        bg.style.transform = '';
        bg.style.transition = '';
        bg.style.transformOrigin = '';
      }
      doorEl.classList.remove('rx-puerta-abriendo');
      aulaOpening = false;
      focusOverlay(overlay);
    }, 740);
  }, 430);
}

function openAula(aulaId: AulaId, opts: OpenOptions = {}): void {
  const overlay = ensureOverlay();
  const titulo = overlay.querySelector('#aula-titulo');
  const bg = overlay.querySelector('#aula-bg');
  const aula = AULAS.find((a) => a.id === aulaId);
  if (titulo && aula) titulo.textContent = `Aula de ${aula.disciplina}`;
  if (bg) bg.setAttribute('data-aula', aulaId);
  syncAulaState(overlay);

  lastFocusedDoor = opts.fromDoorEl ?? (document.activeElement as HTMLElement | null);

  if (prefersReducedMotion() || !opts.fromDoorEl) {
    if (opts.playSound && prefersReducedMotion()) playDoorOpen(true);
    openAulaDirect(overlay);
  } else {
    openAulaThroughDoor(overlay, opts.fromDoorEl, opts.playSound !== false);
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
  aulaOpening = false;
  const overlay = overlayEl;
  if (!overlay || overlay.style.display === 'none') return;
  closePizarronPanel();
  if (aulaToastTimer !== null) {
    window.clearTimeout(aulaToastTimer);
    aulaToastTimer = null;
  }
  overlay.querySelector<HTMLElement>('#aula-toast')?.classList.remove('rx-aula-toast-visible');
  overlay.style.transition = 'opacity 0.2s ease-out';
  overlay.style.opacity = '0';
  window.setTimeout(() => {
    overlay.style.display = 'none';
  }, prefersReducedMotion() ? 0 : 200);
  unlockScroll();

  if (location.hash.startsWith('#aula/')) {
    location.hash = '#hall';
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
        // aulaOpening: la apertura animada ya está en curso (overlay todavía
        // display:none) — no pisarla con un open directo.
        if (!isOverlayOpen() && !aulaOpening) openAula(aulaId, { playSound: false });
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
