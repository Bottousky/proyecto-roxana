// Water is drawn from the field, not authored as an effect. Each fall or arch is the path
// a parcel follows from its lip under the same field the bodies feel (ballisticPath), and
// every vertex stores the parcel's travel time `aT`. The shader scrolls its pattern by
// (aT − time), so streaks move exactly at the parcel's speed: they stretch where the water
// is fast and bunch at the crest where it slows. Thickness follows continuity (∝ 1/speed).
import * as THREE from 'three';
import { ballisticPath } from '../sim/world.js';

const NOISE = /* glsl */`
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
`;

// The surface carries waves that travel with the water (they are functions of aT − time), so
// the wobble, like the streaks, moves at the parcel's own speed.
const VERT = /* glsl */`
attribute float aT; attribute float aAcross; attribute float aFoam; attribute float aEdge;
uniform float uTime; uniform float uWobble;
varying float vT; varying float vAcross; varying float vFoam; varying float vEdge;
varying vec3 vN; varying vec3 vW;
#include <fog_pars_vertex>
${NOISE}
void main(){
  vT=aT; vAcross=aAcross; vFoam=aFoam; vEdge=aEdge;
  vN=normalize(mat3(modelMatrix)*normal);
  float ph=aT-uTime;
  float wob=(vn(vec2(aAcross*2.3+7.,ph*5.))-.5)*1.4+(vn(vec2(aAcross*6.1,ph*13.))-.5)*.6;
  vec3 p=position+normal*wob*uWobble;
  vec4 wp=modelMatrix*vec4(p,1.); vW=wp.xyz;
  vec4 mvPosition=viewMatrix*wp;
  gl_Position=projectionMatrix*mvPosition;
  #include <fog_vertex>
}`;

// uVeil = 0: the body of the water. uVeil = 1: a thin outer veil, torn by noise and foamy,
// that gives the stream apparent volume and ragged edges without a fluid simulation.
const FRAG = /* glsl */`
uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uFoamCol; uniform vec3 uSun; uniform float uOpacity; uniform float uStreak; uniform float uVeil;
varying float vT; varying float vAcross; varying float vFoam; varying float vEdge;
varying vec3 vN; varying vec3 vW;
#include <fog_pars_fragment>
${NOISE}
void main(){
  float ph=(vT-uTime);
  // streaks: long along the flow, narrow across it
  float s1=vn(vec2(vAcross*7.,ph*uStreak*3.));
  float s2=vn(vec2(vAcross*17.+3.,ph*uStreak*7.));
  float streak=smoothstep(.45,.95,s1*.65+s2*.45);
  vec3 V=normalize(cameraPosition-vW), N=normalize(vN);
  if(!gl_FrontFacing) N=-N;
  float fres=pow(1.-abs(dot(N,V)),2.2);
  float body=1.-abs(vAcross);
  vec3 col=mix(uShallow,uDeep,body*.7);
  col+=streak*.22*vec3(.8,1.,1.);
  // foam: at lips, crests and impacts (aFoam) and along torn edges
  float fn=vn(vec2(vAcross*9.,ph*9.))*.6+vn(vec2(vAcross*23.,ph*21.))*.4;
  float foam=clamp(vFoam*1.2+vEdge*.55+uVeil*.35,0.,1.);
  foam=smoothstep(.35,.75,foam*(.55+fn*.8));
  col=mix(col,uFoamCol,foam);
  float diff=.62+.38*max(dot(N,normalize(uSun)),0.);
  vec3 R=reflect(-normalize(uSun),N);
  float spec=pow(max(dot(R,V),0.),36.)*(1.-foam);
  col=col*diff+spec*.9+fres*.25*vec3(.85,.95,1.);
  float a=uOpacity*mix(.78,1.,max(foam,fres));
  if(uVeil>0.){
    // the veil exists only in streaks and froth: everything else is torn away, with a soft
    // edge, and it fades at grazing angles so the shell never draws soap-bubble outlines
    float keep=vn(vec2(vAcross*11.+1.,ph*uStreak*6.))*.7+vn(vec2(vAcross*29.,ph*17.))*.3;
    float fr=clamp(vFoam+vEdge*.5,0.,1.);
    float thr=mix(.6,.66,fr);
    a*=mix(.5,.7,fr)*smoothstep(thr-.06,thr+.12,keep)*(1.-.85*fres);
    if(a<.02) discard;
  }
  gl_FragColor=vec4(col,a);
  #include <fog_fragment>
}`;

export function waterMaterial({ deep = '#16707a', shallow = '#4cc3c0', foam = '#f3fbf7', opacity = 0.9, streak = 1, veil = 0, wobble = 0 } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTime: { value: 0 }, uDeep: { value: new THREE.Color(deep) }, uShallow: { value: new THREE.Color(shallow) },
      uFoamCol: { value: new THREE.Color(foam) }, uSun: { value: new THREE.Vector3(-0.5, 0.8, 0.45) },
      uOpacity: { value: opacity }, uStreak: { value: streak }, uVeil: { value: veil }, uWobble: { value: wobble },
    }]),
  });
}

/**
 * Tube of water along a 2D path in the xy-plane, centred at depth zc. Cross-section is an
 * ellipse: `thick` across the path in xy (scaled by v0/v), `wide` along z.
 */
