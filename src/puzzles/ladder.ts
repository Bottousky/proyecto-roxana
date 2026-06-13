import { sfxClick, sfxOk, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  createPredictionPage,
  type PredictionPageHandle,
} from '../ui/prediction';
import {
  gaugeSVG,
  piedraEl,
  PIEDRAS,
  setGauge,
} from './common';
import {
  LADDER_INITIAL_CONFIGURATION,
  LADDER_PUSH,
  LADDER_TERRACE_1_TARGET,
  LADDER_TERRACE_2_TARGET,
  calculateLadder,
  isLadderSolution,
  type LadderConfiguration,
  type LadderResult,
  type LadderStone,
} from './ladderModel';

export interface AbrirLadderOptions {
  onPredictionAttempted: () => void;
  onPredictionExact: () => void;
  onSolved: () => void;
  practica?: boolean;
}

type LadderSlot = keyof LadderConfiguration;

const STONES: LadderStone[] = ['marron', 'roja', 'amarilla', 'gris'];

const SLOT_LABELS: Record<LadderSlot, string> = {
  firstSegment: 'Tramo al nivel 1',
  terrace1: 'Terraza 1',
  secondSegment: 'Tramo al nivel 2',
  terrace2: 'Terraza 2 · fondo',
};

const INTRO_DIALOGUE =
  '<b>Guardiana:</b> «El valle completo. Tres niveles. Si me equivoco, riego mal toda una temporada.<br/>' +
  'Por eso nunca lo toqué. Mejor mal repartido y quieto, que peor por mi mano.»<br/>' +
  '<b>Edda:</b> «No vamos a tocar nada todavía. Primero lo decimos. <i>(a ti)</i> Plegá la Escalera con la Piedra Única, desde abajo. Decime cuánto empuje le va a llegar a la terraza del fondo. ANTES de abrir el agua.»<br/>' +
  '<b>Guardiana:</b> «¿Adivinar?»<br/>' +
  '<b>Edda:</b> «No. Saber. Medir después es mirar. Decirlo antes — eso es entender.»';

const ERROR_DIALOGUE =
  '<b>Ohm:</b> «Diferencia entre lo dicho y lo visto: ahí está la lección. Repliegue. Vuelva a decir.»';

const RESOLUTION =
  '<b>El mosaico del manantial se completa:</b><br/>' +
  '«Lo que sube, baja. Lo que baja, se reparte en escalones.<br/>' +
  'Y los escalones de toda vuelta, sumados, dan cero.»<br/><br/>' +
  '<b>Guardiana:</b> «Toqué las piedras. Todas. Y supe lo que iba a pasar antes de que pasara.<br/>' +
  'Treinta años de respeto, y bastaba con aprender a leer. Los Maestros no eran magos. Eran prolijos.»<br/>' +
  '<b>Ohm:</b> «Registro: primera predicción del estudiante. Resultado: el futuro es calculable. Anótelo en grande.»<br/>' +
  '<b>Lumen:</b> «La cuenta le gana al rezo. Otra vez. Empiezo a tomármelo personal.»';

