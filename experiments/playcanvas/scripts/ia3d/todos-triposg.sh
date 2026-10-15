#!/bin/bash
# Los diez personajes con TripoSG (ciclo 30), de a uno: forma (si falta), modelo, regiones y kit.
cd "$(dirname "$0")/../.."
for n in viajero edda lumen marin vega nereo tala yesca consejera ohm; do
  echo "== $n $(date +%T)"
  steps="modelo regiones"; [ -f ~/code/ohmdal-3d/$n-tsg/forma.glb ] || steps="forma $steps"
  if scripts/ia3d/personaje.sh "$n" $steps > ~/code/ohmdal-3d/$n-tsg.log 2>&1; then echo "ok $n $(date +%T)"; else echo "FALLÓ $n $(date +%T)"; fi
done
echo "listos $(date +%T)"
