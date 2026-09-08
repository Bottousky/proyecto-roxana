---
status: PROPOSED
authority_level: 3
version: v1
date: 2026-09-08
scope: Arithmos outcome-driven AAA brief
authorial_directive: Manuel Botto, 2026-09-08
non_prescriptive: true
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ./AGENTS.md
  - ./vision/arithmos-vision_v1.md
notes:
  - Este documento define QUÉ experiencia, aprendizaje y nivel de calidad debe conseguir Arithmos.
  - No prescribe CÓMO implementarlo y no debe convertirse en una receta técnica.
  - Los detalles anteriores de Arithmos marcados PROPOSED son material de referencia, no obligaciones de ejecución.
---

# ARITHMOS — GDD AAA ORIENTADO A RESULTADOS

> **Verbo nuclear:** **TRANSFORMAR**.
>
> **Disciplina:** Matemática aplicada como regla del mundo.
>
> **Tesis:** **The world is mathematical structure.**
>
> **Frase guía:** **Cambiar la forma no siempre cambia lo que es.**

---

# 0. Contrato de este documento

Este GDD es intencionalmente distinto de un documento de implementación.

Define:

- la fantasía que Arithmos debe producir;
- qué debe sentir, descubrir y aprender el jugador;
- qué propiedades debe tener el mundo;
- qué clase de problemas debe plantear;
- qué papel cumplen narrativa, personajes, humor, restauración y Bitácora;
- qué conceptos matemáticos deben emerger de la experiencia;
- qué estándares debe alcanzar un resultado que merezca llamarse **AAA** dentro de Proyecto Roxana;
- cómo evaluar si el resultado funciona.

No define:

- motor;
- framework;
- renderer;
- cámara;
- perspectiva;
- arquitectura de software;
- estructura de escenas;
- input exacto;
- interfaz exacta;
- geometría exacta de niveles;
- solución exacta de los puzzles;
- personajes definitivos;
- cantidad definitiva de regiones;
- estilo gráfico definitivo;
- lenguaje visual definitivo;
- orden técnico de producción.

**Astra tiene libertad explícita para resolver esos aspectos.**

Si una decisión previa marcada `PROPOSED` —por ejemplo una cámara isométrica, una región, una mecánica concreta, un personaje o un puzzle— impide alcanzar mejor los objetivos de este documento, puede ser modificada o descartada.

La libertad de solución termina donde empiezan los principios de Roxana y la identidad de Arithmos.

---

# 1. La promesa de Arithmos

Arithmos debe conseguir que una persona juegue con matemática sin sentir que ha abandonado el videojuego para entrar en una clase.

El jugador no debe experimentar:

> “me mostraron un problema de matemática y lo contesté”.

Debe experimentar:

> “entendí cómo estaba construido este mundo, descubrí algo sobre su estructura y usé ese descubrimiento para transformarlo”.

La matemática no es un requisito externo para progresar.

La matemática **es la materia del problema y la materia de la solución**.

Una propiedad matemática puede determinar:

- qué objetos son equivalentes;
- qué formas pueden reemplazarse;
- qué estructuras permanecen estables;
- qué relaciones se conservan;
- qué caminos existen;
- qué construcciones son posibles;
- qué sistema vuelve a funcionar;
- qué parte del mundo puede ser restaurada.

Nunca debe sentirse como una contraseña colocada delante de una puerta.

---

# 2. North Star

> **Los números no son respuestas escritas sobre puertas: son propiedades transformables de objetos, espacios y relaciones.**

Una escena pertenece a Arithmos sólo si el jugador puede comprender algo matemático **actuando sobre el mundo**.

El test extremo es:

> Si elimináramos números escritos, fórmulas, diálogos explicativos y consignas escolares, ¿seguiría existiendo una idea matemática real en lo que el jugador está haciendo?

Si la respuesta es no, la escena no está suficientemente aplicada.

---

# 3. Fantasía del jugador

La fantasía fundamental es:

> **Puedo ver estructura donde antes veía cosas. Puedo descubrir qué se conserva y usarlo para cambiar el mundo.**

La fantasía debe evolucionar por capas.

## 3.1. Ver

El jugador empieza percibiendo que dos cosas distintas pueden compartir una estructura.

No necesita saber todavía cómo se llama esa relación.

Debe poder sentir:

- “esto parece distinto, pero hace lo mismo”;
- “hay algo que no cambió”;
- “esta disposición y aquella representan la misma cantidad”;
- “esta forma es diferente, pero ocupa lo mismo”;
- “este patrón reaparece de otra manera”.

## 3.2. Transformar

Después deja de ser observador y puede provocar ese cambio.

No importa qué gesto, herramienta, cámara o interfaz termine eligiendo el desarrollo.

Lo obligatorio es que la acción tenga significado matemático.

## 3.3. Predecir

