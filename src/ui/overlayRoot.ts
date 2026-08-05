// Los overlays DOM del juego —diálogo, banco, Bitácora, toast— construidos desde código.
//
// Vivían sólo en el HTML de `/jugar`, así que cualquier otra página que montara Ohmdal
// reventaba en el primer `say()` con «Falta el elemento #dialog». El mundo HD-2D necesita
// exactamente los mismos overlays: el contenido del Arco I es el mismo y su UI también.
//
// `/jugar` los trae en su HTML y ahí esto no hace nada: si `#dialog` ya existe, se sale.
// Esa duplicación es deuda conocida y se cierra sola cuando `/jugar` se retire; hasta
// entonces el HTML manda donde existe, para no tocar la base de regresión.
//
// La hoja de estilos la carga la página, no este módulo: `overlay.ts` está en la cadena de
// importación de media docena de tests que corren en Node, y Node no sabe leer un `.css`.

const OVERLAY_MARKUP = `
<div id="hud">
  <button id="ohm-companion-btn" class="hidden" title="Consultar a Ohm (O)" aria-label="Consultar a Ohm" data-key="O" tabindex="-1">
    <img id="ohm-companion-portrait" alt="Ohm" />
    <span class="ohm-companion-signal" aria-hidden="true"></span>
  </button>
  <button id="audio-btn" title="Sonido (V)" data-key="V" tabindex="-1">🔊</button>
  <button id="bitacora-btn" class="hidden" title="Bitácora (B)" data-key="B" tabindex="-1">✒<span id="bitacora-dot" class="hidden"></span></button>
</div>

<div id="prompt" class="hidden"></div>

<div id="dialog" class="hidden">
  <div id="dialog-portrait">
    <img id="dialog-portrait-image" alt="" />
  </div>
  <div id="dialog-copy">
    <div id="dialog-who"></div>
    <div id="dialog-text"></div>
  </div>
  <div id="dialog-next">▼</div>
</div>

<div id="toast" class="hidden"></div>

<div id="bench" class="hidden"></div>

<div id="bitacora" class="hidden"></div>

<div id="end-screen" class="hidden"></div>
`;

let ensured = false;

/**
 * Garantiza que existan los overlays del juego. Idempotente y barata: la primera llamada
 * decide, las siguientes no tocan el DOM.
 */
export function ensureGameOverlays(): void {
  if (ensured) return;
  ensured = true;
  // `/jugar` ya los declara en su index.html. Su HTML gana.
  if (document.getElementById('dialog')) return;
  const host = document.createElement('div');
  host.id = 'roxana-overlays';
  host.innerHTML = OVERLAY_MARKUP;
  document.body.append(host);
}

/** Sólo para tests: vuelve a permitir la construcción. */
export function resetGameOverlaysForTest(): void {
  ensured = false;
  document.getElementById('roxana-overlays')?.remove();
}
