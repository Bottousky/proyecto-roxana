# Trazado de Ohmdal

`src/world-layout.js` es la fuente compartida del pavimento, el retiro de
vegetación y el mapa local. Las nueve zonas conservan los límites de `AREAS`.
Cada recorrido une lugares concretos: un umbral, un mecanismo, un patio o un
punto de observación. Las diez puertas de las casas tienen un acceso conectado,
incluidas las que no abren una escena interior. Los límites jugables se reconocen
por muros bajos y aperturas en las salidas reales. Ninguna calle continúa
indefinidamente hacia el horizonte.

## Datos y coordenadas

`AREA_LAYOUTS[id]` contiene:

- `bounds`, `spawn` y `exits`, derivados de `AREAS`.
- `paths`: líneas de puntos `[x,z]` con ancho completo `width`.
- `courts`: patios circulares `{x,z,r}` o rectangulares `{x,z,w,d}`.
- `buildings`: posición y dimensiones del cuerpo, nombre y punto `approach`.
  Todas las casas también declaran `height` y sus opciones de fachada.
  Las diez casas tienen una conexión a ese punto, también las no interactivas.
- `exclusions`: huellas de casas, bancales, canales y mecanismos. Sus `w/d`
  también son anchos completos; los obstáculos físicos de `World` usan semianchos.
- `waters`: polígonos con `points` para dibujar la misma orilla en el mapa.
- `walkSurfaces`: superficies sobre el agua; el muelle es de madera.
- `landmarks`: referencias reconocibles. `distant: true` indica paisaje de fondo,
  no un destino caminable del mapa local.
- `adjustments`: desplazamientos de decoración que necesita el trazado.

El norte corresponde a `-z`; las fachadas de las casas miran al sur (`+z`).
El taller exterior tiene su centro en `(-13.25,3.8)`, un cuerpo de `9.2 × 6.4`
y altura de pared `6.4`. Es más ancho, profundo y alto que las otras casas de
la Plaza. La fachada mira al sur: el acceso queda en `(-13.25,7.9)` y el
retorno del jugador en `(-13.25,9.3)`, frente a la puerta. La explanada tiene
centro `(-13.25,10)` y mide `8.4 × 3.6`; la calle llega desde la Plaza y
termina en este porche, sin prolongarse al oeste del taller.
La Plaza mide ahora `40 × 32`: el metro adicional de jardín a cada lado deja
una separación clara entre el muro oeste y la fachada ampliada.

`distanceToPathSegment(x,z,a,b)` mide la distancia a un segmento finito y
admite puntos extremos coincidentes. `pointInLayoutShape` consulta patios y
huellas; `pointInLayoutPolygon` consulta agua. `pointOnPaving(layout,x,z,margin)`
consulta la unión de caminos y patios, recortada por límites y exclusiones.
Un margen positivo reserva espacio para no plantar sobre el borde del camino.
Las exclusiones y el agua no se convierten en pavimento al ampliar ese margen.

La orilla del lago se calcula en `lakeShoreX(z)`: interpola los mismos vértices
espaciados cada tres metros que la geometría de tierra. El muelle ocupa
`x=9.2,z=3,w=9,d=4.5`, por encima del agua. En el mapa se dibuja el agua primero
y la superficie de madera después.

## Un mapa del escenario real

El mapa local de `src/world-map.js` utiliza el mismo trazado que el suelo:
caminos, patios, edificios, bancales, agua y muelle conservan sus coordenadas.
Muestra al jugador y los accesos de la zona. La orientación coincide con la
cámara recta: norte arriba y oeste a la izquierda. Los secretos se revelan
después de encontrarlos; una torre distante no se representa como una puerta
caminable.

El mapa del reino se construye con las salidas de `AREAS`, conserva el taller
al oeste de Plaza y diferencia los pasos abiertos de los pendientes. Con **M**
se consultan ambos mapas y los destinos conocidos para regresar. El mapa local
explica por dónde caminar; el regional explica cómo se conectan los lugares.
En móvil, **Ampliar mapa** conserva el mismo plano a tamaño legible dentro de
un visor desplazable, sin duplicar accesos ni cambiar las coordenadas.

## Identidad de cada recorrido

