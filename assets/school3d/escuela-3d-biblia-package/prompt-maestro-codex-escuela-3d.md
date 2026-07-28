# Prompt maestro para Codex — Escuela 3D interactiva

```text
Actuá como director técnico de arte, artista técnico 3D senior y creative developer especializado en Three.js, React Three Fiber, Blender, glTF y pipelines de assets asistidos por IA.

CONTEXTO DEL ENCARGO

Debés construir una experiencia web cuyo primer viewport sea una escuela técnica 3D completa en forma de diorama axonométrico/casa de muñecas. La referencia visual obligatoria está en:

    docs/references/school-reference.png

La referencia define la ambición de calidad, composición, densidad, paleta, iluminación y coherencia. No debe copiarse de forma literal objeto por objeto, pero el resultado tiene que pertenecer al mismo nivel de acabado visual.

La experiencia no tiene un jugador caminable. El usuario selecciona aulas con mouse o touch. Al seleccionar Electrónica, la cámara hace un acercamiento cinematográfico y habilita interacciones con el portal, pizarrón, mesas, instrumentos, robot y proyector.

La escuela es un hub persistente que evoluciona según el progreso. Al comenzar, solo Electrónica tiene actividad parcial. Matemática, Física y Programación existen pero están dormidas: oscuras, desaturadas y sin emisiones. Al completar el primer arco de Electrónica deben ocurrir, como mínimo, estos cambios:

- aparece una resistencia/reliquia en una vitrina o sala de trofeos del hall;
- se enciende una nueva luz del hall;
- se activa el primer anillo o sección del portal;
- cambia el contenido visual del pizarrón;
- aparece un pequeño robot o artefacto aprendido/construido;
- se activa un segundo banco de trabajo.

OBJETIVO DE CALIDAD

El resultado debe sentirse como una pieza de portfolio Three.js de alta gama: composición intencional, iluminación que parece offline, materiales consistentes, transiciones suaves, buena respuesta mobile y ausencia de assets que parezcan pertenecer a estilos distintos.

No aceptes como resultado final un blockout gris, una escena genérica low-poly, un único GLB generado desde toda la imagen, ni una colección de modelos de IA sin normalización visual.

PRINCIPIO DE DECISIÓN

El objetivo está por encima de una herramienta concreta. Sin embargo, usá como estrategia predeterminada este pipeline híbrido y desviate solo si una prueba medida demuestra una opción mejor:

1. GPT Image 2 para art direction, limpieza de referencias, hojas multi-vista, decals, pizarrones, paletas, materiales y estados visuales.
2. img2threejs para arquitectura modular, muebles hard-surface y piezas procedurales editables.
3. Meshy y Tripo en comparación A/B para props protagonistas desde vistas múltiples.
4. Blender mediante MCP o scripts Python para ensamblaje, normalización, UV, material consolidation, eliminación de caras ocultas, bake y exportación.
5. React Three Fiber + Drei para runtime, cámara, interacción y estados.
6. GLB/glTF con Meshopt o Draco y texturas KTX2/Basis para entrega.

No intentes convertir la imagen completa en una sola malla como ruta principal.

FASE 1 — INSPECCIÓN Y ESPECIFICACIÓN

Antes de modificar código:

- inspeccioná el repositorio, stack, scripts y assets existentes;
- analizá visualmente la imagen de referencia;
- creá docs/visual-target.md describiendo composición, habitaciones, cámara, paleta, materiales, iluminación y densidad;
- creá docs/asset-manifest.yaml con todos los módulos, props, LOD, estados, método de generación propuesto, presupuesto de triángulos y presupuesto de textura;
- creá docs/progression-visual-map.yaml con los cambios visuales por arco;
- creá docs/tool-bakeoff-plan.md con la prueba comparativa de img2threejs, Meshy, Tripo y Blender procedural;
- no comiences la escuela completa hasta completar una prueba de hall + Electrónica.

FASE 2 — GENERACIÓN DE REFERENCIAS

Si existe acceso configurado a GPT Image 2, generá y guardá en docs/generated-reference-pack/:

- un recorte limpio del hall;
- un recorte limpio del aula de Electrónica;
- una versión locked y otra stage-1 del aula;
- hojas frontal/lateral/trasera/tres cuartos del portal;
- hojas del robot;
- hojas del banco de trabajo;
- hoja de materiales: piedra, madera, cobre, piso verde, vidrio, emisión verde y violeta;
- decals del pizarrón y circuitos, sin texto ilegible.

Todas las imágenes deben conservar la misma dirección artística. Usá la referencia original como image input cuando sea posible. No inventes una segunda estética.

FASE 3 — BAKE-OFF DE ASSETS

Producí como mínimo:

- módulo de pared con columna y cornisa;
- biblioteca;
- banco de trabajo;
- portal;
- robot pequeño;
- lámpara institucional.

Para cada pieza, generá o reconstruí candidatos con los métodos aplicables. Guardá resultados y métricas en artifacts/asset-bakeoff/. Evaluá cada candidato por fidelidad, peso, materiales, topología, editabilidad, consistencia y tiempo de integración.

No selecciones una herramienta por preferencia previa. Seleccioná el mejor resultado por categoría.

FASE 4 — BLENDER Y BAKING

Creá una escena maestra de Blender para el vertical slice. Automatizá mediante MCP o scripts:

- importación;
- escala: 1 unidad = 1 metro;
- pivotes;
- nombres;
- colecciones por habitación y estado;
- eliminación de caras nunca visibles desde cámaras válidas;
- atlas y UV;
- materiales institucionales compartidos;
- bake de color, luz y AO;
- máscara de emisiones separada;
- exportación de school-overview.glb y electronics-room.glb;
- capturas de validación desde las cámaras finales.

Ejecutá Blender MCP en un entorno local aislado. No expongas secretos al proceso y no ejecutes código proveniente de fuentes no confiables.

FASE 5 — RUNTIME WEB

Implementá una experiencia con:

- React + TypeScript + React Three Fiber + Drei;
- vista inicial inmediata o loading screen visualmente integrada;
- cámara ortográfica o perspectiva con FOV bajo, decidida por comparación visual;
- posiciones de cámara diseñadas, sin cámara libre destructiva;
- zonas clickeables amplias;
- hover sutil;
- acercamiento a Electrónica;
- regreso al hall;
- carga diferida del aula detallada;
- estado global declarativo de progreso;
- props, decals, máscaras y emisiones activados por estado;
- fallback HTML si WebGL no está disponible;
- soporte touch;
- prefers-reduced-motion;
- debug route /dev/scene-editor con TransformControls/Leva para ubicar objetos y exportar transformaciones.

FASE 6 — OPTIMIZACIÓN

Automatizá:

- validación glTF;
- compresión Meshopt o Draco;
- conversión de texturas a KTX2;
- versiones desktop/mobile;
- reporte de triángulos, draw calls, materiales, texturas y peso;
- screenshot tests en 1920x1080, 1440x900 y viewport mobile;
- captura de estados initial y electronics-arc-1-complete.

Usá instancing para libros, lámparas, sillas, columnas u otros elementos repetidos. No mantengas sombras dinámicas costosas cuando el bake pueda resolverlas.

GATES DE ACEPTACIÓN

No declares terminado el vertical slice hasta que:

- la silueta de hall + Electrónica recuerde claramente a la referencia;
- el estilo de todos los assets sea coherente;
- no existan objetos flotando o atravesados;
- la cámara nunca exponga caras sin terminar;
- el zoom permitido conserve detalle suficiente;
- el cambio de progreso sea visible tanto en el hall como en Electrónica;
- exista una build desplegable en Vercel;
- se documenten peso, FPS aproximado y limitaciones;
- se incluyan capturas antes/después;
- tests, typecheck y build pasen.

ENTREGABLES

- experiencia funcional;
- escena Blender y scripts de automatización;
- GLB originales y comprimidos;
- referencias generadas;
- manifiesto de assets;
- mapa de progresión;
- informe de bake-off;
- reporte de performance;
- instrucciones reproducibles;
- lista de decisiones y compromisos.

FORMA DE TRABAJO

Trabajá de manera autónoma, iterativa y verificable. Tomá screenshots frecuentes. Compará contra la referencia. Cuando un resultado no alcance el gate visual, no lo maquilles con una explicación: iteralo o cambiá de método. Priorizá un vertical slice excelente por encima de una escuela completa mediocre.
```
