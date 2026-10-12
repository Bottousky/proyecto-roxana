#!/bin/bash
# El viajero en estilo X e Y (ciclo 28): referencias para imagen a 3D y la hoja de sprites redibujada.
# La hoja HD-2D actual (referencia-hd2d.png) va adjunta: es el mismo personaje.
CODEX=/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
WHO="The SAME character as in the attached sprite sheet: a young traveller of about 14, curly messy brown hair, blue-grey eyes, a long mustard-yellow scarf, a teal knee-length coat with brass buttons and cuffs, a cream shirt, a brown leather belt, a brown satchel on a strap across the chest worn at the right hip, dark grey trousers tucked into brown leather boots."
LOOK="Rendered like a character of Pokemon X and Y (Nintendo 3DS) upscaled in an emulator: a clean 3D toon-shaded figure, proportions about 4 heads tall (big head, compact body, not super-deformed), large expressive anime eyes painted flat, smooth simple shapes, two-tone cel shading with soft rim light, thin dark outline, clean saturated colours, no pixel art, no texture noise."
gen() { local name=$1 desc=$2
  [ -f "$name.png" ] && return
  "$CODEX" exec -C "$PWD" -s workspace-write -i referencia-hd2d.png -o "$name.txt" "Use your built-in image_gen tool (not any CLI fallback, no OPENAI_API_KEY). Use the attached image only as the character reference. Generate exactly ONE image and save it in the current directory as $name.png. Touch nothing else. Image: $desc $WHO $LOOK Reply with the file name, its size, whether it has alpha, and the exact prompt you used." > "$name.log" 2>&1
}
gen frente-apose "A single full-body character model sheet view: front view, standing straight in a relaxed A-pose (arms slightly away from the body, palms toward the legs, feet slightly apart), neutral friendly expression, facing the viewer exactly, centred, full body from hair to boots with margin. Plain pure white background, no shadow on the floor, no text." &
gen giro "A character turnaround sheet in one wide image (1536x1024): the same character three times side by side at exactly the same size and height, left: front view, middle: right side profile view, right: back view, all standing straight in a relaxed A-pose, neutral expression. Plain pure white background, no shadows, no text, no labels." &
wait
gen hoja-sprites "A sprite sheet with EXACTLY the same layout as the attached one: a grid of 5 columns by 4 rows of equal cells (1536x1229 or similar 5:4 grid). Row 1 facing the viewer, row 2 facing right, row 3 facing away, row 4 facing left. In each row: column 1 standing idle, columns 2 to 5 a four-frame walk cycle. The character is the same size in every cell and stands on the bottom of its cell. TRANSPARENT background (real alpha), nothing else, no text."
echo done
