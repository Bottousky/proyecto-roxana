import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {AREAS} from '../src/content.js';
import {freshState} from '../src/state.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';
import {expectedPresent} from './helpers/expected-inhabitants.js';

const repaired={awaken:true,workshop:true,gate:true,pump:true,distribution:true,irrigation:true,beacon_link:true,beacon_supply:true,beacon_network:true,beacon_lens:true,finale_seen:true};

function incomingSpawns(id){
  const points=[{label:'default',point:AREAS[id].spawn}];
  for(const area of Object.values(AREAS))for(const exit of area.exits||[]){
    if(exit.target===id&&exit.spawn)points.push({label:exit.id,point:exit.spawn});
  }
  return points;
}

function clearSegment(world,a,b,radius=.34){
  const steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.1));
  for(let i=0;i<=steps;i++)if(!world.canStand(a[0]+(b[0]-a[0])*i/steps,a[1]+(b[1]-a[1])*i/steps,radius))return false;
  return true;
}

// Independent flood fill, so a navigation algorithm cannot certify its own
// disconnected starting point. Every edge is checked against the real World.
function reachableInteractions(world,start){
  const cell=.3,minX=-world.bounds[0]/2+.6,minZ=-world.bounds[1]/2+.6;
  const cols=Math.floor((-2*minX)/cell)+1,rows=Math.floor((-2*minZ)/cell)+1;
  const safe=new Uint8Array(cols*rows),visited=new Uint8Array(safe.length),queue=[];
  const point=i=>[minX+(i%cols)*cell,minZ+Math.floor(i/cols)*cell];
  for(let i=0;i<safe.length;i++)if(world.canStand(...point(i)))safe[i]=1;
  for(let i=0;i<safe.length;i++){
    const p=point(i);
    if(safe[i]&&Math.hypot(p[0]-start[0],p[1]-start[1])<cell*1.5&&clearSegment(world,start,p)){visited[i]=1;queue.push(i);}
  }
  const interactions=new Map();
  for(let at=0;at<queue.length;at++){
    const i=queue[at],p=point(i),x=i%cols,z=Math.floor(i/cols);
    world.player.position.set(p[0],world.groundHeight(...p),p[1]);
    const nearby=world.getNearby();if(nearby&&!interactions.has(nearby.id))interactions.set(nearby.id,p);
    for(const [xx,zz] of [[x-1,z],[x+1,z],[x,z-1],[x,z+1]]){
      if(xx<0||xx>=cols||zz<0||zz>=rows)continue;
      const next=zz*cols+xx;
      if(safe[next]&&!visited[next]&&clearSegment(world,p,point(next))){visited[next]=1;queue.push(next);}
    }
  }
  world.setPlayerPosition(start);
  return interactions;
}

for(const area of Object.values(AREAS)){
  test(`${area.id}: every interaction and exit is reachable from its arrival and return spawns`,()=>{
    const world=buildCollisionWorld(area.id,{flags:repaired});
    try{
      for(const spawn of incomingSpawns(area.id)){
        assert.equal(world.canStand(...spawn.point),true,`${spawn.label}: authored spawn ${spawn.point} is inside a solid`);
        world.setPlayerPosition(spawn.point);
        assert.deepEqual(world.getPlayerPosition(),spawn.point,`${spawn.label}: arrival should not silently relocate the player`);
        const reachable=reachableInteractions(world,spawn.point);
        for(const object of [...area.objects,...area.exits]){
          if(!expectedPresent(object,world.state.flags))continue;
          assert.ok(reachable.has(object.id),`${spawn.label}: ${object.id} (${object.x},${object.z}) has no reachable interaction position`);
          const goal=reachable.get(object.id);
          world.setPlayerPosition(spawn.point);world.setTarget(goal);
          const path=[world.target,...world.route].filter(Boolean);
          assert.ok(path.length,`${spawn.label}: clicking a reachable position for ${object.id} produced no route`);
          let from=spawn.point;
          for(const to of path){
            assert.ok(clearSegment(world,from,to),`${spawn.label}: route to ${object.id} crosses a solid between ${from} and ${to}`);
            from=to;
          }
          world.player.position.set(from[0],world.groundHeight(...from),from[1]);
          assert.equal(world.getNearby()?.id,object.id,`${spawn.label}: the click route does not reach ${object.id}'s interaction`);
        }
      }
    }finally{world.dispose();}
  });
  test(`${area.id}: initial world controls and nearby exits remain accessible before any repairs`,()=>{
    const world=buildCollisionWorld(area.id);
    try{
      const reachable=reachableInteractions(world,area.spawn);
      for(const object of [...area.objects,...area.exits]){
        if(!expectedPresent(object,world.state.flags)||object.id==='road_to_spring')continue;
        assert.ok(reachable.has(object.id),`${object.id} cannot be approached in the initial state`);
      }
    }finally{world.dispose();}
  });
}

