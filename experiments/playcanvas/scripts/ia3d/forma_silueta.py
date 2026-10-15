# Forma 3D tallada desde las siluetas de la hoja de giro (frente, perfil y espalda), sin ningún
# modelo de terceros: un bloque de vóxeles del que se quita todo lo que cae fuera de alguna silueta
# (casco visual), cubos marchantes y un suavizado que conserva el volumen. Las vistas son las de la
# hoja de giro generada para el personaje, recortadas como en forma.py (*-front.png, *-left.png,
# *-back.png con alfa). No ve los huecos que ninguna silueta muestra (entre el brazo y el cuerpo de
# frente): es una base para comparar con las formas de los modelos.
# Uso: python forma_silueta.py carpeta-con-vistas salida.glb [resolución]
import sys, os, numpy as np, trimesh
from PIL import Image
from skimage import measure

folder, out = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 256
def mask(name):
    # Each view cropped to the figure from head to feet and set to the same height, centred: the
    # pictures of a turnaround are never exactly the same size, and a mismatch carves bands.
    im = Image.open(os.path.join(folder, f'forma-{name}.png')).convert('RGBA')
    a = np.asarray(im)[:, :, 3] > 127; rows, cols = np.where(a.any(1))[0], np.where(a.any(0))[0]
    crop = im.crop((0, rows[0], im.width, rows[-1] + 1)); h = int(N * .96); w = round(crop.width * h / crop.height)
    crop = crop.resize((w, h), Image.LANCZOS); canvas = Image.new('RGBA', (N, N)); cx = (cols[0] + cols[-1]) / 2 * h / (rows[-1] + 1 - rows[0])
    canvas.paste(crop, (int(N / 2 - cx), N - h - 2)); return np.asarray(canvas)[:, :, 3] > 127  # [row (down), col (right)]
front, left, back = mask('front'), mask('left'), mask('back')
# Grid: x to the character's left (image right in the front view), y backwards, z up.
idx = np.arange(N)
x, y, z = np.meshgrid(idx, idx, idx, indexing='ij')
row = N - 1 - z
inside = front[row, x]                     # front: column = x
inside &= back[row, N - 1 - x]             # back: seen from behind, mirrored
inside &= left[row, y]                     # side view (already mirrored to look from the left): column = depth
vol = np.pad(inside.astype(np.float32), 1)
v, f, _, _ = measure.marching_cubes(vol, .5)
v = (v - 1) / N
mesh = trimesh.Trimesh(v[:, [0, 1, 2]], f)
mesh = max(mesh.split(only_watertight=False), key=lambda m: len(m.faces))
trimesh.smoothing.filter_taubin(mesh, lamb=.5, nu=-.53, iterations=30)
# glTF is Y-up: z (up) becomes y; the front faces +Z like the other forms.
mesh.apply_transform(trimesh.transformations.rotation_matrix(-np.pi / 2, [1, 0, 0]))
print(f'silueta: {len(mesh.vertices)} vértices, {len(mesh.faces)} caras, estanca {mesh.is_watertight}')
mesh.export(out)
