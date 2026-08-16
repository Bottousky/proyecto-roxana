// World topology for Cuenca de Ohm (Ohmdal Arc I, HD-2D rebuild).
// One continuous Three.js scene. Regions are described as 2D rectangles in the
// XZ plane (Y is up). World units = meters.
//
// Composition (XZ plane, top-down, N=-Z):
//                                  MANANTIAL  y ≈ -1.5 (sunken)
//                                     ↓
//                                 PUERTA  y = 0.4  (monumental arch)
//                                     ↓
//                  TALLER ← PLAZA → steps
//                  (E)       ↓
//                          CAMINO
//                             ↓
//                          PORTAL  y = 0.5
//                             ↓
//                          SENDERO  y = 0
//
// World is roughly 80m × 90m. Camera reads from a 22m-up, 24m-back rig with
// a 50° FOV. Region sizes are tuned to that camera so the Plaza fits with
// breathing room but intimate buildings feel human-scale.

export interface RegionDef {
  id: string;
  label: string;
  /** Footprint XZ rectangle. Y is set on the group by the world. */
  x: number;
  z: number;
  width: number;
  depth: number;
  /** Ground Y elevation (meters above world 0). */
  y: number;
}

export interface NodeDef {
  id: string;
  region: string;
  position: { x: number; z: number; y: number };
  type: "source" | "lamp" | "pump" | "automaton" | "switch" | "compuerta";
}

export interface CableDef {
  id: string;
  from: { x: number; z: number };
  to: { x: number; z: number };
  state: "complete" | "broken";
}

export interface StepDef {
  /** A 3D stair step (rectangle at Y). Placed by world.ts along region edges. */
  from: { x: number; z: number; y: number };
  to: { x: number; z: number; y: number };
  width: number;
  stepCount: number;
  axis: "x" | "z";
}

export interface LandmarkDef {
  id: string;
  /** Direction from the Plaza center. */
  bearing: number;
  /** Distance in meters from Plaza. */
  distance: number;
  kind: "mountains" | "tower" | "smoke" | "lighthouse" | "spires";
  /** Vertical scale (height in meters). */
  height: number;
  /** Horizontal scale (width in meters). */
  width: number;
  /** Color for the silhouette. */
  color: number;
}

export const REGIONS: RegionDef[] = [
  // All z values are MIN-CORNER (south edge), matching the convention used
  // by regionAt (x >= r.x && z >= r.z). The world builder (world.ts) places
  // each group at the CENTER of its geometry, so the region's center z is
  // r.z + r.depth / 2. Keep these in sync with the group positions in
  // world.ts (lines ~96-115).
  // ---- South exterior (start) ----
  { id: "sendero",   label: "Sendero",     x: -22, z:  18, width: 44, depth: 8,  y: 0.0 },
  // ---- Portal Ω (entrance, slightly raised) ----
  { id: "portal",    label: "Portal Ω",    x: -4,  z:   9, width: 8,  depth: 6,  y: 0.4 },
  // ---- Camino (south→plaza, ramp) ----
  { id: "camino",    label: "Camino",      x: -5,  z:   3, width: 10, depth: 6,  y: 0.2 },
  // ---- Plaza (the hub, 0) ----
  { id: "plaza",     label: "Plaza de Ohm", x: -10, z: -11, width: 20, depth: 16, y: 0.0 },
  // ---- Taller (east, building + courtyard) ----
  // The Taller region includes the courtyard between the Plaza's east wall
  // and the building's west wall, so a player standing in the courtyard
  // still reads as "at the Taller". The building itself is at x=11..21
  // (group at (16, 0, 0), 10m wide).
  { id: "taller",    label: "Taller de Lumen", x: 10, z: -4, width: 16, depth: 8, y: 0.0 },
  // ---- Calzada-alta (between Plaza and Puerta, transition platform) ----
  { id: "calzada_alta", label: "Calzada Alta", x: -7, z: -13, width: 14, depth: 4, y: 0.0 },
  // ---- Puerta de Ohm (monumental arch, slightly raised) ----
  { id: "puerta",    label: "Puerta de Ohm", x: -8, z: -19, width: 16, depth: 6, y: 0.4 },
  // ---- Calzada (between Puerta and Manantial) ----
  { id: "calzada",   label: "Calzada",     x: -5,  z: -25, width: 10, depth: 6, y: 0.0 },
  // ---- Manantial (sunken patio) ----
  { id: "manantial", label: "Manantial",   x: -16, z: -38, width: 32, depth: 12, y: -1.5 },
];

export function regionAt(x: number, z: number): RegionDef | null {
  for (const r of REGIONS) {
    if (
      x >= r.x && x <= r.x + r.width &&
      z >= r.z && z <= r.z + r.depth
    ) {
      return r;
    }
  }
  return null;
}

