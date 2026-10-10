import { PUZZLES, evaluatePuzzle, initialPuzzleSnapshot, terracesAgreement } from './puzzle-model.js';

// What a repair was really about. Three layers, in this order (PEDAGOGIA.md, «concreteness fading»):
// what the player did and saw on the bench; what was happening that nobody can see (charges that are
// already in the copper and get pushed round, a push that is shared along the loop); and only then the
// word the Instituto uses, its unit and, sometimes, the relation that sums it up. The numbers are always
// the player's own montage, read from the same model as the bench, never a textbook example.

const num = (n, decimals = 1) => {
  const v = Math.abs(n) < .5 * 10 ** -decimals ? 0 : n;
  return v.toLocaleString('es-AR', { maximumFractionDigits: decimals });
};
export const volts = n => `${num(n, 1)} V`;
export const amps = n => `${num(n, 2)} A`;
export const watts = n => `${num(n, 1)} W`;
const copy = value => JSON.parse(JSON.stringify(value));
const branch = (r, id) => r.solution.branches[id] ?? { voltage: 0, current: 0, power: 0 };
const V = (r, id) => Math.abs(branch(r, id).voltage ?? 0), I = (r, id) => Math.abs(branch(r, id).current ?? 0), P = (r, id) => Math.abs(branch(r, id).power ?? 0);
const live = state => ({ ...copy(state), sourceOn: true, tripped: false });
const variant = (id, state, mutate) => { const s = live(state); mutate(s); return evaluatePuzzle(id, s); };
const touches = (w, ...ids) => w.some(n => ids.includes(n));

