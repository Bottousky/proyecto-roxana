---
status: PROPOSED
authority_level: 4
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/sessions/v1/_reference_gdd_reboot_v1/01_OHMDAL_GDD_REBOOT_v1.md (sección 11 — vertical slice reboot)
  - docs/sessions/v1/B_OHMDAL_PRODUCTION_GDD_SESSION.md §14
  - docs/ohmdal-biblia/10_VERTICAL_SLICE.md (consolidación, no contradicción; reclasifica secciones de runtime como referencia, no autoridad operativa del GDD de producción)
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
  - docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md
  - docs/ohmdal-biblia/10_VERTICAL_SLICE.md
  - docs/ohmdal-biblia/15_DQ3_HD2D_RESEARCH_AND_APPLICATION.md
open_questions:
  - VS-Q1 — si el slice requiere Three.js para aprobarse o admite Phaser como baseline
  - VS-Q2 — qué criterios de cierre son bloqueantes vs. observaciones
  - VS-Q3 — si la plaza encendida del final del slice exige un sistema multi-carga o basta con un subsistema visible
  - VS-Q4 — si el slice debe incluir el cruce de Edda (VS06) o se reserva para el juego base
  - VS-Q5 — qué nivel de instrumentación entrega el slice (sólo continuidad, continuidad + tensión, etc.)
---

# Ohmdal — Vertical slice · v1

Declara el **alcance, los beats, los criterios de éxito y las condiciones de veredicto** del vertical slice ("La pregunta vuelve") del Arco I. **No implementa ni autoriza implementación**: traduce el contrato canónico del slice (`docs/ohmdal-biblia/10_VERTICAL_SLICE.md`) al lenguaje operativo del GDD de producción.

> **Estado.** `PROPOSED`. Este documento **no contradice** `10_VERTICAL_SLICE.md`; lo aterriza a la luz de la arquitectura documental, lo separa del runtime y eleva sus criterios como referencia operativa. Las secciones de runtime, presupuesto y pipeline de `10_VERTICAL_SLICE.md` siguen siendo autoridad canónica para esos temas. La promoción a `CANON` exige evidencia de prototipo y ADR firmado por Manuel.

> **Decisión de scope.** El slice es un **laboratorio aislado**, no una migración del Arco I estable. La migración del juego base exige un ADR posterior y depende del veredicto del slice.

---

## 1. Objetivo

Probar en una experiencia de **20 a 30 minutos** que Ohmdal puede unir **narrativa, aprendizaje auténtico y presentación HD-2D de calidad coherente** en web. El slice no intenta demostrar el juego completo; debe **invalidar temprano** una dirección visual, técnica o pedagógica que no funcione.

> Duración: 20–30 minutos en primera partida, 25–35 según la legacy GDD §"Secuencia". Esta especificación adopta el rango 20–30 como referencia operativa; el rango superior queda como margen y se cierra con playtest (VS-Q2).

## 2. Hipótesis que el slice debe probar

Aplicación de `10_VERTICAL_SLICE.md` §"Hipótesis que debe probar" y traducción operativa:

| # | Hipótesis | Cómo se prueba | Criterio de éxito |
|---|---|---|---|
| H1 | Un entorno 3D de diorama y personajes 2D pueden sentirse integrados, no superpuestos | Recorrido Portal → Manantial, observación de siluetas, sombras y oclusión | Captura desktop y mobile con sprites, suelo, sombras y oclusión percibidos como un mismo mundo |
| H2 | La cámara controlada favorece exploración, lectura de circuitos y emoción sin frustrar navegación | Recorrido completo con encuadres autorales y reencuadre mobile | Sin pop, sin rotación libre, lectura de la relación causal en el mismo encuadre en los puzzles |
| H3 | El jugador aprende circuito completo, medición básica y diagnóstico sin cuestionario ni banco modal | Beats VS-03, VS-05, VS-07 con observación y respuesta del sistema | El jugador explica la causa con evidencia sin repetir sólo la metáfora en ≥80% de los casos del playtest |
| H4 | Edda, Ohm y Lumen expresan tres relaciones distintas con el conocimiento en pocos minutos | Apariciones VS-02, VS-03, VS-04, VS-05, VS-06 | Cada personaje es identificado por su función y su voz sin necesidad de tutorial explícito |
| H5 | Una transformación técnica cambia espacio, sonido, actividad social y comprensión, no sólo enciende luces | Beat VS-08 (Manantial) | Antes/después observables en iluminación, agua, sonido, rutas, actividad y Bitácora |
| H6 | La experiencia carga y responde bien en desktop y mobile web con calidad adaptable | Pruebas de carga y `renderer.info` | 60 fps desktop, 30 fps en Android medio 2022 |

## 3. Alcance cerrado

### 3.1 Tres sets, no una región completa

1. **Portal y Plaza:** llegada, encuadre del diorama, Edda y sistema apagado.
2. **Taller de Lumen:** interior/exterior compacto con el puzzle principal de diagnóstico.
3. **Puerta y Manantial:** transferencia del aprendizaje, apertura, transformación y cierre.

