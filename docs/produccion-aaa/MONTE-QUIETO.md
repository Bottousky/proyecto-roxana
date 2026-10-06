# El Monte Quieto y la Casa de Compuertas (ciclo 18)

**Pedido del usuario (6 oct 2026):** una montaña y una central hidroeléctrica a la izquierda del
Manantial. La central se ve y es jugable en el Arco II, no en este. Lo que se haga en el reino
debe repercutir en ella, para bien o para mal, y dejar un indicio del Arco II. El nombre quedó a
mi elección.

## Qué es

Una central de agua antigua, callada desde antes de que naciera Vega. Está al pie de un
desfiladero del **Monte Quieto**, al oeste del Manantial. Arriba, en una hondonada, hay un embalse
cerrado por una represa de piedra con tres compuertas. Las tuberías bajan a la casa y su canal
viejo lleva el agua hasta la roca donde nace el acueducto del Manantial: el monte es, literalmente,
la cabecera del agua. El nombre de la casa viene del horizonte de [LORE.md](../../LORE.md), que ya
la anotaba; ahora queda como umbral del Arco II.

## Cómo responde al reino (`quietMountState`)

| Lo que hizo el viajero | Lo que pasa en la Casa de Compuertas |
|---|---|
| Abrir el canal del Manantial | El canal viejo vuelve a traer agua |
| Reparar la bomba del Manantial | La compuerta del medio lagrimea |
| En las Terrazas, darle el agua primero al riego | El embalse queda bajo y deja ver sus orillas |
| Encender el Faro | Se prende la luz de la casa: firme si el embalse quedó alto, titilante si quedó bajo |

En la historia:
- Al reparar la bomba, Vega nombra el monte y la casa.
- En el final, el haz del Faro llega al monte, en un plano más de la escena (19,6 s). Edda recuerda
  que su abuela decía que esa luz avisaba algo, y Ohm nota si se sostiene o parpadea.
- La Bitácora suma una prueba abierta: «Una luz en el Monte Quieto».

## La montaña no tapa nunca al jugador

La cámara de juego mira al norte desde 61 m al sur del jugador, y el oeste del Manantial queda
justo al sur del Castillo. Una primera versión, con la cumbre cerca, tapaba al jugador en el
Castillo por 12 m. Por eso:
- el macizo alto está al sudoeste, y hacia el Manantial baja un hombro que encierra el embalse;
- el monte es parte del relieve del valle (`scripts/bake-relief.mjs`), con el mismo pasto, la misma
  roca escalonada y la misma flora;
- al hornearlo, cada punto queda por debajo de los rayos de la cámara hacia todo lo caminable, con
  un margen.

El horneado falla si el embalse pierde sus bordes o si la montaña tapa a alguien. Valores
actuales: cumbre de 42 m, borde más bajo del embalse a 9,7 m (el agua está a 8,6 m) y 1,5 m de
margen con la cámara.

Con la cámara de juego, desde el Manantial la casa y su farol se ven al caminar hacia el borde
oeste. El monte entero se ve en el mapa y en el final del Faro.

## Verificado

- `tests/quiet-mount.test.js` comprueba:
  - que el monte no pisa lugares, caminos ni el río;
  - que el embalse queda sellado y la represa apoya en roca;
  - que el desfiladero y la casa quedan a nivel del valle;
  - los estados según el reino, los textos del final y la página de la Bitácora.
- `scripts/qa-quiet-mount.mjs` captura los cinco estados desde el Manantial.
- El mapa (fidelidad 100 %) muestra el monte con sombreado de relieve, su nombre y la casa con su
  luz.

## Pendiente

- El Arco II: entrar a la casa y entender qué alimenta esa luz.
- No verificado con personas.
