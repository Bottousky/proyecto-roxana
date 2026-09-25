import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildFountain,buildCuriosity} from '../src/landmarks.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';

function forVertices(group,visit){
  group.updateMatrixWorld(true);
  group.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const positions=mesh.geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      const point=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);
      visit(group.worldToLocal(point),mesh);
    }
  });
}

test('both public fountain sizes retain their circular footprint and a low recognizable basin',()=>{
  const world=buildCollisionWorld('portal');
  try{
    for(const radius of [1.5,1.8]){
      const before=world.obstacles.length,group=buildFountain(world,4,-3,radius);
      const bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3());
      assert.equal(world.obstacles.length,before,'visual builder must leave collision registration to World');
      assert.deepEqual(group.userData.landmark.footprint,{x:4,z:-3,w:2*(radius+.3),d:2*(radius+.3)});
      assert.ok(size.x>size.y*1.8,'a fountain should read as a broad basin, not a tall post');
      assert.ok(size.y<1.9,'the upper bowl and short spouts must not form a central pole');
      assert.ok(group.getObjectByName('fountain-basin'));
      assert.ok(group.getObjectByName('upper-fountain-bowl'));
      forVertices(group,point=>assert.ok(Math.hypot(point.x,point.z)<=radius+.30001,'fountain geometry leaves its authored circular base'));
    }
  }finally{world.dispose();}
});

test('fountain water is circular and remains contained inside both basins',()=>{
  const world=buildCollisionWorld('portal');
  try{
    const group=buildFountain(world,0,0,1.8),lower=group.getObjectByName('basin-water'),upper=group.getObjectByName('upper-bowl-water');
    for(const [surface,limit] of [[lower,1.5],[upper,.555]]){
      assert.equal(surface.geometry.type,'CircleGeometry');
      assert.ok(surface.geometry.parameters.radius<limit,'water must end before the inside wall');
      surface.updateMatrixWorld(true);
      forVertices(surface,point=>assert.ok(Math.hypot(point.x,point.y)<limit,'water vertices cannot escape on square corners'));
    }
  }finally{world.dispose();}
});

test('dry fountains preserve their masonry and the pump alone reveals water and streams',()=>{
  const world=buildCollisionWorld('portal');
  try{
    const group=buildFountain(world,0,0,1.8),water=world.fountainWater.filter(mesh=>mesh.parent===group),streams=world.fountainStreams.filter(mesh=>mesh.parent===group);
    assert.equal(water.length,2);assert.equal(streams.length,4);
    assert.ok([...water,...streams].every(mesh=>!mesh.visible));
    assert.equal(group.getObjectByName('fountain-basin').visible,true);
    world.state.flags.pump=true;world.updateFlags(world.state);
    assert.ok([...water,...streams].every(mesh=>mesh.visible));
    world.state.flags.pump=false;world.updateFlags(world.state);
    assert.ok([...water,...streams].every(mesh=>!mesh.visible));
    assert.equal(group.getObjectByName('upper-fountain-bowl').visible,true);
  }finally{world.dispose();}
});

test('the Plaza teacher and bell have distinct visible silhouettes without changing their footings',()=>{
  const world=buildCollisionWorld('portal');
  try{
    const before=world.obstacles.length;
    const teacher=buildCuriosity(world,{id:'statue',x:-9,z:-6}),bell=buildCuriosity(world,{id:'plaza_bell',x:11,z:-7});
    assert.ok(teacher.getObjectByName('teacher-head'));assert.ok(teacher.getObjectByName('teacher-open-book'));
    assert.equal(bell.getObjectByName('bell-shell').geometry.type,'LatheGeometry');assert.ok(bell.getObjectByName('bell-clapper'));
    for(const group of [teacher,bell]){
      const bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3());
      assert.ok(size.y>2.4,'landmark must have a silhouette above its plinth');
      assert.equal(group.userData.landmark.footprint.w,1.25);assert.equal(group.userData.landmark.footprint.d,.95);
      forVertices(group,point=>{
        if(point.y>.35)return; // Roofs, book and arms may overhang above foot height.
        assert.ok(Math.abs(point.x)<=.62501&&Math.abs(point.z)<=.47501,'footing extends beyond its existing collision footprint');
      });
    }
    assert.equal(world.obstacles.length,before);
    assert.equal(buildCuriosity(world,{id:'workshop_note',x:0,z:0}),null,'unrelated props retain their existing builder');
  }finally{world.dispose();}
});

