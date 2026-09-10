// Build-time conversion only. No Three.js code is shipped in the PlayCanvas app.
import fs from 'node:fs';
import * as T from 'three';
import {buildCollisionWorld} from '../../tests/helpers/world-fixture.js';
import {KINGDOM} from '../../src/kingdom-geography.js';
import {buildKingdomLandscape} from '../../src/kingdom-landscape.js';
import {AREAS} from '../../src/content.js';
const output={version:1,areas:{},meshes:[],actors:[]},batches=new Map();
const round=n=>Math.round(n*10000)/10000;
function capture(world,id,offset=[0,0],landscape=false){
  const mapNames=new Map(Object.entries(world.textures).map(([name,texture])=>[texture,name]));
  world.treeTextures.forEach((t,i)=>mapNames.set(t,'tree'+i));
  world.bankTextures?.forEach((t,i)=>mapNames.set(t,'bank'+i));
  const excluded=new Set([world.player,world.ohm,...(world.actors||[]).map(a=>a.g)]);
  if(!landscape)for(const a of world.actors)if(a.name!=='player')output.actors.push({area:id,name:a.name,x:a.g.position.x+offset[0],z:a.g.position.z+offset[1]});
  world.root.updateMatrixWorld(true);
  world.root.traverseVisible(object=>{
    if(!object.isMesh||Array.isArray(object.material))return;
    for(let p=object;p;p=p.parent)if(excluded.has(p))return;
    let owner='';for(let p=object;p;p=p.parent){const building=world.auditBuildings?.find(b=>b.group===p);if(building){const label=world.layout?.buildings?.find(b=>b.x===building.x&&b.z===building.z)?.label||'Edificio';owner=`${id} · ${label} · ${building.x},${building.z}`;break;}}
    const material=object.material,geometry=object.geometry,attribute=geometry.attributes.position;
    if(!attribute)return;
    const texture=mapNames.get(material.map),isWater=!!material.uniforms?.deep;
    if(material.isShaderMaterial&&!isWater)return;
    const key=material.customProgramCacheKey?.()||'',mapping=key.match(/world(surface|stone)-([\d.]+)/);
    const descriptor={texture:isWater?'water':texture,color:material.color?.getHexString()||'4b8a88',emissive:material.emissive?.getHexString()||'000000',emission:material.emissiveIntensity||0,alpha:material.alphaTest||0,opacity:material.opacity??1,double:material.side===T.DoubleSide,unlit:!!material.isMeshBasicMaterial,shadow:!!object.castShadow};
    // Avoid hand-drawn transparent contact glows becoming black rectangles.
    if(texture==='glow'||texture==='foliage'||texture==='fern')return;
    const batchKey=id+owner+JSON.stringify(descriptor);let batch=batches.get(batchKey);
    if(!batch){batch={area:id,owner,material:descriptor,positions:[],normals:[],uvs:[],colors:[],indices:[]};batches.set(batchKey,batch);}
    const instances=object.isInstancedMesh?object.count:1;
    for(let instance=0;instance<instances;instance++){
      const matrix=object.matrixWorld.clone();if(object.isInstancedMesh){const local=new T.Matrix4();object.getMatrixAt(instance,local);matrix.multiply(local);}
      matrix.elements[12]+=offset[0];matrix.elements[14]+=offset[1];
      const normalMatrix=new T.Matrix3().getNormalMatrix(matrix),color=new T.Color(1,1,1);if(object.instanceColor)object.getColorAt(instance,color);
      const points=[],normals=[],uvs=[];
      for(let i=0;i<attribute.count;i++){
        const point=new T.Vector3().fromBufferAttribute(attribute,i).applyMatrix4(matrix),normal=geometry.attributes.normal?new T.Vector3().fromBufferAttribute(geometry.attributes.normal,i).applyMatrix3(normalMatrix).normalize():new T.Vector3(0,1,0);
        if(object.userData.terrain&&!landscape){point.z=Math.max(offset[1]-AREAS[id].bounds[1]/2,Math.min(offset[1]+AREAS[id].bounds[1]/2,point.z));}
        points.push(point);normals.push(normal);
        if(mapping){const size=Number(mapping[2]);if(mapping[1]==='stone'&&Math.abs(normal.x)>.6)uvs.push([point.z/size,point.y/size]);else if(mapping[1]==='stone'&&Math.abs(normal.z)>.6)uvs.push([point.x/size,point.y/size]);else uvs.push([point.x/size,point.z/size]);}
        else if(geometry.attributes.uv)uvs.push([geometry.attributes.uv.getX(i)*(material.map?.repeat.x||1),geometry.attributes.uv.getY(i)*(material.map?.repeat.y||1)]);else uvs.push([0,0]);
      }
      const index=geometry.index?.array||Array.from({length:attribute.count},(_,i)=>i),valid=[];
      for(let i=0;i<index.length;i+=3){const triangle=[index[i],index[i+1],index[i+2]],center=triangle.reduce((sum,j)=>sum+points[j].z,0)/3;
        if(id!=='workshop'&&(center< -64||center>17))continue;
        if(object.userData.terrain&&!landscape&&(center<offset[1]-AREAS[id].bounds[1]/2||center>offset[1]+AREAS[id].bounds[1]/2))continue;
        valid.push(...triangle);
      }
      if(!valid.length)continue;
      const start=batch.positions.length/3;
      for(let i=0;i<points.length;i++){batch.positions.push(...points[i].toArray().map(round));batch.normals.push(...normals[i].toArray().map(round));batch.uvs.push(...uvs[i].map(round));batch.colors.push(color.r,color.g,color.b,1);}
      batch.indices.push(...valid.map(i=>i+start));
    }
  });
}
for(const id of ['plaza','road','workshop']){
  const w=buildCollisionWorld(id,{flags:{awaken:true,workshop:true},continuous:id!=='workshop'});
  w.clearArea();
  for(const [name,t] of Object.entries(w.textures))t.name=name;
  w.textures.roof.repeat.set(3,3);w.textures.stone.repeat.set(2,2);
  for(const name of ['workshopRug','kingdomBanner'])w.textures[name]=new T.Texture();
  w.bankTextures=Array.from({length:3},()=>new T.Texture());w.treeTextures=Array.from({length:6},()=>new T.Texture());
  w.loadArea(AREAS[id],w.state,AREAS[id].spawn,{continuous:id!=='workshop',deferRender:true});
  const offset=id==='workshop'?[0,0]:[KINGDOM[id].x,KINGDOM[id].z];
  output.areas[id]={offset,bounds:AREAS[id].bounds,spawn:AREAS[id].spawn,obstacles:w.obstacles.map(o=>({...o,x:o.x+offset[0],z:o.z+offset[1]}))};
  capture(w,id,offset);
  if(id==='plaza'){
    const original=w.root;w.root=new T.Group();w.localGeometries=[];w.waterMaterials=[];buildKingdomLandscape(w);capture(w,'landscape',[0,0],true);w.root=original;
  }
  w.dispose();
}
output.meshes=[...batches.values()].filter(b=>b.indices.length);
fs.mkdirSync(new URL('./src/data/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('./src/data/scene.json',import.meta.url),JSON.stringify(output));
// Pure movement helpers are renderer-independent and shared for an equal comparison.
for(const name of ['collision','navigation','actor-animation']){const source=fs.readFileSync(new URL(`../../src/${name}.js`,import.meta.url),'utf8').replace('isWalkable=()=>true','isWalkable=(x,z)=>Boolean(true)').replace('walkableEverywhere = () => true','walkableEverywhere = (x,z) => Boolean(true)');fs.writeFileSync(new URL(`./src/${name}.js`,import.meta.url),source);}
console.log(JSON.stringify({batches:output.meshes.length,vertices:output.meshes.reduce((n,m)=>n+m.positions.length/3,0),actors:output.actors.length}));