/**
 * Steps between regions. Each "step" describes a stair run on the world floor
 * that connects two elevation tiers. world.ts converts each into a flight of
 * primitive steps. The list below covers every transition a player can
 * traverse on foot.
 */
export const STEPS: StepDef[] = [
  // Each step is a 3D stair run placed at the visible boundary between
  // two regions, so the elevation change happens where the player expects.
  // `from` is the south end (lower z), `to` is the north end (higher z, but
  // a different elevation). The run is along the z axis.

  // Sendero (y=0) → Portal platform (y=0.4) — at the Sendero/Portal
  // boundary (z=15..18, going south→north).
  { from: { x: -2, z: 18, y: 0 },  to: { x: -2, z: 15, y: 0.4 }, width: 4, stepCount: 2, axis: "z" },
  // Portal (y=0.4) → Camino (y=0.2) — at the Portal/Camino boundary
  // (z=9..11).
  { from: { x:  0, z: 11, y: 0.4 }, to: { x:  0, z:  9, y: 0.2 }, width: 4, stepCount: 1, axis: "z" },
  // Camino (y=0.2) → Plaza (y=0) — at the Camino/Plaza boundary (z=3..5).
  { from: { x:  0, z:  5, y: 0.2 }, to: { x:  0, z:  3, y: 0.0 }, width: 6, stepCount: 1, axis: "z" },
  // Plaza (y=0) → Calzada-alta (y=0) — flat (no step needed; the two
  // regions share a 2 m overlap at z=-11..-9).
  // Calzada-alta (y=0) → Puerta platform (y=0.4) — at the
  // Calzada-alta/Puerta boundary (z=-13..-15, just north of the
  // Calzada-alta's north edge).
  { from: { x:  0, z: -13, y: 0 },  to: { x:  0, z: -15, y: 0.4 }, width: 6, stepCount: 2, axis: "z" },
  // Puerta (y=0.4) → Calzada (y=0) — at the Puerta/Calzada boundary
  // (z=-19..-21).
  { from: { x:  0, z: -19, y: 0.4 }, to: { x:  0, z: -21, y: 0.0 }, width: 6, stepCount: 2, axis: "z" },
  // Calzada (y=0) → Manantial (y=-1.5) — dramatic descent at the
  // Calzada/Manantial boundary (z=-25..-27).
  { from: { x:  0, z: -25, y: 0 },  to: { x:  0, z: -27, y: -1.5 }, width: 6, stepCount: 6, axis: "z" },
];

// --- Electrical nodes (positions in world space, Y is up) ---
export const NODES: NodeDef[] = [
  // Source: at the Portal Ω core, 2.2m above the platform (the glowing sphere).
  { id: "src_portal",         region: "portal",     position: { x:  0, z:  12, y: 2.6 }, type: "source" },
  // Fountain pump at Plaza center.
  { id: "node_fountain",      region: "plaza",      position: { x:  0, z:  -3, y: 0.4 }, type: "pump" },
  // Plaza lamps.
  { id: "node_lamp_plaza_1",  region: "plaza",      position: { x: -7, z:  -7, y: 3.2 }, type: "lamp" },
  { id: "node_lamp_plaza_2",  region: "plaza",      position: { x:  7, z:  -7, y: 3.2 }, type: "lamp" },
  { id: "node_lamp_plaza_3",  region: "plaza",      position: { x: -7, z:   3, y: 3.2 }, type: "lamp" },
  { id: "node_lamp_plaza_4",  region: "plaza",      position: { x:  7, z:   3, y: 3.2 }, type: "lamp" },
  // Camino lamps.
  { id: "node_lamp_camino_1", region: "camino",     position: { x: -3, z:   5, y: 3.0 }, type: "lamp" },
  { id: "node_lamp_camino_2", region: "camino",     position: { x:  3, z:   5, y: 3.0 }, type: "lamp" },
  // Puerta lamps + Ohm on his pedestal (north of the arch).
  { id: "node_puerta_l",      region: "puerta",     position: { x: -4, z: -16, y: 3.0 }, type: "lamp" },
  { id: "node_puerta_r",      region: "puerta",     position: { x:  4, z: -16, y: 3.0 }, type: "lamp" },
  { id: "node_ohm",           region: "puerta",     position: { x:  0, z: -18, y: 1.0 }, type: "automaton" },
  // Calzada lamps.
  { id: "node_lamp_calzada_1",region: "calzada",    position: { x: -3, z: -22, y: 3.0 }, type: "lamp" },
  { id: "node_lamp_calzada_2",region: "calzada",    position: { x:  3, z: -22, y: 3.0 }, type: "lamp" },
  // Manantial: gate + lamps around the pool.
  { id: "node_manantial_gate",region: "manantial",  position: { x:  0, z: -27, y: 0.5 }, type: "compuerta" },
  { id: "node_lamp_manantial_1", region: "manantial", position: { x: -10, z: -34, y: 1.8 }, type: "lamp" },
  { id: "node_lamp_manantial_2", region: "manantial", position: { x:  10, z: -34, y: 1.8 }, type: "lamp" },
  // Taller: bench + lamp.
  { id: "node_taller_bench",  region: "taller",     position: { x: 21, z:   0, y: 1.0 }, type: "switch" },
  { id: "node_taller_light",  region: "taller",     position: { x: 24, z:  -3, y: 3.0 }, type: "lamp" },
];

