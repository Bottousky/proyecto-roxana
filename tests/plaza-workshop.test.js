import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {AREAS} from '../src/content.js';
import {renderLocalMap} from '../src/world-map.js';
import {isSegmentClear} from '../src/collision.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';

const close = (actual,expected,message) => assert.ok(Math.abs(actual-expected)<.002,`${message}: ${actual} != ${expected}`);
const workshopIn = world => {
  const group=world.auditBuildings.find(item=>item.group.name==='workshop-exterior')?.group;
  assert.ok(group,'the Plaza must contain the actual exterior workshop');
  return group;
};
const pavedAt = (world,x,z) => {
  const grid=world.pavingGrid;
  const col=Math.floor((x+grid.halfX)/grid.dx),row=Math.floor((z+grid.halfZ)/grid.dz);
  return col>=0&&row>=0&&col<grid.cols&&row<grid.rows&&Boolean(grid.filled[row*grid.cols+col]);
};

test('the real workshop door aligns with entry and a safe paved return through its porch',()=>{
  const entry=AREAS.plaza.exits.find(exit=>exit.target==='workshop');
  const returning=AREAS.workshop.exits.find(exit=>exit.target==='plaza').spawn;
  const world=buildCollisionWorld('plaza',{spawn:returning,flags:{awaken:true}});
  try{
    const workshop=workshopIn(world),architecture=workshop.userData.architecture;
    const doorway=workshop.getObjectByName('building-entrance-door');
    assert.ok(doorway,'the actual drawn door needs an identifiable group');
    const visibleDoor=new THREE.Box3().setFromObject(doorway),doorCenter=visibleDoor.getCenter(new THREE.Vector3());
    close(entry.x,doorCenter.x,'the interaction must be centred on the drawn door');
    close(entry.x,architecture.entrance.approach.x,'entry/architecture X');
    close(entry.z,architecture.entrance.approach.z,'entry/architecture Z');
    assert.deepEqual(architecture.entrance.direction,[0,1],'the facade must face the southern approach');
    assert.ok(entry.z>=visibleDoor.max.z,'the interaction must sit in front of the visible threshold');
    close(returning[0],doorCenter.x,'the return must face the same door');
    assert.ok(returning[1]>entry.z,'returning from the room must leave the player south of its entrance');
    assert.deepEqual(world.getPlayerPosition(),returning,'loading the return must not need an automatic collision correction');
    assert.ok(world.canStand(world.ohm.position.x,world.ohm.position.z,.42),'Ohm must also return to free space');
    for(const radius of [.34,.42])assert.ok(isSegmentClear(returning,[entry.x,entry.z],world.bounds,world.obstacles,{radius,isWalkable:(x,z)=>world.walkableLand(x,z)}),`the porch must admit radius ${radius} between return and entry`);
    for(let i=0;i<=30;i++){
      const x=returning[0]+(entry.x-returning[0])*i/30,z=returning[1]+(entry.z-returning[1])*i/30;
      assert.ok(pavedAt(world,x,z),`the real drawn pavement must reach the door at (${x},${z})`);
    }
    world.move(entry.x-returning[0],entry.z-returning[1]);
    close(world.player.position.x,entry.x,'movement to the porch X');
    close(world.player.position.z,entry.z,'movement to the porch Z');
    assert.equal(world.getNearby()?.id,entry.id,'the visible doorway must select the workshop interaction');
  }finally{world.dispose();}
});

test('the enlarged workshop is visibly larger than its Plaza neighbours and matches its local map footprint',()=>{
  const world=buildCollisionWorld('plaza');
  try{
    const workshop=workshopIn(world),walls=workshop.getObjectByName('building-walls');
    const body=new THREE.Box3().setFromObject(walls),size=body.getSize(new THREE.Vector3()),center=body.getCenter(new THREE.Vector3());
    const silhouette=new THREE.Box3().setFromObject(workshop);
    for(const {group} of world.auditBuildings){
      if(group===workshop)continue;
      const neighbour=new THREE.Box3().setFromObject(group.getObjectByName('building-walls')).getSize(new THREE.Vector3());
      assert.ok(size.x>neighbour.x&&size.z>neighbour.z&&size.y>neighbour.y,'Lumen’s workshop must have a wider, deeper and taller body than each neighbour');
      assert.ok(silhouette.max.y>new THREE.Box3().setFromObject(group).max.y,'its complete visible silhouette must also be taller');
    }
    const svg=renderLocalMap(AREAS.plaza,world.layout,AREAS.plaza.spawn,world.state);
    const ground=svg.match(/class="local-ground" x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/).slice(1).map(Number);
    const mapBody=svg.match(/data-map-building="plaza-workshop"[^]*?<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/).slice(1).map(Number);
    const [mapX,mapZ,mapW,mapD]=mapBody,[groundX,groundZ,groundW,groundD]=ground;
    close(mapW/groundW,size.x/world.bounds[0],'map/body width proportion');
    close(mapD/groundD,size.z/world.bounds[1],'map/body depth proportion');
    close((mapX+mapW/2-groundX)/groundW,(center.x+world.bounds[0]/2)/world.bounds[0],'map/body horizontal position');
    close((mapZ+mapD/2-groundZ)/groundD,(center.z+world.bounds[1]/2)/world.bounds[1],'map/body depth position');
  }finally{world.dispose();}
});
