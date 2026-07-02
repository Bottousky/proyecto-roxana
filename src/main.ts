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

if (hasSave()) {
  btnContinue.classList.remove('hidden');
  btnContinue.addEventListener('click', () => {
    load();
    startGame();
  });
}

btnNew.addEventListener('click', () => {
  resetSave();
  startGame();
});
