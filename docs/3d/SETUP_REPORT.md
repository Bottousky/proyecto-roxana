# Reporte de setup del ecosistema 3D

**Fecha:** 2026-07-28

**Rama:** `codex/setup-ecosistema-3d`

**Estado:** listo para revisión; `verify` bloqueado por el entorno preexistente

## Resumen

El setup parte del prototipo preservado en `feature/school-voxel`, por decisión explícita del
Director. No se reconstruyó el hall ni se modificó gameplay. El trabajo agrega contratos,
reglas, skills fijadas, configuración MCP de ejemplo, estructura de assets y QA reproducible.

## Preservación Git

- `feature/school-voxel` fue preservada en `2a9aea6`.
- `codex/setup-ecosistema-3d` fue creada desde ese commit.
- `main` no fue modificada ni fusionada.

Esta base difiere de la instrucción original de partir de `main`, pero evita perder el rumbo
visual y fue autorizada después de detectar trabajo local sin integrar.

## Baseline previo al setup

| Comando | Resultado |
|---|---|
| `git status --short --branch` | limpio en la rama nueva |
| `node --version` | `v24.14.1` |
| `npm --version` / `npx --version` | `11.12.1` |
| `python --version` | `3.10.6`; alias `python3` no disponible |
| `codex --version` | `codex-cli 0.145.0` |
| `npm install` | OK, 0 vulnerabilidades |
| `npm run build` | OK |
| `npm test` | OK, todos los tests descubiertos |
| `npm run verify` | bloqueado antes de los checks: Windows no tiene distribución WSL |

El bloqueo de `verify` es de entorno y existía antes del setup. Build y tests se ejecutaron por
separado y pasaron.

## Diferencias del código real

- La escuela 3D de producción está en `src/landing/school3d.ts`, no dentro del `RuntimeHost`.
- La landing 3D es predeterminada y la clásica usa `?view=classic`; no coincide con el gate
  histórico `?school3d=1`.
- El loader GLB/Draco y las métricas `renderer.info` ya existen; se reutilizan como baseline.
- Los assets activos viven en `assets/school3d/`; la nueva separación es aditiva.

## Skills y MCP

- Skills externas copiadas y fijadas en `docs/3d/TOOLCHAIN_LOCK.md`.
- `roxana-3d-director` creada con referencias y validador delegado.
- Se descubren diez skills con `SKILL.md`.
- El fallback de `img2threejs` fue verificado: `forge`, `grimoire` y sus scripts están presentes;
  no quedó un repositorio Git anidado.
- La skill Meshy recibió un hardening local para no mostrar, leer ni persistir la clave.
- `.codex/config.toml.example` fija Playwright MCP `0.0.78` y Meshy MCP `0.4.0`.
- `MESHY_API_KEY` no está presente: no se consultó balance ni se consumieron créditos.
- La configuración MCP activa todavía no incluye Playwright/Meshy; requiere fusión y reinicio.

## Diff por área

- Agentes: `AGENTS.md`, diez skills fijadas y licencias/atribuciones.
- Orquestación: cuatro perfiles en `.codex/agents/`, límite activo de tres subagentes y contratos
  reutilizables en `docs/agent-runs/`.
- MCP/secretos: `.codex/config.toml.example`, `.env.example` e ignores.
- Contratos: schema draft 2020-12, ejemplo, fixtures y estructura source/reference/runtime.
- Pipeline: validación de manifiestos/GLB, índice, dry-run de optimización y budget reporter.
- Documentación: biblias, políticas, QA, estado, toolchain y este reporte.
- QA visual: estructura `tests/visual/`; capturas temporales en `output/playwright/`.
- Dependencias: no se agregaron dependencias de producción ni desarrollo; `package.json` sólo
  incorpora comandos.

## Validación final

| Evidencia | Resultado |
|---|---|
| `npm run build` | OK |
| `npm test` | OK, 60 archivos de test |
| `npm run verify` | bloqueado por WSL ausente, igual que el baseline |
| `quick_validate.py .agents/skills/roxana-3d-director` | OK |
| descubrimiento por `SKILL.md` | OK, 10 skills |
| parse de `.codex/config.toml.example` | OK con `tomli` |
| JSON Schema draft 2020-12 con `jsonschema 4.26.0` | schema y ejemplo OK |
| `npm run 3d:validate-manifests` | ejemplo OK |
| fixture válido | OK |
| fixture inválido | falla esperada, exit 1 y 21 diagnósticos |
| `npm run 3d:asset-index -- --check` | OK, 1 asset |
| `npm run 3d:validate-glb -- ...` | 0 errores y 0 warnings en los dos GLB |
| `npm run 3d:report-budget -- ...` | lee `renderer.info`; fixture desktop dentro de gates |
| `npm run 3d:optimize-glb -- ...` | dry-run, no escribió ni reemplazó assets |
| `npx @playwright/mcp --help` | paquete MCP inicia y expone CLI |
| navegación local Chromium | 0 errores de consola; desktop y mobile renderizan |
| métricas smoke desktop | 60 FPS, 66 draw calls, 286.002 triángulos |
| auditoría de secretos | 0 valores detectados; símbolo ausente de código cliente |
| outputs | `dist`, `node_modules` y `output` ignorados |

## Addendum multiagente

El 2026-07-28 se incorporó la Fase 1 de orquestación sin dependencias nuevas:

- el hilo principal conserva el rol Director/integrador;
- Arquitectura incluye materiales e iluminación;
- Asset Forge queda bloqueado para Meshy por defecto;
- un único Evaluador registra evidencia pero no corrige implementación;
- ownership exclusivo, ramas `codex/<hito>-<rol>`, worktrees separados, tareas de 30–90 minutos
  y máximo dos rondas automáticas quedaron como reglas durables;
- `instituto-hall-v1` se inicializó en estado contractual con
  `executionAuthorized: false`, `baseCommit: null` y cero agentes lanzados.

Los scripts de Fase 2 y Agents SDK de Fase 3 permanecen deliberadamente diferidos hasta observar
repetición real. Cambios en configuración, perfiles e instrucciones se descubren al abrir una
tarea nueva o reiniciar Codex.

Las capturas `setup-school-desktop.png` y `setup-school-mobile.png` son evidencia temporal
revisada visualmente y no se versionan.

## Riesgos

1. Exposición predeterminada de la landing 3D distinta del gate histórico.
2. Assets fuente y runtime mezclados en la ruta heredada.
3. `develop-web-game` es una dependencia histórica retirada por OpenAI.
4. Sin prueba en GPU mobile física.
5. Sin credencial/suscripción Meshy, el camino Meshy continúa pendiente.
6. La configuración MCP de ejemplo no modifica automáticamente la configuración global de Codex.

## Próximo paso

Solicitar aprobación para M4 Laboratorio visual del hall. No ampliar arte antes de fijar ruta,
gate, cámara, maniquí, grilla, captura mobile y presupuesto.
