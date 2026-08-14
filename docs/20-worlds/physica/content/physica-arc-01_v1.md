---
status: PROPOSED
authority_level: 4
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md (sección 8 — arcos propuestos, ítem Arco I; sección 10 — Vertical slice reboot, en lo que se reordenó como arco jugable)
  - docs/physica/spec-vertical-slice.md (apartado 4 — Escenas 2 a 8 como contenido del arco)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/physica-vision_v1.md
  - ../gameplay/physica-player-movement_v1.md
  - ../gameplay/physica-physics-interaction-system_v1.md
  - ../gameplay/physica-puzzle-grammar_v1.md
  - ../gameplay/physica-mechanics-progression_v1.md
  - ../world/physica-world-structure_v1.md
  - ../narrative/physica-narrative-bible_v1.md
open_questions:
  - PHYS-AR-1 — ¿El capítulo 0 ("La caída imposible") se entrega como **primera pantalla** del Arco I, o como **repetición de una anomalía ya vista** (regresión al Hito 1)? Implicación de producción.
  - PHYS-AR-2 — ¿La Estación cinética (cap. 5) es **un solo puzzle** o **tres puzzles cortos** conectados? Implicación sobre el ritmo.
  - PHYS-AR-3 — ¿El INSTRUMENTO entra con texto del guion v0.2 desde el cap. 3, o se deja silencioso hasta el cap. 4? (Esta sesión recomienda cap. 3 con un fragmento post-evidencia.)
  - PHYS-AR-4 — ¿La **Estación cinética** admite ≥2 soluciones (P07) en el estado final, o se cierra con una única "restauración parcial"? Implicación sobre P07.
  - PHYS-AR-5 — ¿Las piedras recogibles de la cornisa se reponen tras la resolución, o son **insumo único**? Implicación sobre re-jugabilidad.
  - PHYS-AR-6 — ¿Qué se entrega al cerrar el Arco I: una cinemática, una entrada de Bitácora, una nueva capacidad, una región abierta, o todas? Implicación sobre recompensas tipo 1-4.
---

# PHYSICA — ARC 01 (MOVIMIENTO) · v1

Este documento describe el **contenido jugable** del **Arco I —
Movimiento** de Physica. Toma la curva diseñada en
`physica-mechanics-progression_v1.md` §3 y la **aterriza** en
beats concretos: qué vive en cada escena, qué puzzles se juegan,
qué recompensas se entregan, qué texto canónico del guion v0.2 se
usa.

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P3
> sin ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel.

> **Alcance.** Cubre los **6 capítulos del Arco I** y los **beats
> por capítulo**. No prescribe UI, cámara, motor ni pipeline de
> assets. Es un documento de **diseño de contenido** (autoridad
> 4).

> **Texto del juego.** El texto canónico proviene del **guion
> v0.2** (ver `docs/physica/spec-vertical-slice.md` §5). Este
> documento lo **cita**; no lo reescribe. Si se necesita texto
> nuevo: `TODO(guion)` y aviso a Manuel.

---

## 1. Tesis del arco

> **El Arco I entrega intuición y vocabulario operativo sobre
> movimiento, aceleración, masa, fricción y consecuencia
> sistémica. Cierra cuando el jugador puede predecir el resultado
> de un experimento antes de ejecutarlo.**

El Arco I **no** exige que el jugador nombre conceptos. Exige que
los **use**. La formalización ocurre en la Bitácora, al cerrar
el arco, no durante.

---

## 2. Estructura de capítulos

