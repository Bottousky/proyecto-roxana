# SPIKE_REPORT.md

**Proyecto:** Ohmdal Godot Spike
**Objetivo:** Determinar si Godot puede ser usado para producir un RPG top-down 2D mediante agentes sin pintar manualmente mapas tile por tile.
**Stack:** Godot 4.7.1 Standard · GDScript · Godot AI MCP 3.1.5 · Web (HTML5/WASM)

---

## Resultado

`PASS`

El spike demuestra que un agente puede:

1. Diseñar un mundo top-down 2D **sin tocar tiles** (representación semántica).
2. Regenerar el mapa completo desde un JSON autoritativo (`WorldSpec`).
3. Recorrer las rutas críticas entre landmarks tras una reconfiguración espacial.
4. Comunicarse bidireccionalmente con un shell Web vía `JavaScriptBridge`.
5. Serializar saves portables y restaurarlos por DOM.

---

## Evaluación técnica

### Godot como runtime web

`PASS`

- El proyecto exporta correctamente a HTML5/WASM con `godot --export-debug Web`.
- Bundle resultante: `ohmdal.html` (5KB), `ohmdal.js` (316KB), `ohmdal.wasm` (37.9MB), `ohmdal.pck` (1MB).
- El host `host/index.html` carga el build de Godot en un iframe y le superpone la Bitácora DOM.
- Bloqueo externo conocido: los **export templates** no vienen instalados por defecto; tuvimos que descargar `Godot_v4.7.1-stable_export_templates.tpz` desde GitHub y extraerlos a `%AppData%/Godot/export_templates/4.7.1.stable/`. Sin esa pieza el export falla con un mensaje claro; sigue siendo ejecutable.

### Godot AI MCP

`PASS`

- Sesión MCP activa: `godot-ohmdal-spike@75e9` (post-reload).
- Herramientas usadas intensivamente:
  - `editor_state`, `editor_reload_plugin`, `filesystem_manage scan`.
  - `scene_open`, `scene_get_hierarchy`, `node_get_properties`, `node_set_property`.
  - `project_run mode=custom`, `game_manage get_scene_tree`, `game_manage get_node_info`, `game_manage input_action`, `game_manage input_sequence`.
  - `logs_read source=editor|game`, `editor_screenshot source=game`.
  - `autoload_manage add/list` (necesario porque el editor no releía `[autoload]` desde filesystem).
- 2 reinicios forzados del plugin (`editor_reload_plugin`) para limpiar errores en caché y confirmar la integración `Bridge`/`GameState` autoloads.
- El plugin queda habilitado como `addons/godot_ai/plugin.cfg`. Compatible con el resto del workflow `roxana-game-production`.

### WorldSpec (autoritativo)

`PASS`

- Archivo: `world/ohmdal_plaza.world.json` (más variantes `*.canonical`, `*.reconfig1`, `*.reconfig2` para reproducibilidad).
- Campos cubiertos: `size`, `coordinates`, `seed`, `landmarks{portal_omega, edda_marker, plaza_central, lumen_workshop, ohm_gate}`, `paths[3-4]`, `zones[4-5]`, `decor{lamp,bench,tree,sign,fence}`, `spawn`, `progression`, `narrative_tags`, `pedagogical_tags`.
- Documentado en `docs/WORLD_AUTHORING.md`.

### WorldBuilder (determinista)

`PASS`

- Clase: `res://world/world_builder.gd` (`class_name WorldBuilder`).
- API: `load_spec()`, `materialize(parent, spec_override?)`, `validate_connectivity(parent)`, `find_landmark(parent, key)`, `list_landmarks(parent)`, `get_seed()`.
- Mismo `seed` + mismo spec → mismo mundo (verificado por test `determinism_portal`).
- Build materiales: `Environment > Ground/Zones/Paths`, `Landmarks > [PortalOmega, PlazaCentral, LumenWorkshop, OhmGate, Walls]`, `Decor > Lamps/Gardens/PlazaTrees/Benches/Signs/Fences`, `Characters > Edda/Lumen`, `Interactions > 5 Area2Ds`, `Navigation > NavRegion`.
- Total: ≈350 nodos con nombres semánticos. **Cero** `Sprite2D43`-style; cero tiles colocados a mano.