export function abrirLadder(options: AbrirLadderOptions): void {
  const practica = options.practica ?? false;
  openBench(
    'La Escalera',
    'Pliegue la red desde el fondo. Diga qué marcará la aguja antes de abrir el agua.',
    (bench) => {
      let configuration: LadderConfiguration = {
        ...LADDER_INITIAL_CONFIGURATION,
      };
      let result = calculateLadder(configuration);
      let foldStage = 0;
      let solved = false;
      let predictionAttempted = false;
      let predictionExactReported = false;
      let predictionPage: PredictionPageHandle;

      const stage = document.createElement('div');
      stage.className = 'bench-stage ladder-stage';
      stage.innerHTML = `
        <div class="ladder-source">
          <span>manantial</span>
          <strong>Empuje ${LADDER_PUSH}</strong>
        </div>
        <div class="ladder-network" aria-label="Acueducto escalonado">
          <section class="ladder-card" data-slot-card="firstSegment"></section>
          <section class="ladder-card terrace" data-slot-card="terrace1">
            <div class="ladder-gauge">
              ${gaugeSVG(LADDER_TERRACE_1_TARGET, 0.2, LADDER_PUSH)}
              <span>Aguja nivel 1 · objetivo ${LADDER_TERRACE_1_TARGET}</span>
              <strong data-reading="terrace1">—</strong>
            </div>
          </section>
          <section class="ladder-card" data-slot-card="secondSegment"></section>
          <section class="ladder-card terrace" data-slot-card="terrace2">
            <div class="ladder-gauge">
              ${gaugeSVG(LADDER_TERRACE_2_TARGET, 0.2, LADDER_PUSH)}
              <span>Aguja del fondo · objetivo ${LADDER_TERRACE_2_TARGET}</span>
              <strong data-reading="terrace2">—</strong>
            </div>
          </section>
        </div>
        <div class="ladder-fold">
          <div class="ladder-fold-heading">
            <strong>Piedra Única · plegado desde abajo</strong>
            <button type="button" class="ladder-fold-next">Plegar una etapa</button>
          </div>
          <ol class="ladder-fold-steps" aria-live="polite"></ol>
        </div>
        <div class="ladder-prediction-host"></div>`;
      bench.root.appendChild(stage);

      const stoneButtons: HTMLButtonElement[] = [];
      for (const slot of Object.keys(SLOT_LABELS) as LadderSlot[]) {
        buildSlot(slot);
      }

      const foldButton = stage.querySelector<HTMLButtonElement>('.ladder-fold-next')!;
      foldButton.addEventListener('click', () => {
        sfxClick();
        foldStage = Math.min(foldStage + 1, 5);
        renderFold();
        bench.setStatus(foldStatus(foldStage, result));
      });

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Abrir el agua',
          primary: true,
          onClick: openWater,
        },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(options.onSolved),
        },
      ]);
      const openWaterButton = actions['Abrir el agua'];
      actions['Continuar'].classList.add('hidden');

      predictionPage = createPredictionPage({
        prompt: 'empuje que llega a la terraza del fondo',
        unit: 'de empuje',
        onPrediction: () => {
          if (!predictionAttempted) {
            predictionAttempted = true;
            options.onPredictionAttempted();
          }
          openWaterButton.disabled = solved || !predictionPage.hasPrediction();

          if (predictionPage.getMeasured() === undefined) {
            bench.setStatus('Predicción cargada. Ahora puede abrir el agua.');
            return;
          }

          if (predictionPage.isExact()) {
            reportExactPrediction();
            bench.setStatus(
              '<b>Bitácora:</b> «PREDICHO Y MEDIDO: IGUALES.»',
            );
          } else {
            bench.setStatus(ERROR_DIALOGUE);
          }
        },
      });
      stage
        .querySelector<HTMLElement>('.ladder-prediction-host')!
        .appendChild(predictionPage.element);

      function buildSlot(slot: LadderSlot): void {
        const card = stage.querySelector<HTMLElement>(
          `[data-slot-card="${slot}"]`,
        )!;
        const heading = document.createElement('h3');
        heading.textContent = SLOT_LABELS[slot];
        card.prepend(heading);

        const current = document.createElement('div');
        current.className = 'ladder-current-stone';
        current.dataset.currentStone = slot;
        heading.after(current);

        const choices = document.createElement('div');
        choices.className = 'ladder-stone-options';
        choices.setAttribute('aria-label', `Piedras para ${SLOT_LABELS[slot]}`);
        for (const stone of STONES) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'ladder-stone-button';
          button.dataset.slot = slot;
          button.dataset.stone = stone;
          button.setAttribute(
            'aria-label',
            `${PIEDRAS[stone].nombre} para ${SLOT_LABELS[slot]}`,
          );
          button.appendChild(piedraEl(stone));
          button.addEventListener('click', () => chooseStone(slot, stone));
          choices.appendChild(button);
          stoneButtons.push(button);
        }
        card.appendChild(choices);
      }

      function chooseStone(slot: LadderSlot, stone: LadderStone): void {
        if (solved) return;
        sfxClick();
        configuration = { ...configuration, [slot]: stone };
        result = calculateLadder(configuration);
        foldStage = 0;
        predictionPage.clearMeasured();
        stage.classList.remove('water-open', 'solved');
        render();
        bench.setStatus(
          'La red cambió. Repliegue o conserve su predicción antes de abrir el agua.',
        );
      }

      function openWater(): void {
        if (!predictionPage.hasPrediction() || solved) return;
        sfxClick();
        stage.classList.add('water-open');
        predictionPage.setMeasured(result.terrace2Push);
        renderReadings();

        const exact = predictionPage.isExact();
        if (exact) reportExactPrediction();
        const comparisonDialogue = exact
          ? '<b>Bitácora:</b> «PREDICHO Y MEDIDO: IGUALES.»'
          : ERROR_DIALOGUE;

        if (!isLadderSolution(result)) {
          bench.setStatus(
            `${comparisonDialogue}<br/><br/><b>Ohm:</b> «Nivel 1: ${formatNumber(result.terrace1Push)}. Fondo: ${formatNumber(result.terrace2Push)}. Objetivo todavía desigual.»`,
          );
          return;
        }

        sfxOk();
        if (practica) {
          bench.setStatus(
            `${comparisonDialogue}<br/><br/><b>Ohm:</b> «Reparto: ocho y cuatro. Red válida.»`,
          );
          return;
        }

        solved = true;
        sfxWin();
        stage.classList.add('solved');
        stoneButtons.forEach((button) => {
          button.disabled = true;
        });
        foldButton.disabled = true;
        openWaterButton.disabled = true;
        actions['Alejarse'].classList.add('hidden');
        actions['Continuar'].classList.remove('hidden');
        bench.setStatus(`${comparisonDialogue}<br/><br/>${RESOLUTION}`);
      }

      function reportExactPrediction(): void {
        if (
          predictionExactReported ||
          !isLadderSolution(result) ||
          !predictionPage.isExact()
        ) {
          return;
        }
        predictionExactReported = true;
        sfxOk();
        options.onPredictionExact();
      }

      function render(): void {
        for (const slot of Object.keys(SLOT_LABELS) as LadderSlot[]) {
          const host = stage.querySelector<HTMLElement>(
            `[data-current-stone="${slot}"]`,
          )!;
          host.replaceChildren(piedraEl(configuration[slot]));
          host.querySelector('.piedra')?.classList.add('in-slot');
          stage
            .querySelectorAll<HTMLButtonElement>(
              `.ladder-stone-button[data-slot="${slot}"]`,
            )
            .forEach((button) => {
              button.classList.toggle(
                'selected',
                button.dataset.stone === configuration[slot],
              );
            });
        }
        renderFold();
        renderReadings();
        openWaterButton.disabled = solved || !predictionPage.hasPrediction();
      }

      function renderReadings(): void {
        const waterOpen = stage.classList.contains('water-open');
        const terrace1 = waterOpen ? result.terrace1Push : 0;
        const terrace2 = waterOpen ? result.terrace2Push : 0;
        setGauge(
          stage.querySelector<HTMLElement>('[data-slot-card="terrace1"]')!,
          terrace1,
          LADDER_PUSH,
        );
        setGauge(
          stage.querySelector<HTMLElement>('[data-slot-card="terrace2"]')!,
          terrace2,
          LADDER_PUSH,
        );
        stage.querySelector<HTMLElement>('[data-reading="terrace1"]')!.textContent =
          waterOpen ? formatNumber(terrace1) : '—';
        stage.querySelector<HTMLElement>('[data-reading="terrace2"]')!.textContent =
          waterOpen ? formatNumber(terrace2) : '—';
        stage
          .querySelector('[data-slot-card="terrace1"]')
          ?.classList.toggle('green', waterOpen && terrace1 === LADDER_TERRACE_1_TARGET);
        stage
          .querySelector('[data-slot-card="terrace2"]')
          ?.classList.toggle('green', waterOpen && terrace2 === LADDER_TERRACE_2_TARGET);
      }

      function renderFold(): void {
        const steps = foldSteps(result);
        const host = stage.querySelector<HTMLOListElement>('.ladder-fold-steps')!;
        host.replaceChildren();
        steps.slice(0, foldStage).forEach((text) => {
          const item = document.createElement('li');
          item.textContent = text;
          host.appendChild(item);
        });
        if (foldStage === 0) {
          const item = document.createElement('li');
          item.className = 'pending';
          item.textContent = 'La Escalera todavía está desplegada.';
          host.appendChild(item);
        }
        foldButton.textContent =
          foldStage >= steps.length ? 'Plegado completo' : 'Plegar una etapa';
        foldButton.disabled = solved || foldStage >= steps.length;
      }

      openWaterButton.disabled = true;
      bench.setStatus(INTRO_DIALOGUE);
      render();
      predictionPage.focus();
    },
  );
}

function foldSteps(result: LadderResult): string[] {
  return [
    `Terraza 2 = ${formatNumber(result.fold.terrace2Equivalent)}.`,
    `Rama hacia terraza 2 = ${formatNumber(result.fold.branchToTerrace2Equivalent)}.`,
    `En terraza 1, los dos caminos juntos = ${formatNumber(result.fold.terrace1Equivalent)}.`,
    `Escalera completa = ${formatNumber(result.fold.totalEquivalent)}.`,
    `Río del manantial = ${formatNumber(result.sourceRiver)}; nivel 1 = ${formatNumber(result.terrace1Push)}; fondo = ${formatNumber(result.terrace2Push)}.`,
  ];
}

function foldStatus(stage: number, result: LadderResult): string {
  const step = foldSteps(result)[stage - 1];
  return step
    ? `<b>Piedra Única:</b> ${step}`
    : 'La Escalera quedó plegada en una sola piedra.';
}

function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}
