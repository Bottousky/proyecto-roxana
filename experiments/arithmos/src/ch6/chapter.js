// Capítulo 6 — Lo que no se ve.

import {chapterCard} from '../ending.js';
import {caja, dosLados, memoria, porCero} from './scenes-a.js';
import {cuadrado, dividir, alReves, dosPasos} from './scenes-b.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_6 = {
  number: 6,
  title: 'Lo que no se ve',
  segments: [caja, dosLados, memoria, porCero, cuadrado, dividir, alReves, dosPasos],
  async ending(d, g) {
    await chapterCard(d, g, 'Fin del capítulo 6', 'Capítulo 7: Crecer');
    if (!CHAPTERS[7]) await d.say(null, 'El capítulo 7 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
