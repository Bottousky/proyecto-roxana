// Hoja de poses (estática): pose del motor (fila de arriba) vs pose nueva (abajo), a ¾ (facing 0.7).
import {Figure, POSES} from '../../src/engine/figure.js';
import {POSES2} from '../core/poses.js';

const NAMES = [['idle', 'stand'], ['write', 'write'], ['point', 'point'], ['surprise', 'surprise'], ['think', 'think'], ['worry', 'oops'], ['shrug', 'shrug'], ['lookUp', 'eureka'], ['open', 'open']];
const figs = [];
export default {
  title: 'poses: motor (¾) vs nuevas (con su orientación)',
  duration: 1,
  setup() {
    NAMES.forEach(([a, b], i) => {
      const x = 110 + i * 170;
      const fa = new Figure('alumno', x, 400, {scale: 1.25, facing: 0.7}); fa.pose = {...POSES[a]}; fa.target = POSES[a]; fa.poseT = 1;
      const fb = new Figure('alumno', x, 820, {scale: 1.25, facing: POSES2[b].face ?? 0.7}); fb.pose = {...POSES2[b]}; fb.target = POSES2[b]; fb.poseT = 1;
      fa.label = a; fb.label = b;
      figs.push(fa, fb);
    });
  },
  render(lab, t, ctx) {
    for (const f of figs) { f.render(ctx, null, 0); lab.tag(f.label + f.y, f.label, f.x - 30, f.y + 30); }
  },
};
