# Prompt — Kimi K3 (OpenCode) · Room Engine Recovery · Ohmdal

> **Uso:** pegar tal cual en OpenCode con Kimi K3.
> **Modo:** read-only por defecto. Solo escritura permitida sobre los 3 entregables `.md` listados abajo.
> **No es un plan de implementación.** Es un audit + recovery plan + research de tooling Phaser que produce 3 documentos para que un agente ejecutor (MiniMax M3) los use después.

---

## 1. Rol y postura

Sos un **ingeniero senior / tech game designer** con trabajo read-only sobre este repositorio (`C:/YO/Proyectos/Roxana`).

- **No vas a reescribir el repo.** No vas a migrar de engine. No vas a cambiar la dirección de producto. Eso lo decide Manuel.
- **Vas a producir un diagnóstico honesto** que distinga explícitamente entre lo que el canon actual dice, lo que el SDD que te pasan pide, y dónde se contradicen.
- **Vas a investigar tooling Phaser** con foco en valor real para agentes, no academicismo.

## 2. Contexto que ya tenés que haber leído

Antes de escribir una línea, leé:

- `AGENTS.md` (raíz) — la tabla de mundos/verbos/dirección técnica y las reglas duras.
- `docs/20-worlds/ohmdal/AGENTS.md` — reglas locales de Ohmdal, estado de hitos, **regla DON'T sobre reabrir engine**, y la lista de cosas que requieren decisión material.
- `docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md` — North Star.
- `docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md` y `ohmdal-electrical-system_v1.md` — modelo eléctrico y loop.
- `docs/20-worlds/ohmdal/world/ohmdal-world-structure_v1.md` — geografía y regiones.
- `docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md` y `ohmdal-vertical-slice_v1.md` — Arco I y el slice.
- `docs/20-worlds/ohmdal/production/ohmdal-prototype-evaluation_v1.md` — estado del prototipo.
- `docs/20-worlds/ohmdal/production/direccion-ambiental-arco1.md` — dirección visual / ambientación.
- `docs/20-worlds/ohmdal/production/sistema-arte-v1.md` — sistema de arte.

Después, sí o sí, inspeccioná código:

- `src/jugar/rooms.ts` (128KB) — baseline narrativo/contenido Phaser greybox.
- `src/jugar/ExplorationScene.ts` (60KB) — escena de exploración.
- `src/jugar/visuals.ts` (51KB) — visuales greybox.
- `src/jugar/roomScenesData.ts` (25KB) — datos de escenas.
- `src/jugar/awakening.ts`, `tiles.ts`, `roomScenes.ts`, `world.ts`.
- `src/ohmdal-arco1/engine/Game.ts` (35KB) y todo el árbol `src/ohmdal-arco1/` — engine paralelo completo.
- `src/ohmdal/architecture/` — kits de room ya desarrollados: `basicRoomKit.ts`, `plazaKit.ts`, `puertaKit.ts`, `tallerKit.ts`, `kitBuilder.ts`, `levelData.ts`, `blockout.ts`, `units.ts`, `index.ts`.
- `src/ohmdal/camera/` — `cameraConfig.ts`, `cameraController.ts`, `occlusion.ts`.
- `src/ohmdal/world.ts` (35KB), `atmosphere.ts` (27KB), `awakening.ts`, `ohmPedestalBench.ts`.
- `src/hd2d-ohmdal/main.ts` y `world.ts` (40KB) — runtime HD-2D activo.
- `src/puzzles/` — modelos pedagógicos (renderer-neutral) y sus implementaciones.
- `src/ui/` — Bitácora, diálogo, overlay, joystick, ohm companion.
- `src/state.ts` (7KB) — estado global / persistencia.
- `src/main.ts` (3KB) — entrypoint.
- `package.json` — verdad de versiones (Phaser ^4.1.0 ya está instalado junto a Three/Babylon).

## 3. Tensión que tenés que reportar (no resolver)

El SDD que vas a recibir como input pide **retomar Ohmdal sobre Phaser room-based, consolidando `src/jugar/` como camino principal**.

El canon actual (`AGENTS.md` raíz + `docs/20-worlds/ohmdal/AGENTS.md`) dice otra cosa:

- "Ohmdal | CONECTAR | **Three.js HD-2D** — north de producción actual".
- H1 (Plaza HD-2D) ✅; H2 (Plaza de verdad HD-2D) ← **foco actual**; H3+ en HD-2D.
- "**Baseline jugable: `/jugar` (Phaser top-down, greybox). Se preserva como red de seguridad, contenido y regresión hasta que HD-2D alcance paridad suficiente. No recibe la nueva dirección visual por defecto.**"
- DON'T local: "Reabrir el engine porque otra herramienta sea nueva/popular; sólo si aparece un bloqueo material reproducible."
- §7 lista `src/jugar/rooms.ts` como baseline narrativo/contenido que requiere **decisión material** para tocarlo.

