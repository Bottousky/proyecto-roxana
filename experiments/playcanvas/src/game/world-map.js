import {AREAS, getObjective} from './content.js';
import {AREA_LAYOUTS} from './world-layout.js';
import {inhabitantPlan} from './world-inhabitants.js';
import {KINGDOM,WATERCOURSE,nextPassage,isExterior,passagesFor,passageGeometry,fromKingdom,corridorX,travelBounds} from './kingdom-geography.js';
import {journeyGuidance} from './journey-guide.js';
import {journeyPhase} from './story-time.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const point = value => Array.isArray(value) && value.length >= 2 && value.slice(0, 2).every(Number.isFinite);
const n = value => Number(value.toFixed(3));
const openExit = (exit, state) => (exit.requires || []).every(flag => Boolean(state.flags?.[flag]));
const validArea = id => Object.hasOwn(AREAS, id);
const knownAreas = state => new Set([...(state.visited || []), state.area].filter(validArea));

/** The topology and compass directions come from the actual area exits.
 * A room's returning door may face south even when its building lies west.
 * Place each area on its first approach; reciprocal exits never move it.
 */
export function buildRegionalMap(areas = AREAS, start = 'portal') {
  const positions = new Map(), edges = new Map();
  if (!areas[start]) return {nodes: [], edges: []};
  const queue = [start];
  positions.set(start, [0, 0]);
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i], [x, z] = positions.get(id);
    for (const exit of areas[id].exits || []) {
      if (!areas[exit.target]) continue;
      const key = [id, exit.target].sort().join(':');
      if (!edges.has(key)) edges.set(key, {id:key, from:id, to:exit.target, passages:[]});
      edges.get(key).passages.push({from:id, to:exit.target, exit});
      if (positions.has(exit.target)) continue;
      const westEast = Math.abs(exit.x) > Math.abs(exit.z);
      positions.set(exit.target, [x + (westEast ? Math.sign(exit.x) : 0), z + (westEast ? 0 : Math.sign(exit.z))]);
      queue.push(exit.target);
    }
  }
  return {nodes:[...positions].map(([id, [x, z]]) => ({id, x:areas===AREAS?KINGDOM[id].x:x, z:areas===AREAS?KINGDOM[id].z:z})), edges:[...edges.values()]};
}

function passageState(edge, state, visited) {
  // A free return door does not make a still-locked outward passage open.
  const passage = edge.passages.find(item => item.from === state.area)
    || edge.passages.find(item => visited.has(item.from) && !visited.has(item.to))
    || edge.passages.find(item => item.exit.requires?.length)
    || edge.passages[0];
  return openExit(passage.exit, state);
}

