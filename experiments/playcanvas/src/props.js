import {StandardMaterial,Color,Entity,Mesh,MeshInstance,CULLFACE_NONE} from 'playcanvas';
import {surface} from './art.ts';
import props from './data/props.json';
import {dressingOf,dressingObstacles,BUNTING} from './dressing.js';

// Utilería del kit de Blender (public/assets/props/kit.glb). Cada material del kit es una
// familia: las que tienen textura pixel art la toman de public/assets/hd2d con un tinte;
// las demás (flores, fruta, tierra, barro) son color plano. La oclusión viene horneada en
// el color de vértice.
const TEXTURED={wood:['wood','#ffffff'],darkwood:['wood','#8c6f58'],stone:['stone','#ffffff'],burlap:['burlap','#ffffff'],hay:['hay','#ffffff'],iron:['iron','#ffffff'],endgrain:['endgrain','#ffffff'],awning:['awning','#ffffff']};
const FLAT={wood:'#b08a60',darkwood:'#6e5238',iron:'#5b6166',burlap:'#d9c49c',hay:'#e6c877',endgrain:'#c9a574',awning:'#c8423a',stone:'#b9ad98'};

async function familyMaterial(app,name,source){
  const m=new StandardMaterial();m.name='utilería · '+name;m.diffuseVertexColor=true;m.useMetalness=true;m.metalness=0;m.gloss=.15;
  const t=TEXTURED[name];let map=null;
  if(t)try{map=await surface(app,t[0]);}catch{map=null;}
  if(map){m.diffuseMap=map;m.diffuse=new Color().fromString(t[1]);}
  else if(FLAT[name])m.diffuse=new Color().fromString(FLAT[name]);
  else m.diffuse=source?.diffuse?.clone()||new Color(1,1,1);
  if(name==='fire'){m.emissive=new Color(1,.55,.2);m.emissiveIntensity=2.2;}
  m.update();return m;
}

export async function placeDressing(world){
  const app=world.app,url=new URL('./assets/props/kit.glb',document.baseURI).href;
  const asset=await new Promise((resolve,reject)=>app.assets.loadFromUrlAndFilename(url,'kit.glb','container',(error,a)=>error?reject(error):resolve(a)));
  const template=asset.resource.instantiateRenderEntity(),materials=new Map();world.kit=template;
  for(const r of template.findComponents('render'))for(const mi of r.meshInstances){
    const name=(mi.material.name||'').replace(/\.\d+$/,'');
    if(!materials.has(name))materials.set(name,await familyMaterial(app,name,mi.material));
    mi.material=materials.get(name);mi.castShadow=true;mi.receiveShadow=true;
  }
  let placed=0;
  for(const [id,region] of world.regions){
    const area=world.data.areas[id];if(!area)continue;const [ox,oz]=area.offset;
    for(const [kind,x,z,rotation,lift=0] of dressingOf(id)){
      const source=template.findByName(kind);if(!source){console.warn('Falta la pieza',kind);continue;}
      const e=source.clone();e.name='Utilería · '+kind;
      let y=0;for(const s of area.walkSurfaces||[])if(s.r!=null?Math.hypot(x-s.x,z-s.z)<=s.r:Math.abs(x-s.x)<=s.w/2&&Math.abs(z-s.z)<=s.d/2)y=Math.max(y,s.y);
      e.setLocalPosition(x+ox,y+lift,z+oz);e.setLocalEulerAngles(0,rotation,0);region.root.addChild(e);placed++;
    }
  }
  for(const [id,list] of Object.entries(BUNTING)){const region=world.regions.get(id),[ox,oz]=world.data.areas[id].offset;for(const [a,b,sag] of list)region.root.addChild(bunting(app,[a[0]+ox,a[1],a[2]+oz],[b[0]+ox,b[1],b[2]+oz],sag));}
  return placed;
}

// Una cuerda que cuelga en catenaria aproximada y banderines triangulares de colores.
// Los colores de vértice se leen en lineal: se pasan desde sRGB.
const PENNANTS=['#b8342c','#e8b53a','#2f6aa8','#4a8a3c','#d9728f','#ece4cc'].map(h=>{const c=new Color().fromString(h);return new Color(c.r**2.2,c.g**2.2,c.b**2.2);});
let buntingMaterial=null;
function bunting(app,a,b,sag){
  const length=Math.hypot(b[0]-a[0],b[2]-a[2]),n=Math.max(4,Math.round(length/.55)),at=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-sag*4*t*(1-t),a[2]+(b[2]-a[2])*t];
  const positions=[],colors=[],indices=[],push=(p,c)=>{positions.push(...p);colors.push(c.r,c.g,c.b,1);return positions.length/3-1;};
  const rope=new Color(.05,.035,.025);
  for(let i=0;i<n;i++){
    const t0=i/n,t1=(i+1)/n,p0=at(t0),p1=at(t1);
    // Cuerda: una cinta fina.
    const r0=push(p0,rope),r1=push(p1,rope),r2=push([p1[0],p1[1]-.03,p1[2]],rope),r3=push([p0[0],p0[1]-.03,p0[2]],rope);indices.push(r0,r1,r2,r0,r2,r3);
    // Banderín colgando del tramo.
    const c=PENNANTS[i%PENNANTS.length],m=at((t0+t1)/2),q0=at(t0+.1/n),q1=at(t1-.1/n);
    const f0=push(q0,c),f1=push(q1,c),f2=push([m[0],m[1]-.42,m[2]],c);indices.push(f0,f1,f2);
  }
  const mesh=new Mesh(app.graphicsDevice);mesh.setPositions(positions);mesh.setColors(colors);
  const normals=[];for(let i=0;i<positions.length/3;i++)normals.push(0,0,1);mesh.setNormals(normals);mesh.setIndices(indices);mesh.update();
  if(!buntingMaterial){buntingMaterial=new StandardMaterial();buntingMaterial.diffuse=new Color(1,1,1);buntingMaterial.diffuseVertexColor=true;buntingMaterial.cull=CULLFACE_NONE;buntingMaterial.emissive=new Color(.05,.045,.035);buntingMaterial.update();}
  const e=new Entity('Guirnalda'),mi=new MeshInstance(mesh,buntingMaterial);mi.castShadow=true;e.addComponent('render',{meshInstances:[mi]});return e;
}

export const propObstacles=id=>dressingObstacles(id,props);
