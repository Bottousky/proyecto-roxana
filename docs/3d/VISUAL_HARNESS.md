# Roxana 3D — Visual Harness cross-runtime

**Estado:** contrato de producción.  
**Objetivo:** que un agente pueda observar, medir y criticar lo que construyó antes de pedir revisión humana.

Este harness no pertenece a Three.js ni a PlayCanvas. Es un contrato de test visual que cada runtime implementa con sus APIs.

## 1. Principio

```text
BUILD
  ↓
RUN
  ↓
SET DETERMINISTIC STATE
  ↓
CAPTURE MULTI-VIEW
  ↓
MEASURE
  ↓
CRITIC
  ↓
FIX
  ↺
```

Un build verde no autoriza claims `premium`, `AAA-like`, `showcase` o `final`.

## 2. Hooks comunes

Cada experiencia 3D que alcance art-pass debe exponer, durante QA/dev, un contrato equivalente a:

```ts
window.__ROXANA_VISUAL_TEST_HOOKS__ = {
  seed(value: number): void,
  setState(name: string): void,
  setCamera(name: string): void,
  setPausedForScreenshot(paused: boolean): void,
  setReducedMotion(enabled: boolean): void,
  hideDebugUi(hidden: boolean): void,
  setPostProcessing(enabled: boolean): void,
  getDiagnostics(): object,
};
```

No es obligatorio que producción pública exponga estos hooks. Pueden quedar gated por build/dev flag.

Si un runtime no usa random, partículas o post, la función correspondiente puede ser no-op documentado; no inventar simulación sólo para cumplir la interfaz.

## 3. Determinismo

Antes de una captura:

1. seed fijo cuando exista aleatoriedad;
2. cámara nombrada;
3. estado de mundo nombrado;
4. tiempo/animación pausado o estabilizado cuando el movimiento genere flakes;
5. debug UI oculto salvo que sea el objeto del test;
6. assets, fuentes y primer frame completamente cargados;
7. viewport fijo;
8. consola y page errors capturados.

Una baseline no sirve si cada corrida captura otra cámara, otro frame o otra distribución de props.

## 4. Vistas mínimas — Plaza de Ohmdal

El primer art pass debe registrar como mínimo:

| ID | Vista | Propósito |
|---|---|---|
| `portal-arrival` | llegada desde Portal | composición inicial y lectura del lugar |
| `workshop-approach` | aproximación al Taller | escala, vida y affordance |
| `ohm-landmark` | pedestal/Ohm desde circulación principal | hero landmark |
| `omega-gate` | Puerta Ω desde Plaza | sightline y destino |
| `plaza-wide` | vista amplia elevada sólo QA | distribución/densidad, no cámara jugable |
| `active-play-desktop` | cámara real de juego | calidad player-facing |
| `active-play-mobile` | cámara real mobile | legibilidad/performance |
| `no-post` | misma vista sin post | detectar si fog/bloom esconden geometría/materiales pobres |

Agregar vistas sólo si protegen una superficie valiosa. No crear 40 screenshots por reflejo.

## 5. Qué medir

Guardar, cuando el runtime lo permita:

```yaml
browser:
  renderer: null
  vendor: null
  software_rendered: null
performance:
  fps_p50: null
  fps_p10: null
  frame_time_ms_p95: null
render:
  draw_calls: null
  triangles: null
  meshes_or_geometries: null
  materials: null
  textures: null
assets:
  transferred_mb: null
  largest_assets: []
errors:
  console: []
  page: []
```

### Regla GPU

No presentar FPS headless como evidencia de hardware si Chromium cayó en SwiftShader/software rendering. Registrar `renderer`, `vendor` y `software_rendered`; en software, FPS queda informativo/no comparable. La corrección visual y los screenshots siguen pudiendo ser útiles.

## 6. Scorecard Roxana

Escala 0–3 por categoría:

- `0` placeholder/debug;
- `1` prototipo estilizado;
- `2` premium web coherente;
- `3` showcase/memorable.

Categorías:

1. dirección artística;
2. composición/sightlines;
3. arquitectura y siluetas authored;
4. hero landmarks/interactables;
5. materiales/texturas;
6. iluminación/exposición/profundidad;
7. vida ambiental/VFX/motion;
8. UI/legibilidad de interacción;
9. performance y evidencia técnica.

Para declarar **premium web**:

- ninguna categoría player-facing por debajo de 2;
- no automatic failure;
- desktop + mobile capturados cuando ambos están en scope;
- diagnostics del renderer presentes;
- baseline `no-post` legible;
- fresh-eyes/adversarial review ejecutado.

## 7. Automatic failures

Cualquiera de estos bloquea `premium/AAA-like`:

- screenshot dominado por primitivas de blockout;
- mundo mayormente cajas estiradas/planos vacíos;
- hero landmark hecho de primitivas + glow;
- fog/oscuridad/bloom tapando falta de forma/material;
- assets importados sin escala/orientación verificadas;
- ausencia de screenshot active-play;
- errores de consola relevantes;
- no hay métricas después de un cambio visual grande;
- UI corta texto, tapa affordances o falla safe area mobile;
- performance juzgada sólo por sensación;
- FPS de SwiftShader reportado como GPU real.

## 8. Fresh-eyes review

El constructor no debe ser el único juez.

Preferencia:

1. pasar **todas** las capturas canónicas + scorecard + métricas a un reviewer sin contexto de implementación;
2. pedir puntuación independiente y riesgos;
3. reconciliar tomando el score menor salvo evidencia concreta.

Para Ohmdal, el reviewer preferido es Gemini/Antigravity por la lane read-only del
harness. Task canonical:

```text
agent-work/tasks/gemini/ohmdal-plaza-visual-review.md
```

Invocación:

```bash
npm run agent:gemini -- \
  --task agent-work/tasks/gemini/ohmdal-plaza-visual-review.md \
  --out agent-work/reports/gemini/ohmdal-plaza-visual-review.md \
  --model gemini-3.1-pro-high \
  --effort high
```

Confirmar el slug con `agy models`; si cambió, usar el Gemini Pro/High vigente.
El peer no modifica el repo; Codex verifica y aplica fixes.

Si no hay reviewer disponible, hacer revisión adversarial: por cada categoría escribir primero el argumento más fuerte de por qué merece `1`, y recién después asignar score.

Nunca seleccionar sólo las screenshots más lindas para el reviewer.

## 9. Playwright

El harness debe apoyarse en Playwright o equivalente para:

- desktop/mobile viewport;
- consola/page errors;
- espera de readiness;
- selección de estado/cámara por hooks;
- screenshots deterministas;
- baseline/diff cuando la escena ya sea estable.

Baselines de screenshot se agregan sólo cuando el art state merece protección. Durante blockout, captura fresca + scorecard alcanza.

## 10. Aplicación cross-Roxana

- **Ohmdal / PlayCanvas:** diagnostics desde PlayCanvas stats/API propia.
- **Instituto / Three.js:** `renderer.info` + hooks equivalentes.
- **Physica / Babylon:** engine/scene instrumentation equivalente.
- Otros mundos adoptan el contrato sólo si usan render visual suficientemente complejo.

El harness uniforma **evidencia**, no engines.

## 11. Fuentes de diseño del contrato

Inspiración técnica revisada, no dependencias runtime:

- https://github.com/majidmanzarpour/threejs-game-skills — visual harness, scorecard, deterministic hooks, browser/canvas QA.
- https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills — visual validation, no-post baseline y sistemas gráficos reproducibles.

No instalar sus directors/routers en Roxana. Extraer únicamente mecanismos/checklists aplicables.