El jugador debe pasar de probar al azar a anticipar consecuencias.

En algún momento debe mirar un sistema y pensar algo equivalente a:

> “si conservo esto y cambio aquello, debería funcionar”.

Ese instante es más importante que cualquier respuesta numérica.

## 3.4. Elegir representación

La maestría de Arithmos no consiste en calcular más rápido.

Consiste en reconocer que una estructura puede representarse de distintas maneras y elegir la que vuelve tratable el problema actual.

## 3.5. Generalizar

Al final de una secuencia, el jugador debe poder usar la misma idea en una situación que **no sea visualmente idéntica** a aquella en la que la aprendió.

La transferencia es la prueba de comprensión.

---

# 4. Qué tiene que sentir jugar Arithmos

Arithmos debe producir una mezcla de:

- curiosidad;
- asombro;
- placer manipulativo;
- descubrimiento;
- elegancia;
- “aha moments”;
- libertad controlada;
- satisfacción por restaurar algo significativo;
- deseo de probar una solución diferente aunque la primera ya haya funcionado.

El jugador debería experimentar con frecuencia la sensación:

> “Ah, claro. **Es lo mismo**, pero de otra forma.”

Y, más adelante:

> “Ah, claro. Si lo miro **así**, puedo resolver algo que antes parecía imposible.”

No buscamos la emoción de haber aprobado un examen.

Buscamos la emoción de haber comprendido un sistema.

---

# 5. Identidad dentro de Proyecto Roxana

Los mundos comparten universo, protagonista, pedagogía y propósito, pero no tienen obligación de parecerse jugablemente.

| Mundo | Verbo | Fantasía dominante |
|---|---|---|
| Ohmdal | **CONECTAR** | Comprender redes físicas y eléctricas conectando causas y consecuencias |
| Physica | **EXPERIMENTAR** | Comprender fenómenos construyendo evidencia mediante experimentación |
| Bitland | **PROGRAMAR** | Comprender sistemas computacionales dando instrucciones y modelando procesos |
| **Arithmos** | **TRANSFORMAR** | Comprender estructuras y equivalencias cambiando representación sin perder lo esencial |

Arithmos no debe heredar cámara, controles, arte, ritmo o género de otro mundo por conveniencia técnica.

Debe encontrar la forma que mejor haga visible y disfrutable su propia fantasía.

---

# 6. Matemática aplicada, no matemática escolarizada

Arithmos puede cubrir contenidos reconocibles por un currículo escolar, pero **el currículo no dirige la experiencia**.

Un concepto entra porque crea una posibilidad jugable interesante.

El orden de presentación debe responder a:

- intuición;
- legibilidad;
- profundidad;
- sorpresa;
- transferencia;
- pacing;
- construcción progresiva de herramientas mentales.

No a la numeración de unidades de un manual.

## 6.1. La matemática se vive antes de nombrarse

La secuencia deseada es:

> fenómeno → acción → consecuencia → patrón → hipótesis → nueva prueba → reconocimiento → formalización → reutilización

La formalización debe sentirse como:

> “Ah, esto que yo ya entendía tiene un nombre / un símbolo / una forma de escribirse.”

Nunca como:

> “Memorizá esto porque después lo vas a necesitar.”

## 6.2. El símbolo es un mapa

Números, expresiones, diagramas, gráficas y vocabulario técnico pueden aparecer.

Pero su propósito es **dar una nueva lente sobre algo ya experimentado**.

La abstracción es una recompensa de comprensión, no el ticket de entrada.

---

# 7. Gran tema pedagógico: representación e invariantes

Arithmos debe enseñar una de las ideas más poderosas y transferibles de la matemática:

> una misma estructura puede tener distintas representaciones, y una transformación puede cambiar algunas propiedades mientras conserva otras.

El jugador debe aprender a preguntar intuitivamente:

- ¿qué cambió?;
- ¿qué se conservó?;
- ¿estas dos cosas son equivalentes bajo la propiedad que importa aquí?;
- ¿hay otra manera de representar este problema?;
- ¿qué forma hace visible la relación que necesito?;
- ¿esta solución sirve sólo para este caso o para una familia de casos?;

Estas preguntas importan más que cualquier lista de fórmulas.

---

# 8. Resultados de aprendizaje globales

Sin exigir que el jugador pueda recitar definiciones formales, Arithmos debe cultivar progresivamente la capacidad de:

1. reconocer cantidad como una propiedad que puede conservarse al reagrupar;
2. distinguir objeto, representación y propiedad;
3. reconocer equivalencias;
4. descomponer y recomponer estructuras;
5. comprender factores como formas de organización, no sólo como resultados de una cuenta;
6. comprender razones y proporciones como relaciones que pueden escalarse;
7. reconocer fracciones como relaciones parte–todo y como cantidades comparables;
8. comprender área, perímetro, forma y medida como propiedades distintas;
9. reconocer simetrías, rotaciones, reflexiones y otras transformaciones;
10. razonar con incógnitas a partir de relaciones observables;
11. inferir reglas a partir de entradas y salidas;
12. comprender una función como relación estructurada, no sólo como fórmula;
13. interpretar distintas representaciones de una misma relación;
14. pensar en redes, rutas, restricciones y estructura combinatoria;
15. buscar generalidad, elegancia y eficiencia sin confundirlas con “la única respuesta correcta”.

