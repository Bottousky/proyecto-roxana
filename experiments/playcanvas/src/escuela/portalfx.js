import {SHADERLANGUAGE_GLSL,StandardMaterial,Color,BLEND_NORMAL,CULLFACE_NONE} from 'playcanvas';

// The portal of each workshop: the same spiral as Ohmdal's Portal Ω, tinted by its
// world. `uAwake` 0..1 goes from a slow ember to a full vortex.
const emissivePS=`
uniform float uPortalTime;
uniform float uAwake;
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uBright;
void getEmission(){
  vec2 p=(vUv0-0.5)*2.0;float r=length(p),a=atan(p.y,p.x),t=uPortalTime;
  float arm=pow(sin(a*3.0+log(r+0.05)*6.0-t*0.9)*0.5+0.5,3.0);
  float arm2=pow(sin(-a*2.0+log(r+0.05)*4.0+t*0.6)*0.5+0.5,4.0);
  vec3 col=mix(uDeep,uMid,smoothstep(0.0,0.9,r));
  col+=uBright*(arm*0.55+arm2*0.3)*smoothstep(0.05,0.6,r)*(0.25+0.75*uAwake);
  col+=uBright*smoothstep(0.78,0.97,r)*(0.35+0.55*uAwake);
  col+=vec3(1.0)*(1.0-smoothstep(0.0,0.18,r))*(0.08+0.2*uAwake)*(0.8+0.2*sin(t*1.7));
  dEmission=col*(0.35+0.5*uAwake);
}`;
const opacityPS=`
void getOpacity(){vec2 p=(vUv0-0.5)*2.0;dAlpha=(1.0-smoothstep(0.96,1.0,length(p)))*0.94;}`;

const lin=h=>[1,3,5].map(i=>Math.pow(parseInt(h.slice(i,i+2),16)/255,2.2));
export const PORTAL_COLORS={
  ohmdal:['#04121f','#135c6e','#8cf2f5'],
  physica:['#1c0802','#7a3410','#ffcf7a'],
  bitland:['#0a0620','#3a2a8a','#b7a4ff'],
  arithmos:['#021408','#155c34','#9cf5bf'],
};
export function makeWorldPortal(texture,world){
  const m=new StandardMaterial();m.diffuse=new Color(0,0,0);m.emissive=new Color(1,1,1);m.emissiveMap=texture;m.opacityMap=texture;
  m.blendType=BLEND_NORMAL;m.depthWrite=false;m.cull=CULLFACE_NONE;m.useLighting=false;m.shaderChunksVersion='2.22';
  const chunks=m.getShaderChunks(SHADERLANGUAGE_GLSL);chunks.set('emissivePS',emissivePS);chunks.set('opacityPS',opacityPS);
  const [d,mid,b]=PORTAL_COLORS[world].map(lin);
  m.setParameter('uPortalTime',0);m.setParameter('uAwake',0);m.setParameter('uDeep',d);m.setParameter('uMid',mid);m.setParameter('uBright',b);
  m.noShadow=true;m.update();return m;
}
