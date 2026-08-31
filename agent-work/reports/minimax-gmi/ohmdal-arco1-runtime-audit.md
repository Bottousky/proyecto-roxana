# MiniMax GMI Worker Report

- Provider: GMI Cloud
- Model: `MiniMaxAI/MiniMax-M3`
- Task: `agent-work/tasks/minimax/ohmdal-arc1-runtime-audit.md`
- Context files: `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts`, `src/experiences/ohmdal-playcanvas/systems/campaign/arc1GreyboxModel.ts`
- Created: 2026-08-25T02:23:00.768Z
- Elapsed ms: 59366
- Usage: `{"prompt_tokens":25530,"completion_tokens":4535,"total_tokens":30065,"prompt_tokens_details":{"cached_tokens":133,"cache_write_tokens":0}}`
- Authority: proposal-only; Codex/Sol must verify, apply, test and accept.

---

# Arco I greybox runtime audit

I read both files end-to-end and looked only for load‑bearing issues that map to the seven failure categories in the brief. Findings below are confined to the runtime wiring; I did not run anything.

---

## 1. `castle_restored` can be reached by documentation alone, bypassing the energize step (and tripping the "completed by a flag" risk)

**File:** `src/experiences/ohmdal-playcanvas/playcanvasRuntime.ts`
**Symbol:** `castle_document_station` action inside `getActiveInteractables()` (the `inCastle` branch).

**Why it’s load‑bearing.** The pure model requires `castle.energized && measuredCurrentConfiguration && structurallyValid && documented` to consider the castle restored. The runtime, however, lets the player document a configuration even when `arc1State.castle.energized` is `false` and the protection is not tripped, because `documentCastleNetwork` itself only re‑checks `structurallyValid && measuredCurrentConfiguration`. Combined with the "Energizar" panel action being disabled while `protectiveTrip` is true (see Issue 2), this is the one path in the castle where the chapter can be completed purely by documenting, without ever having energized.

Worse: if the player configures → measures → documents without ever calling `energizeCastleNetwork`, the snapshot says `castle.energized = false` but `castle.documented = true` and `castleRestored = true` (per `evaluateCastleNetwork`). The pure model’s `restored` requires `castle.energized`, so the runtime is reading a state the model says is not restored, but then `getArc1Progress` follows it and `storyStep` flips to `castle_restored` and the gate to Forja unlocks. That is exactly the "runtime snapshot disagrees with the pure model" category.

**Smallest concrete patch.** In the `castle_document_station` action, gate documentation on energization:

```ts
action: () => {
  if (!arc1State.castle.energized) {
    ui.showNotification('Energizá la distribución antes de documentarla.');
    return;
  }
  arc1State = documentCastleNetwork(arc1State);
  if (isCastleRestored(arc1State)) storyStep = 'castle_restored';
  ui.showNotification(isCastleRestored(arc1State)
    ? 'Esquema publicado: el Castillo puede aislar y mantener sus ramas.'
    : 'Medí y energizá una configuración válida antes de documentarla.');
  updateArc1WorldVisuals();
},
```

The same class of bug is symmetric in the forge terraces ("`terraces_pump_control`" / `documentForgeTerraces`) and the lighthouse (`lighthouse_return_marker` calls `documentLighthouse` which only checks `structurallyValid`, not `restored`); those deserve the analogous guard. Mark as **uncertain to the degree of player agency** until you confirm whether the team intended "document" to imply an implicit energize.

---

## 2. `castle_distribution_panel` becomes a no‑op while the model says the network is structurally invalid, silently re‑arming protection without ever placing the configuration

**File:** `playcanvasRuntime.ts`
**Symbols:** `castle_distribution_panel` action, `energizeCastleNetwork`, `repairCastleNetwork`.

**Why it’s load‑bearing.** The panel is labeled "Rearmar protección del Castillo" only when `arc1State.castle.protectiveTrip` is true. But `repairCastleNetwork` is also a no‑op when there is no trip. The real failure is the inverse: when the castle is **not** tripped, the action is `energizeCastleNetwork` and the model returns `'castle-protection-trip'` plus `recoverableFaults++` whenever `evaluation.structurallyValid || evaluation.measuredCurrentConfiguration` is false. In that case the runtime shows "La protección actuó: la configuración no cumple condiciones." and leaves the player with no recovery affordance at this panel — but the next click on the same panel (still not tripped from the runtime’s point of view if the player re‑enters and the state is fresh) calls `repairCastleNetwork`, which clears the trip and increments `castle.repairs`. The pure model exposes a "recoverable fault" precisely so a player can iterate; the runtime collapses "recoverable" into a single mis‑click. The forge and lighthouse panels have the same shape, but castle is the one reachable from the plaza gate and therefore the most exposed.

