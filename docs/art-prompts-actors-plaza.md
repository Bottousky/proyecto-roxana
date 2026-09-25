# Sprites animados de Yesca, Marín y Tala

Producción: 2026-09-09. Herramienta integrada `image_gen.imagegen`, modo de preservación de identidad; sin CLI ni edición posterior de píxeles. Las imágenes originales generadas se copian sin modificar al proyecto. El motor recorta celdas y retira el croma en tiempo de ejecución.

Referencias leídas visualmente antes de generar:

- `public/assets/npcs.png`: identidad del cuerpo y vestuario, filas 4, 5 y 6 respectivamente.
- `public/assets/portraits-2.png`: identidad facial; Yesca arriba derecha, Marín abajo izquierda, Tala abajo centro.

Contrato: atlas 5 × 4. Columnas: reposo, contacto izquierdo, paso, contacto derecho, paso. Filas: frente (+z), derecha (+x), espalda (−z), izquierda (−x). Pose de reposo con ambos pies juntos, paralelos y apoyados; brazos relajados. Fondo magenta uniforme. No sombras de suelo ni grilla visible.

## Prompts completos

### yesca

Destino: `public/assets/actors/yesca.png`.

```text
Use case: identity-preserve. Asset type: production HD-2D RPG character animation sprite sheet. Generate a NEW sheet for ONE named character, using the attached two existing artworks only to preserve that character's identity, clothing colors, body proportions and painted finish. The first input is an old six-character atlas: use ONLY the specified row as identity reference, not its wrong repeated walking poses or its 6-column layout. The second input is a portrait atlas: use ONLY the specified portrait for face identity. NEW OUTPUT REQUIREMENTS: precisely 1280 × 1024 pixels, an invisible regular grid of FIVE columns and FOUR rows, exactly TWENTY full-body sprites, every cell 256 × 256 pixels. Each sprite must be centered at x=128 within its own cell, feet on y=229 within every cell, fixed body height about 190px and fixed scale. Do not crop any hair or boot, generous magenta margins between all figures. Pure uniform chroma-magenta #ff00ff entire background. No shadows on the ground or outside the character, no checkerboard, no written text or labels, no visible grid or border.
DIRECTION IS FIXED BY ROW, NOT BY COLUMN. Top row: FRONT looking straight toward viewer, facing south / +z. Second row: strict RIGHT PROFILE, nose and boots pointing to IMAGE RIGHT / +x. Third row: BACK, facing away from viewer north / -z; show back of head and back of clothes, NO face. Bottom row: strict LEFT PROFILE, nose and boots pointing to IMAGE LEFT / -x.
ANIMATION IS FIXED BY COLUMN, same in every row. FIRST COLUMN is a genuine STILL STANDING REST pose: balanced straight torso, both soles touching the ground, both feet close together and PARALLEL, no forward-striding leg, arms relaxed down at sides. Columns 2, 3, 4, 5 form FOUR CLEARLY DIFFERENT WALK FRAMES: left-leg contact with right arm forward; left foot passing below hips while right leg swings; right-leg contact with left arm forward; right foot passing below hips while left leg swings. From back and profiles preserve anatomically correct left/right gait. Do NOT duplicate the same stride across the four walking frames. The rest column must be visibly different from the strides. Small natural vertical bounce maximum 3px, no skating. All twenty figures are exactly the SAME person, outfit and proportions.
STYLE: beautifully painted high-detail HD2D fantasy JRPG sprites, strong readable silhouette, warm material highlights, grounded cloth/leather/copper texture, crisp edges, small charming game proportions as in the first atlas, elevated classic straight RPG camera 28 degrees downward, NOT isometric diagonal view. Lighting same soft upper-left on all sprites. Production sprites, not a model turnaround poster.
CHARACTER IDENTITY TO PRESERVE: YESCA, the strong young red-haired woman BLACKSMITH in row FOUR of the old sprite atlas, matching TOP RIGHT portrait. Her tousled copper-red hair is tied back with stray bangs, brass goggles with dark teal lenses rest on top of her head, fair freckled face, stocky strong physique, rust orange shirt with rolled sleeves, dark charcoal leather smith's bib apron with brass buckles and earthy tan work apron/skirt layered at hips, dark trousers and thick brown boots. Keep her warm mischievous confident smile. No weapon, hammer, bag or accessory in either hand; the hands remain free for relaxed rest and walking swing.
```

