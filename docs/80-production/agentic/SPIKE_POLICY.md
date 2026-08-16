---
status: PROPOSED
authority_level: 5
version: v1
last_ratified: 2026-08-16
supersedes: []
depends_on:
  - README.md
  - ENGINE_MATRIX.md
  - WORKFLOW.md
  - TASK_CONTRACT_TEMPLATE.md
---

# Spike Policy — comparar sin contaminar la respuesta

Un spike existe para **resolver una incertidumbre concreta**, no para construir el juego dos veces.

Cuando hay dos soluciones plausibles materiales de engine, renderer, dimensionalidad, representación o pipeline se crean **dos spikes independientes**.

> **A y B reciben el mismo problema. A no conoce la implementación de B y B no conoce la implementación de A.**

Sólo comparten aquello que sea explícitamente engine-neutral: por ejemplo `simulation-core` o `transformation-core` TypeScript.

## Contrato común

Antes de A/B, el Director congela una Spike Card:

```yaml
question: incertidumbre exacta
shared_commit: mismo commit inicial
shared_core: módulos engine-neutral permitidos
builder_model: mismo modelo
builder_harness: mismo harness
player_agent: mismo modelo + mismo protocolo
adversarial_reviewer: mismo modelo + mismo protocolo
learning_contract: idéntico
player_path: idéntico en intención
max_repair_loops: 3
hard_cap: 5
targets:
  - desktop
  - mobile-touch
```

Esto evita confundir “Pixi vs Phaser” con “MiniMax vs Grok” o “primer intento vs segundo intento”.

Los acceptance criteria miden resultado, no APIs del candidato.

Correcto: “el jugador predice qué agente se moverá en el próximo tick”.

Incorrecto: “la escena usa `Phaser.Tilemaps`”.

## Aislamiento

Cada alternativa tiene:

- task contract propio;
- carpeta/branch propio;
- adapter/renderer propio;
- evidencia propia;
- Player Agent run propio;
- registro de loops/intervención humana;
- cero copia de código específico del candidato rival.

Si aparece una mejora legítima del core compartido que cambia materialmente la comparación, se integra primero al baseline y ambos candidatos vuelven a partir del mismo estado.

## Métricas

### Aprendizaje

- percibe estado relevante sin teoría;
- puede predecir consecuencia;
- fallo produce información;
- resuelve variante/transferencia razonable.

### Juego

- claridad de objetivo;
- input/cámara/feedback;
- fricción detectada por Player Agent;
- desktop + touch;
- estabilidad del camino crítico.

### Producción agentic

- repair loops hasta PASS;
- intervención humana;
- regresiones introducidas;
- código/tooling incidental;
- facilidad de inspección del runtime;
- disponibilidad/calidad de skills, MCP/inspector y docs AI-readable.

### Técnica

- FPS/frame time bajo carga equivalente;
- peso/carga cuando sea material;
- memoria cuando aplique;
- complejidad build/deploy;
- mantenibilidad del adapter.

## Secuencia

1. Director congela Spike Card.
2. Se crea baseline común.
3. A se ejecuta hasta PASS/ESCALATE.
4. B **vuelve al baseline**, no parte de A.
5. Mismo Player Agent protocol juega ambos.
6. Mismo adversarial protocol revisa ambos.
7. Comparación puede anonimizar A/B si es práctico.
8. GPT-5.6 Sol sintetiza evidencia.
9. Manuel decide ganador, frontera híbrida o evidencia insuficiente.

No premiar al candidato con más iteraciones/assets.

## Spikes planificados

### BIT-R-A — PixiJS Machine-City

Hipótesis: primitives/lines/layers/custom rendering hacen más legibles buses, pulsos, trazas y gran actividad 2D sin acoplar simulation core.

### BIT-R-B — Phaser 4 Machine-City

Hipótesis: alcanza la misma claridad con menor infraestructura gracias a escenas/cámara/input/entidades/audio/GPU layers, skills oficiales y tooling de authoring.

**Core compartido:** simulation core determinista + inspector DOM + fixture de programa idéntico.

### ARI-R-A — Three.js Spatial Equivalence

Hipótesis: cantidad/agrupación/área/recomposición se comprenden mejor como objetos materiales 2.5D.

### ARI-R-B — PixiJS/SVG Diagrammatic Equivalence

Hipótesis: la misma estructura se comprende mejor con manipulación 2D precisa y menor carga de perspectiva/oclusión.

Arithmos puede terminar con **frontera de uso** en vez de ganador único porque cambiar representación es parte del juego.

### PHY-D-A / PHY-D-B — sólo con trigger real

- A: versión 2.5D científicamente correcta más simple.
- B: 3D completo del mismo fenómeno.

3D sólo gana si la mejora de comprensión compensa cámara/input/orientación/mobile.

### OHM-ASSET-A / OHM-ASSET-B — pipeline de assets

No reabre el engine de Ohmdal.

- A: Blender/GLB o pipeline modular vigente.
- B: Vibe3D/vibe-model source-first.

Mismo prop hard-surface o módulo arquitectónico **no-hero**. Comparar fidelidad, editabilidad, integración, materials/draw discipline, peso, mobile y coste humano.

## Stop rule

Un spike termina cuando:

- hay evidencia suficiente para responder la pregunta; o
- alcanza hard cap 5; o
- descubre un bloqueo que invalida la comparación.

No se perfecciona hasta “AAA”. El candidato perdedor se archiva como evidencia y no queda como segundo runtime salvo función productiva explícita.
