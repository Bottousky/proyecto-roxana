# Diseño — Los otros dos bancos de A1.U1: Ohm y la Piedra de Freno

**Estado:** diseño cerrado por el Orquestador. Base para la spec de implementación.
**Resuelve:** los 2/3 restantes del BLOQUEANTE nº1. El banco de la Puerta ya vive en el mundo
(`worldViewMechanism.ts`); `ModalBenchId = Exclude<BenchId, 'gate'>` deja a `ohm` y `lumen` todavía
como modal a pantalla completa, así que el criterio de rechazo del contrato visual sigue incumplido
para dos puzzles de tres.

**Complementa:** `diseno-banco-diegetico.md` (la Puerta). Mismo principio rector, misma gramática.

---

## 1. Lo que el modal estaba aplanando

Los tres puzzles de A1.U1 son una **progresión de una variable por vez**:

| Puzzle | Concepto | Lo que el jugador hace, físicamente |
|---|---|---|
| 1 · Reactivar a Ohm | circuito cerrado | **unir** — que haya camino |
| 2 · Piedra de Freno | resistencia | **cambiar** — que el camino frene distinto |
| 3 · La Puerta de Ohm | empuje y freno juntos | **ajustar** — las dos cosas a la vez |

Primero que haya camino. Después que ese camino tenga un freno. Después que el freno converse con
el empuje. Es una lección construida en tres escalones.

**El modal borraba eso.** Los tres puzzles aparecían como el mismo panel con opciones, y la
progresión conceptual quedaba enterrada bajo una interfaz idéntica. En el mundo son tres verbos
distintos: unir, cambiar, ajustar. La forma del juego vuelve a contar lo que enseña.

Como pasó con la Puerta, **el guion ya tenía los dos mecanismos resueltos como objetos físicos**
(§6.1 y §9.1). No hay que inventar nada: hay que volver a lo que estaba escrito.

---

## 2. Puzzle 1 — Reactivar a Ohm (`PUZZLE_REACTIVATE_OHM`)

**Componentes del guion §6.1:** fuente de empuje · cable suelto · conector A · conector B · cuerpo
de Ohm · lámpara de prueba.

### En el mundo
El cuerpo de Ohm está caído junto a la fuente. El **cable suelto** está en el piso, visible, con un
extremo ya conectado o ninguno. Los dos conectores son bocas de cobre a distinta altura, separadas,
las dos al alcance del jugador. La **lámpara de prueba** cuelga cerca: es el instrumento, y es lo
que hace que el puzzle se entienda sin texto.

### Cómo se manipula
El jugador se para junto a un extremo del cable y lo toma; se para junto a un conector y lo enchufa.
Nada de arrastre fino ni de puntería: la proximidad elige, la tecla de siempre confirma.

Se ve **el cable tendido en el piso**, siguiendo el camino entre lo que une. Eso es la lección
entera: el jugador está dibujando un camino con las manos.

### Los tres estados (guion §6.2, diálogos TEXTUALES)
- **A · Circuito abierto** — ojos apagados, sonido hueco, el cable no llega a los dos lados.
- **B · Cable mal colocado** — chispas débiles en el suelo. Hay contacto pero no camino: la lámpara
  parpadea sin encender. Ohm habla entrecortado.
- **C · Circuito cerrado** — el cable une ambos conectores: los canales de cobre brillan, la lámpara
  de prueba se enciende, los ojos de Ohm se iluminan y se levanta de golpe.

El estado B es la clave pedagógica y no se puede perder: **enseña que tocar no es unir.**

---

## 3. Puzzle 2 — Piedra de Freno (`PUZZLE_BRAKE_STONE_DOOR`)

**Setup del guion §9.1:** el circuito de la puerta ya está cerrado pero la aguja está baja. Hay una
piedra de freno enorme en el zócalo, y tres piedras disponibles.

### En el mundo
El **zócalo** es un hueco en la piedra, a la vista, con la piedra enorme puesta. Las tres piedras
disponibles están apoyadas al lado, cada una **visiblemente distinta**:

| Piedra | Cómo se ve | Cómo se lee |
|---|---|---|
| pesada | bandas oscuras, cuerpo grande | frena mucho |
| media | bandas claras, cuerpo medio | frena lo justo |
| liviana | bandas brillantes, cuerpo chico | casi no frena |

**El guion ya resolvió la accesibilidad:** las piedras se distinguen por **tamaño y patrón de
bandas**, no por color. Eso se respeta tal cual — es exactamente lo que la vara §G.4 exige, y ya
estaba escrito.

La **aguja** del mismo cuadrante que usa la Puerta es el instrumento de lectura. Reusar el cuadrante
es deliberado: el jugador ya sabe leerlo cuando llega a la Puerta, y esa continuidad es lo que el
canon llama reuso de una regla aprendida (`guia-puzzles.md` §3.18).

### Cómo se manipula
El jugador saca la piedra del zócalo y pone otra. Una sola acción, un solo verbo: **cambiar**. Se
ve la piedra salir y la otra entrar.

### Los tres estados (guion §9.2, diálogos TEXTUALES)
- **Piedra alta** — la puerta apenas tiembla. Río pequeño, piedra grande.
- **Piedra baja** — la aguja sube mucho y un fusible **vibra** sin llegar a saltar. Aviso, no
  castigo: el mundo muestra el límite antes de romperse.
- **Piedra media** — la aguja entra en zona correcta y la puerta abre.

---

## 4. Reglas comunes a los dos

- **Cero cambios de lo que se enseña.** Los umbrales, los estados y las condiciones de resolución de
  `storyModel.ts` se conservan exactamente. Cambia dónde y cómo se manipula, no qué se aprende.
- **La cámara no abre panel.** Se acerca al mecanismo dejando ver el entorno, igual que en la Puerta.
- **Consecuencia visible** en el mundo, no en un cartel.
- **El error informa.** Ningún estado equivocado bloquea, reinicia ni castiga.
- **Ningún texto se inventa.** Todo sale de §6.2 y §9.2, textual. Lo que falte: `// TODO(guion)`.
- Vocabulario del guion: **empuje**, **freno**, **piedra**, **camino**, **río**.
- Al terminar los dos, `ModalBenchId` y todo el andamiaje de banco modal deberían quedar sin uso:
  **el módulo no debería tener más un overlay de puzzle a pantalla completa.** Ese es el criterio de
  cierre del bloqueante.

## 5. Riesgo a vigilar

El puzzle 1 es el primero que toca el jugador en todo el juego, a un minuto de empezar y sin ninguna
convención aprendida. Si «tomar el cable y enchufarlo» no se entiende sin explicación escrita, no
sirve: hay que resolverlo con afordancia visual, no agregando un cartel. Es el punto donde este
diseño más fácilmente puede fallar, y donde más conviene mirar con ojos de alguien que nunca jugó.
