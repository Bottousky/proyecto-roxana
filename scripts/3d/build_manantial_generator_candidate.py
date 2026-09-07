"""Build the deterministic Manantial turbine-generator hero candidate.

This file is an authoring candidate only.  It deliberately does not import or
modify the PlayCanvas runtime: the existing Manantial roots, colliders,
interaction points and state-driven rotor remain the integration contract until
the candidate passes an independent visual review.

The authored coordinates are metres, Y-up, with the visual front on +Z.  The
empty ``ManantialGenerator`` receives the same X=90 degree Blender wrapper as
the accepted regional hero candidates.  The exported GLB therefore carries a
grounded root and a separate ``ManantialGeneratorRotorAssembly`` hierarchy so
the runtime can animate only the rotor without rebuilding the static housing.
"""

from __future__ import annotations

import json
import math
import tempfile
from pathlib import Path

import bpy
import mathutils


ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "assets/runtime/ohmdal/regional-heroes"
GLB_PATH = OUTPUT_DIR / "manantial-generator.glb"
PROVENANCE_PATH = OUTPUT_DIR / "manantial-generator.provenance.md"
PREVIEW_PATH = Path(tempfile.gettempdir()) / "ohmdal-manantial-generator-preview.png"

STONE_DIR = ROOT / "assets/runtime/ohmdal/plaza/materials/stone-primary"
IRON_DIR = ROOT / "assets/runtime/ohmdal/plaza/materials/iron-aged"


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def load_image(path: Path, colorspace: str) -> bpy.types.Image | None:
    if not path.exists():
        return None
    image = bpy.data.images.load(str(path), check_existing=True)
    try:
        image.colorspace_settings.name = colorspace
    except (AttributeError, TypeError):
        pass
    return image


