import { sfxBridge, sfxDim, sfxOk, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  createSimTick,
  ohmProbe,
  setGauge,
  setTankLevel,
  tankSVG,
  gaugeSVG,
} from './common';
import {
  advanceStoredSpark,
  createStoredSparkState,
  setStoredSparkPath,
  storedSparkReading,
} from './storedsparkModel';

const ANOMALY_DIALOGUE =
  '<b>Edda:</b> «Ahí está. EXACTAMENTE eso. Tres segundos sin camino.»<br/>' +
  '<b>Ohm:</b> «Camino: cortado. Chispa: presente. Reglas: intactas. Paciencia: detectada.»';

const CHANNEL_DIALOGUE =
  '<b>Ohm:</b> «El estanque no es una pared. Es una pared que primero deja pasar, y después se acuerda.»';

const CONSEJERA_DIALOGUE =
  '<b>Consejera:</b> «Registro fuera de término. Cuarenta años haciendo actas y la primera verdad la anoto tarde.»<br/>' +
  '<i>(escribe, con fecha vieja)</i> «La chispa que se queda.» ...Que conste.';

export interface StoredSparkOptions {
  practica?: boolean;
  onAnomalyNoted: () => void;
  onSolved: () => void;
}

export function abrirStoredSpark({
  practica = false,
  onAnomalyNoted,
  onSolved,
}: StoredSparkOptions): void {
  openBench(
    'La chispa que se queda',
    'Una fuente, un canal con llave, un Estanque y una lámpara.',
    (bench) => {
      let state = createStoredSparkState();
      let solved = false;
      let chargedEnoughToObserve = false;
      let anomalyNoted = practica;

      const stage = document.createElement('div');
      stage.className = 'bench-stage storedspark-stage';
      stage.innerHTML = `
        <div class="storedspark-network">
          <div class="storedspark-source">fuente</div>
          <div class="storedspark-channel">
            <span class="storedspark-river"></span>
            <span class="storedspark-key">llave cerrada</span>
          </div>
          <div class="storedspark-tank">${tankSVG()}</div>
          <div class="storedspark-lamp" aria-label="Lámpara apagada">
            <span></span>
            <small>lámpara</small>
          </div>
        </div>
        <div class="storedspark-instruments">
          <div class="storedspark-gauge">
            ${gaugeSVG(0, 0.18, 1)}
            <span>río del canal</span>
          </div>
          <div class="storedspark-probe-host"></div>
        </div>`;
      bench.root.appendChild(stage);

      const probe = ohmProbe(
        [{ id: 'canal', label: 'Medir el canal con Ohm' }],
        () => {
          const flow = storedSparkReading(state).channelFlow;
          if (!state.pathOpen) return 'Río: cero. Camino cortado.';
          if (flow === 0) return 'Río: cero. El Estanque está lleno.';
          if (flow > 0.65) return 'Río: fuerte.';
          if (flow > 0.15) return 'Río: debilitándose.';
          return 'Río: casi dormido.';
        },
        (reading) => {
          sfxOk();
          bench.setStatus(`<b>Ohm:</b> «${reading}»<br/>${CHANNEL_DIALOGUE}`);
        },
      );
      stage.querySelector<HTMLElement>('.storedspark-probe-host')!.appendChild(probe.element);

      const actions = benchActions(bench.root, [
        {
          label: 'Cargar',
          primary: true,
          onClick: () => {
            if (solved) return;
            state = setStoredSparkPath(state, true);
            chargedEnoughToObserve = false;
            probe.clear();
            sfxBridge();
            bench.setStatus('La llave se abre. El río entra fuerte y empieza a aflojar.');
            render();
          },
        },
        {
          label: 'Cortar el camino',
          onClick: () => {
            if (solved || !state.pathOpen) return;
            chargedEnoughToObserve = state.level >= 95;
            state = setStoredSparkPath(state, false);
            probe.clear();
            sfxDim();
            bench.setStatus(
              chargedEnoughToObserve
                ? 'La llave se cierra. El camino está cortado, pero la lámpara sigue brillando.'
                : 'La llave se cierra demasiado pronto. Quedó poca chispa: pruebe llenar el Estanque.',
            );
            render();
          },
        },
        {
          label: 'Observar',
          onClick: () => {
            const reading = storedSparkReading(state);
            if (state.pathOpen) {
              bench.setStatus('La lámpara apenas brilla mientras el río llena el Estanque.');
              return;
            }
            if (!reading.discharging || !chargedEnoughToObserve) {
              bench.setStatus('No queda brillo residual. Abra la llave y deje llenar el Estanque.');
              return;
            }
            if (practica) {
              bench.setStatus(`${ANOMALY_DIALOGUE}<br/><br/>La experiencia queda disponible para repetir.`);
              return;
            }
            solve();
          },
        },
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(onSolved),
        },
      ]);
      actions['Continuar'].classList.add('hidden');

      const tick = createSimTick((dtMs) => {
        if (solved) return;
        const previousLevel = state.level;
        state = advanceStoredSpark(state, dtMs);
        if (state.level !== previousLevel) render();
      });
      bench.onClose(tick.stop);

      function solve(): void {
        solved = true;
        tick.stop();
        sfxWin();
        if (!anomalyNoted) {
          anomalyNoted = true;
          onAnomalyNoted();
        }
        bench.root.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
          button.disabled = true;
        });
        actions['Alejarse'].classList.add('hidden');
        actions['Continuar'].classList.remove('hidden');
        actions['Continuar'].disabled = false;
        bench.setStatus(`${ANOMALY_DIALOGUE}<br/><br/>${CONSEJERA_DIALOGUE}`);
      }

      function render(): void {
        const reading = storedSparkReading(state);
        setTankLevel(stage, state.level);
        setGauge(stage, reading.channelFlow, 1);
        stage.classList.toggle('path-open', state.pathOpen);
        stage.classList.toggle('lamp-lit', reading.lampLit);
        stage.classList.toggle('lamp-discharge', reading.discharging);
        stage.querySelector<HTMLElement>('.storedspark-key')!.textContent =
          state.pathOpen ? 'llave abierta' : 'llave cerrada';
        stage
          .querySelector<HTMLElement>('.storedspark-lamp')!
          .setAttribute('aria-label', reading.lampLit ? 'Lámpara encendida' : 'Lámpara apagada');
      }

      bench.setStatus('Abra la llave y deje que el Estanque se llene.');
      render();
    },
  );
}
