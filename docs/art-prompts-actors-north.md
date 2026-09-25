# Directional cast sprites: Nereo, Vega and Ivara

Generated with the built-in ImageGen tool from original Ohmdal artwork. No CLI image generation or raster editing is used. Originals remain in the generated-images directory and the accepted images are copied unchanged into the project. Chroma extraction belongs to the runtime.

Atlas contract: five columns (idle, four walking phases), four rows (front, right, back, left). The requested canvas was 1280 × 1024; actual generated dimensions are recorded per asset below. The reference sprite atlas and portraits were visually inspected before generation.

## Shared initial prompt

For each character, the exact initial prompt is this shared text followed by its character paragraph below.

```text
Use case: stylized-concept. Asset type: production HD2D RPG character animation sprite atlas. Generate ONE image for ONE named character, with exactly 5 columns by 4 rows = 20 full-body sprites. Output canvas exactly 1280 by 1024 pixels if possible, aspect ratio 5:4, an invisible grid of 256x256 cells. No visible grid, text, labels, numbers, watermark or margin decorations. Input image 1 is an identity and painted sprite-style reference only; do NOT reproduce its atlas layout. Input image 2 is a face/costume identity reference only; do NOT reproduce its portrait layout.
BACKGROUND: absolutely uniform solid pure chroma magenta #ff00ff across all empty pixels. No alpha checkerboard, no gradient, no environment, no cast shadow outside the figure, no ground ovals, no outlines of cell boundaries.
CAMERA AND STYLE: classic straight-axis RPG, camera elevated 28 degrees above horizontal, painted HD2D illustration with crisp readable silhouettes, warm detailed fabrics, subtly chibi proportions matching the reference NPC sprite atlas (about 3.5 heads tall), not a realistic full-size person, not vector shapes. Keep the same figure proportions and clothing identity in all 20 cells. In every cell center the body horizontally, keep a stable pivot at the midpoint between the feet, feet baseline 232 pixels from the cell top, figure height about 202 pixels with at least 22 pixels clear background on all sides.
ORIENTATION ROWS, mandatory: row 0 (top) faces FRONT toward viewer / south / +z; row 1 faces strictly to the viewer's RIGHT / east / +x, nose pointing right; row 2 shows BACK of head and BACK of clothing / north / -z, no face; row 3 faces strictly to the viewer's LEFT / west / -x, nose pointing left. Five sprites in each row face exactly that same direction. Do NOT substitute a three-quarter face for back or side views.
ANIMATION COLUMNS, mandatory: column 0 (leftmost in EVERY row) is a perfectly quiet neutral IDLE STANCE: BOTH feet side by side, parallel, planted at the same depth, legs straight, arms relaxed, no stride, no leaning, no step, no hand swinging. This is a separate still pose, not a walking frame. Columns 1,2,3,4 are a clearly alternating four-frame walking loop in that row's direction: left-foot-forward contact and opposite arm forward; passing pose with feet under body and the other knee lifted slightly; right-foot-forward contact with opposite arm forward; opposite passing pose. Small purposeful steps, no running. The two contact frames must clearly swap the leading foot. The idle pose must not resemble either contact frame. Keep the head and body centered consistently; no drifting across cells.

```

## nereo

Destination: `public/assets/actors/nereo.png`

Input reference 1: `public/assets/npcs.png` (sprite style and costume).
Input reference 2: `public/assets/portraits.png` (face and identity).

Character paragraph:

```text
CHARACTER: NEREO only, the old lighthouse keeper from the FIRST ROW of input image1 and the BOTTOM RIGHT portrait in input image2. Keep weathered tan face with kind brown eyes, short white beard and thick white moustache, navy knitted cap with small round brass pin, mustard gold scarf, warm oatmeal/beige thigh-length sailor's coat with brass buttons and brown straps, dark navy trousers, brown leather boots and small brown hip satchel. Rounded sturdy elderly build, calm expression. Preserve cap, beard, scarf, coat and satchel exactly across all views. His coat remains shorter than knee level so alternating boot steps are unmistakable. No staff, no lantern, no extra prop.
```

Initial generation provenance:

Generated images are saved to C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57 as C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57\exec-c5f74849-aafa-4d8c-b7e0-27163d60c3e1.png by default.

Inspection: identity, four directions and a separate planted idle pose were retained. The first pass repeated walk silhouettes too closely; a targeted limb-pose revision was requested before final selection.

## vega

Destination: `public/assets/actors/vega.png`

Input reference 1: `public/assets/npcs.png` (sprite style and costume).
Input reference 2: `public/assets/portraits-2.png` (face and identity).

Character paragraph:

