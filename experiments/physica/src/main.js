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
renderer.localClippingEnabled = true; // the explorer is cut at the water's surface
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
// Upload every texture and compile every program before play: an object or painting that
// first enters the view mid-game must not stall a frame (measured: a 250 ms hitch otherwise).
function warmUp() {
  const t0 = performance.now();
  scene.traverse(o => {
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of mats) for (const v of Object.values(m)) if (v && v.isTexture && v.image) renderer.initTexture(v);
    for (const m of mats) if (m.uniforms) for (const u of Object.values(m.uniforms)) if (u.value && u.value.isTexture && u.value.image) renderer.initTexture(u.value);
  });
  const hidden = []; scene.traverse(o => { if (!o.visible) { hidden.push(o); o.visible = true; } });
  renderer.compile(scene, camera);
  // One full render of the whole level from a wide camera, with the sun's shadow frustum
  // covering everything: geometry buffers and shadow-depth variants are created now, not when
  // each part first scrolls into view.
  const wide = new THREE.PerspectiveCamera(60, 16 / 9, 0.3, 600); wide.position.set(0, 4, 48); wide.lookAt(0, 2, 0);
  const sc = sun.shadow.camera, saved = [sc.left, sc.right, sc.top, sc.bottom];
  Object.assign(sc, { left: -45, right: 45, top: 20, bottom: -20 }); sc.updateProjectionMatrix();
  sun.position.set(-9, 16, 12); sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
  renderer.render(scene, wide);
  [sc.left, sc.right, sc.top, sc.bottom] = saved; sc.updateProjectionMatrix();
  for (const o of hidden) o.visible = false;
  if (window.__physica) window.__physica.warm = { at: t0, ms: performance.now() - t0 };
  last = performance.now();   // the warm-up's own time is not simulated time
}
THREE.DefaultLoadingManager.onLoad = () => warmUp();
const cam = params.has('nointro') ? { x: world.avatar.x, y: 1.2, dist: 11.5, elev: 0.2 } : { x: -18.5, y: 2.6, dist: 15, elev: 0.2 };
const input = new Input(app);
const sound = new Sound();
const journal = new Journal(app, world);
let vista = 0, vistaAge = 0, vistaHeld = false, vistaWas = false;
// Establishing shot: the whole diorama — familiar fall, the cascade, the Pozo — then the explorer.
let intro = params.has('nointro') ? 0 : 4.6;
// The city, once discovered from the Mirador, stays part of the world.
if (journal.has('mirador')) view.setCityVisible(true);
journal.onAdd = id => {
  if (id === 'cruce' || id === 'mirador') view.clearChalk(id);
  // From the Mirador, for the first time, the camera rises to show what is behind the landscape.
  // The key that carried the explorer up is still held: it does not cancel the vista; a new
  // press does, after 1.5 s. With reduced motion the camera cuts instead of travelling.
  if (id === 'mirador') { vista = 6; vistaAge = 0; vistaHeld = true; view.setCityVisible(true); }
};
if (journal.footing && !params.has('fresh')) { const f = journal.footing, av = world.avatar; av.x = av.px = f.x; av.y = av.py = f.y; av.lastSupport = { ...f }; }

