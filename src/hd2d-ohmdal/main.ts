// HD-2D Ohmdal — greenfield entry point.
// World is one continuous Three.js scene. No Phaser, no separate rooms.
// Visual target: Dragon Quest III HD-2D Remake as quality bar.

import * as THREE from "three";

import { createRenderer, type RendererBundle } from "./engine/renderer.ts";
import { createCamera, type GameCamera } from "./engine/camera.ts";
import { createInput, type InputState } from "./engine/input.ts";
import { createWorld, type World } from "./world.ts";
import { mountHud, mountDialog, mountBitacora, type UiRefs } from "./ui/ui.ts";
import { AudioBus } from "./engine/audio.ts";
import { createLayoutDebug, readLayoutDebugParams, type LayoutDebug } from "./layoutDebug.ts";
import { WORLD_BOUNDS } from "./world/topology.ts";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const titleEl = document.getElementById("title") as HTMLDivElement;
const titleStart = document.getElementById("title-start") as HTMLButtonElement;

const ui: UiRefs = mountHud();
mountDialog();
mountBitacora();

const renderer: RendererBundle = createRenderer(canvas);
const camera: GameCamera = createCamera(renderer.viewport);
const input: InputState = createInput();
const world: World = createWorld(renderer.scene);
const audio = new AudioBus();

// ---------- Layout debug / top-down review instruments ----------
const debugOpts = readLayoutDebugParams();
const layoutDebug: LayoutDebug = createLayoutDebug(renderer.scene, debugOpts);

// Top-down review needs the fog pulled far back (the gameplay fog culls at
// ~200m, but the review camera sits far above the diorama).
const setTopView = (on: boolean) => {
  layoutDebug.enableTop();
  camera.setTopView(on, WORLD_BOUNDS);
  world.reviewMode = on;
  if (on) {
    renderer.setToneExposure(1.1);
    if (renderer.scene.fog instanceof THREE.Fog) {
      renderer.setFog(0x3a4a68, 280, 700);
    }
  } else {
    renderer.setToneExposure(1.45);
    if (renderer.scene.fog instanceof THREE.Fog) {
      // Match the wider gameplay fog (60, 200) so the Plaza isn't tinted.
      renderer.setFog(0x3a4a68, 60, 200);
    }
  }
};
if (debugOpts.top) setTopView(true);

// Wire UI events.
titleStart.addEventListener("click", () => {
  titleEl.classList.add("fade-out");
  setTimeout(() => titleEl.remove(), 700);
  audio.unlock();
});
void titleEl;
void titleStart;

const onResize = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.setSize(w, h);
};
window.addEventListener("resize", onResize);
onResize();

// Skip the title screen — start the game immediately. (For inspection and
// greybox walks. The full intro is restored in a follow-up pass.)
{
  const t = document.getElementById("title");
  if (t) t.style.display = "none";
  audio.unlock();
}

// Update region label in HUD based on player position.
const updateHud = () => {
  const regionId = world.regionAt(world.player.position);
  // Capitalize for display.
  const label = regionId.charAt(0).toUpperCase() + regionId.slice(1);
  ui.region.textContent = label;
  ui.state.textContent = world.stateLabel();
  if (world.interactionPrompt) {
    ui.prompt.hidden = false;
    ui.prompt.textContent = world.interactionPrompt;
  } else {
    ui.prompt.hidden = true;
  }
};

// Layout-debug toggles (development-only review instruments).
// F1 = top-down camera, F2 = wireframe overlay, F3 = labels, F4 = electrical.
window.addEventListener("keydown", (e) => {
  if (e.code === "F1") {
    e.preventDefault();
    setTopView(!camera.isTopView());
  } else if (e.code === "F2") {
    e.preventDefault();
    layoutDebug.setOverlay(true);
  } else if (e.code === "F3") {
    e.preventDefault();
    layoutDebug.setLabels(true);
  } else if (e.code === "F4") {
    e.preventDefault();
    layoutDebug.setElectrical(true);
  }
});

// Main loop.
const clock = new THREE.Clock();
let last = 0;
const tick = () => {
  const now = clock.getElapsedTime();
  const dt = Math.min(0.05, now - last);
  last = now;

  world.update(dt, input, camera, audio);
  camera.follow(world.player.position, dt);
  renderer.three.render(world.scene, camera.three);
  updateHud();

  requestAnimationFrame(tick);
};
requestAnimationFrame(tick);

// Expose for the dev console / verification scripts.
(window as unknown as { __ohmdal: unknown }).__ohmdal = {
  renderer,
  camera,
  world,
  input,
  layoutDebug,
  setTopView,
};
