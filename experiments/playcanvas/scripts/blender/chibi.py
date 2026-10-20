# El viajero en 3D, cabezón, para el estilo X e Y (ciclo 27): figuras simples y redondeadas en
# colores planos (el juego le pone luz de dibujo animado y contorno). Cada parte que se mueve cuelga
# de un nodo con su pivote en la articulación: cadera, hombros y cuello. El juego la anima por partes.
# Blender: Z arriba y frente hacia -Y; el exportador glTF lo convierte a Y arriba y frente +Z.
# Uso: blender -b -P scripts/blender/chibi.py -- salida.glb
import bpy, sys, math
from mathutils import Vector

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'viajero.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def material(name, hex_colour):
    m = bpy.data.materials.new(name); m.use_nodes = True
    r, g, b = (int(hex_colour[i:i + 2], 16) / 255 for i in (0, 2, 4))
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (r ** 2.2, g ** 2.2, b ** 2.2, 1)
    bsdf.inputs['Roughness'].default_value = 1.0
    return m

M = {k: material(k, v) for k, v in {
    'piel': 'e8b48e', 'pelo': '5e3720', 'pelo-claro': '7d4a2a', 'abrigo': '235a78', 'abrigo-borde': '1a4459',
    'bufanda': 'f0b93a', 'pantalon': '3f3029', 'bota': '6a4128', 'bolso': '8a5a34', 'correa': '6b4126',
    'ojo': '2a2230', 'brillo': 'ffffff', 'boca': 'a8574e', 'boton': 'd8b45a', 'ceja': '4a2a18', 'camisa': 'efe6cf', 'mejilla': 'f0a08a'}.items()}

def empty(name, parent=None, at=(0, 0, 0)):
    e = bpy.data.objects.new(name, None); scene.collection.objects.link(e)
    if parent: e.parent = parent
    e.location = at; return e

def shade(obj, mat):
    obj.data.materials.append(mat)
    for p in obj.data.polygons: p.use_smooth = True
    return obj

def ball(name, parent, at, size, mat, segments=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=segments // 2, radius=1, location=(0, 0, 0))
    o = bpy.context.object; o.name = name; o.scale = size; o.parent = parent; o.location = at
    return shade(o, mat)

def tube(name, parent, at, radius, depth, mat, top=None, rot=(0, 0, 0), vertices=20):
    if top is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=(0, 0, 0))
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=top, depth=depth, location=(0, 0, 0))
    o = bpy.context.object; o.name = name; o.parent = parent; o.location = at; o.rotation_euler = rot
    return shade(o, mat)

def ring(name, parent, at, major, minor, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=28, minor_segments=12, location=(0, 0, 0))
    o = bpy.context.object; o.name = name; o.parent = parent; o.location = at; o.rotation_euler = rot
    return shade(o, mat)

def box(name, parent, at, size, mat, rot=(0, 0, 0), bevel=.03):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    o = bpy.context.object; o.name = name; o.scale = size; o.parent = parent; o.location = at; o.rotation_euler = rot
    shade(o, mat)
    if bevel:
        mod = o.modifiers.new('bisel', 'BEVEL'); mod.width = bevel; mod.segments = 3
    return o

# Total height about 2 m (the sprites read about that tall next to a door). Head : body ≈ 1 : 1.4.
root = empty('viajero')
root.scale = (1.55, 1.55, 1.55)  # as tall as the sprites read next to a door
hips = empty('cadera', root, (0, 0, .62))

# Legs: trousers and boots, pivot at the hip.
for side, sx in (('izq', .1), ('der', -.1)):
    leg = empty(f'pierna-{side}', hips, (sx, 0, 0))
    tube(f'muslo-{side}', leg, (0, 0, -.2), .1, .4, M['pantalon'])
    bota = ball(f'bota-{side}', leg, (0, -.04, -.47), (.12, .16, .1), M['bota'])

