# AI tooling — harness canónico

**Estado:** operativo · **actualizado:** 2026-08-26

## Principio nuevo: Sol decide, workers ejecutan

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
| MiniMax M3 / GMI | technical-art/VFX/procedural specialist experimental |
| Blender | DCC master Ohmdal |
| Meshy/Tripo | generación 3D opcional detrás de HUMAN_GATE |

Ningún worker se auto-aprueba. Un builder puede editar, testear, commitear y ejecutar una integración mecánica explicitada; la aceptación material vuelve a ChatGPT/Sol y Manuel cuando corresponde.

## Gemini builder vs reviewer

Antigravity puede cumplir dos roles, pero nunca en la misma sesión de autoridad:

### Builder

- abrir `agy` desde un worktree/branch aislado;
- usar **Gemini 3.7 Flash High + effort high** o el equivalente Flash High disponible;
- usar modo de implementación/agent con workspace write habilitado, no plan/read-only;
- leer task/AGENTS/contratos mínimos;
- editar, correr terminal, Playwright, build/tests y commit/push;
- producir un report de evidencia;
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

## MiniMax M3 — trial GMI hasta 2026-09-06

Key sólo en `.env.local`:

```dotenv
GMI_API_KEY=...
GMI_BASE_URL=https://api.gmi-serving.com/v1
GMI_MINIMAX_MODEL=MiniMaxAI/MiniMax-M3
```

Runner actual:

```bash
npm run agent:minimax:gmi:check
npm run agent:minimax:gmi -- --task <task> --context <file> --out <report>
```

El sidecar actual sigue **proposal-only**. La evidencia hasta A4 indica que M3 aporta inventario/ideas/timing pero sus propuestas PlayCanvas han requerido varias reparaciones load-bearing; `WOULD_PAY` sigue provisionalmente `no`.

Para medirlo de forma justa:

- tareas pequeñas;
- interfaces exactas;
- uno o pocos archivos de contexto;
- no auditorías globales;
- no paquetes enormes de shaders;
- registrar first-pass, repairs, accepted/rejected y `WOULD_PAY`.

Un futuro experimento de M3 con filesystem/tools debe vivir en worktree/branch aislado; no autoriza merge ni canon.

## Worktrees / ownership

El repo y Git son el protocolo multi-modelo. Para trabajos largos:

```text
Roxana/                         branch canónica
Roxana-gemini/                  worker Gemini
Roxana-minimax/                 worker M3 tool-enabled experimental
```

Un solo owner por archivos load-bearing en cada batch. Workers devuelven:

- commit(s);
- tests ejecutados;
- captures/manifests;
- report;
- dudas/HUMAN_GATE si existen.

No crear buses, daemons, routers ni colas de agentes.

## Ohmdal authored pass

Loop: `agent-work/loops/ohmdal-arco1-authored-pass/`.

A0–A3 están accepted. A4 Castillo tiene trabajo parcial pusheado. Antes de A5 se agrega **A4B Navigation + Scenic Shell Hardening** para corregir evidencia humana reciente:

- paredes/arquitectura visibles atravesables por colliders manuales incompletos;
- spawns/teleports con yaw hardcodeado que pueden mirar hacia la puerta;
- interiores/scenic shells que dejan grandes huecos de sky dome;
- necesidad de una estrategia consistente de fondo FPS.

Contratos nuevos:

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
4. M3 recibe contexto acotado.
5. Luna hace trabajo mecánico.
6. Escalar a Codex Sol sólo por necesidad demostrada.
7. ChatGPT/Sol revisa evidence packs y emite el siguiente batch.
