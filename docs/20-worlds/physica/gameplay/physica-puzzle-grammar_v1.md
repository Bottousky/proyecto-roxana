---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md (sección 7 — puzzle grammar por fenómeno; sección 8 — diseño de experimento; sección 11 — diseño de dificultad)
  - docs/physica/spec-vertical-slice.md (apartado 4 — escenas y mecánicas, en lo que clasifica puzzles)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/physica-vision_v1.md
  - ./physica-player-movement_v1.md
  - ./physica-physics-interaction-system_v1.md
open_questions:
  - PHYS-PG-1 — ¿La familia F1 (Alcanzar) se reduce al plataformero, o se admite "alcanzar" en el sentido de manipular algo lejano (cuerda, anilla, garfio)?
  - PHYS-PG-2 — ¿La familia F11 (Resonancia) entra en el primer juego o queda para Arco IV? Implicación: la familia requiere C6 (Ondas) que está fuera del Arco I.
  - PHYS-PG-3 — ¿La familia F12 (Luz) es jugable o ambiental? Implicación: requiere C7 (Óptica), que el pack declara como "no todo tiene que entrar en el primer juego/arco".
  - PHYS-PG-4 — ¿F9 (Construir) admite "construcción cerrada" (sólo con los elementos provistos en el puzzle) o "construcción abierta" (con todos los elementos disponibles en el bioma)? Implicación pedagógica.
  - PHYS-PG-5 — ¿F8 (Estabilizar) requiere masa aparente del avatar variable, o es suficiente con un cuerpo de comparación externo? Ligado a PHYS-PM-1.
  - PHYS-PG-6 — ¿La validación por condiciones admite "casi-éxito" con crédito parcial, o sólo éxito/fallo? Implicación sobre P13 (la maestría es opcional, la comprensión no).
---

# PHYSICA — PUZZLE GRAMMAR · v1

Este documento define la **gramática de puzzles** de Physica. Una
gramática es un conjunto cerrado de **familias** que, combinadas,
cubren el espacio de puzzles posible de un mundo. Cada familia tiene
una definición, ejemplos, las variables de dificultad que la
complican, y la lista de lo que **no** es un puzzle de esa familia.

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P3
> sin ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel.

> **Cobertura obligatoria.** El pack de la sesión P3 exige cubrir al
> menos 8 de las 12 familias. Este documento define las 12 familias
> (F1–F12) y declara cuáles entran en el Arco I.

---

## 1. Qué es un puzzle de Physica

Un puzzle de Physica es una **situación física acotada** en la que el
jugador debe **modificar una o más variables del mundo** para llevar
un sistema desde un estado inicial hasta un estado objetivo
verificable. La modificación se hace por **acción corporal o
instrumental** sobre el mundo, no por menú.

### 1.1 Anatomía mínima de un puzzle de Physica

```text
Puzzle {
  bioma:        ID
  estado_inicial: { cuerpos: [...], condiciones: [...], campos: [...] }
  estado_objetivo: { cuerpos: [...], condiciones: [...] }
  acciones_disponibles: [...]   // verbos del cuerpo + instrumentos
  validacion:   'por_condiciones' | 'por_comparacion' | 'hibrida'
  capas:        [C0..C7]        // capas que activa (ver PIS §2)
  familias:     [F1..F12]       // familias que ejercita
  dificultad:   { ver §3 }
  recompensas:  { ver §4 }
}
```

### 1.2 Lo que un puzzle de Physica **no** es

- No es un **cuestionario**. Nunca se pregunta "¿cuál es la
  fórmula?".
- No es un **menú de opciones**. La respuesta no se elige entre
  alternativas mostradas: se construye con el cuerpo.
- No es una **trivia**. No se gana por recordar un dato aislado
  (P04).
- No es un **arcade de puntería**. Lanzar es razonamiento espacial,
  no precisión motriz fina.
- No es un **examen de "incorrecto"**. El fallo produce
  información, no castigo (P05).

---

## 2. Las 12 familias (F1–F12)

Cada familia se define con: **verbo nuclear**, **acción del
jugador**, **estado objetivo típico**, **variables de dificultad**,
**capas que activa**, **entra en Arco I**.

### F1 — Alcanzar
- **Verbo.** Mover el propio cuerpo para llegar a un lugar.
- **Acción del jugador.** Caminar, correr, saltar, caer, deslizarse.
- **Estado objetivo típico.** El avatar está en un punto X con
  condiciones (por ejemplo: de pie sobre la cornisa, sin caída
  libre).
