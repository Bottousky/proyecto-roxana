import { sfxPortal } from '../audio';
import { portalExitUrl } from '../shared/portalLink';
import { popUI, pushUI } from './overlay';

const ID = 'confirm-exit-ohmdal';

function close(host: HTMLElement): void {
  host.remove();
  popUI();
}

/** Pide una decisión explícita antes de abandonar el mundo Phaser de Ohmdal. */
export function confirmExitOhmdal(): void {
  if (document.getElementById(ID)) return;

  const host = document.createElement('div');
  host.id = ID;
  host.className = 'confirm-exit-ohmdal';
  host.setAttribute('role', 'dialog');
  host.setAttribute('aria-modal', 'true');
  host.setAttribute('aria-labelledby', `${ID}-title`);
  host.innerHTML = `
    <div class="confirm-exit-ohmdal__card">
      <div class="confirm-exit-ohmdal__sigil" aria-hidden="true">Ω</div>
      <h2 id="${ID}-title">¿Salir de Ohmdal?</h2>
      <p>Volverás al Taller de Electrónica del Instituto. Tu progreso queda guardado.</p>
      <div class="confirm-exit-ohmdal__actions">
        <button type="button" data-action="cancel">Quedarme</button>
        <button type="button" class="primary" data-action="exit">Salir de Ohmdal</button>
      </div>
    </div>`;

  const cancel = host.querySelector<HTMLButtonElement>('[data-action="cancel"]')!;
  const exit = host.querySelector<HTMLButtonElement>('[data-action="exit"]')!;
  cancel.addEventListener('click', () => close(host));
  exit.addEventListener('click', () => {
    sfxPortal();
    window.location.href = portalExitUrl();
  });
  host.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(host);
      return;
    }
    if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(event.code)) {
      event.preventDefault();
      (document.activeElement === cancel ? exit : cancel).focus();
      return;
    }
    if (event.code === 'KeyE' && document.activeElement instanceof HTMLButtonElement) {
      event.preventDefault();
      document.activeElement.click();
    }
  });
  document.body.appendChild(host);
  pushUI();
  cancel.focus();
}
