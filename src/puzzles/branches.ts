import { sfxBridge, sfxClick, sfxHot, sfxOk, sfxTrunkFuse, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  fusible,
  gaugeSVG,
  makeInteractive,
  ohmProbe,
  ohmWidgetHTML,
  piedraEl,
  PIEDRAS,
  setGauge,
  setOhmState,
} from './common';
import {
  BRANCH_COUNT,
  TRUNK_TOLERANCE,
  connectBranch,
  createBranchesState,
  predictIndependence,
  predictTrunk,
  replaceTrunkFuse,
  setBranchStone,
  trunkRiver,
  type BranchesChange,
  type BranchesState,
  type BranchStone,
  type IndependenceGuess,
  type TrunkGuess,
} from './branchesModel';

export interface AbrirBranchesOptions {
  onSolved: () => void;
  onBurnedFuse: () => void;
  practica?: boolean;
}

type Phase = 'predict-independence' | 'show-independence' | 'predict-trunk' | 'solve';

const STONES: BranchStone[] = ['marron', 'roja', 'amarilla', 'gris'];

const INDEPENDENCE_OPTIONS: { key: IndependenceGuess; label: string }[] = [
  { key: 'baja', label: 'Baja: se reparten el río' },
  { key: 'sube', label: 'Sube' },
  { key: 'igual', label: 'Sigue igual' },
];

const TRUNK_OPTIONS: { key: TrunkGuess; label: string }[] = [
  { key: 'nada', label: 'Nada, son independientes' },
  { key: 'sobrecarga', label: 'Se sobrecarga' },
  { key: 'apagan', label: 'Las ramas se apagan entre sí' },
];

const SECOND_BRANCH_DIALOGUE =
  '<b>Edda:</b> «¡La primera ni se enteró! No se reparten la pobreza: cada camino cobra lo suyo.»<br/>' +
  '<b>Consejera:</b> <i>(mirando la aguja del Tronco)</i> «…Pero el Tronco subió.»<br/>' +
  '<b>Ohm:</b> «Correcto. Tronco = suma de ramas. Anótelo.»<br/>' +
  '<b>Consejera:</b> «YA lo anoté.»';

const BURNED_DIALOGUE =
  '<b>Lumen:</b> «¡EL MÁRTIR! …Perdón. Costumbre.»<br/>' +
  '<b>Consejera:</b> «Esto. ESTO es lo que el Consejo teme.»<br/>' +
  '<b>Edda:</b> «Y tiene razón en temerlo. Pero la respuesta no era sellar las bocas… era <b>elegir las piedras</b>.»';

const SOLVED_DIALOGUE =
  '<b>Consejera:</b> «Tres talleres. Tronco entero. Fusible vivo. …Repítanlo.»<br/>' +
  '<b>Edda:</b> «¿Por qué?»<br/>' +
  '<b>Consejera:</b> «Porque lo voy a anotar de nuevo, con mejor letra.»';

const REPLACEMENT_COMMENTS = [
  '<b>Lumen:</b> «El Mártir tiene hermanos. Yo los traigo; ustedes traten de que no hagan falta.»',
  '<b>Lumen:</b> «Segundo repuesto. Mi maestro decía que al tercero ya no es accidente: es costumbre.»',
  '<b>Lumen:</b> «…Tengo más. No me miren así.»',
];

const GOAL_TEXT: Record<Phase, string> = {
  'predict-independence': '¿Qué le pasa a la primera rama cuando conectes la segunda?',
  'show-independence': 'Conecta la segunda rama y mira la primera.',
  'predict-trunk': '¿Qué le pasa al Tronco si las tres piden mucho a la vez?',
  solve: 'Enciende los tres talleres sin reventar el Tronco.',
};

// En 'solve', primero se invita a comprobar la predicción (sobrecargar el Tronco)
// y recién después a resolver: el jugador debe VIVIR que el Tronco paga la suma.
const SOLVE_GOAL_STRAIN = 'Comprueba tu predicción: pídele de más al Tronco y míralo saltar.';

