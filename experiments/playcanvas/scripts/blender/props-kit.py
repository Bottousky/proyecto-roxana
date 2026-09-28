# Kit de utilería de Ohmdal, modelado por código en Blender: cajones, barriles, sacos,
# jardineras, carro, puesto de mercado, fardos, leña, cestas y bancos.
# Cada pieza tiene el origen en el centro de su base, UV en metros (el motor aplica las
# texturas pixel art de public/assets/hd2d por nombre de material) y oclusión horneada en
# el color de vértice, con un suelo invisible debajo para el contacto.
# Uso: blender -b --factory-startup --python scripts/blender/props-kit.py
import bpy, bmesh, math, os, random, json
import numpy as np
from mathutils import Vector, Matrix

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.environ.get('PROPS_OUT') or os.path.join(ROOT, 'public', 'assets', 'props')
META = os.environ.get('PROPS_META') or os.path.join(ROOT, 'src', 'data', 'props.json')
os.makedirs(OUT, exist_ok=True)
rng = random.Random(7)

sc = bpy.context.scene
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
for m in list(bpy.data.meshes): bpy.data.meshes.remove(m)

# Material por familia. Los que tienen textura pixel art llevan tile (metros por repetición).
FAMILIES = {
    'wood': ('#b08a60', 1.6), 'darkwood': ('#6e5238', 1.6), 'iron': ('#5b6166', 1.0), 'burlap': ('#d9c49c', .9),
    'hay': ('#e6c877', 1.2), 'endgrain': ('#c9a574', .4), 'awning': ('#ffffff', 2.4), 'stone': ('#b9ad98', 2.0),
    'soil': ('#4a3526', 0), 'clay': ('#b8674a', 0), 'leaf': ('#5d8a3c', 0), 'leafdark': ('#3f6b31', 0),
    'red': ('#c8423a', 0), 'yellow': ('#f0c64a', 0), 'white': ('#f2eee0', 0), 'pink': ('#e58aa6', 0), 'violet': ('#8c6cc8', 0),
    'fire': ('#ff9a3a', 0), 'linen': ('#eee6d2', 0), 'blanket': ('#a8443a', 0), 'rug': ('#7d3b33', 0), 'rugtrim': ('#d9a54a', 0),
    'plate': ('#e8e2d0', 0), 'bookred': ('#8e3b32', 0), 'bookblue': ('#35557a', 0), 'bookgreen': ('#4a6b3a', 0), 'bookochre': ('#b88a3a', 0), 'wax': ('#f4ecd0', 0),
    'apple': ('#c23b2e', 0), 'pear': ('#b9c24a', 0), 'orange': ('#e08a2e', 0), 'cabbage': ('#8fbf5a', 0), 'bread': ('#c98a44', 0),
}
MATS = {}
for name, (hexc, tile) in FAMILIES.items():
    m = bpy.data.materials.new(name)
    c = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    if bsdf: bsdf.inputs['Base Color'].default_value = (*[x ** 2.2 for x in c], 1); bsdf.inputs['Roughness'].default_value = 1
    m['tile'] = tile
    MATS[name] = m

def new_obj(name, bm, mat):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); sc.collection.objects.link(ob)
    ob.data.materials.append(MATS[mat]); return ob

def box(name, size, loc, mat, bevel=.015, rot=(0, 0, 0)):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    if bevel: bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=1, affect='EDGES')
    bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(rot[0], 3, 'X') @ Matrix.Rotation(rot[1], 3, 'Y') @ Matrix.Rotation(rot[2], 3, 'Z'), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector(loc), verts=bm.verts)
    return new_obj(name, bm, mat)

def lathe(name, profile, loc, mat, seg=16, jitter=0.0):
    # profile: [(radio, altura)] de abajo hacia arriba; tapas planas en los extremos.
    bm = bmesh.new(); rings = []
    for r, z in profile:
        ring = []
        for k in range(seg):
            a = k / seg * math.tau; rr = r * (1 + (rng.random() - .5) * jitter)
            ring.append(bm.verts.new((math.cos(a) * rr, math.sin(a) * rr, z)))
        rings.append(ring)
    for i in range(len(rings) - 1):
        for k in range(seg): bm.faces.new((rings[i][k], rings[i][(k + 1) % seg], rings[i + 1][(k + 1) % seg], rings[i + 1][k]))
    if profile[0][0] > 0: bm.faces.new(list(reversed(rings[0])))
    if profile[-1][0] > 0: bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.translate(bm, vec=Vector(loc), verts=bm.verts)
    return new_obj(name, bm, mat)

