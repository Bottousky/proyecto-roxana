# Rendimiento de la home — mediciones de laboratorio

Indicios, no medición de campo (brief §11): sin datos de visitas reales no hay p75 de LCP/INP/CLS.

## Ciclo 6 · 2026-10-06 · build de producción (`vite build` + `vite preview`)

Método: `node scripts/home-perf.mjs '<url>' <salida.json>` — Chrome 141 headless (ANGLE Metal), perfil aislado,
`--expose-gc`. Host: Apple M2, 8 núcleos, 16 GB. **Condición:** la GPU estaba compartida con dos partidas
automatizadas de otros agentes (`playthrough.mjs`); los números son un piso, no un techo. Headless sincroniza a
60 Hz: no se mide por encima de 60 FPS.

| Viewport | FCP / LCP | CLS | Campus listo | Reposo (8 s) | Sala abierta (5 s) | Tras 10 ciclos |
|---|---|---|---|---|---|---|
| 1440×900 DPR 1 | 252 ms | 0 | 2,0 s | 60,1 FPS · p95 16,7 · p99 16,8 ms · 0 >33 ms | 60,2 FPS · p99 16,8 | 60,4 FPS |
| 390×844 DPR 2 (emulación, **no** teléfono real) | 84 ms | 0 | 1,7 s | 60,1 FPS · p99 16,8 | 60,2 FPS | **16,4 FPS · p50 66,6 · p99 83,4 ms · 81/82 >33 ms** |

- **LCP** es la imagen fija del campus (`public/escuela/campus-tarde.jpg`, 140 KB) que pinta antes del 3D.
- **Corrección (ciclo 7, por la revisión independiente):** la versión anterior de este documento ponía «—» en
  «Tras 10 ciclos» para 390×844 y STATE afirmaba 60 FPS tras los ciclos. El JSON (`evidence/c06/perf-390.json`)
  registraba 16,4 FPS. El error fue de reporte: el resumen impreso omitía `idleAfter`. Se investiga abajo.
- **Fugas:** 10 ciclos de cuatro salas + Novedades + gesto de artefacto: entidades 302 → 302, heap JS 56 → 31 MB
  tras GC. Texturas de GPU no expuestas en la build de release (`device.textures` = null): **memoria de GPU no verificada; no se puede afirmar «sin fugas»**.
- **Draw calls por cuadro:** 856–1233 según el estado (incluye sombra, SSAO y pases de postproceso). Alto para
  móvil medio: candidato a presupuesto (ver abajo). Triángulos: no expuestos en release.
- **INP:** no medido (no hay interacción real de usuario en laboratorio). Selección y paneles responden en el mismo
  cuadro en el QA de interacción, sin bloqueos.

## Transferencia inicial (etapa 0, sin compresión de transporte)

| Antes del ciclo 6 | Después |
|---|---|
| 6,74 MB · 24 recursos | **5,30 MB · 19 recursos** |

Ahorros: sprites de los visitantes de Ohmdal se descargan sólo al llegar a su etapa (~765 KB); estandarte de
Ohmdal en copia al tamaño en que se dibuja (692 → 151 KB).

Mayores restantes: chunk compartido del motor + contenido del juego 2,17 MB (579 KB gzip), estatua GLB 1,28 MB,
`materials.webp` 571 KB, `trees.webp` 441 KB.

## Presupuestos propuestos (a confirmar con un móvil real)

- Transferencia inicial ≤ 4,5 MB (sin compresión) / interactivo ≤ 3 s en escritorio objetivo.
- Draw calls ≤ 600 en perfil «calidad baja» (sin SSAO, sombras 2048): **sin medir todavía**.
- Siguientes palancas, en orden de beneficio/riesgo: cuantizar y decimar la estatua (Draco/meshopt no está en el
  proyecto: requiere evaluar), separar del chunk de la home el contenido del juego que sólo usa el Anfiteatro,
  fusionar remates/artefactos estáticos con su techo por material.

## Ciclo 7 · draw calls por perfil (build, 1440×900)

Interiores, pisos y trofeos de cada edificio dejan de dibujarse mientras su techo los tapa (no cambia la imagen).

| Perfil | Antes: vista / tras ciclos | Después: vista / tras ciclos |
|---|---|---|
| Alta (SSAO, sombras 4096, MSAA 4×) | 1231 / 856 | **927 / 614** |
| Baja (sin SSAO, sombras 2048, DPR ≤ 1,25) | 882 / 685 | **642 / 479** |

FPS de esta corrida **no válidos**: había cuatro partidas automatizadas de otros agentes en la misma GPU (≈36 FPS
en ambos perfiles, por contención). La corrida previa, con menos carga, dio 60 FPS en baja y 47,6 en alta.
Repetir con la GPU libre. El perfil bajo es el predeterminado en pantallas táctiles de tamaño teléfono
(`defaultQuality` en `progress.js`); la elección del usuario se conserva.
