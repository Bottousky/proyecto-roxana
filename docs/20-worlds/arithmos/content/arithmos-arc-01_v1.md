---
status: PROPOSED
authority_level: 4
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md (sección 11 — Arco I propuesto; sección 12 — vertical slice, sólo como insumo; reescritos y reclasificados)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - ../vision/arithmos-vision_v1.md
  - ../vision/arithmos-world-rules_v1.md
  - ../gameplay/arithmos-transformation-system_v1.md
  - ../gameplay/arithmos-representation-system_v1.md
  - ../gameplay/arithmos-puzzle-grammar_v1.md
  - ../gameplay/arithmos-mechanics-progression_v1.md
  - ../narrative/arithmos-narrative-bible_v1.md
open_questions:
  - A-ARC1-Q1 — ¿La duración objetivo del Arco I es 90–120 minutos de juego, o más corta para facilitar la evaluación de prototipo? (recomendación PROPOSED: 60–90 minutos para Arco I; el vertical slice de 15–20 minutos es una sub-muestra)
  - A-ARC1-Q2 — ¿Cuántos puzzles del Arco I son de "evaluación" (sin tutorial)? (recomendación PROPOSED: 1 al final del Capítulo 0)
  - A-ARC1-Q3 — ¿El "Jardín de equivalencias" final del Arco I es una región jugable o un espacio narrativo de cierre?
  - A-ARC1-Q4 — ¿La aparición de la notación ocurre dentro del Arco I o se reserva al final, en el cierre?
  - A-ARC1-Q5 — ¿El Arco I admite dos rutas distintas (ver el final del capítulo 5) o se mantiene una sola con bifurcaciones internas?
---

# ARITHMOS · ARC 01 — CANTIDAD · v1

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P5.
> Es `authority_level` 4 (diseño de contenido). Toda región,
> capítulo y puzzle detallado aquí es **PROPOSED** y se valida en
> prototipo. La lore de cada capítulo es **PROPOSED** y requiere
> ratificación explícita de Manuel antes de ascender a CANON.

> **Relación con la bible de mecánicas.** El Arco I cubre la curva
> de operaciones C1.1–C1.5 + intro C2.1, y las familias A1–A5
> (con A4 y A5 como introducción). La curva completa está en
> `gameplay/arithmos-mechanics-progression_v1.md` §3.1.

---

## 1. Datos básicos del arco (PROPOSED)

- **Nombre:** Arco I — Cantidad.
- **Duración objetivo:** 60–90 minutos de juego (A-ARC1-Q1).
- **Operaciones que se introducen:** C1.1, C1.2, C1.3, C1.4, C1.5;
  intro C2.1.
- **Familias que aparecen:** A1, A2, A3; intro A4, A5.
- **Representaciones que se enseñan:** R1 (cantidad), R4 (conjunto);
  R2 (número) sólo al final, en la Bitácora; R5/R11 mencionadas
  por affordance pero no formalizadas.
- **Cierre de ciclo (P08):** la Plaza de las Medidas recupera su
  equivalencia. Un mecanismo urbano vuelve a funcionar.
- **Bitácora — capa de formalización esperada:** nada al inicio;
  *agrupación* y *suma* a mitad; *factor* y *equivalencia* al
  final.

---

## 2. Estructura del arco

| Capítulo | Título (PROVISIONAL, PROPOSED) | Regiones | Foco |
|---|---|---|---|
| 0 | La puerta doce | Taller del Cartógrafo (entrada) | cantidad, equivalencia, conservación |
| 1 | Partes iguales | Taller del Cartógrafo → Plaza de las Medidas | agrupar, separar |
| 2 | Mismo valor, otra forma | Plaza de las Medidas | equivalencia visible |
| 3 | Construir con factores | Plaza de las Medidas → Jardines Fraccionados (borde) | factorización |
| 4 | Proporción | Jardines Fraccionados (borde) | escala, razón simple |
| Final | Jardín de equivalencias | Jardines Fraccionados (interior) | generalización, cierre de ciclo |

