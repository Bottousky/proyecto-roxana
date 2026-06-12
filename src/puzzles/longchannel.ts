import { sfxBridge, sfxDim, sfxHot, sfxOk, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  PIEDRAS,
  canalCortable,
  piedraEl,
  setThermometer,
  thermometerSVG,
} from './common';
import {
  LONG_CHANNEL_MAX_STONES,
  LONG_CHANNEL_PUSHES,
  LONG_CHANNEL_STONES,
  addLongChannelStone,
  attemptLongChannel,
  createLongChannelState,
  evaluateLongChannel,
  removeLongChannelStone,
  repairLongChannel,
  setLongChannelPush,
  type LongChannelEvaluation,
  type LongChannelPush,
} from './longchannelModel';
import { longChannelSolvedDialogue } from './longchannelDialogue';

export interface AbrirLongChannelOptions {
  onSolved: () => void;
  practica?: boolean;
}

const REPAIR_COMMENTS = [
  '<b>Forjadora:</b> «Una.»',
  '<b>Forjadora:</b> «Dos. Me estás cobrando el favor.»',
  '<b>Forjadora:</b> «Tres. La próxima lo reempalmas tú.»',
];

const EQUIVALENCE_DIALOGUE =
  '<b>Ohm:</b> «Misma entrega. Peaje distinto. La Forjadora prefiere el frío.»';

