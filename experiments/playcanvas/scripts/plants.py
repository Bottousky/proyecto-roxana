# Prepara los atlas de plantas pixel art (art-src/plants/plants-{a,b}.png, 1024 px, grilla
# de 4×4 con píxeles lógicos de ~4): los reduce a 256 px tomando el píxel central de cada
# bloque (nítido, sin mezcla), corta el alfa, extiende el color hacia lo transparente para
# que los mipmaps no dejen halo, y anota el recuadro y la proporción de cada sprite.
# Uso: python scripts/plants.py
from PIL import Image
import numpy as np, json, os

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC, OUT = os.path.join(ROOT, 'art-src', 'plants'), os.path.join(ROOT, 'public', 'assets', 'plants')
os.makedirs(OUT, exist_ok=True)
SIDE, GRID = 256, 4
meta = {}
for key in ('a', 'b'):
    src = np.asarray(Image.open(os.path.join(SRC, f'plants-{key}.png')).convert('RGBA'))
    step = src.shape[0] / SIDE
    idx = (np.arange(SIDE) * step + step / 2).astype(int)
    a = src[idx][:, idx].copy()
    alpha = a[:, :, 3] > 110
    a[:, :, 3] = np.where(alpha, 255, 0)
    # Sangrado de color: cada píxel transparente toma el del vecino opaco más cercano.
    rgb = a[:, :, :3].astype(np.float32); known = alpha.copy()
    for _ in range(6):
        grown = rgb.copy(); hit = known.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sh = np.roll(known, (dy, dx), (0, 1)); src_rgb = np.roll(rgb, (dy, dx), (0, 1))
            take = sh & ~hit; grown[take] = src_rgb[take]; hit |= take
        rgb, known = grown, hit
    a[:, :, :3] = rgb.astype(np.uint8)
    Image.fromarray(a, 'RGBA').save(os.path.join(OUT, f'{key}.png'), optimize=True)
    cells, c = [], SIDE // GRID
    for row in range(GRID):
        for col in range(GRID):
            m = alpha[row * c:(row + 1) * c, col * c:(col + 1) * c]
            ys, xs = np.nonzero(m)
            if len(xs) < 12: cells.append(None); continue
            x0, x1, y0, y1 = col * c + xs.min(), col * c + xs.max() + 1, row * c + ys.min(), row * c + ys.max() + 1
            cells.append({'uv': [round(x0 / SIDE, 5), round(y0 / SIDE, 5), round(x1 / SIDE, 5), round(y1 / SIDE, 5)], 'aspect': round((x1 - x0) / (y1 - y0), 3)})
    meta[key] = cells
    print(key, sum(1 for x in cells if x), 'sprites')
json.dump(meta, open(os.path.join(ROOT, 'src', 'data', 'plants.json'), 'w'), indent=1)
