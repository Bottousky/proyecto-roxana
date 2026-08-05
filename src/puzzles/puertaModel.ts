// Modelo puro del puzzle 3 — «La Puerta de Ohm».
//
// Es la síntesis de los dos anteriores: acá el empuje también se elige. El jugador ajusta
// las dos cosas a la vez hasta que el caudal cae en la franja justa. Que haya **tres** pares
// distintos que dan el mismo caudal es el puzzle entero: la proporción se descubre con las
// manos antes de que la Bitácora la escriba con letras.
//
// Validación por condición, no por solución fija — docs/guia-puzzles.md.

import { PIEDRAS, caudal } from './frenoModel.ts';

export interface FuenteDef {
  readonly key: string;
  readonly nombre: string;
  readonly glifo: string;
  readonly valor: number;
}

export const FUENTES: readonly FuenteDef[] = [
  { key: 'brasa', nombre: 'Brasa', glifo: '△', valor: 4 },
  { key: 'corazon', nombre: 'Corazón', glifo: '△△', valor: 8 },
  { key: 'tormenta', nombre: 'Tormenta', glifo: '△△△', valor: 16 },
];

/** Las piedras que la Puerta acepta en el engaste. La rajada no entra acá. */
export const PIEDRAS_PUERTA: readonly string[] = ['marron', 'roja', 'amarilla', 'gris'];

/** La franja verde del ojo de la Puerta. */
export const CAUDAL_JUSTO = 2;
export const TOLERANCIA = 0.35;

export type EstadoPuerta = 'incompleto' | 'abre' | 'fusible' | 'caliente' | 'debil';

export interface LecturaPuerta {
  readonly caudal: number | null;
  readonly estado: EstadoPuerta;
  readonly abre: boolean;
}

export function fuentePorKey(key: string): FuenteDef {
  const fuente = FUENTES.find((candidate) => candidate.key === key);
  if (!fuente) throw new Error(`Fuente desconocida: ${key}`);
  return fuente;
}

/**
 * Lee el ojo de la Puerta. El orden de las ramas importa y es el que se juega hoy:
 * primero la franja justa, después la sobrecarga, después el calor, y si no, débil.
 */
export function leerPuerta(fuenteKey: string | null, piedraKey: string | null): LecturaPuerta {
  if (fuenteKey === null || piedraKey === null) {
    return { caudal: null, estado: 'incompleto', abre: false };
  }
  const def = PIEDRAS[piedraKey];
  if (!def) throw new Error(`Piedra desconocida: ${piedraKey}`);
  const valor = caudal(fuentePorKey(fuenteKey).valor, def.valor);
  if (Math.abs(valor - CAUDAL_JUSTO) < TOLERANCIA) {
    return { caudal: valor, estado: 'abre', abre: true };
  }
  const estado: EstadoPuerta = valor > 4 ? 'fusible' : valor > CAUDAL_JUSTO ? 'caliente' : 'debil';
  return { caudal: valor, estado, abre: false };
}

/** Todos los pares que abren la Puerta. Son tres, y esa pluralidad es el contenido. */
export function paresQueAbren(): readonly (readonly [string, string])[] {
  const pares: (readonly [string, string])[] = [];
  for (const fuente of FUENTES) {
    for (const piedraKey of PIEDRAS_PUERTA) {
      if (leerPuerta(fuente.key, piedraKey).abre) pares.push([fuente.key, piedraKey]);
    }
  }
  return pares;
}
