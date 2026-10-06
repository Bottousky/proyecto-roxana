// Hornea el mapa ilustrado del reino a partir del propio mundo. La geografía sale del juego: una
// cámara ortogonal cenital fotografía todo el reino (norte arriba, sin personajes ni efectos de
// lente) por cuadros, y un pintor en la GPU convierte esa toma en un mapa: clasifica cada punto en
// agua, bosque, pradera, piedra o techo y repinta cada clase con su estilo (copas de árboles,
// oleaje alrededor de la costa, sombreado de laderas, tinta en los bordes, papel). Los caminos se
// dibujan encima desde los mismos datos que usa el juego para caminar.
// Uso: GAME_URL=… PXM=8 node scripts/bake-map.mjs   →   public/assets/map/kingdom-map.webp + .json
import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { chromePath, gpuArgs } from './chrome.mjs';
import { KINGDOM, EXTERIORS, passageGeometry, WATERCOURSE } from '../src/game/kingdom-geography.js';
import { AREA_LAYOUTS } from '../src/game/world-layout.js';

const root = resolve(import.meta.dirname, '..');
const PXM = Number(process.env.PXM || 8);             // píxeles por metro en la imagen final
const TILE_PX = Number(process.env.TILE_PX || 1024);  // lado de cada toma
const TILE_M = TILE_PX / PXM;                         // metros que cubre cada toma
// Extensión (metros, norte = −z): del río al sur del Portal hasta el mar al norte del Faro.
const EXTENT = { x0: Number(process.env.X0 ?? -132), x1: Number(process.env.X1 ?? 124), z0: Number(process.env.Z0 ?? -345), z1: Number(process.env.Z1 ?? 125) };
const out = resolve(root, process.env.OUT || 'public/assets/map');
const name = process.env.NAME || 'kingdom-map.webp';
await mkdir(out, { recursive: true });

// Roads and walks, in kingdom metres: the passages between places and each place's own paths and courts.
const roads = [], courts = [];
for (let i = 1; i < EXTERIORS.length; i++) { const p = passageGeometry(EXTERIORS[i - 1], EXTERIORS[i]); for (const r of p?.routes ?? []) roads.push({ width: r.width, points: r.points, bridge: p.bridge, trail: r.id !== 'main' }); }
for (const id of EXTERIORS) {
  const k = KINGDOM[id], layout = AREA_LAYOUTS[id] ?? {};
  for (const p of layout.paths ?? []) roads.push({ width: p.width, points: p.points.map(([x, z]) => [x + k.x, z + k.z]) });
  for (const c of layout.courts ?? []) courts.push(c.r != null ? { x: c.x + k.x, z: c.z + k.z, r: c.r } : { x: c.x + k.x, z: c.z + k.z, w: c.w, d: c.d });
}

// Hillshade from the game's own relief (src/data/relief.bin.gz): every hill, and the Monte Quieto,
// reads as topography, lit from the north-west as on a classic map. Half the map's resolution.
const relief = { ...JSON.parse(await readFile(resolve(root, 'src/data/relief.json'), 'utf8')), heights: new Float32Array(gunzipSync(await readFile(resolve(root, 'src/data/relief.bin.gz'))).buffer.slice(0)) };
const reliefAt = (X, Z) => { const fx = (X - relief.x0) / relief.cell, fz = (Z - relief.z0) / relief.cell, i = Math.floor(fx), j = Math.floor(fz); if (i < 0 || j < 0 || i >= relief.cols - 1 || j >= relief.rows - 1) return 0; const tx = fx - i, tz = fz - j, h = (a, b) => relief.heights[b * relief.cols + a]; return (h(i, j) * (1 - tx) + h(i + 1, j) * tx) * (1 - tz) + (h(i, j + 1) * (1 - tx) + h(i + 1, j + 1) * tx) * tz; };

const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: TILE_PX, height: TILE_PX }, deviceScaleFactor: 1 });
await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4190/', { waitUntil: 'networkidle' });
await page.locator('#new-game').click();
await page.waitForFunction(() => window.__ohmdal?.mode === 'dialogue', {}, { timeout: 180000 });
for (let i = 0; i < 80 && await page.evaluate(() => window.__ohmdal.mode === 'dialogue'); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(120); }
await page.waitForTimeout(1500);
await page.addStyleTag({ content: '#hud,#dialogue,#touch-controls,#interaction,#toast,#arrival,#field-meter,#ohm-bubble,#workbench,#modal-layer{display:none!important}' });