### marin

Destino: `public/assets/actors/marin.png`.

```text
Use case: identity-preserve. Asset type: production HD-2D RPG character animation sprite sheet. Generate a NEW sheet for ONE named character, using the attached two existing artworks only to preserve that character's identity, clothing colors, body proportions and painted finish. The first input is an old six-character atlas: use ONLY the specified row as identity reference, not its wrong repeated walking poses or its 6-column layout. The second input is a portrait atlas: use ONLY the specified portrait for face identity. NEW OUTPUT REQUIREMENTS: precisely 1280 × 1024 pixels, an invisible regular grid of FIVE columns and FOUR rows, exactly TWENTY full-body sprites, every cell 256 × 256 pixels. Each sprite must be centered at x=128 within its own cell, feet on y=229 within every cell, fixed body height about 190px and fixed scale. Do not crop any hair or boot, generous magenta margins between all figures. Pure uniform chroma-magenta #ff00ff entire background. No shadows on the ground or outside the character, no checkerboard, no written text or labels, no visible grid or border.
DIRECTION IS FIXED BY ROW, NOT BY COLUMN. Top row: FRONT looking straight toward viewer, facing south / +z. Second row: strict RIGHT PROFILE, nose and boots pointing to IMAGE RIGHT / +x. Third row: BACK, facing away from viewer north / -z; show back of head and back of clothes, NO face. Bottom row: strict LEFT PROFILE, nose and boots pointing to IMAGE LEFT / -x.
ANIMATION IS FIXED BY COLUMN, same in every row. FIRST COLUMN is a genuine STILL STANDING REST pose: balanced straight torso, both soles touching the ground, both feet close together and PARALLEL, no forward-striding leg, arms relaxed down at sides. Columns 2, 3, 4, 5 form FOUR CLEARLY DIFFERENT WALK FRAMES: left-leg contact with right arm forward; left foot passing below hips while right leg swings; right-leg contact with left arm forward; right foot passing below hips while left leg swings. From back and profiles preserve anatomically correct left/right gait. Do NOT duplicate the same stride across the four walking frames. The rest column must be visibly different from the strides. Small natural vertical bounce maximum 3px, no skating. All twenty figures are exactly the SAME person, outfit and proportions.
STYLE: beautifully painted high-detail HD2D fantasy JRPG sprites, strong readable silhouette, warm material highlights, grounded cloth/leather/copper texture, crisp edges, small charming game proportions as in the first atlas, elevated classic straight RPG camera 28 degrees downward, NOT isometric diagonal view. Lighting same soft upper-left on all sprites. Production sprites, not a model turnaround poster.
CHARACTER IDENTITY TO PRESERVE: MARÍN, the stocky cheerful middle-aged male COOK in row FIVE of the old sprite atlas, matching BOTTOM LEFT portrait. Curly chestnut-brown hair, warm light skin, round kindly face with short chestnut beard and moustache matching the portrait, warm ochre waistcoat over a cream rolled-sleeve shirt, large off-white slightly flour-stained waist apron tied with a belt, brown trousers, stout brown boots. Keep his round body, gentle amused expression and apron folds. Small practical utensil pouch at hip as in existing sprite. No object in either hand; hands remain free for relaxed rest and walking swing.
```

### tala

Destino: `public/assets/actors/tala.png`.