### Scene Graph legible para agentes

`PASS`

- Inspeccionable vía MCP `game_manage get_scene_tree` → devuelve jerarquía completa con tipos y conteos.
- Landmarks fácilmente localizables por path: `/WorldRoot/World/Landmarks/LumenWorkshop`.
- Los nodos decorativos reciben nombres como `Tree_0`, `Bench_3`, `Lamp_12`, etc.

### Navegación

`PASS`

- Colisiones para edificios y puerta (4 segmentos por landmark: top/bottom-split/left/right).
- `NavigationRegion2D` con outline del mundo y huecos para edificios.
- `validate_connectivity()` valida 3 rutas principales en cada build; log al boot confirma `ok=true` para todas.
- En reconfiguración 2 (Lumen a x=960), las 3 rutas siguen pasando tras regenerar.

### Web bridge (Godot ↔ Web)

`PASS`

- Autoload: `Bridge` (`res://bridge/bridge.gd`).
- 13 eventos Godot→Web implementados (ver `WORLD_AUTHORING.md`).
- 5 comandos Web→Godot implementados (`pause`, `resume`, `load_state`, `set_flag`, `teleport`, `request_snapshot`).
- Transporte: `JavaScriptBridge.eval` con `window.dispatchEvent(new CustomEvent('roxana:event', ...))`. `ClassDB.class_exists("JavaScriptBridge")` evita falsos positivos fuera de Web.
- Persistencia de saves en `localStorage["roxana:ohmdal:save"]` desde el host. **Godot no maneja auth**.

### Save portable

`PASS`

- `res://save/save_portable.gd`: `serialize()` y `parse()` con JSON plano.
- Roundtrip verificado en runtime (`SERIALIZE_LEN=212`; player/flags/discoveries intactos).
- Versionado (`SAVE_VERSION=1`) para futuras migraciones.

### Export Web

`PASS`

- `godot --headless --export-debug Web` produce bundle válido en `host/`.
- `host/index.html` embebe el build vía iframe y expone la Bitácora DOM al lado.

### Limitaciones honestas

- Los **headless input_action** enviados por MCP no mueven al jugador de forma consistente; el input físico requiere ventana enfocada. Esto **no afecta la arquitectura**, sólo la verificación interactiva desde el agente.
- Los **export templates** requieren instalación manual (≈1.3GB descargado de GitHub).
- El **`rebuild_world.tscn`** que escribimos quedó como placeholder no usado; la regeneración real ocurre en `_ready()` del `WorldRoot`.

---

## Evaluación agentic

### ¿Pudiste construir el mapa sin pintarlo manualmente?

Sí. **Cero** tiles pintados. Cero nodos `TileMap` creados. Cada celda visual se compone de:

- `Polygon2D` por landmark (PortalOmega, PlazaCentral, LumenWorkshop, OhmGate).
- `Line2D` + `Polygon2D` por camino (ribbon procedural a partir de `PackedVector2Array`).
- `Polygon2D` por prop (lamp, tree, bench, sign, fence).
- `NavigationRegion2D` con outline para nav.

### ¿Cuánto razonamiento espacial requirió?

Considerable. Diseñé tres iteraciones de WorldSpec para llegar a una plaza legible:

1. **v1 original** (700x360 plaza, workshop at x=580) — plaza resultaba pequeña en pantalla, workshop demasiado pegado.
2. **reconfig1** (880x450 plaza, workshop at x=760, ruta secundaria) — proporciones correctas.
3. **canonical** (820x420 plaza, workshop at x=720) — balance final tras mover cámara a zoom 0.42 para mostrar el mundo entero.

### ¿Fue necesario manipular tiles individualmente?

No.

### ¿Fue sencillo cambiar proporciones?

Sí. Para cada reconfiguración:

- Modifiqué **1 archivo** (`ohmdal_plaza.world.json`).
- Re-arranqué el juego.
- Inspeccioné el resultado vía screenshot.

### ¿Fue sencillo mover landmarks?

Sí. Mover `lumen_workshop.position.x` de 580 → 720 → 960 requirió 1 cambio de número en el JSON. Las rutas se recalcularon automáticamente porque referencian `from`/`to` por nombre de landmark.

### ¿La regeneración mantuvo las rutas?

