// Poses con silueta (E11). Mismo formato que POSES de src/engine/figure.js, más `face`: la orientación
// que la pose necesita para leerse. El esqueleto del motor es de perfil: a ¾ el brazo de atrás se pega al torso
// (hoja c10/poses-a). Por eso:
//  - acciones hacia adelante (escribir, señalar, pensar) → de perfil (face ≈ 0.9): un brazo adelante, el otro atrás;
//  - emociones (sorpresa, abrirse, encogerse de hombros) → de frente (face ≈ 0.15): los brazos se abren a los lados.
// Reglas verificables en la hoja: brazos separados del torso; inclinación de torso y cabeza en el mismo sentido;
// nunca los dos brazos con el mismo ángulo; piernas en apoyo (una adelante, una atrás).

import {POSES} from '../../src/engine/figure.js';

export const POSES2 = {
  ...POSES,
  stand: {face: 0.85, lean: 0.02, tilt: 0.05, armL: [-0.32, 0.4], armR: [0.3, 0.5], legL: [0.2, -0.06], legR: [-0.16, -0.04], drop: 0},
  write: {face: 0.92, lean: 0.1, tilt: 0.12, armL: [-0.55, 0.7], armR: [1.75, 0.55], legL: [0.32, -0.12], legR: [-0.24, -0.06], drop: 2},
  point: {face: 0.92, lean: -0.02, tilt: -0.1, armL: [-0.65, 0.5], armR: [2.25, 0.04], legL: [0.3, -0.08], legR: [-0.26, -0.05], drop: 0},
  think: {face: 0.85, lean: 0.04, tilt: 0.32, armL: [0.75, 1.75], armR: [0.55, 2.45], legL: [0.14, -0.06], legR: [-0.2, -0.05], drop: 0},
  oops: {face: 0.75, lean: 0.16, tilt: 0.42, armL: [-0.75, 0.5], armR: [2.75, 1.35], legL: [0.18, -0.12], legR: [-0.14, -0.05], drop: 3},
  // de frente: ángulos positivos abren cada brazo hacia su lado
  surprise: {face: 0.15, lean: -0.2, tilt: -0.26, armL: [1.95, -0.35], armR: [2.2, -0.45], legL: [0.32, -0.08], legR: [0.18, -0.05], drop: -4},
  shrug: {face: 0.12, lean: -0.03, tilt: 0.3, armL: [0.4, 1.35], armR: [0.5, 1.2], legL: [0.12, -0.04], legR: [0.18, -0.03], drop: 0},
  open: {face: 0.15, lean: -0.08, tilt: -0.2, armL: [1.25, 0.35], armR: [1.45, 0.2], legL: [0.3, -0.06], legR: [0.22, -0.04], drop: -2},
  // mirar arriba / abajo con silueta (la lookUp/lookDown del motor, de perfil, junta brazos y piernas en una línea: c15)
  lookUp: {face: 0.7, lean: -0.1, tilt: -0.36, armL: [-0.4, 0.45], armR: [0.38, 0.5], legL: [0.22, -0.06], legR: [-0.2, -0.04], drop: 0},
  lookDown: {face: 0.7, lean: 0.12, tilt: 0.4, armL: [-0.3, 0.5], armR: [0.42, 0.6], legL: [0.2, -0.06], legR: [-0.18, -0.04], drop: 2},
  eureka: {face: 0.5, lean: -0.12, tilt: -0.38, armL: [-0.45, 0.55], armR: [2.85, -0.15], legL: [0.24, -0.06], legR: [-0.3, -0.04], drop: -5},
};
