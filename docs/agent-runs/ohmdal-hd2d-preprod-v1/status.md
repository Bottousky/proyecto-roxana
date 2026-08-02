# Estado — Ohmdal HD-2D preproducción v1

**Fase:** implementación H1+H2, ola 1 activa
**Ejecución autorizada:** sí, exclusivamente H1+H2
**Ronda:** 0/2
**Base común:** `12d6f88d2a366da89ed91008013f42ba6295e42d`
**Bloqueo:** ninguno para DIR-EDU-001 y ARCH-001; H3 continúa bloqueado

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
| BENCH-H1-01 A/B | Director | EXECUTED: Codex entregó; Claude 401 | candidatos read-only | evidencia en `content/benchmark` |
| BENCH-H1-02 A/B | Director | EXECUTED: Codex entregó; MiniMax timeout | candidatos read-only | evidencia en `content/benchmark` |
| BENCH-H2-01 A/B | Director | EXECUTED: Codex entregó; MiMo timeout | candidatos read-only | evidencia en `content/benchmark` |
| BENCH-H2-02 A/B | Director | EXECUTED: Codex entregó; North timeout | candidatos read-only | evidencia en `content/benchmark` |
| BENCH-H2-03 A/B | Director | EXECUTED: Codex entregó; MiniMax 429 | candidatos read-only | evidencia en `content/benchmark` |
| DIR-EDU-001 | Director | IN PROGRESS | `codex/ohmdal-hd2d-preprod-v1-director` | — |
| ARCH-001 | Arquitectura | IN PROGRESS | `codex/ohmdal-hd2d-preprod-v1-arquitectura` | — |
| ASSET-001 | Asset Forge | READY | `codex/ohmdal-hd2d-preprod-v1-assets` | — |
| DIR-INT-001 | Director | BLOCKED por dependencias | `codex/ohmdal-hd2d-preprod-v1-director` | — |
| EVAL-001 | Evaluador | BLOCKED por integración | `codex/ohmdal-hd2d-preprod-v1-evaluacion` | — |
| DIR-VERDICT-001 | Director | BLOCKED por evaluación | `codex/ohmdal-hd2d-preprod-v1-director` | — |

## Secuencia inmediata

1. Director ejecuta DIR-EDU-001 en su worktree y corrige los hallazgos B01/B02.
2. Arquitectura ejecuta ARCH-001 en paralelo, con blockout y cámara antes de materiales.
3. Asset Forge inicia ASSET-001 cuando uno de los dos slots quede libre.
4. El Director integra commits secuencialmente y ejecuta DIR-INT-001.
5. Se abre un único Evaluador oficial sobre el estado integrado.

## Pool de modelos operativo

- Codex: control plane, implementación, integración y evaluación.
- Claude Code Pro: disponible por CLI autenticada para revisiones acotadas cuando aporte valor.
- OpenCode: sólo modelos gratuitos y únicamente después de un smoke exitoso del endpoint Zen.
- MiniMax, OpenCode Go y Ollama/Qwen: fuera del pool vigente.

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
