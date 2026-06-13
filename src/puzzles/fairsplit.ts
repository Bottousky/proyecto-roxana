import { sfxClick, sfxOk, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  gaugeSVG,
  ohmArms,
  ohmWidgetHTML,
  piedraEl,
  PIEDRAS,
  setGauge,
  setOhmState,
  type OhmArmsPair,
} from './common';
import {
  FAIR_SPLIT_HIGH_TARGET,
  FAIR_SPLIT_LOW_TARGET,
  FAIR_SPLIT_PUSH,
  calculateFairSplit,
  isEqualFairSplit,
  isFairSplitSolution,
  type FairSplitStone,
} from './fairsplitModel';

const STONES: FairSplitStone[] = ['marron', 'roja', 'amarilla', 'gris'];
type FairSplitArmId = 'high' | 'low';

const ARM_PAIRS: OhmArmsPair<FairSplitArmId>[] = [
  {
    id: 'high',
    label: 'Abrazar terraza alta',
    from: 'antes-terraza-alta',
    to: 'despues-terraza-alta',
  },
  {
    id: 'low',
    label: 'Abrazar terraza baja',
    from: 'antes-terraza-baja',
    to: 'despues-terraza-baja',
  },
];

const EQUAL_DIALOGUE =
  '<b>Ohm:</b> «Reparto igual. Objetivo: desigual. Ajuste la proporción.»';

const SOLVED_DIALOGUE =
  '<b>Edda:</b> «¡Las dos andan! Pero la de piedras grandes pide menos río al manantial…»<br/>' +
  '<b>Guardiana:</b> «Menos agua para el mismo riego. Eso… eso es lo que yo nunca supe calcular.»<br/>' +
  '<b>Ohm:</b> «El reparto es proporción, no tamaño. La proporción manda.»<br/><br/>' +
  '<b>Guardiana:</b> «Toqué una piedra. Por una razón. Con un número.<br/>' +
  '…No tembló el valle. Se ordenó.»';

