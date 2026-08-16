// World container for OHMDAL Arc I.
// One continuous Three.js scene with elevation, region modules, terrain,
// stairs, distant landmarks, and a single electrical graph. The player
// can walk freely between regions; the camera frames each region with a
// specific zoom.

import * as THREE from "three";
import type { InputState } from "./engine/input.ts";
import type { GameCamera } from "./engine/camera.ts";
import type { AudioBus } from "./engine/audio.ts";
import type { Vec2 } from "./engine/math.ts";
import { distance } from "./engine/math.ts";
import { createMaterialKit } from "./environment/materials.ts";
import { createProceduralTextures } from "./data/procedural.ts";
import { createLighting, type LightingController } from "./environment/lighting.ts";
import { buildTerrain, type TerrainEntities } from "./environment/terrain.ts";
import { buildStairs } from "./environment/stairs.ts";
import { buildLandmarks } from "./environment/landmarks.ts";
import { buildPlaza, type PlazaEntities } from "./environment/plaza.ts";
import { buildPortal, type PortalEntities } from "./environment/portal.ts";
import { buildPuerta, type PuertaEntities } from "./environment/puerta.ts";
import { buildTaller, type TallerEntities } from "./environment/taller.ts";
import { buildManantial, type ManantialEntities } from "./environment/manantial.ts";
import { buildCamino, buildCalzada, type PathEntities } from "./environment/paths.ts";
import { buildSendero, type SenderoEntities } from "./environment/sendero.ts";
import { type Lamp } from "./environment/lamps.ts";
import { SpriteActor, spriteTexture } from "./environment/spriteActor.ts";
import { ElectricalGraph } from "./engine/electricalGraph.ts";
import { REGIONS, regionAt, NODES, CABLES, STEPS } from "./world/topology.ts";
import {
  mountDialog,
  showDialog,
  hideDialog,
  mountBitacora,
  pushBitacoraEntry,
  type DialogRefs,
  type BitacoraRefs,
} from "./ui/ui.ts";

import heroUrl from "../../assets/ohmdal/hero-student-sheet-64.png";
import ohmUrl from "../../assets/ohmdal/characters/ohm-atlas-64-v2.png";
import npcUrl from "../../assets/ohmdal/characters/npc-secondary-atlas-64.png";
import ohmPortraitUrl from "../../assets/ohmdal/generated/portraits/ohm-portrait.png";
import eddaPortraitUrl from "../../assets/ohmdal/generated/portraits/edda-portrait.png";
import lumenPortraitUrl from "../../assets/ohmdal/generated/portraits/lumen-portrait.png";

export type WorldState = "dormant" | "awakening" | "powered_basic" | "powered_full";

export interface World {
  scene: THREE.Scene;
  player: PlayerState;
  update: (dt: number, input: InputState, camera: GameCamera, audio: AudioBus) => void;
  regionAt: (pos: Vec2) => string;
  stateLabel: () => string;
  interactionPrompt: string;
  dialogActive: boolean;
  electrical: ElectricalGraph;
  bitacora: BitacoraRefs;
  state: WorldState;
  setState: (s: WorldState) => void;
  terrain: TerrainEntities;
}

export interface PlayerState {
  position: Vec2;
  heightY: number; // current ground Y (set each frame from terrain.groundYAt)
  speed: number;
  actor: SpriteActor | null;
}

const PLAYER_SPEED = 4.5;
const PLAYER_RADIUS = 0.4;

