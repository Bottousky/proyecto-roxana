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
# saltos de conteo: del plan de la escena (metrics.hops: agachada 0.12 s + vuelo); en cada uno, vx a 60 Hz desde el
# despegue hasta 0.3 s después de aterrizar (la altura ya no sirve para detectar el vuelo: el centro baja al aplastarse)
hops = [h for h in m['hops'] if ev['aparece Punto'] < h['t'] < t_fin]
runs = [round(h['dur'] - 0.12, 3) for h in hops]
ramps = []
for h in hops:
    s60 = [x for x in p if h['t'] + 0.12 - 0.05 <= x['t'] <= h['t'] + h['dur'] + 0.3 and x['p']['punto']][::4]
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
# pausas de lectura (VL §5.4): quietud antes de cada idea nueva, a 60 Hz: Punto < 5 px/s, sin tiza, mano < 20 px/s
def still_before(T):
    xs = [x for x in p if x['t'] < T][::-1][::4]; n = 0
    for b, a in zip(xs, xs[1:]):
        d = b['t'] - a['t']; pa, pb = a['p']['punto'], b['p']['punto']
        v = ((pb['x'] - pa['x'])**2 + (pb['h'] - pa['h'])**2) ** 0.5 / d
        if v < 5 and b['p']['contact'] == 0 and abs(b['p']['handH'] - a['p']['handH']) / d < 20: n += 1
        else: break
    return round(n / 60, 2)
def still_react(T):  # antes de la reacción: Punto < 5 px/s, cabeza < 0.1 rad/s, pies quietos, a 60 Hz
    xs = [x for x in p if x['t'] < T][::-1][::4]; n = 0
    for b, a in zip(xs, xs[1:]):
        d = b['t'] - a['t']; pa, pb = a['p']['punto'], b['p']['punto']
        v = ((pb['x'] - pa['x'])**2 + (pb['h'] - pa['h'])**2) ** 0.5 / d
        fv = max(abs(b['p']['pieL'] - a['p']['pieL']), abs(b['p']['pieR'] - a['p']['pieR'])) / d
        if v < 5 and abs(b['p']['tilt'] - a['p']['tilt']) / d < 0.1 and fv < 1: n += 1
        else: break
    return round(n / 60, 2)
react = still_react(ev['comprende'] - 0.62) if 'comprende' in ev else None
pauses = {k: still_before(ev[k]) for k in ('escribe el 5', 'lazo de 2', 'une los grupos', 'empieza el 7') if k in ev}
# marcas y trazos cortos: pico/media de la velocidad de contacto de cada trazo (sin crucero en trazos de ~40 px)
runs_c, cur = [], []
for x in p:
    c = x['p']['contact']
    if c > 0: cur.append(c)
    elif cur: runs_c.append(cur); cur = []