export function waterTube(path, { zc, thick, wide, segs = 14, foamStart = 0.25, foamEnd = 0.35, spread = 0.15, foamAt = [], minScale = 0.6, maxScale = 1.45 }) {
  const pos = [], nor = [], aT = [], aAcross = [], aFoam = [], aEdge = [], idx = [];
  // Continuity: a stream of constant flow is thick where it is slow, thin where it is fast
  // (A·v = const; with the width roughly fixed, thickness ∝ 1/v, softened as √ for the eye).
  const speeds = path.map(p => Math.hypot(p.vx, p.vy)).sort((a, b) => a - b);
  const vRef = speeds[Math.floor(speeds.length / 2)] || 1, T = path[path.length - 1].t;
  path.forEach((p, i) => {
    const q = path[Math.min(path.length - 1, i + 1)], o = path[Math.max(0, i - 1)];
    let tx = q.x - o.x, ty = q.y - o.y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const nx = -ty, ny = tx, sp = Math.max(0.05, Math.hypot(p.vx, p.vy));
    let h = thick * Math.min(maxScale, Math.max(minScale, Math.sqrt(vRef / sp))) / 2;
    // A ribbon thicker than its radius of curvature folds over itself (the crest's elbow):
    // limit the half-thickness to 0.8·R, with R = |v|³ / |v × a| from the path itself.
    const dt = (q.t - o.t) || 1e-3, ax = (q.vx - o.vx) / dt, ay = (q.vy - o.vy) / dt;
    const cross = Math.abs(p.vx * ay - p.vy * ax);
    if (cross > 1e-6) h = Math.min(h, Math.max(0.08, 0.8 * sp ** 3 / cross));
    const w = wide / 2 * (1 + spread * p.t / Math.max(T, 1e-3));
    let foam = Math.max(1 - p.t / foamStart, 0) + Math.max(1 - (T - p.t) / foamEnd, 0);
    for (const fa of foamAt) foam = Math.max(foam, (fa.w ?? 1) * Math.max(0, 1 - Math.abs(p.t - fa.t) / fa.dt));
    for (let k = 0; k <= segs; k++) {
      const phi = (k / segs) * Math.PI * 2, c = Math.cos(phi), s = Math.sin(phi);
      pos.push(p.x + nx * h * c, p.y + ny * h * c, zc + w * s);
      const en = [nx * c / h, ny * c / h, s / w], el = Math.hypot(...en);
      nor.push(en[0] / el, en[1] / el, en[2] / el);
      aT.push(p.t); aAcross.push(s); aFoam.push(Math.min(1, foam)); aEdge.push(Math.pow(Math.abs(c), 6));
    }
  });
  const ring = segs + 1;
  for (let i = 0; i < path.length - 1; i++) for (let k = 0; k < segs; k++) {
    const a = i * ring + k, b = a + 1, c = a + ring, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1));
  g.setAttribute('aAcross', new THREE.Float32BufferAttribute(aAcross, 1));
  g.setAttribute('aFoam', new THREE.Float32BufferAttribute(aFoam, 1));
  g.setAttribute('aEdge', new THREE.Float32BufferAttribute(aEdge, 1));
  g.setIndex(idx);
  return g;
}

/** Flat flowing water (a channel or pool) in the plane y, flowing along +x at `speed`. */
export function waterSheet({ x0, x1, y, z0, z1, speed, foamAt = [], tOffset = 0, radial = null }) {
  const nx = Math.max(2, Math.ceil((x1 - x0) / 0.3)), nz = radial ? 16 : 6;
  const pos = [], nor = [], aT = [], aAcross = [], aFoam = [], aEdge = [], idx = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = x0 + (x1 - x0) * i / nx, v = j / nz, z = z0 + (z1 - z0) * v;
    pos.push(x, y, z); nor.push(0, 1, 0);
    // radial: ripples travel outward from a source (a spring) at `speed`
    const r = radial ? Math.hypot(x - radial.x, z - radial.z) : 0;
    aT.push(radial ? r / speed : tOffset + (x - x0) / speed); aAcross.push(radial ? Math.sin(Math.atan2(z - radial.z, x - radial.x) * 3) : v * 2 - 1);
    let f = 0; for (const fa of foamAt) f = Math.max(f, 1 - (radial ? r : Math.abs(x - fa.x)) / fa.r);
    aFoam.push(f); aEdge.push(Math.pow(Math.abs(v * 2 - 1), 8));
  }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('aT', new THREE.Float32BufferAttribute(aT, 1));
  g.setAttribute('aAcross', new THREE.Float32BufferAttribute(aAcross, 1));
  g.setAttribute('aFoam', new THREE.Float32BufferAttribute(aFoam, 1));
  g.setAttribute('aEdge', new THREE.Float32BufferAttribute(aEdge, 1));
  g.setIndex(idx);
  return g;
}

/** A dome of churning foam where water wells up or lands. */
export function foamMound({ x, y, z, r, h = 0.5 }) {
  const g = new THREE.SphereGeometry(r, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  g.scale(1, h, 1.3); g.translate(x, y, z);
  const n = g.attributes.position.count, aT = new Float32Array(n), aA = new Float32Array(n), aF = new Float32Array(n).fill(1), aE = new Float32Array(n);
  for (let i = 0; i < n; i++) { const py = g.attributes.position.getY(i) - y; aT[i] = -py * 2.2; aA[i] = Math.sin(Math.atan2(g.attributes.position.getZ(i) - z, g.attributes.position.getX(i) - x) * 2); }
  g.setAttribute('aT', new THREE.BufferAttribute(aT, 1)); g.setAttribute('aAcross', new THREE.BufferAttribute(aA, 1));
  g.setAttribute('aFoam', new THREE.BufferAttribute(aF, 1)); g.setAttribute('aEdge', new THREE.BufferAttribute(aE, 1));
  return g;
}

/** Path of a parcel leaving (x,y) at (vx,vy) until `until(p)` holds, under `field`. */
export function fieldPath(field, x, y, vx, vy, until, every = 3, z = 0) {
  const all = ballisticPath(field, x, y, vx, vy, { steps: 2400, every, z });
  const out = [];
  for (const p of all) { out.push(p); if (out.length > 2 && until(p)) break; }
  return out;
}
