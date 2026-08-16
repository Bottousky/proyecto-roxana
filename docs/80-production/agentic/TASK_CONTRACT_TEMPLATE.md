---
status: PROPOSED
authority_level: 6
version: v1
last_ratified: 2026-08-16
supersedes: []
depends_on:
  - WORKFLOW.md
  - ENGINE_MATRIX.md
---

# Task Contract Template

Copiar este archivo sólo para milestones que necesiten coordinación entre agentes o más de una sesión. Para un fix pequeño, el issue/prompt puede contener los mismos campos sin crear archivo.

```yaml
id: RX-<scope>-<nnn>
status: READY | IN_PROGRESS | VERIFY | REVIEW | BLOCKED | DONE
scope: global | instituto | ohmdal | physica | bitland | arithmos
owner_role: implementer
max_repair_loops: 3
hard_cap: 5
```

## Goal

Una frase que describa **algo jugable/observable**, no una tarea interna.

## Learning contract

Obligatorio para gameplay, puzzle, world interaction o representación pedagógica.

- **Concepto:** qué debe comprender el jugador.
- **Antes de formalizar:** qué puede percibir/manipular sin nombre técnico, fórmula o sintaxis.
- **Predicción esperada:** qué debería poder anticipar antes de ejecutar su acción.
- **Consecuencia observable:** qué hace el mundo para mostrar el resultado.
- **Fallo informativo:** qué evidencia recibe cuando su hipótesis no funciona.
- **Transferencia mínima:** qué variante razonable debería poder resolver después sin copiar la solución anterior.
- **Formalización posterior:** qué nombre, símbolo, diagrama, fórmula o pseudocódigo puede aparecer después de la experiencia.

Una milestone pedagógica no pasa sólo porque el puzzle se puede completar. Debe existir evidencia de que la interacción representa correctamente el concepto.

## Why / hypothesis

Qué hipótesis de diseño o producción valida.

## Representation / dimension rationale

Cuando aplique, declarar por qué la representación elegida compra comprensión:

- 2D / 2.5D / 3D;
- Three.js / Babylon / Phaser / PixiJS / SVG / DOM;
- cámara y grado de libertad;
- por qué una opción más simple sería insuficiente.

Si la tercera dimensión no aporta información conceptual, no se agrega sólo por espectáculo.

## Required context

Sólo documentos necesarios. No “leer todo docs/”.

## In scope

- ...

## Out of scope

- ...

## Acceptance criteria

Criterios binarios y observables. Ejemplos:

- [ ] el jugador puede recorrer A → B sin atravesar colliders;
- [ ] la puerta cambia de estado cuando `powered_full=true`;
- [ ] el estado persiste tras reload;
- [ ] cero errores de consola durante el recorrido;
- [ ] desktop y viewport mobile mantienen el landmark visible;
- [ ] el modelo acepta al menos dos soluciones válidas cuando la disciplina lo permite;
- [ ] el jugador puede predecir el siguiente estado antes de ejecutar;
- [ ] un fallo muestra qué ocurrió sin responder directamente qué hacer;
- [ ] la formalización no aparece antes de evidencia suficiente;
- [ ] una variante de transferencia no puede resolverse sólo memorizando la secuencia anterior.

Evitar “se ve AAA”, “está perfecto”, “queda increíble” o “enseña bien” sin métrica. Convertir calidad visual y aprendizaje en rúbricas observables.

## Verification

```bash
npm run build
npm test
npm run verify
# + comandos específicos del scope
```

Recorrido Playwright/manual requerido:

1. ...
2. ...
3. ...

Para gameplay pedagógico registrar, cuando sea posible:

- estado inicial;
- acción/predicción;
- resultado del mundo;
- estado final;
- variante de transferencia.

## Desktop + mobile gate

Todo sistema de interacción nuevo declara cómo se opera con:

- teclado/mouse;
- touch;
- viewport mobile objetivo.

Si la interacción sólo funciona bien con precisión de mouse, no está lista para producción multiplataforma.

## Allowed change surface

Archivos/carpetas permitidos y zonas prohibidas.

## Evidence

Sólo lo necesario para reproducir PASS/FAIL:

- test/s;
- screenshot/s si son parte del criterio;
- estado textual/debug snapshot si aplica;
- pasos exactos para reproducir;
- evidencia de aprendizaje/playtest cuando el contrato lo exige.

## Stop conditions

- máximo normal: 3 loops;
- hard cap: 5;
- escalar inmediatamente si hace falta cambiar diseño, dependencia, motor, canon o scope;
- si el problema es que el jugador no comprende, no “pulir UI” indefinidamente: volver a representación/interacción y revisar la hipótesis.

## Result

`PASS | FAIL | ESCALATE`

Hallazgos pendientes, si existen.
