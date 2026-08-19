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

## 12. Multi-model setup (Codex CLI + MiniMax)

> **Adenda 2026-08-18.** Esta sección es **aditiva**. No reemplaza la cadena de modelos (§5) ni el workflow (§6). Documenta el harness operativo actual en Windows para que cualquier agente Codex o cualquier modelo bajo Codex trabaje sobre este repo sin reconfigurar nada.

### 12.1 Harness y providers

- **Harness principal:** Codex CLI 0.147+ (`codex` en PATH, `~/.codex/config.toml`).
- **Provider disponible ahora:** MiniMax Direct (modelo `MiniMax-M3`, base `https://api.minimax.io/v1`, wire API `responses`, env `MINIMAX_API_KEY`).
- **Provider dormido (cuota agotada):** OpenCode Go vía LiteLLM (port 4000) — DeepSeek V4 Pro/Flash, Kimi K3, Kimi K2.7 Code, GLM, MiMo, Hy3, Qwen. Se reactivan cuando vuelva la cuota, sin reconfigurar.
- **Provider reservado (cuota declarada como agotada):** OpenAI nativo. Codex Desktop sigue apuntando a OpenAI; eso no cambia.
- **Multimedia:** `mmx` (mmx-cli 1.0.19). Imagen, visión, voz, música, búsqueda, y video (con confirmación humana explícita por uso).

### 12.2 Perfiles y comandos diarios

| Alias | Comando | Modelo / provider |
|---|---|---|
| `codex` | `codex` | OpenAI / Codex (default) |
| `cx-minimax` | `codex --profile minimax-direct` | MiniMax-M3 directo |
| `cx-minimax-go` | `codex --profile minimax-go` | MiniMax-M3 vía OpenCode Go (dormido por cuota) |
| `cx-deepseek` | `codex --profile deepseek` | DeepSeek V4 Pro (dormido por cuota) |
| `cx-flash` | `codex --profile deepseek-fast` | DeepSeek V4 Flash (dormido por cuota) |
| `cx-kimi` | `codex --profile kimi` | Kimi K3 (dormido por cuota) |
| `cx-kimi-code` | `codex --profile kimi-code` | Kimi K2.7 Code (dormido por cuota) |
| `cx-glm` | `codex --profile glm` | GLM-5.3 (dormido por cuota) |
| `cx-mimo` | `codex --profile mimo` | MiMo v2.5 Pro (dormido por cuota) |
| `cx-doctor` | `cx-doctor` | Diagnóstico no destructivo |

Los aliases viven en `C:\Users\manue\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1` dentro de un bloque idempotente `# >>> Codex multi-model aliases >>>`. Son portables; viven en `~` y funcionan en cualquier cwd.

### 12.3 Custom agents de Roxana (Codex subagents)

En `C:\YO\Proyectos\Roxana\.codex\agents\` en formato **TOML** (Codex 0.125+; no Markdown). Heredan modelo del padre salvo que el task lo pida explícitamente:

- `game-explorer.toml` — `sandbox_mode = "read-only"`. Mapea el repo y devuelve un handoff compacto. No edita.
- `game-worker.toml` — `sandbox_mode = "workspace-write"`. Implementación acotada. Acepta un Task Contract y un handoff; no crece el scope.
- `browser-playtester.toml` — `sandbox_mode = "workspace-write"` (limita escritura a `.playtest/`). Juega el build con Playwright, devuelve evidencia estructurada. No arregla código de aplicación.
- `game-reviewer.toml` — `sandbox_mode = "read-only"`. Adversarial read-only. Intenta probar que la milestone no debería entrar.

Los agents pre-existentes en `.opencode/agents/` (`reviewer.md`, `playtester.md`, `implementer.md` en formato OpenCode) se conservan y siguen siendo válidos para OpenCode Go. No se borran. Conviven con los nuevos `.toml` de Codex.

Schema minimo de cada agent TOML: `name`, `description`, `developer_instructions` (requeridos) + `model`/`model_reasoning_effort`/`sandbox_mode` (opcionales). Ninguno declara `model` para heredar del padre.

### 12.4 Skills de Roxana (Codex skills)

En `C:\YO\Proyectos\Roxana\.agents\skills\`. Cada uno tiene `SKILL.md` y referencia la autoridad real del repo:

- `roxana-canon` — cómo localizar docs canónicas, jerarquía de autoridad, no inventar.
- `game-director` — intención → experiencia → requisito → criterios de aceptación binarios.
- `ohmdal-room-engine` — derivado de `src/jugar/rooms.ts`, `roomGraph.ts`, `roomScenesData.ts` y `SPATIAL_CONTRACT.md`. Previene reintroducir autoridades paralelas para rooms/área/cámara/navegación.
- `educational-puzzle-design` — pedagogía por interacción, no por quiz. Respeta lore.
- `browser-game-playtest` — cuándo aplica y qué evidencia producir.
- `minimax-media-production` — `mmx` como herramienta; greybox antes que arte.

### 12.5 Lo que NO cambia

- `docs/`, los `AGENTS.md` por scope, los ADRs y `MODEL_ROUTING.md` siguen siendo autoridad. Esta adenda no los modifica.
- La cadena de modelos por defecto de §5 sigue vigente: el director mantiene la responsabilidad de contrato, el builder escribe, el player agent juega, el reviewer intenta romper. El cambio es de harness, no de roles.
- `npm run build`, `npm test`, `npm run verify` siguen siendo el mechanical gate. Ningún provider, perfil, o alias los reemplaza.
- La arquitectura room-based de Ohmdal (ADR-002, `SPATIAL_CONTRACT.md`) sigue siendo no negociable. Ningún modelo bajo Codex puede reescribirla sin ADR.

### 12.6 Procedimiento ante cambio de cuota

- Si vuelve la cuota de OpenCode Go, los profiles `cx-deepseek`, `cx-flash`, `cx-kimi`, `cx-kimi-code`, `cx-glm`, `cx-mimo` quedan utilizables sin reconfigurar.
- Si vuelve la cuota de OpenAI, `codex` (sin profile) vuelve a ser el harness por defecto para OpenAI nativo.
- Si vuelve a agotarse una cuota, se documenta en `cx-doctor` y se sigue usando el provider disponible.

### 12.7 Referencias operativas

- `~/.codex/MULTI_MODEL_SETUP.md` — setup global, troubleshooting.
- `C:\Users\manue\.codex\scripts\cx-doctor.ps1` — diagnóstico no destructivo.
- `docs/80-production/agentic/WORKFLOW.md` y `MODEL_ROUTING.md` — workflow y routing.
- `docs/20-worlds/ohmdal/AGENTS.md` — reglas locales de Ohmdal.