La campaña no necesita agotar formalmente cada dominio.

Debe construir **intuiciones poderosas que luego puedan formalizarse y transferirse**.

---

# 9. Arco I — propósito

El primer arco debe ser la demostración irrefutable de que Arithmos funciona.

Su foco conceptual es:

> **Cantidad, agrupación, equivalencia, descomposición, factores y proporción inicial.**

Pero su objetivo jugable no es “cubrir esos temas”.

El objetivo es que un jugador que entra sin conocer la tesis del juego salga comprendiendo, por experiencia, que:

> **una misma cantidad puede adoptar configuraciones diferentes y esas configuraciones pueden abrir posibilidades distintas sin dejar de representar la misma estructura esencial.**

## 9.1. Estado mental inicial esperado

Al comienzo, un jugador puede pensar:

> “esto son objetos”.

## 9.2. Estado mental final esperado

Al final, debería pensar algo equivalente a:

> “estos objetos tienen estructura; puedo reorganizarla, conservar algo importante y usar una representación diferente según lo que quiera conseguir”.

Ese cambio mental es el verdadero final del arco.

---

# 10. Curva experiencial del Arco I

Esta curva define **qué debe descubrir el jugador**, no cómo deben estar construidos los puzzles.

## Fase A — El mundo responde a estructura

El jugador descubre sin una explicación previa que cambiar la organización de elementos puede cambiar qué posibilidades ofrece el mundo.

La primera sorpresa debe ser física, visual, sonora o sistémica antes de ser simbólica.

### Resultado deseado

> “La disposición importa.”

## Fase B — Algo permanece

El jugador transforma configuraciones y empieza a percibir que cierta propiedad se mantiene.

### Resultado deseado

> “Cambió la forma, pero hay algo que sigue siendo igual.”

## Fase C — Muchas formas, una estructura

El jugador encuentra más de una representación válida de la misma cantidad o relación.

No debe existir una “forma correcta” arbitraria si matemáticamente varias son válidas.

### Resultado deseado

> “No hay una sola manera de representar esto.”

## Fase D — La forma elegida importa

Dos representaciones equivalentes pueden ser igualmente verdaderas y, sin embargo, ser útiles para cosas diferentes.

### Resultado deseado

> “Ser equivalente no significa ser intercambiable en cualquier contexto; tengo que elegir la representación útil.”

## Fase E — Aparece la estructura multiplicativa

Agrupar y desagrupar debe conducir naturalmente a reconocer organización, factores y relaciones multiplicativas.

### Resultado deseado

> “Puedo entender una cantidad por cómo está construida.”

## Fase F — Escala y proporción

El jugador debe empezar a reconocer relaciones que permanecen válidas al escalar.

### Resultado deseado

> “No importa sólo cuánto hay, también importa la relación entre las partes.”

## Fase G — Transferencia

El cierre debe plantear una situación nueva en la que ninguna instrucción diga explícitamente qué idea anterior reutilizar.

### Resultado deseado

> “Pude llevar lo que entendí a un problema distinto.”

## Fase H — Restauración

La comprensión del jugador debe dejar una marca persistente y emocionalmente legible en el mundo.

Algo importante vuelve a ser posible.

### Resultado deseado

> “No completé una ficha: arreglé una parte de este mundo porque entendí cómo funciona.”

---

# 11. Horizonte de campaña

El GDD no obliga a una cantidad exacta de regiones ni a una estructura fija de capítulos.

Sí define una progresión conceptual deseable.

## Horizonte I — Cantidad y equivalencia

- agrupación;
- descomposición;
- equivalencia;
- factores;
- razones iniciales;
- conservación.

## Horizonte II — Forma y espacio

- medida;
- área;
- perímetro;
- fracciones espaciales;
- simetría;
- transformaciones geométricas;
- composición y recomposición.

## Horizonte III — Lo desconocido

- balance;
- incógnitas;
- relaciones;
- restricciones;
- igualdad;
- razonamiento algebraico previo a la notación formal.

## Horizonte IV — Reglas y funciones

- input/output;
- patrones;
- función;
- composición;
- inversa;
- representación gráfica cuando aporte una nueva capacidad de lectura.

## Horizonte V — Estructuras

- redes;
- grafos;
- rutas;
- combinatoria;
- periodicidad;
- modularidad;
- probabilidad cuando pueda ser vivida como estructura de posibilidades y no como cuenta abstracta.

