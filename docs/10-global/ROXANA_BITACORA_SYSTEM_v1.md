---
status: PROPOSED
authority_level: 2
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/diseno-sintesis-v1.md (sección 4 — "La Bitácora (sistema triple)"; las tres capas históricas se reformulan en este documento como seis capas y seis estados; los textos originales de voz diegética se conservan en el sistema de Bitácora del mundo correspondiente, no se reescriben aquí)
  - docs/guion-instituto.md (sección 1.3 — pizarrón del aula: su lista de unidades y sus marcas ✓/· pasan a ser **vista derivada de la Bitácora**, no la Bitácora misma)
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md (P01, P02, P05, P06, P07, P08, P11, P12, P15)
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md (escala de interacción §1; formas de formalización §5; feedback §6)
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md
  - docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/10-global/ROXANA_INSTITUTE_BIBLE_v1.md (la Bitácora vive físicamente en el archivo del Instituto)
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md (P12 — la Bitácora global respeta el verbo de Ohmdal)
  - docs/20-worlds/physica/vision/physica-vision_v1.md (P12 — idem Physica)
  - docs/20-worlds/bitland/vision/bitland-vision_v1.md (P12 — idem Bitland)
  - docs/20-worlds/arithmos/vision/arithmos-vision_v1.md (P12 — idem Arithmos)
open_questions:
  - GQ-1 (transversal) — la Bitácora como único sistema con capas delgadas por mundo (propuesta de P6 — la decisión de cierre se delega a Manuel; ver §3.2)
  - BIT-Q1 — si la "Red conceptual" es una vista navegable del archivo o un grafo interactivo dentro del juego
  - BIT-Q2 — si las entradas incompletas con espacios en blanco (sugerencia del legacy v0.1) sobreviven en v1 como sistema formal o se descartan
  - BIT-Q3 — qué forma toma el "registro de soluciones" cuando la validación es por condiciones (P07) y no por respuesta canónica
  - BIT-Q4 — si la Bitácora admite colaboración entre jugadores (notas entre pares) o se mantiene estrictamente individual
  - BIT-Q5 — periodicidad y formato del "retorno a la Bitácora" como ritual de consolidación al volver al Instituto (ligada a GQ-3)

---

# ROXANA — BITÁCORA SYSTEM · v1

Documento de autoridad nivel 2. Biblia global. Define la Bitácora
como **sistema**, no como codex. Declara las **seis capas**, los
**seis estados por entrada**, la **regla temporal** y los puentes
con el Instituto, la metaprogresión y los cruces entre mundos.

> **Estado.** `PROPOSED` en v1. Nace de la sesión P6 sin ratificación
> autoral explícita. La promoción a `CANON` requiere un ADR firmado
> por Manuel (Canon Policy §5).

> **Alcance.** Este documento **define el sistema**. No prescribe
> UI, ni tipografía, ni motor de render. La UI/UX que materializa
> este sistema vive en `ROXANA_GLOBAL_UI_UX_v1.md` §3. La
> implementación actual en `src/landing/` y `src/experiences/` se
> cita como referencia y no se modifica desde este documento.

> **Decisión de fondo.** Este documento propone cerrar la
> pregunta global **GQ-1** de la siguiente manera — sujeto a
> ratificación por Manuel: la Bitácora es **un único sistema
> transversal** con **una capa delgada por mundo** que sólo agrega
> los fenómenos específicos del mundo, sin romper la lectura
> común. La forma exacta de "capa delgada" se define en §3.2.

---

## 1. Tesis

> **La Bitácora registra el viaje del jugador desde el fenómeno
> hasta la transferencia. Nunca se adelanta; nunca se atrasa más
> de lo que la memoria viva puede sostener.**

Cuatro consecuencias operativas:

- La Bitácora es **un sistema**, no un codex ni un manual. Lo que
  importa no es la cantidad de entradas: es la **cadencia** con la
  que una misma idea pasa de OBSERVED a TRANSFERRED.
