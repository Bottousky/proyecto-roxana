import * as THREE from 'three';
import {
  createStonePbrMaterial,
  createCopperPbrMaterial,
  createBrassPbrMaterial,
  createCeramicPbrMaterial,
  createWoodPbrMaterial,
} from './proceduralPbr.ts';
import { createPhysicalWaterMaterial } from './waterOptics.ts';
import { createAtmosphereSystem } from './atmosphere.ts';

export interface PbrDioramaElements {
  scene: THREE.Scene;
  waterMaterial: THREE.ShaderMaterial;
  portalLight: THREE.PointLight;
  portalRing: THREE.Mesh;
  fountainWater: THREE.Mesh;
  gateMesh: THREE.Group;
  bellMesh: THREE.Group;
  relayIndicatorLight: THREE.PointLight;
  relayIndicatorMesh: THREE.Mesh;
  copperJumperMesh: THREE.Mesh;
  corrosionMesh: THREE.Mesh;
  chargeParticles: THREE.Points;
  chargePositions: Float32Array;
  smokeParticles: THREE.Points;
  atmosphere: ReturnType<typeof createAtmosphereSystem>;
  colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[];
  probeTargets: Record<string, THREE.Vector3>;
}

export function buildPlazaPbrDiorama(scene: THREE.Scene): PbrDioramaElements {
  const colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
  const probeTargets: Record<string, THREE.Vector3> = {};

  // PBR Materials
  const matStone = createStonePbrMaterial();
  const matStoneDark = createStonePbrMaterial();
  matStoneDark.color.setHex(0x5a5046);
  const matCopperClean = createCopperPbrMaterial(true);
  const matCopperOxide = createCopperPbrMaterial(false);
  const matBrass = createBrassPbrMaterial();
  const matCeramic = createCeramicPbrMaterial();
  const matWood = createWoodPbrMaterial();
  const matCloth = new THREE.MeshStandardMaterial({ color: 0x9e3828, roughness: 0.85, metalness: 0.05 });
  const matFoliage = new THREE.MeshStandardMaterial({ color: 0x3d5c34, roughness: 0.78, metalness: 0.02 });

  const addCollider = (x: number, z: number, w: number, d: number) => {
    colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  };

  // --- 1. Plaza Base Terraces & Cobblestone Floor ---
  const groundBase = new THREE.Mesh(new THREE.BoxGeometry(36, 0.6, 32), matStoneDark);
  groundBase.position.y = -0.3;
  groundBase.receiveShadow = true;
  scene.add(groundBase);

  // Main Elevated Flagstone Plaza
  const plazaFloor = new THREE.Mesh(new THREE.BoxGeometry(28, 0.3, 24), matStone);
  plazaFloor.position.y = 0.1;
  plazaFloor.receiveShadow = true;
  scene.add(plazaFloor);

  // Decorative Curbs and Stone Steps
  const stepLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 24), matStoneDark);
  stepLeft.position.set(-14, 0.15, 0);
  stepLeft.receiveShadow = true;
  scene.add(stepLeft);

  const stepRight = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 24), matStoneDark);
  stepRight.position.set(14, 0.15, 0);
  stepRight.receiveShadow = true;
  scene.add(stepRight);

  // --- 2. Central Ohm Dais (Sacred Schematic Platform) ---
  const daisBase = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 0.35, 24), matStoneDark);
  daisBase.position.set(0, 0.35, -2.0);
  daisBase.receiveShadow = true;
  scene.add(daisBase);

  const daisStep = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.25, 24), matStone);
  daisStep.position.set(0, 0.55, -2.0);
  daisStep.receiveShadow = true;
  scene.add(daisStep);

  // Inlaid Copper Ohm Glyphs (𝛺)
  const ohmRune = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 8, 24), matCopperClean);
  ohmRune.position.set(0, 0.69, -2.0);
  ohmRune.rotation.x = Math.PI / 2;
  scene.add(ohmRune);

  // --- 3. Perimeter Buildings & Fortified Walls ---
  const buildMansion = (x: number, z: number, w: number, h: number, d: number, roofColor = 0x583424) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matStone);
    body.position.set(x, h / 2 + 0.15, z);
    body.castShadow = true;
    body.receiveShadow = true;
    scene.add(body);

    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.8, metalness: 0.1 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.72, h * 0.45, 4), roofMat);
    roof.position.set(x, h + h * 0.22 + 0.15, z);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);

    // Decorative Fluted Pilasters
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, h, 8), matStoneDark);
    p1.position.set(x - w / 2 + 0.3, h / 2 + 0.15, z + d / 2 + 0.1);
    scene.add(p1);

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, h, 8), matStoneDark);
    p2.position.set(x + w / 2 - 0.3, h / 2 + 0.15, z + d / 2 + 0.1);
    scene.add(p2);

    addCollider(x, z, w, d);
  };

  buildMansion(-10.5, -9.5, 8.0, 5.0, 4.5);
  buildMansion(10.5, -9.5, 8.0, 5.2, 4.5);
  buildMansion(-13.5, 0, 4.2, 6.2, 14.0, 0x483226);
  buildMansion(13.5, 0, 4.2, 6.0, 14.0, 0x483226);
  buildMansion(-9.5, 11.5, 7.5, 4.6, 4.2);
  buildMansion(9.5, 11.5, 7.5, 4.6, 4.2);

  // --- 4. Ancient Institute Portal (South Entrance) ---
  const portalGroup = new THREE.Group();
  portalGroup.position.set(0, 0, -11.0);
  scene.add(portalGroup);

  const pillarGeo = new THREE.CylinderGeometry(0.48, 0.58, 4.2, 12);
  const portalColL = new THREE.Mesh(pillarGeo, matStoneDark);
  portalColL.position.set(-2.2, 2.1, 0);
  portalColL.castShadow = true;
  portalGroup.add(portalColL);

  const portalColR = new THREE.Mesh(pillarGeo, matStoneDark);
  portalColR.position.set(2.2, 2.1, 0);
  portalColR.castShadow = true;
  portalGroup.add(portalColR);

  const portalLintel = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.8, 1.2), matStone);
  portalLintel.position.set(0, 4.4, 0);
  portalLintel.castShadow = true;
  portalGroup.add(portalLintel);

  // Shimmering Energy Torus
  const portalRingMat = new THREE.MeshStandardMaterial({
    color: 0x60c8ff,
    emissive: 0x40b0ff,
    emissiveIntensity: 2.2,
    roughness: 0.15,
    metalness: 0.9,
  });
  const portalRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.12, 12, 36), portalRingMat);
  portalRing.position.set(0, 2.2, 0.15);
  portalGroup.add(portalRing);

  const portalLight = new THREE.PointLight(0x50c0ff, 4.2, 9);
  portalLight.position.set(0, 2.2, 0.4);
  portalGroup.add(portalLight);

  // Ceramic Terminals
  const termPos = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.35, 8), matCopperClean);
  termPos.position.set(0.9, 1.6, 0.15);
  portalGroup.add(termPos);
  probeTargets['portal_pos'] = new THREE.Vector3(0.9, 1.6, -10.85);

  const termNeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.35, 8), matCeramic);
  termNeg.position.set(-0.9, 1.6, 0.15);
  portalGroup.add(termNeg);
  probeTargets['portal_neg'] = new THREE.Vector3(-0.9, 1.6, -10.85);

  addCollider(0, -11.0, 5.2, 1.6);

  // --- 5. The Great Gate of Ohm (North Exit) ---
  const gateMesh = new THREE.Group();
  gateMesh.position.set(0, 0, 11.2);
  scene.add(gateMesh);

  const gateArchL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5.6, 1.8), matStoneDark);
  gateArchL.position.set(-2.6, 2.8, 0);
  gateArchL.castShadow = true;
  gateMesh.add(gateArchL);

  const gateArchR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5.6, 1.8), matStoneDark);
  gateArchR.position.set(2.6, 2.8, 0);
  gateArchR.castShadow = true;
  gateMesh.add(gateArchR);

  const gateTop = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.0, 2.0), matStone);
  gateTop.position.set(0, 5.8, 0);
  gateTop.castShadow = true;
  gateMesh.add(gateTop);

  // Giant Copper Solenoid Cylinder
  const solenoid = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.2, 16), matCopperClean);
  solenoid.position.set(0, 4.4, 0);
  solenoid.rotation.z = Math.PI / 2;
  gateMesh.add(solenoid);

  const gateDoors = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.8, 0.35), matWood);
  gateDoors.position.set(0, 2.4, 0);
  gateDoors.castShadow = true;
  gateMesh.add(gateDoors);

  probeTargets['puerta_solenoide'] = new THREE.Vector3(0, 2.2, 10.8);
  addCollider(0, 11.2, 6.6, 2.0);

  // --- 6. The Sacred Bell of Continuity (West Plaza) ---
  const bellMesh = new THREE.Group();
  bellMesh.position.set(-5.2, 0, 2.4);
  scene.add(bellMesh);

  const gantryPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.8, 8), matWood);
  gantryPost1.position.set(-0.9, 1.9, 0);
  gantryPost1.castShadow = true;
  bellMesh.add(gantryPost1);

  const gantryPost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.8, 8), matWood);
  gantryPost2.position.set(0.9, 1.9, 0);
  gantryPost2.castShadow = true;
  bellMesh.add(gantryPost2);

  const gantryBeam = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.28, 0.35), matWood);
  gantryBeam.position.set(0, 3.6, 0);
  gantryBeam.castShadow = true;
  bellMesh.add(gantryBeam);

  // Bronze Bell
  const bellGeo = new THREE.CylinderGeometry(0.4, 0.72, 1.1, 16);
  const bellBell = new THREE.Mesh(bellGeo, matBrass);
  bellBell.position.set(0, 2.6, 0);
  bellBell.castShadow = true;
  bellMesh.add(bellBell);

  // Relay Enclosure
  const relayBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.65), matStoneDark);
  relayBox.position.set(0, 0.45, 0);
  relayBox.castShadow = true;
  bellMesh.add(relayBox);

  // Vacuum tube indicator
  const relayIndicatorMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffa030,
      emissive: 0xff9020,
      emissiveIntensity: 0.35,
      roughness: 0.1,
    }),
  );
  relayIndicatorMesh.position.set(0, 0.9, 0.35);
  bellMesh.add(relayIndicatorMesh);

  const relayIndicatorLight = new THREE.PointLight(0xffa030, 0.6, 4.5);
  relayIndicatorLight.position.set(0, 1.0, 0.5);
  bellMesh.add(relayIndicatorLight);

  probeTargets['rele_bobina_in'] = new THREE.Vector3(-5.2, 0.5, 2.8);
  addCollider(-5.2, 2.4, 2.2, 1.8);

  // --- 7. The Sacred Fountain with Physical Water Optics (East Plaza) ---
  const waterMaterial = createPhysicalWaterMaterial();
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(5.5, 0, 3.8);
  scene.add(fountainGroup);

  const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.1, 0.75, 24), matStoneDark);
  basin.position.y = 0.38;
  basin.receiveShadow = true;
  basin.castShadow = true;
  fountainGroup.add(basin);

  const fountainWater = new THREE.Mesh(new THREE.CircleGeometry(2.5, 24), waterMaterial);
  fountainWater.position.y = 0.68;
  fountainWater.rotation.x = -Math.PI / 2;
  fountainGroup.add(fountainWater);

  const spoutCol = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 2.0, 12), matStone);
  spoutCol.position.y = 1.1;
  fountainGroup.add(spoutCol);

  const spoutHead = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), matBrass);
  spoutHead.position.y = 2.1;
  spoutHead.castShadow = true;
  fountainGroup.add(spoutHead);

  probeTargets['fuente_motor_in'] = new THREE.Vector3(5.5, 0.7, 3.8);
  addCollider(5.5, 3.8, 5.5, 5.5);

  // --- 8. Lumen's Repair Stall (South-West) ---
  const lumenStall = new THREE.Group();
  lumenStall.position.set(-7.5, 0, -4.2);
  scene.add(lumenStall);

  const table = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 1.4), matWood);
  table.position.set(0, 0.45, 0);
  table.castShadow = true;
  table.receiveShadow = true;
  lumenStall.add(table);

  const awning = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 2.2), matCloth);
  awning.position.set(0, 2.5, 0.3);
  awning.rotation.x = 0.18;
  awning.castShadow = true;
  lumenStall.add(awning);

  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8), matWood);
  postL.position.set(-1.4, 1.25, 0.9);
  lumenStall.add(postL);

  const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8), matWood);
  postR.position.set(1.4, 1.25, 0.9);
  lumenStall.add(postR);

  // Props on table: Ceramic capacitors, wire spools, lantern
  const pot1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.4, 10), matCeramic);
  pot1.position.set(-0.8, 1.05, 0);
  lumenStall.add(pot1);

  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.06, 8, 16), matCopperClean);
  coil.position.set(0.6, 1.0, 0.15);
  coil.rotation.x = Math.PI / 2;
  lumenStall.add(coil);

  // Incense Brazier
  const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.18, 0.7, 10), matBrass);
  brazier.position.set(1.8, 0.35, 0);
  brazier.castShadow = true;
  lumenStall.add(brazier);

  probeTargets['lumen_banco_in'] = new THREE.Vector3(-7.5, 0.95, -3.8);
  addCollider(-7.5, -4.2, 3.6, 2.6);

  // --- 9. The 40-Year Mural Wall (South-East) ---
  const muralGroup = new THREE.Group();
  muralGroup.position.set(7.8, 0, -4.2);
  scene.add(muralGroup);

  const muralWall = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.2, 1.0), matStoneDark);
  muralWall.position.set(0, 1.6, 0);
  muralWall.castShadow = true;
  muralWall.receiveShadow = true;
  muralGroup.add(muralWall);

  const schematicLine = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 0.06), matCopperClean);
  schematicLine.position.set(0, 1.8, 0.53);
  muralGroup.add(schematicLine);

  addCollider(7.8, -4.2, 4.0, 1.6);

  // --- 10. Cypress Topiary Trees ---
  const addCypress = (x: number, z: number) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.8, 6), matWood);
    trunk.position.set(x, 0.4, z);
    trunk.castShadow = true;
    scene.add(trunk);

    const foliage1 = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 8), matFoliage);
    foliage1.position.set(x, 1.8, z);
    foliage1.castShadow = true;
    scene.add(foliage1);

    const foliage2 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.8, 8), matFoliage);
    foliage2.position.set(x, 2.6, z);
    foliage2.castShadow = true;
    scene.add(foliage2);

    addCollider(x, z, 1.2, 1.2);
  };

  addCypress(-11.5, 5.5);
  addCypress(-11.5, -5.5);
  addCypress(11.5, 5.5);
  addCypress(11.5, -5.5);

  // --- 11. Inlaid Copper Conduits in Stone Floor ---
  const addConduit = (points: { x: number; z: number }[], mat: THREE.Material, width = 0.24) => {
    for (let i = 0; i < points.length - 1; i += 1) {
      const p1 = points[i]!;
      const p2 = points[i + 1]!;
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const len = Math.hypot(dx, dz);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, len), mat);
      mesh.position.set((p1.x + p2.x) / 2, 0.16, (p1.z + p2.z) / 2);
      mesh.rotation.y = Math.atan2(dx, dz);
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
  };

  // Primary Outgoing Rail (Ida) - East side
  const idaPoints = [
    { x: 0.9, z: -10.8 },
    { x: 0.9, z: -2.0 },
    { x: 2.5, z: 1.8 },
    { x: 5.5, z: 2.5 },
    { x: 0.9, z: 2.0 },
    { x: 0.9, z: 9.2 },
  ];
  addConduit(idaPoints, matCopperClean);
  probeTargets['ida_norte'] = new THREE.Vector3(0.9, 0.2, -8.0);
  probeTargets['ida_centro'] = new THREE.Vector3(0.9, 0.2, -2.0);

  // Return Rail (Retorno) - West side
  const retSurPoints = [
    { x: -0.9, z: 9.2 },
    { x: -0.9, z: 2.0 },
  ];
  addConduit(retSurPoints, matCopperClean);
  probeTargets['retorno_sur'] = new THREE.Vector3(-0.9, 0.2, 7.0);
  probeTargets['retorno_brecha_a'] = new THREE.Vector3(-0.9, 0.2, 2.0);

  // The Breach (The Gap)
  const copperJumperMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 1.0), matCopperClean);
  copperJumperMesh.position.set(-0.9, 0.16, 1.5);
  copperJumperMesh.visible = false;
  scene.add(copperJumperMesh);
  probeTargets['retorno_brecha_b'] = new THREE.Vector3(-0.9, 0.2, 1.0);

  // The Corroded Joint (Verdigris green patina)
  const retMidPoints = [
    { x: -0.9, z: 1.0 },
    { x: -0.9, z: -4.0 },
  ];
  addConduit(retMidPoints, matCopperOxide);

  const corrosionMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.7), matCopperOxide);
  corrosionMesh.position.set(-0.9, 0.17, -4.0);
  scene.add(corrosionMesh);
  probeTargets['retorno_oxido'] = new THREE.Vector3(-0.9, 0.2, -4.0);

  const retFinalPoints = [
    { x: -0.9, z: -4.0 },
    { x: -0.9, z: -10.8 },
  ];
  addConduit(retFinalPoints, matCopperClean);

  // --- 12. Particles & Atmosphere ---
  const atmosphere = createAtmosphereSystem(scene);

  // Incense Smoke Particles
  const smokeCount = 35;
  const smokeGeo = new THREE.BufferGeometry();
  const smokePos = new Float32Array(smokeCount * 3);
  for (let i = 0; i < smokeCount; i += 1) {
    smokePos[i * 3 + 0] = -5.7 + (Math.random() - 0.5) * 0.4;
    smokePos[i * 3 + 1] = 0.8 + Math.random() * 2.2;
    smokePos[i * 3 + 2] = -4.2 + (Math.random() - 0.5) * 0.4;
  }
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
  const smokeMat = new THREE.PointsMaterial({
    color: 0xdfd4c4,
    size: 0.28,
    transparent: true,
    opacity: 0.4,
  });
  const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
  scene.add(smokeParticles);

  // Electrical Charge Flow Particles (Moving along conduits when active)
  const chargeCount = 50;
  const chargeGeo = new THREE.BufferGeometry();
  const chargePositions = new Float32Array(chargeCount * 3);
  for (let i = 0; i < chargeCount; i += 1) {
    chargePositions[i * 3 + 0] = 0.9;
    chargePositions[i * 3 + 1] = 0.22;
    chargePositions[i * 3 + 2] = -10.5 + (i / chargeCount) * 21.0;
  }
  chargeGeo.setAttribute('position', new THREE.BufferAttribute(chargePositions, 3));
  const chargeMat = new THREE.PointsMaterial({
    color: 0x88e8ff,
    size: 0.35,
    transparent: true,
    opacity: 0.0,
  });
  const chargeParticles = new THREE.Points(chargeGeo, chargeMat);
  scene.add(chargeParticles);

  return {
    scene,
    waterMaterial,
    portalLight,
    portalRing,
    fountainWater,
    gateMesh,
    bellMesh,
    relayIndicatorLight,
    relayIndicatorMesh,
    copperJumperMesh,
    corrosionMesh,
    chargeParticles,
    chargePositions,
    smokeParticles,
    atmosphere,
    colliders,
    probeTargets,
  };
}
