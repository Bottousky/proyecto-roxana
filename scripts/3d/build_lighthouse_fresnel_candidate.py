"""Deterministic Fresnel mechanism from the approved Ohmdal reference pack.
Blender front -Y -> glTF +Z. No provider, generated textures or invented symbols.
"""
import bpy
import math
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/source/ohmdal/lighthouse/candidate'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, metal, rough):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    m.diffuse_color = (*color, 1)
    return m

brass = material('Aged brass frame', (.30, .18, .07), .82, .32)
edge = material('Polished brass edges', (.55, .34, .11), .9, .25)
iron = material('Dark steel bearings', (.055, .068, .075), .75, .48)
glass = material('Cold blue optical glass', (.10, .22, .30), .35, .13)
stone = material('Pale stone mounting plinth', (.38, .35, .29), 0, .83)
parts = []

def finish(o, name, mat, bevel=.01, smooth=False):
    o.name = name
    o.data.materials.append(mat)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new('Machined edges', 'BEVEL')
        mod.width = bevel; mod.segments = 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for face in o.data.polygons: face.use_smooth = smooth
    parts.append(o)
    return o

def cylinder(name, pos, radius, depth, mat, vertical=True, bevel=.01, vertices=40):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=pos,
        rotation=(0, 0, 0) if vertical else (math.pi/2, 0, 0))
    return finish(bpy.context.object, name, mat, bevel)

def torus(name, pos, radius, tube, mat, vertical=True):
    bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=tube,
        major_segments=64, minor_segments=8, location=pos,
        rotation=(math.pi/2, 0, 0) if vertical else (0, 0, 0))
    return finish(bpy.context.object, name, mat, 0, True)

def box(name, pos, size, mat, bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    o=bpy.context.object; o.scale=size
    return finish(o, name, mat, bevel)

cylinder('Mounting plinth', (0,0,.12), .56,.24,stone, vertices=12)
cylinder('Lower brass flange',(0,0,.26),.47,.08,brass)
cylinder('Azimuth bearing',(0,0,.37),.30,.16,iron)
torus('Azimuth index rim',(0,0,.42),.34,.045,edge,False)
box('Yoke pedestal',(0,0,.66),(.26,.34,.48),brass)
center=1.52
torus('Outer gimbal',(0,0,center),1.10,.065,brass)
torus('Outer highlight',(0,-.045,center),1.11,.012,edge)
torus('Lens retention ring',(0,-.06,center),.96,.055,iron)
torus('Lens brass bezel',(0,-.12,center),.96,.025,edge)

# Radial Fresnel steps, not a smooth sphere: each facet has its own sloped
# surface and rear riser, catching glints as the player walks around it.
for band in range(7):
    inner=band*.13; outer=(band+1)*.13
    verts=[]; faces=[]; count=64
    for r,y in [(inner,-.17-band*.007),(outer,-.13-band*.007)]:
        for i in range(count):
            a=i*2*math.pi/count
            verts.append((math.cos(a)*r,y,center+math.sin(a)*r))
    for i in range(count):
        j=(i+1)%count
        faces.append((i,j,count+j,count+i))
    mesh=bpy.data.meshes.new(f'Optical band {band}')
    mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(f'Fresnel step {band}',mesh)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(glass); parts.append(o)
    torus(f'Optical retaining ring {band}',(0,-.175-band*.007,center),max(.045,outer),.008,edge)

for i in range(12):
    a=i*math.tau/12
    o=box(f'Radial lens divider {i}',(math.cos(a)*.58,-.205,center+math.sin(a)*.58),(.68,.025,.018),brass,.005)
    o.rotation_euler[1]=-a
for i in range(4):
    a=i*math.pi/2
    x,z=math.cos(a)*1.1, center+math.sin(a)*1.1
    box(f'Gimbal bearing {i}',(x,0,z),(.22,.23,.22),brass)
    cylinder(f'Gimbal bolt {i}',(x,-.14,z),.065,.08,edge,False,vertices=8)
for x in [-.31,.31]:
    box('Pedestal cheek',(x,0,.57),(.12,.34,.26),iron)
    cylinder('Pedestal fastener',(x,-.19,.57),.045,.06,edge,False,vertices=8)

# Join by material while retaining optical surfaces as ordinary geometry.
for mat in [brass,edge,iron,glass,stone]:
    members=[o for o in bpy.context.scene.objects if o.type == 'MESH' and o.data.materials[0]==mat]
    bpy.ops.object.select_all(action='DESELECT')
    for o in members: o.select_set(True)
    bpy.context.view_layer.objects.active=members[0]
    bpy.ops.object.join()
    members[0].name=mat.name
bpy.ops.object.select_all(action='SELECT')
objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
bpy.context.view_layer.update()
points=[o.matrix_world@Vector(c) for o in objects for c in o.bound_box]
mins=[min(v[i] for v in points) for i in range(3)]
maxs=[max(v[i] for v in points) for i in range(3)]
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'fresnel.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'fresnel.glb'),export_format='GLB',use_selection=True,export_animations=False,export_yup=True)
(OUT/'calibration.json').write_text(json.dumps({'frontAxis':'+Z','upAxis':'+Y','height':maxs[2]-mins[2],
    'groundOffset':-mins[2], 'width':maxs[0]-mins[0], 'reference':'assets/ohmdal/rooms/pilot-arco1/prop_lighthouse_lens_off.png'},indent=2))

scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.device='CPU'; scene.cycles.samples=16
scene.render.resolution_x=640; scene.render.resolution_y=640; scene.render.resolution_percentage=100
scene.world.color=(.22,.22,.22)
for pos,energy,size,color in [((-3,-4,5),700,4,(1,.81,.61)),((3,-1,3),450,3,(.62,.78,1)),((1,3,4),800,3,(1,.9,.75))]:
    bpy.ops.object.light_add(type='AREA',location=pos)
    o=bpy.context.object; o.data.energy=energy; o.data.shape='DISK';o.data.size=size;o.data.color=color
    o.rotation_euler=(Vector((0,0,1.3))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(3,-6,3.1))
camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=3.8
camera.rotation_euler=(Vector((0,0,1.3))-camera.location).to_track_quat('-Z','Y').to_euler();scene.camera=camera
scene.render.film_transparent=True
scene.render.filepath=str(OUT/'preview.png');bpy.ops.render.render(write_still=True)
print('FRESNEL_CANDIDATE',str(OUT/'fresnel.glb'))
