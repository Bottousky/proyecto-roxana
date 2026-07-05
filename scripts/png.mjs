// Codificador PNG sin dependencias (RGBA, 8-bit, no entrelazado).
// Usa solo zlib de Node. Sirve al generador procedural de Ohmdal.
import { deflateSync } from 'node:zlib';

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** Lienzo RGBA simple con primitivas de dibujo pixel. */
export class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 4); // todo transparente
  }
  px(x, y, [r, g, b, a = 255]) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    if (a >= 255) {
      this.data[i] = r; this.data[i + 1] = g; this.data[i + 2] = b; this.data[i + 3] = 255;
    } else {
      // alpha-blend sobre lo existente
      const ea = this.data[i + 3] / 255;
      const na = a / 255;
      const oa = na + ea * (1 - na);
      if (oa <= 0) return;
      this.data[i] = (r * na + this.data[i] * ea * (1 - na)) / oa;
      this.data[i + 1] = (g * na + this.data[i + 1] * ea * (1 - na)) / oa;
      this.data[i + 2] = (b * na + this.data[i + 2] * ea * (1 - na)) / oa;
      this.data[i + 3] = Math.round(oa * 255);
    }
  }
  rect(x, y, w, h, col) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, col);
  }
  frame(x, y, w, h, col) {
    for (let i = 0; i < w; i++) { this.px(x + i, y, col); this.px(x + i, y + h - 1, col); }
    for (let j = 0; j < h; j++) { this.px(x, y + j, col); this.px(x + w - 1, y + j, col); }
  }
  disc(cx, cy, r, col) {
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++)
      if (i * i + j * j <= r * r) this.px(cx + i, cy + j, col);
  }
  ring(cx, cy, r, col, thick = 1) {
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      const d = Math.sqrt(i * i + j * j);
      if (d <= r && d >= r - thick) this.px(cx + i, cy + j, col);
    }
  }
  line(x0, y0, x1, y1, col) {
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy, x = x0, y = y0;
    for (;;) {
      this.px(x, y, col);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
  }
  /** ruido determinista salpicado (para textura de suelo) */
  noise(x, y, w, h, col, density, seed = 1) {
    let s = seed >>> 0;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++)
      if (rnd() < density) this.px(x + i, y + j, col);
  }
  toPNG() {
    const { w, h, data } = this;
    const stride = w * 4 + 1;
    const raw = Buffer.alloc(stride * h);
    const src = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    for (let y = 0; y < h; y++) {
      raw[y * stride] = 0; // filtro none
      src.copy(raw, y * stride + 1, y * w * 4, (y + 1) * w * 4);
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(w, 0);
    ihdr.writeUInt32BE(h, 4);
    ihdr[8] = 8;   // bit depth
    ihdr[9] = 6;   // color type RGBA
    ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    return Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk('IHDR', ihdr),
      chunk('IDAT', deflateSync(raw, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ]);
  }
}
