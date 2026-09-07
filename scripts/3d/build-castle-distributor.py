"""Build the authored Ohmdal Castle central distribution station.

The station is a visual replacement for the existing central panel and its
oversized authored platform rings.  It preserves the accepted world model:
the original input, return, trip, branch conductors and branch isolators stay
in the runtime.  This asset only supplies the readable switchgear housing,
three terminal ceramics, short supported branch ducts and a closed service
hatch.

Authoring contract: metres, +Y up, +Z front.  Blender's Z-up coordinates are
converted explicitly at export time.  No external textures or providers are
used.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/runtime/ohmdal/regional-heroes/castle-distributor"
OUT.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)


def point(value: tuple[float, float, float]) -> tuple[float, float, float]:
    """Convert authored PlayCanvas [x, y, z] to Blender [x, -z, y]."""

    return (value[0], -value[2], value[1])


def srgb_to_linear(value: float) -> float:
    """Convert display-space swatches to Principled scene-linear values."""

    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def make_material(
    name: str,
    color: tuple[float, float, float],
    roughness: float,
    metallic: float = 0.0,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = (*color, 1.0)
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf is None:
        raise RuntimeError(f"Principled BSDF missing for {name}")
    linear_color = tuple(srgb_to_linear(channel) for channel in color)
    bsdf.inputs["Base Color"].default_value = (*linear_color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return material


MATERIALS = {
    "iron": make_material("CastleDistributorIronDark", (0.055, 0.065, 0.064), 0.58, 0.78),
    "enamel": make_material("CastleDistributorEnamelGreen", (0.145, 0.205, 0.18), 0.72, 0.18),
    "trim": make_material("CastleDistributorTrimSteel", (0.12, 0.13, 0.125), 0.48, 0.72),
    "copper": make_material("CastleDistributorCopperAged", (0.33, 0.12, 0.035), 0.50, 0.74),
    "ceramic": make_material("CastleDistributorCeramic", (0.62, 0.56, 0.43), 0.78, 0.0),
    "indicator": make_material("CastleDistributorIndicatorGlass", (0.16, 0.24, 0.22), 0.48, 0.05),
}


def metric_uv(obj: bpy.types.Object) -> None:
    """Assign stable planar UVs from face normal and local position."""

    mesh = obj.data
    if mesh.uv_layers:
        mesh.uv_layers.remove(mesh.uv_layers[0])
    uv_layer = mesh.uv_layers.new(name="UVMap")
    for polygon in mesh.polygons:
        normal = polygon.normal
        axis = max(range(3), key=lambda index: abs(normal[index]))
        axes = [index for index in range(3) if index != axis]
        for loop_index in polygon.loop_indices:
            vertex = mesh.vertices[mesh.loops[loop_index].vertex_index].co
            uv_layer.data[loop_index].uv = (
                vertex[axes[0]] * 0.5,
                vertex[axes[1]] * 0.5,
            )


def finish(
    obj: bpy.types.Object,
    material: bpy.types.Material,
    bevel: float = 0.0,
    smooth: bool = False,
) -> bpy.types.Object:
    obj.data.materials.append(material)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0.0:
        modifier = obj.modifiers.new("SmallMechanicalBevel", "BEVEL")
        modifier.width = bevel
        modifier.segments = 2
        modifier.limit_method = "ANGLE"
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    metric_uv(obj)
    for polygon in obj.data.polygons:
        polygon.use_smooth = smooth
    obj.select_set(False)
    return obj


def box(
    name: str,
    position: tuple[float, float, float],
    size: tuple[float, float, float],
    material: bpy.types.Material,
    bevel: float = 0.018,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=point(position))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (size[0], size[2], size[1])
    return finish(obj, material, bevel)


def cylinder(
    name: str,
    position: tuple[float, float, float],
    radius: float,
    height: float,
    material: bpy.types.Material,
    axis: str = "y",
    sides: int = 16,
    bevel: float = 0.012,
) -> bpy.types.Object:
    # Blender Z maps to authored +Y.  Blender -Y maps to authored +Z, so a
    # +90° X rotation places bolts and side collars on the authored front.
    rotation = (
        (math.radians(90.0), 0.0, 0.0)
        if axis == "z"
        else (0.0, math.radians(90.0), 0.0)
        if axis == "x"
        else (0.0, 0.0, 0.0)
    )
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=sides,
        radius=radius,
        depth=height,
        location=point(position),
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    return finish(obj, material, bevel, smooth=False)


def beam_between(
    name: str,
    start: tuple[float, float, float],
    end: tuple[float, float, float],
    width: float,
    height: float,
    material: bpy.types.Material,
    bevel: float = 0.012,
) -> bpy.types.Object:
    start_blender = Vector(point(start))
    end_blender = Vector(point(end))
    delta = end_blender - start_blender
    midpoint = (start_blender + end_blender) * 0.5
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=midpoint)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (width, height, delta.length)
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = delta.to_track_quat("Z", "Y")
    obj.rotation_mode = "XYZ"
    return finish(obj, material, bevel)


def sloped_front_panel(
    name: str,
    half_width: float,
    y_bottom: float,
    y_top: float,
    z_front_bottom: float,
    z_front_top: float,
    thickness: float,
    material: bpy.types.Material,
    bevel: float = 0.012,
) -> bpy.types.Object:
    """Make a shallow inclined front frame without a hidden gameplay door."""

    vertices_authored = [
        (-half_width, y_bottom, z_front_bottom),
        (half_width, y_bottom, z_front_bottom),
        (half_width, y_top, z_front_top),
        (-half_width, y_top, z_front_top),
        (-half_width, y_bottom, z_front_bottom + thickness),
        (half_width, y_bottom, z_front_bottom + thickness),
        (half_width, y_top, z_front_top + thickness),
        (-half_width, y_top, z_front_top + thickness),
    ]
    vertices = [point(vertex) for vertex in vertices_authored]
    faces = [
        (0, 1, 2, 3),
        (4, 7, 6, 5),
        (0, 4, 5, 1),
        (1, 5, 6, 2),
        (2, 6, 7, 3),
        (3, 7, 4, 0),
    ]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish(obj, material, bevel)


def add_anchor(
    name: str,
    position: tuple[float, float, float],
    role: str,
) -> bpy.types.Object:
    anchor = bpy.data.objects.new(name, None)
    anchor.empty_display_type = "PLAIN_AXES"
    anchor.empty_display_size = 0.20
    anchor.location = point(position)
    anchor["role"] = role
    bpy.context.collection.objects.link(anchor)
    return anchor


model_root = bpy.data.objects.new("CastleDistributorRoot", None)
model_root.empty_display_type = "CUBE"
model_root.empty_display_size = 0.4
model_root["assemblyOrigin"] = "CastleDistributionPanel local [0, 0, 0]"
model_root["worldAssemblyOrigin"] = "castleRoot world [60, 0, 0]"
model_root["upAxis"] = "+Y"
model_root["frontAxis"] = "+Z"
model_root["footprint"] = "x[-1.9,1.9], y[0,1.8], z[-0.6,0.6]"
bpy.context.collection.objects.link(model_root)

# The main housing keeps the exact accepted panel footprint: 3.8 m wide,
# 1.2 m deep and 1.8 m tall.  Its face is on -Z, where the existing panel
# input/trip/return interactions remain visible in front of the replacement.
box("CastleDistributorBasePlinth", (0.0, 0.10, 0.0), (3.78, 0.20, 1.18), MATERIALS["trim"], 0.045)
box("CastleDistributorHousing", (0.0, 0.98, 0.0), (3.68, 1.56, 1.08), MATERIALS["enamel"], 0.055)
box("CastleDistributorLowerChassis", (0.0, 0.30, 0.0), (3.74, 0.28, 1.15), MATERIALS["iron"], 0.035)
box("CastleDistributorTopCap", (0.0, 1.78, 0.0), (3.72, 0.14, 1.10), MATERIALS["iron"], 0.025)

# Recessed front panel plus a shallow, visibly inclined iron frame.
box("CastleDistributorFrontRecess", (0.0, 1.08, -0.565), (3.08, 0.92, 0.06), MATERIALS["iron"], 0.018)
box("CastleDistributorEnamelInset", (0.0, 1.08, -0.605), (2.72, 0.66, 0.045), MATERIALS["enamel"], 0.012)
box("CastleDistributorFrameLeft", (-1.60, 1.10, -0.66), (0.14, 1.32, 0.13), MATERIALS["trim"], 0.018)
box("CastleDistributorFrameRight", (1.60, 1.10, -0.66), (0.14, 1.32, 0.13), MATERIALS["trim"], 0.018)
box("CastleDistributorFrameBottom", (0.0, 0.39, -0.66), (3.34, 0.14, 0.13), MATERIALS["trim"], 0.018)
sloped_front_panel(
    "CastleDistributorFrameInclinedTop",
    1.67,
    1.72,
    1.93,
    -0.70,
    -0.55,
    0.13,
    MATERIALS["trim"],
    0.018,
)

# Three quiet indicator windows are matte, state-neutral geometry.  No
# emissive channel is used; the runtime state remains the source of truth.
for index, x in enumerate((-1.0, 0.0, 1.0)):
    box(f"CastleDistributorIndicatorFrame{index}", (x, 1.10, -0.67), (0.43, 0.25, 0.035), MATERIALS["trim"], 0.008)
    box(f"CastleDistributorIndicatorWindow{index}", (x, 1.10, -0.695), (0.27, 0.11, 0.018), MATERIALS["indicator"], 0.004)

# Twelve silhouette fasteners on the frame.
bolt_positions = [
    (-1.55, 0.37), (1.55, 0.37), (-1.55, 1.73), (1.55, 1.73),
    (-1.55, 1.05), (1.55, 1.05),
    (-0.78, 0.37), (0.0, 0.37), (0.78, 0.37),
    (-0.78, 1.73), (0.0, 1.73), (0.78, 1.73),
]
for index, (x, y) in enumerate(bolt_positions):
    cylinder(
        f"CastleDistributorBolt{index + 1}",
        (x, y, -0.745),
        0.052,
        0.065,
        MATERIALS["copper"],
        axis="z",
        sides=8,
        bevel=0.006,
    )

# Three ceramic terminal heads sit above the housing and remain visually
# distinct from the existing branch isolators farther out on the floor.
for index, x in enumerate((-1.08, 0.0, 1.08)):
    cylinder(f"CastleDistributorCeramicTerminal{index}", (x, 1.91, 0.0), 0.14, 0.34, MATERIALS["ceramic"], sides=12, bevel=0.012)
    cylinder(f"CastleDistributorTerminalCap{index}", (x, 2.11, 0.0), 0.17, 0.07, MATERIALS["copper"], sides=12, bevel=0.010)
    cylinder(f"CastleDistributorTerminalStem{index}", (x, 1.73, 0.0), 0.055, 0.18, MATERIALS["trim"], sides=8, bevel=0.008)

# Short supported duct stubs point toward the existing three branch conductors.
# They stop before the original conductors, so this asset never replaces or
# changes their state, routing or interaction.
for side, sign in (("West", -1.0), ("East", 1.0)):
    box(
        f"CastleDistributorDuct{side}Horizontal",
        (sign * 2.02, 0.38, 0.0),
        (0.70, 0.18, 0.18),
        MATERIALS["iron"],
        0.020,
    )
    box(
        f"CastleDistributorDuct{side}Elbow",
        (sign * 2.34, 0.55, 0.0),
        (0.18, 0.52, 0.18),
        MATERIALS["copper"],
        0.018,
    )
    cylinder(
        f"CastleDistributorDuct{side}Collar",
        (sign * 2.39, 0.55, 0.0),
        0.13,
        0.10,
        MATERIALS["trim"],
        axis="x",
        sides=12,
        bevel=0.008,
    )
box("CastleDistributorDuctNorthHorizontal", (0.0, 0.38, 0.98), (0.18, 0.18, 0.74), MATERIALS["iron"], 0.020)
box("CastleDistributorDuctNorthElbow", (0.0, 0.55, 1.32), (0.18, 0.52, 0.18), MATERIALS["copper"], 0.018)
cylinder("CastleDistributorDuctNorthCollar", (0.0, 0.55, 1.39), 0.13, 0.10, MATERIALS["trim"], axis="z", sides=12, bevel=0.008)

# Side ventilation grilles break the enamel plane with a functional pattern.
for side, sign in (("West", -1.0), ("East", 1.0)):
    for index, y in enumerate((0.85, 1.05, 1.25)):
        box(
            f"CastleDistributorVent{side}{index}",
            (sign * 1.86, y, 0.0),
            (0.08, 0.075, 0.58),
            MATERIALS["iron"],
            0.008,
        )

# A low closed maintenance hatch on the rear of the housing is visual only.
box("CastleDistributorClosedHatch", (0.0, 0.88, 0.57), (0.82, 0.78, 0.06), MATERIALS["iron"], 0.018)
box("CastleDistributorHatchTrimTop", (0.0, 1.30, 0.61), (0.96, 0.07, 0.06), MATERIALS["trim"], 0.008)
box("CastleDistributorHatchTrimBottom", (0.0, 0.46, 0.61), (0.96, 0.07, 0.06), MATERIALS["trim"], 0.008)

for name, position, role in (
    ("CastleDistributorPanelAnchor", (0.0, 0.0, 0.0), "existing CastleDistributionPanel local origin"),
    ("CastleDistributorFrontAnchor", (0.0, 1.08, -0.70), "preserve panel front interaction"),
    ("CastleDistributorBranchWestAnchor", (-2.38, 0.38, 0.0), "visual stub toward CastleBranchA"),
    ("CastleDistributorBranchEastAnchor", (2.38, 0.38, 0.0), "visual stub toward CastleBranchB"),
    ("CastleDistributorBranchNorthAnchor", (0.0, 0.38, 1.42), "visual stub toward CastleBranchC"),
):
    anchor = add_anchor(name, position, role)
    anchor.parent = model_root


SOURCE_ENTITIES_TO_HIDE = [
    "CastlePanelBody",
    "CastlePanelFace",
    "CastleDistributorPlinth",
    "CastleDistributorCopperRim",
    "CastleDistributorCore",
]

SOURCE_ENTITIES_PRESERVED = [
    "CastlePanelBusKnob",
    "CastlePanelInput",
    "CastlePanelTripPin",
    "CastlePanelReturnLink",
    "CastleMainBus",
    "CastleBranchA",
    "CastleBranchB",
    "CastleBranchC",
    "CastleBranchIsolatorA",
    "CastleBranchIsolatorB",
    "CastleBranchIsolatorC",
    "CastleIsolatorCeramic1",
    "CastleIsolatorCeramic2",
    "CastleIsolatorCeramic3",
    "CastleServiceLoadA",
    "CastleServiceLoadB",
    "CastleServiceLoadC",
]


def join_by_material() -> None:
    for key, material in MATERIALS.items():
        objects = [
            obj
            for obj in bpy.context.scene.objects
            if obj.type == "MESH"
            and obj.data.materials
            and obj.data.materials[0] == material
        ]
        if not objects:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objects[0]
        bpy.context.scene.cursor.location = (0.0, 0.0, 0.0)
        bpy.ops.object.join()
        assembly = bpy.context.object
        assembly.name = f"CastleDistributor_{key.title()}Assembly"
        bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
        assembly.parent = model_root
        assembly.select_set(False)

    for obj in [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        modifier = obj.modifiers.new("DeliveryTriangles", "TRIANGULATE")
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        obj.select_set(False)


join_by_material()


def scene_metrics() -> dict:
    minimum = Vector((float("inf"), float("inf"), float("inf")))
    maximum = Vector((float("-inf"), float("-inf"), float("-inf")))
    triangles = 0
    meshes = 0
    materials: set[str] = set()
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        meshes += 1
        triangles += sum(max(0, len(poly.vertices) - 2) for poly in obj.data.polygons)
        for slot in obj.material_slots:
            if slot.material:
                materials.add(slot.material.name)
        for vertex in obj.data.vertices:
            world = obj.matrix_world @ vertex.co
            minimum.x = min(minimum.x, world.x)
            minimum.y = min(minimum.y, world.y)
            minimum.z = min(minimum.z, world.z)
            maximum.x = max(maximum.x, world.x)
            maximum.y = max(maximum.y, world.y)
            maximum.z = max(maximum.z, world.z)
    gltf_minimum = [minimum.x, minimum.z, -maximum.y]
    gltf_maximum = [maximum.x, maximum.z, -minimum.y]
    dimensions = [gltf_maximum[index] - gltf_minimum[index] for index in range(3)]
    center = [(gltf_minimum[index] + gltf_maximum[index]) * 0.5 for index in range(3)]
    return {
        "boundsSource": "vertices",
        "aabb": {"min": gltf_minimum, "max": gltf_maximum},
        "dims": dimensions,
        "center": center,
        "groundOffset": max(0.0, -gltf_minimum[1]),
        "triangles": triangles,
        "meshes": meshes,
        "materials": sorted(materials),
    }


metrics = scene_metrics()
output_path = OUT / "castle-distributor.glb"
bpy.ops.export_scene.gltf(
    filepath=str(output_path),
    export_format="GLB",
    export_yup=True,
    export_tangents=True,
    export_cameras=False,
    export_lights=False,
    use_selection=False,
)
runtime_bytes = output_path.stat().st_size
runtime_sha256 = hashlib.sha256(output_path.read_bytes()).hexdigest()

calibration = {
    "asset": "castle-distributor.glb",
    "sourceScript": "scripts/3d/build-castle-distributor.py",
    "assembly": {
        "parent": "castleRoot",
        "localPosition": [0.0, 0.0, 0.0],
        "worldPosition": [60.0, 0.0, 0.0],
        "scale": 1.0,
        "yawDegrees": 0.0,
        "sourceAnchor": "CastleDistributionPanel local [0, 0, 0]",
    },
    "localOrigin": [0.0, 0.0, 0.0],
    "upAxis": "+Y",
    "frontAxis": "+Z",
    "groundedPivot": True,
    "footprintContract": {
        "housingWidth": 3.8,
        "housingDepth": 1.2,
        "housingHeight": 1.8,
        "existingPanelBody": "CastlePanelBody",
        "existingPanelFace": "CastlePanelFace",
        "existingWorldCenter": [60.0, 0.0, 0.0],
    },
    "branchStubs": {
        "west": {"localEndpoint": [-2.38, 0.38, 0.0], "existingBranch": "CastleBranchA"},
        "east": {"localEndpoint": [2.38, 0.38, 0.0], "existingBranch": "CastleBranchB"},
        "north": {"localEndpoint": [0.0, 0.38, 1.42], "existingBranch": "CastleBranchC"},
    },
    "stateNeutralIndicators": True,
    "metrics": metrics,
    "runtime": {"bytes": runtime_bytes, "sha256": runtime_sha256},
}
(OUT / "calibration.json").write_text(json.dumps(calibration, indent=2) + "\n", encoding="utf8")

provenance = {
    "schemaVersion": 1,
    "assetId": "rx_ohmdal_castle_distributor_01",
    "provider": "Proyecto Roxana",
    "sourceMethod": "deterministic Blender-authored station",
    "script": "scripts/3d/build-castle-distributor.py",
    "license": "Original Proyecto Roxana geometry; no external asset or paid generation.",
    "referencePack": {
        "region": "assets/references/region-packs/castillo/README.md",
        "hero": "assets/references/hero-packs/castle/hero-reference.json",
        "primaryReference": "assets/ohmdal/rooms/pilot-arco1/prop_castle_master_distributor.png",
        "supportingReferences": [
            "assets/ohmdal/rooms/pilot-arco1/castle_heart+prop_castle_master_distributor.png",
            "assets/ohmdal/rooms/pilot-arco1/castle_branches+prop_castle_trunk_distributor.png",
        ],
    },
    "canonicalization": {
        "tool": "Blender 5.2",
        "unit": "meter",
        "upAxis": "+Y",
        "frontAxis": "+Z",
        "pivot": "CastleDistributorRoot local origin",
        "parent": "castleRoot",
        "localAssemblyPosition": [0.0, 0.0, 0.0],
        "worldAssemblyPosition": [60.0, 0.0, 0.0],
    },
    "runtimeFile": "castle-distributor.glb",
    "runtimeSha256": runtime_sha256,
    "runtimeBytes": runtime_bytes,
    "metrics": metrics,
    "semanticAnchors": [
        "CastleDistributorPanelAnchor",
        "CastleDistributorFrontAnchor",
        "CastleDistributorBranchWestAnchor",
        "CastleDistributorBranchEastAnchor",
        "CastleDistributorBranchNorthAnchor",
    ],
    "sourceBindingsToHideAfterLoadReady": SOURCE_ENTITIES_TO_HIDE,
    "sourceBindingsPreserved": SOURCE_ENTITIES_PRESERVED,
    "notes": [
        "Visual-only station; no collider, electrical solver, trip state or conductor is introduced.",
        "The panel body/face and broad authored platform rings are replaced after load readiness.",
        "Original input, return, trip, main bus, three branch conductors and isolators remain visible/state-bound.",
        "The three indicator windows are matte and state-neutral; no passive emission or text labels are used.",
        "The three short ducts terminate toward the existing branch directions without replacing their wires.",
    ],
}
(OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf8")

# CPU reference frame only; camera/floor are created after GLB export.
scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.render.resolution_x = 720
scene.render.resolution_y = 560
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
if scene.world is None:
    scene.world = bpy.data.worlds.new("CastleDistributorPreviewWorld")
scene.world.color = (0.025, 0.035, 0.05)
scene.display.shading.light = "STUDIO"
scene.display.shading.studio_light = "paint.sl"
scene.display.shading.color_type = "MATERIAL"
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = "BOTH"
scene.display.shading.curvature_ridge_factor = 1.25
scene.display.shading.curvature_valley_factor = 1.05
bpy.ops.mesh.primitive_plane_add(size=10.0, location=point((0.0, -0.03, 0.0)))
preview_floor = bpy.context.object
preview_floor.name = "PreviewFloorOnly"
preview_floor.data.materials.append(MATERIALS["iron"])
bpy.ops.object.camera_add(location=point((4.6, 3.2, -5.8)))
preview_camera = bpy.context.object
preview_camera.name = "PreviewCameraOnly"
preview_target = Vector(point((0.0, 0.95, 0.0)))
preview_camera.rotation_euler = (preview_target - preview_camera.location).to_track_quat("-Z", "Y").to_euler()
preview_camera.data.type = "ORTHO"
preview_camera.data.ortho_scale = 5.1
scene.camera = preview_camera
scene.render.filepath = str(OUT / "preview.png")
bpy.ops.render.render(write_still=True)

print("OUTPUT", output_path)
print("METRICS", json.dumps(metrics, sort_keys=True))
print("RUNTIME_BYTES", runtime_bytes)
print("RUNTIME_SHA256", runtime_sha256)
