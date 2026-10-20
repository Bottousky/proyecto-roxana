# Informe de playtest: tramo El Faro (Ohmdal · La Luz)

Jugador: prueba de un chico o chica de 12 a 15 años que no sabe electricidad.
Inicio: 2026-10-16, 01:07. Partida con ?tramo=farof, "Continuar el viaje".
Fin: 01:42 aprox. (unos 35 min reales de juego, con varios minutos perdidos en movimiento).
Pestaña: "seed" (tabs_create falló; navigate abrió la pestaña y la usé). Viewport 1280x800, se reseteó al terminar.
Nota de método: las capturas salen a 800x600 y a veces cortan el tablero a la derecha; get_page_text y read_page sí traen todo el texto. Hay un retraso de una acción en la imagen: lo que se ve en una captura a veces es el estado anterior.

## Llegué hasta el final
- Mesa I "El pulso del Faro": resuelta.
- Mesa II "Tres voces en la torre": resuelta (las 4 objetivos en verde). No respondí la pregunta "Marca esperada" del libro del farero; no pareció bloquear.
- Mesa III "La luz que sabe volver": resuelta (¡Funciona!).
- Final: vi "ARCO I · COMPLETO – La primera luz", con contadores (9 lugares, 12 observaciones, 9 recuerdos) y la elección final de Tala/Nico. Visto el final.

## Bitácora de la sesión (en orden)

1. 01:07 Abro la URL. Aparece un overlay rojo de Vite: "Failed to parse source for import analysis ... world.js ... add the .jsx or .tsx extension". Lo cierro con Esc. Un chico vería un error técnico antes del juego.
2. Título: "Continuar el viaje / Comenzar otro viaje / Opciones". Pie: "6 de 9 luces encendidas · 3 min de viaje". Elegí "Continuar el viaje".
3. Carga: "Abriendo los caminos de Ohmdal" con porcentaje, unos 25 s de pantalla azul casi vacía. Espera larga.
4. Llego al Faro: noche, lluvia, un puente de piedra. Compás arriba a la izquierda, "El Faro · I / III". Esperaba ver una señal clara hacia la primera mesa; la flecha dorada no se ve de entrada.
5. Bitácora: es un cuaderno de verdad con dos páginas de un tramo anterior (la cuenta del carro de Marín, V y A, "lo que hay detrás"). Me gusta el formato, pero es mucho texto para entender el juego y no sé qué leer primero.
6. Mapa: lista el Faro con I Fuente, II Distribución de la corona, III La linterna. Clarísimo. Diamante dorado = siguiente paso.
7. Guía: "Un paso a la vez", "AHORA · El Faro: Abrí la Fuente del Faro, la primera mesa". Clara y corta.
8. Movimiento (lo más frustrante del tramo): caminar con clics en el suelo queda trabado en las barandas curvas de piedra y en los setos; varias veces tardé 3 a 5 min en cruzar la plaza. Lo que funcionó fue WASD (con repeat) y clicar en las baldosas de la plaza, no en las mesas. La cámara sigue al personaje, así que los clics cambian de lugar en pantalla.
9. Hablé con Nereo, Nico, Ohm (E + Return). Diálogos cortos y con personalidad.
10. Mesa I "El pulso del Faro": objetivo "Dale fuerza al núcleo sin recalentar los tendidos" (dos ítems). Estado inicial: Tendido norte "Se calienta", regulador 4/6, núcleo "Casi".
   - Probé el botón "−" del regulador (Ohm dice "aflojá"). Bajó a 1/6 y el núcleo seguía "Casi". Pedí Pista 1 de 4: "Aflojar el regulador le da fuerza al núcleo, pero toda esa corriente pasa por el tendido norte". Ahí entendí la idea: repartir la corriente entre dos tendidos. Es la pista que más me sirvió.
   - Intenté tender un cable en paralelo, pero al tocar el borne Fuente+ levanté el cable que ya estaba entre Fuente+ y norte, sin aviso, y lo moví a sur. Me costó entender qué pasó (2 min).
   - Terminé con sur B -> regulador A. Norte y sur "Fresco", núcleo "Se pasa un poco". Subí el regulador (+) a 2/6: "¡Funciona!".
   - Panel "Lo que vi" (3 páginas): "El cobre también frena: un tendido largo tiene resistencia 6 Ω ... 1,25 A ... 9,4 W de calor, más de los 5,2 W que soporta". Entendí la idea de potencia en calor, con muchos números en un solo párrafo.
