---
status: PROPOSED
authority_level: 4
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/sessions/v1/_reference_gdd_reboot_v1/01_OHMDAL_GDD_REBOOT_v1.md (sección 10 — ARCO I estructura)
  - draft "Borrador — ARCO I" contenido en B_OHMDAL_PRODUCTION_GDD_SESSION.md §13
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-electrical-system_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-puzzle-grammar_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-mechanics-progression_v1.md
  - docs/20-worlds/ohmdal/world/ohmdal-world-structure_v1.md
  - docs/20-worlds/ohmdal/narrative/ohmdal-narrative-bible_v1.md
  - docs/ohmdal-biblia/03_CURRICULUM_AND_ARCS.md
  - docs/ohmdal-biblia/05_GAME_DESIGN_DOCUMENT.md
  - docs/ohmdal-biblia/07_NARRATIVE_AND_GAME_SCRIPT.md
open_questions:
  - A1-Q1 — si el Capítulo 4 (Faro) exige la ficha RC en V2 o se sustituye por una culminación DC validada
  - A1-Q2 — si la Consejera del Castillo entra en el Arco I como NPC del camino crítico o sólo como referencia futura
  - A1-Q3 — si la duración objetivo de 8–12 horas es promesa de comunicación o contrato interno
  - A1-Q4 — qué nivel de "ruido pedagógico" se tolera antes de declarar que el capítulo está sobre-cargado
  - A1-Q5 — si la "Plaza encendida" del final de arco requiere un sistema multi-carga o basta con la Calzada y el Manantial
  - A1-Q6 — si el epílogo "La primera clase" entra en el juego base o se reserva como post-crédito
---

# Ohmdal — Arco I "La Luz" · v1

Declara la **estructura narrativa, la curva de capacidades, los puzzles integradores y los criterios de cierre** del primer arco del mundo. No escribe el guion final (eso vive en el contrato del slice y en el backlog de producción) ni prescribe presentación visual (eso vive en `08_VISUAL_DIRECTION_BIBLE.md`).

> **Estado.** `PROPOSED`. Refina la estructura canónica de `03_CURRICULUM_AND_ARCS.md` §"Juego base: La Luz" y la aterriza a la luz del GDD de producción. La promoción a `CANON` exige validación en prototipo y ADR firmado por Manuel.

> **Nombre del arco.** "La Luz" es el nombre canónico del Arco I (D01, D06 del registro de decisiones cerradas). El nombre "El Río" del reboot legacy se preserva como cantera histórica, no como nombre de arco canónico (`03_CURRICULUM_AND_ARCS.md` §"Estructura canónica" → nota sobre II–VII).

---

## 1. Promesa del arco

> Devolver energía estable y comunidad preguntante a un lugar que olvidó por qué funcionaba.

Tres transformaciones observables al cerrar el arco:

1. **Técnica.** La Calzada, el Castillo, la Forja y el Faro pasan a "sistema comprendido". Las cargas operan dentro de rango, las protecciones están dimensionadas, los procedimientos son repetibles.
2. **Comunitaria.** Lumen, Yesca, Vega, Nereo y al menos un habitante de fondo pueden mantener lo restaurado sin el protagonista. Edda enseña a otra persona.
3. **Pedagógica.** El jugador predice antes de energizar, documenta después de comprender, transfiere antes de cerrar.

El arco **no** cierra el mundo. Marea, Señal, Máquinas, Decisión, Voz y Empalme quedan como horizonte documentado.

## 2. Estructura de capítulos

Aplicación de `07_NARRATIVE_AND_GAME_SCRIPT.md` §"Estructura de La Luz" y `03_CURRICULUM_AND_ARCS.md` §"Juego base: La Luz".

| Capítulo | Título | Centro técnico | Centro narrativo | Capacidades dominantes | Familias dominantes | Cierre observable |
|---|---|---|---|---|---|---|
| Prólogo | La pregunta vuelve | Circuito completo y primera medición | Llega el estudiante, despierta a Ohm, Edda parte por su cuenta | Inspección, continuidad, medición DC | P1, P2 | Ohm despierto; plaza legible; ruta trazada |
| 1 | La Calzada | Tensión, corriente, resistencia, continuidad, instrumentación básica | Lumen pasa de ritual a banco documentado | Medición DC, modelado, lectura de red | P1, P2, P4, P11 | Calzada con luz y agua; primer esquema publicado |
| 2 | El Castillo de la Red | Serie, paralelo, distribución, conservación | La Consejera pasa de sellar a medir y contener | Lectura de red, potencia, equivalencia | P3, P4, P5, P11 | Barrios pueden aislar fallas sin apagarse todos |
| 3 | La Forja y las Terrazas | Potencia, energía, calor, materiales, límites, seguridad | Yesca y Vega pasan de disputa a decisión documentada | Potencia, equivalencia, documentación | P5, P6, P11, P12 | Producción sin sobrecargar la red; esquema comunitario |
| 4 | El Faro y el Lago | Lazos, divisores, equivalentes, comportamiento temporal (RC sólo si V2) | Nereo pasa de memoria frágil a memoria validada | Tiempo (si V2), optimización, enseñanza | P7, P11, P12 | Faro comunica método; comunidad documenta |
| Epílogo | La primera clase | Documentación y transferencia | Edda enseña a otra persona | Enseñanza | P12, P11 | Bitácora de egreso; horizonte abierto |

