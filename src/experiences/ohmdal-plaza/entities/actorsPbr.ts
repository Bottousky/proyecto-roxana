import * as THREE from 'three';
import {
  createBrassPbrMaterial,
  createCeramicPbrMaterial,
  createCopperPbrMaterial,
} from '../rendering/proceduralPbr.ts';

export interface PbrActorSystem {
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

export function buildPbrActorSystem(scene: THREE.Scene): PbrActorSystem {
  const matSkin = new THREE.MeshStandardMaterial({ color: 0xdcb89a, roughness: 0.65, metalness: 0.05 });
  const matEddaCoat = new THREE.MeshStandardMaterial({ color: 0x8a4522, roughness: 0.78, metalness: 0.05 });
  const matEddaHair = new THREE.MeshStandardMaterial({ color: 0x3a1f14, roughness: 0.9, metalness: 0.0 });
  const matLumenApron = new THREE.MeshStandardMaterial({ color: 0x5a3822, roughness: 0.85, metalness: 0.05 });
  const matLumenBeard = new THREE.MeshStandardMaterial({ color: 0xc8bcac, roughness: 0.9, metalness: 0.0 });

  const matOhmBrass = createBrassPbrMaterial();
  const matOhmTrim = createCopperPbrMaterial(true);
  const matCeramic = createCeramicPbrMaterial();

  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x140e0a, transparent: true, opacity: 0.55 });

  // --- 1. Player Group (Hidden in First-Person) ---
  const playerGroup = new THREE.Group();
  playerGroup.position.set(0, 0, -8.0);
  playerGroup.visible = false; // 1st person camera owns view
  scene.add(playerGroup);

  // --- 2. Ohm Automaton Entity on Central Dais ---
  const ohmGroup = new THREE.Group();
  ohmGroup.position.set(0, 0.7, -2.0);
  scene.add(ohmGroup);

  const ohmShadow = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), shadowMat);
  ohmShadow.rotation.x = -Math.PI / 2;
  ohmShadow.position.set(0, 0.65, -2.0);
  scene.add(ohmShadow);

  // Main Polished Brass Body
  const ohmBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.72, 16), matOhmBrass);
  ohmBody.position.y = 0.45;
  ohmBody.castShadow = true;
  ohmGroup.add(ohmBody);

  const ohmCap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16), matOhmTrim);
  ohmCap.position.y = 0.82;
  ohmCap.castShadow = true;
  ohmGroup.add(ohmCap);

  // Ceramic Crown Insulator
  const ohmInsulator = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.16, 12), matCeramic);
  ohmInsulator.position.y = 0.96;
  ohmGroup.add(ohmInsulator);

  // Cyclops Emissive Lens
  const ohmEyeMat = new THREE.MeshStandardMaterial({
    color: 0x90e8ff,
    emissive: 0x2080d0,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  const ohmEye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), ohmEyeMat);
  ohmEye.position.set(0, 0.58, 0.3);
  ohmGroup.add(ohmEye);

  const ohmEyeLight = new THREE.PointLight(0x40a0e0, 0.8, 3.0);
  ohmEyeLight.position.set(0, 0.58, 0.45);
  ohmGroup.add(ohmEyeLight);

  // Articulated Probes
  const ohmProbeA = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0xdc3528, roughness: 0.3 }));
  ohmProbeA.position.set(0.36, 0.45, 0.18);
  ohmProbeA.rotation.x = Math.PI / 4;
  ohmGroup.add(ohmProbeA);

  const ohmProbeB = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3 }));
  ohmProbeB.position.set(-0.36, 0.45, 0.18);
  ohmProbeB.rotation.x = Math.PI / 4;
  ohmGroup.add(ohmProbeB);

  // --- 3. Edda ---
  const eddaGroup = new THREE.Group();
  eddaGroup.position.set(4.2, 0, -2.5);
  scene.add(eddaGroup);

  const eddaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.9, 12), matEddaCoat);
  eddaTorso.position.y = 0.7;
  eddaTorso.castShadow = true;
  eddaGroup.add(eddaTorso);

  const eddaHead = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 12), matSkin);
  eddaHead.position.y = 1.32;
  eddaHead.castShadow = true;
  eddaGroup.add(eddaHead);

  const eddaHair = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.3, 12), matEddaHair);
  eddaHair.position.y = 1.38;
  eddaGroup.add(eddaHair);

  // --- 4. Lumen ---
  const lumenGroup = new THREE.Group();
  lumenGroup.position.set(-5.5, 0, -3.5);
  scene.add(lumenGroup);

  const lumenTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.95, 12), matLumenApron);
  lumenTorso.position.y = 0.72;
  lumenTorso.castShadow = true;
  lumenGroup.add(lumenTorso);

  const lumenHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), matSkin);
  lumenHead.position.y = 1.36;
  lumenHead.castShadow = true;
  lumenGroup.add(lumenHead);

  const lumenBeard = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.26, 8), matLumenBeard);
  lumenBeard.position.set(0, 1.22, 0.14);
  lumenGroup.add(lumenBeard);

  // --- 5. Villagers ---
  const villagerGroup = new THREE.Group();
  villagerGroup.position.set(-3.5, 0, 4.5);
  scene.add(villagerGroup);

  const villagerTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.65, 10), new THREE.MeshStandardMaterial({ color: 0x587850 }));
  villagerTorso.position.y = 0.48;
  villagerTorso.castShadow = true;
  villagerGroup.add(villagerTorso);

  const villagerHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), matSkin);
  villagerHead.position.y = 0.95;
  villagerGroup.add(villagerHead);

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

      // Ohm idle breathing on Dais
      const floatY = 0.7 + Math.sin(animTime * 2.0) * 0.03;
      ohmGroup.position.y = floatY;

      if (isProbing) {
        ohmProbeA.rotation.x = Math.PI / 2 + Math.sin(animTime * 6) * 0.25;
        ohmProbeB.rotation.x = Math.PI / 2 - Math.sin(animTime * 6) * 0.25;
      } else {
        ohmProbeA.rotation.x = Math.PI / 4;
        ohmProbeB.rotation.x = Math.PI / 4;
      }

      // NPC Breathing
      eddaTorso.position.y = 0.7 + Math.sin(animTime * 2.2) * 0.015;
      lumenTorso.position.y = 0.72 + Math.sin(animTime * 1.8) * 0.02;
      villagerTorso.position.y = 0.48 + Math.sin(animTime * 2.8) * 0.02;
    },
  };
}
