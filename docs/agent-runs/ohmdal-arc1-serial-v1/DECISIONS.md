# Decisiones del control plane

| ID | Fecha | Decisión | Consecuencia |
|---|---|---|---|
| CP-001 | 2026-08-02 | Arco I usa `STRICT-SERIAL`, WIP 1 | Ningún sucesor antes de `DONE` |
| CP-002 | 2026-08-02 | Sólo el Director cambia estados | Modelos recomiendan; no promueven por sí solos |
| CP-003 | 2026-08-02 | Gate humano para cambios visibles | Reviewer auxiliar no decide calidad final |
| CP-004 | 2026-08-02 | Cámara casi ortográfica, 4 direcciones y Ohm sprite | Variantes H2 perdedoras quedan archivadas |
| CP-005 | 2026-08-02 | H3 y producción siguen sin autorización | `executionAuthorized=false`, `baseCommit=null` |
| CP-006 | 2026-08-02 | OpenCode ejecuta un ticket por ciclo | Se retiran agentes H1/H2 y se crean plan/builder/reviewer |
| CP-007 | 2026-08-02 | Routing basado en inventario local, no fama | Kimi no se configura hasta aparecer con ID real |
| CP-008 | 2026-08-02 | Assets pasan gates modulares y de procedencia | Meshy/generación paga presupuesto cero |
| CP-009 | 2026-08-02 | Esta rama consolida control y Director | No copiar archivos manualmente entre worktrees |
| CP-010 | 2026-08-02 | `ARC1-001` aprobado: la cámara corregida se acepta y el Arco I avanza | `ARC1-001` pasa a `DONE`; `ARC1-002` pasa a `READY` |
| CP-011 | 2026-08-02 | La equivalencia con *DQ3 HD-2D Remake* queda abierta, no bloqueante | Se re-evalúa en `ARC1-024` y `ARC1-030`, con materiales y luz presentes; no se reabre `ARC1-001` |
| CP-012 | 2026-08-02 | El layout/HUD mobile es deuda P2, no defecto de cámara | Se atiende en `ARC1-026`; no amplía el alcance de `ARC1-001` |
| CP-013 | 2026-08-02 | **H3 autorizado** con `baseCommit = b49b617` | `executionAuthorized = true`; `ARC1-003` pasa a `READY` |
| CP-014 | 2026-08-02 | Android físico diferido a `ARC1-060` (opción B) | Todo claim de rendimiento en Android físico es `not-run` hasta el QA de release |
| CP-015 | 2026-08-02 | Golden frames, identidad y límites legales **congelados** | Un ticket de escena no puede redefinirlos para que su resultado pase |

Una decisión nueva agrega `CP-016+`, motivo, evidencia, impacto y si requiere autorización o ADR.

## CP-015 — Canon visual congelado

**Motivo.** Doc. 15 registra que en DQIII la identidad precede al efecto, y que lo que no se debe
imitar es «aprobar planta por captura estática». Congelar los contratos de lectura antes de producir
arte evita construirlo alrededor de una escala o una cámara todavía inestables.

**Evidencia.** `GOLDEN_FRAMES.md`, `IDENTITY.md`, `LEGAL_REFERENCES.md` y
`evidence/ARC1-003/freeze.md`. Los parámetros de cámara citados salen de
`evidence/ARC1-001/metrics.json`; las rutas R0…R9 de `architecture/levelData.ts:107-116`.

**Impacto.** Cada golden frame tiene **dos** contratos: uno de lectura, verificable en captura, y uno
de recorrido, verificable sólo jugando. Un frame aprobado sólo por screenshot no está aprobado.

«Identidad propia / legal» es el único criterio de la quality bar que exige **5/5**; un fallo ahí es
P0 y bloquea el ticket sin importar la calidad visual alcanzada.

Sólo GF-01 tiene capturas reales, de blockout. GF-02 … GF-08 quedan especificados y **no capturados**;
se declara en vez de simularse. Ningún ticket puede inferir el resultado visual de un frame que no
capturó.

Enmendar cualquiera de los tres documentos requiere una decisión `CP-0NN` propia.