export function createWorld(scene: THREE.Scene): World {
  const kit = createMaterialKit();
  const tex = createProceduralTextures();
  const lighting: LightingController = createLighting(scene);
  scene.background = new THREE.Color(0x3a4a68);
  scene.fog = new THREE.Fog(0x3a4a68, 32, 95);

  // ---------- Build the unified terrain (slabs + perimeter walls + horizon) ----------
  const terrain = buildTerrain(kit);
  scene.add(terrain.group);

  // ---------- Build the stairs (transitions between regions) ----------
  for (const step of STEPS) {
    const stairs = buildStairs(kit, step);
    scene.add(stairs);
  }

  // ---------- Build the distant landmarks (silhouettes outside the playable area) ----------
  const landmarks = buildLandmarks();
  scene.add(landmarks.group);

  // ---------- Build each region at its topology-defined position ----------
  const plaza = buildPlaza(scene, kit, tex);
  plaza.group.position.set(0, 0, -3);

  const portal = buildPortal(scene, kit, tex);
  portal.group.position.set(0, 0, 12);

  const puerta = buildPuerta(scene, kit, tex);
  puerta.group.position.set(0, 0, -16);

  const taller = buildTaller(scene, kit, tex);
  taller.group.position.set(16, 0, 0);

  const manantial = buildManantial(scene, kit, tex);
  manantial.group.position.set(0, 0, -32);

  const camino = buildCamino(scene, kit, tex);
  camino.group.position.set(0, 0, 6);

  const calzada = buildCalzada(scene, kit, tex);
  calzada.group.position.set(0, 0, -22);

  // Calzada-alta: paved transition between Plaza and Puerta (uses the same
  // path module as Camino, slightly different layout).
  const calzadaAlta = buildCamino(scene, kit, tex);
  calzadaAlta.group.name = "calzada_alta";
  calzadaAlta.group.position.set(0, 0, -11);

  // Sendero: the south exterior, between the world edge and the Portal.
  const sendero = buildSendero(scene, kit, tex);
  // The Sendero is at world z=22 (center of the region z=18..26).
  sendero.group.position.set(0, 0, 22);

  // ---------- Wire up the electrical graph ----------
  const electrical = new ElectricalGraph();
  for (const n of NODES) {
    const handlers = makeNodeHandlers(n, plaza, portal, puerta, manantial, taller, camino, calzada, calzadaAlta, sendero);
    electrical.addNode({
      id: n.id,
      position: { x: n.position.x, y: n.position.y, z: n.position.z },
      type: n.type,
      energized: n.type === "source",
      onEnergize: handlers.onEnergize,
      onDeEnergize: handlers.onDeEnergize,
    });
  }
  for (const c of CABLES) {
    electrical.addCable({ id: c.id, fromId: findNearestNode(c.from), toId: findNearestNode(c.to), state: c.state });
  }
  function findNearestNode(p: { x: number; z: number }): string {
    let bestId = "";
    let bestDist = Infinity;
    for (const n of NODES) {
      const d = distance({ x: p.x, y: p.z }, { x: n.position.x, y: n.position.z });
      if (d < bestDist) {
        bestDist = d;
        bestId = n.id;
      }
    }
    return bestId;
  }
  electrical.recompute();

  // ---------- Visible copper cables between nodes (drawn in world.ts so
  // they follow the new terrain heights). For now, a few high-impact paths
  // are drawn as low boxes on the ground. Future work: full cable mesh. ----
  drawCableTraces(scene, CABLES, NODES, REGIONS);

  // ---------- Atmospheric motes ----------
  const motesGeom = new THREE.BufferGeometry();
  const MOTE_COUNT = 140;
  const motes = new Float32Array(MOTE_COUNT * 3);
  for (let i = 0; i < MOTE_COUNT; i++) {
    motes[i * 3]     = (Math.random() - 0.5) * 80;
    motes[i * 3 + 1] = 0.5 + Math.random() * 3.5;
    motes[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10;
  }
  motesGeom.setAttribute("position", new THREE.BufferAttribute(motes, 3));
  const motesMat = new THREE.PointsMaterial({
    color: 0xc8d8e8,
    size: 0.07,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  scene.add(new THREE.Points(motesGeom, motesMat));

  // ---------- Sprite actors ----------
  const heroTex = new THREE.TextureLoader().load(heroUrl);
  const hero = new SpriteActor({
    texture: heroTex,
    frameWidth: 64,
    frameHeight: 64,
    cols: 6,
    rows: 4,
    pixelArt: true,
    baseHeight: 1.7,
  });
  hero.setAnimation(0, 6, 0.14);
  hero.setPosition(0, -3);
  hero.setHeight(1.7);
  scene.add(hero.group);

  const ohmTex = new THREE.TextureLoader().load(ohmUrl);
  const ohm = new SpriteActor({
    texture: ohmTex,
    frameWidth: 96,
    frameHeight: 128,
    cols: 4,
    rows: 1,
    pixelArt: true,
    baseHeight: 1.0,
  });
  ohm.setCell(0, 0);
  ohm.setPosition(0, -18);
  ohm.setHeight(1.0);
  scene.add(ohm.group);

  const npcTex = new THREE.TextureLoader().load(npcUrl);
  const edda = new SpriteActor({
    texture: npcTex,
    frameWidth: 64,
    frameHeight: 64,
    cols: 4,
    rows: 5,
    pixelArt: true,
    baseHeight: 1.65,
  });
  bindRowCol(edda, 0, 0);
  edda.setPosition(0, 0);
  edda.setHeight(1.65);
  scene.add(edda.group);

  const lumen = new SpriteActor({
    texture: npcTex,
    frameWidth: 64,
    frameHeight: 64,
    cols: 4,
    rows: 5,
    pixelArt: true,
    baseHeight: 1.7,
  });
  bindRowCol(lumen, 1, 0);
  lumen.setPosition(18, 1);
  lumen.setHeight(1.7);
  scene.add(lumen.group);

  // ---------- UI ----------
  const dialogRefs: DialogRefs = mountDialog();
  const bitacoraRefs: BitacoraRefs = mountBitacora();
  bitacoraRefs.el.hidden = true;

  // ---------- Player state ----------
  // Test-spawn position (set via ?spawn= URL param or default to Plaza).
  // Useful for greybox inspection: each region can be visited by setting
  // ?spawn=puerta or ?spawn=manantial etc.
  const params = new URLSearchParams(window.location.search);
  const spawn = params.get("spawn") ?? "plaza";
  const spawnMap: Record<string, { x: number; y: number }> = {
    portal:    { x:  0, y: 14 },  // south side of Portal (player faces N to Plaza)
    camino:    { x:  0, y:  8 },
    plaza:     { x:  0, y: -3 },  // center of the Plaza, by the fountain
    taller:    { x: 14, y:  1 },  // just outside the Taller's west door (looking E)
    puerta:    { x:  0, y: -15 },
    calzada:   { x:  0, y: -22 },
    manantial: { x:  0, y: -32 },  // center of the Manantial patio
    sendero:   { x:  0, y: 22 },  // center of the Sendero
  };
  const spawnPos = spawnMap[spawn] ?? spawnMap.plaza;
  const player: PlayerState = {
    position: { x: spawnPos.x, y: spawnPos.y },
    heightY: 0,
    speed: PLAYER_SPEED,
    actor: hero,
  };
  hero.setPosition(player.position.x, player.position.y);
  player.heightY = terrain.groundYAt(player.position.x, player.position.y);
  hero.group.position.y = player.heightY;

  // ---------- State ----------
  let state: WorldState = "dormant";
  let dialogOpen = false;
  let dialogQueue: { speaker: string; line: string; portrait?: string }[] = [];
  let lastInteract = 0;
  let interactionPrompt = "";
  let introShown = false;
  let cableParticlesT = 0;
  const cableParticles = makeCableParticles(scene);

  // Initial dialog (only the first; player advances with E).
  // For greybox inspection we start the dialog DISMISSED so the player can
  // walk freely; the full intro will be restored in a follow-up pass.
  dialogQueue.push({ speaker: "Voz interna", line: "Bueno. Primer día. Primera puerta que no vuelve a abrir." });
  dialogOpen = false;

  pushBitacoraEntry(
    bitacoraRefs,
    "Observación",
    "La Cuenca de Ohm está quieta. El Portal apagó detrás de mí. Cables de cobre en el suelo, una fuente detenida, una Puerta cerrada. Más allá, el Manantial espera. Al este, el Taller de Lumen.",
  );

  // World bounds (encompass the playable area with margin). These match the
  // terrain.bounds derived from the REGIONS (with EXPAND=6 in terrain.ts).
  // The Sendero's south edge is at z=26 + 6 = 32, so the player must be
  // allowed to walk that far south. Previously this was clamped to z=20
  // which made the southern 6 m of the Sendero unreachable.
  const worldBounds = {
    minX: -28,
    maxX: 28,
    minZ: -44,
    maxZ: 32,
  };

  // Stair stepping: when the player is within a stair's footprint, the
  // player's Y interpolates between the stair's "from" and "to" Y based
  // on the player's progress along the stair's axis.
  const getStairY = (x: number, z: number): number | null => {
    for (const stair of STEPS) {
      if (stair.axis !== "z") continue;
      const minZ = Math.min(stair.from.z, stair.to.z);
      const maxZ = Math.max(stair.from.z, stair.to.z);
      if (z < minZ - 0.4 || z > maxZ + 0.4) continue;
      if (Math.abs(x - stair.from.x) > stair.width / 2 + 0.3) continue;
      const dz = stair.to.z - stair.from.z;
      if (dz === 0) return stair.to.y;
      const t = (z - stair.from.z) / dz;
      const tClamped = Math.max(0, Math.min(1, t));
      return stair.from.y + (stair.to.y - stair.from.y) * tClamped;
    }
    return null;
  };

  // Collision: walls, building walls, and the Plaza perimeter.
  // The terrain module already added perimeter walls; here we add
  // Taller walls (the player can collide with them). The array is `let`
  // so the Manantial gate colliders can be removed when the gate opens
  // (state=powed_full).
  let colliders = buildColliders(terrain);

  const update = (dt: number, input: InputState, cam: GameCamera, audio: AudioBus) => {
    hero.bindCamera(cam.three);
    ohm.bindCamera(cam.three);
    edda.bindCamera(cam.three);
    lumen.bindCamera(cam.three);

    // ---------- Dialog advance ----------
    if (dialogOpen && input.interact) {
      audio.ping(420, 0.06, 0.2);
      if (dialogQueue.length > 0) {
        const next = dialogQueue.shift()!;
        showDialog(dialogRefs, next.speaker, next.line, next.portrait);
      } else {
        hideDialog(dialogRefs);
        dialogOpen = false;
        if (!introShown) {
          introShown = true;
          pushBitacoraEntry(bitacoraRefs, "Bitácora", "Pregunta abierta: ¿la Cuenca no tiene fuerza, o la fuerza está pero no vuelve?");
        }
      }
      input.consume();
    }
    if (input.cancel && dialogOpen) {
      hideDialog(dialogRefs);
      dialogOpen = false;
      input.consume();
    }

    // ---------- Player movement with elevation step and collision ----------
    const worldDx = input.move.x;
    const worldDy = -input.move.y;
    const mag = Math.hypot(worldDx, worldDy);
    if (mag > 0 && !dialogOpen) {
      const ndx = worldDx / mag;
      const ndy = worldDy / mag;
      // Step along X, then along Y, with collision against colliders.
      const stepX = ndx * player.speed * dt;
      const stepY = ndy * player.speed * dt;
      // X axis.
      const nx = player.position.x + stepX;
      if (!isColliding(colliders, nx, player.position.y, PLAYER_RADIUS)) {
        player.position.x = nx;
      }
      // Y axis.
      const ny = player.position.y + stepY;
      if (!isColliding(colliders, player.position.x, ny, PLAYER_RADIUS)) {
        player.position.y = ny;
      }
      // Clamp to world bounds.
      player.position.x = Math.max(worldBounds.minX, Math.min(worldBounds.maxX, player.position.x));
      player.position.y = Math.max(worldBounds.minZ, Math.min(worldBounds.maxZ, player.position.y));
      // Snap to ground (region Y) and apply stair stepping if applicable.
      const baseY = terrain.groundYAt(player.position.x, player.position.y);
      const stairY = getStairY(player.position.x, player.position.y);
      player.heightY = stairY !== null ? stairY : baseY;
      hero.setPosition(player.position.x, player.position.y);
      hero.group.position.y = player.heightY;
      hero.setDirectionFromVector(ndx, ndy);
      hero.setPlaying("walk");
    } else {
      hero.setPlaying("idle");
      // Still snap to ground (and apply stair stepping if on a stair).
      const baseY = terrain.groundYAt(player.position.x, player.position.y);
      const stairY = getStairY(player.position.x, player.position.y);
      player.heightY = stairY !== null ? stairY : baseY;
      hero.group.position.y = player.heightY;
    }
    hero.update(dt);

    // ---------- NPC positions follow the terrain elevation ----------
    // Edda wanders the Plaza.
    const eddaWander = Math.sin(performance.now() * 0.0007) * 1.5;
    edda.setPosition(eddaWander, -3);
    edda.group.position.y = terrain.groundYAt(edda.position.x, edda.position.y);
    edda.setPlaying("idle");
    edda.update(dt);
    // Lumen stays in the Taller (around the bench).
    const lumenBob = Math.sin(performance.now() * 0.0006) * 0.4;
    lumen.setPosition(18 + lumenBob, 1);
    lumen.group.position.y = terrain.groundYAt(lumen.position.x, lumen.position.y);
    lumen.setPlaying("idle");
    lumen.update(dt);
    // Ohm sits on his pedestal in the Puerta region.
    ohm.setPosition(0, -18);
    ohm.group.position.y = terrain.groundYAt(ohm.position.x, ohm.position.y);
    ohm.setPlaying("idle");
    ohm.update(dt);

    // ---------- Camera framing per region ----------
    const region = regionAt(player.position.x, player.position.y);
    if (region) {
      cam.setRegionFraming(region.id as "plaza" | "puerta" | "manantial" | "taller" | "sendero");
    }

    // ---------- Camera elevation follows the player (so the Manantial, when
    // sunken, frames the player from above the patio, not from the Plaza) ----
    const playerY = player.heightY;
    // Lerp the camera's elevation offset toward the player's Y. The
    // camera lookAt is at the player's position but the camera itself
    // is offset by a per-region amount so the player stays in frame.
    if (cam.followElevation) {
      cam.followElevation(playerY, dt);
    }

    // ---------- Interaction: repair broken cables ----------
    let nearestCable: { id: string; dist: number } | null = null;
    for (const c of CABLES) {
      if (c.state !== "broken") continue;
      const mid = { x: (c.from.x + c.to.x) / 2, z: (c.from.z + c.to.z) / 2 };
      const d = distance(player.position, { x: mid.x, y: mid.z });
      if (d < 2.5 && (!nearestCable || d < nearestCable.dist)) {
        nearestCable = { id: c.id, dist: d };
      }
    }
    if (nearestCable) {
      interactionPrompt = "Reparar el cable roto [E]";
      if (input.interact && !dialogOpen) {
        const ok = electrical.repair(nearestCable.id);
        if (ok) {
          audio.ping(660, 0.12, 0.25);
          pushBitacoraEntry(bitacoraRefs, "Acción", "Reparé un cable de cobre. La corriente busca su camino.", "cable roto");
          if (state === "dormant") {
            state = "awakening";
            pushBitacoraEntry(bitacoraRefs, "Observación", "Algo cambia. Una vibración tenue recorre la Cuenca.");
          } else if (state === "awakening") {
            state = "powered_basic";
            pushBitacoraEntry(bitacoraRefs, "Observación", "Las lámparas de la Plaza se encienden. La fuente vuelve a fluir.");
          } else if (state === "powered_basic") {
            state = "powered_full";
            pushBitacoraEntry(bitacoraRefs, "Observación", "La compuerta del Manantial cede. El agua vuelve a fluir hacia el mundo.");
            // Open the gate when the world is fully powered.
            manantial.gate.position.y = 6.0;
            manantial.gateOpen = true;
            // Lift the gate colliders so the player can pass freely.
            colliders = colliders.filter((c) => c.tag !== "manantial_gate");
          }
        }
        input.consume();
      }
    } else {
      interactionPrompt = "";
    }

    // ---------- NPC interaction ----------
    if (input.interact && !nearestCable && (performance.now() - lastInteract) > 400 && !dialogOpen) {
      const npcs = [
        { actor: edda, name: "Edda", portrait: eddaPortraitUrl, lines: [
          "Mirá esa traza. Mirá el cobre. ¿Eso está cortado o solo apagado?",
          "Si arreglás un cable, contame qué pasa.",
        ] },
        { actor: lumen, name: "Lumen", portrait: lumenPortraitUrl, lines: [
          "El cobre viejo se pela. Si lo lijás y volvés a unir, la corriente pasa.",
          "No es magia. Es oficio.",
        ] },
        { actor: ohm, name: "Ohm", portrait: ohmPortraitUrl, lines: [
          "Dato insuficiente. Sugiero medir.",
          "Coincidencia registrada. Explicación todavía no.",
        ] },
      ];
      let nearestNpc: typeof npcs[number] | null = null;
      let nearestDist = Infinity;
      for (const npc of npcs) {
        const d = distance(player.position, npc.actor.position);
        if (d < 2.0 && d < nearestDist) {
          nearestNpc = npc;
          nearestDist = d;
        }
      }
      if (nearestNpc) {
        const line = nearestNpc.lines[Math.floor(Math.random() * nearestNpc.lines.length)];
        showDialog(dialogRefs, nearestNpc.name, line, nearestNpc.portrait);
        dialogOpen = true;
        lastInteract = performance.now();
        input.consume();
      }
    }

    // ---------- Lighting + state machine ----------
    lighting.setState(state, dt);
    const targetFog = state === "dormant" ? new THREE.Color(0x3a4a68) : new THREE.Color(0x4a5a82);
    const targetBg = state === "dormant" ? new THREE.Color(0x3a4a68) : new THREE.Color(0x4a5a82);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerp(targetFog, 0.04);
      const targetNear = state === "dormant" ? 32 : 38;
      const targetFar = state === "dormant" ? 95 : 115;
      scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, targetNear, 0.04);
      scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, targetFar, 0.04);
    }
    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(targetBg, 0.04);
    }
    audio.setAmbient(0.4 + (state === "dormant" ? 0 : 0.3));
    audio.setElectricalHum(state === "dormant" ? 0 : 0.6);

    // ---------- Cable particles (electricity along cables when energized) ----------
    cableParticlesT += dt;
    cableParticles.material.opacity = THREE.MathUtils.lerp(
      cableParticles.material.opacity,
      state === "dormant" ? 0 : 0.7,
      0.06,
    );
    if (state !== "dormant") {
      const positions = cableParticles.geom.attributes.position.array as Float32Array;
      const t = performance.now() * 0.001;
      for (let i = 0; i < positions.length / 3; i++) {
        const u = (i / (positions.length / 3) + t * 0.2) % 1;
        // South-to-north along the main cable.
        const z = THREE.MathUtils.lerp(13, -32, u);
        positions[i * 3]     = Math.sin(t * 2 + i) * 0.2;
        positions[i * 3 + 1] = 0.15 + Math.sin(t * 4 + i) * 0.05;
        positions[i * 3 + 2] = z;
      }
      cableParticles.geom.attributes.position.needsUpdate = true;
    }

    // ---------- Motes drift ----------
    const motePositions = (motesGeom.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < motePositions.length / 3; i++) {
      motePositions[i * 3]     += Math.sin(performance.now() * 0.0005 + i) * 0.005;
      motePositions[i * 3 + 1] += Math.cos(performance.now() * 0.0007 + i) * 0.003;
    }
    (motesGeom.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    if (input.open) {
      bitacoraRefs.el.hidden = !bitacoraRefs.el.hidden;
      input.consume();
    }

    // ---------- Animate landmarks (smoke puffs, lighthouse beam) ----------
    landmarks.update(performance.now() * 0.001);
  };

  return {
    scene,
    player,
    update,
    regionAt: (pos: Vec2) => {
      const r = regionAt(pos.x, pos.y);
      return r ? r.id : "sendero";
    },
    stateLabel: () => {
      switch (state) {
        case "dormant": return "Mundo dormido";
        case "awakening": return "Despertando…";
        case "powered_basic": return "Ohmdal vivo";
        case "powered_full": return "Sistema comprendido";
      }
    },
    get interactionPrompt() { return interactionPrompt; },
    get dialogActive() { return dialogOpen; },
    electrical,
    bitacora: bitacoraRefs,
    state: state,
    setState: (s: WorldState) => { state = s; },
    terrain,
  };
}

