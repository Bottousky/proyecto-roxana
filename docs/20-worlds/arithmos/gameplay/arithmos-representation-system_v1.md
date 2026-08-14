---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md (sección 6 — igualdad y variables; sección 7 — subsección G funciones; sección 16 — Bitácora y múltiples representaciones; reescrito y reclasificado)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - ../vision/arithmos-vision_v1.md
  - ../vision/arithmos-world-rules_v1.md
  - ./arithmos-transformation-system_v1.md
open_questions:
  - A-RS-Q1 — ¿Cuántas representaciones se enseñan en campaña principal y cuáles quedan reservadas a mastery? (rango probable: 6–8 de las 11 listadas en campaña; el resto a mastery)
  - A-RS-Q2 — ¿La Bitácora permite *cambiar de representación* sobre un mismo evento, o sólo *mostrar* la representación canónica? Si la primera, hay diseño adicional de UI
  - A-RS-Q3 — ¿Las representaciones son conmutables bidireccionalmente o algunas son "terminales" (e.g. gráfica)?
  - A-RS-Q4 — ¿Cómo se presenta la representación "función" sin recaer en un instrumento de UI separado?
  - A-RS-Q5 — ¿La representación "expresión" usa notación estándar o notación diegética (e.g. una cadena de runas)?
---

# ARITHMOS · REPRESENTATION SYSTEM · v1

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P5.

> **Relación con la Vision y con el Transformation System.** La Vision
> declara que el mismo objeto matemático tiene múltiples
> representaciones. El Transformation System define el conjunto
> cerrado de operaciones. Este documento define el conjunto cerrado
> de **representaciones** y cómo se vinculan.

---

## 1. Qué es una representación

