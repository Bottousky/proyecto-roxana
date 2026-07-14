/**
 * Puzzle del timbre del Instituto (M8).
 * Mini-banco de aplicación sin ayuda de NPCs: el jugador ya no necesita andamios.
 * Dos caminos en paralelo:
 *   - Camino A: cortado → empalmar.
 *   - Camino B: fila de hasta dos piedras → lograr el río exacto.
 */
import { sfxBridge, sfxClick, sfxOk, sfxWin, sfxSchoolBell } from '../audio';
import { benchActions, openBench } from '../ui/bench';
import { makeInteractive, piedraEl, PIEDRAS } from './common';
import {
  createTimbreState,
  removeStoneB,
  setStoneB,
  splicePathA,
  isTimbreSolved,
  timbreResistance,
  timbrePathSoundResult,
  verifyTimbrePath,
  type TimbrePath,
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
      let lastSound: string = 'silent';
      let activeSlot: 0 | 1 = 0;

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
              <button class="timbre-test-btn" id="btn-test-a">Probar sólo A</button>
            </div>
            <!-- Camino B: fila de piedras -->
            <div class="timbre-path" id="timbre-path-b">
              <div class="timbre-path-label">Camino B</div>
              <div class="timbre-cable cable-b"></div>
              <div class="timbre-path-status" id="status-b">Freno total: 1</div>
              <div class="timbre-stone-row" id="timbre-stone-row" aria-label="Dos engastes en fila"></div>
              <div class="timbre-stones" id="timbre-stones" aria-label="Piedras disponibles para el engaste elegido"></div>
              <button class="timbre-test-btn" id="btn-test-b">Probar sólo B</button>
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
        const choose = () => {
          if (solved) return;
          sfxClick();
          state = setStoneB(state, activeSlot, stone);
          lastSound = 'silent';
          render();
        };
        el.addEventListener('click', choose);
        makeInteractive(el, PIEDRAS[stone].nombre);
        stonesHost.appendChild(el);
      }

      /* botón de empalme */
      const spliceBtn = stage.querySelector<HTMLButtonElement>('#btn-splice')!;
      spliceBtn.addEventListener('click', () => {
        if (solved || state.pathASpliced) return;
        sfxBridge();
        state = splicePathA(state);
        render();
      });
      stage.querySelector<HTMLButtonElement>('#btn-test-a')!.addEventListener('click', () => testPath('A'));
      stage.querySelector<HTMLButtonElement>('#btn-test-b')!.addEventListener('click', () => testPath('B'));

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

      function testPath(path: TimbrePath): void {
        if (solved) return;
        lastSound = timbrePathSoundResult(state, path);
        bench.setStatus(`<b>Prueba del camino ${path}.</b> ${SOUND_STATUS[lastSound] ?? ''}`);
        state = verifyTimbrePath(state, path);
        if (lastSound === 'ringing') sfxSchoolBell();
        if (isTimbreSolved(state) && !practica) {
          solved = true;
          sfxOk();
          sfxWin();
          actions['Alejarse'].classList.add('hidden');
          actions['Continuar'].classList.remove('hidden');
          render();
        }
        render();
      }

      function render(): void {
        const pathA = stage.querySelector<HTMLElement>('#timbre-path-a')!;
        const pathB = stage.querySelector<HTMLElement>('#timbre-path-b')!;
        const cableA = pathA.querySelector<HTMLElement>('.cable-a')!;
        const statusA = pathA.querySelector<HTMLElement>('#status-a')!;
        const statusB = pathB.querySelector<HTMLElement>('#status-b')!;
        const stoneRow = pathB.querySelector<HTMLElement>('#timbre-stone-row')!;
        const bellEl = stage.querySelector<HTMLElement>('#timbre-bell')!;
        /* camino A */
        if (state.pathASpliced) {
          cableA.classList.remove('broken');
          cableA.classList.add('live');
          statusA.textContent = state.verifiedA ? 'Empalmado · probado ✓' : 'Empalmado · falta probar';
          spliceBtn.disabled = true;
          spliceBtn.textContent = 'Cable empalmado';
        } else {
          cableA.classList.add('broken');
          cableA.classList.remove('live');
          statusA.textContent = 'Cortado';
          spliceBtn.disabled = solved;
        }

        /* camino B: hasta dos piedras en fila */
        const stoneNames = state.stonesB.map((stone) => PIEDRAS[stone].nombre).join(' + ');
        statusB.textContent =
          `Freno total: ${timbreResistance(state.stonesB)} · ${stoneNames}` +
          (state.verifiedB ? ' · probado ✓' : ' · falta probar');
        stoneRow.innerHTML = '';
        for (const index of [0, 1] as const) {
          const slot = document.createElement('div');
          slot.className = 'longchannel-slot timbre-engaste';
          slot.classList.toggle('empty', state.stonesB[index] === undefined);
          slot.classList.toggle('selected', activeSlot === index);

          const stone = state.stonesB[index];
          if (stone) {
            const visual = piedraEl(stone);
            visual.classList.add('in-slot');
            visual.setAttribute('aria-hidden', 'true');
            slot.appendChild(visual);
          } else {
            const empty = document.createElement('span');
            empty.textContent = '+';
            slot.appendChild(empty);
          }

          const select = document.createElement('button');
          select.type = 'button';
          select.className = 'timbre-slot-select';
          select.disabled = solved;
          select.textContent = stone
            ? `Cambiar engaste ${index + 1}: ${PIEDRAS[stone].nombre}`
            : `Elegir engaste ${index + 1}`;
          select.addEventListener('click', () => {
            activeSlot = index;
            render();
          });
          slot.appendChild(select);

          if (stone && state.stonesB.length > 1) {
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'timbre-slot-remove';
            remove.disabled = solved;
            remove.textContent = `Quitar engaste ${index + 1}`;
            remove.addEventListener('click', () => {
              state = removeStoneB(state, index);
              activeSlot = 0;
              lastSound = 'silent';
              sfxClick();
              render();
            });
            slot.appendChild(remove);
          }
          stoneRow.appendChild(slot);
        }
        stonesHost.querySelectorAll<HTMLElement>('.piedra').forEach((el) => {
          const selected = el.dataset.key === state.stonesB[activeSlot];
          el.classList.toggle('selected', selected);
          el.setAttribute('aria-disabled', String(solved));
        });

        /* campana */
        bellEl.classList.toggle('ringing', lastSound === 'ringing');
        bellEl.classList.toggle('faint', lastSound === 'faint');
        bellEl.classList.toggle('angry', lastSound === 'angry');
      }

      /* estado inicial */
      bench.setStatus('Dos caminos. Uno cortado, el otro con una piedra equivocada.');
      render();
    },
  );
}
