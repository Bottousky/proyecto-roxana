import { sfxBridge, sfxClick, sfxHot, sfxOk, sfxTrunkFuse, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  fusible,
  gaugeSVG,
  ohmProbe,
  ohmWidgetHTML,
  piedraEl,
  PIEDRAS,
  setGauge,
  setOhmState,
} from './common';
import {
  BRANCH_COUNT,
  BRANCH_ZONES,
  TRUNK_TOLERANCE,
  branchInGreenZone,
  connectBranch,
  createBranchesState,
  replaceTrunkFuse,
  setBranchStone,
  trunkRiver,
  type BranchesChange,
  type BranchStone,
} from './branchesModel';

export interface AbrirBranchesOptions {
  onSolved: () => void;
  onBurnedFuse: () => void;
  practica?: boolean;
}

const STONES: BranchStone[] = ['marron', 'roja', 'amarilla', 'gris'];

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

// TODO(guion): faltan comentarios propios de Lumen para los primeros repuestos
// del Fusible del Tronco. Se reutilizan líneas ya escritas hasta recibirlas.
const REPLACEMENT_COMMENTS = [
  '<b>Lumen:</b> «…Tengo más. No me mires así, Edda.»',
  '<b>Lumen:</b> «¡La cuenta no falla! …Igual traje fusibles consagrados.»',
];

export function abrirBranches(opts: AbrirBranchesOptions): void {
  const practica = opts.practica ?? false;
  openBench(
    'Los Ramales',
    'Cada rama según su freno; el Tronco paga la suma.',
    (bench) => {
      let state = createBranchesState();
      let solved = false;
      let burnedHandled = false;

      const stage = document.createElement('div');
      stage.className = 'bench-stage branches-stage';
      stage.innerHTML = `
        <div class="branches-network">
          <div class="branches-source">EMPUJE</div>
          <div class="branches-trunk live"></div>
          <div class="branches-crossing">Cruce</div>
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
          <div class="branch-zone"><span></span></div>
          <div class="branch-river">Río: 0</div>
          <button class="branch-toggle">Conectar</button>
          <div class="branch-stones" aria-label="Piedras de Freno"></div>`;
        const toggle = card.querySelector<HTMLButtonElement>('.branch-toggle')!;
        const lamp = card.querySelector<HTMLElement>('.branch-lamp')!;
        const river = card.querySelector<HTMLElement>('.branch-river')!;
        const stones = card.querySelector<HTMLElement>('.branch-stones')!;

        for (const stone of STONES) {
          const element = piedraEl(stone);
          element.setAttribute('role', 'button');
          element.setAttribute('tabindex', '0');
          const choose = () => {
            if (solved || state.fuse.burned) return;
            sfxClick();
            applyChange(setBranchStone(state, index, stone), index, 'stone');
          };
          element.addEventListener('click', choose);
          element.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              choose();
            }
          });
          stones.appendChild(element);
        }

        toggle.addEventListener('click', () => {
          if (solved || state.fuse.burned) return;
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
          if (state.fuse.burned) return 'Río: cero.';
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
          bench.setStatus(SECOND_BRANCH_DIALOGUE);
        } else if (!previous.experiences.connectedOne && state.experiences.connectedOne) {
          bench.setStatus(
            'Su taller enciende según su piedra. Las otras bocas, muertas: las ramas no se prestan nada.',
          );
        } else if (change.fuseResult === 'warning') {
          sfxHot();
          bench.setStatus('El fusible mayor avisa, vibra.');
        } else {
          const branch = state.branches[branchIndex];
          const action = source === 'toggle'
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

      function render(): void {
        const trunk = trunkRiver(state);
        const blackedOut = state.fuse.burned;
        stage.classList.toggle('burned', blackedOut);
        stage.querySelector('.branches-trunk')?.classList.toggle('live', !blackedOut && trunk > 0);
        stage.querySelector<HTMLElement>('.branches-trunk-reading')!.textContent =
          `Tronco: ${trunk}`;
        setGauge(stage, trunk, 24);
        setOhmState(stage, blackedOut ? 'inerte' : trunk > TRUNK_TOLERANCE ? 'sobrecarga' : 'estable');

        cardRefs.forEach((refs, index) => {
          const branch = state.branches[index];
          const lit = branch.connected && !blackedOut;
          const glow = lit ? Math.max(0.2, Math.min(1, branch.river / 4)) : 0;
          refs.card.classList.toggle('connected', branch.connected);
          refs.card.classList.toggle('green', branchInGreenZone(state, index) && !blackedOut);
          refs.card.querySelector('.branch-wire')?.classList.toggle('live', lit);
          refs.lamp.style.setProperty('--lamp-glow', String(glow));
          refs.lamp.style.setProperty('--lamp-radius', `${Math.round(24 * glow)}px`);
          refs.river.textContent = `Río: ${lit ? branch.river : 0}`;
          refs.toggle.textContent = branch.connected ? 'Desconectar' : 'Conectar';
          refs.toggle.disabled = solved || blackedOut;
          refs.stones.querySelectorAll<HTMLElement>('.piedra').forEach((stone) => {
            const selected = stone.dataset.key === branch.stone;
            stone.classList.toggle('selected', selected);
            stone.setAttribute('aria-disabled', String(solved || blackedOut));
          });
          const zone = BRANCH_ZONES[index];
          const zoneSpan = refs.card.querySelector<HTMLElement>('.branch-zone span')!;
          zoneSpan.style.left = `${(zone.min / 8) * 100}%`;
          zoneSpan.style.width = `${((zone.max - zone.min) / 8) * 100}%`;
        });

        probe.element.querySelectorAll('button').forEach((button) => {
          button.disabled = solved;
        });
      }

      bench.setStatus('Las otras bocas, muertas: las ramas no se prestan nada.');
      render();
    },
  );
}
