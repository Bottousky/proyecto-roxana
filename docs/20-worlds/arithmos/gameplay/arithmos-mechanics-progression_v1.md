---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md (sección 11 — arcos propuestos, sólo como insumo; sección 12 — vertical slice, sólo como insumo; sección 13 — diseño de dificultad; reescritos y reclasificados)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - ../vision/arithmos-vision_v1.md
  - ../vision/arithmos-world-rules_v1.md
  - ./arithmos-transformation-system_v1.md
  - ./arithmos-representation-system_v1.md
  - ./arithmos-puzzle-grammar_v1.md
open_questions:
  - A-MP-Q1 — ¿Cuántos arcos tiene v1 de la campaña? (recomendación PROPOSED: 5; se valida en el vertical slice)
  - A-MP-Q2 — ¿El Arco I termina en el "Jardín de equivalencias" (propuesta legacy) o se redefine con un cierre distinto?
  - A-MP-Q3 — ¿La curva de operaciones (C1 → C4) se desarrolla en paralelo a la curva de familias (A1 → A12) o secuencialmente?
  - A-MP-Q4 — ¿La "restauración" (P08) ocurre arco por arco o se acumula a lo largo de la campaña?
  - A-MP-Q5 — ¿Cuántas regiones entran en v1 de la campaña? (La sesión P5 propone prototipo con 1 región; v1 de campaña con 3 regiones)
  - A-MP-Q6 — ¿Cómo se mide "dominio" de un concepto para promover su formalización en la Bitácora? (P02 + P13)
---

# ARITHMOS · MECHANICS PROGRESSION · v1

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P5.

> **Relación con el resto del GDD.** Este documento define **cómo se
> introduce** cada operación y cada familia a lo largo de la campaña.
> No redefine operaciones (eso es el Transformation System), no
> redefine familias (eso es el Puzzle Grammar) y no redefine
> regiones (eso es la bible narrativa y de contenido).

---

## 1. Diseño de la curva

La curva de Arithmos tiene dos dimensiones:

1. **Curva de operaciones** (qué herramientas tiene el jugador):
   C1 → C2 → C3 → C4. Una operación se introduce **manipulándola**
   antes de nombrarla (P02, P06).
2. **Curva de familias** (qué tipos de puzzle enfrenta el
   jugador): A1 → A2 → ... → A12. Una familia se introduce
   cuando las operaciones que la sustentan ya están disponibles.

Las dos curvas **no son paralelas**. La curva de operaciones es
el *camino crítico*: una familia no aparece antes de que sus
operaciones críticas estén disponibles.

### 1.1. Reglas duras de la curva

- **R1.** Una operación se introduce antes de su nombre técnico.
  El jugador la *usa* antes de leerla.
- **R2.** Una familia no aparece con todas sus variables de
  dificultad activas desde el inicio. Las variables se acumulan
  arco a arco.
- **R3.** La formalización (símbolos, números, expresiones) entra
  **después** de evidencia suficiente. La Bitácora formaliza, el
  puzzle nunca exige el símbolo.
- **R4.** La restauración (P08) es un *cierre de ciclo* por
  arco: al final de cada arco, una región fracturada recupera
  su equivalencia y el mundo cambia visiblemente.
- **R5.** La maestría (P13) nunca bloquea el progreso. Un
  jugador que no busca optimización completa la campaña.

---

## 2. Estructura de arcos propuesta (PROPOSED)

> Los nombres y el orden son PROPOSED. La cobertura curricular
> detallada se delega al `content/arithmos-arc-01_v1.md`.

| Arco | Foco | Operaciones que se introducen | Familias que aparecen | Cierre de ciclo (P08) |
|---|---|---|---|---|
| **I — Cantidad** | agrupar, separar, equivalencia, factores, razones simples | C1.1, C1.2, C1.3, C1.4, C1.5; intro C2.1 | A1, A2, A3, A4 (introducción), A5 (introducción) | una región fracturada recupera una equivalencia; un mecanismo urbano vuelve a funcionar |
| **II — Forma** | geometría, área, simetría, transformaciones | C2.2, C2.3, C2.4, C2.5; intro C3.1, C3.2, C3.3, C3.4, C3.5 | A5, A6, A7; refuerzo A1, A2, A3, A4 | un jardín geométrico recupera sus simetrías; una plaza tesela correctamente |
| **III — Lo desconocido** | variables, balance, ecuaciones | consolidación C1–C3; intro C4.1 | A8, A9, A10, A11 (introducción), A12 (introducción) | una región cuya equivalencia se había "perdido" recupera su función desconocida |
| **IV — Máquinas** | funciones, gráficas, composición, inversa | consolidación C1–C3; profundización C4.1, C4.2 | A10, A11, A12 (profundización) | una serie de máquinas rotas vuelven a producir un output coordinado |
| **V — Estructuras** | grafos, combinatoria, probabilidad, modularidad | consolidación C1–C4; intro C4.3, C4.4, C4.5 | A8, A9, A12 (consolidación); A10, A11 (mastery) | una red fracturada se reconecta; un sistema modular recupera su periodicidad |

