---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md (sección 5 — core loop, ítems de movimiento; sección 6 — locomoción)
  - docs/physica/spec-vertical-slice.md (apartado 2.5D lateral, en lo que describe parámetros físicos del avatar)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/physica-vision_v1.md
open_questions:
  - PHYS-PM-1 — ¿La masa aparente del avatar cambia de arco en arco (P04 cumple al pedir variables de dificultad) o se mantiene constante? Implicación: la familia F4 (Balancear) y F3 (Transportar) requieren masa relativa.
  - PHYS-PM-2 — ¿Existe un modo de "cámara libre" para el jugador que quiera inspeccionar una trayectoria ya consumada, o el replay lo entrega el reloj?
  - PHYS-PM-3 — ¿El agarre se modela como punto fijo, o como articulación con dos puntos? Implicación sobre F8 (Estabilizar) y F4 (Balancear).
  - PHYS-PM-4 — ¿Se permiten rebotes del avatar en superficies con restitución alta para encadenar combos verticales, o se prohíbe por pertenencia al pilar P09 (explorable, no arcade)?
  - PHYS-PM-5 — ¿La locomoción incluye una mecánica de "espera activa" (el avatar puede prepararse antes de una caída para sentir la aceleración) o el tiempo siempre corre?
---

# PHYSICA — PLAYER MOVEMENT · v1

Este documento define la **locomoción como sistema**, no como lista de
controles. Una lista de controles describe *qué botón hace qué*; este
documento describe **qué variables componen el cuerpo del personaje**,
cómo cambian, qué siente el jugador al modificarlas, y cómo esas
variables abren o cierran la familia de puzzles de Physica.

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P3 sin
> ratificación autoral explícita. La promoción a `CANON` requiere un ADR
> firmado por Manuel.

> **Alcance.** Cubre el cuerpo del avatar y su relación con el suelo, el
> aire, los objetos agarrables y las superficies del mundo. No cubre la
> cámara (pertenece a `world/physica-world-structure_v1.md`) ni el
> sistema de física del mundo (pertenece a
> `physica-physics-interaction-system_v1.md`).

---

## 1. Tesis

> **La locomoción es excelente aunque no exista ningún puzzle. La
> calidad del movimiento es la primera promesa del juego.**

Esta tesis se sigue de tres pilares:

- **P09** — El juego debe sobrevivir sin la etiqueta "educativo". Si la
  locomoción depende de los puzzles para sentirse bien, el juego está
  fallando.
- **P02** — Experimentar antes de formalizar. El jugador debe poder
  *sentir* el cuerpo antes de medirlo.
- **P05** — Fallar produce información. El cuerpo del avatar debe
  responder al error de forma legible (no con muerte súbita ni con
  castigo por exploración).

---

## 2. El cuerpo como instrumento de lectura

En Physica, el cuerpo del avatar no es un personaje con personalidad: es
**un instrumento de lectura del mundo**. La promesa es que **el
movimiento del cuerpo del jugador es ya una aplicación del concepto**
(P01). Cuando el jugador corre, salta, cae, se desliza, ya está
recolectando datos sin saberlo.

Consecuencias operativas:

- El cuerpo tiene **masa aparente**, **aceleración limitada**, **altura
  de salto variable** según contexto (ver §5).
- Las **superficies** tienen restitución y fricción que el cuerpo
  lee (el sonido y la animación cambian, no un número en pantalla).
- Los **objetos agarrables** transfieren momento al cuerpo, y viceversa.
  Empujar una caja pesada se siente distinto a empujar una liviana, y
  eso se debe a parámetros explícitos (no a un animation hack).
- **No hay "modo plataforma" y "modo puzzle".** El cuerpo se comporta
  igual en ambos casos.

---

## 3. Estados del avatar (máquina explícita)

El avatar tiene un conjunto cerrado de estados. No se admite estado
implícito.

