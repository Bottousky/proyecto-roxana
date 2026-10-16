ESTADO ACTUAL: El Faro · II/III (Cámara de alimentación / «II · Distribución de la corona»). Mesa I («El pulso del Faro») resuelta. Mesa II: las dos manivelas ya dieron «✓» (puente aparte, embrague cerrado); falta abrir el tablero II («La distribución puede probarse») y resolverlo. Hasta aquí llegué (≈2 h 15 min de juego incluyendo el bloqueo del adarve).

# Informe de prueba de jugador · Arco I (partida heredada, Castillo de la Red)

## Bitácora de sesión
- Pestaña: tabs_create falló («Browser pane gone, gate off, or tab cap reached»). Se usó navigate a la URL; el tabId efectivo es `seed`. Pestaña en 1280x800.
- Pantalla de título: «Continuar el viaje», «Comenzar otro viaje», «Opciones». Se eligió «Continuar el viaje» (no se tocó «Comenzar otro viaje»).
- Título: «Castillo de la Red · Tarde, día 1 · 4 de 9 luces encendidas · 49 min de viaje».
- Carga: «Abriendo los caminos» (22% → 100%), unos 20-25 s.
- Bitácora (J): se leyó. Tiene «Descargar la Bitácora» y «Versión libro A5» (NO tocados). Guía (H) leída; la X cierra, Escape abre el menú de pausa (ver bugs).

## Lugar 1: Castillo de la Red (aprox. 35-40 min de juego real)

### Lo que el juego mostró al llegar
- Objetivo: «Una red que se puede comprender». Ayuda: «En el Castillo, buscá con la Consejera una forma de recuperar servicios sin poner en riesgo a sus vecinos».
- Bitácora al entrar (escrita por Edda y Vale, de la partida anterior): «Conectar los servicios del Castillo» tres veces con «se pedía demasiado»; la protección saltó. Esto deja clara la idea del corto y del «archivo anegado», aunque yo no sabía qué era un fusible ni una protección.
- Estado heredado: «Hecho · deshacer: desconectar el troncal sano» (mesa del patio, ya resuelta por otros).

### Paso 1 · Mesa de la Consejera (archivo oeste, «Separar el archivo oeste»)
- Ivara: «Puedo seguir el cierre hasta el archivo. La enfermería y la cocina quedan de este lado.» Luego «Con ese sector aislado, sí. Yo me quedo.»
- Ohm: «Acometida oeste · rama dañada. La rama del archivo anegado sigue unida: el agua le ofrece a la corriente un camino demasiado fácil.» Las lecturas (0,00 V / 0,00 A) las entendí a medias: «la tensión compara dos puntos, la corriente indica cuánto circula por un camino». Eso lo entendí; lo de «una raya no significa cero» también.
- Resultado: «✓ Hecho · deshacer: conectar el archivo oeste» → «El archivo queda separado».
- Confusión: el botón E de la mesa aparece aunque ya esté hecho; no me quedó claro si «Separar» y «Conectar» son estado o acción. Lo entendí cuando vi el texto «✓ Hecho».

### Paso 2 · Tablero «Dos luces, un refugio» (distribuidor del patio)
- Objetivo: «Que enfermería y cocina tengan cada una su propio camino». Tres pasos: 1 enfermería con luz plena, 2 cocina con luz plena, 3 ver la enfermería encendida con la cocina aislada.
- Pista 1 de 4 de Ohm: «para volver a la fuente, la enfermería atraviesa la cocina». Me ayudó a ver el problema: el retorno de la enfermería pasaba por la cocina.
- Mecánica (lo que hice):
  1. Tendí un cable Enfermería − → Retorno − (paso 1 ✓: «Enfermería · ✓ Funciona»).
  2. Tendí Fuente + → Cocina +.
  3. Al hacerlo, la protección cortó: «se oyó un clic… un camino une + y − sin atravesar ningún receptor». Ohm lo explicó bien. Vi que el cable viejo Enfermería − → Cocina + creaba un cortocircuito.
  4. Retiré ese cable con su × («Retirar el cable entre Enfermería − y Cocina +»). Ohm: «ya no está en la mesa y vuelve a tus cables disponibles». Ahí se encendieron las dos lámparas.
  5. Paso 3: toqué la llave «Llave de la cocina: conectada» → «aislada». Ohm: «Con la cocina aislada, la enfermería siguió encendida».
  6. Volví la llave a conectada: «✓ Todo el encargo está cumplido».
