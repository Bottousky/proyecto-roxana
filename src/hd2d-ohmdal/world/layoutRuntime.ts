// Layout runtime — derives the runtime's spatial model from arc1-layout.json.
//
// The layout document (docs/20-worlds/ohmdal/world/layout/arc1-layout.json) is
// the SINGLE spatial authority for Cuenca de Ohm. This module translates its
// diorama data (zones, landmarks, buildings, paths, anchors) into the runtime
// model used by world.ts, terrain.ts, the electrical graph and the debug
// top-down layer.
//
// Rules:
//   - No magic coordinates for scene placement: every rect and group position
//     is derived from the layout document (center + size → min-corner rect).
//   - The runtime region ids map to layout zones via REGION_ZONE below.
//   - Elevation: sunken elevations come from the layout zone y (spring_descent
//     -0.75, manantial -1.5). Raised greybox platforms (portal/puerta/camino)
//     are module constants, since the layout document does not model them.
//   - World bounds are derived from the diorama bounds, not hardcoded.
//   - The electrical node positions are derived from the module placements
//     below (group position + the module's own local lamp offsets), so the
//     visible meshes and the graph always agree. Which cables are broken is a
//     gameplay decision the layout does not specify.

import {
  CUENCA,
  LAYOUT,
  centerToRect,
  dioramaBounds,
  zoneById,
  landmarkById,
  type Rect,
} from "./layoutData.ts";

// ---------------------------------------------------------------------------
// Types (mirror the previous topology.ts shapes so world.ts/terrain.ts keep
// working with the same interfaces).
// ---------------------------------------------------------------------------

export interface RegionDef {
  id: string;
  label: string;
  /** Footprint XZ rectangle (min-corner). Y is the ground elevation. */
  x: number;
  z: number;
  width: number;
  depth: number;
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
  from: { x: number; z: number; y: number };
  to: { x: number; z: number; y: number };
  width: number;
  stepCount: number;
  axis: "x" | "z";
}