| Estado | Definición | Salidas posibles |
|---|---|---|
| `IDLE` | De pie, sin input. | `WALK`, `RUN`, `CROUCH`, `JUMP` (desde el borde), `INTERACT` |
| `WALK` | Caminar. Velocidad submáxima. | `IDLE`, `RUN`, `JUMP`, `SLIDE` (sobre pendiente) |
| `RUN` | Velocidad máxima. | `IDLE`, `WALK`, `JUMP`, `SLIDE` |
| `CROUCH` | Agachado. Centro de masa bajo. | `IDLE`, `CRAWL`, `SLIDE` (con intención de bajar) |
| `CRAWL` | Avanza agachado. | `CROUCH`, `IDLE` |
| `AIR` | En el aire. Air control habilitado. | `LAND` (suelo), `GRAB` (saliente), `WALL` (pared) |
| `WALL` | Deslizándose por pared. | `WALL_JUMP`, `FALL` (si pierde contacto) |
| `SLIDE` | Deslizando por pendiente. | `IDLE` (al pie), `FALL` (si la pendiente termina) |
| `GRAB` | Agarrado de saliente o cuerda. | `SWING`, `CLIMB`, `RELEASE` (vuelve a `AIR`) |
| `SWING` | Oscilando colgado. | `RELEASE`, `CLIMB`, `PUSH` (vector sobre la cuerda) |
| `PUSH` | Empuja un objeto o superficie. | `IDLE`, `WALK` (con objeto) |
| `CARRY` | Carga objeto agarrable. | `IDLE`, `WALK`, `THROW`, `DROP` |
| `FALL` | Cayendo (gravedad plena). | `AIR`, `LAND` |
| `INTERACT` | En diálogo o uso de instrumento. | (estado terminal; vuelve al último estado físico) |
| `DEAD` | Estado terminal. No se usa en Physica (sin vidas). | n/a — se reinicia a `IDLE` en el último checkpoint. |

> **Regla.** Cualquier estado nuevo debe declararse aquí antes de
> implementarse. Una animación sin estado es un bug de diseño.

---

## 4. Variables controlables del cuerpo

Las siguientes variables son **expuestas al sistema de física**. No son
controles; son parámetros del avatar que interactúan con el mundo. Cada
variable tiene un rango permitido y un valor por defecto en el primer
arco. Los rangos pueden cambiar de arco en arco (ver
`physica-mechanics-progression_v1.md` §4).

| Variable | Símbolo | Default (Arco I) | Rango Arco I | Unidad | Notas |
|---|---|---|---|---|---|
| Aceleración horizontal | `aH` | 36 | 28–45 | m/s² | Siente "pesado" si `aH` bajo. |
| Velocidad máxima horizontal | `vMax` | 4.5 | 3.5–6.0 | m/s | `vMax` ≠ `aH * t`; se satura. |
| Velocidad de caminar | `vWalk` | 2.2 | 1.6–2.8 | m/s | Triggers: input leve vs. pleno. |
| Aceleración vertical (gravedad avatar) | `gA` | 9.8 | 8.0–12.0 | m/s² | El avatar cae con `gA`, no con la `g` local del bioma. Ver §7. |
| Altura de salto | `hJump` | 1.6 | 1.2–2.0 | m | Medida vertical desde el suelo. |
| Tiempo de salto (ventana de input) | `tJump` | 0.18 | 0.12–0.22 | s | Define la "subida" del salto. |
| Coyote time | `tCoyote` | 0.10 | 0.06–0.14 | s | Ventana post-borde en la que aún puede saltar. |
| Air control horizontal | `aAir` | 24 | 16–32 | m/s² | Fracción de `aH` controlable en aire. |
| Masa aparente del avatar | `mA` | 1.0 | 0.8–1.4 | relativa | Ver §5 y `open_questions` PHYS-PM-1. |
| Fricción con superficies (μ avatar) | `μA` | 0.6 | 0.3–0.9 | adimensional | Distinta de la fricción de la superficie. |
| Restitución del avatar | `eA` | 0.0 | 0.0–0.2 | adimensional | Ver PHYS-PM-4. |
| Centro de masa (offset vertical) | `cmA` | 0.0 | -0.2 a +0.2 | m | Usado en `CROUCH` y `CRAWL`. |

