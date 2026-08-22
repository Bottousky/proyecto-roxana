# Protocolo de QA 3D

## Matriz mínima

- Desktop: 1440×900.
- Mobile: 390×844.
- Referencia aprobada.
- Render actual.
- Comparación lado a lado.
- Dos ángulos adicionales para un volumen importante.

Usar cámara, seed y estado reproducibles. Esperar la carga de assets y capturar errores de consola antes de aprobar.

## Scorecard

| Categoría | Gate |
|---|---:|
| Composición y cámara | 4/5 |
| Escala humana | 4/5 |
| Silueta/arquitectura | 4/5 |
| Materiales | 4/5 |
| Iluminación | 4/5 |
| Microdetalle e identidad | 3/5 |
| Legibilidad de interacción | 4/5 |
| Rendimiento mobile | 3/5 |
| Rendimiento desktop | 4/5 |
| Estabilidad/tests | 4/5 |

No promediar para esconder un fallo obligatorio.

## Automatización

1. Servir la app o el build local.
2. Abrir con Playwright o el mecanismo de Launch/verificación del runtime.
3. Esperar que desaparezca el estado de carga.
4. Capturar consola, viewport y estado reproducible.
5. Leer métricas expuestas por el runtime (`PlayCanvas` stats/snapshot en Ohmdal, `window.__roxanaSchool3D` o `renderer.info` sólo para experiencias Three.js heredadas).
6. Guardar salidas temporales en `output/playwright/` o el staging definido por la tarea.
7. Versionar sólo baselines aprobadas y evidencia deliberada.

Cuando se use PlayCanvas Editor MCP, la validación debe incluir viewport + Launch + logs/runtime state; inspeccionar la escena fuente no alcanza.

## Reporte

```yaml
performance:
  profile: mobile-medium
  viewport: 390x844
  fps_p50: null
  fps_p10: null
  frame_time_ms_p95: null
  draw_calls: null
  triangles: null
  geometries: null
  textures: null
  transferred_assets_mb: null
  largest_assets: []
```

Toda revisión enumera la diferencia principal, la corrección prioritaria y el riesgo de rendimiento. Sin captura y métricas, la escena queda `review-required`.
