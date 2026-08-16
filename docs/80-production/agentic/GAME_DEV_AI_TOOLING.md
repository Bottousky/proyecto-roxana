---
status: PROPOSED
authority_level: 5
version: v1
last_ratified: 2026-08-16
supersedes: []
depends_on:
  - README.md
  - ENGINE_MATRIX.md
  - SPIKE_POLICY.md
  - WORKFLOW.md
---

# Game-dev AI Tooling — skills, MCPs y prácticas por runtime

Este documento registra **tooling que ayuda específicamente a construir, jugar, inspeccionar, optimizar o producir juegos web**. No incorpora patrones agentic genéricos sólo porque sean populares.

Regla:

> **El tooling ayuda a un engine a demostrar su fit; nunca convierte un engine mediocre para la disciplina en ganador.**

Las versiones del `package.json` de Roxana no se actualizan dentro del PR del harness. Cada spike declara su versión exacta y cualquier upgrade se evalúa por separado.

## 1. Herramientas transversales

### Playwright — obligatorio para playability automatizable

Roxana ya lo usa. Su función no es reemplazar al Player Agent, sino permitir:

- abrir el runtime real;
- teclado/mouse/touch sintético;
- navegar el camino crítico;
- capturar screenshots;
- leer consola/network;
- reproducir regresiones;
- comparar viewports desktop/mobile.

Los tests mecánicos y el Player Agent son gates distintos.

### Spector.js MCP — candidato transversal WebGL

Spector.js puede inspeccionar **cualquier sitio WebGL**, no sólo Babylon. Su MCP usa Playwright headless y permite cargar una URL, capturar un frame e inspeccionar draw calls, shaders, textures, GL state y logs.

Uso Roxana propuesto:

- Ohmdal Three.js: diagnosticar draw calls, shader/material bugs, texturas y GL warnings;
- Physica Babylon: diagnóstico renderer cuando Inspector no alcanza;
- cualquier spike Phaser/Pixi que esté en WebGL cuando aparezca un fallo de rendering.

No corre en cada milestone. Se invoca cuando existe un problema gráfico/performance que no se explica desde la escena.

### Deterministic debug hooks

Cada runtime de producción debe aspirar a exponer, sólo en dev/test:

- snapshot textual/JSON del estado relevante;
- teleport/spawn controlado cuando el género lo permita;
- input sintético;
- seed fijable para sistemas aleatorios;
- time-step/advance controlado cuando el gameplay lo permita;
- identificación semántica de entidades/zonas importantes.

El objetivo es que un agente pueda **observar estado**, no sólo píxeles.

---

# 2. Three.js — Ohmdal, Instituto y vistas espaciales de Arithmos

## Baseline de producción

Roxana ya usa Three.js. **No migrar a WebGPURenderer por moda.** La documentación oficial todavía lo marca experimental y mantiene `WebGLRenderer` como elección recomendada para aplicaciones WebGL2 puras.

El target desktop+mobile hace especialmente importante no adoptar una feature WebGPU/TSL si no compra gameplay o calidad material verificable.

## Asset runtime

Mantener glTF/GLB como frontera portable cuando el asset no necesita vivir como fuente procedural. `GLTFLoader` soporta Draco, Meshopt, KTX2/Basis y GPU instancing; seleccionar compresión según budget real, no activar todo por defecto.

## Skills recomendadas

### `majidmanzarpour/threejs-game-skills` — candidato fuerte

MIT y específicamente orientado a **browser games**, no sólo graphics demos.

Patrones útiles a incorporar selectivamente:

- gameplay systems;
- deterministic test hooks / seeded systems;
- bot/playability QA;
- canvas inspection;
- desktop + mobile screenshots;
- debug/profiling;
- visual scorecard contra referencias;
- fresh-eyes review;
- distinguir prototype de premium/release-ready.

**No copiar su burocracia/ledgers completos.** Roxana conserva su Task Contract y Bounded Play-Code Loop.

### `Threejs-Awesome-Graphics-Agent-Skills` — referencia selectiva, NO bundle ciego

Útil para cámara, procedural geometry/architecture, materiales, vegetación, agua, atmósfera, VFX y visual validation.

Pero el paquete declara mezcla de licencias y sus third-party notices contienen al menos material GPL-3.0 y fuentes sin licencia observada que el proyecto upstream trata como MIT por decisión propia. Por eso:

