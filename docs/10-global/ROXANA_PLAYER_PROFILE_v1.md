---
status: PROPOSED
authority_level: 2
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/diseno-sintesis-v1.md (sección 4 — "La Bitácora (sistema triple)" tercera capa "Progreso": el detalle de "save file conceptual" se reformula en este documento; la exportación como material de estudio se mantiene como decisión de producto, no como sistema de metaprogresión)
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md (P08, P09, P12, P13)
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md (DL §2 tipos de recompensa; §6 feedback)
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md
  - docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/10-global/ROXANA_INSTITUTE_BIBLE_v1.md (el perfil vive en el archivo del Instituto)
  - docs/10-global/ROXANA_BITACORA_SYSTEM_v1.md (la Bitácora es el corazón del perfil)
  - docs/10-global/ROXANA_METAPROGRESSION_v1.md (las siete dimensiones son visibles en el perfil)
  - docs/10-global/ROXANA_GLOBAL_NARRATIVE_v1.md (hilos que el perfil registra)
open_questions:
  - PP-Q1 — si el perfil admite alias o si se mantiene anónimo por default
  - PP-Q2 — si la exportación a PDF/web es un sistema dentro del juego o un servicio externo (la decisión de producto se difiere a Manuel; este doc no la toma)
  - PP-Q3 — si los "tiempos" se registran en todos los retos o sólo donde la decisión de diseño los pide (P13 — la maestría es opcional, la comprensión no)
  - PP-Q4 — si los "hints" son por entrada o por puzzle, y si el jugador puede ocultarlos
  - PP-Q5 — si los "logros cosméticos" (marcar un hito sin mecánica) entran como tipo 6 de DL §2 o se rechazan por defecto
  - PP-Q6 — qué pasa con el perfil cuando el jugador abandona una campaña a mitad (¿se preserva como suspendida, se reinicia, se archiva?)

---

# ROXANA — PLAYER PROFILE · v1

Documento de autoridad nivel 2. Biblia global. Define la
**identidad del jugador a lo largo de las partidas**, qué se
registra, qué no se registra, cómo se preserva la
**continuidad entre sesiones** y cómo se exporta (si se
exporta) la Bitácora como material de estudio.

> **Estado.** `PROPOSED` en v1. Nace de la sesión P6 sin
> ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel (Canon Policy §5).

> **Alcance.** Este documento describe el **perfil del
> jugador** como sistema. No prescribe el formato de
> almacenamiento, ni la base de datos, ni la implementación
> técnica. La persistencia actual (`localStorage` con clave
> `roxana-slice-v1` según `CLAUDE.md`) se cita como
> referencia de implementación, no como canon.

---

## 1. Tesis

> **El perfil del jugador de Roxana es la Bitácora misma,
> más el inventario de artefactos del Instituto. La identidad
> entre partidas se sostiene por la Bitácora, no por un
> puntaje.**

Tres consecuencias operativas:

- **El perfil no es un promedio escolar.** El perfil no
  calcula ni muestra una nota media, ni un ranking, ni una
  curva de aprendizaje. La identidad del jugador es la
  **Bitácora que dejó**.
- **El perfil preserva la Bitácora íntegramente.** La
  Bitácora es la historia jugable del jugador; cortarla es
  cortar la identidad. El perfil puede **resumir** la
  Bitácora, no **reducirla**.
- **El perfil admite abandono y retorno.** El jugador puede
  dejar la campaña a mitad y volver **meses** después; el
  Instituto y la Bitácora lo esperan como lo dejaron.

---

## 2. Lo que el perfil registra

El perfil registra **ocho categorías**. Cada categoría es
una **vista derivada** de la Bitácora, del Instituto o del
sistema de metaprogresión. Ningún dato del perfil es
calculado como promedio ni como puntaje.