```text
Use case: identity-preserve. Asset type: production HD-2D RPG character animation sprite sheet. Generate a NEW sheet for ONE named character, using the attached two existing artworks only to preserve that character's identity, clothing colors, body proportions and painted finish. The first input is an old six-character atlas: use ONLY the specified row as identity reference, not its wrong repeated walking poses or its 6-column layout. The second input is a portrait atlas: use ONLY the specified portrait for face identity. NEW OUTPUT REQUIREMENTS: precisely 1280 × 1024 pixels, an invisible regular grid of FIVE columns and FOUR rows, exactly TWENTY full-body sprites, every cell 256 × 256 pixels. Each sprite must be centered at x=128 within its own cell, feet on y=229 within every cell, fixed body height about 190px and fixed scale. Do not crop any hair or boot, generous magenta margins between all figures. Pure uniform chroma-magenta #ff00ff entire background. No shadows on the ground or outside the character, no checkerboard, no written text or labels, no visible grid or border.
DIRECTION IS FIXED BY ROW, NOT BY COLUMN. Top row: FRONT looking straight toward viewer, facing south / +z. Second row: strict RIGHT PROFILE, nose and boots pointing to IMAGE RIGHT / +x. Third row: BACK, facing away from viewer north / -z; show back of head and back of clothes, NO face. Bottom row: strict LEFT PROFILE, nose and boots pointing to IMAGE LEFT / -x.
ANIMATION IS FIXED BY COLUMN, same in every row. FIRST COLUMN is a genuine STILL STANDING REST pose: balanced straight torso, both soles touching the ground, both feet close together and PARALLEL, no forward-striding leg, arms relaxed down at sides. Columns 2, 3, 4, 5 form FOUR CLEARLY DIFFERENT WALK FRAMES: left-leg contact with right arm forward; left foot passing below hips while right leg swings; right-leg contact with left arm forward; right foot passing below hips while left leg swings. From back and profiles preserve anatomically correct left/right gait. Do NOT duplicate the same stride across the four walking frames. The rest column must be visibly different from the strides. Small natural vertical bounce maximum 3px, no skating. All twenty figures are exactly the SAME person, outfit and proportions.
STYLE: beautifully painted high-detail HD2D fantasy JRPG sprites, strong readable silhouette, warm material highlights, grounded cloth/leather/copper texture, crisp edges, small charming game proportions as in the first atlas, elevated classic straight RPG camera 28 degrees downward, NOT isometric diagonal view. Lighting same soft upper-left on all sprites. Production sprites, not a model turnaround poster.
CHARACTER IDENTITY TO PRESERVE: TALA, the lively teenage girl in row SIX (BOTTOM) of the old sprite atlas, matching BOTTOM MIDDLE portrait. Wavy loosely tied dark brown shoulder-length hair with stray bangs, warm light-brown freckled face, mustard yellow tunic with rolled sleeves, sleeveless dark navy-blue vest with small brass fastenings, brown cross-body satchel and tool roll at hip, dark teal cropped trousers, wrapped brown mid-calf boots. Keep her slight agile build and curious expression. She is the girl from BOTTOM MIDDLE portrait, NOT the boy on the bottom right. No object in either hand; hands remain free for relaxed rest and walking swing.
```


## Inspección y procedencia final

Las tres planchas entregadas son de **1402 × 1122 px**, con grilla **5 × 4**. La herramienta respetó la proporción y el número de celdas, pero no la dimensión ideal solicitada: el motor debe recortar proporcionalmente (`width / 5`, `height / 4`) y no suponer celdas de 256 px. Se inspeccionaron las veinte poses de cada hoja: primera columna quieta, frente, perfil derecho, espalda y perfil izquierdo; celdas separadas sobre croma sin grilla ni fondo escénico. Se revisaron los contactos y los pasos intermedios para evitar cuatro zancadas visualmente iguales. Las iteraciones de orientación que invirtieron perfiles se corrigieron antes de la copia final.

