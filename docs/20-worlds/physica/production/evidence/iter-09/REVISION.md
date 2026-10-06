# Iteración 09: revisión independiente de la Orilla y respuesta

**Quién revisó:** un subagente con contexto separado, en dos pasadas, sobre capturas en la cámara de juego con teclado real (`scripts/orilla.mjs`). La segunda verificó las correcciones.

**Criterios (A22), de BACKLOG:**
1. El mástil no parece una escalera.
2. Cada soporte muestra a qué esfera corresponde, sin texto.
3. La cadena explica por qué no se ofrece con una esfera en la mano.

**Antes:** el reviewer leyó como del soporte A el aviso que aparecía junto al soporte B, y el que quedaba al lado del mástil. Dos de tres lecturas eran equivocadas.

| # | Hallazgo | Respuesta | Estado |
|---|---|---|---|
| 1 | La primera versión ya no parecía escalera, pero sus dos plomadas en y ≈ 3 quedaban de costado (banda de transición del campo) y se enredaban con el brazo de B (2,92). Justo la altura que el instrumento tiene que mostrar. | **Plomadas:** ninguna en 2,7–3,3. Tres abajo (0,65 / 1,15 / 2,3) que apuntan arriba, tres arriba (4,1 / 4,8 / 5,5) que cuelgan. Un 35 % más grandes.<br>**Marca del borde:** un collar con el brillo de los anclajes y un indicador.<br>**Ménsulas:** sin sombra, que dibujaba una celosía. | **corregido** («no es escalera»); el borde se lee por el hueco entre plomadas. El collar es **débil**: queda pegado al brazo de B. |
| 2 | El aviso de B tapaba la zona del borde en el mástil, y después el rótulo «2» del riel, la lectura que cambian ▲▼. | **Posición:** el aviso de B va abajo a la derecha de su esfera, en el aire de la sima (desplazamiento propio del nivel), debajo del «2».<br>**Asociación:** el anillo en la esfera y el brazo y la pinza encendidos. | **corregido** (segunda pasada: «cada aviso con su esfera») |
| 3 | Nada unía el poste a su esfera. | El soporte activo enciende su brazo y su pinza, al compás del anillo. | **corregido** |
| 4 | La razón de la cadena se leía como una ayuda de control y estaba en voseo imperativo, distinto del resto. | **Estilo:** línea propia, en azafrán, como causa.<br>**Texto:** «Manos ocupadas: así no se puede bajar por la cadena.» | **corregido** |
| 5 | El aviso de la cadena tapaba la esfera recién soltada en el labio. | Va sobre el explorador, a la izquierda del labio. | **corregido** |
| 6 | Una ménsula cruzaba la rueda de latón del borde. | La primera plomada que cuelga pasa a 4,1. | **corregido** |
| 7 | La caja con la esfera en la mano tocaba la esfera B y el pelo del explorador. | Va en la franja libre entre la cabeza y las dos esferas colgadas (ambas a 2 m). | **corregido** |

**Hallado al correr el recorrido, no por el revisor:**
- **El defecto:** el soporte P del Pozo no soltaba su esfera y E agarraba la cadena del Pozo. El poste de P está a 0,15 m de la zona donde la cadena contaba como distancia 0.
- **Era previo a la iteración:** el recorrido pasaba porque el explorador se frenaba justo antes; una persona parada al lado del poste podía caer en lo mismo.
- **Corrección:** la cadena compite con su distancia real al lugar donde se toma (el labio) y gana la interacción más cercana. Prueba nueva en `world.test.js`.

**Verificado sólo por el implementador:** los ajustes finales de posición (cajas v4–v7) y el color del collar, en `despues-*`, después de la segunda pasada.
