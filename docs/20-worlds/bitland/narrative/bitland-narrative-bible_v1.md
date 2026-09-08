---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/03_BITLAND_GDD_v0.1.md (sección 3 — Acceso desde el Instituto; sección 8 — Personajes)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/bitland-vision_v1.md
  - ../vision/bitland-world-metaphor_v1.md
  - ../gameplay/bitland-programming-language-gameplay_v1.md
  - ../gameplay/bitland-automation-system_v1.md
open_questions:
  - BL-NB-Q1 — ¿La "Operadores" son avatares de antiguos estudiantes, o son procesos con identidad propia que el Instituto nunca tuvo?
  - BL-NB-Q2 — ¿Cuánto del Instituto está en ruinas y cuánto sigue funcionando? (afecta el gancho narrativo de salida)
  - BL-NB-Q3 — ¿PATCH tiene un "dueño" o es un agente libre que quedó?
  - BL-NB-Q4 — ¿Hay un antagonista en Bitland, o el antagonista es la inercia del sistema?
  - BL-NB-Q5 — ¿Qué sabe el jugador sobre el Instituto al entrar a Bitland? (afecta cuánto se explica al inicio)
---

# BITLAND — NARRATIVE BIBLE · v1

## Null — biblia de producción AAA (2026-09-08, PROPOSED)

El GDD v2 y el encargo actual sustituyen a PATCH como compañero principal.
Los pasajes v1 posteriores se conservan como antecedente, no como instrucción
para reintroducirlo. Null no resuelve puzzles; identifica hechos que el jugador
ya puede inspeccionar. Máximo una línea por consecuencia distinta; cooldown
de 12 s, silencio si el jugador reitera el mismo intento. Subtítulos legibles,
sin voz glitch. P0 usa un subconjunto; la tabla es producción de diálogo para P1+
y **no** pretende que todos esos conceptos estén ya implementados.

### Veinte reacciones breves, con disparador factual

| ID | Evidencia requerida | Línea |
|---|---|---|
| N01 | primera instrucción completada | «Una instrucción. Ninguna suposición.» |
| N02 | primer PICK con carga | «Ahora sí lleva algo.» |
| N03 | PICK con cola vacía | «El muelle estaba vacío.» |
| N04 | DROP con carga ausente | «Llegó. El paquete, no.» |
| N05 | movimiento bloqueado | «La barrera sigue cerrada.» |
| N06 | rama verdadera registrada | «El sensor dio sí. Tomó esa calle.» |
| N07 | rama falsa registrada | «Dio no. El rodeo también llega.» |
| N08 | sensor cambió después del IF | «Eso cambió después de la lectura.» |
| N09 | mensaje pendiente en bus | «Salió del puerto. Todavía no llegó.» |
| N10 | GPIO confirma recepción | «La luz recibió el paquete.» |
| N11 | dos ciclos, guardia idéntica | «La condición no cambió entre vueltas.» |
| N12 | loop finaliza con cola vacía | «No queda trabajo. Esta vez terminó.» |
| N13 | REPEAT acaba con paquete restante | «Quedó uno esperando.» |
| N14 | rewind restaura carga | «El paquete volvió con ese instante.» |
| N15 | programa contiene espera ejecutada | «Él esperó. El resto siguió.» |
| N16 | tres entregas con panel cerrado | «Sigue entregando mientras mirás otra cosa.» |
| N17 | entrada nueva despierta servicio | «Llegó otro. La rutina seguía instalada.» |
| N18 | solución alternativa validada | «Otro camino. El mismo destino.» |
| N19 | cambio de versión aplicado | «Ahora está ejecutando la nueva versión.» |
| N20 | variable sin inicializar, Arco II | «Esa casilla todavía no tiene un valor.» |

### Ocho chistes de concepto (no anticipar vocabulario)

| ID / alcance | Situación comprobada | Línea / precisión |
|---|---|---|
| J01 · P1 | SAY «Última vuelta» es la última instrucción del cuerpo, guardia vuelve true | «No miente. Es la última instrucción. Después vuelve al principio.» |
| J02 · P1 | faltó una repetición de diez | «Dejó exactamente una para mañana. El programa no menciona mañana.» |
| J03 · II | owner:null visible | «No soy yo. No todo lo que no tiene dueño soy yo.» |
| J04 · II | cadena "true" no coincide con booleano en este perfil tipado | «Lo dice. No lo es.» |
| J05 · IV | ambos leen libre antes de escribir | «Los dos tenían razón. Al mismo tiempo.» |
| J06 · IV | A posee X/espera Y y B posee Y/espera X | «Están siendo extremadamente pacientes.» |
| J07 · V | lookup de rutina hostil devuelve null y rama skip | «Me buscaron. No encontraron nada.» Nunca inmunidad universal. |
| J08 · III | retorno llega exactamente al llamador | «Volvió al lugar desde donde lo llamaron. Una cortesía programada.» |

