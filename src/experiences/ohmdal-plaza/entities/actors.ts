import * as THREE from 'three';
import { PALETTE } from '../palette.ts';

export interface ActorSystem {
  playerGroup: THREE.Group;
  ohmGroup: THREE.Group;
  ohmEye: THREE.Mesh;
  ohmEyeLight: THREE.PointLight;
  ohmProbeA: THREE.Mesh;
  ohmProbeB: THREE.Mesh;
  eddaGroup: THREE.Group;
  lumenGroup: THREE.Group;
  villagerGroup: THREE.Group;
  update(delta: number, playerPos: THREE.Vector3, isMoving: boolean, moveHeading: number, isProbing: boolean): void;
}

function makeGradientTexture(): THREE.DataTexture {
  const data = new Uint8Array([
    50, 42, 36, 255,
    115, 96, 80, 255,
    190, 168, 140, 255,
    248, 235, 215, 255,
  ]);
  const tex = new THREE.DataTexture(data, 4, 1);
  tex.format = THREE.RGBAFormat;
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

export function buildActorSystem(scene: THREE.Scene): ActorSystem {
  const gradient = makeGradientTexture();
  const toon = (color: number, extra: Partial<THREE.MeshToonMaterialParameters> = {}) =>
    new THREE.MeshToonMaterial({ color, gradientMap: gradient, ...extra });

  const matSkin = toon(0xd8b898);
  const matEddaCoat = toon(PALETTE.edda);
  const matEddaHair = toon(0x8a4522);
  const matLumenApron = toon(0x6a4025);
  const matLumenBeard = toon(0xd0c4b4);
  const matOhmBody = toon(PALETTE.ohmCuerpo);
  const matOhmTrim = toon(PALETTE.cobre);
  const matCeramic = toon(PALETTE.ceramica);

  // --- 1. Player Group (Hidden in First-Person) ---
  const playerGroup = new THREE.Group();
  playerGroup.position.set(0, 0, -8.0);
  playerGroup.visible = false;
  scene.add(playerGroup);

  // Shadow blob
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x18120e, transparent: true, opacity: 0.45 });

  // --- 2. Ohm Automaton on Dais ---
  const ohmGroup = new THREE.Group();
  ohmGroup.position.set(0, 0.7, -2.0);
  scene.add(ohmGroup);

  // Ohm Shadow
  const ohmShadow = new THREE.Mesh(new THREE.CircleGeometry(0.28, 12), shadowMat);
  ohmShadow.rotation.x = -Math.PI / 2;
  ohmShadow.position.set(0, 0.65, -2.0);
  scene.add(ohmShadow);

  // Ohm Main Body (Jar/Canister shape)
  const ohmBody = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.65, 10), matOhmBody);
  ohmBody.position.y = 0.4;
  ohmBody.castShadow = true;
  ohmGroup.add(ohmBody);

  const ohmCap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 10), matOhmTrim);
  ohmCap.position.y = 0.75;
  ohmGroup.add(ohmCap);

  // Ceramic Top Insulator
  const ohmInsulator = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 8), matCeramic);
  ohmInsulator.position.y = 0.88;
  ohmGroup.add(ohmInsulator);

  // Cyclops Eye Lens
  const ohmEyeMat = new THREE.MeshBasicMaterial({ color: 0x60d0ff });
  const ohmEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), ohmEyeMat);
  ohmEye.position.set(0, 0.52, 0.28);
  ohmGroup.add(ohmEye);

  const ohmEyeLight = new THREE.PointLight(0x40a0e0, 0.8, 3.0);
  ohmEyeLight.position.set(0, 0.52, 0.38);
  ohmGroup.add(ohmEyeLight);

  // Contact Probes (Rotatable)
  const matProbeRed = toon(0xcc3322);
  const matProbeBlack = toon(0x222222);
  const ohmProbeA = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), matProbeRed);
  ohmProbeA.position.set(0.32, 0.4, 0.16);
  ohmProbeA.rotation.x = Math.PI / 4;
  ohmGroup.add(ohmProbeA);

  const ohmProbeB = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), matProbeBlack);
  ohmProbeB.position.set(-0.32, 0.4, 0.16);
  ohmProbeB.rotation.x = Math.PI / 4;
  ohmGroup.add(ohmProbeB);

  // --- 3. Edda (The Apprentice / Scholar) ---
  const eddaGroup = new THREE.Group();
  eddaGroup.position.set(4.2, 0, -2.5);
  scene.add(eddaGroup);

  const eddaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.85, 8), matEddaCoat);
  eddaTorso.position.y = 0.65;
  eddaTorso.castShadow = true;
  eddaGroup.add(eddaTorso);

  const eddaHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), matSkin);
  eddaHead.position.y = 1.25;
  eddaHead.castShadow = true;
  eddaGroup.add(eddaHead);

  const eddaHair = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.28, 8), matEddaHair);
  eddaHair.position.y = 1.32;
  eddaGroup.add(eddaHair);

  // --- 4. Lumen (Master of the Workshop) ---
  const lumenGroup = new THREE.Group();
  lumenGroup.position.set(-5.5, 0, -3.5);
  scene.add(lumenGroup);

  const lumenTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.9, 8), matLumenApron);
  lumenTorso.position.y = 0.68;
  lumenTorso.castShadow = true;
  lumenGroup.add(lumenTorso);

  const lumenHead = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 8), matSkin);
  lumenHead.position.y = 1.28;
  lumenHead.castShadow = true;
  lumenGroup.add(lumenHead);

  const lumenBeard = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.25, 6), matLumenBeard);
  lumenBeard.position.set(0, 1.15, 0.12);
  lumenGroup.add(lumenBeard);

  // --- 5. Villagers / Background Citizens ---
  const villagerGroup = new THREE.Group();
  villagerGroup.position.set(-3.5, 0, 4.5);
  scene.add(villagerGroup);

  const villagerTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.6, 8), toon(0x608055));
  villagerTorso.position.y = 0.45;
  villagerGroup.add(villagerTorso);

  const villagerHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), matSkin);
  villagerHead.position.y = 0.9;
  villagerGroup.add(villagerHead);

  // Internal animation clocks
  let animTime = 0;

  return {
    playerGroup,
    ohmGroup,
    ohmEye,
    ohmEyeLight,
    ohmProbeA,
    ohmProbeB,
    eddaGroup,
    lumenGroup,
    villagerGroup,
    update(delta: number, _playerPos: THREE.Vector3, _isMoving: boolean, _moveHeading: number, isProbing: boolean) {
      animTime += delta;

      // Bobbing floating height on dais
      const floatY = 0.7 + Math.sin(animTime * 2.5) * 0.04;
      ohmGroup.position.y = floatY;

      // Probing probe animation
      if (isProbing) {
        ohmProbeA.rotation.x = Math.PI / 2 + Math.sin(animTime * 6) * 0.2;
        ohmProbeB.rotation.x = Math.PI / 2 - Math.sin(animTime * 6) * 0.2;
      } else {
        ohmProbeA.rotation.x = Math.PI / 4;
        ohmProbeB.rotation.x = Math.PI / 4;
      }

      // NPC Idle breathing / gestures
      eddaTorso.position.y = 0.65 + Math.sin(animTime * 2.2) * 0.015;
      lumenTorso.position.y = 0.68 + Math.sin(animTime * 1.8) * 0.02;
      villagerTorso.position.y = 0.45 + Math.sin(animTime * 2.8) * 0.02;
    },
  };
}