11. Entre mesas: Edda, Nereo, Nico conversan. Después de la mesa, el HUD dice "El Faro · II / III: Con Nereo, buscá el giro y las luces que faltan en la galería del medio".
12. Mesa II "Tres voces en la torre" (que luz, giro y campana tengan cada una su propio camino): es la parte que más disfruté conceptualmente ("las voces cantan en fila"). Circuito de entrada en serie: Fuente -> óptica -> giro -> señal -> retorno. Objetivo: pasar a paralelo.
   - Quité con × los dos cables de unión, pero "Retirar" deja el cable en la mano y el mensaje de Ohm dice "Lo tenés otra vez en la mano". No queda claro si se borró o se movió.
   - Otra vez, al tocar Fuente+ para tender un cable nuevo, levanté el cable que ya salía de Fuente+ (Óptica). Tuve que soltarlo tocando el mismo borne y volver a tender. Es la misma trampa que en la mesa I, y pierde tiempo.
   - Conecté Fuente+ -> giro+ y Fuente+ -> señal+, óptica- -> retorno, giro- -> retorno. Resultado: las tres "Funciona". Bien.
   - Medí con "Medir un camino": óptica 1,00 A, giro 0,50 A, señal 0,25 A. Lo que sale de la fuente: "1,74 A". Mi suma daba 1,75 A. Nereo dice "lo mismo, salvo el último decimal". Eso confunde a un chico que está aprendiendo a sumar corrientes.
   - Uso del medidor: primero hay que elegir pieza en un menú desplegable (combobox). Entendible, pero escondido bajo el texto "Elegí una pieza: tocala en la mesa" (dice tocala, pero en realidad hay que elegir en el menú).
   - Pregunta "Marca esperada" del libro del farero (óptica 18 Ω, señal 72 Ω, "¿cuánta corriente pasa por la óptica, comparada con la señal?"): no la respondí y no pareció bloquear. La pregunta no está clara sobre si es obligatoria.
13. Mesa III "La luz que sabe volver" (alimentá la lente desde la toma del divisor y calibrala):
   - Estado inicial: lente conectada a Fuente+ directo -> "Demasiada fuerza". Ohm dice "Elegí Comparar dos puntos...". Moví el cable a "Toma intermedia" -> "Le falta fuerza" (no se cumplía).
   - Medí la toma con "Comparar dos puntos": con lente 8,92 V; sin lente (saqué el cable) 11,93 V. "Al cargarla, la tensión baja." Buen concepto: se ve el efecto de cargar un divisor, con números.
   - Calibración: el brazo superior tiene piedras de resistencia (10, 12, 15, 24 Ω). 24 Ω -> "Le falta fuerza"; 15 Ω -> "Casi"; 12 Ω -> "¡Funciona!". La "Marca de trabajo 8,7–9,3 V" de la lente está en la pantalla de "Leer las marcas de las piezas", pero no hay una explicación clara de por qué 12 Ω. Lo encontré probando.
   - Pista: pedí "Pista" y el contador decía "OHM · Pista 1 de 4", pero no vi el texto de la pista en pantalla (quedó tapado por la barra de medición). Me quedé sin pista visible.
   - Terminé: "¡Funciona! La luz es dorada y se sostiene. Ya no encandila."
14. Final: largo tramo de diálogos de una línea (unos 45 Enter). Ohm, Edda ("Eso se lo robé a Lumen"), Tala ("Acá dice que no funcionó. ¿Para qué lo guardaste?"), Nico con la elección "Las pruebas que me salieron mal" (me pareció la respuesta correcta para el tema). "ARCO I · COMPLETO. La primera luz. El Faro vuelve a orientar a quienes lo necesitan. Ahora el conocimiento también sabe encontrar el camino de vuelta."
15. Cerrar: "Seguir en Ohmdal" y la pantalla de "Nueva mañana, Día 2".