// ── Palabras del oficio ──────────────────────────────────────────────────────────────────
// The words Ohmdal uses, next to the ones the Instituto uses. Each one is earned on a bench.
export const WORDS = {
  carga: { world: 'Lo que se mueve en el cobre', term: 'Carga eléctrica', unit: 'culombio (C)', symbol: 'charges', from: 'awaken',
    text: 'Partículas diminutas que ya están dentro del metal. La fuente no las fabrica: las empuja.' },
  circuito: { world: 'El camino completo', term: 'Circuito cerrado', unit: '', symbol: 'loop', from: 'awaken',
    text: 'Una vuelta sin cortes desde un borne de la fuente hasta el otro, pasando por lo que tiene que funcionar.' },
  corriente: { world: 'Cuántas pasan', term: 'Corriente', unit: 'amperio (A)', symbol: 'arrow', from: 'awaken',
    text: 'Cuánta carga cruza un punto cada segundo. En una vuelta sin ramas es la misma en todas partes: no se gasta.' },
  conductor: { world: 'Cobre y tela', term: 'Conductor y aislante', unit: '', symbol: 'cable', from: 'workshop',
    text: 'En un conductor las cargas se mueven con poco empuje; en un aislante, casi nada. El aire de un corte también aísla.' },
  continuidad: { world: 'La prueba de camino', term: 'Continuidad', unit: '', symbol: 'probe', from: 'workshop',
    text: 'El instrumento empuja un poquito con su propia pila y mira si vuelve. Se hace con la fuente apagada.' },
  polaridad: { world: 'El sentido', term: 'Polaridad', unit: '', symbol: 'polarity', from: 'gate',
    text: 'Cuál borne es + y cuál −. Un imán o un motor responden distinto según por dónde entre la corriente.' },
  resistencia: { world: 'El freno', term: 'Resistencia', unit: 'ohmio (Ω)', symbol: 'resistor', from: 'gate',
    text: 'Cuánto le cuesta a la corriente atravesar algo. Con el mismo empuje, más resistencia deja pasar menos. La unidad lleva el nombre de Georg Ohm, que midió esto en 1827.' },
  tension: { world: 'La fuerza, el empuje', term: 'Tensión', unit: 'voltio (V)', symbol: 'battery', from: 'pump',
    text: 'La diferencia de empuje entre dos puntos. Por eso siempre se mide entre dos lugares, nunca en uno solo.' },
  caida: { world: 'Lo que se pierde en el camino', term: 'Caída de tensión', unit: 'voltio (V)', symbol: 'drop', from: 'pump',
    text: 'La parte del empuje que se queda en un tramo. Sumadas las de una vuelta, dan la tensión de la fuente.' },
  serie: { world: 'En fila', term: 'Serie', unit: '', symbol: 'series', from: 'distribution',
    text: 'Un solo camino: la misma corriente atraviesa todo y el empuje se reparte entre las piezas.' },
  paralelo: { world: 'Cada uno, su camino', term: 'Paralelo', unit: '', symbol: 'parallel', from: 'distribution',
    text: 'Ramas entre los mismos dos puntos: todas reciben el mismo empuje y cada una toma su propia corriente.' },
  potencia: { world: 'Cuánto toma cada uno', term: 'Potencia', unit: 'watt (W)', symbol: 'power', from: 'irrigation',
    text: 'Cuánta energía se transforma por segundo, en calor, luz o movimiento. P = V × I.' },
  perdidas: { world: 'El cable que se calienta', term: 'Pérdidas en el cobre', unit: 'watt (W)', symbol: 'heat', from: 'beacon_supply',
    text: 'Todo lo que frena convierte energía en calor: P = I² × R. Con la mitad de corriente, un cuarto del calor.' },
  ley_ohm: { world: 'Menos freno, más corriente', term: 'Ley de Ohm', unit: 'I = V ÷ R', symbol: 'ohm', from: 'beacon_network',
    text: 'Con el mismo empuje, la corriente depende de cuánto frena cada pieza. El pequeño de bronce jura que no es pariente de Georg Ohm.' },
  nodo: { world: 'Donde se juntan los cables', term: 'Nodo', unit: '', symbol: 'node', from: 'beacon_network',
    text: 'Un punto donde se unen varias ramas. Toda la corriente que entra a un nodo, sale de él.' },
  divisor: { world: 'La toma intermedia', term: 'Divisor de tensión', unit: '', symbol: 'divider', from: 'beacon_lens',
    text: 'Dos resistencias en fila reparten el empuje; la toma del medio entrega una parte. Una carga conectada cambia el reparto.' },
};
export const WORD_ORDER = Object.keys(WORDS);
/** Words are earned on a bench: once it works, its words go into the Bitácora. */
export function wordsKnown(state) {
  const done = id => state?.flags?.[id] || state?.puzzles?.[id]?.completed;
  return WORD_ORDER.filter(key => done(WORDS[key].from));
}

