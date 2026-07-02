# Spec P3-A — Escuela 3D: estancia mínima del Instituto (hito Delicado)

**Objetivo:** primer runtime real distinto de Phaser: el hall del Instituto en 3D con
estética voxel greybox (Three.js), cámara ¾ semi-fija, un preceptor, una bitácora sobre
el escritorio y una puerta que viaja de verdad al runtime de Ohmdal a través del shell.

**Técnica validada por el Director:** Three.js + (a futuro) assets MagicaVoxel→GLB.
En este hito NO hay assets externos: todo greybox con geometrías de caja (voxel-look).

**Gate:** la escuela 3D se activa SOLO con `?school3d=1` en la URL. Sin ese parámetro,
el prólogo cenital actual sigue intacto (regla del plan: el prólogo no se reemplaza
hasta que el prototipo pruebe ser mejor).

**Dependencia:** `three` + `@types/three` (las instala el Orquestador; el ejecutor NO
corre npm install y NO toca package.json).

---

## Archivos

| Archivo | Acción |
|---|---|
| `src/experiences/instituto/schoolModel.ts` | NUEVO — modelo puro: layout, colisión, interacción |
| `src/experiences/instituto/schoolScene.ts` | NUEVO — construcción de meshes Three.js (greybox voxel) |
| `src/experiences/instituto/schoolRuntime.ts` | NUEVO — `ExperienceRuntimeModule` de `school-webgl` |
| `src/experiences/loaders.ts` | MODIFICAR — `school-webgl` apunta al runtime real |
| `src/experiences/manifests.ts` | MODIFICAR — SOLO el campo `runtime` de INSTITUTO (gate por URL) |
| `src/experiences/ohmdal/topdownRuntime.ts` | MODIFICAR — honrar `initialLocation.roomId` |
| `src/styles.css` | MODIFICAR — agregar `.school-prompt` al final |
| `tests/i0-school-model.test.ts` | NUEVO — tests del modelo puro |

No tocar nada más. En particular: `src/jugar/*`, `src/state.ts`, `src/ui/*`,
`src/app/runtimeHost.ts`, `vite.config.ts`, `package.json`.

---

## 1. Gate en `manifests.ts`

Reemplazar SOLO el valor de `runtime` de `INSTITUTO` por una constante calculada arriba
del manifiesto (los tests corren en Node: hay que guardar contra `location` indefinido):

```ts
// La escuela 3D es un prototipo gateado por URL: sin ?school3d=1 se conserva
// el prólogo cenital. Node (tests) no tiene location: cae al runtime actual.
const school3dEnabled =
  typeof location !== 'undefined' && new URLSearchParams(location.search).has('school3d');
```

y en el manifiesto: `runtime: school3dEnabled ? 'school-webgl' : 'topdown-phaser',`.
Actualizar el comentario existente sobre el prólogo para reflejar el gate. Nada más
cambia en este archivo.

## 2. `schoolModel.ts` — modelo puro (sin Three, sin DOM)

Unidades en metros. Origen en el centro de la sala, ejes X (ancho) y Z (profundo).

```ts
export interface Aabb { minX: number; maxX: number; minZ: number; maxZ: number; }
export interface Interactable { id: 'preceptor' | 'bitacora' | 'puerta_ohmdal'; x: number; z: number; radius: number; }

export interface SchoolLayout {
  /** Límite caminable de la sala (paredes ya descontadas). */
  bounds: Aabb;
  /** Obstáculos internos (escritorio, columnas, preceptor). */
  obstacles: Aabb[];
  interactables: Interactable[];
  spawn: { x: number; z: number };
}

export const SCHOOL_LAYOUT: SchoolLayout;

/** Radio de colisión del jugador. */
export const PLAYER_RADIUS = 0.35;
export const PLAYER_SPEED = 3.2; // m/s

/**
 * Avanza al jugador. `input` es dirección cruda por eje en [-1, 0, 1];
 * se normaliza (diagonal no es más rápida). Colisión por eje (desliza
 * contra paredes y obstáculos, no se traba). dt en segundos, clamp a 0.05.
 */
export function movePlayer(pos: { x: number; z: number }, input: { x: number; z: number }, dt: number): { x: number; z: number };

/** Interactuable dentro de su radio más cercano al jugador, o null. */
export function nearestInteractable(pos: { x: number; z: number }): Interactable | null;
```

Layout concreto (greybox del hall):

- `bounds`: X ∈ [-7.5, 7.5], Z ∈ [-4.5, 4.5] (sala de 15×9 m).
- Puerta a Ohmdal: doble puerta centrada en la pared norte (Z = -4.5), 2.4 m de ancho.
  Interactable `puerta_ohmdal` en (0, -3.9), radius 1.4.
