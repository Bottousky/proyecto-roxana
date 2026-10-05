# Rendimiento · build de producción (5 oct 2026)

Medido con `scripts/perf.mjs` sobre la build de producción de `b9c9915`, compilada con
`VITE_INSPECT=1` (`dist-perf/`): el mismo código minificado más el acceso de inspección de
sólo lectura, que la build entregada (`dist/`) no incluye. Se abre una bitácora terminada y se
viaja con el mapa del juego por los nueve lugares; es una medición, no una prueba de recorrido.

**Equipo:** MacBook Apple M2 (8 núcleos, 16 GB), macOS 26.7.1. **Navegador:** Chrome 154 sin
interfaz, WebGL2 sobre ANGLE Metal (Apple M2). **Servidor:** `vite preview` local.

**Objetivo fijado antes de medir** (encargo): 60 FPS estables en el escritorio objetivo; 30 FPS o
más en un móvil de referencia.

## Método

Chrome sin interfaz topa el ritmo de cuadros en 60 Hz aun con las banderas que lo liberan, así
que el ritmo real sólo muestra si hubo cuadros perdidos. Para saber el margen se mide el costo de
cada cuadro sin tope: la lógica del juego (`world.update`) más el render completo con su
posproceso (profundidad de campo, bloom, gradación), forzando a la GPU a terminar con
`readPixels`. 90 cuadros por lugar tras 8 de calentamiento. Un cuadro cabe en 60 FPS si
cuesta menos de 16,7 ms.

## Resultados

| Configuración | Píxeles dibujados | Costo/cuadro p50 (peor lugar) | p95 (peor) | Máx. (peor) | Ritmo real caminando, máx. | Lugares en 60 FPS |
|---|---|---|---|---|---|---|
| 1440×900, DPR 2, calidad alta | 2448×1530 | 6,7 ms (taller) | 14,7 ms (Faro) | 15,2 ms | 16,8 ms | 9/9 |
| 1920×1080, DPR 1, calidad alta | 1920×1080 | 3,3 ms | 8,8 ms | 8,9 ms | 16,8 ms | 9/9 |
| 1440×900, DPR 2, calidad baja | 1440×900 | 1,5 ms | 2,1 ms | 2,6 ms | 16,8 ms | 9/9 |

Detalle por lugar a 1440×900 DPR 2, calidad alta (ms):

| Lugar | update p50 | render p50 | costo p50 | costo p95 | costo máx. | ritmo caminando p95 | ritmo máx. |
|---|---|---|---|---|---|---|---|
| Portal | 0,4 | 3,2 | 3,6 | 12,7 | 13,6 | 16,8 | 16,8 |
| Plaza | 0,4 | 3,2 | 3,7 | 12,2 | 12,5 | 16,8 | 16,8 |
| Taller | 0,4 | 6,2 | 6,7 | 11,1 | 11,3 | 16,8 | 16,8 |
| Calzada | 0,4 | 2,9 | 3,5 | 12,4 | 13,1 | 16,7 | 16,8 |
| Manantial | 0,4 | 3,0 | 3,5 | 12,9 | 14,0 | 16,7 | 16,8 |
| Castillo | 0,4 | 3,0 | 3,6 | 12,3 | 13,3 | 16,7 | 16,8 |
| Terrazas | 0,4 | 2,9 | 3,3 | 13,2 | 13,4 | 16,7 | 16,8 |
| Lago | 0,4 | 2,9 | 3,5 | 13,0 | 13,4 | 16,7 | 16,8 |
| Faro | 0,4 | 3,0 | 3,6 | 14,7 | 15,2 | 16,7 | 16,8 |

- **Carga:** título listo en 0,6–0,8 s; de «Continuar» al mundo, 2,6 s en calidad alta y 3,9 s en
  baja (local, sin latencia de red). Se transfieren 19,3 MB (84,6 MB decodificados): la
  geometría es 11,3 MB comprimida y 73,6 MB descomprimida.
- **Memoria JS** tras recolectar: 113,4 MB después de la primera vuelta, 113,7 MB después de tres
  (calidad baja: 114,4 → 114,9). Sin crecimiento apreciable.
- **Errores de consola y de página:** ninguno en las tres configuraciones.

## Lectura y límites

- En el escritorio medido el objetivo de 60 FPS se cumple en todos los lugares con margen: el
  peor cuadro cuesta 15,2 ms a 2448×1530 px en calidad alta. El margen más justo está en el Faro
  y en los picos (p95) de calidad alta con DPR 2.
- Es una medición sin interfaz en un solo equipo. Una pantalla real puede componer de otra
  manera; un Mac con ProMotion pediría 120 Hz.
- **Móvil de referencia (30 FPS): NO VERIFICADO.** No hay dispositivo; la emulación de pantalla
  no mide una GPU móvil.
- La descarga es la debilidad: en una red de 25 Mbps los 19,3 MB tardarían unos 6 s. Colores y
  normales en coma flotante y los índices en 32 bits se pueden cuantizar (estimado: unos 4 MB
  menos de descarga y la mitad de la memoria de geometría). Pendiente en el backlog.

Repetir: `VITE_INSPECT=1 npx vite build --outDir dist-perf`, `npx vite preview --outDir dist-perf --port 4194`,
`GAME_URL=http://127.0.0.1:4194/ SIZE=1440x900 DPR=2 QUALITY=high node scripts/perf.mjs`.