// The scene as a cartographer sees it: midday light, no lens, nobody standing around, no clouds.
await page.evaluate(({ tileM }) => {
  const w = window.__ohmdal.world, app = w.app;
  w.update = () => {};
  for (const [id, r] of w.regions) r.root.enabled = id !== 'workshop' && !id.startsWith('home:');
  for (const s of app.root.findComponents('sprite')) s.entity.enabled = false;
  const f = w.frame; f.dof.enabled = false; f.vignette.intensity = 0; f.bloom.intensity = 0; f.update();
  const cam = w.camera.camera; cam.projection = 1; cam.orthoHeight = tileM / 2; cam.nearClip = 1; cam.farClip = 900;
  w.camera.setEulerAngles(-90, 0, 0);
  w.sun.light.shadowDistance = 520;
  for (const m of w.grounds || []) m.setParameter('uClouds', [0, 0, .035]);
  const sea = cam.clearColor.clone(); sea.set(.13, .3, .33, 1); cam.clearColor = sea;
}, { tileM: TILE_M });

const cols = Math.ceil((EXTENT.x1 - EXTENT.x0) / TILE_M), rows = Math.ceil((EXTENT.z1 - EXTENT.z0) / TILE_M);
const tiles = [];
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
  // Row 0 is the north edge (smallest z); screen up is north.
  const cx = EXTENT.x0 + (c + .5) * TILE_M, cz = EXTENT.z0 + (r + .5) * TILE_M;
  await page.evaluate(({ cx, cz }) => { window.__ohmdal.world.camera.setPosition(cx, 400, cz); }, { cx, cz });
  await page.waitForTimeout(400);
  tiles.push({ r, c, data: (await page.locator('canvas').first().screenshot({ type: 'png' })).toString('base64') });
  process.stdout.write(`\rtoma ${tiles.length}/${rows * cols}`);
}
console.log('');

const width = cols * TILE_PX, height = rows * TILE_PX;
const SW = width / 2, SH = height / 2, shade = new Uint8Array(SW * SH * 4), step = 2 / PXM, light = [-.55, .62, -.55], ll = Math.hypot(...light);
for (let j = 0; j < SH; j++) for (let i = 0; i < SW; i++) {
  const X = EXTENT.x0 + (i + .5) * step, Z = EXTENT.z0 + (j + .5) * step, e = .7;
  const hx = (reliefAt(X + e, Z) - reliefAt(X - e, Z)) / (2 * e), hz = (reliefAt(X, Z + e) - reliefAt(X, Z - e)) / (2 * e), n = [-hx, 1, -hz], nl = Math.hypot(...n);
  const lit = (n[0] * light[0] + n[1] * light[1] + n[2] * light[2]) / (nl * ll), flat = light[1] / ll, h = reliefAt(X, Z);
  const k = (j * SW + i) * 4; shade[k] = Math.max(0, Math.min(255, 128 + (lit - flat) * 330)); shade[k + 1] = Math.min(255, h * 6); shade[k + 2] = 0; shade[k + 3] = 255;
}
const meta = { pxPerMetre: PXM, x0: EXTENT.x0, z0: EXTENT.z0, width, height, metresWide: cols * TILE_M, metresTall: rows * TILE_M, north: '-z' };
const stitch = await browser.newPage();
// Fidelity probes: the river's course must be painted as water, each place and its roads as land.
const probes = { water: WATERCOURSE.filter((_, i) => i % 2 === 0), land: [...EXTERIORS.map(id => [KINGDOM[id].x, KINGDOM[id].z]), ...roads.filter(r => !r.bridge).flatMap(r => r.points.filter((_, i) => i % 6 === 3))] };
const [rawUrl, mapUrl, fidelity] = await stitch.evaluate(async ({ tiles, width, height, size, meta, roads, courts, radius, probes, shadeData, SW, SH }) => {
  const raw = document.createElement('canvas'); raw.width = width; raw.height = height;
  { const g = raw.getContext('2d'); for (const t of tiles) { const img = new Image(); img.src = `data:image/png;base64,${t.data}`; await img.decode(); g.drawImage(img, t.c * size, t.r * size); } }
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: false });
  const head = `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform vec2 px;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 hash2(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ return noise(p) * .5 + noise(p * 2.1 + 3.7) * .3 + noise(p * 4.3 + 7.1) * .2; }
float lum(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
vec3 hsl(vec3 c){ float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b)), l = (mx + mn) * .5, d = mx - mn; if (d < 1e-5) return vec3(0., 0., l);
  float s = l > .5 ? d / (2. - mx - mn) : d / (mx + mn); float h = mx == c.r ? (c.g - c.b) / d + (c.g < c.b ? 6. : 0.) : mx == c.g ? (c.b - c.r) / d + 2. : (c.r - c.g) / d + 4.; return vec3(h * 60., s, l); }
float hueNear(float h, float center, float near, float far){ float d = abs(h - center); d = min(d, 360. - d); return 1. - smoothstep(near, far, d); }
`;
  const vs = `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;
  // 1 · Brush areas with crisp edges.
  const kuwahara = head + `uniform sampler2D t; uniform int R;
