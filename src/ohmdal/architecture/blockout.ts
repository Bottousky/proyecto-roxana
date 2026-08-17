import * as THREE from 'three';
import { type OcclusionBinding } from '../camera/occlusion.ts';
import { createBlockoutLighting, type BlockoutLightRig } from '../lighting/blockoutLighting.ts';
import {
  createBlockoutMaterials,
  type BlockoutMaterialSet,
  type BlockoutTimeOfDay,
} from '../materials/blockoutMaterials.ts';
import { NAVIGATION_REGIONS } from '../navigation/navigation.ts';
import { createBasicUnitKit, type BasicUnitKit } from './basicRoomKit.ts';
import { BASIC_UNITS } from './units.ts';
import {
  ARCHITECTURE_SOCKETS,
  BOX_MODULES,
  COLLIDERS,
  GAMEPLAY_PLANE_Y,
  MANNEQUIN_HEIGHT_METERS,
  ROUTE_ANCHORS,
  type ArchitectureSocket,
} from './levelData.ts';

export interface RendererInfoSnapshot {
  readonly calls: number;
  readonly triangles: number;
  readonly lines: number;
  readonly points: number;
  readonly geometries: number;
  readonly textures: number;
}

export interface RendererInfoSource {
  readonly info: {
    readonly render: { readonly calls: number; readonly triangles: number; readonly lines: number; readonly points: number };
    readonly memory: { readonly geometries: number; readonly textures: number };
  };
}

export interface RendererCacheOwner extends RendererInfoSource {
  readonly renderLists: { dispose(): void };
}

export interface BlockoutDiagnostics {
  readonly disposed: boolean;
  readonly geometryCount: number;
  readonly visualMeshCount: number;
  readonly colliderMeshCount: number;
  readonly navigationMeshCount: number;
  readonly mannequinHeightMeters: number;
  readonly material: ReturnType<BlockoutMaterialSet['diagnostics']>;
  readonly lighting: ReturnType<BlockoutLightRig['diagnostics']>;
}

export interface OhmdalBlockout {
  readonly root: THREE.Group;
  readonly visualLayer: THREE.Group;
  readonly colliderLayer: THREE.Group;
  readonly navigationLayer: THREE.Group;
  readonly anchorLayer: THREE.Group;
  readonly referenceLayer: THREE.Group;
  readonly mannequin: THREE.Group;
  readonly occlusionBindings: readonly OcclusionBinding[];
  readonly materials: BlockoutMaterialSet;
  readonly lighting: BlockoutLightRig;
  setTimeOfDay(timeOfDay: BlockoutTimeOfDay): void;
  /**
   * Estado del agua en el Manantial. La Puerta y el Manantial ahora son greybox (sus
   * kits `puertaKit` se reemplazaron por `createBasicUnitKit` con modo `'greybox'`), así
   * que el cambio de estado del agua ya no se ve — la lógica del puzzle en
   * `puzzles/puerta.ts` sigue corriendo y el flag `puertaDone` sigue marcando el cambio.
   * El método queda como no-op para que `world.ts` no tenga que ramificar.
   */
  setSpringWaterState(state: 'estable' | 'detenida'): void;
  /**
   * Apertura de las hojas de la Puerta. Como `setSpringWaterState`, la Puerta es greybox
   * y la apertura no se ve. El método queda como no-op para mantener el contrato.
   */
  setDoorOpening(amount: number): void;
  diagnostics(): BlockoutDiagnostics;
  dispose(): void;
}

function geometryKey(width: number, height: number, depth: number): string {
  return `${width}:${height}:${depth}`;
}

/**
 * Cada socket del arco es una transición entre dos unidades. En modo greybox el muro
 * perimetral es bajo y el ojo no siempre lee el hueco — los arcos marcan el paso:
 * dos pilares a los lados del gap de 3 m, un dintel de cobre conectándolos. Material
 * cobre, no piedra: contrasta con la paleta gris de los greybox y se lee como umbral.
 *
 * No se dibuja un arco para los self-sockets (S_PORTAL_TO_PLAZA): el Portal no es
 * una transición entre zonas, es el spawn dentro de la Plaza. Un arco ahí confundiría
 * la lectura.
 */