> **Cobertura de la DoD.** Los 5 arcos cubren las 12 familias.
> La distribución de familias entre campaña principal y mastery
> se decide en el vertical slice (A-MP-Q1, A-PG-Q1).

---

## 3. Diseño por arco

### 3.1. Arco I — Cantidad (PROPOSED)

- **Operaciones críticas:** C1.1 `agrupar`, C1.2 `separar`,
  C1.3 `duplicar`, C1.4 `repartir`, C1.5 `comparar`.
- **Familias protagonistas:** A1, A2, A3.
- **Familias de apoyo:** A4 (introducción con balanzas simples),
  A5 (introducción como "el doble de...").
- **Cierre de ciclo (P08):** una región fracturada cuya
  equivalencia se rompió (e.g. dos plazas que antes sumaban la
  misma cantidad y ahora una olvidó cómo agruparse) recupera
  su equivalencia. El mundo cambia: un puente, una fuente o un
  mecanismo urbano vuelve a funcionar.
- **Bitácora — capa de formalización esperada:** nada al
  inicio. A mitad de arco, *agrupación* y *suma*. Al final,
  *factor* y *equivalencia*.
- **Restricciones:** cuentas grandes están prohibidas
  (rango 1–24). No aparece notación algebraica.

### 3.2. Arco II — Forma (PROPOSED)

- **Operaciones críticas:** C2.2 `escalar`, C2.3 `fraccionar`,
  C2.4 `balancear`, C2.5 `sustituir`; intro C3.1 `rotar`,
  C3.2 `reflejar`, C3.3 `trasladar`, C3.4 `teselar`,
  C3.5 `recomponer`.
- **Familias protagonistas:** A5, A6, A7.
- **Familias de apoyo:** A1, A2, A3, A4 (consolidación).
- **Cierre de ciclo (P08):** un jardín geométrico recupera
  simetrías; una plaza tesela correctamente. El cambio visible
  es la silueta del mundo.
- **Bitácora — capa de formalización esperada:** *área*,
  *perímetro*, *simetría*, *transformación rígida*. La
  *representación* entre R5 y R11 se nombra explícitamente
  sólo al final del arco.
- **Restricciones:** figuras no triviales (hexágonos, rombos,
  polígonos regulares) entran en este arco. La teselación
  entra con motivos clásicos.

### 3.3. Arco III — Lo desconocido (PROPOSED)

- **Operaciones críticas:** consolidación C1–C3; intro
  C4.1 `función`.
- **Familias protagonistas:** A8, A9.
- **Familias de apoyo:** A10, A11 (introducción muy temprana,
  sólo con funciones lineales y muy legibles), A12
  (introducción con dos casos por puzzle).
- **Cierre de ciclo (P08):** una región cuya equivalencia
  perdida era, en realidad, una *función desconocida* que
  reaparece cuando el jugador la infiere.
- **Bitácora — capa de formalización esperada:** *variable*,
  *función*, *salida esperada*. *Ecuación* sólo al final
  del arco, opcional.
- **Restricciones:** la función no exige cuenta: el jugador
  alimenta la máquina con inputs y observa outputs. La
  formalización algebraica queda en la Bitácora (P06).

### 3.4. Arco IV — Máquinas (PROPOSED)

- **Operaciones críticas:** profundización C4.1, intro
  C4.2 `transformación` (general).
- **Familias protagonistas:** A10, A11, A12.
- **Cierre de ciclo (P08):** una serie de máquinas rotas se
  reensamblan y vuelven a producir un output coordinado.
- **Bitácora — capa de formalización esperada:** *composición*,
  *inversa*, *gráfica como mapa de outputs*.
- **Restricciones:** las funciones se mantienen *legibles*;
  no se exige derivar ni integrar.

### 3.5. Arco V — Estructuras (PROPOSED)

- **Operaciones críticas:** consolidación C1–C4; intro
  C4.3 `grafo`, C4.4 `combinatoria`, C4.5 `modularidad`.
- **Familias protagonistas:** A8, A9, A12 (consolidación);
  A10, A11 (mastery opcional).
- **Cierre de ciclo (P08):** una red fracturada se
  reconecta; un sistema modular recupera su periodicidad.
- **Bitácora — capa de formalización esperada:** *grafo*,
  *ruta óptima*, *período*, *frecuencia*. *Probabilidad* y
  *combinatoria* sólo si la región las exige.
- **Restricciones:** la combinatoria se presenta como
  *configuraciones con restricciones*, no como cálculo
  combinatorio enumerativo.

