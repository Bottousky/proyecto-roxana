#!/usr/bin/env bash
# Evidencia completa de la vertical slice (test 10) para una revisión independiente, en UNA carpeta nueva.
# Uso (desde experiments/arithmos): scripts/animlab-evidence-t10.sh ../../artifacts/arithmos/animlab/cNN [VSn]
# Genera: main/ (20 cuadros, sondas 240 Hz, audio), textura.png, tiza.png, eureka.png, pies-entra.png, pies-atras.png,
# phone/, salteado/, salteado-junta.png, strip-unionsiete/, interactive/, medidas.txt, timeline.md (ordenada por tiempo).
set -euo pipefail
D=${1:?carpeta de salida}; VS=${2:-VS}
[ -e "$D/main" ] && { echo "ya existe $D/main: usar una carpeta nueva" >&2; exit 1; }
mkdir -p "$D"
cap() { node scripts/animlab-capture.mjs 10 "$@" >/dev/null 2>&1 || { echo "falló: capture $*" >&2; exit 1; }; }

# 1. corrida principal (la duración se conoce después: los recortes de textura van en un segundo paso)
cap "$D/main" --frames=20 --cols=4 --audio --hz=240
END=$(python3 -c "import json;print(round(json.load(open('$D/main/metrics.json'))['dur']-0.1,2))" 2>/dev/null || echo 23.3)
cap "$D/textura" --frames=2 "--crop=470,400,260,300,$END;860,280,240,200,$END;150,240,240,200,$END" --dpr=3
node scripts/animlab-stack.mjs "$D/textura.png" "$D/textura/crop-0.png" "$D/textura/crop-1.png" "$D/textura/crop-2.png" >/dev/null

# 2. medidas sobre las sondas de la corrida principal
python3 - "$D" <<'EOF'
import json, sys
D = sys.argv[1]
m = json.load(open(f'{D}/main/metrics.json'))['metrics']; ev = m['events']
p = json.load(open(f'{D}/main/probes.json')); dt = 1 / 240
def sp(i):
    a = p[i-1]['p']['punto']; b = p[i]['p']['punto']
    return 0 if not a or not b else ((b['x']-a['x'])**2 + (b['h']-a['h'])**2) ** 0.5 / dt
t_fin = ev['fin de contar']
runs, cur = [], None
for i in range(1, len(p)):
    t = p[i]['t']
    if not ev['aparece Punto'] + 0.9 <= t <= t_fin + 0.2: continue
    v = sp(i)
    if v > 5 and cur is None: cur = t
    if v <= 5 and cur is not None: runs.append(round(t - cur, 3)); cur = None
acc = 0
for i in range(2, len(p)):
    a, b, c = (p[k]['p']['contact'] for k in (i-2, i-1, i))
    if a > 0 and b > 0 and c > 0: acc = max(acc, abs(c - b) / dt)
slide = 0
for i in range(1, len(p)):
    for f in 'LR':
        a = p[i-1]['p']; b = p[i]['p']
        if a['alza'+f] < 0.6 and b['alza'+f] < 0.6: slide = max(slide, abs(b['pie'+f] - a['pie'+f]))
jump, jt = 0, None
for i in range(1, len(p)):
    if t_fin + 0.3 < p[i]['t']:
        a = p[i-1]['p']['punto']; b = p[i]['p']['punto']
        if a and b:
            d = ((b['x']-a['x'])**2 + (b['h']-a['h'])**2) ** 0.5
            if d > jump: jump, jt = d, p[i]['t']
