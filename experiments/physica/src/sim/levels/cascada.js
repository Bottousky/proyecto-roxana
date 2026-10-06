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
// The walled arch in the Terraza's back wall (1.6 m wide, 2.4 m high) and the neighbourhood behind.
export const ARCH = { x0: 6.8, x1: 8.4, h: 2.4 };
export const BARRIO = { x0: 2.0, x1: 14.0, z0: -22.0 };
// Depth of the Terraza's stream (the channel the cascade lands in), as drawn.
export const STREAM_Z = -1.7;
// The fountain in the middle of the square (on the passage's axis).
export const FUENTE = { x: (ARCH.x0 + ARCH.x1) / 2, z: -15.2 };
export const BELL_LINE = 4.5;
// El Pozo (transfer): a shaft in the Terraza with its own region, from y = 1.0 up to the
// Terraza's level. Same rule, two limits: let go too high and the Mirador is out of reach;
// let go below the region's floor and there is nothing to lift you — you drop into the water.
export const WELL = { x0: 11.0, x1: 12.6, floorY: -1.0, regionY0: 1.0 };
export const MIRADOR_Y = 5.15;
// A centre (buckle, sphere) that reaches MIRADOR_LINE puts the feet within edge-grab reach of
// the Mirador. Releases from ~1.2 m (just above the region's floor band) to ~2.3 m reach it.
export const MIRADOR_LINE = MIRADOR_Y + 0.1;

