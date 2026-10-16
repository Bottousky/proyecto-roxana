import { terracesAgreement as TERRACES_AGREEMENT } from './puzzle-model.js';
import { quietMountState } from './quiet-mount.js';
// Ohmdal · La Luz. All progress is expressed as observable, persistent world state.
const line = (speaker, text, emotion) => ({ speaker, text, ...(emotion ? { emotion } : {}) });
const d = (...lines) => lines.map(([speaker, text, emotion]) => line(speaker, text, emotion));

// `stranger` is how the player can only describe someone before they have heard that person's
// name; `names` are the words that, said in front of them, make the name known (see learnNames).
export const CHARACTERS = {
  player: { name: 'Vos', role: 'Del Instituto Roxana', color: '#8ad1df' },
  narrator: { name: 'Bitácora', role: 'Observaciones de viaje', color: '#c8bb91' },
  edda: { name: 'Edda', role: 'Cuidadora del Portal', color: '#ecaa78', stranger: 'La muchacha de la escoba', names: ['Edda'] },
  ohm: { name: 'Ohm', role: 'Compañero e instrumento de medida', color: '#81dfe5', stranger: 'El pequeño de bronce', names: ['Ohm'] },
  lumen: { name: 'Maese Lumen', role: 'Reparador de la Plaza', color: '#e3be79', stranger: 'El dueño del taller', names: ['Lumen'] },
  consejera: { name: 'Consejera Ivara', role: 'Custodia de la Red', color: '#c1aceb', stranger: 'La Consejera', names: ['Ivara'] },
  yesca: { name: 'Yesca', role: 'Forjadora de las Terrazas', color: '#e98966', stranger: 'La forjadora', names: ['Yesca'] },
  vega: { name: 'Vega', role: 'Operadora del acueducto', color: '#a2c789', stranger: 'La mujer del canal', names: ['Vega'] },
  nereo: { name: 'Nereo', role: 'Farero mayor', color: '#a9c9e4', stranger: 'El viejo del muelle', names: ['Nereo'] },
  marin: { name: 'Marín', role: 'Panadero de la Plaza', color: '#d7a577', stranger: 'El panadero', names: ['Marín'],
    introduction: 'Marín, panadero. El mejor de la Plaza: somos uno solo, así que no miento.' },
  tala: { name: 'Tala', role: 'Aprendiz y coleccionista de preguntas', color: '#d8ce88', stranger: 'Una aprendiz', names: ['Tala'],
    introduction: 'Soy Tala. Aprendiz. De qué, todavía no decidí.' },
};

/** The name the player registered at the Instituto Roxana (the school's site), or «Vos». */
export function playerName(state) {
  const name = typeof state?.playerName === 'string' ? state.playerName.trim() : '';
  return name || CHARACTERS.player.name;
}
/** Dialogue text with the player's own name where the script says {nombre}. */
export const personalize = (text, state) => String(text ?? '').replaceAll('{nombre}', playerName(state));

/** Whether the player has heard this character's name. Player and narrator are always known. */
export function knowsCharacter(state, id) {
  return !CHARACTERS[id]?.names || !!state?.known?.includes(id);
}
// «Plaza de Ohm» and «Puerta de Ohm» are places, not the little one introducing himself.
const namePattern = word => new RegExp(`(?<![\\p{L}]|de )${word}(?![\\p{L}])`, 'u');
/** A character becomes known when their name is said in a conversation they take part in:
 * «Soy Edda», or someone else greeting them by name. Hearsay about an absent person does not count.
 * Returns the ids learned at this line. */
export function learnNames(lines, index, state) {
  const line = lines?.[index];
  if (!line || !state) return [];
  const present = new Set(lines.map(l => l.speaker));
  const text = personalize(line.text, state), learned = [];
  for (const id of present) {
    const names = CHARACTERS[id]?.names;
    if (!names || state.known?.includes(id)) continue;
    if (names.some(word => namePattern(word).test(text))) { (state.known ||= []).push(id); learned.push(id); }
  }
  return learned;
}
/** Someone the player has not met yet introduces themselves before speaking, unless the
 * conversation itself says their name (then the name arrives in its own time). */
export function withIntroductions(lines, state) {
  if (!Array.isArray(lines) || !state) return lines;
  let result = lines;
  for (const id of new Set(lines.map(l => l.speaker))) {
    const character = CHARACTERS[id];
    if (!character?.introduction || knowsCharacter(state, id)) continue;
    if (lines.some(l => character.names.some(word => namePattern(word).test(personalize(l.text, state))))) continue;
    const at = result.findIndex(l => l.speaker === id);
    result = [...result.slice(0, at), line(id, character.introduction), ...result.slice(at)];
  }
  return result;
}
// What the traveller wrote in the Bitácora about each person; it grows with what they lived together.
const PEOPLE_NOTES = {
  edda: [[[], 'Cuida el Portal, como su abuela. Lo barre todas las mañanas «por si acaso». Dibuja todo, también lo que sale mal.'],
    [['distribution'], 'Copió el dicho del Consejo y, al lado, lo que mostró el cobre, sin tachar ninguno. Dice que los dos cuentan algo de quien los escribió.'],
    [['epilogue_shared'], 'Le costó no señalarle a Tala dónde estaba la reparación. Se aguantó. Va a ser buena maestra.']],
  ohm: [[[], 'Pequeño, de bronce, con un Ω en la panza. Pasó cuarenta años mirando musgo. Mide lo que yo no veo y no adorna las respuestas.'],
    [['beacon_link'], 'Nereo lo conoce. Ohm se equivocó por treinta y seis años y lo aceptó sin drama. Tiene una nota vieja firmada con su Ω que no recuerda haber escrito.']],
  lumen: [[[], 'Reparador de la Plaza. Repite el conjuro de su padre: paño seco, tres vueltas, lámpara nueva. Guarda todo: «no tirar».'],
    [['workshop'], 'Ahora agrega a la receta: «Si no enciende, no gastes otra lámpara antes de mirar el camino». Sigue haciendo tres vueltas porque le gustan.']],
  marin: [[[], 'Panadero de la Plaza. Amasa a oscuras, por el ruido de la masa. El pan de ayer es gratis.'],
    [['beacon_lens'], 'Hizo un pan con forma de Faro. Como faro, pésimo. Como pan, extraordinario.']],
  tala: [[[], 'Aprendiz. Vuelve a contar las rayas de la campana aunque Marín ya las contó: «no es lo mismo confiar que dejar de mirar».'],
    [['epilogue_shared'], 'Encontró sola la reparación vieja bajo la tela. Quiere guardar también el dibujo de cuando no funcionaba.']],
  vega: [[[], 'Cuida el agua desde el Manantial hasta las Terrazas. Canta el orden de las manivelas, como las operadoras viejas. Anota las sequías con la misma letra que la abundancia.'],
    [['irrigation'], 'Antes creía que ser prudente era no tocar nada. Ahora sabe qué mirar después de tocarlo.']],
  consejera: [[[], 'Ivara, Consejera de la Red. Vio arder dos distribuidores. Desconfía de los números que prometen; confía en los sellos y en las palabras de la fundación.'],
    [['distribution'], 'Dejó el plano en la puerta, a la altura de quien quiera leerlo. Agregó al registro: «¿Cómo lo comprobamos?».']],
  yesca: [[[], 'Forjadora de las Terrazas. Sube la palanca hasta que el horno canta. Prefiere diez azadas terminadas que once empezadas. Guarda comida para Vega, aunque discutan.'],
    [['beacon_lens'], 'Le está haciendo una bisagra a Nereo para la puerta de su casa. Va a tardar lo que tenga que tardar.']],
  nereo: [[[], 'Farero mayor. Cuarenta años girando la manivela cada noche aunque nadie viera la señal. Canta el ritmo mientras sube: los fareros no lo escriben en números.'],
    [['beacon_lens'], 'Anoche pudo volver a su casa. Su compañera había puesto una lámpara para que el farero también encontrara la suya.']],
};
/** The traveller's note about someone, as far as the story has gone. */
export function characterNote(id, state = {}) {
  const notes = PEOPLE_NOTES[id] || [];
  return notes.filter(([requires]) => requires.every(flag => state.flags?.[flag])).map(([, text]) => text).join(' ');
}
/** For a save made before names were learned: whom the conversations already seen introduced. */
export function knownFromSeen(state) {
  const probe = { ...state, known: [] };
  for (const id of state?.seen || []) {
    const lines = withIntroductions(DIALOGUES[id], probe);
    if (Array.isArray(lines)) lines.forEach((_, i) => learnNames(lines, i, probe));
  }
  return probe.known;
}
/** What the dialogue box shows for a speaker, given what the player knows so far. */
export function speakerLabel(id, state) {
  const character = CHARACTERS[id] || { name: id || 'Ohmdal', role: '' };
  if (id === 'player') return { ...character, name: playerName(state) };
  if (knowsCharacter(state, id)) return character;
  return { ...character, name: '???', role: character.stranger || '' };
}
/** The world prompt and map label for a person. */
export function personLabel(object, state) {
  const id = object?.character;
  if (!state || !id || !CHARACTERS[id] || knowsCharacter(state, id)) return object?.label;
  return CHARACTERS[id].stranger || object.label;
}

