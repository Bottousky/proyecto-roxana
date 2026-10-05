# Iteración 01 — evidencia

**Build:** `experiments/physica`, servidor de desarrollo de Vite en 127.0.0.1:4210. Recorrido de `scripts/evidence.mjs` con eventos de teclado reales (CDP), desde un inicio limpio con el `localStorage` borrado.

**Equipo:** Apple M2, Chrome del sistema en modo headless, ANGLE Metal, 1280×720, DPR 1.

## Técnica (medida)

- **Pruebas:** `npm test` da 25/25.
  - Caída exterior exacta: |error| < 1e-9 m.
  - Subida interior exacta.
  - Continuidad de velocidad: Δv por paso ≤ máx|a|·dt.
  - Entra bajando, frena y sube dentro.
  - Vuelve a la altura de liberación (energía).
  - Conserva la velocidad al salir y luego acelera exactamente a −9,8.
  - Independencia de la frecuencia de cuadro: 30, 60 y 144 Hz y frecuencia irregular.
  - Determinismo.
  - Arco de agua que cruza.
  - Recorrido de extremo a extremo.
  - Suspensión sin atasco.
  - Esfera empujada o soltada que sigue al agua.
  - Reinicio, carrete y repetición idéntica.
  - Trazas equiespaciadas en el tiempo.
  - Ruta sin bloqueo.
- **Recorrido con teclado** (`report.json`):
  - Traza A: 2,60 → 0,199 m en 0,7 s, luego rebotes y reposo.
  - Traza B: sube de 1,10 m, pasa el borde superior, alcanza 3,77 m y vuelve a 1,105 m.
  - Carrete y nueva liberación: las primeras 15 marcas son idénticas.
  - El cruce aterriza en la Terraza (y = 3,00).
  - La Bitácora tiene 4 notas antes y después de recargar.
  - Pausa: 0 pasos en 1,5 s; al reanudar, 35 pasos en 300 ms, sin salto.
  - 0 errores de página y 0 advertencias de consola.
- **Tiempos de cuadro** en la cascada, quieto, 6 s:
  - p50 16,7 ms, p95 33,4 ms, p99 50 ms, máx. 50 ms.
  - **No cumple 60 FPS estables:** ~15 % de los cuadros pierden un vsync. Causa sin aislar; la sospecha principal es el shader de roca (varios fbm por fragmento). Queda abierto en el backlog.

## Secuencias

- `01-caida-familiar.jpg`: soporte A fuera de la región.
- `02-subida-en-region.jpg`: soporte B dentro, sube, sale, frena y vuelve a entrar.
- `03-cruce.jpg`: el explorador camina fuera del borde y sigue el arco del agua.
- `trayectoria-cruce.json`: muestras del explorador durante el cruce, a ~30 Hz.

## Antes y después

- `antes-a-inicio-primer-arranque.jpg` y `antes-b-cascada-primer-arranque.jpg`: primer arranque de la iteración, con estratos saturados que compiten con el juego y una cámara lejana.
- `00-inicio.jpg` y `06-cascada.jpg`: estado al cierre de la iteración.

## Juicio artístico (del implementador, no validado)

- **Lo que se lee:** el arco de agua y su relación con el explorador; las plomadas como instrumento del borde (`07-plomadas.jpg`).
- **Lo que no alcanza:** la roca se ve borrosa y sin detalle de cerca. El musgo de la sima se ve quebrado en zigzag (`08-musgo-sima.jpg`). La composición del cuadro de la cascada está apretada.

## No verificado

- La mezcla de sonido: nadie la escuchó.
- Táctil y mando en un dispositivo real.
- Rendimiento móvil.
- Claridad y diversión con personas.
