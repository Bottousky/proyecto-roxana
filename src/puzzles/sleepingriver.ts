import { sfxBridge, sfxClick, sfxOk, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  createSimTick,
  gaugeSVG,
  ohmProbe,
  ohmWidgetHTML,
  piedraEl,
  PIEDRAS,
  setGauge,
  setOhmState,
  setTankLevel,
  tankSVG,
} from './common';
import {
  advanceSleepingRiver,
  configureSleepingRiver,
  createSleepingRiverState,
  sleepingRiverReading,
  startSleepingRiver,
  type SleepingRiverBrake,
  type SleepingRiverTank,
} from './sleepingriverModel';

const TANKS: { value: SleepingRiverTank; label: string }[] = [
  { value: 1, label: 'chico' },
  { value: 2, label: 'mediano' },
  { value: 4, label: 'grande' },
];
const BRAKES: { key: string; value: SleepingRiverBrake }[] = [
  { key: 'marron', value: 1 },
  { key: 'roja', value: 2 },
  { key: 'amarilla', value: 4 },
  { key: 'gris', value: 8 },
];

const BREATHING_DIALOGUE =
  '<b>Edda:</b> «No se rompió. Se está llenando. ¡Mira la aguja, está RESPIRANDO!»';
const TIME_DIALOGUE =
  '<b>Ohm:</b> «Tiempo de llenado: estanque por freno. Más estanque, más espera. Más freno, más espera.»';
const FULL_DIALOGUE =
  '<b>Farero:</b> «¿Ven? Primero deja pasar. Después dice basta. Como yo a la hora de dormir.»';

