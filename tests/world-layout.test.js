import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {AREAS} from '../src/content.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';
import {buildPlayableBoundary} from '../src/world-ground.js';
import {expectedPresent} from './helpers/expected-inhabitants.js';

const restored={awaken:true,workshop:true,gate:true,pump:true,distribution:true,irrigation:true,beacon_link:true,beacon_supply:true,beacon_network:true,beacon_lens:true,finale_seen:true};

function pavingNetwork(world,start){
  const wooden=world.area.id==='workshop';
  const grid=world.pavingGrid||(wooden?{cols:80,rows:80,dx:world.bounds[0]/80,dz:world.bounds[1]/80,halfX:world.bounds[0]/2,halfZ:world.bounds[1]/2}:null);
  assert.ok(grid,`${world.area.id}: no rendered paving grid`);
  const {cols,rows,dx,dz,halfX,halfZ}=grid;
  const index=(x,z)=>{
    const col=Math.floor((x+halfX)/dx),row=Math.floor((z+halfZ)/dz);
    return col<0||col>=cols||row<0||row>=rows?-1:row*cols+col;
  };
  const point=i=>[-halfX+(i%cols+.5)*dx,-halfZ+(Math.floor(i/cols)+.5)*dz];
  const paved=(x,z)=>{const i=index(x,z);return i>=0&&(wooden||Boolean(grid.filled[i]));};
  const clear=(x,z)=>paved(x,z)&&world.canStand(x,z,.34);
  const segment=(a,b)=>{
    const steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.05));
    for(let i=0;i<=steps;i++)if(!clear(a[0]+(b[0]-a[0])*i/steps,a[1]+(b[1]-a[1])*i/steps))return false;
    return true;
  };
  const visited=new Uint8Array(cols*rows),safe=new Uint8Array(cols*rows),queue=[];
  assert.ok(clear(...start),`${world.area.id}: spawn (${start}) is not on unobstructed paving`);
  for(let i=0;i<safe.length;i++)if((wooden||grid.filled[i])&&world.canStand(...point(i)))safe[i]=1;
  const connectedNear=p=>{
    const center=index(...p);if(center<0||!clear(...p))return false;
    const col=center%cols,row=Math.floor(center/cols);
    for(let zz=Math.max(0,row-1);zz<=Math.min(rows-1,row+1);zz++)for(let xx=Math.max(0,col-1);xx<=Math.min(cols-1,col+1);xx++){
      const i=zz*cols+xx;if(visited[i]&&segment(p,point(i)))return true;
    }
    return false;
  };
  for(let i=0;i<safe.length;i++)if(safe[i]&&Math.hypot(point(i)[0]-start[0],point(i)[1]-start[1])<Math.max(dx,dz)*1.5&&segment(start,point(i))){visited[i]=1;queue.push(i);}
  const interactions=new Set();
  for(let at=0;at<queue.length;at++){
    const i=queue[at],p=point(i),col=i%cols,row=Math.floor(i/cols);
    world.player.position.set(p[0],world.groundHeight(...p),p[1]);
    const object=world.getNearby();if(object)interactions.add(object.id);
    for(const [xx,zz] of [[col-1,row],[col+1,row],[col,row-1],[col,row+1]]){
      if(xx<0||xx>=cols||zz<0||zz>=rows)continue;
      const next=zz*cols+xx;
      if(!visited[next]&&safe[next]&&segment(p,point(next))){visited[next]=1;queue.push(next);}
    }
  }
  world.setPlayerPosition(start);
  return {interactions,hasPoint:connectedNear,paved};
}

for(const area of Object.values(AREAS)){
  test(`${area.id}: visible paths connect arrivals, interactions and every building entrance`,()=>{
    const world=buildCollisionWorld(area.id,{flags:restored});
    try{
      const network=pavingNetwork(world,area.spawn),failures=[];
      for(const object of [...area.objects,...area.exits]){
        if(expectedPresent(object,world.state.flags)&&!network.interactions.has(object.id))failures.push(`${object.id} (${object.x},${object.z}) has no approach from the connected paving`);
      }
      for(const from of Object.values(AREAS))for(const exit of from.exits||[]){
        if(exit.target===area.id&&exit.spawn&&!network.hasPoint(exit.spawn))failures.push(`${exit.id} returns to unconnected/unpaved (${exit.spawn})`);
      }
      for(const {group} of world.auditBuildings){
        const {entrance,footprint}=group.userData.architecture,approach=entrance.approach;
        if(!network.hasPoint([approach.x,approach.z]))failures.push(`house (${footprint.x},${footprint.z}) entrance approach (${approach.x},${approach.z}) is not connected by paving`);
      }
      assert.deepEqual(failures,[],failures.join('\n'));
    }finally{world.dispose();}
  });
}

