# Selección de variantes después de EVAL-001

**Evaluador:** EVAL-001, único Evaluador del hito

**Commit del veredicto:** `329c9279fcb38fdedaad791844e2d21bb7061073`

**Commit integrado evaluado:** `64e0b92651d5d1d36e6156f7b91fbb8729ad0b57`

**Documento fuente:** `docs/agent-runs/ohmdal-hd2d-preprod-v1/review-round-01.md` en el
commit del veredicto.

EVAL-001 emitió `FAIL` global y recomendó una única ronda correctiva. Esa calificación no aprueba
H3 ni convierte estos prototipos en arte final. Dentro del A/B, congeló las siguientes variantes
para el harness correctivo:

- estudiante de cuatro direcciones: `selected-for-corrective-harness`;
- Ohm sprite/impostor: `selected-for-corrective-harness`.

Las variantes de ocho direcciones y Ohm procedural quedan como
`archived-after-h2-evaluation`: se preservan sus archivos y trazabilidad como evidencia, pero no
deben cargarse en el runtime activo de la ronda correctiva.

La decisión se apoya en la evidencia registrada por EVAL-001: el giro de 135° no mostró una
ventaja visual de ocho direcciones en este prototipo, y Ohm sprite resultó más legible y barato en
el mismo encuadre de Taller. Reabrir cualquiera de estos A/B exige un hito y una comparación nueva;
esta actualización no la autoriza.
