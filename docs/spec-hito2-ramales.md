# Spec Hito 2 — Rediseño de "Los Ramales" (circuito en paralelo)

**Para el ejecutor (Codex).** Implementás UN hito al pie de la letra. NO inventes
texto del juego: se copia TEXTUAL de esta spec. NO commitees. NO toques `rooms.ts`
ni otros archivos fuera de la lista. Español neutro (tuteo). Imports con extensión
`.ts`. Tests con `node --experimental-strip-types`.

## 0. Referencia obligatoria

Antes de escribir nada, LEÉ `src/puzzles/chain.ts` y `src/puzzles/chainModel.ts`.
Acaban de rediseñarse con el patrón **predecir → observar → explicar** por fases.
Calcá EXACTAMENTE ese estilo y estructura (fases derivadas del estado, panel de
predicción `.bench-predict`, línea `.bench-goal`, gating de controles por fase,
prefijo de acierto/sorpresa en el diálogo). Este hito hace lo mismo para Los Ramales.

## 1. Archivos a tocar (solo estos)

- `src/puzzles/branchesModel.ts` — reescribir modelo.
- `src/puzzles/branches.ts` — reescribir vista.
- `tests/m5-branches.test.ts` — reescribir test.
- CSS: **reusá** las clases ya existentes `.bench-predict`, `.bench-predict-q`,
  `.bench-predict-row`, `.bench-predict-btn`, `.bench-goal`. NO agregues CSS nuevo
  salvo que sea imprescindible para una pieza que no exista.

**Firma pública sin cambios:** `abrirBranches({ onSolved, onBurnedFuse, practica })`.
NO tocar `rooms.ts`.

## 2. Qué enseña (no cambiar el concepto)

Paralelo = cada rama recibe según SU freno, **independiente** de las otras
(conectar/desconectar una NO cambia el brillo de las demás); pero el **Tronco paga
la SUMA** de todas (si piden de más, el fusible del Tronco se inmola).

## 3. Cambio clave de diseño

Se **ELIMINAN las "zonas verdes" por rama** (`BRANCH_ZONES`, `branchInGreenZone`):
eran objetivos arbitrarios sin historia. La **victoria nueva** = las 3 ramas
conectadas + el Tronco dentro de tolerancia (≤ 8). El gesto de "acertar caudales
distintos por rama" queda reservado a OTRO puzzle (el Repartidor), no a este. Acá
el foco es vivir la **independencia** y que el **Tronco suma**.

## 4. Modelo (`branchesModel.ts`)

**Conservar** (igual que hoy): `BRANCH_PUSH=8`, `TRUNK_TOLERANCE=8`,
`EXTREME_OVERLOAD=24`, `BRANCH_COUNT=3`; `BranchStone='marron'|'roja'|'amarilla'|'gris'`;
`STONE_VALUES` (marron1/roja2/amarilla4/gris8); `branchRiver(stone)=8/valor`;
`trunkRiver` = suma de ríos de ramas conectadas; toda la lógica del fusible
(`evaluateFuse`, `advanceBranchFuse`, `EXTREME_OVERLOAD` quema directo, 3
insistencias) y `replaceTrunkFuse` (reset por Lumen). `BranchesChange` con `fuseResult`.

**Quitar:** `BRANCH_ZONES`, `branchInGreenZone`.

**Agregar:**
```ts
export type IndependenceGuess = 'baja' | 'sube' | 'igual';
export const INDEPENDENCE_ANSWER: IndependenceGuess = 'igual';
export type TrunkGuess = 'nada' | 'sobrecarga' | 'apagan';
export const TRUNK_ANSWER: TrunkGuess = 'sobrecarga';
```
- `predictions: { independence: IndependenceGuess | null; trunk: TrunkGuess | null }`
- `experiences: { connectedSecond: boolean }` (true cuando hay ≥2 ramas conectadas:
  el jugador vio que conectar la 2ª no cambió la 1ª).

**Estado inicial** (`createBranchesState`):
- branch 0: `connected=true`, `stone='amarilla'` (river 2).
- branch 1: `connected=false`, `stone='amarilla'`.
- branch 2: `connected=false`, `stone='amarilla'`.
- fuse `{overloads:0, burned:false}`, replacements 0,
  predictions `{independence:null, trunk:null}`, experiences `{connectedSecond:false}`, solved false.
- (La rama 0 ya viene conectada para que el jugador OBSERVE su brillo constante al conectar la 2ª.)

**Funciones nuevas/cambiadas:**
- `predictIndependence(state, guess): BranchesState` — setea `predictions.independence`.
- `predictTrunk(state, guess): BranchesState` — setea `predictions.trunk`.
- `setBranchStone`, `connectBranch` — igual que hoy (devuelven `BranchesChange`, recalculan via `withDerived` + `evaluateFuse`).
- `isBranchesSolution(state)` =
  `!fuse.burned && las 3 ramas conectadas && trunkRiver(state) <= TRUNK_TOLERANCE &&
   predictions.independence !== null && predictions.trunk !== null && experiences.connectedSecond`.
- `withDerived`: recalcula rivers de cada rama (connected? branchRiver(stone):0),
  `connectedSecond = (#conectadas >= 2) || previo`, y `solved = isBranchesSolution`.

