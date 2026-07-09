# Auditoría del Arco I con salas pintadas (integración de Codex)

Fecha: 2026-07-07 · Auditor: Orquestador (Fable)
Alcance: `src/jugar/roomScenes.ts` (nuevo), diffs de `ExplorationScene.ts` / `rooms.ts`,
assets `assets/ohmdal/rooms/**`, docs de Codex (`mapa-jugabilidad-*`, `direccion-ambiental-*`),
más capa de puzzles (estética + accesibilidad de teclado).

Método: cruce estático ROOMS × ROOM_SCENES (puertas, entries, things, flags, walkable),
validación en vivo sobre la escena Phaser (`window.__game`, sondas de `collides()` y
`things` reales) y revisión visual de los PNG generados. Build ✓, tests ✓.

---

## A. Bloqueadores (rompen el juego o la progresión)

### A1. El juego no arranca: loader de Phaser clavado en 32/34 — **CORREGIDO (1 línea)**
Con los 21 fondos de sala, el preload encola **34 archivos**. Phaser 4.1 con
`maxParallelDownloads` default (32) **nunca despacha los archivos que exceden el
límite inicial**: `trees-bushes-16.png` y `town-props-16.png` quedan `FILE_PENDING`
para siempre, `create()` no corre y la pantalla queda en negro. Reproducible al 100 %.

Workaround aplicado y verificado en `src/experiences/ohmdal/topdownRuntime.ts`:
`loader: { maxParallelDownloads: 64 }`. A futuro conviene **cargar los fondos por
sala bajo demanda** (ver F1), que además arregla el peso de la carga inicial.

### A2. `terraces_top`: la salida a la plaza es inalcanzable → soft-lock
`ROOMS.terraces_top` tiene puerta a `plaza` en `{145,0,120,26}` pero el perfil de
escena **no tiene ancla `plaza`**; el walkable (`x355–625` / `y70+`) nunca toca ese
rect (sonda en vivo: overlap imposible). El jugador que baja a las Terrazas **no puede
volver** hasta terminar U4/U5. Además el perfil tiene un ancla y entry **fantasma
`forge_hall`** (`{445,0,115,80}`) para una puerta que no existe en ROOMS — ese es el
vano norte real del arte. Fix: anclar `plaza` a `{445,0,115,80}` y borrar lo fantasma.

### A3. `plaza`: la puerta «Camino a la Forja» está dentro de sólidos → U3 inaccesible
Ancla `forge_yard {905,35,55,110}`: toda posición que la toca está cubierta por la
muralla norte (`{535,0,425,58}`) o el edificio del taller (`{812,58,148,167}`).
Verificado numéricamente incluso con el inflado de ±14 px de las puertas. Tras
completar U2 el jugador **no puede entrar a la Forja**. Nota de fondo: el arte de la
plaza solo tiene 4 vanos (N puerta, S aula, O castillo, E taller) — no existe vano
pintado ni para Forja ni para Terrazas (ver C1/C2, decisión de canon).

### A4. `lighthouse_lantern`: el cierre del Arco I no se puede disparar
`lago-negro` (720,245) — el hotspot que llama `cerrarArcoUno()` — queda a 215 px del
punto legal más cercano (x máx caminable = 505; alcance = 162). **Inalcanzable**
(verificado en vivo). Igual de inalcanzables: `farero-linterna` (745,280) y
`edda-linterna` (805,385). Fix: extender walkable con la balconada este o mover los
tres al lado caminable.

---

## B. Falsas hitboxes: la regla «todo prop no-personaje queda horneado»

En `ExplorationScene.buildChunk`:
```ts
const baked = placed?.baked ?? (sceneProfile
  ? !!sceneProfile.bakedThings?.includes(t.id) || !isCharacter   // ← el problema
  : t.baked);
```
En cualquier sala con perfil, **todo thing que no sea personaje se vuelve invisible y
no sólido**, esté o no pintado en el fondo. Consecuencias verificadas:

- **`campana` de la plaza**: tiene `sprite: prop_bell` pero se fuerza `baked:true` y
  **no hay campana en el PNG** → el ancla de U2 es aire interactivo (verificado en vivo:
  `baked:true, sprite:'prop_bell'`).
