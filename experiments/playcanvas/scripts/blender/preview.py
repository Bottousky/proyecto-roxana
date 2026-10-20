# Vista rápida de un modelo .glb desde cuatro lados (frente −Y, derecha, espalda, izquierda), en Eevee.
# Uso: blender -b -P scripts/blender/preview.py -- modelo.glb salida.png [mate]
import bpy, sys, math
from mathutils import Vector
a = sys.argv[sys.argv.index('--') + 1:]; src, out = a[0], a[1]; matte = len(a) > 2
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=src)
objs = [o for o in sc.objects if o.type == 'MESH']
if matte:
    m = bpy.data.materials.new('gris'); m.use_nodes = True; m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.7, .7, .68, 1)
    for o in objs: o.data.materials.clear(); o.data.materials.append(m)
vs = [o.matrix_world @ v.co for o in objs for v in o.data.vertices]
lo = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs))); hi = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
c = (lo + hi) / 2; size = max(hi - lo)
print('caja', tuple(round(x, 3) for x in lo), tuple(round(x, 3) for x in hi))
sun = bpy.data.lights.new('sol', 'SUN'); sun.energy = 3.5; so = bpy.data.objects.new('sol', sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(50), 0, math.radians(30))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.35, .37, .4, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 1.2
cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = size * 1.1; co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
sc.render.resolution_x = 512; sc.render.resolution_y = 768
import os; tiles = []
for i, ang in enumerate([0, 90, 180, 270]):
    r = math.radians(ang); d = Vector((math.sin(r), -math.cos(r), 0))
    co.location = c + d * size * 3; co.rotation_euler = (math.pi / 2, 0, r)
    sc.render.filepath = out.replace('.png', f'-{i}.png'); bpy.ops.render.render(write_still=True); tiles.append(sc.render.filepath)
print('vistas', tiles)
