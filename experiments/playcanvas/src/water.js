import {SHADERLANGUAGE_GLSL,Color,Texture,PIXELFORMAT_RGBA8,FILTER_LINEAR,ADDRESS_CLAMP_TO_EDGE} from 'playcanvas';
import shore from './data/shore.json';

// Water surfaces share one look: world-space waves, the sky reflected by Fresnel and
// sparkles where the sun meets a crest. Everything is computed from vPositionW, so the
// long canal planes, fountains and the open sea tile without seams or stretched UVs.
const common=`
uniform float uWaterTime;
uniform float uWaterMotion;
uniform vec3 uWaterSky;
uniform vec3 uWaterHorizon;
uniform vec3 uWaterSunDir;
uniform vec3 uWaterSunColor;
uniform vec3 uWaterDeep;
uniform vec3 uWaterShallow;
uniform vec3 uWaterFoam;
uniform sampler2D uShoreMap;
uniform vec4 uShoreRect;
uniform float uShoreEnabled;
float wHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float wNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(wHash(i),wHash(i+vec2(1,0)),f.x),mix(wHash(i+vec2(0,1)),wHash(i+vec2(1,1)),f.x),f.y);}
// Height field and its gradient: a few directional swells plus drifting noise.
vec3 wWaves(vec2 p,float t){
  vec3 h=vec3(0.0);
  vec4 dirs[4];dirs[0]=vec4(0.8,0.6,1.7,0.9);dirs[1]=vec4(-0.4,0.92,2.9,1.3);dirs[2]=vec4(0.96,-0.28,4.3,1.9);dirs[3]=vec4(-0.7,-0.71,6.1,2.4);
  float amp=0.05;
  for(int i=0;i<4;i++){vec2 d=dirs[i].xy;float k=dirs[i].z,ph=dot(d,p)*k+t*dirs[i].w;h.x+=sin(ph)*amp;h.yz+=d*k*cos(ph)*amp;amp*=0.62;}
  vec2 q=p*1.6+vec2(t*0.21,-t*0.17);float e=0.08,n=wNoise(q);
  h.x+=n*0.05;h.y+=(wNoise(q+vec2(e,0))-n)/e*0.05*1.6;h.z+=(wNoise(q+vec2(0,e))-n)/e*0.05*1.6;
  return h;
}
vec3 wGrad;float wHeight;float wShore;float wFoam;
`;
const chunks={
  diffusePS:common+`
uniform vec3 material_diffuse;
void getAlbedo(){
  vec2 p=vPositionW.xz;float t=uWaterTime*uWaterMotion;
  vec3 w=wWaves(p,t);wHeight=w.x;wGrad=w;
  float body=wNoise(p*0.07+vec2(t*0.01,0.0))*0.6+wNoise(p*0.19-vec2(0.0,t*0.02))*0.4;
  dAlbedo=mix(uWaterDeep,uWaterShallow,smoothstep(0.3,0.8,body))*material_diffuse;
  dAlbedo*=0.9+wHeight*2.2;
  // Baked distance to the shore, in metres.
  wShore=mix(6.0,texture2D(uShoreMap,(p-uShoreRect.xy)/uShoreRect.zw).r*6.0,uShoreEnabled);
  float wobble=(wNoise(p*1.7+vec2(t*0.3,t*0.2))-0.5)*0.35;
  float d=max(0.0,wShore+wobble);
  dAlbedo=mix(uWaterShallow*1.12,dAlbedo,smoothstep(0.0,1.1,d));
  // A solid lip against the bank and thinner swash lines that travel toward it.
  float lip=1.0-smoothstep(0.06,0.24,d);
  float swash=smoothstep(0.86,1.0,sin(d*6.5-t*1.4)*0.5+0.5)*(1.0-smoothstep(0.25,0.9,d));
  swash*=smoothstep(0.35,0.65,wNoise(p*0.8+vec2(0.0,t*0.15)));
  wFoam=clamp(lip*0.75+swash*0.35,0.0,1.0);
  dAlbedo=mix(dAlbedo,uWaterFoam,wFoam);
}`,
  normalMapPS:`
void getNormal(){dNormalW=normalize(vec3(-wGrad.y*0.8,1.0,-wGrad.z*0.8));}`,
  glossPS:`
void getGlossiness(){dGlossiness=0.86;}`,
  emissivePS:`
uniform vec3 material_emissive;
uniform float material_emissiveIntensity;
void getEmission(){
  vec3 n=dNormalW,v=dViewDirW;
  float fres=0.04+0.96*pow(1.0-clamp(dot(n,v),0.0,1.0),5.0);
  vec3 r=reflect(-v,n);
  vec3 sky=mix(uWaterHorizon,uWaterSky,smoothstep(0.0,0.7,r.y));
  float glint=pow(max(dot(r,uWaterSunDir),0.0),380.0);
  float t=uWaterTime*uWaterMotion;vec2 p=vPositionW.xz;
  // Drifting contour lines of two noise fields read as light caught on ripples.
  float a=wNoise(p*vec2(0.55,0.9)+vec2(t*0.12,t*0.05)),b=wNoise(p*vec2(0.9,0.6)*1.3-vec2(t*0.07,t*0.11));
  float lines=smoothstep(0.955,1.0,1.0-abs(a-0.5)*2.0)*0.7+smoothstep(0.965,1.0,1.0-abs(b-0.5)*2.0)*0.5;
  lines*=smoothstep(0.35,0.75,wNoise(p*0.23+vec2(t*0.03,0.0)))*smoothstep(0.4,1.2,wShore)*(1.0-wFoam);
  float sparkle=step(0.975,wNoise(p*7.0+t*vec2(0.6,-0.4)))*smoothstep(0.0,0.08,wHeight);
  vec3 light=uWaterSunColor*0.75+uWaterSky*0.25;
  dEmission=sky*fres*0.7+uWaterSunColor*glint*2.0+light*(lines*0.32+sparkle*0.55)+material_emissive*material_emissiveIntensity;
}`,
};

