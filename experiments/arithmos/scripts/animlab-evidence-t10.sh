#!/usr/bin/env bash
# Evidencia completa de la vertical slice (test 10) para una revisión independiente, en UNA carpeta nueva.
# Uso (desde experiments/arithmos): scripts/animlab-evidence-t10.sh ../../artifacts/arithmos/animlab/cNN [VSn]
# Genera: main/ (20 cuadros, sondas 240 Hz, audio), textura.png, tiza.png, eureka.png, pies-entra.png, pies-atras.png,
# phone/, salteado/, salteado-junta.png, strip-unionsiete/, interactive/, medidas.txt, timeline.md (ordenada por tiempo).
set -euo pipefail
D=${1:?carpeta de salida}; VS=${2:-VS}
[ -e "$D/main" ] && { echo "ya existe $D/main: usar una carpeta nueva" >&2; exit 1; }
mkdir -p "$D"
# un reintento: el navegador a veces falla al arrancar (puerto ocupado por la captura anterior)
cap() { node scripts/animlab-capture.mjs 10 "$@" >/dev/null 2>&1 || { sleep 2; node scripts/animlab-capture.mjs 10 "$@" >/dev/null 2>&1; } || { echo "falló: capture $*" >&2; exit 1; }; }

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
# vuelo = la altura cambia (al aterrizar la altura queda fija aunque el cuerpo siga de largo en x); se unen huecos ≤ 30 ms (el ápice)
runs, wins, cur, gap = [], [], None, 0
for i in range(1, len(p)):
    t = p[i]['t']
    if not ev['aparece Punto'] + 0.9 <= t <= t_fin + 0.2: continue
    a, b = p[i-1]['p']['punto'], p[i]['p']['punto']
    air = bool(a and b and abs(b['h'] - a['h']) / dt > 2)
    if air:
        if cur is None: cur = t
        gap = 0; last = t
    elif cur is not None:
        gap += 1
        if gap > 7: runs.append(round(last - cur + dt, 3)); wins.append((cur, last)); cur = None
ramps = []
for t0, t1 in wins:  # vx a 60 Hz desde 50 ms antes del despegue hasta 0.3 s después de aterrizar
    s60 = [x for x in p if t0 - 0.05 <= x['t'] <= t1 + 0.3 and x['p']['punto']][::4]
    v = [(b['p']['punto']['x'] - a['p']['punto']['x']) * 60 for a, b in zip(s60, s60[1:])]
    pk = max(map(abs, v)) or 1
    ramps.append(round(max(abs(b - a) for a, b in zip(v, v[1:])) / pk, 2))
acc = 0
for i in range(2, len(p)):
    a, b, c = (p[k]['p']['contact'] for k in (i-2, i-1, i))
    if a > 0 and b > 0 and c > 0: acc = max(acc, abs(c - b) / dt)
slide = 0
for i in range(1, len(p)):
    for f in 'LR':
        a = p[i-1]['p']; b = p[i]['p']
        if a['alza'+f] < 0.6 and b['alza'+f] < 0.6: slide = max(slide, abs(b['pie'+f] - a['pie'+f]))
# continuidad de Punto: pasos aislados (> 1 px y > 3× los vecinos) = saltos de posición, no movimiento rápido
P = [x for x in p if x['p']['punto']]
dd = lambda a, b: ((b['p']['punto']['x']-a['p']['punto']['x'])**2 + (b['p']['punto']['h']-a['p']['punto']['h'])**2) ** 0.5
spikes = [round(P[i]['t'], 3) for i in range(2, len(P) - 1) if dd(P[i-1], P[i]) > 1 and dd(P[i-1], P[i]) > 3 * max(dd(P[i-2], P[i-1]), dd(P[i], P[i+1]), 0.2)]
sq = max((abs(b['p']['punto']['squash'] - a['p']['punto']['squash']), b['t']) for a, b in zip(P, P[1:]))
# saltos: cambio máximo de vx por cuadro de 60 Hz, relativo al pico de ese salto (rampas, no arranques en seco)
lines = [
  f'saltos de conteo (vuelo medido, s): {runs}; 3.º/1.º = {runs[2]/runs[0]:.2f}' if len(runs) > 2 else f'saltos: {runs}',
  f'saltos: máx. cambio de vx por cuadro de 60 Hz / pico del salto = {ramps}',
  f'tiza: aceleración máx. en render a 240 Hz = {acc:.0f} px/s² (plan: {m.get("chalkAccelMax")})',
  f'pies: deslizamiento máx. con el pie apoyado = {slide:.2f} px por 1/240 s',
  f'Punto: saltos de posición aislados = {len(spikes)} {spikes[:5]}; mayor cambio de aplastamiento = {sq[0]:.1f} % en 1/240 s (t = {sq[1]:.3f})',
  f'alcance: reachOver = {m.get("reachOver")}',
]
open(f'{D}/medidas.txt', 'w').write('\n'.join(lines) + '\n')
tg = ev['comprende']
json.dump([{'t': x['t'], 'p': {'cabeza': -x['p']['tilt']*100, 'torso': -x['p']['torso']*100, 'mano': x['p']['handH']/4}} for x in p if tg - 0.9 <= x['t'] <= tg + 0.8], open(f'{D}/probes-eureka.json', 'w'))
json.dump([{'t': x['t'], 'p': {'tiza': x['p']['contact']}} for x in p if ev['aparece Punto'] + 1.5 <= x['t'] <= ev['termina el 7'] + 0.2], open(f'{D}/probes-tiza.json', 'w'))
# mirada: la cabeza (inclinación ×100, positivo = abajo) frente a la altura de Punto durante el conteo
json.dump([{'t': x['t'], 'p': {'cabeza_abajo': x['p']['tilt'] * 100, 'punto_altura': (x['p']['punto']['h'] - 380) if x['p']['punto'] else None}} for x in p if ev['aparece Punto'] + 0.8 <= x['t'] <= t_fin + 0.4], open(f'{D}/probes-mirada.json', 'w'))
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
node scripts/animlab-plot.mjs "$D/probes-mirada.json" "$D/mirada.png" cabeza_abajo,punto_altura "conteo: inclinación de la cabeza ×100 (+ = abajo, a la marca) y altura de Punto − 380 px" >/dev/null
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
