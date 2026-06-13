import { sfxClick, sfxOk, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  ohmWidgetHTML,
  piedraEl,
  PIEDRAS,
  setOhmState,
} from './common';
import {
  SINGLE_STONE_NETWORKS,
  SINGLE_STONE_PUSH,
  SINGLE_STONE_REQUIRED_MATCHES,
  compareSingleStone,
  createSingleStoneState,
  isSingleStoneSolved,
  recordSingleStoneMatch,
  type SingleStone,
  type SingleStoneNetwork,
  type SingleStoneNetworkId,
} from './singlestoneModel';

const STONES: SingleStone[] = ['marron', 'roja', 'amarilla', 'gris'];

const SOLVED_DIALOGUE =
  '<b>Edda:</b> «La red entera se esconde dentro de una piedra. Y si Ohm no la distingue…»<br/>' +
  '<b>Ohm:</b> «…el río tampoco. Una red es una piedra que todavía no terminaste de mirar.»<br/>' +
  '<b>Guardiana:</b> «Entonces el valle entero… es una piedra. Una sola piedra que aprendí a temer.»';

export function abrirSingleStone(onSolved: () => void, practica = false): void {
  openBench(
    'La Piedra Única',
    'Arme una red a la izquierda y encuentre la única piedra que lleva el mismo río a la derecha.',
    (bench) => {
      let networkId: SingleStoneNetworkId = SINGLE_STONE_NETWORKS[0].id;
      let candidateStone: SingleStone = 'gris';
      let state = createSingleStoneState();
      let solved = false;

      const stage = document.createElement('div');
      stage.className = 'bench-stage singlestone-stage';
      stage.innerHTML = `
        <div class="singlestone-workbench">
          <section class="singlestone-side singlestone-left">
            <h3>Red armable</h3>
            <div class="singlestone-network-choices" aria-label="Redes objetivo"></div>
            <div class="singlestone-network" aria-live="polite"></div>
            <div class="singlestone-reading" data-reading="left">Río: —</div>
          </section>
          <div class="singlestone-ohm">
            ${ohmWidgetHTML('Ohm · manantial')}
            <span>Empuje ${SINGLE_STONE_PUSH} a cada lado</span>
          </div>
          <section class="singlestone-side singlestone-right">
            <h3>Una piedra</h3>
            <div class="singlestone-slot"></div>
            <div class="singlestone-stones" aria-label="Piedras únicas posibles"></div>
            <div class="singlestone-reading" data-reading="right">Río: —</div>
          </section>
        </div>
        <button class="singlestone-compare" type="button">Pedirle a Ohm que mida</button>
        <div class="singlestone-progress" aria-label="Equivalencias encontradas"></div>`;
      bench.root.appendChild(stage);

      const networkButtons = new Map<SingleStoneNetworkId, HTMLButtonElement>();
      const networkChoices = stage.querySelector<HTMLElement>('.singlestone-network-choices')!;
      for (const network of SINGLE_STONE_NETWORKS) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'singlestone-network-choice';
        button.textContent = network.label;
        button.addEventListener('click', () => selectNetwork(network.id));
        networkChoices.appendChild(button);
        networkButtons.set(network.id, button);
      }

      const stoneButtons = new Map<SingleStone, HTMLButtonElement>();
      const stonesHost = stage.querySelector<HTMLElement>('.singlestone-stones')!;
      for (const stone of STONES) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'singlestone-stone';
        button.setAttribute('aria-label', PIEDRAS[stone].nombre);
        button.appendChild(piedraEl(stone));
        button.addEventListener('click', () => selectStone(stone));
        stonesHost.appendChild(button);
        stoneButtons.set(stone, button);
      }

      const compareButton = stage.querySelector<HTMLButtonElement>('.singlestone-compare')!;
      compareButton.addEventListener('click', compare);

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(onSolved),
        },
      ]);
      actions['Continuar'].classList.add('hidden');

      function selectNetwork(nextNetworkId: SingleStoneNetworkId): void {
        if (solved) return;
        sfxClick();
        networkId = nextNetworkId;
        clearReadings();
        render();
        bench.setStatus('Red elegida. Falta encontrar su Piedra Única.');
      }

      function selectStone(stone: SingleStone): void {
        if (solved) return;
        sfxClick();
        candidateStone = stone;
        clearReadings();
        render();
        bench.setStatus('Piedra colocada. Ohm puede comparar los dos ríos.');
      }

      function compare(): void {
        if (solved) return;
        sfxClick();
        const comparison = compareSingleStone(networkId, candidateStone);
        setReading('left', comparison.leftRiver);
        setReading('right', comparison.rightRiver);

        if (comparison.distinguishes) {
          setOhmState(stage, 'debil');
          bench.setStatus(
            `<b>Ohm:</b> «Izquierda: río ${formatNumber(comparison.leftRiver)}. Derecha: río ${formatNumber(comparison.rightRiver)}. Distingo.»`,
          );
          return;
        }

        sfxOk();
        state = recordSingleStoneMatch(state, comparison);
        setOhmState(stage, 'estable');
        render();
        const matchingDialogue =
          `<b>Ohm:</b> «Izquierda: río ${formatNumber(comparison.leftRiver)}. ` +
          `Derecha: río ${formatNumber(comparison.rightRiver)}. No distingo. Son la misma piedra.»`;

        if (!practica && isSingleStoneSolved(state)) {
          solved = true;
          sfxWin();
          disableWorkbench();
          actions['Alejarse'].classList.add('hidden');
          actions['Continuar'].classList.remove('hidden');
          bench.setStatus(`${matchingDialogue}<br/><br/>${SOLVED_DIALOGUE}`);
          return;
        }

        bench.setStatus(matchingDialogue);
      }

      function clearReadings(): void {
        stage.querySelector<HTMLElement>('[data-reading="left"]')!.textContent = 'Río: —';
        stage.querySelector<HTMLElement>('[data-reading="right"]')!.textContent = 'Río: —';
        setOhmState(stage, 'inerte');
      }

      function setReading(side: 'left' | 'right', value: number): void {
        stage.querySelector<HTMLElement>(`[data-reading="${side}"]`)!.textContent =
          `Río: ${formatNumber(value)}`;
      }

      function disableWorkbench(): void {
        stage.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
          button.disabled = true;
        });
      }

      function render(): void {
        const network = SINGLE_STONE_NETWORKS.find((candidate) => candidate.id === networkId)!;
        renderNetwork(
          stage.querySelector<HTMLElement>('.singlestone-network')!,
          network,
        );
        const slot = stage.querySelector<HTMLElement>('.singlestone-slot')!;
        slot.replaceChildren(piedraEl(candidateStone));
        slot.querySelector('.piedra')?.classList.add('in-slot');

        for (const [id, button] of networkButtons) {
          button.classList.toggle('selected', id === networkId);
          button.classList.toggle('matched', state.matchedNetworkIds.includes(id));
        }
        for (const [stone, button] of stoneButtons) {
          button.classList.toggle('selected', stone === candidateStone);
        }
        renderProgress();
      }

      function renderProgress(): void {
        const progress = stage.querySelector<HTMLElement>('.singlestone-progress')!;
        progress.textContent =
          `Redes que Ohm no distinguió: ${state.matchedNetworkIds.length} de ${SINGLE_STONE_REQUIRED_MATCHES}`;
      }

      bench.setStatus(
        '<b>Guardiana:</b> «Este mural lleva aquí más que yo. Nunca lo entendí. Una maraña… igual a una piedra. ¿Igual cómo?»<br/>' +
        '<b>Ohm:</b> «Demostrable. Tráiganme una red. Yo decido si la distingo.»',
      );
      render();
      clearReadings();
    },
  );
}

function renderNetwork(host: HTMLElement, network: SingleStoneNetwork): void {
  host.innerHTML = `
    <div class="singlestone-source">manantial</div>
    <div class="singlestone-wire"></div>
    <div class="singlestone-series"></div>
    <div class="singlestone-parallel">
      <div class="singlestone-branch" data-branch="one"></div>
      <div class="singlestone-branch" data-branch="two"></div>
    </div>
    <div class="singlestone-return">vuelta</div>`;

  const seriesHost = host.querySelector<HTMLElement>('.singlestone-series')!;
  if (network.seriesStone) {
    seriesHost.appendChild(piedraEl(network.seriesStone));
    seriesHost.querySelector('.piedra')?.classList.add('in-slot');
  } else {
    seriesHost.remove();
  }

  host.querySelectorAll<HTMLElement>('.singlestone-branch').forEach((branch) => {
    branch.appendChild(piedraEl(network.parallelStone));
    branch.querySelector('.piedra')?.classList.add('in-slot');
  });
}

function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}
