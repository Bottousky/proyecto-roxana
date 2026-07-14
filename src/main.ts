import './styles.css';
import { initDialog } from './ui/dialog';
import { initBitacora, showBitacoraButton } from './ui/bitacora';
import { el } from './ui/overlay';
import { hasSave, load, resetSave, save, state } from './state';
import { initAudio, initAudioButton } from './audio';
import { experienceById, experienceOfRoom } from './experiences/registry';
import { createRuntimeHost } from './app/runtimeHost.ts';
import { runtimeLoaders } from './experiences/loaders.ts';
import type { ExperienceId } from './experiences/types.ts';
import { esLlegadaPorPortal, salaLlegadaPortal } from './shared/portalLink.ts';
import { initOhmCompanion, syncOhmCompanionButton } from './ui/ohmCompanion.ts';

function dismissBootCurtain(): void {
  const curtain = document.getElementById('boot-curtain');
  if (!curtain || curtain.classList.contains('is-gone')) return;
  curtain.classList.add('is-gone');
  window.setTimeout(() => curtain.remove(), 500);
}

// En una llegada desde el aula el curtain permanece hasta que Phaser ya pintó
// la Plaza: evita exponer el HTML sin estilos entre los dos documentos.
window.addEventListener('roxana:game-ready', dismissBootCurtain, { once: true });

function startGame(): void {
  initAudio(); // el click de "Empezar"/"Continuar" es el gesto que habilita el sonido
  el('title-screen').classList.add('hidden');
  if (state.flags.hasBitacora) showBitacoraButton();
  syncOhmCompanionButton();

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
initOhmCompanion();

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

function enterFromPortal(): void {
  // El portal conserva los flags de la partida, pero su destino no puede depender
  // de la última sala visitada (aula, hall o un save antiguo/inválido).
  if (hasSave()) load();
  else resetSave();
  state.room = salaLlegadaPortal(location.search);
  save();
  startGame();
}

if (arrivedByPortal) {
  enterFromPortal();
} else if (hasSave()) {
  dismissBootCurtain();
  btnContinue.classList.remove('hidden');
  btnContinue.addEventListener('click', continueGame);
} else {
  dismissBootCurtain();
}

btnNew.addEventListener('click', newGame);
