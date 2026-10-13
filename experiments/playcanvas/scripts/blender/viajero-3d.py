# El viajero en 3D a partir de la forma de Hunyuan3D-2mv y de las vistas de la hoja de giro (ciclo 28).
# 1. Normaliza la malla: 2 m de alto, pies en el suelo, frente hacia −Y (glTF +Z), y la simplifica.
# 2. La desenvuelve (UV) y hornea la textura proyectando las tres vistas (frente, perfil espejado para
#    el lado derecho y sin espejar para el izquierdo, espalda): cada punto toma la vista que lo mira
#    más de frente, con un fundido suave entre vistas. La silueta de cada vista se ajusta a la caja de
#    la malla vista desde ese lado.
# 3. Arma un esqueleto simple (cadera, columna, cuello, cabeza, brazos, piernas) a partir de cortes de
#    la malla y le da pesos automáticos. El juego anima los huesos por nombre.
# 4. Hornea también una máscara: pelo (rojo) y piel (verde), para poder teñirlos en el juego más adelante.
# Uso: blender -b -P scripts/blender/viajero-3d.py -- forma.glb carpeta-de-vistas salida.glb [caras]
import bpy, bmesh, sys, math, os, json
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
src, views_dir, out = args[0], args[1], args[2]
target_faces = int(args[3]) if len(args) > 3 else 16000
FLIP = os.environ.get('FLIP') == '1'          # the shape's front faces +Y instead of −Y
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ── 1 · Import and normalise ────────────────────────────────────────────────────────────────
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in scene.objects if o.type == 'MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in meshes: o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1: bpy.ops.object.join()
body = bpy.context.view_layer.objects.active; body.name = 'viajero'
for o in list(scene.objects):
    if o is not body: bpy.data.objects.remove(o)
body.parent = None
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
if FLIP:
    body.rotation_euler = (0, 0, math.pi); bpy.ops.object.transform_apply(rotation=True)
def bounds():
    vs = [body.matrix_world @ v.co for v in body.data.vertices]
    return Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))), Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
lo, hi = bounds(); s = 2.0 / (hi.z - lo.z)
body.scale = (s, s, s); bpy.ops.object.transform_apply(scale=True)
lo, hi = bounds(); body.location = (-(lo.x + hi.x) / 2, -(lo.y + hi.y) / 2, -lo.z); bpy.ops.object.transform_apply(location=True)
# The master: the full-resolution shape, normalised, before anything is simplified. It is what the
# print kit and the colour regions start from (scripts/blender/regiones.py).
master_path = os.environ.get('MAESTRO') or out.replace('.glb', '-maestro.glb')
bpy.ops.object.select_all(action='DESELECT'); body.select_set(True)
bpy.ops.export_scene.gltf(filepath=master_path, export_format='GLB', export_yup=True, use_selection=True, export_materials='NONE')
print('maestro', master_path, len(body.data.polygons), 'caras')
# Simplify to a game budget.
dec = body.modifiers.new('simplificar', 'DECIMATE'); dec.ratio = min(1.0, target_faces / max(1, len(body.data.polygons)))
bpy.ops.object.modifier_apply(modifier=dec.name)
for p in body.data.polygons: p.use_smooth = True
lo, hi = bounds()
print('malla', len(body.data.polygons), 'caras · caja', tuple(round(v, 3) for v in lo), tuple(round(v, 3) for v in hi))

# ── 2 · UV and projected texture ────────────────────────────────────────────────────────────
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=.004)
bpy.ops.object.mode_set(mode='OBJECT')
# The face is what a close camera looks at (ciclo 29): the front of the head gets CARA_ESCALA times
# more texture on each side (2.2 by default), the rest of the head a little more, then all islands
# are packed again at the same size.
face_scale = float(os.environ.get('CARA_ESCALA', 2.2))
if face_scale != 1:
    head_z = .9 if os.environ.get('ROBOT') else json.loads(os.environ.get('ESQUELETO') or '{}').get('axila', 1.37) + .13
    bm_uv = bmesh.new(); bm_uv.from_mesh(body.data); uv_layer = bm_uv.loops.layers.uv.active
    for f in bm_uv.faces:
        if (body.matrix_world @ f.calc_center_median()).z > head_z:
            k = face_scale if f.normal.y < -.25 else face_scale ** .45
            for l in f.loops: l[uv_layer].uv *= k
    bm_uv.to_mesh(body.data); bm_uv.free()
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.pack_islands(rotate=True, margin=.004); bpy.ops.object.mode_set(mode='OBJECT')
    print('cara', face_scale, 'veces desde', round(head_z, 2))

