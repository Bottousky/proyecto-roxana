// Layout data loader — the runtime's single spatial authority.
//
// `arc1-layout.json` (docs/20-worlds/ohmdal/world/layout/) is the source of
// truth for Ohmdal Arc I spatial composition: zones, landmarks, buildings,
// paths, thresholds, interaction anchors, entrances/exits, protected
// sightlines and reserved negative space.
//
// This module loads that JSON and exposes the `cuenca_de_ohm` diorama with
// helpers that convert the document's center+size notation into runtime
// rectangles. Render code MUST NOT invent magic coordinates for scene
// placement; it derives everything from here (see layoutRuntime.ts).

import arc1Layout from "../../../docs/20-worlds/ohmdal/world/layout/arc1-layout.json";
import { normalizeLayout } from "../../ohmdal/layout/normalize.ts";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Rect {
  /** Min-corner in the XZ plane (runtime convention: x/z are the south-west edge). */
  x: number;
  z: number;
  width: number;
  depth: number;
  /** Ground elevation (meters). */
  y: number;
}

export interface LayoutZone {
  id: string;
  center: Vec3;
  size: [number, number];
  purpose: string;
}

export interface LayoutLandmark {
  id: string;
  position: Vec3;
  footprint: [number, number];
  facingY: number;
}

export interface LayoutBuilding {
  id: string;
  center: Vec3;
  size: [number, number];
  entrance: { position: Vec3; facingY: number };
  interior: string | null;
}

export interface LayoutPath {
  id: string;
  from: Vec3;
  to: Vec3;
  minClearWidth: number;
}

export interface LayoutAnchor {
  id: string;
  position: Vec3;
  stagingRadius: number;
}

export interface LayoutSightline {
  id: string;
  from: Vec3;
  through?: Vec3;
  to: Vec3;
}

export interface LayoutNegativeSpace {
  id: string;
  center: Vec3;
  size: [number, number];
  allow: string[];
}

export interface Diorama {
  origin: string;
  planningStatus: string;
  bounds: { center: Vec3; size: [number, number] };
  zones: LayoutZone[];
  landmarks: LayoutLandmark[];
  buildings: LayoutBuilding[];
  paths: LayoutPath[];
  interactionAnchors: LayoutAnchor[];
  entrances: { id: string; position: Vec3; facingY: number }[];
  exits: { id: string; position: Vec3; facingY: number }[];
  protectedSightlines: LayoutSightline[];
  reservedNegativeSpace: LayoutNegativeSpace[];
}

export interface Arc1Layout {
  schemaVersion: string;
  status: string;
  units: { overworld: string; dioramas: string };
  axes: Record<string, string>;
  overworld: {
    origin: string;
    macroterritories: { id: string; label: string; position: Vec3; footprint: [number, number]; landmark: string; arc1Chapters: string[] }[];
    links: { from: string; to: string; kind: string; semantic: string }[];
  };
  dioramas: Record<string, Diorama>;
}

const RAW_LAYOUT = arc1Layout as unknown as Arc1Layout;

export const LAYOUT: Arc1Layout = normalizeLayout(RAW_LAYOUT);

/** The Cuenca de Ohm diorama — the only currently playable spatial territory. */
export const CUENCA: Diorama = LAYOUT.dioramas["cuenca_de_ohm"];

/** Convert a center+size entry into a min-corner runtime rect at elevation y. */
export function centerToRect(
  center: Vec3,
  size: [number, number],
): Rect {
  return {
    x: center.x - size[0] / 2,
    z: center.z - size[1] / 2,
    width: size[0],
    depth: size[1],
    y: center.y,
  };
}

export function zoneById(id: string): LayoutZone | undefined {
  return CUENCA.zones.find((z) => z.id === id);
}

export function landmarkById(id: string): LayoutLandmark | undefined {
  return CUENCA.landmarks.find((l) => l.id === id);
}

export function buildingById(id: string): LayoutBuilding | undefined {
  return CUENCA.buildings.find((b) => b.id === id);
}

export function pathById(id: string): LayoutPath | undefined {
  return CUENCA.paths.find((p) => p.id === id);
}

export function anchorById(id: string): LayoutAnchor | undefined {
  return CUENCA.interactionAnchors.find((a) => a.id === id);
}

/** Union bounds of every diorama rect (zones + landmarks + buildings), expanded by margin. */
export function dioramaBounds(margin = 2): Rect {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  const consume = (r: Rect) => {
    minX = Math.min(minX, r.x);
    maxX = Math.max(maxX, r.x + r.width);
    minZ = Math.min(minZ, r.z);
    maxZ = Math.max(maxZ, r.z + r.depth);
  };
  for (const z of CUENCA.zones) consume(centerToRect(z.center, z.size));
  for (const l of CUENCA.landmarks) consume(centerToRect(l.position, l.footprint));
  for (const b of CUENCA.buildings) consume(centerToRect(b.center, b.size));
  return {
    x: minX - margin,
    z: minZ - margin,
    width: maxX - minX + margin * 2,
    depth: maxZ - minZ + margin * 2,
    y: 0,
  };
}
