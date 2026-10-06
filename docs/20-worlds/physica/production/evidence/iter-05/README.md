# Iteration 05 — the cascade water (evidence)

**Main result:** the column now has apparent volume, foam and continuous flow, and its shape still comes from the same field as the bodies. Design in `../../DECISIONES.md` D11; the review and its response are in `REVISION.md`.

**What changed in the water:**
- **Spring:** the column now leaves the pool's surface, pushed by the spring's pressure, which is declared in the model.
- **Thickness:** it follows continuity, and at the crest it is capped by the radius of curvature, so the stream no longer folds over itself.
- **Body and veil:** a body plus a torn veil, with waves that travel at the water's own speed.
- **Foam:** a crown of froth at the crest and foam mounds where the water wells up and where it lands.
- **Pools:** the ripples now spread out in rings from the spring and from each landing point.
- **Wet rock:** declared zones with a rounded falloff.
- **Opening shot:** familiar fall, then the column.

**Images:**

| Prefix | Version |
|---|---|
| `antes-*` | Before |
| `intermedio-*` | The version that went to review |
| `despues-*` | After the corrections |

Same shots in all three: `w1` spring, `w2` column, `w3` crest, `w4` landing, `w5` left fall, `w6` play camera.

## Technical (measured)

- `npm test`: 44/44. The water test now checks that the column comes out of the pool with the declared velocity, crests over the Terraza, lands on it, and rises clear of the face.
- **Keyboard route** (`report.json`, Apple M2, headless Chrome, load 4.2–4.3 across 8 cores): the full route, all three shaft outcomes and the steps pass; 10 notes persist; 0 errors.
- **Frame times:**

  | Situation | p50 | p95 | p99 | max | steps dropped |
  |---|---|---|---|---|---|
  | Idle | 16.7 | 16.7 | 16.8 | 16.8 | 0 |
  | Crossing | 16.7 | 16.7 | 16.8 | 16.8 | 0 |

  Before the warm-up, the first crossing showed hitches of 150–250 ms.
- **Route harness:** two failures came from the harness, not from the game:
  - `walkTo` used a wall-clock budget, and under load the simulation advances more slowly. It now uses simulated time.
  - The sheets are composed in a second tab, which left the game tab with `requestAnimationFrame` stopped. The game tab is now brought back to the front.

## Not verified

- The look of the veil at grazing angles in close-up.
- Sound.
- Performance over 60 s with the vista, on a quiet machine.
- Mobile.
- Whether a person reads "this water is going up" without anyone explaining it.
