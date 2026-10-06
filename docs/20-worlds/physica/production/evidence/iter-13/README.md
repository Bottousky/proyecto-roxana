# Iteración 13 — la transición 2.5D → 3D (Hito B · B2, parcial) (evidencia)

**Resultado principal:** el arco tapiado de la Terraza se abre con una manivela, después de ver la ciudad desde el Mirador, y lleva por un pasaje a un barrio en 3D.
- **La misma simulación:** gana profundidad donde el nivel la declara.
- **El recorrido 2.5D no cambia.**
- **La cámara** pasa de la vista lateral a una detrás del explorador, como función continua de la profundidad.

Diseño en `../../DECISIONES.md` D18; la revisión y su respuesta, en `REVISION.md`.

**Secuencia con teclado real** (`scripts/barrio.mjs`; `barrio.json` trae el estado del explorador en cada cuadro). La preparación declarada: el explorador se ubica en el Mirador (ver la ciudad) y después en la Terraza.

| Cuadros | Qué muestran |
|---|---|
| `secuencia-00`, `01` | La Terraza con el arco tapiado. Junto a la manivela, el aviso «E Abrir el arco» y la nota de la Bitácora «El arco tapiado». |
| `03`, `04` | La manivela gira, el eje en profundidad y la hoja que abre 90°. Recién al final, «▲ Entrar». |
| `05`–`07` | La pasarela sobre el arroyo, el umbral y el pasaje. La cámara baja detrás del explorador. |
| `09`, `11` | La plaza, con un ángulo más abierto. La fuente lo detiene; quieto, aparece «▼ Volver» y la nota «Detrás del muro». |
| `22`–`27` | La vuelta con ▼ solo, desde un costado de la plaza: sube a un cantero, entra al pasaje y vuelve a la Terraza en z = 0. |
| `intermedio-*` | Versiones anteriores: el barrio asomando sobre el muro, un conducto que cruzaba el pasaje, la fuente que se podía atravesar. |

## Técnico (medido)

- **`npm test`: 66/66.** Once pruebas nuevas en `profundidad.test.js`:
  - las regiones no llegan detrás del muro;
  - el arco se abre sólo después del Mirador y tarda su giro;
  - se entra sin apuntar, también desde la manivela;
  - el barrio tiene paredes y no tiene agujeros;
  - se vuelve con ▼ solo desde cualquier punto;
  - con una esfera en la mano no se entra;
  - la pasarela;
  - la fuente y los faroles sólidos, los canteros que se suben;
  - el determinismo.

  Las 55 anteriores pasan sin cambios.
- **Recorrido con teclado completo** (`report.json`): pasa, con el nuevo paso «arco y barrio». Desde el Mirador, la manivela abre el arco, ▲ lleva al barrio (z −12,2, sobre su pavimento) y ▼ trae de vuelta a la Terraza en z = 0. Persisten 12 notas; 0 errores.
- **Tiempos de cuadro:** p99 y máximo de 16,8 ms en el recorrido, y también dentro de la plaza (z −15) y del pasaje (z −6), medidos caminando con las teclas.

## Para cerrar B2 (según la revisión)

- Diseñar lo que asoma del barrio sobre el muro, en lugar de que aparezca de golpe.
- Que el barrio se lea como la metrópolis: escala, puertas, soportales, habitantes y al menos un experimento cotidiano interactivo («el mismo instrumento, otro lugar»).
- La fuente con agua en el cuenco y un chorro central que contraste con la surgencia.
- Una toma que muestre la plaza entera.
