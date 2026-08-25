# MiniMax engineering audit — Arco I runtime wiring

## Purpose

Perform one additional real production task during the GMI evaluation: audit
the newly integrated Arco I greybox runtime against its pure model. This is a
proposal-only review; Sol owns fixes, tests and acceptance.

## Scope

Read only the attached runtime and model. Do not propose dependencies, engine
changes, art/VFX polish, dialogue, lore, or a rewrite of the hardened harness.

## Questions

Find only load-bearing issues that could cause one of these failures:

- a chapter can be skipped or completed by a UI/flag rather than system state;
- a productive failure becomes unrecoverable;
- a required interaction is unreachable or shadowed by another interactable;
- zone activation/deactivation or return traversal leaves wrong roots active;
- the runtime snapshot disagrees with the pure model;
- touch/mobile interaction cannot operate the same model;
- repeated interaction corrupts or resets valid progress.

For each issue, cite exact functions/identifiers and give the smallest concrete
patch suggestion. Maximum five issues. Explicitly mark uncertain findings that
need runtime evidence. If none are proven, return `NO PROVEN BLOCKER` plus up to
three risks to verify.

Do not claim tests or browser execution.
