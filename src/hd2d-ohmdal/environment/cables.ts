// Visible copper cables that connect the electrical nodes.
//
// Each cable samples the terrain height at several points along its path and
// renders as a series of short box segments that rest on the ground. This
// replaces the older single-segment trace that floated at a fixed y=0.04
// (which intersected the Portal platform at 0.4 and floated 1.5m above the
// Manantial patio at -1.5).
//
// Broken cables render with a 0.3m gap in the middle and a small pair of
// copper "sparking" posts straddling the gap, so the player can read the
// break from a few meters away (before the interaction prompt appears).
//
// `refresh()` should be called after any change to the electrical graph
// (i.e. after `electrical.repair(id)`) so the visual reflects the new state.

import * as THREE from "three";
import type { CableDef } from "../world/topology.ts";
import type { ElectricalGraph, CableState } from "../engine/electricalGraph.ts";

const SAMPLES = 7;          // sample count per cable path
const GAP = 0.3;            // visible gap in meters when broken
const CABLE_W = 0.18;       // cable thickness
const CABLE_H = 0.06;       // cable height
const Y_OFFSET = 0.04;      // lift above the terrain so the cable is visible
const POST_H = 0.34;         // sparking post height
const POST_R = 0.055;        // sparking post radius
const POST_OFFSET = 0.05;   // gap between the broken cable end and the post base

export interface CableVisuals {
  group: THREE.Group;
  /** Update the visual state of every cable. Call after any state change. */
  refresh: () => void;
  /** Globally tone the intact cable material (0 = dormant, 1 = fully live). */
  setAwake: (level: number) => void;
  /** Per-frame update (spark orb pulse). Pass elapsed time in seconds. */
  update: (t: number) => void;
}

interface CableBundle {
  /** Sub-group with every segment + the gap indicator. */
  group: THREE.Group;
  /** Two short upright posts that straddle the gap (only visible if broken). */
  gap: THREE.Group;
  /** Ground segments. Material is swapped on state change. */
  segments: THREE.Mesh[];
  status: CableState;
}

/**
 * Build the visible copper cable network from the topology.
 *
 * `groundYAt` is the same function the world uses to place the player on
 * the ground. Sampling it at multiple points along each cable makes the
 * cable visibly rest on the terrain (instead of floating above the
 * Manantial or cutting into the Portal platform).
 */
