# AI tooling — harness canónico

**Estado:** operativo · **actualizado:** 2026-08-22

## Responsabilidades

| Actor | Responsabilidad |
|---|---|
| Humano / Manuel | objetivos, decisiones materiales, canon e integración de milestones |
| ChatGPT web | diseño, investigación, planificación y specs |
| Codex | única autoridad técnica; modifica, integra, prueba y valida |
| Gemini | peer multimodal/contextual; entrega informes reproducibles |
| MiniMax | worker por CLI `mmx`; nunca aprueba su propio resultado |

No existe un router automático ni un meta-framework. El mecanismo normal es
`archivo + terminal + git`.

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

## Gemini

El intercambio es deliberadamente manual:

```text
agent-work/tasks/gemini/    brief humano/Codex
agent-work/reports/gemini/  informe de Gemini
```

El brief declara objetivo, archivos/fuentes, límites y salida. Gemini puede leer
el repo y producir informes; Codex verifica hechos, decide cambios e integra.

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
  syntax-check de los helpers de adquisición 3D antes del gate del repo.
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
- MCP oficial: `@meshy-ai/meshy-mcp-server`.
- Agent skill oficial: `meshy-dev/meshy-3d-agent`.

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
Codex desde terminal (`tripo make`, presets game/mobile/print, batch, doctor) y
también puede exponer `tripo mcp` si una tarea futura lo justifica.

No instalarlo por defecto ni asumir que créditos del webapp pagan la API: el
billing web/API es separado. Se usa sólo cuando calidad, segmentación, rig,
low-poly o batch demuestren ventaja concreta frente a Meshy/Blender.

## Cuándo usar MCP

MCP no está limitado por dogma a dos aplicaciones; está limitado por **valor
probado y servidor oficial**.

Default:

- PlayCanvas Editor: sí cuando el estado vivo importa.
- Blender oficial: sí bajo gate de seguridad.
- Meshy oficial: opcional en sprint de assets aprobado.
- Tripo: preferir CLI; MCP sólo si aporta valor concreto.
- Git, npm, Vite, tests, `mmx`, scripts y transformaciones glTF: terminal.

No crear MCPs propios para envolver herramientas que ya tienen CLI/API/servidor
oficial suficiente.

## Visual harness

Para trabajo visual premium, el cierre no es `build PASS` sino:

```text
build → browser → deterministic state → multiview capture
      → renderer diagnostics → scorecard → critic → fix
```

Contrato cross-runtime: `docs/3d/VISUAL_HARNESS.md`.

Three.js puede aportar técnicas/checklists/QA desde repos externos, pero no se
instalan directors/routers Three dentro del harness de Roxana ni se cambia el
runtime de Ohmdal por ese motivo.

## Mantener barato el contexto de Codex

1. Leer `AGENTS.md`, el `AGENTS.md` del scope y los archivos directos.
2. Cargar una skill concreta sólo cuando cambie decisiones de la tarea.
3. No cargar recovery/history ni otras áreas por defecto.
4. Pasar a MiniMax briefs acotados y revisar artefactos, no transcripciones.
5. Pedir a Gemini informes persistidos cuando el análisis multimodal/extenso
   tenga valor reutilizable.
6. Para assets, usar catálogo/task packet y registrar outputs; no pedir a Codex
   que redescubra proveedores y licencias en cada sesión.