test('lighthouse window pipes remain on their tower instead of appearing beside the Plaza fountain',()=>{
  for(const id of ['plaza','lake','lighthouse']){
    const world=buildCollisionWorld(id);
    try{
      const pipes=[];world.root.traverse(mesh=>{if(mesh.name==='lighthouse-window-pipe')pipes.push(mesh);});
      assert.equal(pipes.length,2,`${id}: both tower window pipes must be accounted for`);
      for(const pipe of pipes){
        assert.notEqual(pipe.parent,world.root,`${id}: a tower-local pipe was attached to the world origin`);
        const tower=pipe.parent.getWorldPosition(new THREE.Vector3());
        const bounds=new THREE.Box3().setFromObject(pipe),center=bounds.getCenter(new THREE.Vector3());
        assert.ok(Math.hypot(tower.x,tower.z)>10,`${id}: the pipe has no distant tower parent`);
        assert.ok(Math.hypot(center.x-tower.x,center.z-tower.z)<4,`${id}: pipe geometry escaped the tower transform`);
        assert.equal(world.canStand(center.x,center.z),false,`${id}: a distant tower pipe protrudes into the player's walking area at (${center.x},${center.z})`);
      }
    }finally{world.dispose();}
  }
});

test('the main lighthouse retaining base replaces the perimeter continuously without intersecting its wall or cap',()=>{
  const world=buildCollisionWorld('lighthouse');
  try{
    const mesh=world.root.getObjectByName('lighthouse-retaining-base');
    const cap=world.root.getObjectByName('lighthouse-base-cap');
    const base=new THREE.Box3().setFromObject(mesh),lid=new THREE.Box3().setFromObject(cap);
    const center=base.getCenter(new THREE.Vector3()),size=base.getSize(new THREE.Vector3());
    assert.ok(Math.abs(center.x)<1e-6&&Math.abs(center.z+24.38)<1e-6);
    assert.ok(Math.abs(size.x-11)<1e-6&&Math.abs(size.z-8)<1e-6);
    assert.ok(Math.abs(lid.min.y-base.max.y)<1e-6,'The masonry and its cap must meet without a floating ledge');
    assert.ok(Math.abs(lid.min.x-base.min.x)<1e-6&&Math.abs(lid.max.x-base.max.x)<1e-6&&Math.abs(lid.min.z-base.min.z)<1e-6&&Math.abs(lid.max.z-base.max.z)<1e-6);
    const footprint=mesh.parent.userData.boundaryFootprints.find(shape=>Math.abs(shape.x-center.x)<1e-6&&Math.abs(shape.z-center.z)<1e-6);
    assert.ok(footprint&&Math.abs(footprint.w-size.x)<1e-6&&Math.abs(footprint.d-size.z)<1e-6,'Boundary clipping must use the visible base dimensions');
    const colliders=world.obstacles.filter(obstacle=>obstacle.id==='lighthouse-retaining-base');
    assert.equal(colliders.length,1);
    assert.ok(Math.abs(colliders[0].x-center.x)<1e-6&&Math.abs(colliders[0].z-center.z)<1e-6&&Math.abs(colliders[0].w*2-size.x)<1e-6&&Math.abs(colliders[0].d*2-size.z)<1e-6,'The solid must cover the complete retaining base, not just the tower column');

    const wallCaps=[];
    world.root.traverse(object=>{
      if(!['playable-garden-wall','garden-wall-cap','exit-pier','exit-pier-cap'].includes(object.name))return;
      const wall=new THREE.Box3().setFromObject(object);
      assert.equal(wall.min.x<base.max.x+.0599&&wall.max.x>base.min.x-.0599&&wall.min.z<base.max.z+.0599&&wall.max.z>base.min.z-.0599,false,`${object.name} must stop with a 6cm joint before the lighthouse base`);
      if(object.name==='garden-wall-cap'&&wall.min.z<base.max.z&&wall.max.z>base.max.z-.6)wallCaps.push(wall);
    });
    const west=wallCaps.filter(wall=>wall.max.x<base.min.x).sort((a,b)=>b.max.x-a.max.x)[0];
    const east=wallCaps.filter(wall=>wall.min.x>base.max.x).sort((a,b)=>a.min.x-b.min.x)[0];
    assert.ok(west&&east,'The perimeter must resume on both sides of the base');
    for(const gap of [base.min.x-west.max.x,east.min.x-base.max.x])assert.ok(gap>=.0599&&gap<.2,'The joint must be narrow; clipping must not remove an entire run of wall');
    for(const obstacle of world.boundaryObstacles)assert.equal(obstacle.x-obstacle.w<base.max.x&&obstacle.x+obstacle.w>base.min.x&&obstacle.z-obstacle.d<base.max.z&&obstacle.z+obstacle.d>base.min.z,false,'The boundary collider must be cut along with its visible wall');
  }finally{world.dispose();}
});

