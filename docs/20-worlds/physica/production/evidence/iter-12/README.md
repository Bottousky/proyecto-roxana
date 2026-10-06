# Iteración 12 — opciones de accesibilidad (A16) (evidencia)

**Resultado principal:** la pausa (Esc, P, Start o ⏸) es un panel de opciones modal:
- volumen;
- movimiento reducido;
- tamaño del texto (1, 1,25, 1,5);
- los controles de teclado, mando y táctil.

Se maneja con teclado, mando o táctil. Los ajustes se guardan. Diseño en `../../DECISIONES.md` D17; la revisión en dos pasadas y su respuesta, en `REVISION.md`.

**También en esta iteración:** el paquete para la evaluación humana del Hito A, en `../../EVALUACION-HITO-A.md`.

## Evidencia (medida con entradas reales)

- `opciones.json` y `opciones-*.jpg` (`scripts/opciones.mjs`), sólo con teclado:
  - Esc abre con el foco en el volumen;
  - ◀ baja el volumen, espacio activa el movimiento reducido y ▶ elige «Muy grande»;
  - 10 Tab no salen del panel;
  - Esc vuelve al juego;
  - al recargar, todo persiste;
  - a 900×600 y 390×844 con texto a 1,5× el panel entra sin desplazar, con «Seguir» visible.
- `accesibilidad.json`, `tactil-390x844.jpg` y `mando-controles-abiertos.jpg` (`scripts/accesibilidad.mjs`):
  - **Mando simulado:** Start, cruz, A, Select y B operan el panel. Con «Controles» abierto y texto a 1,5×, el panel se desplaza 292 px hasta «Seguir», con todo control visible.
  - **Táctil a 390×844 y 430×932:** todos los botones y el aviso quedan dentro de la pantalla, y la ayuda no tapa el título.
  - **Movimiento reducido:** `?reduced` le gana a un «no» guardado. En el inicio, 0 cuadros de viaje y 3 cortes, contra 168 cuadros de viaje sin la opción.
  - **La Bitácora abierta detrás del panel:** un clic en el texto y Shift+Tab no la alcanzan (queda `inert`).
- `npm test`: 55/55, con 3 pruebas nuevas de `settings.js`.
- **Recorrido con teclado** (`report.json`): todo pasa, la pausa congela la simulación (0 pasos), 0 errores. p99 y máximo de 16,8 ms, 0 capturas colgadas.

## Sin verificar

- Con un lector de pantalla real.
- Con un mando físico; el de las pruebas es simulado.
- En un teléfono real.
- Con personas.
