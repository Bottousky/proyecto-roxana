# Estado operativo — Ohmdal Arco I

**Branch:** `codex/ohmdal-arc1-control-plane`
**Workflow:** `STRICT-SERIAL`
**WIP:** 1/1 (`ARC1-002`, redacción de contrato; sin ejecutor de implementación)
**Ejecución autorizada:** no
**Ticket activo:** `ARC1-002 — READY`
**Anterior:** `ARC1-001 — DONE` (aprobado 2026-08-02)
**Siguiente:** `ARC1-003 — BLOCKED`

## Estado real

- `ARC1-001` cerrado con veredicto humano explícito: aprobar y avanzar (`CP-010`).
- `CAM-FIX-001` queda aceptado: distorsión 0.0e+0 en cinco viewports, zona muerta que corrige
  exactamente el excedente, un solo cambio de anclaje por cruce con jitter de ±0.30 m absorbido.
- La equivalencia con *DQ3 HD-2D Remake* queda **abierta y no bloqueante** (`CP-011`). Se re-evalúa
  en `ARC1-024` y `ARC1-030`, cuando existan materiales, luz, DOF y VFX.
- El layout/HUD mobile es deuda P2 (`CP-012`), atendida en `ARC1-026`; no es defecto de cámara.
- H1/H2 terminaron `completed-conditional` con veredicto `avanzar`.
- Cámara promovida: casi ortográfica; estudiante: cuatro direcciones; Ohm: sprite.
- Android físico medio 2022 y PWA/Safari continúan `not-run`; no se declaran PASS.
- H3, `/jugar`, Meshy, generación paga y migración permanecen bloqueados: `ARC1-002` debe fijar base,
  ownership, presupuesto y autorización humana propia antes de habilitar nada.
- El archivo no rastreado `docs/agent-runs/ohmdal-arco1/diseno-bancos-ohm-lumen.md` pertenece al
  usuario y está fuera del ownership de este control; no se modifica ni incorpora automáticamente.

## Condición de avance

`ARC1-002` redacta el contrato de H3 pero **no lo autoriza**. `executionAuthorized` sigue en `false`
y `baseCommit` en `null` hasta que el usuario apruebe explícitamente ese contrato. Recién entonces
`ARC1-003` puede pasar a `READY`.

## Última verificación

Sobre `73fecae`, 2026-08-02:

- `npm run build`: PASS, `✓ built in 7.48s`.
- `npm test`: PASS, `ℹ fail 0`.
- `npm run 3d:validate-manifests`: PASS, 5 manifests.
- `git diff --check`: PASS.
- Harness en vivo en `http://localhost:5199/labs/ohmdal-hd2d-preprod/`: consola 0 errores/0 warnings;
  `render_game_to_text()` reporta `quasi-orthographic`, `4 direcciones`, `Ohm sprite`, sin oclusores
  bloqueados.
- Medición determinista de cámara: registrada en `evidence/ARC1-001/metrics.json`.
- `tasks.json`, `ownership.json` y `asset-manifest.json`: JSON válido.
- Backlog machine-readable: 62 keys exactas, cadena serial completa.
- `npm run verify`: **not-run**; `bash.exe` informa que WSL no tiene distribuciones instaladas. No se
  declara PASS.
- Captura en vivo del navegador: **not-run**; el panel no compone frames. Se usó la evidencia ya
  versionada de `camera-correction/`.
