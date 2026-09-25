# Revisión de composición de Ohmdal

Registro de la pasada del 9 de septiembre de 2026. Se revisaron las llegadas de
las nueve zonas y las aproximaciones de las diez casas conservadas. El trabajo
resolvió superposiciones de fachadas, cubiertas fuera del recinto, vegetación
que ocultaba entradas y encuentros incoherentes entre agua, edificios y límites.

## Evidencia de esta sesión

La inspección visual se realizó en el mundo real del visor, mediante CUA en la
pestaña 13, a **1280 × 720**. La cámara jugable usó offset **(0, 13.5, 25)** y zoom
**0.93** en exteriores o **1.08** en el Taller. También se usó la vista general
del visor para examinar conjuntos y cubiertas; esa cámara lleva su propio rótulo
y no acredita por sí sola la visibilidad durante el juego.

Las capturas se observaron dentro de la sesión. Este registro no les atribuye
rutas de archivo ni presenta imágenes guardadas que no existan. Los informes
geométricos persistidos son distintos de esas capturas:

- [Informe inicial](../scripts/audit-composition-initial.json).
- [Informe posterior a las correcciones](../scripts/audit-composition-current.json).
- [Detector y reproducción de informes](../scripts/audit-composition.mjs).

La pasada cubrió composición, estados visuales seleccionados y recorridos
locales. **No se volvió a jugar hoy la historia completa**, ni se realizó una
verificación exhaustiva de móviles. La evidencia histórica de otras pruebas
permanece en [Producción](production.md).

## Cómo reproducir la revisión

Ejecutar `npm run dev` y abrir
`http://127.0.0.1:4173/scripts/qa-composition.html`. El
[visor](../scripts/qa-composition.html) crea su propia instancia de `World` y un
estado en memoria; no lee ni escribe partidas guardadas ni preferencias.

1. Elegir una **Zona** y pulsar **Llegada**. Mantener la cámara jugable para
   evaluar lo que ve el jugador.
2. Usar **Fachada anterior/siguiente** para visitar las aproximaciones publicadas
   por la arquitectura. El selector **Punto** también incluye accesos y objetos;
   **Ir al punto** busca pavimento seguro próximo a ellos.
3. Leer el aviso de aproximación y ruta. Si el visor debiera colocar al jugador
   más adelante por una obstrucción, ese punto alternativo no demostraría que la
   entrada declarada está despejada.
4. Alternar **Restaurado** para comparar los estados preparados por el visor.
   El estado inicial del visor mantiene a Ohm despierto para inspeccionar su
   seguimiento; no equivale a iniciar una partida nueva desde el prólogo.
5. Pulsar **Vista general · composición** para examinar siluetas y tejados.
   Utiliza offset `(0, 38, 30)` y encuadre automático. Volver a **Cámara jugable**
   antes de sacar conclusiones sobre puertas, personajes o recorridos.
6. Caminar con WASD/flechas o clic. **H** oculta y recupera los controles; la vista
   general conserva su rótulo. El panel y los atributos del DOM registran zona,
   punto, coordenadas, cámara, pavimento y seguridad del jugador y de Ohm.

Se pueden repetir puntos concretos con parámetros, por ejemplo:

```text
/scripts/qa-composition.html?area=plaza&point=plaza-workshop&restored=1
/scripts/qa-composition.html?area=spring&point=wheel-house&restored=0
/scripts/qa-composition.html?area=lighthouse&point=beacon_lens_panel&restored=1
```

Los identificadores de la tabla siguiente son los actuales. `arrival` funciona
en todas las zonas. El visor abre siempre con la cámara jugable; la vista general
se activa explícitamente desde su botón.

## Registro visual por zona

| Zona / ID | Puntos reproducibles | Vistas observadas y resultado de la revisión |
| --- | --- | --- |
| Portal Ω · `portal` | `arrival`, `portal-keeper`, `ohm_pedestal` | Llegada y aproximación de la casa. Se comparó el follaje antes y después: un árbol y un pino ocultaban puerta y personaje. Su colocación ahora considera la proyección de la fachada y deja visible el recorrido. La columna histórica conserva una superposición lateral pequeña, sin tapar la puerta. |
| Plaza de Ohm · `plaza` | `plaza-bakery`, `plaza-civic-house`, `plaza-workshop`, `plaza-market` | Llegada, cuatro fachadas y aproximaciones libres. La Panadería dejó de quedar detrás del Taller; la casa del norte y el Mercado se separaron. El Taller conserva su volumen aprobado y el porche sur. Calles, estatua, faroles, banderas, guirnalda y provisiones acompañan la nueva composición. |
| Taller de Lumen · `workshop` | `arrival`, `workbench`, `workshop_to_plaza` | Llegada interior y lámpara del banco observadas con la cámara interior real. Se mantuvieron el banco, su iluminación y el regreso a la puerta del Taller. No se añadió un interior nuevo como parte de esta pasada. |
| La Calzada · `road` | `arrival`, `road-inn`, `gate_panel`, `road_to_spring` | Llegada, fachada del puesto y puerta en estado cerrado y abierto. Se revisó también el canal final: agua contenida y remates materiales legibles, conservando el paso central y su cierre físico. |
| El Manantial · `spring` | `arrival`, `wheel-house`, `pump_panel` | Llegada y casa, tanto en estado inicial como restaurado. La rueda se separó de la fachada y muestra apoyos, eje y acoplamiento. El acueducto y la canaleta tienen soporte, el agua llega a la rueda y cae en una poza. El depósito tiene borde visible; bomba y puerta conservan sus aproximaciones. |
| Castillo de la Red · `castle` | `arrival`, `distribution_panel`, `castle_to_terraces` | Llegada, paso a Terrazas y vista general. Se revisaron alas, torres, patio y salida como fortificación especial; no se contaron como casas del detector de fachadas. Se conservó el eje central de circulación. |
| Las Terrazas · `terraces` | `arrival`, `terrace-forge`, `terrace-mill`, `irrigation_panel` | Ambas casas, llegada y conjunto. Los cuerpos menos profundos dejan los aleros dentro del recinto y las puertas sobre la calle alta. Las aspas están ligadas al molino y pasan por encima del dintel. Se observaron los nuevos emblemas y los elementos de forja, diferenciados del mostrador del Mercado. |
| Lago de las Señales · `lake` | `arrival`, `lake-house`, `lake_to_lighthouse` | Llegada, vivienda y vista del Faro lejano antes y después de añadir su apoyo rocoso. La casa conserva su acceso por tierra firme y elementos de pesca. La torre distante se apoya en un islote; el mapa representa esa roca sobre el agua, sin convertirla en destino ni añadir un camino. |
| El Faro · `lighthouse` | `arrival`, `beacon_lens_panel`, `lighthouse_window` | Llegada, conjunto y remate norte. Se retiraron la casa decorativa que invadía el borde y su camino. El basamento se integra al muro; la puerta baja se sustituyó por una rejilla técnica y se eliminaron los escalones atravesados por el límite. Un recorrido real por clic terminó en **(-0.73, -19.72)** con jugador y Ohm seguros y el jugador sobre pavimento. |

