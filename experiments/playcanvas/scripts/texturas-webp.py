# Las texturas del estilo X e Y en WebP (2026-10-19, rendimiento): 11,3 MB de PNG pasan a ~2,3 MB.
# Las pintadas, con pérdida (calidad 88; 95 para plantas, árboles, musgo, pasto y la hoja del dibujo,
# donde 88 bajaba de 38 dB de PSNR); los mapas de regiones de los personajes, SIN pérdida: cada valor
# es el número de una región y no puede cambiar. Reemplaza cada PNG por su WebP en el mismo lugar.
# Los generadores (scripts/xy-textures.mjs, xy-plants.mjs, xy-sprite-sheet.mjs, ia3d/personaje.sh)
# escriben PNG: después de correrlos, correr este script (personaje.sh ya lo hace).
# Uso (Python con Pillow, p. ej. el venv de TripoSG): python -I scripts/texturas-webp.py [archivo.png …]
import sys, os, glob, io
from PIL import Image

HIGH = ('plants-', 'trees', 'moss', 'meadow', 'player-dibujo')
files = sys.argv[1:] or sorted(glob.glob(os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'xy', '*.png')))
for f in files:
    im = Image.open(f); name = os.path.basename(f); out = f[:-4] + '.webp'
    if 'regiones' in name:
        im.save(out, 'WEBP', lossless=True, quality=100, method=6)
        back = Image.open(out).convert(im.mode)
        assert back.tobytes() == im.tobytes(), f'{name}: el mapa de regiones cambió'
    else:
        im.save(out, 'WEBP', quality=95 if name.startswith(HIGH) else 88, method=6)
    print(f'{name}: {os.path.getsize(f) / 1024:.0f} kB -> {os.path.getsize(out) / 1024:.0f} kB')
    os.remove(f)
