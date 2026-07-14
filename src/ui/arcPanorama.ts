import { popUI, pushUI } from './overlay.ts';

const MAP_URL = new URL('../../assets/ohmdal/world-map-panel-1024.png', import.meta.url).href;

export const ARC_PANORAMA_ZONES = [
  { id: 'plaza', label: 'Plaza', x: 50, y: 47 },
  { id: 'castillo', label: 'Castillo', x: 38, y: 25 },
  { id: 'forja', label: 'Forja', x: 22, y: 50 },
  { id: 'terrazas', label: 'Terrazas', x: 39, y: 69 },
  { id: 'reloj', label: 'Reloj', x: 63, y: 72 },
  { id: 'faro', label: 'Faro', x: 81, y: 72 },
] as const;

const TRACE_PATHS = [
  'M50 47 L38 25',
  'M50 47 L22 50',
  'M50 47 L39 69',
  'M50 47 L63 72',
  'M63 72 L81 72',
] as const;

/** Muestra la red completa de Ohmdal y continúa una sola vez tras limpiar el overlay. */
export function showArcPanorama(onContinue: () => void): void {
  const previousFocus = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  const timers = new Set<number>();
  let closed = false;

  const root = document.createElement('div');
  root.className = 'arc-panorama-overlay';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'arc-panorama-title');
  root.innerHTML = `
    <section class="arc-panorama-card">
      <h2 id="arc-panorama-title">Ohmdal</h2>
      <div class="arc-panorama-frame">
        <img class="arc-panorama-map" src="${MAP_URL}" alt="" aria-hidden="true" />
        <svg class="arc-panorama-traces" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${TRACE_PATHS.map((path, index) =>
            `<path data-trace="${index}" d="${path}" pathLength="1"></path>`,
          ).join('')}
          <path class="arc-panorama-beam" d="M81 72 L100 55" pathLength="1"></path>
        </svg>
        <div class="arc-panorama-zones" aria-label="Zonas encendidas de Ohmdal">
          ${ARC_PANORAMA_ZONES.map((zone) => `
            <div class="arc-panorama-zone" data-zone="${zone.id}"
              style="--zone-x:${zone.x}%;--zone-y:${zone.y}%">
              <span class="arc-panorama-glow" aria-hidden="true"></span>
              <span class="arc-panorama-label">${zone.label}</span>
            </div>`).join('')}
        </div>
      </div>
      <button type="button" class="arc-panorama-continue">Continuar</button>
    </section>`;

  const finish = (): void => {
    if (closed) return;
    closed = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    window.removeEventListener('keydown', onKeyDown);
    root.remove();
    popUI();
    if (previousFocus?.isConnected) previousFocus.focus();
    onContinue();
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' || event.code === 'KeyE' || event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      finish();
    }
  };

  root.querySelector<HTMLButtonElement>('.arc-panorama-continue')!
    .addEventListener('click', finish, { once: true });
  window.addEventListener('keydown', onKeyDown);
  document.body.appendChild(root);
  pushUI();

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const zones = root.querySelectorAll<HTMLElement>('.arc-panorama-zone');
  const traces = root.querySelectorAll<SVGPathElement>('[data-trace]');

  const activate = (index: number): void => {
    zones[index]?.classList.add('active');
    if (index > 0) traces[index - 1]?.classList.add('active');
    if (ARC_PANORAMA_ZONES[index]?.id === 'faro') {
      root.querySelector('.arc-panorama-beam')?.classList.add('active');
    }
  };

  if (reducedMotion) {
    ARC_PANORAMA_ZONES.forEach((_, index) => activate(index));
    root.classList.add('reduced-motion');
  } else {
    ARC_PANORAMA_ZONES.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        activate(index);
      }, index * 450);
      timers.add(timer);
    });
  }

  root.querySelector<HTMLButtonElement>('.arc-panorama-continue')!.focus();
}