def blob(name, radius, loc, mat, scale=(1, 1, 1), subdiv=2, noise=.12):
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=radius)
    for v in bm.verts: v.co *= 1 + (rng.random() - .5) * noise
    bmesh.ops.scale(bm, vec=Vector(scale), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector(loc), verts=bm.verts)
    return new_obj(name, bm, mat)

def cylinder(name, r, h, loc, mat, seg=12, axis='Z'):
    ob = lathe(name, [(r, -h / 2), (r, h / 2)], (0, 0, 0), mat, seg)
    if axis == 'X': ob.data.transform(Matrix.Rotation(math.pi / 2, 4, 'Y'))
    if axis == 'Y': ob.data.transform(Matrix.Rotation(math.pi / 2, 4, 'X'))
    ob.data.transform(Matrix.Translation(Vector(loc))); return ob

def join(name, parts):
    bpy.ops.object.select_all(action='DESELECT')
    for p in parts: p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join(); ob = bpy.context.active_object; ob.name = name; return ob

# ---------------------------------------------------------------- piezas
def crate(name='crate', s=.7):
    parts = [box(name, (s * .94, s * .94, s * .94), (0, 0, s / 2), 'wood', .01)]
    t, w = .035, .07
    for x in (-1, 1):
        for y in (-1, 1): parts.append(box(name, (w, w, s), (x * (s / 2 - w / 2 + .005), y * (s / 2 - w / 2 + .005), s / 2), 'darkwood', .008))
    for z in (w / 2, s - w / 2):
        for y in (-1, 1): parts.append(box(name, (s, w, w), (0, y * (s / 2 - w / 2 + .005), z), 'darkwood', .008))
        for x in (-1, 1): parts.append(box(name, (w, s, w), (x * (s / 2 - w / 2 + .005), 0, z), 'darkwood', .008))
    # Tirante diagonal en las dos caras largas.
    d = math.hypot(s, s) * .86
    for y in (-1, 1): parts.append(box(name, (d, t, w * .9), (0, y * (s / 2 + .01), s / 2), 'darkwood', .006, (0, math.atan2(s, s) * (1 if y > 0 else -1), 0)))
    return join(name, parts)

def crate_produce(name, fruit, s=.62):
    parts = [box(name, (s, s * .8, s * .5), (0, 0, s * .25), 'wood', .01)]
    for x in (-1, 1): parts.append(box(name, (.05, s * .8 + .02, s * .5 + .02), (x * (s / 2), 0, s * .25), 'darkwood', .008))
    for i in range(14):
        a, r = rng.random() * math.tau, rng.random() ** .5 * s * .32
        parts.append(blob(name, .075, (math.cos(a) * r * 1.2, math.sin(a) * r * .9, s * .5 + .03 + rng.random() * .05), fruit, subdiv=1, noise=.1))
    return join(name, parts)

def barrel(name='barrel', h=.95, r=.34):
    prof = [(r * .86, 0), (r * .95, h * .2), (r, h * .5), (r * .95, h * .8), (r * .86, h)]
    parts = [lathe(name, prof, (0, 0, 0), 'wood', 20)]
    for z in (.12, .4, .6, .88):
        rr = r * (.86 + .14 * math.sin(math.pi * z)) + .012
        parts.append(lathe(name, [(rr, h * z - .025), (rr, h * z + .025)], (0, 0, 0), 'iron', 20))
    parts.append(cylinder(name, r * .8, .02, (0, 0, h - .005), 'endgrain', 20))
    return join(name, parts)

