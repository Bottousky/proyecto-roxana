import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {World} from '../src/world.js';
import {AREAS} from '../src/content.js';
import {CINEMATIC_DEFINITIONS,gameplayCameraPose} from '../src/cinematics.js';

function fixture(id='awaken',flags={[id]:true}){
  const world=Object.create(World.prototype),area=AREAS[CINEMATIC_DEFINITIONS[id].area],state={flags,settings:{quality:'high',reducedMotion:false}},puzzle=area.objects.find(o=>o.puzzle===id);
  Object.assign(world,{area,bounds:area.bounds,state,_quality:'high',_lastFlags:JSON.stringify(flags),clock:0,inspect:false,restoration:0,currentZoom:.93,rand:()=>.5,obstacles:[],walkSurfaces:[],actors:[],animations:[],waterMaterials:[],levers:[],conductors:[],lamps:[],treeModels:[],route:[],machines:[],fountainStreams:[],fountainWater:[],irrigationWater:[],sharedMaterials:new Set(),sharedGeometries:new Set(),localGeometries:[],textures:{glow:new THREE.Texture()},root:new THREE.Group(),scene:new THREE.Scene(),geo:{plane:new THREE.PlaneGeometry(1,1)},m:{glass:new THREE.MeshStandardMaterial()},focus:new THREE.Vector3(),cameraOffset:new THREE.Vector3(0,13.5,25),camera:new THREE.OrthographicCamera(-16,16,12,-12,.1,150),renderer:{shadowMap:{}},composer:{render(){}},grade:{uniforms:{time:{value:0},restored:{value:0}}},player:new THREE.Group(),ohm:new THREE.Group()});
  world.player.position.set(puzzle.x,world.groundHeight(puzzle.x,puzzle.z+2),puzzle.z+2);world.ohm.position.set(puzzle.x-1,0,puzzle.z+2.7);world.updateCompanion=()=>{};world.cancelCinematic();return world;
}

test('World cinematics block movement and continue while UI controls are paused',()=>{
  const world=fixture(),before=world.player.position.clone(),camera=world.cameraPose();world.target=[9,0];world.inspect=true;
  assert.equal(world.startCinematic('awaken'),true);assert.equal(world.target,null);assert.equal(world.inspect,false);assert.equal(world.startCinematic('awaken'),false);
  world.update(.5,world.state,{x:1,z:1,paused:true});assert.equal(world.cinematic.elapsed,.5);assert.ok(world.player.position.equals(before));assert.notDeepEqual(world.cameraPose(),camera);
  world.update(.1,world.state,{x:1,z:0,paused:false});assert.ok(world.player.position.equals(before));assert.equal(world.walking,false);
  const stationary=world.cameraPose(),elapsed=world.cinematic.elapsed;world.update(0,world.state,{paused:true});assert.equal(world.cinematic.elapsed,elapsed);assert.deepEqual(world.cameraPose(),stationary);
});

test('all World sequences finish only after reaching the straight gameplay camera',()=>{
  for(const id of Object.keys(CINEMATIC_DEFINITIONS)){
    const world=fixture(id);assert.equal(world.startCinematic(id),true);world.update(CINEMATIC_DEFINITIONS[id].returnAt+.1,world.state,{paused:true});assert.equal(world.getCinematicState().returning,true);
    world.update(2,world.state,{paused:true});assert.equal(world.getCinematicState(),null);assert.deepEqual(world.cameraPose(),gameplayCameraPose(world.area.id,world.player.position.toArray()));
    const x=world.player.position.x;world.update(.05,world.state,{x:1,z:0});assert.ok(world.player.position.x>x);assert.equal(world.cameraOffset.x,0);
  }
});

test('World skip interpolates from the current view and cancel is safe before loading',()=>{
  assert.doesNotThrow(()=>Object.create(World.prototype).cancelCinematic());
  const world=fixture('beacon_lens');assert.equal(world.skipCinematic(),false);world.startCinematic('beacon_lens');world.update(8,world.state,{paused:true});
  const current=world.cameraPose();assert.equal(world.skipCinematic(),true);assert.deepEqual(world.cameraPose(),current);assert.equal(world.getCinematicState().returning,true);assert.equal(world.skipCinematic(),false);
  world.update(.35,world.state,{paused:true});assert.ok(world.getCinematicState());world.update(.36,world.state,{paused:true});assert.equal(world.getCinematicState(),null);assert.deepEqual(world.cameraPose(),gameplayCameraPose(world.area.id,world.player.position.toArray()));
  world.startCinematic('beacon_lens');world.update(8,world.state,{paused:true});world.cancelCinematic();assert.equal(world.getCinematicState(),null);assert.deepEqual(world.cameraPose(),gameplayCameraPose(world.area.id,world.player.position.toArray()));
});

