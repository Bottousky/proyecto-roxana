import test from 'node:test';
import assert from 'node:assert/strict';
import {AREAS} from '../src/content.js';
import {AREA_LAYOUTS} from '../src/world-layout.js';
import {buildRegionalMap, renderLocalMap, renderWorldMap} from '../src/world-map.js';
import {KINGDOM} from '../src/kingdom-geography.js';

const state = (extra = {}) => ({area:'portal', visited:['portal'], flags:{}, secrets:[], ...extra});
const edgeStatus = (html,id) => html.match(new RegExp(`data-connection="${id}" data-passage="([^"]+)"`))?.[1];

test('regional connections come from exits once, without a road-through-workshop shortcut', () => {
  const graph = buildRegionalMap();
  const actual = [...new Set(Object.entries(AREAS).flatMap(([id,area]) => area.exits.map(exit => [id,exit.target].sort().join(':'))))].sort();
  assert.deepEqual(graph.edges.map(edge=>edge.id).sort(), actual);
  assert.equal(graph.edges.length, 8);
  assert.equal(graph.edges.find(edge=>edge.id==='plaza:workshop').passages.length,2);
  assert.ok(!graph.edges.some(edge=>[edge.from,edge.to].includes('workshop') && [edge.from,edge.to].includes('road')));
  const changed = {...AREAS, portal:{...AREAS.portal,exits:[]}};
  assert.deepEqual(buildRegionalMap(changed), {nodes:[{id:'portal',x:0,z:0}],edges:[]});
});

test('the regional map shares the real valley bends and the workshop building position', () => {
  const positions = new Map(buildRegionalMap().nodes.map(node=>[node.id,node]));
  const route = ['portal','plaza','road','spring','castle','terraces','lake','lighthouse'];
  route.slice(1).forEach((id,index) => {
    assert.equal(positions.get(id).x,KINGDOM[id].x);
    assert.equal(positions.get(id).z,KINGDOM[id].z);
    assert.ok(positions.get(id).z<positions.get(route[index]).z);
  });
  assert.ok(positions.get('workshop').x<positions.get('plaza').x);
  assert.equal(positions.get('workshop').z,KINGDOM.workshop.z);
});

