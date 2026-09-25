# Ohmdal: territorio continuo y tiempo narrativo

Decisión de diseño: conservar la estética, cámara frontal y contenido del Arco I;
sustituir la navegación entre pantallas por exteriores contiguos. Las rooms
siguen siendo unidades de autoría y gestión de recursos, no unidades de viaje.

## Geografía construida

El eje del valle va de sur a norte y dobla hacia la costa noreste. El Castillo
queda al oeste del eje, en la loma; los cultivos vuelven a abrir el recorrido
hacia el este. `kingdom-geography.js` fija posiciones en metros, conexiones,
curvas de enlace y curso del agua. El mapa usa esas mismas posiciones.

| Tramo | Continuidad visible y función |
| --- | --- |
| Portal ↔ Plaza | Sendero arbolado; se ven las primeras casas antes de entrar al pueblo. |
| Plaza ↔ Calzada | Calle entre viviendas, canal al este y Puerta de Ohm por delante; los tejados de la Plaza permanecen detrás. |
| Calzada ↔ Manantial | Paso real bajo la puerta; canal y sendero conducen a la cabecera del agua. |
| Manantial ↔ Castillo | El camino se desvía al oeste hacia las torres; el desagüe de la rueda conecta la captación elevada con la conducción exterior. |
| Castillo ↔ Terrazas | El sendero gira al este, con las torres detrás y el molino de los bancales por delante. |
| Terrazas ↔ Lago | La conducción acompaña la bajada a la ribera; el molino permite reconocer el regreso. |
| Lago ↔ Faro | Espigón curvo sobre agua con bordes visibles; se aproxima la galería real del Faro. |
| Plaza ↔ Taller | Umbral de la fachada oeste, interior separado con transición breve. |

Los caminos de conexión son transitables. La promoción de sector ocurre a mitad
del enlace: los dos extremos ya están colocados y el desplazamiento del origen
se aplica también a cámara, jugador y Ohm. No hay fundido ni título central al
cruzar exteriores. El mapa conserva el viaje rápido explícito a lugares visitados.

## Runtime y límites

`ContinuousWorld` comparte renderer, cámara, texturas y geometrías base. Mantiene
los nueve sectores del Arco I residentes tras una preparación inicial de geometría
y recursos GPU. Solo el sector activo y sus vecinos inmediatos se dibujan.
Al cruzar se activa el objeto existente, sin construir ni desalojar sectores.
Los recursos se liberan al cerrar el mundo; las texturas comunes pertenecen al
motor. Ver [diagnóstico de pausas y mediciones](CONTINUIDAD-Y-FRAME-PACING.md).

La autoría local conserva coordenadas y colisiones de edificios, mecanismos y
bancos. Los enlaces amplían el terreno transitable y quitan los cierres
transversales del antiguo perímetro. Un único paisaje compartido dibuja esos
enlaces, el canal y el horizonte. Se retiraron los Faros decorativos repetidos.
Los sonidos espaciales conservan identidad y coordenadas globales en los cruces.

La construcción de geometría sigue ejecutándose en el hilo principal: no se
afirma que exista streaming en un worker. Este diseño limita la memoria y evita
reconstruir el destino justo en el umbral. Un dispositivo lento todavía puede
mostrar un cuadro más largo al preparar un vecino; la revisión de rendimiento
debe contemplar ese momento además del FPS estable.

## El día

`story-time.js` es la única definición de fases: mañana → tarde → atardecer →
crepúsculo → noche → nueva mañana. El inicio de cada fase depende de un hito del
viaje. `journeyTime.phase` se guarda y nunca disminuye al retroceder. La migración
de partidas anteriores deduce el hito más avanzado de lugares visitados,
reparaciones y conversación del epílogo. Una partida en el Faro no vuelve al día
por cargarla o regresar a la Plaza.

Sol, ambiente, niebla y agua acompañan la fase. Las lámparas exteriores requieren
tanto energía como oscuridad; durante el día no emiten halos. El taller conserva
su luz interior. La reparación del Faro sucede de noche y la conversación de
la primera clase abre la mañana del día 2. No hay cuenta regresiva ni horarios
que bloqueen el aprendizaje.

## Verificación

`scripts/qa-journey.html` permite recorrer ida y vuelta todos los enlaces usando
el movimiento, cámara, colisiones y runtime reales, sin tocar partidas. Registra
la diferencia de posición y proyección al cambiar de sector, suelo transitable,
sectores residentes y rendimiento. Permite revisar cada lugar y fase del día.

Los tests cubren reciprocidad geométrica, acceso a todos los umbrales desde los
spawns reales, continuidad de cámara/Ohm, uso del vecino ya construido, persistencia
del tiempo, migración de guardados y encendido de lámparas. La revisión del HUD
y mapa se realiza con el juego real en `scripts/qa-map.html`.

Revisión del 9 de septiembre de 2026: dos recorridos completos por los 14 cruces
exteriores de ida y vuelta, con diferencia de posición y cámara de 0 en cada
promoción, y suelo seguro en ambos lados. La suite completa pasó 252 pruebas;
se agregó y pasó una prueba específica de bloqueo narrativo al caminar. También
pasaron las pruebas focales de colisiones del recorrido y del acueducto después
de conectar el desagüe inferior. HUD revisado a 360 × 640, mapa abierto desde
la brújula y contraste diurno/nocturno inspeccionado en el juego real.
