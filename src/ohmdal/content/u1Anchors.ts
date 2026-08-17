// Dónde se para cada cosa de la Unidad 1 en el mapa continuo, y de dónde sale su texto.
//
// El contenido **no se copia**: cada anclaje apunta a una cosa que ya existe en
// `src/jugar/rooms.ts`, y de ahí salen su rótulo, su prompt, cuándo es visible y qué pasa al
// interactuar. Los diálogos de Edda, de Lumen y de las lámparas siguen teniendo una sola
// fuente de verdad, y sigue siendo la que ya se juega.
//
// ## De dónde salen las coordenadas (red con hub central)
//
// El origen del mundo es el **centro de la Plaza** (0, 0, 0). Las otras zonas se
// reparten alrededor: Taller y Puerta+Manantial al este (+x), Castillo al norte (-z),
// Forja al oeste (-x), Terrazas al sur (+z), Faro al sureste. Las coordenadas de
// cada anclaje se eligen para caer dentro de los `bounds` de su zona
// (`LEVEL_ZONES` en `levelData.ts`) y respetar la topología del slice canónico:
// Portal al oeste de la Plaza, pedestal al centro, campana al este, y los
// personajes y props de cada zona siguiendo la lógica de la sala de `/jugar`.

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
  /** A qué altura se para el actor, si no es el suelo. Ohm duerme sobre el pedestal. */
  readonly elevation?: number;
  /**
   * Si el anclaje abre un banco, el mundo lo intercepta **antes** del `onInteract` de
   * `/jugar`, que abriría el modal. El texto sigue viniendo de la misma cosa.
   */
  readonly bench?: BenchId;
}

export const DEFAULT_REACH_METERS = 1.6;