export const DIALOGUES = {
  portal_arrival: d(
    ['narrator', 'El Portal Ω te suelta sobre la piedra tibia. De este lado, la mañana huele a lluvia. El instrumento de viaje del Instituto conserva el norte; tu Bitácora todavía está en blanco.'],
    ['edda', '¡Cruzaste! ¡Alguien cruzó!', 'surprised'],
    ['player', '¿Eso no pasa seguido?'],
    ['edda', 'No desde antes de que yo naciera. Mi abuela recibía acá a los Maestros del Instituto. Yo lo barro todas las mañanas, por si acaso, y hoy fue el «por si acaso». ¡Perdón! Soy Edda. ¿Y vos?'],
    ['player', '{nombre}. Vengo del Instituto Roxana.'],
    ['edda', '{nombre}, del Instituto. Lo voy a anotar en el libro de llegadas con mi mejor letra. Mi abuela se moriría de envidia.', 'happy'],
    ['edda', 'Y justo hoy el pequeño de bronce del pedestal no me contesta. Vení: capaz entre los dos encontramos algo.']),
  edda_portal: d(
    ['edda', 'Limpié el polvo. Giré esa manivela. Hasta le dije por favor.'],
    ['player', '¿Y nada?'],
    ['edda', 'Ahora está limpio. No confundamos resultados. El cristal brilla y él no; eso es lo que tengo.']),
  edda_portal_after: d(
    ['edda', 'Mi cuaderno dice: «El Portal dejó pasar a alguien. Una cajita me discutió». Buen día de trabajo.'],
    ['ohm', 'Instrumento de campo.'],
    ['edda', 'Lo anoto entre paréntesis. Los espero en la Plaza.']),
  portal_arch: d(
    ['narrator', 'Junto a la puerta de los Porteros, un libro de llegadas descansa en su atril. La tapa copia la inscripción del arco: «INSTITUTO ROXANA · MUNDOS APLICADOS». En el margen, otra mano: «Dejen el dibujo junto a la máquina».'],
    ['narrator', 'Las primeras páginas están llenas de firmas: docentes, alumnos, fechas, una mancha de té. Después, años de hojas en blanco. En la última, con letra nueva y todavía fresca: «Hoy: {nombre}, del Instituto».'],
    ['edda', 'Mi abuela anotaba a todos los que cruzaban. Decía que por ahí venían los Maestros. No dijo que trajeran mochilas.']),
  portal_seed: d(
    ['narrator', 'Entre dos raíces hay una placa doblada. El dibujo muestra dos caminos entre una fuente y una pequeña lámpara.'],
    ['narrator', 'Al dorso: «El retorno también es camino». Alguien subrayó «también» tres veces.']),
  awaken_arrival: d(
    ['player', 'No sé arreglar estas cosas.'],
    ['edda', 'Yo tampoco arreglé una que pudiera contestarme. Mirá esas puntas sueltas: parecen encajar en los broches.'],
    ['player', '¿Eso lo va a despertar?'],
    ['edda', 'No sé. Podemos cambiar una cosa y mirar qué pasa.']),
  awaken_complete: d(
    ['ohm', 'Energía detectada. Desplazamiento… funcional.', 'surprised'],
    ['edda', '¿Eso significa que estás bien?'],
    ['ohm', 'Significa que puedo desplazarme. Soy Ohm.'],
    ['player', 'Con una sola conexión no pasaba nada. Con las dos, sí.'],
    ['ohm', 'Mientras dormía, lo veía todo quieto. El cobre está lleno de cargas diminutas. Ninguna se movía.'],
    ['ohm', 'Con la segunda conexión, la celda pudo empujarlas a dar la vuelta entera. Se movieron todas a la vez, como la cadena de una bicicleta.'],
    ['player', '¿Y se gastan al pasar por vos?'],
    ['ohm', 'No. Vuelven a la celda. Lo que me dejan al pasar es energía: con eso late esto.'],
    ['ohm', 'Lo que no dispongo es de una explicación para haber pasado tanto tiempo mirando musgo.'],
    ['edda', 'Una cadena que da vueltas: eso lo puedo dibujar. Y Lumen va a querer conocerte. Su taller está en la Plaza: subí por el camino del norte.']),
  ohm_pedestal_after: d(
    ['narrator', 'El asiento de bronce conserva la huella de Ohm. Dos caminos de cobre unen el cristal con el lugar donde descansaba.'],
    ['ohm', 'Cuarenta años mirando la misma pared. Tu compañía mejora sensiblemente el paisaje.']),
  portal_locked: d(['edda', 'Antes de irnos, ayudemos al pequeño de bronce. Si despierta, tal vez quiera venir. Preguntarle dormido no cuenta.']),

  plaza_arrival: d(
    ['narrator', 'La Plaza de Ohm conserva guirnaldas para una fiesta que nadie ha cancelado del todo. Entre las últimas casas, la Calzada sigue el agua hacia la Puerta de Ohm.'],
    ['ohm', 'Reconozco esta plaza. No recuerdo de cuándo. Es una sensación poco calibrada.'],
    ['edda', 'El taller de Lumen está a la izquierda apenas entrás a la Plaza, del lado oeste. Si algo zumba, huele a aceite y tiene demasiadas tazas, es ahí.']),
  edda_plaza: d(
    ['edda', 'Cada noche, Nereo sube al Faro y hace girar la manivela. Desde acá no se ve ninguna señal. Igual vuelve a subir.'],
    ['edda', 'Voy a revisar la Calzada. Si averiguo algo, te guardo la parte interesante. La parte peligrosa la discutimos.']),
  edda_plaza_after: d(
    ['edda', 'Las ventanas del taller ya se ven desde la fuente. La gente dice que volvió la buena suerte.'],
    ['ohm', 'Propuesta: conservar la suerte, agregar el esquema.'],
    ['edda', 'Por una vez no tengo nada que corregirte. No te acostumbres.']),
  marin_before: d(
    ['marin', 'Mi horno funciona. Las luces, no. Hace meses que amaso por el ruido de la masa.'],
    ['marin', '¿Tienen hambre? El pan de ayer es gratis. El de hoy también, si me dicen cuál es cuál.']),
  marin_after: d(
    ['marin', '¡Luz en el taller! Lumen volvió a abrir las contraventanas. Juraría que hasta su pan tiene mejor aspecto.'],
    ['ohm', 'El aspecto no modifica la fecha de elaboración.'],
    ['marin', 'Qué compañero tan difícil para un panadero. Llevátelo a pasear.']),
  plaza_fountain: d(
    ['narrator', 'La fuente tiene una línea clara donde antes llegaba el agua. Bajo la taza central, una tubería apunta a las colinas.'],
    ['player', '¿El agua viene de allá?'],
    ['ohm', 'La tubería sigue en esa dirección. El agua, por el momento, no.']),
  plaza_fountain_after: d(
    ['narrator', 'El agua del Manantial recorre de nuevo la piedra gastada. Una moneda diminuta aparece entre las ondas.'],
    ['ohm', 'Deseo recomendado: mantenimiento periódico.']),
  plaza_statue: d(
    ['narrator', 'Una figura de piedra sostiene un cuaderno abierto, no una espada. Su nombre está gastado: «ROX…».'],
    ['edda', 'La llaman la Primera Maestra. Mi abuelo decía que la estatua no se le parece: ella nunca se quedaba quieta.']),
  plaza_bell: d(
    ['narrator', 'Hay cuarenta rayas pequeñas en el interior de la campana. Una por cada fiesta sin señal del Faro.'],
    ['narrator', 'La última tiene una nota: «Este año compramos igual las cintas. —N.»']),
  plaza_road_locked: d(['ohm', 'La Calzada está aislada. Lumen conserva el instrumento con el que podremos investigar su panel. Visitemos su taller.']),

  workshop_arrival: d(
    ['lumen', 'Dejalo ahí.'],
    ['player', 'Ni lo toqué.'],
    ['lumen', 'Estabas por tocarlo. Todos ponen esa cara. Lumen, reparador. «Maese Lumen» para los que me deben una lámpara.'],
    ['lumen', 'Pasá: si vas a curiosear, te consigo un lugar en el banco.'],
    ['ohm', 'Su voz se parece a otra que recuerdo.'],
    ['lumen', 'Mi padre, seguramente. Tenía mejor oído y peores modales. Los dos cierres de la mesa están sueltos; se ajustan desde los costados.']),
  lumen_before: d(
    ['lumen', 'Paño seco. Tres vueltas al contacto. Lámpara nueva. «La Luz vuelve a quien la atiende».'],
    ['player', '¿Eso es una receta o un conjuro?'],
    ['lumen', 'Es lo que quedó de los Maestros. Las palabras sobrevivieron; el porqué se lo llevaron ellos.'],
    ['player', '¿Por qué tres?'],
    ['lumen', 'Mi padre hacía tres. Yo también. Hasta ayer alcanzaba.'],
    ['player', '¿Y si la lámpara no era lo que fallaba?'],
    ['lumen', 'Hacía años que nadie venía a molestarme con una pregunta de ésas. Acercá el instrumento.'],
    ['narrator', 'Lumen encaja el cierre izquierdo de la mesa con un clic seco, sin mirarlo. El derecho queda para vos.']),
  workshop_ready: d(
    ['narrator', 'La mesa recupera un zumbido bajo. La lámpara sigue oscura.'],
    ['lumen', 'Escuchá. Ese ruido sí lo conozco. Ahora podemos mirar el banco.']),
  workshop_locked: d(['lumen', 'Los dos cierres de la mesa están separados. Uno a cada costado, al final de los cables del piso: acercate a cada uno y unilo.']),
  workshop_locked_left: d(['lumen', 'El derecho ya está unido. Falta el izquierdo, al final del otro cable del piso. Acercate y unilo.']),
  workshop_locked_right: d(['lumen', 'El izquierdo ya está. Falta el derecho, al final del cable del piso. Que Ohm lo mida antes y después de unirlo.']),
  workshop_arrival_puzzle: d(
    ['lumen', 'La cubierta está entera. La lámpara, recién cambiada. Y sin embargo…'],
    ['player', '¿Podemos mirar lo de adentro sin romperlo?'],
    ['ohm', 'Puedo comprobar si hay paso entre dos puntos. Primero hay que apagar el banco.'],
    ['lumen', 'Un aparato de los Maestros. Mi padre guardaba los suyos en un cajón: decía que la Luz se ofende si la cuentan.'],
    ['player', '¿Y vos qué decís?'],
    ['lumen', 'Que mi padre también cambiaba tres lámparas. Bien: dejemos quieta la lámpara por una vez.']),
  workshop_complete: d(
    ['lumen', 'Ahí está. Brillo firme. Y sin ese olor a tela cocinada.'],
    ['lumen', 'Así que no era la Luz ofendida. Era un hilo cortado adentro de la tela. No sé si eso me alivia o me ofende a mí.'],
    ['player', 'La lámpara era la misma. Lo que cambiamos fue el camino hasta ella.'],
    ['ohm', 'Coincidencia registrada. La explicación es más larga: la dejé en la Bitácora. El tramo viejo conviene guardarlo para comparar.'],
    ['lumen', 'Dejá el viejo acá. No lo voy a tirar. Mis dedos reconocen una unión floja, pero mañana mis dedos no le sirven a otro.'],
    ['player', 'Podemos dejar el dibujo y lo que probamos.'],
    ['lumen', 'Y el instrumento a mano. Llévenlo hoy; cuando vuelvan les cuento cómo salió la cuarta lámpara.'],
    ['ohm', '¿La reemplazará de nuevo?'],
    ['lumen', 'Era un chiste, pequeño. Te falta aceite en esa parte.']),
  lumen_after: d(
    ['lumen', 'La receta sigue acá. Le agregué: «Si no enciende, no gastes otra lámpara antes de mirar el camino».'],
    ['player', 'Ocupa más papel.'],
    ['lumen', 'Y menos estante. En la Calzada tienen el cerrojo atrancado. Le engrasé hasta lo que no se mueve; ahora les toca mirar.'],
    ['lumen', 'Si un día te sobra la tarde, el cajón del mostrador tiene mis piedras de freno. Las elijo por temperamento. Tu instrumento capaz que las elige por otra cosa.']),
  drawer_locked: d(['lumen', 'Ese cajón es para después. Primero la lámpara del banco.']),
  drawer_arrival: d(
    ['narrator', 'Lumen abre el cajón del mostrador. Piedras de cerámica, cada una con anillos pintados y unas muescas talladas en la punta.'],
    ['lumen', 'Mis piedras de freno. Las elijo por temperamento: las de rojo con rojo frenan como un buey. Mi padre decía «la dorada miente, pero no traiciona».'],
    ['player', '¿Y las muescas?'],
    ['lumen', 'Son mías. Yo el rojo y el verde no los distingo: para mí son el mismo color, más claro o más oscuro. Las conozco por el peso y por las muescas.'],
    ['ohm', 'Puedo pesar el freno: cuánto le cuesta a la corriente atravesar cada piedra. Con la mesa apagada y mi propia pila.'],
    ['lumen', 'Pesá las que quieras. Y guardo una en el puño: esa no se pesa hasta que me digas cuánto frena.']),
  drawer_complete: d(
    ['lumen', '¿Así que los anillos son un número? Dos cifras y cuántos ceros. Toda la vida leyendo temperamento.'],
    ['player', 'El temperamento era el número. Tus manos lo sabían antes que los ojos.'],
    ['lumen', 'Y la dorada mintió poquito, como decía mi padre. Esto lo anoto con números. Que no se entere el Consejo.'],
    ['ohm', 'Dejé los pesos en la Bitácora, junto a una rueda de colores. Se completa sola, piedra por piedra.']),
  drawer_after: d(['lumen', 'Les pinté la cifra al lado de las muescas. Las muescas las dejé: me gustan.']),
  workshop_note: d(
    ['narrator', 'Una hoja está manchada de aceite y corregida por cuatro manos. La última corrección no borra las otras: dibuja la pieza gastada.'],
    ['lumen', 'Edda me dijo que repetir una reparación cien veces no explica por qué anda. Le dije que me alcanzara el paño.'],
    ['player', '¿Y qué hizo?'],
    ['lumen', 'Me alcanzó el paño. Y volvió a preguntar.'],
    ['narrator', 'En el margen queda una firma antigua: «Roxana — Si puede repetir la reparación pero no contar qué observó, todavía no terminamos».']),
  workshop_cup: d(
    ['narrator', 'Cinco tazas distintas, todas reparadas. Una tiene escrito: «Para cuando vuelvas».'],
    ['ohm', 'El asa de esa taza… Mi registro se interrumpe ahí.'],
    ['lumen', 'No hace falta recordar todo hoy. Esa taza sabe esperar.']),
  workshop_bench_after: d(['narrator', 'El instrumento queda junto al contacto reparado. La lámpara ilumina un esquema recién terminado.'], ['ohm', 'El tramo viejo sigue sobre la mesa. Lumen puso «no tirar» en un objeto más.']),

  road_arrival: d(
    ['edda', '¡Acá! Encontré tres cosas raras desde que nos vimos.'],
    ['player', 'Yo ayudé a encender el taller.'],
    ['edda', 'No estamos compitiendo.'],
    ['player', 'Vos empezaste contando.'],
    ['edda', 'Cuatro cosas raras. Mirá ese puente de cobre en el medio: no aparece en el dibujo de la puerta.']),
  road_edda: d(
    ['edda', 'Un cable viene del poste oeste. Otro se pierde bajo las hojas al este. Y alguien unió los dos en el medio.'],
    ['player', '¿Para ayudar a la puerta?'],
    ['edda', 'Eso pensé. Después seguí el dibujo y ya no estoy tan segura. Probá algo; yo miro las balizas.']),
  road_ready: d(
    ['narrator', 'Las balizas de la Calzada se encienden una tras otra. Dentro de la puerta, algo responde con un golpe lento.'],
    ['edda', 'Llegó. Pero el cerrojo no levanta. Su regulador está junto a la puerta: abrilo y mirá su mesa.']),
  gate_locked: d(['edda', 'Todavía no responden las balizas. Hay cierres en los dos postes y un puente en el centro. El dibujo viejo no tiene ese puente.']),
  // What is still missing, said plainly (ciclo 30: players stood at the regulator not knowing why).
  gate_locked_bridge: d(['edda', 'El puente de cobre del centro sigue unido: con él, la corriente vuelve antes de llegar a la puerta. Probá levantarlo.']),
  gate_locked_west: d(['edda', 'El puente ya no está. Falta unir el cierre del poste oeste, a la izquierda del camino: por ahí llega la ida.']),
  gate_locked_east: d(['edda', 'El puente ya no está. Falta unir el cierre bajo las hojas, en el poste este, a la derecha del camino: por ahí vuelve la corriente.']),
  gate_arrival: d(
    ['edda', 'El cerrojo hace fuerza… pero para abajo. ¿No tendría que levantar?'],
    ['edda', 'Mi abuela decía que los guardianes de la Calzada le hablaban a la Puerta: «Cede a quien te da toda la Luz». Alguien les hizo caso: por eso ese puente.'],
    ['edda', 'Y en el zócalo del cerrojo dejaron un puente de cobre, sin piedra. Traje la bolsa de piedras de freno de mi abuela. Ella las elegía por los anillos, «por el temperamento».'],
    ['player', '¿Qué cambia entre empujar para arriba y para abajo?'],
    ['ohm', 'Puedo mostrar el sentido de la lectura. La placa conserva las marcas de trabajo del cerrojo.'],
    ['edda', 'Bueno. Algo para comparar.']),
  gate_complete: d(
    ['narrator', 'El cerrojo asciende. Por primera vez en años, la Calzada no termina en una pared.'],
    ['player', 'Cambió el sentido. Y con la piedra justa en el zócalo, levantó sin atascarse.'],
    ['edda', 'Con toda la Luz golpeaba. Le voy a decir a mi abuela que la Puerta prefería que le hablaran más despacio.'],
    ['edda', 'Lo voy a dibujar con el puente y con la piedra. Si dibujo sólo la buena, después parece que adiviné.'],
    ['edda', 'Del otro lado hay agua. La escuché detrás de la puerta cada vez que vine. No sabés cuánto quería comprobarlo.'],
    ['ohm', 'Distancia hasta la próxima pregunta: aproximadamente un camino.']),
  road_after: d(['edda', 'Voy a adelantarme al Castillo. Si la Consejera pregunta quién abrió la puerta, voy a decir la verdad. Con una pausa teatral.']),
  road_memorial: d(
    ['narrator', 'Un viejo cartel ordena: «GOLPEAR TRES VECES ANTES DE ACCIONAR». Debajo del poste, las vibraciones han dejado un contacto pulido.'],
    ['player', '¿Los golpes movían esa unión?'],
    ['ohm', 'El cartel da la orden. No dice qué pasaba cuando nadie golpeaba.']),
  road_nest: d(
    ['narrator', 'Un nido ocupa la antigua caja de fusibles. Está vacío, salvo por una pluma y un alambre brillante.'],
    ['ohm', 'La comunidad local encontró un uso alternativo para una instalación fuera de servicio. Bien por la comunidad.']),
  road_exit_locked: d(['edda', 'El panel del cerrojo está junto a la puerta. Ya tenemos una buena razón para abrirlo.']),

  spring_arrival: d(
    ['narrator', 'El Manantial canta detrás de una compuerta. La rueda está quieta. El agua encuentra su propio camino hacia el río.'],
    ['vega', 'Cuidado con el borde. La piedra verde resbala incluso cuando una cree que ya aprendió.'],
    ['vega', 'Soy Vega; cuido el agua desde acá hasta las Terrazas. Ustedes abrieron la Puerta: el golpe se oyó hasta la compuerta.'],
    ['player', '¿Vos apartaste el agua de la rueda?'],
    ['vega', 'Después de la avería. La Plaza se quedó sin fuente, pero el canal dejó de desbordar. Cada decisión moja algún patio.']),
  vega_spring: d(
    ['vega', 'La manivela izquierda devuelve agua a la rueda. La derecha une su eje con esa máquina. Siempre se hacía en ese orden.'],
    ['vega', 'Las operadoras lo cantábamos: «Primero el agua, después el eje; al revés, la rueda se ofende». Nunca supe si la rueda se ofendía. Nadie quiso averiguarlo.'],
    ['player', '¿Podemos probar?'],
    ['vega', 'Podemos. Voy a mirar el nivel de abajo. Querer nunca fue el problema.']),
  spring_ready: d(
    ['narrator', 'La corriente de agua alcanza los álabes. El acople vibra, toma el movimiento y un indicador eléctrico cobra vida.'],
    ['player', 'La rueda se mueve y el indicador encendió. Pero la bomba sigue quieta.'],
    ['vega', 'Como aquella mañana. Acerquémonos antes de pedirle más agua.']),
  // The operators' song, put to the test: the axle coupled before the water reached the wheel.
  spring_ready_backwards: d(
    ['narrator', 'El agua alcanza los álabes. La rueda, ya enganchada al generador, arranca a tirones: el acople cruje antes de tomar el movimiento. Un indicador eléctrico cobra vida.'],
    ['vega', 'Al revés. Y no se ofendió: arrancó pesada, nada más. Quieta y enganchada, la rueda tiene que mover la máquina entera de golpe. Para eso era el canto.'],
    ['player', 'Se mueve y el indicador encendió. Pero la bomba sigue quieta.'],
    ['vega', 'Como aquella mañana. Acerquémonos antes de pedirle más agua.']),
  unjoin_workshop_feed: d(['lumen', 'Ese cierre lo encajé yo. Suelto, la mesa se queda sin ida. Mirá lo que quieras y después volvé a encajarlo.']),
  unjoin_lake_cable: d(['nereo', 'Esa bornera la fijé yo. Suelta, nada baja hacia el Faro. Mirá las balizas, si querés, y volvé a fijarla.']),
  unjoin_tower_feed: d(['nereo', 'La ida de la base la uní yo. Abierta, el núcleo se queda callado. Cerrala cuando termines de mirar.']),
  unjoin_tower_return: d(['nereo', 'Ese retorno lo uní yo. Sin vuelta, el núcleo no puede devolver lo que recibe: se queda callado. Cerralo cuando termines de mirar.']),
  unjoin_tower_shutter: d(['nereo', 'El obturador lo abrí yo. Cerrado, la luz se queda adentro de la torre.']),
  unjoin_tower_lens_free: d(['nereo', 'El freno de la lente lo solté yo. Si lo volvés a poner, la lente no gira con la corona.']),
  pump_locked: d(['vega', 'Todavía falta transmitir el movimiento. Son dos manivelas: una junto al canal, a la izquierda del camino, devuelve el agua a la rueda; la otra, a la derecha, junto a la rueda, une su eje con el generador. Primero el agua.']),
  pump_arrival: d(
    ['vega', 'Esa unión junto al agua se entibia cuando la bomba intenta arrancar. Antes no lo hacía.'],
    ['vega', 'Y sin embargo deja pasar. Las viejas decían «por donde pasa el agua, pasa la Luz». Unión que deja pasar, no roba.'],
    ['player', 'En el taller había un corte. ¿Acá también?'],
    ['ohm', 'Podemos comparar. Hay una lectura con la bomba apagada y otra mientras intenta trabajar.'],
    ['vega', 'Mirá en los dos lados de la unión. Yo vigilo el canal.'],
    ['vega', 'Y después quiero saber adónde se van los doce que da la rueda. Si a la bomba no le llegan, alguien se los queda. Los voy a ir sumando.']),
  pump_complete: d(
    ['narrator', 'La bomba toma aire, tose una vez y llena el primer conducto. El agua corre hacia la Plaza.'],
    ['vega', 'Ese sonido. Pensé que lo había olvidado. Era el comienzo de mis mañanas.'],
    ['vega', 'Y mirá el canal viejo, el que baja del Monte Quieto: volvió a traer agua. La Casa de Compuertas está callada desde antes de que yo naciera.'],
    ['player', 'No alcanzaba con que el camino estuviera unido. Esa unión vieja estaba haciendo otra cosa cuando la bomba trabajaba.'],
    ['ohm', 'Guardé las dos lecturas: con la bomba quieta y trabajando. Una sola habría contado menos.'],
    ['vega', 'El Castillo decide el reparto. Voy a las Terrazas a preparar los canales. Cuando llegues, no vas a encontrarme esperando.']),
  spring_after: d(['vega', 'La marca de agua sube despacio. Es buena señal: una instalación estable no necesita demostrar su fuerza todo el tiempo.']),
  // Minijuegos (ciclo 29): vecinos con un problema chico, un concepto cada uno, antes de la bomba.
  pump_locked_tala: d(['vega', 'Antes de abrir la caja, Tala tiene una pregunta sobre su farol. Respondésela: acá vamos a necesitar lo mismo.']),
  tala_spring_ask: d(
    ['tala', 'La fuente de la Plaza se secó. Vine a ver de dónde sale el agua.'],
    ['tala', 'Vega dice que hay que mirar dónde se queda la fuerza. Yo traje mi farol: ¿dónde está su fuerza?'],
    ['player', 'La fuerza se compara entre dos puntos. Probemos con el tuyo.'],
    ['ohm', '«Comparar dos puntos»: dos puntas, dos lugares. Nunca uno solo.']),
  tala_lantern_complete: d(
    ['tala', 'En el farol, casi seis. En el cordón, casi nada. Y por los dos pasa lo mismo.'],
    ['player', 'La fuerza se queda donde se trabaja. El cobre sano sólo deja pasar.'],
    ['tala', 'Lo anoto. Ahora quiero ver la bomba de Vega: si una unión se queda con fuerza, se va a notar.']),
  tala_spring_after: d(['tala', 'Si un cordón sano casi no se queda con nada, una unión que se queda con mucho… ¿es una ladrona?']),
  marin_spring_ask: d(
    ['marin', 'Sin agua en la fuente no hay masa. Vine con el carro a buscar un poco.'],
    ['marin', 'Y mirá mis faroles: el de atrás brilla más que el de adelante, y están en la misma fila. ¿Quién se queda con más fuerza?'],
    ['ohm', 'Si comparás los dos extremos de cada farol, Marín puede sumar. Le gustan las cuentas que cierran.']),
  marin_cart_complete: d(
    ['marin', 'Cuatro y ocho, doce. ¡Lo mismo que empuja la batería!'],
    ['player', 'En una sola vuelta, la fuerza se reparte entre los que están en fila. El que más frena, más se queda.'],
    ['marin', 'Como el pan entre los vecinos: ninguno se pierde, cada uno se queda con su parte. Tala va a decir que conté mal.']),
  marin_spring_after: d(['marin', 'Ahora cuento voltios además de panes. Tala dice que es lo mismo. Yo digo que el pan se come.']),
  edda_contact_locked: d(['edda', 'Primero la puerta. La baliza esperó años: puede esperar un rato más.']),
  edda_contact_ask: d(
    ['edda', 'Esa baliza del costado brilla a medias desde que tengo memoria.'],
    ['edda', 'Mi abuela decía que el contacto del poste «se queda con un pedazo». Nunca supe un pedazo de qué.'],
    ['player', 'Con la baliza encendida, comparando los extremos de cada pieza se ve dónde se queda la fuerza.']),
  edda_contact_complete: d(
    ['edda', 'La mitad. El contacto se quedaba con la mitad, y sólo tenía que dejar pasar.'],
    ['player', 'Dejaba pasar, pero no entregaba todo. Con el puente, la baliza recibe lo suyo.'],
    ['edda', 'Se lo voy a contar a la abuela. Bueno, a su cuaderno. Ella lo va a saber igual.']),
  edda_contact_after: d(['edda', 'La baliza ya no parpadea. Me había acostumbrado a que sí.']),
  spring_levels: d(
    ['narrator', 'En un muro hay fechas y alturas. Los años de sequía están escritos con la misma letra que los de abundancia.'],
    ['vega', 'Las dos cosas hay que anotarlas. Si sólo recordás lo que salió bien, el río te sorprende dos veces.']),
  spring_bottle: d(
    ['narrator', 'Una botella guarda una nota seca: «El agua vuelve. Yo también. —Vega, 17 años».'],
    ['ohm', 'Predicción de largo plazo. Resultado favorable.']),
  spring_exit_locked: d(['ohm', 'La ruta del Castillo sigue sin servicio. Restaurar la bomba permitirá que el Manantial sostenga la red.']),

  castle_arrival: d(
    ['consejera', 'La Red permanece sellada.'],
    ['player', 'Abrimos la Calzada. Tal vez podamos ayudar acá.'],
    ['consejera', 'Soy Ivara, Consejera de la Red. Quienes estaban antes también podían repararla. La repararon. Tres días después ardieron dos distribuidores.'],
    ['consejera', 'Traían números. Los números prometían. La Luz no cumple promesas: se la respeta, se la sella y se le habla con las palabras viejas.'],
    ['edda', 'No podemos descubrir qué pasa con todo apagado.'],
    ['consejera', 'Tampoco incendiando la ciudad. Encuentren una prueba que no ponga en riesgo lo que aún funciona.']),
  consejera_before: d(
    ['consejera', 'El agua entró por la rama del archivo oeste. Cerramos toda la red. La enfermería y la cocina quedaron a oscuras.'],
    ['consejera', 'El Consejo lo dice desde la fundación: «La Luz es una sola: lo que se le da a una casa, se le quita a otra». Si una enferma, se sella todo.'],
    ['player', '¿Ese sector puede separarse de los otros?'],
    ['consejera', 'Las placas identifican los cierres. Quiero que me muestren qué queda aislado antes de reabrir servicios.']),
  castle_edda: d(
    ['edda', 'Encontré planos debajo del decreto de clausura. El sello tapaba justo el punto donde el circuito se divide.'],
    ['player', 'Si separamos el camino al archivo, ¿podrían seguir los demás?'],
    ['edda', 'Eso creo. Antes lo habría escrito como un descubrimiento. Ahora le voy a poner un signo de pregunta.'],
    ['edda', 'Y si el dicho del Consejo es cierto, la Luz es una sola: con la cocina en su propio camino, la enfermería tendría que brillar menos.'],
    ['player', '¿Vos lo creés?'],
    ['edda', 'Lo copié tal cual, con espacio al lado. Ahí va lo que muestre el cobre, aunque contradiga al Consejo.']),
  castle_ready: d(
    ['consejera', 'Puedo seguir el cierre hasta el archivo. La enfermería y la cocina quedan de este lado.'],
    ['player', '¿Podemos mirar el tablero ahora?'],
    ['consejera', 'Con ese sector aislado, sí. Yo me quedo.']),
  distribution_locked: d(['consejera', 'Aíslen primero la rama oeste dañada. El otro seccionador conecta el troncal de servicio. Las placas identifican ambos.']),
  // What is still missing, said plainly (ciclo 30).
  distribution_locked_both: d(['consejera', 'Dos seccionadores, uno a cada lado del patio. Primero el de la izquierda: separa el archivo oeste, que está dañado. Después el de la derecha, que conecta el troncal de servicio. En ese orden; al revés, la protección salta.']),
  distribution_locked_archive: d(['consejera', 'El troncal ya está conectado. Falta separar el archivo oeste: su seccionador está a la izquierda del patio.']),
  distribution_locked_trunk: d(['consejera', 'El archivo ya está separado. Falta conectar el troncal de servicio: su seccionador está a la derecha del patio.']),
  distribution_arrival: d(
    ['consejera', 'El indicador confirma que el archivo quedó separado en el patio. Debe seguir así durante la prueba.'],
    ['consejera', 'Y una cosa más. Algún día alguien va a tener que reparar la cocina. Ese día, la enfermería no se puede apagar.'],
    ['edda', '¿Nos pide que lo probemos?'],
    ['consejera', 'Les pido que me lo muestren. En el tablero hay una llave para aislar la cocina. Quiero ver la enfermería encendida mientras tanto.'],
    ['ohm', 'Puede comprobarse.'],
    ['consejera', 'Esa es la primera palabra tranquilizadora que escucho hoy.']),
  distribution_complete: d(
    ['narrator', 'Las ventanas de la enfermería y la cocina encienden sus faroles por separado. El archivo clausurado permanece oscuro.'],
    ['consejera', 'La cocina aislada y la enfermería encendida. Lo vi. El archivo sigue separado y los dos servicios funcionan. Ahora puedo retirar el sello.'],
    ['player', '¿Confía en nosotros?'],
    ['consejera', 'Ahora tenemos una forma de comprobarlo. Eso vale más que una promesa.'],
    ['edda', 'Dejemos el plano a la vista.'],
    ['consejera', 'En la puerta. A la altura de quien quiera leerlo.']),
  consejera_after: d(
    ['consejera', 'Dejé una casilla nueva en el registro de intervenciones: «¿Cómo lo comprobamos?».'],
    ['consejera', 'No reemplaza la responsabilidad. La vuelve algo que se puede compartir.'],
    ['consejera', 'Y no borré el dicho de la fundación. Debajo escribí: «Cada camino, su Luz». Que lo discutan los que vengan.']),
  castle_archive: d(
    ['narrator', '«Año 1: intercambio de aprendices». «Año 19: visita pospuesta». «Año 27: se solicita nuevamente un docente». La última carta no tiene respuesta.'],
    ['ohm', 'Instituto Roxana. Esa era nuestra dirección.'],
    ['edda', 'Cuando vuelvas, llevá esa pregunta. Acá la estuvimos guardando bastante.']),
  castle_hidden: d(
    ['narrator', 'En el reverso de un estandarte hay un plano de la red bordado con hilo de cobre. Alguien lo escondió a plena vista.'],
    ['consejera', 'Mi madre lo mandó bordar. Creí que era una imagen de nuestras tierras. Tal vez quiso que fuera las dos cosas.']),
  castle_exit_locked: d(['consejera', 'Las Terrazas necesitan una distribución estable. Terminen el tablero y abriré el paso de servicio.']),

  terraces_arrival: d(
    ['yesca', 'Si vienen a decirme que trabaje menos, pueden ahorrarse la caminata.'],
    ['player', 'No veníamos a decir eso.'],
    ['ohm', 'Todavía no hemos determinado qué veníamos a decir.'],
    ['vega', 'Cuando sube tu horno, Yesca, baja mi bomba. Lo vi otra vez esta mañana.'],
    ['yesca', 'Mi forja hace las herramientas que cultivan tu comida.'],
    ['vega', 'Y mi comida fabrica herreros.'],
    ['ohm', 'Las dos tienen razón. El cable de la ladera es uno solo.']),
  yesca_before: d(
    ['yesca', 'Necesitaba más calor. Subí la palanca hasta que el horno cantó. Así se le pide.'],
    ['player', '¿Y ese cable ennegrecido?'],
    ['yesca', 'Funcionó primero. Si el horno tiene que compartir el cable con el riego, que sea en la mesa de Vega, donde se ve lo que toma cada uno. Quiero diez azadas terminadas, no once empezadas.']),
  vega_terraces: d(
    ['vega', '¿Ves la parcela del fondo? Antes recibía agua primero. Ahora la de arriba bebe de más y la última espera.'],
    ['player', 'Podemos abrir el canal y mirar hasta dónde llega.'],
    ['vega', 'La rueda está junto a mi puesto. Después miramos el tablero. Quiero saber quién paga cada cambio que hacemos acá arriba.']),
  water_ready: d(
    ['narrator', 'El horno queda en el tablero compartido. La compuerta abre el camino a los bancales.'],
    ['yesca', 'Lo que me toque, que alcance. Ahora repartamos el cable, sin malgastarlo.']),
  irrigation_locked: d(['vega', 'Primero, todo a la misma mesa: el horno de Yesca pasa al tablero compartido y el canal se abre. Las dos manivelas están junto a nuestros puestos.']),
  // What is still missing, said plainly (ciclo 30).
  irrigation_locked_both: d(['vega', 'Antes de abrir el tablero, dos manivelas al fondo de las Terrazas: a la izquierda, junto a la forja de Yesca, la que pasa el horno a la mesa compartida; a la derecha, junto a mi casa, la que abre el canal.']),
  irrigation_locked_forge: d(['vega', 'El canal ya está abierto. Falta pasar el horno a la mesa compartida: la manivela del fondo a la izquierda, junto a la forja de Yesca.']),
  irrigation_locked_channel: d(['vega', 'El horno ya está en la mesa compartida. Falta abrir el canal: la manivela del fondo a la derecha, junto a mi casa.']),
  irrigation_arrival: d(
    ['vega', 'El agua sale con demasiada fuerza y el lecho está demasiado caliente. Y el horno de Yesca tira del mismo cable.'],
    ['yesca', 'La ladera da una sola Luz: el fuego que yo suelto, se lo bebe el agua. Lo sabe cualquier forjadora.'],
    ['yesca', 'El cable de la ladera aguanta lo que aguanta. Si me dan menos calor, hago menos por tanda. Si no me dan nada, no hay azadas.'],
    ['vega', 'Y si las raíces se enfrían, la última parcela no llega. Decidámoslo con la bomba trabajando: una altura en un canal vacío no me dice nada.']),
  irrigation_complete: d(
    ['narrator', 'El primer bancal se llena. Luego el segundo. En la forja, Yesca retoma su martillo al ritmo de la rueda.'],
    ['yesca', 'Diez azadas. Y tomates para quien hace las azadas. Me parece un trato bastante bueno.'],
    ['yesca', 'En la ladera se dice que el fuego que suelto se lo bebe el agua. Frenaron mi horno y las raíces ni se enteraron. Años peleando por un fuego que no nos quitábamos.'],
    ['yesca', 'Menos por tanda. Más tandas sin parar. Odio cuando algo razonable suena tan poco espectacular.'],
    ['vega', 'Voy a anotar las alturas y las lecturas. Si mañana cambian, tenemos con qué comparar.'],
    ['vega', 'El sendero del lago está abierto. Nereo los espera. Si dice que no, miren cuántas tazas puso.']),
  yesca_after: d(['yesca', 'El hierro tarda lo que tarda. Antes discutía con él. Ahora uso ese rato para almorzar.'], ['ohm', '¿Y qué se almuerza mientras el hierro se calienta?'], ['yesca', 'Pan de Marín. Hoy salió entero.']),
  vega_after: d(['vega', 'Durante años pensé que ser prudente era no tocar nada.'], ['player', '¿Y ahora?'], ['vega', 'Ahora sé qué mirar después de tocarlo. Todavía voy a recorrer los canales. Pero ya no sólo para lamentarme.'], ['vega', 'La canción de las manivelas la sigo cantando. Ahora sé qué hace cada verso, y me gusta igual.']),
  terraces_marker: d(
    ['narrator', 'Las marcas del poste indican caudal, turnos y nombres. Bajo una pintura reciente asoma: «Preguntar a Vega».'],
    ['vega', 'Dejemos mi nombre, pero agreguemos el procedimiento. Algún día quiero tomarme una semana libre.']),
  terraces_secret: d(
    ['narrator', 'Entre las macetas hay una planta con una etiqueta: «Ensayo 8». Las siete etiquetas anteriores siguen clavadas alrededor.'],
    ['narrator', 'Una nota de Edda quedó entre las etiquetas: «Vega dice que los intentos que no funcionaron también hicieron crecer esta planta. Quiero preguntarle cómo».']),
  terraces_exit_locked: d(['ohm', 'El paso bajo del lago espera agua y suministro estables. Verifiquemos primero el regulador del riego.']),

  lake_arrival: d(
    ['narrator', 'El Faro parece cercano por primera vez. Su cristal devuelve el cielo, pero ninguna luz nace detrás de él.'],
    ['nereo', 'Llegaron tarde.'],
    ['player', '¿Nos esperaba?'],
    ['nereo', 'No. Pero si digo que llegaron temprano pierdo prestigio.'],
    ['ohm', 'Nereo. Última visita registrada: hace cuatro años.'],
    ['nereo', 'Cuarenta, pequeño. A mí tampoco me gusta la diferencia.']),
  nereo_lake: d(
    ['nereo', 'Una vuelta. Una pausa. Aprendí el ritmo del Faro antes que las letras.'],
    ['player', '¿Cuánto dura la pausa?'],
    ['nereo', 'Lo que tiene que durar.'],
    ['ohm', 'Unidad no reconocida.'],
    ['nereo', 'Cuarenta años y recién ahora viene alguien a quejarse. Las uniones del muelle las hago yo: las hice más veces que ustedes años.'],
    ['narrator', 'Nereo fija la bornera junto a las bobinas, sin mirar. Entre las cañas, el retorno sigue suelto. Las balizas no contestan.'],
    ['nereo', 'El retorno lo cerrás vos, entre las cañas. Y miren las balizas, no a mí: si una no contesta, ahí está la pregunta.']),
  lake_link_complete: d(
    ['narrator', 'La línea sumergida vibra bajo el muelle. Tres balizas marcan el camino hacia el Faro.'],
    ['nereo', 'Ahora sí. Yo llevo la llave. Ustedes, esa costumbre nueva de mirar dos veces.']),
  lake_edda: d(
    ['edda', 'Antes tenía un cuaderno lleno de cosas que no entendía.'],
    ['player', '¿Y ahora?'],
    ['edda', 'Todavía. Pero algunas tienen preguntas mejores. Acá dibujé lo que esperaría ver en la baliza si falta el camino de vuelta.'],
    ['player', '¿Y si no pasa?'],
    ['edda', 'Me arruinás una teoría. Para eso te traje.']),
  lake_boat: d(
    ['narrator', 'Una barca está reparada con tres maderas distintas. En el banco hay marcas de nombres y estaturas.'],
    ['nereo', 'Ese bote vio crecer a medio pueblo. Cuando la luz vuelva, las marcas podrán seguir subiendo.']),
  lake_secret: d(
    ['narrator', 'Bajo el muelle hay una pequeña lámpara orientada hacia tierra. Su placa dice: «Para que el farero también encuentre su casa».'],
    ['nereo', 'La hizo mi compañera. El Faro era mi oficio. Ella no quería que se volviera mi dirección.']),
  lake_exit_locked: d(['nereo', 'Primero la línea del muelle: conexión de suministro y retorno entre las cañas. Mirá sus dos balizas. La galería va a seguir ahí.']),

  lighthouse_arrival: d(
    ['narrator', 'El Faro guarda el silencio de una máquina enorme. Tres anillos de cobre ascienden hasta la linterna.'],
    ['nereo', 'Apoyá un pie junto a la base. Antes vibraba. Más adelante se oía la corona; en la linterna pasaba la luz.'],
    ['player', 'Tres cosas que podemos mirar por separado.'],
    ['edda', 'Una pregunta por vez. La torre no se va a ofender.'],
    ['nereo', 'Yo llevo cuarenta años ofendiéndola y no pasó nada. Las dos manivelas de abajo ya las uno yo. Lo tuyo es la primera mesa, la de la fuente, al pie de la torre: andá y abrila.']),
  nereo_tower: d(
    ['player', '¿Cómo sabés cuándo corregir el ritmo?'],
    ['nereo', 'Escucho el lago.'],
    ['player', '¿No el mecanismo?'],
    ['nereo', 'También. Uno aprende a adornar las respuestas cuando envejece. La manivela conservó el movimiento; para guiar un barco nos faltaba la luz.'],
    ['nereo', 'Los fareros no escribimos el ritmo en números. Dicen que el Faro se olvida de quien lo cuenta. Yo lo canto mientras subo.'],
    ['nereo', 'Las dos manivelas de la base las uno yo, como en el muelle. Lo que no sé es si la fuente va a aguantar lo que le pidamos.']),
  beacon_supply_ready: d(
    ['narrator', 'El anillo inferior se ilumina. El sonido de la fuente sube por el suelo, grave y regular.'],
    ['nereo', 'El suelo. ¿Lo sentís? Ya tiene algo para contar. Miremos el panel inferior.']),
  beacon_supply_locked: d(['nereo', 'Las dos manivelas de la base unen la torre con la línea del lago. Vení a contarme qué vieron en el muelle y las uno.']),
  beacon_supply_arrival: d(
    ['nereo', 'El núcleo debería sostener aquel sonido grave. A veces conseguía un susurro. Si apuraba la rueda, empezaba el olor a cobre caliente.'],
    ['nereo', 'Los fareros decimos «cobre que se queja, cobre que descansa». Un tendido por vez; el otro, dormido. Así me lo dejaron y así lo dejé.'],
    ['player', 'En el Manantial medimos mientras la bomba trabajaba. Podemos hacer eso acá y mirar también el cable.'],
    ['ohm', 'Puedo registrar ambos puntos. La placa conserva los límites del tendido.']),
  beacon_supply_complete: d(
    ['narrator', 'La base responde con un acorde profundo. Un ascenso de luz dibuja el contorno de la segunda galería.'],
    ['edda', 'Tenemos fuente. Todavía no una señal.'],
    ['nereo', 'Ese sí es su sonido. Arriba hay un puente de servicio gastado: la manivela izquierda lo aparta. La derecha une el motor con la corona.'],
    ['player', 'Seguimos hacia el ruido que falta.']),
  beacon_network_ready: d(
    ['narrator', 'El viejo puente queda aislado y el embrague cierra. Los engranajes esperan junto a una galería de lámparas oscuras.'],
    ['nereo', 'Los dientes ya están juntos. Falta oírlos girar. El segundo tablero espera.']),
  beacon_network_locked: d(['nereo', 'Primero tiene que sostenerse la base. Después, las manivelas del medio apartan el puente gastado y acoplan el motor.']),
  // What is still missing, said plainly (ciclo 30).
  beacon_network_locked_both: d(['nereo', 'Antes de la segunda mesa, dos manivelas en el medio de la torre: la de la izquierda aparta el puente gastado, la de la derecha acopla el motor de la corona.']),
  beacon_network_locked_motor: d(['nereo', 'El puente gastado ya está aparte. Falta acoplar el motor: su manivela está a la derecha, a la misma altura.']),
  beacon_network_locked_bridge: d(['nereo', 'El motor ya está acoplado. Falta apartar el puente gastado: su manivela está a la izquierda, a la misma altura.']),
  beacon_lens_locked_both: d(['nereo', 'Para la linterna, dos manivelas arriba: la de la izquierda abre el obturador de bronce, la de la derecha suelta el freno de la lente.']),
  beacon_lens_locked_free: d(['nereo', 'El obturador ya está abierto. Falta soltar el freno de la lente: la manivela de la derecha, arriba.']),
  beacon_lens_locked_shutter: d(['nereo', 'El freno de la lente ya está suelto. Falta abrir el obturador: la manivela de la izquierda, arriba.']),
  beacon_network_arrival: d(
    ['nereo', 'Cuando una lámpara fallaba, nos quedábamos sin giro y sin galería. Yo hacía dos trabajos a oscuras.'],
    ['nereo', 'Quiero que si una se apaga, las otras sigan. Una noche sin giro es una noche sin faro.'],
    ['nereo', 'Mi maestro decía que las voces cantan en fila: la primera da el tono y las demás la siguen. Lo repetía como una oración.'],
    ['player', '¿Qué comparte ahora cada una con las otras?'],
    ['edda', 'Voy a anotar qué esperamos de cada una antes de tocarlas.'],
    ['nereo', 'Y esta vez lo anoto con números: cuánto toma cada voz y cuánto sale de la fuente. Un farero escribiendo números. Si mi maestro me viera.'],
    ['ohm', 'Hay tres servicios. Dispongo de tres espacios en el registro. Coincidencia muy práctica.']),
  beacon_network_complete: d(
    ['narrator', 'La corona de engranajes comienza a girar. Lámparas sucesivas iluminan la galería y el enorme cristal.'],
    ['nereo', 'Ese golpecito al terminar cada vuelta… sigue ahí. Lo conozco hasta dormido.'],
    ['edda', '¡La corona gira! Pero el haz se queda adentro.'],
    ['nereo', 'Arriba abro el obturador y suelto el freno de la lente; los cerré para trabajar. Lo que no sé es qué luz va a dar.']),
  beacon_lens_ready: d(
    ['narrator', 'Las hojas de bronce se abren sobre el lago. El conjunto óptico gira sin freno; su lámpara arroja una luz blanca, demasiado intensa.'],
    ['nereo', 'El camino de la luz está libre. Ahora su intensidad debe sostenerse durante cada vuelta.']),
  beacon_lens_locked: d(['nereo', 'Falta el trabajo de la galería. Cuando gire la corona, podemos abrir el obturador y liberar el freno de la lente.']),
  beacon_lens_arrival: d(
    ['nereo', 'Una luz que encandila un segundo y se apaga no es una señal. Necesitamos que vuelva, siempre reconocible.'],
    ['nereo', 'La lente se templa una sola vez, a oscuras, antes de abrirle el ojo al lago. Así la templaban. Así la templé yo.'],
    ['nereo', 'Y quiero dejarle algo al que venga después de mí: cuánto cambia la toma cuando la lente se conecta. Medido, no recordado.'],
    ['edda', 'Sin la lente y con la lente. Si mi dibujo no alcanza, lo corrijo. Ya le hice lugar.'],
    ['nereo', 'Yo miro el lago. Esta vez, sin adornar la respuesta.']),
  beacon_lens_complete: d(
    ['narrator', 'Una línea de luz cruza el cristal. El cobre responde desde la base hasta la corona. El Faro toma aire.'],
    ['nereo', 'Ahora…'],
    ['narrator', 'El haz alcanza el lago. Vuelve sobre las Terrazas, toca el Castillo y se pierde entre los tejados de la Plaza. A lo lejos, una campana responde.'],
    ['edda', 'Lo vieron. En la Plaza lo vieron.', 'happy'],
    ['ohm', 'Coincidencia registrada. Explicación… esta vez, también.', 'happy'],
    ['nereo', 'Una vuelta. Una pausa. Hola, viejo amigo.'],
    ['edda', 'Mañana quiero traer a Tala. Y que me pregunte todo. Incluso lo que no sepa.'],
    ['ohm', 'En ese caso, necesitaremos un cuaderno más grande.']),
  lighthouse_epilogue: d(
    ['narrator', 'A la mañana siguiente, Lumen deja una lámpara vieja sobre la mesa de la galería. Tala se acerca. El lago ya tiene el color del día.'],
    ['edda', 'Antes de tocar nada, decime qué ves.'],
    ['tala', 'La lámpara no prende.'],
    ['edda', 'Eso veo yo también. ¿Qué más?'],
    ['lumen', 'No la apures. Tenés la ceja de apurar.'],
    ['ohm', 'Confirmo.'],
    ['edda', 'Nadie te preguntó.'],
    ['tala', 'Hay una reparación vieja acá. Debajo de esta tela.'],
    ['edda', 'Bien. Ahora tenemos algo para investigar.'],
    ['nereo', 'Anoche pude volver a casa. No escriban cómo lo hacía yo: algún día alguien va a hacerlo mejor.'],
    ['player', '¿Qué dejamos, entonces?'],
    ['nereo', 'Cómo saber si está bien.'],
    ['narrator', 'Tala gira la lámpara bajo la luz del Faro. En la Bitácora todavía quedan páginas.']),
  lighthouse_after: d(
    ['nereo', 'La luz está firme. Pueden recorrer el reino: allá abajo también termina esta historia.'],
    ['edda', 'Yo empiezo otra: quién recibía nuestras cartas en el Instituto. No pienso dejar esa pregunta en un archivo.'],
    ['ohm', 'La Luz, restaurada. Curiosidad disponible: suficiente para otro viaje.']),
  lighthouse_ohm_note: d(
    ['narrator', 'Tras una placa aparece una letra minúscula: «Si mi memoria falla, pregúntenle al próximo aprendiz. A veces lo que sabe ver es lo que yo olvidé preguntar. —Ω»'],
    ['ohm', 'La nota lleva mi identificación. No recuerdo haberla dictado. Es molesto discrepar tan poco con un desconocido.']),
  lighthouse_window: d(
    ['narrator', 'La Plaza cabe en el hueco de una mano. Desde aquí se distinguen el Manantial, los canales y la Calzada. Un solo paisaje, muchos recorridos.'],
    ['ohm', 'Al principio parecían lugares separados. Ahora también podemos ver lo que los conecta.']),
  finale_world: d(
    ['narrator', 'La señal recorre otra vez el horizonte. Las campanas responden desde lugares que todavía no conocés.'],
    ['ohm', 'Hay más mundo del que entra en nuestros registros. Una situación muy prometedora.']),
  plaza_finale: d(
    ['edda', 'Marín quiere hacer una fiesta esta noche. Le dije que la campana tiene una marca nueva que agregar.'],
    ['edda', 'Yo voy a escribir lo que vimos. Después bailamos. Si escribo después, mi letra se vuelve un problema técnico.']),
  marin_finale: d(
    ['marin', '¡Volvió! Estaba amasando cuando el haz cruzó la ventana. Terminé haciendo un pan con forma de Faro.'],
    ['ohm', '¿Funcionó?'],
    ['marin', 'Como Faro, pésimo. Como pan, extraordinario. A cada cosa lo suyo.']),
  lumen_finale: d(
    ['lumen', 'Paño seco. Tres vueltas al contacto. Y después, mirar qué cambió.'],
    ['player', '¿Seguís haciendo tres?'],
    ['lumen', 'Me gustan tres. Ahora sé que es una costumbre mía, no una orden del cobre. Tala se llevó el instrumento; vuelve con una pregunta.']),
  consejera_finale: d(
    ['consejera', 'La señal del Faro llegó durante una reunión del Consejo. Nos quedamos todos junto a la ventana.'],
    ['consejera', 'Por una vez, el acta dice solamente: «Salimos a mirar». Mañana habrá mucho que organizar.']),
  vega_finale: d(
    ['vega', 'Desde el bancal alto se ve la luz pasar sobre cada canal. Todos esos caminos que cuidamos, juntos.'],
    ['vega', 'Anoté la altura de hoy. También que fue un buen día. Esa medida no lleva unidades.']),
  yesca_finale: d(
    ['yesca', 'Nereo pidió una bisagra para su puerta. La de casa. ¿Entendés? Va a usar otra vez la puerta de casa.'],
    ['yesca', 'La voy a hacer bien. Aunque tarde un poco más.']),
  nereo_finale: d(
    ['nereo', 'Hoy puedo sentarme en el muelle y mirar el Faro desde afuera. Tenía olvidado lo lindo que es.'],
    ['nereo', 'Escribimos el ritmo en números y el Faro me reconoció igual. Los dichos de los fareros se equivocaban en eso. En lo lindo, no.'],
    ['ohm', 'No pienso recordarle ninguna tarea pendiente.'],
    ['nereo', 'Por eso siempre me caíste bien.']),
  tala_plaza: d(
    ['tala', 'Estoy contando las rayas de la campana. Marín dice que ya las contó.'],
    ['player', '¿Y por qué las contás vos?'],
    ['tala', 'Porque también dijo que había seis panes y había cinco. No es lo mismo confiar que dejar de mirar.']),
  tala_workshop: d(['tala', 'Lumen volvió a abrir el taller. Me dejó mirar desde la puerta.'], ['player', '¿No podías entrar?'], ['tala', 'Podía. Desde la puerta se ve dónde deja las cosas antes de perderlas.']),
  tala_water: d(['tala', 'La fuente volvió a sonar. Encontré una marca que ayer estaba seca.'], ['player', '¿La anotaste?'], ['tala', 'Sí. Edda me prestó una hoja. Ya usé los dos lados.']),
  tala_finale: d(['tala', 'Edda me mostró una reparación vieja. Primero me dejó mirarla. Después me dejó equivocarme.'], ['player', '¿Y ahora?'], ['tala', 'Ahora quiero preguntarle a Marín por las luces de su horno. Una cosa por vez, dijo. Tengo una lista.']),
  lumen_gate_after: d(['lumen', 'Escuché la Puerta desde acá. Ese cerrojo llevaba años guardándose el ruido.'], ['lumen', 'Dejé dos tramos sobre el banco. Parecen iguales por fuera; el instrumento cuenta otra historia. El próximo aprendiz los va a comparar.']),
  edda_road_ready: d(['edda', 'Las balizas responden. Mi dibujo del puente tiene una corrección nueva.'], ['edda', 'Todavía falta el cerrojo. Voy a mirar desde acá: si se mueve, quiero ver hacia dónde.']),
  edda_castle_after: d(['edda', 'El dicho no se cumplió. Con la cocina en su propio camino, la enfermería brilla igual que cuando está sola. No se reparten nada.'], ['edda', 'Lo escribí al lado del dicho del Consejo, sin tacharlo. Los dos dicen algo de quienes los escribieron.'], ['edda', 'Copié el plano que dejó la Consejera. También el sector que sigue cerrado.'], ['player', '¿Para llevarlo al Faro?'], ['edda', 'Para ver si allá me sirve. Todavía no lo sé. Eso es lo interesante.']),
  edda_lake_linked: d(['edda', 'Las dos balizas respondieron. Mi dibujo acertó esta parte.'], ['edda', 'Voy hacia la galería. Quiero ver cuánto del esquema del Castillo se reconoce en una torre.']),
  edda_tower_before: d(['edda', 'Marqué la base, la corona y la linterna en hojas separadas.'], ['player', '¿Ya sabés cómo se unen?'], ['edda', 'Tengo flechas a lápiz. Nereo tiene cuarenta años de oído. Vamos a comparar.']),
  edda_tower_source: d(['edda', 'La base responde. Ahora sigo los caminos que salen de ella.'], ['edda', 'En el Castillo pudimos separar dos servicios. Quiero comprobar qué cambiaría si hacemos eso acá.']),
  edda_tower_network: d(['edda', 'Ese golpecito que señaló Nereo vuelve cada vuelta. Lo anoté junto a mi dibujo.'], ['player', 'Todavía falta la señal.'], ['edda', 'Sí. Voy a mirar la linterna mientras él mira el lago. Dos lugares para la misma prueba.']),
  edda_after_lesson: d(['edda', 'Tala encontró la reparación sin que yo se la señalara. Casi se la señalo igual.'], ['ohm', 'Contención registrada.'], ['edda', 'No pongas eso en letras grandes. Ahora quiero copiar las cartas del Instituto. Esa pregunta sigue abierta.']),
  vega_spring_ready: d(['vega', 'La rueda ya transmite movimiento. El indicador respondió.'], ['vega', 'Voy a mirar la bomba antes de pedirle más. Aquel empalme tibio todavía me preocupa.']),
  yesca_limited: d(['yesca', 'Así que pasaste mi horno a la mesa de Vega. Bien: ahí se decide cuánto calor me toca, a la vista de las dos.'], ['yesca', 'Ahora miren qué pasa del lado de Vega. El almuerzo depende de que este acuerdo sirva para las dos.']),
  vega_channel_open: d(['vega', 'El canal está abierto. Ahora quiero mirar cómo trabaja con agua, no sólo cómo quedó la manivela.'], ['vega', 'La última parcela también cuenta. Que llegue al principio no me alcanza.']),
  nereo_lake_linked: d(['nereo', 'Las balizas ya contestan. Tengo la llave y una excusa menos para quedarme acá.'], ['nereo', 'Los espero en la galería. Vayan mirando: yo conozco el camino demasiado bien.']),
  nereo_tower_source: d(['nereo', 'La base recuperó su voz. La corona todavía no.'], ['nereo', 'Voy a escuchar cerca del segundo tablero. A veces uno reconoce mejor lo que falta que lo que está.']),
  nereo_tower_network: d(['nereo', 'La corona volvió a tener ese pequeño golpe. No es una falla nueva; envejecimos juntos.'], ['nereo', 'Ahora miro el lago. El mecanismo puede sonar precioso y seguir sin orientar a nadie.']),
  lumen_epilogue: d(['lumen', 'Traje una lámpara con una reparación vieja. No le dije a Tala dónde está.'], ['lumen', 'Me cuesta más quedarme quieto que arreglarla. Edda está descubriendo lo mismo.']),
  lumen_epilogue_after: d(['lumen', 'Tala quiere comparar el tramo viejo con uno sano. Le dejé el instrumento.'], ['lumen', 'Mañana habrá que hacer lugar para otra persona en el banco. Buen problema.']),
  tala_epilogue: d(['tala', 'Edda dice que primero mire. Estoy mirando.'], ['player', '¿Y qué encontraste?'], ['tala', 'Esta tela no tiene el mismo color. Todavía no sé qué hay debajo.']),
  tala_epilogue_after: d(['tala', 'Quiero guardar también el dibujo de cuando no funcionaba.'], ['player', '¿Por qué?'], ['tala', 'Porque si sólo guardo el otro, parece que ya lo sabía. Edda hizo una cara rara cuando se lo dije.']),
  lake_boat_after: d(['narrator', 'La señal del Faro vuelve sobre las tres maderas de la barca. Las marcas de nombres y estaturas siguen en su banco.'], ['nereo', 'Mañana puedo traerla hasta el muelle. Hay gente que creció mientras esperaba.']),
  portal_arch_without_edda: d(['narrator', 'El libro de llegadas sigue abierto en la última hoja. Debajo de «Hoy: {nombre}, del Instituto», Edda agregó con letra prolija: «Despertó a Ohm».'], ['narrator', 'Al lado dejó una flecha a lápiz hacia la Plaza y una nota: «Preguntar por los Maestros».']),
  plaza_statue_without_edda: d(['narrator', 'La Primera Maestra sostiene un cuaderno abierto. El nombre gastado empieza por «ROX…».'], ['narrator', 'A los pies quedó una nota de Edda: «El abuelo dice que ella nunca se quedaba quieta. Buscar otro retrato».']),
  castle_archive_without_edda: d(['narrator', 'Las cartas siguen ordenadas por fecha. La última solicitud de un docente no tiene respuesta.'], ['ohm', 'Instituto Roxana. Esa era nuestra dirección.'], ['narrator', 'Edda dejó una copia junto al legajo. En el margen: «¿Quién las recibía?».']),
  spring_levels_without_vega: d(['narrator', 'Las fechas de sequía y abundancia siguen en el muro. Una marca reciente lleva la letra de Vega.'], ['narrator', 'En su tablilla: «Anotar también lo que no salió como esperábamos. Voy a revisar los bancales».']),
  ohm_companion: d(['player', '¿Venís bien?'], ['ohm', 'Desplazamiento funcional. Compañía, favorable. Son registros distintos.']),
  ohm_portal_talk: d(['player', '¿Te acordás de este lugar?'], ['ohm', 'Del musgo, con bastante precisión. Del motivo de mi espera, todavía no. Me gustaría conservar esa pregunta.']),
  ohm_plaza_talk: d(['player', '¿Qué mirás?'], ['ohm', 'Las cintas. Las guardaron mientras no había señal. No dispongo de un instrumento para medir esa clase de espera.']),
  ohm_plaza_water_talk: d(['player', 'La fuente suena distinto.'], ['ohm', 'Ahora suena. Es una diferencia bastante amplia. Empezó lejos de acá; me alegra que hayamos vuelto a verla.']),
  ohm_workshop_talk: d(['player', '¿La voz de Lumen te trajo algún recuerdo?'], ['ohm', 'Una asociación. Todavía no una escena completa. Él guardó la taza; podemos darle tiempo a las dos cosas.'], ['ohm', 'Lumen llama conjuro a lo que yo llamaría procedimiento. Su palabra tiene más música. La mía, menos sustos.']),
  ohm_road_talk: d(['player', '¿Qué pensás de Edda?'], ['ohm', 'Que informa sus descubrimientos con mucha rapidez. Sus dudas también. Valoro especialmente lo segundo.']),
  ohm_spring_talk: d(['player', '¿Te molesta el agua?'], ['ohm', 'Aprecio su trabajo. Prefiero observarlo desde piedra seca. Podemos respetar ambas preferencias.']),
  ohm_castle_talk: d(['player', 'La Consejera no parece tranquila.'], ['ohm', 'Carga con lo que ocurrió antes de que llegáramos. Una lectura puede ayudar. No borra lo que pasó.']),
  ohm_terraces_talk: d(['player', '¿Siempre van a discutir?'], ['ohm', 'No puedo predecirlo. Sí observé que Yesca guarda comida para Vega. Ese dato no apareció en ninguna discusión.']),
  ohm_lake_talk: d(['player', 'Nereo se acuerda de vos.'], ['ohm', 'Yo me equivoqué por treinta y seis años. Me corrigió sin dejar de saludarme. Me gustaría recordar bien ese detalle.']),
  ohm_tower_talk: d(['player', 'Desde acá parece mucho trabajo.'], ['ohm', 'Podemos mirar una parte y conservar lo que observamos. El tamaño de la torre no modifica el tamaño de nuestras páginas.']),
  ohm_final_talk: d(['player', '¿Qué querés guardar de hoy?'], ['ohm', 'Que Tala hizo una pregunta y nadie le pidió que ya supiera la respuesta.'], ['ohm', 'También el haz. Pero ese dato ocupa menos.']),
  ohm_light_talk: d(['player', 'Volvió la luz.'], ['ohm', 'Y hay personas preparándose para explicar cómo cuidarla. Quisiera que mi próximo registro empiece por ahí.']),
};

