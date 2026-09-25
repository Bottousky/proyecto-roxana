# Ohmdal · La Luz

## Dramatic purpose

The first arc follows a visitor who begins by reconnecting a small companion and
ends by commissioning a landmark the whole community depends on. The emotional
question is: **what have we repaired if nobody can keep it working after we leave?**

The old lore remains the foundation: the Instituto Roxana and its incomplete
responsibility; forty years of interrupted exchange; conscious inhabitants with
their own lives; skills that survived after their explanations were lost. The
decline has no supernatural villain. Repair combines residents' practical
knowledge with observation, measurement and shared documentation.

Edda is quick, competitive and independent. She notices exceptions, then learns
to turn them into testable expectations. Lumen respects materials and work: his
experience is useful, even when an inherited recipe is incomplete. Ohm is precise,
warm through action, and dryly funny. His uncertainty is visible; he does not
pretend a missing memory is an explanation. Ivara's caution reflects real past
consequences. Yesca and Vega have different jobs with a shared source. Nereo's
embodied memory matters, and documenting it gives him the freedom to go home.

The September 9 voice revision uses the supplied character scenes as its writing
reference. Edda starts with anomalies, guesses and a competitive notebook, rather
than already knowing what every circuit needs. Her later predictions at the
Castle, lake and Faro grow from repairs the visitor has experienced. Lumen keeps
his dry cloth, three turns, sounds and smell of hot cloth; the story never treats
the skill that kept a town running as foolishness. The visitor asks ordinary
questions, admits uncertainty and eventually connects one experience to another.
Ohm reports observations, offers instrument capabilities and records hypotheses.
He does not choose a diagnosis or wire the solution for the visitor. His compact,
single-body instrument design has an integrated eye and broad skids, with no
separate head, hands or delicate antenna; dialogue does not rely on humanoid
gestures or independent handwriting.

The other voices protect different concerns: Ivara demands a bounded test because
previous repairs hurt people; Yesca needs finished tools today; Vega watches who
pays for a change farther down the channel; Nereo preserves a real bodily skill
with pauses and worker's humor. Their disagreements are exchanges between people
who need each other. Roxana remains an archived voice in an optional workshop
document, never an active NPC in this arc.

The source of truth for staged Spanish text, placement and progression is
`src/content.js`. It contains 9 areas, 9 commissioned close-up installations,
9 world systems, 9 optional environmental stories, 11 journal entries, companion
observations and changed conversations after the finale.

## The continuous journey

| Area | Visible question | World intervention | Close inspection | Change that matters |
| --- | --- | --- | --- | --- |
| Portal Ω | Why is the little automaton dark while the portal glows? | Inspect the copper route and the pedestal | Complete Ohm's source–load–return circuit | Ohm wakes and joins the visitor |
| Plaza de Ohm | Why keep festival ribbons in an unlit town? | Explore fountain, statue, baker and distant Faro | The workshop is reached through the west passage | The Faro becomes a reason to travel |
| Taller de Lumen | Why did replacing a lamp not help? | Restore the isolated supply and return to the bench | Test the concealed break with power off; reconnect it | Lumen opens the workshop and writes a reason beside his recipe |
| La Calzada | Why does a connected line still fail to reach the gate? | Trace the two posts, open a bypass that avoids the load, close the intended route | Correct actuator polarity and regulate its current | A sealed road becomes a journey |
| El Manantial | Why does water pass a motionless installation? | Direct water to the wheel and couple it to the generator | Locate voltage loss across the oxidized splice under load | The pump delivers water to the Plaza |
| Castillo de la Red | Must one failure close every service? | Open the flooded west connection while keeping the healthy trunk supplied | Isolate the archive and give infirmary and kitchen independent branches | Ivara posts a public diagram and permits service |
| Las Terrazas | Can the forge, roots and irrigation share a day? | Moderate the forge and open the irrigation channel | Adjust root heating and pump current independently | Work and food continue together |
| Lago de las Señales | What did Nereo preserve while the Faro stayed dark? | Reconnect the muelle feed and find its return among the reeds | The installation is the approach to the tower | Beacon markers identify a complete route to the Faro |
| El Faro | Can this enormous machine become understandable? | Three physical preparations across the tower | Supply, independent services, then a loaded divider | Light traverses the whole landscape; others can continue |