test('rendered stone paving stays within the playable area instead of extending into the horizon',()=>{
  for(const area of Object.values(AREAS)){
    if(area.id==='workshop')continue;
    const world=buildCollisionWorld(area.id,{flags:restored});
    try{
      const surfaces=[];world.root.traverse(mesh=>{if(mesh.isMesh&&mesh.material===world.m.path)surfaces.push(mesh);});
      assert.ok(surfaces.some(mesh=>mesh.name==='authored-connected-paving'),`${area.id}: missing visible paving surface`);
      for(const mesh of surfaces){
        const bounds=new THREE.Box3().setFromObject(mesh);
        assert.ok(bounds.min.x>=-area.bounds[0]/2-.001&&bounds.max.x<=area.bounds[0]/2+.001,`${area.id}: paving ${mesh.name||mesh.geometry.type} extends outside horizontal bounds`);
        assert.ok(bounds.min.z>=-area.bounds[1]/2-.001&&bounds.max.z<=area.bounds[1]/2+.001,`${area.id}: paving ${mesh.name||mesh.geometry.type} extends outside depth bounds`);
      }
    }finally{world.dispose();}
  }
});

test('exterior garden walls are visible and have matching physical boundaries',()=>{
  for(const area of Object.values(AREAS)){
    if(area.id==='workshop')continue;
    const world=buildCollisionWorld(area.id,{flags:restored});
    try{
      const walls=[];world.root.traverse(mesh=>{if(mesh.name==='playable-garden-wall')walls.push(mesh);});
      const barriers=world.boundaryObstacles.filter(o=>o.id==='playable-boundary');
      assert.ok(walls.length>0&&barriers.length>0,`${area.id}: the playable edge has no visible physical wall`);
      for(const barrier of barriers){
        assert.ok(world.obstacles.includes(barrier),`${area.id}: boundary is absent from collision geometry`);
        assert.ok(walls.some(mesh=>{
          const bounds=new THREE.Box3().setFromObject(mesh),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
          return Math.abs(center.x-barrier.x)<1e-5&&Math.abs(center.z-barrier.z)<1e-5&&Math.abs(size.x/2-barrier.w)<1e-5&&Math.abs(size.z/2-barrier.d)<1e-5;
        }),`${area.id}: boundary (${barrier.x},${barrier.z}) has no matching wall mesh`);
      }
    }finally{world.dispose();}
  }
});

test('the workshop uses its complete visible wooden floor as the indoor route',()=>{
  const world=buildCollisionWorld('workshop');
  try{
    const floors=[];world.root.traverse(mesh=>{
      if(!mesh.isMesh||mesh.name!=='workshop-wood-floor'||mesh.material?.map!==world.textures.wood)return;
      const bounds=new THREE.Box3().setFromObject(mesh),size=bounds.getSize(new THREE.Vector3());
      if(bounds.max.y<.1&&size.x>=world.bounds[0]&&size.z>=world.bounds[1])floors.push(mesh);
    });
    assert.equal(floors.length,1,'an actual wooden floor must support the indoor paving exception');
  }finally{world.dispose();}
});

test('the garden layout describes the actual building and terrace-bed footprints',()=>{
  const same=(a,b)=>Math.abs(a-b)<1e-6;
  for(const area of Object.values(AREAS)){
    const world=buildCollisionWorld(area.id,{flags:restored});
    try{
      for(const {group} of world.auditBuildings){
        const actual=group.userData.architecture.footprint;
        assert.ok(world.layout.exclusions.some(shape=>same(shape.x,actual.x)&&same(shape.z,actual.z)&&same(shape.w,actual.w)&&same(shape.d,actual.d)),`${area.id}: layout lost the visible building footprint (${actual.x},${actual.z})`);
      }
      for(const bed of world.obstacles.filter(o=>o.id==='terrace-bed')){
        assert.ok(world.layout.exclusions.some(shape=>same(shape.x,bed.x)&&same(shape.z,bed.z)&&same(shape.w,bed.w*2)&&same(shape.d,bed.d*2)),`${area.id}: layout still places the bed somewhere other than (${bed.x},${bed.z})`);
      }
    }finally{world.dispose();}
  }
});