const repeatConversations = {
  edda_portal: ['edda', 'El cristal brilla. Ohm, todavía no. Voy a dibujar lo que sí puedo ver.'],
  edda_plaza: ['edda', 'Estoy comparando el nombre de la estatua con la inscripción del Portal. Casi coinciden. Ese «casi» me interesa.'],
  road_edda: ['edda', 'Yo miro las balizas. Avisame qué cambiás así no le adjudico el resultado a otra cosa.'],
  edda_road_ready: ['edda', 'Las balizas respondieron. Ahora miro hacia dónde empuja el cerrojo.'],
  castle_edda: ['edda', 'El plano tiene más caminos que el decreto. Quiero compararlos antes de sacar otra conclusión.'],
  edda_castle_after: ['edda', 'La copia también conserva el archivo cerrado. Dejarlo afuera contaría mal lo que hicimos.'],
  lake_edda: ['edda', 'Dibujé qué espero de las balizas. Si no ocurre, tenemos algo interesante que revisar.'],
  edda_tower_before: ['edda', 'Yo sigo el dibujo. Nereo escucha. Después comparamos.'],
  lumen_before: ['lumen', 'La lámpara nueva sigue oscura. Dejémosla quieta y miremos el camino.'],
  lumen_after: ['lumen', 'El tramo viejo queda en el banco. No está ahí por nostalgia: está para comparar.'],
  lumen_gate_after: ['lumen', 'Una lámpara menos tirada. Una explicación más sobre la mesa. Buen intercambio.'],
  marin_before: ['marin', 'Si encontrás a Tala, avisale que las migas no cuentan como panes enteros.'],
  marin_after: ['marin', 'La ventana del taller sigue encendida. Hoy me gusta pasar por ese lado.'],
  vega_spring: ['vega', 'Voy a mirar el nivel. Si hacemos una prueba, quiero saber qué pasó abajo también.'],
  consejera_before: ['consejera', 'Los sellos registran un problema. No quiero confundir retirarlos con resolverlo.'],
  consejera_after: ['consejera', 'El plano quedó público. La responsabilidad también.'],
  yesca_before: ['yesca', 'Necesito herramientas terminadas. Si podemos hacerlas sin castigar el tendido, te escucho.'],
  vega_terraces: ['vega', 'La última parcela sigue siendo parte del riego. Aunque desde acá se vea pequeña.'],
  nereo_lake: ['nereo', 'Estoy escuchando. Podés quedarte un rato; no hace falta llenar todos los silencios.'],
  nereo_tower: ['nereo', 'La memoria ayuda. Por eso mismo conviene dejarla en algo más que una cabeza.'],
  tala_plaza: ['tala', 'Todavía estoy contando. Después voy a preguntarle a Marín por la diferencia.'],
};
for (const [id, [speaker, text]] of Object.entries(repeatConversations)) DIALOGUES[`${id}_repeat`] = d([speaker, text]);