# Which vertices each camera really sees: a ray from the vertex toward the camera that hits
# nothing else. Stored per view in a colour attribute the projection reads (a view never paints
# what was hidden in its picture: the coat behind a hand, the arm behind the scarf).
from mathutils.bvhtree import BVHTree
bm_vis = bmesh.new(); bm_vis.from_mesh(body.data); bm_vis.verts.ensure_lookup_table()
tree = BVHTree.FromBMesh(bm_vis)
def visibility(name, toward):
    attr = body.data.color_attributes.new(f'vis-{name}', 'FLOAT_COLOR', 'POINT')
    for i, v in enumerate(bm_vis.verts):
        start = v.co + v.normal * .004 + toward * .002
        hit = tree.ray_cast(start, toward, 10.0)
        seen = 1.0 if hit[0] is None else 0.0
        attr.data[i].color = (seen, seen, seen, 1)
    return attr.name

def alpha_box(img):
    w, h = img.size; px = img.pixels[:]
    xs, ys = [], []
    for y in range(0, h, 2):
        row = (y * w) * 4
        for x in range(0, w, 2):
            if px[row + x * 4 + 3] > .5: xs.append(x); ys.append(y)
    return min(xs) / w, max(xs) / w, min(ys) / h, max(ys) / h   # Blender images: y up

# Views: (file, horizontal axis in the image's left→right, depth axis toward the camera, mirror)
# Front looks from −Y (character faces the camera): image x = +X? The character's right is screen
# left, i.e. −X in Blender when facing −Y … so image left→right runs along −X? No: seen from −Y
# looking toward +Y, screen right is +X. Back looks from +Y: screen right is −X.
VIEWS = [
    ('front', Vector((1, 0, 0)), Vector((0, -1, 0))),
    ('back', Vector((-1, 0, 0)), Vector((0, 1, 0))),
    ('left', Vector((0, 1, 0)), Vector((1, 0, 0))),     # the 'left' file faces screen left: seen from +X
    ('leftm', Vector((0, -1, 0)), Vector((-1, 0, 0))),  # the same picture mirrored, for the other side
]
mat = bpy.data.materials.new('viajero'); mat.use_nodes = True; nt = mat.node_tree; nt.nodes.clear()
outn = nt.nodes.new('ShaderNodeOutputMaterial'); emit = nt.nodes.new('ShaderNodeEmission'); nt.links.new(emit.outputs[0], outn.inputs['Surface'])
coord = nt.nodes.new('ShaderNodeNewGeometry')
acc_col, acc_w = None, None
def math_node(op, a, b=None, value=None):
    n = nt.nodes.new('ShaderNodeMath'); n.operation = op
    if isinstance(a, float): n.inputs[0].default_value = a
    else: nt.links.new(a, n.inputs[0])
    if b is not None:
        if isinstance(b, float): n.inputs[1].default_value = b
        else: nt.links.new(b, n.inputs[1])
    return n.outputs[0]
def vec_math(op, a, b):
    n = nt.nodes.new('ShaderNodeVectorMath'); n.operation = op
    nt.links.new(a, n.inputs[0]) if not isinstance(a, Vector) else setattr(n.inputs[0], 'default_value', a)
    nt.links.new(b, n.inputs[1]) if not isinstance(b, Vector) else setattr(n.inputs[1], 'default_value', b)
    return n.outputs['Value'] if op == 'DOT_PRODUCT' else n.outputs[0]
