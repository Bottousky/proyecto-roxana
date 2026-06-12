import { openBench, benchActions } from '../ui/bench';
import { ohmWidgetHTML, setOhmState, piedraEl, PIEDRAS, gaugeSVG, setGauge } from './common';
import { setFlag, state } from '../state';
import { sfxClick, sfxFzzt, sfxHot, sfxDim, sfxOk, sfxWin, sfxGate } from '../audio';

interface Fuente {
  key: string;
  nombre: string;
  glifo: string;
  valor: number;
}

const FUENTES: Fuente[] = [
  { key: 'brasa', nombre: 'Brasa', glifo: '△', valor: 4 },
  { key: 'corazon', nombre: 'Corazón', glifo: '△△', valor: 8 },
  { key: 'tormenta', nombre: 'Tormenta', glifo: '△△△', valor: 16 },
];

/**
 * Puzzle 3 — "La Puerta de Ohm".
 * Síntesis: elegir fuente (Empuje) y piedra (Freno) para que el caudal quede
 * en la zona justa del medidor. Tres soluciones válidas — la proporcionalidad
 * de I = V/R descubierta con las manos:
 *   Brasa(4)/roja(2) = Corazón(8)/amarilla(4) = Tormenta(16)/gris(8) = 2.
 *
 * replay: con la Puerta ya abierta, el mecanismo queda para experimentar
 * (la Bitácora invita a volver a probar pares equivalentes).
 */
