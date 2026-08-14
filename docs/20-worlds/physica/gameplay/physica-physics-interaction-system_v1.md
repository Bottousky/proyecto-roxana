---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md (sección 6 — capas del sistema físico; sección 7 — feedback model)
  - docs/physica/arquitectura-fisica-hibrida.md (en su rol de especificación técnica: este documento la absorbe como principio de diseño; las decisiones técnicas de motor quedan en un documento aparte de spec de hito, no en autoridad 3)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/physica-vision_v1.md
  - ./physica-player-movement_v1.md
open_questions:
  - PHYS-PI-1 — ¿Las 8 capas (C0–C7) entran **todas** en Physica como producto final, o son una taxonomía de diseño y sólo un subconjunto (C0–C4) entra en el primer juego? El pack §6 dice "no todo tiene que entrar en el primer juego/arco".
  - PHYS-PI-2 — ¿La capa C7 (óptica) entra como familia jugable o sólo como ambientación? Implicación sobre la familia F12 (Luz).
  - PHYS-PI-3 — ¿Los "overlays ganados" (trayectoria fantasma, vector, cronómetro, distancia, masa, energía) son todos módulos del reloj, o algunos viven en la Bitácora?
  - PHYS-PI-4 — ¿La regla de hibridación (qué es analítico vs. qué es simulación general) se decide en este documento de autoridad 3, o se delega a un documento de spec de hito (autoridad 4/5)?
  - PHYS-PI-5 — ¿La anomalía local (gravedad invertida en la cascada) es una propiedad del bioma (gLocal) o un campo que decae con la distancia? Implicación sobre la predicción y el modelo puro.
---

# PHYSICA — PHYSICS INTERACTION SYSTEM · v1

Este documento define **cómo el mundo de Physica se comporta
físicamente** y **cómo el jugador lo lee**. La promesa es que la
física sea **consistente, legible y transferible** — antes que
hiperrealista. No es un documento de motor: es un documento de
**reglas del mundo** que el motor y los runtimes deben respetar.

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P3 sin
> ratificación autoral explícita. La promoción a `CANON` requiere un
> ADR firmado por Manuel.

> **Alcance.** Cubre el comportamiento físico del mundo, los
> principios de la física estilizada, el modelo de feedback, los
> instrumentos y la frontera entre lo pedagógico y lo simulado. No
> prescribe implementaciones de motor; no prescribe APIs de runtime;
> no prescribe UI. La decisión de motor y arquitectura técnica ya
> está tomada (Babylon.js + Havok híbrido, decisión de Manuel
> 2026-08-07) y este documento la trata como insumo, no como objeto
> de decisión.

---

## 1. Principios rectores de la física estilizada

> **Consistencia > realismo. Legibilidad > precisión. Transferencia
> > virtuosismo.**

Estos principios se aplican a cada subsistema físico de Physica. Si
una decisión técnica contradice uno, se eleva a ADR.

### P1 — Consistencia
Una misma situación, jugada dos veces con los mismos inputs, produce
el mismo resultado. La consistencia es **transversal** a biomas: las
reglas cambian entre biomas, pero dentro de un bioma no hay
excepciones silenciosas.

### P2 — Legibilidad
El jugador ve el resultado de su acción **antes** de entender el
nombre del concepto. La consecuencia es visible; el formalismo es
posterior.

### P3 — Transferencia
Lo que el jugador aprende en un bioma funciona como **intuición de
partida** en el siguiente. No se "redefine" la masa en cada arco: se
amplía el rango, no la lógica.

### P4 — Localidad
Cada anomalía es local. La cascada que sube en la cornisa no afecta a
la piedra que cae. El jugador debe aprender a **delimitar** la
anomalía, no a generalizarla.

### P5 — Acotación
El modelo de cada bioma incluye sólo las variables necesarias para
los puzzles del bioma. Simular todo es un antipatrón (P14): la
complejidad nueva debe comprar posibilidad jugable.

---

## 2. Las 8 capas del sistema físico (taxonomía de diseño)

El pack de la sesión P3 fija una taxonomía de 8 capas. **No todas
entran en el primer arco**: la taxonomía existe para asegurar que
ningún fenómeno relevante quede sin nombrar.

