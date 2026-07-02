// Modelo puro del hall del Instituto (greybox 3D). Sin Three.js, sin DOM:
// testeable en Node. Unidades en metros; origen en el centro de la sala,
// ejes X (ancho) y Z (profundo).

export interface Aabb {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface Interactable {
  id: 'preceptor' | 'bitacora' | 'puerta_ohmdal';
  x: number;
  z: number;
  radius: number;
}

export interface SchoolLayout {
  /** Límite caminable de la sala (paredes ya descontadas). */
  bounds: Aabb;
  /** Obstáculos internos (escritorio, columnas, preceptor). */
  obstacles: Aabb[];
  interactables: Interactable[];
  spawn: { x: number; z: number };
}

export const SCHOOL_LAYOUT: SchoolLayout = {
  bounds: { minX: -7.5, maxX: 7.5, minZ: -4.5, maxZ: 4.5 },
  obstacles: [
    // Escritorio del preceptor.
    { minX: 3.2, maxX: 5.2, minZ: -1.4, maxZ: -0.4 },
    // Preceptor, de pie junto al escritorio.
    { minX: 2.3, maxX: 2.9, minZ: -1.3, maxZ: -0.7 },
    // Columnas (0.6 de lado, centradas en (-3.5, 0) y (3.5, 2.5)).
    { minX: -3.8, maxX: -3.2, minZ: -0.3, maxZ: 0.3 },
    { minX: 3.2, maxX: 3.8, minZ: 2.2, maxZ: 2.8 },
  ],
  interactables: [
    { id: 'puerta_ohmdal', x: 0, z: -3.9, radius: 1.4 },
    { id: 'bitacora', x: 4.2, z: -0.9, radius: 1.5 },
    { id: 'preceptor', x: 2.6, z: -1.0, radius: 1.5 },
  ],
  spawn: { x: 0, z: 3.2 },
};

/** Radio de colisión del jugador. */
export const PLAYER_RADIUS = 0.35;
export const PLAYER_SPEED = 3.2; // m/s

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** ¿El círculo del jugador (centrado en x,z) se solapa con este AABB? */
function collidesWithAabb(x: number, z: number, box: Aabb): boolean {
  const closestX = clamp(x, box.minX, box.maxX);
  const closestZ = clamp(z, box.minZ, box.maxZ);
  const dx = x - closestX;
  const dz = z - closestZ;
  return dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS;
}

/** ¿La posición (con el radio del jugador) es válida dentro de bounds y sin obstáculos? */
function isFree(x: number, z: number): boolean {
  const { bounds, obstacles } = SCHOOL_LAYOUT;
  if (x - PLAYER_RADIUS < bounds.minX || x + PLAYER_RADIUS > bounds.maxX) return false;
  if (z - PLAYER_RADIUS < bounds.minZ || z + PLAYER_RADIUS > bounds.maxZ) return false;
  for (const box of obstacles) {
    if (collidesWithAabb(x, z, box)) return false;
  }
  return true;
}

/**
 * Avanza al jugador. `input` es dirección cruda por eje en [-1, 0, 1];
 * se normaliza (diagonal no es más rápida). Colisión por eje (desliza
 * contra paredes y obstáculos, no se traba). dt en segundos, clamp a 0.05.
 */
export function movePlayer(
  pos: { x: number; z: number },
  input: { x: number; z: number },
  dt: number,
): { x: number; z: number } {
  const clampedDt = Math.min(dt, 0.05);
  const len = Math.hypot(input.x, input.z);
  if (len === 0) return { x: pos.x, z: pos.z };

  const dirX = input.x / len;
  const dirZ = input.z / len;
  const step = PLAYER_SPEED * clampedDt;

  let x = pos.x;
  let z = pos.z;

  // Colisión por eje: se prueba cada eje por separado para poder deslizar
  // contra paredes/obstáculos sin trabarse en las esquinas.
  const nextX = x + dirX * step;
  if (isFree(nextX, z)) x = nextX;

  const nextZ = z + dirZ * step;
  if (isFree(x, nextZ)) z = nextZ;

  return { x, z };
}

/** Interactuable dentro de su radio más cercano al jugador, o null. */
export function nearestInteractable(pos: { x: number; z: number }): Interactable | null {
  let best: Interactable | null = null;
  let bestDist = Infinity;
  for (const interactable of SCHOOL_LAYOUT.interactables) {
    const dx = pos.x - interactable.x;
    const dz = pos.z - interactable.z;
    const dist = Math.hypot(dx, dz);
    if (dist <= interactable.radius && dist < bestDist) {
      best = interactable;
      bestDist = dist;
    }
  }
  return best;
}
