# F5 Forja Completa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el evento mayor F5 de la Forja con reglas puras, banco interactivo, resolución narrativa, audio y restauración visual.

**Architecture:** `forgeModel.ts` será la única fuente de verdad para río, entrega, pico, calor, fusible protector, stock y Tronco. `forge.ts` adaptará ese estado al banco DOM y `rooms.ts` administrará presentación, flags, Bitácora y modo práctica. No se crearán excepciones por máquina: el Martillo queda limitado al canal ancho por las reglas generales.

**Tech Stack:** TypeScript, DOM, Phaser 4, Vite, Node TypeScript stripping para tests.

---

### Task 1: Modelo puro y aceptación matemática

**Files:**
- Create: `src/puzzles/forgeModel.ts`
- Test: `tests/f5-forge.test.ts`

- [ ] **Step 1: Write the failing test**

Crear casos para:

```ts
evaluateForge(canonical).valid === true;
evaluateForge(lumbreEnMedio).valid === true;
evaluateForge(martilloEnMedio).valid === false;
evaluateForge(martilloEnMedio).machines.martillo.fuseProtectsChannel === false;
```

Iterar todas las filas de hasta cuatro piedras, grosores con stock válido y fusibles
para comprobar que ninguna combinación con Empuje 16 resuelve. Verificar además que
el setter de grosor no permite consumir más de `1 ancho / 2 medios / 2 angostos`,
que la canónica usa Tronco 7 y que una combinación con Tronco mayor que 8 falla.

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node --experimental-strip-types tests/f5-forge.test.ts
```

Expected: `ERR_MODULE_NOT_FOUND` para `src/puzzles/forgeModel.ts`.

- [ ] **Step 3: Write minimal implementation**

Definir:

```ts
export type ForgeMachineId = 'martillo' | 'fuelle' | 'lumbre';
export type ForgePush = 8 | 16;
export type ForgeStone = 'marron' | 'roja' | 'amarilla' | 'gris';
export type ForgeFuse = 1 | 2 | 4 | 8;

export interface ForgeBranchState {
  stones: ForgeStone[];
  thickness: ChannelThickness | null;
  fuse: ForgeFuse | null;
  channel: ChannelCutState;
}

export interface ForgeState {
  push: ForgePush;
  branches: Record<ForgeMachineId, ForgeBranchState>;
  solved: boolean;
}
```

La evaluación debe usar `Math.floor(push / resistencia)`, `entrega = push * río`,
`pico = río + 1`, calor del pico mediante `heatLevel`, fusible mínimo disponible
que cumpla `calibre >= pico`, protección `calibre <= tolerancia * 1.5`, entregas
exactas y `Tronco <= 8`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node --experimental-strip-types tests/f5-forge.test.ts
```

Expected: `F5 forge tests: OK` una vez completadas también las integraciones de texto.

### Task 2: Banco interactivo

**Files:**
- Create: `src/puzzles/forge.ts`
- Modify: `src/styles.css`
- Test: `tests/f5-forge.test.ts`

- [ ] **Step 1: Extend the failing test**

Comprobar que el banco contiene cristal 8/16, tres filas de piedras, stock compartido,
fusibles 1/2/4/8, termómetros, agujas de rama, aguja de Tronco, botón
`Arrancar la Forja`, modo práctica y los textos canónicos de fallo y resolución.

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node --experimental-strip-types tests/f5-forge.test.ts
```

Expected: fallo porque `forge.ts` no existe.

- [ ] **Step 3: Implement the bench**

Construir `abrirForge({ practica, onSolved })`. Cada tarjeta de máquina permitirá
editar piedras, grosor y fusible. Al arrancar mostrará el pico en agujas y termómetros,
consumirá fusibles jóvenes, acumulará insistencias de canales al rojo, permitirá
repararlos y mostrará diagnósticos informativos. En solución normal expondrá
`Continuar`; en práctica expondrá `Reiniciar práctica`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node --experimental-strip-types tests/f5-forge.test.ts
```

Expected: las comprobaciones del banco pasan.

### Task 3: Narrativa, audio y mundo restaurado

**Files:**
- Modify: `src/audio.ts`
- Modify: `src/game/rooms.ts`
- Test: `tests/f5-forge.test.ts`

- [ ] **Step 1: Extend the failing test**

Comprobar presentación textual, resolución textual, `sfxForgeRhythm()`,
`setFlag('solvedForgeNetwork')`, `setFlag('forgeRestored')`,
`setFlag('learnedPower')`, `notifyNewEntry('El Jornal')`,
`openBitacora('el-jornal')`, modo práctica y colores condicionados por
`forgeRestored` en las cuatro salas.

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node --experimental-strip-types tests/f5-forge.test.ts
```

Expected: faltan integración, audio y textos.

- [ ] **Step 3: Implement integration**

Reemplazar `// TODO(F5)` por `abrirForge`. Presentar una sola vez por sesión:

```text
Todo junto, una vez. Como cuando era niña.
Tres máquinas, un solo tronco, y el cobre que hay: un canal ancho, dos medios,
dos angostos. Ni uno más. Repártelo bien.
```

Al resolver, marcar los tres flags, notificar `El Jornal`, refrescar y abrir
`el-jornal`. Añadir `sfxForgeRhythm()` con `tone()` y `noise()`. Hacer que `floor`
y `wall` de las cuatro salas elijan una paleta más cálida con `forgeRestored`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node --experimental-strip-types tests/f5-forge.test.ts
```

Expected: `F5 forge tests: OK`.

### Task 4: Verificación completa

**Files:**
- Verify: `tests/*.test.ts`
- Verify: production build

- [ ] **Step 1: Run every test**

Run:

```powershell
Get-ChildItem tests -Filter '*.test.ts' | Sort-Object Name | ForEach-Object {
  node --experimental-strip-types $_.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Expected: todos los archivos imprimen `OK`.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm.cmd run build
```

Expected: TypeScript y Vite terminan con código 0.

- [ ] **Step 3: Review final diff**

Run:

```powershell
git diff --check
git status --short
git diff --stat
```

Expected: sin errores de whitespace y sin commits nuevos.