test('visible building interiors stay solid even beside an interaction or exit',()=>{
  for(const area of Object.values(AREAS)){
    const world=buildCollisionWorld(area.id,{flags:repaired});
    try{
      for(const building of world.auditBuildings){
        for(const x of [-.42,0,.42])for(const z of [-.42,0,.42]){
          const p=building.group.localToWorld(new THREE.Vector3(x*building.width,.5,z*building.depth));
          assert.equal(world.obstacles.some(o=>Math.abs(p.x-o.x)<o.w&&Math.abs(p.z-o.z)<o.d),true,`${area.id}: missing building collision at (${p.x.toFixed(2)},${p.z.toFixed(2)})`);
        }
      }
    }finally{world.dispose();}
  }
});

test('fixed masonry and workshop furniture cannot be crossed on foot',()=>{
  const occupied={
    portal:[[-3.25,-5.7],[3.25,-5.7],[-9.2,-5],[9.2,5]],
    plaza:[[0,-2]],
    workshop:[[-8.16,-8.4],[8.16,-8.4],[-9.84,3],[-10.5,-3],[10.5,-3],[-10.56,9.12]],
    road:[[-12.92,-10.24],[12.92,-10.24]],
    spring:[[-3.6,-12.6],[-10,0]],
    castle:[[-9.3,-12.8],[9.3,-12.8]],
    terraces:[[-14.4,-7.18],[14.4,-7.18],[-14.4,-1.68],[14.4,-1.68],[-14.4,3.82],[14.4,3.82]],
    lighthouse:[[-12.7,-1.2],[12.7,-1.2],[-11.9,6],[11.9,-10]],
  };
  for(const [id,points] of Object.entries(occupied)){
    const world=buildCollisionWorld(id,{flags:repaired});
    try{for(const p of points)assert.equal(world.canStand(...p),false,`${id}: visible structure at (${p}) is walkable`);}
    finally{world.dispose();}
  }
});

test('freestanding interaction props are not embedded in unrelated scenery',()=>{
  for(const area of Object.values(AREAS)){
    const world=buildCollisionWorld(area.id,{flags:repaired});
    try{
      for(const object of area.objects){
        // The well's interaction is deliberately at the fountain's center.
        if(object.kind==='well')continue;
        const external=world.obstacles.find(o=>o.id!==object.id&&Math.abs(object.x-o.x)<o.w&&Math.abs(object.z-o.z)<o.d);
        assert.equal(external,undefined,`${area.id}: ${object.id} is embedded in scenery at (${external?.x},${external?.z})`);
      }
    }finally{world.dispose();}
  }
});

test('the road gate blocks the north exit until repaired, then admits the player',()=>{
  const world=buildCollisionWorld('road');
  try{
    const start=AREAS.road.spawn;
    assert.equal(reachableInteractions(world,start).has('road_to_spring'),false,'the closed gate must not have a side bypass');
    world.state.flags.gate=true;world.updateFlags(world.state);
    assert.equal(reachableInteractions(world,start).has('road_to_spring'),true,'repairing the gate must open a continuous route');
  }finally{world.dispose();}
});

