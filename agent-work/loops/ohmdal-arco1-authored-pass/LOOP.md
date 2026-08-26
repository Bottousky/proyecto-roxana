# Ohmdal Arco I — Authored Pass Loop

## Mission

Convert the accepted playable Arco I greybox into a coherent authored vertical slice while preserving validated gameplay, electrical model, zone lifecycle and Plaza baseline.

Baselines:

- hardening: `dec2d75`
- playable Arco I greybox: `b8bb412`
- closed greybox loop: `74abaad`

A0–A3 are accepted. Current implementation is A4 Castillo; commit `b923ef7` contains partial A4 work recovered from the interrupted Codex session.

## Authority and execution

- **ChatGPT web / GPT-5.6 Sol** — technical/design authority, task shaping and material acceptance.
- **Gemini 3.7 Flash High / Antigravity builder** — preferred general executor for authored scene work in isolated branch/worktree; workspace-write; cannot self-approve.
- **Gemini Flash reviewer** — separate read-only session/process only.
- **Codex Luna Max** — bounded mechanical worker.
- **Codex Terra** — medium fallback.
- **Codex Sol** — break-glass only when strong reasoning + local tools are demonstrably required.
- **MiniMax M3 / GMI** — bounded technical-art specialist; current runner proposal-only; its output must be verified before integration.

The previous rule “Codex Sol is the single integrator” is retired. A worker may perform an explicitly specified mechanical integration, but **no builder accepts its own work**. Acceptance remains with ChatGPT/Sol plus Manuel where material judgment is needed.

## Bounds

- max 3 visual/fix iterations per stage;
- max 5 fixes per iteration;
- max 1 structural fix per iteration;
- max 2 disjoint Luna workers;
- max 1 MiniMax task at a time;
- no engine/dependency/canon change;
- no Meshy/Tripo spend without HUMAN_GATE;
- no invented final dialogue;
- no worker self-approval.

## Capture policy

1. **FAST local GPU** — current stage load-bearing shots. Hardware renderer required for hardware claims.
2. **FULL acceptance** — canonical shots + desktop/mobile/no-post + Golden Path + console/page errors + performance diagnostics.
3. SwiftShader is functional fallback only; never hardware FPS evidence.

A3 proved FAST on NVIDIA GTX 1660 Ti / D3D11 with `softwareRendered=false`.

## Stages

### A0 — Baseline + capture readiness — PASS

### A1 — Reference planning — PASS

### A2 — Plaza + Taller — PASS

### A3 — Manantial / Central — PASS

Hydraulic/electrical mechanism authored and simulation-driven; Gemini independent review PASS; Golden Path 22/22.

### A4 — Castillo de la Red — ACTIVE

Turn the distribution greybox into a monumental civic distribution hall/substation. Preserve real branch/protection state and accepted parallel/mixed alternatives.

Current partial work already adds branch-state readability and support reference gating. Do not restart from scratch. First inspect `b923ef7`, focused Castle tests and pending A4 review task.

Candidate PASS evidence: authored castle captures, focused tests/build, Golden Path, no page/console errors. Builder can prepare evidence but cannot mark accepted.

### A4B — Navigation + Scenic Shell Hardening — REQUIRED BEFORE A5

Human playtest exposed production debt that Golden Path did not catch.

Required:

- zone-local collision ownership;
- solid authored geometry cannot silently lack collision;
- door/transition spawn anchors use `position + lookAt/directionIntoZone`, not memorized yaw constants;
- initial Portal spawn faces into Plaza/Ohm, not back to Portal;
- wall-challenge/door-facing automated tests for load-bearing transitions;
- collision debug visualization or equivalent deterministic diagnostic;
- interiors close their architectural shell except intentional doors/windows;
- use the scenic rendering policy: sky/atmosphere → far horizon → cheap 3D scenic shell → gameplay 3D;
- adjacent-zone portal proxies allowed to prevent void/sky views without eagerly loading full zones.

Do not add a physics engine merely to solve this. Prefer a small deterministic navigation/collision contract.

PASS requires no known wall-through bugs in load-bearing boundaries, correct facing on every Arco I transition, Golden Path PASS and representative screenshots showing no accidental huge sky holes in interiors.

### A5 — Forja + Terrazas

Author industrial heat/current/protection versus irrigation service. Keep the trade-off legible through the world.

### A6 — Faro + Lago + return

Author remote culmination and restored return. Keep current DC truth; RC/transient remains a future seam.

### A7 — VFX + audio + ambient motion

Event-driven, physically meaningful, restrained. M3 may be used on bounded technical-art questions. No permanent copper glow.

### A8 — Full authored Golden Path / freeze

Full Portal→Faro→return, canonical captures, desktop/mobile/touch, no-post, errors/perf, independent review and authority acceptance.

## Worker candidate rule

A builder may continue preparing **candidate** work beyond the current accepted stage only when:

- prior candidate tests/build are green;
- it commits each candidate milestone separately;
- it does not mutate `queue[*].status` to `passed` or set loop `complete`;
- no HUMAN_GATE is present;
- no material canon/engine/curriculum change is required.

This permits long overnight worker batches without granting self-approval.

## HUMAN_GATE

Stop for contradictory hero references, paid spend, canon/curriculum/engine/major dependency changes, gameplay-topology changes, serious mobile/perf regression, or three failed iterations. Missing final dialogue remains `TODO(guion)` and is not a gate.

## Required evidence

For each candidate milestone:

- focused tests + build;
- relevant FAST captures and renderer diagnostics;
- zero functional console/page errors;
- Golden Path when player-facing topology/interactions are touched;
- commit hash;
- worker report with known debt;
- MiniMax evaluation entry when M3 is used.

Final acceptance is separate from worker completion.
