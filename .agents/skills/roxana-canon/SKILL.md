---
name: roxana-canon
description: Locate the canonical documentation for Proyecto Roxana, resolve contradictions, and avoid inventing lore, pedagogy, or architecture. Use before any change that touches world, governance, or curriculum.
---

# roxana-canon

Authoritative documentation lives in `docs/`. Code, tests, and data in the repo are the second tier of authority. **Engram / memory never overrides docs or code.**

## Authority hierarchy

```
governance (00-governance/)            # CANON, level 0
  -> global (10-global/)                # level 2
    -> world (20-worlds/<world>/)       # level 3
      -> content (world/content/)       # level 4
        -> production (80-production/)  # level 5
          -> task contract              # level 6
            -> implementation evidence  # level 7
```

If a contradiction appears, apply `docs/00-governance/ROXANA_CANON_POLICY_v1.md`:
- higher level wins;
- equal level: latest ratified wins;
- experimental docs never overrule ratified ones;
- ADRs ratify or supersede.

## Locating the canon for a question

1. **Identify the world.** `docs/20-worlds/<world>/` (ohmdal / physica / bitland / arithmos). If the question spans worlds, check `10-global/` first.
2. **Read the world's `AGENTS.md`.** It points to the active ADRs, the room-based or world-specific contract, and the migration status.
3. **Find the relevant GDD/contract.** For Ohmdal architecture, start with `SPATIAL_CONTRACT.md`, `ARC1_ROOM_GRAPH.md`, `ARC1_SPATIAL_MAP.md`, and the area fiches in `room-based/areas/`. For pedagogy, the world's `*puzzle-grammar*` and `*mechanics-progression*` docs.
4. **Check the visual reference only if the question is about art direction.** `docs/arco1/` is a reference pack; it does not govern runtime architecture post `ADR-001` / `ADR-002`.

## What to do at each contradiction

| Situation | Action |
|---|---|
| Code contradicts ratified doc | Code migrates. File an issue with the doc link. Do not silently edit the doc to match. |
| Two ratified docs disagree | Higher authority level wins. Log the conflict in `13_OPEN_QUESTIONS_AND_DECISIONS.md` for the world. |
| Doc contradicts an ADR | ADR wins. Update the doc or escalate. |
| Memory / engram contradicts docs | Memory loses. Re-anchor on the doc and update the memory entry. |
| No doc answers the question | State "no canon" and propose the smallest investigation. Do not invent. |

## Distinguishing categories of statements

When in doubt, classify the statement before acting on it:

- **CANON** — ratified, governs, in force. Cite it.
- **PROPOSED** — drafted, in review, not yet ratified. Treat as input, not as rule.
- **LEGACY** — superseded but historically relevant. Do not use as a current source.
- **EXPERIMENTAL** — may change, isolated to a branch or spike. Confirm scope before relying on it.
- **REJECTED** — explicitly closed. Do not re-open without an ADR.
- **MEMORY** — derived from past sessions. Subordinate to docs. Verify before re-using.

## Citing paths

When you cite canon in a task contract, handoff, or commit message, use repo-relative paths so they survive moves:

```
docs/00-governance/ADR-002-room-local-spatial-architecture.md §2
docs/20-worlds/ohmdal/room-based/SPATIAL_CONTRACT.md §3.2
src/jugar/roomGraph.ts:1-50
```

Do not cite absolute paths in shared artifacts.

## Hard rules

- **Never invent lore, dialogue, curriculum, or pedagogy.** If a string or concept is missing, leave the smallest `TODO(guion)` or `TODO(pedagogy)` marker and report it.
- **Never promote an implementation to canon.** The code may reflect a decision, but the promotion requires an ADR or a ratified doc change.
- **Never let engram/memory override docs or code.** If the conversation history disagrees with the repo, the repo wins.
- **Always surface the source.** Every canon claim in a handoff must end with a file:line or a doc path.