export function abrirPuerta(onSuccess: () => void, replay = false): void {
  openBench(
    'La Puerta de Ohm',
    replay
      ? 'Abierta, deja ver un pasillo de luz tibia. El mecanismo sigue respondiendo: Lumen lo llama «práctica». Edda lo llama «jugar».'
      : 'Nadie la abre desde la época de los Maestros. Tiene un ojo de aguja y mal carácter.',
    (bench) => {
      let fuente: Fuente | null = null;
      let piedra: string | null = null;
      let fusibleQuemado = false;
      let solved = false;
      let intentos = 0;

      const stage = document.createElement('div');
      stage.className = 'bench-stage';
      stage.style.display = 'flex';
      stage.style.alignItems = 'center';
      stage.style.gap = '14px';
      stage.style.flexWrap = 'wrap';
      stage.innerHTML = `
        <svg viewBox="0 0 240 190" style="width:220px;flex-shrink:0">
          <rect x="20" y="10" width="200" height="170" rx="8" fill="#26222e" stroke="#6b6478" stroke-width="3"/>
          <rect class="door-l" x="30" y="20" width="88" height="150" fill="#3a3340" stroke="#544c5e" stroke-width="2" style="transition: transform 1.4s ease-in-out"/>
          <rect class="door-r" x="122" y="20" width="88" height="150" fill="#3a3340" stroke="#544c5e" stroke-width="2" style="transition: transform 1.4s ease-in-out"/>
          <circle cx="120" cy="95" r="14" fill="none" stroke="#8a7c50" stroke-width="3"/>
          <text x="120" y="100" fill="#b08d2a" font-size="13" text-anchor="middle">Ω</text>
        </svg>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          ${gaugeSVG(2)}
          <div style="font-size:11px;color:#776f82">el ojo de la Puerta</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;min-width:90px">
          ${ohmWidgetHTML()}
        </div>`;
      bench.root.appendChild(stage);
      setOhmState(stage, 'estable');

      if (replay) {
        // la Puerta ya está abierta: las hojas arrancan corridas, sin animación
        for (const [sel, tx] of [['.door-l', '-70px'], ['.door-r', '70px']] as const) {
          const panel = stage.querySelector<SVGRectElement>(sel)!;
          panel.style.transition = 'none';
          panel.style.transform = `translateX(${tx})`;
        }
      }

      /* selección de fuente */
      const rowF = document.createElement('div');
      rowF.className = 'bench-tray';
      rowF.innerHTML = '<span class="tray-label">Fuente de Empuje:</span>';
      for (const f of FUENTES) {
        const btn = document.createElement('button');
        btn.className = 'fuente-opt';
        btn.innerHTML = `${f.glifo}<br/>${f.nombre}`;
        btn.addEventListener('click', () => {
          if (solved) return;
          sfxClick();
          fuente = f;
          rowF.querySelectorAll('.fuente-opt').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          ready();
        });
        rowF.appendChild(btn);
      }
      bench.root.appendChild(rowF);

      /* selección de piedra */
      const rowP = document.createElement('div');
      rowP.className = 'bench-tray';
      rowP.innerHTML = '<span class="tray-label">Piedra de Freno:</span>';
      for (const key of ['marron', 'roja', 'amarilla', 'gris']) {
        const p = piedraEl(key);
        p.addEventListener('click', () => {
          if (solved) return;
          sfxClick();
          piedra = key;
          rowP.querySelectorAll('.piedra').forEach((b) => b.classList.remove('selected'));
          p.classList.add('selected');
          ready();
        });
        rowP.appendChild(p);
      }
      bench.root.appendChild(rowP);

      const ready = () => {
        if (fusibleQuemado) return;
        if (fuente && piedra)
          bench.setStatus(
            `${fuente.nombre} en la fuente, piedra de ${PIEDRAS[piedra].nombre} en el engaste. La palanca espera.`,
          );
      };

      bench.setStatus(
        replay
          ? 'La franja verde espera. ¿Cuántos pares distintos de fuente y piedra la encuentran? La Puerta no se ofende. Ya no.'
          : 'La Puerta pide un caudal <b>justo</b>: la aguja en la franja verde. ' +
              'Lumen: «Ni hambrienta ni ahogada, decían los Maestros.» Elige una fuente y una piedra.',
      );

      const weakLines = replay
        ? [
            'La aguja apenas se despega de «poco». Falta empuje, o sobra piedra.',
            'Un crujido decepcionado. El caudal llega cansado.',
          ]
        : [
            'La aguja apenas se despega. La Puerta suelta un crujido decepcionado. Edda: «Se movió un pelito. Un pelito no abre puertas.»',
            'Lumen: «El Río llega cansado. Más empuje… o menos piedra. Una de dos.»',
            'Un quejido mínimo. Edda: «Creo que la Puerta se está burlando de nosotros.»',
          ];
      const hotLines = replay
        ? [
            'La aguja se pasa de largo y el mecanismo se traba, rencoroso. Demasiado río de golpe.',
            'Salta una chispa. Le sobra furia, no le falta.',
          ]
        : [
            'La aguja se pasa de largo. La Puerta se traba con un golpe seco y escupe chispas. Lumen: «¡La ahogaste! Demasiado río de golpe.»',
            'Edda: «¿Viste cómo saltó? No le falta fuerza. Le sobra furia.»',
          ];
      let wi = 0;
      let hi = 0;

      const evaluar = () => {
        if (solved || fusibleQuemado) return;
        if (!fuente || !piedra) {
          bench.setStatus('Falta elegir ' + (!fuente ? 'una <b>fuente</b>' : 'una <b>piedra</b>') + '.');
          return;
        }
        intentos++;
        const I = fuente.valor / PIEDRAS[piedra].valor;
        setGauge(stage, I);

        window.setTimeout(() => {
          if (Math.abs(I - 2) < 0.35) {
            if (replay) {
              sfxOk();
              setOhmState(stage, 'estable');
              bench.setStatus(
                '<b>El caudal justo, otra vez.</b> La aguja clavada en la franja verde; la Puerta ronronea. ' +
                  'Otro par que da el mismo río.',
              );
              return;
            }
            solved = true;
            sfxGate();
            sfxWin();
            setOhmState(stage, 'estable');
            stage.querySelector<SVGRectElement>('.door-l')!.style.transform = 'translateX(-70px)';
            stage.querySelector<SVGRectElement>('.door-r')!.style.transform = 'translateX(70px)';
            bench.setStatus(
              `<b>La aguja queda clavada en la franja verde.</b> Un mecanismo antiquísimo suspira, ` +
                `y la Puerta se abre por primera vez en una era. (Intentos: ${intentos})`,
            );
            actions['Alejarse'].classList.add('hidden');
            actions['Bajar la palanca'].classList.add('hidden');
            actions['Cruzar la Puerta'].classList.remove('hidden');
          } else if (I > 4) {
            fusibleQuemado = true;
            if (!state.flags.burnedSomething) setFlag('burnedSomething');
            sfxFzzt();
            setOhmState(stage, 'sobrecarga');
            window.setTimeout(() => {
              setOhmState(stage, 'inerte');
              setGauge(stage, 0);
            }, 900);
            bench.setStatus(
              replay
                ? '<b>¡FZZT!</b> La aguja se clava al fondo y el fusible ritual se inmola. Quedan repuestos en la caja que dejó Lumen.'
                : '<b>¡FZZT!</b> La aguja se clava al fondo, algo truena dentro de la Puerta y el fusible ritual se inmola. ' +
                    'Lumen: «…Tengo más. No me mires así, Edda.»',
            );
            actions['Bajar la palanca'].classList.add('hidden');
            actions['Cambiar fusible ritual'].classList.remove('hidden');
          } else if (I > 2) {
            sfxHot();
            setOhmState(stage, 'sobrecarga');
            window.setTimeout(() => setOhmState(stage, 'estable'), 1300);
            bench.setStatus(hotLines[hi++ % hotLines.length]);
          } else {
            sfxDim();
            setOhmState(stage, 'debil');
            window.setTimeout(() => setOhmState(stage, 'estable'), 1300);
            bench.setStatus(weakLines[wi++ % weakLines.length]);
          }
        }, 750);
      };

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Cambiar fusible ritual',
          onClick: () => {
            fusibleQuemado = false;
            setOhmState(stage, 'estable');
            bench.setStatus('Fusible nuevo, tres golpes solemnes. La Puerta espera, rencorosa.');
            actions['Cambiar fusible ritual'].classList.add('hidden');
            actions['Bajar la palanca'].classList.remove('hidden');
            ready();
          },
        },
        { label: 'Bajar la palanca', primary: true, onClick: evaluar },
        { label: 'Cruzar la Puerta', primary: true, onClick: () => bench.close(onSuccess) },
      ]);
      actions['Cambiar fusible ritual'].classList.add('hidden');
      actions['Cruzar la Puerta'].classList.add('hidden');
    },
  );
}
