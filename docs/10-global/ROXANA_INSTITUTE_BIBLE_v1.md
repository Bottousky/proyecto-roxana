---
status: PROPOSED
authority_level: 2
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/guion-instituto.md (texto canónico de hotspots y pizarrón del aula de Electrónica — pasa a ser contrato del aula dentro del Instituto, no del Instituto como espacio)
  - docs/biblia-estilo-instituto.md (sección "Cámara" — el ¾ top-down se mantiene como referencia de cámara 2D del hub; el resto del archivo sigue como insumo histórico)
  - docs/diseno-sintesis-v1.md (sección 3 — prólogo + unidad 1 — sólo la parte de "síntoma compartido Instituto/Ohmdal"; el detalle vive en `ohmdal-arc-01_v1.md` y en este documento)
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md (P08 restauración, P12 une-no-uniforma, P15 culminación en integración)
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md (escala de interacción §1; tipos de recompensa §2)
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md (criterio de canónico, ratificación)
  - docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md (jerarquía y reglas de /10-global)
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md (verbo CONECTAR, P12)
  - docs/20-worlds/physica/vision/physica-vision_v1.md (verbo EXPERIMENTAR)
  - docs/20-worlds/bitland/vision/bitland-vision_v1.md (verbo PROGRAMAR)
  - docs/20-worlds/arithmos/vision/arithmos-vision_v1.md (verbo TRANSFORMAR)
open_questions:
  - GQ-3 (transversal) — periodicidad y forma del regreso a un mundo ya visitado
  - IB-Q1 — qué porcentaje del Instituto debe poder recorrerse en el vertical slice global (la actual implementación sólo recorre el hall)
  - IB-Q2 — si la cámara del hub 3D (Three.js, low-poly) debe ser la misma que el hub 2D top-down (Phaser) o un híbrido
  - IB-Q3 — si la estatua de Roxana del hall es un hotspot narrativo o un atractor de escala
  - IB-Q4 — si el Instituto tiene "niveles superiores" (biblioteca, torre, terraza) jugables o sólo representados
  - IB-Q5 — qué relación física tiene el Instituto con los Mundos Aplicados (escala, orientación, tipo de portal) — esta pregunta no se resuelve aquí, se delega a la decisión de Manuel y a un ADR

---

# ROXANA — INSTITUTE BIBLE · v1

Documento de autoridad nivel 2. Biblia global. Define el Instituto Roxana
como **espacio jugable** (no como menú), con sus funciones de hogar,
misterio, archivo, mapa de progreso, espacio transformable, lugar de
retorno de personajes/artefactos, cruce entre disciplinas y preparación
para nuevos mundos.

> **Estado.** `PROPOSED` en v1. Nace de la sesión P6 sin ratificación
> autoral explícita. La promoción a `CANON` requiere un ADR firmado por
> Manuel (ver `ROXANA_CANON_POLICY_v1.md` §5).

> **Alcance.** Este documento describe el Instituto como espacio y como
> sistema. **No** prescribe cámara específica, motor, ni implementación
> del hub. La cámara 2D ¾ top-down y la cámara 3D voxel hoy existentes
> se citan como **referencia de estado de implementación**, no como
> decisión de diseño. Cualquier cambio de cámara, hub o render no es
> incumbencia de este documento.

> **Convención de nombres.** P12 — *El Instituto une; no uniforma* —
> prohíbe que el Instituto obligue a un mundo a usar su cámara, su
> arte o su UI. El Instituto ofrece estructura, no estética.

---

## 1. Tesis

> **El Instituto Roxana es la memoria material de una práctica que se
> olvidó. Cuando los mundos se restauran, el Instituto se restaura
> con ellos. Cuando el Instituto se restaura, se abre el camino a
> mundos nuevos.**

Tres consecuencias operativas:

- El Instituto **no es** el menú principal. Es un lugar con historia
  propia que el jugador habita, transforma y registra.
- El Instituto **comparte** con los mundos: protagonista, Bitácora,
  reglas pedagógicas y un misterio global. **No comparte**: cámara,
  arte, género, ritmo ni vocabulario técnico de su capa formal
  (P12 — Document Architecture §1 nivel 0/1 de los pilares).
- La **restauración observable** del Instituto (P08) es la prueba
  de que el jugador aprendió algo. No es un cuadro de trofeos: es
  el edificio, las salas, los pasillos y los mecanismos que vuelven
  a funcionar.

---

## 2. Estado de la implementación hoy (referencia, no autoridad)

