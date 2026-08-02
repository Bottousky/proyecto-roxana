# Contenido educativo V2 del slice — congelado

**Estado:** CONGELADO en `ARC1-005`, 2026-08-02
**Base:** `b49b617`
**Alcance:** golden slice Portal → Plaza → Taller → Puerta → Manantial
**Cambiarlo:** requiere decisión `CP-0NN` propia. Un ticket de escena **no** puede redefinir el
contenido para que su resultado pase.

---

## 1. Para qué existe

`ACCEPTANCE_GATES.md` §Educación exige **ficha V2 antes de producir interacción final**. Esa
condición gobierna `ARC1-018`, `ARC1-019`, `ARC1-021` y `ARC1-022`.

Las fichas existen y están auditadas, pero viven en `src/**` —protegido— y en el run de
preproducción. Ningún documento del control plane decía cuáles son canon, en qué escena se juega
cada una, ni **qué beats quedan sin ficha y por qué eso es correcto**. Sin eso, el gate no se puede
aplicar: cada ticket tendría que decidir por su cuenta si su contenido está validado.

Este documento fija tres cosas y nada más:

1. **qué fichas son canon** del slice y con qué estado verificado;
2. **qué escena y qué beat** juega cada una;
3. **qué no está cubierto**, y qué haría falta para cubrirlo.

Lo que **no** hace: escribir contenido educativo. Ver §2.

---

## 2. Este documento no escribe fichas — las verifica

Las seis fichas H1.1 … H1.6 son datos puros en
`src/labs/ohmdal-hd2d-preprod/education/cards.ts`, con los 30 campos canónicos de doc. 02
§«Ficha obligatoria por contenido» (líneas 129-162) en el mismo orden.

Reescribirlas acá crearía una segunda fuente de verdad divergente. `cards.ts` está protegido; este
documento lo **lee, ejecuta y mide**.

**Qué se hizo y qué no:**

| Acción | Estado |
|---|---|
| Verificar integridad de las seis fichas por ejecución | **hecho**, `evidence/ARC1-005/cards-audit.json` |
| Recalcular la red del slice desde el modelo ejecutable | **hecho** |
| Demostrar el requisito de dos órdenes por búsqueda exhaustiva | **hecho** |
| **Repetir la auditoría independiente V2 (H1.7)** | **no** — se hereda, ver §3.2 |
| Escribir, corregir o promover una ficha | **no** — fuera de alcance |

---

## 3. Las seis fichas — estado verificado, no citado

### 3.1 Inventario

| Ficha | Identificador | Modelo ejecutable | Escena | Beats | Ticket que la implementa |
|---|---|---|---|---|---|
| Seguridad | `H1.1-seguridad-virtual-v2` | estados protegidos de `diagnosisModel.ts` | E2, E3, E4 | 3, 5, 6 | `ARC1-018`, `ARC1-019` |
| Circuito y continuidad | `H1.2-circuito-continuidad-v2` | `circuitModel.ts` | E2, E3 | 3, 5 | `ARC1-018` |
| Instrumento | `H1.3-instrumento-ohm-v2` | `instrumentModel.ts` | E3, E4 | 5, 6 | `ARC1-019` |
| Diagnóstico de Lumen | `H1.4-diagnostico-lumen-v2` | `diagnosisModel.ts` | E3 | 5 | `ARC1-018`, `ARC1-019` |
| Transferencia en la Puerta | `H1.5-puerta-transferencia-v2` | `PUERTA_NODE_LABELS` sobre el mismo solver | E4 | 6 | `ARC1-021` |
| Bitácora | `H1.6-bitacora-evidencia-v2` | `bitacoraModel.ts` | E3, E5 | 5, 7 | `ARC1-022` |

Ninguna ficha queda huérfana: las seis están asignadas a al menos una escena
(`cards-audit.json`, `orphanCards: []`).

### 3.2 Verificación de estado

Medida por ejecución sobre `b49b617`, no leída de un comentario:

| Comprobación | Resultado |
|---|---|
| Contrato canónico de campos | **30** (`types.ts:1-32`) |
| Fichas entregadas | **6** |
| Cada ficha con 30/30 campos, en el orden canónico | **sí**, las 6 |
| Campos vacíos | **0** en las 6 |
| Identificador terminado en `-v2` | **sí**, las 6 |
| `validationStatus` empieza con `V2 CANON-EDU` | **sí**, las 6 |
| `validationStatus` declara el segundo pase | **sí**, las 6 |

`cards-audit.json` → `allCardsPassV2Contract: true`.

