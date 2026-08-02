# Estado — Ohmdal HD-2D preproducción v1

**Fase:** DIR-001 completado; H1+H2 listos para ejecución por tareas
**Ejecución autorizada:** sí, exclusivamente H1+H2
**Ronda:** 0/2
**Base común:** `12d6f88d2a366da89ed91008013f42ba6295e42d`
**Bloqueo:** ninguno para DIR-EDU-001, ARCH-001 o ASSET-001; H3 continúa bloqueado

## DIR-001 — baseline registrado

Ejecutado el 2026-08-02 en `C:\YO\Worktrees\roxana-hd2d-director`, rama
`codex/ohmdal-hd2d-preprod-v1-director`, con `HEAD` exactamente en
`12d6f88d2a366da89ed91008013f42ba6295e42d` y working tree limpio antes del baseline:

- `npm run build`: PASS, 185 módulos.
- `npm test`: PASS.
- `npm run 3d:validate-manifests`: PASS; valida el manifiesto de ejemplo existente.
- El `asset-manifest.json` del hito es un inventario de control y parsea como JSON. No reemplaza
  los manifests runtime individuales; Asset Forge debe crear y validar uno por asset antes de
  producir o integrar.
- `npm run verify`: no ejecutado; `wsl -l -q` no informa distribuciones instaladas. No se declara
  PASS.

Los worktrees de Director, Arquitectura y Asset Forge existen, están limpios y parten exactamente
del `baseCommit`. Los contratos vigentes fueron leídos desde
`codex/ohmdal-hd2d-biblia`; los ejecutores deben repetir esa lectura al iniciar su sesión. Los
globs de escritura no incluyen `src/jugar/**`, que permanece en `sharedReadOnly`.

## Tareas

| ID | Rol | Estado | Rama | Commit |
|---|---|---|---|---|
| DIR-001 | Director | COMPLETED | `codex/ohmdal-hd2d-preprod-v1-director` | commit de cierre DIR-001 en esta rama |
| DIR-EDU-001 | Director | READY | `codex/ohmdal-hd2d-preprod-v1-director` | — |
| ARCH-001 | Arquitectura | READY | `codex/ohmdal-hd2d-preprod-v1-arquitectura` | — |
| ASSET-001 | Asset Forge | READY | `codex/ohmdal-hd2d-preprod-v1-assets` | — |
| DIR-INT-001 | Director | BLOCKED por dependencias | `codex/ohmdal-hd2d-preprod-v1-director` | — |
| EVAL-001 | Evaluador | BLOCKED por integración | `codex/ohmdal-hd2d-preprod-v1-evaluacion` | — |
| DIR-VERDICT-001 | Director | BLOCKED por evaluación | `codex/ohmdal-hd2d-preprod-v1-director` | — |

## Secuencia inmediata

1. Arquitectura y Asset Forge pueden iniciar en sus worktrees separados y en paralelo.
2. El Director puede ejecutar DIR-EDU-001 en su propia frontera.
3. El Director integra commits secuencialmente después de las tres entregas.
4. Se abre un único Evaluador sólo sobre la integración terminada.

## Worktrees verificados

| Rol | Ruta | Rama | Estado inicial |
|---|---|---|---|
| Director | `C:\YO\Worktrees\roxana-hd2d-director` | `codex/ohmdal-hd2d-preprod-v1-director` | limpio en `baseCommit`; baseline PASS |
| Arquitectura | `C:\YO\Worktrees\roxana-hd2d-arquitectura` | `codex/ohmdal-hd2d-preprod-v1-arquitectura` | limpio en `baseCommit`; requiere `npm install` al iniciar |
| Asset Forge | `C:\YO\Worktrees\roxana-hd2d-assets` | `codex/ohmdal-hd2d-preprod-v1-assets` | limpio en `baseCommit`; requiere `npm install` al iniciar |
| Evaluador | — | `codex/ohmdal-hd2d-preprod-v1-evaluacion` | no creado; crear sólo desde commit integrado |

## Frenos activos

- Meshy y generación paga: prohibidos.
- H3 y migración de `/jugar`: no autorizados.
- Tercera ronda: requiere nueva aprobación humana.
- Ownership solapado: detener ambos roles y devolver al Director.
