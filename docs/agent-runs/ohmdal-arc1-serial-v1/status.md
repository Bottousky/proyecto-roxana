# Estado — Ohmdal Arco I serie

**Estado:** planificación preparada; ejecución no autorizada

**WIP:** 0/1

**Ticket actual:** `ARC1-001 — HUMAN_REVIEW`

**Siguiente:** `ARC1-002 — BLOCKED`

## Condición para avanzar

El usuario debe aprobar visualmente la corrección de cámara registrada en
`docs/agent-runs/ohmdal-hd2d-preprod-v1/evidence/camera-correction/`. Sólo entonces el Director
puede marcar `ARC1-001` como `DONE`. Marcarlo `DONE` no autoriza automáticamente H3: permite
preparar `ARC1-002`, cuyo contrato deberá registrar autorización explícita por separado.

## Reglas activas

- WIP global uno; ningún trabajo anticipado del sucesor.
- Un `not-run`, `CONDITIONAL` o implementación sin revisión humana no es `DONE`.
- Los paquetes de agentes duran 30–90 minutos y pertenecen exclusivamente al ticket activo.
- `/jugar`, Meshy, generación paga y producción masiva permanecen bloqueados.

## Validación de este control

- Investigación: fuentes primarias oficiales registradas y hechos separados de inferencias.
- Cadena Jira: PASS, 62 keys continuas de `ARC1-001` a `ARC1-062`.
- JSON/TOML: PASS.
- Enlaces Markdown internos de la Biblia: PASS.
- `npm run build`: PASS, 185 módulos.
- `npm test`: PASS.
- `npm run 3d:validate-manifests`: PASS.
- `git diff --check`: PASS.
- Cambios en `src/**`, `assets/**`, `tests/**` o paquetes: ninguno.
- `npm run verify`: `not-run`; no hay distribución WSL operativa y no se declara PASS.
