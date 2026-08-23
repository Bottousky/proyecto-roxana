"""Build the approved Ohmdal Galvanoscope hero deterministically in Blender.

Authority:
  assets/references/hero-packs/galvanoscope/hero-reference.json
  docs/20-worlds/ohmdal/production/GALVANOSCOPE_CANONICAL_BRIEF.md

The reconstruction is Blender-first and provider-free. Concept lettering and
exact dial scales are deliberately omitted because they are not canonical.
Blender -Y is authored as the visual front and exports to glTF +Z.
"""

from __future__ import annotations

import math
from pathlib import Path

import bpy
import mathutils


ROOT = Path(__file__).resolve().parents[2]
BLEND_PATH = ROOT / "assets/source/ohmdal/heroes/galvanoscope/galvanoscope.blend"
GLB_PATH = ROOT / "assets/runtime/ohmdal/plaza/heroes/galvanoscope/galvanoscope.glb"
PREVIEW_DIR = ROOT / "output/blender/galvanoscope"


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def material(
    name: str,
    base: tuple[float, float, float, float],
    metallic: float,
    roughness: float,
    alpha: float = 1.0,
) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (base[0], base[1], base[2], alpha)
    mat.use_nodes = True
    mat.use_backface_culling = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (base[0], base[1], base[2], alpha)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Alpha"].default_value = alpha
    if alpha < 1.0:
        if hasattr(mat, "surface_render_method"):
            mat.surface_render_method = "DITHERED"
        mat.use_backface_culling = False
    return mat


def finish_mesh(
    obj: bpy.types.Object,
    mat: bpy.types.Material,
    group: str,
    bevel: float = 0.0,
    smooth: bool = True,
) -> bpy.types.Object:
    obj.data.materials.append(mat)
    obj["roxana_group"] = group
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0.0:
        modifier = obj.modifiers.new(name="RuntimeBevel", type="BEVEL")
        modifier.width = bevel
        modifier.segments = 2
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    if smooth:
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    obj.select_set(False)
    return obj


