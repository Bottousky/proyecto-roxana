"""Deterministic authored exterior for Lumen's Plaza workshop.

The model is authored in the existing PlayCanvas local contract (metres, +Y up,
+Z front) and converted explicitly to Blender's Z-up space.  The origin remains
the workshop gameplay root at the centre of the existing 6.2 m x 7.6 m shell;
the east doorway and service bench keep their surveyed local positions.
"""
import hashlib
import json
import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/runtime/ohmdal/plaza/workshop-exterior'
OUT.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)


def point(value):
    """Convert a PlayCanvas [x, y, z] point to Blender [x, -z, y]."""
    return (value[0], -value[2], value[1])


def srgb_to_linear(value):
    """Convert an authored display-space swatch to Principled scene-linear."""
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def make_material(name, color, roughness, metallic=0.0):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = (*color, 1.0)
    bsdf = material.node_tree.nodes.get('Principled BSDF')
    linear_color = tuple(srgb_to_linear(channel) for channel in color)
    bsdf.inputs['Base Color'].default_value = (*linear_color, 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    return material


MATERIALS = {
    'Limestone': make_material('WorkshopLimestoneWarm', (0.56, 0.45, 0.32), 0.86),
    'Plaster': make_material('WorkshopPlasterWarm', (0.66, 0.56, 0.43), 0.91),
    'Wood': make_material('WorkshopWoodDark', (0.16, 0.085, 0.038), 0.76),
    'Roof': make_material('WorkshopRoofWood', (0.11, 0.057, 0.027), 0.88),
    'Copper': make_material('WorkshopCopperAged', (0.34, 0.13, 0.035), 0.48, 0.72),
    'Iron': make_material('WorkshopIronSatin', (0.085, 0.075, 0.062), 0.64, 0.78),
    'Interior': make_material('WorkshopInteriorRecess', (0.055, 0.026, 0.018), 0.96),
}


def metric_uv(obj):
    """Give each face a stable planar UV in metre-like units."""
    mesh = obj.data
    if mesh.uv_layers:
        mesh.uv_layers.remove(mesh.uv_layers[0])
    uv_layer = mesh.uv_layers.new(name='UVMap')
    for polygon in mesh.polygons:
        normal = polygon.normal
        axis = max(range(3), key=lambda index: abs(normal[index]))
        axes = [index for index in range(3) if index != axis]
        for loop_index in polygon.loop_indices:
            vertex = mesh.vertices[mesh.loops[loop_index].vertex_index].co
            uv_layer.data[loop_index].uv = (vertex[axes[0]] * 0.5, vertex[axes[1]] * 0.5)


def finish(obj, material, bevel=0.0):
    obj.data.materials.append(material)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new('Small authored arris', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 1
        modifier.limit_method = 'ANGLE'
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    metric_uv(obj)
    for polygon in obj.data.polygons:
        polygon.use_smooth = False
    obj.select_set(False)
    return obj


def box(name, position, size, material, bevel=0.025):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=point(position))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (size[0], size[2], size[1])
    return finish(obj, material, bevel)


def cylinder(name, position, radius, height, material, bevel=0.018, sides=12):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=sides,
        radius=radius,
        depth=height,
        location=point(position),
    )
    obj = bpy.context.object
    obj.name = name
    return finish(obj, material, bevel)


def beam_between(name, start, end, width, depth, material, bevel=0.018):
    start_blender = Vector(point(start))
    end_blender = Vector(point(end))
    delta = end_blender - start_blender
    midpoint = (start_blender + end_blender) * 0.5
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=midpoint)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (width, depth, delta.length)
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = delta.to_track_quat('Z', 'Y')
    obj.rotation_mode = 'XYZ'
    return finish(obj, material, bevel)


