import * as THREE from 'three';
import {
  createBrassPbrMaterial,
  createCeramicPbrMaterial,
  createCopperPbrMaterial,
  createWoodPbrMaterial,
} from '../rendering/proceduralPbr.ts';

export interface GalvanoscopeViewmodel {
  root: THREE.Group;
  needle: THREE.Mesh;
  filamentLight: THREE.PointLight;
  filamentMesh: THREE.Mesh;
  update(delta: number, isMoving: boolean, targetVoltage: number, targetCurrent: number, isEquipped: boolean): void;
}

export function createGalvanoscopeViewmodel(camera: THREE.Camera): GalvanoscopeViewmodel {
  const root = new THREE.Group();
  root.position.set(0.38, -0.34, -0.62);
  root.rotation.set(0.12, -0.22, 0.05);
  camera.add(root);

  // Materials
  const matWood = createWoodPbrMaterial();
  const matBrass = createBrassPbrMaterial();
  const matCopper = createCopperPbrMaterial(true);
  const matCeramic = createCeramicPbrMaterial();
  const matDial = new THREE.MeshStandardMaterial({ color: 0xf4eedc, roughness: 0.85 });

  // 1. Handheld Instrument Body (Polished Oak Chassis with Brass Bezel)
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.08), matWood);
  chassis.castShadow = true;
  root.add(chassis);

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.02), matBrass);
  bezel.position.z = 0.04;
  root.add(bezel);

  // 2. Analog Gauge Dial Face
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.14), matDial);
  dial.position.set(0, 0.06, 0.052);
  root.add(dial);

  // Meter scale markings
  const dialFrame = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.088, 16, 1, 0, Math.PI), matBrass);
  dialFrame.position.set(0, 0.02, 0.054);
  root.add(dialFrame);

  // 3. Analog Gauge Needle (Pivot at bottom center of dial)
  const needleMat = new THREE.MeshBasicMaterial({ color: 0xdc3020 });
  const needleGeo = new THREE.ConeGeometry(0.005, 0.08, 6);
  needleGeo.translate(0, 0.04, 0); // Offset pivot to bottom of needle
  const needle = new THREE.Mesh(needleGeo, needleMat);
  needle.position.set(0, 0.02, 0.056);
  needle.rotation.z = Math.PI * 0.35; // Default resting angle at 0V
  root.add(needle);

  // 4. Glowing Vacuum Tube Filament (Current & Power Indicator)
  const tubeGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.09, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.05 }),
  );
  tubeGlass.position.set(-0.07, -0.09, 0.06);
  root.add(tubeGlass);

  const filamentMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.06, 8),
    new THREE.MeshStandardMaterial({
      color: 0xff8820,
      emissive: 0xff6600,
      emissiveIntensity: 0.2,
      roughness: 0.1,
    }),
  );
  filamentMesh.position.set(-0.07, -0.09, 0.06);
  root.add(filamentMesh);

  const filamentLight = new THREE.PointLight(0xff7710, 0.2, 0.8);
  filamentLight.position.set(-0.07, -0.09, 0.1);
  root.add(filamentLight);

  // 5. Knurled Range Selector Dial & Ceramic Insulator Terminals
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 12), matBrass);
  knob.position.set(0.06, -0.09, 0.06);
  knob.rotation.x = Math.PI / 2;
  root.add(knob);

  const terminalA = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), matCopper);
  terminalA.position.set(0.05, 0.18, 0);
  root.add(terminalA);

  const terminalB = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), matCeramic);
  terminalB.position.set(-0.05, 0.18, 0);
  root.add(terminalB);

  // Animation clocks
  let currentNeedleAngle = Math.PI * 0.35;
  let swayTimer = 0;

  return {
    root,
    needle,
    filamentLight,
    filamentMesh,
    update(delta: number, isMoving: boolean, targetVoltage: number, targetCurrent: number, isEquipped: boolean) {
      if (!isEquipped) {
        root.visible = false;
        return;
      }
      root.visible = true;

      // Calculate desired needle deflection angle
      // 0V -> +0.35 * PI (~63 deg right/down)
      // 30V -> -0.35 * PI (~ -63 deg left/up)
      const voltageFraction = Math.max(0, Math.min(1.0, targetVoltage / 30));
      const targetAngle = (0.35 - voltageFraction * 0.7) * Math.PI;

      // Spring damped needle movement
      currentNeedleAngle += (targetAngle - currentNeedleAngle) * delta * 12.0;
      needle.rotation.z = currentNeedleAngle;

      // Vacuum Tube Filament Glow
      const glowIntensity = Math.min(2.5, 0.2 + targetCurrent * 0.8 + (targetVoltage > 0 ? 0.3 : 0));
      (filamentMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = glowIntensity;
      filamentLight.intensity = glowIntensity * 0.45;

      // Viewmodel Idle & Walk Sway
      swayTimer += delta * (isMoving ? 8.0 : 2.0);
      const swayX = Math.sin(swayTimer) * (isMoving ? 0.015 : 0.003);
      const swayY = Math.abs(Math.cos(swayTimer)) * (isMoving ? 0.02 : 0.004);

      root.position.set(0.38 + swayX, -0.34 - swayY, -0.62);
    },
  };
}
