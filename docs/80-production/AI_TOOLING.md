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
- Estado mecánico al 2026-08-22: `tests/playcanvas-ohmdal.test.ts` pasa, pero el
  build global está bloqueado por referencias a `camPos` no definido en
  `playcanvasRuntime.ts`. Resolverlo pertenece a la siguiente tarea técnica, no
  a este reset de harness.
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

## Cuándo usar MCP

Usarlo sólo cuando el estado vivo y semántico de una aplicación justifica la
conexión: PlayCanvas Editor o Blender. Git, npm, Vite, Vitest/tests, `mmx`,
scripts y transformaciones glTF se ejecutan por terminal.

## Mantener barato el contexto de Codex

1. Leer `AGENTS.md`, el `AGENTS.md` del scope y los archivos directos.
2. Cargar una skill concreta sólo cuando cambie decisiones de la tarea.
3. No cargar recovery/history ni otras áreas por defecto.
4. Pasar a MiniMax briefs acotados y revisar artefactos, no transcripciones.
5. Pedir a Gemini informes persistidos cuando el análisis multimodal/extenso
   tenga valor reutilizable.
