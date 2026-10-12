#!/bin/bash
# Texturas del estilo X e Y (ciclo 27): una imagen por superficie, generada con image_gen de Codex.
CODEX=/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex
STYLE="Style: clean hand-painted game texture for a modern cel-shaded 3D handheld RPG town (soft, bright, simple shapes, gentle large-scale colour variation, crisp but soft edges, very low detail, no pixel art, no photographic noise, no grain, no lighting gradient, no shadows cast across it, flat even light). It must tile seamlessly on all four edges. Square, 1024x1024."
gen() { local name=$1 desc=$2
  [ -f "$name.png" ] && return
  "$CODEX" exec -C "$PWD" -s workspace-write -o "$name.txt" "Use your built-in image_gen tool (not any CLI fallback, no OPENAI_API_KEY). Generate exactly ONE image and save it in the current directory as $name.png. Touch nothing else. Image: $desc $STYLE Reply with the file name, its size and the exact prompt you used." > "$name.log" 2>&1
}
gen xy-meadow "Top-down seamless grass lawn: fresh bright spring green with soft lighter and darker patches and a few tiny soft blade strokes, like a tidy village lawn." &
gen xy-cobble "Top-down seamless village street paving of rounded smooth stones, light warm cream and pale grey stones of varied size with soft taupe gaps, friendly and clean." &
wait
gen xy-stone "Front view seamless wall of light warm beige cut stone blocks in running bond, soft clean mortar lines, slightly rounded block corners." &
gen xy-roof "Front view seamless roof of overlapping slate tiles in neutral light grey (it will be tinted), rows of rounded scalloped tiles with soft shading at each row edge." &
wait
gen xy-wood "Front view seamless vertical wooden planks, warm medium brown, soft simple grain lines and a couple of small knots, clean." &
gen xy-plaster "Front view seamless smooth cream white plaster wall with very subtle soft patches." &
wait
gen xy-timber "Front view seamless half-timbered wall: cream white plaster panels framed by dark brown timber beams in exactly this layout per tile: a vertical beam at the left edge and in the middle, a horizontal beam at mid height, and diagonal braces forming X shapes in each half (like a Tudor timber frame), beams soft and clean." &
gen xy-flagstone "Top-down seamless square paving slabs in a 4 by 4 grid, light warm grey with soft subtle tone differences between slabs and thin soft joints." &
wait
gen xy-rock "Seamless natural rock face of a hillside cliff: large soft angular grey rock planes with gentle lighter tops, clean shapes, a few tiny moss specks." &
gen xy-moss "Top-down seamless soft cushion moss and low clover, bright green with soft yellow-green highlights, rounded clumps." &
wait
echo done
