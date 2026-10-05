# Aceptación del Arco I · build candidata `9b5cd5e` (5 oct 2026)

**Build candidata:** commit `9b5cd5e` de `codex/playcanvas-slice`, árbol limpio.

- `dist/`: build entregable (`npm run build`), sin acceso de inspección.
- `dist-perf/`: el mismo código compilado con `VITE_INSPECT=1`. Agrega un acceso de inspección de
  sólo lectura para que las partidas automatizadas sepan dónde está cada cosa. Todos los demás
  recursos son idénticos byte a byte a los de `dist/`.

Las pasadas automatizadas corren contra `dist-perf` servida con `vite preview`. Usan sólo
teclado, clics y toques reales; la inspección sólo observa.

**Equipo:** MacBook Apple M2, macOS 26.7.1, Chrome 154 sin interfaz sobre ANGLE Metal.

## Resultados

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Pasada 1 · recorrido completo desde una partida nueva, capturando cada escena | Completa: 9 lugares, 9 bancos, 9 recuerdos, final, primera clase, epílogo y recarga; 0 errores (417 s) | `experiments/playcanvas/output/acceptance/1-recorrido/` |
| Pasada 2 · adversarial (ver abajo) | Completa, 0 errores (705 s); 16 habitantes respondieron al llegar y después del final | `output/acceptance/2-adversarial/` |
| Táctil, teléfono emulado 390×844 | Completa, 0 errores | `output/acceptance/3-tactil/` |
| Diálogos: Enter apurado, pausa y otro objeto | Correcta | — |
| Prueba de humo de la build entregable `dist/` | Importa la bitácora final, Faro, viaje por mapa al Lago y la Plaza, Bitácora, diseño de teléfono sin desborde y recarga; sin errores ni respuestas 4xx | `output/production/` |
| Pruebas automáticas | PlayCanvas 83/83, raíz 286/286, `npm run check` correcto | — |
| Rendimiento de la candidata (1440×900, DPR 2, alta) | Peor costo por cuadro p95 14,4 ms (Faro); 16,8 MB; memoria 92,6 → 92,9 MB tras tres vueltas; 0 errores | [RENDIMIENTO.md](RENDIMIENTO.md), `output/perf/` |

## Pasada 2 · adversarial

La ruta adversarial hace lo siguiente:

- prueba temprano una salida bloqueada;
- conecta mal un cable y lo deshace;
- abandona dos bancos y los retoma;
- recarga con un banco a medio hacer, durante tres escenas y al llegar al Lago;
- abre y cierra interfaces en serie;
- prueba frenos y reguladores equivocados en la Puerta, Terrazas y el Faro;
- camina del Castillo a la Plaza y vuelve;
- al llegar a cada lugar, habla con cada habitante presente;
- después del final y de recargar, recorre los nueve lugares y vuelve a hablar con todos.

En su primera corrida sobre la candidata **falló en la Plaza**. Al volver del taller restaurado,
Edda ya no pertenece a la Plaza y camina hacia la salida norte (la espera la Calzada). La prueba
la perseguía y ella desaparecía al llegar a la salida.

Se reprodujo de forma exacta con un registro de cada habitante (posición, plan, ruta). No es un
defecto del juego: mientras está a la vista se le puede hablar, porque la charla la detiene y
tiene su línea para ese momento. Se ajustó la prueba para no perseguir a quien se retira, sin
tocar la build.

Se comprobó aparte que, si se la alcanza mientras se retira, Edda responde con su línea
posterior al taller y se detiene (`output/departing-check.mjs`; comprobación puntual con acceso
de depuración, no forma parte de la aceptación). Edda en el Portal, a quien la ruta adversarial
no encuentra presente, respondió en las pruebas táctil y de diálogos: en total, los 17
habitantes del arco responden.

La prueba de humo de producción también estaba desactualizada: buscaba los destinos del mapa
fuera del desplegable donde hoy están. Se corrigió la prueba, no el juego.

## Revisión visual de las escenas de la pasada 1

Hojas: `output/acceptance/review-arrivals.png`, `review-benches.png`, `review-end.png` y las
escenas cuadro a cuadro (`1-recorrido/scene-*.png`).

- **Las mejores:** la llegada al Portal (vórtice, Edda, Ohm dormido); la Plaza en fiesta; el
  Manantial con la rueda, el acueducto y los dos canales; la Calzada con el Ω legible; la
  galería del Faro restaurada y el haz que llega al lago; el despertar de Ohm.
- **Las menos logradas:**
  - el taller a oscuras al llegar: penumbra pedida por el canon, pero la sala se ve escasa
    hasta que vuelven las lámparas;
  - la llegada al Lago al crepúsculo: dominan las copas y el jugador queda chico;
  - la llegada al Faro de noche: pantalla mayormente oscura, aunque el espigón, la galería y
    las personas se leen;
  - los bancos de Castillo, Terrazas y Faro: legibles, pero densos.

  Ninguna oculta información necesaria ni un marcador de posición; quedan para la revisión
  humana.

## Estado de la misión

Se cumplen los criterios verificables en este equipo:
- recorrido completo desde cero;
- progresión y guardados sostenidos ante recargas en todo el arco;
- sin bloqueos ni fallos graves conocidos;
- los nueve bancos responden con información distinta a cada error;
- los 17 habitantes responden;
- dos pasadas de aceptación sobre la misma build;
- 60 FPS en el escritorio medido.

**No se declara cumplida la misión.** Quedan comprobaciones que esta sesión no puede hacer:

- **Móvil de referencia, 30 FPS y tacto real: NO VERIFICADO.** No hay dispositivo; la prueba
  táctil es emulada.
- **Escucha del audio: NO VERIFICADA.** La mezcla y los sonidos se revisaron por código y con
  pruebas de estado.
- **Revisión humana de diversión y aprendizaje: PENDIENTE.** Que un principiante anticipe qué
  cambiará, elija dónde medir y entienda por qué una lectura en vacío no garantiza el
  funcionamiento sólo se sabe jugando con personas. Ningún bot lo demuestra. Esa prueba también
  tiene que juzgar el ritmo (hallazgo 5 de la crítica: estructura predecible por zona; el Faro
  concentra seis mandos y tres bancos) y las escenas menos logradas de arriba.

Para jugar la build: `experiments/playcanvas/README.md` («Jugar la build candidata»).