test('old saves inside every house recover to safe ground without altering any progress',()=>{
  for(const area of Object.values(AREAS)){
    const inventory=buildCollisionWorld(area.id,{flags:repaired});
    const houses=inventory.auditBuildings.map(({x,z})=>[x,z]);inventory.dispose();
    for(const position of houses){
      const saved=freshState();saved.area=area.id;saved.position=position;
      saved.flags={...area.initialFlags,...repaired};saved.visited=Object.keys(AREAS);
      saved.puzzles={workshop:{completed:true,wires:[['supply','lamp']],sourceOn:true},pump:{completed:true,value:12}};
      saved.seen=['workshop_complete','cinematic:pump','beacon_lens_complete'];
      saved.secrets=['portal_seed','lighthouse_ohm_note'];saved.playtime=812.75;
      saved.activeDialogue={id:'beacon_lens_complete',index:2};saved.endingPending=true;
      const before=structuredClone(saved),world=buildCollisionWorld(area.id,{state:saved});
      try{
        assert.deepEqual(world.state,before,`${area.id}: recovery changed story, puzzle, or conversation progress`);
        assert.ok(world.canStand(...world.getPlayerPosition()),`${area.id}: recovered player is still inside a solid`);
        assert.notDeepEqual(world.getPlayerPosition(),position,`${area.id}: legacy position was left inside the house`);
        assert.ok(world.canStand(world.ohm.position.x,world.ohm.position.z,.42),`${area.id}: Ohm was placed inside a solid`);
      }finally{world.dispose();}
    }
  }
});

test('large World.move requests cannot tunnel through masonry or the closed road gate',()=>{
  const cases=[
    {id:'portal',start:[-3.25,-3],delta:[0,-5],axis:1,minimum:-5.7},
    {id:'road',start:[0,-7],delta:[0,-8],axis:1,minimum:-10.24},
    {id:'castle',start:[-7,-10],delta:[0,-5],axis:1,minimum:-12.8},
    {id:'lighthouse',start:[10,3],delta:[5,0],axis:0,maximum:12.7},
  ];
  for(const c of cases){
    const world=buildCollisionWorld(c.id);
    try{
      assert.ok(world.canStand(...c.start),`${c.id}: invalid movement fixture`);
      world.setPlayerPosition(c.start);world.move(...c.delta);
      const reached=world.getPlayerPosition();
      assert.ok(clearSegment(world,c.start,reached),`${c.id}: movement crossed a wall`);
      assert.ok(world.canStand(...reached),`${c.id}: movement ended in a wall`);
      if(c.minimum!==undefined)assert.ok(reached[c.axis]>c.minimum,`${c.id}: player crossed to the far side of the wall`);
      if(c.maximum!==undefined)assert.ok(reached[c.axis]<c.maximum,`${c.id}: player crossed to the far side of the wall`);
    }finally{world.dispose();}
  }
});

test('Ohm follows a long route in all nine areas without crossing solids or teleporting',()=>{
  for(const area of Object.values(AREAS)){
    const world=buildCollisionWorld(area.id,{flags:repaired});
    try{
      const reachable=reachableInteractions(world,area.spawn),origin=[world.ohm.position.x,world.ohm.position.z];
      const goals=[...reachable.values()].filter(p=>world.canStand(...p,.42));
      goals.sort((a,b)=>Math.hypot(b[0]-origin[0],b[1]-origin[1])-Math.hypot(a[0]-origin[0],a[1]-origin[1]));
      assert.ok(goals.length,`${area.id}: no distant reachable goal for Ohm`);
      const goal=goals[0];world.player.position.set(goal[0],world.groundHeight(...goal),goal[1]);
      let steps=0;
      while(Math.hypot(world.ohm.position.x-goal[0],world.ohm.position.z-goal[1])>1.5&&steps++<600){
        const before=[world.ohm.position.x,world.ohm.position.z];
        world.clock+=.05;world.updateCompanion(.05,true,false);
        const after=[world.ohm.position.x,world.ohm.position.z];
        assert.ok(clearSegment(world,before,after,.42),`${area.id}: Ohm crossed a solid from ${before} to ${after}`);
        assert.ok(Math.hypot(after[0]-before[0],after[1]-before[1])<=.375001,`${area.id}: Ohm teleported`);
      }
      assert.ok(Math.hypot(world.ohm.position.x-goal[0],world.ohm.position.z-goal[1])<=1.5,`${area.id}: Ohm failed to reach the player`);
    }finally{world.dispose();}
  }
});
