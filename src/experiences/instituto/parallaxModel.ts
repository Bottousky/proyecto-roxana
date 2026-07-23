export interface ParallaxHotspot {
  id:
    | 'entrada'
    | 'banco'
    | 'estatua'
    | 'cartelera'
    | 'escalera'
    | 'preceptor'
    | 'vitrina'
    | 'matematica'
    | 'fisica'
    | 'programacion'
    | 'taller';
  x: number;
  radius: number;
  label: string;
}

export const HALL_WIDTH = 2400;
export const PLAYER_MIN_X = 110;
export const PLAYER_MAX_X = HALL_WIDTH - 110;
export const PLAYER_SPEED = 310;

export const HALL_HOTSPOTS: readonly ParallaxHotspot[] = [
  { id: 'entrada', x: 150, radius: 105, label: 'Puerta principal' },
  { id: 'banco', x: 360, radius: 115, label: 'Banco antiguo' },
  { id: 'estatua', x: 670, radius: 120, label: 'Estatua de Roxana' },
  { id: 'cartelera', x: 890, radius: 120, label: 'Cartelera de ingresantes' },
  { id: 'escalera', x: 1200, radius: 150, label: 'Escalera a Dirección' },
  { id: 'preceptor', x: 1560, radius: 135, label: 'Preceptoría' },
  { id: 'vitrina', x: 1800, radius: 120, label: 'Vitrina antigua' },
  { id: 'matematica', x: 1970, radius: 100, label: 'Matemática' },
  { id: 'fisica', x: 2090, radius: 100, label: 'Física' },
  { id: 'programacion', x: 2200, radius: 100, label: 'Programación' },
  { id: 'taller', x: 2290, radius: 120, label: 'Taller de Electrónica' },
];

export function moveHallPlayer(x: number, axis: number, dt: number): number {
  const direction = Math.max(-1, Math.min(1, axis));
  return Math.max(PLAYER_MIN_X, Math.min(PLAYER_MAX_X, x + direction * PLAYER_SPEED * dt));
}

export function walkTowardHallTarget(x: number, targetX: number, dt: number): number {
  const distance = targetX - x;
  const step = PLAYER_SPEED * dt;
  if (Math.abs(distance) <= step) return Math.max(PLAYER_MIN_X, Math.min(PLAYER_MAX_X, targetX));
  return moveHallPlayer(x, Math.sign(distance), dt);
}

export function hallCameraX(playerX: number, viewportWidth: number): number {
  const max = Math.max(0, HALL_WIDTH - viewportWidth);
  return Math.max(0, Math.min(max, playerX - viewportWidth * 0.5));
}

export function nearestHallHotspot(x: number): ParallaxHotspot | null {
  let nearest: ParallaxHotspot | null = null;
  let best = Infinity;
  for (const hotspot of HALL_HOTSPOTS) {
    const distance = Math.abs(hotspot.x - x);
    if (distance <= hotspot.radius && distance < best) {
      nearest = hotspot;
      best = distance;
    }
  }
  return nearest;
}

export function parallaxX(cameraX: number, factor: number): number {
  return -cameraX * factor;
}
