import * as THREE from 'three';

// Orthographic rays are parallel: player position, viewport and zoom translate
// or scale the picture without changing which fixed surface hides another.
export const GAME_CAMERA_OFFSET = Object.freeze([0, 13.5, 25]);
const towardCamera = new THREE.Vector3(...GAME_CAMERA_OFFSET).normalize();
const screenRight = new THREE.Vector3(1, 0, 0);
const screenUp = towardCamera.clone().cross(screenRight).normalize();
const rayDistance = 180;
const round = number => Math.round(number * 1000) / 1000;
const point = vector => vector.toArray().map(round);

function ancestors(object) {
  const result = [];
  for (let current = object; current; current = current.parent) result.push(current);
  return result;
}

function screenBounds(meshes) {
  const bounds = { left: Infinity, right: -Infinity, bottom: Infinity, top: -Infinity };
  const vertex = new THREE.Vector3();
  for (const mesh of meshes) {
    const positions = mesh.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
      const x = vertex.dot(screenRight), y = vertex.dot(screenUp);
      bounds.left = Math.min(bounds.left, x); bounds.right = Math.max(bounds.right, x);
      bounds.bottom = Math.min(bounds.bottom, y); bounds.top = Math.max(bounds.top, y);
    }
  }
  return bounds;
}

function samplesOnFront(mesh, columns, rows) {
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox;
  return rows.flatMap(y => columns.map(x => new THREE.Vector3(
    THREE.MathUtils.lerp(box.min.x, box.max.x, x),
    THREE.MathUtils.lerp(box.min.y, box.max.y, y),
    box.max.z + .015,
  ).applyMatrix4(mesh.matrixWorld)));
}

function collectScene(world, buildings) {
  const buildingGroups = new Map(buildings.map(building => [building.group, building]));
  const actors = new Set([world.player, world.ohm, ...(world.actors || []).map(actor => actor.g)]);
  const entries = [];
  world.root.traverse(mesh => {
    if (!mesh.isMesh || mesh.isInstancedMesh || !mesh.geometry.attributes.position) return;
    const parents = ancestors(mesh);
    if (parents.some(parent => !parent.visible || actors.has(parent))) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    if (materials.every(material => !material.visible || material.opacity < .95 || material.depthWrite === false)) return;
    const building = parents.map(parent => buildingGroups.get(parent)).find(Boolean);
    const bounds = new THREE.Box3().setFromObject(mesh);
    if (!building && (bounds.max.y < .3 || materials.includes(world.m.grass) || materials.includes(world.m.path))) return;
    const alpha = materials.some(material => material.alphaTest > 0);
    const interaction = parents.find(parent => parent.userData.interaction)?.userData.interaction;
    const named = parents.find(parent => parent.name);
    const center = bounds.getCenter(new THREE.Vector3());
    const label = building?.id || interaction?.id || `${named?.name || (alpha ? 'alpha-billboard' : mesh.geometry.type)}@${round(center.x)},${round(center.z)}`;
    entries.push({ mesh, building, bounds, alpha, label });
  });
  return entries;
}

function rayCoverage(samples, entries, owner, alpha = false) {
  const candidates = entries.filter(entry => entry.building !== owner && entry.alpha === alpha);
  const meshes = candidates.map(entry => entry.mesh), byMesh = new Map(candidates.map(entry => [entry.mesh, entry]));
  const ray = new THREE.Raycaster(new THREE.Vector3(), towardCamera.clone().negate(), 0, rayDistance - .03);
  const blocked = [];
  for (const sample of samples) {
    ray.ray.origin.copy(sample).addScaledVector(towardCamera, rayDistance);
    const hit = ray.intersectObjects(meshes, false)[0];
    if (hit) blocked.push({ sample: point(sample), blocker: byMesh.get(hit.object).label, hit: point(hit.point) });
  }
  return { total: samples.length, blocked: blocked.length, fraction: blocked.length / samples.length, blockers: [...new Set(blocked.map(hit => hit.blocker))], samples: blocked };
}

function intersectionSize(a, b) {
  return new THREE.Vector3(Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x), Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y), Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z));
}

