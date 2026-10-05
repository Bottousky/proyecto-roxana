// Revisión visual de la escena del Faro (depuración, no aceptación): toma una bitácora terminada
// y la devuelve al instante en que la lente acaba de encenderse (noche, final sin ver, escena sin
// marcar); al continuar, el propio juego reproduce la escena real. Captura cada 600 ms. Uso: GAME_URL=… OUT=carpeta SAVE=bitácora node scripts/qa-finale-scene.mjs
import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromePath, gpuArgs } from './chrome.mjs';

const out = resolve(process.env.OUT || 'output/finale-scene');
await mkdir(out, { recursive: true });
const save = JSON.parse(await readFile(resolve(process.env.SAVE || 'output/playthrough-cycle6/verified-save.json'), 'utf8'));
Object.assign(save, { area: 'lighthouse', position: [0, -9.6], journeyTime: { phase: 4 }, activeDialogue: null, activeCinematic: null, endingPending: false });
Object.assign(save.flags, { finale_seen: false, epilogue_shared: false });
save.seen = save.seen.filter(id => !/^cinematic:beacon_lens$|^lighthouse_epilogue$|^beacon_lens_complete$/.test(id));
const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(text => { if (!sessionStorage.getItem('v')) { localStorage.setItem('ohmdal.playcanvas.arc1.v1', text); sessionStorage.setItem('v', '1'); } }, JSON.stringify(save));
await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4190/', { waitUntil: 'networkidle' });
await page.locator('#continue').click();
await page.waitForFunction(() => window.__ohmdal?.mode === 'cinematic', {}, { timeout: 60000 });
for (let i = 0; i < 29; i++) { await page.screenshot({ path: resolve(out, `finale-${String(i).padStart(2, '0')}.png`) }); await page.waitForTimeout(600); }
console.log(out, errors.length ? errors : 'sin errores');
await browser.close();
