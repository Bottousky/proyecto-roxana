import { AREAS, getObjective } from './content.js';
import { AREA_LAYOUTS } from './world-layout.js';
import { KINGDOM, EXTERIORS, isExterior, passageGeometry, toKingdom } from './kingdom-geography.js';
import { journeyGuidance } from './journey-guide.js';
import { journeyPhase } from './story-time.js';
import { QUIET_MOUNT, quietMountState } from './quiet-mount.js';
import './kingdom-map.css';

// The kingdom map is the world itself, photographed from above and painted (scripts/bake-map.mjs):
// its geography is the game's by construction. Everything that changes with the journey (where
// the traveller is, what is next, what has been restored, what is still unknown) is drawn over it.
export const KINGDOM_MAP = Object.freeze({ src: './assets/map/kingdom-map.webp', pxPerMetre: 8, x0: -132, z0: -345, width: 2048, height: 4096 });
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = value => Math.round(value * 10) / 10;
/** Kingdom metres → map image pixels. */
export const mapPoint = ([x, z]) => [n((x - KINGDOM_MAP.x0) * KINGDOM_MAP.pxPerMetre), n((z - KINGDOM_MAP.z0) * KINGDOM_MAP.pxPerMetre)];
const openExit = (exit, state) => (exit.requires || []).every(flag => Boolean(state.flags?.[flag]));
const valid = id => !!AREAS[id] && !!KINGDOM[id];
// The painted landmark of each place (assets/art-polish/map-landmarks.webp, a 3×3 sheet) in this order.
const LANDMARK_ART = ['portal', 'plaza', 'workshop', 'road', 'spring', 'castle', 'terraces', 'lake', 'lighthouse'];
/** Where something of a place stands in the kingdom; interiors stand where their building is. */
const kingdomOf = (area, [x, z]) => isExterior(area) ? toKingdom(area, [x, z]) : [KINGDOM[area].x, KINGDOM[area].z];

/** The route the traveller would walk from here to the objective, through the passages, in kingdom metres. */
export function journeyRoute(state, from, target) {
  const a = EXTERIORS.indexOf(isExterior(state.area) ? state.area : 'plaza'), b = EXTERIORS.indexOf(isExterior(target.area) ? target.area : 'plaza');
  if (a < 0 || b < 0) return [];
  const points = [from];
  for (let i = a; i !== b; i += Math.sign(b - a)) {
    const p = passageGeometry(EXTERIORS[i], EXTERIORS[i + Math.sign(b - a)]);
    if (!p) continue;
    const forward = p.from === EXTERIORS[i] ? p.points : [...p.points].reverse();
    points.push(...forward);
  }
  points.push(target.at);
  return points;
}

