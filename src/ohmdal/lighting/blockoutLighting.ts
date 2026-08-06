import * as THREE from 'three';
import type { BlockoutTimeOfDay } from '../materials/blockoutMaterials.ts';

export interface SourceToLightEntry {
  readonly emitterId: string | 'WORLD';
  readonly lightId: string;
  readonly type: 'hemisphere' | 'directional' | 'point';
  readonly attachment: readonly [number, number, number];
  readonly rangeMeters: number | null;
  readonly castsShadow: boolean;
  readonly occlusionIntent: 'global-fill' | 'principal-sun' | 'local-visible-emitter';
  readonly fallback: 'none' | 'disabled-with-emitter';
}

/** Media ventana de la cámara de sombra, en metros. Cubre el encuadre con margen. */
export const SHADOW_HALF_EXTENT = 15;

/** Dirección del sol de la tarde, en metros desde el punto que ilumina. */
const SUN_OFFSET = Object.freeze({ x: -12, y: 18, z: 10 });

/** Recoloca el sol y su objetivo sobre un punto del suelo, conservando la dirección. */
function focusPrincipal(light: THREE.DirectionalLight, x: number, z: number): void {
  light.position.set(x + SUN_OFFSET.x, SUN_OFFSET.y, z + SUN_OFFSET.z);
  light.target.position.set(x, 0, z);
  light.target.updateMatrixWorld();
}

export interface BlockoutLightRig {
  readonly worldRoot: THREE.Group;
  readonly inventory: readonly SourceToLightEntry[];
  readonly principal: THREE.DirectionalLight;
  setTimeOfDay(timeOfDay: BlockoutTimeOfDay): void;
  /**
   * Mueve la ventana de sombra sobre el jugador. Sin esto, un mundo de 38 m necesitaría una
   * cámara de sombra tan grande que cada téxel mediría cinco centímetros.
   */
  focusShadowOn(x: number, z: number): void;
  syncEmitterState(): void;
  diagnostics(): { readonly disposed: boolean; readonly lightCount: number; readonly shadowLightCount: number; readonly enabledLocalLightCount: number };
  dispose(): void;
}

function requireEmitter(emitters: ReadonlyMap<string, THREE.Object3D>, id: string): THREE.Object3D {
  const emitter = emitters.get(id);
  if (!emitter) throw new Error(`Missing visible emitter ${id}`);
  return emitter;
}

