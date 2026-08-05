import * as THREE from 'three';

const BLOCKED_FRAMES_TO_FADE = 2;
const CLEAR_FRAMES_TO_RESTORE = 6;
const FADED_OPACITY = 0.18;
const FADE_SECONDS = 0.12;
const RESTORE_SECONDS = 0.18;

export interface OcclusionBinding {
  readonly id: string;
  readonly object: THREE.Object3D;
  setOpacity(opacity: number): void;
}

interface OcclusionState {
  readonly binding: OcclusionBinding;
  blockedFrames: number;
  clearFrames: number;
  opacity: number;
  desiredOpacity: number;
}

export interface OcclusionDiagnostics {
  readonly disposed: boolean;
  readonly targets: readonly {
    id: string;
    opacity: number;
    blockedFrames: number;
    clearFrames: number;
  }[];
}

function moveTowards(current: number, target: number, maximumDelta: number): number {
  if (Math.abs(target - current) <= maximumDelta) return target;
  return current + Math.sign(target - current) * maximumDelta;
}

function taggedOccluder(object: THREE.Object3D | null): THREE.Object3D | null {
  let current = object;
  while (current) {
    if (current.userData.cameraOccluder === true || current.userData.cameraRoof === true) return current;
    current = current.parent;
  }
  return null;
}

/**
 * Raycast puro de consulta. Solo devuelve objetos explicitamente etiquetados y
 * descarta impactos situados detras del socket protegido.
 */
export function findBlockedOccluderIds(
  cameraPosition: Readonly<THREE.Vector3>,
  protectedSockets: readonly Readonly<THREE.Vector3>[],
  candidates: readonly THREE.Object3D[],
): Set<string> {
  const raycaster = new THREE.Raycaster();
  const blocked = new Set<string>();
  for (const socket of protectedSockets) {
    const direction = new THREE.Vector3().subVectors(socket, cameraPosition);
    const distance = direction.length();
    if (distance <= 0.001) continue;
    raycaster.set(cameraPosition, direction.normalize());
    raycaster.far = Math.max(0, distance - 0.01);
    for (const hit of raycaster.intersectObjects([...candidates], true)) {
      const occluder = taggedOccluder(hit.object);
      if (occluder) blocked.add(occluder.name);
    }
  }
  return blocked;
}

export class CameraOcclusionController {
  private readonly states: OcclusionState[];
  private disposed = false;

  constructor(bindings: readonly OcclusionBinding[]) {
    this.states = bindings.map((binding) => ({
      binding,
      blockedFrames: 0,
      clearFrames: CLEAR_FRAMES_TO_RESTORE,
      opacity: 1,
      desiredOpacity: 1,
    }));
  }

  update(blockedIds: ReadonlySet<string>, dtSeconds: number, reducedMotion = false): void {
    if (this.disposed) throw new Error('Occlusion controller is disposed');
    const dt = Math.min(Math.max(dtSeconds, 0), 0.1);
    for (const state of this.states) {
      if (blockedIds.has(state.binding.id)) {
        state.blockedFrames += 1;
        state.clearFrames = 0;
        if (state.blockedFrames >= BLOCKED_FRAMES_TO_FADE) state.desiredOpacity = FADED_OPACITY;
      } else {
        state.clearFrames += 1;
        state.blockedFrames = 0;
        if (state.clearFrames >= CLEAR_FRAMES_TO_RESTORE) state.desiredOpacity = 1;
      }
      if (reducedMotion) {
        state.opacity = state.desiredOpacity;
      } else {
        const duration = state.desiredOpacity < state.opacity ? FADE_SECONDS : RESTORE_SECONDS;
        state.opacity = moveTowards(
          state.opacity,
          state.desiredOpacity,
          (1 - FADED_OPACITY) * dt / duration,
        );
      }
      state.binding.setOpacity(state.opacity);
    }
  }

  diagnostics(): OcclusionDiagnostics {
    return {
      disposed: this.disposed,
      targets: this.states.map((state) => ({
        id: state.binding.id,
        opacity: state.opacity,
        blockedFrames: state.blockedFrames,
        clearFrames: state.clearFrames,
      })),
    };
  }

  dispose(): void {
    if (this.disposed) return;
    for (const state of this.states) {
      state.opacity = 1;
      state.desiredOpacity = 1;
      state.binding.setOpacity(1);
    }
    this.disposed = true;
  }
}
