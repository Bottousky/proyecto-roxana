// Chrome del mundo: panel superior, HUD, tarjeta de diagnóstico y D-pad táctil.
// Vivía en `labs/ohmdal-hd2d-preprod/index.html`; se muda acá para que el mundo
// pueda montarse dentro de cualquier contenedor que le dé el shell, sin depender de
// identificadores del documento anfitrión (ARC1-007).
//
// Los textos son los mismos, carácter por carácter, que los del HTML anterior.

const STYLE_ID = 'ohmdal-ui-style';

// Estilos del chrome de Ohmdal, con prefijo `.ohmdal-ui`:
// las reglas de página —:root, html, body, #app— siguen siendo del documento, no del mundo.
const LAB_CSS = `
.ohmdal-ui {
  color-scheme: dark;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  color: #f5f0dd;
  width: 100%; height: 100%;
}
.ohmdal-ui * { box-sizing: border-box; }
.ohmdal-ui button, .ohmdal-ui select { font: inherit; }
.ohmdal-ui canvas { display: block; width: 100%; height: 100%; }
.ohmdal-ui .topbar {
  position: fixed; inset: max(10px, env(safe-area-inset-top)) 10px auto 10px;
  z-index: 4; display: flex; flex-wrap: wrap; gap: 7px; align-items: center;
  max-width: min(970px, calc(100vw - 20px)); padding: 9px 11px;
  border: 1px solid #9e815a88; border-radius: 10px;
  background: #171923e8; box-shadow: 0 10px 30px #0008;
}
.ohmdal-ui .topbar h1 { margin: 0 9px 0 0; font-size: 14px; letter-spacing: .06em; }
.ohmdal-ui .topbar label { display: flex; align-items: center; gap: 5px; font-size: 12px; }
.ohmdal-ui .topbar select, .ohmdal-ui .topbar button,
.ohmdal-ui .diagnosis button, .ohmdal-ui .touch button {
  min-height: 34px; border: 1px solid #bd9b69; border-radius: 6px;
  background: #292b37; color: inherit; padding: 5px 9px;
}
.ohmdal-ui select:disabled, .ohmdal-ui button:disabled { opacity: .66; cursor: not-allowed; }
.ohmdal-ui .topbar button:focus-visible, .ohmdal-ui .topbar select:focus-visible,
.ohmdal-ui .diagnosis button:focus-visible, .ohmdal-ui .touch button:focus-visible {
  outline: 3px solid #65d9e8; outline-offset: 2px;
}
.ohmdal-ui .hud {
  position: fixed; z-index: 4; left: 12px; bottom: max(12px, env(safe-area-inset-bottom));
  width: min(390px, calc(100vw - 24px)); padding: 10px 12px;
  border-left: 4px solid #72d7df; border-radius: 5px;
  background: #151721e8; font-size: 13px; line-height: 1.4;
}
.ohmdal-ui .hud strong { color: #8ee8ee; }
.ohmdal-ui .diagnosis {
  position: fixed; z-index: 4; right: 12px; bottom: max(12px, env(safe-area-inset-bottom));
  width: min(330px, calc(100vw - 24px)); padding: 10px 12px;
  border: 1px solid #bd9b69; border-radius: 8px; background: #151721e8;
  font-size: 12px; line-height: 1.4;
}
.ohmdal-ui .diagnosis h2 { margin: 0 0 5px; font-size: 14px; }
.ohmdal-ui .diagnosis p { margin: 5px 0; }
.ohmdal-ui .diagnosis .diagnosis-actions { display: flex; gap: 6px; align-items: center; margin-top: 6px; flex-wrap: wrap; }
.ohmdal-ui .keys {
  position: fixed; z-index: 6; left: 50%; top: 120px; transform: translateX(-50%);
  display: none; width: min(430px, calc(100vw - 24px)); padding: 10px 12px;
  border: 1px solid #bd9b69; border-radius: 8px; background: #151721f5;
  font-size: 12px; line-height: 1.4; color: #f5f0dd;
}
.ohmdal-ui .keys.open { display: block; }
.ohmdal-ui .keys-header { display: flex; align-items: center; gap: 6px; }
.ohmdal-ui .keys-header h2 { margin: 0 auto 0 0; font-size: 14px; }
.ohmdal-ui .keys-rows { display: flex; flex-direction: column; gap: 6px; margin: 8px 0; max-height: 40vh; overflow: auto; }
.ohmdal-ui .keys-row { display: flex; align-items: center; gap: 6px; border: 1px solid #9e815a55; border-radius: 6px; padding: 5px 7px; }
.ohmdal-ui .keys-row .keys-action { width: 80px; flex-shrink: 0; font-weight: 600; }
.ohmdal-ui .keys-row .keys-chips { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; min-width: 0; }
.ohmdal-ui .keys-chip { display: inline-flex; align-items: center; gap: 3px; border: 1px solid #9e815a88; border-radius: 4px; padding: 2px 5px; background: #292b37; }
.ohmdal-ui .keys-chip button { min-height: 0; padding: 0 4px; border: 0; background: none; color: #e08a7b; cursor: pointer; }
.ohmdal-ui .keys-status { margin: 4px 0 0; min-height: 1.4em; color: #8ee8ee; }
.ohmdal-ui .touch { display: none; position: fixed; z-index: 5; right: 12px; bottom: 185px; grid-template: repeat(3, 42px) / repeat(3, 42px); gap: 4px; }
.ohmdal-ui .touch button { padding: 0; touch-action: none; user-select: none; }
.ohmdal-ui .touch [data-move="up"] { grid-area: 1 / 2; }
.ohmdal-ui .touch [data-move="left"] { grid-area: 2 / 1; }
.ohmdal-ui .touch [data-move="right"] { grid-area: 2 / 3; }
.ohmdal-ui .touch [data-move="down"] { grid-area: 3 / 2; }
.ohmdal-ui .touch [data-action="action"] { grid-area: 2 / 2; }
.ohmdal-ui .sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); }
@media (max-width: 720px) {
  .ohmdal-ui .topbar { max-height: 168px; overflow: auto; }
  .ohmdal-ui .topbar h1 { width: 100%; }
  .ohmdal-ui .hud { bottom: 8px; width: calc(100vw - 118px); font-size: 11px; }
  .ohmdal-ui .diagnosis { right: 8px; bottom: 142px; width: calc(100vw - 16px); }
  .ohmdal-ui .touch { display: grid; bottom: 8px; }
}
@media (prefers-reduced-motion: reduce) { .ohmdal-ui * { scroll-behavior: auto !important; } }
`;

