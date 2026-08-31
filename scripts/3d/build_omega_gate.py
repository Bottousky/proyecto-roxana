"""Build the project-owned Puerta Omega hero in Blender.

Authority: the Stage 2B task, existing Ohmdal script/mechanism evidence and
project concept art. This is deterministic controlled Blender geometry: it
does not call a generative provider and adds no narrative symbols.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
import mathutils


ROOT = Path(__file__).resolve().parents[2]
BLEND_PATH = ROOT / "assets/source/ohmdal/heroes/omega-gate/omega-gate.blend"
GLB_PATH = ROOT / "assets/runtime/ohmdal/plaza/heroes/omega-gate/omega-gate.glb"
PREVIEW_PATH = ROOT / "output/blender/omega-gate/candidate-01.png"


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


def empty(name: str, parent: bpy.types.Object | None = None, location=(0.0, 0.0, 0.0)) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 0.14
    obj.location = location
    obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    return obj


def finish_mesh(obj: bpy.types.Object, mat: bpy.types.Material, bevel: float = 0.0) -> bpy.types.Object:
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        modifier = obj.modifiers.new(name="RuntimeBevel", type="BEVEL")
        modifier.width = bevel
        modifier.segments = 2
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    for polygon in obj.data.polygons:
        polygon.use_smooth = False
    obj.select_set(False)
    return obj


def cube(name: str, location, size, mat, parent, bevel=0.0, rotation=(0.0, 0.0, 0.0)):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    obj.parent = parent
    return finish_mesh(obj, mat, bevel)


def cylinder(
    name: str,
    location,
    radius: float,
    depth: float,
    mat,
    parent,
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
    obj.parent = parent
    return finish_mesh(obj, mat, bevel)


def curve_tube(name: str, points, radius: float, mat, parent, resolution=1):
    curve = bpy.data.curves.new(name=name, type="CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = resolution
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, coordinate in zip(spline.points, points):
        point.co = (*coordinate, 1.0)
    obj = bpy.data.objects.new(name, curve)
    obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj = bpy.context.object
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    obj.select_set(False)
    return obj


def consolidate_children_by_material(parent: bpy.types.Object, prefix: str, exclude_prefixes=()) -> None:
    """Merge only rigid siblings; pivots and future moving parts stay intact."""
    candidates = [
        obj
        for obj in parent.children
        if obj.type == "MESH" and not any(obj.name.startswith(excluded) for excluded in exclude_prefixes)
    ]
    material_groups: dict[str, list[bpy.types.Object]] = {}
    for obj in candidates:
        if obj.data.materials:
            material_groups.setdefault(obj.data.materials[0].name, []).append(obj)
    for material_name, objects in sorted(material_groups.items()):
        if not objects:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objects[0]
        if len(objects) > 1:
            bpy.ops.object.join()
        joined = bpy.context.object
        joined.name = f"{prefix}_{material_name.removeprefix('Gate_')}"
        joined.parent = parent
        joined.select_set(False)


def point_camera(camera: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = mathutils.Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def build_frame(root, pale_stone, shadow_stone, copper, verdigris):
    frame = empty("ArchitecturalFrame", root)

    cube("Threshold", (0, 0.0, 0.18), (9.4, 2.0, 0.36), shadow_stone, frame, 0.05)
    cube("ThresholdUpper", (0, -0.18, 0.39), (6.1, 1.45, 0.18), pale_stone, frame, 0.035)
    for side in (-1, 1):
        x = side * 3.5
        cube(f"PierFoot_{side}", (x, 0.0, 0.72), (2.25, 1.75, 1.08), pale_stone, frame, 0.08)
        cube(f"PierShaft_{side}", (x, 0.05, 3.0), (1.72, 1.55, 3.65), pale_stone, frame, 0.09)
        cube(f"PierInset_{side}", (x, -0.82, 3.05), (0.92, 0.12, 2.25), shadow_stone, frame, 0.025)
        cube(f"PierCap_{side}", (x, 0.0, 5.0), (2.2, 1.8, 0.52), pale_stone, frame, 0.07)
        cube(f"OuterButtress_{side}", (side * 4.42, 0.16, 2.22), (0.72, 2.05, 4.05), shadow_stone, frame, 0.07)
        cube(f"OuterCap_{side}", (side * 4.42, 0.1, 4.36), (0.94, 2.2, 0.42), pale_stone, frame, 0.06)

    # Segmented civic arch: readable construction and depth, without fantasy ornament.
    arch_center_z = 3.05
    arch_radius = 2.52
    for index in range(11):
        theta = math.radians(index * 18)
        x = math.cos(theta) * arch_radius
        z = arch_center_z + math.sin(theta) * arch_radius
        rotation = (0.0, -theta + math.pi / 2, 0.0)
        cube(f"ArchVoussoir_{index:02d}", (x, 0.02, z), (0.9, 1.65, 0.76), pale_stone, frame, 0.055, rotation)

    cube("UpperLintel", (0, 0.1, 6.0), (8.7, 1.85, 0.62), pale_stone, frame, 0.075)
    cube("UpperShadowCourse", (0, 0.18, 6.48), (9.45, 2.0, 0.34), shadow_stone, frame, 0.05)
    cube("CrownStone", (0, 0.08, 7.0), (2.0, 1.86, 0.72), pale_stone, frame, 0.07)

    # A shallow inner reveal replaces the former flat black void.
    for side in (-1, 1):
        cube(f"InnerReveal_{side}", (side * 2.48, 0.68, 2.75), (0.34, 1.05, 4.7), shadow_stone, frame, 0.035)
    cube("InnerRevealTop", (0, 0.68, 5.25), (5.3, 1.05, 0.34), shadow_stone, frame, 0.035)

    # Structural copper follows the same north/south circuit grammar as the plaza.
    for side in (-1, 1):
        curve_tube(
            f"FrameConductor_{side}",
            [(side * 4.05, -0.96, 0.72), (side * 4.05, -0.96, 5.2), (side * 2.75, -0.96, 6.0)],
            0.075,
            copper,
            frame,
        )
        cube(f"VerdigrisSeat_{side}", (side * 4.05, -1.01, 1.18), (0.18, 0.08, 0.7), verdigris, frame, 0.018)
    return frame


def build_doors(root, dark_metal, copper, verdigris):
    doors = empty("DoorLeaves", root, (0.0, 0.0, 2.6))
    doors["closed_runtime_y"] = 2.6
    doors["open_runtime_y"] = 5.4

    for side, label in ((-1, "Left"), (1, "Right")):
        pivot = empty(f"DoorLeaf_{label}Pivot", doors, (side * 2.28, 0.0, 0.0))
        pivot["motion"] = "future-hinge-yaw"
        pivot["hinge_side"] = label.lower()
        center_x = -side * 1.14
        cube(f"DoorLeaf_{label}", (center_x, 0.0, 0.0), (2.28, 0.5, 5.2), dark_metal, pivot, 0.045)
        cube(f"DoorLeafCopperSpine_{label}", (center_x, -0.3, 0.0), (0.18, 0.12, 4.35), copper, pivot, 0.025)
        cube(f"DoorLeafTopRail_{label}", (center_x, -0.3, 2.12), (1.82, 0.12, 0.16), copper, pivot, 0.025)
        cube(f"DoorLeafBottomRail_{label}", (center_x, -0.3, -2.12), (1.82, 0.12, 0.16), copper, pivot, 0.025)
        cube(f"DoorLeafOuterRail_{label}", (-side * 0.22, -0.3, 0.0), (0.16, 0.12, 4.15), copper, pivot, 0.025)
        # Localized oxidation is an inlay/accent, never emissive.
        cube(f"DoorLeafVerdigris_{label}", (center_x, -0.37, -1.52), (1.35, 0.045, 0.11), verdigris, pivot, 0.012)
    return doors


def build_mechanism(root, dark_metal, copper):
    mechanism = empty("MechanicalAssembly", root)
    for side, label in ((-1, "Left"), (1, "Right")):
        x = side * 3.25
        cylinder(f"SolenoidHousing_{label}", (x, -0.92, 3.25), 0.34, 1.18, dark_metal, mechanism, vertices=32, bevel=0.035)
        for z in (2.82, 3.1, 3.4, 3.68):
            cylinder(f"SolenoidCoil_{label}_{z}", (x, -0.92, z), 0.41, 0.09, copper, mechanism, vertices=24, bevel=0.012)
        # Plungers and lock bars remain separate for a future visible response.
        cylinder(
            f"SolenoidPlunger_{label}",
            (side * 2.78, -0.92, 3.25),
            0.09,
            0.62,
            dark_metal,
            mechanism,
            rotation=(0.0, math.radians(90), 0.0),
            vertices=20,
            bevel=0.01,
        )["motion"] = "future-linear-x"
        cube(f"LockBar_{label}", (side * 2.38, -0.92, 3.25), (0.52, 0.18, 0.28), copper, mechanism, 0.025)[
            "motion"
        ] = "future-linear-x"
        cube(f"SolenoidMount_{label}", (x, -0.56, 3.25), (0.88, 0.42, 1.55), dark_metal, mechanism, 0.05)
    return mechanism


def build_electrical(root, copper, ceramic):
    terminals = empty("ElectricalTerminals", root)
    insulators = empty("Insulators", root)
    for side, label in ((-1, "Left"), (1, "Right")):
        x = side * 4.05
        for index, z in enumerate((1.65, 4.65)):
            cylinder(
                f"Insulator_{label}_{index}",
                (x, -1.06, z),
                0.2,
                0.38,
                ceramic,
                insulators,
                rotation=(math.radians(90), 0.0, 0.0),
                vertices=24,
                bevel=0.018,
            )
            cylinder(
                f"Terminal_{label}_{index}",
                (x, -1.28, z),
                0.095,
                0.16,
                copper,
                terminals,
                rotation=(math.radians(90), 0.0, 0.0),
                vertices=20,
                bevel=0.01,
            )
        curve_tube(
            f"TerminalLead_{label}",
            [(x, -1.31, 4.65), (side * 3.63, -1.31, 4.05), (side * 3.25, -1.31, 3.82)],
            0.055,
            copper,
            terminals,
        )
    return terminals, insulators


def build_decorative(root, copper):
    detail = empty("DecorativeDetail", root)
    # One approved Ω, assembled from two readable halves and feet.
    left = [(0.0, -1.04, 7.25), (-0.54, -1.04, 7.15), (-0.9, -1.04, 6.78), (-0.92, -1.04, 6.3), (-0.56, -1.04, 5.93), (-0.56, -1.04, 5.72), (-1.03, -1.04, 5.72)]
    right = [(-x, y, z) for x, y, z in left]
    curve_tube("OmegaMark_Left", left, 0.105, copper, detail)
    curve_tube("OmegaMark_Right", right, 0.105, copper, detail)
    return detail


def render_preview() -> None:
    PREVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    scene.render.resolution_x = 960
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(PREVIEW_PATH)
    scene.render.film_transparent = False
    scene.world.color = (0.035, 0.03, 0.026)

    floor_mat = material("PreviewFloor", (0.18, 0.16, 0.13, 1.0), 0.0, 0.84)
    bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 0, -0.01))
    bpy.context.object.data.materials.append(floor_mat)

    bpy.ops.object.camera_add(location=(8.8, -13.5, 7.4))
    camera = bpy.context.object
    camera.data.lens = 58
    point_camera(camera, (0, 0, 3.35))
    scene.camera = camera

    for name, location, energy, color, size in (
        ("PreviewKey", (-5.5, -7.5, 10.5), 1450, (1.0, 0.76, 0.54), 5.5),
        ("PreviewFill", (6.0, -2.0, 5.0), 820, (0.48, 0.64, 1.0), 4.0),
        ("PreviewRim", (0.0, 5.0, 8.0), 1150, (0.62, 0.78, 1.0), 3.0),
    ):
        light_data = bpy.data.lights.new(name=name, type="AREA")
        light_data.energy = energy
        light_data.color = color
        light_data.shape = "DISK"
        light_data.size = size
        light = bpy.data.objects.new(name, light_data)
        light.location = location
        point_camera(light, (0, 0, 3.2))
        scene.collection.objects.link(light)

    bpy.ops.render.render(write_still=True)


def build() -> None:
    clear_scene()
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.render.engine = "BLENDER_EEVEE"

    pale_stone = material("Gate_PaleErodedStone", (0.54, 0.48, 0.39, 1.0), 0.0, 0.82)
    shadow_stone = material("Gate_StoneShadow", (0.29, 0.27, 0.23, 1.0), 0.0, 0.88)
    copper = material("Gate_AgedCopper", (0.42, 0.17, 0.065, 1.0), 0.72, 0.36)
    verdigris = material("Gate_LocalVerdigris", (0.06, 0.27, 0.25, 1.0), 0.34, 0.58)
    dark_metal = material("Gate_SecondaryMetal", (0.19, 0.165, 0.135, 1.0), 0.55, 0.52)
    ceramic = material("Gate_PaleCeramic", (0.67, 0.62, 0.51, 1.0), 0.0, 0.4)

    root = empty("OmegaGate_Root")
    root["asset_id"] = "rx_ohmdal_omega_gate_hero_01"
    root["unit"] = "meter"
    root["front_axis"] = "+Z"
    root["source_reference"] = "assets/ohmdal/rooms/prop_puerta_de_ohm.png"
    frame = build_frame(root, pale_stone, shadow_stone, copper, verdigris)
    doors = build_doors(root, dark_metal, copper, verdigris)
    mechanism = build_mechanism(root, dark_metal, copper)
    terminals, insulators = build_electrical(root, copper, ceramic)
    detail = build_decorative(root, copper)

    # Runtime consolidation is material-aware and semantic. Door pivots,
    # plungers and lock bars remain separate and animatable.
    consolidate_children_by_material(frame, "ArchitecturalFrame")
    for pivot in doors.children:
        consolidate_children_by_material(pivot, pivot.name)
    consolidate_children_by_material(mechanism, "MechanicalFixed", ("SolenoidPlunger", "LockBar"))
    consolidate_children_by_material(terminals, "ElectricalTerminals")
    consolidate_children_by_material(insulators, "Insulators")
    consolidate_children_by_material(detail, "DecorativeDetail")

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
        print(f"OMEGA_GATE_BUILD_ERROR: {exc}", file=sys.stderr)
        raise
