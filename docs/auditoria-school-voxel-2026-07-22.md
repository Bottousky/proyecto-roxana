# Auditoría y decisión técnica — escuela voxel isométrica

**Fecha:** 2026-07-22  
**Rama:** `feature/school-voxel`

## Conclusión

La dirección definitiva es **Blender 4.5 LTS como herramienta de autoría + GLB como contrato + Three.js como runtime web**. La escuela ocupa la landing completa y funciona como hub vivo; Phaser sigue siendo el runtime de los mundos jugables. El prototipo Canvas se conserva como fallback y como validación del modelo de zonas, pero ya no es la experiencia principal.

Esta combinación permite mantener una escena realmente tridimensional, modular y editable sin sumar React ni un segundo motor. La interfaz continúa en DOM/CSS sobre el canvas para conservar accesibilidad, responsive y calidad UX/UI.

## Qué es realmente Mykonos Island Voxels

[Mykonos Island Voxels](https://github.com/boona13/mykonos-island-voxels) es un constructor isométrico 2D, no un mundo 3D. Usa módulos ES sin bundler, Canvas 2D, sprites PNG prerenderizados, una grilla de 14×14 y persistencia local. La versión auditada fue el commit `ca5faeea84fc7dc8e18a6b8e899f432884dfe831` (2026-05-14) y su licencia es MIT.

### Reutilizable

- Proyección `celda ↔ pantalla` para una grilla isométrica.
- Orden de pintado por profundidad (`x + y`, luego altura).
- Render bajo demanda y capas cacheadas para no gastar CPU cuando la escena está quieta.
- Índice de ocupación O(1) por celda.
- Cámara con pan, zoom anclado al puntero y gestos táctiles.
- Separación entre modelo de mapa, renderer, cámara e interacción.
- Generación procedural de cubos isométricos como fallback.

### No conviene trasladar

- Los 75+ PNG mediterráneos: tienen identidad Mykonos y no corresponden a la biblia visual de Roxana.
- El editor de colocación: Roxana necesita una escuela curada, no un sandbox de construcción para el jugador.
- La arquitectura sin TypeScript/Vite: el proyecto ya tiene ambos y abandonar ese pipeline perdería tests y chequeo de tipos.
- Sus caches de hasta ~80 MB por capa: son razonables para muchos sprites 6×, pero innecesarias para una escuela procedural pequeña.

## Opciones investigadas

| Opción | Fortalezas | Coste/riesgo para Roxana | Decisión |
|---|---|---|---|
| Mykonos / Canvas 2D | Muy liviano, excelente para mapa isométrico, touch probado | No es 3D real; assets de otro estilo | Reutilizar cámara/modelo como fallback, no el arte ni el renderer final |
| [Three.js](https://threejs.org/docs/) + GLB | Ya es dependencia del repo; cámara ortográfica, raycasting y glTF maduros | Requiere disciplina de performance y pipeline de assets | **Runtime elegido** |
| [Never Everland](https://never-ever-land.com/) | Editor web TypeScript/Three.js, `.vox`, instancing y baking de capas | Es una herramienta de autoría completa, demasiado grande para embeber en la landing | Evaluar como herramienta externa de producción |
| [MagicaVoxel](https://ephtracy.github.io/) | Editor gratuito, formato `.vox`, buen pipeline de modelado | Añade una etapa de arte/export; no resuelve navegación ni UI web | Recomendado para assets definitivos futuros |
| [PlayCanvas Engine](https://github.com/playcanvas/engine) | Motor web 3D completo, WebGL2/WebGPU, input, audio, glTF | Segundo motor junto a Phaser/Three; aumenta bundle y complejidad | Descartado para esta fase |
| [Kenney Voxel Pack](https://kenney.nl/assets/voxel-pack) | 190 assets isométricos CC0, útil para prototipar | Estética genérica y no escolar; riesgo de inconsistencia visual | Solo referencia/prototipo, no incorporado |

## Implementación en esta rama

- Landing Three.js a pantalla completa, con cámara ortográfica, pan/zoom, foco animado por sala y raycasting.
- Kit Blender procedural con once zonas: Hall, cuatro aulas, Preceptoría, Dirección, Sala de Logros, Biblioteca, Audiovisual y Visitantes de otros mundos.
- Props diferenciados: estatua, pizarras, terminales, laboratorio, biblioteca, trofeos, recepción, portal de Ohmdal, plantas y personajes.
- Nodos y metadatos estables por sala (`ROOM_*`, `ANCHOR_*`, `NPC_*`) para selección, cámara y animación.
- NPCs con movimiento ambiente liviano y portal animado en tiempo real.
- Estado de Electrónica, Biblioteca y Logros derivado del save existente; la landing no escribe el save del juego.
- UI DOM/CSS accesible con menú de salas, panel contextual, loading, fallback y botón a la landing clásica.
- Pipeline reproducible `npm run school:build`; `.blend`, `.glb` y preview provienen del mismo script.
- No se copió código ni arte de Mykonos; sólo se conservaron patrones arquitectónicos compatibles con MIT.

## Camino de evolución

1. Validar navegación, lectura de estados y jerarquía de llamados a la acción con usuarios.
2. Reemplazar progresivamente personajes procedurales por rigs canónicos y clips GLB (`idle`, `walk`, `teach`).
3. Incorporar NavMesh para recorridos reales de NPCs cuando la escena lo requiera.
4. Agrupar props repetidos por material/instancing y evaluar Draco o Meshopt al cerrar la geometría final.
5. Mantener el modelo de zonas independiente del renderer y cargar detalles de sala bajo demanda si el mapa crece.

## Caso Blender MCP + GPT-5.6 Sol

El [hilo de nicekate](https://x.com/nicekate8888/status/2078467771470655987) muestra una tercera vía especialmente útil para el **arte final**. El resultado es una escena 3D estilizada renderizada como video de seis segundos; no es por sí mismo un runtime navegable. El segundo post documenta cuatro etapas:

1. Descomponer una imagen de referencia y fijar la relación espacial entre los objetos.
2. Corregir sucesivamente posición, proporción y silueta de cada elemento.
3. Refinar materiales, iluminación, detalles y composición, volviendo a comprobar la cámara.
4. Diseñar la animación y renderizar en Blender a 1920×1080, 24 FPS, H.264/CRF 17; 144 cuadros en total.

La lección transferible no es “un prompt produce la escena definitiva”, sino que un agente puede acelerar mucho un ciclo de **referencia → bloqueo → comparación → corrección → detalle → render**. El archivo `.blend` queda como fuente editable con escena, animaciones y cámara.

### Aplicación recomendada en Roxana

- Mantener el mapa Canvas como fallback funcional y especificación espacial.
- Usar Blender + agente/MCP para iterar el kit modular propio: paredes, puertas, pupitres, mostradores, vitrinas, pizarras, terminales, luminarias y personajes.
- Conservar una cámara isométrica ortográfica y una escala común para que todas las salas encajen visualmente.
- Organizar un `.blend` maestro por colecciones de sala y reutilizar materiales canónicos de la biblia del Instituto.
- Entregar dos salidas distintas desde la misma fuente:
  - **Landing/cinemáticas:** WebP/AVIF transparentes o MP4 cortos prerenderizados.
  - **Escuela navegable:** GLB optimizado para Three.js, con geometría agrupada/instanciada y texturas comprimidas.
- Sustituir gradualmente los cubos procedurales por renders o GLB sin cambiar `voxelSchoolModel.ts`, que sigue siendo la fuente de zonas, estado y navegación.

### Gate superado por el piloto

El piloto producido incluye la escuela completa y demuestra:

- coherencia con la paleta y el tono “apagado pero cuidado” de Roxana;
- lectura correcta de las tres salas a tamaño móvil;
- exportación GLB razonablemente liviana;
- cámara, colisiones y selección consistentes con el modelo actual;
- tiempo de iteración reproducible mediante un script determinista.

Se instaló Blender 4.5.12 LTS portable y Blender MCP 1.6.4. El MCP está registrado con telemetría desactivada, pero el build no depende del servidor: `scripts/blender/build_school.py` es la fuente de verdad y exporta los archivos `.blend`, `.glb` y el render de control.

## Patrón de interacción inspirado en Bruno Simon

La navegación de [bruno-simon.com](https://bruno-simon.com/) mantiene un único mundo WebGL: la cámara sigue un foco con amortiguación, los puntos interactivos existen dentro de la escena y el contenido aparece sin cortar hacia otra página. Roxana adopta esa continuidad sin copiar el vehículo ni exigir movimiento del jugador:

- la vista general y cada sala son estados de una misma cámara ortográfica;
- seleccionar una sala inicia un viaje de cámara de 720 ms y la hace ocupar el escenario;
- el detalle aparece integrado en el borde inferior después de que el foco empieza a asentarse;
- el resto de la escuela permanece alrededor como contexto espacial;
- `#sala/<id>`, Atrás/Adelante, Escape y “Escuela” permiten entrar y salir sin recargar;
- no se usa un modal ni una ruta HTML distinta para cada aula.
