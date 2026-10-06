# Iteración 05 — el agua de la cascada (evidencia)

**Resultado principal:** la columna tiene volumen aparente, espuma y flujo continuo, y su forma sigue saliendo del mismo campo que los cuerpos. Diseño en `../../DECISIONES.md` D11; la revisión y su respuesta, en `REVISION.md`.

**Qué cambió en el agua:**
- **Afloramiento:** la columna sale de la superficie de la poza, empujada por la presión de la surgencia, declarada en el modelo.
- **Grosor:** sigue la continuidad y, en la cresta, lo limita el radio de curvatura; el chorro ya no se pliega sobre sí mismo.
- **Cuerpo y velo:** un cuerpo más un velo desgarrado, con ondas que viajan a la velocidad del agua.
- **Espuma:** una corona de espuma en la cresta y montículos donde el agua brota y donde cae.
- **Pozas:** las ondas se abren en anillos desde el afloramiento y desde cada punto de caída.
- **Roca mojada:** zonas declaradas con borde redondeado.
- **Plano inicial:** primero la caída familiar, después la columna.

**Imágenes:**

| Prefijo | Versión |
|---|---|
| `antes-*` | Antes |
| `intermedio-*` | La versión que fue a revisión |
| `despues-*` | Después de las correcciones |

Las mismas tomas en las tres: `w1` afloramiento, `w2` columna, `w3` cresta, `w4` llegada, `w5` caída izquierda, `w6` cámara de juego. Del recorrido: `00a-plano-de-establecimiento`, `03c-cruce-por-la-cadena`, `10c-pozo-en-la-ventana`.

## Técnico (medido)

- `npm test`: 44/44. La prueba del agua comprueba que la columna sale de la poza con la velocidad declarada, cresta sobre la Terraza, cae en ella y sube despegada de la cara.
- **Recorrido con teclado** (`report.json`, Apple M2, Chrome headless, carga 4,2–4,3 en 8 núcleos): pasan el recorrido completo, los tres resultados del pozo y los escalones; persisten 10 notas; 0 errores.
- **Tiempos de cuadro (ms):**

  | Situación | p50 | p95 | p99 | máx. | pasos perdidos |
  |---|---|---|---|---|---|
  | Reposo | 16,7 | 16,7 | 16,8 | 16,8 | 0 |
  | Cruce | 16,7 | 16,7 | 16,8 | 16,8 | 0 |

  Antes del precalentamiento, el primer cruce mostraba tirones de 150–250 ms.
- **Arnés del recorrido:** dos fallas venían del arnés, no del juego:
  - `walkTo` usaba un presupuesto de reloj de pared, y con carga la simulación avanza más lento. Ahora usa tiempo simulado.
  - Las hojas de contacto se componen en una segunda pestaña, que dejaba la del juego con `requestAnimationFrame` detenido. Ahora la pestaña del juego vuelve al frente.

## Sin verificar

- El aspecto del velo en ángulos rasantes, de cerca.
- El sonido.
- El rendimiento durante 60 s con la vista, en una máquina tranquila.
- Móvil.
- Si una persona lee «esta agua sube» sin que nadie se lo explique.
