// Punto de entrada de Physica (página propia, independiente del shell de la escuela).
import './styles.css';
import { createRuntimeHost } from '../../app/runtimeHost.ts';
import { runtimeLoaders } from '../loaders.ts';
import type { RuntimeHandle } from '../types.ts';

const gameEl = document.getElementById('px-game')!;
const host = createRuntimeHost(gameEl, runtimeLoaders);

const title = document.getElementById('px-title')!;
const back = document.getElementById('px-back') as HTMLButtonElement;

const legacyThree = new URLSearchParams(location.search).get('engine') === 'three';
let legacyHandle: RuntimeHandle | null = null;
let started = false;

async function start(): Promise<void> {
  if (started) return;
  started = true;
  title.classList.add('hidden');
  back.classList.remove('hidden');
  const continueButton = document.getElementById('px-continue') as HTMLButtonElement;
  continueButton.disabled = true;
  continueButton.textContent = 'Cargando...';

  try {
    if (legacyThree) {
      // M1 (Three.js) en dev: monta el runtime anterior directo, sin pasar por el
      // host (el manifest ya apunta a Babylon). Sirve para comparar el mundo
      // previo contra el nuevo; no es una ruta de producción.
      const m = await import('./physicaRuntime.ts');
      legacyHandle = await m.physicaRuntime.mount(gameEl, {
        initialLocation: { experienceId: 'physica', roomId: 'cascada' },
        requestTravel: async () => {},
      });
    } else {
      await host.start({ experienceId: 'physica', roomId: 'cascada' });
    }
  } catch (error) {
    console.error('No se pudo montar Physica', error);
    started = false;
    title.classList.remove('hidden');
    back.classList.add('hidden');
    continueButton.disabled = false;
    continueButton.textContent = 'Reintentar';
    return;
  }
}

document.getElementById('px-continue')!.addEventListener('click', start);

if (import.meta.env.DEV && new URLSearchParams(location.search).has('auto')) {
  void start();
}

back.addEventListener('click', async () => {
  if (legacyHandle) {
    await legacyHandle.destroy();
    legacyHandle = null;
  } else {
    await host.destroy();
  }
  window.location.href = '/#hall';
});
