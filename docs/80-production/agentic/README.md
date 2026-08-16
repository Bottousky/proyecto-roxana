---
status: PROPOSED
authority_level: 5
version: v1
last_ratified: 2026-08-16
supersedes: []
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - ../../00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
open_questions:
  - AP-Q1 — ¿MiniMax Code mantiene su ventaja como Builder bajo contratos y Player Agent iguales?
  - AP-Q3 — ¿MiniMax media se integra por API o sigue como pipeline humano de assets?
---

# Roxana Agentic Production Harness · v1

Esta carpeta define **cómo producir juegos web de Proyecto Roxana con agentes**. No redefine lore/GDD y no incorpora patrones de agentes que no compren valor de game development.

Toma de OpenGame dos ideas útiles para un repo vivo:

1. **Template/architecture skill:** no empezar cada milestone reinventando el juego.
2. **Debug/playability loop:** compilar no es terminar; ejecutar, jugar, observar y reparar es parte del desarrollo.

Roxana agrega una tercera regla:

3. **Player Agent independiente:** el agente que evalúa la experiencia primero usa el producto como jugador, sin leer la solución interna.

Este documento tiene autoridad de **producción**, no de producto. Si una decisión de este harness contradice governance/GDD, se corrige el harness.

## Loop propuesto

```text
Manuel
  ↓
GPT-5.6 Sol — Director / Loop Owner
  ↓ Task + Learning Contract
MiniMax M3 — Builder
  ↓
Mechanical gates
  ↓
GPT-5.6 Luna — Player Agent blind-first
  ├─ FAIL → DeepSeek V4 Flash — repair → replay
  └─ PASS
      ↓
GLM — adversarial read-only PR review
      ↓
GPT-5.6 Sol — DONE / REPAIR / ESCALATE
      ↓
Manuel — integración material
```

Normal: **1–3 repair loops**. Hard cap: **5**. El mismo defecto sobreviviendo a dos fixes informados obliga a considerar spec/representación/arquitectura antes de seguir parchando.

## Política de Git

Los agentes **pueden crear commits en una rama de tarea/spike** cuando el cambio está dentro de un Task Contract claro. No hace falta pedir aprobación humana por cada commit local de trabajo.

El gate humano se mantiene para:

- merge a `main` de una milestone material;
- engine/runtime/dependency;
- canon/autoridad documental;
- ganador de spike;
- dirección visual o experiencia de producto material.

Nunca auto-mergear `main` sólo porque mechanical/Player/reviewer hayan dado PASS: esos gates producen evidencia para la decisión humana de integración.

## Índice

- [`WORKFLOW.md`](WORKFLOW.md) — Builder → mechanical → Player Agent → repair → adversarial review.
- [`MODEL_ROUTING.md`](MODEL_ROUTING.md) — modelos/harnesses por responsabilidad de juego.
- [`TASK_CONTRACT_TEMPLATE.md`](TASK_CONTRACT_TEMPLATE.md) — Goal + acceptance + Learning Contract.
- [`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md) — DONE mecánico, jugable, pedagógico, visual y web/mobile.
- [`SPIKE_POLICY.md`](SPIKE_POLICY.md) — dos spikes independientes cuando existe incertidumbre A/B.
- [`ENGINE_MATRIX.md`](ENGINE_MATRIX.md) — hipótesis pedagógicas por mundo y paired spikes concretos.
- [`GAME_DEV_AI_TOOLING.md`](GAME_DEV_AI_TOOLING.md) — skills, MCPs, inspectors y prácticas AI por Three/Babylon/Pixi/Phaser.
- [`GAME_DEV_REFERENCES.md`](GAME_DEV_REFERENCES.md) — evidencia externa clasificada como ADOPT / SPIKE / MINE / WATCH / VISUAL REF.

Skill portable de entrada:

- `/.agents/skills/roxana-game-production/SKILL.md`

OpenCode tiene únicamente tres roles del workflow bajo `/.opencode/agents/`: Player Agent, Repair y Adversarial Review. Los perfiles `worker-*` / `m3-*` anteriores fueron retirados para evitar rutas operativas contradictorias.

## Spikes ya planificados

Specs ejecutables en `docs/80-production/spikes/`:

- `BIT-R-A-pixijs-machine-city.md`;
- `BIT-R-B-phaser-machine-city.md`;
- `ARI-R-A-three-spatial-equivalence.md`;
- `ARI-R-B-pixisvg-diagrammatic-equivalence.md`.

Planificados condicionalmente:

- `PHY-D-A/B` — sólo ante un concepto que realmente genere duda 2.5D vs 3D;
- `OHM-ASSET-A/B` — pipeline actual vs Vibe3D para el mismo asset hard-surface no-hero.

Los candidatos usan mismo baseline, core neutral, Builder/model/harness, Learning Contract y budget. No se compara un engine con más trabajo que el otro.

## Qué entra / qué no

Entra si mejora concretamente:

- gameplay;
- authoring de niveles/escenas/assets;
- playtesting;
- debugging de runtime/render;
- performance web/mobile;
- calidad/reproducibilidad del juego.

No entra porque sea un patrón agentic popular para software genérico.

Ejemplos/demos sin source reproducible son referencias visuales, no decisiones de arquitectura.

## Artefactos mínimos

1. Task + Learning Contract;
2. cambio ejecutable;
3. evidencia mecánica;
4. Player Agent report;
5. adversarial review cuando la milestone es material;
6. gate humano cuando cambia producto/canon/engine/visual direction.

No Jira ni paquetes ceremoniales obligatorios.

## Fuentes de verdad

`governance → global → world → content → production → task contract → implementation evidence`.

La implementación jamás asciende una decisión a canon por accidente.