export interface LandmarkDef {
  id: string;
  bearing: number;
  distance: number;
  kind: "mountains" | "tower" | "smoke" | "lighthouse" | "spires";
  height: number;
  width: number;
  color: number;
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

function zoneRect(id: string): Rect | null {
  const zone = zoneById(id);
  if (!zone) return null;
  return centerToRect(zone.center, zone.size);
}

function landmarkRect(id: string): Rect | null {
  const lm = landmarkById(id);
  if (!lm) return null;
  return centerToRect(lm.position, lm.footprint);
}

function landmarkPos(id: string): { x: number; z: number; y: number } {
  const lm = landmarkById(id);
  if (!lm) return { x: 0, y: 0, z: 0 };
  return { x: lm.position.x, y: lm.position.y, z: lm.position.z };
}

// ---------------------------------------------------------------------------
// Runtime region model
// ---------------------------------------------------------------------------

/** Map runtime region id → layout zone id. */
const REGION_ZONE: Record<string, string> = {
  sendero: "portal_forecourt",
  portal: "portal_forecourt",
  camino: "arrival_promenade",
  plaza: "plaza",
  taller: "lumen_forecourt",
  calzada_alta: "ohm_gate_forecourt",
  puerta: "ohm_gate_forecourt",
  calzada: "spring_descent",
  manantial: "manantial",
};

/** Region → group placement (world XZ), derived from layout landmarks/zones.
 *  This is the ONLY placement authority for the environment modules. */
export const REGION_PLACEMENT: Record<string, { x: number; z: number }> = (() => {
  const plazaLm = landmarkPos("plaza_monument");
  const portalLm = landmarkPos("portal_omega");
  const puertaLm = landmarkPos("ohm_gate");
  const zoneCenter = (id: string) => {
    const z = zoneById(id)!;
    return { x: z.center.x, z: z.center.z };
  };
  const tallerZone = zoneById("lumen_forecourt")!;
  return {
    sendero: zoneCenter("portal_forecourt"),
    portal: { x: portalLm.x, z: portalLm.z },
    camino: zoneCenter("arrival_promenade"),
    plaza: { x: plazaLm.x, z: plazaLm.z },
    taller: { x: tallerZone.center.x, z: tallerZone.center.z },
    calzada_alta: zoneCenter("ohm_gate_forecourt"),
    puerta: { x: puertaLm.x, z: puertaLm.z },
    calzada: zoneCenter("spring_descent"),
    manantial: zoneCenter("manantial"),
  };
})();

/** Ground elevation per region. Sunken elevations come from the layout (the
 *  spring descent is -0.75, the manantial -1.5); raised greybox platforms
 *  (portal/puerta/camino) are module constants, documented above. */
const REGION_Y: Record<string, number> = {
  portal: 0.4,
  puerta: 0.4,
  camino: 0.2,
  calzada: -0.75,
};

function buildRegion(id: string): RegionDef {
  const rect = zoneRect(REGION_ZONE[id]);
  const base = rect ?? { x: 0, z: 0, width: 8, depth: 8, y: 0 };
  let { x, z, width, depth } = base;

  // Regions that correspond to a single landmark footprint take it directly.
  // (portal = the Portal platform; puerta = the monumental gate). plaza and
  // manantial are the full layout zones, not their landmark footprints.
  const lmOverride: Record<string, string> = {
    portal: "portal_omega",
    puerta: "ohm_gate",
  };
  const lmId = lmOverride[id];
  if (lmId) {
    const lmRect = landmarkRect(lmId);
    if (lmRect) {
      x = lmRect.x;
      z = lmRect.z;
      width = lmRect.width;
      depth = lmRect.depth;
    }
  }

  const label: Record<string, string> = {
    sendero: "Sendero",
    portal: "Portal Ω",
    camino: "Camino",
    plaza: "Plaza de Ohm",
    taller: "Taller de Lumen",
    calzada_alta: "Calzada Alta",
    puerta: "Puerta de Ohm",
    calzada: "Calzada",
    manantial: "Manantial",
  };

  return {
    id,
    label: label[id] ?? id,
    x,
    z,
    width,
    depth,
    y: REGION_Y[id] ?? base.y,
  };
}

const REGION_ORDER = [
  // Nested/specific regions first so regionAt returns the most precise region
  // (e.g. the Portal platform inside the forecourt, the gate inside its
  // forecourt, the Manantial patio over the descent band).
  "portal",
  "puerta",
  "manantial",
  "sendero",
  "camino",
  "plaza",
  "taller",
  "calzada_alta",
  "calzada",
];

/** Runtime regions, derived from layout zones/landmarks (no magic coords). */
export const REGIONS: RegionDef[] = REGION_ORDER.map(buildRegion);

export function regionAt(x: number, z: number): RegionDef | null {
  for (const r of REGIONS) {
    if (x >= r.x && x <= r.x + r.width && z >= r.z && z <= r.z + r.depth) {
      return r;
    }
  }
  return null;
}

/** World playable bounds, derived from the diorama bounds (layout authority). */
export const WORLD_BOUNDS: { minX: number; maxX: number; minZ: number; maxZ: number } = (() => {
  const b = dioramaBounds(4);
  return { minX: b.x, maxX: b.x + b.width, minZ: b.z, maxZ: b.z + b.depth };
})();

// ---------------------------------------------------------------------------
// Steps (elevation transitions between regions)
// ---------------------------------------------------------------------------

/** A stair run at the edge of a platform rect. `edge` is "south" (+Z edge) or
 *  "north" (-Z edge). The run travels south→north over 2 m. */
function platformStep(
  rect: Rect,
  edge: "south" | "north",
  yLow: number,
  yHigh: number,
  stepCount: number,
): StepDef {
  const zEdge = edge === "south" ? rect.z + rect.depth : rect.z;
  const zOther = edge === "south" ? zEdge - 2 : zEdge + 2;
  // from = south end (higher z), to = north end (lower z).
  return {
    from: { x: rect.x + rect.width / 2, z: edge === "south" ? zEdge : zOther, y: yLow },
    to: { x: rect.x + rect.width / 2, z: edge === "south" ? zOther : zEdge, y: yHigh },
    width: rect.width,
    stepCount,
    axis: "z",
  };
}

/** Build a stair run across the boundary where two region rects overlap. */
function boundaryStep(
  southRect: Rect,
  northRect: Rect,
  ySouth: number,
  yNorth: number,
  stepCount: number,
): StepDef {
  const boundaryZ = (southRect.z + (northRect.z + northRect.depth)) / 2;
  const overlapMin = Math.max(southRect.x, northRect.x);
  const overlapMax = Math.min(southRect.x + southRect.width, northRect.x + northRect.width);
  const width = Math.max(2, overlapMax - overlapMin);
  return {
    from: { x: (overlapMin + overlapMax) / 2, z: boundaryZ + 1, y: ySouth },
    to: { x: (overlapMin + overlapMax) / 2, z: boundaryZ - 1, y: yNorth },
    width,
    stepCount,
    axis: "z",
  };
}

/** Stairs between adjacent elevation tiers, derived from layout rects. */
export const STEPS: StepDef[] = (() => {
  const camino = zoneRect("arrival_promenade")!;
  const plaza = zoneRect("plaza")!;
  const manantial = zoneRect("manantial")!;

  return [
    // Sendero (y 0) → Portal platform (y 0.4): two-step climb at the platform's
    // south edge.
    platformStep(landmarkRect("portal_omega")!, "south", 0, 0.4, 2),
    // Portal platform (y 0.4) → Camino/promenade (y 0.2): two-step descent at
    // the platform's north edge.
    platformStep(landmarkRect("portal_omega")!, "north", 0.2, 0.4, 2),
    // Camino (y 0.2) → Plaza (y 0): one step down at their shared boundary.
    boundaryStep(camino, plaza, 0.2, 0, 1),
    // Calzada-alta (y 0) → Puerta platform (y 0.4): two-step climb.
    platformStep(landmarkRect("ohm_gate")!, "south", 0, 0.4, 2),
    // Puerta platform (y 0.4) → Calzada (y -0.75): descent into the spring
    // descent band.
    platformStep(landmarkRect("ohm_gate")!, "north", -0.75, 0.4, 2),
    // Calzada (y -0.75) → Manantial (y -1.5): six-step descent into the patio.
    boundaryStep(zoneRect("spring_descent")!, manantial, -0.75, -1.5, 6),
  ];
})();

// ---------------------------------------------------------------------------
// Electrical graph: nodes + cables
// ---------------------------------------------------------------------------

/** Electrical nodes. The source/pump/switch/gate/automaton anchors come from
 *  layout landmarks; lamp nodes are derived from the region rects using the
 *  same lamp-placement formula the environment modules use, so meshes and
 *  graph always agree. */
export const NODES: NodeDef[] = (() => {
  const portalLm = landmarkPos("portal_omega");
  const puertaLm = landmarkPos("ohm_gate");

  const rectOf = (id: string) => zoneRect(REGION_ZONE[id])!;
  const plaza = rectOf("plaza");
  const camino = rectOf("camino");
  const manantial = rectOf("manantial");
  const taller = rectOf("taller");
  const plazaLm = landmarkPos("plaza_monument");

  // Plaza lamps: inset 1.6 m from the four rect corners (matches plaza.ts).
  const plazaLamps = [
    { x: plaza.x + 1.6, z: plaza.z + 1.6 },
    { x: plaza.x + plaza.width - 1.6, z: plaza.z + 1.6 },
    { x: plaza.x + 1.6, z: plaza.z + plaza.depth - 1.6 },
    { x: plaza.x + plaza.width - 1.6, z: plaza.z + plaza.depth - 1.6 },
  ];
  // Camino lamps: two centered on the promenade, inset 1 m from the ends
  // (matches paths.ts buildCamino).
  const caminoLamps = [
    { x: camino.x + camino.width / 2, z: camino.z + 1 },
    { x: camino.x + camino.width / 2, z: camino.z + camino.depth - 1 },
  ];
  // Puerta lamps: flanking the gate, inset (matches puerta.ts).
  const puertaLamps = [
    { x: puertaLm.x - 4, z: puertaLm.z },
    { x: puertaLm.x + 4, z: puertaLm.z },
  ];
  // Manantial lamps: near the gate, on each side of the patio.
  const manantialLamps = [
    { x: manantial.x + 6, z: manantial.z + 4 },
    { x: manantial.x + manantial.width - 6, z: manantial.z + 4 },
  ];

  return [
    // Source: Portal Ω core (portal_omega landmark).
    { id: "src_portal", region: "portal", position: { x: portalLm.x, z: portalLm.z, y: 2.6 }, type: "source" },
    // Camino junction: a pure pass-through node on the promenade (no mesh).
    { id: "node_camino", region: "camino", position: { x: camino.x + camino.width / 2, z: camino.z + camino.depth / 2, y: 0.2 }, type: "switch" },
    // Plaza fountain pump at the plaza monument (activation anchor).
    { id: "node_fountain", region: "plaza", position: { x: plazaLm.x, z: plazaLm.z, y: 0.4 }, type: "pump" },
    // Plaza lamps.
    { id: "node_lamp_plaza_1", region: "plaza", position: { x: plazaLamps[0].x, z: plazaLamps[0].z, y: 3.2 }, type: "lamp" },
    { id: "node_lamp_plaza_2", region: "plaza", position: { x: plazaLamps[1].x, z: plazaLamps[1].z, y: 3.2 }, type: "lamp" },
    { id: "node_lamp_plaza_3", region: "plaza", position: { x: plazaLamps[2].x, z: plazaLamps[2].z, y: 3.2 }, type: "lamp" },
    { id: "node_lamp_plaza_4", region: "plaza", position: { x: plazaLamps[3].x, z: plazaLamps[3].z, y: 3.2 }, type: "lamp" },
    // Camino lamps.
    { id: "node_lamp_camino_1", region: "camino", position: { x: caminoLamps[0].x, z: caminoLamps[0].z, y: 3.0 }, type: "lamp" },
    { id: "node_lamp_camino_2", region: "camino", position: { x: caminoLamps[1].x, z: caminoLamps[1].z, y: 3.0 }, type: "lamp" },
    // Taller: bench switch + light (workshop building area).
    { id: "node_taller_bench", region: "taller", position: { x: taller.x + 6, z: taller.z + taller.depth / 2, y: 1.0 }, type: "switch" },
    { id: "node_taller_light", region: "taller", position: { x: taller.x + taller.width - 2, z: taller.z + 2, y: 3.0 }, type: "lamp" },
    // Puerta lamps + Ohm on his pedestal.
    { id: "node_puerta_l", region: "puerta", position: { x: puertaLamps[0].x, z: puertaLamps[0].z, y: 3.0 }, type: "lamp" },
    { id: "node_puerta_r", region: "puerta", position: { x: puertaLamps[1].x, z: puertaLamps[1].z, y: 3.0 }, type: "lamp" },
    { id: "node_ohm", region: "puerta", position: { x: puertaLm.x, z: puertaLm.z, y: 1.0 }, type: "automaton" },
    // Manantial: gate (compuerta) + two lamps.
    { id: "node_manantial_gate", region: "manantial", position: { x: manantial.x + manantial.width / 2, z: manantial.z + 1.5, y: 0.5 }, type: "compuerta" },
    { id: "node_lamp_manantial_1", region: "manantial", position: { x: manantialLamps[0].x, z: manantialLamps[0].z, y: 1.8 }, type: "lamp" },
    { id: "node_lamp_manantial_2", region: "manantial", position: { x: manantialLamps[1].x, z: manantialLamps[1].z, y: 1.8 }, type: "lamp" },
  ];
})();

/** Cables. The broken/complete pattern is H1 gameplay; positions come from the
 *  node positions above. */
export const CABLES: CableDef[] = (() => {
  const p = (id: string) => {
    const n = NODES.find((n) => n.id === id)!;
    return { x: n.position.x, z: n.position.z };
  };
  return [
    // Portal → Camino junction (complete feed down the promenade).
    { id: "c_portal_to_camino", from: p("src_portal"), to: p("node_camino"), state: "complete" },
    // Camino → Fountain (broken — the first repair; midpoint sits on the
    // Camino so the player meets it before the Plaza).
    { id: "c_camino_to_fountain", from: p("node_camino"), to: p("node_fountain"), state: "broken" },
    { id: "c_fountain_to_l1", from: p("node_fountain"), to: p("node_lamp_plaza_1"), state: "complete" },
    { id: "c_fountain_to_l2", from: p("node_fountain"), to: p("node_lamp_plaza_2"), state: "complete" },
    { id: "c_fountain_to_l3", from: p("node_fountain"), to: p("node_lamp_plaza_3"), state: "complete" },
    { id: "c_fountain_to_l4", from: p("node_fountain"), to: p("node_lamp_plaza_4"), state: "complete" },
    { id: "c_fountain_to_camino_l1", from: p("node_fountain"), to: p("node_lamp_camino_1"), state: "complete" },
    { id: "c_fountain_to_camino_l2", from: p("node_fountain"), to: p("node_lamp_camino_2"), state: "complete" },
    { id: "c_fountain_to_puerta_l", from: p("node_fountain"), to: p("node_puerta_l"), state: "broken" },
    { id: "c_fountain_to_puerta_r", from: p("node_fountain"), to: p("node_puerta_r"), state: "broken" },
    { id: "c_puerta_to_ohm", from: p("node_puerta_l"), to: p("node_ohm"), state: "broken" },
    { id: "c_puerta_to_calzada", from: p("node_puerta_l"), to: p("node_manantial_gate"), state: "complete" },
    { id: "c_calzada_to_manantial_gate", from: p("node_puerta_r"), to: p("node_manantial_gate"), state: "complete" },
    { id: "c_manantial_gate_to_l1", from: p("node_manantial_gate"), to: p("node_lamp_manantial_1"), state: "complete" },
    { id: "c_manantial_gate_to_l2", from: p("node_manantial_gate"), to: p("node_lamp_manantial_2"), state: "complete" },
    { id: "c_taller_in_a", from: p("node_taller_bench"), to: p("node_taller_light"), state: "complete" },
    { id: "c_taller_in_b", from: p("node_taller_bench"), to: p("node_taller_light"), state: "broken" },
  ];
})();

// ---------------------------------------------------------------------------
// Distant landmarks (silhouettes) — derived from the overworld macroterritories
// ---------------------------------------------------------------------------

/** Overworld macroterritories as distant silhouettes, computed from their
 *  overworld positions relative to the Cuenca origin. */
export const LANDMARKS: LandmarkDef[] = (() => {
  const origin = CUENCA.origin === "plaza_center" ? { x: 0, z: 0 } : { x: 0, z: 0 };
  const out: LandmarkDef[] = [];
  for (const t of LAYOUT.overworld.macroterritories) {
    if (t.id === "cuenca_de_ohm") continue;
    const dx = t.position.x - origin.x;
    const dz = t.position.z - origin.z;
    const bearing = (Math.atan2(dx, -dz) * 180) / Math.PI;
    const distance = Math.hypot(dx, dz);
    const kind: LandmarkDef["kind"] =
      t.id === "castillo_de_la_red" ? "tower" :
      t.id === "forja_y_terrazas" ? "smoke" :
      t.id === "faro_y_lago" ? "lighthouse" : "mountains";
    out.push({
      id: `lm_${t.id}`,
      bearing: (bearing + 360) % 360,
      distance: Math.max(60, distance * 1.4),
      kind,
      height: kind === "tower" ? 28 : kind === "smoke" ? 18 : 12,
      width: kind === "tower" ? 22 : kind === "smoke" ? 12 : 6,
      color: kind === "tower" ? 0x3a4658 : kind === "smoke" ? 0x3a3530 : 0x4a4a5a,
    });
  }
  return out;
})();
