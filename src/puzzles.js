import { measureVoltage, measureResistance } from './electrical.js';
import { PUZZLES, initialPuzzleSnapshot, normalizePuzzleSnapshot, puzzleNetwork, evaluatePuzzle, wireNodes, wireRole, wireFlow, isSealed, cablesInHand, canJoin, isPolarized, montageSignature, tallyReading, tallyCloses, knobChoices, stoneIn, stoneRings, ringWords, weighedStones, RIDDLE_STONE, RING_HEX, RING_MARKS } from './puzzle-model.js';
import { appendBenchEvidence, getBenchEvidence } from './bench-evidence.js';
import { diagnoseBench } from './bench-diagnosis.js';
import { CONJUROS, ESTIMATES, estimateChoiceText, estimateVerdict, revealFor, WORDS } from './understanding.js';
export { PUZZLES, initialPuzzleSnapshot, normalizePuzzleSnapshot, puzzleNetwork, evaluatePuzzle, getBenchEvidence };
import './puzzles.css';

// One goal per bench, said in a line. Each item of the brief comes with what can be touched to
// reach it («how»), and the instrument it needs, if any. Hints go one step further when asked.
// A bench offers a single instrument: the one its story asks for.
// Who speaks at a bench wears their own portrait in the dock.
const SAY_FACES = { OHM: 'ohm', EDDA: 'edda', LUMEN: 'lumen', VEGA: 'vega', IVARA: 'consejera', YESCA: 'yesca', NEREO: 'nereo', TALA: 'tala', MARIN: 'marin', 'MARÍN': 'marin' };
export const BENCH_GUIDANCE = {
  awaken: { goal: 'Despertá al pequeño de bronce.', learned: 'Hizo falta una vuelta completa: salir de la celda, atravesar al pequeño y volver a ella. Con una sola conexión, nada se movía.', pulseLoose: true,
    // A first player found the old wording gave the answer away (ciclo 30): the step invites a try;
    // the way back is what the hints are for.
    steps: [{ how: 'Tenés un cable: se tiende tocando dos bornes redondos. Probá dónde ponerlo y mirá qué hace el pequeño.' }],
    tools: [], voice: 'EDDA', hints: ['Ese cable sale de la celda y llega al pequeño. ¿Y después? Para volver a la celda hace falta otro camino.', 'Tiene dos piezas redondas de cada lado: una ya está ocupada. La otra quedó sola.', 'Si unís las dos piezas de la celda entre sí, se oye un clic: el camino no pasa por él. No se rompe nada.', 'Un paso para probar: tocá «Bronce −» y después «Celda −»: ese es el camino de vuelta.'] },
  workshop: { goal: 'Encontrá el tramo cortado y puentealo con tu cable.', learned: 'Por fuera los tramos se ven iguales: la prueba de camino encuentra el corte que el ojo no ve.',
    steps: [{ how: 'Por fuera, los tres tramos son iguales. ¿Cuál no deja pasar? “Comprobar el camino” se lo puede preguntar al cobre.', tool: 'continuity' }, { how: 'Ya sabés dónde falta camino. ¿Cómo se lo devolvés con un solo cable?', tool: 'wire' }],
    tools: ['continuity'], voice: 'OHM', hints: ['Por fuera los tres tramos son iguales. Mirarlos no alcanza: hay que preguntarle al cobre con “Comprobar el camino”.', 'Probá un tramo por vez: tomá “Comprobar el camino” y apoyá las puntas en sus dos extremos, A y B. Dos van a tener camino; uno, no.', 'El tramo que diga “Sin camino” es el cortado. Tu único cable puede unir sus dos extremos por fuera.', 'Un paso para probar: elegí “Comprobar el camino” y apoyá las puntas en los extremos de cada tramo. Donde diga “Sin camino”, volvé a “Cables” y tendé tu cable entre esos dos extremos.'] },
  gate: { goal: 'Que el cerrojo avance → con fuerza firme.', learned: 'El sentido de la corriente decide hacia dónde empuja el cerrojo; el freno decide con cuánta fuerza.',
    steps: [{ how: 'El cerrojo empuja, pero para el lado equivocado. ¿Qué decide hacia dónde: la piedra del zócalo o por dónde entra la corriente a la bobina?', tool: 'wire' }, { how: 'Ya empuja hacia la marca. ¿Con cuánta fuerza? Las piedras de Edda frenan distinto: ¿cuál deja la fuerza justa?', tool: 'wire' }],
    tools: ['voltage'], voice: 'OHM', hints: ['El encargo tiene dos partes: hacia dónde empuja y con cuánta fuerza. Conviene resolverlas por separado.', 'La piedra cambia la fuerza, nunca el sentido. El sentido depende de por dónde entra la corriente a la bobina.', 'Si la corriente entra por «Avance −», empuja al revés. Invertí los dos cables de la bobina.', 'Un paso para probar: retirá los dos cables que llegan a la bobina y uní «Freno B» con «Avance +» y «Avance −» con «Retorno −». Después probá las piedras de Edda en el zócalo hasta que el cerrojo ni tiemble ni golpee: la de anillos marrón, negro, negro.'] },
  pump: { goal: 'Encontrá el empalme que pierde fuerza y puentealo.', learned: 'Un empalme puede conducir y aun así comerse la fuerza: se descubre comparando sus extremos con la bomba andando.',
    steps: [{ how: 'Los tres empalmes dejan pasar. ¿En cuál se queda la fuerza? Con la bomba andando, “Comparar dos puntos” mira los dos lados de cada uno.', tool: 'voltage' }, { how: 'Antes de tocar nada, Vega quiere saber adónde se van los 12 V: ¿cuánto se queda cada empalme y cuánto la bomba? Ella va sumando.', tool: 'voltage' }, { how: 'Ahora que sabés dónde se pierde, ¿cómo le devolvés la fuerza a la bomba con un solo cable?', tool: 'wire' }],
    tools: ['voltage'], voice: 'OHM', hints: ['Los tres empalmes conducen: la prueba de camino diría que sí en los tres. La pérdida es otra cosa.', 'Con la bomba trabajando, un empalme sano apenas se nota; uno malo se come parte de la fuerza. Y se entibia.', 'Compará los dos extremos de cada empalme con la bomba andando. Donde haya una diferencia grande, ahí se pierde.', 'Un paso para probar: elegí “Comparar dos puntos” y apoyá las puntas en los extremos de cada empalme. En el que muestre diferencia, volvé a “Cables” y tendé tu cable entre sus dos extremos.'] },
  distribution: { goal: 'Que enfermería y cocina tengan cada una su propio camino.', learned: 'En paralelo, cada luz tiene su propio camino: se puede aislar una sin apagar la otra.',
    steps: [{ how: 'Seguí con el dedo el camino de la enfermería: ¿por dónde vuelve a la fuente? ¿Tiene que atravesar la cocina?', tool: 'wire' }, { how: '¿Y la cocina? ¿Recibe su fuerza por su cuenta, o a través de la enfermería?', tool: 'wire' }, { how: 'Ivara quiere verlo: ¿qué le pasa a la enfermería si la cocina se aísla con su llave?' }],
    tools: ['current'], voice: 'OHM', hints: ['Seguí el camino con el dedo: para volver a la fuente, la enfermería atraviesa la cocina.', 'Si la cocina se aísla, ¿qué le pasa a la enfermería? Ivara va a probar exactamente eso.', 'Cada luz necesita su propia ida desde «Fuente +» y su propia vuelta a «Retorno −».', 'Un paso para probar: retirá el cable entre «Enfermería −» y «Cocina +». Uní «Enfermería −» con «Retorno −» y «Fuente +» con «Cocina +». Después aislá la cocina para que Ivara lo vea.'] },
  irrigation: { goal: 'Repartí la línea: raíces, riego y horno, sin que el cable se caliente.', learned: 'Una línea compartida tiene un límite: lo que toma uno, no lo toman los otros. Elegir un reparto es decidir quién cede.',
    steps: [{ how: 'Girá el freno del calor de a una posición y mirá las raíces.' }, { how: 'Girá el freno del agua hasta que el riego salga parejo.' }, { how: 'El horno necesita fuerza para que Yesca pueda forjar.' }, { how: 'Si el cable de la ladera sigue caliente, alguien tiene que ceder. ¿Quién toma más? El instrumento puede decirlo.', tool: 'current' }],
    tools: ['current'], voice: 'OHM', hints: ['Cada freno cuida una sola cosa. El cable de la ladera, en cambio, lo sienten los tres.', 'Podés dejar las raíces y el riego en su punto primero; el encargo te marca cuándo lo están.', 'Si el cable sigue caliente con raíces y riego en su punto, el que tiene que ceder es el horno.', 'Un paso para probar: llevá el freno del calor y el del agua a la posición 3. Después frená el horno hasta que el cable deje de calentarse: posición 2 deja a Yesca fuerte; la 3, más suave. Las dos sirven.'] },
  beacon_supply: { goal: 'Dale fuerza al núcleo sin recalentar los tendidos.', learned: 'Dos tendidos lado a lado se reparten la corriente: cada uno lleva la mitad y se calienta mucho menos.',
    steps: [{ how: 'Frená menos con el regulador del generador (su botón −) para darle fuerza al núcleo, y mirá qué le pasa al tendido norte.' }, { how: 'Un solo tendido no alcanza. Con tus dos cables sumá el tendido sur, uno junto al generador y otro junto al núcleo; después frená menos con el regulador hasta que el núcleo sostenga su pulso.', tool: 'wire' }],
    tools: ['voltage'], voice: 'OHM', hints: ['Frenar menos con el regulador le da fuerza al núcleo, pero toda esa corriente pasa por el tendido norte.', 'Con un solo tendido no hay posición buena: o el núcleo queda débil o el cobre se calienta.', 'Dos tendidos lado a lado se reparten la corriente: cada uno lleva la mitad.', 'Un paso para probar: junto al generador, uní «Fuente +» con «Tendido sur · A»; junto al núcleo, «Tendido sur · B» con «Regulador A». Después frená menos con el regulador hasta que el núcleo sostenga su pulso.'] },
  beacon_network: { goal: 'Que luz, giro y campana tengan cada una su propio camino.', learned: 'En paralelo, cada voz recibe la misma tensión y toma la corriente que necesita.',
    steps: [...[0, 1, 2].map(() => ({ how: 'Que ninguna voz tenga que atravesar a otra para volver al mar. Como en el Castillo, pero con tres. Tocá un cable para retirarlo.', tool: 'wire' })), { how: 'Nereo quiere anotar la regla de los nudos: con “Medir un camino”, medí cada voz y también lo que sale de la fuente.', tool: 'current' }],
    tools: ['current'], voice: 'OHM', hints: ['Seguí los caminos: la corriente de la campana atraviesa la luz y el giro antes de volver.', 'En el Castillo, cada luz tuvo su propio camino. Acá son tres.', 'Cada voz necesita ida desde «Fuente +» y vuelta a «Retorno −», sin pasar por las otras.', 'Un paso para probar: retirá los dos cables que pasan de un receptor al siguiente. Con tus cuatro cables uní «Óptica −» y «Giro −» con «Retorno −», y «Fuente +» con «Giro +» y con «Señales +».'] },
  // Minijuegos del Manantial (ciclo 29): one concept each, asked by a neighbour.
  tala_lantern: { goal: 'Mostrale a Tala dónde está la fuerza de su farol.', learned: 'La fuerza se mide entre dos puntos. Entre los extremos del farol, que trabaja, queda casi toda; entre los del cordón, que sólo conduce, casi nada.',
    steps: [{ how: 'Elegí “Comparar dos puntos” y apoyá las puntas en «Farol +» y «Farol −». ¿Cuánto empuje hay entre los dos extremos del farol?', tool: 'voltage' }, { how: 'Ahora en los dos extremos del cordón, «Cordón · A» y «Cordón · B». Por el cordón pasa la misma corriente: ¿cuánto se queda?', tool: 'voltage' }],
    tools: ['voltage'], voice: 'TALA', hints: ['La fuerza no está en un punto: es una diferencia entre dos lugares. Por eso el instrumento tiene dos puntas.', 'El farol trabaja: da luz. El cordón sólo lleva la corriente de un lado al otro.', 'Por el cordón y por el farol pasa la misma corriente, porque están en la misma vuelta. Lo que cambia es cuánto empuje se queda cada uno.', 'Un paso para probar: con “Comparar dos puntos”, apoyá las puntas en «Farol +» y «Farol −». Después, en «Cordón · A» y «Cordón · B».'] },
  marin_cart: { goal: 'Ayudá a Marín a sumar lo que toma cada farol.', learned: 'En una sola vuelta, el empuje se reparte: el farol que más frena se queda con más, y entre los dos suman lo que empuja la batería.',
    steps: [{ how: 'Con “Comparar dos puntos”, compará «Delantero +» con «Delantero −», y «Trasero +» con «Trasero −». Marín va sumando.', tool: 'voltage' }],
    tools: ['voltage'], voice: 'MARIN', hints: ['Los dos faroles están en fila: la misma corriente atraviesa uno y después el otro.', 'Lo que se reparten es el empuje de la batería. ¿Cuánto se queda cada uno?', 'El de atrás frena el doble que el de adelante. ¿Se quedará con el doble?', 'Un paso para probar: apoyá las puntas en «Delantero +» y «Delantero −», y después en «Trasero +» y «Trasero −».'] },
  edda_contact: { goal: 'Encontrá dónde se queda la fuerza de la baliza y devolvésela.', learned: 'El contacto dejaba pasar la corriente, pero se quedaba con la mitad del empuje. Comparando sus extremos con la baliza encendida se vio; el puente se la devolvió.',
    steps: [{ how: 'Con la baliza encendida, compará los extremos del contacto y los de la baliza. ¿Quién se queda con la fuerza?', tool: 'voltage' }, { how: 'Ya sabés dónde se queda. ¿Cómo le devolvés la fuerza a la baliza con un solo cable?', tool: 'wire' }],
    tools: ['voltage'], voice: 'EDDA', hints: ['El contacto deja pasar: la baliza prende. Pero prende a medias.', 'Con la baliza encendida, lo que se queda cada pieza se ve comparando sus dos extremos.', 'Si el contacto se queda con una parte grande, a la baliza le llega menos. Un cable entre sus dos extremos lo saltea.', 'Un paso para probar: compará «Contacto · A» con «Contacto · B». Después volvé a “Cables” y tendé tu cable entre «Contacto · A» y «Contacto · B».'] },
  drawer: { goal: 'Pesá las piedras de Lumen y resolvé su acertijo.', learned: 'Los anillos no dicen el temperamento: escriben un número, con dos cifras y cuántos ceros. Y la piedra dorada miente un poco, nunca más de un 5 %.',
    steps: [{ how: 'Elegí una piedra de la bandeja para el zócalo. Después tomá “Pesar el freno” y apoyá las puntas en «Zócalo · A» y «Zócalo · B».', tool: 'weigh' }, { how: 'Lumen te da la séptima piedra, roja, roja, marrón. Decile cuánto frena antes de pesarla.', tool: 'weigh' }],
    tools: ['weigh'], voice: 'OHM', hints: ['La lámpara de prueba ya dice algo: con unas piedras brilla más que con otras. El instrumento lo dice en números.', 'El instrumento usa su propia pila: con la mesa apagada, mide cuánto frena lo que está entre las dos puntas.', 'Compará los anillos de dos piedras cuyo número se parezca. ¿Qué anillo cambia cuando el número suma un cero?', 'Un paso para probar: poné la piedra marrón, negro, negro, pesala apoyando las puntas en «Zócalo · A» y «Zócalo · B», y después probá con la marrón, negro, marrón.'] },
  beacon_lens: { goal: 'Alimentá la lente desde la toma del divisor y calibrala.', learned: 'Al conectar una carga, la toma del divisor baja: por eso la piedra se elige con la lente puesta. Y con el anillo dorado alcanza: la luz queda dorada aunque la piedra se corra un poco.',
    steps: [{ how: 'Elegí “Comparar dos puntos” y compará «Toma intermedia» con «Retorno −»: una vez así y otra con la lente conectada a la toma.', tool: 'voltage' }, { how: 'Con el cable de la lente en la «Toma intermedia», probá las piedras de repuesto de Nereo en el brazo superior hasta que la luz sea dorada.', tool: 'wire' }],
    tools: ['voltage'], voice: 'OHM', hints: ['La lente está unida directo a «Fuente +». El divisor está listo, pero nadie toma de su toma intermedia.', 'Nereo quiere dos lecturas de la toma: una sin la lente y otra con la lente conectada.', 'Con la lente conectada, la toma baja. Por eso la piedra del brazo superior se elige con la lente puesta, no antes.', 'Un paso para probar: compará «Toma intermedia» con «Retorno −». Mové el cable de la lente de «Fuente +» a la «Toma intermedia» y volvé a comparar. Después cambiá la piedra del brazo superior hasta que la luz sea dorada: la de anillos marrón, rojo, negro.'] },
};

const simpleLabel = label => label.replace(/\s*·\s*\d[\d,.]*\s*Ω/g, '').replace('Freno resistivo', 'Mando del cerrojo');
// ── Piedras de freno, drawn on the bench ─────────────────────────────────────────────────
const RING_AT = [.24, .38, .52, .78];
/** A ceramic stone with its four painted rings, centred on (x, y). With «Las marcas de Lumen» each ring carries its letter. */
function stoneArt(x, y, w, nominal) {
  const h = Math.max(26, w * .34), rings = stoneRings(nominal), x0 = x - w / 2;
  return `<g class="wb-stone-art"><rect x="${x0}" y="${y-h/2}" width="${w}" height="${h}" rx="${h/2}" fill="url(#wb-ceramic)" stroke="#6d5a3a" stroke-width="2"/>${rings.map((c, i) => `<path d="M${(x0+w*RING_AT[i]).toFixed(1)} ${(y-h/2+2).toFixed(1)} q2 ${h/2-2} 0 ${h-4} h${(w*.09).toFixed(1)} q-2 ${-(h/2-2)} 0 ${-(h-4)}Z" fill="${RING_HEX[c]}" stroke="#0004"/><text class="wb-ring-mark" x="${(x0+w*RING_AT[i]+w*.045).toFixed(1)}" y="${(y+h/2+19).toFixed(1)}">${RING_MARKS[c]}</text>`).join('')}<ellipse cx="${x-w*.05}" cy="${y-h/4}" rx="${w*.32}" ry="${h*.1}" fill="#fff" opacity=".2"/></g>`;
}
/** The same stone, at the size of a button. */
function stoneIcon(st) {
  if (st.strap) return '<svg viewBox="0 0 80 34" aria-hidden="true"><rect x="6" y="11" width="68" height="12" rx="3" fill="#b8733c" stroke="#5b3a1c" stroke-width="2"/></svg>';
  return `<svg viewBox="0 0 80 34" aria-hidden="true"><defs><linearGradient id="wb-ceramic-icon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1e3c2"/><stop offset=".6" stop-color="#d9c398"/><stop offset="1" stop-color="#b59a6a"/></linearGradient></defs><path d="M0 17 H8 M72 17 H80" stroke="#9a8656" stroke-width="3"/>${stoneArt(40, 15, 64, st.value).replace('url(#wb-ceramic)', 'url(#wb-ceramic-icon)').replace(/<text class="wb-ring-mark"[^>]*>[^<]*<\/text>/g, '')}</svg>`;
}
/** «saqué la piedra rojo, rojo, negro y oro», «puse el puente de cobre»: what a hand did at a socket. */
const stoneSaid = (k, value, verb) => { const st = stoneIn(k, value); return st?.strap ? `${verb} el puente de cobre` : `${verb} la piedra de anillos ${ringWords(value)}`; };
const TOOL_NAMES = { wire: 'Mover cables', continuity: 'Comprobar el camino', voltage: 'Comparar dos puntos', current: 'Medir un camino', weigh: 'Pesar el freno' };
// Instruments that run on their own battery: the bench switches off while they are in hand.
const OWN_BATTERY = ['continuity', 'weigh'];
/**
 * After the third stone, Ohm points at what the player can already see: two stones that differ only in
 * the third ring. If none was weighed yet, he proposes the one that makes the pair, and asks for a guess.
 */