/** Every mark the map shows, in kingdom metres, with the zoom from which it is legible. */
export function kingdomMapMarks(state, { position, facing, inhabitants = [] } = {}) {
  const visited = new Set((state.visited || []).filter(valid));
  const marks = [];
  for (const id of EXTERIORS) {
    const k = KINGDOM[id], area = AREAS[id], known = visited.has(id);
    // The place's name on a banner at its northern edge (the traveller is usually inside), its region above.
    marks.push({ kind: 'region', id: `region-${id}`, at: [k.x, k.z - area.bounds[1] * .5 - 9], label: k.region, minZoom: .42 });
    marks.push({ kind: 'place', id: `place-${id}`, area: id, at: [k.x, k.z - area.bounds[1] * .5 - 1], label: area.name, known, current: state.area === id || (state.area === 'workshop' && id === 'plaza'), minZoom: .5 });
    // Seen from far, each place shows its painted landmark, the way a travel map is illustrated.
    const art = LANDMARK_ART.indexOf(id);
    if (art >= 0) marks.push({ kind: 'landmark', id: `landmark-${id}`, area: id, at: [k.x, k.z], art, known, label: area.name, current: state.area === id || (state.area === 'workshop' && id === 'plaza'), maxZoom: .47 });
    if (!known) continue;
    for (const object of area.objects || []) {
      if (object.hidden) continue;
      if (object.puzzle) marks.push({ kind: 'bench', id: object.id, at: toKingdom(id, [object.x, object.z]), label: object.label, restored: !!state.flags?.[object.puzzle], minZoom: .35 });
      else if (object.secret && state.secrets?.includes(object.secret)) marks.push({ kind: 'memory', id: object.id, at: toKingdom(id, [object.x, object.z]), label: object.label, minZoom: .7 });
    }
    for (const building of AREA_LAYOUTS[id]?.buildings || []) if (building.label) marks.push({ kind: 'building', id: building.id, at: toKingdom(id, [building.x, building.z]), label: building.label, minZoom: 1.1 });
    for (const exit of area.exits || []) if (!openExit(exit, state) && isExterior(exit.target)) marks.push({ kind: 'locked', id: exit.id, at: toKingdom(id, [exit.x, exit.z]), label: `${AREAS[exit.target]?.name ?? 'Paso'} · paso cerrado`, minZoom: .6 });
  }
  // The Monte Quieto is named on every map; its Casa de Compuertas once the Manantial is known, its
  // window lit or dark as the kingdom left it. It is not a destination yet.
  marks.push({ kind: 'peak', id: 'quiet-mount', at: QUIET_MOUNT.peak, label: QUIET_MOUNT.name });
  if (visited.has('spring')) { const lamp = quietMountState(state).lamp; marks.push({ kind: 'works', id: 'quiet-mount-house', at: [QUIET_MOUNT.powerhouse.x, QUIET_MOUNT.powerhouse.z], label: QUIET_MOUNT.house, lamp, minZoom: .4 }); }
  // The workshop is a building of the village: its bench is shown at its door.
  if (visited.has('workshop')) for (const object of AREAS.workshop.objects || []) if (object.puzzle) marks.push({ kind: 'bench', id: object.id, at: [KINGDOM.workshop.x, KINGDOM.workshop.z], label: object.label, restored: !!state.flags?.[object.puzzle], minZoom: .35 });
  for (const person of inhabitants) if (Number.isFinite(person.x)) marks.push({ kind: 'person', id: person.id, at: kingdomOf(state.area, [person.x, person.z]), label: person.label, minZoom: 1 });
  // Where the objective is: its object if it is known, otherwise the place.
  const objective = getObjective(state), area = valid(objective.area) ? objective.area : state.area;
  const object = [...(AREAS[area]?.objects || [])].find(o => o.id === objective.object);
  const goal = { area, at: object ? kingdomOf(area, [object.x, object.z]) : [KINGDOM[area].x, KINGDOM[area].z] };
  marks.push({ kind: 'objective', id: 'objective', at: goal.at, label: objective.title });
  const here = kingdomOf(state.area, position || state.position || AREAS[state.area]?.spawn || [0, 0]);
  const heading = facing && Math.hypot(facing[0], facing[1]) > .01 ? Math.atan2(facing[0], -facing[1]) * 180 / Math.PI : 0;
  marks.push({ kind: 'player', id: 'player', at: here, label: 'Estás aquí', heading });
  return { marks, route: journeyRoute(state, here, goal), here, goal, visited };
}

