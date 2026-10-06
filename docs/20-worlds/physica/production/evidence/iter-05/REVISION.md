# Iteration 05: independent water review and response

**Who reviewed:** a subagent with separate context. It compared `antes-*` against `intermedio-*` (the version reviewed) and took its own numeric measurements with the same field. The `despues-*` shots are the version after the corrections.

| # | Finding | Response | Status |
|---|---|---|---|
| 1 | Folded geometry at the crest and the root: the apex's radius of curvature is about 6 cm against a 0.45–0.70 m half-thickness, so it read as a "hose nozzle". | The half-thickness is limited to 0.8·R, with R = \|v\|³/\|v×a\| computed from the path itself and a minimum of 0.08 m. A crown of froth sits at the apex. The cascade bell's gallows moved to the Orilla side: its beam crossed the crest and cut it visually. | **corrected** (the crown is not very visible) |
| 2 | The column didn't come out of the pool: it started at y = −3.1 at rest, above the water. The pool was drawn on top of it (transparency order). | **Start:** at the pool surface, (2.2; −3.86), with v = (0.85; 2.95) m/s, declared as spring pressure (the stream sinks 3.9 m higher up).<br>**Draw order:** sheets 2, streams 3, foam 4.<br>**Test:** the column rises clear of the Terraza's face. | **corrected** |
| 3 | It read as a fall: white at the base, stuck to the cliff, the crest cut off by the camera, and no shot combining the familiar fall with the column. | **Column:** glassy at the base, white only at the crest and the landing; it stays 0.46 m from the face.<br>**Camera:** more headroom over the shaft.<br>**Opening:** starts on the familiar fall and then moves to the column. | **corrected** (the opening shows them one after the other, not in a single frame) |
| 4 | Flow and landing: the arch was 2.3 m wide against a 1.44 m channel; spread in z where the water speeds up. | The arch uses the channel's width (1.3 m) and its lane (`Z_STREAM`), with no spread. | **corrected** |
| 5 | Hard outlines on the veil (soap-bubble rings). | Alpha × (1 − 0.85·fresnel) and a soft ramp instead of a hard `discard`. | **corrected** (not verified with a close-up of the grazing angle) |
| 6 | The foam mounds read as solid blobs; the left one crossed the curb. | The mounds use the torn veil, are smaller, and the left one moved forward in z. | **corrected** |
| 7 | Pool edges: overlap and a seam under the impact; the left fall landed outside its basin. | The basin now reaches −18.9 and the stream starts there: no overlap, and the impact falls inside. Pools are still rectangles with straight edges. | **partial** |
| 8 | Wet rock: rectangular zones; a zone with no source on the Orilla's lip; the Terraza's face dry. | Rounded falloff. Zone with no source removed. Wet zone added on the Terraza's face where the crest spills over. | **corrected** |
