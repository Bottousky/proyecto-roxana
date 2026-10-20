# Tres vistas en arcilla de una forma (frente, tres cuartos y perfil), para comparar formas de
# distintas fuentes con la misma luz y la misma escala (2 m de alto).
# Uso: blender -b -P scripts/blender/vista-forma.py -- forma.glb salida-prefijo
import bpy, sys, math
from mathutils import Vector
src, prefix = sys.argv[sys.argv.index('--') + 1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
sc = bpy.context.scene
meshes = [o for o in sc.objects if o.type == 'MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in meshes: o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1: bpy.ops.object.join()
body = bpy.context.view_layer.objects.active
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
vs = [body.matrix_world @ v.co for v in body.data.vertices]
lo = Vector([min(v[i] for v in vs) for i in range(3)]); hi = Vector([max(v[i] for v in vs) for i in range(3)])
s = 2 / (hi.z - lo.z); body.scale = (s, s, s); bpy.ops.object.transform_apply(scale=True)
vs = [v.co for v in body.data.vertices]
lo = Vector([min(v[i] for v in vs) for i in range(3)]); hi = Vector([max(v[i] for v in vs) for i in range(3)])
body.location = (-(lo.x + hi.x) / 2, -(lo.y + hi.y) / 2, -lo.z)
for p in body.data.polygons: p.use_smooth = True
m = bpy.data.materials.new('arcilla'); m.use_nodes = True; m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.62, .58, .54, 1)
body.data.materials.clear(); body.data.materials.append(m)
cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = 2.3; co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co
for ang, e in ((40, 3), (-60, 1.5)):
    l = bpy.data.lights.new(f's{ang}', 'SUN'); l.energy = e; lo_ = bpy.data.objects.new(l.name, l); sc.collection.objects.link(lo_); lo_.rotation_euler = (math.radians(50), 0, math.radians(ang))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.85, .87, .9, 1); w.node_tree.nodes['Background'].inputs[1].default_value = .6
sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
sc.render.resolution_x, sc.render.resolution_y = 520, 620; sc.view_settings.view_transform = 'Standard'
for name, ang in (('frente', 0), ('tres-cuartos', 35), ('perfil', 90)):
    r = math.radians(ang); co.location = (math.sin(r) * 6, -math.cos(r) * 6, 1); co.rotation_euler = (math.pi / 2, 0, r)
    sc.render.filepath = f'{prefix}-{name}.png'; bpy.ops.render.render(write_still=True)
print('vistas', prefix)
