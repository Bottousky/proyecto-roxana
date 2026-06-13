import { sfxBridge, sfxClick, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import { createSimTick, piedraEl, PIEDRAS, setTankLevel, tankSVG } from './common';
import {
  advanceClock,
  clockReading,
  configureClock,
  createClockState,
  type ClockBrake,
  type ClockTank,
  type ClockTiming,
} from './clockModel';

const TANKS: { value: ClockTank; label: string }[] = [
  { value: 1, label: 'chico' },
  { value: 2, label: 'mediano' },
  { value: 4, label: 'grande' },
];
const BRAKES: { key: string; value: ClockBrake }[] = [
  { key: 'marron', value: 1 },
  { key: 'roja', value: 2 },
  { key: 'amarilla', value: 4 },
  { key: 'gris', value: 8 },
];

const FAST_DIALOGUE = '<b>Farero:</b> «Ese reloj tomó café. Más despacio.»';
const SLOW_DIALOGUE =
  '<b>Farero:</b> «Ese reloj está por jubilarse. Un poco más de brío.»';
const JUST_DIALOGUE =
  '<b>Ohm:</b> «Otro estanque. El mismo tiempo.»<br/>' +
  '<b>Farero:</b> «Ese. Ese es el tic. Lo reconozco aunque me despierten a las tres.»';

export function abrirClock(onSolved: () => void, practica = false): void {
  openBench(
    'El Reloj de Ohmdal',
    'Devuélvale un tic justo al pueblo. Ritmo objetivo: 4.',
    (bench) => {
      let state = createClockState();
      let solved = false;

      const stage = document.createElement('div');
      stage.className = 'bench-stage clock-stage';
      stage.innerHTML = `
        <div class="clock-machine">
          <div class="clock-source">fuente</div>
          <div class="clock-channel">
            <span class="clock-flow"></span>
            <div class="clock-stone-slot"></div>
          </div>
          <div class="clock-tank" data-tank="1">
            <span class="clock-threshold">umbral de volcado</span>
            ${tankSVG()}
          </div>
          <div class="clock-pendulum" aria-label="Péndulo del Reloj">
            <div class="clock-face">
              <span class="clock-hand"></span>
            </div>
            <div class="clock-rod"></div>
            <div class="clock-weight"></div>
            <span>péndulo</span>
          </div>
        </div>
        <div class="clock-reference">
          <div>
            <strong>Referencia</strong>
            <span>tic objetivo · ritmo 4</span>
          </div>
          <div class="clock-reference-pulse"><span></span></div>
          <div class="clock-actual">
            <strong>Reloj</strong>
            <span class="clock-actual-label">adelanta</span>
          </div>
          <div class="clock-actual-pulse"><span></span></div>
        </div>
        <div class="clock-controls">
          <section>
            <h3>Estanque</h3>
            <div class="clock-tanks"></div>
          </section>
          <section>
            <h3>Freno del canal</h3>
            <div class="clock-brakes"></div>
          </section>
        </div>`;
      bench.root.appendChild(stage);

      const tankButtons: HTMLButtonElement[] = [];
      const brakeButtons: HTMLButtonElement[] = [];
      addTankChoices();
      addBrakeChoices();

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(onSolved),
        },
      ]);
      actions['Continuar'].classList.add('hidden');

      const tick = createSimTick((dtMs) => {
        const previousStep = state.pendulumStep;
        state = advanceClock(state, dtMs);
        if (state.pendulumStep > previousStep) sfxBridge();
        render();
      });
      bench.onClose(tick.stop);

      function addTankChoices(): void {
        const host = stage.querySelector<HTMLElement>('.clock-tanks')!;
        for (const tank of TANKS) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'clock-choice';
          button.dataset.tank = String(tank.value);
          button.innerHTML = `<strong>${tank.label}</strong><span>${tank.value}</span>`;
          button.addEventListener('click', () => {
            if (solved) return;
            sfxClick();
            state = configureClock(state, tank.value, state.brake);
            render();
            evaluateConfiguration();
          });
          host.appendChild(button);
          tankButtons.push(button);
        }
      }

      function addBrakeChoices(): void {
        const host = stage.querySelector<HTMLElement>('.clock-brakes')!;
        for (const brake of BRAKES) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'clock-brake';
          button.dataset.brake = String(brake.value);
          button.setAttribute('aria-label', `${PIEDRAS[brake.key].nombre}, freno ${brake.value}`);
          button.appendChild(piedraEl(brake.key));
          button.addEventListener('click', () => {
            if (solved) return;
            sfxClick();
            state = configureClock(state, state.tank, brake.value);
            render();
            evaluateConfiguration();
          });
          host.appendChild(button);
          brakeButtons.push(button);
        }
      }

      function evaluateConfiguration(): void {
        const timing = clockReading(state).timing;
        bench.setStatus(feedbackFor(timing));
        if (timing !== 'just' || practica || solved) return;

        solved = true;
        sfxWin();
        tankButtons.forEach((button) => {
          button.disabled = true;
        });
        brakeButtons.forEach((button) => {
          button.disabled = true;
        });
        actions['Alejarse'].classList.add('hidden');
        actions['Continuar'].classList.remove('hidden');
        bench.setStatus(
          `${JUST_DIALOGUE}<br/><br/><b>Toda la plaza oye el tic.</b> ` +
          'La voz que recuperó con la campana ahora tiene pulso.',
        );
      }

      function feedbackFor(timing: ClockTiming): string {
        if (timing === 'fast') return FAST_DIALOGUE;
        if (timing === 'slow') return SLOW_DIALOGUE;
        return JUST_DIALOGUE;
      }

      function render(): void {
        const reading = clockReading(state);
        setTankLevel(stage, state.level);
        stage.dataset.timing = reading.timing;
        stage.style.setProperty('--clock-period', `${reading.periodMs}ms`);
        stage.querySelector<HTMLElement>('.clock-tank')!.dataset.tank = String(state.tank);
        stage.querySelector<HTMLElement>('.clock-actual-label')!.textContent =
          reading.timing === 'fast'
            ? 'adelanta'
            : reading.timing === 'slow'
              ? 'atrasa'
              : 'tic justo';

        const stoneSlot = stage.querySelector<HTMLElement>('.clock-stone-slot')!;
        const brake = BRAKES.find((candidate) => candidate.value === state.brake)!;
        stoneSlot.replaceChildren(piedraEl(brake.key));
        stoneSlot.querySelector('.piedra')?.classList.add('in-slot');

        const side = state.pendulumStep % 2 === 0 ? -28 : 28;
        stage.querySelector<HTMLElement>('.clock-rod')!.style.transform = `rotate(${side}deg)`;
        stage.querySelector<HTMLElement>('.clock-weight')!.style.transform =
          `translateX(${side * 1.25}px)`;
        stage.querySelector<HTMLElement>('.clock-hand')!.style.transform =
          `rotate(${state.pendulumStep * 30}deg)`;

        tankButtons.forEach((button) => {
          button.classList.toggle('selected', button.dataset.tank === String(state.tank));
        });
        brakeButtons.forEach((button) => {
          button.classList.toggle('selected', button.dataset.brake === String(state.brake));
        });
      }

      bench.setStatus(
        'El Estanque se llena y vuelca solo. Cambie el Estanque o el freno para ajustar el tic.',
      );
      render();
    },
  );
}