function regionalSvg(state, objectiveArea) {
  const graph = buildRegionalMap(), visited = knownAreas(state);
  const known = new Set([...visited, objectiveArea].filter(validArea));
  const maxZ = Math.max(...graph.nodes.map(node => node.z));
  const minZ = Math.min(...graph.nodes.map(node => node.z));
  const scale=406/Math.max(1,maxZ-minZ),project=([x,z])=>[119+x*scale,492-(maxZ-z)*scale];
  const nodes = new Map(graph.nodes.map(node => {const [sx,sy]=project([node.x,node.z]);return [node.id,{...node,sx:n(sx),sy:n(sy)}];}));
  const paths = graph.edges.map(edge => {
    const a = nodes.get(edge.from), b = nodes.get(edge.to);
    const explored = visited.has(a.id) || visited.has(b.id), accessible = passageState(edge, state, visited);
    const status = !explored ? 'unknown' : accessible ? 'open' : 'locked';
    const title = !explored ? 'Camino por explorar' : accessible ? 'Paso abierto' : 'Paso cerrado';
    const passage=passageGeometry(edge.from,edge.to),route=passage?[[a.x,a.z],...passage.points,[b.x,b.z]]:[[a.x,a.z],[b.x,b.z]];
    const path=route.map((p,i)=>`${i?'L':'M'}${project(p).map(n).join(' ')}`).join('')+(passage?.routes.slice(1).map(r=>r.points.map((p,i)=>`${i?'L':'M'}${project(p).map(n).join(' ')}`).join('')).join('')||'');
    return `<g class="journey-edge ${status}" data-connection="${esc(edge.id)}" data-passage="${status}"><title>${title}</title><path d="${path}"/>${status === 'locked' ? `<path class="journey-bar" d="M${n((a.sx+b.sx)/2-4)} ${n((a.sy+b.sy)/2-4)}l8 8m-8 0 8-8"/>` : ''}</g>`;
  }).join('');
  const marks = [...nodes.values()].map(node => {
    const current = node.id === state.area, seen = visited.has(node.id), named = known.has(node.id);
    const label = named ? AREAS[node.id].name : '· · ·';
    const isWest = node.id === 'workshop';
    const labelX = isWest ? node.sx-58 : node.sx + 20, labelY = node.sy + (isWest ? -17 : 4);
    const labelMarkup = isWest && named ? `<tspan x="${labelX}" dy="0">El taller</tspan><tspan x="${labelX}" dy="16">de Lumen</tspan>` : esc(label);
    return `<g class="journey-node ${seen?'visited':'unvisited'} ${current?'current':''}" data-map-area="${esc(node.id)}" transform="translate(0 0)"><title>${named?esc(label):'Lugar todavía desconocido'}${current?' · Estás aquí':seen?' · Visitado':''}</title>${current?`<circle class="journey-current-ring" cx="${node.sx}" cy="${n(node.sy)}" r="13"/>`:''}<circle cx="${node.sx}" cy="${n(node.sy)}" r="${current?7:5}"/><text x="${labelX}" y="${n(labelY)}" text-anchor="${isWest?'middle':'start'}">${labelMarkup}</text>${current?`<text class="journey-you" x="${isWest?labelX:labelX}" y="${n(node.sy+(isWest?25:20))}" text-anchor="${isWest?'middle':'start'}">ESTÁS AQUÍ</text>`:''}</g>`;
  }).join('');
  const artOrder=['portal','plaza','workshop','road','spring','castle','terraces','lake','lighthouse'];
  // The workshop shares the village cluster; a second illustration would cover its label.
  const sketches=[...nodes.values()].filter(node=>visited.has(node.id)&&node.id!=='workshop').map(node=>{
    const index=artOrder.indexOf(node.id),col=index%3,row=Math.floor(index/3),x=node.id==='workshop'?42:node.sx-35,y=node.sy-36;
    return `<svg class="journey-landmark-art" x="${x}" y="${y}" width="38" height="38" viewBox="${col*100} ${row*100} 100 100" aria-hidden="true"><image href="./assets/art-polish/map-landmarks.webp" width="300" height="300"/></svg>`;
  }).join('');
  const waterPoints=WATERCOURSE.map(p=>project(p).map(n).join(',')).join(' ');
  const districts=graph.nodes.filter(node=>node.id!=='workshop').map(node=>{const [x,y]=project([node.x,node.z]),layout=AREA_LAYOUTS[node.id];return `<g class="kingdom-district" opacity="${visited.has(node.id)?1:.4}">${layout.buildings.map(b=>`<rect x="${n(x+(b.x-b.w/2)*scale)}" y="${n(y+(b.z-b.d/2)*scale)}" width="${n(b.w*scale)}" height="${n(b.d*scale)}"/>`).join('')}</g>`;}).join('');
  return `<svg class="journey-map" viewBox="0 0 355 535" role="img" aria-label="Geografía de Ohmdal: pueblo al sur, Castillo en la loma oeste y costa al noreste"><path class="kingdom-coast" d="M177 27Q225 73 157 135L158 169Q216 147 220 76L250 27Z"/><polyline class="kingdom-river" points="${waterPoints}"/><path class="kingdom-ridge" d="m54 146 14-19 12 20m-27 10 14-13 14 18m-20 11 12-14 12 16m-34 27 14-20 14 22"/><text class="kingdom-terrain-label" x="42" y="231" transform="rotate(-90 42 231)">LOMA DE LA RED</text><text class="kingdom-terrain-label" x="239" y="75">EL LAGO</text><text class="map-compass" x="29" y="30">N</text><path class="map-north" d="M34 58V39m-5 7 5-7 5 7"/>${districts}${paths}${sketches}${marks}</svg>`;
}