const SOCKET_ARCH_PILLAR_W = 0.3;
const SOCKET_ARCH_PILLAR_H = 1.6;
const SOCKET_ARCH_PILLAR_D = 0.3;
const SOCKET_ARCH_BEAM_H = 0.3;
const SOCKET_ARCH_BEAM_D = 0.4;
const SOCKET_ARCH_COLOR = 0xa66a3a;

function socketArch(socket: ArchitectureSocket): THREE.Group {
  const root = new THREE.Group();
  root.name = `${socket.id}_ARCH`;
  const material = new THREE.MeshStandardMaterial({
    color: SOCKET_ARCH_COLOR,
    roughness: 0.55,
    metalness: 0.35,
    flatShading: true,
  });
  // Los sockets del arco son perpendiculares a la huella de las unidades: el muro está
  // en x = constante y el paso va en z. Los pilares van a los lados del gap, no
  // adentro: en z = socket.z ± (socket.width/2 + pillarDepth/2).
  const zNorth = socket.position.z - socket.width / 2 - SOCKET_ARCH_PILLAR_D / 2;
  const zSouth = socket.position.z + socket.width / 2 + SOCKET_ARCH_PILLAR_D / 2;
  for (const [zOffset, side] of [[zNorth, 'N'], [zSouth, 'S']] as const) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(SOCKET_ARCH_PILLAR_W, SOCKET_ARCH_PILLAR_H, SOCKET_ARCH_PILLAR_D),
      material,
    );
    pillar.name = `${socket.id}_PILLAR_${side}`;
    pillar.position.set(socket.position.x, SOCKET_ARCH_PILLAR_H / 2, zOffset);
    pillar.castShadow = true;
    root.add(pillar);
  }
  // El dintel cubre la luz del hueco: ancho = gap + pillarDepth, profundidad = beamDepth.
  const beamLength = socket.width + SOCKET_ARCH_PILLAR_D;
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(SOCKET_ARCH_BEAM_D, SOCKET_ARCH_BEAM_H, beamLength),
    material,
  );
  beam.name = `${socket.id}_BEAM`;
  beam.position.set(
    socket.position.x,
    SOCKET_ARCH_PILLAR_H + SOCKET_ARCH_BEAM_H / 2,
    socket.position.z,
  );
  beam.castShadow = true;
  root.add(beam);
  return root;
}

function createMannequin(
  geometries: Set<THREE.BufferGeometry>,
  material: THREE.Material,
): THREE.Group {
  const mannequin = new THREE.Group();
  mannequin.name = 'REFERENCE_MANNEQUIN_1_72M';
  mannequin.position.set(-11.5, GAMEPLAY_PLANE_Y, 1.6);
  mannequin.userData.heightMeters = MANNEQUIN_HEIGHT_METERS;
  mannequin.userData.pivot = 'feet-at-ground';

  const addBox = (name: string, width: number, height: number, depth: number, y: number): void => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.y = y;
    mesh.castShadow = true;
    mannequin.add(mesh);
  };
  addBox('MANNEQUIN_LEGS', 0.36, 0.75, 0.28, 0.375);
  addBox('MANNEQUIN_TORSO', 0.48, 0.65, 0.3, 1.075);
  addBox('MANNEQUIN_HEAD', 0.32, 0.32, 0.32, 1.56);
  return mannequin;
}

export function readRendererInfo(renderer: RendererInfoSource): RendererInfoSnapshot {
  return {
    calls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    lines: renderer.info.render.lines,
    points: renderer.info.render.points,
    geometries: renderer.info.memory.geometries,
    textures: renderer.info.memory.textures,
  };
}

/** El runtime integrador conserva ownership del renderer; este helper limpia solo su cache de listas. */
export function disposeRendererCaches(renderer: RendererCacheOwner): void {
  renderer.renderLists.dispose();
}

