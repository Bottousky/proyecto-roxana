import {
  sfxBridge,
  sfxDim,
  sfxForgeRhythm,
  sfxFzzt,
  sfxHot,
  sfxOk,
} from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  PIEDRAS,
  gaugeSVG,
  piedraEl,
  setGauge,
  setThermometer,
  thermometerSVG,
  type ChannelThickness,
} from './common';
import {
  FORGE_FUSES,
  FORGE_MACHINE_IDS,
  FORGE_MACHINE_TARGETS,
  FORGE_MAX_STONES,
  FORGE_PUSHES,
  FORGE_STONES,
  addForgeStone,
  attemptForge,
  createForgeState,
  evaluateForge,
  forgeChannelStock,
  removeForgeStone,
  repairForgeChannel,
  setForgeFuse,
  setForgePush,
  setForgeThickness,
  type ForgeEvaluation,
  type ForgeFuse,
  type ForgeMachineId,
  type ForgePush,
  type ForgeStone,
} from './forgeModel';

export interface AbrirForgeOptions {
  onSolved: () => void;
  practica?: boolean;
}

interface MachineRefs {
  card: HTMLElement;
  row: HTMLElement;
  readings: HTMLElement;
  gauge: HTMLElement;
  thermometer: HTMLElement;
  thicknessButtons: Map<ChannelThickness, HTMLButtonElement>;
  fuseButtons: Map<ForgeFuse, HTMLButtonElement>;
  stoneButtons: HTMLButtonElement[];
  repairButton: HTMLButtonElement;
}

const MACHINE_LABELS: Record<ForgeMachineId, string> = {
  martillo: 'Martillo',
  fuelle: 'Fuelle',
  lumbre: 'Lumbre',
};

const THICKNESSES: readonly ChannelThickness[] = ['ancho', 'medio', 'angosto'];

const HUNGRY_DIALOGUE: Record<ForgeMachineId, string> = {
  martillo: '<b>Forjadora:</b> «El Martillo pide y no le llega.»',
  fuelle: '<b>Forjadora:</b> «El Fuelle pide y no le llega. Y un fuelle con hambre silba feo.»',
  lumbre: '<b>Forjadora:</b> «La Lumbre pide y no le llega. Sin Lumbre no hay Forja: ella guarda el fuego madre.»',
};

const SOLVED_DIALOGUE =
  '<b>Los tres ritmos se traban en un compás: el Martillo marca, el Fuelle respira, la Lumbre sostiene. La Forja canta.</b><br/><br/>' +
  '<b>Forjadora:</b> «<i>(escucha, los ojos cerrados)</i> Ese compás. ESE. Treinta años sin oírlo.<br/>' +
  'Dile a tu escuela que la Forja paga sus deudas: cuando necesiten hierro bien nacido, es acá.»<br/>' +
  '<b>Consejera:</b> «Entrega del Martillo: treinta y dos. Del Fuelle: dieciséis. De la Lumbre: ocho. Por hora, cincuenta y seis jornales.<br/>' +
  '<i>(pausa, hojea su libro viejo)</i> …Los lacres ceremoniales del Consejo consumían nueve. La biblioteca, ocho.<br/>' +
  'Cuarenta años lacrando puertas con más entrega de la que ahorrábamos al lacrarlas. No anote eso, calderito.»<br/>' +
  '<b>Ohm:</b> «Anotado.»<br/><br/>' +
  '<b>La Bitácora arde y se abre sola.</b>';

