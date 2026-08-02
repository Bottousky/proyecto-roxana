# Contrato H3 — Golden slice de Ohmdal

**Estado:** **VIGENTE.** Autorizado por el usuario el 2026-08-02 (`CP-013`).
**Redactado por:** Orquestador, dentro de `ARC1-002`
**Autorizado por:** el usuario, explícitamente
**Fecha de redacción:** 2026-08-02
**Fecha de autorización:** 2026-08-02

`executionAuthorized = true`, `baseCommit = b49b617`. Rige la **opción B** del §6: Android físico
diferido a `ARC1-060`, con todo claim de rendimiento mobile en `not-run` hasta entonces (`CP-014`).

---

## 1. Base fija

| Campo | Valor |
|---|---|
| Rama | `codex/ohmdal-arc1-control-plane` |
| `baseCommit` propuesto | `b49b617` (cierre de `ARC1-001`) |
| Antecedente H1/H2 | `fd38f29`, evaluado; ronda final `ffc61b4` integrada en `e8f7bac` |
| Base de preproducción original | `12d6f88` |

La base se congela al autorizar. Si el árbol avanza antes de la autorización, se re-fija al último
commit de control y se registra el cambio; no se autoriza contra una base móvil.

**Precondición verificada:** doc. 15 exige `ARC1-001 DONE` antes de autorizar H3. Se cumplió el
2026-08-02 (`CP-010`, commit `b49b617`).

---

## 2. Alcance de H3

H3 produce **un golden slice**: Portal → Plaza → Taller → Puerta → Manantial. Su objetivo no es
«aprobar el look», sino demostrar que existe **una línea de producción repetible** dentro del tiempo,
presupuesto y hardware de Ohmdal (doc. 15 §«Golden slice antes de campaña»).

### Unidad de producción

La unidad es la **escena causal completa**, no la región ni el lote de assets. Cada escena recorre,
en orden, los ocho pasos de la gramática de producción de doc. 15 §«Gramática»: intención narrativa
y competencia V2 → blockout a escala y tiempo de recorrido → cámara real desktop/mobile →
interacción y modelo determinista → personajes/props con manifests → material, luz, VFX y audio →
accesibilidad, rendimiento y evidencia → revisión humana y `DONE`.

No se abre la escena siguiente para mantener ocupados a otros roles.

### Tickets cubiertos

`ARC1-007` … `ARC1-033`, en cadena serial estricta, más los tickets de control `ARC1-003` …
`ARC1-006` que deben cerrarse antes.

### Entregable de cierre

`ARC1-035` congela el kit productivo y el **coste real por minuto jugable y por escena causal**. Sin
ese número, H3 no está terminado aunque el slice se vea bien.

---

## 3. Lo que H3 NO autoriza

Permanece prohibido salvo decisión nueva y registrada:

1. modificar `src/jugar/**` o migrar el runtime estable;
2. migrar el save o el formato de progreso;
3. Meshy y cualquier generación paga (presupuesto **cero**, `CP-008`);
4. producción masiva de assets o apertura de lotes;
5. dependencias npm nuevas;
6. regiones completas fuera del slice (Cuenca, Castillo, Forja-Terrazas, Faro-Lago);
7. reescribir historia de git, `push` o borrar trabajo preexistente;
8. tocar `docs/agent-runs/ohmdal-arco1/**`, propiedad del usuario;
9. copiar propiedad intelectual de Dragon Quest: paleta, composición, UI, personajes o mapas
   (doc. 15 §«Traducción de dirección», columna «lo que no se debe imitar»).

El ADR de runtime (`ARC1-034`) se redacta **después** del slice, nunca para resolver una escena.

---

## 4. Ownership

Un solo ticket activo, WIP global 1. El ownership de escritura se declara **por ticket** en
`ownership.json` y se reemplaza en cada transición, nunca se acumula.

| Rol | Escribe | No escribe |
|---|---|---|
| Director / Orquestador | control plane, specs, texto canon, decisiones, evidencia | implementación de hitos |
| Builder | sólo los paths del ticket activo | control plane, tickets, otros módulos |
| Reviewer | nada | todo |
| Evaluador | sólo su informe de evidencia | código y control plane |

Protegidos de forma permanente durante H3: `src/jugar/**`, `package.json`, `package-lock.json`,
`docs/agent-runs/ohmdal-arco1/**`, `docs/agent-runs/ohmdal-hd2d-preprod-v1/**` y
`docs/ohmdal-biblia/**`.

`src/labs/ohmdal-hd2d-preprod/**`, `src/ohmdal/**`, `assets/**` y `tests/**` dejan de estar
globalmente protegidos y pasan a abrirse **ticket por ticket**, sólo en los paths que el ticket
activo declare.

### Colisión

`stop-and-return-to-director`. Un fallo del ticket activo se corrige dentro de la ronda; un fallo de
otro ticket sólo se registra. Dos rondas visibles máximo; la tercera exige autorización del usuario.

---

## 5. Presupuesto

### Ejecución

