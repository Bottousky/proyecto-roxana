# Hornea oclusión ambiental con Cycles sobre la geometría exportada de Ohmdal.
#  - Vértices: multiplica los colores de geometry.bin.gz (el material los usa como multiplicador).
#  - Suelo: un mapa en gris en coordenadas de reino, con el mismo rectángulo que shore.json.
# El Taller comparte el origen con la Plaza: se hornea aparte, con el exterior oculto.
# Uso: blender -b --factory-startup --python scripts/blender/bake-ao.py
import bpy, json, gzip, zlib, struct, os, sys, numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA = os.path.join(ROOT, 'src', 'data')
scene_path, geo_path = os.path.join(DATA, 'scene.json'), os.path.join(DATA, 'geometry.bin.gz')
shore = json.load(open(os.path.join(DATA, 'shore.json')))
scene_json = json.load(open(scene_path, encoding='utf8'))
if scene_json.get('ao'):
    print('La oclusión ya está horneada: volvé a exportar el mundo antes de hornear de nuevo.'); sys.exit(0)
raw = bytearray(gzip.decompress(open(geo_path, 'rb').read()))

def view(mesh, key):
    dtype = np.uint32 if key == 'indices' else np.float32
    return np.frombuffer(raw, dtype=dtype, count=mesh[key]['length'], offset=mesh[key]['offset'])

VERTEX_DISTANCE, GROUND_DISTANCE, SAMPLES = 1.4, 2.4, int(os.environ.get('AO_SAMPLES', '48'))
PX = 4  # píxeles por metro del mapa de suelo (como el de la orilla)

sc = bpy.context.scene
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
sc.render.engine = 'CYCLES'
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for kind in ('OPTIX', 'CUDA'):
        try:
            prefs.compute_device_type = kind; prefs.get_devices()
            if any(d.type == kind for d in prefs.devices):
                for d in prefs.devices: d.use = d.type == kind
                sc.cycles.device = 'GPU'; print('Cycles en GPU', kind); break
        except Exception: pass
except Exception as e: print('CPU', e)
sc.cycles.samples = SAMPLES
if sc.world is None: sc.world = bpy.data.worlds.new('Mundo')
sc.world.light_settings.distance = VERTEX_DISTANCE

plain = bpy.data.materials.new('Horneado')

def occluder(mesh):
    d = mesh['material']
    return not (d.get('paving') or d.get('texture') == 'water' or d.get('alpha', 0) > 0 or d.get('opacity', 1) < 1 or d.get('unlit') or d.get('glass'))

objects = []
for i, m in enumerate(scene_json['meshes']):
    if not occluder(m): continue
    p = view(m, 'positions').reshape(-1, 3).astype(np.float64)
    if m.get('dynamic'): p = p + np.array(m['dynamic']['pivot'])
    idx = view(m, 'indices').reshape(-1, 3).copy()
    # Algunas piezas vienen con el orden de vértices invertido (el motor las dibuja de ambos
    # lados): se orienta cada cara según las normales exportadas, o Cycles hornea hacia abajo.
    n = view(m, 'normals').reshape(-1, 3)
    a, b, c = p[idx[:, 0]], p[idx[:, 1]], p[idx[:, 2]]
    back = np.einsum('ij,ij->i', np.cross(b - a, c - a), n[idx].sum(1)) < 0
    idx[back] = idx[back][:, ::-1]
    me = bpy.data.meshes.new(f'm{i}')
    # PlayCanvas es Y arriba; Blender es Z arriba: (x, y, z) -> (x, -z, y).
    verts = np.stack([p[:, 0], -p[:, 2], p[:, 1]], 1)
    me.vertices.add(len(verts)); me.vertices.foreach_set('co', verts.ravel().astype(np.float32))
    me.loops.add(idx.size); me.loops.foreach_set('vertex_index', idx.ravel().astype(np.int32))
    me.polygons.add(len(idx)); me.polygons.foreach_set('loop_start', np.arange(0, idx.size, 3, dtype=np.int32))
    me.update(calc_edges=True)
    me.materials.append(plain)
    ob = bpy.data.objects.new(f'm{i}', me); sc.collection.objects.link(ob)
    objects.append((i, m, ob))
print('objetos', len(objects))

def isolate(inside):
    for i, m, ob in objects:
        hide = (m['area'] == 'workshop') != inside
        ob.hide_render = hide; ob.hide_set(hide)