def sack(name='sack', h=.62):
    b = blob(name, .3, (0, 0, h * .42), 'burlap', (1, .85, 1.25), 3, .08)
    for v in b.data.vertices:  # se aplasta al pie y se estrecha en la boca atada
        z = v.co.z
        if z < .08: v.co.z = .08 - (.08 - z) * .25
        if z > h * .62: k = 1 - min(1, (z - h * .62) / (h * .3)) * .55; v.co.x *= k; v.co.y *= k
    tie = lathe(name, [(.07, h * .82), (.08, h * .86), (.03, h * .98)], (0, 0, 0), 'burlap', 10, .2)
    band = lathe(name, [(.085, h * .8), (.085, h * .84)], (0, 0, 0), 'darkwood', 10)
    return join(name, [b, tie, band])

def sacks(name='sacks'):
    parts = []
    for (x, y, rz, s) in [(-.28, 0, .3, 1), (.3, .05, -.4, .95), (0, -.05, .1, .9)]:
        ob = sack(name, .62 * s); ob.data.transform(Matrix.Rotation(rz, 4, 'Z'))
        ob.data.transform(Matrix.Translation((x, y, .42 if (x == 0) else 0))); parts.append(ob)
    return join(name, parts)

def planter(name='planter', w=1.1, colors=('red', 'yellow', 'white', 'pink')):
    parts = [box(name, (w, .36, .3), (0, 0, .15), 'wood', .012), box(name, (w - .06, .3, .02), (0, 0, .29), 'soil', 0)]
    for x in (-1, 1): parts.append(box(name, (.05, .4, .34), (x * w / 2, 0, .17), 'darkwood', .008))
    for i in range(22):
        x, y = (rng.random() - .5) * (w - .15), (rng.random() - .5) * .22
        parts.append(blob(name, .07 + rng.random() * .03, (x, y, .36 + rng.random() * .06), rng.choice(['leaf', 'leafdark']), (1, 1, .8), 1, .3))
    for i in range(16):
        x, y = (rng.random() - .5) * (w - .15), (rng.random() - .5) * .22
        parts.append(blob(name, .04, (x, y, .45 + rng.random() * .07), colors[i % len(colors)], (1, 1, .7), 1, .2))
    return join(name, parts)

def pot(name='pot', flowers='red'):
    parts = [lathe(name, [(.16, 0), (.2, .28), (.23, .3), (.23, .34), (.19, .34)], (0, 0, 0), 'clay', 14)]
    parts.append(cylinder(name, .19, .02, (0, 0, .32), 'soil', 14))
    for i in range(9):
        a, r = rng.random() * math.tau, rng.random() * .12
        parts.append(blob(name, .09, (math.cos(a) * r, math.sin(a) * r, .42 + rng.random() * .12), rng.choice(['leaf', 'leafdark']), (1, 1, .9), 1, .3))
    for i in range(7):
        a, r = rng.random() * math.tau, rng.random() * .14
        parts.append(blob(name, .045, (math.cos(a) * r, math.sin(a) * r, .55 + rng.random() * .1), flowers, (1, 1, .7), 1, .2))
    return join(name, parts)

def wheel(name, r, x, y):
    rim = lathe(name, [(r, -.04), (r, .04), (r - .05, .04), (r - .05, -.04), (r, -.04)], (0, 0, 0), 'darkwood', 18)
    parts = [rim, cylinder(name, .07, .12, (0, 0, 0), 'iron', 10)]
    for k in range(8):
        sp = box(name, (r - .05, .035, .035), ((r - .05) / 2, 0, 0), 'wood', .004); sp.data.transform(Matrix.Rotation(k / 8 * math.tau, 4, 'Z')); parts.append(sp)
    ob = join(name, parts); ob.data.transform(Matrix.Rotation(math.pi / 2, 4, 'X')); ob.data.transform(Matrix.Translation((x, y, r))); return ob

def cart(name='cart'):
    parts = [box(name, (1.5, .9, .08), (0, 0, .58), 'wood', .01)]
    for y in (-1, 1): parts.append(box(name, (1.5, .05, .3), (0, y * .45, .76), 'wood', .01))
    for x in (-1, 1): parts.append(box(name, (.05, .9, .3), (x * .75, 0, .76), 'wood', .01))
    for y in (-1, 1):
        parts.append(wheel(name, .42, -.2, y * .56))
        parts.append(box(name, (1.2, .06, .06), (1.25, y * .3, .6), 'darkwood', .01, (0, -.35, 0)))
    parts.append(box(name, (.06, .06, .5), (.7, 0, .3), 'darkwood', .01))
    # Carga: sacos y un cajón de manzanas.
    for (x, y) in [(-.35, -.18), (-.35, .2)]:
        s = sack(name, .5); s.data.transform(Matrix.Translation((x, y, .62))); parts.append(s)
    c = crate_produce(name, 'apple', .5); c.data.transform(Matrix.Translation((.3, 0, .62))); parts.append(c)
    return join(name, parts)

