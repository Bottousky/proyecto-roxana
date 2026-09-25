import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {World} from '../src/world.js';

function portal(){
  const world=Object.create(World.prototype);
  const pedestal={id:'ohm_pedestal',puzzle:'awaken',x:3.5,z:0};
  Object.assign(world,{area:{id:'portal',spawn:[0,9],objects:[pedestal],exits:[]},bounds:[28,24],state:{flags:{awaken:true},puzzles:{awaken:{sourceOn:true}}},obstacles:[],walkSurfaces:[],machines:[],clock:0,m:{}});
  // Keep the authored pedestal's collision registration while omitting its rendering.
  for(const method of ['group','box','cylinder','sphere','torus','automaton'])world[method]=()=>new THREE.Group();
  world.mat=()=>({});world.bespokeMachine(pedestal);
  world.player=new THREE.Group();world.ohm=new THREE.Group();
  return world;
}

test('the authored Ohm pedestal blocks walking while retaining a reachable interaction edge',()=>{
  const world=portal();assert.equal(world.obstacles.length,1);
  world.setPlayerPosition([0,0]);world.setTarget([3.5,0]);
  const destination=[world.target,...world.route].at(-1);
  assert.ok(world.canStand(...destination));assert.ok(Math.hypot(destination[0]-3.5,destination[1])<2.85);
  for(let i=0;i<100;i++)world.move(.08,0);
  assert.ok(world.canStand(...world.getPlayerPosition()));assert.ok(world.player.position.x<2);
});

test('a saved position inside the pedestal moves nearby without resetting progress',()=>{
  const world=portal(),progress=JSON.stringify(world.state);
  world.setPlayerPosition([3.5,0]);
  assert.ok(world.canStand(...world.getPlayerPosition()));assert.equal(world.getNearby()?.id,'ohm_pedestal');
  assert.ok(Math.hypot(world.player.position.x-3.5,world.player.position.z)<2);
  assert.ok(world.canStand(world.ohm.position.x,world.ohm.position.z,.42));assert.equal(JSON.stringify(world.state),progress);
});

test('Portal step heights lift player and companion, preserving other areas',()=>{
  const world=portal();
  world.walkSurfaces=[{x:0,z:-2,w:10,d:9,y:.09},...Array.from({length:3},(_,i)=>({x:0,z:-3,r:4.5-i*.3,y:.17+i*.09}))];
  world.setPlayerPosition([0,-3]);assert.equal(world.player.position.y,.35);assert.equal(world.ohm.position.y,.35);
  assert.equal(world.groundHeight(0,1.35),.17);assert.equal(world.groundHeight(0,1.1),.26);
  world.area.id='plaza';assert.equal(world.groundHeight(0,-3),0);
});

test('Ohm follows a clear route around the pedestal and stays still while paused',()=>{
  const world=portal();world.player.position.set(7,0,0);world.ohm.position.set(0,0,0);
  for(let i=0;i<600;i++){
    world.clock+=1/60;world.updateCompanion(1/60,true,false);
    assert.ok(world.canStand(world.ohm.position.x,world.ohm.position.z,.42),'companion entered the pedestal');
  }
  assert.ok(world.ohm.position.x>5);assert.ok(Math.hypot(world.ohm.position.x-7,world.ohm.position.z)<1.6);
  world.player.position.set(-5,0,0);const before=world.ohm.position.clone();
  for(let i=0;i<60;i++)world.updateCompanion(1/60,false,false);
  assert.ok(world.ohm.position.equals(before));
});