- La Bitácora es **post-experiencia**, no pre-experiencia
  (P02, P06). Reconoce lo vivido, no anticipa lo por vivir.
- La Bitácora es **una** transversal, no cuatro yuxtapuestas. Los
  mundos pueden agregar fenómenos propios, pero la **regla
  temporal** y los **seis estados** son los mismos en todos.
- La Bitácora **no** es un examen ni un cuestionario (P11, regla
  dura de las sesiones P2–P5). La pregunta se responde jugando,
  no tipeando; el sistema la registra solo, no se la pide al
  jugador.

---

## 2. Lo que la Bitácora NO es

| Idea | Por qué no entra |
|---|---|
| Codex / enciclopedia / glosario | Adelanta al jugador; viola P02 y P06. |
| Manual de fórmulas | Idem; las fórmulas son mapa, no atajo. |
| Examen con calificación | Convierte motivación en puntaje; viola P08 y DL §2. |
| Inventario de items / mochila | El jugador **no** viaja con inventario entre mundos (P12). |
| Cuaderno de notas editable ad-hoc | La edición libre convierte la Bitácora en un diario personal y rompe la lectura común. |
| Sistema de progresión por XP | La Bitácora no acumula puntos; registra estados. |
| Wiki de lore cerrada | El lore de Bitland/Arithmos es PROPOSED y no debe ascender sin ADR. |
| Compilador de respuestas correctas | La validación es por **condiciones**, no por respuesta fija (P07). |

---

## 3. Capas de la Bitácora

La Bitácora se lee y se navega por **capas**. Cada capa es una
**vista** del mismo material, no una sección independiente.

### 3.1. Las seis capas

| # | Capa | Qué muestra | Quién la ve | Vehículo canónico |
|---|---|---|---|---|
| 1 | **Experiencia** | Fenómenos vividos, en orden temporal, sin nombre técnico. | El jugador. | Páginas escritas, bocetos, mediciones crudas, fotos. |
| 2 | **Hipótesis** | Las ideas tempranas del jugador, tachadas o reescritas. | El jugador. | Notas marginales, diagramas tachados, versiones anteriores. |
| 3 | **Formalización** | Nombres, unidades, fórmulas, pseudocódigo, diagramas — **sólo después de evidencia suficiente** (P02, P06). | El jugador. | Entradas estructuradas, con cita a la vivencia. |
| 4 | **Red conceptual** | Cómo se conectan los conceptos **dentro y entre mundos** (P15). | El jugador; el sistema la usa para detectar TRANSFERRED. | Grafo navegable, índice por tema, índice por verbo nuclear. |
| 5 | **Herramienta** | Lo que la Bitácora **hace** por el jugador: recuperar mediciones, comparar, fijar objetivos, mostrar diagramas, registrar soluciones. | El jugador; el sistema. | Acciones in-world y acciones in-Bitácora. |
| 6 | **Maestría** | Problemas opcionales, variaciones, transferencias explícitas. | El jugador que quiere optimización. | Retos aislados, Bitácora extendida, glosario con criterios formales. |

> **Las seis capas son vistas, no niveles.** Una entrada puede
> pasar de la capa 1 a la 6 a lo largo de la campaña, pero la
> capa 5 y la 6 son **opcionales** (P13 — la maestría es
> opcional, la comprensión no).

### 3.2. Capas por mundo (cierre propuesto de GQ-1)

Los cuatro mundos producen fenómenos diferentes:

- Ohmdal produce **trayectorias, magnitudes, lecturas de
  instrumento** (verbo CONECTAR).
- Physica produce **movimiento, comparación antes-después,
  relación entre variables** (EXPERIMENTAR).
- Bitland produce **procesos, estados, condiciones, mensajes,
  cuellos de botella** (PROGRAMAR).
- Arithmos produce **representaciones, equivalencias, propiedades
  conservadas, consecuencias espaciales** (TRANSFORMAR).