- Escritorio del preceptor: AABB X ∈ [3.2, 5.2], Z ∈ [-1.4, -0.4]. Sobre el escritorio,
  la bitácora: interactable `bitacora` en (4.2, -0.9), radius 1.5 (alcanzable desde el
  frente del escritorio).
- Preceptor: de pie junto al escritorio, obstáculo AABB X ∈ [2.3, 2.9], Z ∈ [-1.3, -0.7];
  interactable `preceptor` en (2.6, -1.0), radius 1.5.
- Dos columnas: AABB cuadradas de 0.6 de lado centradas en (-3.5, 0) y (3.5, 2.5).
- `spawn`: (0, 3.2) — el jugador entra desde el sur mirando hacia la puerta norte.

## 3. `schoolScene.ts` — greybox voxel

Exporta una función que construye la estancia y devuelve referencias que el runtime
necesita:

```ts
export interface SchoolScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  player: THREE.Group;
  /** Libera geometrías/materiales/luces creados acá. */
  dispose(): void;
}
export function buildSchoolScene(aspect: number): SchoolScene;
```

Contenido visual (todo `BoxGeometry`, estética voxel; materiales `MeshLambertMaterial`):

- **Piso:** grilla de baldosas 1×1 (alto 0.1) alternando dos grises cálidos
  (`#2a2733` / `#312d3b`), cubriendo 15×9.
- **Paredes:** altura 3, espesor 0.4, color `#3b3644`, con zócalo (caja de 0.25 de alto,
  `#4a4356`) a lo largo de la base. La pared norte deja el hueco de la puerta.
- **Puerta doble a Ohmdal:** dos hojas de madera (`#6b4a2f`) de 1.2×2.6×0.15 en el hueco
  norte, con un dintel (`#4a4356`) y una lámpara cálida encima: caja pequeña emisiva
  (`#e8b04b`, emissive) + `PointLight` `#e8b04b`, intensidad suave, alcance ~6.
- **Escritorio:** tapa `#5a4030` de 2×0.12×1 sobre patas; encima la bitácora: caja
  0.35×0.08×0.5 color papel `#cbb27e`.
- **Preceptor (voxel-person):** torso 0.55×0.85×0.35 túnica `#3f4a63`; cabeza
  0.4×0.4×0.4 piel `#d9a06b`; sin animación (spike).
- **Jugador (voxel-person):** torso `#3aa79b` (el teal del sprite actual), cabeza piel,
  agrupados en un `THREE.Group` con origen a nivel de piso.
- **Columnas:** cajas 0.6×3×0.6 `#443e50`.
- **Luz:** `AmbientLight` `#5a5468` baja + `DirectionalLight` `#d8cfe8` suave desde
  arriba-sur + la puntual de la puerta + una `PointLight` cálida tenue sobre el
  escritorio. Sin sombras (`renderer.shadowMap` deshabilitado). La escuela debe sentirse
  «apagada pero cuidada», coherente con el tono del juego.
- **Atmósfera:** `scene.background = new THREE.Color('#0e0d12')` y
  `scene.fog = new THREE.Fog('#0e0d12', 14, 26)`.
- **Cámara:** `PerspectiveCamera(45, aspect, 0.1, 40)`. ¾ semi-fija: posición
  `player + (0, 8.5, 7.5)`, `lookAt(player.x, 0.8, player.z)`. (El runtime hace el
  seguimiento con lerp; acá solo la pose inicial.)

`dispose()` debe recorrer lo creado y liberar `geometry`/`material` (los materiales
compartidos una sola vez).

## 4. `schoolRuntime.ts` — el módulo

```ts
export const schoolRuntime: ExperienceRuntimeModule = { runtime: 'school-webgl', async mount(hostEl, context) { ... } };
```

- **Renderer:** `WebGLRenderer({ antialias: true })`,
  `setPixelRatio(Math.min(devicePixelRatio, 2))`, tamaño = rect de `hostEl`; canvas
  con `display:block` agregado a `hostEl`. En `resize` de window, recalcular tamaño y
  `camera.aspect` + `updateProjectionMatrix()`.
- **Input:** listeners `keydown`/`keyup` en `window`. Flechas y WASD → ejes; `KeyE` o
  `keyCode 69` → interactuar. Ignorar input si hay diálogo abierto (usar el mismo
  criterio observable que el resto del juego: si `#dialog` existe y no tiene clase
  `hidden`, no mover ni interactuar — verificar el id/clase reales en `src/ui/dialog.ts`
  e imitar).
- **Loop:** `requestAnimationFrame`; dt por timestamps con clamp 0.05 s;
  `movePlayer` del modelo → posición del grupo jugador; cámara sigue con lerp 0.08 hacia
  `player + (0, 8.5, 7.5)` y `lookAt` al jugador.
- **Prompt:** `<div class="school-prompt hidden">` dentro de `hostEl`. Cada frame,
  según `nearestInteractable`: `preceptor` → texto `E — hablar`; `bitacora` →
  `E — mirar`; `puerta_ohmdal` → `E — viajar a Ohmdal`; null → ocultar (clase `hidden`).