const npc = (id, x, z, character, dialogue, extra = {}) => ({ id, kind: 'npc', x, z, label: CHARACTERS[character].name, character, dialogue, ...extra });
const panel = (id, x, z, label, puzzle, requires, lockedDialogue, afterDialogue) => ({ id, kind: 'panel', x, z, label, puzzle, flag: puzzle, requires, lockedDialogue, afterDialogue });
const reverseLabels = {
  workshop_feed: 'Separar el cierre izquierdo', workshop_return: 'Separar el cierre derecho',
  road_send: 'Separar el cierre del poste oeste', road_return: 'Separar el cierre del poste este',
  spring_sluice: 'Desviar el agua fuera de la rueda', spring_coupling: 'Separar el generador de la rueda',
  castle_service: 'Desconectar el troncal sano', forge_limited: 'Devolver el horno a su palanca propia',
  irrigation_open: 'Cerrar el canal de los bancales', lake_cable: 'Abrir el suministro del muelle',
  lake_return: 'Desconectar el retorno de la orilla', tower_feed: 'Abrir la alimentación de la base',
  tower_return: 'Abrir el retorno de la base', tower_isolated: 'Reconectar el puente gastado',
  tower_motor: 'Desacoplar el motor de la corona', tower_shutter: 'Cerrar el obturador de bronce',
  tower_lens_free: 'Volver a sujetar el freno óptico',
};
const lever = (id, x, z, label, flag, onText, offText, extra = {}) => ({ id, kind: 'lever', x, z, label, flag, action: { type: 'toggle', flag, onText, offText, onLabel: label, offLabel: reverseLabels[flag] || 'Revertir este ajuste' }, ...extra });
const lore = (id, x, z, label, dialogue, extra = {}) => ({ id, kind: 'inscription', x, z, label, dialogue, ...extra });
const secret = (id, x, z, label, dialogue) => ({ id, kind: 'secret', x, z, label, dialogue, secret: id });
const exit = (id, x, z, target, label, requires = [], lockedDialogue, spawn) => ({ id, x, z, target, label, requires, ...(lockedDialogue ? { lockedDialogue } : {}), ...(spawn ? { spawn } : {}) });