function triangles(mesh) {
  const position = mesh.geometry.attributes.position, index = mesh.geometry.index;
  const result = [];
  for (let i = 0; i < (index?.count ?? position.count); i += 3) {
    const vertices = [0, 1, 2].map(offset => new THREE.Vector3().fromBufferAttribute(position, index ? index.getX(i + offset) : i + offset).applyMatrix4(mesh.matrixWorld));
    result.push(new THREE.Triangle(...vertices));
  }
  return result;
}

function coplanarIntersection(first, second) {
  const normal = first.getNormal(new THREE.Vector3());
  if (Math.abs(normal.dot(second.getNormal(new THREE.Vector3()))) < .999999) return null;
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, first.a);
  if ([second.a, second.b, second.c].some(vertex => Math.abs(plane.distanceToPoint(vertex)) > .001)) return null;
  const dropped = normal.toArray().map(Math.abs).indexOf(Math.max(...normal.toArray().map(Math.abs)));
  const axes = [0, 1, 2].filter(axis => axis !== dropped);
  const project = vertex => axes.map(axis => vertex.getComponent(axis));
  const cross = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  let polygon = [first.a, first.b, first.c].map(project);
  const clip = [second.a, second.b, second.c].map(project), winding = Math.sign(cross(...clip));
  for (let i = 0; i < 3 && polygon.length; i++) {
    const a = clip[i], b = clip[(i + 1) % 3], input = polygon;
    polygon = [];
    for (let j = 0; j < input.length; j++) {
      const start = input[j], end = input[(j + 1) % input.length];
      const s = cross(a, b, start) * winding, e = cross(a, b, end) * winding;
      if (s >= 0) polygon.push(start);
      if ((s >= 0) !== (e >= 0)) {
        const t = s / (s - e);
        polygon.push([start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t]);
      }
    }
  }
  const area = Math.abs(polygon.reduce((sum, p, i) => { const q = polygon[(i + 1) % polygon.length]; return sum + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  if (area < .0025) return null;
  const center = polygon.reduce((sum, p) => [sum[0] + p[0] / polygon.length, sum[1] + p[1] / polygon.length], [0, 0]);
  const hit = new THREE.Vector3();
  axes.forEach((axis, i) => hit.setComponent(axis, center[i]));
  hit.setComponent(dropped, -(plane.constant + normal.dot(hit)) / normal.getComponent(dropped));
  return point(hit);
}

// Actual triangle cuts or coplanar overlap count. Envelope overlap alone is
// insufficient: one sloping roof can pass above another.
function roofCut(a, b) {
  const ray = new THREE.Ray(), hit = new THREE.Vector3(), barycentric = new THREE.Vector3();
  for (const [first, second] of [[a, b], [b, a]]) {
    for (const triangle of first) for (const target of second) {
      const coplanar = coplanarIntersection(triangle, target);
      if (coplanar) return coplanar;
      for (const [start, end] of [[triangle.a, triangle.b], [triangle.b, triangle.c], [triangle.c, triangle.a]]) {
        const length = start.distanceTo(end);
        ray.set(start, end.clone().sub(start).normalize());
        if (!ray.intersectTriangle(target.a, target.b, target.c, false, hit)) continue;
        const distance = start.distanceTo(hit);
        target.getBarycoord(hit, barycentric);
        if (distance > .005 && distance < length - .005 && Math.min(...barycentric.toArray()) > .001) return point(hit);
      }
    }
  }
  return null;
}

/** Measures geometry only. Alpha pixels, lighting, framing and art direction need visual QA. */
export function auditComposition(world) {
  world.root.updateMatrixWorld(true);
  const buildings = world.auditBuildings.map((entry, index) => {
    const authored = world.layout.buildings.find(item => Math.hypot(item.x - entry.x, item.z - entry.z) < .05);
    const metadata = entry.group.userData.architecture;
    return { ...entry, id: metadata.id || authored?.id || `building-${index}`, label: metadata.label || authored?.label || entry.group.name };
  });
  const entries = collectScene(world, buildings);
  const reports = buildings.map(building => {
    const door = building.group.getObjectByName('building-entrance-door');
    const doorPanel = door?.children.find(mesh => mesh.isMesh && mesh.material === world.m.wood);
    const wall = building.group.getObjectByName('building-walls');
    if (!doorPanel || !wall) throw new Error(`${world.area.id}/${building.id}: missing actual door panel or wall geometry`);
    const doorSamples = samplesOnFront(doorPanel, [.18, .5, .82], [.15, .5, .85]);
    const facadeSamples = samplesOnFront(wall, [.08, .29, .5, .71, .92], [.2, .5, .8]);
    const meshes = entries.filter(entry => entry.building === building).map(entry => entry.mesh);
    const bounds = new THREE.Box3().setFromObject(building.group);
    return {
      id: building.id, label: building.label, position: [building.x, building.z],
      door: rayCoverage(doorSamples, entries, building), facade: rayCoverage(facadeSamples, entries, building),
      alphaDoor: rayCoverage(doorSamples, entries, building, true), alphaFacade: rayCoverage(facadeSamples, entries, building, true),
      screen: screenBounds(meshes),
      outside: { west: Math.max(0, -world.bounds[0] / 2 - bounds.min.x), east: Math.max(0, bounds.max.x - world.bounds[0] / 2), north: Math.max(0, -world.bounds[1] / 2 - bounds.min.z), south: Math.max(0, bounds.max.z - world.bounds[1] / 2) },
    };
  });
  const silhouetteOverlaps = [], roofBoundsOverlaps = [], roofSurfaceIntersections = [];
  for (let i = 0; i < reports.length; i++) for (let j = i + 1; j < reports.length; j++) {
    const a = reports[i].screen, b = reports[j].screen;
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.top, b.top) - Math.max(a.bottom, b.bottom));
    const fraction = width * height / Math.min((a.right - a.left) * (a.top - a.bottom), (b.right - b.left) * (b.top - b.bottom));
    if (fraction > .02) silhouetteOverlaps.push({ a: reports[i].id, b: reports[j].id, fraction: round(fraction), width: round(width), height: round(height), advisory: 'Projected bounding envelopes, not opaque pixel coverage' });
    const roofsA = entries.filter(entry => entry.building === buildings[i] && entry.mesh.name === 'slate-roof-surfaces');
    const roofsB = entries.filter(entry => entry.building === buildings[j] && entry.mesh.name === 'slate-roof-surfaces');
    for (const roofA of roofsA) for (const roofB of roofsB) {
      const size = intersectionSize(roofA.bounds, roofB.bounds);
      if (size.x > .01 && size.y > .01 && size.z > .01) {
        roofBoundsOverlaps.push({ a: reports[i].id, b: reports[j].id, overlap: point(size), advisory: 'Intersecting 3D roof envelopes require triangle/visual confirmation' });
        const cut = roofCut(triangles(roofA.mesh), triangles(roofB.mesh));
        if (cut) roofSurfaceIntersections.push({ a: reports[i].id, b: reports[j].id, point: cut });
      }
    }
  }
  return { area: world.area.id, cameraOffset: [...GAME_CAMERA_OFFSET], buildings: reports, silhouetteOverlaps, roofBoundsOverlaps, roofSurfaceIntersections };
}

export function compositionFailures(report, { maximumDoorOcclusion = 2 / 9, maximumFacadeOcclusion = .4, boundaryTolerance = .05 } = {}) {
  return [...report.buildings.flatMap(building => {
    const prefix = `${report.area}/${building.id}`;
    const failures = [];
    if (building.door.fraction > maximumDoorOcclusion) failures.push(`${prefix}: ${building.door.blocked}/${building.door.total} door samples hidden by ${building.door.blockers.join(', ')}`);
    if (building.facade.fraction > maximumFacadeOcclusion) failures.push(`${prefix}: ${building.facade.blocked}/${building.facade.total} facade samples hidden by ${building.facade.blockers.join(', ')}`);
    for (const [side, distance] of Object.entries(building.outside)) if (distance > boundaryTolerance) failures.push(`${prefix}: visible geometry crosses ${side} boundary by ${round(distance)} m`);
    return failures;
  }), ...(report.roofSurfaceIntersections || []).map(hit => `${report.area}: roofs ${hit.a} and ${hit.b} intersect at ${hit.point.join(', ')}`)];
}
