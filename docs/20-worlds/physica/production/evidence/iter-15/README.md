# Iteración 15 — el barrio visto desde el 2.5D y la metrópolis habitada (Hito B · B2, cerrado) (evidencia)

**Resultado principal:** la transición ya no salta.
- **Desde el lado 2.5D, el barrio se ve sólo por el arco.** Al apretar E aparece dentro del vano, no sobre el muro.
- **Sobre el muro, una silueta en la bruma** (la cúpula en el eje del arco, techos, la aguja de la torre) aparece con un fundido cuando se ve la ciudad desde el Mirador.
- **Del otro lado, la plaza se lee como un barrio de la ciudad:**
  - puertas en las plantas bajas;
  - un soportal con galería en el eje del pasaje;
  - una calle que sale hacia el norte, cerrada por una reja, con la torre del reloj al fondo;
  - dos vecinos, uno que lee en la fuente y otro en su puerta, que miran al explorador cuando se acerca.
- **El corte del muro para la cámara se disuelve** en ~0,2 s, en lugar de saltar.

Diseño en `../../DECISIONES.md` D20. La revisión independiente y su respuesta, en `REVISION.md`.

## Secuencia con teclado real

Script: `scripts/barrio.mjs`. `barrio.json` trae el estado del explorador en cada cuadro.

**Preparación declarada:** el Mirador para ver la ciudad (3,2 s, así la silueta termina su fundido), después la Terraza. De ahí en adelante, sólo teclas.

| Cuadros | Qué muestran |
|---|---|
| `secuencia-00`, `01`, `03`, `04` | La Terraza con la silueta ya en la bruma sobre el muro, la manivela y la hoja que gira. El barrio aparece sólo dentro del vano; sobre el muro no cambia nada (antes, `intermedio-iter14-barrio-asomando-con-el-arco-abierto`). |
| `06`–`08` | Por el puente y el pasaje, con su piso empedrado. Una versión intermedia lo dejaba en roca lisa desde el lado 2.5D (`intermedio-piso-del-pasaje-sin-losas`). |
| `10`, `12` | Fuera del pasaje y ◀ junto al muro, con el corte: se ven las puertas, la galería, la reja de la calle, la torre y los vecinos. |
| `22`–`28` | El soporte C: la esfera cae junto a su regla. La vecina, abajo a la derecha, mira. La Bitácora anota «Una caída detrás del muro». |
| `30`–`37` | ▶ a la fuente y ▼ de vuelta por el pasaje hasta la Terraza. Por el arco abierto se ve la plaza; sobre el muro, sólo la silueta. |

**Otras tomas:**
- **El corte, en ráfaga:** `corte-00` a `corte-03`, caminando con ◀ fuera del eje.
  - En `corte-01`, el muro, el techo del pasaje y sus lámparas están a medio disolver, juntos.
  - En `corte-02`, la plaza ya se ve.
- **`vista-1` y `vista-3`:** la Terraza antes y después del Mirador.
- **`vista-2-mirador-600ms`, `1600ms` y `3000ms`:** la silueta apareciendo en el Mirador. Con esa cámara apenas entra en cuadro.
- **`vista-3a` y `vista-3c`:** un plano abierto 2.5D, con el arco cerrado y abierto. Muestran la silueta sobre el muro y, con el arco abierto, el barrio sólo por el vano.
- **`vista-3b`:** la Terraza con el arco abierto, en la cámara de juego.
- **`vista-4` y `vista-5`:** la plaza entera, con cámara libre (herramienta de inspección).
- **`plaza-diagonal`, `fuente-cerca`:** la plaza desde la cámara de juego. La calle con la torre al fondo, el soportal y los vecinos.
- **Intermedios:**
  - `intermedio-silueta-de-carton`: bloques lejanos planos;
  - `intermedio-silueta-blanca`: tonos claros que el tone mapping volvió blancos;
  - `intermedio-vecina-con-piernas-de-tronco`;
  - `intermedio-sin-calle-ni-galeria`: la plaza cerrada, con un soportal en relieve.

## Técnico (medido)

- **`npm test`: 72/72.** Una prueba nueva: los vecinos son sólidos.
- **Recorrido con teclado completo** (`report.json`): ver abajo, en «Recorrido».
- **Tiempos de cuadro de la secuencia** (`barrio.json`): p99 y máximo de 16,8 ms en la plaza y en el pasaje.
- **Llamadas de dibujo** (`llamadas-de-dibujo.jsonl`, 1280×720, `drawInfo()`), con p99 de 16,8 ms en todos los casos en esta M2:

  | Lugar | Arco cerrado | Arco abierto |
  |---|---|---|
  | Orilla | 281 | 281 (la boca no se ve: el barrio no se dibuja) |
  | Terraza | 662 | 930 |
  | Mirador (cámara de juego, x 13,1) | 511 | 796 (la boca se ve por un borde del vano) |
  | Plaza | — | 634 |

  - **Comparación con la iteración 14:** con el arco abierto, la Terraza **subió** de 855 a 930 llamadas.
    - El barrio creció: calle, torre, galería, vecinos, puertas.
    - El portal recorta píxeles, no llamadas.
    - Lo que sí cambió: desde donde la boca no se ve, como la Orilla, el barrio ya no se dibuja.
  - **Deuda:** cuando la boca se ve, el barrio cuesta unas 270 llamadas, porque cada edificio son varias mallas. Unir la geometría estática del barrio por material es trabajo de B5.

## Recorrido

**Recorrido con teclado completo** (`report.json`): pasa, con 22 pasos y 0 errores.
- En «arco y barrio», el recorrido abre el arco con la manivela, entra, va al soporte C y lo suelta: la esfera queda libre sobre el pavimento, con 8 marcas.
- La Bitácora agrega «plaza» y el explorador vuelve con ▼ a la Terraza (z = 0).
- Persisten 13 notas.
- **Paso «rendimiento»:** 360 cuadros, con p99 y máximo de 16,8 ms.

Es la corrida posterior a las correcciones de la primera revisión. Después hubo cuatro ajustes de dibujo y cámara, sin cambios en la simulación, verificados con `barrio.mjs`:
- el reloj a velocidad real;
- la cabeza de los vecinos;
- los márgenes del corte;
- `mouthSeen` en el mismo cuadro.

## Lo que queda abierto (no bloquea el cierre de B2; ver `REVISION.md`)

- **El costo de dibujo del barrio** cuando la boca se ve: unas 270 llamadas. Unir su geometría estática por material es trabajo de B5.
- **La silueta en el plano bajo del umbral** es una caja pálida sin rasgos (`secuencia-34`, arriba a la izquierda): queda como pulido.
- **Los vecinos** son figuras simples. La vecina entra recortada en la esquina de las tomas del soporte C.
- **La calle del norte** está cerrada con una reja. Abrirla, con su recorrido y su ciudad, es el primer sector de la metrópolis (B5).
