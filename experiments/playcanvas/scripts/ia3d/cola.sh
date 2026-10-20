#!/bin/bash
# Cola de formas 3D (ciclo 28): toma los personajes aprobados (una línea por nombre en
# ~/code/ohmdal-3d/aprobados.txt) y les corre forma, modelo y explorar, de a uno (una sola GPU).
# Termina cuando aparece la palabra «fin» en la lista y no queda nadie pendiente.
cd "$(dirname "$0")/../.."
LIST=~/code/ohmdal-3d/aprobados.txt; DONE=~/code/ohmdal-3d/hechos.txt; touch "$LIST" "$DONE"
while true; do
  next=$(grep -vxF -f "$DONE" "$LIST" | grep -v '^fin$' | head -1)
  if [ -z "$next" ]; then grep -qx fin "$LIST" && break; sleep 20; continue; fi
  echo "== $next $(date +%T)"
  if scripts/ia3d/personaje.sh "$next" forma modelo explorar > ~/code/ohmdal-3d/$next.log 2>&1; then echo "ok $next $(date +%T)"; else echo "FALLÓ $next"; fi
  echo "$next" >> "$DONE"
done
echo "cola terminada"