| # | Título | Escena(s) | Familias | Idea ganada | Recompensa tipo 1 |
|---|---|---|---|---|---|
| 0 | La caída imposible | E2 | F1, F2 | "Dos cuerpos del mismo lugar obedecen direcciones distintas." | Cascada **se estabiliza** cuando el jugador delimita la región. |
| 1 | Llegar antes | E2, E4 | F1, F2 | "Predecir requiere comparar dos casos, no aplicar una fórmula." | Una **plataforma anterior** se ancla como atajo curado. |
| 2 | Lo que cambia | E4, E6 | F1, F5 | "Misma distancia, distinta pendiente, distinta trayectoria." | Se **abre un nuevo camino** entre dos regiones. |
| 3 | Peso no es destino | E3 | F3, F4 | "La masa cambia la dinámica, no el destino: el sistema se equilibra." | INSTRUMENTO queda como compañero permanente. |
| 4 | Superficies | E6, E3 | F5, F8 | "La fricción es una propiedad legible del sistema." | Una **rampa** se vuelve utilizable. |
| 5 (Final) | Estación cinética | E7 | F6, F7, F9, F10 | "Las consecuencias se propagan: una intervención afecta a otras." | Estación **se activa parcialmente**; Bitácora del arco se cierra. |

> **Decisión de v1.** El Arco I **no** incluye E8 (Metrópoli) en
> el camino crítico. E8 puede aparecer como un epílogo opcional
> (no obligatorio) si el Vertical Slice lo permite.

---

## 3. Capítulo 0 — La caída imposible

### 3.1 Beats

1. **Llegada.** El avatar aparece en la cornisa. Sin diálogo.
   El agua de la cascada ya está subiendo.
2. **Acción libre.** El jugador camina, salta, observa. Sin
   puzzle explícito.
3. **Primer instrumento.** El reloj-dispositivo entra como
   **observación pasiva**: registra el movimiento del avatar y
   de una piedra.
4. **Primer experimento.** El jugador recoge una piedra (E) y
   la tira (T). La piedra cae con `gA` normal; el agua sigue
   subiendo.
5. **Comparación.** El jugador ve la diferencia entre la
   piedra (cae) y el agua (sube). Sin texto instructivo.
6. **Bitácora — capa informal.** Aparece una entrada: "Distintos
   cuerpos del mismo lugar no parecen obedecer la misma
   dirección" (texto del guion v0.2, línea 1 de Bitácora).
7. **Delimitación.** El jugador puede **trazar** mentalmente la
   región del agua: la cascada sube sólo en `[x ∈ -14..14,
   y ∈ 0..30]`. **Affordance visual**: la espuma y el cambio
   de color marcan la frontera.
8. **Cierre.** Al trazar la región (acción opcional pero
   disponible), la cascada se **estabiliza**: el agua vuelve a
   caer. Recompensa tipo 1.

### 3.2 Familias ejercitadas

- **F1 Alcanzar** (lateral, saltando, caminando).
- **F2 Lanzar** (la piedra).

### 3.3 Variables de dificultad introducidas

- D1.1 (distancia), D1.2 (altura) — para llegar a la cornisa.
- D2.1 (masa de la piedra), D2.2 (`gLocal` del bioma).

### 3.4 Cierre pedagógico

- **Idea ganada.** "Dos cuerpos del mismo lugar pueden obedecer
  direcciones distintas."
- **Formalización.** Sólo al cerrar el arco, en la Bitácora
  formal.

### 3.5 Recompensas

- Tipo 1: cascada se estabiliza (al delimitar la región).
- Tipo 2: nuevo juguete físico: la **piedra** como cuerpo
  lanzable.
- Tipo 4: módulo del reloj **observación** entra.

---

## 4. Capítulo 1 — Llegar antes

### 4.1 Beats

1. **Planteo.** El jugador necesita cruzar a la siguiente
   cornisa. Hay **dos rutas** que se ven a la vez.
2. **Acción.** El jugador prueba la primera ruta.
3. **Medición.** El **cronómetro** del reloj entra (PIS §7.2).
   El jugador mide el tiempo.
4. **Acción 2.** El jugador prueba la segunda ruta.
5. **Comparación.** El jugador compara los dos tiempos.
6. **Reflexión.** El jugador elige la ruta más rápida. **No**
   hay un texto que diga "esta es la correcta". El sistema
   marca cuál fue más rápida.
7. **Recompensa.** La ruta más rápida deja una **plataforma
   anclada** que el jugador puede usar como atajo en
   re-jugadas.