Los originales de todas las generaciones se conservaron en el directorio de ImageGen. Los archivos del proyecto son copias íntegras; no se editaron con Python ni con otras herramientas de píxeles.

| Personaje | PNG final | Original seleccionado |
| --- | --- | --- |
| yesca | `public/assets/actors/yesca.png` | `C:\Users\manue\.codex\generated_images\01a085ff-60f5-7242-bf7e-04e42b7cce64\exec-6ae6960d-fd1a-4654-8a70-c42746fabb68.png` |
| marin | `public/assets/actors/marin.png` | `C:\Users\manue\.codex\generated_images\01a085ff-60f5-7242-bf7e-04e42b7cce64\exec-2424ff96-322b-41cf-9339-b43102d33f66.png` |
| tala | `public/assets/actors/tala.png` | `C:\Users\manue\.codex\generated_images\01a085ff-60f5-7242-bf7e-04e42b7cce64\exec-7355f389-f9ad-496c-a7b8-07a135d137cb.png` |

## Prompts de refinamiento

### yesca: pasos intermedios

Entrada: el atlas inicial del personaje.

```text
Edit ONLY columns THREE and FIVE (one-based) of this existing Yesca sprite sheet. Preserve columns ONE, TWO and FOUR pixel-for-pixel in spirit, all identity, all clothing, all four row directions, the uniform magenta background and the exact five-column/four-row layout and framing. The current third and fifth columns incorrectly show another long stride: they must be WALK PASSING POSES. In EVERY ROW in column THREE: planted left foot directly underneath hips, right knee bent and right boot lifted beside the left calf; both knees/feet close to the centerline, NOT splayed in a wide stride; arms swinging past torso midpoint. In EVERY ROW in column FIVE: planted right foot directly underneath hips, left knee bent and left boot lifted beside the right calf; knees/feet close to the centerline; opposite arm phase. This makes column TWO long left contact, column THREE narrow passing, column FOUR long right contact, column FIVE narrow opposite passing. First column stays perfectly idle, no raised foot, arms relaxed. Row one FRONT, row two RIGHT PROFILE, row three BACK, row four LEFT PROFILE. No face in the back row. Exact same body height and baseline in each cell. No shadows outside figures, no text, no checkerboard, no grid. Target dimensions 1280x1024 if available, but never change the 5x4 cell layout. Four walk columns must make the boots clearly alternate WIDE / NARROW / WIDE / NARROW rather than four repeated wide strides.
```

Resultado original: `C:\Users\manue\.codex\generated_images\01a085ff-60f5-7242-bf7e-04e42b7cce64\exec-dd25ceb8-d661-4d3a-b926-dd64a0ab5e27.png`.

### yesca: contacto opuesto

Entrada: el resultado de la edición de pasos intermedios.

```text
Make one precise animation correction to this Yesca sprite sheet: edit ONLY the FOURTH column, all four rows. Leave columns 1, 2, 3 and 5 unchanged. In column 4 the contact stride wrongly duplicates column 2. Column 4 must be the OPPOSITE contact stride, half a gait cycle later. Front row and back row: mirror the BODY POSE of the column-2 figure horizontally, so the other boot is forward and the opposite hand swings forward, but retain her actual outfit, hair identity, apron and goggles. Right-profile row: continue facing image RIGHT, but reverse which arm is in front of the torso versus behind it, reverse the near versus far leg contact. Left-profile row: continue facing image LEFT with the opposite arm/leg swing to column 2. Do not turn the character, do not flip row directions, do not change magenta, grid, scale, idle poses or passing poses. Final sequence per row: 1 both feet planted idle, 2 contact leg A, 3 passing, 4 contact leg B with opposite hand forward, 5 opposite passing. Existing first, third and fifth columns already work well and must remain unchanged. Same exact 5x4 composition; no text or grid.
```

Resultado original: `C:\Users\manue\.codex\generated_images\01a085ff-60f5-7242-bf7e-04e42b7cce64\exec-15a49b56-51c4-40bc-b54f-77d21dcc2130.png`.