export function createOhmdalBlockout(scene?: THREE.Scene): OhmdalBlockout {
  const root = new THREE.Group();
  root.name = 'OHMDAL_HD2D_BLOCKOUT';
  root.userData.units = 'meters';
  root.userData.gameplayPlaneY = GAMEPLAY_PLANE_Y;

  const visualLayer = new THREE.Group();
  visualLayer.name = 'LAYER_VISUAL';
  const colliderLayer = new THREE.Group();
  colliderLayer.name = 'LAYER_COLLIDERS';
  colliderLayer.visible = false;
  const navigationLayer = new THREE.Group();
  navigationLayer.name = 'LAYER_NAVIGATION';
  navigationLayer.visible = false;
  const anchorLayer = new THREE.Group();
  anchorLayer.name = 'LAYER_ANCHORS';
  anchorLayer.visible = false;
  const referenceLayer = new THREE.Group();
  referenceLayer.name = 'LAYER_REFERENCE';
  // El maniquí de 1,72 m sirve para comprobar escala contra geometría de prueba. Con la Plaza
  // construida deja de ser una referencia y pasa a ser un muñeco gris parado en el medio del
  // encuadre. Sigue existiendo —la escala se comprueba encendiéndolo— pero no se dibuja.
  referenceLayer.visible = false;

  const materials = createBlockoutMaterials();
  const geometryCache = new Map<string, THREE.BoxGeometry>();
  const geometries = new Set<THREE.BufferGeometry>();
  const emitters = new Map<string, THREE.Object3D>();
  const occlusionBindings: OcclusionBinding[] = [];

  const boxGeometry = (width: number, height: number, depth: number): THREE.BoxGeometry => {
    const key = geometryKey(width, height, depth);
    const existing = geometryCache.get(key);
    if (existing) return existing;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    geometryCache.set(key, geometry);
    geometries.add(geometry);
    return geometry;
  };

  // Siete unidades: las 3 de U1 (Plaza, Taller, Puerta + Manantial) y las 4 de U2–U5
  // (Castillo, Forja, Terrazas, Faro). Las tres primeras corren en modo `'greybox'`
  // (cajas planas, sin texturas); las cuatro últimas en modo `'kit'` (texturas, vertex
  // colors, empedrado). Es la lectura estructural del arco: las veinte salas del
  // manifiesto, una sola pasada visual.
  const allUnits: BasicUnitKit[] = BASIC_UNITS.map((definition) => {
    const kit = createBasicUnitKit(definition);
    visualLayer.add(kit.root);
    return kit;
  });

  for (const definition of BOX_MODULES) {
    const moduleRoot = new THREE.Group();
    moduleRoot.name = definition.id;
    moduleRoot.position.set(definition.centerX, definition.pivotY, definition.centerZ);
    moduleRoot.userData.zoneId = definition.zoneId;
    moduleRoot.userData.pivot = 'ground';
    moduleRoot.userData.tags = [...definition.tags];
    if (definition.tags.includes('cameraOccluder')) moduleRoot.userData.cameraOccluder = true;
    if (definition.tags.includes('cameraRoof')) moduleRoot.userData.cameraRoof = true;

    const baseY = definition.baseY ?? 0;
    const material = definition.tags.includes('cameraOccluder') || definition.tags.includes('cameraRoof')
      ? materials.createOccluderMaterial(definition.family)
      : materials.materialFor(definition.family);
    const mesh = new THREE.Mesh(
      boxGeometry(definition.width, definition.height, definition.depth),
      material,
    );
    mesh.name = `${definition.id}__mesh`;
    mesh.position.y = baseY + definition.height / 2;
    mesh.rotation.set(
      definition.rotationX ?? 0,
      definition.rotationY ?? 0,
      definition.rotationZ ?? 0,
    );
    mesh.castShadow = !definition.tags.includes('floor');
    mesh.receiveShadow = true;
    moduleRoot.add(mesh);
    visualLayer.add(moduleRoot);

    if (definition.tags.includes('emitter')) emitters.set(definition.id, moduleRoot);
    if (material !== materials.materialFor(definition.family)) {
      occlusionBindings.push({
        id: definition.id,
        object: moduleRoot,
        setOpacity(opacity) {
          material.opacity = opacity;
          moduleRoot.visible = opacity > 0.001;
        },
      });
    }
  }

  for (const collider of COLLIDERS) {
    const width = collider.bounds.maxX - collider.bounds.minX;
    const depth = collider.bounds.maxZ - collider.bounds.minZ;
    const mesh = new THREE.Mesh(
      boxGeometry(width, collider.height, depth),
      materials.colliderDebug,
    );
    mesh.name = collider.id;
    mesh.position.set(
      (collider.bounds.minX + collider.bounds.maxX) / 2,
      collider.planeY + collider.height / 2,
      (collider.bounds.minZ + collider.bounds.maxZ) / 2,
    );
    mesh.userData.zoneId = collider.zoneId;
    colliderLayer.add(mesh);
  }

  for (const region of NAVIGATION_REGIONS) {
    const width = region.bounds.maxX - region.bounds.minX;
    const depth = region.bounds.maxZ - region.bounds.minZ;
    const mesh = new THREE.Mesh(boxGeometry(width, 0.02, depth), materials.navigationDebug);
    mesh.name = region.id;
    mesh.position.set(
      (region.bounds.minX + region.bounds.maxX) / 2,
      region.planeY + 0.01,
      (region.bounds.minZ + region.bounds.maxZ) / 2,
    );
    navigationLayer.add(mesh);
  }

  for (const anchor of ROUTE_ANCHORS) {
    const object = new THREE.Object3D();
    object.name = anchor.id;
    object.position.set(anchor.position.x, anchor.position.y, anchor.position.z);
    object.userData.purpose = anchor.purpose;
    anchorLayer.add(object);
  }

  // Arcos de umbral: una capa visual que se monta encima de las unidades para que los
  // sockets sean legibles desde cualquier camara. Los self-sockets (Portal dentro de la
  // propia Plaza) se saltan: el Portal no es una transicion, es el spawn.
  const socketArchGroup = new THREE.Group();
  socketArchGroup.name = 'SOCKET_ARCHES';
  for (const socket of ARCHITECTURE_SOCKETS) {
    if (socket.from === socket.to) continue;
    socketArchGroup.add(socketArch(socket));
  }
  visualLayer.add(socketArchGroup);

  const mannequin = createMannequin(geometries, materials.materialFor('glass'));
  referenceLayer.add(mannequin);
  const lighting = createBlockoutLighting(emitters);
  root.add(visualLayer, colliderLayer, navigationLayer, anchorLayer, referenceLayer, lighting.worldRoot);
  scene?.add(root);
  let disposed = false;

  return {
    root,
    visualLayer,
    colliderLayer,
    navigationLayer,
    anchorLayer,
    referenceLayer,
    mannequin,
    occlusionBindings,
    materials,
    lighting,
    setTimeOfDay(timeOfDay) {
      if (disposed) throw new Error('Ohmdal blockout is disposed');
      materials.setTimeOfDay(timeOfDay);
      lighting.setTimeOfDay(timeOfDay);
      for (const kit of allUnits) kit.setTimeOfDay(timeOfDay);
    },
    setSpringWaterState(_state) {
      if (disposed) throw new Error('Ohmdal blockout is disposed');
      // No-op: la Puerta y el Manantial son greybox. La lógica del puzzle en
      // `puzzles/puerta.ts` sigue corriendo; sólo el reflejo visual desapareció.
    },
    setDoorOpening(_amount) {
      if (disposed) throw new Error('Ohmdal blockout is disposed');
      // No-op: la Puerta es greybox. Ver `setSpringWaterState`.
    },
    diagnostics() {
      return {
        disposed,
        geometryCount: geometries.size,
        visualMeshCount: visualLayer.children.length,
        colliderMeshCount: colliderLayer.children.length,
        navigationMeshCount: navigationLayer.children.length,
        mannequinHeightMeters: MANNEQUIN_HEIGHT_METERS,
        material: materials.diagnostics(),
        lighting: lighting.diagnostics(),
      };
    },
    dispose() {
      if (disposed) return;
      lighting.dispose();
      for (const kit of allUnits) kit.dispose();
      root.removeFromParent();
      root.clear();
      geometries.forEach((geometry) => geometry.dispose());
      materials.dispose();
      disposed = true;
    },
  };
}
