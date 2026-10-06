// Capítulo 10 — Vueltas y flechas.

import {chapterCard} from '../ending.js';
import {rueda, alto, repite, rampa} from './scenes-a.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_10 = {
  number: 10,
  title: 'Vueltas y flechas',
  segments: [rueda, alto, repite, rampa],
  async ending(d, g) {
    await chapterCard(d, g, 'Fin del capítulo 10', 'Capítulo 11: Lo que pasa a veces');
    if (!CHAPTERS[11]) await d.say(null, 'El capítulo 11 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