## CP-013 — Autorización de H3

**Motivo.** El usuario autorizó explícitamente el contrato `H3_CONTRACT.md` con las cuatro respuestas
que el propio contrato exigía: base en `b49b617`, presupuesto de §5, ownership de §4 y opción B de
Android.

**Evidencia.** `H3_CONTRACT.md` §8 y `evidence/ARC1-002/authorization.md`. Precondición de doc. 15
cumplida: `ARC1-001` quedó `DONE` en `b49b617` antes de autorizar.

**Impacto.** `executionAuthorized` pasa a `true` y `baseCommit` se congela en `b49b617`. Habilita la
cadena `ARC1-003` … `ARC1-035`. **No** levanta ninguna prohibición del §3: `src/jugar/**`, migración
de runtime, Meshy, generación paga, dependencias nuevas, regiones fuera del slice y la IP de Dragon
Quest siguen prohibidos.

La autorización es de alcance, no de resultado. Cada ticket conserva sus gates, su evidencia y su
aprobación humana cuando el cambio sea visible.

## CP-014 — Android físico diferido

**Motivo.** El informe final de H1/H2 condiciona H3 a medir en Android físico antes de reclamar
30 fps. No hay dispositivo medio de 2022 en este entorno. El usuario eligió avanzar difiriendo la
medición en vez de declarar un PASS emulado.

**Evidencia.** `docs/agent-runs/ohmdal-hd2d-preprod-v1/final-report.md` líneas 20-22 y 84-85.

**Impacto.** `ARC1-028` y `ARC1-029` miden desktop y mobile **emulado** únicamente. Ningún ticket
puede declarar PASS de rendimiento en Android físico antes de `ARC1-060`; el que lo necesite lo
declara `not-run` y continúa. Si aparece un dispositivo antes, se puede adelantar la medición sin
cambiar esta decisión.

## CP-010 — Aprobación de `ARC1-001`

**Motivo.** El Director emitió veredicto explícito: «El resize está corregido como lo esperaba […]
Avancemos y veamos cómo evoluciona Ohmdal».

**Evidencia.** `evidence/ARC1-001/commands.md`, `metrics.json` y `review.md`. Distorsión 0.0e+0 en
cinco viewports; zona muerta que corrige exactamente el excedente; un solo cambio de anclaje por
cruce con jitter de ±0.30 m absorbido por la histéresis. Build, tests, manifests y `git diff --check`
PASS sobre `73fecae`.

**Impacto.** Habilita preparar `ARC1-002`. No autoriza H3 ni ninguna implementación:
`executionAuthorized` sigue en `false` hasta que el contrato de `ARC1-002` fije base, ownership,
presupuesto y autorización humana propia.

## CP-011 — Referencia DQ3 HD-2D pendiente de verificación

**Motivo.** El Director aprueba el comportamiento medido pero no confirma que el lenguaje de cámara
iguale la referencia de calidad. Decide resolverlo por evolución antes que bloquear.

**Evidencia.** El slice es hoy un greybox sin materiales, iluminación dirigida, profundidad de campo
ni VFX; los tres elementos que definen el look HD-2D. La comparación todavía no es justa.

**Impacto.** No es P0/P1 y no reabre `CAM-FIX-001`. Se re-evalúa en `ARC1-024` y `ARC1-030`. Si ahí
la cámara no sostiene la referencia, se abre un ticket de corrección propio.

## CP-012 — Layout/HUD mobile como deuda

**Motivo.** En `mobile-390x844` el panel superior recorta «Recorrido automático», la franja jugable
queda comprimida entre el panel y la tarjeta de diagnóstico, y el D-pad pisa el panel de estado.

**Evidencia.** `docs/agent-runs/ohmdal-hd2d-preprod-v1/evidence/camera-correction/mobile-390x844.png`.

**Impacto.** Es chrome de DOM, no proyección: la cámara mobile amplía el alto visible en vez de
estirar. Se atiende en `ARC1-026` (baseline de accesibilidad). No requiere autorización ni ADR.
