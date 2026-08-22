import type { ProbeId } from './models/camino.ts';

export type XZ = { x: number; z: number };

/**
 * Greybox compacto de la Plaza. Y-up, el jugador mira −Z al nacer (hacia
 * campana y Ohm). Coordenadas en metros.
 *
 * TODO(dirección): Ohm se coloca junto al mecanismo público (campana + fuente
 * de baja tensión), no pegado al Portal. Es un placeholder de dirección,
 * no canon espacial.
 */
export const LAYOUT = {
  spawn: { x: 0, z: 7.35 } satisfies XZ,
  spawnYaw: 0,
  portal: { x: 0, z: 10.15 } satisfies XZ,
  agua: { x: -5.1, z: 1.35 } satisfies XZ,
  campana: { x: -1.35, z: -6.85 } satisfies XZ,
  ohm: { x: 2.55, z: -6.55 } satisfies XZ,
  fuente: { x: -2.75, z: -6.55 } satisfies XZ,
  indicador: { x: 0.45, z: -5.35 } satisfies XZ,
  contactoIda: { x: 2.55, z: 3.15 } satisfies XZ,
  contactoRetorno: { x: 0, z: -6.55 } satisfies XZ,
  reparacion: { x: 2.55, z: -1.85 } satisfies XZ,
  eddaEntrada: { x: 7.4, z: 2.4 } satisfies XZ,
  eddaSalida: { x: 9.2, z: 5.6 } satisfies XZ,
};

export const IDA_TRAZA: readonly XZ[] = [
  LAYOUT.fuente,
  { x: -2.75, z: -2 },
  { x: -2.75, z: 6.45 },
  { x: 2.55, z: 6.45 },
  LAYOUT.contactoIda,
  LAYOUT.reparacion,
  LAYOUT.ohm,
];

export const RETORNO_OESTE: readonly XZ[] = [LAYOUT.fuente, { x: -0.55, z: -6.55 }];
export const RETORNO_ESTE: readonly XZ[] = [{ x: 0.55, z: -6.55 }, LAYOUT.ohm];

export const PROBE_POS: Record<ProbeId, XZ> = {
  fuente: { x: -2.75, z: -5.55 },
  ida_sur: { x: 0, z: 6.45 },
  ohm: { x: 2.55, z: -5.55 },
  retorno_ohm: { x: 0.7, z: -6.55 },
  retorno_fuente: { x: -0.7, z: -6.55 },
};