**Tu trabajo NO es decidir esto.** Tu trabajo es:

1. **Reportar la tensión explícitamente** en el AUDIT, con citas a los archivos.
2. **No presuponer que el pivote está aprobado.** Escribir los entregables como si la decisión material siguiera pendiente.
3. **Cumplir el SDD en espíritu donde no choque con el canon**, pero **marcar cada choque** como `BLOCKED_ON_MATERIAL_DECISION` o `CANON_CONFLICT`.

## 4. Entregables

Escribí exactamente estos 3 archivos. No crees nada más.

### 4.1 `docs/20-worlds/ohmdal/production/ROOM_ENGINE_RECOVERY_AUDIT.md`

Estructura mínima:

- **§1 Estado real del juego Phaser hoy**
  - Qué hay realmente en `src/jugar/`. Qué hay en `src/ohmdal-arco1/`. Qué hay en `src/ohmdal/architecture/`.
  - Cuál es el runtime activo y por qué (citas a `package.json`, `AGENTS.md`, `ohmdal/AGENTS.md`).
  - Tamaño y rol de cada archivo grande (`rooms.ts`, `ExplorationScene.ts`, `Game.ts`, `World.ts`, `world.ts`, etc.).
- **§2 Qué ya es room-like**
  - Inventario concreto: hotspots, exits, spawns, colisiones, transiciones, gates, variantes — con `archivo:linea` cuando aplique.
  - Qué patrón room-engine ya existe informalmente.
- **§3 Qué está acoplado**
  - Lo que hoy vive en una "escena gigante" y debería vivir en datos.
  - Lo que está hardcodeado de forma incómoda para extender.
- **§4 Assets y reutilizables**
  - Sprites, bitmaps, kit de bloques (`src/ohmdal/architecture/`), `ohmdal/camera/`, `puzzles/`, `ui/`.
  - Qué sirve tal cual. Qué se puede portar a un Room Engine con poco esfuerzo.
- **§5 Flujo ya existente**
  - Loop actual: input → estado → render → bitácora. Diagrama en texto.
  - Persistencia y world state semántico.
- **§6 Tabla KEEP / ADAPT / RETIRE / UNKNOWN**
  - Una fila por componente. Columnas: nombre, ruta, estado, justificación, riesgo, esfuerzo estimado.
  - Marcar con ⚠️ los ítems que tocan lo que el canon prohíbe sin decisión material.
- **§7 Conflictos con el canon**
  - Lista numerada de choques entre el SDD y `AGENTS.md` / `ohmdal/AGENTS.md`.
  - Cada conflicto: nombre, archivos en colisión, qué se necesitaría para resolverlo.
- **§8 Resumen ejecutivo de 10 líneas**
  - Qué es Ohmdal hoy, en qué consiste realmente "retomar Phaser room-based", y por qué es un pivote, no una recuperación.

### 4.2 `docs/20-worlds/ohmdal/production/ROOM_ENGINE_RECOVERY_PLAN.md`

Estructura mínima:

- **§1 Base elegida**
  - Si el pivote se aprueba: ¿`src/jugar/` se consolida, o se crea un árbol nuevo `src/ohmdal-room/` que reusa piezas de `src/ohmdal-arco1/` y `src/ohmdal/`? Justificar.
  - Si NO se aprueba: ¿qué plan alternativo permite avanzar contenido jugable sin contradecir el canon? (Tocar la menor cantidad de zonas explosivas.)
- **§2 Estrategia incremental**
  - Reglas: cada milestone debe producir algo jugable en pantalla. Cada cambio debe pasar `npm run build` + `npm test` + `npm run verify` + revisión manual.
  - Cero rewrite ciego. Migrar room por room. Mantener `src/hd2d-ohmdal/` compilando hasta que el Room Engine sea canónico.
- **§3 Milestones (M0–M7)**
  - M0: validar AUDIT/PLAN/RESEARCH contra canon y aceptar.
  - M1: Room Engine mínimo (`RoomDefinition`, `RoomLoader`, `RoomGraph`) — debe poder renderizar 1 room en `/jugar` o equivalente sin tocar HD-2D.
  - M2: Portal Ω + Plaza de Ohmdal como rooms.
  - M3: Lumen exterior / interior.
  - M4: Puzzle serie + world state.
  - M5: Despertar de Ohm + cinematic event.
  - M6: Puerta de Ohm + Manantial.
  - M7: polish mínimo + audio + debug/authoring mode.
- **§4 Archivos a tocar primero**
  - Lista concreta con `archivo:línea` o bloque.
  - Para cada uno: riesgo, dependencias, "qué NO se debe cambiar".
