import {SHADERLANGUAGE_GLSL,Mat4,Vec3,Vec4} from 'playcanvas';

// Lo que queda entre la cámara y quien juega se abre en una trama fina: copas, aleros y
// muros del primer plano dejan ver la figura sin desaparecer. Sólo se abre lo que está
// claramente más cerca de la cámara que los pies, así el suelo, los puentes y los escalones
// que se pisan nunca se agujerean. Las sombras y la selección no cambian.
const alphaTestPS=`
uniform float alpha_ref;
uniform vec4 uSeeThrough;
uniform vec2 uSeeThroughShape;
uniform vec4 uSeeThroughOhm;
uniform vec2 uSeeThroughOhmShape;
float seeThroughBayer2(vec2 a){a=floor(a);return fract(dot(a,vec2(.5,a.y*.75)));}
float seeThroughBayer4(vec2 a){return seeThroughBayer2(.5*a)*.25+seeThroughBayer2(a);}
// 0 fuera de la cápsula; crece hacia su eje.
float seeThroughOpen(vec4 ends,vec2 shape){
  if(shape.y<=0.0||gl_FragCoord.z>=shape.y)return 0.0;
  vec2 ab=ends.zw-ends.xy,ap=gl_FragCoord.xy-ends.xy;
  float r=length(ap-ab*clamp(dot(ap,ab)/max(dot(ab,ab),1.),0.,1.))/shape.x;
  return r<1.0?1.0-smoothstep(.45,1.,r):0.0;
}
void alphaTest(float a){
  if(a<alpha_ref)discard;
#if !defined(SHADOW_PASS) && !defined(PICK_PASS)
  float open=max(seeThroughOpen(uSeeThrough,uSeeThroughShape),seeThroughOpen(uSeeThroughOhm,uSeeThroughOhmShape));
  if(open>0.0&&seeThroughBayer4(gl_FragCoord.xy)>=mix(1.,.24,open))discard;
#endif
}
`;

// Lo que se pisa o se ve a ras del suelo nunca se abre; tampoco lo translúcido.
const UNDERFOOT=new Set(['ground','cobble','water','bank0','bank1','bank2','fern','workshopRug']);
export function occludes(material){return !UNDERFOOT.has(material.texture)&&material.opacity===1&&!material.glass&&!material.paving;}

export function makeSeeThrough(material){
  if(!material.alphaTest)material.alphaTest=1/255;
  material.shaderChunksVersion='2.22';
  material.getShaderChunks(SHADERLANGUAGE_GLSL).set('alphaTestPS',alphaTestPS);
  material.update();return material;
}

const viewProjection=new Mat4(),clip=new Vec4(),toward=new Vec3(),point=new Vec3();
function project(camera,p,width,height){
  viewProjection.mul2(camera.projectionMatrix,camera.viewMatrix);
  clip.set(p.x,p.y,p.z,1);viewProjection.transformVec4(clip,clip);
  return clip.w>0?[(clip.x/clip.w*.5+.5)*width,(clip.y/clip.w*.5+.5)*height,clip.z/clip.w*.5+.5]:null;
}

// Una cápsula sobre la figura, de los pies a la cabeza, y la profundidad de un punto algo más
// cerca de la cámara que los pies: sólo lo que está por delante de ese punto se abre.
export function seeThroughFrame(camera,cameraPosition,feet,head,width,height,margin=.9){
  const f=project(camera,feet,width,height),h=project(camera,head,width,height);
  if(!f||!h)return null;
  toward.sub2(cameraPosition,feet).normalize().mulScalar(margin);point.add2(feet,toward);
  const near=project(camera,point,width,height);if(!near)return null;
  const tall=Math.max(8,Math.hypot(h[0]-f[0],h[1]-f[1]));
  const at=k=>[f[0]+(h[0]-f[0])*k,f[1]+(h[1]-f[1])*k];
  return {from:at(.18),to:at(.82),radius:tall*.42,depth:near[2]};
}

// Una cápsula por figura: quien juega ('uSeeThrough') y Ohm ('uSeeThroughOhm').
const buffers=new Map();
export function applySeeThrough(device,frame,name='uSeeThrough'){
  if(!buffers.has(name))buffers.set(name,{ends:new Float32Array(4),shape:new Float32Array(2)});
  const {ends,shape}=buffers.get(name);
  shape[0]=frame?.radius||1;shape[1]=frame?.depth||0;
  if(frame){ends.set(frame.from,0);ends.set(frame.to,2);device.scope.resolve(name).setValue(ends);}
  device.scope.resolve(name+'Shape').setValue(shape);
}