test('the lighthouse front is reachable and solid without steps suggesting a false entrance',()=>{
  const world=buildCollisionWorld('lighthouse');
  try{
    const base=new THREE.Box3().setFromObject(world.root.getObjectByName('lighthouse-retaining-base'));
    const front=base.max.z,goal=[0,front+.6];
    assert.ok(world.canStand(...goal));
    world.setTarget(goal);
    const route=[world.target,...world.route].filter(Boolean);
    assert.ok(route.length,'The actual arrival must connect to the front of the lighthouse');
    let from=world.area.spawn;
    for(const to of route){
      const steps=Math.max(1,Math.ceil(Math.hypot(to[0]-from[0],to[1]-from[1])/.1));
      for(let i=0;i<=steps;i++)assert.ok(world.canStand(from[0]+(to[0]-from[0])*i/steps,from[1]+(to[1]-from[1])*i/steps),'The approach route cannot cross a gallery wall or mechanism');
      from=to;
    }
    assert.ok(Math.hypot(from[0]-goal[0],from[1]-goal[1])<.01);
    for(const x of [-4.75,0,4.75]){
      world.setPlayerPosition([x,front+.6]);
      assert.ok(world.canStand(x,front+.6));
      world.move(0,-3);
      assert.ok(world.player.position.z>=front+.34-1e-5&&world.player.position.z<=front+.35,'Movement must stop on the retaining face, before the general map bound');
      assert.ok(world.canStand(world.player.position.x,world.player.position.z));
    }
    const vent=new THREE.Box3().setFromObject(world.root.getObjectByName('lighthouse-service-vent'));
    assert.ok(vent.min.y>base.max.y+.4,'The technical grille must read as elevated machinery, not a ground-level door');
    const groundMeshes=[];
    world.root.traverse(mesh=>{
      if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.visible)return;
      const bounds=new THREE.Box3().setFromObject(mesh);
      if(bounds.max.y<1)groundMeshes.push(mesh);
    });
    const ray=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0),0,4);
    for(const x of [-1,0,1])for(const distance of [.7,1.3,2]){
      ray.ray.origin.set(x,2,front+distance);
      const hit=ray.intersectObjects(groundMeshes,false)[0];
      assert.ok(hit&&hit.point.y<.22,'The approach must remain level instead of drawing stairs into a blocked tower');
    }
  }finally{world.dispose();}
});