export const U1_ANCHORS: readonly U1Anchor[] = [
  /* ---------- E1 · Plaza de Ohm (hub, origen) ---------- */
  // El Portal queda donde el jugador aparece: la escena empieza con él apagándose detrás,
  // en el borde oeste de la Plaza (x = -8). El spawn queda dentro de la Plaza, no afuera.
  {
    id: 'portal-aula',
    position: { x: -8, z: 0 },
    source: { room: 'plaza', thing: 'portal-aula' },
    actor: null,
    reach: 2.2,
  },
  // El pedestal es el centro de la Plaza (origen del mundo).
  {
    id: 'pedestal',
    position: { x: 0, z: 0 },
    source: { room: 'plaza', thing: 'pedestal' },
    actor: 'ohm',
    facing: 270,
    bench: 'ohm',
    // Coronación del pedestal: el collider frena al jugador a 2,02 m del centro, así que
    // el alcance tiene que superarlo.
    elevation: 1.06,
    reach: 2.5,
  },
  // La campana al este del pedestal (landmark dominante del segundo half de la Plaza).
  {
    id: 'campana',
    position: { x: 3, z: 0 },
    source: { room: 'plaza', thing: 'campana' },
    actor: null,
    // El monumento ocupa 4,8 m: al jugador no lo dejan acercarse a menos de 2,8 m del centro.
    reach: 3.4,
  },
  // Edda en la Plaza — al sur, frente al pedestal.
  {
    id: 'edda',
    position: { x: 0, z: 3.6 },
    source: { room: 'plaza', thing: 'edda' },
    actor: 'edda',
    facing: 250,
  },
  {
    id: 'edda-campana',
    position: { x: 0, z: 3.6 },
    source: { room: 'plaza', thing: 'edda-campana' },
    actor: 'edda',
    facing: 250,
  },
  // Lumen en la Plaza — al sur, al lado de Edda.
  {
    id: 'lumen-plaza',
    position: { x: 1, z: 5.2 },
    source: { room: 'plaza', thing: 'lumen-plaza' },
    actor: 'lumen',
    facing: 250,
  },
  // Lámparas: simétricas al norte y sur, flanqueando el pedestal.
  {
    id: 'lampara1',
    position: { x: -1.5, z: -4.75 },
    source: { room: 'plaza', thing: 'lampara1' },
    actor: null,
  },
  {
    id: 'lampara2',
    position: { x: -1, z: 6.2 },
    source: { room: 'plaza', thing: 'lampara2' },
    actor: null,
  },

  /* ---------- E3 · Taller de Lumen (este de la Plaza) ---------- */
  // El Taller vive en x ∈ [9, 22.5]; su centro es x ≈ 16. La distribución interna
  // conserva la **relación** del slice: el banco al este, Lumen a su lado, los estantes
  // contra el fondo y el generador en el rincón opuesto a la puerta.
  {
    id: 'banco',
    position: { x: 16, z: -2.5 },
    source: { room: 'taller', thing: 'banco' },
    actor: null,
    bench: 'lumen',
    reach: 2.4,
  },
  {
    id: 'lumen',
    position: { x: 14, z: -1.1 },
    source: { room: 'taller', thing: 'lumen' },
    actor: 'lumen',
    facing: 90,
  },
  {
    id: 'edda-taller',
    position: { x: 13, z: 0.9 },
    source: { room: 'taller', thing: 'edda-taller' },
    actor: 'edda',
    facing: 90,
  },
  {
    id: 'estantes',
    position: { x: 10.5, z: -4.1 },
    source: { room: 'taller', thing: 'estantes' },
    actor: null,
    reach: 1.9,
  },
  {
    id: 'estantes-derecha',
    position: { x: 20, z: -4.1 },
    source: { room: 'taller', thing: 'estantes-derecha' },
    actor: null,
    reach: 1.9,
  },
  {
    id: 'generador-taller',
    position: { x: 21, z: 2.4 },
    source: { room: 'taller', thing: 'generador-taller' },
    actor: null,
    reach: 2.2,
  },

  /* ---------- E4 · Puerta de Ohm (este, x = 22.5..30) ---------- */
  {
    id: 'lapuerta',
    position: { x: 25, z: -0.5 },
    source: { room: 'puerta', thing: 'lapuerta' },
    actor: null,
    bench: 'gate',
    // Coincide con `R5_DOOR_APPROACH`, que es donde GF-07 pide el frame de la medición.
    reach: 2.8,
  },
  {
    id: 'edda-puerta',
    position: { x: 23.5, z: -1.7 },
    source: { room: 'puerta', thing: 'edda-puerta' },
    actor: 'edda',
    facing: 90,
  },
  {
    id: 'lumen-puerta',
    position: { x: 23.5, z: 1.5 },
    source: { room: 'puerta', thing: 'lumen-puerta' },
    actor: 'lumen',
    facing: 90,
  },

  /* ---------- E5 · Manantial (este, x = 30..38.5) ---------- */
  {
    id: 'cauce-maestro',
    position: { x: 33, z: 1.5 },
    source: { room: 'manantial_ohm', thing: 'cauce-maestro' },
    actor: null,
    reach: 2.6,
  },
  {
    id: 'hito-proporciones',
    position: { x: 33, z: -2.6 },
    source: { room: 'manantial_ohm', thing: 'hito-proporciones' },
    actor: null,
    reach: 2,
  },
  {
    id: 'mirador-manantial',
    position: { x: 35, z: -1.4 },
    source: { room: 'manantial_ohm', thing: 'mirador-manantial' },
    actor: null,
    reach: 2.4,
  },
  {
    // Ohm acompaña al jugador desde que despierta, así que acá no lleva cuerpo propio: sería
    // un segundo autómata a veinte metros del primero. Es el punto donde se lo consulta.
    id: 'ohm-manantial',
    position: { x: 32, z: 0.4 },
    source: { room: 'manantial_ohm', thing: 'ohm-manantial' },
    actor: null,
  },
  {
    id: 'edda-manantial',
    position: { x: 32, z: 2.1 },
    source: { room: 'manantial_ohm', thing: 'edda-manantial' },
    actor: 'edda',
    facing: 90,
  },
  {
    id: 'lumen-manantial',
    position: { x: 33.5, z: 3.1 },
    source: { room: 'manantial_ohm', thing: 'lumen-manantial' },
    actor: 'lumen',
    facing: 90,
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

/**
 * Mapeo declarativo de anclajes del VS a las evidencias que el beat VS01 pide. El mundo
 * marca la observación cuando el jugador interactúa con uno de estos anclajes —sin agregar
 * texto, sin cartel de "evidencia registrada", sólo la marca para que la Bitácora pueda
 * aparecer cuando las tres estén.
 */
export const VS_EVIDENCE_BY_ANCHOR: Readonly<Record<string, import('../../puzzles/plazaEvidenceModel.ts').PlazaEvidenceId>> = {
  'campana': 'campana-sin-respuesta',
  'portal-aula': 'trazas-de-cobre',
  // El agua detenida vive en otro cuarto (manantial_ohm); el anclaje `mirador-manantial`
  // es el punto de observación desde la Plaza cuando la cámara acompaña al jugador.
  'mirador-manantial': 'agua-detenida',
};

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
