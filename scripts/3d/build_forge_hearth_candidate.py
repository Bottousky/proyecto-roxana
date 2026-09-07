"""Build the approved Ohmdal Forja hearth candidate in Blender.

This is a deterministic, provider-free candidate for visual review.  It is
kept outside the runtime on purpose: the existing gameplay root and collider
contract remain the source of truth until the candidate is accepted.

Authority:
  assets/references/hero-packs/forge/hero-reference.json
  assets/ohmdal/rooms/pilot-arco1/prop_forge_hearth_off.png

The authored model uses meters, +Y up and glTF +Z as its visual front.  Blender
is Z-up, so the authored hierarchy receives a +90 degree X wrapper before
export; Blender's axis conversion then preserves the authored dimensions in
glTF.  The PlayCanvas integration wrapper should additionally apply the
project's documented 180 degree yaw correction when the candidate is placed
in the runtime.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import bpy
import mathutils


ROOT = Path(__file__).resolve().parents[2]
CANDIDATE_DIR = ROOT / "assets/source/ohmdal/forge/candidate"
BLEND_PATH = CANDIDATE_DIR / "forge_hearth_candidate.blend"
GLB_PATH = CANDIDATE_DIR / "forge_hearth_candidate.glb"
CALIBRATION_PATH = CANDIDATE_DIR / "calibration.json"
PREVIEW_DIR = CANDIDATE_DIR / "preview"

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


def _set_color_space(image: bpy.types.Image, colorspace: str) -> None:
    try:
        image.colorspace_settings.name = colorspace
    except (AttributeError, TypeError):
        # Blender versions which expose a read-only color space still export
        # the image correctly; the material remains useful in the preview.
        pass


def _load_image(path: Path, colorspace: str) -> bpy.types.Image | None:
    if not path.exists():
        return None
    image = bpy.data.images.load(str(path), check_existing=True)
    _set_color_space(image, colorspace)
    return image


def _load_delivery_image(path: Path, colorspace: str, label: str) -> bpy.types.Image | None:
    """Copy a local CC0 source into a 512 px candidate delivery texture.

    The source image is never modified.  A fresh image datablock is loaded
    from the candidate copy after scaling so the GLB exporter cannot retain a
    reference to the original 1K file.
    """

    if not path.exists():
        return None
    delivery_dir = CANDIDATE_DIR / "textures"
    delivery_dir.mkdir(parents=True, exist_ok=True)
    suffix = ".png" if path.suffix.lower() == ".png" else ".jpg"
    delivery_path = delivery_dir / f"{label}-512{suffix}"
    source = bpy.data.images.load(str(path), check_existing=False)
    if tuple(source.size) != (512, 512):
        source.scale(512, 512)
    source.filepath_raw = str(delivery_path)
    source.file_format = "PNG" if suffix == ".png" else "JPEG"
    source.save()
    bpy.data.images.remove(source)
    delivery = bpy.data.images.load(str(delivery_path), check_existing=False)
    _set_color_space(delivery, colorspace)
    return delivery


def _node_link_image(
    nodes: bpy.types.Nodes,
    links: bpy.types.NodeLinks,
    bsdf: bpy.types.Node,
    image: bpy.types.Image | None,
    socket_name: str,
) -> None:
    if image is None or socket_name not in bsdf.inputs:
        return
    texture = nodes.new("ShaderNodeTexImage")
    texture.image = image
    texture.interpolation = "Linear"
    links.new(texture.outputs["Color"], bsdf.inputs[socket_name])


def pbr_material(
    name: str,
    base: tuple[float, float, float, float],
    metallic: float,
    roughness: float,
    texture_dir: Path | None = None,
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

    if texture_dir is not None:
        texture_prefix = texture_dir.name
        diffuse = _load_delivery_image(
            texture_dir / "diffuse-1k.jpg", "sRGB", f"{texture_prefix}-diffuse"
        )
        normal = _load_delivery_image(
            texture_dir / "normal-1k.png", "Non-Color", f"{texture_prefix}-normal"
        )
        rough = _load_delivery_image(
            texture_dir / "roughness-1k.jpg", "Non-Color", f"{texture_prefix}-roughness"
        )
        metal = _load_delivery_image(
            texture_dir / "metalness-1k.jpg", "Non-Color", f"{texture_prefix}-metalness"
        )
        _node_link_image(nodes, links, bsdf, diffuse, "Base Color")
        _node_link_image(nodes, links, bsdf, rough, "Roughness")
        _node_link_image(nodes, links, bsdf, metal, "Metallic")
        if normal is not None and "Normal" in bsdf.inputs:
            texture = nodes.new("ShaderNodeTexImage")
            texture.image = normal
            texture.interpolation = "Linear"
            normal_map = nodes.new("ShaderNodeNormalMap")
            normal_map.inputs["Strength"].default_value = 0.52
            links.new(texture.outputs["Color"], normal_map.inputs["Color"])
            links.new(normal_map.outputs["Normal"], bsdf.inputs["Normal"])
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
) -> bpy.types.Object:
    obj.data.materials.append(material)
    obj.parent = root
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
    obj.select_set(False)
    return obj


def cylinder(
    name: str,
    location: tuple[float, float, float],
    radius: float,
    depth: float,
    material: bpy.types.Material,
    root: bpy.types.Object,
    vertices: int = 32,
    # Authoring is Y-up while Blender primitives are Z-up.  Rotate the
    # primitive's Z axis into authored +Y by default.  Callers that need a
    # horizontal fastener can still provide an explicit authored rotation.
    rotation: tuple[float, float, float] = (math.radians(90.0), 0.0, 0.0),
    bevel: float = 0.0,
    smooth: bool = False,
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
    return finish_mesh(obj, material, root, bevel=bevel, smooth=smooth)


def box(
    name: str,
    location: tuple[float, float, float],
    dimensions: tuple[float, float, float],
    material: bpy.types.Material,
    root: bpy.types.Object,
    rotation: tuple[float, float, float] = (0.0, 0.0, 0.0),
    bevel: float = 0.0,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    return finish_mesh(obj, material, root, bevel=bevel, smooth=False)


def torus(
    name: str,
    location: tuple[float, float, float],
    major_radius: float,
    minor_radius: float,
    material: bpy.types.Material,
    root: bpy.types.Object,
    major_segments: int = 40,
    minor_segments: int = 8,
    # A Blender torus lies in XY around Z; authored horizontal rings lie in
    # XZ around +Y, hence the same authored-Y-up correction as cylinders.
    rotation: tuple[float, float, float] = (math.radians(90.0), 0.0, 0.0),
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
    return finish_mesh(obj, material, root, smooth=True)


def beam_between(
    name: str,
    start: mathutils.Vector,
    end: mathutils.Vector,
    radius: float,
    material: bpy.types.Material,
    root: bpy.types.Object,
    vertices: int = 20,
) -> bpy.types.Object:
    direction = end - start
    length = direction.length
    if length <= 1e-6:
        raise ValueError(f"Cannot create zero-length beam {name}")
    midpoint = (start + end) * 0.5
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=length,
        location=midpoint,
    )
    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = direction.to_track_quat("Z", "Y")
    return finish_mesh(obj, material, root, smooth=True)


def annulus(
    name: str,
    outer_radius: float,
    inner_radius: float,
    bottom: float,
    top: float,
    material: bpy.types.Material,
    root: bpy.types.Object,
    sides: int = 64,
) -> bpy.types.Object:
    if not 0.0 < inner_radius < outer_radius:
        raise ValueError(f"Invalid annulus radii for {name}")
    vertices: list[tuple[float, float, float]] = []
    for radius, y in (
        (outer_radius, bottom),
        (outer_radius, top),
        (inner_radius, top),
        (inner_radius, bottom),
    ):
        for index in range(sides):
            angle = (index / sides) * math.tau
            vertices.append((math.cos(angle) * radius, y, math.sin(angle) * radius))

    faces: list[tuple[int, ...]] = []
    for index in range(sides):
        nxt = (index + 1) % sides
        outer_bottom = index
        outer_top = sides + index
        inner_top = sides * 2 + index
        inner_bottom = sides * 3 + index
        outer_bottom_next = nxt
        outer_top_next = sides + nxt
        inner_top_next = sides * 2 + nxt
        inner_bottom_next = sides * 3 + nxt
        # Outer wall, inner wall, top rim, and underside rim.
        faces.append((outer_bottom, outer_top, outer_top_next, outer_bottom_next))
        faces.append((inner_top, inner_bottom, inner_bottom_next, inner_top_next))
        faces.append((outer_top, inner_top, inner_top_next, outer_top_next))
        faces.append((outer_bottom, outer_bottom_next, inner_bottom_next, inner_bottom))

    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update(calc_edges=True)
    uv_layer = mesh.uv_layers.new(name="UVMap")
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            vertex = mesh.loops[loop_index].vertex_index
            x, y, z = vertices[vertex]
            if abs(polygon.normal.y) > 0.5:
                uv_layer.data[loop_index].uv = (
                    x / (outer_radius * 2.0) + 0.5,
                    z / (outer_radius * 2.0) + 0.5,
                )
            else:
                uv_layer.data[loop_index].uv = (
                    (math.atan2(z, x) / math.tau) % 1.0 * 3.0,
                    (y - bottom) / max(top - bottom, 1e-6) * 1.6,
                )
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return finish_mesh(obj, material, root, bevel=0.018, smooth=False)


def empty(name: str, parent: bpy.types.Object | None = None) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "PLAIN_AXES"
    obj.empty_display_size = 0.08
    bpy.context.scene.collection.objects.link(obj)
    if parent is not None:
        obj.parent = parent
    return obj


def join_meshes(objects: list[bpy.types.Object], name: str, root: bpy.types.Object) -> bpy.types.Object:
    if not objects:
        raise RuntimeError(f"Cannot join empty object group {name}")
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


def join_static_by_material(model: bpy.types.Object) -> None:
    """Collapse static draw calls while preserving ThermalElement as a node.

    The authored semantic pieces are deliberately created separately so their
    dimensions and placement stay easy to audit.  Before export, all pieces
    sharing one of the four static materials are joined.  The thermal element
    remains its own mesh for state inspection by a future runtime loader.
    """

    groups: dict[str, list[bpy.types.Object]] = {}
    for obj in list(model.children_recursive):
        if obj.type != "MESH" or obj.name == "ThermalElement":
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
    """Make every exported primitive tangent-compatible without changing shape."""

    for obj in list(model.children_recursive):
        if obj.type != "MESH":
            continue
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        modifier = obj.modifiers.new(name="ExportTriangulate", type="TRIANGULATE")
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        obj.select_set(False)


def build_model() -> bpy.types.Object:
    stone = pbr_material(
        "ForgeHearth_Stone",
        (0.44, 0.39, 0.32, 1.0),
        0.08,
        0.72,
        STONE_DIR,
    )
    iron = pbr_material(
        "ForgeHearth_Iron",
        (0.075, 0.065, 0.055, 1.0),
        0.68,
        0.45,
        IRON_DIR,
    )
    copper = flat_material("ForgeHearth_Copper", (0.46, 0.13, 0.045, 1.0), 0.72, 0.36)
    ceramic = flat_material("ForgeHearth_Ceramic", (0.68, 0.59, 0.43, 1.0), 0.04, 0.62)
    thermal = flat_material("ForgeHearth_ThermalElement", (0.56, 0.035, 0.012, 1.0), 0.18, 0.38)

    model = empty("model")
    model["asset_id"] = "rx_ohmdal_forge_hearth_candidate_01"
    model["front_axis"] = "+Z"
    model["gltf_front_axis"] = "+Z"
    model["playcanvas_wrapper_yaw_degrees"] = 180
    model["units"] = "meter"
    model["grounded_pivot"] = True
    model["gameplay_root"] = "existing runtime ForgeHeater; untouched"
    model["authoring_axis"] = "Y-up"
    model["blender_wrapper_rotation_x_degrees"] = 90

    # Pale stone plinth stays within the exact 4.6 m hero diameter.
    cylinder("StonePlinth", (0.0, 0.20, 0.0), 2.30, 0.40, stone, model, vertices=64, bevel=0.045)
    cylinder("StoneTopCourse", (0.0, 0.46, 0.0), 2.18, 0.12, stone, model, vertices=64, bevel=0.025)

    # Open circular bowl.  The annular wall deliberately has no roof or
    # chimney: the dark floor and central grate remain visible from above.
    annulus("BowlIronWall", 2.22, 1.78, 0.50, 1.05, iron, model)
    annulus("BowlIronRim", 2.30, 1.64, 1.00, 1.20, iron, model)
    cylinder("BowlInteriorFloor", (0.0, 0.57, 0.0), 1.77, 0.12, iron, model, vertices=64, bevel=0.02)
    cylinder("CentralGrateBed", (0.0, 0.73, 0.0), 1.48, 0.08, iron, model, vertices=48, bevel=0.01)

    grate_parts: list[bpy.types.Object] = []
    for index, rotation in enumerate((0.0, math.radians(45.0), math.radians(90.0), math.radians(135.0))):
        grate_parts.append(
            box(
                f"CentralGrateBar{index + 1}",
                (0.0, 0.81, 0.0),
                (2.55, 0.09, 0.12),
                iron,
                model,
                rotation=(0.0, rotation, 0.0),
                bevel=0.018,
            )
        )
    join_meshes(grate_parts, "CentralGrate", model)

    # Copper structural bands and visible mechanical rivets.
    torus("CopperLowerBand", (0.0, 0.75, 0.0), 2.20, 0.065, copper, model)
    torus("CopperUpperBand", (0.0, 1.16, 0.0), 2.22, 0.060, copper, model)
    for index in range(8):
        angle = (index / 8.0) * math.tau
        x, z = math.cos(angle) * 2.22, math.sin(angle) * 2.22
        cylinder(
            f"CopperRivet{index + 1}",
            (x, 0.80, z),
            0.050,
            0.10,
            copper,
            model,
            vertices=20,
            rotation=(math.radians(90.0), 0.0, 0.0),
            bevel=0.012,
        )

    # Four ceramic terminal columns with copper collars and a collector ring.
    terminal_positions: list[mathutils.Vector] = []
    for index, angle in enumerate((45.0, 135.0, 225.0, 315.0)):
        radians = math.radians(angle)
        position = mathutils.Vector((math.cos(radians) * 1.88, 0.0, math.sin(radians) * 1.88))
        terminal_positions.append(position)
        x, z = position.x, position.z
        vertical = (math.radians(90.0), 0.0, 0.0)
        cylinder(
            f"TerminalCeramic{index + 1}",
            (x, 1.24, z),
            0.19,
            1.46,
            ceramic,
            model,
            vertices=24,
            rotation=vertical,
            bevel=0.018,
            smooth=True,
        )
        torus(f"TerminalLowerCollar{index + 1}", (x, 0.56, z), 0.21, 0.045, copper, model, major_segments=24)
        torus(f"TerminalUpperCollar{index + 1}", (x, 1.92, z), 0.22, 0.045, copper, model, major_segments=24)
        cylinder(
            f"TerminalPost{index + 1}",
            (x, 2.39, z),
            0.065,
            0.42,
            copper,
            model,
            vertices=20,
            rotation=vertical,
            bevel=0.01,
        )

    torus("CopperCollectorRing", (0.0, 2.16, 0.0), 1.84, 0.055, copper, model, major_segments=48)
    for index, position in enumerate(terminal_positions):
        inner = mathutils.Vector((position.x * 0.73, 2.16, position.z * 0.73))
        outer = mathutils.Vector((position.x, 2.16, position.z))
        beam_between(f"CollectorArm{index + 1}", inner, outer, 0.052, copper, model)

    # A separate, non-emissive thermal element remains inspectable as its own
    # semantic mesh. It is not a global glow and does not alter gameplay state.
    thermal_parts: list[bpy.types.Object] = [
        torus("ThermalElementRing", (0.0, 0.90, 0.0), 0.86, 0.075, thermal, model, major_segments=40),
        box("ThermalElementBarA", (0.0, 0.90, 0.0), (1.55, 0.075, 0.12), thermal, model, bevel=0.018),
        box("ThermalElementBarB", (0.0, 0.905, 0.0), (1.55, 0.075, 0.12), thermal, model, rotation=(0.0, math.radians(90.0), 0.0), bevel=0.018),
    ]
    join_meshes(thermal_parts, "ThermalElement", model)

    model["material_count"] = 5
    model["thermal_element_emissive"] = False
    # Keep the source hierarchy authored in the documented Y-up convention.
    # Blender evaluates meshes in Z-up; this wrapper maps authored +Y to
    # Blender +Z before glTF export maps it back to glTF +Y.
    model.rotation_mode = "XYZ"
    model.rotation_euler = (math.radians(90.0), 0.0, 0.0)
    return model


def model_bounds(model: bpy.types.Object) -> tuple[list[float], list[float], int]:
    bpy.context.view_layer.update()
    minimum = mathutils.Vector((float("inf"), float("inf"), float("inf")))
    maximum = mathutils.Vector((float("-inf"), float("-inf"), float("-inf")))
    triangle_count = 0
    for obj in model.children_recursive:
        if obj.type != "MESH":
            continue
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
    return [minimum.x, minimum.y, minimum.z], [maximum.x, maximum.y, maximum.z], triangle_count


def write_calibration(model: bpy.types.Object) -> None:
    minimum, maximum, triangle_count = model_bounds(model)
    # The exporter maps Blender coordinates (x, y, z) to glTF (x, z, -y).
    # Record the post-wrapper bounds in the consumer's Y-up coordinate space,
    # rather than exposing Blender's implementation axes in calibration.json.
    gltf_minimum = [minimum[0], minimum[2], -maximum[1]]
    gltf_maximum = [maximum[0], maximum[2], -minimum[1]]
    dimensions = [gltf_maximum[index] - gltf_minimum[index] for index in range(3)]
    mesh_objects = [obj for obj in model.children_recursive if obj.type == "MESH"]
    materials = sorted({material.name for obj in mesh_objects for material in obj.data.materials if material})
    calibration = {
        "schemaVersion": 1,
        "assetId": model["asset_id"],
        "source": "assets/source/ohmdal/forge/candidate/forge_hearth_candidate.blend",
        "glb": "assets/source/ohmdal/forge/candidate/forge_hearth_candidate.glb",
        "root": "model",
        "units": "meter",
        "boundsSource": "vertices",
        "aabb": {"min": gltf_minimum, "max": gltf_maximum},
        "dims": dimensions,
        "center": [(gltf_minimum[index] + gltf_maximum[index]) / 2.0 for index in range(3)],
        "groundOffset": 0.0 if abs(gltf_minimum[1]) < 1e-5 else -gltf_minimum[1],
        "intended": {"diameter": 4.6, "height": 2.6},
        "frontAxis": "glTF +Z",
        "playCanvasWrapperYaw": 180,
        "authoringAxis": "Y-up",
        "blenderWrapperRotationX": 90,
        "groundedPivot": True,
        "triangleCountBeforeExport": triangle_count,
        "materialCount": len(materials),
        "materials": materials,
        "semanticMeshes": [obj.name for obj in mesh_objects],
        "gameplay": {
            "root": "existing runtime ForgeHeater",
            "colliders": "untouched",
            "integration": "visual candidate only; no runtime wiring in this task",
        },
        "references": {
            "primary": "assets/ohmdal/rooms/pilot-arco1/prop_forge_hearth_off.png",
            "supporting": [
                "assets/ohmdal/rooms/pilot-arco1/prop_forge_hearth_on.png",
                "assets/ohmdal/rooms/pilot-arco1/prop_fuses_hanging.png",
            ],
        },
        "deliveryTextures": {
            "resolution": 512,
            "directory": "assets/source/ohmdal/forge/candidate/textures",
            "files": sorted(
                path.name for path in (CANDIDATE_DIR / "textures").glob("*") if path.is_file()
            ),
        },
    }
    CALIBRATION_PATH.write_text(json.dumps(calibration, indent=2) + "\n", encoding="utf-8")


def export_master(model: bpy.types.Object) -> None:
    CANDIDATE_DIR.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.render.engine = "BLENDER_WORKBENCH"
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))

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
    direction = mathutils.Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render_previews(model: bpy.types.Object) -> None:
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.render.resolution_x = 512
    scene.render.resolution_y = 512
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

    preview_floor_material = flat_material("PreviewFloor", (0.065, 0.044, 0.032, 1.0), 0.0, 0.88)
    bpy.ops.mesh.primitive_plane_add(size=10.0, location=(0.0, 0.0, -0.025))
    floor = bpy.context.object
    floor.name = "PreviewFloor"
    floor.data.materials.append(preview_floor_material)

    bpy.ops.object.camera_add()
    camera = bpy.context.object
    camera.name = "PreviewCamera"
    camera.data.lens = 53
    scene.camera = camera
    views = {
        # Authored +Z front becomes Blender -Y after the authored Y-up wrapper.
        "front": ((0.0, -6.4, 4.6), (0.0, 0.0, 0.95)),
        "three-quarter": ((4.8, -5.8, 5.0), (0.0, 0.0, 0.95)),
    }
    for view_name, (location, target) in views.items():
        camera.location = location
        point_camera(camera, target)
        scene.render.filepath = str(PREVIEW_DIR / f"forge-hearth-candidate-{view_name}.png")
        bpy.ops.render.render(write_still=True)

    # Preview helpers are deliberately not saved into the source master.
    bpy.data.objects.remove(floor, do_unlink=True)
    bpy.data.objects.remove(camera, do_unlink=True)


def main() -> None:
    clear_scene()
    model = build_model()
    join_static_by_material(model)
    triangulate_for_export(model)
    write_calibration(model)
    export_master(model)
    render_previews(model)
    print(f"BLEND={BLEND_PATH}")
    print(f"GLB={GLB_PATH}")
    print(f"CALIBRATION={CALIBRATION_PATH}")
    print(f"PREVIEWS={PREVIEW_DIR}")


if __name__ == "__main__":
    main()
