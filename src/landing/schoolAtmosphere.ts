import * as THREE from 'three';

export interface SchoolAtmosphere {
  /** Time is elapsed seconds; reduced motion freezes all decorative animation. */
  update(time: number, reducedMotion: boolean, selected: string | null): void;
  dispose(): void;
}

const WORLD_ACCENTS = [
  { id: 'electronica', color: 0x72ddd3 },
  { id: 'programacion', color: 0x72bfe3 },
  { id: 'matematica', color: 0xeac27c },
  { id: 'fisica', color: 0xb2abef },
] as const;

function chamferedRectangle(width: number, depth: number, corner: number): THREE.Shape {
  const x = width / 2;
  const z = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-x + corner, -z);
  shape.lineTo(x - corner, -z);
  shape.lineTo(x, -z + corner);
  shape.lineTo(x, z - corner);
  shape.lineTo(x - corner, z);
  shape.lineTo(-x + corner, z);
  shape.lineTo(-x, z - corner);
  shape.lineTo(-x, -z + corner);
  shape.closePath();
  return shape;
}

function plinthGeometry(width: number, depth: number, height: number): THREE.BufferGeometry {
  const geometry = new THREE.ExtrudeGeometry(chamferedRectangle(width, depth, 1.7), {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: .13,
    bevelThickness: .1,
    curveSegments: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  // An architectural gradient works with the school's baked unlit materials.
  // Top, bevel and sides read separately without adding dynamic shadow maps.
  const normal = geometry.getAttribute('normal');
  const colors = new Float32Array(normal.count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < normal.count; i++) {
    const top = Math.max(0, normal.getY(i));
    const side = Math.max(0, normal.getZ(i)) * .06;
    color.setRGB(.025 + top * .032 + side, .04 + top * .036 + side, .045 + top * .042 + side);
    color.multiplyScalar(.5);
    color.toArray(colors, i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  // ExtrudeGeometry creates front/side material groups. A single material
  // keeps each full platform layer at one draw call.
  geometry.clearGroups();
  return geometry;
}

function softTexture(): THREE.DataTexture {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.hypot((x + .5) / size * 2 - 1, (y + .5) / size * 2 - 1);
      const alpha = Math.pow(Math.max(0, 1 - distance), 2.4);
      const i = (y * size + x) * 4;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = 255;
      pixels[i + 3] = Math.round(alpha * 255);
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

/**
 * A restrained model base and floor markers at the four real classroom doors.
 * No standalone decorative portals compete with the teaching apparatus.
 */
export function installSchoolAtmosphere(
  scene: THREE.Scene,
  rooms: Map<string, THREE.Object3D>,
): SchoolAtmosphere {
  const root = new THREE.Group();
  root.name = 'RX_school_architectural_atmosphere';
  scene.add(root);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const texture = softTexture();
  const retainGeometry = <T extends THREE.BufferGeometry>(value: T): T => {
    geometries.add(value);
    return value;
  };
  const retainMaterial = <T extends THREE.Material>(value: T): T => {
    materials.add(value);
    return value;
  };
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh => {
    const object = new THREE.Mesh(retainGeometry(geometry), retainMaterial(material));
    object.raycast = () => {};
    root.add(object);
    return object;
  };

  const stone = retainMaterial(new THREE.MeshBasicMaterial({ vertexColors: true }));
  mesh(plinthGeometry(51.4, 33.3, .58), stone).position.set(0, -.94, -2.4);
  mesh(plinthGeometry(52.2, 34.1, .19), stone).position.set(0, -1.33, -2.4);

  const trimShape = chamferedRectangle(51.65, 33.55, 1.7);
  const inner = chamferedRectangle(51.47, 33.37, 1.65);
  trimShape.holes.push(new THREE.Path(inner.getPoints().reverse()));
  const trimGeometry = new THREE.ShapeGeometry(trimShape);
  trimGeometry.rotateX(-Math.PI / 2);
  const gold = retainMaterial(new THREE.MeshBasicMaterial({ color: 0x897354 }));
  mesh(trimGeometry, gold).position.set(0, -.79, -2.4);

  const shadowMaterial = retainMaterial(new THREE.MeshBasicMaterial({
    color: 0x000000, map: texture, transparent: true, opacity: .52,
    depthWrite: false, toneMapped: false,
  }));
  const shadow = mesh(new THREE.PlaneGeometry(85, 69), shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -1.56, -2.4);
  shadow.renderOrder = -5;

  // Bronze brackets articulate the platform edges, using one instanced mesh.
  const bracketGeometry = retainGeometry(new THREE.BoxGeometry(.12, .46, 1.3));
  const brackets = new THREE.InstancedMesh(bracketGeometry, gold, 12);
  const transform = new THREE.Object3D();
  for (let i = 0; i < 12; i++) {
    const side = i < 6 ? -1 : 1;
    transform.position.set(side * 25.7, -.66, -15.5 + (i % 6) * 5.2);
    transform.updateMatrix();
    brackets.setMatrixAt(i, transform.matrix);
  }
  brackets.raycast = () => {};
  root.add(brackets);
  const platformObjects = [...root.children];

  const haloGeometry = retainGeometry(new THREE.RingGeometry(.48, .52, 36));
  haloGeometry.rotateX(-Math.PI / 2);
  const haloMaterial = retainMaterial(new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: .32, depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  const halos = new THREE.InstancedMesh(haloGeometry, haloMaterial, WORLD_ACCENTS.length);
  halos.raycast = () => {};
  halos.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  // Instance transforms follow animated parents, so do not cache a static bound.
  halos.frustumCulled = false;
  root.add(halos);

  const anchors: Array<{
    id: string;
    room: THREE.Object3D;
    point: THREE.Vector3;
    index: number;
  }> = [];
  WORLD_ACCENTS.forEach(({ id, color }, index) => {
    const room = rooms.get(id);
    if (!room) {
      transform.scale.setScalar(0);
      transform.updateMatrix();
      halos.setMatrixAt(index, transform.matrix);
      transform.scale.setScalar(1);
      return;
    }
    room.updateWorldMatrix(true, true);
    const side = id === 'matematica' || id === 'electronica' ? -1 : 1;
    const doorNorth = id === 'matematica' || id === 'fisica' ? 7.2 : 1;
    const point = new THREE.Vector3(side * 10.7, room.getWorldPosition(new THREE.Vector3()).y + .37, -doorNorth);
    room.worldToLocal(point);
    const tint = new THREE.Color(color);
    halos.setColorAt(index, tint);
    anchors.push({ id, room, point, index });
  });

  // Sparse slow dust in the warm interior air; deterministic on every visit.
  const dustPositions = new Float32Array(84 * 3);
  let seed = 1948;
  const random = (): number => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < dustPositions.length; i += 3) {
    dustPositions[i] = (random() - .5) * 44;
    dustPositions[i + 1] = 3 + random() * 9;
    dustPositions[i + 2] = -14 + random() * 26;
  }
  const dustGeometry = retainGeometry(new THREE.BufferGeometry());
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = retainMaterial(new THREE.PointsMaterial({
    color: 0xe5d6b6, map: texture, size: .095, sizeAttenuation: true,
    transparent: true, opacity: .35, depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.raycast = () => {};
  root.add(dust);
  root.traverse((object) => { object.raycast = () => {}; });

  const worldPosition = new THREE.Vector3();
  const update = (time: number, reducedMotion: boolean, selected: string | null): void => {
    const t = reducedMotion ? 0 : time;
    for (const object of platformObjects) object.visible = !selected;
    dust.position.y = reducedMotion ? 0 : Math.sin(t * .11) * .28;
    dust.rotation.y = reducedMotion ? 0 : Math.sin(t * .025) * .009;
    dust.visible = !selected;
    for (const anchor of anchors) {
      anchor.room.updateWorldMatrix(true, false);
      worldPosition.copy(anchor.point).applyMatrix4(anchor.room.matrixWorld);
      const visible = !selected || selected === anchor.id;
      transform.position.copy(worldPosition);
      transform.scale.setScalar(visible ? 1 : 0);
      transform.updateMatrix();
      halos.setMatrixAt(anchor.index, transform.matrix);
    }
    halos.instanceMatrix.needsUpdate = true;
  };
  update(0, true, null);
  let disposed = false;
  return {
    update,
    dispose() {
      if (disposed) return;
      disposed = true;
      root.removeFromParent();
      brackets.dispose();
      halos.dispose();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      texture.dispose();
    },
  };
}
