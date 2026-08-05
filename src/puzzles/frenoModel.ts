// Modelo puro del puzzle 2 — «La Piedra de Freno».
//
// La regla es una sola: el freno dosifica el caudal. Con el empuje fijo del taller, cada
// piedra da un caudal distinto y cada caudal deja la lámpara en un estado distinto. Eso no
// cambia entre el banco modal y el banco en el mundo: lo que cambia es que en el mundo el
// jugador saca una piedra del zócalo y pone otra, en vez de tocar una bandeja.
//
// Las piedras llevan el código de color real de resistores porque es currículum, no adorno.
// Pero el color nunca es el único canal: cada piedra se distingue además por el **cuerpo**
// —cuánto ocupa— y por su **cifra**, que ya se dibuja como número. Es la regla 1 de
// docs/arco1/IDENTITY.md: el estado eléctrico nunca se comunica sólo por color.

import { resistorColorByDigit, type ResistorDigit } from '../shared/resistorColorCode.ts';

export interface PiedraDef {
  nombre: string;
  /** Banda y cifra del código real de resistores. */
  color: string;
  valor: number;
  codigo: ResistorDigit;
  rajada?: boolean;
  /** Canal redundante al color: cuánto cuerpo tiene la piedra. Más freno, más cuerpo. */
  cuerpo: 'chico' | 'medio' | 'grande';
}

function cuerpoPara(valor: number): PiedraDef['cuerpo'] {
  if (valor >= 8) return 'grande';
  if (valor >= 4) return 'medio';
  return 'chico';
}

function piedra(nombre: string, codigo: ResistorDigit, extra?: Partial<PiedraDef>): PiedraDef {
  return {
    nombre,
    color: resistorColorByDigit(codigo).color,
    valor: codigo,
    codigo,
    cuerpo: cuerpoPara(codigo),
    ...extra,
  };
}

export const PIEDRAS: Record<string, PiedraDef> = {
  marron: piedra('marca marrón', 1),
  roja: piedra('marca roja', 2),
  amarilla: piedra('marca amarilla', 4),
  gris: piedra('marca gris', 8),
  rajada: piedra('piedra rajada de marca marrón', 1, { rajada: true }),
};

/** La fuente del taller de Lumen no se elige: es fija. */
export const EMPUJE_TALLER = 8;

export type EstadoLampara = 'fusible' | 'caliente' | 'justo' | 'debil';

export interface LecturaLampara {
  readonly caudal: number;
  readonly estado: EstadoLampara;
  /** el estado que resuelve el puzzle */
  readonly resuelve: boolean;
}

export function caudal(empuje: number, freno: number): number {
  return empuje / freno;
}

/**
 * Lee la Lámpara Eterna con la piedra que esté engastada.
 *
 * Con empuje 8: rajada(1) → 8 quema el fusible · roja(2) → 4 arde caliente ·
 * amarilla(4) → 2 es la luz justa · gris(8) → 1 apenas alumbra.
 */
export function leerLamparaEterna(piedraKey: string): LecturaLampara {
  const def = PIEDRAS[piedraKey];
  if (!def) throw new Error(`Piedra desconocida: ${piedraKey}`);
  const valor = caudal(EMPUJE_TALLER, def.valor);
  const estado: EstadoLampara =
    valor >= 8 ? 'fusible' : valor >= 4 ? 'caliente' : valor >= 2 ? 'justo' : 'debil';
  return { caudal: valor, estado, resuelve: estado === 'justo' };
}

/** Las piedras que dejan la lámpara en luz justa. Siempre tiene que haber al menos una. */
export function piedrasQueResuelven(): readonly string[] {
  return Object.keys(PIEDRAS).filter((key) => leerLamparaEterna(key).resuelve);
}
