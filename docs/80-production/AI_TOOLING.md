# AI tooling — harness canónico

**Estado:** operativo · **actualizado:** 2026-08-25

## Responsabilidades

| Actor | Responsabilidad |
|---|---|
| Humano / Manuel | objetivos, canon, gasto pago y decisiones materiales |
| ChatGPT web | investigación, diseño, planificación y specs |
| Codex / Sol High | única autoridad técnica; decide, integra, prueba y valida |
| Codex / Luna Max | worker mecánico sólo con brief cerrado |
| MiniMax M3 | worker experimental de código/technical-art por GMI durante el trial; propone, no integra |
| Gemini / Antigravity | contexto amplio, multimodal y fresh-eyes read-only |
| Meshy / Tripo | generación 3D opcional detrás de HUMAN_GATE económico |

No existe router automático ni meta-framework. El mecanismo normal es `archivo + terminal + git`. Codex/Sol sigue siendo **single integrator**: Luna y MiniMax no compiten editando el mismo scope y ningún worker aprueba su propio resultado.

## Bounded loops

Contrato cross-Roxana: `docs/80-production/BOUNDED_AGENT_LOOP.md`.

Instancias relevantes:

- Plaza: `agent-work/loops/ohmdal-plaza/LOOP.md` — `complete`.
- Arco I greybox: `agent-work/loops/ohmdal-arco1-greybox/LOOP.md` — `complete`.
- **Arco I authored pass:** `agent-work/loops/ohmdal-arco1-authored-pass/LOOP.md` — producción actual.

Reglas:

- máximo 3 iteraciones por stage;
- máximo 5 fixes por iteración;
- máximo 1 fix estructural importante por iteración;
- Sol High decide y acepta;
- Luna Max ejecuta trabajo mecánico bien especificado;
- MiniMax M3 puede producir propuestas/patches para scopes aislados durante la evaluación GMI;
- Gemini Flash revisa evidencia, no implementación;
- sólo un `HUMAN_GATE` real detiene el avance;
- no agregar directors, routers, daemons, colas ni agent frameworks nuevos.

## Gemini por Antigravity CLI — sin API

Ruta canónica: `agy` con login local de Google. No `GEMINI_API_KEY`, Vertex ni AI Studio API.

```powershell
irm https://antigravity.google/cli/install.ps1 | iex
agy
```

Checks:

```bash
agy models
npm run agent:gemini:check
```

Wrapper: `scripts/agents/run-antigravity.mjs`.

Routing visual/contextual default: **`gemini-3.7-flash-high` + effort high**. Si el slug desaparece, usar el equivalente Gemini Flash High disponible. No escalar automáticamente a Pro.

Usos: context distillation, reconciliación de fuentes, review multimodal, fresh-eyes y selección de reading set mínimo. No usar Gemini para implementar, modificar el repo o aprobar su propio trabajo.

Para authored pass existe la tarea reusable `agent-work/tasks/gemini/ohmdal-arco1-authored-stage-review.md`.

## Codex routing

### Sol High

Reservar para arquitectura, gameplay sistémico, composición/dirección visual, trade-offs, integración compleja, partición de tareas y aceptación de stages.

### Luna Max

Usar cuando el resultado esperado está cerrado: imports/wiring, manifests, layouts repetitivos, colliders, fixtures, tests, capture plumbing, warnings, cleanup y extracciones mecánicas. Máximo dos workers disjuntos por iteración.

## MiniMax M3 — evaluación GMI hasta 2026-09-06

La lane GMI es una evaluación temporal, no una dependencia. La key vive sólo en `.env.local`:

```dotenv
GMI_API_KEY=PEGAR_LA_KEY_REAL_ACA
GMI_BASE_URL=https://api.gmi-serving.com/v1
GMI_MINIMAX_MODEL=MiniMaxAI/MiniMax-M3
```

Checks:

```bash
npm run agent:minimax:gmi:check
npm run agent:minimax:gmi -- --task <task.md> --context <file> --out <report.md>
```

Runner: `scripts/agents/run-gmi-minimax.mjs`.

