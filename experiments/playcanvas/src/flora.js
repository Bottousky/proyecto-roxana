import {StandardMaterial,Color,Entity,Mesh,MeshInstance,Texture,PIXELFORMAT_RGBA8,FILTER_NEAREST,FILTER_LINEAR_MIPMAP_LINEAR,ADDRESS_CLAMP_TO_EDGE,CULLFACE_NONE} from 'playcanvas';
import shore from './data/shore.json';
import plants from './data/plants.json';
import {AREAS} from './game/content.js';
import {isExterior,travelBounds,inTravelCorridor} from './game/kingdom-geography.js';
import {makeWind} from './wind.js';
import {walkableTerrain} from './terrain.js';
import {reliefHeight,reliefSlope} from './relief.js';
import {surface} from './art.ts';
import grid from './data/relief.json';

// Pasto, flores, matas y juncos pixel art (art-src/plants → scripts/plants.py) sembrados
// sobre el suelo de cada lugar exterior. Nada crece sobre el empedrado, el agua, los
// edificios ni las plataformas; al pie de muros, cercas y utilería crecen más y más altas,
// y en los lugares de paso solo matas bajas, para que nunca tapen a nadie.
const FLAT=new Set(['portal','plaza','road','spring','castle','terraces','lake','lighthouse']);
const SPACING=.95;

function hash(x,z,k=0){let h=Math.imul((x*73856093)^(z*19349663)^(k*83492791),0x5bd1e995);h^=h>>>13;h=Math.imul(h,0x5bd1e995);return ((h^(h>>>15))>>>0)/4294967296;}
function noise(x,z){const xi=Math.floor(x),zi=Math.floor(z),fx=x-xi,fz=z-zi,s=t=>t*t*(3-2*t),a=hash(xi,zi,9),b=hash(xi+1,zi,9),c=hash(xi,zi+1,9),d=hash(xi+1,zi+1,9);return a+(b-a)*s(fx)+(c-a)*s(fz)+(a-b-c+d)*s(fx)*s(fz);}

async function pixels(url){
  const image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('No se pudo cargar '+url));i.src=new URL(url,document.baseURI).href;});
  const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(image,0,0);
  return {image,data:x.getImageData(0,0,c.width,c.height).data,width:c.width,height:c.height};
}

function atlasTexture(app,name,image){
  const t=new Texture(app.graphicsDevice,{name,width:image.width,height:image.height,format:PIXELFORMAT_RGBA8,srgb:true,flipY:false,mipmaps:true,minFilter:FILTER_LINEAR_MIPMAP_LINEAR,magFilter:FILTER_NEAREST,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE});
  t.setSource(image);return t;
}

// Qué sprites puede tomar cada situación: [hoja, fila, altura en unidades de mundo, peso].
// Las flores se juntan donde alguien las cuida (al pie de las casas); en el campo manda el
// verde: pasto alto, helechos y matas, con alguna flor silvestre suelta.
const LOW=[['a',0,.55,8],['a',3,.65,2],['a',2,.55,1]];
const GARDEN=[['b',3,1.15,3],['b',1,1.3,3],['a',2,.65,3],['b',0,1.2,2],['a',1,1.0,1]];
const EDGE=[['a',1,1.05,5],['a',3,.8,4],['b',0,1.3,3],['a',0,.6,3],['a',2,.6,1]];
const WILD=[['a',1,1.15,6],['a',0,.6,4],['a',3,.85,3],['b',0,1.55,2],['a',2,.65,1],['b',1,1.4,.3]];
const REEDS=[['b',2,1.5,1]];
// Donde termina lo caminable y no hay agua ni muro que lo diga, un seto tupido lo dice:
// ningún pasto abierto debe parecer un camino que después no deja pasar.
const HEDGE=[['b',0,1.9,5],['b',1,1.8,1],['a',1,1.3,2]];
const pick=(pool,r)=>{const total=pool.reduce((n,p)=>n+p[3],0);let t=r*total;for(const p of pool){t-=p[3];if(t<=0)return p;}return pool.at(-1);};