## Puzzles y comprensión
- Mesa I: entendí el concepto (reparto de corriente entre dos ramas, calor = cuánto cada tendido soporta) ayudado por la pista 1. No lo habría resuelto sin la pista: el regulador no era intuitivo.
- Mesa II: entendí "paralelo = cada uno su camino" y "suma de corrientes en un nudo" gracias a la medición. La parte de la resistencia (18 Ω vs 72 Ω -> 4 veces) la leí, no la probé.
- Mesa III: entendí "cargar la fuente baja la tensión" (medido). La calibración la resolví por prueba y error, sin entender por qué 12 Ω.
- Probé sin entender en la mesa III (cambié las piedras para ver cuál daba "Funciona"), y en la mesa I (el regulador) hasta la pista.

## Top 10 a mejorar (orden de impacto)
1. Movimiento: el clic para caminar se traba en barandas curvas y setos. Perdí unos 15 a 20 min en la plaza. Hay que revisar el pathfinding y/o los colliders de las barandas, o dejar aberturas claras.
2. Tender cables: tocar un borne que ya tiene cable levanta ese cable sin avisar (mesa I y mesa II, dos veces). Hace falta un aviso antes o un modo "mover" explícito.
3. "Retirar" con × deja el cable en la mano y el texto dice "lo tenés otra vez en la mano": no queda claro si se borró. Mensaje simple: "Quitaste el cable entre X y Y".
4. Pista de la mesa III: "Pista 1 de 4" aparece en el contador, pero el texto no se ve en pantalla. Ojo al lugar donde aparecen las pistas.
5. Número que no cierra: 1,00 + 0,50 + 0,25 = 1,75 A, y la fuente dice 1,74 A. Para un chico que aprende, debe dar exacto (o explicar el redondeo en la misma línea).
6. Vocabulario: el botón dice "frenar más/menos" y la pista dice "aflojar". Usar un solo verbo, y decir qué es el "freno" (resistencia) la primera vez.
7. Etiquetas que se pisan: la burbuja "Cables en la mano" tapa "Regulador del generador", "Zócalo del brazo superior" y otras etiquetas de la mesa.
8. Medidor (mesa II): "Elegí una pieza: tocala en la mesa" pero la elección real es un menú desplegable. Cambiar el texto o permitir tocar la pieza.
9. Pacing de diálogos: cadenas largas de una línea (unas 45 en el final, otras 15 en cada transición). Auto-avance o "saltar línea" más visible, aunque ya hay "Saltar escena".
10. Inicio: overlay de error de Vite al cargar (import analysis, world.js, extensión .jsx/.tsx) y unos 25 s de carga con pantalla casi vacía. Un chico lo vería como algo roto.

Extra (no entra en el top 10): mapa y Bitácora se cierran de manera inconsistente (M abre y cierra, pero a veces el botón Mapa no cierra y Esc no cierra el mapa). Algunas capturas van una acción atrasadas. Las notas en el suelo (placa) repiten su diálogo cada vez que paso por ahí.

## Top 5 de lo mejor
1. Mesa I: la idea física se entiende con la historia (cobre que se queja, cobre que descansa) y los paneles "Lo que vi" con números reales (W, Ω, calor).
2. Mesa II: el paralelo como "cada voz su camino" y la medición de corrientes con el medidor, con una suma que se ve en la barra de la regla de nudos. Muy buena forma de aprender nudos.
3. Mesa III: medir la tensión con y sin lente (11,93 V vs 8,92 V) y ver el efecto de cargar un divisor. Muy concreto.
4. Mapa, Guía y Bitácora: "Ahora · El Faro", el diamante dorado en el mapa y el "Un paso a la vez" orientan siempre sin frustrar, cuando el movimiento no está en el camino.
5. Personajes y final: Ohm con humor seco, Edda y Nereo con voz propia, y el cierre "ARCO I · COMPLETO. La primera luz" con contadores y la elección final.

## Estado al cerrar
- Pestaña "seed" cerrada (ver siguiente paso).
- Viewport reseteado a desktop.
