// El reparto de la Unidad 1 puesto en el mundo: actores, props y el foco de interacción.
//
// Nada de acá decide *qué* dice un personaje ni *cuándo* aparece: eso lo deciden los flags y
// las cosas de `src/jugar/rooms.ts`, a través de `u1Anchors.ts`. Este módulo sólo los dibuja
// y resuelve a cuál está mirando el jugador.

import * as THREE from 'three';
import bellPropUrl from '../../../assets/ohmdal/generated/prop_bell.png?url';
import lampPropUrl from '../../../assets/ohmdal/generated/prop_lamp_post.png?url';
import pedestalPropUrl from '../../../assets/ohmdal/generated/prop_pedestal.png?url';
import portalPropUrl from '../../../assets/ohmdal/rooms/pilot-arco1/prop_plaza_portal-v2.png?url';
import { createNpcActor, createOhmActor, type NpcActor, type OhmActor } from '../integration/spriteActors.ts';
import {
  U1_ANCHORS,
  anchorInReach,
  isPresent,
  thingOf,
  type BenchId,
  type U1Anchor,
} from './u1Anchors.ts';

/**
 * Props pixel del mundo. En HD-2D el detalle no está en la malla: está en los sprites que la
 * pueblan, y estos ya existen — los dibuja `/jugar` desde el primer día.
 */
const PROPS: Readonly<Record<string, { readonly url: string; readonly height: number }>> = {
  'portal-aula': { url: portalPropUrl, height: 4.2 },
  campana: { url: bellPropUrl, height: 3.2 },
  pedestal: { url: pedestalPropUrl, height: 1.1 },
  lampara1: { url: lampPropUrl, height: 2.4 },
  lampara2: { url: lampPropUrl, height: 2.4 },
};

/**
 * Carga un prop y **al llegar la imagen** le da su proporción real al sprite. El alto lo fija
 * el mundo —un farol mide lo que mide— y el ancho sale de los píxeles, que es lo único que
 * evita que un prop entre estirado.
 */
