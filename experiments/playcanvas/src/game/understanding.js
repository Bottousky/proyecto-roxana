import { PUZZLES, evaluatePuzzle, initialPuzzleSnapshot, terracesAgreement, weighedStones, ringWords, stoneIn, RIDDLE_STONE } from './puzzle-model.js';

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
  anillos: { world: 'Los anillos de las piedras', term: 'Código de colores · tolerancia', unit: '±5 %', symbol: 'rings', from: 'gate',
    text: 'Los anillos escriben un número: dos cifras y cuántos ceros les siguen. El último, dorado, dice cuánto puede correrse la piedra de lo escrito: un 5 %, para arriba o para abajo.' },
  tension: { world: 'La fuerza, el empuje', term: 'Tensión', unit: 'voltio (V)', symbol: 'battery', from: 'pump',
    text: 'La diferencia de empuje entre dos puntos. Por eso siempre se mide entre dos lugares, nunca en uno solo.' },
  caida: { world: 'Lo que se pierde en el camino', term: 'Caída de tensión', unit: 'voltio (V)', symbol: 'drop', from: 'pump',
    text: 'La parte del empuje que se queda en un tramo. Sumadas las de una vuelta, dan la tensión de la fuente.' },
  cuenta_vuelta: { world: 'La cuenta de la vuelta', term: 'Ley de las mallas (Kirchhoff)', unit: '', symbol: 'loopsum', from: 'pump',
    text: 'En una vuelta cerrada, lo que empuja la fuente es lo que se quedan, sumadas, todas las partes. Ningún voltio se pierde.' },
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
    text: 'Un punto donde se unen varias ramas: ahí la corriente se reparte o se vuelve a juntar.' },
  regla_nudos: { world: 'La regla de los nudos', term: 'Ley de los nodos (Kirchhoff)', unit: '', symbol: 'nodesum', from: 'beacon_network',
    text: 'Toda la corriente que llega a un nudo sale de él: lo que entrega la fuente es la suma de lo que toman las ramas.' },
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
          text: 'La bobina es cobre enrollado: mientras la corriente la recorre, es un imán. El pestillo también es un imán. Por eso dar vuelta los cables cambió hacia dónde empujaba, no cuánto: la misma corriente, en sentido contrario.' },
        { spot: ['trim', 'latch'], title: 'El freno', words: ['resistencia'], tags: { latch: amps(I(now, 'latch')) },
          text: `Una piedra de freno es una resistencia: un tramo que cuesta atravesar. Con el puente de cobre pasaban ${amps(I(hard, 'latch'))} y el cerrojo golpeaba. Con la piedra de ${brake} Ω pasan ${amps(I(now, 'latch'))}: firme. En el Instituto se mide en ohmios, Ω. Sí, como yo. No lo elegí.` },
        { spot: ['trim'], title: 'Lo que dicen los anillos', words: ['anillos'],
          text: brake === 10 ? 'Marrón, negro, negro: 1, 0 y ningún cero. Diez ohmios. La abuela de Edda leía «temperamento»; los anillos escriben un número, con dos cifras y cuántos ceros les siguen. El dorado avisa que la piedra puede correrse un poco.' : `Los anillos de esta piedra escriben ${brake} Ω: dos cifras y cuántos ceros les siguen. El dorado avisa que la piedra puede correrse un poco.` },
      ],
      question: 'La piedra roja, roja, negra frena 22 Ω. ¿Cuánto frenaría una roja, roja, marrón?',
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
        { spot: ['pump'], title: 'Conducir no es entregar', words: ['cuenta_vuelta'], tags: { pump: volts(V(now, 'pump')) },
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
        text: `Ahora cada luz va de «Fuente +» a «Retorno −» por su cuenta, y las dos reciben el empuje entero: ${volts(V(now, 'clinic'))}. El Consejo decía que la Luz es una sola y se reparte; acá cada camino tiene la suya.` },
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
      { spot: ['optic', 'bearing', 'signal'], title: 'La suma', words: ['nodo', 'regla_nudos'],
        text: `La fuente entrega la suma: ${amps(now.current)}. Todo lo que entra a un punto donde se juntan los cables, sale de él. Y si una voz se apaga, las otras siguen con su empuje.` },
    ],
    question: 'Si sumaras una cuarta voz de 18 Ω, ¿cuánta corriente le pedirías a la fuente?',
  }),
  drawer: ({ id, state }) => {
    const k = PUZZLES[id].knobs[0], weighed = weighedStones(state).filter(v => v !== RIDDLE_STONE), off = v => (stoneIn(k, v).actual - v) / v * 100;
    const worst = weighed.reduce((a, v) => (Math.abs(off(v)) > Math.abs(off(a)) ? v : a), weighed[0] ?? 10);
    return {
      cards: [
        { spot: ['tray'], title: 'Un número escrito en colores', words: ['anillos'],
          text: 'Los dos primeros anillos son cifras; el tercero, cuántos ceros siguen. Rojo, rojo, marrón: 2, 2 y un cero. 220. Igual que escribimos los números todos los días, sólo que con pintura.' },
        { spot: ['tray'], title: 'La dorada miente un poco',
          text: `La piedra de anillos ${ringWords(worst)} dice ${worst} Ω y pesó ${num(stoneIn(k, worst).actual, 1)}: se corrió un ${num(Math.abs(off(worst)), 1)} %. El anillo dorado promete que nunca se corre más de un 5 %. No traiciona: avisa.` },
        { spot: ['lamp'], title: 'Por qué Lumen las elegía por temperamento',
          text: 'Con más freno, la lámpara de prueba brilla menos. El temperamento que Lumen leía en cada piedra era ese número. Sus muescas también sirven: él no distingue el rojo del verde, y las reconoce igual.' },
      ],
      question: 'Una piedra amarilla, violeta, rojo. ¿Cuánto frena?',
    };
  },
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
          text: `Con la piedra de ${state.values.upper} Ω en el brazo superior, la lente recibe ${volts(V(now, 'lens'))}: luz dorada. Su anillo dorado dice que puede correrse un 5 %; aun así, la luz queda dorada. Para eso alcanza con que una piedra mienta poco: no hace falta que no mienta nada.` },
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

