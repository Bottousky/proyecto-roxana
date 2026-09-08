/** Original reading material for the Institute. Text is rendered with textContent.
 * Narrative summaries follow docs/ohmdal-biblia and the current world AGENTS;
 * educational examples are exercises, not new events or places in the canon.
 */
export type LibraryWorld =
  | 'roxana'
  | 'ohmdal'
  | 'bitland'
  | 'physica'
  | 'arithmos';
export type LibraryCategory =
  | 'proyecto'
  | 'historia'
  | 'creacion'
  | 'electricidad'
  | 'programacion'
  | 'fisica'
  | 'matematica';
export interface LibrarySection {
  title: string;
  paragraphs: string[];
}
export interface LibraryArticle {
  id: string;
  title: string;
  category: LibraryCategory;
  world: LibraryWorld;
  readMinutes: number;
  description: string;
  sections: LibrarySection[];
}

export const LIBRARY_ARTICLES: readonly LibraryArticle[] = [
  {
    id: 'que-es-roxana',
    title: 'Roxana: aprender actuando',
    category: 'proyecto',
    world: 'roxana',
    readMinutes: 3,
    description:
      'Una guía del Instituto, sus cuatro disciplinas y el papel de la Bitácora.',
    sections: [
      {
        title: 'Un lugar que conecta preguntas',
        paragraphs: [
          'Roxana es un proyecto de aventuras educativas para la web. El Instituto reúne puertas hacia mundos aplicados: Ohmdal se ocupa de electricidad y electrónica; Bitland, de programación; Physica, de física; Arithmos, de matemática. Cada disciplina propone una manera distinta de intervenir: conectar, programar, experimentar y transformar.',
          'Estos verbos expresan una intención de diseño. No significan que todas las campañas estén terminadas. Ohmdal y Physica tienen experiencias en desarrollo; Bitland y Arithmos tienen diseños e investigación. Las prácticas de esta biblioteca son materiales del Instituto y no reemplazan esas aventuras.',
        ],
      },
      {
        title: 'De la acción a la explicación',
        paragraphs: [
          'El recorrido empieza con algo observable: una luz apagada, un movimiento, una máquina detenida o una estructura que puede reorganizarse. Antes de conocer el nombre formal del concepto, el jugador puede mirar, probar y comparar consecuencias.',
          'La Bitácora ayuda a convertir lo vivido en una explicación. No basta con recordar qué botón funcionó: interesa reconocer qué cambió, qué se conservó y por qué una intervención produjo ese resultado. Aprender también incluye aplicar esa relación en una situación distinta.',
        ],
      },
      {
        title: 'Cómo usar estas lecturas',
        paragraphs: [
          'Podés leer para preparar una pregunta o volver después de experimentar. Los capítulos técnicos usan ejemplos pequeños con supuestos explícitos. Los textos de historia describen la premisa del proyecto sin convertir sus propuestas futuras en hechos ya jugables.',
        ],
      },
    ],
  },
  {
    id: 'memoria-de-ohmdal',
    title: 'Ohmdal: cuando la pregunta vuelve',
    category: 'historia',
    world: 'ohmdal',
    readMinutes: 3,
    description:
      'La premisa de La Luz: una pérdida de conocimiento que se repara en comunidad.',
    sections: [
      {
        title: 'Conservar una forma, perder su propósito',
        paragraphs: [
          'La historia de Ohmdal trata sobre una comunidad que conserva máquinas y procedimientos, pero perdió parte de las explicaciones que permitían mantenerlos. El vínculo con el Instituto se debilitó durante cuarenta años. Quedaron prácticas útiles, recuerdos incompletos y decisiones tomadas con información insuficiente.',
          'El deterioro no proviene de una maldición ni de un villano que controla la oscuridad. Es acumulativo: dejan de circular preguntas y documentos, los territorios se aíslan y una reparación exitosa puede convertirse en ritual. Que un procedimiento haya funcionado antes no garantiza que explique la falla de hoy.',
        ],
      },
      {
        title: 'La Luz',
        paragraphs: [
          'El primer arco se llama La Luz. Su horizonte une lugares como la Plaza, el Taller y el Faro. La restauración técnica importa porque cambia la vida de quienes habitan el mundo. Una máquina encendida es también agua disponible, una tarea posible o una ruta que vuelve a tener sentido.',
          'El estudiante no llega como elegido. Su ventaja es poder observar con atención, contrastar explicaciones y documentar. La reparación queda incompleta si nadie del lugar puede mantenerla: recuperar conocimiento implica dejar herramientas para continuar sin depender de una sola persona.',
        ],
      },
      {
        title: 'Una memoria que admite preguntas',
        paragraphs: [
          'La historia no propone volver a un pasado perfecto. El mundo restaurado conserva huellas del desgaste y de sus decisiones. Aprender permite actuar con mayor responsabilidad en el presente, incluso cuando todavía no se conoce toda la respuesta.',
        ],
      },
    ],
  },
  {
    id: 'companeros-de-la-pregunta',
    title: 'Ohm, Edda y Lumen',
    category: 'historia',
    world: 'ohmdal',
    readMinutes: 2,
    description:
      'Tres maneras de relacionarse con la evidencia, sin adelantar el desenlace.',
    sections: [
      {
        title: 'Ohm: medir no es decidir',
        paragraphs: [
          'Ohm es un autómata consciente ligado al Instituto y un compañero de viaje. Su memoria está fragmentada; no es una enciclopedia que sabe todas las respuestas. Su función como instrumento permite obtener información, pero una lectura no elige por sí sola la explicación correcta.',
          'Separar medición e interpretación es esencial. El mismo valor puede ser compatible con más de una hipótesis. Saber dónde y cómo se obtuvo una medida ayuda a decidir qué conviene observar después.',
        ],
      },
      {
        title: 'Edda: una investigación propia',
        paragraphs: [
          'Edda es una joven de Ohmdal con curiosidad, iniciativa y capacidad de disentir. Sus preguntas no existen solamente para acompañar al estudiante: investiga por su cuenta y puede llegar a conclusiones diferentes.',
          'La relación entre ambos abre un lugar para discutir evidencia sin exigir que una persona tenga siempre razón. Cambiar de explicación frente a una observación mejor también es avanzar.',
        ],
      },
      {
        title: 'Lumen: respetar el saber práctico',
        paragraphs: [
          'Lumen conserva destreza de taller y procedimientos heredados. Su explicación puede ser incompleta sin que su experiencia sea inútil. La aventura debe reconocer ese saber y mostrar cómo la medición puede hacerlo más transmisible.',
          'Estos perfiles resumen la base narrativa de Ohmdal. No garantizan que cada escena propuesta de los personajes esté implementada en todas las versiones disponibles.',
        ],
      },
    ],
  },
  {
    id: 'detras-del-instituto',
    title: 'Cómo se construye un mundo que enseña',
    category: 'creacion',
    world: 'roxana',
    readMinutes: 3,
    description:
      'Del modelo que calcula consecuencias al arte que permite comprenderlas.',
    sections: [
      {
        title: 'Dos trabajos que se necesitan',
        paragraphs: [
          'Una escena tiene una presentación y un modelo. La presentación dibuja materiales, coloca la cámara y comunica estados con luz, sonido y movimiento. El modelo determina qué ocurre cuando se conecta un componente o se transforma una estructura.',
          'Mantener separados esos trabajos permite revisar una relación sin depender de que una animación parezca convincente. Si el modelo indica un circuito abierto, una luz bonita no debe dar a entender que circula corriente por ese camino.',
        ],
      },
      {
        title: 'El Instituto en miniatura',
        paragraphs: [
          'La escuela de esta portada utiliza una escena tridimensional con una cámara ortográfica. A diferencia de una cámara en perspectiva, los objetos no se ven más pequeños sólo por alejarse. Una vista oblicua permite leer habitaciones, escaleras y recorridos como una maqueta.',
          'El arte y la interfaz deben trabajar juntos. Una sala puede seleccionarse sobre la escena y también desde un control legible. El tamaño del texto, la navegación con teclado y las alternativas táctiles forman parte de la experiencia, no son un agregado posterior al acabado visual.',
        ],
      },
      {
        title: 'Probar una consecuencia',
        paragraphs: [
          'Un cálculo se puede comprobar con casos conocidos. Un recorrido requiere además jugarlo: encontrar una interacción, entender su respuesta y volver después de guardar. Compilar el proyecto detecta una clase de problemas; mirar una captura detecta otra. Ninguna de las dos cosas demuestra por sí sola que una aventura sea comprensible.',
        ],
      },
    ],
  },
  {
    id: 'circuito-completo',
    title: 'Electricidad I · El camino completo',
    category: 'electricidad',
    world: 'ohmdal',
    readMinutes: 3,
    description:
      'Fuente, carga y retorno: por qué acercar un cable no alcanza.',
    sections: [
      {
        title: 'Seguir la trayectoria',
        paragraphs: [
          'Imaginá un circuito de corriente continua con una fuente, un interruptor y una resistencia que representa una carga. Para que exista una corriente sostenida por esa rama debe haber una trayectoria conductora completa entre los terminales de la fuente, pasando por la carga.',
          'Abrir el interruptor interrumpe la trayectoria. El problema no es que la electricidad se haya gastado antes de llegar: falta una conexión que permita el circuito completo. Identificar nodos y conexiones es más útil que mirar cuánto cable parece haber.',
        ],
      },
      {
        title: 'Carga y energía son ideas distintas',
        paragraphs: [
          'La carga eléctrica se conserva. En un circuito sencillo en régimen estable, la corriente que entra a una resistencia es igual a la que sale. Lo que se transforma en la resistencia es energía eléctrica: puede aparecer como calor y, según el dispositivo, como luz u otras formas de energía.',
          'La fuente mantiene una diferencia de potencial y entrega energía al circuito. Decir que la carga consume corriente confunde dos conceptos: corriente es cantidad de carga que atraviesa una sección por unidad de tiempo; potencia es rapidez de transferencia de energía.',
        ],
      },
      {
        title: 'Una pregunta para observar',
        paragraphs: [
          'Antes de cerrar una conexión en un simulador, recorré mentalmente el camino desde un terminal hasta el otro. Identificá qué carga queda incluida y qué tramo interrumpe la circulación. Después compará tu predicción con la respuesta del modelo. Estos ejemplos son circuitos idealizados para estudiar, no instrucciones para intervenir instalaciones domésticas.',
        ],
      },
    ],
  },
  {
    id: 'tension-corriente-resistencia',
    title: 'Electricidad II · Tres magnitudes relacionadas',
    category: 'electricidad',
    world: 'ohmdal',
    readMinutes: 3,
    description:
      'Qué representan voltios, amperios y ohmios en un modelo resistivo.',
    sections: [
      {
        title: 'Nombrar lo que se compara',
        paragraphs: [
          'La tensión es una diferencia de potencial entre dos puntos; se expresa en voltios (V). La corriente mide el flujo de carga por unidad de tiempo; se expresa en amperios (A). La resistencia relaciona tensión y corriente en un elemento resistivo y se expresa en ohmios (Ω).',
          'Para una resistencia óhmica a temperatura aproximadamente constante, V = I × R. No es una regla que describa cualquier componente en cualquier condición. Un diodo, por ejemplo, no se comporta como una resistencia constante al variar su tensión.',
        ],
      },
      {
        title: 'Cambiar una cosa por vez',
        paragraphs: [
          'Una fuente ideal de 6 V aplicada a una resistencia de 12 Ω produce 0,5 A. Si la resistencia aumenta a 24 Ω y la fuente conserva 6 V, la corriente baja a 0,25 A. Si en cambio se duplica la tensión manteniendo 12 Ω, la corriente se duplica.',
          'Las palabras manteniendo y conservando son parte de la explicación. Si cambiás varias condiciones al mismo tiempo, observar una corriente distinta no revela por sí solo cuál fue la causa.',
        ],
      },
      {
        title: 'Leer con unidades',
        paragraphs: [
          'Un número aislado dice poco. Registrar 6 V entre dos puntos y 0,5 A por una rama permite reconstruir una situación. También conviene anotar las condiciones: circuito abierto o cerrado, fuente utilizada y componentes conectados. Una medida se vuelve útil cuando otra persona puede entender cómo obtenerla.',
        ],
      },
    ],
  },
  {
    id: 'ramas-y-energia',
    title: 'Electricidad III · Repartir sin perder la cuenta',
    category: 'electricidad',
    world: 'ohmdal',
    readMinutes: 3,
    description:
      'Serie, paralelo, potencia y energía mediante dos resistencias ideales.',
    sections: [
      {
        title: 'La conexión cambia el resultado',
        paragraphs: [
          'Dos resistencias están en serie cuando comparten una única trayectoria sin bifurcaciones intermedias para la corriente. En ese caso circula la misma corriente por ambas y sus resistencias se suman. Dos resistencias están en paralelo cuando sus extremos se conectan a los mismos dos nodos; entonces tienen la misma tensión.',
          'Con una fuente ideal de 6 V y dos resistencias de 12 Ω, conectarlas en serie da 24 Ω y una corriente de 0,25 A. Conectarlas en paralelo da 6 V sobre cada una: circulan 0,5 A por cada rama y la fuente entrega 1 A en total.',
        ],
      },
      {
        title: 'La corriente no desaparece en una bifurcación',
        paragraphs: [
          'En un nodo que no acumula carga, la suma de corrientes que entran coincide con la suma de las que salen. Repartirse no significa dividirse siempre en partes iguales. En paralelo, ramas con resistencias diferentes pueden conducir corrientes diferentes aunque compartan tensión.',
        ],
      },
      {
        title: 'Potencia no es energía acumulada',
        paragraphs: [
          'La potencia eléctrica se calcula como P = V × I y se expresa en watts (W). Para una potencia constante, la energía transferida es E = P × t. Un dispositivo de 3 W durante 10 segundos transforma 30 joules (J). El tiempo importa.',
          'Una reorganización puede aumentar la corriente total y la potencia que debe entregar la fuente. En un modelo real habría que considerar sus límites y los de cada componente. Por eso cambiar una topología exige observar el sistema completo, no sólo si una luz se encendió.',
        ],
      },
    ],
  },
  {
    id: 'programar-secuencias',
    title: 'Programación I · Una acción después de otra',
    category: 'programacion',
    world: 'bitland',
    readMinutes: 3,
    description:
      'Secuencias, estado y trazas en una pequeña máquina imaginaria.',
    sections: [
      {
        title: 'Un programa tiene consecuencias',
        paragraphs: [
          'Programar consiste en expresar un comportamiento con reglas que una máquina puede ejecutar. En una secuencia, el orden importa: cada instrucción se aplica al estado que dejó la anterior. No alcanza con tener las acciones correctas si se ejecutan en un orden que impide la tarea.',
          'En este ejemplo educativo, un carro está en la posición 0, una caja en la posición 1 y el destino en la posición 3. AVANZAR mueve el carro una posición. RECOGER sólo funciona donde está la caja. ENTREGAR sólo funciona en el destino si el carro lleva la caja.',
        ],
      },
      {
        title: 'Leer una traza',
        paragraphs: [
          'La secuencia AVANZAR, RECOGER, AVANZAR, AVANZAR, ENTREGAR completa la tarea. Después del primer paso, el carro está en 1; después del segundo, lleva la caja. Anotar posición y carga tras cada instrucción produce una traza de ejecución.',
          'Si RECOGER ocurre primero, falla su condición: carro y caja no están juntos. Una respuesta útil explica ese estado en lugar de limitarse a decir incorrecto. Pausar y volver a ejecutar permite localizar el primer momento en que lo observado difiere de lo esperado.',
        ],
      },
      {
        title: 'El horizonte de Bitland',
        paragraphs: [
          'Bitland propone una máquina-ciudad donde el comportamiento del sistema se vuelve visible. Esa visión está en desarrollo. El carro de este capítulo es un ejemplo del Instituto, no un personaje ni una escena confirmada de su campaña.',
        ],
      },
    ],
  },
  {
    id: 'condiciones-y-repeticiones',
    title: 'Programación II · Decidir y repetir',
    category: 'programacion',
    world: 'bitland',
    readMinutes: 3,
    description: 'Condiciones, bucles y una estrategia sencilla de depuración.',
    sections: [
      {
        title: 'Una condición consulta el estado',
        paragraphs: [
          'Una condición permite ejecutar una acción sólo cuando se cumple una regla. SI el carro lleva una caja, ENTREGAR evita intentar una entrega vacía. La condición no adivina el futuro: consulta el estado actual del sistema.',
          'Un programa puede ser correcto para una situación y fallar en otra. Por eso conviene probar una condición tanto cuando resulta verdadera como cuando resulta falsa. También hay que describir qué debería ocurrir si no se cumple, incluso si la acción correcta es esperar.',
        ],
      },
      {
        title: 'Repetir exige un criterio de finalización',
        paragraphs: [
          'REPETIR 3 VECES AVANZAR ejecuta tres movimientos. MIENTRAS no llegaste al destino, AVANZAR consulta una condición en cada vuelta. Los dos programas pueden coincidir en un caso y producir resultados diferentes cuando cambia la posición inicial.',
          'Un bucle puede no terminar si su cuerpo nunca modifica lo necesario para que la condición deje de cumplirse. En una simulación, ejecutar por pasos y limitar la cantidad de instrucciones ayuda a observar ese problema sin congelar la experiencia.',
        ],
      },
      {
        title: 'Depurar una explicación',
        paragraphs: [
          'Primero escribí qué esperabas observar. Después registrá lo que ocurrió y buscá la primera diferencia. Cambiá una regla, volvé al mismo estado inicial y compará. Si cambiás simultáneamente el programa y el escenario, cuesta saber qué resolvió el problema.',
          'Una prueba de transferencia cambia una condición inicial razonable. Si tu programa sólo funciona porque memorizaste un recorrido exacto, esa variante lo hará visible. La meta es comprender el comportamiento, no recordar una cadena de símbolos.',
        ],
      },
    ],
  },
  {
    id: 'movimiento-y-fuerzas',
    title: 'Física I · Moverse y cambiar el movimiento',
    category: 'fisica',
    world: 'physica',
    readMinutes: 3,
    description:
      'Posición, velocidad, aceleración y fuerza con supuestos claros.',
    sections: [
      {
        title: 'Describir desde una referencia',
        paragraphs: [
          'La posición se describe respecto de un origen y una dirección elegida como positiva. El desplazamiento es el cambio de posición; no siempre coincide con la distancia recorrida. Ir tres metros a la derecha y volver tres deja desplazamiento cero, aunque se recorrieron seis metros.',
          'La velocidad incluye dirección. Un cuerpo puede moverse con velocidad constante sin acelerar. La aceleración describe cómo cambia la velocidad con el tiempo: puede aumentar su rapidez, disminuirla o cambiar su dirección.',
        ],
      },
      {
        title: 'La fuerza neta cambia la velocidad',
        paragraphs: [
          'En el modelo de Newton para una masa constante, la fuerza neta cumple F = m × a. Importa la suma de fuerzas, no sólo una fuerza aislada. Fuerzas opuestas de igual magnitud dan fuerza neta cero.',
          'Si no hay fuerza neta, un objeto que ya se mueve continúa con velocidad constante en un sistema de referencia inercial. No necesita una fuerza hacia adelante para conservar ese movimiento. En la vida cotidiana, el rozamiento suele ocultar esta relación porque actúa frenando.',
        ],
      },
      {
        title: 'Comparar un experimento',
        paragraphs: [
          'Imaginá dos carros ideales de 2 kg y 4 kg que reciben la misma fuerza neta de 8 N. Sus aceleraciones son 4 m/s² y 2 m/s². La comparación conserva la fuerza y cambia la masa. Para comprender una experiencia de Physica, conviene reconocer qué variables podés controlar y cuáles permanecen fijas.',
        ],
      },
    ],
  },
  {
    id: 'caida-y-prediccion',
    title: 'Física II · Una caída, dos movimientos',
    category: 'fisica',
    world: 'physica',
    readMinutes: 3,
    description: 'Cómo separar componentes ayuda a entender una trayectoria.',
    sections: [
      {
        title: 'Declarar el modelo',
        paragraphs: [
          'Consideremos una región pequeña cerca de la superficie terrestre, con gravedad uniforme y sin resistencia del aire. Dos objetos se sueltan desde la misma altura con velocidad vertical inicial cero. Uno además tiene velocidad horizontal; el otro, no.',
          'En este modelo, ambos tienen la misma evolución vertical y llegan al suelo al mismo tiempo si aterrizan al mismo nivel. El movimiento horizontal de uno no cancela su caída. Su trayectoria resulta de combinar un avance horizontal con el cambio de altura.',
        ],
      },
      {
        title: 'Una cuenta que describe una observación',
        paragraphs: [
          'Tomando hacia abajo como positivo y g = 10 m/s² como aproximación declarada, la caída desde el reposo cumple distancia vertical = ½ × g × t². Desde 20 m, el tiempo hasta el suelo es 2 s. Si la velocidad horizontal constante es 3 m/s, en ese tiempo se avanzan 6 m.',
          'La aproximación elegida debe ser consistente en todo el ejemplo. En la Tierra suele usarse cerca de 9,8 m/s²; redondear a 10 facilita este cálculo, pero no convierte ambos valores en mediciones idénticas.',
        ],
      },
      {
        title: 'Cambiar una condición',
        paragraphs: [
          'Duplicar la velocidad horizontal duplica el alcance del ejemplo sin cambiar su tiempo de caída. Aumentar la altura sí cambia ese tiempo. Con aire, viento, alturas finales diferentes u otra velocidad vertical inicial, hay que revisar los supuestos antes de reutilizar la conclusión.',
          'Este capítulo es un ensayo educativo del Instituto. La intención de Physica es experimentar con fenómenos observables; las ecuaciones ayudan a explicar lo que ocurrió y a predecir una variante.',
        ],
      },
    ],
  },
  {
    id: 'proporciones',
    title: 'Matemática I · Cambiar el tamaño, conservar la relación',
    category: 'matematica',
    world: 'arithmos',
    readMinutes: 3,
    description:
      'Razones y escalas: qué debe cambiar junto para mantener una proporción.',
    sections: [
      {
        title: 'Dos cantidades relacionadas',
        paragraphs: [
          'Una razón compara dos cantidades en un orden determinado. Una mezcla de ejemplo con dos medidas azules por cada tres doradas tiene razón azul:dorado = 2:3. Cambiar el orden de lectura produce otra descripción: dorado:azul = 3:2.',
          'Para obtener más mezcla con la misma composición, se multiplican ambas cantidades por el mismo factor positivo. Cuatro azules y seis doradas conservan la razón 2:3. Sumar dos a cada cantidad da 4:5 y cambia la relación.',
        ],
      },
      {
        title: 'Una representación puede ayudar',
        paragraphs: [
          'Podés dibujar paquetes, cada uno con dos fichas azules y tres doradas. Duplicar el paquete duplica ambas cantidades y hace visible lo que se conserva. Las fichas permiten explicar la proporción antes de escribir una igualdad entre fracciones.',
          'La parte azul del total es 2 de 5, no 2 de 3. Comparar una parte con otra y comparar una parte con el total son operaciones distintas. Nombrar las cantidades evita confundir esas dos preguntas.',
        ],
      },
      {
        title: 'Escalar longitudes y áreas',
        paragraphs: [
          'Si un rectángulo pasa de 2 por 3 unidades a 4 por 6, sus longitudes se duplican, pero su área pasa de 6 a 24 unidades cuadradas: se cuadruplica. Conservar la forma no significa conservar el área.',
          'Arithmos propone aprender transformando estructuras y observando invariantes. Esta mezcla y este rectángulo son ejemplos de biblioteca, no lugares confirmados de su mundo.',
        ],
      },
    ],
  },
  {
    id: 'equivalencias',
    title: 'Matemática II · Distintas formas, la misma cantidad',
    category: 'matematica',
    world: 'arithmos',
    readMinutes: 3,
    description: 'Agrupar, representar y reconocer qué permanece igual.',
    sections: [
      {
        title: 'Reorganizar sin agregar ni quitar',
        paragraphs: [
          'Doce piezas pueden organizarse en tres grupos de cuatro o seis grupos de dos. Cambian la cantidad de grupos y el tamaño de cada grupo; se conserva la cantidad total. Una transformación es más fácil de comprender cuando se dice explícitamente qué cambia y qué permanece.',
          'Esas organizaciones permiten leer 3 × 4 = 6 × 2 = 12. La igualdad no dice que los dibujos sean idénticos. Afirma que las expresiones representan el mismo valor bajo esa interpretación.',
        ],
      },
      {
        title: 'La unidad importa',
        paragraphs: [
          'La mitad de una tira puede representarse como dos de sus cuatro partes iguales. Por eso 1/2 y 2/4 son equivalentes. Para comparar los dibujos, hay que mantener la misma unidad completa y dividirla en partes del mismo tamaño dentro de cada partición.',
          'La mitad de una tira corta no tiene necesariamente la misma longitud que la mitad de una tira larga. Las fracciones coinciden como proporción de su unidad; las longitudes absolutas dependen de qué unidad se tomó.',
        ],
      },
      {
        title: 'Una igualdad también puede transformarse',
        paragraphs: [
          'En una balanza ideal equilibrada, agregar la misma masa a ambos lados conserva el equilibrio. La relación se puede expresar sumando el mismo número a ambos miembros de una igualdad. Agregar sólo de un lado cambia el equilibrio.',
          'Un modo de comprobar comprensión es pedir otra representación: dibujar, agrupar, describir con palabras y finalmente escribir símbolos. La nueva representación debería permitir explicar el mismo hecho, no esconder una contradicción detrás de un resultado memorizado.',
        ],
      },
    ],
  },
];

export function getLibraryArticle(id: string): LibraryArticle | undefined {
  return LIBRARY_ARTICLES.find((article) => article.id === id);
}
