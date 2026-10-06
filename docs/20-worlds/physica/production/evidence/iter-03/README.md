# Iteración 03 — evidencia

**Resultado principal:** transferencia con dos límites. Es la misma regla de la cascada en otra geometría: el Pozo y el Mirador. Ver `../../DECISIONES.md` D10 y `REVISION.md`.

**Cómo se generó:** `scripts/evidence.mjs` con teclado real (CDP), desde un inicio limpio. Las ventanas se miden en tiempo simulado.
- Equipo: Apple M2, Chrome headless, 1280×720.
- Carga de la máquina, registrada: 6,7 al empezar y 7,7 al terminar, con 8 núcleos.

## Técnica (medida)

**Pruebas (`npm test`): 44/44.** Nuevas en esta iteración:
- **Ventana del Pozo:**
  - 0,9 y 1,05 caen al agua;
  - 1,3, 1,5, 1,7, 2,0 y 2,25 llegan al Mirador;
  - 2,5, 3,0 y 3,5 no alcanzan.
- **El soporte P predice al explorador:** su campana suena exactamente desde las alturas que llevan al Mirador (1,5 y 2,0). Desde −0,5 a 1,0 la esfera cae al agua, y desde 2,5 o más arriba no llega.
- **Salida del pozo:** desde el agua se sale por la cadena. El agua no cuenta como apoyo firme: R desde el agua devuelve a la Terraza.
- **Cadena en el aire:** un explorador que oscila al lado de la cadena puede agarrarla y salir.
- **Entrar caminando:** al pozo no lleva al Mirador, y siempre hay salida. Esta prueba reemplaza una que nunca entraba al pozo (hallazgo 6).
- **Escalones del Mirador:** se bajan y se vuelven a subir. No hay callejón sin salida.
- **Bitácora del pozo:** clasifica cada intento por su causa, con alturas medidas y sin repetir. Probado con la `Journal` real sobre un DOM mínimo.

**Recorrido con teclado (`report.json`):**
1. Soporte P desde 2,0: suena la campana del Mirador. Desde 1,0: la esfera cae al agua.
2. Explorador desde 0,9: cae al agua. Sale por la cadena y vuelve a la Terraza.
3. Desde 2,5: no alcanza y vuelve a la Terraza.
4. Desde 1,5: llega al Mirador y aparece la vista de la ciudad.
5. Escalones abajo y arriba.
6. Bitácora: 10 notas, que persisten.
7. 0 errores.

**Tiempos de cuadro:**

| Situación | Cuadros | p50 | p95 | p99 |
|---|---|---|---|---|
| Reposo, 6 s | 360 | 16,7 | 16,7 | 16,8 |
| Caminando fuera del borde | 271 | 16,7 | 16,8 | 16,8 |

## Imágenes

| Archivo | Contenido |
|---|---|
| `10-0-soporte-del-pozo` | Soporte P desde 2,0 (sube) y desde 1,0 (cae) |
| `10a`, `10b`, `10c` | Los tres intentos del explorador |
| `10d` | La vista |
| `11-pozo-instrumentos` | Instrumentos del pozo |
| `12-pozo-camara-nivelada` | Números, collar de cobre en 1,0 y anclas cerca de su altura real, con la cámara casi a nivel |

## Juicio del implementador (no validado)

- **Mejoró:** la ventana del pozo se puede predecir con el soporte P sin arriesgar al explorador. Los números están en un solo plano.
- **Pendiente:** el paralaje residual de los elementos secundarios (plomadas y caños, a −0,4 y −1,2 m de profundidad). La ciudad es una silueta simple. La roca sigue borrosa de cerca.

## No verificado

- Sonido, incluido el chapoteo nuevo.
- Táctil y mando en dispositivo real.
- Rendimiento móvil.
- Si una persona encuentra la ventana entendiendo, y no por tanteo.
