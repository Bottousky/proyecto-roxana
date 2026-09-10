import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AREAS,PUZZLE_STORY,WORLD_SYSTEMS} from './src/game/content.js';
import {walkableTerrain} from './src/terrain.js';
import {travelBounds,passageGeometry,fromKingdom} from './src/game/kingdom-geography.js';
import {approachInteraction,inInteractionReach} from './src/game/world-interaction.js';
import {isPositionClear,isSegmentClear,moveWithCollisions} from './src/game/collision.js';
import {freshState,validateState,SAVE_KEY} from './src/game/state.js';
import {advanceJourneyTime} from './src/game/story-time.js';
const data=JSON.parse(fs.readFileSync(new URL('./src/data/scene.json',import.meta.url)));
const commissioned=Object.fromEntries([...Object.keys(PUZZLE_STORY),...WORLD_SYSTEMS.flatMap(s=>[s.flag,...(s.requires||[])])].map(f=>[f,true]));
function world(id,flags={}){const a=data.areas[id],pos=AREAS[id].spawn;return {area:AREAS[id],bounds:travelBounds(id),obstacles:a.obstacles.filter(o=>!o.gate||!flags.gate).map(o=>({...o,x:o.x-a.offset[0],z:o.z-a.offset[1]})),getPlayerPosition:()=>pos,walkableLand:(x,z)=>walkableTerrain(id,x,z),canStand(x,z){return isPositionClear([x,z],this.bounds,this.obstacles,{isWalkable:this.walkableLand});}};}
test('All nine places, nine circuits and authored dynamic systems are exported',()=>{
 assert.equal(Object.keys(data.areas).length,9);assert.equal(Object.keys(PUZZLE_STORY).length,9);
 for(const kind of ['gate','lever','wheel','optic','visible','indicator'])assert.ok(data.meshes.some(m=>m.dynamic?.kind===kind),kind);
 for(const id of Object.keys(AREAS))assert.ok(data.meshes.some(m=>m.area===id),id);
});
test('Every fixed interaction is reachable around the exported geometry',()=>{
 for(const [id,area] of Object.entries(AREAS)){
  const w=world(id,commissioned);
  for(const object of area.objects.filter(o=>!o.character&&!o.hidden)){
   const route=approachInteraction(w,object);assert.notEqual(route,null,`${id}/${object.id}`);
   const end=route.at(-1)||w.getPlayerPosition();assert.ok(inInteractionReach(w,object,end),`${id}/${object.id} contact`);
   let p=w.getPlayerPosition();for(const q of route){assert.ok(isSegmentClear(p,q,w.bounds,w.obstacles,{isWalkable:w.walkableLand}),`${id}/${object.id} path`);p=q;}
  }
 }
});
test('Exterior passages agree in world coordinates and have traversable midpoints',()=>{
 for(const [id,area] of Object.entries(AREAS))for(const exit of area.exits){const p=passageGeometry(id,exit.target);if(!p)continue;const back=passageGeometry(exit.target,id);assert.deepEqual(p.mid,back.mid);for(const side of [id,exit.target]){const q=fromKingdom(side,p.mid);assert.ok(walkableTerrain(side,...q),`${side} corridor`);}}
});
test('Gate collision responds to commissioning; fast movement cannot tunnel through masonry',()=>{
 const closed=world('road'),open=world('road',{gate:true});assert.equal(closed.obstacles.length,open.obstacles.length+1);
 const w=world('plaza');const hit=moveWithCollisions([-13.25,9],[0,-15],w.bounds,w.obstacles,{isWalkable:w.walkableLand});assert.ok(hit[1]>7,'workshop facade blocks a high-speed step');
 assert.equal(walkableTerrain('spring',-11,0),false);assert.equal(walkableTerrain('lake',18,0),false);
});
test('Save and narrative time survive a round trip and completed-game reload',()=>{
 assert.equal(SAVE_KEY,'ohmdal.playcanvas.arc1.v1');const state=freshState();state.flags=commissioned;state.area='lighthouse';advanceJourneyTime(state);assert.equal(state.journeyTime.phase,4);state.area='plaza';advanceJourneyTime(state);assert.equal(state.journeyTime.phase,4);const resumed=validateState(JSON.parse(JSON.stringify(state)));assert.equal(resumed.flags.beacon_lens,true);assert.equal(resumed.journeyTime.phase,4);
});
