# ARC1-003 — Evidencia de congelamiento

**Fecha:** 2026-08-02
**Base:** `b49b617`
**Tipo:** canon, sin cambio de runtime

## Entregables

| Documento | Congela |
|---|---|
| `GOLDEN_FRAMES.md` | 8 encuadres contractuales del slice, estado determinista, parámetros de cámara y criterios de aprobación |
| `IDENTITY.md` | la frase, las seis materias, el tiempo, las cuatro siluetas, 10 reglas verificables y qué NO es Ohmdal |
| `LEGAL_REFERENCES.md` | qué se puede tomar de la referencia, qué no, 10 fuentes oficiales y el checklist de verificación |

## Trazabilidad de los números citados

Los parámetros de cámara de `GOLDEN_FRAMES.md` §3 no son estimados: salen de
`evidence/ARC1-001/metrics.json`, medido sobre los módulos reales.

| Dato citado | Origen |
|---|---|
| C1 13,5 m desktop / 20,0 m mobile | `viewportProfiles` |
| C2 9,0 m / 14,5 m | `viewportProfiles` |
| C3 12,0 m / 18,0 m | `viewportProfiles` |
| umbrales −3,0 y 9,5 con histéresis 0,75 m | `anchorHysteresis` |
| zona muerta 16 % / 10 % / 4 % | `followDeadZone` + `CAMERA_FOLLOW_DEAD_ZONE` |
| duraciones 0,90 s y 1,10 s | `anchorHysteresis.durationSeconds` |

Rutas R0…R9 verificadas contra `src/labs/ohmdal-hd2d-preprod/architecture/levelData.ts` líneas
107-116.

## Decisión de diseño registrada

Cada golden frame tiene **dos** contratos, no uno:

- **contrato de lectura** — verificable en una captura;
- **contrato de recorrido** — verificable sólo jugando.

El motivo es directo de doc. 15: lo que no se debe imitar de DQIII es «aprobar planta por captura
estática», y la escala «se decide jugando». Un frame aprobado sólo por screenshot sería exactamente
el error que la referencia enseña a evitar.

## Estado de captura — declarado

| Frame | Captura | Nota |
|---|---|---|
| GF-01 | existe | blockout, commit `8784206`, desktop + narrow + mobile |
| GF-02 … GF-08 | **no capturados** | especificados; cada ticket de escena resuelve la suya |

En esta sesión el panel de navegador no compone frames, así que no se generaron capturas nuevas. Se
declara en vez de simularse.

## Gates

- `npm run build`: PASS
- `npm test`: PASS
- `npm run 3d:validate-manifests`: PASS
- `git diff --check`: PASS
- diff dentro del ownership `v3`: sí
- `npm run verify`: `not-run` (WSL sin distribución)

## Sin gate humano obligatorio

No hubo cambio visible. El Director puede objetar el contenido congelado cuando quiera; hacerlo
genera una decisión `CP-0NN` nueva, no una reapertura de este ticket.
