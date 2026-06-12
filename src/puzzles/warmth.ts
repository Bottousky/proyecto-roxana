import { sfxBridge, sfxHot, sfxOk, sfxWin } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import {
  llaveTramo,
  ohmProbe,
  setThermometer,
  thermometerSVG,
} from './common';
import {
  WARMTH_CHANNELS,
  createWarmthState,
  isWarmthSolved,
  observeWarmth,
  setAnvilDoubled,
  warmthReading,
  type WarmthChannelId,
  type WarmthState,
} from './warmthModel';

const CHANNEL_IDS: WarmthChannelId[] = ['martillo', 'fuelle', 'viejo', 'yunque'];

const MARTILLO_DIALOGUE =
  '<b>Ohm:</b> «Río: grande. Canal: chico. Peaje: en curso.»';

const FUELLE_DIALOGUE =
  '<b>Edda:</b> «¡El mismo río! ¿Por qué este ni se entera?»<br/>' +
  '<b>Ohm:</b> «Mismo río. Más cauce. Menos peaje.»';

const VIEJO_DIALOGUE =
  '<b>Forjadora:</b> «Ese canal tiene cien años y está helado. Así que no es la edad. Mi abuelo SIEMPRE dijo que era la edad.»';

const DUPLICADO_DIALOGUE =
  '<b>Ohm:</b> «Doble de río. Cuádruple de peaje. Anótelo.»<br/>' +
  '<b>Consejera:</b> «YA lo anoté. Es mi línea, calderito.»';

const SOLVED_DIALOGUE =
  '<b>Forjadora:</b> «A ver si entendí: el calor no es fantasma ni vejez. Es el precio del paso. Más río por el mismo canal, más caro el peaje.<br/>…¿Y quién lo cobra?»<br/>' +
  '<b>Edda:</b> «El aire, supongo. Se lo lleva y no da recibo.»';

interface ChannelRefs {
  card: HTMLElement;
  river: HTMLElement;
  thermometer: HTMLElement;
}

