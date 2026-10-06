// Capítulo 1 — ¿Están todos? Escenas jugables.

import {Drawing, Label, Link, Custom, Dot} from '../engine/world.js';
import {YELLOW, WHITE, chalkText, pressureStyle} from '../engine/chalk.js';
import {easeInOut, easeOut, lerp, mulberry32} from '../engine/rng.js';
import {evaluatePairs, togglePair} from '../logic/pairing.js';
import {
  GROUND, DOOR, STONE, RING, MARKS, FIELD, GRADAS, LINE_X0, LINE_GAP, SHOTS, STAGES, RONDA_IDS, LINO,
  markPos, markRect, student, punto, rondaDot, rondaDance, stopDance, base, markDrawing, art, PAIRED_Y, NAME, nameMarkPos,
} from './common.js';

const stage = name => STAGES.indexOf(name);

// ——— Actuación de puntos ———

async function hop(d, dot, x, y, {dur = 0.36, h = 26, sound = 'hop', g} = {}) {
  const x0 = dot.x, y0 = dot.y;
  dot.setMode('still');
  if (sound && g) sound === 'tap' ? g.audio.tap(0.25, 1.8) : g.audio.punto(sound);
  await d.tween(dur, k => {
    dot.x = lerp(x0, x, k);
    dot.y = lerp(y0, y, k);
    dot.lift = Math.sin(k * Math.PI) * h;
  });
  dot.lift = 0;
}

async function zip(d, dot, x, y, dur = 0.32) {
  const x0 = dot.x, y0 = dot.y;
  dot.setMode('still');
  await d.tween(dur, k => {
    dot.x = lerp(x0, x, k);
    dot.y = lerp(y0, y, k);
  }, easeInOut);
}

async function pulse(d, dot, times = 2, amount = 0.45, each = 0.22) {
  for (let i = 0; i < times; i++) {
    await d.tween(each, k => { dot.scale = 1 + Math.sin(k * Math.PI) * amount; });
  }
  dot.scale = 1;
}

function tremble(dot, amount = 1) {
  dot.tremble = amount;
}

/** Punto flota junto al hombro del estudiante. */
function follow(p, s) {
  p.setMode('anchor', {anchor: () => {
    const f = s.facing >= 0 ? 1 : -1;
    return [s.x + 44 * f, s.y - 150 + Math.sin(performance.now() / 380) * 5];
  }});
}

// ——— Puntos interactivos ———

function dotSpot(g, id, label, onActivate, extra = {}) {
  const o = g.world.get(id);
  return {
    id, kind: 'dot', label,
    rect: () => o.bounds(),
    onHover: on => { o.hover = on; },
    onActivate,
    ...extra,
  };
}

function rectSpot(id, label, r, onActivate, extra = {}) {
  return {id, kind: 'rect', label, rect: typeof r === 'function' ? r : () => r, onActivate, ...extra};
}

function wordSpot(id, text, x, y, onActivate, extra = {}) {
  return {id, kind: 'word', label: text, text, rect: () => ({x: x - 1, y: y - 1, w: 2, h: 2}), onActivate, ...extra};
}

// ——————————————————————————————————————————————
// 1.1 La puerta
// ——————————————————————————————————————————————

export const puerta = {
  id: 'c1.puerta',
  title: 'La puerta',
  setup(g) {
    const w = g.world;
    w.clear();
    base(g, stage('start'));
    w.get('door').progress = 0;
    w.add(new Drawing('door-panel', art.doorPanel('door-panel', DOOR.x, GROUND, DOOR.w, DOOR.h, 0), {z: 2, progress: 0, cache: false}));
    g.camera.go(SHOTS.door);
  },
  async play(d, g) {
    const w = g.world;
    const door = w.get('door');
    const panel = w.get('door-panel');
    g.setCinematic(true);
    await d.wait(0.7);
    g.audio.cue('door');
    d.describe('Una tiza que nadie sostiene dibuja una puerta en el pizarrón.');
    await d.draw(door, 2.6);
    await d.draw(panel, 1.4);
    await d.wait(0.4);
    g.setCinematic(false);
    // primera decisión: cruzar
    await d.interact(() => new Promise(resolve => {
      g.setHint(() => ['Tocá la puerta.']);
      g.ui.setSpots([rectSpot('door', 'Cruzar la puerta', {x: DOOR.x - DOOR.w / 2, y: GROUND - DOOR.h, w: DOOR.w, h: DOOR.h}, () => {
        g.audio.unlock();
        g.audio.tap(0.5);
        resolve();
      })]);
    }));
    g.setHint(null);
    d.evidence('door');
    g.setCinematic(true);
    // la puerta se abre hacia nosotros y deja ver la luz
    const light = w.add(new Drawing('door-light', art.doorLight('door-light', DOOR.x, GROUND, DOOR.w, DOOR.h), {z: 1, progress: 0}));
    const opener = d.tween(1.3, k => {
      panel.strokes = art.doorPanel('door-panel', DOOR.x, GROUND, DOOR.w, DOOR.h, k);
    }, easeInOut);
    await d.all(opener, d.draw(light, 1.1, {sound: false}));
    const s = student(w, DOOR.x, {draw: 0, pose: 'hands', facing: 0});
    s.look(0, 0.8);
    d.describe('Del otro lado de la puerta, alguien se dibuja trazo a trazo: sos vos.');
    await d.draw(s, 2.4, {key: 'draw'});
    await d.wait(0.3);
    // un paso afuera de la luz y un primer plano
    s.face(0.6);
    await d.walk(s, DOOR.x + 120, GROUND, 90);
    s.face(0.5);
    s.setPose('hands', 0.6);
    s.look(0.5, 1);
    await d.shot({x: DOOR.x + 120 - 150, y: GROUND - 190, w: 300, h: 200}, 1.8);
    // mueve los dedos, como quien prueba algo nuevo
    s.gesture = t => ({armR: [0, Math.sin(t * 7) * 0.18], armL: [0, Math.sin(t * 7 + 1.4) * 0.16]});
    await d.wait(1.1);
    g.setCinematic(false);
    await d.think('Tengo las manos de tiza.');
    s.gesture = null;
    s.setPose('idle', 0.5);
    s.look(0, 0);
    await d.wait(0.3);
    // mirar atrás
    s.face(-0.7);
    s.look(-1, -0.2);
    g.setCinematic(true);
    await d.shot(SHOTS.door, 1.4);
    await d.all(d.fadeTo(door, 0.28, 1.6), d.fadeTo(light, 0, 1.2), d.tween(1.6, k => {
      panel.strokes = art.doorPanel('door-panel', DOOR.x, GROUND, DOOR.w, DOOR.h, 1 - k * 0.98);
      panel.fade = 1 - k;
    }));
    door.dust = 0.08;
    w.remove('door-light');
    w.remove('door-panel');
    g.setCinematic(false);
    await d.think('…No hay vuelta. Por ahora.');
    s.face(0.6);
    s.setPose('lookUp', 0.7);
    s.look(0.6, -0.6);
    await d.shot(SHOTS.doorWide, 2.2);
    await d.think('Alguien borró todo esto a medias.');
    s.setPose('idle', 0.6);
    s.look(0.2, 0);
    await d.walk(s, DOOR.x + 95, GROUND, 110);
  },
};

// ——————————————————————————————————————————————
// 1.2 Alguien
// ——————————————————————————————————————————————

export const alguien = {
  id: 'c1.alguien',
  title: 'Alguien',
  setup(g) {
    const w = g.world;
    base(g, stage('door-crossed'));
    student(w, DOOR.x + 95);
    const p = punto(w, 1380, 600, {fade: 0});
    p.setMode('still');
    g.camera.go(SHOTS.doorWide);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    g.setCinematic(true);
    await d.shot(SHOTS.meet, 2);
    g.audio.punto('hop');
    await d.fadeTo(p, 1, 0.25);
    await pulse(d, p, 1, 0.6, 0.2);
    s.look(1, 0);
    s.setPose('surprise', 0.25);
    d.describe('Un punto amarillo, con un anillo tenue, se enciende a lo lejos.');
    await d.wait(0.5);
    s.setPose('idle', 0.6);
    await d.think('Algo se movió.');
    p.setMode('bob', {home: [p.x, p.y]});
    g.setCinematic(false);
    const scratch = g.scratch();
    let approaches = 0;
    let waited = false;
    while (!waited) {
      const choice = await d.choose([
        {id: 'go', text: 'Acercarte'},
        {id: 'wait', text: 'Quedarte quieto y esperar'},
      ], {prompt: approaches ? 'Punto espía desde su escondite.' : 'Un punto amarillo, quieto, te mira (o algo parecido).'});
      d.evidence('meet', {choice});
      if (choice === 'go') {
        approaches++;
        const target = Math.min(p.x - 230, s.x + 420);
        s.face(1);
        await d.walk(s, target);
        // se esconde detrás de la colina borrada
        tremble(p, 0.7);
        g.audio.punto('scared');
        const hx = approaches === 1 ? p.x + 260 : p.x + 220;
        await zip(d, p, hx, 640, 0.3);
        p.setMode('bob', {home: [hx, 640]});
        p.fade = 0.55;
        d.describe('Punto huye y se esconde. Sólo asoma su anillo.');
        if (approaches > 1) {
          await d.think('Mejor me siento. Que venga si quiere.');
          waited = true;
        }
      } else waited = true;
    }
    scratch.approaches = approaches;
    g.flags.metApproaches = approaches;
    g.setCinematic(true);
    s.face(0.6);
    s.setPose('sitGround', 0.9);
    s.look(0.8, 0.1);
    await d.wait(1.6);
    d.describe('Te sentás en el suelo. Punto se acerca de a saltitos.');
    p.fade = 1;
    // se acerca a saltos, con pausas
    const steps = 3;
    const startX = p.x;
    const endX = s.x + 95;
    for (let i = 1; i <= steps; i++) {
      await hop(d, p, lerp(startX, endX, i / steps), lerp(p.y, 660, i / steps), {g, h: 22 + i * 4, dur: 0.34});
      await d.wait(i === steps ? 0.9 : 0.55);
    }
    s.look(1, 0.4);
    await d.shot({x: s.x - 200, y: GROUND - 230, w: 460, h: 280}, 1.6);
    // da una vuelta alrededor
    const cx = s.x + 10, cy = GROUND - 60;
    const a0 = Math.atan2(p.y - cy, p.x - cx);
    g.audio.punto('question');
    await d.tween(1.6, k => {
      const a = a0 - k * Math.PI * 2;
      p.x = cx + Math.cos(a) * 90;
      p.y = cy + Math.sin(a) * 60;
      s.look(Math.cos(a), Math.sin(a) * 0.6);
    }, easeInOut);
    const tip = s.chalkTip();
    await zip(d, p, tip[0] + 8, tip[1] - 6, 0.4);
    g.audio.tap(0.3, 2);
    // el toque sorprende: la mano se aparta, y vuelve despacio
    s.setPose('sitGroundLook', 0.12);
    s.look(1, 0.3);
    await pulse(d, p, 1, 0.3);
    await d.wait(0.4);
    s.setPose('offer', 0.8);
    g.audio.punto('hello');
    d.describe('Punto toca tu tiza con cuidado y suena tres veces, cada vez más agudo.');
    await d.wait(0.8);
    p.setMode('bob', {home: [p.x + 6, p.y - 20]});
    g.setCinematic(false);
    s.gesture = t => ({armR: [0, Math.sin(t * 8) * 0.25]});
    await d.say('student', 'Hola.');
    s.gesture = null;
    s.setPose('sitGround', 0.6);
    g.audio.punto('hello');
    await pulse(d, p, 2, 0.35);
    await d.think('No habla. O no habla como yo.');
    await d.say('student', '¿Tenés nombre?');
    g.audio.punto('question');
    await d.tween(0.6, k => { p.squash = Math.sin(k * Math.PI) * 0.4; });
    await d.wait(0.9);
    s.setPose('sitGroundLook', 0.6);
    await d.think('Un punto. Nada más… y nada menos.');
    s.setPose('offer', 0.5);
    await d.say('student', 'Te voy a decir Punto. Hasta que me digas cómo te llamás.');
    await hop(d, p, p.x, p.y, {g, sound: 'happy', h: 34});
    p.setMode('bob', {home: [p.x, p.y]});
    // quiere que lo sigan
    g.setCinematic(true);
    await d.shot(SHOTS.meet, 1.2);
    await zip(d, p, p.x + 260, p.y - 30, 0.4);
    await d.wait(0.25);
    await zip(d, p, s.x + 120, GROUND - 120, 0.4);
    await zip(d, p, p.x + 200, p.y - 20, 0.35);
    p.setMode('bob', {home: [p.x, p.y]});
    g.setCinematic(false);
    await d.interact(() => new Promise(resolve => {
      g.setHint(() => ['Punto espera adelante, hacia la derecha.', 'Tocá a Punto para seguirlo.']);
      g.ui.setSpots([dotSpot(g, 'punto', 'Seguir a Punto', () => resolve())]);
    }));
    g.setHint(null);
    s.setPose('idle', 0.5);
    await d.wait(0.4);
    s.face(1);
    follow(p, s);
    g.setCinematic(true);
    const travel = d.walk(s, STONE.x - 400, GROUND, 190);
    const cam = d.shot(SHOTS.ronda, (STONE.x - 400 - s.x) / 190, easeInOut);
    await d.all(travel, cam);
  },
};

