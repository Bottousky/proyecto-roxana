---
name: minimax-media-production
description: Produce image, audio, music, vision, search, and short video assets through the MiniMax CLI as a tool, not as a source of truth. Use when a slice, area, or prop needs final art or audio.
---

# minimax-media-production

`mmx` is a **tool**. It is never a source of truth for lore, pedagogy, or gameplay. Every asset it produces must pass through the studio's selection and integration gates before it ships.

## Default decision tree

```
does the slice NEED a final asset right now?
  no  -> placeholder. do not call mmx.
  yes ->
    is the asset cheap, small, and reversible?
      no  -> stop. escalate to the director. do not generate.
      yes ->
        does the slice have a budget for it?
          no  -> stop. set a budget first.
          yes ->
            generate -> inspect -> validate -> only then move to final destination
```

A `placeholder` is the default for almost every slice. Calling `mmx` is the exception.

## Capabilities (and their guardrails)

| Capability | Default model | When to use | Guardrail |
|---|---|---|---|
| `image` | `image-01` | hero prop, area mood, key frame | never overwrite a final asset automatically; save to `minimax-output/<slice>/<id>.png` first |
| `vision` | `image-understanding` | describe a reference, compare two compositions | never use vision to invent lore; it is a tool for inspection |
| `speech` | `speech-2.8-hd` | NPC lines, narration, audio cues | ≤10k chars per call; keep prompts reproducible |
| `music` | `music-3.0` | area ambience, short stings | never generate long music for a smoke test; prefer instrumental, ≤30s for tests |
| `search` | MiniMax web search | discover references, check a fact | never use as a substitute for the canonical docs in `docs/` |
| `video` | `MiniMax-Hailuo-2.3` (or `-Fast`) | WOW moments only | **pay-as-you-go risk**; never run for tests; never auto-merge; always require explicit user confirmation |

## Workflow

1. **Plan the asset** with the director. Identify what the asset must show, the references to honour, the resolution/aspect ratio, and the budget in credits or time.
2. **Check quota first.** `mmx quota show` is non-destructive. If the slice does not have budget, stop.
3. **Generate to a working directory**, never to the final path. Use `minimax-output/<slice>/<id>.<ext>`. Save the prompt alongside the output (a sibling `.prompt.txt`) for reproducibility.
4. **Inspect.** Open the file. Compare against the references. Compare against the `IDENTITY.md` / `COLOR_SCRIPT.md` for the world. Reject if it breaks voice, scale, palette, or pedagogy.
5. **Validate.** Drop the asset into the running build at the actual scene scale. Check the camera framing. Check the touch/desktop target. Check the asset at the smallest expected screen size.
6. **Move to final destination only after validation passes.** Never let `mmx` write directly to `public/` or any other production path.
7. **Update the manifest.** `docs/asset-manifest.yaml` (or the world's `production/asset-pipeline`) records the asset id, prompt, model, and provenance.

## Greybox before art

For Ohmdal (and any room-based world), the rule is:

```
GREYBOX multi-area in src/jugar/  ->  H2-H7
       |
       v
pase de arte sobre greybox aprobado  ->  H8
       |
       v
polish
```

Calling `mmx image` to "see how the prop would look" before the greybox is approved is **explicitly discouraged**. The greybox is the test rig. The asset must serve the rig, not the other way around.

## What `mmx` is **not**

- Not a substitute for the canonical docs in `docs/`.
- Not a substitute for the player's first impression in-game.
- Not a tool to bypass a budget or a loop cap.
- Not a place to "save time" by skipping validation.
- Not a path for pay-as-you-go video. Video requires explicit user confirmation; never call it speculatively.

## Hard rules

- **Never overwrite a final asset automatically.** Generate, inspect, validate, then move.
- **Always save the prompt** next to the output.
- **Always check quota before a batch.** If the budget is tight, prefer one good call over ten cheap ones.
- **Never generate video without explicit user confirmation** in the current turn.
- **Never use `mmx` to author lore, dialogue, or curriculum.** Generation is a tool, not an authority.
- **Never bypass the manifest.** The provenance of an asset belongs in `docs/asset-manifest.yaml`.
- **Never leave assets orphaned in `minimax-output/`.** Either promote them or delete them. Do not let them rot.
