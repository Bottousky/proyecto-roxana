# Proyecto Roxana — norte de producto

**Estado:** actualizado el 22 de agosto de 2026.

Este archivo responde **qué estamos construyendo**. El orden de ejecución vive
en [`../ROADMAP.md`](../ROADMAP.md) y la operación técnica en
[`../AGENTS.md`](../AGENTS.md).

## La decisión en una frase

Proyecto Roxana es un **ecosistema educativo jugable**: el Instituto es el hogar que recuerda y cambia; cada disciplina abre un mundo con la gramática que mejor permite experimentarla; la Bitácora formaliza después lo que el jugador ya consiguió percibir y manipular.

No es una tienda de minijuegos, una colección de cursos, una academia 3D genérica ni cuatro reskins del mismo juego.

## Promesa pedagógica

```text
observar
  ↓
experimentar / manipular
  ↓
predecir
  ↓
ver consecuencia y aprender del error
  ↓
comprender la relación
  ↓
formalizar en la Bitácora
  ↓
reutilizar en una variante nueva
```

El objetivo no es “cubrir temario” si la representación no enseña. Un concepto entra cuando encontramos una experiencia jugable capaz de hacerlo comprensible.

## Los cinco espacios

| Scope | Verbo / función | Fantasía / dirección | Tecnología como hipótesis de producción |
|---|---|---|---|
| **Instituto** | unir / recordar / transformar | hogar transformable que materializa progreso, personajes, preguntas y memoria | Three.js axonométrico + DOM; todavía debe demostrar que no se convierte en un menú 3D |
| **Ohmdal** | **CONECTAR** | aventura explorable donde electricidad e infraestructura reaccionan al jugador | **PlayCanvas Engine v2 + TypeScript**; transición técnica todavía no cerrada |
| **Physica** | **EXPERIMENTAR** | plataformas/sandbox físico donde el jugador siente relaciones antes de escribirlas | **Babylon.js + modelos analíticos TS**; 2.5D default, 3D sólo cuando compra comprensión real |
| **Bitland** | **PROGRAMAR** | **máquina-ciudad dentro de un microcontrolador**, visible mientras ejecuta programas | simulation core TS + DOM; **PixiJS y Phaser 4 compiten en spikes separados** |
| **Arithmos** | **TRANSFORMAR** | mundo cuya representación evoluciona mientras una misma estructura matemática se conserva | transformation core TS + **Three.js / PixiJS-SVG / DOM** según la representación |

El Pilar P12 manda: Roxana une los mundos, **no los uniforma**. Engine, cámara, género y arte no se comparten por conveniencia técnica.

---

## Instituto Roxana

El Instituto debe cumplir simultáneamente funciones de:

- hogar;
- misterio;
- archivo;
- mapa de progreso;
- espacio transformable;
- lugar de retorno de personajes/artefactos;
- cruce entre disciplinas;
- preparación para nuevos mundos.

Three.js axonométrico es la hipótesis fuerte porque permite que el progreso se vuelva arquitectura visible. **No está aprobado sólo porque se vea bien:** debe demostrar que volver al Instituto es una acción con valor jugable y emocional.

DOM/CSS conserva texto, Bitácora, accesibilidad y UI compleja.

---

## Ohmdal — CONECTAR

North Star:

> Mirar una instalación de Ohmdal, formar un modelo de cómo circula y se controla la energía, intervenir y observar al mundo reaccionar.

Dirección vigente:

- PlayCanvas Engine v2 + TypeScript + Vite para web;
- 3D estilizado de producción contenida, con cámara/representación decididas por
  evidencia de legibilidad y aprendizaje;
- iluminación/materiales como feedback del sistema;
- terreno e interiores sólo con complejidad que aporte navegación, lectura o fantasía;
- modelos eléctricos TypeScript puros como verdad pedagógica.

El spike en `src/experiences/ohmdal-playcanvas/` demuestra integración inicial,
pero no es todavía una migración completa. El runtime Phaser de `/jugar` y los
prototipos Three.js conservan contenido y regresiones; no se borran por inercia.

El riesgo visual se gestiona por producción incremental:

```text
greybox correcto
→ kit modular
→ materiales/luz
→ assets identitarios
→ hero assets
→ polish sobre experiencia aprobada
```

No se exige arte hero en cada piedra.

### Asset pipeline

Baseline: Blender → GLB / geometría procedural cuando corresponde. MiniMax puede
producir referencias o medios secundarios por `mmx`; Codex revisa antes de
integrar.

---

## Physica — EXPERIMENTAR

North Star:

> Antes de escribir una ecuación, el jugador debe haber sentido la relación con su cuerpo, un objeto o una máquina.

Arquitectura:

```text
modelos analíticos TypeScript = verdad pedagógica
Babylon.js = espacio, cámara, render e interacción
Havok = colisiones / cuerpos secundarios cuando corresponda
```

### Regla dimensional

**2.5D por defecto.**

Usar 3D real sólo cuando restringir el fenómeno a un plano:

- genere una intuición incorrecta;
- esconda un vector/orientación que forma parte del concepto;
- impida comparar comportamientos necesarios del contenido planificado.

Si la tercera dimensión sólo agrega cámara, input y espectacularidad, no se usa.

Babylon es la dirección de **Physica**, no una decisión para todos los mundos.

