// Capítulo 8 — Formas.

import {chapterCard} from '../ending.js';
import {diagonal, vuelta, copias, doble} from './scenes-a.js';
import {cerca, pitagoras, casas, sombras} from './scenes-b.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_8 = {
  number: 8,
  title: 'Formas',
  segments: [diagonal, vuelta, copias, doble, cerca, pitagoras, casas, sombras],
  async ending(d, g) {
    await chapterCard(d, g, 'Fin del capítulo 8', 'Capítulo 9: Depende');
    if (!CHAPTERS[9]) await d.say(null, 'El capítulo 9 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