**La auditoría independiente se hereda, no se repite.** El segundo pase que exige doc. 02 §V2
—«un segundo pase de agente reproduce cálculos y tests»— lo ejecutó el run de preproducción: dos
rondas correctivas y veredicto PASS el 2026-08-02
(`docs/agent-runs/ohmdal-hd2d-preprod-v1/content/education/README.md:59-64`). `ARC1-005` **no**
repitió esa auditoría; verificó que los artefactos que declara existen, están completos y coinciden
con sus modelos ejecutables. Es una distinción que importa: si mañana alguien discute la validez
de V2, el registro que hay que revisar es el del run de preproducción, no éste.

---

## 4. La red única del slice — recalculada

Todo el contenido educativo del slice ocurre sobre **una sola red**, enteramente virtual y ficticia:

```text
V_PLUS ── R1 100 Ω ── N1 ── R2 150 Ω ── N2 ── retorno ── REF
Vs = 5,00 V DC      retorno = closed | open
```

Valores recalculados desde `circuitModel.ts`, no copiados de las fichas:

| Magnitud | Retorno cerrado | Retorno abierto |
|---|---:|---:|
| Camino | `R1 → R2 → return` | ninguno |
| `Req` | 250 Ω | ∞ |
| `I` | **20,00 mA** | 0 |
| `V_PLUS`, `N1`, `N2`, `REF` respecto de `REF` | 5 · 3 · 0 · 0 V | 5 · 5 · 5 · 0 V |
| `P₁`, `P₂` | 0,040 W · 0,060 W | — |
| Caída sobre la apertura | 0 V | 5,00 V |
| `N2–REF` pasiva | 0 Ω | ∞ |

Los seis valores coinciden exactamente con lo que las fichas afirman.

**La Puerta usa el mismo solver, verificado por igualdad:** `solvePuertaTransfer` devuelve un
resultado idéntico a `solveCircuit` (`cards-audit.json`, `puertaSolverIdenticalToLumen: true`). Sólo
cambian los rótulos: `marca_este`, `bisagra_alta`, `bisagra_baja`, `marca_oeste`.

Es exactamente lo que doc. 10 Beat 6 exige: **la Puerta no añade una fórmula nueva.** Ahora está
medido, no prometido.

### La regla que ninguna escena puede aflojar

> **5,00 V en `N2` con el retorno abierto no demuestra corriente.**

Es el malentendido que el slice existe para desarmar (doc. 02 §Revisión inicial: «confundir
movimiento de carga con consumo de corriente»). Cualquier implementación que permita concluir
«hay tensión, entonces funciona» incumple `H1.2` y es P1.

### Instrumento

Rangos y umbrales de `instrumentModel.ts:25-31`: `V_0_50`, `V_5`, `V_20`, `R_200`, `R_2000` y
continuidad con umbral **300 Ω** inclusive. Cuantización de tensión 0,01 V.

`R` y continuidad **sólo** existen desenergizado y aislado. Un modo pasivo energizado no es un error
del jugador que el juego perdone: es un estado incompatible que el modelo rechaza.

---

## 5. Los órdenes válidos — demostrados, no afirmados

Doc. 10 Beat 6 exige que la Puerta «admita al menos dos órdenes de diagnóstico» (línea 100). El
canon del proyecto lo generaliza: validación por condiciones, nunca por solución fija.

Búsqueda exhaustiva sobre `diagnosisModel.ts`, hasta 12 acciones, 976.065.035 transiciones
evaluadas:

| Estrategia | Órdenes válidos | Mínimo de acciones |
|---|---:|---:|
| Continuidad primero | 83.836 | **9** |
| Tensión primero | 4.208 | **10** |
| **Total** | **88.044** | — |

Orden mínimo por continuidad:

```text
inspect → record_hypothesis → configure_measurement → measure_continuity
  → deenergize_isolate → intervene → energize_locked → verify → document
```

Orden mínimo por tensión:

```text
inspect → record_hypothesis → configure_measurement → energize_locked → measure_voltage
  → deenergize_isolate → intervene → energize_locked → verify → document
```

**La diferencia de una acción no es un desbalance: es el precio de la seguridad, y está medido.**
Medir tensión obliga a energizar; intervenir obliga a volver a aislar; verificar obliga a energizar
otra vez. `H1.1` cobra ese ciclo. Ningún ticket puede «emparejar» las dos rutas eliminando el
aislamiento intermedio.

Consecuencia para `ARC1-019`, que integra órdenes válidos y error recuperable: **la UI no puede
premiar la ruta corta**. Ambas son correctas; la de continuidad es más barata en acciones, no mejor.

---

## 6. Qué beats no tienen ficha, y por qué está bien

