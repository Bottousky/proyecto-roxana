---
name: educational-puzzle-design
description: Design educational puzzles that teach through interaction, not through quiz prompts. Use when a slice, area, or mechanic carries a pedagogical claim.
---

# educational-puzzle-design

The default Roxana pattern:

```
objetivo pedagógico
  -> intuición (lo que el jugador espera)
     -> interacción (lo que el jugador hace)
        -> feedback (lo que el jugador observa)
           -> descubrimiento (lo que el jugador entiende solo)
              -> formalización (símbolo / número / código, si corresponde)
```

A slice is pedagogically valid only if the player can reach the **descubrimiento** without being told the answer.

## What to avoid

- **"Pregunta escolar -> respuesta correcta".** "What is V = I * R?" is not a puzzle. A mechanism where the player changes a current by re-routing a conductor and observes the lamp brighten is.
- **Modal quizzing.** A pop-up that blocks the world to ask a question is almost always wrong. If you need to ask, the interaction design is wrong.
- **Spoilers diegéticos.** Putting `V`, `I`, `R`, "serie" or "paralelo" in the diegesis before the player has built the intuition breaks the transfer. The vocabulary in the world is diegético (Empuje, Río, Piedra, Camino, Freno, Chispa). The technical vocabulary appears only at the formalisation step.
- **One canonical solution.** A puzzle that has exactly one solution and no bypass teaches obedience, not understanding. Validate conditions; allow multiple paths when the system actually allows them.
- **Hidden solution behind grind.** If the player cannot reach the answer through the interaction, the puzzle is broken; do not paper over it with retries or hints.

## The five-step checklist

For every slice that carries a pedagogical claim, fill these:

1. **Pedagogical target.** What is the player supposed to understand? Keep it to one sentence.
2. **Pre-conception to disrupt.** What wrong model is the player most likely to bring? (Common ones: current = speed, voltage = amount, resistance = bad, "more = better".)
3. **Affordance that surfaces the target.** What does the player see / click / move / combine that makes the target visible?
4. **Failure that teaches.** What is the most likely mistake, and what does the system do that makes the misconception visible? The failure must produce useful information, not just punishment.
5. **Transfer task.** A small variation the player can solve without being told, using only the intuition built by the slice.

If you cannot fill these five, the slice is not ready for production. Go back to the director.

## Pedagogical patterns that already work in Ohmdal

- **Predicción → intervención → observación → explicación → transferencia.** Visible in the electrical-system docs. Use it as the default loop unless a slice justifies a different shape.
- **Validación por condiciones, no por secuencia.** A lock opens when the conditions are met, not when a specific action sequence is executed. Allow alternative paths when the system permits.
- **Modelos puros fuera del renderer.** `src/puzzles/*Model.ts` hold the renderer-agnostic logic. The renderer reads from them; the renderer is never the source of truth for a concept.
- **Feedback inmediato.** The player sees the effect (lamp, spark, motion, sound) before seeing the number. Numbers appear in the formalisation moment, not before.

## How to integrate with lore and gameplay

- A pedagogical claim must not contradict ratified lore (`20-worlds/<world>/narrative/*`). If it does, escalate to the director; do not pick a winner.
- A pedagogical claim must not require a new engine, dependency, or platform capability unless an ADR authorises it.
- A pedagogical claim is allowed to require **new** world content (NPC, line, scene), but the content is owned by the world's `content/` tier and follows the world's voice rules (Spanish neutral, tutear, no modal banks).

## When the slice has no pedagogical claim

Some slices are mechanical, visual, or technical (rendering, performance, accessibility, tooling). The pedagogical claim can be a single line: "no learning claim; this slice is X." The director's contract records that explicitly so the playtester and reviewer do not invent a learning target.

## Hard rules

- **Never replace interaction with a quiz.** A modal question is a code smell.
- **Never introduce the technical symbol before the player has the intuition.** The formalisation moment is the **end** of the slice, not the entry.
- **Never ship a puzzle with no failure mode that teaches.** A puzzle that only succeeds or silently resets teaches nothing.
- **Never rely on grind, retries, or hints to mask a broken affordance.** Fix the affordance.
- **Never let a single canonical solution stand when the system allows alternatives.** Validate conditions, not steps.
