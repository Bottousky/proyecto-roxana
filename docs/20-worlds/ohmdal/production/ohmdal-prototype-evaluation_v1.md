---
status: PROPOSED
authority_level: 5
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/sessions/v1/_reference_gdd_reboot_v1/01_OHMDAL_GDD_REBOOT_v1.md (sección 15 — métricas de prototipo)
  - draft "Borrador — Métricas de prototipo" contenido en B_OHMDAL_PRODUCTION_GDD_SESSION.md §15
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-puzzle-grammar_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-mechanics-progression_v1.md
  - docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md
  - docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md
  - docs/ohmdal-biblia/10_VERTICAL_SLICE.md
  - docs/ohmdal-biblia/11_PRODUCTION_BACKLOG.md
open_questions:
  - PE-Q1 — si las métricas son vinculantes para promover el slice a base del juego base o sólo diagnóstico
  - PE-Q2 — qué umbral de "transferencia" se exige para declarar V3 de un contenido
  - PE-Q3 — si la telemetría anónima local debe capturar interacción o sólo outcomes
  - PE-Q4 — cómo se mide la "dignidad narrativa" sin caer en encuestas de opinión
  - PE-Q5 — si las métricas de costo por minuto y por región se exigen antes del slice o después de la primera región
---

# Ohmdal — Evaluación de prototipo · v1

Declara **qué se mide, cómo se mide y qué se hace con la evidencia** durante la fase de prototipo (incluido el vertical slice y el primer hito regional jugable). No mide calidad artística (eso vive en la biblia visual) ni cobertura curricular (eso vive en la biblia educativa).

> **Estado.** `PROPOSED`. Es un documento de **producción** (`authority_level: 5`): traduce el GDD de producción en un plan de medición ejecutable. La promoción a `CANON` requiere evidencia de prototipo y ADR firmado por Manuel.

> **Principio rector.** No se optimiza todavía **retención comercial**. Se mide **diseño**: si la promesa jugable, la curva de capacidades y la transferencia se cumplen.

---

## 1. Categorías de medición

Aplicación de `01_OHMDAL_GDD_REBOOT_v1.md` §15 y del pack P2 §15.

| Categoría | Qué mide | Por qué importa | Cómo se recoge |
|---|---|---|---|
| **Tiempo hasta primera hipótesis correcta** | Rapidez con la que el jugador forma una hipótesis defendible | Indica si la affordance visual sostiene el verbo CONECTAR | Telemetría local, opt-in |
| **Cantidad de intentos informativos** | Distinción entre ensayo razonado y ensayo ciego | Diferencia aprendizaje de adivinanza (P05, DL-§6) | Telemetría local, opt-in |
| **Porcentaje que entiende continuidad sin texto** | Lectura del sistema sin exposición previa | Indica si el fenómeno precede al símbolo (P02, P06) | Tarea de playtest mixto |
| **Capacidad de explicar por qué una solución funciona** | Justificación verbal/escrita del jugador | Mide comprensión, no acierto (P04) | Bitácora + entrevista corta |
| **Uso voluntario de medición** | Frecuencia con que el jugador saca el instrumento | Indica si la medición se siente como poder, no como tarea | Telemetría local, opt-in |
| **Cantidad de soluciones distintas** | Variedad de arquitecturas defendibles en P12 | Indica si el sistema admite múltiples soluciones (P07) | Tarea de playtest + revisión de Bitácora |
| **Cantidad de hints requeridos** | Dependencia de pistas | Indica si la curva de dificultad se sostiene sola | Telemetría local, opt-in |
| **Percepción de "estoy reparando un lugar"** | Inmersión narrativa y de mundo | Indica si el juego sobrevive sin etiqueta "educativo" (P09) | Encuesta breve post-sesión |

## 2. Métricas derivadas

A partir de las categorías anteriores se derivan **métricas sintéticas** que se comparan entre iteraciones del prototipo:

- **Tasa de transferencia.** Porcentaje de jugadores que aplican la estrategia de un puzzle al siguiente puzzle de su familia sin pista.
- **Tasa de restauración local.** Porcentaje de jugadores que dejan un esquema repetible por un NPC.
- **Tasa de predicción correcta.** Porcentaje de intervenciones donde la predicción del jugador coincide con la lectura del sistema.
- **Coste por minuto jugable.** Coste de producción estimado por minuto de primera partida, derivado de la medición de assets, líneas, puzzles y cinemáticas producidas.
- **Tiempo medio hasta el primer error informativo.** Tiempo desde el inicio del puzzle hasta la primera intervención que produce observación sin éxito.
- **Tiempo medio hasta el cierre del integrador.** Tiempo desde la presentación del integrador hasta la defensa documentada.