- Problema de claridad: el paso 2 quedó naranja («Cocina con luz plena») después de aislar la cocina y el paso 3 quedó ✓. Sin la pista no sabía que había que volver a encender la llave para cerrar el paso 2. Lo resolví probando.
- Hubo que usar la misma mano dos veces: el primer toque sobre un borne «toma» el cable, el segundo borne lo tiende. Tocar dos veces el mismo borne lo cancela (no quedó claro en pantalla).

### Paso 3 · Cierre con la Consejera
- Ivara: «La cocina aislada y la enfermería encendida. Lo vi. El archivo sigue separado y los dos servicios funcionan. Ahora puedo retirar el sello.»
- Edda: «Dejemos el plano a la vista.» Ivara: «En la puerta. A la altura de quien quiera leerlo.»
- Objetivo ahora: «Lo que compartimos» → «Hacia Las Terrazas». Pedido: «Abrir: Tablero de los servicios del Castillo» otra vez.

## Problemas detectados hasta ahora
1. Enter parece activar también la mesa cercana: tras cerrar un diálogo al lado de la mesa del archivo, tres pulsaciones de Enter alternaron «Separar» / «Conectar» (la mesa cambió de estado sin que yo tocara E). Hay que confirmar, pero el jugador lo vería como un cambio no pedido.
2. Escape abre el menú de Pausa cuando hay una observación de Ohm abierta (en vez de cerrar solo la observación). Luego la X del menú hay que buscarla.
3. A veces el clic sobre una mesa o instalación camina hasta el lugar y la acción no se dispara; hay que volver a tocar o pulsar E cerca.
4. En el tablero, un toque sobre el borne a veces no registra (coordenadas); con la referencia del borne funcionó.
5. La marca del paso 2 queda naranja después de aislar la cocina aunque el texto dice «Ivara vio…»; el orden de los pasos es confuso.
6. Un «El reverso del estandarte» aparece como acción E al lado del tablero y, al usarlo, no pasa nada visible (camino detrás de la torre). Puede ser una lectura que no aparece en pantalla.
7. Diálogos: Ivara y Vale intercalan líneas que parecen de otra escena («¿Podemos mirar el tablero ahora?» → «Con ese sector aislado, sí»). Se entiende, pero se nota el salto.

## Lugar 1 (cont.): atasco en el portón (≈25 min)
- Tras cerrar el tablero, el objetivo pasó a «Hacia Las Terrazas» y el paso de la puerta («Camino a: Las Terrazas») me llevó sobre el adarve (el paso de ronda del muro). El personaje quedó trabado entre las almenas, en una posición que no se movía con WASD ni con clic (la marca dorada estaba sobre el muro).
- Recargué la página y elegí «Continuar el viaje»: la partida se restauró (título: «5 de 9 luces encendidas · 61 min de viaje») pero el personaje reapareció en la misma zona trabada del muro. Es un bloqueo que sobrevive a recargar.
- Salida: el paso de la puerta funcionó cuando el personaje entró al nicho oscuro del muro, justo encima del arco (no por el adarve). Un clic en el suelo del patio al sur del arco, y luego W tres veces, dejó el aviso «Camino a: Las Terrazas»; al usarlo, el personaje atravesó el nicho y salió fuera del castillo, al camino de Las Terrazas (Ladera de los Bancales).
- Nada en pantalla explica que el nicho del arco es la salida. Sin probar, uno se queda en el adarve.

## Lugar 2: Las Terrazas (Ladera de los Bancales) (aprox. 25 min)
- Ivara/Ohm: el objetivo «Visitá las Terrazas. Yesca necesita trabajar; Vega necesita regar». Yesca (forja) y Vega (acueducto) se contradicen: «el cable de la ladera es uno solo».
- Antes del tablero, Vega indica dos manivelas: la del horno (junto a la forja, «Pasar el horno a la mesa compartida») y la del canal (junto a su casa, «Abrir el canal de los bancales»). Ambas dieron «✓ Hecho». Clara la pista. Ojo: al principio, E en la manivela del canal me metió dentro de la casa de Vega (interior con una piedra de moler); no era bug grave, pero no lo esperaba: al salir por la puerta (marca de anillo) volví.
- Mesa «La paciencia del invernadero» (Mesa de regulación): tres frenos (calor, agua, horno). Ohm: primero el freno del calor (raíces tibias), luego el del agua (riego parejo), y el del horno ya cierra la línea y el cable queda «Fresco». Resolví por prueba y error en unos 3 minutos; los números «1/5» y «frenar más / menos» no dicen qué pasa con el cable hasta que se mira la lectura. Entendí el concepto: «frenar» = reparto de la corriente.
- Final de la mesa: «Todo el encargo está cumplido». Cierre con Yesca y Vega; Bitácora: «El primer bancal se llena, más despacio. En la forja, el horno vuelve a rugir.»
- Siguiente objetivo: «La orilla de la señal» → «Hacia Lago de las Señales».

