---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md (sección 8 — arcos propuestos; sección 11 — diseño de dificultad)
  - docs/physica/spec-vertical-slice.md (apartado 4 — escenas y mecánicas, en lo que asume orden de aparición)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/physica-vision_v1.md
  - ./physica-player-movement_v1.md
  - ./physica-physics-interaction-system_v1.md
  - ./physica-puzzle-grammar_v1.md
open_questions:
  - PHYS-MP-1 — ¿La curva de 5 arcos es un plan de **lanzamiento** (todos se entregan en el primer producto) o un **roadmap** (se entregan en versiones)? Implicación sobre el alcance del primer juego.
  - PHYS-MP-2 — ¿Los arcos futuros (III–V) se aprueban en esta sesión o se dejan explícitamente como "esquema" sin compromiso de entrega?
  - PHYS-MP-3 — ¿El reloj-dispositivo entra en todos los arcos, o se reemplaza en algún arco por otro instrumento? (Decisión de coherencia narrativa.)
  - PHYS-MP-4 — ¿La masa aparente del avatar (mA) varía **dentro** del Arco I (diferentes biomas con distinta mA) o se reserva al Arco II?
  - PHYS-MP-5 — ¿Cómo se mide la "curva de dificultad" sin terminar creando métricas arbitrarias? (Cruza DL-Q2.) Implicación: el "ritmo" del Arco I debe poder auditarse en prototipo.
---

# PHYSICA — MECHANICS PROGRESSION · v1

Este documento define la **curva de mecánicas** de Physica: cómo se
introducen, cómo crecen y cómo se conectan las familias de puzzle a
lo largo de los cinco arcos. Define también el ritmo de desbloqueo
del reloj-dispositivo y la curva de dificultad del mundo completo.

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P3
> sin ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel.

> **Alcance.** Describe la curva de **mecánicas**. No prescribe
> geografía ni mapa: eso vive en
> `world/physica-world-structure_v1.md`. No prescribe puzzles
> específicos: eso vive en `content/physica-arc-01_v1.md`.

---

## 1. Tesis

> **El jugador domina una idea física cuando puede predecir su
> resultado, no cuando puede nombrarla.**

La curva de Physica se mide por la **capacidad de predecir**, no
por la **cantidad de conceptos**. Un arco que entrega una idea
nueva y la deja en "ya la nombré" está fallando P08 (el conocimiento
restaura) y P14 (toda complejidad nueva debe comprar posibilidad
jugable).

---

## 2. Cinco arcos, una curva

El pack de la sesión P3 fija cinco arcos, cada uno centrado en una
agrupación de capas físicas. Esta agrupación **no** es un temario:
es una **curva jugable** en la que cada arco introduce una
cantidad limitada de novedades, las hace jugar, y **cierra** con
una restauración visible (P08).

| Arco | Título | Capas | Familias dominantes | "Idea ganada" |
|---|---|---|---|---|
| **I** | Movimiento | C0, C1, C3, C4 (intro) | F1–F10 (intro) | "Predecir movimiento antes de medirlo." |
| **II** | Fuerzas | C1, C4, C2 (intro) | F3, F4, F6, F8 | "La fuerza cambia lo que se mueve, no sólo lo que se siente." |
| **III** | Transferencia | C2, C3, C0 | F6, F7, F10 | "La energía y el momento se mueven entre cuerpos, no desaparecen." |
| **IV** | Oscilación y medios | C6, C5, C3 | F11, F7, F5 | "Acoplar es ajustar ritmo; la frecuencia es estructura." |
| **V** | Luz | C7 | F12, F10 | "Lo que parece recto puede doblarse; lo que se ve no siempre muestra la fuente." |

> **Open question.** `PHYS-MP-1` y `PHYS-MP-2` declaran que la
> aprobación de arcos III–V en esta sesión es **a nivel de
> esquema**, no de compromiso de entrega. Manuel debe ratificar
> cuáles arcos entran en el primer producto.

---

## 3. Curva de mecánicas del Arco I (la que se cierra en P3)

El Arco I es el único que se **compromete** en esta sesión. La curva
sigue el esquema del pack P3 §13 con ajustes derivados de la
lectura del canon preexistente.

### 3.1 Capítulos del Arco I

