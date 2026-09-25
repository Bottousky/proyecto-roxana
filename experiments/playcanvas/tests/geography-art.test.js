import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AREAS} from '../src/game/content.js';
import {KINGDOM,EXTERIORS,passagesFor,passageGeometry,fromKingdom,travelBounds,inKingdomWater} from '../src/game/kingdom-geography.js';
import {walkableTerrain} from '../src/terrain.js';
import {findPath} from '../src/game/navigation.js';
import {isPositionClear,isSegmentClear,moveWithCollisions} from '../src/game/collision.js';
import {readReceiverFeedback} from '../src/game/world-feedback.js';
import {initialPuzzleSnapshot} from '../src/game/puzzle-model.js';
const scene=JSON.parse(fs.readFileSync(new URL('../src/data/scene.json',import.meta.url)));

test('export, map and territory share the same broad west/east bends',()=>{
  const xs=EXTERIORS.map(id=>KINGDOM[id].x);assert.ok(Math.max(...xs)-Math.min(...xs)>=100);
  assert.ok(KINGDOM.castle.x<KINGDOM.spring.x-40);assert.ok(KINGDOM.lake.x>KINGDOM.terraces.x+40);
  for(const id of EXTERIORS)assert.deepEqual(scene.areas[id].offset,[KINGDOM[id].x,KINGDOM[id].z],id);
});

test('all fourteen diagonally widened passages are physically reachable on exported collisions',()=>{
  for(const id of EXTERIORS){const data=scene.areas[id],bounds=travelBounds(id),obstacles=data.obstacles.filter(o=>!o.gate).map(o=>({...o,x:o.x-data.offset[0],z:o.z-data.offset[1]})),options={radius:.34,isWalkable:(x,z)=>walkableTerrain(id,x,z)};
    for(const e of passagesFor(id)){const passage=passageGeometry(id,e.target),end=fromKingdom(id,passage.mid),path=findPath(AREAS[id].spawn,end,bounds,obstacles,options);assert.ok(path.length,`${id} → ${e.target}`);let start=AREAS[id].spawn;
      for(const point of path){assert.ok(isSegmentClear(start,point,bounds,obstacles,options));start=point;}
      assert.ok(Math.hypot(start[0]-end[0],start[1]-end[1])<.1,'path actually reaches the seam');
      for(const global of passage.points.slice(0,23)){const local=fromKingdom(id,global);assert.ok(isPositionClear(local,bounds,[],options),`${id}: full width at ${local}`);if(!passage.bridge)assert.equal(inKingdomWater(id,...local,1.8),false,`${id}: paving must not cross the canal`);}
    }
  }
});

test('hydraulic receivers do not rotate on residual current below their operating range',()=>{
  const state={flags:{spring_sluice:true,spring_coupling:true},puzzles:{}};
  const stalled=readReceiverFeedback('spring',state,'pump_panel');assert.ok(stalled.level>0);assert.equal(stalled.moving,false);
  state.flags.pump=true;assert.equal(readReceiverFeedback('spring',state,'pump_panel').moving,true);
  state.flags.spring_coupling=false;assert.equal(readReceiverFeedback('spring',state,'pump_panel').moving,false);
});

test('both woodland detours reconnect and remain walkable from either settlement',()=>{
  for(const [a,b] of [['portal','plaza'],['castle','terraces']])for(const [from,to] of [[a,b],[b,a]]){
    const p=passageGeometry(from,to),route=p.routes.find(r=>r.id==='woodland-loop'),reverse=passageGeometry(to,from).routes.find(r=>r.id===route.id);
    assert.deepEqual(route.points[0],p.a);assert.ok(Math.hypot(route.points.at(-1)[0]-p.b[0],route.points.at(-1)[1]-p.b[1])<1e-9);
    for(let i=0;i<route.points.length;i++)assert.ok(Math.hypot(route.points[i][0]-reverse.points[40-i][0],route.points[i][1]-reverse.points[40-i][1])<1e-8);
    const goal=fromKingdom(from,route.points[20]),options={isWalkable:(x,z)=>walkableTerrain(from,x,z),radius:.34},data=scene.areas[from],obstacles=data.obstacles.filter(o=>!o.gate).map(o=>({...o,x:o.x-data.offset[0],z:o.z-data.offset[1]}));
    assert.ok(findPath(AREAS[from].spawn,goal,travelBounds(from),obstacles,options).length,from);
    for(const point of route.points.slice(0,23))assert.ok(isPositionClear(fromKingdom(from,point),travelBounds(from),[],options),`${from} detour`);
  }
});

test('export preserves live receiver brightness and water-wheel handle identity',()=>{
  for(const object of ['pump_panel','irrigation_panel','beacon_supply_panel','beacon_network_panel','beacon_lens_panel'])assert.ok(scene.meshes.some(m=>m.material.receiver?.object===object),object);
  for(const flag of ['spring_sluice','irrigation_open'])assert.ok(scene.meshes.some(m=>m.dynamic?.flag===flag&&m.dynamic.kind==='lever'&&m.dynamic.axis==='z'),flag);
  const crowns=scene.meshes.filter(m=>m.dynamic?.receiver==='tower_motor');assert.ok(crowns.length);
  for(const crown of crowns)assert.deepEqual(crown.dynamic.spinAxis,[0,-1,0],'horizontal crowns turn around their vertical axle');
  const state={flags:{beacon_network:true,tower_lens_free:true},puzzles:{beacon_lens:initialPuzzleSnapshot('beacon_lens')}};
  state.puzzles.beacon_lens.sourceOn=false;assert.equal(readReceiverFeedback('lighthouse',state,'beacon_lens_panel').level,0);
});

test('the return from the Castle crosses the curved terrain join at different frame rates',()=>{
  const id='castle',data=scene.areas[id],bounds=travelBounds(id),obstacles=data.obstacles.filter(o=>!o.gate).map(o=>({...o,x:o.x-data.offset[0],z:o.z-data.offset[1]}));
  const options={radius:.34,isWalkable:(x,z)=>walkableTerrain(id,x,z)},seam=passageGeometry(id,'spring'),goal=fromKingdom(id,[seam.mid[0],seam.mid[1]+.7]);
  for(const dt of [1/60,1/30,1/20]){let pos=fromKingdom(id,passageGeometry(id,'terraces').mid),route=findPath(pos,goal,bounds,obstacles,options),target=route.shift();
    for(let frame=0;frame<3000&&target;frame++){const dx=target[0]-pos[0],dz=target[1]-pos[1],distance=Math.hypot(dx,dz);if(distance<.04){target=route.shift();continue;}const step=Math.min(7*dt,distance);pos=moveWithCollisions(pos,[dx/distance*step,dz/distance*step],bounds,obstacles,options);}
    assert.ok(Math.hypot(pos[0]-goal[0],pos[1]-goal[1])<.1,`${1/dt} fps: reached ${pos}`);
  }
});
