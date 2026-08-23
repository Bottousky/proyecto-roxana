# AI tooling — harness canónico

**Estado:** operativo · **actualizado:** 2026-08-23

## Responsabilidades

| Actor | Responsabilidad |
|---|---|
| Humano / Manuel | objetivos, canon, gasto pago y decisiones materiales |
| ChatGPT web | investigación, diseño, planificación y specs |
| Codex / Sol High | única autoridad técnica; decide, integra, prueba y valida |
| Codex / Luna Max | worker mecánico sólo con brief cerrado |
| Gemini / Antigravity | contexto amplio, multimodal y fresh-eyes read-only |
| MiniMax | worker por CLI `mmx`; nunca aprueba su propio resultado |

No existe router automático ni meta-framework. El mecanismo normal es
`archivo + terminal + git`.

## Bounded loops

El contrato cross-Roxana para avanzar de forma autónoma y acotada está en:

`docs/80-production/BOUNDED_AGENT_LOOP.md`

La Plaza de Ohmdal lo instancia en:

`agent-work/loops/ohmdal-plaza/LOOP.md`

Reglas clave:

- máximo 3 iteraciones por stage;
- máximo 5 fixes por iteración;
- Sol High decide y acepta;
- Luna Max ejecuta trabajo mecánico ya especificado;
- Gemini Flash revisa evidencia, no implementación;
- sólo un `HUMAN_GATE` detiene el avance normal;
- no agregar `sol-advisor`, directors, routers ni frameworks nuevos.

## Gemini por Antigravity CLI — sin API

La ruta canónica es `agy` con login local de Google, no `GEMINI_API_KEY`, Vertex
ni AI Studio API.

Primera instalación/login en Windows:

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

### Routing actual

Para los loops visuales de Roxana usar por default:

**`gemini-3.7-flash-high` + effort `high`**

Si ese slug desaparece, elegir desde `agy models` el equivalente **Gemini Flash
High** disponible. El loop no escala automáticamente a Gemini Pro.

Usos:

- context distillation;
- reconciliación de muchas fuentes;
- revisión de screenshots/mapas/renders/variantes;
- fresh-eyes visual review;
- selección de un reading set mínimo para Codex.

No usar Gemini para implementar, modificar el repo o aprobar cambios técnicos.

El runner:

- usa `agy -p` headless;
- usa `--sandbox`;
- persiste sólo bajo `agent-work/reports/gemini/`;
- pide al peer no ejecutar shell ni tocar archivos;
- compara fingerprint Git antes/después y falla si hubo modificación;
- no lee ni imprime secretos.

No usar `--dangerously-skip-permissions`.

## Codex routing

### Sol High

Reservar para:

- arquitectura;
- composición/dirección visual;
- decisiones con trade-offs;
- integración compleja;
- partición de tareas;
- aceptación técnica de una iteración/stage.

### Luna Max

Usar como subagente cuando el resultado esperado ya esté cerrado:

- imports y wiring;
- manifests/provenance;
- repetición/instancing;
- valores concretos;
- tests y warnings;
- cleanup mecánico.

Máximo dos workers disjuntos por iteración en bounded loops. Si el harness actual
no permite seleccionar Luna, no crear un wrapper propio: reportar fallback y
continuar sólo lo imprescindible.

## PlayCanvas

- Target de Ohmdal: PlayCanvas Engine v2 + TypeScript + Vite + glTF/GLB.
- `src/experiences/ohmdal-playcanvas/` y `/ohmdal-playcanvas` siguen siendo spike
  experimental, no migración completa aprobada.
- Skills oficiales de PlayCanvas: cargar sólo la operación necesaria.
- MCP del Editor sólo cuando el estado vivo aporte valor; Engine code-first usa terminal.

## Blender

Blender 5.2 LTS es el DCC canonical para assets de Ohmdal: escala, pivots,
jerarquía, cleanup, materiales y export GLB.

MCP oficial de Blender sólo bajo el gate de seguridad documentado por Blender;
no usar servidores terceros como default.

## Hero assets

Todos pasan `docs/3d/HERO_REFERENCE_GATE.md` antes de producción final.

Ohm es el golden path:

`assets/references/hero-packs/ohm/hero-reference.json`
→ `scripts/3d/build_ohm_hero.py`
→ Blender
→ canonical GLB
→ Visual Harness.

Si existe turnaround aprobado, reconstruir antes de rediseñar.

## Meshy / Tripo / Three.js

- **Meshy**: proveedor 3D generativo opcional; gasto requiere human gate salvo
  autorización previa. No sustituye el reference pack.
- **Tripo**: A/B/fallback cuando demuestre ventaja concreta.
- **Three.js**: cantera de técnicas, QA y authoring; no runtime de Ohmdal.
- `img2threejs`: authoring experimental/watchlist; no dependencia del runtime.

Política detallada: `docs/20-worlds/ohmdal/production/OHMDAL_AGENTIC_3D_STACK.md`.

## MiniMax

`mmx` sigue siendo interfaz primaria. Útil para trabajo masivo, voz, música,
imagen secundaria y visión. Codex revisa antes de integrar. No crear MCP local.

## Visual harness

El cierre visual es:

```text
build → deterministic capture → diagnostics
      → Gemini 3.7 Flash fresh-eyes
      → Sol plan
      → Luna/Sol fixes
      → recapture
      ↺
```

Contrato: `docs/3d/VISUAL_HARNESS.md`.

Nunca usar FPS bajo SwiftShader como benchmark de GPU física.

## Mantener barato el contexto

1. Leer AGENTS + scope + task directo.
2. Delegar corpus grande a Gemini antes de cargarlo en Codex.
3. Usar Sol para decisiones, no para repetición.
4. Usar Luna sólo con briefs cerrados.
5. Cargar skills on-demand.
6. Para assets, usar catálogo/reference pack; no redescubrir fuentes en cada sesión.
7. Los loops siempre respetan límites y human gates.