```text
CHARACTER: VEGA only, the gray-haired irrigation keeper from SECOND ROW of input image1 and TOP LEFT portrait in input image2. An older woman with warm medium tan skin and kind experienced brown eyes, long gray hair in ONE thick braid, sage-green blouse with rolled sleeves, deep teal work pinafore/apron over an olive-green knee-length skirt, brown leather belt and small brass cylindrical tool at hip, brown lace-up work boots. Preserve age, braid, dark teal apron, green cloth and hip tool consistently. Medium sturdy practical build. Her skirt hem must leave ankles and boots visible; alternating boot motion should remain legible. The braid drapes over her shoulder at front and emerges naturally from its true attachment in side and back views. Do not turn her into a young girl, mage or warrior. No staff, watering can or new props.
```

Initial generation provenance:

Generated images are saved to C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57 as C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57\exec-84b88821-230b-4b36-a962-74ed637ad753.png by default.

Inspection: identity, four directions and a separate planted idle pose were retained. The first pass repeated walk silhouettes too closely; a targeted limb-pose revision was requested before final selection.

## consejera

Destination: `public/assets/actors/consejera.png`

Input reference 1: `public/assets/npcs.png` (sprite style and costume).
Input reference 2: `public/assets/portraits-2.png` (face and identity).

Character paragraph:

```text
CHARACTER: CONSEJERA IVARA only, the woman from THIRD ROW of input image1 and TOP MIDDLE portrait in input image2. A dignified middle-aged woman with rich dark brown skin, thoughtful serious brown eyes, black hair gathered into a high rounded bun, a violet/plum shoulder cape with antique gold embroidered edging, a dark navy calf-length dress with gold trim, cream sleeves, round brass brooch and a small brown bound book held comfortably tucked close to her left side. Preserve face, high bun, brass brooch, plum cape, embroidered trim and book consistently. Practical brown low boots visible beneath the hem. Calm upright posture, no smile exaggeration, no crown, no sceptre. In idle she stands square with both boots parallel on the same depth, right arm resting relaxed and left holding her book at her side; the book does not force a walking pose. In walking frames show clear alternating boots and modest hem motion rather than billowing cape.
```

Initial generation provenance:

Generated images are saved to C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57 as C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57\exec-35af1b51-e1fe-4e23-aad6-f3e3746c82f3.png by default.

Inspection: identity, four directions and a separate planted idle pose were retained. The first pass repeated walk silhouettes too closely; a targeted limb-pose revision was requested before final selection.

## Nereo: first targeted revision

The initial Nereo atlas was the sole edit reference. This pass made the passing poses more legible; a second pass asks for clearer opposite contact silhouettes.

```text
Use case: precise-object-edit. Edit this Nereo 5-column x 4-row RPG sprite atlas, preserving his identity, outfit, painted style, all four orientations, pure #ff00ff background, overall dimensions, spacing and cell registration. The LEFTMOST column contains excellent planted-feet IDLE poses; preserve all four idle cells exactly. Preserve the top-row FRONT orientation, second-row RIGHT-facing profile, third-row BACK, fourth-row LEFT-facing profile. Do not add, remove, flip or reorder rows or columns.
CORRECTION REQUIRED: the four walking columns currently repeat nearly the same stepping pose. Make a genuine alternating walk cycle. In each row, columns 2 and 4 (counted from the left starting at 1) must be OPPOSITE CONTACT POSES. Column 2: anatomical left leg forward, right leg back, right arm forward, left arm back. Column 4: anatomical RIGHT leg forward, LEFT leg back, LEFT arm forward, RIGHT arm back. The arm swing and the leg silhouettes MUST visibly reverse between these two cells while head, face and torso keep facing the SAME direction. For side profiles this means the nearer arm and nearer knee are in opposite positions between column 2 and column 4. Do NOT mirror the entire figure; the direction must remain unchanged. Between them, column 3 is a passing pose with one planted leg beneath the torso and the opposite knee bent forward; column 5 is the opposite passing pose with the OTHER planted leg and bent knee. In FRONT and BACK rows show the two feet clearly switching which one is closer to the viewer. Moderate stride, no running or marching kick. Every frame keeps the same head/body scale, torso center and planted-foot baseline. The purpose is true limb alternation instead of repeating poses with moving coat hems. No text, guides, cell borders, ground shadows or checkerboard.
```

Generated images are saved to C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57 as C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57\exec-f2e7d8b5-5d04-4a7b-b780-7b2a8c6fc345.png by default.


## Final targeted limb revision

The exact revision prompt for each atlas is the following shared text plus its character-specific addition. Each preceding generated atlas was the sole image reference. This second Nereo revision and first Vega/Ivara revision were selected after visual inspection.

