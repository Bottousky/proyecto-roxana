import * as THREE from 'three';
import { pointOnPaving } from './world-layout.js';

/** One continuous paving surface, cut around the actual occupied footprints. */
export function buildPaving(world) {
  const layout=world.layout;
  if(!layout||world.area.id==='workshop')return;
  const step=.22,positions=[],uv=[],edgePositions=[];
  // Coastal extrusions include a bevel cap at y=.10; the paving must clear it.
  const surfaceY=['lake','lighthouse'].includes(world.area.id)?.121:.071;
  const halfX=world.bounds[0]/2-.42,halfZ=world.bounds[1]/2-.42;
  const cols=Math.ceil(halfX*2/step),rows=Math.ceil(halfZ*2/step);
  const dx=halfX*2/cols,dz=halfZ*2/rows,filled=new Uint8Array(cols*rows);
  const permanent=world.obstacles.filter(o=>!(world.gateObstacles||[]).includes(o));
  const clear=(x,z)=>!permanent.some(o=>Math.abs(x-o.x)<o.w&&Math.abs(z-o.z)<o.d);
  for(let iz=0;iz<rows;iz++)for(let ix=0;ix<cols;ix++){
    const x=-halfX+(ix+.5)*dx,z=-halfZ+(iz+.5)*dz;
    if(pointOnPaving(layout,x,z)&&world.walkableLand(x,z)&&clear(x,z))filled[iz*cols+ix]=1;
  }
  const append=(x,z)=>{positions.push(x,surfaceY,z);uv.push(x/5,z/5)};
  for(let iz=0;iz<rows;iz++)for(let ix=0;ix<cols;ix++){
    if(!filled[iz*cols+ix])continue;
    const x=-halfX+ix*dx,z=-halfZ+iz*dz;
    append(x,z);append(x,z+dz);append(x+dx,z);append(x+dx,z);append(x,z+dz);append(x+dx,z+dz);
    // Short inset cobbles mark a garden edge; thresholds and obstacles need no kerb.
    if((ix+iz)%3===0)for(const [ox,oz] of [[-1,0],[1,0],[0,-1],[0,1]]){
      const nx=ix+ox,nz=iz+oz;
      if(nx<0||nx>=cols||nz<0||nz>=rows||filled[nz*cols+nx])continue;
      const ex=x+dx*(.5+ox*.3),ez=z+dz*(.5+oz*.3);
      if(clear(ex+ox*.25,ez+oz*.25)&&world.onLand(ex,ez))edgePositions.push([ex,ez,ox?0:Math.PI/2]);
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();world.localGeometries.push(geometry);
  const paving=world.mesh(geometry,world.m.path);paving.name='authored-connected-paving';paving.castShadow=false;
  if(edgePositions.length){
    const edges=new THREE.InstancedMesh(world.geo.box,world.m.stoneDark,edgePositions.length),dummy=new THREE.Object3D();
    for(let i=0;i<edgePositions.length;i++){const [x,z,yaw]=edgePositions[i];dummy.position.set(x,surfaceY+.009,z);dummy.rotation.y=yaw;dummy.scale.set(.15,.1,.43);dummy.updateMatrix();edges.setMatrixAt(i,dummy.matrix)}
    edges.name='paving-garden-edging';edges.receiveShadow=true;world.root.add(edges);
  }
  world.pavingGrid={cols,rows,dx,dz,halfX,halfZ,filled};
}

const WALL_JOIN_GAP=.06;
const WALL_CAP_OVERHANG=.0175;

function architectureClearances(world){
  const footprints=[];
  const add=shape=>{if(shape&&[shape.x,shape.z,shape.w,shape.d].every(Number.isFinite)&&shape.w>0&&shape.d>0)footprints.push(shape);};
  const project=object=>{
    const bounds=new THREE.Box3().setFromObject(object);
    if(bounds.isEmpty())return;
    const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
    add({x:center.x,z:center.z,w:size.x,d:size.z});
  };
  world.root.updateMatrixWorld(true);
  world.root.traverse(building=>{
    for(const shape of building.userData.boundaryFootprints||[])add(shape);
    const architecture=building.userData.architecture;
    if(!architecture)return;
    add(architecture.footprint);
    for(const shape of [...(architecture.blockers||[]),...(architecture.boundaryFootprints||[])])add(shape);
    // The complete porch/canopy footprint includes the open space BETWEEN posts.
    // A wall must not pass through that space merely because neither post is hit.
    building.traverse(part=>{
      if(part.name==='building-foundation'||part.name==='canvas-awning'||part.isGroup&&/porch/.test(part.name))project(part);
    });
  });
  return footprints;
}

function subtractIntervals(start,end,cuts){
  let pieces=[[start,end]];
  for(const [low,high] of cuts){
    const next=[];
    for(const [a,b] of pieces){
      if(high<=a||low>=b){next.push([a,b]);continue;}
      if(low>a)next.push([a,Math.min(low,b)]);
      if(high<b)next.push([Math.max(high,a),b]);
    }
    pieces=next;
    if(!pieces.length)break;
  }
  return pieces;
}

/** Frame the playable garden; exact cuts stop both mesh and collider at architecture. */
export function buildPlayableBoundary(world) {
  if(world.area.id==='workshop')return;
  const [w,d]=world.bounds,segment=.8,barriers=[],buildings=architectureClearances(world),runs=[];
  const doorways=(world.area.exits||[]).filter(e=>Math.abs(e.z)>d/2-3.5&&Math.abs(e.x)<w/2-3);
  const append=(x,z,width,depth,alongX)=>{
    const previous=runs.at(-1),gap=previous?(alongX?x-width/2-previous.x-previous.w/2:z-depth/2-previous.z-previous.d/2):Infinity;
    if(previous&&previous.alongX===alongX&&gap<=1e-7&&gap>-.03&&((alongX&&Math.abs(previous.z-z)<1e-7)||(!alongX&&Math.abs(previous.x-x)<1e-7))){
      if(alongX){const left=previous.x-previous.w/2,right=x+width/2;previous.x=(left+right)/2;previous.w=right-left;}
      else{const back=previous.z-previous.d/2,front=z+depth/2;previous.z=(back+front)/2;previous.d=front-back;}
    }else runs.push({x,z,w:width,d:depth,alongX});
  };
  const add=(x,z,width,depth)=>{
    if(!world.onLand(x,z))return;
    const alongX=width>depth,center=alongX?x:z,fixed=alongX?z:x;
    const length=alongX?width:depth,thickness=alongX?depth:width;
    const trim=WALL_JOIN_GAP+WALL_CAP_OVERHANG,cuts=[];
    for(const b of buildings){
      const across=alongX?b.z:b.x,acrossSize=alongX?b.d:b.w;
      if(Math.abs(fixed-across)>=acrossSize/2+thickness/2+trim)continue;
      const axis=alongX?b.x:b.z,size=alongX?b.w:b.d;
      cuts.push([axis-size/2-trim,axis+size/2+trim]);
    }
    if(alongX)for(const exit of doorways){
      if(Math.sign(z)===Math.sign(exit.z)&&Math.abs(z)>d/2-1)cuts.push([exit.x-2.8,exit.x+2.8]);
    }
    for(const [start,end] of subtractIntervals(center-length/2,center+length/2,cuts)){
      if(end-start<1e-6)continue;
      if(alongX)append((start+end)/2,z,end-start,depth,true);
      else append(x,(start+end)/2,width,end-start,false);
    }
  };
  for(const side of [-1,1]){
    const nx=Math.ceil(w/segment),nz=Math.ceil(d/segment);
    if(!world.continuous||!doorways.some(e=>Math.sign(e.z)===side))for(let i=0;i<nx;i++)add(-w/2+(i+.5)*w/nx,side*(d/2-.45),w/nx+.01,.34);
    // The Portal's garden ends at the canal: its coping is the eastern edge, not another wall.
    if(!(world.area.id==='portal'&&side>0))for(let i=0;i<nz;i++)add(side*(w/2-.45),-d/2+(i+.5)*d/nz,.34,d/nz+.01);
  }
  // A village edge is a rustic fence. The long side edges, which this camera sees end-on as
  // poles, are low painted hedges; front edges keep the low garden wall.
  const fenced=world.layout?.boundary==='fence',hedgeSides=world.layout?.sideBoundary!=='wall'&&!!world.bankTextures;
  const hedgeMaterials=hedgeSides?[0,1,2].map(i=>world.mat('#cfd6b4',null,{map:world.bankTextures[i],alphaTest:.4,side:THREE.DoubleSide})):[];
  let hedgeSeed=0;
  for(const b of runs){
    if(hedgeSides&&!fenced&&b.d>b.w){
      world.box(b.x,.04,b.z,b.w,.08,b.d,world.m.stoneDark).name='playable-hedge';
      for(let t=-b.d/2+.4;t<=b.d/2-.3;t+=.95){const k=hedgeSeed++,size=1.25+((k*37)%10)/22;
        const plant=world.mesh('plane',hedgeMaterials[k%3],b.x+(((k*13)%5)-2)*.05,.05+size*.42,b.z+t,size,size,1);plant.name='playable-hedge-plant';plant.castShadow=false;plant.receiveShadow=true;}
      barriers.push(world.solid(b.x,b.z,b.w,b.d,'playable-boundary'));continue;}
    if(fenced){const length=Math.max(b.w,b.d),along=b.w>b.d,steps=Math.max(1,Math.round(length/1.6));
      for(let i=0;i<=steps;i++){const t=(i/steps-.5)*length;world.box(b.x+(along?t:0),.42,b.z+(along?0:t),.13,.84,.13,world.m.darkwood).name='playable-fence-post';}
      for(const h of [.34,.66])world.box(b.x,h,b.z,along?b.w:.07,.07,along?.07:b.d,world.m.wood).name='playable-fence-rail';
      world.box(b.x,.05,b.z,b.w,.1,b.d,world.m.darkwood).name='playable-fence-sill';
      barriers.push(world.solid(b.x,b.z,b.w,b.d,'playable-boundary'));continue;}
    const height=b.z>d/2-1?.55:.9;world.box(b.x,height/2,b.z,b.w,height,b.d,world.m.stoneDark).name='playable-garden-wall';world.box(b.x,height+.035,b.z,b.w+.035,.09,b.d+.035,world.m.stone).name='garden-wall-cap';barriers.push(world.solid(b.x,b.z,b.w,b.d,'playable-boundary'));}
  // Paired short piers make each actual passage read as an entrance, not a cut road.
  for(const e of world.continuous?[]:doorways)for(const side of [-1,1]){
    const x=e.x+side*2.65,z=Math.sign(e.z)*(d/2-.45);
    if(!world.onLand(x,z))continue;
    if(buildings.some(b=>Math.abs(x-b.x)<b.w/2+.34+WALL_JOIN_GAP&&Math.abs(z-b.z)<b.d/2+.34+WALL_JOIN_GAP))continue;
    world.box(x,.7,z,.55,1.4,.55,world.m.stone).name='exit-pier';world.box(x,1.45,z,.68,.12,.68,world.m.cream).name='exit-pier-cap';
    barriers.push(world.solid(x,z,.55,.55,'exit-pier'));
  }
  world.boundaryObstacles=barriers;
}
