# Auditoría de insumos de DIR-EDU-001

**Fecha de lectura:** 2026-08-02
**Control plane vigente leído desde:**
`C:\YO\Proyectos\Roxana claude\docs\agent-runs\ohmdal-hd2d-preprod-v1\`

Los borradores del benchmark no estaban versionados en este worktree aislado. Para que la
trazabilidad no dependa de enlaces Markdown rotos, se registra la ruta de autoridad y el SHA-256
observado, sin copiar las candidatas ciegamente.

| Insumo | SHA-256 |
|---|---|
| `content/benchmark/benchmark-summary.md` | `4D641A536B7460EF703C874EF10CEF981D0979AD1E3312CFDFD5F346F720EC54` |
| `content/benchmark/candidates/B01/codex.md` | `5BA0516080644913E0313F10F75D2774DD1B36FEB6BA4C9C67F39DCC5C032B32` |
| `content/benchmark/candidates/B02/codex.md` | `29B9D607A2351AE3CD17DFFC6F8E24DC0693C404CF1AB55D629FBA3C7B67A483` |

## Hallazgos reproducidos y resolución

1. **B01, fuentes relativas rotas.** Las únicas referencias Markdown del entregable apuntan a
   [`cards.ts`](../../../../../src/labs/ohmdal-hd2d-preprod/education/cards.ts), a la
   [Biblia educativa](../../../../ohmdal-biblia/02_EDUCATIONAL_CONTENT_BIBLE.md) y al
   [vertical slice](../../../../ohmdal-biblia/10_VERTICAL_SLICE.md); las tres rutas resuelven desde
   este archivo.
2. **B01, precondiciones incompletas de T05.** El instrumento conserva un solver puro, pero la
   actividad usa `measureVirtualWithDiagnosis`: exige inspección, hipótesis, configuración,
   estado energético coincidente, medición activa y evidencia antes de interpretar
   `REF−REF=0,00 V`. El test también prueba el rechazo sin workflow.
3. **B02, corriente presentada como medición.** La ficha de circuito y la Bitácora dicen
   “calculé `20,00 mA`”. El instrumento no ofrece modo de corriente.
4. **B02, códigos confundibles.** El modelo y los tests separan fuera de rango, apertura,
   configuración incompleta, punto inexistente, magnitud incompatible y estado no medible.

## Fuentes primarias e institucionales

- [Escuela Técnica Otto Krause — Primer Ciclo](https://www.ottokrause.edu.ar/primer-ciclo/):
  autoridad institucional para el marco de Taller del ciclo básico.
- [Escuela Técnica Otto Krause — Electrónica](https://www.ottokrause.edu.ar/electronica/):
  autoridad institucional para la especialidad, Circuitos Electrónicos y Laboratorio de Mediciones.
- [Resolución CFE 15/07, Anexo III — Electrónica](https://www.inet.edu.ar/wp-content/uploads/2013/04/15-07-anexo03.pdf):
  marco primario para mediciones, instrumental, detección de fallas, documentación técnica y
  seguridad. Ver especialmente pp. 3–7 y trayectoria formativa desde p. 9.

Estas fuentes respaldan el alcance educativo, no los parámetros del simulador. `5 V`, resistores
de `100/150 ohm`, umbral `300 ohm`, rangos, resoluciones, órdenes aceptados, cuatro bloques de
Bitácora y telemetría son reglas didácticas candidatas de Ohmdal y se validan por cálculos/tests;
no se atribuyen a Otto Krause ni al CFE.

## Fuentes canónicas internas usadas

- [Biblia de contenido educativo](../../../../ohmdal-biblia/02_EDUCATIONAL_CONTENT_BIBLE.md):
  doctrina, 30 campos, Bitácora, telemetría y escala V1–V2.
- [Vertical slice](../../../../ohmdal-biblia/10_VERTICAL_SLICE.md): diagnóstico de Lumen,
  transferencia en la Puerta, error recuperable y varios órdenes válidos.
- [Backlog H1](../../../../ohmdal-biblia/11_PRODUCTION_BACKLOG.md): límites H1.1–H1.7 y segundo
  pase obligatorio.

La revisión independiente del 2026-08-02 consultó las fuentes institucionales anteriores. No se
modeló una práctica física real: todo el circuito permanece ficticio, aislado y simulado.
