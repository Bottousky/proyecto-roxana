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

/* ---------- Estanque y reloj de simulación U5 ---------- */

const TANK_INNER_TOP = 20;
const TANK_INNER_HEIGHT = 104;

/** Estanque reutilizable con un nivel visible que ocupa de 0 a 100%. */
export function tankSVG(): string {
  return `
    <svg viewBox="0 0 160 150" class="tank" data-level="0"
      role="img" aria-label="Estanque: vacío">
      <path d="M30 14 V124 Q30 140 46 140 H114 Q130 140 130 124 V14"
        fill="#211e29" stroke="#a2673f" stroke-width="6" stroke-linecap="round"/>
      <rect class="tank-level" x="36" y="${TANK_INNER_TOP + TANK_INNER_HEIGHT}"
        width="88" height="0" rx="4" fill="#e8c33a"/>
      <path d="M30 14 H130" stroke="#c58a59" stroke-width="6" stroke-linecap="round"/>
      <text class="tank-label" x="80" y="146" text-anchor="middle"
        fill="#a99" font-size="12">vacío</text>
    </svg>`;
}

/** Actualiza el primer Estanque contenido en scope y acota el nivel a 0..100. */
export function setTankLevel(scope: HTMLElement, pct: number): void {
  const tank = scope.querySelector<SVGSVGElement>('.tank');
  if (!tank) return;
  const level = Math.min(100, Math.max(0, Number.isFinite(pct) ? pct : 0));
  const height = (level / 100) * TANK_INNER_HEIGHT;
  const fill = tank.querySelector<SVGRectElement>('.tank-level');
  const label = tank.querySelector<SVGTextElement>('.tank-label');
  const levelLabel = level <= 0 ? 'vacío' : level >= 100 ? 'lleno' : `${Math.round(level)}%`;
  tank.dataset.level = String(level);
  tank.setAttribute('aria-label', `Estanque: ${levelLabel}`);
  fill?.setAttribute('y', String(TANK_INNER_TOP + TANK_INNER_HEIGHT - height));
  fill?.setAttribute('height', String(height));
  if (label) label.textContent = levelLabel;
}

export interface SimTickHandle {
  stop(): void;
}

/**
 * Reloj por frame para bancos animados. stop() es idempotente y también evita
 * reprogramar un frame si se invoca desde onFrame.
 */
export function createSimTick(onFrame: (dtMs: number) => void): SimTickHandle {
  let running = true;
  let frameId = 0;
  let previousTime: number | null = null;

  const frame = (time: number) => {
    if (!running) return;
    const dtMs = previousTime === null ? 0 : Math.max(0, time - previousTime);
    previousTime = time;
    onFrame(dtMs);
    if (running) frameId = requestAnimationFrame(frame);
  };

  frameId = requestAnimationFrame(frame);

  return {
    stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frameId);
    },
  };
}

/* ---------- Calor y grosor de canales ---------- */

export type HeatLevel = 'frio' | 'tibio' | 'caliente' | 'rojo';

export const CHANNEL_TOLERANCES = {
  angosto: 2,
  medio: 4,
  ancho: 8,
} as const;

export type ChannelThickness = keyof typeof CHANNEL_TOLERANCES;

/** Bandas canónicas de U3 §A.3. Los bordes pertenecen a la banda inferior. */
export function heatLevel(rio: number, tolerancia: number): HeatLevel {
  if (rio <= tolerancia / 2) return 'frio';
  if (rio <= tolerancia) return 'tibio';
  if (rio <= tolerancia * 1.5) return 'caliente';
  return 'rojo';
}

const THERMOMETER_LEVELS: Record<
  HeatLevel,
  { label: string; color: string; y: number; height: number }
> = {
  frio: { label: 'frío', color: '#72b8d4', y: 72, height: 16 },
  tibio: { label: 'tibio', color: '#d6a84a', y: 56, height: 32 },
  caliente: { label: 'caliente', color: '#e77832', y: 40, height: 48 },
  rojo: { label: 'al rojo', color: '#ff3f2f', y: 22, height: 66 },
};

