import * as THREE from 'three';
import { PALETTE } from '../palette.ts';
import { createWaterMaterial } from './shaders.ts';

export interface DioramaElements {
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
  dustParticles: THREE.Points;
  smokeParticles: THREE.Points;
  colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[];
  probeTargets: Record<string, THREE.Vector3>;
}

function makeGradientTexture(): THREE.DataTexture {
  const data = new Uint8Array([
    52, 44, 38, 255, // Deep shadow
    115, 98, 82, 255, // Half tone
    185, 165, 138, 255, // Lit stone
    245, 230, 205, 255, // Highlight
  ]);
  const tex = new THREE.DataTexture(data, 4, 1);
  tex.format = THREE.RGBAFormat;
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

export function buildPlazaDiorama(scene: THREE.Scene): DioramaElements {
  const gradient = makeGradientTexture();
  const colliders: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
  const probeTargets: Record<string, THREE.Vector3> = {};

  const toon = (color: number, extra: Partial<THREE.MeshToonMaterialParameters> = {}) =>
    new THREE.MeshToonMaterial({ color, gradientMap: gradient, ...extra });

  const matStone = toon(PALETTE.piedra);
  const matStoneDark = toon(PALETTE.piedraOscura);
  const matStoneCobble = toon(0x8a8074);
  const matWood = toon(PALETTE.madera);
  const matWoodDark = toon(0x3e281c);
  const matCopper = toon(PALETTE.cobre);
  const matCopperLive = toon(PALETTE.cobrePulido, {
    emissive: PALETTE.ambar,
    emissiveIntensity: 0.25,
  });
  const matCopperOxide = toon(PALETTE.cobreOxido);
  const matCeramic = toon(PALETTE.ceramica);
  const matBronze = toon(0xb58842);
  const matSoil = toon(PALETTE.suelo);
  const matCloth = toon(0x9a3e2a); // Canvas red for market stall

  // --- Ground & Elevation Terraces ---
  const ground = new THREE.Mesh(new THREE.BoxGeometry(34, 0.4, 30), matSoil);
  ground.position.y = -0.2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Main Cobblestone Plaza Floor
  const plazaFloor = new THREE.Mesh(new THREE.BoxGeometry(26, 0.2, 22), matStoneCobble);
  plazaFloor.position.y = 0.05;
  plazaFloor.receiveShadow = true;
  scene.add(plazaFloor);

  // Steps and Curbs
  const curbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 22), matStoneDark);
  curbLeft.position.set(-13, 0.15, 0);
  curbLeft.receiveShadow = true;
  scene.add(curbLeft);

  const curbRight = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 22), matStoneDark);
  curbRight.position.set(13, 0.15, 0);
  curbRight.receiveShadow = true;
  scene.add(curbRight);

  // Helper to add rectangular colliders
  const addBoxCollider = (x: number, z: number, w: number, d: number) => {
    colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  };

  // --- Perimeter Medieval Walls & Houses ---
  const buildBuilding = (x: number, z: number, w: number, h: number, d: number, roofColor = 0x5a3428) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matStone);
    body.position.set(x, h / 2 + 0.1, z);
    body.castShadow = true;
    body.receiveShadow = true;
    scene.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.7, h * 0.4, 4), toon(roofColor));
    roof.position.set(x, h + h * 0.2 + 0.1, z);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);

    // Decorative timber beams
    const beam = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.15, 0.15), matWoodDark);
    beam.position.set(x, h * 0.6, z + d / 2);
    scene.add(beam);

    addBoxCollider(x, z, w, d);
  };

  // North-West Buildings
  buildBuilding(-9.5, -9.0, 7.5, 4.2, 4.0);
  // North-East Buildings
  buildBuilding(9.5, -9.0, 7.5, 4.5, 4.0);
  // West Wall & Tower
  buildBuilding(-12.5, 0, 3.5, 5.5, 12.0, 0x483a30);
  // East Wall & Library
  buildBuilding(12.5, 0, 3.5, 5.2, 12.0, 0x483a30);
  // South-West Houses
  buildBuilding(-8.5, 10.5, 6.5, 3.8, 3.5);
  // South-East Houses
  buildBuilding(8.5, 10.5, 6.5, 3.8, 3.5);

  // --- 1. Ancient Institute Portal (South Entrance) ---
  const portalGroup = new THREE.Group();
  portalGroup.position.set(0, 0, -10.5);
  scene.add(portalGroup);

  const colL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 3.6, 8), matStoneDark);
  colL.position.set(-1.8, 1.8, 0);
  colL.castShadow = true;
  portalGroup.add(colL);

  const colR = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 3.6, 8), matStoneDark);
  colR.position.set(1.8, 1.8, 0);
  colR.castShadow = true;
  portalGroup.add(colR);

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.6, 0.9), matStone);
  lintel.position.set(0, 3.8, 0);
  lintel.castShadow = true;
  portalGroup.add(lintel);

  // Portal Shimmering Ring
  const portalRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.3, 0.09, 8, 32),
    toon(PALETTE.cobre, { emissive: 0x90d4ff, emissiveIntensity: 1.6 }),
  );
  portalRing.position.set(0, 1.8, 0.1);
  portalGroup.add(portalRing);

  const portalLight = new THREE.PointLight(0x70c8ff, 3.8, 8);
  portalLight.position.set(0, 1.8, 0.3);
  portalGroup.add(portalLight);

  // Ceramic Terminals (+ and -)
  const termPos = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 6), matCopperLive);
  termPos.position.set(0.8, 1.4, 0.1);
  portalGroup.add(termPos);
  probeTargets['portal_pos'] = new THREE.Vector3(0.8, 1.4, -10.4);

  const termNeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 6), matCeramic);
  termNeg.position.set(-0.8, 1.4, 0.1);
  portalGroup.add(termNeg);
  probeTargets['portal_neg'] = new THREE.Vector3(-0.8, 1.4, -10.4);

  addBoxCollider(0, -10.5, 4.0, 1.2);

  // --- 2. The Great Gate of Ohm (North Exit) ---
  const gateMesh = new THREE.Group();
  gateMesh.position.set(0, 0, 10.5);
  scene.add(gateMesh);

  const gateArchL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.0, 1.4), matStoneDark);
  gateArchL.position.set(-2.2, 2.5, 0);
  gateArchL.castShadow = true;
  gateMesh.add(gateArchL);

  const gateArchR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.0, 1.4), matStoneDark);
  gateArchR.position.set(2.2, 2.5, 0);
  gateArchR.castShadow = true;
  gateMesh.add(gateArchR);

  const gateTop = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.8, 1.6), matStone);
  gateTop.position.set(0, 5.2, 0);
  gateTop.castShadow = true;
  gateMesh.add(gateTop);

  // Giant Copper Solenoid Cylinder and Bars
  const solenoid = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.6, 12), matCopper);
  solenoid.position.set(0, 3.8, 0);
  solenoid.rotation.z = Math.PI / 2;
  gateMesh.add(solenoid);

  const gateDoors = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.2, 0.25), matWoodDark);
  gateDoors.position.set(0, 2.1, 0);
  gateDoors.castShadow = true;
  gateMesh.add(gateDoors);

  probeTargets['puerta_solenoide'] = new THREE.Vector3(0, 1.8, 10.2);
  addBoxCollider(0, 10.5, 5.4, 1.6);

  // --- 3. The Sacred Bell of Continuity (West Plaza) ---
  const bellMesh = new THREE.Group();
  bellMesh.position.set(-4.5, 0, 2.2);
  scene.add(bellMesh);

  // Wooden Gantry
  const gantryPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.2, 6), matWood);
  gantryPost1.position.set(-0.7, 1.6, 0);
  bellMesh.add(gantryPost1);

  const gantryPost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.2, 6), matWood);
  gantryPost2.position.set(0.7, 1.6, 0);
  bellMesh.add(gantryPost2);

  const gantryBeam = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.25), matWoodDark);
  gantryBeam.position.set(0, 3.1, 0);
  bellMesh.add(gantryBeam);

  // Bronze Bell
  const bellBell = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 0.9, 12), matBronze);
  bellBell.position.set(0, 2.2, 0);
  bellBell.castShadow = true;
  bellMesh.add(bellBell);

  // Relay Box underneath
  const relayBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.5), matStoneDark);
  relayBox.position.set(0, 0.35, 0);
  bellMesh.add(relayBox);

  const relayIndicatorMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    toon(PALETTE.ambar, { emissive: PALETTE.ambar, emissiveIntensity: 0.2 }),
  );
  relayIndicatorMesh.position.set(0, 0.72, 0.26);
  bellMesh.add(relayIndicatorMesh);

  const relayIndicatorLight = new THREE.PointLight(PALETTE.ambar, 0.4, 4);
  relayIndicatorLight.position.set(0, 0.8, 0.4);
  bellMesh.add(relayIndicatorLight);

  probeTargets['rele_bobina_in'] = new THREE.Vector3(-4.5, 0.4, 2.5);
  addBoxCollider(-4.5, 2.2, 1.8, 1.4);

  // --- 4. The Sacred Fountain & Canal (East Plaza) ---
  const waterMaterial = createWaterMaterial();
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(4.8, 0, 3.5);
  scene.add(fountainGroup);

  const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.6, 16), matStoneDark);
  basin.position.y = 0.3;
  basin.receiveShadow = true;
  fountainGroup.add(basin);

  const fountainWater = new THREE.Mesh(new THREE.CircleGeometry(2.1, 16), waterMaterial);
  fountainWater.position.y = 0.55;
  fountainWater.rotation.x = -Math.PI / 2;
  fountainGroup.add(fountainWater);

  // Center Spout
  const spoutCol = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.6, 8), matStone);
  spoutCol.position.y = 0.9;
  fountainGroup.add(spoutCol);

  const spoutHead = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), matBronze);
  spoutHead.position.y = 1.8;
  fountainGroup.add(spoutHead);

  probeTargets['fuente_motor_in'] = new THREE.Vector3(4.8, 0.6, 3.5);
  addBoxCollider(4.8, 3.5, 4.6, 4.6);

  // --- 5. Lumen's Repair Stall (South-West) ---
  const lumenStall = new THREE.Group();
  lumenStall.position.set(-6.5, 0, -3.5);
  scene.add(lumenStall);

  // Workbench table
  const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.85, 1.2), matWoodDark);
  table.position.set(0, 0.42, 0);
  table.castShadow = true;
  lumenStall.add(table);

  // Fabric awning canopy
  const awning = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 1.8), matCloth);
  awning.position.set(0, 2.2, 0.2);
  awning.rotation.x = 0.15;
  lumenStall.add(awning);

  // Posts
  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), matWood);
  postL.position.set(-1.2, 1.1, 0.7);
  lumenStall.add(postL);

  const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), matWood);
  postR.position.set(1.2, 1.1, 0.7);
  lumenStall.add(postR);

  // Props on table: Ceramic capacitors ("sacred pots"), wire coils, oil lamp
  const pot1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.35, 8), matCeramic);
  pot1.position.set(-0.6, 0.95, 0);
  lumenStall.add(pot1);

  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.05, 6, 12), matCopper);
  coil.position.set(0.4, 0.9, 0.1);
  coil.rotation.x = Math.PI / 2;
  lumenStall.add(coil);

  // Incense Brazier
  const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.15, 0.6, 8), matBronze);
  brazier.position.set(1.6, 0.3, 0);
  lumenStall.add(brazier);

  probeTargets['lumen_banco_in'] = new THREE.Vector3(-6.5, 0.85, -3.2);
  addBoxCollider(-6.5, -3.5, 3.2, 2.2);

  // --- 6. The 40-Year Mural Wall (South-East) ---
  const muralGroup = new THREE.Group();
  muralGroup.position.set(6.8, 0, -3.5);
  scene.add(muralGroup);

  const muralWall = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.8, 0.8), matStoneDark);
  muralWall.position.set(0, 1.4, 0);
  muralWall.castShadow = true;
  muralGroup.add(muralWall);

  // Inlaid copper schematic lines on mural
  const schematicLine = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.04), matCopperOxide);
  schematicLine.position.set(0, 1.5, 0.42);
  muralGroup.add(schematicLine);

  addBoxCollider(6.8, -3.5, 3.4, 1.4);

  // --- 7. Inlaid Copper Conduits in Stone Floor ---
  const addConduit = (points: { x: number; z: number }[], mat: THREE.Material, width = 0.22) => {
    for (let i = 0; i < points.length - 1; i += 1) {
      const p1 = points[i]!;
      const p2 = points[i + 1]!;
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const len = Math.hypot(dx, dz);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.06, len), mat);
      mesh.position.set((p1.x + p2.x) / 2, 0.12, (p1.z + p2.z) / 2);
      mesh.rotation.y = Math.atan2(dx, dz);
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
  };

  // Primary Outgoing Rail (Ida) - East side of road
  const idaPoints = [
    { x: 0.8, z: -10.2 },
    { x: 0.8, z: -2.0 },
    { x: 2.2, z: 1.5 },
    { x: 4.8, z: 2.2 }, // Taps into Fountain
    { x: 0.8, z: 2.0 },
    { x: 0.8, z: 8.5 },
  ];
  addConduit(idaPoints, matCopperLive);
  probeTargets['ida_norte'] = new THREE.Vector3(0.8, 0.15, -7.5);
  probeTargets['ida_centro'] = new THREE.Vector3(0.8, 0.15, -2.0);

  // Return Rail (Retorno) - West side of road
  const retSurPoints = [
    { x: -0.8, z: 8.5 },
    { x: -0.8, z: 2.0 },
  ];
  addConduit(retSurPoints, matCopper);
  probeTargets['retorno_sur'] = new THREE.Vector3(-0.8, 0.15, 6.5);
  probeTargets['retorno_brecha_a'] = new THREE.Vector3(-0.8, 0.15, 2.0);

  // The Breach (The Gap)
  const copperJumperMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 1.0), matCopperLive);
  copperJumperMesh.position.set(-0.8, 0.12, 1.5);
  copperJumperMesh.visible = false; // Initially open!
  scene.add(copperJumperMesh);
  probeTargets['retorno_brecha_b'] = new THREE.Vector3(-0.8, 0.15, 1.0);

  // The Corroded Joint (Green Patina)
  const retMidPoints = [
    { x: -0.8, z: 1.0 },
    { x: -0.8, z: -4.0 },
  ];
  addConduit(retMidPoints, matCopper);

  const corrosionMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.6), matCopperOxide);
  corrosionMesh.position.set(-0.8, 0.13, -4.0);
  scene.add(corrosionMesh);
  probeTargets['retorno_oxido'] = new THREE.Vector3(-0.8, 0.15, -4.0);

  const retFinalPoints = [
    { x: -0.8, z: -4.0 },
    { x: -0.8, z: -10.2 },
  ];
  addConduit(retFinalPoints, matCopper);

  // --- 8. Atmospheric Particles ---
  // A. Dust Motes (Golden twilight particles)
  const dustCount = 80;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    dustPos[i * 3 + 0] = (Math.random() - 0.5) * 26;
    dustPos[i * 3 + 1] = Math.random() * 4.5 + 0.2;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 22;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xffe2a0,
    size: 0.14,
    transparent: true,
    opacity: 0.6,
  });
  const dustParticles = new THREE.Points(dustGeo, dustMat);
  scene.add(dustParticles);

  // B. Incense Brazier Smoke Particles
  const smokeCount = 30;
  const smokeGeo = new THREE.BufferGeometry();
  const smokePos = new Float32Array(smokeCount * 3);
  for (let i = 0; i < smokeCount; i += 1) {
    smokePos[i * 3 + 0] = -4.9 + (Math.random() - 0.5) * 0.4;
    smokePos[i * 3 + 1] = 0.6 + Math.random() * 1.8;
    smokePos[i * 3 + 2] = -3.5 + (Math.random() - 0.5) * 0.4;
  }
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
  const smokeMat = new THREE.PointsMaterial({
    color: 0xd8c8b4,
    size: 0.22,
    transparent: true,
    opacity: 0.35,
  });
  const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
  scene.add(smokeParticles);

  // C. Electrical Charge Flow Particles (Animate along conduits when active)
  const chargeCount = 45;
  const chargeGeo = new THREE.BufferGeometry();
  const chargePositions = new Float32Array(chargeCount * 3);
  for (let i = 0; i < chargeCount; i += 1) {
    chargePositions[i * 3 + 0] = 0.8;
    chargePositions[i * 3 + 1] = 0.18;
    chargePositions[i * 3 + 2] = -10 + (i / chargeCount) * 20;
  }
  chargeGeo.setAttribute('position', new THREE.BufferAttribute(chargePositions, 3));
  const chargeMat = new THREE.PointsMaterial({
    color: 0x90e8ff,
    size: 0.28,
    transparent: true,
    opacity: 0.0, // Invisible until current flows!
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
    dustParticles,
    smokeParticles,
    colliders,
    probeTargets,
  };
}
