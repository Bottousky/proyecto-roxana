# Estado — Ohmdal HD-2D preproducción v1

**Fase:** EVAL-001 sobre integración H1+H2
**Ejecución autorizada:** sí, exclusivamente H1+H2
**Rondas automáticas usadas:** 2/2 educativas; 1 corrección visual de Arquitectura
**Base común:** `12d6f88d2a366da89ed91008013f42ba6295e42d`
**Commit integrado evaluado:** `64e0b92`
**Bloqueo:** H3, Meshy, generación paga y `src/jugar/**` continúan bloqueados

## Resultado integrado previo a evaluación

- Seis fichas educativas con exactamente 30 campos: **V2 `CANON-EDU`** después de auditoría
  independiente y dos rondas correctivas.
- Blockout modular Portal–Plaza–Taller–Puerta/Manantial, navegación plana y cámaras A/B.
- Prototipos originales A/B de estudiante 4/8 direcciones y Ohm sprite/procedural.
- Harness determinista en `/labs/ohmdal-hd2d-preprod/` con teclado, táctil, reduced motion,
  tarde/crepúsculo, diagnóstico protegido y `render_game_to_text`.
- Corrección visual de oclusión: los pilares de Puerta usan fade; el landmark principal permanece.
- Evidencia local Director en 1440×900 y 390×844: consola sin errores; capturas bajo
  `output/playwright/ohmdal-hd2d-preprod/` (salida ignorada, no versionada).
- Métricas observadas del blockout en los estados capturados: 11–20 draw calls, 150–296
  triángulos, 18–23 geometrías y 2–4 texturas. No equivalen a medición Android física.

## Tareas

| ID | Estado | Commit(s) |
|---|---|---|
| DIR-001 | COMPLETED | `16df1b5` |
| DIR-EDU-001 | COMPLETED | `585c302`, `697d23d`, `42c1262`, `64e0b92` |
| ARCH-001 | COMPLETED | `b4b15cf`, corrección `f89b75b` |
| ASSET-001 | COMPLETED | `1908e67` |
| DIR-INT-001 | COMPLETED | `64e0b92` |
| EVAL-001 | IN PROGRESS | worktree `codex/ohmdal-hd2d-preprod-v1-evaluacion` |
| DIR-VERDICT-001 | BLOCKED por EVAL-001 | — |

## Gates del Director

- `npm run build`: PASS, 185 módulos.
- `npm test`: PASS.
- `npm run 3d:validate-manifests`: PASS.
- `git diff --check`: PASS.
- Navegador Chrome/Playwright desktop y mobile: PASS funcional; consola 0 errores/0 warnings.
- `npm run verify`: no ejecutado; Windows no tiene una distribución WSL operativa. No se
  declara PASS.
- Android físico de 2022: no probado; cualquier FPS asociado permanece `null`.

## Pool de modelos operativo

- Codex: control plane, implementación, integración y evaluación.
- Claude Code Pro: CLI autenticada disponible para revisiones acotadas.
- OpenCode: sólo modelos gratuitos y después de un smoke exitoso; la web puede estar bloqueada
  por el proveedor de internet sin demostrar que la CLI esté caída.
- MiniMax, OpenCode Go, Ollama/Qwen, créditos API medidos y Meshy: fuera del pool vigente.

## Próximo cierre automático

1. El Evaluador registra `review-round-01.md` y `performance.json` sin corregir código.
2. El Director integra ese commit y emite `avanzar`, `corregir una vez` o `descartar`.
3. H3 no cambia de estado sin veredicto favorable y autorización humana correspondiente.
