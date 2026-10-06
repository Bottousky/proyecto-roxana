// Capítulo 5 — Partes de algo.

import {chapterCard} from '../ending.js';
import {medio, barras, equivalentes, recta} from './scenes-a.js';
import {comparar, sumar, decimos, cien, diagonal} from './scenes-b.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_5 = {
  number: 5,
  title: 'Partes de algo',
  segments: [medio, barras, equivalentes, recta, comparar, sumar, decimos, cien, diagonal],
  async ending(d, g) {
    await chapterCard(d, g, 'Fin del capítulo 5', 'Capítulo 6: Lo que no se ve');
    if (!CHAPTERS[6]) await d.say(null, 'El capítulo 6 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
