# Hallazgos abiertos

Dónde aterrizan los problemas que un ejecutor **descubre pero no le corresponde arreglar**. Sin
este archivo, la regla «no arregles lo ajeno al paquete» no tiene destino y el builder termina
arreglándolo igual, inflando el diff y rompiendo el ownership.

## Regla

1. El ejecutor **registra** el hallazgo acá. No lo modifica.
2. Si no bloquea el paquete activo, continúa.
3. Si lo bloquea, el paquete termina en `BLOCKED` y no se improvisa una solución.
4. Convertir un `OI` en ticket es decisión del Director, nunca del ejecutor (`CP-002`).
5. Un `OI` sin destino asignado no autoriza trabajo.

Esto no reemplaza a `DECISIONS.md`: allí van decisiones tomadas, acá problemas sin dueño.

## Severidad

| Nivel | Significado | Efecto sobre el paquete |
|---|---|---|
| `P0` | rompe el build, el runtime o impide usar lo entregado | bloquea |
| `P1` | incumple el objetivo del paquete o del ticket | bloquea |
| `P2` | defecto aceptable, va a otro ticket | no bloquea |
| `nota` | observación no accionable todavía | no bloquea |

## Registro

| ID | Fecha | Descubierto en | Hallazgo | Sev. | ¿Bloquea? | Destino |
|---|---|---|---|---|---|---|
| OI-001 | 2026-08-02 | `CP-016` | `ownership.json` quedó en `ARC1-003`: su `activeIssueKey` apunta al ticket ya cerrado y `protected` incluye `tickets/ARC1-004.md`, que es el que hay que escribir | P1 | sí, para `ARC1-004` | Director, antes de `/arc-plan ARC1-004` |

Formato del ID: `OI-001`, `OI-002`… correlativo, nunca se reutiliza.
`Descubierto en` es el paquete o ticket exacto (`ARC1-011-C`), no «durante el desarrollo».
`Destino` es un ticket del backlog, `DECISIONS.md`, o `sin asignar` hasta que el Director decida.

## Ya registrados fuera de este archivo

Estos preceden a la creación del registro y siguen vivos en su lugar de origen. No se duplican:

| Referencia | Qué | Dónde vive |
|---|---|---|
| `CP-011` | equivalencia de cámara con *DQ3 HD-2D Remake* sin verificar | `DECISIONS.md`, se re-evalúa en `ARC1-024` y `ARC1-030` |
| `CP-012` | layout/HUD mobile: recorte, franja comprimida, D-pad encima | `DECISIONS.md`, deuda P2 hacia `ARC1-026` |
| `CP-014` | Android físico medio 2022 `not-run` | `DECISIONS.md`, resuelve `ARC1-060` |
| — | `npm run verify` `not-run`, WSL sin distribución | `STATE.md` |
