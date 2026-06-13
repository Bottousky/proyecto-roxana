import { state } from '../state';

export interface EntryView {
  id: string;
  title: string;
  fecha: string;
  /** capa vivencial: lo que el protagonista vivió, en su voz y en lenguaje diegético */
  vivencial: string;
  /** capa formal: el "nombre verdadero" de las cosas; null = entrada solo vivencial */
  formal: string | null;
}

/**
 * Las entradas se desbloquean por flags de comprensión (lo que el jugador YA vivió),
 * nunca por avance de trama. Algunas se completan solas más adelante:
 * la Bitácora es un documento vivo.
 */
export function getEntries(): EntryView[] {
  const f = state.flags;
  const out: EntryView[] = [];

  if (f.hasBitacora) {
    out.push({
      id: 'hall',
      title: 'El hall del Instituto',
      fecha: 'Primer día',
      vivencial: `
        <p>Un boceto apurado del hall. Un lugar enorme para tan poca gente.
        Trofeos con polvo. Un cartel de honores con los nombres borrados.</p>
        <p>Este lugar fue importante. ¿Qué pasó?</p>
        <p>El cuaderno se escribió solo cuando lo abrí. La tapa dice
        <em>«Bitácora de Mundos Aplicados»</em>. ¿Qué es un Mundo Aplicado?</p>`,
      formal: null,
    });
  }

  if (f.ohmAwake) {
    out.push({
      id: 'camino',
      title: 'El camino completo',
      fecha: 'Ohmdal — la plaza',
      vivencial: `
        <p>Ohm no despertaba aunque la fuente tenía fuerza. Probé de todo.
        Solo cuando el camino estuvo completo —sin un solo hueco, de la fuente
        a Ohm y de vuelta a la fuente— la chispa corrió y abrió los ojos.</p>
        <p>Un hueco. Uno solo. Y nada se mueve en <em>ninguna</em> parte del camino.</p>`,
      formal: `
        <p>Para que algo circule, el camino tiene que estar cerrado de punta a punta:
        salir de la fuente, atravesar todo, y <strong>volver</strong>. No alcanza con llegar.</p>
        <p>Si el anillo se corta en cualquier punto, no pasa nada en ningún punto.
        No es que la chispa «llega hasta el corte y espera»: directamente no circula.</p>
        <h4>Error común</h4>
        <p>Pensar la chispa como una flecha que «sale y llega». No: o circula por
        todo el anillo, o no circula nada.</p>
        ${f.puertaDone
          ? `<h4>Nombre verdadero</h4>
             <p>Los Maestros lo llamaban <strong>circuito cerrado</strong>.
             Lo encontré detrás de la Puerta.</p>`
          : `<p class="blank">Los Maestros tenían un nombre para esto.
             Todavía no lo encontré.</p>`}
        <div class="pregunta">✎ Piensa en tu casa: ¿qué aparato es, en el fondo,
        un «hueco a propósito» en un camino, puesto ahí para abrirlo y cerrarlo a voluntad?</div>`,
    });
  }

  if (f.frenoDone) {
    out.push({
      id: 'freno',
      title: 'La Piedra de Freno',
      fecha: 'Ohmdal — taller de Maese Lumen',
      vivencial: `
        <p>La Lámpara Eterna de Lumen escupía chispas: tenía puesta una piedra rajada,
        casi sin cuerpo. Demasiado río junto.</p>
        <p>La piedra gris (la que más frena) la dejaba viva pero tristona.
        La amarilla la dejó firme y tibia. Más piedra, menos río.
        Menos piedra, más río… hasta que algo se quema.</p>`,
      formal: `
        <p>Toda piedra frena el paso del río. Y el freno <strong>no es el enemigo</strong>:
        sin freno suficiente, el río arrasa con lo que toca. El freno dosifica.</p>
        <h4>El código de colores</h4>
        <p>Las piedras llevan una marca de color: <strong>marrón</strong> frena poco,
        <strong>roja</strong> un poco más, <strong>amarilla</strong> bastante,
        <strong>gris</strong> mucho. Lumen lo llama «el código de los Maestros».
        Hay un orden ahí. No es decoración.</p>
        ${f.puertaDone
          ? `<h4>Nombre verdadero</h4>
             <p>La piedra es una <strong>resistencia (R)</strong>. Y el código de colores
             de los Maestros existe de verdad fuera de Ohmdal: las resistencias reales se
             marcan con bandas de color. El código completo va del 0 al 9:</p>
             <table><tr><th>Color</th><th>Cifra</th><th>Color</th><th>Cifra</th></tr>
             <tr><td>Negro</td><td>0</td><td>Verde</td><td>5</td></tr>
             <tr><td>Marrón</td><td>1</td><td>Azul</td><td>6</td></tr>
             <tr><td>Rojo</td><td>2</td><td>Violeta</td><td>7</td></tr>
             <tr><td>Naranja</td><td>3</td><td>Gris</td><td>8</td></tr>
             <tr><td>Amarillo</td><td>4</td><td>Blanco</td><td>9</td></tr></table>
             <p>Por eso la marrón (1) frenaba poco y la gris (8) frenaba mucho.</p>`
          : `<p class="blank">¿Por qué justo esos colores? ¿Qué cifra esconde cada uno?
             Falta una pieza.</p>`}
        <h4>Error común</h4>
        ${f.burnedSomething
          ? `<p>Lo comprobé con humo: poca piedra no significa «más potencia útil».
             Significa exceso. Y el exceso rompe.</p>`
          : `<p class="blank">(Aquí hay dibujada una mancha de humo, pero a mí no se me
             quemó nada todavía. ¿Qué pasa si pongo la piedra que MENOS frena y bajo
             la palanca? …No lo probé.)</p>`}
        <div class="pregunta">✎ ¿Qué piedra dejaría pasar exactamente la mitad de río
        que la amarilla? Las marcas de color dan la pista.</div>`,
    });
  }

  if (f.puertaDone) {
    out.push({
      id: 'ley-de-ohm',
      title: 'La Ley de Ohm',
      fecha: 'Ohmdal — la Puerta',
      vivencial: `
        <p>La Puerta no quería fuerza: quería <em>medida</em>. Empuje fuerte con freno
        fuerte. Empuje suave con freno suave. Pares distintos, el mismo río.</p>
        <p>Solo se abrió cuando el caudal fue el justo. Ni hambrienta ni ahogada.</p>
        <p>Y entonces la Bitácora ardió, y escribió esto sola:</p>`,
      formal: `
        <p>El río crece con el empuje y baja con el freno. Esa relación tiene nombre
        y forma exacta:</p>
        <div class="formula">I&nbsp;=&nbsp;V&nbsp;/&nbsp;R</div>
        <h4>Los nombres verdaderos</h4>
        <table>
          <tr><th>En Ohmdal</th><th>Nombre verdadero</th><th>Unidad</th></tr>
          <tr><td>El Empuje</td><td>Tensión (V)</td><td>volts (V)</td></tr>
          <tr><td>El Río / la Chispa</td><td>Corriente (I)</td><td>amperes (A)</td></tr>
          <tr><td>La Piedra de Freno</td><td>Resistencia (R)</td><td>ohms (Ω)</td></tr>
          <tr><td>El camino completo</td><td>Circuito cerrado</td><td>—</td></tr>
        </table>
        <p><em>Ω… como Ohm. El guardián se llama como la unidad.
        ¿O la unidad como el guardián?</em></p>
        <h4>Por qué la Puerta aceptó varias llaves</h4>
        <p>Empuje 16 con piedra gris (8): 16 / 8 = 2.<br/>
        Empuje 8 con piedra amarilla (4): 8 / 4 = 2.<br/>
        Empuje 4 con piedra roja (2): 4 / 2 = 2.<br/>
        Tres pares distintos, el mismo río. La Puerta no medía el empuje ni la piedra:
        medía <strong>la relación entre los dos</strong>.</p>
        <h4>Errores comunes</h4>
        <p>· Creer que más empuje siempre da más luz útil. No: sin freno suficiente, rompe.<br/>
        · Creer que el freno «gasta» el río para mal. No: lo dosifica para que sirva.</p>
        <div class="pregunta">✎ Si el Empuje se duplica y la Piedra también se duplica,
        ¿el Río cambia? Vuelve a la Puerta y pruébalo. La Puerta no se ofende.</div>`,
    });
  }

  if (f.solvedBellPaths) {
    out.push({
      id: 'dos-caminos',
      title: 'Dos caminos',
      fecha: 'Ohmdal — la plaza',
      vivencial: `
        <p>Medición de la campana: medio río y medio río; el tronco lleva todo;
        un camino abierto no pierde su río — se muda al hermano.</p>
        <p>Los Maestros duplicaban caminos como promesa, no como gasto.</p>`,
      formal: `
        ${f.learnedSeriesParallel
          ? `<h4>Nombre verdadero</h4>
             <p>En un cruce, la corriente se reparte entre los caminos; la suma de
             lo que sale es igual a lo que entra.</p>
             <h4>Error común</h4>
             <p>Creer que la corriente «se gasta» al repartirse.</p>`
          : `<p class="blank">Los Maestros tenían un nombre para esto.
             Todavía no lo encontré.</p>`}`,
    });
  }

  if (f.solvedGalleryChain) {
    out.push({
      id: 'la-cadena',
      title: 'La Cadena',
      fecha: 'Ohmdal — el Castillo',
      vivencial: `
        <p>Todas las lámparas igual de tenues; quitar una mata todas;
        Ohm midió el mismo río en cada punto de la fila.</p>`,
      formal: `
        ${f.learnedSeriesParallel
          ? `<h4>Nombre verdadero</h4>
             <p>Eso se llama <strong>circuito en serie</strong>: un solo camino,
             una sola corriente, y las resistencias <strong>se suman</strong>.</p>
             <p>Las lámparas en serie no se reparten corriente: la comparten entera,
             frenándola entre todas.</p>
             <h4>Error común</h4>
             <p>«La primera lámpara brilla más» — no: en serie no hay primera ni
             última para el río.</p>
             <div class="pregunta">✎ ¿Las luces de tu casa estarán en fila?
             Pista: ¿qué pasa cuando se quema una sola?</div>`
          : `<p class="blank">Los Maestros tenían un nombre para esto.
             Todavía no lo encontré.</p>`}`,
    });
  }

  if (f.solvedBranches) {
    out.push({
      id: 'los-ramales',
      title: 'Los Ramales',
      fecha: 'Ohmdal — el Castillo',
      vivencial: `
        <p>Cada rama cobró según su piedra; conectar una rama no cambió a las otras;
        el Tronco pagó la suma${f.burnedTrunkFuse
          ? ' y el Fusible mayor se inmoló cuando pedimos de más.'
          : '.'}</p>`,
      formal: `
        ${f.learnedSeriesParallel
          ? `<h4>Nombre verdadero</h4>
             <p>Eso se llama <strong>circuito en paralelo</strong>: cada rama recibe
             el mismo Empuje y toma su propia corriente
             (<strong>I = V/R</strong>, ¡la de la Puerta!, una vez por rama).
             La fuente entrega la suma.</p>
             <h4>Error común</h4>
             ${f.burnedTrunkFuse
               ? `<p>«Agregar ramas es gratis» — cada rama nueva es corriente nueva
                  que el Tronco debe poder llevar. El Fusible mayor se inmoló cuando
                  pedimos de más.</p>`
               : `<p class="blank">(Aquí hay dibujado el Fusible mayor, pero todavía
                  no se inmoló. ¿Qué pasa si conecto las tres ramas con piedras
                  glotonas, marrón en todas, en modo práctica? …No lo probé.)</p>`}`
          : `<p class="blank">Los Maestros tenían un nombre para esto.
             Todavía no lo encontré.</p>`}`,
    });
  }

  if (f.learnedSeriesParallel) {
    out.push({
      id: 'regla-del-cruce',
      title: 'La Regla del Cruce',
      fecha: 'Ohmdal — el Castillo',
      vivencial: `
        <p><strong>El río no se gasta. Se reparte.</strong><br/>
        Lo que entra en un cruce, sale del cruce.</p>
        <p>Con la red del Repartidor dibujada y las dos soluciones equivalentes
        anotadas.</p>`,
      formal: `
        <h4>Los nombres verdaderos</h4>
        <table>
          <tr><th>En Ohmdal</th><th>Nombre verdadero</th></tr>
          <tr><td>La Cadena</td><td><strong>serie</strong></td></tr>
          <tr><td>Los Ramales</td><td><strong>paralelo</strong></td></tr>
          <tr><td>El Cruce</td><td><strong>nodo</strong></td></tr>
        </table>
        <p><em>Mucho después, alguien le puso su apellido a la regla del cruce:
        Kirchhoff. Pero el cruce ya la sabía.</em></p>
        <div class="pregunta">✎ El timbre de la escuela tiene dos caminos.
        ¿Para qué, ahora que lo sabes?</div>`,
    });
  }

  if (f.sawStoredSpark) {
    out.push({
      id: 'anomalia-chispa',
      title: 'Anomalía: la chispa que se queda',
      fecha: 'Ohmdal — el Corazón del Castillo',
      vivencial: `
        <p>Se cortó el Tronco para el acta. El Repartidor quedó sin camino.</p>
        <p>Un mecanismo auxiliar del tablero siguió brillando tres segundos, solo,
        sin camino.</p>
        <p>Edda lo vio. Yo lo vi. La Consejera decidió no anotarlo.</p>
        <p class="blank">No tengo explicación. Solo el registro del hecho.</p>`,
      formal: null,
    });
  }

  /* ============ UNIDAD 3 — La Forja ============ */

  if (f.solvedWarmChannel) {
    out.push({
      id: 'el-peaje',
      title: 'El peaje',
      fecha: 'La Forja — el patio',
      vivencial: `
        <p>Ohm apoyó la mano en los canales y reportó el calor de cada uno.</p>
        <p>El mismo río por un canal ancho: frío. Por uno angosto: al rojo.
        El río no cambió — cambió el cauce.</p>
        <p>El canal viejo, sin río, estaba helado. Cien años y helado.
        Así que no es la edad.</p>
        <p>Al duplicar el río del yunque, el termómetro saltó de tibio a al rojo
        de un golpe, sin pasar por caliente. Dos niveles de un salto.</p>`,
      formal: f.learnedPower
        ? `
        <h4>El efecto Joule</h4>
        <p>El calor que cobra el canal crece mucho más rápido que el río:
        «el doble de río, cuatro veces el peaje» — medido, no formulado.
        No es fantasma ni vejez: es el precio del paso.</p>
        <h4>Error común</h4>
        <p>«El calor es porque el cable está viejo.» El canal nuevo con río grande
        calienta igual: el peaje depende del río y del cauce, no de la edad.</p>`
        : `<p class="blank">La Bitácora tiene espacio para el nombre de esto.
           Todavía no llegó.</p>`,
    });
  }

  if (f.solvedFuseInfirmary) {
    out.push({
      id: 'martir-margen',
      title: 'El mártir y el margen',
      fecha: 'La Forja — enfermería de fusibles',
      vivencial: `
        <p>El fusible justo muere al arrancar: el pico de arranque lo supera,
        y se va antes de que la máquina empiece a trabajar.</p>
        <p>El fusible demasiado gordo no salta nunca — y deja morir al canal.
        El canal cuesta una semana. El fusible, un cobre.</p>
        <p>Lumen lo resumió: un mártir por año es santidad. Uno por semana es
        mal cálculo. La respuesta era margen: elegir el margen.</p>
        ${f.burnedChannelDemo
          ? `<h4>El canal cortado</h4>
             <p>Vi el canal cortarse cuando el fusible gordo no lo protegió.
             Yesca lo reemplazó. Entendí por qué el gordo no era un santo:
             era un cómplice.</p>`
          : `<p class="blank">(Hay un espacio en blanco aquí. La demo del fusible
             gordo se puede revisar en modo práctica en la enfermería.)</p>`}`,
      formal: f.learnedPower
        ? `
        <h4>El fusible y el margen</h4>
        <p>El fusible correcto es el menor calibre que el pico de arranque no supera,
        y que salte antes de que el canal llegue al rojo. Con margen sobre el pico
        y por debajo de lo que aguanta el canal.</p>
        <h4>Error común</h4>
        <p>«Más grande aguanta más.» Un fusible que no puede morir no protege nada:
        deja morir a lo que está detrás.</p>`
        : `<p class="blank">Los Maestros tenían un nombre para esto.
           Todavía no llegó.</p>`,
    });
  }

  if (f.solvedLongChannel) {
    out.push({
      id: 'la-entrega',
      title: 'La Entrega',
      fecha: 'La Forja — el Canal Largo',
      vivencial: `
        <p>El horno lejano pedía entrega 16. Con río 4 por el canal angosto,
        la entrega llegaba — pero el canal se ponía al rojo.</p>
        <p>Con mucho empuje y poco río, la misma entrega 16 llegaba al horno
        y el canal quedaba frío. O tibio, al límite justo.
        El horno no distinguía. El canal, sí.</p>
        <p>Yesca apoyó la mano en el canal y la dejó ahí:
        «El río no se gasta. El río trabaja. Y el trabajo se paga.
        …Por fin alguien que lo dice con números.»</p>`,
      formal: f.learnedPower
        ? `
        <h4>Potencia = empuje × río (P = V·I)</h4>
        <p>Lo que llega al horno no es río: es empuje multiplicado por río.
        El vatio es la unidad de esa entrega. La misma entrega puede viajar
        con poco río y mucho empuje — y el canal agradece el río pequeño.</p>
        <div class="pregunta">✎ ¿Por qué los cables que cruzan el campo van
        tan alto y con tanto empuje?</div>`
        : `<p class="blank">La Bitácora tiene espacio para el nombre de esto.
           Todavía no llegó.</p>`,
    });
  }

  if (f.learnedPower) {
    out.push({
      id: 'el-jornal',
      title: 'El Jornal',
      fecha: 'La Forja — nave mayor',
      vivencial: `
        <p>La Forja cantó. Los tres ritmos se trabaron en un compás: el Martillo marcaba,
        el Fuelle respiraba, la Lumbre sostenía.</p>
        <p>La Consejera abrió un libro nuevo, flamante, y leyó los números del inventario
        en voz alta. La Bitácora ardió y se abrió sola.</p>`,
      formal: `
        <h4>Energía = potencia × tiempo</h4>
        <p>La Consejera abrió su libro y leyó el inventario de la Forja encendida:</p>
        <table>
          <tr><th>Máquina</th><th>Jornales por hora</th></tr>
          <tr><td>Martillo</td><td>32</td></tr>
          <tr><td>Fuelle</td><td>16</td></tr>
          <tr><td>Lumbre</td><td>8</td></tr>
          <tr><td><strong>Total</strong></td><td><strong>56</strong></td></tr>
        </table>
        <p>Y luego, del libro viejo: los lacres ceremoniales del Consejo consumían
        9 jornales por hora. La biblioteca, 8.
        Cuarenta años lacrando puertas con más entrega de la que ahorraban al lacrarlas.</p>
        <p><em>Mucho después, a la entrega le pusieron Watt, y al jornal, joule.
        El peaje también se llama joule. No es casualidad: es la misma moneda.</em></p>
        <div class="pregunta">✎ Busca en tu casa un aparato que diga "W".
        Ese número es su hambre.</div>`,
    });
  }

  /* ============ UNIDAD 4 — Las Terrazas ============ */

  if (f.solvedVoltageSteps) {
    out.push({
      id: 'los-escalones',
      title: 'Los escalones',
      fecha: 'Las Terrazas — el canal alto',
      vivencial: `
        <p>El empuje cae piedra a piedra, por escalones. La vuelta completa siempre
        cierra en cero: todo lo que sube, baja.</p>
        <p>El río, en cambio, es el mismo en toda la fila.</p>`,
      formal: f.learnedKVL
        ? `
        <h4>La Regla de la Vuelta</h4>
        <p>La ley de tensiones de Kirchhoff (KVL) dice que, en toda vuelta cerrada,
        las subidas y bajadas de tensión se cancelan.</p>
        <p><em>El mismo apellido de la regla del cruce. Kirchhoff tenía dos reglas
        y ningún apuro.</em></p>
        <h4>Error común</h4>
        <p>Confundir empuje con río: el empuje cae por escalones; el río, en una fila, no.</p>`
        : `<p class="blank">La Bitácora tiene espacio para el nombre de esta regla.
           Todavía no llegó.</p>`,
    });
  }

  if (f.solvedFairSplit) {
    out.push({
      id: 'reparto-empuje',
      title: 'El reparto del empuje',
      fecha: 'Las Terrazas — el reparto',
      vivencial: `
        <p>Dos terrazas, una proporción 2:1 y más de una solución.</p>
        <p>Las dos soluciones que probé repartían el mismo empuje: la de piedras
        grandes pedía menos río al manantial.</p>`,
      formal: f.learnedKVL
        ? `
        <h4>Divisor de tensión</h4>
        <p>Cada resistencia cobra tensión en proporción a su freno.</p>
        <h4>Error común</h4>
        <p>Creer que «la piedra grande aguanta y la chica sufre»: cobran
        proporcionalmente; ninguna sufre.</p>`
        : `<p class="blank">La Bitácora tiene espacio para el nombre de este reparto.
           Todavía no llegó.</p>`,
    });
  }

  if (f.solvedSingleStone) {
    out.push({
      id: 'la-piedra-unica',
      title: 'La Piedra Única',
      fecha: 'Las Terrazas — el mural de los Maestros',
      vivencial: `
        <p>Una red entera puede esconderse dentro de una piedra. Ohm midió los dos
        lados y no pudo distinguir la red de la Piedra Única.</p>`,
      formal: f.learnedKVL
        ? `
        <h4>Resistencia equivalente</h4>
        <p>Una red puede reemplazarse por una resistencia equivalente. En fila,
        las resistencias se suman; dos resistencias iguales en paralelo equivalen
        a la mitad de una.</p>
        <div class="pregunta">✎ Si toda red puede ser una sola piedra...
        ¿qué piedra es tu casa entera, vista desde el medidor de la entrada?</div>`
        : `<p class="blank">La Bitácora tiene espacio para el nombre de la Piedra Única.
           Todavía no llegó.</p>`,
    });
  }

  if (f.learnedKVL) {
    out.push({
      id: 'la-escalera',
      title: 'La Escalera',
      fecha: 'Las Terrazas — el acueducto del valle',
      vivencial: `
        <p>Plegué la Escalera etapa por etapa, desde el fondo, hasta mirar el valle
        entero como una sola piedra.</p>
        <p>La Bitácora estrenó una página de predicción: lo esperado, lo medido
        y la palabra <strong>IGUALES</strong>.</p>`,
      formal: `
        <h4>El método de plegado</h4>
        <p>Desde la última etapa, cada tramo y cada ramal se reemplazan por su
        resistencia equivalente. El resultado se vuelve a plegar hasta obtener
        una sola resistencia para toda la red.</p>
        <p>Hoy la Bitácora dejó de ser un diario. Ahora también es un mapa de lo
        que va a pasar.</p>
        <div class="pregunta">✎ Antes de enchufar algo nuevo en tu casa, ¿podrías
        decir si la llave va a saltar? Esa pregunta ya es ingeniería.</div>`,
    });
  }

  /* ============ UNIDAD 5 — El Faro ============ */

  if (f.solvedStoredSpark) {
    out.push({
      id: 'la-chispa-que-se-queda',
      title: 'La chispa que se queda',
      fecha: 'El Faro — sala de la máquina',
      vivencial: `
        <p>El Estanque, ya lleno, brilló sin camino. No era una regla rota:
        lo guardado se devuelve.</p>
        <p>Primero dejó pasar el río. Después, cuando estuvo lleno, se volvió
        una pared que recuerda.</p>`,
      formal: f.learnedCapacitor
        ? `
        <h4>El capacitor</h4>
        <p>El Estanque es un <strong>capacitor</strong>: un almacén de carga.</p>
        <h4>Error común</h4>
        <p>«El capacitor deja pasar el río.» Pasa mientras se llena; lleno,
        es una pared que recuerda.</p>`
        : `<p class="blank">La Bitácora tiene espacio para el nombre verdadero
           del Estanque. Todavía no llegó.</p>`,
    });
  }

  if (f.solvedSleepingRiver) {
    out.push({
      id: 'el-rio-que-se-duerme',
      title: 'El río que se duerme',
      fecha: 'El Faro — taller del Farero',
      vivencial: `
        <p>La aguja murió sola mientras el Estanque se llenaba.</p>
        <p>El Estanque grande y el canal angosto tardaron más. El chico y el
        canal ancho, casi nada. La espera también se puede elegir.</p>`,
      formal: f.learnedCapacitor
        ? `
        <p>La <strong>carga no es instantánea</strong>: el tiempo de llenado
        crece con el tamaño del Estanque y con el freno del canal.</p>
        <div class="pregunta">✎ ¿Qué se llena despacio y se vuelca de golpe
        en tu casa? Pista: hay una en el baño.</div>`
        : `<p class="blank">La Bitácora espera el nombre verdadero de esta
           demora. Todavía no llegó.</p>`,
    });
  }

  if (f.solvedClock) {
    out.push({
      id: 'el-tic',
      title: 'El tic',
      fecha: 'Ohmdal — Torre del Reloj',
      vivencial: `
        <p>El Reloj aceptó tres soluciones distintas: Estanque chico con freno
        grande, mediano con mediano, grande con chico.</p>
        <p>Otro Estanque. El mismo tiempo. Tres caminos para un tic justo.</p>`,
      formal: f.learnedCapacitor
        ? `
        <p><strong>Llenado + umbral = ritmo.</strong> Elegir Estanque y freno
        es elegir el tiempo.</p>
        <p><em>Mucho después lo llamaron circuito RC. La R y la C son la piedra
        y el estanque. El tiempo siempre fue de ellos.</em></p>`
        : `<p class="blank">La Bitácora dejó un margen para el nombre de este
           ritmo. Todavía no llegó.</p>`,
    });
  }

  if (f.learnedCapacitor) {
    out.push({
      id: 'el-arco-del-rio',
      title: 'El Arco del Río',
      fecha: 'Ohmdal — la noche completa',
      vivencial: `
        <p>El mapa de Ohmdal está completo: la plaza con su campana, el Castillo
        con sus tres distritos, la Forja en ritmo, las Terrazas regadas, el Reloj
        marcando y el Faro latiendo sobre el lago.</p>
        <p>Cinco restauraciones. Cinco lecciones. Una sola red viva en el tiempo.</p>`,
      formal: f.learnedCapacitor
        ? `
        <h4>Las cinco reglas del Arco del Río</h4>
        <ol>
          <li><strong>La Ley de Ohm:</strong> el río crece con el empuje y baja
          con el freno.</li>
          <li><strong>La Regla del Cruce:</strong> el río no se gasta; se reparte.
          Lo que entra en un cruce, sale.</li>
          <li><strong>La Entrega:</strong> el trabajo que llega es empuje por río,
          y el paso cobra su peaje.</li>
          <li><strong>La Regla de la Vuelta:</strong> en una vuelta completa,
          todo lo que sube, baja.</li>
          <li><strong>La Chispa que se queda:</strong> puede guardarse, esperar
          y volver cuando el camino la necesita.</li>
        </ol>
        <p><strong>El río ya no es un misterio. Ahora es una herramienta.
        Lo que sigue no es más río: es enseñarle a decidir.</strong></p>
        <div class="pregunta">✎ <strong>El ojo de cristal</strong><br/><br/>
        <span class="blank">Esta página está en blanco.</span></div>`
        : `<p class="blank">Las reglas esperan su nombre verdadero.</p>`,
    });
  }

  return out;
}
