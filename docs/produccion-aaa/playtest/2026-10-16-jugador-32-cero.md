ESTADO ACTUAL: Castillo de la Red · mesa de la red del patio sin resolver (falta identificar la manivela correcta de la izquierda)

# Informe de playtest 32-cero: Arco I desde cero

Inicio: 09:43. Pestaña: tabs_create falló (pane sin gate), navegué con la pestaña "seed" (http://localhost:4190/?tramo=cerof). Viewport 1280x800.
Nombre de prueba: Lu (formulario de registro, apariencia por defecto).

## Lugar 1 · El umbral del valle (Portal Ω) · 09:43 a ~09:52
- Título: «Cruzar el Portal» -> registro (nombre + apariencia) -> intro larga de diálogos (Edda, Ohm). Se avanza con Enter; la intro es larga (~25 diálogos) pero entendible.
- Esperaba: un mundo abierto. Pasó: pantalla de carga «Tejiendo Ohmdal · 96%» unos segundos.
- Mundo: el personaje camina lento al principio (clic en el suelo o en la flecha tardaba muchos segundos y la cámara se movía sin que quedara claro si avanzaba). Con WASD (repeat) fue más confiable.
- Mesa 1: «Un pequeño latido» (pedestal de bronce). Objetivo: despertar al pequeño de bronce. Había un cable ya tendido Celda+ -> Bronce+; faltaba Celda- -> Bronce-. Entendí el concepto: una celda empuja la corriente por un camino cerrado y hace falta dar la vuelta completa. Resuelto tendiendo el segundo cable. Mostró «Funciona».
- Trabas: (a) clic por coordenadas al borne Bronce- no respondía; con la referencia del elemento sí. Es del lado del automatizado, pero un jugador también pudo tocar el borne cerca del cuerpo del pedestal: el hit-area es chico. (b) Al volver al mundo, el botón «Volver al mundo: la instalación queda en servicio» funcionó.
- Entendí la mesa: sí (conceptualmente el circuito cerrado). Probé poco: resolví en el primer intento.
- Diálogos: Ohm explica bien «la energía que deja el paso es lo que hace latir»; Lu dice «Con una sola conexión no pasaba nada» y es coherente. Pequeño chiste de Ohm sobre el musgo.
- Bitácora: no la abrí todavía (no hacía falta para avanzar, pero el HUD dice «Bitácora al día»).

## Lugar 2 · Plaza de Ohm y taller de Lumen · ~09:52 a ~09:57
- Camino: la Plaza no tenía marcador claro; tuve que seguir la flecha dorada y «Hacia El taller de Lumen». Caminé por error hacia atrás (la tecla W y el clic en flecha me desorientaron). Lo más confiable fue usar WASD y el marcador. Lento.
- Bitácora: se abre sola en algunos pasos (Plaza de Ohm, taller). Por el momento no la abrí a propósito.
- Pedido: «Visitá a Lumen y mirá la lámpara que no enciende». Hablé con Lumen; los diálogos explicaron que el cierre izquierdo y derecho de la mesa de la lámpara estaban sueltos. Los unió con E (luego «✓ Hecho» con deshacer). Entendí la acción; el objetivo de «cierres» no era obvio (se entendía por los diálogos de Lumen).
- Trabé ~3 min: el marcador de «cierre derecho» quedaba detrás de un barril; resolví con A (mover) y luego E.
- Mesa «La costura invisible» (tablero «Luz del banco»): tres tramos iguales; «Comprobar el camino» con dos bornes (las puntas) de cada tramo. Tramo 1 «Hay camino», Tramo 2 «Sin camino» -> ahí está el corte. Puenteé A y B del Tramo 2 con el cable -> «Funciona». Concepto: entendí el circuito y el puente; la pista de Ohm «¿Cómo se lo devolvés con un solo cable?» fue clara. Lo logré sin pistas.
- Diálogo: Lumen y Lu hablan de la lámpara que «no enciende»; el texto dice que el aceite/cierre era la causa. Confuso que el mensaje diga «la lámpara era la misma; lo que cambiamos fue el camino».
- Bug probable: el click con coordenadas en el tablero no coincidía con lo que veía en la captura (la captura está recortada a la derecha). Lo resolví con referencias de accesibilidad.
- Siguiente: encontrar a Edda en la Calzada (balizas, cierres en los postes, puente de cobre).

## Lugar 3 · Calzada del agua (La Calzada) · ~09:57 a ~10:08
- Navegación: lo más difícil del lugar. Tras salir del taller, la flecha dorada me llevó primero a la Plaza y no a la Calzada; me pasé ~8 min caminando por el pasto y entre casas (el camino de piedra hacia el norte/noreste no se ve obvio). Me ayudó el mapa del reino («Caminos de Ohmdal»): la Calzada está al noreste de la Plaza, por el camino de piedra que sube junto al río. La guía (H) dice «la marca dorada de la brújula señala ese paso», pero la brújula no se entiende como marcador.
- Trabas de UI: Esc a veces abre el menú de pausa en vez de cerrar el mapa; el botón «Cerrar» del mapa a veces no responde al primer clic.
- Encontré a Edda: diálogos bien escritos, con humor («No estamos compitiendo»).
- Mesa 1 (balizas / cierres): «Unir el cierre bajo las hojas» (poste este) con E -> «Hecho». Luego el cierre del poste oeste con E. El puente de cobre: al abrirlo con E («Abrir el puente de cobre») el mensaje dice que «se levanta y deja separados sus dos contactos»; no me quedó claro si era lo correcto o si abrir el puente era un error. Las balizas respondieron después.
- Regulador de la Puerta de Ohm (E) -> «El cerrojo que escucha»: el cable del avance estaba al revés («¡Al revés!»). Quité dos cables (× en cada cable) y los volví a tender: Freno B -> Avance +, Avance − -> Retorno −. Entendí la polaridad por la leyenda «AVANCE →» y el «Al revés». Luego «Demasiada fuerza» con el puente de cobre; probé la primera piedra (marrón, negro, negro y oro): «10 Ω: más freno, menos corriente» y quedó «Con fuerza firme». Lo resolví probando, sin pista. Hubo ambigüedad: no quedaba claro qué mide «Comparar dos puntos» ni por qué la piedra cambia la corriente (lo entendí después por el texto).
- Cierre: «La Calzada vuelve a abrirse al valle».
- Trabas: ~8 min buscando el camino a la Calzada; el resto fluido.

## Lugar 4 · El Manantial (Cabecera del agua) · ~10:08 a ~10:26 (aprox.) — el lugar más largo hasta ahora
- Llegada: sin problemas por el puente y la compuerta. Diálogos de Vega (operadora del acueducto), Tala (aprendiz, su farol), Lu y Ohm bien escritos. Una «botella sellada» (recuerdo) se lee con E.
- Caminar: el mapa del reino no me sacó de dudas porque las flechas doradas en el pasto eran difíciles de ver; el mundo se movía lento con WASD (a veces 20-40 pulsaciones para 1-2 casillas). Hubo que usar clic en el suelo con frecuencia.
- Mesa 0 (acoplar la rueda): «Acoplar la rueda al generador» con E, sin mesa; fue fácil y entendible.
- Mesa 1 «El farol de Tala» (Comparar dos puntos): farol y cordón. Medí farol + / farol −: «casi toda la fuerza». Luego cordón A/B: «casi iguales». Entendí que la tensión se mide entre dos puntos; la lectura se ve en el texto de Ohm. Resuelta sin trabas.
- Mesa 2 «Lo que se pierde en el camino» (bomba del manantial): tres empalmes; medí con «Comparar dos puntos» (sin bomba) y la lectura cambia con la bomba andando. Empalme 2 = el que se queda con la fuerza (la «cuenta de la vuelta» de 12 V lo confirma). Puenteé el empalme 2 con el cable y apareció «¡Funciona!».
- Trabas (importantes):
  1. Las pinzas de medir (probe) quedan «en la mano» entre mediciones: cuando medía un par de bornes, el segundo clic a veces tomaba un borne anterior y la lectura salía con dos puntos que yo no había elegido («Empalme 1 · B ↔ Empalme 2 · A»). Confuso para un chico: no se ve claramente qué punta está puesta.
  2. Quitar el puente para la «cuenta» (Vega lo pidió) y volver a tender: el cable a veces no se engancha al primer clic (hay que tocar el borne dos veces).
  3. El paso «Vega quiere la cuenta» pide 4 mediciones seguidas; lo hice sin entender del todo el objetivo final, pero la suma ayudó.
- Mis tiempos: ~30 min de este lugar, la mayor parte en caminar y en las pinzas.
- Diálogo: Vega cuenta cosas lindas (el canal y el «por donde pasa el agua, pasa la Luz»); buen tono.
- Bitácora: se abre sola en cada mesa resuelta; no la abrí a propósito.

## Lugar 5 · Castillo de la Red (Loma de la Red) · ~10:26 a ~10:31 (aprox.) — NO RESUELTO
- Llegada: el camino desde el Manantial (sendero de cuerda, luego el puente) está bien marcado una vez que se sigue la flecha. Ivara (Consejera) y Edda: diálogos buenos, con tono de misterio.
- Quedé trabado en la «red» del patio. Pasos que hice:
  1. Con E en la caja del archivo oeste («Separar el archivo oeste») se ejecutó «desconectar el troncal sano» (quedó «✓ Hecho · deshacer»): no me quedó claro si era el paso bueno. Luego Ohm avisó «Saltó la protección... el archivo oeste sigue unido a la red» y «Conectar los servicios del Castillo» (E) dejó la enfermería y cocina unidas.
  2. Ivara dijo: «separen el archivo, con la manivela de la izquierda del patio». Busqué la manivela de la izquierda y no encontré un tablero: E sobre la caja de la izquierda sólo repite «Separar el archivo oeste» y no abre mesa.
- Problema de diseño (importante): la consigna «separar el archivo» y las manivelas no quedan claras; la caja que dice «Separar el archivo oeste» no abre un tablero, y no hay una pista visible ni «Pista» disponible fuera de una mesa. Un chico no sabría si la manivela es la caja, la de la derecha o el poste.
- Me atasqué ~15 min. Por la regla de no perder más tiempo, lo dejo acá.

## Estado final
- Llegué a: Umbral del valle (1/1), Plaza de Ohm + Taller de Lumen (2/2), Calzada (puente, balizas, cerrojo: 3/3), El Manantial (farol, bomba, rueda: 3/3), Castillo de la Red (0/1, trabado).
- Mesas resueltas: 6 (pedestal de bronce; costura invisible del taller; cierres de la Calzada + puente de cobre; cerrojo que escucha; farol de Tala; bomba del manantial).
- Tiempo total aprox.: 09:43 a 10:31 (~50 min).
- Lugares que faltan: Castillo (desatascar), Terrazas, Lago de las Señales, Faro, Monte Quieto (si corresponde). No llegué a «ARCO I · COMPLETO».

## 1. Bitácora
- No la abrí a propósito. Se abre sola al resolver cada mesa y al pasar por algunos lugares (Plaza, Taller, Manantial). Dice cosas bonitas, pero no es necesaria para avanzar. El botón «Exportar bitácora» está sólo en Pausa; no lo toqué (como estaba pedido).

## 2. Navegación
- Lo peor del juego para mí. Caminar con WASD es muy lento (20–40 pulsaciones para 1–2 casillas en varios momentos), la cámara se mueve sola y el personaje a veces se atasca detrás de casas o barriles.
- Clic en el suelo funciona mejor, pero a veces te lleva a otro lado (la flecha dorada me llevó de vuelta a la Plaza en lugar de a la Calzada).
- El mapa del reino ayuda mucho (la Calzada está al noreste de la Plaza), pero hay que cerrarlo: la «×» a veces no responde y Esc a veces abre la Pausa.

## 3. Arte y presentación
- Muy bonito: colores cálidos, sombras, agua animada, el farol, la rueda del molino. Los tableros son claros de estilo (madera, latón).
- Las capturas salen recortadas a la derecha, y algunos tableros quedan cortados.

## 4. Diálogos e historia
- Muy buen tono: Edda y Vega son entrañables; Lumen tiene humor seco; Ohm es coherente. Bien escrito en general.
- Algunos diálogos repiten (por ejemplo, Ohm y Lu dicen casi lo mismo varias veces seguidas) y las intros son largas (25+ líneas al empezar).

## 5. Errores o bugs
- Clics de borne a veces no tomaban (el cable quedaba en la mano sin tenderse al primer clic). Hay que tocar dos veces.
- Las pinzas de medir (Comparar dos puntos) quedan «en la mano» entre mediciones: el segundo clic a veces toma un borne anterior y la lectura sale con dos puntos que no elegí.
- En la Calzada, el mensaje «Hacia La Calzada» y la flecha dorada no coinciden con el camino real.
- En el Castillo, «Separar el archivo oeste» desconectó el troncal sano sin que quedara claro; y «Conectar los servicios» disparó una protección sin explicación previa.
- Sin pausa ni feedback a veces el E no hace nada visible (la caja de la red).

## 6. Ritmo
- Lento. Caminar es el cuello de botella; los tableros se resuelven en 3–8 min cada uno, la mayor parte del tiempo está en caminar y en encontrar el siguiente paso.

## 7. Top 10 a mejorar
1. Velocidad de caminar con WASD (y que la cámara no se mueva sola cuando no hay input).
2. Flecha dorada: que siempre señale el camino real (en la Plaza y en la Calzada me llevó hacia atrás).
3. Cerrar el mapa del reino de forma confiable; que Esc no abra Pausa cuando el mapa está abierto.
4. Pinzas de medir: que se vea qué borne está puesto y que la comparación no tome bornes anteriores sin avisar.
5. Cables: que un clic en el borne de destino siempre lo tienda (hoy hay que tocar dos veces a veces).
6. Castillo de la Red: consigna clara de qué caja es la manivela y qué hace (hoy «Separar el archivo oeste» no abre mesa y el resultado es confuso).
7. Protección de la red: avisar antes de que una acción dispare un corte, o explicar la causa en el mismo paso.
8. Intros largas al inicio: permitir saltar con una tecla (hoy sólo «Saltar escena» en escenas, no en diálogos largos).
9. Diálogos repetidos (Ohm/Lu con la misma idea en 2–3 líneas seguidas).
10. Encuadre de capturas/tableros: el tablero queda cortado a la derecha en pantallas de 1280 px.

## Top 5 de lo mejor
1. Tono y personajes: Edda, Vega, Tala, Lumen e Ivara; humor y calidez.
2. Explicación de conceptos por mesa: el farol y el cordón («casi toda la fuerza»), la bomba y la «cuenta de la vuelta» de 12 V; muy didáctico.
3. Arte: el Manantial, la rueda del molino, el taller de Lumen, los colores y las sombras.
4. Mesas con lectura clara: «Comprobar el camino» y «Comparar dos puntos» son intuitivas una vez entendidas.
5. Mensajes de éxito («¡Funciona!») con el «Lo que vimos» que resume el concepto.

Hallazgos de conexión (para no confundir con el juego): las coordenadas de clic de la herramienta no siempre coinciden con la captura reducida; usé referencias de accesibilidad y funcionó.
