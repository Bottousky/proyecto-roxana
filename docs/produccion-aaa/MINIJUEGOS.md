# Minijuegos por concepto y un banco grande por unidad (ciclo 29)

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

## Decidido (13 oct 2026)

- **Vecinos en el camino.** Cada minijuego es el problema chico de un vecino.
- **El primero de cada zona es obligatorio, los demás son opcionales.** El primero presenta la idea
  nueva. Después, el banco grande queda abierto.
- **Piloto en el Manantial.**

## Abierto

- Si los minijuegos dejan algo en la Bitácora (una página por concepto) o sólo el banco grande.

## Piloto hecho: el Manantial (13 oct 2026)

Con el agua cortada (la Puerta abierta y la bomba sin arreglar), Tala y Marín ya no están en la
Plaza: fueron al Manantial. Edda, en la Calzada, tiene una baliza que brilla a medias.

| Minijuego | Vecino y lugar | Concepto | Cómo se resuelve | |
|---|---|---|---|---|
| El farol de Tala | Tala, a la entrada del Manantial | La tensión se mide entre dos puntos: casi toda queda en lo que trabaja, casi nada en el cobre sano | Dos lecturas: entre los extremos del farol (≈ 6 V) y entre los del cordón (≈ 0 V) | **Obligatorio**: la caja de la bomba lo espera |
| La cuenta del carro | Marín, junto a su carro | En una vuelta, el empuje se reparte, y quien más frena se queda con más | Medir los dos faroles: 4 V + 8 V = 12 V (la cuenta de Vega, en chico) | Opcional |
| El contacto que roba | Edda, la baliza del costado en la Calzada | Un contacto deja pasar y aun así se queda con parte del empuje | Ver la caída en el contacto con la baliza encendida, y puentearlo | Opcional |

Después, la bomba sigue igual: encontrar el empalme que roba, la cuenta de la vuelta y el puente.
Ahora junta lo que cada vecino mostró por separado.

- **Cómo se juegan.** Se habla con el vecino: su pedido y, enseguida, su mesa. Al terminar, el
  vecino comenta lo que vio, y después sólo conversa. La baliza de Edda es un objeto de la Calzada
  y se puede volver a mirar.
- **Lo mismo que los bancos grandes.** Cada minijuego tiene un objetivo de una línea, un paso por
  ítem, cuatro pistas que terminan en algo concreto para probar, tres tarjetas de «Mirá lo que vi»
  con los números del montaje y un sonido propio. Tala y Marín hablan en la mesa con su cara.
- **La palabra «tensión»** se gana ahora en el farol de Tala, antes de la bomba.
- **Código.** `src/puzzle-model.js` (los tres circuitos y un tipo de prueba nuevo, `readings`:
  varias lecturas, cada una vista una vez), `src/puzzles.js` (guía y lecturas),
  `src/understanding.js` (tarjetas), `src/content.js` (diálogos, vecinos, objetivo y la caja de la
  bomba con `lockedBy`), `src/world-inhabitants.js` (quién está dónde), `main.js` (un vecino con su
  minijuego resuelto sólo conversa).
- **Pruebas.** `tests/minijuegos.test.js`, más las de siempre extendidas: alcanzables a pie y desde el
  camino con el agua cortada, presencia de los vecinos en ese momento, y la reparación de novato con
  el controlador real. En el navegador, `scripts/qa-minijuegos.mjs` los juega con clics.
  `MINIS=1 scripts/qa-bench-load.mjs` los mide en el teléfono: 12/12 bancos con lo principal a la
  vista a 844×390 y a 390×844.

Capturas: [el Manantial con Tala y Marín](minijuegos/manantial-con-tala-y-marin.png),
[el farol de Tala](minijuegos/farol-de-tala.png) ([en el teléfono](minijuegos/farol-de-tala-telefono.png)),
[el carro de Marín resuelto](minijuegos/carro-de-marin-resuelto.png) y
[la baliza de Edda](minijuegos/baliza-de-edda.png).

### Para decidir después de jugarlo

- ¿Se entiende como «vecinos con un problema chico»? ¿Molesta que la bomba espere a Tala?
- ¿La bomba se siente repetida después de la baliza de Edda (encontrar y puentear), o como el
  examen de la unidad?
- ¿Vale la pena extenderlo a las demás zonas? Habría que sumar personajes nuevos con su modelo 3D
  (unos 20 minutos de máquina por forma más las referencias), o reusar a los que ya existen.
