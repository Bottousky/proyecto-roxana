# Ohmdal Arco I — Player-Facing Correction Pass (B-Series)

Status: **APPROVED CONTRACT — 2026-08-30**

Baseline: merge commit `fcc49441c9bb403a0c51d68c78638ee7215f2c52` (A0–A8 authored milestone).

This pass exists because the authored Golden Path proved technical continuity but did not sufficiently validate the human experience of the first 5–10 minutes. Treat the items below as one coherent player-facing correction pass, not unrelated bug fixes.

## Product rule

Ohmdal teaches through play, not through lecture.

For every important electronics concept, prefer:

**phenomenon -> interaction -> consequence -> name -> later reuse**

Never explain an important electronics concept before the player has had a chance to experience it when the scene can teach it physically.

The student avatar is curious but not already trained in electronics. Avoid making the student answer like an examiner or technician.

Edda is the comic and cultural counterpoint: superstition, incense, inherited rituals and folk explanations exist because technical knowledge was lost. Preserve that identity without turning her into a caricature.

## First-minutes target flow

`Portal -> arrival cinematic -> Edda reception -> curiosity toward dormant Ohm -> inspect rear hatch -> close circuit puzzle -> Ohm wakes -> Edda reacts -> objective to tell Lumen -> orient west -> reach workshop`

The flow must work on desktop and touch/mobile.

---

## B1 — First entry cinematic + Edda staging + RPG dialogue presentation

### First-entry cinematic

On the player's **first entry into Ohmdal**, run a short, skippable arrival cinematic before free exploration.

Preferred implementation: in-engine cinematic using the existing Portal/Plaza world so staging matches the playable scene. Search repo/history for the older Ohmdal-history cinematic only as a possible reusable reference/asset; do not block on finding it.

Target beat:

1. portal transition / energy cue;
2. brief reveal of the detained Plaza;
3. player materializes;
4. Edda notices and physically turns/approaches or is unmistakably staged in view;
5. dialogue begins only after Edda is visible.

Target duration: roughly 8–12 seconds. Skippable. Persist a local `intro seen` flag so it does not replay on every room re-entry or refresh when normal persistence exists.

### Edda visibility bug

Edda already has runtime representation; the acceptance condition is not merely that the entity exists. She must be visibly staged in-world before her first dialogue line, at a valid position, scale and camera-relative distance.

### Approved dialogue intent

The exact wording may receive bounded copy polish without a human gate as long as facts and character intent remain unchanged.

Opening intent:

- Edda is shocked that someone crossed the portal.
- She says she has never seen anyone cross it in her lifetime.
- The student response is brief and human, not technical.
- Edda may attribute the event jokingly to incense/rituals.

Reference tone, not immutable script:

> EDDA: "¡Alguien cruzó el portal!"
>
> EDDA: "Desde que nací no vi cruzarlo a nadie. ¡A nadie!"
>
> ESTUDIANTE: "Eh... hola."
>
> EDDA: "Sabía que los sahumerios estaban funcionando."

### Dialogue HUD

Upgrade the dialogue experience so it reads as an RPG, not a generic web modal.

Required:

- speaker name with strong hierarchy;
- character portrait support actually used for Edda/Ohm/Lumen when they speak;
- portrait may initially be derived from an existing 3D character render/capture; no paid generative asset is required;
- compact lower dialogue box with restrained game-like framing;
- short readable text blocks;
- clear continue affordance;
- clicking/tapping anywhere on the dialogue box advances when no choice is present;
- keyboard/gamepad-style advance may remain;
- no accidental page scrolling/selecting during gameplay.

Do not invent a giant HUD redesign outside this scope.

---

## B2 — Why touch Ohm + integrated ZoomIn circuit puzzle + awakening reaction

The player currently lacks a natural reason to investigate dormant Ohm. Fix this with environmental/narrative curiosity, not a classroom instruction.

### Curiosity cue

After Edda's reception, Ohm should produce a subtle failed-life cue: servo twitch, relay click, weak pilot indicator or equivalent. Edda can mention that Ohm has been dormant for years and that Lumen told people not to meddle.

Preferred objective wording is exploratory, e.g. **"Investigá qué le pasa a Ohm"**, not "solve the circuit".

### Inspection interaction

Approaching the rear/inspection side of Ohm exposes an `Inspect` interaction.

Activating it enters a dedicated **ZoomIn inspection mode** focused on Ohm's rear hatch / service panel. It must feel physically attached to Ohm, not like an unrelated quiz screen.

### Puzzle contract

Build the first electronics lesson as a physical continuity puzzle:

- a visible source/path/load relationship;
- one or more interrupted conductor paths;
- player manipulates cables/terminals to create a continuous path;
- no Ohm's-law arithmetic, voltage/resistance numbers or multiple-choice question required;
- feedback is physical: connector snap, relay, pilot light, pulse, servo/audio response;
- completion closes the current path and wakes Ohm;
- puzzle state is deterministic and testable outside rendering;
- touch targets are usable on mobile;
- the puzzle cannot be bypassed by merely pressing Interact again.