export function abrirLongChannel(opts: AbrirLongChannelOptions): void {
  const practica = opts.practica ?? false;
  openBench(
    'El Canal Largo',
    'Una sola entrega puede viajar con mucho río o con mucho empuje.',
    (bench) => {
      let state = createLongChannelState();
      let solvedHandled = false;
      let equivalenceHandled = false;

      const sourceTray = document.createElement('div');
      sourceTray.className = 'bench-tray longchannel-sources';
      sourceTray.innerHTML = '<span class="tray-label">Cristal de Empuje:</span>';
      const sourceButtons = new Map<LongChannelPush, HTMLButtonElement>();
      for (const push of LONG_CHANNEL_PUSHES) {
        const button = document.createElement('button');
        button.className = 'fuente-opt longchannel-source';
        button.textContent = `Empuje ${push}`;
        button.addEventListener('click', () => {
          if (state.channel.cut || solvedHandled) return;
          state = setLongChannelPush(state, push);
          sfxBridge();
          render();
          bench.setStatus(`Cristal de Empuje ${push} engastado.`);
        });
        sourceButtons.set(push, button);
        sourceTray.appendChild(button);
      }
      bench.root.appendChild(sourceTray);

      const stage = document.createElement('div');
      stage.className = 'bench-stage longchannel-stage';
      stage.innerHTML = `
        <div class="longchannel-network">
          <div class="longchannel-crystal">Empuje <span>4</span></div>
          <div class="longchannel-line">
            <div class="longchannel-point" data-point="inicio">
              <span>inicio</span>
              <div class="longchannel-thermometer">${thermometerSVG()}</div>
            </div>
            <div class="longchannel-copper"></div>
            <div class="longchannel-point" data-point="medio">
              <span>mitad</span>
              <div class="longchannel-thermometer">${thermometerSVG()}</div>
            </div>
            <div class="longchannel-copper"></div>
            <div class="longchannel-point" data-point="horno">
              <span>horno</span>
              <div class="longchannel-thermometer">${thermometerSVG()}</div>
            </div>
          </div>
          <div class="longchannel-furnace">
            <strong>HORNO LEJANO</strong>
            <span>ENTREGA 16</span>
          </div>
        </div>
        <div class="longchannel-readings">
          <span data-reading="brake">Freno total: 0</span>
          <span data-reading="river">Río: 0</span>
          <span data-reading="delivery">Entrega: 0 / 16</span>
        </div>
        <div class="longchannel-row" aria-label="Fila de piedras junto al horno"></div>`;
      bench.root.appendChild(stage);

      const stoneTray = document.createElement('div');
      stoneTray.className = 'bench-tray longchannel-stones';
      stoneTray.innerHTML = '<span class="tray-label">Piedras para la fila:</span>';
      for (const stone of LONG_CHANNEL_STONES) {
        const element = piedraEl(stone);
        element.setAttribute('role', 'button');
        element.setAttribute('tabindex', '0');
        const add = () => {
          if (
            state.channel.cut ||
            solvedHandled ||
            state.stones.length >= LONG_CHANNEL_MAX_STONES
          ) {
            return;
          }
          state = addLongChannelStone(state, stone);
          sfxBridge();
          render();
          bench.setStatus(
            `${PIEDRAS[stone].nombre} añadida. Los frenos de la fila se suman.`,
          );
        };
        element.addEventListener('click', add);
        element.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            add();
          }
        });
        stoneTray.appendChild(element);
      }
      bench.root.appendChild(stoneTray);

      const breakable = canalCortable('Canal largo angosto');
      breakable.element.classList.add('longchannel-breakable');
      bench.root.appendChild(breakable.element);

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'La Forjadora reempalma',
          onClick: repair,
        },
        {
          label: 'Alimentar el horno',
          primary: true,
          onClick: attempt,
        },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(opts.onSolved),
        },
      ]);
      actions['La Forjadora reempalma'].classList.add('hidden');
      actions['Continuar'].classList.add('hidden');

      function attempt(): void {
        if (state.channel.cut || solvedHandled) return;
        const result = attemptLongChannel(state);
        state = result.state;
        const visualResult = breakable.setLevel(result.evaluation.level);
        render(result.evaluation);

        if (result.event === 'cut' && visualResult === 'cut') {
          sfxHot();
          stage.classList.add('cut');
          actions['La Forjadora reempalma'].classList.remove('hidden');
          bench.setStatus('El canal se corta a mitad de camino.');
          return;
        }
        if (result.event === 'red-warning') {
          sfxHot();
          bench.setStatus(
            `La entrega llega a 16, pero el canal está al rojo. Aviso ${state.channel.insistences} de 3.`,
          );
          return;
        }
        if (result.event === 'incomplete') {
          sfxDim();
          bench.setStatus('Falta engastar al menos una piedra junto al horno.');
          return;
        }
        if (result.event === 'wrong-delivery') {
          sfxDim();
          bench.setStatus(
            `El horno pide entrega 16. Esta fila entrega ${formatNumber(result.evaluation.delivery)}.`,
          );
          return;
        }
        if (result.event !== 'valid') return;

        sfxOk();
        const foundBoth = state.foundCold && state.foundWarm;
        if (foundBoth && !equivalenceHandled) {
          equivalenceHandled = true;
        }

        if (practica) {
          bench.setStatus(
            foundBoth
              ? EQUIVALENCE_DIALOGUE
              : `Entrega 16. Canal ${heatLabel(result.evaluation.level)}. El horno respira.`,
          );
          return;
        }

        solvedHandled = true;
        sfxWin();
        stage.classList.add('solved');
        actions['Alejarse'].classList.add('hidden');
        actions['Alimentar el horno'].classList.add('hidden');
        actions['Continuar'].classList.remove('hidden');
        bench.setStatus(
          (foundBoth ? `${EQUIVALENCE_DIALOGUE}<br/><br/>` : '') +
            longChannelSolvedDialogue(result.evaluation.level),
        );
        render(result.evaluation);
      }

      function repair(): void {
        state = repairLongChannel(state);
        breakable.reset();
        stage.classList.remove('cut');
        actions['La Forjadora reempalma'].classList.add('hidden');
        sfxBridge();
        const comment =
          REPAIR_COMMENTS[Math.min(state.repairs - 1, REPAIR_COMMENTS.length - 1)];
        bench.setStatus(comment);
        render();
      }

      function render(forcedEvaluation?: LongChannelEvaluation): void {
        const evaluation =
          forcedEvaluation ?? evaluateLongChannel(state.push, state.stones);
        stage.querySelector<HTMLElement>('.longchannel-crystal span')!.textContent =
          String(state.push);
        stage.querySelector<HTMLElement>('[data-reading="brake"]')!.textContent =
          `Freno total: ${formatNumber(evaluation.resistance)}`;
        stage.querySelector<HTMLElement>('[data-reading="river"]')!.textContent =
          `Río: ${formatNumber(evaluation.river)}`;
        stage.querySelector<HTMLElement>('[data-reading="delivery"]')!.textContent =
          `Entrega: ${formatNumber(evaluation.delivery)} / 16`;

        stage.querySelectorAll<HTMLElement>('.longchannel-thermometer').forEach((host) => {
          setThermometer(host, evaluation.level);
        });
        stage.dataset.level = evaluation.level;
        stage.classList.toggle('exact', evaluation.exactDelivery);

        sourceButtons.forEach((button, push) => {
          button.classList.toggle('selected', push === state.push);
          button.disabled = state.channel.cut || solvedHandled;
        });

        const row = stage.querySelector<HTMLElement>('.longchannel-row')!;
        row.innerHTML = '';
        state.stones.forEach((stone, index) => {
          const slot = document.createElement('button');
          slot.className = 'longchannel-slot';
          slot.title = `Quitar ${PIEDRAS[stone].nombre}`;
          slot.disabled = state.channel.cut || solvedHandled;
          const stoneVisual = piedraEl(stone);
          stoneVisual.classList.add('in-slot');
          slot.appendChild(stoneVisual);
          slot.addEventListener('click', () => {
            state = removeLongChannelStone(state, index);
            sfxBridge();
            render();
          });
          row.appendChild(slot);
        });
        for (let index = state.stones.length; index < LONG_CHANNEL_MAX_STONES; index++) {
          const empty = document.createElement('span');
          empty.className = 'longchannel-slot empty';
          empty.textContent = '+';
          row.appendChild(empty);
        }

        stoneTray.querySelectorAll<HTMLElement>('.piedra').forEach((stone) => {
          stone.setAttribute(
            'aria-disabled',
            String(
              state.channel.cut ||
                solvedHandled ||
                state.stones.length >= LONG_CHANNEL_MAX_STONES,
            ),
          );
        });
        actions['Alimentar el horno'].disabled = state.channel.cut || solvedHandled;
      }

      bench.setStatus(
        'Elige un cristal y arma una fila de piedras. El horno exige ENTREGA 16; el canal angosto tolera río 2.',
      );
      render();
    },
  );
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function heatLabel(level: LongChannelEvaluation['level']): string {
  if (level === 'frio') return 'frío';
  if (level === 'rojo') return 'al rojo';
  return level;
}