El runner limita contexto, no expone filesystem/shell al modelo y escribe resultados bajo `agent-work/reports/minimax-gmi/`. Todo output es **proposal-only**.

### Lecciones ya medidas

El greybox mostró que M3 funciona mejor con tareas pequeñas y exactas que con auditorías amplias o paquetes VFX grandes. Para authored pass:

- dar un solo efecto o una sola pregunta visual/técnica;
- adjuntar interfaces/código exactos y una referencia local;
- limitar cantidad de archivos/sugerencias;
- pedir que declare APIs dudosas en vez de inventarlas;
- registrar first-pass, reparaciones Sol, integración y `WOULD_PAY`.

Tareas nuevas relevantes:

- `agent-work/tasks/minimax/authored-manantial-vfx-v2.md`
- `agent-work/tasks/minimax/authored-castle-branch-readability.md`

Si GMI falla o termina, el loop continúa con Sol/Luna/Gemini.

## PlayCanvas

PlayCanvas Engine v2 + TypeScript + Vite es runtime canónico de Ohmdal. Decisión: `docs/20-worlds/ohmdal/production/OHMDAL_3D_RUNTIME_DECISION.md`.

Baselines:

- hardening `dec2d75`;
- Arco I greybox `b8bb412`;
- cierre greybox `74abaad`.

Three.js sigue como cantera técnica/R&D, no runtime paralelo.

## Captura local GPU vs gate full

El authored pass debe usar dos niveles una vez implementado A0:

1. **FAST local GPU** para iteración frecuente. Preferir Chromium/Chrome con hardware acceleration real; capturar sólo shots load-bearing de la etapa.
2. **FULL acceptance** para canonical shots, desktop/mobile/no-post, errores y diagnósticos completos. El camino reproducible por SwiftShader puede conservarse como fallback funcional.

Los manifests deben reportar renderer y `softwareRendered`. Nunca usar FPS de SwiftShader como benchmark de GPU física.

A0 del authored pass debe implementar/verificar este modo sin reescribir el Visual Harness.

## Blender / Hero assets / proveedores

Blender 5.2 LTS es DCC master. Todo hero pasa `docs/3d/HERO_REFERENCE_GATE.md`.

Ruta preferida:

`approved references → Blender determinista cuando alcance → canonical GLB → Visual Harness`

Meshy es posibilidad futura, especialmente para image/multiview→3D complejo. Tripo es A/B/fallback. Ambos requieren HUMAN_GATE económico salvo autorización previa, y terminan en Blender canonicalization + GLB + reference validation. `img2threejs` sigue experimental/R&D.

## Authored pass Ohmdal

Contratos:

- `docs/20-worlds/ohmdal/production/ARCO1_CANONICAL_SHOTS.md`
- `docs/20-worlds/ohmdal/production/ARCO1_AREA_REFERENCE_PLAN.md`
- `docs/20-worlds/ohmdal/production/ARCO1_AUTHORED_PASS_POLICY.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_VFX_AUDIO_PLAN.md`
- `assets/references/region-packs/manifest.json`

Regla resumida: greybox = autoridad de gameplay/topología; authored pass = formas, materiales, luz, motion/VFX/audio y readability. No rediseñar puzzles o rutas para facilitar el arte.

## Interacción y puzzles

`docs/20-worlds/ohmdal/production/OHMDAL_INTERACTION_POLICY.md` sigue mandando: **world-first**. Cables, interruptores, bornes, relés, protecciones, válvulas y máquinas se manipulan en mundo cuando son legibles. Close-up diegético sólo cuando precisión/densidad lo exige y siempre sobre el mismo modelo eléctrico.

## Mantener barato el contexto

1. Leer AGENTS + scope + tarea directa.
2. Delegar corpus grande a Gemini antes de cargarlo en Sol.
3. Dar a M3 archivos concretos; no adjuntar el repo entero.
4. Sol decide, Luna ejecuta mecánico y M3 propone technical-art acotado.
5. Usar canonical shots y region packs en vez de redescubrir dirección visual.
6. Respetar límites y HUMAN_GATEs.
