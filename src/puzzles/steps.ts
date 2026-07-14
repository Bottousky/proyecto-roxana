import { sfxClick, sfxOk, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  ohmArms,
  ohmProbe,
  ohmWidgetHTML,
  piedraEl,
  setOhmState,
  type OhmArmsPair,
} from './common';
import {
  STEPS_PREDICTION_OPTIONS,
  STEPS_PUSH,
  STEPS_RIVER_SEGMENTS,
  STEPS_STONES,
  STEPS_STONE_VALUES,
  STEPS_TARGET_DROPS,
  commitStepsPrediction,
  configureStepsStone,
  createStepsState,
  isStepsSolved,
  observeStepsArm,
  observeStepsRiver,
  openStepsGate,
  stepDrop,
  stepsLoopDebt,
  stepsRiverAt,
  type StepsArmId,
  type StepsPrediction,
  type StepsRiverSegmentId,
  type StepsStoneValue,
} from './stepsModel';

const GUARDIAN_WARNING =
  '<b>Guardiana:</b> «La compuerta alta quedó desordenada: el primer golpe recibe demasiado y el último casi nada. Necesito que los escalones crezcan al bajar.»';

const INVALID_DIALOGUE =
  '<b>Ohm:</b> «Escalones desordenados. La vuelta cierra, pero el reparto golpea donde no debe.»';

const VALID_DIALOGUE =
  '<b>Ohm:</b> «Dos, dos, cuatro, ocho. La vuelta cierra y el agua baja sin golpes.»';

const CANONICAL_OBSERVATIONS =
  '<b>Edda:</b> «Dos, dos, cuatro, ocho… son dieciséis. Lo que subió, bajó. Exacto. No sobra ni falta un escalón.»<br/>' +
  '<b>Ohm:</b> «Deuda de la vuelta: cero. Siempre cero.»<br/>' +
  '<b>Edda:</b> «El empuje baja por escalones… pero el río es el mismo en todos lados. No son la misma cosa. ¡NUNCA fueron la misma cosa!»';

const SOLVED_DIALOGUE =
  '<b>Guardiana:</b> «Mil veces vi bajar esa agua. Nunca vi que la cuenta cerraba sola.<br/>' +
  'El acueducto no es un misterio. Es una cuenta que siempre cerró, y yo no sabía leerla.»';

const STONE_KEYS: Record<StepsStoneValue, 'marron' | 'roja' | 'amarilla' | 'gris'> = {
  1: 'marron',
  2: 'roja',
  4: 'amarilla',
  8: 'gris',
};

const ARM_PAIRS: OhmArmsPair<StepsArmId>[] = [
  { id: 'spring', label: 'Abrazar el manantial', from: 'ground', to: 'spring-top' },
  ...STEPS_STONES.map((stone, index) => ({
    id: stone.id,
    label: `Abrazar piedra ${index + 1}`,
    from: `stone-${index + 1}-before`,
    to: `stone-${index + 1}-after`,
  })),
  {
    id: 'whole-loop',
    label: 'Abrazar la vuelta entera',
    from: 'ground-start',
    to: 'ground-return',
  },
];

const RIVER_LABELS: Record<StepsRiverSegmentId, string> = {
  'before-stone-1': 'Antes de la primera piedra',
  'between-stones-1-2': 'Entre las piedras 1 y 2',
  'between-stones-2-3': 'Entre las piedras 2 y 3',
  'between-stones-3-4': 'Entre las piedras 3 y 4',
  'after-stone-4': 'Después de la cuarta piedra',
};

