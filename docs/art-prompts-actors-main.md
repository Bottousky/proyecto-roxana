# Sprites de Viajero, Edda y Lumen

Generados con la herramienta integrada `image_gen.imagegen` usando los atlas originales como referencias de identidad. Las copias finales se guardan en `public/assets/actors/player.png`, `edda.png` y `lumen.png`. El motor extrae el croma magenta y usa límites proporcionales: los originales generados miden 1402 × 1122 aunque se solicitaron 1280 × 1024.

Contrato: cinco columnas (reposo dedicado y cuatro cuadros de marcha), cuatro filas (frente, derecha, espalda, izquierda). Pies alineados y escala común por personaje. No se alteran los retratos ni el arte de Ohm.

## player

Use case: identity-preserve. Asset type: production human sprite animation atlas for the hand-painted HD-2D JRPG Ohmdal. Reference image is identity and costume/style reference only; its poses are NOT the desired animation.
EXACT GRID: 1280x1024 canvas, FIVE equal columns and FOUR equal rows; 20 cells each 256x256. One character only repeated in all 20 cells. Full body contained in each cell with generous 18px margins; same head/body proportions, scale and stable foot baseline, no overlap. Crisp hand-painted miniature JRPG proportions exactly like reference, dark contours, detailed but readable at small game size, camera looks down about 28 degrees.
ROWS: row1 FRONT looking toward viewer; row2 TRUE RIGHT PROFILE facing right edge, visibly nose right; row3 BACK with no face visible; row4 TRUE LEFT PROFILE facing left edge, nose left. All five sprites in each row face that row's exact direction.
COLUMNS: column1 is a DEDICATED STATIC STANDING IDLE: upright relaxed, BOTH BOOTS on same ground baseline, legs straight and parallel with feet naturally close together, arms down relaxed, no step/raised foot/sway, scarf hanging still. Columns2-5 are four visibly distinct sequential WALKING frames: left-foot contact stride, passing pose, right-foot contact opposite stride, opposite passing pose; alternate legs AND counter-swing arms, hips remain centered, scarf gently follows travel. Walking frames must not be identical copies or recolors. Do not make a row of identical strides. The idle must clearly differ from walk contacts.
BACKGROUND: uniform pure saturated magenta #ff00ff everywhere outside the character. No shadows on background, no scenery, no checkerboard, no text/captions/grid lines/labels/watermarks.
IDENTITY: The PLAYER/VIAJERO from the FIRST row of the reference: teenage boy, tousled dark brown hair, warm face, long dark teal coat with brass buttons, cream shirt, mustard-gold scarf, brown leather crossbody satchel hanging on his left hip, dark charcoal trousers and sturdy brown boots. Keep his youthful slim proportions and exact existing outfit; no weapons. Preserve bag/scarf handedness when viewing from behind rather than simply copying the front.

## edda

Use case: identity-preserve. Asset type: production human sprite animation atlas for the hand-painted HD-2D JRPG Ohmdal. Reference image is identity and costume/style reference only; its poses are NOT the desired animation.
EXACT GRID: 1280x1024 canvas, FIVE equal columns and FOUR equal rows; 20 cells each 256x256. One character only repeated in all 20 cells. Full body contained in each cell with generous 18px margins; same head/body proportions, scale and stable foot baseline, no overlap. Crisp hand-painted miniature JRPG proportions exactly like reference, dark contours, detailed but readable at small game size, camera looks down about 28 degrees.
ROWS: row1 FRONT looking toward viewer; row2 TRUE RIGHT PROFILE facing right edge, visibly nose right; row3 BACK with no face visible; row4 TRUE LEFT PROFILE facing left edge, nose left. All five sprites in each row face that row's exact direction.
COLUMNS: column1 is a DEDICATED STATIC STANDING IDLE: upright relaxed, BOTH BOOTS on same ground baseline, legs straight and parallel with feet naturally close together, arms down relaxed, no step/raised foot/sway, scarf hanging still. Columns2-5 are four visibly distinct sequential WALKING frames: left-foot contact stride, passing pose, right-foot contact opposite stride, opposite passing pose; alternate legs AND counter-swing arms, hips remain centered, scarf gently follows travel. Walking frames must not be identical copies or recolors. Do not make a row of identical strides. The idle must clearly differ from walk contacts.
BACKGROUND: uniform pure saturated magenta #ff00ff everywhere outside the character. No shadows on background, no scenery, no checkerboard, no text/captions/grid lines/labels/watermarks.
IDENTITY: EDDA from the SECOND row of the first reference and upper-left portrait of the second: teenage girl, copper red hair bob with small side braid, freckles, dark moss-green short cape with round brass clasp, cream blouse, rusty red loose trousers, broad brown leather belt and small pouch, brown lace-up boots and leather wrist cuffs. Curious independent expression, slim young proportions. Preserve same color blocking and silhouette. No weapons or additional accessories.

## lumen