### yesca: orientaciones

Entrada: el resultado de la edición de contacto.

```text
Fix ONLY TWO incorrect cells in this 5-column, 4-row Yesca sprite atlas. Cell row TWO column FOUR currently faces LEFT but must face RIGHT: horizontally mirror that single sprite within its own cell. Cell row FOUR column FOUR currently faces RIGHT but must face LEFT: horizontally mirror that single sprite within its own cell. Make those two direction corrections only. The top row, third row, entire first idle column, all other cells and all artwork are already correct and must remain untouched. Final directions are row1 front, row2 ALL RIGHT, row3 back, row4 ALL LEFT. Preserve exact magenta background, 5x4 layout, cell centers, baseline, size, outfit, walking poses, no text and no grid.
```

Resultado original: `C:\Users\manue\.codex\generated_images\01a085ff-60f5-7242-bf7e-04e42b7cce64\exec-6ae6960d-fd1a-4654-8a70-c42746fabb68.png`.

### marin: pasos intermedios

Entrada: el atlas inicial del personaje.

```text
Edit ONLY columns THREE and FIVE (one-based) of this existing Marín cook sprite sheet. Preserve columns ONE, TWO and FOUR, all identity, beard, apron, clothing, all four row directions, uniform magenta and exact five-column/four-row cell framing. The current third and fifth columns incorrectly repeat a long stride. They must be WALK PASSING POSES. In EVERY ROW in column THREE: planted left foot directly underneath hips, right knee bent and right boot lifted beside the left calf, knees/feet narrowly beneath the body, NOT spread into a long stride, arms passing relaxed near torso. In EVERY ROW in column FIVE: planted right foot directly underneath hips, left knee bent and left boot lifted beside the right calf, knees/feet narrowly beneath the body, opposite arm phase. Column TWO and FOUR remain broad long contact strides. This creates visually obvious WIDE / NARROW / WIDE / NARROW walk columns, instead of four similar walking strides. The FIRST column remains perfectly still, both feet planted parallel, arms down. Row one FRONT, row two strict RIGHT PROFILE, row three BACK with NO face, row four strict LEFT PROFILE. Same scale, body height and feet baseline. No shadows outside figures, no text, checkerboard or visible grid. Target 1280x1024 if available without ever changing 5x4 layout.
```

Resultado original: `C:\Users\manue\.codex\generated_images\01a085ff-60f5-7242-bf7e-04e42b7cce64\exec-cd26c2da-13ed-474e-b37b-1e2286b9d033.png`.

### marin: contacto opuesto

Entrada: el resultado de la edición de pasos intermedios.

```text
One precise animation correction, ONLY FOURTH COLUMN of this Marín cook sprite sheet. Preserve first idle column and columns 2,3,5 unchanged. Column 4 must be opposite contact to column 2, not another copy. In FRONT and BACK rows reverse the stride and arm swing of column 2 horizontally: the boot nearest to the LEFT edge of that cell is forward when column-2 has the other boot forward; opposite hand forward. Preserve apron and outfit identity. In RIGHT PROFILE row keep facing RIGHT but put the near arm in front of his chest while far arm swings behind and reverse near/far planted-leg contact compared with column 2. In LEFT PROFILE keep facing LEFT but again use the opposite arm and near/far leg contact to column 2. All four directions stay unchanged; same scale, baseline and exact 5x4 layout. Existing narrow passing poses in columns 3/5 must remain. Uniform magenta, no shadows or text.
```

Resultado original: `C:\Users\manue\.codex\generated_images\01a085ff-60f5-7242-bf7e-04e42b7cce64\exec-2424ff96-322b-41cf-9339-b43102d33f66.png`.

### tala: pasos intermedios

Entrada: el atlas inicial del personaje.