function shapeSvg(shape, project, scale, attributes = '') {
  if (Array.isArray(shape.points)) return `<polygon points="${shape.points.filter(point).map(([x,z])=>project(x,z).join(',')).join(' ')}" ${attributes}/>`;
  if (![shape.x, shape.z].every(Number.isFinite)) return '';
  const [x, y] = project(shape.x, shape.z);
  if (Number.isFinite(shape.r)) return `<circle cx="${x}" cy="${y}" r="${n(shape.r*scale)}" ${attributes}/>`;
  if (![shape.w, shape.d].every(Number.isFinite)) return '';
  return `<rect x="${n(x-shape.w*scale/2)}" y="${n(y-shape.d*scale/2)}" width="${n(shape.w*scale)}" height="${n(shape.d*scale)}" ${attributes}/>`;
}

/** Labels may move; the projected resident dots always retain their real position. */
export function layoutPersonLabels(people,project,bounds,blocked=[]){
  const points=people.filter(person=>person.id!=='ohm_companion').map(person=>{
    const [x,y]=project(person.x,person.z);
    return {id:person.id,label:person.label,x,y,width:[...String(person.label||'')].length*16*.72+6,height:22};
  }).sort((a,b)=>a.y-b.y||a.x-b.x||a.id.localeCompare(b.id));
  const occupied=[...blocked,...points.map(point=>({left:point.x-6,right:point.x+6,top:point.y-6,bottom:point.y+6}))];
  const overlaps=(a,b)=>a.left<b.right+3&&a.right>b.left-3&&a.top<b.bottom+3&&a.bottom>b.top-3;
  return points.map(point=>{
    const candidates=[];
    for(let step=0;step<8;step++){
      candidates.push([point.x,point.y-13-step*26],[point.x,point.y+29+step*26]);
      for(const direction of [-1,1])for(const offset of [0,-26,26])candidates.push([point.x+direction*(point.width/2+15+step*20),point.y+5+offset]);
    }
    const options=candidates.map(([x,y])=>{
      x=Math.max(bounds.x+5+point.width/2,Math.min(bounds.x+bounds.w-5-point.width/2,x));
      y=Math.max(bounds.y+22,Math.min(bounds.y+bounds.h-8,y));
      const rect={left:x-point.width/2,right:x+point.width/2,top:y-18,bottom:y+4};
      return {x,y,rect,hits:occupied.filter(other=>overlaps(rect,other)).length,distance:Math.hypot(x-point.x,y-(point.y-13))};
    }).sort((a,b)=>a.hits-b.hits||a.distance-b.distance);
    const chosen=options[0];occupied.push(chosen.rect);
    return {...point,labelX:n(chosen.x),labelY:n(chosen.y),rect:chosen.rect,displaced:Math.abs(chosen.x-point.x)>.5||Math.abs(chosen.y-(point.y-13))>.5};
  });
}

function localMarker(object, project, kind, label = object.label, placement) {
  const [x, y] = project(object.x, object.z);
  const symbol = kind === 'person' ? '<circle r="4"/>' : kind === 'memory' ? '<path d="M0-5 4 0 0 5-4 0Z"/>' : '<rect x="-4" y="-4" width="8" height="8" rx="1"/>';
  const labelX=placement?placement.labelX-x:0,labelY=placement?placement.labelY-y:-13;
  const leader=placement?.displaced?`<path class="local-person-leader" d="M0 0L${n(Math.max(placement.rect.left,Math.min(placement.rect.right,x))-x)} ${n(Math.max(placement.rect.top,Math.min(placement.rect.bottom,y))-y)}"/>`:'';
  return `<g class="local-mark ${kind}" data-map-object="${esc(object.id)}" transform="translate(${x} ${y})"><title>${esc(label)}</title>${leader}${symbol}${kind==='person'&&object.id!=='ohm_companion'?`<text data-map-person-label="${esc(object.id)}" x="${n(labelX)}" y="${n(labelY)}" text-anchor="middle">${esc(label)}</text>`:''}</g>`;
}

