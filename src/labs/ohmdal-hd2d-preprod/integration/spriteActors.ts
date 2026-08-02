import * as THREE from 'three';
import type { DirectionVariant } from '../contracts.ts';
import { directionIndex } from './harnessState.ts';

const STUDENT_4_URL = new URL('../../../../assets/runtime/ohmdal-hd2d-preprod/student/student-atlas-4.svg', import.meta.url).href;
const OHM_SPRITE_URL = new URL('../../../../assets/runtime/ohmdal-hd2d-preprod/ohm/ohm-sprite-atlas.svg', import.meta.url).href;

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
  update(heading: number, moving: boolean, elapsedSeconds: number): void;
  dispose(): void;
}

export function createStudentActor(): StudentActor {
  const root = new THREE.Group();
  root.name = 'student_actor';
  const texture = loadAtlas(STUDENT_4_URL);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.02 });
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
  const variant: DirectionVariant = 4;

  return {
    root,
    update(heading, moving, elapsedSeconds) {
      const columns = 20;
      const firstColumn = moving ? 2 : 0;
      const frames = moving ? 6 : 2;
      const frameMs = moving ? 100 : 300;
      const frame = Math.floor(elapsedSeconds * 1000 / frameMs) % frames;
      setFrame(texture, columns, variant, firstColumn + frame, directionIndex(heading, variant));
    },
    dispose() {
      root.removeFromParent();
      material.dispose();
      shadowMaterial.dispose();
      shadowGeometry.dispose();
      texture.dispose();
    },
  };
}

export interface OhmActor {
  readonly root: THREE.Group;
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
  const shadowGeometry = new THREE.CircleGeometry(0.34, 16);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x11131a,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.name = 'ohm_contact_shadow';
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1, 0.55, 1);
  shadow.position.y = 0.012;
  root.add(shadow, sprite);
  const stateColumns = ['idle', 'locomotion', 'sensor_deployed', 'measurement_valid', 'measurement_blocked', 'uncertain'];
  return {
    root,
    setState(state) {
      const column = Math.max(0, stateColumns.indexOf(state));
      setFrame(texture, 6, 4, column, 2);
    },
    dispose() {
      root.removeFromParent();
      spriteMaterial.dispose();
      shadowMaterial.dispose();
      shadowGeometry.dispose();
      texture.dispose();
    },
  };
}