Additionally, after the protective trip the `castle_bus_measure` and `castle_parallel_layout` / `castle_mixed_layout` actions are still active, but `configureCastleNetwork` resets `energized: false` and `documented: false` (good), while `measureCastleNetwork` does **not** clear the trip. So a player can re‑measure while tripped, document the re‑measurement, and the issue 1 path opens. Confirms the same root cause.

**Smallest concrete patch.** Two options, in order of intrusiveness:

a. Mirror the forge panel behavior: while `protectiveTrip`, the action is always `repairCastleNetwork`, regardless of which body‑level affordance was clicked. Concretely, in `castle_distribution_panel`:

```ts
action: () => {
  if (arc1State.castle.protectiveTrip) {
    arc1State = repairCastleNetwork(arc1State);
    ui.showNotification('Protección rearmada; revisá topología y medición.');
  } else {
    arc1State = energizeCastleNetwork(arc1State);
    ui.showNotification(arc1State.castle.protectiveTrip
      ? 'La protección actuó: la configuración no cumple condiciones.'
      : 'Distribución energizada; verificá y documentá.');
  }
  updateArc1WorldVisuals();
},
```

(That is the same shape used in the forge panel and is what the comment "Rearmar protección del Castillo" already implies, so this is more of a guard than a behavior change.) Same fix in `lighthouse_distribution_panel` analog (lighthouse calibration panel) and in `forge_distribution_panel` if you want symmetry.

b. Or, less surgically, change `repairCastleNetwork` to refuse to clear when `state.castle.measurements.length === 0` or when the latest measurement is older than the trip — but that requires model changes which Sol owns.

Mark as **uncertain** without runtime evidence of how often a player ends up in the tripped state and which affordance they reach for; both the pure model and the runtime agree the path is recoverable, but the runtime offers a confusing affordance at the recovery step.

---

## 3. Returning traversal can leave multiple zone roots active at once and **never deactivates `plaza` before activating `castle` when entering from the Plaza**

**File:** `playcanvasRuntime.ts`
**Symbols:** `castle_route` action; `zones.register({ id: 'plaza', ... })`; `world.workshopInteriorRoot.enabled = false;` at mount.

**Why it’s load‑bearing.** The zone registry is the only thing that toggles render roots. The `castle_route` action does `zones.deactivate('plaza')` only on this transition, but:

- The `lighthouse_return_marker` action does `zones.deactivate('lighthouse')` and `zones.activate('forge-terraces')`, the `terraces_exit` action does `zones.deactivate('forge-terraces')` / `zones.activate('castle')`, and the `castle_exit_gate` action does `zones.deactivate('castle')` / `zones.activate('plaza')` only on the return branch — but on the forward path it just does `zones.deactivate('castle')` / `zones.activate('forge-terraces')`, **not** `zones.deactivate('plaza')`. So if the player walks back from the castle into the plaza bounds without crossing the return trigger, the `plaza` root is still enabled **and** the castle root was just disabled, which is fine — but the symmetry is broken on the forward Manantial/Castle transition, which is the one the spec calls out. Compare to `puerta_ohm`, which `zones.activate('manantial')` but never `zones.deactivate('plaza')` either, and to `workshop_exterior_door` which never deactivates `plaza`. Result: the `plaza` zone is permanently `active: true` from `void zones.initializePlaza();` until a Manantial return.

- More concretely, the `lighthouse_return_marker` action activates `forge-terraces` while the player is teleported to `(120, 1.68, 24, 180)`. At that pose, the runtime is still in the `lighthouse` zone (x > 160) for the `getActiveInteractables` selection until the next frame’s `setActive` callback runs, so the lighthouse’s `lighthouse_return_marker` itself can be re‑triggered for a frame. Uncertain magnitude, but it’s a duplicate‑interactable hazard for the very affordance that drives "return traversal".

**Smallest concrete patch.** Make the activations symmetric and order them deterministically. For example, in `lighthouse_return_marker`:

```ts
arc1State = enterArc1Region(arc1State, 'retorno');
zones.deactivate('lighthouse');
void zones.activate('forge-terraces').then(() => {
  teleportPlayer(120, 1.68, 24, 180);
  storyStep = 'returning';
  ui.showNotification('Regresá por Terrazas, Castillo y Plaza; los estados restaurados persisten.');
});
```

(The activation is awaited before teleporting so the `inLighthouse` predicate cannot re‑select the marker; this also matches what `workshop_exterior_door` already does in the opposite direction.) Apply the same "deactivate‑first, then activate, then teleport" pattern to `castle_route`, `puerta_ohm`, `terrazas_exit` (forward and return), `castle_exit_gate` (forward and return), and `gate_return_to_plaza`. This is the "wrong roots active after return traversal" category.

