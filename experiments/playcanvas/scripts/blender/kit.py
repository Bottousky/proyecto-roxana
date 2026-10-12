# Kit de impresión de un personaje (ciclo 28), desde el maestro con regiones (scripts/blender/regiones.py):
# - una pieza por región (STL), para imprimir cada una en su filamento o pintarla;
# - el personaje entero en OBJ con un material de color por región, que Bambu Studio y PrusaSlicer
#   asignan a filamentos al importar;
# - una vista previa de las piezas por color.
# Escala: la figura mide ALTO milímetros (por defecto 90). Todavía no es la versión final para
# imprimir: falta la pose de impresión, la base, los encastres y el control de espesor mínimo.
# Uso: blender -b -P scripts/blender/kit.py -- personaje-regiones.blend personaje.json carpeta-salida
import bpy, bmesh, sys, os, json, math
args = sys.argv[sys.argv.index('--') + 1:]
blend, config_path, out = args[:3]
height_mm = float(os.environ.get('ALTO', 90))
os.makedirs(out, exist_ok=True)
config = json.load(open(config_path)); regions = config['regiones']
bpy.ops.wm.open_mainfile(filepath=blend)
sc = bpy.context.scene
body = [o for o in sc.objects if o.type == 'MESH'][0]
# Millimetres, feet on the build plate.
s = height_mm / 2.0 * .001  # the master is 2 m tall; slicers read STL and OBJ in millimetres as metres × 1000
body.scale = (height_mm / 2.0, height_mm / 2.0, height_mm / 2.0)
bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); bpy.context.view_layer.objects.active = body
bpy.ops.object.transform_apply(scale=True)
# One material per region, its sample colour.
mats = []
for r in regions:
    m = bpy.data.materials.new(r['nombre']); m.use_nodes = True
    rgb = [int(r['muestra'][i:i + 2], 16) / 255 for i in (1, 3, 5)]
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*[c ** 2.2 for c in rgb], 1)
    m.diffuse_color = (*[c ** 2.2 for c in rgb], 1); mats.append(m)
body.data.materials.clear()
for m in mats: body.data.materials.append(m)
labels = [0] * len(body.data.polygons); body.data.attributes['region'].data.foreach_get('value', labels)
for p, l in zip(body.data.polygons, labels): p.material_index = l
# The whole figure, coloured.
bpy.ops.wm.obj_export(filepath=os.path.join(out, 'figura-color.obj'), export_selected_objects=True, export_materials=True, export_uv=False, forward_axis='Y', up_axis='Z')
# One piece per region.
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='DESELECT'); bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.separate(type='MATERIAL'); bpy.ops.object.mode_set(mode='OBJECT')
pieces = []
for o in [o for o in sc.objects if o.type == 'MESH']:
    name = o.active_material.name if o.active_material else 'sin-region'
    o.name = name
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    path = os.path.join(out, f'pieza-{name}.stl')
    bpy.ops.wm.stl_export(filepath=path, export_selected_objects=True, forward_axis='Y', up_axis='Z')
    pieces.append({'pieza': name, 'caras': len(o.data.polygons), 'archivo': os.path.basename(path)})
json.dump({'personaje': config.get('nombre'), 'alto_mm': height_mm, 'piezas': pieces,
           'nota': 'Piezas de superficie separadas por color, sin espesor propio: sirven para asignar filamentos sobre la figura entera o para pintar. La versión para producción suma pose de impresión, base, encastres y control de espesor mínimo.'},
          open(os.path.join(out, 'kit.json'), 'w'), indent=1, ensure_ascii=False)
for p in pieces: print('pieza', p['pieza'], p['caras'])
# Preview: the pieces, coloured, front and three-quarter.
cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = height_mm * 1.15; co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co
sun = bpy.data.lights.new('s', 'SUN'); sun.energy = 3; so = bpy.data.objects.new('s', sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(45), 0, math.radians(35))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.85, .85, .83, 1)
sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
sc.render.resolution_x, sc.render.resolution_y = 700, 1000; sc.view_settings.view_transform = 'Standard'
for k, ang in enumerate([0, 35, 180]):
    r = math.radians(ang); co.location = (math.sin(r) * 400, -math.cos(r) * 400, height_mm * .5); co.rotation_euler = (math.pi / 2, 0, r)
    sc.render.filepath = os.path.join(out, f'vista-{k}.png'); bpy.ops.render.render(write_still=True)
print('kit', out)