// ---------- Helpers ----------

function bindRowCol(sprite: SpriteActor, row: number, col: number) {
  const tex = spriteTexture(sprite);
  const totalCols = sprite.totalCols;
  const totalRows = sprite.totalRows;
  tex.repeat.set(1 / totalCols, 1 / totalRows);
  tex.offset.set(col / totalCols, 1 - (row + 1) / totalRows);
  tex.needsUpdate = true;
}

function makeNodeHandlers(
  n: { id: string; type: string; position: { x: number; z: number } },
  plaza: PlazaEntities,
  portal: PortalEntities,
  puerta: PuertaEntities,
  manantial: ManantialEntities,
  taller: TallerEntities,
  camino: PathEntities,
  calzada: PathEntities,
  calzadaAlta: PathEntities,
  sendero: SenderoEntities,
) {
  const allLamps: Lamp[] = [
    ...plaza.lamps, ...portal.lamps, ...puerta.lamps, ...manantial.lamps,
    ...taller.lamps, ...camino.lamps, ...calzada.lamps, ...calzadaAlta.lamps,
    ...sendero.lamps,
  ];
  const lampIndex = allLamps.findIndex((l) => {
    const dx = l.position.x - n.position.x;
    const dz = l.position.z - n.position.z;
    return Math.hypot(dx, dz) < 1.5;
  });
  const lamp = lampIndex >= 0 ? allLamps[lampIndex] : null;

  const onEnergize = () => {
    if (n.type === "lamp" && lamp) lamp.setEnergized(true);
    if (n.id === "node_fountain") {
      const w = plaza.fountain.waterMaterial;
      w.color.setHex(0x3a6a82);
      w.emissive.setHex(0x123040);
      w.emissiveIntensity = 0.5;
      w.opacity = 0.88;
      plaza.fountain.alive = true;
    }
    if (n.id === "node_manantial_gate") {
      const w = manantial.waterMaterial;
      w.color.setHex(0x4a7a92);
      w.emissive.setHex(0x2a5070);
      w.emissiveIntensity = 0.7;
      w.opacity = 0.9;
    }
  };
  const onDeEnergize = () => {
    if (n.type === "lamp" && lamp) lamp.setEnergized(false);
    if (n.id === "node_fountain") {
      const w = plaza.fountain.waterMaterial;
      w.color.setHex(0x2a3a48);
      w.emissive.setHex(0x1a2a3a);
      w.emissiveIntensity = 0.3;
      w.opacity = 0.92;
      plaza.fountain.alive = false;
    }
    if (n.id === "node_manantial_gate") {
      const w = manantial.waterMaterial;
      w.color.setHex(0x2a4a5a);
      w.emissive.setHex(0x123040);
      w.emissiveIntensity = 0.4;
      w.opacity = 0.85;
    }
  };
  return { onEnergize, onDeEnergize };
}

