# Ohmdal — VFX / Audio Plan for Arco I Authored Pass

## Goal

Use motion, sound and procedural effects to make electrical and hydraulic state legible. Effects support the simulation; they do not invent new mechanics.

## Core rule

**Energy is an event, not wallpaper.** Copper, stone and machinery do not glow passively. Emission, sparks, arcs, heat and motion must have a physical trigger and a quiet/off state.

## Reusable VFX layers

Prefer small composable modules rather than one monolithic effect:

- `conductorPulse` — brief travel cue along an energized path;
- `terminalArcBurst` — short localized discharge at a real contact/terminal;
- `contactSnap` — relay/contactor closure with mechanical motion + tiny arc;
- `heatRamp` — local material response for forge/filament/load;
- `waterMist` — state-dependent spray/mist near active flow, never ambient everywhere;
- `dustWake` — mechanical startup/door/bell response;
- `generatorSpinUp` — staged motion/audio envelope;
- `protectionTrip` — mechanical trip + state loss, readable and recoverable.

All parameters should live in explicit settings objects where practical: timing, count, lifetime, amplitude, density and mobile scale.

## Area plan

### Plaza / Taller

- Ohm: restrained activation cues only.
- Campana: real bell strike, relay/contact sound, minor dust/mechanical response.
- Taller: small tool/mechanical sounds; Galvanoscopio needle/contact feedback.

### Manantial / Central

Priority technical-art lab:

- dormant water bed;
- sluice movement;
- water flow ramp;
- turbine/generator spin-up;
- protection trip and reset;
- localized terminal/conductor events;
- spray/mist tied to flow rate;
- layered water + mechanical hum audio.

### Castillo

- breaker/isolator mechanics;
- branch energization cues kept subtle;
- service-state ambience changes;
- protection trip/reset;
- no glowing network-map substitute.

### Forja / Terrazas

- forge heat/load sound;
- conductor/load stress cues only near limits;
- protection response;
- pump/valve/water channel state for terraces;
- environmental contrast between industrial and irrigated spaces.

### Faro / Lago

- restrained machinery/calibration feedback;
- environmental lake/wind bed;
- stable-state signal/light behavior consistent with current DC gameplay;
- no invented RC pulsing.

### Final return

Layer restored-state ambience from systems already activated: water, bell/service, forge/irrigation and Faro. Do not add a generic victory shimmer.

## MiniMax M3 usage

During GMI trial, M3 is most useful when given:

1. one target effect;
2. exact existing code files/interfaces;
3. the visual/material bible;
4. a short reference implementation if available;
5. strict output limits and mobile budget.

Avoid prompts asking M3 to design an eight-file VFX framework from scratch. Prefer one module or one effect decomposition at a time.

Every result is proposal-only and recorded in `agent-work/reports/minimax-gmi/EVALUATION.md`.

## Audio generation

If a currently authorized MiniMax/GMI endpoint can produce speech/music/audio without new paid spend, candidate media may be generated into staging with prompt/model/provenance. If the existing runner only supports text M3, use M3 to author audio briefs and defer actual generation to the official supported media route. Do not build a new provider framework solely for the trial.

## Acceptance

An effect/audio layer passes if:

- trigger maps to a real system event;
- quiet/off state is correct;
- it improves player interpretation;
- it remains readable without excessive bloom;
- mobile reduction is defined;
- no persistent unrelated particles/arcs remain;
- performance delta is measured on an affected canonical shot.