### 4.2 Familias ejercitadas

- **F1 Alcanzar** (caminar, saltar, caer).
- **F2 Lanzar** (opcional, para activar mecanismo).

### 4.3 Variables de dificultad

- D1.1, D1.2, D1.3 (variabilidad del suelo).
- D-VAR-5 (restricciones: tiempo medido como recompensa, no
  como castigo).

### 4.4 Recompensas

- Tipo 1: **atajo curado**.
- Tipo 4: módulo del reloj **cronómetro** entra.
- Tipo 4: módulo del reloj **distancia** entra.

---

## 5. Capítulo 2 — Lo que cambia

### 5.1 Beats

1. **Planteo.** El jugador debe llegar a un punto. Hay dos
   rutas con **misma distancia horizontal** pero **distinta
   pendiente**.
2. **Acción.** El jugador prueba la ruta A (más empinada).
3. **Acción 2.** El jugador prueba la ruta B (más tendida).
4. **Comparación.** El jugador ve que la pendiente cambia
   la **trayectoria** y el **tiempo**, aunque la distancia
   sea la misma.
5. **Predicción.** El jugador **predice** cuál ruta es más
   rápida antes de ejecutar.
6. **Verificación.** El sistema ejecuta la ruta elegida y
   muestra el resultado. El fallo enseña (P05): si el jugador
   eligió mal, ve **qué** pasó.
7. **Recompensa.** Se **abre un nuevo camino** que antes era
   inaccesible (tipo 3). El jugador puede repetir el capítulo
   con predicciones más afinadas.

### 5.2 Familias ejercitadas

- **F1 Alcanzar**.
- **F5 Deslizar** (la pendiente es protagonista).

### 5.3 Variables de dificultad

- D5.1 (pendiente), D5.2 (fricción).
- D-VAR-3 (anticipación), D-VAR-7 (combinación con F1).

### 5.4 Recompensas

- Tipo 3: **acceso** a un nuevo camino.
- Tipo 4: **trayectoria** entra como lectura del reloj (forma
  fantasma tras varios intentos).

---

## 6. Capítulo 3 — Peso no es destino

### 6.1 Beats

1. **Planteo.** En un desfiladero, un instrumento esférico
   (INSTRUMENTO) **flota** en una columna estrecha.
2. **Acción.** El jugador observa. Hay dos corrientes
   verticales opuestas que sostienen al instrumento. El
   **INSTRUMENTO entra**: la primera línea de su voz
   (línea 1 del guion v0.2: "Medición… activa. Desplazamiento…
   ninguno.") sale **después** de que el jugador se acerca
   y observa durante ≥3 segundos. **No** antes.
3. **Acción.** El jugador prueba cubrir una corriente con una
   losa. La corriente que cubrió se debilita. El instrumento
   **desciende**.
4. **Reflexión.** El jugador ve que el instrumento "cae" hacia
   abajo cuando la resultante deja de ser nula. El INSTRUMENTO
   reacciona: "Dos acciones. Una suma sin dirección. Quietud…
   con actividad." (línea 8 del guion v0.2).
5. **Cierre.** El instrumento llega a una cornisa accesible.
   La voz del INSTRUMENTO continúa según la curva de
   `physica-mechanics-progression_v1.md` §3.4.
6. **Recompensa.** El INSTRUMENTO queda como compañero
   permanente. Una pieza frágil aparece como cuerpo disponible
   para transporte (entrada a F3).

### 6.2 Familias ejercitadas

- **F4 Balancear**.
- **F8 Estabilizar** (introductoria).

### 6.3 Variables de dificultad

- D4.1 (contrapesos), D4.2 (brazo de palanca).
- D4.3, D4.4 (masas).

### 6.4 Recompensas

- Tipo 2: **nueva capacidad** (INSTRUMENTO como compañero).
- Tipo 2: **nueva capacidad** (losa como cuerpo de cobertura).
- Tipo 4: módulo del reloj **anclaje (lectura)** entra.

---

## 7. Capítulo 4 — Superficies

### 7.1 Beats

1. **Planteo.** El jugador debe llevar la pieza frágil del
   cap. 3 a una cornisa elevada. La pieza **no** puede
   levantarse directamente.
2. **Acción.** El jugador busca una rampa natural. La encuentra
   cerca (E6, plano inclinado).
3. **Medición.** El **anclaje (lectura)** del reloj entra: el
   jugador ve el efecto de **anclar** un cuerpo sin poder
   anclar (PIS §7.3).
4. **Acción.** El jugador sube la rampa. La pieza resbala
   cuando la fricción de la losa no es la correcta.
5. **Acción.** El jugador **cambia** la losa (o coloca un
   cuña). La fricción cambia. La pieza ya no resbala.
6. **Cierre.** La pieza llega a la cornisa. La rampa queda
   **utilizable** en re-jugadas (recompensa tipo 1).
7. **Bitácora — capa informal.** Aparece una entrada: "Subir
   dando un rodeo: plano inclinado" (texto del guion v0.2,
   línea 4 de Bitácora).
