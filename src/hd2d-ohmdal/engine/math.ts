// Small math helpers. All world units are meters.

export interface Vec2 {
  x: number;
  y: number;
}

export const v2 = (x: number, y: number): Vec2 => ({ x, y });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

export const easeInOut = (t: number) => t * t * (3 - 2 * t);

export const distance = (a: Vec2, b: Vec2) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};