---

## 4. Curva de dificultad

### 4.1. Fuentes válidas de dificultad

Siguiendo DL §4, Arithmos crece en dificultad por:

- **Cantidad de variables.** Más elementos en escena, más
  relaciones a la vez.
- **Distancia causa–efecto.** Más operaciones entre la entrada
  del jugador y la consecuencia.
- **Simultaneidad.** Varios sistemas activos a la vez.
- **Restricciones.** Límites explícitos (componentes, área
  máxima, factor común obligatorio).
- **Información incompleta pero inferible.** El puzzle oculta
  una variable, pero el jugador puede reconstruirla.
- **Combinación de conceptos.** Un puzzle exige más de una
  familia.
- **Cantidad de soluciones válidas.** Más soluciones, más
  decisiones de elegancia.
- **Optimización.** (Sólo en mastery, P13.)

### 4.2. Fuentes prohibidas de dificultad

- Esconder información sin que sea inferible.
- Castigar ensayo razonable.
- Recompensar memorización sin lectura de estado.
- Castigar por no leer un diálogo obligatorio.
- Reiniciar el sistema sin diagnóstico.
- Cuentas numéricas arbitrariamente grandes.

### 4.3. Curva recomendada

| Arco | Variables simultáneas (VT1) | Distancia causa-efecto (VT2) | Combinación (VT5) |
|---|---|---|---|
| I | 1–3 | 1–2 | 0–1 |
| II | 2–5 | 2–3 | 1–2 |
| III | 3–6 | 3–4 | 2–3 |
| IV | 4–6 | 3–5 | 2–4 |
| V | 4–8 | 4–6 | 3–5 |

> Estos rangos se afinan con datos de prototipo (A-MP-Q-siguiente).

---

## 5. Restricciones de cantidad

Arithmos limita las cantidades que aparecen en el mundo por las
siguientes razones:

- **Evitar cuentas arbitrarias como falsa dificultad** (P14,
  guía de puzzles del proyecto).
- **Mantener la legibilidad visual** (las piezas deben ser
  contables a simple vista).
- **Forzar la búsqueda de representación**: con N pequeño, la
  representación importa más que el cálculo.

### 5.1. Rangos por arco (PROPOSED)

| Arco | Rango de cantidad (objetos discretos) | Rango de área (celdas) |
|---|---|---|
| I | 1–12 | 1–24 |
| II | 1–24 | 1–48 |
| III | 1–24 | 1–48 |
| IV | 1–24 | 1–48 |
| V | 1–48 | 1–96 (mastery) |

> **Regla dura.** En campaña principal, ningún puzzle exige
> operar con cantidades fuera de su rango. Los rangos sólo
> crecen en mastery.

---

## 6. Maestría opcional (P13)

La maestría vive en una **capa explícita**, accesible pero no
obligatoria:

- **Variantes de elegancia.** Un puzzle ya resuelto admite
  una versión "más corta" con menos operaciones.
- **Variantes de generalidad.** Un puzzle ya resuelto admite
  una versión que funciona para una familia de casos.
- **Variantes de optimización.** Un puzzle de la familia A8
  admite la ruta más corta.
- **Retos aislados.** Una región de mastery (ver
  `vision/arithmos-world-rules_v1.md` §5.1) ofrece puzzles
  opcionales de las familias A8, A10, A11, A12 con sus
  variables al máximo.

La maestría **nunca** es prerrequisito para completar la
campaña. Un jugador que no busca optimización termina la
campaña principal sin perder contenido narrativo.

---

## 7. Métricas de progresión (proxy, no definitivas)

> El proyecto no convierte puntos o experiencia en motivación
> dominante (DL §2 — recompensa tipo 6 prohibida como
> dominante). Las "métricas" siguientes son **internas al
> diseño**, no visibles al jugador como contadores.

- **Cantidad de regiones restauradas.** Cierre de ciclo
  (P08). Visible en el mundo.
- **Cantidad de operaciones dominadas.** El jugador ha
  manipulado la operación en al menos tres puzzles con
  variación. La Bitácora formaliza la operación en su capa de
  formalización cuando se cumple este umbral.
- **Cantidad de familias experimentadas.** La Bitácora no
  acumula un "logro", pero el sistema puede usarla para
  decidir cuándo un puzzle ya no es necesario (P10 — el
  contenido no se acumula).

> Las métricas se validan con datos de prototipo; no se
> canibaliza la fantasía con contadores.

---

## 8. Lo que este documento NO es

- No es un level design. No prescribe salas, ni mapas, ni
  encounters. Eso es contenido (`content/`).
- No prescribe UI ni arte.
- No prescribe motor ni framework.
- No es un temario curricular. La cobertura se evalúa en
  la bible de contenido.
- No convierte ninguna cantidad en un contador de progreso
  visible.