# Body: a coat that flares a little, its hem darker.
body = empty('cuerpo', hips, (0, 0, 0))
tube('abrigo', body, (0, 0, .25), .29, .56, M['abrigo'], top=.22)
ring('ruedo', body, (0, 0, -.02), .28, .035, M['abrigo-borde'])
box('camisa', body, (0, -.2, .36), (.12, .06, .3), M['camisa'], bevel=.02)
for side, sx in (('izq', .09), ('der', -.09)):
    box(f'solapa-{side}', body, (sx, -.215, .42), (.07, .04, .2), M['abrigo-borde'], rot=(0, math.radians(-14 if sx > 0 else 14), 0), bevel=.015)
for z in (.18, .32): ball(f'boton-{z}', body, (0, -.245, z), (.03, .02, .03), M['boton'], 12)
# Satchel at the hip, strap across the chest.
box('bolso', body, (.27, -.02, .02), (.07, .2, .17), M['bolso'], bevel=.02)
tube('correa', body, (.04, -.02, .3), .025, .72, M['correa'], rot=(0, math.radians(38), 0), vertices=10)

# Arms: coat sleeves and hands, pivot at the shoulder.
for side, sx in (('izq', .27), ('der', -.27)):
    arm = empty(f'brazo-{side}', body, (sx, 0, .48))
    tube(f'manga-{side}', arm, (0, 0, -.17), .075, .34, M['abrigo'], top=.085)
    ball(f'mano-{side}', arm, (0, 0, -.37), (.07, .07, .07), M['piel'], 16)

# Neck, scarf and its tail.
neck = empty('cuello', body, (0, 0, .55))
ring('bufanda', neck, (0, 0, .02), .17, .07, M['bufanda'])
box('bufanda-punta', neck, (-.12, -.16, -.14), (.09, .05, .26), M['bufanda'], rot=(math.radians(-8), math.radians(12), 0), bevel=.025)

# Head: big and round, curly brown hair in clumps, a fringe, large eyes.
head = empty('cabeza', neck, (0, 0, .1))
ball('cara', head, (0, 0, .38), (.4, .38, .4), M['piel'], 32)
ball('pelo-nuca', head, (0, .07, .44), (.42, .37, .4), M['pelo'], 28)
for i, (x, y, z, r) in enumerate([(0, .02, .74, .2), (.17, .04, .7, .17), (-.17, .04, .7, .17), (.27, .06, .55, .15), (-.27, .06, .55, .15),
                                  (.1, -.12, .7, .15), (-.1, -.12, .7, .15), (0, .2, .62, .2), (.2, .2, .5, .15), (-.2, .2, .5, .15)]):
    ball(f'rulo-{i}', head, (x, y, z), (r, r, r * .9), M['pelo' if i % 3 else 'pelo-claro'], 18)
for i, (x, z, r) in enumerate([(-.15, .6, .12), (0, .63, .13), (.15, .6, .12)]):
    ball(f'flequillo-{i}', head, (x, -.27, z), (r, r * .8, r * .8), M['pelo'], 16)
for side, sx in (('izq', .14), ('der', -.14)):
    ball(f'ojo-{side}', head, (sx, -.355, .37), (.055, .03, .085), M['ojo'], 16)
    ball(f'brillo-{side}', head, (sx - .015, -.38, .4), (.018, .01, .022), M['brillo'], 10)
box('boca', head, (0, -.37, .23), (.06, .01, .012), M['boca'], bevel=0)
for side, sx in (('izq', .14), ('der', -.14)):
    box(f'ceja-{side}', head, (sx, -.35, .5), (.08, .012, .018), M['ceja'], rot=(0, math.radians(-8 if sx > 0 else 8), 0), bevel=.006)
    ball(f'mejilla-{side}', head, (sx * 1.35, -.33, .28), (.05, .012, .03), M['mejilla'], 12)

bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True)
print('exportado', out)
