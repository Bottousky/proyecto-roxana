"""Reproducible CC0 character candidates for Ohmdal. Run with Blender --background --factory-startup --python.
Requires the two vendor Standard archives documented in community-characters.provenance.md.
"""
import bpy, bmesh, math, json, shutil
from pathlib import Path
from mathutils import Matrix, Vector
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'assets/source/vendor/quaternius/universal-base-characters/standard/Universal Base Characters[Standard]'
OUTFIT=ROOT/'assets/source/vendor/quaternius/modular-character-outfits-fantasy/standard/Modular Character Outfits - Fantasy[Standard]'
OUT=ROOT/'assets/runtime/ohmdal/characters'
SOURCE=ROOT/'assets/source/ohmdal/characters'
OUT.mkdir(parents=True,exist_ok=True);SOURCE.mkdir(parents=True,exist_ok=True)
SPECS=[
 ('edda','Female','Ranger','Long',(0.09,0.012,0.018),(0.075,0.018,0.007)),
 ('lumen','Male','Ranger','SimpleParted',(0.055,0.095,0.15),(0.65,0.66,0.62)),
 ('consejera','Female','Ranger','Buns',(0.18,0.075,0.095),(0.045,0.023,0.025)),
 ('yesca','Female','Peasant','Buns',(0.21,0.105,0.055),(0.065,0.026,0.014)),
 ('vega','Female','Peasant','SimpleParted',(0.15,0.19,0.095),(0.23,0.23,0.20)),
 ('nereo','Male','Ranger','SimpleParted',(0.055,0.12,0.14),(0.48,0.47,0.41)),
]
def mat(name,color,metal=0,rough=.8):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 return m

def imp(path):
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(path));return [o for o in bpy.data.objects if o not in before and o.type in ['MESH','ARMATURE'] and o.name.split('.')[0]!='Icosphere']

def bind(obj,rig):
 obj.parent=rig;obj.matrix_parent_inverse=Matrix.Identity(4)
 for mod in obj.modifiers:
  if mod.type=='ARMATURE':mod.object=rig

def bone_parent(obj,rig,name='Head'):
 world=obj.matrix_world.copy();obj.parent=rig;obj.parent_type='BONE';obj.parent_bone=name;obj.matrix_world=world

def curve(name,coords,radius,material,rig):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=radius;c.bevel_resolution=2
 sp=c.splines.new('POLY');sp.points.add(len(coords)-1)
 for p,co in zip(sp.points,coords):p.co=(*co,1)
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(material);bone_parent(o,rig);return o