def bake_vertices(targets):
    bpy.ops.object.select_all(action='DESELECT')
    for i, m, ob in targets:
        me = ob.data
        for a in list(me.color_attributes): me.color_attributes.remove(a)
        me.color_attributes.new('ao', 'FLOAT_COLOR', 'POINT')
        me.color_attributes.active_color = me.color_attributes['ao']
        ob.select_set(True)
    bpy.context.view_layer.objects.active = targets[0][2]
    sc.world.light_settings.distance = VERTEX_DISTANCE
    bpy.ops.object.bake(type='AO', target='VERTEX_COLORS')
    for i, m, ob in targets:
        col = np.empty(len(ob.data.vertices) * 4, np.float32); ob.data.color_attributes['ao'].data.foreach_get('color', col)
        ao = col.reshape(-1, 4)[:, 0]
        colors = view(m, 'colors').reshape(-1, 4)
        # Nunca negro: la oclusión oscurece hasta un 58 %, con una curva suave.
        k = 1 - .58 * (1 - np.clip(ao, 0, 1)) ** 1.25
        np.copyto(colors[:, :3], colors[:, :3] * k[:, None])

for inside in (False, True):
    isolate(inside)
    targets = [t for t in objects if (t[1]['area'] == 'workshop') == inside and t[1]['material'].get('texture') != 'ground']
    print('horneando vértices', 'Taller' if inside else 'exterior', len(targets))
    bake_vertices(targets)

# Suelo: todas las superficies de pasto exteriores, con UV en coordenadas de reino.
isolate(False)
grounds = [t for t in objects if t[1]['material'].get('texture') == 'ground' and t[1]['area'] != 'workshop']
W, H = shore['pixels']
img = bpy.data.images.new('suelo', W, H, float_buffer=True, alpha=True)
img.pixels.foreach_set(np.tile(np.array([1, 1, 1, 0], np.float32), W * H))
bake_mat = bpy.data.materials.new('SueloAO')
node = bake_mat.node_tree.nodes.new('ShaderNodeTexImage'); node.image = img
bake_mat.node_tree.nodes.active = node
import bmesh
for i, m, ob in grounds:
    me = ob.data
    # Los suelos son losas: solo la cara de arriba entra en el mapa, o la de abajo la pisa.
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.normal.z < .5], context='FACES'); bm.to_mesh(me); bm.free()
    uv = me.uv_layers.new(name='reino'); me.uv_layers.active = uv
    co = np.empty(len(me.vertices) * 3, np.float32); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    vi = np.empty(len(me.loops), np.int32); me.loops.foreach_get('vertex_index', vi)
    x, z = co[vi, 0], -co[vi, 1]
    uvs = np.stack([(x - shore['x0']) / shore['width'], (z - shore['z0']) / shore['depth']], 1).astype(np.float32)
    uv.data.foreach_set('uv', uvs.ravel())
    me.materials.clear(); me.materials.append(bake_mat)
sc.world.light_settings.distance = GROUND_DISTANCE
sc.render.bake.margin = 4
sc.render.bake.use_clear = False
# Los suelos de cada lugar y el del reino se superponen en el mismo plano: cada uno se hornea
# con los demás ocultos, o se ocluirían entre sí.
# Pasto, flores y bordillos no ensombrecen el suelo a esta escala: solo lo que se alza.
for i, m, ob in objects:
    if max(v[2] for v in ob.bound_box) < .9 and m['material'].get('texture') != 'ground': ob.hide_render = True; ob.hide_set(True)
for i, m, ob in grounds:
    for j, n, other in grounds: other.hide_render = other is not ob; other.hide_set(other is not ob)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.object.bake(type='AO', target='IMAGE_TEXTURES')
pix = np.array(img.pixels[:], np.float32).reshape(H, W, 4)[:, :, 0]  # fila 0 = v 0 = z0 (norte)
covered = np.array(img.pixels[:], np.float32).reshape(H, W, 4)[:, :, 3] > 0
ao = np.where(covered, np.clip(pix, 0, 1), 1.0)
gray = np.round(ao * 255).astype(np.uint8)
rows = b''.join(b'\x00' + gray[r].tobytes() for r in range(H))
def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 0, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(rows, 9)) + chunk(b'IEND', b'')
open(os.path.join(ROOT, 'public', 'assets', 'ground-ao.png'), 'wb').write(png)

open(geo_path, 'wb').write(gzip.compress(bytes(raw), 9))
scene_json['ao'] = {'vertex': VERTEX_DISTANCE, 'ground': GROUND_DISTANCE, 'samples': SAMPLES}
json.dump(scene_json, open(scene_path, 'w', encoding='utf8'), separators=(',', ':'), ensure_ascii=False)
print('oclusión horneada', W, H)
