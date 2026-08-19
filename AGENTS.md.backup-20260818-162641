# AGENTS.md — Proyecto Roxana

**Manual operativo del estudio.** Todo agente que trabaja en el repo lo lee. Lore/diseño viven en `docs/`; producción agentic en [`docs/80-production/agentic/`](docs/80-production/agentic/).

> `ROADMAP.md` decide el orden de producto. Los GDD y governance deciden qué es Roxana. La capa `80-production/agentic` decide **cómo convertir esas decisiones en juego verificable** y nunca asciende implementación a canon por accidente.

## 1. Identidad y dirección técnica

Proyecto Roxana es una experiencia educativa basada en mundos donde el conocimiento constituye reglas manipulables del gameplay.

| Scope | Verbo / función | Dirección actual |
|---|---|---|
| Instituto | unir / recordar / transformar | Three.js axonométrico + DOM — hipótesis fuerte |
| Ohmdal | **CONECTAR** | Three.js HD-2D — north de producción actual |
| Physica | **EXPERIMENTAR** | Babylon + analítica TS; 2.5D default, 3D selectivo |
| Bitland | **PROGRAMAR** | simulation core TS + DOM; **Pixi vs Phaser por spikes separados** |
| Arithmos | **TRANSFORMAR** | transformation core TS; **Three vs Pixi/SVG por representación** |

P12 manda: los mundos comparten producto, no engine/cámara/género obligatorios.

Ver:
- [`ENGINE_MATRIX.md`](docs/80-production/agentic/ENGINE_MATRIX.md)
- [`SPIKE_POLICY.md`](docs/80-production/agentic/SPIKE_POLICY.md)
- [`GAME_DEV_AI_TOOLING.md`](docs/80-production/agentic/GAME_DEV_AI_TOOLING.md)

## 2. Autoridad

Estados: `CANON`, `PROPOSED`, `LEGACY`, `EXPERIMENTAL`, `REJECTED`.

Precedencia:

`governance → global → world → content → production → task contract → implementation evidence`.

Si hay contradicción, aplicar `docs/00-governance/ROXANA_CANON_POLICY_v1.md`. Código/runtime nunca convierte una idea en canon.

## 3. Reglas duras

1. No inventar texto narrativo. Si falta: `TODO(guion)` + placeholder neutro + reportar.
2. Formalización técnica sólo después de evidencia suficiente del jugador.
3. Validación por condiciones; varias soluciones cuando la disciplina lo permita.
4. Core pedagógico puro/testeable cuando corresponda; el renderer no es la verdad del concepto.
5. Español neutro/tuteo en texto visible.
6. Sin dependencia/engine upgrade incidental.
7. No romper baselines jugables.
8. No elegir engine por preferencia del agente. Si hay incertidumbre material, ejecutar los spikes definidos.
9. No declarar DONE porque compila o porque hay un screenshot lindo.
10. Normal: 1–3 repair loops. Hard cap: 5. Luego `ESCALATE`.
11. Si el mismo defecto sobrevive a 2 fixes informados, cuestionar spec/representación antes de seguir parcheando.
12. Nunca debilitar tests/acceptance/learning criteria para obtener PASS.
13. Desktop + mobile/touch son targets de primera clase cuando el scope toca interacción/render.
14. Licencia/provenance de assets, skills y código externo se verifica antes de copiarlo al producto.
15. Integración de decisiones materiales requiere a Manuel.

## 4. Context-on-Demand

No leas todo el repo.

```text
objetivo humano
  ↓
AGENTS.md raíz
  ↓
AGENTS.md del scope
  ↓
authority docs estrictamente relevantes
  ↓
Task + Learning Contract
  ↓
ENGINE_MATRIX / SPIKE_POLICY / tooling si la tarea los toca
  ↓
código + assets necesarios
```

No cargar 20 skills “por si acaso”. Cargar skills/MCPs según la fase y engine real.

## 5. Cadena de modelos por defecto

Ver [`MODEL_ROUTING.md`](docs/80-production/agentic/MODEL_ROUTING.md).