> **Regla de transparencia.** Ninguna variable se modifica en runtime
> sin un cambio explícito en el bioma. Si `aH` cambia al entrar a un
> bioma, el cambio se explica por una condición diegética del bioma
> (por ejemplo, "el bioma es viscoso" o "el aire es denso"), no por una
> mano invisible.

---

## 5. Masa aparente del avatar

`mA` existe como variable porque **la masa del cuerpo cambia cómo se
siente el mundo**. Una masa aparente más alta:

- reduce la aceleración horizontal efectiva para la misma fuerza de
  input;
- aumenta la inercia frente a colisiones (más difícil de empujar);
- cambia el rebote (`eA` se multiplica por la masa relativa);
- cambia la lectura que el INSTRUMENTO hace del cuerpo (cuando el
  módulo de masa esté activo, ver
  `physica-mechanics-progression_v1.md`).

> **Decisión de v1.** En el Arco I, `mA` se mantiene constante (= 1.0).
> En el Arco II (Fuerzas), `mA` varía entre 0.8 y 1.4 como mecanismo
> de bioma. La justificación es que la masa solo es legible como
> concepto cuando ya hay otra masa con la que comparar (F4 Balancear,
> F3 Transportar).

> **Pregunta abierta.** `PHYS-PM-1` (ver frontmatter) — Si el Arco I no
> varía `mA`, la familia F4 y F3 necesitan un cuerpo de comparación
> (cajas, esferas, péndulos) que cargue la variación. Diseño propuesto:
> en Arco I la masa se siente por la diferencia con el cuerpo del
> avatar (cajas pesadas vs. ligeras) sin tocar `mA`.

---

## 6. Locomoción sobre superficies

### 6.1 Suelo plano

- Aceleración plena a `aH` cuando hay input direccional.
- Deceleración `aDec` = 0.7 × `aH` (no se desliza infinitamente al
  soltar el input).
- Si el input es cero, se pasa a `IDLE` cuando `|v| < 0.05 m/s`.

### 6.2 Pendientes

- Sobre pendientes con `θ > 8°`, si el avatar está `IDLE` y la
  componente de `gA` en la dirección de la pendiente supera
  `μA * gA * cos θ`, entra a `SLIDE`.
- En `SLIDE`, la velocidad terminal depende de `μA` y `θ`. Una rampa
  con `μA = 0.05` desliza a casi cualquier `θ`; una rampa con
  `μA = 0.6` no desliza salvo pendientes extremas.
- El avatar puede caminar pendiente arriba si su `aH` en la dirección
  de la pendiente supera `gA * sin θ + μA * gA * cos θ`. Esto se siente
  como "cuesta arriba requiere más empuje".

### 6.3 Superficies con μ variable

Cada superficie del mundo declara su `μSuperficie`. La fricción
efectiva es `μA * μSuperficie` (modelo simplificado de Coulomb, no
rigoroso). El cambio de superficie es **legible sensorialmente**:
sonido (ver §10) y, opcionalmente, partícula visual mínima.

### 6.4 Restitución (rebote)

`eA` * `eSuperficie` = restitución efectiva. Por defecto el avatar no
rebota (`eA = 0`). Superficies con `eSuperficie > 0.5` producen rebote
visible. El rebote del avatar es **puro feedback** y nunca
**condición de puzzle** en el Arco I (ver PHYS-PM-4).

### 6.5 Coyote time y air control

- Coyote time permite saltar durante `tCoyote` después de salir de un
  borde sin input. **Es affordance, no exploits**: el jugador lo
  descubre al intentar y errar.
- Air control: durante `AIR`, el input horizontal aplica `aAir` en la
  dirección del input. El avatar puede corregir trayectoria en aire
  pero no invertirla bruscamente (limitación natural: la
  componente vertical domina).

---

## 7. Gravedad local y gravedad del avatar

El avatar **siempre cae con `gA`**, su gravedad personal. La
gravedad local del bioma (`gLocal`) afecta a:

