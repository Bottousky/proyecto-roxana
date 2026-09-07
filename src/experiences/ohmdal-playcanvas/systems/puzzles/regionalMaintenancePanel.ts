import {
  castleNetworkSignature,
  forgeTerracesConfigurationSignature,
  CASTLE_BRANCH_DEMAND,
  CASTLE_SOURCE_CURRENT_LIMIT,
  FORGE_TERRACES_CONDUCTOR_CAPACITY,
  FORGE_TERRACES_MAX_CURRENT,
  FORGE_TERRACES_MIN_CURRENT,
  LIGHTHOUSE_TARGET_VOLTAGE,
  evaluateLighthouse,
  isLighthouseEmitting,
  type Arc1GreyboxState,
  type CastleBranchId,
  type CastleBranchState,
  type CastleBranchWiring,
  type CastlePriority,
  type ForgeTerracesConductor,
  type ForgeTerracesLoadId,
} from '../campaign/arc1GreyboxModel.ts';

export type RegionPanelKind = 'castle' | 'forge' | 'lighthouse';

export type RegionalMaintenanceAction =
  | {
      readonly type: 'castle-branch';
      readonly id: CastleBranchId;
      readonly patch: Partial<CastleBranchState>;
    }
  | {
      readonly type: 'castle-return';
      readonly connected: boolean;
    }
  | {
      readonly type: 'forge-allocation';
      readonly load: ForgeTerracesLoadId;
      readonly amps: number;
    }
  | {
      readonly type: 'forge-conductor';
      readonly conductor: ForgeTerracesConductor;
    }
  | {
      readonly type: 'forge-protection';
      readonly load: ForgeTerracesLoadId;
      readonly amps: number | null;
    }
  | {
      readonly type: 'lighthouse-trim';
      readonly value: number;
    };

export interface RegionalMaintenancePanelOptions {
  readonly onAction: (action: RegionalMaintenanceAction) => void;
  readonly onClose?: () => void;
}

export interface RegionalMaintenancePanelHandle {
  open(kind: RegionPanelKind, state: Arc1GreyboxState): void;
  refresh(state: Arc1GreyboxState): void;
  close(): void;
  dispose(): void;
  isOpen(): boolean;
}

const CASTLE_BRANCHES: readonly { id: CastleBranchId; label: string }[] = [
  { id: 'district-a', label: 'Distrito A' },
  { id: 'district-b', label: 'Distrito B' },
  { id: 'district-c', label: 'Distrito C' },
];

const CASTLE_WIRINGS: readonly CastleBranchWiring[] = ['isolated', 'parallel', 'series'];
const CASTLE_PRIORITIES: readonly CastlePriority[] = ['essential', 'support', 'sacrificable'];
const CASTLE_FUSES: readonly (number | null)[] = [null, 2, 3, 4, 5, 6];
const FORGE_LOADS: readonly { id: ForgeTerracesLoadId; label: string }[] = [
  { id: 'forge', label: 'Forja' },
  { id: 'terraces', label: 'Terrazas' },
];
const FORGE_CONDUCTORS: readonly ForgeTerracesConductor[] = ['narrow', 'medium', 'wide'];
const FORGE_FUSES: readonly (number | null)[] = [null, 2, 3, 4, 5, 6, 8];
const LIGHTHOUSE_DEFAULT_TRIM = 4;
const LIGHTHOUSE_MIN_TRIM = -12;
const LIGHTHOUSE_MAX_TRIM = 12;

const WIRING_LABELS: Readonly<Record<CastleBranchWiring, string>> = {
  isolated: 'Aislado',
  parallel: 'Paralelo',
  series: 'Serie',
};

const PRIORITY_LABELS: Readonly<Record<CastlePriority, string>> = {
  essential: 'Esencial',
  support: 'Apoyo',
  sacrificable: 'Sacrificable',
};