for name, right, toward in VIEWS:
    file = 'left' if name == 'leftm' else name
    img = bpy.data.images.load(os.path.join(views_dir, f'forma-{file}.png'))
    x0, x1, y0, y1 = alpha_box(img)
    # The mesh's extent along this view's screen axes.
    vs = [v.co for v in body.data.vertices]
    hs = [v.dot(right) for v in vs]; zs = [v.z for v in vs]
    h0, h1, z0, z1 = min(hs), max(hs), min(zs), max(zs)
    if name == 'leftm': x0, x1 = 1 - x1, 1 - x0
    # u = x0 + (h - h0)/(h1 - h0) * (x1 - x0); v = y0 + (z - z0)/(z1 - z0) * (y1 - y0)
    hpos = vec_math('DOT_PRODUCT', coord.outputs['Position'], right)
    u = math_node('ADD', math_node('MULTIPLY', math_node('SUBTRACT', hpos, h0), (x1 - x0) / (h1 - h0)), x0)
    zpos = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(coord.outputs['Position'], zpos.inputs[0])
    v = math_node('ADD', math_node('MULTIPLY', math_node('SUBTRACT', zpos.outputs['Z'], z0), (y1 - y0) / (z1 - z0)), y0)
    if name == 'leftm': u = math_node('SUBTRACT', 1.0, u)
    uv = nt.nodes.new('ShaderNodeCombineXYZ'); nt.links.new(u, uv.inputs[0]); nt.links.new(v, uv.inputs[1])
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; tex.extension = 'EXTEND'; nt.links.new(uv.outputs[0], tex.inputs['Vector'])
    facing = vec_math('DOT_PRODUCT', coord.outputs['Normal'], toward)
    vis = nt.nodes.new('ShaderNodeVertexColor'); vis.layer_name = visibility(name, toward)
    # A small floor: surfaces facing up or down (the top of the head, the soles) blend all the views.
    w = math_node('POWER', math_node('ADD', math_node('MAXIMUM', facing, 0.0), .06), 4.0)
    w = math_node('MULTIPLY', math_node('MULTIPLY', w, tex.outputs['Alpha']), math_node('ADD', math_node('MULTIPLY', vis.outputs['Color'], .97), .03))
    col = nt.nodes.new('ShaderNodeMixRGB'); col.blend_type = 'MULTIPLY'; col.inputs[0].default_value = 1
    nt.links.new(tex.outputs['Color'], col.inputs[1]); wc = nt.nodes.new('ShaderNodeCombineXYZ')
    for i in range(3): nt.links.new(w, wc.inputs[i])
    nt.links.new(wc.outputs[0], col.inputs[2])
    acc_col = col.outputs[0] if acc_col is None else vec_math('ADD', acc_col, col.outputs[0])
    acc_w = w if acc_w is None else math_node('ADD', acc_w, w)
den = nt.nodes.new('ShaderNodeCombineXYZ'); wsafe = math_node('MAXIMUM', acc_w, 1e-4)
for i in range(3): nt.links.new(wsafe, den.inputs[i])
final = vec_math('DIVIDE', acc_col, den.outputs[0])
# A touch more saturation than the pictures: lit in the game, painted colours lose some.
hsv = nt.nodes.new('ShaderNodeHueSaturation'); hsv.inputs['Saturation'].default_value = 1.18
nt.links.new(final, hsv.inputs['Color']); nt.links.new(hsv.outputs[0], emit.inputs['Color'])
body.data.materials.clear(); body.data.materials.append(mat)
size = int(os.environ.get('TEX', 1024))
bake = bpy.data.images.new('viajero-color', size, size); texn = nt.nodes.new('ShaderNodeTexImage'); texn.image = bake; nt.nodes.active = texn
scene.render.engine = 'CYCLES'; scene.cycles.samples = 1; scene.cycles.device = 'CPU'
bpy.context.view_layer.objects.active = body; body.select_set(True)
bpy.ops.object.bake(type='EMIT', margin=8)
color_path = out.replace('.glb', '-color.png'); bake.filepath_raw = color_path; bake.file_format = 'PNG'; bake.save()
print('textura', color_path)