```text
Use case: precise-object-edit. This is a 20-cell HD2D RPG sprite atlas. Keep its exact 5 columns × 4 rows, figure identity, costumes, scale, centers, all head/facial directions, and solid pure #ff00ff background. The leftmost column is a perfect standing IDLE: preserve it exactly in all rows. Preserve orientation: TOP row faces front/down, SECOND row faces screen RIGHT, THIRD row faces fully AWAY/BACK, BOTTOM row faces screen LEFT. Do not mirror figures or add props. No text or grid.
The walking frames currently have nearly identical silhouettes, so they cannot make a convincing walk. CHANGE THE LIMB SILHOUETTES SIGNIFICANTLY in columns 3,4,5 (counting leftmost as column1), not merely hems or scarf. Column2 can remain as the starting contact pose. Column3 must become a PASSING pose: feet nearly together directly under the torso, one planted foot and one heel lifted; no long horizontal step. Column4 must be the OPPOSITE CONTACT pose to column2. Column5 must be the opposite PASSING pose with feet nearly together again.
Very concrete side-view correction: in SECOND row (faces right), COLUMN4, the VISIBLE NEAR ARM must swing BEHIND THE BODY so its hand is to the LEFT of the torso; the NEAR LEG must extend BACK to the LEFT, while the far leg reaches forward to the RIGHT. This must look different from COLUMN2 where the visible arm and leg are forward. In the BOTTOM row (faces left), COLUMN4, the VISIBLE NEAR ARM swings BEHIND THE BODY so its hand is to the RIGHT of the torso; the NEAR LEG extends BACK to the RIGHT while the far leg reaches LEFT. In FRONT and BACK rows, COLUMN4 must clearly have the OTHER boot lower on the page than column2 and the arms swung oppositely. In columns3 and5 have boots mostly beneath hips with knees bending to show opposite passing legs; keep foot baseline unchanged. Twenty sprites total. Strong difference between contact / passing / opposite contact / opposite passing, quiet idle unchanged. Clothing may move lightly but must not hide the boots. Avoid extreme high knees or military goose steps.
```

### nereo

Edit input: `C:/Users/manue/.codex/generated_images/01a085ff-a726-76d3-b3b1-84c312a89e57/exec-f2e7d8b5-5d04-4a7b-b780-7b2a8c6fc345.png`.

Prompt addition:

```text
Nereo keeps mustard scarf, beige coat and cap. His empty hands can swing freely. No raised knee above his coat hem.
```

Selected original:

Generated images are saved to C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57 as C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57\exec-b79132f7-5965-4c9b-8cb4-b3c46f883b37.png by default.

### vega

Edit input: `C:/Users/manue/.codex/generated_images/01a085ff-a726-76d3-b3b1-84c312a89e57/exec-84b88821-230b-4b36-a962-74ed637ad753.png`.

Prompt addition:

```text
Vega keeps braid, green dress and teal apron. Her empty hands can swing freely. Preserve her mature face and all four idle poses.
```

Selected original:

Generated images are saved to C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57 as C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57\exec-38e2522f-6374-438b-9ba6-91cfecd29377.png by default.

### consejera

Edit input: `C:/Users/manue/.codex/generated_images/01a085ff-a726-76d3-b3b1-84c312a89e57/exec-35af1b51-e1fe-4e23-aad6-f3e3746c82f3.png`.

Prompt addition:

```text
Ivara keeps the book tucked against her far side so her visible free arm can swing behind her in column4. The book never changes anatomical side. Preserve purple cape and gold embroidery. Make ankles and boots visible.
```

Selected original:

Generated images are saved to C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57 as C:\Users\manue\.codex\generated_images\01a085ff-a726-76d3-b3b1-84c312a89e57\exec-b132e5d2-e59a-44c8-8c45-8ece618ed87e.png by default.

## Final inspection and integration

All three accepted PNGs are **1402 × 1122 pixels**. Use proportional `width / 5` and `height / 4` cells, not a fixed 256-pixel crop. There are twenty contained figures per sheet: front, right, back and left rows, each with a quiet planted idle followed by four walking phases. Costumes, silhouettes and identifying hair/headwear remain consistent. The correction created clearer passing poses and opposite arm/leg contact silhouettes in the profiles; front/back motion is smaller because the view compresses the stride. No generated frames were cropped, recolored, resampled or composed after ImageGen. Runtime animation should be inspected in context at the actual world scale.

Final files:

- `public/assets/actors/nereo.png`
- `public/assets/actors/vega.png`
- `public/assets/actors/consejera.png`

PNG dimensions were read from their headers, and SHA-256 equality was checked against each selected original before delivery.