/** Termómetro cualitativo: solo muestra bandas de calor, nunca cifras. */
export function thermometerSVG(level: HeatLevel = 'frio'): string {
  const visual = THERMOMETER_LEVELS[level];
  return `
    <svg viewBox="0 0 110 130" class="channel-thermometer" data-level="${level}"
      role="img" aria-label="Termómetro de canal: ${visual.label}">
      <rect x="43" y="14" width="24" height="82" rx="12" fill="#27232e" stroke="#746c7f" stroke-width="4"/>
      <rect class="thermometer-fill" x="49" y="${visual.y}" width="12" height="${visual.height}"
        rx="6" fill="${visual.color}"/>
      <circle class="thermometer-bulb" cx="55" cy="101" r="20" fill="${visual.color}"
        stroke="#746c7f" stroke-width="4"/>
      <text class="thermometer-label" x="55" y="128" text-anchor="middle"
        fill="${visual.color}" font-size="13">${visual.label}</text>
    </svg>`;
}

export function setThermometer(scope: HTMLElement, level: HeatLevel): void {
  const thermometer = scope.querySelector<SVGSVGElement>('.channel-thermometer');
  if (!thermometer) return;
  const visual = THERMOMETER_LEVELS[level];
  const fill = thermometer.querySelector<SVGRectElement>('.thermometer-fill');
  const bulb = thermometer.querySelector<SVGCircleElement>('.thermometer-bulb');
  const label = thermometer.querySelector<SVGTextElement>('.thermometer-label');
  thermometer.dataset.level = level;
  thermometer.setAttribute('aria-label', `Termómetro de canal: ${visual.label}`);
  fill?.setAttribute('y', String(visual.y));
  fill?.setAttribute('height', String(visual.height));
  fill?.setAttribute('fill', visual.color);
  bulb?.setAttribute('fill', visual.color);
  if (label) {
    label.textContent = visual.label;
    label.setAttribute('fill', visual.color);
  }
}

/* ---------- Piezas de topología U2 ---------- */

export interface LlaveTramoHandle {
  element: HTMLButtonElement;
  isClosed(): boolean;
  setClosed(closed: boolean): void;
}

/** Interruptor reutilizable para abrir o cerrar un tramo del banco. */
export function llaveTramo(
  label: string,
  initialClosed: boolean,
  onChange: (closed: boolean) => void,
): LlaveTramoHandle {
  let closed = initialClosed;
  const button = document.createElement('button');
  button.className = 'tramo-switch';

  const render = () => {
    button.classList.toggle('closed', closed);
    button.classList.toggle('open', !closed);
    button.setAttribute('aria-pressed', String(closed));
    button.innerHTML = `
      <span class="tramo-switch-name">${label}</span>
      <span class="tramo-switch-state">${closed ? 'cerrado' : 'abierto'}</span>`;
  };

  button.addEventListener('click', () => {
    closed = !closed;
    render();
    onChange(closed);
  });
  render();

  return {
    element: button,
    isClosed: () => closed,
    setClosed(next: boolean) {
      closed = next;
      render();
    },
  };
}

export interface OhmProbeTramo {
  id: string;
  label: string;
}

export interface OhmProbeHandle {
  element: HTMLElement;
  clear(): void;
  select(id: string): void;
}

/**
 * Puntos de medición para llamar a Ohm. Solo un tramo queda activo a la vez.
 * El consumidor entrega bench.setStatus mediante `report`.
 */
export function ohmProbe(
  tramos: OhmProbeTramo[],
  getRio: (id: string) => string,
  report: (rio: string, tramo: OhmProbeTramo) => void,
): OhmProbeHandle {
  const root = document.createElement('div');
  root.className = 'ohm-probes';
  const buttons = new Map<string, HTMLButtonElement>();

  const select = (id: string) => {
    for (const [buttonId, button] of buttons) {
      button.classList.toggle('active', buttonId === id);
    }
  };

  for (const tramo of tramos) {
    const button = document.createElement('button');
    button.className = 'ohm-probe';
    button.innerHTML = `<span class="ohm-probe-marker">Ω</span>${tramo.label}`;
    button.addEventListener('click', () => {
      select(tramo.id);
      report(getRio(tramo.id), tramo);
    });
    buttons.set(tramo.id, button);
    root.appendChild(button);
  }

  return {
    element: root,
    clear: () => select(''),
    select,
  };
}

