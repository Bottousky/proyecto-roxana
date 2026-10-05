// La cascada ascendente — flagship scene (Hito A). Side section, metres.
//
//   familiar fall      stream along the back           region: g = +4 m/s² (up)       terrace, stream, familiar fall
//   x=-22 ─ Orilla (top y=0) ────────────────── x=0 │ chasm x∈[0,4.5], y∈[-3.4,3] │ x=4.5 ─ Terraza (top y=3) ── x=23
//
// The stream leaves the Orilla's lip at STREAM_SPEED; inside the region the same field that
// lifts the explorer bends it upward, over the region's top and down onto the Terraza.
// The water arch is integrated from this field, so it is the path a body leaving the lip at
// that speed follows (ignoring contacts) — the scene shows its own answer in water.
export const STREAM_SPEED = 2.6;

export const CASCADA = {
  id: 'cascada',
  name: 'La cascada ascendente',
  bounds: { x0: -22, x1: 19.2 },
  spawn: { x: -16, y: 0 },
  zones: [
    { id: 'cascada', label: 'Región de la cascada', x0: 0, x1: 4.5, y0: -3.4, y1: 3.0, g: { x: 0, y: 4.0 }, band: 0.6, priority: 1 },
  ],
  solids: [
    { id: 'orilla', x0: -22, x1: 0, y0: -9, y1: 0, friction: 0.6 },
    { id: 'terraza', x0: 4.5, x1: 19.5, y0: -9, y1: 3, friction: 0.6 },
    { id: 'repisa', x0: 19.5, x1: 23, y0: -9, y1: -1.5 },
    // A railing marks the end of the walkable terrace (visible, not an invisible wall).
    { id: 'baranda', x0: 18.9, x1: 19.05, y0: 3, y1: 4.3, only: 'box' },
    { id: 'fondo', x0: -0.5, x1: 5, y0: -10, y1: -4.6 },
    { id: 'pared-oeste', x0: -24, x1: -22, y0: -9, y1: 14 },
    { id: 'pared-este', x0: 23, x1: 25, y0: -9, y1: 14 },
  ],
  // Release supports: the sphere hangs from a clamp; a reel keeps a slack thread on it.
  // A and B release from the same height, 2.95 m apart, on either side of the boundary:
  // only the place changes between the two experiments.
  stands: [
    { id: 'A', label: 'Soporte de la orilla', x: -2.9, baseY: 0, clampX: -1.85, clampY: 1.8, threadMax: 9 },
    { id: 'B', label: 'Soporte del borde', x: -1.0, baseY: 0, clampX: 1.1, clampY: 1.8, threadMax: 9 },
  ],
  // Loose spheres rest on a table behind the path until the explorer takes one.
  loose: [
    { id: 'L1', x: -5.9, y: 0.78 },
    { id: 'L2', x: -5.5, y: 0.78 },
    { id: 'L3', x: -5.1, y: 0.78 },
  ],
};
