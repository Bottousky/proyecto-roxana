import { sfxBell } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import { llaveTramo, ohmProbe, ohmWidgetHTML, setOhmState } from './common';
import {
  bellReading,
  bellState,
  createBellProgress,
  visitBellState,
  type BellSegment,
  type BellState,
} from './bellModel';

const PROBE_TRAMOS = [
  { id: 'left', label: 'Tramo izquierdo' },
  { id: 'right', label: 'Tramo derecho' },
  { id: 'trunk', label: 'Tronco' },
];

export function abrirBell(onSolved: () => void, replay = false): void {
  openBench(
    'La campana de dos cables',
    replay
      ? 'Dos caminos no era un lujo. Era una promesa: que la campana no se calle nunca, ni aunque un cable falle.'
      : 'Hipótesis disponible. Medición recomendada.',
    (bench) => {
      let leftClosed = true;
      let rightClosed = true;
      let progress = createBellProgress();
      let currentState: BellState = 'both-closed';
      let solved = false;
      const measured: Record<BellState, Set<BellSegment>> = {
        'both-closed': new Set(),
        'one-open': new Set(),
        'both-open': new Set(),
      };

      const stage = document.createElement('div');
      stage.className = 'bench-stage bell-stage';
      stage.innerHTML = `
        <svg viewBox="0 0 620 350" aria-label="Fuente, Tronco, Cruce, dos tramos y campana">
          <rect x="245" y="276" width="130" height="58" rx="7" fill="#45382a" stroke="#8a7c50" stroke-width="2"/>
          <text x="310" y="310" fill="#e8d8b8" font-size="13" text-anchor="middle">FUENTE</text>

          <path class="wire bell-trunk" d="M310 276 V220"/>
          <circle cx="310" cy="210" r="10" fill="#8a7c50"/>
          <text x="326" y="214" fill="#a99" font-size="11">Cruce</text>
          <text x="324" y="255" fill="#a99" font-size="11">Tronco</text>

          <path class="wire bell-left" d="M310 210 H180 V92 H285"/>
          <path class="wire bell-right" d="M310 210 H440 V92 H335"/>
          <text x="172" y="156" fill="#a99" font-size="11" text-anchor="middle">izquierdo</text>
          <text x="448" y="156" fill="#a99" font-size="11" text-anchor="middle">derecho</text>

          <circle cx="310" cy="92" r="10" fill="#8a7c50"/>
          <path class="wire bell-output" d="M310 82 V64"/>
          <path class="bell-shape" d="M272 54 Q310 8 348 54 L358 76 H262 Z"
            fill="#4f4a42" stroke="#8a7c50" stroke-width="3"/>
          <circle class="bell-clapper" cx="310" cy="78" r="8" fill="#8a7c50"/>
          <text x="310" y="24" fill="#d8cfc0" font-size="12" text-anchor="middle">CAMPANA</text>

          <g class="bell-key-left">
            <circle cx="180" cy="180" r="8" fill="#26222e" stroke="#8a7c50" stroke-width="2"/>
            <line x1="180" y1="180" x2="180" y2="151" stroke="#e8dcc0" stroke-width="5" stroke-linecap="round"/>
          </g>
          <g class="bell-key-right">
            <circle cx="440" cy="180" r="8" fill="#26222e" stroke="#8a7c50" stroke-width="2"/>
            <line x1="440" y1="180" x2="440" y2="151" stroke="#e8dcc0" stroke-width="5" stroke-linecap="round"/>
          </g>
        </svg>
        <div class="bell-ohm">${ohmWidgetHTML()}</div>`;
      bench.root.appendChild(stage);
      setOhmState(stage, 'estable');

      const switches = document.createElement('div');
      switches.className = 'bell-switches';
      bench.root.appendChild(switches);

      const setCircuitVisuals = () => {
        const sounding = leftClosed || rightClosed;
        stage.querySelector('.bell-trunk')?.classList.toggle('live', sounding);
        stage.querySelector('.bell-output')?.classList.toggle('live', sounding);
        stage.querySelector('.bell-left')?.classList.toggle('live', leftClosed);
        stage.querySelector('.bell-right')?.classList.toggle('live', rightClosed);
        stage.querySelector('.bell-key-left')?.classList.toggle('open', !leftClosed);
        stage.querySelector('.bell-key-right')?.classList.toggle('open', !rightClosed);
        const bell = stage.querySelector<SVGPathElement>('.bell-shape')!;
        bell.setAttribute('fill', sounding ? '#b08d2a' : '#4f4a42');
        bell.style.filter = sounding
          ? 'drop-shadow(0 0 12px rgba(255,211,77,.75))'
          : 'none';
      };

      const stateStatus = (state: BellState): string => {
        if (state === 'both-open') return '<b>Silencio.</b>';
        return '<b>La campana suena.</b>';
      };

      let probe: ReturnType<typeof ohmProbe>;
      const renderState = (ring: boolean) => {
        currentState = bellState(leftClosed, rightClosed);
        setCircuitVisuals();
        probe?.clear();
        if (ring && (leftClosed || rightClosed)) sfxBell();

        if (!replay) {
          progress = visitBellState(progress, currentState);
          if (progress.solved && !solved) {
            solved = true;
            leftSwitch.element.disabled = true;
            rightSwitch.element.disabled = true;
            actions['Alejarse'].classList.add('hidden');
            actions['Continuar'].classList.remove('hidden');
            bench.setStatus(
              '<b>Edda:</b> «Dos caminos no era un lujo. Era una promesa: que la campana no se calle nunca, ni aunque un cable falle.<br/>' +
                'Los Maestros no gastaban doble. <b>Confiaban doble.</b>»<br/>' +
                '<b>Ohm:</b> «Registro: lo que entró al cruce, salió del cruce. Diferencia: cero.»',
            );
            return;
          }
        }
        bench.setStatus(stateStatus(currentState));
      };

      const leftSwitch = llaveTramo('Tramo izquierdo', true, (closed) => {
        if (solved) return;
        leftClosed = closed;
        renderState(true);
      });
      const rightSwitch = llaveTramo('Tramo derecho', true, (closed) => {
        if (solved) return;
        rightClosed = closed;
        renderState(true);
      });
      switches.append(leftSwitch.element, rightSwitch.element);

      probe = ohmProbe(
        PROBE_TRAMOS,
        (id) => bellReading(leftClosed, rightClosed, id as BellSegment),
        (rio, tramo) => {
          const segment = tramo.id as BellSegment;
          measured[currentState].add(segment);
          let status = `<b>Ohm:</b> «${rio}»`;
          if (
            currentState === 'both-closed' &&
            measured['both-closed'].size === PROBE_TRAMOS.length
          ) {
            status +=
              '<br/><b>Edda:</b> «Medio y medio… ¿y el Tronco lleva todo? A ver, ¿dónde se está gastando?»' +
              '<br/><b>Ohm:</b> «Gasto detectado: ninguno.»';
          } else if (
            currentState === 'one-open' &&
            measured['one-open'].has('left') &&
            measured['one-open'].has('right')
          ) {
            status +=
              '<br/><b>Edda:</b> «…El río que iba por ahí no se perdió. Se mudó.»';
          }
          bench.setStatus(status);
        },
      );
      bench.root.appendChild(probe.element);

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        { label: 'Continuar', primary: true, onClick: () => bench.close(onSolved) },
      ]);
      actions['Continuar'].classList.add('hidden');

      setCircuitVisuals();
      bench.setStatus(stateStatus(currentState));
      sfxBell();
    },
  );
}
