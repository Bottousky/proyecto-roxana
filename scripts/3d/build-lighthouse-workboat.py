"""Build the authored Ohmdal Lighthouse maintenance workboat.

The boat is an original, deterministic Blender asset.  It is deliberately
small and readable: an open planked hull, keel, ribs, seats, oars, a canvas
bundle and a rope coil.  It is a visual prop only; no collider, interaction or
electrical state is authored here.

Authoring contract: metres, +Y up, +Z front/bow.  Blender uses Z-up and the
same conversion as the other Ohmdal authored builders: [x, y, z] ->
[x, -z, y].  The exported GLB is Y-up with a local waterline at y=0.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/runtime/ohmdal/regional-heroes/lighthouse-workboat"
OUT.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)


def point(value: tuple[float, float, float]) -> tuple[float, float, float]:
    """Convert authored PlayCanvas [x, y, z] to Blender [x, -z, y]."""

    return (value[0], -value[2], value[1])


def srgb_to_linear(value: float) -> float:
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
    bsdf.inputs["Base Color"].default_value = tuple(
        [srgb_to_linear(channel) for channel in color] + [1.0]
    )
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return material


MATERIALS = {
    "oak": make_material("LighthouseWorkboatAgedOak", (0.30, 0.17, 0.075), 0.82),
    "oak_dark": make_material("LighthouseWorkboatDarkPlank", (0.13, 0.075, 0.035), 0.90),
    "tar": make_material("LighthouseWorkboatKeelTar", (0.055, 0.050, 0.042), 0.93),
    "trim": make_material("LighthouseWorkboatMutedGreenTrim", (0.16, 0.22, 0.16), 0.78),
    "canvas": make_material("LighthouseWorkboatCanvas", (0.47, 0.42, 0.29), 0.96),
    "rope": make_material("LighthouseWorkboatHempRope", (0.34, 0.24, 0.13), 0.94),
}


model_root = bpy.data.objects.new("LighthouseWorkboatRoot", None)
model_root.empty_display_type = "CUBE"
model_root.empty_display_size = 0.25
model_root["assemblyOrigin"] = "Lighthouse maintenance workboat local [0, 0, 0]"
model_root["upAxis"] = "+Y"
model_root["frontAxis"] = "+Z (bow)"
model_root["waterlineLocalY"] = 0.0
model_root["visualOnly"] = True
bpy.context.collection.objects.link(model_root)


def metric_uv(obj: bpy.types.Object, scale: float = 0.75) -> None:
    """Assign stable local metric UVs without depending on external textures."""

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
                vertex[axes[0]] * scale,
                vertex[axes[1]] * scale,
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
        modifier = obj.modifiers.new("SmallBoatBevel", "BEVEL")
        modifier.width = bevel
        modifier.segments = 2
        modifier.limit_method = "ANGLE"
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    metric_uv(obj)
    for polygon in obj.data.polygons:
        polygon.use_smooth = smooth
    obj.parent = model_root
    obj.select_set(False)
    return obj


def box(
    name: str,
    position: tuple[float, float, float],
    size: tuple[float, float, float],
    material: bpy.types.Material,
    bevel: float = 0.012,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=point(position))
    obj = bpy.context.object
    obj.name = name
    # Blender X/Y/Z corresponds to authored X/Z/Y.
    obj.dimensions = (size[0], size[2], size[1])
    return finish(obj, material, bevel)


def cylinder(
    name: str,
    position: tuple[float, float, float],
    radius: float,
    height: float,
    material: bpy.types.Material,
    axis: str = "y",
    sides: int = 12,
    bevel: float = 0.008,
) -> bpy.types.Object:
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
    return finish(obj, material, bevel)


def beam_between(
    name: str,
    start: tuple[float, float, float],
    end: tuple[float, float, float],
    width: float,
    height: float,
    material: bpy.types.Material,
    bevel: float = 0.008,
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


def mesh_object(
    name: str,
    vertices_authored: list[tuple[float, float, float]],
    faces: list[tuple[int, ...]],
    material: bpy.types.Material,
    bevel: float = 0.0,
) -> bpy.types.Object:
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([point(vertex) for vertex in vertices_authored], [], faces)
    mesh.validate(verbose=False)
    mesh.update(calc_edges=True)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish(obj, material, bevel)


def torus(
    name: str,
    position: tuple[float, float, float],
    major_radius: float,
    minor_radius: float,
    material: bpy.types.Material,
) -> bpy.types.Object:
    # Blender's default torus lies in XY with a Z normal.  Rotate it so the
    # ring lies in authored XZ with a +Y normal.
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=16,
        minor_segments=6,
        location=point(position),
        rotation=(math.radians(90.0), 0.0, 0.0),
    )
    obj = bpy.context.object
    obj.name = name
    return finish(obj, material, 0.0, smooth=True)


def add_anchor(
    name: str,
    position: tuple[float, float, float],
    role: str,
) -> bpy.types.Object:
    anchor = bpy.data.objects.new(name, None)
    anchor.empty_display_type = "PLAIN_AXES"
    anchor.empty_display_size = 0.16
    anchor.location = point(position)
    anchor["role"] = role
    anchor.parent = model_root
    bpy.context.collection.objects.link(anchor)
    return anchor


# Cross-sections run stern -> bow.  They define a visibly hollow hull rather
# than a solid box: outer sides, inner sides and a shallow floor share one mesh.
STATIONS = [
    (-2.72, 0.62, -0.18, 0.16, 0.50),
    (-2.35, 0.80, -0.32, 0.08, 0.57),
    (-1.35, 0.85, -0.43, 0.05, 0.61),
    (-0.20, 0.86, -0.45, 0.06, 0.62),
    (0.95, 0.82, -0.36, 0.13, 0.60),
    (1.95, 0.62, -0.16, 0.25, 0.54),
    (2.68, 0.08, 0.09, 0.40, 0.55),
]


def make_hull_shell() -> bpy.types.Object:
    vertices: list[tuple[float, float, float]] = []
    index: list[dict[str, int]] = []
    for z, half_width, bottom, chine, gunwale in STATIONS:
        inner_half = max(0.025, half_width - 0.18)
        values = {
            "lb": (-(half_width), bottom, z),
            "rb": (half_width, bottom, z),
            "lc": (-(half_width * 0.98), chine, z),
            "rc": (half_width * 0.98, chine, z),
            "lg": (-(half_width), gunwale, z),
            "rg": (half_width, gunwale, z),
            "lig": (-(inner_half), gunwale - 0.055, z),
            "rig": (inner_half, gunwale - 0.055, z),
            "lf": (-(inner_half * 0.92), 0.10, z),
            "rf": (inner_half * 0.92, 0.10, z),
        }
        row: dict[str, int] = {}
        for key, vertex in values.items():
            row[key] = len(vertices)
            vertices.append(vertex)
        index.append(row)

    faces: list[tuple[int, ...]] = []
    for current, following in zip(index, index[1:]):
        # Outer left wall points toward -X; outer right wall points toward +X.
        faces.extend([
            (current["lb"], following["lb"], following["lc"], current["lc"]),
            (current["lc"], following["lc"], following["lg"], current["lg"]),
            (following["rb"], current["rb"], current["rc"], following["rc"]),
            (following["rc"], current["rc"], current["rg"], following["rg"]),
            # Inner wall normals face into the boat.
            (current["lig"], following["lig"], following["lf"], current["lf"]),
            (following["rig"], current["rig"], current["rf"], following["rf"]),
            # Floor faces upward.
            (following["lf"], current["lf"], current["rf"], following["rf"]),
        ])

    return mesh_object("LighthouseWorkboatHollowPlankedHull", vertices, faces, MATERIALS["oak"], 0.0)


make_hull_shell()

# Five long, shallow plank courses per side make the silhouette read as wood
# even at distance.  They follow the cross-section rather than floating as
# unrelated decorative bars.
for side, sign in (("Port", -1.0), ("Starboard", 1.0)):
    for plank_index, t in enumerate((0.18, 0.34, 0.50, 0.66, 0.82), start=1):
        vertices: list[tuple[float, float, float]] = []
        for z, half_width, _bottom, chine, gunwale in STATIONS:
            y = chine + (gunwale - chine) * t
            x = sign * (half_width + 0.012)
            vertices.extend([(x, y - 0.026, z), (x, y + 0.026, z)])
        faces = []
        for station in range(len(STATIONS) - 1):
            a = station * 2
            b = (station + 1) * 2
            face = (a, b, b + 1, a + 1)
            faces.append(face if sign < 0 else (b, a, a + 1, b + 1))
        mesh_object(
            f"LighthouseWorkboat{side}Plank{plank_index}",
            vertices,
            faces,
            MATERIALS["oak_dark"],
        )

# Thick green gunwales and a stern transom establish construction hierarchy.
for side, sign in (("Port", -1.0), ("Starboard", 1.0)):
    for station, following in zip(STATIONS, STATIONS[1:]):
        z0, w0, _b0, _c0, g0 = station
        z1, w1, _b1, _c1, g1 = following
        beam_between(
            f"LighthouseWorkboat{side}Gunwale",
            (sign * (w0 + 0.035), g0 + 0.045, z0),
            (sign * (w1 + 0.035), g1 + 0.045, z1),
            0.105,
            0.105,
            MATERIALS["trim"],
            0.012,
        )

box("LighthouseWorkboatSternTransom", (0.0, 0.27, -2.63), (1.38, 0.60, 0.12), MATERIALS["oak"], 0.030)
beam_between("LighthouseWorkboatSternTrim", (-0.70, 0.60, -2.68), (0.70, 0.60, -2.68), 0.08, 0.08, MATERIALS["trim"], 0.010)

# A tarred keel/belly sits below the waterline and visibly turns up toward the
# pointed bow.  It is short enough to remain a visual prop, not a collider.
beam_between("LighthouseWorkboatKeel", (0.0, -0.28, -2.30), (0.0, -0.26, 2.20), 0.22, 0.18, MATERIALS["tar"], 0.035)
beam_between("LighthouseWorkboatBowKeel", (0.0, -0.22, 2.18), (0.0, 0.12, 2.66), 0.16, 0.14, MATERIALS["tar"], 0.025)

# Three seats and four low ribs remain visible from above, proving the boat is
# open and maintained rather than a closed stylized crate.
for seat_index, z in enumerate((-1.55, -0.25, 1.00), start=1):
    box(f"LighthouseWorkboatSeat{seat_index}", (0.0, 0.48, z), (1.48, 0.12, 0.25), MATERIALS["oak"], 0.018)
for rib_index, z in enumerate((-2.05, -0.82, 0.42, 1.47), start=1):
    box(f"LighthouseWorkboatRib{rib_index}", (0.0, 0.18, z), (1.38, 0.14, 0.10), MATERIALS["oak_dark"], 0.014)

# Small cleats under the gunwales receive the oar lashings.
for side, sign in (("Port", -1.0), ("Starboard", 1.0)):
    for z in (-0.65, 0.52):
        box(f"LighthouseWorkboat{side}Cleat{z}", (sign * 0.55, 0.61, z), (0.16, 0.10, 0.24), MATERIALS["trim"], 0.012)

# Two oars lie inside the hull, with separate shafts and broad paddle blades.
for side, sign, z_start, z_end in (
    ("Port", -1.0, -1.00, 2.05),
    ("Starboard", 1.0, -0.55, 2.10),
):
    x = sign * 0.43
    beam_between(
        f"LighthouseWorkboat{side}OarShaft",
        (x, 0.68, z_start),
        (sign * 0.55, 0.74, z_end),
        0.052,
        0.052,
        MATERIALS["oak_dark"],
        0.010,
    )
    beam_between(
        f"LighthouseWorkboat{side}OarBlade",
        (sign * 0.55, 0.74, z_end - 0.04),
        (sign * 0.57, 0.75, min(2.58, z_end + 0.52)),
        0.18,
        0.045,
        MATERIALS["oak"],
        0.012,
    )
    torus(f"LighthouseWorkboat{side}OarLash", (x, 0.70, 0.30), 0.078, 0.018, MATERIALS["rope"])

# A canvas bundle under the aft seat and a compact three-turn rope coil add
# practical maintenance detail without bright or electrical-looking accents.
bpy.ops.mesh.primitive_uv_sphere_add(
    segments=12,
    ring_count=8,
    location=point((0.0, 0.24, -1.78)),
)
canvas_bundle = bpy.context.object
canvas_bundle.name = "LighthouseWorkboatCanvasBundle"
canvas_bundle.scale = (0.31, 0.42, 0.18)
finish(canvas_bundle, MATERIALS["canvas"], 0.0, smooth=True)

for coil_index, x in enumerate((-0.22, 0.0, 0.22), start=1):
    torus(
        f"LighthouseWorkboatRopeCoil{coil_index}",
        (x, 0.56, -1.76),
        0.19,
        0.026,
        MATERIALS["rope"],
    )

# Semantic anchors are retained in the GLB for deterministic runtime placement
# and future visual attachments; gameplay remains in the PlayCanvas world.
for name, position, role in (
    ("LighthouseWorkboatCenterAnchor", (0.0, 0.0, 0.0), "workboat visual root origin"),
    ("LighthouseWorkboatBowAnchor", (0.0, 0.38, 2.62), "pointed bow / +Z"),
    ("LighthouseWorkboatSternAnchor", (0.0, 0.32, -2.70), "stern transom / -Z"),
    ("LighthouseWorkboatOarPortAnchor", (-0.43, 0.70, 0.30), "port oar lash"),
    ("LighthouseWorkboatOarStarboardAnchor", (0.43, 0.70, 0.30), "starboard oar lash"),
    ("LighthouseWorkboatRopeAnchor", (0.0, 0.58, -1.76), "aft rope coil"),
):
    add_anchor(name, position, role)


def join_by_material() -> None:
    """Batch static meshes by material while preserving the semantic empties."""

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
        if len(objects) > 1:
            bpy.ops.object.select_all(action="DESELECT")
            for obj in objects:
                obj.select_set(True)
            bpy.context.view_layer.objects.active = objects[0]
            bpy.ops.object.join()
            assembly = bpy.context.object
        else:
            assembly = objects[0]
        assembly.name = f"LighthouseWorkboat_{key.title().replace('_', '')}Assembly"
        assembly.parent = model_root
        assembly["staticMaterialBatch"] = key
        assembly.select_set(False)

    # Explicit triangles give deterministic bounds and avoid exporter-specific
    # polygon triangulation differences.
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
    vertices = 0
    meshes = 0
    materials: set[str] = set()
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        meshes += 1
        triangles += sum(max(0, len(poly.vertices) - 2) for poly in obj.data.polygons)
        vertices += len(obj.data.vertices)
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

    # Blender (x, y, z) -> authored/exported (x, y, z) = (x, z, -y).
    gltf_minimum = [minimum.x, minimum.z, -maximum.y]
    gltf_maximum = [maximum.x, maximum.z, -minimum.y]
    dimensions = [gltf_maximum[index] - gltf_minimum[index] for index in range(3)]
    center = [(gltf_minimum[index] + gltf_maximum[index]) * 0.5 for index in range(3)]
    return {
        "boundsSource": "vertices",
        "aabb": {"min": [round(value, 6) for value in gltf_minimum], "max": [round(value, 6) for value in gltf_maximum]},
        "dims": [round(value, 6) for value in dimensions],
        "center": [round(value, 6) for value in center],
        "groundOffset": round(max(0.0, -gltf_minimum[1]), 6),
        "waterlineLocalY": 0.0,
        "triangles": triangles,
        "vertices": vertices,
        "meshes": meshes,
        "materials": sorted(materials),
        "drawCallEstimate": meshes,
    }


metrics = scene_metrics()
if metrics["triangles"] >= 15000:
    raise RuntimeError(f"Lighthouse workboat exceeds triangle budget: {metrics['triangles']}")
if len(metrics["materials"]) > 6:
    raise RuntimeError(f"Lighthouse workboat exceeds material budget: {metrics['materials']}")

output_path = OUT / "lighthouse-workboat.glb"
bpy.ops.export_scene.gltf(
    filepath=str(output_path),
    export_format="GLB",
    export_yup=True,
    export_tangents=True,
    export_cameras=False,
    export_lights=False,
    export_animations=False,
    use_selection=False,
)
runtime_bytes = output_path.stat().st_size
runtime_sha256 = hashlib.sha256(output_path.read_bytes()).hexdigest()

calibration = {
    "asset": "lighthouse-workboat.glb",
    "sourceScript": "scripts/3d/build-lighthouse-workboat.py",
    "assembly": {
        "parent": "lighthouseRoot",
        "localPosition": [10.5, 0.2, -0.4],
        "scale": 1.0,
        "yawDegrees": 90.0,
        "sourceAnchor": "LighthouseWorkboatCenterAnchor",
        "runtimeNote": "Integration target beside lighthouse pier; visual prop only.",
    },
    "localOrigin": [0.0, 0.0, 0.0],
    "upAxis": "+Y",
    "frontAxis": "+Z (bow)",
    "waterlineLocalY": 0.0,
    "targetDimensions": {"length": 5.5, "width": 1.9, "bottomY": -0.45, "rimY": 0.70},
    "groundedPivot": False,
    "semanticAnchors": [
        "LighthouseWorkboatCenterAnchor",
        "LighthouseWorkboatBowAnchor",
        "LighthouseWorkboatSternAnchor",
        "LighthouseWorkboatOarPortAnchor",
        "LighthouseWorkboatOarStarboardAnchor",
        "LighthouseWorkboatRopeAnchor",
    ],
    "metrics": metrics,
    "runtime": {"bytes": runtime_bytes, "sha256": runtime_sha256},
}
(OUT / "calibration.json").write_text(json.dumps(calibration, indent=2) + "\n", encoding="utf8")

provenance = {
    "schemaVersion": 1,
    "assetId": "rx_ohmdal_lighthouse_workboat_01",
    "provider": "Proyecto Roxana",
    "sourceMethod": "deterministic Blender-authored original geometry",
    "script": "scripts/3d/build-lighthouse-workboat.py",
    "license": "Original Proyecto Roxana geometry; no external asset, texture, provider or paid generation.",
    "referencePack": {
        "region": "assets/references/region-packs/faro/README.md",
        "hero": "assets/references/hero-packs/lighthouse/hero-reference.json",
    },
    "canonicalization": {
        "tool": "Blender 5.2",
        "unit": "meter",
        "upAxis": "+Y",
        "frontAxis": "+Z (bow)",
        "pivot": "LighthouseWorkboatRoot local origin",
        "waterlineLocalY": 0.0,
        "runtimePlacementTarget": [10.5, 0.2, -0.4],
        "runtimeYawDegrees": 90.0,
    },
    "runtimeFile": "lighthouse-workboat.glb",
    "runtimeSha256": runtime_sha256,
    "runtimeBytes": runtime_bytes,
    "metrics": metrics,
    "materials": {
        "oak": "aged oak planks and seats",
        "oak_dark": "plank seams, ribs and oars",
        "tar": "keel/belly below waterline",
        "trim": "muted green gunwales and cleats",
        "canvas": "rolled maintenance canvas",
        "rope": "hemp lashings and coil",
    },
    "notes": [
        "Open hollow hull with pointed +Z bow, stern transom, keel, seats and ribs.",
        "Two oars are lashed inside; canvas bundle and rope coil are visual maintenance props.",
        "No emissive material, electric fake glow, collider, interaction or puzzle state is authored.",
        "Static meshes are merged by material for an estimated six material batches.",
    ],
}
(OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf8")

# CPU preview only.  The floor/camera are created after export and are never
# included in the runtime GLB.
scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.render.resolution_x = 820
scene.render.resolution_y = 560
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
if scene.world is None:
    scene.world = bpy.data.worlds.new("LighthouseWorkboatPreviewWorld")
scene.world.color = (0.025, 0.035, 0.045)
scene.display.shading.light = "STUDIO"
scene.display.shading.studio_light = "paint.sl"
scene.display.shading.color_type = "MATERIAL"
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = "BOTH"
scene.display.shading.curvature_ridge_factor = 1.25
scene.display.shading.curvature_valley_factor = 1.05

bpy.ops.mesh.primitive_plane_add(size=12.0, location=point((0.0, -0.03, 0.0)))
preview_floor = bpy.context.object
preview_floor.name = "PreviewFloorOnly"
preview_floor.data.materials.append(MATERIALS["tar"])
bpy.ops.object.camera_add(location=point((5.8, 3.1, -6.6)))
preview_camera = bpy.context.object
preview_camera.name = "PreviewCameraOnly"
preview_target = Vector(point((0.0, 0.24, 0.0)))
preview_camera.rotation_euler = (preview_target - preview_camera.location).to_track_quat("-Z", "Y").to_euler()
preview_camera.data.type = "ORTHO"
preview_camera.data.ortho_scale = 6.8
scene.camera = preview_camera
scene.render.filepath = str(OUT / "preview.png")
bpy.ops.render.render(write_still=True)

print("OUTPUT", output_path)
print("METRICS", json.dumps(metrics, sort_keys=True))
print("RUNTIME_BYTES", runtime_bytes)
print("RUNTIME_SHA256", runtime_sha256)
