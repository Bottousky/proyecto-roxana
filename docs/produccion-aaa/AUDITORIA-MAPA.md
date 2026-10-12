# Auditoría del mapa jugable

11 oct 2026. Recorrí los ocho lugares exteriores y los caminos entre ellos con la partida del Arco I
terminada, y busqué tres cosas: si se llega a todo, si hay caminos difíciles de encontrar o de seguir,
y si hay casas que no tienen sentido.

## Cómo se midió

1. **Caminable, en números.** En el juego real, una grilla de 25 cm sobre cada lugar y sus salidas,
   con la colisión del jugador (`canStand`). Desde el punto de llegada, un recorrido en anchura marca
   todo lo alcanzable. Se cruzó con el empedrado, las puertas, los objetos y las salidas.
2. **Desde arriba.** Una toma ortográfica de cada lugar, con los colisionadores, los límites, las
   puertas y los caminos entre lugares dibujados encima. Otra toma inclinada (55°) muestra los árboles,
   que desde la vertical no se ven.
3. **Con la cámara del juego**, parado frente a cada casa con puerta y en el medio de cada camino.
4. **Como jugador.** Desde la salida del Portal y desde la salida norte de la Plaza, sólo manteniendo
   W, para ver si el camino lleva solo.
5. **Árboles y casas, en números.** Para cada casa: árboles dentro de su planta, delante de su
   fachada (entre la casa y la cámara) y a menos de 4 m.

## Veredicto

**Se llega a todo.** El 100 % del suelo caminable de cada lugar se alcanza desde la llegada. También
se alcanza cada puerta, objeto y salida. Los caminos entre lugares se siguen con sólo mantener una
tecla: del Portal a la Plaza y de la Plaza hacia la Calzada, el personaje dobla con el camino.

**Las casas con puerta están bien.** Ninguna de las diez casas habitables tiene árboles dentro ni
delante.

Los problemas reales eran dos.

### 1. Las seis casas del pueblo, perdidas entre árboles

Más allá de la cerca de la Plaza había seis casas «de fondo». Eran el resto del pueblo, sin puerta y
paradas en el pasto, lejos de todo camino. Al construirlas se les borraba la ficha de arquitectura y
la siembra de árboles dejaba de verlas. Por eso **había cuatro árboles creciendo dentro de una de
ellas** (la de −28, −5) y otros delante de la fachada de dos más. Con la cámara del juego se veían
techos sueltos asomando entre copas, sin puerta ni camino. Era exactamente «casas ocultas entre
árboles que no tienen sentido».

**Arreglo:**
- **Dónde están.** Tres casas miran a la Plaza por detrás de su cerca oeste, a 6,5 m de ella. Las
  otras tres bordean el camino a la Calzada, giradas hacia él y a 7,4 m de su centro. Quien sale hacia
  el norte pasa delante de ellas: el pueblo sigue a lo largo del camino.
- **Cómo son.** Cada casa tiene su puerta y un jardín con cerca baja y un portón cerrado sobre la
  vereda, con un sendero de tierra de la puerta al portón. Tiene su propio árbol detrás, que enmarca
  el techo. El portón cerrado dice «es la casa de alguien», sin parecer un camino que después no deja
  pasar.
- **El patio libre.** Cada casa conserva sus muros con alero, el jardín y la vista desde la cámara
  (5 m al sur). Ahí no se planta ningún árbol: ni los del lugar, ni la arboleda del camino entre
  lugares, ni el seto del borde, porque la cerca ya marca el límite. Las flores del jardín sí crecen.
- **La regla vive en un solo lugar** (`backdropYards` en `world-layout.js`). La usan la construcción
  del lugar, el paisaje compartido y la siembra de PlayCanvas.
- **Prueba nueva:** `village houses beyond the square keep a door, a shut garden gate and yards free
  of trees`.

### 2. El sendero del bosque, caminable pero invisible

