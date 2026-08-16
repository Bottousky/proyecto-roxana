---
status: PROPOSED
authority_level: 5
version: v1
last_ratified: 2026-08-16
supersedes: []
depends_on:
  - README.md
  - SPIKE_POLICY.md
  - ../../00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
---

# Workflow — Bounded Play-Code Loop

El loop de Roxana está orientado a **juegos**, no a software genérico. Tests y build son necesarios, pero una feature no está validada hasta que alguien/algún agente la **usa como jugador**.

```text
MANUEL: intención
      ↓
DIRECTOR: contract + learning contract
      ↓
BUILDER: implementación
      ↓
MECHANICAL GATE
      ↓
PLAYER AGENT: juega como usuario
      ↓
    PASS? ── no → REPAIR AGENT → gates → PLAYER AGENT
      │                       ↑ máximo 1–3 normal / 5 hard cap
      sí
      ↓
ADVERSARIAL REVIEWER: intenta romper PR/milestone
      ↓
DIRECTOR: decide DONE / REPAIR / ESCALATE
      ↓
MANUEL: integración material
```

## 0. Intake

El Director recibe un objetivo humano e identifica:

- scope;
- autoridad documental aplicable;
- hipótesis de gameplay/aprendizaje;
- estado inicial reproducible;
- resultado observable esperado;
- si existe una incertidumbre A/B que exige dos spikes separados.

No planifica el juego entero. Produce **una milestone jugable** o una Spike Card.

## 1. Task Contract + Learning Contract

Antes de tocar código el Director fija:

- objetivo y no-objetivos;
- superficie permitida;
- acceptance criteria binarios/observables;
- Learning Contract;
- camino de jugador a recorrer;
- referencias/golden frames cuando aplican;
- performance/mobile budgets relevantes;
- verificadores;
- stop conditions.

El Builder puede dividir la milestone internamente. No hace falta que GPT escriba una lista de funciones microscópicas antes de empezar.

Si hay dos soluciones plausibles materiales, seguir `SPIKE_POLICY.md`: **A y B son ejecuciones independientes desde el mismo baseline**.

## 2. Builder

El Builder implementa dentro del contrato.

Reglas:

- preservar cores pedagógicos puros/testeables;
- no rediseñar lore/GDD;
- no introducir engine/dependency upgrade incidental;
- producir cambios observables pequeños;
- instrumentar el runtime cuando eso vuelve la verificación más confiable;
- no esconder fallos con mocks permanentes, asserts eliminados o paths especiales de demo.

El Builder no es quien certifica que su feature “se siente bien”.

## 3. Mechanical Gate

Como mínimo:

```bash
npm run build
npm test
npm run verify
```

Más checks específicos del scope si el contrato los declara.

Este gate prueba principalmente:

- compilación/tipos;
- modelos puros;
- invariantes conocidas;
- regresiones automatizadas;
- reglas mecánicas del repo.

**Mechanical PASS no implica Play PASS.**

## 4. Player Agent Gate — usar el producto, no revisar el código

Este es un rol separado del Builder y del reviewer de código.

### Blind-first

En su primera pasada, el Player Agent recibe sólo:

- objetivo/fantasía del jugador;
- controles disponibles;
- estado de partida inicial;
- criterio observable que debería lograr un jugador;
- restricciones de accessibility/mobile que formen parte del camino.

**No recibe el diff, tests ni explicación interna de cómo está implementado.**

Debe abrir el runtime real y usarlo como una persona:

1. orientarse sin teleport cuando el camino normal importa;
2. intentar comprender affordances antes de consultar debug state;
3. completar el camino crítico;
4. probar al menos una acción razonable no ideal;
5. fallar al menos una vez cuando el sistema admite fallo;
6. comprobar si el fallo enseña algo;
7. intentar la variante/transferencia declarada por el Learning Contract;
8. repetir en touch/mobile cuando aplica.

### Después de jugar

Recién después puede usar:

