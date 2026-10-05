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
export function noiseTexture(size = 256) {
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
  const chans = [4, 8, 16, 32].map((base, c) => [0, 1, 2, 3].map(o => lattice(base << o, c * 10 + o)));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    for (let c = 0; c < 4; c++) {
      let v = 0, a = 0.5, t = 0;
      for (let o = 0; o < 4; o++) { v += a * chans[c][o](x / size, y / size); t += a; a *= 0.5; }
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
export function rockMaterial({ fogFade = 0, mossAmount = 1, tint = '#ffffff', shade = 0, shadeColor = '#6e5652' } = {}) {
  const m = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.92, metalness: 0 });
  const strata = colorArray(PALETTE.strata);
  m.onBeforeCompile = sh => {
    sh.uniforms.uStrata = { value: strata };
    sh.uniforms.uNoise = { value: noiseTexture() };
    sh.uniforms.uMoss = { value: new THREE.Color(PALETTE.moss) };
    sh.uniforms.uMossDeep = { value: new THREE.Color(PALETTE.mossDeep) };
    sh.uniforms.uSoil = { value: new THREE.Color(PALETTE.soil) };
    sh.uniforms.uMossAmount = { value: mossAmount };
    sh.uniforms.uFade = { value: fogFade };
    sh.uniforms.uShade = { value: shade };
    sh.uniforms.uShadeCol = { value: new THREE.Color(shadeColor) };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNor;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos=(modelMatrix*vec4(transformed,1.)).xyz;\nvWNor=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNor;\nuniform vec3 uStrata[8];\nuniform vec3 uMoss,uMossDeep,uSoil;\nuniform float uMossAmount,uFade,uShade;\nuniform vec3 uShadeCol;\nuniform sampler2D uNoise;\nfloat h31(vec3 p){p=fract(p*0.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}`)
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', /* glsl */`
        vec3 P=vWPos; vec3 N=normalize(vWNor);
        vec3 aN=abs(N);
        vec2 F=aN.y>max(aN.x,aN.z)?P.xz:(aN.x>aN.z?P.zy:P.xy);   // the face's dominant plane
        float warp=(texture2D(uNoise,P.xz*.012).r-.5)*.9+(texture2D(uNoise,F*.06).g-.5)*.1;
        // band thickness varies: a slow stretch of the height axis
        float t=(P.y+warp)*1.05+.35*sin(P.y*.37+1.3)+20.;
        float layer=floor(t), f=fract(t);
        int li=int(mod(layer,8.));
        vec3 base=uStrata[li];
        float jitter=h31(vec3(layer,3.,7.));
        base*=.9+.2*jitter;
        // fine sedimentary lamination and grain
        float lam=texture2D(uNoise,vec2(F.x*.02,P.y*.9)).b;
        float grain=texture2D(uNoise,F*.22).g;
        float fine=texture2D(uNoise,F*1.3).a;
        base*=.9+.14*(lam-.5)*2.+.14*(grain-.5)+.12*(fine-.5);
        // band boundaries: a thin darker seam, the band top catches light
        base*=mix(.74,1.,smoothstep(.0,.035,f));
        base*=1.+.06*smoothstep(.88,1.,f);
        // erosion pockets, sparse
        float pock=smoothstep(.62,.74,texture2D(uNoise,F*.09+.37).r);
        base*=1.-.18*pock;
        // vertical faces read a touch darker than the walkable tops
        base*=mix(.9,1.,abs(N.y));
        // tops: soil with moss patches
        float up=smoothstep(.55,.85,N.y);
        float mossN=texture2D(uNoise,P.xz*.07+.5).a;
        vec3 top=mix(uSoil*(.85+.3*grain),mix(uMossDeep,uMoss,grain),smoothstep(.42,.55,mossN)*uMossAmount);
        vec3 col=mix(base,top,up);
        // faces under an overhang sit in shadow
        col*=mix(1.,.55,smoothstep(.3,.9,-N.y));
        col=mix(col,uShadeCol*(.8+.4*grain),uShade);
        col=mix(col,vec3(.93,.80,.68),uFade);
        vec4 diffuseColor=vec4(col*diffuse,opacity);`);
  };
  m.customProgramCacheKey = () => `rock-${fogFade}-${mossAmount}-${shade}`;
  return m;
}

function hash(n) { n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
function vnoise1(x, seed) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i * 7919 + seed) * (1 - u) + hash((i + 1) * 7919 + seed) * u; }

/** Relief of a strata front: each band protrudes by its own amount, plus a slow wobble. */
export function strataRelief(x, y, seed = 1) {
  const t = y * 1.25 + 20 + (vnoise1(x * 0.18, seed + 5) - 0.5) * 0.9;
  const layer = Math.floor(t), f = t - layer;
  const band = (hash(layer * 131 + seed) - 0.5) * 0.34;
  const lip = f > 0.86 ? (f - 0.86) * 0.9 : 0;           // band tops overhang slightly
  return band + lip + (vnoise1(x * 1.7 + layer * 3.1, seed) - 0.5) * 0.08;
}

/**
 * A block of rock: walkable top exactly at y1; front (+z) and the given side faces carry
 * strata relief. Returns a BufferGeometry in world coordinates.
 */
export function strataBlock({ x0, x1, y0, y1, z0, z1, seed = 1, sides = ['w', 'e'], step = 0.22, rim = 0.12 }) {
  const pos = [], idx = [];
  const push = (x, y, z) => { pos.push(x, y, z); return pos.length / 3 - 1; };
  // Each grid is wound so its normals face `out` (outward from the rock).
  const grid = (nu, nv, fn, out) => {
    const base = pos.length / 3;
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const p = fn(i / nu, j / nv); push(p[0], p[1], p[2]); }
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
  const nx = Math.max(2, Math.ceil((x1 - x0) / step)), ny = Math.max(2, Math.ceil((y1 - y0) / (step * 0.5)));
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