## 3. Telemetría local y opt-in

Aplicación de `02_EDUCATIONAL_CONTENT_BIBLE.md` §"Evaluaciones y métricas" y `D18` del registro de decisiones cerradas.

- **Local-first.** La telemetría se guarda en el dispositivo. No se envía por defecto.
- **Opt-in.** El envío anónimo o el vínculo con La Escuela son voluntarios y están desactivados por defecto.
- **Sin datos personales.** No se incluyen nombre, pronombres, texto libre de la Bitácora ni identificador escolar.
- **Exportación manual.** El jugador puede exportar su telemetría local cuando lo desee; no se sube automáticamente.
- **Inventario de eventos explícito.** El jugador puede ver qué eventos se registran antes de decidir exportar.

## 4. Plan de playtest

### 4.1 Mix de audiencia

Aplicación de `02_EDUCATIONAL_CONTENT_BIBLE.md` §"Escala de validación" V3: playtest mixto 13–18 con y sin electrónica previa. Se complementa con adultos sin formación técnica y con un pequeño grupo de docentes para validar la transferibilidad fuera de la audiencia primaria.

### 4.2 Estructura de la sesión

- **Pre-sesión.** Encuesta breve de perfil: edad, formación previa en electrónica, experiencia previa con juegos similares, expectativas.
- **Sesión.** Recorrido del slice o del primer hito regional. Observación no intrusiva, sin interrumpir salvo bloqueo.
- **Post-sesión.** Entrevista corta sobre las ocho categorías de la tabla §1. Bitácora y telemetría recogidas con consentimiento.

### 4.3 Tamaño de muestra

- **Mínimo para diagnóstico:** 8 participantes por iteración.
- **Mínimo para V3 de un contenido:** 16 participantes con perfil mixto.
- **Mínimo para cierre del slice:** dos iteraciones con veredicto de los gates del slice (`vertical-slice_v1.md` §5).

## 5. Análisis cualitativo

La telemetría no reemplaza la observación cualitativa. Por cada sesión:

- **Bitácora del playtest.** Frases, esquemas, tachones, hipótesis registradas.
- **Momentos de fricción.** Tres a cinco por sesión, con cita textual cuando es posible.
- **Momentos de restauración.** Tres a cinco por sesión, con cita del momento exacto y de la conducta posterior del NPC.
- **Errores productivos emergidos.** Lista de intervenciones que el jugador creyó correctas y el sistema reveló como informativas, no como castigo.

## 6. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Telemetría abruma al jugador | Inventario de eventos corto, opt-in, exportable y borrable. |
| Sesgo de "sí me gustó" en encuestas | Combinar Likert con tarea concreta (explicar por qué, dibujar un esquema). |
| Sub-representar a la audiencia objetivo | Reclutar al menos 50% de participantes entre 13–18 sin formación previa. |
| Métricas arbitrarias | Cada métrica sintética se traza a una pregunta de diseño específica y a un pilar. |
| Métricas que premian comportamiento no deseado | Verificar que ninguna métrica premie ignorar la predicción, abrir un diálogo obligatorio o usar una "solución secreta". |

## 7. Criterios de promoción de prototipo a base de producción

Un prototipo se promueve a base de producción cuando **todas** se cumplen:

- **Coherencia con pilares.** El prototipo no contradice ningún pilar (Checklist C1–C12).
- **Curva pedagógica validada.** Las 4–5 capacidades ganadas en el camino crítico del Arco I tienen al menos un playtest mixto con tasa de transferencia ≥ 60% (definición de base, se ajusta con datos).
- **Restauración local observable.** Al menos 3 de 3 NPC relevantes del slice pueden repetir el procedimiento sin el protagonista en al menos 80% de las sesiones.
- **Visual y técnico.** Los gates de `vertical-slice_v1.md` §5 se cumplen.
- **Legal y productivo.** Los assets tienen manifest, origen, derechos y presupuesto registrado.
- **Costo por minuto.** El coste estimado por minuto jugable no supera el rango presupuestado para la siguiente región.

## 8. Lo que este documento NO es

- No es un plan de marketing. No mide retención comercial ni conversión.
- No es un test automatizado. Las pruebas automatizadas viven en `tests/` y en la biblia de modelos.
- No es un dashboard docente. No se construye para un aula antes de validar el camino crítico.
- No redefine la calidad artística. Ésta se evalúa en la biblia visual.