Estos horizontes son una brújula, no un syllabus obligatorio.

---

# 12. La regla fundamental de toda experiencia de Arithmos

Una interacción matemática significativa debe conseguir tres cosas:

1. **algo cambia de representación o configuración;**
2. **algo relevante se conserva o se relaciona de manera comprensible;**
3. **ese cambio produce una consecuencia real en el mundo.**

No es necesario que el jugador verbalice estas tres condiciones.

Debe poder **experimentarlas**.

Una transformación sin consecuencia es decoración.

Una consecuencia sin estructura matemática es un mecanismo genérico.

Una estructura matemática sin manipulación es una clase.

Arithmos existe en la intersección de las tres.

---

# 13. Puzzles: qué deben conseguir

Un buen puzzle de Arithmos debe exigir al menos parte de esta cadena:

> leer estado → identificar relación → predecir → transformar → observar → revisar hipótesis → transferir

## 13.1. Comprensión, no trivia

Nunca debe poder resolverse principalmente por:

- recordar una tabla;
- reconocer una fórmula escrita;
- acertar una opción múltiple;
- introducir un número esperado;
- probar respuestas de una lista;
- leer la explicación de un NPC;
- adivinar qué quería el diseñador.

## 13.2. El estado debe ser legible

La dificultad debe surgir de comprender relaciones, no de descubrir qué información ocultó arbitrariamente el juego.

## 13.3. Fallar debe producir información

Una transformación que no consigue el objetivo debe mostrar qué ocurrió.

El jugador debe poder aprender del resultado.

El feedback “incorrecto” sin evidencia es incompatible con Arithmos.

## 13.4. Varias soluciones cuando sea legítimo

Si la matemática permite varias soluciones, el sistema no debe reducirlas artificialmente a una única respuesta del diseñador.

La campaña puede pedir una solución funcional.

La maestría puede invitar a buscar:

- menos pasos;
- mejor uso de recursos;
- mayor elegancia;
- generalidad;
- simetría;
- robustez;
- otra representación válida.

## 13.5. Un buen puzzle deja una idea portátil

Después de resolverlo, el jugador debería poder reconocer la misma estructura cuando cambien:

- el arte;
- el contexto;
- los objetos;
- la orientación;
- la escala;
- el relato.

---

# 14. Dificultad

Arithmos no aumenta dificultad inflando números.

La dificultad debe crecer por riqueza estructural.

Fuentes válidas:

- más relaciones simultáneas;
- mayor distancia entre causa y consecuencia;
- información parcial pero inferible;
- restricciones combinadas;
- necesidad de cambiar de representación;
- necesidad de coordinar más de un concepto;
- necesidad de reconocer qué propiedad importa;
- mayor libertad de solución;
- necesidad de generalizar.

Fuentes inválidas:

- cuentas artificialmente grandes;
- velocidad de respuesta;
- memoria arbitraria;
- castigo por experimentar;
- pixel hunting;
- instrucciones deliberadamente ambiguas;
- ensayo y error sin información;
- lectura escolar obligatoria.

---

# 15. La narrativa debe ser matemática sin ser una clase

La premisa temática vigente es especialmente valiosa:

> Arithmos funcionaba porque podía reconocerse a sí mismo bajo muchas formas. El problema comienza cuando el mundo deja de traducir entre representaciones equivalentes.

El conflicto no necesita un villano tradicional.

Puede surgir de:

- rigidez;
- pérdida de equivalencias;
- incapacidad de traducir;
- regiones atrapadas en una sola interpretación;
- estructuras que ya no reconocen otras formas legítimas de sí mismas.

La restauración tiene entonces significado doble:

- repara el mundo;
- reconstruye la capacidad de reconocer relaciones.

## 15.1. Tema narrativo

> **Una forma no agota lo que una cosa puede ser.**

Este tema puede resonar emocionalmente sin convertirse en una moraleja explícita.

## 15.2. Narrativa no expositiva

Los personajes no explican lo que el jugador acaba de ver.

Si el sistema ya mostró una equivalencia, nadie necesita decir:

> “Eso fue una equivalencia.”

El diálogo puede aportar:

- cultura;
- humor;
- historia;
- emoción;
- conflicto;
- perspectiva;
- pistas humanas;
- misterio.

La Bitácora podrá nombrar formalmente la idea después.

---

# 16. Personajes

Astra tiene libertad para crear, reemplazar o descartar los personajes actualmente `PROPOSED`.

El resultado debe incluir personajes memorables cuya existencia sólo tenga sentido en Arithmos.

No queremos “profesores de matemática vestidos de fantasía”.

Queremos habitantes cuya manera de:

- pensar;
- construir;
- discutir;
- equivocarse;
- bromear;
- ordenar objetos;
- valorar una solución;
- recordar el pasado;

esté atravesada por la estructura matemática del mundo.

