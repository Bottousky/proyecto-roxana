// Cierre de capítulo: la cámara mira hacia arriba y el título se escribe en el cielo del pizarrón,
// lejos de lo que quedó dibujado abajo.

import {Label} from './engine/world.js';

export async function chapterCard(d, g, title, next) {
  const w = g.world;
  g.setCinematic(true);
  const v = g.camera.current;
  const sky = {x: v.x, y: v.y - v.h * 0.9, w: v.w, h: v.h};
  await d.shot(sky, 2.4);
  const cx = sky.x + sky.w / 2, cy = sky.y + sky.h * 0.42;
  const a = w.add(new Label('end-1', title, cx, cy, {size: 60, align: 'center', reveal: 0, z: 60, weight: 700}));
  const b = w.add(new Label('end-2', next, cx, cy + 70, {size: 34, align: 'center', reveal: 0, z: 60}));
  g.audio.cue('end');
  await d.draw(a, 1.4, {key: 'reveal'});
  await d.draw(b, 1.2, {key: 'reveal'});
  await d.wait(2.5);
  g.setCinematic(false);
}
