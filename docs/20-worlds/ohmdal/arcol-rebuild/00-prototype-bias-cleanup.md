# Ohmdal Arco I — Rebuild: clean-room boundary

> Documento de trabajo. Identifica explícitamente qué se descarta del prototipo
> anterior para esta reconstrucción. NO es canon. Es la frontera que separa lo
> que se reusa (build, package) de lo que se reconstruye (todo lo demás).

## Lo que se REUSA (no se reescribe)

- **Build**: Vite + TypeScript + `package.json` (sin nuevas dependencias).
- **Runtime engine**: Phaser 4 (ya en deps) — se reusa como motor, no como
  contrato de escenas.
- **Path de entrada**: `/ohmdal-arco1/index.html` se monta como nuevo bundle
  independiente. NO reemplaza `/ohmdal` ni `/jugar`.

## Lo que SE RECHAZA explícitamente

| Categoría | Lo que el prototipo asumía | Lo que el rebuild hace |
|---|---|---|
| Estructura del mundo | Colección de salas discretas con fondo PNG completo, transiciones con fade entre cada una | Un único mapa continuo Cuenca de Ohm, sin transiciones entre celdas. El jugador camina del Portal al Manantial sin cargar nada. |
| Representación de salas | Una imagen PNG pre-generada por sala que ocupa 960×540 | Tilemap de tiles modulares + props spawneados sobre capas. La habitación no es una imagen, es una composición de elementos. |
| Movimiento | `RoomDef.collision` por sala, array de rectángulos, walkable independiente por sala | Una grilla de tiles con colisión uniforme en todo el mapa. Las "salidas" son triggers que cambian de escena global, no de fondo. |
| Iluminación | Overlay CSS pre-pintado por sala con glow en PNG | Sistema de luces dinámico por nodo: cuando un nodo del sistema eléctrico se energiza, una luz real aparece, afecta el render, decae con la distancia. |
| Estado de los puzzles | "Banco modal" en pantalla separada para cada puzzle eléctrico | El sistema eléctrico existe como nodos físicos en el mundo. El jugador interactúa con cables, interruptores, instrumentos directamente sobre el mapa. |
| Arquitectura del código | `rooms.ts` con array estático de 20 salas, `roomScenesData.ts` con geometrías horneadas | `worldTopology.json` declarativo + engine que lo instancia en runtime. Cambios de balance sin tocar el código. |
| Ilusión de "diorama" | Cámara fija por sala, sin seguir al jugador | Cámara que sigue al jugador suavemente, con efecto parallax de profundidad. |
| Sistema eléctrico | Cada puzzle con un modelo aparte, sin relación con el mundo | Un único grafo eléctrico del mundo: los cables del Taller, el Manantial y la Plaza están conectados físicamente. Energizar uno afecta al otro. |
| Wow moment de encendido | Cambio de un fondo PNG por otro | Transformación real: cada lámpara se enciende cuando su nodo recibe energía, el agua empieza a fluir, los NPC cambian su ruta, el sonido ambiente cambia, las partículas aparecen, la música evoluciona. |
| Identidad visual | Fondos estáticos sin coherencia de cámara ni escala entre salas | Tileset único con escala coherente. Mismo tile se usa en Plaza, Camino y Manantial. Props con misma escala. |

## Lo que se MANTIENE del canon (input)

Toda la documentación `docs/20-worlds/ohmdal/` y `docs/ohmdal-biblia/` se
mantiene como input autoritativo para lore, narrativa, pedagogía y reglas
del sistema eléctrico. Lo que se descarta son las DECISIONES DE IMPLEMENTACIÓN
del prototipo, no la materia prima conceptual.

## Lo que se construye desde cero

1. `data/ohmdal-arco1/worldTopology.json` — geografía del mundo, conexiones,
   transiciones, posiciones, capacidades de cada zona.
2. `src/ohmdal-arco1/engine/` — motor de render, cámara, input, profundidad,
   sistema de nodos eléctricos.
3. `src/ohmdal-arco1/world/` — instanciación del mundo a partir del topology.
4. `src/ohmdal-arco1/puzzles/` — modelos puros de los puzzles (continuidad,
   diagnóstico, topología) + tests.
5. `src/ohmdal-arco1/dialogue/` — guion y sistema de conversación.
6. `src/ohmdal-arco1/audio/` — música, SFX, voces.
7. `src/ohmdal-arco1/ui/` — HUD, Bitácora (DOM), portadas.
8. `assets/ohmdal-arco1/` — todos los assets nuevos, generados coherentemente
   con el bible visual.

## Cómo se decide si algo entra al rebuild

Antes de añadir cualquier sistema, pieza o asset, el autor del cambio responde:

1. ¿Esto refuerza la fantasía de CONECTAR (verbo nuclear del canon)?
2. ¿Esto mantiene coherencia espacial con el resto del mundo?
3. ¿Esto es coherente con la dirección visual aprobada en
   `01-visual-bible.md`?
4. ¿El jugador interactúa con esto en el mundo, o detrás de un panel
   modal?
5. Si el mundo se enciende, ¿este elemento se transforma observablemente?

Si la respuesta a cualquiera es "no", se eleva a discusión antes de
implementar.
