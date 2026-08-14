---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/03_BITLAND_GDD_v0.1.md (sección 1 — Resumen ejecutivo; sección 2 — Premisa de lore; sección 4 — Fantasía)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
open_questions:
  - BL-V-Q1 — ¿Bitland admite inicialmente un avatar "humano" del jugador, o el jugador es siempre un agente más (un proceso observador) que adopta forma?
  - BL-V-Q2 — ¿Qué edad / tono emocional debe predominar: melancolía operativa, curiosidad arqueológica, o energía de taller de mantenimiento?
  - BL-V-Q3 — ¿Bitland es único (una sola ciudad) o un archipiélago de barrios con gobiernos distintos que el jugador recorre?
  - BL-V-Q4 — ¿Cuánto "ruido ambiental" del mundo heredado debe escucharse en el primer minuto de juego?
  - BL-V-Q5 — ¿La restauración del Instituto es el final del Arco I, o queda como promesa a largo plazo?
---

# BITLAND — VISION · v1

> Documento de autoridad nivel 3. Biblia de mundo y sistemas. Define el *north
> star* de Bitland: qué siente el jugador, qué aprende sin que se lo digan, y
> por qué PROGRAMAR —el verbo nuclear del mundo— es la forma natural de habitar
> este lugar.
>
> Todo el lore introducido en este documento es **PROPOSED** por la restricción
> de canon de la sesión P4. La promoción a CANON requiere ratificación
> explícita de Manuel mediante un ADR.

---

## 1. North Star

> **El jugador no responde qué hace un algoritmo: escribe o ensambla
> comportamiento y observa cómo el mundo lo ejecuta.**

Bitland no es un examen de programación con estética urbana. Es una ciudad
donde los ciudadanos, los transportistas, los porteros, los semáforos, las
cintas transportadoras, los relojes de distrito y los archivos son *procesos
en ejecución*. El jugador los lee, los modifica, los conecta y los
reemplaza. La ciudad reacciona.

La diferencia con una plataforma de ejercicios:

| Plataforma de ejercicios | Bitland |
|---|---|
| El problema es texto y el sistema es un evaluador. | El problema es una calle detenida y el sistema es la ciudad. |
| "Correcto / incorrecto" es el feedback. | "Tu repartidor choca contra la pared 4 cada 14 segundos" es el feedback. |
| El programa termina. | La ciudad sigue ejecutándose después. |
| El jugador abandona la pantalla. | El jugador abandona la ciudad — y otros procesos siguen ahí. |
| La sintaxis es la herramienta principal. | La semántica es la herramienta principal. La sintaxis es opcional, gradual y substituible. |

Bitland no se juega en un editor. Se juega en una ciudad.

---

## 2. Player Fantasy

> **Puedo mirar una ciudad llena de rutinas incomprensibles, descubrir qué
> procesos la sostienen, reprogramarlos, automatizar tareas y construir
> sistemas cada vez más generales.**

Tres capas de fantasía, en este orden de importancia:

1. **Poder observable.** El jugador altera el comportamiento de algo que
   después se mueve, entrega, se detiene o se sincroniza. El cambio no
   requiere creer: se ve.
2. **Lectura del sistema.** El jugador distingue una condición, un bucle, un
   estado, un mensaje, un cuello de botella. La ciudad se vuelve legible
   pieza por pieza, no por un tutorial.
3. **Construcción de lo general.** El jugador descubre que un patrón que
   resolvió en un barrio sirve en otro. Esa generalización es la que da
   forma a la maestría — y se gana, no se le entrega.

La fantasía no incluye "ser un programador profesional", "convertirse en
ingeniero", ni "ganar la partida". Bitland no es una simulación vocacional.
Es una invitación a ver sistemas como material expresivo.

---

## 3. Verbo nuclear y verbos secundarios

- **Verbo nuclear:** PROGRAMAR.
- **Primarios derivados:** ordenar, secuenciar, condicionar, iterar,
  abstraer, depurar, automatizar.
- **Secundarios:** almacenar, comparar, enviar, recibir, sincronizar,
  paralelizar, enrutar, optimizar.

Cualquier feature del mundo que no refuerce PROGRAMAR debe justificar
explícitamente por qué existe (P03). Si la justificación es "queda lindo",
pertenece a otro mundo o no entra.

---

## 4. Tema y frase guía

### Tema

> Una máquina puede seguir funcionando mucho después de que se pierda el
> motivo de su diseño.

Bitland *no está rota*. Bitland *olvidó para quién corría*. Esa es la
diferencia con un juego de "depurar bugs como monstruos": los bugs de Bitland
no son antagonistas. Son rutinas que en su momento tuvieron propósito. Algunas
siguen siendo útiles; otras son lastre; otras son peligrosas porque
optimizaron en local y rompieron en global.

### Frase guía

> "Que algo funcione no significa que haga lo que querías."

### Espejo con Ohmdal (sin repetirlo)

