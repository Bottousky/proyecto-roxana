// Stairs — reusable stair flights that connect two elevation tiers.
// Each step is a Box of (width × 0.18m rise × 0.5m run), repeated stepCount
// times. Stairs follow world-XZ coordinates; "axis" tells us whether the
// flight runs along X (east/west) or Z (north/south).
//
// Stairs are placed by world.ts based on STEPS in topology.ts.

import * as THREE from "three";
import type { MaterialKit } from "./materials.ts";
import type { StepDef } from "../world/topology.ts";

export function buildStairs(kit: MaterialKit, def: StepDef): THREE.Group {
  const group = new THREE.Group();
  group.name = `stairs_${def.from.x.toFixed(0)}_${def.from.z.toFixed(0)}`;

  const riseTotal = def.to.y - def.from.y;
  const runTotal = Math.hypot(def.to.x - def.from.x, def.to.z - def.from.z);
  if (runTotal === 0) return group;
  const dx = (def.to.x - def.from.x) / runTotal;
  const dz = (def.to.z - def.from.z) / runTotal;
  const stepRise = riseTotal / def.stepCount;
  const stepRun = runTotal / def.stepCount;

  for (let i = 0; i < def.stepCount; i++) {
    const x = def.from.x + dx * stepRun * (i + 0.5);
    const z = def.from.z + dz * stepRun * (i + 0.5);
    const y = def.from.y + stepRise * i;
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(def.width, Math.max(0.18, stepRise), stepRun * 0.95),
      kit.stone,
    );
    step.position.set(x, y + stepRise / 2, z);
    step.castShadow = true;
    step.receiveShadow = true;
    group.add(step);
  }

  return group;
}
