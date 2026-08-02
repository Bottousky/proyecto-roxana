# ARC1-002 — Autorización de H3

**Fecha:** 2026-08-02
**Decide:** Director (Manuel)
**Base propuesta y aceptada:** `b49b617`

## Respuestas

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿H3 con `baseCommit = b49b617`, presupuesto y ownership tal como se redactaron? | **Sí, tal como está** |
| 2 | Android físico medio 2022 | **Opción B** — diferir a `ARC1-060`, todo claim mobile `not-run` |
| 3 | Presupuesto de §5, Meshy y generación paga en cero | Confirmado dentro de la respuesta 1 |
| 4 | Ownership de §4, `src/jugar/**` protegido | Confirmado dentro de la respuesta 1 |

## Estado aplicado

| Campo | Antes | Después |
|---|---|---|
| `executionAuthorized` | `false` | `true` |
| `baseCommit` | `null` | `b49b617` |
| `activeIssueKey` | `ARC1-002` | `ARC1-003` |
| `ARC1-002` | `READY` | `DONE` |
| `ARC1-003` | `BLOCKED` | `READY` |

Decisiones registradas: `CP-013`, `CP-014`.

## Qué NO habilitó esta autorización

Del §3 del contrato, sigue prohibido sin decisión nueva:

1. `src/jugar/**` y migración del runtime estable;
2. migración del save o del formato de progreso;
3. Meshy y generación paga — presupuesto cero;
4. producción masiva de assets o apertura de lotes;
5. dependencias npm nuevas;
6. regiones fuera del slice: Cuenca, Castillo, Forja-Terrazas, Faro-Lago;
7. `push`, `reset`, `rebase` o reescritura de historia;
8. `docs/agent-runs/ohmdal-arco1/**`;
9. copiar IP de Dragon Quest: paleta, composición, UI, personajes o mapas.

La autorización es de **alcance**, no de resultado. Cada ticket conserva sus gates automáticos, su
evidencia reproducible y su aprobación humana cuando el cambio sea visible.

## Gates del ticket

- `npm run build`: PASS
- `npm test`: PASS
- `npm run 3d:validate-manifests`: PASS
- `git diff --check`: PASS
- diff dentro del ownership declarado en `ownership.json` v2: sí
- `npm run verify`: `not-run` (WSL sin distribución); no se declara PASS

## Nota

`ARC1-002` no produjo cambio visible, así que no requirió evidencia desktop/mobile. El único gate
humano era la autorización, y está registrada arriba.
