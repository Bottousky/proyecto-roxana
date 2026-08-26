# Ohmdal Navigation & Collision Contract

## Problem

The current runtime uses hand-authored 2D AABB collision checks. Human playtest found visible walls that can be crossed and transitions that can spawn the player facing the door just crossed. Golden Path does not exercise hostile navigation and therefore did not catch all of this.

## Principles

1. Visible load-bearing solid geometry must not silently lack collision.
2. Collision ownership is zone-local even if storage remains compact.
3. Doors/transitions are data contracts, not scattered teleport yaw literals.
4. The player spawns facing into the destination area.
5. Closed doors/gates block; open transitions deliberately create an aperture.
6. Do not add a physics engine unless the lightweight deterministic model proves insufficient.

## Collision ownership

Prefer a registry equivalent to:

```ts
type ZoneId = 'plaza' | 'workshop' | 'manantial' | 'castle' | 'forge-terraces' | 'lighthouse';
type CollisionKind = 'solid' | 'trigger' | 'portal';
```

Only active-zone solids should participate in normal movement checks. Shared/threshold colliders must be explicitly documented.

## Solid geometry helper

For authored load-bearing walls/large blockers, prefer an API that couples rendering and collision, e.g. `addSolidBox(...)`, or another mechanism with the same invariant. Decorative/scenic geometry uses a clearly non-solid helper.

The exact helper name is not canonical; the invariant is.

## Transition anchors

Replace memorized target yaw where practical with semantic destination anchors:

```ts
interface SpawnAnchor {
  position: [number, number, number];
  lookAt?: [number, number, number];
  directionIntoZone?: [number, number, number];
}
```

Runtime derives yaw from `lookAt` or `directionIntoZone`.

Required transitions include at least:

- initial Portal arrival → Plaza/Ohm;
- Plaza ↔ Taller;
- Plaza ↔ Manantial;
- Plaza ↔ Castillo;
- Castillo ↔ Forja/Terrazas;
- Forja/Terrazas ↔ Faro;
- return path transitions back to Plaza.

## Spawn assertions

For every transition:

- spawn is not inside a solid collider;
- spawn lies within the intended active zone;
- forward vector points into the destination, not at the door behind;
- trigger cannot immediately ping-pong back without intentional player movement.

A useful orientation assertion is conceptually:

```text
dot(cameraForward, directionIntoZone) >= 0.7
```

## Automated navigation tests

### Door-facing contract

Exercise every transition and assert destination region, position safety and facing.

### Wall challenge

For representative load-bearing walls in every authored zone:

1. place/move player in front of wall;
2. hold forward/diagonal movement for a bounded interval;
3. assert penetration beyond tolerance does not occur.

Cover corners and closed gates, not only straight wall centers.

### Golden Path

Golden Path remains mandatory after changes, but does not replace collision challenge tests.

## Debug evidence

Provide a deterministic collision diagnostic. It may be a debug overlay, line boxes, or a test hook returning active collider data. It must make it possible to compare visible load-bearing geometry against collision coverage without guessing.

Suggested visual legend if rendered:

- solid = boxes/lines;
- trigger = distinct debug primitive;
- portal = arrow/plane;
- player capsule/radius = visible marker.

Debug visuals are never player-facing shipping art.

## Scenic interaction

Scenic shell/far-horizon geometry is non-solid by default. If scenic geometry bounds playable space, either move the actual solid gameplay boundary to match it or explicitly register the scenic form as a blocker. Never rely on appearance alone.
