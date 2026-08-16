---
status: PROPOSED
authority_level: 5
version: v1
last_ratified: 2026-08-16
supersedes: []
depends_on:
  - WORKFLOW.md
  - SPIKE_POLICY.md
  - GAME_DEV_AI_TOOLING.md
---

# Game-dev references — qué usamos y qué no

Este registro evita dos errores:

1. perder técnicas útiles encontradas en proyectos externos;
2. convertir un post/demo viral en arquitectura sin evidencia reproducible.

Estados:

- **ADOPT** — patrón suficientemente claro y compatible; entra al harness.
- **SPIKE** — prometedor, pero necesita prueba propia de Roxana.
- **MINE** — estudiar/copiarnos técnicas concretas, no arquitectura completa.
- **WATCH** — todavía demasiado nuevo/no reproducible.
- **VISUAL REF** — inspiración visual solamente.

## 1. Sol → Player → Repair → Defense loop (post de Ziwenxu)

**Estado: ADOPT como patrón, no como dogma de modelos.**

Señal original: un Director/loop owner decide DONE; otro modelo usa el producto como persona; un modelo barato repara findings; un cuarto modelo adversarial revisa el PR.

Lo útil para juegos:

- separar **tests** de **usar el juego**;
- Player Agent blind-first;
- fixer barato recibe repros concretos;
- reviewer de defensa entra después de play PASS;
- Director mantiene estado/stop condition.

Adaptación Roxana: `WORKFLOW.md` + `MODEL_ROUTING.md`.

No adoptado:

- asumir que esos cuatro modelos concretos son siempre los mejores;
- loop abierto sin hard cap;
- creer que una IA sustituye evidencia de playtest humano pedagógico final.

## 2. Vibe3D / vibe-model / vibe-terrain

**Estado: SPIKE.**

Repo: `vibe-stack/vibe3d` — MIT, muy nuevo.

Valor potencial:

- assets Three.js source-first instalados en el repo;
- editables por agente;
- shared materials/helpers;
- semantic parts/sockets/actions;
- deterministic preview + critique;
- lock/provenance;
- portable GLB export.

`vibe-model` tiene fit fuerte para hard-surface, máquinas, signage y arquitectura modular. No para personajes/organic/terrain.

`vibe-terrain` es interesante para recetas deterministas, LOD/collision/cache, pero se mantiene WATCH hasta demostrar compatibilidad/valor con el baseline web/mobile de Ohmdal.

Experimento: `OHM-ASSET-A/B` en `SPIKE_POLICY.md`.

## 3. Threejs-Awesome-Graphics-Agent-Skills v0.8.0

**Estado: MINE, no vendor wholesale.**

Valor:

- cámara/dirección;
- procedural architecture/geometry;
- materials/vegetation;
- atmosphere/water/VFX;
- shadows/post/exposure;
- visual validation.

Riesgo:

- paquete mezcla licencias; third-party notices incluyen contenido GPL-3.0 y material sin licencia observada que upstream decide tratar como MIT.

Regla Roxana: sólo adaptar/copiar una pieza tras verificar provenance de esa pieza. Si alcanza con leerla como guía, no copiar source/assets.

## 4. `majidmanzarpour/threejs-game-skills`

**Estado: MINE con prioridad alta. MIT.**

Más relevante para Roxana que un pack puramente gráfico porque está orientado a browser games.

Partes especialmente útiles:

- `threejs-gameplay-systems`: core loop, input/camera, playable increments, explicit update order, game feel;
- `threejs-debug-profiler`: reproducción, canvas/renderer/camera/assets/input/mobile, baseline y re-medición de performance;
- `threejs-qa-release`: browser QA, desktop/mobile, fail/retry, canvas inspection, visual harness y bot playtest.

No adoptar:

- ledgers/ceremonias duplicados de su Director;
- obligación de usar su scaffold en un repo ya existente;
- claims “AAA” sin traducirlos a rúbricas Roxana.