## 16.1. Companion o presencia recurrente

No se obliga a utilizar un companion.

Sí se busca que el jugador disponga de al menos una relación recurrente con fuerte identidad emocional durante el arco.

Si Astra decide que un companion es la mejor solución, debe ser:

- memorable;
- querible o fascinante;
- útil sin resolver puzzles por el jugador;
- coherente con la matemática del mundo;
- capaz de aportar humor y emoción;
- incapaz de convertirse en tutorial parlante.

El personaje `Nodo` existente es únicamente una propuesta previa.

---

# 17. Humor matemático diegético

Arithmos necesita humor.

Pero no una colección de chistes de profesor del tipo “¿por qué el seis le teme al siete?”.

El humor debe surgir de vivir en un universo donde las estructuras matemáticas son cotidianas.

Queremos chascarrillos que funcionen en dos niveles:

1. sean graciosos o encantadores aunque el jugador no conozca la formalización;
2. ganen una segunda lectura cuando el jugador comprende el concepto.

El mundo puede encontrar comedia en:

- equivalencias tomadas demasiado literalmente;
- obsesiones por simetría;
- objetos que “insisten” en conservar una propiedad;
- habitantes que discuten si dos cosas son realmente la misma;
- una situación que sólo parece absurda hasta entender la regla;
- contradicciones entre apariencia y estructura;
- relaciones imposibles de sostener cuando cambia el invariante.

Estos son **tipos de efecto**, no chistes obligatorios ni personajes prescritos.

La regla es:

> **el chiste debe pertenecer al concepto, no estar pegado encima.**

---

# 18. Cultura y worldbuilding

Arithmos debe parecer una civilización que surgió dentro de un universo estructuralmente matemático.

La matemática debería haber afectado naturalmente:

- arquitectura;
- urbanismo;
- juegos;
- oficios;
- arte;
- música;
- ornamentación;
- intercambio;
- navegación;
- lenguaje cotidiano;
- ceremonias;
- errores históricos;
- supersticiones;
- herramientas;
- maneras de clasificar el mundo.

No es necesario cubrir todos estos dominios.

Sí es necesario evitar la sensación de “mundo de fantasía normal al que le pegaron números”.

---

# 19. Dirección artística: resultado, no receta

Este GDD no elige estilo visual.

Astra puede modificar:

- perspectiva;
- cámara;
- dimensionalidad;
- nivel de estilización;
- materiales;
- proporciones;
- iluminación;
- lenguaje de animación;
- tratamiento de personajes;
- interfaz diegética o extradiegética.

El resultado sí debe cumplir:

## 19.1. Belleza independiente de la función educativa

Una captura de Arithmos debería despertar curiosidad aunque el espectador no sepa que es educativo.

## 19.2. Legibilidad estructural

La belleza nunca debe esconder la relación matemática importante.

## 19.3. Matemática sin estética escolar

Evitar como identidad dominante:

- pizarrones;
- hojas cuadriculadas;
- números flotantes;
- fórmulas usadas como decoración;
- aula genérica;
- estética de aplicación EdTech.

Pueden existir cuando narrativamente corresponda, especialmente dentro del Instituto, pero no constituyen la identidad del mundo.

## 19.4. Transformación espectacular

Cuando el jugador comprende y transforma, el mundo debe responder con un nivel de puesta en escena digno del descubrimiento.

La consecuencia tiene que ser clara y satisfactoria, no un check verde.

---

# 20. Audio y música

No se prescribe estilo musical.

Sí se exige que audio, música y diseño sonoro ayuden a percibir estructura.

El sonido puede comunicar:

- equivalencia;
- balance;
- tensión;
- cierre;
- repetición;
- patrón;
- simetría;
- restauración;
- transformación correcta o parcialmente útil.

No se busca convertir conceptos en mnemotecnia musical forzada.

Se busca que el sonido sea parte del feedback y de la identidad emocional.

---

# 21. Bitácora

La Bitácora no enseña por adelantado.

Reconoce lo que el jugador ya experimentó.

En Arithmos debe ayudar a contemplar un mismo descubrimiento desde distintas representaciones.

Por ejemplo, un evento vivido físicamente podría posteriormente ser reconocible como:

- cantidad;
- agrupación;
- relación;
- diagrama;
- expresión;
- término matemático;
- representación gráfica, cuando corresponda.

No se prescribe cómo se presenta.

El criterio es que el jugador sienta:

> “Esto es otra manera de ver algo que ya entiendo.”

No:

> “Esto es teoría que tengo que estudiar para seguir.”

---

# 22. Accesibilidad cognitiva

Arithmos debe ser exigente sin exigir una identidad previa de “ser bueno en matemática”.

Principios:

