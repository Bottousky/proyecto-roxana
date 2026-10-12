#!/bin/bash
# Referencias de un personaje para el estilo X e Y (ciclo 28): frente en pose A y hoja de giro
# (frente, perfil, espalda), con su hoja HD-2D adjunta. Uso: art-src/xy/referencias.sh <personaje> "<descripción>"
set -e
NAME=$1; WHO=$2; DIR="$(cd "$(dirname "$0")" && pwd)/$NAME"; mkdir -p "$DIR"; cd "$DIR"
[ -f referencia-hd2d.png ] || sips -s format png "../../../public/assets/actors/$NAME.webp" --out referencia-hd2d.png >/dev/null
CODEX=/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
LOOK="Rendered like a character of Pokemon X and Y (Nintendo 3DS) upscaled in an emulator: a clean 3D toon-shaded figure, proportions about 4.5 to 5 heads tall, large expressive anime eyes painted flat, smooth simple shapes, two-tone cel shading with soft rim light, clean saturated colours, no pixel art, no texture noise. Keep the exact same outfit, colours and hairstyle as the attached sprite sheet."
gen() { local name=$1 desc=$2
  [ -f "$name.png" ] && return
  "$CODEX" exec -C "$PWD" -s workspace-write -i referencia-hd2d.png -o "$name.txt" "Use your built-in image_gen tool (not any CLI fallback, no OPENAI_API_KEY). Use the attached image only as the character reference. Generate exactly ONE image and save it in the current directory as $name.png. Touch nothing else. Image: $desc The character: $WHO $LOOK Reply with the file name, its size, whether it has alpha, and the exact prompt you used." > "$name.log" 2>&1
}
gen giro "A character turnaround sheet in one wide image (1536x1024): the same character three times side by side at exactly the same size and height, left: front view, middle: right side profile view (facing right), right: back view, all standing straight in a relaxed A-pose (arms slightly away from the body), neutral friendly expression. Loose cloth (capes, scarves) hangs naturally and close to the body. Plain pure white background, no shadows, no text, no labels." &
gen frente-apose "A single full-body character model sheet view: front view, standing straight in a relaxed A-pose, neutral friendly expression, facing the viewer exactly, centred, full body with margin. Plain pure white background, no shadow, no text." &
wait
echo listo