- **§5 Cómo evitar rewrite completo**
  - Estrategia de compat. Qué se conserva binario-compatible. Qué se depreca con flag. Qué se mueve.
- **§6 Definition of Done por milestone**
  - M1: "puedo cargar una room desde JSON y verla en pantalla con player + spawn + exit + hotspot clickeable".
  - M2: "puedo ir de Portal a Plaza y guardar/cargar".
  - etc.
- **§7 Riesgos y bloqueos**
  - Tabla de riesgos con probabilidad, impacto, mitigación.
  - Conflictos con canon abiertos (de §7 del AUDIT).
- **§8 Supuestos**
  - Qué estás asumiendo (decisión material pendiente, rutas estables, etc.).

### 4.3 `docs/20-worlds/ohmdal/production/PHASER_AGENT_TOOLS_RESEARCH.md`

Estructura mínima:

- **§1 Phaser 4 oficial**
  - API: scenes, input, cameras, audio, loader, scale, physics.
  - Phaser Labs / Examples / Sandbox: qué ejemplos son directamente aplicables a Ohmdal.
  - Links concretos. Snippet corto por ejemplo útil (no copy-paste gigante).
- **§2 Phaser Editor v5 MCP**
  - Capacidades reales. Costo / beneficio. ¿Conviene ya o más adelante? Veredicto claro.
- **§3 Phaser Game Agent MCP**
  - Qué resuelve. Cuánto cuesta. ¿Aporta valor real o es distracción? Veredicto claro.
- **§4 Tools / Desktop / JSON / debug**
  - Spector (Three.js — irrelevante si pivoteamos, marcarlo), Phaser Inspector, otros.
  - Cualquier herramienta concreta que simplifique authoring o debugging.
- **§5 Keolot Phaser Editor**
  - Revisar SOLO si aporta valor real. No migrar sin razón fuerte.
- **§6 Veredicto por pregunta**
  - ¿Qué tooling mejora de verdad la comprensión por parte de agentes?
  - ¿Qué vale la pena incorporar ya?
  - ¿Qué sería sobreingeniería?
  - ¿Conviene introducir Phaser Editor v5 MCP ya o primero consolidar el Room Engine code-first?
  - ¿Qué examples oficiales son directamente aplicables a Ohmdal?
  - ¿Qué patterns conviene estandarizar para que MiniMax y Kimi entiendan rápido el proyecto?
- **§7 Patrones de proyecto recomendados**
  - Estructura de carpetas sugerida para que un agente nuevo entienda el Room Engine sin leerse todo el repo.
  - Convenciones de nombres, comentarios obligatorios en interfaces, JSON schemas.
- **§8 Riesgos**
  - Sobreingeniería, dependencias, lock-in, costo de aprendizaje.

## 5. Reglas duras para vos

1. **Read-only** sobre todo el repo, salvo los 3 archivos `.md` de los entregables. No commitees, no crees branches, no modifiques `package.json`, no instales nada.
2. **No inventes paths.** Si un archivo no existe, decilo.
3. **No inventes lore.** Si falta texto narrativo, marcá `TODO(guion)` y seguí.
4. **Cero `npm install` / `npm run build` salvo que sea indispensable para verificar una afirmación.** Si lo hacés, decláralo en el AUDIT.
5. **Cuando el SDD pida algo que choque con el canon, no lo resuelvas: marcalo.** `BLOCKED_ON_MATERIAL_DECISION: <descripción>`.
6. **Cuando algo sea incierto, marcalo `UNKNOWN`** en la tabla KEEP/ADAPT/RETIRE.
7. **No produzcas un plan enorme.** Cada milestone debe ser verificable en horas, no en días. Si excede, partilo.
8. **Cero emoji decorativo.** Solo cuando aporte estructura al documento.
9. **Español neutro / tuteo** en el texto visible.
10. **Citá con `archivo:línea`** cada vez que afirmes algo sobre el código.

## 6. Política de reparación

Si durante la auditoría aparece un defecto reproducible que bloquea el trabajo:

- Reportalo en el AUDIT (§X "Defectos encontrados durante el audit").
- **No lo arregles.** Esto es un audit, no un sprint de fixes.

## 7. Final esperado

Tres archivos `.md` en `docs/20-worlds/ohmdal/production/`:

- `ROOM_ENGINE_RECOVERY_AUDIT.md`
- `ROOM_ENGINE_RECOVERY_PLAN.md`
- `PHASER_AGENT_TOOLS_RESEARCH.md`

Más un **resumen final en chat** de 20–30 líneas:

- 1 línea por entregable.
- Lista de los 3–5 conflictos con canon más importantes.
- Lista de los 3–5 riesgos más importantes.
- Recomendación explícita: ¿el SDD tal cual es ejecutable, o requiere decisión material previa?

Esa recomendación NO es decisión. Es la base para que Manuel tome la decisión material.
