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

export interface BlockoutLightRig {
  readonly worldRoot: THREE.Group;
  readonly inventory: readonly SourceToLightEntry[];
  readonly principal: THREE.DirectionalLight;
  setTimeOfDay(timeOfDay: BlockoutTimeOfDay): void;
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

  const fill = new THREE.HemisphereLight(0xa9bad1, 0x463d3a, 1.15);
  fill.name = 'LIGHT_WORLD_FILL';
  worldRoot.add(fill);

  const principal = new THREE.DirectionalLight(0xffd2a3, 2.35);
  principal.name = 'LIGHT_AFTERNOON_PRINCIPAL';
  principal.position.set(-12, 18, 10);
  principal.castShadow = true;
  principal.shadow.mapSize.set(1024, 1024);
  principal.shadow.camera.near = 1;
  principal.shadow.camera.far = 55;
  worldRoot.add(principal, principal.target);
  principal.target.position.set(0, 0, 0);

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
    { emitterId: 'WORLD', lightId: principal.name, type: 'directional', attachment: [-12, 18, 10], rangeMeters: null, castsShadow: true, occlusionIntent: 'principal-sun', fallback: 'none' },
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
        fill.groundColor.setHex(0x292b38);
        fill.intensity = 0.82;
        principal.color.setHex(0xdf9a87);
        principal.intensity = 1.65;
        doorLight.intensity = 2.35;
      } else {
        fill.color.setHex(0xa9bad1);
        fill.groundColor.setHex(0x463d3a);
        fill.intensity = 1.15;
        principal.color.setHex(0xffd2a3);
        principal.intensity = 2.35;
        doorLight.intensity = 1.55;
      }
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