| # | Título | Familias que activa | Instrumento gan | "Idea ganada" | Recompensa tipo 1 |
|---|---|---|---|---|---|
| 0 | La caída imposible | F1, F2 | (reloj: observación) | "Dos cuerpos del mismo lugar pueden obedecer direcciones distintas." | La cascada se estabiliza. |
| 1 | Llegar antes | F1, F2 | (reloj: cronómetro) | "Predecir requiere comparar dos casos, no aplicar una fórmula." | Plataforma anterior se ancla como atajo. |
| 2 | Lo que cambia | F1, F5 | (reloj: distancia) | "Mismo punto de partida, distinta evolución: la trayectoria distingue." | Se abre un nuevo camino. |
| 3 | Peso no es destino | F3, F4 | (INSTRUMENTO entra) | "La masa cambia la dinámica, no el destino: el sistema se equilibra." | Instrumento queda como compañero. |
| 4 | Superficies | F5, F8 | (reloj: anclaje lectura) | "La fricción es una propiedad legible del sistema." | Una rampa se vuelve utilizable. |
| 5 (Final) | Estación cinética | F6, F7, F9, F10 | (reloj: trayectoria) | "Las consecuencias se propagan: una intervención afecta a otras." | Estación se activa parcialmente; bitácora del arco se cierra. |

### 3.2 Curva de novedad

La cantidad de **variables de puzzle nuevas** por capítulo sigue
una curva estrictamente creciente pero acotada:

```
Cap. 0: 1 variable
Cap. 1: 1 variable
Cap. 2: 2 variables
Cap. 3: 2 variables
Cap. 4: 2 variables
Cap. 5: 3+ variables
```

> **Regla.** Un capítulo no introduce más de **dos variables
> nuevas**. La dificultad crece por combinaciones, no por
> vocabulario.

### 3.3 Curva de instrumento (reloj-dispositivo)

El reloj entra en el capítulo 0 sólo como **observación pasiva**
(registra). En el capítulo 1 gana el **cronómetro**. En el
capítulo 2 gana **distancia**. En el capítulo 4, gana la
**lectura de anclaje** (el jugador ve el resultado de anclar sin
poder anclar). En el final del arco, gana la **trayectoria**.

> **Decisión de v1.** El reloj **no escribe** la física en el
> Arco I. Sólo lee. La capacidad de intervención local se
> reserva al Arco II (PIS §7.3).

### 3.4 Curva de la voz del INSTRUMENTO

El INSTRUMENTO entra en el capítulo 3, **después** de que el
jugador haya visto la anomalía y la haya *manipulado*. La voz
sigue la curva:

```
Cap. 3:  fragmentos del guion tras evidencia (no antes)
Cap. 4:  una observación reactiva
Cap. 5:  observación integradora
```

> **Prohibido.** Una línea del INSTRUMENTO que anticipe el
> resultado (P11). Una línea que anticipe la fórmula (P02).
> Cualquier "esto es una polea" como diálogo queda **rechazado**.

---

## 4. Curva de dificultad del Arco I

La dificultad del Arco I crece por **combinación de fuentes
válidas** (Design Language §4), no por opacidad.

### 4.1 Fuentes usadas por capítulo

| Cap. | D-VAR-1 (vars) | D-VAR-2 (distancia) | D-VAR-3 (anticipación) | D-VAR-4 (simultaneidad) | D-VAR-5 (restricciones) | D-VAR-7 (combinación) |
|---|---|---|---|---|---|---|
| 0 | 1 | bajo | bajo | — | — | — |
| 1 | 1 | bajo | medio | — | tiempo | — |
| 2 | 2 | medio | medio | — | — | — |
| 3 | 2 | medio | medio | — | pieza frágil | F1 + F4 |
| 4 | 2 | medio | medio | — | soporte fijo | F5 + F8 |
| 5 | 3 | alto | alto | sí | energía | F6 + F7 + F9 + F10 |

> **Decisión de v1.** La optimización (D-VAR-9) **no** se exige
> en el camino crítico del Arco I. Vive en el Modo Maestría
> opcional (P13).

### 4.2 Fuentes prohibidas

El Arco I **nunca** aumenta dificultad por:

- esconder información sin que sea inferible;
- castigar ensayo razonable;
- requerir memorización de diálogos;
- reiniciar el sistema sin diagnóstico;
- exigir ejecución precisa en milisegundos.

---

## 5. Curva del instrumento (reloj) a lo largo del producto

