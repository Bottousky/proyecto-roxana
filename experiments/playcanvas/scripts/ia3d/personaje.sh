#!/bin/bash
# Un personaje en 3D, de las referencias al juego y al kit (ciclo 28). Pasos:
#   forma     Hunyuan3D-2mv desde art-src/xy/<personaje>/giro.png (unos 17 min)
#   modelo    textura, maestro y esqueleto (scripts/blender/viajero-3d.py)
#   explorar  grupos de color del maestro, para escribir personajes/<personaje>.json
#   regiones  regiones del maestro, mapa de regiones del juego y kit de impresión
# Uso: scripts/ia3d/personaje.sh <personaje> <paso…>    (el entorno está en ~/code/ohmdal-3d)
set -e
# A robot (Ohm) declares "robot": true and the height of its feet ("pies") in its personajes/<name>.json.
robot() { node -e "try{const c=require('$ROOT/personajes/$NAME.json');process.stdout.write(c.robot?'1':'')}catch{}"; }
feet() { node -e "try{const c=require('$ROOT/personajes/$NAME.json');process.stdout.write(String(c.pies||.32))}catch{process.stdout.write('.32')}"; }
NAME=$1; shift
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; WORK=~/code/ohmdal-3d/$NAME; OUT=$WORK/out; mkdir -p "$OUT"
cp "$ROOT/art-src/xy/$NAME/giro.png" "$WORK/giro.png"
for step in "$@"; do case $step in
  forma) (. ~/code/ohmdal-3d/venv/bin/activate && cd ~/code/ohmdal-3d/Hunyuan3D-2 && caffeinate -dims python "$ROOT/scripts/ia3d/forma.py" "$WORK/giro.png" "$WORK/forma.glb");;
  modelo) ROBOT=$(robot) PIES=$(feet) ESQUELETO=$(node -e "try{const c=require('$ROOT/personajes/$NAME.json');process.stdout.write(JSON.stringify(c.esqueleto||{}))}catch{process.stdout.write('{}')}") caffeinate -dims blender -b -P "$ROOT/scripts/blender/viajero-3d.py" -- "$WORK/forma.glb" "$WORK" "$OUT/$NAME.glb" 16000 2>&1 | grep -E "malla|maestro|exportado|Error|Traceback";;
  explorar) caffeinate -dims blender -b -P "$ROOT/scripts/blender/regiones.py" -- "$OUT/$NAME-maestro.glb" "$WORK" explorar "$OUT/$NAME" 2>&1 | grep -E "^\{|caras sin vista|Error|Traceback";;
  regiones)
    caffeinate -dims blender -b -P "$ROOT/scripts/blender/regiones.py" -- "$OUT/$NAME-maestro.glb" "$WORK" asignar "$OUT/$NAME" "$ROOT/personajes/$NAME.json" 2>&1 | grep -vE "^(Read|Fra|00:|Blender|$)" | grep -E "^[a-z]+ 0\.|listo|Error|Traceback"
    ROBOT=$(robot) PIES=$(feet) ESQUELETO=$(node -e "try{const c=require('$ROOT/personajes/$NAME.json');process.stdout.write(JSON.stringify(c.esqueleto||{}))}catch{process.stdout.write('{}')}") REGIONES="$OUT/$NAME-regiones.npy" MAESTRO="$OUT/$NAME-maestro-b.glb" caffeinate -dims blender -b -P "$ROOT/scripts/blender/viajero-3d.py" -- "$WORK/forma.glb" "$WORK" "$OUT/$NAME.glb" 16000 2>&1 | grep -E "regiones|exportado|Error|Traceback"
    caffeinate -dims blender -b -P "$ROOT/scripts/blender/kit.py" -- "$OUT/$NAME-regiones.blend" "$ROOT/personajes/$NAME.json" "$OUT/kit" 2>&1 | grep -E "^pieza|Error|Traceback"
    cp "$OUT/$NAME.glb" "$ROOT/public/assets/xy/$NAME-3d.glb"; cp "$OUT/$NAME-regiones.png" "$ROOT/public/assets/xy/$NAME-3d-regiones.png"
    node -e "const c=require('$ROOT/personajes/$NAME.json');require('fs').writeFileSync('$ROOT/public/assets/xy/$NAME-3d-regiones.json',JSON.stringify({regiones:c.regiones.map(r=>({nombre:r.nombre,muestra:r.muestra,tenible:r.tenible||null}))},null,1))"
    mkdir -p "$ROOT/kits/$NAME"; cp "$OUT/kit/kit.json" "$ROOT/kits/$NAME/";;
  *) echo "paso desconocido: $step"; exit 1;;
esac; done
echo "listo: $NAME $*"