export interface OhmArmsPair<Id extends string = string> {
  id: Id;
  label: string;
  from: string;
  to: string;
}

export interface OhmArmsHandle<Id extends string = string> {
  element: HTMLElement;
  clear(): void;
  select(id: Id): void;
}

/**
 * Trechos de medición para Ohm con los brazos abiertos. Cada botón representa
 * un par de puntos y solo un trecho queda activo a la vez.
 */
export function ohmArms<Id extends string>(
  pairs: readonly OhmArmsPair<Id>[],
  getEscalon: (from: string, to: string, pair: OhmArmsPair<Id>) => string,
  report: (escalon: string, pair: OhmArmsPair<Id>) => void,
): OhmArmsHandle<Id> {
  const root = document.createElement('div');
  root.className = 'ohm-arms';
  const buttons = new Map<Id, HTMLButtonElement>();

  const select = (id: Id | null) => {
    for (const [buttonId, button] of buttons) {
      button.classList.toggle('active', buttonId === id);
    }
  };

  for (const pair of pairs) {
    const button = document.createElement('button');
    button.className = 'ohm-arm';
    button.innerHTML = `<span class="ohm-arm-marker">↔</span>${pair.label}`;
    button.addEventListener('click', () => {
      select(pair.id);
      report(getEscalon(pair.from, pair.to, pair), pair);
    });
    buttons.set(pair.id, button);
    root.appendChild(button);
  }

  return {
    element: root,
    clear: () => select(null),
    select,
  };
}

export interface FuseState {
  overloads: number;
  burned: boolean;
}

export type FuseResult = 'ok' | 'warning' | 'burned';

export interface InsistenceState {
  insistences: number;
  failed: boolean;
}

export function advanceInsistence(state: InsistenceState, active: boolean): InsistenceState {
  if (state.failed || !active) return state;
  const insistences = state.insistences + 1;
  return { insistences, failed: insistences >= 3 };
}

export function advanceFuse(state: FuseState, value: number, threshold: number): FuseState {
  const next = advanceInsistence(
    { insistences: state.overloads, failed: state.burned },
    value > threshold,
  );
  return { overloads: next.insistences, burned: next.failed };
}

export interface FusibleHandle {
  element: HTMLElement;
  state(): FuseState;
  setValue(value: number): FuseResult;
  reset(): void;
}

interface FailureStrip {
  root: HTMLElement;
  green: HTMLElement;
  fill: HTMLElement;
  mark: HTMLElement;
  status: HTMLElement;
}

function failureStrip(
  rootClass: string,
  heading: string,
  marker: string,
  initialStatus: string,
): FailureStrip {
  const root = document.createElement('div');
  root.className = rootClass;
  root.innerHTML = `
    <div class="fuse-heading">
      <span>${heading}</span>
      <span class="fuse-threshold">${marker}</span>
    </div>
    <div class="fuse-scale">
      <div class="fuse-green"></div>
      <div class="fuse-fill"></div>
      <div class="fuse-mark"></div>
    </div>
    <div class="fuse-status">${initialStatus}</div>`;
  return {
    root,
    green: root.querySelector<HTMLElement>('.fuse-green')!,
    fill: root.querySelector<HTMLElement>('.fuse-fill')!,
    mark: root.querySelector<HTMLElement>('.fuse-mark')!,
    status: root.querySelector<HTMLElement>('.fuse-status')!,
  };
}

/**
 * Fusible con tolerancia y umbral visibles. Cada evaluación sobre el umbral
 * cuenta como una insistencia; a la tercera, el fusible se inmola.
 */