> Los títulos son **PROVISIONALES, PROPOSED**. Se cambian
> fácilmente sin afectar el contenido.

---

## 3. Capítulo 0 — La puerta doce

> **Objetivo pedagógico.** El jugador descubre que dos
> representaciones distintas pueden producir la misma
> consecuencia. (P02, P06 — antes de cualquier formalización.)

### 3.1. Estado inicial

El jugador entra al Taller del Cartógrafo. Ve un puente calibrado
a "masa 12" (la unidad se ve como una pesa). Hay seis piedras
sueltas de masa 2 cada una, *y* un segundo acceso cuya silueta
exige **tres piedras de masa 4**.

### 3.2. Secuencia de beats

1. **Beats 1–2 (espacio seguro, DL §3).** El jugador llega. La
   cámara muestra el puente. No hay texto instructivo. La
   affordance tipo 2 (hueco con silueta) muestra la silueta del
   segundo acceso.
2. **Beats 3–4 (manipular).** El jugador toma dos piedras de
   masa 2 y las **combina** en una piedra de masa 4. Lo ve
   cambiar. La sombra equivalente (affordance tipo 1) le
   muestra que la nueva piedra admite otra silueta.
3. **Beats 5–6 (predecir).** El jugador repite la operación
   hasta tener tres piedras de masa 4. Las coloca en el segundo
   acceso. El puente se activa.
4. **Beats 7–8 (representar).** Aparece un tercer acceso: la
   silueta exige **cuatro piedras de masa 3**. El jugador
   experimenta. Descubre que también funciona.
5. **Beats 9–10 (cerrar).** El mecanismo del puente se mueve
   hacia un destino nuevo. La Bitácora, en su capa de
   observación, registra la manipulación.

### 3.3. Criterios de éxito del capítulo

- El jugador ha realizado al menos una operación `agrupar`.
- El jugador ha visto al menos dos configuraciones
  equivalentes.
- El puente se ha movido.

### 3.4. Variables de dificultad (PROPOSED)

- D1 de A1: rango N = 12 (configurable a 8 o 16 en mastery).
- D2 de A1: tres configuraciones aceptadas (4×3, 3×4, 6×2).
- D3 de A1: ninguna restricción de partición.
- D4 de A1: dos mecanismos simultáneos comparten la cantidad.

---

## 4. Capítulo 1 — Partes iguales

> **Objetivo pedagógico.** Dominar `agrupar` y `separar` como
> herramientas. Comprender que la cantidad total no cambia.

### 4.1. Estado inicial

El jugador avanza por el Taller del Cartógrafo hasta la Plaza de
las Medidas (o su umbral). Ve varias plataformas con piezas
sueltas y un primer mecanismo de **balanza**.

### 4.2. Secuencia de beats

1. **Beats 1–2.** El jugador ve dos plataformas a lados opuestos
   de una balanza. Cada lado tiene piezas sueltas (e.g. 5+3 a la
   izquierda, 8 a la derecha). La balanza no está nivelada.
2. **Beats 3–4.** El jugador agrupa las piezas de un lado. La
   balanza cambia de silueta. Aprende que agrupar cambia la
   *forma* sin cambiar la *cantidad*.
3. **Beats 5–6.** El jugador separa una pieza agrupada. La
   balanza cambia otra vez. La cantidad total no cambia; sólo
   cambia la silueta.
4. **Beats 7–8 (cerrar).** El jugador equilibra la balanza.
   Aparece un nuevo mecanismo. La Bitácora formaliza
   **agrupación** y **suma** en su capa de formalización.

### 4.3. Criterios de éxito del capítulo

- El jugador ha usado `agrupar` y `separar` al menos tres
  veces con cantidades distintas.
- El jugador ha equilibrado al menos una balanza.

---

## 5. Capítulo 2 — Mismo valor, otra forma

> **Objetivo pedagógico.** Reconocer dos configuraciones como
> equivalentes bajo una propiedad activa. Aparece la familia A3.

### 5.1. Estado inicial

El jugador entra al centro de la Plaza de las Medidas. Hay dos
mecanismos duales: el izquierdo exige "masa 12" como 3 grupos
de 4; el derecho exige "masa 12" como 6 grupos de 2.

