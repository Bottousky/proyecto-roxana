# Gemini peer task — A2 Plaza + Taller coherence

Act as the independent read-only reviewer for A2 of the Ohmdal Arco I authored
pass. Review only the supplied evidence. Do not edit files, run shell, invent
canon, request a Plaza redesign, or extrapolate later-region quality.

## Read only

- `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`
- `docs/20-worlds/ohmdal/production/ARCO1_CANONICAL_SHOTS.md`
- `docs/20-worlds/ohmdal/production/ARCO1_AUTHORED_PASS_POLICY.md`
- `assets/references/region-packs/plaza/README.md`
- `assets/references/region-packs/workshop/README.md`
- `output/playwright/ohmdal-arco1-authored/a2-fast-sol-verify/capture-manifest.json`
- A2 player-facing captures:
  - `output/playwright/ohmdal-arco1-authored/a2-fast-sol-verify/workshop-exterior.png`
  - `output/playwright/ohmdal-arco1-authored/a2-fast-sol-verify/workshop-interior-tools.png`
  - `output/playwright/ohmdal-arco1-authored/a2-fast-sol-verify/galvanoscope-first-person.png`
- Exact accepted Plaza baseline:
  - `output/playwright/ohmdal-arco1-authored/a0-fast-sol-verify/workshop-approach.png`
  - `output/playwright/ohmdal-arco1-authored/a0-fast-sol-verify/plaza-wide.png`
- A2 Plaza regression evidence:
  - `output/playwright/ohmdal-arco1-authored/a2-plaza-regression/capture-manifest.json`
  - `output/playwright/ohmdal-arco1-authored/a2-plaza-regression/workshop-approach.png`
  - `output/playwright/ohmdal-arco1-authored/a2-plaza-regression/plaza-wide.png`
- `output/playwright/ohmdal-hardening/golden-path/golden-path-run.json`

## Facts supplied by Sol to verify against evidence

- The five accepted Plaza shots are byte-identical to their A0 captures.
- A2 FAST used Chrome 151 on Intel UHD / D3D11 with
  `softwareRendered=false`; console and page error arrays are empty.
- The Taller-only capture reports 33 draw calls / 8,676 triangles; the
  Galvanoscopio capture reports 60 draw calls / 15,028 triangles; one
  shadow-casting light remains.
- The post-change Golden Path completed all 22 checkpoints.

## Evaluate

1. Does Plaza remain visually unchanged, with no demonstrated reason to reopen it?
2. Does the exterior clearly read as the existing functional Taller entrance?
3. Does the interior now read as an authored diagnostic workshop rather than a
   dark empty greybox: bench, measurement board, terminals, conductors, tools and
   Galvanoscopio affordance?
4. Are lighting, material hierarchy and restrained electrical language
   consistent with the supplied bible, without decorative neon?
5. Do the captures and diagnostics show a player-facing, mobile/performance or
   evidence blocker that justifies another A2 iteration?

Do not request decorative polish, final hero modeling, new narrative, or changes
to accepted Plaza topology. Later-region work has priority over optional A2 polish.

## Return

- `VERDICT: PASS | PARTIAL | FAIL`
- up to five prioritized findings with severity and exact evidence path
- `PLAYER_FACING_BLOCKERS`
- `NON_BLOCKING_DEBT`
- `DO_NOT_FIX`
- `ANOTHER_A2_ITERATION: YES | NO`
- whether Sol may accept A2 and begin A3

Gemini is advisory. Sol owns acceptance.
