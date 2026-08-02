# Estado — Ohmdal HD-2D preproducción v1

**Fase:** benchmark A/B autorizado; implementación H1+H2 preparada
**Ejecución autorizada:** sí, exclusivamente H1+H2
**Ronda:** 0/2
**Base común:** `12d6f88d2a366da89ed91008013f42ba6295e42d`
**Bloqueo:** ninguno para el benchmark de diez ejecuciones; H3 continúa bloqueado

## Baseline registrado

Sobre la base estabilizada previa al commit canónico:

- `npm run build`: PASS, 185 módulos.
- `npm test`: PASS.
- `npm run 3d:validate-manifests`: PASS; valida el manifiesto de ejemplo existente.
- El `asset-manifest.json` del hito es un inventario de control y parsea como JSON. No reemplaza
  los manifests runtime individuales; Asset Forge debe crear y validar uno por asset antes de
  producir o integrar.
- `npm run verify`: no ejecutado; Windows no tiene distribución WSL operativa.

## Tareas

| ID | Rol | Estado | Rama | Commit |
|---|---|---|---|---|
| DIR-001 | Director | COMPLETED | `codex/ohmdal-hd2d-preprod-v1-director` | `16df1b5` |
| BENCH-H1-01 A/B | Director | READY | candidatos read-only | — |
| BENCH-H1-02 A/B | Director | BLOCKED por BENCH-H1-01 | candidatos read-only | — |
| BENCH-H2-01 A/B | Director | READY | candidatos read-only | — |
| BENCH-H2-02 A/B | Director | READY | candidatos read-only | — |
| BENCH-H2-03 A/B | Director | READY | candidatos read-only | — |
| DIR-EDU-001 | Director | READY | `codex/ohmdal-hd2d-preprod-v1-director` | — |
| ARCH-001 | Arquitectura | READY | `codex/ohmdal-hd2d-preprod-v1-arquitectura` | — |
| ASSET-001 | Asset Forge | READY | `codex/ohmdal-hd2d-preprod-v1-assets` | — |
| DIR-INT-001 | Director | BLOCKED por dependencias | `codex/ohmdal-hd2d-preprod-v1-director` | — |
| EVAL-001 | Evaluador | BLOCKED por integración | `codex/ohmdal-hd2d-preprod-v1-evaluacion` | — |
| DIR-VERDICT-001 | Director | BLOCKED por evaluación | `codex/ohmdal-hd2d-preprod-v1-director` | — |

## Secuencia inmediata

1. Ejecutar cinco pares A/B con el paquete congelado de `benchmark-plan.md`.
2. Puntuar primero gates y calidad; coste y tiempo sólo desempatan.
3. Elegir routing por tipo de tarea, sin integrar automáticamente salidas candidatas.
4. Arquitectura y Asset Forge trabajan luego en worktrees separados.
5. El Director integra commits secuencialmente y abre un único Evaluador oficial.

## Worktrees preparados

| Rol | Ruta | Rama | Estado inicial |
|---|---|---|---|
| Director | `C:\YO\Worktrees\roxana-hd2d-director` | `codex/ohmdal-hd2d-preprod-v1-director` | creado en `baseCommit` |
| Arquitectura | `C:\YO\Worktrees\roxana-hd2d-arquitectura` | `codex/ohmdal-hd2d-preprod-v1-arquitectura` | creado en `baseCommit` |
| Asset Forge | `C:\YO\Worktrees\roxana-hd2d-assets` | `codex/ohmdal-hd2d-preprod-v1-assets` | creado en `baseCommit` |
| Evaluador | — | `codex/ohmdal-hd2d-preprod-v1-evaluacion` | crear sólo desde commit integrado |

Las dependencias NPM no se duplicaron en los worktrees; cada sesión debe ejecutar `npm install`
antes del baseline si no dispone de un runtime compartido explícito.

## Frenos activos

- Meshy y generación paga: prohibidos.
- H3 y migración de `/jugar`: no autorizados.
- Tercera ronda: requiere nueva aprobación humana.
- Ownership solapado: detener ambos roles y devolver al Director.