export function abrirFairSplit(onSolved: () => void, practica = false): void {
  openBench(
    'El reparto justo',
    'Dos terrazas en fila. Cada piedra cobra una parte del mismo empuje.',
    (bench) => {
      let highStone: FairSplitStone = 'roja';
      let lowStone: FairSplitStone = 'roja';
      let result = calculateFairSplit(highStone, lowStone);
      let solved = false;

      const stage = document.createElement('div');
      stage.className = 'bench-stage fairsplit-stage';
      stage.innerHTML = `
        <div class="fairsplit-source">
          <span>manantial</span>
          <strong>Empuje ${FAIR_SPLIT_PUSH}</strong>
        </div>
        <div class="fairsplit-channel live"></div>
        <div class="fairsplit-terraces" aria-label="Dos terrazas en fila">
          <section class="fairsplit-terrace high">
            <h3>Terraza alta</h3>
            <div class="fairsplit-slot" data-slot="high"></div>
            <div class="fairsplit-gauge">
              ${gaugeSVG(FAIR_SPLIT_HIGH_TARGET, 0.35, FAIR_SPLIT_PUSH)}
              <div class="fairsplit-gauge-label">empuje recibido · objetivo ${FAIR_SPLIT_HIGH_TARGET}</div>
              <strong class="fairsplit-reading" data-reading="high">0</strong>
            </div>
            <div class="fairsplit-stones" data-stones="high" aria-label="Piedras para la terraza alta"></div>
          </section>
          <div class="fairsplit-channel live"></div>
          <section class="fairsplit-terrace low">
            <h3>Terraza baja</h3>
            <div class="fairsplit-slot" data-slot="low"></div>
            <div class="fairsplit-gauge">
              ${gaugeSVG(FAIR_SPLIT_LOW_TARGET, 0.35, FAIR_SPLIT_PUSH)}
              <div class="fairsplit-gauge-label">empuje recibido · objetivo ${FAIR_SPLIT_LOW_TARGET}</div>
              <strong class="fairsplit-reading" data-reading="low">0</strong>
            </div>
            <div class="fairsplit-stones" data-stones="low" aria-label="Piedras para la terraza baja"></div>
          </section>
        </div>
        <div class="fairsplit-return">vuelta a tierra</div>
        <div class="fairsplit-instruments">
          <div class="fairsplit-ohm">${ohmWidgetHTML('Ohm · brazos')}</div>
          <div class="fairsplit-arms"></div>
          <div class="fairsplit-river">Río: 0</div>
        </div>`;
      bench.root.appendChild(stage);

      const stoneButtons: HTMLButtonElement[] = [];
      addStoneChoices('high');
      addStoneChoices('low');

      const arms = ohmArms(
        ARM_PAIRS,
        (_from, _to, pair) => {
          const value = pair.id === 'high' ? result.highPush : result.lowPush;
          return `Escalón: ${formatNumber(value)}.`;
        },
        (reading, pair) => {
          sfxOk();
          const terrace = pair.id === 'high' ? 'Terraza alta' : 'Terraza baja';
          bench.setStatus(`<b>Ohm:</b> «${terrace}. ${reading}»`);
        },
      );
      stage.querySelector<HTMLElement>('.fairsplit-arms')!.appendChild(arms.element);

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(onSolved),
        },
      ]);
      actions['Continuar'].classList.add('hidden');

      function addStoneChoices(slot: 'high' | 'low'): void {
        const host = stage.querySelector<HTMLElement>(`[data-stones="${slot}"]`)!;
        for (const stone of STONES) {
          const element = piedraEl(stone);
          const button = document.createElement('button');
          button.className = 'fairsplit-stone';
          button.type = 'button';
          button.dataset.slot = slot;
          button.dataset.stone = stone;
          button.setAttribute('aria-label', `${PIEDRAS[stone].nombre} para terraza ${slot === 'high' ? 'alta' : 'baja'}`);
          button.appendChild(element);
          button.addEventListener('click', () => chooseStone(slot, stone));
          host.appendChild(button);
          stoneButtons.push(button);
        }
      }

      function chooseStone(slot: 'high' | 'low', stone: FairSplitStone): void {
        if (solved) return;
        sfxClick();
        if (slot === 'high') highStone = stone;
        else lowStone = stone;
        result = calculateFairSplit(highStone, lowStone);
        arms.clear();
        render();

        if (!practica && isFairSplitSolution(result)) {
          solved = true;
          sfxWin();
          stoneButtons.forEach((button) => {
            button.disabled = true;
          });
          arms.element.querySelectorAll('button').forEach((button) => {
            button.disabled = true;
          });
          actions['Alejarse'].classList.add('hidden');
          actions['Continuar'].classList.remove('hidden');
          bench.setStatus(SOLVED_DIALOGUE);
          return;
        }

        if (isEqualFairSplit(result)) {
          bench.setStatus(EQUAL_DIALOGUE);
          return;
        }

        bench.setStatus(
          `<b>Ohm:</b> «Río: ${formatNumber(result.river)}. Alta: ${formatNumber(result.highPush)}. Baja: ${formatNumber(result.lowPush)}.»`,
        );
      }

      function render(): void {
        renderSlot('high', highStone);
        renderSlot('low', lowStone);
        setGauge(
          stage.querySelector<HTMLElement>('.fairsplit-terrace.high')!,
          result.highPush,
          FAIR_SPLIT_PUSH,
        );
        setGauge(
          stage.querySelector<HTMLElement>('.fairsplit-terrace.low')!,
          result.lowPush,
          FAIR_SPLIT_PUSH,
        );
        stage.querySelector<HTMLElement>('[data-reading="high"]')!.textContent =
          formatNumber(result.highPush);
        stage.querySelector<HTMLElement>('[data-reading="low"]')!.textContent =
          formatNumber(result.lowPush);
        stage.querySelector<HTMLElement>('.fairsplit-river')!.textContent =
          `Río: ${formatNumber(result.river)}`;
        stage.querySelector('.fairsplit-terrace.high')?.classList.toggle(
          'green',
          result.highPush === FAIR_SPLIT_HIGH_TARGET,
        );
        stage.querySelector('.fairsplit-terrace.low')?.classList.toggle(
          'green',
          result.lowPush === FAIR_SPLIT_LOW_TARGET,
        );
        setOhmState(stage, isFairSplitSolution(result) ? 'estable' : 'debil');
      }

      function renderSlot(slot: 'high' | 'low', stone: FairSplitStone): void {
        const host = stage.querySelector<HTMLElement>(`.fairsplit-slot[data-slot="${slot}"]`)!;
        host.replaceChildren(piedraEl(stone));
        host.querySelector('.piedra')?.classList.add('in-slot');
        stage
          .querySelectorAll<HTMLButtonElement>(`.fairsplit-stone[data-slot="${slot}"]`)
          .forEach((button) => {
            button.classList.toggle('selected', button.dataset.stone === stone);
          });
      }

      bench.setStatus(
        '<b>Edda:</b> «¿Y si te lo mostramos con las manos, en chico, antes de tocar el valle de verdad?»',
      );
      render();
    },
  );
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}