function buildingLabel(building, project, bounds) {
  if (!building.label) return '';
  let [x,y] = project(building.x,building.z), anchor = 'middle';
  const inset = 8, left = bounds.x+inset, right = bounds.x+bounds.w-inset;
  // A conservative text span keeps the label and its outline inside the
  // map even before the webfont loads. Edge labels read toward the centre.
  const halfWidth = [...building.label].length*11*.75/2;
  if (x-halfWidth<left) { x=left; anchor='start'; }
  else if (x+halfWidth>right) { x=right; anchor='end'; }
  y=Math.max(bounds.y+14,Math.min(bounds.y+bounds.h-8,y+3));
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}">${esc(building.label)}</text>`;
}

/** World dimensions are full widths/depths; +z is south, matching gameplay.
 * Only area exits receive doorway symbols. Decorative building approaches
 * are drawn as paving by the shared layout, never as extra usable entrances.
 */
export function renderLocalMap(area, layout = AREA_LAYOUTS[area?.id], position, state = {}, inhabitants) {
  if (typeof area === 'string') area = AREAS[area];
  if (!area) return '';
  layout ||= AREA_LAYOUTS[area.id] || {};
  const [width, depth] = layout.bounds || area.bounds;
  const scale = Math.min(472/width, 420/depth);
  const project = (x, z) => [n(280+x*scale), n(254+z*scale)];
  const [left, top] = project(-width/2, -depth/2);
  const bounds = {x:left, y:top, w:n(width*scale), h:n(depth*scale)};
  const prefix = `local-${area.id.replace(/[^a-z0-9_-]/gi, '')}`;
  const clip = `<clipPath id="${prefix}-bounds"><rect x="${left}" y="${top}" width="${bounds.w}" height="${bounds.h}"/></clipPath>`;
  const paths = (layout.paths || []).map(path => `<polyline class="local-path${path.surface==='wood'?' wood':''}" data-map-path="${esc(path.id)}" points="${path.points.map(([x,z])=>project(x,z).join(',')).join(' ')}" stroke-width="${n(path.width*scale)}"/>`).join('');
  const courts = (layout.courts || []).map(court => shapeSvg(court, project, scale, `class="local-court" data-map-court="${esc(court.id)}"`)).join('');
  const secretIds = new Set((area.objects||[]).filter(object=>object.secret && !state.secrets?.includes(object.secret)).map(object=>object.id));
  const water = (layout.waters || []).map(shape => `<g><title>${esc(shape.label||'Agua')}</title>${shapeSvg(shape,project,scale,`class="local-water" data-map-water="${esc(shape.id)}"`)}</g>`).join('');
  const surfaces = (layout.walkSurfaces || []).map(shape => shapeSvg(shape,project,scale,`class="local-surface ${shape.surface==='wood'?'wood':''}" data-map-surface="${esc(shape.id)}"`)).join('');
  const exclusions = (layout.exclusions || []).filter(shape=>!secretIds.has(shape.id)).map(shape => `<g>${shape.label?`<title>${esc(shape.label)}</title>`:''}${shapeSvg(shape, project, scale, `class="local-exclusion ${/agua|lago|río|canal|orilla|manantial/i.test(shape.label||'')?'water':''}" data-map-exclusion="${esc(shape.id)}"`)}</g>`).join('');
  const buildings = (layout.buildings || []).map(building => `<g class="local-building" data-map-building="${esc(building.id)}"><title>${esc(building.label || 'Edificio')}</title>${shapeSvg(building, project, scale)}${buildingLabel(building,project,bounds)}</g>`).join('');
  const inside = object => Number.isFinite(object.x) && Number.isFinite(object.z) && Math.abs(object.x)<=width/2 && Math.abs(object.z)<=depth/2;
  const landmarks = (layout.landmarks || []).filter(object => inside(object) && !object.hidden && !object.distant && !secretIds.has(object.id) && (!object.secret || state.secrets?.includes(object.secret))).map(object => {
    const [x,y] = project(object.x,object.z);
    return `<g class="local-landmark" data-map-landmark="${esc(object.id)}"><title>${esc(object.label)}</title><circle cx="${x}" cy="${y}" r="3"/><text x="${x}" y="${y-8}" text-anchor="middle">${esc(object.label)}</text></g>`;
  }).join('');
  const people = inhabitants ?? (area.objects||[]).filter(o=>o.kind==='npc'&&inhabitantPlan(area.id,o,state).present).map(o=>{const p=inhabitantPlan(area.id,o,state).stops[0];return {...o,x:p[0],z:p[1]};});
  const player = point(position) ? position : point(state.position) ? state.position : area.spawn;
  const [px,py] = project(player[0],player[1]);
  const labelObstacles=(area.exits||[]).filter(inside).map(exit=>{const [x,y]=project(exit.x,exit.z);return {left:x-12,right:x+12,top:y-12,bottom:y+12};});
  // The player stays in place; reserve both the halo and the "Vos" label below it.
  labelObstacles.push({left:px-13,right:px+13,top:py-13,bottom:py+13},{left:px-16,right:px+16,top:py+11,bottom:py+28});
  const personLabels=new Map(layoutPersonLabels(people.filter(object=>inside(object)&&!object.hidden),project,bounds,labelObstacles).map(placement=>[placement.id,placement]));
  const objects = [...(area.objects||[]).filter(o=>o.kind!=='npc'),...people].filter(object => inside(object) && !object.hidden).map(object => {
    if (object.secret) return state.secrets?.includes(object.secret) ? localMarker(object, project, 'memory', 'Recuerdo encontrado') : '';
    if (object.kind === 'npc') return localMarker(object, project, 'person',object.label,personLabels.get(object.id));
    if (['panel','beacon'].includes(object.kind)) return localMarker(object, project, 'place');
    return '';
  }).join('');
  const exits = (area.exits || []).filter(exit => inside(exit) && AREAS[exit.target]).map(exit => {
    const [x,y] = project(exit.x, exit.z), open = openExit(exit, state);
    const destination = exit.label || AREAS[exit.target].name;
    // The workshop is a west-side building with a south-facing door.
    const south = area.id === 'workshop' || (area.id === 'plaza' && exit.target === 'workshop') || exit.z > 0;
    const labelY = y + (south ? 23 : -14), labelX = Math.max(70,Math.min(490,x));
    return `<g class="local-exit ${open?'open':'locked'}" data-map-exit="${esc(exit.id)}" data-passage="${open?'open':'locked'}"><title>${esc(destination)} · ${open?'Paso abierto':'Paso cerrado'}</title><path d="M${x-6} ${y+6}V${y-6}H${x+6}V${y+6}"/>${open?'':`<path class="local-exit-bar" d="M${x-4} ${y-3}l8 8m-8 0 8-8"/>`}<text x="${labelX}" y="${n(labelY)}" text-anchor="middle">${esc(destination)}</text></g>`;
  }).join('');
  const objective = getObjective(state);
  const nextExit = nextPassage(area.id, objective.area);
  const target = nextExit || (area.id === objective.area && [...people,...(area.objects || [])].find(object => object.id === objective.object));
  const objectiveMarker = target && !target.hidden && !target.secret && inside(target) ? (() => {
    const [x,y] = project(target.x,target.z);
    return `<g class="local-objective" data-map-objective="${esc(target.id)}"><title>${esc(nextExit ? 'Siguiente acceso: ' + (nextExit.label || AREAS[nextExit.target].name) : objective.title)}</title><path d="M${x} ${y-16}l16 16-16 16-16-16Z"/></g>`;
  })() : '';
  const playerMarker = `<g class="local-player" data-map-player="true" data-world-x="${n(player[0])}" data-world-z="${n(player[1])}" transform="translate(${px} ${py})"><title>Estás aquí</title><circle class="local-player-halo" r="11"/><circle r="5"/><text y="24" text-anchor="middle">Vos</text></g>`;
  return `<svg class="local-map" viewBox="${n(left-58)} ${n(top-34)} ${n(bounds.w+116)} ${n(bounds.h+68)}" role="img" aria-label="${esc(`Mapa de ${area.name}. Norte arriba. Tu posición, caminos y accesos.`)}"><defs>${clip}</defs><rect class="local-ground" x="${left}" y="${top}" width="${bounds.w}" height="${bounds.h}"/><g clip-path="url(#${prefix}-bounds)">${water}${surfaces}${courts}${paths}${exclusions}${buildings}${landmarks}${objects}</g><rect class="local-border" x="${left}" y="${top}" width="${bounds.w}" height="${bounds.h}"/>${exits}${objectiveMarker}${playerMarker}<text class="map-compass" x="${n(left+bounds.w+24)}" y="${n(top+6)}">N</text><path class="map-north" d="M${n(left+bounds.w+29)} ${n(top+33)}V${n(top+14)}m-5 7 5-7 5 7"/></svg>`;
}

