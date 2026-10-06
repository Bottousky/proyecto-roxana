// The rock of Physica: sedimentary strata cut like a geological model. Colour comes from
// world height (bands warped by noise), so every block, near or far, reads as the same
// layered ground. Tops carry soil and moss. Front faces are displaced per band so the
// strata stand out as ledges in silhouette; displacement never moves a walkable top.
import * as THREE from 'three';

export const PALETTE = {
  strata: ['#c47a55', '#d9aa7c', '#b46d4b', '#cf9265', '#e2c39a', '#bc7b57', '#a9654a', '#d4a375'],
  moss: '#7f9a52', mossDeep: '#526f3b', soil: '#8a5a3c',
};

// Noise is precomputed once into a tileable RGBA texture (four fBm octaves of value noise
// at different base frequencies per channel) and sampled by world position on the face's
// dominant plane. Evaluating fBm per fragment cost ~10 ms/frame on an M2 at 720p.
let noiseTex = null;
export function noiseTexture(size = 512) {
  if (noiseTex) return noiseTex;
  const data = new Uint8Array(size * size * 4);
  const lattice = (f, seed) => {
    const n = Array.from({ length: f * f }, (_, i) => hash(i * 7919 + seed * 104729));
    return (x, y) => {
      const X = x * f, Y = y * f, i = Math.floor(X), j = Math.floor(Y), u = X - i, v = Y - j;
      const s = t => t * t * (3 - 2 * t), a = n[((j % f) * f + (i % f))], b = n[((j % f) * f + ((i + 1) % f))];
      const c = n[(((j + 1) % f) * f + (i % f))], d = n[(((j + 1) % f) * f + ((i + 1) % f))];
      return (a * (1 - s(u)) + b * s(u)) * (1 - s(v)) + (c * (1 - s(u)) + d * s(u)) * s(v);
    };
  };
  const chans = [4, 8, 16, 32].map((base, c) => [0, 1, 2, 3, 4].map(o => lattice(base << o, c * 10 + o)));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    for (let c = 0; c < 4; c++) {
      let v = 0, a = 0.5, t = 0;
      for (let o = 0; o < 5; o++) { v += a * chans[c][o](x / size, y / size); t += a; a *= 0.5; }
      data[(y * size + x) * 4 + c] = Math.round(v / t * 255);
    }
  }
  noiseTex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
  noiseTex.magFilter = THREE.LinearFilter; noiseTex.minFilter = THREE.LinearMipmapLinearFilter; noiseTex.generateMipmaps = true;
  noiseTex.needsUpdate = true;
  return noiseTex;
}

function colorArray(list) { return list.map(c => new THREE.Color(c)); }

/** MeshStandardMaterial whose albedo is the strata function of world position. */
let strataTex = null;
/** The painted strata detail (art-source/physica/strata-albedo-v1.png, see art/PROCEDENCIA.md). */
export function strataTexture() {
  if (strataTex) return strataTex;
  strataTex = new THREE.TextureLoader().load(import.meta.env.BASE_URL + 'textures/strata-1024.jpg');
  strataTex.wrapS = strataTex.wrapT = THREE.RepeatWrapping;   // per-bed offsets hide repeats (mirroring made chevrons)
  strataTex.colorSpace = THREE.SRGBColorSpace;
  strataTex.anisotropy = 8;
  return strataTex;
}

// Where water touches rock (pools, landings, the foot of falls): darker and glossier.
// Boxes in world coordinates [x0,y0,z0, x1,y1,z1]; set by the scene with setWetZones().
const WET_MAX = 8;
const wetMin = Array.from({ length: WET_MAX }, () => new THREE.Vector3(1e5, 1e5, 1e5));
const wetMax = Array.from({ length: WET_MAX }, () => new THREE.Vector3(1e5, 1e5, 1e5));
export function setWetZones(boxes) {
  boxes.slice(0, WET_MAX).forEach((b, i) => { wetMin[i].set(b[0], b[1], b[2]); wetMax[i].set(b[3], b[4], b[5]); });
}

