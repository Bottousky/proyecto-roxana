// Capítulo 1 — ¿Están todos? Escenas jugables.

import {Drawing, Label, Link, Custom} from '../engine/world.js';
import {YELLOW, WHITE, chalkText} from '../engine/chalk.js';
import {easeInOut, easeOut, lerp, mulberry32} from '../engine/rng.js';
import {evaluatePairs, togglePair} from '../logic/pairing.js';
import {
  GROUND, DOOR, STONE, RING, MARKS, FIELD, GRADAS, LINE_X0, LINE_GAP, SHOTS, STAGES, RONDA_IDS, LINO,
  markPos, markRect, student, punto, rondaDot, rondaDance, stopDance, base, markDrawing, art, PAIRED_Y,
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
      g.setHint(() => ['Es una puerta. Las puertas se cruzan.', 'Tocá la puerta para cruzarla.']);
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
    await d.think('La puerta se está borrando. No del todo: queda el contorno.');
    s.face(0.6);
    s.setPose('lookUp', 0.7);
    s.look(0.6, -0.6);
    await d.shot(SHOTS.doorWide, 2.2);
    await d.think('Acá hubo muchas cosas escritas. Alguien las borró a medias.');
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
        if (approaches === 1) await d.think('Se escondió.');
        else {
          await d.think('Otra vez. Cuanto más me acerco, más se aleja.');
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
    await pulse(d, p, 1, 0.3);
    g.audio.punto('hello');
    d.describe('Punto toca tu tiza con cuidado y suena tres veces, cada vez más agudo.');
    await d.wait(0.8);
    p.setMode('bob', {home: [p.x + 6, p.y - 20]});
    g.setCinematic(false);
    await d.say('student', 'Hola.');
    g.audio.punto('hello');
    await pulse(d, p, 2, 0.35);
    await d.think('No habla. O no habla como yo.');
    await d.say('student', '¿Tenés nombre?');
    g.audio.punto('question');
    await d.tween(0.6, k => { p.squash = Math.sin(k * Math.PI) * 0.4; });
    await d.wait(0.9);
    await d.think('Un punto. Nada más que un punto… y nada menos.');
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
    await d.think('Quiere que lo siga.');
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
    await d.say('student', '¿Son tuyos? ¿Tu familia?');
    await hop(d, p, p.x, p.y, {g, sound: 'yes', h: 18});
    p.setMode('bob', {home: [p.x, p.y]});
    await d.think('Punto es amarillo; ellos son blancos. Pero bailan como él.');
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
    await d.think('¿Qué es eso? Está borrando todo a su paso.');
    s.setPose('idle', 0.5);
    s.face(1);
    await d.shot(SHOTS.ronda, 1.4);
    ctl.speed = 0.35;
    ctl.r = RING.r * 0.92;
    g.setCinematic(false);
    await d.think('Si pasa por acá, los va a desparramar. Y después, ¿cómo va a saber Punto si volvieron todos?');
    let first = await d.choose([
      {id: 'count', text: 'Contarlos ahora, rápido'},
      {id: 'marks', text: 'Hacer una marca en la piedra por cada uno'},
    ], {prompt: '¿Cómo recordar a la Ronda?'});
    d.evidence('record-method', {choice: first});
    if (first === 'count') {
      s.setPose('point', 0.3);
      const words = ['uno', 'dos', 'tres', 'cuatro…'];
      ctl.speed = 0.75;
      for (const word of words) {
        s.look(0.8, -0.2 + Math.random() * 0.3);
        await d.say('student', word.charAt(0).toUpperCase() + word.slice(1) + (word.endsWith('…') ? '' : '…'));
      }
      ctl.speed = 0.35;
      s.setPose('think', 0.5);
      await d.think('¿Ese ya lo conté? Se cruzan todo el tiempo.');
      await d.think('Contar es darle a cada uno una palabra: uno, dos, tres… Pero las palabras se las lleva el aire. Y Punto no sabe qué quiere decir "cuatro".');
      await d.think('Necesito algo que se quede quieto y que Punto pueda ver.');
      s.setPose('idle', 0.5);
    }
    await d.think('Una marca por cada uno. La piedra no se mueve.');
    await recordRonda(d, g);
    g.flags.recorded = MARKS;
    s.setPose('idle', 0.5);
    s.look(0.6, 0);
    await d.think('Cada uno tiene su marca. Y cada marca es de uno.');
    g.audio.punto('question');
    await pulse(d, p, 1, 0.3);
  },
};