| Capa | Nombre | Variables del modelo | Familias de puzzle que sirve | Entra en Arco I |
|---|---|---|---|---|
| **C0** | Movimiento | posición, tiempo, velocidad, aceleración | F1 Alcanzar, F5 Deslizar | **Sí** |
| **C1** | Interacción | fuerza, masa, fricción, gravedad | F2 Lanzar, F3 Transportar, F5 Deslizar | **Sí** |
| **C2** | Transferencia | impulso, momento, colisiones | F6 Transferir | **Sí** (integrada en U5 Estación) |
| **C3** | Energía | potencial, cinética, resortes, péndulos | F7 Almacenar | **Sí** (introductoria, Arco II lo expande) |
| **C4** | Rotación | torque, palancas, centro de masa | F4 Balancear, F8 Estabilizar | **Sí** (introductoria) |
| **C5** | Medios | fluidos, presión, flotación | (cubierto parcialmente por F9/F10) | No (Arco IV) |
| **C6** | Ondas | oscilación, resonancia, sonido | F11 Resonancia | No (Arco IV) |
| **C7** | Óptica | reflexión, refracción, lentes | F12 Luz | No (Arco V) |

> **Decisión de v1.** El Arco I trabaja con **C0–C4 con énfasis en
> C0–C1**, e introduce C3, C4 sólo como **lectura intuitiva** (no
> como concepto explícito). C5–C7 se reservan para arcos futuros.
> La pregunta `PHYS-PI-1` queda abierta para que el Vertical Slice
> no se expanda más allá de lo jugable.

> **Lo que la taxonomía implica.** Cada puzzle de Physica se etiqueta
> con la(s) capa(s) que activa. Si un puzzle activa una capa no
> listada, la taxonomía debe ampliarse por ADR.

---

## 3. Modelo de física por bioma (estructura)

Cada bioma del mundo declara, **de forma explícita y testeable**, los
siguientes parámetros:

```text
Bioma {
  gLocal: number            // aceleración gravitatoria local (m/s²)
  densidadAire: number      //阻力 del medio (afecta objetos pequeños)
  restitucionDefault: number
  friccionPorSuperficie: Map<Tag, number>
  camposLocales: Campo[]    // ver §4
  excepciones: Excepcion[]  // ver §5
}
```

> **Regla de testeo.** Cada bioma es testeable como unidad. Los
> modelos puros viven en `src/experiences/physica/models/` y se
> ejecutan con `node --experimental-strip-types`, sin dependencia
> del motor.

---

## 4. Campos locales: cómo Physica tiene "anomalías"

Una anomalía de Physica **no es un evento narrativo**: es un campo
local. El agua de la cascada sube porque **el campo `gLocal` para
esa sustancia es `+gA`** en la región `[x_cascada, y_cascada_min,
y_cascada_max]`.

### 4.1 Tipos de campo

| Campo | Efecto | Ejemplo |
|---|---|---|
| `gLocal(g, sustancia, posición)` | Aceleración gravitatoria para una sustancia en una región. | Agua de la cascada. |
| `corriente(vector, posición)` | Velocidad adicional aplicada a cuerpos en una región. | Corriente transversal de Escena 5. |
| `friccionOverride(μ, superficie)` | Sustituye la fricción por defecto. | Losa de hielo. |
| `amortiguacion(factor, cuerpo)` | Multiplica restitución de un cuerpo. | Resorte (amortiguación < 1). |
| `campoVectorExterno(...)` | (C5+) Presión / flotación. | (Arco IV). |
| `ondaAmplitud(amplitud, fase, posición, t)` | (C6+) Onda mecánica local. | (Arco IV). |
| `indiceRefraccion(n, posición)` | (C7+) Cambio de trayectoria óptica. | (Arco V). |

### 4.2 Cómo se delimita un campo

Cada campo es **regional**: tiene una geometría explícita (rect,
polígono, curva) y un dominio explícito (qué sustancias, qué
cuerpos). El jugador puede ver la frontera del campo por **affordance
visual** (cambio de color, partículas, sonido) o por **consecuencia**
(un objeto que cruza la frontera cambia de comportamiento).

