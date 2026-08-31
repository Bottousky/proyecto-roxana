import { load, setFlag, state } from '../state.ts';

export interface ProjectorLine {
  who: string;
  text: string;
}

export interface UnitProjectorCue {
  unit: 2 | 3 | 4 | 5;
  flag: 'playedUnit2Intro' | 'playedUnit3Intro' | 'playedUnit4Intro' | 'playedUnit5Intro';
  ariaLabel: string;
  toast: string;
  lines: readonly ProjectorLine[];
}

/** Copy U2: ya ratificado en el aula gráfica. */
export const UNIT2_PROJECTOR_LINES: readonly ProjectorLine[] = [
  { who: '', text: 'La nota de la Campana todavía vibra en los vidrios del aula. El proyector responde solo: clac.' },
  { who: 'PROYECTOR', text: 'MUNDOS APLICADOS · UNIDAD DOS: EL RÍO SE REPARTE.' },
  { who: 'PROYECTOR', text: 'El Castillo de Ohmdal es el corazón de la red. De sus salas parten todos los ríos del reino.' },
  { who: 'PROYECTOR', text: 'Recuerde, estudiante: un reino no se enciende con un solo camino.' },
  { who: '', text: 'La imagen se corta. Sobre la lente queda un lacre: CLAUSURADO POR ORDEN DEL CONSEJO DE OHMDAL.' },
];

/** Copy U3: ya escrito en rooms.ts · reproducirIntroUnidad3. */
export const UNIT3_PROJECTOR_LINES: readonly ProjectorLine[] = [
  { who: '', text: 'Al entrar al aula, la Bitácora vibra sobre tu costado. El proyector reconoce una nueva entrada y se enciende solo: clac.' },
  { who: 'PROYECTOR', text: 'MUNDOS APLICADOS. UNIDAD TRES.' },
  { who: 'PROYECTOR', text: 'La Forja de Ohmdal: donde el río trabaja.' },
  { who: 'PROYECTOR', text: 'Recuerde, estudiante: nada que trabaja, trabaja gratis.' },
  { who: '', text: 'La imagen tiembla y se corta. Sobre la lente, un instante, la silueta de un fusible fundido.' },
];

/** Copy U4: ya escrito en rooms.ts · reproducirIntroUnidad4. */
export const UNIT4_PROJECTOR_LINES: readonly ProjectorLine[] = [
  { who: '', text: 'Al entrar al aula, la Bitácora vibra sobre tu costado. El proyector reconoce una nueva entrada y se enciende solo: clac.' },
  { who: 'PROYECTOR', text: 'MUNDOS APLICADOS. UNIDAD CUATRO.' },
  { who: 'PROYECTOR', text: 'Las Terrazas de Ohmdal: el agua que baja pensando.' },
  { who: 'PROYECTOR', text: 'Recuerde, estudiante: lo que sube, baja. Y lo que baja, se reparte.' },
  { who: '', text: 'La imagen se aclara un instante en un acueducto de cobre escalonado, y se apaga.' },
];

/**
 * U5: no se inventa guion. Se reutilizan líneas ya dichas por el Farero
 * en la sala de la máquina, más el encabezado de unidad ya presente.
 */
export const UNIT5_PROJECTOR_LINES: readonly ProjectorLine[] = [
  { who: 'PROYECTOR', text: 'MUNDOS APLICADOS. UNIDAD CINCO.' },
  { who: 'FARERO', text: '¿Vienen por la luz? La luz es lo de menos. Este faro no alumbraba: avisaba.' },
  { who: 'FARERO', text: 'Y para avisar hay que latir. La-aaa-tido. La-aaa-tido. Yo me acuerdo. El ritmo lo tengo acá.' },
];