- **Variables de dificultad.**
  - D1.1 — Distancia horizontal a cubrir.
  - D1.2 — Altura vertical a ganar.
  - D1.3 — Variabilidad del suelo (pendientes, huecos, plataformas
    móviles).
  - D1.4 — Restricciones de input (gravedad local invertida en la
    zona, viento, etc.).
  - D1.5 — Coyote time reducido o aire denso (masa aparente alta).
  - D1.6 — Plataformas que sólo aparecen tras una condición.
- **Capas.** C0.
- **Entra en Arco I.** **Sí** (familia base; no todos los puzzles
  del Arco I son F1, pero F1 está siempre presente como capa de
  lectura).
- **No es.** Un *precision platformer*. La legibilidad del salto
  es prioritaria sobre la dificultad del input.

### F2 — Lanzar
- **Verbo.** Imprimir una velocidad inicial a un cuerpo.
- **Acción del jugador.** Cargar un lanzamiento, soltar.
- **Estado objetivo típico.** El cuerpo lanzado cumple una
  condición: pasa por un umbral, impacta un blanco, llega a una
  posición final.
- **Variables de dificultad.**
  - D2.1 — Masa del cuerpo lanzado (afecta trayectoria bajo fuerza
    dada).
  - D2.2 — `gLocal` del bioma (invertida, parcial, normal).
  - D2.3 — Corriente lateral (C5 incipiente) que desvía.
  - D2.4 — Restricciones de ángulo (sólo lateral, sólo oblicuo).
  - D2.5 — Blancos múltiples o en movimiento.
  - D2.6 — Tiempo: el blanco está disponible una ventana.
- **Capas.** C0 + C1.
- **Entra en Arco I.** **Sí** (Escena 5 con corriente).
- **No es.** *Puntería*. El blanco tiene un umbral generoso y la
  condición de éxito es de "estado", no de "píxel".

### F3 — Transportar
- **Verbo.** Mover un cuerpo de un lugar a otro, con restricciones.
- **Acción del jugador.** Cargar, empujar, arrastrar, tirar.
- **Estado objetivo típico.** El cuerpo está en una posición
  objetivo, en una orientación admisible, con una velocidad menor
  que un umbral.
- **Variables de dificultad.**
  - D3.1 — Masa del cuerpo a transportar.
  - D3.2 — Terreno por el que se transporta (pendientes, escalones,
    obstáculos).
  - D3.3 — Fragilidad (el cuerpo se rompe al impactar).
  - D3.4 — Capacidad del avatar (limitación de masa a `CARRY`).
  - D3.5 — Ruta mínima exigida (no se puede pasar por un punto
    crítico).
  - D3.6 — Tiempo o energía disponible.
- **Capas.** C1 + C0 (desplazamiento).
- **Entra en Arco I.** **Sí** (Escena 4 con pieza frágil).
- **No es.** *Sokoban*. Las restricciones son físicas, no
  topológicas.

### F4 — Balancear
- **Verbo.** Equilibrar dos o más fuerzas o masas opuestas.
- **Acción del jugador.** Añadir o retirar peso, mover un contrapeso,
  cambiar el brazo de palanca.
- **Estado objetivo típico.** La resultante sobre un cuerpo es
  nula o cumple un criterio.
- **Variables de dificultad.**
  - D4.1 — Cantidad de contrapesos.
  - D4.2 — Distancia al fulcro (brazo de palanca).
  - D4.3 — Masa de los cuerpos colocados.
  - D4.4 — Masa del cuerpo a equilibrar.
  - D4.5 — Estabilidad del equilibrio (centro de masa sobre la
    base).
  - D4.6 — Número de estados de equilibrio posibles.
- **Capas.** C4 + C1.
- **Entra en Arco I.** **Sí** (Escena 3 con instrumento
  suspendido).
- **No es.** *Timing* o *coordinación*. Es masa, distancia,
  resultante.

### F5 — Deslizar
- **Verbo.** Aprovechar gravedad y fricción sobre una pendiente.
- **Acción del jugador.** Posicionarse, soltar, empujar un objeto
  sobre la pendiente.
- **Estado objetivo típico.** El cuerpo llega al pie de la
  pendiente con una velocidad dentro de un rango, o se detiene en
  un punto.
- **Variables de dificultad.**
  - D5.1 — Pendiente `θ` (de rasante a casi vertical).
  - D5.2 — Fricción de la superficie (de hielo a pegajosa).
  - D5.3 — Masa del cuerpo.
  - D5.4 — Restitución al pie (rebota o no).
  - D5.5 — Punto de partida (no es libre; está restringido).
  - D5.6 — Trampas en el camino (obstáculos, otros planos).