function loadProp(url: string, sprite: THREE.Sprite, heightMeters: number): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url, (loaded) => {
    const { width, height } = loaded.image as { width: number; height: number };
    sprite.scale.set((heightMeters * width) / height, heightMeters, 1);
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

interface CastEntry {
  readonly anchor: U1Anchor;
  readonly root: THREE.Group;
  readonly npc: NpcActor | null;
  readonly ohm: OhmActor | null;
  /** Material del prop, si lo tiene: los tintes por flag se aplican acá. */
  readonly propMaterial: THREE.SpriteMaterial | null;
}

export interface U1Cast {
  readonly root: THREE.Group;
  /** El autómata del pedestal. La cámara lo protege y el diagnóstico le habla. */
  readonly ohm: OhmActor;
  /** Reevalúa qué está presente. Se llama en cada cambio de flags. */
  refresh(): void;
  /** Devuelve el anclaje al alcance, ya resaltado en el mundo. */
  update(x: number, z: number, elapsedSeconds: number): U1Anchor | null;
  /** El prompt que corresponde mostrar, o `null`. Sale de `/jugar`, textual. */
  promptFor(anchor: U1Anchor): string;
  interact(anchor: U1Anchor): void;
  dispose(): void;
}

export function createU1Cast(onBench: (bench: BenchId, anchor: U1Anchor) => void): U1Cast {
  const root = new THREE.Group();
  root.name = 'u1_cast';
  const textures: THREE.Texture[] = [];
  const entries: CastEntry[] = [];

  for (const anchor of U1_ANCHORS) {
    const group = new THREE.Group();
    group.name = `anchor_${anchor.id}`;
    group.position.set(anchor.position.x, 0, anchor.position.z);

    const prop = PROPS[anchor.id];
    let propMaterial: THREE.SpriteMaterial | null = null;
    if (prop) {
      propMaterial = new THREE.SpriteMaterial({ transparent: true, alphaTest: 0.05 });
      const sprite = new THREE.Sprite(propMaterial);
      sprite.name = `prop_${anchor.id}`;
      // El pivote va en la base: los props se apoyan en el suelo, no flotan.
      sprite.center.set(0.5, 0);
      sprite.scale.set(prop.height, prop.height, 1);
      propMaterial.map = loadProp(prop.url, sprite, prop.height);
      textures.push(propMaterial.map);
      group.add(sprite);
    }

    let npc: NpcActor | null = null;
    let ohm: OhmActor | null = null;
    if (anchor.actor === 'ohm') {
      ohm = createOhmActor();
      // Ohm está sobre el pedestal, no en el piso.
      ohm.root.position.y = prop ? prop.height : 0;
      ohm.setFacing(anchor.facing ?? 270);
      group.add(ohm.root);
    } else if (anchor.actor) {
      npc = createNpcActor(anchor.actor);
      npc.setFacing(anchor.facing ?? 270);
      group.add(npc.root);
    }

    root.add(group);
    entries.push({ anchor, root: group, npc, ohm, propMaterial });
  }

  // Un solo aro que se mueve al anclaje activo: la proximidad elige, y se ve cuál eligió.
  const focusGeometry = new THREE.RingGeometry(0.52, 0.66, 24);
  const focusMaterial = new THREE.MeshBasicMaterial({
    color: 0xe8c98a,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const focusRing = new THREE.Mesh(focusGeometry, focusMaterial);
  focusRing.name = 'interaction_focus';
  focusRing.rotation.x = -Math.PI / 2;
  focusRing.position.y = 0.02;
  focusRing.visible = false;
  root.add(focusRing);

  function applyFlagTint(entry: CastEntry): void {
    if (!entry.propMaterial) return;
    const thing = thingOf(entry.anchor);
    // `/jugar` ya expresa el estado de cada prop como color por flags. Acá se usa como tinte
    // sobre el pixel art: la lámpara apagada se apaga de verdad, sin arte nuevo.
    const color = typeof thing.color === 'function' ? thing.color() : thing.color;
    entry.propMaterial.color.setHex(color);
  }

  function refresh(): void {
    for (const entry of entries) {
      const present = isPresent(entry.anchor);
      entry.root.visible = present;
      if (present) applyFlagTint(entry);
      if (entry.ohm) {
        // El autómata está dormido hasta que el circuito se cierra. Lo dice el flag, no acá.
        const thing = thingOf(entry.anchor);
        const color = typeof thing.color === 'function' ? thing.color() : thing.color;
        entry.ohm.setState(color === 0x4a4a4f ? 'dormido' : 'idle');
      }
    }
  }
  refresh();

  const ohmActor = entries.find((entry) => entry.ohm !== null)?.ohm;
  if (!ohmActor) throw new Error('La Unidad 1 no tiene anclaje para Ohm');

  return {
    root,
    ohm: ohmActor,
    refresh,
    update(x, z, elapsedSeconds) {
      const active = anchorInReach(x, z);
      focusRing.visible = active !== null;
      if (active) {
        focusRing.position.set(active.position.x, 0.02, active.position.z);
        // Latido lento: se nota que está vivo sin robarle atención a la escena.
        const pulse = 1 + Math.sin(elapsedSeconds * 3.2) * 0.06;
        focusRing.scale.set(pulse, pulse, 1);
      }
      return active;
    },
    promptFor(anchor) {
      return thingOf(anchor).prompt;
    },
    interact(anchor) {
      // Los tres bancos ocurren en el mundo. El resto sigue el camino de siempre.
      if (anchor.bench) {
        onBench(anchor.bench, anchor);
        return;
      }
      thingOf(anchor).onInteract();
    },
    dispose() {
      for (const entry of entries) {
        entry.npc?.dispose();
        entry.ohm?.dispose();
        entry.propMaterial?.dispose();
      }
      for (const texture of textures) texture.dispose();
      focusGeometry.dispose();
      focusMaterial.dispose();
      root.removeFromParent();
    },
  };
}
