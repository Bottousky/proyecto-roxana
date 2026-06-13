import { sfxBridge, sfxFzzt, sfxHot, sfxOk, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  gaugeSVG,
  setGauge,
  setThermometer,
  thermometerSVG,
  type HeatLevel,
} from './common';
import {
  FUSE_RATINGS,
  INFIRMARY_MACHINES,
  createInfirmaryState,
  infirmaryReading,
  repairDemoChannel,
  setMachineFuse,
  startForge,
  type FuseRating,
  type InfirmaryMachineId,
} from './infirmaryModel';

export interface AbrirInfirmaryOptions {
  onSolved: () => void;
  onBurnedChannel: () => void;
  practica?: boolean;
}

interface MachineRefs {
  card: HTMLElement;
  fuseButtons: HTMLButtonElement[];
  fuseSlot: HTMLElement;
  thermometer: HTMLElement;
  gauge: HTMLElement;
}

const MACHINE_IDS: InfirmaryMachineId[] = ['A', 'B', 'C'];

const YOUNG_FUSE_DIALOGUE =
  '<b>Lumen:</b> «¡Otro mártir del amanecer! …Ya ni los velo, fíjate.»';

const BURNED_CHANNEL_DIALOGUE =
  '<b>Yesca:</b> «¿Y ESO quién lo repone? El fusible cuesta un cobre. El canal, una semana.»<br/>' +
  '<b>Lumen:</b> «…El gordo no era un santo. Era un cómplice.»';

const SOLVED_DIALOGUE =
  '<b>Lumen:</b> «Un mártir por año es santidad. Uno por semana es mal cálculo.<br/>' +
  'Cuarenta años venerando el sacrificio y la respuesta era… margen. Elegir el margen.»';

