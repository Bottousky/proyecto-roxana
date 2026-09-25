# Ohmdal — revisión integral del Arco I

Encargo: `af41ca09-e323-42a1-8f5f-f17e4fd573fd/pasted-text-1.txt`, leído el 9 de septiembre de 2026. Revisión implementada sobre el juego existente y comprobada mediante partida completa, retornos, recargas, revisión visual y pruebas. Los límites de la verificación se detallan al final.

## Base observada

- Canon leído: ARCO_I.md, LORE.md, PEDAGOGIA.md; diseño, producción, arte, composición, colisiones, mapas y escenas existentes.
- Arquitectura: controlador vanilla en main.js, World Three.js, nueve AREAS con objetos/salidas y flags, solver DC común a campo y banco; nueve bancos; guardado v1; seis escenas existentes; fuentes y arte locales.
- No hay RoomGraph/ActiveRoom independientes: las conexiones reales de AREAS y el World activo cumplen esas responsabilidades. Se conservan.
- Suite inicial ejecutada: 191/191, 20,55 s. Este resultado no demuestra calidad visual ni sustituye una partida.
- Juego real abierto en `http://localhost:4173/`, almacenamiento separado de la partida del usuario en `http://127.0.0.1:4180/`. Partida limpia, llegada, conversación, caminar al pedestal y completar su retorno mediante clics reales.
- Presentación inicial observada: paneles de conversación/menú/banco comparten cajas verdes; HUD y objetivo permanentes; Bitácora como listado. Banco ocupa casi toda la pantalla y oculta la relación con el objeto.
- NPC: dos paseantes mudos en Plaza, Marín duplicado, Tala sin objeto; Ohm no abordable. Los NPC declarados no giran al conversar ni realizan tareas.
- Infraestructura: palancas mecánicas dibujan falsos cables eléctricos; partículas pueden circular cuando la protección abrió el circuito. La Puerta no tiene escena de recuperación propia.

## Matriz de alcance y evidencia final

| Requisitos del encargo | Trabajo y prueba de salida | Estado |
| --- | --- | --- |
| 0–4, 50–54, 63–78: continuidad, canon, múltiples iteraciones, identidad | Registro de hallazgos, correcciones y partida final real | Comprobado |
| 5–6, 26, 33, 36, 41–42, 55–56: navegación, graph, spawns, retornos, colisiones, persistencia | Nueve zonas: avance real, regreso físico Faro→Portal, ida/vuelta del taller, recargas y límites; cobertura estructural inicial/restaurada | Comprobado; táctil simulado |
| 7–10, 25, 27–32, 43–45, 60: Plaza/Taller/Puerta/Manantial y resto del arco | Capturas revisadas en línea, actuación eléctrica, escenas y cambios ambientales | Comprobado; audio por pruebas |
| 11–16, 46, 57: todo NPC visible, Ohm/Edda/oficios | Inventario/presencia/rutinas cubiertos; conversaciones reales de cada oficio y epílogo | Comprobado |
| 17–20, 34, 47, 61: HUD, conversaciones, Bitácora, prompts, menús, móvil | Escritorio, marcos 360×640/390×700/844×390, retratos, cuaderno largo, atlas ampliable y controles | Comprobado en navegador |
| 21–24, 37–40, 58–59: banco/campo, hipótesis, medición, error/transferencia | Nueve bancos reales, fallos físicos, lecturas del mismo circuito e hipótesis propia persistente | Comprobado |
| 35, 48–49, 62: rendimiento, recursos, audio/animación, regresiones | Dos vueltas de mediciones, recursos, consola, regresión y build | Comprobado; límites abajo |
| 42, 51, 72–73, 76: fresh/progression/backtrack/reload/edge/NPC/navigation/visual | Partida desde cero a Faro + epílogo; recargas durante/después y repetición de tramos corregidos | Completado |

## Responsabilidades durante la revisión

- Root: juego real, presentación principal, HUD/diálogo/Bitácora, controlador, integración y auditoría final.
- Mundo: geometría y coherencia eléctrica visual, Puerta/escenas, Manantial/ambiente, audio espacial, pruebas de mundo.
- Habitantes: inventario, contenido contextual, módulo de presencia/rutinas/facing y pruebas.
- Bancos: pedagogía, registros de pruebas, medición, close-up y pruebas de circuito/UI del banco.

## Verificación final

Partida completa desde cero en `localhost:4173`, nueve bancos y epílogo terminados mediante interfaz. Regreso físico completo hasta el Portal y retorno al Faro mediante el atlas. El guardado del usuario en `127.0.0.1:4180` se conservó. Los visores preparados se usaron sólo como comprobación suplementaria, no como prueba de progresión.

