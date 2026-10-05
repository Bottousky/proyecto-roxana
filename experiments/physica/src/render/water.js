// Water is drawn from the field, not authored as an effect. Each fall or arch is the path
// a parcel follows from its lip under the same field the bodies feel (ballisticPath), and
// every vertex stores the parcel's travel time `aT`. The shader scrolls its pattern by
// (aT − time), so streaks move exactly at the parcel's speed: they stretch where the water
// is fast and bunch at the crest where it slows. Thickness follows continuity (∝ 1/speed).
import * as THREE from 'three';
import { ballisticPath } from '../sim/world.js';

const VERT = /* glsl */`
attribute float aT; attribute float aAcross; attribute float aFoam; attribute float aEdge;
varying float vT; varying float vAcross; varying float vFoam; varying float vEdge;
varying vec3 vN; varying vec3 vW;
#include <fog_pars_vertex>
void main(){
  vT=aT; vAcross=aAcross; vFoam=aFoam; vEdge=aEdge;
  vN=normalize(mat3(modelMatrix)*normal);
  vec4 wp=modelMatrix*vec4(position,1.); vW=wp.xyz;
  vec4 mvPosition=viewMatrix*wp;
  gl_Position=projectionMatrix*mvPosition;
  #include <fog_vertex>
}`;

const FRAG = /* glsl */`
uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uFoamCol; uniform vec3 uSun; uniform float uOpacity; uniform float uStreak;
varying float vT; varying float vAcross; varying float vFoam; varying float vEdge;
varying vec3 vN; varying vec3 vW;
#include <fog_pars_fragment>
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
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
  vec3 col=mix(uShallow,uDeep,body*.65);
  col+=streak*.22*vec3(.8,1.,1.);
  // foam: at lips and impacts (aFoam) and along torn edges
  float fn=vn(vec2(vAcross*9.,ph*9.))*.6+vn(vec2(vAcross*23.,ph*21.))*.4;
  float foam=clamp(vFoam*1.2+vEdge*.55,0.,1.);
  foam=smoothstep(.35,.75,foam*(.55+fn*.8));
  col=mix(col,uFoamCol,foam);
  float diff=.62+.38*max(dot(N,normalize(uSun)),0.);
  vec3 R=reflect(-normalize(uSun),N);
  float spec=pow(max(dot(R,V),0.),36.)*(1.-foam);
  col=col*diff+spec*.9+fres*.25*vec3(.85,.95,1.);
  float a=uOpacity*mix(.78,1.,max(foam,fres));
  gl_FragColor=vec4(col,a);
  #include <fog_fragment>
}`;

export function waterMaterial({ deep = '#16707a', shallow = '#4cc3c0', foam = '#f3fbf7', opacity = 0.9, streak = 1 } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTime: { value: 0 }, uDeep: { value: new THREE.Color(deep) }, uShallow: { value: new THREE.Color(shallow) },
      uFoamCol: { value: new THREE.Color(foam) }, uSun: { value: new THREE.Vector3(-0.5, 0.8, 0.45) },
      uOpacity: { value: opacity }, uStreak: { value: streak },
    }]),
  });
}

/**
 * Tube of water along a 2D path in the xy-plane, centred at depth zc. Cross-section is an
 * ellipse: `thick` across the path in xy (scaled by v0/v), `wide` along z.
 */
export function waterTube(path, { zc, thick, wide, segs = 14, foamStart = 0.25, foamEnd = 0.35, spread = 0.15 }) {
  const pos = [], nor = [], aT = [], aAcross = [], aFoam = [], aEdge = [], idx = [];
  const v0 = Math.hypot(path[0].vx, path[0].vy) || 1, T = path[path.length - 1].t;
  path.forEach((p, i) => {
    const q = path[Math.min(path.length - 1, i + 1)], o = path[Math.max(0, i - 1)];
    let tx = q.x - o.x, ty = q.y - o.y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const nx = -ty, ny = tx, sp = Math.hypot(p.vx, p.vy) || v0;
    const h = thick * Math.min(1.6, Math.max(0.35, v0 / sp)) / 2;
    const w = wide / 2 * (1 + spread * p.t / Math.max(T, 1e-3));
    const foam = Math.max(1 - p.t / foamStart, 0) + Math.max(1 - (T - p.t) / foamEnd, 0);
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
export function waterSheet({ x0, x1, y, z0, z1, speed, foamAt = [], tOffset = 0 }) {
  const nx = Math.max(2, Math.ceil((x1 - x0) / 0.3)), nz = 6;
  const pos = [], nor = [], aT = [], aAcross = [], aFoam = [], aEdge = [], idx = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = x0 + (x1 - x0) * i / nx, v = j / nz, z = z0 + (z1 - z0) * v;
    pos.push(x, y, z); nor.push(0, 1, 0);
    aT.push(tOffset + (x - x0) / speed); aAcross.push(v * 2 - 1);
    let f = 0; for (const fa of foamAt) f = Math.max(f, 1 - Math.abs(x - fa.x) / fa.r);
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

/** Path of a parcel leaving (x,y) at (vx,vy) until `until(p)` holds, under `field`. */
export function fieldPath(field, x, y, vx, vy, until, every = 3) {
  const all = ballisticPath(field, x, y, vx, vy, { steps: 2400, every });
  const out = [];
  for (const p of all) { out.push(p); if (out.length > 2 && until(p)) break; }
  return out;
}
