# Ohmdal — Interaction Policy for Electrical Puzzles

**Status:** production contract for Arco I greybox validation  
**Authority:** subordinate to canon/puzzle grammar; does not promote narrative to canon.

## Principle

Ohmdal is **world-first**: the player manipulates the electrical world rather
than solving detached UI minigames.

The same underlying electrical model must remain authoritative whether the
player is standing in the world, holding the Galvanoscopio or using a close-up
maintenance view.

## Interaction layers

### A — Direct world interaction (default)

Use for elements whose scale and spacing are legible in normal play:

- breakers / switches;
- cables, jumpers and busbars;
- terminals and probe points;
- relays and bells;
- fuses / protections;
- valves, gates, pumps and mechanical loads;
- visible routing between source and load.

The player approaches the real object, observes it, predicts, manipulates it and
sees the consequence in the same space.

### B — Instrument interaction

The Galvanoscopio is a first-person lens into the same world. Measurements target
actual nodes/entities and read the same electrical state used by the puzzle.
The instrument must never become an answer detector that bypasses reasoning.

### C — Diegetic maintenance close-up

Allowed — and expected — when normal first-person interaction would become
fiddly, visually ambiguous or inaccessible, especially on mobile.

Examples:

- dense distribution panel in the Castle;
- Forge protection/component selection;
- Lighthouse calibration panel;
- a workbench with several small connection points.

This is **not a separate minigame**. It is a camera/interaction mode anchored to
the physical object in the world:

1. player approaches and engages the panel/bench;
2. camera moves/zooms to a readable maintenance view;
3. the same real components/nodes are manipulated;
4. changes immediately affect the world model;
5. exit returns to the same world state.

No duplicate "UI circuit" with separate truth is allowed.

### D — Schematic / Bitácora

Schematics, notes and Bitácora may explain, record or compare evidence. They are
not the primary input surface for solving the circuit and must not turn the
puzzle into multiple choice.

## When to choose a close-up view

Use C instead of forcing A when one or more of these are true:

- hit targets become unreliable on touch/mobile;
- multiple small terminals overlap from normal camera distance;
- the player needs to compare several adjacent components at once;
- precision placement would otherwise test motor control rather than electronics;
- readability requires labels/markings that would be illegible at world scale;
- the physical operation is naturally performed at a bench/panel.

Do **not** use C merely because it is easier to code.

## Component selection

Puzzle family P5 (dimensioning) may use a contextual set of available parts.
Selection is valid if it represents physical stock at the bench/panel and the
chosen component is installed into the same simulated system. Avoid generic
inventory menus detached from location and consequence.

## Arco I expectation

- Plaza / Manantial: mostly A + B.
- Castle: A plus one or more C panels for distribution/topology density.
- Forge / Terraces: A for large routing/loads; C for protection/component work.
- Faro: A for world-scale signal/energy path; C only for fine calibration.

A whole chapter must never collapse into a single bench screen. The player must
move through the place, observe causes/effects at world scale and transfer what
was learned between contexts.

## Acceptance

A puzzle interaction passes only if:

- the phenomenon is visible before explanation;
- the player can form a hypothesis before changing state;
- manipulation changes the real model, not a proxy answer state;
- mistakes produce readable evidence and recovery;
- at least one consequence is visible/audible in the world;
- desktop and touch/mobile remain operable;
- automated tests validate electrical conditions rather than a fixed click order.