// A walked place, not the one you stand in, can be travelled to from the map itself.
const travel = mark => mark.known && !mark.current && mark.area !== 'workshop' ? ` data-travel="${mark.area}" data-travel-name="${esc(mark.label)}" role="button" tabindex="0" aria-label="${esc(mark.label)}: viajar"` : '';
function markHtml(mark) {
  const [x, y] = mapPoint(mark.at), data = `data-x="${x}" data-y="${y}"${mark.minZoom ? ` data-min-zoom="${mark.minZoom}"` : ''}${mark.maxZoom ? ` data-max-zoom="${mark.maxZoom}"` : ''}`;
  const label = `<span class="kmap-label">${esc(mark.label)}</span>`;
  switch (mark.kind) {
    case 'landmark': return `<div class="kmap-mark kmap-landmark ${mark.known ? 'known' : 'unknown'} ${mark.current ? 'current' : ''}" ${data}${travel(mark)}><span class="kmap-landmark-art" style="--col:${mark.art % 3};--row:${Math.floor(mark.art / 3)};background-image:url(./assets/art-polish/map-landmarks.webp)" aria-hidden="true"></span><span class="kmap-landmark-name">${esc(mark.label)}</span></div>`;
    case 'peak': return `<div class="kmap-mark kmap-peak" ${data}><i aria-hidden="true">▲</i><span>${esc(mark.label)}</span></div>`;
    case 'works': return `<div class="kmap-mark kmap-works lamp-${mark.lamp}" ${data} title="${esc(mark.label)}${mark.lamp === 'off' ? ' · callada' : mark.lamp === 'flicker' ? ' · su luz parpadea' : ' · su luz se sostiene'}"><i aria-hidden="true"></i><span class="kmap-label">${esc(mark.label)}</span></div>`;
    case 'region': return `<div class="kmap-mark kmap-region" ${data} aria-hidden="true">${esc(mark.label)}</div>`;
    case 'place': return `<div class="kmap-mark kmap-place ${mark.known ? 'known' : 'unknown'} ${mark.current ? 'current' : ''}" ${data}${travel(mark)}>${esc(mark.label)}</div>`;
    case 'bench': return `<div class="kmap-mark kmap-bench ${mark.restored ? 'restored' : 'pending'}" ${data} title="${esc(mark.label)} · ${mark.restored ? 'restaurado' : 'por restaurar'}"><i aria-hidden="true">Ω</i>${label}</div>`;
    case 'memory': return `<div class="kmap-mark kmap-memory" ${data} title="${esc(mark.label)}"><i aria-hidden="true">✦</i>${label}</div>`;
    case 'building': return `<div class="kmap-mark kmap-building" ${data}>${esc(mark.label)}</div>`;
    case 'locked': return `<div class="kmap-mark kmap-locked" ${data} title="${esc(mark.label)}"><i aria-hidden="true">×</i></div>`;
    case 'person': return `<div class="kmap-mark kmap-person" ${data}><i aria-hidden="true"></i>${label}</div>`;
    case 'objective': return `<div class="kmap-mark kmap-objective" ${data} title="${esc(mark.label)}"><i aria-hidden="true"></i></div>`;
    case 'player': return `<div class="kmap-mark kmap-player" ${data} title="Estás aquí"><i aria-hidden="true" style="--heading:${n(mark.heading)}deg"></i><span class="kmap-label">Vos</span></div>`;
    default: return '';
  }
}

