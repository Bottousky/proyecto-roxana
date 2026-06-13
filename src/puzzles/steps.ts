import { sfxOk, sfxWin } from '../audio';
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
  STEPS_PUSH,
  STEPS_RIVER_SEGMENTS,
  STEPS_STONES,
  createStepsState,
  isStepsSolved,
  observeStepsArm,
  observeStepsRiver,
  stepDrop,
  stepsLoopDebt,
  stepsRiverAt,
  type StepsArmId,
  type StepsRiverSegmentId,
  type StepsStoneId,
} from './stepsModel';

const STONES_DIALOGUE =
  '<b>Edda:</b> «Dos, dos, cuatro, ocho… son dieciséis. Lo que subió, bajó. Exacto. No sobra ni falta un escalón.»<br/>' +
  '<b>Ohm:</b> «Deuda de la vuelta: cero. Siempre cero.»';

const RIVER_DIALOGUE =
  '<b>Edda:</b> «El empuje baja por escalones… pero el río es el mismo en todos lados. No son la misma cosa. ¡NUNCA fueron la misma cosa!»';

const SOLVED_DIALOGUE =
  '<b>Guardiana:</b> «Mil veces vi bajar esa agua. Nunca vi que la cuenta cerraba sola.<br/>' +
  'El acueducto no es un misterio. Es una cuenta que siempre cerró, y yo no sabía leerla.»';

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
    'Una vuelta completa: medir el empuje abarcando y el río desde un tramo.',
    (bench) => {
      let state = createStepsState();
      let solved = false;

      const stage = document.createElement('div');
      stage.className = 'bench-stage steps-stage';
      stage.innerHTML = `
        <div class="steps-loop" aria-label="Vuelta completa del canal alto">
          <div class="steps-source">
            <span>manantial</span>
            <strong>Empuje ${STEPS_PUSH}</strong>
          </div>
          <div class="steps-wire live"></div>
          <div class="steps-stones" aria-label="Fila de cuatro piedras fijas"></div>
          <div class="steps-wire live"></div>
          <div class="steps-ground">tierra</div>
          <div class="steps-return">vuelta a tierra</div>
        </div>
        <div class="steps-ohm">${ohmWidgetHTML('Ohm · instrumentos')}</div>
        <div class="steps-modes" role="tablist" aria-label="Modo de medición">
          <button class="steps-mode active" data-mode="arms" role="tab">Brazos: escalón</button>
          <button class="steps-mode" data-mode="river" role="tab">Río: parado</button>
        </div>
        <div class="steps-measurements">
          <div class="steps-arms-host"></div>
          <div class="steps-river-host hidden"></div>
        </div>
        <div class="steps-progress" aria-label="Experiencias observadas">
          <span data-experience="spring">manantial</span>
          <span data-experience="stones">cuatro piedras</span>
          <span data-experience="river">río en cada tramo</span>
          <span data-experience="wholeLoop">vuelta entera</span>
        </div>`;
      bench.root.appendChild(stage);

      const stonesHost = stage.querySelector<HTMLElement>('.steps-stones')!;
      for (const stone of STEPS_STONES) {
        const wrapper = document.createElement('div');
        wrapper.className = 'steps-stone';
        wrapper.appendChild(piedraEl(stone.key));
        stonesHost.appendChild(wrapper);
      }

      const arms = ohmArms(
        ARM_PAIRS,
        (_from, _to, pair) => armReading(pair.id),
        (reading, pair) => measureArm(pair.id, reading),
      );
      stage.querySelector<HTMLElement>('.steps-arms-host')!.appendChild(arms.element);

      const probe = ohmProbe(
        STEPS_RIVER_SEGMENTS.map((id) => ({ id, label: RIVER_LABELS[id] })),
        (id) => `Río: ${stepsRiverAt(id as StepsRiverSegmentId)}.`,
        (reading, segment) =>
          measureRiver(segment.id as StepsRiverSegmentId, reading, segment.label),
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
          bench.setStatus(
            mode === 'arms'
              ? 'Ohm abre los brazos entre dos puntos y mide el escalón.'
              : 'Ohm se para en un tramo y mide el río.',
          );
        });
      });

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(onSolved),
        },
      ]);
      actions['Continuar'].classList.add('hidden');

      function measureArm(id: StepsArmId, reading: string): void {
        if (solved) return;
        const previous = state;
        state = observeStepsArm(state, id);
        sfxOk();

        let dialogue = `<b>Ohm:</b> «${reading}»`;
        if (id === 'spring' && !previous.experiences.spring) {
          dialogue = '<b>Ohm:</b> «Subida: dieciséis.»';
        } else if (id === 'whole-loop' && !previous.experiences.wholeLoop) {
          dialogue = '<b>Ohm:</b> «Deuda: cero.»';
        } else if (!previous.experiences.stones && state.experiences.stones) {
          dialogue = `<b>Ohm:</b> «${reading}»<br/>${STONES_DIALOGUE}`;
        }

        completeMeasurement(dialogue);
      }

      function measureRiver(
        id: StepsRiverSegmentId,
        reading: string,
        label: string,
      ): void {
        if (solved) return;
        const previous = state;
        state = observeStepsRiver(state, id);
        sfxOk();
        const dialogue =
          !previous.experiences.river && state.experiences.river
            ? `<b>${label}:</b> ${reading}<br/>${RIVER_DIALOGUE}`
            : `<b>${label}:</b> ${reading}`;
        completeMeasurement(dialogue);
      }

      function completeMeasurement(dialogue: string): void {
        renderProgress();
        if (!practica && isStepsSolved(state)) {
          solved = true;
          sfxWin();
          disableMeasurements();
          actions['Alejarse'].classList.add('hidden');
          actions['Continuar'].classList.remove('hidden');
          bench.setStatus(`${dialogue}<br/><br/>${SOLVED_DIALOGUE}`);
          return;
        }
        bench.setStatus(dialogue);
      }

      function disableMeasurements(): void {
        stage.querySelectorAll<HTMLButtonElement>('.steps-measurements button').forEach((button) => {
          button.disabled = true;
        });
        stage.querySelectorAll<HTMLButtonElement>('.steps-mode').forEach((button) => {
          button.disabled = true;
        });
      }

      function renderProgress(): void {
        for (const [experience, done] of Object.entries(state.experiences)) {
          stage
            .querySelector(`[data-experience="${experience}"]`)
            ?.classList.toggle('done', done);
        }
        setOhmState(stage, Object.values(state.experiences).some(Boolean) ? 'estable' : 'inerte');
      }

      bench.setStatus('Elija un modo. Ohm medirá un trecho por vez.');
      renderProgress();
    },
  );
}

function armReading(id: StepsArmId): string {
  if (id === 'spring') return `Subida: ${STEPS_PUSH}.`;
  if (id === 'whole-loop') return `Deuda: ${stepsLoopDebt()}.`;
  return `Escalón: ${stepDrop(id as StepsStoneId)}.`;
}