- el jugador puede experimentar sin miedo a castigo severo;
- fallar informa;
- ningún concepto inicial depende de velocidad de cálculo;
- la lectura debe poder apoyarse en más de un canal;
- la abstracción se introduce gradualmente;
- una dificultad de notación no debe confundirse con una dificultad conceptual;
- la campaña principal evalúa comprensión, no virtuosismo;
- la maestría es opcional;
- las soluciones reversibles deben poder explorarse sin ansiedad innecesaria;
- el sistema debe aspirar a que una persona que llegó convencida de que “no entiende matemática” tenga experiencias tempranas de competencia real.

La accesibilidad no significa bajar la profundidad.

Significa que la profundidad se construye sobre comprensión, no sobre barreras accidentales.

---

# 23. Referencias de videojuegos — qué estudiar, no qué copiar

Estas referencias son lentes de análisis.

Astra no debe imitarlas visualmente ni reproducir sus mecánicas de forma literal.

## The Witness

Estudiar:

- enseñanza sin exposición;
- lenguaje que se aprende jugando;
- variación de una regla;
- transferencia entre contextos;
- entorno como parte del conocimiento.

No copiar:

- su estructura de paneles como solución universal.

## Baba Is You

Estudiar:

- reglas como materia manipulable;
- consecuencias transparentes;
- descubrimiento de propiedades emergentes;
- satisfacción al cambiar la interpretación de un problema.

No copiar:

- sintaxis de bloques como obligación para Arithmos.

## Patrick's Parabox

Estudiar:

- estructura espacial como pensamiento;
- cambio de escala y representación;
- sorpresa lógica coherente;
- complejidad construida desde reglas simples.

## Monument Valley

Estudiar:

- geometría como mundo;
- transformación espacial legible;
- asombro visual al comprender una relación.

No copiar:

- perspectiva imposible como requisito.

## Portal / Portal 2

Estudiar:

- tutorialización ambiental;
- progresión de ideas;
- humor integrado al mundo;
- test, consecuencia y revisión de hipótesis;
- set pieces que convierten una regla en espectáculo.

## The Legend of Zelda: Breath of the Wild / Tears of the Kingdom

Estudiar:

- juguetes sistémicos;
- soluciones distintas aceptadas;
- experimentación por curiosidad;
- sensación de autoría de la solución.

No copiar:

- combate, estructura de mundo abierto o crafting por obligación.

## DragonBox

Estudiar:

- manipulación intuitiva antes de símbolo;
- transición progresiva hacia formalización;
- álgebra como relación operable.

## Euclidea

Estudiar:

- placer de construir una relación geométrica;
- múltiples caminos válidos;
- maestría como elegancia.

## Minecraft / LEGO como referencias de alfabetización manipulativa

Estudiar:

- comprensión a través de construcción;
- objetos como unidades combinables;
- intuición espacial y estructural;
- creatividad a partir de reglas legibles.

No copiar:

- estética voxel o sandbox abierto como obligación.

---

# 24. Referencias pedagógicas y cognitivas

Estas corrientes deben ser usadas como lentes, no como dogma académico ni requisito de citar al jugador.

## Jerome Bruner — enactivo, icónico, simbólico

La comprensión puede comenzar en la acción, pasar por representación visual y llegar a símbolo.

Arithmos debe aprovechar esa progresión.

## Concrete–Representational–Abstract (CRA/CPA)

El concepto puede vivirse primero como manipulación, después como representación y finalmente como formalización.

La traducción a videojuego debe evitar que “concreto” signifique simplemente poner dibujitos sobre una cuenta.

## Raymond Duval — registros de representación semiótica

Una idea matemática profunda se fortalece cuando el jugador puede reconocer el mismo objeto a través de distintas representaciones y convertir entre ellas.

Esto está en el corazón de Arithmos.

## Constructionism — Seymour Papert

Construir algo significativo puede producir comprensión más profunda que recibir una explicación.

Arithmos debe permitir que el conocimiento exista en la acción del jugador.

## Productive Failure — Manu Kapur

Intentar, obtener evidencia y revisar hipótesis puede preparar mejor la formalización que recibir inmediatamente el procedimiento correcto.

El fracaso de Arithmos debe ser productivo, no punitivo.

## Variation Theory

La comprensión mejora cuando el jugador puede distinguir qué cambia y qué permanece a través de variaciones cuidadosamente diseñadas.

Esto coincide directamente con el trabajo sobre invariantes.

## Embodied Cognition

Manipulación, espacio, ritmo, percepción y consecuencia pueden aportar significado conceptual.

La matemática no necesita vivir sólo en lenguaje simbólico.

## George Pólya — heurísticas de resolución de problemas

Leer el problema, probar, revisar y mirar la solución desde otro ángulo son hábitos más valiosos que memorizar una receta única.

Arithmos debe premiar esos hábitos sin transformarlos en una checklist verbal.

## Low floor / high ceiling / wide walls