# The region map (scripts/blender/regiones.py): each game face takes the region of the nearest master
# face; the map is baked flat, one value per region (R = (index + .5) / 16), for tinting in the game.
regions_npy = os.environ.get('REGIONES')
if regions_npy:
    import numpy as np
    from mathutils.bvhtree import BVHTree
    labels = np.load(regions_npy)
    bpy.ops.import_scene.gltf(filepath=master_path)
    master = [o for o in scene.objects if o.type == 'MESH' and o is not body][0]
    bm_m = bmesh.new(); bm_m.from_mesh(master.data); bm_m.transform(master.matrix_world); bm_m.faces.ensure_lookup_table()
    mtree = BVHTree.FromBMesh(bm_m)
    attr = body.data.color_attributes.new('region', 'FLOAT_COLOR', 'CORNER')
    for p in body.data.polygons:
        hit = mtree.find_nearest(body.matrix_world @ p.center)
        value = (labels[hit[2]] + .5) / 16 if hit[2] is not None else 0
        for li in range(p.loop_start, p.loop_start + p.loop_total): attr.data[li].color = (value, value, value, 1)
    bpy.data.objects.remove(master)
    nt.nodes.clear(); o2 = nt.nodes.new('ShaderNodeOutputMaterial'); e2 = nt.nodes.new('ShaderNodeEmission'); vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'region'
    nt.links.new(vc.outputs[0], e2.inputs[0]); nt.links.new(e2.outputs[0], o2.inputs[0])
    region_img = bpy.data.images.new('viajero-regiones', size, size, float_buffer=False); region_img.colorspace_settings.name = 'Non-Color'
    rt = nt.nodes.new('ShaderNodeTexImage'); rt.image = region_img; nt.nodes.active = rt
    body.data.materials.clear(); body.data.materials.append(mat)
    bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); bpy.context.view_layer.objects.active = body
    scene.render.bake.use_pass_direct = False
    bpy.ops.object.bake(type='EMIT', margin=8, margin_type='EXTEND')
    region_path = out.replace('.glb', '-regiones.png'); region_img.filepath_raw = region_path; region_img.file_format = 'PNG'; region_img.save()
    print('regiones', region_path)

# The game material: the baked colour, nothing else.
game = bpy.data.materials.new('viajero-juego'); game.use_nodes = True; g = game.node_tree
bsdf = g.nodes['Principled BSDF']; t = g.nodes.new('ShaderNodeTexImage'); t.image = bake; g.links.new(t.outputs['Color'], bsdf.inputs['Base Color'])
bsdf.inputs['Roughness'].default_value = 1.0
body.data.materials.clear(); body.data.materials.append(game)

# ── 3 · Skeleton from slices of the mesh ───────────────────────────────────────────────────
vs = [v.co.copy() for v in body.data.vertices]
def slab(z, dz=.03): return [v for v in vs if abs(v.z - z) < dz]
H = 2.0
# Joints. ESQUELETO (JSON) overrides any of them: {"axila": z, "entrepierna": z, "rodilla": z}.
override = json.loads(os.environ.get('ESQUELETO') or '{}')
def pieces(z, band=.025, gap=.035, ylim=None):
    xs = sorted(v.x for v in vs if abs(v.z - z) < band and (ylim is None or abs(v.y) < ylim))
    if not xs: return []
    out = [[xs[0], xs[0]]]
    for x in xs[1:]:
        if x - out[-1][1] > gap: out.append([x, x])
        else: out[-1][1] = x
    return out
# The traveller's proportions (≈ 5 heads, checked by eye); stout or tall people override them from
# their personajes/<name>.json ("esqueleto"). Hands and legs are measured on the mesh.
armpit = override.get('axila', 1.37)
crotch = override.get('entrepierna', .92)
hands = [v for v in vs if abs(v.x) > max(abs(w.x) for w in vs) - .08]
hand_z = sum(v.z for v in hands) / len(hands)
shoulder = armpit + .07; neck = shoulder + .06; head = neck + .08; hip = crotch + .06
knee = override.get('rodilla', crotch * .55)
sx0, sx1 = min(v.x for v in vs), max(v.x for v in vs)
print(f'articulaciones: axila {armpit:.2f} hombro {shoulder:.2f} cuello {neck:.2f} entrepierna {crotch:.2f} rodilla {knee:.2f} manos {hand_z:.2f}')
arm = bpy.data.armatures.new('esqueleto'); rig = bpy.data.objects.new('esqueleto', arm); scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='EDIT')
def bone(name, head, tail, parent=None):
    b = arm.edit_bones.new(name); b.head = head; b.tail = tail
    if parent: b.parent = arm.edit_bones[parent]; b.use_connect = False
    return b
