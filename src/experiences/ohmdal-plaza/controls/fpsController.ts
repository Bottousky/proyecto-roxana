import * as THREE from 'three';

export interface FpsController {
  camera: THREE.PerspectiveCamera;
  position: THREE.Vector3;
  update(delta: number, colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[]): boolean;
  lock(): void;
  unlock(): void;
  isLocked(): boolean;
  destroy(): void;
}

export function createFpsController(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
  initialPos: THREE.Vector3 = new THREE.Vector3(0, 1.68, -8.0),
): FpsController {
  const position = initialPos.clone();
  camera.position.copy(position);

  let pitch = 0;
  let yaw = Math.PI; // Face towards North initially
  let isPointerLocked = false;

  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  camera.rotation.order = 'YXZ';

  // Sensitivity
  const lookSpeed = 0.0022;
  const walkSpeed = 4.8;
  const playerRadius = 0.4;
  let headBobTimer = 0;

  // Pointer Lock Handlers
  const onMouseMove = (e: MouseEvent) => {
    if (!isPointerLocked) return;

    yaw -= e.movementX * lookSpeed;
    pitch -= e.movementY * lookSpeed;
    pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));

    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  };

  const onPointerLockChange = () => {
    isPointerLocked = document.pointerLockElement === domElement;
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('pointerlockchange', onPointerLockChange);

  // Keyboard Handlers
  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keys.forward = true;
    if (k === 's' || k === 'arrowdown') keys.backward = true;
    if (k === 'a' || k === 'arrowleft') keys.left = true;
    if (k === 'd' || k === 'arrowright') keys.right = true;
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keys.forward = false;
    if (k === 's' || k === 'arrowdown') keys.backward = false;
    if (k === 'a' || k === 'arrowleft') keys.left = false;
    if (k === 'd' || k === 'arrowright') keys.right = false;
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Touch / Mobile drag support
  let touchStartX = 0;
  let touchStartY = 0;
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartX = e.touches[0]!.clientX;
      touchStartY = e.touches[0]!.clientY;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const dx = e.touches[0]!.clientX - touchStartX;
      const dy = e.touches[0]!.clientY - touchStartY;
      touchStartX = e.touches[0]!.clientX;
      touchStartY = e.touches[0]!.clientY;

      yaw -= dx * 0.005;
      pitch -= dy * 0.005;
      pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));

      camera.rotation.set(pitch, yaw, 0, 'YXZ');
    }
  };

  domElement.addEventListener('touchstart', onTouchStart, { passive: true });
  domElement.addEventListener('touchmove', onTouchMove, { passive: true });

  const isBlocked = (x: number, z: number, colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[]) => {
    for (const c of colliders) {
      if (x > c.minX - playerRadius && x < c.maxX + playerRadius && z > c.minZ - playerRadius && z < c.maxZ + playerRadius) {
        return true;
      }
    }
    return false;
  };

  return {
    camera,
    position,
    lock() {
      domElement.requestPointerLock?.();
    },
    unlock() {
      document.exitPointerLock?.();
    },
    isLocked() {
      return isPointerLocked;
    },
    update(delta: number, colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[]): boolean {
      // Calculate movement vector in camera yaw space
      let forward = 0;
      let strafe = 0;

      if (keys.forward) forward += 1;
      if (keys.backward) forward -= 1;
      if (keys.left) strafe -= 1;
      if (keys.right) strafe += 1;

      const isMoving = forward !== 0 || strafe !== 0;

      if (isMoving) {
        const fwdX = -Math.sin(yaw);
        const fwdZ = -Math.cos(yaw);
        const rgtX = Math.cos(yaw);
        const rgtZ = -Math.sin(yaw);

        const speed = walkSpeed * delta;
        let moveX = (forward * fwdX + strafe * rgtX);
        let moveZ = (forward * fwdZ + strafe * rgtZ);
        const len = Math.hypot(moveX, moveZ);
        if (len > 0.001) {
          moveX = (moveX / len) * speed;
          moveZ = (moveZ / len) * speed;
        }

        if (!isBlocked(position.x + moveX, position.z, colliders)) {
          position.x += moveX;
        }
        if (!isBlocked(position.x, position.z + moveZ, colliders)) {
          position.z += moveZ;
        }

        // Head bob
        headBobTimer += delta * 10;
        camera.position.y = 1.68 + Math.sin(headBobTimer) * 0.04;
      } else {
        headBobTimer = 0;
        camera.position.y = 1.68;
      }

      camera.position.x = position.x;
      camera.position.z = position.z;

      return isMoving;
    },
    destroy() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);
    },
  };
}