- no instalar/copiar todo el pack a producción;
- auditar provenance por skill/example;
- sólo vendorear/adaptar material cuya licencia sea compatible y verificable;
- preferir usar el skill como guía sin copiar assets/código dudoso cuando sea suficiente.

## Vibe3D — EXPERIMENTAL, asset pipeline spike

Vibe3D (MIT) es un registry source-first para Three.js: instala fuente editable, contratos semánticos, materiales/helpers y lock de procedencia en el proyecto. El Sci-Fi Kit es su primer kit.

Lo más interesante para Roxana no es “180 modelos gratis”, sino:

- source installed = el agente puede editar el modelo directamente;
- semantic parts / sockets / actions;
- shared material discipline;
- deterministic preview;
- diff/update ownership;
- export GLB portable cuando conviene.

### `vibe-model`

Fit alto para:

- props hard-surface;
- mecanismos de Ohmdal;
- signage;
- arquitectura modular;
- máquinas;
- hero assemblies mecánicos.

No usar para personajes, orgánicos, foliage o terrain.

Su patrón preview-first coincide con Roxana, pero upstream permite hasta 10 iteraciones. Roxana conserva normal 1–3 / hard cap 5.

### `vibe-terrain`

Interesante para terrain procedural determinista, LOD y collision, pero más inmaduro y con orientación WebGPU/TSL en parte de su pipeline. No introducir en Ohmdal hasta que el spike de `vibe-model` demuestre valor y exista un terreno concreto que justifique el experimento.

### Gate de adopción

Ejecutar `OHM-ASSET-A` y `OHM-ASSET-B` definidos en `SPIKE_POLICY.md`. Si Vibe3D gana, se adopta para la **familia de assets donde ganó**, no como reemplazo automático de Blender/GLB.

## Blender

Blender sigue siendo herramienta primaria cuando importa:

- modelado orgánico/hero;
- UV/retopo/rigging/animation;
- edición visual humana fina;
- bake/LOD/export controlado;
- assets cuyo valor está en una malla final portable más que en configuración procedural runtime.

Vibe3D y Blender son rutas complementarias hasta que evidencia diga lo contrario.

---

# 3. Babylon.js — Physica

## Razón principal

Babylon ya es un buen fit por escena 3D, colisiones, tooling y capacidad de crecer a 3D real. La física pedagógica TypeScript sigue siendo autoritativa; Havok no enseña la ecuación por accidente.

## Inspector CLI — adoptar en spike de tooling

Babylon introdujo un **Inspector CLI orientado a agentes**. Permite consultar entidades, propiedades y scene stats y extender comandos propios.

Propuesta Roxana:

- exponer `physica-state`, `player-body`, `active-experiment`, `analytic-model`, `contacts` como comandos/estado inspeccionable si el coste es bajo;
- usarlo para que QA pueda preguntar al runtime qué está ocurriendo sin depender sólo de screenshot.

Está marcado experimental; encapsular detrás de tooling dev-only.

## Babylon MCP Servers — selectivos

El paquete oficial `@babylonjs/mcp-servers` ofrece MCPs para:

- Node Material Editor;
- Node Geometry Editor;
- Node Render Graph Editor;
- Node Particle Editor;
- GUI Editor;
- Flow Graph Editor;
- Smart Filters.

No habilitar todos siempre.

Para Physica priorizar:

1. **Node Geometry** cuando una máquina/objeto procedural lo justifique;
2. **Node Material** para superficies cuyo comportamiento visual comunica física;
3. **Node Particle** para fenómenos donde partículas aporten lectura;
4. Render Graph sólo si realmente hay un pipeline de render que lo necesite.

GUI/Flow Graph no deben reemplazar el core pedagógico TypeScript.

Pin de versión antes de automatizar una milestone reproducible.

## Spector.js MCP

Complementa Inspector: Inspector entiende la escena Babylon; Spector entiende el frame WebGL. Usar uno u otro según la falla.

---

# 4. PixiJS — candidato Bitland + vistas 2D Arithmos

## AI readiness

PixiJS mantiene un repo **oficial MIT de Agent Skills** para v8. Incluye skills de Application, Assets, scene graph, Graphics, Mesh, Events, Filters, Custom Rendering, Performance, Accessibility, etc.

Además publica documentación AI-readable `llms.txt`, `llms-medium.txt` y `llms-full.txt`.

