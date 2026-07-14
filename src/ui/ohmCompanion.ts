import type { Flags } from '../state.ts';
import { state } from '../state.ts';
import { L, say, type Line } from './dialog.ts';
import { el, uiOpen } from './overlay.ts';
import { touchControlsEnabled } from './inputMode.ts';

const OHM_PORTRAIT = new URL('../../assets/ohmdal/portraits/ohm.png', import.meta.url).href;

/**
 * Ohm ocupa un lugar persistente del grupo, como una criatura compañera.
 * Estas pistas siguen los hitos reales y evitan que una frase de ambientación
 * mande al jugador hacia una sala que todavía no corresponde.
 */
export function ohmGuidance(flags: Flags, room: string): Line[] {
  const visited = flags.salasVisitadas;

  if (!flags.metLumen || !flags.frenoDone) {
    return [
      L('Ohm', 'Ruta recomendada: este. Taller de Lumen.'),
      L('Ohm', 'Probabilidad de que Lumen finja no estar sorprendido: baja.'),
    ];
  }
  if (!flags.puertaDone) {
    return [
      L('Ohm', 'Siguiente interrupción detectada: Puerta de Ohm.'),
      L('Ohm', 'Ruta: plaza, arco norte. Llevar la piedra justa.'),
    ];
  }
  if (!visited.includes('manantial_ohm')) {
    return [
      L('Ohm', 'La Puerta está abierta. El origen del caudal espera detrás.'),
      L('Ohm', 'Recomendación: cruzar el arco norte y subir al Manantial.'),
    ];
  }
  if (!flags.finished) {
    return [
      L('Ohm', room === 'manantial_ohm'
        ? 'El caudal alcanza un mecanismo todavía mudo: la Campana de la plaza.'
        : 'Destino pendiente: Campana de Ohmdal, centro de la plaza.'),
      L('Ohm', 'Hipótesis: ahora responderá.'),
    ];
  }
  if (!flags.playedUnit2Intro) {
    return [
      L('Ohm', 'La nota cruzó el portal. El proyector del Instituto respondió.'),
      L('Ohm', 'Ruta recomendada: regresar al aula.'),
    ];
  }
  if (!flags.solvedBellPaths) {
    return [
      L('Ohm', 'La Campana recibe dos caminos. No asumir: medir ambos.'),
      L('Ohm', 'Destino: centro de la plaza.'),
    ];
  }
  if (!flags.enteredCastle) {
    return [
      L('Ohm', 'El Consejo abrió una ruta nueva: portón oeste de la plaza.'),
      L('Ohm', 'Destino: Castillo de Ohmdal.'),
    ];
  }
  if (!flags.solvedGalleryChain) return [L('Ohm', 'Circuito incompleto en la Galería. Seguir la cadena sin dejar huecos.')];
  if (!flags.solvedBranches) return [L('Ohm', 'Siguiente sala: Cámara de Ramas. Dos caminos no implican dos caudales iguales.')];
  if (!flags.solvedDistributor) return [L('Ohm', 'El corazón del Castillo sigue aislado. Buscar el distribuidor.')];
  if (!flags.unit2Completed) return [L('Ohm', 'La red funciona. Falta registrar lo aprendido y revisar el timbre del Instituto.')];
  if (!flags.unit3Completed) return [L('Ohm', 'Lectura actual: calor en los canales. Ruta recomendada: Forja, al oeste de la plaza.')];
  if (!flags.unit4Completed) return [L('Ohm', 'La siguiente anomalía está en las Terrazas, por el arco sur de la plaza.')];
  if (!flags.unit5Completed) return [L('Ohm', 'Queda una luz remota junto al lago. Destino: Faro de Ohmdal.')];
  return [L('Ohm', 'Red estable. Compañía activa. Si aparece otra duda, consultar de nuevo.')];
}

export function syncOhmCompanionButton(): void {
  el<HTMLButtonElement>('ohm-companion-btn').classList.toggle('hidden', !state.flags.ohmAwake);
}

export function consultOhm(): void {
  if (!state.flags.ohmAwake || uiOpen()) return;
  say(ohmGuidance(state.flags, state.room));
}

export function initOhmCompanion(): void {
  const button = el<HTMLButtonElement>('ohm-companion-btn');
  el<HTMLImageElement>('ohm-companion-portrait').src = OHM_PORTRAIT;
  // En escritorio el retrato informa que Ohm está en el grupo, pero se activa
  // con O. La pulsación del retrato queda reservada para controles táctiles.
  button.addEventListener('click', () => {
    if (touchControlsEnabled()) consultOhm();
  });
  window.addEventListener('keydown', (event) => {
    if (event.code !== 'KeyO' || event.repeat || uiOpen()) return;
    event.preventDefault();
    consultOhm();
  });
}