export function abrirBranches(opts: AbrirBranchesOptions): void {
  const practica = opts.practica ?? false;
  openBench(
    'Los Ramales',
    'Cada rama según su freno; el Tronco paga la suma.',
    (bench) => {
      let state = createBranchesState();
      let solved = false;
      let burnedHandled = false;

      const predict = document.createElement('div');
      predict.className = 'bench-predict';
      bench.root.appendChild(predict);

      const stage = document.createElement('div');
      stage.className = 'bench-stage branches-stage';
      stage.innerHTML = `
        <div class="branches-network">
          <div class="branches-source">EMPUJE</div>
          <div class="branches-trunk-line">
            <div class="branches-trunk live"></div>
            <span class="branches-trunk-tag">Tronco</span>
          </div>
          <div class="branches-crossing">Cruce</div>
          <div class="branches-crossing-sum"></div>
          <div class="branches-cards" aria-label="Tres ramas conectables"></div>
        </div>
        <div class="branches-instruments">
          <div class="branches-gauge">
            ${gaugeSVG(4, 4, 24)}
            <div class="branches-gauge-label">aguja del Tronco · tolerancia 8</div>
            <div class="branches-trunk-reading">Tronco: 0</div>
          </div>
          ${ohmWidgetHTML()}
        </div>`;
      bench.root.appendChild(stage);

      const fuse = fusible(TRUNK_TOLERANCE, 24);
      fuse.element.classList.add('branches-fuse');
      bench.root.appendChild(fuse.element);

      const cardsHost = stage.querySelector<HTMLElement>('.branches-cards')!;
      const cardRefs: {
        card: HTMLElement;
        toggle: HTMLButtonElement;
        lamp: HTMLElement;
        river: HTMLElement;
        stones: HTMLElement;
      }[] = [];

      for (let index = 0; index < BRANCH_COUNT; index++) {
        const card = document.createElement('section');
        card.className = 'branch-card';
        card.innerHTML = `
          <div class="branch-wire"></div>
          <h3>Taller ${index + 1}</h3>
          <div class="branch-lamp" aria-label="Lámpara del taller"></div>
          <div class="branch-river">Río: 0</div>
          <button class="branch-toggle">Conectar</button>
          <div class="branch-stones" aria-label="Piedras de Freno"></div>`;
        const toggle = card.querySelector<HTMLButtonElement>('.branch-toggle')!;
        const lamp = card.querySelector<HTMLElement>('.branch-lamp')!;
        const river = card.querySelector<HTMLElement>('.branch-river')!;
        const stones = card.querySelector<HTMLElement>('.branch-stones')!;

        for (const stone of STONES) {
          const element = piedraEl(stone);
          const choose = () => {
            if (solved || state.fuse.burned || phaseOf(state) !== 'solve') return;
            sfxClick();
            applyChange(setBranchStone(state, index, stone), index, 'stone');
          };
          element.addEventListener('click', choose);
          makeInteractive(element, PIEDRAS[stone].nombre);
          stones.appendChild(element);
        }

        toggle.addEventListener('click', () => {
          if (solved || state.fuse.burned || !canToggleBranch(state, index)) return;
          sfxBridge();
          applyChange(connectBranch(state, index, !state.branches[index].connected), index, 'toggle');
        });
        cardsHost.appendChild(card);
        cardRefs.push({ card, toggle, lamp, river, stones });
      }

      const probe = ohmProbe(
        [
          { id: 'trunk', label: 'Tronco' },
          { id: 'branch-0', label: 'Rama 1' },
          { id: 'branch-1', label: 'Rama 2' },
          { id: 'branch-2', label: 'Rama 3' },
        ],
        (id) => {
          if (state.fuse.burned) return 'Sin río. El fusible reventó: camino cortado.';
          const river =
            id === 'trunk'
              ? trunkRiver(state)
              : state.branches[Number(id.replace('branch-', ''))].river;
          return `Río: ${river}.`;
        },
        (reading, tramo) => bench.setStatus(`<b>${tramo.label}:</b> ${reading}`),
      );
      const probeHost = document.createElement('div');
      probeHost.className = 'branches-probes';
      probeHost.appendChild(probe.element);
      bench.root.appendChild(probeHost);

      const goal = document.createElement('div');
      goal.className = 'bench-goal';
      bench.root.appendChild(goal);

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Lumen repone el fusible',
          onClick: () => {
            state = replaceTrunkFuse(state);
            burnedHandled = false;
            fuse.reset();
            render();
            const comment =
              REPLACEMENT_COMMENTS[Math.min(state.replacements - 1, REPLACEMENT_COMMENTS.length - 1)];
            bench.setStatus(comment);
          },
        },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(opts.onSolved),
        },
      ]);
      actions['Lumen repone el fusible'].classList.add('hidden');
      actions['Continuar'].classList.add('hidden');

      const chooseIndependence = (guess: IndependenceGuess) => {
        if (solved || state.predictions.independence) return;
        sfxClick();
        state = predictIndependence(state, guess);
        const label = INDEPENDENCE_OPTIONS.find((option) => option.key === guess)!.label;
        bench.setStatus(
          `<b>Dijiste:</b> «${label}». Ahora conecta la segunda rama y mira la primera.`,
        );
        render();
      };

      const chooseTrunk = (guess: TrunkGuess) => {
        if (solved || state.predictions.trunk) return;
        sfxClick();
        state = predictTrunk(state, guess);
        const label = TRUNK_OPTIONS.find((option) => option.key === guess)!.label;
        bench.setStatus(
          `<b>Dijiste:</b> «${label}». Compruébalo: pídele de más al Tronco y míralo.`,
        );
        render();
      };

      function applyChange(
        change: BranchesChange,
        branchIndex: number,
        source: 'stone' | 'toggle',
      ): void {
        const previous = state;
        state = change.state;
        render();
        syncFuse(change);
        if (state.fuse.burned) return;

        if (!practica && state.solved && !solved) {
          solved = true;
          sfxOk();
          sfxWin();
          bench.setStatus(SOLVED_DIALOGUE);
          actions['Alejarse'].classList.add('hidden');
          actions['Continuar'].classList.remove('hidden');
          render();
          return;
        }

        if (!previous.experiences.connectedSecond && state.experiences.connectedSecond) {
          const prefix =
            previous.predictions.independence === 'igual'
              ? '<b>Ohm:</b> «Lo anticipaste: la primera no cambia.»<br/>'
              : '<b>Ohm:</b> «Mira la primera: ni se inmutó.»<br/>';
          bench.setStatus(prefix + SECOND_BRANCH_DIALOGUE);
        } else if (change.fuseResult === 'warning') {
          sfxHot();
          bench.setStatus('El fusible mayor avisa, vibra.');
        } else {
          const branch = state.branches[branchIndex];
          const action =
            source === 'toggle'
              ? branch.connected
                ? 'conectada'
                : 'desconectada'
              : PIEDRAS[branch.stone].nombre;
          bench.setStatus(
            `<b>Rama ${branchIndex + 1}:</b> ${action}. Río ${branch.river}. Tronco ${trunkRiver(state)}.`,
          );
        }
      }

      function syncFuse(change: BranchesChange): void {
        const river = trunkRiver(state);
        let visualResult = fuse.setValue(river);
        while (change.fuseResult === 'burned' && visualResult !== 'burned') {
          visualResult = fuse.setValue(river);
        }
        if (change.fuseResult === 'burned' && !burnedHandled) handleBurn();
      }

      function handleBurn(): void {
        burnedHandled = true;
        sfxTrunkFuse();
        setOhmState(stage, 'sobrecarga');
        stage.classList.add('burned');
        actions['Lumen repone el fusible'].classList.remove('hidden');
        opts.onBurnedFuse();
        bench.setStatus(BURNED_DIALOGUE);
        render();
      }

      function renderPredict(phase: Phase): void {
        if (phase === 'predict-independence') {
          predict.classList.remove('hidden');
          predict.innerHTML =
            '<p class="bench-predict-q"><b>Ohm:</b> «Toca la lámpara de la primera rama: ¿qué le pasa si conecto la segunda?»</p>';
          cardRefs[0]?.lamp.addEventListener('click', () => chooseIndependence('igual'), { once: true });
          cardRefs[1]?.lamp.addEventListener('click', () => chooseIndependence('baja'), { once: true });
          stage.querySelector('.branches-source')?.addEventListener('click', () => chooseIndependence('sube'), { once: true });
        } else if (phase === 'predict-trunk') {
          predict.classList.remove('hidden');
          predict.innerHTML =
            '<p class="bench-predict-q"><b>Ohm:</b> «Toca el Tronco o una lámpara: ¿qué pasa si las tres piden mucho a la vez?»</p>';
          stage.querySelector('.branches-trunk')?.addEventListener('click', () => chooseTrunk('sobrecarga'), { once: true });
          cardRefs[0]?.lamp.addEventListener('click', () => chooseTrunk('nada'), { once: true });
          cardRefs[2]?.lamp.addEventListener('click', () => chooseTrunk('apagan'), { once: true });
        } else {
          predict.classList.add('hidden');
          predict.innerHTML = '';
        }
      }

      function render(): void {
        const phase = phaseOf(state);
        const trunk = trunkRiver(state);
        const blackedOut = state.fuse.burned;
        stage.classList.toggle('burned', blackedOut);
        stage.querySelector('.branches-trunk')?.classList.toggle('live', !blackedOut && trunk > 0);
        stage.querySelector<HTMLElement>('.branches-trunk-reading')!.textContent =
          `Tronco: ${trunk}`;

        // La cuenta del Cruce: lo que cobra cada rama se suma en el Tronco.
        // Es la "Regla del Cruce" hecha visible (vivencial, no formal).
        const connectedBranches = state.branches.filter((branch) => branch.connected);
        const crossingSum = stage.querySelector<HTMLElement>('.branches-crossing-sum')!;
        if (blackedOut) {
          crossingSum.classList.remove('over');
          crossingSum.innerHTML = '<span class="eq-hint">el fusible cortó el Tronco</span>';
        } else if (connectedBranches.length === 0) {
          crossingSum.classList.remove('over');
          crossingSum.innerHTML =
            '<span class="eq-hint">conecta una rama y mira cómo se reparte el río</span>';
        } else {
          const parts = connectedBranches.map((branch) => branch.river).join(' + ');
          crossingSum.textContent = `Tronco ${trunk} = ${parts}`;
          crossingSum.classList.toggle('over', trunk > TRUNK_TOLERANCE);
        }

        setGauge(stage, trunk, 24);
        setOhmState(stage, blackedOut ? 'inerte' : trunk > TRUNK_TOLERANCE ? 'sobrecarga' : 'estable');

        cardRefs.forEach((refs, index) => {
          const branch = state.branches[index];
          const lit = branch.connected && !blackedOut;
          const glow = lit ? Math.max(0.2, Math.min(1, branch.river / 4)) : 0;
          refs.card.classList.toggle('connected', branch.connected);
          refs.card.classList.toggle('green', false);
          refs.card.querySelector('.branch-wire')?.classList.toggle('live', lit);
          refs.lamp.style.setProperty('--lamp-glow', String(glow));
          refs.lamp.style.setProperty('--lamp-radius', `${Math.round(24 * glow)}px`);
          refs.river.textContent = `Río: ${lit ? branch.river : 0}`;
          refs.toggle.textContent = branch.connected ? 'Desconectar' : 'Conectar';
          refs.toggle.disabled = solved || blackedOut || !canToggleBranch(state, index);
          refs.stones.querySelectorAll<HTMLElement>('.piedra').forEach((stone) => {
            const selected = stone.dataset.key === branch.stone;
            stone.classList.toggle('selected', selected);
            stone.setAttribute('aria-disabled', String(solved || blackedOut || phase !== 'solve'));
          });
        });

        probe.element.querySelectorAll('button').forEach((button) => {
          button.disabled = solved || phase !== 'solve';
        });
        actions['Lumen repone el fusible'].classList.toggle('hidden', !state.fuse.burned);
        goal.textContent =
          phase === 'solve' && !state.experiences.sawTrunkStrain
            ? SOLVE_GOAL_STRAIN
            : GOAL_TEXT[phase];
        renderPredict(phase);
      }

      bench.setStatus(
        'Tres bocas de taller; la primera ya corre. Antes de conectar nada, observa qué hace.',
      );
      render();
    },
    { worldCloseup: true },
  );
}

function phaseOf(state: BranchesState): Phase {
  if (!state.predictions.independence) return 'predict-independence';
  if (!state.experiences.connectedSecond) return 'show-independence';
  if (!state.predictions.trunk) return 'predict-trunk';
  return 'solve';
}

function canToggleBranch(state: BranchesState, branchIndex: number): boolean {
  const phase = phaseOf(state);
  if (phase === 'show-independence') {
    return branchIndex === 1 && !state.branches[branchIndex].connected;
  }
  return phase === 'solve';
}
