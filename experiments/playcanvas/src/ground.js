import {SHADERLANGUAGE_GLSL,Texture,PIXELFORMAT_RGBA8,FILTER_LINEAR,ADDRESS_CLAMP_TO_EDGE} from 'playcanvas';
import shore from './data/shore.json';

// The meadow and every paved square or road are one surface. The paving outline comes
// from the baked map (G: coverage, B: regional tone); the shader breaks its edge with
// noise, wears a ring of trodden earth around it and varies the grass in broad patches.
const diffusePS=`
uniform vec3 material_diffuse;
uniform sampler2D uShoreMap;
uniform vec4 uShoreRect;
uniform vec2 uShoreSize;
uniform sampler2D uMeadow;
uniform sampler2D uCobble;
uniform sampler2D uGroundAo;
uniform vec3 uPave[${shore.paving.length}];
uniform vec3 uClouds;
// Each outdoor place: kingdom centre x, z, reach and how alive it is (0 forgotten, 1 restored).
uniform vec4 uLife[8];
float gHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float gNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(gHash(i),gHash(i+vec2(1,0)),f.x),mix(gHash(i+vec2(0,1)),gHash(i+vec2(1,1)),f.x),f.y);}
// Soft cloud shadows drifting over the valley (uClouds: time, strength, scale).
float cloudShade(vec2 p){vec2 q=p*uClouds.z+vec2(uClouds.x*0.012,uClouds.x*0.005);float c=gNoise(q)*0.62+gNoise(q*2.3+4.1)*0.38;return 1.0-uClouds.y*smoothstep(0.44,0.66,c);}
void getAlbedo(){
  vec2 p=vPositionW.xz;
  vec3 grass=texture2D(uMeadow,p/6.0).rgb*material_diffuse;
  #ifdef STD_DIFFUSE_VERTEX
    grass*=saturate(vVertexColor.rgb);
  #endif
  // Broad lush and sun-dried patches, then a finer mottling.
  float broad=gNoise(p*0.045)*0.65+gNoise(p*0.11+7.3)*0.35,fine=gNoise(p*0.6+3.1);
  grass*=mix(vec3(0.84,0.95,0.86),vec3(1.12,1.05,0.8),smoothstep(0.25,0.8,broad))*(0.93+0.14*fine);
  // A forgotten kingdom: the meadow never reaches a garden's green, and around a place nobody has
  // restored yet it dries to straw and grey olive. Restoring the place greens it again.
  float dry=0.0;
  for(int i=0;i<8;i++){vec4 l=uLife[i];float w=1.0-smoothstep(l.z*0.55,l.z,distance(p,l.xy));dry=max(dry,w*(1.0-l.w));}
  float lum=dot(grass,vec3(0.3,0.59,0.11));
  grass=mix(grass,vec3(lum),0.2);
  grass=mix(grass,vec3(lum*1.16,lum*1.0,lum*0.66),dry*0.72)*(1.0-0.1*dry);
  vec2 uv=(p-uShoreRect.xy)/uShoreRect.zw;
  float cover=texture2D(uShoreMap,uv).g;
  float edge=gNoise(p*2.3)*0.6+gNoise(p*5.7+1.7)*0.4;
  float paved=smoothstep(0.44,0.56,cover+(edge-0.5)*0.42);
  float worn=smoothstep(0.06,0.42,cover+(edge-0.5)*0.3)*(1.0-paved);
  grass=mix(grass,grass*vec3(0.86,0.76,0.56),worn*0.8);
  // Oclusión horneada en Blender (scripts/blender/bake-ao.py): el pie de muros, casas y árboles.
  float shade=cloudShade(p)*(1.0-0.55*(1.0-texture2D(uGroundAo,uv).r));
  if(cover<0.01){dAlbedo=grass*shade;return;}
  int tone=int(texture2D(uShoreMap,(floor(uv*uShoreSize)+0.5)/uShoreSize).b*255.0+0.5);
  vec3 tint=uPave[0];
  for(int i=1;i<${shore.paving.length};i++)if(i==tone)tint=uPave[i];
  vec3 stone=texture2D(uCobble,p/5.0).rgb*tint;
  // Loose, sunken stones where the paving gives way to earth.
  stone*=mix(0.8,1.0,smoothstep(0.5,0.8,cover+(edge-0.5)*0.2));
  dAlbedo=mix(grass,stone,paved)*shade;
}`;