```text
Edit ONLY columns THREE and FIVE (one-based) of this existing Tala sprite sheet. Preserve columns ONE, TWO and FOUR, exact identity, outfit, every row direction, magenta background and five-column/four-row framing. In the third and fifth columns the legs wrongly repeat long walking strides. Change them into NARROW WALK PASSING POSES. In EVERY ROW in column THREE: planted left foot directly underneath hips, right knee bent with right boot lifted beside left calf. In EVERY ROW in column FIVE: planted right foot directly underneath hips, left knee bent with left boot lifted beside right calf. Passing knees/feet must be close to body centerline, NOT spread in a broad stride; arms pass naturally beside hips in opposite phases. The walk sequence after first idle column is WIDE CONTACT / NARROW PASSING / WIDE OPPOSITE CONTACT / NARROW OPPOSITE PASSING. First column remains perfectly still with both feet parallel planted and arms down. Directions: top row FRONT toward viewer; second row strict RIGHT PROFILE toward image right; third row BACK with no face; bottom row strict LEFT PROFILE toward image left. Same scale, body height and baseline, all sprites fully contained inside cells. No external shadows, grid, text, labels or checkerboard. Target 1280x1024 if available; never alter the 5x4 layout.
```

Resultado original: `C:\Users\manue\.codex\generated_images\01a085ff-60f5-7242-bf7e-04e42b7cce64\exec-6e8b3e30-e52e-4635-95a7-3d9d76e30937.png`.

### tala: contacto opuesto

Entrada: el resultado de la edición de pasos intermedios.

```text
Make a precise animation correction to this existing Tala sprite atlas, ONLY columns FOUR and FIVE. Preserve columns 1,2,3 unchanged. In front and back rows column FOUR must be the HORIZONTALLY REVERSED BODY POSE of column TWO, keeping clothing identity: opposite boot forward, opposite hand forward. Column FIVE must be horizontally reversed BODY POSE of column THREE: the OTHER knee bent and OTHER foot planted. This reverses gait phase, not face direction. In profile rows retain image-right facing for row2 and image-left facing for row4; columns 4/5 must swap which near-versus-far leg is planted and reverse arm swing compared with columns 2/3. The large lifted knee visible toward the camera in current column3 must instead be the far hidden knee in column5, with the near leg straight planted. Four walk phases are clearly: contact A, passing A, contact B, passing B. First column quiet standing with both feet planted remains untouched. No turning or changes to row orientations, no face in back row. Keep same navy vest, mustard tunic, satchel, hair, 5x4 exact grid, scale, foot baseline, uniform pure magenta. No text, borders, grid lines or ground shadows.
```

Resultado original: `C:\Users\manue\.codex\generated_images\01a085ff-60f5-7242-bf7e-04e42b7cce64\exec-abd1fdc7-e94d-4065-92a2-4a507e947929.png`.

### tala: orientaciones

Entrada: el resultado de la edición de contacto.

```text
Fix ONLY THREE direction mistakes in this existing Tala sprite atlas, which has exactly FIVE columns and FOUR rows. Row TWO, column FOUR must face IMAGE RIGHT, so horizontally mirror that single left-facing sprite within its cell. Row FOUR, column FOUR must face IMAGE LEFT, so horizontally mirror that single right-facing sprite within its cell. Row FOUR, column FIVE must face IMAGE LEFT, so horizontally mirror that single right-facing sprite within its cell. Nothing else changes. Leave ALL other 17 sprites exactly as they are, including idle first column and walking phases. Final row directions: all five top sprites face FRONT, all five second-row sprites face RIGHT, all five third-row sprites show BACK, all five bottom-row sprites face LEFT. Preserve magenta, cell positions, proportions, clothing and baseline. No new text, visible grid or ground shadows.
```

Resultado original: `C:\Users\manue\.codex\generated_images\01a085ff-60f5-7242-bf7e-04e42b7cce64\exec-7355f389-f9ad-496c-a7b8-07a135d137cb.png`.