Use case: identity-preserve. Asset type: production human sprite animation atlas for the hand-painted HD-2D JRPG Ohmdal. Reference image is identity and costume/style reference only; its poses are NOT the desired animation.
EXACT GRID: 1280x1024 canvas, FIVE equal columns and FOUR equal rows; 20 cells each 256x256. One character only repeated in all 20 cells. Full body contained in each cell with generous 18px margins; same head/body proportions, scale and stable foot baseline, no overlap. Crisp hand-painted miniature JRPG proportions exactly like reference, dark contours, detailed but readable at small game size, camera looks down about 28 degrees.
ROWS: row1 FRONT looking toward viewer; row2 TRUE RIGHT PROFILE facing right edge, visibly nose right; row3 BACK with no face visible; row4 TRUE LEFT PROFILE facing left edge, nose left. All five sprites in each row face that row's exact direction.
COLUMNS: column1 is a DEDICATED STATIC STANDING IDLE: upright relaxed, BOTH BOOTS on same ground baseline, legs straight and parallel with feet naturally close together, arms down relaxed, no step/raised foot/sway, scarf hanging still. Columns2-5 are four visibly distinct sequential WALKING frames: left-foot contact stride, passing pose, right-foot contact opposite stride, opposite passing pose; alternate legs AND counter-swing arms, hips remain centered, scarf gently follows travel. Walking frames must not be identical copies or recolors. Do not make a row of identical strides. The idle must clearly differ from walk contacts.
BACKGROUND: uniform pure saturated magenta #ff00ff everywhere outside the character. No shadows on background, no scenery, no checkerboard, no text/captions/grid lines/labels/watermarks.
IDENTITY: MAESE LUMEN from the THIRD row of first reference and lower-left portrait of second: short broad older craftsman, wild white hair and bushy white beard, round brass goggles resting on forehead, plum/burgundy shirt with rolled sleeves, worn brown leather tool apron with pockets and a few tools, dark trousers, heavy brown boots. Warm experienced expression, stocky proportions. Idle arms relaxed down, hands not lifted; no new accessories.

## Corrección del ciclo

Use case: identity-preserve. Precisely edit this existing 5-column by 4-row sprite sheet. PRESERVE its dimensions, grid, character identity, costume, palette, proportions, ALL four orientations and pure magenta background. Preserve the entire FIRST column of true standing idle exactly.
The walk cycle has a specific defect: too many wide-stride poses. Correct ONLY WALKING GAIT in columns 2-5 of each row, with a strong visible change to columns THREE and FIVE counted from the left.
Column TWO = wide contact stride. Column THREE = NARROW PASSING POSE: one straight supporting leg directly underneath hips, other knee lifted slightly crossing it; both boots stay close horizontally beneath the body, NOT one boot extended far ahead. In side-view rows the boot silhouettes almost overlap at the vertical body center. Hands pass close by the hips. Column FOUR = opposite wide contact stride, leading leg and forward arm switched relative column TWO. Column FIVE = opposite NARROW PASSING POSE, same near-vertical close-foot silhouette as column THREE but opposite knee/arm raised.
Front/back rows also alternate left/right support, body upright with stable height; no large jumps or body resizing. Profiles remain true right and left, no turned faces. Feet fully contained with stable ground baseline. The result must read visually WIDE-NARROW-WIDE-NARROW across the final four columns. This contrast of silhouettes is the most important edit. No text or other additions.

## Contactos alternados (corrección final)

Use case: identity-preserve. Edit this sprite atlas with a surgical gait correction. Keep dimensions and all 5 columns × 4 rows. PRESERVE columns ONE (idle), THREE and FIVE (passing) EXACTLY. Keep all faces, costume, body proportions, orientation, registration, scale, original magenta background.
Correct the two wide-stride CONTACT poses in columns TWO and FOUR so they use opposite legs and opposite arms. Specific SCREEN-SPACE positions, most important:
SECOND ROW, facing RIGHT: column TWO visible NEAR HAND swings BEHIND the torso to screen LEFT and near BOOT reaches FORWARD to screen RIGHT. Column FOUR visible NEAR HAND swings IN FRONT of the torso to screen RIGHT and near BOOT stretches BACK to screen LEFT. The far arm and far leg do the opposite. Clearly draw the visible sleeve going forward and hand to right of belly in column FOUR, instead of the repeated hand behind the hip. Do not rotate the body or head.
BOTTOM ROW, facing LEFT: column TWO visible NEAR HAND swings BEHIND torso to screen RIGHT and near BOOT reaches forward to screen LEFT. Column FOUR visible NEAR HAND swings IN FRONT of torso to screen LEFT and near BOOT stretches BACK to screen RIGHT. Draw the visible sleeve forward and hand left of belly in column FOUR.
FRONT and BACK rows: column TWO has the left-on-page boot lower on the page; column FOUR has the OTHER/right-on-page boot lower and arms swung oppositely. Two visibly alternating contacts. Both boots fully within each cell. No new props, text or graphics. Preserve the first-column neutral pose and the third/fifth-column close-legged passing poses.

## Originales finales conservados

Carpeta: `C:\Users\manue\.codex\generated_images\01a083e4-ab34-7211-8821-071e6487f9b7\`.

- Viajero: `exec-29abc9c8-ddea-4239-941a-1ecef3fa9b42.png` → `public/assets/actors/player.png`.
- Edda: `exec-0cb8f426-7c20-4d09-bf10-ae693b9735db.png` → `public/assets/actors/edda.png`.
- Lumen: `exec-57a8b459-3a2d-4e2f-9cb5-c58e82508206.png` → `public/assets/actors/lumen.png`.

Copiados sin modificar los PNG; el recorte y la transparencia se aplican en el motor. Revisión visual: primer cuadro de cada fila con ambos pies apoyados; perfiles hacia lados opuestos, espalda sin rostro, contactos alternos y pasos intermedios con las piernas juntas.