function makeCableParticles(scene: THREE.Scene): { geom: THREE.BufferGeometry; material: THREE.PointsMaterial } {
  const geom = new THREE.BufferGeometry();
  const COUNT = 120;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = 0;
    positions[i * 3 + 1] = 0.1;
    positions[i * 3 + 2] = 0;
  }
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xe8a050,
    size: 0.18,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const points = new THREE.Points(geom, material);
  scene.add(points);
  return { geom, material };
}

// ---------- Cable traces (visible copper lines on the ground) ----------
function drawCableTraces(
  scene: THREE.Scene,
  cables: { id: string; from: { x: number; z: number }; to: { x: number; z: number }; state: string }[],
  _nodes: { id: string; position: { x: number; z: number; y: number } }[],
  _regions: { id: string; x: number; z: number; width: number; depth: number; y: number }[],
) {
  for (const cable of cables) {
    const dx = cable.to.x - cable.from.x;
    const dz = cable.to.z - cable.from.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const color = cable.state === "broken" ? 0x5a3a1a : 0x7a5232;
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.55 });
    const seg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, len), mat);
    seg.position.set((cable.from.x + cable.to.x) / 2, 0.04, (cable.from.z + cable.to.z) / 2);
    seg.lookAt(new THREE.Vector3(cable.to.x, 0.04, cable.to.z));
    seg.receiveShadow = true;
    scene.add(seg);
  }
}

