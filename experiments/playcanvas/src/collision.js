// Shared 2D collision rules. World obstacles use half-extents, and a moving
// actor is conservatively represented by the same expanded AABBs as canStand.
const finitePoint = point => Array.isArray(point) && point.length >= 2 && Number.isFinite(point[0]) && Number.isFinite(point[1]);
const walkableEverywhere = (x,z) => Boolean(true);
const CONTACT_SKIN = 1e-8;
const MIN_PARTIAL_ADVANCE = .0001;

export function overlapsObstacle(point, obstacle, radius = .34) {
  return Math.abs(point[0] - obstacle.x) < obstacle.w + radius
    && Math.abs(point[1] - obstacle.z) < obstacle.d + radius;
}

export function isPositionClear(point, bounds, obstacles = [], { radius = .34, margin = .6, isWalkable = walkableEverywhere } = {}) {
  if (!finitePoint(point) || !finitePoint(bounds) || bounds[0] <= margin * 2 || bounds[1] <= margin * 2) return false;
  if (Math.abs(point[0]) > bounds[0] / 2 - margin || Math.abs(point[1]) > bounds[1] / 2 - margin) return false;
  return isWalkable(...point) && !obstacles.some(obstacle => overlapsObstacle(point, obstacle, radius));
}

// A slab intersection against the OPEN interior of an expanded box. Touching
// its boundary is permitted, so walking along a wall does not snag on the wall.
// Unlike endpoint or fixed-distance samples, this cannot miss a thin obstacle.
function crossesObstacle(a, b, obstacle, radius) {
  let enter = -Infinity, leave = Infinity;
  for (let axis = 0; axis < 2; axis++) {
    const center = axis === 0 ? obstacle.x : obstacle.z;
    const extent = (axis === 0 ? obstacle.w : obstacle.d) + radius;
    const minimum = center - extent, maximum = center + extent;
    const change = b[axis] - a[axis];
    if (change === 0) {
      if (a[axis] <= minimum || a[axis] >= maximum) return false;
      continue;
    }
    const first = (minimum - a[axis]) / change;
    const last = (maximum - a[axis]) / change;
    enter = Math.max(enter, Math.min(first, last));
    leave = Math.min(leave, Math.max(first, last));
    if (enter >= leave) return false;
  }
  return Math.max(0, enter) < Math.min(1, leave);
}

/**
 * Exact continuous wall check, plus sampled terrain eligibility. Arbitrary
 * isWalkable predicates cannot be swept analytically; their maximum sampling
 * interval is surfaceStep. Thin walls/barriers belong in obstacles.
 */
export function isSegmentClear(a, b, bounds, obstacles = [], options = {}) {
  const { radius = .34, isWalkable = walkableEverywhere, surfaceStep = .1 } = options;
  // The sweep also detects embedded endpoints, so obstacle scans do not need
  // to be repeated by both endpoint checks on every navigation-grid edge.
  if (!isPositionClear(a, bounds, [], options) || !isPositionClear(b, bounds, [], options)) return false;
  if (obstacles.some(obstacle => crossesObstacle(a, b, obstacle, radius))) return false;
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const interval = Number.isFinite(surfaceStep) && surfaceStep > 0 ? surfaceStep : .1;
  const steps = Math.ceil(length / interval);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (!isWalkable(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)) return false;
  }
  return true;
}

// Axis-aligned sliding can reach an AABB contact analytically. Recomputing
// this same boundary is stable even if the next frame has a different delta;
// repeated bisection would creep a little closer on every blocked frame.
function stopAxisAtWall(position, target, axis, obstacles, radius) {
  const other = 1 - axis, direction = Math.sign(target[axis] - position[axis]);
  for (const obstacle of obstacles) {
    const otherCenter = other === 0 ? obstacle.x : obstacle.z;
    const otherExtent = (other === 0 ? obstacle.w : obstacle.d) + radius;
    if (Math.abs(position[other] - otherCenter) >= otherExtent) continue;
    const center = axis === 0 ? obstacle.x : obstacle.z;
    const extent = (axis === 0 ? obstacle.w : obstacle.d) + radius;
    const near = center - extent, far = center + extent;
    if (direction > 0 && position[axis] <= near && target[axis] > near) {
      target[axis] = Math.max(position[axis], near - CONTACT_SKIN);
    } else if (direction < 0 && position[axis] >= far && target[axis] < far) {
      target[axis] = Math.min(position[axis], far + CONTACT_SKIN);
    }
  }
}

/**
 * Pure bounded movement with continuous wall checks and sliding. Returns a new
 * [x,z] pair; never mutates the actor, obstacle list, or requested delta.
 *
 * Invalid/embedded starts stay put. Spawn/save recovery must choose a valid
 * position explicitly instead of movement silently teleporting through a wall.
 */
export function moveWithCollisions(start, delta, bounds, obstacles = [], options = {}) {
  const position = [...start];
  if (!finitePoint(delta) || !isPositionClear(position, bounds, obstacles, options)) return position;
  const { radius = .34, margin = .6, maxStep = .1 } = options;
  const halfX = bounds[0] / 2 - margin, halfZ = bounds[1] / 2 - margin;
  const goal = [Math.max(-halfX, Math.min(halfX, start[0] + delta[0])), Math.max(-halfZ, Math.min(halfZ, start[1] + delta[1]))];
  const distance = Math.hypot(goal[0] - start[0], goal[1] - start[1]);
  if (distance === 0) return position;
  const stride = Number.isFinite(maxStep) && maxStep > 0 ? Math.max(.001, Math.min(.25, maxStep)) : .1;
  const count = Math.ceil(distance / stride);
  const step = [(goal[0] - start[0]) / count, (goal[1] - start[1]) / count];
  const clear = (a, b) => isSegmentClear(a, b, bounds, obstacles, options);
  for (let i = 0; i < count; i++) {
    const target = [Math.max(-halfX, Math.min(halfX, position[0] + step[0])), Math.max(-halfZ, Math.min(halfZ, position[1] + step[1]))];
    if (clear(position, target)) {
      position[0] = target[0]; position[1] = target[1];
      continue;
    }
    // X then Z gives deterministic sliding. Both segments are checked from the
    // position actually reached, so an L-shaped corner cannot skip a collision.
    for (let axis = 0; axis < 2; axis++) {
      if (step[axis] === 0) continue;
      const axisTarget = [...position]; axisTarget[axis] = target[axis];
      stopAxisAtWall(position, axisTarget, axis, obstacles, radius);
      if (clear(position, axisTarget)) { position[axis] = axisTarget[axis]; continue; }
      // Only a non-analytic terrain predicate remains to approximate. Keep
      // microscopically small residual motion from making an idle actor jitter.
      let low = 0, high = 1;
      for (let iteration = 0; iteration < 10; iteration++) {
        const middle = (low + high) / 2;
        const candidate = [...position]; candidate[axis] += (axisTarget[axis] - position[axis]) * middle;
        if (clear(position, candidate)) low = middle; else high = middle;
      }
      const advance = (axisTarget[axis] - position[axis]) * low;
      if (Math.abs(advance) > MIN_PARTIAL_ADVANCE) position[axis] += advance;
    }
  }
  return position;
}