function mareaBand(w, x) {
  const band = w.ensure('marea-band', () => new Custom('marea-band', {z: -20}));
  band.x = x;
  band.width = 360;
  band.renderDust = ctx => {
    ctx.save();
    const grad = ctx.createLinearGradient(band.x - band.width, 0, band.x + band.width * 0.3, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0.0)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0.55)');
    grad.addColorStop(0.85, 'rgba(255,255,255,0.75)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(band.x - band.width, -400, band.width * 1.3, 1700);
    // estrías verticales del fieltro
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 18; i++) {
      const xx = band.x - band.width * 0.8 + i * band.width * 0.06;
      ctx.lineWidth = 6 + (i % 4) * 3;
      ctx.beginPath();
      ctx.moveTo(xx, -400);
      ctx.lineTo(xx + 30, 1300);
      ctx.stroke();
    }
    ctx.restore();
  };
  return band;
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
  ctl.speed = 0.16;
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
        if (band) band.x = lerp(1260, 1650, recorded.size / MARKS);
        d.evidence('record', {id, n: recorded.size, viaHint});
        await d.fadeTo(link, 0, 0.5);
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
      band.x = lerp(500, 3500, k);
      band.width = 420;
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
    s.setPose('idle', 0.6);
    await d.think('Lo que alguien hizo entendiendo para qué servía… resistió. Eso parece.');
    p.setMode('still');
    await zip(d, p, s.x + 60, GROUND - 170, 0.5);
    tremble(p, 1.4);
    g.audio.punto('sad');
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
    const ax = xs.reduce((a, b) => a + b, 0) / xs.length;
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
      const title = w.add(new Label('title-card', '¿Están todos?', 2370, 205, {size: 74, align: 'center', reveal: 0, z: 50, weight: 700}));
      await d.draw(title, 1.6, {key: 'reveal'});
      await d.wait(1.2);
      await d.fadeTo(title, 0, 1);
      w.remove('title-card');
      await d.think('Se mueven tanto que no se dejan contar. Y Punto no sabe contar.');
      s.setPose('lookDown', 0.6);
      await d.shot(SHOTS.pairing, 1.2);
      await d.think('Pero las marcas no se mueven. Cada marca era uno de ellos.');
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
    await d.think('A cada punto le tocó una marca. Y quedó una marca sola.');
  },
};

