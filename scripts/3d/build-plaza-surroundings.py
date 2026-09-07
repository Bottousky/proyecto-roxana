"""Plaza L2 landscape and civic retaining architecture, authored in Blender.

World-space metres are converted explicitly from PlayCanvas Y-up into Blender.
The output uses the Plaza origin, NOT its lowest vertex as a grounding pivot.
Shared runtime PBR materials replace named placeholders after loading.
"""
import bpy
import math
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/runtime/ohmdal/plaza/environment'
SOURCE = ROOT / 'assets/source/ohmdal/plaza/environment'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def point(p):
    return (p[0], -p[2], p[1])

def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = .88
    return mat

stone = material('PlazaSurroundStone', (.48, .43, .36))
dark = material('PlazaSurroundDarkStone', (.35, .31, .25))
plaster = material('PlazaSurroundPlaster', (.57, .52, .44))
roof = material('PlazaSurroundRoof', (.24, .27, .27))
wood = material('PlazaSurroundWood', (.24, .17, .10))
land = material('PlazaSurroundLand', (.39, .43, .30))
soil = material('PlazaSurroundSoil', (.19, .16, .10))

def finish(obj, mat, bevel=0):
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new('Weathered arris', 'BEVEL')
        mod.width = bevel
        mod.segments = 1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    # Metre-based planar UVs: no stretched cube UVs on long retaining courses.
    if not obj.data.uv_layers:
        obj.data.uv_layers.new(name='UVMap')
    uv = obj.data.uv_layers.active.data
    for poly in obj.data.polygons:
        axis = max(range(3), key=lambda i: abs(poly.normal[i]))
        axes = [i for i in range(3) if i != axis]
        for li in poly.loop_indices:
            v = obj.data.vertices[obj.data.loops[li].vertex_index].co
            uv[li].uv = (v[axes[0]] / 2, v[axes[1]] / 2)
    obj.select_set(False)
    return obj

def box(name, pos, size, mat, bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1, location=point(pos))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (size[0], size[2], size[1])
    return finish(obj, mat, bevel)

