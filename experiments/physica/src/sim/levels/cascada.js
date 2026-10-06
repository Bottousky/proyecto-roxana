// La cascada ascendente — flagship scene (Hito A). Side section, metres.
//
//   familiar fall   stream → drain           region: g = +4 m/s² (up)            Terraza (top 4.4), stream, familiar fall
//   x=-22 ─ Orilla (top y=0) ──────── x=0 │ chasm x∈[0,4.5], y∈[-3.4,3] │ x=4.5 ─────────────────────── x=19.5
//
// The rule the scene teaches: in the region a body gains a·(depth) of speed² per metre
// and spends it at g above the top, so it rises above the top by (a/g)·(3 − y₀). Starting
// from the Orilla's lip the explorer peaks 0.95 m short of the Terraza: the crossing needs
// a deeper start. The water shows the rule without drawing the explorer's route: it rises
// from the bottom of the chasm (the deepest start) and is the only thing that crests over
// the Terraza. Support B's clamp slides along a rail to any depth; a bell hangs at the
// Terraza's height. A chain from the lip lets the explorer go down and choose where to let go.
export const STREAM_SPEED = 2.6;
export const TERRACE_Y = 4.4;
export const BELL_LINE = 4.5;

export const CASCADA = {
  id: 'cascada',
  name: 'La cascada ascendente',
  bounds: { x0: -22, x1: 19.2 },
  spawn: { x: -16, y: 0 },
  zones: [
    // The right edge sits 0.3 m inside the Terraza's rock, so the full field reaches its face.
    { id: 'cascada', label: 'Región de la cascada', x0: 0, x1: 4.8, y0: -3.4, y1: 3.0, g: { x: 0, y: 4.0 }, band: 0.6, priority: 1 },
  ],
  solids: [
    { id: 'orilla', x0: -22, x1: 0, y0: -9, y1: 0, friction: 0.6 },
    { id: 'terraza', x0: 4.5, x1: 19.5, y0: -9, y1: TERRACE_Y, friction: 0.6 },
    { id: 'repisa', x0: 19.5, x1: 23, y0: -9, y1: -1.5 },
    // A railing marks the end of the walkable terrace (visible, not an invisible wall).
    { id: 'baranda', x0: 18.9, x1: 19.05, y0: TERRACE_Y, y1: TERRACE_Y + 1.3, only: 'box' },
    { id: 'fondo', x0: -0.5, x1: 5, y0: -10, y1: -4.6 },
    { id: 'pared-oeste', x0: -24, x1: -22, y0: -9, y1: 14 },
    { id: 'pared-este', x0: 23, x1: 25, y0: -9, y1: 14 },
  ],
  // Release supports: the sphere hangs from a clamp; a reel keeps a slack thread on it.
  // A and B start at the same height, 2.95 m apart, on either side of the boundary: only
  // the place changes. B's clamp slides along a rail, in 0.5 m steps, down into the chasm.
  stands: [
    { id: 'A', label: 'Soporte de la orilla', x: -2.9, baseY: 0, clampX: -1.85, clampY: 2.0, threadMax: 10 },
    { id: 'B', label: 'Soporte del borde', x: -1.0, baseY: 0, clampX: 1.1, clampY: 2.0, threadMax: 10,
      rail: { min: -2.5, max: 2.5, step: 0.5 } },
  ],
  goalSolid: 'terraza',
  bellLine: BELL_LINE,
  // One reference for everything: the centre of a body (the sphere's centre, the explorer's
  // buckle). The bell rings when a centre reaches BELL_LINE; an explorer whose buckle reaches
  // it has its feet within the edge-grab reach of the Terraza, so the same line predicts both.
  bell: { x: 1.1, y: BELL_LINE + 0.27, r: 0.1 },
  // Where the hidden stream wells up in the chasm: just inside the region's lower band.
  spring: { x: 2.75, y: -3.1, vx: 0.75 },
  // Taut between a bracket on the lip and the chasm floor; a collar stops the descent.
  chain: { x: 0.92, side: 0.24, lipX: 0, lipY: 0, stopY: -2.5, floorY: -4.6 },
  // Loose spheres rest on a table behind the path until the explorer takes one.
  loose: [
    { id: 'L1', x: -5.9, y: 0.78 },
    { id: 'L2', x: -5.5, y: 0.78 },
    { id: 'L3', x: -5.1, y: 0.78 },
  ],
};
