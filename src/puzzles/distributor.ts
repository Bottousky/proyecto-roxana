import {
  sfxBridge,
  sfxClick,
  sfxDim,
  sfxHot,
  sfxOk,
  sfxTrunkFuse,
  sfxWin,
} from '../audio';
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
  DISTRIBUTOR_PUSHES,
  DISTRIBUTOR_STONES,
  DISTRIBUTOR_TARGETS,
  DISTRIBUTOR_TRUNK_TOLERANCE,
  createDistributorState,
  districtInGreenZone,
  distributorTrunkRiver,
  replaceDistributorFuse,
  setDistributorPush,
  setDistributorStone,
  type DistributorChange,
  type DistributorPush,
  type DistributorState,
} from './distributorModel';

export interface AbrirDistributorOptions {
  onSolved: () => void;
  onBurnedFuse: () => void;
  practica?: boolean;
}

const DISTRICTS = [
  { name: 'Forja', target: 4, className: 'forja' },
  { name: 'Campanario', target: 2, className: 'campanario' },
  { name: 'Biblioteca', target: 1, className: 'biblioteca' },
] as const;

const RESOLUTION =
  '<b>El Repartidor «canta»: un acorde de cobre.</b><br/>' +
  'El Castillo se enciende en cadena visible: forja, campanario, biblioteca, pasillos, almenas. ' +
  'Por las ventanas se ve la plaza de Ohmdal allá abajo, y a los ciudadanos dándose vuelta hacia el Castillo.<br/><br/>' +
  '<b>Inscripción del mosaico:</b> «Lo que entra en el cruce, sale del cruce. ' +
  'Nada se pierde. Todo se reparte.»<br/><br/>' +
  '<b>Consejera:</b> «Cuarenta años de inventarios… Yo custodiaba un tesoro que no se gastaba por usarlo. ' +
  'El último sello es mío. Lo rompo yo.»<br/>' +
  '<b>Ohm:</b> «Registro histórico: Consejo actualizado. Tiempo transcurrido: una tarde.»<br/>' +
  '<b>Lumen:</b> «Más rápido que yo. No se lo digan.»';

const REPLACEMENT_COMMENTS = [
  '<b>Lumen:</b> «Un fusible para el Corazón del Castillo. Si me lo decían de aprendiz, me desmayo.»',
  '<b>Lumen:</b> «Otro más. La Consejera anota; yo repongo. Cada cual su liturgia.»',
  '<b>Lumen:</b> «…Tengo más. No me miren así.»',
];

