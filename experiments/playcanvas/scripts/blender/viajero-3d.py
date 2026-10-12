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
import bpy, bmesh, sys, math, os
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

# The game material: the baked colour, nothing else.
game = bpy.data.materials.new('viajero-juego'); game.use_nodes = True; g = game.node_tree
bsdf = g.nodes['Principled BSDF']; t = g.nodes.new('ShaderNodeTexImage'); t.image = bake; g.links.new(t.outputs['Color'], bsdf.inputs['Base Color'])
bsdf.inputs['Roughness'].default_value = 1.0
body.data.materials.clear(); body.data.materials.append(game)

# ── 3 · Skeleton from slices of the mesh ───────────────────────────────────────────────────
vs = [v.co.copy() for v in body.data.vertices]
def slab(z, dz=.03): return [v for v in vs if abs(v.z - z) < dz]
H = 2.0
# Proportions of the reference (≈ 5 heads): head from 1.62, neck 1.56, shoulders 1.46, hips 0.98, knees 0.52.
def widest_x(z):
    s = slab(z); return (min(v.x for v in s), max(v.x for v in s)) if s else (-.3, .3)
sx0, sx1 = widest_x(1.38)
arm = bpy.data.armatures.new('esqueleto'); rig = bpy.data.objects.new('esqueleto', arm); scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='EDIT')
def bone(name, head, tail, parent=None):
    b = arm.edit_bones.new(name); b.head = head; b.tail = tail
    if parent: b.parent = arm.edit_bones[parent]; b.use_connect = False
    return b
bone('cadera', (0, 0, .98), (0, 0, 1.12))
bone('cuerpo', (0, 0, 1.12), (0, 0, 1.5), 'cadera')
bone('cuello', (0, 0, 1.5), (0, 0, 1.6), 'cuerpo')
bone('cabeza', (0, 0, 1.6), (0, 0, 2.0), 'cuello')
for side, sgn in (('izq', 1), ('der', -1)):
    # The character's left is +X when it faces −Y.
    sh = Vector((sgn * .2, 0, 1.44)); hand = Vector((sgn * (abs(sx1 if sgn > 0 else sx0) - .04), 0, 1.0))
    elbow = sh.lerp(hand, .5)
    bone(f'brazo-{side}', sh, elbow, 'cuerpo'); bone(f'antebrazo-{side}', elbow, hand, f'brazo-{side}')
    bone(f'pierna-{side}', (sgn * .11, 0, .96), (sgn * .11, 0, .52), 'cadera'); bone(f'canilla-{side}', (sgn * .11, 0, .52), (sgn * .11, -.02, .08), f'pierna-{side}')
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); rig.select_set(True); bpy.context.view_layer.objects.active = rig
try:
    bpy.ops.object.parent_set(type='ARMATURE_AUTO'); print('pesos automáticos')
except Exception as e:
    print('pesos automáticos fallaron:', e); bpy.ops.object.parent_set(type='ARMATURE_ENVELOPE')
empty_groups = [g.name for g in body.vertex_groups if not any(g.index in [x.group for x in v.groups] for v in body.data.vertices)]
print('grupos sin vértices', empty_groups)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True, export_skins=True, export_animations=False, use_selection=True)
print('exportado', out)
