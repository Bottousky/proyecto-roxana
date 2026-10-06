// Capítulo 11 — Lo que pasa a veces.

import {chapterCard} from '../ending.js';
import {baldes, medio, parejo, grafico} from './scenes-a.js';
import {contar, dados, causa, anticipar} from './scenes-b.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_11 = {
  number: 11,
  title: 'Lo que pasa a veces',
  segments: [baldes, medio, parejo, grafico, contar, dados, causa, anticipar],
  async ending(d, g) {
    await chapterCard(d, g, 'Fin del capítulo 11', 'Capítulo 12: Anticipar');
    if (!CHAPTERS[12]) await d.say(null, 'El capítulo 12 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
