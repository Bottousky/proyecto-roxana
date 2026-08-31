# Guía de elaboración y revisión de puzzles — Proyecto Roxana

**Estado:** CANON. Fuente de verdad para diseñar Y auditar cualquier puzzle de
cualquier mundo del proyecto (Ohmdal, Matemática, Física, Programación, el Empalme…).
**Quién la usa:** el Orquestador al especificar un puzzle y al auditar el diff; todo
ejecutor al implementarlo. Leerla antes de crear o revisar un puzzle.

Estas directivas las fijó el Director (jun 2026). Tienen prioridad sobre cualquier
conveniencia de implementación.

---

## 0. La idea en una frase

> Un puzzle de Proyecto Roxana es una **situación jugable con sentido narrativo**, no
> un ejercicio escolar pegado artificialmente sobre el juego.

**Fórmula base recomendada:**

> «Hay algo del mundo que no funciona o no se comprende. El jugador observa sus reglas,
> manipula elementos del entorno, descubre una relación técnica o lógica, resuelve el
> problema y la Bitácora transforma esa experiencia en conocimiento formal.»

**Lo que hay que evitar:**

> «El juego se detiene, aparece una consigna escolar, el jugador responde de memoria,
> recibe correcto/incorrecto y vuelve al juego.»

Ese contraste es clave: Proyecto Roxana debe sentirse como una **aventura educativa de
verdad**, no como una clase gamificada superficial.

---

## 1. Lo que un puzzle DEBE ser

**Mundo y narrativa**
- Partir de un problema concreto del mundo: una máquina detenida, una puerta sin
  energía, una comunidad incomunicada, un sistema desbalanceado, una estructura
  inestable, una señal perdida, una criatura confundida, una memoria fragmentada o una
  regla del entorno que necesita comprenderse.
- Sentirse como una **acción dentro del mundo**, no como una pantalla de examen.
- Tener una **fantasía propia del mundo** sin perder coherencia técnica. En Ohmdal la
  electricidad puede sentirse viva, pero respeta nociones reconocibles de circuito,
  energía, carga, resistencia, señal o flujo.
- Tener un **objetivo visible**: encender una plaza, estabilizar un puente, activar un
  ascensor, abrir un portal, reparar un autómata, traducir una señal, restaurar una
  memoria, liberar un mecanismo, ordenar una red, equilibrar un sistema.
- Tener una **consecuencia visible** tras resolverse: vuelve la luz, cambia la música,
  se abre un camino, aparece una ruta, un personaje reacciona, una máquina cobra vida,
  el mundo se transforma. El jugador siente que su intervención repara, comprende o
  despierta algo.
- Reforzar el tono: misterio académico, escuela antigua, descubrimiento, belleza
  técnica, aprendizaje progresivo, sensación de legado. Educativo, misterioso, cálido,
  elegante; no cínico, no violento, no puramente cómico.
- Aportar al contexto emocional: cada puzzle suma al misterio, al despertar del mundo,
  a la escuela o al vínculo con Roxana. No existe solo «para enseñar un tema»: existe
  también porque **mejora la aventura**.

**Pedagogía**
- Tener relación clara con una idea formal: electricidad, física, matemática, lógica,
  programación, robótica, materiales, energía, comunicación, movimiento, equilibrio,
  medición o sistemas.
- Convertir un concepto abstracto en **experiencia manipulable**: conectar, ordenar,
  medir, balancear, rotar, programar, calibrar, clasificar, comparar, predecir,
  reconstruir o simular.
- Permitir **observar, interpretar, probar y corregir**, en lugar de elegir una
  respuesta correcta de una lista.
- Tener una solución **deducible** a partir de pistas visuales, diálogo, contexto y
  experimentación.
- Aceptar el **error como parte del aprendizaje**: fallar revela información nueva, no
  castiga de forma dura.
- Permitir entender progresivamente **por qué** algo funciona, no solo qué combinación
  abre la puerta.
- Conectarse con la **Bitácora**: al resolverlo, la Bitácora registra, traduce o
  formaliza lo aprendido en una explicación clara.
- Resolverse **sin conocimiento previo avanzado**, dejando una puerta abierta a una
  explicación más profunda para quien quiera entender más.
- Hacer sentir que se **aprendió haciendo**, no que se interrumpió el juego para estudiar.
- Convivir con el sistema educativo del juego: **primero experiencia, luego
  formalización, luego transferencia** a otro problema.
