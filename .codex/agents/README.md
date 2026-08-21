# Codex specialized roles — routing notes

These TOML files define bounded role contracts. They do **not** prove which
model or reasoning effort Codex MultiAgentV2 will execute.

## Parent obligations

1. Classify the task first; Tier 0–2 is single-agent/single-builder by default.
2. Spawn a role only when its independent evidence is useful.
3. For every fresh specialist set `fork_turns="none"` explicitly.
4. Request `model` and `reasoning_effort` explicitly when the spawn API exposes
   them; never assume TOML inheritance.
5. Send a compact `templates/SUBAGENT_TASK_PACKET.md`, not parent history or raw
   Explorer transcripts.
6. After the first child completes, run
   `scripts/codex-subagent-audit.ps1` and compare requested/configured/observed.
7. Stop fan-out on unexpected Sol, higher effort or excessive context and report
   `HARNESS_ROUTING_MISMATCH`.

## Role boundaries

- `game-explorer`: read-only, ambiguity only, no full gates.
- `game-worker`: the ONE writer, focused tests plus one final mechanical gate.
- `browser-playtester`: blind-first, source read-only, minimal `.playtest/`
  evidence.
- `game-reviewer`: read-only and milestone-only by default.

Every role has `CAN_SPAWN_CHILDREN=false`, a context/output budget and a stop
condition. `turn_context.model` and `turn_context.effort` in the rollout are the
authority for reporting effective routing.
