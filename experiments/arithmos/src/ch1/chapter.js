// Capítulo 1 — ¿Están todos?

import {chapterCard} from '../ending.js';
import {SEGMENTS} from './scenes.js';
import {CHAPTERS} from '../chapters.js';

export const CHAPTER_1 = {
  number: 1,
  title: '¿Están todos?',
  segments: SEGMENTS,
  async ending(d, g) {
    await chapterCard(d, g, 'Fin del capítulo 1', 'Capítulo 2: Demasiados para marcar');
    if (!CHAPTERS[2]) await d.say(null, 'El capítulo 2 todavía se está dibujando. Tu Bitácora y tus momentos quedan guardados.');
  },
};
