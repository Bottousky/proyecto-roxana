import * as THREE from 'three';
import {
  CAMERA_ANCHORS,
  CAMERA_TRANSITION_VOLUMES,
  CAMERA_VIEW_OFFSET,
  CAMERA_ZOOM_MAX,
  CAMERA_ZOOM_MIN,
  VIEWPORT_PROFILES,
  cameraDistanceForSpan,
  clampTargetToAnchor,
  createCamera,
  verticalSpan,
  type CameraAnchorId,
  type CameraVariant,
  type ViewportProfileId,
} from './cameraConfig.ts';

const POSITION_HALF_LIFE_SECONDS = 0.32;
const TARGET_HALF_LIFE_SECONDS = 0.16;

const TRANSITION_SECONDS: Readonly<Record<string, number>> = {
  'C1_PORTAL_PLAZA>C2_TALLER': 0.9,
  'C2_TALLER>C3_DOOR_SPRING': 1.1,
};

interface TransitionState {
  readonly duration: number;
  elapsed: number;
  readonly fromPosition: THREE.Vector3;
  readonly fromTarget: THREE.Vector3;
}
export interface CameraControllerOptions {
  readonly variant: CameraVariant;
  readonly viewport: ViewportProfileId;
  readonly initialAnchor?: CameraAnchorId;
  readonly reducedMotion?: boolean;
}

export interface CameraControllerSnapshot {
  readonly variant: CameraVariant;
  readonly viewport: ViewportProfileId;
  readonly anchor: CameraAnchorId;
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly desiredPosition: readonly [number, number, number];
  readonly desiredTarget: readonly [number, number, number];
  readonly zoomFactor: number;
  readonly transitioning: boolean;
  readonly reducedMotion: boolean;
  readonly disposed: boolean;
}