| # | Categoría | Fuente | Notas |
|---|---|---|---|
| 1 | **Mundos y arcos** | Estado de campañas | Marca de arco iniciado, completado, restaurado. No es "progreso lineal": es "qué mundos visité". |
| 2 | **Conceptos** | Bitácora (entradas y Red conceptual) | Los conceptos que el jugador tocó, con sus seis estados. No se promedian: se listan. |
| 3 | **Soluciones** | Bitácora (capa 5) | Las soluciones que el jugador dejó registradas. La validación es por condiciones (P07): no se catalogan como "buena" o "mala". |
| 4 | **Maestría** | Bitácora (capa 6) | Marcas de `MASTERED` y `TRANSFERRED`. Visible sólo en capa 6; el perfil no las oculta, pero no las usa como identidad central. |
| 5 | **Hints** | Sistema de hints por puzzle | El sistema guarda qué hints vio el jugador y cuáles quedaron sin abrir. **Nunca** se usa como puntaje ni como "necesidad de ayuda". |
| 6 | **Rutas opcionales** | Estado de regiones y puzzles opcionales | Marca de región o puzzle opcional visitado o completado. |
| 7 | **Construcciones** | Bitácora (capa 5, acción 4 — diagramas construidos) | Diagramas, esquemas y trazados que el jugador compuso dentro de la Bitácora. |
| 8 | **Tiempos** (sólo donde sea relevante) | Eventos del sistema | El tiempo se registra **sólo** en retos donde la decisión de diseño lo pide (por ejemplo, un puzzle de cadencia). **Nunca** se usa como ranking ni como "mejor tiempo". |

> **Lo que el perfil NO registra.**

- **No** promedios ni notas.
- **No** ranking entre jugadores.
- **No** "nivel de personaje".
- **No** tasa de acierto.
- **No** tiempo total de juego (salvo que el jugador lo pida
  explícitamente).
- **No** eventos publicitarios, sociales ni comerciales.
- **No** "achievements" como motivo de identidad. P13
  separa la maestría de la comprensión: los logros no
  reemplazan a la Bitácora.

---

## 3. Lo que el perfil NO es

| Idea | Por qué no entra |
|---|---|
| Promedio escolar | Viola P09, P13 y la decisión de fondo del pack F §7. |
| Ranking global | Viola P09 y la regla de "no XP" de P08. |
| Nivel / experiencia numérica | Viola P08, P09 y DL §2. |
| Inventario de ítems cosméticos | El jugador no viaja con inventario entre mundos. |
| Logro como sustituto de la Bitácora | La Bitácora ya marca los seis estados. |
| Identificación forzada | El perfil puede ser anónimo por default. |
| Exportación a redes sociales como sistema | P09 lo prohíbe. |

---

## 4. Identidad entre partidas (continuidad)

> **El jugador se reconoce por la Bitácora que dejó, no por
> un puntaje que acumuló.**

### 4.1. Lo que persiste

- La Bitácora completa (las seis capas, los seis estados).
- El estado del Instituto (salas, mecanismos, artefactos).
- El estado de cada mundo (regiones, puzzles, NPCs).
- El alias o la decisión de anonimato (ver `PP-Q1`).
- Las marcas de `TRANSFERRED` y de proyecto integrador.

### 4.2. Lo que se puede perder

- **El progreso cosmético no persistente.** Si el jugador
  decide "borrar su progreso cosmético", se respeta.
- **Las marcas de tiempo en retos donde el tiempo no es
  requisito.** No se conservan si la decisión de diseño
  pide que no se conserven.

### 4.3. Lo que nunca se puede perder sin acción explícita

- Las entradas de Bitácora (P02, P06: la Bitácora no
  adelanta; tampoco debe **borrar** sin que el jugador lo
  pida).
- El estado del Instituto (P08: la transformación
  observable es la prueba de que hubo comprensión).
- Las marcas de `TRANSFERRED` (son historia; no se
  "des-prenden").

---

## 5. Persistencia (referencia, no autoridad)

> La persistencia es una decisión de **producción**, no
> de este documento. Este documento fija **qué** se
> persiste, no **cómo**.

Estado actual de implementación (referencia, no canon):

- `localStorage` con clave `roxana-slice-v1` (ver
  `CLAUDE.md`). El formato incluye `{room, flags, …}` y
  permite "spawn directo" para playtest.
