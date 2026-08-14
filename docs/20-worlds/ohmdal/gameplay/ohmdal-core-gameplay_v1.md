---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/sessions/v1/_reference_gdd_reboot_v1/01_OHMDAL_GDD_REBOOT_v1.md (sección 5 — género y estructura; sección 6 — core loop; sección 7 — mecánicas base; sección 9 — regla de múltiples soluciones)
  - draft "Borrador — Interaction Model" contenido en B_OHMDAL_PRODUCTION_GDD_SESSION.md §5
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md
  - docs/ohmdal-biblia/05_GAME_DESIGN_DOCUMENT.md
open_questions:
  - GQ-4 (transversal) — cómo se gobiernan los cruces sin erosionar CONECTAR
  - CG-Q1 — si el modo "Lectura de red" debe abrir un overlay de instrumentación o sólo iluminar nodos en escena
  - CG-Q2 — qué porcentaje mínimo del slice debe resolverse sin abrir ningún panel modal
  - CG-Q3 — si la ayuda opcional (hint contextual) vive dentro del diegético o requiere una UI aparte
  - CG-Q4 — cómo se evita que el "modo Intervención" rompa la inmersión cuando el jugador debe rotar cables durante varios minutos
---

# Ohmdal — Core Gameplay · v1

Traduce la visión en **modelo de interacción, modos de juego, loop observable, feedback y modelo de fallas**. No describe puzzles específicos (eso vive en `puzzle-grammar_v1.md`) ni arcos (eso vive en `arc-01_v1.md`).

> **Estado.** `PROPOSED`. Deriva de la visión (nivel 3) y del GDD canónico (`05_GAME_DESIGN_DOCUMENT.md`). La promoción a `CANON` requiere evidencia de prototipo (Design Review Checklist C10, C11).

---

## 1. Modelo de interacción — visión general

El jugador se mueve en **espacio jugable continuo** (overworld + dioramas). El sistema eléctrico **no abre siempre una pantalla separada**: existe en el escenario como nodos, trazas, instrumentos y protecciones.

Tres modos de juego se activan según contexto y nunca de forma simultánea:

1. **Exploración.** Movimiento, inspección, diálogo, manipulación simple.
2. **Lectura de red.** Overlay técnico que resalta nodos y conexiones, muestra estado cualitativo y habilita sacar instrumentos.
3. **Intervención.** Acciones que modifican el sistema: conectar/desconectar, insertar componentes, elegir puntos de medición, cambiar configuración.

Regla de interfaz (heredada del pack P2 §5): **diegética + overlay técnico, no "minijuego desconectado del mundo"**. Una lupa DOM, un panel modal cerrado o un banco aislado contradicen esta regla y se elevan a bloqueo (Checklist C7, C8).

## 2. Modo 1 — Exploración

Capacidades garantizadas:

- **Movimiento.** Cuatro direcciones canónicas (H2 — `08_VISUAL_DIRECTION_BIBLE.md` §"Direcciones"). Cámara autoral por volúmenes; sin rotación libre. Zoom limitado y accesible.
- **Inspección.** Acercarse a un nodo, equipo o reparación visible y leer etiquetas, marcas, materiales y rastros. La inspección no entrega "datos": entrega descripción que el jugador interpreta.
- **Diálogo contextual.** Activado por proximidad o por interacción explícita. La etiqueta nombra el verbo (`Hablar`, `Observar`, `Inspeccionar`), no la solución.
- **Manipulación simple.** Acciones ambientales que no modifican el sistema eléctrico: abrir una puerta física, mover un objeto decorativo, encender una antorcha aislada, mover una compuerta mecánica.

Lo que el modo Exploración **no** hace:

- No energiza, desenergiza, conecta ni desconecta nada del sistema eléctrico. Esas acciones viven en Intervención.
- No muestra magnitudes, números ni unidades. Esas lecturas viven en Lectura de red.
- No abre puzzles. Abre el escenario.

## 3. Modo 2 — Lectura de red

Capacidades garantizadas:

- **Resaltado cualitativo.** El jugador designa un nodo o subsistema; el mundo resalta nodos energizados, nodos en falla y rutas activas con cambio de luz, animación, sonido o textura. **No es un diagrama técnico superpuesto**: ocurre en escena.
- **Estado cualitativo sin resolver el puzzle.** El overlay nunca entrega la solución. Indica dirección del flujo, presencia o ausencia de energía y estado aproximado (estable, inestable, sobrecargado, inerte). La precisión es del modo Intervención.
- **Sacar instrumentos.** El jugador puede equipar un instrumento disponible (continuidad, voltímetro, amperímetro u osciloscopio en arcos avanzados). Equipar no es medir: medir requiere elegir referencia y rango dentro del modo Intervención.

Regla dura: ningún instrumento se entrega en el camino crítico antes de que la intuición haya demostrado quedarse corta (P02, P06). En el slice del Arco I, los instrumentos llegan cuando el diagnóstico sin medición se vuelve ineficiente.

