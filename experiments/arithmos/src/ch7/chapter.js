// Capítulo 7 — Crecer.

import {chapterCard} from '../ending.js';
import {lado, duplicar} from './scenes-a.js';
import {factores, grande, areas, alReves, completar, cuantasVeces, noSePuede} from './scenes-b.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_7 = {
  number: 7,
  title: 'Crecer',
  segments: [lado, duplicar, factores, grande, areas, alReves, completar, cuantasVeces, noSePuede],
  async ending(d, g) {
    await chapterCard(d, g, 'Fin del capítulo 7', 'Capítulo 8: Formas');
    if (!CHAPTERS[8]) await d.say(null, 'El capítulo 8 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
