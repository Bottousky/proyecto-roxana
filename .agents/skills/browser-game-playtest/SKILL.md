---
name: browser-game-playtest
description: Decide when a change needs browser QA, and produce structured evidence when it does. Use the browser-playtester agent and this checklist for any change that affects the player-facing path.
---

# browser-game-playtest

## When browser QA is required

A change needs a browser playtest when it touches one or more of:

- **Navigation**: spawn, doors, exits, entries, transitions, doorway/fade/cinematic edges.
- **Camera**: follow, clamp, dead zone, cinematic mode, viewport changes.
- **Rooms**: graph changes, new rooms, room renames, scene profile edits, area fiches.
- **Interaction**: hotspots, prompts, click-to-move, joystick, dialog, bitácora, end screen.
- **Puzzle**: open/close, completion state, pedagogical feedback, the failure mode that teaches.
- **UI**: HUD, overlay, dialog system, save/load, any overlay shown during play.
- **State**: save game, restore, reset, edge transitions, transitions across reload.
- **Entry points**: `/jugar`, `/jugar?spawn=...`, integration with the hub, portal links.
- **Performance**: when a budget is declared in the contract.
- **Mobile/touch**: when the contract requires it.

A change does **not** require a browser playtest if it is purely a model under `src/puzzles/`, a shared utility under `src/shared/`, an internal data shape, or a test that the build gate already covers. Even then, the reviewer may still ask for a quick render check.

## The structured evidence

For every playtest pass, return exactly this shape:

```text
build        : <commit / branch / local run>
route tested : <e.g. /jugar?spawn=cuenca>
steps        : <numbered, what the playtester actually did>
expected     : <per step, what the contract said should happen>
actual       : <per step, what happened>
console      : <errors / warnings, verbatim, filtered for spinners and known noise>
screenshots  : <paths under tests/ or .playtest/screenshots/ if used>
repro        : <smallest reproduction path>
verdict      : PASS | BLOCKER | MAJOR | MINOR
criterion    : <which acceptance or learning criterion is violated, if any>
```

`BLOCKER` and `MAJOR` are the only severities that block merge. `MINOR` files an issue. `PASS` is the default when nothing was found.

## First pass vs second pass

- **First pass: blind-first.** The playtester receives only the player goal, the controls, the starting state, the success target, and any mobile/touch constraints. They do **not** see the diff, the tests, or the implementation. They play, then they describe.
- **Second pass: reproduce.** Only after the first pass may the playtester use Playwright, console, network, snapshots, `page.evaluate` for read-only state inspection, or screenshots to convert observations into reproducible findings. A screenshot alone is not proof of state correctness.

## Sanitising evidence

- Strip query strings that contain tokens, dev overrides, or environment variables before persisting a screenshot.
- Do not capture Bitácora entries that include real player text or user IDs.
- Filter the console log for spinners, network polling, and other known noise. Keep the actual errors and warnings verbatim.

## Common findings worth surfacing in the contract

- A door that opens but the player does not realise they crossed a room.
- A transition that visually completes but the `ActiveRoom` is stale (catches the next interaction in the wrong room).
- A camera clamp that hides the target the player is supposed to click.
- A puzzle that completes on a single click without the player ever seeing the cause-effect.
- A path that works on desktop but breaks under touch because the hotspot is smaller than the touch target.

## Hard rules

- **The playtester does not fix.** Every finding is reported. Patches belong to the `game-worker` after the contract is updated.
- **A green build is not a green feature.** Mechanical gates are a precondition, not a verdict.
- **Do not invent findings to look thorough.** A short `PASS` with no findings is a valid result.
- **Do not block on aesthetic taste.** If the slice has no visual acceptance criterion, a "ugly" prop is not a finding.
- **Do not capture secrets.** Sanitise before persisting.
