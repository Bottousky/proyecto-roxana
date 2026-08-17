// topology.ts — re-export of the layout-derived runtime spatial model.
//
// History: this module used to hardcode the Cuenca region grid, electrical
// nodes/cables, stairs and distant landmarks. That data now derives from
// arc1-layout.json via world/layoutRuntime.ts, so this file only re-exports
// the runtime model. Keeping this module as the import surface means the
// environment modules (terrain, cables, landmarks, stairs, world) don't have
// to know where the truth lives.
//
// The layout JSON wins over this module: if runtime and JSON disagree, the
// change is incomplete until the runtime is migrated (see
// docs/20-worlds/ohmdal/world/layout/README.md §7).

export {
  REGIONS,
  REGION_PLACEMENT,
  NODES,
  CABLES,
  STEPS,
  LANDMARKS,
  WORLD_BOUNDS,
  regionAt,
  type RegionDef,
  type NodeDef,
  type CableDef,
  type StepDef,
  type LandmarkDef,
} from "./layoutRuntime.ts";