## 5. Vista (`branches.ts`) — fases (calcar chain.ts)

```
phaseOf(state):
  if !predictions.independence        -> 'predict-independence'
  else if !experiences.connectedSecond-> 'show-independence'
  else if !predictions.trunk          -> 'predict-trunk'
  else                                -> 'solve'
```

Layout: mantené la red actual (EMPUJE / Tronco / Cruce / 3 cards de rama, aguja del
Tronco con tolerancia 8, Ohm, fusible, probes). AGREGÁ el panel `.bench-predict` y la
línea `.bench-goal` (como en chain.ts).

**Controles por fase:**
- `predict-independence`: solo el panel de predicción 1. Cards no manipulables
  (toggles y piedras `disabled`).
- `show-independence`: rama 0 conectada fija. Habilitá SOLO el toggle "Conectar" de la
  rama 1. Al conectarla → `connectedSecond=true` → mostrá prefijo + `SECOND_BRANCH_DIALOGUE`
  → pasa a `predict-trunk`. (Piedras deshabilitadas en esta fase; la rama 1 entra con
  amarilla = river 2, igual que la 0 → el jugador ve dos ramas iguales y la 1ª sin cambiar.)
- `predict-trunk`: panel de predicción 2.
- `solve`: TODO manipulable (conectar/desconectar las 3, elegir piedras). Fusible activo.
  Botón "Lumen repone el fusible" (igual que hoy, con `REPLACEMENT_COMMENTS`). Victoria al
  cumplir `isBranchesSolution` → `SOLVED_DIALOGUE`, ocultar "Alejarse", mostrar "Continuar".

**Modo `practica`:** calcá el manejo de chain.ts (en práctica no se bloquea ni se
muestra "Continuar"; el jugador explora y cierra con "Alejarse").

## 6. Textos canon (TEXTUAL — no modificar)

**Conservar EXACTO** los que ya están en `branches.ts`: `SECOND_BRANCH_DIALOGUE`,
`BURNED_DIALOGUE`, `SOLVED_DIALOGUE`, `REPLACEMENT_COMMENTS`.

**Nuevos (copiar textual):**

Pregunta independencia (panel, fase predict-independence):
`<p class="bench-predict-q"><b>Ohm:</b> «La primera rama ya corre. Si conecto la segunda, ¿qué crees que le pasa al brillo de la primera?»</p>`
Opciones (botones): `Baja: se reparten el río` (baja) · `Sube` (sube) · `Sigue igual` (igual)

Pregunta Tronco (panel, fase predict-trunk):
`<p class="bench-predict-q"><b>Ohm:</b> «Cada rama cobra lo suyo. Pero si las tres piden mucho a la vez, ¿qué crees que le pasa al Tronco?»</p>`
Opciones (botones): `Nada, son independientes` (nada) · `Se sobrecarga` (sobrecarga) · `Las ramas se apagan entre sí` (apagan)

Prefijos al conectar la 2ª rama (anteceden a `SECOND_BRANCH_DIALOGUE`):
- si predijo `igual`: `<b>Ohm:</b> «Lo anticipaste: la primera no cambia.»<br/>`
- si predijo otra: `<b>Ohm:</b> «Mira la primera: ni se inmutó.»<br/>`

Status tras elegir en un panel (como chain): `<b>Dijiste:</b> «{label}». {siguiente paso}.`
- tras independencia: `<b>Dijiste:</b> «{label}». Ahora conecta la segunda rama y mira la primera.`
- tras Tronco: `<b>Dijiste:</b> «{label}». Ahora enciende los tres talleres sin reventar el Tronco.`

Goals (`.bench-goal`) por fase:
- predict-independence: `¿Qué le pasa a la primera rama cuando conectes la segunda?`
- show-independence: `Conecta la segunda rama y mira la primera.`
- predict-trunk: `¿Qué le pasa al Tronco si las tres piden mucho a la vez?`
- solve: `Enciende los tres talleres sin reventar el Tronco.`

Status inicial: `Tres bocas de taller; la primera ya corre. Antes de conectar nada, observa qué hace.`

## 7. Tests (`m5-branches.test.ts`) — reescribir

Cubrir: `branchRiver` de cada piedra; estado inicial (branch0 conectada amarilla=river 2,
branch1/2 desconectadas); `predictIndependence`/`predictTrunk` setean; conectar la 2ª NO
cambia el river de la 1ª; `connectedSecond` true al conectar la 2ª; `trunkRiver` suma;
fusible (warning→burned por insistencia; 3 marron=24 quema directo); `replaceTrunkFuse`
resetea; **victoria** = 3 conectadas + Tronco ≤ 8 + ambas predicciones + connectedSecond
(ej.: 3 gris = Tronco 3, con predicciones hechas → `isBranchesSolution` true); y que SIN
predicciones la misma configuración da `false`; no-victoria si una rama desconectada o Tronco > 8.
Terminar con `console.log('M5 branches tests: OK');`.

## 8. Verificación que debe pasar (corré antes de entregar)

- `node --experimental-strip-types tests/m5-branches.test.ts` → imprime OK.
- `npm run build` (tsc + vite) → sin errores.