// ── Conjuros ─────────────────────────────────────────────────────────────────────────────
// The sabios of Ohmdal are heirs to a craft they no longer understand: what the Maestros left them
// survived as words and gestures, said over the copper like spells. They distrust what can be counted
// («la Luz no se deja contar»). Each bench opens with the formula its keeper inherited, and the copper
// puts it to the test: every conjuro carries one of the classic wrong ideas about circuits, so the
// moment it fails is the moment the real cause shows. Nobody is mocked; the rite can stay, as a custom.
export const CONJUROS = {
  workshop: { who: 'LUMEN', heir: 'que Lumen heredó de su padre',
    words: 'Paño seco, tres vueltas al contacto, lámpara nueva: la Luz vuelve a quien la atiende.',
    settled: (r, s) => !!s.proofs?.foundBreak,
    copper: 'Ninguna vuelta llega adentro de la tela. El cobre estaba cortado ahí, y la lámpara era la misma.' },
  gate: { who: 'EDDA', heir: 'de los guardianes de la Calzada',
    words: 'La Puerta cede a quien le da toda la Luz. Por eso alguien le tendió ese puente.',
    settled: r => !!r.operating.latch,
    copper: 'Con toda la Luz, el cerrojo golpeaba hacia el lado equivocado. El sentido lo dieron los cables; la fuerza justa, una piedra de freno.' },
  pump: { who: 'VEGA', heir: 'de las operadoras del acueducto',
    words: 'Por donde pasa el agua, pasa la Luz. Unión que deja pasar, no roba.',
    settled: (r, s) => !!s.proofs?.foundLoss,
    copper: 'El empalme 2 dejaba pasar, y aun así se quedaba con casi todo el empuje mientras la bomba trabajaba.' },
  distribution: { who: 'IVARA', heir: 'del Consejo de la Red',
    words: 'La Luz es una sola: lo que se le da a una casa, se le quita a otra.',
    settled: r => !!r.operating.clinic && !!r.operating.kitchen,
    copper: 'Con un camino cada una, las dos luces brillan más que antes. Cada camino recibe el empuje entero.' },
  irrigation: { who: 'YESCA', heir: 'de las forjas de la ladera',
    words: 'La ladera da una sola Luz: el fuego que yo suelto, se lo bebe el agua.',
    settled: (r, s) => s.values.forge !== PUZZLES.irrigation.knobs.find(k => k.key === 'forge').initial,
    copper: 'Con el horno frenado, las raíces siguieron igual. Lo que bajó fue lo que carga el cable compartido.' },
  beacon_supply: { who: 'NEREO', heir: 'de los fareros',
    words: 'Cobre que se queja, cobre que descansa: un tendido por vez.',
    settled: r => Math.abs(r.solution.branches.lineB?.current ?? 0) > .1 && !r.overloaded,
    copper: 'Los dos tendidos juntos se reparten la corriente, y cada uno se calienta un cuarto de lo que se calentaba solo.' },
  beacon_network: { who: 'NEREO', heir: 'de los fareros',
    words: 'Las voces del Faro cantan en fila: la primera da el tono y las demás la siguen.',
    settled: r => ['optic', 'bearing', 'signal'].every(k => r.operating[k]),
    copper: 'En fila, ninguna voz recibía lo que necesitaba. Con su propio camino, cada una toma lo que su freno le deja: la óptica, cuatro veces lo de la señal.' },
  drawer: { who: 'LUMEN', heir: 'del cajón de Lumen',
    words: 'Rojo con rojo, freno de buey; la dorada miente, pero no traiciona.',
    settled: (r, s) => weighedStones(s).some(v => v === 22 || v === RIDDLE_STONE),
    copper: 'El freno de buey era un número: rojo es 2, y rojo con rojo, 22. Y la dorada mintió, poquito: ninguna piedra se corrió más de un 5 %.' },
  beacon_lens: { who: 'NEREO', heir: 'de los fareros',
    words: 'La lente se templa una sola vez, a oscuras, antes de abrirle el ojo al lago.',
    settled: (r, s) => !!s.proofs?.tapUnloaded && !!s.proofs?.tapLoaded,
    copper: 'Templada a oscuras no alcanzaba: al conectar la lente, la toma bajó. Hay que templarla con la lente puesta.' },
};

