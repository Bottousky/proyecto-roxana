// Dónde se para cada cosa de la Unidad 1 en el mapa continuo, y de dónde sale su texto.
//
// El contenido **no se copia**: cada anclaje apunta a una cosa que ya existe en
// `src/jugar/rooms.ts`, y de ahí salen su rótulo, su prompt, cuándo es visible y qué pasa al
// interactuar. Los diálogos de Edda, de Lumen y de las lámparas siguen teniendo una sola
// fuente de verdad, y sigue siendo la que ya se juega.
//
// ## De dónde salen las coordenadas
//
// La Plaza de `/jugar` es una sala pintada de 960×540 px a razón de unos 40 px por metro.
// La vista cenital y la vista HD-2D comparten el eje horizontal, así que la conversión es
// directa salvo por un giro de eje:
//
//   z(metros) = (x_px − 480) / 40        → derecha de la pantalla en las dos vistas
//   x(metros) = x_pedestal − (y_px − 342) / 40
//
// El segundo cambia de signo porque en cenital +y baja hacia el jugador —el sur— y en HD-2D
// el sur es −x: la cámara mira por +x. El pedestal de Ohm es el origen de la conversión
// porque es el centro dramático de la sala.

import { ROOMS, type ThingDef } from '../../jugar/rooms.ts';
import type { NpcId } from '../integration/spriteActors.ts';

/** Los tres bancos de la Unidad 1. En el mundo, no como modal a pantalla completa. */
export type BenchId = 'ohm' | 'lumen' | 'gate';

/** Quién dibuja el anclaje. `null` es un punto de interés sin cuerpo propio. */
export type AnchorActor = NpcId | 'ohm' | null;

export interface U1Anchor {
  readonly id: string;
  readonly position: { readonly x: number; readonly z: number };
  /** La cosa de `/jugar` que aporta rótulo, prompt, visibilidad y consecuencia. */
  readonly source: { readonly room: string; readonly thing: string };
  readonly actor?: AnchorActor;
  /** Hacia dónde mira en reposo, en grados de `headingDegrees`. */
  readonly facing?: number;
  /** Radio de interacción en metros. La proximidad elige; la tecla de siempre confirma. */
  readonly reach?: number;
  /**
   * Si el anclaje abre un banco, el mundo lo intercepta **antes** del `onInteract` de
   * `/jugar`, que abriría el modal. El texto sigue viniendo de la misma cosa.
   */
  readonly bench?: BenchId;
}

export const DEFAULT_REACH_METERS = 1.6;

export const U1_ANCHORS: readonly U1Anchor[] = [
  // El Portal queda donde el jugador aparece: la escena empieza con él apagándose detrás.
  {
    id: 'portal-aula',
    position: { x: -19, z: 0 },
    source: { room: 'plaza', thing: 'portal-aula' },
    actor: null,
    reach: 2.2,
  },
  // El pedestal es el origen de la conversión: (480, 342) en la planta cenital.
  {
    id: 'pedestal',
    position: { x: -13.5, z: 0 },
    source: { room: 'plaza', thing: 'pedestal' },
    actor: 'ohm',
    facing: 270,
    bench: 'ohm',
  },
  {
    id: 'campana',
    position: { x: -10.6, z: 0 },
    source: { room: 'plaza', thing: 'campana' },
    actor: null,
    reach: 2.6,
  },
  {
    id: 'edda',
    position: { x: -13.2, z: 3.6 },
    source: { room: 'plaza', thing: 'edda' },
    actor: 'edda',
    facing: 250,
  },
  {
    id: 'edda-campana',
    position: { x: -13.2, z: 3.6 },
    source: { room: 'plaza', thing: 'edda-campana' },
    actor: 'edda',
    facing: 250,
  },
  {
    id: 'lumen-plaza',
    position: { x: -12.5, z: 5.2 },
    source: { room: 'plaza', thing: 'lumen-plaza' },
    actor: 'lumen',
    facing: 250,
  },
  {
    id: 'lampara1',
    position: { x: -13.85, z: -4.75 },
    source: { room: 'plaza', thing: 'lampara1' },
    actor: null,
  },
  {
    id: 'lampara2',
    position: { x: -13.55, z: 6.2 },
    source: { room: 'plaza', thing: 'lampara2' },
    actor: null,
  },
];

export function anchorById(id: string): U1Anchor {
  const anchor = U1_ANCHORS.find((candidate) => candidate.id === id);
  if (!anchor) throw new Error(`Anclaje desconocido: ${id}`);
  return anchor;
}

/** La cosa de `/jugar` detrás de un anclaje. Falla ruidosamente: un anclaje huérfano es un bug. */
export function thingOf(anchor: U1Anchor): ThingDef {
  const room = ROOMS[anchor.source.room];
  if (!room) throw new Error(`El anclaje ${anchor.id} apunta a la sala inexistente ${anchor.source.room}`);
  const thing = room.things.find((candidate) => candidate.id === anchor.source.thing);
  if (!thing) {
    throw new Error(
      `El anclaje ${anchor.id} apunta a ${anchor.source.thing}, que no existe en ${anchor.source.room}`,
    );
  }
  return thing;
}

/** Un anclaje está presente si la cosa que lo respalda lo está. Los flags mandan igual que en `/jugar`. */
export function isPresent(anchor: U1Anchor): boolean {
  const thing = thingOf(anchor);
  return thing.visible === undefined || thing.visible();
}

export function reachOf(anchor: U1Anchor): number {
  return anchor.reach ?? DEFAULT_REACH_METERS;
}

/**
 * El anclaje presente más cercano dentro de su radio, o `null`.
 * La proximidad elige: nada de puntería ni de arrastre fino.
 */
export function anchorInReach(x: number, z: number): U1Anchor | null {
  let best: U1Anchor | null = null;
  let bestDistance = Infinity;
  for (const anchor of U1_ANCHORS) {
    if (!isPresent(anchor)) continue;
    const dx = anchor.position.x - x;
    const dz = anchor.position.z - z;
    const distance = Math.hypot(dx, dz);
    if (distance > reachOf(anchor) || distance >= bestDistance) continue;
    best = anchor;
    bestDistance = distance;
  }
  return best;
}