// ——————————————————————————————————————————————
// 1.3 La Ronda
// ——————————————————————————————————————————————

export const ronda = {
  id: 'c1.ronda',
  title: 'La Ronda',
  setup(g) {
    const w = g.world;
    base(g, stage('met'));
    const s = student(w, STONE.x - 400);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    for (let i = 0; i < 12; i++) rondaDot(w, i);
    rondaDance(w, {speed: 0.42});
    w.remove('marea-band');
    g.camera.go(SHOTS.ronda);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const ctl = w.get('ronda-ctl');
    const rs = g.scratch();
    if (rs.method) {
      // se recargó a mitad: directo a lo que faltaba
      w.add(mareaBand(w, 1560));
      ctl.speed = 0.22;
      if (rs.method === 'count' && !rs.countDone) {
        await countRonda(d, g);
        rs.countDone = true;
        for (const id of RONDA_IDS) w.get(id).mark = 0;
        w.removeWhere(o => o.id.startsWith('cword-'));
      }
      await d.think('Una marca por cada uno.');
      await recordRonda(d, g);
      g.flags.recorded = MARKS;
      return;
    }
    g.setCinematic(true);
    g.audio.cue('ronda');
    d.describe('Una ronda de puntos blancos baila en círculo. Uno, el más chico, siempre llega tarde.');
    s.look(1, -0.2);
    await d.wait(1.4);
    // Punto se suma a la ronda un momento
    await zip(d, p, RING.x - RING.r, RING.y, 0.55);
    await d.tween(2.2, k => {
      const a = Math.PI + k * Math.PI * 1.2;
      p.x = RING.x + Math.cos(a) * (RING.r + 30);
      p.y = RING.y + Math.sin(a) * (RING.r + 30) * 0.42;
    });
    await zip(d, p, s.x + 70, GROUND - 160, 0.5);
    p.setMode('bob', {home: [p.x, p.y]});
    g.setCinematic(false);
    await d.say('student', '¿Son tu familia?');
    await hop(d, p, p.x, p.y, {g, sound: 'yes', h: 18});
    p.setMode('bob', {home: [p.x, p.y]});
    // el más chico llega siempre tarde: un primer plano para conocerlo
    g.setCinematic(true);
    const lino0 = w.get(LINO);
    await d.shot({x: RING.x - 260, y: RING.y - 150, w: 520, h: 300}, 1.4);
    ctl.speed = 0.3;
    d.describe('El más chico de la Ronda se queda atrás, se apura y llega último, a los saltitos.');
    await d.tween(2.6, k => { lino0.lift = Math.abs(Math.sin(k * Math.PI * 5)) * 10 * (1 - k * 0.5); });
    g.audio.tap(0.15, 2.4);
    await d.wait(0.4);
    await d.shot(SHOTS.ronda, 1.2);
    g.setCinematic(false);
    ctl.speed = 0.42;
    // la Marea, a lo lejos
    g.setCinematic(true);
    const band = w.add(mareaBand(w, 1150));
    g.audio.erase(2.4, 0.5);
    g.camera.shake = 0.35;
    tremble(p, 1);
    g.audio.punto('scared');
    ctl.speed = 0.9;
    ctl.r = RING.r * 0.8;
    s.face(-1);
    s.look(-1, -0.2);
    s.setPose('surprise', 0.3);
    d.describe('A lo lejos, una franja ancha avanza por el pizarrón y lo deja gris. Los puntos se apretujan.');
    await d.shot({x: 900, y: 160, w: 1950, h: 620}, 1.6);
    await d.tween(1.6, k => { band.x = lerp(1150, 1260, k); });
    await d.think('¿Qué es eso?');
    s.setPose('idle', 0.5);
    s.face(1);
    await d.shot(SHOTS.ronda, 1.4);
    ctl.speed = 0.35;
    ctl.r = RING.r * 0.92;
    g.setCinematic(false);
    ctl.speed = 0.22;
    await d.think('Si pasa por acá, los desparrama.');
    let first = await d.choose([
      {id: 'count', text: 'Contarlos.'},
      {id: 'marks', text: 'Anotarlos en la piedra.'},
    ], {prompt: '¿Cómo vas a saber si vuelven todos?'});
    d.evidence('record-method', {choice: first});
    rs.method = first;
    g.saveNow();
    if (first === 'count') {
      const n = await countRonda(d, g);
      rs.countDone = true;
      g.saveNow();
      await d.think(n === 12 ? 'Doce.' : `${n}… creo.`);
      g.audio.punto('question');
      await pulse(d, p, 1, 0.3);
      await d.think('Pero Punto no sabe qué es "doce". Necesito algo que él también pueda ver.');
      for (const id of RONDA_IDS) w.get(id).mark = 0;
      w.removeWhere(o => o.id.startsWith('cword-'));
    }
    await recordRonda(d, g);
    g.flags.recorded = MARKS;
    s.setPose('idle', 0.5);
    s.look(0.6, 0);
    g.audio.punto('question');
    await pulse(d, p, 1, 0.3);
  },
};