Keep difficulty introductory but non-trivial: the player should perform a meaningful connection action, not click a single glowing button.

### Awakening reaction

Ohm awakening is a small wow moment: sound, motion and lighting may react, but avoid permanent copper neon/glow.

Edda must react immediately. Approved intent:

> "No... no puede ser."
>
> "¡Despertaste a Ohm!"
>
> "¡Tenemos que contárselo a Lumen!"

This reaction naturally creates the next objective.

---

## B3 — Dialogue pedagogy rewrite

Rewrite the early Portal/Plaza/Ohm/Lumen-facing dialogue that currently assumes too much electronics knowledge.

### Remove premature technical examination

Avoid early exchanges dominated by exact values such as 24 V, 4 ohm, 6 A, explicit formula recital, unit checking or the student explaining "diferencia de potencial" before the game has built an experience for those terms.

The student should describe what they physically did in ordinary language first.

Reference pattern:

> OHM: "Mi alimentación estaba interrumpida."
>
> ESTUDIANTE: "Había un cable suelto. Lo conecté."
>
> OHM: "Entonces cerraste el camino."
>
> EDDA: "Yo iba a probar con otro sahumerio."

Technical vocabulary may be introduced after the physical experience, sparingly, and then reinforced by later gameplay.

### Scope authorization

For this B-series, bounded dialogue wording changes that preserve the approved intent above are **explicitly authorized** and are not a HUMAN_GATE. Any change to canon facts, character relationships, curriculum sequence or major story topology remains a HUMAN_GATE.

---

## B4 — Orientation language + compass + pointer-lock lifecycle

### Compass

If Edda or another NPC says the workshop is **west**, the player must have a visual orientation language.

Add a restrained compass/heading HUD. It may show `N E S O` (Spanish Oeste = O) or an equivalent localized heading strip. Do not add a full GPS/minimap unless separately approved.

When Edda first directs the player west toward Lumen, give the west/target direction a brief subtle emphasis. No permanent glowing trail is required.

### Pointer-lock bug

Current desktop behavior releases the pointer for dialogue/interaction and requires an extra click after the interaction to regain camera control.

Required lifecycle:

- if gameplay entered a modal/dialogue/inspection state from an actively pointer-locked exploration state, remember that origin;
- when the modal state ends normally, reacquire gameplay camera control automatically where browser policy permits from the same trusted interaction chain;
- do not require a meaningless extra click just to move the camera again;
- if the player explicitly used Escape/menu/unlock intent, do not forcibly steal the pointer back;
- touch/mobile must never depend on pointer lock.

Add regression coverage for the state transition even when browser API details need an integration test.

---

## B5 — Mobile/touch + landscape-first

Mobile is a first-class target, not a desktop page with controls overlaid.

Required:

- movement works with touch controls;
- camera look works by dragging an appropriate right-side/free-look region;
- interaction has a reliable touch target;
- dialogue advances by tapping the dialogue box;
- ZoomIn Ohm puzzle is fully solvable by touch;
- no pointer-lock dependency;
- UI respects safe-area insets;
- touch targets are comfortably sized;
- portrait dialogue layout remains readable in landscape phone dimensions.

### Landscape-first behavior

Ohmdal's gameplay view is landscape-first.

A web page cannot universally force device rotation. Implement progressive behavior:

1. after an explicit user gesture/fullscreen entry, attempt `screen.orientation.lock('landscape')` only where supported;
2. if unsupported or denied and viewport is portrait, display a polished in-game rotate-device gate;
3. automatically continue when landscape is detected;
4. never hard-fail unsupported browsers solely because orientation lock API is absent.

---

## B6 — Human Golden Path acceptance for the first 5–10 minutes

The final B-series gate is not only build/tests/screenshots.

Run a desktop and mobile/touch first-minutes path:

`Portal -> cinematic -> Edda visible -> dialogue -> Ohm curiosity -> rear inspection -> circuit puzzle -> awakening -> Edda reaction -> west orientation -> travel toward/into Lumen workshop`

PASS requires all of the following:

- intro plays only when appropriate and can be skipped;
- Edda is visible before speaking;
- RPG dialogue HUD uses portraits for named NPC speakers covered by this slice;
- dialogue can be advanced by click/tap on its box;
- early dialogue does not lecture with unearned technical jargon;
- the student does not sound pre-trained;
- Ohm cannot awaken without puzzle completion;
- puzzle communicates open/closed continuity through play;
- Edda's awakening reaction leads naturally to Lumen;
- west instruction is supported by compass/heading UI;
- desktop returns to camera control without an extra meaningless click after normal dialogue/interaction completion;
- mobile movement, camera, interaction and puzzle all work by touch;
- portrait phone orientation receives the landscape-first gate/fallback;
- no softlock, page error or functional console error in the path;
- existing A-series room topology/electrical state outside this slice is not regressed.

## Out of scope / hard gates

Do not change engine, room topology, curriculum sequence, major dependencies, paid asset spend or canon facts without HUMAN_GATE.

Do not redesign later Arco I regions merely because the B-series reveals unrelated polish opportunities. Record those as debt and keep this pass bounded.
