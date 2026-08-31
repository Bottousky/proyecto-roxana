# AI tooling — harness canónico

**Estado:** operativo · **actualizado:** 2026-08-28

## Principio: Sol decide, workers ejecutan

La cuota de GPT Plus no debe gastarse duplicando en Codex el análisis que ya hizo GPT-5.6 Sol en ChatGPT web.

```text
ChatGPT web / GPT-5.6 Sol
  arquitectura · diseño · specs · review · acceptance
            ↓
          repo
            ↓
Gemini builder / MiniMax M3 / Codex Luna-Terra
  implementación · tests · captures · commits
            ↓
      evidence pack
            ↓
ChatGPT web / Sol
  accept / reject / exact fixes
```

**Codex Sol queda como break-glass** para problemas que realmente exigen razonamiento fuerte con shell/local state. No es el executor por defecto.

## Roles

| Actor | Rol |
|---|---|
| Manuel | objetivo, canon, gasto, decisiones materiales |
| ChatGPT web / GPT-5.6 Sol | autoridad técnica/de diseño, task contracts, revisión, acceptance |
| Gemini / Antigravity builder | builder general repo-heavy y authored scene work |
| Gemini / Antigravity reviewer | sesión separada read-only, fresh-eyes multimodal |
| Codex Luna Max | mechanical worker barato |
| Codex Terra | middle worker/fallback |
| Codex Sol | break-glass local reasoning |
| MiniMax M3 / GMI Cloud / OpenCode | technical-art/VFX/procedural specialist experimental tool-enabled |
| Blender | DCC master Ohmdal |
| Meshy/Tripo | generación 3D opcional detrás de HUMAN_GATE |

Ningún worker se auto-aprueba. Un builder puede editar, testear, commitear y ejecutar una integración mecánica explicitada; la aceptación material vuelve a ChatGPT/Sol y Manuel cuando corresponde.

## Estrategia quota-aware

No ejecutar un Sol High durante horas “hasta complete”. Trabajar por ráfagas:

1. ChatGPT/Sol define o ajusta el task packet.
2. Un worker barato/externo lo ejecuta en branch/worktree aislado.
3. El worker deja commit + tests + captures + report.
4. ChatGPT/Sol revisa el evidence pack y acepta/rechaza o emite fixes exactos.
5. Sólo usar Codex Sol si el problema sobrevivió a esta división y requiere reasoning fuerte con herramientas locales.

Runbook operativo: `docs/80-production/QUOTA_AWARE_EXECUTION.md`.

## Gemini builder vs reviewer

Antigravity puede cumplir dos roles, pero nunca en la misma sesión de autoridad.

### Builder

- abrir `agy` desde un worktree/branch aislado;
- usar **Gemini 3.7 Flash High + effort high** o el equivalente Flash High disponible;
- usar modo implementation/agent con workspace write;
- leer task/AGENTS/contratos mínimos;
- editar, correr terminal, Playwright, build/tests y commit/push;
- producir report de evidencia;
- **no marcar su propio stage como accepted/passed**.

### Reviewer

- proceso/sesión distinta;
- read-only/plan/sandbox;
- recibe capturas, manifests, task y contracts mínimos;
- emite findings; no implementa.

Runner reviewer existente: `scripts/agents/run-antigravity.mjs`.

## Codex

### Luna Max

Default para:

- colliders y spawn anchors ya especificados;
- manifests/provenance;
- layouts repetitivos;
- fixtures/tests;
- capture plumbing;
- imports/wiring/cleanup;
- cherry-picks/integración mecánica con instrucciones exactas.

### Terra

Usar si el scope supera a Luna pero no justifica Sol.

### Sol

Sólo cuando se demuestra necesidad de reasoning fuerte pegado a herramientas locales. No abrir Sol simplemente para “continuar el loop” si el repo ya contiene un task ejecutable.

## MiniMax M3 — GMI Cloud + OpenCode durante trial

### Ruta primaria tool-enabled

OpenCode tiene integración nativa con **GMI Cloud**. No hace falta un provider wrapper propio.

En el worktree de MiniMax:

```text
opencode
/connect  → GMI Cloud → pegar API key local
/models   → seleccionar MiniMax M3 / MiniMaxAI/MiniMax-M3
```

La credencial queda en el credential store local de OpenCode. Nunca se commitea ni se pega en tasks/prompts.

Reglas:

- sólo branch/worktree aislado;
- un task cerrado por sesión;
- ownership de archivos disjunto del builder principal;
- puede leer/escribir/usar terminal dentro de su worktree;
- no puede auto-mergear ni marcar stage `passed`;
- devolver commit(s), tests y report;
- registrar first-pass, repairs, accepted/rejected y `WOULD_PAY`.

Task de prueba tool-enabled: `agent-work/tasks/minimax/opencode-vfx-tool-trial.md`.

### Fallback proposal-only

Si OpenCode/GMI falla, mantener el sidecar existente:

```bash
npm run agent:minimax:gmi:check
npm run agent:minimax:gmi -- --task <task> --context <file> --out <report>
```

Runner: `scripts/agents/run-gmi-minimax.mjs`.

No volver a auditorías globales ni grandes paquetes multiarchivo: la evidencia previa de M3 fue peor en esos modos.

## Worktrees / ownership

Git es el protocolo multi-modelo:

```text
Roxana/             rama canónica
Roxana-gemini/      builder general
Roxana-minimax/     M3 tool-enabled experimental
Roxana-luna/        worker mecánico cuando corresponda
```

No ejecutar dos builders simultáneamente sobre los mismos archivos load-bearing.

Orden actual Ohmdal:

1. Gemini termina A4 Castillo candidate.
2. ChatGPT/Sol revisa/acepta A4.
3. Luna ejecuta A4B Navigation + Scenic Shell sobre el commit A4 congelado.
4. ChatGPT/Sol acepta A4B.
5. Gemini retoma A5/A6.
6. MiniMax/OpenCode puede correr en paralelo sólo en su lab/VFX disjunto.

## Ohmdal authored pass

Loop: `agent-work/loops/ohmdal-arco1-authored-pass/`.

A0–A3 están accepted. A4 Castillo está activo. Antes de A5 existe **A4B Navigation + Scenic Shell Hardening** para corregir:

- paredes/arquitectura visibles atravesables;
- spawns/teleports mirando hacia la puerta;
- interiores/scenic shells con huecos de sky dome;
- fondos FPS sin estrategia consistente.

Contratos:

- `docs/20-worlds/ohmdal/production/OHMDAL_NAVIGATION_COLLISION_CONTRACT.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_SCENIC_RENDERING_POLICY.md`

## Captura/performance

FAST local ya consiguió NVIDIA GTX 1660 Ti / D3D11 / `softwareRendered=false` en A3. Mantener:

1. FAST hardware GPU para iteración actual;
2. FULL acceptance con canonical shots + mobile/no-post/errors/perf;
3. SwiftShader sólo como evidencia funcional reproducible; nunca como benchmark físico.

## Contexto barato

1. Leer AGENTS + loop/state + task directa.
2. No repetir planeamiento ya ratificado.
3. Gemini builder implementa; Gemini reviewer separado critica.
4. M3/OpenCode recibe task acotado y scope disjunto.
5. Luna hace trabajo mecánico.
6. Escalar a Codex Sol sólo por necesidad demostrada.
7. ChatGPT/Sol revisa evidence packs y emite el siguiente batch.
