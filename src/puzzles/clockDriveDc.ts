import { sfxClick, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import { evaluateClockDriveDc } from './clockDriveDcModel';

export function abrirClockDriveDc(onSolved: () => void): void {
  openBench(
    'Motor del Reloj',
    'Ajusta el divisor DC hasta que el motor mueva el péndulo de forma pareja.',
    (bench) => {
      let divider = 3;
      let prediction = false;
      let solved = false;
      const stage = document.createElement('div');
      stage.className = 'bench-stage';
      const display = document.createElement('div');
      stage.append(display);
      bench.root.append(stage);
      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        { label: 'Continuar', primary: true, onClick: () => bench.close(onSolved) },
      ]);
      actions.Continuar.hidden = true;
      const render = () => {
        display.innerHTML = `<p>Empuje 36 · Camino 6 · divisor ${divider} · engranajes piden 5</p><p class="clock-pendulum">Péndulo: ${solved ? 'parejo' : 'en espera'}</p>`;
        stage.querySelectorAll<HTMLButtonElement>('[data-divider]').forEach((button) =>
          button.setAttribute('aria-pressed', String(Number(button.dataset.divider) === divider)),
        );
      };
      const predict = document.createElement('div');
      predict.innerHTML = '<p>Designa el péndulo: ¿un divisor mayor lo deja más quieto o más forzado?</p>';
      const pendulum = document.createElement('button');
      pendulum.textContent = 'Péndulo del motor';
      pendulum.onclick = () => {
        prediction = true;
        predict.hidden = true;
        bench.setStatus('Elige un divisor y observa el ritmo del péndulo.');
      };
      predict.append(pendulum);
      bench.root.prepend(predict);
      [3, 12, 18, 26, 36].forEach((value) => {
        const b = document.createElement('button');
        b.dataset.divider = String(value);
        b.textContent = `Divisor ${value}`;
        b.onclick = () => {
          if (prediction && !solved) {
            divider = value;
            sfxClick();
            render();
          }
        };
        stage.append(b);
      });
      const energize = document.createElement('button');
      energize.textContent = 'Energizar motor';
      energize.onclick = () => {
        if (!prediction || solved) {
          bench.setStatus('Designa primero el péndulo.');
          return;
        }
        const result = evaluateClockDriveDc({
          voltage: 36,
          resistance: 6,
          dividerResistance: divider,
          motorResistance: 12,
          gearLoad: 5,
          currentLimit: 1.2,
        });
        bench.setStatus(`${result.feedback} Ritmo: ${result.rhythm}.`);
        if (result.valid) {
          solved = true;
          sfxWin();
          actions.Continuar.hidden = false;
          energize.disabled = true;
          render();
        }
      };
      bench.root.append(energize);
      render();
    },
    { worldCloseup: true },
  );
}