- Ohmdal pierde **modelo de infraestructura física** (la red eléctrica se
  desconfiguró; las máquinas que dependen de ella dejan de tener sentido).
- Bitland pierde **intención y arquitectura del comportamiento** (las
  máquinas funcionan; el motivo por el que existen se perdió).

El cruce entre ambos mundos sólo se materializa cuando uno y otro tienen
identidad jugable propia (P15). Adelantarlo aquí diluye PROGRAMAR.

---

## 5. Premisa de mundo — PROPOSED

> **Toda la sección 5 es lore nuevo. Status: PROPOSED.**

El Instituto usaba Bitland para enseñar computación haciendo que algoritmos y
arquitectura se volvieran espacios transitables. No todo era simulación
abstracta: era una *infraestructura persistente* capaz de mantener procesos
durante años, alimentada por un reloj central y por un sistema de
mensajería entre barrios.

Cuando cesó el mantenimiento, Bitland no se detuvo:

- **Repartidores** siguen llevando paquetes a destinatarios que dejaron de
  existir o que se mudaron de barrio.
- **Puertas** siguen esperando señales que nunca llegan, o que llegan a
  puertas equivocadas.
- **Procesos** se duplican por spawn automático que nadie desactivó.
- **Fábricas** siguen produciendo recursos que ya nadie consume, ocupando
  cintas y energía.
- **Relojes de distrito** quedaron desincronizados entre sí, generando
  ventanas de carrera donde antes había orden.
- **Protocolos antiguos** bloquean rutas nuevas porque nadie los reescribió.
- **Rutinas de mantenimiento** se volvieron rituales: limpian lo que ya no
  existe, ignoran lo que sí.

Bitland no está "infectada por un virus malvado". Sufre
**automatización sin comprensión**.

### Lo que el jugador aprende sin que se lo digan

- Diferencia entre **funcionar** y **servir al propósito**.
- Costo de una optimización local sobre un sistema global.
- Valor de la documentación y del modelo mental que alguien dejó de
  mantener.
- Importancia de *leer* antes de *escribir*.

---

## 6. La transformación del mundo como recompensa central

Por P08 y DL-§2, la recompensa dominante de Bitland debe ser la
**transformación del mundo** (tipo 1), no puntos ni cosméticos:

- Una calle detenida vuelve a entregar paquetes.
- Un barrio entero recupera su horario cuando el jugador reescribe un
  despachador.
- Un reloj de distrito se vuelve a sincronizar.
- Una cola de fábrica se vacía al reordenar prioridades.
- Una puerta deja de esperar una señal inexistente y empieza a enrutar la
  correcta.

Cada puzzle que no produzca una transformación observable en el mundo
está fallando el cierre del ciclo pedagógico. La narrativa puede comentar
esa transformación; nunca debe sustituirla.

---

## 7. Posicionamiento frente al legado

`03_BITLAND_GDD_v0.1.md` se conserva como referencia histórica (LEGACY). Se
reclasifica como **LEGACY** en este documento y queda bajo
`_reference_gdd_reboot_v1/` sin autoridad presente sobre esta v1. Su
contenido inspiró la metáfora de ciudad ejecutable, las etapas de
programación, la lista de microgéneros y la curva de arcos. La v1
reformula:

- Las 7 etapas del legado se reorganizan en **8 etapas jugables** con
  criterios de paso explícitos.
- La noción de "laboratorio de acceso" se difiere al documento de Arco I
  (PROPOSED) y a la decisión de integración P6.
- La sección 17 (Riesgos) se promueve a `bitland-prototype-evaluation_v1.md`.
- La identidad visual no se cierra en este documento; queda en
  `bitland-world-metaphor_v1.md` como territorio de metáfora, no de
  estilo artístico.

Las reclasificaciones a LEGACY/REJECTED concretas se listan en el output
contract de esta sesión.

---

## 8. Lo que este documento NO es

- No prescribe cámara, arte ni sonido. Eso vive en la biblia visual del
  mundo (futura, fuera de esta sesión).
- No prescribe motor, framework ni pipeline.
- No define puzzles. La gramática vive en
  `bitland-puzzle-grammar_v1.md`.
- No define el lenguaje de programación jugable. Eso vive en
  `bitland-programming-language-gameplay_v1.md`.
- No define la progresión. Eso vive en
  `bitland-mechanics-progression_v1.md`.
- No cuenta la historia completa. Eso vive en
  `bitland-narrative-bible_v1.md`.
- No decide el acceso desde el Instituto. Eso se difiere a P6.
- No es canon: es PROPOSED hasta ratificación.

---

## 9. Open questions del documento

Ver frontmatter. Resumen:

- **BL-V-Q1.** ¿Hay avatar humano del jugador o el jugador es un proceso
  observador?
- **BL-V-Q2.** Tono emocional dominante del primer contacto.
- **BL-V-Q3.** Bitland único o archipiélago.
- **BL-V-Q4.** Densidad de ruido ambiental heredado.
- **BL-V-Q5.** ¿La restauración del Instituto es cierre del Arco I o
  promesa?