// La hoja se comparte entre montajes simultáneos y se retira cuando se va el último:
// `ARC1-008` mide ciclos mount→destroy repetidos y un <style> por ciclo sería una fuga.
let styleUsers = 0;

function acquireStyle(): void {
  styleUsers += 1;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = LAB_CSS;
  document.head.append(style);
}

function releaseStyle(): void {
  styleUsers = Math.max(0, styleUsers - 1);
  if (styleUsers > 0) return;
  document.getElementById(STYLE_ID)?.remove();
}

export interface OhmdalUi {
  /** Raíz del mundo dentro del contenedor. El canvas se agrega acá. */
  readonly root: HTMLDivElement;
  readonly timeToggle: HTMLButtonElement;
  readonly routeToggle: HTMLButtonElement;
  readonly reducedMotion: HTMLInputElement;
  readonly diagnosisNext: HTMLButtonElement;
  readonly zoneLabel: HTMLElement;
  readonly statusLabel: HTMLElement;
  readonly metricsLabel: HTMLElement;
  readonly diagnosisLabel: HTMLElement;
  readonly moveButtons: readonly HTMLButtonElement[];
  readonly actionButton: HTMLButtonElement;
  readonly keysToggle: HTMLButtonElement;
  readonly keysClose: HTMLButtonElement;
  readonly keysReset: HTMLButtonElement;
  readonly keysRows: HTMLElement;
  readonly keysStatus: HTMLElement;
  readonly keysPanel: HTMLElement;
  isKeysOpen(): boolean;
  setKeysOpen(open: boolean): void;
  setKeysStatus(text: string): void;
  dispose(): void;
}

function button(id: string, text: string): HTMLButtonElement {
  const element = document.createElement('button');
  element.id = id;
  element.type = 'button';
  element.textContent = text;
  return element;
}

function lockedSelect(id: string, value: string, label: string): HTMLSelectElement {
  const select = document.createElement('select');
  select.id = id;
  select.disabled = true;
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  select.append(option);
  return select;
}

function labelled(text: string, control: HTMLElement): HTMLLabelElement {
  const label = document.createElement('label');
  label.append(text, control);
  return label;
}