export const AREAS = {
  portal: {
    id: 'portal', name: 'Portal Ω', subtitle: 'Donde una pregunta vuelve a cruzar', theme: 'portal', bounds: [28, 24], spawn: [0, -2.4], entryDialogue: 'portal_arrival',
    objects: [
      npc('edda_portal', -3.6, 0.6, 'edda', 'edda_portal', { flag: 'awaken', afterDialogue: 'edda_portal_after' }),
      panel('ohm_pedestal', 3.5, 0, 'El pedestal de bronce', 'awaken', [], null, 'ohm_pedestal_after'),
      lore('portal_arch', -7.5, -5, 'El libro de llegadas', 'portal_arch'),
      secret('portal_seed', 8.5, 5, 'Una placa entre las raíces', 'portal_seed'),
    ],
    exits: [exit('portal_to_plaza', 6.6, -10, 'plaza', 'Plaza de Ohm', ['awaken'], 'portal_locked')],
  },
  plaza: {
    id: 'plaza', name: 'Plaza de Ohm', subtitle: 'Las cosas que una comunidad conserva', theme: 'plaza', bounds: [40, 32], spawn: [0, 11], entryDialogue: 'plaza_arrival',
    objects: [
      npc('edda_plaza', -5, 3, 'edda', 'edda_plaza', { flag: 'workshop', afterDialogue: 'edda_plaza_after' }),
      npc('marin', -5.15, -7.4, 'marin', 'marin_before', { flag: 'workshop', afterDialogue: 'marin_after' }),
      npc('tala_plaza', 11.2, 6, 'tala', 'tala_plaza'),
      { id: 'fountain', kind: 'well', x: 0, z: -2, label: 'La fuente de la Plaza', dialogue: 'plaza_fountain', flag: 'pump', afterDialogue: 'plaza_fountain_after' },
      lore('statue', -6.4, -3.9, 'La Primera Maestra', 'plaza_statue'),
      secret('plaza_bell', 11, -7, 'Las marcas de la campana', 'plaza_bell'),
    ],
    exits: [
      exit('plaza_to_portal', 0, 14, 'portal', 'Portal Ω', [], null, [6.4, -8]),
      { ...exit('plaza_to_workshop', -13.25, 7.9, 'workshop', 'Taller de Lumen'), radius: 3.6 }, // answers from the porch steps too (ciclo 30)
      exit('plaza_to_road', 0, -14, 'road', 'La Calzada', ['workshop'], 'plaza_road_locked'),
    ],
  },
  workshop: {
    id: 'workshop', name: 'El taller de Lumen', subtitle: 'Una receta aprende a explicar sus motivos', theme: 'workshop', bounds: [24, 24], spawn: [0, 8], entryDialogue: 'workshop_arrival',
    objects: [
      npc('lumen', -3.5, 1.5, 'lumen', 'lumen_before', { flag: 'workshop', afterDialogue: 'lumen_after' }),
      lever('workshop_feed', -.9, -.5, 'Unir el cierre izquierdo', 'workshop_feed', 'El cierre izquierdo queda unido con un clic.', 'El cierre izquierdo queda separado.'),
      lever('workshop_return', 6.9, -.5, 'Unir el cierre derecho', 'workshop_return', 'El cierre derecho queda unido con un clic.', 'El cierre derecho queda separado.'),
      panel('workbench', 3, -3, 'La lámpara del banco', 'workshop', ['bench_ready'], 'workshop_locked', 'workshop_bench_after'),
      { ...panel('stone_drawer', -8.2, -7.1, 'El cajón de las piedras', 'drawer', ['workshop'], 'drawer_locked', 'drawer_after'), dialogue: 'drawer_arrival', optional: true, radius: 3.4 },
      lore('workshop_note', -7, -4.5, 'Cuatro manos sobre un esquema', 'workshop_note'),
      secret('workshop_cup', 8, -6, 'La taza que espera', 'workshop_cup'),
    ],
    exits: [exit('workshop_to_plaza', 0, 10, 'plaza', 'Volver a la Plaza', [], null, [-13.25, 9.3])],
  },
  road: {
    id: 'road', name: 'La Calzada', subtitle: 'El otro extremo de un camino', theme: 'road', bounds: [34, 32], spawn: [0, 11], entryDialogue: 'road_arrival', initialFlags: { road_bypass: true },
    objects: [
      npc('edda_road', -2.2, 7.6, 'edda', 'road_edda', { flag: 'gate', afterDialogue: 'road_after' }),
      lever('road_send', -8, 1, 'Unir el cierre del poste oeste', 'road_send', 'El contacto del poste oeste queda unido.', 'El contacto del poste oeste queda separado.'),
      lever('road_return', 8, 1, 'Unir el cierre bajo las hojas', 'road_return', 'El contacto del poste este queda unido.', 'El contacto del poste este queda separado.'),
      { id: 'road_bypass', kind: 'lever', x: 0, z: 3.5, label: 'El puente de cobre del centro', flag: 'road_bypass', action: { type: 'toggle', flag: 'road_bypass', onLabel: 'Cerrar el puente de cobre', offLabel: 'Abrir el puente de cobre', onText: 'La pieza de cobre une las dos líneas. Las balizas quedan oscuras.', offText: 'La pieza se levanta y deja separados sus dos contactos.' } },
      panel('gate_panel', 4.5, -6, 'Regulador de la Puerta de Ohm', 'gate', ['bridge_ready'], 'gate_locked', 'road_after'),
      { ...panel('edda_post', -9.4, 3.4, 'La baliza del costado', 'edda_contact', ['gate'], 'edda_contact_locked', 'edda_contact_after'), dialogue: 'edda_contact_ask', mini: true, optional: true },
      lore('road_memorial', -8, -6, 'La instrucción de los tres golpes', 'road_memorial'),
      secret('road_nest', 10, 7, 'Un nido entre fusibles', 'road_nest'),
    ],
    exits: [exit('road_to_plaza', 0, 14, 'plaza', 'Plaza de Ohm', [], null, [0, -11]), exit('road_to_spring', 0, -14, 'spring', 'El Manantial', ['gate'], 'road_exit_locked')],
  },
  spring: {
    id: 'spring', name: 'El Manantial', subtitle: 'Lo que comienza lejos de su consecuencia', theme: 'spring', bounds: [34, 30], spawn: [0, 10], entryDialogue: 'spring_arrival',
    objects: [
      npc('vega_spring', -4.2, -1.4, 'vega', 'vega_spring', { flag: 'pump', afterDialogue: 'spring_after' }),
      lever('spring_sluice', -6.5, 2, 'Desviar el agua hacia la rueda', 'spring_sluice', 'El canal conduce el agua hacia los álabes de la rueda.', 'El agua vuelve al desvío y deja de impulsar la rueda.'),
      lever('spring_coupling', 7.5, -1, 'Acoplar la rueda al generador', 'spring_coupling', 'El eje de la rueda queda unido al generador.', 'El generador queda separado de la rueda.'),
      { ...panel('pump_panel', 2.5, -5.5, 'Caja de conexiones de la bomba', 'pump', ['spring_drive', 'tala_lantern'], 'pump_locked', 'spring_after'), lockedBy: { tala_lantern: 'pump_locked_tala' } },
      // Minijuegos: Tala (en el camino principal) y Marín (opcional), mientras falta el agua en la Plaza.
      npc('tala_spring', 3.6, 6.4, 'tala', 'tala_spring_ask', { puzzle: 'tala_lantern', afterDialogue: 'tala_spring_after', mini: true }),
      npc('marin_spring', -3.2, 6, 'marin', 'marin_spring_ask', { puzzle: 'marin_cart', afterDialogue: 'marin_spring_after', mini: true, optional: true }),
      lore('spring_levels', -6.5, -5, 'Cuarenta marcas de agua', 'spring_levels'),
      secret('spring_bottle', 10, 6, 'Una botella sellada', 'spring_bottle'),
    ],
    exits: [exit('spring_to_road', 0, 13, 'road', 'La Calzada', [], null, [0, -11]), exit('spring_to_castle', 0, -13, 'castle', 'Castillo de la Red', ['pump'], 'spring_exit_locked')],
  },
  castle: {
    id: 'castle', name: 'Castillo de la Red', subtitle: 'La confianza también necesita evidencia', theme: 'castle', bounds: [40, 32], spawn: [0, 11], entryDialogue: 'castle_arrival', initialFlags: { castle_branch_closed: true },
    objects: [
      npc('consejera', 4.2, -6.4, 'consejera', 'consejera_before', { flag: 'distribution', afterDialogue: 'consejera_after' }),
      npc('edda_castle', -9.2, -3.6, 'edda', 'castle_edda'),
      { id: 'castle_isolated', kind: 'lever', x: -8, z: -1, label: 'Conexión del archivo oeste', flag: 'castle_branch_closed', action: { type: 'toggle', flag: 'castle_branch_closed', onLabel: 'Conectar el archivo oeste', offLabel: 'Separar el archivo oeste', onText: 'El cierre une de nuevo el archivo con la red. El indicador del tablero queda oscuro.', offText: 'Los contactos del archivo quedan separados a la vista.' } },
      lever('castle_service', 8, -1, 'Conectar los servicios del Castillo', 'castle_service', 'El cierre de enfermería y cocina queda unido.', 'El cierre de enfermería y cocina queda separado.'),
      panel('distribution_panel', 6.4, -9.5, 'Tablero de los servicios del Castillo', 'distribution', ['castle_ready'], 'distribution_locked', 'consejera_after'),
      lore('castle_archive', -11, -6, 'Cartas sin respuesta', 'castle_archive'),
      secret('castle_hidden', 11, -6.5, 'El reverso del estandarte', 'castle_hidden'),
    ],
    exits: [exit('castle_to_spring', 0, 14, 'spring', 'El Manantial', [], null, [0, -10]), exit('castle_to_terraces', 0, -14, 'terraces', 'Las Terrazas', ['distribution'], 'castle_exit_locked')],
  },
  terraces: {
    id: 'terraces', name: 'Las Terrazas', subtitle: 'La luz alcanza a quienes están aguas abajo', theme: 'terraces', bounds: [40, 36], spawn: [0, 13], entryDialogue: 'terraces_arrival',
    objects: [
      npc('yesca', -11.4, -11.2, 'yesca', 'yesca_before', { flag: 'irrigation', afterDialogue: 'yesca_after' }),
      npc('vega_terraces', 7.6, 4.2, 'vega', 'vega_terraces', { flag: 'irrigation', afterDialogue: 'vega_after' }),
      lever('forge_limited', -9.4, -12.3, 'Pasar el horno a la mesa compartida', 'forge_limited', 'El horno queda en el tablero de Vega: su calor se reparte junto con el riego.', 'El horno vuelve a su palanca propia, a demanda alta.'),
      lever('irrigation_open', 9.8, -12.3, 'Abrir el canal de los bancales', 'irrigation_open', 'El agua puede alcanzar los bancales cuando la bomba sostenga su trabajo.', 'El canal de los bancales queda cerrado.'),
      panel('irrigation_panel', 1, -6, 'Tablero de calor y riego', 'irrigation', ['water_routed'], 'irrigation_locked', 'vega_after'),
      lore('terraces_marker', -9, -6.5, 'Un turno para cada nombre', 'terraces_marker'),
      secret('terraces_secret', 11, 7.5, 'El octavo intento', 'terraces_secret'),
    ],
    exits: [exit('terraces_to_castle', 0, 16, 'castle', 'Castillo de la Red', [], null, [0, -11]), exit('terraces_to_lake', 0, -16, 'lake', 'El Lago de las Señales', ['irrigation'], 'terraces_exit_locked')],
  },
  lake: {
    id: 'lake', name: 'Lago de las Señales', subtitle: 'Una luz para encontrar el regreso', theme: 'lake', bounds: [40, 34], spawn: [0, 12], entryDialogue: 'lake_arrival',
    objects: [
      npc('nereo_lake', 9.5, 3.2, 'nereo', 'nereo_lake'),
      npc('edda_lake', -5, 6, 'edda', 'lake_edda'),
      lever('lake_cable', -8, 0, 'Fijar el suministro del muelle', 'lake_cable', 'La línea que alimenta el Faro queda asegurada en su bornera.', 'El suministro del Faro queda abierto en el muelle.'),
      lever('lake_return', 8, -3, 'Conectar el retorno entre las cañas', 'lake_return', 'El retorno se une a la línea sumergida. Su baliza responde.', 'El retorno del Faro queda interrumpido en la orilla.'),
      lore('lake_boat', -10, -6, 'La barca de las tres maderas', 'lake_boat'),
      secret('lake_secret', 5.4, 5.2, 'Una luz hacia tierra', 'lake_secret'),
    ],
    exits: [exit('lake_to_terraces', 0, 15, 'terraces', 'Las Terrazas', [], null, [0, -13]), exit('lake_to_lighthouse', 0, -15, 'lighthouse', 'El Faro', ['beacon_link'], 'lake_exit_locked')],
  },
  lighthouse: {
    id: 'lighthouse', name: 'El Faro', subtitle: 'Lo imposible, parte por parte', theme: 'lighthouse', bounds: [36, 42], spawn: [0, 15], entryDialogue: 'lighthouse_arrival',
    objects: [
      npc('nereo_tower', 3.5, 11, 'nereo', 'nereo_tower', { flag: 'beacon_lens', afterDialogue: 'lighthouse_after' }),
      npc('edda_tower', -4, 12, 'edda', 'edda_tower_before', { flag: 'beacon_lens', afterDialogue: 'lighthouse_epilogue' }),
      npc('lumen_epilogue', -5.5, -11, 'lumen', 'lumen_epilogue', { requiresFlag: 'beacon_lens' }),
      npc('tala_epilogue', -4, -12.5, 'tala', 'tala_epilogue', { requiresFlag: 'beacon_lens' }),
      lever('tower_feed', -8, 7, 'Conectar la alimentación de la base', 'tower_feed', 'El conductor de entrada queda conectado al anillo inferior.', 'El conductor de alimentación de la base queda abierto.'),
      lever('tower_return', 8, 7, 'Cerrar el retorno de la base', 'tower_return', 'El retorno de la base queda conectado a la línea del lago.', 'El retorno del anillo inferior queda abierto.'),
      { ...panel('beacon_supply_panel', 0, 4, 'I · Fuente del Faro', 'beacon_supply', ['beacon_supply_ready'], 'beacon_supply_locked', 'beacon_supply_complete'), radius: 3.6 }, // a big machine: it answers from all around its plinth (ciclo 30)
      lever('tower_isolated', -8, 0, 'Aislar el puente de servicio gastado', 'tower_isolated', 'El puente de mantenimiento queda fuera de la distribución.', 'El puente gastado vuelve a quedar conectado.', { requires: ['beacon_supply'], lockedDialogue: 'beacon_network_locked' }),
      lever('tower_motor', 8, 0, 'Acoplar el motor de la corona', 'tower_motor', 'El embrague conecta el motor con la corona de engranajes.', 'El embrague separa el motor de la corona.', { requires: ['beacon_supply'], lockedDialogue: 'beacon_network_locked' }),
      { ...panel('beacon_network_panel', 0, -4, 'II · Distribución de la corona', 'beacon_network', ['beacon_network_ready'], 'beacon_network_locked', 'beacon_network_complete'), radius: 3.6 }, // a big machine: it answers from all around its plinth (ciclo 30)
      lever('tower_shutter', -8, -8, 'Abrir el obturador de bronce', 'tower_shutter', 'Las hojas del obturador abren un camino hacia el lago.', 'Las hojas de bronce cierran la salida del haz.', { requires: ['beacon_network'], lockedDialogue: 'beacon_lens_locked' }),
      lever('tower_lens_free', 8, -8, 'Liberar el freno del conjunto óptico', 'tower_lens_free', 'La lente puede girar con la corona sin la sujeción de mantenimiento.', 'El freno vuelve a sujetar el conjunto óptico.', { requires: ['beacon_network'], lockedDialogue: 'beacon_lens_locked' }),
      { ...panel('beacon_lens_panel', 0, -12, 'III · La linterna', 'beacon_lens', ['beacon_lens_ready'], 'beacon_lens_locked', 'finale_world'), kind: 'beacon', radius: 3.6 },
      lore('lighthouse_window', -11, -14, 'Todo el camino, a la vista', 'lighthouse_window'),
      secret('lighthouse_ohm_note', 11, -14, 'Una nota detrás de la placa', 'lighthouse_ohm_note'),
    ],
    exits: [exit('lighthouse_to_lake', 0, 19, 'lake', 'Volver al lago', [], null, [0, -12])],
  },
};

