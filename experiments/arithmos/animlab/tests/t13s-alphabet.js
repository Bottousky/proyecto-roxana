// Hoja de minúsculas y signos (estática): forma y legibilidad a tres tamaños, y frases reales del juego.
import {glyphGuides, GLYPHS, sideGap} from '../core/glyphs.js';
import {depositStroke, drawDeposit} from '../core/deposit.js';

const LINES = [
  ['abcdefghijklmnñopqrstuvwxyz', 80, 150],
  ['á é í ó ú  . , : ? ¿ - × →  0123456789', 80, 300],
  ['la tabla de ayer · esta mañana', 60, 450],
  ['¿están todos?  entra: 2 → se traba', 48, 570],
  ['Mara · Punto · ¡Bien! · x · x = 2 · 100 ÷ 4 · 30° · √2 ≈ 1,4', 40, 680],
  ['ABCDEFGHILMNOPQRSTUV ÷ ° < > ↑ ↓ ← √ ≈ % * ! ¡', 56, 790],
];
let strokes = [];
export default {
  title: 'minúsculas de un trazo y signos (E13b)',
  duration: 1,
  setup() {
    let seed = 1;
    for (const [text, size, y] of LINES) {
      let x = 60;
      for (const ch of text) {
        if (!GLYPHS[ch]) { x += 0.3 * size; continue; }
        for (const g of glyphGuides(ch, x, y, size, {seed: seed++, slant: 0.06})) strokes.push(depositStroke(g, {w: Math.max(3, size * 0.12), p: 0.9, seed: seed++, down: 0.14}));
        x += (GLYPHS[ch].adv + 2 * sideGap(ch) - (/[a-zñáéíóú]/.test(ch) ? 0.05 : 0)) * size;
      }
    }
  },
  render(lab, t, ctx) { for (const s of strokes) drawDeposit(ctx, s); },
};
