#!/bin/bash
# Plantas y árboles del estilo X e Y (ciclo 27): mismas celdas y orden que las hojas pixel art.
while pgrep -f "art-src/xy/generate.sh\|./generate.sh" >/dev/null; do sleep 20; done
CODEX=/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
STYLE="Style: clean cel-shaded 3D-render look of a modern handheld RPG (like a bright 3DS-era town): soft rounded volumes, two-tone toon shading with a soft lighter top, thin darker-green outline, bright fresh colours, low detail, no pixel art, no noise. Fully TRANSPARENT background (real alpha channel), nothing else in the image, no ground shadows, no text. Each item centred in its cell, standing on the bottom of the cell, never crossing into another cell."
gen() { local name=$1 desc=$2
  [ -f "$name.png" ] && return
  "$CODEX" exec -C "$PWD" -s workspace-write -o "$name.txt" "Use your built-in image_gen tool (not any CLI fallback, no OPENAI_API_KEY). Generate exactly ONE image with a transparent background and save it in the current directory as $name.png. Touch nothing else. Image: $desc $STYLE Reply with the file name, its size, whether it has alpha, and the exact prompt you used." > "$name.log" 2>&1
}
gen xy-plants-a "A square 1024x1024 sprite sheet, a 4 by 4 grid of small ground plants, each in its own equal cell. Row 1: four low tufts of short lawn grass. Row 2: four clumps of tall grass with golden seed heads. Row 3: daisies with white petals; yellow buttercups; blue bellflowers; red poppies. Row 4: a fern; a clover patch with tiny white flowers; a broad-leaf plant; a second fern." &
gen xy-plants-b "A square 1024x1024 sprite sheet, a 4 by 4 grid of garden plants, each in its own equal cell. Row 1: four round leafy green shrubs of slightly different sizes. Row 2: four round flowering shrubs, with pink, white, yellow and red flowers. Row 3: four clumps of cattail reeds with brown heads. Row 4: lavender; sunflowers; pink roses bush; tulips in red, pink, yellow and purple." &
wait
gen xy-trees "A 1536x1024 sprite sheet, a 3 by 2 grid of six trees, each in its own equal cell, trunk base at the bottom centre of its cell. Top row: a big round broad oak with a short trunk; a tall narrow cypress; a birch with white trunk and golden-yellow leaves. Bottom row: a weeping willow with long hanging fronds; a large round blue-green oak; an apple tree with small red apples."
echo done
