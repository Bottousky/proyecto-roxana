# MiniMax Task — Ohmdal Electrical VFX Evaluation

## Purpose

Evaluate MiniMax M3 as a technical-art worker on a real Ohmdal need. The result
must be useful to Sol even if it is not integrated verbatim.

## Target

Design a small, reusable PlayCanvas procedural VFX package for electrical events,
starting with:

1. `electric-conductor-pulse`;
2. `terminal-arc-burst`;
3. composition seam for an awakening/activation sequence.

This is not a fantasy spell. It visualizes physical electrical events in Ohmdal.

## Canon / style constraints

- passive copper identity has emissive = 0;
- glow/emission exists only during actual electrical events;
- no permanent neon;
- no magical runes;
- no generic sci-fi plasma aesthetic;
- effects must help the player read cause/effect;
- mobile-conscious overdraw and particle counts;
- settings are the API: expose timing, count, width, intensity, decay and color
  parameters instead of hiding constants across shaders.

## Technical constraints

- Runtime target: PlayCanvas Engine v2 + TypeScript.
- Three.js can be reference material, never a runtime dependency.
- Prefer procedural geometry/shaders/particles over sprite-sheet effects where
  practical.
- Keep layers independent so Sol can enable/disable/tune them.
- Provide deterministic time states suitable for capture/review.
- Include lifecycle/disposal notes.
- Do not require a new large dependency.

## Requested output

Return:

1. proposed module/API shape;
2. exact TypeScript + shader code or unified diffs against the attached context;
3. integration points in the current PlayCanvas world/runtime;
4. exposed settings with sensible defaults;
5. performance risks and mobile fallback knobs;
6. test/capture plan;
7. what you would tune after seeing first captures.

Do not claim you ran the code. Sol will integrate and test.

## Suggested context attachments

Attach only what is actually useful, for example:

- `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`;
- `src/experiences/ohmdal-playcanvas/visualHarness.ts`;
- the smallest current world/runtime file or extracted VFX-related module needed;
- `docs/3d/VISUAL_HARNESS.md` if capture contract is relevant.

If external Three.js VFX source is supplied later, treat it as a technique
reference and preserve attribution/license requirements; do not transplant a
Three.js dependency into Ohmdal.