8. **INSTRUMENTO.** Reacción: "Misma altura. Otra dirección.
   Más recorrido." (línea 6 del guion v0.2).

### 7.2 Familias ejercitadas

- **F3 Transportar**.
- **F5 Deslizar**.
- **F8 Estabilizar** (sostener la pieza sobre la rampa).

### 7.3 Variables de dificultad

- D3.1, D3.2.
- D5.1, D5.2.
- D8.1, D8.3.

### 7.4 Recompensas

- Tipo 1: **rampa utilizable** (transformación del mundo).
- Tipo 2: cuña como cuerpo disponible.
- Tipo 4: lectura de anclaje se vuelve familiar.

---

## 8. Capítulo 5 (Final) — Estación cinética

### 8.1 Beats

1. **Planteo.** El jugador llega a la Estación Pedagógica
   (E7). Tres anillos con marcas del Instituto, una palanca
   central, varias piezas acoplables.
2. **Acción.** El jugador **ancla** una plataforma (el módulo
   de **anclaje (escritura)** se habilita **al entrar a E7**,
   como culminación de la curva del reloj).
3. **Acción.** El jugador **orienta** un vector usando un
   deflector.
4. **Acción.** El jugador **sostiene** una roca con un
   contrapeso.
5. **Acción.** El jugador **acopla** el INSTRUMENTO al
   mecanismo de la Estación.
6. **Cierre.** La región se **estabiliza parcialmente**: la
   anomalía de E5 (corriente) se reduce; E4 (plataformas a la
   deriva) reduce su velocidad. **Pero** otra roca comienza a
   flotar (consecuencia no deseada, **P08**: el conocimiento
   restaura pero también perturba).
7. **INSTRUMENTO.** Voz: "La estación respondió. También
   cambió algo que no medimos." (línea 9 del guion v0.2).
8. **Voz docente.** Línea 14 del guion v0.2: "…ningún
   experimento está aislado cuando comparte el mundo con
   otro…" (una sola vez por arco, después de evidencia).
9. **INSTRUMENTO.** Voz: "No falló. Obedeció demasiadas
   instrucciones." (línea 10 del guion v0.2).
10. **Bitácora formal.** Se entrega la **capa formal** del
    arco: registro de los cinco fenómenos observados, con la
    terminología técnica (masa, fuerza, fricción, vector,
    energía, sistema de referencia).
11. **Cierre del arco.** El jugador queda en E7 con la
    Estación parcialmente activada.

### 8.2 Familias ejercitadas

- **F6 Transferir** (la energía se transmite entre cuerpos).
- **F7 Almacenar** (el contrapeso almacena energía potencial).
- **F9 Construir** (la Estación se construye con piezas).
- **F10 Redirigir** (el deflector cambia la trayectoria).
- (F1, F2, F3, F4, F5, F8 — repaso implícito de lo aprendido.)

### 8.3 Variables de dificultad