def mesh_object(name, positions, faces, mat):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([point(p) for p in positions], [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish(obj, mat)

def smooth(t):
    t = max(0, min(1, t))
    return t*t*(3-2*t)

def ground_y(x, z):
    # The entire navigable Plaza and northern transition remain below their
    # existing authored floor. The planted shoulder falls into a broad valley.
    edge = max(abs(x)-18, abs(z)-15, 0)
    if edge <= 2:
        return -.45
    decline = smooth((edge-2)/28)
    detail = (math.sin(x*.09+1.2)*math.cos(z*.074)+math.sin(x*.041-z*.064))*.75
    y = -.45 - decline * 5.5 + detail * smooth((edge-3)/12)
    # Three-dimensional shoulders replace the old paper-thin zigzag skirts.
    for cx, cz, height, spread in [(-35,32,13,21),(33,39,15,24),(-67,-5,9,30),(60,-30,7,30)]:
        y += height * math.exp(-((x-cx)**2+(z-cz)**2)/(spread*spread)) * smooth((edge-3)/12)
    erosion = (math.sin(x*.39+math.cos(z*.23))*math.sin(z*.31)*1.35
               + math.sin(x*.83-z*.61)*.38)
    y += erosion * smooth((edge-5)/13)
    # Avoid covering the established Manantial floor with scenic land.
    if abs(x) < 11 and z > 14:
        y = min(y, -.4)
    return y

# Dense near-ground / sparse distance, real mesh parallax on all four sides.
n = 104
coords = [math.copysign((abs(i/n*2-1)**1.55)*180, i/n*2-1) for i in range(n+1)]
verts, faces = [], []
for z in coords:
    for x in coords:
        verts.append((x, ground_y(x,z), z))
for row in range(n):
    for col in range(n):
        a = row*(n+1)+col
        faces.append((a,a+n+1,a+n+2,a+1))
terrain = mesh_object('PlazaValleyTerrain', verts, faces, land)
colors = terrain.data.color_attributes.new(name='LandscapeColor', type='FLOAT_COLOR', domain='POINT')
for i, (x,y,z) in enumerate(verts):
    variation = .075*math.sin(x*.6+math.cos(z*.31))*math.sin(z*.47)
    slope = math.hypot(ground_y(x+1,z)-ground_y(x-1,z),ground_y(x,z+1)-ground_y(x,z-1))/2
    rock = smooth((slope-.18)*1.5)
    haze = smooth((math.hypot(x,z)-65)/160)*.35
    col = (.21+rock*.29+variation, .29+rock*.16+variation, .14+rock*.25+variation)
    colors.data[i].color = (*[v*(1-haze)+(.53,.60,.60)[j]*haze for j,v in enumerate(col)],1)
for poly in terrain.data.polygons:
    poly.use_smooth = True
attr = land.node_tree.nodes.new('ShaderNodeVertexColor')
attr.layer_name = 'LandscapeColor'
land.node_tree.links.new(attr.outputs['Color'], land.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

# Solid parapet corresponds exactly to the existing four perimeter colliders.
# North leaves an eight metre opening for Omega -> Manantial.
segments = [('West',(-17.82,.36,0),(.42,.78,29.3)),('East',(17.82,.36,0),(.42,.78,29.3)),
            ('South',(0,.36,-14.82),(36.4,.78,.42)),
            ('NorthWest',(-11,.36,14.82),(14,.78,.42)),('NorthEast',(11,.36,14.82),(14,.78,.42))]
for name,pos,size in segments:
    box('Parapet'+name,pos,size,stone)
    box('ParapetCap'+name,(pos[0],.79,pos[2]),(size[0]+.10,.14,size[2]+.10),dark)
    box('RetainingFoot'+name,(pos[0],-.85,pos[2]),(size[0]+.06,1.75,size[2]+.06),dark)
for side in [-1,1]:
    for z in [-13,-8.7,-4.4,0,4.4,8.7,13]:
        box('PerimeterPier',(side*17.82,.47,z),(.54,.97,.62),stone)
        box('PerimeterPierCap',(side*17.82,.99,z),(.64,.12,.73),dark)
    # Raised earth gardens immediately outside the solid perimeter.
    box('GardenOuterRetainer',(side*20.8,-.63,0),(.32,.8,29.6),stone)
    box('GardenSoil',(side*19.35,-.36,0),(2.55,.16,29.6),soil,0)
    for z in [-14.6,14.6]:
        box('GardenEnd',(side*19.35,-.6,z),(2.6,.85,.3),stone)
    for x in [5,9,13,17]:
        box('SouthPier',(side*x,.47,-14.82),(.62,.97,.54),stone)
        box('SouthPierCap',(side*x,.99,-14.82),(.73,.12,.64),dark)

# Background civic volumes are behind the collision boundary, intentionally
# shuttered and without doors/quests. They share the Workshop material grammar.
def house(name,x,z,width,depth,height):
    base = ground_y(x,z)-.18
    # A level civic floor needs a foundation that reaches the lowest corner
    # of the sloped support, rather than a shallow box floating on its centre.
    bottom = min(ground_y(x+sx*width/2,z+sz*depth/2) for sx in [-1,0,1] for sz in [-1,0,1])-.3
    top = base+.8
    box(name+'Foot',(x,(top+bottom)/2,z),(width+.22,top-bottom,depth+.22),dark)
    box(name+'Walls',(x,base+height/2,z),(width,height,depth),plaster)
    eave, ridge = base+height, base+height+1.25
    w,d=width/2+.38,depth/2+.38
    mesh_object(name+'HippedRoof',[(x-w,eave,z-d),(x+w,eave,z-d),(x+w,eave,z+d),(x-w,eave,z+d),
                                 (x-width*.27,ridge,z),(x+width*.27,ridge,z)],
                [(0,4,5,1),(1,5,2),(2,5,4,3),(3,4,0)],roof)
    for sign in [-1,1]:
        box(name+'Cornice',(x,eave-.1,z+sign*(depth/2+.04)),(width+.22,.24,.25),stone)
        for offset in [-depth*.23,depth*.23]:
            wx,wz=x+sign*(width/2+.025),z+offset
            box(name+'SideRecess',(wx,base+height*.55,wz),(.13,1.46,1.02),dark,.06)
            box(name+'SideShutter',(wx+sign*.08,base+height*.55,wz),(.08,1.2,.78),wood,.015)
            box(name+'SideSill',(wx+sign*.08,base+height*.55-.76,wz),(.3,.14,1.17),stone)
            box(name+'SideMullion',(wx+sign*.14,base+height*.55,wz),(.05,1.21,.07),dark,.005)
        for offset in [-width*.29,0,width*.29]:
            wx,wz=x+offset,z+sign*(depth/2+.025)
            box(name+'WindowRecess',(wx,base+height*.55,wz),(1.02,1.46,.13),dark,.06)
            box(name+'ClosedShutter',(wx,base+height*.55,wz+sign*.08),(.78,1.2,.08),wood,.015)
            box(name+'Sill',(wx,base+height*.55-.76,wz+sign*.08),(1.17,.14,.3),stone)
            box(name+'WindowMullion',(wx,base+height*.55,wz+sign*.14),(.07,1.21,.05),dark,.005)
    box(name+'Chimney',(x+width*.24,ridge-.05,z+.3),(.52,1.45,.62),dark)
    box(name+'ChimneyCap',(x+width*.24,ridge+.7,z+.3),(.72,.13,.82),stone)

for args in [('WestCourt',-26,6,9,6,4.4),('WestRear',-27,-10,7,6,3.5),
             ('EastCourt',27,0,10,6,4.1),('EastRear',28,13,7,6,3.8),
             ('SouthWest',-13,-25,8,6,4.0),('SouthEast',12,-25,9,6,3.5)]:
    house(*args)

# Merge static mesh parts by material. Ground is kept separate for culling and
# castShadows=false; five remaining surfaces amortize architecture draw calls.
for mat in [stone,dark,plaster,roof,wood,soil]:
    objects = [o for o in bpy.context.scene.objects if o.type=='MESH' and o != terrain and o.data.materials and o.data.materials[0]==mat]
    if not objects:
        continue
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    obj=bpy.context.object
    obj.name=mat.name+'Assembly'
    bpy.context.scene.cursor.location=(0,0,0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    obj.select_set(False)
for obj in list(bpy.context.scene.objects):
    if obj.type=='MESH':
        bpy.context.view_layer.objects.active=obj
        mod=obj.modifiers.new('DeliveryTriangles','TRIANGULATE')
        bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'plaza-surroundings.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'plaza-surroundings.glb'),export_format='GLB',
    export_yup=True,export_tangents=True,export_cameras=False,export_lights=False)
print('OUTPUT',OUT/'plaza-surroundings.glb')