def pbr_material(
    name: str,
    base: tuple[float, float, float, float],
    metallic: float,
    roughness: float,
    diffuse_path: Path | None = None,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = base
    material.use_backface_culling = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    if bsdf is None:
        raise RuntimeError(f"Principled BSDF missing for {name}")
    bsdf.inputs["Base Color"].default_value = base
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if diffuse_path is not None:
        image = load_image(diffuse_path, "sRGB")
        if image is not None:
            texture = nodes.new("ShaderNodeTexImage")
            texture.name = f"{name} shared CC0 diffuse"
            texture.image = image
            texture.interpolation = "Linear"
            links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
    return material


def flat_material(
    name: str,
    base: tuple[float, float, float, float],
    metallic: float,
    roughness: float,
) -> bpy.types.Material:
    return pbr_material(name, base, metallic, roughness)


def finish_mesh(
    obj: bpy.types.Object,
    material: bpy.types.Material,
    root: bpy.types.Object,
    bevel: float = 0.0,
    smooth: bool = False,
    dynamic: bool = False,
) -> bpy.types.Object:
    obj.name = obj.name or "Mesh"
    obj.data.materials.append(material)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0.0:
        modifier = obj.modifiers.new(name="SmallMechanicalBevel", type="BEVEL")
        modifier.width = bevel
        modifier.segments = 2
        modifier.limit_method = "ANGLE"
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    if smooth:
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    obj.parent = root
    if dynamic:
        obj["dynamic_role"] = "rotor"
    obj.select_set(False)
    return obj


def empty(name: str, parent: bpy.types.Object | None = None) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 0.08
    bpy.context.scene.collection.objects.link(obj)
    if parent is not None:
        obj.parent = parent
    return obj


def place_empty_origin_preserving_world(
    obj: bpy.types.Object,
    parent_local_pivot: tuple[float, float, float],
) -> None:
    """Move an authored pivot without moving any child geometry in world space.

    Blender objects are authored under the rotated model wrapper.  Recording
    each child matrix before moving the assembly is therefore safer than
    subtracting coordinates by hand: it preserves the actual authored pose
    through both the wrapper rotation and glTF's Y-up export conversion.
    """
    child_world_matrices = [
        (child, child.matrix_world.copy())
        for child in obj.children_recursive
        if child.type == "MESH"
    ]
    obj.location = parent_local_pivot
    bpy.context.view_layer.update()
    for child, world_matrix in child_world_matrices:
        child.matrix_world = world_matrix
    bpy.context.view_layer.update()
    for child, world_matrix in child_world_matrices:
        if (child.matrix_world.translation - world_matrix.translation).length > 1e-5:
            raise RuntimeError(f"Pivot relocation moved rotor child {child.name}")


def box(
    name: str,
    location: tuple[float, float, float],
    dimensions: tuple[float, float, float],
    material: bpy.types.Material,
    root: bpy.types.Object,
    rotation: tuple[float, float, float] = (0.0, 0.0, 0.0),
    bevel: float = 0.0,
    dynamic: bool = False,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    return finish_mesh(obj, material, root, bevel=bevel, dynamic=dynamic)


def cylinder(
    name: str,
    location: tuple[float, float, float],
    radius: float,
    depth: float,
    material: bpy.types.Material,
    root: bpy.types.Object,
    vertices: int = 32,
    rotation: tuple[float, float, float] = (math.radians(90.0), 0.0, 0.0),
    bevel: float = 0.0,
    smooth: bool = False,
    dynamic: bool = False,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        end_fill_type="NGON",
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    return finish_mesh(obj, material, root, bevel=bevel, smooth=smooth, dynamic=dynamic)


def torus(
    name: str,
    location: tuple[float, float, float],
    major_radius: float,
    minor_radius: float,
    material: bpy.types.Material,
    root: bpy.types.Object,
    rotation: tuple[float, float, float] = (math.radians(90.0), 0.0, 0.0),
    major_segments: int = 40,
    minor_segments: int = 8,
    dynamic: bool = False,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_torus_add(
        major_segments=major_segments,
        minor_segments=minor_segments,
        major_radius=major_radius,
        minor_radius=minor_radius,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    return finish_mesh(obj, material, root, smooth=True, dynamic=dynamic)


def beam_between(
    name: str,
    start: mathutils.Vector,
    end: mathutils.Vector,
    radius: float,
    material: bpy.types.Material,
    root: bpy.types.Object,
    vertices: int = 16,
    dynamic: bool = False,
) -> bpy.types.Object:
    direction = end - start
    if direction.length <= 1e-6:
        raise ValueError(f"Cannot create zero-length beam {name}")
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=direction.length,
        location=(start + end) * 0.5,
    )
    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = direction.to_track_quat("Z", "Y")
    return finish_mesh(obj, material, root, bevel=radius * 0.25, smooth=True, dynamic=dynamic)


def join_meshes(objects: list[bpy.types.Object], name: str, root: bpy.types.Object) -> bpy.types.Object:
    if not objects:
        raise RuntimeError(f"Cannot join empty group {name}")
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    joined = bpy.context.object
    joined.name = name
    joined.parent = root
    joined.select_set(False)
    return joined


def has_dynamic_ancestor(obj: bpy.types.Object, rotor: bpy.types.Object) -> bool:
    parent = obj.parent
    while parent is not None:
        if parent == rotor:
            return True
        parent = parent.parent
    return False


def join_static_by_material(model: bpy.types.Object, rotor: bpy.types.Object) -> None:
    """Batch static pieces while leaving the rotor hierarchy independently animatable."""
    groups: dict[str, list[bpy.types.Object]] = {}
    for obj in list(model.children_recursive):
        if obj.type != "MESH" or has_dynamic_ancestor(obj, rotor):
            continue
        material_names = [material.name for material in obj.data.materials if material]
        if len(material_names) != 1:
            raise RuntimeError(f"Static mesh {obj.name} must have exactly one material")
        groups.setdefault(material_names[0], []).append(obj)
    for material_name, objects in sorted(groups.items()):
        source_names = [obj.name for obj in objects]
        joined = join_meshes(objects, f"{material_name}Static", model)
        joined["source_parts"] = source_names


def triangulate_for_export(model: bpy.types.Object) -> None:
    for obj in list(model.children_recursive):
        if obj.type != "MESH":
            continue
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        modifier = obj.modifiers.new(name="ExportTriangulate", type="TRIANGULATE")
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        obj.select_set(False)


def build_model() -> tuple[bpy.types.Object, bpy.types.Object]:
    stone = pbr_material(
        "ManantialGenerator_Stone",
        (0.43, 0.40, 0.34, 1.0),
        0.06,
        0.76,
        STONE_DIR / "diffuse-1k.jpg",
    )
    iron = pbr_material(
        "ManantialGenerator_Iron",
        (0.08, 0.075, 0.07, 1.0),
        0.74,
        0.44,
        IRON_DIR / "diffuse-1k.jpg",
    )
    copper = flat_material("ManantialGenerator_Copper", (0.47, 0.16, 0.055, 1.0), 0.78, 0.34)
    copper_dark = flat_material("ManantialGenerator_CopperDark", (0.22, 0.065, 0.025, 1.0), 0.78, 0.43)
    ceramic = flat_material("ManantialGenerator_Ceramic", (0.82, 0.78, 0.66, 1.0), 0.03, 0.56)
    steel = flat_material("ManantialGenerator_Steel", (0.20, 0.22, 0.23, 1.0), 0.82, 0.38)

    model = empty("ManantialGenerator")
    model["asset_id"] = "rx_ohmdal_manantial_generator_candidate_01"
    model["front_axis"] = "+Z"
    model["gltf_front_axis"] = "+Z"
    model["up_axis"] = "+Y"
    model["units"] = "meter"
    model["grounded_pivot"] = True
    model["playcanvas_wrapper_yaw_degrees"] = 180
    model["gameplay_root"] = "existing Manantial turbineMesh/turbineRotor; untouched"
    model["integration_anchor_hint"] = "world [0, 0.8, 22.55] over the Manantial apron; wrapper yaw 180 faces the powerhouse front"
    model["state_contract"] = "rotor assembly may rotate; thermal/emissive state remains runtime-owned"
    model.rotation_mode = "XYZ"
    model.rotation_euler = (math.radians(90.0), 0.0, 0.0)

    rotor = empty("ManantialGeneratorRotorAssembly", model)
    rotor["animation_role"] = "rotor"
    # Blender authors the cylinder along +Z.  export_yup converts that mesh
    # axis to the GLB/PlayCanvas local +Y axis; the consumer must use +Y.
    rotor["pivot_axis"] = "+Y"
    rotor["pivot_axis_authored_blender"] = "+Z"
    rotor["pivot_local"] = [0.0, 2.45, 1.46]

    # Compact stone/iron mounting frame, deliberately based on the pixel
    # reference's dark side cheeks and pale civic headworks.
    box("StoneMountingPlinth", (0.0, 0.20, 0.0), (5.8, 0.40, 2.8), stone, model, bevel=0.08)
    box("IronBaseFrame", (0.0, 0.62, 0.0), (5.25, 0.52, 2.35), iron, model, bevel=0.07)
    box("IronBaseFrontLip", (0.0, 0.88, 0.92), (4.8, 0.18, 0.18), steel, model, bevel=0.03)
    for x in (-2.28, 2.28):
        box(f"StoneSideFoot{x:+.0f}", (x, 0.65, 0.0), (0.72, 0.95, 2.2), stone, model, bevel=0.07)

    # Side cheeks and upper lintel make the generator silhouette legible from
    # the player approach before the copper electrical details are inspected.
    for x in (-1.86, 1.86):
        box(f"IronSideCheek{x:+.0f}", (x, 2.35, 0.0), (0.78, 2.75, 1.72), iron, model, bevel=0.06)
        box(f"StoneSideBrace{x:+.0f}", (x, 2.05, 0.88), (0.95, 1.95, 0.35), stone, model, bevel=0.045)
        cylinder(
            f"CopperSideTie{x:+.0f}",
            (x, 2.12, 1.12),
            0.105,
            0.28,
            copper,
            model,
            vertices=20,
            rotation=(0.0, 0.0, 0.0),
            bevel=0.015,
        )
    box("IronUpperLintel", (0.0, 3.68, 0.0), (4.35, 0.48, 1.7), iron, model, bevel=0.06)
    box("StoneUpperCap", (0.0, 4.02, 0.0), (4.9, 0.24, 1.95), stone, model, bevel=0.05)

    # Stator shell and front coil housing.  The front rings intentionally
    # expose the maintenance face instead of hiding the mechanism in a box.
    cylinder(
        "ManantialGeneratorStator",
        (0.0, 2.45, 0.02),
        1.36,
        1.55,
        iron,
        model,
        vertices=48,
        rotation=(0.0, 0.0, 0.0),
        bevel=0.035,
        smooth=True,
    )
    cylinder(
        "ManantialGeneratorStatorFront",
        (0.0, 2.45, 0.78),
        1.22,
        0.18,
        steel,
        model,
        vertices=48,
        rotation=(0.0, 0.0, 0.0),
        bevel=0.025,
        smooth=True,
    )
    box("CopperCoilHousing", (0.0, 2.45, 0.92), (2.08, 1.52, 0.72), copper_dark, model, bevel=0.11)
    torus(
        "CopperCoilFrontRing",
        (0.0, 2.45, 1.31),
        1.07,
        0.095,
        copper,
        model,
        rotation=(0.0, 0.0, 0.0),
        major_segments=48,
        minor_segments=8,
    )
    for index, x in enumerate((-0.84, -0.56, -0.28, 0.0, 0.28, 0.56, 0.84)):
        box(
            f"CopperCoilFin{index + 1}",
            (x, 2.45, 1.34),
            (0.095, 1.26, 0.10),
            copper,
            model,
            bevel=0.018,
        )

    # Dynamic rotor: separate disc, hub, shaft key and six copper blades.  No
    # material join may collapse this hierarchy.
    cylinder(
        "ManantialGeneratorRotor",
        (0.0, 2.45, 1.46),
        0.73,
        0.22,
        steel,
        rotor,
        vertices=40,
        rotation=(0.0, 0.0, 0.0),
        bevel=0.025,
        smooth=True,
        dynamic=True,
    )
    cylinder(
        "ManantialGeneratorRotorHub",
        (0.0, 2.45, 1.63),
        0.25,
        0.28,
        copper,
        rotor,
        vertices=32,
        rotation=(0.0, 0.0, 0.0),
        bevel=0.02,
        smooth=True,
        dynamic=True,
    )
    for index in range(6):
        angle = math.tau * index / 6.0
        x = math.cos(angle) * 0.43
        y = 2.45 + math.sin(angle) * 0.43
        box(
            f"ManantialGeneratorRotorBlade{index + 1}",
            (x, y, 1.78),
            (0.12, 0.58, 0.08),
            copper,
            rotor,
            rotation=(0.0, 0.0, angle),
            bevel=0.018,
            dynamic=True,
        )
    cylinder(
        "ManantialGeneratorRotorKey",
        (0.0, 2.45, 1.85),
        0.07,
        0.18,
        copper_dark,
        rotor,
        vertices=20,
        rotation=(0.0, 0.0, 0.0),
        bevel=0.012,
        smooth=True,
        dynamic=True,
    )

    # Rear coupling and shaft read through the side gap without adding a
    # second gameplay anchor.
    cylinder(
        "ManantialGeneratorShaft",
        (0.0, 2.45, -0.98),
        0.23,
        1.15,
        steel,
        model,
        vertices=28,
        rotation=(0.0, 0.0, 0.0),
        bevel=0.018,
        smooth=True,
    )
    torus(
        "ManantialGeneratorShaftCollar",
        (0.0, 2.45, -0.45),
        0.34,
        0.07,
        copper_dark,
        model,
        rotation=(0.0, 0.0, 0.0),
        major_segments=32,
    )

    # High-voltage top terminals, central bus and restrained side returns.
    for index, x in enumerate((-1.72, 1.72)):
        cylinder(
            f"ManantialGeneratorCeramicInsulator{index + 1}",
            (x, 4.55, 0.0),
            0.29,
            0.82,
            ceramic,
            model,
            vertices=28,
            bevel=0.025,
            smooth=True,
        )
        torus(
            f"ManantialGeneratorInsulatorCollar{index + 1}",
            (x, 4.15, 0.0),
            0.32,
            0.045,
            copper,
            model,
            major_segments=28,
        )
        cylinder(
            f"ManantialGeneratorTerminalPost{index + 1}",
            (x, 5.10, 0.0),
            0.085,
            0.34,
            copper,
            model,
            vertices=20,
            bevel=0.012,
            smooth=True,
        )
    beam_between(
        "ManantialGeneratorTopBus",
        mathutils.Vector((-1.72, 5.18, 0.0)),
        mathutils.Vector((1.72, 5.18, 0.0)),
        0.09,
        copper,
        model,
        vertices=20,
    )
    for side, x in (("L", -2.38), ("R", 2.38)):
        beam_between(
            f"ManantialGeneratorReturnBus{side}",
            mathutils.Vector((x, 1.30, 0.72)),
            mathutils.Vector((x, 3.55, 0.72)),
            0.075,
            copper,
            model,
            vertices=16,
        )
        for y in (1.25, 3.55):
            cylinder(
                f"ManantialGeneratorReturnTerminal{side}{y}",
                (x, y, 0.74),
                0.14,
                0.22,
                copper_dark,
                model,
                vertices=20,
                rotation=(0.0, 0.0, 0.0),
                bevel=0.015,
                smooth=True,
            )

    # Front inspection/measurement plate with two ceramic terminal cups.
    box("ManantialGeneratorTerminalPlate", (0.0, 1.02, 1.08), (1.72, 0.92, 0.24), steel, model, bevel=0.05)
    for index, x in enumerate((-0.43, 0.43)):
        cylinder(
            f"ManantialGeneratorFrontTerminal{index + 1}",
            (x, 1.28, 1.28),
            0.19,
            0.18,
            ceramic,
            model,
            vertices=24,
            rotation=(0.0, 0.0, 0.0),
            bevel=0.018,
            smooth=True,
        )
        torus(
            f"ManantialGeneratorFrontTerminalRing{index + 1}",
            (x, 1.28, 1.40),
            0.20,
            0.035,
            copper,
            model,
            rotation=(0.0, 0.0, 0.0),
            major_segments=24,
        )

    # Keep authored orientation explicit for the exporter and consumer.
    # The rotor disc axis is Blender +Z (exported GLB/PlayCanvas +Y) and its
    # centre is (0, 2.45, 1.46) in the model's authored coordinates.  Place
    # the assembly origin there while preserving every child matrix so
    # runtime rotation cannot orbit the machine around the model origin.
    place_empty_origin_preserving_world(rotor, (0.0, 2.45, 1.46))
    model["material_count"] = 6
    model["rotor_parts"] = [obj.name for obj in rotor.children_recursive if obj.type == "MESH"]
    return model, rotor


def model_bounds(model: bpy.types.Object) -> tuple[list[float], list[float], int, list[str]]:
    bpy.context.view_layer.update()
    minimum = mathutils.Vector((float("inf"), float("inf"), float("inf")))
    maximum = mathutils.Vector((float("-inf"), float("-inf"), float("-inf")))
    triangle_count = 0
    mesh_objects: list[str] = []
    for obj in model.children_recursive:
        if obj.type != "MESH":
            continue
        mesh_objects.append(obj.name)
        triangle_count += sum(max(0, len(poly.vertices) - 2) for poly in obj.data.polygons)
        for vertex in obj.data.vertices:
            world = obj.matrix_world @ vertex.co
            minimum.x = min(minimum.x, world.x)
            minimum.y = min(minimum.y, world.y)
            minimum.z = min(minimum.z, world.z)
            maximum.x = max(maximum.x, world.x)
            maximum.y = max(maximum.y, world.y)
            maximum.z = max(maximum.z, world.z)
    if not math.isfinite(minimum.x):
        raise RuntimeError("Model has no mesh vertices")
    gltf_minimum = [minimum.x, minimum.z, -maximum.y]
    gltf_maximum = [maximum.x, maximum.z, -minimum.y]
    return gltf_minimum, gltf_maximum, triangle_count, mesh_objects


def export_glb(model: bpy.types.Object) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    bpy.ops.object.select_all(action="DESELECT")
    model.select_set(True)
    for child in model.children_recursive:
        child.select_set(True)
    bpy.context.view_layer.objects.active = model
    bpy.ops.export_scene.gltf(
        filepath=str(GLB_PATH),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_tangents=True,
        export_cameras=False,
        export_lights=False,
        export_extras=True,
    )


def point_camera(camera: bpy.types.Object, target: tuple[float, float, float]) -> None:
    camera.rotation_euler = (mathutils.Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()


def render_cpu_preview(model: bpy.types.Object) -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.render.resolution_x = 640
    scene.render.resolution_y = 640
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.world.color = (0.018, 0.014, 0.010)
    shading = scene.display.shading
    shading.light = "STUDIO"
    shading.studio_light = "paint.sl"
    shading.color_type = "MATERIAL"
    shading.show_shadows = True
    shading.show_cavity = True
    shading.cavity_type = "WORLD"
    shading.curvature_ridge_factor = 1.3
    shading.curvature_valley_factor = 1.0

    preview_material = flat_material("PreviewFloor", (0.055, 0.038, 0.028, 1.0), 0.0, 0.88)
    bpy.ops.mesh.primitive_plane_add(size=12.0, location=(0.0, 0.0, -0.025))
    floor = bpy.context.object
    floor.name = "PreviewFloor"
    floor.data.materials.append(preview_material)
    # Keep the CPU review image fully framed: the ceramic terminals/bus rise
    # above the copper rotor and are part of the silhouette contract.
    bpy.ops.object.camera_add(location=(0.0, -11.0, 5.65))
    camera = bpy.context.object
    camera.name = "PreviewCamera"
    camera.data.lens = 55
    scene.camera = camera
    point_camera(camera, (0.0, 0.0, 2.55))
    scene.render.filepath = str(PREVIEW_PATH)
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(floor, do_unlink=True)
    bpy.data.objects.remove(camera, do_unlink=True)


def write_provenance(
    gltf_minimum: list[float],
    gltf_maximum: list[float],
    triangle_count: int,
    mesh_objects: list[str],
) -> None:
    dimensions = [gltf_maximum[index] - gltf_minimum[index] for index in range(3)]
    rotor_parts = [name for name in mesh_objects if "Rotor" in name]
    text = f"""# Ohmdal · candidato generador Manantial · 2026-09-07

Estado: candidato procedural para revisión independiente; no integrado ni aprobado artísticamente.

## Procedencia

- Geometría original determinista en Blender, sin descargas nuevas, proveedores generativos ni servicios pagos.
- Generador reproducible: `scripts/3d/build_manantial_generator_candidate.py`.
- Entrega: `assets/runtime/ohmdal/regional-heroes/manantial-generator.glb`.
- Texturas reutilizadas de la cantera CC0 existente: `assets/runtime/ohmdal/plaza/materials/stone-primary/diffuse-1k.jpg` y `assets/runtime/ohmdal/plaza/materials/iron-aged/diffuse-1k.jpg`.
- Referencia primaria: `assets/ohmdal/rooms/pilot-arco1/prop_taller_generator.png`.
- Contexto: `assets/ohmdal/hero/manantial.png`, `assets/ohmdal/rooms/pilot-arco1/manantial_ohm+prop_boca_manantial-v2.png`, `assets/ohmdal/rooms/pilot-arco1/prop_boca_manantial.png` y `assets/ohmdal/rooms/pilot-arco1/prop_terraces_sluice_gate.png`.

## Calibración y contrato de integración

- Unidades: metros; eje superior Y; frente visual glTF +Z; pivote grounded en Y=0.
- AABB glTF: min `{gltf_minimum}`, max `{gltf_maximum}`; dimensiones `{dimensions}`.
- Yaw de wrapper PlayCanvas recomendado: 180 grados, igual que los candidatos Forge/Faro.
- Anclaje de integración sugerido: raíz en `[0, 0.8, 22.55]` sobre el apron del Manantial; con wrapper yaw 180 la cara de potencia mira hacia el frente del powerhouse (`z≈20.9`). Debe revisarse visualmente contra el `turbineMesh`/`turbineRotor` actual antes de cablear.
- El GLB no define colliders, probes, controles ni estado eléctrico. No cambia anchors ni la ruta validada.
- `ManantialGeneratorRotorAssembly` queda separado para animación. Piezas rotor exportadas: `{rotor_parts}`.
- El origen real del assembly está en el centro del disco authored `(0, 2.45, 1.46)`, con los hijos preservando sus matrices mundiales. En el GLB el assembly queda trasladado a `[0, 1.46, -2.45]` por la conversión Y-up; el nodo `ManantialGeneratorRotor` parte en `[0, 0, 0]` dentro del assembly.
- El cilindro authored Blender tiene eje `+Z`; `export_yup=True` lo entrega como eje local GLB/PlayCanvas `+Y` (el rotor mesh tiene AABB local delgado en Y). En PlayCanvas se debe rotar sólo `ManantialGeneratorRotorAssembly` sobre su eje local `+Y` (`setLocalEulerAngles(0, degrees, 0)` o equivalente); no girar cada blade ni el root `ManantialGenerator`.
- El rotor puede girar con el estado restaurado; la emisión, la luz y el VFX siguen siendo runtime-owned. No hay glow permanente.

## Presupuesto medido

- Triángulos antes de exportación: `{triangle_count}`.
- Objetivo: <25k triángulos y <3 MB; el tamaño entregado debe verificarse después de cada regeneración.
- Preview CPU generado en `{PREVIEW_PATH}`; no es parte del runtime ni de la entrega.

## Decisiones visuales

La carcasa repite la lectura compacta del generador de la referencia: mejillas de hierro, tambor de cobre con aletas, rotor frontal, eje posterior, terminales cerámicos, bus superior y placa de medición. La bancada pale-stone conecta la máquina con la infraestructura cívica del Manantial. La pieza está pensada para sustituir el foco de cilindro/caja, no para cubrirlo con decoración.
"""
    PROVENANCE_PATH.write_text(text, encoding="utf-8")


def main() -> None:
    clear_scene()
    model, rotor = build_model()
    join_static_by_material(model, rotor)
    triangulate_for_export(model)
    gltf_minimum, gltf_maximum, triangle_count, mesh_objects = model_bounds(model)
    export_glb(model)
    render_cpu_preview(model)
    write_provenance(gltf_minimum, gltf_maximum, triangle_count, mesh_objects)
    print(f"GLB={GLB_PATH}")
    print(f"PROVENANCE={PROVENANCE_PATH}")
    print(f"PREVIEW={PREVIEW_PATH}")
    print(f"BOUNDS_MIN={json.dumps(gltf_minimum)}")
    print(f"BOUNDS_MAX={json.dumps(gltf_maximum)}")
    print(f"DIMS={json.dumps([gltf_maximum[i] - gltf_minimum[i] for i in range(3)])}")
    print(f"TRIANGLES={triangle_count}")
    print(f"GLB_BYTES={GLB_PATH.stat().st_size}")
    print(f"MESHES={len(mesh_objects)}")


if __name__ == "__main__":
    main()