| Beat | Escena | Ficha | Motivo |
|---|---|---|---|
| 1 · Llegada | E1 | **ninguna** | doc. 10 Beat 1 lo prohíbe explícitamente: «no hay exposición del currículo» |
| 2 · Edda pregunta | E1 | **ninguna** | Edda contrasta dos relatos y se va; no hay interacción evaluable |
| 3 · Activación de Ohm | E2 | `H1.1`, `H1.2` | microinteracción de circuito completo; ver `OI-003` |
| 4 · Lumen y el ritual | E3 | `H1.4` | presenta el procedimiento heredado que el puzzle contrasta |
| 5 · Puzzle de Lumen | E3 | `H1.1`–`H1.4`, `H1.6` | la doctrina completa de doc. 02 corre acá por primera vez |
| 6 · Puerta de Ohm | E4 | `H1.1`, `H1.3`, `H1.5` | transferencia sobre el mismo solver |
| 7 · Manantial | E5 | `H1.6` | la Bitácora reescribe vivencia como evidencia y formalización |

### La regla que esto congela

> **Ningún beat sin ficha puede recibir una interacción evaluable.**

Si `ARC1-015` decide que Edda pida algo que el jugador pueda hacer bien o mal, ese beat pasa a
necesitar ficha V2 **antes** de implementarse (`ACCEPTANCE_GATES.md` §Educación). No es una
formalidad: es la diferencia entre una conversación y un cuestionario disfrazado, que doc. 02
§Doctrina descarta como núcleo.

---

## 7. Lo que este documento obliga hacia adelante

1. **`ARC1-018`, `ARC1-019`, `ARC1-021` y `ARC1-022` implementan estas fichas; no las reinterpretan.**
   Una discrepancia entre implementación y ficha es P1 del ticket, no una corrección de la ficha.
2. **Los valores de §4 son contractuales.** Un ticket que necesite otros números abre `CP-0NN`.
3. **Nada del slice pasa a V3 antes de `ARC1-030`.** V3 exige playtest mixto 13–18 con y sin
   electrónica; V4 exige auditoría curricular final, `ARC1-059`.
4. **El vocabulario formal sigue gateado.** `serie`, `paralelo`, `nodo` y `Kirchhoff` sólo aparecen
   en la capa de traducción formal de la Bitácora, nunca en la vivencia.
5. **Ninguna ficha se cita de memoria.** Toda afirmación sobre contenido educativo se resuelve
   contra `cards.ts` y su modelo ejecutable.

---

## 8. Lo que este documento deliberadamente NO aprueba

- **La calidad pedagógica real.** Se mide con usuarios, en `ARC1-030`. V2 significa auditado, no
  probado con estudiantes.
- **La correspondencia escolar.** Doc. 02 §«Correspondencia escolar» es explícito: se expresa como
  `compatible con`, nunca como `equivale a`. Ninguna ficha acredita horas ni habilitación.
- **La accesibilidad del contenido.** Las fichas la declaran campo por campo; verificarla es
  `ARC1-026`.
- **La transferencia a práctica física.** Todo el paquete es virtual, aislado y ficticio. Ninguna
  lectura autoriza trabajo sobre equipos reales.
- **El contenido de las otras regiones.** Cuenca, Castillo, Forja-Terrazas y Faro-Lago tienen sus
  propios tickets de contenido; este documento no los alcanza.
- **El guion.** Las líneas de Edda, Lumen y Ohm no están escritas; las entradas de Bitácora de las
  fichas son contrato de estructura, no diálogo final.

---

## 9. Trazabilidad

| Dato | Origen |
|---|---|
| 30 campos canónicos | doc. 02 líneas 129-162; `types.ts:1-32` |
| definición de V2 | doc. 02 líneas 197-199 |
| las seis fichas | `education/cards.ts` |
| auditoría independiente PASS, dos rondas | `ohmdal-hd2d-preprod-v1/content/education/README.md:59-64` |
| `Vs`, `R1`, `R2` | `circuitModel.ts:4-6` |
| `Req`, `I`, nodos, potencias, caída y resistencias pasivas | `evidence/ARC1-005/cards-audit.json` |
| identidad del solver Lumen/Puerta | `cards-audit.json`, `puertaSolverIdenticalToLumen` |
| rangos, umbral de 300 Ω y cuantización | `instrumentModel.ts:25-31`, `:78` |
| 88.044 órdenes válidos, mínimos 9 y 10 | `cards-audit.json`, `validOrders` |
| requisito de dos órdenes | doc. 10 línea 100 |
| ficha V2 antes de interacción final | `ACCEPTANCE_GATES.md` §Educación |
| escenas y beats | `SCENE_INVENTORY.md` §2 |

Ningún número de este documento fue estimado ni copiado de una ficha: todos salen de ejecutar el
modelo.