/** The map screen. Interaction comes from bindKingdomMap. */
export function renderKingdomMap(state, options = {}) {
  if (!valid(state.area)) return '';
  const { marks, route, visited } = kingdomMapMarks(state, options);
  const guide = journeyGuidance(state), phase = journeyPhase(state);
  const routePath = route.length > 1 ? route.map((p, i) => `${i ? 'L' : 'M'}${mapPoint(p).join(' ')}`).join(' ') : '';
  const destinations = [...visited].map(id => `<button type="button" class="map-destination ${id === state.area ? 'selected' : ''}" data-area="${id}" ${id === state.area ? 'disabled aria-current="location"' : ''}><span>${esc(AREAS[id].name)}</span><small>${id === state.area ? 'Estás acá' : 'Viajar'}</small></button>`).join('');
  const fog = JSON.stringify([...visited].filter(isExterior));
  return `<div class="kmap" data-kmap data-fog='${esc(fog)}'>
    <div class="kmap-viewport" data-kmap-viewport tabindex="0" role="application" aria-roledescription="mapa" aria-label="Mapa del reino de Ohmdal, norte arriba. Arrastrá o usá las flechas para mover; rueda, pellizco o + y − para acercar; C para centrar en vos.">
      <div class="kmap-world" data-kmap-world style="width:${KINGDOM_MAP.width}px;height:${KINGDOM_MAP.height}px">
        <img class="kmap-base kmap-aged" src="${KINGDOM_MAP.src}" width="${KINGDOM_MAP.width}" height="${KINGDOM_MAP.height}" alt="" draggable="false" decoding="async">
        <img class="kmap-base kmap-walked" data-kmap-walked src="${KINGDOM_MAP.src}" width="${KINGDOM_MAP.width}" height="${KINGDOM_MAP.height}" alt="" draggable="false" decoding="async">
        <canvas class="kmap-fog" data-kmap-fog width="${KINGDOM_MAP.width / 8}" height="${KINGDOM_MAP.height / 8}" hidden aria-hidden="true"></canvas>
        <svg class="kmap-vectors" viewBox="0 0 ${KINGDOM_MAP.width} ${KINGDOM_MAP.height}" aria-hidden="true">${routePath ? `<path class="kmap-route-shadow" d="${routePath}"/><path class="kmap-route" d="${routePath}"/>` : ''}</svg>
      </div>
      <div class="kmap-marks" data-kmap-marks>${marks.map(markHtml).join('')}</div>
      <div class="kmap-frame" aria-hidden="true"></div>
    </div>
    <header class="kmap-title"><span class="eyebrow">EL VALLE Y LA COSTA</span><h2>Caminos de Ohmdal</h2><p>Día ${phase.day} · ${esc(phase.label)}</p></header>
    <aside class="kmap-quest" aria-label="Siguiente paso"><span class="kmap-quest-mark" aria-hidden="true"></span><div><strong>${esc(guide.title)}</strong><p>${esc(guide.direction)}</p></div><button class="quiet" data-map-guide>Ver guía</button></aside>
    <div class="kmap-compass" aria-hidden="true"><svg viewBox="-50 -50 100 100"><circle r="44" class="ring"/><circle r="38" class="ring thin"/><path class="needle-n" d="M0 -40 L7 0 L0 6 L-7 0Z"/><path class="needle-s" d="M0 40 L7 0 L0 -6 L-7 0Z"/><path class="needle-ew" d="M-34 0 L0 5 L34 0 L0 -5Z"/><text y="-30">N</text></svg></div>
    <div class="kmap-scale" data-kmap-scale aria-hidden="true"><i></i><span>50 m</span></div>
    <div class="kmap-controls" role="group" aria-label="Zoom del mapa"><button type="button" data-kmap-zoom="1" aria-label="Acercar">+</button><button type="button" data-kmap-zoom="-1" aria-label="Alejar">−</button><button type="button" data-kmap-center aria-label="Centrar en vos">◎</button></div>
    ${destinations ? `<details class="map-return kmap-travel"><summary>Viajar a un lugar visitado · ${visited.size}</summary><nav class="map-destinations" aria-label="Volver a lugares visitados">${destinations}</nav></details>` : ''}
    <ul class="kmap-legend" aria-label="Referencias"><li><i class="lg-player"></i>Vos</li><li><i class="lg-objective"></i>Siguiente paso</li><li><i class="lg-bench restored"></i>Restaurado</li><li><i class="lg-bench"></i>Por restaurar</li><li><i class="lg-fog"></i>Sin recorrer</li></ul>
  </div>`;
}

