# Iteración 06 — el explorador, fiel a su hoja de giro (evidencia)

**Resultado principal:** el modelo 3D del explorador se reconstruyó sobre `art-source/physica/explorer-sheet-v1.png`, con la misma interfaz de animación. Diseño en `../../DECISIONES.md` D12; la revisión independiente (dos pasadas) y su respuesta, en `REVISION.md`.

**Imágenes:**

| Archivo | Qué muestra |
|---|---|
| `antes-vs-hoja`, `intermedio-vs-hoja`, `despues-vs-hoja` | La hoja arriba y el modelo abajo, en frente, tres cuartos, perfil, espalda y busto: el modelo anterior, el que fue a la primera revisión (v6) y el final (v11). |
| `antes-*`, `despues-*` | Cada vista suelta. Las `antes-*` se tomaron con otro encuadre, que corta los pies. |
| `juego-de-pie`, `juego-caminando` | Cámara de juego (recorte 2x). `juego-caminando` se tomó con una tecla real apretada. |
| `juego-de-pie-cuadro` | El cuadro de juego completo: escala real del personaje en pantalla. |
| `juego-cerca-campo-normal`, `juego-cerca-en-la-region` | La misma cámara cercana en campo normal y colgado de la cadena dentro de la región. |
| `03c-cruce-por-la-cadena` | El recorrido con el modelo nuevo. |

**Herramientas nuevas:**
- `scripts/turnaround.mjs`: las vistas de giro junto a la hoja.
- `scripts/poses.mjs`: las poses en la cámara de juego.
- Ganchos de inspección de desarrollo: `__physica.pose`, `screenOf`, `explorer`.

## Técnico (medido)

- `npm test`: 44/44, sin cambios en la simulación.
- **Recorrido con teclado** (`report.json`, Apple M2, Chrome headless, carga 4,4–5,2 en 8 núcleos):
  - todo el recorrido pasa;
  - el pozo da sus tres resultados;
  - los escalones funcionan;
  - persisten 10 notas;
  - 0 errores.
- **Tiempos de cuadro (ms):** el modelo tiene más piezas y un contorno nuevo, y aun así no aparecen tirones.

  | Situación | p50 | p95 | p99 | máx. | pasos perdidos |
  |---|---|---|---|---|---|
  | Reposo | 16,7 | 16,7 | 16,8 | 16,8 | 0 |
  | Cruce | 16,7 | 16,7 | 16,8 | 16,8 | 0 |

  Hubo corridas intermedias con carga de 9 a 11 y dieron los mismos números.
- **Las cadenas del modelo, medidas:**
  - **Colas de la bufanda:** colgado de la cadena en la región, en el navegador, suben desde el anclaje (0,73 m sobre los pies) hasta 1,0–1,1 m; en campo normal cuelgan hasta ~0,3–0,4 m.
  - **Remolino** (node): 33° sobre la horizontal en campo normal, 79° en la región. El modelo anterior marcaba 87° en ambos: no respondía al campo.
  - **Simulación en node:** 720 cuadros de caminatas con giros, sin ningún punto de una cola delante del cuerpo.

## Lo que queda (ver REVISION)

- **La pista del campo en el explorador:** de cerca se lee. En la cámara de juego, las colas suben detrás de la cabeza y casi no se ven; ahí el campo lo siguen mostrando las plomadas, el musgo y el polen.
- **El pelo:** la silueta es más redonda que en la hoja, y el flequillo se lee algo recortado.
- **Proporción:** sin cuello, a propósito (D12).
- **El sombreado:** no es cel shading como en la hoja.
- **Mangas y abrigo:** sin pliegues ni abertura trasera.

## Sin verificar

- Cómo se lee el personaje en movimiento continuo (sólo hay cuadros sueltos).
- Móvil.
- Si una persona reconoce al personaje del retrato sin que se lo digan.
