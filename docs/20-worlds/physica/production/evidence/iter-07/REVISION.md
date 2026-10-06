# Iteración 07: revisión independiente del lenguaje corporal y respuesta

**Quién revisó:** un subagente con contexto separado, en dos pasadas, sobre secuencias tomadas en la cámara de juego a escala real (1×).
- **Cómo se tomaron:** con teclado real, la simulación en pausa en cada cuadro y un intervalo fijo de tiempo simulado. Cada cuadro lleva la pose que eligió el clasificador.
- **Antes:** `antes-*`, tomadas con el mismo script sobre el código de la iteración 06.
- **Primera pasada:** comparó `antes-*` con la primera versión, de la que sólo se guardó `intermedio-b-borde`.
- **Segunda pasada:** verificó las correcciones. Las tomas `despues-*` incluyen además lo que se corrigió después de esa verificación.

| # | Hallazgo (primera pasada) | Respuesta | Estado tras la verificación |
|---|---|---|---|
| 1 | Subir se leía como caer de espaldas: el cuerpo inclinado hacia atrás, la cabeza atrás y los brazos arriba como en `caer`. | `suspendido` es ahora el espejo de `caer` y depende de la velocidad vertical: subiendo, los brazos se arrastran abajo y abiertos y las rodillas suben; frenando, los brazos van arriba. Sin inclinación hacia atrás.<br>La verificación lo encontró parecido a un salto común. Después el cuerpo gira hacia la cámara (la V de los brazos queda en el plano de la imagen) y sube más las rodillas. | **corregido** (después de la verificación; se ve en `despues-c-borde` y `despues-d-cadena`) |
| 2 | La cara quedaba oculta justo en los momentos expresivos (sobresalto y caída). | La inclinación de la cabeza se limita a ±0,2. En la alarma la cabeza gira un 60 % hacia la cámara. El sobresalto es una compresión y después un estiramiento, con 4 marcas grandes contorneadas. | **corregido** |
| 3 | La forma de agarrar la cadena contradecía el empuje hacia arriba (manos sobre la cabeza); el esfuerzo no se veía. | En la región, los brazos bajan al agarre y el cuerpo cuelga hacia arriba, con las piernas flotando. Al tirar, el cuerpo se balancea. Gotas más grandes y contorneadas. El cuerpo gira de perfil. | **parcial** (correcto físicamente; a 1× el esfuerzo en la cadena sigue leyéndose poco) |
| 4 | Las botas salían por debajo del agua: parecía estar de pie en el fondo. | El dibujo se recorta en la superficie con un plano de recorte. El cuerpo se hunde hasta el pecho, con las rodillas recogidas y un anillo en la línea de agua. | **corregido** (queda una franja marrón de 2–3 px bajo el borde del agua, probablemente la sombra en el fondo) |
| 5 | Al empujar, las manos no llegaban a la esfera. | Al empujar, el cuerpo gira de perfil (la esfera está justo delante en la simulación), se agacha y se inclina 0,4. Las manos apoyan en la parte de arriba y atrás de la esfera. | **corregido** (el primer cuadro del empuje todavía está erguido) |
| 6 | Al cargar, la esfera no pesaba ni tocaba las manos. | Perfil, manos sobre la esfera, inclinación de 0,1 para alcanzarla, paso más corto, rodillas flexionadas. | **corregido** |
| 7 | El agachado del aterrizaje duraba ~0,1 s y no se había capturado. | Dura al menos 0,15 s y sólo aplica si la normal del contacto se opone al campo. Polvo por encima de 1 m/s. Secuencia nueva de aterrizaje. | **corregido** (~0,27 s visibles, con polvo) |
| 8 | Soltarse de la cadena no se notaba. | Las manos se abren con fuerza durante ~0,5 s. | **parcial** (se ve, débil) |
| 9 | El frenado saltaba de golpe. | El frenado se sostiene hasta que \|vx\| < 0,3, y mientras patina el cuerpo mira hacia donde se mueve. | **corregido** |

**Defectos que trajeron las correcciones, encontrados en la verificación:**

| Defecto | Respuesta | Estado |
|---|---|---|
| En la cadena, la bufanda que sube y la cabeza inclinada tapaban la cara. | Cabeza sin inclinación hacia abajo. | corregido |
| Primer cuadro vacío en la secuencia de aterrizaje. | Era del arnés: en pausa el modelo no se actualiza. Se espera un cuadro renderizado. | corregido |
| Al teletransportarse (R de vuelta al apoyo firme), la bufanda quedaba estirada como un palo cruzando la pantalla. Lo encontré yo en la secuencia de aterrizaje. | Las cadenas de tela se reinician cuando su anclaje salta. | corregido |

**Veredicto de la verificación, por cualidad, a escala de juego:**
- **Sí:** apoyo, deslizamiento (breve), sorpresa, aterrizaje y contacto (cargar, empujar, agua).
- **Esfuerzo:** sí al empujar; en la cadena, no.
- **Suspensión:** débil en esa pasada. Se corrigió después: el cuerpo de frente, con los brazos en V y las rodillas arriba. Esta última versión no la revisó el revisor.
