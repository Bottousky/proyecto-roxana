"""Curated CC0 Quaternius planting: five source models, static Plaza assembly.

Only Standard assets are used. Bark is simplified; leaf silhouettes and alpha
cards stay intact. Delivery textures are 512 px copies, never raw pack files.
"""
import bpy
import math
import json
import hashlib
from pathlib import Path
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parents[2]
VENDOR = ROOT/'assets/source/vendor/quaternius/stylized-nature-megakit'
OUT = ROOT/'assets/runtime/ohmdal/plaza/environment'
SOURCE = ROOT/'assets/source/ohmdal/plaza/environment'
OUT.mkdir(parents=True, exist_ok=True)
(SOURCE/'textures').mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
prototypes = {}
calibration = {}

for name in ['CommonTree_1','Pine_1','Bush_Common','Rock_Medium_1','Grass_Common_Short']:
    before=set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=str(VENDOR/'raw/glTF'/f'{name}.gltf'))
    imported=set(bpy.context.scene.objects)-before
    parts=[o for o in imported if o.type=='MESH']
    points=[o.matrix_world@Vector(v.co) for o in parts for v in o.data.vertices]
    low=Vector(tuple(min(v[i] for v in points) for i in range(3)))
    high=Vector(tuple(max(v[i] for v in points) for i in range(3)))
    center=Vector(((low.x+high.x)/2,(low.y+high.y)/2,low.z))
    height=high.z-low.z
    calibration[name]={'source':f'raw/glTF/{name}.gltf','boundsSource':'decoded Blender mesh vertices with node world matrices',
        'min':[low.x,low.z,-high.y], 'max':[high.x,high.z,-low.y],
        'dims':[high.x-low.x,height,high.y-low.y], 'normalization':'centre XZ, base Y=0, height=1; authored instance height sets uniform scale'}
    normalized=[]
    for obj in parts:
        # Bake imported hierarchy without losing its root axis conversion.
        world=obj.matrix_world.copy()
        obj.parent=None
        for vertex in obj.data.vertices:
            vertex.co=(world@vertex.co-center)/height
        obj.matrix_world=Matrix.Identity(4)
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active=obj
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.separate(type='MATERIAL')
        bpy.ops.object.mode_set(mode='OBJECT')
        separated=list(bpy.context.selected_objects)
        for part in separated:
            mat=part.data.materials[0]
            if 'Bark' in mat.name:
                bpy.context.view_layer.objects.active=part
                mod=part.modifiers.new('BarkMidgroundLOD','DECIMATE')
                mod.ratio=.28
                bpy.ops.object.modifier_apply(modifier=mod.name)
            normalized.append(part)
    for obj in imported:
        if obj.type!='MESH':
            bpy.data.objects.remove(obj,do_unlink=True)
    prototypes[name]=normalized

def place(name,x,z,height,y=-.42,yaw=0):
    for part in prototypes[name]:
        obj=bpy.data.objects.new(name,part.data.copy())
        bpy.context.collection.objects.link(obj)
        obj.location=(x,-z,y)
        obj.rotation_euler.z=math.radians(-yaw)
        obj.scale=(height,height,height)

# Keep all trunks outside the surveyed 36 x 30 m navigation perimeter.
# Lower shrubs give continuity at eye height without closing landmark sightlines.
for side in [-1,1]:
    for i,z in enumerate([-10,-1,9]):
        place('CommonTree_1',side*21.6,z,5.7+(i%2)*.6,yaw=side*(25+i*53))
    for i,z in enumerate([-12,-8,-4,0,4,8,12]):
        place('Bush_Common',side*19.3,z,.9+(i%3)*.1,y=-.28,yaw=i*37)
        for dz in [-.9,.9]:
            place('Grass_Common_Short',side*(19.2+(i%2)*.25),z+dz,.36,y=-.28,yaw=i*71)
    for i,x in enumerate([9,15]):
        place('Pine_1',side*x,20,6.8+i*.7,yaw=i*63)
    place('Pine_1',side*8,-19.5,6.3,y=-.55,yaw=side*70)
    for i,z in enumerate([-12,-3,6,13]):
        place('Rock_Medium_1',side*22.2,z,1.0+(i%2)*.25,y=-.7,yaw=i*39)

for parts in prototypes.values():
    for part in parts:
        bpy.data.objects.remove(part,do_unlink=True)

# Unify importer-created duplicate materials by their source basename.
materials={}
for obj in list(bpy.context.scene.objects):
    if obj.type!='MESH': continue
    for slot in obj.material_slots:
        key=slot.material.name.split('.')[0]
        if key not in materials: materials[key]=slot.material
        slot.material=materials[key]
for key,mat in materials.items():
    objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0]==mat]
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects: obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    obj=bpy.context.object
    obj.name='PlazaPlanting_'+key
    bpy.context.scene.cursor.location=(0,0,0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    mod=obj.modifiers.new('DeliveryTriangles','TRIANGULATE')
    bpy.ops.object.modifier_apply(modifier=mod.name)

for image in list(bpy.data.images):
    if not image.users or image.source!='FILE': continue
    # Keep the imported raw image intact while producing a fresh delivery
    # datablock. Exporting the scaled source datablock can still make Blender
    # embed its original packed pixels, so every texture node must point at
    # the newly loaded 512 px copy before the GLB export.
    original_colorspace = image.colorspace_settings.name
    original_alpha_mode = image.alpha_mode
    delivery_path = SOURCE/'textures'/(Path(bpy.path.abspath(image.filepath)).stem+'.png')
    image.scale(512,512)
    image.filepath_raw=str(delivery_path)
    image.file_format='PNG'
    image.save()
    delivery_image = bpy.data.images.load(str(delivery_path), check_existing=False)
    delivery_image.colorspace_settings.name = original_colorspace
    delivery_image.alpha_mode = original_alpha_mode
    replaced = 0
    for material in bpy.data.materials:
        if not material.use_nodes or not material.node_tree:
            continue
        for node in material.node_tree.nodes:
            if node.type == 'TEX_IMAGE' and node.image == image:
                node.image = delivery_image
                replaced += 1
    print('DELIVERY_IMAGE', delivery_path, tuple(delivery_image.size), original_colorspace, original_alpha_mode, 'nodes', replaced)
    if image.users == 0:
        bpy.data.images.remove(image)
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'plaza-planting.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'plaza-planting.glb'),export_format='GLB',export_yup=True,
    export_tangents=True,export_cameras=False,export_lights=False)
(OUT/'planting-source-calibration.json').write_text(json.dumps(calibration,indent=2)+'\n',encoding='utf8')
provenance=json.loads((VENDOR/'provenance.json').read_text(encoding='utf-8-sig'))
provenance['selectedModels']=list(prototypes)
provenance['processing']='Blender 5.2: exact source bounds, normalized per model, world-space placement, bark-only decimate 0.28, static join per material, textures 512px, tangent export. No shader/provider dependencies.'
provenance['runtimeFile']='plaza-planting.glb'
provenance['runtimeSha256']=hashlib.sha256((OUT/'plaza-planting.glb').read_bytes()).hexdigest()
(OUT/'planting-provenance.json').write_text(json.dumps(provenance,indent=2)+'\n',encoding='utf8')
(OUT/'License_Quaternius_Standard.txt').write_bytes((VENDOR/'raw/License_Standard.txt').read_bytes())
print('OUTPUT',OUT/'plaza-planting.glb')
