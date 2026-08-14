---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md (sección 9 — estructura del mundo)
  - docs/physica/spec-vertical-slice.md (apartado 1 — layout espacial continuo, en lo que describe las 7 escenas; apartado 4 — Escena 8 Metrópoli, en lo que describe su rol)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/physica-vision_v1.md
  - ../gameplay/physica-player-movement_v1.md
  - ../gameplay/physica-physics-interaction-system_v1.md
  - ../gameplay/physica-puzzle-grammar_v1.md
  - ../gameplay/physica-mechanics-progression_v1.md
open_questions:
  - PHYS-WS-1 — ¿La Metrópoli de Escena 8 se entrega en el Arco I, o se pospone hasta un arco dedicado? (decisión de Manuel, ligada a `physica-vision_v1.md` PHYS-VQ-1)
  - PHYS-WS-2 — ¿Las regiones futuras (Canteras, Jardines de péndulos, Canales, Torres de sonido, Distrito óptico, Anillo térmico, Complejo orbital) entran como **contenido del primer producto**, o son una **lista de exploración** que se valida arco a arco?
  - PHYS-WS-3 — ¿La cámara lateral 2.5D admite un **eje curado adicional** (vista cenital puntual) en algunas regiones (por ejemplo, observación de la Metrópoli), o se mantiene estrictamente lateral?
  - PHYS-WS-4 — ¿Las Estaciones funcionan como **fast-travel** (P08 / DESIGN LANGUAGE §2 recompensa tipo 3) o sólo como **hitos narrativos** sin atajo?
  - PHYS-WS-5 — ¿La conexión con el Instituto (Aula de Física) es **requerida** para iniciar el Arco I, o el Arco I puede jugarse standalone y el portal es un wrap posterior? (Implicación de producción y de integración P6.)
---

# PHYSICA — WORLD STRUCTURE · v1

Este documento describe la **estructura del mundo de Physica**:
cómo se organizan las regiones, cómo se conectan, qué papel
cumplen los lugares recurrentes, y cómo se delimita la geografía
de la anomalía.

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P3
> sin ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel.

> **Alcance.** Describe la **geografía jugable y la cámara**, no la
> narrativa de cada lugar (que vive en
> `narrative/physica-narrative-bible_v1.md`) ni los puzzles
> específicos de cada escena (que viven en
> `content/physica-arc-01_v1.md`).

---

## 1. Tesis

> **Physica es un mundo lateral, continuo, donde cada región es
> una configuración local con su propia regla física legible.**

El mundo no es un mapa de niveles. Es un **continuo espacial** que el
jugador atraviesa caminando. Las anomalías son **regionales**, no
mundiales, y la cámara no se rompe entre regiones: cambia de
encuadre, no de eje.

---

## 2. Eje de juego y cámara

### 2.1 Eje lateral 2.5D

- El plano principal de juego es el **eje horizontal** (X).
- El avatar se mueve en el plano `(X, Y)`. La profundidad (Z) se
  usa para **parallax, composición y profundidad visual**, no para
  navegar.
- La cámara es **perspectiva con fov cerrado** (~10–12° en el Hito
  1, decisión de Manuel 2026-08-05). El fov puede variar entre
  regiones para encuadrar la escala monumental.

### 2.2 Encuadres curados

Cada región tiene un **encuadre curado** que se activa cuando el
avatar entra al rango de la región. Los encuadres son:

- **Lateral cercano** (cornisa, salones, interiores): el avatar
  ocupa 1/3 de la altura de la pantalla.
- **Lateral amplio** (cascada, valle, metrópoli): el avatar
  ocupa 1/8 o menos, y la cámara hace **dolly-out** para revelar
  la escala.
- **Lateral con profundidad** (estación, observación): parallax
  fuerte, foreground y background.

> **Decisión de v1.** El cambio de encuadre es **continuo** (lerp
  de cámara), no un corte. Esto protege la sensación de mundo y la
  fluidez de la locomoción.

### 2.3 Eje curado adicional (pregunta abierta)

