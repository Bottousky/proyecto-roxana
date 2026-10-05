// Compuesto del pizarrón: un cuadro de pantalla completa en WebGL que combina
// la pizarra (procedural), las manchas de borrado y la tiza codificada por presión.

import {mulberry32, periodicNoise2} from './rng.js';

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_chalk;
uniform sampler2D u_dust;
uniform sampler2D u_tooth;
uniform sampler2D u_low;
uniform vec2 u_res;
uniform vec2 u_origin;
uniform float u_wpp;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform float u_grain;
uniform float u_dim;
uniform vec3 u_tint;
void main(){
  vec2 px = vec2(v_uv.x, 1.0 - v_uv.y) * u_res;
  vec2 w = u_origin + px * u_wpp;
  float lo = texture2D(u_low, w / 1730.0).r;
  float lo2 = texture2D(u_low, w / 410.0 + vec2(0.37, 0.71)).r;
  float tooth = texture2D(u_tooth, w / 330.0).r;
  float tooth2 = texture2D(u_tooth, w / 1210.0 + vec2(0.5, 0.21)).r;
  vec3 board = vec3(0.098, 0.192, 0.158) * u_tint;
  board *= 0.84 + 0.22 * lo + 0.07 * lo2;
  board *= 0.965 + 0.07 * tooth;
  vec4 dust = texture2D(u_dust, v_uv);
  board = mix(board, vec3(0.30, 0.40, 0.355) * u_tint, clamp(dust.a, 0.0, 1.0) * 0.55);
  vec2 q = v_uv - 0.5;
  q.x *= u_res.x / u_res.y * 0.75;
  board *= 1.0 - dot(q, q) * 0.62;
  vec3 c = texture2D(u_chalk, v_uv).rgb;
  float h = mix(0.5, mix(tooth, tooth2, 0.22), u_grain);
  float soft = mix(0.5, 0.11, u_grain);
  vec3 thr = vec3(1.0 - h);
  vec3 cov = smoothstep(thr - soft, thr + soft, c * 1.04);
  cov *= smoothstep(0.0, 0.05, c);
  vec3 col = board;
  col = mix(col, u_c0, cov.r * 0.94);
  col = mix(col, u_c1, cov.g * 0.95);
  col = mix(col, u_c2, cov.b * 0.93);
  col *= u_dim;
  gl_FragColor = vec4(col, 1.0);
}`;

export class BoardRenderer {
  constructor(glCanvas) {
    this.canvas = glCanvas;
    const gl = glCanvas.getContext('webgl', {antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true});
    if (!gl) throw new Error('Este juego necesita WebGL para dibujar el pizarrón.');
    this.gl = gl;
    this.chalk = document.createElement('canvas');
    this.chalkCtx = this.chalk.getContext('2d');
    this.dust = document.createElement('canvas');
    this.dustCtx = this.dust.getContext('2d');
    this.grain = 1;
    this.dim = 1;
    this.tint = [1, 1, 1];
    this.colors = {
      c0: [0.94, 0.945, 0.9],
      c1: [0.99, 0.84, 0.42],
      c2: [0.6, 0.82, 0.96],
    };
    this.#setup();
  }

  #setup() {
    const gl = this.gl;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    this.prog = prog;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    for (const name of ['u_chalk', 'u_dust', 'u_tooth', 'u_low', 'u_res', 'u_origin', 'u_wpp', 'u_c0', 'u_c1', 'u_c2', 'u_grain', 'u_dim', 'u_tint']) {
      this.u[name] = gl.getUniformLocation(prog, name);
    }
    this.texChalk = this.#texture(0, gl.CLAMP_TO_EDGE);
    this.texDust = this.#texture(1, gl.CLAMP_TO_EDGE);
    this.texTooth = this.#texture(2, gl.REPEAT);
    this.texLow = this.#texture(3, gl.REPEAT);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    this.#uploadGray(this.texTooth, 2, 512, makeTooth(512));
    this.#uploadGray(this.texLow, 3, 256, makeLow(256));
    gl.uniform1i(this.u.u_chalk, 0);
    gl.uniform1i(this.u.u_dust, 1);
    gl.uniform1i(this.u.u_tooth, 2);
    gl.uniform1i(this.u.u_low, 3);
  }

  #texture(unit, wrap) {
    const gl = this.gl;
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  #uploadGray(tex, unit, size, data) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, size, size, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
  }

  resize(cssW, cssH, dpr) {
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.chalk.width = w;
      this.chalk.height = h;
      this.dust.width = Math.max(1, Math.round(w / 2));
      this.dust.height = Math.max(1, Math.round(h / 2));
      this.gl.viewport(0, 0, w, h);
    }
    this.w = w;
    this.h = h;
  }

  /** Prepara el lienzo de tiza con la transformación de cámara (unidades de mundo). */
  beginChalk(view) {
    const ctx = this.chalkCtx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.globalCompositeOperation = 'lighten';
    const s = view.scale;
    ctx.setTransform(s, 0, 0, s, -view.x * s, -view.y * s);
    return ctx;
  }

  beginDust(view) {
    const ctx = this.dustCtx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.dust.width, this.dust.height);
    const s = view.scale * (this.dust.width / this.w);
    ctx.setTransform(s, 0, 0, s, -view.x * s, -view.y * s);
    return ctx;
  }

  present(view, uploadDust = true) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texChalk);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.chalk);
    if (uploadDust) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.texDust);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.dust);
    }
    gl.uniform2f(this.u.u_res, this.w, this.h);
    gl.uniform2f(this.u.u_origin, view.x, view.y);
    gl.uniform1f(this.u.u_wpp, 1 / view.scale);
    gl.uniform3fv(this.u.u_c0, this.colors.c0);
    gl.uniform3fv(this.u.u_c1, this.colors.c1);
    gl.uniform3fv(this.u.u_c2, this.colors.c2);
    gl.uniform1f(this.u.u_grain, this.grain);
    gl.uniform1f(this.u.u_dim, this.dim);
    gl.uniform3fv(this.u.u_tint, this.tint);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

/** Diente del pizarrón: alturas ecualizadas (distribución uniforme), periódicas. */
function makeTooth(size) {
  const fine = periodicNoise2(11, 256);
  const mid = periodicNoise2(23, 64);
  const streak = periodicNoise2(37, 32);
  const rnd = mulberry32(5);
  const vals = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const f = fine(x * 256 / size, y * 256 / size);
      const m = mid(x * 64 / size, y * 64 / size);
      const s = streak(x * 32 / size / 1, y * 32 / size * 5);
      vals[y * size + x] = 0.42 * f + 0.22 * m + 0.16 * s + 0.2 * rnd();
    }
  }
  const idx = Array.from(vals.keys()).sort((a, b) => vals[a] - vals[b]);
  const out = new Uint8Array(size * size);
  for (let r = 0; r < idx.length; r++) out[idx[r]] = Math.round((r / (idx.length - 1)) * 255);
  return out;
}

function makeLow(size) {
  const n1 = periodicNoise2(71, 8);
  const n2 = periodicNoise2(83, 16);
  const n3 = periodicNoise2(97, 32);
  const out = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = 0.55 * n1(x * 8 / size, y * 8 / size) + 0.3 * n2(x * 16 / size, y * 16 / size) + 0.15 * n3(x * 32 / size, y * 32 / size);
      out[y * size + x] = Math.round(Math.min(1, Math.max(0, v)) * 255);
    }
  }
  return out;
}
