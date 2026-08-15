// Banco diegético de Ohm — puzzle 1 (Reactivar a Ohm) jugado en 3D.
//
// El modelo de la regla vive en `puzzles/ohmModel.ts` y es el mismo que usa el banco modal
// de `/jugar` (familia P1 del ohmdal-puzzle-grammar_v1.md: continuidad). Acá no se
// reescribe la regla: se la dibuja en el mundo y se la manipula con la tecla de siempre.
//
// Lo que muestra el mundo:
//   - Cinco huecos del anillo del pedestal se dibujan como **puntos luminosos** en el suelo
//     alrededor del pedestal (los gaps g1..g5 de PEDESTAL_RING, en su orden topológico).
//   - El jugador camina hasta uno y pulsa la tecla de acción para cubrirlo / descubrirlo.
//   - g3 está **partido** (coverRejection devuelve 'partido'): cubrirlo no tiene efecto y
//     la pista queda visible como marca roja.
//   - Cuando `readCircuit(covered).complete` pasa a true, se cierra el banco desde el
//     caller (`onSolved`), que es quien setea `ohmAwake`.
//
// El contrato visual es el de la guía de bancos diegéticos (diseno-bancos-ohm-lumen.md):
// nada de modal a pantalla completa, sólo un primer plano sobre el pedestal con la cámara
// que ya tenemos.
import * as THREE from 'three';
import {
  PEDESTAL_RING,
  coverRejection,
  readCircuit,
  type CircuitState,
} from '../puzzles/ohmModel.ts';

export interface OhmPedestalWorldOptions {
  /** Posición del pedestal en coordenadas de mundo. */
  readonly pedestal: { readonly x: number; readonly z: number };
  /** Escena a la que se agregan los marcadores (módulo padre lo libera). */
  readonly scene: THREE.Scene;
  /** Se llama cuando el jugador cierra el anillo: acá afuera se marca `ohmAwake`. */
  readonly onSolved: () => void;
}

export interface OhmPedestalWorld {
  /** Abre el banco: muestra los marcadores, permite la interacción por tecla de acción. */
  open(): void;
  /** Cierra el banco: oculta los marcadores. No resuelve el puzzle. */
  close(): void;
  /** ¿Está abierto? */
  isOpen(): boolean;
  /**
   * Procesa la pulsación de la tecla de acción cuando el banco está abierto.
   * Devuelve `true` si consumió la pulsación (la cámara no debe disparar el diagnóstico).
   */
  tryActivateGap(worldPosition: { x: number; z: number }): boolean;
  /** Estado actual para diagnóstico / snapshot. */
  state(): CircuitState;
  /** Marcadores visibles para oclusión y HUD. */
  gapMarkers(): readonly THREE.Object3D[];
  /** Libera geometría / materiales cuando el mundo se desmonta. */
  dispose(): void;
}

/**
 * Posiciones de los cinco huecos del anillo del pedestal, en coordenadas de mundo, en
 * metros alrededor del pedestal. Son **datos**: el modelo dice que hay cinco gaps, el
 * mundo los coloca en círculo siguiendo la lectura topológica del anillo (ida por arriba,
 * vuelta por abajo). Si los anillos cambian, este mapa cambia con ellos.
 */
function defaultGapPositions(pedestal: { x: number; z: number }): readonly {
  readonly id: string;
  readonly x: number;
  readonly z: number;
}[] {
  return [
    { id: 'g1', x: pedestal.x, z: pedestal.z - 1.6 }, // ida, por arriba
    { id: 'g2', x: pedestal.x + 1.3, z: pedestal.z }, // atajo
    { id: 'g3', x: pedestal.x + 0.5, z: pedestal.z + 1.2 }, // atajo partido
    { id: 'g4', x: pedestal.x - 0.6, z: pedestal.z + 1.4 }, // vuelta larga
    { id: 'g5', x: pedestal.x - 1.4, z: pedestal.z + 0.4 }, // vuelta larga
  ];
}

const COVER_RADIUS_METERS = 1.0;

