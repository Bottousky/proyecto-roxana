// Hoja de glifos (estática): forma, orden y legibilidad de cada signo a tres tamaños, más la tipografía Kalam actual.
import {glyphGuides, GLYPHS} from '../core/glyphs.js';
import {depositStroke, drawDeposit} from '../core/deposit.js';
import {chalkText} from '../../src/engine/chalk.js';

let strokes = [];
export default {
  title: 'glifos de un trazo (forma y legibilidad)',
  duration: 1,
  setup() {
    const chars = Object.keys(GLYPHS);
    const rows = [[90, 160], [60, 330], [36, 470]];
    let seed = 1;
    for (const [size, y] of rows) {
      let x = 60;
      for (const ch of chars) {
        for (const g of glyphGuides(ch, x, y, size, {seed: seed++})) strokes.push(depositStroke(g, {w: Math.max(3.2, size * 0.09), seed: seed++}));
        x += (GLYPHS[ch].adv + 0.25) * size;
      }
    }
    let x = 60;
    const eq = ['x', '−', '3', '=', '5'];
    for (const ch of eq) { for (const g of glyphGuides(ch, x + 900, 700, 70, {seed: seed++})) strokes.push(depositStroke(g, {w: 6.3, seed: seed++})); x += (GLYPHS[ch].adv + 0.35) * 70; }
  },
  render(lab, t, ctx) {
    for (const s of strokes) drawDeposit(ctx, s);
    chalkText(ctx, 'x − 3 = 5', 120, 740, {size: 96});
    lab.tag('k', 'motor actual (fuente Kalam)', 120, 790);
    lab.tag('g', 'glifos de un trazo', 960, 790);
  },
};