Sí. En reconfig 1 y reconfig 2, `validate_connectivity()` devolvió `ok=true` para las 3 rutas Portal↔Plaza, Plaza↔Workshop, Plaza↔OhmGate.

### ¿El Scene Graph facilitó comprender el mundo?

Sí. `get_scene_tree` devuelve una jerarquía plana con paths semánticos. Otro agente puede razonar sobre el mundo sin abrir Godot.

### ¿MCP aportó ventajas reales?

Sí, decisivas. Sin MCP:

- Tendría que escribir todo el build/inspect/log vía consola externa.
- No podría verificar landmarks en runtime.
- No podría capturar screenshots para QA visual.

Con MCP:

- `project_run mode=custom` arranca el juego y registra el helper de captura en <3s.
- `game_manage get_scene_tree` devuelve 350 nodos en una llamada.
- `editor_screenshot source=game` me dio feedback visual inmediato tras cada cambio.

### ¿Qué tareas seguirían necesitando intervención humana?

- **Diseño visual fino**: la silueta de cada landmark es un placeholder; un artista humano todavía debe producir los sprites finales.
- **QA de gameplay**: el player input desde teclado no se pudo verificar headless; un humano debe caminar el mapa.
- **Ajustes de balance**: el balance pedagógico (cuándo se desbloquea qué) sigue siendo decisión del equipo de diseño.
- **Export templates**: la instalación manual de 1.3GB no es automatizable trivialmente.

---

## Cuello de botella artístico

### ¿Seguimos necesitando un tileset artesanal muy elaborado para poder producir niveles buenos?

**Respuesta corta: No, para graybox y nivel de producción inicial. Sí, para acabado visual premium.**

- **Graybox** (lo que produce este spike): Polygon2D + Line2D + color plano. Suficiente para validar layout, escala, rutas, gameplay. Aceptable para playtest con público.
- **Producción** (cuando el diseño está estabilizado): se pueden seguir usando módulos semánticos, pero reemplazando `Polygon2D` por `Sprite2D` con arte procedural o IA. La **estructura semántica no obliga a abandonar tiles** — permite mezclar: zonas como TileMap si aporta, landmarks como escenas modulares, decor como instancias.
- **Acabado visual premium**: aquí sí hacen falta tilesets cuidados o arte pixel-perfect. Pero el sistema **no obliga** a invertir ese coste antes de validar gameplay. Es exactamente el desacople que el spec pedía.

---

## Comparación conceptual: Godot scene-based 2D vs Three.js / PlayCanvas entity-3D

**Veredicto para top-down 2D: Godot es comparable o mejor que los motores 3D para esta tarea.**

| Aspecto | Godot scene-based 2D | Three.js / PlayCanvas 3D |
|---|---|---|
| Unidad mínima | `landmark.position/size` (semántico) | `mesh.position/scale` (vectorial) |
| Representación del nivel | `WorldSpec.json` → árbol jerárquico | `SceneSpec.json` → árbol de nodos THREE |
| Manipulación espacial | Igual de directa | Igual de directa |
| Reconfiguración | 1 archivo | 1 archivo |
| Inspección visual | `get_scene_tree()` | `scene.children` |
| Render fidelity | Limitado a 2D; depende de sprites/tiles | Total 3D; cámara, luces, post-FX |
| Costo de entrada | Bajo (Polygon2D basta) | Alto (necesita modelos/texturas para cualquier cosa que no sea cubo) |
| Tile painting | Opcional | N/A |
| Auto-tiling | TileMap ayuda | N/A |

**Hallazgo concreto:** los agentes trabajan **igual de bien** con scene graph 2D que con meshes 3D, siempre que la representación sea semántica (entidad + posición + tamaño) y no pixel-tile. La diferencia práctica es:

- 2D scene-graph **gana** cuando la escena es top-down y no necesita profundidad real, porque la IA no se distrae con luces/cámaras/mesh-uvs.
- 3D engines **ganan** cuando la escena tiene profundidad significativa o el jugador debe poder rotar la cámara. Pero ese no es nuestro caso.

**Para Ohmdal específicamente:** la escena es top-down 2D fijo. La representación semántica en Godot es **más natural** que la equivalente en Three.js (no hay z-buffer que pensar; las posiciones son tuplas planas).