/** Pan, zoom, fog and the marks that follow the map. Returns a function that stops it. */
export function bindKingdomMap(root, { onTravel } = {}) {
  const host = root.querySelector('[data-kmap]'); if (!host) return () => {};
  const viewport = host.querySelector('[data-kmap-viewport]'), world = host.querySelector('[data-kmap-world]'), marks = [...host.querySelectorAll('.kmap-mark')];
  const player = marks.find(m => m.classList.contains('kmap-player')), scaleBar = host.querySelector('[data-kmap-scale]');
  let view = { x: 0, y: 0, s: 1 }, frame = 0, popover = null;
  const size = () => viewport.getBoundingClientRect();
  const limits = () => { const r = size(); return { min: Math.min(r.width / KINGDOM_MAP.width, r.height / KINGDOM_MAP.height) * .92, max: 1.6 }; };
  const clamp = () => {
    const r = size(), { min, max } = limits(); view.s = Math.min(max, Math.max(min, view.s));
    const w = KINGDOM_MAP.width * view.s, h = KINGDOM_MAP.height * view.s;
    view.x = w <= r.width ? (r.width - w) / 2 : Math.min(r.width * .25, Math.max(r.width * .75 - w, view.x));
    view.y = h <= r.height ? (r.height - h) / 2 : Math.min(r.height * .25, Math.max(r.height * .75 - h, view.y));
  };
  const draw = () => {
    frame = 0; clamp();
    world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.s})`;
    for (const m of marks) {
      const min = Number(m.dataset.minZoom || 0), max = Number(m.dataset.maxZoom || 99), show = view.s >= min && view.s <= max;
      m.hidden = !show; if (!show) continue;
      m.style.transform = `translate(${n(view.x + m.dataset.x * view.s)}px, ${n(view.y + m.dataset.y * view.s)}px) translate(-50%, -50%)`;
    }
    // A scale bar that stays a round number of metres.
    const metresPerPx = 1 / (KINGDOM_MAP.pxPerMetre * view.s), target = 90 * metresPerPx, step = [5, 10, 20, 25, 50, 100, 200].find(v => v >= target) || 200;
    scaleBar.querySelector('i').style.width = `${n(step / metresPerPx)}px`; scaleBar.querySelector('span').textContent = `${step} m`;
    host.dataset.zoom = view.s >= 1.1 ? 'near' : view.s >= .55 ? 'mid' : view.s >= .16 ? 'far' : 'farthest';
    // Landmark art shrinks with the sheet, and gives way to names alone when the whole kingdom is small.
    host.style.setProperty('--landmark', `${Math.round(Math.max(40, Math.min(78, 320 * view.s)))}px`);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); if (popover) popover.hidden = true; };
  const zoomAt = (factor, cx, cy) => { const s = view.s, next = Math.min(limits().max, Math.max(limits().min, s * factor)); view.x = cx - (cx - view.x) * next / s; view.y = cy - (cy - view.y) * next / s; view.s = next; schedule(); };
  const centerOn = (px, py, s = view.s) => { const r = size(); view.s = s; view.x = r.width / 2 - px * s; view.y = r.height / 2 - py * s; schedule(); };
  // Start on the traveller, close enough to read the place and its neighbours.
  const r0 = size(), [px, py] = [Number(player?.dataset.x || KINGDOM_MAP.width / 2), Number(player?.dataset.y || KINGDOM_MAP.height / 2)];
  centerOn(px, py, Math.max(limits().min, Math.min(.8, Math.max(.5, r0.height / (150 * KINGDOM_MAP.pxPerMetre)))));
  // Not yet walked: the sheet looks old and faded. Walked places and the roads between them carry
  // their colour: a soft mask, drawn small and stretched, reveals the coloured copy of the map.
  const fog = host.querySelector('[data-kmap-fog]'), walked = host.querySelector('[data-kmap-walked]'), visited = JSON.parse(host.dataset.fog || '[]');
  if (fog?.getContext && walked) {
    const g = fog.getContext('2d'), k = KINGDOM_MAP.pxPerMetre / 8, P = ([x, z]) => [(x - KINGDOM_MAP.x0) * k, (z - KINGDOM_MAP.z0) * k];
    g.clearRect(0, 0, fog.width, fog.height); g.filter = 'blur(6px)'; g.fillStyle = g.strokeStyle = '#fff'; g.lineCap = g.lineJoin = 'round';
    for (const id of visited) { const [w, d] = AREAS[id].bounds, [x, y] = P([KINGDOM[id].x - w / 2 - 12, KINGDOM[id].z - d / 2 - 12]); g.beginPath(); if (g.roundRect) g.roundRect(x, y, (w + 24) * k, (d + 24) * k, 10); else g.rect(x, y, (w + 24) * k, (d + 24) * k); g.fill(); }
    for (let i = 1; i < EXTERIORS.length; i++) if (visited.includes(EXTERIORS[i - 1]) && visited.includes(EXTERIORS[i])) { const p = passageGeometry(EXTERIORS[i - 1], EXTERIORS[i]); if (!p) continue; g.lineWidth = 34 * k; g.beginPath(); p.points.forEach((q, j) => { const [x, y] = P(q); j ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); }
    const mask = `url(${fog.toDataURL()})`; walked.style.maskImage = walked.style.webkitMaskImage = mask;
  }
  // Pointer: drag to pan, wheel to zoom at the cursor, two fingers to pinch.
  const pointers = new Map(); let pinch = null, travelled = 0;
  viewport.addEventListener('pointerdown', e => { if (e.target.closest('button,summary,a')) return; travelled = 0; pointers.set(e.pointerId, [e.clientX, e.clientY]); host.classList.add('dragging'); if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) }; } });
  viewport.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId); pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 2 && pinch) { const [a, b] = [...pointers.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), r = size(); zoomAt(d / pinch.d, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); pinch.d = d; return; }
    travelled += Math.abs(e.clientX - prev[0]) + Math.abs(e.clientY - prev[1]);
    // Capture only once it is a drag: a tap must still reach the place it touched.
    if (travelled > 6 && !viewport.hasPointerCapture?.(e.pointerId)) viewport.setPointerCapture?.(e.pointerId);
    view.x += e.clientX - prev[0]; view.y += e.clientY - prev[1]; schedule();
  });
  // Travel: every [data-area] button goes through one door; a walked place on the map offers it first.
  popover = document.createElement('div'); popover.className = 'kmap-popover'; popover.hidden = true; host.appendChild(popover);
  const offer = mark => {
    popover.innerHTML = `<strong>${mark.dataset.travelName}</strong><button type="button" class="kmap-go" data-area="${mark.dataset.travel}">Viajar acá</button><button type="button" class="kmap-dismiss" aria-label="Cerrar">×</button>`;
    const r = mark.getBoundingClientRect(), h = host.getBoundingClientRect();
    popover.style.left = `${Math.round(r.left + r.width / 2 - h.left)}px`; popover.style.top = `${Math.round(r.top - h.top - 8)}px`; popover.hidden = false;
    popover.querySelector('.kmap-go').focus({ preventScroll: true });
  };
  host.addEventListener('click', e => {
    const go = e.target.closest('[data-area]');
    if (go && !go.disabled) { onTravel?.(go.dataset.area); return; }
    if (e.target.closest('.kmap-dismiss')) { popover.hidden = true; return; }
    const mark = e.target.closest('[data-travel]');
    if (mark && travelled < 6) offer(mark); else if (!e.target.closest('.kmap-popover')) popover.hidden = true;
  });
  host.addEventListener('keydown', e => { const mark = e.target.closest?.('[data-travel]'); if (mark && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); offer(mark); } });
  const release = e => { pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null; if (!pointers.size) host.classList.remove('dragging'); };
  viewport.addEventListener('pointerup', release); viewport.addEventListener('pointercancel', release);
  viewport.addEventListener('wheel', e => { e.preventDefault(); const r = size(); zoomAt(Math.exp(-e.deltaY * .0015), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  const zoomCenter = factor => { const r = size(); zoomAt(factor, r.width / 2, r.height / 2); };
  host.querySelectorAll('[data-kmap-zoom]').forEach(b => b.addEventListener('click', () => zoomCenter(b.dataset.kmapZoom === '1' ? 1.5 : 1 / 1.5)));
  host.querySelector('[data-kmap-center]')?.addEventListener('click', () => centerOn(px, py));
  viewport.addEventListener('keydown', e => {
    const step = 80, keys = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step], a: [step, 0], d: [-step, 0], w: [0, step], s: [0, -step] };
    if (keys[e.key]) { e.preventDefault(); e.stopPropagation(); view.x += keys[e.key][0]; view.y += keys[e.key][1]; schedule(); }
    else if (['+', '='].includes(e.key)) { e.preventDefault(); zoomCenter(1.4); }
    else if (['-', '_'].includes(e.key)) { e.preventDefault(); zoomCenter(1 / 1.4); }
    else if (e.key.toLowerCase() === 'c') { e.preventDefault(); centerOn(px, py); }
  });
  const onResize = () => schedule(); addEventListener('resize', onResize);
  draw();
  return () => { removeEventListener('resize', onResize); cancelAnimationFrame(frame); };
}
