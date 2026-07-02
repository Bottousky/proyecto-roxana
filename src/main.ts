import './styles.css';
import Phaser from 'phaser';
import { ExplorationScene, W, H } from './jugar/ExplorationScene';
import { initDialog } from './ui/dialog';
import { initBitacora, showBitacoraButton } from './ui/bitacora';
import { el } from './ui/overlay';
import { hasSave, load, resetSave, state } from './state';
import { initAudio, initAudioButton } from './audio';
import { activateExperienceForRoom } from './experiences/registry';

function startGame(): void {
  initAudio(); // el click de "Empezar"/"Continuar" es el gesto que habilita el sonido
  el('title-screen').classList.add('hidden');
  if (state.flags.hasBitacora) showBitacoraButton();

  // El shell compartido conoce la experiencia activa, pero no impone su estética.
  // Hoy Instituto y Ohmdal comparten runtime; los próximos mundos no tendrán que hacerlo.
  activateExperienceForRoom(state.room);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: H,
    backgroundColor: '#0e0d12',
    scene: [ExplorationScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });
  if (import.meta.env.DEV) {
    // solo en desarrollo: handles para pruebas E2E desde la consola
    const debugWindow = window as unknown as { __game?: Phaser.Game };
    debugWindow.__game = game;
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
