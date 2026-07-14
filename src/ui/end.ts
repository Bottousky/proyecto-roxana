import { el, pushUI, popUI } from './overlay';
import { resetSave } from '../state';
import { sfxWin } from '../audio';

export interface EndOptions {
  title: string;
  note: string;
  continueLabel: string;
  onContinue: () => void;
  variant?: 'arc';
}

export function showEnd(opts: EndOptions): void {
  const host = el('end-screen');
  host.classList.remove('hidden');
  pushUI();
  sfxWin();
  host.innerHTML = `
    <div class="title-card${opts.variant === 'arc' ? ' arc-final' : ''}">
      <h1>Ω</h1>
      <h2>${opts.title}</h2>
      <p class="note">${opts.note}</p>
      <div class="title-buttons">
        <button id="btn-end-continue">${opts.continueLabel}</button>
        <button id="btn-end-reset">Reiniciar demo</button>
        <button id="btn-home">← Volver a la web</button>
      </div>
    </div>`;
  const continueButton = el<HTMLButtonElement>('btn-end-continue');
  const resetButton = el<HTMLButtonElement>('btn-end-reset');
  const homeButton = el<HTMLButtonElement>('btn-home');
  const buttons = [continueButton, resetButton, homeButton];

  const onKeyDown = (event: KeyboardEvent) => {
    const direction = ['ArrowLeft', 'ArrowUp', 'KeyA', 'KeyW'].includes(event.code)
      ? -1
      : ['ArrowRight', 'ArrowDown', 'KeyD', 'KeyS'].includes(event.code)
        ? 1
        : 0;
    if (direction) {
      event.preventDefault();
      const active = buttons.indexOf(document.activeElement as HTMLButtonElement);
      buttons[(Math.max(0, active) + direction + buttons.length) % buttons.length].focus();
      return;
    }
    if (event.code === 'KeyE' && document.activeElement instanceof HTMLButtonElement) {
      event.preventDefault();
      document.activeElement.click();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  continueButton.addEventListener('click', () => {
    window.removeEventListener('keydown', onKeyDown);
    host.classList.add('hidden');
    host.innerHTML = '';
    popUI();
    opts.onContinue();
  });
  resetButton.addEventListener('click', () => {
    resetSave();
    location.reload();
  });
  homeButton.addEventListener('click', () => {
    window.location.href = '/#aula/electronica';
  });
  continueButton.focus();
}