Esto elimina una parte importante del riesgo de “renderer poco conocido por agentes”.

## Skills prioritarias para Bitland

Si `BIT-R-A` se ejecuta, cargar al menos:

- core concepts / application;
- events;
- math;
- scene graphics;
- particle container;
- custom rendering;
- performance;
- accessibility;
- DOM container si se integra overlay.

No cargar las 25 por defecto; context-on-demand.

## Técnicas a probar en Machine-City

- Graphics/meshes para buses y trazas;
- sprites/particles para pulsos repetidos;
- batching/pooling para actividad ambiental;
- culling por distrito/zoom;
- zIndex/render groups para capas lógicas;
- DOM separado para editor/inspector formal;
- pure TS simulation clock separado del ticker visual.

**El `app.ticker` no es el reloj semántico de Bitland.** El simulation core avanza por ticks deterministas; Pixi interpola/presenta.

## Tooling faltante

No se encontró un scene-editor MCP oficial equivalente al de Phaser. Esto debe contarse como tradeoff de producción, no ocultarse.

---

# 5. Phaser 4 — challenger Bitland

## AI readiness

Phaser 4 incluye oficialmente un conjunto amplio de Agent Skills en su propio repo: setup, scenes, cameras, input keyboard/mouse/touch, tilemaps, physics, particles, filters, rendering y features v4, entre otros.

Phaser 4 además incorporó RenderNodes y GPU-oriented layers que pueden ser útiles cuando una ciudad tenga gran densidad de sprites/tiles.

## Phaser Editor v5

El editor visual v5 soporta Phaser 4 y agrega:

- AI Chat;
- MCP Server con 40+ tools;
- conocimiento de assets reales, dimensiones, origins y relaciones espaciales;
- prefab/scene authoring visual.

Es tooling muy interesante si el cuello de botella es **authoring espacial del mundo**.

Pero es pago y agrega una superficie adicional. No comprar/adoptar como requisito antes de que `BIT-R-B` demuestre que Phaser gana o que el editor reduce materialmente el trabajo.

## Regla Bitland

Aunque Phaser gane:

- interpreter/simulation/ticks/rewind/validators siguen en TypeScript puro;
- Phaser renderiza e interactúa;
- Phaser time/update no define la semántica del programa.

## Phaser Game Agent / servicios generativos

Tratar como opcional. Roxana ya tiene modelos/harnesses y no necesita otro generador end-to-end para obtener valor de Phaser.

---

# 6. IsoCity / custom Canvas — referencia, no nuevo candidato automático

`amilich/isometric-city` demuestra que un city-builder considerable puede existir con TypeScript + Canvas sin game engine y mantener mobile.

Lo valioso para Bitland es estudiar selectivamente:

- proyección isométrica;
- sorting/occlusion 2D;
- optimizaciones de ciudad;
- mobile input;
- simulación y save patterns.

Lo que **no** se adopta por imitación:

- Next.js como runtime de juego;
- un renderer Canvas custom sólo porque un proyecto exitoso lo usa;
- simulation monoliths difíciles de testear;
- ausencia de test framework.

Native Canvas sólo entra como tercer candidato si Pixi y Phaser presentan un bloqueo reproducible que Canvas resuelva claramente.

---

# 7. Tooling que NO entra por ahora

- plataformas “AAA agent-first” todavía no publicadas: inspiración, no dependencia;
- demos sin repo reproducible: referencias visuales, no evidencia de arquitectura;
- `/loop` o “seguí hasta AAA” sin contrato, Player Agent y hard cap;
- model/skill packs con provenance ambigua copiados wholesale;
- engine upgrades mezclados con una comparación de gameplay.

---

# 8. Adoption checklist

Una skill/MCP/plugin entra al camino crítico sólo si:

1. resuelve una tarea frecuente o un cuello de botella real del juego;
2. puede fijarse a versión/commit cuando la reproducibilidad importa;
3. su licencia/provenance es aceptable;
4. no obliga a mover el core pedagógico dentro del tool;
5. funciona con desktop + mobile target cuando toca runtime;
6. otro agente puede repetir su uso desde documentación del repo;
7. existe un fallback razonable si el proyecto externo desaparece.

Herramientas experimentales se encapsulan; el juego nunca depende de que un MCP esté disponible en runtime.
