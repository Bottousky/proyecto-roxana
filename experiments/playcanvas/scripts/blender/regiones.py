# Regiones de color de un personaje (ciclo 28): piel, pelo, ropa, accesorios. Las usan el teñido en el
# juego (máscara de regiones) y el kit de impresión (una pieza por región).
# 1. Le da a cada cara del maestro el color de las vistas de referencia (frente, perfil, espalda),
#    desde la vista que la mira más de frente y sin taparla (un rayo hacia cada cámara).
# 2. explorar: agrupa esos colores (k-medias) y escribe un informe con cada grupo, su color, su parte
#    del total y su altura, más una vista previa coloreada por grupo, para escribir la configuración.
#    asignar: lee la configuración del personaje (cada región: colores de muestra y, si hace falta, una
#    franja de alturas) y le pone a cada cara la región del color más parecido entre las permitidas.
#    Limpia islas sueltas (una cara rodeada de otra región la toma) y guarda el maestro con dos
#    atributos por cara: 'region' (número) y el color de la región.
# Uso: blender -b -P scripts/blender/regiones.py -- maestro.glb carpeta-vistas explorar salida-base
#      blender -b -P scripts/blender/regiones.py -- maestro.glb carpeta-vistas asignar salida-base regiones.json
import bpy, bmesh, sys, os, json, math
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

args = sys.argv[sys.argv.index('--') + 1:]
src, views_dir, mode, base = args[:4]
config = json.load(open(args[4])) if mode == 'asignar' else None
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
body = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = body
mesh = body.data
N = len(mesh.polygons)
C = np.zeros(N * 3); mesh.polygons.foreach_get('center', C); C = C.reshape(N, 3)
F = np.zeros(N * 3); mesh.polygons.foreach_get('normal', F); F = F.reshape(N, 3)
M = np.array(body.matrix_world)[:3, :3]; C = C @ M.T + np.array(body.matrix_world)[:3, 3]; F = F @ M.T
print('caras', N)

# ── 1 · Colour per face from the views ──────────────────────────────────────────────────────
VIEWS = [('front', (1, 0, 0), (0, -1, 0), False), ('back', (-1, 0, 0), (0, 1, 0), False),
         ('left', (0, 1, 0), (1, 0, 0), False), ('left', (0, -1, 0), (-1, 0, 0), True)]
bm = bmesh.new(); bm.from_mesh(mesh); bm.transform(body.matrix_world); tree = BVHTree.FromBMesh(bm)
acc = np.zeros((N, 3)); wsum = np.zeros(N)
for file, right, toward, mirror in VIEWS:
    img = bpy.data.images.load(os.path.join(views_dir, f'forma-{file}.png'))
    W, H = img.size; px = np.array(img.pixels[:]).reshape(H, W, 4)
    if mirror: px = px[:, ::-1]
    ys, xs = np.nonzero(px[:, :, 3] > .5); x0, x1, y0, y1 = xs.min() / W, xs.max() / W, ys.min() / H, ys.max() / H
    right, toward = np.array(right, float), np.array(toward, float)
    h = C @ right; z = C[:, 2]
    # The mesh's silhouette extent from this side, from the vertices (not the face centres).
    V = np.zeros(len(mesh.vertices) * 3); mesh.vertices.foreach_get('co', V); V = V.reshape(-1, 3) @ M.T
    hv = V @ right; h0, h1, z0, z1 = hv.min(), hv.max(), V[:, 2].min(), V[:, 2].max()
    u = x0 + (h - h0) / (h1 - h0) * (x1 - x0); v = y0 + (z - z0) / (z1 - z0) * (y1 - y0)
    ui = np.clip((u * W).astype(int), 0, W - 1); vi = np.clip((v * H).astype(int), 0, H - 1)
    sample = px[vi, ui]
    facing = np.maximum(F @ toward, 0)
    seen = np.ones(N)
    t = Vector(toward.tolist())
    for i in np.nonzero(facing > .02)[0]:
        start = Vector(C[i].tolist()) + Vector(F[i].tolist()) * .003 + t * .002
        if tree.ray_cast(start, t, 10.0)[0] is not None: seen[i] = 0
    seen[facing <= .02] = 0
    w = (facing + .06) ** 4 * sample[:, 3] * (.03 + .97 * seen)
    acc += sample[:, :3] * w[:, None]; wsum += w
    print('vista', file, 'espejada' if mirror else '', f'{int(seen.sum())} caras a la vista')
