# Playtest tramo Faro (16) - informe

Jugador de prueba: chico/a 12-15 años, sin base de electricidad.
Entrada: http://localhost:4190/?tramo=faroe, «Continuar el viaje».
Resultado: NO llegué a la primera mesa (Fuente del Faro). No resolví ninguna mesa ni vi el final.
Pestaña usada: "seed" (tabs_create falló con "Browser pane gone, gate off, or tab cap reached"; navegué en la pestaña que devolvió navigate). Pestaña cerrada al terminar.
Aviso: tabs_context dijo "The Browser pane is currently hidden." durante toda la sesión.

## Lo que esperaba vs. lo que pasó
- Esperaba: llegar al Faro, caminar hasta la Fuente (mesa I) y usarla con E.
- Pasó: el mundo tardó en cargar (~30 s, "Abriendo los caminos"), caminar fue muy lento e intermitente, y la Fuente nunca abrió su panel. Ver "Navegación" y "Errores".

## Bitácora y Guía (lo primero que leí)
- La Bitácora tiene contenido muy rico: "La cuenta del carro" con dos faroles en serie, tabla de tensiones (3,98 V + 7,97 V = 11,95 V), "Lo que hay detrás" en tres pasos, y una nota "Para pensar" (¿qué pasa con un tercer farol?). Me gustó que sea "cuaderno de campo" y que tenga pruebas conservadas. Para un chico sin base, el paso "El que más frena, más se queda" es abstracto: no alcanza con la frase, falta ver el circuito.
- Bitácora: la página tiene mucho texto junto. En 1280x800 algunas páginas se cortan a la derecha (el texto de "Lo que hay detrás" se sale del marco). Si no lo ves, cuesta leer.
- La Guía (H) es clara: "Un paso a la vez", con AHORA = "El Faro · I / III", "Recorré el lugar", "Observá lo que cambia", "Probá una idea". Los tres pasos son buenos. El botón "Ubicarme en el mapa" y "Abrir bitácora" ayudan.
- Hay una frase que me confundió: "Abrí la Fuente del Faro, la primera mesa, al pie de la torre". Mi lectura: "al pie de la torre" es la plaza con las mesas, pero no hay ningún marcador de "mesa" que se vea claro desde lejos.

## Diálogos e historia
- Nereo (Farero Mayor) habla con mucho tono: "Escucho el lago", "Los fareros no escribimos el ritmo en números", "Yo lo canto mientras subo". El tono es lindo y misterioso.
- Frase que me quedó: "La manivela conservó el movimiento; para guiar un barco nos faltaba la luz." Buena para ubicar el problema: energía mecánica que hay que convertir.
- Problema grave: cada vez que me acercaba a la Fuente, Nereo me abría su diálogo ("La memoria ayuda. Por eso mismo conviene dejarla en algo más que una cabeza.") y bloqueaba el movimiento hasta apretar Enter. Con E cerca de él también volvía a abrir su diálogo. Un jugador no sabe por qué el personaje no avanza.
- Mi primer diálogo con Nereo empezó con "¿Cómo sabés cuándo corregir el ritmo?" y "¿No el mecanismo?". Estaba bien, pero no sé qué le estaba respondiendo (no hay opciones visibles).

## Mapa
- El mapa ("Caminos de Ohmdal") muestra bien la isla del Faro, mi posición (Nico) cerca de la Ribera de las Señales, y un rombo dorado = siguiente paso. Lo entendí en el primer vistazo.
- Al abrir el mapa con el botón o con M, a veces la vista aparecía con demora de varios segundos, y al cerrar con M a veces seguía abierto. No vi botón de cerrar en el árbol de accesibilidad (en la captura sí se ve el mapa, pero no tiene ×).

## Navegación
- Click en el suelo: funciona, pero el personaje tarda muchísimo; a veces parece no moverse durante 5-10 s.
- Teclas WASD: a veces no hacen nada; con repetición (a x20) sí se mueve un poco. Con varias teclas seguidas, el personaje se queda clavado.
- La cámara gira y el personaje queda detrás de objetos, por lo que cuesta saber la distancia real a la mesa.
- Hay un anillo "Volver al lago" (E) en el camino; no lo usé. Es fácil de activar sin querer.
- En total me tomó muchísimo tiempo recorrer unos 15-20 metros de juego (decenas de acciones). Estimo más de una hora sólo en caminar, sin resolver nada.
- Hipótesis: como el Browser pane figura como "hidden", el juego podría estar limitando su bucle de animación (las acciones tardan en verse). No lo pude confirmar. Vale la pena probar con el panel visible.

