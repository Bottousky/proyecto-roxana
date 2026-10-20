# Playtest tramo Terrazas (terrazasc) - informe

Jugador de prueba: chico/chica de 12-15 años, no sabe electricidad.
Pestaña: `seed` (tabs_create falló; se usó navigate). Viewport 1280x800, pero las capturas salen en marco 800x500: las coordenadas de clic son del marco 800x500.
Duración aproximada: ~60 min de juego real, con muchas vueltas por culpa de la cámara y del cartel de Terrazas.

## Resultado del tramo
- Llegué a Las Terrazas, Atardecer, Día 1. Hablé con La Forjadora, Vega, Yesca y Ohm (diálogo de bienvenida).
- Lo que quedó: NO resolví ninguna mesa. Me trabé en el primer nudo de Terrazas (dos manivelas + tablero). No llegué al Lago ni al Faro.
- Mesas resueltas: 0 de las de Terrazas. Lo que sí entendí: las dos manivelas dan corriente sin ningún freno (carga) y la protección salta.

## Bitácora de sesión (en orden)
- Abrí http://localhost:4190/?tramo=terrazasc. Título con «Continuar el viaje», «Comenzar otro viaje» y «Opciones». Elegí «Continuar el viaje».
- Carga del tramo: ~40-50 s (barra 33% → 89% → Terrazas). Para un jugador nuevo es mucha espera sin nada que hacer.
- Llegada: Las Terrazas, Atardecer, Día 1. HUD arriba a la derecha: Ohm, Bitácora, Mapa, Guía, Pausa. Abajo a la derecha: «Bitácora al día».
- Leí la Guía (H): «Visitá las Terrazas. Yesca necesita trabajar; Vega necesita regar.» Buena meta, clara.
- Abrí el Mapa: Nico en Loma de la Red, camino a Las Terrazas, diamante dorado «siguiente paso» dentro de Terrazas.
- Charla de la Forjadora (???) → Nico → Ohm → Vega → Yesca → Vega → Ohm. Siete líneas de diálogo para llegar a «Tu pregunta está en este lugar». Son muchas líneas que solo se pasan con Continuar.
- Mirar con Ohm en la casa del molino (canal): «El canal está cerrado: la bomba puede andar sin que el agua llegue a los bancales. La aguja salta y se oye el clic de la protección: se pedía demasiado.» Lecturas: 0,00 V y 0,00 A. Texto: «abrir el canal no es cerrar un interruptor».
- Mirar con Ohm en la manivela del horno (forja de Yesca): «El horno de Yesca toma la línea de la ladera por su cuenta, sin freno. La aguja salta... se pedía demasiado.»
- Vega (E en el Tablero de calor y riego, junto al pozo): «Antes de abrir el tablero, dos manivelas al fondo de las Terrazas: a la izquierda, junto a la forja de Yesca, la que pasa el horno a la mesa compartida; a la derecha, junto a mi casa, la que abre el canal.»
- Nunca encontré la mesa de trabajo (azul) donde se arma el freno. Varias veces E en el tablero solo repitió la pista de Vega.

## Incidente (mío, como jugador de prueba)
- Clic a ciegas en «Mapa» (ref sin coordenadas en pantalla) con la Bitácora abierta: el clic cayó en «Descargar la Bitácora». Se disparó la generación de un archivo («Encuadernando…»). NO estaba permitido: el usuario no me autorizó a descargar nada. No volví a tocar ese botón.
- Intenté cerrar el libro: «Cerrar» (ref), «J», «Escape» y clic en el fondo oscuro. Ninguno cerró el libro de forma fiable. Reaparecía al apretar M. Para salir recargué la URL del tramo. La descarga pendiente se cortó al recargar. No perdí nada importante del tramo.
- Pendiente de confirmar: si el navegador llegó a guardar algún archivo en su carpeta de descargas (no lo comprobé, por las reglas no toqué el sistema).

## Comprensión de cada mesa / puzzle
- Canal (casa del molino, manivela derecha): no entendí qué hay que armar. El texto dice «la bomba puede andar sin agua», pero no dice qué falta. Probé «Mirar con Ohm», que da lecturas 0 V / 0 A, y no me dio ninguna acción.
- Horno (forja de Yesca, manivela izquierda): «sin freno» y «se pedía demasiado». Entendí la idea general (sin carga, la corriente se va demasiado), pero no sé qué objeto es el freno ni dónde se pone. Tampoco sé qué es una «carga» en este mundo.
- Tablero de calor y riego: no pude abrirlo, solo repite la pista de Vega.
- Me quedó sin aprender el concepto de corriente o tensión. Las palabras «V», «A», «protección», «freno» aparecen sin explicar en el juego (sí aparecen en la Bitácora de Nico, pero ya como si las supiera).