## Lugar 3: Lago de las Señales (Ribera de las Señales) (aprox. 25 min)
- Objetivo: «La orilla de la señal» → Nereo (Farero Mayor) en el muelle. Vale/Ohm/Nereo dan muchas líneas, muchas con Enter.
- La barca de las tres maderas: objeto de historia (solo lectura, sin acción).
- Balizas (faroles sobre postes): ámbar = faltan; Nereo explica que las uniones del muelle las hace él.
- Mesa/instalación «Conectar el retorno entre las cañas»: se hace tocando su acción E. Resultado «✓ Hecho · deshacer: desconectar el retorno de la orilla».
- BUG (confirmado dos veces): con el diálogo ya cerrado, pulsar Enter/Return activa la acción E del objeto cercano. Tres Enter seguidos alternaron «Conectar» / «Hecho · deshacer» sin que lo pidiera. El jugador no lo sabe; sería un cambio involuntario de estado.
- Ohm: «El Faro refleja luz aunque no la produzca. Parecer encendido y estar funcionando son cosas distintas.» Buena frase, pero al verla no sabía a qué faro se refería (todavía no había ido).
- Confusión: el objetivo dice «Tu pregunta está en este lugar» y la mesa aparece como acción E («Conectar…»), no como disco azul. El disco azul de la guía no lo encontré en el muelle.

## Lugar 4: El Faro (Espigón del Faro) (en curso, ≈30 min)
- Mesa I «El pulso del Faro» (Cámara de alimentación): resuelta. Pista 1 de Ohm: «frenar menos con el regulador… pero toda esa corriente pasa por el tendido norte». Solución que funcionó: tender Fuente + → Tendido sur A y Tendido sur B → Regulador A (dos coils en paralelo). Tendido norte y sur quedaron «✓ Fresco»; núcleo «✓ Funciona». Lo entendí a medias: sé que «en paralelo» reparte corriente, pero no lo dice el juego.
- Mesa II «Distribución de la corona»: las manivelas se usan desde el pie de cada una. Nereo: «la manivela izquierda aparta el puente gastado; la derecha une el motor con la corona». Usé las dos y dieron «✓». La mesa II no abrió hasta usar la segunda manivela; el texto del botón «Mirar: II…» no avisaba eso. Después de las dos manivelas, el objetivo sigue en «El Faro · II / III» y no logré abrir el tablero II todavía (aparece el aviso «II · La distribución puede probarse», pero el panel del centro no respondió a E durante ~10 min). Me trabé ahí.
- Conversación con Nereo: muchas líneas largas y sin info accionable («Una vuelta. Una pausa…», «Las voces cantan en fila…»). Demasiado relleno para un jugador que quiere saber qué hacer.
- Toque accidental: al tocar a Edda (E) se activó una manivela cercana («reconectar el puente gastado»). El jugador no lo esperaba.
- Frase de Ohm en el muelle («El Faro refleja luz aunque no la produzca…») queda como la mejor pista temática del arco hasta ahora.

## Problemas detectados (resumen)
1. BLOQUEO (el más serio): al cruzar la puerta del Castillo, «Camino a: Las Terrazas» y la marca dorada llevan al adarve. El personaje queda entre las almenas, no se mueve con WASD ni con clic, y al recargar aparece en el mismo lugar (la partida se restaura con «5 de 9 luces» pero la posición trabada persiste). Sólo salió al encontrar el nicho del arco (sin pista).
2. Enter/Return, con el diálogo ya cerrado, ejecuta la acción E del objeto cercano: confirmado en el archivo oeste del Castillo y en la «retorno entre las cañas» del Lago (alterna Conectar / Hecho). Afecta la sensación de control y puede cambiar estado sin querer.
3. Escape con una observación de Ohm abierta abre la pausa (en lugar de cerrar la observación). La X de la observación no siempre responde.
4. Mesa del tablero: en la mesa «Dos luces» el segundo toque sobre el mismo borne cancela el cable; no hay un indicador claro de «cable en la mano». El clic sobre bornes a veces no registra.
5. El orden de pasos en «Dos luces» quedó confuso (paso 2 naranja tras aislar la cocina, paso 3 ✓).
6. Ohm: lecturas con «raya» y «0,00 V» al inicio: buena explicación, pero no dice qué hacer para que suba.
7. Las marcas de «Camino a» y de «Abrir» cambian de sitio con la cámara; se pierde el objetivo unos segundos.
8. Diálogos: Vale/Ivara/Ohm repiten líneas al cerrar; Nereo tiene demasiadas líneas de relleno. El ritmo se cae en el Faro.
9. Entrar a la casa de Vega por error al usar la manivela del canal (la marca de E cae sobre la puerta).
10. Hay muchas esperas de caminata (8-10 s) entre instalaciones; sin correr el ritmo es lento.