export function renderWorldMap(state, {position, inhabitants, objectiveArea = getObjective(state)?.area} = {}) {
  if (!validArea(state.area)) return '';
  const area = AREAS[state.area];
  const visited = new Set((state.visited || []).filter(validArea));
  const destinations = [...visited].map(id => `<button type="button" class="map-destination ${id===state.area?'selected':''}" data-area="${id}" ${id===state.area?'disabled aria-current="location"':''}><span>${esc(AREAS[id].name)}</span><small>${id===state.area?'Lugar actual':'Viajar a este lugar'}</small></button>`).join('');
  const guide=journeyGuidance(state);
  const phase=journeyPhase(state);
  const orientation = `Día ${phase.day} · ${phase.label}. Norte arriba. Pueblo al sur, loma al oeste y costa al noreste.`;
  let localLayout=AREA_LAYOUTS[area.id];
  if(isExterior(area.id)){
    const extensions=passagesFor(area.id).flatMap(e=>passageGeometry(area.id,e.target).routes.map(route=>({id:`journey-${e.id}-${route.id}`,width:route.width,points:[[e.x,e.z],...route.points.slice(0,21).map(p=>fromKingdom(area.id,p))]})));
    // The local sheet frames this place, expanding only when the traveller is on a connector.
    // The kingdom view retains the complete geography instead of shrinking village labels.
    const player=point(position)?position:point(state.position)?state.position:area.spawn;
    const bounds=(localLayout.bounds||area.bounds).map((size,index)=>Math.max(size,Math.abs(player[index])*2+8));
    localLayout={...localLayout,bounds,paths:[...localLayout.paths,...extensions]};
  }
  const localView = `<div class="local-map-viewer"><input type="checkbox" class="local-map-zoom-toggle" id="local-map-zoom-${area.id}" aria-controls="local-map-view-${area.id}"><label class="local-map-zoom-label" for="local-map-zoom-${area.id}">Ampliar mapa</label><p class="local-map-zoom-help">Deslizá el plano para leer los nombres.</p><div class="local-map-viewport" id="local-map-view-${area.id}" tabindex="0" role="region" aria-label="${esc(`Plano de ${area.name}`)}">${renderLocalMap(area,localLayout,position,state,inhabitants)}</div></div>`;
  return `<div class="eyebrow">EL VALLE Y LA COSTA</div><h2>Caminos de Ohmdal</h2><p class="modal-intro">${orientation}</p><div class="map-context"><p><strong>${esc(guide.title)}</strong><br>${esc(guide.direction)}</p><button class="quiet" data-map-guide>Ver guía →</button></div><div class="map-view-tabs" role="tablist" aria-label="Vista del mapa"><button id="map-tab-local" role="tab" data-map-view="local" aria-controls="map-panel-local" aria-selected="true">Zona actual</button><button id="map-tab-kingdom" role="tab" data-map-view="kingdom" aria-controls="map-panel-kingdom" aria-selected="false" tabindex="-1">Todo el reino</button></div><div class="world-map-layout"><section id="map-panel-kingdom" role="tabpanel" tabindex="0" hidden class="journey-section" aria-labelledby="map-tab-kingdom"><h3 id="journey-map-title">El camino recorrido</h3>${regionalSvg(state,objectiveArea)}<div class="world-map-key"><span><i class="key-current"></i>Estás aquí</span><span><i class="key-visited"></i>Visitado</span><span><i class="key-locked">×</i>Paso cerrado</span></div></section><section id="map-panel-local" role="tabpanel" tabindex="0" class="local-map-section" aria-labelledby="map-tab-local"><div class="local-map-heading"><span class="eyebrow">A TU ALREDEDOR</span><h3 id="local-map-title">${esc(area.name)}</h3></div>${localView}<div class="world-map-key"><span><i class="key-path"></i>Camino</span><span><i class="key-person"></i>Persona</span><span><i class="key-place"></i>Banco</span><span><i class="key-door"></i>Acceso</span><span><i class="key-objective"></i>Siguiente paso</span></div><p class="local-map-note">Las marcas de acceso señalan dónde pasar de un lugar a otro.</p></section></div>${destinations?`<details class="map-return"><summary>Viajar a un lugar visitado · ${visited.size}</summary><nav class="map-destinations" aria-label="Volver a lugares visitados">${destinations}</nav></details>`:''}`;
}

