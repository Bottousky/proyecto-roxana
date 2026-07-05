// Punto de entrada del slice de Ohmdal (independiente del shell de la escuela).
import './ohmdal.css';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.ts';
import { WorldScene } from './scenes/WorldScene.ts';
import { initDialog } from './dialog.ts';
import { initHud } from './hud.ts';
import { hasSave, loadSlice, resetSlice } from './save.ts';
import { VIEW_W, VIEW_H, ZOOM } from './config.ts';

let game: Phaser.Game | null = null;

function boot(): void {
  if (game) return;
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'oj-game',
    width: VIEW_W * ZOOM,
    height: VIEW_H * ZOOM,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: '#0d0b13',
    scene: [BootScene, WorldScene],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  });
}

function start(fresh: boolean): void {
  if (fresh) resetSlice();
  else loadSlice();
  document.getElementById('oj-title')!.classList.add('hidden');
  boot();
}

initDialog();
initHud();

const cont = document.getElementById('oj-continue') as HTMLButtonElement;
const nw = document.getElementById('oj-new') as HTMLButtonElement;
if (!hasSave()) { cont.disabled = true; cont.textContent = 'Continuar (sin partida)'; }
cont.addEventListener('click', () => start(false));
nw.addEventListener('click', () => start(true));
