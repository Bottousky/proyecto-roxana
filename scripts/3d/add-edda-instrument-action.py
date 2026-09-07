"""Bake an instrument-reaching action onto the existing grounded Edda rig.
Run after build-ohmdal-community-characters.py with Blender in background mode.
"""
import bpy
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/source/ohmdal/characters'
OUT = ROOT / 'assets/runtime/ohmdal/characters/edda.glb'
bpy.ops.wm.open_mainfile(filepath=str(SOURCE / 'edda.blend'))
rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
bpy.ops.object.select_all(action='DESELECT')
rig.select_set(True)
bpy.context.view_layer.objects.active = rig
rig.animation_data.action = None
for track in rig.animation_data.nla_tracks:
    track.mute = True

target = bpy.data.objects.new('InstrumentReachTarget', None)
bpy.context.collection.objects.link(target)
target.location = rig.matrix_world @ Vector((-0.20, -0.42, 1.15))
constraint = rig.pose.bones['lowerarm_r'].constraints.new('IK')
constraint.target = target
constraint.chain_count = 2
constraint.use_stretch = False
for frame, influence in [(1, 0), (30, 1), (60, 1), (90, 0)]:
    constraint.influence = influence
    constraint.keyframe_insert('influence', frame=frame)
bpy.ops.nla.bake(frame_start=1, frame_end=90, step=1, only_selected=False,
    visual_keying=True, clear_constraints=True, clear_parents=False,
    use_current_action=False, bake_types={'POSE'})
action = rig.animation_data.action
action.name = 'Operate'
track = rig.animation_data.nla_tracks.new()
track.name = 'Operate'
track.strips.new('Operate', 1, action)
track.mute = True
rig.animation_data.action = None
bpy.data.objects.remove(target, do_unlink=True)
bpy.context.scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if obj.type in ('MESH', 'ARMATURE'):
        obj.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE / 'edda-operation.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT), export_format='GLB', use_selection=True,
    export_animations=True, export_animation_mode='NLA_TRACKS', export_nla_strips=True,
    export_force_sampling=False, export_apply=False, export_tangents=True)
print('EDDA_OPERATE_EXPORTED', OUT.stat().st_size)