test('rendered exterior paving sits above the actual terrain surface, including coastal bevel caps',()=>{
  for(const area of Object.values(AREAS)){
    if(area.id==='workshop')continue;
    const world=buildCollisionWorld(area.id,{flags:restored});
    try{
      const terrain=[],paving=world.root.getObjectByName('authored-connected-paving');
      world.root.traverse(mesh=>{
        if(mesh.isMesh&&(mesh.material===world.m.grass||Array.isArray(mesh.material)&&mesh.material.includes(world.m.grass)))terrain.push(mesh);
      });
      assert.ok(paving&&terrain.length,`${area.id}: missing rendered paving or terrain`);
      world.root.updateMatrixWorld(true);
      const terrainBounds=new THREE.Box3();for(const mesh of terrain)terrainBounds.union(new THREE.Box3().setFromObject(mesh));
      const ray=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0),0,Infinity);
      const positions=paving.geometry.attributes.position,indices=paving.geometry.index;
      const triangles=Math.floor((indices?.count??positions.count)/3),stride=Math.max(1,Math.floor(triangles/1000));
      const point=new THREE.Vector3(),vertex=new THREE.Vector3();let samples=0;
      for(let triangle=0;triangle<triangles;triangle+=stride){
        point.set(0,0,0);
        for(let corner=0;corner<3;corner++){
          const i=triangle*3+corner,index=indices?indices.getX(i):i;
          point.add(vertex.fromBufferAttribute(positions,index).applyMatrix4(paving.matrixWorld));
        }
        point.multiplyScalar(1/3);
        ray.ray.origin.set(point.x,Math.max(terrainBounds.max.y,point.y)+1,point.z);
        const hit=ray.intersectObjects(terrain,false)[0];
        if(!hit)continue; // A dock may deliberately carry a path beyond the shore.
        samples++;
        assert.ok(point.y>hit.point.y+.0001,`${area.id}: paving at (${point.x.toFixed(2)},${point.z.toFixed(2)}) is buried or coplanar: pavement y=${point.y.toFixed(4)}, terrain y=${hit.point.y.toFixed(4)}`);
      }
      assert.ok(samples>50,`${area.id}: too few real terrain intersections to validate paving visibility`);
    }finally{world.dispose();}
  }
});