export function createBlockoutLighting(emitters: ReadonlyMap<string, THREE.Object3D>): BlockoutLightRig {
  const worldRoot = new THREE.Group();
  worldRoot.name = 'LAYER_LIGHTING';

  // El relleno subió de 1,15 a 2,0 y el suelo del hemisferio se aclaró.
  //
  // Los valores anteriores son los que declara COLOR_SCRIPT.md, pero **nunca se midieron con
  // sombras reales**: la cámara de sombra del sol jamás cubrió la Plaza, así que todo se
  // renderizaba iluminado y el relleno no tenía nada que levantar. Con la sombra funcionando,
  // el 22,9 % del cuadro quedaba por debajo de 12 de luminancia y la media era 55 sobre 255.
  // Una escena a mediodía de tarde no se lee así.
  //
  // Es un cambio sobre un número del canon y necesita el visto bueno del Director.
  const fill = new THREE.HemisphereLight(0xa9bad1, 0x6b5f58, 2.0);
  fill.name = 'LIGHT_WORLD_FILL';
  worldRoot.add(fill);

  const principal = new THREE.DirectionalLight(0xffd2a3, 2.0);
  principal.name = 'LIGHT_AFTERNOON_PRINCIPAL';
  principal.castShadow = true;
  principal.shadow.mapSize.set(1024, 1024);
  principal.shadow.camera.near = 1;
  principal.shadow.camera.far = 55;
  // A la cámara de sombra hay que darle tamaño: Three la deja en 10 × 10 m, y el slice mide
  // 38 m de punta a punta. Con el sol apuntando al Taller, la Plaza entera caía fuera del mapa
  // y ahí el muestreo se va de rango: el suelo se llenaba de una retícula regular que no
  // pertenecía a ninguna geometría y que no se movía con el mundo.
  //
  // En vez de agrandarla hasta cubrir todo —que dejaría téxels de cinco centímetros—, la
  // sombra **sigue al jugador**. Una ventana de 15 m da téxels de un centímetro y medio.
  principal.shadow.camera.left = -SHADOW_HALF_EXTENT;
  principal.shadow.camera.right = SHADOW_HALF_EXTENT;
  principal.shadow.camera.top = SHADOW_HALF_EXTENT;
  principal.shadow.camera.bottom = -SHADOW_HALF_EXTENT;
  // Sin sesgo, una superficie casi paralela al sol se sombrea a sí misma. El normal bias
  // desplaza según la normal, que es lo que salva al empedrado sin despegar las sombras.
  principal.shadow.bias = -0.0004;
  principal.shadow.normalBias = 0.028;
  principal.shadow.camera.updateProjectionMatrix();
  worldRoot.add(principal, principal.target);
  focusPrincipal(principal, 0, 0);

  const workshopEmitter = requireEmitter(emitters, 'workshop-lantern-emitter');
  const workshopLight = new THREE.PointLight(0xffbd76, 2.1, 5.5, 2);
  workshopLight.name = 'LIGHT_WORKSHOP_LANTERN';
  workshopLight.position.set(0, 0.55, 0);
  workshopLight.castShadow = false;
  workshopEmitter.add(workshopLight);

  const doorEmitter = requireEmitter(emitters, 'door-conduit-emitter');
  const doorLight = new THREE.PointLight(0x63dce8, 1.55, 4.5, 2);
  doorLight.name = 'LIGHT_DOOR_CONDUIT';
  doorLight.position.set(0, 0.65, 0);
  doorLight.castShadow = false;
  doorEmitter.add(doorLight);

  const inventory: readonly SourceToLightEntry[] = [
    { emitterId: 'WORLD', lightId: fill.name, type: 'hemisphere', attachment: [0, 0, 0], rangeMeters: null, castsShadow: false, occlusionIntent: 'global-fill', fallback: 'none' },
    { emitterId: 'WORLD', lightId: principal.name, type: 'directional', attachment: [SUN_OFFSET.x, SUN_OFFSET.y, SUN_OFFSET.z], rangeMeters: null, castsShadow: true, occlusionIntent: 'principal-sun', fallback: 'none' },
    { emitterId: workshopEmitter.name, lightId: workshopLight.name, type: 'point', attachment: [0, 0.55, 0], rangeMeters: 5.5, castsShadow: false, occlusionIntent: 'local-visible-emitter', fallback: 'disabled-with-emitter' },
    { emitterId: doorEmitter.name, lightId: doorLight.name, type: 'point', attachment: [0, 0.65, 0], rangeMeters: 4.5, castsShadow: false, occlusionIntent: 'local-visible-emitter', fallback: 'disabled-with-emitter' },
  ];
  let disposed = false;

  const syncEmitterState = (): void => {
    workshopLight.visible = workshopEmitter.visible;
    doorLight.visible = doorEmitter.visible;
  };
  syncEmitterState();

  return {
    worldRoot,
    inventory,
    principal,
    setTimeOfDay(timeOfDay) {
      if (disposed) throw new Error('Blockout lighting is disposed');
      if (timeOfDay === 'twilight') {
        fill.color.setHex(0x7189a8);
        fill.groundColor.setHex(0x474c58);
        fill.intensity = 1.5;
        principal.color.setHex(0xdf9a87);
        principal.intensity = 1.45;
        doorLight.intensity = 2.35;
      } else {
        fill.color.setHex(0xa9bad1);
        fill.groundColor.setHex(0x6b5f58);
        fill.intensity = 2.0;
        principal.color.setHex(0xffd2a3);
        principal.intensity = 2.0;
        doorLight.intensity = 1.55;
      }
    },
    focusShadowOn(x, z) {
      if (disposed) throw new Error('Blockout lighting is disposed');
      focusPrincipal(principal, x, z);
    },
    syncEmitterState,
    diagnostics() {
      return {
        disposed,
        lightCount: inventory.length,
        shadowLightCount: 1,
        enabledLocalLightCount: Number(workshopLight.visible) + Number(doorLight.visible),
      };
    },
    dispose() {
      if (disposed) return;
      workshopLight.removeFromParent();
      doorLight.removeFromParent();
      worldRoot.removeFromParent();
      worldRoot.clear();
      disposed = true;
    },
  };
}