| Arco | Estado del reloj | Capas accesibles | Módulos habilitados |
|---|---|---|---|
| I | Captura / medición incipiente | C0 | Observación, cronómetro, distancia, trayectoria. |
| II | Medición / modelo | C1, C2 | + Vector, masa, comparación. |
| III | Modelo | C0–C3 | + Energía, comparación A/B, anclaje (escritura). |
| IV | Modelo / intervención parcial | C3, C6 | + Frecuencia, período. |
| V | Intervención autorizada | C7 | + Vector de luz. |

> **Prohibido.** Un módulo que se entregue antes de que el
> jugador haya producido la evidencia que lo justifica. (P02,
> P06.)

---

## 6. Curva de la voz del INSTRUMENTO

La voz del INSTRUMENTO pasa por cuatro fases:

1. **Silencio.** El INSTRUMENTO no habla. El jugador explora.
2. **Reacción.** El INSTRUMENTO emite un fragmento del guion
   cuando el cuerpo entra a un estado nuevo.
3. **Observación.** El INSTRUMENTO nombra un patrón que el
   jugador ya vio.
4. **Advertencia.** El INSTRUMENTO señala una consecuencia no
   obvia. Nunca una solución.

| Arco | Fase |
|---|---|
| I | 1 → 2 → 3 |
| II | 3 (transición a 4) |
| III–V | 4 |

> **Decisión de v1.** El INSTRUMENTO **no** usa terminología
> técnica. Los términos viven en la Bitácora formal. Esta
> separación protege P02 (formalización posterior) y DL-§5
> (la voz nunca sustituye al sistema).

---

## 7. Curva del entorno (decoración legible)

El Arco I introduce **una anomalía local por capítulo** que el
mundo **muestra** sin explicar:

```
Cap. 0: agua que sube (gLocal invertido)
Cap. 1: viento que aparece y desaparece
Cap. 2: dos rutas con misma distancia pero distinta pendiente
Cap. 3: instrumento flotante con dos fuerzas opuestas
Cap. 4: losa con fricción cambiante
Cap. 5: sistema multi-cuerpo que se acopla
```

> **Regla.** Cada anomalía tiene **delimitación explícita** (PIS
> §4.2): el jugador puede trazar su frontera.

---

## 8. Curva de recompensas (Design Language §2)

| Tipo | Arco I | Notas |
|---|---|---|
| 1 — Transformación del mundo | Cascada estabilizada, atajo anclado, camino abierto, rampa utilizable, Estación parcial. | Recompensa dominante. |
| 2 — Nueva capacidad | INSTRUMENTO como compañero; un nuevo juguete físico por capítulo. | |
| 3 — Acceso | Nuevas regiones o atajos curados. | |
| 4 — Nueva lectura | Módulo del reloj nuevo. | |
| 5 — Narrativa | Avance del misterio de las configuraciones perdidas. | Nunca sustituye a 1. |
| 6 — Cosmético | Apariencia del INSTRUMENTO. | Marginal. |

> **Decisión de v1.** Las recompensas de tipo 5 y 6 **no**
> dominan el Arco I. La motivación primaria es la transformación
> (1) y la nueva capacidad (2).

---

## 9. Lo que este documento NO es

- No prescribe **qué puzzles específicos** se juegan. Eso vive en
  `content/physica-arc-01_v1.md`.
- No prescribe **qué biomas existen** ni su conexión. Eso vive en
  `world/physica-world-structure_v1.md`.
- No prescribe **qué dice el INSTRUMENTO** literalmente. La voz
  textual del guion v0.2 (cadena "INSTRUMENTO" y "VOZ DOCENTE")
  sigue siendo el contrato; este documento no la reescribe.
- No prescribe **métricas de balance**. El balance se valida en
  prototipo: ver
  `production/physica-prototype-evaluation_v1.md`.

---

## 10. Conexión con el resto de Physica

- La **curva del instrumento** se ata a las **capas** definidas en
  `physica-physics-interaction-system_v1.md` §2.
- La **curva de familias** se ata a la **gramática** en
  `physica-puzzle-grammar_v1.md`.
- La **curva del entorno** se ata a la **geografía** en
  `world/physica-world-structure_v1.md`.
- La **curva de la voz** se ata a la **biblia narrativa** en
  `narrative/physica-narrative-bible_v1.md`.
- Los **puzzles concretos** se diseñan en
  `content/physica-arc-01_v1.md` y
  `content/physica-vertical-slice_v1.md`.
