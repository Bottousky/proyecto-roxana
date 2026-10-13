# Minijuegos por concepto y un banco grande por unidad (propuesta, ciclo 29)

Idea de Manuel (13 oct 2026): partir los puzzles grandes, sobre todo en el teléfono, en varios
minijuegos de un mismo tema. Cada uno presenta **un** concepto. Después viene un puzzle más grande
que junta lo de la unidad.

## Por qué encaja

- **Los bancos ya mezclan conceptos.** El Castillo pide primero el sentido de la corriente y después
  la fuerza. La bomba pide encontrar el empalme, sumar las tensiones y recién después puentear. En
  el teléfono, ese banco es el que menos entra.
- **Una cosa nueva por vez.** Coincide con la investigación del proyecto
  (INVESTIGACION-APRENDIZAJE.md): primero un ejemplo guiado, después la práctica sola, y al final la
  transferencia a un caso más rico.
- **Un minijuego entra entero en el teléfono.** Lleva de 2 a 4 piezas, un instrumento y una
  pregunta, sin desplazarse.
- **El motor no cambia.** Un minijuego es la misma mesa (`src/puzzles.js`) con un circuito chico,
  sus pistas y su prueba. Las pistas que miran tu montaje, la marca esperada y la Bitácora sirven
  igual.

## Cómo se ven en el mundo (a decidir)

1. **Desafíos de los vecinos en el camino** (recomendada). En Pokémon, en la ruta hay entrenadores
   antes del gimnasio. Acá serían vecinos con un problema chico: la lámpara de la tejedora, el
   timbre del molino. Cada uno enseña un concepto. Al final está el banco grande de la zona.
2. **El cuaderno de Ohm.** Ohm propone los ejercicios antes del banco grande, en cualquier lugar.
   Es más simple de construir, pero no suma vida al mundo.

## Unidades del Arco I y sus conceptos

| Unidad (banco grande) | Minijuegos, uno por concepto |
|---|---|
| Portal · despertar a Ohm | (queda como está: ya es un solo concepto, el circuito cerrado) |
| Taller · la costura invisible | ¿Hay camino? (prueba de continuidad en 3 cables) · Puentear un hueco |
| Castillo · el cerrojo | ¿Hacia dónde empuja? (sentido) · ¿Con cuánta fuerza? (una piedra de freno) |
| Manantial · la bomba | Comparar dos puntos (tensión) · La suma del camino (serie) · El empalme que roba |
| Castillo · enfermería y cocina | En fila: si una se apaga, se apagan todas · Cada una con su camino (paralelo) |
| Campos · el riego | Lo que toma uno (corriente) · El cable que se calienta (límite) |
| Faro · tendidos | Uno o dos tendidos (la corriente se reparte) |
| Faro · tres voces | Lo que entra a un nudo, sale (suma de corrientes) |
| Cajón de Lumen | Leer los anillos · Pesar el freno |
| Faro · la lente | El divisor sin carga · El divisor con la lente puesta |

En total son unos 20 minijuegos, de 1 a 3 minutos cada uno.

## Piloto propuesto

**El Manantial**, con 3 minijuegos y la bomba como banco grande. Es el banco más denso, el que peor
entra en el teléfono, y el que más se beneficia de separar «medir tensión» de «sumar tensiones».
Antes de extenderlo a las demás zonas, hay que jugarlo y decidir si funciona.

Trabajo del piloto: 3 circuitos chicos en `src/puzzles.js`, con sus pistas y su prueba, dónde
aparecen en el mundo, sus diálogos, el orden de la misión, sus pruebas automáticas y el recorrido
completo actualizado. El resto del arco no cambia.

## Decisiones abiertas

- Cómo aparecen en el mundo: vecinos o cuaderno de Ohm.
- Si son obligatorios antes del banco grande o se pueden saltear (el banco grande siempre sigue
  disponible para quien ya sabe).
- Si los minijuegos dejan algo en la Bitácora (una página por concepto) o sólo el banco grande.
