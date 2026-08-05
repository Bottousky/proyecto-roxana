// Punto de entrada de Physica (página propia, independiente del shell de la escuela).
import './styles.css';
import { createRuntimeHost } from '../../app/runtimeHost.ts';
import { runtimeLoaders } from '../loaders.ts';

const host = createRuntimeHost(document.getElementById('px-game')!, runtimeLoaders);

const title = document.getElementById('px-title')!;
const back = document.getElementById('px-back') as HTMLButtonElement;

function start(): void {
  title.classList.add('hidden');
  back.classList.remove('hidden');
  void host.start({ experienceId: 'physica', roomId: 'cascada' });
}

document.getElementById('px-continue')!.addEventListener('click', start);

back.addEventListener('click', () => {
  void host.destroy().then(() => {
    window.location.href = '/#hall';
  });
});