// ── Lo que vio Ohm ───────────────────────────────────────────────────────────────────────
// Three short cards per bench. «spot» names the pieces the board lights up, «tags» the number
// shown on a piece, «words» the glossary entries the card introduces.
const REVEALS = {
  awaken: ({ now }) => ({
    cards: [
      { spot: ['heart'], title: 'Lo que no se ve', words: ['carga'],
        text: 'El cobre está lleno de cargas diminutas que pueden moverse. Estaban ahí también mientras yo dormía: nadie las trae, ya están.' },
      { spot: ['heart'], title: 'Una vuelta entera', words: ['circuito'],
        text: 'Con un solo cable no tenían por dónde dar la vuelta, y la celda no podía moverlas. Con el segundo empezaron a moverse todas a la vez, en toda la vuelta, como la cadena de una bicicleta.' },
      { spot: ['heart'], title: 'No se gastan', words: ['corriente'], tags: { heart: amps(I(now, 'heart')) },
        text: `Vuelven a la celda. Lo que me dejan al pasar es energía: con eso late esto. Por mí cruzan ${amps(I(now, 'heart'))} — amperios: cuánta carga pasa cada segundo. La misma cantidad sale de la celda y vuelve a ella.` },
    ],
    question: 'Si las cargas no se gastan, ¿qué es lo que se le termina a una pila vieja?',
  }),
  workshop: () => ({
    cards: [
      { spot: ['seam1', 'seam2', 'seam3'], title: 'Por fuera, tela', words: ['conductor'],
        text: 'La tela es un aislante: casi no deja moverse a las cargas. Por eso protege la mano de Lumen. Y por eso, por fuera, los tres tramos eran iguales.' },
      { spot: ['seam2'], title: 'Por dentro, cobre', tags: { seam2: 'corte' },
        text: 'Adentro va cobre, un conductor. En el tramo 2 estaba cortado: entre las dos puntas quedaba aire, y el aire también aísla. Ninguna lámpara nueva podía arreglar eso.' },
      { spot: ['lamp'], title: 'Por qué apagar la mesa', words: ['continuidad'],
        text: 'Mi prueba de camino empuja apenas, con su propia pila, y mira si el empuje vuelve. Con la mesa encendida se mezclarían los dos empujes y la lectura no querría decir nada.' },
    ],
    question: 'Lumen apaga la mesa antes de meter la mano. ¿Tu cuerpo será conductor o aislante?',
  }),
  gate: ({ id, now, state }) => {
    const brake = state.values.brake, hard = variant(id, state, s => { s.values.brake = 0; });
    return {
      cards: [
        { spot: ['latch'], title: 'Un imán a pedido', words: ['polaridad'],
          text: 'La bobina es cobre enrollado. Mientras la corriente la recorre, se vuelve un imán; si la recorre al revés, el imán se invierte. El pestillo también es un imán: un sentido lo empuja, el otro lo atrae.' },
        { spot: ['latch'], title: 'Sentido no es fuerza',
          text: 'Por eso dar vuelta los cables cambió hacia dónde empujaba, no cuánto. La misma corriente, en sentido contrario.' },
        { spot: ['trim', 'latch'], title: 'El freno', words: ['resistencia'], tags: { latch: amps(I(now, 'latch')) },
          text: `El freno es una resistencia: un tramo que cuesta atravesar. En cero pasaban ${amps(I(hard, 'latch'))} y el cerrojo golpeaba. Con ${brake} Ω pasan ${amps(I(now, 'latch'))}: firme. En el Instituto se mide en ohmios, Ω. Sí, como yo. No lo elegí.` },
      ],
      question: 'La bobina también frena un poco. Si duplicaras el freno, ¿pasaría exactamente la mitad de corriente?',
    };
  },
  pump: ({ now, before }) => {
    const parts = ['joint1', 'joint2', 'joint3', 'pump'], sum = parts.reduce((t, k) => t + V(before, k), 0);
    return {
      cards: [
        { spot: ['pump'], title: 'El empuje', words: ['tension'],
          text: `La rueda y el generador dan un empuje de ${volts(PUZZLES.pump.voltage)} entre «Fuente +» y «Retorno −». A esa diferencia de empuje entre dos puntos se la llama tensión, y se mide en voltios.` },
        { spot: ['joint2', 'pump'], title: 'Se reparte en la vuelta', words: ['caida'], tags: { joint2: `antes ${volts(V(before, 'joint2'))}`, pump: `antes ${volts(V(before, 'pump'))}` },
          text: `El empuje se reparte entre todo lo que hay en la vuelta. El empalme 2 se quedaba con ${volts(V(before, 'joint2'))} y a la bomba le llegaban ${volts(V(before, 'pump'))}. Lo que se queda un empalme se vuelve calor: por eso estaba tibio.` },
        { spot: ['pump'], title: 'Conducir no es entregar', tags: { pump: volts(V(now, 'pump')) },
          text: `Ese empalme conducía: la prueba de camino habría dicho que sí. Pero costaba atravesarlo, y sólo se nota con la bomba trabajando. Sumá lo que se quedaban los tres empalmes y la bomba: ${volts(sum)}, casi los ${volts(PUZZLES.pump.voltage)} de la fuente; el resto se queda en los cables. Ahora la bomba recibe ${volts(V(now, 'pump'))}.` },
      ],
      question: '¿Por qué la suma de lo que se queda cada parte da justo lo que empuja la fuente?',
    };
  },
  distribution: ({ now, before }) => ({
    cards: [
      { spot: ['clinic', 'kitchen'], title: 'En fila', words: ['serie'], tags: { clinic: `antes ${volts(V(before, 'clinic'))}`, kitchen: `antes ${volts(V(before, 'kitchen'))}` },
        text: `Antes las dos luces estaban en fila: las mismas cargas atravesaban la enfermería y después la cocina. Brillaban igual de poco: la corriente no se gasta en la primera. Lo que se repartían era el empuje: ${volts(V(before, 'clinic'))} para cada una.` },
      { spot: ['clinic', 'kitchen'], title: 'Cada una, su camino', words: ['paralelo'], tags: { clinic: volts(V(now, 'clinic')), kitchen: volts(V(now, 'kitchen')) },
        text: `Ahora cada luz va de «Fuente +» a «Retorno −» por su cuenta, y las dos reciben el empuje entero: ${volts(V(now, 'clinic'))}. Edda apostó que la enfermería brillaría menos. Brilla más.` },
      { spot: ['clinic', 'kitchen'], title: 'Lo de más, de dónde sale',
        text: `De la fuente: antes entregaba ${amps(before.current)}, ahora ${amps(now.current)}, la suma de las dos ramas. Y como cada rama es independiente, Ivara pudo aislar la cocina sin apagar la enfermería.` },
    ],
    question: 'En una casa, ¿las lámparas estarán en serie o en paralelo? ¿Qué pasaría si se quemara una?',
  }),
  irrigation: ({ now, before, state }) => {
    const deal = terracesAgreement(state);
    return {
      cards: [
        { spot: ['roots', 'flow', 'forge'], title: 'Un cable para tres',
          text: `Las tres ramas toman del mismo cable de la ladera, y ese cable lleva la suma. Al empezar pedían ${amps(before.requestedCurrent)}, más de los 2,2 A que aguanta. Ahora, ${amps(now.requestedCurrent)}.` },
        { spot: ['roots', 'flow', 'forge'], title: 'Cuánto toma cada uno', words: ['potencia'], tags: { roots: watts(P(now, 'roots')), flow: watts(P(now, 'flow')), forge: watts(P(now, 'forge')) },
          text: `Lo que toma cada rama se llama potencia: empuje por corriente, P = V × I, en watts. El horno se lleva ${watts(P(now, 'forge'))}, las raíces ${watts(P(now, 'roots'))} y el riego ${watts(P(now, 'flow'))}.` },
        { spot: ['forge'], title: 'Frenar no le roba al vecino',
          text: `Frenar el horno no les quitó empuje a las raíces: cada rama sigue colgada de los mismos ${volts(PUZZLES.irrigation.voltage)}. Lo que bajó fue la suma en el cable compartido. ${deal === 'forja' ? 'El acuerdo: Yesca a pleno, y el agua y el calor, justos.' : 'El acuerdo: el agua primero, y Yesca, más despacio.'}` },
      ],
      question: 'Yesca forja con menos calor, pero más tandas. Al final del día, ¿transforma menos energía o la misma?',
    };
  },
  beacon_supply: ({ id, now, state }) => {
    const single = variant(id, state, s => { s.wires = s.wires.filter(w => !touches(w, 'lineBa', 'lineBb')); });
    return {
      cards: [
        { spot: ['lineA'], title: 'El cobre también frena', words: ['perdidas'],
          text: `Un tendido largo tiene resistencia: 6 Ω. Y todo lo que frena convierte energía en calor. Con un solo tendido y el regulador como lo dejaste, pasarían ${amps(I(single, 'lineA'))} por el norte: ${watts(P(single, 'lineA'))} de calor, más de los 5,2 W que soporta.` },
        { spot: ['lineA', 'lineB'], title: 'Dos caminos, lado a lado', tags: { lineA: amps(I(now, 'lineA')), lineB: amps(I(now, 'lineB')) },
          text: `Con el sur sumado, la corriente se reparte: ${amps(I(now, 'lineA'))} por cada uno.` },
        { spot: ['lineA', 'lineB'], title: 'La mitad de corriente, un cuarto del calor', tags: { lineA: watts(P(now, 'lineA')), lineB: watts(P(now, 'lineB')) },
          text: `Cada tendido se calienta ahora con ${watts(P(now, 'lineA'))}. El calor crece con la corriente al cuadrado: P = I² × R. Por eso las líneas que alimentan una ciudad son gruesas o van de a varias.` },
      ],
      question: 'Si pusieras tres tendidos lado a lado, ¿cuánto calor tendría cada uno?',
    };
  },
  beacon_network: ({ now, before }) => ({
    cards: [
      { spot: ['optic', 'bearing', 'signal'], title: 'El mismo empuje para las tres', tags: { optic: volts(V(now, 'optic')), bearing: volts(V(now, 'bearing')), signal: volts(V(now, 'signal')) },
        text: `Cada voz va de «Fuente +» a «Retorno −» por su cuenta: las tres reciben ${volts(V(now, 'optic'))}. Antes, en fila, la señal se quedaba con ${volts(V(before, 'signal'))} y a la óptica le llegaban ${volts(V(before, 'optic'))}.` },
      { spot: ['optic', 'bearing', 'signal'], title: 'Pero no toman lo mismo', words: ['ley_ohm'], tags: { optic: amps(I(now, 'optic')), bearing: amps(I(now, 'bearing')), signal: amps(I(now, 'signal')) },
        text: `Óptica, 18 Ω: ${amps(I(now, 'optic'))}. Giro, 36 Ω: ${amps(I(now, 'bearing'))}. Señal, 72 Ω: ${amps(I(now, 'signal'))}. El doble de freno, la mitad de corriente. Eso es la ley de Ohm: I = V ÷ R. Sí: como yo.` },
      { spot: ['optic', 'bearing', 'signal'], title: 'La suma', words: ['nodo'],
        text: `La fuente entrega la suma: ${amps(now.current)}. Todo lo que entra a un punto donde se juntan los cables, sale de él. Y si una voz se apaga, las otras siguen con su empuje.` },
    ],
    question: 'Si sumaras una cuarta voz de 18 Ω, ¿cuánta corriente le pedirías a la fuente?',
  }),
  beacon_lens: ({ id, now, state }) => {
    const first = PUZZLES[id].knobs[0].initial;
    const unloaded = variant(id, state, s => { s.values.upper = first; s.wires = s.wires.filter(w => !touches(w, 'lensIn')); });
    const loaded = variant(id, state, s => { s.values.upper = first; });
    return {
      cards: [
        { spot: ['upper', 'lower'], title: 'Un empuje repartido en dos', words: ['divisor'],
          text: `Los dos brazos del divisor están en fila y se reparten los ${volts(PUZZLES[id].voltage)}. Con los brazos iguales y nada conectado, la toma queda en la mitad: ${volts(V(unloaded, 'lower'))}.` },
        { spot: ['lens', 'lower'], title: 'La carga cambia el reparto', tags: { lower: `con lente ${volts(V(loaded, 'lower'))}` },
          text: `Al conectar la lente, ella y el brazo inferior quedan lado a lado: juntos frenan menos y se quedan con menos empuje. Con el ajuste de antes, la toma bajó a ${volts(V(loaded, 'lower'))}. Calibrar en vacío no alcanzaba.` },
        { spot: ['upper', 'lens'], title: 'Calibrar con la lente puesta', tags: { lens: volts(V(now, 'lens')) },
          text: `Con el brazo superior en ${state.values.upper} Ω, la lente recibe ${volts(V(now, 'lens'))}: luz dorada. Lo que dejó escrito Nereo sirve para revisar: si la toma cambia, algo cambió en la red.` },
      ],
      question: 'Si mañana alguien pone una lente más grande, que frena menos, ¿la toma subirá o bajará?',
    };
  },
};

