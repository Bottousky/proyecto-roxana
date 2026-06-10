/* Widgets compartidos por las vistas de banco: Ohm (indicador vivo) y el medidor de aguja. */

export type OhmState = 'inerte' | 'debil' | 'estable' | 'sobrecarga';

export function ohmWidgetHTML(label = 'Ohm'): string {
  return `
    <div class="ohm-widget" data-state="inerte">
      <div class="ohm-body">
        <div class="ohm-eye l"></div>
        <div class="ohm-eye r"></div>
        <div class="ohm-mouth"></div>
      </div>
      <div class="ohm-label">${label}</div>
    </div>`;
}

export function setOhmState(scope: HTMLElement, s: OhmState): void {
  scope.querySelector('.ohm-widget')?.setAttribute('data-state', s);
}

/* ---------- Piedras de Freno (con banda de color = código real de resistencias) ---------- */

export interface PiedraDef {
  nombre: string;
  /** banda de color (código real: marrón=1, rojo=2, amarillo=4, gris=8) */
  color: string;
  valor: number;
  rajada?: boolean;
}

export const PIEDRAS: Record<string, PiedraDef> = {
  marron: { nombre: 'marca marrón', color: '#8b5a2b', valor: 1 },
  roja: { nombre: 'marca roja', color: '#cc3b2e', valor: 2 },
  amarilla: { nombre: 'marca amarilla', color: '#e8c33a', valor: 4 },
  gris: { nombre: 'marca gris', color: '#9a9a9a', valor: 8 },
  rajada: { nombre: 'piedra rajada', color: '#8b5a2b', valor: 1, rajada: true },
};

export function piedraEl(key: string): HTMLElement {
  const def = PIEDRAS[key];
  const div = document.createElement('div');
  div.className = 'piedra' + (def.rajada ? ' rajada' : '');
  div.dataset.key = key;
  div.style.setProperty('--band', def.color);
  div.textContent = def.rajada ? 'rajada' : def.nombre.replace('marca ', '');
  div.title = def.nombre;
  return div;
}

/* ---------- Medidor de aguja (sin números: zonas, no cifras) ---------- */

const G_MIN = 0;
const G_MAX = 6;
const A_MIN = -80;
const A_MAX = 80;

function angleFor(v: number): number {
  const c = Math.max(G_MIN, Math.min(G_MAX, v));
  return A_MIN + ((c - G_MIN) / (G_MAX - G_MIN)) * (A_MAX - A_MIN);
}

function polar(cx: number, cy: number, r: number, aDeg: number): [number, number] {
  const a = (aDeg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

/** Medidor con zona buena marcada alrededor de zoneCenter. */
export function gaugeSVG(zoneCenter = 2, zoneHalf = 0.35): string {
  const cx = 100;
  const cy = 95;
  const zone0 = angleFor(zoneCenter - zoneHalf);
  const zone1 = angleFor(zoneCenter + zoneHalf);
  return `
    <svg viewBox="0 0 200 110" class="gauge" style="max-width:220px">
      <path d="${arcPath(cx, cy, 70, A_MIN, A_MAX)}" stroke="#4a4554" stroke-width="10" fill="none"/>
      <path d="${arcPath(cx, cy, 70, zone0, zone1)}" stroke="#7ec46a" stroke-width="12" fill="none"/>
      <text x="28" y="105" fill="#776f82" font-size="11">poco</text>
      <text x="148" y="105" fill="#776f82" font-size="11">mucho</text>
      <line class="gauge-needle" x1="${cx}" y1="${cy}" x2="${cx}" y2="32"
        stroke="#e8dcc0" stroke-width="4" stroke-linecap="round"
        style="--pivot:${cx}px ${cy}px; transform: rotate(${A_MIN}deg)"/>
      <circle cx="${cx}" cy="${cy}" r="7" fill="#776f82"/>
    </svg>`;
}

export function setGauge(scope: HTMLElement, value: number): void {
  const needle = scope.querySelector<SVGLineElement>('.gauge-needle');
  if (needle) needle.style.transform = `rotate(${angleFor(value)}deg)`;
}
