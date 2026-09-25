import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {World} from '../src/world.js';
import {worldFeedbackSignature} from '../src/world-feedback.js';

function worldFixture(){
  const world=Object.create(World.prototype),state={flags:{},settings:{quality:'high',reducedMotion:false}};
  Object.assign(world,{area:{id:'plaza',objects:[],exits:[]},bounds:[24,24],state,_quality:'high',_lastFlags:'{}',clock:0,inspect:false,finaleTimer:0,restoration:0,currentZoom:1,rand:()=>.5,obstacles:[],walkSurfaces:[],actors:[],animations:[],waterMaterials:[],levers:[],conductors:[],lamps:[],treeModels:[],route:[],sharedMaterials:new Set(),root:new THREE.Group(),geo:{plane:new THREE.PlaneGeometry(1,1)},m:{glass:new THREE.MeshStandardMaterial()},focus:new THREE.Vector3(),cameraOffset:new THREE.Vector3(0,13.5,25),camera:new THREE.OrthographicCamera(-16,16,12,-12,.1,150),renderer:{shadowMap:{}},composer:{render(){}},grade:{uniforms:{time:{value:0},restored:{value:0}}},atlasFrames:{}});
  for(const name of ['player','edda','marin'])world.atlasFrames[name]=Array.from({length:4},(_,row)=>Array.from({length:5},(_,col)=>({name:`${name}:${row}:${col}`})));
  world._lastFlags=worldFeedbackSignature(world.area,state);
  world.player=world.character('player',0,0);world.root.add(world.player);world.updateCompanion=()=>{};
  return world;
}

test('World click walking selects side poses without keyboard input and restores dedicated idle',()=>{
  const world=worldFixture(),actor=world.actors[0];world.setTarget([3,0]);
  world.update(.05,world.state,{x:0,z:0});assert.ok(world.player.position.x>0);assert.equal(actor.animation.direction,1);assert.ok(actor.animation.frame>0);
  for(let i=0;i<25;i++)world.update(.05,world.state,{x:0,z:0});
  assert.equal(actor.animation.frame,0);assert.equal(actor.animation.direction,1);assert.equal(actor.sprite.material.map,world.atlasFrames.player[1][0]);
});

test('World blocked input idles, while actual wall sliding determines facing',()=>{
  const world=worldFixture(),actor=world.actors[0];world.obstacles=[{x:1.5,z:0,w:.5,d:3}];
  for(let i=0;i<12;i++)world.update(.05,world.state,{x:1,z:0});
  assert.equal(actor.animation.frame,0);assert.equal(actor.animation.direction,1);assert.equal(world.walking,false);
  const x=world.player.position.x;world.update(.05,world.state,{x:1,z:1});
  assert.equal(world.player.position.x,x);assert.ok(world.player.position.z>0);assert.equal(actor.animation.direction,0);assert.ok(actor.animation.frame>0);
});

test('World human actors pause in neutral and ambient movement resumes without a clock jump',()=>{
  const world=worldFixture();world.character('edda',4,4);world.character('marin',-4,4,true);
  const player=world.actors[0],fixed=world.actors[1],ambient=world.actors[2];
  world.update(.05,world.state,{x:-1,z:0});const position=world.player.position.clone(),ambientPosition=ambient.g.position.clone(),ambientTime=ambient.ambientTime;
  for(let i=0;i<40;i++)world.update(.05,world.state,{x:1,z:0,paused:true});
  assert.ok(world.player.position.equals(position));assert.equal(player.animation.direction,3);assert.equal(player.animation.frame,0);
  assert.ok(ambient.g.position.equals(ambientPosition));assert.equal(ambient.ambientTime,ambientTime);assert.equal(ambient.animation.frame,0);assert.equal(fixed.animation.frame,0);
  world.update(.05,world.state,{x:0,z:0});assert.ok(ambient.g.position.distanceTo(ambientPosition)<.01);
  world.state.settings.reducedMotion=true;const reducedPosition=ambient.g.position.clone();world.update(.05,world.state,{x:0,z:-1});
  assert.ok(ambient.g.position.equals(reducedPosition));assert.equal(ambient.animation.frame,0);assert.equal(player.animation.direction,2);assert.equal(player.animation.frame,0);
  world.inspect=true;const inspectionPosition=world.player.position.clone();world.update(.05,world.state,{x:1,z:0});assert.ok(world.player.position.equals(inspectionPosition));assert.equal(player.animation.direction,2);
});

test('ambient villagers alternate visible short walks with neutral pauses inside their home radius',()=>{
  const world=worldFixture();world.character('edda',4,4);world.character('marin',-4,4,true);
  const fixed=world.actors[1],actor=world.actors[2],fixedPosition=fixed.g.position.clone(),walkFrames=new Set();let movingTicks=0,idleTicks=0;
  for(let i=0;i<400;i++){
    const before=actor.g.position.clone();world.update(.05,world.state,{});const travelled=actor.g.position.distanceTo(before);
    assert.ok(Math.hypot(actor.g.position.x-actor.origin.x,actor.g.position.z-actor.origin.z)<=.851);
    assert.ok(world.canStand(actor.g.position.x,actor.g.position.z));assert.ok(travelled<=.070001);
    if(travelled>.05){assert.ok(travelled/.05>=1.2);walkFrames.add(actor.animation.frame);movingTicks++;}
    if(travelled===0){assert.equal(actor.animation.frame,0);idleTicks++;}
  }
  assert.ok(movingTicks>60);assert.ok(idleTicks>150);assert.ok(walkFrames.size>=3);assert.ok(fixed.g.position.equals(fixedPosition));assert.equal(fixed.animation.frame,0);
});

test('ambient walking pauses mid-stride, resumes without jumping, and rejects obstructed routes',()=>{
  const world=worldFixture();world.character('marin',-4,4,true);const actor=world.actors[1];
  world.obstacles=[{x:-3.35,z:4,w:.1,d:.8}];
  for(let i=0;i<100&&!actor.animation.moving;i++)world.update(.05,world.state,{});
  assert.ok(actor.animation.moving);const before=actor.g.position.clone(),time=actor.ambientTime,target=[...actor.ambientTarget];
  for(let i=0;i<60;i++)world.update(.05,world.state,{paused:true});
  assert.ok(actor.g.position.equals(before));assert.equal(actor.ambientTime,time);assert.deepEqual(actor.ambientTarget,target);assert.equal(actor.animation.frame,0);
  world.update(.05,world.state,{});assert.ok(actor.g.position.distanceTo(before)<=.070001);
  for(let i=0;i<300;i++){world.update(.05,world.state,{});assert.ok(world.canStand(actor.g.position.x,actor.g.position.z));}
});