- **Interacción con E** (texto TEXTUAL, no cambiar ni una letra):
  - `preceptor` → `say([...])` de `src/ui/dialog.ts` con:
    1. `L('Preceptor', 'Bienvenido al Instituto. Hace años que estas paredes no escuchan una pregunta.')`
    2. `L('Preceptor', 'Del otro lado de esa puerta está Ohmdal. Cuando estés listo, cruzá.')`
  - `bitacora` → `say` con:
    `L('', 'Sobre el escritorio descansa una bitácora de tapas gastadas. Está abierta, como esperando a alguien.')`
    y al cerrar el diálogo (`onDone`), llamar `showBitacoraButton()` de
    `src/ui/bitacora.ts` (acceso UI; NO escribir flags).
  - `puerta_ohmdal` → `void context.requestTravel({ experienceId: 'ohmdal', roomId: 'plaza' })`.
- **Al montar:** `activateExperience(experienceById('instituto'), null)` (de
  `../registry.ts`).
- **Handle:**
  - `travelTo`: no-op con comentario (estancia única en el spike).
  - `snapshot()`: `{ runtime: 'school-webgl', data: { x, z } }` (posición actual).
  - `pause()`/`resume()`: detener/reanudar el RAF (y soltar teclas presionadas al pausar).
  - `destroy()`: cancelar RAF, remover listeners (teclado y resize), `dispose()` de la
    escena, `renderer.dispose()`, remover canvas y prompt del DOM.
- Firmas exactas de `say`/`L`/`showBitacoraButton`: leerlas de `src/ui/dialog.ts` y
  `src/ui/bitacora.ts` y usarlas tal cual; si no coinciden con lo descrito acá,
  frenar y reportar (no adaptar inventando).

## 5. `topdownRuntimes.ts` — honrar `initialLocation`

En `mount`, reemplazar el comentario `// P2: initialLocation reemplazará...` por:

```ts
// El shell puede pedir montar en una sala concreta (p. ej. la puerta 3D → plaza).
const requestedRoom = context.initialLocation.roomId;
if (requestedRoom && experienceOfRoom(requestedRoom)?.runtime === 'topdown-phaser') {
  state.room = requestedRoom;
}
```

(`experienceOfRoom` ya está en `../registry.ts`; agregar el import). Con esto la puerta
3D aterriza en la plaza aunque el save diga `hall`. Nota: NO llamar `save()` acá; la
escena ya persiste al moverse/goto como siempre.

Cuidado: `activateExperienceForRoom(state.room)` debe ejecutarse DESPUÉS de este ajuste.

## 6. `loaders.ts`

`'school-webgl': () => import('./instituto/schoolRuntime.ts').then((m) => m.schoolRuntime),`

## 7. `.school-prompt` en `styles.css`

Al final del archivo: posición absoluta abajo-centro del contenedor de juego, mismo
lenguaje visual que el HUD existente (fondo oscuro translúcido, borde sutil, texto
`var(--paper)` o equivalente ya usado, `border-radius` moderado). Respetar la clase
`hidden` global. Nada de paleta nueva.

## 8. `tests/i0-school-model.test.ts`

Estilo de `tests/a0-experience-registry.test.ts` (asserts propios, imports `.ts`,
Node strip-types, sin DOM). Casos mínimos:

1. Diagonal normalizada: mover 1 s con input (1,1) recorre ~PLAYER_SPEED (±1%), no ×√2.
2. Pared: desde spawn, empujar contra la pared sur nunca deja `z > bounds.maxZ - PLAYER_RADIUS`.
3. Deslizamiento: avanzar en diagonal contra una pared sigue moviendo en el eje libre.
4. Obstáculo: el jugador no puede atravesar el AABB del escritorio (probar cruce directo).
5. `nearestInteractable(spawn)` es null; a menos de 1.4 de la puerta devuelve `puerta_ohmdal`.
6. Camino jugable: simulando inputs (secuencia de `movePlayer`), desde `spawn` se llega
   al radio de `puerta_ohmdal`, al de `preceptor` y al de `bitacora` (ningún interactuable
   queda encerrado por obstáculos).

---

## Reglas duras

- Texto visible al jugador: SOLO el especificado, TEXTUAL.
- No escribir flags ni save desde el runtime 3D (excepción documentada del §5 en topdown).
- Sin dependencias nuevas más allá de `three`/`@types/three` ya instaladas. Sin commit.
- Spec ambigua o API real distinta a la descrita → frenar y reportar, no inventar.
- Verificación del ejecutor: `npm run build` verde y
  `node --experimental-strip-types tests/i0-school-model.test.ts` verde, más
  `tests/a0-experience-registry.test.ts` sigue verde.