Usar como fuente para mejorar skills propias de Ohmdal/Instituto, no como nuevo orquestador.

## 5. IsoCity — `amilich/isometric-city`

**Estado: MINE. MIT.**

Demuestra que un city-builder web grande puede crecer con TypeScript + native Canvas y mobile. No demuestra que Canvas custom sea el mejor engine para Bitland.

Técnicas concretas útiles observadas:

- **render por capas/canvases**: main, hover, cars, buildings, air, lighting;
- refs para estado de animación de alta frecuencia sin depender de cada React render;
- cache de conteos/análisis costosos por `gridVersion`;
- render queues reutilizadas con `.length = 0` para reducir GC;
- cache de gradients/derived data;
- pinch/pan state explícito en mobile;
- budgets/caps distintos para mobile (por ejemplo entidades dinámicas);
- BFS/pathfinding con typed arrays prealocados para evitar allocations.

Anti-patrones para Roxana:

- `CanvasIsometricGrid.tsx` es enorme y concentra demasiadas responsabilidades;
- evitar un simulation/render monolith equivalente;
- no sumar Next.js/React al runtime de Bitland sólo por copiar el proyecto;
- no abrir un tercer candidato native Canvas salvo bloqueo concreto de Pixi/Phaser.

La estructura que sí queremos mantener es:

`pure simulation core → thin renderer adapter → DOM UI`.

## 6. Metropolis demo + “Grok /loop”

**Estado: VISUAL REF / WATCH.**

La build pública puede inspirar densidad/ambición visual, pero no se encontró source reproducible asociado que permita atribuir el resultado a una arquitectura o metodología verificable.

No usar como evidencia para:

- elegir Grok como Builder;
- adoptar `/loop`;
- afirmar que full 3D es más barato/sencillo;
- cambiar engine.

Sí usar screenshots/video como visual reference si una milestone necesita un benchmark de densidad o city feel.

## 7. GamefxAI “agent-first AAA templates”

**Estado: WATCH.**

Idea alineada con Template Skills, pero sin plataforma pública/reproducible suficiente al momento de la revisión.

No esperar el proyecto ni diseñar Roxana alrededor de promesas futuras.

## 8. Phaser 4 official skills + Phaser Editor v5 MCP

**Estado: ADOPT como tooling del spike Phaser; Editor = SPIKE posterior si hay bottleneck.**

Phaser 4 mantiene skills oficiales para agentes. Phaser Editor v5 suma Scene Editor + AI + MCP con 40+ tools y conocimiento de assets/positions.

Uso:

- `BIT-R-B` carga skills oficiales;
- no comprar/obligar Phaser Editor para el primer resultado;
- si Phaser gana pero authoring es el cuello de botella, ejecutar `BIT-TOOL-B1` aislado.

## 9. PixiJS official Agent Skills

**Estado: ADOPT en `BIT-R-A` / vistas Arithmos que lo usen.**

Repo oficial MIT con skills v8 y documentación AI-readable. Reduce riesgo de alucinaciones de API v7.

Cargar context-on-demand, especialmente application/events/math/graphics/custom-rendering/performance/accessibility.

## 10. Babylon Inspector CLI + MCP servers

**Estado: SPIKE/ADOPT dev-only para Physica.**

Inspector CLI está diseñado para agentes y permite consultar escena/runtime. Los MCP oficiales permiten autoría de node material/geometry/render graph/particles/GUI/flow/smart filters.

Usar selectivamente; nunca mover física pedagógica al Flow Graph por comodidad del tool.

## 11. Spector.js MCP

**Estado: ADOPT como diagnóstico bajo demanda.**

Engine-agnostic para WebGL. Útil cuando una falla está en draw calls/shader/texture/GL state y no basta con el state semántico del juego.

No ejecutar en cada milestone: es microscopio, no checklist ceremonial.