Se comparten una escena exterior y un interior cargado por separado. **No se construyen Castillo, Forja, Terrazas ni Faro.**

Un overworld explorable **mínimo** conecta el punto de llegada con la entrada a Cuenca de Ohm. Sólo debe demostrar viaje, landmark y transición. No se produce el mapa de Ohmdal.

### 3.2 Reparto del slice

- **Protagonista:** un diseño representativo, con contrato que soporte los cuatro. Deuda registrada en el manifest.
- **Edda:** aliada regional en dos o tres cruces, **no** compañera permanente.
- **Lumen:** sprite/híbrido con ritual de taller y cambio de actitud.
- **Ohm:** compañero permanente; sprite según H2.
- **Dos o tres habitantes de fondo** reutilizables para probar escala y vida comunitaria.

### 3.3 Sistemas incluidos

- Caminar, observar, interactuar y conversar.
- Una microinteracción de circuito completo para activar a Ohm.
- Un puzzle principal de diagnóstico con instrumento.
- Una transferencia breve en la Puerta de Ohm.
- Bitácora con vivencia ilustrada, evidencia, formalización y enlace opcional a evaluación.
- Guardado de entrada/salida del slice.
- PWA/offline mínimo, controles de teclado y táctiles.
- Calidad gráfica adaptable y texto de estado determinista para pruebas.

### 3.4 Fuera de alcance

Combate, inventario RPG general, economía, crafting, mundo abierto, ciclo día/noche, clima sistémico, voces completas, cinemáticas prerenderizadas, múltiples finales, assets hero pagados y migración del juego base.

## 4. Flujo jugable — beats

Aplicación consolidada de `10_VERTICAL_SLICE.md` §"Flujo jugable" y `07_NARRATIVE_AND_GAME_SCRIPT.md` §"Guion del vertical slice".

### Beat 1 — VS01 — Portal / Primer encuadre (2–3 min)

- **Objetivo:** establecer estudiante, diorama y anomalía sin exposición.
- **Acción del jugador:** observar tres evidencias mínimo (trazas de cobre, campana sin respuesta, agua detenida) antes de que la cámara ceda el control.
- **Acumulación pedagógica:** capacidad 1 (Inspección) por primera vez; familia P1 por primera vez.
- **Error productivo esperado:** intentar moverse antes de que la cámara habilite el control → la cámara no cede y la acción no ocurre.

### Beat 2 — VS02 — Edda / Dos explicaciones (3–4 min)

- **Objetivo:** validar la pregunta y presentar un modelo local sin ridiculizarlo.
- **Acción del jugador:** marcar una evidencia en la traza. Edda no se suma; se dirige al Taller por una ruta lateral.
- **Acumulación pedagógica:** inicio de la relación Estudiante–Edda; modelo local "no vuelve la luz" vs. "no hay fuerza".
- **Error productivo esperado:** confundir la observación con la explicación; Edda corrige sin dar la respuesta.

### Beat 3 — VS03 — Despertar de Ohm (4–5 min)

- **Objetivo pedagógico:** circuito completo y predicción.
- **Acción del jugador:** inspeccionar continuidad, identificar retorno abierto, predecir qué indicador cambiará, conectar.
- **Acumulación pedagógica:** capacidad 1 (continuidad), capacidad 3 (predicción), familia P1.
- **Error productivo esperado:** cerrar sin retorno; designar el indicador equivocado; energizar antes de predecir. Cada error se ve y se revierte sin reinicio opaco.
- **Cierre observable:** Ohm despierto, calibra posición, registra que el Portal no responde.

### Beat 4 — VS04 — Taller de Lumen (4–5 min)

- **Objetivo:** presentar experiencia práctica y conflicto de modelos.
- **Acción del jugador:** observar a Lumen probar tres módulos/piedras. La marca dejada por Edda es visible. Decidir si propone medir.
- **Acumulación pedagógica:** introducción de la tensión entre procedimiento y explicación; familia P2 (Diagnóstico) en preparación.
- **Error productivo esperado:** pretender que la intuición basta sin medición. Lumen acepta medir si el procedimiento se documenta.

### Beat 5 — VS05 — Diagnóstico de Lumen (8–10 min)

- **Objetivo:** hipótesis → medición → intervención → verificación.
- **Acción del jugador:**
  1. Leer esquema y rastros físicos.
  2. Elegir una hipótesis entre tramos plausibles; ninguna opción es tratada como examen.
  3. Elegir magnitud, referencia y puntos de medición con ayuda contextual.
  4. Medir y comparar. Una medición contradictoria con la hipótesis tacha la nota y abre comparación, no reinicia.
  5. Reajustar o sustituir el módulo causal.
  6. Predecir el indicador final y verificar.
  7. Dejar un esquema que Lumen repite con sus propias palabras.
- **Acumulación pedagógica:** capacidad 3 (medición DC), capacidad 4 (modelado), familia P2 + P4.
- **Errores productivos:** rango incorrecto, polaridad invertida, módulo bien elegido pero mal colocado.

### Beat 6 — VS06 — Cruce de Edda (2 min)

