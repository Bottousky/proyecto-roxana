# Capa de paquetes

Un ticket describe **qué queda cerrado**. Un paquete describe **qué cabe en una sesión**. Son cosas
distintas y hasta ahora sólo existía la primera: por eso un ticket como `ARC1-011` produce sesiones
de tres horas sin punto de evaluación.

## Regla base

| Concepto | Unidad | Duración | Sesión |
|---|---|---|---|
| Ticket `ARC1-NNN` | resultado cerrado del backlog | 0,5–2 días | varias |
| Paquete `ARC1-NNN-X` | un artefacto observable | 30–90 min | **una, nueva** |

La duración no se repite acá: la fija `workflow.internalTaskMinutes` en `tasks.json`.

`X` es `A`, `B`, `C`… en orden serial. WIP de paquetes = 1, igual que el de tickets.

## Cuándo se subdivide

Se subdivide si se cumple **cualquiera** de estas condiciones, evaluadas en `/arc-plan`:

1. el plan tiene más de 10 pasos;
2. la estimación supera 90 min;
3. el ticket toca más de un `owner` de `ownership.json`;
4. el ticket mezcla decidir (medidas, canon, criterios) con implementar.

Si no se cumple ninguna, el ticket ejecuta como **paquete único `A`** y no se crea carpeta aparte:
la ficha del ticket ya es el contrato.

Un plan de 10–20 puntos para un solo paquete es señal de que el paquete todavía es demasiado grande.
No se ejecuta: se vuelve a subdividir.

## Cuándo se escriben

Sólo cuando el ticket pasa a activo. **No se preparan paquetes de tickets futuros.** El paquete
activo se escribe completo; del siguiente sólo se registra el título tentativo. Para cuando se
llegue a `ARC1-056`, el pipeline habrá cambiado y esos contratos estarían mal.

## Contrato de un paquete

Se usa [`packets/_TEMPLATE.md`](packets/_TEMPLATE.md). Siete secciones, ninguna opcional:

`Objetivo` · `Terminado cuando` · `Permitido` · `Prohibido` · `Ejecución` · `Detenerse cuando` ·
`Evidencia`.

`Permitido` y `Prohibido` se expresan como rutas glob, derivadas de `ownership.json`. Si el builder
necesita tocar algo fuera de `Permitido`, no lo toca: se detiene.

## Límites de ejecución

- **Una sola hipótesis técnica por paquete.** «Voy a probar cinco arquitecturas y elegir la mejor»
  no es un paquete, es un ticket de investigación aparte.
- **Primer artefacto temprano.** En un paquete visual, si al llegar al primer tercio del tiempo
  todavía no existe algo observable, el builder se detiene y explica el bloqueo. No sigue montando
  infraestructura.
- **Rondas.** Máximo 2 por paquete y **máximo 4 por ticket**. La capa de paquetes no puede usarse
  para multiplicar el presupuesto de correcciones que fija `EXECUTION_PROTOCOL.md` §D.
- **Descubrimientos ajenos.** No se arreglan. Se registran en [`OPEN_ISSUES.md`](OPEN_ISSUES.md).

## Frontera de sesión

Regla dura: **una sesión nueva por cada fase de cada paquete.** Nunca se continúa un paquete en la
sesión que produjo el anterior; el contexto arrastra supuestos y decisiones descartadas.

```text
ARC1-011-C-PLAN     sesión nueva   agente plan, read-only
ARC1-011-C-BUILD    sesión nueva   ruta de MODEL_ROUTING.md
ARC1-011-C-REVIEW   sesión nueva   modelo distinto del builder, read-only
ARC1-011-C-FIX      sesión nueva   sólo si hay P0/P1 o rechazo humano
```

El nombre de la sesión es literal: así queda trazable contra `telemetry.json`.

## Estados de cierre

Un paquete termina siempre en uno de estos, y sólo en uno:

`TECH_REVIEW` · `HUMAN_REVIEW` · `BLOCKED` · `FAILED` · `DONE`

No existe «sigo puliendo», «mejoro algunas cosas más» ni «queda trabajando». Cerrar el paquete
implica emitir su registro en [`telemetry.json`](telemetry.json).

Un ticket pasa a `DONE` cuando todos sus paquetes están `DONE` y sus gates de
`ACCEPTANCE_GATES.md` están cubiertos. El commit se hace a nivel de ticket, no de paquete.

## Estructura

```text
packets/
  ARC1-011/
    ARC1-011-A.md      DONE
    ARC1-011-B.md      DONE
    ARC1-011-C.md      ACTIVE
```

Sin carpetas de tickets que no estén activos.
