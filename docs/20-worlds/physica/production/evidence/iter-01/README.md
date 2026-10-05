# Iteración 01 — evidencia

**Build y recorrido:**
- Build: `experiments/physica`, servidor de desarrollo de Vite en 127.0.0.1:4210.
- Recorrido: `scripts/evidence.mjs`, con eventos de teclado reales (CDP).
- Inicio limpio: el `localStorage` se borra antes de empezar.

**Equipo:** Apple M2, Chrome del sistema en modo headless, ANGLE Metal, 1280×720 y DPR 1.

La evidencia de esta carpeta es la corrida **posterior** a la revisión independiente (ver `REVISION.md`). Las capturas `antes-*` son el primer arranque de la iteración.

## Técnica (medida)

**Pruebas (`npm test`): 29/29.**
- Física:
  - Caída exterior exacta (|error| < 1e-9 m) y subida interior exacta.
  - Continuidad de velocidad: Δv por paso ≤ máx|a|·dt.
  - Entra bajando, frena y sube dentro.
  - Vuelve a la altura de liberación (energía).
  - Al salir conserva la velocidad y luego sigue a −9,8 exactos.
  - Independencia de la frecuencia de cuadro: 30, 60 y 144 Hz y frecuencia irregular.
  - Determinismo.
  - Arco de agua.
- Recorridos:
  - De extremo a extremo.
  - Suspensión.
  - Esfera llevada o empujada que sigue al agua.
  - Ruta sin bloqueo.
  - **Volver desde la Terraza** con 7 tiempos de reacción (caso de la revisión).
  - **R en el aire** devuelve al último apoyo firme.
- Experimento y Bitácora:
  - Reinicio, carrete y repetición idéntica.
  - Trazas equiespaciadas.
  - La Bitácora mide g exterior (−9,80) y la aceleración interior (+4,00) sólo con las marcas.
  - El borde se detecta en las marcas.

**Recorrido con teclado (`report.json`):**
- Trazas:
  - Traza A: 1,80 → 0,20 m en 0,6 s y se cierra al rebotar.
  - Traza B: desde la misma altura sube a 3,49 m y vuelve a 1,80 m; se cierra al completar la vuelta.
  - A y B quedan en el mismo cuadro.
- Carrete y nueva liberación: las primeras 15 marcas son idénticas.
- Cruce: aterriza en la Terraza.
- **Volver a la Terraza** desde la región: lo logra, con un agarre del borde.
- Bitácora: 4 notas antes y después de recargar.
- **Al recargar**, el explorador retoma sobre la Terraza (último apoyo firme guardado).
- Pausa: 0 pasos en 1,5 s; al reanudar, 34 pasos en 300 ms, sin salto.
- 0 errores de página y 0 advertencias.

**Tiempos de cuadro:**

| Situación | Cuadros | p50 | p95 | p99 | Máx. |
|---|---|---|---|---|---|
| Cascada en reposo, 6 s | 361 | 16,7 | 16,7 | 16,8 | 16,8 |
| Cruce real sin capturas, 4,5 s | 271 | 16,7 | 16,8 | 16,8 | 16,8 |

Antes de reemplazar el ruido por fragmento (corrida previa): p95 33,4 ms y p99 50 ms.

Las estadísticas del cruce *con* capturas (p99 183 ms) miden las capturas, no el juego. No se midió el peor caso con varias trazas activas durante el cruce.

## Secuencias

| Archivo | Contenido |
|---|---|
| `01-caida-familiar.jpg` | Soporte A, fuera de la región |
| `02-subida-en-region.jpg` | Soporte B, dentro de la región, a la misma altura |
| `03-cruce.jpg` | El explorador sigue el arco del agua |
| `trayectoria-cruce.json` | Muestras del explorador a ~30 Hz |
| `07-plomadas.jpg` | Plomadas: apuntan arriba dentro, horizontales en el borde y cuelgan afuera |
| `08-musgo-sima.jpg` | Musgo de la sima |

## Juicio artístico (del implementador, no validado)

- **Lo que se lee:** el arco de agua y su relación con el explorador; las plomadas como instrumento.
- **Lo que no alcanza:** la roca se ve borrosa de cerca y el tercio inferior es una mancha. La composición del cuadro de la cascada está apretada. El arco parece un tubo de sección uniforme. No hay un plano que reúna las dos caídas familiares con el arco.

## No verificado

- La mezcla de sonido: nadie la escuchó.
- Táctil y mando en un dispositivo real.
- Rendimiento móvil.
- Claridad y diversión con personas.