La entrada debe ser accesible, la profundidad debe crecer mucho y debe haber distintas maneras legítimas de explorar una idea.

---

# 25. Narrativa y pedagogía nunca compiten

Si para entender la matemática hace falta leer la historia, falló la representación.

Si para disfrutar la historia hace falta completar una ficha matemática, falló la narrativa.

Deben reforzarse por identidad de mundo, no por dependencia artificial.

La narrativa puede hacer que importe restaurar una región.

La matemática debe hacer posible restaurarla.

---

# 26. Set pieces

Arithmos debe contener momentos memorables donde comprender una estructura produzca una consecuencia de escala mayor que el puzzle inmediato.

No se prescribe qué forma deben tener.

Sí deben conseguir que el jugador recuerde:

> “Yo hice que **eso** ocurriera porque entendí **esto**.”

El Arco I debe tener al menos un momento de esta categoría antes de su cierre.

El final del arco debe superar visual, sistémica o emocionalmente los cambios anteriores.

---

# 27. El mundo debe recordar

La restauración no puede ser sólo una cinemática que luego desaparece.

El jugador debe poder percibir que su comprensión dejó una huella.

Puede manifestarse en:

- espacio;
- comportamiento de NPCs;
- rutas;
- infraestructura;
- paisaje;
- música;
- cultura;
- nuevas interacciones;
- reinterpretación de lugares anteriores.

No se prescribe cuál.

Sí se exige persistencia perceptible.

---

# 28. Relación con el Instituto Roxana

El Instituto es el marco que une Arithmos con los otros mundos.

La transición debe hacer sentir que el jugador entra en una disciplina distinta, no en otro nivel con una skin nueva.

El Instituto puede preparar emocionalmente la entrada, pero no debe explicar la mecánica central antes de que el jugador la descubra.

Al volver, la Bitácora y el estado del Instituto pueden reconocer lo adquirido.

La identidad jugable de Arithmos debe haber sido autosuficiente antes de cualquier integración interdisciplinaria mayor.

---

# 29. “AAA” en Proyecto Roxana

AAA no significa imitar el presupuesto de un estudio de cientos de personas.

Significa que **ninguna capa importante puede sentirse provisoria, genérica o pedagógicamente excusada**.

El estándar objetivo abarca:

## 29.1. Game feel

- respuesta inmediata y satisfactoria;
- interacción que invite a tocar y probar;
- transformaciones fáciles de leer;
- ausencia de fricción accidental;
- feedback consistente.

## 29.2. Dirección artística

- identidad reconocible;
- composición fuerte;
- escenarios memorables;
- materiales y animaciones coherentes;
- ausencia de placeholders visibles en la experiencia objetivo.

## 29.3. Audio

- identidad musical;
- feedback sonoro útil;
- momentos de restauración con peso emocional;
- mezcla cuidada.

## 29.4. Narrativa

- personajes con voz propia;
- diálogos editados;
- humor que pertenezca al mundo;
- ausencia de exposición escolarizada;
- arco emocional legible.

## 29.5. UX

- onboarding casi invisible;
- estado del mundo comprensible;
- errores diagnosticables;
- navegación sin frustración improductiva;
- lectura accesible.

## 29.6. Pedagogía

- acción antes de explicación;
- comprensión demostrada mediante transferencia;
- conceptos correctamente representados;
- ausencia de falso aprendizaje por prueba y error ciego;
- formalización posterior y significativa.

## 29.7. Producción

- experiencia end-to-end jugable;
- sin segmentos evidentemente “de demo técnica” entre escenas pulidas;
- coherencia entre arte, sistema, narrativa y aprendizaje;
- estabilidad suficiente para evaluar el diseño real y no bugs.

---

# 30. Qué NO debe hacer Astra para aparentar calidad

No aceptar como sustituto de calidad:

- partículas y bloom sobre un puzzle escolar;
- una cinemática enorme que desemboca en una cuenta;
- narración explicando una mecánica poco legible;
- personajes carismáticos pegados a un sistema de ejercicios;
- números grandes para fabricar dificultad;
- una única solución hardcodeada cuando existen alternativas correctas;
- gráficos espectaculares que ocultan la estructura;
- una IA que “da pistas” antes de que el mundo enseñe;
- texto técnico utilizado como decoración;
- una lista de contenidos curriculares presentada como campaña.

---

# 31. Libertad creativa de Astra

Astra está explícitamente autorizado a decidir, prototipar y cambiar:

- género exacto dentro de la aventura/puzzle;
- cámara;
- dimensionalidad;
- layout;
- navegación;
- interacción;
- herramientas del jugador;
- personajes;
- companion;
- regiones;
- nombres;
- estilo visual;
- lenguaje audiovisual;
- estructura del Arco I;
- orden de presentación de conceptos;
- cantidad de puzzles;
- ritmo;
- sistema de hints;
- modo de formalización;
- forma de la restauración;
- tecnologías de implementación.