export function fusible(
  threshold: number,
  maxValue = threshold * 1.5,
  onBurn?: () => void,
): FusibleHandle {
  let fuseState: FuseState = { overloads: 0, burned: false };
  const { root, green, fill, mark, status } = failureStrip(
    'fuse',
    'Fusible',
    `umbral: ${threshold}`,
    'tolerancia disponible',
  );
  const thresholdPct = Math.min(100, (threshold / maxValue) * 100);
  green.style.width = `${thresholdPct}%`;
  mark.style.left = `${thresholdPct}%`;

  const renderValue = (value: number) => {
    fill.style.width = `${Math.min(100, Math.max(0, (value / maxValue) * 100))}%`;
  };

  const reset = () => {
    fuseState = { overloads: 0, burned: false };
    root.classList.remove('warning', 'burned');
    status.textContent = 'tolerancia disponible';
    renderValue(0);
  };

  return {
    element: root,
    state: () => ({ ...fuseState }),
    setValue(value: number) {
      renderValue(value);
      if (fuseState.burned) return 'burned';
      if (value <= threshold) {
        root.classList.remove('warning');
        status.textContent = 'dentro de tolerancia';
        return 'ok';
      }

      fuseState = advanceFuse(fuseState, value, threshold);
      if (fuseState.burned) {
        root.classList.remove('warning');
        root.classList.add('burned');
        status.textContent = 'se inmoló';
        onBurn?.();
        return 'burned';
      }

      root.classList.add('warning');
      status.textContent = `aviso ${fuseState.overloads} de 3`;
      return 'warning';
    },
    reset,
  };
}

/* ---------- Canales reparables ---------- */

export interface ChannelCutState {
  insistences: number;
  cut: boolean;
}

export type ChannelCutResult = 'ok' | 'warning' | 'cut';

export function advanceChannelCut(state: ChannelCutState, level: HeatLevel): ChannelCutState {
  const next = advanceInsistence(
    { insistences: state.insistences, failed: state.cut },
    level === 'rojo',
  );
  return { insistences: next.insistences, cut: next.failed };
}

export interface BreakableChannelHandle {
  element: HTMLElement;
  state(): ChannelCutState;
  setLevel(level: HeatLevel): ChannelCutResult;
  reset(): void;
}

/**
 * Canal reparable. El consumidor decide cómo se reempalma y llama reset()
 * desde su acción diegética; el widget administra aviso, vibración y corte.
 */
export function canalCortable(
  label = 'Canal',
  onCut?: () => void,
): BreakableChannelHandle {
  let channelState: ChannelCutState = { insistences: 0, cut: false };
  const { root, green, fill, mark, status } = failureStrip(
    'breakable-channel',
    label,
    'límite: al rojo',
    'canal continuo',
  );
  green.style.width = '75%';
  mark.style.left = '75%';

  const fillByLevel: Record<HeatLevel, number> = {
    frio: 25,
    tibio: 50,
    caliente: 75,
    rojo: 100,
  };

  const reset = () => {
    channelState = { insistences: 0, cut: false };
    root.classList.remove('warning', 'cut');
    status.textContent = 'canal continuo';
    fill.style.width = '0%';
  };

  return {
    element: root,
    state: () => ({ ...channelState }),
    setLevel(level: HeatLevel) {
      fill.style.width = `${fillByLevel[level]}%`;
      if (channelState.cut) return 'cut';
      if (level !== 'rojo') {
        root.classList.remove('warning');
        status.textContent = 'canal estable';
        return 'ok';
      }

      channelState = advanceChannelCut(channelState, level);
      if (channelState.cut) {
        root.classList.remove('warning');
        root.classList.add('cut');
        status.textContent = 'canal cortado';
        onCut?.();
        return 'cut';
      }

      root.classList.add('warning');
      status.textContent = `vibra · aviso ${channelState.insistences} de 3`;
      return 'warning';
    },
    reset,
  };
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

function angleFor(v: number, maxValue = G_MAX): number {
  const max = Math.max(1, maxValue);
  const c = Math.max(G_MIN, Math.min(max, v));
  return A_MIN + ((c - G_MIN) / (max - G_MIN)) * (A_MAX - A_MIN);
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
export function gaugeSVG(zoneCenter = 2, zoneHalf = 0.35, maxValue = G_MAX): string {
  const cx = 100;
  const cy = 95;
  const zone0 = angleFor(zoneCenter - zoneHalf, maxValue);
  const zone1 = angleFor(zoneCenter + zoneHalf, maxValue);
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

export function setGauge(scope: HTMLElement, value: number, maxValue = G_MAX): void {
  const needle = scope.querySelector<SVGLineElement>('.gauge-needle');
  if (needle) needle.style.transform = `rotate(${angleFor(value, maxValue)}deg)`;
}