### Cinco reacciones sin diálogo

1. Primer fallo: Null mira las manos vacías y luego el puerto; mantiene distancia.
2. Step: posa un pie junto a la marca del tick; permanece quieto durante pausa.
3. Rewind: retrocede un paso hasta la misma marca, sin alterar colisiones.
4. LED: se gira hacia fuera de la placa; el centro de su silueta encuadra la luz.
5. Automatización: se sienta al borde del muelle mientras el courier completa otra vuelta.

Las poses son presentación de hechos; no alteran clock, paquetes ni sensores.
En reduced motion se usan poses discretas sin desplazamiento.

### Tres payoffs diferidos

| Siembra | Comprensión necesaria | Resolución |
|---|---|---|
| Boot: mochila cerrada. «Nada.» | Arco II: distinguir ausencia de objeto de objeto vacío | inspección no resuelve contenido; «Te había dicho.» No usar 0 como sinónimo de null. |
| Boot: placa «propietario pendiente», Null pasa sin adjudicársela | Arco II: owner:null | «Ves. No era mi nombre.» |
| II: Null evita prometer que todas las puertas lo dejarán pasar | V: registro, lookup y defaults seguros | rutina hostil omite por ausencia, puerta legítima deniega por ausencia. «Cada uno siguió su regla.» |

### Verdad narrativa y arco completo

Boot descubre ejecución y consecuencia exterior. I restaura una ruta. II
estabiliza fan/temperatura con estado e histéresis. III comparte funciones entre
estaciones. IV hace visibles intercalado, carreras y espera circular. V contiene
código dañino mediante validación, permisos y defaults seguros. VI conserva
servicios durante fallos parciales y reconecta la placa. El epílogo reconoce
mantenimiento y responsabilidad humanos; la ciudad no adquirió comprensión.
Estos desenlaces son dirección de campaña, no contenido autorizado para construir ahora.

> Documento de autoridad nivel 3. Biblia de mundo y sistemas. Reúne el
> lore, los personajes, el tono y los temas narrativos de Bitland.
>
> **TODO el contenido de este documento es PROPOSED.** La restricción de
> canon de la sesión P4 aplica a este documento con la mayor fuerza:
> la lore de Bitland es prácticamente nueva. Ningún elemento de este
> archivo puede ascender a CANON sin la ratificación explícita de
> Manuel mediante un ADR.
>
> Este documento **no cuenta la historia del Arco I**. Esa historia
> vive en `bitland-arc-01_v1.md`. Aquí se define el marco; allí se
> instancia.

---

## 1. Tema

> **Una máquina puede seguir funcionando mucho después de que se
> pierda el motivo de su diseño.**

Bitland no es un cementerio ni un museo. Es un sistema que sigue
ejecutando. Esa es la particularidad que vuelve a Bitland *interesante
y no melancólico*: la ciudad no se apaga sola, y por eso hay algo que
hacer.

Subtemas que se derivan del tema central:

- **Funcionar ≠ servir al propósito.** Una rutina que entrega a un
  mostrador vacío "funciona" pero no sirve.
- **La optimización local puede romper el global.** Un barrio que
  consume toda la energía deja a los demás sin clock.
- **La documentación es parte del sistema.** Cuando se pierde, el
  sistema sigue, pero se vuelve ilegible.
- **Un sistema no se rompe solo. Se rompe porque nadie lo lee.**

---

## 2. Frase guía

> **"Que algo funcione no significa que haga lo que querías."**

Se usa como horizonte de la campaña. No eslogan. No se muestra
literalmente al jugador salvo en la Bitácora, después de la
experiencia.

---

## 3. Premisa de mundo — PROPOSED

> El Instituto usaba Bitland para enseñar computación haciendo que
> algoritmos y arquitectura se volvieran espacios transitables. No
> todo era simulación abstracta: era una *infraestructura persistente*
> capaz de mantener procesos durante años.

### Estado del mundo al comenzar la campaña

- Bitland no está destruida. Está **desatendida**.
- La última intervención conocida del Instituto fue una actualización
  menor al reloj central. Nadie recuerda quién la firmó.
- Los barrios siguen ejecutando los procesos instalados. Algunos
  dejaron de tener consumidores; otros siguen siendo útiles.
- No hay guerra, no hay virus, no hay monstruo. Hay **inercia**.

### Lo que el jugador aprende a leer

