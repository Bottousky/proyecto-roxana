"""Render focused control views from the already-built Instituto Roxana blend.

Usage:
  blender --background assets/school3d/instituto-roxana.blend \
    --python scripts/blender/render_room_previews.py

This script never rebuilds geometry. It replaces the baked vertex-colour
material with an unlit preview material, matches the Three.js presentation and
renders only the production rooms currently under review.
"""

from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "school3d"
BAKE_ATTR = "RXBake"


def point_at(obj, target):
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def install_unlit_baked_material():
    material = bpy.data.materials.get("RX_room_preview")
    if material is None:
        material = bpy.data.materials.new("RX_room_preview")
        material.use_nodes = True
        tree = material.node_tree
        for node in list(tree.nodes):
            if node.type != "OUTPUT_MATERIAL":
                tree.nodes.remove(node)
        output = tree.nodes["Material Output"]
        emission = tree.nodes.new("ShaderNodeEmission")
        colours = tree.nodes.new("ShaderNodeVertexColor")
        colours.layer_name = BAKE_ATTR
        tree.links.new(colours.outputs["Color"], emission.inputs["Color"])
        tree.links.new(emission.outputs["Emission"], output.inputs["Surface"])

    for obj in [candidate for candidate in bpy.data.objects if candidate.type == "MESH"]:
        obj.data.materials.clear()
        obj.data.materials.append(material)


def set_room_visibility(visible_ids, visible_npc_prefixes):
    visible_names = {f"ROOM_{room_id}" for room_id in visible_ids}
    for obj in bpy.data.objects:
        if obj.name.startswith("ROOM_"):
            room_name = obj.name.split("__", 1)[0]
            hidden = room_name not in visible_names
            obj.hide_render = hidden
            obj.hide_set(hidden)
        elif obj.name.startswith("NPC_"):
            hidden = not any(obj.name.startswith(prefix) for prefix in visible_npc_prefixes)
            obj.hide_render = hidden
            obj.hide_set(hidden)
    bpy.context.view_layer.update()


def render_room(camera, filename, target, location, ortho_scale, visible_ids, visible_npc_prefixes):
    set_room_visibility(visible_ids, visible_npc_prefixes)
    camera.location = location
    camera.data.ortho_scale = ortho_scale
    point_at(camera, Vector(target))
    scene = bpy.context.scene
    scene.render.filepath = str(OUT / filename)
    bpy.ops.render.render(write_still=True)
    print(f"[roxana:room-preview] {filename}", flush=True)


scene = bpy.context.scene
for light in [obj for obj in bpy.data.objects if obj.type == "LIGHT"]:
    bpy.data.objects.remove(light, do_unlink=True)

install_unlit_baked_material()

try:
    scene.render.engine = "BLENDER_EEVEE_NEXT"
except TypeError:
    scene.render.engine = "BLENDER_EEVEE"

scene.render.resolution_x = 1400
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.film_transparent = False
scene.world.use_nodes = True
background = scene.world.node_tree.nodes.get("Background")
background.inputs["Color"].default_value = (.025, .028, .035, 1)
background.inputs["Strength"].default_value = 0.0
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"

camera = scene.camera
if camera is None:
    bpy.ops.object.camera_add()
    camera = bpy.context.object
    scene.camera = camera
camera.data.type = "ORTHO"

render_room(
    camera,
    "hall-production-preview.png",
    (0.0, 4.0, 1.25),
    (0.0, -16.0, 14.0),
    22.5,
    {"hall", "direccion"},
    {"NPC_student_hall_"},
)
render_room(
    camera,
    "electronics-production-preview.png",
    (-17.0, 2.15, 1.35),
    (-17.0, -11.8, 11.5),
    14.2,
    {"electronica"},
    set(),
)