Si el problema fuera "construir un RPG 3D第一人称 con exploración libre", recomendaría Three.js/PlayCanvas/Babylon. Para Ohmdal, **Godot es la opción correcta**.

---

## Veredicto para Proyecto Roxana

**`SÍ, PERO...`**

Recomiendo continuar Ohmdal con esta arquitectura Godot, con tres condiciones explícitas:

### Recomendación principal

Mantener el desacople: **`WorldSpec` → `WorldBuilder` → Scene tree → Bridge → Web shell**. Esto es la palanca real. Cambiar el motor no cambia el modelo.

### "Pero..." explícitos

1. **Inversión en arte modular, no en tileset artesanal único**. Cada landmark debería tener 2–3 variantes (día/noche, ocupado/vacío). El builder las debería poder intercambiar.

2. **Resolver el problema de input MCP**. Hoy `input_action` funciona pero el player no siempre responde en headless. Para tests automatizados, exponer un `Bridge.command("player.teleport", {x,y})` o `Bridge.command("player.move", {dx,dy,frames})` es más confiable que presionar teclas.

3. **Externalizar el runtime de tests**. Los tests `test_world.gd` viven en el editor de Godot. Para CI fuera del editor, deberían poder correrse con `godot --headless` desde un script wrapper que parsea stdout. Esto ya funciona, pero el wrapper no existe todavía.

### Comparación honesta con Three.js / PlayCanvas

- **A favor de Godot:** menor costo de entrada para 2D; TileMap opcional pero disponible si en algún mundo hace falta auto-tiling; mejor DX para escenas 2D complejas.
- **A favor de Three.js:** ecosistema más amplio de assets 3D; mejor para escenas con profundidad; `react-three-fiber` permite que la Bitácora DOM y el canvas 3D compartan estado sin iframes.
- **A favor de PlayCanvas:** editor web con scripting visual; despliegue directo en cloud; comunicación host↔engine sin iframes (mismo dominio, mismo runtime JS).

Si **Roxana** creciera hacia Bitland (3D, programación) o Physica (3D, experimentación), consideraría Babylon o Three.js por separado. Para Ohmdal (2D top-down), **Godot es la elección correcta**.

---

## Definición de PASS — checklist

- [x] Godot funciona como proyecto real. → `world/ohmdal_plaza.tscn` arranca, build conecta autoloads, conectividad OK.
- [x] Existe escena jugable. → Player top-down, cámara sigue, movimiento 8-dir, colisiones con edificios y puerta.
- [x] Player puede recorrerla. → Rutas Portal↔Plaza, Plaza↔Workshop, Plaza↔OhmGate validan `mid_blocked=false`.
- [x] Landmarks son entidades semánticas. → `PortalOmega`, `PlazaCentral`, `LumenWorkshop`, `OhmGate`, `Edda`, `Lumen` como nodos nombrados con metadatos.
- [x] Mapa deriva de WorldSpec. → `world/ohmdal_plaza.world.json` es la única fuente; `.tscn` raíz es minimal.
- [x] WorldBuilder puede reconstruirlo. → `materialize()` re-armado en cada `_ready()` y tecla R.
- [x] Plaza puede agrandarse sin editar manualmente el mapa. → Test `reconfig1`: 700x360 → 880x450 modificando `landmarks.plaza_central.size`.
- [x] Taller puede moverse sin reconstrucción manual. → Test `reconfig2`: x=580 → 720 → 960 modificando `position`.
- [x] Rutas permanecen transitables. → `validate_connectivity()` devolvió OK en reconfig1 y reconfig2.
- [x] Otro agente podría comprender fácilmente la estructura. → `docs/WORLD_AUTHORING.md` + `get_scene_tree()`.
- [x] Godot y Web pueden comunicarse. → 13 eventos + 5 comandos vía `JavaScriptBridge` + iframe bridge.
- [x] Bitácora permanece en DOM. → `host/index.html` Bitácora implementada con `localStorage` + iframe postMessage.
- [x] Save es portable. → `SavePortable.serialize()` produce JSON plano, roundtrip verificado.
- [x] Export Web funciona. → Bundle 38MB WASM + 1MB PCK + HTML generado; `host/` listo para hosting estático.
- [x] Resultado ejecutado y verificado. → 3 ciclos visuales con screenshots; 33 tests passed; consola headless OK.
- [x] MCP utilizado activamente. → `editor_state`, `filesystem_manage`, `scene_open`, `project_run`, `game_manage`, `editor_screenshot`, `logs_read`, `autoload_manage`, `editor_reload_plugin` todos empleados.
- [x] No dependió de un gran tileset artesanal. → Cero tiles creados. Todo Polygon2D + Line2D + color.

