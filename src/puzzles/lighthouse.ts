import { sfxBridge, sfxClick, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import { createSimTick, piedraEl, PIEDRAS, setTankLevel, tankSVG } from './common';
import {
  advanceLighthouse,
  configureLighthouse,
  createLighthouseState,
  lighthouseReading,
  type LighthouseBrake,
  type LighthouseTank,
  type LighthouseTiming,
} from './lighthouseModel';

const TANKS: { value: LighthouseTank; label: string }[] = [
  { value: 1, label: 'chico' },
  { value: 2, label: 'mediano' },
  { value: 4, label: 'grande' },
];
const BRAKES: { key: string; value: LighthouseBrake }[] = [
  { key: 'marron', value: 1 },
  { key: 'roja', value: 2 },
  { key: 'amarilla', value: 4 },
  { key: 'gris', value: 8 },
];

const FAST_DIALOGUE =
  '<b>Farero:</b> «Tartamudea. Ese no avisa: balbucea. Más lento, que el barco tiene que verlo venir.»';
const SLOW_DIALOGUE =
  '<b>Farero:</b> «Casi se queda quieto. Un faro dormido no salva a nadie. Un poco más de pulso.»';
const DRAGGED_DUMP_DIALOGUE =
  '<b>Farero:</b> «El tiempo es ese, lo reconozco… pero el destello se arrastra como despedida. Tiene que volcar de golpe: la salida, casi libre.»';
const JUST_DIALOGUE =
  '<b>Farero:</b> «Ese. Ese es. …Cuarenta años afinando el oído para esta noche.» ' +
  '<em>(se le llenan los ojos)</em><br/><br/>' +
  '<b>Ohm</b> gira hacia la luz; su pecho parpadea al mismo ritmo una vez.<br/>' +
  '<em>(silencio)</em><br/><br/>' +
  '<b>Edda:</b> «¿Ohm…? Tu pecho. Late igual que el Faro.»<br/>' +
  '<b>Ohm:</b> «Dato registrado. Sin explicación disponible. …Todavía.»';

export function abrirLighthouse(onSolved: () => void, practica = false): void {
  openBench(
    'El latido del Faro',
    'Llene despacio por un camino y vuelque de golpe por el otro. Ritmo objetivo: 8.',
    (bench) => {
      let state = createLighthouseState();
      let solved = false;

      const stage = document.createElement('div');
      stage.className = 'bench-stage lighthouse-stage';
      stage.innerHTML = `
        <div class="lighthouse-machine">
          <div class="lighthouse-source">fuente</div>
          <div class="lighthouse-channel lighthouse-charge-channel">
            <span class="lighthouse-flow"></span>
            <span class="lighthouse-path-label">canal de carga</span>
            <div class="lighthouse-charge-slot"></div>
          </div>
          <div class="lighthouse-tank" data-tank="1">
            <span class="lighthouse-threshold">umbral de volcado</span>
            ${tankSVG()}
          </div>
          <div class="lighthouse-channel lighthouse-discharge-channel">
            <span class="lighthouse-flow"></span>
            <span class="lighthouse-path-label">camino de volcado</span>
            <div class="lighthouse-discharge-slot"></div>
          </div>
          <div class="lighthouse-lens" aria-label="Lente del Faro">
            <span class="lighthouse-lens-glow"></span>
            <strong>lente</strong>
          </div>
        </div>
        <div class="lighthouse-lake">lago negro</div>
        <div class="lighthouse-reference">
          <div>
            <strong>Referencia</strong>
            <span>latido objetivo · ritmo 8 · ~2 s</span>
          </div>
          <div class="lighthouse-reference-pulse"><span></span></div>
          <div>
            <strong>Faro</strong>
            <span class="lighthouse-actual-label">demasiado rápido</span>
          </div>
          <div class="lighthouse-actual-pulse"><span></span></div>
        </div>
        <div class="lighthouse-controls">
          <section>
            <h3>Estanque</h3>
            <div class="lighthouse-tanks"></div>
          </section>
          <section>
            <h3>Freno de carga</h3>
            <div class="lighthouse-charge-brakes"></div>
          </section>
          <section>
            <h3>Freno de volcado</h3>
            <div class="lighthouse-discharge-brakes"></div>
          </section>
        </div>`;
      bench.root.appendChild(stage);

      const tankButtons: HTMLButtonElement[] = [];
      const chargeButtons: HTMLButtonElement[] = [];
      const dischargeButtons: HTMLButtonElement[] = [];
      addTankChoices();
      addBrakeChoices('charge');
      addBrakeChoices('discharge');

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
        if (solved) return;
        const previousFlash = state.flashCount;
        state = advanceLighthouse(state, dtMs);
        if (state.flashCount > previousFlash) sfxBridge();
        render();
      });
      bench.onClose(tick.stop);

      function addTankChoices(): void {
        const host = stage.querySelector<HTMLElement>('.lighthouse-tanks')!;
        for (const tank of TANKS) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'lighthouse-choice';
          button.dataset.tank = String(tank.value);
          button.innerHTML = `<strong>${tank.label}</strong><span>${tank.value}</span>`;
          button.addEventListener('click', () => {
            if (solved) return;
            sfxClick();
            state = configureLighthouse(
              state,
              tank.value,
              state.chargeBrake,
              state.dischargeBrake,
            );
            render();
            evaluateConfiguration();
          });
          host.appendChild(button);
          tankButtons.push(button);
        }
      }

      function addBrakeChoices(path: 'charge' | 'discharge'): void {
        const host = stage.querySelector<HTMLElement>(
          path === 'charge'
            ? '.lighthouse-charge-brakes'
            : '.lighthouse-discharge-brakes',
        )!;
        const buttons = path === 'charge' ? chargeButtons : dischargeButtons;
        for (const brake of BRAKES) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'lighthouse-brake';
          button.dataset.brake = String(brake.value);
          button.setAttribute(
            'aria-label',
            `${PIEDRAS[brake.key].nombre}, freno ${brake.value} de ${path === 'charge' ? 'carga' : 'volcado'}`,
          );
          button.appendChild(piedraEl(brake.key));
          button.addEventListener('click', () => {
            if (solved) return;
            sfxClick();
            state = configureLighthouse(
              state,
              state.tank,
              path === 'charge' ? brake.value : state.chargeBrake,
              path === 'discharge' ? brake.value : state.dischargeBrake,
            );
            render();
            evaluateConfiguration();
          });
          host.appendChild(button);
          buttons.push(button);
        }
      }

      function evaluateConfiguration(): void {
        const reading = lighthouseReading(state);
        if (!reading.valid || practica || solved) {
          bench.setStatus(feedbackFor(reading.timing, reading.briefDischarge));
          return;
        }

        solved = true;
        tick.stop();
        sfxWin();
        stage.classList.add('restored');
        [...tankButtons, ...chargeButtons, ...dischargeButtons].forEach((button) => {
          button.disabled = true;
        });
        actions['Alejarse'].classList.add('hidden');
        actions['Continuar'].classList.remove('hidden');
        bench.setStatus(
          '<b>El lago entero parpadea con la lente.</b><br/><br/>' + JUST_DIALOGUE,
        );
      }

      function feedbackFor(timing: LighthouseTiming, briefDischarge: boolean): string {
        if (timing === 'fast') return FAST_DIALOGUE;
        if (timing === 'slow') return SLOW_DIALOGUE;
        if (!briefDischarge) return DRAGGED_DUMP_DIALOGUE;
        return 'Ritmo de carga 8 y volcado breve. El Faro sostiene el latido restaurado.';
      }

      function render(): void {
        const reading = lighthouseReading(state);
        setTankLevel(stage, state.level);
        stage.dataset.timing = reading.timing;
        stage.dataset.phase = state.phase;
        stage.dataset.discharge = reading.briefDischarge ? 'brief' : 'dragged';
        stage.style.setProperty('--lighthouse-period', `${reading.chargePeriodMs}ms`);
        stage.querySelector<HTMLElement>('.lighthouse-tank')!.dataset.tank = String(state.tank);
        stage.querySelector<HTMLElement>('.lighthouse-actual-label')!.textContent =
          reading.timing === 'fast'
            ? 'demasiado rápido'
            : reading.timing === 'slow'
              ? 'demasiado lento'
              : reading.briefDischarge
                ? 'latido justo'
                : 'volcado lento';

        renderStone('.lighthouse-charge-slot', state.chargeBrake);
        renderStone('.lighthouse-discharge-slot', state.dischargeBrake);
        tankButtons.forEach((button) => {
          button.classList.toggle('selected', button.dataset.tank === String(state.tank));
        });
        chargeButtons.forEach((button) => {
          button.classList.toggle(
            'selected',
            button.dataset.brake === String(state.chargeBrake),
          );
        });
        dischargeButtons.forEach((button) => {
          button.classList.toggle(
            'selected',
            button.dataset.brake === String(state.dischargeBrake),
          );
        });
      }

      function renderStone(selector: string, value: LighthouseBrake): void {
        const slot = stage.querySelector<HTMLElement>(selector)!;
        const brake = BRAKES.find((candidate) => candidate.value === value)!;
        slot.replaceChildren(piedraEl(brake.key));
        slot.querySelector('.piedra')?.classList.add('in-slot');
      }

      bench.setStatus(
        'Ajuste los dos caminos. El Farero responde en cuanto cambia el ritmo.',
      );
      render();
    },
  );
}