### 5.2. Secuencia de beats

1. **Beats 1–2.** El jugador intenta alimentar el mecanismo
   izquierdo con 6 grupos de 2. La silueta no encaja. El
   feedback es geométrico: sobra espacio en la entrada,
   faltan piezas en la salida.
2. **Beats 3–4.** El jugador reorganiza como 3 grupos de 4. El
   mecanismo izquierdo se activa. El derecho, no.
3. **Beats 5–6.** El jugador ve que el mecanismo derecho exige
   6 grupos de 2. Reorganiza. Ambos se activan.
4. **Beats 7–8 (cerrar).** Un mecanismo central que sólo
   aceptaba "una" forma ahora acepta *varias*. Se abre una
   nueva ruta. La Bitácora formaliza **equivalencia** en su
   capa de formalización.

### 5.3. Criterios de éxito del capítulo

- El jugador ha encontrado al menos dos configuraciones
  equivalentes para un mismo mecanismo.
- El jugador ha visto cómo la elección de configuración
  determina *qué mecanismo se abre*, no *si se abre algo*.

---

## 6. Capítulo 3 — Construir con factores

> **Objetivo pedagógico.** Introducir la factorización como
> herramienta que abre arquitecturas. Aparece la familia A2.

### 6.1. Estado inicial

El jugador avanza hacia el borde de los Jardines Fraccionados.
Hay un mecanismo modular: acepta *factores* compatibles (3·4,
2·6, 1·12, 4·3, 6·2, 12·1) y rechaza los que no se pueden
construir con las piezas disponibles.

### 6.2. Secuencia de beats

1. **Beats 1–2.** El jugador ve que las piezas vienen en dos
   tamaños: pequeñas (masa 1) y medianas (masa 2). El
   mecanismo exige construir una losa de masa 12 a partir
   de estas piezas.
2. **Beats 3–4.** El jugador construye la losa con 12 piezas
   de masa 1. Funciona, pero el mecanismo "duele": las
   piezas no encajan limpiamente.
3. **Beats 5–6.** El jugador descubre que puede construir
   módulos de 4 (con dos medianas + dos pequeñas) y combinarlos.
   Funciona mejor. La losa tiene menos piezas.
4. **Beats 7–8 (cerrar).** El jugador prueba varias
   factorizaciones. Una se acepta con elegancia; otras se
   aceptan con coste. La Bitácora formaliza **factor**.

### 6.3. Criterios de éxito del capítulo

- El jugador ha construido al menos dos factorizaciones
  distintas.
- El jugador ha visto que algunas factorizaciones son
  preferidas por el mecanismo (más elegantes).

---

## 7. Capítulo 4 — Proporción

> **Objetivo pedagógico.** Introducir razones simples. Aparece
> la familia A5.

### 7.1. Estado inicial

El jugador entra al borde de los Jardines Fraccionados. Hay
una columnata con columnas de tres alturas distintas: corta,
mediana, alta. Cada columna exige un "peso" proporcional a su
altura.

### 7.2. Secuencia de beats

1. **Beats 1–2.** El jugador ve que las columnas no soportan
   el mismo peso. La corta se rompe si recibe mucho; la alta
   pide más.
2. **Beats 3–4.** El jugador prueba combinaciones. Descubre
   que la razón 1:2:3 (cortas:medianas:altas) es la
   proporción que las satisface a todas.
3. **Beats 5–6.** El jugador multiplica la razón por 2
   (1·2:2·2:3·2) y por 3. Funciona. La Bitácora formaliza
   **razón** y **proporción** en su capa de formalización.
4. **Beats 7–8 (cerrar).** Una fuente se abre. La Plaza de
   las Medidas comienza a recuperar su equivalencia.

### 7.3. Criterios de éxito del capítulo

- El jugador ha identificado al menos una razón.
- El jugador ha escalado la razón al menos una vez.

---

## 8. Final — Jardín de equivalencias

