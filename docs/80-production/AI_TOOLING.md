# AI tooling — harness canónico

**Estado:** operativo · **actualizado:** 2026-08-24

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

No existe router automático ni meta-framework. El mecanismo normal es
`archivo + terminal + git`. Codex/Sol sigue siendo **single integrator**: Luna y
MiniMax no compiten editando el mismo scope y ningún worker aprueba su propio
resultado.

## Bounded loops

Contrato cross-Roxana:

`docs/80-production/BOUNDED_AGENT_LOOP.md`

Instancias relevantes:

- Plaza aceptada: `agent-work/loops/ohmdal-plaza/LOOP.md` (`complete`).
- Greybox Arco I: `agent-work/loops/ohmdal-arco1-greybox/LOOP.md`.

Reglas clave:

- máximo 3 iteraciones por stage;
- máximo 5 fixes por iteración;
- máximo 1 fix estructural importante por iteración;
- Sol High decide y acepta;
- Luna Max ejecuta trabajo mecánico bien especificado;
- MiniMax M3 puede producir propuestas/patches para scopes aislados durante la evaluación GMI;
- Gemini Flash revisa evidencia, no implementación;
- sólo un `HUMAN_GATE` detiene el avance normal;
- no agregar directors, routers, daemons, colas ni agent frameworks nuevos.

## Gemini por Antigravity CLI — sin API

Ruta canónica: `agy` con login local de Google. No `GEMINI_API_KEY`, Vertex ni
AI Studio API.

```powershell
irm https://antigravity.google/cli/install.ps1 | iex
agy
```

Checks:

```bash
agy models
npm run agent:gemini:check
```

Wrapper repo-native:

`scripts/agents/run-antigravity.mjs`

Routing automático visual/contextual: **`gemini-3.7-flash-high` + effort high**.
Si el slug desaparece, usar el equivalente Gemini Flash High disponible. No
escalar automáticamente a Pro.

Usos: context distillation, reconciliación de fuentes, review multimodal,
fresh-eyes, selección de reading set mínimo. No usar Gemini para implementar,
modificar el repo o aprobar su propio trabajo.

## Codex routing

### Sol High

Reservar para arquitectura, gameplay sistémico, composición/dirección visual,
trade-offs, integración compleja, partición de tareas y aceptación de stages.

### Luna Max

Usar como subagente cuando el resultado esperado ya está cerrado: imports/wiring,
manifests, layouts repetitivos, colliders, fixtures, tests, warnings, cleanup y
extracciones mecánicas. Máximo dos workers disjuntos por iteración.

## MiniMax M3 — evaluación GMI 2026-08-24 → 2026-09-06

GMI Cloud habilita MiniMax M3/M2.7 y media de MiniMax gratis durante la ventana de
evaluación. El objetivo no es convertir GMI en dependencia: es medir si MiniMax
merece luego un plan pago para Roxana.

### Key y entorno local

**Nunca commitear la key.** Crear en la raíz del repo:

`.env.local`

```dotenv
GMI_API_KEY=PEGAR_LA_KEY_REAL_ACA
GMI_BASE_URL=https://api.gmi-serving.com/v1
GMI_MINIMAX_MODEL=MiniMaxAI/MiniMax-M3
```

`.env.local`, `.env` y `.env.*` están ignorados por Git. `.env.example` sólo
documenta nombres de variables y nunca contiene secretos.

Check:

```bash
npm run agent:minimax:gmi:check
```

Runner temporal:

`scripts/agents/run-gmi-minimax.mjs`

Ejemplo:

```bash
npm run agent:minimax:gmi -- \
  --task agent-work/tasks/minimax/eval-vfx-electricity.md \
  --context docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md \
  --out agent-work/reports/minimax-gmi/vfx-electricity-01.md
```

El runner:

- usa el endpoint OpenAI-compatible de GMI;
- carga la key desde proceso o `.env.local` sin imprimirla;
- permite adjuntar archivos concretos con `--context`;
- limita el contexto por defecto en vez de volcar el repo entero;
- sólo escribe bajo `agent-work/reports/minimax-gmi/`;
- MiniMax no tiene filesystem/shell en esta lane;
- el resultado es **proposal-only**: Sol inspecciona, aplica, testea y acepta.