> **Prohibido.** Un campo que afecta "a todo el bioma" sin
> delimitación. La delimitación es parte de la legibilidad (P2).

### 4.3 Cascada ascendente — caso canónico

```
Campo gLocal {
  sustancia: 'agua'
  region:    {x: [-14, 14], y: [0, 30]}
  g:         +9.8  // igual en magnitud, opuesta en signo
  bordeVisible: 'espuma-remolino-cambioColor'
}
```

El agua de esa región sube con `a = +9.8 m/s²`. Una piedra sólida
en la misma región cae con `a = -9.8 m/s²` (su `gLocal` no está
sobrescrito). El avatar, en la misma región, cae con `a = -gA` (su
gravedad personal, no la local — ver
`physica-player-movement_v1.md` §7).

> **Consecuencia pedagógica.** El jugador no aprende "la gravedad
> está invertida"; aprende que **dos cuerpos del mismo lugar pueden
> obedecer direcciones distintas**, y que la pregunta "¿qué
> gobierna este fenómeno?" requiere identificar **la sustancia** y
> **la región**.

---

## 5. Excepciones: cómo se rompe una regla sin destruir el aprendizaje

Una excepción es un **comportamiento físico que contradice el modelo
por defecto del bioma, con un disparador explícito**. Las excepciones
son la forma en que Physica introduce rareza: nunca por arte, siempre
por condición.

```text
Excepcion {
  nombre: string
  disparador: 'cuerpo-entra' | 'cuerpo-sale' | 'cuerpo-toca-X' | 'tiempo' | 'estado'
  efecto:    'invierte gLocal' | 'aplica fuerza' | 'ancla velocidad' | 'duplica restitucion' | ...
  alcance:   'este cuerpo' | 'cuerpos con tag T' | 'cuerpos en región R'
  visible:   'partícula' | 'sonido' | 'color' | 'silencio'
}
```

> **Regla.** Toda excepción **debe** tener un disparador observable
> y un alcance explícito. Una excepción "porque sí" es un bug de
> diseño.

### 5.1 Mecanismos del reloj-dispositivo como excepciones autorizadas

El reloj-dispositivo, en sus módulos, **aplica excepciones** sobre
una región o un cuerpo:

- "Anclar referencia" aplica `velocidad = 0` al cuerpo anclado.
- "Marcar trayectoria" registra la posición de un cuerpo a
  intervalos y la dibuja como fantasma.
- "Mostrar vector" no es una excepción: es un overlay.

> **Decisión de v1.** El reloj-dispositivo no puede alterar la
> física del mundo en el Arco I; sólo puede leer. La capacidad de
> intervención local ("activar una alteración local ya comprendida")
> entra en el Arco II (ver
> `physica-mechanics-progression_v1.md`).

---

## 6. El modelo de feedback

El feedback de Physica se divide en **dos capas**:

### 6.1 Capa base — siempre activa, nunca se apaga

Estos canales comunican el resultado de la acción sin entregar
números. El jugador lee el sistema con el cuerpo y con los ojos.

| Canal | Qué comunica | Ejemplo |
|---|---|---|
| **Trayectoria visible** | El camino real del objeto. | La piedra deja una estela de polvo durante un segundo. |
| **Deformación** | La intensidad del impacto. | La caja se hunde más al caer desde más alto. |
| **Velocidad** | La magnitud del movimiento. | Aceleración de piernas, frecuencia de animación, vibración de carga. |
| **Peso relativo** | La masa comparada. | Empujar una caja pesada requiere más tiempo y más fuerza. |
| **Sonido de impacto** | Material, masa, velocidad. | Madera, piedra, metal suenan distinto; más fuerte = más grave y más largo. |
| **Marcas en superficies** | Dónde han caído o pasado cosas. | Huella en polvo, marca de agua. |
| **Cuerda tensándose** | Tensión en una cuerda. | Cuerda recta = tensión alta; cuerda curva = baja. |
| **Objetos vibrando** | Estado de un sistema oscilante. | Un resorte no fijo vibra. |
| **Superficies deslizantes** | Baja fricción. | El avatar resbala, las patas dejan surcos. |
| **Indicadores ambientales** | Cambio de estado del mundo. | Cambio de color, partículas, niebla. |

### 6.2 Capa de overlays — ganada, no permanente