- Poder explicarse después con lenguaje de curso: «lo que hiciste fue cerrar un
  circuito», «lo que regulaste fue una resistencia», «lo que comparaste fue una
  proporción», «lo que ordenaste fue una secuencia lógica», «lo que balanceaste fue un
  sistema de fuerzas».
- Permitir construir una **progresión**: introductorios, de combinación, de
  transferencia, integradores y finales de mundo.
- Ser amable con el jugador joven o principiante, **sin infantilizarlo**.

**Mecánica, UX y claridad**
- Tener **varias capas**: una resolución básica para avanzar y, opcionalmente, una
  lectura más profunda para cursos, documentación o desafíos posteriores.
- Ser claro sobre **qué** se intenta lograr, aunque todavía no se sepa **cómo**.
- Apoyarse en objetos reconocibles o metafóricos: cables, bobinas, engranajes, prismas,
  compuertas, placas, sensores, balanzas, diagramas, runas técnicas, mapas, módulos,
  relés, válvulas, lentes, mecanismos, nodos, tarjetas o piezas.
- Integrarse con diálogos de personajes (Ohm, Maese Lumen, Edda, figuras del mundo)
  **sin depender exclusivamente** de explicaciones largas.
- Tener **ritmo de aventura gráfica**: exploración, hallazgo, interpretación, uso de
  objetos, conversación, manipulación y resolución.
- Resolverse en **sesiones cortas**, pensando en web, PC y mobile.
- Usar interacciones simples pero significativas: arrastrar, conectar, tocar, girar,
  elegir, activar, comparar, ordenar, observar cambios.
- Dar **feedback claro**: el jugador debe saber si su acción **acercó o alejó** la
  solución. Nada de ensayo y error invisible.
- Poder representarse visualmente de forma atractiva aunque el concepto sea técnico.

**Coherencia y reuso**
- Tener **lógica interna consistente**: si una regla funciona en un puzzle, el jugador
  debería poder reconocerla o reutilizarla en situaciones futuras.
- Ser repetible como **estructura, no como fórmula exacta**. Cada mundo puede tener una
  gramática propia de puzzles (identidad mecánica por mundo).

---

## 2. Lo que un puzzle NO debe ser

**Forma de examen / memorización**
- No ser una pregunta escolar aislada del tipo «¿Cuál es la fórmula de la Ley de Ohm?»
  con cuatro opciones. No sentirse como un examen disfrazado.
- No depender de **memorizar definiciones** sin haberlas experimentado antes.
- No requerir conocimiento técnico externo obligatorio para avanzar; no depender de
  leer documentación externa, buscar en Google ni cultura general.
- No presentar la ciencia como lista de fórmulas muertas, ni la tecnología como
  «apretar botones hasta que funcione».
- No ser una cinemática interactiva donde el jugador solo confirma pasos obvios.

**Castigo, azar y opacidad**
- No castigar el error con reinicios largos, pérdidas injustas o bloqueos permanentes.
  No ridiculizar ni infantilizar al jugador cuando falla.
- No resolverse por azar, spam de clics o prueba bruta sin comprensión.
- No usar **feedback ambiguo**: el jugador debe saber si se acercó o se alejó.
- No depender de ensayo y error invisible.
- No bloquear contenido importante detrás de una interacción que el jugador nunca
  podría anticipar.

**Diseño arbitrario / críptico**
- No ser una combinación arbitraria sin pistas («tocá estos cinco símbolos en este
  orden») sin que el mundo haya dado razones para ese orden.
- No introducir una regla nueva y abandonarla de inmediato sin permitir internalizarla.
- No ser tan simple que no haya nada que interpretar, ni tan críptico que solo el
  diseñador entienda la solución.
- No tener soluciones absurdas que contradigan la lógica del entorno, ni mezclar
  conceptos técnicos incompatibles «porque se ven cool».
- No caer en magia genérica sin estructura: aunque haya misterio, debe existir una
  lógica reconocible. No abusar de símbolos místicos/runas si eso tapa la dimensión
  técnica y educativa.

**Habilidad/arcade fuera de lugar**
- No exigir precisión motriz fina, reflejos rápidos ni habilidad arcade si el núcleo es
  conceptual.
- No usar temporizadores agresivos salvo que aporten al sentido del mundo y no
  bloqueen el aprendizaje.
- No usar la violencia como forma principal de resolver problemas.