### 2.1 Prólogo — La pregunta vuelve

- **Objetivo pedagógico:** circuito completo y primera predicción. Sin fórmula. Sin número.
- **Acción principal:** cerrar una trayectoria en escena (Puerta de Ohm o equivalente en la Plaza) para activar a Ohm. Antes de cerrar, el jugador predice qué indicador debería cambiar.
- **Errores productivos esperados:** cerrar la trayectoria sin retorno; energizar sin trayectoria; designar el indicador equivocado. Cada error aporta una observación.
- **NPC en escena:** Ohm, Edda, un habitante de fondo.
- **Cierre observable:** Ohm despierto, Plaza legible, ruta trazada hacia la Calzada.
- **Transferencia obligatoria:** la misma estrategia (cerrar trayectoria + predecir) se aplica en la Puerta de Ohm más adelante.

### 2.2 Capítulo 1 — La Calzada

- **Objetivo pedagógico:** instrumentación básica, magnitudes DC, diagnóstico auténtico. Lenguaje común.
- **Puzzle integrador:** el diagnóstico de Lumen (VS-05 del slice y `vertical-slice_v1.md`). Hipótesis → medición → intervención → verificación → esquema repetible.
- **Errores productivos:** elegir rango incorrecto, sustituir sin verificar, dejar polaridad invertida cuando hay diodo. Cada error deja marca observable.
- **NPC en escena:** Lumen, Edda (en cruce), Ohm, dos o tres habitantes de fondo.
- **Cierre observable:** la Calzada vuelve a tener luz y agua; Lumen publica el primer esquema en su banco.
- **Transferencia obligatoria:** el mismo método (aislar, medir, verificar) se aplica en la Puerta de Ohm y en el primer cruce del Castillo.

### 2.3 Capítulo 2 — El Castillo de la Red

- **Objetivo pedagógico:** serie, paralelo, distribución, conservación. Varias soluciones con consecuencias de servicio y mantenimiento.
- **Puzzle integrador:** distribución de varios barrios con restricciones de prioridad y mantenimiento. La Consejera exige evidencia antes de romper sellos.
- **Errores productivos:** reorganizar serie en paralelo sin revisar límites; abrir un sello sin aislar; privilegiar un servicio sin registrar el coste.
- **NPC en escena:** la Consejera, Edda (en conflicto institucional), Ohm, habitantes afectados por la decisión de distribución.
- **Cierre observable:** los barrios recuperan suministro y pueden aislar fallas; un sello se rompe con documentación pública.
- **Transferencia obligatoria:** la misma estrategia de "aislar, distribuir, documentar" se aplica en la Forja.

### 2.4 Capítulo 3 — La Forja y las Terrazas

- **Objetivo pedagógico:** potencia, energía, calor, materiales, límites, seguridad. Diagnóstico cuantitativo y decisiones con impacto comunitario.
- **Puzzle integrador:** la Forja sobrecarga la red. Yesca y Vega discuten prioridad entre producción y riego. El jugador propone una redistribución con coste explícito.
- **Errores productivos:** sobredimensionar la protección, subdimensionar un conductor, no registrar la temperatura de operación, no dejar un esquema de mantenimiento.
- **NPC en escena:** Yesca, Vega, Edda (investigación propia), Ohm, dos o tres habitantes de fondo.
- **Cierre observable:** la Forja deja de sobrecargar la red; el riego alcanza niveles antes abandonados; existe un esquema comunitario firmado.
- **Transferencia obligatoria:** el mismo razonamiento (potencia + seguridad + mantenibilidad) se aplica al Faro.

### 2.5 Capítulo 4 — El Faro y el Lago

- **Objetivo pedagógico:** lazos, divisores, equivalentes, comportamiento temporal. **RC sólo si la ficha alcanza V2**; en caso contrario, se sustituye por una culminación DC validada (A1-Q1).
- **Puzzle integrador:** sincronización del Faro con el Lago. Nereo conserva un ritmo por oído y memoria; el jugador debe formalizarlo sin borrarlo.
- **Errores productivos:** sustituir el ritmo humano por una frecuencia arbitraria; eliminar la variación que la memoria conservaba; no documentar la calibración.
- **NPC en escena:** Nereo, Edda (primera clase), Ohm, habitantes del Lago.
- **Cierre observable:** el Faro comunica método, no sólo una señal; existe un registro de calibración validado por Nereo.

### 2.6 Epílogo — La primera clase

- **Objetivo pedagógico:** documentación y transferencia.
- **Acción principal:** Edda enseña a otra persona usando la Bitácora. Lumen presta instrumentos, Vega opera, Nereo compara el nuevo patrón con su memoria. El estudiante observa cómo el conocimiento se transfiere sin él.
- **Cierre observable:** Bitácora de egreso con entrada de transferencia; horizonte abierto hacia Marea, Señal, Voz.
- **Decisión de scope (A1-Q6):** incluir en el juego base o reservar como post-crédito se decide por ADR tras evidencia del slice.