def prism(name, cross_section, depth, material, bevel=0.018):
    """Extrude a PlayCanvas X/Y profile along Z."""
    half_depth = depth * 0.5
    positions = []
    for z in (-half_depth, half_depth):
        positions.extend((x, y, z) for x, y in cross_section)
    count = len(cross_section)
    faces = []
    faces.append(tuple(range(count - 1, -1, -1)))
    faces.append(tuple(range(count, count * 2)))
    for index in range(count):
        next_index = (index + 1) % count
        faces.append((index, next_index, count + next_index, count + index))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([point(position) for position in positions], [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish(obj, material, bevel)


def roof_half(name, side, material):
    """Solid pitched roof half with a genuine sloped top and shallow fascia."""
    eave_x = 3.42 * side
    ridge_x = 0.0
    eave_y = 4.74
    ridge_y = 6.16
    z0, z1 = -4.18, 4.18
    cross_section = [
        (ridge_x, ridge_y),
        (eave_x, eave_y),
        (eave_x, eave_y - 0.17),
        (ridge_x, ridge_y - 0.17),
    ]
    return prism(name, cross_section, z1 - z0, material, bevel=0.025)


def add_anchor(name, position, role):
    anchor = bpy.data.objects.new(name, None)
    anchor.empty_display_type = 'PLAIN_AXES'
    anchor.empty_display_size = 0.25
    anchor.location = point(position)
    anchor['role'] = role
    bpy.context.collection.objects.link(anchor)
    return anchor


# One semantic root preserves the exact gameplay placement contract.
model_root = bpy.data.objects.new('WorkshopExteriorRoot', None)
model_root.empty_display_type = 'CUBE'
model_root.empty_display_size = 0.5
model_root['assemblyOrigin'] = 'plaza workshop root [-10.5, 0, -4]'
model_root['footprint'] = 'x[-3.1, 3.1], z[-4.0, 4.0], existing collider x[-3.1,3.1] z[-3.8,3.8]'
bpy.context.collection.objects.link(model_root)

# Base and complete envelope. The existing shell is 6 m x 7.5 m with a 6.15 m
# gable; all new masses stay within that surveyed envelope except the existing
# service bench extension on the Plaza side.
box('WorkshopStoneBase', (0, 0.34, 0), (6.5, 0.68, 8.0), MATERIALS['Limestone'], 0.045)
for z in (-2.23, 2.23):
    box('WorkshopStoneCourseEast', (2.92, 0.91, z), (0.30, 0.48, 2.74), MATERIALS['Limestone'], 0.025)
box('WorkshopStoneCourseWest', (-2.92, 0.91, 0), (0.30, 0.48, 7.2), MATERIALS['Limestone'], 0.025)
box('WorkshopStoneCourseFront', (0, 0.91, -3.57), (5.8, 0.48, 0.30), MATERIALS['Limestone'], 0.025)
box('WorkshopStoneCourseRear', (0, 0.91, 3.57), (5.8, 0.48, 0.30), MATERIALS['Limestone'], 0.025)

# Side and rear facades are substantial, closed architectural masses. The east
# elevation is split around the open door so its original interaction stays clear.
box('WorkshopWestFacade', (-2.80, 2.72, 0), (0.34, 3.82, 7.0), MATERIALS['Plaster'], 0.035)
box('WorkshopFrontFacade', (0, 2.72, -3.43), (5.55, 3.82, 0.34), MATERIALS['Plaster'], 0.035)
box('WorkshopRearFacade', (0, 2.72, 3.43), (5.55, 3.82, 0.34), MATERIALS['Plaster'], 0.035)
box('WorkshopEastFacadeSouth', (2.80, 2.72, -2.18), (0.34, 3.82, 2.5), MATERIALS['Plaster'], 0.035)
box('WorkshopEastFacadeNorth', (2.80, 2.72, 2.18), (0.34, 3.82, 2.5), MATERIALS['Plaster'], 0.035)
box('WorkshopEastFacadeDoorHeader', (2.80, 3.78, 0), (0.34, 1.70, 1.58), MATERIALS['Plaster'], 0.035)

# Door recess, jambs, threshold and copper service traces. The centre remains a
# visual opening: no asset collider is introduced here.
box('WorkshopDoorRecess', (1.25, 1.66, 0), (0.08, 2.02, 1.55), MATERIALS['Interior'], 0.005)
box('WorkshopDoorJambSouth', (3.02, 1.52, -0.91), (0.42, 3.00, 0.30), MATERIALS['Limestone'], 0.035)
box('WorkshopDoorJambNorth', (3.02, 1.52, 0.91), (0.42, 3.00, 0.30), MATERIALS['Limestone'], 0.035)
box('WorkshopDoorLintel', (3.02, 3.05, 0), (0.42, 0.34, 2.12), MATERIALS['Limestone'], 0.035)
box('WorkshopThreshold', (3.16, 0.13, 0), (1.0, 0.24, 2.18), MATERIALS['Limestone'], 0.025)
box('WorkshopThresholdStrip', (3.25, 0.26, 0), (0.07, 0.06, 1.72), MATERIALS['Copper'], 0.008)
box('WorkshopDoorHeaderCopper', (3.26, 3.00, 0), (0.07, 0.12, 1.72), MATERIALS['Copper'], 0.008)
for z in (-0.91, 0.91):
    box('WorkshopDoorCopperJamb', (3.26, 1.55, z), (0.07, 2.25, 0.08), MATERIALS['Copper'], 0.008)

# Recessed windows on the east face and narrow service openings on the long sides.
for z in (-2.15, 2.15):
    box('WorkshopEastWindowRecess', (3.00, 2.62, z), (0.08, 1.35, 1.05), MATERIALS['Interior'], 0.008)
    box('WorkshopEastWindowSill', (3.18, 1.91, z), (0.46, 0.15, 1.30), MATERIALS['Limestone'], 0.02)
    box('WorkshopEastWindowTop', (3.18, 3.34, z), (0.22, 0.18, 1.34), MATERIALS['Wood'], 0.018)
    box('WorkshopEastWindowLeft', (3.18, 2.62, z - 0.60), (0.22, 1.38, 0.16), MATERIALS['Wood'], 0.018)
    box('WorkshopEastWindowRight', (3.18, 2.62, z + 0.60), (0.22, 1.38, 0.16), MATERIALS['Wood'], 0.018)
    box('WorkshopEastWindowMullion', (3.24, 2.62, z), (0.10, 1.10, 0.08), MATERIALS['Copper'], 0.008)

for z in (-2.15, 2.15):
    box('WorkshopEastTimberPost', (3.13, 2.55, z), (0.25, 4.00, 0.22), MATERIALS['Wood'], 0.025)
box('WorkshopEastTimberAboveDoor', (3.13, 3.85, 0), (.25, 1.40, .22), MATERIALS['Wood'], .025)
for z in (-2.22, 2.22):
    box('WorkshopEastTimberLowerRail', (3.13, 1.23, z), (0.25, 0.22, 2.42), MATERIALS['Wood'], 0.02)
box('WorkshopEastTimberUpperRail', (3.13, 4.02, 0), (0.25, 0.24, 6.85), MATERIALS['Wood'], 0.02)

# Timber framing makes each complete side read as carpentry rather than a flat wall.
for x in (-2.48, -0.8, 0.8, 2.48):
    box('WorkshopFrontTimberPost', (x, 2.55, -3.64), (0.22, 4.02, 0.22), MATERIALS['Wood'], 0.02)
    box('WorkshopRearTimberPost', (x, 2.55, 3.64), (0.22, 4.02, 0.22), MATERIALS['Wood'], 0.02)
for z in (-3.43, 3.43):
    box('WorkshopFacadeLowerRail', (0, 1.24, z), (5.4, 0.22, 0.22), MATERIALS['Wood'], 0.02)
    box('WorkshopFacadeUpperRail', (0, 4.02, z), (5.4, 0.24, 0.22), MATERIALS['Wood'], 0.02)
for x in (-2.48, 0, 2.48):
    beam_between('WorkshopFrontBrace', (x, 1.35, -3.67), (x + (0.55 if x <= 0 else -0.55), 2.45, -3.67), 0.16, 0.18, MATERIALS['Wood'], 0.018)
    beam_between('WorkshopRearBrace', (x, 1.35, 3.67), (x + (0.55 if x <= 0 else -0.55), 2.45, 3.67), 0.16, 0.18, MATERIALS['Wood'], 0.018)
for x in (-2.76,):
    box('WorkshopSideLowerRail', (x, 1.22, 0), (0.22, 0.22, 6.8), MATERIALS['Wood'], 0.02)
    box('WorkshopSideUpperRail', (x, 4.02, 0), (0.24, 0.24, 6.8), MATERIALS['Wood'], 0.02)
for x in (-2.76,):
    beam_between('WorkshopSideBraceNorth', (x, 1.36, 0.15), (x, 2.55, 1.28), 0.16, 0.18, MATERIALS['Wood'], 0.018)
    beam_between('WorkshopSideBraceSouth', (x, 1.36, -0.15), (x, 2.55, -1.28), 0.16, 0.18, MATERIALS['Wood'], 0.018)

# A real two-plane roof, eaves/soffits and a ridge cap replace the old floating slab.
roof_half('WorkshopRoofEast', 1, MATERIALS['Roof'])
roof_half('WorkshopRoofWest', -1, MATERIALS['Roof'])
box('WorkshopEastSoffit', (3.40, 4.64, 0), (0.28, 0.18, 8.42), MATERIALS['Wood'], 0.018)
box('WorkshopWestSoffit', (-3.40, 4.64, 0), (0.28, 0.18, 8.42), MATERIALS['Wood'], 0.018)
box('WorkshopRidgeBeam', (0, 6.10, 0), (0.42, 0.28, 8.44), MATERIALS['Wood'], 0.025)
box('WorkshopRidgeCap', (0, 6.28, 0), (0.58, 0.16, 8.34), MATERIALS['Roof'], 0.018)
for x, y in ((-2.20, 5.25), (-1.1, 5.70), (1.1, 5.70), (2.20, 5.25)):
    box('WorkshopRoofPurlin', (x, y, 0), (0.16, 0.18, 8.18), MATERIALS['Wood'], 0.014)

# Compact chimney and cap at the existing rear-west landmark position.
box('WorkshopChimney', (-0.92, 6.25, -1.68), (0.68, 1.62, 0.68), MATERIALS['Limestone'], 0.025)
box('WorkshopChimneyCap', (-0.92, 7.08, -1.68), (0.86, 0.16, 0.86), MATERIALS['Iron'], 0.018)

# Functional service bench and contact rail retain the current surveyed position:
# world [-6.55, 0.72, -1.05] when this root is placed at [-10.5, 0, -4].
box('WorkshopBenchVisual', (3.95, 0.72, 2.95), (2.35, 0.20, 0.85), MATERIALS['Wood'], 0.035)
for x in (3.35, 4.55):
    for z in (2.68, 3.22):
        box('WorkshopBenchLeg', (x, 0.38, z), (0.18, 0.64, 0.18), MATERIALS['Wood'], 0.018)
box('WorkshopServiceBackboard', (3.16, 1.38, 2.95), (0.18, 1.30, 2.20), MATERIALS['Wood'], 0.02)
box('WorkshopServiceRail', (3.28, 1.18, 2.95), (0.10, 0.10, 1.95), MATERIALS['Copper'], 0.01)
for index, z in enumerate((2.34, 2.95, 3.56)):
    cylinder(f'WorkshopServiceInsulator{index}', (3.38, 1.18, z), 0.13, 0.26, MATERIALS['Limestone'], 0.015, 12)
    cylinder(f'WorkshopServiceTerminal{index}', (3.52, 1.18, z), 0.07, 0.13, MATERIALS['Copper'], 0.01, 12)
box('WorkshopToolTray', (4.02, 0.88, 2.95), (0.92, 0.10, 0.48), MATERIALS['Iron'], 0.02)
box('WorkshopToolTrayLip', (4.02, 0.98, 2.95), (0.98, 0.08, 0.08), MATERIALS['Copper'], 0.008)
cylinder('WorkshopCableSpool', (4.40, 0.53, 3.60), 0.34, 0.28, MATERIALS['Wood'], 0.02, 16)
cylinder('WorkshopCableCoil', (4.40, 0.53, 3.60), 0.22, 0.34, MATERIALS['Copper'], 0.012, 16)

# Semantic empty nodes survive GLB import and give the future loader stable hooks
# without raising draw calls or introducing a second gameplay hierarchy.
for name, position, role in (
    ('WorkshopDoorwayAnchor', (3.2, 0.0, 0.0), 'preserve existing door interaction'),
    ('WorkshopBenchAnchor', (3.95, 0.0, 2.95), 'preserve existing service bench landmark'),
    ('WorkshopRoofAnchor', (0.0, 4.7, 0.0), 'pitched roof and soffit assembly'),
    ('WorkshopRearFacadeAnchor', (0.0, 2.5, 3.43), 'complete rear facade'),
):
    anchor = add_anchor(name, position, role)
    anchor.parent = model_root


# Join geometry by material for a predictable <=8 draw-call delivery while
# retaining semantic empty anchors above.
for key, material in MATERIALS.items():
    objects = [
        obj for obj in bpy.context.scene.objects
        if obj.type == 'MESH' and obj.data.materials and obj.data.materials[0] == material
    ]
    if not objects:
        continue
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    assembly = bpy.context.object
    assembly.name = f'WorkshopExterior_{key}Assembly'
    bpy.context.scene.cursor.location = (0.0, 0.0, 0.0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    assembly.parent = model_root
    assembly.select_set(False)

for obj in [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    modifier = obj.modifiers.new('DeliveryTriangles', 'TRIANGULATE')
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.select_set(False)


def scene_metrics():
    minimum = Vector((float('inf'), float('inf'), float('inf')))
    maximum = Vector((float('-inf'), float('-inf'), float('-inf')))
    triangles = 0
    meshes = 0
    materials = set()
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH':
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
    dimensions = [gltf_maximum[i] - gltf_minimum[i] for i in range(3)]
    center = [(gltf_minimum[i] + gltf_maximum[i]) * 0.5 for i in range(3)]
    return {
        'boundsSource': 'vertices',
        'aabb': {'min': gltf_minimum, 'max': gltf_maximum},
        'dims': dimensions,
        'center': center,
        'groundOffset': -gltf_minimum[1],
        'triangles': triangles,
        'meshes': meshes,
        'materials': sorted(materials),
    }


metrics = scene_metrics()
output_path = OUT / 'workshop-exterior.glb'
bpy.ops.export_scene.gltf(
    filepath=str(output_path),
    export_format='GLB',
    export_yup=True,
    export_tangents=True,
    export_cameras=False,
    export_lights=False,
    use_selection=False,
)
runtime_bytes = output_path.stat().st_size
runtime_sha256 = hashlib.sha256(output_path.read_bytes()).hexdigest()

(OUT / 'calibration.json').write_text(json.dumps({
    'asset': 'workshop-exterior.glb',
    'sourceScript': 'scripts/3d/build-workshop-exterior.py',
    'assemblyOrigin': {'name': 'Plaza workshop root', 'position': [-10.5, 0.0, -4.0]},
    'localOrigin': [0.0, 0.0, 0.0],
    'scale': 1.0,
    'yawDegrees': 0.0,
    'upAxis': '+Y',
    'frontAxis': '+Z',
    'doorLocalCenter': [3.2, 1.4, 0.0],
    'benchLocalCenter': [3.95, 0.72, 2.95],
    'footprintContract': {
        'existingColliderWorldCenter': [-10.5, 0.0, -4.0],
        'existingColliderSize': [6.2, 7.6],
        'existingDoorWorldCenter': [-7.3, 1.4, -4.0],
        'existingBenchWorldCenter': [-6.55, 0.72, -1.05],
    },
    'metrics': metrics,
    'runtime': {'bytes': runtime_bytes, 'sha256': runtime_sha256},
}, indent=2) + '\n', encoding='utf8')

(OUT / 'provenance.json').write_text(json.dumps({
    'schemaVersion': 1,
    'assetId': 'rx_ohmdal_workshop_exterior_01',
    'provider': 'Proyecto Roxana',
    'sourceMethod': 'deterministic Blender-authored architecture',
    'script': 'scripts/3d/build-workshop-exterior.py',
    'license': 'Original Proyecto Roxana geometry; no external asset or paid generation.',
    'canonicalization': {
        'tool': 'Blender 5.2',
        'unit': 'meter',
        'upAxis': '+Y',
        'frontAxis': '+Z',
        'pivot': 'WorkshopExteriorRoot local origin',
        'worldAssemblyOrigin': [-10.5, 0.0, -4.0],
    },
    'runtimeFile': 'workshop-exterior.glb',
    'runtimeSha256': runtime_sha256,
    'runtimeBytes': runtime_bytes,
    'metrics': metrics,
    'semanticAnchors': [
        'WorkshopDoorwayAnchor',
        'WorkshopBenchAnchor',
        'WorkshopRoofAnchor',
        'WorkshopRearFacadeAnchor',
    ],
    'sourceBindingsToHideBeforeBatchGenerate': [
        'WorkshopAuthoredShell',
        'WorkshopStoneBase',
        'WorkshopRoofEastAuthored',
        'WorkshopRoofWestAuthored',
        'WorkshopRidge',
        'WorkshopChimney',
        'WorkshopChimneyCap',
        'WorkshopFrameEast-6.9',
        'WorkshopFrameEast-4',
        'WorkshopFrameEast-1.1',
        'WorkshopFrameWest-6.9',
        'WorkshopFrameWest-4',
        'WorkshopFrameWest-1.1',
        'WorkshopDoorRecess',
        'WorkshopDoorJamb0',
        'WorkshopDoorJamb1',
        'WorkshopDoorConductor0',
        'WorkshopDoorConductor1',
        'WorkshopDoorLintel',
        'WorkshopDoorHeader',
        'WorkshopThreshold',
        'WorkshopThresholdStrip',
        'WorkshopWindowFrame-6.05',
        'WorkshopWindowFrame-1.95',
        'WorkshopWindowVoid-6.05',
        'WorkshopWindowVoid-1.95',
        'WorkshopWindowSill-6.05',
        'WorkshopWindowSill-1.95',
        'WorkshopWindowMullion-6.05',
        'WorkshopWindowMullion-1.95',
        'WorkshopServiceCluster',
        'WorkshopLanternBracket',
        'WorkshopLanternHousing',
    ],
    'notes': [
        'The asset is visual-only and introduces no collider or gameplay state.',
        'The east doorway remains open and matches the existing door/threshold landmark.',
        'The service bench remains at the existing world-space landmark for future visual replacement.',
        'Materials are authored matte PBR with localized aged copper; no passive emission or new symbols.',
    ],
}, indent=2) + '\n', encoding='utf8')

print('OUTPUT', output_path)
print('METRICS', json.dumps(metrics, sort_keys=True))
print('RUNTIME_BYTES', runtime_bytes)
print('RUNTIME_SHA256', runtime_sha256)