export function buildCables(
  scene: THREE.Scene,
  groundYAt: (x: number, z: number) => number,
  cables: CableDef[],
  electrical: ElectricalGraph,
): CableVisuals {
  const group = new THREE.Group();
  group.name = "cables";
  scene.add(group);

  // Shared geometry — every segment uses a 1m-long box scaled to the
  // real segment length on the z axis.
  const segGeom = new THREE.BoxGeometry(CABLE_W, CABLE_H, 1);
  // Translate so the segment is centered at the origin on z (scaling z
  // around the local origin keeps both ends symmetric).
  segGeom.translate(0, 0, 0);

  const postGeom = new THREE.CylinderGeometry(POST_R, POST_R * 1.4, POST_H, 6);
  postGeom.translate(0, POST_H / 2, 0);
  // Spark orbs are sized to be readable from the default camera distance
  // (the player must be able to spot a broken cable from several meters
  // away, before the interaction prompt appears). The old 0.063m orbs were
  // ~10px on screen — invisible in normal exploration.
  const orbGeom = new THREE.SphereGeometry(POST_R * 3.0, 10, 8);
  orbGeom.translate(0, POST_H + POST_R * 1.2, 0);

  // Two materials, swapped per segment on state change. Awake glow is
  // driven by emissive on the intact material.
  const matIntact = new THREE.MeshStandardMaterial({
    color: 0x7a5232,
    roughness: 0.55,
    metalness: 0.55,
    emissive: 0x000000,
    emissiveIntensity: 0,
  });
  const matBroken = new THREE.MeshStandardMaterial({
    color: 0x3a1a08,
    roughness: 0.7,
    metalness: 0.4,
  });
  const matPost = new THREE.MeshStandardMaterial({
    color: 0x6a4028,
    roughness: 0.45,
    metalness: 0.6,
    emissive: 0xb05020,
    emissiveIntensity: 0.9,
  });
  // Spark orb (slightly warmer + brighter than the post).
  const matOrb = new THREE.MeshStandardMaterial({
    color: 0xffc080,
    roughness: 0.2,
    metalness: 0.0,
    emissive: 0xffa040,
    emissiveIntensity: 1.6,
  });

  const perCable: CableBundle[] = [];

  for (const cable of cables) {
    const sub = new THREE.Group();
    sub.name = `cable_${cable.id}`;
    group.add(sub);

    // ---- Sample the path ----
    const dx = cable.to.x - cable.from.x;
    const dz = cable.to.z - cable.from.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.1) continue;

    const points: THREE.Vector3[] = [];
    for (let i = 0; i < SAMPLES; i++) {
      // Sample at segment centers (i + 0.5) / SAMPLES so we never sample
      // exactly at an endpoint (which is shared with another cable).
      const t = (i + 0.5) / SAMPLES;
      const x = cable.from.x + dx * t;
      const z = cable.from.z + dz * t;
      const y = groundYAt(x, z) + Y_OFFSET;
      points.push(new THREE.Vector3(x, y, z));
    }

    // ---- Build segments ----
    const segments: THREE.Mesh[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const segLen = a.distanceTo(b);
      if (segLen < 0.01) continue;

      const seg = new THREE.Mesh(segGeom, matIntact);
      seg.position.set(
        (a.x + b.x) / 2,
        (a.y + b.y) / 2,
        (a.z + b.z) / 2,
      );
      // The shared BoxGeometry is 1m long on +Z; scale.z to the real
      // segment length so the geometry stretches correctly.
      seg.scale.set(1, 1, segLen);
      // Rotate the segment so its local +Z aligns with the (a → b) direction.
      // atan2(dx, dz) is the angle around Y from world +Z to the direction.
      seg.rotation.y = Math.atan2(dx, dz);
      seg.receiveShadow = true;
      sub.add(seg);
      segments.push(seg);
    }

    // ---- Gap indicator (two short upright posts at the cable midpoint) ----
    const gap = new THREE.Group();
    gap.name = `cable_${cable.id}_gap`;
    const midIdx = (points.length - 1) / 2;
    const aMid = points[Math.floor(midIdx)];
    const bMid = points[Math.ceil(midIdx)];
    const mid = aMid.clone().add(bMid).multiplyScalar(0.5);
    // Direction along the cable in the XZ plane.
    const dir = new THREE.Vector3(dx, 0, dz).normalize();
    for (const sign of [-1, 1] as const) {
      const postGroup = new THREE.Group();
      const post = new THREE.Mesh(postGeom, matPost);
      const orb = new THREE.Mesh(orbGeom, matOrb);
      postGroup.add(post);
      postGroup.add(orb);
      // Place at mid ± dir * (GAP/2 + POST_OFFSET).
      const along = (GAP / 2 + POST_OFFSET) * sign;
      postGroup.position.set(
        mid.x + dir.x * along,
        mid.y,
        mid.z + dir.z * along,
      );
      // Subtle visual jitter so the orbs don't look frozen.
      postGroup.userData.sparkSign = sign;
      postGroup.userData.sparkBaseY = mid.y;
      gap.add(postGroup);
    }
    gap.visible = cable.state === "broken";
    sub.add(gap);

    perCable.push({ group: sub, gap, segments, status: cable.state });
  }

  let awake = 0;

  const refresh = () => {
    for (let i = 0; i < cables.length; i++) {
      const cable = cables[i];
      const c = perCable[i];
      if (!c) continue;
      const newState: CableState = electrical.getCableState(cable.id) ?? cable.state;
      if (newState !== c.status) {
        c.status = newState;
        c.gap.visible = newState === "broken";
        const mat = newState === "broken" ? matBroken : matIntact;
        for (const s of c.segments) s.material = mat;
      }
    }
  };

  const setAwake = (level: number) => {
    awake = Math.max(0, Math.min(1, level));
    // Slight emissive sheen on intact cables when the world is live.
    matIntact.emissive.setHex(0x6a3010);
    matIntact.emissiveIntensity = 0.45 * awake;
    // Orbs pulse a little faster when the world is live.
    // (Pulsing is applied below in the update step.)
  };

  // The world drives a per-frame update so the spark orbs can pulse.
  // We return a small update closure for the world to call; since the
  // cables module is otherwise stateless, this is the cleanest seam.
  const update = (t: number) => {
    // Subtle orb pulse + slight wobble. The pulse is strong enough to draw
    // the eye to a broken cable from the default camera distance, but the
    // frequency stays low so it doesn't steal focus from gameplay.
    const wobble = Math.sin(t * 5) * 0.08;
    for (const c of perCable) {
      for (const postGroup of c.gap.children) {
        const u = postGroup.userData as { sparkSign: number; sparkBaseY: number };
        const orb = postGroup.children[1] as THREE.Mesh | undefined;
        if (orb) {
          const mat = orb.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 1.4 + 1.0 * awake + wobble * 3;
        }
        postGroup.position.y = u.sparkBaseY + wobble * 0.5;
      }
    }
  };

  // Initial paint so the first frame matches the topology state.
  refresh();

  return { group, refresh, setAwake, update };
}
