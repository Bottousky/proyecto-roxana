# ARC1-001 — Gate humano: veredicto

**Fecha:** 2026-08-02
**Decide:** Director (Manuel)
**Veredicto:** aprobado — avanzar

## Texto del veredicto

> «El resize está corregido como lo esperaba, pero no sé si la cámara es la misma que DRAGON QUEST III
> HD-2D REMAKE. Avancemos y veamos cómo evoluciona Ohmdal.»

## Respuesta a las cinco preguntas

| # | Pregunta | Respuesta | Base |
|---|---|---|---|
| 1 | ¿Conserva proporciones al redimensionar? | **Sí** | Distorsión 0.0e+0 en cinco viewports; confirmado por el Director |
| 2 | ¿Queda quieta en movimientos chicos? | **Sí** | Zona muerta medida eje por eje; corrección == excedente |
| 3 | ¿C1/C2/C3 se sienten intencionales? | **Sí** | Un cambio por cruce; jitter de ±0.30 m no agrega cambios |
| 4 | ¿Desktop angosto y mobile conservan legibilidad? | **Sí, con reserva** | Recorte limpio; ver deuda de layout mobile abajo |
| 5 | ¿Aprobar, corregir o descartar? | **Aprobar y avanzar** | Veredicto explícito del Director |

## Reserva abierta: referencia de calidad DQ3 HD-2D Remake

El Director aprueba la corrección de resize pero **no confirma** que el lenguaje de cámara iguale al
de *Dragon Quest III HD-2D Remake*, y decide resolverlo por evolución en vez de bloquear acá.

Esto **no** es un P0/P1 sobre `CAM-FIX-001`: lo medido cumple su contrato. Es una pregunta de
dirección artística que queda abierta y debe re-evaluarse cuando el slice tenga materiales, luz,
profundidad de campo y VFX —hoy es un greybox sin ninguno de esos elementos, así que la comparación
con DQ3 todavía no es justa—. Registrada como `CP-010`.

Cuándo re-evaluar: `ARC1-024` (materiales, luz, DOF, agua y VFX) y `ARC1-030` (playtest y promoción
V2-V3). Si ahí la cámara no sostiene la referencia, se abre un ticket propio de corrección; no se
reabre `ARC1-001`.

## Deuda registrada, fuera de alcance de este ticket

Layout/HUD en `mobile-390x844`, observado en
`docs/agent-runs/ohmdal-hd2d-preprod-v1/evidence/camera-correction/mobile-390x844.png`:

1. el panel superior recorta el botón «Recorrido automático»;
2. la franja jugable queda comprimida entre el panel superior y la tarjeta de diagnóstico, y el
   sujeto se lee chico;
3. el D-pad se superpone a la zona del panel de estado.

Es chrome de DOM, no proyección de cámara: la proyección mobile es correcta (amplía el alto visible
en vez de estirar). Corresponde al baseline de accesibilidad/UX (`ARC1-026`), no a `ARC1-001`.

## Clasificación

- **P0:** ninguno.
- **P1:** ninguno.
- **P2:** layout/HUD mobile (arriba). No habilita ampliar el alcance de este ticket.
- **Sugerencia:** re-tomar capturas en vivo cuando el panel del navegador componga frames, para no
  depender de evidencia histórica en los tickets visuales que siguen.

## Gates de cierre

- objetivo y criterios satisfechos: **sí**;
- diff dentro de ownership: **sí** (sólo `STATE.md`, `tasks.json`, `DECISIONS.md` y
  `evidence/ARC1-001/**`);
- build, tests, manifests y `git diff --check`: **PASS**;
- cero P0/P1 abiertos: **sí**;
- evidencia reproducible almacenada: **sí** (`commands.md`, `metrics.json`, este archivo);
- aprobación humana de cambio visible: **sí**;
- `npm run verify`: **not-run** declarado, no PASS.
