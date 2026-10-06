// Capítulo 9 — Depende.

import {chapterCard} from '../ending.js';
import {flechas, maquina, puntos, recta} from './scenes-a.js';
import {dominio, imagen, maneras, vuelve} from './scenes-b.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_9 = {
  number: 9,
  title: 'Depende',
  segments: [flechas, maquina, puntos, recta, dominio, imagen, maneras, vuelve],
  async ending(d, g) {
    await chapterCard(d, g, 'Fin del capítulo 9', 'Capítulo 10: Vueltas y flechas');
    if (!CHAPTERS[10]) await d.say(null, 'El capítulo 10 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
