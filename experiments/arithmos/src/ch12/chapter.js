// Capítulo 12 — Anticipar. Cierre del juego.

import {chapterCard} from '../ending.js';
import {familias, perillas, salto, encadenar} from './scenes-a.js';
import {rapido, junta, tramos, final} from './scenes-b.js';

export const CHAPTER_12 = {
  number: 12,
  title: 'Anticipar',
  segments: [familias, perillas, salto, encadenar, rapido, junta, tramos, final],
  async ending(d, g) {
    await chapterCard(d, g, 'Arithmos', 'Lo que se entiende, resiste.');
    await d.say(null, 'Fin. Tu Bitácora queda guardada: desde ella podés volver a desplegar cualquier momento del viaje.');
  },
};