> **Decisión propuesta a Manuel (ADR candidato, ver
> `roxana-content-authority-map_v1.md` §4).** Las **capas 1–6 son
> transversales y uniformes** (mismo nombre, misma regla
> temporal, mismos seis estados). Cada mundo tiene permiso de
> agregar una **capa delgada de fenomenología local** que se
> monta **sobre la capa 1 (Experiencia)**: por ejemplo, la
> capa 1 de Ohmdal puede mostrar "el río se apaga", la de
> Bitland puede mostrar "el repartidor choca contra la pared 4
> cada 14 segundos", la de Arithmos puede mostrar "el puente
> calibrado para masa 12 recibe seis piedras de masa 2". El
> resto de las capas (2–6) trata esa fenomenología local con
> las mismas reglas, sin duplicar la estructura.

Esta propuesta mantiene la lectura común, **respeta P12** (cada
mundo se lee distinto) y **no convierte la Bitácora en cuatro
codex yuxtapuestos**. La decisión final de cierre de GQ-1
queda en manos de Manuel, registrada como ADR.

---

## 4. Los seis estados de una entrada

Cada entrada de Bitácora —registrada a partir de un fenómeno
vivido— pasa por **seis estados**. Un estado es una marca
temporal, no un nivel de poder.

| # | Estado | Definición operativa | Se alcanza cuando… | Pasa al siguiente cuando… |
|---|---|---|---|---|
| 1 | **`OBSERVED`** | El jugador **vio** el fenómeno. La Bitácora lo registra tal como lo percibió. | El mundo expone un fenómeno nuevo y el jugador interactuó con él. | El jugador formula una primera hipótesis propia (no copiada). |
| 2 | **`HYPOTHESIZED`** | El jugador tiene una idea propia de **por qué** ocurre. | El jugador escribió o modificó una hipótesis en la Bitácora o en el archivo. | El sistema valida que la hipótesis **predice** una consecuencia observable y el jugador la verifica. |
| 3 | **`FORMALIZED`** | La Bitácora **nombra** el concepto. Aparece la unidad, la fórmula, el símbolo o el pseudocódigo, **siempre después** de evidencia suficiente (P02, P06). | La hipótesis fue probada al menos una vez con éxito. | El jugador aplica el concepto en un contexto **nuevo** (transferencia intra-mundo). |
| 4 | **`APPLIED`** | El jugador usa el concepto como **herramienta** en otro puzzle o en otra región. | El sistema detecta al menos dos aplicaciones intencionales (no accidentales) en contextos distintos. | El jugador demuestra que **predice** sistemáticamente antes de ejecutar (Physica), **conecta** sin ensayo (Ohmdal), **reprograma** sin copiar (Bitland) o **transforma** eligiendo representación (Arithmos). |
| 5 | **`MASTERED`** | La Bitácora reconoce que el jugador domina el concepto en su propio mundo. Es opcional (P13). | El sistema detecta criterios de optimización cumplidos al menos una vez. | El jugador transfiere el concepto a **otro mundo** con un desafío explícito. |
| 6 | **`TRANSFERRED`** | El concepto **se cruzó**. El jugador lo aplicó en un mundo distinto de donde lo aprendió, en un desafío integrador. | El jugador resolvió un desafío de `roxana-cross-world-challenges_v1.md` que requiere ese concepto en otro mundo. | n/a — estado terminal por ahora. Una nueva transferencia a un tercer mundo re-abre el ciclo, pero la entrada conserva `TRANSFERRED` como marca histórica. |

### 4.1. Reglas temporales de la transición de estados

1. **No se adelanta.** Una entrada no puede pasar a un estado
   que requiera evidencia que el jugador aún no generó. La
   Bitácora **nunca** se adelanta al jugador.
2. **No se atrasa más de lo necesario.** Una vez validado un
   estado, no se revierte salvo intervención explícita del
   jugador (por ejemplo, si decide borrar una entrada). El
   sistema no "desaprende" al jugador.