## 4. Modo 3 — Intervención

Capacidades garantizadas:

- **Conectar / desconectar.** Cerrar o abrir una trayectoria. La acción opera sobre nodos físicos o virtuales claramente indicados. Cerrar nunca se acepta como sinónimos de "completar el puzzle".
- **Insertar componentes.** Cambiar una pieza (resistencia, fusible, interruptor, capacitor, diodo) por otra disponible en el inventario contextual o el banco. Insertar no garantiza éxito: depende de la topología y los valores.
- **Seleccionar puntos de medición.** Designar dos nodos y un instrumento. La selección equivocada (rango, polaridad, referencia) genera lectura inválida, no castigo.
- **Cambiar configuración.** Reorganizar conexiones físicas o topológicas cuando la escena lo permita (puentes, interruptores, conmutadores).

Restricciones del modo Intervención:

- **Nunca destruye progreso.** Un cambio incorrecto vuelve al estado anterior o a un estado observable nuevo que el jugador puede leer (P05, DL-§6).
- **Nunca requiere orden fijo.** Cuando el modelo lo permita, dos órdenes de intervención son aceptables.
- **Nunca valida por "respuesta correcta".** Valida por condición: ¿hay trayectoria completa? ¿está dentro de rango? ¿protege la carga? ¿se mantiene localmente?

## 5. Core loop

**Loop de 30 segundos (escala de interacción 1–2):** Moverse → percibir anomalía → inspeccionar pista → comparar con entorno → decidir si seguir, hablar, leer o intervenir.

**Loop de 5–15 minutos (escala 2–5):**

1. Observar un sistema y su efecto comunitario.
2. Formular una hipótesis breve (en la Bitácora o mediante una acción espacial).
3. Elegir instrumento, referencia o componente.
4. Intervenir y recibir respuesta física, sonora y social.
5. Verificar; si falla, aislar una variable y volver a medir.
6. Explicar la causa y transferirla a otra disposición.

**Loop de región:** Llegar desde el overworld → conocer oficio y conflicto → recorrer infraestructura → resolver dos o tres investigaciones encadenadas → afrontar un sistema integrado → documentar → volver a un territorio transformado → desbloquear una nueva ruta o pregunta.

**Loop de campaña:** Cada región amplía las herramientas epistemológicas del estudiante. La Luz termina cuando Edda y los oficios pueden enseñar y mantener la red sin depender de quien cruzó el Portal (D03, D25).

## 6. Feedback observable

El feedback del sistema responde tres preguntas cuando el jugador falla (DL-§6):

1. **Qué hizo** la solución propuesta, no sólo si fue correcta.
2. **Qué cambió** en el mundo como consecuencia.
3. **Qué queda disponible** como siguiente paso.

Canales de feedback (heredados de `01_OHMDAL_GDD_REBOOT_v1.md` §7 y ampliados):

| Canal | Ejemplos | Restricción |
|---|---|---|
| Iluminación | brillo de filamento, color de luz residual, sombras | no depender sólo de color (accesibilidad) |
| Movimiento | velocidad de motor, caudal, oscilación | ofrecer equivalente visual para datos sonoros críticos |
| Sonido | zumbido, clic de protección, timbre, crujido térmico | subtítulo descriptivo para todo dato crítico |
| Temperatura | humo, decoloración, dilatación visible | el calor no mata; degrada con observación |
| Material | cambio de color en conductor, fractura de aislante, pátina nueva | el material cuenta causalidad (World Bible §2) |
| Protección | fusible abierto, disyuntor saltado, indicador rojo | la protección aporta evidencia, no termina la partida |
| Instrumentos | aguja, dígito, trazo | la lectura cuantitativa es legible con unidades y rango |
| NPC | Ohm informa estado, Edda cuestiona, Lumen repara con procedimiento | NPC reacciona al resultado, no a la intención (P11) |
| Ambiente | partículas, niebla, agua, polvo | partículas ambientales se reducen primero en mobile |

Cuando un canal es la única señal de un cambio importante, se duplica en otro canal. La redundancia no es decoración: es accesibilidad.

## 7. Modelo de fallas

Fallas útiles — toda falla **expone comportamiento**, nunca castiga:

| Falla | Lectura posible | Diseño |
|---|---|---|
| Circuito abierto | se ve la interrupción, se escucha silencio, Ohm no detecta flujo | la pista es visual, no un cartel |
| Cortocircuito | protecciones saltan, indicador cambia, sonido de protección | la protección aporta evidencia, no termina la partida |
| Caída excesiva | carga se atenúa, motor pierde velocidad, instrumento lee tensión baja | el mundo modela la consecuencia |
| Sobrecorriente | fusible se abre, conductor变色, olor a quemado | decoloración + sonido; no hay daño irreversible |
| Potencia insuficiente | carga no arranca, luz no enciende, motor no llega a régimen | comparación con estado esperado |
| Polaridad incorrecta | no arranca o actúa al revés, diodo no conduce | la escena describe la dirección |
| Carga saturada | capacitor no acepta más, transistor entra en corte | la lectura se vuelve estable en nuevo valor |
| Secuencia temporal incorrecta | pulsos llegan fuera de fase, sistema no sincroniza | osciloscopio o equivalente acústico lo muestra |
| Control inestable | oscilación, motor alterna, señal se realimenta | la inestabilidad es visible, no invisible |

