# World Authoring · Ohmdal Godot Spike

> Cómo otro agente diseña, modifica y regenera el mundo de Ohmdal **sin tocar tiles manualmente**.

## TL;DR

1. Edita `world/ohmdal_plaza.world.json` (el **WorldSpec**).
2. Ejecuta el proyecto: `MCP project_run mode=custom scene="res://world/ohmdal_plaza.tscn"`.
3. Inspecciona: `MCP game_manage get_scene_tree` o `editor_screenshot`.
4. Para Web export: `godot --export-debug Web` (usa `host/`).

No hace falta tocar `.tscn`, `.gd` ni colocar nodos manualmente.

## Capas

```
WorldSpec (JSON)
   ↓
WorldBuilder (GDScript determinista)
   ↓
Scene tree semántico:
   OhmdalPlaza / WorldRoot
     ├── Environment (Ground, Zones, Paths)
     ├── Landmarks (PortalOmega, PlazaCentral, LumenWorkshop, OhmGate, Walls)
     ├── Decor (Lamps, Gardens, PlazaTrees, Benches, Signs, Fences)
     ├── Characters (Player, Edda, Lumen)
     ├── Interactions (Area2D por NPC/landmark)
     └── Navigation (NavRegion con hueco para edificios)
   ↓
Runtime / MCP / Web bridge / Save
```

## Coordenadas

Sistema centrado en `(0, 0)` con unidades virtuales.

| Eje | Dirección | Signo |
|-----|-----------|-------|
| X | Este | `+x` |
| X | Oeste | `-x` |
| Y | Sur | `+y` |
| Y | Norte | `-y` |

`Portal Omega` está al sur → `y` positivo (≈ 520).
`Puerta de Ohm` está al norte → `y` negativo (≈ -520).

## Anatomía de un Landmark

```json
"lumen_workshop": {
  "kind": "building",
  "name": "Taller de Maese Lumen",
  "position": { "x": 720, "y": 40 },
  "size": { "width": 280, "height": 200 },
  "color": "#caa97a",
  "roof_color": "#7a4a2c",
  "tags": ["landmark", "workshop"],
  "interior_scene": "LumenInterior"
}
```

| Campo | Requerido | Significado |
|-------|-----------|-------------|
| `kind` | sí | `portal`, `plaza`, `building`, `gate`, `landmark`, `npc_marker` |
| `name` | sí | etiqueta legible |
| `position` | sí | `{x, y}` en unidades |
| `size` | según kind | `{width, height}` |
| `color` / `border_color` | no | tinte principal |
| `glow_color` | no | acento brillante |
| `tags` | no | tags narrativos/pedagógicos |
| `interior_scene` | no | ruta a .tscn para transición |

## Caminos

```json
{
  "id": "path_plaza_to_workshop_main",
  "kind": "primary_axis",
  "from": "plaza_central",
  "to": "lumen_workshop",
  "width": 110,
  "color": "#c4ad7b",
  "via": [
    { "x": 410, "y": 0 },
    { "x": 520, "y": 0 },
    { "x": 640, "y": 40 }
  ]
}
```

Si `via` está vacío, el camino se construye recto entre `from` y `to`.

## Zonas

Zonas decorativas (no transitables ni bloqueantes, sólo etiquetas visuales y áreas de spawn para props).

```json
{
  "id": "garden_northeast",
  "kind": "garden",
  "bounds": { "x": 240, "y": -240, "width": 460, "height": 280 },
  "tags": ["outdoor", "decor"]
}
```

`bounds.x/y` es la esquina **inferior-izquierda**; el builder la centra automáticamente.

## Decoración procedural

```json
"decor": {
  "lamp_count": 22,
  "bench_count": 10,
  "tree_count": 40,
  "tree_color_dark": "#3f6a45",
  "tree_color_light": "#5d8a55",
  "sign_count": 5,
  "fence_count": 7
}
```

Determinista vía `seed`. Mismo seed + mismo spec → mismo mundo.

## Spawns

```json
"spawn": {
  "player": { "x": 0, "y": 580 },
  "edda":    { "x": 0, "y": 320 },
  "lumen":   { "x": 720, "y": 70 }
}
```

## Cómo agregar un landmark nuevo

Ejemplo: añadir `PlazaDelEste` (otro landmark de plaza) en (900, -100).

1. Edita `world/ohmdal_plaza.world.json`, agrega en `landmarks`:
   ```json
   "plaza_del_este": {
     "kind": "plaza",
     "name": "Plaza del Este",
     "position": { "x": 900, "y": -100 },
     "size": { "width": 200, "height": 120 },
     "color": "#d9c79a"
   }
   ```
2. (Opcional) Agrega un camino nuevo que conecte la plaza central con plaza_del_este:
   ```json
   { "id": "path_to_plaza_del_este", "from": "plaza_central", "to": "plaza_del_este", "width": 70, "via": [...] }
   ```
3. Ejecuta: `MCP project_run` → el builder materializa el nuevo nodo bajo `Landmarks/PlazaDelEste`.

## Cómo mover LumenWorkshop 200 unidades al este

Ejemplo concreto pedido en la spec.

