import { el, pushUI, popUI } from './overlay';
import { resetSave } from '../state';
import { sfxWin } from '../audio';

export interface EndOptions {
  title: string;
  note: string;
  continueLabel: string;
  onContinue: () => void;
}

export function showEnd(opts: EndOptions): void {
  const host = el('end-screen');
  host.classList.remove('hidden');
  pushUI();
  sfxWin();
  host.innerHTML = `
    <div class="title-card">
      <h1>Ω</h1>
      <h2>${opts.title}</h2>
      <p class="note">${opts.note}</p>
      <div class="title-buttons">
        <button id="btn-end-continue">${opts.continueLabel}</button>
        <button id="btn-end-reset">Reiniciar demo</button>
      </div>
    </div>`;
  el('btn-end-continue').addEventListener('click', () => {
    host.classList.add('hidden');
    host.innerHTML = '';
    popUI();
    opts.onContinue();
  });
  el('btn-end-reset').addEventListener('click', () => {
    resetSave();
    location.reload();
  });
}
