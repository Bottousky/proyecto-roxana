/**
 * Puzzle del timbre del Instituto (M8).
 * Mini-banco de aplicación sin ayuda de NPCs: el jugador ya no necesita andamios.
 * Dos caminos en paralelo:
 *   - Camino A: cortado → empalmar.
 *   - Camino B: piedra equivocada → elegir la correcta (roja).
 */
import { sfxBridge, sfxClick, sfxOk, sfxWin, sfxSchoolBell } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import { piedraEl, PIEDRAS } from './common';
import {
  createTimbreState,
  setStoneB,
  splicePathA,
  isTimbreSolved,
  timbreSoundResult,
  type TimbreState,
  type TimbreStone,
} from './timbreModel';

export interface AbrirTimbreOptions {
  onSolved: () => void;
  practica?: boolean;
}

const STONES: TimbreStone[] = ['marron', 'roja', 'amarilla', 'gris'];

const SOUND_STATUS: Record<string, string> = {
  silent:  'Silencio. El camino sigue cortado.',
  angry:
    '<em>El timbre gruñe: un zumbido rabioso, nada de timbre.</em> La piedra marrón deja pasar demasiado río.',
  faint:
    '<em>Apenas un susurro. El timbre vibra, pero no suena.</em> El río es demasiado chico para el mecanismo.',
  ringing: '<em>¡El timbre suena!</em> Claro, redondo, inconfundible.',
};

export function abrirTimbre(opts: AbrirTimbreOptions): void {
  const practica = opts.practica ?? false;
  openBench(
    'El timbre del Instituto',
    'Dos caminos de cable. Uno cortado, el otro con una piedra equivocada.',
    (bench) => {
      let state: TimbreState = createTimbreState();
      let solved = false;

      /* ---------- estructura del banco ---------- */
      const stage = document.createElement('div');
      stage.className = 'bench-stage timbre-stage';
      stage.innerHTML = `
        <div class="timbre-network">
          <div class="timbre-source">EMPUJE (4)</div>
          <div class="timbre-paths">
            <!-- Camino A: cortado -->
            <div class="timbre-path" id="timbre-path-a">
              <div class="timbre-path-label">Camino A</div>
              <div class="timbre-cable cable-a broken"></div>
              <div class="timbre-path-status" id="status-a">Cortado</div>
              <button class="timbre-splice-btn" id="btn-splice">Empalmar el cable</button>
            </div>
            <!-- Camino B: piedra -->
            <div class="timbre-path" id="timbre-path-b">
              <div class="timbre-path-label">Camino B</div>
              <div class="timbre-cable cable-b"></div>
              <div class="timbre-path-status" id="status-b">Piedra activa: marrón</div>
              <div class="timbre-stones" id="timbre-stones" aria-label="Elige la piedra de freno"></div>
            </div>
          </div>
          <div class="timbre-bell" id="timbre-bell" aria-label="El timbre">
            <span class="timbre-bell-icon">🔔</span>
            <div class="timbre-bell-label">Timbre</div>
          </div>
        </div>`;

      bench.root.appendChild(stage);

      /* piedras en el camino B */
      const stonesHost = stage.querySelector<HTMLElement>('#timbre-stones')!;
      for (const stone of STONES) {
        const el = piedraEl(stone);
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        const choose = () => {
          if (solved) return;
          sfxClick();
          state = setStoneB(state, stone);
          render();
          tryRing();
        };
        el.addEventListener('click', choose);
        el.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); choose(); }
        });
        stonesHost.appendChild(el);
      }

      /* botón de empalme */
      const spliceBtn = stage.querySelector<HTMLButtonElement>('#btn-splice')!;
      spliceBtn.addEventListener('click', () => {
        if (solved || state.pathASpliced) return;
        sfxBridge();
        state = splicePathA(state);
        render();
        tryRing();
      });

      /* acciones del pie */
      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Continuar',
          primary: true,
          onClick: () => bench.close(opts.onSolved),
        },
      ]);
      actions['Continuar'].classList.add('hidden');

      function tryRing(): void {
        const sound = timbreSoundResult(state);
        bench.setStatus(SOUND_STATUS[sound] ?? '');

        if (sound === 'ringing' && !solved && !practica) {
          solved = true;
          sfxSchoolBell();
          sfxOk();
          sfxWin();
          actions['Alejarse'].classList.add('hidden');
          actions['Continuar'].classList.remove('hidden');
          render();
        } else if (sound === 'ringing' && practica) {
          sfxSchoolBell();
          render();
        }
      }

      function render(): void {
        const pathA = stage.querySelector<HTMLElement>('#timbre-path-a')!;
        const pathB = stage.querySelector<HTMLElement>('#timbre-path-b')!;
        const cableA = pathA.querySelector<HTMLElement>('.cable-a')!;
        const statusA = pathA.querySelector<HTMLElement>('#status-a')!;
        const statusB = pathB.querySelector<HTMLElement>('#status-b')!;
        const bellEl = stage.querySelector<HTMLElement>('#timbre-bell')!;
        const isSolved = isTimbreSolved(state);

        /* camino A */
        if (state.pathASpliced) {
          cableA.classList.remove('broken');
          cableA.classList.add('live');
          statusA.textContent = 'Empalmado';
          spliceBtn.disabled = true;
          spliceBtn.textContent = 'Cable empalmado';
        } else {
          cableA.classList.add('broken');
          cableA.classList.remove('live');
          statusA.textContent = 'Cortado';
          spliceBtn.disabled = solved;
        }

        /* camino B: piedras */
        statusB.textContent = `Piedra activa: ${PIEDRAS[state.stoneB]?.nombre ?? state.stoneB}`;
        stonesHost.querySelectorAll<HTMLElement>('.piedra').forEach((el) => {
          const selected = el.dataset.key === state.stoneB;
          el.classList.toggle('selected', selected);
          el.setAttribute('aria-disabled', String(solved));
        });

        /* campana */
        bellEl.classList.toggle('ringing', isSolved);
        bellEl.classList.toggle('faint', timbreSoundResult(state) === 'faint');
        bellEl.classList.toggle('angry', timbreSoundResult(state) === 'angry');
      }

      /* estado inicial */
      bench.setStatus('Dos caminos. Uno cortado, el otro con una piedra equivocada.');
      render();
    },
  );
}
