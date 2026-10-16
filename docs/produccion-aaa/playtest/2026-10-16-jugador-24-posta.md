ESTADO ACTUAL: TRABADO en Castillo de la Red · banco «Conectar los servicios del Castillo» (el troncal de enfermería y cocina quedó UNIDO = sobrecarga, «se pedía demasiado»). No encontré la prueba que pide Ivara. Próximo paso si se retoma: leer la mesa del troncal y probar «Comparar» antes de unir.

# Informe playtest 24 posta · Arco I, retomado en La Calzada

Tester: jugador de prueba (12-15 años, sin saber electricidad). Pestaña propia: tabId seed (tabs_create falló con «gate off / tab cap»; se usó navigate + tabs_context, según la instrucción de respaldo). Viewport 1280x800.
Captura: sale en 800x600 y a veces va con un paso de retraso; hay que esperar 1-2 s o confirmar con find/get_page_text.
Tiempo aproximado total: ~1 h 50 min (estimado, sin reloj).

## Progreso
- Lugar 1 La Calzada: RESUELTO (~15 min).
- Lugar 2 El Manantial: RESUELTO, bomba en servicio (~40 min).
- Lugar 3 Castillo de la Red: TRABADO (~45 min hasta ahora). Puzzle del troncal sin resolver.
- Lugares 4-8 (Terrazas, Lago de las Señales, Faro, Monte Quieto, Casa de Compuertas): NO jugados.
- Final del arco («ARCO I · COMPLETO»): NO alcanzado.

## Lugar 1: La Calzada — RESUELTO
- Menú «Continuar el viaje» carga con barra «Abriendo los caminos» (~20 s).
- Diálogos de Edda, Vale y Ohm al entrar: muchísimo texto seguido, todo con Enter.
- Mesa «El cerrojo que escucha»:
  - Objetivo 1 (dirección): estaba «Al revés». Entendí con la pista 2 («la piedra cambia la fuerza, nunca el sentido… depende de por dónde entra la corriente a la bobina»). Retiré los dos cables cruzados y tendí Freno B→Avance + y Retorno−→Avance −.
  - Objetivo 2 (fuerza): con puente de cobre, «Demasiada fuerza». Probé la primera piedra que no era cobre (marrón, negro, negro y oro) y quedó «Funciona». No entendí el código de anillos: elegí por tanteo. Ohm lo explica después («de cobre a 10 Ω: 0,85 A a 0,50 A»).
  - Honestidad: la pista 2 me dio el concepto de sentido; la fuerza la resolví por tanteo. Números y anillos no se explican antes de elegir.
- Al volver: «El cerrojo libera la Puerta de Ohm».

## Lugar 2: El Manantial — RESUELTO
- Mesa de la rueda «Acoplar la rueda al generador» (E): fácil, no pedía entender nada.
- Tala / mesa «El farol de Tala» (Comparar dos puntos): medí Farol+/Farol− y luego Cordón A/B. Entendí «la tensión es la diferencia entre dos puntos» y «el farol se queda con casi toda la fuerza». Bien explicado.
- Mesa de la bomba «Lo que se pierde en el camino»: tres empalmes (1: 0,08 V; 2: 7,06 V; 3: 0,08 V). Solución: puentear el Empalme 2 (cable A→B). Vega pidió retirar el puente un momento para medir todo y volver a tenderlo; lo hice. La «Cuenta de la vuelta» (0,08 + 7,06 + 0,08 + 4,71 = 11,93 V ≈ 12 V) fue lo más claro de toda la visita.
  - Me trabé un rato porque el «retirar el puente para medir» lo dice Vega en un diálogo largo que leí tarde; igual se resolvió.
- Al final, la mesa de la bomba se reabrió sola una vez tras el último diálogo; hubo que tocar «Volver al mundo» otra vez.
- La bomba queda «En servicio» y el aviso siguiente es «Hacia Castillo de la Red».

## Lugar 3: Castillo de la Red — TRABADO
- Llegada con el mapa: «Ubicarme en el mapa» (botón de la Guía) me llevó a Loma de la Red. Útil.
- Diálogos con la Consejera Ivara: «Encuentren una prueba que no ponga en riesgo lo que aún funciona».
- Banco «Archivo oeste» (ya hecho al entrar). Estandarte: «El reverso del estandarte» (E) dio un recuerdo de Bitácora (plano bordado con hilo de cobre). Historia, no puzzle.
- Banco «Conectar los servicios del Castillo» (E): ahí me trabé.
  - Pulsé E una vez para acercarme al banco y el juego ejecutó la acción directamente: «✓ Hecho · deshacer: desconectar el troncal sano». Sin tablero, sin aviso, sin prueba previa.
  - Ohm: «El troncal de enfermería y cocina está unido. La aguja salta y se oye el clic de la protección: se pedía demasiado.»
  - Probé deshacer con E (funcionó: «…queda separado»), pero después, al caminar otra vez cerca del banco, volvió a aparecer «unido». No entiendo si se re-conecta solo al pasar.
  - Ohm (O): «Carga con lo que ocurrió antes de que llegáramos. Una lectura puede ayudar. No borra lo que pasó.» Pero la lectura (Mirar con Ohm / Ver las lecturas) da 0,00 V y 0,00 A con una raya; no me dice qué medir.