## Iteración de integración y juego real

- Se conserva el taller dominante. La panadería ya ocupa el lateral norte izquierdo del circuito, separada de su proyección; se verificaron la Plaza de producción y la nueva versión desde la llegada y la explanada del taller.
- Integración corregida: mapa usa presencia y posición actual de habitantes; aproximación por clic busca suelo alcanzable; el contacto no atraviesa muros; la placa del Portal se puede leer junto a la piedra sin ensanchar físicamente al jugador.
- Pruebas nuevas: presencia inicial/restaurada/epílogo, recorridos de todos los habitantes, pausa/facing/conversación, partida con movimiento reducido, aproximaciones de cada interacción de las nueve zonas, sonido espacial y liberación de fuentes, reja/contrapesos/retorno.
- Suite de integración: 228/228 en 25,35 s, antes de las últimas correcciones menores de presentación. Focal posterior: 18/18 (Puerta, feedback y mapas).
- Partida final real, con clics y teclas en `localhost:4173`, sigue en curso: Portal → Plaza → Taller → Plaza → Calzada. Se reinició únicamente ese origen de revisión. El guardado de producción queda separado.
- Portal: llegada y voces leídas; acercamiento por clic al pedestal; unión del retorno; escena completa; Bitácora muestra exactamente la observación inicial, el cable y la respuesta. Ohm y Edda se abordan en la Plaza.
- Taller: ambos cierres físicos; observación de Ohm antes de completar el retorno; continuidad con alimentación encendida rechazada con explicación, luego lectura «Sin camino» con banco apagado; puente en la costura y respuesta de la misma lámpara. Recarga durante la escena recuperó reparación y diálogo posterior. Regreso físico a la explanada correcto.
- Hallazgos visuales corregidos durante esta pasada: pie del cuaderno fuera de vista a 720 px, dos zonas de scroll superpuestas en sus pruebas, rótulo del compañero demasiado grande y comentario ambiental superpuesto al instrumento de campo. Pendiente volver a comprobar las últimas dos correcciones en todos los tamaños pertinentes.
- Capturas revisadas en línea: llegada al Portal, banco del despertar, despertar, Plaza inicial, taller inicial/restaurado y retrato de Lumen, cuaderno con evidencia, atlas, Puerta cerrada desde llegada y desde su explanada. La revisión de escenarios preparados no se cuenta como recorrido final.
- Continuación real: Calzada → Manantial → Castillo → Terrazas → Lago. En Calzada se probó protección abierta (0 V / 0 A), sentido invertido y exceso de fuerza por separado; reja y contrapesos liberaron el paso. En Manantial se compararon 7,17 V en el empalme y 4,78 V en bomba antes del puente; Ohm en campo mostró los mismos 4,78 V / 0,40 A. Rueda, acople y agua se observan por separado.
- Castillo: aislamiento del archivo y conexión de servicios; se reemplazó la conexión en serie por dos ramas y se desconectó cocina durante una prueba: enfermería siguió clara, cocina no respondió. Luego se restauraron ambas. Ajustada una línea de Ivara para reconocer el aislamiento ya realizado en el patio.
- Terrazas: ajuste independiente del calor y agua; las raíces se recuperaron mientras el riego todavía golpeaba. Inserción de amperímetro con alimentación encendida rechazada; apagado, inserción en serie, encendido y lectura de bomba 0,60 A comprobados. Recarga conservó canales y valores. Cuaderno revisado con lista larga y pie visible; hipótesis propia conservada tras cerrar y reabrir.
- Auditoría independiente corrigió liberación de buffers InstancedMesh al cambiar zona y selección de padding transparente de sprites. Métrica de desarrollo ahora cuenta cuadros lentos y descarta sólo tiempo oculto, reiniciándose por zona. Suite posterior 232/232 y build correcto. La advertencia de tamaño del chunk de Three.js permanece informativa.
- Partida desde cero llegó a Faro y epílogo, sin preparar flags: nueve bancos completados mediante interfaz. Faro I: pulso débil, estable y exceso con cobre caliente comprobados; recarga conservó la etapa. Faro II: hipótesis escrita, tres ramas construidas, señal separada durante prueba mientras óptica y giro continuaban; luego se restituyó. Faro III: misma toma midió 8,99 V sin la lente, 5,99 V al cargarla y 8,98 V al calibrar con carga.
- Escena final iniciada y cierre completo leídos. Se continuó en el mundo y se acercó a la reunión física de Edda, Lumen y Tala; epílogo completo leído y objetivo posterior actualizado. La llegada de Lumen/Tala ocurrió caminando desde el acceso, y el mapa reflejó su posición real.
- Última iteración durante este recorrido: el aviso de interacción podía cubrir un umbral en la cámara final; ahora se aparta de accesos/HUD. Receptores del Faro ajustan emisión/giro a potencia real, preservando lámparas ambientales. Banco mantiene la respuesta/instrumento visible al costado de las perillas en escritorio; verificado en calibración final. Suite posterior 238/238 y build correcto.
- Atlas: etiquetas de habitantes agrupados se separan con líneas guía; sus puntos conservan la posición real. Casos de Faro en epílogo y agrupación en Plaza cubiertos. Última suite completa confirmada: 241/241, sin fallos, en 27,759 s; build de esa revisión correcto (52 módulos, 12,03 s).
- Revisión móvil durante el cierre: el aviso del plano ampliado heredaba el verde pálido por una regla `:checked` de mayor especificidad. Se aplica tinta oscura y texto de 12 px. Cerrar, continuar diálogo y botones del pie del cuaderno tienen mínimos de 44 × 44 px bajo `pointer:coarse` o ancho hasta 640 px; el diálogo reserva espacio para el botón. La validación visual del tamaño real corresponde a la pasada móvil en curso.
- Revisión del epílogo: Edda todavía podía cubrir el marcador y «Vos» junto al grupo. La regresión reprodujo ese fallo; las etiquetas ahora reservan ambas cajas sin desplazar ningún punto. Validación focal posterior: 17/17 pruebas de mapas, sin fallos (0,482 s), y build de 52 módulos en 3,99 s. La suite completa de 241/241 precede esta prueba nueva y no se repitió.