- Que un agente repita un gesto 10.000 veces no significa que lo esté
  haciendo bien: significa que lo lleva haciendo desde antes de que
  el Instituto dejara de mantenerlo.
- Que un servicio de barrio publique una interfaz no significa que
  quien lo invocaba siga ahí.
- Que un portero esté abierto o cerrado no es estado actual: es
  herencia.

### Lo que el jugador aprende a hacer

- Leer antes de escribir.
- Generalizar sin perder de vista el caso particular.
- Apagar lo que daña; reescribir lo que sirve; dejar lo que sigue
  sirviendo.
- Responsabilizarse del sistema que mantiene.

---

## 4. Acceso desde el Instituto — PROPOSED

### Punto de acceso (propuesta, abierta a revisión)

El Aula/Laboratorio de Computación del Instituto contiene un terminal
o rack antiguo que **continúa encendido**. El jugador inicia una
sesión y el espacio del aula se reconfigura gradualmente hasta
convertirse en Bitland.

Identidades visuales posibles (a elegir una sola y evolucionarla):

- Terminal de fósforo verde.
- Tablero de relés con cinta perforada.
- Consola modular con paneles extraíbles.
- Rack con luces que parpadean al ritmo del clock.

> **Decisión abierta:** la elección se difiere a producción y se
> confirma con un ADR.

### Lo que la transición debe asegurar

- La cámara pasa de "primer plano" (aula) a "cenital" (Bitland) sin
  romper la atención.
- El audio ambiente cambia: del aula silenciosa al run del sistema.
- La luz cambia: de la luz del aula al ciclo día-noche de Bitland.

### Lo que la transición NO debe ser

- Un menú "selecciona mundo".
- Un fundido a negro largo.
- Un personaje explicando "ahora estás en Bitland".

---

## 5. Personajes — PROPOSED

Bitland puede operar con pocos personajes humanos. La mayoría de sus
"habitantes" son entidades funcionales. Esta es una decisión de
producción, no un capricho: el mundo se cuenta a sí mismo.

### PATCH — agente de mantenimiento (PROPOSED)

- **Tipo:** autómata de mantenimiento.
- **Apariencia:** silueta pequeña, con una luz de inspección frontal y
  una mochila-caja. Se mueve sin prisa.
- **Rol jugable:** mostrar trazas, resaltar estados, leer memoria.
  No conoce "la solución". Observa ejecución.
- **Voz:** pocas palabras, orientadas al sistema. "El paquete sigue
  en la cola", "el sensor norte no ve nada", "esta condición nunca
  cambia".
- **Límites:** no juzga al jugador. No le dice qué tarjeta poner.
- **Origen propuesto:** una utilidad de mantenimiento del Instituto
  que quedó en línea y aprendió a no interrumpir.

### Los Operadores (PROPOSED)

- **Tipo:** registros incompletos de antiguos estudiantes, docentes o
  avatares de mantenimiento del Instituto.
- **Apariencia:** figuras distantes, con nombres incompletos en sus
  plaquetas.
- **Rol jugable:** pistas históricas. No son profesores. No narran
  teoría.
- **Voz:** frases breves, incompletas, tomadas de sesiones antiguas.
  "En el turno 3 de 2018...", "el servicio doce dejó de responder
  en...", "queda un paquete sin destinatario...".
- **Límites:** no aparecen en cada puzzle. Cuando aparecen, es porque
  hay un rastro que leer.
- **Origen propuesto:** antiguos estudiantes que dejaron procesos en
  Bitland. Sus sesiones quedaron como fantasmas operativos.

### Procesos locales (PROPOSED)

- **Tipo:** entidades con rutinas específicas. Algunos llevan décadas
  ejecutando el mismo comportamiento.
- **Apariencia:** reconocibles por su rol (repartidor, portero,
  relojero, inspector), no por su cara.
- **Rol jugable:** los sistemas que el jugador lee, depura y
  reescribe.
- **Voz:** no hablan. Cuando un NPC no habla, la narración se
  concentra en el sistema (P11).
- **Límites:** algunos parecen tener personalidad porque llevan
  décadas ejecutando un mismo patrón. El jugador debe resistir la
  tentación de antropomorfizarlos — Bitland no es un cuento de
  robots con consciencia.

### Decisión abierta

- **BL-NB-Q3.** ¿PATCH tiene un dueño? Si lo tiene, ese dueño no
  aparece en el Arco I.

---

## 6. Tono

### Lo que Bitland **es** emocionalmente

- **Curiosidad operativa.** El jugador se pregunta "qué está pasando
  aquí" y la ciudad responde con su traza.
- **Responsabilidad progresiva.** El jugador pasa de "arreglar esto"
  a "esto es parte de un sistema que mantengo".
