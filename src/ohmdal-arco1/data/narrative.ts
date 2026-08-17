/**
 * Narrative — Ohmdal Arco I.
 *
 * All dialogue is written in Spanish (tuteo, no voseo). This is the
 * source of truth for the in-game script. The engine reads scripts by
 * id; each script is an array of beats. A beat is a single line of
 * dialogue with optional choices, an end-state, or a trigger.
 *
 * Triggers (hook) call into the engine: `setFlag`, `solvePuzzle`,
 * `openGate`, `awakenOhm`, etc. The dialogue system doesn't know about
 * gameplay internals — it just emits a hook name and the game responds.
 */

export type ScriptId = string;

export interface DialogueLine {
  speaker: string;       // Display name. 'narrator' = no portrait.
  portrait?: string;     // Portrait key.
  text: string;
  /** Optional choices. If absent, line auto-advances on click. */
  choices?: DialogueChoice[];
  /** Hook fired when this line is shown. */
  hook?: string;
  /** Optional flag to set when this line completes. */
  setFlag?: string;
  /** End the script (default true if no choices). */
  end?: boolean;
}

export interface DialogueChoice {
  text: string;
  next?: number;            // Index of next line, or...
  setFlag?: string;
  hook?: string;
  end?: boolean;
}

export interface DialogueScript {
  id: ScriptId;
  /** Beats. */
  lines: DialogueLine[];
}

export interface Narrative {
  scripts: Record<ScriptId, DialogueScript>;
  /** Hook handlers — the engine listens to these names. */
  hooks: Record<string, true>;
}

/* ------------------------------------------------------------------ */
/* Helper: build a script quickly.                                    */
/* ------------------------------------------------------------------ */
function script(id: ScriptId, lines: DialogueLine[]): DialogueScript {
  return { id, lines };
}

/* ------------------------------------------------------------------ */
/* CUTSCENES / LINEAR BEATS                                            */
/* ------------------------------------------------------------------ */

// Opening — when the player enters the world for the first time.
const opening = script('opening_intro', [
  {
    speaker: 'narrator',
    text: 'El Portal se cierra detrás tuyo. El aire es frío. No hay ruido eléctrico: solo viento.',
    hook: 'entrancePan',
  },
  {
    speaker: 'narrator',
    text: 'Una plaza empedrada. Filas de cobre viejo en el suelo. Cuatro faroles apagados. Al norte, una puerta monumental con un símbolo que no reconocés.',
  },
  {
    speaker: 'narrator',
    text: 'Al este, una casa con la puerta abierta y un cartel hecho a mano: "Reparaciones — Maese Lumen".',
  },
  {
    speaker: 'narrator',
    text: 'Estás solo. La plaza está sola. Pero el cobre del suelo, hace mucho, llevó algo.',
    setFlag: 'opening_seen',
  },
]);

// Edda's first appearance — the in-world "two explanations" beat.
const eddaMeeting = script('edda_meeting', [
  {
    speaker: 'Edda',
    portrait: 'edda',
    text: '¡Eh! Estás parado en medio de la Plaza como si no supieras qué mirar primero.',
  },
  {
    speaker: 'Edda',
    portrait: 'edda',
    text: '¿Qué creés que le pasa? Yo tengo dos ideas, y las dos sirven para empezar.',
    choices: [
      { text: 'No hay fuerza. Se gastó.', setFlag: 'edda_hypothesis_a', end: true },
      { text: 'La fuerza está. No vuelve.', setFlag: 'edda_hypothesis_b', end: true },
      { text: 'No sé. Solo veo cables.', setFlag: 'edda_hypothesis_c', end: true },
    ],
  },
  {
    speaker: 'Edda',
    portrait: 'edda',
    text: 'Mira la traza de cobre del suelo. Mira el agua. Después hablamos.',
    hook: 'eddaHintTrail',
    setFlag: 'edda_seen',
  },
]);

// Lumen at his workshop, before any interaction.
const lumenWorkshop = script('lumen_workshop', [
  {
    speaker: 'Maese Lumen',
    portrait: 'lumen',
    text: 'Acá estoy. El banco no responde. Hace años que no responde, pero hoy me levanto con la idea de que hay que mirarlo en serio.',
  },
  {
    speaker: 'Maese Lumen',
    portrait: 'lumen',
    text: 'Yo conozco los gestos. Sustituir, apretar, mover. Pero no tengo un modo de saber qué está mal antes de tocarlo.',
  },
  {
    speaker: 'Maese Lumen',
    portrait: 'lumen',
    text: 'Si tenés un instrumento, o si sabés proponer uno, lo probamos. Pero no se cambia una pieza solo porque alguien la miró con cara de sospechosa.',
    setFlag: 'lumen_seen',
  },
]);

