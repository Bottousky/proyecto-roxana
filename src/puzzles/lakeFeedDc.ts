import { sfxClick, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import { evaluateLakeFeedDc } from './lakeFeedDcModel';

export function abrirLakeFeedDc(onSolved: () => void): void {
  openBench(
    'Alimentación del Lago',
    'Elige el Camino de llegada y atiende dos ramales.',
    (bench) => {
      let feeder = 4;
      let a = true;
      let b = false;
      let ra = 6;
      let rb = 6;
      let predicted = false;
      let done = false;
      const display = document.createElement('div');
      const controls = document.createElement('div');
      controls.className = 'bench-stage';
      bench.root.append(display, controls);
      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        { label: 'Continuar', primary: true, onClick: () => bench.close(onSolved) },
      ]);
      actions.Continuar.hidden = true;

      const button = (label: string, pressed: () => boolean, fn: () => void) => {
        const x = document.createElement('button');
        x.textContent = label;
        x.setAttribute('aria-pressed', String(pressed()));
        x.onclick = () => {
          if (!predicted || done) return;
          sfxClick();
          fn();
          render();
        };
        controls.append(x);
      };

      const render = () => {
        controls.innerHTML = '';
        const r = evaluateLakeFeedDc({
          sourceVoltage: 12,
          feederResistance: feeder,
          sourceLimit: 6,
          branches: [
            { resistance: ra, enabled: a },
            { resistance: rb, enabled: b },
          ],
        });
        display.innerHTML = `<p>Empuje en el Lago: ${r.loadVoltage.toFixed(1)} · Río del Tronco: ${r.totalCurrent.toFixed(1)}</p><p>Ramal A: ${a ? 'atendido' : 'aislado'} · Ramal B: ${b ? 'atendido' : 'aislado'}</p>`;
        [1, 4].forEach((v) => button(`Camino ${v}`, () => feeder === v, () => { feeder = v; }));
        button(`Ramal A ${a ? 'abierto' : 'cerrado'}`, () => a, () => { a = !a; });
        [2, 6, 12].forEach((v) => button(`A Piedra ${v}`, () => ra === v, () => { ra = v; }));
        button(`Ramal B ${b ? 'abierto' : 'cerrado'}`, () => b, () => { b = !b; });
        [2, 6, 12].forEach((v) => button(`B Piedra ${v}`, () => rb === v, () => { rb = v; }));
        const e = document.createElement('button');
        e.textContent = 'Energizar';
        e.onclick = () => {
          if (!predicted) return bench.setStatus('Designa primero el Camino que vas a observar.');
          const q = evaluateLakeFeedDc({
            sourceVoltage: 12,
            feederResistance: feeder,
            sourceLimit: 6,
            branches: [
              { resistance: ra, enabled: a },
              { resistance: rb, enabled: b },
            ],
          });
          bench.setStatus(q.feedback);
          if (q.valid) {
            done = true;
            sfxWin();
            actions.Continuar.hidden = false;
            e.disabled = true;
          }
        };
        controls.append(e);
      };

      const prediction = document.createElement('div');
      prediction.innerHTML = '<p>Designa el Camino: ¿cuál pierde más Empuje al alargarse?</p>';
      ['Camino 1', 'Camino 4'].forEach((t) => {
        const x = document.createElement('button');
        x.textContent = t;
        x.onclick = () => {
          predicted = true;
          prediction.hidden = true;
          bench.setStatus('Configura y energiza. Observa el Empuje en el Lago.');
          render();
        };
        prediction.append(x);
      });
      bench.root.prepend(prediction);
      render();
    },
    { worldCloseup: true },
  );
}
