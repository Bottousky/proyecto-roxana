"""Re-export the six locally authored masters with explicit tangent space.

Requires build-ohmdal-community-characters.py and add-edda-instrument-action.py
to have produced their masters. No download, source material or rig changes.
"""
from pathlib import Path
import bpy

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/source/ohmdal/characters'
OUT = ROOT / 'assets/runtime/ohmdal/characters'
for name in ('edda', 'lumen', 'consejera', 'yesca', 'vega', 'nereo'):
    master = SOURCE / ('edda-operation.blend' if name == 'edda' else f'{name}.blend')
    if not master.is_file():
        raise FileNotFoundError(f'Author the master first: {master}')
    bpy.ops.wm.open_mainfile(filepath=str(master))
    bpy.ops.object.select_all(action='DESELECT')
    rig = next(obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE')
    for obj in bpy.context.scene.objects:
        if obj.type in ('MESH', 'ARMATURE'):
            obj.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(
        filepath=str(OUT / f'{name}.glb'), export_format='GLB', use_selection=True,
        export_animations=True, export_animation_mode='NLA_TRACKS',
        export_nla_strips=True, export_force_sampling=False, export_apply=False,
        export_tangents=True,
    )
    print('CHARACTER_TANGENTS_EXPORTED', name, (OUT / f'{name}.glb').stat().st_size)