The intended first-player pacing is approximately 45–75 minutes when someone
explores, listens, measures and experiments. This is a design target, not a
measured completion-time claim. A practiced player can finish substantially
faster. No timer, reading-speed check, combat or punitive resource consumption
gates progress.

## A spatial rule is more than a switch count

The world controller applies `evaluateWorld(state)` after every operation. Each
system exposes `requires` for conditions that must be true and `off` for paths
that must remain open. Its `active` result is recomputed, so opening a return
before commissioning genuinely removes readiness. It is always possible to
reverse an experiment.

The Calzada deliberately begins with its central auxiliary bridge closed. Turning
everything on cannot solve it: that bridge bypasses the gate and causes protection
to inhibit the route. The player has to follow the intended load path. At the
Castle, the damaged west connection begins closed. Restoring the healthy trunk
alone is insufficient; the player must isolate the damaged connection. These
states are declared in `area.initialFlags` and must only initialize flags that
are absent from the save.

The Manantial uses two distinct physical conditions: water reaches the wheel,
and its movement is coupled to the generator. A turning wheel with a detached
shaft is not an electrical source for the installation. The Terrazas combines
a resource constraint with a physical water route before the close-up adjustment.
The lake reuses the return concept at a larger distance.

Those distinctions are visible in the scene. The Plaza fountain stays empty
until the pump is commissioned. Water directed at the Manantial turns its wheel;
the generator only turns when the coupling is engaged. At the Calzada, restored
gate leaves rise and their blocking collision is removed. These physical changes
are consequences of the same saved conditions used by dialogue and objectives.

Near a mechanism, **Q** opens Ohm's field instrument without leaving the world.
Its voltage, branch current and reference update when the player operates a
control with **E**. The field models in `src/world-circuits.js` use the same DC
solver as the workbench and distinguish a floating point, an open return, an
active protection and a source that is not yet available. Mechanical actions
retain their meaning: a water gate controls water, an acople transmits movement,
and an optical shutter controls the beam.

Once a bench is commissioned, its associated controls latch at their verified
settings. The controller must consider both `requires` and `off` when identifying
these controls. A completed restoration is permanent and cannot strand the
player on the far side of an old passage.
Commissioned panels can still be reopened to inspect their wiring and measure
their operating values. Physical edits and resetting are disabled, so this
inspection does not undo a restoration or replay its completion event.

## The Lighthouse in three acts

1. **A source that does useful work.** The two controls at the base connect supply
   and return. The lower panel requires enough voltage at the core while keeping
   losses in the copper run within its limit. The first ring lights; the second
   gallery becomes readable. This combines source, load, series resistance,
   voltage drop and power.
2. **Services with their own paths.** The middle controls isolate the worn service
   bridge and couple the motor to the crown. The second panel has optics, rotation
   and a coast signal: different resistances that need the same voltage. Independent
   branches restore the lamps and machinery. Nereo recognizes the end-of-turn
   sound he has preserved for decades.
3. **A signal that can be sustained.** The upper controls open the bronze shutter
   and release the optical brake. The lens panel places a load on a divider and
   must be calibrated while that load is connected. A correct unloaded value
   does not settle the question. The completed signal propagates through the
   tower and across the kingdom.

The restoration conversation gives room to the visible and musical event.
Edda hears a distant community answer. Ohm's recurring distinction between
coincidence and explanation receives a payoff. Nereo recognizes one turn and a
pause. The epilogue is reached by speaking to Edda near the lens. Lumen brings an
old lamp; Edda asks Tala to look, then gets teased for hurrying her. Tala notices
an old repair under the cloth. Nereo asks them to leave a way to know whether the
work is right, rather than preserving his own procedure forever, and goes home.
The final objective directs the player to that scene; exploration remains
available afterward.

## Optional evidence

Every area contains one optional story expressed through a physical object:

- The Portal's plate remembers the return path.
- Forty marks inside the Plaza bell preserve cancelled festivals.
- Lumen's repaired cup waited for someone who might never return.
- A bird used a disused fuse enclosure as a home.
- Young Vega wrote a prediction and left it in a bottle.
- A network diagram survives embroidered into a Castle standard.
- Seven failed experiments remain around the eighth plant.
- A small lamp points toward land so the farer can find his own home.
- Ohm's old note asks a future apprentice to notice what he forgot to question.

These are optional observations rather than inventory keys. None of them blocks
the main route. The letters in the Castle archive preserve the unanswered debt
of the Instituto for a later arc without withholding the conclusion of this one.