const TWINS = [[10, 100], [12, 120]];
function ringPattern(weighed) {
  const pair = TWINS.find(([a, b]) => weighed.includes(a) && weighed.includes(b));
  if (pair) { const [a, b] = pair; return `Mirá estas dos: la de anillos ${ringWords(a)} pesó casi ${a}; la de ${ringWords(b)}, casi ${b}. Los dos primeros anillos son iguales. El tercero parece decir cuántos ceros siguen.`; }
  const half = TWINS.find(([a, b]) => weighed.includes(a) !== weighed.includes(b));
  if (half) { const [had, next] = weighed.includes(half[0]) ? half : [half[1], half[0]]; return `La de anillos ${ringWords(had)} pesó casi ${had}. Probá la de ${ringWords(next)}: los mismos dos primeros anillos, otro tercero. Antes de pesarla, ¿cuánto pensás que va a dar?`; }
  return `Mirá la de anillos ${ringWords(10)}, y después la de ${ringWords(100)}: los mismos dos primeros anillos, otro tercero. Antes de pesarlas, ¿qué pensás que cambia?`;
}

// These observations describe the solved physical state, not proximity to a
// memorized answer. They remain useful for unexpected but valid experiments.
export function observePuzzle(id, state, result = evaluatePuzzle(id, state)) {
  const p = PUZZLES[id];
  if (state.tripped || result.overloaded) return [{ label: 'Se oyó un clic', text: 'La protección cortó la alimentación: se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió.' }];
  if (!state.sourceOn) return [{ label: 'La mesa está en silencio', text: 'La alimentación está apagada. Podés revisar los cables o comprobar si hay camino.' }];
  const observations = p.components.filter(c => c.goal).map(c => {
    const branch = result.solution.branches[c.id];
    const magnitude = Math.abs(branch?.voltage ?? 0);
    const reverse = isPolarized(c) && (branch?.voltage ?? 0) < -.1;
    const strong = magnitude > c.goal.maxVoltage || Math.abs(branch?.current ?? 0) > c.goal.maxCurrent || (branch?.power ?? 0) > (c.goal.maxPower ?? Infinity);
    // Close to the working band, the description says so: a knob sweep should feel like progress.
    const nearLow = !strong && magnitude >= .8 * c.goal.minVoltage;
    const nearHigh = strong && magnitude <= 1.12 * c.goal.maxVoltage && Math.abs(branch?.current ?? 0) <= 1.12 * c.goal.maxCurrent && (branch?.power ?? 0) <= (c.goal.maxPower ?? Infinity);
    let text;
    if (result.operating[c.id]) text = ({ orb: 'Una luz tibia late bajo el vidrio. El ojo se abre.', lamp: 'La luz se sostiene, clara y pareja.', motor: 'Gira sin golpes. El agua sale pareja.', heater: 'El lecho está tibio. Las hojas vuelven a abrirse.', lens: 'La luz es dorada y se sostiene. Ya no encandila.', coil: id === 'gate' ? 'El cerrojo avanza sin golpear y deja libre el paso.' : 'El pulso se sostiene sin sacudidas.' })[c.kind];
    // Reversed polarity reads as reversal, in the words of what each piece does: only the gate has an advance mark.
    else if (reverse) text = c.kind === 'coil' ? (id === 'gate' ? 'Se mueve hacia atrás, contra la marca de avance.' : 'El pulso late al revés de lo marcado.') : c.kind === 'motor' ? 'Gira al revés de lo marcado: empuja hacia el otro lado.' : 'Responde en el sentido contrario al marcado.';
    else if (magnitude < .1 || Math.abs(branch?.current ?? 0) < .001) text = c.kind === 'orb' ? 'El ojo sigue cerrado. Bajo el vidrio no hay latido.' : 'No responde. Todo permanece quieto.';
    else if (nearHigh) text = ({ lamp: 'La luz es un poco más blanca de lo que conviene.', motor: 'Gira un poco apurada; el agua sale con algo de fuerza de más.', heater: 'El lecho está algo más caliente de lo necesario.', lens: 'La luz es un poco dura; casi dorada.', coil: 'Empuja un poco de más.', orb: 'El latido es un poco brusco.' })[c.kind];
    else if (nearLow) text = ({ lamp: 'La luz ya se sostiene, pero todavía le falta un poco.', motor: 'Casi alcanza: el agua sale, aunque sin fuerza pareja.', heater: 'El lecho empieza a entibiarse; todavía le falta.', lens: 'La luz asoma dorada, todavía tenue.', coil: 'Casi se sostiene; le falta un poco de fuerza.', orb: 'El latido está por aparecer.' })[c.kind];
    else if (strong) text = ({ lamp: 'La luz es demasiado blanca. El vidrio se calienta.', motor: 'Gira a los golpes. El agua sale demasiado fuerte.', heater: 'El lecho está caliente. Las hojas se encogen.', lens: 'La luz blanca encandila; el cristal se calienta.', coil: 'Golpea con fuerza. El metal empieza a calentarse.', orb: 'El brillo es brusco; todavía no encuentra un latido parejo.' })[c.kind];
    else text = ({ lamp: 'Hay un brillo débil. Apenas ilumina.', motor: 'Se esfuerza, pero apenas mueve el agua.', heater: 'El lecho sigue frío. Las hojas están caídas.', lens: 'La luz apenas atraviesa el cristal.', coil: 'Tiembla, pero no consigue sostener el movimiento.', orb: 'Algo tiembla bajo el vidrio. Todavía no despierta.' })[c.kind];
    if (c.kind === 'forge') text = result.operating[c.id] ? (Math.abs(branch?.power ?? 0) >= 11.5 ? 'El horno ruge parejo. Yesca puede forjar a tandas grandes.' : 'El horno sostiene un calor más bajo. Yesca puede trabajar, más despacio.') : magnitude < .1 ? 'El horno está frío. Así no hay azadas.' : 'El horno apenas entibia el hierro. Así Yesca no puede trabajar.';
    if (id === 'beacon_network' && c.kind === 'motor') text = result.operating[c.id] ? 'La cúpula gira sin detenerse.' : reverse ? 'La cúpula gira al revés de lo marcado.' : strong ? 'La cúpula gira a los golpes.' : nearLow ? 'La cúpula casi completa sus vueltas.' : 'La cúpula apenas consigue moverse.';
    return { label: simpleLabel(c.label), text };
  });
  // Something along the line warms while the pump works; which joint, the instrument has to say.
  if (p.components.some(c => c.kind === 'joint' && (result.solution.branches[c.id]?.power ?? 0) > 1)) observations.push({ label: 'La línea', text: 'Algo del camino se entibia mientras la bomba trabaja. Al tacto no se sabe bien dónde.' });
  for (const constraint of p.constraints ?? []) {
    if (constraint.source) { if ((result.requestedCurrent ?? 0) > constraint.maxCurrent) observations.push({ label: 'El tendido de la ladera', text: 'El cable de la ladera se calienta: horno, raíces y riego piden más de lo que la línea sostiene. Alguien tiene que ceder.' }); continue; }
    const branch = result.solution.branches[constraint.branch];
    if (constraint.maxPower !== undefined && (branch?.power ?? 0) > constraint.maxPower) observations.push({ label: simpleLabel(p.components.find(c => c.id === constraint.branch)?.label ?? 'El tendido'), text: 'El cobre se está calentando demasiado. Así no puede sostenerse.' });
    // A lens fed without the lower arm drifts with its own heat: the divider holds the tap steadier.
    if (constraint.minCurrent !== undefined && Math.abs(branch?.current ?? 0) < constraint.minCurrent) observations.push({ label: 'El divisor', text: 'El brazo inferior quedó fuera del camino. Así la luz depende sólo del cristal: cuando se calienta y cambia, la luz cambia con él. Con los dos brazos trabajando, la toma se sostiene más firme.' });
  }
  return observations;
}