test('travel controls preserve only valid visited destinations, with the current location disabled', () => {
  const html = renderWorldMap(state({area:'plaza',visited:['portal','plaza','plaza','unknown','constructor','__proto__','<img src=x>'],flags:{awaken:true}}));
  assert.deepEqual([...html.matchAll(/data-area="([^"]+)"/g)].map(match=>match[1]), ['portal','plaza']);
  assert.match(html,/data-area="plaza" disabled aria-current="location"/);
  assert.doesNotMatch(html,/<img src=x>/);
  assert.doesNotMatch(html,/data-area="workshop"/);
});

test('unvisited names and secrets stay hidden while the known objective may be named', () => {
  const first = renderWorldMap(state());
  assert.doesNotMatch(first,/El Faro|Nereo|Una placa entre las raíces|data-map-object="portal_seed"/);
  assert.doesNotMatch(first,/data-map-exclusion="portal_seed"/);
  assert.doesNotMatch(first,/data-map-area="workshop"[^]*?<title>El taller/);
  const objective = renderWorldMap(state({flags:{awaken:true}}),{objectiveArea:'workshop'});
  assert.match(objective,/<title>El taller de Lumen<\/title>/);
  assert.doesNotMatch(objective,/data-area="workshop"/);
  const found = renderLocalMap(AREAS.portal,AREA_LAYOUTS.portal,[0,8],state({secrets:['portal_seed']}));
  assert.match(found,/data-map-object="portal_seed"/);
  assert.match(found,/<title>Recuerdo encontrado<\/title>/);
});

test('a free return door never makes the outward locked passage look open', () => {
  assert.equal(edgeStatus(renderWorldMap(state()),'plaza:portal'),'locked');
  assert.equal(edgeStatus(renderWorldMap(state({flags:{awaken:true}})),'plaza:portal'),'open');
  const plaza = state({area:'plaza',visited:['portal','plaza'],flags:{awaken:true}});
  assert.equal(edgeStatus(renderWorldMap(plaza),'plaza:road'),'locked');
  assert.equal(edgeStatus(renderWorldMap(plaza),'plaza:workshop'),'open');
  assert.equal(edgeStatus(renderWorldMap(plaza),'castle:spring'),'unknown');
  const returning = state({area:'road',visited:['portal','plaza','road'],flags:{}});
  assert.equal(edgeStatus(renderWorldMap(returning),'plaza:road'),'open');
});

test('local maps use shared paths and full building dimensions with north above south', () => {
  const area = {id:'fixture',name:'Un patio',bounds:[20,20],spawn:[0,0],objects:[],exits:[]};
  const layout = {bounds:[20,20],paths:[{id:'lane',points:[[0,5],[0,-5]],width:2}],courts:[{id:'court',x:0,z:0,r:2}],buildings:[{id:'house',label:'Casa',x:5,z:0,w:4,d:6,approach:[5,4]}],exclusions:[],landmarks:[]};
  const svg = renderLocalMap(area,layout,[2,-3],state());
  assert.match(svg,/data-map-path="lane" points="280,359 280,149" stroke-width="42"/);
  assert.match(svg,/data-map-building="house"[^]*?<rect x="343" y="191" width="84" height="126"/);
  assert.match(svg,/data-world-x="2" data-world-z="-3" transform="translate\(322 191\)"/);
  assert.doesNotMatch(svg,/data-map-exit=/,'a decorative approach is not a usable doorway');
  assert.match(svg,/clip-path="url\(#local-fixture-bounds\)"/);
});

test('local access markers match only real exits and their live requirements', () => {
  for (const area of Object.values(AREAS)) {
    const svg = renderLocalMap(area,AREA_LAYOUTS[area.id],area.spawn,state({area:area.id}));
    assert.deepEqual([...svg.matchAll(/data-map-exit="([^"]+)"/g)].map(match=>match[1]),area.exits.map(exit=>exit.id));
    for (const exit of area.exits) assert.match(svg,new RegExp(`data-map-exit="${exit.id}" data-passage="${exit.requires.length?'locked':'open'}"`));
  }
  const portal = renderLocalMap('portal',undefined,undefined,state({flags:{awaken:true}}));
  assert.match(portal,/data-map-exit="portal_to_plaza" data-passage="open"/);
});

test('maps do not expose lever instructions or invent landmarks beyond the playable bounds', () => {
  const area = AREAS.lighthouse;
  const svg = renderLocalMap(area,{...AREA_LAYOUTS.lighthouse,landmarks:[{id:'distant',label:'Torre lejana',x:0,z:-90},{id:'island',label:'Torre al otro lado del agua',x:15,z:-16,distant:true}]},[0,15],state({area:'lighthouse'}));
  assert.doesNotMatch(svg,/Aislar el puente|Liberar el freno|data-map-landmark="distant"/);
  assert.doesNotMatch(svg,/data-map-landmark="island"/);
  assert.match(svg,/data-map-object="beacon_supply_panel"/);
  assert.match(svg,/data-map-object="nereo_tower"/);
});

test('local water follows shared world coordinates while wooden crossings remain above it', () => {
  const area = {id:'shore',name:'La orilla',bounds:[20,20],spawn:[0,0],objects:[],exits:[]};
  const layout = {waters:[{id:'lake',label:'Agua',points:[[5,-10],[10,-10],[10,10],[5,10]]}],walkSurfaces:[{id:'dock',x:5,z:0,w:4,d:2,surface:'wood'}],paths:[],courts:[],buildings:[],exclusions:[],landmarks:[]};
  const svg = renderLocalMap(area,layout,[0,0],state());
  assert.match(svg,/points="385,44 490,44 490,464 385,464" class="local-water"/);
  assert.match(svg,/<rect x="343" y="233" width="84" height="42" class="local-surface wood" data-map-surface="dock"/);
  assert.ok(svg.indexOf('data-map-water="lake"')<svg.indexOf('data-map-surface="dock"'));
});

test('the real lake map draws its coastline and dock, without marking the distant tower as a destination', () => {
  const svg = renderLocalMap(AREAS.lake,AREA_LAYOUTS.lake,[4,5],state({area:'lake'}));
  assert.match(svg,/data-map-water="lake-water"/);
  assert.match(svg,/class="local-surface wood" data-map-surface="wooden-dock"/);
  assert.ok(svg.indexOf('data-map-water="lake-water"')<svg.indexOf('data-map-surface="wooden-dock"'));
  assert.doesNotMatch(svg,/data-map-landmark="distant-lighthouse"/);
  assert.match(svg,/data-map-exit="lake_to_lighthouse"/);
});

test('building labels near every map boundary face inward without moving their real footprints', () => {
  const area = {id:'edges',name:'El borde',bounds:[20,20],spawn:[0,0],objects:[],exits:[]};
  const layout = {buildings:[
    {id:'west',label:'Casa junto al oeste',x:-9,z:0,w:4,d:4},
    {id:'east',label:'Casa junto al este',x:9,z:0,w:4,d:4},
    {id:'north',label:'Casa del norte',x:0,z:-10,w:4,d:4},
    {id:'south',label:'Casa del sur',x:0,z:10,w:4,d:4},
  ]};
  const svg = renderLocalMap(area,layout,[0,0],state());
  assert.match(svg,/data-map-building="west"[^]*?<rect x="49" y="212" width="84" height="84"\s*\/><text x="78" y="257" text-anchor="start">Casa junto al oeste/);
  assert.match(svg,/data-map-building="east"[^]*?<rect x="427" y="212" width="84" height="84"\s*\/><text x="482" y="257" text-anchor="end">Casa junto al este/);
  assert.match(svg,/<text x="280" y="58" text-anchor="middle">Casa del norte/);
  assert.match(svg,/<text x="280" y="456" text-anchor="middle">Casa del sur/);
  assert.match(svg,/clip-path="url\(#local-edges-bounds\)"/);
});

test('the enlarged workshop label stays aligned and the removed lighthouse house leaves no phantom destination', () => {
  const area=AREAS.plaza,svg=renderLocalMap(area,AREA_LAYOUTS.plaza,area.spawn,state({area:'plaza'}));
  const label=svg.match(/data-map-building="plaza-workshop"[^]*?<text x="([^"]+)" y="[^"]+" text-anchor="([^"]+)"/);
  const scale=Math.min(472/area.bounds[0],420/area.bounds[1]);
  const workshop=AREA_LAYOUTS.plaza.buildings.find(item=>item.id==='plaza-workshop');
  assert.equal(label?.[2],'middle');
  assert.equal(Number(label[1]),Number((280+workshop.x*scale).toFixed(3)));
  const lighthouse=renderLocalMap(AREAS.lighthouse,AREA_LAYOUTS.lighthouse,AREAS.lighthouse.spawn,state({area:'lighthouse'}));
  assert.doesNotMatch(lighthouse,/lighthouse-keeper|Casa del farero|keeper-house-walk/);
  assert.equal(AREA_LAYOUTS.lighthouse.paths.some(path=>path.id==='keeper-house-walk'),false);
  assert.match(lighthouse,/data-map-exit="lighthouse_to_lake"/,'The real return exit remains present');
});

test('mobile map enlargement controls the same readable map without duplicating exits or player position', () => {
  const returnPosition=AREAS.workshop.exits.find(exit=>exit.target==='plaza').spawn;
  const html=renderWorldMap(state({area:'plaza',visited:['portal','plaza']}),{position:returnPosition});
  assert.match(html,/<input type="checkbox" class="local-map-zoom-toggle" id="local-map-zoom-plaza" aria-controls="local-map-view-plaza">/);
  assert.match(html,/<label class="local-map-zoom-label" for="local-map-zoom-plaza">Ampliar mapa<\/label>/);
  assert.match(html,/id="local-map-view-plaza" tabindex="0" role="region"/);
  assert.equal([...html.matchAll(/data-map-player="true"/g)].length,1);
  assert.equal([...html.matchAll(/data-map-exit="plaza_to_workshop"/g)].length,1);
  assert.match(html,new RegExp(`data-world-x="${returnPosition[0]}" data-world-z="${returnPosition[1]}"`));
  assert.deepEqual([...html.matchAll(/data-area="([^"]+)"/g)].map(match=>match[1]),['portal','plaza']);
});