## Decisiones espaciales registradas

Las dimensiones y posiciones de las casas proceden de
[world-layout.js](../src/world-layout.js); `World` construye la arquitectura desde
esos datos. Cada edificio conserva una nota `composition` para explicar su papel.

- **Plaza:** Panadería en `(-5.15, -10.3)`, cuerpo `4.8 × 4`; casa cívica en
  `(7.2, -10.1)`, `6 × 4.6`; Mercado en `(14.8, 3)`, `4.8 × 4.6`. El Taller se
  mantiene en `(-13.25, 3.8)`, `9.2 × 6.4`, altura `6.4`, con entrada sur en
  `(-13.25, 7.9)`. Las calles terminan en sus entradas y las provisiones quedan
  al costado, fuera de las explanadas.
- **Terrazas:** forja en `(-13.6, -14.5)`, `5.8 × 3.6`; molino en
  `(13.6, -14.6)`, `4.8 × 3.6`. La calle alta sigue conectando las dos fachadas
  sin invadir los bancales. Panadería, forja y vivienda del lago tienen servicios
  propios para que sus objetos visibles correspondan al oficio del lugar.
- **Manantial:** rueda en `(7.82, -5.7)`. Pilares, roca de origen, soporte,
  cojinete y poza comparten huellas entre geometría, pavimento, vegetación y mapa
  mediante [world-waterworks.js](../src/world-waterworks.js). El agua de la
  canaleta responde a la compuerta; el acoplamiento muestra por separado la
  transmisión hacia la casa.
- **Faro:** el basamento mide `11 × 8`, con centro `(0, -24.38)` y frente en
  `z=-20.38`, coincidente con la cara interior del antiguo muro. La explanada
  terminal está en `(0, -18.4)`, `6 × 3.4`. La torre sigue en `z=-23.94`; no se
  cambiaron paneles ni encuadres cinematográficos. El mapa tiene sólo el acceso
  de regreso existente y no conserva la casa retirada.
- **Islote del Lago:** centro `(15.6, -16.32)`, radio `4.515`, derivado de la
  constante de la geometría. Es una exclusión rocosa no transitable; el Faro
  mantiene la marca `distant`.

## Resultado automático y alcance

El informe inicial produjo **cinco fallos de composición**: puerta y fachada de
la Panadería ocultadas por el Taller, más aleros fuera del límite en la forja,
el molino y la antigua casa del farero. El informe final tiene **cero fallos**.
Las diez casas conservadas presentan **0 de 9 muestras de puerta obstruidas**;
no se detectan cubiertas intersectadas ni aleros que crucen el mapa. Las
envolventes proyectadas de las casas quedan separadas desde la cámara jugable.

Persisten superposiciones parciales pequeñas de elementos secundarios sobre
fachadas —como la columna del Portal—, pero no sobre las entradas. El detector
separa los planos con transparencia de la geometría opaca; la lectura de los
píxeles de follaje se comprobó además en las vistas reales del visor.

Para repetir la auditoría geométrica:

```sh
node scripts/audit-composition.mjs
node --test tests/world-composition.test.js
```

La validación final de esta pasada completó **191 de 191 pruebas** con `npm test`
y `npm run build` terminó correctamente, generando `index-CDzL-9nD.js`. Incluye
las cuatro pruebas nuevas de agua y el mapa del islote; el informe de composición
se volvió a generar sin fallos, conservando el informe inicial por separado.

Se comprobó además la interfaz real en una partida aislada: entrar al Taller,
volver a la explanada y abrir el mapa de la Plaza. La versión compilada se
recargó en `http://127.0.0.1:4180/` y se retomó la partida existente en la Plaza,
con el objetivo «El otro lado de la puerta» conservado. La captura final de esa
partida, a 1223 × 912, muestra la Panadería separada del Taller. Los tres visores
comprobados no registraron errores de consola; los dos de prueba se cerraron.

Las pruebas de rutas, colisiones, mapa y estructuras complementan la revisión
visual. Sus cantidades no son una medida automática de calidad artística ni
amplían el alcance de recorridos y pantallas observado en esta sesión.