- **Capas.** C0 + C1.
- **Entra en Arco I.** **Sí** (Escena 6 con plano inclinado).
- **No es.** *Slope puzzle* de *ski*. No es競技; es físico.

### F6 — Transferir
- **Verbo.** Transferir momento o energía entre cuerpos por
  colisión.
- **Acción del jugador.** Lanzar un cuerpo contra otro, hacer
  chocar, encadenar.
- **Estado objetivo típico.** El cuerpo impactado tiene una
  velocidad o trayectoria que cumple una condición.
- **Variables de dificultad.**
  - D6.1 — Coeficiente de restitución del par.
  - D6.2 — Masas relativas.
  - D6.3 — Ángulo de impacto.
  - D6.4 — Número de cuerpos en la cadena.
  - D6.5 — Pérdidas por rozamiento en cada transferencia.
  - D6.6 — Restricciones de la trayectoria posterior (canales,
    guías).
- **Capas.** C2.
- **Entra en Arco I.** **Sí** (integrada en la Estación cinética,
  fin del Arco I).
- **No es.** *Billar*. La cadena es física, pero el objetivo es
  sistémico, no carambola.

### F7 — Almacenar
- **Verbo.** Almacenar energía potencial (altura, resorte) o
  cinética (velocidad) para liberarla después.
- **Acción del jugador.** Subir un cuerpo, comprimir un resorte,
  detener un péndulo en su punto alto.
- **Estado objetivo típico.** La energía se libera en el momento
  y dirección correctos.
- **Variables de dificultad.**
  - D7.1 — Constante del resorte `k`.
  - D7.2 — Altura de la que se cae.
  - D7.3 — Masa del cuerpo.
  - D7.4 — Amortiguación del sistema.
  - D7.5 — Geometría de la liberación (vector de salida).
  - D7.6 — Tiempo de retardo permitido.
- **Capas.** C3 + C0.
- **Entra en Arco I.** **Sí** (introductoria; Arco III lo
  expande).
- **No es.** *Trampolín*. La energía es el medio, no el fin.

### F8 — Estabilizar
- **Verbo.** Mantener un cuerpo o sistema en equilibrio a pesar
  de perturbaciones.
- **Acción del jugador.** Añadir soporte, mover el centro de masa,
  cambiar la base de apoyo.
- **Estado objetivo típico.** El sistema no cae durante una
  ventana de tiempo o frente a un evento.
- **Variables de dificultad.**
  - D8.1 — Tamaño de la base.
  - D8.2 — Altura del centro de masa.
  - D8.3 — Magnitud de la perturbación.
  - D8.4 — Frecuencia de la perturbación.
  - D8.5 — Restricciones de los soportes disponibles.
  - D8.6 — Cantidad de elementos a estabilizar simultáneamente.
- **Capas.** C4 + C1.
- **Entra en Arco I.** **Sí** (introductoria).
- **No es.** *Jenga*. La pieza no se apila por turnos: se
  sostiene por su física.

### F9 — Construir
- **Verbo.** Crear un puente, rampa, mecanismo o cadena a partir
  de elementos provistos.
- **Acción del jugador.** Colocar piezas, unirlas, fijarlas.
- **Estado objetivo típico.** La construcción cumple su función
  (sostener peso, redirigir, transmitir fuerza).
- **Variables de dificultad.**
  - D9.1 — Cantidad y tipo de piezas disponibles.
  - D9.2 — Restricciones de unión (qué encaja con qué).
  - D9.3 — Masa máxima a sostener.
  - D9.4 — Estabilidad de la construcción bajo carga.
  - D9.5 — Tiempo o iteraciones disponibles.
  - D9.6 — Apertura del espacio de construcción (cerrada vs.
    abierta; ver PHYS-PG-4).
- **Capas.** C1 + C4.
- **Entra en Arco I.** **Sí** (Escena 7 — Estación, integradora).
- **No es.** *Constructor libre*. Las piezas tienen comportamiento
  físico, no son ladrillos genéricos.

### F10 — Redirigir
- **Verbo.** Cambiar la trayectoria o fuerza de un cuerpo en
  movimiento.
- **Acción del jugador.** Inclinar un plano, mover un deflector,
  aplicar un segundo vector.
- **Estado objetivo típico.** El cuerpo pasa por una posición o
  llega a un estado final distinto al que habría tenido sin la
  intervención.