test('perimeter walls and their caps stop outside complete building and porch footprints',()=>{
  const asBox=shape=>new THREE.Box3(new THREE.Vector3(shape.x-shape.w/2,0,shape.z-shape.d/2),new THREE.Vector3(shape.x+shape.w/2,1,shape.z+shape.d/2));
  const verify=world=>{
    world.root.updateMatrixWorld(true);
    const architecture=[],walls=[],caps=[];
    world.root.traverse(object=>{
      if(object.name==='playable-garden-wall'||object.name==='exit-pier')walls.push(object);
      if(object.name==='garden-wall-cap'||object.name==='exit-pier-cap')caps.push(object);
      if(!object.userData.architecture)return;
      const data=object.userData.architecture;
      architecture.push(asBox(data.footprint),...(data.blockers||[]).map(asBox),...(data.boundaryFootprints||[]).map(asBox));
      object.traverse(part=>{
        if(part.name==='building-foundation'||part.name==='canvas-awning'||part.isGroup&&/porch/.test(part.name))architecture.push(new THREE.Box3().setFromObject(part));
      });
    });
    for(const mesh of [...walls,...caps]){
      const box=new THREE.Box3().setFromObject(mesh);
      for(const building of architecture){
        const overlap=box.min.x<building.max.x+.0599&&box.max.x>building.min.x-.0599&&box.min.z<building.max.z+.0599&&box.max.z>building.min.z-.0599;
        assert.equal(overlap,false,`${world.area.id}: ${mesh.name} intersects a foundation, porch or support instead of leaving its 6cm joint`);
      }
    }
    assert.equal(walls.length,world.boundaryObstacles.length,'Every visible boundary body has exactly one collider');
    for(const barrier of world.boundaryObstacles){
      assert.ok(walls.some(mesh=>{
        const bounds=new THREE.Box3().setFromObject(mesh),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
        return Math.abs(center.x-barrier.x)<1e-6&&Math.abs(center.z-barrier.z)<1e-6&&Math.abs(size.x/2-barrier.w)<1e-6&&Math.abs(size.z/2-barrier.d)<1e-6;
      }),`${world.area.id}: clipped collision has no matching visible wall`);
    }
  };

  // All authored houses, not just the workshop that originally exposed the bug.
  for(const area of Object.values(AREAS)){
    if(area.id==='workshop')continue;
    const world=buildCollisionWorld(area.id,{flags:restored});
    try{verify(world);}finally{world.dispose();}
  }

  // A wall's CENTER is outside this house, but its thickness intersects the base.
  // The porch also extends beyond the base, with open ground between its posts.
  const geometry=new THREE.BoxGeometry(1,1,1),material=new THREE.MeshBasicMaterial();
  const world={root:new THREE.Group(),bounds:[20,20],area:{id:'boundary-regression',exits:[{x:0,z:9}]},m:{stone:material,stoneDark:material,cream:material},obstacles:[],onLand:()=>true,
    box(x,y,z,w,h,d,m,parent=this.root){const mesh=new THREE.Mesh(geometry,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;},
    solid(x,z,w,d,id){const obstacle={x,z,w:w/2,d:d/2,id};this.obstacles.push(obstacle);return obstacle;}};
  try{
    const building=new THREE.Group();building.position.x=-8.2;world.root.add(building);
    world.box(0,.3,0,2.4,.6,4.2,material,building).name='building-foundation';
    const porch=new THREE.Group();porch.name='workshop-entrance-porch';porch.position.z=2.1;building.add(porch);
    world.box(0,2.5,.8,3.4,.12,1.6,material,porch);
    for(const side of [-1,1])world.box(side*1.5,1.2,1.5,.2,2.4,.2,material,porch);
    building.userData.architecture={footprint:{x:-8.2,z:0,w:2.4,d:4.2},blockers:[-1,1].map(side=>({x:-8.2+side*1.5,z:3.6,w:.2,d:.2}))};
    buildPlayableBoundary(world);verify(world);
    const west=world.boundaryObstacles.filter(o=>o.id==='playable-boundary'&&Math.abs(o.x+9.55)<1e-6);
    assert.ok(west.some(o=>Math.abs(o.z+o.d+2.1775)<1e-6),'The wall is clipped exactly at the foundation, not dropped in whole sampling blocks');
    assert.ok(west.some(o=>Math.abs(o.z-o.d-3.7775)<1e-6),'The wall resumes after the complete porch, not between its supports');
    assert.equal(world.boundaryObstacles.some(o=>Math.abs(o.x)<o.w&&Math.abs(o.z-9.55)<o.d),false,'The actual south exit remains open');

    // Freeze the original workshop's geometry even when its live design grows:
    // center (-16.72,4), body 5×6×4.3, foundation 5.3×6.3, original porch/posts.
    const legacy={...world,root:new THREE.Group(),bounds:[38,32],area:{id:'legacy-plaza',exits:[{x:0,z:14},{x:0,z:-14}]},obstacles:[]};
    const oldHouse=new THREE.Group();oldHouse.position.set(-16.72,0,4);legacy.root.add(oldHouse);
    legacy.box(0,.3,0,5.3,.6,6.3,material,oldHouse).name='building-foundation';
    legacy.box(0,2.6,0,5,4.3,6,material,oldHouse);
    const oldPorch=new THREE.Group();oldPorch.name='workshop-entrance-porch';oldPorch.position.z=3;oldHouse.add(oldPorch);
    legacy.box(0,3.22,.58,2.46,.16,1.4,material,oldPorch);
    const oldBlockers=[];
    for(const side of [-1,1]){
      legacy.box(side*1.02,1.53,1.04,.15,3.06,.15,material,oldPorch);
      legacy.box(side*1.02,.15,1.04,.25,.3,.25,material,oldPorch);
      legacy.box(side*2.05,.24,3.51,.68,.48,.68,material,oldHouse);
      oldBlockers.push({x:-16.72+side*1.02,z:8.04,w:.25,d:.25},{x:-16.72+side*2.05,z:7.51,w:.68,d:.68});
    }
    oldHouse.userData.architecture={footprint:{x:-16.72,z:4,w:5.3,d:6.3},blockers:oldBlockers};
    buildPlayableBoundary(legacy);verify(legacy);
    const oldWest=legacy.boundaryObstacles.filter(o=>o.id==='playable-boundary'&&Math.abs(o.x+18.55)<1e-6);
    assert.ok(oldWest.some(o=>Math.abs(o.z+o.d-.7725)<1e-6),'The original foundation ends the northern wall precisely');
    assert.ok(oldWest.some(o=>Math.abs(o.z-o.d-7.9275)<1e-6),'The original planter and porch approach remain clear after the foundation ends');
  }finally{geometry.dispose();material.dispose();}
});