| Métrica | Valor |
|---|---:|
| Ejecutores concurrentes | 1 |
| Evaluadores concurrentes | 1 |
| Paquete interno por ticket | 30–90 min |
| Rondas visibles por ticket | 2 |
| Créditos Meshy | 0 |
| Generación paga | no |
| Dependencias npm nuevas | 0 |

### Rendimiento en runtime

Heredado de `ASSET_PIPELINE.md`; se **mide**, no se estima.

| Métrica | Mobile | Desktop |
|---|---:|---:|
| FPS | 45–60; piso 30 | 60 |
| DPR | ≤1,5 | ≤2 |
| Draw calls | <150 | <250 |
| Triángulos visibles | 150k–300k | 400k–700k |
| Luces con sombra | 0–1 | 1 principal |

El presupuesto por escena (JS, texturas, audio, memoria, draw calls y tiempo) lo fija `ARC1-006`;
este contrato sólo fija el techo global.

### Coste

`ARC1-035` debe reportar coste real por minuto jugable y por escena causal. Un slice que se ve bien
pero cuyo coste por minuto no se puede sostener a lo largo del Arco I **no cumple** el objetivo de
H3.

---

## 6. Riesgo declarado: Android físico

El informe final de H1/H2 condiciona explícitamente la apertura de H3 a *«incluir prueba en Android
físico antes de reclamar 30 fps en el dispositivo objetivo»*.

**Estado actual:** no hay Android físico medio de 2022 disponible en este entorno. Emulación y frame
smoke **no** sustituyen esa medición y no se presentan como PASS.

Opciones, a decidir por el usuario:

| Opción | Consecuencia |
|---|---|
| **A — El usuario provee el dispositivo** | Se mide en `ARC1-028`/`ARC1-029` y el piso de 30 fps se puede declarar PASS |
| **B — Se difiere a `ARC1-060`** | H3 avanza, pero todo claim de rendimiento mobile queda `not-run` hasta el QA de release; ningún ticket puede declarar PASS mobile antes |
| **C — No se abre H3** | Se respeta la condición del informe de H1/H2 al pie de la letra |

**Elección del usuario (2026-08-02): opción B.** H3 avanza; `ARC1-028` y `ARC1-029` miden desktop y
mobile emulado; **ningún ticket puede declarar PASS de rendimiento en Android físico antes de
`ARC1-060`**. Un ticket que necesite ese número lo declara `not-run` y sigue. Registrado como
`CP-014`.

### Otros `not-run` heredados

- `npm run verify` — `bash scripts/verificar-hito.sh` requiere WSL y esta máquina no tiene
  distribución instalada. Se sustituye por `build` + `test` + `3d:validate-manifests` +
  `git diff --check`, y se declara la sustitución en cada cierre.
- Safari / PWA / recuperación offline — `not-run`; se atienden en `ARC1-027` y `ARC1-060`.
- Captura en vivo del panel de navegador — no compone frames en esta sesión; los tickets visuales
  deben resolver la captura o declararla `not-run`, nunca inferir el resultado.

---

## 7. Referencia de calidad y `CP-011`

La referencia declarada es *Dragon Quest III HD-2D Remake*, **como barra de proceso**, no como
plantilla visual. Doc. 15 es explícito: cada HD-2D adopta una expresión propia, la escala se decide
jugando y no se aprueba una planta por captura estática.

La reserva del Director sobre si la cámara iguala esa referencia (`CP-011`) sigue **abierta y no
bloqueante**. Puntos de re-evaluación obligatorios:

- `ARC1-024` — con materiales, luz, DOF, agua y VFX presentes;
- `ARC1-030` — playtest, midiendo tiempo entre focos, densidad causal, retorno y fatiga.

Si en cualquiera de los dos la cámara no sostiene la referencia, se abre un ticket de corrección
propio. **No** se reabre `ARC1-001`.

Precaución tomada de la misma fuente: el DOF de DQIII fue **reducido** tras revisión de dirección
porque el desenfoque molestaba la lectura. En Ohmdal el DOF entra moderado y subordinado a
legibilidad, nunca como firma automática.

---

## 8. Autorización registrada

| # | Pregunta | Respuesta del usuario, 2026-08-02 |
|---|---|---|
| 1 | ¿H3 con `baseCommit = b49b617`? | **Sí, tal como está** |
| 2 | ¿Qué opción de Android físico? | **B** — diferir a `ARC1-060` |
| 3 | ¿Presupuesto de §5, Meshy y paga en cero? | **Confirmado** |
| 4 | ¿Ownership de §4? | **Confirmado** |

Consecuencias aplicadas: `executionAuthorized = true`, `baseCommit = b49b617`, `ARC1-002 → DONE`,
`ARC1-003 → READY`. Decisiones `CP-013` y `CP-014`.

La autorización es de **alcance**, no de resultado: cada ticket sigue necesitando sus gates, su
evidencia y —cuando sea visible— su aprobación humana. Autorizar H3 no autoriza saltear un gate.

---

## 9. Rollback

Este documento no cambia runtime. Si se autoriza por error, el remedio es un commit correctivo que
devuelva `executionAuthorized` a `false` y `baseCommit` a `null`, más una entrada `CP-0NN` que
explique el motivo. No se borra evidencia ni se reescribe historia.