## Auditoría de evidencia para el cierre

El historial anterior conserva los hallazgos y estados de cada iteración. El cierre sustituye sus menciones a verificaciones pendientes:

- Regreso físico real Faro→Lago→Terrazas→Castillo→Manantial→Calzada→Plaza→Portal, sin preparar flags ni usar viajes rápidos. Los cuadros del Castillo y Faro se rodean; los umbrales se cruzan por pavimento. Un clic en el agua del lago terminó sobre la orilla. Se leyó el recuerdo opcional «Una luz hacia tierra» y la respuesta final de Marín en su panadería.
- Recarga posterior al epílogo conservó progreso y mostró «Un reino que vuelve a preguntar». Atlas real Portal→Faro comprobado aparte. Al acercarse al grupo, Edda, Tala, Lumen, Nereo y «Vos» quedaron separados en el plano, sin desplazar sus puntos.
- Móvil: marcos 390×700,360×640 y844×390, con controles táctiles simulados. Entrada al taller mediante botón táctil; conversación/retrato de Lumen vertical y horizontal; cuaderno con pie accesible, atlas ampliable y opciones. Primera reparación completada con conectores ampliados; conexión y perilla del banco de lente probadas. Revisión final confirmó tinta oscura y cierre de 44 px en el atlas de 360 px. No se atribuye a esto una prueba de hardware táctil.
- Rendimiento: dos vueltas por las nueve zonas, más otra carga de Plaza. Entre 43,9 y 52,7 FPS con detalle alto y p95 máximo de 33,3 ms en esta sesión. Geometrías liberadas por zona; Plaza restaurada: 86 en ambas cargas. Datos y límites en [next-level-performance.md](next-level-performance.md). Sin errores de consola en partida, composición, móvil y bancos.
- Última suite completa: 242/242, 0 fallos, 25,701 s; salida íntegra en `output/playwright/next-level-tests-final.txt`. Luego la revisión de audio corrigió emisores eléctricos del Faro, Puerta, Castillo y Lago que dependían de hitos históricos: ahora consultan corriente/energía/protección real. Focal posterior: 29/29, 0 fallos, 1,230 s; build final: 52 módulos / 3,62 s. No se presenta la suite completa anterior como posterior a esos últimos predicados.
- Audio: pruebas de estado, solver, distancia/pan, reutilización y liberación de fuentes; mute/volumen/suspensión inspeccionados en código. No hubo captura ni escucha del audio del navegador. No se detectó un bloqueo funcional pendiente en los recorridos probados.
- Limitaciones reales: no se garantizan 60 FPS en detalle alto (mínimo observado: 43,9); Vite mantiene advertencia informativa del chunk de Three.js de 544,88 kB. Validación en móvil físico y escucha en dispositivo quedan como límites de QA, no como fallos demostrados del juego.