// These conditions describe actual routes/assemblies. The controller recomputes them
// after every operation. Once commissioned, a system retains its completed state:
// the repaired controls are latched rather than silently undoing a saved restoration.
export const WORLD_SYSTEMS = [
  { id: 'bench_circuit', area: 'workshop', flag: 'bench_ready', requires: ['workshop_feed', 'workshop_return'], latch: 'workshop', label: 'La mesa vuelve a zumbar', detail: 'Los dos cierres de la mesa están unidos. La lámpara todavía necesita una mirada.', dialogue: 'workshop_ready' },
  { id: 'road_circuit', area: 'road', flag: 'bridge_ready', requires: ['workshop', 'road_send', 'road_return'], off: ['road_bypass'], latch: 'gate', label: 'Las balizas responden', detail: 'Una luz recorre los postes. El cerrojo hace un ruido dentro de la puerta.', dialogue: 'road_ready' },
  { id: 'spring_generator', area: 'spring', flag: 'spring_drive', requires: ['spring_sluice', 'spring_coupling'], latch: 'pump', label: 'La rueda encuentra movimiento', detail: 'El eje gira y un indicador cobra luz junto a la bomba.', dialogue: 'spring_ready' },
  { id: 'castle_isolation', area: 'castle', flag: 'castle_ready', requires: ['castle_service'], off: ['castle_branch_closed'], latch: 'distribution', label: 'El archivo queda separado', detail: 'Se ve la separación de sus contactos. La Consejera permite examinar los otros servicios.', dialogue: 'castle_ready' },
  { id: 'terraces_sharing', area: 'terraces', flag: 'water_routed', requires: ['forge_limited', 'irrigation_open', 'distribution'], latch: 'irrigation', label: 'El horno baja, el canal se abre', detail: 'Yesca puede seguir trabajando. Vega prepara la prueba del riego.', dialogue: 'water_ready' },
  { id: 'lake_circuit', area: 'lake', flag: 'beacon_link', requires: ['lake_cable', 'lake_return', 'irrigation'], latch: 'beacon_supply', label: 'La línea del Faro está completa', detail: 'El muelle conecta alimentación y retorno con la torre.', dialogue: 'lake_link_complete' },
  { id: 'tower_base', area: 'lighthouse', flag: 'beacon_supply_ready', requires: ['beacon_link', 'tower_feed', 'tower_return'], latch: 'beacon_supply', label: 'I · La base recibe energía', detail: 'La fuente ya puede examinarse con entrada y retorno presentes.', dialogue: 'beacon_supply_ready' },
  { id: 'tower_branches', area: 'lighthouse', flag: 'beacon_network_ready', requires: ['beacon_supply', 'tower_isolated', 'tower_motor'], latch: 'beacon_network', label: 'II · La distribución puede probarse', detail: 'Puente gastado aislado y motor acoplado.', dialogue: 'beacon_network_ready' },
  { id: 'tower_optics', area: 'lighthouse', flag: 'beacon_lens_ready', requires: ['beacon_network', 'tower_shutter', 'tower_lens_free'], latch: 'beacon_lens', label: 'III · La luz tiene un camino', detail: 'Obturador abierto y freno óptico liberado: falta una señal estable.', dialogue: 'beacon_lens_ready' },
];

