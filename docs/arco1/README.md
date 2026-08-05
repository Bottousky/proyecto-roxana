# Canon del Arco I de Ohmdal

Dirección visual y contenido del **golden slice**: Portal → Plaza → Taller → Puerta → Manantial.

Todo lo de acá son **decisiones tomadas**. Ninguna se redefine para que un resultado pase: si el
arte, la escena o la interacción no cumplen, se corrige el arte, la escena o la interacción.
Cambiar una de estas decisiones es una decisión aparte, y consciente.

## Por dónde empezar

| Si vas a… | Leé |
|---|---|
| producir arte de cualquier tipo | [`IDENTITY.md`](IDENTITY.md) y [`LEGAL_REFERENCES.md`](LEGAL_REFERENCES.md) |
| construir una escena | [`SCENE_INVENTORY.md`](SCENE_INVENTORY.md) → [`GOLDEN_FRAMES.md`](GOLDEN_FRAMES.md) → [`SHOT_DECK.md`](SHOT_DECK.md) |
| tocar color, luz o la hora del día | [`COLOR_SCRIPT.md`](COLOR_SCRIPT.md) |
| construir una interacción educativa | [`CONTENT_V2.md`](CONTENT_V2.md) |
| meter un asset al juego | [`ASSET_PIPELINE.md`](ASSET_PIPELINE.md) |
| saber cuánto podés gastar | [`SCENE_BUDGETS.md`](SCENE_BUDGETS.md) |
| sacar un puzzle del modal a pantalla completa | [`diseno-bancos-ohm-lumen.md`](diseno-bancos-ohm-lumen.md) |

## Qué fija cada documento

- **`IDENTITY.md`** — las seis materias de Ohmdal, el paso de tarde a crepúsculo, la silueta de
  cada región, y diez reglas verificables. Un set que no se pueda describir con esas seis palabras
  no es Ohmdal.
- **`LEGAL_REFERENCES.md`** — *DQ III HD-2D* es referencia de proceso, no plantilla. Qué se puede
  observar y describir, qué nunca se toma, y qué procedencia necesita un asset para entrar.
- **`SCENE_INVENTORY.md`** — las cinco escenas causales, con anclajes, cámara, beats, hora y
  duración medida. Sólo tres cargan un acto del jugador.
- **`GOLDEN_FRAMES.md`** — los ocho frames que deciden si el slice se ve. Qué tiene que ser legible.
- **`SHOT_DECK.md`** — dónde va cada cosa en el cuadro: safe areas desktop y mobile, zona crítica.
- **`COLOR_SCRIPT.md`** — qué comunica el cambio de hora, dónde ocurre, y qué no puede hacer el
  color para tapar un problema de contraste.
- **`CONTENT_V2.md`** — las seis fichas educativas, la red del slice y los órdenes de diagnóstico
  válidos. Ningún beat sin ficha puede recibir una interacción evaluable.
- **`SCENE_BUDGETS.md`** — JS, texturas, audio, memoria, draw calls y tiempo de carga por escena.
- **`ASSET_PIPELINE.md`** — el orden obligatorio para producir cualquier asset.

## Los datos medidos

Los `.json` son mediciones reales, no estimaciones. Los documentos los citan como fuente:

| Archivo | Qué mide |
|---|---|
| [`palette-blockout.json`](palette-blockout.json) | HSL, luma WCAG y deltas de los colores actuales |
| [`route-timing.json`](route-timing.json) | distancias y tiempos de recorrido entre anclajes |
| [`cards-audit.json`](cards-audit.json) | verificación por ejecución de las seis fichas educativas |
| [`js-budget.json`](js-budget.json) | peso del bundle por módulo |
| [`runtime-budget.json`](runtime-budget.json) | draw calls, triángulos, memoria y carga por escena |
| [`hud-rects.json`](hud-rects.json) | rects del HUD contra las safe areas |

**Todos son de blockout**, sin texturas ni materiales producidos. Cuando exista arte real hay que
volver a medir con el mismo método.

## Los dos huecos conocidos

1. **E2 · Activación de Ohm no tiene encuadre ni microinteracción.** Es el momento en que el
   circuito se completa y Ohm despierta —el corazón emocional del slice— y es la única escena sin
   anclaje de ruta, sin golden frame y sin sujeto protegido. Tampoco está escrito qué hace el
   jugador con las manos para que ocurra. Ver [`SCENE_INVENTORY.md`](SCENE_INVENTORY.md) §7 y
   [`CONTENT_V2.md`](CONTENT_V2.md) §9. **Mientras siga así, E2 no se produce.**
2. **El layout mobile incumple las safe areas.** 48,0 % de franja libre contra 60,1 % de contrato,
   con los tres defectos medidos en [`SHOT_DECK.md`](SHOT_DECK.md) §3.

Cada documento cierra con su propia sección de pendientes.