Los overlays son **instrumentos** que el jugador desbloquea o
desbloquea por el reloj-dispositivo. No son HUD permanente.

| Overlay | Capa física que muestra | Entra en arco |
|---|---|---|
| **Trayectoria fantasma** | C0 (movimiento) — pasado de un cuerpo | Arco I (al final) |
| **Vector** | C1/C2 — fuerza o velocidad instantánea | Arco II |
| **Cronómetro** | C0 — intervalos de tiempo | Arco I |
| **Distancia** | C0 — posiciones relativas | Arco I |
| **Masa** | C1 — masa de un cuerpo | Arco II |
| **Energía** | C3 — cinética/potencial de un cuerpo | Arco III |
| **Frecuencia / período** | C6 — oscilación | Arco IV |
| **Vector de luz** | C7 — reflexión/refracción | Arco V |

> **Decisión de v1.** En el Arco I, los overlays habilitados son
> únicamente **cronómetro** y **distancia** (los más simples). El
> vector y la masa se reservan al Arco II para evitar el
> "primer arco excesivamente conceptual" (LEGACY explícito).

### 6.3 Reglas del feedback

- **Nunca** un overlay entrega información que no esté ya en la capa
  base. El overlay *nombra* lo que el jugador ya vio.
- **Nunca** un overlay se muestra antes de que el jugador haya
  producido evidencia del fenómeno (P02, P06).
- **El overlay es opcional.** Un jugador puede desactivarlo y el
  juego sigue siendo legible.

---

## 7. El reloj-dispositivo (instrumento de observación)

> **Tesis.** El reloj no es un menú omnisciente. Es un instrumento de
> lectura y, más adelante, de modificación limitada. Su crecimiento
> representa el paso intuición → medición → modelo → intervención
> autorizada.

### 7.1 Apariencia y rol

- Reloj analógico con agujas, anillos, escalas y piezas móviles.
- Lo lleva el personaje o lo activa el INSTRUMENTO (decisión de arte;
  este documento fija la función, no la forma).
- No es la voz didáctica. El INSTRUMENTO es quien emite fragmentos
  del guion (ver `narrative/physica-narrative-bible_v1.md`).

### 7.2 Módulos del reloj (ganados arco a arco)

| Módulo | Función | Capa | Arco |
|---|---|---|---|
| **Observación** | Registrar la posición de un cuerpo a lo largo del tiempo. | C0 | I |
| **Cronómetro** | Medir intervalos entre dos eventos. | C0 | I |
| **Distancia** | Posición relativa entre dos cuerpos. | C0 | I |
| **Vector** | Mostrar fuerza o velocidad como flecha. | C1/C2 | II |
| **Masa** | Lectura de la masa de un cuerpo. | C1 | II |
| **Trayectoria** | Dibujar trayectorias pasadas como fantasma. | C0 | II |
| **Comparación** | Superponer dos estados A y B. | C0–C3 | III |
| **Anclaje** | Fijar la velocidad de un cuerpo a 0 (no intervención física del bioma, sólo del cuerpo anclado). | C0 | I (lectura) → II (escritura) |
| **Frecuencia** | Lectura del período de una oscilación. | C6 | IV |
| **Vector de luz** | Lectura de dirección de un rayo. | C7 | V |

> **Prohibido.** Un módulo del reloj que "resuelva" un puzzle
> automáticamente. El reloj *muestra*; el jugador decide. Esto
> protege P04 (el puzzle exige lectura, no aplicación de un
> atajo).

### 7.3 Crecimiento como metáfora pedagógica

El reloj pasa por **cuatro estados**, en paralelo a la curva de
mecánicas:

1. **Captura.** El reloj registra: almacena una observación
   inerte.
2. **Medición.** El reloj mide: el jugador compara un valor con
   otro.
3. **Modelo.** El reloj muestra: el jugador *ve* una estructura
   sobre los datos.
4. **Intervención.** El reloj modifica (Arco II en adelante): el
   jugador *actúa* sobre una variable.

El paso 4 se reserva a biomas donde el jugador ya ha mostrado
comprensión del fenómeno. Antes de eso, el reloj es pasivo.

---

## 8. Hibridación: qué es analítico y qué es simulación general

