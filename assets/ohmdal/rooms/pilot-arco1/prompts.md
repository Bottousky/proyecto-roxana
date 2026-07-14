# Lote piloto — salas 1 a 4

Canon: `plaza`, `puerta`, `manantial_ohm`, `castle_gate`.

Modo de generación: herramienta integrada `image_gen`; props con croma removido localmente; chunks normalizados a 960×540 con vecino más cercano. Estado: borrador para aprobación, sin alta en `data/asset_manifest.json`.

Revisión ambiental posterior: `manantial_ohm` y `castle_gate` recibieron variantes `-v2` exteriores después de releer el canon narrativo. Son las versiones preferidas; las v1 quedan para comparación.

## Assets aprobados reutilizados

- `../plaza.png`: chunk base y ancla general de estilo.
- `../puerta_de_ohm_base.png`: base estructural.
- `../prop_puerta_de_ohm.png`: referencia de prop duro (no tiene alfa real).
- `../puerta_de_ohm+prop_de_puerta.png`: integración cerrada.
- `../puerta_de_ohm+prop_abierta.png`: variante geométrica abierta.

## Producción nueva

### `manantial_ohm_base.png`

Chunk base 16:9 de una cámara autocontenida húmeda al norte de la Puerta de Ohm. Vista cenital 3/4 y mismo pixel art, escala, grano, cobre/turquesa y luz dormida que las referencias. Recinto de piedra oscura con musgo, estanque técnico vacío en el tercio norte y soporte/arco estructural vacío donde luego se encastrará la boca del manantial. Única salida: arco sur centrado hacia la Puerta. Dos hilos paralelos de cobre con pátina nacen en el estanque vacío y bajan hasta la salida sur. Sin surtidor terminado, agua animada, personajes, props removibles, glow, chispas, texto, interfaz ni watermark.

### `prop_boca_manantial.png`

Prop aislado: surtidor arquitectónico antiguo de piedra con anillo y conductos de cobre, apagado, diseñado para encastrarse en el borde norte de un estanque. Misma vista cenital 3/4, escala y pixel art que Ohmdal. Una sola pieza centrada, sin agua, sin glow, sin sombra. Fondo croma plano uniforme, bordes nítidos y padding generoso.

### `manantial_ohm+prop_boca_manantial.png`

Editar únicamente el soporte vacío del chunk base para encastrar la boca del manantial de la referencia de prop. Igualar perspectiva, escala, pixelado, oclusión y contacto con piedra/cobre. Conectar el anillo a los dos hilos del suelo. Mantener sin cambios cámara, estanque, salida sur, muros, musgo, luz y composición. Sin agua, glow ni elementos nuevos.

### `castle_gate_base.png`

Chunk base 16:9 del portón interior del Castillo, recinto autocontenido. Vista cenital 3/4 y mismo pixel art y escala que las referencias, con paleta local de violetas profundos, piedra oscura, cobre patinado y luz sellada. Salida este mediante arco de transición hacia la plaza; salida norte mediante gran arco ceremonial vacío preparado para recibir una reja/portón aparte. Estandartes descoloridos integrados al muro, piso transitable y dos hilos paralelos de cobre apagado que conectan este con norte. Sin portón/reja dentro del arco norte, personajes, muebles, glow, texto, interfaz ni watermark.

### `prop_porton_castillo.png`

Prop arquitectónico aislado: portón/reja ceremonial doble del Castillo de Ohmdal, hierro ennegrecido y cobre patinado, motivos eléctricos geométricos sin letras, cerrado y apagado. Diseñado para encastrarse en un gran arco de sillar violáceo visto en cenital 3/4. Misma escala, pixel art, grano y luz que las referencias. Una sola pieza centrada, sin muro alrededor, sin sombra, sobre croma plano uniforme.

### `castle_gate+prop_porton_castillo.png`

Editar únicamente el gran arco norte vacío del chunk base e integrar allí el portón de referencia. Igualar perspectiva, escala, pixelado, profundidad, oclusión y puntos de anclaje; debe sentirse construido dentro del muro. Mantener sin cambios salida este, suelo, estandartes, canales de cobre, cámara, iluminación y composición. Estado cerrado y apagado; sin glow ni elementos nuevos.

## Resultado de QA automático

- Chunks finales: 960×540.
- Props: PNG RGBA con transparencia real y esquinas transparentes.
- Fuentes de generación conservadas en `_sources/` y excluidas de validación.
- Assets existentes y manifest sin modificar.

## Revisión aprobada de Plaza, Taller y Ohm

### `prop_plaza_portal-v2.png`

Portal compacto de retorno al Instituto, aislado sobre croma: arco de piedra y cobre con núcleo cian, perspectiva cenital 3/4 y escala compatible con la plaza. Silueta limpia, simétrica, sin escenario, texto ni personajes. La fuente con croma queda en `_sources/`; la versión final tiene alfa real.

### `ohm-turnaround-v2.png` y `ohm-atlas-64-v2.png`

Ohm como guardián pequeño y reconocible: cuerpo bajo de cerámica clara y cobre, dos ojos cian y emblema omega frontal. Volúmenes gruesos, sin piezas frágiles ni apéndices flotantes, para que el diseño pueda simplificarse a una impresión 3D. Turnaround frontal, lateral izquierdo, lateral derecho y posterior; el atlas final conserva esas cuatro direcciones en celdas de 64×96.

### `plaza+campana_portal-v2.png`

Edición única sobre la plaza base: reemplazar el pozo/jaula central por una sola Campana monumental perfectamente centrada e integrada al pavimento; integrar el portal de retorno en el sello V/I/R del suroeste; dejar libre el arco sur para la ruta a Terrazas. Mantener seis faroles físicamente apagados, murallas, taller, caminos, perspectiva y noche exterior. Reservar un pequeño soporte delante de la Campana para Ohm como sprite separado. Sin personajes, etiquetas ni glow horneado.

### `taller+props_lumen-v2.png`

Edición única sobre el taller base: integrar un banco de trabajo detallado dentro del recinto izquierdo, con instrumentos y pequeñas pistas visuales; poblar estanterías laterales con frascos absurdos, fusibles y herramientas; completar la máquina del recinto derecho. Mantener despejada la circulación central y la salida sur. Noche interior con ventana azul, iluminación material tenue y ningún personaje, texto, UI o efecto eléctrico horneado.

QA: los dos chunks finales están normalizados a 960×540; portal y turnaround tienen transparencia real; fuentes originales conservadas bajo `_sources/`.

### `plaza+campana_portal-castillo_abierto-v2.png`

Variante horneada derivada de la Plaza integrada aprobada. Cambiar solamente el acceso oeste al Castillo: levantar la reja dentro del arco, retirar el cordón del Consejo y revelar una continuación corta de adoquín/cobre hacia el oeste. Mantener sin cambios Campana, portal, taller, faroles, murallas, cielo nocturno, cámara, composición y estado apagado. Esta variante se activa al resolver la Campana de dos caminos (`solvedBellPaths`), cuando el Consejo concede la inspección supervisada del Castillo.
