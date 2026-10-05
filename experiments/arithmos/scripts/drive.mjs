// Conduce el juego con Chrome y un guion de pasos JSON. Uso:
//   node scripts/drive.mjs pasos.json salida/ [ancho alto]
// Pasos: {"click": "selector"}, {"key": "Enter"}, {"wait": ms}, {"shot": "nombre"},
//        {"eval": "js"}, {"until": "js", "timeout": ms}, {"advance": n}, {"spot": "id"}, {"choose": "texto"}
import {chromium} from 'playwright';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {startServer} from './serve.mjs';

const [, , stepsFile, outDir = 'out', w = '1600', h = '900'] = process.argv;
const steps = JSON.parse(await readFile(stepsFile, 'utf8'));
await mkdir(outDir, {recursive: true});
const port = 4197 + Math.floor(Math.random() * 200);
const server = await startServer(port);
const browser = await chromium.launch({channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const context = await browser.newContext({viewport: {width: +w, height: +h}, deviceScaleFactor: Number(process.env.DPR || 1), hasTouch: !!process.env.TOUCH, isMobile: !!process.env.MOBILE});
const page = await context.newPage();
const log = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') log.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', e => log.push(`[pageerror] ${e.stack || e}`));
await page.goto(`http://127.0.0.1:${port}/${process.env.PAGE || ''}`);
await page.waitForFunction(() => window.__ready === true, null, {timeout: 20000});
let n = 0;
const t0 = Date.now();
for (const s of steps) {
  try {
    if (s.click) await page.click(s.click, {timeout: s.timeout || 8000});
    if (s.key) await page.keyboard.press(s.key);
    if (s.wait) await page.waitForTimeout(s.wait);
    if (s.eval) {
      const r = await page.evaluate(s.eval);
      if (r !== undefined) log.push(`[eval] ${JSON.stringify(r)}`);
    }
    if (s.until) await page.waitForFunction(s.until, null, {timeout: s.timeout || 30000, polling: 100});
    if (s.spot) await page.click(`#spots [data-id="${s.spot}"]`, {timeout: s.timeout || 15000});
    if (s.choose) await page.click(`#choices button:has-text("${s.choose}")`, {timeout: s.timeout || 30000});
    if (s.advance) {
      for (let i = 0; i < s.advance; i++) {
        await page.waitForFunction(() => !!window.__game.ui.waiting || !!window.__game.ui.typing, null, {timeout: s.timeout || 30000, polling: 50});
        await page.keyboard.press('Enter');
        await page.waitForTimeout(60);
        await page.evaluate(() => window.__game.ui.typing && window.__game.ui.finishTyping());
        const still = await page.evaluate(() => !!window.__game.ui.waiting);
        if (still) await page.keyboard.press('Enter');
        await page.waitForTimeout(40);
      }
    }
    if (s.shot) {
      n++;
      await page.screenshot({path: `${outDir}/${String(n).padStart(2, '0')}-${s.shot}.png`});
    }
  } catch (e) {
    log.push(`[step-fail] ${JSON.stringify(s)} → ${e.message.split('\n')[0]}`);
    n++;
    await page.screenshot({path: `${outDir}/${String(n).padStart(2, '0')}-FAIL.png`}).catch(() => {});
    if (!s.optional) break;
  }
}
const state = await page.evaluate(() => {
  const g = window.__game;
  return g && {mode: g.mode, segment: g.state?.segment, flags: g.state?.flags, ev: g.state?.evidence?.length, caption: document.querySelector('#caption .line')?.textContent, spots: [...document.querySelectorAll('#spots .spot')].map(b => b.dataset.id), choices: [...document.querySelectorAll('#choices button')].map(b => b.textContent)};
}).catch(e => ({err: String(e)}));
log.push(`[state] ${JSON.stringify(state)}`);
log.push(`[time] ${((Date.now() - t0) / 1000).toFixed(1)} s`);
await writeFile(`${outDir}/log.txt`, log.join('\n'));
console.log(log.join('\n'));
await browser.close();
server.close();