export function abrirSleepingRiver(onSolved: () => void, practica = false): void {
  openBench(
    'El río que se duerme',
    'Elija un Estanque y una piedra de freno. Después, mire la aguja.',
    (bench) => {
      let state = createSleepingRiverState();
      let solved = false;
      let sawBreathing = practica;
      let sawSlow = practica;
      let sawFast = practica;
      let measuredZero = practica;
      let introducesBreathingThisRun = false;

      const stage = document.createElement('div');
      stage.className = 'bench-stage sleepingriver-stage';
      stage.innerHTML = `
        <div class="sleepingriver-network">
          <div class="sleepingriver-source">fuente</div>
          <div class="sleepingriver-channel">
            <span class="sleepingriver-flow"></span>
            <div class="sleepingriver-stone-slot"></div>
            <div class="sleepingriver-ohm">${ohmWidgetHTML('Ohm · río')}</div>
          </div>
          <div class="sleepingriver-tank" data-tank="2">${tankSVG()}</div>
        </div>
        <div class="sleepingriver-controls">
          <section>
            <h3>Estanque</h3>
            <div class="sleepingriver-tanks"></div>
          </section>
          <section>
            <h3>Freno del canal</h3>
            <div class="sleepingriver-brakes"></div>
          </section>
        </div>
        <div class="sleepingriver-instruments">
          <div class="sleepingriver-gauge">
            ${gaugeSVG(0, 0.18, 1)}
            <span>aguja del río</span>
          </div>
          <div class="sleepingriver-probe-host"></div>
        </div>
        <div class="sleepingriver-progress">
          <span data-progress="slow">canal angosto</span>
          <span data-progress="fast">canal ancho</span>
          <span data-progress="zero">río cero</span>
        </div>`;
      bench.root.appendChild(stage);

      const tankButtons: HTMLButtonElement[] = [];
      const brakeButtons: HTMLButtonElement[] = [];
      addTankChoices();
      addBrakeChoices();

      const probe = ohmProbe(
        [{ id: 'canal', label: 'Medir el canal con Ohm' }],
        () => {
          const reading = sleepingRiverReading(state);
          if (reading.full) return 'Río: cero. El Estanque está lleno.';
          if (!state.filling) return 'Río: cero. El llenado todavía no empezó.';
          if (reading.riverFlow > 0.65) return 'Río: fuerte.';
          if (reading.riverFlow > 0.15) return 'Río: debilitándose.';
          return 'Río: casi dormido.';
        },
        (reading) => {
          sfxOk();
          const full = sleepingRiverReading(state).full;
          if (full) measuredZero = true;
          bench.setStatus(`<b>Ohm:</b> «${reading}»${full ? `<br/>${FULL_DIALOGUE}` : ''}`);
          renderProgress();
          checkSolved();
        },
      );
      stage.querySelector<HTMLElement>('.sleepingriver-probe-host')!.appendChild(probe.element);

      const actions = benchActions(bench.root, [
        {
          label: 'Llenar',
          primary: true,
          onClick: () => {
            if (solved || state.filling) return;
            state = startSleepingRiver(state);
            probe.clear();
            sfxBridge();
            introducesBreathingThisRun = !sawBreathing;
            bench.setStatus(
              sawBreathing
                ? 'El río entra fuerte. La aguja empieza a bajar sola.'
                : BREATHING_DIALOGUE,
            );
            sawBreathing = true;
            render();
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
        if (solved || !state.filling) return;
        const wasFilling = state.filling;
        state = advanceSleepingRiver(state, dtMs);
        render();
        if (wasFilling && !state.filling) finishRun();
      });
      bench.onClose(tick.stop);

      function addTankChoices(): void {
        const host = stage.querySelector<HTMLElement>('.sleepingriver-tanks')!;
        for (const tank of TANKS) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'sleepingriver-choice';
          button.dataset.tank = String(tank.value);
          button.innerHTML = `<strong>${tank.label}</strong><span>${tank.value}</span>`;
          button.addEventListener('click', () => {
            if (state.filling || solved) return;
            sfxClick();
            state = configureSleepingRiver(state, tank.value, state.brake);
            probe.clear();
            bench.setStatus(`Estanque ${tank.label}. Elija el freno y pulse «Llenar».`);
            render();
          });
          host.appendChild(button);
          tankButtons.push(button);
        }
      }

      function addBrakeChoices(): void {
        const host = stage.querySelector<HTMLElement>('.sleepingriver-brakes')!;
        for (const brake of BRAKES) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'sleepingriver-brake';
          button.dataset.brake = String(brake.value);
          button.setAttribute('aria-label', `${PIEDRAS[brake.key].nombre}, freno ${brake.value}`);
          button.appendChild(piedraEl(brake.key));
          button.addEventListener('click', () => {
            if (state.filling || solved) return;
            sfxClick();
            state = configureSleepingRiver(state, state.tank, brake.value);
            probe.clear();
            bench.setStatus(`${PIEDRAS[brake.key].nombre}. Elija el Estanque y pulse «Llenar».`);
            render();
          });
          host.appendChild(button);
          brakeButtons.push(button);
        }
      }

      function finishRun(): void {
        if (state.tank === 4 && state.brake === 8) sawSlow = true;
        if (state.tank === 1 && state.brake === 1) sawFast = true;
        renderProgress();

        let message: string;
        if (sawSlow && sawFast) {
          message = `${TIME_DIALOGUE}<br/><br/>Ahora mida el canal lleno.`;
        } else if (state.tank === 4 && state.brake === 8) {
          message = 'El río se durmió despacio. Ahora pruebe el Estanque chico con la piedra marrón.';
        } else if (state.tank === 1 && state.brake === 1) {
          message = 'El río se durmió casi de golpe. Ahora pruebe el Estanque grande con la piedra gris.';
        } else {
          message = 'El Estanque está lleno y la aguja llegó a cero. Pruebe los dos extremos.';
        }
        bench.setStatus(
          introducesBreathingThisRun ? `${BREATHING_DIALOGUE}<br/><br/>${message}` : message,
        );
        introducesBreathingThisRun = false;
        checkSolved();
      }

      function checkSolved(): void {
        if (practica || solved || !sawBreathing || !sawSlow || !sawFast || !measuredZero) return;
        solved = true;
        tick.stop();
        sfxWin();
        tankButtons.forEach((button) => {
          button.disabled = true;
        });
        brakeButtons.forEach((button) => {
          button.disabled = true;
        });
        probe.element.querySelectorAll('button').forEach((button) => {
          button.disabled = true;
        });
        actions['Llenar'].disabled = true;
        actions['Alejarse'].classList.add('hidden');
        actions['Continuar'].classList.remove('hidden');
        bench.setStatus(`${TIME_DIALOGUE}<br/>${FULL_DIALOGUE}`);
      }

      function render(): void {
        const reading = sleepingRiverReading(state);
        setTankLevel(stage, state.level);
        setGauge(stage, reading.riverFlow, 1);
        setOhmState(stage, reading.riverFlow > 0.5 ? 'estable' : reading.riverFlow > 0 ? 'debil' : 'inerte');
        const flow = stage.querySelector<HTMLElement>('.sleepingriver-flow')!;
        flow.style.opacity = String(0.12 + reading.riverFlow * 0.88);
        flow.style.boxShadow = `0 0 ${reading.riverFlow * 13}px rgba(255,211,77,.75)`;
        stage.querySelector<HTMLElement>('.sleepingriver-tank')!.dataset.tank = String(state.tank);
        const stoneSlot = stage.querySelector<HTMLElement>('.sleepingriver-stone-slot')!;
        const brake = BRAKES.find((candidate) => candidate.value === state.brake)!;
        stoneSlot.replaceChildren(piedraEl(brake.key));
        stoneSlot.querySelector('.piedra')?.classList.add('in-slot');
        tankButtons.forEach((button) => {
          button.classList.toggle('selected', button.dataset.tank === String(state.tank));
          button.disabled = state.filling || solved;
        });
        brakeButtons.forEach((button) => {
          button.classList.toggle('selected', button.dataset.brake === String(state.brake));
          button.disabled = state.filling || solved;
        });
        actions['Llenar'].disabled = state.filling || solved;
        renderProgress();
      }

      function renderProgress(): void {
        stage.querySelector('[data-progress="slow"]')?.classList.toggle('done', sawSlow);
        stage.querySelector('[data-progress="fast"]')?.classList.toggle('done', sawFast);
        stage.querySelector('[data-progress="zero"]')?.classList.toggle('done', measuredZero);
      }

      bench.setStatus('Elija un Estanque y un freno. La aguja se moverá sola al llenar.');
      render();
    },
  );
}
