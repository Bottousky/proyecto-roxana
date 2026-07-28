"""Render protected multi-angle validation views from the baked master scene.

Usage:
  blender instituto-roxana.blend --background --python render_school_validation.py
"""

from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "artifacts" / "validation"
OUT.mkdir(parents=True, exist_ok=True)
BAKE_ATTR = "RXBake"


def point_at(obj, target):
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


scene = bpy.context.scene
for light in [obj for obj in bpy.data.objects if obj.type == "LIGHT"]:
    bpy.data.objects.remove(light, do_unlink=True)

scene.world.use_nodes = True
background = scene.world.node_tree.nodes.get("Background")
background.inputs["Color"].default_value = (.018, .026, .052, 1)
background.inputs["Strength"].default_value = .25

try:
    scene.render.engine = "BLENDER_EEVEE_NEXT"
except TypeError:
    scene.render.engine = "BLENDER_EEVEE"

unlit = bpy.data.materials.new("RX_validation_unlit")
unlit.use_nodes = True
tree = unlit.node_tree
for node in list(tree.nodes):
    if node.type != "OUTPUT_MATERIAL":
        tree.nodes.remove(node)
output = tree.nodes["Material Output"]
emission = tree.nodes.new("ShaderNodeEmission")
attribute = tree.nodes.new("ShaderNodeVertexColor")
attribute.layer_name = BAKE_ATTR
tree.links.new(attribute.outputs["Color"], emission.inputs["Color"])
tree.links.new(emission.outputs["Emission"], output.inputs["Surface"])
for obj in [candidate for candidate in bpy.data.objects if candidate.type == "MESH"]:
    obj.data.materials.clear()
    obj.data.materials.append(unlit)

camera = scene.camera
camera.data.type = "ORTHO"
camera.data.ortho_scale = 48
scene.render.resolution_x = 1400
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"

target = Vector((0, 0, 1.6))
views = {
    "school-angle-front": (0, -64, 37),
    "school-angle-left": (-24, -58, 39),
    "school-angle-right": (24, -58, 39),
}
for name, position in views.items():
    camera.location = position
    point_at(camera, target)
    scene.render.filepath = str(OUT / f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print(f"[roxana:validation] {name}.png", flush=True)

# Orthographic audit view: walls that merely look aligned in perspective must
# also coincide when projected directly onto the plan grid.
camera.location = (0, 0, 72)
camera.data.ortho_scale = 52
point_at(camera, Vector((0, 0, 0)))
scene.render.resolution_x = 1400
scene.render.resolution_y = 1000
scene.render.filepath = str(OUT / "school-angle-top.png")
bpy.ops.render.render(write_still=True)
print("[roxana:validation] school-angle-top.png", flush=True)
