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
  connector: SVGLineElement;
  embedded: boolean;
  title: string;
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
  const labelSizes = new Map<VoxelZoneId, { width: number; height: number }>();
  let lastMeasuredWidth = -1;
  document.fonts?.ready.then(() => { lastMeasuredWidth = -1; });
  container.replaceChildren();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  Object.assign(svg.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' });
  container.append(svg);

  for (const room of rooms) {
    const anchor = anchors.get(room.id);
    if (!anchor) continue;
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'rx-school3d__label';
    element.dataset.room = room.id;
    element.style.setProperty('--room-accent', room.accent);
    element.title = room.title;
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
    const connector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    connector.setAttribute('stroke', '#d6be8a');
    connector.setAttribute('stroke-opacity', '.44');
    connector.setAttribute('stroke-width', '.8');
    svg.append(connector);
    entries.push({ id: room.id, element, anchor, connector, embedded: !!room.embedded, title: room.shortTitle });
  }

  return {
    entries,

    update(camera, width, height, selected) {
      const compact = window.matchMedia('(max-width: 700px)').matches;
      if (lastMeasuredWidth !== width) {
        // Batch every write, then every measurement. Do not force eleven
        // separate layouts per frame while the scene camera animates.
        for (const entry of entries) {
          entry.element.style.minHeight = compact ? '38px' : '';
          const text = entry.element.querySelector<HTMLElement>('.rx-school3d__label-text');
          const glyphs: Partial<Record<VoxelZoneId, string>> = { biblioteca: '▤', logros: '◇', audiovisual: '▷' };
          if (text) {
            text.textContent = compact && entry.embedded ? glyphs[entry.id] ?? entry.title : entry.title;
            text.style.fontSize = compact && entry.embedded ? '17px' : '';
          }
        }
        for (const entry of entries) {
          const measured = entry.element.offsetWidth;
          if (measured > 0) labelSizes.set(entry.id, { width: measured, height: entry.element.offsetHeight });
        }
        lastMeasuredWidth = width;
      }
      const occupied: Array<{ x: number; y: number; width: number; height: number }> = [];
      // Place the main rooms first. Embedded services receive short callouts
      // when the hall projects several anchors onto the same small area.
      const ordered = [...entries].sort((a, b) => Number(a.embedded) - Number(b.embedded));
      for (const entry of ordered) {
        // La etiqueta cuelga por encima del cartel de la sala, no del suelo.
        entry.anchor.getWorldPosition(projected);
        projected.y += entry.embedded ? 3.2 : 4.6;
        projected.project(camera);

        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        const onScreen =
          projected.z < 1 && x > -80 && x < width + 80 && y > -60 && y < height + 60;
        // Con una sala abierta, el resto de rótulos estorban la lectura.
        const visible = onScreen && (selected === null || selected === entry.id);

        entry.element.classList.toggle('is-visible', visible);
        entry.connector.style.display = 'none';
        if (!visible) continue;
        const labelWidth = labelSizes.get(entry.id)?.width ?? 90;
        const labelHeight = labelSizes.get(entry.id)?.height ?? (compact ? 38 : 32);
        const clampX = (value: number) => THREE.MathUtils.clamp(value, labelWidth / 2 + 9, width - labelWidth / 2 - 9);
        const clampY = (value: number) => THREE.MathUtils.clamp(value, labelHeight + 8, height - 8);
        let labelX = clampX(x);
        let labelY = clampY(y);
        const intersects = (cx: number, cy: number) => occupied.some((rect) =>
          Math.abs(cx - rect.x) < (labelWidth + rect.width) / 2 + 6 &&
          cy > rect.y - rect.height - 6 && cy - labelHeight < rect.y + 6,
        );
        if (intersects(labelX, labelY)) {
          let found = false;
          for (let distance = 0; distance <= 7 && !found; distance++) {
            for (const direction of distance === 0 ? [0] : [-1, 1]) {
              for (const shift of [0, 12, -12, 24, -24, 38, -38, 52, -52]) {
                const candidateY = clampY(y + direction * distance * (labelHeight + 7));
                const candidateX = clampX(x + shift);
                if (!intersects(candidateX, candidateY)) {
                  labelX = candidateX; labelY = candidateY; found = true; break;
                }
              }
              if (found) break;
            }
          }
        }
        occupied.push({ x: labelX, y: labelY, width: labelWidth, height: labelHeight });
        entry.element.style.transform = `translate3d(${Math.round(labelX)}px, ${Math.round(labelY)}px, 0) translate(-50%, -100%)`;
        if (Math.abs(labelX - x) > 12 || Math.abs(labelY - y) > 12) {
          entry.connector.setAttribute('x1', String(x));
          entry.connector.setAttribute('y1', String(y));
          entry.connector.setAttribute('x2', String(labelX));
          entry.connector.setAttribute('y2', String(labelY > y ? labelY - labelHeight : labelY));
          entry.connector.style.display = '';
        }
      }
    },

    setState(id, state, label) {
      const entry = entries.find((candidate) => candidate.id === id);
      if (!entry) return;
      entry.element.dataset.state = state;
      const slot = entry.element.querySelector<HTMLElement>('.rx-school3d__label-state');
      if (slot) slot.textContent = label;
      entry.element.setAttribute('aria-label', `${entry.title} — ${label}`);
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