export function createOhmdalUi(container: HTMLElement): OhmdalUi {
  acquireStyle();

  const root = document.createElement('div');
  root.className = 'ohmdal-ui';

  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.setAttribute('aria-label', 'Comparativas del mundo');
  const heading = document.createElement('h1');
  heading.textContent = 'OHMDAL · en obra';
  const cameraSelect = lockedSelect('camera-variant', 'quasi-orthographic', 'Casi ortográfica · elegida');
  const directionSelect = lockedSelect('direction-variant', '4', '4 direcciones · elegida');
  const ohmSelect = lockedSelect('ohm-variant', 'sprite', 'Sprite · elegido');
  const timeToggle = button('time-toggle', 'Crepúsculo');
  const routeToggle = button('route-toggle', 'Recorrido automático');
  const reducedMotion = document.createElement('input');
  reducedMotion.id = 'reduced-motion';
  reducedMotion.type = 'checkbox';
  const reducedMotionLabel = document.createElement('label');
  reducedMotionLabel.append(reducedMotion, ' Reducir movimiento');
  topbar.append(
    heading,
    labelled('Cámara', cameraSelect),
    labelled('Estudiante', directionSelect),
    labelled('Ohm', ohmSelect),
    timeToggle,
    routeToggle,
    reducedMotionLabel,
  );

  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.setAttribute('role', 'status');
  hud.setAttribute('aria-live', 'polite');
  const zoneLabel = document.createElement('strong');
  zoneLabel.id = 'zone-label';
  zoneLabel.textContent = 'Portal';
  const statusLabel = document.createElement('span');
  statusLabel.id = 'status-label';
  statusLabel.textContent = 'WASD o flechas para recorrer.';
  const metricsLabel = document.createElement('span');
  metricsLabel.id = 'metrics-label';
  hud.append(zoneLabel, document.createElement('br'), statusLabel, document.createElement('br'), metricsLabel);

  const diagnosis = document.createElement('section');
  diagnosis.className = 'diagnosis';
  diagnosis.setAttribute('aria-labelledby', 'diagnosis-title');
  const diagnosisTitle = document.createElement('h2');
  diagnosisTitle.id = 'diagnosis-title';
  diagnosisTitle.textContent = 'Diagnóstico protegido de Lumen';
  const diagnosisLabel = document.createElement('p');
  diagnosisLabel.id = 'diagnosis-label';
  diagnosisLabel.textContent = 'Acercate al Taller para comenzar. La prueba nunca bloquea el recorrido.';
  const diagnosisNext = button('diagnosis-next', 'Siguiente acción segura');
  diagnosisNext.disabled = true;
  const diagnosisActions = document.createElement('div');
  diagnosisActions.className = 'diagnosis-actions';
  const keysToggle = button('keys-toggle', 'Teclas');
  keysToggle.setAttribute('aria-expanded', 'false');
  keysToggle.setAttribute('aria-controls', 'keys-panel');
  diagnosisActions.append(diagnosisNext, keysToggle);
  diagnosis.append(diagnosisTitle, diagnosisLabel, diagnosisActions);

  const keysPanel = document.createElement('section');
  keysPanel.className = 'keys';
  keysPanel.id = 'keys-panel';
  keysPanel.setAttribute('aria-labelledby', 'keys-title');
  const keysHeader = document.createElement('div');
  keysHeader.className = 'keys-header';
  const keysTitle = document.createElement('h2');
  keysTitle.id = 'keys-title';
  keysTitle.textContent = 'Teclas';
  const keysReset = button('keys-reset', 'Restablecer');
  const keysClose = button('keys-close', 'Cerrar');
  keysHeader.append(keysTitle, keysReset, keysClose);
  const keysRows = document.createElement('div');
  keysRows.className = 'keys-rows';
  const keysStatus = document.createElement('p');
  keysStatus.className = 'keys-status';
  keysStatus.id = 'keys-status';
  keysStatus.textContent = 'Elegí una acción y apretá «Cambiar» para reasignar la próxima tecla.';
  keysPanel.append(keysHeader, keysRows, keysStatus);

  const touch = document.createElement('div');
  touch.className = 'touch';
  touch.setAttribute('aria-label', 'Movimiento táctil');
  const moveButtons = (
    [
      ['up', 'Mover hacia arriba', '▲'],
      ['left', 'Mover hacia la izquierda', '◀'],
      ['right', 'Mover hacia la derecha', '▶'],
      ['down', 'Mover hacia abajo', '▼'],
    ] as const
  ).map(([move, ariaLabel, glyph]) => {
    const element = document.createElement('button');
    element.type = 'button';
    element.dataset.move = move;
    element.setAttribute('aria-label', ariaLabel);
    element.textContent = glyph;
    touch.append(element);
    return element;
  });
  const actionButton = document.createElement('button');
  actionButton.type = 'button';
  actionButton.dataset.action = 'action';
  actionButton.setAttribute('aria-label', 'Activar acción');
  actionButton.textContent = '●';
  touch.append(actionButton);

  const controlsHelp = document.createElement('p');
  controlsHelp.className = 'sr-only';
  controlsHelp.id = 'controls-help';
  controlsHelp.textContent = 'El recorrido también funciona con W A S D o teclas de dirección.';

  root.append(topbar, hud, diagnosis, keysPanel, touch, controlsHelp);
  container.append(root);

  return {
    root,
    timeToggle,
    routeToggle,
    reducedMotion,
    diagnosisNext,
    zoneLabel,
    statusLabel,
    metricsLabel,
    diagnosisLabel,
    moveButtons,
    actionButton,
    keysToggle,
    keysClose,
    keysReset,
    keysRows,
    keysStatus,
    keysPanel,
    isKeysOpen(): boolean {
      return keysPanel.classList.contains('open');
    },
    setKeysOpen(open: boolean): void {
      keysPanel.classList.toggle('open', open);
      keysToggle.setAttribute('aria-expanded', String(open));
    },
    setKeysStatus(text: string): void {
      keysStatus.textContent = text;
    },
    dispose() {
      root.remove();
      releaseStyle();
    },
  };
}