## 3. Curva de capacidades (camino crítico)

| Capítulo | Capacidad que se gana | Forma de demostración |
|---|---|---|
| Prólogo | Inspección + continuidad | Cerrar la trayectoria de Ohm y predecir el indicador |
| Calzada | Medición DC + modelado | Diagnosticar a Lumen, documentar el esquema, dejar que Lumen lo repita |
| Castillo | Lectura de red + potencia | Reorganizar una red mixta con restricciones de servicio, romper un sello con evidencia |
| Forja y Terrazas | Equivalencia + seguridad | Redistribuir la carga con coste explícito, dejar un esquema comunitario |
| Faro y Lago | Optimización (y tiempo, si V2) | Sincronizar sin borrar la memoria humana, validar la calibración |
| Epílogo | Enseñanza | Edda enseña a otra persona; el jugador presencia, no ejecuta |

> La progresión es **acumulativa**. Una capacidad ganada no se pierde. La optimización (P11) entra como capa opcional permanente desde la Calzada y se vuelve exigible en el Faro. El epílogo exige que la optimización esté disponible como herramienta del jugador, no sólo como reto.

## 4. Puzzles integradores — uno por capítulo

Cada capítulo cierra con un **puzzle integrador** (P12 acotado: objetivo funcional con varias arquitecturas defendibles). El integrador no exige una nueva familia; exige combinar las capacidades ganadas con la familia P12 explícita.

| Capítulo | Integrador | Familias combinadas | Capacidad dominante | Defensa exigida |
|---|---|---|---|---|
| Prólogo | Despertar de Ohm + cerrar la trayectoria | P1 + P2 | Continuidad | Predicción del indicador antes de energizar |
| Calzada | Diagnóstico de Lumen | P2 + P4 | Medición DC | Documentación del procedimiento para Lumen |
| Castillo | Redistribución de barrios | P3 + P4 + P5 | Lectura de red | Defensa ante la Consejera de por qué una carga queda priorizada |
| Forja y Terrazas | Redistribución Forja ↔ Terrazas | P5 + P6 + P11 | Potencia y seguridad | Defensa del esquema comunitario, con coste explícito |
| Faro y Lago | Sincronización Faro ↔ Lago | P7 + P11 + P12 | Tiempo / optimización | Defensa de la calibración ante Nereo |

## 5. Cierre del arco — criterios de paso

Aplicación de `03_CURRICULUM_AND_ARCS.md` §"Gates educativos por capítulo" y `05_GAME_DESIGN_DOCUMENT.md` §"Definición de terminado por región":

- Contenidos centrales en V2 o superior.
- Existe al menos un error productivo observable y recuperable por capítulo.
- El jugador predice antes del resultado crítico en cada integrador.
- La solución de cada integrador se transfiere a otra situación.
- La Bitácora diferencia evidencia, interpretación y metáfora.
- Una persona de la comunidad puede mantener lo restaurado sin el protagonista en cada región.
- Pruebas automatizadas verifican el modelo técnico, no sólo la secuencia de UI.

### 5.1 Cierre de arco

Cuando los seis capítulos pasan los criterios:

- Se publica la entrada de Bitácora "Cierre de La Luz".
- Se desbloquea el horizonte: Marea, Señal, Máquinas, Decisión, Voz, Empalme aparecen como landmarks visibles en el overworld sin estar producidos.
- Se registra el egreso del estudiante en el Instituto (puerta narrativa, no cinemática larga).
- Se conserva la promesa: la luz vuelve porque la pregunta vuelve; no se cierra el mundo.

## 6. Riesgos abiertos y mitigación

| Riesgo | Mitigación |
|---|---|
| Sobrecargar la curva pedagógica del Arco I | Sólo se exigen 4–5 familias firmes en el camino crítico. El resto entra como reto opcional o se reserva para arcos siguientes. |
| Asumir que la ficha RC alcanzará V2 | Plan B: culminación DC validada en el Faro, sin capacitor (A1-Q1). |
| Volver el Castillo un decorado | Si la Consejera entra como NPC del camino crítico, se exige al menos un sello roto con evidencia y un barrio reorganizado. |
| Subir la duración real por encima de la promesa | La duración 8–12 h se verifica con playtest antes de comunicar. No es promesa hasta entonces. |
| Pérdida de agencia local | El cierre exige que un NPC repita el procedimiento; un playthrough sin esa condición se considera fallido. |

## 7. Lo que este documento NO es

- No es el guion jugable. Las líneas finales de cada escena se escriben contra fichas V2 y cámara aprobada.
- No es la biblia de personajes. Los personajes viven en `narrative-bible_v1.md`.
- No prescribe presentación visual. La dirección visual canónica vive en `08_VISUAL_DIRECTION_BIBLE.md`.
- No es la curva de producción. El backlog de autorización vive en `docs/ohmdal-biblia/11_PRODUCTION_BACKLOG.md` y en el ROADMAP.
- No redefine la gramática ni el sistema eléctrico. Esos viven en sus documentos respectivos.
