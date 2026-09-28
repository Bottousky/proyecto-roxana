# Reduce las texturas pixel art generadas (art-src/hd2d, 1024 px con píxeles lógicos de ~8)
# a su resolución lógica: promedio por caja, paleta cerrada y sin difuminar. El motor las
# muestra con filtro NEAREST de cerca, así cada píxel lógico sigue siendo un píxel nítido.
# Uso: python scripts/hd2d-textures.py
from PIL import Image
import numpy as np, os

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC, OUT = os.path.join(ROOT, 'art-src', 'hd2d'), os.path.join(ROOT, 'public', 'assets', 'hd2d')
os.makedirs(OUT, exist_ok=True)
# nombre: (lado lógico, colores de la paleta)
SPEC = {'cobble': (128, 40), 'stone': (128, 40), 'wood': (128, 32), 'roof': (128, 32), 'meadow': (128, 40),
        'burlap': (96, 24), 'hay': (96, 24), 'iron': (96, 24), 'plaster': (128, 24), 'awning': (96, 16), 'endgrain': (64, 24), 'flagstone': (128, 32)}
# La rodaja de tronco es una sola imagen, no un mosaico: no se recorta.
WHOLE = {'endgrain'}
def period(a, axis):
    # El generador entrega un mosaico de ~1017 px con un borde que no empalma: se recorta
    # donde la imagen vuelve a parecerse a su primera franja.
    n = a.shape[axis]
    cost = lambda h: np.abs(np.take(a, range(h, h + 6), axis) - np.take(a, range(6), axis)).mean()
    return min(range(n - 96, n - 5), key=cost)

for name, (side, colors) in SPEC.items():
    im = Image.open(os.path.join(SRC, name + '.png')).convert('RGB')
    a = np.asarray(im, dtype=np.float32)
    if name not in WHOLE: im = im.crop((0, 0, period(a, 1), period(a, 0)))
    im = im.resize((side, side), Image.BOX)
    if name == 'meadow':
        # El verde generado es de pradera de catálogo: se lo lleva hacia el oliva de las
        # referencias (menos saturado, un poco hacia el amarillo, algo más oscuro).
        h, sat, v = [np.asarray(c, np.float32) for c in im.convert('HSV').split()]
        h = (h - 6) % 256; sat *= .72; v *= .9
        im = Image.merge('HSV', [Image.fromarray(np.clip(c, 0, 255).astype(np.uint8)) for c in (h, sat, v)]).convert('RGB')
    im = im.quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    im.save(os.path.join(OUT, name + '.png'), optimize=True)
    print(name, side, colors)
