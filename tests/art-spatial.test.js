import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCollisionWorld} from './helpers/world-fixture.js';
import {ROAD_CANAL_X,inKingdomWater} from '../src/kingdom-geography.js';
import {AREA_LAYOUTS} from '../src/world-layout.js';

test('both gate foundations and wings stand on dry ground beside the real canal',()=>{
  const world=buildCollisionWorld('road',{continuous:true});
  try{
    const supports=world.obstacles.filter(o=>['bastion-foundation','road-wing-wall'].includes(o.id));
    assert.equal(supports.length,4);
    for(const o of supports)for(const x of [o.x-o.w,o.x,o.x+o.w])for(const z of [o.z-o.d,o.z,o.z+o.d])assert.equal(inKingdomWater('road',x,z),false,`${o.id} ${x},${z} must be dry`);
    const water=world.root.getObjectByName('road-continuous-canal');assert.equal(water.position.x,ROAD_CANAL_X);
    assert.equal(AREA_LAYOUTS.road.exclusions.find(o=>o.id==='east-river').x,ROAD_CANAL_X);
    const xs=AREA_LAYOUTS.road.waters[0].points.map(p=>p[0]);assert.equal((Math.min(...xs)+Math.max(...xs))/2,ROAD_CANAL_X);
    assert.equal(world.canStand(0,8.5),true);
  }finally{world.dispose();}
});

test('the orthographic eye keeps foreground castle architecture ahead of its near plane without changing framing',()=>{
  const world=buildCollisionWorld('terraces');
  try{
    world.cancelCinematic();
    const previous=world.camera.clone();previous.position.copy(world.focus).add(world.cameraOffset);previous.lookAt(world.focus);previous.updateMatrixWorld();
    // The neighboring castle's upper cornice and eastern turret in terrace coordinates.
    for(const point of [new THREE.Vector3(-16,8.1,37.2),new THREE.Vector3(-1.6,12,39.12)]){
      const depth=-point.clone().applyMatrix4(world.camera.matrixWorldInverse).z;
      assert.ok(depth>world.camera.near&&depth<world.camera.far,'foreground architecture must remain inside the camera depth range');
      const before=point.clone().project(previous),after=point.clone().project(world.camera);
      assert.ok(Math.hypot(before.x-after.x,before.y-after.y)<1e-9,'orthographic screen position must stay unchanged');
    }
  }finally{world.dispose();}
});
