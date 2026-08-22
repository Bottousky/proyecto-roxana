# AI tooling — harness canónico

**Estado:** operativo · **actualizado:** 2026-08-22

## Responsabilidades

| Actor | Responsabilidad |
|---|---|
| Humano / Manuel | objetivos, decisiones materiales, canon e integración de milestones |
| ChatGPT web | diseño, investigación, planificación y specs |
| Codex | única autoridad técnica; modifica, integra, prueba y valida |
| Gemini / Antigravity | peer de contexto amplio, multimodal y fresh-eyes review |
| MiniMax | worker por CLI `mmx`; nunca aprueba su propio resultado |

No existe un router automático ni un meta-framework. El mecanismo normal es
`archivo + terminal + git`.

## Gemini por Antigravity CLI — sin API

La ruta canónica para aprovechar Gemini desde el repo es **Antigravity CLI
`agy` con login local de Google**, no `GEMINI_API_KEY`, Vertex ni AI Studio API.
Antigravity headless reutiliza las credenciales cacheadas del login interactivo.

Instalación oficial en Windows PowerShell:

```powershell
irm https://antigravity.google/cli/install.ps1 | iex
agy
```

La primera ejecución abre el navegador si no existe una sesión válida. Luego:

```bash
agy models
npm run agent:gemini:check
```

El wrapper repo-native es:

```text
scripts/agents/run-antigravity.mjs
```

### Routing de modelo

`agy models` siempre manda sobre nombres escritos en documentación. Como regla de
costo/contexto:

- **Gemini Flash High/Medium**: lectura amplia, clasificación, context
  distillation, comparación de muchas fuentes y revisiones frecuentes.
- **Gemini Pro High**: contradicciones difíciles, decisiones ambiguas y
  fresh-eyes final de una entrega importante.

Al 2026-08-22 los slugs documentados incluyen `gemini-3.7-flash-high` y
`gemini-3.1-pro-high`; si dejan de aparecer, seleccionar sus equivalentes actuales
desde `agy models` y registrar el slug real.

Context audit de Plaza:

```bash
npm run agent:gemini:plaza-context -- \
  --model gemini-3.7-flash-high \
  --effort high
```

Fresh-eyes final:

```bash
npm run agent:gemini:plaza-review -- \
  --model gemini-3.1-pro-high \
  --effort high
```

También se puede definir `ROXANA_GEMINI_MODEL` / `ROXANA_GEMINI_EFFORT` para una
sesión, pero no commitear un modelo global como requisito eterno.

### Qué hace el wrapper

- llama `agy -p` en headless;
- pide JSON y captura sólo la respuesta final;
- usa `--sandbox` y nunca `--dangerously-skip-permissions`;
- obliga a persistir informes bajo `agent-work/reports/gemini/`;
- instruye al peer a no ejecutar shell ni tocar archivos;
- toma fingerprint Git antes/después y **falla si el worktree cambia**;
- no lee ni imprime tokens, OAuth profiles, `.env` ni claves de proveedores;
- no contiene ninguna integración API de Gemini.

No usar `--dangerously-skip-permissions` para este flujo. Los peer tasks son de
lectura/análisis; si Gemini necesita modificar código, el brief está mal
particionado y la implementación debe volver a Codex.

### Cuándo delegar a Gemini

Delegar antes de ampliar mucho el contexto de Codex cuando haya:

- reconciliación de muchas fuentes/documentos;
- análisis del mundo completo o cross-document consistency;
- screenshots, mapas, renders GLB, video o comparación de variantes;
- fresh-eyes visual review independiente;
- selección/priorización de un reading set mínimo para Codex.

No delegar:

- fixes locales de pocos archivos;
- integración final;
- cambios de engine/dependencias/canon;
- aprobación del propio trabajo;
- tareas cuya salida útil sería directamente un diff de implementación.

Dos briefs listos para Ohmdal:

```text
agent-work/tasks/gemini/ohmdal-plaza-context-audit.md
agent-work/tasks/gemini/ohmdal-plaza-visual-review.md
```

El primero destila el contexto antes del art pass; el segundo recibe el set
completo de capturas/métricas como reviewer independiente.

Fuentes oficiales de operación:

- `https://antigravity.google/docs/cli/getting-started`
- `https://antigravity.google/docs/cli/headless/`
- `https://antigravity.google/docs/cli/install`

## MiniMax por terminal

`mmx` es la interfaz primaria. No crear un MCP o wrapper local.

```bash
mmx auth status
mmx quota
mmx text chat --message "..." --non-interactive --quiet --output json
mmx image generate --prompt "..." --out-dir minimax-output/
mmx speech synthesize --text "..." --out minimax-output/voz.mp3
mmx music generate --prompt "..." --out minimax-output/musica.mp3
mmx vision archivo.png --output json
```

- `mmx text`: trabajo masivo o delegado con alcance y formato explícitos.
- `mmx image`: referencias y arte secundario; conservar prompt/procedencia.
- `mmx speech` / `music`: voces y música cuando la tarea lo autorice.
- `mmx vision`: análisis de material visual cuando aporte evidencia.
- Generar primero en `minimax-output/`; Codex revisa antes de mover al destino.
- No ejecutar video ni lotes costosos como smoke test.
- En este host: `mmx 1.0.19`, OAuth activo y cuota consultable al 2026-08-22.

La skill oficial `mmx-cli` está instalada globalmente. La skill local
`roxana-minimax` agrega sólo las reglas específicas anteriores.

## PlayCanvas