1. Abre `world/ohmdal_plaza.world.json`.
2. Cambia el bloque `lumen_workshop`:
   ```json
   "lumen_workshop": {
     "kind": "building",
     "name": "Taller de Maese Lumen",
     "position": { "x": 920, "y": 40 },   // era 720
     ...
   }
   ```
3. Cambia `lumen_npc.position`:
   ```json
   "lumen_npc": { "npc_id": "lumen", "position": { "x": 920, "y": 70 } }
   ```
4. Actualiza `spawn.lumen`.
5. Si quieres que las rutas principales sigan funcionando, deja `paths[].from="plaza_central", to="lumen_workshop"` — el builder recalcula `via` a partir de las nuevas posiciones si dejas `via` vacío, o lo deja si pones uno nuevo.
6. Si necesitas ampliar el mundo para que el taller entre en bounds:
   - Incrementa `size.width`.

7. Ejecuta `MCP project_run`. El builder regenera el árbol, valida conectividad, y el runtime carga todo.

Archivos modificados: **1** (`ohmdal_plaza.world.json`). Ni un solo `.tscn` ni `.gd` tocado a mano.

## Cómo cambiar el tamaño de la plaza

Edita `landmarks.plaza_central.size`:

```json
"plaza_central": {
  "kind": "plaza",
  "name": "Plaza Central",
  "position": { "x": 0, "y": 0 },
  "size": { "width": 1200, "height": 600 }   // antes 820x420
}
```

Listo. Las rutas que apuntan a `plaza_central` siguen funcionando porque `from`/`to` se resuelven contra la nueva posición.

## Cómo agregar un camino

Edita `paths`:

```json
{
  "id": "path_plaza_to_secret_garden",
  "kind": "secondary_axis",
  "from": "plaza_central",
  "to": "secret_garden",
  "width": 70,
  "color": "#c4ad7b",
  "via": [
    { "x": 0, "y": 100 },
    { "x": 100, "y": 180 },
    { "x": 200, "y": 200 }
  ]
}
```

Necesitas que `secret_garden` exista como landmark o como zona.

## Cómo cambiar el seed

```json
{ "seed": 9999 }
```

Mismo seed + mismo spec → mismo mundo. Diferente seed → distinto mundo procedural.

## Cómo regenerar el mapa en runtime

Hay dos vías:

- **Cerrar y reabrir el juego**: el `_ready()` de `WorldRoot` (script `ohmdal_plaza.gd`) relee `world/ohmdal_plaza.world.json` y reconstruye.
- **Tecla R**: acción `rebuild_world` (key `R`) → llama `WorldRoot.rebuild()` sin cerrar el proceso.

## Cómo validar conectividad y landmarks

`WorldBuilder.validate_connectivity(parent)`:

```gdscript
var b := WorldBuilder.new()
var r := b.validate_connectivity(parent)   # {ok, routes[]}
```

Devuelve `ok=true` cuando ningún edificio bloquea el punto medio de las rutas Portal↔Plaza, Plaza↔Workshop, Plaza↔OhmGate. En el log de runtime se imprime en cada build.

Los **tests** están en `res://tests/test_world.tscn` y se ejecutan con:

```bash
godot --headless --quit-after 60 res://tests/test_world.tscn
```

Salida esperada: `=== TESTS === passed=33 failed=0`.

## Cómo exportar a Web

1. Asegúrate de tener los templates de exportación web en `Godot/export_templates/4.7.1.stable/`.
2. Ejecuta:

```bash
godot --headless --export-debug Web
```

3. La salida queda en `host/`:
   - `ohmdal.html`, `ohmdal.js`, `ohmdal.wasm`, `ohmdal.pck`
4. Abre `host/index.html` en un servidor estático (no `file://`).

## Bridge Godot ↔ Web

Eventos **Godot → Web**:

```text
game.ready              { world, scene, discoveries, flags }
world.loaded            { world, scene, landmarks[], connectivity_ok, seed }
player.position.changed { x, y }
npc.talked              { npc, first_time }
discovery.unlocked      { id, label }
objective.completed     { id }
interior.entered        { interior }
portal.entered          { portal }
ohm_gate.locked         { reason }
ohm_gate.opened         { }
ui.open_bitacora        { }
save.request            { full state }
heartbeat               { player, discoveries }
game.paused             { }
game.resumed            { }
game.snapshot           { full state }
game.state_loaded       { full state }
```

Comandos **Web → Godot** vía `window.roxanaBridge.send(cmd, payload)`:

```text
pause
resume
load_state        { state }
set_flag          { name, value }
teleport          { position: {x, y} }
request_snapshot
```

`window.roxanaBridge` se enchufa en el iframe `ohmdal.html` automáticamente cuando éste carga.

## Save portable

`SavePortable.serialize(state)` produce JSON plano:

```json
{
  "version": 1,
  "world": "ohmdal",
  "scene": "plaza",
  "player": { "x": 0, "y": 540 },
  "flags": { "edda_met": true, ... },
  "discoveries": [ { "id": "electric_current", "label": "..." } ]
}
```

El host `index.html` lo persiste en `localStorage["roxana:ohmdal:save"]` y lo reenvía a Godot en el próximo arranque con `load_state`.

Godot **no** maneja autenticación ni plataforma. Todo eso vive en el shell web.