void main(){
  vec3 m[4]; vec3 s[4]; for (int k = 0; k < 4; k++) { m[k] = vec3(0); s[k] = vec3(0); }
  float n = float((R + 1) * (R + 1));
  for (int j = -R; j <= R; j++) for (int i = -R; i <= R; i++) {
    vec3 c = texture(t, uv + vec2(i, j) * px).rgb;
    if (i <= 0 && j <= 0) { m[0] += c; s[0] += c * c; } if (i >= 0 && j <= 0) { m[1] += c; s[1] += c * c; }
    if (i <= 0 && j >= 0) { m[2] += c; s[2] += c * c; } if (i >= 0 && j >= 0) { m[3] += c; s[3] += c * c; }
  }
  float best = 1e9; vec3 col = vec3(0);
  for (int k = 0; k < 4; k++) { vec3 mean = m[k] / n; vec3 v = abs(s[k] / n - mean * mean); float sv = v.r + v.g + v.b; if (sv < best) { best = sv; col = mean; } }
  o = vec4(col, 1.);
}`;
  // 2 · What each point is: water, forest, stone, roof (meadow is the rest).
  const classify = head + `uniform sampler2D t;
void main(){
  vec3 c = texture(t, uv).rgb, k = hsl(c); float h = k.x, s = k.y, l = k.z;
  float water = max(hueNear(h, 182., 20., 34.) * smoothstep(.16, .23, s), hueNear(h, 148., 14., 30.) * smoothstep(.47, .55, l) * (1. - smoothstep(.2, .3, s)));
  float land = 1. - water;
  float forest = land * (1. - smoothstep(.24, .31, l)) * hueNear(h, 108., 26., 44.) * smoothstep(.08, .15, s);
  float stone = land * (1. - smoothstep(.11, .18, s)) * smoothstep(.37, .45, l);
  float roof = land * max(hueNear(h, 26., 9., 20.) * smoothstep(.18, .25, s) * (1. - smoothstep(.29, .38, l)), (1. - smoothstep(.05, .1, s)) * (1. - smoothstep(.22, .29, l)));
  o = vec4(water, forest, stone, roof);
}`;
  // 3 · A soft distance from the shore, for the offshore ripple lines (separable blur of the water mask).
  const blur = head + `uniform sampler2D t; uniform vec2 dir; uniform float spread;
void main(){ float acc = 0., wsum = 0.; for (int i = -36; i <= 36; i++) { float w = exp(-float(i * i) / spread); acc += texture(t, uv + dir * float(i) * px).r * w; wsum += w; } o = vec4(acc / wsum, 0., 0., 1.); }`;
  // 2b · Clean water: specks of glare at sea and stray wet pixels on land are not islands or ponds.
  const clean = head + `uniform sampler2D M; uniform sampler2D S;
void main(){ vec4 m = texture(M, uv); float w = smoothstep(.42, .58, texture(S, uv).r); o = vec4(w, m.g * (1. - w), m.b * (1. - w), m.a * (1. - w)); }`;
  // 4 · The painter.
  const compose = head + `uniform sampler2D K; uniform sampler2D M; uniform sampler2D W; uniform sampler2D S; uniform float pxm;