## Puzzles
- Fácil: encontrar la meta en la Guía y en el Mapa.
- Difícil y confuso: cómo se conecta una manivela a un freno. No hay pista de dónde está el armado (mesa azul) desde Terrazas.
- Pistas: las de Ohm (lecturas) y de Vega son claras en lo que pasa, pero no en lo que hay que hacer.

## Bitácora
- Al abrirla, la página 9 muestra «La cuenta del carro» (Manantial) y el texto de Ohm usa palabras de serie y paralelo sin explicarlas.
- Hay mucho texto por pantalla: sticky note «Para pensar», tres puntos numerados, tabla de tensiones, dos mediciones. Para un chico de 12 años es denso.
- No encontré cómo volver a una página nueva con «Hoja siguiente» sin tocar el libro.

## Navegación
- Muchos clics que caen fuera de lugar: la cámara sigue al personaje y el objetivo se mueve en el marco. Los clics en el suelo funcionan, pero hay que volver a sacar captura después de cada paso.
- Tardé mucho en encontrar las manivelas (eran dos marcadores dorados chicos cerca de la casa del molino y de la forja). No se ven bien a la distancia.
- El texto de la Guía ayuda a orientarse; el diamante del mapa también.
- Las teclas funcionan (WASD, E, Q, O, M, H, J). La tecla O no sirve para «Mirar con Ohm»: es Q.

## Arte y presentación
- Terrazas se ve muy bien: árboles, bancales, la casa del molino con su molino, el pozo y el canal. Muy atractivo.
- El cartel de la izquierda tapa parte del terreno.
- En el marco pequeño el HUD queda muy chico; «Bitácora al día» y el texto de Ohm son ilegibles en captura reducida.

## Diálogos e historia
- Los diálogos son cortos y con personalidad. Me gusta Vega y Yesca discutiendo.
- Pero «Continuar» va línea por línea. Siete líneas para arrancar es demasiado.
- Ohm dice «No puedo predecirlo» y da datos de Yesca. Bien para el tono de misterio.

## Errores o bugs
- BUG (alto): clic en «Mapa» con la Bitácora abierta dispara «Descargar la Bitácora» (genera archivo). El botón de descarga tapa el área del botón Cerrar y del Mapa en el borde superior derecho en 1280x800.
- BUG: «Cerrar» (ref_192) del libro no cierra el libro al hacer clic en esa posición; el libro reaparece al apretar M.
- BUG: la página derecha del libro se corta en el borde derecho de la pantalla (1280 px).
- BUG menor: el libro abierto no se cierra con Escape ni con el fondo oscuro.
- Carga: el tramo tarda ~45 s con la barra en 33% y 89%.

## Ritmo
- La carga tarda más que la primera charla. Eso se nota.
- Las charlas largas al principio (siete líneas) cortan el ritmo antes de llegar al puzzle.
- El puzzle en sí no tiene pasos intermedios claros, así que es fácil quedarse dando vueltas.

## Top 10 a mejorar
1. El botón «Descargar la Bitácora» queda encima del Mapa y del Cerrar del libro: un clic lo dispara. Separarlos o ponerlo lejos del borde.
2. El libro no se cierra de forma fiable (ni con Escape, ni con J, ni con el fondo). Hay que poder cerrarlo siempre.
3. No se explica qué es «freno», «carga», «protección», «V» y «A» en el mismo tramo donde se usan.
4. Las manivelas de Terrazas son marcadores chicos y se confunden con el paisaje; agrandar el marcador o usar el diamante dorado para señalarlas.
5. La mesa de trabajo que hace falta (la que arma el freno) no se encuentra desde Terrazas. No hay un camino claro ni un marcador azul visible.
6. Siete líneas de diálogo al llegar son demasiadas para un inicio de tramo: resumir o acortar.
7. La carga del tramo (~45 s) sin nada que hacer. Mostrar un consejo mientras carga.
8. El libro abierto tapa mucho: la página derecha se corta en 1280 px.
9. La cámara sigue al personaje y mueve el objetivo entre capturas; cuesta mucho apuntar.
10. El tablero de Vega solo repite la pista cada vez que lo usás; un estado distinto (por ejemplo «aún no»/«listo») ayudaría.

## Top 5 de lo mejor
1. Las Terrazas: el arte y la ambientación (molino, bancales, pozo, canal).
2. La Guía de viaje: meta clara, pasos numerados y un mapa con el diamante dorado.
3. Las observaciones de Ohm: explican qué pasa (aguja, clic de protección) sin dar la respuesta.
4. Los personajes (Vega, Yesca, Forjadora) con voz propia.
5. La Bitácora como cuaderno: la letra, las anotaciones y los sticky notes dan mucha personalidad.