def stall(name='stall', fruit=('apple', 'pear', 'orange')):
    parts = []
    for x in (-1, 1):
        for y in (-1, 1): parts.append(box(name, (.09, .09, 2.3 if y < 0 else 1.9), (x * 1.05, y * .55, (2.3 if y < 0 else 1.9) / 2), 'darkwood', .01))
    parts.append(box(name, (2.2, 1.0, .07), (0, 0, .82), 'wood', .01))
    parts.append(box(name, (2.1, .05, .75), (0, .5, .42), 'wood', .01))
    aw = box(name, (2.5, 1.5, .04), (0, 0, 2.12), 'awning', 0, (math.atan2(.42, 1.3), 0, 0)); parts.append(aw)
    for i, f in enumerate(fruit):
        c = crate_produce(name, f, .55); c.data.transform(Matrix.Translation((-.66 + i * .66, -.1, .86))); parts.append(c)
    for x in (-.8, .8):
        s = sack(name, .45); s.data.transform(Matrix.Translation((x, .8, 0))); parts.append(s)
    return join(name, parts)

def hay(name='hay'):
    parts = [box(name, (1.0, .55, .48), (0, 0, .24), 'hay', .06)]
    for x in (-.25, .25): parts.append(box(name, (.03, .57, .5), (x, 0, .24), 'darkwood', .005))
    return join(name, parts)

def logs(name='logs'):
    parts = []
    for row, n in enumerate((4, 3, 2)):
        for i in range(n):
            y = (i - (n - 1) / 2) * .26
            parts.append(cylinder(name, .12, 1.2, (0, y, .12 + row * .22), 'darkwood', 10, 'X'))
            for x in (-1, 1): parts.append(cylinder(name, .115, .012, (x * .6, y, .12 + row * .22), 'endgrain', 10, 'X'))
    return join(name, parts)

def basket(name='basket', fruit='bread'):
    parts = [lathe(name, [(.17, 0), (.24, .2), (.25, .22), (.22, .22), (.15, .03)], (0, 0, 0), 'hay', 14)]
    for i in range(6):
        a, r = rng.random() * math.tau, rng.random() * .12
        parts.append(blob(name, .07, (math.cos(a) * r, math.sin(a) * r, .2 + rng.random() * .05), fruit, (1.3 if fruit == 'bread' else 1, 1, .8), 1, .15))
    return join(name, parts)

def bench(name='bench'):
    parts = [box(name, (1.5, .16, .05), (0, y, .46), 'wood', .008) for y in (-.09, .09)]
    for x in (-.6, .6): parts.append(box(name, (.07, .36, .44), (x, 0, .22), 'darkwood', .008))
    return join(name, parts)