3. **El paso a `FORMALIZED` es opcional pero persistente.** Si
   el jugador no quiere ver el nombre técnico, la entrada
   queda en `HYPOTHESIZED` y el mundo sigue siendo jugable
   (DL §5: "la formalización puede ser ignorada por un jugador
   que no busca optimización").
4. **`MASTERED` se gana, no se compra.** Requiere criterios
   objetivos (definidos por el GDD de cada mundo) y al menos
   un evento de optimización intencional.
5. **`TRANSFERRED` exige un desafío integrador** registrado en
   `roxana-cross-world-challenges_v1.md` y resuelto por el
   jugador. No se transfiere "automáticamente" por visitar un
   mundo.
6. **El paso no es destructivo.** Pasar de un estado a otro
   no borra el anterior. La Bitácora conserva las marcas
   intermedias: un `TRANSFERRED` mantiene como visibles las
   cinco marcas previas.

### 4.2. Marcadores visuales sugeridos (no autoridad)

- `OBSERVED` — página en blanco, una marca pequeña (un punto
  o una flecha) y un sello de fecha.
- `HYPOTHESIZED` — la página tiene una idea del jugador,
  manuscrita, con tachones.
- `FORMALIZED` — la página gana una **versión paralela** en
  tipo limpio, con la unidad, la fórmula o el pseudocódigo.
  La versión manuscrita **no se borra**.
- `APPLIED` — la página muestra el concepto **en uso** en al
  menos dos regiones o dos puzzles distintos.
- `MASTERED` — la página tiene una sección de "variaciones" y
  una marca explícita de optimización.
- `TRANSFERRED` — la página se **conecta** a una entrada de un
  mundo distinto a través de la Red conceptual. La conexión es
  navegable.

> Estos marcadores son **sugerencia de UI**, no autoridad. La
> autoridad de la UI vive en `ROXANA_GLOBAL_UI_UX_v1.md` §3.

---

## 5. La regla temporal de la Bitácora (regla dura)

> **La Bitácora nunca se adelanta al jugador. Sólo registra y
> conecta lo que el jugador ya hizo.**

Esta regla es **no negociable** y se aplica a las seis capas
y a los seis estados. Si una pieza de UI/UX contradice esta
regla, la UI/UX se corrige. Si un sistema de puzzles la
contradice, el puzzle se corrige. Si un NPC la contradice
(P11), el NPC se corrige.

Tres consecuencias operativas:

- **No se permiten entradas "previas".** La Bitácora no tiene
  contenido antes de que el jugador llegue al fenómeno.
- **No se permite el copy "preventivo".** Un cartel que dice
  "esto va a pasar más adelante" viola P11: la narrativa no
  explica lo que el sistema puede mostrar.
- **No se permite "regalar" `FORMALIZED` por evento narrativo.**
  El paso a `FORMALIZED` requiere evidencia experimental, no
  trama.

---

## 6. Bitácora como Herramienta (capa 5)

La capa 5 convierte la Bitácora en **herramienta de uso**, no
sólo de registro. Cinco acciones permitidas:

1. **Recuperar una medición.** El jugador vuelve a una página y
   lee la medición anterior; el sistema la usa para comparación.
2. **Comparar dos entradas.** El jugador abre dos páginas y el
   sistema muestra las diferencias; útil para TRANSFER.
3. **Fijar un objetivo.** El jugador anota un objetivo a
   resolver; la Bitácora lo expone como entrada-viva hasta que
   se cumpla o se archive.
4. **Mostrar un diagrama construido por el jugador.** El
   jugador compone un diagrama dentro de la Bitácora; el
   sistema lo guarda y lo expone en la Red conceptual.
5. **Registrar una solución.** Cuando el jugador resuelve un
   puzzle, el sistema **automáticamente** registra la
   solución como entrada. El jugador no la tipea (P11).

> **Prohibido.** Agregar una sexta acción: "tomar un examen" o
> "contestar una pregunta para avanzar". La Bitácora no es un
> examen.

---

## 7. Red conceptual (capa 4) y TRANSFERRED

La Red conceptual conecta entradas de Bitácora **dentro y entre
mundos**. Su función operativa es doble:

- **Para el jugador.** Mostrar qué conceptos se repiten, qué
  patrones lo atraviesan, qué vocabulario técnico gateado
  empieza a tener sentido. La Red es **navegable**, no decorativa.
- **Para el sistema.** Detectar cuándo un mismo concepto
  aparece en dos mundos distintos bajo el mismo nombre o bajo
  nombres diferentes. La detección de TRANSFERRED **no** se
  hace por simple presencia en dos mundos: requiere un desafío
  integrador resuelto (ver `roxana-cross-world-challenges_v1.md`
  §3).

### 7.1. Tres reglas de la Red

1. **Los nodos no se adelantan.** Un nodo no se crea antes de
   que exista la entrada. Las relaciones entre nodos tampoco.
2. **La Red es legible por el jugador.** El jugador puede
   abrir la Red y ver de dónde sale cada conexión.
3. **La Red no contradice P11.** Ningún nodo "explica" un
   fenómeno que el sistema ya muestra. La Red es un mapa de
   relaciones, no una lección.

---

## 8. Maestría (capa 6)

La capa 6 es **opcional** y vive en una sección explícita y
accesible, no obligatoria. Contiene:

- **Variaciones.** Problemas del mismo concepto con
  restricciones distintas.
- **Desafíos de transferencia.** Problemas que **sólo** se
  ganan con transferencia explícita (P07 + P15).
- **Bitácora extendida.** Glosario con criterios formales y
  citas a la vivencia.

> La maestría **no** desbloquea contenido de campaña. La
> campaña es completable sin tocar la capa 6 (P13).

---

## 9. Reglas de mundo que la Bitácora respeta

| Mundo | Restricción que la Bitácora debe respetar |
|---|---|
| **Ohmdal (CONECTAR)** | La capa 1 puede mostrar trayectorias y magnitudes, pero la capa 3 no entrega `V = I·R` antes de que el jugador haya visto dos puntos a los que conectar una lectura y un resultado. |
| **Physica (EXPERIMENTAR)** | La capa 1 puede mostrar movimientos y relaciones, pero la capa 3 no entrega fórmulas de cinemática antes de evidencia experimental. |
| **Bitland (PROGRAMAR)** | La capa 1 puede mostrar procesos y estados, pero la capa 3 no entrega pseudocódigo canónico antes de que el jugador haya escrito o modificado un comportamiento. |
| **Arithmos (TRANSFORMAR)** | La capa 1 puede mostrar equivalencias y propiedades, pero la capa 3 no entrega notación algebraica antes de que el jugador haya visto dos representaciones equivalentes. |

> Esta tabla se ratifica en el vertical slice de cada mundo
> (ver `ROXANA_GLOBAL_VERTICAL_SLICE_CRITERIA_v1.md`).

---

## 10. Lo que este documento NO es

- No prescribe UI. La UI de la Bitácora vive en
  `ROXANA_GLOBAL_UI_UX_v1.md` §3.
- No prescribe motor, framework, ni almacenamiento. La
  persistencia de la Bitácora se documenta en
  `ROXANA_PLAYER_PROFILE_v1.md`.
- No decide puzzles. La Bitácora **registra** puzzles; no los
  diseña. La gramática de puzzles vive en cada mundo.
- No es el guion textual de la Bitácora. El copy de cada
  entrada queda en la biblia narrativa de su mundo y se
  respeta verbatim (regla dura de `AGENTS.md`).
- No es canon: es `PROPOSED` hasta ratificación por Manuel.
- No redefine los pilares. Si una sección entra en tensión
  con un pilar, el conflicto se eleva a ADR (Pillars §2).