export function createOhmPedestalWorldBench(options: OhmPedestalWorldOptions): OhmPedestalWorld {
  const { pedestal, scene, onSolved } = options;
  const gapData = defaultGapPositions(pedestal);

  // Estado del puzzle. `covered` es lo que se manda a `readCircuit`. No mutamos el set:
  // copiamos como en `ohmModel.toggleCover`.
  let covered: ReadonlySet<string> = new Set();
  let open = false;
  let solvedNotified = false;

  // Materiales vivos: uno para huecos abiertos, otro para los cubiertos, otro para el partido.
  const openMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8c98a,
    emissive: 0xa07530,
    emissiveIntensity: 0.9,
    roughness: 0.4,
    metalness: 0.5,
  });
  const coveredMaterial = new THREE.MeshStandardMaterial({
    color: 0x7ad4b6,
    emissive: 0x1f7b72,
    emissiveIntensity: 1.1,
    roughness: 0.3,
    metalness: 0.6,
  });
  const brokenMaterial = new THREE.MeshStandardMaterial({
    color: 0x9a3a3a,
    emissive: 0x4a0e0e,
    emissiveIntensity: 0.6,
    roughness: 0.5,
    metalness: 0.4,
  });

  // Cada hueco es un aro de cobre levantado del suelo y un disco que aparece cuando está
  // cubierto. Cinco huecos = cinco pares; coste de triángulos despreciable.
  const markerGroup = new THREE.Group();
  markerGroup.name = 'OHM_PEDESTAL_GAPS';
  markerGroup.visible = false;
  const ringGeometry = new THREE.RingGeometry(0.18, 0.36, 16);
  const fillGeometry = new THREE.CylinderGeometry(0.32, 0.32, 0.06, 16);

  const segments = PEDESTAL_RING.segments;
  const markers: Array<{ id: string; x: number; z: number; ring: THREE.Mesh; fill: THREE.Mesh }> = [];
  for (const position of gapData) {
    const segment = segments.find((candidate) => candidate.id === position.id);
    if (!segment) continue;
    const ring = new THREE.Mesh(ringGeometry, openMaterial);
    ring.name = `OHM_GAP_RING_${position.id}`;
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(position.x, 0.02, position.z);

    const fill = new THREE.Mesh(fillGeometry, openMaterial);
    fill.name = `OHM_GAP_FILL_${position.id}`;
    fill.position.set(position.x, 0.03, position.z);
    fill.visible = false;

    markerGroup.add(ring, fill);
    markers.push({ id: position.id, x: position.x, z: position.z, ring, fill });
  }

  scene.add(markerGroup);

  function refreshMarkers(): void {
    for (const marker of markers) {
      const segment = segments.find((candidate) => candidate.id === marker.id);
      if (!segment) continue;
      if (segment.broken === true) {
        marker.ring.material = brokenMaterial;
        marker.fill.visible = false;
        continue;
      }
      const isCovered = covered.has(marker.id);
      marker.ring.material = isCovered ? coveredMaterial : openMaterial;
      marker.fill.visible = isCovered;
      marker.fill.material = coveredMaterial;
    }
  }
  refreshMarkers();

  function tryActivateGap(worldPosition: { x: number; z: number }): boolean {
    if (!open) return false;
    let nearest: { marker: typeof markers[number]; distance: number } | null = null;
    for (const marker of markers) {
      const dx = marker.x - worldPosition.x;
      const dz = marker.z - worldPosition.z;
      const distance = Math.hypot(dx, dz);
      if (distance > COVER_RADIUS_METERS) continue;
      if (nearest === null || distance < nearest.distance) nearest = { marker, distance };
    }
    if (!nearest) return false;
    const segmentId = nearest.marker.id;
    if (coverRejection(PEDESTAL_RING, covered, segmentId) === 'partido') {
      // Cubrir un partido no cambia nada. La pista es el color roto, no un cartel.
      return true;
    }
    const next = new Set(covered);
    if (next.has(segmentId)) next.delete(segmentId);
    else next.add(segmentId);
    covered = next;
    refreshMarkers();
    if (!solvedNotified && readCircuit(PEDESTAL_RING, covered).complete) {
      solvedNotified = true;
      onSolved();
    }
    return true;
  }

  return {
    open() {
      if (open) return;
      open = true;
      markerGroup.visible = true;
      refreshMarkers();
    },
    close() {
      if (!open) return;
      open = false;
      markerGroup.visible = false;
    },
    isOpen() {
      return open;
    },
    tryActivateGap,
    state(): CircuitState {
      return readCircuit(PEDESTAL_RING, covered).state;
    },
    gapMarkers() {
      return markerGroup.children;
    },
    dispose() {
      markerGroup.removeFromParent();
      ringGeometry.dispose();
      fillGeometry.dispose();
      openMaterial.dispose();
      coveredMaterial.dispose();
      brokenMaterial.dispose();
    },
  };
}