Una **representación** es una forma en que el mundo muestra un
objeto matemático al jugador. El mismo objeto (por ejemplo, "doce
unidades de algo") puede verse como:

- doce piedras sueltas;
- tres paquetes de cuatro;
- dos paquetes de seis;
- una losa de área 12;
- un factor común 3 sobre un factor 4;
- un punto sobre una recta;
- un nodo en un grafo con grado 3;
- una expresión (cuando la Bitácora la formalice);
- una gráfica (curva, histograma, etc., en mastery).

> El gameplay muchas veces **consiste en elegir la representación
> que vuelve soluble un problema**.

---

## 2. Catálogo cerrado de representaciones

Arithmos reconoce las siguientes representaciones en v1. Cada una
debe ser **legible** (sin notación obligatoria) y **operable** (el
jugador puede actuar sobre el objeto en esa representación).

| # | Representación | Lectura dominante | Operación típica asociada | Disponibilidad |
|---|---|---|---|---|
| R1 | **cantidad física** | volumen / peso / número de partes | `agrupar`, `separar`, `duplicar`, `repartir` | desde el inicio |
| R2 | **número** | símbolo en la Bitácora | registro / invocación | aparece después (P06) |
| R3 | **recta** | punto sobre un eje | `trasladar`, `escalar` | desde la curva 2 |
| R4 | **conjunto** | piezas delimitadas por una silueta | `agrupar`, `separar`, `combinar` | desde el inicio |
| R5 | **área** | huella de una superficie | `recomponer`, `teselar`, `fraccionar` | desde la curva 3 |
| R6 | **factor** | módulos compatibles | `factorizar`, `sustituir` | desde la curva 2 |
| R7 | **fracción** | parte sombreada de un todo | `fraccionar`, `balancear` | desde la curva 2 |
| R8 | **razón** | comparación de dos cantidades | `escalar`, `balancear` | desde la curva 2 |
| R9 | **expresión** | cadena simbólica | `sustituir`, `función` | desde la curva 2 (Bitácora) |
| R10 | **gráfica** | curva o histograma | `transformación`, `función` | desde la curva 4 (mastery) |
| R11 | **geometría** | contorno, lados, ángulos | `rotar`, `reflejar`, `trasladar` | desde la curva 3 |

> **R10 (gráfica)** se reserva como contenido opcional de
> mastery (P13) en v1. R2 (número) y R9 (expresión) son las
> únicas que dependen de notación; se rigen por DL §5 (formalización
> mostrada, operable o de maestría).

---

## 3. Conmutabilidad

Dos representaciones son **conmutables** si el jugador puede pasar
de una a otra sin pasar por una tercera. Arithmos define las
siguientes conmutaciones explícitas (no exhaustivas; la tabla
crece con el prototipo):

| Desde | Hacia | Operación de cambio | Invariante que se conserva |
|---|---|---|---|
| R1 cantidad | R4 conjunto | `agrupar` o `separar` | cantidad total |
| R1 cantidad | R5 área | `recomponer` o `teselar` | cantidad total / área |
| R1 cantidad | R6 factor | `factorizar` | cantidad total |
| R1 cantidad | R7 fracción | `fraccionar` | cantidad total |
| R1 cantidad | R8 razón | `escalar` (k=1/k') | razón interna |
| R4 conjunto | R5 área | `teselar` | cardinalidad / área |
| R4 conjunto | R11 geometría | cambio de silueta | cardinalidad / perímetro |
| R5 área | R11 geometría | `rotar`, `reflejar`, `trasladar` | área |
| R6 factor | R7 fracción | `fraccionar` | valor numérico |
| R6 factor | R9 expresión | registro en Bitácora | valor numérico |
| R3 recta | R10 gráfica | `función` | mapeo punto a punto |
| R9 expresión | R10 gráfica | lectura simbólica | mapeo x → f(x) |

> Las conmutaciones que involucran R2 (número) o R9 (expresión)
> deben pasar por la Bitácora, salvo que la propia
> representación ya esté en el mundo. P06 y DL §5 mandan.

### 3.1. Conmutaciones terminales

Una representación es **terminal** si no se sale de ella en
campaña principal. En v1:

- R10 (gráfica) es terminal en campaña principal; sólo en
  mastery se sale de ella hacia R9 (expresión) mediante la
  lectura simbólica de la curva.

> Esta decisión se valida en prototipo (A-RS-Q3).

---

## 4. Affordance: cómo se ve que una representación está disponible

Siguiendo `vision/arithmos-world-rules_v1.md` §8, Arithmos
extiende la affordance con dos marcadores específicos de
representación:

1. **Sombra equivalente.** Un objeto proyecta la silueta de su
   *representación alternativa*. Indica "este objeto puede ser
   visto de otra forma".
2. **Marca de invariante.** Cuando un puzzle admite varias
   representaciones, una marca de agua indica cuál es la
   propiedad activa y, secundariamente, qué representación es
   la *canónica* del puzzle.

> **Regla dura.** La affordance nunca debe sugerir que una
> representación es "más correcta" que otra. La igualdad entre
> representaciones se demuestra por la consecuencia sistémica que
> producen, no por un cartel.

---

## 5. La operación central: cambio de representación

El cambio de representación es **una transformación del sistema**
porque cumple la regla fundamental:

- **Cambia la representación.** El objeto pasa de R_i a R_j.
- **Conserva la propiedad activa.** La propiedad declarada por el
  puzzle (cantidad, área, factor, razón, etc.) se mantiene.
- **Produce una consecuencia.** Un mecanismo que sólo aceptaba la
  representación R_i ahora acepta R_j; una ruta se abre; un
  balance se restablece.

> Si un cambio de representación **no produce consecuencia**, no
> es una transformación: es una decoración. Se documenta como tal
> y se separa del sistema de transformaciones.

### 5.1. Restricciones legales del cambio de representación

- Sólo se admiten cambios entre R_i y R_j si la conmutación es
  legal (ver §3).
- Si R_j no es terminal, se puede volver a R_i.
- Si la propiedad activa no se conserva en la conmutación, el
  cambio se rechaza con feedback geométrico (P05, DL §6).

---

## 6. La Bitácora como sistema de representaciones

> Esta sección describe **qué** hace la Bitácora para Arithmos; el
> **cómo** (UI, layout, etc.) se delega a la bible de Bitácora de
> P6.

### 6.1. Función principal

La Bitácora de Arithmos es un sistema de **múltiples
representaciones del mismo evento**. Para cada acción de
transformación que el jugador realiza, la Bitácora puede mostrar:

- una vista de la **acción** (lo que el jugador hizo);
- una vista de la **cantidad** involucrada (R1 → R2);
- una vista de la **forma** involucrada (R4 / R5 / R11);
- una vista de la **expresión** resultante (R9);
- una vista de la **gráfica** cuando aplique (R10, mastery);
- una **lectura verbal** accesible (accesibilidad).

### 6.2. Capas

- **Capa de observación.** Lo que el jugador hizo. Sin
  formalización, sólo lo manipuló.
- **Capa de equivalencia.** Lo que se conservó. Aparece cuando
  el jugador ha realizado al menos una transformación
  equivalente.
- **Capa de formalización.** Símbolos, números, expresiones.
  Aparece **después** de evidencia suficiente (P02, P06, DL §5).

### 6.3. Lo que la Bitácora NO hace

- No es un manual previo (DoD del proyecto).
- No explica al jugador qué hacer. Reconoce lo que el jugador
  ya hizo.
- No acumula ecuaciones: una vez que un concepto se dominó, no
  se re-formaliza (DL §5).
- No contiene texto instructivo directo (DL §3, orden 7 es
  último recurso).

---

## 7. Tres ejemplos por nivel de curva

> Misma lógica que en `arithmos-transformation-system_v1.md` §8.
> Aquí los ejemplos enfatizan el **cambio de representación** como
> herramienta central.

### 7.1. Curva 1 — cantidad ↔ conjunto

**Estado inicial.** 12 piedras sueltas (R1). El jugador ve que
un puente calibrado a 12 unidades exige una *configuración* y no
*piezas sueltas* (R4).

- Representación inicial: 12 × {m=1} (R1).
- Representación final: 4 × {m=3} (R4) **o** 3 × {m=4} (R4) **o**
  6 × {m=2} (R4) **o** 2 × {m=6} (R4).
- Cambio de representación: R1 → R4.
- Propiedad conservada: cantidad total = 12.
- Consecuencia: el puente se activa *bajo cualquier* R4 válida.
  El jugador aprende que 12 puede leerse de varias formas y que
  el puente no exige "una" forma.

### 7.2. Curva 2 — factor ↔ fracción

**Estado inicial.** Un acueducto seccionado como 1 triángulo de
área 6. Una compuerta exige pasar la sección como 1/2·3·4
(triángulo) **o** 1/2·2·6 (otro triángulo) **o** 1·6 (paralelogramo
de base 6) **o** 1/2·(suma de bases 4 con sus alturas) en dos
sub-triángulos.

- Representación inicial: 1 triángulo (R11, factor ½·b·h).
- Representación final: factor ½·3·4 **o** factor ½·2·6 **o**
  factor 1·6 **o** dos sub-triángulos (R6 factor o R7 fracción).
- Cambio de representación: R11 → R6 o R7.
- Propiedad conservada: área = 6.
- Consecuencia: el agua pasa; la plataforma intermedia se eleva;
  el jugador descubre que *cambiar de factor no cambia el área* y
  que la misma área admite varias descomposiciones.

### 7.3. Curva 3 — área ↔ geometría ↔ gráfica

**Estado inicial.** Una plaza teselada por 24 rombos. El sistema
muestra la plaza y, además, su **gráfica de uso**: una curva que
describe qué fracción de la plaza está "activada" por mecanismos
cercanos. La salida exige que la plaza quede con 12 rombos
activados y los otros 12 conformen un cuadrado en un solar
vecino.

- Representación inicial: R5 (área) y R10 (gráfica) en simultáneo.
- Representación final: plaza de 12 rombos en "L" (R11) + cuadrado
  de 12 rombos (R11).
- Cambio de representación: R5 ↔ R11 ↔ R10.
- Propiedad conservada: área total; silueta del cuadrado (R11);
  integral bajo la curva (R10, mastery).
- Consecuencia: la ruta se abre porque la plaza cambia su silueta
  *y* el cuadrado se forma en el solar vecino. La curva de uso
  (R10) muestra que ahora el cuadrado está completamente activado
  y la plaza, parcialmente.

---

## 8. Lo que el sistema NO hace

- No obliga a una representación canónica. La canónica es la que
  el jugador elige, no la que el sistema le impone.
- No obliga a usar la misma representación en toda la campaña.
  Cada puzzle admite varias.
- No usa notación como atajo (P06). La notación aparece después
  de la manipulación.
- No convierte la Bitácora en una lista de cuentas. Es un
  sistema de **múltiples vistas** sobre la misma experiencia.

---

## 9. Lo que este documento NO es

- No prescribe UI. La bible de UI (P6) decide cómo se muestran
  las representaciones.
- No prescribe paleta ni estilo.
- No prescribe motor, framework ni arquitectura técnica.
- No es un temario de representaciones matemáticas: es el
  **conjunto cerrado de representaciones jugables** de Arithmos.
  Cualquier representación adicional requiere ADR.