function smootherstep(value: number): number {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function smoothstep(value: number): number {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function dampingAlpha(dt: number, halfLife: number): number {
  return 1 - Math.exp(-Math.LN2 * Math.max(0, dt) / halfLife);
}

function tuple(vector: THREE.Vector3): readonly [number, number, number] {
  return [vector.x, vector.y, vector.z];
}

export class AuthorCameraController {
  readonly camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  private readonly variant: CameraVariant;
  private readonly viewportId: ViewportProfileId;
  private anchorId: CameraAnchorId;
  private readonly currentTarget = new THREE.Vector3();
  private readonly desiredTarget = new THREE.Vector3();
  private readonly desiredPosition = new THREE.Vector3();
  private transition: TransitionState | null = null;
  private zoomFactor = 1;
  private reducedMotion: boolean;
  private disposed = false;

  constructor(options: CameraControllerOptions) {
    this.variant = options.variant;
    this.viewportId = options.viewport;
    this.anchorId = options.initialAnchor ?? 'C1_PORTAL_PLAZA';
    this.reducedMotion = options.reducedMotion ?? false;
    const anchor = CAMERA_ANCHORS[this.anchorId];
    this.camera = createCamera(this.variant, anchor, VIEWPORT_PROFILES[this.viewportId]);
    this.desiredTarget.copy(anchor.focus);
    this.currentTarget.copy(anchor.focus);
    this.recomputeDesiredPosition();
    this.camera.position.copy(this.desiredPosition);
    this.camera.lookAt(this.currentTarget);
  }

  private assertActive(): void {
    if (this.disposed) throw new Error('Camera controller is disposed');
  }

  private recomputeDesiredPosition(): void {
    const anchor = CAMERA_ANCHORS[this.anchorId];
    const span = verticalSpan(anchor, VIEWPORT_PROFILES[this.viewportId], this.zoomFactor);
    const distance = cameraDistanceForSpan(span);
    this.desiredPosition.copy(this.desiredTarget).addScaledVector(CAMERA_VIEW_OFFSET, distance);
    if (this.camera instanceof THREE.OrthographicCamera) {
      const aspect = VIEWPORT_PROFILES[this.viewportId].width / VIEWPORT_PROFILES[this.viewportId].height;
      this.camera.left = -span * aspect / 2;
      this.camera.right = span * aspect / 2;
      this.camera.top = span / 2;
      this.camera.bottom = -span / 2;
      this.camera.updateProjectionMatrix();
    }
  }

  setReducedMotion(enabled: boolean): void {
    this.assertActive();
    this.reducedMotion = enabled;
    if (enabled && this.transition) this.snapToDesired();
  }

  setZoomFactor(value: number): void {
    this.assertActive();
    this.zoomFactor = THREE.MathUtils.clamp(value, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX);
    this.recomputeDesiredPosition();
    if (this.reducedMotion) this.snapToDesired();
  }

  setLookTarget(target: Readonly<THREE.Vector3>): void {
    this.assertActive();
    this.desiredTarget.copy(clampTargetToAnchor(target, CAMERA_ANCHORS[this.anchorId]));
    this.recomputeDesiredPosition();
    if (this.reducedMotion) this.snapToDesired();
  }

  setAnchor(nextAnchor: CameraAnchorId): void {
    this.assertActive();
    if (nextAnchor === this.anchorId) return;
    const previous = this.anchorId;
    this.anchorId = nextAnchor;
    this.desiredTarget.copy(CAMERA_ANCHORS[nextAnchor].focus);
    this.recomputeDesiredPosition();
    if (this.reducedMotion) {
      this.snapToDesired();
      return;
    }
    const forwardKey = `${previous}>${nextAnchor}`;
    const reverseKey = `${nextAnchor}>${previous}`;
    this.transition = {
      duration: TRANSITION_SECONDS[forwardKey] ?? TRANSITION_SECONDS[reverseKey] ?? 0.9,
      elapsed: 0,
      fromPosition: this.camera.position.clone(),
      fromTarget: this.currentTarget.clone(),
    };
  }

  private snapToDesired(): void {
    this.transition = null;
    this.camera.position.copy(this.desiredPosition);
    this.currentTarget.copy(this.desiredTarget);
    this.camera.lookAt(this.currentTarget);
  }

  update(dtSeconds: number): void {
    this.assertActive();
    const dt = Math.min(Math.max(dtSeconds, 0), 0.1);
    if (this.transition) {
      this.transition.elapsed += dt;
      const progress = Math.min(1, this.transition.elapsed / this.transition.duration);
      this.camera.position.lerpVectors(this.transition.fromPosition, this.desiredPosition, smootherstep(progress));
      this.currentTarget.lerpVectors(this.transition.fromTarget, this.desiredTarget, smoothstep(progress));
      if (progress >= 1) this.transition = null;
    } else {
      this.camera.position.lerp(this.desiredPosition, dampingAlpha(dt, POSITION_HALF_LIFE_SECONDS));
      this.currentTarget.lerp(this.desiredTarget, dampingAlpha(dt, TARGET_HALF_LIFE_SECONDS));
    }
    this.camera.lookAt(this.currentTarget);
  }

  snapshot(): CameraControllerSnapshot {
    return {
      variant: this.variant,
      viewport: this.viewportId,
      anchor: this.anchorId,
      position: tuple(this.camera.position),
      target: tuple(this.currentTarget),
      desiredPosition: tuple(this.desiredPosition),
      desiredTarget: tuple(this.desiredTarget),
      zoomFactor: this.zoomFactor,
      transitioning: this.transition !== null,
      reducedMotion: this.reducedMotion,
      disposed: this.disposed,
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.transition = null;
    this.camera.clear();
    this.disposed = true;
  }
}

/** Seleccion por volumen con histeresis; nunca depende del render ni del pathfinding. */
export function selectCameraAnchor(
  current: CameraAnchorId,
  playerX: number,
): CameraAnchorId {
  const workshop = CAMERA_TRANSITION_VOLUMES.tallerThreshold;
  const door = CAMERA_TRANSITION_VOLUMES.doorApproach;
  if (current === 'C1_PORTAL_PLAZA') {
    return playerX >= workshop.crossingX ? 'C2_TALLER' : current;
  }
  if (current === 'C2_TALLER') {
    if (playerX < workshop.crossingX - workshop.hysteresisMeters) return 'C1_PORTAL_PLAZA';
    if (playerX >= door.crossingX) return 'C3_DOOR_SPRING';
    return current;
  }
  return playerX < door.crossingX - door.hysteresisMeters ? 'C2_TALLER' : current;
}
