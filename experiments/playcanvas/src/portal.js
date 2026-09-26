import {SHADERLANGUAGE_GLSL,StandardMaterial,Color,BLEND_NORMAL,CULLFACE_NONE} from 'playcanvas';

// The Portal Ω surface: a slow spiral of light that brightens toward the rim, as in
// the source renderer's shader (which the scene export cannot carry over).
const emissivePS=`
uniform float uPortalTime;
void getEmission(){
  vec2 p=(vUv0-0.5)*2.0;float r=length(p),a=atan(p.y,p.x),t=uPortalTime;
  // Two counter-rotating spiral arms over a deep centre that brightens to a luminous rim.
  float arm=pow(sin(a*3.0+log(r+0.05)*6.0-t*0.9)*0.5+0.5,3.0);
  float arm2=pow(sin(-a*2.0+log(r+0.05)*4.0+t*0.6)*0.5+0.5,4.0);
  vec3 deep=vec3(0.02,0.07,0.16),mid=vec3(0.08,0.36,0.52),bright=vec3(0.55,0.95,0.98);
  vec3 col=mix(deep,mid,smoothstep(0.0,0.9,r));
  col+=bright*(arm*0.55+arm2*0.3)*smoothstep(0.05,0.6,r);
  col+=bright*smoothstep(0.78,0.97,r)*0.9;
  col+=vec3(0.9,1.0,1.0)*(1.0-smoothstep(0.0,0.18,r))*(0.25+0.15*sin(t*1.7));
  dEmission=col*0.78;
}`;
const opacityPS=`
void getOpacity(){vec2 p=(vUv0-0.5)*2.0;dAlpha=(1.0-smoothstep(0.96,1.0,length(p)))*0.94;}`;

export function makePortalSurface(texture){
  const m=new StandardMaterial();m.diffuse=new Color(0,0,0);m.emissive=new Color(1,1,1);m.emissiveMap=texture;m.opacityMap=texture;
  m.blendType=BLEND_NORMAL;m.depthWrite=false;m.cull=CULLFACE_NONE;m.useLighting=false;m.shaderChunksVersion='2.22';
  const chunks=m.getShaderChunks(SHADERLANGUAGE_GLSL);chunks.set('emissivePS',emissivePS);chunks.set('opacityPS',opacityPS);
  m.setParameter('uPortalTime',0);m.update();return m;
}