export function abrirDistributor(opts: AbrirDistributorOptions): void {
  const practica = opts.practica ?? false;
  openBench(
    'El Repartidor',
    'Reparto hacia objetivos distintos, con presupuesto de Tronco.',
    (bench) => {
      let state = createDistributorState();
      let solved = false;
      let burnedHandled = false;

      const sourceTray = document.createElement('div');
      sourceTray.className = 'bench-tray distributor-sources';
      sourceTray.innerHTML = '<span class="tray-label">Cristal de Empuje:</span>';
      const sourceButtons = new Map<DistributorPush, HTMLButtonElement>();
      for (const push of DISTRIBUTOR_PUSHES) {
        const button = document.createElement('button');
        button.className = 'fuente-opt distributor-source';
        button.textContent = `Empuje ${push}`;
        button.addEventListener('click', () => {
          if (solved || state.fuse.burned) return;
          sfxClick();
          applyChange(setDistributorPush(state, push));
        });
        sourceButtons.set(push, button);
        sourceTray.appendChild(button);
      }
      bench.root.appendChild(sourceTray);

      const stage = document.createElement('div');
      stage.className = 'bench-stage distributor-stage';
      stage.innerHTML = `
        <div class="distributor-network">
          <div class="distributor-crystal">Empuje <span>4</span></div>
          <div class="distributor-trunk live"></div>
          <div class="distributor-crossing">Cruce</div>
          <div class="distributor-districts"></div>
        </div>
        <aside class="distributor-instruments">
          <div class="distributor-trunk-gauge">
            ${gaugeSVG(4, 4, 24)}
            <div class="distributor-gauge-label">aguja del Tronco · tolerancia 8</div>
            <div class="distributor-trunk-reading">Tronco: 0</div>
          </div>
          ${ohmWidgetHTML()}
        </aside>`;
      bench.root.appendChild(stage);

      const districtsHost = stage.querySelector<HTMLElement>('.distributor-districts')!;
      const districtRefs: {
        card: HTMLElement;
        river: HTMLElement;
        stones: HTMLElement;
        gauge: HTMLElement;
      }[] = [];

      DISTRICTS.forEach((district, index) => {
        const card = document.createElement('section');
        card.className = `distributor-district ${district.className}`;
        card.innerHTML = `
          <div class="distributor-wire live"></div>
          <h3>${district.name}</h3>
          <div class="distributor-emblem" aria-label="${district.name}"></div>
          <div class="distributor-district-gauge">
            ${gaugeSVG(district.target, 0.12, 8)}
          </div>
          <div class="distributor-target">marca justa: Río ${district.target}</div>
          <div class="distributor-river">Río: 0</div>
          <div class="distributor-stones" aria-label="Piedras de Freno"></div>`;
        const stones = card.querySelector<HTMLElement>('.distributor-stones')!;
        for (const stone of DISTRIBUTOR_STONES) {
          const element = piedraEl(stone);
          element.setAttribute('role', 'button');
          element.setAttribute('tabindex', '0');
          const choose = () => {
            if (solved || state.fuse.burned) return;
            sfxBridge();
            applyChange(setDistributorStone(state, index, stone));
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
        districtsHost.appendChild(card);
        districtRefs.push({
          card,
          river: card.querySelector<HTMLElement>('.distributor-river')!,
          stones,
          gauge: card.querySelector<HTMLElement>('.distributor-district-gauge')!,
        });
      });

      const fuse = fusible(DISTRIBUTOR_TRUNK_TOLERANCE, 24);
      fuse.element.classList.add('distributor-fuse');
      bench.root.appendChild(fuse.element);

      const probe = ohmProbe(
        [
          { id: 'trunk', label: 'Tronco' },
          { id: 'district-0', label: 'Forja' },
          { id: 'district-1', label: 'Campanario' },
          { id: 'district-2', label: 'Biblioteca' },
        ],
        (id) => {
          if (state.fuse.burned) return 'Río: cero.';
          const river =
            id === 'trunk'
              ? distributorTrunkRiver(state)
              : state.districts[Number(id.replace('district-', ''))].river;
          return `Río: ${river}.`;
        },
        (reading, tramo) => bench.setStatus(`<b>${tramo.label}:</b> ${reading}`),
      );
      const probeHost = document.createElement('div');
      probeHost.className = 'distributor-probes';
      probeHost.appendChild(probe.element);
      bench.root.appendChild(probeHost);

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Lumen repone el fusible',
          onClick: () => {
            state = replaceDistributorFuse(state);
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

      function applyChange(change: DistributorChange): void {
        state = change.state;
        render();
        syncFuse(change);
        if (state.fuse.burned) return;

        if (state.solved) {
          sfxOk();
          if (practica) {
            bench.setStatus(
              state.alternativeSolution
                ? '<b>Ohm:</b> «Otra red. El mismo reparto.»'
                : '<b>El Repartidor «canta»: un acorde de cobre.</b>',
            );
            return;
          }
          if (!solved) {
            solved = true;
            sfxWin();
            const equivalence = state.alternativeSolution
              ? '<b>Ohm:</b> «Otra red. El mismo reparto.»<br/><br/>'
              : '';
            bench.setStatus(equivalence + RESOLUTION);
            actions['Alejarse'].classList.add('hidden');
            actions['Continuar'].classList.remove('hidden');
            render();
          }
          return;
        }

        if (change.fuseResult === 'warning') {
          sfxHot();
          bench.setStatus('<b>El fusible mayor avisa, vibra.</b>');
          return;
        }

        sfxDim();
        bench.setStatus(districtFeedback(state));
      }

      function syncFuse(change: DistributorChange): void {
        const visualResult = fuse.setValue(distributorTrunkRiver(state));
        if (
          change.fuseResult === 'burned' &&
          visualResult === 'burned' &&
          !burnedHandled
        ) {
          handleBurn();
        }
      }

      function handleBurn(): void {
        burnedHandled = true;
        sfxTrunkFuse();
        setOhmState(stage, 'sobrecarga');
        stage.classList.add('burned');
        actions['Lumen repone el fusible'].classList.remove('hidden');
        opts.onBurnedFuse();
        bench.setStatus(
          '<b>El fusible mayor se inmola.</b> Todo queda a oscuras. ' +
          'Lumen tiene repuestos. Siempre tiene repuestos.',
        );
        render();
      }

      function render(): void {
        const trunk = distributorTrunkRiver(state);
        const blackedOut = state.fuse.burned;
        stage.classList.toggle('burned', blackedOut);
        stage.querySelector<HTMLElement>('.distributor-crystal span')!.textContent =
          String(state.push);
        stage.querySelector('.distributor-trunk')?.classList.toggle('live', !blackedOut);
        stage.querySelector<HTMLElement>('.distributor-trunk-reading')!.textContent =
          `Tronco: ${blackedOut ? 0 : trunk}`;
        setGauge(stage.querySelector<HTMLElement>('.distributor-trunk-gauge')!, blackedOut ? 0 : trunk, 24);
        setOhmState(
          stage,
          blackedOut
            ? 'inerte'
            : trunk > DISTRIBUTOR_TRUNK_TOLERANCE
              ? 'sobrecarga'
              : state.solved
                ? 'estable'
                : 'debil',
        );

        sourceButtons.forEach((button, push) => {
          button.classList.toggle('selected', push === state.push);
          button.disabled = solved || blackedOut;
        });

        districtRefs.forEach((refs, index) => {
          const district = state.districts[index];
          const river = blackedOut ? 0 : district.river;
          refs.card.classList.toggle('green', !blackedOut && districtInGreenZone(state, index));
          refs.card.classList.toggle('wrong', !blackedOut && !districtInGreenZone(state, index));
          refs.card.querySelector('.distributor-wire')?.classList.toggle('live', !blackedOut);
          refs.river.textContent = `Río: ${river}`;
          setGauge(refs.gauge, river, 8);
          refs.stones.querySelectorAll<HTMLElement>('.piedra').forEach((stone) => {
            const selected = stone.dataset.key === district.stone;
            stone.classList.toggle('selected', selected);
            stone.setAttribute('aria-disabled', String(solved || blackedOut));
            stone.title = `${PIEDRAS[stone.dataset.key!].nombre}: ${PIEDRAS[stone.dataset.key!].valor}`;
          });
        });

        probe.element.querySelectorAll('button').forEach((button) => {
          button.disabled = solved;
        });
      }

      bench.setStatus(
        'La forja pide Río 4; el campanario, Río 2; la biblioteca, Río 1. ' +
        'El Tronco tolera hasta 8.',
      );
      render();
    },
  );
}

function districtFeedback(state: DistributorState): string {
  const feedback: string[] = [];
  if (!districtInGreenZone(state, 0)) {
    feedback.push('<b>Forja:</b> la forja «tose» hollín.');
  }
  if (!districtInGreenZone(state, 1)) {
    feedback.push('<b>Campanario:</b> da una nota desafinada.');
  }
  if (!districtInGreenZone(state, 2)) {
    feedback.push(
      state.districts[2].river > DISTRIBUTOR_TARGETS[2]
        ? '<b>Biblioteca:</b> le llega río de más… y aplaude. Le gusta la penumbra.'
        : '<b>Biblioteca:</b> su emblema parpadea débil.',
    );
  }
  return feedback.join('<br/>');
}