### Regla dura

> El fallo no mata arbitrariamente al jugador. **Expone comportamiento.**

Prohibido:

- reinicio opaco sin diagnóstico (DL-§6, P05);
- mensaje "Incorrecto" como único feedback;
- castigo por ensayo razonable (DL-§6);
- trampa de información escondida sin inferencia posible (DL-§4, P14).

## 8. Fuente principal de dificultad

La dificultad se obtiene del sistema, no de la opacidad. Aplicación de DL-§4 y Checklist C6:

- **Cantidad de variables.** Más elementos, más relaciones simultáneas.
- **Distancia causa–efecto.** Más pasos entre acción y consecuencia.
- **Necesidad de anticipación.** El resultado depende de leer el futuro del sistema.
- **Simultaneidad.** Varios subsistemas interactúan.
- **Restricciones.** Componentes, tiempo, energía, recursos.
- **Información incompleta pero inferible.** El jugador no ve todo, pero puede inferir lo que falta.
- **Combinación de conceptos.** Un puzzle exige más de una idea aprendida.
- **Cantidad de soluciones válidas.** Más respuestas correctas con costes distintos.
- **Optimización.** El objetivo no es "funciona", sino "funciona mejor".

Prohibido:

- esconder información sin que sea inferible;
- castigar ensayo razonable;
- recompensar memorización sin lectura de estado;
- castigar por no leer un diálogo obligatorio;
- reiniciar el sistema sin diagnóstico.

## 9. Recompensas (jerarquía aplicada)

Aplicación de DL-§2 y Checklist C7. En orden de prioridad operativa:

1. **Transformación del mundo.** Una región cambia de estado. La luz vuelve, una ruta se abre, una comunidad retoma una tarea.
2. **Nueva capacidad.** Inspección, continuidad, medición DC, modelado, lectura de red, potencia, equivalencia, tiempo, documentación (ver `mechanics-progression_v1.md`).
3. **Acceso.** Regiones, salas, mecánicas o diálogos antes cerrados.
4. **Nueva lectura del sistema.** Cambia cómo se interpreta lo que ya estaba (por ejemplo, ver serie y paralelo donde antes se veía "una red").
5. **Narrativa.** Avance de dilema, relación o misterio — subordinado a 1.
6. **Cosmético / coleccionable** — subordinado a 1–4.

Recompensa prohibida: puntos, experiencia acumulada, estrellas, niveles de personaje, vidas o gacha. No convierten el conteo en motivación dominante (P08, P09, DL-§2).

## 10. Restricciones de interacción

- **No multiple choice como interacción principal.** Cuando un puzzle admita varias respuestas, el jugador las ejecuta sobre el sistema (cerrar una trayectoria, elegir un punto de medición, sustituir un componente). No selecciona una opción de un menú cerrado (P04, P11).
- **No exposición antes de fenómeno.** Una escena técnica comienza con algo visible y termina con una conducta observable, no con una definición (P02, P11, Narrative Bible §3).
- **No diálogo obligatorio para comprender.** Si el jugador necesita leer un diálogo para entender qué acaba de pasar en el sistema, el sistema está fallando visual o sonoramente (P11).
- **No UI que tape puntos de medición críticos.** Mobile debe reencuadrar, no recortar.

## 11. Accesibilidad operativa (resumen)

Aplicación obligatoria de DL-§3 y Checklist O1–O3:

- Affordance visual primera: el propio espacio del mundo indica la acción.
- Espacio seguro: cualquier intervención reversible debe tener un espacio donde probar sin consecuencias duras.
- Consecuencia como tutorial: el sistema responde de modo que el jugador infiere la regla.
- Reacción de personaje, no exposición: NPC reacciona al resultado, no recita teoría.
- Hint contextual: pista breve, local, no modal.
- Bitácora: registro posterior, nunca instrucción previa.
- Explicación explícita: último recurso. Se marca como deuda de diseño.

Independencia de color, subtítulos para todo dato sonoro crítico, reducción de movimiento/partículas, remapeo de teclado, controles táctiles ajustables, sin presión temporal obligatoria (D23, A11y canónica).

## 12. Lo que este documento NO es

- No es la gramática de puzzles. Eso vive en `puzzle-grammar_v1.md`.
- No es la progresión de habilidades. Eso vive en `mechanics-progression_v1.md`.
- No es el sistema eléctrico. Eso vive en `electrical-system_v1.md`.
- No es la biblia de personajes. Eso vive en `narrative-bible_v1.md`.
- No prescribe motor, framework ni UI concreta. Las decisiones de producción viven en `production/` y en el `START_HERE.md`.
