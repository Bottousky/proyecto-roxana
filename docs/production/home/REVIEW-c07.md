# Revisión crítica · ciclo 7 (2026-10-06)

Revisor: un agente separado, sólo lectura (no escribió el código; leyó brief, docs, código y ~30 capturas
c00–c07). Es independiente del autor de los cambios, pero no es una persona ni un QA externo.
Veredicto del revisor: **no corresponde CANDIDATO_PARA_REVISION todavía** (2 críticos).

## Triage

| # | Sev. | Hallazgo (resumen) | Estado |
|---|---|---|---|
| 1 | CRÍTICO | `perf-390.json` registraba 16,4 FPS tras ciclos y los docs decían «—» / «60 FPS» | **Reporte corregido** (PERF/STATE). Causa: el script medía tras los gestos en primer plano; corregido para volver a la vista general. Diagnóstico con contadores: sin recálculos en reposo ni tendencia por ciclo. Re-medición: ver PERF.md · ciclo 7 |
| 2 | CRÍTICO | «Reducir movimiento» del sistema pisado por `applySettings` | **Corregido**: `reduced()` = ajuste ∨ sistema, escucha cambios; CSS `prefers-reduced-motion`. Verificado: diorama y clase activos, gesto 1 s |
| 3 | ALTO | «/40», «doce trofeos», 12 «???» para mundos sin integrar | **Corregido**: medidor «n/10» sólo de Ohmdal + «los otros mundos, sin integrar»; Sobre Roxana y Trofeos sin cantidades inventadas |
| 4 | ALTO | Volver con hash se salteaba «Cambió por tu aventura» | **Corregido**: `route()` y luego siempre `showChanges()` |
| 5 | ALTO | `localStorage` bloqueado abortaba la home | **Corregido**: acceso dentro de `try` (`storageOrNull`), prueba con getter que lanza |
| 6 | ALTO | Versión ligera sin directorio, Escape inútil, portada que desaparecía | **Corregido**: directorio visible, sin modo «explorar» en ligera, Escape por estado del panel. Capturas c07/sin-webgl |
| 7 | ALTO | Sprites pixel-art en acercamientos | **Parcial**: árboles del primer plano se desvanecen (c11; en c08 se apagaban de golpe); siguen sprites de visitantes y árboles lejanos en algunos primeros planos |
| 8 | ALTO | Interiores de talleres = cajas | **Electrónica mejorado (c08–c11)**: mapa de progreso, alfombra, lámparas y pantallas que siguen a `workshop`, instrumentos reconocibles; protoboard y soldador todavía simples. Física, Programación y Matemática sin cambios |
| 9 | ALTO | Destello del portal al volver por bfcache | **Corregido**: `pageshow` con `persisted` (no verificado con bfcache real) |
| 10 | MEDIO | Cerrar agregaba entradas al historial | **Corregido**: abrir = un paso, cambiar = reemplazar, cerrar = volver. `home-keys.mjs` 14/14 |
| 11 | MEDIO | Carreras: atajos durante gesto, gesto que pisa la sala elegida, farolito tardío, `focus(null)` con panel | **Corregido** (atajos en reposo y con modificadores excluidos, `openRoom` cancela gesto, farolito recalcula, recorrido respeta panel). Vista previa de entrada sin cancelación: abierto |
| 12 | MEDIO | Foco en controles ocultos, canvas sin foco visible, tarjeta sin Escape | **Corregido**: `inert` en portada/panel, `:focus-visible` en canvas, Escape cierra la tarjeta |
| 13 | MEDIO | Rótulos sobre el edificio equivocado | **Corregido**: pin sobre el hastial de la puerta |
| 14–18 | MEDIO | Jerarquía del plano maestro, fondo sin colinas, noche, primer pintado por hora (c10) y etapa (c11), acercamientos sobreexpuestos, Bitland/Faro/lucernario de Trofeos | **Parcial (c08–c09)**: pantalla del Anfiteatro atenuada en vista general, luz de acento en la estatua, bruma azulada y colinas más cercanas (siguen fuera del encuadre: la cámara maestra no ve el horizonte), noche más legible, acercamientos con menos exposición. Abiertos: primer pintado por hora/etapa, lucernario de Trofeos todavía claro, Bitland/Faro de detalle |
| 19 | MEDIO | Selector de etapas abierto (spoilers); promesa de entrada de Bitland | **Corregido**: selector sólo en dev o `?qa`; texto «boceto… puede cambiar» |
| 20 | MEDIO | QA sobredeclarado | Parcial: pérdida de contexto WebGL ahora cubierta (`home-interact.mjs` §5, c10); resto listado como NO VERIFICADO en STATE |
| 21 | MEDIO | Descubribilidad táctil de artefactos | Abierto |
| 22 | BAJO | Sonido desincronizado al iniciar | **Corregido** |
| 23–24 | BAJO | Detalles de novedades, atajos WCAG 2.1.4, «Patio» vs «Sobre Roxana», licencia de Meshy | Parcial (atajos ignoran modificadores); resto abierto |

Continuación: [`REVIEW-c11.md`](REVIEW-c11.md) (segunda revisión independiente).
