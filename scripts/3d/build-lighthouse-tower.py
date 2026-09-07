"""Build the authored Ohmdal lighthouse tower shell.

The tower is a visual replacement for the current cylindrical greybox shell.
It is authored in the PlayCanvas contract (metres, +Y up, +Z front) and
converted explicitly to Blender's Z-up space.  The Fresnel mechanism remains a
separate runtime hero: this asset leaves its lens clearance empty and carries
only the surrounding stone, service rail, iron supports and copper canopy.

This file intentionally does not touch runtime code or colliders.  The loader
and the source-binding list are delivered separately so integration can hide
only the old shell after the new asset has loaded successfully.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/runtime/ohmdal/regional-heroes/lighthouse-tower"
OUT.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)


def point(value: tuple[float, float, float]) -> tuple[float, float, float]:
    """Convert authored PlayCanvas [x, y, z] into Blender [x, -z, y]."""

    return (value[0], -value[2], value[1])


def srgb_to_linear(value: float) -> float:
    """Convert an authored display-space swatch to Principled scene-linear."""

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
    "stone": make_material("LighthouseLimestoneWarm", (0.49, 0.39, 0.29), 0.88),
    "stone_dark": make_material("LighthouseLimestoneShadow", (0.22, 0.19, 0.16), 0.91),
    "joint": make_material("LighthouseMasonryJoint", (0.075, 0.068, 0.058), 0.96),
    "iron": make_material("LighthouseIronDark", (0.055, 0.062, 0.064), 0.62, 0.78),
    "copper": make_material("LighthouseCopperAged", (0.27, 0.105, 0.035), 0.50, 0.72),
}


def metric_uv(obj: bpy.types.Object) -> None:
    """Assign stable planar UVs from the local face normal and position."""

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
    # Blender dimensions are X/Y/Z; authored dimensions are X/Y/Z where Y is up.
    obj.dimensions = (size[0], size[2], size[1])
    return finish(obj, material, bevel)


def cylinder(
    name: str,
    position: tuple[float, float, float],
    radius: float,
    height: float,
    material: bpy.types.Material,
    sides: int = 24,
    bevel: float = 0.014,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=sides,
        radius=radius,
        depth=height,
        location=point(position),
    )
    obj = bpy.context.object
    obj.name = name
    return finish(obj, material, bevel, smooth=False)


def cone(
    name: str,
    position: tuple[float, float, float],
    radius_bottom: float,
    radius_top: float,
    height: float,
    material: bpy.types.Material,
    sides: int = 24,
    bevel: float = 0.014,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cone_add(
        vertices=sides,
        radius1=radius_bottom,
        radius2=radius_top,
        depth=height,
        location=point(position),
    )
    obj = bpy.context.object
    obj.name = name
    return finish(obj, material, bevel, smooth=False)


def torus(
    name: str,
    position: tuple[float, float, float],
    radius: float,
    tube: float,
    material: bpy.types.Material,
    major_segments: int = 32,
    minor_segments: int = 8,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_torus_add(
        major_radius=radius,
        minor_radius=tube,
        major_segments=major_segments,
        minor_segments=minor_segments,
        location=point(position),
    )
    obj = bpy.context.object
    obj.name = name
    return finish(obj, material, 0.0, smooth=True)


def annular_frustum(
    name: str,
    y_bottom: float,
    y_top: float,
    outer_bottom: float,
    outer_top: float,
    inner_bottom: float,
    inner_top: float,
    material: bpy.types.Material,
    sides: int = 32,
) -> bpy.types.Object:
    """Make an open conical canopy with no opaque face over the Fresnel lens."""

    vertices: list[tuple[float, float, float]] = []
    for y, outer, inner in (
        (y_bottom, outer_bottom, inner_bottom),
        (y_top, outer_top, inner_top),
    ):
        for radius in (outer, inner):
            for index in range(sides):
                angle = math.tau * index / sides
                vertices.append(point((math.cos(angle) * radius, y, math.sin(angle) * radius)))

    # Layer layout: bottom outer, bottom inner, top outer, top inner.
    bo = 0
    bi = sides
    to = sides * 2
    ti = sides * 3
    faces: list[tuple[int, ...]] = []
    for index in range(sides):
        next_index = (index + 1) % sides
        # Outer sloped surface and inner underside.
        faces.append((bo + index, to + index, to + next_index, bo + next_index))
        faces.append((bi + next_index, ti + next_index, ti + index, bi + index))
        # Bottom and top annuli close the canopy without closing its centre.
        faces.append((bo + next_index, bo + index, bi + index, bi + next_index))
        faces.append((to + index, to + next_index, ti + next_index, ti + index))

    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish(obj, material, 0.012, smooth=False)


def add_anchor(
    name: str,
    position: tuple[float, float, float],
    role: str,
) -> bpy.types.Object:
    anchor = bpy.data.objects.new(name, None)
    anchor.empty_display_type = "PLAIN_AXES"
    anchor.empty_display_size = 0.24
    anchor.location = point(position)
    anchor["role"] = role
    bpy.context.collection.objects.link(anchor)
    return anchor


# The root is local to lighthouseRoot.  The existing beacon entity is already
# placed at lighthouseRoot local [0, 0, 8], so the Fresnel visual remains at
# its current site and yaw when this root is attached at the same transform.
model_root = bpy.data.objects.new("LighthouseTowerRoot", None)
model_root.empty_display_type = "CUBE"
model_root.empty_display_size = 0.5
model_root["assemblyOrigin"] = "lighthouseRoot local [0, 0, 8]"
model_root["worldAssemblyOrigin"] = "[180, 0, 8]"
model_root["upAxis"] = "+Y"
model_root["frontAxis"] = "+Z"
model_root["lensClearance"] = "Keep Fresnel visual at local y=5.6; no opaque centre mesh"
bpy.context.collection.objects.link(model_root)

# Stepped limestone base.  The largest diameter is 3.6 m, inside the accepted
# 3.8 m footprint, while the first body course starts above the top step.
cylinder("LighthouseTowerPlinthLower", (0.0, 0.18, 0.0), 1.80, 0.36, MATERIALS["stone"], 24, 0.045)
cylinder("LighthouseTowerPlinthStep", (0.0, 0.43, 0.0), 1.61, 0.18, MATERIALS["stone_dark"], 24, 0.030)
cylinder("LighthouseTowerPlinthUpper", (0.0, 0.68, 0.0), 1.47, 0.28, MATERIALS["stone"], 24, 0.035)
torus("LighthouseTowerPlinthJoint", (0.0, 0.83, 0.0), 1.39, 0.035, MATERIALS["joint"], 32, 6)

# Slightly tapered masonry shaft, with large horizontal joint bands instead of
# a noisy brick texture.  The rings remain within the tapered silhouette.
cone("LighthouseTowerShaft", (0.0, 2.82, 0.0), 1.35, 1.06, 3.95, MATERIALS["stone"], 32, 0.025)
for index, (y, radius) in enumerate(((1.75, 1.285), (2.78, 1.205), (3.81, 1.125), (4.62, 1.075))):
    torus(f"LighthouseTowerMasonryJoint{index}", (0.0, y, 0.0), radius, 0.024, MATERIALS["joint"], 32, 6)

# A restrained vertical rhythm gives the shaft readable construction at a
# distance without becoming decorative clutter.
for index, angle in enumerate((0.0, math.pi / 2.0, math.pi, math.pi * 1.5)):
    x = math.cos(angle) * 1.17
    z = math.sin(angle) * 1.17
    cylinder(
        f"LighthouseTowerVerticalStonePier{index}",
        (x, 2.79, z),
        0.095,
        3.62,
        MATERIALS["stone_dark"],
        8,
        0.012,
    )

# Upper cornice and open service deck at the requested y=5.2 level.
cylinder("LighthouseTowerUpperCornice", (0.0, 4.86, 0.0), 1.18, 0.18, MATERIALS["stone"], 24, 0.026)
torus("LighthouseTowerCorniceJoint", (0.0, 4.96, 0.0), 1.14, 0.035, MATERIALS["joint"], 32, 6)
cylinder("LighthouseTowerServiceDeck", (0.0, 5.09, 0.0), 1.43, 0.16, MATERIALS["stone_dark"], 24, 0.026)
torus("LighthouseTowerServiceDeckEdge", (0.0, 5.18, 0.0), 1.37, 0.050, MATERIALS["iron"], 32, 8)

# Circular service rail: all posts and rings remain inside the 3.8 m base
# diameter.  The centre stays clear for the separate Fresnel hero.
for index in range(8):
    angle = math.tau * index / 8.0
    x = math.cos(angle) * 1.22
    z = math.sin(angle) * 1.22
    cylinder(
        f"LighthouseServiceRailPost{index}",
        (x, 5.48, z),
        0.045,
        0.58,
        MATERIALS["iron"],
        8,
        0.008,
    )
torus("LighthouseServiceRailTop", (0.0, 5.78, 0.0), 1.22, 0.045, MATERIALS["iron"], 32, 8)

# The lantern cage surrounds, but does not occupy, the Fresnel clearance
# volume.  Its lower anchor is just below the existing imported hero's
# y=5.6 placement; its top remains below the open copper canopy.
torus("LighthouseLanternSupportLowerRing", (0.0, 5.48, 0.0), 1.04, 0.060, MATERIALS["iron"], 32, 8)
for index in range(8):
    angle = math.tau * index / 8.0
    x = math.cos(angle) * 1.02
    z = math.sin(angle) * 1.02
    cylinder(
        f"LighthouseLanternSupportPost{index}",
        (x, 6.54, z),
        0.052,
        2.12,
        MATERIALS["iron"],
        8,
        0.008,
    )
torus("LighthouseLanternSupportUpperRing", (0.0, 7.60, 0.0), 1.04, 0.060, MATERIALS["iron"], 32, 8)

# Open aged-copper canopy.  The annular centre deliberately leaves the lens
# and lamp visible rather than placing a solid disc over the hero mechanism.
annular_frustum(
    "LighthouseCopperOpenCanopy",
    7.62,
    7.98,
    1.30,
    0.76,
    0.90,
    0.42,
    MATERIALS["copper"],
    32,
)

# A closed technical hatch sits on the rear (-Z) of the shaft.  It is a visual
# panel only; the runtime retains its existing navigation/collider contract.
box("LighthouseTechnicalHatch", (0.0, 1.82, -1.19), (0.72, 0.82, 0.09), MATERIALS["iron"], 0.018)
box("LighthouseTechnicalHatchFrameTop", (0.0, 2.25, -1.245), (0.86, 0.08, 0.07), MATERIALS["stone_dark"], 0.012)
box("LighthouseTechnicalHatchFrameBottom", (0.0, 1.39, -1.245), (0.86, 0.08, 0.07), MATERIALS["stone_dark"], 0.012)
box("LighthouseTechnicalHatchFrameLeft", (-0.41, 1.82, -1.245), (0.08, 0.94, 0.07), MATERIALS["stone_dark"], 0.012)
box("LighthouseTechnicalHatchFrameRight", (0.41, 1.82, -1.245), (0.08, 0.94, 0.07), MATERIALS["stone_dark"], 0.012)
box("LighthouseTechnicalHatchLatch", (0.0, 1.82, -1.305), (0.10, 0.18, 0.04), MATERIALS["copper"], 0.006)

for name, position, role in (
    ("LighthouseTowerGroundAnchor", (0.0, 0.0, 0.0), "grounded tower root"),
    ("LighthouseTowerLensAnchor", (0.0, 5.6, 0.0), "preserve existing Fresnel site"),
    ("LighthouseTowerServiceRailAnchor", (0.0, 5.2, 0.0), "service rail level"),
    ("LighthouseTowerHatchAnchor", (0.0, 1.82, -1.30), "closed technical hatch"),
    ("LighthouseTowerCanopyAnchor", (0.0, 7.62, 0.0), "open copper canopy"),
):
    anchor = add_anchor(name, position, role)
    anchor.parent = model_root


def join_by_material() -> None:
    """Reduce delivery to one mesh per material while retaining anchors."""

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
        assembly.name = f"LighthouseTower_{key.title()}Assembly"
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

    # Convert Blender XYZ (Z up) back to glTF/PlayCanvas XYZ (+Y up).
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
output_path = OUT / "lighthouse-tower.glb"
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
    "asset": "lighthouse-tower.glb",
    "sourceScript": "scripts/3d/build-lighthouse-tower.py",
    "assembly": {
        "parent": "lighthouseRoot",
        "localPosition": [0.0, 0.0, 8.0],
        "worldPosition": [180.0, 0.0, 8.0],
        "scale": 1.0,
        "yawDegrees": 0.0,
    },
    "localOrigin": [0.0, 0.0, 0.0],
    "upAxis": "+Y",
    "frontAxis": "+Z",
    "groundedPivot": True,
    "towerHeight": metrics["dims"][1],
    "baseDiameter": 3.6,
    "lensClearance": {
        "existingBeaconEntity": "LighthouseBeacon",
        "existingFresnelLocalPosition": [0.0, 5.6, 0.0],
        "existingFresnelAsset": "assets/runtime/ohmdal/regional-heroes/fresnel.glb",
        "clearanceCenter": [0.0, 6.62, 0.0],
        "clearanceRadius": 0.95,
        "clearanceHeight": 2.1,
        "opaqueCenterMesh": False,
    },
    "serviceRail": {
        "localY": 5.2,
        "outerRadius": 1.27,
        "withinBaseDiameter": True,
    },
    "footprintContract": {
        "existingLighthouseRootWorld": [180.0, 0.0, 0.0],
        "existingBeaconLocal": [0.0, 0.0, 8.0],
        "existingBaseDiameter": 3.8,
        "preservedYawDegrees": 0.0,
    },
    "metrics": metrics,
    "runtime": {"bytes": runtime_bytes, "sha256": runtime_sha256},
}
(OUT / "calibration.json").write_text(json.dumps(calibration, indent=2) + "\n", encoding="utf8")

provenance = {
    "schemaVersion": 1,
    "assetId": "rx_ohmdal_lighthouse_tower_01",
    "provider": "Proyecto Roxana",
    "sourceMethod": "deterministic Blender-authored architecture",
    "script": "scripts/3d/build-lighthouse-tower.py",
    "license": "Original Proyecto Roxana geometry; no external asset or paid generation.",
    "referencePack": {
        "region": "assets/references/region-packs/faro/README.md",
        "hero": "assets/references/hero-packs/lighthouse/hero-reference.json",
        "primaryReference": "assets/ohmdal/rooms/pilot-arco1/prop_lighthouse_lens_off.png",
        "supportingReferences": [
            "assets/ohmdal/rooms/pilot-arco1/lighthouse_lantern+prop_lighthouse_lens_off.png",
            "assets/ohmdal/rooms/pilot-arco1/lighthouse_hall_base.png",
        ],
    },
    "canonicalization": {
        "tool": "Blender 5.2",
        "unit": "meter",
        "upAxis": "+Y",
        "frontAxis": "+Z",
        "pivot": "LighthouseTowerRoot local ground origin",
        "parent": "lighthouseRoot",
        "localAssemblyPosition": [0.0, 0.0, 8.0],
        "worldAssemblyPosition": [180.0, 0.0, 8.0],
    },
    "runtimeFile": "lighthouse-tower.glb",
    "runtimeSha256": runtime_sha256,
    "runtimeBytes": runtime_bytes,
    "metrics": metrics,
    "semanticAnchors": [
        "LighthouseTowerGroundAnchor",
        "LighthouseTowerLensAnchor",
        "LighthouseTowerServiceRailAnchor",
        "LighthouseTowerHatchAnchor",
        "LighthouseTowerCanopyAnchor",
    ],
    "sourceBindingsToHideAfterLoadReady": [
        "LighthouseBeaconBase",
        "LighthouseBeaconTower",
        "LighthouseBeaconCap",
        "LighthouseLanternLowerRing",
        "LighthouseLanternUpperRing",
        "LighthouseLanternBrace1",
        "LighthouseLanternBrace2",
        "LighthouseLanternBrace3",
        "LighthouseLanternBrace4",
        "LighthouseLanternBrace5",
        "LighthouseLanternBrace6",
        "LighthouseLanternBrace7",
        "LighthouseLanternBrace8",
        "LighthouseCupolaAuthored",
        "LighthouseFinialAuthored",
    ],
    "sourceBindingsPreserved": [
        "LighthouseFresnelLens",
        "LighthouseBeaconLamp",
        "LighthouseBeaconPoint",
        "LighthouseOpticalSweep",
        "LighthouseSignalBar",
    ],
    "notes": [
        "Visual-only tower candidate; no collider, light, lens or gameplay state is introduced.",
        "The copper canopy is annular so the separate Fresnel mechanism remains visible and state-controlled.",
        "The service rail is a closed geometry loop at local y=5.2 inside the existing base footprint.",
        "The technical hatch is a closed visual panel and does not create a new access route.",
        "Materials are matte PBR with localized aged copper; no passive emission, neon or new symbols.",
    ],
}
(OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf8")

# CPU reference frame for fresh-eyes review.  The camera and floor are added
# only after GLB export, so they cannot enter the runtime asset.
scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.render.resolution_x = 720
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
if scene.world is None:
    scene.world = bpy.data.worlds.new("LighthousePreviewWorld")
scene.world.color = (0.025, 0.035, 0.05)
scene.display.shading.light = "STUDIO"
scene.display.shading.studio_light = "paint.sl"
scene.display.shading.color_type = "MATERIAL"
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = "BOTH"
scene.display.shading.curvature_ridge_factor = 1.35
scene.display.shading.curvature_valley_factor = 1.1
bpy.ops.mesh.primitive_plane_add(size=16.0, location=point((0.0, -0.03, 0.0)))
preview_floor = bpy.context.object
preview_floor.name = "PreviewFloorOnly"
preview_floor.data.materials.append(MATERIALS["stone_dark"])
bpy.ops.object.camera_add(location=point((5.8, 5.4, 10.8)))
preview_camera = bpy.context.object
preview_camera.name = "PreviewCameraOnly"
preview_target = Vector(point((0.0, 3.9, 0.0)))
preview_camera.rotation_euler = (preview_target - preview_camera.location).to_track_quat("-Z", "Y").to_euler()
preview_camera.data.type = "ORTHO"
preview_camera.data.ortho_scale = 9.3
scene.camera = preview_camera
scene.render.filepath = str(OUT / "preview.png")
bpy.ops.render.render(write_still=True)

print("OUTPUT", output_path)
print("METRICS", json.dumps(metrics, sort_keys=True))
print("RUNTIME_BYTES", runtime_bytes)
print("RUNTIME_SHA256", runtime_sha256)