const CONDUCTOR_LABELS: Readonly<Record<ForgeTerracesConductor, string>> = {
  narrow: 'Estrecho',
  medium: 'Medio',
  wide: 'Ancho',
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function formatAmps(value: number | null): string {
  return value === null ? 'Sin fusible' : `${value} A`;
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}

function appendLabel(parent: HTMLElement, text: string, htmlFor?: string): HTMLLabelElement {
  const label = createElement('label', 'ohmdal-regional-panel__label');
  label.textContent = text;
  if (htmlFor) label.htmlFor = htmlFor;
  parent.appendChild(label);
  return label;
}

function appendOption(select: HTMLSelectElement, value: string, label: string): void {
  const option = createElement('option');
  option.value = value;
  option.textContent = label;
  select.appendChild(option);
}

function latestCastleMeasurement(state: Arc1GreyboxState) {
  return state.castle.measurements[state.castle.measurements.length - 1];
}

function latestForgeMeasurement(state: Arc1GreyboxState) {
  return state.forgeTerraces.measurements[state.forgeTerraces.measurements.length - 1];
}

function latestLighthouseMeasurement(state: Arc1GreyboxState) {
  return state.lighthouse.measurements[state.lighthouse.measurements.length - 1];
}

function appendMeasurementNotice(
  parent: HTMLElement,
  text: string,
  stale: boolean,
): void {
  const notice = createElement('p', 'ohmdal-regional-panel__measurement');
  notice.dataset.kind = stale ? 'stale' : 'observed';
  notice.textContent = text;
  parent.appendChild(notice);
}

function appendSectionTitle(parent: HTMLElement, title: string, description: string): HTMLElement {
  const section = createElement('section', 'ohmdal-regional-panel__section');
  const heading = createElement('h3', 'ohmdal-regional-panel__section-title');
  heading.textContent = title;
  section.appendChild(heading);
  const hint = createElement('p', 'ohmdal-regional-panel__hint');
  hint.textContent = description;
  section.appendChild(hint);
  parent.appendChild(section);
  return section;
}

function createNumberStepper(
  parent: HTMLElement,
  label: string,
  value: number,
  minimum: number,
  maximum: number,
  focusKey: string,
  unit: 'A' | 'V',
  onChange: (value: number) => void,
): void {
  const row = createElement('div', 'ohmdal-regional-panel__stepper-row');
  const text = createElement('span', 'ohmdal-regional-panel__stepper-label');
  text.textContent = label;
  row.appendChild(text);

  const controls = createElement('div', 'ohmdal-regional-panel__stepper-controls');
  const output = createElement('output', 'ohmdal-regional-panel__stepper-value');
  output.dataset.testid = `${focusKey}-value`;
  output.textContent = `${value} ${unit}`;
  output.setAttribute('aria-live', 'polite');
  controls.appendChild(output);

  const createButton = (direction: -1 | 1, symbol: string, accessibleLabel: string): HTMLButtonElement => {
    const button = createElement('button', 'ohmdal-regional-panel__stepper-button');
    button.type = 'button';
    button.textContent = symbol;
    button.setAttribute('aria-label', accessibleLabel);
    button.dataset.focusKey = `${focusKey}-${direction < 0 ? 'down' : 'up'}`;
    button.dataset.testid = `${focusKey}-${direction < 0 ? 'minus' : 'plus'}`;
    button.addEventListener('click', () => {
      onChange(clamp(value + direction, minimum, maximum));
    });
    button.disabled = direction < 0 ? value <= minimum : value >= maximum;
    return button;
  };

  controls.insertBefore(createButton(-1, '−', `Reducir ${label}`), output);
  controls.appendChild(createButton(1, '+', `Aumentar ${label}`));
  row.appendChild(controls);
  parent.appendChild(row);
}

/**
 * Diegetic maintenance close-up shell for the dense regional controls.
 *
 * The panel renders an Arc1 source state and emits physical patches through
 * `onAction`; it never mutates the model or evaluates a solution itself.
 */
export function createRegionalMaintenancePanel(
  host: HTMLElement,
  options: RegionalMaintenancePanelOptions,
): RegionalMaintenancePanelHandle {
  const layer = createElement('div', 'ohmdal-regional-panel');
  layer.dataset.testid = 'regional-maintenance-panel';
  layer.hidden = true;
  layer.setAttribute('aria-hidden', 'true');

  const windowElement = createElement('section', 'ohmdal-regional-panel__window');
  windowElement.setAttribute('role', 'dialog');
  windowElement.setAttribute('aria-modal', 'true');
  windowElement.tabIndex = -1;
  layer.appendChild(windowElement);
  host.appendChild(layer);

  let openState: Arc1GreyboxState | null = null;
  let openKind: RegionPanelKind | null = null;
  let previousFocus: HTMLElement | null = null;
  let disposed = false;

  const getFocusKey = (): string | null => {
    const active = document.activeElement;
    return active instanceof HTMLElement ? active.dataset.focusKey ?? null : null;
  };

  const restoreFocus = (focusKey: string | null): void => {
    if (focusKey) {
      const focusTarget = windowElement.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(focusKey)}"]`);
      focusTarget?.focus({ preventScroll: true });
    }
  };

  const dispatch = (action: RegionalMaintenanceAction): void => {
    if (!disposed) options.onAction(action);
  };

  const createCloseButton = (): HTMLButtonElement => {
    const button = createElement('button', 'ohmdal-regional-panel__close');
    button.type = 'button';
    button.textContent = 'Cerrar panel';
    button.dataset.focusKey = 'close';
    button.dataset.testid = 'regional-maintenance-close';
    button.addEventListener('click', () => requestClose());
    return button;
  };

  const renderCastle = (state: Arc1GreyboxState, body: HTMLElement): void => {
    const section = appendSectionTitle(
      body,
      'Panel de distribución del Castillo',
      `Tres barrios comparten una fuente de ${CASTLE_SOURCE_CURRENT_LIMIT} A. Elige cómo conectarlos y qué servicio debe mantenerse. Después cierra el panel, mide en el embarrado y prueba el interruptor.`,
    );
    for (const branch of CASTLE_BRANCHES) {
      const branchState = state.castle.branches[branch.id];
      const fieldset = createElement('fieldset', 'ohmdal-regional-panel__fieldset');
      const legend = createElement('legend', 'ohmdal-regional-panel__legend');
      legend.textContent = `${branch.label} · demanda ${CASTLE_BRANCH_DEMAND[branch.id]} A`;
      fieldset.appendChild(legend);

      const wiringId = `castle-${branch.id}-wiring`;
      appendLabel(fieldset, 'Cableado', wiringId);
      const wiring = createElement('select', 'ohmdal-regional-panel__select');
      wiring.id = wiringId;
      wiring.dataset.focusKey = wiringId;
      wiring.dataset.testid = wiringId;
      wiring.setAttribute('aria-label', `${branch.label}: cableado`);
      for (const value of CASTLE_WIRINGS) appendOption(wiring, value, WIRING_LABELS[value]);
      wiring.value = branchState.wiring;
      wiring.addEventListener('change', () => {
        const next = wiring.value as CastleBranchWiring;
        if (CASTLE_WIRINGS.includes(next)) dispatch({ type: 'castle-branch', id: branch.id, patch: { wiring: next } });
      });
      fieldset.appendChild(wiring);
      const wiringNote = createElement('p', 'ohmdal-regional-panel__hint');
      wiringNote.textContent = branchState.wiring === 'isolated'
        ? 'Rama desconectada: el barrio queda sin suministro.'
        : branchState.wiring === 'parallel'
          ? 'Derivación propia entre alimentación y retorno.'
          : 'Comparte el trayecto con otras cargas: comprueba qué recibe cada barrio.';
      fieldset.appendChild(wiringNote);

      const priorityId = `castle-${branch.id}-priority`;
      appendLabel(fieldset, 'Prioridad de servicio', priorityId);
      const priority = createElement('select', 'ohmdal-regional-panel__select');
      priority.id = priorityId;
      priority.dataset.focusKey = priorityId;
      priority.dataset.testid = priorityId;
      priority.setAttribute('aria-label', `${branch.label}: prioridad`);
      for (const value of CASTLE_PRIORITIES) appendOption(priority, value, PRIORITY_LABELS[value]);
      priority.value = branchState.priority;
      priority.addEventListener('change', () => {
        const next = priority.value as CastlePriority;
        if (CASTLE_PRIORITIES.includes(next)) dispatch({ type: 'castle-branch', id: branch.id, patch: { priority: next } });
      });
      fieldset.appendChild(priority);

      const protectionId = `castle-${branch.id}-protection`;
      appendLabel(fieldset, 'Fusible de stock', protectionId);
      const protection = createElement('select', 'ohmdal-regional-panel__select');
      protection.id = protectionId;
      protection.dataset.focusKey = protectionId;
      protection.dataset.testid = protectionId;
      protection.setAttribute('aria-label', `${branch.label}: fusible`);
      for (const value of CASTLE_FUSES) appendOption(protection, value === null ? 'none' : String(value), formatAmps(value));
      protection.value = branchState.protectionRating === null ? 'none' : String(branchState.protectionRating);
      protection.addEventListener('change', () => {
        const next = protection.value === 'none' ? null : Number(protection.value);
        if (next === null || CASTLE_FUSES.includes(next)) {
          dispatch({ type: 'castle-branch', id: branch.id, patch: { protectionRating: next } });
        }
      });
      fieldset.appendChild(protection);
      section.appendChild(fieldset);
    }

    const bridgeId = 'castle-return-continuity';
    const bridgeRow = createElement('label', 'ohmdal-regional-panel__check-row');
    const bridge = createElement('input');
    bridge.type = 'checkbox';
    bridge.id = bridgeId;
    bridge.checked = state.castle.returnContinuity;
    bridge.dataset.focusKey = bridgeId;
    bridge.dataset.testid = bridgeId;
    bridge.addEventListener('change', () => dispatch({ type: 'castle-return', connected: bridge.checked }));
    bridgeRow.appendChild(bridge);
    const bridgeText = createElement('span');
    bridgeText.textContent = 'Puente de retorno común conectado';
    bridgeRow.appendChild(bridgeText);
    section.appendChild(bridgeRow);

    const measurement = latestCastleMeasurement(state);
    if (!measurement) {
      appendMeasurementNotice(section, 'Aún no hay una medición real del Castillo.', true);
    } else {
      const stale = measurement.topologySignature !== castleNetworkSignature(state)
        || measurement.returnContinuity !== state.castle.returnContinuity;
      appendMeasurementNotice(
        section,
        `Última lectura: total ${measurement.totalCurrent.toFixed(2)} A · A ${measurement.branchDelivery['district-a'].toFixed(1)} A · B ${measurement.branchDelivery['district-b'].toFixed(1)} A · C ${measurement.branchDelivery['district-c'].toFixed(1)} A. ${stale ? 'La configuración cambió; vuelve a medir.' : 'Corresponde a la configuración actual.'}`,
        stale,
      );
    }
  };

  const renderForge = (state: Arc1GreyboxState, body: HTMLElement): void => {
    const section = appendSectionTitle(
      body,
      'Panel de carga Forja / Terrazas',
      `Ambos turnos piden 5 A, pero comparten ${FORGE_TERRACES_MAX_CURRENT} A. Decide el reparto sin dejar ninguna carga por debajo de su mínimo: Forja ${FORGE_TERRACES_MIN_CURRENT.forge} A · Terrazas ${FORGE_TERRACES_MIN_CURRENT.terraces} A. El conductor soporta la suma; cada fusible protege su rama.`,
    );
    for (const load of FORGE_LOADS) {
      createNumberStepper(
        section,
        `${load.label} · corriente asignada`,
        state.forgeTerraces.allocation[load.id],
        0,
        5,
        `forge-allocation-${load.id}`,
        'A',
        (amps) => dispatch({ type: 'forge-allocation', load: load.id, amps }),
      );

      const protectionId = `forge-protection-${load.id}`;
      appendLabel(section, `${load.label} · fusible`, protectionId);
      const protection = createElement('select', 'ohmdal-regional-panel__select');
      protection.id = protectionId;
      protection.dataset.focusKey = protectionId;
      protection.dataset.testid = protectionId;
      protection.setAttribute('aria-label', `${load.label}: fusible`);
      for (const value of FORGE_FUSES) appendOption(protection, value === null ? 'none' : String(value), formatAmps(value));
      const selected = state.forgeTerraces.protection[load.id];
      protection.value = selected === null ? 'none' : String(selected);
      protection.addEventListener('change', () => {
        const next = protection.value === 'none' ? null : Number(protection.value);
        if (next === null || FORGE_FUSES.includes(next)) dispatch({ type: 'forge-protection', load: load.id, amps: next });
      });
      section.appendChild(protection);
    }

    const conductorId = 'forge-conductor';
    appendLabel(section, 'Conductor de alimentación', conductorId);
    const conductor = createElement('select', 'ohmdal-regional-panel__select');
    conductor.id = conductorId;
    conductor.dataset.focusKey = conductorId;
    conductor.dataset.testid = conductorId;
    conductor.setAttribute('aria-label', 'Conductor de alimentación');
    for (const value of FORGE_CONDUCTORS) {
      appendOption(conductor, value, `${CONDUCTOR_LABELS[value]} · ${FORGE_TERRACES_CONDUCTOR_CAPACITY[value]} A`);
    }
    conductor.value = state.forgeTerraces.conductor;
    conductor.addEventListener('change', () => {
      const next = conductor.value as ForgeTerracesConductor;
      if (FORGE_CONDUCTORS.includes(next)) dispatch({ type: 'forge-conductor', conductor: next });
    });
    section.appendChild(conductor);

    const measurement = latestForgeMeasurement(state);
    if (!measurement) {
      appendMeasurementNotice(section, 'Aún no hay una medición real de Forja / Terrazas.', true);
    } else {
      const stale = measurement.configurationSignature === undefined
        || measurement.configurationSignature !== forgeTerracesConfigurationSignature(state);
      appendMeasurementNotice(
        section,
        `Última lectura: ${measurement.totalCurrent.toFixed(2)} A · ${measurement.totalPower.toFixed(0)} W · índice térmico ${measurement.heat.toFixed(1)} / 24. ${stale ? 'La configuración cambió; vuelve a medir.' : 'Corresponde a la configuración actual.'}`,
        stale,
      );
    }
  };

  const renderLighthouse = (state: Arc1GreyboxState, body: HTMLElement): void => {
    const section = appendSectionTitle(
      body,
      'Panel de calibración del Faro',
      'Ajusta únicamente la referencia de tensión continua de la baliza.',
    );
    const currentTrim = state.lighthouse.calibration?.voltageTrim ?? LIGHTHOUSE_DEFAULT_TRIM;
    createNumberStepper(
      section,
      'Ajuste de referencia DC',
      currentTrim,
      LIGHTHOUSE_MIN_TRIM,
      LIGHTHOUSE_MAX_TRIM,
      'lighthouse-trim',
      'V',
      (value) => dispatch({ type: 'lighthouse-trim', value }),
    );
    const plate = createElement('p', 'ohmdal-regional-panel__plate');
    plate.textContent = `Placa del Faro: ${LIGHTHOUSE_TARGET_VOLTAGE} V DC · ajuste actual: ${currentTrim >= 0 ? '+' : ''}${currentTrim} V`;
    section.appendChild(plate);
    if (!state.lighthouse.calibration) {
      const defaultNotice = createElement('p', 'ohmdal-regional-panel__hint');
      defaultNotice.textContent = 'Sin calibración registrada: ajuste inicial pendiente de contrastar con la placa.';
      section.appendChild(defaultNotice);
    }

    const measurement = latestLighthouseMeasurement(state);
    const evaluation = evaluateLighthouse(state);
    if (!measurement) {
      appendMeasurementNotice(section, 'Aún no hay una medición real del Faro.', true);
    } else {
      appendMeasurementNotice(
        section,
        `Última medición real: ${measurement.sourceVoltage.toFixed(2)} V · ${measurement.sourceCurrent.toFixed(2)} A. ${evaluation.topologyReused && evaluation.powerReused ? 'La lectura corresponde a la red actual.' : 'La red cambió: vuelve a medir en la alimentación.'}`,
        !evaluation.topologyReused || !evaluation.powerReused,
      );
    }
    const points = state.lighthouse.verificationPoints ?? [];
    const status = createElement('p', 'ohmdal-regional-panel__hint');
    status.textContent = `${isLighthouseEmitting(state) ? 'Baliza encendida' : 'Baliza apagada'} · Alimentación: ${points.includes('feed') ? 'verificada' : 'pendiente'} · Baliza: ${points.includes('beacon') ? 'verificada' : 'pendiente'}. ${evaluation.synchronizationValid ? 'Las dos comprobaciones están registradas; puedes documentar el circuito.' : 'Después de energizar, contrasta la lectura en la alimentación y observa la baliza. Recalibrar reinicia ambas comprobaciones.'}`;
    section.appendChild(status);
  };

  function requestClose(): void {
    closePanel(true);
  }

  function render(): void {
    if (!openState || !openKind) return;
    const focusedKey = getFocusKey();
    const scrollTop = windowElement.scrollTop;
    windowElement.replaceChildren();
    const header = createElement('header', 'ohmdal-regional-panel__header');
    const title = createElement('h2', 'ohmdal-regional-panel__title');
    title.id = 'ohmdal-regional-panel-title';
    title.textContent = openKind === 'castle'
      ? 'Mantenimiento · Castillo'
      : openKind === 'forge'
        ? 'Mantenimiento · Forja / Terrazas'
        : 'Mantenimiento · Faro';
    header.appendChild(title);
    header.appendChild(createCloseButton());
    windowElement.setAttribute('aria-labelledby', title.id);
    windowElement.appendChild(header);

    const body = createElement('div', 'ohmdal-regional-panel__body');
    if (openKind === 'castle') renderCastle(openState, body);
    if (openKind === 'forge') renderForge(openState, body);
    if (openKind === 'lighthouse') renderLighthouse(openState, body);
    windowElement.appendChild(body);
    windowElement.scrollTop = scrollTop;
    restoreFocus(focusedKey);
    windowElement.scrollTop = scrollTop;
  }

  function closePanel(notify: boolean): void {
    if (!openKind) return;
    openKind = null;
    openState = null;
    layer.hidden = true;
    layer.setAttribute('aria-hidden', 'true');
    const target = previousFocus;
    previousFocus = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
    if (notify) options.onClose?.();
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && openKind) {
      event.preventDefault();
      requestClose();
      return;
    }
    if (event.key !== 'Tab' || !openKind) return;
    const focusable = Array.from(windowElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => !element.hidden && element.getClientRects().length > 0);
    if (focusable.length === 0) {
      event.preventDefault();
      windowElement.focus({ preventScroll: true });
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  };
  windowElement.addEventListener('keydown', onKeyDown);

  const handle: RegionalMaintenancePanelHandle = {
    open(kind, state) {
      if (disposed) return;
      if (!openKind) previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      openKind = kind;
      openState = state;
      layer.hidden = false;
      layer.setAttribute('aria-hidden', 'false');
      render();
      const closeButton = windowElement.querySelector<HTMLButtonElement>('[data-focus-key="close"]');
      (closeButton ?? windowElement).focus({ preventScroll: true });
    },
    refresh(state) {
      if (disposed) return;
      openState = state;
      if (openKind) render();
    },
    close() {
      closePanel(false);
    },
    dispose() {
      if (disposed) return;
      closePanel(false);
      windowElement.removeEventListener('keydown', onKeyDown);
      layer.remove();
      disposed = true;
    },
    isOpen() {
      return !disposed && openKind !== null;
    },
  };

  return handle;
}