- **Humor seco, no sarcástico.** Los bugs son absurdos; el sistema
  los muestra; el jugador los lee.
- **Soledad habitada.** Bitland no es solitaria: está llena de
  procesos. Pero no tiene a quien rendirle cuentas más que a sí
  misma.

### Lo que Bitland **no es** emocionalmente

- No es distopía cyberpunk. No hay hackers heroicos, no hay megacorps.
- No es comedia de robots. Los procesos no chistean.
- No es cuento de iniciación con "un mentor". PATCH no es Yoda.
- No es museo melancólico. Bitland corre, no está en ruinas.

---

## 7. Mundo físico y político (alto nivel) — PROPOSED

### Estructura política (PROPOSED)

- Bitland es un archipiélago de barrios con gobiernos locales
  distintos.
- Cada barrio tiene su propia configuración de prioridades, permisos
  y horarios. **Esto es jugable, no decorativo.**
- Algunos barrios están federados: comparten un servicio o un
  contrato. Otros son soberanos: no aceptan servicios externos.
- No hay un "gobierno central" presente. El reloj central existe, pero
  nadie lo opera.

### Cultura de los procesos (PROPOSED)

- Los procesos no tienen cultura. Pero los *patrones* que repiten
  configuran una especie de costumbre operativa.
- El jugador aprende a leer la costumbre del barrio antes de
  reescribirla.

### Economía (PROPOSED)

- No hay moneda. Hay **recursos de sistema**: energía, memoria,
  ancho de banda.
- Los servicios compiten por recursos. El jugador aprende a
  repartir.

---

## 8. Misterios abiertos de la lore — PROPOSED

Estos misterios están disponibles para que la campaña los despliegue
progresivamente. Ninguno se cierra en v1.

1. **¿Qué pasó con el Instituto?** El Instituto dejó de mantener
   Bitland. ¿Por qué? (afecta P15 — el cruce con Ohmdal/Physica se
   decide en P6).
2. **¿Quién fue el último operador humano?** PATCH quizá sabe. PATCH
   no lo dice.
3. **¿Hay un servicio escondido que sí sigue teniendo un
   consumidor?** Sí, y se descubre en algún arco posterior. Cuál y
   dónde queda abierto.
4. **¿Por qué algunos barrios siguen coordinados y otros no?** El
   reloj central se desincronizó por barrios. La causa es heredada.
5. **¿Qué era el Instituto antes de dejar de mantener?** Parte del
   backstory de Roxana. Se coordina con `10-global/institute-bible`
   cuando exista.

> Estos misterios se cierran *en campaña*, no en GDD. La lore no
> cuenta el final.

---

## 9. Reglas duras de lore

1. **Ningún personaje narra teoría (P11).** Si un NPC explica qué es
   un loop, está mal. Lo debe mostrar el sistema.
2. **Ningún bug es un monstruo.** Bitland no tiene antagonista
   personificado. El antagonista, si existe, es la inercia.
3. **Ningún "anciano sabio"** le dice al jugador qué tarjeta poner.
   PATCH observa, no enseña.
4. **Ningún "tutorial disfrazado"** se cuela como cinemática. La
   primera cinemática, si existe, no debe durar más de un
   descubrimiento.
5. **Ningún personaje es indispensable** para la fantasía de Bitland.
   El protagonista real es el sistema.

---

## 10. Voz de los personajes (resumen)

| Personaje | Voz | Lo que NO dice |
|---|---|---|
| PATCH | Oraciones cortas, sistema en foco. | "Deberías probar con un REPEAT". |
| Operadores | Frases incompletas, temporales. | "Recuerda siempre usar bucles while". |
| Procesos | No hablan. | — |
| Jugador (interno) | No narra. | — |

---

## 11. Lo que este documento NO es

- No es la historia del Arco I. Esa vive en `bitland-arc-01_v1.md`.
- No prescribe cámara, arte ni sonido.
- No define puzzles. Eso vive en `bitland-puzzle-grammar_v1.md`.
- No define la sintaxis. Eso vive en
  `bitland-programming-language-gameplay_v1.md`.
- No define el acceso desde el Instituto a nivel de integración: eso
  se decide en P6 con un ADR específico.
- No es canon: es PROPOSED hasta ratificación. **Todo el documento.**

---

## 12. Open questions del documento

Ver frontmatter. Resumen:

- **BL-NB-Q1.** Naturaleza de los Operadores.
- **BL-NB-Q2.** Estado actual del Instituto.
- **BL-NB-Q3.** PATCH con o sin dueño.
- **BL-NB-Q4.** Antagonista personificado o inercia.
- **BL-NB-Q5.** Conocimiento del jugador sobre el Instituto al
  entrar.