---

## Bitland — PROGRAMAR

Bitland no es una ciudad cyberpunk decorada con conceptos de programación. Es una **máquina-ciudad que existe dentro de un microcontrolador**.

La máquina debe hacer observable:

- clock/ticks;
- estado y memoria;
- ejecución paso a paso;
- mensajes/rutas/buses cuando aporten;
- agentes/procesos;
- condiciones;
- repetición;
- fallos y trazas;
- pausa, step y rewind donde corresponda.

La metáfora no puede mentir: `IF`, loops, funciones o mensajes siguen siendo conceptos de programación; no se inventa electrónica falsa para justificar el paisaje.

### Core fijo

```text
Pure TypeScript simulation core
  ├─ deterministic state
  ├─ clock/tick scheduler
  ├─ programs/interpreter
  ├─ agents/events/messages
  ├─ snapshots/rewind
  └─ validators
          ↓
renderer experimental
          +
DOM inspector / program UI / Bitácora
```

### Renderer pendiente

Dos spikes aislados, mismo baseline/core/Learning Contract:

- [`80-production/spikes/BIT-R-A-pixijs-machine-city.md`](80-production/spikes/BIT-R-A-pixijs-machine-city.md)
- [`80-production/spikes/BIT-R-B-phaser-machine-city.md`](80-production/spikes/BIT-R-B-phaser-machine-city.md)

PixiJS tiene ventaja hipotética para visualización masiva de señales/trazas; Phaser 4 tiene ventaja hipotética en infraestructura de juego/tooling. **El spike decide.**

---

## Arithmos — TRANSFORMAR

North Star:

> Los números no son respuestas escritas sobre puertas: son propiedades transformables de objetos, espacios y relaciones.

La evolución entre representaciones es parte del juego, no un detalle técnico.

Ejemplo conceptual:

```text
12 piezas
→ 3 grupos de 4
→ 6 grupos de 2
→ área equivalente
→ representación simbólica posterior
```

### Core fijo

```text
Pure TypeScript transformation core
  ├─ mathematical objects
  ├─ representations
  ├─ legal transforms
  ├─ invariants
  ├─ undo/redo
  └─ validators
```

Vistas:

- Three.js 2.5D para materialidad, geometría, área, volumen, teselación, recomposición espacial;
- PixiJS/SVG para grafos, rectas, funciones, relaciones y precisión diagramática;
- DOM para formalización, Bitácora y accesibilidad.

Los primeros spikes son:

- [`80-production/spikes/ARI-R-A-three-spatial-equivalence.md`](80-production/spikes/ARI-R-A-three-spatial-equivalence.md)
- [`80-production/spikes/ARI-R-B-pixisvg-diagrammatic-equivalence.md`](80-production/spikes/ARI-R-B-pixisvg-diagrammatic-equivalence.md)

Acá A y B pueden descubrir una **frontera híbrida** en vez de un ganador único.

---

## La Bitácora

La Bitácora es memoria pedagógica, narrativa y coleccionable.

Forma común:

1. **huella vivida** — evidencia de lo ocurrido;
2. **hipótesis/puente** — relación que el jugador empieza a reconocer;
3. **formalización** — nombre, símbolo, fórmula, código o representación técnica;
4. **reutilización** — aplicar la idea en otro problema.

Nunca reemplaza la experiencia con teoría previa.

---

## Arquitectura global

- Vite + TypeScript como shell web.
- `RuntimeHost` / carga por demanda cuando corresponda.
- estado pedagógico y simulación separados del renderer.
- DOM/CSS para texto, Bitácora y accesibilidad.
- manifests/procedencia para assets.
- Playwright + debug hooks deterministas para gameplay QA.
- desktop + mobile/touch como targets de producto.
- ningún engine upgrade incidental dentro de otra tarea.

No existe un “motor global de Roxana”.

---

## Producción con IA

ChatGPT web diseña/investiga; Codex es el único master harness técnico; Gemini
es peer multimodal/contextual; MiniMax ejecuta producción por CLI `mmx` bajo
revisión de Codex. PlayCanvas y Blender usan MCP sólo cuando el estado vivo de
la aplicación lo justifica. Git, npm, Vite, tests y scripts van por terminal.

Ver [`80-production/AI_TOOLING.md`](80-production/AI_TOOLING.md).

---

## Gate de una experiencia educativa

Una feature no está aprobada porque:

- compile;
- pase tests;
- se vea espectacular;
- el agente diga que está “AAA”.

Cuando el scope es pedagógico, debe existir evidencia de que el jugador puede al menos:

1. percibir el estado relevante;
2. manipular una variable/relación significativa;
3. predecir una consecuencia;
4. obtener información del fallo;
5. transferir la idea a una variante razonable;
6. formalizar después de la experiencia.

La tarea debe convertir estos puntos en criterios observables y declarar la
evidencia necesaria.

---

## Qué leer después

- Producto/autoridad: [`README.md`](README.md) y [`00-governance/`](00-governance/)
- Orden: [`../ROADMAP.md`](../ROADMAP.md)
- Reglas de agentes: [`../AGENTS.md`](../AGENTS.md)
- Mundo concreto: `20-worlds/<mundo>/AGENTS.md`
- Herramientas IA: [`80-production/AI_TOOLING.md`](80-production/AI_TOOLING.md)
