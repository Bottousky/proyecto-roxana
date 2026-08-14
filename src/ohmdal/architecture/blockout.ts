import * as THREE from 'three';
import { type OcclusionBinding } from '../camera/occlusion.ts';
import { createBlockoutLighting, type BlockoutLightRig } from '../lighting/blockoutLighting.ts';
import {
  createBlockoutMaterials,
  type BlockoutMaterialSet,
  type BlockoutTimeOfDay,
} from '../materials/blockoutMaterials.ts';
import { NAVIGATION_REGIONS } from '../navigation/navigation.ts';
import { createPlazaKit } from './plazaKit.ts';
import { createTallerKit } from './tallerKit.ts';
import { createPuertaKit, type WaterState } from './puertaKit.ts';
import { createBasicUnitKit } from './basicRoomKit.ts';
import { BASIC_UNITS } from './units.ts';
import {
  BOX_MODULES,
  COLLIDERS,
  GAMEPLAY_PLANE_Y,
  MANNEQUIN_HEIGHT_METERS,
  ROUTE_ANCHORS,
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
  /** E5: el estado del agua en el Manantial. Lo decide el mundo según los flags de `/jugar`. */
  setSpringWaterState(state: WaterState): void;
  /** E4: cuánto están abiertas las hojas de la Puerta. `0` cerrada, `1` abierta del todo. */
  setDoorOpening(amount: number): void;
  diagnostics(): BlockoutDiagnostics;
  dispose(): void;
}

function geometryKey(width: number, height: number, depth: number): string {
  return `${width}:${height}:${depth}`;
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

  // La Plaza dejó de ser blockout: la construye su propio kit, con piso empedrado, muros de
  // perímetro, el Portal y el monumento de la campana. El Taller y la Puerta siguen en cajas
  // hasta que les toque.
  const plaza = createPlazaKit();
  visualLayer.add(plaza.root);
  const taller = createTallerKit();
  visualLayer.add(taller.root);
  // Los faldones y el vano del Taller se desvanecen igual que cualquier otro oclusor: el kit
  // aporta sus bindings y el controlador de oclusión no se entera de que cambió quién los hace.
  occlusionBindings.push(...taller.occlusionBindings);
  const puerta = createPuertaKit();
  visualLayer.add(puerta.root);
  occlusionBindings.push(...puerta.occlusionBindings);

  // Las 4 unidades básicas del arco (Castillo, Forja, Terrazas, Faro). Cada una se monta
  // con su propio kit: piso empedrado, perímetro, siluetas por sub-sala. Devuelven una
  // referencia al kit para poder propagar el cambio de hora del día.
  const basicUnits = BASIC_UNITS.map((definition) => {
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
      plaza.setTimeOfDay(timeOfDay);
      taller.setTimeOfDay(timeOfDay);
      puerta.setTimeOfDay(timeOfDay);
      for (const kit of basicUnits) kit.setTimeOfDay(timeOfDay);
    },
    setSpringWaterState(state) {
      if (disposed) throw new Error('Ohmdal blockout is disposed');
      puerta.setWaterState(state);
    },
    setDoorOpening(amount) {
      if (disposed) throw new Error('Ohmdal blockout is disposed');
      puerta.setDoorOpening(amount);
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
      plaza.dispose();
      taller.dispose();
      puerta.dispose();
      for (const kit of basicUnits) kit.dispose();
      root.removeFromParent();
      root.clear();
      geometries.forEach((geometry) => geometry.dispose());
      materials.dispose();
      disposed = true;
    },
  };
}
