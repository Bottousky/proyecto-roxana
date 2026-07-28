# Métricas de runtime — escuela 3D

Fecha: 2026-07-25  
Navegador: Chromium headless, Vite preview de producción.

| Vista | Viewport | Estado | FPS | Draw calls | Triángulos |
|---|---:|---|---:|---:|---:|
| escuela completa | 1920×1080 | initial | 60 | 51 | 298410 |
| escuela completa | 1440×900 | initial | 60 | 51 | 298410 |
| escuela completa | 390×844 | initial | 60 | 35 | 298394 |
| escuela completa | 1920×1080 | electronics-arc-1-complete | 60 | 58 | 306362 |
| foco Electrónica | 1920×1080 | initial | 60 | 41 | 233506 |
| foco Electrónica | 1920×1080 | electronics-arc-1-complete | 60 | 48 | 241458 |

Los contadores provienen de `renderer.info` con el acumulado de la escena y los pases de
postproceso. Los 60 FPS son el techo observado en esta sesión automatizada; no sustituyen
un perfil en GPU móvil física.

## Peso y compresión

- `school-overview.glb`: 1.655 MiB, 236012 triángulos, 40 primitivas.
- `electronics-room.glb`: 0.434 MiB, 54964 triángulos, 14 primitivas.
- Draco reduce 80.9 % el overview y 79.8 % el aula.
- El slice usa iluminación horneada en vertex colors; no incorpora texturas raster, por
  lo que KTX2 no aplica a estos GLB.

## Validaciones

- Consola del navegador: 0 errores y 0 warnings.
- Carga de GLB y decodificador Draco: respuestas HTTP 200.
- Khronos `gltf-validator`: 0 errores y 0 warnings en ambos GLB.
- Capturas: `artifacts/validation/`.
- Producción Vercel: `https://instituto-roxana.vercel.app/`, con 0 errores de consola
  en portada, editor, `/jugar` y `/ohmdal`.

## Lectura

La escena cumple el objetivo interactivo de 60 FPS en el entorno de prueba, pero el
overview completo excede el presupuesto artístico inicial de 180k triángulos. El próximo
paso de optimización debe introducir LOD o simplificación en arquitectura y vegetación
antes de aumentar la densidad visual.