export async function sowFlora(world){
  const app=world.app,sheets={};
  for(const key of ['a','b']){const p=await pixels(`./assets/plants/${key}.png`);sheets[key]={texture:atlasTexture(app,'flora-'+key,p.image),size:[p.width,p.height]};}
  const map=await pixels('./assets/shore-distance.png');
  const sample=(X,Z)=>{const u=Math.floor((X-shore.x0)/shore.width*map.width),v=Math.floor((Z-shore.z0)/shore.depth*map.height);if(u<0||v<0||u>=map.width||v>=map.height)return null;const i=(v*map.width+u)*4;return {water:map.data[i]/255,paved:map.data[i+1]/255};};
  const batches={a:{positions:[],uvs:[],colors:[],indices:[]},b:{positions:[],uvs:[],colors:[],indices:[]}};
  const claimed=new Set();let count=0;
  const exteriors=Object.keys(AREAS).filter(isExterior).map(id=>{const [ox,oz]=world.data.areas[id].offset,[tw,td]=travelBounds(id);return {id,ox,oz,tw,td};});
  const seaLine=world.data.areas.lighthouse.offset[1]-8;
  const corridor=(X,Z)=>exteriors.some(a=>inTravelCorridor(a.id,X-a.ox,Z-a.oz,-.6));
  const walkable=(X,Z)=>exteriors.some(a=>{const x=X-a.ox,z=Z-a.oz;return Math.abs(x)<=a.tw/2&&Math.abs(z)<=a.td/2&&walkableTerrain(a.id,x,z);});
  const border=(X,Z)=>!walkable(X,Z)&&[[1.1,0],[-1.1,0],[0,1.1],[0,-1.1],[.8,.8],[-.8,.8],[.8,-.8],[-.8,-.8]].some(([dx,dz])=>walkable(X+dx,Z+dz));
  const hedges={positions:[]};
  for(const id of Object.keys(AREAS)){
    if(!isExterior(id)||!FLAT.has(id))continue;
    const [ox,oz]=world.data.areas[id].offset,[tw,td]=travelBounds(id),bw=tw+36,bd=td+24,[aw,ad]=AREAS[id].bounds,obstacles=world.localObstacles(id),surfaces=world.data.areas[id].walkSurfaces||[];
    const near=(x,z,pad,only)=>obstacles.some(o=>(!only||o.id===only)&&Math.abs(x-o.x)<o.w+pad&&Math.abs(z-o.z)<o.d+pad);
    for(let gx=Math.floor((ox-bw/2)/SPACING);gx<=Math.ceil((ox+bw/2)/SPACING);gx++)for(let gz=Math.floor((oz-bd/2)/SPACING);gz<=Math.ceil((oz+bd/2)/SPACING);gz++){
      const key=gx+','+gz;if(claimed.has(key))continue;claimed.add(key);
      const X=(gx+hash(gx,gz,1))*SPACING,Z=(gz+hash(gx,gz,2))*SPACING,x=X-ox,z=Z-oz,s=sample(X,Z);if(!s)continue;
      if(s.paved>.1||surfaces.some(w=>w.r!=null?Math.hypot(x-w.x,z-w.z)<=w.r+.3:Math.abs(x-w.x)<=w.w/2+.3&&Math.abs(z-w.z)<=w.d/2+.3))continue;
      const shoreline=s.water>0&&s.water<.07,inside=Math.abs(x)<aw/2-.5&&Math.abs(z)<ad/2-.5;
      if(s.water>0&&!shoreline)continue;
      if(corridor(X,Z))continue; // los caminos entre lugares quedan libres
      if(Z<seaLine&&!walkable(X,Z)&&!border(X,Z))continue; // al norte del Faro solo hay mar
      if(near(x,z,.05))continue;
      if(!shoreline&&s.water===0&&border(X,Z)){
        // Dos o tres matas altas por celda, apretadas, para que el borde se lea como seto.
        for(let k=0;k<3;k++){const hx=X+(hash(gx,gz,20+k)-.5)*SPACING,hz=Z+(hash(gx,gz,30+k)-.5)*SPACING;if(walkable(hx,hz))continue;hedges.positions.push([hx,hz,pick(HEDGE,hash(gx,gz,40+k)),Math.floor(hash(gx,gz,50+k)*4)]);}
        continue;
      }
      const garden=near(x,z,1.3,'building'),edge=near(x,z,.9),patch=noise(X*.16,Z*.16),r=hash(gx,gz,3);
      let pool;
      if(shoreline)pool=REEDS;
      else if(garden){if(r>.7)continue;pool=GARDEN;}
      else if(edge){if(r>.5)continue;pool=EDGE;}
      else if(!inside){if(r>.12+patch*.62)continue;pool=WILD;}
      else{if(r>patch*.5-.08)continue;pool=LOW;}
      const [sheet,row,height]=pick(pool,hash(gx,gz,4)),col=Math.floor(hash(gx,gz,5)*4),cell=plants[sheet][row*4+col];if(!cell)continue;
      if(reliefSlope(X,Z)>.9)continue;
      const h=height*(.8+hash(gx,gz,6)*.45),w=h*cell.aspect,b=batches[sheet],base=b.positions.length/3,tint=.86+hash(gx,gz,7)*.2,y=reliefHeight(X,Z)+.02;
      const [u0,v0,u1,v1]=cell.uv;
      b.positions.push(X-w/2,y,Z, X+w/2,y,Z, X+w/2,y+h,Z, X-w/2,y+h,Z);
      b.uvs.push(u0,v1, u1,v1, u1,v0, u0,v0);
      // Pie en sombra, copa al sol: la mata se asienta en el pasto.
      for(const k of [.62,.62,1,1])b.colors.push(tint*k,tint*k,tint*k*.96,1);
      b.indices.push(base,base+1,base+2,base,base+2,base+3);count++;
    }
  }
  for(const [X,Z,[sheet,row,height],col] of hedges.positions){
    const cell=plants[sheet][row*4+col];if(!cell)continue;
    const h=height*(.85+hash(Math.round(X*10),Math.round(Z*10),8)*.35),w=h*cell.aspect,b=batches[sheet],base=b.positions.length/3,tint=.8+hash(Math.round(X*7),Math.round(Z*7),9)*.18;
    const [u0,v0,u1,v1]=cell.uv;
    if(reliefSlope(X,Z)>.9)continue;const y=reliefHeight(X,Z)+.02;
    b.positions.push(X-w/2,y,Z, X+w/2,y,Z, X+w/2,y+h,Z, X-w/2,y+h,Z);b.uvs.push(u0,v1,u1,v1,u1,v0,u0,v0);
    for(const k of [.55,.55,1,1])b.colors.push(tint*k,tint*k,tint*k*.95,1);
    b.indices.push(base,base+1,base+2,base,base+2,base+3);count++;
  }
  // Sotobosque en todas las lomas: pasto alto y matas donde no llegó la siembra de los lugares.
  for(let j=0;j<grid.rows;j+=2)for(let i=0;i<grid.cols;i+=2){
    const X=grid.x0+(i+hash(i,j,70)*2)*grid.cell,Z=grid.z0+(j+hash(i,j,71)*2)*grid.cell,y=reliefHeight(X,Z);
    if(y<.4||reliefSlope(X,Z)>.8||claimed.has(Math.floor(X/SPACING)+','+Math.floor(Z/SPACING)))continue;
    if(hash(i,j,72)>.25+noise(X*.05,Z*.05)*.55)continue;
    const [sheet,row,height]=pick(WILD,hash(i,j,73)),cell=plants[sheet][row*4+Math.floor(hash(i,j,74)*4)];if(!cell)continue;
    const h=height*(.9+hash(i,j,75)*.5),w=h*cell.aspect,b=batches[sheet],base=b.positions.length/3,tint=.8+hash(i,j,76)*.2,[u0,v0,u1,v1]=cell.uv;
    b.positions.push(X-w/2,y,Z, X+w/2,y,Z, X+w/2,y+h,Z, X-w/2,y+h,Z);b.uvs.push(u0,v1,u1,v1,u1,v0,u0,v0);
    for(const k of [.55,.55,1,1])b.colors.push(tint*k,tint*k,tint*k*.95,1);b.indices.push(base,base+1,base+2,base,base+2,base+3);count++;
  }
  const root=world.regions.get('landscape').root;
  // Bosque en las colinas: árboles del reino apretados en manchas, claros en las cumbres,
  // nunca sobre un frente de roca. Enmarcan cada valle como en las referencias.
  const forest=Array.from({length:6},()=>({positions:[],uvs:[],colors:[],indices:[]}));
  for(let j=0;j<grid.rows;j+=3)for(let i=0;i<grid.cols;i+=3){
    const X=grid.x0+(i+hash(i,j,60)*3)*grid.cell,Z=grid.z0+(j+hash(i,j,61)*3)*grid.cell,y=reliefHeight(X,Z);
    if(y<2.2||reliefSlope(X,Z)>.55)continue;
    // Ni un árbol entre la cámara y un valle: el llano más cercano al norte no debe estar a menos de 14 m.
    let shields=false;for(let k=2;k<=14;k+=2)if(reliefHeight(X,Z-k)<.05){shields=true;break;}if(shields)continue;
    const patch=noise(X*.035,Z*.035);if(hash(i,j,62)>patch*1.25-.05)continue;
    const t=Math.floor(hash(i,j,63)*6),size=(6.5+hash(i,j,64)*4.5)*(y>9?.85:1),f=forest[t],base=f.positions.length/3,tint=.78+hash(i,j,65)*.2;
    f.positions.push(X-size*.45,y-.15,Z, X+size*.45,y-.15,Z, X+size*.45,y-.15+size,Z, X-size*.45,y-.15+size,Z);f.uvs.push(0,1,1,1,1,0,0,0);
    for(const k of [.55,.55,1,1])f.colors.push(tint*k,tint*k,tint*k,1);f.indices.push(base,base+1,base+2,base,base+2,base+3);count++;
  }
  for(let t=0;t<6;t++){const f=forest[t];if(!f.indices.length)continue;
    const mesh=new Mesh(app.graphicsDevice);mesh.setPositions(f.positions);mesh.setUvs(0,f.uvs);mesh.setColors(f.colors);mesh.setNormals(new Array(f.positions.length/3).fill(0).flatMap(()=>[0,1,0]));mesh.setIndices(f.indices);mesh.update();
    const map=await surface(app,'tree'+t),m=new StandardMaterial();m.name='bosque-'+t;m.diffuseMap=map;m.opacityMap=map;m.opacityMapChannel='a';m.alphaTest=.35;m.cull=CULLFACE_NONE;m.diffuseVertexColor=true;m.useMetalness=true;m.metalness=0;m.gloss=.1;m.update();
    makeWind(m,'tree');(world.windy??=[]).push(m);
    const e=new Entity('Bosque · '+t),mi=new MeshInstance(mesh,m);mi.castShadow=true;mi.receiveShadow=true;e.addComponent('render',{meshInstances:[mi]});root.addChild(e);}

  for(const [key,b] of Object.entries(batches)){
    if(!b.indices.length)continue;
    const mesh=new Mesh(app.graphicsDevice);mesh.setPositions(b.positions);mesh.setUvs(0,b.uvs);mesh.setColors(b.colors);
    const normals=new Array(b.positions.length/3).fill(0).flatMap(()=>[0,1,0]);mesh.setNormals(normals);mesh.setIndices(b.indices);mesh.update();
    const m=new StandardMaterial();m.name='flora-'+key;m.diffuseMap=sheets[key].texture;m.opacityMap=sheets[key].texture;m.opacityMapChannel='a';m.alphaTest=.5;m.cull=CULLFACE_NONE;m.diffuseVertexColor=true;m.useMetalness=true;m.metalness=0;m.gloss=.1;m.update();
    makeWind(m,'plant');(world.windy??=[]).push(m);
    const e=new Entity('Flora · '+key),mi=new MeshInstance(mesh,m);mi.castShadow=key==='b';mi.receiveShadow=true;e.addComponent('render',{meshInstances:[mi]});root.addChild(e);
  }
  return count;
}