- **Variables de dificultad.**
  - D10.1 — Ángulo del redireccionador.
  - D10.2 — Coeficiente de restitución del redireccionador.
  - D10.3 — Fricción de la superficie de redirección.
  - D10.4 — Velocidad del cuerpo incidente.
  - D10.5 — Restricciones temporales (ventana en la que se puede
    redirigir).
  - D10.6 — Masa del redireccionador (móvil vs. fijo).
- **Capas.** C0 + C1 + C2.
- **Entra en Arco I.** **Sí** (Escena 5 — composición de
  vectores).
- **No es.** *Puzzle de billar con bordes*. La condición es
  sistémica, no carambola.

### F11 — Resonancia
- **Verbo.** Acoplar la frecuencia de un sistema a la frecuencia
  natural de otro.
- **Acción del jugador.** Ajustar longitud, masa, tensión; modular
  el swing.
- **Estado objetivo típico.** Un sistema oscila con amplitud
  máxima o transfiere energía máxima.
- **Variables de dificultad.**
  - D11.1 — Frecuencia objetivo.
  - D11.2 — Tolerancia de frecuencia.
  - D11.3 — Número de osciladores en juego.
  - D11.4 — Amortiguación.
  - D11.5 — Forma de la onda (fase).
  - D11.6 — Tiempo disponible para el acople.
- **Capas.** C6.
- **Entra en Arco I.** **No** (queda para Arco IV; C6 no entra
  en el primer arco).
- **No es.** *Piano tiles*. Es frecuencia y acoplamiento.

### F12 — Luz
- **Verbo.** Encaminar un haz de luz por reflexión y refracción.
- **Acción del jugador.** Colocar espejos, lentes, prismas.
- **Estado objetivo típico.** El haz incide sobre un receptor.
- **Variables de dificultad.**
  - D12.1 — Cantidad de elementos disponibles.
  - D12.2 — Ángulo crítico del material.
  - D12.3 — Índice de refracción de los medios.
  - D12.4 — Distancia entre emisor y receptor.
  - D12.5 — Pérdida de intensidad por cada interacción.
  - D12.6 — Restricciones geométricas (espacio cerrado, sin
   镜子 en ciertas zonas).
- **Capas.** C7.
- **Entra en Arco I.** **No** (queda para Arco V; C7 no entra
  en el primer arco).
- **No es.** *Líneas ópticas escolares*. La luz es un haz con
  comportamiento físico, no una "línea" abstracta.

---

## 3. Variables de dificultad — anatomía común

Las variables `D?.?` enumeradas arriba no son ad-hoc: pertenecen a
una **anatomía común** que cualquier familia de puzzle de Physica
puede usar para subir la dificultad sin violar las fuentes prohibidas
(Design Language §4).

| Categoría | Variable típica | Ejemplo |
|---|---|---|
| Cantidad de variables | D-VAR-1 | Más elementos a coordinar. |
| Distancia causa-efecto | D-VAR-2 | Acción y resultado separados por varios pasos. |
| Necesidad de anticipación | D-VAR-3 | El resultado depende de leer el futuro del sistema. |
| Simultaneidad | D-VAR-4 | Varios sistemas activos al mismo tiempo. |
| Restricciones | D-VAR-5 | Menos piezas, menos tiempo, menos energía. |
| Información incompleta | D-VAR-6 | El jugador no ve todo, pero puede inferir. |
| Combinación de conceptos | D-VAR-7 | Varias familias activas en un mismo puzzle. |
| Variedad de soluciones | D-VAR-8 | ≥2 rutas válidas, con costes distintos. |
| Optimización | D-VAR-9 | "Funciona" → "funciona mejor". |

> **Regla.** Si la única forma de subir la dificultad es esconder
> información sin que sea inferible, el puzzle está malogrando la
> curva (P05, DL §4).

---

## 4. Validación por condiciones (P07)

Un puzzle de Physica **nunca** se valida por solución única. La
validación es por **condiciones** sobre el estado final.

### 4.1 Esquema de validación

```text
validar(estado_final) {
  return (
    condicion_1(estado_final) &&
    condicion_2(estado_final) &&
    ...
    !viola_prohibicion(estado_final)
  )
}
```

### 4.2 Condiciones típicas

- **Posición.** Un cuerpo está dentro de una región.
- **Velocidad.** Un cuerpo tiene velocidad menor que un umbral.
- **Energía.** Un cuerpo tiene energía potencial o cinética en un
  rango.
- **Resultado.** Una derivada del estado es estable (un péndulo
  sigue oscilando, una estructura no colapsa).
