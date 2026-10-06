# CANDIDATO PARA REVISIÓN · Home del Instituto Roxana

2026-10-06 · rama `claude/roxana-home-3d-upgrade-e3f8d2` (22 commits sobre `f7984ca`, sin push) · ciclos 1–15.

Esto es un **candidato**, no una aprobación: la calidad subjetiva la decide quien revisa. Las dos revisiones
críticas fueron hechas por agentes separados de sólo lectura (independientes del autor, no personas).

## Cómo verlo

```sh
cd experiments/playcanvas && npm ci
node node_modules/vite/bin/vite.js --port 4196 --strictPort
```

Abrir `http://127.0.0.1:4196/escuela.html` (campus 3D) o `http://127.0.0.1:4196/escuela-clasica.html` (versión
clásica, sin 3D). Estados de prueba sin tocar partidas: `?etapa=0..10&hora=manana|tarde|noche`
(el selector de etapas en Ajustes aparece con `?qa`). Build: `node node_modules/vite/bin/vite.js build`.

## Qué cambió (de la línea base a hoy)

| Línea base (`evidence/c00-base/`) | Hoy |
|---|---|
| Bandeja flotante entre nubes, casi cenital; modal que tapa la llegada; 9 s de pantalla vacía | Escuela asentada en la campiña, encuadre ¾ con la estatua de Roxana como foco; el primer pintado es una imagen real del campus según la hora y el progreso de la partida; portada HTML con identidad, frase y «Entrar a Ohmdal/Continuar» antes del 3D |
| Cuatro talleres idénticos; artefactos ausentes | Cada taller con remate de techo propio y un artefacto vivo en el césped (Faro, columna de agua, ciudad en el chip, pizarrón de equivalencias); tocar uno da una respuesta propia y abre su taller |
| Sin versión ligera; sin WebGL, sólo un texto | Versión ligera diseñada (sin WebGL o con el contexto 3D perdido): campus de fondo, mundos, directorio, novedades, salir siempre posible |
| Progreso sólo como etapas genéricas; «0/40» | Transformaciones específicas desde la partida real de Ohmdal (ver Progreso); medidor honesto «n/10 Ohmdal · los otros mundos, sin integrar» |
| Sin novedades ni redes | Cartelera física en el camino del portón + panel HTML, estados vacío/carga/error, no leído real; redes en configuración validada sin URL inventada |
| Sala de Trofeos y Anfiteatro escondidos en las esquinas traseras (c14) | Fila norte, a los lados de la Dirección, visibles desde la vista general (prueba de visibilidad con la cámara real) |
| Sólo el 3D y su versión ligera | **Versión clásica** (`escuela-clasica.html`, c15): página web convencional del mismo Instituto, servida ya escrita (se lee sin JS), con láminas del campus real, plano SVG con las medidas del 3D, registro, novedades y Sobre Roxana; sin motor 3D; enlazada desde la portada, Ajustes, la versión ligera y `noscript` |

Bitácora completa por ciclo en `STATE.md`; triage de revisiones en `REVIEW-c07.md` y `REVIEW-c11.md`.

## Evidencias principales

- Plano maestro antes/después: `evidence/c00-base/vista-0-tarde-1440.jpg` → `evidence/c09/despues-explorar-3-tarde-1440.jpg`; noche `evidence/c09/antes-…noche` → `despues-…noche`.
- Llegada y primer pintado: `evidence/c07/foco-tab.jpg` (portada), `evidence/c11/primer-pintado-e10-noche.jpg` (sin JS, partida avanzada), `evidence/c15/llegada-0-tarde-1440.png` (fila norte).
- Versión clásica: `evidence/c15/clasica/1440-primera-visita.jpg`, `390-con-partida.jpg`, `1440-etapa10-noche-oscuro.jpg` (sin JS: verificado en `clasica.log`).
- Interacción insignia: `evidence/c08/*-respuesta.jpg`, tira `evidence/c08/physica-tira.jpg`.
- Campus que recuerda: `evidence/c08/mapa-e0.jpg`/`mapa-e4.jpg`/`mapa-e10.jpg`; taller etapa 0 vs 10 con la cámara real `evidence/c11/electronica-0-tarde-1440.jpg`/`-10-`.
- Móvil (emulación 390×844): `evidence/c11/llegada--noche-390.jpg`, `electronica-4-tarde-390.jpg`.
- Versión ligera y contexto perdido: `evidence/c07/sin-webgl-1440.jpg`, `sin-webgl-390.jpg`, `evidence/c10/contexto-perdido.jpg`.
- Novedades y cartelera: `evidence/c04/cartelera-no-leido.jpg`, `cartelera-abierta.jpg`.