// Lumen's diagnostic intro.
const lumenBench = script('lumen_bench', [
  {
    speaker: 'Maese Lumen',
    portrait: 'lumen',
    text: 'Acá hay tres módulos. El de la izquierda es el que sustituyo siempre. El del medio es el que casi nunca toco. El de la derecha… ese es del que menos sé.',
  },
  {
    speaker: 'Maese Lumen',
    portrait: 'lumen',
    text: 'Yo diría que el problema está donde siempre lo encuentro. Pero también podría ser que la causa está en otro lado y yo me equivoqué todos estos años.',
  },
  {
    speaker: 'Maese Lumen',
    portrait: 'lumen',
    text: 'Medí. Después decidimos.',
    hook: 'openDiagnosisPuzzle',
  },
]);

// Bell — the plaza bell, no response.
const bellInert = script('bell_inert', [
  {
    speaker: 'narrator',
    text: 'La campana está fría. El badajo no suena. Es de cobre, pero no de ese cobre que se mueve.',
    setFlag: 'bell_seen',
  },
]);

// Portal monolith — the Ω is dark.
const portalInert = script('portal_inert', [
  {
    speaker: 'narrator',
    text: 'Una columna con el símbolo Ω grabado. Está apagado. El cobre del suelo se mete dentro de la piedra y vuelve a salir, pero no lleva nada.',
  },
  {
    speaker: 'narrator',
    text: 'Si se restaura, esto puede ser la fuente. Si se restaura.',
  },
  {
    speaker: 'narrator',
    text: 'A la izquierda, sobre el empedrado, hay un cable de cobre. Tiene un punto donde el metal no toca metal.',
    hook: 'hintCableMain',
  },
]);

// Broken cable on the main Camino.
const cableBrokenMain = script('cable_broken_main', [
  {
    speaker: 'narrator',
    text: 'El cobre del suelo está interrumpido. La juntura entre dos losetas no se ve. Es del tipo de rotura que no aparece mirando: hay que medir.',
  },
  {
    speaker: 'narrator',
    text: 'Si tenés un instrumento de Ohm, podés verificar antes de tocar. Si no, tu hipótesis se valida con el sistema completo.',
    hook: 'openContinuityPuzzle',
  },
]);

// Cable at the Puerta.
const cableBrokenPuerta = script('cable_broken_puerta', [
  {
    speaker: 'narrator',
    text: 'Otro cable roto. Esta vez, el que debería alimentar a Ohm, sobre su pedestal. El cobre está partido en un punto preciso.',
  },
  {
    speaker: 'narrator',
    text: 'Si unís este y el del Camino, el circuito completo se cierra. La consecuencia se observa en la cara de Ohm.',
    hook: 'openContinuityPuzzle',
  },
]);

// Ohm inert.
const ohmInert = script('ohm_inert', [
  {
    speaker: 'narrator',
    text: 'Una forma cúbica con cabeza esférica achatada. Dos brazos con pinzas colgando. Cobre pulido en la carcasa, ahora opaco. Los ojos-lente están apagados.',
  },
  {
    speaker: 'narrator',
    text: 'Tiene un Ω grabado en el pecho. Es un autómata del Instituto. Y está dormido.',
  },
  {
    speaker: 'narrator',
    text: 'Si le llega energía, abre los ojos. Pero antes de cerrar el circuito, conviene predecir qué indicador va a cambiar.',
  },
]);

// Ohm awakening — triggered when the player energizes the circuit.
const ohmAwakening = script('ohm_awakening', [
  {
    speaker: 'Ohm',
    portrait: 'ohm',
    text: 'Trayectoria completa. Conciencia… también.',
    hook: 'ohmsVoiceStart',
  },
  {
    speaker: 'Ohm',
    portrait: 'ohm',
    text: 'Calibrando. Memoria: parcial. Instrumentos: en línea. Listo para medir lo que vos decidas medir.',
  },
  {
    speaker: 'Ohm',
    portrait: 'ohm',
    text: 'Orden de causalidad: pendiente. Pero el orden de la causa ya está hecho.',
    setFlag: 'ohm_awake',
  },
]);

// Fountain dry, then after.
const fountainDry = script('fountain_dry', [
  {
    speaker: 'narrator',
    text: 'Una pileta de piedra con una bomba en el centro. El agua no sale. Las baldosas del borde están secas y blancas, como si no hubieran sido tocadas en mucho tiempo.',
  },
  {
    speaker: 'narrator',
    text: 'La bomba tiene un Ω grabado. Si la pileta se llena, la plaza se llena de sonido.',
  },
]);

