// Build-time conversion only. No Three.js code is shipped in the PlayCanvas app.
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import * as T from 'three';
import {buildCollisionWorld} from '../../tests/helpers/world-fixture.js';
import {KINGDOM,WATERCOURSE as sourceWatercourse} from '../../src/kingdom-geography.js';
import {WATERCOURSE} from './src/game/kingdom-geography.js';
import {buildKingdomLandscape} from '../../src/kingdom-landscape.js';
import {AREAS} from './src/game/content.js';
const output={version:2,areas:{},meshes:[],actors:[],lights:[]},batches=new Map();
const round=n=>Math.round(n*10000)/10000;
const PAVING=new Set(['authored-connected-paving','continuous-road','road-threshold']);
// The converter and the playable snapshot share exactly the same river course.
sourceWatercourse.splice(0,sourceWatercourse.length,...WATERCOURSE.map(p=>[...p]));
// Doors that lead somewhere: every authored building keeps its entrance (local coordinates).
function entrancesOf(world){const doors=[];world.root.traverse(o=>{const a=o.userData?.architecture;if(a?.id&&a.entrance)doors.push({id:a.id,label:a.label,x:round(a.entrance.x),z:round(a.entrance.z),approach:[round(a.entrance.approach.x),round(a.entrance.approach.z)],direction:a.entrance.direction.map(round),width:round(a.dimensions.width),depth:round(a.dimensions.depth)});});return doors;}
function capture(world,id,offset=[0,0],landscape=false){
  const mapNames=new Map(Object.entries(world.textures).map(([name,texture])=>[texture,name]));
  world.treeTextures.forEach((t,i)=>mapNames.set(t,'tree'+i));
  world.bankTextures?.forEach((t,i)=>mapNames.set(t,'bank'+i));
  const excluded=new Set([world.player,world.ohm,world.dormantOhm,...(world.actors||[]).map(a=>a.g)]);
  if(!landscape)for(const a of world.actors)if(a.name!=='player')output.actors.push({area:id,name:a.name,x:a.g.position.x+offset[0],z:a.g.position.z+offset[1]});
  world.root.updateMatrixWorld(true);
  const dynamics=new Map(),receivers=new Map();let serial=0;
  for(const machine of world.machines||[])for(const receiver of machine.receiverMaterials||[])receivers.set(receiver.material,{object:machine.obj.id,intensity:receiver.intensity});
  const tag=(node,meta)=>{if(!node)return;const p=node.getWorldPosition(new T.Vector3());dynamics.set(node,{id:id+'-'+serial++,pivot:[p.x+offset[0],p.y,p.z+offset[1]],...meta});};
  for(const a of world.animations||[])if(['gear','optic','wheel','boat','banner'].includes(a.kind)){
    // Geometry is baked in world space: rotate around the baked axle, not global Z.
    const axis=new T.Vector3(0,a.kind==='optic'?1:0,a.kind==='optic'?0:1).applyQuaternion(a.obj.getWorldQuaternion(new T.Quaternion()));
    tag(a.obj,{kind:a.kind,speed:a.speed||.2,flag:a.activationFlag,receiver:a.receiverId,spinAxis:axis.toArray().map(round)});
  }
  tag(world.gateLeaf,{kind:'gate'});
  // The gate's lifting gear answers with the leaf: chains wind up, counterweights drop, drives turn.
  if(world.gateway){for(const c of world.gateway.chains)tag(c,{kind:'gate-chain'});for(const w of world.gateway.weights)tag(w,{kind:'gate-weight'});for(const {mesh,side} of world.gateway.drives)tag(mesh,{kind:'gate-drive',side,spinAxis:[0,0,1]});}
  for(const l of world.levers||[])tag(l.pivot,{kind:'lever',flag:l.obj.action?.flag||l.obj.flag,axis:l.waterHandle?'z':'x'});
  for(const l of world.levers||[])tag(l.indicator,{kind:'control',object:l.obj.id});
  world.root.traverse(o=>{if(o.isMesh){const wire=world.conductors?.find(w=>w.mat===o.material);if(wire)tag(o,{kind:'conductor',object:wire.obj.id,return:wire.isReturn});}});
  for(const m of world.machines||[])tag(m.ring,{kind:'indicator',flag:m.obj.puzzle||m.obj.flag});
  for(const mesh of [...(world.fountainWater||[]),...(world.fountainStreams||[])])tag(mesh,{kind:'visible',flag:'pump'});
  for(const mesh of world.irrigationWater||[])tag(mesh,{kind:'visible',flag:'irrigation'});
  if(world.springWaterworks)for(const key of ['flume','basin','fall'])tag(world.springWaterworks[key],{kind:'visible',flag:'spring_sluice',or:'pump'});
  // The Casa de Compuertas answers the kingdom (src/quiet-mount.js): canal water, the weeping gate,
  // the reservoir's level and the lamp. The runtime reads the state; here we only mark the pieces.
  if(world.quietMount){const q=world.quietMount;tag(q.tailraceWater,{kind:'visible',flag:'spring_sluice',or:'pump'});tag(q.weep,{kind:'visible',flag:'pump'});tag(q.reservoirHigh,{kind:'quiet-mount',part:'reservoir-high'});tag(q.reservoirLow,{kind:'quiet-mount',part:'reservoir-low'});tag(q.lamp,{kind:'quiet-mount',part:'lamp'});}
  for(const lamp of world.lamps||[]){const p=lamp.bulb.getWorldPosition(new T.Vector3());output.lights.push({area:id,position:[p.x+offset[0],p.y,p.z+offset[1]]});}
  for(const h of world.hangingLamps||[])output.lights.push({area:id,position:[h.x+offset[0],h.y,h.z+offset[1]],hanging:true});
  const captureMesh=(object,override=null,group=null)=>{
    if(!object.isMesh)return;
    if(!override&&Array.isArray(object.material)){for(const g of object.geometry.groups)captureMesh(object,object.material[g.materialIndex],g);return;}
    for(let p=object;p;p=p.parent)if(excluded.has(p))return;
    let dynamic=null;for(let p=object;p;p=p.parent)if(dynamics.has(p)){dynamic=dynamics.get(p);break;}
    for(let p=object;p;p=p.parent)if(!p.visible&&!dynamic)return;
    let owner='';for(let p=object;p;p=p.parent){const building=world.auditBuildings?.find(b=>b.group===p);if(building){const label=world.layout?.buildings?.find(b=>b.x===building.x&&b.z===building.z)?.label||'Edificio';owner=`${id} · ${label} · ${building.x},${building.z}`;break;}}
    const material=override||object.material,geometry=object.geometry,attribute=geometry.attributes.position;
    const clipTerrain=object.userData.terrain&&!landscape&&(id!=='lighthouse'||material.isShaderMaterial);
    if(!attribute)return;
    const texture=mapNames.get(material.map),isWater=!!material.uniforms?.deep;
    if(material.isShaderMaterial&&!isWater)return;
    const key=material.customProgramCacheKey?.()||'',mapping=key.match(/world(surface|stone)-([\d.]+)/);
    const descriptor={texture:isWater?'water':texture,color:material.color?.getHexString()||'4b8a88',emissive:material.emissive?.getHexString()||'000000',emission:material.emissiveIntensity||0,glass:material===world.m?.glass,alpha:material.alphaTest||0,opacity:material.opacity??1,double:material.side===T.DoubleSide,unlit:!!material.isMeshBasicMaterial,shadow:!!object.castShadow};
    if(receivers.has(material))descriptor.receiver=receivers.get(material);
    // Avoid hand-drawn transparent contact glows becoming black rectangles.
    if(texture==='glow')return;
    // Paving is painted by the ground shader from a baked mask (scripts/bake-shore.mjs);
    // its meshes only carry the outline, and the kerb stones followed the old stepped edge.
    if(object.name==='paving-garden-edging')return;
    // Seen from above, a cone range 50 m behind the Faro reads as rocks floating over the islet.
    if(object.name==='kingdom-distant-mountain')return;
    if(PAVING.has(object.name))descriptor.paving=true;
    if(object.name==='terrace-crop')descriptor.crop=true;
    if(['field-rock','upland-outcrop','quiet-mount-rock'].includes(object.name))descriptor.rock=true;
    if(['window-pane','workshop-window-glass'].includes(object.name))descriptor.pane=true;
    const batchKey=id+owner+(dynamic?.id||'')+JSON.stringify(descriptor);let batch=batches.get(batchKey);
    if(!batch){batch={area:id,owner,dynamic,material:descriptor,positions:[],normals:[],uvs:[],colors:[],indices:[]};batches.set(batchKey,batch);}
    const instances=object.isInstancedMesh?object.count:1;
    for(let instance=0;instance<instances;instance++){
      const matrix=object.matrixWorld.clone();if(object.isInstancedMesh){const local=new T.Matrix4();object.getMatrixAt(instance,local);matrix.multiply(local);}
      matrix.elements[12]+=offset[0];matrix.elements[14]+=offset[1];
      const normalMatrix=new T.Matrix3().getNormalMatrix(matrix),color=new T.Color(1,1,1);if(object.instanceColor)object.getColorAt(instance,color);
      const points=[],normals=[],uvs=[];
      for(let i=0;i<attribute.count;i++){
        const point=new T.Vector3().fromBufferAttribute(attribute,i).applyMatrix4(matrix),normal=geometry.attributes.normal?new T.Vector3().fromBufferAttribute(geometry.attributes.normal,i).applyMatrix3(normalMatrix).normalize():new T.Vector3(0,1,0);
        // The extruded lake bank finishes at y=.10. Keep the shared channel
        // above that cap and below its masonry and the wooden pier.
        if(landscape&&['kingdom-village-canal','kingdom-irrigation-channel'].includes(object.name))point.y=.14;
        if(landscape&&object.name==='kingdom-watercourse-bed')point.y=.125;
        if(clipTerrain){point.z=Math.max(offset[1]-AREAS[id].bounds[1]/2,Math.min(offset[1]+AREAS[id].bounds[1]/2,point.z));}
        points.push(point);normals.push(normal);
        if(mapping){const size=Number(mapping[2]);if(mapping[1]==='stone'&&Math.abs(normal.x)>.6)uvs.push([point.z/size,point.y/size]);else if(mapping[1]==='stone'&&Math.abs(normal.z)>.6)uvs.push([point.x/size,point.y/size]);else uvs.push([point.x/size,point.z/size]);}
        else if(geometry.attributes.uv)uvs.push([geometry.attributes.uv.getX(i)*(material.map?.repeat.x||1),geometry.attributes.uv.getY(i)*(material.map?.repeat.y||1)]);else uvs.push([0,0]);
      }
      const fullIndex=geometry.index?.array||Array.from({length:attribute.count},(_,i)=>i),index=group?fullIndex.slice(group.start,group.start+group.count):fullIndex,valid=[];
      for(let i=0;i<index.length;i+=3){const triangle=[index[i],index[i+1],index[i+2]],center=triangle.reduce((sum,j)=>sum+points[j].z,0)/3;
        if(clipTerrain&&(center<offset[1]-AREAS[id].bounds[1]/2||center>offset[1]+AREAS[id].bounds[1]/2))continue;
        valid.push(...triangle);
      }
      if(!valid.length)continue;
      const start=batch.positions.length/3;
      for(let i=0;i<points.length;i++){batch.positions.push(...points[i].toArray().map((v,j)=>round(v-(dynamic?.pivot[j]||0))));batch.normals.push(...normals[i].toArray().map(round));batch.uvs.push(...uvs[i].map(round));batch.colors.push(color.r,color.g,color.b,1);}
      batch.indices.push(...valid.map(i=>i+start));
    }
  };world.root.traverse(o=>captureMesh(o));
}
for(const id of Object.keys(AREAS)){
  console.log('Exporting '+id);
  const w=buildCollisionWorld(id,{continuous:id!=='workshop'});
  w.clearArea();
  for(const [name,t] of Object.entries(w.textures))t.name=name;
  w.textures.roof.repeat.set(3,3);w.textures.stone.repeat.set(2,2);
  for(const name of ['workshopRug','kingdomBanner'])w.textures[name]=new T.Texture();
  w.bankTextures=Array.from({length:3},()=>new T.Texture());w.treeTextures=Array.from({length:6},()=>new T.Texture());
  w.loadArea(AREAS[id],w.state,AREAS[id].spawn,{continuous:id!=='workshop',deferRender:true});
  const offset=id==='workshop'?[0,0]:[KINGDOM[id].x,KINGDOM[id].z];
  output.areas[id]={offset,bounds:AREAS[id].bounds,spawn:AREAS[id].spawn,walkSurfaces:w.walkSurfaces||[],entrances:entrancesOf(w),obstacles:w.obstacles.map(o=>({...o,gate:(w.gateObstacles||[w.gateObstacle]).includes(o),x:o.x+offset[0],z:o.z+offset[1]}))};
  capture(w,id,offset);
  if(id==='plaza'){
    const original=w.root;w.root=new T.Group();w.localGeometries=[];w.waterMaterials=[];buildKingdomLandscape(w);capture(w,'landscape',[0,0],true);w.root=original;
  }
  w.dispose();
}
output.meshes=[...batches.values()].filter(b=>b.indices.length);
fs.mkdirSync(new URL('./src/data/',import.meta.url),{recursive:true});
const vertices=output.meshes.reduce((n,m)=>n+m.positions.length/3,0),buffers=[];let bytes=0;
for(const mesh of output.meshes)for(const key of ['positions','normals','uvs','colors','indices']){const array=key==='indices'?new Uint32Array(mesh[key]):new Float32Array(mesh[key]);mesh[key]={offset:bytes,length:array.length};const b=Buffer.from(array.buffer);buffers.push(b);bytes+=b.length;}
fs.writeFileSync(new URL('./src/data/geometry.bin.gz',import.meta.url),gzipSync(Buffer.concat(buffers),{level:9}));
// Retire the previous uncompressed generated file, within this experiment only.
const raw=new URL('./src/data/geometry.bin',import.meta.url);if(fs.existsSync(raw))fs.unlinkSync(raw);
fs.writeFileSync(new URL('./src/data/scene.json',import.meta.url),JSON.stringify(output));
console.log(JSON.stringify({batches:output.meshes.length,vertices,actors:output.actors.length,bytes}));