- objetos libres (piedras, cajas);
- fluidos (ríos, cascadas);
- mecanismos que dependen del peso (poleas, péndulos);
- la dirección "abajo" para la cámara en ejes no laterales.

> **Consecuencia pedagógica.** En la cornisa de la cascada (Escena 2),
> la piedra cae con `gA` (normal) y el agua sube con `gLocal = +gA`
> (invertido). El avatar, si cae, también cae con `gA`. Esta es la
> anomalía local: no afecta al cuerpo del jugador, afecta a los
> cuerpos del lugar.

> **Decisión de v1.** En el Arco I la cámara no se invierte. La
> anomalía se ve desde fuera (agua subiendo) y se siente por
> comparación (piedra que cae). La inversión de la cámara queda fuera
> del Arco I.

---

## 8. Agarre, carga y manipulación de objetos

### 8.1 Agarre de salientes (`GRAB`)

- El avatar entra a `GRAB` cuando su `head` colisiona con un
  `GrabPoint` (tag explícito en el escenario).
- En `GRAB` puede:
  - `CLIMB`: subir a la cornisa (input arriba).
  - `RELEASE`: soltar (input abajo o soltar input).
  - `SWING`: si el saliente es una cuerda/anilla, oscila.

### 8.2 Agarre de objetos (`CARRY`)

- El avatar puede llevar **un objeto** a la vez. Llevar dos colapsa a
  un error legible (deja caer el primero).
- La masa del objeto afecta a `aH` efectivo:
  `aH_efectivo = aH * mA / (mA + mObjeto)`.
- El avatar puede **lanzar** (`THROW`): aplica una velocidad inicial
  proporcional a la fuerza de input y a la dirección. La trayectoria
  resultante es `gLocal` del bioma (no `gA`).
- Lanzar no es puntería: el ángulo de lanzamiento es **libre** y se
  decide por la posición del stick. La validación de un lanzamiento
  no es "acertar a un blanco de 2 píxeles" sino "cumplir una
  condición física" (ver
  `physica-puzzle-grammar_v1.md` F2).

### 8.3 Empuje (`PUSH`)

- El avatar empuja un objeto aplicando fuerza horizontal constante
  `Fpush = aH * mA` (modelo newtoniano simplificado).
- El objeto se acelera con `a = Fpush / (mA + mObjeto)`.
- Si `μObjeto * (mA + mObjeto) * gLocal > Fpush`, el objeto no se
  mueve. El avatar no puede empujar un objeto más allá de su fricción
  estática.
- El empuje se siente distinto a la carga: el cuerpo sigue en
  contacto con el suelo y la lectura visual es de "arrastre".

---

## 9. Cuerdas, péndulos y oscilación (`SWING`)

`SWING` es un estado de `GRAB` sobre una cuerda, anilla o péndulo
rígido.

- Al entrar, la velocidad horizontal se convierte en velocidad
  tangencial.
- El péndulo oscila con período
  `T = 2π * sqrt(L / gA)`. La `L` y la `gA` son explícitas.
- El avatar puede **modular el swing** flexionando piernas en el
  punto bajo (aumenta amplitud) o agachándose en el punto alto
  (acorta péndulo, aumenta frecuencia).
- La familia F11 (Resonancia) usa `SWING` extensivamente.

> **Decisión de v1.** El swing es siempre cerrado: el avatar no
> puede salir de la cuerda. La liberación es por `RELEASE` explícito.

---

## 10. Feedback sensorial de la locomoción

El cuerpo del jugador **se siente** por cinco canales. Ninguno entrega
un número; todos entregan una señal.

1. **Visual.** Aceleración de las piernas (frecuencia de animación),
   inclinación del cuerpo en pendientes, deformación al detenerse
   bruscamente, balanceo de carga.
2. **Sonoro.** Pasos diferenciados por superficie (grava, madera,
   piedra pulida, metal), respiración al correr, sonido de empuje,
   crujido de cuerda al tensarse, golpe sordo de aterrizaje pesado.
