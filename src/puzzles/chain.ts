import { sfxClick, sfxDim, sfxOk, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import { gaugeSVG, ohmProbe, ohmWidgetHTML, setGauge, setOhmState } from './common';
import {
  CHAIN_MAX_LAMPS,
  addChainLamp,
  chainBrightness,
  chainBrightnessBand,
  chainReading,
  chainSegmentIds,
  createChainState,
  measureChainSegment,
  removeChainLamp,
  type ChainBrightnessBand,
} from './chainModel';

const MEASURED_DIALOGUE =
  '<b>Edda:</b> «Esperaba que fuera bajando… Pensé que la primera lámpara se quedaba con la mejor parte.»<br/>' +
  '<b>Ohm:</b> «Reparto en fila: no existe. Fila = un solo río.»<br/>' +
  '<b>Consejera:</b> <i>(anotando, incómoda)</i> «El instrumento estará descalibrado.»<br/>' +
  '<b>Ohm:</b> «El instrumento los escucha.»';

const REMOVED_DIALOGUE =
  '<b>Lumen:</b> «¡La fila entera muere por un soldado! En mis tiempos a eso lo llamábamos diseño solemne.»<br/>' +
  '<b>Edda:</b> «Yo lo llamaría rehén.»';

const ADDED_DIALOGUE =
  '<b>Ohm:</b> «Más frenos en fila: frenos sumados. Río menor para todos.»';

const SOLVED_DIALOGUE =
  '<b>Consejera:</b> «Quitaron lámparas… y las que quedan brillan bien. Eso es exactamente lo que el Consejo predica. Austeridad.»<br/>' +
  '<b>Edda:</b> «No. Quitamos FRENOS de un mismo camino. Es otra cosa. Se lo voy a mostrar con los Ramales.»';

export function abrirChain(onSolved: () => void, practica = false): void {
  openBench(
    'La Cadena',
    'Un solo río, frenos que se suman, fragilidad de la fila.',
    (bench) => {
      let state = createChainState();
      let solved = false;
      let busy = false;
      let blackoutTimer: number | undefined;

      const stage = document.createElement('div');
      stage.className = 'bench-stage chain-stage';
      stage.innerHTML = `
        <div class="chain-circuit">
          <div class="chain-source">EMPUJE</div>
          <div class="chain-wire live"></div>
          <div class="chain-slots" aria-label="Fila de lámparas"></div>
          <div class="chain-wire live"></div>
          <div class="chain-return">RETORNO</div>
        </div>
        <div class="chain-instruments">
          <div class="chain-gauge">
            ${gaugeSVG(2)}
            <div class="chain-gauge-label">aguja de brillo</div>
            <div class="chain-band"></div>
          </div>
          ${ohmWidgetHTML()}
        </div>`;
      bench.root.appendChild(stage);

      const probeHost = document.createElement('div');
      probeHost.className = 'chain-probe-host';
      bench.root.appendChild(probeHost);

      const progress = document.createElement('div');
      progress.className = 'chain-progress';
      bench.root.appendChild(progress);

      let actions: Record<string, HTMLButtonElement>;

      const finishIfSolved = () => {
        if (practica || solved || !state.solved) return;
        solved = true;
        sfxOk();
        sfxWin();
        bench.setStatus(SOLVED_DIALOGUE);
        actions['Alejarse'].classList.add('hidden');
        actions['Continuar'].classList.remove('hidden');
        render(false);
      };

      const reportMeasurement = (segmentId: string, rio: number) => {
        const hadExperience = state.experiences.measuredSameRiver;
        state = measureChainSegment(state, segmentId);
        if (!hadExperience && state.experiences.measuredSameRiver) {
          bench.setStatus(MEASURED_DIALOGUE);
        } else {
          bench.setStatus(`<b>Medición:</b> río ${formatRiver(rio)}.`);
        }
        renderProgress();
        finishIfSolved();
      };

      const renderProbes = () => {
        const segments = chainSegmentIds(state.lampCount).map((id) => ({
          id,
          label: segmentLabel(id, state.lampCount),
        }));
        const probe = ohmProbe(
          segments,
          (id) => `Río: ${formatRiver(chainReading(state.lampCount, id))}.`,
          (reading, segment) => {
            const rio = chainReading(state.lampCount, segment.id);
            reportMeasurement(segment.id, rio);
            if (!state.experiences.measuredSameRiver) {
              bench.setStatus(`<b>${segment.label}:</b> ${reading}`);
            }
          },
        );
        probeHost.replaceChildren(probe.element);
        probe.element.querySelectorAll('button').forEach((button) => {
          button.disabled = solved || busy;
        });
      };

      const renderProgress = () => {
        progress.innerHTML = [
          progressMark(state.experiences.measuredSameRiver, 'Mismo río en toda la fila'),
          progressMark(state.experiences.removedLamp, 'Quitar una lámpara'),
          progressMark(state.experiences.addedLamp, 'Agregar lámparas'),
        ].join('');
      };

      const render = (forceOff: boolean) => {
        const slots = stage.querySelector<HTMLElement>('.chain-slots')!;
        const brillo = forceOff ? 0 : chainBrightness(state.lampCount);
        const glow = Math.max(0.18, Math.min(1, brillo / 2));
        const glowRadius = Math.round(20 * glow);
        slots.innerHTML = '';

        for (let index = 0; index < CHAIN_MAX_LAMPS; index++) {
          const occupied = index < state.lampCount;
          const socket = document.createElement('button');
          socket.className =
            'chain-socket ' + (occupied ? 'occupied' : 'available') + (forceOff ? ' off' : '');
          socket.disabled = solved || busy;
          socket.setAttribute(
            'aria-label',
            occupied ? 'Quitar una lámpara' : 'Agregar lámparas',
          );
          socket.innerHTML = occupied
            ? `<span class="chain-bulb" style="--lamp-glow:${glow};--lamp-radius:${glowRadius}px"></span>
               <span class="chain-socket-label">L${index + 1}</span>`
            : '<span class="chain-plug">+</span>';
          socket.addEventListener('click', () => {
            if (occupied) removeLamp();
            else addLamp();
          });
          slots.appendChild(socket);
        }

        stage.classList.toggle('blackout', forceOff);
        stage.querySelectorAll('.chain-wire').forEach((wire) => {
          wire.classList.toggle('live', !forceOff);
        });
        setGauge(stage, brillo);
        setOhmState(stage, forceOff ? 'inerte' : 'estable');
        stage.querySelector<HTMLElement>('.chain-band')!.textContent =
          bandLabel(chainBrightnessBand(state.lampCount));
        renderProbes();
        renderProgress();
      };

      const removeLamp = () => {
        if (busy || solved) return;
        const hadExperience = state.experiences.removedLamp;
        const change = removeChainLamp(state);
        if (!change.interrupted) return;

        sfxClick();
        sfxDim();
        state = change.state;
        busy = true;
        render(true);
        if (!hadExperience) bench.setStatus(REMOVED_DIALOGUE);

        blackoutTimer = window.setTimeout(() => {
          busy = false;
          render(false);
          finishIfSolved();
        }, 600);
      };

      const addLamp = () => {
        if (busy || solved) return;
        const hadExperience = state.experiences.addedLamp;
        const change = addChainLamp(state);
        if (change.state === state) return;

        sfxClick();
        sfxDim();
        state = change.state;
        render(false);
        if (!hadExperience) bench.setStatus(ADDED_DIALOGUE);
        finishIfSolved();
      };

      actions = benchActions(bench.root, [
        {
          label: 'Alejarse',
          onClick: () => {
            if (blackoutTimer !== undefined) window.clearTimeout(blackoutTimer);
            bench.close();
          },
        },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => {
            if (blackoutTimer !== undefined) window.clearTimeout(blackoutTimer);
            bench.close(onSolved);
          },
        },
      ]);
      actions['Continuar'].classList.add('hidden');

      bench.setStatus(
        'Cuatro lámparas: encendidas, pero tenues, todas exactamente igual de tenues.',
      );
      render(false);
    },
  );
}

function segmentLabel(segmentId: string, lampCount: number): string {
  if (segmentId === 'before') return 'Antes de la primera';
  if (segmentId === 'after') return 'Después de la última';
  const left = Number(segmentId.replace('between-', ''));
  return `Entre lámparas ${left} y ${Math.min(lampCount, left + 1)}`;
}

function formatRiver(rio: number): string {
  return Number.isInteger(rio) ? String(rio) : rio.toFixed(2);
}

function bandLabel(band: ChainBrightnessBand): string {
  if (band === 'correcta') return 'brillo correcto';
  if (band === 'tenue') return 'tenue';
  if (band === 'casi-nada') return 'casi nada';
  return 'demasiado';
}

function progressMark(done: boolean, label: string): string {
  return `<span class="${done ? 'done' : ''}">${done ? '✓' : '○'} ${label}</span>`;
}