`PHYS-WS-3` — La Metrópoli y ciertos puzzles pueden requerir un
**eje curado adicional** (por ejemplo, vista cenital para la
observación de la ciudad). Mi recomendación: **no** en el Arco I;
reservar a un arco dedicado.

---

## 3. Las 7 escenas del Arco I (esquema)

El pack P3 §13 y el canon preexistente (spec-vertical-slice.md)
coinciden en una secuencia de **siete escenas** dentro del Arco I,
más una escena final de observación. Este documento fija la
**función** de cada una; la mecánica detallada vive en
`content/physica-arc-01_v1.md`.

| # | Escena | Función | Bioma | Capa principal |
|---|---|---|---|---|
| E2 | Cascada ascendente | Anomalía de apertura. | Cornisa + lago. | C0 + C1 |
| E3 | Instrumento suspendido | Equilibrio de fuerzas. | Desfiladero. | C1 + C4 |
| E4 | Plataformas a la deriva | Sistema de referencia. | Valle. | C0 |
| E5 | Corriente transversal | Composición de vectores. | Grieta. | C0 + C1 + C2 |
| E6 | Roca y plano inclinado | Fricción y plano. | Rampa. | C0 + C1 |
| E7 | Estación pedagógica | Integración. | Estación. | C0–C4 (todas) |
| E8 | Metrópoli (observación) | Promesa de expansión. | Plataforma. | (no jugable en E8; observación) |

> **Nota sobre E1.** La Escena 1 (Aula de Física en el Instituto)
> pertenece al dominio de integración con el Instituto (P6). En
> el estado actual, el Hito 1 entrega E2 como **punto de entrada
> standalone** de Physica, sin pasar por E1. La integración E1
> → E2 es un hito futuro.

### 3.1 Continuidad espacial

El mundo se atraviesa de izquierda a derecha (de `x = -14` a
`x = 90+`) sin pantallas de carga. La cámara **no se rompe**
entre escenas; cambia de encuadre, no de plano.

### 3.2 Tamaño del mundo

- Longitud total del Arco I: ~100 m en el eje X.
- Altura máxima explorable: ~30 m (cascada).
- Profundidad visual: hasta 80 m (parallax), no navegable.

> **Decisión de v1.** No hay saltos de pantalla ni
> *teleports* en el Arco I. La excepción es el regreso al
> Instituto (que ocurre en la frontera con P6, no dentro del
> arco).

---

## 4. Biomas y anomalías (qué cambia de región a región)

Cada escena es un **bioma** con su propia configuración. La
configuración se declara como un objeto explícito (PIS §3).

### 4.1 E2 — Cornisa + cascada ascendente

- `gLocal` para sustancia **agua**: `+9.8 m/s²` (en la región
  `[x ∈ -14..14, y ∈ 0..30]`).
- `gLocal` para sólidos (piedra, avatar): `-9.8 m/s²` (normal).
- Borde visible: **espuma y remolino** en la frontera de la
  región.
- Anomalía legible: dos cuerpos del mismo lugar obedecen
  direcciones distintas.

### 4.2 E3 — Desfiladero con instrumento suspendido

- `gLocal`: normal.
- Campos: dos **corrientes verticales opuestas** (↑ y ↓) en una
  columna estrecha.
- Anomalía legible: la **quietud activa** (fuerzas que se
  cancelan).

### 4.3 E4 — Valle con plataformas a la deriva

- `gLocal`: normal.
- Plataformas con `vX ≠ 0` (velocidad horizontal constante).
- Anomalía legible: el movimiento **relativo** (sistema de
  referencia).

### 4.4 E5 — Grieta con corriente transversal

- `gLocal`: normal.
- Corriente horizontal con vector `(±vx, 0)`.
- Anomalía legible: la **composición de vectores**.

### 4.5 E6 — Rampa de roca

- `gLocal`: normal.
- Plano inclinado `θ` con `μ` controlable.
- Anomalía legible: **fricción** como propiedad legible.

### 4.6 E7 — Estación pedagógica

- `gLocal`: normal.
- Mecanismos acoplables (anillos, palancas, plataformas).
- Anomalía legible: las **consecuencias sistémicas** de una
  intervención (P08 / pack P3 §13 Final).