// Fountain after.
const fountainFlowing = script('fountain_flowing', [
  {
    speaker: 'narrator',
    text: 'El agua sube. Primero un hilo, después un chorro. La pileta se llena. La plaza cambia de ruido: aparece el sonido del agua corriendo sobre piedra.',
  },
  {
    speaker: 'narrator',
    text: 'Las lámparas que ya están alimentadas parpadean dos veces y se quedan encendidas. La fuente pulsa en luz cálida.',
  },
]);

// Lamp off (any lamp).
const lampOff = script('lamp_off', [
  {
    speaker: 'narrator',
    text: 'La lámpara está apagada. El filamento está entero. El cable llega hasta acá.',
  },
  {
    speaker: 'narrator',
    text: 'Si la energía llega, enciende. Si no, no. La física es la física.',
  },
]);

// Lamp on (after power).
const lampOn = script('lamp_on', [
  {
    speaker: 'narrator',
    text: 'El filamento brilla. La luz cae sobre la piedra. Es tenue, pero se ve.',
  },
]);

// Manantial gate closed.
const manantialGateClosed = script('manantial_gate_closed', [
  {
    speaker: 'narrator',
    text: 'Una compuerta de cobre y madera. Tiene grabado un Ω arriba. Está sellada: la energía no puede pasar al Manantial.',
  },
  {
    speaker: 'narrator',
    text: 'Resolver la distribución del Taller puede darte la evidencia para abrir esto. O no. La decisión es tuya.',
    hook: 'openDistributionPuzzle',
  },
]);

// Manantial gate open.
const manantialGateOpen = script('manantial_gate_open', [
  {
    speaker: 'narrator',
    text: 'La compuerta se desliza. El agua del Manantial empieza a caer por la calzada. Las piedras reciben algo que no recibían en mucho tiempo.',
  },
  {
    speaker: 'narrator',
    text: 'Arriba, las dos lámparas del Manantial encienden. La fuente central se llena desde arriba. Algo cambia en el aire: el cobre de las paredes, las losas, los canalones, empieza a tener un brillo que antes no tenía.',
    setFlag: 'manantial_open',
  },
]);

// Habitantes (background NPCs).
const habitanteAprendiz = script('habitante_aprendiz', [
  {
    speaker: 'Aprendiz',
    text: 'Yo ayudaba a Lumen. Pero no entiendo qué cambió. Me pidió que "no toque nada hasta que el de la Plaza sepa".',
  },
]);
const habitanteRegadora = script('habitante_regadora', [
  {
    speaker: 'Regadora',
    text: 'La acequia está seca. Si enciende la bomba, llena la pileta. Si llena la pileta, lleno yo. Si lleno yo, regamos. Pero el agua no está en el cobre: el agua está arriba, en el Manantial.',
  },
]);
const habitanteAnciano = script('habitante_anciano', [
  {
    speaker: 'Anciano',
    text: 'Yo me acuerdo cuando las lámparas se encendían con sólo un gesto. Y me acuerdo cuando dejaron de encenderse también con un gesto.',
  },
  {
    speaker: 'Anciano',
    text: 'Las dos cosas pasaron por miedo. La pregunta es si vuelven a pasar por lo mismo.',
  },
]);

// Final beat — after the world is fully powered.
const manantialClosing = script('manantial_closing', [
  {
    speaker: 'Ohm',
    portrait: 'ohm',
    text: 'Pregunta registrada. Esta vez, con copia.',
  },
  {
    speaker: 'Edda',
    portrait: 'edda',
    text: 'No volvió la luz. Volvió la pregunta.',
    hook: 'showCredits',
  },
]);

/* ------------------------------------------------------------------ */
/* Public narrative object                                            */
/* ------------------------------------------------------------------ */

export const narrative: Narrative = {
  scripts: {
    opening_intro: opening,
    edda_meeting: eddaMeeting,
    lumen_workshop: lumenWorkshop,
    lumen_bench: lumenBench,
    bell_inert: bellInert,
    portal_inert: portalInert,
    cable_broken_main: cableBrokenMain,
    cable_broken_puerta: cableBrokenPuerta,
    ohm_inert: ohmInert,
    ohm_awakening: ohmAwakening,
    fountain_dry: fountainDry,
    fountain_flowing: fountainFlowing,
    lamp_off: lampOff,
    lamp_on: lampOn,
    manantial_gate_closed: manantialGateClosed,
    manantial_gate_open: manantialGateOpen,
    habitante_aprendiz: habitanteAprendiz,
    habitante_regadora: habitanteRegadora,
    habitante_anciano: habitanteAnciano,
    manantial_closing: manantialClosing,
  },
  hooks: {
    entrancePan: true,
    eddaHintTrail: true,
    openContinuityPuzzle: true,
    openDiagnosisPuzzle: true,
    openDistributionPuzzle: true,
    hintCableMain: true,
    ohmsVoiceStart: true,
    showCredits: true,
  },
};