## Lo que sí funcionó bien
- Pistas graduadas de Ohm («Pista 1 de 4»): en el tablero «Dos luces» la pista 1 bastó para entender el problema.
- Ver «✓ Hecho · deshacer: …» en el botón E da confianza: se sabe qué se hizo y cómo volver.
- Las lecturas de Ohm (V/A) con la frase «la tensión compara dos puntos» son una buena introducción para quien no sabe electricidad.
- La Bitácora, con las notas de Edda y Vale de la partida anterior, sí cuenta cosas (sobre todo lo de «se pedía demasiado»).

## Bitácora (la usé): sí, para leer el estado y las pistas. No fue necesaria para avanzar; la guía y la marca dorada alcanzan. Lo de «Descargar la Bitácora» / «Versión libro A5» no lo toqué.

## Navegación
- WASD y clic en el suelo funcionan, pero el clic cerca de una pared o de un muro puede llevar al adarve (ver bloqueo). La marca dorada es clara cuando es visible; cuando no lo es, cuesta.
- Las mesas (disco azul) casi no aparecieron como disco: en Terrazas y Lago el acceso era una acción E sobre un objeto, no un disco.
- Recarga: funciona (la partida se guarda), pero conserva la posición atascada.

## Arte y presentación
- Muy bonito: Castillo con piedra cálida, Terrazas con bancales, Lago con agua y reflejos, Faro con noche y cobre.
- Tablero (mesas) con estética de cuaderno/laboratorio; legible.
- Un detalle: la figura del personaje queda a veces como silueta oscura cuando está tras las almenas (confunde).

## Diálogos e historia
- Buena voz en Vega («Y si las raíces se enfrían…») y en Yesca («Años peleando por un fuego que no nos quitábamos»): el conflicto entre forja y acueducto se entiende y tiene emoción.
- Nereo: poético, pero con demasiado texto por línea.
- Vale y Ohm: humor suave, y Vale pregunta lo que el jugador pregunta.

## Errores o bugs
- Bloqueo en el adarve (ver arriba). Bug de navegación.
- Enter activa la acción E cercana. Bug de controles.
- Escape con observación abierta → pausa. Bug menor.
- Cable de la mesa: el segundo toque sobre el mismo borne cancela sin aviso. Bug de claridad.

## Ritmo
- Castillo ~35-40 min (incluye bloqueo ~25 min); Terrazas ~25 min; Lago ~25 min; Faro ~30 min hasta ahora.
- Demasiado tiempo caminando y leyendo diálogos repetidos.

## Top 10 a mejorar
1. Corregir el bloqueo en el adarve (navmesh y colisiones de la puerta del Castillo) y la salida por el nicho del arco.
2. Que Enter no dispare acciones de objetos cuando no hay diálogo.
3. Que la marca dorada y el «Camino a» no lleven sobre muros; si el camino es por el nicho del arco, señalarlo.
4. Hacer visible que una mesa necesita dos manivelas antes de abrirse (Faro II).
5. Reducir las líneas de relleno de Nereo (y repetidas de Vale/Ohm).
6. Claridad de pasos en tableros (paso 2 naranja después de aislar; cable en la mano).
7. Cancelar cable con un solo gesto claro (y avisar cuándo se cancela).
8. Que Escape cierre primero la observación y no abra la pausa.
9. Que el personaje no entre en casas por el clic de una manivela cercana (Vega).
10. Acortar caminatas entre instalaciones (correr o marcas más cercanas).

## Top 5 de lo mejor
1. Las pistas de Ohm por niveles y la explicación de tensión/corriente con palabras simples.
2. El tablero «Dos luces, un refugio»: el problema se entiende (retorno que atraviesa la cocina) y el cortocircuito avisa con claridad.
3. «✓ Hecho · deshacer: …» en los botones: se sabe qué cambió.
4. Las voces de Vega y Yesca: el conflicto de la ladera tiene personalidad.
5. Arte de los escenarios (Castillo, Terrazas, Lago y Faro), con buena atmósfera.

Ruta del informe: /private/tmp/claude-501/-Users-manuel-code-proyecto-roxana/1353e795-f196-482d-93ed-96f990ee0a3e/scratchpad/playtest/informe-26-posta.md
