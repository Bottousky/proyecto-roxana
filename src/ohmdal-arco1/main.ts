/**
 * Ohmdal Arco I — Entry point
 *
 * Boots the game. Wires up:
 *   - Save/load
 *   - Audio (music + SFX)
 *   - Phaser scene
 *   - DOM UI (HUD, dialogue, Bitácora, prompt)
 *
 * The entry HTML loads this module. The module is responsible for assembling
 * the runtime from clean, single-responsibility modules — no legacy room
 * system, no instance copy-paste from /jugar.
 */

import { OhmdalGame } from './engine/Game.ts';
import { SaveSystem } from './engine/Save.ts';
import { AudioBus } from './engine/AudioBus.ts';
import { ui } from './ui/UI.ts';
import { bitacora } from './ui/Bitacora.ts';
import { prompt } from './ui/Prompt.ts';
import { worldTopology } from './data/worldTopology.ts';
import { narrative } from './data/narrative.ts';
import './ui/styles.css';

async function boot(): Promise<void> {
  const root = document.getElementById('ohmdal-root');
  if (!root) throw new Error('ohmdal-root missing');

  // Hide loading
  const loading = document.getElementById('ohmdal-loading');
  const fade = ensureFadeOverlay();

  // Boot subsystems
  const save = new SaveSystem('ohmdal-arco1-v1');
  save.load();

  const audio = new AudioBus();
  await audio.bootstrap();

  // Mount UI shell
  const hud = ui.mount(document.getElementById('ohmdal-ui')!);
  prompt.mount(document.getElementById('ohmdal-prompt')!);
  bitacora.mount(document.getElementById('ohmdal-bitacora')!);

  // Create the game with the world topology and narrative
  const canvas = document.createElement('canvas');
  const wrap = document.getElementById('ohmdal-canvas-wrap')!;
  wrap.appendChild(canvas);

  const game = new OhmdalGame({
    canvas,
    save,
    audio,
    ui: hud,
    prompt: prompt.get(),
    bitacora: bitacora.get(),
    topology: worldTopology,
    narrative,
  });

  // Hide loading once everything is ready
  await game.whenReady();
  if (loading) loading.classList.add('hidden');
  if (fade) {
    fade.classList.add('fade-out');
    setTimeout(() => fade.remove(), 2000);
  }
  setTimeout(() => loading?.remove(), 800);

  // Expose for debugging only
  if (import.meta.env.DEV) {
    (window as any).ohmdal = { game, save, audio, ui, bitacora, prompt };
  }
}

function ensureFadeOverlay(): HTMLElement {
  let fade = document.getElementById('ohmdal-scene-fade');
  if (!fade) {
    fade = document.createElement('div');
    fade.id = 'ohmdal-scene-fade';
    document.getElementById('ohmdal-root')!.appendChild(fade);
  }
  return fade;
}

boot().catch((err) => {
  console.error('Ohmdal boot failed', err);
  const loading = document.getElementById('ohmdal-loading');
  if (loading) {
    loading.innerHTML = `<div style="color:#e8a050;font-family:monospace;padding:20px;text-align:center">
      No se pudo cargar Ohmdal.<br/>
      <small style="color:#7a5232">${String(err)}</small>
    </div>`;
  }
});
