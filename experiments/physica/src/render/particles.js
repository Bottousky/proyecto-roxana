// Spray, pollen and mist are integrated in the same field as everything else, with air
// drag (a medium effect, kept separate from the field): a = g(x,y) − k·v. Pollen with
// strong drag rises through the region, overshoots its top and settles where the field
// changes sign — a drifting line that marks the boundary by behaviour. Spray thrown off the
// arch fans out along the same curve as the water. These are representation only; no
// experimental body depends on them.
import * as THREE from 'three';

const VERT = /* glsl */`
attribute float aSize; attribute float aAlpha; attribute vec3 aColor;
varying float vAlpha; varying vec3 vColor;
uniform float uScale;
#include <fog_pars_vertex>
void main(){
  vAlpha=aAlpha; vColor=aColor;
  vec4 mvPosition=modelViewMatrix*vec4(position,1.);
  gl_PointSize=aSize*uScale/-mvPosition.z;
  gl_Position=projectionMatrix*mvPosition;
  #include <fog_vertex>
}`;
const FRAG = /* glsl */`
varying float vAlpha; varying vec3 vColor;
#include <fog_pars_fragment>
void main(){
  vec2 c=gl_PointCoord-.5; float d=length(c);
  float a=smoothstep(.5,.15,d)*vAlpha;
  if(a<.01) discard;
  gl_FragColor=vec4(vColor,a);
  #include <fog_fragment>
}`;

export class Particles {
  constructor(field, max = 1400) {
    this.field = field; this.max = max; this.n = 0;
    this.p = new Float32Array(max * 3); this.v = new Float32Array(max * 3);
    this.life = new Float32Array(max); this.age = new Float32Array(max);
    this.size = new Float32Array(max); this.alpha = new Float32Array(max); this.base = new Float32Array(max);
    this.col = new Float32Array(max * 3); this.drag = new Float32Array(max);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setDrawRange(0, 0);
    this.geometry = g;
    this.material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uScale: { value: 600 } }]) });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    this._a = { x: 0, y: 0 };
    this.emitters = [];
    this.seed = 12345;
  }

  rnd() { this.seed = (this.seed * 16807) % 2147483647; return this.seed / 2147483647; }

  spawn({ x, y, z, vx = 0, vy = 0, vz = 0, life = 2, size = 0.1, alpha = 0.8, color = [1, 1, 1], drag = 0.5 }) {
    let i = this.n < this.max ? this.n++ : -1;
    if (i < 0) { // reuse the oldest-by-fraction
      let best = 0, bf = -1;
      for (let k = 0; k < this.max; k++) { const f = this.age[k] / this.life[k]; if (f > bf) { bf = f; best = k; } }
      i = best;
    }
    this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z;
    this.v[i * 3] = vx; this.v[i * 3 + 1] = vy; this.v[i * 3 + 2] = vz;
    this.life[i] = life; this.age[i] = 0; this.size[i] = size; this.base[i] = alpha; this.drag[i] = drag;
    this.col[i * 3] = color[0]; this.col[i * 3 + 1] = color[1]; this.col[i * 3 + 2] = color[2];
  }

  addEmitter(e) { this.emitters.push({ acc: 0, ...e }); }

  update(dt) {
    for (const e of this.emitters) {
      e.acc += e.rate * dt;
      while (e.acc >= 1) { e.acc -= 1; this.spawn(e.make(this)); }
    }
    const a = this._a;
    for (let i = 0; i < this.n; i++) {
      this.age[i] += dt;
      if (this.age[i] >= this.life[i]) { this.kill(i); i--; continue; }
      const k = i * 3, d = this.drag[i];
      this.field.at(this.p[k], this.p[k + 1], a);
      this.v[k] += (a.x - d * this.v[k]) * dt;
      this.v[k + 1] += (a.y - d * this.v[k + 1]) * dt;
      this.v[k + 2] += (-d * this.v[k + 2]) * dt;
      this.p[k] += this.v[k] * dt; this.p[k + 1] += this.v[k + 1] * dt; this.p[k + 2] += this.v[k + 2] * dt;
      const f = this.age[i] / this.life[i];
      this.alpha[i] = this.base[i] * Math.min(1, f * 6) * Math.min(1, (1 - f) * 3);
    }
    const g = this.geometry;
    g.setDrawRange(0, this.n);
    for (const n of ['position', 'aSize', 'aAlpha', 'aColor']) g.attributes[n].needsUpdate = true;
  }

  kill(i) {
    const j = --this.n;
    if (i === j) return;
    for (const [arr, s] of [[this.p, 3], [this.v, 3], [this.col, 3], [this.life, 1], [this.age, 1], [this.size, 1], [this.alpha, 1], [this.base, 1], [this.drag, 1]])
      for (let c = 0; c < s; c++) arr[i * s + c] = arr[j * s + c];
  }

  burst(n, make) { for (let i = 0; i < n; i++) this.spawn(make(this)); }
}
