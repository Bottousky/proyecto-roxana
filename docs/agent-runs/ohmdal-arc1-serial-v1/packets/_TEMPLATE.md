# `ARC1-NNN-X` — <título del paquete>

**Ticket:** `ARC1-NNN` — <título del ticket>
**Ruta de modelo:** `<rol de MODEL_ROUTING.md>`
**Estado:** `READY` | `ACTIVE` | `TECH_REVIEW` | `HUMAN_REVIEW` | `BLOCKED` | `FAILED` | `DONE`
**Gate humano:** sí | no
**Presupuesto:** 1 implementación + 1 corrección
**Estimación:** <30–90> min
**Effort:** low | medium | high

## Objetivo

Una frase. Qué artefacto observable existe al terminar que no existía al empezar.

## Terminado cuando

- <criterio verificable>
- <criterio verificable>
- existe evidencia según la sección `Evidencia`;
- `npm run build` PASS;
- `npm test` PASS;
- `git diff --check` PASS.

Cada criterio se responde con un comando, una captura o una medición. Un criterio que sólo se
puede responder con una opinión va al gate humano, no acá.

## Permitido

```text
<glob>/**
docs/agent-runs/ohmdal-arc1-serial-v1/evidence/ARC1-NNN/X/**
```

## Prohibido

```text
src/jugar/**
<lo que corresponda del bloque `prohibited` de tasks.json>
<tickets vecinos>
```

## Ejecución

Una estrategia técnica. Una implementación. Sin loop autónomo. Si la primera estrategia no es
viable, detenerse y reportar — no probar la segunda en la misma sesión.

## Detenerse cuando

- el artefacto evaluable existe;
- aparece una contradicción con el canon congelado;
- haría falta modificar algo fuera de `Permitido`;
- la primera estrategia no resulta viable;
- se agotó el presupuesto de rondas.

## Evidencia

```text
evidence/ARC1-NNN/X/
  commands.md
  desktop-1440x900.png
  mobile-390x844.png
  console.txt
  metrics.json
```

Lo no medido se declara `not-run`. Nunca se presenta como PASS.

## Registro al cerrar

Emitir un record en `telemetry.json` por cada fase ejecutada (`plan`, `build`, `review`, `fix`).