**UI y hotspots**
- No romper la fantasía con interfaces escolares, planillas frías o pantallas de
  cuestionario, salvo que narrativamente tenga sentido.
- No depender de textos larguísimos antes de poder jugar; no convertir a los personajes
  en profesores que explican todo sin dejar espacio a la exploración.
- No esconder la única pista en un píxel minúsculo u objeto indistinguible. No obligar
  a **pixel hunting**. No saturar la escena con hotspots sin jerarquía visual.
- No tener interacciones falsas (objetos que parecen importantes y nunca se usan), salvo
  razón de diseño clara. No ser decoración interactiva sin consecuencia visible.

**Coherencia del mundo y del sistema educativo**
- No permitir acciones que rompan la coherencia del mundo (conectar cualquier cosa con
  cualquier cosa sin consecuencias lógicas).
- No permitir avanzar tras una acción técnicamente contradictoria sin que el mundo la
  reconozca como **error o anomalía**.
- No convertir todos los mundos en lo mismo con distinto color: cada mundo debe tener
  identidad mecánica. No convertir cada puzzle en «conectar cables» si el mundo permite
  más variedad de pensamiento. No hacer de «buscar la llave para abrir la puerta» la
  fórmula dominante.
- No hacer que la **Bitácora explique antes** lo que el jugador todavía no descubrió: la
  Bitácora consolida, guía o desbloquea comprensión, no reemplaza la experiencia ni la
  anticipa.
- No generar soluciones que no puedan explicarse luego formalmente.
- No ser un minijuego desconectado del escenario, la historia y el mundo.

---

## 3. Checklist de revisión rápida (usar al auditar un puzzle)

Marcá cada punto. Un «no» es un hallazgo a corregir o justificar.

1. **Problema del mundo:** ¿arranca de algo concreto y roto/incomprendido del mundo, con objetivo visible?
2. **Acción, no examen:** ¿se siente como manipular el mundo y no como responder un cuestionario?
3. **Observar→probar→corregir:** ¿el jugador experimenta, o solo elige de una lista?
4. **Predecir→observar→explicar:** ¿hay un momento en que el jugador se compromete con una expectativa antes de la revelación? (patrón de referencia: Cadena/Ramales del Castillo)
5. **Brillo/respuesta primero:** ¿lidera la respuesta visible (brillo, estado, movimiento) y el número/medición confirma, en vez de liderar con un número abstracto?
6. **Feedback claro:** ¿el jugador sabe si su acción acercó o alejó la solución?
7. **El error informa:** ¿fallar revela información sin castigar duro?
8. **Deducible, no arbitrario:** ¿la solución se infiere de pistas (visuales, diálogo, contexto), sin combinaciones sin razón?
9. **Por qué, no solo qué:** ¿se entiende por qué funciona, no solo qué combinación abre?
10. **Capas:** ¿hay resolución básica para avanzar y lectura más profunda opcional?
11. **Bitácora después:** ¿la Bitácora consolida/formaliza lo ya vivido, sin anticiparlo?
12. **Consecuencia visible:** ¿el mundo cambia al resolver (luz, música, ruta, reacción)?
13. **Coherencia técnica:** ¿la fantasía respeta la noción real (circuito, fuerza, proporción, secuencia…)? ¿se puede explicar luego con lenguaje de curso?
14. **Coherencia del mundo:** ¿una acción contradictoria es reconocida como error/anomalía, no premiada?
15. **Identidad de mundo:** ¿aporta a la gramática propia del mundo, sin ser «lo mismo con otro color»?
16. **UX y plataformas:** interacciones simples y significativas; sin pixel hunting, sin arcade fuera de lugar, jugable en sesiones cortas (web/PC/mobile).
17. **Tono:** misterioso, cálido, elegante; ni infantil ni cínico ni violento.
18. **Reuso:** ¿una regla aprendida acá se reconoce o reutiliza más adelante?

---

## 4. Relación con el resto de la documentación

- Pipeline e implementación: `docs/estandar-implementacion.md`.
- Reglas duras de ejecución (vocabulario spoiler, ≥2 soluciones, modelo testeable):
  `AGENTS.md` raíz y el `AGENTS.md` del mundo.
- Referencia de oro del patrón predecir-observar + brillo-primero + cuenta visible:
  los tres puzzles del Castillo (`chain.ts`, `branches.ts`, `distributor.ts`).