> **Objetivo pedagógico.** Integrar las herramientas de los
> capítulos 0–4 en un espacio abierto con varios caminos
> válidos. Aparece la familia A12 (introducción).

### 8.1. Estado inicial

El jugador entra al interior de los Jardines Fraccionados. Hay
un jardín dividido en cuatro cuadrantes. Cada cuadrante tiene
un mecanismo que acepta una *familia* de configuraciones
distintas; las cuatro convergen en un centro.

### 8.2. Secuencia de beats

1. **Beats 1–4.** El jugador resuelve los cuatro cuadrantes.
   Cada uno admite al menos dos secuencias legales distintas.
2. **Beats 5–6 (integración).** El centro se abre. La Plaza
   de las Medidas recupera su equivalencia: dos plazas que
   antes "sumaban" lo mismo ahora lo muestran otra vez. Un
   mecanismo urbano (e.g. una fuente) vuelve a funcionar.
3. **Beats 7–8 (cierre de ciclo, P08).** La cámara muestra
   el mundo cambiado. La Bitácora formaliza **generalización**
   en su capa de formalización. Aparece un *gancho* hacia el
   Arco II: una máquina con un input y un output que el
   jugador no puede comprender todavía.

### 8.3. Criterios de éxito del arco

- El jugador ha completado los cuatro cuadrantes.
- El jugador ha visto al menos dos soluciones distintas en
  al menos uno de los cuadrantes.
- El centro se ha abierto. La Plaza de las Medidas ha
  recuperado su equivalencia.
- La Bitácora ha formalizado al menos cuatro conceptos.

---

## 9. Restricciones del arco

- **R1.** Las cantidades usadas están en el rango 1–12
  (capítulos 0–2) y 1–24 (capítulos 3–final). No se usan
  cuentas grandes.
- **R2.** Ningún puzzle es un cuestionario ni un multiple
  choice. Todo se valida por condición de éxito (P07).
- **R3.** La notación algebraica no aparece en el camino
  crítico. La Bitácora la muestra *después* de la evidencia
  (P02, P06).
- **R4.** El feedback es geométrico (P05, DL §6). El mundo
  muestra qué se rompió; los NPC no dicen "incorrecto".
- **R5.** Los personajes no recitan teoría (P11). Reaccionan
  al resultado.

---

## 10. Recompensas (DL §2)

| Tipo | Recompensa | Cuándo se entrega |
|---|---|---|
| 1 (transformación del mundo) | La Plaza de las Medidas recupera equivalencias; un mecanismo urbano vuelve a funcionar. | Final del arco |
| 2 (nueva capacidad) | El jugador domina las operaciones C1.1–C1.5 + C2.1. | A lo largo del arco, observable por la Bitácora |
| 3 (acceso) | El centro del Jardín de equivalencias abre una ruta al Arco II. | Final del arco |
| 4 (nueva lectura del sistema) | El jugador reconoce que 12 = 3×4 = 6×2 = 4×3 = 2×6 = 12×1 *produce lo mismo*. | Capítulo 2 en adelante |
| 5 (narrativa) | Tessa aparece y reacciona (sin explicar). | Capítulos 1, 3 y final |

> Las recompensas 5 (narrativa) **no sustituyen** a las 1–4.
> Si una aparece sin la otra, el sistema está postergando su
> cierre (DL §2).

---

## 11. Métricas de éxito del arco (proxy)

> No son visibles al jugador como contadores.

- Tasa de compleción por capítulo (≥ 80% en test).
- Tiempo medio por capítulo (datos de prototipo).
- Tasa de solución múltiple (al menos un 30% de los jugadores
  encuentran al menos dos soluciones en un cuadrante del
  final).
- Tasa de *engagement* (¿el jugador intenta más de una
  configuración antes de quedarse?).

---

## 12. Lo que este documento NO es

- No es un level design final. Las salas exactas, los
  encuadres y la iluminación se deciden en la bible de arte
  y en el prototipo.
- No es un temario curricular completo. Sólo cubre los
  conceptos *necesarios* para que el arco funcione.
- No prescribe motor ni framework.
- No convierte ningún capítulo en una lección.