/** Emparejar marcas con puntos y comprobar. */
async function pairing(d, g) {
  const w = g.world;
  const s = w.get('student');
  const p = w.get('punto');
  const scratch = g.scratch();
  let links = scratch.links || [];
  const markIds = Array.from({length: MARKS}, (_, i) => `mark${i}`);
  let selected = null;
  let checking = false;
  let checks = 0;
  const label = id => {
    if (id.startsWith('mark')) {
      const n = links.filter(([m]) => m === id).length;
      return n ? 'Una marca de la piedra, unida a un punto' : 'Una marca de la piedra, sin unir';
    }
    const n = links.filter(([, b]) => b === id).length;
    return n === 0 ? 'Un punto de la Ronda, sin unir' : n === 1 ? 'Un punto de la Ronda, unido a una marca' : `Un punto de la Ronda, unido a ${n} marcas`;
  };
  return d.interact(ctl => new Promise(resolve => {
    g.setHint(() => [
      'Cada marca era uno de la Ronda. ¿A cada marca le toca un punto?',
      'Tocá una marca de la piedra y después un punto blanco: quedan unidos con una línea. Tocar el mismo par otra vez los separa.',
      () => {
        const fm = markIds.find(m => !links.some(([x]) => x === m));
        const fd = RETURNED.find(b => !links.some(([, y]) => y === b));
        if (fm && fd) { selected = fm; choose(fd, true); }
      },
      'Cuando no puedas unir más, tocá "comprobar": Punto va a recorrer cada unión.',
    ]);
    const refresh = () => {
      const spots = [];
      for (const [i, m] of markIds.entries()) spots.push(rectSpot(m, label(m), markRect(i), () => choose(m), {selected: selected === m}));
      for (const id of RETURNED) spots.push(dotSpot(g, id, label(id), () => choose(id), {selected: selected === id}));
      if (links.length) {
        const [cx] = markPos(MARKS - 1);
        spots.push(wordSpot('check', 'comprobar', cx + 150, GROUND - 40, () => check()));
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
      g.queueSave();
      selected = null;
      syncLinks(g, links);
      refresh();
    };
    const check = async () => {
      if (checking || !ctl.alive()) return;
      checking = true;
      checks++;
      g.ui.setSpots([]);
      const r = evaluatePairs(markIds, RETURNED, links);
      d.evidence('check', {verdict: r.verdict, pairs: links.length});
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
        } else if (r.verdict === 'left-more') {
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
    let reading;
    for (;;) {
      reading = await d.choose(options, {prompt: '¿Qué quiere decir esa marca sola?'});
      d.evidence('interpret', {reading});
      if (reading === 'extra') {
        await d.think('No. Lo que quedó sola es una marca, no un punto. Si sobra una marca, faltan puntos.');
        options.splice(options.findIndex(o => o.id === 'extra'), 1);
        continue;
      }
      break;
    }
    if (reading === 'mistake') {
      await d.think('Puede ser… Pero hice una sola marca por cada uno, y ninguno se quedó con dos.');
      await d.think('Si las marcas están bien, entonces alguien no volvió.');
    }
    g.flags.reading = reading;
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
    await d.wait(1.1);
    g.setCinematic(false);
    await d.think('Las marcas saben cuántos. No saben quién. Punto sí.');
    await zip(d, p, s.x + 70, GROUND - 170, 0.5);
    await d.say('student', '¿Quién falta? ¿El más chico? ¿El que siempre llegaba tarde a la ronda?');
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
    await d.think('Lo que la Marea arrastró quedó por acá.');
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
        await d.think('Una grieta en el pizarrón. Adentro no hay nadie.');
        s.setPose('idle', 0.4);
        follow(p, s);
      } else if (which === 'house') {
        s.setPose('lookDown', 0.5);
        await zip(d, p, FIELD.house[0] + 190, GROUND - 90, 0.5);
        await d.think('Al lado de la casa borrada, alguien hizo marcas como las mías. Hace mucho.');
        await d.think('Así que no soy el primero que anota para no olvidar.');
        s.setPose('idle', 0.4);
        follow(p, s);
      } else {
        s.setPose('crouch', 0.5);
        s.look(0.8, 0.6);
        await d.wait(0.6);
        await d.think('Ahí. Debajo del polvo. Casi no se ve.');
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
    await d.think('Lo encontramos.');
    g.flags.found = true;
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
    const s = student(w, STONE.x - 360);
    const p = punto(w, s.x + 44, GROUND - 150);
    follow(p, s);
    const lino = rondaDot(w, RONDA_IDS.indexOf(LINO));
    lino.visible = true;
    lino.fade = 1;
    lino.x = STONE.x + 260;
    lino.y = GROUND - 150;
    lino.setMode('bob', {home: [lino.x, lino.y]});
    w.removeWhere(o => o.id === 'free-ring');
    g.camera.go(SHOTS.stone);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const lino = w.get(LINO);
    const free = g.flags.freeMark || 'mark11';
    const fi = Number(free.slice(4));
    await d.shot(SHOTS.ronda, 1.2);
    let links = g.flags.pairs || RETURNED.map((id, i) => [`mark${i}`, id]);
    if (replay) {
      await d.wait(0.6);
    } else {
      await d.think('Falta una sola unión.');
      await d.interact(() => new Promise(resolve => {
        let sel = null;
        g.setHint(() => ['La marca sola y el más chico.', 'Tocá la marca sola y después al más chico.']);
        const refresh = () => g.ui.setSpots([
          rectSpot(free, 'La marca que quedó sola', markRect(fi), () => pick(free), {selected: sel === free}),
          dotSpot(g, LINO, 'El más chico de la Ronda', () => pick(LINO), {selected: sel === LINO}),
        ]);
        const pick = id => {
          g.audio.tap(0.18, 1.7);
          if (!sel || sel === id) {
            sel = sel === id ? null : id;
            refresh();
            return;
          }
          resolve();
        };
        refresh();
      }));
      g.setHint(null);
    }
    links = [...links.filter(([m]) => m !== free), [free, LINO]];
    g.flags.pairs = links;
    syncLinks(g, links);
    g.setCinematic(true);
    await d.wait(0.8);
    // recorrido completo, una nota por unión
    p.setMode('still');
    const marks = Array.from({length: MARKS}, (_, i) => `mark${i}`);
    const r = evaluatePairs(marks, RONDA_IDS, links);
    d.evidence('check', {verdict: r.verdict, pairs: links.length, final: true});
    for (const [n, m] of marks.entries()) {
      const pair = links.find(([x]) => x === m);
      const dot = w.get(pair[1]);
      await zip(d, p, dot.x, dot.y - 30, 0.18);
      g.audio.note(293.66 * Math.pow(2, [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26][n] / 12), 0, 0.8, {gain: 0.05, bus: 'sfx'});
      w.get(`pair-${m}-${dot.id}`).flash = 1;
    }
    g.audio.cue('all');
    await d.wait(0.9);
    g.setCinematic(false);
    await d.think('A cada marca, uno. A cada uno, una marca. No sobra nada.');
    await d.say('student', 'Están todos.');
    // vuelve la ronda
    g.setCinematic(true);
    w.removeWhere(o => o.id.startsWith('pair-'));
    rondaDance(w, {speed: 0.42});
    p.setMode('still');
    await zip(d, p, RING.x, RING.y - RING.r * 0.42 - 26, 0.6);
    p.setMode('anchor', {anchor: () => {
      const c = w.get('ronda-ctl');
      const a = (c?.angle || 0) + Math.PI * 1.5;
      return [RING.x + Math.cos(a) * (RING.r + 36), RING.y + Math.sin(a) * (RING.r + 36) * 0.42];
    }});
    s.setPose('cheer', 0.4);
    d.describe('La Ronda vuelve a bailar, completa. Punto baila con ellos.');
    await d.wait(2.2);
    s.setPose('idle', 0.8);
    await d.wait(0.6);
    if (!replay) g.flags.all = true;
  },
};

// ——————————————————————————————————————————————
// 1.9 Las gradas (transferencia)
// ——————————————————————————————————————————————

const LINE_IDS = [...RONDA_IDS.slice(0, 6), 'punto', ...RONDA_IDS.slice(6)];

function linePos(k) {
  return [LINE_X0 + k * LINE_GAP, GROUND - 14];
}

export const gradas = {
  id: 'c1.gradas',
  title: 'Las gradas',
  setup(g) {
    const w = g.world;
    base(g, stage('night'));
    w.removeWhere(o => o.id.startsWith('pair-') || o.id === 'crack' || o.id === 'old-marks');
    stopDance(w);
    const s = student(w, LINE_X0 - 120);
    punto(w, 0, 0);
    const seats = art.seatPositions(GRADAS.x, GROUND, GRADAS.seats);
    const seated = g.scratch('c1.gradas').seated || {};
    LINE_IDS.forEach((id, k) => {
      const dot = id === 'punto' ? w.get('punto') : rondaDot(w, RONDA_IDS.indexOf(id));
      dot.visible = true;
      dot.fade = 1;
      dot.mark = 0;
      const seat = Object.entries(seated).find(([, who]) => who === id);
      const [x, y] = seat ? [seats[+seat[0]][0], seats[+seat[0]][1] - 14] : linePos(k);
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
    const firstTime = !Object.keys(seated).length && !scratch.prediction;
    if (firstTime) {
      g.setCinematic(true);
      await d.shot(SHOTS.sky, 2.4);
      d.describe('Anochece. Una mano que no se ve dibuja estrellas, una por una.');
      for (let i = 0; i < 12; i++) {
        const st = w.get(`star${i}`);
        if (!st) continue;
        st.progress = 0;
      }
      g.audio.cue('night');
      for (let i = 0; i < 12; i++) {
        const st = w.get(`star${i}`);
        if (st) await d.draw(st, 0.22, {sound: i % 3 === 0});
      }
      g.setCinematic(false);
      s.setPose('lookUp', 0.8);
      await d.think('Alguien está dibujando estrellas. No sé quién.');
      s.setPose('idle', 0.6);
      await d.shot(SHOTS.gradas, 1.8);
      await d.think('La Ronda quiere mirarlas desde las gradas. Se pusieron en fila para subir.');
      // Punto compara a ojo y se preocupa
      g.setCinematic(true);
      const [x0] = linePos(0);
      const [x1] = linePos(LINE_IDS.length - 1);
      p.setMode('still');
      await zip(d, p, x0, GROUND - 60, 0.45);
      await d.tween(0.9, k => { p.x = lerp(x0, x1, k); p.squash = 0.4; }, easeInOut);
      p.squash = 0;
      await zip(d, p, GRADAS.x - 110, GROUND - 190, 0.4);
      await d.tween(0.6, k => { p.x = lerp(GRADAS.x - 110, GRADAS.x + 110, k); }, easeInOut);
      tremble(p, 1);
      g.audio.punto('scared');
      d.describe('Punto recorre la fila, larguísima, y después los asientos, apretados. Tiembla: cree que no alcanzan.');
      const [hx, hy] = linePos(LINE_IDS.indexOf('punto'));
      await zip(d, p, hx, hy, 0.5);
      p.setMode('bob', {home: [hx, hy]});
      g.setCinematic(false);
      await d.think('Punto cree que no alcanzan los asientos. La fila es mucho más larga que las gradas.');
    }
    let prediction = scratch.prediction;
    if (!prediction) {
      prediction = await d.choose([
        {id: 'no', text: 'No alcanzan: la fila es más larga.'},
        {id: 'yes', text: 'Alcanzan, y sobra lugar.'},
        {id: 'pair', text: 'No sé. Hay que ver si a cada uno le toca un asiento.'},
      ], {prompt: '¿Alcanzan los asientos para toda la fila?'});
      scratch.prediction = prediction;
      g.flags.prediction = prediction;
      d.evidence('predict', {prediction});
      g.queueSave();
      await d.think('Probemos: uno por asiento.');
    }
    // sentar: tocar un asiento libre hace subir al primero de la fila
    await d.interact(ctl => new Promise(resolve => {
      const waiting = () => LINE_IDS.filter(id => !Object.values(seated).includes(id));
      g.setHint(() => ['Cada asiento es para uno solo.', 'Tocá un asiento libre: el primero de la fila sube a ocuparlo.', 'Seguí hasta que la fila se vacíe… o se acaben los asientos.']);
      let busy = false;
      const refresh = () => {
        const left = waiting();
        g.ui.setSpots(seats.map((pos, j) => rectSpot(`seat${j}`, seated[j] ? 'Asiento ocupado' : 'Asiento libre', {x: pos[0] - 22, y: pos[1] - 40, w: 44, h: 46}, () => sit(j), {disabled: !left.length})));
      };
      const sit = async j => {
        if (busy || !ctl.alive()) return;
        if (seated[j]) {
          g.note('Ese asiento ya tiene a alguien.');
          d.evidence('seat-taken', {seat: j});
          return;
        }
        const left = waiting();
        if (!left.length) return;
        busy = true;
        const id = left[left.length - 1]; // sube el más cercano a las gradas
        const dot = w.get(id);
        seated[j] = id;
        scratch.seated = seated;
        g.queueSave();
        d.evidence('seat', {seat: j, who: id});
        try {
          await hop(d, dot, seats[j][0], seats[j][1] - 14, {g, sound: id === 'punto' ? 'hop' : 'tap', h: 60, dur: 0.42});
          dot.setMode('bob', {home: [dot.x, dot.y]});
        } catch {
          return;
        }
        busy = false;
        if (!waiting().length) resolve();
        else refresh();
      };
      refresh();
    }));
    g.setHint(null);
    const freeSeat = seats.findIndex((_, j) => !seated[j]);
    g.flags.freeSeat = freeSeat;
    g.setCinematic(true);
    await d.shot({x: GRADAS.x - 380, y: GROUND - 330, w: 760, h: 400}, 1.2);
    const [sx, sy] = seats[freeSeat];
    const ring = w.add(new Drawing('seat-ring', [art.S(art.circleGuideFor(sx, sy - 10, 26), 551, {w: 2, p: 0.6, ch: YELLOW})], {z: 8, progress: 0}));
    await d.draw(ring, 0.7);
    g.setCinematic(false);
    await d.think('La fila se vació y sobró un asiento.');
    await d.think('La fila parecía más larga porque estaban separados, no porque fueran más.');
    if (prediction === 'no') {
      await pulse(d, p, 1, -0.3, 0.5);
      await d.think('Punto y yo pensamos lo mismo. Nos equivocamos los dos: miramos el largo, no los emparejamos.');
    } else if (prediction === 'yes') {
      await d.think('Lo dije sin estar seguro. Ahora sí lo sé: a cada uno le tocó un asiento y quedó uno libre.');
    } else {
      await d.think('No se podía saber mirando el largo. Emparejando, sí.');
    }
    await d.fadeTo(ring, 0, 0.5);
    w.remove('seat-ring');
    // se corren para dejar el lugar libre abajo, a la derecha
    g.setCinematic(true);
    const last = seats.length - 1;
    const bottomRight = seats.reduce((best, pos, j) => (pos[1] > seats[best][1] + 1 || (Math.abs(pos[1] - seats[best][1]) < 1 && pos[0] > seats[best][0]) ? j : best), 0);
    if (freeSeat !== bottomRight) {
      const who = seated[bottomRight];
      const dot = w.get(who);
      delete seated[bottomRight];
      seated[freeSeat] = who;
      await hop(d, dot, seats[freeSeat][0], seats[freeSeat][1] - 14, {g, sound: 'tap', h: 40});
      dot.setMode('bob', {home: [dot.x, dot.y]});
    }
    scratch.seated = seated;
    g.flags.seated = seated;
    void last;
    // Punto empuja al estudiante hacia el lugar libre
    p.setMode('still');
    await zip(d, p, s.x + 30, GROUND - 120, 0.6);
    g.audio.punto('hello');
    s.look(1, -0.2);
    await d.tween(0.5, k => { p.x = s.x + 30 - Math.sin(k * Math.PI) * 14; });
    g.setCinematic(false);
    await d.think('¿Para mí?');
    s.face(1);
    g.setCinematic(true);
    const [bx] = seats[bottomRight];
    await d.walk(s, bx + 46, GROUND, 160);
    s.setPose('sitGround', 0.8);
    s.face(-0.3);

    const pSeat = Object.entries(seated).find(([, who]) => who === 'punto');
    if (pSeat) {
      await zip(d, p, seats[+pSeat[0]][0], seats[+pSeat[0]][1] - 14, 0.6);
      p.setMode('bob', {home: [p.x, p.y]});
    }
    g.audio.cue('night');
    await d.wait(1.6);
  },
};

// ——————————————————————————————————————————————
// 1.10 El nombre (momento)
// ——————————————————————————————————————————————

const BOARD = {x: GRADAS.x + 330, y: GROUND - 238};
function boardMarkPos(i) {
  return [BOARD.x + i * 20 + Math.floor(i / 5) * 0, BOARD.y];
}

export const nombre = {
  id: 'c1.nombre',
  title: 'El nombre',
  moment: 'El nombre de lo que comparten',
  setup(g) {
    const w = g.world;
    base(g, stage('seated'));
    w.removeWhere(o => o.id.startsWith('pmark') || o.id.startsWith('num-') || o.id.startsWith('plink') || o.id === 'one-ring' || o.id === 'seat-ring' || o.id === 'word-14');
    const seats = art.seatPositions(GRADAS.x, GROUND, GRADAS.seats);
    const seated = g.flags.seated || Object.fromEntries(LINE_IDS.map((id, k) => [k, id]));
    const bottomRight = seats.reduce((best, pos, j) => (pos[1] > seats[best][1] + 1 || (Math.abs(pos[1] - seats[best][1]) < 1 && pos[0] > seats[best][0]) ? j : best), 0);
    const s = student(w, seats[bottomRight][0] + 46, {pose: 'sitGround', facing: -0.3});
    void s;
    punto(w, 0, 0);
    for (const [j, id] of Object.entries(seated)) {
      const dot = id === 'punto' ? w.get('punto') : rondaDot(w, RONDA_IDS.indexOf(id));
      dot.visible = true;
      dot.fade = 1;
      dot.x = seats[+j][0];
      dot.y = seats[+j][1] - 14;
      dot.setMode('bob', {home: [dot.x, dot.y]});
    }
    g.camera.go(SHOTS.gradas);
  },
  async play(d, g, {replay} = {}) {
    const w = g.world;
    const s = w.get('student');
    const p = w.get('punto');
    const seated = g.flags.seated || {};
    const seats = art.seatPositions(GRADAS.x, GROUND, GRADAS.seats);
    // Punto intenta marcar, como vio hacer
    g.setCinematic(true);
    await d.shot(SHOTS.nombre, 1.6);
    p.setMode('still');
    await zip(d, p, BOARD.x - 40, BOARD.y, 0.6);
    d.describe('Punto se lanza contra el pizarrón, como quien prueba una tiza.');
    for (let attempt = 0; attempt < 2; attempt++) {
      await zip(d, p, BOARD.x - 40, BOARD.y + 26, 0.12);
      g.audio.tap(0.3, 1.4);
      await pulse(d, p, 1, -0.35, 0.15);
      await zip(d, p, BOARD.x - 40, BOARD.y - 20, 0.25);
      if (attempt === 0) g.audio.punto('no');
      await d.wait(0.4);
    }
    // tercer intento: una marca
    const first = w.add(new Drawing('pmark0', art.tally('pmark0', ...boardMarkPos(0), 36).map(st => recolor(st, YELLOW)), {z: 9, progress: 0}));
    await zip(d, p, ...boardMarkPos(0), 0.12);
    await d.draw(first, 0.25);
    g.audio.punto('surprise');
    await zip(d, p, BOARD.x, BOARD.y - 60, 0.3);
    await pulse(d, p, 2, 0.5, 0.2);
    g.setCinematic(false);
    await d.think('¡Hizo una marca! Su primera marca.');
    d.describe('Punto aprendió a marcar. Ahora va de cada uno de los sentados a la pizarra y deja una marca por cada uno.');
    // una marca por cada uno de los que están sentados (incluido vos)
    g.setCinematic(true);
    const everyone = [...Object.values(seated).filter(id => id !== 'punto'), 'punto', 'student'];
    for (let i = 1; i < everyone.length; i++) {
      const who = everyone[i];
      const o = w.get(who);
      const [tx, ty] = who === 'student' ? s.headPos() : [o.x, o.y];
      await zip(d, p, tx, ty - 24, 0.16);
      const mk = w.add(new Drawing(`pmark${i}`, art.tally(`pmark${i}`, ...boardMarkPos(i), 36).map(st => recolor(st, YELLOW)), {z: 9, progress: 0}));
      await zip(d, p, ...boardMarkPos(i), 0.16);
      await d.draw(mk, 0.12, {sound: false});
      g.audio.tap(0.22, 1.6 + (i % 4) * 0.1);
    }
    // la de vos
    await zip(d, p, BOARD.x + everyone.length * 20 + 30, BOARD.y - 40, 0.3);
    p.setMode('bob', {home: [p.x, p.y]});
    g.setCinematic(false);
    await d.think('Una por cada uno. Hasta una para él… y una para mí.');
    // el nombre
    s.setPose('idle', 0.6);
    s.face(1);
    g.setCinematic(true);
    await d.walk(s, BOARD.x - 10, GROUND, 170);
    await d.shot(SHOTS.marksNight, 1.4);
    s.setPose('write', 0.3);
    const numX = BOARD.x + 40, numY = GROUND - 96;
    const num = w.add(new Label('num-14', '14', numX, numY, {size: 84, weight: 700, reveal: 0, z: 9}));
    await d.draw(num, 0.9, {key: 'reveal'});
    s.setPose('idle', 0.4);
    g.setCinematic(false);
    await d.think('Para no tener que mirar todas las marcas cada vez, le pongo un nombre.');
    // Punto intenta emparejar el numeral
    g.setCinematic(true);
    s.face(-0.6);
    await d.walk(s, numX + 170, GROUND, 140);
    await d.shot(SHOTS.nombre, 1.2);
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = '700 84px Kalam';
    const w1 = ctx.measureText('1').width, w4 = ctx.measureText('4').width;
    const g1 = [numX + w1 / 2, numY - 30], g4 = [numX + w1 + w4 / 2, numY - 30];
    const pick = Object.values(seated).filter(id => id !== 'punto').slice(0, 2).map(id => w.get(id));
    p.setMode('still');
    await zip(d, p, g1[0], g1[1] - 50, 0.4);
    g.audio.punto('hop');
    const l1 = w.add(new Link('plink1', () => [g1[0], g1[1] - 24], () => [pick[0].x, pick[0].y], {ch: YELLOW, p: 0.7, w: 1.8, z: 8, progress: 0}));
    await d.draw(l1, 0.5);
    await zip(d, p, g4[0], g4[1] - 50, 0.3);
    g.audio.punto('hop');
    const l4 = w.add(new Link('plink4', () => [g4[0], g4[1] - 24], () => [pick[1].x, pick[1].y], {ch: YELLOW, p: 0.7, w: 1.8, z: 8, progress: 0}));
    await d.draw(l4, 0.5);
    await zip(d, p, g4[0] + 40, g4[1] - 80, 0.4);
    g.audio.punto('question');
    await d.wait(0.6);
    p.setMode('bob', {home: [p.x, p.y]});
    d.describe('Punto unió el 1 con uno de la Ronda y el 4 con otro. Los demás quedaron sin unir. Te mira, confundido.');
    g.setCinematic(false);
    if (!replay) {
      const options = [
        {id: 'name', text: 'El 14 no es una colección: es un nombre.'},
        {id: 'hidden', text: 'El 14 tiene catorce adentro, pero no se ven.'},
        {id: 'two', text: 'Tenés razón: en el 14 hay dos.'},
      ];
      for (;;) {
        const r = await d.choose(options, {prompt: '¿Qué le explicás a Punto?'});
        d.evidence('numeral', {answer: r});
        if (r === 'name') break;
        if (r === 'hidden') await d.think('No. "14" son dos signos y nada más. No hay catorce escondidos adentro.');
        if (r === 'two') await d.think('Pero entonces "14" diría lo mismo que dos marcas. Y no: dice cuántos somos.');
        options.splice(options.findIndex(o => o.id === r), 1);
      }
    }
    g.setCinematic(true);
    s.setPose('write', 0.3);
    const voice = g.audio.erase(0.8, 0.6);
    await d.all(d.fadeTo(l1, 0, 0.7), d.fadeTo(l4, 0, 0.7));
    voice?.stop?.();
    w.remove('plink1');
    w.remove('plink4');
    // las marcas de Punto se emparejan con todos: eso sí es una colección
    const allIds = [...Object.values(seated).filter(id => id !== 'punto'), 'punto', 'student'];
    const links = allIds.map((id, i) => {
      const o = w.get(id);
      const at = id === 'student' ? () => { const h = s.headPos(); return [h[0], h[1] - 20]; } : () => [o.x, o.y];
      const [mx, my] = boardMarkPos(i);
      return w.add(new Link(`plink-all${i}`, () => [mx, my - 20], at, {p: 0.45, w: 1.4, z: 7, progress: 0}));
    });
    s.setPose('idle', 0.4);
    await d.shot(SHOTS.nombre, 1.2);
    await d.all(...links.map((l, i) => d.wait(i * 0.07).then(() => d.draw(l, 0.4, {sound: i % 4 === 0}))));
    g.setCinematic(false);
    await d.think('Las marcas sí se pueden emparejar con nosotros, sin que sobre nada. Las marcas son una colección: como nosotros, como los asientos ocupados.');
    await d.all(...links.map(l => d.fadeTo(l, 0, 0.8)));
    w.removeWhere(o => o.id.startsWith('plink-all'));
    g.setCinematic(true);
    await d.shot(SHOTS.marksNight, 1.2);
    const word = w.add(new Label('word-14', 'catorce', numX + 120, numY - 4, {size: 46, reveal: 0, z: 9}));
    s.setPose('write', 0.3);
    await d.draw(word, 0.9, {key: 'reveal'});
    s.setPose('idle', 0.4);
    g.audio.cue('reveal');
    g.setCinematic(false);
    await d.think('Lo que tienen en común —las marcas, los asientos ocupados, nosotros— no es la forma ni el tamaño: es que se pueden emparejar sin que sobre nada.');
    await d.think('Eso que comparten es el número. "14" y "catorce" son dos nombres para él.');
    // Punto rodea el 1
    g.setCinematic(true);
    p.setMode('still');
    await zip(d, p, g1[0] - 20, g1[1] - 10, 0.5);
    const ring = w.add(new Drawing('one-ring', [art.S(art.circleGuideFor(g1[0], g1[1] - 6, 38), 717, {w: 2.2, p: 0.8, ch: YELLOW})], {z: 9, progress: 0}));
    await d.all(d.draw(ring, 0.9), d.tween(0.9, k => {
      const a = -Math.PI / 2 + k * Math.PI * 2.1;
      p.x = g1[0] + Math.cos(a) * 38;
      p.y = g1[1] - 6 + Math.sin(a) * 38;
    }));
    g.audio.punto('question');
    p.setMode('bob', {home: [g1[0] + 52, g1[1] - 60]});
    d.describe('Punto dibuja un círculo amarillo alrededor del 1 de "14" y se queda mirándolo.');
    g.setCinematic(false);
    await d.think('¿Por qué un 1, si acá no hay uno solo de nada?');
    await d.say('student', 'Buena pregunta.');
    await d.think('Mañana.');
    if (!replay) writeJournal(g);
  },
};

function recolor(st, ch) {
  st.ch = ch;
  return st;
}

/** Bitácora: sólo afirma lo que la partida muestra que pasó. */
function writeJournal(g) {
  const ev = g.state.evidence;
  const has = k => ev.some(e => e.kind === k);
  const seen = [];
  const rec = ev.filter(e => e.kind === 'record').length;
  if (rec) seen.push(`Antes de la Marea hiciste una marca por cada uno de la Ronda${ev.some(e => e.kind === 'record-repeat') ? ' (y cuando volviste a tocar a alguien ya anotado, no lo marcaste dos veces)' : ''}.`);
  if (has('record-method') && ev.find(e => e.kind === 'record-method').choice === 'count') seen.push('Intentaste contarlos mientras se movían y viste por qué hacía falta algo que se quedara quieto.');
  const checks = ev.filter(e => e.kind === 'check' && !e.final);
  const invalid = checks.filter(c => c.verdict === 'invalid').length;
  const incomplete = checks.filter(c => c.verdict === 'incomplete').length;
  let pairLine = 'Al volver, emparejaste marcas y puntos: sobró una marca, y faltaba el más chico.';
  if (invalid) pairLine += ' En el camino, una comprobación mostró a alguien unido a dos: no valía.';
  if (incomplete) pairLine += ' Otra comprobación mostró que, mientras sobran de los dos lados, todavía no se sabe nada.';
  seen.push(pairLine);
  const reading = g.flags.reading;
  if (reading === 'mistake') seen.push('Pensaste que la marca de más podía ser un error tuyo; tu registro mostraba que no.');
  const pred = g.flags.prediction;
  const predText = {no: '"no alcanzan: la fila es más larga"', yes: '"alcanzan, y sobra lugar"', pair: '"no sé: hay que emparejar"'}[pred];
  if (predText) seen.push(`En las gradas predijiste ${predText}. Al sentarlos de a uno, sobró un asiento.`);
  const hints = ev.filter(e => e.kind === 'hint').length;
  if (hints) seen.push(`Pediste ${hints === 1 ? 'una ayuda' : `${hints} ayudas`}.`);
  const entry = {
    id: 'c1',
    title: '¿Están todos?',
    abbr: 'Misma cantidad: se pueden emparejar sin que sobre nada.',
    body: [
      'Si al emparejar sobra algo de un lado, ese lado tiene más. No importa la forma, el tamaño ni lo separados que estén.',
      'Si sobran de los dos lados, todavía no se puede concluir. Si algo quedó unido a dos, no vale.',
      'El número es lo que comparten todas las colecciones que se pueden emparejar entre sí. "14" y "catorce" son nombres de ese número: no tienen catorce de nada adentro.',
    ],
    seen,
    moment: 'c1.todos',
  };
  g.state.journal = g.state.journal.filter(e => e.id !== entry.id).concat([entry]);
  g.ui.toast('Anotado en la Bitácora');
  g.saveNow();
}

export const SEGMENTS = [puerta, alguien, ronda, marea, vuelven, quien, busqueda, todos, gradas, nombre];