## Mesa I (Fuente del Faro): lo que intenté
- Me acerqué desde la plaza. Cuando el personaje estaba cerca de la mesa aparecieron dos prompts: "E Abrir: I · Fuente del Faro" y "Q Mirar con Ohm" (una sola vez). Presioné E y no se abrió nada visible.
- En otras posiciones el prompt que aparecía era "E Abrir el retorno de la base" (una compuerta de la plaza) o "E Nereo". Ninguno me llevó al panel de la Fuente.
- Intenté: click sobre la mesa, click al frente, click por la izquierda, click a la derecha, teclas. Nada abrió la mesa. Quedé trabado unos 15-20 minutos reales dando vueltas alrededor de la Fuente.
- Lo que sí pude ver: la Fuente tiene una lámpara/bombilla que brilla, dos cilindros con mecanismos, un panel con dos diales, y cables/haces de luz amarillos y azules que salen del costado. Esos haces no me quedaron claros: ¿son cables que tengo que tender, o sólo decoración?
- No conocí el concepto de la mesa, así que no pude probar nada. No aprendí nada de electricidad en este tramo (sólo "la manivela conservó el movimiento" y "el núcleo tiene que sostener su pulso").

## Puzzles
- No llegué a ningún puzzle. No puedo calificar dificultad real.
- Pista útil: la Guía dice "marca dorada de la brújula te orienta hacia él", pero la marca dorada apunta a la plaza, no a la mesa exacta, y la brújula es chica.

## Arte y presentación
- Muy buen arte: el Faro, los caminos con piedra y agua, los árboles, la plaza con las mesas y las columnas con engranajes. Me gustó el estilo de los engranajes en los pilares.
- La pantalla de carga "Abriendo los caminos · 11% / 33% / 67%" está bien, pero pasan unos 30 s y no hay consejo para esperar.
- El título "La luz" con el texto "El mundo no perdió su luz. Olvidó cómo encenderla." es muy bueno.
- El estilo de la Bitácora (papel, anotaciones a mano, rojo y azul) se entiende y se ve prolijo.
- Recorte visual: con capturas reducidas parecía que algunas cosas se cortaban a la derecha; con read_page sí aparecían.

## Errores o bugs
1. Nereo re-dispara su diálogo al acercarme y bloquea el movimiento (Enter para seguir). Repetido varias veces con la misma frase.
2. E junto a la Fuente no abrió el panel de la mesa I en mis intentos, aunque el prompt "Abrir: I · Fuente del Faro" sí apareció.
3. Movimiento muy lento y con paradas; con teclas, a veces nada.
4. El mapa tiene demora al abrir y no se cierra de forma confiable con M.
5. tabs_create devolvió "Browser pane gone, gate off, or tab cap reached" aunque el pane luego respondió por navigate.
6. La Bitácora corta texto a la derecha a 1280x800.

## Ritmo
- Lento. Lo que más tiempo se llevó no fue pensar sino caminar y esquivar a Nereo. Para alguien de 12-15 años, después de unos minutos de no avanzar, se aburre o cierra el juego.

## Top 10 a mejorar
1. Movimiento: que el personaje camine a velocidad normal con click y con teclas, sin paradas (y revisar si el pane oculto frena el bucle).
2. Nereo no debe re-disparar su diálogo al acercarse ni bloquear el movimiento sin explicar por qué; dar una sola vez o con botón "Seguir" claro.
3. La zona de interacción de la Fuente debe ser clara: que el prompt aparezca desde un lugar fácil de alcanzar y que E abra la mesa siempre.
4. Si una mesa no abre, decir qué falta (el personaje lo dice en otros casos; acá no).
5. Diferenciar en pantalla la mesa I de las compuertas y de Nereo (los prompts se pisan).
6. Aclarar qué son los haces amarillos y azules alrededor de la Fuente (cable a tender o decoración).
7. Carga: mostrar un consejo o barra con tiempo estimado; 30 s sin nada es mucho.
8. Mapa: que se cierre con botón visible y que la apertura no tarde.
9. Bitácora: que el texto no se corte a la derecha en 1280x800 y, para la sección "Lo que hay detrás", agregar un dibujo del circuito junto a la explicación de "en fila".
10. Guía: que la marca de la brújula apunte a la mesa exacta, no sólo a la zona.

## Top 5 de lo mejor
1. La Bitácora como cuaderno de campo: pruebas, mediciones con punta roja y negra, y la cuenta del carro. Muy buena idea.
2. La Guía de viaje "Un paso a la vez" con tres pasos claros y el botón "Ubicarme en el mapa".
3. Arte de la isla del Faro: plaza, engranajes, agua, luz. Muy atractivo.
4. Tono de Nereo y del título ("El mundo no perdió su luz. Olvidó cómo encenderla.").
5. El mapa con la posición y el rombo dorado de siguiente paso; se entiende de un vistazo.

## Estado al cierre
- Mesas resueltas: 0 de 3 (no abrí la primera).
- Final visto: no.
- Tiempo aproximado: más de una hora de sesión, la mayor parte intentando llegar a la Fuente.
- Pestaña cerrada.
