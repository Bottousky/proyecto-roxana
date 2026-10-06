// Control for A25: a page with nothing but a minimal WebGL loop (clear and one triangle per
// frame), measured like the game. If it shows the same long gaps, they come from the browser, the
// GPU process or the OS, not from the game's load. Development tool.
//   node scripts/control-webgl.mjs [seconds=60]
import { chromium } from 'playwright';
import os from 'node:os';
const secs = +(process.argv[2] || 60);
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
await page.setContent(`<canvas id=c width=1280 height=720 style="width:100vw;height:100vh;display:block"></canvas><script>
  const gl = document.getElementById('c').getContext('webgl2');
  const vs = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(vs, '#version 300 es\\nin vec2 p; void main(){gl_Position=vec4(p,0,1);}'); gl.compileShader(vs);
  const fs = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(fs, '#version 300 es\\nprecision mediump float; out vec4 o; uniform float t; void main(){o=vec4(.5+.5*sin(t),.4,.3,1);}'); gl.compileShader(fs);
  const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,0,1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const ut = gl.getUniformLocation(pr, 't'); window.iv = []; let last = performance.now();
  function f(now) { requestAnimationFrame(f); window.iv.push(now - last); last = now; gl.clearColor(.1,.1,.1,1); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform1f(ut, now / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3); }
  requestAnimationFrame(f);
</script>`);
await page.waitForTimeout(2000);
await page.evaluate(() => { window.iv = []; });
const load0 = os.loadavg()[0].toFixed(1);
await page.waitForTimeout(secs * 1000);
const iv = await page.evaluate(() => window.iv);
const a = iv.slice().sort((p, q) => p - q), q = p => +a[Math.min(a.length - 1, Math.floor(p * a.length))].toFixed(1);
console.log(JSON.stringify({ control: 'webgl-minimo', n: a.length, p50: q(0.5), p99: q(0.99), max: +a[a.length - 1].toFixed(1), over34: a.filter(v => v > 34).length, over100: iv.filter(v => v > 100).map(v => +v.toFixed(0)), load0, load1: os.loadavg()[0].toFixed(1) }));
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 10000))]);
process.exit(0);
