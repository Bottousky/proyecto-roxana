# Worker Task — Normalize A4 evidence to candidate protocol v2

## Purpose

Repair only the evidence contract for the already-produced A4 Castle candidate on `worker/gemini-authored`. Do not redo A4 artwork and do not invent an implementation delta.

## Facts to verify first

- Canonical SHA at the start of this repair must be read from `origin/explore/ohmdal-3D`.
- Existing A4 branch commit `3feb8553abdfb16caf59646d60257e8bc667a3a2` is report-only relative to its canonical base.
- A4 authored implementation was already present in the canonical/recovered runtime before that report-only commit.

If those facts are not true, stop and report the discrepancy rather than fabricating metadata.

## Required action

Re-run/confirm the existing A4 evidence on the current canonical state and rewrite:

`agent-work/reports/workers/ohmdal-authored-gemini-current.md`

The report MUST begin with these exact machine-readable fields:

```text
CANDIDATE_MODE: validation-only
BASE_SHA: <exact current canonical 40-hex SHA>
IMPLEMENTATION_SHA: NONE
EVIDENCE_STATUS: PASS
SELF_ACCEPTANCE: false
```

Then preserve the useful human-readable evidence: build/tests, Golden Path, capture manifest, GPU diagnostics, remaining debt and scope statement.

## Validation-only meaning

This packet asserts that the current canonical state already contains the A4 authored implementation and that the worker is validating it; it does NOT claim a new implementation commit.

Therefore:

- do not edit runtime/world/scene files;
- do not edit loop state;
- do not edit MiniMax scope;
- only the evidence report may change;
- commit and push the corrected report to `worker/gemini-authored`;
- stop.

If any A4 gate is no longer PASS, set `EVIDENCE_STATUS: FAIL`, explain why and stop.
