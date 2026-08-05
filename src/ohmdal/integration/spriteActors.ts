// Actores del mundo HD-2D: sprites de 4 direcciones sobre el diorama 3D.
//
// Las hojas son las **de producción**, las mismas que dibuja `/jugar` (64×96, fila por
// dirección). Antes esto cargaba unos SVG de placeholder por una ruta con un `../` de más:
// resolvía por encima de la raíz del repo, andaba de casualidad en `vite dev` porque la
// resolución de URL se topa con la raíz, y en el build no llegaba a `dist/` — los sprites
// salían en blanco. Con `?url` es Vite quien resuelve y copia el archivo.
import * as THREE from 'three';
import studentWalkUrl from '../../../assets/ohmdal/hero-student-walk-solid-64.png?url';
import studentIdleUrl from '../../../assets/ohmdal/hero-student-idle-solid-64.png?url';
import ohmAtlasUrl from '../../../assets/ohmdal/characters/ohm-atlas-64-v2.png?url';
import npcCoreUrl from '../../../assets/ohmdal/npc-core-atlas-64.png?url';
import { directionIndex } from './harnessState.ts';

/**
 * Alto del cuadro en metros. El cuadro es de 64×96 px y el ancho se deriva de esa proporción:
 * estirar pixel art de forma no uniforme se nota enseguida.
 */
const FRAME_HEIGHT_METERS = 2;
/** La suela está a 5 px del borde inferior del cuadro. Ahí va el pivote, sobre el suelo. */
const SOLE_FROM_BOTTOM = 5 / 96;

/**
 * `directionIndex` numera los sectores desde +z y en sentido horario. La cámara mira por +x
 * con `right` = +z, así que en pantalla: +z es este, +x es alejarse (norte), −z es oeste y
 * −x es venir hacia la cámara (sur).
 *
 * Las tres hojas ordenan las direcciones igual —sur, oeste, este, norte—, aunque el estudiante
 * las guarda como filas y Ohm y los PNJ como columnas.
 */
const FACING_BY_DIRECTION = [2, 3, 1, 0] as const;

function loadSheet(url: string): THREE.Texture {
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

function billboard(texture: THREE.Texture, name: string, heightMeters = FRAME_HEIGHT_METERS): THREE.Sprite {
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.02 });
  const sprite = new THREE.Sprite(material);
  sprite.name = name;
  sprite.center.set(0.5, SOLE_FROM_BOTTOM);
  sprite.scale.set((heightMeters * 64) / 96, heightMeters, 1);
  return sprite;
}

function contactShadow(radius: number): THREE.Mesh {
  const geometry = new THREE.CircleGeometry(radius, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0x11131a,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(geometry, material);
  shadow.name = 'contact_shadow';
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1, 0.55, 1);
  shadow.position.y = 0.012;
  return shadow;
}

/** Halo radial generado por código: sin asset, y el bloom del postfx lo levanta solo. */
function glowTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.34)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface StudentActor {
  readonly root: THREE.Group;
  update(heading: number, moving: boolean, elapsedSeconds: number): void;
  dispose(): void;
}

export function createStudentActor(): StudentActor {
  const root = new THREE.Group();
  root.name = 'student_actor';

  const walkTexture = loadSheet(studentWalkUrl);
  const idleTexture = loadSheet(studentIdleUrl);
  const walk = billboard(walkTexture, 'student_walk');
  const idle = billboard(idleTexture, 'student_idle');
  walk.visible = false;
  const shadow = contactShadow(0.42);
  root.add(shadow, walk, idle);

  return {
    root,
    update(heading, moving, elapsedSeconds) {
      const row = FACING_BY_DIRECTION[directionIndex(heading, 4)];
      walk.visible = moving;
      idle.visible = !moving;
      if (moving) {
        setFrame(walkTexture, 6, 4, Math.floor(elapsedSeconds * 10) % 6, row);
      } else {
        setFrame(idleTexture, 4, 4, Math.floor(elapsedSeconds * 2.2) % 4, row);
      }
      // La zancada comunica el movimiento; el punto de apoyo no rebota.
      shadow.scale.set(moving ? 1.07 : 1, moving ? 0.5 : 0.55, 1);
    },
    dispose() {
      root.removeFromParent();
      (walk.material as THREE.SpriteMaterial).dispose();
      (idle.material as THREE.SpriteMaterial).dispose();
      (shadow.material as THREE.Material).dispose();
      shadow.geometry.dispose();
      walkTexture.dispose();
      idleTexture.dispose();
    },
  };
}