/** The cards for a bench, computed from the player's own montage. Null when it does not work yet. */
export function revealFor(id, state) {
  const make = REVEALS[id], p = PUZZLES[id];
  if (!make || !p || !state?.wires) return null;
  const now = evaluatePuzzle(id, live(state));
  if (!now.solved) return null;
  return make({ id, state, now, before: evaluatePuzzle(id, initialPuzzleSnapshot(id)) });
}

// ── Apuestas ─────────────────────────────────────────────────────────────────────────────
// Predict, then look (White & Gunstone). Whoever is at the bench asks before anything is touched; the bench settles the
// bet when the physics shows the answer. Nothing is blocked by a wrong guess: it is the point.
export const PREDICTIONS = {
  workshop: {
    who: 'LUMEN', ask: 'Antes de medir: ¿cuál de los tres tramos está cortado?',
    options: [{ id: 't1', text: 'El tramo 1' }, { id: 't2', text: 'El tramo 2' }, { id: 't3', text: 'El tramo 3' }, { id: 'look', text: 'Mirando no se puede saber' }],
    answer: 'look', settled: (r, s) => !!s.proofs?.foundBreak,
    outcome: 'El instrumento encontró el corte en el tramo 2. Por fuera, los tres eran iguales.',
    said: { look: 'Así fue: por fuera eran iguales. Hizo falta preguntarle al cobre.', t2: 'Era el 2. Pero por fuera eran iguales: fue suerte hasta que el instrumento lo confirmó.', other: 'Era el 2. Por fuera no había forma de saberlo: por eso medimos.' },
  },
  gate: {
    who: 'EDDA', ask: 'Si das vuelta los dos cables de la bobina, ¿qué hace el cerrojo?',
    options: [{ id: 'flip', text: 'Empuja hacia el otro lado' }, { id: 'same', text: 'Sigue empujando hacia atrás' }, { id: 'stop', text: 'Se queda quieto' }, { id: 'more', text: 'Empuja con más fuerza' }],
    answer: 'flip', settled: r => r.solution.valid && (r.solution.branches.latch?.current ?? 0) > .05 && !r.overloaded,
    outcome: 'Empujó hacia el otro lado, con la misma fuerza.',
    said: { flip: 'Lo dijiste: el sentido de la corriente decidió el sentido del empuje.', other: 'Pasó otra cosa: empujó hacia el otro lado, con la misma fuerza. Sentido y fuerza son dos perillas distintas.' },
  },
  pump: {
    who: 'VEGA', ask: 'Los tres empalmes dejan pasar. Con la bomba andando, ¿dónde va a haber diferencia entre A y B?',
    options: [{ id: 'warm', text: 'Sólo en el empalme malo' }, { id: 'all', text: 'Un poco en todos, igual' }, { id: 'none', text: 'En ninguno: si deja pasar, no pierde' }],
    answer: 'warm', settled: (r, s) => !!s.proofs?.foundLoss,
    outcome: 'Los empalmes sanos apenas se notaban; el 2 se quedaba con casi todo el empuje.',
    said: { warm: 'Así fue: el empalme 2 se quedaba con casi todo.', none: 'Era tentador: si deja pasar, ¿qué va a perder? Pero el 2 se quedaba con casi todo el empuje.', other: 'Los sanos apenas se notaban; el 2 se quedaba con casi todo.' },
  },
  distribution: {
    who: 'EDDA', ask: 'Yo ya aposté: si cada luz tiene su propio camino, la enfermería va a brillar menos. ¿Y vos?',
    noted: 'Edda apostó que, con caminos propios, la enfermería brillaría menos. ¿Y yo?',
    options: [{ id: 'less', text: 'Menos: se reparten la luz' }, { id: 'same', text: 'Igual que ahora' }, { id: 'more', text: 'Más fuerte' }],
    answer: 'more', settled: r => !!r.operating.clinic && !!r.operating.kitchen,
    outcome: 'Las dos brillan más fuerte: cada una recibe ahora el empuje entero.',
    said: { more: 'Me ganaste la apuesta: cada luz recibe ahora el empuje entero.', less: 'Apostamos lo mismo, y pasó lo contrario: brilla más. Antes cada luz recibía la mitad del empuje.', other: 'Brilla más: antes cada luz recibía la mitad del empuje. Perdimos los dos.' },
  },
  irrigation: {
    who: 'VEGA', ask: 'Si frenás el horno, ¿qué les pasa a las raíces?',
    options: [{ id: 'none', text: 'Nada: siguen igual' }, { id: 'warmer', text: 'Se calientan más: les queda más' }, { id: 'colder', text: 'Se enfrían también' }],
    answer: 'none', settled: (r, s) => s.values.forge !== PUZZLES.irrigation.knobs.find(k => k.key === 'forge').initial,
    outcome: 'Frenaste el horno y las raíces siguieron igual. Lo que bajó fue la corriente del cable compartido.',
    said: { none: 'Así fue: cada rama tiene el mismo empuje. Frenar el horno sólo alivia el cable compartido.', warmer: 'Parecía lógico: lo que suelta uno, ¿no lo toma otro? Acá no: las raíces siguen igual. Lo que baja es la suma en el cable.', other: 'Las raíces no se enteraron: cada rama recibe el mismo empuje.' },
  },
  beacon_supply: {
    who: 'NEREO', ask: 'Si sumás el tendido sur al lado del norte, ¿cuánto se calienta el norte?',
    options: [{ id: 'same', text: 'Igual que ahora' }, { id: 'half', text: 'La mitad' }, { id: 'less', text: 'Mucho menos que la mitad' }, { id: 'more', text: 'Más' }],
    answer: 'less', settled: r => (Math.abs(r.solution.branches.lineB?.current ?? 0)) > .1 && !r.overloaded,
    outcome: 'Con la corriente repartida, cada tendido se calienta un cuarto de lo que se calentaba uno solo.',
    said: { less: 'Así: la mitad de corriente da un cuarto del calor.', half: 'Casi: la corriente se reparte a la mitad, pero el calor baja a un cuarto. Crece con la corriente al cuadrado.', other: 'Bajó mucho: con la corriente repartida, cada tendido se calienta un cuarto.' },
  },
  beacon_network: {
    who: 'EDDA', ask: 'Cuando cada voz tenga su propio camino, ¿cuál va a tomar más corriente?',
    options: [{ id: 'optic', text: 'La óptica · 18 Ω' }, { id: 'signal', text: 'La señal · 72 Ω' }, { id: 'same', text: 'Las tres lo mismo' }],
    answer: 'optic', settled: r => ['optic', 'bearing', 'signal'].every(k => r.operating[k]),
    outcome: 'La óptica, la que menos frena, toma más: el doble que el giro y cuatro veces lo de la señal.',
    said: { optic: 'Así: con el mismo empuje, la que menos frena deja pasar más.', signal: 'Al revés: la señal, con más freno, toma la menor. Menos freno, más corriente.', other: 'Reciben el mismo empuje, pero no la misma corriente: depende de cuánto frena cada una.' },
  },
  beacon_lens: {
    who: 'EDDA', ask: 'Cuando conectes la lente a la toma, la tensión de la toma…',
    options: [{ id: 'down', text: 'Baja' }, { id: 'up', text: 'Sube' }, { id: 'same', text: 'Queda igual' }],
    answer: 'down', settled: (r, s) => !!s.proofs?.tapUnloaded && !!s.proofs?.tapLoaded,
    outcome: 'Con la lente conectada, la toma bajó.',
    said: { down: 'Bajó, como dijiste: la lente le hace compañía al brazo inferior y juntos frenan menos.', other: 'Bajó: con la lente al lado, el brazo inferior tiene compañía y juntos frenan menos.' },
  },
};

/** The question as the player writes it down in the Bitácora. */
export function betQuestion(id) { return PREDICTIONS[id]?.noted ?? PREDICTIONS[id]?.ask ?? ''; }
export function betChoiceText(id, choice) { return PREDICTIONS[id]?.options.find(o => o.id === choice)?.text ?? ''; }
/** What the one who asked says once the bench showed the answer. */
export function betVerdict(id, choice) {
  const p = PREDICTIONS[id];
  if (!p) return '';
  return p.said[choice] ?? p.said.other;
}
