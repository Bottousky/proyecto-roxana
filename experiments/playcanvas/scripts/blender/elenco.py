# El elenco en fila, con su textura del juego, de frente y de tres cuartos, para revisar a todos
# juntos (la misma luz, la misma escala relativa que en el juego).
# Uso: blender -b -P scripts/blender/elenco.py -- salida-prefijo a.glb[:escala] b.glb[:escala] …
import bpy, sys, math
from mathutils import Vector
args = sys.argv[sys.argv.index('--') + 1:]
prefix, files = args[0], args[1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
x = 0; roots = []
for item in files:
    path, _, size = item.partition(':'); size = float(size or 1)
    before = set(sc.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in sc.objects if o not in before]
    root = bpy.data.objects.new('raiz', None); sc.collection.objects.link(root); roots.append(root)
    for o in new:
        if o.parent is None: o.parent = root
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ Vector(c) for o in new if o.type == 'MESH' for c in o.bound_box]
    lo = Vector([min(p[i] for p in pts) for i in range(3)]); hi = Vector([max(p[i] for p in pts) for i in range(3)])
    s = 2 * size / (hi.z - lo.z); root.scale = (s, s, s)
    root.location = (x - (lo.x + hi.x) / 2 * s, -(lo.y + hi.y) / 2 * s, -lo.z * s)
    x += 1.35
cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = x + .2; co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co
for ang, e in ((30, 3.2), (-70, 1.2)):
    l = bpy.data.lights.new(f's{ang}', 'SUN'); l.energy = e; lo_ = bpy.data.objects.new(l.name, l); sc.collection.objects.link(lo_); lo_.rotation_euler = (math.radians(55), 0, math.radians(ang))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.78, .86, .93, 1); w.node_tree.nodes['Background'].inputs[1].default_value = .9
sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
sc.render.resolution_x = int(200 * (x + .2)); sc.render.resolution_y = 520; sc.view_settings.view_transform = 'Standard'
mid = (x - 1.35) / 2
for name, ang in (('frente', 0), ('tres-cuartos', 30)):
    # Each figure turns on its own spot, so the row never overlaps.
    for root in roots:
        bpy.context.view_layer.update(); c = sum((o.matrix_world.translation for o in root.children), Vector()) / max(1, len(root.children))
        root.rotation_euler = (0, 0, math.radians(ang))
    co.location = (mid, -20, 1.05); co.rotation_euler = (math.pi / 2, 0, 0)
    sc.render.filepath = f'{prefix}-{name}.png'; bpy.ops.render.render(write_still=True)
print('elenco', prefix)