lines = [
  f'saltos de conteo (vuelo medido, s): {runs}; 3.º/1.º = {runs[2]/runs[0]:.2f}' if len(runs) > 2 else f'saltos: {runs}',
  f'tiza: aceleración máx. en render a 240 Hz = {acc:.0f} px/s² (plan: {m.get("chalkAccelMax")})',
  f'pies: deslizamiento máx. con el pie apoyado = {slide:.2f} px por 1/240 s',
  f'Punto después del conteo: mayor desplazamiento en 1/240 s = {jump:.2f} px (t = {jt})',
  f'alcance: reachOver = {m.get("reachOver")}',
]
open(f'{D}/medidas.txt', 'w').write('\n'.join(lines) + '\n')
tg = ev['comprende']
json.dump([{'t': x['t'], 'p': {'cabeza': -x['p']['tilt']*100, 'torso': -x['p']['torso']*100, 'mano': x['p']['handH']/4}} for x in p if tg - 0.9 <= x['t'] <= tg + 0.8], open(f'{D}/probes-eureka.json', 'w'))
json.dump([{'t': x['t'], 'p': {'tiza': x['p']['contact']}} for x in p if ev['aparece Punto'] + 1.5 <= x['t'] <= ev['termina el 7'] + 0.2], open(f'{D}/probes-tiza.json', 'w'))
feet = [{'t': x['t'], 'p': {'pie_izq': x['p']['pieL'], 'pie_der': x['p']['pieR']}} for x in p]
json.dump([s for s in feet if 0.3 <= s['t'] <= ev['aparece Punto'] + 0.2], open(f'{D}/probes-pies-entra.json', 'w'))
json.dump([s for s in feet if ev['termina el 7'] <= s['t'] <= tg + 0.8], open(f'{D}/probes-pies-atras.json', 'w'))
rows = sorted(ev.items(), key=lambda kv: kv[1])
s = '| momento | t (s) | desde el anterior (s) |\n|---|---|---|\n'; prev = 0
for k, t in rows: s += f'| {k} | {t:.2f} | {t - prev:.2f} |\n'; prev = t
open(f'{D}/timeline-table.md', 'w').write(s)
print(open(f'{D}/medidas.txt').read())
EOF
node scripts/animlab-plot.mjs "$D/probes-eureka.json" "$D/eureka.png" cabeza,torso,mano "comprensión: cabeza ×100, torso ×100, mano ÷4" >/dev/null
node scripts/animlab-plot.mjs "$D/probes-tiza.json" "$D/tiza.png" tiza "punta de tiza (px/s, sondas a 240 Hz): marcas, 5, +, 2, llave, 7" >/dev/null
node scripts/animlab-plot.mjs "$D/probes-pies-entra.json" "$D/pies-entra.png" pie_izq,pie_der "entrada: x de cada pie (mesetas = pie plantado)" >/dev/null
node scripts/animlab-plot.mjs "$D/probes-pies-atras.json" "$D/pies-atras.png" pie_izq,pie_der "paso atrás y comprensión: x de cada pie" >/dev/null

# 3. teléfono, conteo salteado, tira de la unión al 7, interacción real
EV() { python3 -c "import json;print(json.load(open('$D/main/metrics.json'))['metrics']['events']['$1'])"; }
T_FIN=$(EV 'fin de contar'); T_HILO=$(EV 'hilo a la llave'); T_7=$(EV 'termina el 7')
cap "$D/phone" --size=844x390 --dpr=3 "--times=$T_FIN,$(EV 'escribe el 2'),$T_7,$END" --cols=2
cap "$D/salteado" --q=taps=3,0,5,1,6,2,4 --frames=2
node scripts/animlab-stack.mjs "$D/finals.png" "$D/main/final.png" "$D/salteado/final.png" >/dev/null
cap "$D/salteado-junta" --q=taps=3,0,5,1,6,2,4 --times=10.4,10.75,11.1,11.45,11.8 --cols=5 '--crop=860,240,700,360,10.75;860,240,700,360,11.45'
node scripts/animlab-stack.mjs "$D/salteado-junta.png" "$D/salteado-junta/crop-0.png" "$D/salteado-junta/crop-1.png" >/dev/null
U=$(python3 -c "a,b=$T_HILO-1.4,$T_7;print(','.join(str(round(a+(b-a)*k/5,2)) for k in range(6)))")
cap "$D/strip-unionsiete" --cols=6 "--times=$U"
mkdir -p "$D/interactive" && node scripts/animlab-interact.mjs "$D/interactive" >/dev/null
node scripts/animlab-stack.mjs "$D/interactive.png" "$D/interactive/2-ya-contado.png" "$D/interactive/3-final.png" >/dev/null
{ echo "# $VS — tabla de tiempos (ordenada)"; echo; cat "$D/timeline-table.md"; echo; echo "Medidas de ESTA corrida (main/probes.json, 240 Hz):"; sed 's/^/- /' "$D/medidas.txt"; } > "$D/timeline.md"
rm "$D/timeline-table.md"
echo "ok: $D"