### 4.7 E8 — Plataforma de observación

- `gLocal`: normal.
- Sin jugabilidad activa: **vista de la Metrópoli**.
- Función narrativa: **promesa de expansión**.

> **Decisión de v1.** E8 **no** se entrega en el Vertical Slice
> (vs.) a menos que la ratificación del vs. lo incluya. Ver
> `content/physica-vertical-slice_v1.md` §3.

---

## 5. Lugares recurrentes

### 5.1 La Estación Pedagógica

- Es un lugar **recurrente**: aparece en cada arco como punto de
  cierre y de síntesis.
- En el Arco I, **una sola estación** (E7). En arcos futuros,
  varias estaciones distribuidas.
- La estación **no** es un fast-travel por defecto (PHYS-WS-4):
  es un **hito** con función de síntesis. Si el producto decide
  habilitar fast-travel, la Estación lo habilita, pero esa
  decisión es de scope posterior.

### 5.2 El Valle Variable

- Valle central del Arco I: E2, E3, E4, E5, E6.
- **Una sola** anomalía regional por zona. No se solapan.
- El Valle es la "promenade" del Arco I: un lugar para caminar y
  pensar.

### 5.3 La Metrópoli

- Ciudad que se **observa** desde E8.
- **No** se juega en el Arco I. Es la **promesa** de un arco o
  expansión futura.
- Su función en el Arco I es **cerrar la pregunta** "¿qué
  hacían los docentes con todo esto?" y abrir la siguiente.

### 5.4 El Aula de Física (Instituto)

- Punto de acceso y salida. Vive en el dominio del Instituto
  (P6) y del portal (`world/ohmdal/portalLink.ts` o equivalente
  para Physica).
- En el estado actual, **no es requisito** para jugar el Arco I.

---

## 6. Conexiones entre regiones

- **Conexión por suelo.** El jugador camina entre escenas.
- **Conexión por Estación.** La Estación E7 ofrece un retorno
  al último punto de la línea de progresión. **No** es un menú
  libre; es un camino curado.
- **Sin** puertas, portales ni portales dimensionales dentro de
  Physica. La conexión con el Instituto es un **hito aparte**
  (P6).

---

## 7. Delimitación de anomalías

Toda anomalía en Physica tiene:

- **Sustancia** (agua, sólido, gas, luz).
- **Región** (rect, polígono, curva).
- **Frontera visible** (color, partícula, sonido).
- **Comportamiento** (`gLocal`, `corriente`, etc.).

> **Prohibido.** Una anomalía sin frontera visible. La frontera
> es parte de la legibilidad (PIS §1, P2).

---

## 8. Accesibilidad geográfica

- **Sin saltos requeridos.** El Arco I no exige *precision
  platformer*. La tolerancia de aterrizaje es generosa (ver
  `physica-player-movement_v1.md` §12).
- **Cámara reducible.** `prefers-reduced-motion` desactiva el
  *dolly* y la vibración; el avatar y la jugabilidad no se
  ven afectados.
- **Sin desniveles ocultos.** El jugador ve el final del plano
  antes de tener que decidir. La profundidad se usa para
  composición, no para trampas.

---

## 9. Lo que este documento NO es

- No prescribe **qué puzzles** se juegan en cada escena. Eso
  vive en `content/physica-arc-01_v1.md`.
- No prescribe **qué dice el INSTRUMENTO** en cada escena. La
  voz del guion v0.2 sigue siendo el contrato.
- No prescribe **el arte** de cada bioma. La biblia artística
  vive en otro documento (futuro).
- No prescribe **la cámara exacta** (FOV, dolly speed). Eso
  vive en spec de hito.

---

## 10. Conexión con el resto de Physica

- Los **biomas** se alimentan de las **capas** definidas en
  `physica-physics-interaction-system_v1.md` §2.
- Las **funciones de las escenas** se enlazan con la **curva
  de mecánicas** en
  `physica-mechanics-progression_v1.md` §3.
- La **promesa de la Metrópoli** se enlaza con la **biblia
  narrativa** en
  `narrative/physica-narrative-bible_v1.md`.
- La **integración con el Instituto** se delega a P6.