// --- Cables (the single electrical graph of Cuenca de Ohm) ---
export const CABLES: CableDef[] = [
  // Portal → Camino
  { id: "c_portal_to_camino",  from: { x: 0, z: 12 }, to: { x: 0, z:  9 }, state: "complete" },
  // Camino → Fountain (broken — needs repair)
  { id: "c_camino_to_fountain",from: { x: 0, z:  9 }, to: { x: 0, z: -3 }, state: "broken" },
  // Fountain → Plaza lamps (loop)
  { id: "c_fountain_to_l1",    from: { x: 0, z: -3 }, to: { x: -7, z: -7 }, state: "complete" },
  { id: "c_fountain_to_l2",    from: { x: 0, z: -3 }, to: { x:  7, z: -7 }, state: "complete" },
  { id: "c_fountain_to_l3",    from: { x: 0, z: -3 }, to: { x: -7, z:  3 }, state: "complete" },
  { id: "c_fountain_to_l4",    from: { x: 0, z: -3 }, to: { x:  7, z:  3 }, state: "complete" },
  // Fountain → Camino lamps
  { id: "c_fountain_to_camino_l1", from: { x: 0, z: -3 }, to: { x: -3, z: 5 }, state: "complete" },
  { id: "c_fountain_to_camino_l2", from: { x: 0, z: -3 }, to: { x:  3, z: 5 }, state: "complete" },
  // Fountain → Puerta lamps (broken — needs repair to enter Calzada)
  { id: "c_fountain_to_puerta_l",  from: { x: 0, z: -3 }, to: { x: -4, z: -16 }, state: "broken" },
  { id: "c_fountain_to_puerta_r",  from: { x: 0, z: -3 }, to: { x:  4, z: -16 }, state: "broken" },
  // Puerta → Ohm (broken — Ohm stays dormant until restored)
  { id: "c_puerta_to_ohm",     from: { x: -4, z: -16 }, to: { x: 0, z: -18 }, state: "broken" },
  // Puerta → Calzada
  { id: "c_puerta_to_calzada", from: { x:  0, z: -16 }, to: { x: 0, z: -22 }, state: "complete" },
  // Calzada → Manantial gate
  { id: "c_calzada_to_manantial_gate", from: { x: 0, z: -22 }, to: { x: 0, z: -27 }, state: "complete" },
  // Manantial gate → lamps
  { id: "c_manantial_gate_to_l1", from: { x: 0, z: -27 }, to: { x: -10, z: -34 }, state: "complete" },
  { id: "c_manantial_gate_to_l2", from: { x: 0, z: -27 }, to: { x:  10, z: -34 }, state: "complete" },
  // Taller independent circuit
  { id: "c_taller_in_a",       from: { x: 17, z:  0 }, to: { x: 21, z:  0 }, state: "complete" },
  { id: "c_taller_in_b",       from: { x: 21, z:  0 }, to: { x: 24, z: -3 }, state: "broken" },
];

// --- Distant landmarks (silhouettes outside the playable area) ---
// Bearing is degrees from north (negative Z), clockwise: 0=N, 90=E, 180=S, 270=W.
export const LANDMARKS: LandmarkDef[] = [
  // S-SW: hills behind the Portal (suggests the Sendero continues)
  { id: "lm_hills_s",  bearing: 170, distance: 65, kind: "mountains",  height: 14, width: 50, color: 0x2a3a52 },
  // W: Castillo de la Red silhouette (Castillo is the second macroterritory).
  { id: "lm_castillo", bearing: 260, distance: 90, kind: "tower",     height: 28, width: 22, color: 0x3a4658 },
  // E: Forja smoke (third macroterritory).
  { id: "lm_forja",    bearing:  95, distance: 85, kind: "smoke",     height: 18, width: 12, color: 0x3a3530 },
  // S: Faro light point (fourth macroterritory).
  { id: "lm_faro",     bearing: 200, distance: 110, kind: "lighthouse", height: 12, width: 6, color: 0x4a4a5a },
  // N-NE: distant spires (unidentified, future Arcos).
  { id: "lm_spires",   bearing:  20, distance: 80, kind: "spires",    height: 16, width: 10, color: 0x3a4654 },
];
