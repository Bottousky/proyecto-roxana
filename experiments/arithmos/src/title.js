// Pantalla de título: el nombre se escribe con tiza; Punto es el punto de la i.

import {Dot, Custom} from './engine/world.js';
import {stroke, lineGuide, chalkText, drawStroke, YELLOW} from './engine/chalk.js';
import {mulberry32} from './engine/rng.js';
import {ghost, ghostText, ghostParabola, ghostLine, ghostSpiral, ghostHouse, smear} from './art.js';

export function titleScene(game) {
  const {world, camera} = game;
  world.clear();
  game.renderer.dim = 1;
  game.renderer.tint = [1, 1, 1];
  camera.go({x: 0, y: 0, w: 1600, h: 900});
  game.layout();
  // fantasmas de lo que alguna vez estuvo escrito
  world.add(ghostText('t-g1', 'x − 3 = 5', 120, 170, 52, 0.26));
  world.add(ghostText('t-g2', 'a² + b² = c²', 1130, 140, 46, 0.22));
  world.add(ghostText('t-g3', '½ = 2/4', 1240, 760, 50, 0.24));
  world.add(ghostText('t-g4', 'y = f(x)', 160, 760, 46, 0.2));
  world.add(ghostText('t-g5', '|−3| = 3', 640, 820, 40, 0.18));
  world.add(ghost('t-gp', ghostParabola('t-gp', 1340, 520, 0.8), 0.2));
  world.add(ghost('t-gl', ghostLine('t-gl', 90, 560, 380), 0.22));
  world.add(ghost('t-gs', ghostSpiral('t-gs', 470, 300, 70), 0.18));
  world.add(ghost('t-gh', ghostHouse('t-gh', 980, 860, 0.6), 0.14));
  world.add(smear('t-s1', [[-40, 230], [400, 160], [900, 210], [1640, 120]], 170, 0.4));
  world.add(smear('t-s2', [[-40, 690], [500, 760], [1100, 690], [1640, 780]], 150, 0.35));
  world.add(smear('t-s3', [[1000, 380], [1200, 300], [1500, 330]], 90, 0.25));
  // el nombre, escrito por partes para que la i no tenga su punto
  const size = 168;
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = `700 ${size}px Kalam`;
  const wAr = ctx.measureText('Ar').width;
  const wRest = ctx.measureText('thmos').width;
  const iw = size * 0.25;
  const total = wAr + iw + wRest;
  const x0 = 800 - total / 2;
  const base = 470;
  const reveal = {k: 0};
  const rnd = mulberry32(77);
  const stem = stroke(lineGuide(x0 + wAr + iw * 0.48, base - size * 0.42, x0 + wAr + iw * 0.4, base - 4, rnd, 0.02), {w: 13, p: 0.92, seed: 77, wobble: 0.4});
  world.add(new Custom('t-name', {z: 5, render(c) {
    const k = reveal.k;
    const share = [wAr / total, iw / total, wRest / total];
    chalkText(c, 'Ar', x0, base, {size, weight: 700, reveal: Math.min(1, k / share[0])});
    const ki = (k - share[0]) / share[1];
    if (ki > 0) drawStroke(c, stem, Math.min(1, ki));
    const kr = (k - share[0] - share[1]) / share[2];
    if (kr > 0) chalkText(c, 'thmos', x0 + wAr + iw, base, {size, weight: 700, reveal: Math.min(1, kr)});
  }}));
  const punto = world.add(new Dot('t-punto', x0 + wAr + iw * 0.52, base - size * 0.62, {r: 11, ch: YELLOW, ring: true, z: 8}));
  punto.fade = 0;
  punto.setMode('bob', {home: [punto.x, punto.y]});
  const start = performance.now();
  world.add(new Custom('t-anim', {update() {
    const t = (performance.now() - start) / 1000;
    reveal.k = game.reducedMotion ? 1 : Math.min(1, t / 2.6);
    punto.fade = Math.min(1, Math.max(0, (t - 2.7) * 3));
    if (game.reducedMotion) punto.fade = 1;
  }}));
  const title = document.getElementById('title');
  title.hidden = false;
  const cont = title.querySelector('[data-act=continue]');
  const fresh = title.querySelector('[data-act=new]');
  const has = !!game.state?.segment;
  cont.hidden = !has;
  fresh.textContent = has ? 'Empezar de nuevo' : 'Empezar';
  fresh.dataset.confirm = '';
  title.onclick = e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    game.audio.unlock();
    if (act === 'continue') game.start(false);
    if (act === 'new') {
      if (has && fresh.dataset.confirm !== 'yes') {
        fresh.dataset.confirm = 'yes';
        fresh.textContent = 'Tocá otra vez: se borra la partida guardada';
        return;
      }
      game.start(true);
    }
    if (act === 'options') game.openOptions();
  };
  (has ? cont : fresh).focus({preventScroll: true});
}