const CUES: readonly UnitProjectorCue[] = [
  {
    unit: 2,
    flag: 'playedUnit2Intro',
    ariaLabel: 'Proyección de la Unidad 2',
    toast: 'Unidad 2 disponible. Vuelve a la Campana por el portal.',
    lines: UNIT2_PROJECTOR_LINES,
  },
  {
    unit: 3,
    flag: 'playedUnit3Intro',
    ariaLabel: 'Proyección de la Unidad 3',
    toast: 'Unidad 3 disponible. La Forja espera al otro lado del portal.',
    lines: UNIT3_PROJECTOR_LINES,
  },
  {
    unit: 4,
    flag: 'playedUnit4Intro',
    ariaLabel: 'Proyección de la Unidad 4',
    toast: 'Unidad 4 disponible. Las Terrazas esperan al otro lado del portal.',
    lines: UNIT4_PROJECTOR_LINES,
  },
  {
    unit: 5,
    flag: 'playedUnit5Intro',
    ariaLabel: 'Proyección de la Unidad 5',
    toast: 'Unidad 5 disponible. El Faro espera al otro lado del portal.',
    lines: UNIT5_PROJECTOR_LINES,
  },
];

export function pendingUnitProjector(): UnitProjectorCue | null {
  load();
  const flags = state.flags;
  if (flags.finished && !flags.playedUnit2Intro) return CUES[0];
  if (flags.unit2Completed && !flags.playedUnit3Intro) return CUES[1];
  if (flags.unit3Completed && !flags.playedUnit4Intro) return CUES[2];
  if (flags.unit4Completed && !flags.playedUnit5Intro) return CUES[3];
  return null;
}

let activeCleanup: ((complete: boolean) => void) | null = null;

export function projectorSequenceBusy(): boolean {
  return activeCleanup !== null;
}

export function abortProjectorSequence(): void {
  activeCleanup?.(false);
}

/**
 * Reproduce la intro de unidad pendiente sobre `host`.
 * No congela la exploración de Ohmdal: vive en el Instituto.
 */
export function playUnitProjectorSequence(
  host: HTMLElement,
  cue: UnitProjectorCue,
  onComplete?: () => void,
): boolean {
  if (!host || activeCleanup) return false;

  let index = 0;
  const layer = document.createElement('section');
  layer.className = 'rx-projector-sequence';
  layer.setAttribute('role', 'dialog');
  layer.setAttribute('aria-modal', 'true');
  layer.setAttribute('aria-label', cue.ariaLabel);
  layer.tabIndex = -1;
  layer.innerHTML = `
    <div class="rx-projector-beam" aria-hidden="true"></div>
    <div class="rx-projector-dialog">
      <span class="rx-projector-speaker"></span>
      <p class="rx-projector-copy"></p>
      <span class="rx-projector-next">E / Enter</span>
    </div>`;

  const speaker = layer.querySelector<HTMLElement>('.rx-projector-speaker')!;
  const copy = layer.querySelector<HTMLElement>('.rx-projector-copy')!;
  const render = () => {
    const line = cue.lines[index];
    speaker.textContent = line.who || 'AULA DE ELECTRÓNICA';
    copy.textContent = line.text;
  };

  const cleanup = (complete: boolean) => {
    window.removeEventListener('keydown', onKeyDown, true);
    activeCleanup = null;
    layer.remove();
    if (complete) {
      setFlag(cue.flag);
      onComplete?.();
    }
  };

  const advance = () => {
    index++;
    if (index >= cue.lines.length) cleanup(true);
    else render();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (!['KeyE', 'Enter', 'Space'].includes(event.code)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    advance();
  };

  activeCleanup = cleanup;
  layer.addEventListener('click', () => {
    if (navigator.maxTouchPoints > 0 || window.matchMedia?.('(pointer: coarse)').matches) advance();
  });
  window.addEventListener('keydown', onKeyDown, true);
  host.appendChild(layer);
  render();
  layer.focus();
  return true;
}

export function playPendingUnitProjector(
  host: HTMLElement,
  onComplete?: (cue: UnitProjectorCue) => void,
): boolean {
  const cue = pendingUnitProjector();
  if (!cue) return false;
  return playUnitProjectorSequence(host, cue, () => onComplete?.(cue));
}
