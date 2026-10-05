// Physica — entry. Owns the loop: input → fixed-step simulation → interpolated rendering.
import * as THREE from 'three';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import './style.css';
import { World, DT } from './sim/world.js';
import { FixedStepper } from './sim/stepper.js';
import { CASCADA } from './sim/levels/cascada.js';
import { buildScene } from './render/scene.js';
import { Explorer } from './render/avatar.js';
import { Input } from './input.js';
import { Sound } from './audio.js';
import { Journal } from './journal.js';

const params = new URLSearchParams(location.search);
const quality = params.get('quality') || (matchMedia('(pointer: coarse)').matches ? 'low' : 'high');
const reduced = params.has('reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const debug = params.has('debug');

const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: quality !== 'low', powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, quality === 'low' ? 1.25 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
app.appendChild(renderer.domElement);

const world = new World(CASCADA);
const stepper = new FixedStepper(world);
const view = buildScene(world, { quality });
const { scene, sun } = view;
const explorer = new Explorer(world.field);
explorer.addTo(scene);

const camera = new THREE.PerspectiveCamera(32, 1, 0.3, 600);
const cam = { x: world.avatar.x, y: 1.2, dist: 11.5 };
const input = new Input(app);
const sound = new Sound();
const journal = new Journal(app, world);

// ---------- HUD ----------
const hud = document.createElement('div'); hud.className = 'hud';
hud.innerHTML = `
  <div class="title" id="title"><span class="eyebrow">Physica</span><b>La cascada ascendente</b></div>
  <div class="prompt" id="prompt" hidden><kbd id="prompt-key">E</kbd><span id="prompt-verb"></span></div>
  <div class="hint" id="hint"><kbd>◀</kbd><kbd>▶</kbd> caminar · <kbd>E</kbd> usar · <kbd>R</kbd> reiniciar experimento · <kbd>J</kbd> Bitácora</div>
  <div class="legend" id="legend" hidden><i></i> una marca cada 0,1 s · anillo cada 0,5 s</div>
  <div class="pause" id="pause" hidden><div><b>En pausa</b><p>El experimento quedó detenido donde estaba.</p><button id="resume">Seguir</button></div></div>
  ${debug ? '<pre class="debug" id="debug"></pre>' : ''}`;
app.appendChild(hud);
const $ = id => document.getElementById(id);
const promptEl = $('prompt');
let hintTimer = 0, moved = false;

function resize() {
  const w = app.clientWidth, h = app.clientHeight;
  renderer.setSize(w, h); camera.aspect = w / h;
  camera.fov = w / h < 1 ? 46 : 32;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

// Pause when the page loses focus: the simulation stops where it is, and resumes without
// replaying the time it was hidden.
let paused = false;
function setPaused(p) {
  paused = p; $('pause').hidden = !p;
  if (p) stepper.pause(); else { stepper.resume(); last = performance.now(); }
}
addEventListener('blur', () => { if (!params.has('nopause')) setPaused(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden && !params.has('nopause')) setPaused(true); });
$('resume').addEventListener('click', () => setPaused(false));
const startAudio = () => sound.start();
addEventListener('keydown', startAudio); addEventListener('pointerdown', startAudio);

// ---------- telemetry ----------
const frameTimes = new Float32Array(600); let frameIdx = 0, frameCount = 0;
const eventLog = [];
window.__physica = {
  world, view, DT, version: '0.1.0', quality, reduced,
  frames() { const n = Math.min(frameCount, frameTimes.length); return Array.from(frameTimes.slice(0, n)); },
  resetFrames() { frameCount = 0; frameIdx = 0; stepper.dropped = 0; },
  stats() {
    const a = this.frames().sort((x, y) => x - y); if (!a.length) return null;
    const q = p => a[Math.min(a.length - 1, Math.floor(p * a.length))];
    return { n: a.length, p50: q(0.5), p95: q(0.95), p99: q(0.99), max: a[a.length - 1], dropped: stepper.dropped };
  },
  events: eventLog,
  state() {
    const av = world.avatar;
    return { t: world.t, step: world.stepCount, avatar: { x: av.x, y: av.y, vx: av.vx, vy: av.vy, grounded: av.supportSteps > 0, gy: av.gy },
      stands: world.stands.map(s => ({ id: s.id, state: s.state, x: s.body.x, y: s.body.y, vy: s.body.vy })),
      traces: world.traces.map(t => ({ id: t.id, source: t.source, n: t.marks.length, done: t.done, end: t.end })),
      journal: journal.ids(), paused, camera: { x: camera.position.x, y: camera.position.y, z: camera.position.z } };
  },
  setPaused,
  // Development inspection only: frame a point (evidence close-ups). Not part of play.
  inspect(x, y, dist) { inspectCam = x == null ? null : { x, y, dist }; },
};
let inspectCam = null;

// ---------- loop ----------
let last = performance.now(), time = 0, stepPhase = 0;
const pending = { act: false, reset: false };
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.25, (now - last) / 1000); last = now;
  frameTimes[frameIdx] = dt * 1000; frameIdx = (frameIdx + 1) % frameTimes.length; frameCount++;
  const inp = input.poll();
  if (inp.pause) setPaused(!paused);
  if (inp.journal) journal.toggle();
  if (paused) { renderer.render(scene, camera); return; }
  if (journal.open) { inp.axis = 0; inp.act = false; }
  if (inp.act) pending.act = true;
  if (inp.reset) pending.reset = true;
  if (Math.abs(inp.axis) > 0.1 && !moved) { moved = true; hintTimer = 6; }
  time += dt;

  const alpha = stepper.advance(dt, () => {
    world.input.x = inp.axis;
    if (pending.act) { world.input.act = true; pending.act = false; }
    if (pending.reset) { world.input.reset = true; pending.reset = false; }
  });
  const av = world.avatar;
  for (const e of world.drainEvents()) {
    eventLog.push(e); if (eventLog.length > 400) eventLog.shift();
    sound.event(e, av.id); explorer.onEvent(e, av.id); journal.onEvent(e);
  }
  journal.update(dt);

  const p = { x: av.px + (av.x - av.px) * alpha, y: av.py + (av.y - av.py) * alpha };
  const holding = !!av.holding;
  const pushing = av.supportSteps > 0 && Math.abs(world.input.x) > 0.1 && world.bodies.some(b => b.kind === 'sphere' && !b.heldBy && Math.abs(b.y - (av.y - av.hh + b.r)) < 0.1 && (b.x - av.x) * av.facing > 0 && Math.abs(b.x - av.x) < av.hw + b.r + 0.03);
  const its = world.interactables();
  explorer.update(dt, time, p, { ...av, grounded: av.supportSteps > 0 }, { holding, pushing, lookAt: its.length ? 0.15 : 0 });
  if (av.supportSteps > 0 && Math.abs(av.vx) > 0.4) { stepPhase += Math.abs(av.vx) * dt * 1.72; if (stepPhase > 1) { stepPhase -= 1; sound.step(); } }
  view.update(dt, time, alpha);
  const zw = world.field.weight(world.field.zones[0], av.x, av.y);
  const near = Math.max(0, 1 - Math.max(0, Math.abs(av.x - 2.25) - 2.25) / 6);
  sound.update(time, av.x, near, zw);

  // Camera: follows the explorer; around the cascade it widens to show the whole region.
  const inCascade = Math.max(0, 1 - Math.max(0, Math.abs(p.x - 2.6) - 4.5) / 4);
  let tx = THREE.MathUtils.lerp(THREE.MathUtils.clamp(p.x + (reduced ? 0 : av.facing * 1.2), -15.5, 14.5), 2.6, inCascade * 0.75);
  // Vertically: the region's view, but never let the explorer leave the middle 60% of the frame.
  let ty = THREE.MathUtils.lerp(p.y - av.hh + 1.2, 1.5, inCascade * 0.85);
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * cam.dist * 0.6;
  ty = THREE.MathUtils.clamp(ty, p.y + 0.3 - halfH, p.y - 0.3 + halfH * 0.7);
  let td = THREE.MathUtils.lerp(11.5, 14, inCascade);
  if (inspectCam) { tx = inspectCam.x; ty = inspectCam.y; td = inspectCam.dist; }
  const k = Math.min(1, dt * (reduced ? 6 : 2.6));
  cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; cam.dist += (td - cam.dist) * k;
  // Slightly above the play plane, like looking into a diorama: tops and the arch's width read.
  camera.position.set(cam.x, cam.y + cam.dist * 0.2, cam.dist);
  camera.lookAt(cam.x, cam.y, 0);
  sun.position.set(cam.x - 9, 16, 12); sun.target.position.set(cam.x, 0, 0);

  // Prompt over the nearest interactable.
  const it = its[0];
  if (it && !journal.open) {
    const v = new THREE.Vector3(it.x, it.y + 0.4, 0).project(camera);
    promptEl.hidden = false;
    promptEl.style.transform = `translate(${(v.x * 0.5 + 0.5) * app.clientWidth}px, ${(-v.y * 0.5 + 0.5) * app.clientHeight}px) translate(-50%, -100%)`;
    $('prompt-key').textContent = input.lastDevice === 'gamepad' ? 'A' : input.lastDevice === 'touch' ? 'E' : 'E';
    $('prompt-verb').textContent = it.verb;
  } else promptEl.hidden = true;
  $('legend').hidden = !world.traces.length;
  if (moved) { hintTimer -= dt; if (hintTimer < 0) $('hint').classList.add('gone'); }
  if (time > 4) $('title').classList.add('gone');
  if (debug) $('debug').textContent = `x ${av.x.toFixed(2)} y ${av.y.toFixed(2)} vx ${av.vx.toFixed(2)} vy ${av.vy.toFixed(2)}\ng ${(av.gy ?? 0).toFixed(2)} w ${zw.toFixed(2)} step ${world.stepCount}`;

  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
