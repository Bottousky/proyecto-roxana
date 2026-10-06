// Capítulo 2 — Demasiados para marcar.

import {chapterCard} from '../ending.js';
import {SEGMENTS} from './scenes.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_2 = {
  number: 2,
  title: 'Demasiados para marcar',
  segments: SEGMENTS,
  async ending(d, g) {
    await chapterCard(d, g, 'Fin del capítulo 2', 'Capítulo 3: Menos que nada');
    if (!CHAPTERS[3]) await d.say(null, 'El capítulo 3 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