for name,sex,outfit,hair,color,hair_color in SPECS:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 imported=imp(OUTFIT/f'Exports/glTF (Godot-Unreal)/Outfits/{sex}_{outfit}.gltf')
 rig=next(o for o in imported if o.type=='ARMATURE');rig.name='CharacterRig'
 cloth=mat('OhmdalCloth',color);leather=mat('OhmdalLeather',(.085,.043,.022));brass=mat('OhmdalBrass',(.5,.29,.095),.55,.35);hairmat=mat('OhmdalHair',hair_color)
 for o in imported:
  if o.type!='MESH':continue
  if any(s in o.name for s in ['Head_Hood','Pauldrons','Pauldron','Belt_2']):bpy.data.objects.remove(o,do_unlink=True);continue
  # Preserve hand/forearm skin textures. Garment surfaces use the Ohmdal palette.
  if 'Arms' not in o.name or 'Bracer' in o.name:
   o.data.materials.clear();o.data.materials.append(leather if any(s in o.name for s in ['Feet','Legs','Belt','Bracer']) else cloth)
  else:
   for i,m in enumerate(o.data.materials):
    if m and outfit in m.name:o.data.materials[i]=cloth
 # The vendor glTF has a filename typo for the eye normal map.
 eye_folder=BASE/'Base Characters/Godot - UE'
 if not (eye_folder/'T_Eye_Normal_png.png').exists():
  shutil.copy2(BASE/'Base Characters/Textures/T_Eye_Normal.png',eye_folder/'T_Eye_Normal_png.png')
 base=imp(BASE/f'Base Characters/Godot - UE/Superhero_{sex}_FullBody.gltf')
 for o in base:
  if o.type!='MESH':continue
  if 'Super' in o.name:
   bm=bmesh.new();bm.from_mesh(o.data)
   bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z<1.465],context='VERTS');bm.to_mesh(o.data);bm.free();o.name='CharacterFace'
  bind(o,rig)
 for o in base:
  if o.type=='ARMATURE':bpy.data.objects.remove(o,do_unlink=True)
 hairfiles=[f'Hair_{hair}']+(['Hair_Beard'] if name in ['lumen','nereo'] else [])
 for hf in hairfiles:
  parts=imp(BASE/f'Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)/{hf}.gltf')
  for o in parts:
   if o.type=='MESH':
    bind(o,rig);o.data.materials.clear();o.data.materials.append(hairmat)
  for o in parts:
   if o.type=='ARMATURE':bpy.data.objects.remove(o,do_unlink=True)
 # Retain visible identity details: round reading glasses / forehead work goggles.
 if name in ['lumen','yesca']:
  z=1.642 if name=='lumen' else 1.735
  y=-.094 if name=='lumen' else -.035
  for x in [-.037,.037]:
   coords=[(x+.032*math.cos(t*math.tau/24),y,z+.029*math.sin(t*math.tau/24)) for t in range(25)]
   curve('ReadingGlasses' if name=='lumen' else 'WorkGoggles',coords,.004,brass,rig)
  curve('GlassesBridge',[(-.01,y,z),(.01,y,z)],.003,brass,rig)
 if name=='edda':
  # A single braid over the right shoulder follows her existing portrait.
  for strand in range(3):
   coords=[(.115+.013*math.cos(i*.72+strand*math.tau/3),-.095+.009*math.sin(i*.72+strand*math.tau/3),1.67-i*.012) for i in range(28)]
   curve('EddaBraid',coords,.015,hairmat,rig)
 # Pose in armature space around each shoulder, then derive local rotations.
 for bone,angle in [('upperarm_l',74),('upperarm_r',-74)]:
  p=rig.pose.bones[bone];h=p.head.copy();p.matrix=Matrix.Translation(h) @ Matrix.Rotation(math.radians(angle),4,'Y') @ Matrix.Translation(-h) @ p.matrix
 bpy.context.view_layer.update()
 rest={p.name:p.matrix_basis.copy() for p in rig.pose.bones}
 # Five authored, small actions. No retargeting to a different hierarchy.
 for action_name,head_angle,arm_angle in [('Idle',2,1),('Observe',9,3),('Explain',-3,18),('Record',12,26),('Listen',-5,4)]:
  action=bpy.data.actions.new(action_name);rig.animation_data_create();rig.animation_data.action=action
  for frame,factor in [(1,0),(60,1),(120,0)]:
   for bone in ['Head','upperarm_l','upperarm_r']:
    p=rig.pose.bones[bone];p.rotation_mode='QUATERNION';p.matrix_basis=rest[bone]
    axis='X' if bone=='Head' else 'Z';delta=head_angle if bone=='Head' else arm_angle*(1 if bone.endswith('_l') else -1)
    p.matrix_basis=p.matrix_basis @ Matrix.Rotation(math.radians(delta)*factor,4,axis)
    p.keyframe_insert(data_path='rotation_quaternion',frame=frame)
  track=rig.animation_data.nla_tracks.new();track.name=action_name;track.strips.new(action_name,1,action)
 rig.animation_data.action=None
 for track in rig.animation_data.nla_tracks:track.mute=True
 for p in rig.pose.bones:p.matrix_basis=rest[p.name]
 bpy.context.scene.frame_start=1;bpy.context.scene.frame_end=120
 # Remove importer custom-bone shapes; they are editor helpers, never runtime geometry.
 for o in list(bpy.data.objects):
  if o.name.split('.')[0]=='Icosphere':bpy.data.objects.remove(o,do_unlink=True)
 # Only render assets and the shared rig are selected for export.
 bpy.ops.object.select_all(action='DESELECT')
 for o in bpy.context.scene.objects:
  if o.type in ['MESH','CURVE','ARMATURE']:o.select_set(True)
 bpy.context.view_layer.objects.active=rig
 # Export curves as ordinary mesh accessories.
 for o in list(bpy.context.selected_objects):
  if o.type=='CURVE':
   bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
 bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=rig
 # Share embedded images, downsample only for the mobile delivery budget.
 texture_out=SOURCE/'textures';texture_out.mkdir(exist_ok=True)
 for im in list(bpy.data.images):
  # glTF imports image datablocks lazily. Read one pixel to load before sizing.
  if im.source=='FILE':
   try: _=im.pixels[0]
   except (IndexError,RuntimeError):continue
  if not im.size[0]:continue
  limit=256 if 'Normal' in im.name or 'Roughness' in im.name or 'ORM' in im.name else 512
  if im.size[0]>limit or im.size[1]>limit:
   ratio=min(limit/im.size[0],limit/im.size[1]);im.scale(round(im.size[0]*ratio),round(im.size[1]*ratio))
  # Blender's glTF exporter can reuse original file bytes unless a changed image is saved.
  im.filepath_raw=str(texture_out/f'{name}-{im.name}.png');im.file_format='PNG';im.save()
  delivery=bpy.data.images.load(im.filepath_raw,check_existing=False)
  delivery.colorspace_settings.name=im.colorspace_settings.name
  for material in bpy.data.materials:
   if material.use_nodes:
    for node in material.node_tree.nodes:
     if node.type=='TEX_IMAGE' and node.image==im:node.image=delivery
 bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/f'{name}.blend'))
 candidate=SOURCE/f'{name}-delivery.glb'
 bpy.ops.export_scene.gltf(filepath=str(candidate),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True,export_force_sampling=False,export_apply=False,export_tangents=True)
 shutil.copyfile(candidate,OUT/f'{name}.glb')
 print('OHMDAL_CHARACTER',name,(OUT/f'{name}.glb').stat().st_size)