export function abrirSteps(onSolved: () => void, practica = false): void {
  openBench(
    'Los escalones',
    'Reordene el reparto: los cuatro escalones deben crecer al bajar.',
    (bench) => {
      let state = createStepsState();
      let solved = false;

      const stage = document.createElement('div');
      stage.className = 'bench-stage steps-stage';
      stage.innerHTML = `
        <div class="steps-brief">
          ${GUARDIAN_WARNING}
          <div class="steps-goal">Objetivo visible: escalones ${STEPS_TARGET_DROPS.join(' · ')}, crecientes al bajar.</div>
        </div>
        <section class="steps-prediction" aria-label="Predicción de Edda">
          <strong>Antes de moverlas: ¿qué lugar debería cobrar el escalón más grande?</strong>
          <div class="steps-prediction-options"></div>
        </section>
        <div class="steps-loop" aria-label="Vuelta completa del canal alto">
          <div class="steps-source">
            <span>manantial</span>
            <strong>Empuje ${STEPS_PUSH}</strong>
          </div>
          <div class="steps-wire live"></div>
          <div class="steps-stones" aria-label="Fila configurable de cuatro piedras"></div>
          <div class="steps-wire live"></div>
          <div class="steps-ground">tierra</div>
          <div class="steps-return">vuelta a tierra</div>
        </div>
        <button class="steps-open-gate" type="button" disabled>Abrir la compuerta</button>
        <div class="steps-feedback" aria-live="polite">Prediga antes de abrir la compuerta.</div>
        <details class="steps-explore">
          <summary>Explorar con Ohm</summary>
          <div class="steps-ohm">${ohmWidgetHTML('Ohm · instrumentos')}</div>
          <div class="steps-modes" role="tablist" aria-label="Modo de medición">
            <button class="steps-mode active" data-mode="arms" role="tab">Brazos: escalón</button>
            <button class="steps-mode" data-mode="river" role="tab">Río: parado</button>
          </div>
          <div class="steps-measurements">
            <div class="steps-arms-host"></div>
            <div class="steps-river-host hidden"></div>
          </div>
        </details>`;
      bench.root.appendChild(stage);

      const predictionHost = stage.querySelector<HTMLElement>('.steps-prediction-options')!;
      for (const option of STEPS_PREDICTION_OPTIONS) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'steps-prediction-option';
        button.textContent = option;
        button.addEventListener('click', () => commitPrediction(option));
        predictionHost.appendChild(button);
      }

      const stonesHost = stage.querySelector<HTMLElement>('.steps-stones')!;
      const stoneControls: HTMLButtonElement[] = [];
      for (let index = 0; index < STEPS_STONES.length; index += 1) {
        const wrapper = document.createElement('div');
        wrapper.className = 'steps-stone';
        wrapper.innerHTML = `<span>Posición ${index + 1}</span>`;
        const control = document.createElement('button');
        control.type = 'button';
        control.className = 'steps-stone-control';
        control.disabled = true;
        control.addEventListener('click', () => {
          const current = STEPS_STONE_VALUES.indexOf(state.configuration[index]);
          const next = STEPS_STONE_VALUES[(current + 1) % STEPS_STONE_VALUES.length];
          chooseStone(index, next);
        });
        wrapper.appendChild(control);
        stonesHost.appendChild(wrapper);
        stoneControls.push(control);
      }

      const arms = ohmArms(
        ARM_PAIRS,
        (_from, _to, pair) => armReading(pair.id, state.configuration),
        (reading, pair) => {
          state = observeStepsArm(state, pair.id);
          sfxOk();
          setOhmState(stage, 'estable');
          bench.setStatus(`<b>Ohm:</b> «${reading}»`);
        },
      );
      stage.querySelector<HTMLElement>('.steps-arms-host')!.appendChild(arms.element);

      const probe = ohmProbe(
        STEPS_RIVER_SEGMENTS.map((id) => ({ id, label: RIVER_LABELS[id] })),
        (id) => `Río: ${formatNumber(stepsRiverAt(id as StepsRiverSegmentId, state.configuration))}.`,
        (reading, segment) => {
          state = observeStepsRiver(state, segment.id as StepsRiverSegmentId);
          sfxOk();
          setOhmState(stage, 'estable');
          bench.setStatus(`<b>${segment.label}:</b> ${reading}`);
        },
      );
      stage.querySelector<HTMLElement>('.steps-river-host')!.appendChild(probe.element);

      stage.querySelectorAll<HTMLButtonElement>('.steps-mode').forEach((button) => {
        button.addEventListener('click', () => {
          const mode = button.dataset.mode;
          stage.querySelectorAll('.steps-mode').forEach((candidate) => {
            candidate.classList.toggle('active', candidate === button);
          });
          stage.querySelector('.steps-arms-host')?.classList.toggle('hidden', mode !== 'arms');
          stage.querySelector('.steps-river-host')?.classList.toggle('hidden', mode !== 'river');
          if (mode === 'arms') probe.clear();
          else arms.clear();
        });
      });

      const openGateButton = stage.querySelector<HTMLButtonElement>('.steps-open-gate')!;
      openGateButton.addEventListener('click', tryConfiguration);

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        { label: 'Continuar', primary: true, onClick: () => bench.close(onSolved) },
      ]);
      actions['Continuar'].classList.add('hidden');

      function commitPrediction(prediction: StepsPrediction): void {
        if (state.prediction !== null) return;
        state = commitStepsPrediction(state, prediction);
        sfxClick();
        stage.querySelectorAll<HTMLButtonElement>('.steps-prediction-option').forEach((button) => {
          button.disabled = true;
          button.classList.toggle('selected', button.textContent === prediction);
        });
        stoneControls.forEach((control) => { control.disabled = false; });
        openGateButton.disabled = false;
        bench.setStatus(`<b>Edda:</b> «Anotado: ${prediction}. Ahora sí, movamos las piedras.»`);
      }

      function chooseStone(index: number, resistance: StepsStoneValue): void {
        if (solved) return;
        state = configureStepsStone(state, index, resistance);
        sfxClick();
        arms.clear();
        probe.clear();
        renderConfiguration();
        stage.querySelector<HTMLElement>('.steps-feedback')!.textContent =
          'Fila preparada. Abra la compuerta para probarla.';
      }

      function tryConfiguration(): void {
        if (solved || state.prediction === null) return;
        state = openStepsGate(state);
        const attempt = state.lastAttempt!;
        renderAttempt();

        if (attempt.valid) {
          sfxWin();
          setOhmState(stage, 'estable');
          if (!practica && isStepsSolved(state)) {
            solved = true;
            disablePuzzle();
            actions['Alejarse'].classList.add('hidden');
            actions['Continuar'].classList.remove('hidden');
            bench.setStatus(`${VALID_DIALOGUE}<br/>${CANONICAL_OBSERVATIONS}<br/><br/>${SOLVED_DIALOGUE}`);
          } else {
            bench.setStatus(`${VALID_DIALOGUE}<br/>${CANONICAL_OBSERVATIONS}`);
          }
          return;
        }

        sfxOk();
        setOhmState(stage, 'debil');
        const directions = attempt.directions
          .map((direction, index) => {
            if (direction === 'exacto') return `Escalón ${index + 1}: exacto`;
            return `Escalón ${index + 1}: debe ${direction === 'sube' ? 'subir' : 'bajar'}`;
          })
          .join(' · ');
        bench.setStatus(`${INVALID_DIALOGUE}<br/>${directions}. Puede corregir la fila y volver a abrir.`);
      }

      function renderConfiguration(): void {
        stoneControls.forEach((control, index) => {
          const value = state.configuration[index];
          control.setAttribute('aria-label', `Piedra ${value} en posición ${index + 1}. Activar para cambiar.`);
          control.replaceChildren(piedraEl(STONE_KEYS[value]));
        });
      }

      function renderAttempt(): void {
        const attempt = state.lastAttempt!;
        stage.querySelector<HTMLElement>('.steps-feedback')!.innerHTML = `
          <span>Escalones <strong>${attempt.drops.map(formatNumber).join(' · ')}</strong></span>
          <span>Río común <strong>${formatNumber(attempt.river)}</strong></span>
          <span>Deuda de vuelta <strong>${formatNumber(attempt.loopDebt)}</strong></span>`;
      }

      function disablePuzzle(): void {
        stoneControls.forEach((control) => { control.disabled = true; });
        openGateButton.disabled = true;
        stage.querySelectorAll<HTMLButtonElement>('.steps-measurements button, .steps-mode').forEach((button) => {
          button.disabled = true;
        });
      }

      renderConfiguration();
      setOhmState(stage, 'inerte');
      bench.setStatus(GUARDIAN_WARNING);
    },
    {
      theme: 'terraces',
      location: 'Las Terrazas · canal alto',
      mechanism: 'Compuerta de reparto',
      worldCloseup: true,
    },
  );
}

function armReading(id: StepsArmId, configuration: readonly StepsStoneValue[]): string {
  if (id === 'spring') return `Subida: ${STEPS_PUSH}.`;
  if (id === 'whole-loop') return `Deuda: ${formatNumber(stepsLoopDebt(configuration))}.`;
  return `Escalón: ${formatNumber(stepDrop(id, configuration))}.`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}