## Voice and presentation

Spanish uses a natural Rioplatense register without making the setting depend on
contemporary slang. Required explanations are short and anchored in the actual
mechanism. More formal relations belong in the Bitácora after the experience.
Each journal entry's `text` is a brief, visible memory in the student's voice.
An optional `explanation` sits behind “Entender un poco más”; its prerequisite
requires the relevant world experience first. The first Portal and workshop
conversations need no vocabulary of voltage, current, resistance, polarity,
nodes or terminal identification. World objectives name a place and a problem,
not the solution. Labels describe the physical control and its visible effect;
the unmarked copper bridge at the Calzada does not introduce itself as a bypass.
The novice can connect, observe and compare without opening a formal note.
Dialogue arrival and completion identifiers are declared in `PUZZLE_STORY`;
the renderer should not show an educational prompt detached from that object.

`OHM_CHATTER` provides short, optional travel observations, each with a stable id
and optional `requires`/`unless` flags. The runtime should wait for uninterrupted
walking or idleness and show an eligible remark once, without stopping movement.
These lines contain no required instructions and should never interrupt dialogue
or a workbench. `resolveDialogue` changes several residents' responses after the
Faro is restored, so revisiting a village has an authored consequence.

## Original sound

`src/audio.js` synthesizes an original score in WebAudio. A shared eight-note
question receives different harmony, tempo, register and density in each area.
Soft triangle pads, low sine foundations, inharmonic wooden ticks and a glass
voice form a small ensemble. A filtered noise bed evokes moving air and water.
An impulse response is generated locally for the space around those voices.

Area changes retain the musical clock and smoothly move the ambient bed.
The finale adds an authored major-key progression, a higher answer to the motif,
and distant low bells. Restored Plaza, lake and Faro use the brighter arrangement.
The director starts only after the user's interaction, respects volume and mute,
pauses for a hidden tab, disconnects ended voices and disposes all audio resources.
No external recordings or music downloads are required.

## Verification boundary

`tests/content.test.js` validates all dialogue references and speakers; object
bounds and passage targets; a fresh traversal using only reachable controls;
commissioning all nine benches; exploration of every area after completion;
the two meaningful off-state rules; reversibility before commissioning;
saved-state latching; companion ids; optional-story coverage; and post-finale
dialogue changes. Circuit correctness is tested independently by the electrical
suite. These checks do not replace actually playing the game, listening to it,
and checking scene composition and interaction readability in the browser.

The repeatable browser gauntlet is `node tests/playthrough.mjs`, with the Vite
development server running at `http://127.0.0.1:4173`. It opens a fresh Chrome
context and uses mouse clicks and keyboard input to walk between physical
objects, operate world mechanisms, take measurements, reconnect workbench
terminals, turn dials and commission each installation. It reads the development
inspection surface to plan movement and assert results; it does not set progress,
teleport the player or call a solve method. It also collects all nine secrets,
plays the ending and epilogue, opens the completed Bitácora and reloads the save.
The field test observes a live change of return voltage and current while the
character remains in the world. A post-finale check measures the commissioned
lens and verifies that its secured controls and connections stay unchanged.
Screenshots and the structured report are written to `output/playwright/` with
the `playthrough-` prefix.

A separate renderer audit lives in `output/playwright/performance-report.json`.
Its save is explicitly **staged**: previously verified flags, conversations and
destinations were imported through the normal save interface, with a prepared
camera position and empty workbench snapshots. It is performance evidence and
does not replace the fresh-context progression gauntlet. On Chrome 152 with a
GTX 1660 Ti at 1440×900 and device-pixel ratio 1, eight 6.5-second samples of the
Plaza and Faro, standing and walking in Alto and Ligero, measured approximately
60 fps and a 16.9 ms 95th-percentile frame interval. One Plaza/Ligero walking
sample contained an isolated 116.5 ms interval and averaged 59.07 fps.

After ten map journeys returning to the Plaza, JavaScript heap after explicit
garbage collection changed from 19.05 MB to 19.40 MB. The Plaza retained 65 GPU
geometries and 30 shader programs; textures rose from 47 to 51 during initial
visits, then stayed at 51 through the final six journeys. This bounded run found
no accumulating scene-resource pattern. These measurements describe this GPU,
viewport and short workload; they do not establish performance on other devices.
The renderer's reported draw-call count resets between postprocessing passes,
so the final-pass count is not presented as the scene's total draw calls.
