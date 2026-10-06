// Capítulo 2 — Demasiados para marcar.

import {Label} from '../engine/world.js';
import {SEGMENTS} from './scenes.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_2 = {
  number: 2,
  title: 'Demasiados para marcar',
  segments: SEGMENTS,
  async ending(d, g) {
    const w = g.world;
    g.setCinematic(true);
    const view = g.camera.current;
    const cx = view.x + view.w / 2;
    const cy = view.y + view.h * 0.16;
    const a = w.add(new Label('end-1', 'Fin del capítulo 2', cx, cy, {size: 60, align: 'center', reveal: 0, z: 60, weight: 700}));
    const b = w.add(new Label('end-2', 'Capítulo 3: La línea', cx, cy + 70, {size: 34, align: 'center', reveal: 0, z: 60}));
    g.audio.cue('end');
    await d.draw(a, 1.4, {key: 'reveal'});
    await d.draw(b, 1.2, {key: 'reveal'});
    await d.wait(2.5);
    g.setCinematic(false);
    if (!CHAPTERS[3]) await d.say(null, 'El capítulo 3 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