- **Casi todos los bancos de puzzle** son invisibles: banco-cadena, banco-ramales,
  banco-repartidor, banco-canal-tibio, banco-enfermería, banco-canal-largo,
  banco-forja-completa, banco-escalones, banco-reparto, banco-piedra-única,
  banco-escalera, banco-chispa, banco-reloj, banco-latido. Solo `lighthouse_bench`
  coincide de casualidad con una mesa pintada.
- Invisibles también: carteles del Consejo y atril (castle_gate), `martillo-forja` y
  `fuelle-forja` (¡las placas ENTREGA 32/16 de la lección de potencia!), `tablero-bus`,
  `castillo-encendido` (beat visual M8 perdido), `mirar-el-valle`.
- Al hornearse pierden `solid` → se atraviesa el lugar donde «están».

**Fix propuesto (motor, Delicado):** hornear SOLO lo explícito
(`bakedThings` / `things[id].baked`), conservar `solid` del def, y dejar `baked:false`
como escape para dibujar el prop procedural/sprite encima del fondo.

## C. Desalineaciones arte ↔ datos (por sala)

| Sala | Problema | Detalle |
|---|---|---|
| plaza | vano SO inexistente | walkable `{120,450,170,90}` + puerta Terrazas apuntan a muralla pintada sin arco |
| plaza | franja NE muerta | walkable `{780,25,…}` sube hasta y25 pero la muralla (colisión) cubre y0–58: banda inútil |
| castle_gate | carteles/atril invisibles | no están pintados; quedan prompts en aire |
| castle_gallery | `edda-galeria` (800,405) inalcanzable | x legal máx ≈ 702 (sonda viva), alcance 89 < dist 98 |
| castle_heart | `banco-repartidor` (180,315) fuera de walkable (x≥245) | alcanzable por radio, pero invisible y «flotando» fuera del piso |
| castle_heart | `edda-corazon` (820,405) inalcanzable | walkable x≤715 |
| forge_hall | martillo/fuelle en pared pintada | hotspots invisibles sobre muro; solo `lumbre` fue compuesta como prop |
| lighthouse_bench | `farero-taller` (735,205) dentro de colisión | NPC parado sobre estantería pintada |
| lighthouse_lantern | ver A4 | |
| terraces_top | spawn desde plaza (205,95) cae 5 px fuera de walkable | lo rescata el guard de spawn; alinear con la entrada real |

NPCs en general: los perfiles reubican props pero **no reubican personajes**, que
conservan coordenadas de la era greybox — varios quedan pegados a muros o sobre
mobiliario pintado. Recomendación: pasada de reposicionamiento por sala con la
tecla `H` (overlay verde/rojo/azul, ya implementada por Codex y funciona).

## D. Escalas y motor

- Perspectiva por Y (`scaleAt`) bien planteada; interiores 0.82–1, exteriores 0.48–0.7.
- **Hitbox del jugador clampeada a 0.65** mientras el cuerpo visual baja a 0.48 en salas
  `distant` → colisiona «más gordo» de lo que se ve en la parte alta. Menor, pero se nota
  en pasillos (ej. corredor x780–812 de la plaza).
- NPCs se escalan una sola vez al construirse; si caminan (`walksTo`) no re-escalan. Cosmético.
- Puertas: `entries` por sala de origen funcionan; el inflado ±14 px de triggers ayuda.
- `mosaico-corazon`, `lapuerta`, etc. alcanzables ✓. `reloj-parado` alcanzable ✓ (alcance
  por rect grande).

## E. Coherencia narrativa (revisión completa de la cadena U1→U5)

La secuencia de gates es **correcta y consistente** con guía de puzzles:
freno → puerta (frenoDone) → campana U2 (playedUnit2Intro) → castillo
(solvedBellPaths → metConsejera → cadena → ramales → corazón) → forja
(unit2Completed; canal tibio → enfermería → canal largo → nave) → terrazas
(unit3Completed; escalones → reparto → piedra única → escalera/predicción) → faro
(unit4Completed; chispa → río dormido → reloj → linterna → cierre).
Todos los flags de efectos existen en `state.ts` ✓. Textos en las salas: sin
vocabulario spoiler fuera de gates ✓. Dirección ambiental cumplida en el arte
(noche U1–U3/U5, atardecer U4) y estilo consistente entre las 20 salas ✓.

**Pero** la progresión física la rompen A2/A3/A4 (motor/datos, no guion).

