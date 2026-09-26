import {SHADERLANGUAGE_GLSL} from 'playcanvas';

// Foliage sways with the height of each vertex: roots stay planted, crowns move.
// Geometry is baked in world space, so the phase comes from where each plant stands.
const transformVS=`
#ifdef PIXELSNAP
uniform vec4 uScreenSize;
#endif
#ifdef SCREENSPACE
uniform float projectionFlipY;
#endif
uniform float uWindTime;
uniform float uWindStrength;
uniform float uWindHeight;
vec4 evalWorldPosition(vec3 vertexPosition, mat4 modelMatrix) {
  vec3 localPos = getLocalPosition(vertexPosition);
  vec4 posW = modelMatrix * vec4(localPos, 1.0);
  float h = clamp(posW.y / uWindHeight, 0.0, 1.5);
  float phase = posW.x * 0.21 + posW.z * 0.17;
  float gust = 0.6 + 0.4 * sin(uWindTime * 0.37 + posW.x * 0.03);
  float sway = (sin(uWindTime * 1.3 + phase) * 0.7 + sin(uWindTime * 2.9 + phase * 1.7) * 0.3) * gust;
  posW.x += sway * uWindStrength * h * h;
  posW.z += cos(uWindTime * 1.1 + phase) * uWindStrength * 0.35 * h * h;
  return posW;
}
vec4 getPosition() {
  dModelMatrix = getModelMatrix();
  vec4 posW = evalWorldPosition(vertex_position.xyz, dModelMatrix);
  dPositionW = posW.xyz;
  return matrix_viewProjection * posW;
}
vec3 getWorldPosition() {
  return dPositionW;
}
`;

const KINDS={tree:{strength:.12,height:9},plant:{strength:.07,height:1.4}};
export function windKind(texture){
  if(/^tree\d$/.test(texture||''))return 'tree';
  if(['foliage','fern','bank0','bank1','bank2'].includes(texture))return 'plant';
  return null;
}
export function makeWind(material,kind){
  material.shaderChunksVersion='2.22';
  material.getShaderChunks(SHADERLANGUAGE_GLSL).set('transformVS',transformVS);
  material.setParameter('uWindStrength',KINDS[kind].strength);material.setParameter('uWindHeight',KINDS[kind].height);material.setParameter('uWindTime',0);
  material.update();return material;
}
export function updateWind(materials,time,reduced){
  for(const m of materials)m.setParameter('uWindTime',reduced?0:time);
}