- **Objetivo:** autonomía, rivalidad, preparación de la transferencia.
- **Acción del jugador:** observar que Edda regresa con una medición de otro punto. Su hipótesis inicial fue incompleta, pero descubrió que la Puerta reproduce la relación en otra disposición. Edda se adelanta por una ruta auxiliar.
- **Acumulación pedagógica:** refuerzo de que el método es transferible; la transferencia no requiere presencia del protagonista.

### Beat 7 — VS07 — Puerta de Ohm (5–6 min)

- **Objetivo:** transferencia sin introducir teoría nueva.
- **Acción del jugador:** decidir qué subsistema aislar, aceptar al menos dos órdenes de diagnóstico, evitar una intervención insegura que activa protección y aporta evidencia, verificar antes de abrir.
- **Acumulación pedagógica:** capacidad 1 + 2 + 3 + 4; familia P1 + P2.
- **Error productivo esperado:** pretender transferir la solución del Taller sin verificar la nueva topología.

### Beat 8 — VS08 — Manantial / Formalización (4–5 min)

- **Objetivo:** cerrar emoción, mundo y Bitácora.
- **Acción del jugador:** presenciar la apertura al crepúsculo. Agua, luz, sonido, rutas de habitantes y señalética cambian. Lumen repite el procedimiento a otra persona. Edda confirma su competencia desde otra cota.
- **Acumulación pedagógica:** capacidad 9 (documentación), capacidad 10 (transferencia observada).
- **Cierre observable:** Bitácora reescribe la vivencia como evidencia y formalización; si existe evaluación, aparece el enlace opcional de La Escuela en nueva pestaña.

## 5. Criterios de éxito (gates de cierre)

Aplicación de `10_VERTICAL_SLICE.md` §"Gates de aceptación".

### 5.1 Narrativo

- El jugador entiende que el problema es pérdida de comprensión, no maldad.
- Edda, Lumen y Ohm tienen funciones y voces diferenciadas.
- La apertura del manantial cierra una unidad emocional y abre mundo.

### 5.2 Educativo

- Contenidos centrales en V2 (biblia educativa §"Escala de validación").
- Al menos 80% de usuarios de prueba puede explicar la causa con evidencia sin repetir sólo la metáfora.
- Un error produce información y puede recuperarse.
- Existe transferencia real en la puerta.

### 5.3 Visual

- Capturas desktop y mobile comparadas con un moodboard de cualidades legalmente trazado.
- Sprites, suelo, sombras y oclusión se perciben como un mismo mundo.
- La intervención transforma composición, actividad y materialidad.
- Modo de reducción de partículas/movimiento y contraste legible.

### 5.4 Funcional y técnico

- Build, tests, manifiestos y validación de GLB pasan.
- Sin errores de consola ni pérdidas evidentes al montar/desmontar.
- Controles completos por teclado y táctil; gamepad fuera del slice.
- Medición en hardware real; métricas de `renderer.info` guardadas.
- Chrome, Edge, Firefox y Safari recientes; PWA instalable y recorrido offline.
- Android medio de 2022 sostiene 30 fps sin recortar contenido.
- El juego base sin flags conserva su prólogo y tests.

### 5.5 Legal y productivo

- Ningún asset replica material protegido.
- Fuentes, prompts, proveedor, fecha, coste y licencia registrados.
- El coste real permite estimar el juego base antes de expandir alcance.

## 6. Riesgos abiertos del slice

| Riesgo | Mitigación |
|---|---|
| Three.js no demuestra ser necesario para el quality bar | Phaser se mantiene como baseline; la decisión de migrar exige ADR con evidencia |
| El slice no completa la curva de capacidades | Aceptable: la curva completa se valida en el juego base, no en el slice |
| La plaza encendida exige un sistema multi-carga | Se acepta un subsistema visible; la multi-carga se documenta en el siguiente ADR |
| Edda sobrecarga el slice | El cruce (VS-06) se evalúa como opcional antes de incluirlo |
| El puzzle de Lumen se reduce a "elige la pieza correcta" | Se exige al menos dos órdenes de diagnóstico aceptables y un error productivo explícito |

## 7. Condición de cierre del slice

El slice termina con un **veredicto explícito** registrado en el ADR asociado:

- **avanzar** — la dirección visual, pedagógica y técnica del slice se promueve a base del juego base;
- **corregir una segunda y última ronda** — el slice se itera una vez sobre los bloqueos observados;
- **descartar la dirección** — la dirección visual o pedagógica se abandona; se reabre la conversación.

> Compilar no cuenta como aprobación. Una tercera ronda requiere una nueva decisión registrada y un ADR nuevo.

## 8. Lo que este documento NO es

- No es un plan de producción. El plan vive en `docs/ohmdal-biblia/11_PRODUCTION_BACKLOG.md` y en el ROADMAP.
- No prescribe runtime, framework ni pipeline. Esas decisiones viven en el `START_HERE.md` y en los ADRs de runtime.
- No redefine el sistema eléctrico ni la gramática de puzzles. Esos viven en sus documentos respectivos.
- No reemplaza al slice canónico de `10_VERTICAL_SLICE.md`. Lo aterriza al lenguaje del GDD de producción.