Uncertain whether the team wants the `plaza` root to remain visually enabled (as a backdrop) while the player is in the Castle; if so, the spec should add an `id: 'plaza-shell'` zone. Until then, the asymmetry is real.

---

## 4. Mobile / touch cannot operate the same model: interactables are only wired through pointer lock and the `E`/`F`/Enter/Space keys

**File:** `playcanvasRuntime.ts`
**Symbols:** `onKeyDown` (the `if (k === 'e' || ...)` branch), `canvas.addEventListener('click', ...)`, the entire `triggerInteraction` proximity loop, the prompt logic in the `world.app.on('update', ...)` loop, `ui.setPrompt(...)`.

**Why it’s load‑bearing.** On a touch device there is no `keydown` for `e/f/enter/space` and no `pointerlockchange` to enter pointer lock; the canvas `click` listener, if it fires on tap, will try `canvas.requestPointerLock?.()` first and otherwise fall through to `triggerInteraction()`. The proximity selection in `triggerInteraction` reads `world.playerEntity.getPosition()` and `item.pos`; with no movement keys the player can never enter any interactable’s radius unless an explicit teleport fires, and on first touch the player is at `(0, 1.68, -8.0)`. The only way a touch user can ever trigger `edda_npc` (radius 3.2 at `(1.8, 1.0, -8.0)`) is by tapping the canvas; but `canvas.requestPointerLock?.()` is gated on `currentMode === 'explore' && !activeDialogueNode && !isPointerLocked`, and on iOS Safari that call rejects and the prompt is suppressed. The model’s `getArc1Progress` then never advances because no measurement, gate, or bell ever fires.

The `viewmodel calibration` block in the update loop adjusts `viewmodelRoot` layout for `graphicsDevice.width <= 600` but never exposes a tap‑to‑interact fallback, so the Galvanoscope HUD can show numbers on a phone but the player has no way to bind `isToolEquipped` or to fire a `connectProbe`. This is a clear "touch/mobile interaction cannot operate the same model" blocker for Arco I.

**Smallest concrete patch.** Make the canvas click handler not be a pointer‑lock gate, and add a tap‑to‑pick path that uses the camera forward vector. Minimal version:

```ts
canvas.addEventListener('click', (e) => {
  if (activeDialogueNode) { advanceDialogue(); return; }
  // Forward ray from camera, project to world plane y=1.0 within 5m.
  const forward = cameraForward();
  const pick = playerPos.clone().add(forward.mulScalar(3.0));
  // Walk a synthetic Interactable at `pick` through getActiveInteractables.
  const hit = getActiveInteractables().find((it) => pick.distance(it.pos) <= it.radius);
  if (hit) hit.action();
  else if (!isPointerLocked) canvas.requestPointerLock?.();
});
```

And add a mobile‑only virtual `E` button that calls `triggerInteraction()`. Without runtime evidence I can’t tell whether the spec wants tap‑to‑advance‑dialogue (it should, the dialogue advance already happens via `triggerInteraction` if a dialog is open), so the `if (activeDialogueNode) { advanceDialogue(); return; }` early‑out is the safest one‑liner — at minimum, it stops the pointer‑lock request from swallowing tap input on platforms where `requestPointerLock` is unsupported. Mark as **uncertain to the degree that Sol wants mobile in scope at all**, but the spec says "touch/mobile interaction cannot operate the same model" is a failure category and this is the only mobile surface in the file.

---

## 5. Repeated interaction on the `campana` interactable can corrupt plaza state and silently double‑open the castle gate

**File:** `playcanvasRuntime.ts`
**Symbols:** `campana` action in `getActiveInteractables()` (outdoor branch); `pullCampana`; `openCastleGate`; `updateCircuitStateVisuals`.

**Why it’s load‑bearing.** The `campana` action does several things in sequence:

1. Toggles the knife switch in the workbench model.
2. Forces `circuit.branches.b_ida_rele.state = 'closed'` regardless of the workbench state.
3. Calls `solveCircuit(circuit)`.
4. **If** `isManantialRestored(arc1State)`, calls `pullCampana(arc1State)` and `openCastleGate(arc1State)`.
5. Otherwise calls `updateCircuitStateVisuals()` (which only updates the world).

The pure model’s `pullCampana` increments `state.plaza.bellPulls` **only** when `isRelayEnergized(state)` is true. The runtime, however, fires the audio, unlocks `bitacora.unlock('lengueta_edda')`, and shows the "La campana resonó" notification on **every** press, even if `bellPulls` is rejected by the model. The discrepancy isn’t visible to the player, but the bigger issue is `openCastleGate`: `isCastleGateOpen` is idempotent (it’s a boolean), but the runtime never updates `circuit.gateOpen` on the campana path. So:

- Repeated presses keep toggling `b_ida_rele` and re‑solving the circuit. If the player has the jumper installed and the corrosion cleaned, `circuit.gateOpen` is true; pressing the campana again with Manantial restored will *first* toggle the knife switch in the workbench (which the runtime has just forced back to closed in step 2), then force the relay closed again, and the bell plays. The Plaza state in the model is `bellPulls: N, castleGateOpened: true`; the runtime’s `circuit` is whatever the workbench just produced.

- More importantly, the *runtime* does not reflect `pullCampana` being rejected when Manantial isn’t restored. The HUD never tells the player that the bell pull didn’t register as a system event; they just hear the chime. That’s the "repeated interaction corrupts or resets valid progress" category, narrowly.

- One concrete corruption: if the player opens the workbench (`cuadro_rele`) and toggles the knife switch **off** while still in the campana radius, then taps the campana, the runtime re‑forces `b_ida_rele = closed`, so the manual workbench toggle is silently undone. Whether that is intended is a design call, but the spec lists "repeated interaction corrupts or resets valid progress" as a blocker, and this fits.

**Smallest concrete patch.** Make the campana action idempotent against the workbench and only call the model on a real change:

```ts
action: () => {
  const relayWasOpen = circuit.branches.b_ida_rele.state === 'open';
  if (relayWasOpen) {
    audio.playBellChime();
    audio.playRelayEngage();
    workbench.toggleKnifeSwitch();
    circuit.branches.b_ida_rele.state = 'closed';
    circuit = solveCircuit(circuit);
  }
  if (isManantialRestored(arc1State)) {
    if (relayWasOpen) {
      arc1State = pullCampana(arc1State);
      if (!arc1State.plaza.castleGateOpened) arc1State = openCastleGate(arc1State);
      updateArc1WorldVisuals();
    }
    bitacora.unlock('lengueta_edda');
    ui.showNotification('La Campana cerró el relé alimentado por Manantial; la ruta al Castillo está abierta.');
  } else {
    bitacora.unlock('lengueta_edda');
    updateCircuitStateVisuals();
    ui.showNotification('¡La campana resonó! El relé de enclavamiento cerró su circuito.');
  }
},
```

This makes the chime an honest reflection of the model event, prevents the silent workbench override, and stops `pullCampana` from firing when the bell is rung on a still‑open relay while Manantial is restored. Uncertain whether `pullCampana`’s `bellPulls` counter is meant to be exposed to the player at all; the pure model exposes it deliberately, so the runtime should reflect it (or stop advertising it).

---

## Risks to verify (no proven blocker beyond the above)

1. **`ohm_automaton_pedestal` final‑return path does not call `enterArc1Region(state, 'retorno')` before checking `isLighthouseRestored`.** The forward chain sets `currentRegion = 'retorno'` only on `lighthouse_return_marker`. If a player returns to the pedestal by some other route (e.g. visual harness `setState('restored-plaza')` then teleport), `currentRegion` may be `'faro'` and the pedestal action takes the arc‑complete branch without ever having gone through `retorno`. The pure model would refuse `enterArc1Region(state, 'portal')` from `'faro'` (only `'retorno'` can re‑enter `portal`), but the runtime doesn’t call `enterArc1Region` in the arc‑complete branch — it just sets `storyStep = 'arc1_complete'`. So `isArcComplete(arc1State)` can be true while `state.currentRegion !== 'retorno'`, which means the snapshot disagrees with the model.

2. **`setVisualState('restored-plaza')` resets `arc1State` to `createArc1GreyboxState()`** but then advances `storyStep` and `circuit` directly without calling the model. The snapshot is consistent at the moment of the call, but the `world.copperJumper.enabled = true` / `world.corrosionMesh.enabled = false` are not the result of the model’s `evaluateManantial`; they’re hand‑set. That’s fine for a visual harness, but it means the snapshot and the world can drift between `setState` and the next user action. Worth a deterministic re‑projection (call `updateArc1WorldVisuals()` at the end of the `restored-plaza` branch).

3. **`zones.snapshot()` in `getPlaytestSnapshot` lists `loaded` and `active` zones, but the `manantial` zone’s `load: () => undefined` means it will never be `loaded` even after `void zones.preload('manantial')`.** Confirm that `OhmdalZoneLifecycle` does not treat `load: undefined` as "already loaded"; if it does, the diagnostics are correct; if it expects a promise, `manantial.loaded` is permanently `false` and the snapshot disagrees with the model’s `manantial.measurements` existing. Cannot confirm without reading `zoneLifecycle.ts`, which is out of scope per the brief.