| Zona | Organización |
| --- | --- |
| Portal | Entrada al claro, patio del arco, asiento de Ohm y dos desvíos cortos hacia ruinas y raíces. La casa tiene su acceso por el sur de la mampostería caída. |
| Plaza | Circuito alrededor de la fuente, calle norte a la Calzada y calles laterales que llegan a las cuatro puertas. El porche de Lumen queda unido al espacio de llegada. |
| Taller | Pasillo de trabajo, aproximación al banco y circulación entre controles, hogar y armarios. Se conserva el piso completo de madera; no se superpone una carretera exterior. |
| Calzada | Vía principal hasta la reja y explanada frente a ella. Los ramales permiten atender ambos lados del circuito, visitar el puesto y observar la margen. La vía sigue al norte de la reja porque ésta se abre durante el juego. |
| Manantial | Recorrido por tierra firme al este del canal, alrededor de la fuente. Los ramales conectan bomba, acoplamiento, casa de la rueda y puesto de Vega. |
| Castillo | Patio formal con dos recorridos que rodean el distribuidor, alas de servicio y reunión en el paso central del muro. |
| Terrazas | Calle alta frente a las dos casas, dos corredores de trabajo y pasos entre cada fila de bancales. El jardín de ensayos queda al sur. |
| Lago | Paseo que acompaña la orilla, acceso a la casa y un desembarco claro en el muelle. El Faro visible al otro lado del agua sigue siendo un hito distante. |
| Faro | Tres galerías comunicadas por pasillos laterales alrededor de las máquinas; una explanada de observación termina ante el basamento sólido de la torre, sin escalones ni accesos falsos. |

Las vías principales miden aproximadamente 2.1–3 metros. Las entradas de casas
y los pasos entre cultivos son más estrechos: 1.55 metros de pavimento donde el
espacio disponible es de dos metros. Ningún camino ocupa el interior de una casa.

## Ajustes del escenario

En Terrazas las filas conservan ancho 8 y profundidad 3.5, con centros en
`z=-7.18,-1.68,3.82`: `-d*.28 + 2.9 + row*5.5`. Esto deja dos metros entre
bancales y una explanada útil delante del toldo y las macetas de la casa oeste.
La calle alta pasa por `z≈-10.3`; ramales separados llegan a sus nuevas entradas.
Los corredores entre filas quedan en `z=-4.43` y `z=1.07`.

En Plaza las cajas se agrupan al costado este del taller, en `(-7.7,0)`,
`(-7.7,.8)`, `(-6.9,0)` y `(-6.9,.8)`. La fachada y su explanada quedan libres.
Los barriles siguen en `x=12.8`, con `z=3.3,4.2,5.1,6`, fuera del acceso al
mercado. La cubierta del porche del taller mide `4.14 × 1.75`, antes de sus
aleros, y enmarca la puerta con dos postes laterales. Sus bases de `.40 × .40`
quedan en `(-15.02,8.55)` y `(-11.48,8.55)`. La aproximación y el retorno
quedan en el paso entre ambos, por delante de la cimentación. Las rocas de la
orilla del lago dejan un retiro de un metro
respecto del paseo y el acceso al muelle.

Las tuberías de las ventanas del Faro pertenecen ahora al grupo local de su
torre y acompañan su ubicación. El anclaje anterior las colocaba junto al
origen del escenario, produciendo una pieza aislada cerca de la fuente de
Plaza. La corrección conserva las tuberías en la arquitectura del Faro y
despeja las zonas de paso.

## Integración y verificación

`src/world-ground.js` construye una única unión de pavimento después de edificios
y mecanismos, recortada también contra sus sólidos definitivos. De este modo
evita los polígonos superpuestos y el pavimento dentro de objetos. La reja móvil
es la excepción al recorte, pues la vía pasa por debajo de ella cuando se abre.
Los bordes físicos de la zona tienen aperturas sólo en los pasos reales;
caminos y patios quedan dentro del límite jugable.

La revisión visual detectó que el pavimento del Lago y del Faro quedaba debajo
del remate biselado de la tierra. En estas dos zonas la superficie de piedra
se elevó a `y=.121`, por encima de la tapa del terreno en `y=.10`. La altura se
comprueba contra la geometría real, además de verificar que la ruta exista en
los datos: un camino conectado también debe ser visible.

La comprobación de conectividad se realiza sobre el escenario real, incluyendo
macetas, postes y muebles, con un radio de personaje de `.34`. Además de los
objetivos, se verifican todos los puntos de llegada, retorno y las diez puertas.
`tests/world-layout.test.js` comprueba la red de pavimento que realmente genera
el consumidor, las huellas de casas y bancales, y la correspondencia de los
bordes visibles con sus colisiones. El mapa utiliza los mismos datos y no
revela hitos distantes como accesos ni secretos aún no descubiertos.
`tests/world-map.test.js` comprueba el mapa local y las conexiones del reino;
`tests/plaza-workshop.test.js` liga la puerta dibujada del taller con su entrada,
retorno y paso pavimentado, compara su tamaño con las casas reales de Plaza y
verifica que su cuerpo coincida con el rectángulo del mapa.
`tests/landmarks.test.js` incluye la posición real de las tuberías del Faro.
El inventario general está en [production.md](production.md).
