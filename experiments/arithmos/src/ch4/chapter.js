// Capítulo 4 — Veces.

import {chapterCard} from '../ending.js';
import {grupos, girar, estirar} from './scenes-a.js';
import {repartir, medir, nadie, partir} from './scenes-b.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_4 = {
  number: 4,
  title: 'Veces',
  segments: [grupos, girar, estirar, repartir, medir, nadie, partir],
  async ending(d, g) {
    await chapterCard(d, g, 'Fin del capítulo 4', 'Capítulo 5: Partes de algo');
    if (!CHAPTERS[5]) await d.say(null, 'El capítulo 5 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
