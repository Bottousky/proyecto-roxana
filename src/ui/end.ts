import { el, pushUI, popUI } from './overlay';
import { getEntries } from '../content/entries';
import { state, resetSave } from '../state';

export function showEnd(): void {
  const host = el('end-screen');
  host.classList.remove('hidden');
  pushUI();
  const entradas = getEntries().length;
  const humo = state.flags.burnedSomething
    ? 'Cosas quemadas: sí. (Así se aprende.)'
    : 'Cosas quemadas: ninguna. (¿En serio nunca probaste qué pasaba?)';
  host.innerHTML = `
    <div class="title-card">
      <h1>Ω</h1>
      <h2>Fin del vertical slice — Unidad 1: «La corriente no es magia»</h2>
      <p class="note">
        Entradas en la Bitácora: ${entradas} · ${humo}<br/><br/>
        La campana sonó. La plaza tiene luz. Y de la campana bajan dos cables…<br/>
        <em>Unidad 2: circuitos con más de un camino.</em>
      </p>
      <div class="title-buttons">
        <button id="btn-end-stay">Seguir explorando</button>
        <button id="btn-end-reset">Reiniciar demo</button>
      </div>
    </div>`;
  el('btn-end-stay').addEventListener('click', () => {
    host.classList.add('hidden');
    host.innerHTML = '';
    popUI();
  });
  el('btn-end-reset').addEventListener('click', () => {
    resetSave();
    location.reload();
  });
}
