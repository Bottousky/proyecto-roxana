// Modelo puro del puzzle 1 — «Reactivar a Ohm».
//
// El concepto es uno solo: la chispa corre si hay un camino completo que pase POR Ohm,
// sin un solo hueco. Lo que cambia entre el banco modal y el banco en el mundo es cómo se
// manipula —cubrir huecos con puentes, o tender un cable entre dos bocas—, no la regla.
// Por eso el modelo no habla de puentes ni de cables: habla de tramos que conducen o no.
//
// Los tres estados salen de docs/arco1/diseno-bancos-ohm-lumen.md §2:
//   abierto      — nada tocado todavía;
//   tocando      — hay contacto pero no camino (la lección: tocar no es unir);
//   cerrado      — el camino se cierra y Ohm despierta.

/** Un tramo del anillo. Los huecos no conducen hasta que se los cubre. */
export interface SegmentDef {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  /** hueco: no conduce hasta que se lo cubre */
  readonly gap?: boolean;
  /** tramo partido: los bordes no coinciden, ningún puente lo cubre */
  readonly broken?: boolean;
}

export interface CircuitDef {
  /** salida de la fuente */
  readonly plus: string;
  /** retorno a la fuente */
  readonly minus: string;
  /** el autómata está en serie: el camino tiene que pasar por acá */
  readonly through: string;
  readonly segments: readonly SegmentDef[];
  /** cuántos tramos se pueden cubrir a la vez */
  readonly supply: number;
}

export type CircuitState = 'abierto' | 'tocando' | 'cerrado';

export interface CircuitReading {
  /** hay camino de la fuente a la fuente y pasa por el autómata */
  readonly complete: boolean;
  readonly state: CircuitState;
  /** cuántos tramos quedan sin usar en la bandeja */
  readonly supplyLeft: number;
}

const COVERABLE = (segment: SegmentDef): boolean => segment.gap === true && segment.broken !== true;

/** Un tramo conduce si es macizo, o si es un hueco cubierto. Un tramo partido nunca conduce. */
function conducts(segment: SegmentDef, covered: ReadonlySet<string>): boolean {
  if (segment.broken === true) return false;
  if (segment.gap !== true) return true;
  return covered.has(segment.id);
}

/** ¿Hay camino entre dos nodos, saltando el nodo excluido si se pasa uno? */
function connects(
  def: CircuitDef,
  covered: ReadonlySet<string>,
  from: string,
  to: string,
  without?: string,
): boolean {
  if (from === without || to === without) return false;
  const seen = new Set<string>([from]);
  const pending = [from];
  while (pending.length > 0) {
    const node = pending.pop()!;
    if (node === to) return true;
    for (const segment of def.segments) {
      if (!conducts(segment, covered)) continue;
      const next = segment.from === node ? segment.to : segment.to === node ? segment.from : null;
      if (next === null || next === without || seen.has(next)) continue;
      seen.add(next);
      pending.push(next);
    }
  }
  return false;
}

/**
 * Lee el circuito. «Cerrado» exige que el camino pase por el autómata: si sacar el
 * autómata del grafo no corta la corriente, entonces la corriente no lo atravesaba.
 */
export function readCircuit(def: CircuitDef, covered: ReadonlySet<string>): CircuitReading {
  const closes = connects(def, covered, def.plus, def.minus);
  const inSeries = closes && !connects(def, covered, def.plus, def.minus, def.through);
  const complete = closes && inSeries;
  return {
    complete,
    state: complete ? 'cerrado' : covered.size > 0 ? 'tocando' : 'abierto',
    supplyLeft: def.supply - covered.size,
  };
}

/** Por qué un tramo no admite ser cubierto, o `null` si sí admite. */
export function coverRejection(
  def: CircuitDef,
  covered: ReadonlySet<string>,
  segmentId: string,
): 'partido' | 'sin-material' | null {
  const segment = def.segments.find((candidate) => candidate.id === segmentId);
  if (!segment) throw new Error(`Tramo desconocido: ${segmentId}`);
  if (segment.broken === true) return 'partido';
  if (covered.has(segmentId)) return null;
  return def.supply - covered.size > 0 ? null : 'sin-material';
}

/** Cubre o descubre un tramo. Devuelve el conjunto nuevo; no muta el que recibe. */
export function toggleCover(
  def: CircuitDef,
  covered: ReadonlySet<string>,
  segmentId: string,
): ReadonlySet<string> {
  if (coverRejection(def, covered, segmentId) !== null) return covered;
  const next = new Set(covered);
  if (!next.delete(segmentId)) next.add(segmentId);
  return next;
}

/** Los conjuntos mínimos de tramos que cierran el circuito, en orden de tamaño. */
export function solutions(def: CircuitDef): readonly (readonly string[])[] {
  const coverable = def.segments.filter(COVERABLE).map((segment) => segment.id);
  const found: string[][] = [];
  for (let mask = 0; mask < 1 << coverable.length; mask++) {
    const combo = coverable.filter((_, index) => (mask & (1 << index)) !== 0);
    if (combo.length > def.supply) continue;
    if (!readCircuit(def, new Set(combo)).complete) continue;
    if (found.some((previous) => previous.every((id) => combo.includes(id)))) continue;
    found.push(combo);
  }
  return found.sort((a, b) => a.length - b.length);
}

/**
 * El anillo del pedestal, tal como se juega hoy.
 *
 * Sale de la fuente por (+), sube y cruza por arriba hasta Ohm, y tiene que volver al (−).
 * La vuelta ofrece dos ramales: el corto es un señuelo —tiene un hueco cubrible y un tramo
 * PARTIDO detrás— y el largo tiene dos huecos sanos. Con tres tramos en la bandeja, la única
 * solución es arriba + los dos de abajo. Quien apuesta al atajo recupera su material.
 */
export const PEDESTAL_RING: CircuitDef = {
  plus: 'FUENTE_MAS',
  minus: 'FUENTE_MENOS',
  through: 'OHM',
  supply: 3,
  segments: [
    { id: 's_salida', from: 'FUENTE_MAS', to: 'IDA_ALTA' },
    { id: 'g1', from: 'IDA_ALTA', to: 'CRUCE_ALTO', gap: true },
    { id: 's_cruce_ohm', from: 'CRUCE_ALTO', to: 'OHM' },
    { id: 's_ohm_nudo', from: 'OHM', to: 'NUDO' },
    // vuelta corta: el atajo
    { id: 'g2', from: 'NUDO', to: 'ATAJO_MEDIO', gap: true },
    { id: 'g3', from: 'ATAJO_MEDIO', to: 'OESTE_ALTO', gap: true, broken: true },
    // vuelta larga, por abajo
    { id: 's_nudo_abajo', from: 'NUDO', to: 'ABAJO_ESTE' },
    { id: 'g5', from: 'ABAJO_ESTE', to: 'ABAJO_MEDIO', gap: true },
    { id: 'g4', from: 'ABAJO_MEDIO', to: 'ABAJO_OESTE', gap: true },
    { id: 's_abajo_oeste', from: 'ABAJO_OESTE', to: 'OESTE_ALTO' },
    { id: 's_retorno', from: 'OESTE_ALTO', to: 'FUENTE_MENOS' },
  ],
};
