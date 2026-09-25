# Arte original de Ohmdal

Generado para este proyecto con la herramienta integrada `image_gen.imagegen`.
Las quince referencias sólo orientan calidad y diseño; no se distribuyen como
assets. Los archivos finales están dentro del proyecto.

| Archivo | Uso | Especificación del prompt |
| --- | --- | --- |
| `art-source/assets/cover.png` | Portada | Paisaje panorámico al crepúsculo de una ciudad medieval costera con piedra caliza, madera, tejados de cobre, puentes, acueductos, río reflectante y un Faro apagado distante; viajero adolescente y Ohm en primer plano derecho; cielo oscuro libre a la izquierda; pintura detallada JRPG; sin texto ni interfaz. |
| `art-source/assets/portraits.png` | Conversaciones | Atlas 2×2: Edda pecosa de cabello cobrizo y capa verde; Ohm de latón con ojo cian y bufanda turquesa; Lumen con barba blanca, gafas y delantal; Nereo con gorro azul, barba gris y bufanda ocre. Luz dorada/cian, fondo verde oscuro, expresiones personales; sin textos. |
| `art-source/assets/characters.png` | Animación | Atlas 6×4: seis fases de caminar de viajero azul y ocre, Edda verde y cobrizo, Lumen de delantal y Ohm redondo con bufanda. Vista frontal en tres cuartos, celdas iguales, pies alineados. Una edición con la misma herramienta reemplazó el damero opaco de la primera generación por croma magenta, conservando personajes y grilla. El motor extrae el croma. |
| `art-source/assets/materials.png` | Superficies 3D | Atlas 3×2: adoquines irregulares con musgo, mampostería caliza, tablones de roble; pizarra turquesa, pradera, bronce con verdín. Albedo perpendicular, luz neutra, variación natural, sin etiquetas. |
| `art-source/assets/trees.png` | Vegetación | Atlas 3×2: roble, ciprés, abedul; sauce, roble antiguo, manzano. Siluetas variadas, hojas y ramas detalladas, luz cálida superior izquierda, vista RPG elevada, fondo magenta uniforme, sin sombras de suelo ni textos. El motor extrae el croma. |
| `art-source/assets/npcs.png` | Habitantes | Atlas6×6 con seis poses de caminar de Nereo, Vega, Ivara, Yesca, Marín y Tala; mismos materiales y escala que los protagonistas, cuerpo entero, fondo magenta para recorte del motor. |
| `art-source/assets/portraits-2.png` | Reparto | Atlas3×2 de retratos pintados de Vega, Ivara, Yesca, Marín, Tala y el viajero; luz dorada, fondo turquesa y vestuario consistente con sus sprites. |

## Ohm simplificado

`art-source/assets/ohm.png` reemplaza su antigua fila de personajes: 24 poses pintadas,
seis por dirección (frente, derecha, espalda, izquierda), en un atlas 1536×1024.
El motor retira el croma y alinea los apoyos entre cuadros. El nuevo retrato
`art-source/assets/ohm-portrait.png` reemplaza su cuadrante antiguo en los diálogos.
Ambos fueron generados con `image_gen.imagegen`; los prompts completos y referencias
están en [art-prompts-ohm.md](art-prompts-ohm.md). Su carcasa única, ojo incrustado y
dos apoyos anchos orientan una futura figura; ver [ohm-design.md](ohm-design.md).

## Reposo y direcciones del reparto humano

Los nueve personajes usan ahora atlas individuales en `art-source/assets/actors/`:
`player.png`, `edda.png`, `lumen.png`, `nereo.png`, `vega.png`, `consejera.png`,
`yesca.png`, `marin.png` y `tala.png`. Cada atlas contiene cuatro direcciones
(frente, derecha, espalda, izquierda) y cinco columnas: reposo dedicado seguido
de cuatro cuadros de marcha. Los PNG generados miden 1402×1122; el recorte usa
límites proporcionales, una escala común y pies alineados.

Generados con `image_gen.imagegen`. Prompts completos, referencias y revisiones:
[protagonistas](art-prompts-actors-main.md), [Nereo, Vega e Ivara](art-prompts-actors-north.md)
y [Yesca, Marín y Tala](art-prompts-actors-plaza.md). Los atlas humanos antiguos
quedan como referencias de producción y ya no se cargan para representar personajes.

Modelos y maquinaria: procedurales originales del proyecto. Los personajes usan
sprites generados; el pedestal y el esquema del banco representan la misma silueta.
Los efectos y el movimiento del entorno se animan en código.
Música y sonido: síntesis WebAudio original, sin muestras de terceros. Tipografías
locales Inter y Cormorant Garamond, mediante Fontsource y sus licencias abiertas.

## Maestros y archivos publicados

Los PNG de esta tabla son los **maestros** y viven en `art-source/assets/`. El juego
carga versiones WebP en `public/assets/` (y en la copia de PlayCanvas), generadas con
`node scripts/optimize-images.mjs` (requiere ffmpeg con libwebp). Después de editar
un maestro hay que volver a ejecutar ese script.

- Ilustraciones opacas: WebP con pérdidas, calidad 86 (SSIM ≈ 0,98 en la portada).
- Sprites con croma magenta (personajes, Ohm, árboles): el script aplica el mismo
  recorte que el motor, guarda la transparencia y extiende el color opaco hacia los
  bordes. El recorte en tiempo de ejecución no cambia nada y desaparece el halo
  magenta al filtrar. Los 204 fotogramas conservan recuadro y alineación.
- `npcs.png` y `characters.png` quedan como referencia: el juego ya no los carga.

Resultado: 57,8 MB → 7,2 MB en imágenes publicadas.