bone('cadera', (0, 0, hip), (0, 0, hip + .14))
bone('cuerpo', (0, 0, hip + .14), (0, 0, neck), 'cadera')
bone('cuello', (0, 0, neck), (0, 0, head), 'cuerpo')
bone('cabeza', (0, 0, head), (0, 0, 2.0), 'cuello')
torso = pieces(armpit + .02)
half = (torso[0][1] - torso[0][0]) / 2 if len(torso) == 1 else .2
for side, sgn in (('izq', 1), ('der', -1)):
    # The character's left is +X when it faces −Y.
    sh = Vector((sgn * min(half * .85, .3), 0, shoulder)); hand = Vector((sgn * ((sx1 if sgn > 0 else -sx0) - .05), 0, hand_z))
    elbow = sh.lerp(hand, .5)
    bone(f'brazo-{side}', sh, elbow, 'cuerpo'); bone(f'antebrazo-{side}', elbow, hand, f'brazo-{side}')
    legs = pieces(max(.3, knee), ylim=.25); lx = sum(p[0] + p[1] for p in legs if (p[0] + p[1]) * sgn > 0) / 2 / max(1, len([p for p in legs if (p[0] + p[1]) * sgn > 0])) if len(legs) >= 2 else sgn * .11
    bone(f'pierna-{side}', (lx, 0, crotch - .02), (lx, 0, knee), 'cadera'); bone(f'canilla-{side}', (lx, 0, knee), (lx, -.02, .08), f'pierna-{side}')
if os.environ.get('ROBOT'):
    # Ohm: a body and two feet. The feet are what lies below FEET (metres), split left and right.
    for b in list(arm.edit_bones): arm.edit_bones.remove(b)
    feet_top = float(os.environ.get('PIES', .32))
    bone('cadera', (0, 0, feet_top), (0, 0, feet_top + .3))
    bone('cuerpo', (0, 0, feet_top + .3), (0, 0, 2.0), 'cadera')
    for side, sgn in (('izq', 1), ('der', -1)): bone(f'pie-{side}', (sgn * .35, 0, feet_top), (sgn * .35, -.05, 0), 'cadera')
    bpy.ops.object.mode_set(mode='OBJECT')
    groups = {n: body.vertex_groups.new(name=n) for n in ('cuerpo', 'pie-izq', 'pie-der')}
    for v in body.data.vertices:
        if v.co.z < feet_top - .02: groups['pie-izq' if v.co.x > 0 else 'pie-der'].add([v.index], 1.0, 'REPLACE')
        elif v.co.z < feet_top + .06:
            k = (v.co.z - feet_top + .02) / .08; groups['cuerpo'].add([v.index], k, 'REPLACE'); groups['pie-izq' if v.co.x > 0 else 'pie-der'].add([v.index], 1 - k, 'REPLACE')
        else: groups['cuerpo'].add([v.index], 1.0, 'REPLACE')
    mod = body.modifiers.new('esqueleto', 'ARMATURE'); mod.object = rig; body.parent = rig
    print('esqueleto de robot, pies hasta', feet_top)
    for a in list(body.data.color_attributes): body.data.color_attributes.remove(a)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True, export_skins=True, export_animations=False, use_selection=True)
    print('exportado', out); sys.exit(0)
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); rig.select_set(True); bpy.context.view_layer.objects.active = rig
try:
    bpy.ops.object.parent_set(type='ARMATURE_AUTO'); print('pesos automáticos')
except Exception as e:
    print('pesos automáticos fallaron:', e); bpy.ops.object.parent_set(type='ARMATURE_ENVELOPE')
empty_groups = [g.name for g in body.vertex_groups if not any(g.index in [x.group for x in v.groups] for v in body.data.vertices)]
print('grupos sin vértices', empty_groups)

# The working colour layers (what each camera saw, the regions) stay out of the game file: six
# of them weighed three times the texture.
for a in list(body.data.color_attributes): body.data.color_attributes.remove(a)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True, export_skins=True, export_animations=False, use_selection=True)
print('exportado', out)
