---
status: PROPOSED
authority_level: 5
version: v1
last_ratified: 2026-08-16
supersedes: []
depends_on:
  - SPIKE_POLICY.md
  - GAME_DEV_AI_TOOLING.md
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../20-worlds/ohmdal/AGENTS.md
  - ../../20-worlds/physica/AGENTS.md
  - ../../20-worlds/bitland/AGENTS.md
  - ../../20-worlds/arithmos/AGENTS.md
open_questions:
  - ENG-Q1 — Bitland: ¿PixiJS + DOM supera a Phaser 4 + DOM para una máquina-ciudad dentro de un microcontrolador bajo el mismo simulation core y builder?
  - ENG-Q2 — Arithmos: ¿dónde queda la frontera entre representación espacial Three.js y representación diagramática PixiJS/SVG?
  - ENG-Q3 — Instituto: ¿la maqueta axonométrica Three.js sostiene sus ocho funciones jugables sin convertirse en menú 3D?
---

# Engine & Interaction Fit — hipótesis pedagógicas por mundo

El motor no se elige por uniformidad ni por moda. Se elige la combinación que permita:

> **percibir → manipular → predecir → observar consecuencia → explicar → transferir**.

La cobertura curricular nunca justifica una representación que enseña peor.

## Restricciones autorales registradas — 2026-08-16

- Los cuatro mundos deben sentirse como **juegos distintos**.
- Desktop y mobile/touch son targets de primera clase.
- Ohmdal se produce en **Phaser 4 top-down room-based** (`src/jugar/`).
- Physica usa **2.5D por defecto** y 3D real sólo cuando la tercera dimensión compra comprensión material.
- Bitland es una **máquina-ciudad: el interior de un microcontrolador**.
- Arithmos **evoluciona entre representaciones**; un renderer híbrido es válido si sirve a la matemática.
- El gate de producto es que el jugador **aprenda**, no que el juego marque una lista de contenidos como cubierta.

## Veredicto provisional

| Scope | Hipótesis | Confianza | Evidencia pendiente |
|---|---|---:|---|
| Instituto | Three.js axonométrico + DOM | media-alta | probar hogar/archivo/progreso/transformación, no sólo estética |
| Ohmdal | Phaser 4 top-down room-based (`src/jugar/`) | alta | legibilidad eléctrica en cámara real |
| Physica | Babylon + analítica TS; 2.5D default, 3D selectivo | alta | validar cada excepción 3D contra 2.5D |
| Bitland | simulation core TS + DOM; **Pixi vs Phaser por paired spikes** | media-alta | BIT-R-A / BIT-R-B |
| Arithmos | transformation core TS + vistas Three/Pixi-SVG/DOM | media-alta | ARI-R-A / ARI-R-B definen frontera |

---

# Ohmdal — Three.js HD-2D

Ohmdal necesita que electricidad sea infraestructura física: caminos, fuentes, mecanismos, cableado, luz, calor, movimiento y sonido. El jugador mira la instalación, forma un modelo, interviene y observa una consecuencia.

## Por qué encaja

- profundidad real para arquitectura/desniveles/mecanismos;
- cámara autoral para mostrar causa → efecto;
- sprites 2D con identidad ilustrada;
- iluminación/materiales como feedback diegético;
- exploración con suficiente fantasía sin convertir el mundo en un diagrama escolar.

## Riesgo principal: producibilidad

No se combate bajando de inmediato a top-down. Se reduce con capas:

1. greybox navegable y puzzle-legible;
2. kit modular;
3. materiales/luz/atmósfera;
4. assets identitarios;
5. hero assets sólo donde importan;
6. polish de golden frames.

El engine no se reabre ahora. Sí se compara **pipeline de assets**.

### OHM-ASSET-A

Pipeline vigente: Blender/GLB o solución modular actual.

### OHM-ASSET-B

Vibe3D/vibe-model source-first para el **mismo** prop hard-surface/módulo arquitectónico no-hero.

Ambos siguen `SPIKE_POLICY.md`. Ganar este spike sólo otorga a la herramienta la familia de assets donde demostró ventaja; no reemplaza Blender entero.

## Renderer baseline

Mantener WebGL de producción. Three.js WebGPURenderer/TSL sólo entra si una necesidad concreta no puede resolverse razonablemente con el baseline y pasa un spike desktop/mobile separado.

---

# Physica — Babylon + analítica; dimensionalidad justificada

```text
Pure TS analytic models = verdad pedagógica
Babylon.js = escena/cámara/interacción/render
Havok = colisiones/física secundaria cuando corresponde
```

## Default 2.5D

Favorece lectura y mobile para:

- caída;
- MRU/MRUV;
- tiro plano;
- rampas/fricción;
- plataformas móviles;
- referencia;
- gran parte del contenido actualmente planificado.

## Trigger para comparar 3D

Si un concepto futuro parece necesitar profundidad real, no se decide por intuición. Se crean dos spikes separados:

### PHY-D-A — 2.5D baseline

La versión bidimensional más simple que siga siendo científicamente correcta.

### PHY-D-B — true 3D

Mismo fenómeno, misma hipótesis, misma información inicial.

3D gana sólo si mejora materialmente predicción/comprensión y compensa control, cámara, orientación, performance y touch.

