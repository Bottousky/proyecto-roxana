import test from 'node:test';
import assert from 'node:assert/strict';
import {AREAS} from '../src/content.js';
import {ContinuousWorld} from '../src/continuous-world.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';

test('initial preparation uploads the finite act once and crossings retain every cached region',async()=>{
  const engine=buildCollisionWorld('plaza');engine.clearArea();
  let uploads=0,compiles=0,target=null;
  Object.assign(engine.renderer,{getRenderTarget:()=>target,setRenderTarget:value=>{target=value;},compileAsync:async()=>{compiles++;},render:()=>{uploads++;}});
  const manager=Object.assign(Object.create(ContinuousWorld.prototype),{engine,active:engine,regions:new Map(),landscape:null,generation:0,ensureLandscape(){}});
  try{
    manager.loadArea(AREAS.plaza,engine.state);const initial=manager.active,position=initial.getPlayerPosition(),camera=engine.camera.clone();
    await manager.prepareJourney();
    assert.equal(manager.regions.size,Object.keys(AREAS).length);
    assert.equal(uploads,Object.keys(AREAS).length);assert.equal(compiles,uploads);
    assert.equal(manager.active,initial);assert.deepEqual(initial.getPlayerPosition(),position);
    assert.deepEqual(engine.camera.position.toArray(),camera.position.toArray());assert.equal(target,null);
    const cached=[...manager.regions];
    await manager.prepareJourney();assert.equal(uploads,cached.length,'repeat preparation must do no GPU work');
    manager.active=manager.regions.get('road');manager.scheduleNeighbours();
    assert.deepEqual([...manager.regions],cached,'crossing must not discard cached sectors');
    assert.equal(manager.journeyPrepared,true);assert.equal(manager.preparingJourney,false);
  }finally{clearTimeout(manager.preloadTimer);for(const w of manager.regions.values())w.clearArea();engine.dispose();}
});

test('failed GPU preparation restores the active scene and can be retried',async()=>{
  const engine=buildCollisionWorld('plaza');engine.clearArea();let target=null;
  Object.assign(engine.renderer,{getRenderTarget:()=>target,setRenderTarget:value=>{target=value;},compileAsync:async()=>{throw new Error('GPU unavailable');},render(){}});
  const manager=Object.assign(Object.create(ContinuousWorld.prototype),{engine,active:engine,regions:new Map(),landscape:null,generation:0,ensureLandscape(){}});
  try{
    manager.loadArea(AREAS.plaza,engine.state);const active=manager.active;
    await assert.rejects(manager.prepareJourney(),/GPU unavailable/);
    assert.equal(manager.active,active);assert.equal(manager.preparingJourney,false);assert.equal(manager.journeyPrepared,undefined);assert.equal(target,null);
    engine.renderer.compileAsync=async()=>{};await manager.prepareJourney();assert.equal(manager.journeyPrepared,true);
  }finally{clearTimeout(manager.preloadTimer);for(const w of manager.regions.values())w.clearArea();engine.dispose();}
});