const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n, decimals = 2) => Number.isFinite(n) ? (Math.abs(n) < .5 * 10 ** -decimals ? 0 : n).toLocaleString('es-AR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) : '—';
const copy = value => JSON.parse(JSON.stringify(value));
// Leads to the source follow its terminals; other wires alternate two neutral tones.
const wireTone = (w, i) => { const role = wireRole(w); return role === 'link' ? `wire-link-${i % 2}` : `wire-${role}`; };

// What a piece shows at a glance, read from the same physics as the brief: a word and a tone,
// never a number. Goal pieces say whether they work; a line with a limit says whether it heats.
export function pieceStatus(id, state, result, c) {
  const p = PUZZLES[id], powered = state.sourceOn && !state.tripped && !result.overloaded;
  const branch = result.solution.branches[c.id] ?? { voltage: 0, current: 0, power: 0 };
  if (c.goal) {
    if (result.operating[c.id]) return { tone: 'ok', word: 'Funciona' };
    if (!powered) return { tone: 'idle', word: 'Sin energía' };
    const magnitude = Math.abs(branch.voltage ?? 0), current = Math.abs(branch.current ?? 0), power = Math.abs(branch.power ?? 0);
    if (isPolarized(c) && (branch.voltage ?? 0) < -.1) return { tone: 'bad', word: 'Al revés' };
    if (magnitude < .1 || current < .001) return { tone: 'idle', word: 'Quieto' };
    const strong = magnitude > c.goal.maxVoltage || current > c.goal.maxCurrent || power > (c.goal.maxPower ?? Infinity);
    const near = strong ? magnitude <= 1.12 * c.goal.maxVoltage && current <= 1.12 * c.goal.maxCurrent && power <= (c.goal.maxPower ?? Infinity) : magnitude >= .8 * c.goal.minVoltage;
    return strong ? { tone: near ? 'near' : 'bad', word: near ? 'Se pasa un poco' : 'Demasiada fuerza' } : { tone: near ? 'near' : 'low', word: near ? 'Casi' : 'Le falta fuerza' };
  }
  const limit = (p.constraints ?? []).find(k => k.branch === c.id);
  if (!limit || !powered) return null;
  if (limit.maxPower !== undefined && Math.abs(branch.power ?? 0) > limit.maxPower) return { tone: 'bad', word: 'Se calienta' };
  if (limit.minCurrent !== undefined && Math.abs(branch.current ?? 0) < limit.minCurrent) return { tone: 'low', word: 'Fuera del camino' };
  return Math.abs(branch.current ?? 0) > .05 ? { tone: 'ok', word: limit.maxPower !== undefined ? 'Fresco' : 'Trabaja' } : null;
}
const STATUS_ICON = { ok: '✓', near: '◐', low: '▼', bad: '!', idle: '○' };

export class PuzzleWorkbench {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.state = null;
    this.active = false;
    this.mode = 'wire';
    this.selected = null;
    this.history = [];
    this.handleClick = this.handleClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleSliderCommit = this.handleSliderCommit.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.handleTrace = this.handleTrace.bind(this);
    this.handleTraceEnd = this.handleTraceEnd.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
  }

  open(id, savedSnapshot) {
    if (this.active) this.close(false);
    this.previousFocus = document.activeElement;
    this.id = id;
    this.puzzle = PUZZLES[id];
    this.state = normalizePuzzleSnapshot(id, savedSnapshot);
    this.practice = null;
    this.proofReadings = {};
    this.active = true;
    this.mode = 'wire';
    this.selected = null;
    this.history = [];
    this.feedback = '';
    this.hintShown = false;
    // What the player's own montage says, for a hint that answers it (bench-diagnosis.js).
    this.slipContext = { toggles: {}, lastKnob: null, measured: false }; this.slipsSaid = []; this.pendingSlip = null; this.slipShown = null;
    this.successDismissed = false;
    this.reveal = null;
    this.conjuroFresh = false;
    this.estimateNote = '';
    this.tallyNote = '';
    this.showNumbers = false;
    this.progress = { met: -1, at: performance.now(), changes: 0 };
    this.reading = '';
    // The bench powers itself: it is live whenever no instrument needs it quiet.
    this.powerForMode();
    this.shell = document.createElement('section');
    this.shell.className = 'workbench-overlay';
    this.shell.setAttribute('role', 'dialog');
    this.shell.setAttribute('aria-modal', 'true');
    this.shell.setAttribute('aria-label', this.puzzle.title);
    this.container.appendChild(this.shell);
    // Turning the phone resizes the board: the plates make room again.
    this.resizeWatch?.disconnect();
    this.resizeWatch = typeof ResizeObserver === 'function' ? new ResizeObserver(() => this.separatePlates()) : null;
    this.resizeWatch?.observe(this.shell);
    this.shell.addEventListener('click', this.handleClick);
    this.shell.addEventListener('input', this.handleInput);
    this.shell.addEventListener('change', this.handleSliderCommit);
    this.shell.addEventListener('pointerover', this.handleTrace);
    this.shell.addEventListener('focusin', this.handleTrace);
    this.shell.addEventListener('pointerout', this.handleTraceEnd);
    this.shell.addEventListener('focusout', this.handleTraceEnd);
    this.shell.addEventListener('pointerdown', this.handlePointerDown);
    this.shell.addEventListener('pointermove', this.handlePointerMove);
    this.shell.addEventListener('pointerup', this.handlePointerUp);
    document.addEventListener('keydown', this.handleKey, true);
    clearInterval(this.nudgeTimer);
    this.nudgeTimer = setInterval(() => this.shell?.querySelector('.wb-hint')?.classList.toggle('wb-nudge', this.needsNudge()), 5000);
    this.evaluate(false);
    // The instrument the brief asks for first is already in hand: touching A and B then measures,
    // instead of spending the only cable by accident. Wires stay one click away.
    { const { steps, current } = this.steps(), wanted = steps[current]?.tool;
      if (wanted && wanted !== 'wire' && wanted === this.availableTool()) { this.mode = wanted; this.powerForMode(); this.evaluate(false); } }
    // Hands come back empty: a tip left half-placed in an earlier visit would pair with the next touch.
    if (this.state.meter?.a && !this.state.meter.b) this.state.meter.a = null;
    if (!this.state.evidence.length) this.recordObservation('observation');
    this.render();
    // The bench itself takes the focus, not «Volver»: a first player pressed Enter and the bench
    // closed under them (ciclo 30). Tab reaches every control from here.
    this.shell.tabIndex = -1; this.shell.focus?.({ preventScroll: true });
    this.callbacks.onChange?.(id, copy(this.state));
    this.callbacks.onSound?.('open');
  }

  // A working, proven montage goes into service when the player leaves: finishing a bench never
  // depends on finding the right button. An unfinished montage stays as it is, never in service.
  close(notify = true, { commission = notify } = {}) {
    if (!this.active) return;
    if (this.practice) this.endPractice();
    if (notify && commission && !this.state.completed && evaluatePuzzle(this.id, this.state).commissionable) {
      this.state.completed = true;
      appendBenchEvidence(this.state, { kind: 'result', text: this.puzzle.doneText ?? 'Dejé la instalación funcionando con este montaje.' });
      this.callbacks.onSound?.('solve');
      this.callbacks.onSolve?.(this.id, { snapshot: copy(this.state), voltage: this.result.voltage, current: this.result.current, power: this.result.power, lesson: this.puzzle.lesson });
      this.callbacks.onChange?.(this.id, copy(this.state));
    }
    this.active = false;
    clearInterval(this.nudgeTimer);
    this.resizeWatch?.disconnect(); this.resizeWatch = null;
    document.removeEventListener('keydown', this.handleKey, true);
    this.shell.remove();
    this.shell = null;
    this.previousFocus?.focus?.({ preventScroll: true });
    if (notify) this.callbacks.onClose?.();
  }

  // Practice works on a copy: the installation in service is never touched, and what the
  // player tried is kept in the real bench's evidence when the practice ends.
  startPractice() {
    this.practice = { state: copy(this.state), callbacks: this.callbacks };
    this.callbacks = { ...this.callbacks, onChange: null, onSolve: null };
    this.state = { ...copy(this.state), completed: false, sourceOn: true, tripped: false };
    this.history = []; this.mode = 'wire'; this.feedback = 'Práctica: nada de esto cambia la instalación en servicio.';
    appendBenchEvidence(this.state, { kind: 'observation', text: 'Empecé a practicar con una copia del montaje.' });
    this.evaluate(false); this.render();
  }
  endPractice() {
    const { state, callbacks } = this.practice, evidence = this.state.evidence;
    this.practice = null; this.callbacks = callbacks; this.state = state; this.state.evidence = evidence;
    appendBenchEvidence(this.state, { kind: 'observation', text: 'Terminé la práctica. La instalación siguió en servicio con su montaje.' });
    this.history = []; this.mode = 'wire'; this.feedback = '';
    this.evaluate(false); this.callbacks.onChange?.(this.id, copy(this.state));
  }

  /** The bench is live, except while the continuity probe runs on its own battery. A trip
   * resets with the next change, so a short circuit costs a click, never a procedure. */
  powerForMode(rearm = true) {
    if (this.state.completed && !this.practice) return;
    const live = !OWN_BATTERY.includes(this.mode);
    if (live !== this.state.sourceOn) { this.state.sourceOn = live; if (live) this.state.tripped = false; }
    else if (live && rearm) this.state.tripped = false;
  }

  evaluate(notify = true) {
    this.result = evaluatePuzzle(this.id, this.state);
    if (this.result.overloaded) {
      this.state.tripped = true;
      this.feedback = 'Se oyó un clic: la protección cortó la alimentación porque se pedía demasiada corriente. Suele pasar cuando un camino une + y − sin atravesar ningún receptor. Nada se rompió: cambiá el montaje y la mesa vuelve a encender.';
      this.callbacks.onSound?.('error');
      this.result = evaluatePuzzle(this.id, this.state);
    }
    const proof = this.puzzle.proof;
    if (proof && this.result.proofMet && !this.state.proofs?.[proof.id] && !this.practice) {
      (this.state.proofs ??= {})[proof.id] = true;
      appendBenchEvidence(this.state, { kind: 'result', text: proof.recorded });
      this.feedback = `${proof.recorded} ${proof.who} lo vio.`;
      if (notify) this.callbacks.onSound?.('success');
    }
    this.settleConjuro();
    this.settleEstimate();
    if (notify && this.result.solved && !this.wasOperating && !this.state.completed) this.callbacks.onSound?.('success');
    this.wasOperating = this.result.solved;
  }

  // The keeper's inherited conjuro meets the copper: the bench says so once, the moment the physics
  // (or a recorded proof) shows what really happens.
  settleConjuro() {
    const spell = CONJUROS[this.id];
    if (!spell || this.state.conjuro || this.state.completed || this.practice || !spell.settled(this.result, this.state)) return;
    this.state.conjuro = true;
    appendBenchEvidence(this.state, { kind: 'result', text: `El conjuro, a prueba: «${spell.words}» ${spell.copper}` });
    this.conjuroFresh = true;
  }

  /** The keeper writes down each part measured on this montage; when every part is there, the sum is checked. */
  recordTally() {
    const t = this.puzzle.tally, s = this.state, m = s.meter;
    if (!t || this.practice || s.completed || !s.sourceOn || s.tripped || this.result.overloaded) return;
    let part = null;
    if (t.kind === 'current' && this.mode === 'current') part = t.parts.includes(m.branch) ? m.branch : null;
    if (t.kind === 'voltage' && this.mode === 'voltage' && m.a && m.b) {
      const { nodeOf } = wireNodes(this.id, s), probe = [nodeOf[m.a], nodeOf[m.b]].sort().join('|');
      part = t.parts.find(id => { const c = this.puzzle.components.find(x => x.id === id); return [nodeOf[c.a], nodeOf[c.b]].sort().join('|') === probe; }) ?? null;
    }
    if (!part) return;
    // A sum that has to be taken before the repair waits until the bridge is out of the way.
    if (t.before && !s.tally?.closed && s.wires.some(w => w.includes(t.before[0]) && w.includes(t.before[1]))) { this.tallyNote = t.request; return; }
    const signature = montageSignature(s), tally = s.tally ??= { closed: false, readings: {} };
    if (tally.signature !== signature) Object.assign(tally, { signature, readings: {} });
    tally.readings[part] = tallyReading(this.id, s, this.result, part);
    if (tally.closed || !t.parts.every(k => Number.isFinite(tally.readings[k]))) return;
    // The sum is done on the numbers as written, so what the player reads always adds up.
    const round = n => Math.round(n * 100) / 100, fmtV = n => `${round(n).toFixed(2).replace('.', ',')} V`, fmtA = n => `${round(n).toFixed(2).replace('.', ',')} A`, r = tally.readings;
    if (tallyCloses(this.id, r)) {
      tally.closed = true;
      const items = t.parts.filter(k => k !== 'source').map(k => (t.kind === 'current' ? fmtA : fmtV)(r[k])).join(' + ');
      const sum = t.parts.filter(k => k !== 'source').reduce((a, k) => a + round(r[k]), 0);
      this.tallyNote = t.kind === 'current'
        ? `${items} = ${fmtA(sum)}. Y de la fuente salen ${fmtA(r.source)}${Math.abs(round(sum) - round(r.source)) > .001 ? ': lo mismo, salvo el último decimal' : ''}. Lo que llega al nudo, sale de él: nada se queda en el camino. Primera vez que un farero escribe números. No pasó nada malo.`
        : `${items} = ${fmtV(sum)}, casi los ${this.puzzle.voltage} V de la fuente; el resto se quedó en los cables. Ningún voltio se perdió: cada uno se quedó en alguna parte.`;
      appendBenchEvidence(s, { kind: 'result', text: `${t.title}: ${this.tallyNote}` });
      this.callbacks.onSound?.('success');
      this.result = evaluatePuzzle(this.id, s);
    } else if (t.kind === 'current') this.tallyNote = 'En fila no hay nudos: la misma corriente atraviesa las tres voces y la suma no cierra con lo que sale de la fuente. La regla se ve cuando cada voz tiene su camino.';
    else this.tallyNote = 'La suma todavía no da lo que empuja la fuente. ¿Falta medir alguna parte de la vuelta, o alguna lectura quedó de antes?';
  }

  /** The keeper's running sum, written as it grows: what is measured on this montage, and what is missing. */
  tallyStrip() {
    const t = this.puzzle.tally, s = this.state;
    if (!t || this.practice || (s.completed && !this.tallyNote)) return '';
    // It appears when its item of the brief comes up, or once something is written in it.
    const at = this.puzzle.criteria.findIndex(c => /cuenta de la vuelta|nudos|cada voz/.test(c.text)), { current } = this.steps();
    const r = (s.tally?.closed || s.tally?.signature === montageSignature(s) ? s.tally?.readings : null) ?? {};
    if (!s.tally?.closed && current < at && !Object.keys(r).length) return '';
    const unit = t.kind === 'current' ? 'A' : 'V', round = n => Math.round(n * 100) / 100, fmtN = n => round(n).toFixed(2).replace('.', ',');
    const name = id => id === 'source' ? 'Sale de la fuente' : simpleLabel(this.puzzle.components.find(c => c.id === id)?.label ?? id);
    const parts = t.parts.filter(k => k !== 'source'), sum = parts.reduce((a, k) => a + round(r[k] ?? 0), 0), all = parts.every(k => Number.isFinite(r[k]));
    const cells = parts.map(k => `<span class="${Number.isFinite(r[k]) ? 'is-read' : ''}"><small>${escapeHtml(name(k))}</small>${Number.isFinite(r[k]) ? `${fmtN(r[k])} ${unit}` : '¿?'}</span>`).join('<i>+</i>');
    const total = t.kind === 'current' ? `<span class="${Number.isFinite(r.source) ? 'is-read' : ''}"><small>Sale de la fuente</small>${Number.isFinite(r.source) ? `${fmtN(r.source)} A` : '¿?'}</span>` : `<span class="is-read"><small>Empuja la fuente</small>${this.puzzle.voltage} V</span>`;
    return `<div class="wb-tally ${s.tally?.closed ? 'is-closed' : ''}" aria-label="${escapeHtml(t.title)}"><b>${escapeHtml(t.title)}</b><div class="wb-tally-sum">${cells}<i>=</i><span class="wb-tally-total ${all ? 'is-read' : ''}">${all ? `${fmtN(sum)} ${unit}` : '…'}</span><i>${s.tally?.closed ? '≈' : '¿='}</i>${total}</div></div>`;
  }

  /** Swapping the gate's stone, Ohm compares in proportions: how much the brake changed, how much the current. */
  proportionNote(before) {
    const value = this.state.values.brake, current = Math.abs(this.result.solution.branches.latch?.current ?? 0);
    if (value === before.value || this.feedback || before.current < .05 || current < .05 || this.state.tripped) return;
    const flow = current / before.current, amps = n => `${n.toFixed(2).replace('.', ',')} A`;
    const stone = (v, from) => (v ? `${from ? 'De' : 'a'} la piedra de ${v} Ω` : `${from ? 'Del' : 'al'} puente de cobre`), times = before.value ? value / before.value : null;
    const words = times && times > 1.8 ? `más del doble de freno` : times && times < .55 ? `menos de la mitad de freno` : null;
    // The reason is said once; after that Ohm only reads the two currents.
    const why = words && !this.proportionExplained ? ', pero no en la misma proporción: la bobina también frena, y ese freno no cambió' : words ? ', otra vez no en la misma proporción' : '';
    if (words) this.proportionExplained = true;
    this.feedback = `${stone(before.value, true)} ${stone(value)}${words ? `: ${words}` : ''}. Corriente de ${amps(before.current)} a ${amps(current)}: ${flow < 1 ? 'más freno, menos corriente' : 'menos freno, más corriente'}${why}.`;
  }

  // The mark Nereo wrote in the keepers' book meets the instrument.
  settleEstimate() {
    const e = ESTIMATES[this.id], mark = this.state.estimate;
    if (!e || !mark || mark.choice === 'skip' || mark.settled || this.practice) return;
    const measured = e.measured(this.result, this.state, this.proofReadings);
    if (!Number.isFinite(measured)) return;
    Object.assign(mark, { settled: true, measured });
    const verdict = estimateVerdict(this.id, mark.choice, measured);
    appendBenchEvidence(this.state, { kind: 'result', text: `${e.book}: ${verdict}` });
    this.estimateNote = verdict;
  }

  change(mutate, { history = true, sound = 'click' } = {}) {
    const before = copy(this.state);
    if (history) { this.history.push(copy(this.state)); if (this.history.length > 40) this.history.shift(); }
    this.hintShown = false; this.slipShown = null; this.estimateNote = ''; this.tallyNote = '';
    if (history) this.conjuroFresh = false;
    const brakeBefore = this.id === 'gate' ? { value: this.state.values.brake, current: Math.abs(this.result?.solution.branches.latch?.current ?? 0) } : null;
    if (history) this.probeMarks = null;
    mutate(this.state);
    if (history && ESTIMATES[this.id] && !ESTIMATES[this.id].when && !this.state.estimate && !this.state.completed) this.state.estimate = { choice: 'skip', settled: false };
    this.powerForMode(history);
    this.callbacks.onSound?.(sound);
    this.evaluate();
    if (brakeBefore) this.proportionNote(brakeBefore);
    if (history) this.trackProgress();
    this.recordChanges(before);
    this.recordMeasurement();
    this.callbacks.onChange?.(this.id, copy(this.state));
    this.render();
  }

  recordObservation(kind = 'result') {
    appendBenchEvidence(this.state, { kind, text: observePuzzle(this.id, this.state, this.result).map(o => `${o.label}: ${o.text}`).join(' ') });
  }

  recordChanges(before) {
    const s = this.state;
    let changed = false;
    const note = text => { changed = true; appendBenchEvidence(s, { kind: 'intervention', text }); };
    const sameWire = (a, b) => a.length === b.length && a.every(n => b.includes(n));
    for (const wire of before.wires) if (!s.wires.some(w => sameWire(w, wire))) note(`Retiré el cable entre ${this.portLabel(wire[0])} y ${this.portLabel(wire[1])}.`);
    for (const wire of s.wires) if (!before.wires.some(w => sameWire(w, wire))) note(`Uní ${this.portLabel(wire[0])} con ${this.portLabel(wire[1])}.`);
    for (const knob of this.puzzle.knobs ?? []) if (s.trace?.[knob.key]) { const t = s.trace[knob.key], v = s.values[knob.key]; t.min = Math.min(t.min, v); t.max = Math.max(t.max, v); }
    for (const knob of this.puzzle.knobs ?? []) if (before.values[knob.key] !== s.values[knob.key]) {
      if (knob.stones) { note(`${knob.label}: ${stoneSaid(knob, before.values[knob.key], 'saqué')}; ${stoneSaid(knob, s.values[knob.key], 'puse')}.`); continue; }
      const position = value => Math.round((value - knob.min) / knob.step) + 1;
      note(`${simpleLabel(knob.label)}: pasé de la posición ${position(before.values[knob.key])} a la ${position(s.values[knob.key])}.`);
    }
    for (const sw of this.puzzle.switches ?? []) if (before.switches[sw.key] !== s.switches[sw.key]) note(`${s.switches[sw.key] ? 'Conecté' : 'Aislé'} ${simpleLabel(sw.label)}.`);
    if (before.sourceOn !== s.sourceOn) note(s.sourceOn ? 'La mesa volvió a encenderse para probar el montaje.' : 'La mesa se apagó para la prueba de camino: el instrumento usa su propia pila.');
    else if (before.tripped && !s.tripped) note('La mesa volvió a encenderse para probar el montaje.');
    if (changed || (!before.tripped && s.tripped)) this.recordObservation();
    if (changed) this.noteSlips(before);
  }

  /** Keeps the little history a diagnosis needs (cables laid and taken back, the last knob turned)
   * and counts each new slip the player makes, for the Bitácora and the teacher. */
  noteSlips(before) {
    const s = this.state, ctx = this.slipContext ??= { toggles: {}, lastKnob: null, measured: false }, key = w => [...w].sort().join('~');
    const had = new Set(before.wires.map(key)), has = new Set(s.wires.map(key));
    let wiresMoved = false;
    for (const w of new Set([...had, ...has])) if (had.has(w) !== has.has(w)) { ctx.toggles[w] = (ctx.toggles[w] ?? 0) + 1; wiresMoved = true; }
    const turned = (this.puzzle.knobs ?? []).find(k => before.values[k.key] !== s.values[k.key]);
    if (turned) ctx.lastKnob = { key: turned.key, from: before.values[turned.key] };
    else if (wiresMoved) ctx.lastKnob = null;
    ctx.measured = false;
    this.updateSlip();
  }
  updateSlip() {
    this.slipContext ??= { toggles: {}, lastKnob: null, measured: false }; this.slipsSaid ??= [];
    const slip = this.state.completed && !this.practice ? null : diagnoseBench(this.id, this.state, this.result, this.slipContext, this.slipsSaid);
    if (slip && slip.key !== this.pendingSlip?.key) { const slips = this.state.slips ??= {}; slips[slip.kind] = (slips[slip.kind] ?? 0) + 1; }
    this.pendingSlip = slip;
  }

  recordMeasurement() {
    const m = this.state.meter;
    if (this.mode === 'wire' || (this.mode === 'current' ? !m.branch : !m.a || !m.b)) return;
    const reading = this.presentedReading();
    const blocked = OWN_BATTERY.includes(this.mode) && this.state.sourceOn && !this.state.tripped;
    const reference = this.mode === 'current' && m.branch === 'source' ? 'Medidor en serie con la fuente: todo lo que sale de ella.'
      : this.mode === 'current'
      ? `Medidor en serie con ${simpleLabel(this.puzzle.components.find(c => c.id === m.branch)?.label ?? '')}; sentido ${this.portLabel(this.puzzle.components.find(c => c.id === m.branch)?.a)} → ${this.portLabel(this.puzzle.components.find(c => c.id === m.branch)?.b)}.`
      : `Punta roja: ${this.portLabel(m.a)}; punta negra: ${this.portLabel(m.b)}.`;
    appendBenchEvidence(this.state, { kind: blocked ? 'observation' : 'measurement', text: blocked ? 'La prueba de continuidad quedó pendiente: la alimentación estaba encendida.' : TOOL_NAMES[this.mode], value: `${reading.value}${reading.unit ? ` ${reading.unit}` : ''}`, reference: `${reference} Alimentación ${this.state.sourceOn && !this.state.tripped ? 'encendida' : 'apagada'}.` });
    if (!blocked) { (this.slipContext ??= { toggles: {}, lastKnob: null, measured: false }).measured = true; this.updateSlip(); }
    if (!blocked) this.recordProofMeasurement(reading);
    if (!blocked) this.recordWeighing();
    if (!blocked) this.recordTally();
    if (!blocked) this.markProbe();
  }

  // A measured proof: the same two points read once unloaded and once loaded,
  // or a single reading across the faulty part (no path with the bench off; a drop under load).
  recordProofMeasurement(reading) {
    const asked = this.puzzle.proof, m = this.state.meter;
    // A minijuego's readings: each measurement the neighbour wants to see, seen once, in any order.
    const wanted = this.puzzle.readings;
    if (wanted) {
      if (this.practice || this.mode !== 'voltage' || !m.a || !m.b || !this.state.sourceOn || this.state.tripped || this.result.overloaded) return;
      const { nodeOf } = wireNodes(this.id, this.state), probe = [nodeOf[m.a], nodeOf[m.b]], volts = Math.abs(measureVoltage(this.result.solution, m.a, m.b) ?? 0);
      const seen = wanted.find(w => { const ends = w.across.map(n => nodeOf[n]); return !this.state.proofs?.[w.id] && ends[0] !== ends[1] && probe.includes(ends[0]) && probe.includes(ends[1]) && this.result.current > .05 && volts >= (w.min ?? -Infinity) && volts <= (w.max ?? Infinity); });
      if (!seen) return;
      (this.state.proofs ??= {})[seen.id] = true; appendBenchEvidence(this.state, { kind: 'result', text: seen.recorded });
      this.feedback = `${seen.recorded} ${seen.who} lo anota.`; this.callbacks.onSound?.('success'); this.result = evaluatePuzzle(this.id, this.state); this.settleConjuro();
      return;
    }
    if (asked && !this.practice && !this.state.proofs?.[asked.id] && m.a && m.b && (asked.continuityOpen || asked.voltageAcross)) {
      const { nodeOf } = wireNodes(this.id, this.state), ends = (asked.continuityOpen ?? asked.voltageAcross).map(n => nodeOf[n]), probe = [nodeOf[m.a], nodeOf[m.b]];
      const across = ends[0] !== ends[1] && probe.includes(ends[0]) && probe.includes(ends[1]), powered = this.state.sourceOn && !this.state.tripped;
      const shown = asked.continuityOpen ? this.mode === 'continuity' && !powered && measureResistance(puzzleNetwork(this.id, this.state, false), m.a, m.b) === Infinity
        : this.mode === 'voltage' && powered && Math.abs(measureVoltage(this.result.solution, m.a, m.b) ?? 0) >= asked.minVoltage;
      if (across && shown) { (this.state.proofs ??= {})[asked.id] = true; appendBenchEvidence(this.state, { kind: 'result', text: asked.recorded }); this.feedback = `${asked.recorded} ${asked.who} lo vio.`; this.callbacks.onSound?.('success'); this.result = evaluatePuzzle(this.id, this.state); this.settleConjuro(); }
      return;
    }
    const proof = this.puzzle.proof?.measure && this.puzzle.proof;
    if (!proof || this.practice || this.mode !== 'voltage' || !m.a || !m.b || !this.state.sourceOn || this.state.tripped) return;
    const { nodeOf } = wireNodes(this.id, this.state), [x, y] = proof.measure.between.map(n => nodeOf[n]), probe = [nodeOf[m.a], nodeOf[m.b]];
    if (x === y || !probe.includes(x) || !probe.includes(y)) return;
    const loaded = nodeOf[proof.measure.load[0]] === nodeOf[proof.measure.load[1]], proofs = this.state.proofs ??= {};
    const volts = Math.abs(measureVoltage(this.result.solution, m.a, m.b) ?? 0), key = loaded ? 'tapLoaded' : 'tapUnloaded';
    proofs[key] = true; (this.proofReadings ??= {})[key] = { volts, values: JSON.stringify(this.state.values) };
    this.settleEstimate();
    if (!proofs[proof.id] && proof.parts.every(k => proofs[k])) {
      // Say only what these two readings show: a drop, no change, or a comparison made after recalibrating.
      const u = this.proofReadings.tapUnloaded, l = this.proofReadings.tapLoaded, fmt = v => `${v.toFixed(2).replace('.', ',')} V`;
      const text = !u || !l ? proof.recorded
        : u.values !== l.values ? `Medí la toma sin la lente (${fmt(u.volts)}) y con la lente, después de mover el mando (${fmt(l.volts)}). Con el mismo ajuste todavía no las comparé.`
        : l.volts < u.volts - .05 ? `Medí la toma sin la lente (${fmt(u.volts)}) y con la lente (${fmt(l.volts)}): al cargarla, la tensión baja.`
        : `Medí la toma sin la lente (${fmt(u.volts)}) y con la lente (${fmt(l.volts)}): no cambió.`;
      proofs[proof.id] = true; appendBenchEvidence(this.state, { kind: 'result', text }); this.feedback = `${text} ${proof.who} lo anota.`; this.callbacks.onSound?.('success'); this.result = evaluatePuzzle(this.id, this.state); this.settleConjuro();
    }
  }

  handleKey(event) {
    if (!this.active) return;
    // The world must never receive movement/interaction keys through the bench.
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); if (this.reveal) { this.reveal = null; this.successDismissed = true; this.render(); } else if (this.selected) { this.selected = null; this.render(); } else this.close(); }
    if (event.key === 'Tab') {
      const focusables = [...this.shell.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), summary')].filter(el => el.getClientRects().length);
      const first = focusables[0], last = focusables.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }

  handleInput(event) {
    const target = event.target;
    if (!target.dataset.knob || this.state.completed) return;
    const focusKey = target.dataset.knob;
    const value = Number(target.value);
    if (!this.sliderStart) this.sliderStart = copy(this.state);
    this.state.values[focusKey] = value;
    const t = this.state.trace?.[focusKey]; if (t) { t.min = Math.min(t.min, value); t.max = Math.max(t.max, value); }
    this.hintShown = false;
    this.powerForMode();
    this.evaluate(false);
    this.callbacks.onChange?.(this.id, copy(this.state));
    // Keep the active range input mounted throughout a drag: only the readouts follow it.
    // The rest of the bench is rebuilt on release (keyboard arrows also dispatch change).
    this.refreshReadouts();
  }

  handleSliderCommit(event) {
    if (event.target.dataset.meterBranch !== undefined) {
      this.change(s => { s.meter.mode = 'current'; s.meter.branch = event.target.value || null; }, { history: false, sound: 'meter' });
      return;
    }
    if (!event.target.dataset.knob || this.state.completed) return;
    const key = event.target.dataset.knob;
    if (this.sliderStart) { this.history.push(this.sliderStart); this.recordChanges(this.sliderStart); this.sliderStart = null; }
    this.feedback = '';
    this.evaluate();
    this.trackProgress();
    this.recordMeasurement();
    this.callbacks.onChange?.(this.id, copy(this.state));
    this.callbacks.onSound?.('dial');
    this.render();
    [...this.shell.querySelectorAll(`[data-knob="${key}"]`)].find(el => el.getClientRects().length)?.focus({ preventScroll: true });
  }

  handleClick(event) {
    const el = event.target.closest('[data-action], [data-port], [data-terminal], [data-wire], [data-branch]');
    if (!el) return;
    // A drag that just ended may still produce a click on a terminal it touched: the drop already decided.
    const dropped = this.dragEnded, terminal = el.dataset.port ?? el.dataset.terminal;
    if (dropped && terminal && dropped.ids.includes(terminal) && performance.now() - dropped.at < 300) { this.dragEnded = null; return; }
    const physicallyChanges = el.dataset.wire !== undefined || ['switch','knob','stone','undo','reset'].includes(el.dataset.action) || ((el.dataset.port || el.dataset.terminal) && this.mode === 'wire');
    if (this.state.completed && physicallyChanges) { this.feedback = 'La instalación está en servicio. Podés medirla, o practicar con una copia para cambiar el montaje.'; this.render(); return; }
    if (el.dataset.port) return this.touchPort(el.dataset.port);
    if (el.dataset.terminal) return this.touchPort(el.dataset.terminal);
    if (el.dataset.wire !== undefined) {
      const i = Number(el.dataset.wire);
      if (this.mode !== 'wire' && el.tagName.toLowerCase() !== 'button') return;
      if (isSealed(this.id, this.state.wires[i])) { this.feedback = 'Ese cable está soldado: es parte de la instalación. Trabajá con los cables que tenés en la mano.'; this.callbacks.onSound?.('error'); this.render(); return; }
      // Only the × retires a cable (ciclo 30: a tap near a terminal landed on the copper and lifted
      // a cable without the player noticing); a tap on the copper itself says how.
      const w = this.state.wires[i], chip = el.tagName.toLowerCase() === 'button' || !this.shell?.querySelector?.('.wb-wire-chip');
      if (!chip) { this.feedback = `Para retirar el cable de ${this.portLabel(w[0])} a ${this.portLabel(w[1])}, tocá su ×.`; this.render(); return; }
      this.feedback = `Retiraste el cable de ${this.portLabel(w[0])} a ${this.portLabel(w[1])}: ya no está en la mesa y vuelve a tus cables disponibles.`; this.selected = null;
      return this.change(s => { s.wires.splice(i, 1); }, { sound: 'disconnect' });
    }
    if (el.dataset.branch) {
      if (this.mode !== 'current') return;
      this.change(s => { s.meter.mode = 'current'; s.meter.branch = el.dataset.branch; s.meter.a = null; s.meter.b = null; }, { history: false, sound: 'meter' });
      return;
    }
    const action = el.dataset.action;
    if (action === 'close') return this.close();
    if (action === 'commission') return this.close(true, { commission: true });
    if (action === 'stay') { this.successDismissed = true; this.render(); this.shell.querySelector('[data-action="commission"]')?.focus?.({ preventScroll: true }); return; }
    if (action === 'estimate') {
      const choice = el.dataset.choice, book = ESTIMATES[this.id];
      if (!book || this.state.estimate) return;
      this.state.estimate = { choice, settled: false };
      if (choice !== 'skip') appendBenchEvidence(this.state, { kind: 'prediction', text: `${book.book}, marca esperada. ${book.noted} Anoté: «${estimateChoiceText(this.id, choice)}».` });
      this.callbacks.onSound?.('click');
      this.evaluate(false); this.callbacks.onChange?.(this.id, copy(this.state)); this.render();
      return;
    }
    if (action === 'reveal') { const reveal = revealFor(this.id, this.state); if (!reveal) return; this.reveal = { ...reveal, at: 0 }; this.callbacks.onSound?.('page'); this.render(); this.shell.querySelector('.wb-reveal [data-action]')?.focus?.({ preventScroll: true }); return; }
    if (action === 'reveal-step') { if (!this.reveal) return; this.reveal.at = Math.max(0, Math.min(this.reveal.cards.length - 1, this.reveal.at + Number(el.dataset.delta))); this.callbacks.onSound?.('page'); this.render(); this.shell.querySelector('.wb-reveal [data-delta="1"], .wb-reveal [data-action="commission"], .wb-reveal [data-action="reveal-end"]')?.focus?.({ preventScroll: true }); return; }
    if (action === 'reveal-end') { this.reveal = null; this.successDismissed = true; this.render(); return; }
    if (action === 'practice') return this.startPractice();
    if (action === 'end-practice') { this.endPractice(); return this.render(); }
    if (action === 'numbers') { this.showNumbers = !this.showNumbers; this.recordMeasurement(); this.callbacks.onChange?.(this.id, copy(this.state)); this.render(); return; }
    if (action === 'mode') {
      // An instrument button toggles: pressing the active one puts it down and frees the hands.
      // The instrument in hand stays in hand when its button is touched again: the way back is «Cables».
      // Only a bench with nothing to wire puts it down that way, to switch the table back on.
      const wiring = this.puzzle.cables !== 0 && !(this.state.completed && !this.practice);
      if (el.dataset.mode === this.mode && this.mode !== 'wire' && wiring) { this.feedback = ''; this.render(); return; }
      const mode = el.dataset.mode === this.mode && this.mode !== 'wire' ? 'wire' : el.dataset.mode;
      this.mode = mode; this.selected = null; this.feedback = '';
      return this.change(s => { if (mode !== 'wire') s.meter.mode = mode; s.meter.a = null; s.meter.b = null; s.meter.branch = null; }, { history: false });
    }
    if (action === 'switch' && this.puzzle.switches?.find(sw => sw.key === el.dataset.key)?.external) return;
    if (action === 'switch') { this.feedback = ''; return this.change(s => { s.switches[el.dataset.key] = !s.switches[el.dataset.key]; }, { sound: 'switch' }); }
    if (action === 'stone') {
      const knob = this.puzzle.knobs.find(k => k.key === el.dataset.key), value = Number(el.dataset.value);
      if (!knob || !knobChoices(knob).includes(value) || this.state.values[knob.key] === value) return;
      this.feedback = '';
      return this.change(s => { s.values[knob.key] = value; }, { sound: 'switch' });
    }
    if (action === 'knob') {
      const knob = this.puzzle.knobs.find(k => k.key === el.dataset.key);
      this.feedback = '';
      return this.change(s => { s.values[knob.key] = Math.max(knob.min, Math.min(knob.max, s.values[knob.key] + Number(el.dataset.delta) * knob.step)); }, { sound: 'dial' });
    }
    if (action === 'hint' && this.pendingSlip) {
      // A slip the player made comes first, as a question about it; the bench's own hints wait.
      const slip = this.pendingSlip; this.feedback = ''; (this.slipsSaid ??= []).push(slip.key); this.pendingSlip = null;
      this.hintShown = false; this.slipShown = slip;
      if (this.progress) Object.assign(this.progress, { at: performance.now(), changes: 0 });
      this.callbacks.onChange?.(this.id, copy(this.state)); this.render(); return;
    }
    if (action === 'hint') { this.feedback = ''; this.change(s => { s.hints = Math.min(BENCH_GUIDANCE[this.id].hints.length, s.hints + 1); }, { history: false }); this.hintShown = true; if (this.progress) Object.assign(this.progress, { at: performance.now(), changes: 0 }); this.render(); return; }
    if (action === 'undo') {
      if (!this.history.length) return;
      const completed = this.state.completed;
      const before = copy(this.state), evidence = this.state.evidence;
      const trace = this.state.trace, slips = this.state.slips; this.state = this.history.pop(); this.state.completed = completed; this.state.evidence = evidence; this.state.trace = trace; if (slips) this.state.slips = slips;
      this.powerForMode();
      this.feedback = 'Volviste un paso atrás.'; this.selected = null; this.hintShown = false; this.slipShown = null;
      this.evaluate(false); this.recordChanges(before); this.callbacks.onChange?.(this.id, copy(this.state)); this.render(); return;
    }
    if (action === 'reset') {
      this.feedback = 'La mesa volvió a su disposición inicial. Podés probar otro camino.'; this.selected = null;
      const completed = this.state.completed;
      return this.change(s => Object.assign(s, initialPuzzleSnapshot(this.id), { completed, evidence: s.evidence, trace: s.trace, proofs: s.proofs, hints: s.hints }), { sound: 'switch' });
    }
  }

  touchPort(id) {
    if (this.mode === 'current') { this.feedback = 'Elegí una pieza en el menú del medidor, al lado de su visor: el medidor queda en su camino.'; this.render(); return; }
    // A bench without cables has nothing to tie: touching a terminal takes up its instrument.
    if (this.mode === 'wire' && this.puzzle.cables === 0 && this.availableTool()) {
      const tool = this.availableTool();
      this.mode = tool; this.feedback = '';
      this.change(s => { s.meter.mode = tool; s.meter.a = null; s.meter.b = null; s.meter.branch = null; }, { history: false });
    }
    if (this.mode === 'wire') {
      // Taking a cable needs one in hand, and an installation in service only changes in a practice copy.
      if (!this.selected && this.state.completed) { this.feedback = 'La instalación está en servicio: para cambiar cables, practicá con una copia.'; this.render(); return; }
      if (!this.selected && cablesInHand(this.id, this.state) <= 0) { this.feedback = 'No te quedan cables en la mano. Tocá uno de los que tendiste para retirarlo y usarlo en otro lugar.'; this.callbacks.onSound?.('error'); this.render(); return; }
      if (!this.selected) { this.selected = id; this.feedback = ''; this.hintShown = false; this.slipShown = null; this.callbacks.onSound?.('connect'); this.render(); return; }
      if (this.selected === id) { this.selected = null; this.feedback = ''; this.render(); return; }
      const a = this.selected; this.selected = null;
      { const joined = this.state.wires.find(w => w.includes(a) && w.includes(id)); if (joined) { this.feedback = isSealed(this.id, joined) ? 'Esos bornes ya están unidos por un cable soldado de la instalación: ese no se retira.' : 'Esos bornes ya están unidos. Para retirar ese cable, tocá su ×.'; this.render(); return; } }
      if (!canJoin(this.id, a, id)) { this.feedback = 'Un cable de mano no llega tan lejos: esos bornes están en extremos distintos del tendido.'; this.callbacks.onSound?.('error'); this.render(); return; }
      if (cablesInHand(this.id, this.state) <= 0) { this.feedback = 'No te quedan cables en la mano. Retirá uno de los que tendiste para usarlo en otro lugar.'; this.callbacks.onSound?.('error'); this.render(); return; }
      this.feedback = '';
      this.change(s => { s.wires.push([a, id]); }, { sound: 'connect' });
      return;
    }
    this.change(s => {
      s.meter.mode = this.mode;
      if (!s.meter.a || s.meter.b) { s.meter.a = id; s.meter.b = null; }
      else s.meter.b = id;
    }, { history: false, sound: 'meter' });
  }

  // Dragging from one terminal to another lays a cable in one gesture; a tap, then another,
  // still works. While a cable is in hand, a line follows the pointer from where it was taken.
  handlePointerDown(event) {
    const terminal = event.target.closest?.('.wb-terminal[data-port]');
    if (!terminal || this.mode !== 'wire' || this.state.completed || event.button > 0) return;
    this.drag = { from: terminal.dataset.port, x: event.clientX, y: event.clientY, moved: false, held: this.selected };
  }
  handlePointerMove(event) {
    const board = this.shell?.querySelector('.wb-board');
    if (this.drag && !this.drag.moved && Math.hypot(event.clientX - this.drag.x, event.clientY - this.drag.y) > 8) {
      this.drag.moved = true;
      if (!this.drag.held) { this.selected = this.drag.from; this.shell.querySelector(`.wb-terminal[data-port="${this.drag.from}"]`)?.classList.add('selected'); board?.classList.add('holding'); }
    }
    const rubber = this.shell?.querySelector('.wb-rubber');
    if (!rubber || !this.selected) return;
    const svg = this.shell.querySelector('.wb-schematic'), matrix = svg?.getScreenCTM?.();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()), from = this.puzzle.ports.find(n => n.id === this.selected);
    rubber.setAttribute('d', `M ${from.x} ${from.y} L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`);
  }
  handlePointerUp(event) {
    const drag = this.drag; this.drag = null;
    if (!drag?.moved) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('[data-port],[data-terminal]');
    const id = target?.dataset.port ?? target?.dataset.terminal;
    this.dragEnded = { at: performance.now(), ids: [drag.from, id].filter(Boolean) };
    if (!drag.held) this.selected = null;
    if (!id || id === drag.from) { if (!drag.held) this.render(); return; }
    if (!drag.held) this.touchPort(drag.from);
    this.touchPort(id);
  }

  // A probe across the two ends of a section or a joint leaves its result on that piece, so a
  // section-by-section search reads on the board. Any change to the montage wipes the marks.
  markProbe() {
    const m = this.state.meter;
    if (!['continuity', 'voltage'].includes(this.mode) || !m.a || !m.b) return;
    const c = this.puzzle.components.find(k => ['cloth', 'joint'].includes(k.kind) && ((k.a === m.a && k.b === m.b) || (k.a === m.b && k.b === m.a)));
    if (!c) return;
    const powered = this.state.sourceOn && !this.state.tripped;
    let mark = null;
    if (this.mode === 'continuity' && !powered) mark = measureResistance(puzzleNetwork(this.id, this.state, false), m.a, m.b) === Infinity ? { tone: 'bad', word: 'Sin camino' } : { tone: 'ok', word: 'Hay camino' };
    if (this.mode === 'voltage' && powered) mark = Math.abs(measureVoltage(this.result.solution, m.a, m.b) ?? 0) >= 1 ? { tone: 'bad', word: 'Pierde fuerza' } : { tone: 'ok', word: 'Casi no pierde' };
    if (mark) (this.probeMarks ??= {})[c.id] = mark;
  }

  portLabel(id) {
    if (this.id === 'awaken') return { positive: 'Celda +', negative: 'Celda −', heartIn: 'Bronce +', heartOut: 'Bronce −' }[id] ?? id;
    return this.puzzle.ports.find(p => p.id === id)?.label ?? id;
  }

  meterReading() {
    const m = this.state.meter, powered = this.state.sourceOn && !this.state.tripped;
    if (this.mode === 'wire') return { value: '— —', unit: '', caption: this.selected ? 'Elegí el borne de llegada' : 'Uní dos bornes para tender un cable' };
    if (this.mode === 'current') {
      if (!m.branch) return { value: '— —', unit: 'A', caption: 'Apagá la alimentación y elegí una pieza para insertar el medidor en serie.' };
      if (m.branch === 'source') return { value: fmt(this.result.current), unit: 'A', caption: 'En serie con la fuente: todo lo que sale de ella pasa por el medidor.' };
      const branch = this.result.solution.branches[m.branch];
      return { value: fmt(branch?.current ?? 0), unit: 'A', caption: `En serie con ${this.puzzle.components.find(c => c.id === m.branch)?.label}. Sentido: borne izquierdo → derecho.` };
    }
    if (!m.a || !m.b) return { value: '— —', unit: this.mode === 'voltage' ? 'V' : 'Ω', caption: m.a ? 'Punta roja apoyada. Elegí el borne de la punta negra.' : 'Elegí dos bornes: primero la punta roja, después la negra.' };
    if (this.mode === 'voltage') {
      const voltage = measureVoltage(this.result.solution, m.a, m.b);
      return { value: voltage === null ? 'FLOT.' : fmt(voltage), unit: 'V', caption: voltage === null ? 'Un borne está flotante. Falta una referencia conductora a la fuente.' : `${this.portLabel(m.a)} respecto de ${this.portLabel(m.b)}` };
    }
    if (powered) return { value: 'APAGÁ', unit: '', caption: 'La continuidad usa la pila del medidor. Desconectá la fuente antes de medir.' };
    if (this.mode === 'weigh') return this.weighReading();
    const resistance = measureResistance(puzzleNetwork(this.id, this.state, false), m.a, m.b);
    return { value: resistance === Infinity ? 'ABIERTO' : fmt(resistance, resistance < 1 ? 2 : 1), unit: resistance === Infinity ? '' : 'Ω', caption: resistance === Infinity ? 'No hay un camino conductor entre las puntas.' : `${resistance < 2 ? 'Continuidad · ' : 'Hay un camino resistivo · '}${this.portLabel(m.a)} ↔ ${this.portLabel(m.b)}. Lectura de toda la red conectada.` };
  }

  /** «Pesar el freno»: what lies between the two tips, in ohms. Lumen covers the riddle stone until it is answered. */
  weighReading() {
    const m = this.state.meter;
    if (this.riddleCovered()) return { value: 'Lumen la tapa', unit: '', caption: 'La piedra del acertijo no se pesa antes de decir cuánto frena.' };
    const resistance = measureResistance(puzzleNetwork(this.id, this.state, false), m.a, m.b);
    return { value: resistance === Infinity ? 'Sin camino' : fmt(resistance, 1), unit: resistance === Infinity ? '' : 'Ω', caption: resistance === Infinity ? 'Entre las puntas no hay nada que pesar.' : `Lo que frena el camino entre ${this.portLabel(m.a)} y ${this.portLabel(m.b)}.` };
  }
  /** The riddle stone sits in the socket, unweighed, and nobody said yet how much it brakes. */
  riddleCovered() {
    const s = this.state, k = this.puzzle.knobs?.find(k => k.stones?.some(st => st.riddle));
    return !!k && s.values[k.key] === RIDDLE_STONE && !weighedStones(s).includes(RIDDLE_STONE) && !(s.estimate && s.estimate.choice !== 'skip');
  }
  /** Probes across a socket with the bench off: the stone in it is weighed, once, and the notebook keeps it. */
  recordWeighing() {
    const s = this.state, m = s.meter, k = this.puzzle.knobs?.find(k => k.stones);
    if (this.mode !== 'weigh' || !k || s.sourceOn || this.riddleCovered() || this.practice) return;
    const c = this.puzzle.components.find(c => c.valueKey === k.key), { nodeOf } = wireNodes(this.id, s);
    if (!c || ![m.a, m.b].map(n => nodeOf[n]).every(n => [nodeOf[c.a], nodeOf[c.b]].includes(n)) || nodeOf[m.a] === nodeOf[m.b]) return;
    const value = s.values[k.key], weighed = s.weighed ??= [];
    if (weighed.includes(value)) return;
    weighed.push(value);
    const st = stoneIn(k, value), read = fmt(measureResistance(puzzleNetwork(this.id, s, false), c.a, c.b), 1);
    appendBenchEvidence(s, { kind: 'result', text: `Pesé la piedra de anillos ${ringWords(value)}: ${read} Ω.` });
    this.result = evaluatePuzzle(this.id, s);
    if (st?.riddle) { this.settleEstimate(); return; }
    const plain = weighed.filter(v => v !== RIDDLE_STONE);
    this.feedback = plain.length === 3 ? `${ringPattern(plain)} Lumen abre el puño: tiene una piedra más.` : `La piedra de anillos ${ringWords(value)} pesa ${read} Ω.`;
    this.settleConjuro();
  }

  presentedReading() {
    if (this.showNumbers || this.mode === 'weigh') return this.meterReading();
    const m = this.state.meter;
    if (this.mode === 'current') {
      if (!m.branch) return { value: 'Elegí una pieza', unit: '', caption: 'Apagá y elegí la pieza: el medidor irá dentro de su camino.' };
      if (m.branch === 'source') return { value: this.result.current > .001 ? 'Sale corriente' : 'No sale nada', unit: '', caption: 'El medidor va en serie con la fuente: todo lo que sale de ella lo atraviesa. Para la cuenta, Nereo escribe el número.' };
      const amount = this.result.solution.branches[m.branch]?.current ?? 0, total = Math.abs(this.result.current ?? 0);
      // Without numbers the meter still compares: what share of what leaves the source goes through this piece.
      const share = total > .001 ? Math.min(1, Math.abs(amount) / total) : null, bars = share === null ? 0 : Math.max(1, Math.min(8, Math.round(share * 8)));
      const much = share === null ? 'Hay paso' : `${share > .92 ? 'Casi todo lo que sale' : share > .6 ? 'Mucho de lo que sale' : share > .35 ? 'Una buena parte' : share > .15 ? 'Una parte chica' : 'Muy poco'} ${'▮'.repeat(bars)}${'▯'.repeat(8 - bars)}`;
      return { value: Math.abs(amount) < .001 ? 'No pasa' : amount < 0 ? 'Al revés' : much, unit: '', caption: `Medidor en serie con ${simpleLabel(this.puzzle.components.find(c => c.id === m.branch)?.label ?? '')}. ${this.state.sourceOn && !this.state.tripped ? 'La barra compara con todo lo que sale de la fuente.' : 'Encendé para probar este camino.'}` };
    }
    if (!m.a || !m.b) return { value: m.a ? 'Una punta más' : 'Apoyá las puntas', unit: '', caption: m.a ? 'Elegí otra pieza redonda para apoyar la punta negra.' : 'Tocá dos piezas redondas: primero una, después otra.' };
    if (this.mode === 'weigh') return this.state.sourceOn && !this.state.tripped ? { value: 'Primero, apagá', unit: '', caption: 'Este instrumento usa su propia pila. Apagá la mesa y volvé a mirar.' } : this.weighReading();
    if (this.mode === 'continuity') {
      if (this.state.sourceOn && !this.state.tripped) return { value: 'Primero, apagá', unit: '', caption: 'Esta prueba usa la pila del instrumento. Apagá la alimentación de la mesa y volvé a mirar.' };
      const resistance = measureResistance(puzzleNetwork(this.id, this.state, false), m.a, m.b);
      return { value: resistance === Infinity ? 'Sin camino' : 'Hay camino', unit: '', caption: resistance === Infinity ? 'Entre esas dos puntas no hay paso. Esa es la observación; la causa todavía puede investigarse.' : 'Las puntas están comunicadas. El instrumento está mirando todos los cables que siguen conectados.' };
    }
    const voltage = measureVoltage(this.result.solution, m.a, m.b);
    // Without numbers the instrument still says how much: a share of what the source gives, in words
    // and a small gauge, so two comparisons can be told apart.
    const source = Math.abs(measureVoltage(this.result.solution, 'positive', 'negative') ?? 0), share = source > .01 && voltage !== null ? Math.abs(voltage) / source : null;
    // The words follow the bars, so the same gauge always reads the same; four of eight is said as half.
    const bars = share === null ? 0 : Math.max(share > .01 ? 1 : 0, Math.min(8, Math.round(share * 8)));
    const gauge = share === null ? '' : ` ${'▮'.repeat(bars)}${'▯'.repeat(8 - bars)}`;
    const amount = share === null ? 'Hay diferencia' : `${share < .04 ? 'Casi iguales' : ['Casi iguales', 'Un poco de diferencia', 'Algo de diferencia', 'Bastante diferencia', 'La mitad de la fuerza', 'Mucha diferencia', 'Mucha diferencia', 'Casi toda la fuerza', 'Casi toda la fuerza'][bars]}${gauge}`;
    return { value: voltage === null ? 'Sin referencia' : Math.abs(voltage) < .01 ? 'Iguales' : voltage < 0 ? `Al revés · ${amount.replace(/ ▮.*/, '').toLocaleLowerCase('es')}` : amount, unit: '', caption: voltage === null ? 'Una punta quedó aislada: no hay con qué comparar.' : `${this.portLabel(m.a)} ↔ ${this.portLabel(m.b)}` };
  }

  knobValue(knob) {
    return this.showNumbers ? `${fmt(this.state.values[knob.key], 0)} <small>${knob.unit}</small>` : '<span aria-hidden="true">◁ · · · ▷</span>';
  }

  renderDetails() {
    if (!this.showNumbers) return '';
    const p = this.puzzle, r = this.result, s = this.state;
    return `<details class="wb-notes" data-drawer="ratings"><summary>Leer las marcas de las piezas</summary><p>Son referencias para comparar con tus mediciones. No hace falta memorizarlas.</p>${p.components.filter(c => !['cloth', 'joint'].includes(c.kind)).map(c => `<p><strong>${escapeHtml(simpleLabel(c.label))}</strong> · ${fmt(c.valueKey ? s.values[c.valueKey] : c.resistance, 1)} Ω${(st => st && !st.strap ? ' ±5 % (anillo dorado)' : '')(stoneIn(p.knobs?.find(k => k.key === c.valueKey), s.values[c.valueKey]))}${c.goal ? `<br>Marca de trabajo: ${fmt(c.goal.minVoltage, 1)}–${fmt(c.goal.maxVoltage, 1)} V.` : ''}</p>`).join('')}${(p.constraints ?? []).filter(c => c.maxPower !== undefined).map(c => `<p>Tendido: ${fmt(r.solution.branches[c.branch]?.power ?? 0,1)} W · marca máxima ${fmt(c.maxPower,1)} W.</p>`).join('')}<details data-drawer="model"><summary>Cómo funciona este instrumento</summary><p>Red resistiva en corriente continua; los receptores representan su carga nominal. Los cables tienen 0,035 Ω. El voltímetro ideal compara dos puntos. El amperímetro ideal ocupa un tramo de la rama elegida en serie: toda su corriente lo atraviesa. Su resistencia es cero y no altera esta red nominal. En un instrumento real hay que escoger conexión y rango adecuados; aquí el rango es automático. La prueba de continuidad mide toda la red conectada, con la alimentación apagada.</p></details></details>`;
  }

  // Following the copper: pointing at a terminal or a wire lights every terminal
  // joined to it by wires alone. It teaches what a node is without showing voltages.
  handleTrace(event) {
    const node = event.target?.closest?.('[data-node]')?.dataset.node;
    if (!node || !this.shell) return;
    if (node === this.tracedNode) return;
    this.clearTrace();
    this.tracedNode = node;
    const selector = `[data-node="${(globalThis.CSS?.escape ?? String)(node)}"]`;
    this.shell.querySelectorAll(selector).forEach(el => el.classList.add('traced'));
    this.shell.querySelector('.wb-board')?.classList.add('tracing');
    const members = wireNodes(this.id, this.state).members[node] ?? [node];
    const caption = this.shell.querySelector('.wb-node-caption');
    if (caption) caption.textContent = members.length > 1
      ? `Unidos por cobre: ${members.map(id => this.portLabel(id)).join(' · ')}`
      : `${this.portLabel(node)}: ningún cable lo une a otro borne.`;
  }

  handleTraceEnd(event) {
    const next = event.relatedTarget?.closest?.('[data-node]')?.dataset.node;
    if (next && next === this.tracedNode) return;
    this.clearTrace();
  }

  clearTrace() {
    this.tracedNode = null;
    if (!this.shell) return;
    this.shell.querySelectorAll('.traced').forEach(el => el.classList.remove('traced'));
    this.shell.querySelector('.wb-board')?.classList.remove('tracing');
    const caption = this.shell.querySelector('.wb-node-caption');
    if (caption) caption.textContent = '';
  }

  /** A hand cable follows the board's grid: straight runs and square corners, around the pieces. */
  wirePath(a, b, index) {
    const pts = this.routes()[index];
    if (pts?.length) return roundedPath(pts, 4);
    const pa = this.puzzle.ports.find(p => p.id === a), pb = this.puzzle.ports.find(p => p.id === b);
    return `M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`;
  }

  ohmSvg(x, y, awake) {
    return `<ellipse cx="${x}" cy="${y+125}" rx="109" ry="17" fill="#0007" filter="url(#wb-shadow)"/>
      <path d="M${x-82} ${y+97} Q${x-104} ${y+112} ${x-94} ${y+126} Q${x-57} ${y+137} ${x-37} ${y+121} L${x-41} ${y+99}Z M${x+82} ${y+97} Q${x+104} ${y+112} ${x+94} ${y+126} Q${x+57} ${y+137} ${x+37} ${y+121} L${x+41} ${y+99}Z" fill="url(#wb-brass)" stroke="#483b27" stroke-width="5"/>
      <ellipse cx="${x}" cy="${y+8}" rx="100" ry="111" fill="url(#wb-brass)" stroke="#403824" stroke-width="6"/>
      <path d="M${x-94} ${y+46} Q${x} ${y+91} ${x+94} ${y+46} Q${x+82} ${y+119} ${x} ${y+119} Q${x-82} ${y+119} ${x-94} ${y+46}Z" fill="url(#wb-darkMetal)" stroke="#957c4d" stroke-width="3"/>
      <ellipse cx="${x}" cy="${y-13}" rx="57" ry="65" fill="url(#wb-brass)" stroke="#f0cd89" stroke-width="3"/>
      <ellipse cx="${x}" cy="${y-13}" rx="47" ry="54" fill="url(#wb-blueGlass)" stroke="#253f35" stroke-width="7"/>
      <ellipse cx="${x}" cy="${y-13}" rx="29" ry="34" fill="${awake ? '#68dce1' : '#344b46'}" class="${awake ? 'wb-eye-awake' : ''}"/>
      ${awake ? `<ellipse cx="${x-8}" cy="${y-24}" rx="11" ry="14" fill="#d5ffff" opacity=".85"/><path d="M${x-28} ${y+14} Q${x} ${y+34} ${x+29} ${y+12}" fill="none" stroke="#83ece3" stroke-width="3"/>` : `<path d="M${x-35} ${y-21} Q${x} ${y+2} ${x+35} ${y-21}" fill="none" stroke="#bc9c60" stroke-width="10" stroke-linecap="round"/>`}
      <path d="M${x-71} ${y-61} Q${x-38} ${y-97} ${x-3} ${y-91}" fill="none" stroke="#f4de99" stroke-width="8" stroke-linecap="round" opacity=".6"/>
      ${[-1,1].map(sign => `<ellipse cx="${x+sign*95}" cy="${y-8}" rx="13" ry="24" fill="url(#wb-brass)" stroke="#463923" stroke-width="4"/><path d="M${x+sign*95-6} ${y-21} l12 26" stroke="#443923" stroke-width="4"/>`).join('')}
      <path d="M${x-19} ${y-102} v-5 q19 -8 38 0 v5" fill="url(#wb-brass)" stroke="#6a5530" stroke-width="4"/>
      <text x="${x}" y="${y+91}" text-anchor="middle" fill="#e3c17d" font-family="Georgia" font-size="29" aria-hidden="true">Ω</text>
      ${[-67,67].map(dx => `<circle cx="${x+dx}" cy="${y+42}" r="4" fill="#c9ae6e" stroke="#5d4b2c" stroke-width="2"/>`).join('')}`;
  }

  componentSvg(c) {
    const a = this.puzzle.ports.find(p => p.id === c.a), b = this.puzzle.ports.find(p => p.id === c.b);
    const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2, width = Math.min(160, b.x - a.x - 35);
    const live = this.result.operating[c.id], branch = this.result.solution.branches[c.id];
    const glowing = Math.abs(branch?.current ?? 0) > .05 && !this.state.tripped && this.state.sourceOn;
    const nominalCurrent = c.goal ? (c.goal.minCurrent + c.goal.maxCurrent) / 2 : 1;
    const response = glowing ? Math.min(2.4, Math.abs(branch.current) / nominalCurrent) : 0;
    const resistance = c.valueKey ? this.state.values[c.valueKey] : c.resistance, socket = this.puzzle.knobs?.find(k => k.key === c.valueKey && k.stones);
    const screw = (sx, sy, radius = 5) => `<circle cx="${sx}" cy="${sy}" r="${radius}" fill="url(#wb-brass)" stroke="#332a1b" stroke-width="1"/><path d="M${sx-radius*.6} ${sy+radius*.3} l${radius*1.2} ${-radius*.6}" stroke="#362d21" stroke-width="1.5"/>`;
    const teeth = (radius, count=18) => Array.from({length:count},(_,i)=>`<rect x="${x-4}" y="${y-radius-5}" width="8" height="10" rx="1" fill="url(#wb-brass)" transform="rotate(${i*360/count} ${x} ${y})"/>`).join('');
    let center, labelOffset = 69, specOffset = 69;
    if (c.kind === 'orb') {
      labelOffset = 136; specOffset = 155;
      center = this.ohmSvg(x, y, live);
    } else if (c.kind === 'lens') {
      labelOffset = 98; specOffset = 99;
      center = `<ellipse cx="${x}" cy="${y+67}" rx="93" ry="14" fill="#0007" filter="url(#wb-shadow)"/>${teeth(76,36)}<circle cx="${x}" cy="${y}" r="73" fill="url(#wb-darkMetal)" stroke="url(#wb-brass)" stroke-width="10"/><circle cx="${x}" cy="${y}" r="60" fill="url(#wb-blueGlass)" stroke="#cbbb80" stroke-width="3"/>${[49,39,29,18].map(radius=>`<circle cx="${x}" cy="${y}" r="${radius}" fill="none" stroke="${live?'#dfecd0':'#819f88'}" stroke-width="4" opacity=".65"/><circle cx="${x}" cy="${y}" r="${radius-3}" fill="none" stroke="#142b28" stroke-width="2"/>`).join('')}<circle cx="${x}" cy="${y}" r="13" class="wb-filament ${glowing?'lit':''} ${live?'stable':''}"/><path d="M${x-40} ${y-39} Q${x-14} ${y-59} ${x+20} ${y-50}" fill="none" stroke="#eff8da" stroke-width="7" stroke-linecap="round" opacity=".46"/>${[45,135,225,315].map(angle=>`<g transform="rotate(${angle} ${x} ${y})">${screw(x,y-66,5)}</g>`).join('')}`;
    } else if (c.kind === 'lamp') {
      center = `<ellipse cx="${x}" cy="${y+46}" rx="53" ry="9" fill="#0006"/><path d="M${x-39} ${y+36} L${x-33} ${y-24} Q${x} ${y-49} ${x+33} ${y-24} L${x+39} ${y+36}Z" fill="url(#wb-glass)" stroke="url(#wb-brass)" stroke-width="5"/><circle cx="${x}" cy="${y}" r="24" class="wb-filament ${glowing?'lit':''} ${live?'stable':''}"/><path d="M${x-18} ${y+32} v-25 l9 -13 9 25 9 -25 9 13 v25" fill="none" stroke="${glowing?'#fff0ad':'#948563'}" stroke-width="3"/><path d="M${x-38} ${y-24} Q${x} ${y-55} ${x+38} ${y-24} L${x+47} ${y-16} H${x-47}Z" fill="url(#wb-brass)" stroke="#51432b" stroke-width="2"/><path d="M${x-42} ${y+31} H${x+42} v12 H${x-42}Z" fill="url(#wb-brass)" stroke="#58462d" stroke-width="2"/><path d="M${x-25} ${y-9} v33" stroke="#e6edd488" stroke-width="4" stroke-linecap="round"/>${screw(x-34,y+38,4)}${screw(x+34,y+38,4)}`;
    } else if (c.kind === 'motor') {
      center = `<rect x="${x-56}" y="${y-36}" width="112" height="76" rx="13" fill="url(#wb-brass)" stroke="#403728" stroke-width="4"/><circle cx="${x}" cy="${y}" r="43" fill="url(#wb-darkMetal)" stroke="#ac9567" stroke-width="7"/><circle cx="${x}" cy="${y}" r="34" fill="url(#wb-steel)"/><g class="${glowing?'wb-spinning':''}" style="transform-origin:${x}px ${y}px;animation-duration:${Math.max(.8, 3 / Math.max(.15, response))}s;animation-direction:${branch?.current < 0 ? 'reverse' : 'normal'}">${Array.from({length:7},(_,i)=>`<path d="M${x-5} ${y-5} Q${x-36} ${y-17} ${x-18} ${y-28} L${x+3} ${y-9}Z" fill="url(#wb-brass)" stroke="#53583d" transform="rotate(${i*360/7} ${x} ${y})"/>`).join('')}</g><circle cx="${x}" cy="${y}" r="11" fill="url(#wb-brass)" stroke="#22392a" stroke-width="3"/>${screw(x-46,y-25,4)}${screw(x+46,y-25,4)}${screw(x-46,y+28,4)}${screw(x+46,y+28,4)}<path d="M${x-57} ${y+13} h-13 v-22 M${x+57} ${y+13} h13 v-22" fill="none" stroke="url(#wb-copper)" stroke-width="7"/>`;
    } else if (c.kind === 'coil') {
      center = `<ellipse cx="${x}" cy="${y+39}" rx="86" ry="11" fill="#0007"/><rect x="${x-76}" y="${y-29}" width="152" height="58" rx="8" fill="url(#wb-darkMetal)" stroke="#7d7656" stroke-width="3"/><ellipse cx="${x-64}" cy="${y}" rx="16" ry="35" fill="url(#wb-ceramic)" stroke="#756444" stroke-width="3"/><rect x="${x-62}" y="${y-31}" width="123" height="62" fill="url(#wb-copper)"/>${Array.from({length:18},(_,i)=>`<path d="M${x-59+i*7} ${y-29} C${x-75+i*7} ${y-10} ${x-51+i*7} ${y+15} ${x-58+i*7} ${y+30}" fill="none" stroke="#422a20" stroke-width="3.5"/><path d="M${x-58+i*7} ${y-27} C${x-72+i*7} ${y-9} ${x-49+i*7} ${y+14} ${x-56+i*7} ${y+28}" fill="none" stroke="#e1a365" stroke-width="2"/>`).join('')}<ellipse cx="${x+64}" cy="${y}" rx="15" ry="35" fill="url(#wb-ceramic)" stroke="#786345" stroke-width="3"/><ellipse cx="${x+66}" cy="${y}" rx="8" ry="21" fill="url(#wb-darkMetal)"/><path d="M${x-79} ${y+37} H${x+79}" stroke="url(#wb-brass)" stroke-width="9"/>${screw(x-70,y+36)}${screw(x+70,y+36)}`;
    } else if (c.kind === 'switch') {
      center = `<rect x="${x-64}" y="${y-28}" width="128" height="61" rx="10" fill="url(#wb-ceramic)" stroke="#847859" stroke-width="3"/><rect x="${x-47}" y="${y-14}" width="25" height="34" rx="3" fill="url(#wb-copper)"/><rect x="${x+23}" y="${y-14}" width="25" height="34" rx="3" fill="url(#wb-copper)"/><circle cx="${x-34}" cy="${y}" r="9" fill="url(#wb-brass)"/><circle cx="${x+35}" cy="${y}" r="8" fill="#b2955e"/><path d="M${x-34} ${y} L${x+35} ${this.state.switches[c.switchKey]?y:y-35}" stroke="#332d1c" stroke-width="13" stroke-linecap="round"/><path d="M${x-34} ${y-3} L${x+35} ${this.state.switches[c.switchKey]?y-3:y-38}" stroke="url(#wb-brass)" stroke-width="7" stroke-linecap="round"/>${screw(x-55,y+22,4)}${screw(x+55,y+22,4)}`;
    } else if (c.kind === 'fault') {
      center = `<ellipse cx="${x}" cy="${y+30}" rx="87" ry="10" fill="#0005"/><rect x="${x-73}" y="${y-29}" width="146" height="57" rx="8" fill="url(#wb-darkMetal)" stroke="#8b7755" stroke-width="3"/><rect x="${x-52}" y="${y-21}" width="104" height="42" rx="6" fill="url(#wb-cloth)" stroke="#735b3e"/><path d="M${x-68} ${y} H${x-12} l7 -9 10 17 8 -8 H${x+68}" fill="none" stroke="${Number.isFinite(resistance)?'#7c9d78':'#51351f'}" stroke-width="8"/><path d="M${x-43} ${y-20} l-7 40 M${x-24} ${y-20} l-7 40 M${x+19} ${y-20} l-7 40 M${x+38} ${y-20} l-7 40" stroke="#b1a079" stroke-width="5"/>${[-63,63].map(dx=>`<rect x="${x+dx-7}" y="${y-27}" width="14" height="54" rx="3" fill="url(#wb-brass)"/>${screw(x+dx,y-18,4)}${screw(x+dx,y+18,4)}`).join('')}`;
    } else if (c.kind === 'cloth') {
      center = `<ellipse cx="${x}" cy="${y+28}" rx="${width/2+8}" ry="8" fill="#0005"/><rect x="${x-width/2}" y="${y-20}" width="${width}" height="40" rx="18" fill="url(#wb-cloth)" stroke="#6d5539" stroke-width="3"/>${Array.from({length:7},(_,i)=>`<path d="M${x-width/2+14+i*(width-28)/6} ${y-19} l-9 38" stroke="#a48f68" stroke-width="4" opacity=".7"/>`).join('')}${[-1,1].map(sign=>`<rect x="${x+sign*(width/2)-8}" y="${y-24}" width="16" height="48" rx="4" fill="url(#wb-brass)" stroke="#51432b" stroke-width="2"/>`).join('')}`;
    } else if (c.kind === 'joint') {
      const warm = Math.min(1, Math.abs(branch?.power ?? 0) / 3);
      center = `<ellipse cx="${x}" cy="${y+30}" rx="70" ry="9" fill="#0005"/><path d="M${x-width/2} ${y} H${x+width/2}" stroke="url(#wb-copper)" stroke-width="10"/><rect x="${x-30}" y="${y-24}" width="60" height="48" rx="9" fill="url(#wb-darkMetal)" stroke="url(#wb-brass)" stroke-width="4"/>${[-14,0,14].map(dx=>`<path d="M${x+dx} ${y-20} v40" stroke="#b39a66" stroke-width="3"/>`).join('')}${screw(x-20,y-15,4)}${screw(x+20,y+15,4)}${warm>.05?`<ellipse cx="${x}" cy="${y}" rx="${32+4*warm}" ry="${26+3*warm}" fill="#ff8a3d" fill-opacity="${.06+.1*warm}" class="wb-heat"/>`:''}`;
    } else if (c.kind === 'forge') {
      const heat = Math.min(1, Math.abs(branch?.power ?? 0) / 27);
      center = `<ellipse cx="${x}" cy="${y+36}" rx="84" ry="10" fill="#0007"/><path d="M${x-70} ${y+30} V${y-14} Q${x} ${y-52} ${x+70} ${y-14} V${y+30} Z" fill="url(#wb-darkMetal)" stroke="url(#wb-brass)" stroke-width="5"/><path d="M${x-34} ${y+30} V${y+2} Q${x} ${y-22} ${x+34} ${y+2} V${y+30} Z" fill="#1a0f0a" stroke="#6b5139" stroke-width="3"/><ellipse cx="${x}" cy="${y+18}" rx="${22+10*heat}" ry="${10+6*heat}" fill="rgb(${Math.round(90+165*heat)},${Math.round(40+120*heat)},${Math.round(20+30*heat)})" opacity="${.35+.65*heat}"/>${screw(x-60,y+20,4)}${screw(x+60,y+20,4)}`;
    } else if (c.kind === 'heater') {
      center = `<rect x="${x-76}" y="${y-35}" width="152" height="72" rx="7" fill="url(#wb-darkMetal)" stroke="url(#wb-brass)" stroke-width="5"/>${Array.from({length:8},(_,i)=>`<path d="M${x-56+i*16} ${y-25} v50" stroke="#596a53" stroke-width="8"/>`).join('')}<path d="M${x-65} ${y+20} H${x+55} q10 0 10 -10 v-6 H${x-55} q-10 0 -10 -10 v-8 H${x+62}" fill="none" stroke="url(#wb-copper)" stroke-width="5"/>${screw(x-68,y-28,4)}${screw(x+68,y-28,4)}${screw(x-68,y+29,4)}${screw(x+68,y+29,4)}`;
    } else if (socket) {
      // A felt bed between two brass clamps; the stone (or the copper strap) lies across it.
      const st = stoneIn(socket, resistance), w = Math.min(150, width);
      center = `<ellipse cx="${x}" cy="${y+31}" rx="${w/2+14}" ry="9" fill="#0006"/><rect x="${x-w/2-10}" y="${y-27}" width="${w+20}" height="54" rx="10" fill="#3b2a1f" stroke="#8b7755" stroke-width="3"/><rect x="${x-w/2+4}" y="${y-18}" width="${w-8}" height="36" rx="8" fill="#5e2f2a" opacity=".85"/>${[-1,1].map(sign=>`<rect x="${x+sign*(w/2-2)-9}" y="${y-24}" width="18" height="48" rx="4" fill="url(#wb-brass)" stroke="#5a4a30"/>${screw(x+sign*(w/2-2),y-13,4)}${screw(x+sign*(w/2-2),y+13,4)}`).join('')}${st?.strap ? `<rect x="${x-w/2+6}" y="${y-6}" width="${w-12}" height="12" rx="3" fill="url(#wb-copper)" stroke="#5b3a1c"/>` : stoneArt(x, y, w - 30, st?.value ?? resistance)}`;
    } else {
      center = `<ellipse cx="${x}" cy="${y+29}" rx="${width/2+9}" ry="9" fill="#0006"/><rect x="${x-width/2}" y="${y-22}" width="${width}" height="44" rx="16" fill="url(#wb-ceramic)" stroke="#786848" stroke-width="2"/>${[-1,1].map(sign=>`<ellipse cx="${x+sign*(width/2-9)}" cy="${y}" rx="9" ry="23" fill="url(#wb-brass)" stroke="#6a593c" stroke-width="2"/>`).join('')}${Array.from({length:9},(_,i)=>`<path d="M${x-width/2+28+i*(width-56)/8} ${y-21} q-8 21 0 42" fill="none" stroke="url(#wb-copper)" stroke-width="5"/>`).join('')}<path d="M${x-width/2+18} ${y-13} H${x+width/2-18}" stroke="#fff2c777" stroke-width="2"/>`;
    }
    if (c.kind === 'coil' && this.id === 'gate') center += `<path d="M${x+66} ${y} h${glowing ? Math.sign(branch.current)*Math.min(70, 44*response) : 6}" stroke="url(#wb-steel)" stroke-width="12" stroke-linecap="round"/><text x="${x+76}" y="${y+65}" class="wb-spec">AVANCE →</text>`;
    if (this.mode === 'current' && this.state.meter.branch === c.id) center += `<g class="wb-inline-ammeter" aria-label="Medidor insertado en serie"><circle cx="${(a.x+x)/2}" cy="${y}" r="16" fill="#d4c49a" stroke="#594a34" stroke-width="4"/><text x="${(a.x+x)/2}" y="${y+6}" text-anchor="middle" font-family="Georgia" font-size="18" fill="#312a21">A</text></g>`;
    const spot = this.reveal?.cards[this.reveal.at]?.spot?.includes(c.id) ? 'wb-spot' : '';
    return `<g class="wb-component ${live?'operating':''} ${spot}" data-piece="${c.id}" ${this.mode === 'current' ? `data-branch="${c.id}"` : ''} role="img" aria-label="${escapeHtml(this.showNumbers ? c.label : simpleLabel(c.label))}"><path d="M${a.x} ${a.y} L${x} ${y} L${b.x} ${b.y}" stroke="#293427" stroke-width="13"/><path d="M${a.x} ${a.y} L${x} ${y} L${b.x} ${b.y}" stroke="url(#wb-brass)" stroke-width="7"/>${center}${this.showNumbers ? `<text x="${x}" y="${y+specOffset}" class="wb-spec">${c.kind==='cloth'?'TRAMO DE TELA':c.kind==='joint'?'EMPALME':c.kind==='fault'?'INSPECCIONAR EMPALME':`${Number.isFinite(resistance)?`${fmt(resistance,0)} Ω`:'—'}${c.goal?`  ·  ${fmt(c.goal.minVoltage,1)}–${fmt(c.goal.maxVoltage,1)} V`:''}`}</text>` : ''}</g>`;
  }

  zoneSvg() {
    const zones = this.puzzle.zones; if (!zones) return '';
    return Object.entries(zones).map(([key, label]) => { const ps = this.puzzle.ports.filter(n => n.zone === key), x0 = Math.min(...ps.map(n => n.x)) - 45, x1 = Math.max(...ps.map(n => n.x)) + 45, y0 = Math.min(...ps.map(n => n.y)) - 70, y1 = Math.max(...ps.map(n => n.y)) + 50;
      return `<g class="wb-zone" pointer-events="none"><rect x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" rx="18"/><text x="${x0+14}" y="${y0+20}">${escapeHtml(label)}</text></g>`; }).join('');
  }

  materialDefs() {
    return `<linearGradient id="wb-brass" x1="0" x2=".35" y1="0" y2="1"><stop stop-color="#e0ca8c"/><stop offset=".18" stop-color="#b59a5f"/><stop offset=".48" stop-color="#7b643c"/><stop offset=".65" stop-color="#c0a571"/><stop offset="1" stop-color="#514329"/></linearGradient><linearGradient id="wb-copper" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#f0bf83"/><stop offset=".25" stop-color="#c68b56"/><stop offset=".54" stop-color="#854c33"/><stop offset=".7" stop-color="#b47147"/><stop offset="1" stop-color="#4b3225"/></linearGradient><linearGradient id="wb-darkMetal" x1="0" x2=".6" y1="0" y2="1"><stop stop-color="#687665"/><stop offset=".28" stop-color="#354b3e"/><stop offset=".6" stop-color="#122922"/><stop offset="1" stop-color="#344839"/></linearGradient><linearGradient id="wb-ceramic" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#c8c9a9"/><stop offset=".3" stop-color="#eee7c1"/><stop offset=".6" stop-color="#b3b49c"/><stop offset="1" stop-color="#686d54"/></linearGradient><radialGradient id="wb-blueGlass" cx=".32" cy=".25"><stop stop-color="#aac6ac" stop-opacity=".85"/><stop offset=".3" stop-color="#628c80"/><stop offset=".6" stop-color="#20463f"/><stop offset="1" stop-color="#102d2a"/></radialGradient><filter id="wb-shadow" x="-40%" y="-70%" width="180%" height="240%"><feGaussianBlur stdDeviation="5"/></filter><filter id="wb-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;
  }

  // ── The bench on screen ─────────────────────────────────────────────────────────────────
  // One goal line and the brief as numbered items above; the board, with each piece's name,
  // state and dial on the piece itself, in the middle; Ohm's one sentence and the few tools
  // below. When the brief is complete the board says so, and one button carries the story on.

  // Help is offered, never imposed: after a while, or several changes, without a new item of the
  // brief ticked, the hint button asks to be used. Asking for a hint resets the count.
  trackProgress() {
    const met = this.result.checks.filter(c => c.met).length, p = this.progress ??= { met, at: performance.now(), changes: 0 };
    if (met > p.met) Object.assign(p, { met, at: performance.now(), changes: 0 }); else p.changes++;
  }
  needsNudge() {
    const p = this.progress, guidance = BENCH_GUIDANCE[this.id];
    if (!p || this.result?.solved || this.state.completed || this.hintShown || this.slipShown) return false;
    // A slip of the player's own that stays two changes asks sooner than a plain wait.
    if (this.pendingSlip && p.changes >= 2) return true;
    return this.state.hints < guidance.hints.length && (p.changes >= 6 || performance.now() - p.at > 90000);
  }

  /** The bench's single instrument, if any: the one its story asks for. In service, only a
   * reading that does not switch the installation off. */
  availableTool() {
    const tool = BENCH_GUIDANCE[this.id].tools[0] ?? null;
    if (this.state.completed && !this.practice) return OWN_BATTERY.includes(tool) ? null : tool;
    return tool;
  }

  steps() {
    const s = this.state, guidance = BENCH_GUIDANCE[this.id];
    const steps = this.result.checks.map((c, i) => ({ text: c.text, met: c.met || (s.completed && !this.practice), how: guidance.steps?.[i]?.how, tool: guidance.steps?.[i]?.tool }));
    return { steps, current: steps.findIndex(c => !c.met) };
  }

  // Ohm says one thing at a time: what just went wrong, what someone asked to see, or what can be
  // touched for the next item of the brief. A hint, when asked, takes its place until the next change.
  message(step) {
    const s = this.state, r = this.result, p = this.puzzle, guidance = BENCH_GUIDANCE[this.id], voice = guidance.voice;
    if (this.tallyNote) return { kind: s.tally?.closed ? 'tally' : 'note', who: this.puzzle.tally.who.toLocaleUpperCase('es'), tag: this.puzzle.tally.title, text: this.tallyNote };
    const book = ESTIMATES[this.id];
    if (this.estimateNote) return { kind: 'estimate', who: book.who, tag: book.book, text: this.estimateNote };
    if (book && !s.estimate && !s.completed && !this.practice && !r.solved && (!book.when || book.when(s))) return { kind: 'estimate', who: book.who, tag: `${book.book} · Marca esperada`, text: book.ask, options: book.options };
    if (this.slipShown) return { kind: 'hint', who: voice, tag: 'Mirando tu montaje', text: this.slipShown.text };
    if (this.hintShown && s.hints) return { kind: 'hint', who: voice, tag: `Pista ${s.hints} de ${guidance.hints.length}`, text: guidance.hints[s.hints - 1] };
    if (this.feedback) return { kind: s.tripped ? 'warning' : 'note', who: voice, text: this.feedback };
    if (s.tripped) return { kind: 'warning', who: voice, text: observePuzzle(this.id, s, r)[0].text };
    if (s.completed && !this.practice) return { kind: 'note', who: voice, text: 'La instalación está en servicio. Podés medirla, o practicar con una copia sin tocarla.' };
    if (this.practice && r.solved) return { kind: 'note', who: voice, text: 'En la copia también funciona. La instalación real sigue como la dejaste.' };
    if (r.solved && !r.proven && !this.practice) return { kind: 'proof', who: p.proof.who.toLocaleUpperCase('es'), text: `Funciona. ${p.proof.request}` };
    if (r.solved && r.proven && !r.tallied && !this.practice) return { kind: 'proof', who: p.tally.who.toLocaleUpperCase('es'), text: `Funciona. ${p.tally.request}` };
    if (this.selected) return { kind: 'note', who: voice, text: `Tenés el cable tomado de ${this.portLabel(this.selected)}. Tocá el borne donde va el otro extremo, o el mismo para soltarlo.` };
    if (r.solved) return { kind: 'note', who: voice, text: 'Todo el encargo está cumplido.' };
    // Once the instrument the step names is in hand, the sentence starts where the player is.
    const how = step?.how ?? '', inHand = step?.tool && step.tool === this.mode && step.tool !== 'wire';
    const text = inHand ? how.replace(/^Elegí “[^”]+” y (\p{L})/u, (_, first) => first.toLocaleUpperCase('es')) : how;
    return { kind: 'step', who: voice, text };
  }

  plateOffset(c) { return c.kind === 'orb' ? 136 : c.kind === 'lens' ? 98 : this.puzzle.knobs?.some(k => k.key === c.valueKey && k.stones) ? 92 : 69; }
  pieceName(c) { return this.puzzle.knobs?.find(k => k.key === c.valueKey)?.label ?? simpleLabel(c.label); }

  stateMarkup(c) {
    const status = this.probeMarks?.[c.id] ?? (this.state.completed && !this.practice && c.goal ? { tone: 'ok', word: 'En servicio' } : pieceStatus(this.id, this.state, this.result, c));
    if (!status) return '<span class="wb-state" hidden></span>';
    const said = observePuzzle(this.id, this.state, this.result).find(o => o.label === simpleLabel(c.label))?.text ?? '';
    return `<span class="wb-state is-${status.tone}" title="${escapeHtml(said)}"><i aria-hidden="true">${STATUS_ICON[status.tone]}</i>${escapeHtml(status.word)}</span>`;
  }

  /** A socket: the stones at hand, one fitted. Rings are the only label, unless the numbers are showing. */
  socketControl(k) {
    const now = this.state.values[k.key];
    const plain = weighedStones(this.state).filter(v => v !== RIDDLE_STONE).length;
    return `<div class="wb-socket" data-knob-key="${k.key}" role="radiogroup" aria-label="${escapeHtml(`${k.label} · ${k.socket}`)}">${k.stones.filter(st => !st.riddle || plain >= 3).map(st => {
      const on = st.value === now, name = st.strap ? 'Puente de cobre, sin piedra' : `Piedra de anillos ${ringWords(st.value)}${this.showNumbers ? ` · ${st.value} Ω` : ''}`;
      return `<button class="wb-stone ${on ? 'is-in' : ''}" role="radio" aria-checked="${on}" data-action="stone" data-key="${k.key}" data-value="${st.value}" aria-label="${escapeHtml(name)}" title="${escapeHtml(name)}">${stoneIcon(st)}${st.strap ? '' : `<span class="wb-stone-marks" aria-hidden="true">${stoneRings(st.value).map(c => `<i>${RING_MARKS[c]}</i>`).join('')}</span>`}${this.showNumbers ? `<small>${st.strap ? '0' : st.value} Ω</small>` : ''}</button>`;
    }).join('')}</div>`;
  }

  knobControl(k) {
    if (k.stones) return this.socketControl(k);
    const s = this.state, positions = Math.round((k.max - k.min) / k.step) + 1, at = Math.round((s.values[k.key] - k.min) / k.step) + 1;
    const readout = this.showNumbers ? `${fmt(s.values[k.key], 0)} ${k.unit}` : `${at}/${positions}`;
    return `<div class="wb-knob" data-knob-key="${k.key}" role="group" aria-label="${escapeHtml(k.label)}"><button data-action="knob" data-key="${k.key}" data-delta="-1" aria-label="${escapeHtml(k.label)}: frenar menos" ${at <= 1 ? 'disabled' : ''}>−</button><span class="wb-knob-track"><input data-knob="${k.key}" type="range" min="${k.min}" max="${k.max}" step="${k.step}" value="${s.values[k.key]}" aria-label="${escapeHtml(k.label)}" aria-valuetext="${this.showNumbers ? `${s.values[k.key]} ${k.unit}` : `Posición ${at} de ${positions}. Hacia la derecha frena más: pasa menos.`}"/><span class="wb-knob-notches" aria-hidden="true">${Array.from({ length: positions }, (_, i) => `<i class="${i < at ? 'on' : ''}"></i>`).join('')}</span></span><button data-action="knob" data-key="${k.key}" data-delta="1" aria-label="${escapeHtml(k.label)}: frenar más" ${at >= positions ? 'disabled' : ''}>+</button><output>${readout}</output></div>`;
  }

  switchControl(sw) {
    const on = this.state.switches[sw.key];
    return `<button class="wb-switch ${on ? 'on' : ''}" data-action="switch" data-key="${sw.key}" aria-pressed="${on}" aria-label="${escapeHtml(sw.label)}: ${on ? 'conectada' : 'aislada'}" title="${escapeHtml(sw.label)}" ${sw.external ? 'disabled' : ''}><i aria-hidden="true"></i>${sw.external ? 'Aislada en el patio' : on ? 'Conectada' : 'Aislada'}</button>`;
  }

  plate(c) {
    const a = this.puzzle.ports.find(n => n.id === c.a), b = this.puzzle.ports.find(n => n.id === c.b);
    const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2 - this.plateOffset(c);
    const knob = this.puzzle.knobs?.find(k => k.key === c.valueKey), sw = this.puzzle.switches?.find(k => k.key === c.switchKey);
    // The pieces the goal is about carry the goal's own mark, so the line above points at the board.
    const card = this.reveal?.cards[this.reveal.at], spot = card?.spot?.includes(c.id), tag = card?.tags?.[c.id];
    return `<div class="wb-plate ${knob ? 'has-control' : ''} ${c.goal ? 'is-goal' : ''} ${spot ? 'wb-spot' : ''}" data-piece="${c.id}" style="left:${x / 10}%;top:${y / 5}%"><span class="wb-plate-name">${c.goal ? '<i class="wb-goal-mark" aria-hidden="true">◎</i>' : ''}${escapeHtml(this.pieceName(c))}</span>${tag ? `<span class="wb-eye-tag">${escapeHtml(tag)}</span>` : ''}${this.stateMarkup(c)}${knob ? this.knobControl(knob) : ''}${sw && !sw.external ? this.switchControl(sw) : ''}</div>`;
  }

  /** The hillside line has no piece of its own: its plate sits by the source. */
  linePlate() {
    const limit = (this.puzzle.constraints ?? []).find(k => k.source);
    if (!limit) return '';
    const powered = this.state.sourceOn && !this.state.tripped, hot = powered && (this.result.requestedCurrent ?? 0) > limit.maxCurrent;
    const status = !powered ? null : hot ? { tone: 'bad', word: 'Se calienta' } : { tone: 'ok', word: 'Fresco' };
    return `<div class="wb-plate wb-line-plate" data-piece="line" style="left:14%;top:9%"><span class="wb-plate-name">Cable de la ladera</span>${status ? `<span class="wb-state is-${status.tone}"><i aria-hidden="true">${STATUS_ICON[status.tone]}</i>${status.word}</span>` : ''}</div>`;
  }

  // Soldered wires are the installation's own copper: drawn as fixed traces along the edges of the
  // board, sharing a trunk from each source terminal. Hand cables hang loose, so they read as movable.
  tracePath(w) { return roundedPath(miter(this.tracePoints(w)), 4); }
  tracePoints([a, b]) {
    const p = this.puzzle, P = id => p.ports.find(n => n.id === id), sealed = p.sealed ?? [];
    const others = end => sealed.filter(w => w.includes(end)).map(w => P(w[0] === end ? w[1] : w[0]));
    let points;
    if (a === 'positive' || b === 'positive') {
      const pos = P('positive'), t = P(a === 'positive' ? b : a), targets = others('positive');
      const trunk = targets.length > 1 ? Math.min(...targets.map(n => n.x)) - 40 : (pos.x + t.x) / 2;
      points = [pos, { x: trunk, y: pos.y }, { x: trunk, y: t.y }, t];
      if (a !== 'positive') points.reverse();
    } else if (a === 'negative' || b === 'negative') {
      const neg = P('negative'), o = P(a === 'negative' ? b : a), trunk = Math.min(960, Math.max(...others('negative').map(n => n.x)) + 40);
      points = [o, { x: trunk, y: o.y }, { x: trunk, y: 455 }, { x: neg.x + 90, y: 455 }, { x: neg.x + 90, y: neg.y }, neg];
      if (a === 'negative') points.reverse();
    } else {
      const pa = P(a), pb = P(b), mid = (pa.y + pb.y) / 2;
      points = Math.abs(pa.y - pb.y) < 30 ? [pa, pb] : [pa, { x: pa.x, y: mid }, { x: pb.x, y: mid }, pb];
    }
    return points.filter((q, i, all) => i === 0 || Math.hypot(q.x - all[i - 1].x, q.y - all[i - 1].y) > .5);
  }

  /** The plates floating over the pieces, as half-extent boxes in board units: cables avoid running under them. */
  plateBoxes() {
    const p = this.puzzle, port = id => p.ports.find(n => n.id === id);
    return p.components.map(c => { const a = port(c.a), b = port(c.b), x = (a.x + b.x) / 2, y = (a.y + b.y) / 2, knob = p.knobs?.find(k => k.key === c.valueKey);
      return { x, y: y - this.plateOffset(c), w: 20 + 4.5 * (this.pieceName(c).length + (c.goal ? 14 : 0)), h: knob ? (knob.stones ? 64 : 48) / 2 + 6 : 16 }; });
  }

  /** Every movable cable laid on the board's grid, computed once per montage. */
  routes() {
    const key = `${this.id}:${JSON.stringify(this.state.wires)}`;
    if (this.routeCache?.key !== key) {
      const { nodeOf } = wireNodes(this.id, this.state);
      const sealedTraces = this.state.wires.filter(w => isSealed(this.id, w)).map(w => ({ node: nodeOf[w[0]], pts: miter(this.tracePoints(w)) }));
      this.routeCache = { key, routes: routeWires(this.puzzle, this.state.wires.map(w => (isSealed(this.id, w) ? null : w)), sealedTraces, this.plateBoxes(), nodeOf) };
    }
    return this.routeCache.routes;
  }

  // The remove button sits on the cable itself: in the middle of its longest straight run that is
  // clear of terminals.
  wireChip(w, i) {
    const p = this.puzzle, pts = this.routes()[i] ?? [];
    const runs = pts.slice(1).map((q, k) => ({ a: pts[k], b: q, len: Math.hypot(q.x - pts[k].x, q.y - pts[k].y) })).sort((u, v) => v.len - u.len);
    const mid = r => ({ x: (r.a.x + r.b.x) / 2, y: (r.a.y + r.b.y) / 2 });
    const plates = this.plateBoxes(), along = (r, t) => ({ x: r.a.x + (r.b.x - r.a.x) * t, y: r.a.y + (r.b.y - r.a.y) * t });
    const clear = q => p.ports.every(n => Math.hypot(n.x - q.x, n.y - q.y) > 42) && plates.every(b => Math.abs(q.x - b.x) > b.w + 14 || Math.abs(q.y - b.y) > b.h + 14);
    const spots = runs.flatMap(r => [.5, .3, .7, .15, .85].map(t => along(r, t)));
    const { x, y } = spots.find(clear) ?? (runs[0] ? mid(runs[0]) : { x: 500, y: 250 });
    return `<button class="wb-wire-chip" data-wire="${i}" style="left:${x / 10}%;top:${y / 5}%" aria-label="Retirar el cable entre ${escapeHtml(this.portLabel(w[0]))} y ${escapeHtml(this.portLabel(w[1]))}" title="Retirar este cable">×</button>`;
  }

  renderProbe() {
    if (this.mode === 'wire') return '';
    const meter = this.presentedReading(), s = this.state, m = s.meter;
    const empty = this.mode === 'current' ? !m.branch : !m.a || !m.b;
    const introduction = { weigh: 'La mesa se apaga sola: el instrumento usa su propia pila y dice cuánto frena lo que está entre las dos puntas.', continuity: 'La mesa se apaga sola: esta prueba usa la pila del instrumento y dice si hay camino entre dos lugares.', voltage: 'Compara dos lugares: esa diferencia se llama tensión. La mesa sigue encendida.', current: 'El medidor se pone en el camino de una pieza: toda su corriente lo atraviesa.' }[this.mode];
    return `<div class="wb-probe ${empty ? 'is-empty' : ''}" role="status"><span class="wb-probe-name">${TOOL_NAMES[this.mode]}</span><div class="wb-meter-readout"><strong>${escapeHtml(meter.value)}</strong><span>${meter.unit}</span></div><p>${escapeHtml(empty ? introduction : meter.caption)}</p>${this.mode === 'current' ? `<select data-meter-branch aria-label="Pieza en cuyo camino va el medidor"><option value="">Elegir una pieza…</option>${this.puzzle.components.map(c => `<option value="${c.id}" ${m.branch === c.id ? 'selected' : ''}>${escapeHtml(this.pieceName(c))}</option>`).join('')}${this.puzzle.tally?.parts.includes('source') ? `<option value="source" ${m.branch === 'source' ? 'selected' : ''}>Lo que sale de la fuente</option>` : ''}</select>` : ''}<button class="wb-numbers" data-action="numbers" aria-pressed="${this.showNumbers}">${this.showNumbers ? 'Sin números' : 'Ver números'}</button>${this.renderDetails()}</div>`;
  }

  /** During a dial drag the input stays mounted: only states, notches and the brief follow. */
  refreshReadouts() {
    if (!this.shell) return;
    this.probeMarks = null;
    for (const c of this.puzzle.components) { const el = this.shell.querySelector(`.wb-plate[data-piece="${c.id}"] .wb-state`); if (el) el.outerHTML = this.stateMarkup(c); }
    for (const k of (this.puzzle.knobs ?? []).filter(k => !k.stones)) this.shell.querySelectorAll(`.wb-knob[data-knob-key="${k.key}"]`).forEach(el => {
      const at = Math.round((this.state.values[k.key] - k.min) / k.step) + 1, positions = Math.round((k.max - k.min) / k.step) + 1;
      el.querySelectorAll('.wb-knob-notches i').forEach((i, n) => i.classList.toggle('on', n < at));
      el.querySelector('output').textContent = this.showNumbers ? `${fmt(this.state.values[k.key], 0)} ${k.unit}` : `${at}/${positions}`;
    });
    const { steps } = this.steps();
    this.shell.querySelectorAll('.wb-checks li').forEach((li, i) => { li.classList.toggle('met', !!steps[i]?.met); li.querySelector('.wb-check-mark').textContent = steps[i]?.met ? '✓' : String(i + 1); });
  }

  render() {
    if (!this.active || !this.shell) return;
    this.tracedNode = null;
    const focus = document.activeElement;
    const previous = this.shell.contains(focus) ? { ...focus.dataset } : null;
    const drawers = Object.fromEntries([...this.shell.querySelectorAll('[data-drawer]')].map(d => [d.dataset.drawer, d.open]));
    const p = this.puzzle, s = this.state, r = this.result, guidance = BENCH_GUIDANCE[this.id];
    const leaveLabel = this.id === 'awaken' ? 'A ver si despierta →' : 'Seguir la historia →';
    const powered = s.sourceOn && !s.tripped, inService = s.completed && !this.practice;
    const tool = this.availableTool(), wiring = p.cables !== 0 && !inService, inHand = Math.max(0, cablesInHand(this.id, s));
    const { steps, current } = this.steps(), step = steps[current];
    const success = !this.practice && !s.completed && r.commissionable;
    const say = this.message(step);
    const nextTool = !success && step?.tool && step.tool !== this.mode && !this.selected ? step.tool : null;
    const topo = wireNodes(this.id, s);
    const wired = (x, y) => s.wires.some(w => w.includes(x) && w.includes(y));
    const loose = guidance.pulseLoose && !r.solved && !this.selected && this.mode === 'wire' ? new Set(p.ports.filter(n => !s.wires.some(w => w.includes(n.id))).map(n => n.id)) : new Set();
    // A terminal no cable reaches is where a path is cut: it shows, as a loose end does on a real bench.
    const open = id => !r.solved && !inService && !loose.has(id) && !s.wires.some(w => w.includes(id));
    const portMarkup = (n, rail = false) => {
      const holding = this.mode === 'wire' && this.selected && this.selected !== n.id ? (canJoin(this.id, this.selected, n.id) && !wired(this.selected, n.id) ? 'wb-can-join' : 'wb-cannot') : '';
      return `<button class="${rail ? 'wb-rail-port' : 'wb-terminal'} ${this.selected === n.id ? 'selected' : ''} ${holding} ${loose.has(n.id) ? 'wb-loose' : ''} ${open(n.id) ? 'wb-open' : ''} ${this.mode !== 'wire' && s.meter.a === n.id ? 'probe-red' : ''} ${this.mode !== 'wire' && s.meter.b === n.id ? 'probe-black' : ''}" data-node="${topo.nodeOf[n.id]}" ${rail ? `data-terminal="${n.id}"` : `data-port="${n.id}" style="left:${n.x/10}%;top:${n.y/5}%"`} aria-label="${rail ? 'Conector' : 'Borne'} ${escapeHtml(this.portLabel(n.id))}${this.selected === n.id ? ', seleccionado' : open(n.id) ? ', suelto' : ''}" ${open(n.id) && !rail ? 'title="Suelto: ningún cable llega acá"' : ''} aria-pressed="${this.selected === n.id}"><span class="wb-terminal-hole"></span><span class="${rail ? '' : 'wb-terminal-label'}">${escapeHtml(rail ? this.portLabel(n.id) : p.boardLabels?.[n.id] ?? this.portLabel(n.id))}</span></button>`;
    };
    const toolButton = (mode, label) => `<button data-action="mode" data-mode="${mode}" class="${this.mode === mode ? 'active' : ''} ${nextTool === mode ? 'wb-next-step' : ''}" aria-pressed="${this.mode === mode}">${label}</button>`;
    const tools = [wiring ? toolButton('wire', `<span aria-hidden="true">⌁</span>Cables <b class="wb-hand" aria-label="${inHand} en la mano">×${inHand}</b>`) : '', tool ? toolButton(tool, `<span aria-hidden="true">⌖</span>${TOOL_NAMES[tool]}`) : ''].join('');
    const hintButton = !s.completed && !r.solved ? `<button class="wb-hint ${this.needsNudge() ? 'wb-nudge' : ''}" data-action="hint" ${s.hints >= guidance.hints.length && !this.pendingSlip ? 'disabled' : ''}>${this.pendingSlip ? (s.hints || this.slipsSaid?.length ? 'Otra pista' : 'Pista') : s.hints >= guidance.hints.length ? 'No hay más pistas' : s.hints === guidance.hints.length - 1 ? 'Mostrame un paso para probar' : s.hints ? 'Otra pista' : 'Pista'}</button>` : '';
    const controls = [...(p.knobs ?? []).map(k => `<div class="wb-compact-control"><span>${escapeHtml(k.label)}</span>${this.knobControl(k)}</div>`), ...(p.switches ?? []).filter(sw => !sw.external).map(sw => `<div class="wb-compact-control"><span>${escapeHtml(p.components.find(c => c.switchKey === sw.key) ? this.pieceName(p.components.find(c => c.switchKey === sw.key)) : sw.label)}</span>${this.switchControl(sw)}</div>`)].join('');
    const revealable = this.id !== 'awaken' && !this.practice;
    const card = this.reveal?.cards[this.reveal.at];
    const successWhat = [...new Set(observePuzzle(this.id, s, r).filter(o => p.components.some(c => c.goal && simpleLabel(c.label) === o.label)).map(o => o.text))].slice(0, 2).join(' ');
    this.shell.innerHTML = `<div class="wb-case ${this.id === 'awaken' ? 'wb-first' : ''} ${say.options && !card ? 'wb-asking' : ''} ${this.showNumbers ? 'wb-with-numbers' : ''} ${s.completed ? 'completed' : ''} ${success ? 'is-solved' : ''}">
      <header class="wb-header"><div class="wb-heading"><p class="wb-eyebrow">${p.place}${this.practice ? ' · PRÁCTICA CON UNA COPIA' : ''}</p><h1>${p.title}</h1></div>
        <section class="wb-goal" aria-label="Objetivo"><p class="wb-goal-line"><span aria-hidden="true">◎</span>${escapeHtml(guidance.goal)}</p><ol class="wb-checks">${steps.map((c, i) => `<li class="${c.met ? 'met' : ''} ${i === current ? 'current' : ''}" title="${escapeHtml(c.text)}"><span class="wb-check-mark" aria-hidden="true">${c.met ? '✓' : i + 1}</span><span class="wb-check-text">${escapeHtml(c.text)}</span><small class="screen-reader-only">${c.met ? ' (logrado)' : ' (pendiente)'}</small></li>`).join('')}</ol></section>
        ${inService ? '<span class="wb-in-service">✓ En servicio</span>' : success && this.successDismissed ? `<button class="wb-commission-top" data-action="commission">${leaveLabel}</button>` : ''}
        <button class="wb-close" data-action="close" aria-label="${success ? 'Volver al mundo: la instalación queda en servicio' : 'Volver al mundo'}">✕ <span>Volver</span></button></header>
      <main class="wb-stage"><div class="wb-board ${powered ? 'powered' : ''} ${this.selected ? 'holding' : ''} ${card ? 'wb-eye' : ''}">${!card && (this.mode !== 'wire' || p.cables) ? `<p class="wb-mode-tag is-${this.mode}" aria-live="polite">${this.mode === 'wire' ? `⌁ Cables en la mano: ${Math.max(0, cablesInHand(this.id, this.state))} · tocá dos bornes para tender uno` : `⌖ En la mano: ${escapeHtml(TOOL_NAMES[this.mode])} · tocá dos bornes para medir`}</p>` : ''}<span class="wb-corner tl"></span><span class="wb-corner tr"></span><span class="wb-corner bl"></span><span class="wb-corner br"></span><svg class="wb-schematic" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-label="Mesa con piezas y cables. Las piezas redondas se pueden tocar."><defs>${this.materialDefs()}<radialGradient id="wb-glass" cx=".35" cy=".25"><stop stop-color="#98b5ab" stop-opacity=".65"/><stop offset=".42" stop-color="#283e3b"/><stop offset="1" stop-color="#0c1919"/></radialGradient><radialGradient id="wb-steel"><stop stop-color="#697c70"/><stop offset="1" stop-color="#24362e"/></radialGradient><pattern id="wb-cloth" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#5a4933"/><path d="M0 2H8 M2 0V8" stroke="#756044" stroke-width="1"/></pattern></defs><rect width="1000" height="500" filter="url(#wb-grain)" opacity=".05" pointer-events="none"/><path d="M85 125 V180 M85 320 V375" stroke="#b89b66" stroke-width="6"/><rect x="43" y="185" width="84" height="128" rx="13" fill="#242f2b" stroke="#ac8a53" stroke-width="4"/><rect x="57" y="210" width="56" height="65" rx="4" fill="#111e1b" stroke="#6d714e"/>${this.showNumbers ? `<text x="85" y="238" class="wb-source-value">${p.voltage}</text><text x="85" y="260" class="wb-spec">VOLTIOS</text>` : `<path d="M68 243 h34 M85 226 v34" stroke="#d2b57b" stroke-width="4"/>`}<text x="85" y="299" class="wb-source-mark" aria-hidden="true">Ω</text><circle cx="85" cy="198" r="4" fill="${powered ? '#cfedab' : '#786845'}"/>${this.zoneSvg()}${s.wires.map((w, i) => [w, i]).filter(([w]) => isSealed(this.id, w)).map(([w, i]) => this.wireSvg(w, i, true)).join('')}${p.components.map(c => this.componentSvg(c)).join('')}${s.wires.map((w, i) => [w, i]).filter(([w]) => !isSealed(this.id, w)).map(([w, i]) => this.wireSvg(w, i, false)).join('')}${this.mode === 'wire' ? '<path class="wb-rubber" d=""/>' : ''}</svg>
        ${this.linePlate()}${p.components.map(c => this.plate(c)).join('')}${p.ports.map(n => portMarkup(n)).join('')}${this.mode === 'wire' && !inService ? s.wires.map((w, i) => isSealed(this.id, w) ? '' : this.wireChip(w, i)).join('') : ''}
        <p class="wb-node-caption" aria-live="polite"></p>
      </div>
        ${success && !this.successDismissed && !this.reveal ? `<div class="wb-success" role="status"><div class="wb-success-seal" aria-hidden="true">✓</div><h2>${p.done ? '¡Resuelto!' : '¡Funciona!'}</h2>${successWhat ? `<p class="wb-success-what">${escapeHtml(successWhat)}</p>` : ''}<p class="wb-learned"><b>Lo que vimos</b>${escapeHtml(guidance.learned)}</p><div class="wb-success-actions">${revealable ? `<button class="wb-primary" data-action="reveal"><span class="wb-eye-icon" aria-hidden="true"></span>Mirá lo que vi →</button><button class="wb-quiet" data-action="commission">${leaveLabel}</button>` : `<button class="wb-primary" data-action="commission">${leaveLabel}</button><button class="wb-quiet" data-action="stay">Seguir mirando la mesa</button>`}</div></div>` : ''}
      <p class="wb-rotate-hint"><span aria-hidden="true">⟳</span>Con el teléfono apaisado, el tablero se ve más grande.</p>
      <ul class="wb-piece-list">${[...p.components.filter(c => c.goal || this.probeMarks?.[c.id] || (p.constraints ?? []).some(k => k.branch === c.id)).map(c => `<li><span>${escapeHtml(this.pieceName(c))}</span>${this.stateMarkup(c)}</li>`), (p.constraints ?? []).some(k => k.source) ? `<li>${this.linePlate().replace(/^<div[^>]*>|<\/div>$/g, '')}</li>` : ''].join('')}</ul>
</main>
      <footer class="wb-dock">${card ? this.revealPanel(card, inService) : this.dockMarkup({ say, hintButton, controls, inService, tools, portMarkup, p, s })}</footer>
    </div>`;
    this.shell.querySelectorAll('[data-drawer]').forEach(d => { d.open = drawers[d.dataset.drawer] ?? d.hasAttribute('open'); });
    if (inService) this.shell.querySelectorAll('[data-action="switch"],[data-action="knob"],[data-action="stone"],input[data-knob],button[data-wire]').forEach(el => { el.disabled = true; });
    if (previous) {
      const keys = ['port','terminal','branch','action','knob'];
      const key = keys.find(k => previous[k]);
      if (key) {
        const suffix = ['key','mode'].filter(k => previous[k]).map(k => `[data-${k}="${previous[k]}"]`).join('');
        this.shell.querySelector(`[data-${key}="${previous[key]}"]${suffix}`)?.focus({ preventScroll: true });
      }
    }
    // A fresh success takes the focus, so Enter carries the story on.
    // The card waits until the receptor has answered (puzzles.css, 1.6 s hidden): it takes the focus
    // once it is really on screen, on its main button, so Enter does what the card offers first.
    if (success && !this.successDismissed && !this.successAnnounced) {
      const card = this.shell.querySelector('.wb-success'), go = card?.querySelector?.('.wb-primary');
      if (go) card.addEventListener?.('animationend', () => { if (!go.isConnected) return; this.successAnnounced = true; go.focus?.({ preventScroll: true }); }, { once: true });
    }
    if (!success) this.successAnnounced = false;
    this.separatePlates();
  }

  dockMarkup({ say, hintButton, controls, inService, tools, portMarkup, p, s }) {
    return `${this.conjuroStrip()}${this.tallyStrip()}<div class="wb-say is-${say.kind} ${say.kind === 'proof' ? 'wb-proof' : ''}" aria-live="polite"><span class="wb-say-face ${SAY_FACES[say.who ?? 'OHM'] ? `wb-face wb-face-${SAY_FACES[say.who ?? 'OHM']}` : ''}" aria-hidden="true">${SAY_FACES[say.who ?? 'OHM'] ? '' : 'Ω'}</span><p><b>${escapeHtml(say.who ?? 'OHM')}${say.tag ? ` · ${say.tag}` : ''}</b>${escapeHtml(say.text)}</p>${say.options ? '' : hintButton}${say.options ? `<div class="wb-marks" role="group" aria-label="Marca esperada">${say.options.map(o => `<button data-action="estimate" data-choice="${o.id}">${escapeHtml(o.text)}</button>`).join('')}${ESTIMATES[this.id]?.required ? '' : '<button class="wb-marks-skip" data-action="estimate" data-choice="skip">Medir sin anotar</button>'}</div>` : ''}</div>
        ${controls && !inService ? `<div class="wb-compact-controls">${controls}</div>` : ''}
        <div class="wb-toolbar">${tools ? `<div class="wb-tools">${tools}</div>` : ''}${this.renderProbe()}<div class="wb-history">${inService && revealFor(this.id, s) ? '<button data-action="reveal"><span class="wb-eye-icon" aria-hidden="true"></span>Lo que vio Ohm</button>' : ''}${inService ? '<button data-action="practice">Practicar con una copia</button>' : this.practice ? '<button data-action="end-practice">Terminar la práctica</button>' : ''}${!inService ? `<button data-action="undo" class="wb-icon-button" ${!this.history.length ? 'disabled' : ''} title="Deshacer el último cambio" aria-label="Deshacer el último cambio"><span aria-hidden="true">↶</span></button><button data-action="reset" class="wb-icon-button" title="Empezar de nuevo: la mesa como estaba" aria-label="Empezar de nuevo: la mesa como estaba"><span aria-hidden="true">↺</span></button>` : ''}</div></div>
        <details class="wb-terminal-drawer" data-drawer="terminals" ${p.cables ? 'open' : ''}><summary>Tocar las conexiones <span>Las mismas piezas, más cerca</span></summary><div class="wb-terminal-rail">${p.ports.map(n => portMarkup(n, true)).join('')}</div></details>`;
  }

  /** The keeper's inherited formula stays in view until the bench tests it; then, for the rest of the visit, the copper's answer. */
  conjuroStrip() {
    const spell = CONJUROS[this.id];
    if (!spell || this.practice || ((this.state.conjuro || this.state.completed) && !this.conjuroFresh)) return '';
    if (this.conjuroFresh) return `<p class="wb-conjuro is-answered"><span aria-hidden="true">✦</span><span class="wb-conjuro-answer"><b>Lo que dijo el cobre:</b> ${escapeHtml(spell.copper)}</span><small>— al conjuro ${escapeHtml(spell.heir)}</small></p>`;
    return `<p class="wb-conjuro"><span aria-hidden="true">✦</span><q>${escapeHtml(spell.words)}</q><small>— conjuro ${escapeHtml(spell.heir)}</small></p>`;
  }

  /** Ohm lends his eye: one card at a time, the pieces it speaks about lit on the board. */
  revealPanel(card, inService) {
    const r = this.reveal, last = r.at === r.cards.length - 1;
    const words = (card.words ?? []).map(k => WORDS[k]).filter(Boolean).map(w => `<span class="wb-word"><span><b>${escapeHtml(w.term)}</b>${w.unit ? ` · ${escapeHtml(w.unit)}` : ''}</span><small>${escapeHtml(w.world)}, en Ohmdal</small></span>`).join('');
    const leave = this.id === 'awaken' ? 'A ver si despierta →' : 'Seguir la historia →';
    const actions = last
      ? (inService || this.practice ? '<button class="wb-primary" data-action="reveal-end">Volver a la mesa</button>' : `<button class="wb-primary" data-action="commission">${leave}</button><button class="wb-quiet" data-action="reveal-end">Quedarme mirando la mesa</button>`)
      : '<button class="wb-primary" data-action="reveal-step" data-delta="1">Seguí →</button>';
    return `<div class="wb-reveal" role="region" aria-label="Lo que vio Ohm"><span class="wb-say-face wb-face wb-face-ohm" aria-hidden="true"></span><div class="wb-reveal-body"><p class="wb-reveal-tag"><b>OHM · Lo que vi</b><span>${r.at + 1} / ${r.cards.length}</span></p><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.text)}</p>${words ? `<div class="wb-words">${words}</div>` : ''}</div><div class="wb-reveal-side">${last ? `<p class="wb-reveal-question"><b>Para pensar en el camino</b>${escapeHtml(r.question)}</p><p class="wb-reveal-saved">Lo anoté en tu Bitácora.</p>` : ''}<div class="wb-reveal-actions">${r.at ? '<button class="wb-quiet" data-action="reveal-step" data-delta="-1">← Antes</button>' : ''}${actions}</div></div></div>`;
  }

  // Plates sit over their pieces in board percentages, so on a small board (a landscape phone)
  // two of them can touch. The one without a control steps aside, sideways, just enough, and
  // never past the board's edge.
  separatePlates() {
    const board = this.shell?.querySelector?.('.wb-board');
    if (!board?.getBoundingClientRect) return;
    const plates = [...board.querySelectorAll('.wb-plate:not(.wb-line-plate)')];
    for (const plate of plates) plate.style.removeProperty('--nudge');
    const edge = board.getBoundingClientRect(), gap = 6;
    for (let pass = 0; pass < 3; pass++) {
      let moved = false;
      for (let i = 0; i < plates.length; i++) for (let j = i + 1; j < plates.length; j++) {
        const a = plates[i].getBoundingClientRect(), b = plates[j].getBoundingClientRect();
        if (!a.width || !b.width) continue;
        const across = Math.min(a.right, b.right) - Math.max(a.left, b.left), down = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (across <= 0 || down <= 0) continue;
        const [mover, box, other] = plates[i].classList.contains('has-control') ? [plates[j], b, a] : [plates[i], a, b];
        const right = box.left + box.width / 2 >= other.left + other.width / 2;
        const room = right ? edge.right - gap - box.right : box.left - (edge.left + gap);
        const shift = Math.min(across + gap, Math.max(0, room)) * (right ? 1 : -1);
        if (!shift) continue;
        mover.style.setProperty('--nudge', `${(parseFloat(mover.style.getPropertyValue('--nudge')) || 0) + shift}px`);
        moved = true;
      }
      if (!moved) break;
    }
  }

  wireSvg(w, i, sealed) {
    const p = this.puzzle, r = this.result, powered = this.state.sourceOn && !this.state.tripped, topo = wireNodes(this.id, this.state);
    const path = sealed ? this.tracePath(w) : this.wirePath(...w, i), flow = wireFlow(r, i, powered);
    return `<g class="wb-wire ${sealed ? 'wb-wire-sealed' : ''}" data-wire="${i}" data-node="${topo.nodeOf[w[0]]}"><title>${sealed ? 'Soldado a la instalación' : 'Retirar cable'}: ${escapeHtml(this.portLabel(w[0]))} → ${escapeHtml(this.portLabel(w[1]))}</title>${sealed ? '' : `<path d="${path}" class="wb-wire-shadow"/>`}<path d="${path}" class="wb-wire-casing ${wireTone(w, i)}"/>${sealed ? '' : `<path d="${path}" class="wb-wire-highlight"/>`}${flow ? `<path d="${path}" class="wb-wire-flow${flow.forward ? '' : ' reverse'}" style="--flow-seconds:${flow.seconds}s"/>` : ''}${sealed ? w.map(n => { const q = p.ports.find(o => o.id === n); return `<circle cx="${q.x}" cy="${q.y}" r="15" class="wb-solder"/>`; }).join('') : ''}</g>`;
  }
}

// ── Cables on a grid ─────────────────────────────────────────────────────────────────────
// The board (1000 × 500 units) is a grid of 10-unit cells. Each hand cable is found with A*: square
// corners cost extra, piece bodies and other terminals are walls, plates and the other cables are
// costly to run under or alongside, so cables keep their own lanes and cross only when they must.
const CELL = 10, GW = 100, GH = 50;
// How far each kind of piece reaches above and below its terminals' line.
const BODY = { orb: [122, 142], lens: [84, 74], lamp: [52, 48], motor: [42, 44], coil: [36, 42], forge: [56, 40], heater: [40, 40], switch: [32, 36], cloth: [24, 30], joint: [28, 30] };
function routeWires(p, wires, sealedTraces, plates, nodeOf = {}) {
  // Copper of one node may share a lane, as a bus does; copper of another node keeps its distance.
  const hard = new Uint8Array(GW * GH), soft = new Float32Array(GW * GH), used = new Float32Array(GW * GH), mine = new Map();
  const own = node => { if (!mine.has(node)) mine.set(node, new Float32Array(GW * GH)); return mine.get(node); };
  const idx = (x, y) => y * GW + x, cell = q => ({ x: Math.max(0, Math.min(GW - 1, Math.round(q.x / CELL))), y: Math.max(0, Math.min(GH - 1, Math.round(q.y / CELL))) });
  const box = (x0, y0, x1, y1, fn) => { for (let gy = Math.max(0, Math.ceil(y0 / CELL)); gy <= Math.min(GH - 1, Math.floor(y1 / CELL)); gy++) for (let gx = Math.max(0, Math.ceil(x0 / CELL)); gx <= Math.min(GW - 1, Math.floor(x1 / CELL)); gx++) fn(idx(gx, gy)); };
  const P = id => p.ports.find(n => n.id === id);
  for (let gx = 0; gx < GW; gx++) for (const gy of [0, 1, GH - 2, GH - 1]) hard[idx(gx, gy)] = 1;
  for (let gy = 0; gy < GH; gy++) for (const gx of [0, 1, GW - 2, GW - 1]) hard[idx(gx, gy)] = 1;
  for (const c of p.components) {
    const a = P(c.a), b = P(c.b), [up, down] = BODY[c.kind] ?? [30, 30], y = (a.y + b.y) / 2;
    // One cell of clearance all round: a cable never brushes a piece.
    box(Math.min(a.x, b.x) + 8, y - up - 10, Math.max(a.x, b.x) - 8, y + down + 10, i => { hard[i] = 1; });
  }
  const pos = P('positive'), neg = P('negative');
  if (pos && neg) box(pos.x - 36, Math.min(pos.y, neg.y) + 20, pos.x + 36, Math.max(pos.y, neg.y) - 20, i => { hard[i] = 1; });
  for (const r of plates) box(r.x - r.w, r.y - r.h, r.x + r.w, r.y + r.h, i => { soft[i] += 5; });
  // Each terminal's name hangs just under it: cables keep off the words.
  for (const n of p.ports) box(n.x - 40, n.y + 14, n.x + 40, n.y + 42, i => { soft[i] += 9; });
  const lay = (pts, node) => { const n0 = own(node); for (let k = 1; k < pts.length; k++) { const a = cell(pts[k - 1]), b = cell(pts[k]); for (let t = 0, n = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)); t <= n; t++) { const x = Math.round(a.x + (b.x - a.x) * t / (n || 1)), y = Math.round(a.y + (b.y - a.y) * t / (n || 1)); used[idx(x, y)] += 1; n0[idx(x, y)] += 1; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (x + dx >= 0 && x + dx < GW && y + dy >= 0 && y + dy < GH) { used[idx(x + dx, y + dy)] += .35; n0[idx(x + dx, y + dy)] += .35; } } } };
  sealedTraces.forEach(t => lay(t.pts, t.node));
  const portCell = Object.fromEntries(p.ports.map(n => [n.id, cell(n)]));
  // Eight directions, as on a printed circuit board: a trace runs straight or at 45°, and every change of
  // direction is a 45° bend. A square corner is two bends with a diagonal between them.
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const route = (a, b) => {
    const same = own(nodeOf[a]), s = portCell[a], t = portCell[b];
    const near = q => p.ports.some(n => n.id !== a && n.id !== b && Math.abs(portCell[n.id].x - q.x) <= 1 && Math.abs(portCell[n.id].y - q.y) <= 1);
    const open = (x, y) => x >= 0 && y >= 0 && x < GW && y < GH && (!hard[idx(x, y)] || (Math.abs(x - s.x) + Math.abs(y - s.y) <= 1) || (Math.abs(x - t.x) + Math.abs(y - t.y) <= 1)) && !near({ x, y });
    const key = (x, y, d) => idx(x, y) * 9 + d, g = new Map(), from = new Map(), heap = [];
    const push = (f, k) => { heap.push([f, k]); let i = heap.length - 1; while (i > 0) { const j = (i - 1) >> 1; if (heap[j][0] <= heap[i][0]) break; [heap[i], heap[j]] = [heap[j], heap[i]]; i = j; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; } } return top; };
    const octile = (x, y) => { const dx = Math.abs(t.x - x), dy = Math.abs(t.y - y); return Math.max(dx, dy) + .414 * Math.min(dx, dy); };
    const start = key(s.x, s.y, 8); g.set(start, 0); push(octile(s.x, s.y), start);
    let goal = null;
    while (heap.length) {
      const [, k] = pop(), d = k % 9, i = (k - d) / 9, x = i % GW, y = (i - x) / GW, base = g.get(k);
      if (x === t.x && y === t.y) { goal = k; break; }
      for (let nd = 0; nd < 8; nd++) {
        const turn = d === 8 ? 0 : Math.min((nd - d + 8) % 8, (d - nd + 8) % 8);
        if (turn > 1) continue;
        const [dx, dy] = DIRS[nd], nx = x + dx, ny = y + dy;
        if (!open(nx, ny) || (dx && dy && (!open(x + dx, y) || !open(x, y + dy)))) continue;
        const ni = idx(nx, ny), nk = key(nx, ny, nd);
        const cost = base + (dx && dy ? 1.414 : 1) + soft[ni] + Math.max(0, used[ni] - same[ni]) * 6 - Math.min(same[ni], 1) * .4 + turn * 2.5;
        if (cost < (g.get(nk) ?? Infinity)) { g.set(nk, cost); from.set(nk, k); push(cost + octile(nx, ny), nk); }
      }
    }
    if (goal === null) return null;
    const cells = []; for (let k = goal; k !== undefined; k = from.get(k)) { const i = Math.floor(k / 9); cells.push({ x: (i % GW) * CELL, y: Math.floor(i / GW) * CELL }); }
    cells.reverse();
    // Keep the bends only, then lay the first and last straight runs onto the terminals themselves.
    const dir = (u, v) => `${Math.sign(v.x - u.x)},${Math.sign(v.y - u.y)}`;
    const pts = cells.filter((q, k) => k === 0 || k === cells.length - 1 || dir(cells[k - 1], q) !== dir(q, cells[k + 1]));
    const A = P(a), B = P(b), ends = (q, port, next) => (q.y === next.y ? { ...next, y: port.y } : q.x === next.x ? { ...next, x: port.x } : next);
    if (pts.length > 2) { pts[1] = ends(pts[0], A, pts[1]); pts[0] = { x: A.x, y: A.y }; const n = pts.length - 1; pts[n - 1] = ends(pts[n], B, pts[n - 1]); pts[n] = { x: B.x, y: B.y }; }
    else if (pts.length === 2) { pts[0] = { x: A.x, y: A.y }; pts[1] = { x: B.x, y: B.y }; }
    return pts;
  };
  return wires.map(w => { if (!w) return null; const pts = route(w[0], w[1]); if (pts) lay(pts, nodeOf[w[0]]); return pts; });
}

/** Square corners cut at 45°, the way a board's copper traces turn. */
function miter(points, cut = 22) {
  if (points.length < 3) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const [prev, at, next] = [points[i - 1], points[i], points[i + 1]];
    const lin = Math.hypot(at.x - prev.x, at.y - prev.y), lout = Math.hypot(next.x - at.x, next.y - at.y), r = Math.min(cut, lin / 2, lout / 2);
    if (r < 1) { out.push(at); continue; }
    out.push({ x: at.x - (at.x - prev.x) / lin * r, y: at.y - (at.y - prev.y) / lin * r }, { x: at.x + (next.x - at.x) / lout * r, y: at.y + (next.y - at.y) / lout * r });
  }
  out.push(points.at(-1));
  // Two cuts that meet in the middle of a short run leave one point, not two.
  return out.filter((q, i) => i === 0 || Math.hypot(q.x - out[i - 1].x, q.y - out[i - 1].y) > .5);
}

/** A polyline with softened corners, as copper bent around a pin. */
function roundedPath(points, radius = 16) {
  if (points.length < 3) return `M ${points[0].x} ${points[0].y} L ${points.at(-1).x} ${points.at(-1).y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [prev, at, next] = [points[i - 1], points[i], points[i + 1]];
    const lin = Math.hypot(at.x - prev.x, at.y - prev.y), lout = Math.hypot(next.x - at.x, next.y - at.y), r = Math.min(radius, lin / 2, lout / 2);
    if (!(r > .1)) { d += ` L ${at.x} ${at.y}`; continue; }
    const from = { x: at.x - (at.x - prev.x) / lin * r, y: at.y - (at.y - prev.y) / lin * r }, to = { x: at.x + (next.x - at.x) / lout * r, y: at.y + (next.y - at.y) / lout * r };
    d += ` L ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${at.x} ${at.y} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
  }
  return `${d} L ${points.at(-1).x} ${points.at(-1).y}`;
}
