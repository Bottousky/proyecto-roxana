// Capítulo 3 — Menos que nada.

import {chapterCard} from '../ending.js';
import {deuda, pares, linea} from './scenes-a.js';
import {distancia, perdon, pozo, hacia} from './scenes-b.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_3 = {
  number: 3,
  title: 'Menos que nada',
  segments: [deuda, pares, linea, distancia, perdon, pozo, hacia],
  async ending(d, g) {
    await chapterCard(d, g, 'Fin del capítulo 3', 'Capítulo 4: Veces');
    if (!CHAPTERS[4]) await d.say(null, 'El capítulo 4 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