colour = acc / np.maximum(wsum, 1e-6)[:, None]
# Faces no view could see (deep folds): the colour of their nearest neighbours that have one.
blind = wsum < 1e-4
print('caras sin vista', int(blind.sum()))

def to_lab(rgb):
    # sRGB (0..1, already encoded) → CIE Lab, enough to compare colours as the eye does.
    c = np.where(rgb > .04045, ((rgb + .055) / 1.055) ** 2.4, rgb / 12.92)
    X = c @ np.array([.4124, .3576, .1805]); Y = c @ np.array([.2126, .7152, .0722]); Z = c @ np.array([.0193, .1192, .9505])
    f = lambda t: np.where(t > .008856, np.cbrt(t), 7.787 * t + 16 / 116)
    fx, fy, fz = f(X / .9505), f(Y), f(Z / 1.089)
    return np.stack([116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)], 1)
lab = to_lab(np.clip(colour, 0, 1))
area = np.zeros(N); mesh.polygons.foreach_get('area', area)

def paint(labels, palette, name):
    attr = mesh.color_attributes.new(name, 'BYTE_COLOR', 'CORNER')
    loops = np.zeros(len(mesh.loops), int);
    for p in mesh.polygons: loops[p.loop_start:p.loop_start + p.loop_total] = p.index
    cols = np.concatenate([palette[labels[loops]], np.ones((len(loops), 1))], 1).ravel()
    attr.data.foreach_set('color', cols); return attr

def render(path):
    # A quick look from the front and the back, flat colours, no lighting.
    sc = bpy.context.scene; mat = bpy.data.materials.new('vista'); mat.use_nodes = True; nt = mat.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission'); a = nt.nodes.new('ShaderNodeVertexColor'); a.layer_name = mesh.color_attributes[-1].name
    nt.links.new(a.outputs[0], e.inputs[0]); nt.links.new(e.outputs[0], o.inputs[0]); mesh.materials.clear(); mesh.materials.append(mat)
    cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = 2.3; co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co
    sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'FLAT'; sc.display.shading.color_type = 'VERTEX'
    sc.render.resolution_x, sc.render.resolution_y = 600, 1100
    for k, (loc, rot) in enumerate([((0, -5, 1), (math.pi / 2, 0, 0)), ((0, 5, 1), (math.pi / 2, 0, math.pi)), ((5, 0, 1), (math.pi / 2, 0, math.pi / 2))]):
        co.location = loc; co.rotation_euler = rot; sc.render.filepath = path.replace('.png', f'-{k}.png'); bpy.ops.render.render(write_still=True)