export function evaluateWorld(state) {
  const flags = { ...state.flags };
  return WORLD_SYSTEMS.map(system => {
    const active = Boolean(flags[system.latch] || (system.requires.every(flag => flags[flag]) && (system.off || []).every(flag => !flags[flag])));
    flags[system.flag] = active;
    return { ...system, active };
  });
}

// Optional benches: their own arrival and closing, outside the count of lights on the main road.
export const SIDE_BENCHES = { drawer: { arrival: 'drawer_arrival', complete: 'drawer_complete' },
  // Minijuegos (ciclo 29). Tala's opens the pump's bench; Marín's and Edda's are optional.
  tala_lantern: { arrival: 'tala_spring_ask', complete: 'tala_lantern_complete', mini: true },
  marin_cart: { arrival: 'marin_spring_ask', complete: 'marin_cart_complete', mini: true },
  edda_contact: { arrival: 'edda_contact_ask', complete: 'edda_contact_complete', mini: true } };
export const PUZZLE_STORY = Object.fromEntries([
  ['awaken', 'awaken_arrival', 'awaken_complete'],
  ['workshop', 'workshop_arrival_puzzle', 'workshop_complete'],
  ['gate', 'gate_arrival', 'gate_complete'],
  ['pump', 'pump_arrival', 'pump_complete'],
  ['distribution', 'distribution_arrival', 'distribution_complete'],
  ['irrigation', 'irrigation_arrival', 'irrigation_complete'],
  ['beacon_supply', 'beacon_supply_arrival', 'beacon_supply_complete'],
  ['beacon_network', 'beacon_network_arrival', 'beacon_network_complete'],
  ['beacon_lens', 'beacon_lens_arrival', 'beacon_lens_complete'],
].map(([id, arrival, complete]) => [id, { arrival, complete }]));

// A closing line or a Bitácora page may only claim what the bench trace shows the
// player actually tried. Saves without a trace get wording that claims nothing.
const gateBrake = state => { const t = state.puzzles?.gate?.trace; return t === undefined || t === null ? null : t.brake || null; };
export function completionLines(puzzle, state = {}) {
  const lines = DIALOGUES[PUZZLE_STORY[puzzle]?.complete] || [];
  if (puzzle !== 'gate') return lines;
  const brake = gateBrake(state), text = !brake ? 'Cambió el sentido, y el cerrojo levantó.'
    : brake.min === brake.max ? 'Cambió el sentido. El zócalo quedó como estaba, y aun así levantó.' : 'Cambió el sentido. Y con la piedra justa en el zócalo, levantó sin atascarse.';
  return lines.map(l => l.speaker === 'player' ? { ...l, text } : l);
}
export function journalText(entry, state = {}) {
  if (entry.id === 'power') {
    const agreement = TERRACES_AGREEMENT(state.puzzles?.irrigation);
    if (agreement === 'forja') return 'Elegimos que el horno de Yesca siguiera fuerte. Las raíces y el riego quedaron justos, dentro de lo que el cable de la ladera sostiene. Vega va a vigilar la última parcela.';
    if (agreement === 'riego') return 'Elegimos que el agua llegara primero. El horno de Yesca trabaja más bajo, a tandas más cortas, y el cable de la ladera no se calienta. La última parcela volvió a recibir agua.';
    return entry.text;
  }
  if (entry.id === 'quiet_mount') {
    const mount = quietMountState(state);
    if (mount.reservoir === 'low') return 'Cuando el Faro tomó aire, en la ladera del Monte Quieto se encendió la luz de la Casa de Compuertas. Nadie la encendió. Parpadea, como si le faltara fuerza: las Terrazas se llevaron el agua primero y el embalse quedó bajo. ¿Tendrá que ver? La abuela de Edda decía que esa luz avisaba algo.';
    return entry.text + ' Se sostiene firme; el embalse está alto.';
  }
  if (entry.id !== 'operating_window') return entry.text;
  const brake = gateBrake(state);
  if (!brake) return 'El cerrojo empujaba hacia abajo. Al cambiar sus conexiones invirtió el sentido y levantó.';
  if (brake.min === brake.max) return 'El cerrojo empujaba hacia abajo. Al cambiar sus conexiones invirtió el sentido y levantó. No cambié la piedra del zócalo: qué hace todavía está por probar.';
  if (brake.min > 0 && brake.max < 100) return 'El cerrojo empujaba hacia abajo. Al cambiar sus conexiones invirtió el sentido. Probé piedras de freno en el zócalo y cambió cuánto empujaba; no llegué a la que más frena.';
  return entry.text;
}

// Routine preparations the inhabitants do themselves once a conversation ends.
/** Levers an inhabitant joined in a conversation: undoing one makes them say something. */
export const JOINED_BY = {
  workshop_feed: { by: 'lumen_before', say: 'unjoin_workshop_feed' },
  lake_cable: { by: 'nereo_lake', say: 'unjoin_lake_cable' },
  tower_feed: { by: 'nereo_tower', say: 'unjoin_tower_feed' },
  tower_return: { by: 'nereo_tower', say: 'unjoin_tower_return' },
  tower_shutter: { by: 'beacon_network_complete', say: 'unjoin_tower_shutter' },
  tower_lens_free: { by: 'beacon_network_complete', say: 'unjoin_tower_lens_free' },
};
/** The line an inhabitant says when the player opens what they had just joined, or null. */
export function unjoinDialogue(flag, state) {
  const j = JOINED_BY[flag];
  return j && !state.flags?.[flag] && (state.seen ?? []).includes(j.by) ? j.say : null;
}

/** What a hand on a lever remembers beyond the lever itself: the order Vega's song asks for. */
export function toggleMemory(flag, flags) {
  return flag === 'spring_coupling' && !flags.spring_coupling && !flags.spring_sluice ? { spring_backwards: true } : flag === 'spring_sluice' && !flags.spring_sluice && !flags.spring_coupling ? { spring_backwards: false } : {};
}

export const DIALOGUE_EFFECTS = {
  lumen_before: { flags: ['workshop_feed'] },
  nereo_lake: { flags: ['lake_cable'] },
  // In the Faro Nereo does the routine joins and the mechanical preparation; the player keeps
  // the decisions (isolating the worn bridge, coupling the motor) and the three benches.
  nereo_tower: { flags: ['tower_feed', 'tower_return'] },
  // Ciclo 30: Nereo joins the base when the travellers arrive; a player who never spoke to him again
  // looked for «the first panel» for a quarter of an hour.
  lighthouse_arrival: { flags: ['tower_feed', 'tower_return'] },
  beacon_network_complete: { flags: ['tower_shutter', 'tower_lens_free'] },
};

export const JOURNAL = [
  { id: 'arrival', title: 'Al otro lado del Portal', text: 'Crucé el Portal. Del otro lado estaba Edda, de la familia que lo cuida; hacía años que nadie llegaba. Junto al arco hay un pequeño de bronce que no responde. Empiezo por mirar.', requires: [] },
  { id: 'circuit', title: 'El retorno también es camino', text: 'Ohm necesitaba las dos conexiones. Dibujé el camino entero, incluido el que vuelve. Edda quiere guardar también el dibujo de cuando no funcionaba.', explanation: 'El cristal es una fuente: aporta energía. El cobre permite el paso y Ohm la utiliza. Para que haya corriente eléctrica hace falta una trayectoria completa entre los dos extremos de la fuente, pasando por Ohm. A esa trayectoria la llamamos circuito cerrado. Un corte en cualquier parte puede interrumpirla.', requires: ['awaken'] },
  { id: 'diagnosis', title: 'La lámpara era la misma', text: 'Lumen había cambiado la lámpara tres veces. Al reparar el camino de cobre, encendió la que ya estaba. Conservamos el tramo viejo para compararlo con el nuevo.', explanation: 'La tela era una cubierta aislante. Debajo, el conductor de cobre estaba cortado. Con el banco apagado, la prueba de continuidad permite comprobar si hay paso entre los extremos de ese tramo. Una cubierta entera no demuestra que el conductor también lo esté. Esta prueba se hace sin alimentación; no sirve para afirmar que toda la máquina funcionará.', requires: ['workshop'] },
  { id: 'operating_window', title: 'Lo suficiente para levantar una puerta', text: 'El cerrojo empujaba hacia abajo. Al cambiar sus conexiones invirtió el sentido. Con la piedra de freno justa en el zócalo levantó; con el puente de cobre, golpeaba.', explanation: 'La polaridad describe el sentido de una tensión entre dos puntos. El pestillo del cerrojo es un imán: la bobina lo empuja o lo atrae según el sentido de la corriente; una bobina que mueve hierro sin imán atrae igual en los dos sentidos. La tensión se mide en voltios (V); la corriente que pasa por un tramo, en amperios (A). La resistencia de la piedra de freno se mide en ohmios (Ω), y sus anillos la escriben en colores. En un resistor óhmico se relacionan mediante V = I × R. El cerrojo tiene un intervalo de trabajo: más corriente no equivale siempre a mejor funcionamiento.', requires: ['gate'] },
  { id: 'source_load', title: 'Una unión puede pasar… y perder', text: 'La unión del Manantial parecía unida, pero se calentaba al trabajar la bomba. Cambiarla devolvió el agua a la Plaza. No todas las fallas se parecen al corte del taller.', explanation: 'El empalme oxidado tenía continuidad, pero también demasiada resistencia. Cuando circulaba corriente, parte de la tensión caía en él y allí se producía calor. Comparar ambos lados mientras la bomba trabaja permite observar esa pérdida. Una prueba de continuidad sola no cuenta qué ocurre bajo carga. La rueda y el generador convierten el movimiento del agua en energía eléctrica.', requires: ['pump'] },
  { id: 'parallel', title: 'Cerrar una rama sin cerrar el reino', text: 'El archivo quedó separado. La enfermería y la cocina recuperaron sus propios caminos. La Consejera dejó el plano en la puerta: ahora cualquiera puede señalar qué se está cerrando.', explanation: 'Los servicios conectados en paralelo comparten los mismos dos puntos de conexión, llamados nodos, y por eso tienen la misma tensión. Cada rama lleva su propia corriente; la fuente entrega la suma. En serie hay un único camino: circula la misma corriente y la tensión se reparte. Separar una rama dañada puede preservar las demás, según cómo esté conectada y protegida la red.', requires: ['distribution'] },
  { id: 'power', title: 'Azadas y tomates', text: 'Yesca trabaja a un ritmo que puede sostener. Vega mira las alturas con el riego funcionando. Dejar las perillas al máximo no ayudaba ni a las raíces ni a quien tenía que fabricar sus herramientas.', explanation: 'La potencia expresa cuánta energía se transforma por segundo; se mide en watts (W). En corriente continua, P = V × I. En un resistor, la potencia convertida en calor también puede calcularse como I² × R. El calor útil en el lecho de raíces y el calor perdido en un cable tienen consecuencias distintas. Cada servicio y la fuente compartida tienen límites.', requires: ['irrigation'] },
  { id: 'return_at_scale', title: 'La misma pregunta, un lago más grande', text: 'En el muelle encontramos otra vez dos caminos. Las balizas respondieron cuando quedaron unidos. Nereo trajo la llave; nosotros, el recuerdo del pedestal de Ohm.', explanation: 'La línea del Faro necesita alimentación y retorno, igual que el circuito pequeño del Portal. El tamaño y la distancia no reemplazan el recorrido completo. Las balizas permiten observar el estado del tendido sin ver la parte que pasa bajo el agua.', requires: ['beacon_link'] },
  { id: 'tower_source', title: 'Faro · I. El primer escalón', text: 'Nereo reconoció la vibración bajo el pie. El núcleo puede trabajar sin recalentar el tendido. La torre empezó a parecer tres preguntas más pequeñas.', explanation: 'La tensión se reparte entre el tendido, el regulador y el núcleo. Bajar la resistencia del regulador puede aumentar la corriente y también las pérdidas en el cable. Comprobamos el suministro con su carga conectada: importa qué puntos medimos y qué estaba trabajando durante la lectura.', requires: ['beacon_supply'] },
  { id: 'tower_distribution', title: 'Faro · II. El ruido que faltaba', text: 'La corona volvió a girar y Nereo reconoció un golpecito al final de la vuelta. Las luces de la galería ya no están en el mismo camino que el motor.', explanation: 'Óptica, motor y señal costera tienen ramas propias entre los mismos dos nodos. Sus resistencias son diferentes: comparten tensión, pero conducen corrientes distintas. La fuente entrega la suma. Reutilizamos la idea del Castillo en una instalación con más servicios.', requires: ['beacon_network'] },
  { id: 'light', title: 'Faro · III. La Luz', text: 'El haz llegó a la Plaza y una campana respondió. Nereo pidió que dejáramos escrito cómo saber si está bien. Tala ya encontró otra cosa para investigar.', explanation: 'La lente se alimenta desde una toma intermedia de dos resistencias: un divisor de tensión. Al conectarla queda en paralelo con el brazo inferior y cambia el reparto. Por eso calibramos con ella conectada, no sólo en vacío. Dejamos posiciones y condiciones de medida para que otra persona pueda verificar la señal y ajustar cuando algo cambie.', requires: ['beacon_lens'] },
  { id: 'quiet_mount', title: 'Una luz en el Monte Quieto', text: 'Cuando el Faro tomó aire, en la ladera del Monte Quieto se encendió la luz de la Casa de Compuertas. Nadie la encendió. La abuela de Edda decía que esa luz avisaba algo. ¿Qué la alimenta allá arriba, si la casa está cerrada?', requires: ['beacon_lens'], experiment: true },
];

const objectives = [
  ['awaken', { title: 'Una pequeña luz', detail: 'Mirá con Edda al pequeño de bronce sobre el pedestal.', area: 'portal', object: 'ohm_pedestal' }],
  ['workshop', { title: 'El oficio de preguntar', detail: 'Visitá a Lumen en su taller y mirá la lámpara que no enciende.', area: 'workshop', object: 'workbench' }],
  ['bridge_ready', { title: 'El otro lado de la puerta', detail: 'Encontrá a Edda en la Calzada. Las balizas no responden: hay cierres en los dos postes y un puente de cobre que no figura en el dibujo.', area: 'road', object: 'road_bypass' }, 'gate'],
  ['gate', { title: 'El otro lado de la puerta', detail: 'Las balizas responden. Falta el cerrojo: su regulador está junto a la puerta.', area: 'road', object: 'gate_panel' }],
  ['tala_lantern', { title: 'Donde empieza el agua', detail: 'Tala vino al Manantial con su farol y una pregunta: ¿dónde está su fuerza?', area: 'spring', object: 'tala_spring' }, 'pump'],
  ['pump', { title: 'Donde empieza el agua', detail: 'Hablá con Vega en el Manantial y ayudala a mirar la bomba.', area: 'spring', object: 'pump_panel' }],
  ['distribution', { title: 'Una red que se puede comprender', detail: 'En el Castillo, buscá con la Consejera una forma de recuperar servicios sin poner en riesgo a sus vecinos.', area: 'castle', object: 'distribution_panel' }],
  ['irrigation', { title: 'Lo que compartimos', detail: 'Visitá las Terrazas. Yesca necesita trabajar; Vega necesita regar.', area: 'terraces', object: 'irrigation_panel' }],
  ['lake_cable', { title: 'La orilla de la señal', detail: 'Encontrá a Nereo en el lago. Él conoce las uniones del muelle; vos mirá cómo responden las balizas.', area: 'lake', object: 'nereo_lake' }, 'beacon_link'],
  ['beacon_link', { title: 'La orilla de la señal', detail: 'Nereo fijó la bornera. El retorno, entre las cañas, es tuyo: cerralo y mirá las balizas.', area: 'lake', object: 'lake_return' }],
  ['beacon_supply', { title: 'El Faro · I / III', detail: 'Abrí la Fuente del Faro, la primera mesa, al pie de la torre: el núcleo tiene que sostener su pulso.', area: 'lighthouse', object: 'beacon_supply_panel' }],
  ['beacon_network', { title: 'El Faro · II / III', detail: 'A los lados de la mesa II: la manivela izquierda aparta el puente gastado; la derecha acopla el motor. Después abrí la mesa.', area: 'lighthouse', object: 'beacon_network_panel' }],
  ['beacon_lens', { title: 'El Faro · III / III', detail: 'A los lados de la linterna: la manivela izquierda abre el obturador; la derecha suelta el freno de la lente. Después abrí la mesa III.', area: 'lighthouse', object: 'beacon_lens_panel' }],
];