## Pruebas (ciclo 15)

- `npm test` **103/103** (incluye novedades, redes, perfil, paisaje, artefactos, mapa de progreso, almacenamiento bloqueado, compilación de los módulos de la home, visibilidad de Trofeos/Anfiteatro y cuatro de la versión clásica).
- `node scripts/clasica-check.mjs`: versión clásica a 1440, 820 y 390, sin JS, con partida de prueba, vista previa en modo oscuro; enlaces, anclas, imágenes, foco, desborde, CLS de laboratorio.
- `node scripts/home-interact.mjs` **32/32**: los cuatro gestos, Escape, tarjeta de cambios una sola vez, no leído real, cartelera, contexto 3D perdido, árboles que se desvanecen, regreso por bfcache (**simulado** con un evento sintético), versión ligera sin callejones, movimiento reducido del sistema.
- `node scripts/home-keys.mjs` **15/15**: orden de Tab, foco visible, Escape devuelve el foco, atajos en reposo, Atrás/Adelante por sala, controles ocultos fuera del orden, vista previa cancelable.

## Mediciones (laboratorio, `PERF.md`)

Chrome 141 headless · ANGLE Metal · Apple M2 · build de producción. Condición de GPU verificada con `ps`.

- **1440×900, perfil alto, GPU libre:** listo en 1,6 s, LCP 88 ms, CLS 0, **60,1 FPS en la vista general, p99 16,8 ms**, 60 FPS con sala abierta y tras 10 ciclos de salas/novedades/gestos; entidades estables, heap tras GC 32 MB.
- **1440×900, perfil bajo:** 60 FPS en todos los estados; 650 draw calls.
- **390×844 DPR 2:** sólo corridas contaminadas por otros agentes; 484 draw calls en perfil bajo (presupuesto ≤ 600). Es emulación: **no acredita rendimiento en un teléfono real**.
- Transferencia inicial (etapa 0, tarde): 6,74 → **5,33 MB, 19 recursos**, sin compresión de transporte (una sola imagen de primer pintado por visita).
- Campo (p75 de LCP/INP/CLS): **sin datos**, no hay visitas reales.

## Progreso efectivamente integrado

Sólo **Ohmdal** (`ohmdal.playcanvas.arc1.v1`, mismo origen, sólo lectura). Tabla hito → transformación en
`PROGRESSION.md`: farol y acento de Roxana, Taller (lámparas, pantallas, bombilla del pararrayos), portón, fuente,
faroles, canteros, estandartes, campana, linterna y Faro en miniatura, visitantes, trofeos, cinemáticas, mapa del
taller lugar por lugar, primer pintado por tramo. Cambios presentados una vez (`stageSeen`).

Physica, Bitland y Arithmos: **contrato documentado, integración pendiente** (otras ramas y orígenes). Sus
artefactos muestran sólo ambiente propio, sin hitos inventados.

## Pendientes externos (no son errores de implementación)

- URLs confirmadas de redes de Proyecto Roxana y de Manuel Botto (`src/escuela/social.js`; hoy no se muestra ninguna).
- Novedades reales (`public/escuela/novedades.json` sólo tiene un ejemplo de desarrollo, invisible en producción).
- Canal de videos/explicaciones (`src/escuela/videos.js`) y cinemáticas faltantes.
- Dónde y bajo qué origen se publican Physica, Bitland y Arithmos (para leer su progreso).
- Derechos de assets generados antes de este loop: estatua (Meshy), atlas del mapa y alfombra (ImageGen) — ver `ASSETS.md`.
- Medición en teléfono real y métricas de campo.

## Riesgos y limitaciones conocidas

- Arte abierto: sprites 2D de visitantes al fondo de algunos primeros planos (estilo del juego sobre escena 3D); protoboard y soldador simples; Física, Programación y Matemática con interiores sin trabajar. (Vereda dentada y setos facetados: corregidos en c12.)
- La bruma de tarde sigue beige oliva; las colinas quedan fuera del encuadre maestro.
- bfcache real, sonido escuchado y memoria de GPU: NO VERIFICADOS.
- El ritmo de las animaciones se revisó con tiras de cuadros (≈11 fps), no con video.
- La vista previa de entrada de Bitland usa un casco de RV que puede no coincidir con el canon que está construyendo el agente de Bitland: está rotulada como «boceto, puede cambiar».
