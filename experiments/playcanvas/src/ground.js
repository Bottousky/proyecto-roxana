import {SHADERLANGUAGE_GLSL} from 'playcanvas';
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
uniform vec3 uPave[${shore.paving.length}];
float gHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float gNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(gHash(i),gHash(i+vec2(1,0)),f.x),mix(gHash(i+vec2(0,1)),gHash(i+vec2(1,1)),f.x),f.y);}
void getAlbedo(){
  vec2 p=vPositionW.xz;
  vec3 grass=texture2D(uMeadow,p/6.0).rgb*material_diffuse;
  #ifdef STD_DIFFUSE_VERTEX
    grass*=saturate(vVertexColor.rgb);
  #endif
  // Broad lush and sun-dried patches, then a finer mottling.
  float broad=gNoise(p*0.045)*0.65+gNoise(p*0.11+7.3)*0.35,fine=gNoise(p*0.6+3.1);
  grass*=mix(vec3(0.84,0.95,0.86),vec3(1.12,1.05,0.8),smoothstep(0.25,0.8,broad))*(0.93+0.14*fine);
  vec2 uv=(p-uShoreRect.xy)/uShoreRect.zw;
  float cover=texture2D(uShoreMap,uv).g;
  float edge=gNoise(p*2.3)*0.6+gNoise(p*5.7+1.7)*0.4;
  float paved=smoothstep(0.44,0.56,cover+(edge-0.5)*0.42);
  float worn=smoothstep(0.06,0.42,cover+(edge-0.5)*0.3)*(1.0-paved);
  grass=mix(grass,grass*vec3(0.86,0.76,0.56),worn*0.8);
  if(cover<0.01){dAlbedo=grass;return;}
  int tone=int(texture2D(uShoreMap,(floor(uv*uShoreSize)+0.5)/uShoreSize).b*255.0+0.5);
  vec3 tint=uPave[0];
  for(int i=1;i<${shore.paving.length};i++)if(i==tone)tint=uPave[i];
  vec3 stone=texture2D(uCobble,p/5.0).rgb*tint;
  // Loose, sunken stones where the paving gives way to earth.
  stone*=mix(0.8,1.0,smoothstep(0.5,0.8,cover+(edge-0.5)*0.2));
  dAlbedo=mix(grass,stone,paved);
}`;

const lin=v=>Math.pow(v,2.2);
const tones=new Float32Array(shore.paving.flatMap(h=>[0,2,4].map(i=>lin(parseInt(h.slice(i,i+2),16)/255))));

export function makeGround(material,{shoreMap,meadow,cobble}){
  material.shaderChunksVersion='2.22';
  material.getShaderChunks(SHADERLANGUAGE_GLSL).set('diffusePS',diffusePS);
  material.setParameter('uShoreMap',shoreMap);material.setParameter('uShoreRect',[shore.x0,shore.z0,shore.width,shore.depth]);material.setParameter('uShoreSize',shore.pixels);
  material.setParameter('uMeadow',meadow);material.setParameter('uCobble',cobble);material.setParameter('uPave[0]',tones);
  material.update();
  return material;
}

// Field boulders: faceted grey stone, darker at the foot, moss on the faces turned to the sky.
const rockPS=`
uniform vec3 material_diffuse;
float rHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float rNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(mix(rHash(i),rHash(i+vec3(1,0,0)),f.x),mix(rHash(i+vec3(0,1,0)),rHash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(rHash(i+vec3(0,0,1)),rHash(i+vec3(1,0,1)),f.x),mix(rHash(i+vec3(0,1,1)),rHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void getAlbedo(){
  vec3 p=vPositionW;float n=rNoise(p*2.6)*0.6+rNoise(p*7.0)*0.4,facet=rHash(floor(p*1.7));
  vec3 stone=mix(vec3(0.075,0.08,0.07),vec3(0.17,0.175,0.15),n)*(0.8+0.4*facet);
  stone*=mix(0.62,1.0,smoothstep(0.0,0.55,p.y));
  float moss=smoothstep(0.5,0.85,dVertexNormalW.y+(rNoise(p*3.3)-0.5)*0.5);
  dAlbedo=mix(stone,vec3(0.07,0.12,0.035)*(0.8+0.4*n),moss*0.85)*material_diffuse;
}`;
export function makeRock(material){
  material.shaderChunksVersion='2.22';material.diffuseMap=null;material.diffuse.set(1,1,1);material.flatShading=true;
  material.getShaderChunks(SHADERLANGUAGE_GLSL).set('diffusePS',rockPS);material.update();return material;
}
