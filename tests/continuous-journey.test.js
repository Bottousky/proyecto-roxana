import test from 'node:test';import assert from 'node:assert/strict';
import {AREAS} from '../src/content.js';import {EXTERIORS,passagesFor,passageGeometry,corridorX,fromKingdom,toKingdom,inTravelCorridor} from '../src/kingdom-geography.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';import {findPath} from '../src/navigation.js';import {ContinuousWorld} from '../src/continuous-world.js';
const flags={awaken:true,workshop:true,gate:true,pump:true,distribution:true,irrigation:true,beacon_link:true,beacon_lens:true};
test('automatic walking respects story gates before crossing an exterior seam',()=>{
  const w=buildCollisionWorld('portal',{continuous:true});const manager=Object.assign(Object.create(ContinuousWorld.prototype),{active:w});
  try{
    const exit=AREAS.portal.exits.find(e=>e.target==='plaza');w.setPlayerPosition([exit.x,exit.z-.15]);w.walking=true;
    assert.equal(manager.getTravelEvent().locked.id,exit.id);assert.ok(w.getPlayerPosition()[1]>exit.z);
    w.state.flags.awaken=true;const p=passageGeometry('portal','plaza');w.setPlayerPosition(fromKingdom('portal',[p.mid[0],p.mid[1]-.15]));w.walking=true;assert.equal(manager.getTravelEvent().target,'plaza');
  }finally{w.dispose();}
});
test('every exterior joins the identical curved corridor in both directions',()=>{
  for(const id of EXTERIORS)for(const e of passagesFor(id)){
    const p=passageGeometry(id,e.target),reverse=passageGeometry(e.target,id);assert.deepEqual(p.mid,reverse.mid);assert.deepEqual(p.a,reverse.b);
    for(let i=0;i<=20;i++){const z=p.a[1]+(p.b[1]-p.a[1])*i/20,x=corridorX(p,z);assert.ok(Math.abs(x-corridorX(reverse,z))<1e-8);const local=fromKingdom(id,[x,z]);assert.ok(inTravelCorridor(id,...local));}
  }
});
test('the real collisions allow walking from every room through each shared seam',()=>{
  for(const id of EXTERIORS){const w=buildCollisionWorld(id,{flags,continuous:true});try{
    for(const e of passagesFor(id)){const p=passageGeometry(id,e.target),goal=fromKingdom(id,p.mid);assert.ok(w.canStand(...goal),`${id}: seam must be safe`);const path=findPath(AREAS[id].spawn,goal,w.bounds,w.obstacles,{radius:.34,isWalkable:(x,z)=>w.walkableLand(x,z)});assert.ok(path.length,`${id} → ${e.target}: reachable on actual geometry`);}
    const crossWalls=[];w.root.traverse(o=>{if(o.name==='playable-garden-wall'&&o.scale.x>o.scale.z&&Math.abs(o.position.z)>AREAS[id].bounds[1]/2-1)crossWalls.push(o);});
    if(passagesFor(id).length===2)assert.equal(crossWalls.length,0,`${id}: no transverse room perimeter`);
  }finally{w.dispose();}}
});
test('promotion keeps camera, world coordinates and the companion together, without rebuilding the neighbour',()=>{
  const engine=buildCollisionWorld('plaza',{flags});engine.clearArea();const manager=Object.assign(Object.create(ContinuousWorld.prototype),{engine,active:engine,regions:new Map(),landscape:null,scheduleNeighbours(){},ensureLandscape(){}});
  try{
    const state={...engine.state,area:'plaza'};manager.loadArea(AREAS.plaza,state);const cached=manager.createRegion('road',state);
    const p=passageGeometry('plaza','road'),pos=fromKingdom('plaza',[p.mid[0],p.mid[1]-.1]);manager.active.setPlayerPosition(pos);manager.active.cancelCinematic();
    const before=toKingdom('plaza',manager.active.getPlayerPosition()),focus=toKingdom('plaza',[manager.active.focus.x,manager.active.focus.z]);
    const companion=toKingdom('plaza',[manager.active.ohm.position.x,manager.active.ohm.position.z]);state.area='road';manager.loadArea(AREAS.road,state,null,{continuous:true});
    assert.equal(manager.active,cached);assert.deepEqual(toKingdom('road',manager.active.getPlayerPosition()),before);assert.deepEqual(toKingdom('road',[manager.active.focus.x,manager.active.focus.z]),focus);assert.deepEqual(toKingdom('road',[manager.active.ohm.position.x,manager.active.ohm.position.z]),companion);
    assert.ok(manager.active.canStand(...manager.active.getPlayerPosition()));
  }finally{for(const w of manager.regions.values())w.clearArea();engine.dispose();}
});