/** Dormido, el autómata es una silueta apagada; despierto, una lámpara con opiniones. */
const OHM_ASLEEP_TINT = 0x666674;

export interface OhmActor {
  readonly root: THREE.Group;
  setState(state: string, reducedMotion?: boolean): void;
  setFacing(heading: number): void;
  dispose(): void;
}

export function createOhmActor(): OhmActor {
  const root = new THREE.Group();
  root.name = 'ohm_actor';

  const texture = loadSheet(ohmAtlasUrl);
  setFrame(texture, 4, 1, 0, 0);
  const sprite = billboard(texture, 'ohm_sprite', 1.6);
  const shadow = contactShadow(0.34);

  const halo = glowTexture();
  const haloMaterial = new THREE.SpriteMaterial({
    map: halo,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: 0xc9a437,
    opacity: 0.12,
  });
  const glow = new THREE.Sprite(haloMaterial);
  glow.name = 'ohm_glow';
  glow.scale.set(2.1, 2.1, 1);
  glow.position.y = 0.85;

  root.add(shadow, glow, sprite);

  const spriteMaterial = sprite.material as THREE.SpriteMaterial;

  return {
    root,
    // El atlas de producción tiene una fila y cuatro columnas: son direcciones, no estados.
    // El estado se comunica por brillo y halo, que es lo que hace `/jugar` y lo que el bloom
    // del postfx puede levantar.
    setState(state) {
      const asleep = state === 'dormido' || state === 'inerte';
      spriteMaterial.color.setHex(asleep ? OHM_ASLEEP_TINT : 0xffffff);
      spriteMaterial.opacity = asleep ? 0.72 : 1;
      haloMaterial.color.setHex(asleep ? 0x333344 : 0xc9a437);
      haloMaterial.opacity = asleep ? 0.08 : state === 'measurement_valid' ? 0.5 : 0.32;
    },
    setFacing(heading) {
      setFrame(texture, 4, 1, FACING_BY_DIRECTION[directionIndex(heading, 4)], 0);
    },
    dispose() {
      root.removeFromParent();
      spriteMaterial.dispose();
      haloMaterial.dispose();
      halo.dispose();
      (shadow.material as THREE.Material).dispose();
      shadow.geometry.dispose();
      texture.dispose();
    },
  };
}

/** Filas del atlas principal de PNJ, en el mismo orden que `src/jugar/visuals.ts`. */
export const NPC_ROWS = { edda: 0, lumen: 1, consejera: 2, forjadora: 3 } as const;
export type NpcId = keyof typeof NPC_ROWS;

export interface NpcActor {
  readonly root: THREE.Group;
  setFacing(heading: number): void;
  dispose(): void;
}

/**
 * Un PNJ del Arco I. El atlas tiene una fila por personaje y una columna por dirección,
 * así que la fila la fija quién es y la columna, hacia dónde mira.
 */
export function createNpcActor(id: NpcId): NpcActor {
  const root = new THREE.Group();
  root.name = `npc_${id}`;

  const texture = loadSheet(npcCoreUrl);
  setFrame(texture, 4, 4, 0, NPC_ROWS[id]);
  const sprite = billboard(texture, `npc_${id}_sprite`);
  const shadow = contactShadow(0.4);
  root.add(shadow, sprite);

  return {
    root,
    setFacing(heading) {
      setFrame(texture, 4, 4, FACING_BY_DIRECTION[directionIndex(heading, 4)], NPC_ROWS[id]);
    },
    dispose() {
      root.removeFromParent();
      (sprite.material as THREE.SpriteMaterial).dispose();
      (shadow.material as THREE.Material).dispose();
      shadow.geometry.dispose();
      texture.dispose();
    },
  };
}
