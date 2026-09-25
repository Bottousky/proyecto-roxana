# Medición final de mundo · 9 de septiembre de 2026

Muestras observadas en el visor público de desarrollo `scripts/qa-composition.html`, cámara jugable, ventana 1223 × 912, detalle alto, movimiento reducido. Cada tasa corresponde a los últimos 180 cuadros visibles; no incluye tiempo con pestaña oculta. Son mediciones locales de esta sesión, no una garantía para otros equipos ni un benchmark de teléfono. Los FPS no incluyen el coste de los paneles del juego; la partida real se revisó por separado.

| Zona | Estado | FPS | p95 ms | Geometrías | Texturas |
| --- | --- | ---: | ---: | ---: | ---: |
| Plaza | Inicial | 48,4 | 25,1 | 80 | 38 |
| Portal | Inicial | 51,0 | 25,1 | 40 | 39 |
| Taller | Inicial | 52,7 | 25,0 | 53 | 40 |
| Calzada | Inicial | 50,0 | 25,1 | 55 | 40 |
| Manantial | Inicial | 48,0 | 25,1 | 64 | 41 |
| Castillo | Inicial | 48,0 | 33,2 | 33 | 42 |
| Terrazas | Inicial | 46,5 | 25,2 | 53 | 44 |
| Lago | Inicial | 47,8 | 25,1 | 45 | 45 |
| Faro | Inicial | 47,5 | 25,1 | 103 | 46 |
| Plaza | Restaurado | 46,6 | 25,1 | 86 | 49 |
| Portal | Restaurado | 49,0 | 25,1 | 40 | 49 |
| Taller | Restaurado | 47,9 | 25,1 | 53 | 49 |
| Calzada | Restaurado | 48,5 | 25,1 | 55 | 49 |
| Manantial | Restaurado | 50,8 | 25,1 | 72 | 49 |
| Castillo | Restaurado | 52,0 | 25,1 | 33 | 50 |
| Terrazas | Restaurado | 48,9 | 25,1 | 59 | 51 |
| Lago | Restaurado | 52,0 | 25,1 | 45 | 51 |
| Faro | Restaurado | 43,9 | 33,3 | 103 | 51 |
| Plaza, nueva vuelta | Restaurado | 44,6 | 25,1 | 86 | 51 |

Las geometrías corresponden a la zona activa: no suman las de las zonas abandonadas. El agua restaurada añade geometría en Plaza, Manantial y Terrazas. Las texturas aumentan al cargar arte de personajes/estados por primera vez y se conservan en caché; la tabla no demuestra por sí sola ausencia de toda fuga de memoria. La liberación de buffers de `InstancedMesh` se corrigió y tiene una regresión específica.

El contador de llamadas mide un cuadro concreto y varía cuando se actualizan las sombras. En Plaza se observaron 1040 llamadas ordinarias y 2134 durante una actualización; sólo el sol proyecta sombras, cada 0,3 segundos. La arquitectura usa numerosas piezas independientes. Agruparlas sería una futura optimización, con su propia revisión visual.

Consola sin entradas de nivel error en la partida completa, el visor de composición, el marco móvil y el visor de bancos. No hubo captura ni escucha de audio del navegador: el sonido se verificó mediante pruebas de estado, solver, posición y liberación; mute/volumen y suspensión se inspeccionaron en código.