- `localStorage` con clave `roxana_cart` para el carrito
  de la landing (ver `src/landing/README.md`). El carrito
  no es parte del perfil del jugador; es un sistema
  auxiliar de la landing.
- La migración a IndexedDB, a un backend con cuentas, o a
  un sistema multi-device, **no** se decide en este
  documento.

### 5.1. Reglas de persistencia (no implementación)

1. **El perfil es local-first.** El jugador anónimo puede
   jugar la campaña completa sin cuenta (ver
   `ROXANA_CAMPAIGN_STRUCTURE_v1.md` §1).
2. **El perfil es portable.** Si se decide exportar a
   PDF/web como material de estudio, esa exportación es
   un **producto** del perfil, no el perfil mismo (ver
   `PP-Q2`).
3. **El perfil admite backup manual.** El jugador puede
   descargar y restaurar su perfil. La forma de hacerlo
   se decide en producción.

---

## 6. Exportación a material de estudio (decisión de
producto, no de sistema)

> Esta sección declara el **principio**, no la
> implementación.

La Bitácora es **exportable** como material de estudio
real. Esa es una de las **promesas** del proyecto desde
`docs/diseno-sintesis-v1.md` §4. La exportación:

- **No** es el perfil. Es un **producto derivado** del
  perfil.
- **No** requiere cuenta. La exportación se hace desde
  el archivo del Instituto, con un clic.
- **No** reemplaza la Bitácora dentro del juego. La
  Bitácora es más rica que su exportación; la exportación
  es un **resumen** navegable, no una copia fidedigna.

> La forma concreta (PDF, página web, EPUB) se decide por
> Manuel en una decisión de producto, **fuera** del
> alcance de P6.

---

## 7. Identidad visual del perfil

> La identidad del perfil es la **Bitácora misma**. No
> hay un avatar separado, ni un "título" que el jugador
> elija como personalidad.

- **Por defecto**, el perfil no tiene avatar. El
  protagonista del juego es el personaje jugable; el
  perfil es su **registro**.
- **Si el jugador lo pide**, puede asignar un alias o
  firmar manualmente sus páginas de Bitácora. Esa firma
  es decorativa; no se usa como identidad mecánica.
- **No** hay "título de Roxana" desbloqueable por
  progreso. P08 y P09 lo prohíben.

---

## 8. Abandonar y volver (P13 + GQ-3)

> **El perfil preserva la Bitácora tal como estaba. El
> jugador puede dejar la campaña a mitad y volver cuando
> quiera.**

- El Instituto abre en el último estado guardado. El
  hall muestra las salas y los mecanismos como estaban.
- La Bitácora conserva todas las marcas, incluso las
  `OBSERVED` no completadas.
- Si un mundo cambió de estado mientras el jugador no
  estaba, el cambio es **diegético**: el mundo siguió
  viviendo. El jugador descubre el cambio al volver
  (ver `ROXANA_GLOBAL_NARRATIVE_v1.md` §4 — formas de
  regreso).

> **No** se penaliza al jugador por ausentarse. **No**
> se le da un bonus por volver rápido. El sistema no
  mide cadencia de visita.

---

## 9. Privacidad

> El perfil no expone al jugador. El jugador decide qué
> se comparte y qué no.

- **Por defecto, el perfil es local.** Sin cuenta, sin
  nube, sin tracking.
- **Si el jugador crea cuenta**, el envío de datos es
  opt-in. La Bitácora, el estado del Instituto y los
  `TRANSFERRED` son los datos que se sincronizan. **No**
  se sincronizan tiempos, hints ni eventos de UI.
- **El jugador puede borrar su perfil completo.** Esa
  acción se respeta sin advertencias paternalistas.

---

## 10. Lo que este documento NO es

- No prescribe implementación técnica. La persistencia
  se delega a producción.
- No es una decisión de producto sobre monetización,
  cuenta o cloud. Esas son decisiones de Manuel fuera
  del alcance de P6.
- No redefine los pilares. Si una sección entra en
  tensión con un pilar, el conflicto se eleva a ADR
  (Pillars §2).
- No es canon: es `PROPOSED` hasta ratificación.
