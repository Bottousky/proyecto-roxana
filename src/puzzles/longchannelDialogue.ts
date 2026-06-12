import type { HeatLevel } from './common.ts';

const SOLVED_SCENE =
  '<b>El horno lejano respira.</b> La Forjadora apoya la mano en el canal y la deja ahí.<br/><br/>';

const SOLVED_OPENING = {
  frio: 'Frío. El horno a fuego pleno y el canal frío.',
  tibio:
    'Tibio. Apenas tibio, con el horno a fuego pleno. Treinta años creyendo que esto no se podía.',
} as const;

const SOLVED_SHARED_DIALOGUE =
  'El río no se gasta. El río trabaja. Y el trabajo se paga. …Por fin alguien que lo dice con números.»<br/>' +
  '<b>Edda:</b> «Mucho empuje, poco río: la misma entrega con menos peaje. ¿Por eso los Maestros subían el empuje para los caminos largos…?»<br/>' +
  '<b>Ohm:</b> «Hipótesis: correcta. Alcance: más grande de lo que crees.»';

export function longChannelSolvedDialogue(level: HeatLevel): string {
  if (level !== 'frio' && level !== 'tibio') {
    throw new Error(`El Canal Largo no puede resolverse con nivel ${level}.`);
  }

  return (
    SOLVED_SCENE +
    `<b>Forjadora:</b> «${SOLVED_OPENING[level]}<br/>` +
    SOLVED_SHARED_DIALOGUE
  );
}