test('World refuses reduced motion and unrelated scenes without changing the current view',()=>{
  const world=fixture(),before=world.cameraPose();assert.equal(world.startCinematic('pump'),false);assert.equal(world.startCinematic('awaken',{reducedMotion:true}),false);world.state.settings.reducedMotion=true;assert.equal(world.startCinematic('awaken'),false);assert.deepEqual(world.cameraPose(),before);assert.equal(world.getCinematicState(),null);
});

test('awakening turns the actual Ohm toward the camera without moving him',()=>{
  const world=fixture('awaken');world.ohmFrames=Array.from({length:4},()=>Array.from({length:6},()=>new THREE.Texture()));
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:world.ohmFrames[2][3]}));world.ohm.add(sprite);world.ohm.userData.ohmSprite=sprite;world.ohm.userData.direction=2;
  const position=world.ohm.position.clone();assert.equal(world.startCinematic('awaken'),true);
  assert.equal(world.ohm.userData.direction,0);assert.equal(sprite.material.map,world.ohmFrames[0][0]);assert.ok(world.ohm.position.equals(position));
  world.update(6,world.state,{paused:true});assert.equal(world.getCinematicState(),null);assert.equal(world.ohm.userData.direction,0);assert.equal(sprite.material.map,world.ohmFrames[0][0]);assert.ok(world.ohm.position.equals(position));
  world.ohmFrames.flat().forEach(texture=>texture.dispose());sprite.material.dispose();
});

test('reloading a completed lighthouse never launches automatic narration',()=>{
  const world=fixture('beacon_lens',{beacon_lens:true,finale_seen:false});world.lastAssetResult={ok:true,missing:[]};
  for(const name of ['buildGround','buildLighthouse','buildNature','buildHorizon','buildObjects','buildWorldConductors','buildExitMarkers','buildAtmosphere','resize'])world[name]=()=>{};
  world.character=()=>new THREE.Group();world.automaton=()=>new THREE.Group();world.mat=color=>new THREE.MeshStandardMaterial({color});
  world.loadArea(AREAS.lighthouse,world.state,[0,12]);assert.equal(world.restored,true);assert.equal(world.getCinematicState(),null);assert.equal(world.cameraOffset.x,0);
  world.update(12,world.state,{});assert.equal(world.getCinematicState(),null);assert.equal(world.cameraOffset.x,0);
});

test('restored mechanisms have independent crown, brake and beam states',()=>{
  const world=fixture('beacon_network',{}),crown=new THREE.Group(),optic=new THREE.Group(),beam=new THREE.Group(),lightBody=new THREE.Mesh(new THREE.SphereGeometry(1),new THREE.MeshStandardMaterial()),halo=new THREE.Sprite(new THREE.SpriteMaterial({opacity:0})),material={opacity:0,uniforms:{strength:{value:0}}};
  world.animations=[{kind:'gear',obj:crown,speed:1,activationFlag:'beacon_network'},{kind:'optic',obj:optic},{kind:'beacon',obj:beam,material,beacon:lightBody,halo,baseScale:new THREE.Vector3(1,1,1),main:true}];
  world.update(.05,world.state,{});assert.equal(crown.rotation.z,0);assert.equal(optic.rotation.y,0);assert.equal(material.opacity,0);
  world.state.flags.beacon_network=true;world.update(.05,world.state,{});assert.ok(crown.rotation.z>0);assert.equal(world.areaEnergized,true);assert.equal(optic.rotation.y,0);assert.equal(material.opacity,0);
  world.state.flags.tower_lens_free=true;world.update(.05,world.state,{});assert.ok(optic.rotation.y>0);assert.equal(material.opacity,0);
  world.state.flags.beacon_lens=true;world.update(.05,world.state,{});assert.ok(material.opacity>0);assert.equal(world.getCinematicState(),null);
});
