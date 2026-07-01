# Biblia de arte y producción — v0

## Canon leído

- Formato: exploración 2D top-down + vistas de banco close-up + Bitácora en DOM.
- Tono: misterioso, académico, técnico, cálido, melancólico y esperanzador.
- Acabado principal: ilustrado/pintado. Pixel art es plan B, no el canon actual.
- Instituto: escuela técnica argentina antigua, real y todavía funcional; desgaste sin ruina.
- Ohmdal: reino medieval luminoso de piedra cálida, cobre y cerámica; electricidad convertida en lenguaje ritual. No steampunk industrial.
- Recompensa visual: cada concepto comprendido devuelve luz, movimiento y color al mundo.

## Primera imagen ancla

`assets/art-bible/hall-gameplay-anchor-v1.png`

Prompt usado:

> Hall principal de la Escuela Roxana en el primer día del protagonista; escuela técnica argentina antigua, casi vacía pero funcional. Vista RPG top-down ortográfica en tres cuartos, paisaje 16:9 y sala completa jugable. Entrada inferior, piso de mosaico gastado, estatua central de Roxana, escalera central, preceptoría, bancos, vitrinas, carteleras, puertas cerradas y murales técnicos. Ilustración 2D pintada, realismo ilustrado, siluetas claras y arquitectura modular. Luz diurna fría y desaturada mezclada con pocas lámparas cálidas. Paleta carbón-violeta, gris frío, nogal, latón oxidado, crema y teal apagado. Sin texto, UI, logos, magia, ruina, horror, neon, estilo chibi, pixel art, fotorrealismo ni CGI 3D.

La imagen fija correctamente:

- cámara alta de tres cuartos y lectura top-down;
- escala monumental del Hall;
- estatua, escalera, preceptoría, vitrinas y recorrido central;
- materiales del Instituto;
- melancolía sin destrucción.

Antes de convertirla en assets finales hay que corregir:

- simplificar microtextura para que sobreviva en mobile;
- reducir la sensación de render 3D;
- fijar una escala común para puertas, personas y mobiliario;
- separar arquitectura, suelo, props, luces y colisiones.

## Métrica técnica propuesta

- Canvas lógico actual: 960 × 540.
- Unidad modular base: 32 × 32 px en resolución de juego.
- Personaje humano: 32 × 48 px aproximadamente.
- Props pequeños: módulos de 32 px.
- Puertas y muebles: múltiplos de 32 px.
- Arte fuente: producir a 2× o 4× y reducir con un único método consistente.
- Cámara: alta de tres cuartos, sin perspectiva cinematográfica ni grilla isométrica.

Esta métrica debe validarse con una sala y un personaje antes de producir el catálogo completo.

## Flujo recomendado

1. Aprobar tres anclas: Hall, plaza de Ohmdal y banco del taller de Lumen.
2. Aprobar una hoja de escala: protagonista, Edda, Lumen, Ohm, puerta y mesa.
3. Crear kits modulares separados para Instituto y Ohmdal.
4. Generar personajes como hojas de diseño consistentes; después producir animaciones por acción.
5. Recortar, quitar fondos, normalizar dimensiones, pivotes y nombres.
6. Empaquetar atlas y mapa de tiles para Phaser.
7. Integrar una sala vertical-slice y probar desktop/mobile.
8. Recién después producir el resto de salas, estados restaurados y vistas de banco.

## Entregables por familia

### Instituto

- pisos, paredes, esquinas, columnas, escaleras y puertas;
- bancos, escritorios, vitrinas, carteleras, estatua y murales;
- taller de Electrónica: bancos, instrumentos, cables, proyector y panel V/I/R;
- variantes apagado, tenue y restaurado.

### Ohmdal

- piedra cálida, cobre, cerámica, canales y mosaicos;
- lámparas, fuentes, molinos, puertas y mecanismos;
- módulos apagados y encendidos;
- Taller de Lumen y Puerta de Ohm.

### Personajes

- protagonista;
- Edda;
- Maese Lumen;
- preceptor;
- Ohm: apagado, baja corriente, correcto, sobrecarga y error;
- NPCs secundarios reutilizables.

Para humanos: idle y caminar en cuatro direcciones como mínimo. Para Ohm: cada estado necesita silueta y animación legibles aun a escala pequeña.

### Vistas de banco

- fondo único por puzzle;
- componentes separados e interactivos;
- estados normal, activo, error, humo, chispa y resuelto;
- espacio reservado para controles y lectura en mobile.

## Cómo usar imagegen en este proyecto

Imagegen funciona mejor aquí para:

- establecer el canon visual con imágenes ancla;
- hojas de diseño y variantes de personajes;
- fondos únicos de banco;
- props y materiales aislados;
- exploración de estados antes/después;
- referencias consistentes para producción.

No conviene confiar en una única generación para obtener directamente:

- un spritesheet con frames perfectamente alineados;
- un tileset sin seams y con colisiones implícitas;
- transparencia compleja impecable;
- atlas final listo para Phaser.

Esos entregables requieren generación por partes, selección, postproceso y validación dentro del juego.

## Próxima tanda

1. Plaza de Ohmdal — imagen ancla.
2. Banco del Taller de Lumen — imagen ancla.
3. Hoja de escala y siluetas de protagonista, Edda, Lumen y Ohm.
4. Prueba técnica de un mini-tileset del Hall.
5. Prueba de sprite del protagonista: idle + caminar.
