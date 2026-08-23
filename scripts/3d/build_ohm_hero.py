"""Build the project-owned Ohm + pedestal hero in Blender.

Authority: assets/ohmdal/characters/ohm-turnaround-v2.png and
assets/references/ohmdal-hd2d-preprod/ohm-original-spec.md.
This is a deterministic manual/procedural reconstruction; it does not call a
generative provider and intentionally adds no design features absent from the
approved turnaround.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
import mathutils


ROOT = Path(__file__).resolve().parents[2]
BLEND_PATH = ROOT / "assets/source/ohmdal/heroes/ohm/ohm-pedestal.blend"
GLB_PATH = ROOT / "assets/runtime/ohmdal/plaza/heroes/ohm/ohm-pedestal.glb"
PREVIEW_PATH = ROOT / "output/blender/ohm-pedestal/candidate-01.png"


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def material(name: str, base: tuple[float, float, float, float], metallic: float, roughness: float):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = base
    mat.use_nodes = True
    mat.use_backface_culling = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = base
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def finish_mesh(obj: bpy.types.Object, mat: bpy.types.Material, group: str, bevel: float = 0.0) -> bpy.types.Object:
    obj.data.materials.append(mat)
    obj["roxana_group"] = group
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        modifier = obj.modifiers.new(name="RuntimeBevel", type="BEVEL")
        modifier.width = bevel
        modifier.segments = 2
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    obj.select_set(False)
    return obj


def uv_sphere(name: str, location, scale, mat, group, segments: int = 24, rings: int = 12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    return finish_mesh(obj, mat, group)


def cylinder(name: str, location, radius: float, depth: float, mat, group, rotation=(0.0, 0.0, 0.0), vertices: int = 32, bevel: float = 0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    return finish_mesh(obj, mat, group, bevel)


def beveled_cube(name: str, location, scale, mat, group, bevel: float):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (scale[0] / 2, scale[1] / 2, scale[2] / 2)
    return finish_mesh(obj, mat, group, bevel)


def torus(name: str, location, major_radius: float, minor_radius: float, mat, group, rotation=(0.0, 0.0, 0.0)):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=32,
        minor_segments=8,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    return finish_mesh(obj, mat, group)


def text_mesh(name: str, text: str, location, size: float, depth: float, mat, group):
    bpy.ops.object.text_add(location=location, rotation=(math.radians(90), 0.0, 0.0))
    obj = bpy.context.object
    obj.name = name
    obj.data.body = text
    obj.data.align_x = "CENTER"
    obj.data.align_y = "CENTER"
    obj.data.size = size
    obj.data.extrude = depth
    obj.data.bevel_depth = 0.003
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj = bpy.context.object
    return finish_mesh(obj, mat, group)


def join_group(group: str, name: str, parent: bpy.types.Object) -> bpy.types.Object:
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH" and obj.get("roxana_group") == group]
    if not objects:
        raise RuntimeError(f"No objects in group {group}")
    if len(objects) == 1:
        joined = objects[0]
    else:
        bpy.ops.object.select_all(action="DESELECT")
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objects[0]
        bpy.ops.object.join()
        joined = bpy.context.object
    joined.name = name
    joined.parent = parent
    joined["roxana_group"] = group
    return joined


def empty(name: str, parent: bpy.types.Object | None = None, location=(0.0, 0.0, 0.0)) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 0.08
    obj.location = location
    obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    return obj


def point_camera(camera: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = mathutils.Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render_preview() -> None:
    PREVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    scene.render.resolution_x = 800
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(PREVIEW_PATH)
    scene.render.film_transparent = False
    scene.world.color = (0.025, 0.02, 0.018)

    floor_mat = material("PreviewFloor", (0.16, 0.13, 0.1, 1.0), 0.0, 0.78)
    bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, -0.002))
    floor = bpy.context.object
    floor.data.materials.append(floor_mat)

    bpy.ops.object.camera_add(location=(2.2, -3.35, 2.05))
    camera = bpy.context.object
    camera.data.lens = 62
    point_camera(camera, (0, 0, 0.72))
    scene.camera = camera

    for name, location, energy, color, size in (
        ("PreviewKey", (-2.8, -3.4, 4.2), 850, (1.0, 0.72, 0.48), 3.2),
        ("PreviewFill", (3.0, -1.0, 2.2), 520, (0.42, 0.65, 1.0), 2.6),
        ("PreviewRim", (0.0, 3.0, 3.4), 760, (0.55, 0.76, 1.0), 2.4),
    ):
        light_data = bpy.data.lights.new(name=name, type="AREA")
        light_data.energy = energy
        light_data.color = color
        light_data.shape = "DISK"
        light_data.size = size
        light = bpy.data.objects.new(name, light_data)
        light.location = location
        point_camera(light, (0, 0, 0.7))
        scene.collection.objects.link(light)

    bpy.ops.render.render(write_still=True)


def build() -> None:
    clear_scene()
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.render.engine = "BLENDER_EEVEE"

    copper = material("Ohm_AgedCopper", (0.52, 0.19, 0.055, 1.0), 0.58, 0.34)
    copper_trim = material("Ohm_CopperTrim", (0.82, 0.43, 0.09, 1.0), 0.66, 0.25)
    dark_metal = material("Ohm_DarkMetal", (0.055, 0.045, 0.036, 1.0), 0.42, 0.43)
    ceramic = material("Ohm_TurquoiseCeramic", (0.03, 0.48, 0.45, 1.0), 0.06, 0.2)
    stone = material("Pedestal_PaleStone", (0.49, 0.43, 0.35, 1.0), 0.0, 0.72)

    root = empty("OhmPedestalHero")
    root["asset_id"] = "rx_ohm_pedestal_hero_01"
    root["unit"] = "meter"
    root["front_axis"] = "+Z"
    root["source_reference"] = "assets/ohmdal/characters/ohm-turnaround-v2.png"
    pedestal_root = empty("PedestalRoot", root)
    ohm_root = empty("OhmRoot", root)

    # Pedestal: a grounded civic circuit plinth, not a fantasy throne.
    cylinder("PedestalLower", (0, 0, 0.09), 0.58, 0.18, dark_metal, "pedestal_dark", vertices=48, bevel=0.025)
    cylinder("PedestalStone", (0, 0, 0.235), 0.51, 0.16, stone, "pedestal_stone", vertices=48, bevel=0.018)
    cylinder("PedestalCopperBand", (0, 0, 0.34), 0.47, 0.07, copper_trim, "pedestal_copper", vertices=48, bevel=0.012)
    cylinder("PedestalTop", (0, 0, 0.405), 0.4, 0.07, dark_metal, "pedestal_dark", vertices=48, bevel=0.012)
    for side in (-1, 1):
        cylinder(
            f"PedestalTerminal_{side}",
            (side * 0.28, -0.39, 0.31),
            0.075,
            0.12,
            ceramic,
            "pedestal_ceramic",
            rotation=(math.radians(90), 0, 0),
            vertices=24,
            bevel=0.008,
        )
        cylinder(
            f"PedestalContact_{side}",
            (side * 0.28, -0.458, 0.31),
            0.045,
            0.018,
            copper_trim,
            "pedestal_copper",
            rotation=(math.radians(90), 0, 0),
            vertices=24,
        )

    ohm_floor = 0.44

    # Feet and stable low base from the approved four-view turnaround.
    for side in (-1, 1):
        beveled_cube(
            f"Foot_{side}",
            (side * 0.185, -0.035, ohm_floor + 0.065),
            (0.26, 0.34, 0.13),
            copper_trim,
            "ohm_trim",
            0.045,
        )
        beveled_cube(
            f"FootSole_{side}",
            (side * 0.185, -0.055, ohm_floor + 0.015),
            (0.28, 0.36, 0.035),
            dark_metal,
            "ohm_dark",
            0.01,
        )

    # Egg/canister body, 1.03 m from feet to sensor cap.
    uv_sphere("BodyShell", (0, 0, ohm_floor + 0.52), (0.37, 0.32, 0.43), copper, "ohm_copper", 32, 16)
    cylinder("LowerCollar", (0, 0, ohm_floor + 0.16), 0.265, 0.08, dark_metal, "ohm_dark", vertices=32, bevel=0.012)
    torus("UpperHatchSeam", (0, 0, ohm_floor + 0.82), 0.245, 0.018, copper_trim, "ohm_trim")
    cylinder("HatchRing", (0, 0, ohm_floor + 0.86), 0.17, 0.07, copper_trim, "ohm_trim", vertices=32, bevel=0.012)
    uv_sphere("EmitterDome", (0, 0, ohm_floor + 0.965), (0.13, 0.115, 0.065), ceramic, "ohm_ceramic", 24, 10)
    cylinder("EmitterBezel", (0, 0, ohm_floor + 0.91), 0.14, 0.035, dark_metal, "ohm_dark", vertices=32, bevel=0.007)

    # Twin front visors. Blender -Y maps to the authored glTF +Z front.
    for side in (-1, 1):
        x = side * 0.145
        cylinder(
            f"EyeBezel_{side}",
            (x, -0.294, ohm_floor + 0.61),
            0.115,
            0.055,
            dark_metal,
            "ohm_dark",
            rotation=(math.radians(90), 0, 0),
            vertices=32,
            bevel=0.009,
        )
        cylinder(
            f"EyeTrim_{side}",
            (x, -0.327, ohm_floor + 0.61),
            0.09,
            0.025,
            copper_trim,
            "ohm_trim",
            rotation=(math.radians(90), 0, 0),
            vertices=32,
            bevel=0.006,
        )
        uv_sphere(
            f"EyeLens_{side}",
            (x, -0.349, ohm_floor + 0.61),
            (0.069, 0.026, 0.069),
            ceramic,
            "ohm_ceramic",
            24,
            10,
        )

    # Side sensor housings read as the compact arm/sensor mounts in the sprite.
    for side in (-1, 1):
        rotation = (0, math.radians(90), 0)
        cylinder(f"SideSensorBezel_{side}", (side * 0.355, 0, ohm_floor + 0.45), 0.15, 0.085, dark_metal, "ohm_dark", rotation, 32, 0.01)
        cylinder(f"SideSensorShell_{side}", (side * 0.394, 0, ohm_floor + 0.45), 0.125, 0.07, copper_trim, "ohm_trim", rotation, 32, 0.01)
        cylinder(f"SideSensorLens_{side}", (side * 0.433, 0, ohm_floor + 0.45), 0.055, 0.018, ceramic, "ohm_ceramic", rotation, 24)

    text_mesh("OmegaMark", "Ω", (0, -0.324, ohm_floor + 0.345), 0.205, 0.008, ceramic, "ohm_ceramic")

    # Sparse fasteners preserve the manufactured reading without noisy greeble.
    body_center_z = ohm_floor + 0.52
    for x in (-0.245, 0.245):
        for z in (ohm_floor + 0.32, ohm_floor + 0.79):
            radial = max(0.0, 1.0 - (x / 0.37) ** 2 - ((z - body_center_z) / 0.43) ** 2)
            surface_y = -0.32 * math.sqrt(radial) - 0.008
            uv_sphere(f"Fastener_{x}_{z}", (x, surface_y, z), (0.018, 0.012, 0.018), dark_metal, "ohm_dark", 12, 6)

    join_group("pedestal_dark", "Pedestal_DarkMetal", pedestal_root)
    join_group("pedestal_stone", "Pedestal_Stone", pedestal_root)
    join_group("pedestal_copper", "Pedestal_Copper", pedestal_root)
    join_group("pedestal_ceramic", "Pedestal_Ceramic", pedestal_root)
    join_group("ohm_copper", "Ohm_CopperShell", ohm_root)
    join_group("ohm_trim", "Ohm_CopperTrim", ohm_root)
    join_group("ohm_dark", "Ohm_DarkMetal", ohm_root)
    join_group("ohm_ceramic", "Ohm_CeramicSensors", ohm_root)

    empty("sensor_mount", ohm_root, (0, 0, ohm_floor + 0.98))
    empty("arm_left", ohm_root, (-0.43, 0, ohm_floor + 0.45))
    empty("arm_right", ohm_root, (0.43, 0, ohm_floor + 0.45))
    empty("hatch_top", ohm_root, (0, 0, ohm_floor + 0.9))
    empty("emitter_front", ohm_root, (0, -0.37, ohm_floor + 0.35))

    # Export only the semantic hero hierarchy. Runtime collision remains owned
    # by the existing gameplay collider, so no duplicate collision mesh ships.
    bpy.ops.object.select_all(action="DESELECT")
    for obj in [root, *root.children_recursive]:
        obj.select_set(True)

    BLEND_PATH.parent.mkdir(parents=True, exist_ok=True)
    GLB_PATH.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    bpy.ops.export_scene.gltf(
        filepath=str(GLB_PATH),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_extras=True,
        export_cameras=False,
        export_lights=False,
        export_materials="EXPORT",
        export_texcoords=True,
        export_normals=True,
        export_tangents=False,
    )
    render_preview()
    print(f"BLEND={BLEND_PATH}")
    print(f"GLB={GLB_PATH}")
    print(f"PREVIEW={PREVIEW_PATH}")


if __name__ == "__main__":
    try:
        build()
    except Exception as exc:
        print(f"OHM_BUILD_ERROR: {exc}", file=sys.stderr)
        raise