- No encontré la «prueba» que pide Ivara: no hay pista en el banco (el botón Pista sólo aparece en las mesas), y no sé si el tablero de sellos del panel de la plaza es parte del puzzle (Ohm: «Puedo contar los sellos…» pero el panel no abrió mesa).
- Tiempo perdido en caminos: la plaza del castillo no se puede cruzar desde el césped del lado de la torre; hay que rodear por el sur/oeste. Costó ~15 min de caminar a ciegas.

## Bugs / observaciones (acumuladas)
1. [Bug de diseño, serio] Un banco con la etiqueta «Conectar…» ejecuta la acción con un solo E, sin tablero ni confirmación, y la acción dispara la protección. Es confuso para un jugador que no sabe electricidad: parece un botón de «jugar», no un experimento.
2. [Bug, probable] El troncal volvió a «unido» al caminar cerca del banco después de haberlo deshecho con E. Estado inconsistente o re-disparo al pasar.
3. Al cruzar la verja de la Calzada, el personaje se ve como silueta oscura detrás de los barrotes (queda visualmente detrás del muro). Se recupera al alejarse.
4. En el Manantial, los diálogos de Vega a veces no avanzan con Enter: hay que hacer clic en «Continuar conversación».
5. Al terminar la mesa de la bomba la mesa se reabre sola (repetición).
6. Los diálogos son muy largos y se acumulan (6-8 líneas seguidas al entrar a La Calzada, al Manantial y al Castillo) sin barra de progreso.
7. En el tablero, el texto inferior se superpone con «Cables en la mano» (p. ej. «Bajo el puntero: Retorno − está unido…» cortado).
8. Un clic sobre una × de cable a veces no se refleja en la captura hasta un paso después (retraso de render). Se confirma con find o get_page_text.
9. Caminar: en el Castillo el personaje a veces no responde a W A S D durante varios segundos y después se mueve de golpe; y los clics en el suelo se ignoran si la ruta cruza el cordón de la plaza. Sensación de «mundo trabado» (no congelado).
10. Clics en el mundo caen en otro punto si la cámara se movió; hay que buscar de nuevo con find.

## Navegación
- El mapa («Caminos de Ohmdal») es claro: marca lugares, paso siguiente y «Viajar a un lugar visitado». Muy útil, lo mejor del viaje.
- La marca dorada de la brújula no siempre está en pantalla; en el Manantial y el Castillo costó encontrar el siguiente paso.
- Los discos (ámbar: falta; verde: listo; azul: mesa) ayudan, pero el ámbar de bancos no se distingue bien del de las mesas.

## Arte y presentación
- Muy buena: la Calzada, el Manantial y el Castillo se ven cálidos y claros. Personajes con rostros expresivos (Edda, Vega, Ivara).
- Las siluetas detrás de rejas y muros se leen mal (bug 3).
- Los rótulos de los bornes en el tablero son chicos al escalar a 1280 px.

## Diálogos e historia
- Tono de misterio y cuidado con la Luz: «por donde pasa el agua, pasa la Luz», «la Puerta prefería que le hablaran más despacio». Me gusta.
- Hay demasiado texto de golpe en las llegadas; quedan 2-3 datos que son importantes y se pierden entre 8 líneas (ej. «retirá el puente para medir» en Vega).
- Ivara da una consigna importante («una prueba que no ponga en riesgo lo que aún funciona») y no la conecto con nada visible.

## Ritmo
- Calzada y Manantial: bien. El Manantial fue largo pero con claridad.
- Castillo: el caminar es lento y el puzzle no tiene guía concreta; ahí se pierde el ritmo.

## Top 10 a mejorar
1. Bancos/acciones con E que ejecutan sin tablero ni confirmación (bug 1). Deben abrir un tablero o pedir confirmación.
2. Estado inconsistente del troncal del Castillo (bug 2).
3. Falta de pista concreta en el Castillo: el banco no tiene botón de Pista.
4. Diálogos largos sin progreso ni salto claro (bug 6); las instrucciones importantes se pierden.
5. La reapertura automática de la mesa de la bomba (bug 5).
6. Diálogos que no avanzan con Enter (bug 4): necesitan clic en el botón.
7. Silueta de personaje detrás de muros/rejas (bug 3).
8. Solapamiento de texto en el tablero (bug 7).
9. Walkability: caminos que no se cruzan sin rodear y clics ignorados (bug 9).
10. Retraso del render de capturas/clics (bug 8): el jugador cree que no pasó nada.

## Top 5 de lo mejor
1. La mesa de la bomba del Manantial con la «Cuenta de la vuelta»: cerrar la suma a 12 V es muy claro y enseña la idea de conservación.
2. El mapa «Caminos de Ohmdal» con paso siguiente y «Viajar a un lugar visitado».
3. Las pistas graduales de Ohm (1 de 4, 2 de 4…) en el cerrojo.
4. El cerrojo de La Calzada: separar «dirección» y «fuerza» en dos objetivos.
5. El tono y la voz de los personajes (Vega, Ivara, Tala).

## Qué no hice
- No jugué Terrazas, Lago de las Señales, Faro, Monte Quieto ni Casa de Compuertas.
- No llegué a «ARCO I · COMPLETO».
- No usé descargas ni exportes.
