# MiniMax M3 Task — Manantial activation VFX v2

## Objective

Propose ONE small PlayCanvas technical-art module for the authored Manantial pass: a physically motivated event sequence that communicates generator energization without permanent glow.

## Context to attach

- `src/experiences/ohmdal-playcanvas/world/manantial/buildManantialShell.ts`
- the actual Manantial authored/runtime file(s) that exist at execution time
- `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_VFX_AUDIO_PLAN.md`
- one existing local effect/update pattern chosen by Sol

## Strict scope

Do NOT design a framework or multi-file package. Propose at most:

- one TypeScript module;
- one settings object;
- optional inline shader strings only if truly necessary.

Target sequence:

`contact closes → brief terminal event → conductor response → generator state read → quiet stabilized state`

Requirements:

- no textures/sprite sheets required;
- no ambient random arcs;
- emission only during justified event/indicator state;
- deterministic timing;
- mobile reduction parameter;
- explicit cleanup/disposal;
- no new dependency;
- use only PlayCanvas APIs that can be verified from the supplied code/contracts; flag uncertain APIs instead of inventing them.

## Output

1. exact module API;
2. implementation proposal;
3. integration points by file/function name;
4. tunable settings;
5. expected draw/material/overdraw impact;
6. uncertainties requiring Sol verification.

Do not claim PASS. Sol owns integration and acceptance.
