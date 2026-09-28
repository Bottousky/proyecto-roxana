import {Entity,Mesh,MeshInstance,StandardMaterial,Color,SHADERLANGUAGE_GLSL} from 'playcanvas';
import reliefUrl from './data/relief.bin.gz?url';
import grid from './data/relief.json';
import {surface} from './art.ts';

// Las colinas que enmarcan cada valle (scripts/bake-relief.mjs). Pasto pixel art en las
// laderas suaves, roca en los frentes de los escalones y musgo en las repisas; la base de
// cada frente se oscurece como en un diorama iluminado desde arriba.
let heights=null;
export function reliefHeight(X,Z){
  if(!heights)return 0;const fx=(X-grid.x0)/grid.cell,fz=(Z-grid.z0)/grid.cell,i=Math.floor(fx),j=Math.floor(fz);
  if(i<0||j<0||i>=grid.cols-1||j>=grid.rows-1)return 0;const tx=fx-i,tz=fz-j,h=(a,b)=>heights[b*grid.cols+a];
  return (h(i,j)*(1-tx)+h(i+1,j)*tx)*(1-tz)+(h(i,j+1)*(1-tx)+h(i+1,j+1)*tx)*tz;
}
export function reliefSlope(X,Z){const e=.6;return Math.hypot(reliefHeight(X+e,Z)-reliefHeight(X-e,Z),reliefHeight(X,Z+e)-reliefHeight(X,Z-e))/(2*e);}

const diffusePS=`
uniform vec3 material_diffuse;
uniform sampler2D uMeadow;
uniform sampler2D uRock;
uniform sampler2D uMoss;
float tHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float tNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(tHash(i),tHash(i+vec2(1,0)),f.x),mix(tHash(i+vec2(0,1)),tHash(i+vec2(1,1)),f.x),f.y);}
void getAlbedo(){
  vec3 p=vPositionW,n=normalize(dVertexNormalW),a=abs(n);
  vec3 grass=texture2D(uMeadow,p.xz/6.0).rgb;
  float broad=tNoise(p.xz*0.045)*0.65+tNoise(p.xz*0.11+7.3)*0.35;
  grass*=mix(vec3(0.84,0.95,0.86),vec3(1.12,1.05,0.8),smoothstep(0.25,0.8,broad));
  vec2 side=a.x>a.z?p.zy:p.xy;
  vec3 rock=texture2D(uRock,side/2.6).rgb;
  float cliff=smoothstep(0.62,0.38,n.y);
  vec3 ledge=mix(grass,texture2D(uMoss,p.xz/2.2).rgb,smoothstep(0.55,0.8,tNoise(p.xz*0.3))*0.5);
  vec3 c=mix(ledge,rock,cliff);
  // Pie de cada frente en sombra, cumbres un poco más claras y cálidas.
  c*=mix(0.8,1.06,smoothstep(0.0,14.0,p.y));
  dAlbedo=c*material_diffuse;
}`;

export async function raiseRelief(world){
  const r=await fetch(reliefUrl);if(!r.ok)return;const buffer=await r.arrayBuffer(),magic=new Uint8Array(buffer,0,2);
  const bytes=magic[0]===31&&magic[1]===139?await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():buffer;
  heights=new Float32Array(bytes);
  const {cols,rows,cell,x0,z0}=grid,positions=new Float32Array(cols*rows*3),normals=new Float32Array(cols*rows*3),indices=[];
  const at=(i,j)=>heights[Math.min(rows-1,Math.max(0,j))*cols+Math.min(cols-1,Math.max(0,i))];
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const k=(j*cols+i)*3,h=at(i,j);positions[k]=x0+i*cell;positions[k+1]=h>.03?h:-.06;positions[k+2]=z0+j*cell;
    const nx=at(i-1,j)-at(i+1,j),nz=at(i,j-1)-at(i,j+1),ny=2*cell,l=Math.hypot(nx,ny,nz);normals[k]=nx/l;normals[k+1]=ny/l;normals[k+2]=nz/l;
  }
  for(let j=0;j<rows-1;j++)for(let i=0;i<cols-1;i++){
    const a=j*cols+i,b=a+1,c=a+cols,d=c+1;
    if(Math.max(heights[a],heights[b],heights[c],heights[d])<=.03)continue;
    indices.push(a,c,b,b,c,d);
  }
  const mesh=new Mesh(world.app.graphicsDevice);mesh.setPositions(positions);mesh.setNormals(normals);mesh.setIndices(indices);mesh.update();
  const m=new StandardMaterial();m.name='relieve';m.diffuse=new Color(.95,.97,.92);m.useMetalness=true;m.metalness=0;m.gloss=.05;
  m.shaderChunksVersion='2.22';m.getShaderChunks(SHADERLANGUAGE_GLSL).set('diffusePS',diffusePS);
  m.setParameter('uMeadow',await surface(world.app,'ground'));m.setParameter('uRock',await surface(world.app,'rock'));m.setParameter('uMoss',await surface(world.app,'moss'));m.update();
  const e=new Entity('Colinas del reino'),mi=new MeshInstance(mesh,m);mi.castShadow=true;mi.receiveShadow=true;e.addComponent('render',{meshInstances:[mi]});
  world.regions.get('landscape').root.addChild(e);
}