Canon pendiente: la grilla canon pone la **Forja al OESTE** y en plaza sigue saliendo
al ESTE; y el arte de la plaza no tiene vanos para Forja/Terrazas (decisión del
Director: regenerar plaza con 2 vanos nuevos, o re-rutear esas conexiones desde otras
salas según la grilla).

## F. Rendimiento y assets

1. **Carga inicial pesada**: 21 fondos (~25 MB) en preload. Pasar a carga por sala
   (load on demand + vecinas) — además elimina la causa de A1 de raíz.
2. `plaza.png` y `puerta_*.png` son **1672×941 mostrados a 960×540** (reescalado no
   entero de pixel art → blur). Re-exportar a 960×540 exactos como el resto.
3. Nombres con `+` (`castle_gate+prop_…`) funcionan, pero son frágiles en hostings
   que decodifican `+` como espacio. Sugerencia: usar `--` en la próxima tanda.
4. El doc de Codex afirma «20 salas, 40 conexiones, 0 rutas bloqueadas», pero **no hay
   ningún test de conectividad en `tests/`** y el resultado es falso contra ROOMS
   reales (A2/A3). Falta un test real: flood-fill de walkable desde cada entry hasta
   cada puerta de ROOMS + alcance de cada thing + NPC dentro de walkable.

## G. Puzzles: estética y teclado (pedido del Director)

**Diagnóstico**: los bancos son paneles DOM planos (fondo `#131118`, bordes 1 px,
botones flat sans-serif) sobre un mundo pixel-art pintado nocturno — el salto de
lenguaje visual es total. Interacción 100 % click (no hay drags), diálogos ya
avanzan con teclado (Enter/Espacio/E) ✓; los bancos no tienen foco ni atajos.

**Propuesta estética (mantiene DOM = canon de arquitectura):**
1. *Kit UI pixel por CSS*: marco 9-slice (`border-image`) piedra+cobre generado con
   el mismo pipeline, textura de fondo del panel, botones biselados pixel con estados,
   fuente display pixel para títulos (con acentos: VT323/Pixelify) manteniendo cuerpo
   legible, paleta tomada de las salas (cobre `#c58a59`, ámbar `#e8c33a`, piedra).
2. *Backdrop pintado del banco*: 1 primer plano genérico de mesa de trabajo (o 1 por
   unidad, 5 imágenes) detrás del `bench-stage`, con oscurecido para contraste.
3. *Transición diegética* al abrir/cerrar el banco (reutilizar el patrón dolly de puertas).
4. Ajustar los SVG internos a la misma paleta y trazos.

**Propuesta de teclado:**
1. `openBench`: autofocus al primer control, focus-trap (Tab cíclico), `Escape` = Volver.
2. Helper en `puzzles/common.ts`: `makeInteractive(el, onActivate)` → convierte
   piedras/slots SVG/sockets en `<button>` o `tabindex=0` + Enter/Espacio.
3. `:focus-visible` con anillo cobre (doble uso: affordance visual).
4. Opcional: dígitos 1–9 como atajos de selección por orden visible.

---

## Plan de hitos propuesto (espera OK del Director)

| Hito | Contenido | Nivel / ejecutor |
|---|---|---|
| R1 | Motor: baked solo explícito + conservar solid + hitbox jugador coherente con escala. Mantener fix loader (hecho) | Delicado / sonnet |
| R2 | Datos: ancla plaza en terraces_top, borrar fantasma forge_hall, reposicionar NPCs/things fuera de walkable (lista §C), walkable balcón linterna | Estándar / sonnet-codex |
| R3 | Canon+arte (Director decide): vanos Forja/Terrazas de la plaza (¿regenerar plaza o re-rutear según grilla O?), prop pintado «banco de trabajo» reutilizable, campana pintada o sprite des-horneado | Diseño / Director+Orquestador |
| R4 | Test de conectividad real en `tests/` (ROOMS × ROOM_SCENES) | Mecánico / haiku-codex |
| R5 | Assets: fondos a 960×540 exactos, compresión, carga por sala | Estándar / codex |
| R6 | Bancos teclado: focus-trap + Escape + makeInteractive + focus-visible | Delicado (toca common) / sonnet |
| R7 | Reskin pixel del banco (CSS kit + backdrop) | Estándar / sonnet |

Cambio ya aplicado en esta auditoría (necesario para poder bootear):
`topdownRuntime.ts` → `loader: { maxParallelDownloads: 64 }` (+ comentario).