- D-VAR-4 (simultaneidad), D-VAR-5 (restricciones), D-VAR-7
  (combinación).
- D6, D7, D9, D10 completas.

### 8.4 Recompensas

- **Tipo 1 (dominante):** Estación parcialmente activada;
  anomalías regionales disminuyen; una roca nueva queda
  flotando (misterio que abre el Arco II).
- **Tipo 2:** INSTRUMENTO acoplable a mecanismos (capacidad
  nueva).
- **Tipo 3:** acceso a la cornisa sobre E7 (vista
  panorámica).
- **Tipo 4:** módulo del reloj **anclaje (escritura)** se
  habilita; módulo de **comparación A/B** se insinúa.
- **Tipo 5:** voz docente (una vez).
- **Tipo 1 (doble):** Bitácora formal del arco se entrega
  (transforma la lectura del mundo: el jugador tiene ahora un
  mapa conceptual).

---

## 9. Epílogo opcional — E8 Metrópoli

> **Decisión de v1.** El epílogo E8 **no** entra en el camino
> crítico. Si se incluye, ocurre **después** del cierre del
> arco, como un retorno del avatar a E8. El epílogo muestra la
> Metrópoli desde la plataforma de observación y deja **una
> línea** del INSTRUMENTO:

- "La estación del valle era una entrada. Allí… hay demasiadas
  referencias." (línea 11 del guion v0.2).
- "Y una señal que todavía reconoce el reloj." (línea 12).
- "Este lugar también era parte de la medición." (línea 13).

> Si el Vertical Slice excluye E8, estas líneas se reservan
> para el inicio del Arco II.

---

## 10. Validación por condiciones en el Arco I

Cada puzzle del Arco I valida por **condiciones**, no por
solución fija (P07). Las condiciones se enuncian en el cuerpo
del documento del puzzle (futuro) y se referencian aquí.

### 10.1 Condiciones tipo

- **Posición.** Un cuerpo está en una región objetivo.
- **Velocidad.** La velocidad final de un cuerpo es menor que
  un umbral (por ejemplo, la pieza frágil llega con `|v| <
  0.5 m/s`).
- **Estado estable.** Una estructura no colapsa durante
  `T_estabilidad = 2 s`.
- **Tiempo.** El sistema cumple la condición dentro de un
  plazo opcional (no exigido en el camino crítico).

### 10.2 Recompensa por optimización (P13)

El Modo Maestría del Arco I premia:

- menor tiempo de cierre del arco;
- menor cantidad de piedras usadas;
- menor cantidad de resets;
- trayectorias más eficientes (medidas con el reloj).

Estas métricas **no bloquean** la campaña principal.

---

## 11. Lo que este documento NO es

- No es **spec de hito**. La spec de hito define implementación
  concreta, modelos puros, tests, motor, pipeline. Vive en
  `docs/physica/spec-*.md` (ya existente) y en futuros
  `docs/20-worlds/physica/production/`.
- No prescribe **el texto exacto** de los diálogos. Ese
  contrato es el guion v0.2.
- No prescribe **qué biomas** existen más allá de los 7 del
  arco. Las regiones futuras viven en
  `world/physica-world-structure_v1.md` §10 (open question).
- No prescribe **cámara ni UI**. Eso vive en spec de hito.

---

## 12. Conexión con el resto de Physica

- La **curva de mecánicas** del arco vive en
  `gameplay/physica-mechanics-progression_v1.md` §3.
- Las **familias de puzzle** se describen en
  `gameplay/physica-puzzle-grammar_v1.md` §2.
- El **mundo** se describe en
  `world/physica-world-structure_v1.md` §3–4.
- La **voz del INSTRUMENTO y la Voz Docente** se describen en
  `narrative/physica-narrative-bible_v1.md` §3.
- El **vertical slice** (subconjunto jugable) se describe en
  `content/physica-vertical-slice_v1.md`.
- La **evaluación de prototipo** (qué se mide) se describe en
  `production/physica-prototype-evaluation_v1.md`.