```text
Manuel
  ↓ objetivo
GPT-5.6 Sol — Director / Loop Owner
  ↓ contract
MiniMax M3 / MiniMax Code — Builder
  ↓
BUILD + TEST + VERIFY
  ↓
GPT-5.6 Luna — Player Agent blind-first
  ├─ FAIL → DeepSeek V4 Flash — bounded repair → replay
  └─ PASS
      ↓
GLM — adversarial read-only review
      ↓
GPT-5.6 Sol — DONE / REPAIR / ESCALATE
      ↓
Manuel — integración material
```

Kimi/Grok/otros son challengers de benchmark hasta ganar un rol repetible. No hay model roulette.

Los harnesses pueden ser distintos. Lo común es el repo contract, no la aplicación desktop.

## 6. Bounded Play-Code Loop

```text
CONTRACT
  ↓
BUILD
  ↓
MECHANICAL GATE
  ↓
PLAYER AGENT
  ├─ FAIL → REPAIR ─────────┐
  └─ PASS                   │
      ↓                     │
ADVERSARIAL REVIEW          │
  ├─ FAIL → REPAIR/ESCALATE ┘
  └─ PASS
      ↓
DIRECTOR + HUMAN GATE
```

Comandos base:

```bash
npm run build
npm test
npm run verify
```

Después se **juega** el runtime. Mechanical PASS ≠ Play PASS.

## 7. Player Agent

El playtester primero juega blind-first: objetivo, controles y estado inicial. **No lee diff/tests antes de intentar el camino como usuario.**

Después puede usar Playwright/debug hooks/source para reproducir lo que sintió/vio.

No arregla. Reporta `BLOCKER | MAJOR | MINOR | PASS` con pasos exactos.

## 8. Spikes

Cuando hay dos candidatos plausibles, no hacer un prototipo mezclado.

- mismo commit baseline;
- mismo core neutral;
- mismo Builder/model/harness;
- mismo Learning Contract;
- mismo budget de loops;
- dos implementaciones aisladas;
- mismo Player Agent protocol;
- comparación posterior.

Hoy:

- `BIT-R-A`: PixiJS machine-city;
- `BIT-R-B`: Phaser 4 machine-city;
- `ARI-R-A`: Three.js spatial equivalence;
- `ARI-R-B`: Pixi/SVG diagrammatic equivalence;
- `PHY-D-A/B`: sólo cuando un concepto concreto dispare duda 2.5D vs 3D;
- `OHM-ASSET-A/B`: pipeline actual vs Vibe3D para el mismo asset hard-surface no-hero.

## 9. Tooling por engine

No improvisar stack desde memoria. Leer [`GAME_DEV_AI_TOOLING.md`](docs/80-production/agentic/GAME_DEV_AI_TOOLING.md).

Highlights:

- Three.js: WebGL baseline, glTF/GLB, Playwright, Spector MCP, skills Three game-specific seleccionadas; Vibe3D experimental para asset pipeline.
- Babylon: Inspector CLI + MCPs oficiales selectivos + Spector; analítica TS manda.
- PixiJS: skills oficiales v8 + AI-readable docs; simulation clock separado del ticker visual.
- Phaser 4: skills oficiales; Phaser Editor v5/MCP sólo si el spike prueba valor de authoring.

No copiar bundles externos con provenance dudosa.

## 10. Fuentes rápidas

- `docs/START_HERE.md`
- `ROADMAP.md`
- `docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md`
- `docs/00-governance/ROXANA_CANON_POLICY_v1.md`
- `docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md`
- `docs/guia-puzzles.md`
- `docs/20-worlds/<mundo>/AGENTS.md`
- `docs/80-production/agentic/README.md`

## 11. Escalar a Manuel

- diseño/experiencia;
- guion faltante;
- dependencia/engine/runtime;
- canon nivel alto;
- ganador de spike;
- hard cap sin PASS;
- decisión visual/material de producto;
- integración de milestone material.

Un fix técnico local dentro de contrato claro se resuelve y se vuelve a jugar.
