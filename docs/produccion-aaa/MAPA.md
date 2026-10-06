# Mapa del reino (ciclo 17)

**Pedido del usuario (6 oct 2026):** el mapa no parecía el de un juego, sino una página web con
garabatos. Quería un mapa de juego AAA que siguiera de verdad la geografía del mundo.

## Cómo se hace: el mundo, fotografiado y pintado

`scripts/bake-map.mjs` (desde `experiments/playcanvas`, con `npm run dev` levantado):

1. **Toma cenital del juego.** Abre una partida y congela la escena. Saca personajes, interfaz,
   desenfoque, viñeta, brillo y sombras de nubes, y fotografía todo el reino por cuadros con una
   cámara ortogonal cenital, norte arriba (−z), a 8 píxeles por metro.
2. **Pintor en la GPU.** Un filtro Kuwahara aplana la toma en manchas de pincel. Después clasifica
   cada punto en agua, bosque, pradera, piedra o techo y repinta cada clase:
   - los bosques, como copas de árboles iluminadas desde el noroeste, con bordes orgánicos;
   - la pradera, en oliva con trazo de pasto;
   - el agua, con líneas de oleaje paralelas a la costa y espuma en la orilla;
   - las laderas, sombreadas;
   - todo, con tinta en los bordes y grano de papel.
3. **Caminos desde los datos de caminar**: los pasajes entre lugares y los senderos y patios de cada
   uno (`passageGeometry`, `AREA_LAYOUTS`).
4. **Fidelidad medida**: el río del juego (`WATERCOURSE`) debe caer sobre agua pintada y cada
   lugar y sus caminos sobre tierra. En la imagen actual: **río 100 % de 35 puntos, tierra 100 % de
   91**. Si cae por debajo de 90 % o 95 %, el horneado falla.

Resultado: `public/assets/map/kingdom-map.webp`, de 2048×4096 px y 1,2 MB, y su `kingdom-map.json`.
Se copia a la raíz (`public/assets/map/`), que es la fuente de `sync-game.mjs`. Hay que volver a
hornear si cambia la geografía del mundo (`npm run export:world`).

## Qué muestra la pantalla (`src/kingdom-map.js`)

- **Pantalla completa.** Se mueve arrastrando, con la rueda, pellizcando o con flechas/WASD; se
  acerca con + y −, y C centra en el jugador. El zoom llega hasta 1,6×, acorde a la resolución
  pintada.
- **Lo no recorrido**, envejecido en sepia. **Lo recorrido** (los lugares y los caminos entre
  ellos), a todo color, con una máscara suave.
- **Según el zoom:**
  - de lejos, cada lugar con su ilustración pintada y su nombre;
  - a distancia media, cartela con el nombre, la región y los bancos;
  - de cerca, edificios, habitantes del lugar actual y nombres de bancos y recuerdos.
- **Marcas del viaje:**
  - el jugador, con la dirección en que camina;
  - el siguiente paso y una ruta dorada que va hasta él por los pasajes;
  - los bancos, dorados si están restaurados y punteados si no;
  - los pasos cerrados y los recuerdos encontrados.
- **Alrededor:** cartela con el día y la hora, tarjeta del siguiente paso (con «Ver guía»),
  brújula, escala en metros redondos y referencias.
- **Viaje rápido:** desde la lista «Viajar a un lugar visitado» o tocando un lugar recorrido en el
  mismo mapa («Viajar acá»). Las dos vías pasan por el mismo `onTravel`.
- **Teléfono:** en apaisado, título compacto, brújula abajo a la izquierda y zoom arriba a la
  derecha. En vertical, sin brújula y con los paneles abajo.

## Verificado

- `tests/kingdom-map.test.js` comprueba:
  - que la imagen y el juego coinciden en coordenadas;
  - que cada lugar con todo su terreno y cada banco caen dentro del mapa;
  - el estado de una partida nueva;
  - que la ruta va por los pasajes;
  - que el viaje es posible sólo a lugares visitados;
  - los bancos restaurados, los recuerdos y la posición dentro del taller.
- `scripts/qa-map.mjs` abre el mapa en partida nueva y en partida terminada (`IMPORT=`), a 1440×900,
  844×390 y 390×844. Comprueba que el jugador quede a la vista y que haya siguiente paso, captura
  tres zooms y viaja tocando un lugar del mapa.
- La prueba de humo de producción viaja desde el mapa al Lago y a la Plaza. Las partidas táctiles,
  vertical y apaisada, abren y cierran el mapa con el dedo.

## NO VERIFICADO

- Rendimiento en un teléfono real: la imagen ocupa unos 33 MB decodificada mientras el mapa está
  abierto.
- Prueba con personas.