def box(name, location, dimensions, mat, group, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = tuple(value / 2.0 for value in dimensions)
    return finish_mesh(obj, mat, group, bevel, smooth=False)


def cylinder(
    name,
    location,
    radius,
    depth,
    mat,
    group,
    rotation=(0.0, 0.0, 0.0),
    vertices=24,
    bevel=0.0,
):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    return finish_mesh(obj, mat, group, bevel)


def torus(name, location, major_radius, minor_radius, mat, group, rotation=(0.0, 0.0, 0.0)):
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


def cable(name, points, bevel_depth, mat, group):
    curve_data = bpy.data.curves.new(name=f"{name}Curve", type="CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = 2
    curve_data.bevel_depth = bevel_depth
    curve_data.bevel_resolution = 2
    spline = curve_data.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, coordinate in zip(spline.bezier_points, points):
        point.co = coordinate
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve_data)
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj["roxana_group"] = group
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj = bpy.context.object
    obj.name = name
    obj["roxana_group"] = group
    obj.select_set(False)
    return obj


def empty(name: str, parent: bpy.types.Object | None = None, location=(0.0, 0.0, 0.0)) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 0.012
    obj.location = location
    obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    return obj


def join_group(group: str, name: str, parent: bpy.types.Object) -> bpy.types.Object:
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH" and obj.get("roxana_group") == group]
    if not objects:
        raise RuntimeError(f"No objects in group {group}")
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    if len(objects) > 1:
        bpy.ops.object.join()
    joined = bpy.context.object
    joined.name = name
    joined["roxana_group"] = group
    world = joined.matrix_world.copy()
    joined.parent = parent
    joined.matrix_world = world
    joined.select_set(False)
    return joined


def build_hero() -> bpy.types.Object:
    wood = material("Galvanoscope_Wood", (0.105, 0.052, 0.026, 1.0), 0.0, 0.54)
    wood_edge = material("Galvanoscope_WoodEdge", (0.035, 0.020, 0.014, 1.0), 0.0, 0.68)
    brass = material("Galvanoscope_AgedBrass", (0.43, 0.235, 0.075, 1.0), 0.78, 0.33)
    copper = material("Galvanoscope_AgedCopper", (0.38, 0.12, 0.055, 1.0), 0.72, 0.42)
    ivory = material("Galvanoscope_Ivory", (0.82, 0.74, 0.57, 1.0), 0.0, 0.5)
    red_ceramic = material("Galvanoscope_RedCeramic", (0.34, 0.018, 0.012, 1.0), 0.0, 0.3)
    steel = material("Galvanoscope_DarkSteel", (0.045, 0.052, 0.055, 1.0), 0.82, 0.31)
    needle_mat = material("Galvanoscope_NeedleCopper", (0.63, 0.17, 0.045, 1.0), 0.7, 0.27)
    red_cable = material("Galvanoscope_RedClothLead", (0.22, 0.012, 0.008, 1.0), 0.0, 0.83)
    dark_cable = material("Galvanoscope_RepairedClothLead", (0.04, 0.025, 0.018, 1.0), 0.0, 0.9)
    resin = material("Galvanoscope_RepairResin", (0.31, 0.18, 0.055, 1.0), 0.0, 0.76)
    glass = material("Galvanoscope_Glass", (0.30, 0.43, 0.42, 1.0), 0.02, 0.06, alpha=0.10)

    root = empty("GalvanoscopeHero")

    # Compact rounded technical-wood chassis. Total authored height is 0.24 m.
    box("Chassis", (0.0, 0.0, 0.105), (0.164, 0.062, 0.176), wood, "static_wood", bevel=0.010)
    box("RearInset", (0.0, 0.033, 0.106), (0.142, 0.008, 0.150), wood_edge, "static_wood_edge", bevel=0.004)
    box("FrontPanel", (0.0, -0.034, 0.105), (0.148, 0.008, 0.158), wood_edge, "static_wood_edge", bevel=0.006)
    box("LowerServicePlate", (0.0, -0.040, 0.050), (0.126, 0.005, 0.043), brass, "static_brass", bevel=0.002)

    # Carry handle and its original brass mounts.
    cylinder("HandleMountL", (-0.048, 0.0, 0.198), 0.0065, 0.030, brass, "static_brass", vertices=20)
    cylinder("HandleMountR", (0.048, 0.0, 0.198), 0.0065, 0.030, brass, "static_brass", vertices=20)
    box("HandleBridge", (0.0, 0.0, 0.224), (0.090, 0.018, 0.022), wood_edge, "static_wood_edge", bevel=0.008)
    box("HandleGrip", (0.0, -0.001, 0.230), (0.066, 0.021, 0.020), wood, "static_wood", bevel=0.007)

    # Dominant analog dial: nested recess, aged bezel, neutral scale, glass.
    axis_y = (math.radians(90), 0.0, 0.0)
    cylinder("DialRecess", (0.0, -0.041, 0.137), 0.060, 0.008, steel, "static_steel", axis_y, 48)
    torus("DialBrassBezel", (0.0, -0.048, 0.137), 0.0525, 0.0055, brass, "static_brass", axis_y)
    cylinder("DialFace", (0.0, -0.0495, 0.137), 0.048, 0.004, ivory, "static_ivory", axis_y, 48)

    # Unnumbered scale marks: concept text/values are deliberately not canonicalized.
    for index in range(15):
        angle = math.radians(-58 + index * (116 / 14))
        radius = 0.039
        x = math.sin(angle) * radius
        z = 0.137 + math.cos(angle) * radius
        tick = box(
            f"DialTick{index:02d}",
            (x, -0.053, z),
            (0.0016 if index % 2 else 0.0022, 0.002, 0.008 if index % 2 else 0.011),
            steel,
            "static_steel",
        )
        tick.rotation_euler[1] = -angle

    needle_pivot = empty("NeedlePivot", root, (0.0, -0.056, 0.137))
    needle = box("Needle", (0.0, -0.056, 0.160), (0.0024, 0.0022, 0.043), needle_mat, "needle")
    needle.rotation_euler[1] = math.radians(-31)
    join_group("needle", "NeedleVisual", needle_pivot)
    cylinder("NeedleHub", (0.0, -0.057, 0.137), 0.005, 0.004, brass, "static_brass", axis_y, 24)
    cylinder("DialGlass", (0.0, -0.058, 0.137), 0.0465, 0.0015, glass, "glass", axis_y, 48)

    # Bezel and service screws, with one visibly later dark-steel replacement.
    screw_positions = ((-0.054, 0.186), (0.054, 0.186), (-0.054, 0.088), (0.054, 0.088))
    for index, (x, z) in enumerate(screw_positions):
        screw_mat = steel if index == 3 else brass
        screw_group = "static_steel" if index == 3 else "static_brass"
        cylinder(f"BezelScrew{index}", (x, -0.055, z), 0.0032, 0.003, screw_mat, screw_group, axis_y, 16)

    # Large range selector kept as a semantic pivot, without literal scale labels.
    selector_pivot = empty("SelectorPivot", root, (0.0, -0.052, 0.059))
    cylinder("SelectorBase", (0.0, -0.052, 0.059), 0.021, 0.008, brass, "static_brass", axis_y, 32)
    selector = cylinder("SelectorKnob", (0.0, -0.061, 0.059), 0.0155, 0.014, steel, "selector", axis_y, 28, bevel=0.0015)
    box("SelectorPointer", (0.0, -0.069, 0.071), (0.004, 0.003, 0.013), ivory, "selector")
    join_group("selector", "SelectorVisual", selector_pivot)

    # Differentiated ceramic terminals.
    for side, x, terminal_mat, name in (
        ("Red", -0.047, red_ceramic, "Red"),
        ("Pale", 0.047, ivory, "Pale"),
    ):
        cylinder(f"{side}TerminalCollar", (x, -0.052, 0.029), 0.010, 0.012, terminal_mat, f"terminal_{name}", axis_y, 24)
        cylinder(f"{side}TerminalJack", (x, -0.061, 0.029), 0.0042, 0.011, copper, f"terminal_{name}", axis_y, 18)

    # Independent probes and cloth leads. Pale side is the later mismatched repair.
    red_probe_pivot = empty("ProbeRedPivot", root, (-0.093, 0.0, 0.099))
    pale_probe_pivot = empty("ProbePalePivot", root, (0.093, 0.0, 0.099))

    cable(
        "RedLead",
        [(-0.047, -0.061, 0.029), (-0.072, -0.070, 0.014), (-0.108, -0.064, 0.044), (-0.096, -0.048, 0.091)],
        0.0019,
        red_cable,
        "probe_red",
    )
    cylinder("RedProbeHandle", (-0.096, -0.048, 0.104), 0.0065, 0.052, red_ceramic, "probe_red", vertices=20, bevel=0.001)
    cylinder("RedProbeFerrule", (-0.096, -0.048, 0.074), 0.0045, 0.010, brass, "probe_red", vertices=18)
    cylinder("RedProbeTip", (-0.096, -0.048, 0.059), 0.0016, 0.022, steel, "probe_red", vertices=12)
    join_group("probe_red", "ProbeRedVisual", red_probe_pivot)

    cable(
        "PaleLead",
        [(0.047, -0.061, 0.029), (0.068, -0.072, 0.009), (0.110, -0.065, 0.046), (0.096, -0.048, 0.091)],
        0.0021,
        dark_cable,
        "probe_pale",
    )
    cylinder("PaleProbeHandle", (0.096, -0.048, 0.105), 0.0072, 0.054, ivory, "probe_pale", vertices=20, bevel=0.001)
    cylinder("PaleProbeFerrule", (0.096, -0.048, 0.073), 0.0042, 0.010, steel, "probe_pale", vertices=18)
    cylinder("PaleProbeTip", (0.096, -0.048, 0.058), 0.0016, 0.022, steel, "probe_pale", vertices=12)
    for index, z in enumerate((0.084, 0.089, 0.094)):
        torus(f"RepairWrap{index}", (0.096, -0.048, z), 0.0076, 0.0016, resin, "probe_pale")
    join_group("probe_pale", "ProbePaleRepairedVisual", pale_probe_pivot)

    # Consolidate rigid material groups while preserving moving nodes.
    for group, name in (
        ("static_wood", "WoodBody"),
        ("static_wood_edge", "WoodEdgeAndHandle"),
        ("static_brass", "AgedBrassHardware"),
        ("static_steel", "DarkSteelDetails"),
        ("static_ivory", "DialIvory"),
        ("terminal_Red", "RedTerminal"),
        ("terminal_Pale", "PaleTerminal"),
        ("glass", "DialGlass"),
    ):
        join_group(group, name, root)

    root["asset_id"] = "rx_ohmdal_galvanoscope_hero_01"
    root["front_axis"] = "+Z"
    root["units"] = "meter"
    root["grounded"] = False
    return root


def export_master(root: bpy.types.Object) -> None:
    BLEND_PATH.parent.mkdir(parents=True, exist_ok=True)
    GLB_PATH.parent.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))

    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for child in root.children_recursive:
        child.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.export_scene.gltf(
        filepath=str(GLB_PATH),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=True,
    )


