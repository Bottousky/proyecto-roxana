# Gemini peer task — Ohmdal Plaza context audit

## Objective

Use Gemini's large-context strength to reduce the amount of repository context Codex must load before implementing the first 3D Plaza art pass.

## Inspect

Prioritize these sources and follow their internal references only when needed:

- `AGENTS.md`
- `GEMINI.md`
- `docs/00-governance/ROXANA_CANON_POLICY_v1.md`
- `docs/20-worlds/ohmdal/AGENTS.md`
- `docs/20-worlds/ohmdal/vision/`
- `docs/20-worlds/ohmdal/gameplay/`
- `docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md`
- `docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_AGENTIC_3D_STACK.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_ACQUISITION.md`
- `docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_CATALOG.json`
- `docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ART_PASS_01.md`
- `docs/3d/`
- the current PlayCanvas Plaza/Ohmdal spike implementation only where needed to resolve a factual conflict

Do not inspect unrelated Roxana worlds unless an explicit cross-world contract requires it.

## Questions

1. What is the smallest authoritative reading set Codex actually needs for `OHMDAL_PLAZA_ART_PASS_01.md`?
2. Which statements across the inspected sources conflict, are stale, ambiguous, or likely to make an implementation agent choose the wrong direction?
3. What spatial/visual truths must remain stable in the Plaza: landmarks, sightlines, circulation, scale, pedagogical affordances and environmental storytelling?
4. Which proposed generic assets are safe support surfaces, and which surfaces must stay authored/identitarian?
5. Which technical/art risks can make the Plaza look like a generic medieval asset flip rather than Ohmdal?
6. Which decisions are already resolved and should NOT consume Codex reasoning again?
7. Which unresolved decisions genuinely require human approval before or during the art pass?

## Output format

Return a concise but evidence-rich report with exactly these sections:

1. `CODEX MINIMAL READING SET` — ordered list, target <= 10 files unless impossible.
2. `RESOLVED DECISIONS` — facts Codex can treat as settled for this task.
3. `CONTRADICTIONS / STALE GUIDANCE` — file paths, conflict and recommended authority.
4. `PLAZA INVARIANTS` — spatial, visual and pedagogical constraints.
5. `ASSET / ART RISKS` — ranked high/medium/low.
6. `HUMAN DECISIONS REQUIRED` — only genuine blockers; `none` if there are none.
7. `IMPLEMENTATION BRIEF FOR CODEX` — max 700 words, executable wording, no broad history.
8. `FILES INSPECTED` — complete path list.

Do not propose a new engine, agent framework or lore unless the inspected authority explicitly requires it.