No ejecutar estos spikes hasta que exista un concepto concreto que los dispare.

## Tooling Babylon

Inspector CLI + MCPs oficiales se prueban como tooling dev/authoring, nunca como core pedagógico. Ver `GAME_DEV_AI_TOOLING.md`.

---

# Bitland — machine-city dentro de un microcontrolador

El mundo es una máquina que ejecuta instrucciones. La actividad computacional se vuelve paisaje.

## Honestidad de metáfora

El microcontrolador da espacialidad y fantasía, pero el modelo de programación manda. No inventar una arquitectura digital falsa para justificar `IF`, funciones o loops.

Puede revelar gradualmente, cuando aporte aprendizaje:

- clock/ticks;
- estado/memoria;
- buses/mensajes;
- IO/periféricos;
- recursos compartidos;
- eventos/interrupciones si forman parte del contenido.

## Core compartido y fijo para los spikes

```text
Pure TypeScript simulation core
  ├─ deterministic state
  ├─ tick scheduler / clock
  ├─ agents + programs + interpreter
  ├─ event log + snapshots + rewind
  ├─ sensors/messages/shared resources
  └─ condition-based validators
          ↓
Renderer adapter A or B
          +
DOM inspector/editor/Bitácora
```

**El renderer jamás define la semántica del programa.**

## Fixture común BIT-R

Los dos spikes deben mostrar exactamente la misma intención:

1. interior de máquina/chip visible;
2. un agente ejecuta 6 instrucciones;
3. clock global observable;
4. step/play/pause;
5. un `IF` cuya consecuencia pueda anticiparse;
6. bug reproducible + trace;
7. 50–200 procesos ambientales baratos;
8. bus/ruta de mensajes visible;
9. desktop + touch;
10. inspector DOM compartido.

### BIT-R-A — PixiJS Machine-City

Hipótesis: el control fino de primitives/lines/layers/particles/custom rendering hace más legibles buses, pulsos, trazas y actividad masiva con menos acoplamiento al renderer.

Usar skills oficiales PixiJS v8 relevantes, no APIs recordadas de v7.

### BIT-R-B — Phaser 4 Machine-City

Hipótesis: alcanza la misma comprensión con menor infraestructura gracias a game loop/cameras/input/scenes/entities/audio, GPU layers, skills oficiales y potencial Scene Editor/MCP.

El Phaser Editor se evalúa como **submétrica de authoring**; el spike puede correr sin comprarlo primero. Si Phaser gana pero authoring espacial queda como cuello de botella, recién entonces se hace un tooling trial del Editor.

## Resultado

Un ganador único es deseable si ambos sirven igual pedagógicamente. Si Pixi gana lectura pero Phaser gana producción, el Director no promedia a ojo: identifica cuál diferencia afecta más el Learning Contract y el coste de producto.

No mantener los dos renderers por comodidad.

---

# Arithmos — representar es transformar

La tesis permite algo diferente a Bitland: **dos vistas pueden ser correctas porque la propia matemática cambia de representación**.

## Core único

```text
Pure TypeScript transformation core
  ├─ mathematical objects
  ├─ representations
  ├─ legal transforms
  ├─ invariants
  ├─ undo/redo
  └─ validators
```

## Fixture común ARI-R

El mismo estado debe recorrerse antes de notación formal:

`12 piezas → 3×4 → 6×2 → representación equivalente → variante`.

### ARI-R-A — Three.js Spatial Equivalence

Prueba materialidad, agrupación, área/forma, recomposición, escala/volumen cuando aplique.

Pregunta: ¿la profundidad vuelve visible una propiedad que en 2D se abstrae demasiado?

### ARI-R-B — PixiJS/SVG Diagrammatic Equivalence

Prueba precisión gráfica, relaciones, rectas/grafos y manipulación 2D con menor carga de perspectiva/oclusión.

Pregunta: ¿el jugador descubre más relaciones porque la representación es más directa?

## Resultado permitido: frontera híbrida

A diferencia de Bitland, estos spikes pueden concluir:

- Three para familia espacial/material;
- Pixi/SVG para familia relacional/diagramática;
- DOM para formalización/accesibilidad.

Eso no es mantener dos engines del mismo juego por indecisión: es hacer de **cambiar representación** una mecánica gobernada por el mismo core matemático.

---

# Instituto — Three.js como hipótesis fuerte

Su prueba no es “se ve mejor”. Debe demostrar que el Instituto funciona como:

- hogar;
- archivo;
- mapa material del progreso;
- lugar transformable;
- espacio de retorno/integración.

Si la axonometría produce un menú 3D disfrazado, se reabre interacción/cámara aunque el render sea atractivo.

---

# Promoción a north definitivo

Una decisión se fija sólo cuando:

1. el spike/slice es jugable;
2. el core pedagógico está separado del renderer;
3. Learning Contract pasa;
4. Player Agent no detecta BLOCKER/MAJOR;
5. transferencia/variante es viable;
6. desktop + touch pasan;
7. producción agentic es sostenible con tooling real;
8. Manuel ratifica.

Para incertidumbres A/B aplica `SPIKE_POLICY.md`; no se decide por demos virales ni por preferencia del agente.
