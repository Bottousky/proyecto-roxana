import { sfxClick, sfxDim, sfxOk, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import { gaugeSVG, ohmProbe, ohmWidgetHTML, setGauge, setOhmState } from './common';
import {
  CHAIN_MAX_LAMPS,
  CHAIN_PUSHES,
  type ChainBand,
  type ChainPush,
  type ChainState,
  type RemovalGuess,
  type RiverGuess,
  addChainLamp,
  chainBand,
  chainReading,
  chainRiver,
  chainSegmentIds,
  createChainState,
  measureChainSegment,
  predictRemoval,
  predictRiver,
  removeChainLamp,
  setChainPush,
} from './chainModel';

type Phase = 'predict-river' | 'measure' | 'predict-removal' | 'remove' | 'restore';

const RIVER_OPTIONS: { key: RiverGuess; label: string }[] = [
  { key: 'antes', label: 'Antes de la primera' },
  { key: 'despues', label: 'Después de la última' },
  { key: 'igual', label: 'Igual en todos lados' },
];

const REMOVAL_OPTIONS: { key: RemovalGuess; label: string }[] = [
  { key: 'iguales', label: 'Siguen igual' },
  { key: 'mas', label: 'Brillan más' },
  { key: 'apagan', label: 'Se apagan todas' },
];

const MEASURED_BODY =
  '<b>Edda:</b> «Esperaba que fuera bajando… Pensé que la primera lámpara se quedaba con la mejor parte.»<br/>' +
  '<b>Ohm:</b> «Reparto en fila: no existe. Fila = un solo río.»<br/>' +
  '<b>Consejera:</b> <i>(anotando, incómoda)</i> «El instrumento estará descalibrado.»<br/>' +
  '<b>Ohm:</b> «El instrumento los escucha.»';

const REMOVED_BODY =
  '<b>Lumen:</b> «¡La fila entera muere por un soldado! En mis tiempos a eso lo llamábamos diseño solemne.»<br/>' +
  '<b>Edda:</b> «Yo lo llamaría rehén.»';

const ADDED_DIALOGUE =
  '<b>Ohm:</b> «Más frenos en fila: frenos sumados. Río menor para todos.»';

const SOLVED_DIALOGUE =
  '<b>Consejera:</b> «Seis lámparas. Más que las cuatro que yo dejé… y brillan MÁS, no menos. ¿Cómo?»<br/>' +
  '<b>Edda:</b> «No ahorraba quitando. Faltaba empuje, no sobraban lámparas. En la fila el río no se reparte: lo comparten entero. Más empuje, y todas brillan a la vez.»<br/>' +
  '<b>Ohm:</b> «Gasto en el camino: cero. Siempre fue cero.»';

export function abrirChain(onSolved: () => void, practica = false): void {
  openBench(
    'La Cadena',
    'Un solo río, frenos que se suman, fragilidad de la fila.',
    (bench) => {
      let state = createChainState();
      let solved = false;
      let busy = false;
      let blackoutTimer: number | undefined;

      // Cristal de Empuje (sólo se habilita al restaurar la Galería).
      const sourceTray = document.createElement('div');
      sourceTray.className = 'bench-tray chain-sources';
      sourceTray.innerHTML = '<span class="tray-label">Cristal de Empuje:</span>';
      const sourceButtons = new Map<ChainPush, HTMLButtonElement>();
      for (const push of CHAIN_PUSHES) {
        const button = document.createElement('button');
        button.className = 'fuente-opt chain-crystal';
        button.textContent = `Empuje ${push}`;
        button.addEventListener('click', () => {
          if (busy || solved || phaseOf(state) !== 'restore') return;
          sfxClick();
          state = setChainPush(state, push);
          render(false);
          bench.setStatus(restoreFeedback(state));
          finishIfSolved();
        });
        sourceButtons.set(push, button);
        sourceTray.appendChild(button);
      }
      bench.root.appendChild(sourceTray);

      // Panel de predicción (predecir → observar → explicar).
      const predict = document.createElement('div');
      predict.className = 'bench-predict';
      bench.root.appendChild(predict);

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
            ${gaugeSVG(1.6, 0.9, 4)}
            <div class="chain-gauge-label">brillo de la fila</div>
            <div class="chain-band"></div>
          </div>
          ${ohmWidgetHTML()}
        </div>`;
      bench.root.appendChild(stage);

      const probeHost = document.createElement('div');
      probeHost.className = 'chain-probe-host';
      bench.root.appendChild(probeHost);

      const goal = document.createElement('div');
      goal.className = 'bench-goal';
      bench.root.appendChild(goal);

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

      const chooseRiver = (guess: RiverGuess) => {
        if (busy || solved || state.predictions.river) return;
        sfxClick();
        state = predictRiver(state, guess);
        const label = RIVER_OPTIONS.find((option) => option.key === guess)!.label;
        bench.setStatus(
          `<b>Dijiste:</b> «${label}». Ahora llama a Ohm a medir en varios puntos de la fila.`,
        );
        render(false);
      };

      const chooseRemoval = (guess: RemovalGuess) => {
        if (busy || solved || state.predictions.removal) return;
        sfxClick();
        state = predictRemoval(state, guess);
        const label = REMOVAL_OPTIONS.find((option) => option.key === guess)!.label;
        bench.setStatus(`<b>Dijiste:</b> «${label}». Ahora saca una lámpara y mira la fila.`);
        render(false);
      };

      const doMeasure = (segmentId: string) => {
        if (busy || solved) return;
        const hadExperience = state.experiences.measuredSameRiver;
        const rio = chainReading(state.push, state.lampCount, segmentId);
        state = measureChainSegment(state, segmentId);
        if (!hadExperience && state.experiences.measuredSameRiver) {
          const prefix =
            state.predictions.river === 'igual'
              ? '<b>Ohm:</b> «Lo anticipaste: igual en cada punto.»<br/>'
              : '<b>Ohm:</b> «Esperabas un extremo. Mira: el río no cambia de un punto a otro.»<br/>';
          bench.setStatus(prefix + MEASURED_BODY);
        } else {
          bench.setStatus(`<b>Medición:</b> río ${formatRiver(rio)}.`);
        }
        render(false);
        finishIfSolved();
      };

      const removeLamp = () => {
        if (busy || solved) return;
        const change = removeChainLamp(state);
        if (!change.interrupted) return;
        const wasFirstRemoval = !state.experiences.removedLamp;
        const predicted = state.predictions.removal;

        sfxClick();
        sfxDim();
        state = change.state;
        busy = true;
        render(true);
        if (wasFirstRemoval) {
          const prefix =
            predicted === 'apagan'
              ? '<b>Edda:</b> «Lo sabías: se apagan todas.»<br/>'
              : '<b>Edda:</b> «¡Se apagaron TODAS! No sólo la que saqué.»<br/>';
          bench.setStatus(prefix + REMOVED_BODY);
        }

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
        state = change.state;
        render(false);
        if (!hadExperience) bench.setStatus(ADDED_DIALOGUE);
        else bench.setStatus(restoreFeedback(state));
        finishIfSolved();
      };

      const renderPredict = (phase: Phase) => {
        if (phase === 'predict-river') {
          predict.classList.remove('hidden');
          predict.innerHTML = '<p class="bench-predict-q"><b>Ohm:</b> «Antes de medir: ¿dónde crees que corre más río?»</p>';
          appendPredictButtons(predict, RIVER_OPTIONS, (key) => chooseRiver(key));
        } else if (phase === 'predict-removal') {
          predict.classList.remove('hidden');
          predict.innerHTML = '<p class="bench-predict-q"><b>Ohm:</b> «Si saco una lámpara, ¿qué crees que les pasa a las otras?»</p>';
          appendPredictButtons(predict, REMOVAL_OPTIONS, (key) => chooseRemoval(key));
        } else {
          predict.classList.add('hidden');
          predict.innerHTML = '';
        }
      };

      const renderProbes = (phase: Phase) => {
        const segments = chainSegmentIds(state.lampCount).map((id) => ({
          id,
          label: segmentLabel(id, state.lampCount),
        }));
        const probe = ohmProbe(
          segments,
          (id) => `Río: ${formatRiver(chainReading(state.push, state.lampCount, id))}.`,
          (_reading, segment) => doMeasure(segment.id),
        );
        const measuringEnabled = !solved && !busy && phase !== 'predict-river';
        probe.element.querySelectorAll('button').forEach((button) => {
          button.disabled = !measuringEnabled;
        });
        probeHost.replaceChildren(probe.element);
      };

      const renderGoal = (phase: Phase) => {
        if (phase === 'measure') {
          const segments = chainSegmentIds(state.lampCount);
          const done = segments.filter((id) => state.measuredSegments.includes(id)).length;
          goal.textContent = `Mide la fila con Ohm, punto por punto (${done} de ${segments.length}).`;
          return;
        }
        goal.textContent = GOAL_TEXT[phase];
      };

      const render = (forceOff: boolean) => {
        const phase = phaseOf(state);
        const blackedOut = forceOff;
        const river = chainRiver(state.push, state.lampCount);
        const brillo = blackedOut ? 0 : river;
        const glow = blackedOut ? 0 : Math.max(0.18, Math.min(1, river / 2));
        const glowRadius = Math.round(20 * glow);

        const slots = stage.querySelector<HTMLElement>('.chain-slots')!;
        slots.innerHTML = '';
        for (let index = 0; index < CHAIN_MAX_LAMPS; index++) {
          const occupied = index < state.lampCount;
          const socket = document.createElement('button');
          socket.className =
            'chain-socket ' + (occupied ? 'occupied' : 'available') + (blackedOut ? ' off' : '');
          const canRemove = phase === 'remove' || phase === 'restore';
          const canAdd = phase === 'restore';
          socket.disabled = solved || busy || (occupied ? !canRemove : !canAdd);
          socket.setAttribute('aria-label', occupied ? 'Quitar una lámpara' : 'Agregar una lámpara');
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

        stage.classList.toggle('blackout', blackedOut);
        stage.querySelectorAll('.chain-wire').forEach((wire) => {
          wire.classList.toggle('live', !blackedOut);
        });
        setGauge(stage, brillo, 4);
        stage.querySelector<HTMLElement>('.chain-band')!.textContent = bandLabel(
          blackedOut ? 'casi-nada' : chainBand(state.push, state.lampCount),
        );
        setOhmState(stage, ohmStateFor(state, blackedOut));

        sourceButtons.forEach((button, push) => {
          button.classList.toggle('selected', push === state.push);
          button.disabled = solved || busy || phase !== 'restore';
        });

        renderPredict(phase);
        renderProbes(phase);
        renderGoal(phase);
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
        'La Galería como la dejó el Consejo: cuatro lámparas donde había seis, todas igual de tenues. Antes de tocar nada, diagnostica la fila.',
      );
      render(false);
    },
  );
}

const GOAL_TEXT: Record<Phase, string> = {
  'predict-river': '¿Dónde crees que corre más río? Después, mídelo con Ohm.',
  measure: 'Mide la fila con Ohm, punto por punto.',
  'predict-removal': '¿Qué crees que les pasa a las otras si sacas una lámpara?',
  remove: 'Saca una lámpara y mira qué le pasa a la fila.',
  restore: 'Devuelve el brillo a las SEIS lámparas. Sin sacrificar ninguna.',
};

function phaseOf(state: ChainState): Phase {
  if (!state.predictions.river) return 'predict-river';
  if (!state.experiences.measuredSameRiver) return 'measure';
  if (!state.predictions.removal) return 'predict-removal';
  if (!state.experiences.removedLamp) return 'remove';
  return 'restore';
}

function appendPredictButtons<K extends string>(
  host: HTMLElement,
  options: { key: K; label: string }[],
  onPick: (key: K) => void,
): void {
  const row = document.createElement('div');
  row.className = 'bench-predict-row';
  for (const option of options) {
    const button = document.createElement('button');
    button.className = 'bench-predict-btn';
    button.textContent = option.label;
    button.addEventListener('click', () => onPick(option.key));
    row.appendChild(button);
  }
  host.appendChild(row);
}

function restoreFeedback(state: ChainState): string {
  const band = chainBand(state.push, state.lampCount);
  if (state.lampCount < CHAIN_MAX_LAMPS && band === 'bien') {
    return 'Las que están brillan bien… pero faltan lámparas en sus pedestales. La Galería entera, no media.';
  }
  if (band === 'demasiado') {
    return 'Pocas lámparas para tanto empuje: el río las castiga, brillan al borde de quemarse. La fila quiere compañía.';
  }
  if (band === 'tenue' || band === 'casi-nada') {
    return 'Las seis encendidas, pero apenas. En una fila larga el freno se suma: hace falta más empuje.';
  }
  return 'La fila comparte un solo río. Busca el brillo justo para las seis.';
}

function ohmStateFor(state: ChainState, blackedOut: boolean): 'inerte' | 'debil' | 'estable' | 'sobrecarga' {
  if (blackedOut) return 'inerte';
  const band = chainBand(state.push, state.lampCount);
  if (band === 'demasiado') return 'sobrecarga';
  if (band === 'bien') return 'estable';
  return 'debil';
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

function bandLabel(band: ChainBand): string {
  if (band === 'bien') return 'brillo justo';
  if (band === 'tenue') return 'tenue';
  if (band === 'casi-nada') return 'casi nada';
  return 'demasiado';
}