export function rockMaterial({ fogFade = 0, mossAmount = 1, tint = '#ffffff', shade = 0, shadeColor = '#6e5652', detail = 1 } = {}) {
  const m = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.92, metalness: 0 });
  const strata = colorArray(PALETTE.strata);
  m.onBeforeCompile = sh => {
    sh.uniforms.uStrata = { value: strata };
    sh.uniforms.uNoise = { value: noiseTexture() };
    sh.uniforms.uDetail = { value: strataTexture() };
    sh.uniforms.uDetailAmt = { value: detail };
    sh.uniforms.uBands = { value: BANDS };
    sh.uniforms.uWetMin = { value: wetMin };
    sh.uniforms.uWetMax = { value: wetMax };
    sh.uniforms.uMoss = { value: new THREE.Color(PALETTE.moss) };
    sh.uniforms.uMossDeep = { value: new THREE.Color(PALETTE.mossDeep) };
    sh.uniforms.uSoil = { value: new THREE.Color(PALETTE.soil) };
    sh.uniforms.uMossAmount = { value: mossAmount };
    sh.uniforms.uFade = { value: fogFade };
    sh.uniforms.uShade = { value: shade };
    sh.uniforms.uShadeCol = { value: new THREE.Color(shadeColor) };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aTop;\nattribute float aAxis;\nvarying vec3 vWPos;\nvarying vec3 vWNor;\nvarying float vTop;\nvarying float vAxis;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos=(modelMatrix*vec4(transformed,1.)).xyz;\nvWNor=normalize(mat3(modelMatrix)*objectNormal);\nvTop=aTop;\nvAxis=aAxis;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vWPos; varying vec3 vWNor; varying float vTop; varying float vAxis;
uniform vec3 uStrata[8]; uniform vec3 uMoss,uMossDeep,uSoil;
uniform float uMossAmount,uFade,uShade,uDetailAmt; uniform vec3 uShadeCol;
uniform sampler2D uNoise; uniform sampler2D uDetail;
uniform vec3 uWetMin[${WET_MAX}]; uniform vec3 uWetMax[${WET_MAX}];
float hDetail; float wetness;
${BAND_GLSL}
vec3 perturbBump(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float fd){
  vec3 sx=normalize(dFdx(surf_pos)), sy=normalize(dFdy(surf_pos)), n=surf_norm;
  vec3 r1=cross(sy,n), r2=cross(n,sx); float det=dot(sx,r1)*fd;
  vec3 grad=sign(det)*(dHdxy.x*r1+dHdxy.y*r2);
  return normalize(abs(det)*n-grad);
}`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', /* glsl */`
        vec3 P=vWPos; vec3 N=normalize(vWNor);
        vec3 aN=abs(N);
        // Project along the face's nominal axis (aAxis); 0 = unknown geometry: dominant normal.
        float axn=floor(vAxis+.5);
        vec2 F=axn==2.?P.xz:axn==1.?P.zy:axn==3.?P.xy:(aN.y>max(aN.x,aN.z)?P.xz:(aN.x>aN.z?P.zy:P.xy));
        // The same bands as the geometry's ledges (bandT is shared with strataRelief).
        float t=bandT(P.x,P.y);
        float layer=floor(t), f=fract(t);
        vec3 base=uStrata[int(floor(bandHash(layer+11.)*7.999))];
        base*=.88+.24*bandHash(layer+3.);
        // Painted detail, high-passed: lamination, pockets and pebbles without its own big bands.
        // Each bed takes a different slice of the painting, so no repeat lines up vertically.
        vec2 du=F/2.4+vec2(bandHash(layer*1.7)*7.3,bandHash(layer*.9)*3.1);
        vec3 dHi=texture(uDetail,du).rgb, dLo=textureLod(uDetail,du,6.).rgb;
        vec3 hi=(dHi-dLo);
        float lum=dot(hi,vec3(.3,.55,.15));
        base=base*(1.+lum*1.6*uDetailAmt)+hi*.25*uDetailAmt;
        hDetail=lum*uDetailAmt;
        // bedding planes: some are marked seams under a lip, the rest are faint
        float strong=step(.45,bandHash(layer*2.9+1.3));
        base*=mix(mix(.88,.7,strong),1.,smoothstep(.0,.04,f));
        base*=1.+.07*strong*smoothstep(.86,.97,f);
        // vertical faces read darker than walkable tops, and darker the deeper below them
        base*=mix(.88,1.,abs(N.y));
        float depth=max(0.,vTop-P.y);
        base*=mix(1.,.58,smoothstep(.6,7.,depth));
        // tops: soil with moss patches, only on surfaces that really face up
        float grain=texture2D(uNoise,F*.22).g;
        // only the block's real walkable top: the narrow ledge tops inside a face stay rock
        float up=smoothstep(.78,.92,N.y)*(1.-smoothstep(.06,.2,depth));
        float mossN=texture2D(uNoise,P.xz*.07+.5).a;
        vec3 top=mix(uSoil*(.85+.3*grain),mix(uMossDeep,uMoss,grain),smoothstep(.42,.55,mossN)*uMossAmount);
        top*=1.+lum*.8;
        vec3 col=mix(base,top,up);
        // faces under an overhang sit in shadow
        col*=mix(1.,.55,smoothstep(.3,.9,-N.y));
        wetness=0.;
        for(int i=0;i<${WET_MAX};i++){
          vec3 d=max(uWetMin[i]-P,P-uWetMax[i]);
          // rounded distance outside the box (no rectangular stains)
          float out_=length(max(d,0.))+min(max(max(d.x,d.y),d.z),0.);
          wetness=max(wetness,1.-smoothstep(-.05,.35,out_));
        }
        wetness*=.75+.25*texture2D(uNoise,F*.9+.2).r;
        col*=mix(1.,.62,wetness);
        col=mix(col,uShadeCol*(.8+.4*grain),uShade);
        col=mix(col,vec3(.93,.80,.68),uFade);
        vec4 diffuseColor=vec4(col*diffuse,opacity);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor*=mix(1.,.38,wetness);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        normal=perturbBump(-vViewPosition, normal, vec2(dFdx(hDetail), dFdy(hDetail))*.9*uDetailAmt, faceDirection);`);
  };
  m.customProgramCacheKey = () => `rock4-${fogFade}-${mossAmount}-${shade}-${detail}`;
  return m;
}

function hash(n) { n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
function vnoise1(x, seed) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i * 7919 + seed) * (1 - u) + hash((i + 1) * 7919 + seed) * u; }

// One band function for geometry and colour, written identically in JS and GLSL (BAND_GLSL):
// the ledges the eye sees are the colour bands. t(y, x) increases ~1.1 per metre with a slow
// thickness variation and a gentle warp along x.
const fract = v => v - Math.floor(v);
export const bandHash = n => fract(Math.sin(n * 12.9898 + 4.1414) * 43758.5453);
// Bed thicknesses are drawn from a table, not a constant pitch: packets of thin beds alternate
// with massive banks, as in real sedimentary sections. Boundaries cover y ∈ [−14, 18].
export const BAND_COUNT = 64;
export const BANDS = (() => {
  const out = [-14]; let i = 0, y = -14;
  while (out.length < BAND_COUNT) {
    const r = bandHash(i * 1.37 + 0.5), packet = bandHash(Math.floor(i / 4) * 2.11) < 0.45;
    y += packet ? 0.18 + r * 0.32 : 0.7 + r * 1.7;
    out.push(y); i++;
  }
  return out;
})();
const warpX = x => 0.18 * Math.sin(0.21 * x + 0.7) + 0.1 * Math.sin(0.53 * x + 2.1) + 0.05 * Math.sin(1.37 * x + 4.0);
/** Band coordinate: integer part = bed index, fraction = position inside the bed. */
export function bandT(x, y) {
  const yy = y + warpX(x);
  let lo = 0, hi = BAND_COUNT - 1;
  if (yy <= BANDS[0]) return 20 + (yy - BANDS[0]);
  if (yy >= BANDS[hi]) return 20 + hi + (yy - BANDS[hi]);
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (BANDS[mid] <= yy) lo = mid; else hi = mid; }
  return 20 + lo + (yy - BANDS[lo]) / (BANDS[lo + 1] - BANDS[lo]);
}
const BAND_GLSL = /* glsl */`
uniform float uBands[${BAND_COUNT}];
float bandHash(float n){return fract(sin(n*12.9898+4.1414)*43758.5453);}
float bandT(float x,float y){
  float yy=y+.18*sin(.21*x+.7)+.1*sin(.53*x+2.1)+.05*sin(1.37*x+4.);
  if(yy<=uBands[0]) return 20.+(yy-uBands[0]);
  if(yy>=uBands[${BAND_COUNT - 1}]) return 20.+${BAND_COUNT - 1}.+(yy-uBands[${BAND_COUNT - 1}]);
  int lo=0, hi=${BAND_COUNT - 1};
  for(int k=0;k<7;k++){ if(hi-lo<=1) break; int mid=(lo+hi)/2; if(uBands[mid]<=yy) lo=mid; else hi=mid; }
  return 20.+float(lo)+(yy-uBands[lo])/(uBands[lo+1]-uBands[lo]);
}`;

/**
 * Relief of a strata front: each band is a slab at its own depth, its top edge overhangs a
 * little (a lip that casts a thin shadow line), its bottom edge is bevelled back, and vertical
 * joints are staggered band to band like masonry. Displacement in metres along the face normal.
 */
export function strataRelief(x, y, seed = 1) {
  const t = bandT(x, y), layer = Math.floor(t), f = t - layer;
  const slab = (bandHash(layer + seed * 7.3) - 0.5) * 0.32;
  // Not every bedding plane is an overhang: some are, the rest are flush.
  const strong = bandHash(layer * 2.9 + 1.3) > 0.45;
  const lip = strong && f > 0.82 ? Math.min(1, (f - 0.82) / 0.08) * 0.07 : 0;
  const bevel = strong && f < 0.1 ? -(1 - f / 0.1) * 0.06 : 0;
  const joints = 2.6 + bandHash(layer * 3.1 + seed) * 2.2;
  const jx = fract((x + bandHash(layer * 5.7 + seed) * 9) / joints);
  const joint = jx < 0.018 ? -0.09 : jx < 0.03 ? -0.04 : 0;
  const grain = (vnoise1(x * 2.3 + layer * 3.1, seed) - 0.5) * 0.05;
  return slab + lip + bevel + joint + grain;
}

/**
 * A block of rock: walkable top exactly at y1; front (+z) and the given side faces carry
 * strata relief. Returns a BufferGeometry in world coordinates.
 */
export function strataBlock({ x0, x1, y0, y1, z0, z1, seed = 1, sides = ['w', 'e'], step = 0.15, rim = 0.12, topRef = null }) {
  const pos = [], idx = [], axis = [];
  const push = (x, y, z) => { pos.push(x, y, z); return pos.length / 3 - 1; };
  // Each grid is wound so its normals face `out` (outward from the rock).
  // aAxis (1 + nominal axis of the face: 0 x, 1 y, 2 z) lets the shader project detail along
  // the face's own axis instead of the displaced per-fragment normal (no stretched streaks).
  const grid = (nu, nv, fn, out) => {
    const base = pos.length / 3;
    const ax = 1 + (Math.abs(out[1]) > 0.8 ? 1 : Math.abs(out[0]) > 0.8 ? 0 : 2);
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const p = fn(i / nu, j / nv); push(p[0], p[1], p[2]); axis.push(ax); }
    const P = k => [pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]];
    const a0 = P(base), b0 = P(base + 1), c0 = P(base + nu + 1);
    const u = [b0[0] - a0[0], b0[1] - a0[1], b0[2] - a0[2]], v = [c0[0] - a0[0], c0[1] - a0[1], c0[2] - a0[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const flip = n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0;
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = base + j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1;
      if (flip) idx.push(a, d, b, a, c, d); else idx.push(a, b, d, a, d, c);
    }
  };
  const nx = Math.max(2, Math.ceil((x1 - x0) / step)), ny = Math.max(2, Math.ceil((y1 - y0) / (step * 0.42)));
  const nz = Math.max(2, Math.ceil((z1 - z0) / step));
  // Top: flat, with a rounded rim falling to the front relief.
  grid(nx, nz, (u, v) => [x0 + (x1 - x0) * u, y1, z0 + (z1 - z0 - rim) * v], [0, 1, 0]);
  grid(nx, 2, (u, v) => {
    const x = x0 + (x1 - x0) * u, a = v * Math.PI / 2;
    const r = strataRelief(x, y1 - rim, seed);
    return [x, y1 - rim + Math.cos(a) * rim, z1 - rim + Math.sin(a) * (rim + Math.max(0, r))];
  }, [0, 0.7, 0.7]);
  // Front: displaced along z.
  grid(nx, ny, (u, v) => {
    const x = x0 + (x1 - x0) * u, y = y1 - rim - (y1 - rim - y0) * v;
    const edge = Math.min(u, 1 - u) * (x1 - x0);
    const fade = Math.min(1, edge / 0.25);
    return [x, y, z1 + Math.max(-0.2, strataRelief(x, y, seed)) * fade];
  }, [0, 0, 1]);
  // Sides: displaced into the rock only (never into the play space).
  const side = (x, dir) => grid(nz, ny, (u, v) => {
    const z = z0 + (z1 - z0) * u, y = y1 - (y1 - y0) * v;
    const near = Math.min(1, (y1 - y) / 0.15);
    return [x - dir * Math.abs(strataRelief(z * 1.3 + x, y, seed + 9)) * 0.5 * near, y, z];
  }, [dir, 0, 0]);
  if (sides.includes('w')) side(x0, -1);
  if (sides.includes('e')) side(x1, 1);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  // Height of the block's walkable top, per vertex: faces darken with depth below it.
  g.setAttribute('aTop', new THREE.Float32BufferAttribute(new Float32Array(pos.length / 3).fill(topRef ?? y1), 1));
  g.setAttribute('aAxis', new THREE.Float32BufferAttribute(axis, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A distant mesa silhouette profile extruded thinly; strata colour still applies. */
export function mesaShape(points, z, depth = 2) {
  const s = new THREE.Shape();
  s.moveTo(points[0][0], points[0][1]);
  for (const p of points.slice(1)) s.lineTo(p[0], p[1]);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(0, 0, z - depth);
  return g;
}