La condición es que pueda justificar cada decisión contra:

1. fantasía del jugador;
2. verbo **TRANSFORMAR**;
3. matemática como regla del mundo;
4. comprensión por acción;
5. legibilidad;
6. diversión independiente de la etiqueta educativa;
7. calidad AAA.

---

# 32. Criterios de playtest

No evaluar únicamente si el jugador “terminó”.

Preguntar y observar:

## 32.1. Comprensión implícita

- ¿predice correctamente una transformación antes de ejecutarla?;
- ¿reconoce cuándo dos configuraciones son equivalentes?;
- ¿puede decir qué cambió y qué permaneció sin repetir un texto del juego?;
- ¿busca otra representación cuando se atasca?;

## 32.2. Transferencia

- ¿resuelve una variación nueva sin tutorial adicional?;
- ¿reconoce el mismo principio con objetos y estética distintos?;

## 32.3. Calidad lúdica

- ¿experimenta por curiosidad aunque ya conozca la solución?;
- ¿quiere probar otra forma?;
- ¿recuerda un momento por el descubrimiento y no por el ejercicio?;
- ¿jugaría aunque no se lo vendieran como educativo?;

## 32.4. Fracaso

- ¿un intento fallido aporta una hipótesis nueva?;
- ¿entiende qué produjo su acción?;
- ¿se siente castigado por probar algo razonable?;

## 32.5. Narrativa

- ¿los personajes se sienten habitantes y no docentes?;
- ¿el humor nace del mundo?;
- ¿la restauración importa emocionalmente?;

## 32.6. Formalización

- cuando aparece un nombre o símbolo, ¿el jugador reconoce algo que ya comprende?;
- ¿puede relacionar más de una representación del mismo evento?;

---

# 33. Tests de rechazo

Una versión de Arithmos debe rechazarse aunque compile y sea visualmente atractiva si ocurre cualquiera de estos casos de forma estructural:

1. El progreso principal depende de contestar cuentas o preguntas.
2. Los números escritos son el principal vehículo de la matemática.
3. La mayoría de los puzzles tienen una única respuesta porque el código espera una solución concreta, no porque la matemática la exija.
4. El jugador puede avanzar sin comprender la relación subyacente mediante brute force razonable.
5. Los fallos responden principalmente con “no”.
6. La formalización llega antes que la experiencia.
7. Los NPCs funcionan como profesores.
8. El juego sólo resulta atractivo porque “enseña”.
9. Cambiar de representación no tiene consecuencias relevantes.
10. El mundo parece decorado con matemática en vez de construido por matemática.
11. El Arco I no contiene una transferencia real.
12. La restauración no deja marca perceptible.
13. La capa audiovisual oculta la estructura que debería enseñar.
14. El jugador termina pensando en “respuestas” en lugar de relaciones.

---

# 34. Definition of Done — Arco I AAA

El primer arco puede considerarse exitoso cuando existe una experiencia end-to-end en la que:

- el jugador entra desde el universo Roxana y percibe una identidad nueva;
- descubre la regla central sin conferencia previa;
- aprende mediante manipulación y consecuencia;
- comprende al menos una equivalencia a través de más de una representación;
- usa esa comprensión con una finalidad jugable real;
- encuentra progresión desde intuición aditiva hacia estructura multiplicativa y una primera intuición proporcional;
- enfrenta al menos una situación de transferencia auténtica;
- puede resolver problemas válidos de más de una manera cuando el dominio lo permite;
- los intentos fallidos producen información;
- la formalización reconoce, no anticipa;
- existe narrativa y humor propios de Arithmos;
- hay al menos una relación recurrente memorable con un personaje o presencia del mundo;
- existe al menos un gran momento de transformación y un cierre aún mayor;
- una parte importante del mundo queda perceptiblemente restaurada;
- la experiencia tiene polish audiovisual, UX y estabilidad suficientes para ser juzgada como juego y no como prototipo pedagógico;
- un playtester puede describir la idea “cambiar la forma sin cambiar lo esencial” sin que el juego se la haya recitado;
- un playtester puede aplicar esa idea a una variante nueva;
- una persona puede terminar el arco y decir genuinamente: **“quiero jugar más”**, no sólo **“aprendí algo”.**

---

# 35. Entregable creativo esperado

Astra no debe limitarse a interpretar literalmente los ejemplos históricos del repositorio.

Debe usar este GDD como **brief de dirección** y buscar la mejor experiencia posible.

El resultado ideal puede sorprender incluso al autor en su forma concreta, siempre que al jugarlo quede inmediatamente claro:

> **Esto sólo podía ser Arithmos.**

Y que su aprendizaje surja de una verdad más profunda que una colección de ejercicios:

> **Comprender matemática es aprender a ver estructura, transformar representaciones y reconocer qué permanece.**