El Instituto existe hoy en `src/landing/` (voxel low-poly con Three.js,
plataforma central con estatua de Roxana, escalera, terrazas, aulas con
portal) y en `src/experiences/instituto/EscuelaHubScene.ts` (hub 2D
greybox con Phaser, mapa `assets/hub/escuela.json` como fuente del
layout, zonas que sólo loguean por consola en Hito 1). El guion textual
del aula de Electrónica está fijado en `docs/guion-instituto.md` §1
(leyenda, hotspots, pizarrón, proyector, portal). La escala y
jerarquía canónicas del hall 3D están en
`docs/biblia-estilo-instituto.md` (NPC=1 unidad base; estatua
3–4 NPC; escalera 4–6 NPC de ancho).

> **Cita, no canon.** Este documento **no** convierte la implementación
> existente en canon (Canon Policy §2 regla 3: "Implementación no es
> canon"). Si el runtime contradice este documento, el runtime se
> corrige o el documento se eleva por ADR.

La sesión P6 sólo documenta la intención del espacio. La migración del
hub a producción real se hace en `ROXANA_CAMPAIGN_STRUCTURE_v1.md` y
en el plan de producción correspondiente, fuera del alcance de P6.

---

## 3. Las ocho funciones del Instituto

Cada función es una **capacidad observable** del espacio. No se listan
por prioridad; son complementarias.

### 3.1. Hogar

El Instituto es donde el jugador vuelve. No hay un punto de guardado
externo: el Instituto es el **continente del save** y la cámara de
respiración entre sesiones de mundo.

- **Hogar térmico.** Luces cálidas, escala humana, sonidos de
  pasillo. El aula, la sala de profesores, la biblioteca, la
  escalera y el hall son habitaciones, no niveles.
- **Hogar narrativo.** El protagonista vive en el Instituto. El
  Instituto se modifica porque el protagonista vive ahí.
- **Hogar del save.** El perfil del jugador, la Bitácora y el
  estado de los mundos se conservan juntos en un único estado
  local-first (ver `ROXANA_PLAYER_PROFILE_v1.md`).

### 3.2. Misterio

El Instituto plantea preguntas que **ningún mundo responde solo**:

- ¿Qué era realmente el Instituto?
- ¿Qué relación tenía con los Mundos Aplicados?
- ¿Por qué perdió continuidad?
- ¿La escuela creó, descubrió o modificó esos mundos?
- ¿Qué es la Bitácora?
- ¿Por qué ciertos artefactos atraviesan portales?
- ¿Qué cambia cuando se restauran varios mundos?

Estas preguntas se formalizan en `ROXANA_GLOBAL_NARRATIVE_v1.md`.
El Instituto **no** entrega respuestas: las hace visibles. Cada sala,
cada hotspot, cada artefacto del hall puede ser un indicio —nunca
una explicación.

### 3.3. Archivo

El Instituto guarda la Bitácora física del jugador: páginas escritas,
diagramas trazados, mediciones registradas, hipótesis tachadas y
reescritas. El archivo no es un menú de entradas: es una habitación
donde se ve, se hojea y se recuerda lo aprendido.

- **Capa Experiencia** (lo vivido) y **capa Hipótesis** (las ideas
  tempranas) son locales al archivo del Instituto.
- **Capa Formalización**, **Aplicación**, **Maestría** y
  **Transferencia** viven con su entrada de Bitácora, pero su
  **índice navegable** se encuentra en el archivo del Instituto.
- El archivo nunca muestra algo que el jugador no haya vivido. Esa
  es la regla temporal de la Bitácora (ver
  `ROXANA_BITACORA_SYSTEM_v1.md` §3).

### 3.4. Mapa de progreso

El Instituto **muestra** el avance, no lo calcula. La diferencia
respecto a un cuadro de mando convencional es que el Instituto
muestra el avance **como transformación material**:

- Una sala cerrada **se abre** cuando su mundo asociado se acerca
  a un umbral de restauración (ver `ROXANA_METAPROGRESSION_v1.md`
  §4).
- Un mural se ilumina cuando el jugador comprendió el concepto
  asociado.
- Un mecanismo del hall **se repara** cuando se cerró un ciclo
  pedagógico.
- Una **cátedra** (silla, escritorio, pizarrón de un área) se
  reactiva cuando esa disciplina del mundo está disponible.

El pizarrón del aula de Electrónica, hoy en `docs/guion-instituto.md`
§1.3, es el primer caso concreto de "mapa de progreso como
mueble". Los otros pizarrones se diseñan con la misma lógica.

### 3.5. Espacio transformable

El Instituto cambia **materialmente** con el progreso. No es un
menú que muestra un porcentaje; es un edificio que se restaura:

- **Taller eléctrico** se habilita cuando el jugador completó
  el primer ciclo de Ohmdal (verbo CONECTAR).
- **Laboratorio mecánico** se habilita con el primer ciclo de
  Physica (EXPERIMENTAR).
- **Sala de cómputo** se habilita con el primer ciclo de Bitland
  (PROGRAMAR).
- **Gabinete matemático** se habilita con el primer ciclo de
  Arithmos (TRANSFORMAR).
- **Biblioteca** se abre cuando se acumuló suficiente
  conocimiento registrado; ofrece índices, glosarios yBitácora
  extendida, no tutoriales.
- **Exposiciones** se montan automáticamente cuando el jugador
  completa un proyecto integrador (ver
  `roxana-cross-world-challenges_v1.md`).
- **Mecanismos híbridos** (un ascensor, una red de iluminación
  adaptativa, una compuerta) viven en el Instituto cuando un
  desafío interdisciplinario los deja como artefacto permanente.

> **Regla dura.** El Instituto **no** se llena de vendors genéricos
> ni de NPCs de servicio. Cada nuevo espacio tiene una función
> derivada del verbo de un mundo, no del "relleno" de hub.

### 3.6. Lugar de retorno de personajes y artefactos

Cuando el jugador completa un ciclo en un mundo, **algunos**
personajes y artefactos pueden volver al Instituto —no como trofeo,
sino como presencia.

- Un personaje del mundo que aprendió a sostener la restauración
  puede volver como **cátedra viva**: enseña, acompaña, recuerda
  desde el Instituto.
- Un artefacto del mundo puede aparecer **instalado** en el
  espacio transformado (un instrumento en el taller eléctrico,
  una pieza en el gabinete matemático).
- El regreso **nunca** es obligatorio: el mundo debe poder
  sostenerse sin el jugador (D03/D25 de Ohmdal — la comunidad
  consciente no espera al visitante). El Instituto no es un
  zoológico de NPCs ni un museo de trofeos.

### 3.7. Cruce entre disciplinas

El Instituto es el **único lugar** donde dos o más verbos coexisten
en el mismo espacio jugable. La condición para ese cruce está
reglada por `roxana-cross-world-challenges_v1.md` §3:

- El jugador **no** viaja con inventario entre mundos.
- El Instituto **no** es un inventario.
- Lo que el Instituto hace visible es **la comprensión transferida**:
  el jugador demuestra que aprendió en un mundo al aplicarlo en
  otro, y el Instituto registra ese cruce.
- Los mecanismos híbridos del Instituto nacen de proyectos
  integradores completados (ver `ROXANA_GLOBAL_NARRATIVE_v1.md`
  §4 — hilo del Instituto).

### 3.8. Preparación para nuevos mundos

El Instituto se expande materialmente cuando un nuevo mundo
queda disponible. La expansión **no** se hace por una
"actualización" abstracta: se hace abriendo una nueva aula, un
nuevo pasillo, una nueva puerta. La estatua de Roxana, la
escalera y el hall 3D siguen siendo la espina visual del
crecimiento, pero la **lógica de crecimiento** es siempre la
misma: una sala cerrada, un pizarrón apagado, un mecanismo
inactivo se vuelve aula viva, pizarrón iluminado, mecanismo
funcionando.

> **Nota sobre la quinta campaña.** El pack F (§11) y el DoD
> declaran que la estructura de campaña global debe poder
> hospedar **cinco** campañas independientes. Con los cuatro
> Mundos Aplicados actuales (Ohmdal, Physica, Bitland, Arithmos)
> más el Prólogo del Instituto, las cinco campañas son
> Prólogo + Ohmdal + Physica + Bitland + Arithmos. Esta
> numeración es la base que se usa en
> `ROXANA_CAMPAIGN_STRUCTURE_v1.md`. Una sexta campaña queda
> fuera del alcance de P6.

---

## 4. Capas del espacio (no confundir con las capas de la Bitácora)

El Instituto tiene **capas espaciales** además de las **capas de
la Bitácora**. Son independientes. La siguiente tabla muestra la
relación:

| Capa espacial | Función | Aparece cuando… | Referencia |
|---|---|---|---|
| **Hall central** | Plataforma, estatua, escalera, portales | Siempre presente, gris en el primer ingreso | `docs/biblia-estilo-instituto.md` (escala y jerarquía) |
| **Aulas vivas** | Una por mundo, con pizarrón y portal | Cuando el mundo correspondiente queda habilitado | `docs/guion-instituto.md` §1 (Aula de Electrónica como referencia) |
| **Talleres** | Eléctrico, mecánico, de cómputo, matemático | Cuando el verbo del mundo se restauró | §3.5 de este doc |
| **Biblioteca y archivo** | Índices navegables de Bitácora | Cuando hay suficiente registro acumulado | §3.3 de este doc |
| **Mecanismos híbridos** | Ascensor, red adaptativa, compuerta | Cuando se completa un proyecto integrador | `roxana-cross-world-challenges_v1.md` |
| **Cátedras** | Sillas, escritorios, pizarrones | Cuando un personaje del mundo vuelve | §3.6 de este doc |

> **No es jerarquía de poder.** Es enumeración de capacidades. Una
> sala es una capacidad, no un nivel.

---

## 5. La cámara (referencia, no mandato)

El Instituto **no impone** cámara. El runtime puede usar la cámara
que su motor habilite, mientras se respete P12.

Estado actual de implementación (referencia, no canon):

- `EscuelaHubScene.ts`: hub 2D ¾ top-down con colisión por
  rectángulos alineados a ejes (cámara declarada canónica en
  `docs/biblia-estilo-instituto.md`).
- `src/landing/school3d.ts`: hall 3D voxel low-poly con Three.js,
  estatua de Roxana, escalera, terrazas, aulas con portal.
  Escala: NPC = 1 unidad base; estatua total 3–4 NPC; escalera
  4–6 NPC de ancho; baranda 0,6 NPC.

La coexistencia de dos cámaras es una decisión de **producción**,
no de este documento. Si en el futuro el Instituto vive en una
sola cámara, la elección se hace por ADR y se documenta en el plan
de producción correspondiente.

---

## 6. Sonido, ambiente y feedback del espacio

El Instituto responde al jugador sin necesidad de diálogo. Tres
familias de feedback (todas deben respetar P05 — el feedback
produce información, no es decoración):

1. **Luz.** Una sala en obra tiene una lámpara puntual y fría. Una
   sala restaurada tiene luz cálida y uniforme. La transición
   ocurre cuando se cumple el umbral asociado, no por cinemática.
2. **Mecanismo.** El ascensor, las compuertas, las puertas del
   hall emiten sonido **sólo cuando se operan**. El silencio
   también es un estado: una sala que ya no emite mecanismo
   está completa.
3. **Eco.** El silencio del hall cambia cuando el jugador entra.
   El Instituto **no** usa el silencio como castigo ni la música
   ambiental como recompensa. P08 marca la regla: la recompensa
   dominante del Instituto es la **transformación del espacio**,
   no el evento sonoro.

---

## 7. Reglas de aparición de contenido nuevo en el Instituto

> Cualquier objeto, personaje o mecanismo que se agregue al
> Instituto debe poder responder a cinco preguntas. Si no
> responde a todas, no entra.

1. **¿Qué función del Instituto cumple?** (Una de las ocho de §3.)
2. **¿Qué verbo de qué mundo refuerza o requiere?** (CONECTAR,
   EXPERIMENTAR, PROGRAMAR, TRANSFORMAR — o "transversal", pero
   sólo si la respuesta es explícita y se documenta.)
3. **¿Qué transformación observable produce?** (P08. Sin
   transformación observable, no es contenido del Instituto: es
   decoración.)
4. **¿Cuándo se habilita y cuándo se desactiva?** (Un umbral
   medible de progreso, no una fecha narrativa.)
5. **¿Se sostiene sin el jugador?** (Si requiere presencia del
   jugador para existir, está faltando P08. La excepción: el
   protagonista; el resto del Instituto debe poder estar
   "encendido" sin él.)

---

## 8. Lo que este documento NO es

- No es un GDD del hub. La implementación del hub 3D y del hub
  2D vive en `src/landing/` y `src/experiences/instituto/`. La
  referencia de escala vive en
  `docs/biblia-estilo-instituto.md`.
- No es un manifiesto estético. La dirección visual del hall
  3D vive en `docs/biblia-estilo-instituto.md` y en los prompts
  de arte (`docs/prompts-imagenes-instituto.md`).
- No prescribe cámara única. P12 lo prohíbe.
- No decide puzzles, ni NPC jugable, ni copy. Eso vive en las
  biblias narrativas de cada mundo y en el guion del Instituto.
- No reemplaza al guion textual del aula de Electrónica
  (`docs/guion-instituto.md`); sólo lo eleva a "contrato de
  aula" dentro del sistema mayor.
- No decide el árbol de campañas (eso vive en
  `ROXANA_CAMPAIGN_STRUCTURE_v1.md`) ni el contenido de la
  Bitácora (eso vive en `ROXANA_BITACORA_SYSTEM_v1.md`).
