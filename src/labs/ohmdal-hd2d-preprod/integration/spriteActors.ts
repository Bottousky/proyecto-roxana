import * as THREE from 'three';
import type { DirectionVariant, OhmVariant } from '../contracts.ts';
import { directionIndex } from './harnessState.ts';
// Asset Forge entrega una fábrica JS que recibe el namespace del runtime.
// @ts-expect-error El prototipo MJS no publica declaraciones TypeScript todavía.
import { createOhmProcedural } from '../../../../assets/runtime/ohmdal-hd2d-preprod/ohm/ohm-procedural.mjs';

const STUDENT_4_URL = new URL('../../../../assets/runtime/ohmdal-hd2d-preprod/student/student-atlas-4.svg', import.meta.url).href;
const STUDENT_8_URL = new URL('../../../../assets/runtime/ohmdal-hd2d-preprod/student/student-atlas-8.svg', import.meta.url).href;
const OHM_SPRITE_URL = new URL('../../../../assets/runtime/ohmdal-hd2d-preprod/ohm/ohm-sprite-atlas.svg', import.meta.url).href;

interface ProceduralOhm {
  root: THREE.Group;
  setState(state: string, reducedMotion?: boolean): void;
  dispose(): void;
}

function loadAtlas(url: string): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

function setFrame(texture: THREE.Texture, columns: number, rows: number, column: number, row: number): void {
  texture.repeat.set(1 / columns, 1 / rows);
  texture.offset.set(column / columns, 1 - (row + 1) / rows);
}

export interface StudentActor {
  readonly root: THREE.Group;
  setDirectionVariant(variant: DirectionVariant): void;
  update(heading: number, moving: boolean, elapsedSeconds: number): void;
  dispose(): void;
}

export function createStudentActor(): StudentActor {
  const root = new THREE.Group();
  root.name = 'student_actor';
  const textures = { 4: loadAtlas(STUDENT_4_URL), 8: loadAtlas(STUDENT_8_URL) } as const;
  const material = new THREE.SpriteMaterial({ map: textures[4], transparent: true, alphaTest: 0.02 });
  const sprite = new THREE.Sprite(material);
  sprite.name = 'student_original_placeholder';
  sprite.center.set(0.5, 0.0625);
  sprite.scale.set(1.5, 2, 1);
  sprite.position.y = 0.06;
  const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x11131a, transparent: true, opacity: 0.34, depthWrite: false });
  const shadowGeometry = new THREE.CircleGeometry(0.42, 16);
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1, 0.55, 1);
  shadow.position.y = 0.012;
  root.add(shadow, sprite);
  let variant: DirectionVariant = 4;

  return {
    root,
    setDirectionVariant(next) {
      variant = next;
      material.map = textures[next];
      material.needsUpdate = true;
    },
    update(heading, moving, elapsedSeconds) {
      const columns = 20;
      const firstColumn = moving ? 2 : 0;
      const frames = moving ? 6 : 2;
      const frameMs = moving ? 100 : 300;
      const frame = Math.floor(elapsedSeconds * 1000 / frameMs) % frames;
      setFrame(textures[variant], columns, variant, firstColumn + frame, directionIndex(heading, variant));
    },
    dispose() {
      root.removeFromParent();
      material.dispose();
      shadowMaterial.dispose();
      shadowGeometry.dispose();
      textures[4].dispose();
      textures[8].dispose();
    },
  };
}

export interface OhmActor {
  readonly root: THREE.Group;
  setVariant(variant: OhmVariant): void;
  setState(state: string, reducedMotion?: boolean): void;
  dispose(): void;
}

export function createOhmActor(): OhmActor {
  const root = new THREE.Group();
  root.name = 'ohm_ab_actor';
  const texture = loadAtlas(OHM_SPRITE_URL);
  setFrame(texture, 6, 4, 0, 2);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.02 });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.name = 'ohm_sprite_variant';
  sprite.center.set(0.5, 0.0625);
  sprite.scale.set(1.2, 1.6, 1);
  sprite.position.y = 0.05;
  const procedural = createOhmProcedural(THREE) as ProceduralOhm;
  procedural.root.name = 'ohm_procedural_variant';
  procedural.root.scale.setScalar(1.45);
  root.add(sprite, procedural.root);
  let variant: OhmVariant = 'sprite';
  const stateColumns = ['idle', 'locomotion', 'sensor_deployed', 'measurement_valid', 'measurement_blocked', 'uncertain'];

  const sync = (): void => {
    sprite.visible = variant === 'sprite';
    procedural.root.visible = variant === 'procedural';
  };
  sync();
  return {
    root,
    setVariant(next) { variant = next; sync(); },
    setState(state, reducedMotion = false) {
      const column = Math.max(0, stateColumns.indexOf(state));
      setFrame(texture, 6, 4, column, 2);
      procedural.setState(state, reducedMotion);
    },
    dispose() {
      root.removeFromParent();
      spriteMaterial.dispose();
      texture.dispose();
      procedural.dispose();
    },
  };
}