const lin=v=>Math.pow(v,2.2);
const tones=new Float32Array(shore.paving.flatMap(h=>[0,2,4].map(i=>lin(parseInt(h.slice(i,i+2),16)/255))));

export function makeGround(material,{shoreMap,meadow,cobble,ao}){
  material.shaderChunksVersion='2.22';
  material.getShaderChunks(SHADERLANGUAGE_GLSL).set('diffusePS',diffusePS);
  material.setParameter('uShoreMap',shoreMap);material.setParameter('uShoreRect',[shore.x0,shore.z0,shore.width,shore.depth]);material.setParameter('uShoreSize',shore.pixels);
  material.setParameter('uMeadow',meadow);material.setParameter('uGroundAo',ao);material.setParameter('uCobble',cobble);material.setParameter('uPave[0]',tones);
  material.setParameter('uClouds',[0,0,.035]);material.setParameter('uLife[0]',new Float32Array(32));material.update();
  return material;
}
let aoTexture=null;
export async function loadGroundAo(app){
  if(aoTexture)return aoTexture;
  const image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('No se pudo cargar la oclusión del suelo'));i.src=new URL('./assets/ground-ao.png',document.baseURI).href;});
  aoTexture=new Texture(app.graphicsDevice,{name:'ground-ao',width:image.width,height:image.height,format:PIXELFORMAT_RGBA8,mipmaps:false,flipY:false,minFilter:FILTER_LINEAR,magFilter:FILTER_LINEAR,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE});
  aoTexture.setSource(image);return aoTexture;
}
export function updateClouds(materials,time,strength){for(const m of materials)m.setParameter('uClouds',[time,strength,.035]);}

// Field boulders: pixel-art granite on the faceted sides, moss cushions on the faces turned
// to the sky, darker at the foot. Each flat facet samples along its dominant axis so the
// texture keeps its crisp pixels instead of a triplanar blur.
const rockPS=`
uniform vec3 material_diffuse;
uniform sampler2D uRock;
uniform sampler2D uMoss;
float rHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float rNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(mix(rHash(i),rHash(i+vec3(1,0,0)),f.x),mix(rHash(i+vec3(0,1,0)),rHash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(rHash(i+vec3(0,0,1)),rHash(i+vec3(1,0,1)),f.x),mix(rHash(i+vec3(0,1,1)),rHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void getAlbedo(){
  vec3 p=vPositionW,n=abs(dVertexNormalW);
  vec2 uv=n.x>n.y&&n.x>n.z?p.zy:n.y>n.z?p.xz:p.xy;
  vec3 stone=texture2D(uRock,uv/2.4).rgb;
  stone*=mix(0.62,1.0,smoothstep(0.0,0.55,p.y));
  float moss=smoothstep(0.55,0.85,dVertexNormalW.y+(rNoise(p*2.1)-0.5)*0.45);
  dAlbedo=mix(stone,texture2D(uMoss,p.xz/2.0).rgb,moss*0.9)*material_diffuse;
}`;
export function makeRock(material,{rock,moss}){
  material.shaderChunksVersion='2.22';material.diffuseMap=null;material.diffuse.set(.92,.92,.9);material.flatShading=true;
  material.getShaderChunks(SHADERLANGUAGE_GLSL).set('diffusePS',rockPS);material.setParameter('uRock',rock);material.setParameter('uMoss',moss);material.update();return material;
}
export function updateGroundLife(materials,life){for(const m of materials)m.setParameter('uLife[0]',life);}