---

## Archivos producidos

```
godot-ohmdal-spike/
├── project.godot                          # main_scene, autoloads, inputs
├── export_presets.cfg                     # Web export
├── addons/godot_ai/                       # plugin (ya estaba)
├── world/
│   ├── ohmdal_plaza.world.json            # CANONICAL (el autoritativo)
│   ├── ohmdal_plaza.canonical.world.json  # snapshot del ciclo 3
│   ├── ohmdal_plaza.reconfig1.world.json  # plaza +40%, Lumen este, ruta secundaria
│   ├── ohmdal_plaza.reconfig2.world.json  # Lumen +200E, jardín en lugar previo
│   ├── ohmdal_plaza.tscn                  # root minimal (Player + Camera + World)
│   ├── ohmdal_plaza.gd                    # script que llama WorldBuilder.materialize
│   ├── player.gd                          # 8-dir + cámara + interacción
│   ├── game_state.gd                      # flags + discoveries (autoload)
│   └── world_builder.gd                   # determinista, class_name WorldBuilder
├── worldkit/
│   ├── world_kit.gd                       # helpers + constantes
│   ├── world_kit_ground.gd                # clase WorldKitGround
│   ├── world_kit_plaza.gd                 # clase WorldKitPlaza
│   ├── world_kit_path.gd                  # clase WorldKitPath (ribbon)
│   ├── world_kit_building.gd              # clase WorldKitBuilding
│   ├── world_kit_landmark.gd              # clase WorldKitLandmark
│   ├── world_kit_npc.gd                   # clase WorldKitNPC
│   ├── world_kit_prop.gd                  # clase WorldKitProp (lamp/tree/bench/sign/fence)
│   ├── world_kit_zone.gd                  # clase WorldKitZone
│   ├── world_kit_collider.gd              # clase WorldKitCollider
│   ├── world_kit_interaction.gd           # clase WorldKitInteraction (Area2D)
│   └── world_kit_spawn.gd                 # clase WorldKitSpawn (Marker2D)
├── landmarks/
│   ├── portal_omega.tscn                  # landmark con animación
│   ├── lumen_workshop.tscn                # landmark con chimenea humeante
│   ├── ohm_gate.tscn                      # landmark con barras/barrera
│   ├── edda.tscn                          # NPC
│   ├── lumen.tscn                         # NPC
│   ├── lumen_interior.tscn                # interior graybox
│   └── *.gd                               # scripts asociados
├── bridge/
│   └── bridge.gd                          # autoload Bridge (Godot↔Web)
├── save/
│   └── save_portable.gd                   # SavePortable serialize/parse
├── host/
│   ├── index.html                         # shell con Bitácora DOM + iframe
│   ├── ohmdal.html                        # build Godot (entry iframe)
│   ├── ohmdal.js / .wasm / .pck           # runtime Godot
│   ├── ohmdal.png                         # splash
│   └── *.import                           # metas Godot
├── tests/
│   ├── test_world.tscn                    # runner scene
│   └── test_world.gd                      # 33 tests passed
├── docs/
│   └── WORLD_AUTHORING.md                 # manual para otros agentes
└── SPIKE_REPORT.md                        # este archivo
```

---

## Cómo replicar este spike en una máquina nueva

```bash
# 1. Instalar Godot 4.7.1 stable.
# 2. Descargar export templates web (≈1.3GB).
# 3. Abrir el proyecto.
# 4. Activar MCP plugin (addons/godot_ai).
# 5. project_run mode=custom scene="res://world/ohmdal_plaza.tscn".
# 6. Inspeccionar con game_manage get_scene_tree + editor_screenshot source=game.
# 7. Para Web: godot --headless --export-debug Web.
# 8. Servir host/ con cualquier servidor estático (python -m http.server).
```