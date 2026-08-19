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
import { buildCables, type CableVisuals } from "./environment/cables.ts";
import { SpriteActor, spriteTexture } from "./environment/spriteActor.ts";
import { ElectricalGraph } from "./engine/electricalGraph.ts";
import { regionAt, NODES, CABLES, STEPS, REGION_PLACEMENT, WORLD_BOUNDS, REGIONS } from "./world/topology.ts";
import { landmarkById } from "./world/layoutData.ts";
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
  /** Set true while the layout review top camera is active, so the world
   *  doesn't re-tune fog/background every frame. */
  reviewMode: boolean;
}

export interface PlayerState {
  position: Vec2;
  heightY: number; // current ground Y (set each frame from terrain.groundYAt)
  speed: number;
  actor: SpriteActor | null;
}

const PLAYER_SPEED = 4.5;
const PLAYER_RADIUS = 0.4;

/** Footprint of a runtime region (from REGIONS, derived from the layout). */
function rectOf(id: string): { width: number; depth: number } {
  const r = REGIONS.find((rr) => rr.id === id);
  return { width: r?.width ?? 10, depth: r?.depth ?? 6 };
}

export function createWorld(scene: THREE.Scene): World {
  const kit = createMaterialKit();
  const tex = createProceduralTextures();
  const lighting: LightingController = createLighting(scene);
  scene.background = new THREE.Color(0x3a4a68);
  // Wider fog band so the 100m-wide diorama isn't washed in blue. The
  // fog only fully tints the far horizon / distant landmarks; the Plaza
  // and its characters stay readable.
  scene.fog = new THREE.Fog(0x3a4a68, 60, 200);

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

  // ---------- Build each region at its layout-derived position ----------
  // Group placement comes from REGION_PLACEMENT (derived from arc1-layout.json).
  const plaza = buildPlaza(scene, kit, tex, { width: rectOf("plaza").width, depth: rectOf("plaza").depth });
  plaza.group.position.set(REGION_PLACEMENT.plaza.x, 0, REGION_PLACEMENT.plaza.z);

  const portal = buildPortal(scene, kit, tex);
  portal.group.position.set(REGION_PLACEMENT.portal.x, 0, REGION_PLACEMENT.portal.z);

  const puerta = buildPuerta(scene, kit, tex);
  puerta.group.position.set(REGION_PLACEMENT.puerta.x, 0, REGION_PLACEMENT.puerta.z);

  const taller = buildTaller(scene, kit, tex);
  taller.group.position.set(REGION_PLACEMENT.taller.x, 0, REGION_PLACEMENT.taller.z);

  const manantial = buildManantial(scene, kit, tex);
  manantial.group.position.set(REGION_PLACEMENT.manantial.x, 0, REGION_PLACEMENT.manantial.z);

  const camino = buildCamino(scene, kit, tex, { width: rectOf("camino").width, depth: rectOf("camino").depth });
  camino.group.position.set(REGION_PLACEMENT.camino.x, 0, REGION_PLACEMENT.camino.z);

  const calzada = buildCalzada(scene, kit, tex, { width: rectOf("calzada").width, depth: rectOf("calzada").depth });
  calzada.group.position.set(REGION_PLACEMENT.calzada.x, 0, REGION_PLACEMENT.calzada.z);

  // Calzada-alta: paved transition between Plaza and Puerta (uses the same
  // path module as Camino, slightly different layout).
  const calzadaAlta = buildCamino(scene, kit, tex, { width: rectOf("calzada_alta").width, depth: rectOf("calzada_alta").depth });
  calzadaAlta.group.name = "calzada_alta";
  calzadaAlta.group.position.set(REGION_PLACEMENT.calzada_alta.x, 0, REGION_PLACEMENT.calzada_alta.z);

  // Sendero: the south exterior, between the world edge and the Portal.
  const sendero = buildSendero(scene, kit, tex, { width: rectOf("sendero").width, depth: rectOf("sendero").depth });
  sendero.group.position.set(REGION_PLACEMENT.sendero.x, 0, REGION_PLACEMENT.sendero.z);

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

  // ---------- Visible copper cables (multi-segment, follow terrain, broken
  // cables show a visible gap and a small sparking post so the player can
  // read the break before being close enough to trigger the prompt). ----
  const cableVisuals: CableVisuals = buildCables(
    scene,
    terrain.groundYAt,
    CABLES,
    electrical,
  );

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
  hero.setPosition(REGION_PLACEMENT.plaza.x, REGION_PLACEMENT.plaza.z);
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
  // Ohm stands on his activation plinth (north of the fountain, well
  // inside the Plaza). Previously he was parked at the Puerta region
  // (z=-40) which is 100m from the plaza camera and 100% fogged out.
  const ohmPlinth = landmarkById("ohm_activation_plinth")!;
  ohm.setPosition(ohmPlinth.position.x, ohmPlinth.position.z);
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
  // Edda wanders the south-east quadrant of the Plaza (around the east
  // bench + barrel). She used to be parked at the Plaza center, which
  // is exactly where the fountain + bell stand, so her sprite ended
  // up hidden behind the 1.65m-tall bell pedestal. The hero also
  // spawns at the Plaza center, so the two stacked.
  edda.setPosition(REGION_PLACEMENT.plaza.x + 6, REGION_PLACEMENT.plaza.z + 2);
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
  // Lumen stands at the east opening of the Plaza (the doorway that
  // leads into the Taller). He used to be parked at the Taller center
  // (x=34, z=4), which is ~10m east of the Plaza east wall and out of
  // the camera frame when the player is in the Plaza. The new position
  // is just inside the Plaza on the east wall's opening threshold, so
  // he's visible from the Plaza and the player walks past him on the
  // way to the Taller.
  lumen.setPosition(REGION_PLACEMENT.plaza.x + 18, REGION_PLACEMENT.plaza.z + 3);
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
    portal:    { x: REGION_PLACEMENT.portal.x, y: REGION_PLACEMENT.portal.z }, // on the Portal platform (facing N to Plaza)
    camino:    { x: REGION_PLACEMENT.camino.x, y: REGION_PLACEMENT.camino.z },
    plaza:     { x: REGION_PLACEMENT.plaza.x - 4, y: REGION_PLACEMENT.plaza.z - 3 }, // south-west of the fountain (avoids stacking on Edda / inside the bell)
    taller:    { x: REGION_PLACEMENT.taller.x - 6, y: REGION_PLACEMENT.taller.z }, // just west of the Taller
    puerta:    { x: REGION_PLACEMENT.puerta.x, y: REGION_PLACEMENT.puerta.z },
    calzada_alta: { x: REGION_PLACEMENT.calzada_alta.x, y: REGION_PLACEMENT.calzada_alta.z }, // south forecourt of the Puerta
    calzada:   { x: REGION_PLACEMENT.calzada.x, y: REGION_PLACEMENT.calzada.z }, // sunken band north of the Puerta
    manantial: { x: REGION_PLACEMENT.manantial.x, y: REGION_PLACEMENT.manantial.z }, // center of the Manantial patio
    sendero:   { x: REGION_PLACEMENT.sendero.x, y: REGION_PLACEMENT.sendero.z }, // center of the Sendero
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
  let reviewMode = false;
  let dialogOpen = false;
  let dialogQueue: { speaker: string; line: string; portrait?: string }[] = [];
  let lastInteract = 0;
  let interactionPrompt = "";
  let introShown = false;
  let cableParticlesT = 0;
  let firstBrokenEncountered = false;
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

  // World bounds (encompass the playable area with margin). These derive from
  // the diorama bounds in arc1-layout.json via WORLD_BOUNDS.
  const worldBounds = WORLD_BOUNDS;

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
    // Edda wanders the south-east quadrant of the Plaza (around the east
    // bench + barrel). She used to be parked at the Plaza center, which
    // is exactly where the fountain + bell stand, so her sprite ended
    // up hidden behind the 1.65m-tall bell pedestal.
    const eddaT = performance.now() * 0.0006;
    const eddaWanderX = Math.sin(eddaT) * 1.5;
    const eddaWanderZ = Math.cos(eddaT * 0.7) * 0.8;
    edda.setPosition(
      REGION_PLACEMENT.plaza.x + 6 + eddaWanderX,
      REGION_PLACEMENT.plaza.z + 2 + eddaWanderZ,
    );
    edda.group.position.y = terrain.groundYAt(edda.position.x, edda.position.y);
    edda.setPlaying("idle");
    edda.update(dt);
    // Lumen stands at the east opening of the Plaza (the doorway that
    // leads into the Taller). He used to be parked at the Taller center
    // (x=34, z=4), which is ~10m east of the Plaza east wall and out of
    // the camera frame. The new position is just inside the Plaza on
    // the east wall's opening threshold, with a small wander so he
    // doesn't look glued to a single tile.
    const lumenT = performance.now() * 0.0005;
    const lumenWanderX = Math.sin(lumenT) * 0.6;
    const lumenWanderZ = Math.cos(lumenT * 0.8) * 0.4;
    lumen.setPosition(
      REGION_PLACEMENT.plaza.x + 18 + lumenWanderX,
      REGION_PLACEMENT.plaza.z + 3 + lumenWanderZ,
    );
    lumen.group.position.y = terrain.groundYAt(lumen.position.x, lumen.position.y);
    lumen.setPlaying("idle");
    lumen.update(dt);
    // Ohm stands on his activation plinth (north of the fountain, inside
    // the Plaza). Previously he was at the Puerta region position, which
    // is 100m from the plaza camera and 100% fogged out.
    ohm.setPosition(ohmPlinth.position.x, ohmPlinth.position.z);
    ohm.group.position.y = terrain.groundYAt(ohm.position.x, ohm.position.y);
    ohm.setPlaying("idle");
    ohm.update(dt);

    // ---------- Camera framing per region ----------
    const region = regionAt(player.position.x, player.position.y);
    if (region) {
      cam.setRegionFraming(
        region.id as "plaza" | "puerta" | "manantial" | "taller" | "sendero",
        { width: region.width, depth: region.depth },
      );
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
    // The cable state is the source of truth in the electrical graph
    // (not the topology const) because `electrical.repair()` mutates the
    // graph in place. Reading from the graph keeps the prompt in sync
    // with the visual after a repair.
    let nearestCable: { id: string; dist: number } | null = null;
    for (const c of CABLES) {
      if (electrical.getCableState(c.id) !== "broken") continue;
      const mid = { x: (c.from.x + c.to.x) / 2, z: (c.from.z + c.to.z) / 2 };
      const d = distance(player.position, { x: mid.x, y: mid.z });
      if (d < 2.5 && (!nearestCable || d < nearestCable.dist)) {
        nearestCable = { id: c.id, dist: d };
      }
    }
    if (nearestCable) {
      interactionPrompt = "Reparar el cable roto";
      if (!firstBrokenEncountered) {
        firstBrokenEncountered = true;
        pushBitacoraEntry(
          bitacoraRefs,
          "Observación",
          "Vi un cable cortado. La corriente busca su camino: si uno se corta, la línea entera se apaga. ¿La Cuenca no tiene fuerza, o la fuerza está pero no vuelve?",
        );
      }
      if (input.interact && !dialogOpen) {
        const ok = electrical.repair(nearestCable.id);
        if (ok) {
          audio.ping(660, 0.12, 0.25);
          // Refresh the cable visuals so the gap visibly closes and the
          // material switches from "broken" to "intact" on the same frame.
          cableVisuals.refresh();
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
    // Drive the cable "live" sheen from the world state. dormant = 0,
    // awakening = 0.4, powered_basic = 0.8, powered_full = 1.0.
    const awakeLevel =
      state === "dormant" ? 0 :
      state === "awakening" ? 0.4 :
      state === "powered_basic" ? 0.8 : 1.0;
    cableVisuals.setAwake(awakeLevel);
    // In review mode (top-down layout camera) the fog/background are owned by
    // the review tooling; don't re-tune them every frame.
    if (!reviewMode) {
      const targetFog = state === "dormant" ? new THREE.Color(0x3a4a68) : new THREE.Color(0x4a5a82);
      const targetBg = state === "dormant" ? new THREE.Color(0x3a4a68) : new THREE.Color(0x4a5a82);
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.color.lerp(targetFog, 0.04);
        // Wider fog band so the Plaza + Puerta + Taller stay readable. The
        // state still tints the distance, but the playable area is clean.
        const targetNear = state === "dormant" ? 60 : 70;
        const targetFar = state === "dormant" ? 200 : 240;
        scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, targetNear, 0.04);
        scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, targetFar, 0.04);
      }
      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(targetBg, 0.04);
      }
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

    // ---------- Animate the broken-cable spark orbs ----------
    cableVisuals.update(performance.now() * 0.001);
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
    // Getter (not a value copy) so the exposed state tracks the internal
    // state machine after repairs. `state: state` would copy the primitive
    // and stay "dormant" forever even though the world wakes up.
    get state() { return state; },
    setState: (s: WorldState) => { state = s; },
    get reviewMode() { return reviewMode; },
    set reviewMode(v: boolean) { reviewMode = v; },
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

// ---------- Cable traces (deprecated — replaced by environment/cables.ts) ----------
// The legacy single-segment drawer was removed in H2. The new module builds
// multi-segment cables that follow the terrain elevation, render broken
// cables with a visible gap and sparking posts, and respond to electrical
// state changes via `cableVisuals.refresh()`.

// ---------- Collision (Axis-Aligned Bounding Boxes) ----------
// Colliders derive from REGIONS (layout zones/landmarks) and the module
// placements, so they stay in sync with arc1-layout.json. No magic
// coordinates here: everything is computed from the region rects below.
interface AABB { x: number; z: number; w: number; d: number; tag?: string }

const OPENING = 3.5; // wall opening width (m) for plaza/camino connectors

function buildColliders(terrain: TerrainEntities): AABB[] {
  const colliders: AABB[] = [];
  const region = (id: string) => REGIONS.find((r) => r.id === id)!;

  // Wall along one side of a rect. `axis` x = vertical wall (constant x),
  // z = horizontal wall (constant z). `openCenter` optionally leaves a gap.
  const wall = (
    rect: { x: number; z: number; width: number; depth: number },
    axis: "x" | "z",
    side: -1 | 1,
    thickness: number,
    open: { center: number; width: number } | null,
  ) => {
    if (axis === "z") {
      // Horizontal wall at rect.z or rect.z+depth, spanning the width.
      const z = side === -1 ? rect.z : rect.z + rect.depth;
      if (open) {
        const leftLen = open.center - open.width / 2 - rect.x;
        const rightLen = rect.x + rect.width - (open.center + open.width / 2);
        if (leftLen > 0) colliders.push({ x: rect.x + leftLen / 2, z, w: leftLen, d: thickness });
        if (rightLen > 0) colliders.push({ x: open.center + open.width / 2 + rightLen / 2, z, w: rightLen, d: thickness });
      } else {
        colliders.push({ x: rect.x + rect.width / 2, z, w: rect.width, d: thickness });
      }
    } else {
      // Vertical wall at rect.x or rect.x+width, spanning the depth.
      const x = side === -1 ? rect.x : rect.x + rect.width;
      if (open) {
        const nearLen = open.center - open.width / 2 - rect.z;
        const farLen = rect.z + rect.depth - (open.center + open.width / 2);
        if (nearLen > 0) colliders.push({ x, z: rect.z + nearLen / 2, w: thickness, d: nearLen });
        if (farLen > 0) colliders.push({ x, z: open.center + open.width / 2 + farLen / 2, w: thickness, d: farLen });
      } else {
        colliders.push({ x, z: rect.z + rect.depth / 2, w: thickness, d: rect.depth });
      }
    }
  };

  // Plaza: perimeter walls with openings at the main axis (N/S, x=0) and the
  // Taller branch (E, centered at the plaza's east opening).
  const plaza = region("plaza");
  const plazaRect = { x: plaza.x, z: plaza.z, width: plaza.width, depth: plaza.depth };
  const plazaCenterZ = plaza.z + plaza.depth / 2;
  wall(plazaRect, "z", -1, 0.5, { center: 0, width: OPENING }); // north (→ Puerta)
  wall(plazaRect, "z", 1, 0.5, { center: 0, width: OPENING }); // south (→ Camino)
  wall(plazaRect, "x", -1, 0.5, null); // west (closed)
  wall(plazaRect, "x", 1, 0.5, { center: plazaCenterZ, width: OPENING }); // east (→ Taller)

  // Taller building walls (module is 10×8 at the lumen_forecourt placement).
  const tallerPlace = REGION_PLACEMENT.taller;
  const tw = 10, td = 8;
  const tallerRect = {
    x: tallerPlace.x - tw / 2,
    z: tallerPlace.z - td / 2,
    width: tw,
    depth: td,
  };
  wall(tallerRect, "x", 1, 0.6, null); // east (back)
  wall(tallerRect, "z", 1, 0.6, null); // south
  wall(tallerRect, "z", -1, 0.6, null); // north
  wall(tallerRect, "x", -1, 0.6, { center: tallerPlace.z, width: 2.4 }); // west (door)

  // Puerta towers: flank the passage at the gate landmark footprint.
  const puerta = region("puerta");
  const puertaD = 6;
  const puertaCenterX = puerta.x + puerta.width / 2;
  const puertaCenterZ = puerta.z + puerta.depth / 2;
  colliders.push({ x: puertaCenterX - 6.25, z: puertaCenterZ, w: 3.5, d: puertaD });
  colliders.push({ x: puertaCenterX + 6.25, z: puertaCenterZ, w: 3.5, d: puertaD });
  // Side connectors to Plaza / Calzada.
  for (const s of [-1, 1]) {
    colliders.push({ x: puertaCenterX + s * 8, z: puertaCenterZ - 4, w: 0.6, d: 2 });
    colliders.push({ x: puertaCenterX + s * 8, z: puertaCenterZ + 4, w: 0.6, d: 2 });
  }

  // Camino / Calzada / Calzada-alta / Sendero: low side walls along X.
  for (const id of ["camino", "calzada", "calzada_alta", "sendero"]) {
    const r = region(id);
    colliders.push({ x: r.x + 0.2, z: r.z + r.depth / 2, w: 0.4, d: r.depth });
    colliders.push({ x: r.x + r.width - 0.2, z: r.z + r.depth / 2, w: 0.4, d: r.depth });
  }

  // Manantial compuerta — two stone posts at the south entrance. Tagged so
  // they can be removed when the gate opens (powered_full).
  const manantial = region("manantial");
  const manantialPlace = REGION_PLACEMENT.manantial;
  colliders.push({ x: manantialPlace.x - 2.4, z: manantialPlace.z + 5.6, w: 0.8, d: 0.8, tag: "manantial_gate" });
  colliders.push({ x: manantialPlace.x + 2.4, z: manantialPlace.z + 5.6, w: 0.8, d: 0.8, tag: "manantial_gate" });

  // Manantial platform walls: low barriers around the sunken patio.
  colliders.push({ x: manantial.x + 0.2, z: manantial.z + manantial.depth / 2, w: 0.5, d: manantial.depth });
  colliders.push({ x: manantial.x + manantial.width - 0.2, z: manantial.z + manantial.depth / 2, w: 0.5, d: manantial.depth });
  colliders.push({ x: manantial.x + manantial.width / 2, z: manantial.z + 0.2, w: manantial.width, d: 0.5 });

  // World perimeter (matches WORLD_BOUNDS + terrain.bounds; south opening for
  // the Portal entry).
  const b = WORLD_BOUNDS;
  colliders.push({ x: b.minX, z: (b.minZ + b.maxZ) / 2, w: 0.5, d: b.maxZ - b.minZ });
  colliders.push({ x: b.maxX, z: (b.minZ + b.maxZ) / 2, w: 0.5, d: b.maxZ - b.minZ });
  colliders.push({ x: (b.minX + b.maxX) / 2, z: b.minZ, w: b.maxX - b.minX, d: 0.5 });
  const southGap = 14;
  colliders.push({ x: b.minX + (b.maxX - b.minX - southGap) / 4, z: b.maxZ, w: (b.maxX - b.minX - southGap) / 2, d: 0.5 });
  colliders.push({ x: b.maxX - (b.maxX - b.minX - southGap) / 4, z: b.maxZ, w: (b.maxX - b.minX - southGap) / 2, d: 0.5 });
  void terrain;

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
