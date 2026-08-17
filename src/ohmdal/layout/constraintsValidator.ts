// Constraints validator for Ohmdal Arc I layout data.
//
// Pure, renderer-neutral module: it validates `arc1-layout.json` against
// `arc1-constraints.json` without any DOM or Three.js dependency, so it runs
// under `node --experimental-strip-types` in tests and in the CLI.
//
// Each rule in the constraints document is declared with a `type`. This
// validator implements the checkable rule types; rules that require a human or
// runtime judgment (e.g. "derived_visual_required", "coexistence_required")
// are reported as `info`/manual gates, never silently dropped.

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface LayoutZone {
  id: string;
  center: Vec3Like;
  size: [number, number];
  purpose: string;
}

export interface LayoutLandmark {
  id: string;
  position: Vec3Like;
  footprint: [number, number];
  facingY: number;
}

export interface LayoutBuilding {
  id: string;
  center: Vec3Like;
  size: [number, number];
  entrance: { position: Vec3Like; facingY: number };
  interior: string | null;
}

export interface LayoutPath {
  id: string;
  from: Vec3Like;
  to: Vec3Like;
  minClearWidth: number;
}

export interface LayoutAnchor {
  id: string;
  position: Vec3Like;
  stagingRadius: number;
}

export interface LayoutSightline {
  id: string;
  from: Vec3Like;
  through?: Vec3Like;
  to: Vec3Like;
}

export interface LayoutDiorama {
  origin: string;
  planningStatus: string;
  bounds: { center: Vec3Like; size: [number, number] };
  zones: LayoutZone[];
  landmarks: LayoutLandmark[];
  buildings: LayoutBuilding[];
  paths: LayoutPath[];
  interactionAnchors: LayoutAnchor[];
  entrances: { id: string; position: Vec3Like; facingY: number }[];
  exits: { id: string; position: Vec3Like; facingY: number }[];
  protectedSightlines: LayoutSightline[];
  reservedNegativeSpace: { id: string; center: Vec3Like; size: [number, number]; allow: string[] }[];
}

export interface LayoutData {
  schemaVersion: string;
  status: string;
  overworld: { macroterritories: { id: string; position: Vec3Like }[] };
  dioramas: Record<string, LayoutDiorama>;
}

export interface ConstraintRule {
  id: string;
  type: string;
  severity: "error" | "warning";
  params: Record<string, unknown>;
  reason?: string;
}

export interface ConstraintsData {
  global: ConstraintRule[];
  [dioramaId: string]: ConstraintRule[] | unknown;
}

export interface ValidationFinding {
  rule: string;
  severity: "error" | "warning" | "info";
  status: "pass" | "fail" | "info";
  message: string;
}

