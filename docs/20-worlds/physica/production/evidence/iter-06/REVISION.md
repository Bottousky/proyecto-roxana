# Iteración 06: revisión independiente del explorador y respuesta

**Quién revisó:** un subagente con contexto separado, en dos pasadas.
- **Primera pasada:** comparó la hoja de giro con el modelo anterior (`antes-*`) y con el primero reconstruido (`intermedio-vs-hoja`, entonces v6), en las mismas vistas y en la cámara de juego.
- **Segunda pasada:** verificó las correcciones sobre la v10.
- Las tomas `despues-*` son la v11, que responde a la segunda pasada.

**Veredicto de la primera pasada:**
- **De cerca, «en parte»:** están todas las piezas del vestuario, en su lugar y con la paleta de la hoja, pero el pelo, las colas de la bufanda y las antiparras no tenían la silueta de la hoja.
- **En la cámara de juego, «casi»:** se reconoce por bloques de color.

| # | Hallazgo | Respuesta | Estado |
|---|---|---|---|
| 1 | Las colas de la bufanda se leían como tablas: una rígida por la espalda y la otra como un muñón oscuro; de frente no se veían. | **Arreglos:**<br>· 11 y 9 tramos, angostas en el nudo y anchas en la punta, con bordes oscuros pintados y puntas deshilachadas (prueba alfa).<br>· Las dos caen detrás del hombro derecho, como en la hoja.<br>· Menos amortiguación: antes actuaba como un viento fuerte y las ponía horizontales al caminar.<br>**Bugs encontrados en node:**<br>· El muñón: al girar el cuerpo, una cola quedaba atrapada delante del pecho.<br>· Con el empuje radial, las colas se deslizaban hacia los costados en cada cuadro.<br>**Prueba en node:** en 720 cuadros de caminatas con giros, ningún punto de una cola queda delante del cuerpo. | **corregido** (en la espalda todavía sale casi horizontal desde el hombro antes de caer) |
| 2 | Pista del campo: el texto decía que las colas suben en la región, pero eso no se había mostrado. | **Medido en el navegador, con el explorador en la cadena dentro de la región:** las colas suben desde el anclaje (0,73 m sobre los pies) hasta 1,0–1,1 m. En campo normal, la punta cuelga a ~0,3–0,4 m.<br>**Medido en node, el remolino:**<br>· antes apuntaba a 87° en los dos campos: no respondía, y la afirmación del modelo anterior era falsa;<br>· ahora, 33° en campo normal y 79° en la región.<br>Ver `juego-cerca-campo-normal` contra `juego-cerca-en-la-region`. | **parcial** (de cerca se lee; en la cámara de juego las colas suben detrás de la cabeza y casi no se ven) |
| 3 | Las antiparras: chicas, altas, y con vidrio negro y un punto blanco se leían como un segundo par de ojos. | Cerca de 1,3 veces más grandes y más profundas; sobre la frente, encima del flequillo; vidrio ahumado gris, mate, con una banda de reflejo. | **corregido** |
| 4 | El pelo, un casco liso con flequillo en zigzag parejo; demasiado oscuro. | **Hecho:**<br>· marrón medio cálido;<br>· flequillo desparejo con un mechón entre los ojos;<br>· puntas que salen del contorno en los costados y la nuca;<br>· coronilla con más bulto;<br>· patilla más ancha, porque el contorno la tapaba.<br>Antes se probaron mechones sueltos (con conos, un erizo; con lágrimas planas, tejas) y se descartaron. | **parcial** (la silueta sigue más redonda que en la hoja) |
| 5 | En tres cuartos, el ojo y el rubor del lado lejano se salían de la cara. | Ojos más juntos (z ±0,056). El rubor se apoya sobre la piel.<br>Al corregirlo quedó invisible: el parche estaba orientado hacia adentro y se descartaba. La segunda pasada lo detectó y se arregló. | **corregido** |
| 6 | De espaldas, la nuca tapaba la bufanda. | La nuca es más corta y la bufanda más gruesa. | **corregido** |
| 7 | Faltaba el cuello alto. | Se probó y se quitó: con esta cabeza apoyada sobre la bufanda, sin cuello, cualquier cuello visible tapa la mandíbula de frente y de costado. | **no se aplica** (decisión, D12) |
| 8 | En la cámara de juego, el abrigo azul petróleo se confundía con el agua de atrás. | El contorno nunca baja de ~1,4 px en pantalla, porque escala con la distancia. | **corregido** |
| 9 | **Detalles:**<br>· contorno de la nariz;<br>· muescas en la correa de las antiparras;<br>· reloj de muñeca saliente;<br>· botas cortas sin suela;<br>· remolino como aguja;<br>· proporción de 2,75 cabezas contra 3,4 en la hoja. | **Arreglos:**<br>· nariz sin contorno;<br>· correa sobre la línea del pelo;<br>· reloj girado hacia el frente, al ras de la correa;<br>· botas más altas con suela y taco, pantalón más amplio;<br>· remolino como mechón corto que se afina.<br>**Proporción:** se mantiene, porque ayuda a leer al personaje en la cámara de juego. | **corregido**, salvo la proporción (decisión) |

**Regresiones que encontró la segunda pasada, ya corregidas en la v11:**
- el rubor desaparecido;
- el remolino como alambre o antena;
- las colas horizontales al caminar;
- la muesca de la correa.