export function makeWater(material){
  material.shaderChunksVersion='2.22';
  const map=material.getShaderChunks(SHADERLANGUAGE_GLSL);
  for(const [name,code] of Object.entries(chunks))map.set(name,code);
  material.diffuseMap=null;material.diffuse=new Color(1,1,1);material.useMetalness=true;material.metalness=0;material.gloss=.86;
  material.update();
  return material;
}
let shoreTexture=null;
export async function loadShore(app){
  if(shoreTexture)return shoreTexture;
  const image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('No se pudo cargar la orilla'));i.src=new URL('./assets/shore-distance.png',document.baseURI).href;});
  shoreTexture=new Texture(app.graphicsDevice,{name:'shore-distance',width:image.width,height:image.height,format:PIXELFORMAT_RGBA8,mipmaps:false,flipY:false,minFilter:FILTER_LINEAR,magFilter:FILTER_LINEAR,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE});
  shoreTexture.setSource(image);return shoreTexture;
}
// Fountains and basins are local pivoted meshes outside the baked map: no shoreline.
export function bindShore(material,texture,enabled=true){
  material.setParameter('uShoreEnabled',enabled?1:0);material.setParameter('uShoreMap',texture);material.setParameter('uShoreRect',[shore.x0,shore.z0,shore.width,shore.depth]);
}

// Uniforms are consumed in linear space; palette values are authored in sRGB.
const lin=v=>Math.pow(v,2.2);
const linear=c=>[lin(c.r),lin(c.g),lin(c.b)];
const hex=s=>[1,3,5].map(i=>lin(parseInt(s.slice(i,i+2),16)/255));
const PALETTE={deep:[hex('#123f48'),hex('#071a28')],shallow:[hex('#2f7a78'),hex('#16384a')],foam:[hex('#e9efe0'),hex('#8fa2a8')]};
export function updateWater(materials,{time,motion,sky,horizon,sunDir,sunColor,night}){
  const mix=([a,b])=>a.map((v,i)=>v+(b[i]-v)*night),deep=mix(PALETTE.deep),shallow=mix(PALETTE.shallow),foam=mix(PALETTE.foam);
  const skyL=linear(sky),horizonL=linear(horizon),sunL=linear(sunColor),dir=[sunDir.x,sunDir.y,sunDir.z];
  for(const m of materials){
    m.setParameter('uWaterTime',time);m.setParameter('uWaterMotion',motion);
    m.setParameter('uWaterSky',skyL);m.setParameter('uWaterHorizon',horizonL);
    m.setParameter('uWaterSunDir',dir);m.setParameter('uWaterSunColor',sunL);
    m.setParameter('uWaterDeep',deep);m.setParameter('uWaterShallow',shallow);m.setParameter('uWaterFoam',foam);
  }
}