def cabbages(name='cabbages'):
    parts = [box(name, (1.2, .5, .06), (0, 0, .03), 'soil', 0)]
    for i in range(6): parts.append(blob(name, .12, ((i % 3 - 1) * .38, (i // 3 - .5) * .24, .14), 'cabbage', (1, 1, .8), 2, .25))
    return join(name, parts)


# ---------------------------------------------------------------- mobiliario de interiores
def table(name='table', w=1.4, d=.8):
    parts = [box(name, (w, d, .06), (0, 0, .74), 'wood', .01)]
    for x in (-1, 1):
        for y in (-1, 1): parts.append(box(name, (.07, .07, .71), (x * (w / 2 - .08), y * (d / 2 - .08), .355), 'darkwood', .006))
    for x in (-1, 1): parts.append(box(name, (.05, d - .2, .06), (x * (w / 2 - .08), 0, .2), 'darkwood', .005))
    parts.append(cylinder(name, .12, .02, (-.3, .05, .78), 'plate', 12))
    parts.append(lathe(name, [(.05, .77), (.06, .86), (.04, .92)], (.35, -.1, 0), 'clay', 10))
    return join(name, parts)

def chair(name='chair'):
    parts = [box(name, (.44, .44, .05), (0, 0, .46), 'wood', .006)]
    for x in (-1, 1):
        for y in (-1, 1): parts.append(box(name, (.05, .05, .46 if y > 0 else .95), (x * .18, y * .18, (.46 if y > 0 else .95) / 2), 'darkwood', .004))
    for z in (.7, .88): parts.append(box(name, (.4, .04, .06), (0, -.18, z), 'wood', .004))
    return join(name, parts)

def bed(name='bed'):
    parts = [box(name, (1.0, 2.0, .3), (0, 0, .3), 'darkwood', .01), box(name, (.94, 1.9, .16), (0, .02, .5), 'linen', .03),
             box(name, (.96, 1.25, .08), (0, .35, .6), 'blanket', .02), box(name, (.6, .32, .12), (0, -.72, .64), 'linen', .04),
             box(name, (1.06, .08, 1.0), (0, -1.0, .5), 'darkwood', .01), box(name, (1.06, .08, .6), (0, 1.0, .3), 'darkwood', .01)]
    return join(name, parts)

def hearth(name='hearth'):
    parts = [box(name, (1.8, .7, .25), (0, 0, .125), 'stone', .02), box(name, (.35, .6, 1.1), (-.72, 0, .8), 'stone', .02),
             box(name, (.35, .6, 1.1), (.72, 0, .8), 'stone', .02), box(name, (1.8, .7, .3), (0, 0, 1.5), 'stone', .02),
             box(name, (1.3, .55, 1.1), (0, .1, 2.2), 'stone', .02), box(name, (2.0, .8, .1), (0, 0, 1.68), 'darkwood', .01),
             box(name, (1.1, .1, 1.0), (0, .3, .8), 'soil', 0)]
    for i in range(3): parts.append(cylinder(name, .07, .7, (0, .05 - i * .06, .3 + i * .06), 'darkwood', 8, 'X'))
    for i in range(5): parts.append(blob(name, .12 + rng.random() * .08, ((rng.random() - .5) * .5, -.05, .45 + rng.random() * .25), 'fire', (1, .6, 1.6), 1, .3))
    parts.append(lathe(name, [(.14, .72), (.2, .9), (.18, 1.05), (.12, 1.08)], (-.35, -.05, -.4), 'iron', 12))
    return join(name, parts)

def oven(name='oven'):
    parts = [box(name, (1.8, 1.4, .8), (0, 0, .4), 'stone', .03)]
    parts.append(blob(name, .85, (0, 0, .8), 'stone', (1, .8, .75), 3, .04))
    parts.append(box(name, (.6, .1, .45), (0, -.72, 1.0), 'soil', .02))
    for i in range(3): parts.append(blob(name, .1, ((i - 1) * .16, -.62, .96), 'fire', (1, .6, .9), 1, .3))
    parts.append(cylinder(name, .18, 1.2, (.2, .25, 1.9), 'stone', 10))
    return join(name, parts)

def counter(name='counter', w=2.0):
    parts = [box(name, (w, .6, .9), (0, 0, .45), 'wood', .01), box(name, (w + .1, .7, .06), (0, 0, .93), 'darkwood', .01)]
    for x in (-1, 0, 1): parts.append(box(name, (.06, .02, .8), (x * w * .33, -.31, .45), 'darkwood', .004))
    return join(name, parts)

def rug(name='rug', w=2.4, d=1.6):
    return join(name, [box(name, (w, d, .015), (0, 0, .008), 'rugtrim', 0), box(name, (w - .2, d - .2, .018), (0, 0, .01), 'rug', 0)])

def wardrobe(name='wardrobe'):
    parts = [box(name, (1.1, .6, 2.0), (0, 0, 1.0), 'darkwood', .02), box(name, (1.2, .66, .1), (0, 0, 2.05), 'wood', .01)]
    for x in (-.27, .27): parts.append(box(name, (.5, .02, 1.8), (x, -.31, 1.0), 'wood', .006))
    for x in (-.05, .05): parts.append(box(name, (.03, .04, .12), (x, -.34, 1.05), 'iron', .004))
    return join(name, parts)

def anvil(name='anvil'):
    parts = [cylinder(name, .3, .5, (0, 0, .25), 'darkwood', 12), box(name, (.35, .22, .14), (0, 0, .56), 'iron', .02),
             box(name, (.6, .25, .14), (0, 0, .72), 'iron', .02), blob(name, .09, (.36, 0, .72), 'iron', (1.4, .8, .7), 1, 0)]
    return join(name, parts)

def millstone(name='millstone'):
    parts = [cylinder(name, .9, .4, (0, 0, .2), 'stone', 20), cylinder(name, .75, .25, (0, 0, .52), 'stone', 20),
             cylinder(name, .08, .9, (0, 0, .9), 'darkwood', 8), box(name, (1.6, .1, .1), (.4, 0, 1.2), 'darkwood', .01)]
    return join(name, parts)

def candle(name='candle'):
    parts = [cylinder(name, .08, .03, (0, 0, .015), 'iron', 10), cylinder(name, .03, .18, (0, 0, .12), 'wax', 8), blob(name, .025, (0, 0, .24), 'fire', (1, 1, 1.8), 1, 0)]
    return join(name, parts)

def stool(name='stool'):
    parts = [cylinder(name, .2, .05, (0, 0, .46), 'wood', 12)]
    for k in range(3):
        a = k * math.tau / 3; parts.append(box(name, (.04, .04, .46), (math.cos(a) * .13, math.sin(a) * .13, .23), 'darkwood', .004))
    return join(name, parts)


def open_frame(name, w, d, h, boards, mat='darkwood'):
    # Estante abierto: fondo, laterales, techo y tablas; lo que se apoya queda a la vista.
    t = .04
    parts = [box(name, (w, t, h), (0, d / 2 - t / 2, h / 2), mat, .004)]
    for x in (-1, 1): parts.append(box(name, (t, d, h), (x * (w / 2 - t / 2), 0, h / 2), mat, .004))
    parts.append(box(name, (w, d, t), (0, 0, h - t / 2), mat, .004))
    for z in boards: parts.append(box(name, (w - 2 * t, d - t, .03), (0, -t / 2, z), 'wood', .004))
    return parts

def cupboard(name='cupboard'):
    parts = [box(name, (1.2, .5, .95), (0, 0, .475), 'darkwood', .01)]
    upper = open_frame(name, 1.2, .3, 1.0, (.02, .35, .7))
    for piece in upper: piece.data.transform(Matrix.Translation((0, .1, .95)))
    parts += upper
    for i in range(5): parts.append(cylinder(name, .1, .02, (-.45 + i * .22, .16, 1.1), 'plate', 12, 'Y'))
    for i in range(4): parts.append(lathe(name, [(.05, 1.31), (.07, 1.42), (.04, 1.5)], (-.4 + i * .27, .05, 0), 'clay', 10))
    for i in range(3): parts.append(lathe(name, [(.06, 1.66), (.08, 1.76), (.05, 1.84)], (-.3 + i * .3, .05, 0), 'plate', 10))
    for x in (-.3, .3): parts.append(box(name, (.5, .02, .8), (x, -.26, .48), 'wood', .004))
    return join(name, parts)

def bookshelf(name='bookshelf'):
    parts = open_frame(name, 1.2, .35, 2.0, (.08, .55, 1.05, 1.52))
    colors = ['bookred', 'bookblue', 'bookgreen', 'bookochre']
    for z in (.1, .57, 1.07, 1.54):
        x = -.54
        while x < .5:
            t = .04 + rng.random() * .04; hgt = .26 + rng.random() * .14
            if rng.random() < .08: x += .08; continue
            parts.append(box(name, (t, .24, hgt), (x + t / 2, -.02, z + hgt / 2), rng.choice(colors), .004)); x += t + .006
    return join(name, parts)

def shelf_bread(name='shelf_bread'):
    parts = open_frame(name, 1.4, .4, 1.7, (.08, .6, 1.12))
    for z in (.1, .62, 1.14):
        for i in range(5): parts.append(blob(name, .09, (-.52 + i * .26, -.03, z + .07), 'bread', (1.5, 1, .8), 1, .15))
    return join(name, parts)

KIT = {
    'crate': crate, 'crate_small': lambda: crate('crate_small', .5), 'crate_apples': lambda: crate_produce('crate_apples', 'apple'),
    'crate_pears': lambda: crate_produce('crate_pears', 'pear'), 'barrel': barrel, 'sack': sack, 'sacks': sacks,
    'planter': planter, 'planter_warm': lambda: planter('planter_warm', 1.1, ('orange', 'yellow', 'red')),
    'pot': pot, 'pot_white': lambda: pot('pot_white', 'white'), 'cart': cart, 'stall': stall,
    'stall_bread': lambda: stall('stall_bread', ('bread', 'cabbage', 'apple')), 'hay': hay, 'logs': logs,
    'basket': basket, 'basket_apples': lambda: basket('basket_apples', 'apple'), 'bench': bench, 'cabbages': cabbages,
    'table': table, 'chair': chair, 'bed': bed, 'cupboard': cupboard, 'bookshelf': bookshelf, 'hearth': hearth, 'oven': oven,
    'counter': counter, 'rug': rug, 'wardrobe': wardrobe, 'anvil': anvil, 'millstone': millstone, 'candle': candle, 'stool': stool,
    'shelf_bread': shelf_bread,
}
built = [fn() for fn in KIT.values()]
# El mundo de Ohmdal está a escala de sus figuras (casi 3 unidades de alto): la utilería,
# modelada en metros, se agranda para que un cajón llegue a la rodilla y no al tobillo.
SCALE = 1.6
for ob in built: ob.data.transform(Matrix.Scale(SCALE, 4))
for ob in built: bpy.ops.object.select_all(action='DESELECT')

# ---------------------------------------------------------------- UV en metros
def meter_uvs(ob):
    me = ob.data
    uv = me.uv_layers.new(name='UVMap')
    for poly in me.polygons:
        mat = me.materials[poly.material_index]; tile = mat.get('tile', 1) or 1
        n = poly.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            u, v = {0: (co.y, co.z), 1: (co.x, co.z), 2: (co.x, co.y)}[ax]
            uv.data[li].uv = (u / tile, v / tile)

# ---------------------------------------------------------------- oclusión
sc.render.engine = 'CYCLES'
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences; prefs.compute_device_type = 'OPTIX'; prefs.get_devices()
    for d in prefs.devices: d.use = d.type == 'OPTIX'
    sc.cycles.device = 'GPU'
except Exception: pass
sc.cycles.samples = 64
if sc.world is None: sc.world = bpy.data.worlds.new('Mundo')
sc.world.light_settings.distance = .8
bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=4); floor = new_obj('suelo', bm, 'soil')

meta = {}
for ob in built:
    meter_uvs(ob)
    for other in built: other.hide_render = other is not ob
    me = ob.data
    for a in list(me.color_attributes): me.color_attributes.remove(a)
    me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER'); me.color_attributes.active_color = me.color_attributes['Col']
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.object.bake(type='AO', target='VERTEX_COLORS')
    col = me.color_attributes['Col']
    for d in col.data:  # nunca negro: la oclusión oscurece hasta un 55 %
        a = d.color[0]; k = 1 - .55 * (1 - a) ** 1.2; d.color = (k, k, k, 1)
    xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
    # cx, cz: centro de la huella respecto del origen, en ejes del motor (z = -y de Blender).
    meta[ob.name] = {'w': round(max(xs) - min(xs), 3), 'd': round(max(ys) - min(ys), 3), 'h': round(max(zs), 3),
                     'cx': round((max(xs) + min(xs)) / 2, 3), 'cz': round(-(max(ys) + min(ys)) / 2, 3)}
for ob in built: ob.hide_render = False
bpy.data.objects.remove(floor)

bpy.ops.object.select_all(action='DESELECT')
for ob in built: ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'kit.glb'), use_selection=True, export_format='GLB', export_apply=True,
                          export_vertex_color='ACTIVE', export_all_vertex_colors=False, export_normals=True, export_texcoords=True,
                          export_materials='EXPORT', export_yup=True)
# Huellas en el plano del suelo del motor (x, z): w a lo largo de x, d a lo largo de z.
json.dump(meta, open(META, 'w'), indent=1)
print('kit', len(built), 'piezas', os.path.join(OUT, 'kit.glb'))