Physica separa la física en dos dominios:

### 8.1 Dominio pedagógico (analítico, modelo cerrado)

Todo fenómeno que el jugador debe **predecir, leer o medir** vive en
un **modelo puro testeable** (por ejemplo
`models/cascadaAscendente.ts`, `models/tiroParabolico.ts`,
`models/equilibrio.ts`, `models/vector.ts`,
`models/referenciaMovil.ts`, `models/planoInclinado.ts`). El
comportamiento es **de forma cerrada** y los tests pueden verificar
la igualdad con tolerancia explícita.

### 8.2 Dominio no pedagógico (simulación general)

Todo lo que el jugador **no necesita predecir** (colisiones del
avatar con plataformas, contactos de cajas con el suelo, *debris*,
apilamientos, cuerdas tensas) puede vivir en una simulación
general. La simulación general no se opone a la pedagógica: la
complementa. La regla híbrida ya está en producción para Physica
(decision de Manuel 2026-08-07, archivo
`docs/physica/arquitectura-fisica-hibrida.md`).

### 8.3 Regla de oro

> **Nunca** un objeto puede ser integrado por ambos dominios sobre
> el mismo grado de libertad. Si la analítica controla la
> trayectoria en vuelo, Havok (o la simulación general) controla la
> posición de reposo. Si Havok controla el contacto con el suelo,
> la analítica controla la posición en el aire. El dominio se
> decide **por objeto y por grado de libertad**, no por bioma.

> **Open question.** `PHYS-PI-4` — ¿Esta regla de hibridación
> pertenece a este documento (autoridad 3) o a un documento de
> spec de hito (autoridad 4/5)? Mi recomendación: que la regla
> general viva aquí (autoridad 3) y la asignación específica por
> objeto viva en cada spec de hito. Este documento enuncia el
> principio; las specs lo aplican.

---

## 9. Determinismo y testeo

- Cada modelo puro es **función pura** sobre sus inputs. Sin
  estado global, sin `Date.now()`, sin dependencia del orden de
  invocación.
- Cada bioma es **seedable**: dado el mismo seed, dos jugadores ven
  la misma anomalía.
- Cada puzzle tiene un test de **integración física** que verifica
  que la solución A y la solución B (cuando existen) producen el
  mismo estado objetivo.
- Cada instrumento tiene un test de **legibilidad**: el overlay
  generado a partir de un estado es estable frente a
  reordenamientos de inputs.

> **Decisión de v1.** En el Arco I, sólo se exige el test del
> modelo puro. Los tests de integración física de puzzle viven en
> la spec del puzzle (`content/physica-arc-01_v1.md`).

---

## 10. Lo que este documento NO es

- No prescribe **motor, framework ni librería de física**. La
  decisión de Babylon.js + Havok híbrido está tomada; este
  documento la trata como insumo.
- No prescribe **cámara ni UI**. La cámara vive en
  `world/physica-world-structure_v1.md`. Los overlays del reloj
  son descritos funcionalmente, no visualmente.
- No prescribe **qué biomas existen** ni su geografía. Eso vive en
  `world/physica-world-structure_v1.md`.
- No prescribe **qué puzzles específicos** enseñan cada capa. Eso
  vive en `content/physica-arc-01_v1.md` y
  `gameplay/physica-puzzle-grammar_v1.md`.
- No prescribe **qué dice el INSTRUMENTO ni el docente**. La voz
  vive en `narrative/physica-narrative-bible_v1.md`.

Cualquier inclusión aquí de uno de estos temas es una señal de que
algo se escribió en el archivo equivocado.

---

## 11. Conexión con el resto de Physica

- Las **8 capas** se aplican a los puzzles vía la gramática: ver
  `gameplay/physica-puzzle-grammar_v1.md`.
- El **crecimiento del reloj** se ata a la curva de mecánicas: ver
  `gameplay/physica-mechanics-progression_v1.md` §5.
- El **comportamiento de los biomas** (gLocal, campos) se mapea a
  las regiones: ver `world/physica-world-structure_v1.md`.
- La **voz del INSTRUMENTO** cuando un instrumento entra en
  acción: ver `narrative/physica-narrative-bible_v1.md`.