function mareaBand(w, x) {
  const band = w.ensure('marea-band', () => new Custom('marea-band', {z: 25}));
  band.x = x;
  band.width ??= 360;
  band.strength ??= 0.45;
  band.t ??= 0;
  band.specks ??= [];
  band.lastX ??= x;
  band.update = dt => {
    band.t += dt;
    // polvo de tiza que el borde arrastra
    const moved = band.x - band.lastX;
    band.lastX = band.x;
    if (band.strength >= 0.6 && moved > 0) {
      const n = Math.min(40, Math.round(moved * 0.5));
      for (let i = 0; i < n; i++) band.specks.push({x: band.x - Math.random() * 40, y: -100 + Math.random() * 1000, vx: 60 + Math.random() * 260, vy: (Math.random() - 0.4) * 60, life: 0.6 + Math.random() * 0.9, r: 1 + Math.random() * 2.4});
    }
    for (const p of band.specks) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 30 * dt; p.life -= dt; }
    band.specks = band.specks.filter(p => p.life > 0).slice(-900);
  };
  // en el polvo: la franja clara del fieltro, con estrías que tiemblan
  band.renderDust = ctx => {
    const W = band.width, k = band.strength;
    ctx.save();
    const grad = ctx.createLinearGradient(band.x - W * 1.6, 0, band.x + W * 0.25, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, `rgba(255,255,255,${0.6 * k})`);
    grad.addColorStop(0.88, `rgba(255,255,255,${Math.min(1, 1.3 * k)})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(band.x - W * 1.6, -600, W * 1.85, 2200);
    for (let i = 0; i < 26; i++) {
      const xx = band.x - W * 1.4 + i * W * 0.06 + Math.sin(band.t * 3 + i) * 4;
      ctx.strokeStyle = `rgba(255,255,255,${(0.08 + (i % 5) * 0.03) * k * 2})`;
      ctx.lineWidth = 4 + (i % 4) * 4;
      ctx.beginPath();
      ctx.moveTo(xx, -600);
      ctx.bezierCurveTo(xx + 40, 200, xx - 30, 700, xx + 20, 1600);
      ctx.stroke();
    }
    ctx.restore();
  };
  // en la tiza: lo que queda debajo del fieltro se apaga mientras pasa
  band.render = ctx => {
    if (band.strength < 0.6) return;
    const W = band.width;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    const grad = ctx.createLinearGradient(band.x - W * 1.2, 0, band.x + W * 0.2, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.6)');
    grad.addColorStop(0.9, 'rgba(0,0,0,0.95)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(band.x - W * 1.2, -600, W * 1.4, 2200);
    ctx.globalCompositeOperation = 'lighten';
    for (const p of band.specks) {
      ctx.fillStyle = pressureStyle(WHITE, Math.min(0.75, p.life));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  return band;
}

const COUNT_WORDS = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'];

/** Contar a la Ronda mientras gira: tocar cada punto le da la palabra siguiente y lo tilda. */
async function countRonda(d, g) {
  const w = g.world;
  const ctl = w.get('ronda-ctl');
  ctl.speed = 0.22;
  const counted = [];
  let repeats = 0;
  await d.interact(c => new Promise(resolve => {
    g.setHint(() => ['Una palabra por cada uno, en orden, sin saltear ni repetir.', 'Tocá un punto sin tilde: dice la palabra que sigue.']);
    const refresh = () => g.ui.setSpots(RONDA_IDS.map(id => dotSpot(g, id, counted.includes(id) ? `Uno de la Ronda, ya contado: ${COUNT_WORDS[counted.indexOf(id)]}` : 'Uno de la Ronda, sin contar', () => tap(id))));
    const tap = id => {
      if (!c.alive()) return;
      if (counted.includes(id)) {
        repeats++;
        g.note('Ese ya lo conté.');
        d.evidence('count-ronda-repeat', {id});
        return;
      }
      counted.push(id);
      const dot = w.get(id);
      dot.mark = 1;
      const word = COUNT_WORDS[counted.length - 1];
      w.add(new Custom(`cword-${id}`, {z: 45, render(ctx) {
        chalkText(ctx, word, dot.x, dot.y - dot.lift - 24, {size: 20, align: 'center', p: 0.9});
      }}));
      g.ui.describe(word);
      g.audio.tap(0.15, 1.6 + counted.length * 0.04);
      if (counted.length === RONDA_IDS.length) resolve();
      else refresh();
    };
    refresh();
  }));
  g.setHint(null);
  d.evidence('count-ronda', {n: counted.length, repeats});
  return counted.length;
}

/** Anotar a la Ronda: tocar cada punto hace su marca en la piedra. */
async function recordRonda(d, g) {
  const w = g.world;
  const s = w.get('student');
  const ctl = w.get('ronda-ctl');
  const band = w.get('marea-band');
  const scratch = g.scratch();
  const recorded = new Set(scratch.recorded || []);
  // reconstruir lo ya anotado (si se recargó en medio)
  [...recorded].forEach((id, i) => {
    const m = w.ensure(`mark${i}`, () => markDrawing(i));
    m.progress = 1;
    w.get(id).mark = 1;
  });
  ctl.speed = 0.22;
  let repeats = 0;
  let busy = false;
  await d.interact(ctl2 => new Promise(resolve => {
    g.setHint(() => [
      'Cada punto de la Ronda necesita su marca en la piedra. Ni más ni menos.',
      'Tocá un punto blanco que todavía no tenga su tilde: vas a hacer su marca.',
      () => { const next = RONDA_IDS.find(id => !recorded.has(id)); if (next) onDot(next, true); },
    ]);
    const refresh = () => g.ui.setSpots(RONDA_IDS.map(id => dotSpot(g, id,
      recorded.has(id) ? 'Un punto de la Ronda que ya tiene su marca' : 'Un punto de la Ronda, todavía sin marca',
      () => onDot(id))));
    const onDot = async (id, viaHint = false) => {
      if (busy || !ctl2.alive()) return;
      if (recorded.has(id)) {
        repeats++;
        d.evidence('record-repeat', {id});
        g.note('Ese ya tiene su marca. Una marca por cada uno.');
        await pulse(d, w.get(id), 1, 0.3, 0.18).catch(() => {});
        return;
      }
      busy = true;
      const i = recorded.size;
      recorded.add(id);
      scratch.recorded = [...recorded];
      g.saveNow();
      const dot = w.get(id);
      const [mx, my] = markPos(i);
      const m = w.add(markDrawing(i));
      const link = w.add(new Link(`rec-link-${i}`, () => [dot.x, dot.y - dot.lift], () => [mx, my - 22], {p: 0.55, w: 1.6, z: 7}));
      try {
        s.face(1);
        await d.walk(s, mx - 44, GROUND, 300);
        s.setPose('writeStone', 0.12);
        await d.draw(m, 0.32);
        dot.mark = 1;
        g.audio.tap(0.25, 1.5);
        s.setPose('idle', 0.3);
        if (band) band.x = lerp(1560, 1840, recorded.size / MARKS);
        d.evidence('record', {id, n: recorded.size, viaHint});
        await d.fadeTo(link, 0, 0.5);
        // Punto ayuda: va hasta alguien sin anotar. A la quinta, intenta marcar él también.
        const pp = w.get('punto');
        if (recorded.size === 5) {
          const [nx, ny] = markPos(recorded.size);
          await zip(d, pp, nx, ny - 40, 0.3);
          await zip(d, pp, nx, ny - 6, 0.1);
          g.audio.tap(0.3, 1.3);
          await d.tween(0.4, k => { pp.squash = Math.sin(k * Math.PI) * 0.5; });
          g.audio.punto('sad');
          d.describe('Punto se choca contra la piedra para hacer su propia marca. No le sale nada.');
        }
        const next = RONDA_IDS.find(r => !recorded.has(r));
        if (next) {
          const nd = w.get(next);
          pp.setMode('anchor', {anchor: () => [nd.x, nd.y - 34]});
        } else follow(pp, s);
      } catch {
        return;
      } finally {
        w.remove(link.id);
        busy = false;
      }
      if (recorded.size >= MARKS) {
        g.queueSave();
        resolve();
      } else refresh();
    };
    refresh();
  }));
  g.setHint(null);
  d.evidence('recorded', {count: recorded.size, repeats});
}

// ——————————————————————————————————————————————
// 1.4 La Marea (momento)
// ——————————————————————————————————————————————

export const marea = {
  id: 'c1.marea',
  title: 'La Marea',
  moment: 'La Marea',
  setup(g) {
    const w = g.world;
    base(g, stage('recorded'));
    const s = student(w, STONE.x - 360);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    for (let i = 0; i < 12; i++) {
      const dot = rondaDot(w, i);
      dot.mark = 1;
    }
    rondaDance(w, {speed: 0.35, r: RING.r * 0.9});
    mareaBand(w, 1650);
    g.camera.go(SHOTS.ronda);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const band = w.get('marea-band');
    g.setCinematic(true);
    await d.shot(SHOTS.marea, 1.8);
    band.strength = 1;
    band.width = 520;
    g.audio.marea(7.5);
    d.describe('La Marea llega: un borrador inmenso pasa por todo el pizarrón.');
    s.setPose('hide', 0.4);
    s.face(1);
    p.setMode('anchor', {anchor: () => { const t = s.chalkTip(); return [t[0] + 4, t[1] - 4]; }});
    const scatter = RONDA_IDS.map((id, i) => {
      const dot = w.get(id);
      const a = (i / 12) * Math.PI * 2 + 0.4;
      return {dot, vx: 420 + Math.cos(a) * 260, vy: -160 + Math.sin(a) * 260, hit: false};
    });
    const ghosts = ['g-house', 'g-tree', 'g-spiral', 'g-line', 'g-t1', 'g-t4'].map(id => w.get(id)).filter(Boolean);
    const stoneD = w.get('stone');
    const marks = Array.from({length: MARKS}, (_, i) => w.get(`mark${i}`)).filter(Boolean);
    stopDance(w);
    for (const o of scatter) o.dot.setMode('still');
    let last = 0;
    await d.tween(6.2, k => {
      const dt = Math.max(0, k - last) * 6.2;
      last = k;
      band.x = lerp(900, 3500, k);
      g.camera.shake = Math.max(g.camera.shake, 0.5 * Math.sin(k * Math.PI));
      for (const gh of ghosts) {
        const gx = gh.bbox ? gh.bbox.x + gh.bbox.w / 2 : gh.x;
        if (band.x > gx - 100) gh.fade = Math.max(0.07, gh.fade - dt * 0.8);
      }
      // la piedra y sus marcas se resisten: tiemblan y vuelven
      const near = Math.max(0, 1 - Math.abs(band.x - STONE.x) / 450);
      stoneD.fade = 1 - near * 0.45;
      for (const m of marks) m.fade = 1 - near * 0.55;
      for (const o of scatter) {
        if (!o.hit && band.x > o.dot.x - 150) o.hit = true;
        if (o.hit) {
          o.dot.x += o.vx * dt;
          o.dot.y += o.vy * dt;
          o.vy += 120 * dt;
          o.dot.fade = Math.max(0, o.dot.fade - dt * 0.5);
        }
      }
    });
    for (const o of scatter) {
      o.dot.fade = 0;
      o.dot.visible = false;
    }
    await d.tween(0.8, k => { band.strength = 1 - k; });
    w.remove('marea-band');
    // lo que quedó
    base(g, stage('marea-done'));
    stoneD.fade = 0.85;
    for (const m of marks) m.fade = 0.82;
    g.camera.shake = 0;
    await d.wait(1.4);
    await d.shot(SHOTS.stone, 2.2);
    s.setPose('lookDown', 0.9);
    s.look(0.7, 0.6);
    await d.wait(1);
    d.describe('Todo quedó gris de polvo. En la piedra, las marcas siguen ahí.');
    await d.think('Se llevó todo. Menos las marcas.');
    // la pérdida, de cerca: Punto cae al suelo y tiembla; el estudiante se arrodilla
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, s.x + 74, GROUND - 16, 0.7);
    tremble(p, 2);
    g.audio.punto('sad');
    s.face(0.6);
    s.setPose('kneel', 0.9);
    s.look(1, 0.8);
    await d.shot({x: s.x - 140, y: GROUND - 230, w: 400, h: 250}, 1.8);
    s.gesture = t => ({armR: [0.5 + Math.sin(t * 1.5) * 0.05, -0.4]});
    d.describe('Te arrodillás junto a Punto. Tiembla en el suelo.');
    await d.wait(2.4);
    s.gesture = null;
    g.setCinematic(false);
    s.setPose('idle', 0.8);
    follow(p, s);
  },
};

// ——————————————————————————————————————————————
// 1.5 ¿Están todos?
// ——————————————————————————————————————————————

const RETURNED = RONDA_IDS.filter(id => id !== LINO);
// los que vuelven quedan revueltos sobre la piedra, al alcance
const HOMES = [[1950, 360], [2070, 330], [2200, 370], [2330, 335], [2450, 365], [2560, 410], [2010, 435], [2140, 450], [2270, 440], [2400, 455], [2500, 320]];

function placeReturned(g, links = []) {
  const w = g.world;
  RONDA_IDS.forEach((id, i) => {
    const dot = rondaDot(w, i);
    if (id === LINO) {
      dot.visible = false;
      dot.fade = 0;
      return;
    }
    dot.mark = 0;
    const k = RETURNED.indexOf(id);
    dot.home = HOMES[k];
    if (!links.some(([, b]) => b === id)) {
      dot.x = HOMES[k][0];
      dot.y = HOMES[k][1];
    }
    dot.setMode('wander', {home: HOMES[k], radius: 45 + (k % 3) * 18, speed: 46 + (k % 4) * 10});
  });
  stopDance(w);
}

/** Ubica un punto unido sobre su marca (o entre sus marcas si quedó con dos). */
function anchorLinked(g, links) {
  const w = g.world;
  for (const id of RETURNED.concat([LINO])) {
    const dot = w.get(id);
    if (!dot || !dot.visible) continue;
    const mine = links.filter(([, b]) => b === id);
    if (!mine.length) {
      if (dot.mode === 'anchor') dot.setMode('wander');
      continue;
    }
    const xs = mine.map(([m]) => markPos(Number(m.slice(4)))[0]);
    let ax = xs.reduce((a, b) => a + b, 0) / xs.length;
    // si una marca tiene varios puntos, se reparten a los costados (se ve que son dos)
    if (mine.length === 1) {
      const sharing = links.filter(([m]) => m === mine[0][0]).map(([, b]) => b);
      if (sharing.length > 1) ax += (sharing.indexOf(id) - (sharing.length - 1) / 2) * 22;
    }
    dot.setMode('anchor', {anchor: () => [ax, PAIRED_Y + Math.sin(performance.now() / 500 + ax) * 2]});
  }
}

function syncLinks(g, links) {
  const w = g.world;
  w.removeWhere(o => o.id.startsWith('pair-'));
  for (const [m, dId] of links) {
    const i = Number(m.slice(4));
    const dot = w.get(dId);
    const [mx, my] = markPos(i);
    w.add(new Link(`pair-${m}-${dId}`, () => [mx, my - 22], () => [dot.x, dot.y - dot.lift], {p: 0.8, w: 2.1, z: 7, dash: true, gap: 10}));
  }
  anchorLinked(g, links);
}

export const vuelven = {
  id: 'c1.vuelven',
  title: '¿Están todos?',
  setup(g) {
    const w = g.world;
    base(g, stage('marea-done'));
    w.remove('marea-band');
    const s = student(w, STONE.x - 360);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    const links = g.scratch('c1.vuelven').links || [];
    placeReturned(g, links);
    syncLinks(g, links);
    w.remove('title-card');
    g.camera.go(SHOTS.stone);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const scratch = g.scratch();
    g.setCinematic(true);
    const resumed = (scratch.links || []).length > 0;
    if (!resumed) {
      for (const id of RETURNED) {
        const dot = w.get(id);
        dot.visible = false;
        dot.fade = 0;
      }
      await d.shot(SHOTS.ronda, 1.8);
      d.describe('Los puntos vuelven de a uno, desde los bordes, desorientados.');
      for (const [k, id] of RETURNED.entries()) {
        const dot = w.get(id);
        dot.visible = true;
        dot.x = d.skipping ? HOMES[k][0] : k % 2 ? 2900 : 1880;
        dot.y = d.skipping ? HOMES[k][1] : 250 + (k * 53) % 300;
        dot.fade = 1;
        g.audio.tap(0.15, 2.2 + (k % 3) * 0.2);
        await d.wait(0.28);
      }
      await d.wait(0.6);
      // Punto revisa, frenético
      tremble(p, 0.6);
      for (const id of [RETURNED[2], RETURNED[7], RETURNED[4], RETURNED[9]]) {
        const t = w.get(id);
        await zip(d, p, t.x + 20, t.y - 22, 0.22);
        g.audio.punto('hop');
      }
      await zip(d, p, s.x + 60, GROUND - 170, 0.35);
      follow(p, s);
      g.audio.punto('question');
      const title = w.add(new Label('title-card', '¿Están todos?', SHOTS.ronda.x + SHOTS.ronda.w / 2, 330, {size: 92, align: 'center', reveal: 0, z: 50, weight: 700}));
      await d.draw(title, 1.6, {key: 'reveal'});
      await d.wait(1.2);
      await d.fadeTo(title, 0, 1);
      w.remove('title-card');
      await d.think('No paran de moverse.');
      s.setPose('lookDown', 0.6);
      await d.shot(SHOTS.pairing, 1.2);
      await d.think('Cada marca era uno de ellos.');
      s.setPose('idle', 0.5);
    } else {
      await d.shot(SHOTS.pairing, 1);
      await d.think('Seguía uniendo marcas con puntos.');
    }
    g.setCinematic(false);
    const result = await pairing(d, g);
    g.flags.pairs = result.links;
    g.flags.freeMark = result.freeMark;
    s.setPose('idle', 0.4);
    await d.think('Quedó una marca sola.');
  },
};

/** Emparejar marcas con puntos y comprobar. */
/**
 * Emparejar marcas con puntos y comprobar. `dots`: los puntos tocables; `done`: el veredicto
 * que termina la escena ('left-more' cuando falta alguien, 'equal' cuando están todos).
 */
async function pairing(d, g, {dots = RETURNED, done = 'left-more', initial} = {}) {
  const w = g.world;
  const s = w.get('student');
  const p = w.get('punto');
  const scratch = g.scratch();
  let links = scratch.links || initial || [];
  const RETURNED_ = dots;
  const markIds = Array.from({length: MARKS}, (_, i) => `mark${i}`);
  let selected = null;
  let checking = false;
  let checks = 0;
  const nearMark = x => Math.max(1, Math.min(MARKS, Math.round((x - markPos(0)[0]) / (markPos(1)[0] - markPos(0)[0])) + 1));
  const label = id => {
    if (id.startsWith('mark')) {
      const n = links.filter(([m]) => m === id).length;
      const pos = Number(id.slice(4)) + 1;
      return `Marca ${pos} de la piedra, desde la izquierda, ${n === 0 ? 'sin unir' : n === 1 ? 'unida a un punto' : `unida a ${n} puntos`}`;
    }
    const n = links.filter(([, b]) => b === id).length;
    const where = `cerca de la marca ${nearMark(w.get(id).x)}`;
    return n === 0 ? `Un punto de la Ronda, sin unir, ${where}` : n === 1 ? `Un punto de la Ronda, unido a una marca, ${where}` : `Un punto de la Ronda, unido a ${n} marcas, ${where}`;
  };
  return d.interact(ctl => new Promise(resolve => {
    g.setHint(() => [
      'Cada marca era uno de la Ronda. ¿A cada marca le toca un punto?',
      'Tocá una marca de la piedra y después un punto blanco: quedan unidos con una línea. Tocar el mismo par otra vez los separa.',
      () => {
        const fm = markIds.find(m => !links.some(([x]) => x === m));
        const fd = RETURNED_.find(b => !links.some(([, y]) => y === b));
        if (fm && fd) { selected = fm; choose(fd, true); }
      },
      'Cuando no puedas unir más, tocá "comprobar": Punto va a recorrer cada unión.',
    ]);
    const refresh = () => {
      const spots = [];
      for (const [i, m] of markIds.entries()) spots.push(rectSpot(m, label(m), markRect(i), () => choose(m), {selected: selected === m}));
      for (const id of RETURNED_) spots.push(dotSpot(g, id, label(id), () => choose(id), {selected: selected === id}));
      if (links.length) {
        const [cx] = markPos(MARKS - 1);
        spots.push(wordSpot('check', 'comprobar', cx + 120, PAIRED_Y - 70, () => check()));
      }
      g.ui.setSpots(spots);
    };
    const choose = (id, viaHint = false) => {
      if (checking || !ctl.alive()) return;
      g.audio.tap(0.18, 1.7);
      if (!selected) {
        selected = id;
        refresh();
        return;
      }
      if (selected === id) {
        selected = null;
        refresh();
        return;
      }
      const aMark = selected.startsWith('mark'), bMark = id.startsWith('mark');
      if (aMark === bMark) {
        selected = id; // cambia la selección dentro del mismo tipo
        refresh();
        return;
      }
      const m = aMark ? selected : id;
      const dot = aMark ? id : selected;
      const before = links.length;
      links = togglePair(links, m, dot);
      d.evidence(links.length > before ? 'pair' : 'unpair', {mark: m, dot, viaHint});
      scratch.links = links;
      g.saveNow();
      selected = null;
      syncLinks(g, links);
      refresh();
    };
    const check = async () => {
      if (checking || !ctl.alive()) return;
      checking = true;
      checks++;
      g.ui.setSpots([]);
      const r = evaluatePairs(markIds, RETURNED_, links);
      d.evidence('check', {verdict: r.verdict, pairs: links.length, double: r.doubleRight.length ? 'dot' : r.doubleLeft.length ? 'mark' : null, final: done === 'equal'});
      try {
        p.setMode('still');
        // Punto recorre las uniones de izquierda a derecha
        let note = 0;
        for (const m of markIds) {
          const mine = links.filter(([x]) => x === m);
          if (!mine.length) continue;
          const dot = w.get(mine[0][1]);
          await zip(d, p, dot.x, dot.y - 30, 0.2);
          if (r.doubleRight.includes(dot.id)) break;
          g.audio.note(440 * Math.pow(2, [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26][note % 12] / 12), 0, 0.5, {gain: 0.05, bus: 'sfx'});
          note++;
          w.get(`pair-${m}-${dot.id}`).flash = 1;
        }
        if (r.verdict === 'invalid') {
          const bad = w.get(r.doubleRight[0] || links.find(([x]) => r.doubleLeft.includes(x))[1]);
          await zip(d, p, bad.x + 20, bad.y - 34, 0.25);
          tremble(p, 1);
          g.audio.punto('no');
          g.note(r.doubleRight.length
            ? 'Este punto quedó unido a dos marcas. Pero es uno solo: le corresponde una.'
            : 'Una marca quedó unida a dos puntos. Cada marca era de uno solo.');
        } else if (r.verdict === 'incomplete') {
          const fm = markPos(Number(r.freeLeft[0].slice(4)));
          await zip(d, p, fm[0], fm[1] - 50, 0.3);
          const fd = w.get(r.freeRight[0]);
          await zip(d, p, fd.x + 16, fd.y - 30, 0.35);
          g.audio.punto('question');
          g.note('Quedan marcas sin punto y puntos sin marca. Así todavía no se sabe.');
        } else if (r.verdict === done && done === 'equal') {
          follow(p, s);
          g.setHint(null);
          checking = false;
          resolve({links, checks});
          return;
        } else if (r.verdict === 'left-more' && done === 'left-more') {
          const free = r.freeLeft[0];
          const [fx, fy] = markPos(Number(free.slice(4)));
          await zip(d, p, fx, fy - 56, 0.4);
          await d.wait(0.5);
          g.audio.punto('question');
          await d.wait(0.6);
          follow(p, s);
          g.setHint(null);
          checking = false;
          resolve({links, freeMark: free, checks});
          return;
        }
        follow(p, s);
      } catch {
        return;
      }
      checking = false;
      refresh();
    };
    refresh();
  }));
}

// ——————————————————————————————————————————————
// 1.6 Quién falta
// ——————————————————————————————————————————————

function restorePaired(g) {
  const w = g.world;
  const links = (g.flags.pairs || RETURNED.map((id, i) => [`mark${i}`, id])).filter(([, b]) => b !== LINO);
  placeReturned(g, links);
  syncLinks(g, links);
  return links;
}

export const quien = {
  id: 'c1.quien',
  title: 'Quién',
  setup(g) {
    const w = g.world;
    base(g, stage('paired'));
    const s = student(w, STONE.x - 360);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    restorePaired(g);
    w.remove('free-ring');
    g.camera.go(SHOTS.ronda);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const free = g.flags.freeMark || 'mark11';
    const [fx, fy] = markPos(Number(free.slice(4)));
    const m = w.get(free);
    await d.shot(SHOTS.stone, 1.4);
    // la marca sola tiembla un poco
    const ring = w.add(new Drawing('free-ring', [art.S(art.circleGuideFor(fx, fy, 30), 991, {w: 2, p: 0.6, ch: YELLOW})], {z: 8, progress: 0}));
    await d.draw(ring, 0.8);
    const options = [
      {id: 'missing', text: 'Que falta uno de ellos.'},
      {id: 'mistake', text: 'Que hice una marca de más.'},
      {id: 'extra', text: 'Que sobra un punto.'},
    ];
    const qs = g.scratch();
    let reading = qs.reading;
    for (; !reading;) {
      reading = await d.choose(options, {prompt: '¿Qué quiere decir esa marca sola?', evaluate: true});
      d.evidence('interpret', {reading});
      if (reading === 'extra') {
        // Punto busca un punto sin línea: no hay ninguno
        g.setCinematic(true);
        p.setMode('still');
        for (const id of [...RETURNED].sort((x, y) => w.get(x).x - w.get(y).x)) {
          const t = w.get(id);
          await zip(d, p, t.x, t.y - 28, 0.12);
          const link = w.objects.find(o => o.id.startsWith('pair-') && o.id.endsWith(`-${id}`));
          if (link) link.flash = 1;
        }
        await zip(d, p, fx, fy - 54, 0.4);
        await pulse(d, p, 2, 0.35);
        g.setCinematic(false);
        await d.think('Ningún punto quedó sin marca. La que quedó sola es una marca.');
        options.splice(options.findIndex(o => o.id === 'extra'), 1);
        follow(p, s);
        reading = null;
        continue;
      }
      if (reading === 'mistake') {
        // ir a borrarla: Punto se interpone y revisa que nadie tenga dos marcas
        g.setCinematic(true);
        s.face(1);
        const voice = g.audio.erase(0.6, 0.3);
        const go = d.walk(s, fx - 60, GROUND, 150);
        p.setMode('still');
        await zip(d, p, fx - 26, fy - 30, 0.5);
        tremble(p, 1.2);
        g.audio.punto('no');
        await go;
        voice?.stop?.();
        s.setPose('surprise', 0.2);
        d.describe('Punto no te deja borrarla. Recuerda la mañana: debajo de las marcas aparece, tenue, una hilera con los que pasaron entonces, uno debajo de cada marca. Doce marcas, doce puntos: una marca por toque.');
        const memo = [];
        const [m0x] = markPos(0);
        const memoLabel = w.add(new Label('memo-l', 'esta mañana', m0x - 40, GROUND + 70, {size: 24, align: 'right', z: 7, fade: 0.6}));
        memo.push(memoLabel);
        for (let i = 0; i < MARKS; i++) {
          const [mx, my] = markPos(i);
          await zip(d, p, mx, my - 40, 0.12);
          const gd = w.add(new Dot(`memo${i}`, mx, GROUND + 62, {r: 7, z: 7}));
          gd.fade = 0.5;
          memo.push(gd);
          g.audio.tap(0.1, 1.5 + i * 0.04);
        }
        await zip(d, p, fx, fy - 54, 0.3);
        s.setPose('idle', 0.5);
        g.setCinematic(false);
        await d.think('Esta mañana pasaron doce y anoté doce: una marca cada vez que tocaba a uno. Ninguna de más.');
        await d.think('Esta noche volvieron once. Alguien no volvió.');
        await d.all(...memo.map(o => d.fadeTo(o, 0, 0.5)));
        for (const o of memo) w.remove(o.id);
        await d.walk(s, STONE.x - 360, GROUND, 170);
        follow(p, s);
      }
      break;
    }
    g.flags.reading = reading;
    qs.reading = reading;
    g.saveNow();
    w.remove('free-ring');
    // Punto revisa uno por uno: él sí sabe quién es quién
    g.setCinematic(true);
    p.setMode('still');
    d.describe('Punto recorre a los que volvieron, uno por uno, mirándolos de cerca.');
    const order = [...RETURNED].sort((a, b) => w.get(a).x - w.get(b).x);
    for (const id of order) {
      const t = w.get(id);
      await zip(d, p, t.x, t.y - 26, 0.16);
      t.lift = 6;
      await d.wait(0.08);
      t.lift = 0;
    }
    await d.wait(0.4);
    tremble(p, 1.5);
    g.audio.cue('loss');
    g.audio.punto('sad');
    await zip(d, p, fx, fy - 54, 0.6);
    await d.shot({x: fx - 230, y: fy - 230, w: 460, h: 270}, 1.2);
    await d.wait(1.1);
    // Punto imita al que falta: un saltito tarde, apurado, como el más chico
    d.describe('Punto da saltitos atrasados y apurados, igual que el más chico de la Ronda.');
    p.setMode('still');
    const hx = fx + 40, hy = fy - 60;
    for (let i = 0; i < 3; i++) {
      await d.wait(0.25);
      await d.tween(0.22, k => { p.x = hx + i * 18; p.y = hy - Math.sin(k * Math.PI) * 16; p.scale = 0.7; });
      g.audio.tap(0.12, 2.4);
    }
    p.scale = 1;
    g.setCinematic(false);
    await d.think('Las marcas saben cuántos. No saben quién. Punto sí.');
    await d.shot(SHOTS.pairing, 1);
    await zip(d, p, s.x + 70, GROUND - 170, 0.5);
    await d.say('student', '¿El más chico? ¿El que llegaba tarde?');
    await hop(d, p, p.x, p.y, {g, sound: 'yes', h: 14});
    await hop(d, p, p.x, p.y, {g, sound: null, h: 14});
    follow(p, s);
    await d.say('student', 'Vamos a buscarlo.');
    await d.shot(SHOTS.ronda, 1.2);
    await d.interact(() => new Promise(resolve => {
      g.setHint(() => ['La Marea vino desde la izquierda y siguió hacia la derecha. Lo que arrastró quedó más allá.', 'Tocá "buscar" a la derecha de la escena.']);
      g.ui.setSpots([wordSpot('go-search', 'buscar →', SHOTS.ronda.x + SHOTS.ronda.w - 150, GROUND - 40, () => resolve())]);
    }));
    g.setHint(null);
    s.face(1);
    g.setCinematic(true);
    await d.all(d.walk(s, FIELD.crack[0] - 160, GROUND, 200), d.shot(SHOTS.field, 4.6));
  },
};

// ——————————————————————————————————————————————
// 1.7 La búsqueda
// ——————————————————————————————————————————————

export const busqueda = {
  id: 'c1.busqueda',
  title: 'La búsqueda',
  setup(g) {
    const w = g.world;
    base(g, stage('paired'));
    restorePaired(g);
    const s = student(w, FIELD.crack[0] - 160);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    w.ensure('crack', () => new Drawing('crack', art.crack('crack', FIELD.crack[0] - 20, GROUND - 160, FIELD.crack[0] + 20, GROUND + 30), {z: 2}));
    w.ensure('old-marks', () => new Drawing('old-marks', [0, 1, 2, 3, 4, 5, 6].flatMap(i => art.tally(`old${i}`, FIELD.house[0] + 140 + i * 16, GROUND - 40, 30)), {z: 2, fade: 0.38}));
    const lino = rondaDot(w, RONDA_IDS.indexOf(LINO));
    lino.visible = true;
    lino.x = FIELD.smudge[0];
    lino.y = FIELD.smudge[1];
    lino.setMode('still');
    lino.fade = 0.16;
    g.camera.go(SHOTS.field);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const lino = w.get(LINO);
    const scratch = g.scratch();
    const seen = new Set(scratch.seen || []);
    g.setCinematic(false);
    await d.think('Por acá tiene que estar.');
    // Punto brilla más cuanto más cerca está del que falta
    w.add(new Custom('glow-ctl', {update() {
      const dd = Math.hypot(p.x - lino.x, p.y - lino.y);
      p.glow = Math.max(0, 1 - dd / 700);
      p.scale = 1 + p.glow * 0.3;
    }}));
    d.describe('Punto brilla más fuerte cuanto más se acerca a la mancha gris.');
    const places = {
      crack: {label: 'Mirar la grieta', at: FIELD.crack, x: FIELD.crack[0] - 70},
      house: {label: 'Mirar la casa borrada', at: FIELD.house, x: FIELD.house[0] + 90},
      smudge: {label: 'Mirar la mancha gris', at: FIELD.smudge, x: FIELD.smudge[0] - 80},
    };
    let found = false;
    while (!found) {
      const which = await d.interact(() => new Promise(resolve => {
        g.setHint(() => ['Hay tres lugares donde algo chico podría quedar atrapado.', 'Probá en la mancha más gris: el polvo tapa lo que está debajo.']);
        g.ui.setSpots(Object.entries(places).filter(([k]) => !seen.has(k) || k === 'smudge').map(([k, v]) =>
          rectSpot(`look-${k}`, v.label, {x: v.at[0] - 70, y: v.at[1] - 90, w: 140, h: 130}, () => resolve(k))));
      }));
      g.setHint(null);
      seen.add(which);
      scratch.seen = [...seen];
      d.evidence('search', {place: which});
      const pl = places[which];
      s.face(pl.x > s.x ? 1 : -1);
      await d.walk(s, pl.x, GROUND, 230);
      s.face(0.6);
      if (which === 'crack') {
        s.setPose('lean', 0.4);
        await zip(d, p, FIELD.crack[0], GROUND - 80, 0.4);
        await d.think('Nadie.');
        s.setPose('idle', 0.4);
        follow(p, s);
      } else if (which === 'house') {
        s.setPose('lookDown', 0.5);
        await zip(d, p, FIELD.house[0] + 190, GROUND - 90, 0.5);
        await d.think('Alguien anotó acá, hace mucho.');
        s.setPose('idle', 0.4);
        follow(p, s);
      } else {
        s.setPose('crouch', 0.5);
        s.look(0.8, 0.6);
        await d.shot({x: FIELD.smudge[0] - 230, y: FIELD.smudge[1] - 170, w: 460, h: 260}, 1.4);
        await d.wait(0.6);
        await d.think('Ahí. Debajo del polvo.');
        found = true;
      }
    }
    // repasarlo con tiza
    await d.interact(() => new Promise(resolve => {
      g.setHint(() => ['Lo que la Marea dejó a medias se puede volver a trazar.', 'Tocá el punto apagado para repasarlo con tu tiza.']);
      g.ui.setSpots([dotSpot(g, LINO, 'Repasar con tiza al punto apagado', () => resolve())]);
    }));
    g.setHint(null);
    g.setCinematic(true);
    s.setPose('writeLow', 0.3);
    const voice = g.audio.chalkStart(1.6, 0.8);
    await d.tween(1.6, k => { lino.fade = 0.16 + 0.84 * k; lino.scale = 0.7 + 0.3 * k; });
    voice?.stop();
    lino.fade = 1;
    lino.scale = 1;
    g.audio.cue('found');
    tremble(lino, 0.6);
    await hop(d, lino, lino.x, lino.y - 30, {g, sound: 'tap', h: 30});
    d.describe('El punto más chico se enciende de nuevo y salta. Punto corre hacia él y giran juntos.');
    p.setMode('still');
    await zip(d, p, lino.x + 30, lino.y - 10, 0.4);
    const cx = (lino.x + p.x) / 2, cy = (lino.y + p.y) / 2;
    g.audio.punto('happy');
    await d.tween(1.8, k => {
      const a = k * Math.PI * 4;
      p.x = cx + Math.cos(a) * 26;
      p.y = cy + Math.sin(a) * 18;
      lino.x = cx - Math.cos(a) * 26;
      lino.y = cy - Math.sin(a) * 18;
    }, easeInOut);
    s.setPose('idle', 0.6);
    w.remove('glow-ctl');
    p.glow = 0;
    p.scale = 1;
    await d.think('Lo encontramos.');
    g.flags.found = true;
    // de vuelta a la piedra, los tres juntos
    g.setCinematic(true);
    follow(p, s);
    lino.setMode('anchor', {anchor: () => [p.x + 26, p.y + 14 + Math.sin(performance.now() / 300) * 4]});
    s.face(-1);
    await d.all(d.walk(s, STONE.x - 360, GROUND, 210), d.shot(SHOTS.pairing, (FIELD.crack[0] - STONE.x) / 210 + 1));
    s.face(0.6);
    await hop(d, lino, STONE.x + STONE.w / 2 + 50, GROUND - 14, {g, sound: 'tap', h: 30});
    lino.setMode('bob', {home: [lino.x, lino.y]});
    g.setCinematic(false);
  },
};

// ——————————————————————————————————————————————
// 1.8 Todos (momento)
// ——————————————————————————————————————————————

export const todos = {
  id: 'c1.todos',
  title: 'Todos',
  moment: 'Todos: a cada marca, uno',
  setup(g) {
    const w = g.world;
    base(g, stage('found'));
    restorePaired(g);
    w.removeWhere(o => o.id.startsWith('rstar'));
    const s = student(w, STONE.x - 360);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    const lino = rondaDot(w, RONDA_IDS.indexOf(LINO));
    lino.visible = true;
    lino.fade = 1;
    // el más chico espera en el suelo, delante de la piedra: ninguna marca es "la suya" todavía
    lino.x = STONE.x + STONE.w / 2 + 50;
    lino.y = GROUND - 14;
    lino.setMode('bob', {home: [lino.x, lino.y]});
    w.removeWhere(o => o.id === 'free-ring');
    g.camera.go(SHOTS.pairing);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const lino = w.get(LINO);
    const free = g.flags.freeMark || 'mark11';
    const before = (g.flags.pairs || RETURNED.map((id, i) => [`mark${i}`, id])).filter(([, b]) => b !== LINO);
    await d.shot(SHOTS.pairing, 1);
    let links;
    if (replay) {
      links = [...before, [free, LINO]];
      syncLinks(g, links);
      await d.wait(1);
      p.setMode('still');
      for (const [n, m] of Array.from({length: MARKS}, (_, i) => `mark${i}`).entries()) {
        const pair = links.find(([x]) => x === m);
        const dot = w.get(pair[1]);
        await zip(d, p, dot.x, dot.y - 30, 0.18);
        g.audio.note(293.66 * Math.pow(2, [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26][n] / 12), 0, 0.8, {gain: 0.05, bus: 'sfx'});
        w.get(`pair-${m}-${dot.id}`).flash = 1;
      }
    } else {
      await d.think('Ahora sí.');
      const r = await pairing(d, g, {dots: RONDA_IDS, done: 'equal', initial: before});
      links = r.links;
    }
    g.flags.pairs = links;
    g.audio.cue('all');
    await d.wait(0.6);
    s.setPose('cheer', 0.4);
    await d.say('student', 'Están todos.');
    // la Ronda vuelve a bailar: primero de cerca, Punto junto al más chico
    g.setCinematic(true);
    w.removeWhere(o => o.id.startsWith('pair-'));
    const ctl = rondaDance(w, {speed: 0.5});
    p.setMode('anchor', {anchor: () => [lino.x + 22, lino.y - 8 + Math.sin(performance.now() / 160) * 4]});
    d.describe('La Ronda vuelve a bailar, completa. Punto baila pegado al más chico.');
    await d.tween(3, () => { g.camera.go({x: lino.x - 230, y: lino.y - 140, w: 460, h: 260}); });
    await d.shot({x: RING.x - 420, y: RING.y - 230, w: 840, h: 460}, 1.8);
    s.setPose('idle', 0.8);
    await d.wait(1.4);
    // cae la noche sobre la ronda
    const r0 = g.renderer;
    const tint0 = [...r0.tint];
    const rstars = [[RING.x - 380, 60, 6], [RING.x - 120, 20, 8], [RING.x + 160, 70, 5], [RING.x + 420, 30, 7], [RING.x - 250, 150, 4], [RING.x + 300, 170, 5]];
    const drawn = rstars.map(([x, y, rr], i) => w.add(new Drawing(`rstar${i}`, art.star(`rstar${i}`, x, y, rr), {z: 1, progress: 0})));
    g.audio.cue('night');
    await d.all(
      d.shot({x: RING.x - 600, y: -60, w: 1200, h: 560}, 3.2),
      d.tween(3.2, k => {
        r0.dim = 1 - 0.1 * k;
        r0.tint = [lerp(tint0[0], 0.88, k), lerp(tint0[1], 0.94, k), lerp(tint0[2], 1.1, k)];
      }),
      (async () => { for (const st of drawn) await d.draw(st, 0.4, {sound: false}); })(),
    );
    ctl.speed = 0.35;
    await d.wait(0.8);
    g.setCinematic(false);
    if (!replay) g.flags.all = true;
  },
};

// ——————————————————————————————————————————————
// 1.9 Las gradas (transferencia)
// ——————————————————————————————————————————————

// La fila: la Ronda y Punto (trece). Las gradas: catorce asientos, compactas.
const LINE_IDS = [...RONDA_IDS.slice(0, 6), 'punto', ...RONDA_IDS.slice(6)];

function linePos(k, gap = LINE_GAP, x0 = LINE_X0) {
  return [x0 + k * gap, GROUND - 14];
}

function bottomRightSeat(seats) {
  return seats.reduce((best, pos, j) => (pos[1] > seats[best][1] + 1 || (Math.abs(pos[1] - seats[best][1]) < 1 && pos[0] > seats[best][0]) ? j : best), 0);
}

/** Quién está sentado dónde al final: todos salvo el asiento de abajo a la derecha. */
function seatedMap(g) {
  if (g.flags.seated && Object.keys(g.flags.seated).length === LINE_IDS.length) return g.flags.seated;
  const seats = art.seatPositions(GRADAS.x, GROUND, GRADAS.seats);
  const free = bottomRightSeat(seats);
  const map = {};
  let k = 0;
  seats.forEach((_, j) => { if (j !== free && k < LINE_IDS.length) map[j] = LINE_IDS[k++]; });
  g.flags.seated = map;
  return map;
}

function lineDot(w, id) {
  return id === 'punto' ? w.get('punto') : rondaDot(w, RONDA_IDS.indexOf(id));
}

export const gradas = {
  id: 'c1.gradas',
  title: 'Las gradas',
  setup(g) {
    const w = g.world;
    base(g, stage('night'));
    w.removeWhere(o => o.id.startsWith('pair-') || o.id === 'crack' || o.id === 'old-marks' || o.id === 'seat-ring');
    stopDance(w);
    student(w, LINE_X0 - 110);
    punto(w, 0, 0);
    const scratch = g.scratch('c1.gradas');
    const seats = art.seatPositions(GRADAS.x, GROUND, GRADAS.seats);
    const seated = scratch.seated || {};
    LINE_IDS.forEach((id, k) => {
      const dot = lineDot(w, id);
      dot.visible = true;
      dot.fade = 1;
      dot.mark = 0;
      const seat = Object.entries(seated).find(([, who]) => who === id);
      const [x, y] = seat ? [seats[+seat[0]][0], seats[+seat[0]][1] - 14] : scratch.squeezed ? squeezedPos(k) : linePos(k);
      dot.x = x;
      dot.y = y;
      dot.setMode('bob', {home: [x, y]});
    });
    g.camera.go(SHOTS.gradas);
  },
  async play(d, g) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const scratch = g.scratch();
    const seats = art.seatPositions(GRADAS.x, GROUND, GRADAS.seats);
    const seated = scratch.seated || {};
    if (!scratch.prediction) {
      // del cielo de la ronda al cielo de las gradas: las mismas estrellas
      g.setCinematic(true);
      g.camera.go(SHOTS.sky);
      for (let i = 0; i < 12; i++) {
        const st = w.get(`star${i}`);
        if (st) st.progress = 0;
      }
      for (let i = 0; i < 12; i++) {
        const st = w.get(`star${i}`);
        if (st) await d.draw(st, 0.16, {sound: false});
      }
      await d.shot(SHOTS.gradas, 2.6);
      g.setCinematic(false);
      s.setPose('lookUp', 0.6);
      s.look(1, -0.4);
      await d.think('Unas gradas. ¿Habrá lugar para la Ronda y Punto?');
      s.setPose('idle', 0.6);
      await d.think('¿Y para mí?');
      // Punto compara a ojo: la fila es larguísima; las gradas, cortas
      g.setCinematic(true);
      const [x0] = linePos(0);
      const [x1] = linePos(LINE_IDS.length - 1);
      p.setMode('still');
      await zip(d, p, x0, GROUND - 60, 0.45);
      await d.tween(1.1, k => { p.x = lerp(x0, x1, k); p.squash = 0.4; }, easeInOut);
      p.squash = 0;
      const half = 158;
      await zip(d, p, GRADAS.x - half, GROUND - 170, 0.4);
      await d.tween(0.5, k => { p.x = lerp(GRADAS.x - half, GRADAS.x + half, k); }, easeInOut);
      tremble(p, 1);
      g.audio.punto('scared');
      d.describe('Punto recorre la fila, larguísima, y después las gradas, mucho más cortas. Tiembla.');
      const [hx, hy] = linePos(LINE_IDS.indexOf('punto'));
      await zip(d, p, hx, hy, 0.5);
      p.setMode('bob', {home: [hx, hy]});
      g.setCinematic(false);
      const prediction = await d.choose([
        {id: 'no', text: 'No alcanzan.'},
        {id: 'justo', text: 'Alcanzan justo.'},
        {id: 'sobra', text: 'Alcanzan y sobra lugar.'},
        {id: 'nose', text: 'Todavía no sé.'},
      ], {prompt: 'Así, en fila, ¿alcanzan los asientos para la Ronda y Punto?', evaluate: true});
      scratch.prediction = prediction;
      g.flags.prediction = prediction;
      if (prediction !== 'nose') {
        scratch.why = await d.choose([
          {id: 'count', text: 'Los conté.'},
          {id: 'look', text: 'Por cómo se ve.'},
        ], {prompt: '¿Cómo lo sabés?'});
        g.flags.why = scratch.why;
      }
      d.evidence('predict', {prediction, why: scratch.why || null});
      g.queueSave();
    }
    // sentar: tres los elige el jugador; después Punto sigue solo
    const waiting = () => LINE_IDS.filter(id => !Object.values(seated).includes(id));
    if (Object.keys(seated).length < 3) {
      await d.think('Uno por asiento.');
      await d.interact(ctl => new Promise(resolve => {
        let sel = null;
        let busy = false;
        g.setHint(() => [
          'Cada asiento es para uno solo, y cada uno de la fila necesita un asiento.',
          'Tocá a alguien de la fila y después un asiento libre.',
        ]);
        const refresh = () => {
          const spots = waiting().map(id => dotSpot(g, id, id === 'punto' ? 'Punto, en la fila' : 'Uno de la Ronda, en la fila', () => pick(id), {selected: sel === id}));
          seats.forEach((pos, j) => spots.push(rectSpot(`seat${j}`, seated[j] ? 'Asiento ocupado' : 'Asiento libre', {x: pos[0] - 22, y: pos[1] - 40, w: 44, h: 46}, () => pick(`seat${j}`), {selected: sel === `seat${j}`})));
          g.ui.setSpots(spots);
        };
        const pick = async id => {
          if (busy || !ctl.alive()) return;
          g.audio.tap(0.16, 1.7);
          const isSeat = id.startsWith('seat');
          if (isSeat && seated[+id.slice(4)]) {
            g.note('Ese asiento ya tiene a alguien.');
            d.evidence('seat-taken', {seat: +id.slice(4)});
            return;
          }
          if (!sel || sel === id || sel.startsWith('seat') === isSeat) {
            sel = sel === id ? null : id;
            refresh();
            return;
          }
          const j = +(isSeat ? id : sel).slice(4);
          const who = isSeat ? sel : id;
          sel = null;
          busy = true;
          seated[j] = who;
          scratch.seated = seated;
          g.saveNow();
          d.evidence('seat', {seat: j, who});
          try {
            const dot = w.get(who);
            await hop(d, dot, seats[j][0], seats[j][1] - 14, {g, sound: who === 'punto' ? 'hop' : 'tap', h: 60, dur: 0.42});
            dot.setMode('bob', {home: [dot.x, dot.y]});
          } catch {
            return;
          }
          busy = false;
          if (Object.keys(seated).length >= 3) resolve();
          else refresh();
        };
        refresh();
      }));
      g.setHint(null);
    }
    // Punto entendió el juego: sienta a los demás, de a uno
    g.setCinematic(true);
    d.describe('Punto entendió: lleva a cada uno de la fila a un asiento libre, de a uno.');
    const br = bottomRightSeat(seats);
    for (const who of waiting()) {
      const freeSeats = seats.map((_, j) => j).filter(j => !seated[j]);
      const j = freeSeats.find(f => f !== br) ?? freeSeats[0];
      if (j == null) break;
      const dot = w.get(who);
      if (who !== 'punto') {
        p.setMode('still');
        await zip(d, p, dot.x, dot.y - 26, 0.16);
      }
      seated[j] = who;
      await hop(d, dot, seats[j][0], seats[j][1] - 14, {g, sound: 'tap', h: 50, dur: 0.32});
      dot.setMode('bob', {home: [dot.x, dot.y]});
    }
    scratch.seated = seated;
    g.queueSave();
    const freeSeat = seats.findIndex((_, j) => !seated[j]);
    await d.shot({x: GRADAS.x - 360, y: GROUND - 330, w: 720, h: 400}, 1.2);
    const [sx, sy] = seats[freeSeat];
    const ring = w.add(new Drawing('seat-ring', [art.S(art.circleGuideFor(sx, sy - 10, 26), 551, {w: 2, p: 0.6, ch: YELLOW})], {z: 8, progress: 0}));
    await d.draw(ring, 0.7);
    g.setCinematic(false);
    const readings = [
      {id: 'seats', text: 'Había más asientos que en la fila.'},
      {id: 'line', text: 'Había más en la fila que asientos.'},
      {id: 'same', text: 'Eran la misma cantidad.'},
    ];
    for (;;) {
      const r = await d.choose(readings, {prompt: 'Quedó un asiento libre. ¿Qué quiere decir?', evaluate: true});
      d.evidence('interpret-seat', {reading: r});
      if (r === 'seats') break;
      g.setCinematic(true);
      p.setMode('still');
      if (r === 'line') {
        // Punto busca a alguien que se haya quedado parado: no hay nadie
        d.describe('Punto recorre el lugar de la fila buscando a alguien sin asiento. No queda nadie.');
        await zip(d, p, squeezedPos(0)[0], GROUND - 40, 0.4);
        await d.tween(0.9, k => { p.x = lerp(squeezedPos(0)[0], linePos(LINE_IDS.length - 1)[0], k); });
        g.audio.punto('question');
      } else {
        // Punto salta sobre el asiento libre: está vacío
        d.describe('Punto salta sobre el asiento libre: está vacío.');
        await zip(d, p, sx, sy - 40, 0.4);
        await hop(d, p, sx, sy - 18, {g, sound: 'hop', h: 30});
        await hop(d, p, sx, sy - 18, {g, sound: 'hop', h: 30});
      }
      await zip(d, p, sx, sy - 50, 0.3);
      p.setMode('bob', {home: [p.x, p.y]});
      g.setCinematic(false);
      await d.think(r === 'line' ? 'Nadie quedó parado. Lo que sobró es un asiento.' : 'Si fueran los mismos, no sobraría nada.');
      readings.splice(readings.findIndex(o => o.id === r), 1);
    }
    const pred = scratch.prediction, why = scratch.why;
    const line = pred === 'no' ? (why === 'count' ? 'Si los conté, algo conté mal: sobró un asiento.' : 'Punto y yo pensábamos lo mismo. Mirábamos el largo de la fila.')
      : pred === 'justo' ? (why === 'count' ? 'Sobró uno. ¿Me conté a mí? En la fila eran trece.' : 'No era justo: sobró uno.')
        : pred === 'sobra' ? (why === 'count' ? 'Contarlos funcionó.' : 'Acerté, pero mirando el largo no se podía estar seguro.')
          : 'Mirando no se podía saber. Sentándolos, sí.';
    await d.think(line);
    if (!scratch.conserve) {
      // Punto no se convence: los hace levantar y los aprieta en una fila corta
      g.setCinematic(true);
      const wide = {x: GRADAS.x - 700, y: GROUND - 360, w: 1100, h: 430};
      await d.shot(wide, 0.8);
      d.describe('Punto hace levantar a todos y los pone otra vez en fila, bien apretados: la fila queda más corta que las gradas.');
      g.audio.punto('hello');
      for (let k = LINE_IDS.length - 1; k >= 0; k--) {
        const dot = lineDot(w, LINE_IDS[k]);
        const [tx, ty] = squeezedPos(k);
        hop(d, dot, tx, ty, {g, sound: k % 4 ? null : 'tap', h: 30, dur: 0.35}).then(() => dot.setMode('bob', {home: [dot.x, dot.y]})).catch(() => {});
        await d.wait(0.07);
      }
      await d.wait(0.6);
      await pulse(d, p, 1, 0.4);
      g.setCinematic(false);
      const conserve = await d.choose([
        {id: 'none', text: 'Ninguno.'},
        {id: 'one', text: 'Uno.'},
        {id: 'more', text: 'Más de uno.'},
      ], {prompt: 'Así apretados, si se vuelven a sentar, ¿cuántos asientos sobran?', evaluate: true});
      scratch.conserve = conserve;
      d.evidence('conserve', {answer: conserve});
      g.queueSave();
      g.setCinematic(true);
      d.describe('Cada uno vuelve a su asiento. Queda libre el mismo asiento de antes.');
      for (const [j, who] of Object.entries(seated)) {
        const dot = w.get(who);
        hop(d, dot, seats[+j][0], seats[+j][1] - 14, {g, sound: null, h: 50, dur: 0.4}).then(() => dot.setMode('bob', {home: [dot.x, dot.y]})).catch(() => {});
        await d.wait(0.06);
      }
      await d.wait(0.6);
      await d.shot({x: GRADAS.x - 360, y: GROUND - 330, w: 720, h: 400}, 0.8);
      g.setCinematic(false);
      await d.think(conserve === 'one' ? 'Uno, como antes. Apretados o separados, son trece.' : 'Sobró uno, como antes. Apretados o separados, son trece.');
    }
    await d.fadeTo(ring, 0, 0.5);
    w.remove('seat-ring');
    // el que sobra
    g.setCinematic(true);
    if (freeSeat !== br) {
      const who = seated[br];
      const dot = w.get(who);
      delete seated[br];
      seated[freeSeat] = who;
      await hop(d, dot, seats[freeSeat][0], seats[freeSeat][1] - 14, {g, sound: 'tap', h: 40});
      dot.setMode('bob', {home: [dot.x, dot.y]});
    }
    scratch.seated = seated;
    g.flags.seated = {...seated};
    p.setMode('still');
    await zip(d, p, s.x + 30, GROUND - 120, 0.6);
    g.audio.punto('hello');
    s.look(1, -0.2);
    await d.tween(0.5, k => { p.x = s.x + 30 - Math.sin(k * Math.PI) * 14; });
    g.setCinematic(false);
    await d.think('¿El que sobra es para mí?');
    s.face(1);
    g.setCinematic(true);
    const [bx] = seats[br];
    await d.walk(s, bx - 6, GROUND, 170);
    s.setPose('sitGround', 0.8);
    s.face(0.6);
    await zip(d, p, s.x + 34, GROUND - 52, 0.6);
    p.setMode('bob', {home: [p.x, p.y]});
    s.look(0.4, -0.8);
    s.setPose('sitGroundLook', 1.2);
    g.audio.cue('night');
    d.describe('Te sentás en el lugar que sobró. Punto se acomoda a tu lado. Arriba, las estrellas.');
    await d.shot({x: bx - 240, y: GROUND - 300, w: 480, h: 330}, 2.2);
    await d.wait(2.4);
    // Punto vuelve a su asiento
    const pSeat = Object.entries(seated).find(([, who]) => who === 'punto');
    if (pSeat) {
      await zip(d, p, seats[+pSeat[0]][0], seats[+pSeat[0]][1] - 14, 0.6);
      p.setMode('bob', {home: [p.x, p.y]});
    }
    g.setCinematic(false);
  },
};

function braceDrawing(progress = 1) {
  const bx = NAME.numX - 46, mid = (NAME.marksY + GROUND) / 2;
  return new Drawing('brace', [art.S([[bx - 10, NAME.marksY - 40], [bx + 6, NAME.marksY - 30], [bx + 4, mid - 12], [bx + 18, mid], [bx + 4, mid + 12], [bx + 6, GROUND - 4], [bx - 10, GROUND + 6]], 611, {w: 3, p: 0.9})], {z: 9, progress});
}

function squeezedPos(k) {
  return [GRADAS.x - 540 + k * 22, GROUND - 14];
}

// ——————————————————————————————————————————————
// 1.10 El nombre (momento)
// ——————————————————————————————————————————————

const NUMBER_WORDS = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce'];

/** Orden en que Punto visita a los presentes: la Ronda (por asiento), vos y, al final, él mismo. */
function presentOrder(g) {
  const seated = seatedMap(g);
  const ronda = Object.keys(seated).sort((a, b) => a - b).map(j => seated[j]).filter(id => id !== 'punto');
  return [...ronda, 'student', 'punto'];
}

export const nombre = {
  id: 'c1.nombre',
  title: 'El nombre',
  moment: 'El número y sus nombres',
  setup(g) {
    const w = g.world;
    base(g, stage('seated'));
    w.removeWhere(o => /^(pmark|num-|plink|count-|word-|nword|one-ring|seat-ring|end-|brace)/.test(o.id));
    const seats = art.seatPositions(GRADAS.x, GROUND, GRADAS.seats);
    const seated = seatedMap(g);
    const sc = g.scratch('c1.nombre');
    const st = student(w, seats[bottomRightSeat(seats)][0] - 6, {pose: 'sitGround', facing: 0.6});
    punto(w, 0, 0);
    for (const [j, id] of Object.entries(seated)) {
      const dot = lineDot(w, id);
      dot.visible = true;
      dot.fade = 1;
      dot.x = seats[+j][0];
      dot.y = seats[+j][1] - 14;
      dot.setMode('bob', {home: [dot.x, dot.y]});
    }
    // si se recargó a mitad, la pizarra vuelve como estaba
    const order = presentOrder(g);
    if (sc.marked) order.forEach((_, i) => {
      const d = w.add(new Drawing(`pmark${i}`, art.tally(`pmark${i}`, ...nameMarkPos(i), 40).map(q => recolor(q, YELLOW)), {z: 9}));
      void d;
    });
    (sc.counted || []).forEach((i, k) => {
      const [x] = nameMarkPos(i);
      w.add(new Label(`nword${i}`, NUMBER_WORDS[k], x, NAME.wordsY + (i % 2) * 22, {size: 26, align: 'center', z: 10}));
    });
    if (sc.lined) {
      order.forEach((id, i) => {
        const [x] = nameMarkPos(i);
        if (id === 'student') { st.x = x; st.setPose('idle', 0); st.facing = st.facingTarget = 0; }
        else {
          const o = id === 'punto' ? w.get('punto') : w.get(id);
          o.x = x;
          o.y = GROUND - 24;
          o.setMode('bob', {home: [x, GROUND - 24]});
        }
      });
      w.add(braceDrawing(1));
      w.add(new Label('num-14', '14', NAME.numX, NAME.numY, {size: 96, weight: 700, z: 9}));
    }
    g.camera.go(sc.lined ? SHOTS.nombre : SHOTS.gradas);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const order = presentOrder(g);
    const visit = async id => {
      if (id === 'punto') {
        g.audio.punto('question');
        await d.tween(0.6, k => { p.scale = 1 + Math.sin(k * Math.PI) * 0.4; p.squash = Math.sin(k * Math.PI * 2) * 0.3; });
        p.scale = 1;
        p.squash = 0;
        return;
      }
      const [tx, ty] = id === 'student' ? s.headPos() : [w.get(id).x, w.get(id).y];
      await zip(d, p, tx, ty - 26, 0.16);
      if (id !== 'student') w.get(id).lift = 6;
      await d.wait(0.06);
      if (id !== 'student') w.get(id).lift = 0;
    };
    const markFor = (i, progress = 0) => w.add(new Drawing(`pmark${i}`, art.tally(`pmark${i}`, ...nameMarkPos(i), 40).map(st => recolor(st, YELLOW)), {z: 9, progress}));
    const sc = g.scratch();
    if (!sc.marked) {
    // la primera marca de Punto: de cerca
    g.setCinematic(true);
    p.setMode('still');
    await visit(order[0]);
    const [m0x, m0y] = nameMarkPos(0);
    await d.shot({x: m0x - 220, y: m0y - 150, w: 440, h: 260}, 1.4);
    d.describe('Punto se lanza contra el pizarrón, como vio hacer con la piedra. La primera vez no le sale nada.');
    await zip(d, p, m0x, m0y - 40, 0.3);
    await zip(d, p, m0x, m0y + 4, 0.12);
    g.audio.tap(0.3, 1.4);
    await pulse(d, p, 1, -0.35, 0.18);
    g.audio.punto('no');
    await d.wait(0.5);
    await zip(d, p, m0x, m0y - 40, 0.3);
    await zip(d, p, m0x, m0y, 0.12);
    const first = markFor(0);
    await d.draw(first, 0.3);
    g.audio.punto('surprise');
    await zip(d, p, m0x + 30, m0y - 60, 0.3);
    await pulse(d, p, 2, 0.5, 0.2);
    g.setCinematic(false);
    await d.think('¡Le salió!');
    // una marca por cada visita
    g.setCinematic(true);
    await d.shot(SHOTS.nombre, 1.2);
    for (let i = 1; i < order.length; i++) {
      await visit(order[i]);
      const mk = markFor(i);
      await zip(d, p, ...nameMarkPos(i), 0.16);
      await d.draw(mk, 0.12, {sound: false});
      g.audio.tap(0.22, 1.6 + (i % 4) * 0.1);
    }
    await zip(d, p, nameMarkPos(order.length - 1)[0] + 40, NAME.marksY - 50, 0.3);
    p.setMode('bob', {home: [p.x, p.y]});
    g.setCinematic(false);
    sc.marked = true;
    g.saveNow();
    }
    if (!sc.lined) {
    // contar: una palabra por marca
    s.setPose('idle', 0.6);
    s.face(1);
    g.setCinematic(true);
    await d.walk(s, NAME.x0 - 80, GROUND, 170);
    await d.shot(SHOTS.marksNight, 1.2);
    g.setCinematic(false);
    await d.think('¿Cuántos somos?');
    const scratch = sc;
    const counted = sc.counted || (sc.counted = []);
    let repeats = 0;
    await d.interact(ctl => new Promise(resolve => {
      g.setHint(() => [
        'Una palabra por marca, en orden, sin saltear ni repetir.',
        'Tocá las marcas de a una, en el orden que quieras: cada toque escribe la palabra que sigue.',
      ]);
      const refresh = () => g.ui.setSpots(order.map((_, i) => {
        const [x, y] = nameMarkPos(i);
        const label = counted.includes(i) ? `Marca de Punto, ya contada: ${NUMBER_WORDS[counted.indexOf(i)]}` : 'Marca de Punto, sin contar';
        return rectSpot(`pm${i}`, label, {x: x - 20, y: y - 28, w: 40, h: 56}, () => tap(i));
      }));
      const tap = i => {
        if (!ctl.alive()) return;
        if (counted.includes(i)) {
          repeats++;
          g.note('Esa ya tiene su palabra.');
          d.evidence('count-repeat', {mark: i});
          return;
        }
        counted.push(i);
        g.saveNow();
        const word = NUMBER_WORDS[counted.length - 1];
        const [x] = nameMarkPos(i);
        const lab = w.add(new Label(`nword${i}`, word, x, NAME.wordsY + (i % 2) * 22, {size: 26, align: 'center', z: 10, reveal: 0}));
        d.tween(0.25, k => { lab.reveal = k; }).catch(() => {});
        g.ui.describe(word);
        g.audio.note(392 * Math.pow(2, [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23][counted.length - 1] / 12), 0, 0.4, {gain: 0.045, bus: 'sfx'});
        d.evidence('count', {mark: i, word});
        if (counted.length === order.length) resolve();
        else refresh();
      };
      refresh();
    }));
    g.setHint(null);
    scratch.countRepeats = repeats;
    if (counted.length < order.length) return;
    // todos bajan y se paran debajo de su marca: tres filas, columna por columna
    g.setCinematic(true);
    await d.say('student', '¡Bajen! Cada uno debajo de su marca.');
    await d.shot(SHOTS.nombre, 1.2);
    d.describe('Cada uno baja de las gradas y se para debajo de la marca que Punto hizo por él. Quedan tres filas alineadas: marcas, palabras y presentes.');
    for (const [i, id] of order.entries()) {
      const [x] = nameMarkPos(i);
      if (id === 'student') {
        s.setPose('idle', 0.4);
        await d.walk(s, x, GROUND, 220);
        s.face(0);
      } else if (id === 'punto') {
        await zip(d, p, x, GROUND - 24, 0.4);
        p.setMode('bob', {home: [x, GROUND - 24]});
      } else {
        const dot = w.get(id);
        await hop(d, dot, x, GROUND - 24, {g, sound: 'tap', h: 50, dur: 0.3});
        dot.setMode('bob', {home: [x, GROUND - 24]});
      }
    }
    // la llave que abarca las tres filas, y el número
    const brace = w.add(braceDrawing(0));
    await d.draw(brace, 0.8);
    const num = w.add(new Label('num-14', '14', NAME.numX, NAME.numY, {size: 96, weight: 700, reveal: 0, z: 9}));
    await d.draw(num, 0.9, {key: 'reveal'});
    g.setCinematic(false);
    sc.lined = true;
    g.saveNow();
    await d.think('Catorce marcas. Catorce palabras. Catorce de nosotros.');
    }
    // Punto intenta emparejar el 14 como si fuera otra fila
    g.setCinematic(true);
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = '700 96px Kalam';
    const w1 = ctx.measureText('1').width, w4 = ctx.measureText('4').width;
    const g1 = [NAME.numX + w1 / 2, NAME.numY - 34], g4 = [NAME.numX + w1 + w4 / 2, NAME.numY - 34];
    const last = order.slice(-4, -2).map(id => w.get(id));
    p.setMode('still');
    await zip(d, p, g1[0], g1[1] - 60, 0.4);
    g.audio.punto('hop');
    const l1 = w.add(new Link('plink1', () => [g1[0], g1[1] + 30], () => [last[0].x, last[0].y - 8], {ch: YELLOW, p: 0.9, w: 2.8, z: 8, progress: 0, gap: 8}));
    await d.draw(l1, 0.5);
    await zip(d, p, g4[0], g4[1] - 60, 0.3);
    g.audio.punto('hop');
    const l4 = w.add(new Link('plink4', () => [g4[0], g4[1] + 30], () => [last[1].x, last[1].y - 8], {ch: YELLOW, p: 0.9, w: 2.8, z: 8, progress: 0, gap: 8}));
    await d.draw(l4, 0.5);
    await zip(d, p, g4[0] + 40, g4[1] - 80, 0.4);
    g.audio.punto('question');
    p.setMode('bob', {home: [p.x, p.y]});
    d.describe('Punto unió el 1 con uno de la fila de abajo y el 4 con otro. Los demás quedaron sin unir.');
    g.setCinematic(false);
    if (!replay && !sc.named) {
      const options = [
        {id: 'two', text: 'El 14 nombra a dos.'},
        {id: 'name', text: 'El 14 nombra a catorce.'},
        {id: 'hidden', text: 'Adentro del 14 hay catorce cosas.'},
      ];
      for (;;) {
        const r = await d.choose(options, {prompt: '¿Qué le decís a Punto?', evaluate: true});
        d.evidence('numeral', {answer: r});
        if (r === 'name') break;
        g.setCinematic(true);
        if (r === 'two') {
          // los que quedaron sin unir le reclaman a Punto
          d.describe('Los que quedaron sin unir saltan, uno tras otro: ¿y nosotros?');
          for (const id of order.filter(id => !last.some(o => o.id === id) && id !== 'punto')) {
            const o = id === 'student' ? null : w.get(id);
            if (o) {
              o.lift = 12;
              g.audio.tap(0.12, 2);
              await d.wait(0.09);
              o.lift = 0;
            } else s.setPose('shrug', 0.2);
          }
          s.setPose('idle', 0.5);
          g.setCinematic(false);
          await d.think('Somos catorce, no dos.');
        } else {
          // Punto se asoma detrás del 14: no hay nada
          d.describe('Punto da la vuelta al 14 y se asoma por detrás. No hay nada escondido.');
          await zip(d, p, NAME.numX + 140, NAME.numY - 40, 0.35);
          await zip(d, p, NAME.numX - 30, NAME.numY + 10, 0.45);
          await zip(d, p, g4[0] + 40, g4[1] - 80, 0.35);
          g.audio.punto('no');
          g.setCinematic(false);
          await d.think('No hay nada escondido adentro.');
        }
        options.splice(options.findIndex(o => o.id === r), 1);
      }
      sc.named = true;
      g.saveNow();
    }
    g.setCinematic(true);
    const voice = g.audio.erase(0.8, 0.6);
    await d.all(d.fadeTo(l1, 0, 0.7), d.fadeTo(l4, 0, 0.7));
    voice?.stop?.();
    w.remove('plink1');
    w.remove('plink4');
    g.audio.cue('reveal');
    g.setCinematic(false);
    await d.think('No es una fila más: es el nombre de cuántos hay en cada una.');
    // Punto rodea el 1
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, g1[0] - 20, g1[1] - 10, 0.5);
    const ring = w.add(new Drawing('one-ring', [art.S(art.circleGuideFor(g1[0], g1[1], 44), 717, {w: 2.2, p: 0.8, ch: YELLOW})], {z: 9, progress: 0}));
    await d.all(d.draw(ring, 0.9), d.tween(0.9, k => {
      const a = -Math.PI / 2 + k * Math.PI * 2.1;
      p.x = g1[0] + Math.cos(a) * 44;
      p.y = g1[1] + Math.sin(a) * 44;
    }));
    g.audio.punto('question');
    p.setMode('bob', {home: [g1[0] + 60, g1[1] - 60]});
    d.describe('Punto dibuja un círculo amarillo alrededor del 1 de "14" y te mira.');
    s.look(0.8, -0.6);
    g.setCinematic(false);
    await d.think('Me mira como preguntando qué hace un 1 ahí, si somos catorce.');
    s.setPose('shrug', 0.3);
    await d.say('student', 'Ni idea. Mañana.');
    s.setPose('idle', 0.6);
    if (!replay) writeJournal(g);
  },
};

function recolor(st, ch) {
  st.ch = ch;
  return st;
}

/** Bitácora: sólo afirma lo que la partida muestra que pasó (y distingue lo que hizo la ayuda). */
function writeJournal(g) {
  // sólo la partida actual (si se volvió a jugar el capítulo, no se mezcla)
  const ev = g.state.evidence.filter(e => (e.run || 1) === (g.state.run || 1));
  const all = k => ev.filter(e => e.kind === k);
  const seen = [];
  if (all('record').length) {
    seen.push('Antes de la Marea hiciste una marca por cada uno de la Ronda.' + (all('record-repeat').length ? ' Cuando tocaste a alguien ya anotado, la marca no se repitió: una por cada uno.' : ''));
  }
  if (all('record-method')[0]?.choice === 'count') seen.push('Intentaste contarlos mientras giraban: contar también sirve si nadie se saltea ni se repite, pero Punto no conocía las palabras.');
  const pairs = all('pair');
  const byHint = pairs.filter(e => e.viaHint).length;
  let pairLine = 'Al volver, emparejaste marcas y puntos uno a uno: sobró una marca, y faltaba el más chico.';
  if (byHint) pairLine += ` (${byHint === 1 ? 'Una unión la hizo' : `${byHint} uniones las hizo`} la ayuda.)`;
  seen.push(pairLine);
  const checks = all('check').filter(c => !c.final);
  if (checks.some(c => c.double === 'dot')) seen.push('Una comprobación mostró un punto unido a dos marcas: así no es uno a uno, y no vale.');
  if (checks.some(c => c.double === 'mark')) seen.push('Una comprobación mostró una marca unida a dos puntos: así no es uno a uno, y no vale.');
  if (checks.some(c => c.verdict === 'incomplete')) seen.push('Otra comprobación mostró que, mientras sobran de los dos lados, todavía no se sabe nada.');
  if (g.flags.reading === 'mistake') seen.push('Pensaste que la marca de más podía ser un error tuyo; tu registro mostraba que no.');
  const pe = all('predict')[0];
  const predText = pe && {no: '"no alcanzan"', justo: '"alcanzan justo"', sobra: '"alcanzan, y sobra lugar"', nose: '"todavía no sé"'}[pe.prediction];
  const whyText = pe?.why === 'count' ? ', contando' : pe?.why === 'look' ? ', mirando el largo de la fila' : '';
  if (predText) seen.push(`En las gradas, para la Ronda y Punto, dijiste ${predText}${whyText}. Al sentarlos de a uno, sobró un asiento.`);
  const ce = all('conserve')[0];
  if (ce) seen.push('Cuando Punto los apretó en una fila corta, ' + (ce.answer === 'one' ? 'anticipaste que seguiría sobrando un asiento: apretados o no, eran trece.' : `pensaste que sobrarían ${ce.answer === 'none' ? 'ninguno' : 'más'}; al sentarse otra vez sobró uno, como antes.`));
  if (all('count').length) seen.push('Contaste las marcas de Punto: una palabra por marca' + (all('count-repeat').length ? ' (y cuando repetiste una, el juego te avisó)' : '') + '. La última fue "catorce".');
  const hints = all('hint').length;
  if (hints) seen.push(`Pediste ${hints === 1 ? 'una ayuda' : `${hints} ayudas`}.`);
  const entry = {
    id: 'c1',
    title: '¿Están todos?',
    abbr: 'Misma cantidad: se pueden emparejar uno a uno sin que sobre nada.',
    body: [
      'Uno a uno quiere decir: cada cosa de un lado con una sola del otro, y ninguna usada dos veces.',
      'Si al emparejar así sobra algo de un solo lado, ese lado tiene más. Si sobran de los dos lados, todavía no se terminó de emparejar. La forma, el tamaño y la distancia no cambian cuántos son.',
      'Contar también es emparejar: cada cosa con una palabra, en orden, sin saltear ni repetir; la última palabra dice cuántas hay.',
      'El número es lo que no cambia entre todas las colecciones que se pueden emparejar así. "14" y "catorce" son nombres de ese número: el 14 no tiene catorce cosas adentro (cómo funciona su escritura es otra pregunta).',
      'Todo esto vale para colecciones que se terminan. Con colecciones que no se terminan pasan cosas raras; Punto todavía no lo sabe.',
    ],
    seen,
    moments: [
      {id: 'c1.todos', label: 'Desplegar: emparejar marcas y puntos'},
      {id: 'c1.nombre', label: 'Desplegar: el número y sus nombres'},
    ],
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora');
  g.saveNow();
}

export const SEGMENTS = [puerta, alguien, ronda, marea, vuelven, quien, busqueda, todos, gradas, nombre];
