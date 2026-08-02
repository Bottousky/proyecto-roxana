# Estado operativo — Ohmdal Arco I

**Branch:** `codex/ohmdal-arc1-control-plane`
**Workflow:** `STRICT-SERIAL`
**WIP:** 1/1 (`ARC1-001`, gate humano; sin ejecutor de implementación)
**Ejecución autorizada:** no
**Ticket activo:** `ARC1-001 — HUMAN_REVIEW`
**Siguiente:** `ARC1-002 — BLOCKED`

## Estado real

- H1/H2 terminaron `completed-conditional` con veredicto `avanzar`.
- Cámara promovida: casi ortográfica; estudiante: cuatro direcciones; Ohm: sprite.
- `CAM-FIX-001` está implementado y automatizado, pero falta aprobación visual humana.
- Android físico medio 2022 y PWA/Safari continúan `not-run`; no se declaran PASS.
- H3, `/jugar`, Meshy, generación paga y migración permanecen bloqueados.
- El archivo no rastreado `docs/agent-runs/ohmdal-arco1/diseno-bancos-ohm-lumen.md` pertenece al
  usuario y está fuera del ownership de este control; no se modifica ni incorpora automáticamente.

## Diagnóstico de inconsistencias corregidas

- La documentación final estaba en el worktree Director y no visible en el checkout principal.
- Las ramas de control/Director habían divergido; esta rama consolida ambos historiales.
- Los agentes OpenCode seguían atados a H1+H2, A/B 4/8 y ejecución paralela.
- `tasks.json` sólo expresaba primero/último; ahora resume las 62 keys.
- Faltaban protocolo, gates, routing, decisiones y ficha expandida del ticket activo.

## Condición de avance

El usuario revisa `ARC1-001`. Sólo una aprobación explícita permite marcarlo `DONE`. Eso habilita
preparar `ARC1-002`, pero no autoriza H3: el contrato del segundo ticket debe fijar base, ownership,
presupuesto y autorización humana propia.

## Última verificación

- `opencode debug config`: PASS; cargó tres perfiles y cuatro comandos del proyecto.
- Inventario OpenCode: PASS; los tres IDs configurados aparecen en el proveedor gratuito.
- `tasks.json`, `ownership.json` y `asset-manifest.json`: JSON válido.
- Backlog machine-readable: PASS; 62 keys exactas, cadena serial completa y un único ticket no
  bloqueado (`ARC1-001`).
- Enlaces Markdown locales del control plane: PASS.
- `npm run build`: PASS; 185 módulos.
- `npm test`: PASS.
- `npm run 3d:validate-manifests`: PASS.
- `git diff --check`: se ejecuta nuevamente sobre el índice antes del commit.
- `npm run verify`: no ejecutado; `bash.exe` informa que WSL no tiene distribuciones instaladas.
  No se declara PASS.
