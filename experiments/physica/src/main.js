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
import { CASCADA, ARCH, TERRACE_Y } from './sim/levels/cascada.js';
import { buildScene } from './render/scene.js';
import { Explorer } from './render/avatar.js';
import { Input } from './input.js';
import { Sound } from './audio.js';
import { Journal } from './journal.js';

const params = new URLSearchParams(location.search);
const quality = params.get('quality') || (matchMedia('(pointer: coarse)').matches ? 'low' : 'high');
import { load as loadSettings, save as saveSettings, effectiveReduced, TEXT_SIZES } from './settings.js';
const storage = (() => { try { return window.localStorage; } catch { return null; } })();
const settings = loadSettings(storage);
const motionPref = matchMedia('(prefers-reduced-motion: reduce)');
const reducedNow = () => effectiveReduced(settings, { forced: params.has('reduced'), system: motionPref.matches });
let reduced = reducedNow();
const debug = params.has('debug');

const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: quality !== 'low', powerPreference: 'high-performance', stencil: true }); // (the arch's portal)
renderer.localClippingEnabled = true; // the explorer is cut at the water's surface
renderer.setPixelRatio(Math.min(devicePixelRatio, quality === 'low' ? 1.25 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
app.appendChild(renderer.domElement);

const world = new World(CASCADA);
const stepper = new FixedStepper(world);
const view = buildScene(world, { quality, reduced: () => reduced });
const { scene, sun } = view;
const explorer = new Explorer(world.field);
explorer.addTo(scene);

const camera = new THREE.PerspectiveCamera(32, 1, 0.3, 600);
let baseFov = 32; // the play view's angle (wider in portrait); depth widens it
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
let vista = 0, vistaAge = 0, vistaHeld = false, vistaWas = false, introShotWas = -1;
// Establishing shot: the whole diorama — familiar fall, the cascade, the Pozo — then the explorer.
let intro = params.has('nointro') ? 0 : 4.6;
// The city, once discovered from the Mirador, stays part of the world.
if (journal.has('mirador')) { view.setCityVisible(true); world.citySeen = true; } // (seen in an earlier session)
if (journal.flags.errand) Object.assign(world.errand, structuredClone(journal.flags.errand)); // (the neighbour's errand, as it was left)
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
  <div class="hint" id="hint"><span class="kbd-only"><kbd>◀</kbd><kbd>▶</kbd> caminar · <kbd>▲</kbd><kbd>▼</kbd> <span class="v-path">ajustar, trepar</span><span class="v-depth">caminar hacia el fondo y volver</span> · <kbd>E</kbd> usar · <kbd>R</kbd> reiniciar (en el aire: volver a pisar firme) · <kbd>J</kbd> Bitácora · <kbd>Esc</kbd> opciones</span><span class="touch-only">◀ ▶ caminar · ▲ ▼ <span class="v-path">ajustar, trepar</span><span class="v-depth">caminar hacia el fondo y volver</span> · botón grande: usar · ↺ volver a pisar firme · ✎ Bitácora · ⏸ opciones</span><span class="pad-only">palanca: caminar · ▲ ▼ <span class="v-path">ajustar, trepar</span><span class="v-depth">caminar hacia el fondo y volver</span> · A usar · Y volver a pisar firme · Select Bitácora · Start opciones</span></div>
  <div class="legend" id="legend" hidden><i></i> una marca cada 0,1 s · anillo cada 0,5 s</div>
  <div class="pause" id="pause" hidden><div role="dialog" aria-modal="true" aria-labelledby="pause-title">
    <h2 id="pause-title">En pausa</h2>
    <p>El experimento quedó detenido donde estaba.</p>
    <label class="row"><span>Volumen</span><input type="range" id="opt-volume" min="0" max="100" step="5"><output id="opt-volume-out" aria-hidden="true"></output></label>
    <label class="check"><input type="checkbox" id="opt-reduced" aria-describedby="opt-reduced-desc"><span>Movimiento reducido<small id="opt-reduced-desc">La cámara corta en vez de viajar y no se adelanta al caminar.${params.has('reduced') ? ' Activado por la dirección (?reduced).' : ''}</small></span></label>
    <fieldset style="margin-top:14px"><legend>Tamaño del texto</legend><div class="sizes" id="opt-text">${TEXT_SIZES.map(t => `<label><input type="radio" name="opt-text" value="${t.value}"><span>${t.label}</span></label>`).join('')}</div></fieldset>
    <details><summary>Controles</summary><table><thead><tr><th></th><th>Teclado</th><th>Mando</th><th>Táctil</th></tr></thead><tbody>
      <tr><th>Caminar</th><td>◀ ▶ · A D</td><td>palanca izquierda · cruz ◀ ▶</td><td>◀ ▶</td></tr>
      <tr><th>Ajustar, trepar</th><td>▲ ▼ · W S</td><td>palanca · cruz ▲ ▼</td><td>▲ ▼</td></tr>
      <tr><th>Usar</th><td>E · espacio · Enter</td><td>A</td><td>botón grande</td></tr>
      <tr><th>Reiniciar / volver a pisar firme</th><td>R</td><td>Y</td><td>↺</td></tr>
      <tr><th>Bitácora</th><td>J · Tab</td><td>Select</td><td>✎</td></tr>
      <tr><th>Pausa y opciones</th><td>Esc · P</td><td>Start</td><td>⏸</td></tr>
    </tbody></table></details>
    <div class="actions"><button id="resume">Seguir</button></div>
  </div></div>
  ${debug ? '<pre class="debug" id="debug"></pre>' : ''}`;
app.appendChild(hud);
const $ = id => document.getElementById(id);
const promptEl = $('prompt');
// ---------- options ----------
function applySettings() {
  document.documentElement.style.setProperty('--ui', settings.text);
  sound.setVolume(settings.volume);
  reduced = reducedNow(); if (window.__physica) window.__physica.reduced = reduced;
  const vol = $('opt-volume'), pct = Math.round(settings.volume * 100), said = settings.volume === 0 ? 'sin sonido' : `${pct} %`;
  vol.value = pct; vol.setAttribute('aria-valuetext', said); $('opt-volume-out').textContent = said;
  $('opt-reduced').checked = reduced; $('opt-reduced').disabled = params.has('reduced'); // ?reduced always wins
  for (const r of $('opt-text').querySelectorAll('input')) r.checked = +r.value === settings.text;
}
const changeSetting = (k, v) => { settings[k] = v; saveSettings(storage, settings); applySettings(); };
$('opt-volume').addEventListener('input', e => changeSetting('volume', e.target.value / 100));
$('opt-reduced').addEventListener('change', e => changeSetting('reduced', e.target.checked));
$('opt-text').addEventListener('change', e => changeSetting('text', +e.target.value));
motionPref.addEventListener?.('change', applySettings);
applySettings();
// The panel is modal: focus stays in it (Tab wraps), a click on the backdrop does not take focus away.
const pausePanel = $('pause');
// One stop per control: the text size group counts once (its checked radio), as with Tab.
const focusables = () => [...pausePanel.querySelectorAll('input:not([disabled]), button, summary')]
  .filter(el => el.offsetParent !== null && (el.type !== 'radio' || el.checked));
// Listened on the document: focus may have dropped to the page (a click on the panel's text).
document.addEventListener('keydown', e => {
  if (!paused || e.key !== 'Tab') return;
  const f = focusables(), i = f.indexOf(document.activeElement);
  e.preventDefault();
  (i < 0 ? (e.shiftKey ? f[f.length - 1] : f[0]) : f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]).focus();
}, true);
pausePanel.addEventListener('mousedown', e => { if (e.target === pausePanel) e.preventDefault(); });
// Gamepad in the panel: ▲▼ move between controls, ◀▶ change the value, A activates, B or Start closes.
function padInPanel(inp) {
  const f = focusables(); let el = document.activeElement;
  if (!f.includes(el)) { f[0]?.focus(); el = f[0]; }
  if (inp.adjust) {
    // On «Controles», open, ▼ scrolls through the table before moving on.
    const box = pausePanel.firstElementChild, details = pausePanel.querySelector('details');
    if (el?.tagName === 'SUMMARY' && details.open && inp.adjust < 0 && box.scrollTop + box.clientHeight < box.scrollHeight - 2) { box.scrollBy(0, 140); return; }
    const next = f[(f.indexOf(el) - inp.adjust + f.length) % f.length]; next.focus(); next.scrollIntoView({ block: 'nearest' }); return;
  }
  if (inp.step && el?.id === 'opt-volume') { el.value = +el.value + inp.step * 5; el.dispatchEvent(new Event('input', { bubbles: true })); return; }
  if (inp.step && el?.name === 'opt-text') {
    const rs = [...$('opt-text').querySelectorAll('input')], j = Math.max(0, Math.min(rs.length - 1, rs.indexOf(el) + inp.step));
    rs[j].focus(); rs[j].checked = true; rs[j].dispatchEvent(new Event('change', { bubbles: true })); return;
  }
  if (inp.act && el) el.click();
  if (inp.back) setPaused(false);
}
let hintTimer = 0, moved = false, depthHinted = false;

function resize() {
  const w = app.clientWidth, h = app.clientHeight;
  renderer.setSize(w, h); camera.aspect = w / h;
  camera.fov = baseFov = w / h < 1 ? 46 : 32;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

// Pause when the page loses focus: the simulation stops where it is, and resumes without
// replaying the time it was hidden.
let paused = false;
function setPaused(p) {
  paused = p; $('pause').hidden = !p;
  // Modal: everything outside the panel is inert while it is open (no focus, no clicks).
  for (const el of [...app.children, ...hud.children]) if (el !== hud && el !== $('pause')) el.inert = p;
  if (p) $('opt-volume').focus({ preventScroll: true }); else document.activeElement?.blur?.();
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
  // Development telemetry: what the last frame drew (shadow passes included).
  drawInfo() { return { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }; },
  // Development inspection only: frame a point (evidence close-ups). Not part of play.
  inspect(x, y, dist) { inspectCam = x == null ? null : { x, y, dist }; },
  // Development inspection only: a free camera (position and point looked at), for overview shots.
  look(pos, at) { freeCam = pos ? { pos, at } : null; },
  // Development turnaround: pin the explorer's yaw (null releases it).
  pose(yaw) { explorer.yawOverride = yaw; },
  explorer, // development inspection: the model's chains (scarf tails, curl)
  // Development: where a world point lands on screen (CSS px), for evidence crops.
  screenOf(x, y, z = 0) { const v = new THREE.Vector3(x, y, z).project(camera); return { x: (v.x * 0.5 + 0.5) * app.clientWidth, y: (-v.y * 0.5 + 0.5) * app.clientHeight }; },
  vista() { vista = 6; vistaAge = 0; vistaHeld = false; view.setCityVisible(true); },
};
let inspectCam = null, freeCam = null, camFloat = 0, camDepth = 0, wallCut = false, frontNow = true;
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
  document.body.classList.toggle('has-pad', input.lastDevice === 'gamepad');
  document.body.classList.toggle('in-depth', world.avatar.z < -0.3); // the help bar's ▲▼
  if (paused) { if (input.lastDevice === 'gamepad') padInPanel(inp); renderer.render(scene, camera); return; }
  if (inp.journal) journal.toggle();
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

  const p = { x: av.px + (av.x - av.px) * alpha, y: av.py + (av.y - av.py) * alpha, z: (av.pz ?? 0) + (av.z - (av.pz ?? 0)) * alpha };
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
  // With reduced motion every change of shot is a cut: the vista, the intro's two shots, and any
  // jump of the target (R back to firm footing, a reset), not only travelling.
  const vistaNow = vista > 0, introShot = intro > 2.2 ? 1 : intro > 0 ? 2 : 0;
  const cut = reduced && (vistaNow !== vistaWas || introShot !== introShotWas || Math.hypot(tx - cam.x, ty - cam.y) > 3);
  vistaWas = vistaNow; introShotWas = introShot;
  const k = cut ? 1 : Math.min(1, dt * (reduced ? 6 : 2.6));
  cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; cam.dist += (td - cam.dist) * k;
  // Slightly above the play plane, like looking into a diorama: tops and the arch's width read.
  // In the Pozo the camera looks nearly level: things at different depths keep their apparent
  // heights (parallax would put the region's floor marks at the wrong numbers).
  // Continuous in the explorer's position (applied at once with reduced motion, so it must not jump).
  const elevT = vista > 0 ? 0.2 : THREE.MathUtils.lerp(0.2, 0.05, THREE.MathUtils.smoothstep(inWell, 0.3, 0.7));
  cam.elev += (elevT - cam.elev) * (reduced ? 1 : Math.min(1, dt * 3));
  // Depth (Hito B): through the arch the camera goes from the diorama's side view to behind the
  // explorer, as a continuous function of how deep it is (z 0 → −1.8): the camera changes how we
  // look, the explorer's walking and the physics stay the same. Low in the passage (it must not
  // enter the rock), higher in the square.
  // The blend spans the whole threshold in front of the arch (z 0 → −3.6) and is eased, so the
  // push-in takes about a second at walking pace; the view widens with depth (32° → 48°).
  const dzT = THREE.MathUtils.smoothstep(-p.z, 0, 3.6);
  camDepth += (dzT - camDepth) * (reduced ? 1 : Math.min(1, dt * 4));
  const dz = camDepth, feet = p.y - av.hh, camZ = p.z + 4.6;
  const camH = THREE.MathUtils.lerp(1.75, 3.1, THREE.MathUtils.smoothstep(-camZ, 9.0, 11.0));
  // While the explorer is in the passage the camera keeps to its width (beside it is rock); once the
  // explorer is out in the square, the camera follows it freely (the wall is cut away if in the way).
  const inPassage = THREE.MathUtils.smoothstep(-camZ, 3.4, 4.0) * (1 - THREE.MathUtils.smoothstep(-camZ, 9.0, 9.8)) * (1 - THREE.MathUtils.smoothstep(-p.z, 9.3, 10.3));
  const camX = THREE.MathUtils.lerp(p.x, THREE.MathUtils.clamp(p.x, ARCH.x0 + 0.35, ARCH.x1 - 0.35), inPassage);
  const pos2 = [cam.x, cam.y + cam.dist * cam.elev, cam.dist], look2 = [cam.x, cam.y, 0];
  const posD = [camX, feet + camH, camZ], lookD = [p.x, feet + 0.95, p.z - 2.2];
  const fovT = THREE.MathUtils.lerp(baseFov, Math.max(baseFov, 48), dz);
  if (Math.abs(camera.fov - fovT) > 0.01) { camera.fov = fovT; camera.updateProjectionMatrix(); }
  const mix = (a, b) => a.map((v, i) => v + (b[i] - v) * dz);
  const [px, py, pz] = mix(pos2, posD), [lx, ly, lz] = mix(look2, lookD);
  camera.position.set(px, py, pz);
  camera.lookAt(lx, ly, lz);
  // From the square, the rock between it and the Terraza must not hide the explorer: while the camera
  // is inside it, or the lines to the explorer's head and feet cross it outside the passage's mouth,
  // that stretch of wall is cut away (with a margin that holds the cut, so it does not flicker).
  if (p.z < -9 && pz > -9.05) {
    const m = wallCut ? 0.3 : 0.1;
    const inMouth = (x, y) => x > ARCH.x0 + m && x < ARCH.x1 - m && y < TERRACE_Y + ARCH.h - m;
    const seen = y => { const t = (pz + 9) / (pz - p.z); return inMouth(px + (p.x - px) * t, py + (y - py) * t); };
    // (the camera nearing the passage's walls, within 0.5 m, starts the cut early, so it dissolves before it gets there; it
    // ends once the camera is 0.55 m clear of them: a 0.5 m window around the axis)
    const mc = wallCut ? 0.55 : 0.5, camClear = px > ARCH.x0 + mc && px < ARCH.x1 - mc && py < TERRACE_Y + ARCH.h - m;
    wallCut = !(camClear && seen(feet + 0.2) && seen(feet + 1.6));
  } else wallCut = false;
  view.setWallCut(wallCut, wallCut && pz > -9 && !(px > ARCH.x0 && px < ARCH.x1 && py < TERRACE_Y + ARCH.h)); // inside the rock: at once
  if (freeCam) { camera.position.set(...freeCam.pos); camera.lookAt(...freeCam.at); }
  // In front of the arch's plane (the 2.5D side) the neighbourhood is seen only through the passage.
  frontNow = camera.position.z > world.doors[0].z && !wallCut;
  view.setFront(frontNow, camera.position);
  sun.position.set(lx - 9, 16, lz + 12); sun.target.position.set(lx, 0, lz);

  // Prompt over the nearest interactable.
  const it = its[0];
  view.highlight(it && !journal.open && it.kind === 'stand' ? { body: it.body, stand: it.id } : null);
  if (it && !journal.open) {
    const v = new THREE.Vector3(it.x, it.y + 0.4, it.z ?? 0).project(camera);
    promptEl.hidden = false;
    // Kept inside the screen (with large text a prompt near an edge used to start off it).
    const W = app.clientWidth, H = app.clientHeight, pw = promptEl.offsetWidth, ph = promptEl.offsetHeight;
    const px = THREE.MathUtils.clamp((v.x * 0.5 + 0.5) * W, pw / 2 + 8, W - pw / 2 - 8), py = THREE.MathUtils.clamp((-v.y * 0.5 + 0.5) * H, ph + 8, H - 8);
    promptEl.style.transform = `translate(${px}px, ${py}px) translate(-50%, -100%)`;
    $('prompt-key').textContent = it.key || (input.lastDevice === 'gamepad' ? 'A' : 'E');
    $('prompt-verb').textContent = it.verb;
    $('prompt-hint').textContent = it.hint || '';
    $('prompt-reason').textContent = it.reason || '';
  } else promptEl.hidden = true;
  // (a trace behind the wall is not drawn from the 2.5D side: no legend for it there)
  $('legend').hidden = journal.open || !world.traces.some(t => !(frontNow && (world.bodies.find(b => b.id === t.body)?.z ?? 0) < -4));
  // The first time beyond the arch, the help bar comes back for a while: ▲▼ now walk.
  if (!depthHinted && av.z < -0.3) { depthHinted = true; moved = true; hintTimer = input.lastDevice === 'touch' ? 14 : 6; $('hint').classList.remove('gone'); }
  if (moved) { hintTimer -= dt; if (hintTimer < 0) $('hint').classList.add('gone'); }
  if (time > 4) $('title').classList.add('gone');
  if (debug) $('debug').textContent = `x ${av.x.toFixed(2)} y ${av.y.toFixed(2)} vx ${av.vx.toFixed(2)} vy ${av.vy.toFixed(2)}\ng ${(av.gy ?? 0).toFixed(2)} w ${zw.toFixed(2)} step ${world.stepCount}`;

  renderer.render(scene, camera);
  // CPU time this frame took in our code (simulation, scene update, render submission): a long
  // interval with short work means the browser delivered the frame late, not that we were busy.
  lastWork = performance.now() - workStart; workTimes[fi] = lastWork;
}
requestAnimationFrame(frame);
