# Protocolo de QA 3D

El contrato ejecutable de hooks deterministas, vistas canónicas, métricas y fresh-eyes review vive en [`VISUAL_HARNESS.md`](VISUAL_HARNESS.md). Este archivo resume el gate operativo.

## Matriz mínima

- Desktop: 1440×900.
- Mobile: 390×844.
- Referencia/baseline aprobada cuando exista.
- Render actual.
- Comparación lado a lado.
- Vistas canónicas del lugar/asset afectado.
- Una vista `no-post` para trabajo premium cuando postproceso esté en uso.

Usar cámara, seed y estado reproducibles. Esperar la carga de assets y capturar errores de consola antes de aprobar.

## Scorecard

Escala común Roxana 0–3 definida en `VISUAL_HARNESS.md`:

| Categoría | Gate premium-web |
|---|---:|
| Dirección artística | >=2 |
| Composición / sightlines | >=2 |
| Arquitectura / siluetas | >=2 |
| Hero landmarks / interactables | >=2 |
| Materiales / texturas | >=2 |
| Iluminación / exposición / profundidad | >=2 |
| Vida ambiental / VFX / motion | >=2 |
| UI / legibilidad de interacción | >=2 |
| Performance / evidencia técnica | >=2 |

No promediar para esconder un fallo obligatorio. Los `automatic failures` de `VISUAL_HARNESS.md` bloquean el claim aunque el promedio sea alto.

## Automatización

1. Servir la app o el build local.
2. Abrir con Playwright o el mecanismo de Launch/verificación del runtime.
3. Esperar que desaparezca el estado de carga.
4. Fijar estado/cámara/seed mediante `__ROXANA_VISUAL_TEST_HOOKS__` cuando esté implementado.
5. Capturar consola, viewport y estado reproducible.
6. Leer métricas expuestas por el runtime (`PlayCanvas` stats/snapshot en Ohmdal, `renderer.info` sólo para experiencias Three.js, instrumentation equivalente en Babylon).
7. Registrar renderer/vendor y si la sesión usa software rendering; no tratar SwiftShader FPS como GPU real.
8. Guardar salidas temporales en `output/playwright/` o el staging definido por la tarea.
9. Versionar sólo baselines aprobadas y evidencia deliberada.
10. Ejecutar fresh-eyes review o revisión adversarial antes de claims premium/showcase.

Cuando se use PlayCanvas Editor MCP, la validación debe incluir viewport + Launch + logs/runtime state; inspeccionar la escena fuente no alcanza.

## Reporte

```yaml
browser:
  renderer: null
  vendor: null
  software_rendered: null
performance:
  profile: mobile-medium
  viewport: 390x844
  fps_p50: null
  fps_p10: null
  frame_time_ms_p95: null
  draw_calls: null
  triangles: null
  geometries: null
  materials: null
  textures: null
  transferred_assets_mb: null
  largest_assets: []
errors:
  console: []
  page: []
```

Toda revisión enumera la diferencia principal, la corrección prioritaria y el riesgo de rendimiento. Sin captura, diagnostics y scorecard, la escena queda `review-required`.