- Target de Ohmdal: PlayCanvas Engine v2 + TypeScript + Vite + glTF/GLB.
- Dependencia actual: `playcanvas` 2.21.x.
- Spike existente: `src/experiences/ohmdal-playcanvas/` y ruta
  `/ohmdal-playcanvas`; sigue siendo experimental, no una migración terminada.
- Estado mecánico al 2026-08-22 en `explore/ohmdal-3D`: se corrigió el acceso a
  la posición del jugador dentro de `triggerInteraction()` en
  `playcanvasRuntime.ts`. El gate CI de la rama ejecutó `npm run verify` y
  `npm run 3d:validate-manifests` con resultado PASS; el build TypeScript/Vite y
  `tests/playcanvas-ohmdal.test.ts` quedaron verdes. Logs estáticos antiguos no
  se consideran fuente de verdad.
- `.github/workflows/validate.yml` valida ramas `explore/**` y PRs; además hace
  syntax-check de helpers agentic/3D antes del gate del repo.
- Skills oficiales: las entradas registradas desde `playcanvas/skills` en
  `skills-lock.json`; cargar sólo la que corresponda a la tarea.
- MCP oficial: `@playcanvas/editor-mcp-server` 0.6.1, registrado en Codex como
  `playcanvas`. Requiere abrir el proyecto en PlayCanvas Editor y conectar el
  panel MCP al puerto 52000. Para trabajo directo con Engine/code, usar terminal.

No crear un proyecto Editor ni migrar el runtime sólo para habilitar el MCP.

## Blender

Blender 5.2 está instalado. La configuración previa apuntaba al servidor
tercero `ahujasid/blender-mcp`; fue retirada del harness canónico.

El MCP oficial de Blender Lab requiere Blender 5.1+, instalar/activar manualmente
su add-on y ejecutar un servidor que acepta código Python generado sin guardas.
Por seguridad no se habilita automáticamente en este equipo. Si Manuel decide
usarlo, seguir `https://www.blender.org/lab/mcp-server/` en un entorno aislado o
sin datos sensibles y registrar sólo el servidor oficial.

Hasta entonces, Blender sigue siendo la herramienta primaria de assets mediante
su UI/CLI y exportación GLB, sin MCP alternativo.

## Meshy

Meshy es un **proveedor de producción 3D opcional**, no otro harness.

Rutas oficiales actuales:

- REST API: text/image/multi-image → 3D, refine, remesh, retexture, rig, animate.
- MCP oficial y Agent Skill oficiales.

Usar sólo cuando exista plan/crédito aprobado para un sprint de assets. Guardar
`MESHY_API_KEY` fuera del repo. MCP/REST consumen el balance de la cuenta; cada
asset debe registrar task ID, proveedor/modelo, parámetros, créditos y output.

Preferencia:

- **skill/API** para workflows reproducibles generate → poll → download;
- **MCP oficial** cuando el tool-calling conversacional reduzca pasos de verdad;
- nunca crear un wrapper/MCP local duplicado.

La política de Ohmdal vive en
`docs/20-worlds/ohmdal/production/OHMDAL_AGENTIC_3D_STACK.md`.

## Tripo

Tripo es A/B/fallback, no dependencia base. Su CLI oficial puede ser operado por
Codex desde terminal y también puede exponer MCP si una tarea futura lo justifica.

No instalarlo por defecto ni asumir que créditos del webapp pagan la API. Se usa
sólo cuando calidad, segmentación, rig, low-poly o batch demuestren ventaja
concreta frente a Meshy/Blender.

## Cuándo usar MCP

MCP está limitado por **valor probado y servidor oficial**, no por moda.

Default:

- PlayCanvas Editor: sí cuando el estado vivo importa.
- Blender oficial: sí bajo gate de seguridad.
- Meshy oficial: opcional en sprint de assets aprobado.
- Tripo: preferir CLI; MCP sólo si aporta valor concreto.
- Antigravity/Gemini: **CLI `agy`, no MCP/API**, para el peer flow actual.
- Git, npm, Vite, tests, `mmx`, scripts y transformaciones glTF: terminal.

No crear MCPs propios para envolver herramientas que ya tienen CLI/API/servidor
oficial suficiente.

## Visual harness

Para trabajo visual premium, el cierre no es `build PASS` sino:

```text
build → browser → deterministic state → multiview capture
      → renderer diagnostics → Gemini fresh-eyes critic → Codex fix
```

Contrato cross-runtime: `docs/3d/VISUAL_HARNESS.md`.

Three.js puede aportar técnicas/checklists/QA desde repos externos, pero no se
instalan directors/routers Three dentro del harness de Roxana ni se cambia el
runtime de Ohmdal por ese motivo.

## Mantener barato el contexto de Codex

1. Leer `AGENTS.md`, el `AGENTS.md` del scope y los archivos directos.
2. Si la tarea pide muchas fuentes, delegar primero context distillation a
   Gemini/Antigravity y consumir su `CODEX MINIMAL READING SET`.
3. Para exploración masiva, preferir Flash; reservar Pro para conflictos o
   revisión final de alto valor.
4. Cargar una skill concreta sólo cuando cambie decisiones de la tarea.
5. No cargar recovery/history ni otras áreas por defecto.
6. Pasar a MiniMax briefs acotados y revisar artefactos, no transcripciones.
7. Usar Gemini para fresh-eyes/multimodal; Codex valida sólo claims load-bearing.
8. Para assets, usar catálogo/task packet y registrar outputs; no pedir a Codex
   que redescubra proveedores y licencias en cada sesión.