import './styles.css';
import { initDialog } from './ui/dialog';
import { initBitacora, showBitacoraButton } from './ui/bitacora';
import { el } from './ui/overlay';
import { hasSave, load, resetSave, state } from './state';
import { initAudio, initAudioButton } from './audio';
import { experienceById, experienceOfRoom } from './experiences/registry';
import { createRuntimeHost } from './app/runtimeHost.ts';
import { runtimeLoaders } from './experiences/loaders.ts';
import type { ExperienceId } from './experiences/types.ts';
import { esLlegadaPorPortal } from './shared/portalLink.ts';

function startGame(): void {
  initAudio(); // el click de "Empezar"/"Continuar" es el gesto que habilita el sonido
  el('title-screen').classList.add('hidden');
  if (state.flags.hasBitacora) showBitacoraButton();

  // El host monta el runtime de la experiencia activa; main.ts ya no conoce Phaser.
  const host = createRuntimeHost(el('game'), runtimeLoaders);
  const experience = experienceOfRoom(state.room) ?? experienceById('instituto');
  void host.start({ experienceId: experience.id, roomId: state.room });
  if (import.meta.env.DEV) {
    // solo en desarrollo: handle para pruebas E2E desde la consola
    (window as any).__travel = (experienceId: ExperienceId, roomId?: string) =>
      host.travel({ experienceId, roomId });
  }
}

initDialog();
initBitacora();
initAudioButton();

const btnContinue = el<HTMLButtonElement>('btn-continue');
const btnNew = el<HTMLButtonElement>('btn-new');
const arrivedByPortal = esLlegadaPorPortal(location.search);

function continueGame(): void {
  load();
  startGame();
}

function newGame(): void {
  resetSave();
  startGame();
}

function showPortalArrivalOverlay(): void {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:200; background:#dfe9ff; opacity:1;
    pointer-events:none; transition:opacity 0.6s ease-out;
  `;
  document.body.appendChild(overlay);
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  requestAnimationFrame(() => {
    overlay.style.transitionDuration = reduced ? '0.05s' : '0.6s';
    overlay.style.opacity = '0';
  });
  window.setTimeout(() => overlay.remove(), reduced ? 80 : 650);
}

if (arrivedByPortal) {
  showPortalArrivalOverlay();
  if (hasSave()) continueGame();
  else newGame();
} else if (hasSave()) {
  btnContinue.classList.remove('hidden');
  btnContinue.addEventListener('click', continueGame);
}

btnNew.addEventListener('click', newGame);
