/*
 * Vestido pixel del Arco I. El dato sigue siendo una grilla 20x11 de celdas
 * de 48 px, pero se genera de forma determinista para que cada región tenga
 * identidad sin mantener cientos de filas copiadas a mano.
 */

export interface DecorLayer {
  atlas: string;
  grid: string[];
  legend: Record<string, number>;
  above?: boolean;
}

export interface RoomDecor {
  layers: DecorLayer[];
}

const ROWS = 11;
const COLS = 20;

const GROUND_LEGEND: Record<string, number> = {
  // césped
  a: 0, b: 1, c: 6, d: 12,
  // ladrillo/laja regular
  e: 2, f: 3, g: 8, h: 14,
  // adoquín
  i: 4, j: 5, k: 10, l: 16,
};

type Surface = 'grass' | 'brick' | 'cobble';
type Route = 'none' | 'vertical' | 'horizontal' | 'cross' | 'terraces';

const CHARS: Record<Surface, string> = {
  grass: 'abcd',
  brick: 'efgh',
  cobble: 'ijkl',
};

function hash(roomId: string): number {
  let value = 2166136261;
  for (const char of roomId) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function routeSurface(route: Route, col: number, row: number): Surface | null {
  if (route === 'vertical' && col >= 8 && col <= 11) return 'cobble';
  if (route === 'horizontal' && row >= 4 && row <= 6) return 'cobble';
  if (route === 'cross' && (col >= 8 && col <= 11 || row >= 4 && row <= 6)) return 'cobble';
  if (route === 'terraces') {
    const center = 4 + Math.floor(row * 1.05);
    if (Math.abs(col - center) <= 1) return 'cobble';
  }
  return null;
}

function groundGrid(roomId: string, base: Surface, route: Route = 'none', inset = false): string[] {
  const seed = hash(roomId);
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => {
      if (inset && (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1)) return '.';
      let surface = routeSurface(route, col, row) ?? base;
      // La plaza y la calzada se funden antes del borde del chunk: no existe
      // una línea perfecta que revele dónde termina una sala de datos.
      if (roomId === 'puerta' && row >= 8) {
        const transition = row === 8 ? (col + seed) % 3 !== 0 : true;
        if (transition) surface = 'cobble';
      }
      const options = CHARS[surface];
      const noise = (seed + col * 17 + row * 31 + col * row * 7) >>> 0;
      // Variación escasa: un RPG clásico usa un tile base estable y detalles,
      // no un damero de cuatro texturas igualmente frecuentes.
      const variant = noise % 19;
      return options[variant < 15 ? 0 : 1 + (variant % (options.length - 1))];
    }).join(''),
  );
}

function room(roomId: string, base: Surface, route: Route = 'none', inset = false): RoomDecor {
  return {
    layers: [{
      atlas: 'medieval-ground',
      grid: groundGrid(roomId, base, route, inset),
      legend: GROUND_LEGEND,
    }],
  };
}

/**
 * Plaza compuesta a mano: un empedrado acotado por césped, con caminos hacia las
 * cuatro salidas (norte→Puerta, oeste→Castillo, este→Taller, sur→portal). Evita el
 * damero de ruido y hace legible que es una PLAZA, no un campo texturizado.
 * Salidas alineadas con las puertas de `plaza` en rooms.ts (32 px por tile lógico
 * de la sala; aquí la grilla es de 20×11 celdas de 48 px sobre el chunk 960×540).
 */
function plazaComposed(seed: number): string[] {
  const G = 'abcd'; // césped
  const C = 'ijkl'; // adoquín
  const pick = (set: string, col: number, row: number): string => {
    const noise = (seed + col * 17 + row * 31 + col * row * 7) >>> 0;
    const v = noise % 19;
    return set[v < 15 ? 0 : 1 + (v % (set.length - 1))];
  };
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => {
      const northPath = row === 0 && col >= 8 && col <= 11;   // → Puerta
      const southPath = row === ROWS - 1 && col >= 8 && col <= 11; // → portal
      const westPath = col === 0 && row >= 1 && row <= 3;      // → Castillo
      const eastPath = col === COLS - 1 && row === 5;          // → Taller
      const border = row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1;
      const paved = !border || northPath || southPath || westPath || eastPath;
      return pick(paved ? C : G, col, row);
    }).join(''),
  );
}

export const OHMDAL_DECORATED_ROOMS = [
  'plaza', 'taller', 'puerta', 'manantial_ohm',
  'castle_gate', 'castle_gallery', 'castle_branches', 'castle_heart',
  'forge_yard', 'forge_infirmary', 'forge_longchannel', 'forge_hall',
  'terraces_top', 'terraces_mid', 'terraces_mural', 'terraces_aqueduct',
  'lighthouse_hall', 'lighthouse_bench', 'clock_tower', 'lighthouse_lantern',
] as const;

export const DECOR: Record<string, RoomDecor> = {
  // U1: ciudad-jardín con la red como guía espacial.
  plaza: { layers: [{ atlas: 'medieval-ground', grid: plazaComposed(hash('plaza')), legend: GROUND_LEGEND }] },
  taller: room('taller', 'brick', 'none', true),
  puerta: room('puerta', 'grass', 'vertical'),
  manantial_ohm: room('manantial_ohm', 'grass', 'vertical'),

  // U2: arquitectura ceremonial y pesada.
  castle_gate: room('castle_gate', 'cobble', 'vertical'),
  castle_gallery: room('castle_gallery', 'brick', 'vertical'),
  castle_branches: room('castle_branches', 'brick', 'vertical'),
  castle_heart: room('castle_heart', 'brick', 'cross'),

  // U3: pisos industriales regulares, gastados por el trabajo.
  forge_yard: room('forge_yard', 'cobble', 'horizontal'),
  forge_infirmary: room('forge_infirmary', 'brick'),
  forge_longchannel: room('forge_longchannel', 'brick', 'vertical'),
  forge_hall: room('forge_hall', 'brick', 'cross'),

  // U4: el sendero baja en escalones entre tierra y cultivos.
  terraces_top: room('terraces_top', 'grass', 'terraces'),
  terraces_mid: room('terraces_mid', 'grass', 'terraces'),
  terraces_mural: room('terraces_mural', 'cobble', 'horizontal'),
  terraces_aqueduct: room('terraces_aqueduct', 'grass', 'terraces'),

  // U5: piedra fría y salas mecánicas sobre el lago.
  lighthouse_hall: room('lighthouse_hall', 'cobble', 'vertical'),
  lighthouse_bench: room('lighthouse_bench', 'brick'),
  clock_tower: room('clock_tower', 'cobble', 'vertical'),
  lighthouse_lantern: room('lighthouse_lantern', 'cobble', 'cross'),
};

export function hasRoomDecor(roomId: string): boolean {
  return roomId in DECOR;
}