pm = [round(max(r) / (sum(r) / len(r)), 2) for r in runs_c if len(r) > 4]
# tamaño de las cifras en un teléfono de 844 px de ancho: 34 px de mundo × 844 / ancho de cámara
cam_at = lambda T: min(p, key=lambda x: abs(x['t'] - T))['p']['cam']
num_px = {k: round(34 * 844 / cam_at(ev[k]), 1) for k in ('escribe el 5', 'termina el 7')}
num_px['final'] = round(34 * 844 / p[-1]['p']['cam'], 1)
lines = [
  f'saltos de conteo (vuelo del plan, s): {runs}; 3.º/1.º = {runs[2]/runs[0]:.2f}' if len(runs) > 2 else f'saltos: {runs}',
  f'saltos: máx. cambio de vx por cuadro de 60 Hz / pico del salto = {ramps}',
  f'pausas de lectura (s quieto antes de cada idea; Punto < 5 px/s, sin tiza, mano < 20 px/s, a 60 Hz): {pauses}',
  f'quietud antes de la reacción de comprender (Punto, cabeza y pies; desde el contramovimiento a comprende − 0.62 s): {react} s',
  f'trazos de tiza: pico/media de la velocidad de contacto por trazo = mín {min(pm)}, máx {max(pm)}, mediana {sorted(pm)[len(pm)//2]} ({len(pm)} trazos)',
  f'altura de las cifras en un teléfono de 844×390 (px CSS): {num_px}',
  f'tiza: aceleración máx. en render a 240 Hz = {acc:.0f} px/s² (plan: {m.get("chalkAccelMax")})',
  f'pies: deslizamiento máx. con el pie apoyado = {slide:.2f} px por 1/240 s',
  f'Punto: saltos de posición aislados = {len(spikes)} {spikes[:5]}; mayor cambio de aplastamiento = {sq[0]:.1f} % en 1/240 s (t = {sq[1]:.3f})',
  f'alcance: reachOver = {m.get("reachOver")}',
  'textura (presión antes del compuesto; autocorr. a 2 px del grano tras quitar la tendencia: cerca de 1 = "a cuentas" regulares, cerca de 0 = grano sin patrón; el 0.85 del motor viejo (E01) era sobre una recta, sin quitar tendencia): ' + ('; '.join(f"{x['where']}: pico medio {x['peakMean']}, CV pico {x['peakCV']}, CV ancho {x['widthCV']}, autocorr. 2 px {x['autocorr2px']} ({x['cols']} columnas)" for x in m['texture']) if m.get('texture') else 'sin medir'),
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
# los hilos de cada grupo se juntan en uno al cerrarse su lazo
G5=$(EV 'se juntan los hilos de 5'); G2=$(EV 'se juntan los hilos de 2')
H=$(python3 -c "print(','.join(str(round(x,2)) for x in [$G5-0.1,$G5+0.3,$G5+0.6,$G5+1.0,$G2+0.3,$G2+1.0]))")
CT=$(python3 -c "print(round($G2 + 1.0, 2))")
cap "$D/strip-hilos" --cols=3 "--times=$H" "--crop=300,40,1150,540,$CT"
HC=$(python3 -c "print(';'.join('300,40,1150,540,%s' % round($G5 + d, 2) for d in (-0.05, 0.3, 0.6, 1.0)))")
cap "$D/hilos-recortes" --frames=2 --dpr=2 "--crop=$HC"
node scripts/animlab-stack.mjs "$D/hilos-recortes.png" "$D/hilos-recortes/crop-0.png" "$D/hilos-recortes/crop-1.png" "$D/hilos-recortes/crop-2.png" "$D/hilos-recortes/crop-3.png" >/dev/null
GC=$(EV comprende); TC=$(python3 -c "g=$GC;print(','.join(str(round(g+d,2)) for d in (-1.2,-0.62,-0.4,-0.1,0.15,0.4,0.8,1.6)))")
cap "$D/strip-comprende" --cols=4 "--times=$TC"
# mirada [C]: la cara al mirar un punto (en la agachada de un salto), al bajar a la marca y en la comprensión
H2=$(python3 -c "import json;h=[x for x in json.load(open('$D/main/metrics.json'))['metrics']['hops'] if 6<x['t']<8][0];print(round(h['t']+0.1,2), round(h['t']+h['dur']+0.25,2))")
set -- $H2; TA=$1; TB=$2; TR=$(python3 -c "print(round($GC - 0.3, 2))"); TE=$(python3 -c "print(round($GC + 0.75, 2))")
cap "$D/mirada-caras" --frames=2 --dpr=2 "--crop=150,250,500,450,$TA;150,250,500,450,$TB;0,150,700,700,$TR;0,150,700,700,$TE"
node scripts/animlab-stack.mjs "$D/mirada-caras.png" "$D/mirada-caras/crop-0.png" "$D/mirada-caras/crop-1.png" "$D/mirada-caras/crop-2.png" "$D/mirada-caras/crop-3.png" >/dev/null
mkdir -p "$D/interactive" && node scripts/animlab-interact.mjs "$D/interactive" >/dev/null
node scripts/animlab-stack.mjs "$D/interactive.png" "$D/interactive/2-ya-contado.png" "$D/interactive/3-final.png" >/dev/null
{ echo "# $VS — tabla de tiempos (ordenada)"; echo; cat "$D/timeline-table.md"; echo; echo "Medidas de ESTA corrida (main/probes.json, 240 Hz):"; sed 's/^/- /' "$D/medidas.txt"; } > "$D/timeline.md"
rm "$D/timeline-table.md"
echo "ok: $D"