def point_camera(camera: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = mathutils.Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render_previews() -> None:
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 720
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.world.color = (0.018, 0.014, 0.012)
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = -1.15

    floor_mat = material("PreviewFloor", (0.09, 0.065, 0.045, 1.0), 0.0, 0.86)
    bpy.ops.mesh.primitive_plane_add(size=3.0, location=(0.0, 0.0, -0.002))
    floor = bpy.context.object
    floor.name = "PreviewFloor"
    floor.data.materials.append(floor_mat)

    bpy.ops.object.camera_add()
    camera = bpy.context.object
    camera.name = "PreviewCamera"
    camera.data.lens = 58
    scene.camera = camera

    for name, location, energy, color, size in (
        ("PreviewKey", (-0.35, -0.45, 0.50), 42, (1.0, 0.73, 0.46), 0.30),
        ("PreviewFill", (0.40, -0.20, 0.30), 18, (0.48, 0.65, 1.0), 0.26),
        ("PreviewRim", (0.10, 0.35, 0.42), 34, (0.66, 0.78, 1.0), 0.22),
    ):
        light_data = bpy.data.lights.new(name=name, type="AREA")
        light_data.energy = energy
        light_data.color = color
        light_data.shape = "DISK"
        light_data.size = size
        light = bpy.data.objects.new(name, light_data)
        light.location = location
        bpy.context.scene.collection.objects.link(light)
        point_camera(light, (0.0, 0.0, 0.115))

    views = {
        "front": ((0.0, -0.49, 0.145), (0.0, 0.0, 0.120)),
        "three-quarter": ((0.32, -0.43, 0.195), (0.0, 0.0, 0.120)),
        "side": ((0.48, 0.0, 0.145), (0.0, 0.0, 0.120)),
        "back": ((0.0, 0.49, 0.155), (0.0, 0.0, 0.120)),
    }
    for view_name, (location, target) in views.items():
        camera.location = location
        point_camera(camera, target)
        scene.render.filepath = str(PREVIEW_DIR / f"candidate-01-{view_name}.png")
        bpy.ops.render.render(write_still=True)


def main() -> None:
    clear_scene()
    root = build_hero()
    export_master(root)
    render_previews()
    print(f"BLEND={BLEND_PATH}")
    print(f"GLB={GLB_PATH}")
    print(f"PREVIEWS={PREVIEW_DIR}")


if __name__ == "__main__":
    main()