float mask(vec2 off, int ch){ vec4 v = texture(M, uv + off * px); return ch == 0 ? v.r : ch == 1 ? v.g : ch == 2 ? v.b : v.a; }
void main(){
  vec2 q = uv / px;                      // pixel coordinates
  vec2 metres = q / pxm;                 // map metres
  vec3 k = texture(K, uv).rgb; float l = lum(k);
  vec4 m = texture(M, uv); float water = m.r, stone = m.b, roof = m.a;
  // The edge of a wood is never ruled: the forest mask is read through a gentle warp of a few metres
  // (roads, courts, roofs and water stay exactly where the game has them).
  vec2 warp = (vec2(fbm(metres * .055), fbm(metres * .055 + 17.3)) - .5) * 9. * pxm * px;
  float forest = texture(M, uv + warp).g * (1. - water) * (1. - stone) * (1. - roof);
  float deep = texture(W, uv).r;         // 0 on land … 1 far out at sea
  // Meadow: an olive wash that keeps the land's own light and dark.
  float wash = fbm(metres * .045);
  vec3 meadow = mix(vec3(.60, .64, .42), vec3(.73, .73, .50), wash) * (.86 + .4 * (l - .36));
  meadow *= 1. + (noise(metres * vec2(1.1, .28)) - .5) * .07;            // grass strokes
  // Forest: crowns of trees, each lit from the north-west, dark between them.
  vec2 cell = metres / 2.6, ic = floor(cell); float d1 = 9., d2 = 9.; vec2 nearest = vec2(0); float tone = 0.;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) { vec2 g = ic + vec2(i, j), f = g + .15 + .7 * hash2(g); float d = length(cell - f); if (d < d1) { d2 = d1; d1 = d; nearest = cell - f; tone = hash(g); } else if (d < d2) d2 = d; }
  float crown = 1. - smoothstep(.36, .62, d1), lit = clamp(.55 - dot(nearest, vec2(.75, .75)), 0., 1.);
  vec3 forestCol = mix(vec3(.15, .23, .15), mix(vec3(.30, .42, .24), vec3(.44, .55, .30), lit) * (.9 + .2 * tone), crown);
  forestCol *= .8 + .2 * smoothstep(.02, .14, d2 - d1);
  // Stone and cobble: warm sand with a speckle.
  vec3 stoneCol = vec3(.80, .74, .60) * (.9 + .18 * noise(metres * 2.2));
  // Roofs: warmer, slate or terracotta as the render says.
  vec3 roofCol = mix(vec3(.38, .42, .42), vec3(.66, .38, .27), smoothstep(.1, .25, hsl(k).y)) * (.85 + .5 * l);
  // Water: shallow by the shore, deep offshore, rings of ripples parallel to the coast.
  vec3 waterCol = mix(vec3(.38, .58, .57), vec3(.16, .32, .38), smoothstep(.55, .97, deep));
  float rings = 0.; for (int r = 0; r < 4; r++) { float lv = .58 + float(r) * .09; rings = max(rings, 1. - smoothstep(.0, .008 + .002 * float(r), abs(deep - lv))); }
  waterCol = mix(waterCol, vec3(.80, .89, .86), rings * .38 * (1. - smoothstep(.85, .97, deep)));
  waterCol += (noise(metres * vec2(.6, 2.4)) - .5) * .035;
  vec3 col = meadow;
  col = mix(col, forestCol, forest);
  col = mix(col, stoneCol, stone);
  col = mix(col, roofCol, roof);
  col = mix(col, waterCol, water);
  // Relief: where the land's light changes sharply (an escarpment), shade toward the south-east.
  float lx = lum(texture(K, uv + vec2(1, 0) * px).rgb) - lum(texture(K, uv - vec2(1, 0) * px).rgb);
  float lz = lum(texture(K, uv + vec2(0, 1) * px).rgb) - lum(texture(K, uv - vec2(0, 1) * px).rgb);
  col *= 1. - (1. - water) * (1. - stone) * (1. - forest) * smoothstep(.06, .2, length(vec2(lx, lz))) * .14;
  // Hillshade from the relief heights, and higher ground a little paler and warmer (the shade map
  // is stored top row first, while this pass runs with the origin at the bottom).
  vec4 hs = texture(S, vec2(uv.x, 1. - uv.y)); float relief = hs.r * 2. - 1., elevation = hs.g * 255. / 6.;
  col *= 1. + (1. - water) * clamp(relief, -.42, .3) * .9;
  col = mix(col, col * vec3(1.06, 1.04, .96) + .03, (1. - water) * smoothstep(8., 34., elevation) * .5);
  // Ink: the coast strongest, then the edges of woods, stone and roofs.
  float coast = 0., ink = 0.;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) { vec2 off = vec2(i, j) * 1.5; coast = max(coast, abs(mask(off, 0) - water)); ink = max(ink, max(abs(mask(off, 2) - stone), abs(mask(off, 3) - roof)) * .6); }
  // The wood's own rim: darker crowns where the warped forest meets the meadow.
  float rim = abs(texture(M, uv + warp + vec2(2., 0.) * px).g - texture(M, uv + warp - vec2(2., 0.) * px).g) + abs(texture(M, uv + warp + vec2(0., 2.) * px).g - texture(M, uv + warp - vec2(0., 2.) * px).g);
  col = mix(col, col * .7, smoothstep(.3, 1., rim) * .5);
  col = mix(col, vec3(.86, .93, .88), smoothstep(.2, .6, coast) * water * .55);   // foam on the water side
  col = mix(col, vec3(.16, .17, .14), smoothstep(.25, .7, coast) * (1. - water) * .75);
  col = mix(col, vec3(.2, .17, .12), smoothstep(.3, .8, ink) * .45);
  // Paper.
  float grain = noise(q * .8) * .55 + noise(q * .19) * .45;
  col *= .94 + grain * .1;
  o = vec4(clamp(col, 0., 1.), 1.);
}`;
  const program = (fs) => { const pr = gl.createProgram(); for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(pr, sh); } gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr)); return pr; };
  const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const texture = (source) => { const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!source); if (source) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); for (const [key, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, key, v); return tx; };
  const target = (tx) => { const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx, 0); return fb; };
  const run = (pr, inputs, fb, uniforms = {}) => {
    gl.useProgram(pr); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, width, height);
    const loc = gl.getAttribLocation(pr, 'p'); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    Object.entries(inputs).forEach(([uniform, tx], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tx); gl.uniform1i(gl.getUniformLocation(pr, uniform), i); });
    gl.uniform2f(gl.getUniformLocation(pr, 'px'), 1 / width, 1 / height);
    for (const [uniform, value] of Object.entries(uniforms)) { const u = gl.getUniformLocation(pr, uniform); if (Array.isArray(value)) gl.uniform2f(u, ...value); else if (Number.isInteger(value) && uniform === 'R') gl.uniform1i(u, value); else gl.uniform1f(u, value); }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const source = texture(raw), K = texture(null), M0 = texture(null), M = texture(null), B1 = texture(null), B2 = texture(null);
  const S = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, S); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, SW, SH, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(atob(shadeData).split('').map(c => c.charCodeAt(0))));
  for (const [key, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, key, v);
  run(program(kuwahara), { t: source }, target(K), { R: radius });
  run(program(classify), { t: K }, target(M0));
  const blurProgram = program(blur), small = 2 * (meta.pxPerMetre * .9) ** 2;
  run(blurProgram, { t: M0 }, target(B1), { dir: [1, 0], spread: small });
  run(blurProgram, { t: B1 }, target(B2), { dir: [0, 1], spread: small });
  const cleanTarget = target(M);
  run(program(clean), { M: M0, S: B2 }, cleanTarget);
  // Read the clean classification where the game says there is water, and where it says there is land.
  const readWater = ([x, z]) => { const px = Math.round((x - meta.x0) * meta.pxPerMetre), py = Math.round((z - meta.z0) * meta.pxPerMetre); if (px < 0 || py < 0 || px >= width || py >= height) return null; const v = new Uint8Array(4); gl.bindFramebuffer(gl.FRAMEBUFFER, cleanTarget); gl.readPixels(px, height - 1 - py, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, v); return v[0] / 255; };
  const share = (points, wantWater) => { const seen = points.map(readWater).filter(v => v !== null); return { probes: seen.length, agree: seen.filter(v => wantWater ? v > .5 : v < .5).length }; };
  const fidelity = { water: share(probes.water, true), land: share(probes.land, false) };
  // The ripples need a long reach: blur the clean water twice with a wide kernel.
  run(blurProgram, { t: M }, target(B1), { dir: [1, 0], spread: 450 });
  run(blurProgram, { t: B1 }, target(B2), { dir: [0, 1], spread: 450 });
  run(blurProgram, { t: B2 }, target(B1), { dir: [1, 0], spread: 450 });
  run(blurProgram, { t: B1 }, target(B2), { dir: [0, 1], spread: 450 });
  run(program(compose), { K, M, W: B2, S }, null, { pxm: meta.pxPerMetre });
  // Roads on top, from the walking data: a pale ribbon with a dark edge, trails thinner.
  const out = document.createElement('canvas'); out.width = width; out.height = height;
  const g = out.getContext('2d'); g.drawImage(canvas, 0, 0);
  const X = x => (x - meta.x0) * meta.pxPerMetre, Y = z => (z - meta.z0) * meta.pxPerMetre;
  g.lineJoin = g.lineCap = 'round';
  const stroke = (pts, w, style) => { g.beginPath(); pts.forEach(([x, z], i) => i ? g.lineTo(X(x), Y(z)) : g.moveTo(X(x), Y(z))); g.lineWidth = w; g.strokeStyle = style; g.stroke(); };
  for (const c of courts) { g.beginPath(); if (c.r != null) g.arc(X(c.x), Y(c.z), c.r * meta.pxPerMetre, 0, Math.PI * 2); else g.rect(X(c.x - c.w / 2), Y(c.z - c.d / 2), c.w * meta.pxPerMetre, c.d * meta.pxPerMetre); g.fillStyle = 'rgba(208,191,150,.82)'; g.strokeStyle = 'rgba(84,66,42,.5)'; g.lineWidth = 1.2; g.fill(); g.stroke(); }
  const roadPx = w => Math.max(2.2, w * .5 * meta.pxPerMetre);
  for (const r of roads) stroke(r.points, roadPx(r.width) + 2.4, r.bridge ? 'rgba(52,44,32,.8)' : 'rgba(84,66,42,.55)');
  for (const r of roads) stroke(r.points, roadPx(r.width), r.bridge ? 'rgba(190,170,132,.95)' : r.trail ? 'rgba(201,182,138,.78)' : 'rgba(214,196,152,.88)');
  return [raw.toDataURL('image/webp', .88), out.toDataURL('image/webp', .86), fidelity];
}, { tiles, width, height, size: TILE_PX, meta, roads, courts, probes, shadeData: Buffer.from(shade).toString('base64'), SW, SH, radius: Number(process.env.RADIUS || Math.max(2, Math.round(PXM * .45))) });
const pct = f => Math.round(f.agree / Math.max(1, f.probes) * 100);
console.log(`fidelidad: el río del juego cae sobre agua pintada en ${pct(fidelity.water)}% de ${fidelity.water.probes} puntos; lugares y caminos sobre tierra en ${pct(fidelity.land)}% de ${fidelity.land.probes}`);
if (!process.env.OUT && (pct(fidelity.water) < 90 || pct(fidelity.land) < 95)) { console.error('El mapa pintado no coincide con la geografía del juego.'); process.exit(1); }
meta.fidelity = { river: pct(fidelity.water), land: pct(fidelity.land) };
await writeFile(resolve(out, name), Buffer.from(mapUrl.split(',')[1], 'base64'));
if (process.env.RAW) await writeFile(resolve(out, name.replace('.webp', '-raw.webp')), Buffer.from(rawUrl.split(',')[1], 'base64'));
await writeFile(resolve(out, name.replace('.webp', '.json')), JSON.stringify(meta, null, 2) + '\n');
console.log(`mapa ${width}×${height} px (${meta.metresWide}×${meta.metresTall} m, ${PXM} px/m) en ${resolve(out, name)}`);
await browser.close();
