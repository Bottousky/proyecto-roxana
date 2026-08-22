/**
 * Modelo puro del primer Camino de la Plaza: ida, carga (Ohm) y retorno.
 * El renderer sólo presenta este estado; no es la fuente de verdad pedagógica.
 *
 * Intuición: una respuesta sostenida necesita trayectoria completa.
 * Cercanía visual no equivale a conexión.
 */
export type ContactoId = 'ida' | 'retorno';

export type ProbeId = 'fuente' | 'ida_sur' | 'ohm' | 'retorno_ohm' | 'retorno_fuente';

export type IndicadorCamino = 'residual' | 'estable';

export type LecturaOhm = 'continuidad' | 'insuficiente';

export type EfectoEnergizar = 'sostenido' | 'sin_retorno';

export interface CaminoState {
  idaCerrada: boolean;
  retornoCerrado: boolean;
}

/** Orden del Camino como anillo: el hueco de retorno vive entre retorno_ohm y retorno_fuente. */
export const PROBES: readonly ProbeId[] = [
  'fuente',
  'ida_sur',
  'ohm',
  'retorno_ohm',
  'retorno_fuente',
];

/**
 * Estado de apertura del slice: el Camino alcanza a Ohm (ida cerrada)
 * y el retorno queda abierto.
 */
export function crearCamino(): CaminoState {
  return { idaCerrada: true, retornoCerrado: false };
}

export function trayectoriaCompleta(state: CaminoState): boolean {
  return state.idaCerrada && state.retornoCerrado;
}

export function ohmDespierto(state: CaminoState): boolean {
  return trayectoriaCompleta(state);
}

export function indicadorDe(state: CaminoState): IndicadorCamino {
  return trayectoriaCompleta(state) ? 'estable' : 'residual';
}

export function conContacto(
  state: CaminoState,
  contacto: ContactoId,
  cerrado: boolean,
): CaminoState {
  if (contacto === 'ida') return { ...state, idaCerrada: cerrado };
  return { ...state, retornoCerrado: cerrado };
}

export function alternarContacto(state: CaminoState, contacto: ContactoId): CaminoState {
  if (contacto === 'ida') return conContacto(state, 'ida', !state.idaCerrada);
  return conContacto(state, 'retorno', !state.retornoCerrado);
}

/**
 * Este subsistema es de baja tensión ficticia: la protección cerámica
 * ya está dimensionada. No hay combinación insegura que el slice permita.
 */
export function proteccionPermite(_state: CaminoState, _contacto: ContactoId): boolean {
  return true;
}

/**
 * Intentar alimentar el indicador sin trayectoria completa deja el estado
 * anterior. No hay cartel de error: el mundo no sostiene la respuesta.
 */
export function intentarEnergizar(state: CaminoState): {
  state: CaminoState;
  efecto: EfectoEnergizar;
} {
  if (trayectoriaCompleta(state)) return { state, efecto: 'sostenido' };
  return { state, efecto: 'sin_retorno' };
}

function indiceDe(id: ProbeId): number {
  const i = PROBES.indexOf(id);
  if (i < 0) throw new Error(`sonda desconocida: ${id}`);
  return i;
}

function pasosAdelante(from: number, to: number): number {
  return (to - from + PROBES.length) % PROBES.length;
}

type Borde = 'ida' | 'retorno' | 'solido';

function bordeEntre(a: ProbeId, b: ProbeId): Borde {
  if ((a === 'fuente' && b === 'ida_sur') || (a === 'ida_sur' && b === 'fuente')) return 'ida';
  if (
    (a === 'retorno_ohm' && b === 'retorno_fuente') ||
    (a === 'retorno_fuente' && b === 'retorno_ohm')
  ) {
    return 'retorno';
  }
  return 'solido';
}

function arcoCerrado(state: CaminoState, from: number, to: number): boolean {
  let i = from;
  while (i !== to) {
    const next = (i + 1) % PROBES.length;
    const borde = bordeEntre(PROBES[i]!, PROBES[next]!);
    if (borde === 'ida' && !state.idaCerrada) return false;
    if (borde === 'retorno' && !state.retornoCerrado) return false;
    i = next;
  }
  return true;
}

/**
 * Ohm informa el Camino más corto entre dos puntos. No señala cuál
 * contacto cerrar ni propone una solución.
 */
export function leerEntre(state: CaminoState, a: ProbeId, b: ProbeId): LecturaOhm {
  if (a === b) return 'insuficiente';
  const ia = indiceDe(a);
  const ib = indiceDe(b);
  const adelante = pasosAdelante(ia, ib);
  const atras = pasosAdelante(ib, ia);
  const cerrado =
    adelante <= atras ? arcoCerrado(state, ia, ib) : arcoCerrado(state, ib, ia);
  return cerrado ? 'continuidad' : 'insuficiente';
}