Durante el trial MiniMax debe recibir trabajo **real** del Arco I, no benchmarks
sintéticos. Sus resultados se puntúan por first-pass applicability, correcciones
necesarias, tests, calidad visual/técnica, tiempo y reutilización. La evaluación
vive en `agent-work/tasks/minimax-gmi-evaluation.md`.

### Rol preferido de M3

- technical art: VFX, shaders, partículas, agua, niebla, electricidad;
- primera pasada de mecánicas aisladas con brief/test contract claros;
- transformación/recombinación de código existente a partir de ejemplos;
- trabajo de volumen que no justifica tokens de Sol;
- speech/music/image cuando la ruta oficial disponible lo permita.

No darle a M3 autoridad de canon, arquitectura global, integración final ni
aceptación. Si propone cambios sobre el mismo scope que Luna, Sol elige un solo
worker antes de editar para evitar colisiones.

Cuando termine el trial: `BUY / DON'T BUY` según evidencia Roxana. Si GMI deja de
estar disponible, el loop continúa con Sol/Luna/Gemini; no se bloquea producción.

## PlayCanvas

PlayCanvas Engine v2 + TypeScript + Vite es el runtime canónico de Ohmdal.
La decisión está en:

`docs/20-worlds/ohmdal/production/OHMDAL_3D_RUNTIME_DECISION.md`

El hardening aprobado `dec2d75` es baseline de producción. Three.js conserva
valor como cantera técnica/R&D, no como runtime paralelo de Ohmdal.

## Blender

Blender 5.2 LTS es DCC master canónico para assets Ohmdal: escala, pivots,
jerarquía, cleanup, materiales y export GLB. El Blender Gauntlet reusable parte
de reference pack aprobado y termina en master reproducible + GLB + multivista +
review independiente.

## Hero assets y proveedores 3D

Todo hero pasa `docs/3d/HERO_REFERENCE_GATE.md`.

Ruta preferida:

`approved references → Blender determinista cuando alcance → canonical GLB → Visual Harness`

Meshy está aprobado como **posibilidad futura**, especialmente para
image/multiview→3D de geometría compleja. Tripo es A/B/fallback. Ambos requieren
HUMAN_GATE económico salvo autorización previa y siempre terminan en Blender
canonicalization + GLB + reference validation. Un provider nunca es dependencia
del runtime.

`img2threejs` permanece como authoring/R&D experimental; no se integra como
runtime de Ohmdal.

## Interacción y puzzles

Política de interacción para el greybox Arco I:

`docs/20-worlds/ohmdal/production/OHMDAL_INTERACTION_POLICY.md`

Regla resumida: **world-first**. Manipular cables, interruptores, bornes, relés,
protecciones, válvulas y máquinas directamente en el mundo cuando sea legible.
Cuando la densidad/precisión lo requiera, usar un close-up diegético de
mantenimiento ligado al mismo objeto y al mismo modelo eléctrico; nunca un
minijuego abstracto que reemplace la simulación.

## Visual / gameplay / performance harness

Visual:

`docs/3d/VISUAL_HARNESS.md`

Gameplay Golden Path y zone lifecycle fueron validados en el hardening
`dec2d75`. Los siguientes loops deben extender esos contratos, no reemplazarlos.

Nunca usar FPS bajo SwiftShader como benchmark de GPU física.

## Mantener barato el contexto

1. Leer AGENTS + scope + tarea directa.
2. Delegar corpus grande a Gemini antes de cargarlo en Sol.
3. Dar a M3 archivos concretos mediante `--context`; no adjuntar el repo entero.
4. Usar Sol para decisiones, Luna para plumbing y M3 para propuestas de volumen/technical-art.
5. Cargar skills on-demand.
6. Para assets usar catálogo/reference pack; no redescubrir fuentes cada sesión.
7. Respetar límites y HUMAN_GATEs.