if mode == 'explorar':
    rng = np.random.default_rng(1); K = int(os.environ.get('K', 14))
    pick = rng.choice(np.nonzero(~blind)[0], min(40000, int((~blind).sum())), replace=False)
    centres = lab[pick[rng.choice(len(pick), K, replace=False)]]
    for _ in range(40):
        d = ((lab[pick, None, :] - centres[None]) ** 2).sum(2); lbl = d.argmin(1)
        centres = np.array([lab[pick][lbl == k].mean(0) if (lbl == k).any() else centres[k] for k in range(K)])
    labels = ((lab[:, None, :] - centres[None]) ** 2).sum(2).argmin(1)
    report = []
    for k in range(K):
        m = labels == k; share = area[m].sum() / area.sum()
        rgb = (colour[m] * area[m, None]).sum(0) / max(area[m].sum(), 1e-9)
        zs = C[m, 2]
        report.append({'grupo': k, 'color': '#%02x%02x%02x' % tuple(int(255 * min(1, max(0, c))) for c in rgb), 'parte': round(float(share), 4),
                       'z10': round(float(np.percentile(zs, 10)), 3) if m.any() else None, 'z50': round(float(np.percentile(zs, 50)), 3) if m.any() else None, 'z90': round(float(np.percentile(zs, 90)), 3) if m.any() else None})
    report.sort(key=lambda r: -r['parte'])
    json.dump(report, open(base + '-grupos.json', 'w'), indent=1)
    for r in report: print(r)
    pal = np.array([[int(r['color'][i:i + 2], 16) / 255 for i in (1, 3, 5)] for r in sorted(report, key=lambda r: r['grupo'])])
    paint(labels, pal, 'grupos'); render(base + '-grupos.png')
else:
    regions = config['regiones']; names = [r['nombre'] for r in regions]
    cost = np.full((N, len(regions)), np.inf)
    for j, r in enumerate(regions):
        protos = to_lab(np.array([[int(c[i:i + 2], 16) / 255 for i in (1, 3, 5)] for c in r['colores']]))
        d = ((lab[:, None, :] - protos[None]) ** 2).sum(2).min(1)
        allowed = np.ones(N, bool)
        if 'z' in r: allowed &= (C[:, 2] >= r['z'][0]) & (C[:, 2] <= r['z'][1])
        cost[allowed, j] = d[allowed]
    labels = cost.argmin(1)
    # Boxes that settle a region by shape, not colour (the hands below the cuffs are skin, whatever
    # the pictures painted on their fingertips): 'forzar' = {absx, y, z} ranges, any of them optional.
    for j, r in enumerate(regions):
        for box in r.get('forzar', []):
            m = np.ones(N, bool)
            if 'absx' in box: m &= (np.abs(C[:, 0]) >= box['absx'][0]) & (np.abs(C[:, 0]) <= box['absx'][1])
            if 'y' in box: m &= (C[:, 1] >= box['y'][0]) & (C[:, 1] <= box['y'][1])
            if 'z' in box: m &= (C[:, 2] >= box['z'][0]) & (C[:, 2] <= box['z'][1])
            labels[m] = j
    # Unseen faces and lone specks take the region most of their neighbours have (a few passes).
    adj = [[] for _ in range(N)]
    edge_faces = {}
    for p in mesh.polygons:
        for k in p.edge_keys: edge_faces.setdefault(k, []).append(p.index)
    for fs in edge_faces.values():
        for a in fs:
            for b in fs:
                if a != b: adj[a].append(b)
    for _ in range(int(config.get('suavizado', 3))):
        new = labels.copy()
        for i in range(N):
            if not adj[i]: continue
            votes = np.bincount(labels[adj[i]], minlength=len(regions))
            # Unseen faces, lone specks and thin slivers (fewer than two neighbours alike) follow the majority.
            if blind[i] or votes[labels[i]] < 2: new[i] = votes.argmax()
        labels = new
    pal = np.array([[int(r['muestra'][i:i + 2], 16) / 255 for i in (1, 3, 5)] for r in regions])
    paint(labels, pal, 'region-color')
    attr = mesh.attributes.new('region', 'INT', 'FACE'); attr.data.foreach_set('value', labels.astype(int))
    for j, n in enumerate(names): print(n, round(float(area[labels == j].sum() / area.sum()), 4))
    render(base + '-regiones.png')
    bpy.ops.wm.save_as_mainfile(filepath=base + '-regiones.blend')
    np.save(base + '-regiones.npy', labels)
    json.dump({'regiones': names, 'caras': int(N)}, open(base + '-regiones.json', 'w'))
print('listo')
