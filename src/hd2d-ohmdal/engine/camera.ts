// HD-2D camera.
// Perspective camera with a narrow FOV (~22°) so it reads mostly orthographic
// but with a hint of depth that allows foreground/background separation.
// Fixed 30° downward tilt; rotates only on Y to follow player heading intent.

import * as THREE from "three";
import type { Vec2 } from "./math.ts";

export interface GameCamera {
  three: THREE.PerspectiveCamera;
  follow: (target: Vec2, dt: number) => void;
  setSize: (w: number, h: number) => void;
  pan: (to: Vec2, duration: number) => void;
  isPanning: () => boolean;
  setRegionFraming: (region: "plaza" | "puerta" | "manantial" | "taller" | "sendero") => void;
  applyCinematicPose: (pose: CinematicPose, duration: number) => void;
  followElevation: (playerY: number, dt: number) => void;
}

export interface CinematicPose {
  // World-space position the camera looks at.
  lookAt: Vec2;
  // Camera offset from the look-at point (in world units).
  offset: { x: number; y: number; z: number };
  // FOV in degrees during this pose.
  fov: number;
}

const TILT = Math.PI * 0.22; // 40° downward look.
const BASE_FOV = 48;

export function createCamera(viewport: { width: number; height: number }): GameCamera {
  // Aspect-aware narrow-FOV perspective. Looks "almost orthographic" while
  // letting the 3D world have real depth. A 48° FOV keeps perspective
  // distortion subtle while still fitting the 20m-wide Plaza.
  const three = new THREE.PerspectiveCamera(
    BASE_FOV,
    Math.max(0.0001, viewport.width / viewport.height),
    0.1,
    200,
  );

  // Camera sits back along +Z from the look-at point, raised, and tilted down.
  // Offset (0, 18, 24) gives a ~36.9° downward angle — proper 2.5D feel:
  // player fills the lower third, environment reads with real depth, walls
  // don't occlude. The 24m back-distance puts the camera 3m south of the
  // Portal arch (z=18) so the arch is in the background, not the
  // foreground, when the player is in the Plaza. Tuned for Plaza
  // (20m × 16m); at this distance the Plaza fits a 16:9 frame with a
  // little margin.
  const baseOffset = new THREE.Vector3(0, 18, 24);
  const baseLookAt = new THREE.Vector3(0, 0, 0);
  three.position.copy(baseLookAt).add(baseOffset);
  three.lookAt(baseLookAt);

  // Internal state.
  const lookAt = new THREE.Vector3(0, 0, 0);
  const desiredLookAt = new THREE.Vector3(0, 0, 0);
  const desiredOffset = baseOffset.clone();
  let desiredFov = BASE_FOV;
  let panT = 1; // 0..1, where 1 means "at the destination".
  let panDuration = 0;
  let panStartOffset = baseOffset.clone();
  let panStartLookAt = baseLookAt.clone();
  let panEndOffset = baseOffset.clone();
  let panEndLookAt = baseLookAt.clone();
  let panStartFov = BASE_FOV;
  let panEndFov = BASE_FOV;
  let panElapsed = 0;

  let framingZoom = 1.0; // multiplier on FOV per region.
  let elevationOffset = 0; // Y offset added to the camera height to follow sunken regions.
  let regionOffset: { x: number; y: number; z: number } | null = null; // per-region override of the camera offset.

  const setSize = (w: number, h: number) => {
    three.aspect = Math.max(0.0001, w / h);
    three.updateProjectionMatrix();
  };

  const follow = (target: Vec2, dt: number) => {
    // Pan animation overrides the smooth-follow when active.
    if (panT < 1) {
      panElapsed += dt;
      const t = Math.min(1, panElapsed / Math.max(0.001, panDuration));
      // Ease in/out (smoothstep).
      const e = t * t * (3 - 2 * t);
      lookAt.lerpVectors(panStartLookAt, panEndLookAt, e);
      const off = new THREE.Vector3().lerpVectors(panStartOffset, panEndOffset, e);
      desiredOffset.copy(off);
      desiredFov = THREE.MathUtils.lerp(panStartFov, panEndFov, e);
      panT = t;
    } else {
      // Smooth follow with damping (~0.18s time-constant).
      const k = 1 - Math.exp(-dt / 0.18);
      // LookAt follows the player but 1m above the ground (so the
      // player sprite is in the lower half of the screen).
      desiredLookAt.set(target.x, 1.0, target.y);
      lookAt.lerp(desiredLookAt, k);
    }
    const offX = regionOffset ? regionOffset.x : desiredOffset.x;
    const offY = regionOffset ? regionOffset.y : desiredOffset.y;
    const offZ = regionOffset ? regionOffset.z : desiredOffset.z;
    three.position.set(
      lookAt.x + offX,
      offY + elevationOffset,
      lookAt.z + offZ,
    );
    three.lookAt(lookAt);

    const targetFov = desiredFov * framingZoom;
    if (Math.abs(three.fov - targetFov) > 0.01) {
      three.fov = THREE.MathUtils.lerp(three.fov, targetFov, 0.12);
      three.updateProjectionMatrix();
    }
  };

  // The camera Y is offset by the player's ground Y (so sunken regions
  // are framed from above the patio, not from a far-away high vantage).
  // We damp the elevation to avoid sudden jumps.
  const followElevation = (playerY: number, _dt: number) => {
    // The desired camera Y is `desiredOffset.y - playerY` (so when the
    // player is at -1.5, the camera moves down by 1.5).
    const target = -playerY;
    elevationOffset = THREE.MathUtils.lerp(elevationOffset, target, 0.04);
  };

  const pan = (to: Vec2, duration: number) => {
    panStartOffset.copy(three.position).sub(lookAt);
    panStartLookAt.copy(lookAt);
    panEndOffset.copy(panStartOffset);
    panEndLookAt.set(to.x, 0, to.y);
    panStartFov = three.fov;
    panEndFov = BASE_FOV * framingZoom;
    panDuration = duration;
    panElapsed = 0;
    panT = 0;
  };

  const isPanning = () => panT < 1;

  const setRegionFraming: GameCamera["setRegionFraming"] = (region) => {
    // Plaza: 100%; Puerta: 95% (slight zoom in for intimacy); Manantial: 90% (slight zoom in); Taller: 100%; Sendero: 110% (closer).
    // For the Manantial we also override the camera offset so the camera
    // sits above the Puerta, looking down at the sunken patio. This
    // bypasses the Puerta's towers which would otherwise block the view.
    switch (region) {
      case "plaza":
        framingZoom = 1.0;
        regionOffset = null;
        break;
      case "puerta":
        framingZoom = 0.95;
        regionOffset = null;
        break;
      case "manantial":
        framingZoom = 0.9;
        // High-and-back, looking down at the Manantial patio. The Puerta
        // is at z=-16 (about 10m north of the Manantial), so the camera
        // being at lookAt+(0, 20, 12) puts it above the Puerta, with the
        // line of sight to the player not intersecting the towers.
        regionOffset = { x: 0, y: 20, z: 12 };
        break;
      case "taller":
        framingZoom = 1.0;
        regionOffset = null;
        break;
      case "sendero":
        framingZoom = 1.05;
        regionOffset = null;
        break;
    }
  };

  const applyCinematicPose = (pose: CinematicPose, duration: number) => {
    panStartOffset.copy(three.position).sub(lookAt);
    panStartLookAt.copy(lookAt);
    panEndOffset.set(pose.offset.x, pose.offset.y, pose.offset.z);
    panEndLookAt.set(pose.lookAt.x, 0, pose.lookAt.y);
    panStartFov = three.fov;
    panEndFov = pose.fov;
    panDuration = duration;
    panElapsed = 0;
    panT = 0;
  };

  // Initial pose at a known good spot (looking at Plaza center).
  three.position.set(0, 18, 24);
  three.lookAt(0, 0, 0);
  desiredOffset.copy(three.position);
  desiredFov = BASE_FOV;
  // Mark tilt direction visually for posterity.
  void TILT;

  return {
    three,
    follow,
    setSize,
    pan,
    isPanning,
    setRegionFraming,
    applyCinematicPose,
    followElevation,
  };
}