Entre la Plaza y el Portal, y entre el Castillo y las Terrazas, hay un segundo camino, la vuelta por
el bosque, de 2,7 m de ancho. Era caminable, pero se dibujaba como pasto sobre pasto. Desde arriba no
se veía, y con la cámara del juego el jugador aparecía entre matas sin ningún camino a la vista: un
camino difícil de encontrar.

**Arreglo:** el sendero se pinta como tierra pisada. La exportación lo marca como sendero. El
horneado de la orilla lo escribe en el mapa del suelo con cobertura parcial (0,4) y un tono propio
(200), y el sombreador del suelo pinta ese tono como tierra, no como empedrado. Las plantas ya no
crecen encima. Con sólo la cobertura parcial, el pasto se oscurecía un 10 % y no se notaba: medido
en la toma cenital, el verde bajaba de 127 a 112. Por eso lleva su tono.

## Revisado y sin problema

| Dónde | Duda | Resultado |
|---|---|---|
| Castillo | La auditoría numérica marcaba un 15 % del empedrado de servicio sin alcanzar | Era el suelo bajo las palancas (−8, −1) y (8, −1), que están sobre el camino a propósito. El camino se recorre entero |
| Salida del Portal | En la auditoría del Arco I, caminar con W metía al jugador en el seto | Ya no: con W sola el personaje sigue la curva hasta la Plaza |
| Plaza → Calzada | Dirección poco clara, el camino dobla al noreste | Con W sola se dobla con el camino. Ahora además lo bordean las casas del pueblo |
| Terrazas | La forja y el molino tienen un bancal delante de la puerta | La calle alta pasa entre bancal y casas, empedrada hasta cada puerta |
| Lago, Manantial, Calzada, Portal | Casas con árboles cerca | Ninguno dentro ni delante; los que hay quedan al costado o detrás |
| Monte Quieto | La Casa de Compuertas no se alcanza | Es a propósito: es el umbral del Arco II, sobre la loma |

## Para regenerar el mundo en Linux sin Blender

`npm run export:world` necesita Blender para hornear la oclusión. Sin instalarlo sirve el módulo de
Python: `pip install bpy==5.2.2` en un entorno con Python 3.13, y
`BLENDER_PYTHON=ruta/al/python node scripts/bake-ao.mjs`. Esta pasada se horneó así, con las mismas
muestras (48) que en Windows. Con 4 núcleos tarda alrededor de una hora.

El zlib de Node de este contenedor comprime peor que el usado antes: la misma geometría queda en
9,9 MB en lugar de 8,9 MB. Por eso `geometry.bin.gz` se recomprimió con `gzip -9`: el contenido es
idéntico y ocupa 9,1 MB. La diferencia con antes son las cercas y portones nuevos.

## Pendiente (propuestas, no hechas)

- **Que las casas del pueblo tengan vida:** humo en alguna chimenea, una ventana encendida al atardecer
  o un vecino en el jardín. Hoy están quietas.
- **El mapa dibujado (`public/assets/map/`)** se horneó con las casas en su lugar anterior. Hay que
  volver a hornearlo (`scripts/bake-map.mjs`) en una máquina con GPU. Se probó en este contenedor,
  que sólo tiene renderizado por software (SwiftShader), y el resultado no sirve: los techos de
  pizarra oscura salen con otro color y el pintor los toma por agua. El Taller y la Casa de la Plaza
  aparecen como estanques y se pierden otras casas, así que se dejó el mapa anterior. De esa prueba
  quedaron dos arreglos al script: completa el nombre que pide la partida nueva y da más tiempo a
  cada toma.
  **Hecho el 12 oct 2026 en una Mac M2 con GPU.** Con GPU el error seguía en el Taller de Lumen y
  en las torres del Castillo y del portón de la Calzada: su pizarra gris verdosa, iluminada, se
  parece al agua. El horneado ahora saca una segunda toma con sólo los techos, tal como los dibuja
  el juego, y suma las plantas de `world-layout`. Bajo un techo nunca hay agua, y los techos fríos
  se pintan de pizarra (ver [MAPA.md](MAPA.md)). Las seis casas del pueblo ya aparecen en su lugar
  nuevo.