export function abrirInfirmary(opts: AbrirInfirmaryOptions): void {
  const practica = opts.practica ?? false;
  openBench(
    'La enfermería',
    'Tres máquinas. Un pico breve al arrancar. Un fusible para cada margen.',
    (bench) => {
      let state = createInfirmaryState();
      let solvedHandled = false;
      let demoHandled = false;
      const refs = new Map<InfirmaryMachineId, MachineRefs>();

      const stage = document.createElement('div');
      stage.className = 'bench-stage infirmary-stage';
      stage.innerHTML = `
        <div class="infirmary-machines" aria-label="Tres máquinas de la Forja"></div>
        <div class="infirmary-legend">
          <span>fusibles disponibles: 1 · 2 · 4 · 8</span>
          <span>al arrancar: pico = río + 1</span>
        </div>`;
      bench.root.appendChild(stage);

      const machinesHost = stage.querySelector<HTMLElement>('.infirmary-machines')!;
      for (const id of MACHINE_IDS) {
        const machine = INFIRMARY_MACHINES[id];
        const reading = infirmaryReading(id);
        const card = document.createElement('section');
        card.className = 'infirmary-machine';
        card.dataset.machine = id;
        card.innerHTML = `
          <h3>Máquina ${id}</h3>
          <div class="infirmary-plate">río de trabajo ${machine.workRiver}</div>
          <div class="infirmary-channel">
            <span class="infirmary-copper"></span>
            <span>canal ${machine.thickness}</span>
          </div>
          <div class="infirmary-instruments">
            <div class="infirmary-gauge">
              ${gaugeSVG(machine.peakRiver, 0.3, 8)}
              <span>aguja de río</span>
            </div>
            <div class="infirmary-thermometer">${thermometerSVG(reading.workLevel)}</div>
          </div>
          <div class="infirmary-fuse-slot">sin fusible</div>
          <div class="infirmary-fuses" aria-label="Fusibles para máquina ${id}"></div>`;

        const fuseButtons: HTMLButtonElement[] = [];
        const fusesHost = card.querySelector<HTMLElement>('.infirmary-fuses')!;
        for (const rating of FUSE_RATINGS) {
          const button = document.createElement('button');
          button.className = 'infirmary-fuse';
          button.dataset.rating = String(rating);
          button.textContent = String(rating);
          button.title = `Engastar fusible ${rating} en máquina ${id}`;
          button.addEventListener('click', () => chooseFuse(id, rating));
          fusesHost.appendChild(button);
          fuseButtons.push(button);
        }

        machinesHost.appendChild(card);
        refs.set(id, {
          card,
          fuseButtons,
          fuseSlot: card.querySelector<HTMLElement>('.infirmary-fuse-slot')!,
          thermometer: card.querySelector<HTMLElement>('.infirmary-thermometer')!,
          gauge: card.querySelector<HTMLElement>('.infirmary-gauge')!,
        });
      }

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Yesca repara el canal',
          onClick: repairChannel,
        },
        {
          label: 'Reiniciar práctica',
          onClick: resetPractice,
        },
        {
          label: 'Arrancar la Forja',
          primary: true,
          onClick: start,
        },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(opts.onSolved),
        },
      ]);
      actions['Yesca repara el canal'].classList.add('hidden');
      actions['Reiniciar práctica'].classList.add('hidden');
      actions['Continuar'].classList.add('hidden');

      function chooseFuse(machineId: InfirmaryMachineId, rating: FuseRating): void {
        if (state.channelCut || state.solved) return;
        sfxBridge();
        state = setMachineFuse(state, machineId, rating);
        render();
        bench.setStatus(
          `<b>Máquina ${machineId}:</b> fusible ${rating} engastado. La aguja espera el pico.`,
        );
      }

      function start(): void {
        if (state.channelCut || state.solved) return;
        const result = startForge(state);
        state = result.state;
        showPeak(result.event === 'burned-channel-demo' ? 'rojo' : undefined);

        if (result.event === 'burned-channel-demo') {
          sfxHot();
          stage.classList.add('channel-cut');
          actions['Yesca repara el canal'].classList.remove('hidden');
          if (!demoHandled) {
            demoHandled = true;
            opts.onBurnedChannel();
          }
          bench.setStatus(BURNED_CHANNEL_DIALOGUE);
        } else if (result.event === 'young-fuse') {
          sfxFzzt();
          bench.setStatus(YOUNG_FUSE_DIALOGUE);
        } else if (result.event === 'solved') {
          sfxOk();
          sfxWin();
          bench.setStatus(SOLVED_DIALOGUE);
          if (practica) {
            actions['Reiniciar práctica'].classList.remove('hidden');
          } else if (!solvedHandled) {
            solvedHandled = true;
            actions['Alejarse'].classList.add('hidden');
            actions['Arrancar la Forja'].classList.add('hidden');
            actions['Continuar'].classList.remove('hidden');
          }
        } else if (result.event === 'incomplete') {
          const missing = MACHINE_IDS.filter((id) => state.fuses[id] === null);
          if (missing.length > 0) {
            bench.setStatus(`Faltan fusibles en: ${missing.join(', ')}. <b>Lumen:</b> «Una máquina sin fusible no es valiente. Es huérfana.»`);
          } else {
            bench.setStatus('Las máquinas arrancan. <b>Lumen:</b> «Funciona… con margen de más. El calibre justo también es una forma de respeto.»');
          }
        }
        render();
      }

      function repairChannel(): void {
        state = repairDemoChannel(state);
        stage.classList.remove('channel-cut');
        actions['Yesca repara el canal'].classList.add('hidden');
        sfxBridge();
        bench.setStatus('<b>Yesca:</b> «Reempalmado. Las demostraciones también se cobran, Lumen.»');
        render();
      }

      function resetPractice(): void {
        state = createInfirmaryState();
        demoHandled = false;
        stage.classList.remove('channel-cut');
        actions['Yesca repara el canal'].classList.add('hidden');
        actions['Reiniciar práctica'].classList.add('hidden');
        bench.setStatus('Práctica reiniciada.');
        render();
      }

      function showPeak(forcedA?: HeatLevel): void {
        for (const id of MACHINE_IDS) {
          const machine = INFIRMARY_MACHINES[id];
          const machineRefs = refs.get(id)!;
          setGauge(machineRefs.gauge, forcedA && id === 'A' ? 8 : machine.peakRiver, 8);
          setThermometer(
            machineRefs.thermometer,
            forcedA && id === 'A' ? forcedA : infirmaryReading(id).peakLevel,
          );
          machineRefs.card.classList.add('starting');
        }

        window.setTimeout(() => {
          if (state.channelCut || state.solved) return;
          for (const id of MACHINE_IDS) {
            const machineRefs = refs.get(id)!;
            setGauge(machineRefs.gauge, INFIRMARY_MACHINES[id].workRiver, 8);
            setThermometer(machineRefs.thermometer, infirmaryReading(id).workLevel);
            machineRefs.card.classList.remove('starting');
          }
        }, 850);
      }

      function render(): void {
        for (const id of MACHINE_IDS) {
          const machineRefs = refs.get(id)!;
          const selected = state.fuses[id];
          machineRefs.fuseSlot.textContent =
            selected === null ? 'sin fusible' : `fusible ${selected}`;
          machineRefs.card.classList.toggle('cut', id === 'A' && state.channelCut);
          machineRefs.card.classList.toggle('stable', state.solved);
          machineRefs.fuseButtons.forEach((button) => {
            button.classList.toggle('selected', Number(button.dataset.rating) === selected);
            button.disabled = state.channelCut || state.solved;
          });
        }

        actions['Arrancar la Forja'].disabled = state.channelCut || state.solved;
      }

      bench.setStatus(
        'Engasta fusibles y arranca. Lumen señala el 8 junto a la máquina A para una falla simulada.',
      );
      render();
    },
  );
}