// ── El libro del farero: marcas esperadas ───────────────────────────────────────────────
// Proportional reasoning, asked for by someone who needs it: before measuring, Nereo writes in the
// keepers' book the mark the next keeper should expect. No sums: a fraction of the push, a ratio of
// currents. The measurement answers, and the book keeps both, right or wrong.
const fraction = n => ({ 0: 'casi nada', .25: 'un cuarto', .5: 'la mitad', .75: 'tres cuartos', 1: 'todo' })[n];
const nearestFraction = x => [0, .25, .5, .75, 1].reduce((a, b) => Math.abs(b - x) < Math.abs(a - x) ? b : a);
export const ESTIMATES = {
  beacon_network: { who: 'NEREO', book: 'Libro del farero',
    ask: 'Para el libro del farero: la óptica frena 18 Ω y la señal 72 Ω, cuatro veces más. Cuando cada una tenga su propio camino, ¿cuánta corriente va a tomar la óptica, comparada con la señal?',
    noted: 'La óptica frena 18 Ω; la señal, 72 Ω. Con caminos propios, ¿cuánta corriente toma la óptica, comparada con la señal?',
    options: [{ id: 'same', text: 'La misma', value: 1 }, { id: 'double', text: 'El doble', value: 2 }, { id: 'four', text: 'Cuatro veces más', value: 4 }, { id: 'quarter', text: 'Un cuarto', value: .25 }],
    // The ratio of the two currents, once both voices have their own path.
    measured: r => r.operating.optic && r.operating.signal ? Math.abs(r.solution.branches.optic.current) / Math.abs(r.solution.branches.signal.current) : null,
    close: (value, x) => Math.abs(x - value) / value < .15,
    reading: x => `la óptica tomó ${num(x, 1)} veces lo de la señal`,
    why: 'Un cuarto del freno, cuatro veces la corriente.' },
  drawer: { who: 'LUMEN', book: 'El acertijo de Lumen',
    ask: 'Esta no se pesa hasta que me digas cuánto frena. Rojo, rojo, marrón. ¿Cuánto?',
    noted: 'La piedra roja, roja, marrón: ¿cuánto frena?',
    options: [{ id: 'veintidos', text: '22 Ω', value: 22 }, { id: 'doscientos', text: '220 Ω', value: 220 }, { id: 'dosmil', text: '2200 Ω', value: 2200 }],
    // Lumen asks only once the riddle stone is in the socket, and does not let it be weighed without an answer.
    when: s => s.values?.tray === RIDDLE_STONE && !weighedStones(s).includes(RIDDLE_STONE), required: true,
    measured: (r, s) => (weighedStones(s).includes(RIDDLE_STONE) ? stoneIn(PUZZLES.drawer.knobs[0], RIDDLE_STONE).actual : null),
    close: (value, x) => Math.abs(x - value) / value < .06,
    reading: x => `pesó ${num(x, 0)} Ω`,
    why: 'Rojo, rojo: 2 y 2. Marrón: un cero.',
    yours: true, right: 'Lumen se ríe: «Y yo que la elegía por el peso en la mano».', wrong: 'Lumen la guarda igual: «Me pasó lo mismo con mi padre».' },
  beacon_lens: { who: 'NEREO', book: 'Libro del farero',
    ask: 'Para el libro del farero, antes de medir: los dos brazos del divisor frenan lo mismo. Sin la lente, ¿qué parte de los 18 V debería marcar la toma?',
    noted: 'Los dos brazos del divisor frenan lo mismo. Sin la lente, ¿qué parte de los 18 V marca la toma?',
    options: [{ id: 'none', text: 'Casi nada', value: 0 }, { id: 'quarter', text: 'Un cuarto', value: .25 }, { id: 'half', text: 'La mitad', value: .5 }, { id: 'three', text: 'Tres cuartos', value: .75 }, { id: 'all', text: 'Todo', value: 1 }],
    // The share of the source read at the tap, the first time it is measured without the lens.
    measured: (r, s, readings) => readings?.tapUnloaded ? readings.tapUnloaded.volts / PUZZLES.beacon_lens.voltage : null,
    close: (value, x) => Math.abs(x - value) < .08,
    reading: x => `marcó ${volts(x * PUZZLES.beacon_lens.voltage)} de 18 V: ${fraction(nearestFraction(x))}`,
    why: 'Dos brazos iguales en fila se reparten el empuje por mitades.' },
};
export function estimateChoiceText(id, choice) { return ESTIMATES[id]?.options.find(o => o.id === choice)?.text ?? ''; }
/** What Nereo writes once the instrument answered the expected mark. */
export function estimateVerdict(id, choice, measured) {
  const e = ESTIMATES[id], option = e?.options.find(o => o.id === choice);
  if (!option || !Number.isFinite(measured)) return '';
  const said = option.text[0].toLowerCase() + option.text.slice(1);
  const [hit, miss] = e.yours ? ['Acertaste: dijiste', 'Dijiste'] : ['Anotado: esperábamos', 'Esperábamos'];
  return e.close(option.value, measured)
    ? `${hit} «${said}» y ${e.reading(measured)}. ${e.why} ${e.right ?? 'El próximo farero va a poder confiar en esa marca.'}`
    : `${miss} «${said}»; ${e.reading(measured)}. ${e.why} ${e.wrong ?? 'Lo anoto igual: que el próximo farero sepa que también nos equivocamos.'}`;
}