export const mapStyles = `
.world-map-layout{display:grid;grid-template-columns:minmax(255px,.8fr) minmax(0,1.3fr);gap:22px;margin-top:22px;align-items:start}
.world-map-layout h3{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:500;color:#e4cea5;line-height:1.2}
.journey-section,.local-map-section{min-width:0;border:1px solid #c3ae7830;background:radial-gradient(ellipse at 50% 20%,#4663592a,transparent 75%),#10292345;padding:18px 16px 14px}
.journey-map,.local-map{width:100%;display:block;overflow:visible}
.journey-map{max-height:490px;margin:2px auto 8px}.local-map{margin:12px 0 8px}
.kingdom-coast{fill:#487f8640;stroke:#769e9755;stroke-width:1}.kingdom-river{fill:none;stroke:#6caaad66;stroke-width:5;stroke-linejoin:round}.kingdom-ridge{fill:none;stroke:#87947d70;stroke-width:1.2}.kingdom-terrain-label{fill:#819a8b;font:7px Inter,sans-serif;letter-spacing:1px}.kingdom-district rect{fill:#ac956044;stroke:#bcab7d77;stroke-width:.6}
.journey-edge path{fill:none;stroke:#ad9970;stroke-width:2}.journey-edge.unknown path{stroke:#80928650;stroke-dasharray:3 7}.journey-edge.locked path{stroke:#a98c6b;stroke-dasharray:5 5}.journey-edge .journey-bar{stroke:#e0ad8d;stroke-dasharray:none;stroke-width:2.5}
.journey-node circle{fill:#183235;stroke:#6d8074;stroke-width:1.5}.journey-node.visited circle{fill:#c6ae7e;stroke:#e9d2a1}.journey-node.current circle{fill:#95dbc3;stroke:#c8ffe7}.journey-node .journey-current-ring{fill:none!important;stroke:#8fcab766!important;stroke-width:1}
.journey-node text{fill:#d6c7ac;font-family:'Cormorant Garamond',serif;font-size:18px}.journey-node.unvisited text{fill:#8ea99c}.journey-node .journey-you{fill:#a6e1c9;font-family:Inter,sans-serif;font-size:7px;letter-spacing:1px}
.map-compass{fill:#c8b78f;font-family:'Cormorant Garamond',serif;font-size:18px}.map-north{fill:none;stroke:#c8b78f;stroke-width:1.3}
.local-map-heading .eyebrow{font-size:7px;letter-spacing:.16em;margin-bottom:5px}.local-map-heading h3{font-size:30px}
.local-map-zoom-toggle,.local-map-zoom-label,.local-map-zoom-help{display:none}.local-map-viewport{min-width:0}.local-map-viewport:focus-visible{outline:1px solid #a5e7ca;outline-offset:3px}
.local-ground{fill:#203b35}.local-court{fill:#7c806053}.local-path{fill:none;stroke:#a7a0777a;stroke-linecap:round;stroke-linejoin:round}.local-path.wood{stroke:#b39a71}.local-exclusion{fill:#203b35;stroke:#64766455;stroke-width:.8}.local-exclusion.water,.local-water{fill:#18434a;stroke:#71918a55;stroke-width:1}.local-surface{fill:#899074;stroke:#b1a57a;stroke-width:1}.local-surface.wood{fill:#806e51}.local-border{fill:none;stroke:#b7ab7770;stroke-width:1.3}
.local-building rect,.local-building circle{fill:#32483b;stroke:#b6a276;stroke-width:1.2}.local-building text{fill:#d9c398;font-family:'Cormorant Garamond',serif;font-size:11px;paint-order:stroke;stroke:#32483b;stroke-width:3}
.local-landmark circle{fill:#baa77c}.local-landmark text{fill:#baa988;font-family:'Cormorant Garamond',serif;font-size:13px;paint-order:stroke;stroke:#203b35;stroke-width:3}
.local-mark{fill:#d8ba7e;stroke:#263e36;stroke-width:1.5}.local-mark text{fill:#ebd6ac;stroke:#203b35;stroke-width:3;paint-order:stroke;font-family:Inter,sans-serif;font-size:10px}.local-mark.place{fill:#c3c79f}.local-mark.memory{fill:#bca5cd}
.local-mark .local-person-leader{fill:none;stroke:#c8b995;stroke-width:1;opacity:.8;pointer-events:none}
.local-exit path{fill:none;stroke:#a4d6b9;stroke-width:2.3}.local-exit.locked path{stroke:#d8ad87}.local-exit text{fill:#e4d0ae;font-family:'Cormorant Garamond',serif;font-size:14px;paint-order:stroke;stroke:#152f30;stroke-width:3}
.local-player{fill:#acedd1;stroke:#142f2e;stroke-width:2}.local-player .local-player-halo{fill:#93e3c229;stroke:#a4e9cb66;stroke-width:1}.local-player text{fill:#d0f6e4;stroke:#173531;stroke-width:3;paint-order:stroke;font-family:Inter,sans-serif;font-size:10px}
.world-map-key{display:flex;flex-wrap:wrap;gap:9px 15px;color:#b3c3ac;font-size:9px;line-height:1.5}.world-map-key span{display:inline-flex;gap:6px;align-items:center}.world-map-key i{display:inline-block;width:8px;height:8px;flex:0 0 auto;font-style:normal}.key-current{background:#a5e7ca;border-radius:50%;box-shadow:0 0 0 2px #a5e7ca25}.key-visited{background:#c6ae7e;border-radius:50%}.world-map-key .key-locked{color:#dfb18b;font-size:16px;line-height:7px}.key-path{background:#a7a0777a}.key-person{background:#d8ba7e;border-radius:50%}.key-place{background:#c3c79f}.world-map-key .key-door{border:1px solid #a4d6b9;border-bottom:0;width:9px;height:10px}
.local-map-note{font-size:10px;color:#98b2a6;line-height:1.7;margin:14px 0 0}.map-modal .map-destination:disabled{opacity:1;cursor:default}.map-modal .map-destination small{font-size:9px}.map-modal .map-destination:focus-visible{outline:2px solid #a5e7ca;outline-offset:3px}
@media(max-width:760px){.world-map-layout{grid-template-columns:1fr;gap:16px}.journey-section{order:2}.journey-map{max-height:470px}.local-map-section{order:1}.world-map-layout h3{font-size:27px}.local-map{max-height:460px}.journey-section,.local-map-section{padding:15px 12px}.map-modal .map-destination small{font-size:8px}}
@media(max-width:760px){.local-map-zoom-toggle{display:inline-block;width:15px;height:15px;margin:12px 7px 12px 0;vertical-align:middle;accent-color:#a5d3b8}.local-map-zoom-label{display:inline-block;padding:10px 0;vertical-align:middle;color:#dccaa5;font-size:11px;cursor:pointer}.local-map-zoom-toggle:focus-visible{outline:2px solid #a5e7ca;outline-offset:3px}.local-map-zoom-toggle:checked~.local-map-zoom-help{display:block;margin:0 0 9px;color:#b0c6b6;font-size:10px;line-height:1.5}.local-map-zoom-toggle:checked~.local-map-viewport{max-height:min(400px,55dvh);overflow:auto;overscroll-behavior:contain;scrollbar-color:#90ac92 #152f30;border:1px solid #c3ae7830;margin-bottom:12px}.local-map-zoom-toggle:checked~.local-map-viewport .local-map{width:560px;min-width:560px;max-height:none;margin:0}}
`;