export const CASCADA = {
  id: 'cascada',
  name: 'La cascada ascendente',
  bounds: { x0: -22, x1: 19.2 },
  spawn: { x: -16, y: 0 },
  zones: [
    // The right edge sits 0.3 m inside the Terraza's rock, so the full field reaches its face.
    { id: 'cascada', label: 'Región de la cascada', x0: 0, x1: 4.8, y0: -3.4, y1: 3.0, g: { x: 0, y: 4.0 }, band: 0.6, priority: 1 },
    // Its sides sit 0.3 m inside the rock, like the cascade's right edge.
    { id: 'pozo', label: 'Región del pozo', x0: WELL.x0 - 0.3, x1: WELL.x1 + 0.3, y0: WELL.regionY0, y1: TERRACE_Y, g: { x: 0, y: 4.0 }, band: 0.6, priority: 1 },
  ],
  // Depth (Hito B, B2). The 2.5D path lives at z = 0; its regions and solids span the diorama's
  // depth (to just behind the back wall's face, at −3.6). Behind the Terraza's back wall, through
  // the walled arch, a passage leads to a neighbourhood of the city: familiar conditions there.
  diorama: { z0: -4.0, z1: 2.0 },
  citySolid: 'mirador',
  // mouthZ: where the passage opens onto the neighbourhood (the far side of the wall).
  // lever: the crank on the 2.5D path (z ≈ 0) whose shaft runs into depth to the arch's pivot;
  // swing: seconds the leaf takes to open (the door is walkable only once open).
  doors: [{ id: 'arco', label: 'Arco tapiado', verb: 'Abrir el arco', x0: ARCH.x0, x1: ARCH.x1, y: TERRACE_Y, z: -3.6, mouthZ: -9.0, lever: { x: ARCH.x0 - 0.45 }, swing: 1.6 }],
  // In depth, what the explorer cannot walk through: the fountain's basin and the lamp posts.
  depthBlockers: [
    // the arch's crank post and the shaft it drives into depth (1 m high: not walked under)
    // (its front edge just behind the explorer's half-depth at z = 0, so it never blocks the path)
    { id: 'palanca', x0: ARCH.x0 - 0.57, x1: ARCH.x0 - 0.33, z0: -3.6, z1: -0.27, top: TERRACE_Y + 1.05 },
    { id: 'fuente', circle: { x: FUENTE.x, z: FUENTE.z, r: 1.62 }, top: TERRACE_Y + 0.5 },
    ...[[BARRIO.x0 + 0.6, -10], [BARRIO.x1 - 0.6, -10], [BARRIO.x0 + 0.6, BARRIO.z0 + 0.6], [BARRIO.x1 - 0.6, BARRIO.z0 + 0.6]]
      .map(([x, z], i) => ({ id: `farol-${i}`, circle: { x, z, r: 0.1 }, top: TERRACE_Y + 2.6 })),
  ],
  depthAreas: [
    { id: 'umbral', x0: ARCH.x0 - 0.6, x1: ARCH.x1 + 0.6, z0: -3.9, z1: 0.3 },
    { id: 'pasaje', x0: ARCH.x0, x1: ARCH.x1, z0: -9.3, z1: -3.3 },
    { id: 'barrio', x0: BARRIO.x0, x1: BARRIO.x1, z0: BARRIO.z0, z1: -8.7 },
  ],
  solids: [
    { id: 'orilla', x0: -22, x1: 0, y0: -9, y1: 0, friction: 0.6 },
    { id: 'terraza', x0: 4.5, x1: WELL.x0, y0: -9, y1: TERRACE_Y, friction: 0.6 },
    // Standing in the water is not firm footing: R never returns the explorer there.
    { id: 'pozo-fondo', x0: WELL.x0, x1: WELL.x1, y0: -9, y1: WELL.floorY, noFooting: true },
    { id: 'mirador', x0: WELL.x1, x1: 16.5, y0: -9, y1: MIRADOR_Y, friction: 0.6 },
    // Steps wider than the explorer (0.52 m), each no higher than the walking step (0.36 m).
    { id: 'escalon-1', x0: 16.5, x1: 17.1, y0: -9, y1: MIRADOR_Y - 0.3 },
    { id: 'escalon-2', x0: 17.1, x1: 17.7, y0: -9, y1: MIRADOR_Y - 0.6 },
    { id: 'terraza-b', x0: 17.7, x1: 19.5, y0: -9, y1: TERRACE_Y, friction: 0.6 },
    { id: 'repisa', x0: 19.5, x1: 23, y0: -9, y1: -1.5 },
    // A railing marks the end of the walkable terrace (visible, not an invisible wall).
    { id: 'baranda', x0: 18.9, x1: 19.05, y0: TERRACE_Y, y1: TERRACE_Y + 1.3, only: 'box' },
    { id: 'fondo', x0: -0.5, x1: 5, y0: -10, y1: -4.6 },
    { id: 'pared-oeste', x0: -24, x1: -22, y0: -9, y1: 14 },
    { id: 'pared-este', x0: 23, x1: 25, y0: -9, y1: 14 },
    // A stone footbridge over the Terraza's stream, in front of the arch (behind the 2.5D path).
    { id: 'puente', x0: ARCH.x0 - 0.15, x1: ARCH.x1 + 0.15, y0: TERRACE_Y - 0.3, y1: TERRACE_Y + 0.16, z0: STREAM_Z - 1.0, z1: STREAM_Z + 1.0, friction: 0.6 },
    // The passage's floor and the neighbourhood's pavement, at the Terraza's level.
    { id: 'pasaje', x0: ARCH.x0, x1: ARCH.x1, y0: -9, y1: TERRACE_Y, z0: -9.3, z1: -3.3, friction: 0.6 },
    { id: 'barrio', x0: BARRIO.x0, x1: BARRIO.x1, y0: -9, y1: TERRACE_Y, z0: BARRIO.z0, z1: -8.7, friction: 0.6 },
    // The square's planters: low enough to step onto (0.35 m, under the walking step).
    ...[[-3.2, -2.6], [3.2, -2.6], [-3.2, 2.8], [3.2, 2.8]].map(([dx, dz], i) => ({ id: `cantero-${i}`, x0: FUENTE.x + dx - 0.95, x1: FUENTE.x + dx + 0.95,
      y0: TERRACE_Y - 0.2, y1: TERRACE_Y + 0.35, z0: FUENTE.z + dz - 0.6, z1: FUENTE.z + dz + 0.6, friction: 0.6 })),
  ],
  // Release supports: the sphere hangs from a clamp; a reel keeps a slack thread on it.
  // A and B start at the same height, 2.95 m apart, on either side of the boundary: only
  // the place changes. B's clamp slides along a rail, in 0.5 m steps, down into the chasm.
  stands: [
    { id: 'A', label: 'Soporte de la orilla', x: -2.9, baseY: 0, clampX: -1.85, clampY: 2.0, threadMax: 10 },
    { id: 'B', label: 'Soporte del borde', x: -1.0, baseY: 0, clampX: 1.1, clampY: 2.0, threadMax: 10,
      rail: { min: -2.5, max: 2.5, step: 0.5 },
      // B's prompt goes below and to the right of its sphere, in the chasm's open air: above it,
      // it covered the plumb mast at the region's top edge and B's own arm and clamp.
      // Low enough to clear the rail's "2", the readout ▲▼ changes.
      prompt: { dx: 1.0, dy: -1.25 } },
    // The Pozo's support: same instrument, new place. Its rail reaches below the region's floor.
    { id: 'P', label: 'Soporte del pozo', x: WELL.x0 - 0.9, baseY: TERRACE_Y, clampX: WELL.x1 - 0.3, clampY: 3.0, threadMax: 9,
      rail: { min: -0.5, max: 4.0, step: 0.5 } },
  ],
  goalSolid: 'terraza',
  miradorLine: MIRADOR_LINE,
  bellLine: BELL_LINE,
  // One reference for everything: the centre of a body (the sphere's centre, the explorer's
  // buckle). The bell rings when a centre reaches BELL_LINE; an explorer whose buckle reaches
  // it has its feet within the edge-grab reach of the Terraza, so the same line predicts both.
  bell: { x: 1.1, y: BELL_LINE + 0.27, r: 0.1 },
  bells: [
    { id: 'cascada', x: 1.1, y: BELL_LINE + 0.27, r: 0.1, line: BELL_LINE },
    { id: 'pozo', x: WELL.x1 - 0.3, y: MIRADOR_LINE + 0.27, r: 0.1, line: MIRADOR_LINE },
  ],
  // Where the hidden stream wells up: at the pool's surface, below the region, pushed up by the
  // head of the stream that sinks into the grate 3.9 m higher (declared: the spring has
  // pressure; the column is not lifted from rest). It crosses the lower band slowly and then
  // the region takes over.
  spring: { x: 2.2, y: -3.86, vx: 0.85, vy: 2.95 },
  // Taut between a bracket on the lip and the chasm floor; a collar stops the descent.
  chains: [
    { id: 'borde', x: 0.92, side: 0.24, lipX: 0, lipY: 0, stopY: -2.5, floorY: -4.6 },
    // Down to the well's water: the explorer can let go anywhere, also below the region.
    { id: 'pozo', x: WELL.x0 + 0.95, side: 0.24, lipX: WELL.x0, lipY: TERRACE_Y, stopY: WELL.floorY + 0.55, floorY: WELL.floorY, regionFloor: WELL.regionY0 },
  ],
  // Loose spheres rest on a table behind the path until the explorer takes one.
  loose: [
    { id: 'L1', x: -5.9, y: 0.78 },
    { id: 'L2', x: -5.5, y: 0.78 },
    { id: 'L3', x: -5.1, y: 0.78 },
  ],
};
