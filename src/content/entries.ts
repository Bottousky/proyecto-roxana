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
        Recién cuando el camino estuvo completo —sin un solo hueco, de la fuente
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
        <div class="pregunta">✎ Pensá en tu casa: ¿qué aparato es, en el fondo,
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
          : `<p class="blank">(Acá hay dibujada una mancha de humo, pero a mí no se me
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
        ¿el Río cambia? Volvé a la Puerta y probalo. La Puerta no se ofende.</div>`,
    });
  }

  return out;
}
