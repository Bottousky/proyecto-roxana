// Vegetation with identity: painted plants (art-source/physica/vegetation-sheet-v1.png) drawn as
// instanced cards. The diorama camera always looks along −z, so cards facing it read as whole
// plants. One draw call (plus one for shadows). Each card bends as an arc in its own plane, by
// an angle computed per instance.
//
// Physics of the bend (representation only, nothing here is simulated):
// - A ground plant stands along the pull; a vertical change in the field only compresses it, so
//   ground plants show the wind and part where the explorer walks, not the field.
// - A fern growing out of a rock face is a flexible cantilever: its frond bends toward the local
//   field and saturates near hanging along it (a soft frond cannot bend past that). Outside a
//   region it droops; inside one, where the field points up, it curls upward. On the Terraza's
//   face, which crosses the cascade region's top edge, the ferns flip at the edge.
import * as THREE from 'three';

/** Cells of the sheet, left to right, top row then bottom row. */
export const PLANT = { tuft: 0, tallGrass: 1, reeds: 2, coral: 3, saffron: 4, succulent: 5, fern: 6, moss: 7 };
// Each plant's measured box in the 1536×1024 sheet (px, top-left origin, 2 px margin; see
// scripts/hoja-alfa.mjs). The generated bottom row sits 57 px above its cells' bottom and the
// fern's tip crosses into the moss's cell, so cards use these boxes, not the grid: the card's
// bottom is then the plant's base.
const BOX = [[33, 246, 373, 506], [417, 34, 733, 507], [787, 27, 1142, 509], [1216, 171, 1499, 510],
  [36, 623, 344, 969], [402, 693, 760, 969], [787, 568, 1151, 970], [1182, 735, 1501, 969]];
const RECT = BOX.map(([x0, y0, x1, y1]) => new THREE.Vector4(x0 / 1536, 1 - y1 / 1024, x1 / 1536, 1 - y0 / 1024));
const ASPECT = BOX.map(([x0, y0, x1, y1]) => (x1 - x0) / (y1 - y0));

/** The largest turn of a fern's tip (rad): about hanging along a strong field (~86°). */
export const FERN_MAX = 1.5;
/** Share of the turn taken at the root (the stalk flexes); the rest is the frond's arc. */
const FERN_ROOT = 0.35;
/**
 * Bend angle of a fern growing out of a face with outward normal nx (±1), in the local field g.
 * The angle turns the frond toward g; it saturates (tanh) instead of growing without bound.
 */
export function fernAngle(g, nx) { return -nx * FERN_MAX * Math.tanh(g.y / 3); }
/** Vertical direction (+ up) toward which a fern with that bend turns its tip. */
export function fernTipUp(theta, nx) { return -nx * Math.sin(theta); }

