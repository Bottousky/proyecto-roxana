// Etiquetas de sala en DOM, proyectadas desde las anclas 3D del GLB.
//
// Antes los rótulos eran texto extruido dentro del modelo: costaban el 60% de
// los triángulos de la escena y aun así no se leían. En DOM se leen siempre,
// se traducen, respetan el tamaño de fuente del sistema, son foco de teclado y
// no pesan nada.

import * as THREE from 'three';
import type { VoxelRoom, VoxelZoneId, VoxelZoneState } from './voxelSchoolModel.ts';

export interface RoomLabelEntry {
  id: VoxelZoneId;
  element: HTMLButtonElement;
  anchor: THREE.Object3D;
}

export interface LabelLayer {
  entries: RoomLabelEntry[];
  update(camera: THREE.Camera, width: number, height: number, selected: VoxelZoneId | null): void;
  setState(id: VoxelZoneId, state: VoxelZoneState, label: string): void;
  setHovered(id: VoxelZoneId | null): void;
  dispose(): void;
}

const projected = new THREE.Vector3();

export function createRoomLabels(
  container: HTMLElement,
  rooms: readonly VoxelRoom[],
  anchors: Map<VoxelZoneId, THREE.Object3D>,
  onSelect: (id: VoxelZoneId) => void,
  onHover: (id: VoxelZoneId | null) => void,
): LabelLayer {
  const entries: RoomLabelEntry[] = [];
  container.replaceChildren();

  for (const room of rooms) {
    const anchor = anchors.get(room.id);
    if (!anchor) continue;
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'rx-school3d__label';
    element.dataset.room = room.id;
    // Afordancia visual y de puntero. El camino accesible es el menú «Salas»
    // más las flechas del teclado, que ya anuncian el mismo estado: dejarlas
    // también en el orden de tabulación duplicaría cada sala en el lector.
    element.tabIndex = -1;
    element.innerHTML =
      `<span class="rx-school3d__label-dot" aria-hidden="true"></span>` +
      `<span class="rx-school3d__label-text">${room.shortTitle}</span>` +
      `<span class="rx-school3d__label-state"></span>`;
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      onSelect(room.id);
    });
    element.addEventListener('pointerenter', () => onHover(room.id));
    element.addEventListener('pointerleave', () => onHover(null));
    element.addEventListener('focus', () => onHover(room.id));
    element.addEventListener('blur', () => onHover(null));
    container.append(element);
    entries.push({ id: room.id, element, anchor });
  }

  return {
    entries,

    update(camera, width, height, selected) {
      for (const entry of entries) {
        // La etiqueta cuelga por encima del cartel de la sala, no del suelo.
        entry.anchor.getWorldPosition(projected);
        projected.y += 4.6;
        projected.project(camera);

        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        const onScreen =
          projected.z < 1 && x > -80 && x < width + 80 && y > -60 && y < height + 60;
        // Con una sala abierta, el resto de rótulos estorban la lectura.
        const visible = onScreen && (selected === null || selected === entry.id);

        entry.element.classList.toggle('is-visible', visible);
        if (!visible) continue;
        entry.element.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%, -100%)`;
      }
    },

    setState(id, state, label) {
      const entry = entries.find((candidate) => candidate.id === id);
      if (!entry) return;
      entry.element.dataset.state = state;
      const slot = entry.element.querySelector<HTMLElement>('.rx-school3d__label-state');
      if (slot) slot.textContent = label;
      entry.element.setAttribute('aria-label', `${entry.element.querySelector('.rx-school3d__label-text')?.textContent ?? ''} — ${label}`);
    },

    setHovered(id) {
      for (const entry of entries) {
        entry.element.classList.toggle('is-hovered', entry.id === id);
      }
    },

    dispose() {
      container.replaceChildren();
      entries.length = 0;
    },
  };
}
