import { openBench, benchActions } from '../ui/bench';
import { ohmWidgetHTML, setOhmState, piedraEl, PIEDRAS } from './common';
import { setFlag, state } from '../state';

const EMPUJE_TALLER = 8; // fijo: la "fuente del taller" de Lumen

/**
 * Puzzle 2 — "La Piedra de Freno".
 * Concepto: la resistencia dosifica la corriente. Empieza con una piedra rajada
 * (casi no frena): si el jugador baja la palanca, sobrecarga y fusible — el error
 * es parte del plan. Piedras con banda de color = código real de resistencias.
 * Con Empuje 8: rajada(1)→8 fusible · roja(2)→4 caliente · amarilla(4)→2 ✓ · gris(8)→1 débil.
 *
 * replay: tras resolverlo, el banco queda abierto para experimentar libremente
 * (la Bitácora invita a volver; los huecos de «errores comunes» se completan acá).
 */
export function abrirFreno(onSuccess: () => void, replay = false): void {
  openBench(
    'La Lámpara Eterna del taller',
    replay
      ? 'Estable por primera vez en treinta años. El banco quedó a tu disposición. Las piedras también.'
      : '«Eterna es un decir», admite Lumen. «Eternamente a punto de explotar.»',
    (bench) => {
      let enSlot = replay ? 'amarilla' : 'rajada';
      let fusibleQuemado = false;
      let solved = false;

      const stage = document.createElement('div');
      stage.className = 'bench-stage';
      stage.style.display = 'flex';
      stage.style.alignItems = 'center';
      stage.style.gap = '10px';
      stage.innerHTML = `
        <svg viewBox="0 0 520 230" style="flex:1">
          <rect x="20" y="80" width="90" height="80" rx="6" fill="#45382a" stroke="#8a7c50" stroke-width="2"/>
          <text x="65" y="115" fill="#e8d8b8" font-size="12" text-anchor="middle">FUENTE</text>
          <text x="65" y="132" fill="#998" font-size="10" text-anchor="middle">del taller</text>
          <path class="wire c-loop" d="M110 100 H160"/>
          <rect x="162" y="78" width="86" height="44" rx="6" fill="#211e29" stroke="#6b6478" stroke-width="2" stroke-dasharray="5 4"/>
          <text x="205" y="71" fill="#776f82" font-size="10" text-anchor="middle">ENGASTE</text>
          <rect class="slot-piedra" x="170" y="84" width="70" height="32" rx="5" fill="#4a4440"/>
          <rect class="slot-banda" x="180" y="87" width="8" height="26" rx="2" fill="#8b5a2b"/>
          <path class="slot-crack" d="M200 84 l6 12 l-9 8 l7 12" stroke="#262220" stroke-width="2" fill="none"/>
          <path class="wire c-loop" d="M248 100 H330"/>
          <circle class="lampara" cx="362" cy="100" r="26" fill="#34313d" stroke="#6b6478" stroke-width="3"/>
          <text x="362" y="146" fill="#776f82" font-size="10" text-anchor="middle">Lámpara Eterna</text>
          <path class="wire c-loop" d="M388 100 H470 V190 H110 V160"/>
        </svg>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;min-width:90px">
          ${ohmWidgetHTML()}
        </div>`;
      bench.root.appendChild(stage);
      setOhmState(stage, 'estable'); // Ohm vino con vos, despierto

      const lamp = stage.querySelector<SVGCircleElement>('.lampara')!;
      const slotPiedra = stage.querySelector<SVGRectElement>('.slot-piedra')!;
      const slotBanda = stage.querySelector<SVGRectElement>('.slot-banda')!;
      const slotCrack = stage.querySelector<SVGPathElement>('.slot-crack')!;

      const renderSlot = () => {
        const def = PIEDRAS[enSlot];
        slotBanda.setAttribute('fill', def.color);
        slotCrack.style.display = def.rajada ? '' : 'none';
        slotPiedra.setAttribute('fill', def.rajada ? '#383230' : '#4a4440');
      };
      renderSlot();

      const setLamp = (mode: 'off' | 'dim' | 'ok' | 'hot') => {
        const fills = { off: '#34313d', dim: '#6e6448', ok: '#ffd34d', hot: '#e2563a' };
        lamp.setAttribute('fill', fills[mode]);
        lamp.style.filter =
          mode === 'ok'
            ? 'drop-shadow(0 0 14px rgba(255,211,77,.9))'
            : mode === 'hot'
              ? 'drop-shadow(0 0 14px rgba(226,86,58,.9))'
              : 'none';
      };
      if (replay) setLamp('ok');

      const tray = document.createElement('div');
      tray.className = 'bench-tray';
      const label = document.createElement('span');
      label.className = 'tray-label';
      label.textContent = 'Piedras de Lumen (tocá una para engastarla):';
      tray.appendChild(label);
      bench.root.appendChild(tray);

      const renderTray = () => {
        tray.querySelectorAll('.piedra').forEach((p) => p.remove());
        for (const key of ['rajada', 'roja', 'amarilla', 'gris']) {
          if (key === enSlot) continue;
          const p = piedraEl(key);
          p.addEventListener('click', () => {
            if (solved || fusibleQuemado) {
              if (fusibleQuemado)
                bench.setStatus('Primero hay que <b>cambiar el fusible ritual</b>. La caja está junto al banco.');
              return;
            }
            enSlot = key;
            renderSlot();
            renderTray();
            setLamp('off');
            setOhmState(stage, 'estable');
            bench.setStatus(`Engastada la piedra de <b>${PIEDRAS[key].nombre}</b>. La palanca espera.`);
          });
          tray.appendChild(p);
        }
      };
      renderTray();

      bench.setStatus(
        replay
          ? 'La amarilla sigue engastada y la luz, firme. ¿Qué harían las otras piedras? ' +
              'Acá nadie te juzga. Bueno… Ohm, un poco.'
          : 'La lámpara lleva una <b>piedra rajada</b>, casi sin cuerpo. ' +
              'Lumen: «Las Piedras de Freno calman el ánimo del Río. Las de marca oscura calman mucho. ' +
              'O poco. El pergamino está manchado justo ahí.»',
      );

      const evaluar = () => {
        if (solved || fusibleQuemado) return;
        const corriente = EMPUJE_TALLER / PIEDRAS[enSlot].valor;

        if (corriente >= 8) {
          fusibleQuemado = true;
          if (!state.flags.burnedSomething) setFlag('burnedSomething');
          setLamp('hot');
          setOhmState(stage, 'sobrecarga');
          setTimeout(() => {
            setLamp('off');
            setOhmState(stage, 'inerte');
          }, 900);
          bench.setStatus(
            replay
              ? '<b>¡FZZT!</b> Chispas, humo, olor a tormenta vieja. Así que ESTO pasa con la rajada. ' +
                  'Por suerte Lumen dejó la caja de fusibles consagrados junto al banco.'
              : '<b>¡FZZT!</b> Chispas, humo, y un olor a tormenta vieja. El fusible ritual se sacrificó. ' +
                  'Lumen: «¡Por los Antiguos! …Tranquilos. Tengo repuestos. Tengo MUCHOS, por algo será.»',
          );
          actions['Bajar la palanca'].classList.add('hidden');
          actions['Cambiar fusible ritual'].classList.remove('hidden');
        } else if (corriente >= 4) {
          setLamp('hot');
          setOhmState(stage, 'sobrecarga');
          setTimeout(() => setOhmState(stage, 'estable'), 1400);
          bench.setStatus(
            replay
              ? 'La lámpara arde con luz furiosa y huele a caliente. Ohm vibra, incómodo. Eso no es brillo: es fiebre.'
              : 'La lámpara arde con luz furiosa y huele a caliente. Ohm vibra, incómodo. ' +
                  'Edda: «Eso no es brillo, eso es fiebre.»',
          );
        } else if (corriente >= 2) {
          if (replay) {
            setLamp('ok');
            setOhmState(stage, 'estable');
            bench.setStatus('<b>Luz firme.</b> La piedra justa sigue siendo la justa.');
            return;
          }
          solved = true;
          setLamp('ok');
          setOhmState(stage, 'estable');
          bench.setStatus(
            '<b>Luz firme. Tibia. Estable.</b> Lumen se queda mudo un segundo entero (récord). ' +
              '«Treinta años… ¿Quién te enseñó el ritual correcto?» ' +
              'Edda: «No es ritual. Eligió la piedra justa. ¿No ves?»',
          );
          actions['Alejarse'].classList.add('hidden');
          actions['Bajar la palanca'].classList.add('hidden');
          actions['Continuar'].classList.remove('hidden');
        } else {
          setLamp('dim');
          setOhmState(stage, 'debil');
          bench.setStatus(
            replay
              ? 'La lámpara vive, pero sin ganas. Demasiado freno: la mitad de río que con la amarilla, a ojo.'
              : 'La lámpara vive, pero sin ganas. Lumen: «Mmm. Como el aprendiz que tuve el equinoccio pasado.» ' +
                  'Demasiado freno, quizás.',
          );
        }
      };

      const actions = benchActions(bench.root, [
        { label: 'Alejarse', onClick: () => bench.close() },
        {
          label: 'Cambiar fusible ritual',
          onClick: () => {
            fusibleQuemado = false;
            setOhmState(stage, 'estable');
            bench.setStatus(
              replay
                ? 'Fusible nuevo. Le diste los tres golpes solemnes, por las dudas. El banco está listo de nuevo.'
                : 'Lumen instala el fusible nuevo con tres golpes solemnes. Edda pone los ojos en blanco. ' +
                    'El banco está listo de nuevo… quizás con otra piedra.',
            );
            actions['Cambiar fusible ritual'].classList.add('hidden');
            actions['Bajar la palanca'].classList.remove('hidden');
          },
        },
        { label: 'Bajar la palanca', primary: true, onClick: evaluar },
        { label: 'Continuar', primary: true, onClick: () => bench.close(onSuccess) },
      ]);
      actions['Cambiar fusible ritual'].classList.add('hidden');
      actions['Continuar'].classList.add('hidden');
    },
  );
}