const VERT_HEAD = /* glsl */`
attribute float aCell;
attribute vec2 aBend;
uniform vec4 uRect[8];
varying float vH;
`;
// Shared by the colour and the shadow programs: the atlas rectangle (aCell ≥ 8 mirrors the plant
// in the texture; a negative scale would flip the winding and show the unlit back face) and the
// arc bend, a constant curvature along the card's height that keeps the frond's length.
function patchVertex(sh) {
  sh.uniforms.uRect = { value: RECT };
  sh.vertexShader = VERT_HEAD + sh.vertexShader
    .replace('#include <uv_vertex>', `#include <uv_vertex>
      float flipped = step(7.5, aCell);
      vec4 rect = uRect[int(aCell - 8.0 * flipped + 0.5)];
      vMapUv = mix(rect.xy, rect.zw, vec2(mix(uv.x, 1.0 - uv.x, flipped), uv.y));
      vH = uv.y;`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>
      float th = aBend.x, ph = aBend.y;
      if (abs(th) > 1e-4) {
        float t = position.y, R = 1.0 / th, ct = cos(th * t), st = sin(th * t);
        transformed.x = R * (1.0 - ct) + position.x * ct;
        transformed.y = R * st - position.x * st;
      }
      if (abs(ph) > 1e-4) { // the root hinge: turns the whole card about its base, toward +x
        float c = cos(ph), s = sin(ph);
        transformed.xy = vec2(transformed.x * c + transformed.y * s, -transformed.x * s + transformed.y * c);
      }`);
}

export class Vegetation {
  /**
   * tops: [[x0, x1, y], …] walkable tops; streams: channels { x0, x1, y, z, half };
   * walls: fern faces { x, nx, z: [[z0, z1], …], bands: [[y0, y1], …], scale };
   * avoid(x, z, tall): true where a plant must not grow (instruments, channels, the table).
   */
  constructor(scene, field, { tops = [], walls = [], avoid, quality = 'high', streams = [], spots = [] }) {
    this.field = field; this.plants = [];
    let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const pick = table => { let r = rnd() * table.reduce((a, b) => a + b[1], 0); for (const [v, w] of table) { if ((r -= w) <= 0) return v; } return table[0][0]; };
    const H = { [PLANT.tuft]: [0.24, 0.38], [PLANT.tallGrass]: [0.55, 0.8], [PLANT.reeds]: [0.9, 1.3], [PLANT.coral]: [0.32, 0.45],
      [PLANT.saffron]: [0.28, 0.38], [PLANT.succulent]: [0.16, 0.24], [PLANT.fern]: [0.46, 0.56], [PLANT.moss]: [0.14, 0.2] };
    const TALL = new Set([PLANT.tallGrass, PLANT.reeds, PLANT.coral, PLANT.saffron]);
    // Flowers weigh more than their share: many fall near the path or the instruments and are skipped.
    const ground = [[PLANT.tuft, 32], [PLANT.tallGrass, 8], [PLANT.coral, 20], [PLANT.saffron, 19], [PLANT.moss, 13], [PLANT.succulent, 9]];
    // Explicit plants (a planter, a garden bed): { cell, x, y, z, h }.
    for (const p of spots) this.add(p.cell, p.x, p.y, p.z, p.h, rnd() < 0.5, rnd());
    const lens = tops.map(t => t[1] - t[0]), total = lens.reduce((a, b) => a + b, 0);
    const place = (kind, x, y, z) => {
      if (Math.abs(z) < 0.7 && TALL.has(kind)) return; // near the path only low plants
      if (kind === PLANT.tallGrass && z > -1.2) return; // tall grass well behind it
      if (avoid?.(x, z, TALL.has(kind))) return;
      this.add(kind, x, y, z, H[kind][0] + rnd() * (H[kind][1] - H[kind][0]), rnd() < 0.5, rnd());
    };
    // Clumps of a few mixed plants, denser toward the lips; then a scatter of low ones.
    const clumps = !tops.length ? 0 : quality === 'low' ? 45 : 95;
    for (let c = 0; c < clumps; c++) {
      let t = rnd() * total, k = 0; while (t > lens[k] && k < lens.length - 1) { t -= lens[k]; k++; }
      const [x0, x1, y] = tops[k], u = rnd() < 0.3 ? (rnd() < 0.5 ? rnd() * 0.12 : 1 - rnd() * 0.12) : rnd();
      const cx = x0 + u * (x1 - x0), cz = -3.1 + rnd() * 4.4, dom = pick(ground), n = 3 + Math.floor(rnd() * 5);
      for (let j = 0; j < n; j++) {
        const x = THREE.MathUtils.clamp(cx + (rnd() - 0.5) * 0.9, x0, x1);
        place(rnd() < 0.6 ? dom : pick(ground), x, y, cz + (rnd() - 0.5) * 0.7);
      }
    }
    for (let i = 0; i < (!tops.length ? 0 : quality === 'low' ? 25 : 60); i++) {
      let t = rnd() * total, k = 0; while (t > lens[k] && k < lens.length - 1) { t -= lens[k]; k++; }
      const [x0, x1, y] = tops[k];
      place(rnd() < 0.6 ? PLANT.tuft : PLANT.moss, x0 + rnd() * (x1 - x0), y, -3.1 + rnd() * 4.4);
    }
    // Reeds in clumps along the far bank of each channel, with gaps (the near bank faces the path).
    for (const st of streams) for (let x = st.x0 + rnd(); x < st.x1; x += 1.4 + rnd() * 2.4) {
      const n = 1 + Math.floor(rnd() * 3);
      for (let j = 0; j < n; j++) {
        const xx = x + j * 0.22 + rnd() * 0.1, z = st.z - (st.half + 0.08 + rnd() * 0.25);
        if (!avoid?.(xx, z, true)) this.add(PLANT.reeds, xx, st.y, z, H[PLANT.reeds][0] + rnd() * 0.4, rnd() < 0.5, rnd());
      }
    }
    // Ferns out of rock faces, in height bands, never mirrored (the frond's own curl would read
    // as a bend that is not the field's).
    for (const w of walls) for (const [y0, y1] of w.bands) {
      // Spaced so each frond's silhouette, and its direction, reads on its own.
      for (let y = y0 + rnd() * 0.1; y < y1; y += (w.step ?? 0.45) + (rnd() - 0.5) * 0.24) {
        const [z0, z1] = w.z[Math.floor(rnd() * w.z.length)], z = z0 + rnd() * (z1 - z0);
        const h = (H[PLANT.fern][0] + rnd() * (H[PLANT.fern][1] - H[PLANT.fern][0])) * (w.scale ?? 1);
        this.add(PLANT.fern, w.x + w.nx * 0.02, y, z, h * (0.85 + rnd() * 0.3), false, rnd(), w.nx);
        this.plants[this.plants.length - 1].tilt = (rnd() - 0.5) * 0.25; // each root a little different
      }
    }

    const geo = new THREE.PlaneGeometry(1, 1, 1, 8); geo.translate(0, 0.5, 0); // base at y = 0, 8 rows to bend
    // Normals tilted toward the sky so the cards take the light like the ground under them.
    const nrm = geo.attributes.normal, up = new THREE.Vector3(0, 0.45, 1).normalize();
    for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, up.x, up.y, up.z);
    this.cell = new Float32Array(this.plants.length); this.bend = new Float32Array(this.plants.length * 2);
    this.plants.forEach((p, i) => { this.cell[i] = p.cell + (p.flip ? 8 : 0); });
    geo.setAttribute('aCell', new THREE.InstancedBufferAttribute(this.cell, 1));
    this.bendAttr = new THREE.InstancedBufferAttribute(this.bend, 2).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aBend', this.bendAttr);
    const tex = new THREE.TextureLoader().load('textures/vegetation.png');
    // Uploaded premultiplied: fully transparent texels then add no colour when filtered (their
    // stored colour is the source's haze); the shader divides it back out.
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.premultiplyAlpha = true;
    const mat = new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.4, alphaToCoverage: true, side: THREE.DoubleSide });
    mat.onBeforeCompile = sh => {
      patchVertex(sh);
      // A little darker toward the base, where a plant meets the ground.
      sh.fragmentShader = 'varying float vH;\n' + sh.fragmentShader.replace('#include <map_fragment>',
        '#include <map_fragment>\n diffuseColor.rgb /= max(diffuseColor.a, 0.001);\n diffuseColor.rgb *= mix(0.7, 1.0, smoothstep(0.0, 0.38, vH));');
    };
    mat.customProgramCacheKey = () => 'vegetation2';
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.4, side: THREE.DoubleSide });
    depth.onBeforeCompile = sh => { patchVertex(sh); sh.fragmentShader = 'varying float vH;\n' + sh.fragmentShader; };
    depth.customProgramCacheKey = () => 'vegetation2-depth';
    this.mesh = new THREE.InstancedMesh(geo, mat, this.plants.length);
    this.mesh.customDepthMaterial = depth;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
    const tint = new THREE.Color();
    this.plants.forEach((p, i) => {
      // Wall ferns are rotated so the card's up points out of the wall.
      e.set(0, 0, p.wall ? -p.nx * Math.PI / 2 : 0); q.setFromEuler(e);
      const wj = 0.85 + ((p.r * 7.31) % 1) * 0.35; // width varies on its own, not only with height
      sc.set(p.h * ASPECT[p.cell] * wj, p.h, 1); ps.set(p.x, p.y, p.z);
      this.mesh.setMatrixAt(i, m4.compose(ps, q, sc));
      const v = 0.9 + p.r * 0.18, hj = ((p.r * 13.7) % 1) - 0.5; // brightness and a yellow–green drift
      if (p.cell === PLANT.moss) tint.setRGB(v * 0.82, v * 1.1, v * 0.74); // greener: the sheet's moss reads brown at play scale
      else tint.setRGB(v * (1 + 0.08 * hj), v * (1 - 0.04 * hj), v * 0.95);
      this.mesh.setColorAt(i, tint);
    });
    this.mesh.castShadow = true; this.mesh.receiveShadow = true; this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    this._g = { x: 0, y: 0 };
  }

  add(cell, x, y, z, h, flip, r, nx = 0) {
    this.plants.push({ cell, x, y, z, h, flip, r, ph: r * 6.283, wall: nx !== 0, nx });
  }

  /** time (s); walker: the explorer's feet { x, y }, to part the plants it walks through. */
  update(time, walker) {
    const B = this.bend, g = this._g;
    this.plants.forEach((p, i) => {
      let th, ph = 0;
      if (p.wall) {
        this.field.at(p.x + p.nx * p.h * 0.5, p.y, g);
        const turn = fernAngle(g, p.nx) + Math.sin(time * 1.3 + p.ph) * 0.05;
        ph = turn * FERN_ROOT; th = turn - ph; // the tip's direction is the sum
        ph += p.tilt ?? 0;
      } else {
        th = Math.sin(time * 1.7 + p.ph) * 0.1; // wind
        if (walker && Math.abs(p.z) < 0.7 && Math.abs(p.y - walker.y) < 0.3) {
          const d = p.x - walker.x, a = Math.max(0, 1 - Math.abs(d) / 0.45);
          th += Math.sign(d || 1) * a * 0.6;
        }
      }
      B[i * 2] = th; B[i * 2 + 1] = ph;
    });
    this.bendAttr.needsUpdate = true;
  }
}