export interface ValidationReport {
  ok: boolean;
  findings: ValidationFinding[];
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const dist = (a: Vec3Like, b: Vec3Like) => Math.hypot(a.x - b.x, a.z - b.z);

/** Perpendicular distance from point `p` to segment `a-b` in the XZ plane. */
function pointSegmentDist(p: Vec3Like, a: Vec3Like, b: Vec3Like): number {
  const abx = b.x - a.x;
  const abz = b.z - a.z;
  const len2 = abx * abx + abz * abz;
  if (len2 === 0) return dist(p, a);
  let t = ((p.x - a.x) * abx + (p.z - a.z) * abz) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = a.x + abx * t;
  const pz = a.z + abz * t;
  return Math.hypot(p.x - px, p.z - pz);
}

/** Does the axis-aligned rect [x..x+w, z..z+d] intersect segment a-b? */
function rectIntersectsSegment(
  x: number,
  z: number,
  w: number,
  d: number,
  a: Vec3Like,
  b: Vec3Like,
): boolean {
  // Segment endpoints inside the rect?
  if (
    (a.x >= x && a.x <= x + w && a.z >= z && a.z <= z + d) ||
    (b.x >= x && b.x <= x + w && b.z >= z && b.z <= z + d)
  ) {
    return true;
  }
  // Check the four rect edges against the segment.
  const corners: [Vec3Like, Vec3Like][] = [
    [{ x, z, y: 0 }, { x: x + w, z, y: 0 }],
    [{ x: x + w, z, y: 0 }, { x: x + w, z: z + d, y: 0 }],
    [{ x: x + w, z: z + d, y: 0 }, { x, z: z + d, y: 0 }],
    [{ x, z: z + d, y: 0 }, { x, z, y: 0 }],
  ];
  for (const [p1, p2] of corners) {
    const d1 = (b.x - a.x) * (p1.z - a.z) - (b.z - a.z) * (p1.x - a.x);
    const d2 = (b.x - a.x) * (p2.z - a.z) - (b.z - a.z) * (p2.x - a.x);
    const d3 = (p2.x - p1.x) * (a.z - p1.z) - (p2.z - p1.z) * (a.x - p1.x);
    const d4 = (p2.x - p1.x) * (b.z - p1.z) - (p2.z - p1.z) * (b.x - p1.x);
    if (((d1 >= 0 && d2 <= 0) || (d1 <= 0 && d2 >= 0)) && ((d3 >= 0 && d4 <= 0) || (d3 <= 0 && d4 >= 0))) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Rule evaluators
// ---------------------------------------------------------------------------

interface EvalContext {
  layout: LayoutData;
  dioramaId: string;
  diorama: LayoutDiorama;
}

const byId = <T extends { id: string }>(list: T[], id: string): T | undefined =>
  list.find((e) => e.id === id);

function evalRule(rule: ConstraintRule, ctx: EvalContext): ValidationFinding {
  const { diorama } = ctx;
  const fail = (message: string): ValidationFinding => ({
    rule: rule.id,
    severity: rule.severity,
    status: "fail",
    message,
  });
  const pass = (message: string): ValidationFinding => ({
    rule: rule.id,
    severity: rule.severity,
    status: "pass",
    message,
  });
  const info = (message: string): ValidationFinding => ({
    rule: rule.id,
    severity: "info",
    status: "info",
    message,
  });

  switch (rule.type) {
    case "x_alignment": {
      const items = (rule.params["items"] as string[]) ?? [];
      const tol = (rule.params["toleranceMeters"] as number) ?? 1.0;
      const positions = items
        .map((id) => byId(diorama.landmarks, id)?.position ?? byId(diorama.zones, id)?.center)
        .filter(Boolean) as Vec3Like[];
      if (positions.length < 2) {
        return fail(`x_alignment: could not resolve all items (${items.join(", ")}) to landmarks/zones`);
      }
      const xs = positions.map((p) => p.x);
      const min = Math.min(...xs);
      const max = Math.max(...xs);
      return max - min <= tol
        ? pass(`x_alignment: ${items.join(" → ")} within ${tol}m (Δ=${(max - min).toFixed(2)}m)`)
        : fail(`x_alignment: ${items.join(" → ")} not aligned on X (Δ=${(max - min).toFixed(2)}m > ${tol}m)`);
    }

    case "path_min_clear_width": {
      const pathId = rule.params["path"] as string;
      const min = (rule.params["minMeters"] as number) ?? 0;
      const p = byId(diorama.paths, pathId);
      if (!p) return fail(`path_min_clear_width: path '${pathId}' not found`);
      return p.minClearWidth >= min
        ? pass(`path '${pathId}' clear width ${p.minClearWidth}m ≥ ${min}m`)
        : fail(`path '${pathId}' clear width ${p.minClearWidth}m < ${min}m`);
    }

    case "reserved_negative_space": {
      const zoneId = rule.params["zone"] as string;
      const [minW, minD] = (rule.params["minSizeMeters"] as [number, number]) ?? [0, 0];
      const n = byId(diorama.reservedNegativeSpace, zoneId);
      if (!n) return fail(`reserved_negative_space: zone '${zoneId}' not found`);
      const ok = n.size[0] >= minW && n.size[1] >= minD;
      return ok
        ? pass(`negative space '${zoneId}' is ${n.size[0]}×${n.size[1]}m ≥ ${minW}×${minD}m`)
        : fail(`negative space '${zoneId}' is ${n.size[0]}×${n.size[1]}m < ${minW}×${minD}m`);
    }

    case "relative_position": {
      const relation = rule.params["relation"] as string;
      if (relation === "off_primary_spine") {
        const subject = byId(diorama.buildings, rule.params["subject"] as string)?.center
          ?? byId(diorama.landmarks, rule.params["subject"] as string)?.position;
        const spine = byId(diorama.paths, rule.params["object"] as string);
        if (!subject) return fail(`relative_position: subject '${rule.params["subject"]}' not found`);
        if (!spine) return fail(`relative_position: spine path '${rule.params["object"]}' not found`);
        const sep = (rule.params["minSeparationMeters"] as number) ?? 0;
        const d = pointSegmentDist(subject, spine.from, spine.to);
        return d >= sep
          ? pass(`relative_position: '${rule.params["subject"]}' off spine (distance=${d.toFixed(2)}m ≥ ${sep}m)`)
          : fail(`relative_position: '${rule.params["subject"]}' on spine (distance=${d.toFixed(2)}m < ${sep}m)`);
      }
      const subject = byId(diorama.buildings, rule.params["subject"] as string)?.center
        ?? byId(diorama.landmarks, rule.params["subject"] as string)?.position;
      const object = byId(diorama.buildings, rule.params["object"] as string)?.center
        ?? byId(diorama.zones, rule.params["object"] as string)?.center
        ?? byId(diorama.landmarks, rule.params["object"] as string)?.position;
      if (!subject || !object) return fail(`relative_position: subject/object not found for '${rule.params["subject"]}' / '${rule.params["object"]}'`);
      const sep = (rule.params["minSeparationMeters"] as number) ?? 0;
      let ok = false;
      let detail = "";
      if (relation === "east_of") {
        const dx = subject.x - object.x;
        ok = dx >= sep;
        detail = `dx=${dx.toFixed(2)}m`;
      } else {
        return info(`relative_position: relation '${relation}' not implemented, manual gate`);
      }
      return ok
        ? pass(`relative_position: '${rule.params["subject"]}' ${relation} (${detail})`)
        : fail(`relative_position: '${rule.params["subject"]}' NOT ${relation} (${detail}, needs ≥${sep}m)`);
    }

    case "entrance_faces_target": {
      const building = byId(diorama.buildings, rule.params["building"] as string);
      const target = byId(diorama.zones, rule.params["target"] as string)?.center
        ?? byId(diorama.landmarks, rule.params["target"] as string)?.position;
      if (!building || !target) return fail(`entrance_faces_target: building/target not found`);
      const e = building.entrance;
      // facingY: 0 = north (-Z), 90 = east (+X), 180 = south, 270 = west.
      const facing = ((e.facingY % 360) + 360) % 360;
      const dx = target.x - e.position.x;
      const dz = target.z - e.position.z;
      const targetAngle = (Math.atan2(dx, -dz) * 180) / Math.PI;
      const targetDeg = ((targetAngle % 360) + 360) % 360;
      let delta = Math.abs(facing - targetDeg);
      delta = Math.min(delta, 360 - delta);
      const maxErr = (rule.params["maxAngularErrorDegrees"] as number) ?? 25;
      return delta <= maxErr
        ? pass(`entrance of '${rule.params["building"]}' faces target (Δ=${delta.toFixed(1)}° ≤ ${maxErr}°)`)
        : fail(`entrance of '${rule.params["building"]}' faces ${facing}° but target is at ${targetDeg}° (Δ=${delta.toFixed(1)}° > ${maxErr}°)`);
    }

    case "sightline_unblocked": {
      const s = byId(diorama.protectedSightlines, rule.params["sightline"] as string);
      if (!s) return fail(`sightline_unblocked: sightline '${rule.params["sightline"]}' not found`);
      const lowProfile = (rule.params["allowLowProfileOccludersMeters"] as number) ?? 0;
      // Buildings are the only real occluders modeled in the layout doc.
      // A building whose footprint contains a sightline endpoint is the
      // sightline's DESTINATION (e.g. the lighthouse) — it is not an occluder.
      for (const b of diorama.buildings) {
        const [w, d] = b.size;
        const bMin = { x: b.center.x - w / 2, z: b.center.z - d / 2, y: 0 };
        const inRect = (p: Vec3Like) =>
          p.x >= bMin.x && p.x <= bMin.x + w && p.z >= bMin.z && p.z <= bMin.z + d;
        if (inRect(s.from) || inRect(s.to)) continue;
        if (rectIntersectsSegment(bMin.x, bMin.z, w, d, s.from, s.to)) {
          return fail(`sightline '${s.id}' blocked by building '${b.id}' (${w}×${d}m)`);
        }
      }
      void lowProfile;
      return pass(`sightline '${s.id}' unblocked by buildings`);
    }

    case "interaction_staging_min_radius": {
      const anchors = (rule.params["anchors"] as string[]) ?? [];
      const min = (rule.params["minMeters"] as number) ?? 0;
      const missing: string[] = [];
      const tooSmall: string[] = [];
      for (const id of anchors) {
        const a = byId(diorama.interactionAnchors, id);
        if (!a) missing.push(id);
        else if (a.stagingRadius < min) tooSmall.push(`${id} (r=${a.stagingRadius})`);
      }
      if (missing.length) return fail(`interaction_staging_min_radius: missing anchors: ${missing.join(", ")}`);
      if (tooSmall.length) return fail(`interaction_staging_min_radius: ${tooSmall.join(", ")} < ${min}m`);
      return pass(`interaction_staging_min_radius: all ${anchors.length} anchors have r ≥ ${min}m`);
    }

    case "navigation_reachability": {
      // Build a graph over sampled path points, zone membership and
      // entrances/exits. Every required entrance must reach every interaction
      // anchor (within the anchor's staging radius of a reachable point).
      const entrances = diorama.entrances ?? [];
      if (entrances.length === 0) return fail(`navigation_reachability: no entrances defined`);
      const nodes: string[] = [];
      const adj: Record<string, string[]> = {};
      const pathPoints = new Map<string, Vec3Like>();
      const connect = (a: string, b: string) => {
        if (!adj[a]) adj[a] = [];
        if (!adj[b]) adj[b] = [];
        if (!adj[a].includes(b)) adj[a].push(b);
        if (!adj[b].includes(a)) adj[b].push(a);
      };
      const addNode = (id: string, p: Vec3Like) => {
        if (!nodes.includes(id)) nodes.push(id);
        pathPoints.set(id, p);
      };

      // Sample each path every ~3 m so its full run participates in the graph
      // (a path endpoint alone is not enough — the Plaza sits mid-axis).
      const SAMPLE = 3;
      for (const p of diorama.paths) {
        const len = dist(p.from, p.to);
        const steps = Math.max(1, Math.ceil(len / SAMPLE));
        let prev: string | null = null;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const pt: Vec3Like = {
            x: p.from.x + (p.to.x - p.from.x) * t,
            y: 0,
            z: p.from.z + (p.to.z - p.from.z) * t,
          };
          const id = `path:${p.id}:${i}`;
          addNode(id, pt);
          if (prev) connect(prev, id);
          prev = id;
        }
      }
      for (const e of entrances) addNode(`entrance:${e.id}`, e.position);
      for (const ex of diorama.exits ?? []) addNode(`exit:${ex.id}`, ex.position);

      // Connect any two graph points that are near each other (shared
      // junctions: plaza hub, workshop entrance, gate threshold).
      const entries = [...pathPoints.entries()];
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          if (dist(entries[i][1], entries[j][1]) < 2.5) {
            connect(entries[i][0], entries[j][0]);
          }
        }
      }

      // Entrances/exits reach the closest path point within their arrival
      // forecourt (the entrance is ~7m south of the main axis start).
      const gateNodes = new Map<string, Vec3Like>();
      for (const e of [...entrances, ...(diorama.exits ?? [])]) gateNodes.set(`${e.id}`, e.position);
      for (const [id, p] of entries) {
        if (id.startsWith("entrance:") || id.startsWith("exit:")) continue;
        for (const [gid, g] of gateNodes) {
          if (dist(g, p) < 8) connect(`entrance:${gid}` in pathPoints ? `entrance:${gid}` : `exit:${gid}`, id);
        }
      }

      // Points inside the same zone are connected through that zone (the Plaza
      // is the hub that links the main axis to the workshop branch).
      const zoneContains = (z: LayoutZone, p: Vec3Like) => {
        const [w, d] = z.size;
        const minX = z.center.x - w / 2;
        const maxX = z.center.x + w / 2;
        const minZ = z.center.z - d / 2;
        const maxZ = z.center.z + d / 2;
        return p.x >= minX && p.x <= maxX && p.z >= minZ && p.z <= maxZ;
      };
      for (const zone of diorama.zones) {
        const zoneNode = `zone:${zone.id}`;
        for (const [id, p] of entries) {
          if (id.startsWith("zone:")) continue;
          if (zoneContains(zone, p)) connect(zoneNode, id);
        }
      }

      const reachableFrom = (startId: string): Set<string> => {
        const seen = new Set<string>([startId]);
        const queue = [startId];
        while (queue.length) {
          const cur = queue.shift()!;
          for (const nxt of adj[cur] ?? []) {
            if (!seen.has(nxt)) {
              seen.add(nxt);
              queue.push(nxt);
            }
          }
        }
        return seen;
      };

      const unreachable: string[] = [];
      for (const anchor of diorama.interactionAnchors) {
        let reached = false;
        for (const e of entrances) {
          const seen = reachableFrom(`entrance:${e.id}`);
          for (const n of seen) {
            const p = pathPoints.get(n);
            if (p && dist(anchor.position, p) <= anchor.stagingRadius + 1) {
              reached = true;
              break;
            }
          }
          if (reached) break;
        }
        if (!reached) unreachable.push(anchor.id);
      }
      return unreachable.length === 0
        ? pass(`navigation_reachability: all ${diorama.interactionAnchors.length} anchors reachable from entrances`)
        : fail(`navigation_reachability: anchors NOT reachable: ${unreachable.join(", ")}`);
    }

    case "max_significant_interiors": {
      const max = (rule.params["maxPerRegionalDiorama"] as number) ?? 2;
      const interiors = diorama.buildings.filter((b) => b.interior).length;
      return interiors <= max
        ? pass(`max_significant_interiors: ${interiors} ≤ ${max}`)
        : fail(`max_significant_interiors: ${interiors} > ${max}`);
    }

    case "single_layout_source":
    case "coordinate_space_separation":
    case "world_state_topology_stability":
    case "derived_visual_required":
    case "coexistence_required":
    case "dual_landmark_visibility":
    case "interaction_space_clear":
    case "functional_infrastructure_visible":
    case "multiple_destinations_visible":
    case "branch_access_parity":
    case "ordered_elevation":
    case "ordered_landmark_read":
      return info(`${rule.type}: manual/review gate — inspect layout evidence`);

    default:
      return info(`${rule.type}: unhandled rule type — manual gate`);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/** Validate the full layout document against the constraints document. */
export function validateLayout(layout: LayoutData, constraints: ConstraintsData): ValidationReport {
  const findings: ValidationFinding[] = [];

  for (const rule of constraints.global) {
    const ctx = { layout, dioramaId: "(global)", diorama: layout.dioramas["cuenca_de_ohm"] };
    findings.push(evalRule(rule, ctx));
  }

  for (const dioramaId of Object.keys(layout.dioramas)) {
    const rules = constraints[dioramaId];
    if (!Array.isArray(rules)) continue;
    const diorama = layout.dioramas[dioramaId];
    for (const rule of rules) {
      findings.push(evalRule(rule, { layout, dioramaId, diorama }));
    }
  }

  const errors = findings.filter((f) => f.status === "fail" && f.severity === "error");
  return {
    ok: errors.length === 0,
    findings,
  };
}

/** Report a validation run to the console (CLI use). */
export function printReport(report: ValidationReport): void {
  for (const f of report.findings) {
    const tag = f.status === "fail" ? (f.severity === "error" ? "✗" : "△") : f.status === "pass" ? "✓" : "·";
    console.log(`${tag} [${f.severity}] ${f.rule}: ${f.message}`);
  }
  const errors = report.findings.filter((f) => f.status === "fail" && f.severity === "error").length;
  const warnings = report.findings.filter((f) => f.status === "fail" && f.severity === "warning").length;
  console.log(`\n${errors} error(s), ${warnings} warning(s). ${report.ok ? "LAYOUT VALID" : "LAYOUT INVALID"}`);
}