3. **Táctil / vibración.** Distintos patrones de vibración por
   superficie y por impacto (suelo blando, roca, metal). La vibración
   **no** entrega información que no esté ya en visual y sonoro.
4. **Cinemática.** Cámara con suavizado: nunca se rompe la legibilidad
   del movimiento. Sin sacudidas en aterrizaje.
5. **Tiempo de respuesta.** El input a la respuesta es de **dos
   frames** (≤ 33 ms a 60 fps). Más lento se siente "pesado" y rompe
   la confianza en el cuerpo.

---

## 11. Tutorialización del cuerpo (P02, DL §3)

El cuerpo se enseña por **affordance + espacio seguro + consecuencia**.
No hay tutorial explícito.

- **Affordance visual.** La cornisa inicial es amplia y plana. Caminar
  no requiere explicación.
- **Espacio seguro.** El primer minuto del Arco I es plano, sin
  pendientes ni abismos. El jugador puede fallar sin morir.
- **Consecuencia.** Si el jugador corre hacia un borde, no se cae: el
  `tCoyote` lo permite. Si insiste, cae, y la caída se siente con su
  `gA` antes de llegar al suelo.
- **Reacción de personaje.** El INSTRUMENTO emite un fragmento del
  guion (no teoría) cuando el cuerpo entra a un estado nuevo
  (primera `SLIDE`, primer `SWING`, etc.).
- **Bitácora.** Sólo después de evidencia suficiente (P06).

> **Prohibido.** Texto instructivo sobre el cuerpo. El cuerpo se
> aprende usándolo. El manual no existe (DL §3, ítem 7 — "último
> recurso").

---

## 12. Accesibilidad del cuerpo

- **Tolerancia de plataformas.** ±0.10 m de margen en el eje X para
  considerar "aterrizaje exitoso" (más generoso que el legacy M1).
- **Reducción de movimiento.** `prefers-reduced-motion`: cámara sin
  *dolly*, vibración off, partículas off. Movimiento del avatar
  intacto.
- **Pausa física durante lectura.** El reloj y la Bitácora pueden
  abrirse con el mundo congelado (sin afectar al cronómetro interno
  de simulación física, que se reanuda al cerrar).
- **Remapeo de controles.** Completo: cada acción enumerada en §3
  puede rebindarse.
- **Asistencia de salto (opcional).** Si la asistencia está activa, el
  `hJump` se incrementa un 15% y el `tCoyote` un 30%. Indicador
  visible.
- **Reset instantáneo de puzzle.** El avatar puede pedir un reset al
  último checkpoint con un solo input; no se reinicia el bioma.

> **Decisión de v1.** Sin vidas. Sin castigo por ensayo razonable
> (P05). El "fallo" es información, no muerte.

---

## 13. Lo que este documento NO es

- No prescribe **controles concretos** (mapping de botones), porque
  el control depende de la plataforma y de la decisión de UX/UI
  global. Vive en otro documento (futuro, P6 o spec de hito).
- No prescribe **cámara**. La cámara vive en
  `world/physica-world-structure_v1.md`.
- No prescribe **qué puede agarrar el avatar**. Eso es contenido de
  puzzle (familia F3 en
  `physica-puzzle-grammar_v1.md`).
- No prescribe **qué hace el INSTRUMENTO cuando el cuerpo hace X**.
  La voz del INSTRUMENTO vive en
  `narrative/physica-narrative-bible_v1.md`.
- No prescribe **motor, framework ni pipeline**. La decisión de motor
  del Hito 1 (Babylon.js) ya está tomada; este documento no la reabre.

---

## 14. Conexión con el resto de Physica

- Las variables de la §4 son la **entrada** del sistema de física del
  mundo: ver
  `gameplay/physica-physics-interaction-system_v1.md` §2.
- La **curva** de cómo cambian estas variables arco a arco vive en
  `gameplay/physica-mechanics-progression_v1.md` §4.
- Los **puzzles** que usan estos estados viven en
  `gameplay/physica-puzzle-grammar_v1.md` y se aplican concretamente
  en `content/physica-arc-01_v1.md`.