- Playwright;
- snapshots/debug hooks;
- consola;
- state inspection;
- screenshots comparativos;

para convertir una sensación o anomalía en un hallazgo reproducible.

### Salida

`PASS | BLOCKER | MAJOR | MINOR`

Cada fallo incluye:

- pasos del jugador;
- qué esperaba inferir/hacer;
- qué ocurrió;
- acceptance/learning criterion violado;
- evidencia mínima reproducible.

El Player Agent **no repara**.

## 5. Repair Agent

Recibe solamente:

- task contract;
- hallazgos reproducibles del Player Agent/mechanical gates;
- archivos/contexto estrictamente necesarios.

Objetivo: **corregir el defecto, no reinterpretar el juego**.

Ruta normal:

`finding → patch pequeño → mechanical gate → Player Agent reproduce`.

DeepSeek Flash es un candidato natural para este churn barato. Si el mismo fallo sobrevive a dos reparaciones informadas, escalar a un modelo más capaz o al Director; no quemar cinco vueltas idénticas.

## 6. Adversarial Reviewer — después de Play PASS

Una milestone que el jugador pudo completar todavía puede esconder regresiones, shortcuts o deuda peligrosa.

El adversarial reviewer es **read-only** y entra cuando:

- mechanical gates pasaron;
- Player Agent dio PASS en BLOCKER/MAJOR;
- existe un diff/PR concreto.

Su trabajo es intentar demostrar que el cambio **no debería entrar**:

- buscar regresiones fuera del happy path;
- revisar invariantes y edge cases;
- buscar discrepancias entre código y task contract;
- identificar bypasses, hardcodes o hacks de demo;
- revisar cleanup/resources/performance cuando el scope lo toca;
- comprobar que no se debilitó un test para obtener PASS;
- comprobar mobile/touch donde sea contractual;
- atacar assumptions del core pedagógico sin rediseñarlo.

No puntúa estilo por gusto. Cada objeción requiere evidencia concreta.

La familia GLM se propone para este rol porque queda separada de Builder/Repair. La versión exacta se fija desde `opencode models`; nunca se inventa un model ID.

## 7. Director / Loop Owner

GPT-5.6 Sol conserva el estado global de la milestone y decide:

- `DONE`: evidencia suficiente, cero BLOCKER/MAJOR;
- `REPAIR`: defecto localizado dentro del contrato;
- `ESCALATE`: spec/representación/arquitectura/alcance probablemente incorrectos.

El Director lee:

- contract;
- mechanical evidence;
- Player Agent report;
- adversarial review;
- estado de loops.

No declara DONE porque “el agente dice que se ve muy bien”.

## 8. Loop budget

Objetivo normal: **1–3 repair loops**.

Hard cap: **5** sobre el mismo task contract.

Pero hay una regla más fuerte:

> Si un mismo defecto sobrevive a **2 reparaciones bien informadas**, el Director debe considerar explícitamente que el problema puede ser de representación/spec/arquitectura antes de lanzar una tercera reparación.

Al quinto ciclo sin PASS: `ESCALATE` obligatorio.

## 9. Human gate

Manuel decide cuando:

- cambia experiencia/diseño;
- se elige un ganador de spike;
- cambia engine/runtime/dependency;
- cambia canon;
- la calidad visual/material es una decisión de producto;
- una milestone material se integra.

Los fixes locales dentro de un contrato estable no requieren interrupción humana por cada línea.

## 10. Cierre

Una milestone cerrada deja:

- build/tests/verify verdes;
- Player Agent PASS en BLOCKER/MAJOR;
- cero BLOCKER/MAJOR del adversarial reviewer;
- Learning Contract satisfecho o evidencia de playtest humano pendiente explícitamente declarada;
- desktop/mobile según contrato;
- pasos reproducibles;
- resumen corto de riesgo residual.

No se crean ceremonias adicionales cuando estos datos ya existen en tests, task contract o PR.
