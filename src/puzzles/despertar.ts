import { openBench, benchActions } from '../ui/bench';
import { ohmWidgetHTML, setOhmState } from './common';
import { sfxBridge, sfxClick, sfxDim, sfxWin } from '../audio';

/**
 * Puzzle 1 — "Reactivar a Ohm".
 * Concepto único: la chispa solo corre si el camino está completo, sin un solo hueco.
 * Circuito en serie real: sale de la fuente por (+), sube, cruza por arriba,
 * pasa POR Ohm, y tiene que volver al (−) por abajo. La vuelta tiene dos ramales:
 * el corto (1 hueco cubrible… y un tramo PARTIDO) y el largo (2 huecos sanos).
 * 3 puentes: hay que cubrir arriba (g1) + el ramal largo entero (g4, g5).
 * El que apuesta al atajo (g2) tiene que recuperar el puente.
 */
export function abrirDespertar(onSuccess: () => void): void {
  openBench(
    'El pedestal de Ohm',
    'Un autómata dormido. Una fuente que zumba. Y un camino lleno de huecos.',
    (bench) => {
      interface Gap {
        id: string;
        x: number;
        y: number;
        broken?: boolean;
        bridged: boolean;
      }
      const gaps: Gap[] = [
        { id: 'g1', x: 280, y: 60, bridged: false }, // ida, por arriba
        { id: 'g2', x: 390, y: 200, bridged: false }, // atajo de vuelta (señuelo)
        { id: 'g3', x: 240, y: 200, broken: true, bridged: false }, // atajo: PARTIDO
        { id: 'g4', x: 250, y: 260, bridged: false }, // vuelta larga
        { id: 'g5', x: 380, y: 260, bridged: false }, // vuelta larga
      ];
      let bridges = 3;
      let solved = false;

      const stage = document.createElement('div');
      stage.className = 'bench-stage';
      stage.style.display = 'flex';
      stage.style.alignItems = 'center';
      stage.style.gap = '10px';
      stage.innerHTML = `
        <svg viewBox="0 0 540 300" style="flex:1">
          <rect x="20" y="100" width="90" height="100" rx="6" fill="#45382a" stroke="#8a7c50" stroke-width="2"/>
          <text x="65" y="145" fill="#e8d8b8" font-size="13" text-anchor="middle">FUENTE</text>
          <text x="65" y="163" fill="#998" font-size="10" text-anchor="middle">(zumba)</text>
          <text x="122" y="114" fill="#e8c33a" font-size="15" font-weight="bold">+</text>
          <text x="122" y="178" fill="#8aa0c0" font-size="17" font-weight="bold">−</text>
          <!-- ida: de (+) por arriba hasta Ohm -->
          <path class="wire" d="M110 120 H150"/>
          <path class="wire" d="M150 120 V60"/>
          <path class="wire" d="M150 60 H280"/>
          <path class="wire" d="M320 60 H480"/>
          <path class="wire" d="M480 60 V138"/>
          <!-- Ohm, en serie en el camino -->
          <circle cx="480" cy="150" r="12" fill="#322d3a" stroke="#6b6478" stroke-width="2"/>
          <!-- de Ohm hacia abajo, al nudo de la vuelta -->
          <path class="wire" d="M480 162 V200"/>
          <!-- vuelta corta (el atajo): tiene un hueco cubrible… y un tramo partido -->
          <path class="wire dead" d="M480 200 H430"/>
          <path class="wire dead" d="M390 200 H280"/>
          <path class="wire dead" d="M240 200 H150"/>
          <!-- vuelta larga, por abajo -->
          <path class="wire" d="M480 200 V260"/>
          <path class="wire" d="M480 260 H420"/>
          <path class="wire" d="M380 260 H290"/>
          <path class="wire" d="M250 260 H150"/>
          <path class="wire" d="M150 260 V200"/>
          <!-- el regreso al (−) -->
          <path class="wire" d="M150 200 V180"/>
          <path class="wire" d="M150 180 H110"/>
          ${gaps
            .map(
              (g) => `
            <rect class="gap-slot${g.broken ? ' broken' : ''}" data-gap="${g.id}"
              x="${g.x}" y="${g.y - 9}" width="40" height="18" rx="3"/>
            ${g.broken ? `<path d="M${g.x + 12} ${g.y - 9} l8 9 l-8 9 M${g.x + 26} ${g.y - 9} l6 9 l-6 9" stroke="#7a4438" stroke-width="2" fill="none"/>` : ''}`,
            )
            .join('')}
        </svg>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;min-width:90px">
          ${ohmWidgetHTML()}
        </div>`;
      bench.root.appendChild(stage);

      const tray = document.createElement('div');
      tray.className = 'bench-tray';
      const trayLabel = document.createElement('span');
      trayLabel.className = 'tray-label';
      tray.appendChild(trayLabel);
      bench.root.appendChild(tray);

      const updateTray = () => {
        trayLabel.textContent = `Puentes de cobre: ${'▬ '.repeat(bridges) || '(ninguno)'}`;
      };
      updateTray();

      bench.setStatus(
        'El camino sale de la fuente por el lado <b>+</b>, pasa por Ohm, y tiene que volver ' +
          'al lado <b>−</b>. Está lleno de huecos. En la bandeja hay <b>tres puentes de cobre</b>. ' +
          'Tocá un hueco para cubrirlo (o descubrirlo).',
      );

      const isWin = () =>
        gaps.find((g) => g.id === 'g1')!.bridged &&
        gaps.find((g) => g.id === 'g4')!.bridged &&
        gaps.find((g) => g.id === 'g5')!.bridged;

      const win = () => {
        solved = true;
        sfxWin();
        stage.querySelectorAll('.wire:not(.dead)').forEach((w) => w.classList.add('live'));
        setTimeout(() => setOhmState(stage, 'debil'), 350);
        setTimeout(() => setOhmState(stage, 'estable'), 1100);
        bench.setStatus(
          '<b>La chispa corre por todo el anillo:</b> sale por +, cruza por arriba, atraviesa a Ohm ' +
            'y vuelve al − por abajo. El atajo partido queda mudo: por ahí no pasa nada. ' +
            'Ohm abre los ojos.',
        );
        actions['Alejarse'].classList.add('hidden');
        actions['Continuar'].classList.remove('hidden');
      };

      stage.querySelectorAll<SVGRectElement>('.gap-slot').forEach((slot) => {
        slot.addEventListener('click', () => {
          if (solved) return;
          const gap = gaps.find((g) => g.id === slot.dataset.gap)!;
          if (gap.broken) {
            sfxDim();
            bench.setStatus(
              'Este tramo está <b>partido</b>: los bordes no coinciden, ningún puente lo cubre. ' +
                'Si la vuelta corta no se puede completar… habrá que dar la vuelta larga.',
            );
            return;
          }
          if (gap.bridged) {
            gap.bridged = false;
            bridges++;
            slot.classList.remove('bridged');
            sfxClick();
            bench.setStatus('Recuperaste el puente.');
          } else if (bridges > 0) {
            gap.bridged = true;
            bridges--;
            slot.classList.add('bridged');
            sfxBridge();
            if (isWin()) {
              updateTray();
              win();
              return;
            }
            bench.setStatus(
              bridges === 0
                ? 'No quedan puentes… y la chispa sigue sin correr. Un camino a medias es lo mismo que ningún camino. Quizás haya un puente mal gastado.'
                : 'El puente encaja. Pero la chispa no corre todavía: la ida y la vuelta tienen que estar completas, sin un solo hueco.',
            );
          } else {
            bench.setStatus(
              'No quedan puentes en la bandeja. Puedo <b>sacar</b> uno de donde lo puse, tocándolo.',
            );
          }
          updateTray();
        });
      });

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        { label: 'Continuar', primary: true, onClick: () => bench.close(onSuccess) },
      ]);
      actions['Continuar'].classList.add('hidden');
    },
  );
}