// ---------- HUD ----------
const hud = document.createElement('div'); hud.className = 'hud';
hud.innerHTML = `
  <div class="title" id="title"><span class="eyebrow">Physica</span><b>La cascada ascendente</b></div>
  <div class="prompt" id="prompt" hidden><kbd id="prompt-key">E</kbd><span><span id="prompt-verb"></span><small id="prompt-hint"></small><small id="prompt-reason" class="reason"></small></span></div>
  <div class="hint" id="hint"><kbd>◀</kbd><kbd>▶</kbd> caminar · <kbd>▲</kbd><kbd>▼</kbd> ajustar, trepar · <kbd>E</kbd> usar · <kbd>R</kbd> reiniciar (en el aire: volver a pisar firme) · <kbd>J</kbd> Bitácora</div>
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
const frameTimes = new Float32Array(600), workTimes = new Float32Array(600); let frameIdx = 0, frameCount = 0, lastWork = 0;
const longFrames = [];
const eventLog = [];
window.__physica = {
  world, view, DT, version: '0.1.0', quality, reduced,
  frames() { const n = Math.min(frameCount, frameTimes.length); return Array.from(frameTimes.slice(0, n)); },
  works() { const n = Math.min(frameCount, workTimes.length); return Array.from(workTimes.slice(0, n)); },
  longFrames,
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
  // Development turnaround: pin the explorer's yaw (null releases it).
  pose(yaw) { explorer.yawOverride = yaw; },
  explorer, // development inspection: the model's chains (scarf tails, curl)
  // Development: where a world point lands on screen (CSS px), for evidence crops.
  screenOf(x, y, z = 0) { const v = new THREE.Vector3(x, y, z).project(camera); return { x: (v.x * 0.5 + 0.5) * app.clientWidth, y: (-v.y * 0.5 + 0.5) * app.clientHeight }; },
  vista() { vista = 6; vistaAge = 0; vistaHeld = false; view.setCityVisible(true); },
};
let inspectCam = null, camFloat = 0;
const camG = { x: 0, y: 0 };

// ---------- loop ----------
let last = performance.now(), time = 0, stepPhase = 0;
const pending = { act: false, reset: false, adjust: 0 };
function frame(now) {
  requestAnimationFrame(frame);
  const workStart = performance.now();
  // Telemetry records the real interval; only the simulation's dt is clamped (a long stall must
  // not become a long step). Recording the clamped dt reported every stall as exactly 250 ms.
  const interval = now - last;
  const dt = Math.min(0.25, interval / 1000); last = now;
  const fi = frameIdx; frameTimes[fi] = interval; frameIdx = (frameIdx + 1) % frameTimes.length; frameCount++;
  if (interval > 100 && longFrames.length < 50) longFrames.push({ at: +(now / 1000).toFixed(2), interval: +interval.toFixed(1), prevWork: +lastWork.toFixed(1) });
  const inp = input.poll();
  if (inp.pause) setPaused(!paused);
  if (inp.journal) journal.toggle();
  if (paused) { renderer.render(scene, camera); return; }
  if (journal.open) { inp.axis = 0; inp.act = false; }
  if (inp.act) pending.act = true;
  if (inp.adjust) pending.adjust = inp.adjust;
  if (inp.reset) pending.reset = true;
  if (Math.abs(inp.axis) > 0.1 && !moved) { moved = true; hintTimer = input.lastDevice === 'touch' ? 14 : 6; }
  time += dt;

  const alpha = stepper.advance(dt, () => {
    world.input.x = inp.axis; world.input.y = inp.axisY;
    if (pending.adjust) { world.input.adjust = pending.adjust; pending.adjust = 0; }
    if (pending.act) { world.input.act = true; pending.act = false; }
    if (pending.reset) { world.input.reset = true; pending.reset = false; }
  });
  const av = world.avatar;
  for (const e of world.drainEvents()) {
    eventLog.push(e); if (eventLog.length > 400) eventLog.shift();
    sound.event(e, av.id); explorer.onEvent(e, av.id); journal.onEvent(e); view.onEvent(e);
  }
  journal.update(dt);

  const p = { x: av.px + (av.x - av.px) * alpha, y: av.py + (av.y - av.py) * alpha };
  const holding = !!av.holding;
  const pushing = av.supportSteps > 0 && Math.abs(world.input.x) > 0.1 && world.bodies.some(b => b.kind === 'sphere' && !b.heldBy && Math.abs(b.y - (av.y - av.hh + b.r)) < 0.1 && (b.x - av.x) * av.facing > 0 && Math.abs(b.x - av.x) < av.hw + b.r + 0.03);
  const its = world.interactables();
  const onChain = av.heldBy?.type === 'chain';
  explorer.update(dt, time, p, { ...av, grounded: av.supportSteps > 0 || onChain }, { holding, pushing, onChain, climbing: onChain && Math.abs(world.input.y) > 0.2,
    inputY: world.input.y, mantling: av.heldBy?.type === 'mantle', inWater: av.supportSteps > 0 && !!av.support?.solid?.noFooting, lookAt: its.length ? 0.15 : 0 });
  if (av.supportSteps > 0 && Math.abs(av.vx) > 0.4) { stepPhase += Math.abs(av.vx) * dt * 1.72; if (stepPhase > 1) { stepPhase -= 1; sound.step(); } }
  view.update(dt, time, alpha);
  const zw = Math.max(...world.field.zones.map(z => world.field.weight(z, av.x, av.y)));
  const near = Math.max(...world.field.zones.map(z => Math.max(0, 1 - Math.max(0, Math.abs(av.x - (z.x0 + z.x1) / 2) - (z.x1 - z.x0) / 2) / 6)));
  sound.update(time, av.x, near, zw);

  // Camera: follows the explorer; around the cascade it widens to show the whole region.
  const inCascade = Math.max(0, 1 - Math.max(0, Math.abs(p.x - 2.6) - 4.5) / 4);
  let tx = THREE.MathUtils.lerp(THREE.MathUtils.clamp(p.x + (reduced ? 0 : av.facing * 1.2), -15.5, 14.5), 2.6, inCascade * 0.75);
  // Vertically: the region's view, but never let the explorer leave the middle 60% of the frame.
  let ty = THREE.MathUtils.lerp(p.y - av.hh + 1.2, 1.95, inCascade * 0.85);
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * cam.dist * 0.6;
  ty = THREE.MathUtils.clamp(ty, p.y + 0.3 - halfH, p.y - 0.3 + halfH * 0.7);
  let td = THREE.MathUtils.lerp(11.5, 16, inCascade);
  // Around the Pozo: frame the shaft from its water to above the Mirador.
  const inWell = Math.max(0, 1 - Math.max(0, Math.abs(p.x - 12.2) - 1.6) / 2.5);
  if (inWell > 0) { tx = THREE.MathUtils.lerp(tx, 12.3, inWell * 0.7); ty = THREE.MathUtils.lerp(ty, 2.9, inWell * 0.8); td = THREE.MathUtils.lerp(td, 14.5, inWell); ty = THREE.MathUtils.clamp(ty, p.y + 0.3 - halfH, p.y - 0.3 + halfH * 0.7); }
  if (vista > 0) {
    vista -= dt; vistaAge += dt;
    const pressing = Math.abs(inp.axis) > 0.1;
    if (!pressing) vistaHeld = false;
    if (vistaAge > 1.5 && ((pressing && !vistaHeld) || inp.act)) vista = 0;
    tx = 13; ty = 15.5; td = 36;
  }
  if (intro > 0) {
    // Composed on the cascade: the pool, the rising column and its crest over the Terraza, the
    // Orilla's lip on the left third; then the camera travels to the explorer.
    intro -= dt;
    if (Math.abs(inp.axis) > 0.1 || inp.act || inp.journal) intro = 0;
    // First the familiar fall (water going down), then the column (water going up).
    if (intro > 2.2) { tx = -18.5; ty = 2.6; td = 15; } else { tx = 1.4; ty = 0.9; td = 17; }
  }
  hud.classList.toggle('intro', intro > 0);
  // Floating in a region the frame opens up a little: more room above, a lighter feel.
  const floating = av.supportSteps === 0 && !av.heldBy && world.field.at(av.x, av.y, camG).y > 0.8 ? 1 : 0;
  camFloat += (floating - camFloat) * Math.min(1, dt * 1.5);
  if (!reduced) { td += 0.9 * camFloat; ty += 0.3 * camFloat; }
  if (inspectCam) { tx = inspectCam.x; ty = inspectCam.y; td = inspectCam.dist; }
  // With reduced motion the vista starts and ends as a cut, not a camera move.
  const vistaNow = vista > 0, cut = reduced && vistaNow !== vistaWas; vistaWas = vistaNow;
  const k = cut ? 1 : Math.min(1, dt * (reduced ? 6 : 2.6));
  cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; cam.dist += (td - cam.dist) * k;
  // Slightly above the play plane, like looking into a diorama: tops and the arch's width read.
  // In the Pozo the camera looks nearly level: things at different depths keep their apparent
  // heights (parallax would put the region's floor marks at the wrong numbers).
  cam.elev += ((inWell > 0.5 && vista <= 0 ? 0.05 : 0.2) - cam.elev) * Math.min(1, dt * 3);
  camera.position.set(cam.x, cam.y + cam.dist * cam.elev, cam.dist);
  camera.lookAt(cam.x, cam.y, 0);
  sun.position.set(cam.x - 9, 16, 12); sun.target.position.set(cam.x, 0, 0);

  // Prompt over the nearest interactable.
  const it = its[0];
  view.highlight(it && !journal.open && it.kind === 'stand' ? { body: it.body, stand: it.id } : null);
  if (it && !journal.open) {
    const v = new THREE.Vector3(it.x, it.y + 0.4, 0).project(camera);
    promptEl.hidden = false;
    promptEl.style.transform = `translate(${(v.x * 0.5 + 0.5) * app.clientWidth}px, ${(-v.y * 0.5 + 0.5) * app.clientHeight}px) translate(-50%, -100%)`;
    $('prompt-key').textContent = input.lastDevice === 'gamepad' ? 'A' : input.lastDevice === 'touch' ? 'E' : 'E';
    $('prompt-verb').textContent = it.verb;
    $('prompt-hint').textContent = it.hint || '';
    $('prompt-reason').textContent = it.reason || '';
  } else promptEl.hidden = true;
  $('legend').hidden = !world.traces.length || journal.open;
  if (moved) { hintTimer -= dt; if (hintTimer < 0) $('hint').classList.add('gone'); }
  if (time > 4) $('title').classList.add('gone');
  if (debug) $('debug').textContent = `x ${av.x.toFixed(2)} y ${av.y.toFixed(2)} vx ${av.vx.toFixed(2)} vy ${av.vy.toFixed(2)}\ng ${(av.gy ?? 0).toFixed(2)} w ${zw.toFixed(2)} step ${world.stepCount}`;

  renderer.render(scene, camera);
  // CPU time this frame took in our code (simulation, scene update, render submission): a long
  // interval with short work means the browser delivered the frame late, not that we were busy.
  lastWork = performance.now() - workStart; workTimes[fi] = lastWork;
}
requestAnimationFrame(frame);