export function abrirForge(opts: AbrirForgeOptions): void {
  const mode = { practica: opts.practica ?? false };
  openBench(
    'La Forja completa',
    'Tres máquinas, un solo Tronco y un stock compartido de cobre.',
    (bench) => {
      let state = createForgeState();
      let solvedHandled = false;
      const refs = new Map<ForgeMachineId, MachineRefs>();

      const sourceTray = document.createElement('div');
      sourceTray.className = 'bench-tray forge-sources';
      sourceTray.innerHTML =
        '<span class="tray-label">Cristal de bus:</span>' +
        '<span class="forge-source-stock">Empuje 8 · Empuje 16</span>';
      const sourceButtons = new Map<ForgePush, HTMLButtonElement>();
      for (const push of FORGE_PUSHES) {
        const button = document.createElement('button');
        button.className = 'fuente-opt forge-source';
        button.textContent = `Empuje ${push}`;
        button.addEventListener('click', () => {
          if (state.solved) return;
          state = setForgePush(state, push);
          sfxBridge();
          render();
          bench.setStatus(`Cristal de bus: Empuje ${push}.`);
        });
        sourceButtons.set(push, button);
        sourceTray.appendChild(button);
      }
      bench.root.appendChild(sourceTray);

      const stage = document.createElement('div');
      stage.className = 'bench-stage forge-stage';
      stage.innerHTML = `
        <div class="forge-stock" aria-label="Stock compartido de grosores">
          <strong>stock compartido</strong>
          <span data-stock="ancho">canal ancho: 1</span>
          <span data-stock="medio">canal medio: 2</span>
          <span data-stock="angosto">canal angosto: 2</span>
          <span>fusibles 1 · 2 · 4 · 8</span>
        </div>
        <div class="forge-machines"
          aria-label="Martillo · ENTREGA 32; Fuelle · ENTREGA 16; Lumbre · ENTREGA 8"></div>
        <div class="forge-trunk">
          <div>
            ${gaugeSVG(8, 0.35, 12)}
            <span>aguja de Tronco · tolerancia 8</span>
          </div>
          <strong data-trunk>Tronco: 0 / 8</strong>
        </div>`;
      bench.root.appendChild(stage);

      const machinesHost = stage.querySelector<HTMLElement>('.forge-machines')!;
      for (const machineId of FORGE_MACHINE_IDS) {
        const label = MACHINE_LABELS[machineId];
        const target = FORGE_MACHINE_TARGETS[machineId];
        const card = document.createElement('section');
        card.className = 'forge-machine';
        card.dataset.machine = machineId;
        card.innerHTML = `
          <h3>${label} · ENTREGA ${target}</h3>
          <div class="forge-channel">
            <span class="forge-copper"></span>
            <span data-channel>sin canal</span>
          </div>
          <div class="forge-instruments">
            <div class="forge-gauge">
              ${gaugeSVG(target / 8, 0.35, 9)}
              <span>aguja de rama</span>
            </div>
            <div class="forge-thermometer">${thermometerSVG()}</div>
          </div>
          <div class="forge-readings"></div>
          <div class="forge-row" aria-label="Fila de piedras del ${label}"></div>
          <div class="forge-stone-options" aria-label="Piedras para ${label}"></div>
          <div class="forge-selector" data-selector="thickness"></div>
          <div class="forge-selector" data-selector="fuse"></div>
          <button class="forge-repair hidden">La Forjadora reempalma</button>`;

        const stoneButtons: HTMLButtonElement[] = [];
        const stoneHost = card.querySelector<HTMLElement>('.forge-stone-options')!;
        for (const stone of FORGE_STONES) {
          const button = document.createElement('button');
          button.className = 'forge-stone-button';
          button.title = `Añadir ${PIEDRAS[stone].nombre} al ${label}`;
          button.appendChild(piedraEl(stone));
          button.addEventListener('click', () => addStone(machineId, stone));
          stoneHost.appendChild(button);
          stoneButtons.push(button);
        }

        const thicknessButtons = new Map<ChannelThickness, HTMLButtonElement>();
        const thicknessHost = card.querySelector<HTMLElement>(
          '[data-selector="thickness"]',
        )!;
        for (const thickness of THICKNESSES) {
          const button = document.createElement('button');
          button.className = 'forge-choice';
          button.textContent = thickness;
          button.addEventListener('click', () => chooseThickness(machineId, thickness));
          thicknessHost.appendChild(button);
          thicknessButtons.set(thickness, button);
        }

        const fuseButtons = new Map<ForgeFuse, HTMLButtonElement>();
        const fuseHost = card.querySelector<HTMLElement>('[data-selector="fuse"]')!;
        for (const fuse of FORGE_FUSES) {
          const button = document.createElement('button');
          button.className = 'forge-choice';
          button.textContent = `fusible ${fuse}`;
          button.addEventListener('click', () => chooseFuse(machineId, fuse));
          fuseHost.appendChild(button);
          fuseButtons.set(fuse, button);
        }

        const repairButton = card.querySelector<HTMLButtonElement>('.forge-repair')!;
        repairButton.addEventListener('click', () => repair(machineId));
        machinesHost.appendChild(card);
        refs.set(machineId, {
          card,
          row: card.querySelector<HTMLElement>('.forge-row')!,
          readings: card.querySelector<HTMLElement>('.forge-readings')!,
          gauge: card.querySelector<HTMLElement>('.forge-gauge')!,
          thermometer: card.querySelector<HTMLElement>('.forge-thermometer')!,
          thicknessButtons,
          fuseButtons,
          stoneButtons,
          repairButton,
        });
      }

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        { label: 'Reiniciar práctica', onClick: resetPractice },
        { label: 'Arrancar la Forja', primary: true, onClick: start },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(opts.onSolved),
        },
      ]);
      actions['Reiniciar práctica'].classList.add('hidden');
      actions.Continuar.classList.add('hidden');

      function addStone(machineId: ForgeMachineId, stone: ForgeStone): void {
        if (state.solved) return;
        state = addForgeStone(state, machineId, stone);
        sfxBridge();
        render();
        bench.setStatus(
          `${PIEDRAS[stone].nombre} añadida al ${MACHINE_LABELS[machineId]}. Los frenos de la fila se suman.`,
        );
      }

      function chooseThickness(
        machineId: ForgeMachineId,
        thickness: ChannelThickness,
      ): void {
        if (state.solved) return;
        const selected = state.branches[machineId].thickness;
        state = setForgeThickness(
          state,
          machineId,
          selected === thickness ? null : thickness,
        );
        sfxBridge();
        render();
        bench.setStatus(
          state.branches[machineId].thickness === thickness
            ? `${MACHINE_LABELS[machineId]}: canal ${thickness} asignado.`
            : `No queda otro canal ${thickness} en el stock compartido.`,
        );
      }

      function chooseFuse(machineId: ForgeMachineId, fuse: ForgeFuse): void {
        if (state.solved) return;
        const selected = state.branches[machineId].fuse;
        state = setForgeFuse(state, machineId, selected === fuse ? null : fuse);
        sfxBridge();
        render();
        bench.setStatus(`${MACHINE_LABELS[machineId]}: fusible ${fuse} engastado.`);
      }

      function start(): void {
        if (state.solved) return;
        const result = attemptForge(state);
        state = result.state;
        render(result.evaluation);
        showPeak(result.evaluation);

        if (result.event === 'incomplete') {
          sfxDim();
          bench.setStatus(
            `Falta completar: ${result.diagnostics
              .map((diagnostic) => MACHINE_LABELS[diagnostic.machineId!])
              .join(', ')}.`,
          );
          return;
        }
        if (result.event === 'young-fuse') {
          sfxFzzt();
          bench.setStatus(
            `<b>Lumen:</b> «¡Otro mártir del amanecer! …Ya ni los velo, fíjate.»<br/>` +
              `Se inmoló el fusible de: ${result.youngMachines
                .map((machineId) => MACHINE_LABELS[machineId])
                .join(', ')}.`,
          );
          return;
        }
        if (result.event === 'red-warning') {
          sfxHot();
          const warnings = result.redMachines.map((machineId) => {
            const count = state.branches[machineId].channel.insistences;
            return `${MACHINE_LABELS[machineId]}: canal al rojo, aviso ${count} de 3.`;
          });
          bench.setStatus(warnings.join('<br/>'));
          return;
        }
        if (result.event === 'cut') {
          sfxHot();
          bench.setStatus(
            `Se cortó el canal de ${result.redMachines
              .filter((machineId) => state.branches[machineId].channel.cut)
              .map((machineId) => MACHINE_LABELS[machineId])
              .join(', ')}. La Forjadora puede reempalmarlo.`,
          );
          return;
        }
        if (result.event === 'channel-cut') {
          sfxDim();
          bench.setStatus('Hay un canal cortado. La Forjadora debe reempalmarlo.');
          return;
        }
        if (result.event === 'invalid') {
          sfxDim();
          const messages = result.diagnostics.map((diagnostic) => {
            if (diagnostic.code === 'hungry') {
              return HUNGRY_DIALOGUE[diagnostic.machineId!];
            }
            if (diagnostic.code === 'unsafe-fuse') {
              const label = MACHINE_LABELS[diagnostic.machineId!];
              return `<b>Ohm:</b> «${label}: el fusible aguanta el pico, pero no salta antes del rojo del canal.»`;
            }
            if (diagnostic.code === 'oversized-fuse') {
              const label = MACHINE_LABELS[diagnostic.machineId!];
              return `<b>Ohm:</b> «${label}: hay un calibre menor que aguanta el pico y todavía protege el canal.»`;
            }
            if (diagnostic.code === 'trunk-overload') {
              return '<b>Ohm:</b> «Tronco: más de ocho. Margen: ninguno.»';
            }
            if (diagnostic.code === 'stock') {
              return 'El reparto usa más cobre del que hay en el stock.';
            }
            return 'Falta completar una rama.';
          });
          bench.setStatus(messages.join('<br/>'));
          return;
        }
        if (result.event !== 'solved') return;

        sfxOk();
        sfxForgeRhythm();
        stage.classList.add('solved');
        bench.setStatus(SOLVED_DIALOGUE);
        if (mode.practica) {
          actions['Reiniciar práctica'].classList.remove('hidden');
        } else if (!solvedHandled) {
          solvedHandled = true;
          actions.Alejarse.classList.add('hidden');
          actions['Arrancar la Forja'].classList.add('hidden');
          actions.Continuar.classList.remove('hidden');
        }
        render(result.evaluation);
      }

      function repair(machineId: ForgeMachineId): void {
        state = repairForgeChannel(state, machineId);
        sfxBridge();
        bench.setStatus(
          `La Forjadora reempalma el canal de ${MACHINE_LABELS[machineId]}.`,
        );
        render();
      }

      function resetPractice(): void {
        state = createForgeState();
        solvedHandled = false;
        stage.classList.remove('solved');
        actions['Reiniciar práctica'].classList.add('hidden');
        bench.setStatus('Práctica reiniciada.');
        render();
      }

      function showPeak(evaluation: ForgeEvaluation): void {
        for (const machineId of FORGE_MACHINE_IDS) {
          const machine = evaluation.machines[machineId];
          const machineRefs = refs.get(machineId)!;
          setGauge(machineRefs.gauge, machine.peakRiver, 9);
          setThermometer(machineRefs.thermometer, machine.peakLevel);
          machineRefs.card.classList.add('starting');
        }
        window.setTimeout(() => {
          render();
        }, 900);
      }

      function render(forcedEvaluation?: ForgeEvaluation): void {
        const evaluation = forcedEvaluation ?? evaluateForge(state);
        const stock = forgeChannelStock(state);

        sourceButtons.forEach((button, push) => {
          button.classList.toggle('selected', state.push === push);
          button.disabled = state.solved;
        });
        for (const thickness of THICKNESSES) {
          stage.querySelector<HTMLElement>(`[data-stock="${thickness}"]`)!.textContent =
            `canal ${thickness}: ${stock[thickness]}`;
        }

        for (const machineId of FORGE_MACHINE_IDS) {
          const branch = state.branches[machineId];
          const machine = evaluation.machines[machineId];
          const machineRefs = refs.get(machineId)!;
          machineRefs.card.classList.toggle('stable', state.solved);
          machineRefs.card.classList.toggle('cut', branch.channel.cut);
          machineRefs.card.classList.toggle('hungry', !machine.exactDelivery);
          machineRefs.card.classList.remove('starting');
          machineRefs.card.dataset.level = machine.peakLevel;
          machineRefs.card.querySelector<HTMLElement>('[data-channel]')!.textContent =
            branch.thickness === null ? 'sin canal' : `canal ${branch.thickness}`;
          machineRefs.readings.textContent =
            `Freno ${formatNumber(machine.resistance)} · Río ${formatNumber(machine.river)} · ` +
            `Entrega ${formatNumber(machine.delivery)} / ${machine.targetDelivery} · ` +
            `Pico ${formatNumber(machine.peakRiver)}`;
          setGauge(machineRefs.gauge, machine.river, 9);
          setThermometer(machineRefs.thermometer, machine.workLevel);

          machineRefs.row.innerHTML = '';
          branch.stones.forEach((stone, index) => {
            const slot = document.createElement('button');
            slot.className = 'forge-slot';
            slot.title = `Quitar ${PIEDRAS[stone].nombre}`;
            slot.disabled = state.solved || branch.channel.cut;
            const stoneVisual = piedraEl(stone);
            stoneVisual.classList.add('in-slot');
            slot.appendChild(stoneVisual);
            slot.addEventListener('click', () => {
              state = removeForgeStone(state, machineId, index);
              sfxBridge();
              render();
            });
            machineRefs.row.appendChild(slot);
          });
          for (
            let index = branch.stones.length;
            index < FORGE_MAX_STONES;
            index++
          ) {
            const empty = document.createElement('span');
            empty.className = 'forge-slot empty';
            empty.textContent = '+';
            machineRefs.row.appendChild(empty);
          }

          machineRefs.stoneButtons.forEach((button) => {
            button.disabled =
              state.solved ||
              branch.channel.cut ||
              branch.stones.length >= FORGE_MAX_STONES;
          });
          machineRefs.thicknessButtons.forEach((button, thickness) => {
            const selected = branch.thickness === thickness;
            button.classList.toggle('selected', selected);
            button.disabled =
              state.solved ||
              branch.channel.cut ||
              (!selected && stock[thickness] <= 0);
          });
          machineRefs.fuseButtons.forEach((button, fuse) => {
            button.classList.toggle('selected', branch.fuse === fuse);
            button.disabled = state.solved || branch.channel.cut;
          });
          machineRefs.repairButton.classList.toggle('hidden', !branch.channel.cut);
        }

        const trunkGauge = stage.querySelector<HTMLElement>('.forge-trunk')!;
        setGauge(trunkGauge, evaluation.trunkRiver, 12);
        stage.querySelector<HTMLElement>('[data-trunk]')!.textContent =
          `Tronco: ${formatNumber(evaluation.trunkRiver)} / 8`;
        stage.classList.toggle('trunk-overload', !evaluation.trunkOk);
        actions['Arrancar la Forja'].disabled = state.solved;
      }

      bench.setStatus(
        'Elige el cristal, arma cada fila, reparte el cobre y engasta los fusibles. Al arrancar, cada rama pica río + 1.',
      );
      render();
    },
  );
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