export function abrirWarmth(onSolved: () => void, practica = false): void {
  openBench(
    'El canal tibio',
    'Ohm apoya la mano. El canal responde sin romperse.',
    (bench) => {
      let state = createWarmthState();
      let solved = false;
      const refs = new Map<WarmthChannelId, ChannelRefs>();

      const stage = document.createElement('div');
      stage.className = 'bench-stage warmth-stage';
      stage.innerHTML = `
        <div class="warmth-channels" aria-label="Cuatro canales del patio"></div>
        <div class="warmth-switch-host"></div>
        <div class="warmth-probe-host"></div>
        <div class="warmth-progress" aria-label="Experiencias observadas">
          <span data-experience="hammer">martillo</span>
          <span data-experience="bellowsBase">fuelle</span>
          <span data-experience="oldChannel">canal viejo</span>
          <span data-experience="anvilDoubled">salto del yunque</span>
        </div>`;
      bench.root.appendChild(stage);

      const channelsHost = stage.querySelector<HTMLElement>('.warmth-channels')!;
      for (const id of CHANNEL_IDS) {
        const channel = WARMTH_CHANNELS[id];
        const card = document.createElement('section');
        card.className = 'warmth-channel';
        card.dataset.channel = id;
        card.innerHTML = `
          <h3>${channel.label}</h3>
          <div class="warmth-cut">
            <span class="warmth-copper"></span>
            <span class="warmth-machine">${id === 'viejo' ? 'en desuso' : id}</span>
          </div>
          <div class="warmth-thickness">canal ${channel.thickness}</div>
          <div class="warmth-river" aria-label="Puntos de río"></div>
          <div class="warmth-thermometer unread">${thermometerSVG()}</div>`;
        channelsHost.appendChild(card);
        refs.set(id, {
          card,
          river: card.querySelector<HTMLElement>('.warmth-river')!,
          thermometer: card.querySelector<HTMLElement>('.warmth-thermometer')!,
        });
      }

      const anvilSwitch = llaveTramo(
        'Segundo martillo al canal del yunque',
        false,
        (closed) => {
          if (solved) return;
          sfxBridge();
          state = setAnvilDoubled(state, closed);
          probe.clear();
          render();
          // TODO(guion): reacción breve al mover la llave antes de apoyar la mano.
          bench.setStatus(
            closed
              ? 'El segundo martillo entra en el canal del yunque. Ohm espera una medición.'
              : 'El segundo martillo queda fuera del canal del yunque.',
          );
        },
      );
      stage.querySelector<HTMLElement>('.warmth-switch-host')!.appendChild(anvilSwitch.element);

      const probe = ohmProbe(
        CHANNEL_IDS.map((id) => ({
          id,
          label: `Apoyar la mano: ${WARMTH_CHANNELS[id].label}`,
        })),
        (id) => {
          const reading = warmthReading(state, id as WarmthChannelId);
          return `Río: ${reading.river}.`;
        },
        (_reading, tramo) => measure(tramo.id as WarmthChannelId),
      );
      stage.querySelector<HTMLElement>('.warmth-probe-host')!.appendChild(probe.element);

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(onSolved),
        },
      ]);
      actions['Continuar'].classList.add('hidden');

      function measure(id: WarmthChannelId): void {
        if (solved) return;
        const previous = state;
        state = observeWarmth(state, id);
        const reading = warmthReading(state, id);
        if (reading.level === 'rojo') sfxHot();
        else sfxOk();
        render();

        const firstObservation =
          id === 'martillo'
            ? !previous.experiences.hammer
            : id === 'viejo'
              ? !previous.experiences.oldChannel
              : id === 'fuelle'
                ? !previous.experiences.bellowsBase
                : state.anvilDoubled
                  ? !previous.experiences.anvilDoubled
                  : false;

        if (firstObservation) {
          if (id === 'martillo') bench.setStatus(MARTILLO_DIALOGUE);
          else if (id === 'viejo') bench.setStatus(VIEJO_DIALOGUE);
          else if (id === 'fuelle') bench.setStatus(FUELLE_DIALOGUE);
          else bench.setStatus(DUPLICADO_DIALOGUE);
        } else {
          bench.setStatus(
            `<b>${WARMTH_CHANNELS[id].label}:</b> ${reading.level === 'rojo' ? 'al rojo' : reading.level}.`,
          );
        }

        if (!practica && isWarmthSolved(state)) {
          solved = true;
          sfxWin();
          anvilSwitch.element.disabled = true;
          probe.element.querySelectorAll('button').forEach((button) => {
            button.disabled = true;
          });
          actions['Alejarse'].classList.add('hidden');
          actions['Continuar'].classList.remove('hidden');
          bench.setStatus(SOLVED_DIALOGUE);
        }
      }

      function observedForCurrentState(id: WarmthChannelId, current: WarmthState): boolean {
        if (id === 'martillo') return current.experiences.hammer;
        if (id === 'viejo') return current.experiences.oldChannel;
        if (id === 'fuelle') return current.experiences.bellowsBase;
        return current.anvilDoubled
          ? current.experiences.anvilDoubled
          : current.anvilBaseObserved;
      }

      function renderRiverDots(host: HTMLElement, river: number): void {
        host.innerHTML = Array.from(
          { length: 8 },
          (_, index) => `<span class="${index < river ? 'live' : ''}"></span>`,
        ).join('');
        host.setAttribute('aria-label', `Río: ${river}`);
      }

      function render(): void {
        for (const id of CHANNEL_IDS) {
          const reading = warmthReading(state, id);
          const channelRefs = refs.get(id)!;
          renderRiverDots(channelRefs.river, reading.river);
          setThermometer(channelRefs.thermometer, reading.level);
          const observed = observedForCurrentState(id, state);
          channelRefs.thermometer.classList.toggle('unread', !observed);
          channelRefs.card.classList.toggle('measured', observed);
          channelRefs.card.dataset.level = observed ? reading.level : '';
        }

        for (const [experience, done] of Object.entries(state.experiences)) {
          stage
            .querySelector(`[data-experience="${experience}"]`)
            ?.classList.toggle('done', done);
        }
      }

      bench.setStatus('Apoye la mano sobre un canal. Ohm medirá uno por vez.');
      render();
    },
  );
}