- **Tiempo.** Las condiciones se cumplen dentro de un plazo.

### 4.3 Prohibiciones (lo que nunca se exige como condición)

- **Forma única** de la solución. Si el puzzle puede resolverse
  con dos rutas físicamente razonables, **ambas** son válidas.
- **Pasos exactos**. El conteo de acciones no es condición.
- **Estética** de la solución. La elegancia es una **recompensa
  opcional** (P13).

### 4.4 Recompensa por optimización (P13)

Una segunda capa, opcional, premia:

- menor energía consumida;
- menor tiempo;
- menor cantidad de elementos usados;
- menor varianza entre intentos.

Esta capa vive en el **Modo Maestría** y nunca bloquea la campaña
principal.

---

## 5. Diseño de experimento (P02 + P05 + P14)

Cada puzzle de Physica debe permitir al menos uno de:

- **Cambiar una variable.** El puzzle expone al menos una variable
  modificable.
- **Ejecutar.** El jugador puede lanzar la simulación.
- **Comparar resultados.** El puzzle muestra el resultado con
  legibilidad (visual, sonora, numérica opcional).
- **Iterar.** El puzzle permite reintentar sin castigo.

> **Regla.** Si el puzzle se resuelve por **timing motor** sin
> lectura del fenómeno, **se aleja de la identidad** (pack P3 §9)
> y debe rediseñarse.

### 5.1 Estructura mínima de un "experimento jugable"

1. **Hipótesis implícita.** El jugador llega con una corazonada
   (qué pasa si...).
2. **Acción.** El jugador modifica la variable.
3. **Ejecución.** El sistema muestra la consecuencia.
4. **Comparación.** El jugador compara lo esperado con lo obtenido.
5. **Reformulación.** El jugador ajusta la hipótesis.
6. **Verificación.** El jugador ejecuta de nuevo y obtiene el
   estado objetivo (o un estado más cercano).

El paso 1 nunca se le entrega al jugador como texto. La corazonada
es del jugador.

---

## 6. Familias que entran en el Arco I

| Familia | ¿Entra en Arco I? | Escena(s) de ejemplo | Notas |
|---|---|---|---|
| F1 Alcanzar | **Sí** | E2, E4 | Capa de lectura. |
| F2 Lanzar | **Sí** | E2, E5 | E2 piedras, E5 vectores. |
| F3 Transportar | **Sí** | E4 | Pieza frágil. |
| F4 Balancear | **Sí** | E3 | Instrumento suspendido. |
| F5 Deslizar | **Sí** | E6 | Plano inclinado. |
| F6 Transferir | **Sí** (introductoria) | E7 | Estación cinética. |
| F7 Almacenar | **Sí** (introductoria) | E3, E6 | Resorte implícito. |
| F8 Estabilizar | **Sí** (introductoria) | E3, E7 | Equilibrio estable. |
| F9 Construir | **Sí** | E7 | Estación integradora. |
| F10 Redirigir | **Sí** | E5 | Composición de vectores. |
| F11 Resonancia | No (Arco IV) | — | Capa C6. |
| F12 Luz | No (Arco V) | — | Capa C7. |

> **Cobertura.** El Arco I activa **10 de las 12 familias** (F1–F10),
> excediendo el mínimo de 8 exigido por la DoD. F11 y F12 quedan
> para arcos futuros, alineadas con las decisiones de "no todo
> tiene que entrar en el primer juego" (PIS §1, pack P3 §6).

---

## 7. Lo que este documento NO es

- No prescribe **qué puzzles específicos** se juegan en cada arco.
  Eso vive en `content/physica-arc-01_v1.md`.
- No prescribe **cómo se renderiza** la condición cumplida. Eso
  vive en spec de hito y runtime.
- No prescribe **qué biomas existen**. Eso vive en
  `world/physica-world-structure_v1.md`.
- No prescribe **qué dice el INSTRUMENTO** cuando un puzzle se
  resuelve. Eso vive en
  `narrative/physica-narrative-bible_v1.md`.

---

## 8. Conexión con el resto de Physica

- Las **8 capas** (PIS §2) se cruzan con las familias: cada
  puzzle activa una o más.
- La **curva de cuándo entra cada familia** vive en
  `gameplay/physica-mechanics-progression_v1.md` §3.
- Los **puzzles concretos** del Arco I se diseñan en
  `content/physica-arc-01_v1.md`.
- La **voz del INSTRUMENTO** al resolverse un puzzle vive en
  `narrative/physica-narrative-bible_v1.md`.
