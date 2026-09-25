import {AREAS, getObjective} from './content.js';
import {nextPassage} from './kingdom-geography.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** Guidance describes the current story step and actual exits, never puzzle answers. */
export function journeyGuidance(state) {
  const objective = getObjective(state);
  const exit = nextPassage(state.area, objective.area);
  const locked = !!exit && !(exit.requires || []).every(flag => state.flags?.[flag]);
  const location = AREAS[objective.area]?.name || AREAS[state.area]?.name;
  const direction = exit
    ? locked ? `El paso hacia ${AREAS[exit.target].name} sigue cerrado. Revisá la instalación y las conversaciones de este lugar.`
      : `Buscá el acceso a ${AREAS[exit.target].name}. La marca dorada de la brújula señala ese paso.`
    : objective.object ? 'Tu siguiente encuentro está en esta zona. La marca dorada de la brújula te orienta hacia él.'
      : 'Podés explorar a tu ritmo y volver a conversar con los habitantes.';
  return {...objective, location, direction, locked};
}

export function renderJourneyGuide(state) {
  const guide = journeyGuidance(state);
  return `<div class="eyebrow">TU CUADERNO DE VIAJE</div><h2>Un paso a la vez</h2>
    <p class="modal-intro">Explorá, escuchá y probá. Siempre podés volver a esta guía con <kbd>H</kbd>.</p>
    <section class="guide-current"><span class="eyebrow">AHORA · ${esc(guide.location)}</span><h3>${esc(guide.title)}</h3><p>${esc(guide.detail)}</p><p class="guide-direction">${esc(guide.direction)}</p><button class="primary" data-guide-map>Ubicarme en el mapa <span aria-hidden="true">↗</span></button></section>
    <div class="guide-steps"><section><span class="guide-number">01</span><h3>Recorré el lugar</h3><p>Clic o toque en el suelo para caminar. Acercate a una persona o instalación y elegí la acción que aparece.</p></section><section><span class="guide-number">02</span><h3>Observá lo que cambia</h3><p>${state.flags?.awaken ? 'Junto a una instalación, usá «Mirar con Ohm» para observar y consultar sus lecturas.' : 'Escuchá a los habitantes y buscá las pistas en el entorno. Las conversaciones quedan en tu bitácora.'}</p></section><section><span class="guide-number">03</span><h3>Probá una idea</h3><p>En un banco, leé la consigna, cambiá una cosa y observá el resultado. Compará lo que pasa en el banco con la instalación del mundo.</p></section></div>
    <details class="guide-controls"><summary>Controles y ayudas</summary><dl><div><dt>Caminar</dt><dd><kbd>WASD</kbd> / flechas · clic o toque en el suelo</dd></div><div><dt>Correr</dt><dd><kbd>Shift</kbd> mientras caminás</dd></div><div><dt>Interactuar</dt><dd><kbd>E</kbd> o botón junto al objeto</dd></div><div><dt>Mirar con Ohm</dt><dd><kbd>Q</kbd> cuando la observación esté disponible</dd></div><div><dt>Mapa / bitácora</dt><dd><kbd>M</kbd> / <kbd>J</kbd></dd></div><div><dt>Cerrar / pausa</dt><dd><kbd>Esc</kbd></dd></div></dl></details>
    <footer class="guide-footer"><span>El día avanza con la historia. No hace falta apurarse.</span><button class="quiet" data-guide-journal>Abrir bitácora →</button></footer>`;
}

/** A view switch, not a second scrolling map below the first. */
export function bindMapViews(root) {
  const buttons = [...root.querySelectorAll('[data-map-view]')];
  const activate = (button, focus = false) => {
    for (const item of buttons) {
      const selected = item === button;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      root.querySelector(`#${item.getAttribute('aria-controls')}`).hidden = !selected;
    }
    if (focus) button.focus();
  };
  for (const [index, button] of buttons.entries()) {
    button.onclick = () => activate(button);
    button.onkeydown = event => {
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
        : event.key === 'ArrowRight' ? (index + 1) % buttons.length
          : event.key === 'ArrowLeft' ? (index + buttons.length - 1) % buttons.length : null;
      if (next !== null) { event.preventDefault(); activate(buttons[next], true); }
    };
  }
}