// ---------- Collision (Axis-Aligned Bounding Boxes) ----------
interface AABB { x: number; z: number; w: number; d: number; tag?: string }

function buildColliders(terrain: TerrainEntities): AABB[] {
  // Taller walls (4 walls + lintel above the door).
  // The Taller group is at world (16, 0, 0) and is 10m × 8m, so it spans
  // world x=11..21, z=-4..+4. The door is on the WEST side (x=11) and is
  // 2.4m wide, centered at z=0 (so the opening is at world z=-1.2..+1.2).
  // Previously the colliders were placed at x=15.7 (4.7 m too far east),
  // which split the Taller into two inaccessible rooms.
  const colliders: AABB[] = [];
  // East wall (back of the building).
  colliders.push({ x: 21.4, z: 0, w: 0.6, d: 8.4 });
  // South wall.
  colliders.push({ x: 16, z: 4.2, w: 10.4, d: 0.6 });
  // North wall.
  colliders.push({ x: 16, z: -4.2, w: 10.4, d: 0.6 });
  // West wall left part (south of the door).
  colliders.push({ x: 10.6, z: -2.6, w: 0.6, d: 2.8 });
  // West wall right part (north of the door).
  colliders.push({ x: 10.6, z:  2.6, w: 0.6, d: 2.8 });
  // West lintel above door (the door opening at z=-1.2..+1.2).
  colliders.push({ x: 10.6, z: 0, w: 0.6, d: 2.4 });

  // Plaza perimeter walls (with openings — 3.5m wide).
  // The Plaza group is at world z=-3, so its walls are at world z = -3-8=-11 (north) and z = -3+8=5 (south).
  // The Plaza walls are at x = -10..-1.75 (left) and x = 1.75..10 (right), with an opening at x=-1.75..1.75.
  // North wall.
  colliders.push({ x: -5.875, z: -11, w: 8.25, d: 0.5 });
  colliders.push({ x:  5.875, z: -11, w: 8.25, d: 0.5 });
  // South wall.
  colliders.push({ x: -5.875, z:  5, w: 8.25, d: 0.5 });
  colliders.push({ x:  5.875, z:  5, w: 8.25, d: 0.5 });
  // West wall: full.
  colliders.push({ x: -10.25, z: -3, w: 0.5, d: 16.4 });
  // East wall: opening at world z=-1.75..+1.75 (centered at z=0, aligned
  // with the Taller door). North segment: z=-11..-1.75 (9.25 m, center
  // z=-6.375). South segment: z=+1.75..+5 (3.25 m, center z=+3.375).
  colliders.push({ x: 10.25, z: -6.375, w: 0.5, d: 9.25 });
  colliders.push({ x: 10.25, z:  3.375, w: 0.5, d: 3.25 });

  // Puerta de Ohm towers (3.5m wide × 9m tall × 6m deep), at world x=±6.25, z=-19..-13.
  // The passage between the towers is at x=-2.5..+2.5 (5m wide).
  // The Puerta group is at world z=-16, so the towers' local Z=-3..+3 maps to world z=-19..-13.
  colliders.push({ x: -6.25, z: -16, w: 3.5, d: 6 });
  colliders.push({ x:  6.25, z: -16, w: 3.5, d: 6 });
  // Side connectors (the walls that continue from the Puerta to the Plaza/Calzada).
  colliders.push({ x: -8, z: -12, w: 0.6, d: 2 });
  colliders.push({ x:  8, z: -12, w: 0.6, d: 2 });
  colliders.push({ x: -8, z: -20, w: 0.6, d: 2 });
  colliders.push({ x:  8, z: -20, w: 0.6, d: 2 });

  // Camino (south of Plaza, between Portal and Plaza). Walls on the sides.
  // Camino is at world (x=-5..5, z=6..12). Walls at x=±4.8, full depth 6.
  colliders.push({ x: -4.8, z: 9, w: 0.4, d: 6 });
  colliders.push({ x:  4.8, z: 9, w: 0.4, d: 6 });

  // Calzada-alta (between Plaza and Puerta). Walls on the sides.
  // Calzada-alta is at world (x=-7..7, z=-13..-9). Walls at x=±6.8, full depth 4.
  colliders.push({ x: -6.8, z: -11, w: 0.4, d: 4 });
  colliders.push({ x:  6.8, z: -11, w: 0.4, d: 4 });

  // Calzada (between Puerta and Manantial). Walls on the sides.
  // Calzada is at world (x=-5..5, z=-25..-19). Walls at x=±4.8.
  colliders.push({ x: -4.8, z: -22, w: 0.4, d: 6 });
  colliders.push({ x:  4.8, z: -22, w: 0.4, d: 6 });

  // Sendero walls (at x=±W/2-0.2=±21.8, full depth 8).
  colliders.push({ x: -21.8, z: 22, w: 0.4, d: 8 });
  colliders.push({ x:  21.8, z: 22, w: 0.4, d: 8 });
  // Sendero boulder (at world x=-19.5, z=20.8, radius ~1.4m).
  colliders.push({ x: -19.5, z: 20.8, w: 2.8, d: 2.2 });
  // Sendero signpost (at world x=0, z=20.8).
  colliders.push({ x: 0, z: 20.8, w: 0.6, d: 0.6 });

  // Manantial compuerta — two stone posts at the south entrance. These
  // are tagged so they can be removed when the gate opens (the visual
  // gate lifts; the colliders lift with it).
  colliders.push({ x: -2.4, z: -26.4, w: 0.8, d: 0.8, tag: "manantial_gate" });
  colliders.push({ x:  2.4, z: -26.4, w: 0.8, d: 0.8, tag: "manantial_gate" });

  // Manantial platform walls: low barriers around the sunken patio.
  // The patio is 32m × 12m centered at (0, -32). Outer walls block the
  // boundary so the player can't walk off into the void.
  colliders.push({ x: -16.2, z: -32, w: 0.5, d: 12.4 });  // west
  colliders.push({ x:  16.2, z: -32, w: 0.5, d: 12.4 });  // east
  colliders.push({ x: 0, z: -38.2, w: 32.4, d: 0.5 });    // north (back)
  // South is blocked by the gate above (we keep it so the player feels
  // the gate is a barrier; when power returns, we remove the gate collider).

  // World perimeter (terrain already added visual walls; here we add
  // colliders matching the world bounds, with the south opening for the
  // Portal). The opening is the only way to enter the world.
  colliders.push({ x: terrain.bounds.minX, z: (terrain.bounds.minZ + terrain.bounds.maxZ) / 2, w: 0.5, d: terrain.bounds.maxZ - terrain.bounds.minZ });
  colliders.push({ x: terrain.bounds.maxX, z: (terrain.bounds.minZ + terrain.bounds.maxZ) / 2, w: 0.5, d: terrain.bounds.maxZ - terrain.bounds.minZ });
  colliders.push({ x: (terrain.bounds.minX + terrain.bounds.maxX) / 2, z: terrain.bounds.minZ, w: terrain.bounds.maxX - terrain.bounds.minX, d: 0.5 });
  // South wall (with opening for Portal).
  colliders.push({ x: -20, z: terrain.bounds.maxZ, w: 14, d: 0.5 });
  colliders.push({ x:  20, z: terrain.bounds.maxZ, w: 14, d: 0.5 });

  return colliders;
}

function isColliding(colliders: AABB[], x: number, z: number, r: number): boolean {
  for (const c of colliders) {
    const dx = Math.abs(x - c.x);
    const dz = Math.abs(z - c.z);
    if (dx < c.w / 2 + r && dz < c.d / 2 + r) return true;
  }
  return false;
}