export function getObjective(state) {
  const flags = state.flags || {};
  // A step inside a chapter (the third element names its chapter) no longer counts once the chapter is done.
  const objective = objectives.find(([flag, , chapter]) => !flags[flag] && !(chapter && flags[chapter]))?.[1];
  return objective || (flags.epilogue_shared
    ? { title: 'Un reino que vuelve a preguntar', detail: 'Los habitantes siguen con sus tareas. Podés volver a visitarlos y conservar las preguntas que quedan abiertas.', area: state.area || 'plaza', object: null }
    : { title: 'La primera clase', detail: 'Edda, Lumen y Tala se reúnen junto a la linterna. Acercate a compartir lo que viene después de la reparación.', area: 'lighthouse', object: 'edda_tower' });
}

/** Resolve before saving a conversation, so reload resumes its actual context. */
export function resolveDialogueId(id, state = {}) {
  if (typeof id !== 'string') return id;
  if (state.activeDialogue?.id === id && DIALOGUES[id]) return id;
  const f = state.flags || {};
  let context = id;
  if (id === 'ohm_companion') {
    context = f.epilogue_shared ? 'ohm_final_talk' : f.beacon_lens ? 'ohm_light_talk'
      : ({ portal: 'ohm_portal_talk', plaza: f.pump ? 'ohm_plaza_water_talk' : 'ohm_plaza_talk',
        workshop: 'ohm_workshop_talk', road: 'ohm_road_talk', spring: 'ohm_spring_talk', castle: 'ohm_castle_talk',
        terraces: 'ohm_terraces_talk', lake: 'ohm_lake_talk', lighthouse: 'ohm_tower_talk' })[state.area] || id;
  }
  if (['lumen_before', 'lumen_after'].includes(id) && f.gate) context = 'lumen_gate_after';
  if (id === 'road_edda' && f.bridge_ready) context = 'edda_road_ready';
  if (id === 'castle_edda' && f.distribution) context = 'edda_castle_after';
  if (id === 'lake_edda' && f.beacon_link) context = 'edda_lake_linked';
  if (id === 'edda_tower_before') context = f.beacon_network ? 'edda_tower_network' : f.beacon_supply ? 'edda_tower_source' : id;
  if (id === 'vega_spring' && f.spring_drive) context = 'vega_spring_ready';
  if (id === 'spring_ready' && f.spring_backwards) context = 'spring_ready_backwards';
  if (id === 'consejera_before' && f.castle_ready) context = 'castle_ready';
  if (id === 'yesca_before' && f.forge_limited) context = 'yesca_limited';
  if (id === 'workshop_locked' && f.workshop_feed && !f.workshop_return) context = 'workshop_locked_right';
  if (id === 'distribution_locked') context = f.castle_branch_closed !== false && !f.castle_service ? 'distribution_locked_both' : f.castle_branch_closed !== false ? 'distribution_locked_archive' : !f.castle_service ? 'distribution_locked_trunk' : id;
  if (id === 'beacon_network_locked' && f.beacon_supply) context = !f.tower_isolated && !f.tower_motor ? 'beacon_network_locked_both' : !f.tower_motor ? 'beacon_network_locked_motor' : !f.tower_isolated ? 'beacon_network_locked_bridge' : id;
  if (id === 'beacon_lens_locked' && f.beacon_network) context = !f.tower_shutter && !f.tower_lens_free ? 'beacon_lens_locked_both' : !f.tower_lens_free ? 'beacon_lens_locked_free' : !f.tower_shutter ? 'beacon_lens_locked_shutter' : id;
  if (id === 'irrigation_locked' && f.distribution) context = !f.forge_limited && !f.irrigation_open ? 'irrigation_locked_both' : !f.forge_limited ? 'irrigation_locked_forge' : !f.irrigation_open ? 'irrigation_locked_channel' : id;
  if (id === 'gate_locked' && f.workshop) context = f.road_bypass ? 'gate_locked_bridge' : !f.road_send ? 'gate_locked_west' : !f.road_return ? 'gate_locked_east' : id;
  if (id === 'workshop_locked' && !f.workshop_feed && f.workshop_return) context = 'workshop_locked_left';
  if (id === 'vega_terraces' && f.irrigation_open) context = 'vega_channel_open';
  if (id === 'nereo_lake' && f.beacon_link) context = 'nereo_lake_linked';
  if (id === 'nereo_tower') context = f.beacon_network ? 'nereo_tower_network' : f.beacon_supply ? 'nereo_tower_source' : id;
  if (id === 'tala_plaza') context = f.epilogue_shared ? 'tala_finale' : f.pump ? 'tala_water' : f.workshop ? 'tala_workshop' : id;
  if (id === 'lighthouse_epilogue' && f.epilogue_shared) context = 'edda_after_lesson';
  if (id === 'lumen_epilogue' && f.epilogue_shared) context = 'lumen_epilogue_after';
  if (id === 'tala_epilogue' && f.epilogue_shared) context = 'tala_epilogue_after';
  if (id === 'portal_arch' && f.workshop) context = 'portal_arch_without_edda';
  if (id === 'plaza_statue' && f.workshop && !(f.beacon_lens && f.epilogue_shared)) context = 'plaza_statue_without_edda';
  if (id === 'castle_archive' && f.irrigation) context = 'castle_archive_without_edda';
  if (id === 'spring_levels' && f.distribution) context = 'spring_levels_without_vega';
  if (f.beacon_lens) {
    const afterTheLight = {
      edda_plaza: 'plaza_finale', edda_plaza_after: 'plaza_finale', marin_before: 'marin_finale', marin_after: 'marin_finale',
      lumen_before: 'lumen_finale', lumen_after: 'lumen_finale', consejera_before: 'consejera_finale', consejera_after: 'consejera_finale',
      vega_terraces: 'vega_finale', vega_after: 'vega_finale', spring_after: 'vega_finale',
      yesca_before: 'yesca_finale', yesca_after: 'yesca_finale', nereo_lake: 'nereo_finale',
    };
    if (afterTheLight[id]) context = afterTheLight[id];
    if (id === 'lake_boat') context = 'lake_boat_after';
  }
  if (state.seen?.includes(context) && repeatConversations[context]) return `${context}_repeat`;
  return context;
}

// The first lesson has one moment the player shapes: what to leave Tala before she starts.
// None of the gifts is wrong; each changes how the three of them begin.
export const LESSON_GIFTS = [
  { id: 'sketch', label: 'El dibujo del taller: la tela entera sobre el cobre cortado.', memory: 'el dibujo del taller', lines: d(
    ['tala', '¿La tela puede estar sana y el cobre no?'],
    ['lumen', 'A mí me costó tres lámparas aprenderlo. A vos, un dibujo.'],
    ['edda', 'No le creas al dibujo. Probalo.']) },
  { id: 'failures', label: 'Las pruebas que me salieron mal.', memory: 'las pruebas que salieron mal', lines: d(
    ['tala', 'Acá dice que no funcionó. ¿Para qué lo guardaste?'],
    ['player', 'Porque sin eso, lo que funcionó parece suerte.'],
    ['edda', 'Eso se lo robé a Lumen.'],
    ['lumen', 'Te lo presté. Todavía lo quiero de vuelta.']) },
  { id: 'silence', label: 'Nada todavía. Que mire primero.', memory: 'tiempo para mirar', lines: d(
    ['narrator', 'Nadie dice nada. Tala pasa el dedo por la costura de la lámpara, despacio, dos veces.'],
    ['edda', 'Eso era lo más difícil de darle.'],
    ['narrator', 'Ohm no anota nada.']) },
];
export const lessonGift = state => LESSON_GIFTS.find(g => state?.flags?.[`lesson_gift_${g.id}`]) || null;
function lessonLines(state) {
  const lines = DIALOGUES.lighthouse_epilogue, split = lines.findIndex(l => l.speaker === 'tala' && /reparación vieja/.test(l.text)), gift = lessonGift(state);
  const choice = { speaker: 'player', text: 'Antes de que empiece… ¿qué le dejo a Tala?', choices: LESSON_GIFTS.map(g => ({ id: g.id, label: g.label })) };
  return [...lines.slice(0, split), ...(gift ? gift.lines : [choice]), ...lines.slice(split)];
}

// Terraces: two defensible agreements on the shared line; the closing names the one chosen.
const TERRACES_CLOSE = {
  forja: d(
    ['narrator', 'El primer bancal se llena, más despacio. En la forja, el horno vuelve a rugir.'],
    ['yesca', 'Tandas grandes. Doce azadas antes del mediodía. Vega, te debo tomates.'],
    ['vega', 'Las raíces van justas. Alcanzan, pero la última parcela la voy a mirar todos los días.']),
  riego: d(
    ['narrator', 'El primer bancal se llena. Luego el segundo. En la forja, Yesca retoma su martillo al ritmo de la rueda.'],
    ['yesca', 'Menos por tanda. Más tandas sin parar. Odio cuando algo razonable suena tan poco espectacular.'],
    ['vega', 'El agua llega a la última parcela. Esa era la que nunca llegaba.']),
};
function terracesClose(state) {
  const lines = DIALOGUES.irrigation_complete, agreement = TERRACES_AGREEMENT(state?.puzzles?.irrigation);
  if (!agreement) return lines;
  return [...TERRACES_CLOSE[agreement], ...lines.filter(l => /se lo bebe el agua|anotar|sendero del lago/.test(l.text))];
}

// When the Faro is lit, the Casa de Compuertas answers on the Monte Quieto: steady over a full
// reservoir, faltering over one the Terrazas drew down (quiet-mount.js).
function finaleLines(state) {
  const lines = DIALOGUES.beacon_lens_complete, at = lines.findIndex(l => /Coincidencia registrada/.test(l.text)) + 1, mount = quietMountState(state);
  const answer = [
    { speaker: 'narrator', text: 'Al oeste, en la ladera del Monte Quieto, se enciende una ventana de la Casa de Compuertas. Nadie la encendió.' },
    { speaker: 'edda', text: '¿La Casa de Compuertas? Mi abuela decía que esa luz avisaba algo. Nunca supo qué.' },
    ...(mount.lamp === 'flicker'
      ? [{ speaker: 'ohm', text: 'Parpadea. Le falta fuerza.' }, { speaker: 'edda', text: 'Las Terrazas se llevaron el agua primero. Allá arriba quedó poca.' }]
      : [{ speaker: 'ohm', text: 'Se sostiene. Algo, allá arriba, todavía la alimenta.' }]),
  ];
  return [...lines.slice(0, at), ...answer, ...lines.slice(at)];
}

export function resolveDialogue(id, state = {}) {
  const resolved = resolveDialogueId(id, state);
  if (resolved === 'beacon_lens_complete') return finaleLines(state);
  if (resolved === 'irrigation_complete') return terracesClose(state);
  if (resolved === 'lighthouse_epilogue') return lessonLines(state);
  if (resolved === PUZZLE_STORY.gate.complete) return completionLines('gate', state);
  return DIALOGUES[resolved] || [];
}

/** Small observations while travelling. These never contain required instructions. */
export const OHM_CHATTER = {
  portal: [
    { id: 'ohm_portal_1', text: 'Mi primer registro nuevo: alguien decidió detenerse a ayudar.', requires: ['awaken'] },
    { id: 'ohm_portal_2', text: 'Hay musgo en mi base. No recuerdo haber autorizado un jardín.', requires: ['awaken'] },
    { id: 'ohm_portal_3', text: 'Si tropiezo, estoy comprobando la gravedad. Con bastante compromiso.', requires: ['awaken'] },
  ],
  plaza: [
    { id: 'ohm_plaza_fiesta', text: 'Colgaron las cintas. Una predicción guardada durante años, confirmada. Voy a necesitar un instrumento para medir esto.', requires: ['epilogue_shared'] },
    { id: 'ohm_plaza_1', text: 'Conservaron las cintas de la fiesta. Me parece una forma muy humana de hacer una predicción.', unless: ['epilogue_shared'] },
    { id: 'ohm_plaza_2', text: 'Percibo pan caliente. No necesito comer, pero considero injusto perderme la parte social.' },
    { id: 'ohm_plaza_3', text: 'El agua volvió a la fuente. Esta consecuencia empezó detrás de una colina.', requires: ['pump'] },
  ],
  workshop: [
    { id: 'ohm_workshop_1', text: 'Lumen tiene una taza por cada superficie disponible. La precisión de esa distribución es notable.' },
    { id: 'ohm_workshop_2', text: 'Lumen reconoce sus piezas por el sonido. Yo todavía estoy aprendiendo a distinguir sus tazas.' },
    { id: 'ohm_workshop_3', text: 'Ese esquema tiene manchas nuevas. Buen indicio: alguien lo está usando.', requires: ['workshop'] },
  ],
  road: [
    { id: 'ohm_road_1', text: 'Edda dijo que no compite. Lo anoté junto a las tres veces que informó haber llegado antes.' },
    { id: 'ohm_road_2', text: 'El Faro parece una aguja desde acá. No recomiendo utilizarlo como una.' },
    { id: 'ohm_road_3', text: 'La puerta sigue abierta aunque ya no la estemos mirando. Disfruto mucho de las reparaciones así.', requires: ['gate'] },
  ],
  spring: [
    { id: 'ohm_spring_1', text: 'Vega distingue el agua por su sonido. Yo distingo cuándo se me acerca demasiado.' },
    { id: 'ohm_spring_2', text: 'La rueda gira. El eje también. Puedo registrar dos movimientos sin conocer todavía el resultado de la bomba.', requires: ['spring_drive'] },
    { id: 'ohm_spring_3', text: 'El musgo no lee nuestros carteles de mantenimiento. Habrá que seguir visitando este lugar.', requires: ['pump'] },
  ],
  castle: [
    { id: 'ohm_castle_1', text: 'Puedo contar los sellos. Entender el miedo que los puso lleva un poco más.' },
    { id: 'ohm_castle_2', text: 'El archivo conserva una solicitud de respuesta urgente de hace treinta y siete años. Empiezo a dudar de la palabra urgente.' },
    { id: 'ohm_castle_3', text: 'El plano está al alcance de todos. La altura de un documento también es una decisión técnica.', requires: ['distribution'] },
  ],
  terraces: [
    { id: 'ohm_terraces_1', text: 'Yesca y Vega discuten mucho para dos personas que siempre se guardan el almuerzo.' },
    { id: 'ohm_terraces_2', text: 'Siete etiquetas tachadas y una planta. El archivo de Vega ocupa tierra, pero admite consultas.' },
    { id: 'ohm_terraces_3', text: 'La forja, el riego, las raíces. Tres ritmos distintos pueden compartir un mismo día.', requires: ['irrigation'] },
  ],
  lake: [
    { id: 'ohm_lake_1', text: 'El Faro refleja luz aunque no la produzca. Parecer encendido y estar funcionando son cosas distintas.', unless: ['beacon_lens'] },
    { id: 'ohm_lake_2', text: 'Nereo camina al ritmo de una máquina que todavía está quieta. Cuarenta años de memoria en los pies.', unless: ['beacon_network'] },
    { id: 'ohm_lake_3', text: 'Ahora el reflejo llega hasta el muelle. Entiendo por qué guardaron las cintas.', requires: ['beacon_lens'] },
  ],
  lighthouse: [
    { id: 'ohm_lighthouse_1', text: 'Una fuente. Algunos caminos. Varias cargas. La torre es grande; nuestras preguntas pueden seguir siendo pequeñas.', unless: ['beacon_lens'] },
    { id: 'ohm_lighthouse_2', text: 'Empiezo a reconocer el sonido de esta corona. Lo nuevo y lo recordado se parecen bastante.', requires: ['beacon_network'], unless: ['beacon_lens'] },
    { id: 'ohm_lighthouse_3', text: 'Gracias por traerme. Es un dato que no quiero dejar fuera de la Bitácora.', requires: ['beacon_lens'] },
  ],
};

export const ARC_TITLE = 'LA LUZ';
export const TOTAL_SECRETS = Object.values(AREAS).flatMap(area => area.objects).filter(object => object.secret).length;
