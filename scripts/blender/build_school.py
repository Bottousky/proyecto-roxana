"""Build the Instituto Roxana diorama and export it for Three.js.

Run with Blender 4.5 LTS:
  blender --background --factory-startup --python scripts/blender/build_school.py

Pipeline (each stage is idempotent and printed to stdout):

  1. build      geometry from code, on a readable campus grid
  2. densify    subdivide large flat surfaces so baked gradients have somewhere to live
  3. bake       Cycles COMBINED -> vertex colours (no runtime lights on the web)
  4. flatten    one material for everything, meshes joined per room
  5. export     GLB with Draco compression
  6. preview    control render that matches what the browser will show

The scene is deliberately procedural: room roots, click surfaces and NPC anchors
keep stable names, so the web runtime can react to progress without re-authoring
the whole school.
"""

from __future__ import annotations

import math
import json
import shutil
import sys
import time
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
OUT = (Path(sys.argv[sys.argv.index("--output-dir") + 1]).resolve()
       if "--output-dir" in sys.argv else ROOT / "assets" / "school3d")
OUT.mkdir(parents=True, exist_ok=True)
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from school_plan import (  # noqa: E402
    ANNEX_ROOM_IDS,
    DOORS,
    HALL_CENTER,
    HALL_SIZE,
    PRIMARY_BY_ID,
    exposed_front_segments,
    room_tuples,
    validate_plan,
)

# Bake quality. `--draft` sirve para diagnóstico de geometría; `--fast`, para
# iterar composición; sin flag se produce el asset final.
DRAFT = "--draft" in sys.argv
FAST = "--fast" in sys.argv
BLOCKOUT = "--blockout" in sys.argv
BAKE_SAMPLES = 4 if DRAFT else 24 if FAST else 220
DIRECTION_FLOOR_RISE = 1.14
HALL_LANDING_NORTH = 10.1
HALL_LANDING_SURFACE = 1.47
AMPHITHEATRE_ROW_COUNT = 3
AMPHITHEATRE_SEAT_OFFSETS = (-3.0, -1.7, 1.7, 3.0)


def log(stage: str, message: str) -> None:
    print(f"[roxana:{stage}] {message}", flush=True)


# ---------------------------------------------------------------------------
# Diorama plan
# ---------------------------------------------------------------------------
# The target is one compact orthogonal dollhouse on an absolute 0.5 m grid.
# Room rectangles may share an edge but never overlap in area. Boundary
# ownership comes from school_plan.py, so a shared wall is authored only once.
# Every ROOM_<id> remains independent for raycasting and state.
#
#              MATEMATICA    DIRECCION    FISICA
#              ELECTRONICA [   HALL   ] PROGRAMACION
#                 PRECEPTORIA       ANFITEATRO
# AV, BIBLIOTECA and LOGROS are side thresholds inside the Hall.

PLAN_ISSUES = validate_plan()
if PLAN_ISSUES:
    raise RuntimeError("Plano escolar inválido:\n" + "\n".join(PLAN_ISSUES))

ROOMS = room_tuples()


COLORS = {
    # Paredes y suelos separados en valor, no sólo en tono: en una casa de
    # muñecas vista desde arriba, si todo tiene el mismo brillo la escena se
    # lee como una masa lechosa y se pierde el volumen de cada sala.
    "cream": (0.71, 0.64, 0.55, 1),
    "cream_light": (0.55, 0.49, 0.42, 1),
    "stone": (0.50, 0.53, 0.55, 1),
    "stone_dark": (0.24, 0.27, 0.29, 1),
    "wood": (0.33, 0.16, 0.08, 1),
    "wood_light": (0.55, 0.29, 0.12, 1),
    "gold": (0.94, 0.56, 0.12, 1),
    "teal": (0.05, 0.37, 0.34, 1),
    "cyan": (0.03, 0.42, 0.56, 1),
    "indigo": (0.16, 0.18, 0.38, 1),
    "violet": (0.30, 0.18, 0.40, 1),
    "wine": (0.37, 0.12, 0.15, 1),
    "green": (0.18, 0.38, 0.25, 1),
    "coral": (0.66, 0.24, 0.18, 1),
    "amber": (0.58, 0.32, 0.08, 1),
    "paper": (0.88, 0.81, 0.65, 1),
    "chalk": (0.025, 0.11, 0.10, 1),
    "screen": (0.01, 0.34, 0.43, 1),
    "black": (0.025, 0.03, 0.04, 1),
    "white": (0.98, 0.93, 0.80, 1),
    "leaf": (0.075, 0.26, 0.115, 1),
    "skin1": (0.77, 0.46, 0.29, 1),
    "skin2": (0.45, 0.23, 0.13, 1),
    "skin3": (0.93, 0.68, 0.48, 1),
    "blue": (0.08, 0.24, 0.46, 1),
    "pink": (0.75, 0.19, 0.42, 1),
}

# Objects whose broad flat faces need extra vertices for the baked gradient.
DENSIFY_RULES = (
    ("SCHOOL__plinth", 2.2),
    ("SCHOOL__lawn", 2.2),
    ("SCHOOL__path", 1.2),
    ("SCHOOL__court", 1.2),
    ("SCHOOL__front_steps", 1.2),
    ("__click_floor", 0.65),
    ("__floor_inset", 0.65),
    ("__back_wall", 0.7),
    ("_wainscot", 0.6),
    ("__left_wall", 0.7),
    ("__right_wall", 0.7),
    ("__front_curb", 0.9),
    ("__rug", 0.9),
)

# Roots that stay separate meshes because the runtime animates them.
ANIMATED_PREFIXES = ("NPC_",)
ANIMATED_NAMES = (
    "ELECTRO__ohmdal_portal",
    "ELECTRO__progress_portal_sector",
    "ELECTRO__progress_robot",
    "ELECTRO__progress_workbench_2",
    "ELECTRO__progress_board",
    "HALL__progress_relic",
    "HALL__progress_lamp",
)
# Hero assets the web runtime swaps for a higher-detail external GLB at load
# time. They still take part in the bake, so the Hall keeps the contact shadow
# and the bounced light the sculpture casts on the floor.
HERO_ROOTS = ("HALL__roxana_statue",)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def mat(name, color, roughness=0.72, metallic=0.0, emission=None, strength=0.0):
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.diffuse_color = color
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = emission
        bsdf.inputs["Emission Strength"].default_value = strength
    return material


def assign(obj, material):
    obj.data.materials.append(material)
    return obj


def box(name, loc, scale, material, parent=None, bevel=0.10):
    # Direct mesh creation avoids a dependency-graph update for every plank.
    # Dimensions are already baked into the vertices, preserving the old API.
    hx, hy, hz = (value / 2 for value in scale)
    vertices = ((-hx, -hy, -hz), (hx, -hy, -hz), (hx, hy, -hz), (-hx, hy, -hz),
                (-hx, -hy, hz), (hx, -hy, hz), (hx, hy, hz), (-hx, hy, hz))
    faces = ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
             (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7))
    mesh = bpy.data.meshes.new(f"{name}__geometry")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    assign(obj, material)
    if bevel:
        modifier = obj.modifiers.new("Soft edges", "BEVEL")
        modifier.width = min(bevel, min(scale) * 0.18)
        modifier.segments = 2
    obj.parent = parent
    return obj


def primitive_mesh(name, loc, vertices, faces, material, parent):
    mesh = bpy.data.meshes.new(f"{name}__geometry")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.parent = parent
    assign(obj, material)
    return obj


def cylinder(name, loc, radius, depth, material, parent=None, vertices=16):
    return cone(name, loc, radius, radius, depth, material, parent, vertices)


def polygon_prism(name, loc, radius_x, radius_y, depth, material, parent=None, vertices=8, rotation=math.pi / 8):
    obj = cylinder(name, loc, 1.0, depth, material, parent, vertices)
    for vertex in obj.data.vertices:
        vertex.co.x *= radius_x
        vertex.co.y *= radius_y
    obj.rotation_euler.z = rotation
    obj.modifiers[0].width = min(.08, depth * .22)
    return obj


def sphere(name, loc, radius, material, parent=None, segments=14, rings=7):
    points = [(0, 0, radius)]
    for ring in range(1, rings):
        phi = math.pi * ring / rings
        for segment in range(segments):
            theta = math.tau * segment / segments
            points.append((radius * math.sin(phi) * math.cos(theta), radius * math.sin(phi) * math.sin(theta), radius * math.cos(phi)))
    bottom = len(points)
    points.append((0, 0, -radius))
    faces = []
    for segment in range(segments):
        nxt = (segment + 1) % segments
        faces.append((0, 1 + segment, 1 + nxt))
        for ring in range(rings - 2):
            start = 1 + ring * segments
            faces.append((start + segment, start + segments + segment, start + segments + nxt, start + nxt))
        start = 1 + (rings - 2) * segments
        faces.append((bottom, start + nxt, start + segment))
    return primitive_mesh(name, loc, points, faces, material, parent)


def ellipsoid(name, loc, scale, material, parent=None, segments=14, rings=7):
    obj = sphere(name, loc, 1.0, material, parent, segments, rings)
    for vertex in obj.data.vertices:
        for axis in range(3): vertex.co[axis] *= scale[axis]
    return obj


def cone(name, loc, radius_bottom, radius_top, depth, material, parent=None, vertices=16, y_scale=1.0):
    points = []
    for z, radius in ((-depth / 2, radius_bottom), (depth / 2, radius_top)):
        for index in range(vertices):
            angle = math.tau * index / vertices
            points.append((math.cos(angle) * radius, math.sin(angle) * radius * y_scale, z))
    faces = [tuple(reversed(range(vertices))), tuple(range(vertices, 2 * vertices))]
    for index in range(vertices):
        nxt = (index + 1) % vertices
        faces.append((index, nxt, vertices + nxt, vertices + index))
    obj = primitive_mesh(name, loc, points, faces, material, parent)
    modifier = obj.modifiers.new("Soft edges", "BEVEL")
    modifier.width = min(.08, min(radius_bottom, radius_top) * .18)
    modifier.segments = 2
    return obj


def cylinder_between(name, start, end, radius, material, parent=None, vertices=12):
    start_v = Vector(start)
    end_v = Vector(end)
    direction = end_v - start_v
    obj = cylinder(name, (start_v + end_v) / 2, radius, direction.length, material, parent, vertices)
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    return obj


def ico_ellipsoid(name, loc, scale, material, parent=None, subdivisions=2):
    mesh = bpy.data.meshes.new(f"{name}__geometry")
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdivisions, radius=1.0)
    for vertex in bm.verts:
        for axis in range(3): vertex.co[axis] *= scale[axis]
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.parent = parent
    assign(obj, material)
    return obj


def faceted_form(name, loc, rings, material, parent=None, segments=12):
    """Triangulated tapered volume made from (z, radius_x, radius_y, phase) rings."""
    vertices = []
    for ring_index, (z, radius_x, radius_y, phase) in enumerate(rings):
        for index in range(segments):
            angle = math.tau * index / segments + phase
            variation = 1.0 + .035 * math.sin(index * 2.31 + ring_index * 1.73)
            vertices.append((math.cos(angle) * radius_x * variation, math.sin(angle) * radius_y * variation, z))

    faces = []
    for ring_index in range(len(rings) - 1):
        lower = ring_index * segments
        upper = (ring_index + 1) * segments
        for index in range(segments):
            nxt = (index + 1) % segments
            if (index + ring_index) % 2:
                faces.extend(((lower + index, upper + index, lower + nxt), (lower + nxt, upper + index, upper + nxt)))
            else:
                faces.extend(((lower + index, upper + index, upper + nxt), (lower + index, upper + nxt, lower + nxt)))
    faces.append(tuple(reversed(range(segments))))
    top = (len(rings) - 1) * segments
    faces.append(tuple(top + index for index in range(segments)))

    mesh = bpy.data.meshes.new(f"{name}__mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    assign(obj, material)
    obj.parent = parent
    return obj


def faceted_limb(name, start, end, radius_start, radius_end, material, parent=None, vertices=8):
    start_v = Vector(start)
    end_v = Vector(end)
    direction = end_v - start_v
    obj = cone(name, (start_v + end_v) / 2, radius_start, radius_end, direction.length, material, parent, vertices)
    obj.modifiers.clear()
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    return obj


def extruded_xz_polygon(name, points, y_front, y_back, material, parent=None):
    """Shallow triangulated relief panel, used for coat tails and lapels."""
    count = len(points)
    vertices = [(x, y_front, z) for x, z in points] + [(x, y_back, z) for x, z in points]
    faces = []
    for index in range(1, count - 1):
        faces.append((0, index, index + 1))
        faces.append((count, count + index + 1, count + index))
    for index in range(count):
        nxt = (index + 1) % count
        faces.append((index, count + index, count + nxt, nxt))
    mesh = bpy.data.meshes.new(f"{name}__mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    assign(obj, material)
    obj.parent = parent
    return obj


def empty(name, loc=(0, 0, 0), parent=None):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.parent = parent
    return obj


def plant(name, x, y, z, parent, scale=1.0):
    cylinder(f"{name}__pot", (x, y, z + 0.18 * scale), 0.30 * scale, 0.38 * scale, M["terracotta"], parent, 12)
    for index, (dx, dy, dz) in enumerate(((0, 0, .72), (.22, 0, .58), (-.18, .08, .62), (0, -.18, .82))):
        sphere(f"{name}__leaf_{index}", (x + dx * scale, y + dy * scale, z + dz * scale), .30 * scale, M["leaf"], parent, 10, 5)


def chair(name, x, y, z, parent, material=None, rotation=math.pi):
    """One grounded chair, authored around its own pivot; default faces +Y."""
    material = material or M["teal"]
    root = empty(name, (x, y, z), parent)
    box(f"{name}__seat", (0, 0, .48), (.68, .67, .14), material, root, .06)
    box(f"{name}__back", (0, .27, .85), (.68, .12, .57), material, root, .05)
    for dx in (-.24, .24):
        for dy in (-.23, .23):
            box(f"{name}__leg", (dx, dy, .22), (.075, .075, .44), M["stone_dark"], root, .02)
    for dx in (-.25, .25):
        box(f"{name}__back_support", (dx, .27, .58), (.07, .07, .72), M["wood"], root, .02)
    root.rotation_euler[2] = rotation
    return root


def desk(name, x, y, z, parent, width=2.2, depth=1.0, screen=False):
    root = empty(name, parent=parent)
    box(f"{name}__top", (x, y, z + .92), (width, depth, .18), M["wood_light"], root, .07)
    for dx in (-width * .40, width * .40):
        box(f"{name}__leg", (x + dx, y, z + .43), (.16, depth * .72, .86), M["wood"], root, .04)
    if screen:
        box(f"{name}__monitor", (x, y + .12, z + 1.55), (1.05, .13, .68), M["black"], root, .06)
        box(f"{name}__display", (x, y + .04, z + 1.56), (.88, .025, .51), M["screen"], root, .02)
        box(f"{name}__stand", (x, y + .12, z + 1.13), (.12, .12, .30), M["stone_dark"], root, .02)
    return root


def bookshelf(name, x, y, z, parent, width=2.4, height=2.8):
    root = empty(name, parent=parent)
    box(f"{name}__body", (x, y, z + height / 2), (width, .48, height), M["wood"], root, .08)
    box(f"{name}__inner", (x, y - .27, z + height / 2), (width - .22, .08, height - .25), M["black"], root, .02)
    palette = [M["teal"], M["gold"], M["wine"], M["blue"], M["paper"]]
    for row in range(3):
        for col in range(7):
            h = .48 + .10 * ((row + col) % 3)
            bx = x - width * .40 + col * (width * .80 / 6)
            box(f"{name}__book_{row}_{col}", (bx, y - .34, z + .30 + row * .82 + h / 2), (.16, .18, h), palette[(row + col) % len(palette)], root, 0)
    return root


def side_bench(name, x, y, z, parent, length=2.2):
    """Narrow institutional bench aligned with Y, for the Hall side aisles."""
    root = empty(name, parent=parent)
    box(f"{name}__seat", (x, y, z + .56), (.62, length, .18), M["wood_light"], root, .06)
    box(f"{name}__back", (x + .24, y, z + .98), (.16, length, .72), M["wood"], root, .05)
    for dy in (-length * .38, length * .38):
        box(f"{name}__leg_{dy}", (x, y + dy, z + .28), (.16, .16, .56), M["stone_dark"], root, .03)
    return root


def noticeboard(name, x, y, z, parent, width=2.35, height=1.35):
    """Empty cork board. Readable copy is projected by the DOM, never baked."""
    root = empty(name, parent=parent)
    box(f"{name}__frame", (x, y, z + height / 2), (width + .24, .16, height + .24), M["wood"], root, .05)
    box(f"{name}__cork", (x, y - .10, z + height / 2), (width, .06, height), M["terracotta"], root, .02)
    for index, (dx, dz) in enumerate(((-.82, .37), (.76, .32), (-.55, -.34), (.64, -.29))):
        sphere(f"{name}__pin_{index}", (x + dx, y - .15, z + height / 2 + dz), .045, M["gold"], root, 8, 4)
    return root


def display_case_side(name, x, y, z, parent):
    """Tall side-facing display case with a readable technical silhouette."""
    root = empty(name, parent=parent)
    box(f"{name}__base", (x, y, z + .18), (.72, 1.90, .36), M["wood"], root, .06)
    box(f"{name}__back", (x + .25, y, z + 1.45), (.14, 1.90, 2.25), M["wood"], root, .04)
    box(f"{name}__glass", (x - .13, y, z + 1.45), (.08, 1.72, 2.08), M["glass"], root, .02)
    for shelf_index in range(3):
        shelf_z = z + .55 + shelf_index * .72
        box(f"{name}__shelf_{shelf_index}", (x, y, shelf_z), (.62, 1.76, .08), M["wood_light"], root, .02)
    # Trophy, ceramic insulator and analogue meter: three eras of the school.
    cylinder(f"{name}__trophy_stem", (x - .18, y - .48, z + .92), .08, .48, M["gold"], root, 10)
    cone(f"{name}__trophy_cup", (x - .18, y - .48, z + 1.22), .22, .12, .28, M["gold"], root, 12)
    cylinder(f"{name}__insulator", (x - .18, y + .32, z + 1.66), .14, .46, M["paper"], root, 12)
    box(f"{name}__meter", (x - .17, y - .14, z + 2.28), (.25, .66, .46), M["stone_dark"], root, .04)
    box(f"{name}__meter_face", (x - .32, y - .14, z + 2.30), (.03, .50, .31), M["paper"], root, .01)
    return root


def wall_sconce_side(name, x, y, z, side, parent):
    """Warm Hall sconce attached to a side gallery wall."""
    root = empty(name, parent=parent)
    box(f"{name}__mount", (x, y, z), (.10, .34, .46), M["wood_light"], root, .04)
    box(f"{name}__arm", (x - side * .18, y, z - .03), (.36, .09, .09), M["gold"], root, .03)
    sphere(f"{name}__lamp", (x - side * .38, y, z + .02), .17, M["lamp_soft"], root, 10, 5)
    return root


def side_arch(name, x, y, z, side, parent, label_material):
    """Open classroom threshold: keeps circulation while making the door legible."""
    root = empty(name, parent=parent)
    # The opening is empty space: no black plane closes the circulation path.
    box(f"{name}__post_front", (x, y - 1.36, z + 1.54), (.58, .48, 3.08), M["stone"], root, .08)
    box(f"{name}__post_back", (x, y + 1.36, z + 1.54), (.58, .48, 3.08), M["stone"], root, .08)
    box(f"{name}__lintel", (x, y, z + 3.04), (.62, 3.20, .42), M["cream"], root, .07)
    box(f"{name}__sign", (x - side * .34, y, z + 2.66), (.10, 1.65, .42), M["black"], root, .04)
    box(f"{name}__accent", (x - side * .40, y, z + 2.66), (.04, 1.38, .22), label_material, root, .02)
    return root


def mural_side(name, x, y, z, side, parent, motif):
    """Relief-like technical mural for a Hall side wall, with no generated text."""
    root = empty(name, parent=parent)
    box(f"{name}__frame", (x, y, z), (.12, 2.65, 1.68), M["wood_light"], root, .05)
    box(f"{name}__field", (x - side * .08, y, z), (.05, 2.38, 1.42), M["green"], root, .01)
    face_x = x - side * .13
    if motif == "transmission":
        for index, offset in enumerate((-.67, .67)):
            cylinder_between(
                f"{name}__tower_{index}",
                (face_x, y + offset, z - .50),
                (face_x, y + offset, z + .50),
                .035,
                M["paper"],
                root,
                7,
            )
            cylinder_between(
                f"{name}__crossbar_{index}",
                (face_x, y + offset - .28, z + .22),
                (face_x, y + offset + .28, z + .22),
                .03,
                M["paper"],
                root,
                7,
            )
        cylinder_between(f"{name}__wire", (face_x, y - .67, z + .42), (face_x, y + .67, z + .42), .025, M["gold"], root, 7)
    else:
        bpy.ops.mesh.primitive_torus_add(
            major_radius=.40,
            minor_radius=.055,
            major_segments=18,
            minor_segments=6,
            location=(face_x, y, z),
            rotation=(0, math.radians(90), 0),
        )
        ring = bpy.context.object
        ring.name = f"{name}__motor_ring"
        assign(ring, M["paper"])
        ring.parent = root
        cylinder_between(f"{name}__shaft", (face_x, y - .80, z), (face_x, y + .80, z), .045, M["gold"], root, 8)
        for angle in (0, math.pi / 2):
            cylinder_between(
                f"{name}__winding_{int(angle * 100)}",
                (face_x, y - math.cos(angle) * .31, z - math.sin(angle) * .31),
                (face_x, y + math.cos(angle) * .31, z + math.sin(angle) * .31),
                .045,
                M["paper"],
                root,
                8,
            )
    return root


def lab_stool(name, x, y, z, parent, material=None):
    material = material or M["teal"]
    root = empty(name, parent=parent)
    cylinder(f"{name}__seat", (x, y, z + .67), .34, .16, material, root, 12)
    for dx, dy in ((-.22, -.18), (.22, -.18), (-.22, .18), (.22, .18)):
        cylinder_between(f"{name}__leg_{dx}_{dy}", (x + dx, y + dy, z + .10), (x + dx * .82, y + dy * .82, z + .61), .035, M["stone_dark"], root, 7)
    return root


def lab_instrument(name, x, y, z, parent, material=None, active=False):
    """Generic period bench instrument with silhouette-first controls."""
    material = material or M["stone_dark"]
    root = empty(name, parent=parent)
    box(f"{name}__body", (x, y, z + .26), (.82, .52, .52), material, root, .06)
    box(f"{name}__screen_frame", (x - .16, y - .28, z + .30), (.36, .05, .28), M["black"], root, .02)
    box(f"{name}__screen", (x - .16, y - .315, z + .30), (.28, .02, .20), M["screen"] if active else M["teal"], root, .01)
    for index in range(2):
        sphere(f"{name}__knob_{index}", (x + .18 + index * .16, y - .315, z + .23), .055, M["gold"], root, 8, 4)
    return root


def jointed_lamp(name, x, y, z, parent):
    root = empty(name, parent=parent)
    cylinder(f"{name}__base", (x, y, z + .05), .16, .10, M["stone_dark"], root, 10)
    cylinder_between(f"{name}__arm_low", (x, y, z + .10), (x + .08, y, z + .56), .035, M["gold"], root, 8)
    cylinder_between(f"{name}__arm_high", (x + .08, y, z + .56), (x + .34, y - .08, z + .78), .035, M["gold"], root, 8)
    cone(f"{name}__shade", (x + .38, y - .10, z + .76), .19, .10, .24, M["green"], root, 10)
    return root


def component_cabinet_side(name, x, y, z, parent, height=2.45):
    root = empty(name, parent=parent)
    box(f"{name}__body", (x, y, z + height / 2), (.68, 2.15, height), M["wood"], root, .07)
    for row in range(5):
        for col in range(2):
            drawer_y = y - .48 + col * .96
            drawer_z = z + .38 + row * .42
            box(f"{name}__drawer_{row}_{col}", (x - .37, drawer_y, drawer_z), (.08, .75, .31), M["wood_light"], root, .025)
            sphere(f"{name}__pull_{row}_{col}", (x - .43, drawer_y, drawer_z), .035, M["gold"], root, 8, 4)
    return root


def projector_cart(name, x, y, z, parent):
    root = empty(name, parent=parent)
    box(f"{name}__cart_top", (x, y, z + .82), (1.28, .92, .12), M["stone_dark"], root, .05)
    box(f"{name}__cart_shelf", (x, y, z + .30), (1.10, .78, .10), M["stone_dark"], root, .04)
    for dx, dy in ((-.48, -.32), (.48, -.32), (-.48, .32), (.48, .32)):
        cylinder_between(f"{name}__leg_{dx}_{dy}", (x + dx, y + dy, z + .12), (x + dx, y + dy, z + .76), .035, M["black"], root, 7)
        sphere(f"{name}__wheel_{dx}_{dy}", (x + dx, y + dy, z + .08), .08, M["black"], root, 8, 4)
    box(f"{name}__projector_body", (x, y, z + 1.08), (.72, .70, .42), M["black"], root, .06)
    for index, (dx, radius) in enumerate(((-.27, .30), (.28, .24))):
        reel = cylinder(f"{name}__reel_{index}", (x + dx, y - .08, z + 1.55), radius, .10, M["stone"], root, 16)
        reel.rotation_euler[0] = math.radians(90)
        for spoke in range(3):
            angle = math.tau * spoke / 3
            cylinder_between(
                f"{name}__reel_{index}_spoke_{spoke}",
                (x + dx, y - .14, z + 1.55),
                (x + dx + math.cos(angle) * radius * .72, y - .14, z + 1.55 + math.sin(angle) * radius * .72),
                .025,
                M["black"],
                root,
                6,
            )
    cylinder_between(f"{name}__lens", (x + .36, y - .38, z + 1.12), (x + .36, y - .62, z + 1.12), .12, M["paper"], root, 10)
    root["interactiveId"] = "proyector"
    return root


def person(name, x, y, z, parent, shirt, skin, hair=None, scale=1.0, visitor=False, adult=True):
    """Human-scale figure with a local foot pivot, stable under idle rotation."""
    hair = hair or M["black"]
    root = empty(name, (x, y, z), parent)
    root["role"] = "visitor" if visitor else "teacher" if "teacher" in name else "student"
    root["animation"] = "idle-wander"
    # All rooms share the Hall's adult proportions: no giant chibi heads.
    body_radius, body_z, body_height = .25, 1.08, 1.03
    head_z = 1.78
    cylinder(f"{name}__body", (0, 0, body_z * scale), body_radius * scale, body_height * scale, shirt, root, 12)
    ellipsoid(f"{name}__head", (0, 0, head_z * scale), (.23 * scale, .22 * scale, .27 * scale), skin, root, 12, 8)
    ellipsoid(f"{name}__hair", (0, .035 * scale, 1.98 * scale), (.24 * scale, .22 * scale, .13 * scale), hair, root, 12, 6)
    for side in (-1, 1):
        box(f"{name}__leg", (side * .12 * scale, 0, .35 * scale), (.15 * scale, .18 * scale, .70 * scale), M["stone_dark"], root, .035)
        ellipsoid(f"{name}__shoe", (side * .12 * scale, -.055 * scale, .06 * scale), (.10 * scale, .16 * scale, .065 * scale), M["black"], root, 10, 5)
        cylinder_between(f"{name}__arm", (side * .22 * scale, 0, 1.44 * scale), (side * .31 * scale, -.035 * scale, .97 * scale), .075 * scale, shirt, root, 8)
        sphere(f"{name}__hand", (side * .31 * scale, -.035 * scale, .95 * scale), .082 * scale, skin, root, 8, 5)
        sphere(f"{name}__eye", (side * .077 * scale, -.208 * scale, 1.81 * scale), .026 * scale, M["black"], root, 8, 4)
    return root


def back_window(name, x, y, z, parent, width=1.55, height=2.0):
    """Warm mullioned window laid against the visible face of a rear wall."""
    root = empty(name, parent=parent)
    box(f"{name}__frame", (x, y, z), (width + .30, .12, height + .30), M["wood"], root, .06)
    box(f"{name}__glow", (x, y - .075, z), (width, .04, height), M["lamp_soft"], root, .02)
    box(f"{name}__mullion_v", (x, y - .11, z), (.10, .05, height), M["wood_light"], root, .02)
    box(f"{name}__mullion_h", (x, y - .11, z), (width, .05, .10), M["wood_light"], root, .02)
    return root


def room_shell(room_id, label, center, size, accent):
    x, y = center
    w, d = size
    root = empty(f"ROOM_{room_id}")
    root["roomId"] = room_id
    root["label"] = label
    root["cameraTarget"] = [x, y, 1.0]
    floor_mat = M.get(accent, M["stone"])

    if room_id in ANNEX_ROOM_IDS:
        # Hall services are actual furnished alcoves, oriented towards the
        # visitor, instead of thin plaques embedded in an opaque side wall.
        alcove_x = -8.15 if x < 0 else 8.15
        alcove_y = -4.5 if room_id == "audiovisual" else 3.5
        box(f"ROOM_{room_id}__click_floor", (alcove_x, alcove_y, .345), (3.0, 3.1, .04), floor_mat, root, .035)
        if room_id == "biblioteca":
            bookshelf("ROOM_biblioteca__reading_shelf", alcove_x, alcove_y + 1.15, .37, root, 2.65, 2.55)
            desk("ROOM_biblioteca__reading_table", alcove_x, alcove_y - .30, .24, root, 1.8, .90)
            box("ROOM_biblioteca__open_book", (alcove_x, alcove_y - .30, 1.29), (.74, .48, .07), M["paper"], root, .025)
            chair("ROOM_biblioteca__reading_chair", alcove_x, alcove_y - 1.18, .37, root, M["green"])
        elif room_id == "logros":
            box("ROOM_logros__case_base", (alcove_x, alcove_y + .65, .94), (2.65, .70, 1.12), M["wood"], root, .07)
            box("ROOM_logros__case_back", (alcove_x, alcove_y + .96, 1.94), (2.65, .12, 1.14), M["green"], root, .045)
            for side in (-1, 1):
                box(f"ROOM_logros__case_post_{side}", (alcove_x + side * 1.25, alcove_y + .65, 1.94), (.10, .70, 1.2), M["gold"], root, .025)
            box("ROOM_logros__case_cap", (alcove_x, alcove_y + .65, 2.59), (2.75, .80, .13), M["wood_light"], root, .04)
            for index in range(3):
                cylinder(f"ROOM_logros__display_plinth_{index}", (alcove_x - .78 + index * .78, alcove_y + .55, 1.55), .25, .13, M["stone"], root, 12)
                box(f"ROOM_logros__medal_support_{index}", (alcove_x - .78 + index * .78, alcove_y + .585, 1.77), (.07, .07, .32), M["gold"], root, .01)
                polygon_prism(f"ROOM_logros__empty_medal_{index}", (alcove_x - .78 + index * .78, alcove_y + .55, 1.95), .23, .23, .06, M["stone_dark"], root, 8, 0).rotation_euler[0] = math.pi / 2
        else:
            box("ROOM_audiovisual__screen_frame", (alcove_x, alcove_y + 1.05, 1.96), (2.7, .14, 1.8), M["wood"], root, .055)
            box("ROOM_audiovisual__screen", (alcove_x, alcove_y + .95, 1.96), (2.42, .035, 1.52), M["screen"], root, .025)
            for side in (-1, 1):
                box(f"ROOM_audiovisual__screen_leg_{side}", (alcove_x + side * 1.08, alcove_y + 1.05, .83), (.10, .12, .92), M["wood"], root, .025)
            projector_cart("ROOM_audiovisual__projector", alcove_x, alcove_y - 1.0, .35, root)
        anchor = empty(f"ANCHOR_{room_id}", (alcove_x, alcove_y, .35), root)
        anchor["anchorType"] = "room-focus"
        return root

    if room_id == "hall":
        box(f"ROOM_{room_id}__click_floor", (x, y, .12), (w, d, .24), floor_mat, root, .16)
        box(f"ROOM_{room_id}__floor_inset", (x, y, .27), (w - 1.44, d - 1.44, .08), M["wood"], root, .12)
        anchor = empty(f"ANCHOR_{room_id}", (x, y, .25), root)
        anchor["anchorType"] = "room-focus"
        return root

    box(f"ROOM_{room_id}__click_floor", (x, y, .10), (w, d, .20), floor_mat, root, .16)
    # Banda de color del ancho suficiente para identificar la sala de un vistazo:
    # con el margen anterior (0.34) el acento quedaba reducido a una línea.
    box(f"ROOM_{room_id}__floor_inset", (x, y, .23), (w - 1.35, d - 1.35, .08), M["wood"], root, .10)
    floor_core = M["stone_dark"] if room_id in {"electronica", "programacion"} else M["wood"]
    box(f"ROOM_{room_id}__floor_inner", (x, y - .05, .30), (w - 2.0, d - 2.0, .05), floor_core, root, .08)
    # Long boards give the rooms scale and perspective. Technical rooms retain
    # a darker hard-wearing floor with sparse coloured service strips.
    board_count = max(7, int(d * 1.15))
    board_depth = (d - 2.10) / board_count
    for board_index in range(board_count):
        board_y = y - (d - 2.10) / 2 + (board_index + .5) * board_depth
        if room_id in {"electronica", "programacion"}:
            board_material = floor_mat if board_index % 4 == 0 else M["stone_dark"]
        else:
            board_material = M["wood_light"] if board_index % 3 == 0 else M["wood"]
        box(
            f"ROOM_{room_id}__floor_board_{board_index}",
            (x, board_y, .337),
            (w - 2.12, max(.08, board_depth - .055), .018),
            board_material,
            root,
            .015,
        )
    # A deliberate cutaway: exterior north/west walls remain architectural;
    # shared classroom partitions and the near eastern facade are knee walls.
    back_y = y + d / 2
    rear_height = 3.65 if room_id in {"matematica", "fisica", "direccion"} else .92
    side_x = x - w / 2 if x < -.5 else x + w / 2
    side_name = "left" if x < -.5 else "right"
    side_height = 3.65 if x < -.5 else 1.05
    rear_openings = sorted((door.center - door.width / 2, door.center + door.width / 2)
                           for door in DOORS if door.axis == "horizontal" and abs(door.coordinate - back_y) < .001
                           and room_id in (door.room_a, door.room_b))
    rear_segments, segment_start = [], x - w / 2
    for opening_start, opening_end in rear_openings:
        if opening_start > segment_start: rear_segments.append((segment_start, opening_start))
        segment_start = opening_end
    if segment_start < x + w / 2: rear_segments.append((segment_start, x + w / 2))
    for segment_index, (start, end) in enumerate(rear_segments):
        suffix = f"_{segment_index}" if rear_openings else ""
        box(f"ROOM_{room_id}__back_wall{suffix}", ((start + end) / 2, back_y, .24 + rear_height / 2), (end - start, .36, rear_height), M["cream"], root, .08)
        box(f"ROOM_{room_id}__back_wainscot{suffix}", ((start + end) / 2, back_y - .21, .69), (end - start - .10, .08, .86), M["wood"], root, .03)
        box(f"ROOM_{room_id}__back_cap{suffix}", ((start + end) / 2, back_y, .26 + rear_height), (end - start, .48, .13), M["stone"], root, .035)
    wall_accent = M["indigo"] if room_id in {"fisica", "programacion"} else M["green"] if room_id in {"matematica", "electronica"} else M["wood"]
    if rear_height > 2:
        box(f"ROOM_{room_id}__back_field", (x, back_y - .215, 2.42), (w - .86, .045, 2.48), wall_accent, root, .025)
    box(f"ROOM_{room_id}__{side_name}_wall", (side_x, y, .24 + side_height / 2), (.36, d, side_height), M["cream"], root, .08)
    box(f"ROOM_{room_id}__{side_name}_wainscot", (side_x + (.21 if x < 0 else -.21), y, .69), (.08, d - .55, .86), M["wood"], root, .035)
    box(f"ROOM_{room_id}__side_cap", (side_x, y, .26 + side_height), (.48, d, .13), M["stone"], root, .035)
    for segment_index, (x0, x1) in enumerate(exposed_front_segments(room_id)):
        box(f"ROOM_{room_id}__front_curb_{segment_index}", ((x0 + x1) / 2, y - d / 2, .38), (x1 - x0, .30, .36), M["stone"], root, .06)
    # Sparse piers show where the cut walls continue, without a crenellated lid.
    for pier_index, px in enumerate((x - w / 2, x + w / 2)):
        pier_height = 3.85 if rear_height > 2 else 2.5
        box(f"ROOM_{room_id}__rear_pier_{pier_index}", (px, back_y, .20 + pier_height / 2), (.48, .50, pier_height), M["stone"], root, .07)
        cylinder_between(f"ROOM_{room_id}__lamp_arm_{pier_index}", (px, back_y, min(3.25, pier_height - .12)), (px + (.42 if pier_index == 0 else -.42), back_y - .28, min(3.25, pier_height - .12)), .035, M["gold"], root, 7)
        sphere(f"ROOM_{room_id}__lamp_{pier_index}", (px + (.42 if pier_index == 0 else -.42), back_y - .28, min(3.25, pier_height - .12)), .13, M["lamp"], root, 10, 5)
    if room_id == "direccion":
        box(f"ROOM_{room_id}__left_wall", (x - w / 2, y, 1.1), (.36, d, 1.72), M["cream"], root, .07)
        for window_index, wx in enumerate((-w * .28, w * .28)):
            back_window(f"ROOM_{room_id}__window_{window_index}", x + wx, back_y - .24, 2.25, root, 1.2, 1.5)
    anchor = empty(f"ANCHOR_{room_id}", (x, y, .25), root)
    anchor["anchorType"] = "room-focus"
    return root


def add_roxana_statue(root, x, y):
    """Human-proportioned low-poly sculpture based on Roxana's four-view turnaround."""
    sy = y + .5
    statue = empty("HALL__roxana_statue", parent=root)
    statue["heroAsset"] = True
    statue["subject"] = "Roxana"
    statue["reference"] = "low-poly front-right-back-left turnaround v2"
    statue["artDirection"] = "faceted carved limestone, human proportions"

    stone = M["roxana_stone"]
    stone_dark = M["roxana_stone_dark"]
    stone_light = M["roxana_stone_light"]

    # Architectural pedestal copied from the reference's stepped proportions.
    box("HALL__roxana_pedestal_base", (x, sy, .47), (1.62, 1.30, .18), stone_dark, statue, .025)
    box("HALL__roxana_pedestal_step_low", (x, sy, .60), (1.48, 1.18, .10), stone, statue, .015)
    box("HALL__roxana_pedestal_plinth", (x, sy, .68), (1.34, 1.07, .08), stone_light, statue, .012)
    box("HALL__roxana_pedestal_body", (x, sy, 1.02), (1.16, .91, .60), stone, statue, .018)
    box("HALL__roxana_pedestal_neck", (x, sy, 1.36), (1.34, 1.06, .10), stone_dark, statue, .012)
    box("HALL__roxana_pedestal_cap", (x, sy, 1.45), (1.50, 1.18, .10), stone_light, statue, .015)
    box("HALL__roxana_pedestal_top", (x, sy, 1.53), (1.31, 1.02, .08), stone, statue, .012)
    box("HALL__roxana_pedestal_plaque", (x, sy - .472, 1.03), (.82, .025, .38), stone_dark, statue, .006)
    box("HALL__roxana_pedestal_plaque_inset", (x, sy - .491, 1.03), (.68, .012, .25), stone_light, statue, .004)

    # Dress: several offset rings create real triangular planes and fabric folds.
    faceted_form(
        "HALL__roxana_dress",
        (x, sy, 1.57),
        ((0, .55, .31, 0), (.16, .57, .32, .10), (.48, .49, .29, -.04),
         (.88, .39, .25, .09), (1.12, .30, .22, 0)),
        stone,
        statue,
        14,
    )
    # Shoes interrupt the hem just enough to read from the front view.
    ico_ellipsoid("HALL__roxana_shoe_left", (x - .22, sy - .245, 1.60), (.22, .19, .08), stone_dark, statue, 1)
    ico_ellipsoid("HALL__roxana_shoe_right", (x + .22, sy - .245, 1.60), (.22, .19, .08), stone_dark, statue, 1)

    # Fitted waist and shoulders form one continuous body rather than a capsule.
    faceted_form(
        "HALL__roxana_coat_body",
        (x, sy, 2.50),
        ((0, .30, .20, .04), (.24, .31, .21, -.04), (.50, .38, .225, .05),
         (.66, .43, .24, 0), (.76, .23, .18, .08)),
        stone,
        statue,
        12,
    )
    # Long split coat panels preserve the characteristic nineteenth-century silhouette.
    extruded_xz_polygon(
        "HALL__roxana_coat_tail_left",
        ((x - .31, 2.72), (x - .05, 2.67), (x - .08, 1.88), (x - .50, 1.96)),
        sy - .265,
        sy - .105,
        stone_light,
        statue,
    )
    extruded_xz_polygon(
        "HALL__roxana_coat_tail_right",
        ((x + .05, 2.67), (x + .31, 2.72), (x + .50, 1.96), (x + .08, 1.88)),
        sy - .265,
        sy - .105,
        stone_light,
        statue,
    )
    # Angular lapels and waistcoat details are intentionally readable at Hall distance.
    extruded_xz_polygon(
        "HALL__roxana_lapel_left",
        ((x - .34, 3.10), (x - .07, 3.18), (x - .14, 2.79), (x - .30, 2.72)),
        sy - .275,
        sy - .215,
        stone_light,
        statue,
    )
    extruded_xz_polygon(
        "HALL__roxana_lapel_right",
        ((x + .07, 3.18), (x + .34, 3.10), (x + .30, 2.72), (x + .14, 2.79)),
        sy - .275,
        sy - .215,
        stone_light,
        statue,
    )
    for index in range(4):
        ico_ellipsoid(f"HALL__roxana_button_{index}", (x, sy - .275, 2.96 - index * .14), (.032, .022, .032), stone_dark, statue, 1)
    ico_ellipsoid("HALL__roxana_bow_center", (x, sy - .278, 3.17), (.065, .035, .055), stone_dark, statue, 1)
    ico_ellipsoid("HALL__roxana_bow_left", (x - .095, sy - .265, 3.17), (.11, .038, .07), stone_light, statue, 1)
    ico_ellipsoid("HALL__roxana_bow_right", (x + .095, sy - .265, 3.17), (.11, .038, .07), stone_light, statue, 1)

    # Bent book arm and relaxed right arm, tapered at elbow and wrist.
    faceted_limb("HALL__roxana_arm_book_upper", (x - .35, sy, 3.07), (x - .49, sy - .07, 2.76), .135, .115, stone, statue)
    faceted_limb("HALL__roxana_arm_book_lower", (x - .49, sy - .07, 2.76), (x - .27, sy - .29, 2.69), .115, .082, stone, statue)
    faceted_limb("HALL__roxana_arm_relaxed_upper", (x + .35, sy, 3.07), (x + .45, sy - .01, 2.72), .135, .105, stone, statue)
    faceted_limb("HALL__roxana_arm_relaxed_lower", (x + .45, sy - .01, 2.72), (x + .48, sy - .09, 2.39), .105, .075, stone, statue)
    ico_ellipsoid("HALL__roxana_hand_book", (x - .25, sy - .34, 2.68), (.09, .065, .13), stone_light, statue, 1)
    ico_ellipsoid("HALL__roxana_hand_relaxed", (x + .49, sy - .10, 2.29), (.085, .065, .14), stone_light, statue, 1)
    for finger in range(3):
        faceted_limb(
            f"HALL__roxana_relaxed_finger_{finger}",
            (x + .455 + finger * .028, sy - .155, 2.33),
            (x + .46 + finger * .028, sy - .17, 2.18),
            .018,
            .012,
            stone_light,
            statue,
            6,
        )
    book = box("HALL__roxana_book", (x - .31, sy - .29, 2.84), (.46, .11, .60), stone_dark, statue, .008)
    book.rotation_euler[1] = math.radians(-11)
    pages = box("HALL__roxana_book_pages", (x - .31, sy - .352, 2.84), (.39, .018, .52), stone_light, statue, .003)
    pages.rotation_euler[1] = math.radians(-11)

    # Portrait: an icosphere head plus carved facial planes and layered hair masses.
    faceted_form("HALL__roxana_neck", (x, sy, 3.18), ((0, .105, .095, 0), (.23, .13, .11, .18)), stone, statue, 8)
    ico_ellipsoid("HALL__roxana_head", (x, sy - .035, 3.47), (.245, .205, .32), stone_light, statue, 2)
    ico_ellipsoid("HALL__roxana_hair_back", (x, sy + .105, 3.42), (.335, .245, .49), stone_dark, statue, 2)
    # The face projects in front of the hair and remains angular rather than mask-like.
    ico_ellipsoid("HALL__roxana_face_plane", (x, sy - .205, 3.47), (.205, .075, .275), stone_light, statue, 2)
    extruded_xz_polygon(
        "HALL__roxana_nose",
        ((x - .035, 3.54), (x + .035, 3.54), (x + .028, 3.39), (x - .025, 3.39)),
        sy - .315,
        sy - .235,
        stone,
        statue,
    )
    for side in (-1, 1):
        extruded_xz_polygon(
            f"HALL__roxana_brow_{side}",
            ((x + side * .055, 3.575), (x + side * .145, 3.59),
             (x + side * .145, 3.555), (x + side * .055, 3.55)),
            sy - .286,
            sy - .245,
            stone_dark,
            statue,
        )
        ico_ellipsoid(f"HALL__roxana_eye_{side}", (x + side * .095, sy - .285, 3.535), (.026, .013, .016), stone_dark, statue, 1)
    box("HALL__roxana_mouth", (x, sy - .287, 3.365), (.105, .014, .018), stone_dark, statue, .002)

    # Layered, tapered locks reproduce the long wavy silhouette in all four views.
    hair_paths = (
        (-.24, -.01, 3.66, -.34, .04, 3.12, .11),
        (-.14, .10, 3.74, -.24, .17, 3.05, .10),
        (-.05, .14, 3.76, -.09, .22, 3.00, .09),
        (.05, .14, 3.76, .09, .22, 3.00, .09),
        (.14, .10, 3.74, .24, .17, 3.05, .10),
        (.24, -.01, 3.66, .34, .04, 3.12, .11),
    )
    for index, (sx, fy, sz, ex, by, ez, radius) in enumerate(hair_paths):
        midpoint = ((sx + ex) * .5, (fy + by) * .5 + .025 * (-1 if index % 2 else 1), (sz + ez) * .5)
        faceted_limb(
            f"HALL__roxana_hair_lock_{index}_upper",
            (x + sx, sy + fy, sz),
            (x + midpoint[0], sy + midpoint[1], midpoint[2]),
            radius * 1.12,
            radius,
            stone_dark,
            statue,
            7,
        )
        faceted_limb(
            f"HALL__roxana_hair_lock_{index}_lower",
            (x + midpoint[0], sy + midpoint[1], midpoint[2]),
            (x + ex, sy + by, ez),
            radius,
            radius * .46,
            stone_dark,
            statue,
            7,
        )
    return statue


def add_hall(root, center):
    x, y = center
    hall_plan = PRIMARY_BY_ID["hall"]
    # Layered octagonal medallion is the visual anchor of the entire school.
    polygon_prism("HALL__carpet_outer", (x, y - .1, .34), 7.30, 5.65, .10, M["wine"], root, 8)
    polygon_prism("HALL__carpet_gold", (x, y - .1, .41), 6.15, 4.72, .08, M["gold"], root, 8)
    polygon_prism("HALL__carpet_inner", (x, y - .1, .47), 5.58, 4.25, .08, M["wine"], root, 8)
    polygon_prism("HALL__seal", (x, y, .54), 2.45, 1.94, .14, M["wood"], root, 8)
    polygon_prism("HALL__seal_inner", (x, y, .64), 1.98, 1.57, .08, M["gold"], root, 8)
    # Basamento arquitectónico independiente del GLB: hace que el monumento
    # pertenezca al edificio y establece la primera capa de la jerarquía visual.
    monument_y = y + .5
    polygon_prism("HALL__monument_dais_base", (x, monument_y, .75), 1.65, 1.30, .22, M["stone_dark"], root, 8)
    polygon_prism("HALL__monument_dais_cap", (x, monument_y, .89), 1.48, 1.13, .10, M["cream"], root, 8)

    # The Hall owns its complete east/west boundaries. Each side is one exact
    # 22 m wall shared by three adjacent rooms; no wing emits a second wall on
    # the same coordinate.
    for side in (-1, 1):
        wall_x = hall_plan.x0 if side < 0 else hall_plan.x1
        for segment_index, (start, end) in enumerate(((-12, -9.25), (-6.75, -5.8), (-2.8, -.45), (5.2, 6.3), (8.1, 10))):
            box(f"HALL__gallery_wall_{side}_{segment_index}", (wall_x, (start + end) / 2, .58), (.36, end - start, .50), M["wood"], root, .055)
        # Direct 1.8 m passage to each rear classroom, clear of the archive at y8.78.
        for post_index, post_y in enumerate((6.20, 8.20)):
            box(f"HALL__rear_classroom_post_{side}_{post_index}", (wall_x, post_y, 1.50), (.40, .20, 2.40), M["stone"], root, .04)
        box(f"HALL__rear_classroom_lintel_{side}", (wall_x, 7.2, 2.82), (.44, 2.20, .24), M["cream"], root, .04)
        box(f"HALL__rear_classroom_threshold_{side}", (wall_x, 7.2, .272), (2.20, 1.80, .15), M["wood_light"], root, .025)
        side_arch(
            f"HALL__classroom_arch_{side}",
            wall_x,
            1.0,
            .30,
            side,
            root,
            M["teal"] if side < 0 else M["cyan"],
        )
        side_arch(
            f"HALL__service_arch_{side}",
            wall_x,
            -8.0,
            .30,
            side,
            root,
            M["green"] if side < 0 else M["coral"],
        )
        for sconce_index, sconce_y in enumerate((-6.1, 5.9)):
            box(f"HALL__gallery_pier_{side}_{sconce_index}", (wall_x, sconce_y, 1.99), (.42, .44, 3.35), M["wood"], root, .07)
            wall_sconce_side(
                f"HALL__sconce_{side}_{sconce_index}",
                wall_x - side * .31,
                sconce_y,
                3.42,
                side,
                root,
            )

    # Escalera institucional: más angosta que el medallón, contrahuella baja y
    # losas finas. Sigue marcando el eje sin competir con el monumento.
    stair_start = y + 4.15
    step_count = 8
    step_run = .50
    step_rise = .14
    for index in range(step_count):
        step_y = stair_start + index * step_run
        step_z = .41 + index * step_rise
        # 7,4→6,98 u / 1,744 u por NPC = 4,24→4,00 NPC de ancho útil.
        step_width = 8.65 - index * .07
        box(f"HALL__step_support_{index}", (x, step_y, (.30 + step_z) / 2), (step_width, .50, step_z - .30), M["wood"], root, .025)
        box(f"HALL__step_{index}", (x, step_y, step_z), (step_width, .60, .14), M["wood_light"], root, .045)
    landing_start = stair_start + (step_count - 1) * step_run + .25
    landing_end = HALL_LANDING_NORTH
    landing_y = (landing_start + landing_end) / 2
    landing_z = .41 + (step_count - 1) * step_rise
    box("HALL__landing_support", (x, landing_y, (.30 + landing_z) / 2), (8.15, landing_end - landing_start, landing_z - .30), M["wood"], root, .03)
    box("HALL__upper_landing", (x, landing_y, landing_z), (8.15, landing_end - landing_start, .16), M["wood_light"], root, .04)
    for side in (-1, 1):
        rail_x = x + side * 3.98
        post_count = 7
        rail_height = 1.05  # 0,60 NPC adulto del hall.
        rail_start_z = .41 + .07 + rail_height
        rail_end_z = rail_start_z + (step_count - 1) * step_rise
        for post_index in range(post_count):
            progress = post_index / (post_count - 1)
            post_y = stair_start + progress * (step_count - 1) * step_run
            step_surface = .41 + progress * (step_count - 1) * step_rise + .07
            post_z = step_surface + rail_height / 2
            box(f"HALL__stair_post_{side}_{post_index}", (rail_x, post_y, post_z), (.14, .14, rail_height), M["wood"], root, .035)
        cylinder_between(
            f"HALL__stair_rail_{side}",
            (rail_x, stair_start, rail_start_z),
            (rail_x, stair_start + (step_count - 1) * step_run, rail_end_z),
            .075,
            M["wood_light"],
            root,
            10,
        )

    # Interior north facade: the stair now arrives at an actual threshold
    # instead of ending in an open patch of lawn before the clock house.
    north_y = hall_plan.y1
    for side in (-1, 1):
        segment_x = x + side * 5.10
        box(f"HALL__north_wall_{side}", (segment_x, north_y, 2.80), (6.20, .52, 5.10), M["wood"], root, .12)
        box(f"HALL__north_wainscot_{side}", (segment_x, north_y - .29, 1.15), (5.76, .10, 1.65), M["wood_light"], root, .05)
        back_window(f"HALL__north_window_{side}", segment_x, north_y - .31, 3.18, root, 1.58, 1.82)
        bookshelf(f"HALL__north_archive_{side}", x + side * 7.75, north_y - 1.22, .32, root, 2.15, 2.72)
    for side in (-1, 1):
        post_x = x + side * 2.02
        box(f"HALL__north_door_post_{side}", (post_x, north_y, 2.35), (.62, .76, 4.25), M["stone"], root, .10)
        box(f"HALL__north_door_lamp_arm_{side}", (post_x - side * .42, north_y - .42, 3.10), (.58, .12, .12), M["gold"], root, .03)
        sphere(f"HALL__north_door_lamp_{side}", (post_x - side * .72, north_y - .46, 3.10), .18, M["lamp"], root, 10, 5)
    box("HALL__north_door_lintel", (x, north_y, 4.43), (4.65, .82, .62), M["stone"], root, .10)
    box("HALL__north_door_recess", (x, north_y + .06, 2.32), (3.45, .18, 3.65), M["black"], root, .04)

    add_roxana_statue(root, x, y)

    # The entrance belongs to the Hall. The previous plan put a complete room
    # in front of this axis, which severed the visual route from gate to statue.
    entry_y = hall_plan.y0 + .65
    for step_index, (step_y, width, z) in enumerate((
        (entry_y - 1.00, 6.8, .28),
        (entry_y - .62, 5.9, .40),
        (entry_y - .28, 5.1, .52),
    )):
        box(f"HALL__entry_step_{step_index}", (x, step_y, z), (width, .72, .20), M["stone"], root, .07)
    box("HALL__entry_door_recess", (x, entry_y, 1.92), (3.35, .42, 3.35), M["black"], root, .06)
    box("HALL__entry_door", (x, entry_y - .24, 1.82), (2.65, .12, 2.95), M["wood"], root, .05)
    box("HALL__entry_door_split", (x, entry_y - .32, 1.82), (.10, .06, 2.72), M["wood_light"], root, .02)
    for panel_x in (-.66, .66):
        for panel_z in (1.22, 2.28):
            box(
                f"HALL__entry_panel_{panel_x}_{panel_z}",
                (x + panel_x, entry_y - .33, panel_z),
                (.88, .05, .70),
                M["wood_light"],
                root,
                .03,
            )
    for side in (-1, 1):
        pier_x = x + side * 2.10
        box(f"HALL__entry_pier_{side}", (pier_x, entry_y, 2.25), (.82, .88, 4.25), M["stone"], root, .10)
        box(f"HALL__entry_pier_cap_{side}", (pier_x, entry_y, 4.48), (1.08, 1.06, .30), M["cream"], root, .07)
        wall_sconce_side(
            f"HALL__entry_sconce_{side}",
            pier_x - side * .46,
            entry_y - .48,
            3.02,
            side,
            root,
        )
    box("HALL__entry_lintel", (x, entry_y, 4.02), (4.65, .95, .62), M["stone"], root, .10)
    box("HALL__entry_banner", (x, entry_y - .52, 4.05), (1.18, .08, 1.12), M["wine"], root, .04)
    polygon_prism("HALL__entry_seal", (x, entry_y - .58, 4.08), .30, .30, .05, M["gold"], root, 8, 0).rotation_euler[0] = math.radians(90)

    # Small narrative residue at the founder's feet.
    cylinder("HALL__roxana_dry_flower_stem", (x + .62, y - .18, 1.07), .025, .56, M["green"], root, 7)
    cone("HALL__roxana_dry_flower", (x + .62, y - .18, 1.38), .10, .02, .18, M["wine"], root, 7)

    # South-west: first-day clues. South-east: the working preceptor station.
    noticeboard("HALL__noticeboard_ingresantes", x - 7.65, y - 4.62, .32, root, 2.45, 1.38)
    side_bench("HALL__bench_west", x - 9.05, y - 2.95, .30, root, 2.15)
    side_bench("HALL__bench_east", x + 9.05, y - 2.95, .30, root, 2.15)
    desk("HALL__preceptor_desk", x + 7.35, y - 4.35, .30, root, 2.65, 1.12, False)
    chair("HALL__preceptor_chair", x + 7.35, y - 3.40, .30, root, M["green"])
    box("HALL__register_open", (x + 6.95, y - 4.63, 1.33), (.74, .48, .07), M["paper"], root, .025)
    box("HALL__paper_stack", (x + 7.72, y - 4.53, 1.36), (.48, .38, .13), M["paper"], root, .025)
    jointed_lamp("HALL__preceptor_lamp", x + 8.05, y - 4.28, 1.27, root)
    box("HALL__key_board", (x + 9.55, y - 4.00, 1.75), (.12, 1.45, 1.08), M["wood"], root, .04)
    for key_index in range(5):
        cylinder_between(
            f"HALL__key_{key_index}",
            (x + 9.45, y - 4.50 + key_index * .24, 1.92),
            (x + 9.32, y - 4.50 + key_index * .24, 1.75),
            .025,
            M["gold"],
            root,
            6,
        )

    # The cabinet is part of the architecture from the beginning; the learned
    # resistor and its recovery lamp are separate state roots. This makes the
    # progression physically credible instead of spawning a prize on the floor.
    display_case_side("HALL__relic_vitrine", x - 9.42, y + .88, .32, root)
    relic = empty("HALL__progress_relic", parent=root)
    relic["progressState"] = "electronics-arc-1-complete"
    relic["interactiveId"] = "reliquia"
    relic_y = y + .88
    relic_z = 1.72
    cylinder_between(
        "HALL__progress_relic__lead_left",
        (x - 9.58, relic_y - .43, relic_z),
        (x - 9.58, relic_y - .12, relic_z),
        .025,
        M["copper"],
        relic,
        7,
    )
    cylinder_between(
        "HALL__progress_relic__lead_right",
        (x - 9.58, relic_y + .12, relic_z),
        (x - 9.58, relic_y + .43, relic_z),
        .025,
        M["copper"],
        relic,
        7,
    )
    resistor = cylinder(
        "HALL__progress_relic__body",
        (x - 9.58, relic_y, relic_z),
        .13,
        .34,
        M["paper"],
        relic,
        14,
    )
    resistor.rotation_euler[0] = math.radians(90)
    for band_index, (band_y, band_material) in enumerate((
        (relic_y - .10, M["wine"]),
        (relic_y - .025, M["gold"]),
        (relic_y + .055, M["coral"]),
    )):
        band = cylinder(
            f"HALL__progress_relic__band_{band_index}",
            (x - 9.58, band_y, relic_z),
            .137,
            .035,
            band_material,
            relic,
            14,
        )
        band.rotation_euler[0] = math.radians(90)

    box("HALL__recovery_lamp_mount", (x - 9.69, y + .88, 2.56), (.12, .48, .55), M["wood"], root, .04)
    recovery_lamp = empty("HALL__progress_lamp", parent=root)
    recovery_lamp["progressState"] = "electronics-arc-1-complete"
    box("HALL__progress_lamp__arm", (x - 9.52, y + .88, 2.61), (.30, .08, .08), M["copper"], recovery_lamp, .025)
    sphere("HALL__progress_lamp__glow", (x - 9.34, y + .88, 2.60), .19, M["lamp"], recovery_lamp, 12, 6)

    for plant_index, (px, py) in enumerate((
        (x - 8.72, y - 4.25),
        (x + 8.72, y - 4.25),
        (x - 8.72, y + 4.55),
        (x + 8.72, y + 4.55),
    )):
        plant(f"HALL__plant_{plant_index}", px, py, .32, root, .78)
    person("NPC_student_hall_1", x - 3.45, y - 2.55, .52, root, M["blue"], M["skin3"], scale=.80, adult=True)
    person("NPC_student_hall_2", x + 2.75, y - 2.45, .52, root, M["pink"], M["skin1"], scale=.80, adult=True)


def add_classroom(root, center, programming=False, physics=False, math_room=False):
    x, y = center
    board_mat = M["screen"] if programming else M["chalk"]
    box("CLASS__board_frame", (x, y + 3.70, 2.15), (5.3, .20, 2.1), M["wood"], root, .08)
    box("CLASS__board", (x, y + 3.56, 2.15), (4.85, .06, 1.68), board_mat, root, .02)
    for side in (-1, 1):
        box(f"CLASS__board_support_{side}", (x + side * 2.42, y + 3.70, .94), (.12, .18, 1.22), M["wood"], root, .03)
    if programming:
        for row in range(2):
            for col in range(2):
                dx = (col - .5) * 3.0
                dy = -1.5 + row * 2.1
                desk(f"PROGRAM__desk_{row}_{col}", x + dx, y + dy, .24, root, 2.25, 1.05, True)
                chair(f"PROGRAM__chair_{row}_{col}", x + dx, y + dy - .95, .35, root, M["teal"])
        # Screen wall and server towers create the cool, dense visual block on
        # the right side of the reference.
        for col in range(5):
            sx = x - 3.2 + col * 1.6
            box(f"PROGRAM__wall_screen_frame_{col}", (sx, y + 3.43, 2.32), (1.28, .10, .92), M["black"], root, .04)
            box(f"PROGRAM__wall_screen_{col}", (sx, y + 3.35, 2.32), (1.10, .03, .74), M["screen"], root, .02)
        for side in (-1, 1):
            box(f"PROGRAM__server_{side}", (x + side * 4.35, y + 2.05, 1.55), (1.0, 1.25, 2.55), M["black"], root, .08)
            for led in range(4):
                box(f"PROGRAM__server_led_{side}_{led}", (x + side * 4.35, y + 1.38, .78 + led * .48), (.55, .03, .09), M["screen"], root, .01)
    else:
        for row in range(1):
            desk(f"CLASS__desk_{row}", x, y - 1.7 + row * 2.1, .24, root, 5.2, .88, False)
            for col in (-1.6, 0, 1.6):
                chair(f"CLASS__chair_{row}_{col}", x + col, y - 2.60 + row * 2.1, .35, root, M["indigo"] if physics else M["amber"])
    if physics:
        desk("PHYSICS__demonstration_bench", x, y + 1.9, .24, root, 7.2, 1.9)
        extruded_xz_polygon("PHYSICS__ramp", ((x - 2.9, 1.26), (x + 1.0, 1.26), (x + 1.0, 1.85)), y + .98, y + 1.58, M["wood_light"], root)
        sphere("PHYSICS__ramp_ball", (x + .1, y + 1.28, 1.90), .19, M["gold"], root, 16, 10)
        for side in (-1, 1):
            cylinder_between(f"PHYSICS__frame_post_{side}", (x + side * 3.05, y + 2.5, 1.25), (x + side * 3.05, y + 2.5, 2.65), .07, M["gold"], root, 10)
        cylinder_between("PHYSICS__frame_beam", (x - 3.10, y + 2.5, 2.65), (x + 3.10, y + 2.5, 2.65), .07, M["gold"], root, 10)
        for index in range(4):
            px = x - 2.25 + index * 1.5
            cylinder_between(f"PHYSICS__pendulum_{index}", (px, y + 2.5, 2.60), (px + .18, y + 2.5, 1.54), .022, M["paper"], root, 7)
            sphere(f"PHYSICS__orb_{index}", (px + .18, y + 2.5, 1.54), .20, M["teal"], root, 14, 8)
    if math_room:
        desk("MATH__display_table", x, y + 1.90, .24, root, 6.6, 1.85)
        cylinder_between("MATH__balance_post", (x - 1.65, y + 1.90, 1.25), (x - 1.65, y + 1.90, 2.75), .07, M["gold"], root, 10)
        cylinder_between("MATH__balance_beam", (x - 2.85, y + 1.90, 2.69), (x - .45, y + 1.90, 2.69), .055, M["gold"], root, 10)
        for side in (-1, 1):
            px = x - 1.65 + side * .93
            cylinder_between(f"MATH__balance_chain_{side}", (px, y + 1.90, 2.66), (px, y + 1.90, 1.79), .019, M["paper"], root, 6)
            cylinder(f"MATH__balance_pan_{side}", (px, y + 1.90, 1.77), .38, .065, M["gold"], root, 16)
            box(f"MATH__balance_weight_{side}", (px, y + 1.90, 1.93), (.28, .28, .25), M["wood"], root, .025)
        for index, height in enumerate((1.02, 1.35)):
            cylinder(f"MATH__geometry_{index}", (x + 1.1 + index * 1.3, y + 1.90, 1.25 + height / 2), .47, height, M["teal"] if index == 0 else M["gold"], root, 3 + index)
    person("NPC_teacher", x + (3.55 if programming else 4.35), y + (-.1 if programming else 2.0), .35, root, M["wine"], M["skin2"], scale=.88)
    person("NPC_student", x - 4.35, y - 1.25, .35, root, M["blue"], M["skin3"], scale=.82)


def add_library(root, center):
    x, y = center
    for dx in (-3.1, 0, 3.1):
        bookshelf(f"LIBRARY__shelf_{dx}", x + dx, y + 3.62, .24, root, 2.55, 2.75)
    desk("LIBRARY__table", x, y - .6, .24, root, 4.8, 1.45)
    for dx in (-1.55, 1.55):
        chair(f"LIBRARY__chair_{dx}", x + dx, y - 1.6, .24, root, M["green"])
    plant("LIBRARY__plant", x - 4.1, y - 2.6, .24, root, 1.1)
    person("NPC_librarian", x + 3.1, y + 1.1, .24, root, M["green"], M["skin1"])


def add_office(root, center):
    x, y = center
    back_y = y + 3.15

    # Raised clock house: the main vertical landmark from the reference.
    box("OFFICE__tower_support", (x, back_y + .02, 4.20), (6.65, .76, .84), M["wood"], root, .08)
    box("OFFICE__tower", (x, back_y + .02, 6.18), (6.5, .72, 3.25), M["wood"], root, .14)
    box("OFFICE__tower_cap", (x, back_y + .02, 7.96), (7.35, 1.02, .42), M["stone"], root, .08)
    for cap_index in range(7):
        box(
            f"OFFICE__tower_block_{cap_index}",
            (x - 2.9 + cap_index * .97, back_y + .02, 8.28 + (.16 if cap_index in (0, 6) else 0)),
            (.82, 1.02, .45),
            M["cream"] if cap_index % 2 else M["stone"],
            root,
            .06,
        )
    clock = polygon_prism("OFFICE__clock_face", (x, back_y - .58, 6.83), 1.30, 1.30, .16, M["paper"], root, 32, 0)
    clock.rotation_euler[0] = math.radians(90)
    rim = polygon_prism("OFFICE__clock_rim", (x, back_y - .42, 6.83), 1.50, 1.50, .16, M["gold"], root, 32, 0)
    rim.rotation_euler[0] = math.radians(90)
    for tick_index in range(12):
        angle = math.tau * tick_index / 12
        tick = box(
            f"OFFICE__clock_tick_{tick_index}",
            (x + math.sin(angle) * 1.02, back_y - .67, 6.83 + math.cos(angle) * 1.02),
            (.10, .08, .28),
            M["wood"],
            root,
            .02,
        )
        tick.rotation_euler[1] = angle
    cylinder_between("OFFICE__clock_hour", (x, back_y - .72, 6.83), (x - .43, back_y - .72, 7.24), .065, M["wood"], root, 8)
    cylinder_between("OFFICE__clock_minute", (x, back_y - .74, 6.83), (x + .12, back_y - .74, 7.60), .045, M["wood"], root, 8)

    # Deep doorway and banners make the facade read as an institutional hub.
    box("OFFICE__door_frame", (x, back_y - .34, 2.26), (2.55, .30, 3.75), M["stone"], root, .10)
    box("OFFICE__door", (x, back_y - .53, 2.12), (1.95, .12, 3.25), M["wood"], root, .08)
    for side in (-1, 1):
        box(f"OFFICE__banner_{side}", (x + side * 2.75, back_y - .49, 3.02), (1.05, .08, 2.30), M["wine"], root, .05)
        polygon_prism(f"OFFICE__banner_seal_{side}", (x + side * 2.75, back_y - .57, 3.10), .28, .28, .06, M["gold"], root, 8, 0)

    # The office remains explorable behind the monumental front.
    bookshelf("OFFICE__archive", x - 3.6, y + 2.8, .24, root, 2.2, 2.9)
    desk("OFFICE__desk", x, y - .3, .24, root, 4.0, 1.4, False)
    chair("OFFICE__chair", x, y + .8, .35, root, M["wine"], rotation=0)
    box("OFFICE__rug", (x, y - .6, .29), (5.8, 3.7, .06), M["wine"], root, .18)
    plant("OFFICE__plant", x + 3.8, y + 2.3, .24, root, 1.05)


def add_audiovisual(root, center):
    x, y = center
    box("AV__screen_frame", (x, y + 3.70, 2.0), (5.8, .2, 2.5), M["black"], root, .08)
    box("AV__screen", (x, y + 3.55, 2.0), (5.4, .05, 2.1), M["screen"], root, .02)
    for row in range(3):
        for col in (-1.7, 0, 1.7):
            chair(f"AV__seat_{row}_{col}", x + col, y - 2.5 + row * 1.35, .24 + row * .15, root, M["violet"])
    cylinder("AV__projector", (x, y - 3.1, 2.4), .34, .75, M["stone_dark"], root, 12)


def add_electronics(root, center):
    x, y = center
    # Back wall: a real school board first, then the dormant infrastructure.
    box("ELECTRO__board_frame", (x - 2.10, y + 3.62, 2.28), (4.75, .18, 1.88), M["wood"], root, .06)
    board = box("ELECTRO__board", (x - 2.10, y + 3.50, 2.28), (4.42, .05, 1.58), M["chalk"], root, .015)
    board["interactiveId"] = "pizarron"
    for side in (-1, 1):
        box(f"ELECTRO__board_support_{side}", (x - 2.10 + side * 2.18, y + 3.62, .96), (.12, .18, 1.28), M["wood"], root, .025)
    # Baseline diagram: sparse geometry, large enough to survive the overview.
    diagram_y = y + 3.465
    for line_index, (line_x, line_z, line_w) in enumerate((
        (x - 2.75, 2.50, 1.08),
        (x - 1.40, 2.50, .72),
        (x - 2.10, 1.98, 2.38),
    )):
        box(
            f"ELECTRO__board_line_{line_index}",
            (line_x, diagram_y, line_z),
            (line_w, .018, .035),
            M["paper"],
            root,
            .008,
        )
    for plate_index, plate_x in enumerate((x - 3.30, x - .90)):
        box(
            f"ELECTRO__board_terminal_{plate_index}",
            (plate_x, diagram_y - .003, 2.24),
            (.055, .022, .54),
            M["paper"],
            root,
            .008,
        )
    box("ELECTRO__screen_case", (x - 2.10, y + 3.34, 3.35), (4.90, .28, .20), M["paper"], root, .05)
    cylinder("ELECTRO__screen_roll", (x - 2.10, y + 3.20, 3.35), .09, 4.58, M["stone"], root, 12).rotation_euler[1] = math.radians(90)

    # Copper service network: long runs, drops and junctions. It frames the
    # board and portal without becoming glowing fantasy plumbing.
    pipe_y = y + 3.25
    cylinder_between("ELECTRO__pipe_top", (x - 5.15, pipe_y, 3.78), (x + 5.15, pipe_y, 3.78), .075, M["copper"], root, 8)
    for index, px in enumerate((-4.75, .45, 4.75)):
        cylinder_between(
            f"ELECTRO__pipe_drop_{index}",
            (x + px, pipe_y, 3.78),
            (x + px, pipe_y, 2.84 if index != 2 else 2.18),
            .075,
            M["copper"],
            root,
            8,
        )
        sphere(f"ELECTRO__pipe_joint_{index}", (x + px, pipe_y, 3.78), .14, M["copper"], root, 8, 4)

    for index, px in enumerate((-4.72, .50, 4.78)):
        box(f"ELECTRO__status_frame_{index}", (x + px, y + 3.38, 3.10), (1.02, .12, .60), M["black"], root, .04)
        box(f"ELECTRO__status_{index}", (x + px, y + 3.30, 3.10), (.82, .03, .38), M["teal"], root, .015)
        for led in range(3):
            sphere(f"ELECTRO__status_led_{index}_{led}", (x + px - .25 + led * .25, y + 3.27, 2.99), .035, M["screen"], root, 8, 4)

    # Instructor diagnostics bench under the board.
    desk("ELECTRO__instructor_bench", x - 2.15, y + 2.08, .24, root, 3.90, .88, False)
    for index, px in enumerate((-3.35, -2.15, -.95)):
        lab_instrument(
            f"ELECTRO__diagnostic_{index}",
            x + px,
            y + 1.96,
            1.23,
            root,
            M["stone_dark"],
            active=False,
        )

    # West wall storage keeps visual density at the edge and the centre clear.
    component_cabinet_side("ELECTRO__cabinet_front", x - 5.62, y - 1.92, .30, root, 2.35)
    component_cabinet_side("ELECTRO__cabinet_back", x - 5.62, y + 1.05, .30, root, 2.35)
    box("ELECTRO__toolboard", (x - 5.82, y + 3.00, 2.02), (.08, 1.62, 1.35), M["green"], root, .03)
    for tool_index in range(4):
        cylinder_between(
            f"ELECTRO__wall_tool_{tool_index}",
            (x - 5.88, y + 2.45 + tool_index * .34, 1.65),
            (x - 5.88, y + 2.45 + tool_index * .34, 2.28),
            .035,
            M["paper"] if tool_index % 2 else M["gold"],
            root,
            7,
        )

    # Two long benches shifted west: the east corridor remains open from Hall
    # to the portal. Each station has a distinct silhouette, not generic coils.
    bench_x = x - 1.05
    bench_ys = (y - 1.82, y + .25)
    station_xs = (x - 3.30, x - 1.78, x - .26, x + 1.26)
    for row, bench_y in enumerate(bench_ys):
        bench = desk(f"ELECTRO__bench_{row}", bench_x, bench_y, .24, root, 6.65, 1.02, False)
        bench["interactiveId"] = "mesa"
        bench["workbenchIndex"] = row + 1
        for col, station_x in enumerate(station_xs):
            if row == 0:
                instrument = lab_instrument(
                    f"ELECTRO__oscilloscope_{row}_{col}",
                    station_x,
                    bench_y - .03,
                    1.23,
                    root,
                    M["stone_dark"],
                    active=False,
                )
                instrument["interactiveId"] = "instrumento"
            else:
                box(
                    f"ELECTRO__training_pcb_{row}_{col}",
                    (station_x, bench_y - .08, 1.25),
                    (.72, .48, .08),
                    M["green"],
                    root,
                    .025,
                )
                for component in range(3):
                    cylinder(
                        f"ELECTRO__pcb_component_{row}_{col}_{component}",
                        (station_x - .22 + component * .22, bench_y - .08, 1.34),
                        .055,
                        .16,
                        M["gold"] if component % 2 else M["coral"],
                        root,
                        8,
                    )
        for lamp_index, lamp_x in enumerate((x - 3.62, x + .95)):
            jointed_lamp(f"ELECTRO__bench_lamp_{row}_{lamp_index}", lamp_x, bench_y + .24, 1.22, root)

    for stool_row, stool_y in enumerate((y - 2.68, y + 1.10)):
        for stool_index, stool_x in enumerate(station_xs):
            lab_stool(f"ELECTRO__stool_{stool_row}_{stool_index}", stool_x, stool_y, .26, root, M["teal"])

    # Component jars, wire rack and hand tools fill the mounting bench without
    # turning the playable aisle into visual noise.
    for jar_index, jar_x in enumerate((x - 3.68, x - 3.20, x - 2.72, x - 2.24)):
        cylinder(f"ELECTRO__resistor_jar_{jar_index}", (jar_x, y + .17, 1.52), .15, .52, M["glass"], root, 12)
        sphere(f"ELECTRO__resistor_jar_lid_{jar_index}", (jar_x, y + .17, 1.81), .16, M["gold"], root, 10, 5)
    box("ELECTRO__wire_rack_top", (x - 5.20, y - .02, 2.98), (.18, 1.62, .14), M["stone_dark"], root, .03)
    for spool_index in range(4):
        spool_y = y - .58 + spool_index * .38
        reel = cylinder(f"ELECTRO__wire_spool_{spool_index}", (x - 5.05, spool_y, 2.55), .23, .18, M["copper"] if spool_index % 2 else M["teal"], root, 12)
        reel.rotation_euler[1] = math.radians(90)

    # Arc-1 board replaces the baseline linework with one unambiguous Ohm-law
    # circuit. It is a detachable overlay, not text baked into the room shell.
    progress_board = empty("ELECTRO__progress_board", parent=root)
    progress_board["progressState"] = "electronics-arc-1-complete"
    progress_board["interactiveId"] = "pizarron"
    box(
        "ELECTRO__progress_board__field",
        (x - 2.10, y + 3.455, 2.28),
        (4.30, .018, 1.48),
        M["chalk"],
        progress_board,
        .01,
    )
    circuit_y = y + 3.435
    circuit_points = (
        (x - 3.45, 2.03),
        (x - 3.45, 2.55),
        (x - 2.72, 2.55),
        (x - 2.56, 2.68),
        (x - 2.40, 2.42),
        (x - 2.24, 2.68),
        (x - 2.08, 2.42),
        (x - 1.92, 2.68),
        (x - 1.76, 2.55),
        (x - .78, 2.55),
        (x - .78, 2.03),
        (x - 3.45, 2.03),
    )
    for segment_index in range(len(circuit_points) - 1):
        ax, az = circuit_points[segment_index]
        bx, bz = circuit_points[segment_index + 1]
        cylinder_between(
            f"ELECTRO__progress_board__circuit_{segment_index}",
            (ax, circuit_y, az),
            (bx, circuit_y, bz),
            .022,
            M["paper"],
            progress_board,
            6,
        )
    # Battery plates and a large V/I/R triad made from straight strokes. Their
    # simple shapes remain readable and avoid pseudo-text generated in a bake.
    box("ELECTRO__progress_board__battery_long", (x - 3.61, circuit_y, 2.25), (.035, .025, .38), M["paper"], progress_board, .006)
    box("ELECTRO__progress_board__battery_short", (x - 3.29, circuit_y, 2.25), (.035, .025, .23), M["paper"], progress_board, .006)
    for glyph_index, glyph_x in enumerate((x - 1.78, x - 1.20, x - .58)):
        box(
            f"ELECTRO__progress_board__glyph_{glyph_index}",
            (glyph_x, circuit_y, 1.84),
            (.34 if glyph_index != 1 else .06, .025, .055),
            M["gold"] if glyph_index != 1 else M["paper"],
            progress_board,
            .008,
        )

    # The second bank already exists in the room; these powered modules make
    # its state change visible without duplicating or moving the furniture.
    progress_bench = empty("ELECTRO__progress_workbench_2", parent=root)
    progress_bench["progressState"] = "electronics-arc-1-complete"
    progress_bench["interactiveId"] = "mesa"
    for module_index, station_x in enumerate(station_xs):
        box(
            f"ELECTRO__progress_workbench_2__screen_{module_index}",
            (station_x, bench_ys[1] - .35, 1.49),
            (.42, .025, .24),
            M["progress_green"],
            progress_bench,
            .02,
        )
        for led_index in range(3):
            sphere(
                f"ELECTRO__progress_workbench_2__led_{module_index}_{led_index}",
                (station_x - .14 + led_index * .14, bench_ys[1] - .37, 1.33),
                .028,
                M["progress_green"],
                progress_bench,
                8,
                4,
            )

    # Animation-ready learned robot, grounded on the second workbench.
    robot = empty("ELECTRO__progress_robot", parent=root)
    robot["progressState"] = "electronics-arc-1-complete"
    robot["interactiveId"] = "robot"
    rx, ry, rz = x - .98, bench_ys[1] - .02, 1.32
    box("ELECTRO__progress_robot__body", (rx, ry, rz + .32), (.48, .34, .48), M["copper"], robot, .08)
    box("ELECTRO__progress_robot__chest", (rx, ry - .18, rz + .33), (.31, .035, .26), M["green"], robot, .025)
    head = box("ELECTRO__progress_robot__head", (rx, ry, rz + .74), (.56, .38, .34), M["copper"], robot, .10)
    head["pivot"] = "head"
    face = box("ELECTRO__progress_robot__face", (rx, ry - .205, rz + .74), (.39, .04, .22), M["green"], robot, .03)
    face["socket"] = "face"
    for eye_side in (-1, 1):
        sphere(
            f"ELECTRO__progress_robot__eye_{eye_side}",
            (rx + eye_side * .115, ry - .235, rz + .76),
            .055,
            M["progress_green"],
            robot,
            10,
            5,
        )
        cylinder_between(
            f"ELECTRO__progress_robot__arm_{eye_side}",
            (rx + eye_side * .29, ry, rz + .47),
            (rx + eye_side * .43, ry - .03, rz + .24),
            .055,
            M["copper"],
            robot,
            8,
        )
        box(
            f"ELECTRO__progress_robot__foot_{eye_side}",
            (rx + eye_side * .14, ry - .01, rz + .055),
            (.19, .28, .11),
            M["copper"],
            robot,
            .04,
        )
    cylinder_between(
        "ELECTRO__progress_robot__antenna",
        (rx, ry, rz + .91),
        (rx + .06, ry, rz + 1.10),
        .025,
        M["copper"],
        robot,
        7,
    )
    sphere("ELECTRO__progress_robot__antenna_tip", (rx + .06, ry, rz + 1.12), .045, M["progress_green"], robot, 8, 4)

    # Portal recovered from Ohmdal: layered, mechanical and dormant by default.
    portal_x = x + 3.72
    portal_y = y + 2.48
    portal_z = 1.72
    polygon_prism("ELECTRO__portal_base", (portal_x, portal_y, .48), 1.72, 1.22, .30, M["stone_dark"], root, 8)
    polygon_prism("ELECTRO__portal_base_cap", (portal_x, portal_y, .67), 1.50, 1.04, .10, M["stone"], root, 8)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=1.12,
        minor_radius=.18,
        major_segments=32,
        minor_segments=8,
        location=(portal_x, portal_y, portal_z),
        rotation=(math.radians(90), 0, 0),
    )
    portal = bpy.context.object
    portal.name = "ELECTRO__ohmdal_portal"
    assign(portal, M["portal"])
    portal.parent = root
    portal["interactiveId"] = "portal"
    portal["defaultState"] = "off"
    bpy.ops.mesh.primitive_torus_add(
        major_radius=.78,
        minor_radius=.09,
        major_segments=28,
        minor_segments=7,
        location=(portal_x, portal_y - .03, portal_z),
        rotation=(math.radians(90), 0, 0),
    )
    inner_ring = bpy.context.object
    inner_ring.name = "ELECTRO__portal_inner_ring"
    assign(inner_ring, M["teal"])
    inner_ring.parent = root
    for coil_index, (dx, dz) in enumerate(((-1.14, 0), (1.14, 0), (-.72, .90), (.72, .90))):
        cylinder(
            f"ELECTRO__portal_coil_{coil_index}",
            (portal_x + dx, portal_y - .10, portal_z + dz),
            .19,
            .46,
            M["copper"],
            root,
            12,
        )
        cylinder(
            f"ELECTRO__portal_insulator_{coil_index}",
            (portal_x + dx, portal_y - .10, portal_z + dz - .24),
            .11,
            .18,
            M["paper"],
            root,
            10,
        )

    # Only the first radial sector lights after Arc 1. Short tube segments
    # follow the ring, so the activation changes silhouette as well as colour.
    progress_sector = empty("ELECTRO__progress_portal_sector", parent=root)
    progress_sector["progressState"] = "electronics-arc-1-complete"
    progress_sector["interactiveId"] = "portal"
    sector_angles = [math.radians(122 - step * 9) for step in range(8)]
    for segment_index in range(len(sector_angles) - 1):
        angle_a = sector_angles[segment_index]
        angle_b = sector_angles[segment_index + 1]
        a = (
            portal_x + math.cos(angle_a) * 1.12,
            portal_y - .24,
            portal_z + math.sin(angle_a) * 1.12,
        )
        b = (
            portal_x + math.cos(angle_b) * 1.12,
            portal_y - .24,
            portal_z + math.sin(angle_b) * 1.12,
        )
        cylinder_between(
            f"ELECTRO__progress_portal_sector__segment_{segment_index}",
            a,
            b,
            .10,
            M["progress_violet"],
            progress_sector,
            9,
        )

    box("ELECTRO__portal_console", (x + 2.32, y + 1.24, 1.02), (1.18, .78, .66), M["stone_dark"], root, .08)
    box("ELECTRO__portal_console_face", (x + 2.32, y + .82, 1.10), (.92, .06, .38), M["black"], root, .02)
    for symbol_index in range(3):
        polygon_prism(
            f"ELECTRO__portal_symbol_{symbol_index}",
            (x + 2.02 + symbol_index * .30, y + .77, 1.10),
            .09,
            .09,
            .035,
            M["teal"],
            root,
            3,
            0,
        ).rotation_euler[0] = math.radians(90)
    gauge = polygon_prism("ELECTRO__portal_gauge", (x + 2.32, y + .74, 1.43), .22, .22, .04, M["paper"], root, 24, 0)
    gauge.rotation_euler[0] = math.radians(90)
    cylinder_between(
        "ELECTRO__portal_gauge_needle",
        (x + 2.32, y + .69, 1.43),
        (x + 2.43, y + .69, 1.53),
        .018,
        M["coral"],
        root,
        6,
    )

    projector = projector_cart("ELECTRO__projector", x + 4.10, y - 2.55, .28, root)
    projector["interactiveId"] = "proyector"

    # Safety island at the open Hall threshold.
    box("ELECTRO__safety_post", (x + 5.50, y - .70, 1.55), (.42, .72, 2.55), M["stone"], root, .07)
    box("ELECTRO__master_cutoff", (x + 5.25, y - .90, 2.08), (.14, .38, .52), M["coral"], root, .04)
    sphere("ELECTRO__master_cutoff_button", (x + 5.16, y - .90, 2.08), .11, M["gold"], root, 10, 5)
    cylinder("ELECTRO__fire_extinguisher", (x + 5.18, y - .38, .93), .19, 1.10, M["coral"], root, 12)
    box("ELECTRO__first_aid", (x + 5.18, y - 1.18, 1.26), (.14, .52, .48), M["paper"], root, .04)


def add_achievements(root, center):
    x, y = center
    box("ACH__case", (x, y + 3.52, 1.65), (7.0, .52, 2.65), M["wood"], root, .08)
    for row in range(2):
        for col in range(7):
            px = x - 2.7 + col * .9
            pz = .85 + row * 1.05
            cylinder(f"ACH__badge_{row}_{col}", (px, y + 3.18, pz), .25, .11, M["gold"] if (row + col) < 4 else M["stone"], root, 6)
    for index in range(3):
        cylinder(f"ACH__trophy_{index}", (x - 1.8 + index * 1.8, y + .2, .84), .28, 1.12 + index * .22, M["gold"], root, 12)
        sphere(f"ACH__trophy_orb_{index}", (x - 1.8 + index * 1.8, y + .2, 1.54 + index * .22), .34, M["gold"], root)
    person("NPC_achievement_student", x - 2.8, y - 1.9, .24, root, M["blue"], M["skin1"], scale=.94)


def add_reception(root, center):
    x, y = center
    box("RECEPTION__desk", (x, y + .6, .80), (6.2, 1.25, .92), M["wood"], root, .16)
    box("RECEPTION__counter", (x, y + .58, 1.31), (6.7, 1.40, .18), M["wood_light"], root, .09)
    box("RECEPTION__book", (x - 1.1, y + .30, 1.44), (1.0, .7, .08), M["paper"], root, .03)
    person("NPC_preceptor", x, y + 1.75, .35, root, M["green"], M["skin2"], scale=.86)
    person("NPC_new_student", x + 2.7, y - 1.7, .35, root, M["blue"], M["skin3"], scale=.82)
    plant("RECEPTION__plant_1", x - 3.9, y + 2.6, .24, root, .9)
    plant("RECEPTION__plant_2", x + 3.9, y + 2.6, .24, root, .9)


def add_visitors(root, center):
    x, y = center
    box("VISITORS__screen_frame", (x, y + 3.30, 2.1), (5.1, .18, 2.05), M["wood"], root, .08)
    box("VISITORS__screen", (x, y + 3.18, 2.1), (4.7, .04, 1.69), M["paper"], root, .03)
    for side in (-1, 1):
        box(f"VISITORS__screen_support_{side}", (x + side * 2.2, y + 3.3, .97), (.12, .16, 1.24), M["wood"], root, .03)
    desk("VISITORS__lectern", x - 2.2, y + 2.05, .24, root, 1.55, .8)
    # Three continuous, supported terraces with a broad centre aisle. Every
    # chair has a local pivot, four legs and clear space to its neighbours.
    for row in range(AMPHITHEATRE_ROW_COUNT):
        seat_y = y + .05 - row * 1.38
        surface = .36 + row * .22
        height = surface - .20
        box(f"VISITORS__tier_{row}", (x, seat_y, .20 + height / 2), (8.5, 1.38, height), M["wood"], root, .035)
        box(f"VISITORS__tier_nosing_{row}", (x, seat_y + .67, surface + .015), (8.45, .055, .03), M["gold"], root, .01)
        for column, offset in enumerate(AMPHITHEATRE_SEAT_OFFSETS):
            chair(f"VISITORS__seat_{row}_{column}", x + offset, seat_y, surface, root, M["wine"])
    person("NPC_world_visitor_0", x + 2.8, y + 2.1, .35, root, M["violet"], M["skin1"], scale=.85, visitor=True)
    plant("VISITORS__plant", x + 4.6, y + 2.65, .35, root, .8)


def validate_school_geometry():
    bpy.context.view_layer.update()
    issues = []
    def extent(obj):
        points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
        return ([min(point[axis] for point in points) for axis in range(3)],
                [max(point[axis] for point in points) for axis in range(3)])
    direction = bpy.data.objects["ROOM_direccion"]
    if abs(direction.location.z - DIRECTION_FLOOR_RISE) > .001:
        issues.append("Dirección no coincide con su cota arquitectónica")
    landing_min, landing_max = extent(bpy.data.objects["HALL__upper_landing"])
    if abs(landing_max[1] - HALL_LANDING_NORTH) > .001 or abs(landing_max[2] - HALL_LANDING_SURFACE) > .001:
        issues.append("El desembarco no alcanza la puerta/cota de Dirección")
    direction_floor = extent(bpy.data.objects["ROOM_direccion__floor_inner"])[1][2]
    if abs(direction_floor - landing_max[2]) > .025:
        issues.append("Hay un desnivel entre desembarco y Dirección")
    tower_bottom = extent(bpy.data.objects["OFFICE__tower"])[0][2]
    support_min, support_max = extent(bpy.data.objects["OFFICE__tower_support"])
    wall_top = extent(bpy.data.objects["ROOM_direccion__back_wall"])[1][2]
    if support_max[2] < tower_bottom or support_min[2] > wall_top:
        issues.append("La torre del reloj no apoya sobre Dirección")
    counter_top = extent(bpy.data.objects["RECEPTION__counter"])[1][2]
    book_bottom = extent(bpy.data.objects["RECEPTION__book"])[0][2]
    if counter_top > 1.41 or abs(book_bottom - counter_top) > .001:
        issues.append("Mostrador fuera de escala o libro sin apoyo")
    direct_passages = []
    for room_id, side in (("matematica", -1), ("fisica", 1)):
        door = next(door for door in DOORS if {door.room_a, door.room_b} == {room_id, "hall"})
        # Audit the actual walk-through volume, including both sides of the shared wall.
        volume_min = (side * 10 - 1.05, door.center - door.width / 2 + .015, .36)
        volume_max = (side * 10 + 1.05, door.center + door.width / 2 - .015, 2.35)
        for obj in bpy.data.objects:
            if obj.type != "MESH" or obj.name.startswith("SCHOOL__"): continue
            lower, upper = extent(obj)
            if all(min(upper[axis], volume_max[axis]) - max(lower[axis], volume_min[axis]) > .002 for axis in range(3)):
                issues.append(f"Paso Hall/{room_id} obstruido: {obj.name}")
        direct_passages.append({"room": room_id, "width": door.width, "centerY": door.center})
    theatre_seats = []
    for row in range(AMPHITHEATRE_ROW_COUNT):
        support_z = extent(bpy.data.objects[f"VISITORS__tier_{row}"])[1][2]
        for column in range(len(AMPHITHEATRE_SEAT_OFFSETS)):
            chair_root = bpy.data.objects[f"VISITORS__seat_{row}_{column}"]
            legs = [child for child in chair_root.children if "__leg" in child.name]
            if len(legs) != 4 or any(abs(extent(leg)[0][2] - support_z) > .001 for leg in legs):
                issues.append(f"Silla {row}/{column} sin cuatro patas apoyadas")
            forward = chair_root.matrix_world.to_quaternion() @ Vector((0, -1, 0))
            if forward.y < .99:
                issues.append(f"Silla {row}/{column} no mira al atril")
            theatre_seats.append(chair_root)
    for index, first in enumerate(theatre_seats):
        for second in theatre_seats[index + 1:]:
            delta = first.matrix_world.translation - second.matrix_world.translation
            if abs(delta.x) < .85 and abs(delta.y) < .85:
                issues.append(f"Sillas superpuestas: {first.name}/{second.name}")
    # Every classroom NPC occupies a circulation aisle, not a desk or server.
    for npc in [o for o in bpy.data.objects if o.name.startswith("NPC_") and o.type == "EMPTY"]:
        room = npc.parent
        if room is None: continue
        center = npc.matrix_world.translation
        for prop in room.children_recursive:
            if prop.type != "MESH" or not (prop.name.endswith("__top") or "PROGRAM__server_" in prop.name and "led" not in prop.name):
                continue
            lower, upper = extent(prop)
            if lower[0] - .28 < center.x < upper[0] + .28 and lower[1] - .24 < center.y < upper[1] + .24:
                issues.append(f"NPC invade mobiliario: {npc.name}/{prop.name}")
    report = {"directionFloorRise": DIRECTION_FLOOR_RISE, "landingSurface": landing_max[2],
              "landingNorth": landing_max[1], "theatreSeats": len(theatre_seats), "counterHeight": counter_top, "clockSupported": support_max[2] >= tower_bottom, "directPassages": direct_passages, "issues": issues}
    (OUT / "geometry-checks.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    if issues: raise RuntimeError("Geometría escolar inválida: " + "; ".join(issues))
    log("validate", "desembarco continuo, 12 sillas apoyadas, aulas sin NPC dentro de muebles")


def add_school_base():
    """Faceted foundation and short radial circulation for one dollhouse."""
    # El plinto tiene que llegar hasta la escalinata sur; con la profundidad
    # anterior los escalones quedaban colgando en el vacío.
    polygon_prism("SCHOOL__plinth", (0, 1.2, -.62), 29.5, 21.5, .92, M["stone_dark"], None, 8)
    polygon_prism("SCHOOL__plinth_mid", (0, 1.2, -.16), 28.4, 20.4, .28, M["stone"], None, 8)
    polygon_prism("SCHOOL__lawn", (0, 1.2, .00), 27.2, 19.2, .12, M["lawn"], None, 8)

    # Courtyard ring around the Hall, then the corridors that reach every row.
    polygon_prism("SCHOOL__court", (0, 1.5, .08), 12.2, 10.7, .16, M["paving"], None, 8)
    box("SCHOOL__path_west_east", (0, 1.7, .07), (46.0, 3.8, .12), M["paving"], None, .1)
    box("SCHOOL__path_north", (0, 11.4, .07), (4.0, 15.0, .12), M["paving"], None, .1)
    box("SCHOOL__path_south", (0, -11.8, .07), (4.6, 13.0, .12), M["paving"], None, .1)

    # Southern entrance: the visitor arrives here and looks north to the Hall.
    entry_y = -18.0
    box("SCHOOL__path_entry", (0, -14.5, .07), (5.0, 9.0, .12), M["paving"], None, .1)
    box("SCHOOL__front_steps_1", (0, entry_y - 1.0, .04), (11.0, 2.0, .22), M["cream"], None, .12)
    box("SCHOOL__front_steps_2", (0, entry_y - 2.4, -.10), (13.5, 1.6, .22), M["cream"], None, .12)
    for x in (-4.6, 4.6):
        cylinder("SCHOOL__entry_lamp_post", (x, entry_y - .5, 1.0), .10, 1.8, M["black"], None, 10)
        sphere("SCHOOL__entry_lamp", (x, entry_y - .5, 1.95), .23, M["lamp"], None, 10, 5)

    gate_y = -14.4
    for side in (-1, 1):
        px = side * 3.55
        box(f"SCHOOL__gate_pier_{side}", (px, gate_y, 1.95), (1.15, 1.25, 3.7), M["stone"], None, .12)
        box(f"SCHOOL__gate_cap_{side}", (px, gate_y, 3.95), (1.55, 1.55, .34), M["cream"], None, .08)
        polygon_prism(f"SCHOOL__gate_lamp_base_{side}", (px, gate_y - .72, 4.24), .28, .28, .18, M["gold"], None, 8)
        sphere(f"SCHOOL__gate_lamp_{side}", (px, gate_y - .72, 4.58), .26, M["lamp"], None, 10, 5)
    box("SCHOOL__gate_lintel", (0, gate_y, 3.55), (6.1, 1.05, .55), M["stone"], None, .09)
    box("SCHOOL__gate_banner", (0, gate_y - .62, 3.46), (1.7, .08, 1.45), M["wine"], None, .04)
    polygon_prism("SCHOOL__gate_seal", (0, gate_y - .70, 3.55), .36, .36, .06, M["gold"], None, 8, 0)

    # Individual pavers break the long approach into readable handcrafted scale.
    for row in range(8):
        py = -18.0 + row * 1.0
        for col in range(3):
            px = (col - 1) * 1.42 + (.28 if row % 2 else 0)
            box(f"SCHOOL__entry_paver_{row}_{col}", (px, py, .16), (1.18, .82, .08), M["stone"], None, .05)

    # Trees soften the outer edge and give the silhouette something organic.
    tree_positions = (
        (-25.5, 14.8), (-19.5, 18.0), (-9.0, 19.0), (9.0, 19.0), (19.5, 18.0), (25.5, 14.8),
        (-26.0, 3.8), (26.0, 3.8), (-23.8, -8.5), (23.8, -8.5),
        (-16.5, -15.2), (16.5, -15.2), (-8.5, -17.0), (8.5, -17.0),
    )
    for tx, ty in tree_positions:
        cylinder(f"SCHOOL__tree_trunk_{int(tx)}_{int(ty)}", (tx, ty, .95), .28, 1.9, M["wood"], None, 8)
        sphere(f"SCHOOL__tree_crown_{int(tx)}_{int(ty)}", (tx, ty, 2.75), 1.55, M["leaf"], None, 12, 6)
        sphere(f"SCHOOL__tree_crown_b_{int(tx)}_{int(ty)}", (tx + .7, ty - .4, 2.2), 1.05, M["leaf_dark"], None, 10, 5)

    shrub_positions = []
    for side in (-1, 1):
        for index in range(7):
            shrub_positions.append((side * (25.2 + (index % 2) * .7), 13.0 - index * 3.8))
        for index in range(7):
            shrub_positions.append((side * (5.8 + index * 2.6), -16.7 + (index % 2) * .7))
    flower_palette = (M["coral"], M["violet"], M["blue"], M["gold"])
    for index, (sx, sy) in enumerate(shrub_positions):
        sphere(f"SCHOOL__shrub_{index}_a", (sx, sy, .58), .62 + (index % 3) * .08, M["leaf_dark"], None, 8, 4)
        sphere(f"SCHOOL__shrub_{index}_b", (sx + .52, sy + .18, .52), .48, M["leaf"], None, 8, 4)
        sphere(f"SCHOOL__flower_{index}", (sx - .28, sy - .38, .64), .12, flower_palette[index % len(flower_palette)], None, 8, 4)


# ---------------------------------------------------------------------------
# Stage 2 — densify
# ---------------------------------------------------------------------------

def densify(obj, edge_length):
    """Subdivide long edges so the vertex-colour bake has room for a gradient."""
    mesh = obj.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    for _ in range(7):
        edges = [e for e in bm.edges if e.calc_length() > edge_length]
        if not edges:
            break
        bmesh.ops.subdivide_edges(bm, edges=edges, cuts=1, use_grid_fill=True)
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()


def apply_modifiers_and_densify():
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    # Evaluate the graph once and materialize its meshes in a separate pass.
    # Per-object operators rebuild the entire school thousands of times.
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = [(obj, bpy.data.meshes.new_from_object(obj.evaluated_get(depsgraph), depsgraph=depsgraph))
                 for obj in meshes if obj.modifiers]
    for obj, mesh in evaluated:
        original = obj.data
        obj.modifiers.clear()
        obj.data = mesh
        if original.users == 0: bpy.data.meshes.remove(original)
    log("densify", f"modificadores aplicados en {len(meshes)} mallas")

    touched = 0
    for obj in meshes:
        for needle, edge_length in DENSIFY_RULES:
            if needle in obj.name:
                densify(obj, edge_length)
                touched += 1
                break
    log("densify", f"{touched} superficies subdivididas para el degradado")


# ---------------------------------------------------------------------------
# Stage 3 — bake
# ---------------------------------------------------------------------------

def enable_gpu(scene):
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
    except KeyError:
        return "CPU (cycles prefs no disponibles)"
    for device_type in ("OPTIX", "CUDA", "HIP", "ONEAPI", "METAL"):
        try:
            prefs.compute_device_type = device_type
        except TypeError:
            continue
        try:
            prefs.get_devices()
        except Exception:
            continue
        usable = [d for d in prefs.devices if d.type == device_type]
        if usable:
            for device in prefs.devices:
                device.use = device.type in (device_type, "CPU")
            scene.cycles.device = "GPU"
            return f"GPU {device_type} ({len(usable)} dispositivo/s)"
    scene.cycles.device = "CPU"
    return "CPU"


def bake_vertex_colours():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    device = enable_gpu(scene)
    scene.cycles.samples = BAKE_SAMPLES
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.max_bounces = 6
    scene.cycles.diffuse_bounces = 4
    scene.cycles.glossy_bounces = 2
    scene.cycles.transmission_bounces = 2
    scene.cycles.use_denoising = False

    bake = scene.render.bake
    bake.target = "VERTEX_COLORS"
    bake.use_pass_direct = True
    bake.use_pass_indirect = True
    bake.use_selected_to_active = False

    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    for obj in meshes:
        attrs = obj.data.color_attributes
        existing = attrs.get(BAKE_ATTR)
        if existing is None:
            existing = attrs.new(name=BAKE_ATTR, type="FLOAT_COLOR", domain="CORNER")
        try:
            attrs.active_color_index = list(attrs).index(existing)
        except Exception:
            pass
        try:
            attrs.render_color_index = list(attrs).index(existing)
        except Exception:
            pass

    log("bake", f"{device}, {BAKE_SAMPLES} muestras, {len(meshes)} mallas")
    started = time.time()
    # One object at a time, so a single slow mesh is visible in the log instead
    # of hiding inside a silent multi-object operator call.
    for index, obj in enumerate(meshes, start=1):
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        step = time.time()
        bpy.ops.object.bake(type="COMBINED")
        log("bake", f"{index}/{len(meshes)} {obj.name} ({time.time() - step:.1f}s)")
    log("bake", f"terminado en {time.time() - started:.1f}s")

    # glTF COLOR_0 is expected in [0,1]; emissive props bake far above that.
    clamped = 0
    ambient_repaired = 0
    for obj in meshes:
        data = obj.data.color_attributes.get(BAKE_ATTR)
        if data is None:
            continue
        # Contact corners of intersecting trim can receive no Cycles rays at
        # all. Preserve a modest, albedo-coloured ambient floor per face rather
        # than interpolating those invalid black samples across visible wood.
        for polygon in obj.data.polygons:
            albedo = obj.data.materials[polygon.material_index].diffuse_color
            minimum = tuple(float(albedo[channel]) * .12 for channel in range(3))
            for loop_index in polygon.loop_indices:
                element = data.data[loop_index]
                colour = element.color
                if any(colour[channel] < minimum[channel] for channel in range(3)):
                    element.color = (*(max(colour[channel], minimum[channel]) for channel in range(3)), 1.0)
                    ambient_repaired += 1
        for element in data.data:
            colour = element.color
            if colour[0] > 1 or colour[1] > 1 or colour[2] > 1:
                clamped += 1
                element.color = (min(colour[0], 1.0), min(colour[1], 1.0), min(colour[2], 1.0), 1.0)
    log("bake", f"{clamped} vértices sobreexpuestos recortados a [0,1]")
    log("bake", f"{ambient_repaired} muestras de contacto con mínimo ambiente de albedo")


# ---------------------------------------------------------------------------
# Stage 4 — flatten
# ---------------------------------------------------------------------------

def baked_material():
    """One Principled material whose base colour is the baked attribute.

    Three.js swaps this for MeshBasicMaterial, so the browser draws exactly what
    Cycles computed, with no runtime lights at all.
    """
    material = bpy.data.materials.new("RX_baked")
    material.use_nodes = True
    tree = material.node_tree
    bsdf = tree.nodes.get("Principled BSDF")
    attribute = tree.nodes.new("ShaderNodeVertexColor")
    attribute.layer_name = BAKE_ATTR
    attribute.location = (-320, 120)
    tree.links.new(attribute.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 1.0
    bsdf.inputs["Metallic"].default_value = 0.0
    return material


def join_into(name, objects, parent, keep_transform_of=None):
    if not objects:
        return None
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    anchor = keep_transform_of or objects[0]
    bpy.context.view_layer.objects.active = anchor
    if len(objects) > 1:
        bpy.ops.object.join()
    joined = bpy.context.object
    joined.name = name
    joined.parent = parent
    return joined


def join_scene():
    """Consolidate geometry BEFORE baking.

    Cycles bakes once per selected object, and each pass re-syncs the whole
    scene: baking 761 loose meshes is hours of work, baking ~30 joined ones is
    minutes. Joining keeps one material slot per original material, so the
    albedo the bake reads is exactly the same.
    """

    def stays_separate(obj):
        root = obj
        while root is not None:
            if (root.get("interactiveId") is not None
                    or root.name in ANIMATED_NAMES
                    or root.name in HERO_ROOTS
                    or any(root.name.startswith(p) for p in ANIMATED_PREFIXES)):
                return True
            root = root.parent
        return False

    joined = 0
    for room_id, *_ in ROOMS:
        room_root = bpy.data.objects.get(f"ROOM_{room_id}")
        if room_root is None:
            continue
        statics = [obj for obj in room_root.children_recursive
                   if obj.type == "MESH" and not stays_separate(obj)]
        if statics:
            join_into(f"ROOM_{room_id}__shell", statics, room_root)
            joined += 1
        # Each NPC becomes a single mesh under its own root so the runtime can
        # keep animating it as one object.
        for npc in [c for c in room_root.children_recursive if c.name.startswith("NPC_") and c.type == "EMPTY"]:
            parts = [c for c in npc.children_recursive if c.type == "MESH"]
            if parts:
                join_into(f"{npc.name}__mesh", parts, npc)
                joined += 1
        # Object-level interactions survive consolidation as one mesh below a
        # semantic root. This adds only one draw call per selectable object and
        # preserves the wide click target in the browser.
        interactives = [
            c for c in room_root.children_recursive
            if c.type == "EMPTY" and c.get("interactiveId") is not None
        ]
        for interactive in interactives:
            parts = [c for c in interactive.children_recursive if c.type == "MESH"]
            if parts:
                join_into(f"{interactive.name}__mesh", parts, interactive)
                joined += 1

    for hero_name in HERO_ROOTS:
        hero = bpy.data.objects.get(hero_name)
        if hero is None:
            continue
        parts = [c for c in hero.children_recursive if c.type == "MESH"]
        if parts:
            join_into(f"{hero_name}__mesh", parts, hero)
            joined += 1

    base = [obj for obj in bpy.data.objects if obj.type == "MESH" and obj.name.startswith("SCHOOL__")]
    if base:
        join_into("SCHOOL__campus", base, None)
        joined += 1
    log("join", f"{joined} mallas finales tras el join")


def flatten_materials():
    """After the bake, every surface carries its lighting in the vertex colours,
    so a single material is enough for the whole school."""
    material = baked_material()
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    for obj in meshes:
        obj.data.materials.clear()
        obj.data.materials.append(material)
    log("flatten", f"un único material en {len(meshes)} mallas")


# ---------------------------------------------------------------------------
# Stage 5 / 6 — export and control render
# ---------------------------------------------------------------------------

def point_at(obj, target):
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def setup_camera_and_lights():
    # Centred 45-degree overview. This is the Blender counterpart of the
    # browser's fixed camera direction; the extra elevation separates the three
    # rows on screen without moving rooms away from their shared boundaries.
    bpy.ops.object.camera_add(location=(32, -64, 79.8))
    camera = bpy.context.object
    camera.name = "CAMERA_school_overview"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 64
    point_at(camera, Vector((0, 0, 3.0)))
    bpy.context.scene.camera = camera

    # Clave cálida y bastante concentrada: es la que talla el volumen. Los
    # rellenos se mantienen bajos a propósito — subirlos aplana el diorama y lo
    # vuelve lechoso, que es justo lo contrario del tono del Instituto.
    bpy.ops.object.light_add(type="AREA", location=(-22, -22, 40))
    key = bpy.context.object
    key.name = "LIGHT_key"
    key.data.energy = 3400
    key.data.shape = "DISK"
    key.data.size = 13
    key.data.color = (1.0, .78, .58)
    point_at(key, Vector((0, -3, 0)))

    bpy.ops.object.light_add(type="AREA", location=(28, 12, 30))
    fill = bpy.context.object
    fill.name = "LIGHT_fill"
    fill.data.energy = 1800
    fill.data.size = 26
    fill.data.color = (.34, .50, 1.0)
    point_at(fill, Vector((0, 0, 0)))

    bpy.ops.object.light_add(type="AREA", location=(0, 24, 22))
    rim = bpy.context.object
    rim.name = "LIGHT_rim"
    rim.data.energy = 950
    rim.data.size = 18
    rim.data.color = (1.0, .46, .20)
    point_at(rim, Vector((0, 4, 0)))

    bpy.ops.object.light_add(type="SUN", location=(0, 0, 30), rotation=(math.radians(24), math.radians(-18), math.radians(-32)))
    sun = bpy.context.object
    sun.name = "LIGHT_sun_soft"
    sun.data.energy = 2.4
    sun.data.angle = math.radians(11)
    sun.data.color = (1.0, .86, .70)


def configure_scene():
    scene = bpy.context.scene
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False
    world = scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.18, 0.22, 0.25, 1)
    background.inputs["Strength"].default_value = .70
    # Standard view transform: the bake IS the look, so Blender and the browser
    # agree pixel for pixel (Three.js renders with NoToneMapping).
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"


def export_one_glb(filepath, *, selected=False, draco=False):
    bpy.ops.export_scene.gltf(
        filepath=str(filepath),
        export_format="GLB",
        use_selection=selected,
        export_apply=True,
        export_cameras=False,
        export_lights=False,
        export_extras=True,
        export_yup=True,
        export_normals=False,          # unlit baked material never reads normals
        export_texcoords=False,        # no textures at all in this scene
        export_vertex_color="ACTIVE",
        export_all_vertex_colors=False,
        export_draco_mesh_compression_enable=draco,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=13,
        export_draco_color_quantization=12,
        export_draco_normal_quantization=8,
        export_draco_generic_quantization=12,
    )


def export_glb():
    scene = bpy.context.scene
    scene["schemaVersion"] = 3
    scene["project"] = "Proyecto Roxana"
    scene["roomCount"] = len(ROOMS)
    scene["primaryRoomCount"] = len(PRIMARY_BY_ID)
    scene["planGridMetres"] = 0.5
    scene["planOverlapCount"] = 0
    scene["lighting"] = "baked-vertex-colors"
    scene["progression"] = "initial,electronics-arc-1-complete"
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "instituto-roxana.blend"))
    overview_original = OUT / "school-overview.original.glb"
    overview_compressed = OUT / "school-overview.glb"
    export_one_glb(overview_original, draco=False)
    export_one_glb(overview_compressed, draco=True)
    shutil.copy2(overview_compressed, OUT / "instituto-roxana.glb")

    bpy.ops.object.select_all(action="DESELECT")
    electronics = bpy.data.objects.get("ROOM_electronica")
    if electronics:
        electronics.select_set(True)
        for child in electronics.children_recursive:
            child.select_set(True)
        export_one_glb(OUT / "electronics-room.original.glb", selected=True, draco=False)
        export_one_glb(OUT / "electronics-room.glb", selected=True, draco=True)
    bpy.ops.object.select_all(action="DESELECT")

    original_size = overview_original.stat().st_size
    compressed_size = overview_compressed.stat().st_size
    ratio = compressed_size / original_size if original_size else 0
    log(
        "export",
        f"overview {original_size / 1_048_576:.2f} MB -> "
        f"{compressed_size / 1_048_576:.2f} MB Draco ({ratio:.1%})",
    )
    return compressed_size


def set_progress_render_visibility(visible):
    for root_name in (
        "HALL__progress_relic",
        "HALL__progress_lamp",
        "ELECTRO__progress_portal_sector",
        "ELECTRO__progress_robot",
        "ELECTRO__progress_workbench_2",
        "ELECTRO__progress_board",
    ):
        root = bpy.data.objects.get(root_name)
        if root is None:
            continue
        root.hide_render = not visible
        for child in root.children_recursive:
            child.hide_render = not visible


def render_previews():
    """Unlit render of the baked colours: the browser's exact output."""
    scene = bpy.context.scene
    for light in [obj for obj in bpy.data.objects if obj.type == "LIGHT"]:
        bpy.data.objects.remove(light, do_unlink=True)
    background = scene.world.node_tree.nodes.get("Background")
    background.inputs["Strength"].default_value = 0.0
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError:
        # Blender 5.2 volvió a exponer Eevee bajo el identificador corto.
        scene.render.engine = "BLENDER_EEVEE"

    unlit = bpy.data.materials.new("RX_baked_preview")
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
    for obj in [o for o in bpy.data.objects if o.type == "MESH"]:
        obj.data.materials.clear()
        obj.data.materials.append(unlit)

    campus = bpy.data.objects.get("SCHOOL__campus")
    if campus: campus.hide_render = True
    set_progress_render_visibility(False)
    scene.render.filepath = str(OUT / "school-preview-initial.png")
    bpy.ops.render.render(write_still=True)
    shutil.copy2(OUT / "school-preview-initial.png", OUT / "school-preview.png")
    log("preview", "school-preview-initial.png")

    set_progress_render_visibility(True)
    scene.render.filepath = str(OUT / "school-preview-electronics-arc-1-complete.png")
    bpy.ops.render.render(write_still=True)
    log("preview", "school-preview-electronics-arc-1-complete.png")

    camera = scene.camera
    camera.location = (5.8, -4.2 + HALL_CENTER[1], 5.6)
    camera.data.ortho_scale = 4.25
    point_at(camera, Vector((0, 3.5 + HALL_CENTER[1], 2.22)))
    scene.render.resolution_x = 900
    scene.render.resolution_y = 1100
    scene.render.filepath = str(OUT / "roxana-statue-preview.png")
    bpy.ops.render.render(write_still=True)
    log("preview", "roxana-statue-preview.png")


def render_blockout():
    """Fast Eevee composition check before the expensive vertex-colour bake."""
    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError:
        scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1000
    scene.render.resolution_percentage = 100
    for obj in bpy.data.objects:
        if obj.name.startswith("SCHOOL__"): obj.hide_render = True
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "school-blockout.blend"))
    scene.render.filepath = str(OUT / "school-blockout.png")
    bpy.ops.render.render(write_still=True)
    log("blockout", "school-blockout.png")


def report_budget():
    total_verts = total_tris = 0
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    for obj in meshes:
        total_verts += len(obj.data.vertices)
        total_tris += sum(len(p.vertices) - 2 for p in obj.data.polygons)
    log("budget", f"{len(meshes)} mallas | {total_verts} verts | {total_tris} tris")


# ---------------------------------------------------------------------------

BAKE_ATTR = "RXBake"

clear_scene()
M = {key: mat(f"RX_{key}", value) for key, value in COLORS.items()}
M["terracotta"] = mat("RX_terracotta", (.56, .20, .08, 1))
M["lawn"] = mat("RX_lawn", (.075, .125, .095, 1), .95)
M["paving"] = mat("RX_paving", (.31, .30, .285, 1), .88)
M["leaf_dark"] = mat("RX_leaf_dark", (.045, .16, .075, 1), .90)
M["copper"] = mat("RX_copper", (.58, .24, .075, 1), .44, .55)
# The school is vertex-colour baked, so "glass" is a cool opaque value that
# reads as aged cabinet glazing without relying on runtime transparency.
M["glass"] = mat("RX_glass", (.16, .31, .31, 1), .30, .10)
M["lamp"] = mat("RX_lamp", (1.0, .66, .24, 1), .35, 0, (1.0, .42, .10, 1), 2.2)
# El rótulo sólo tiene que insinuar que la sala está encendida: más fuerte, se
# convertía en una barra flotante que competía con la sala entera.
M["lamp_soft"] = mat("RX_lamp_soft", (.95, .70, .36, 1), .40, 0, (1.0, .52, .16, 1), .75)
M["portal"] = mat("RX_portal", (.03, .63, .78, 1), .25, .12, (.02, .62, .98, 1), 3.0)
M["progress_green"] = mat(
    "RX_progress_green",
    (.06, .72, .32, 1),
    .24,
    .08,
    (.03, .95, .32, 1),
    3.2,
)
M["progress_violet"] = mat(
    "RX_progress_violet",
    (.37, .16, .92, 1),
    .20,
    .12,
    (.48, .18, 1.0, 1),
    4.2,
)
M["roxana_stone"] = mat("RX_roxana_stone", (.57, .46, .32, 1), .76, .0)
M["roxana_stone_dark"] = mat("RX_roxana_stone_dark", (.34, .27, .19, 1), .82, .0)
M["roxana_stone_light"] = mat("RX_roxana_stone_light", (.73, .62, .46, 1), .70, .0)

log("build", f"grilla 0.5 m: {len(PRIMARY_BY_ID)} recintos primarios, 0 solapes")
add_school_base()
room_roots = {}
for room_id, label, center, size, accent in ROOMS:
    room_roots[room_id] = room_shell(room_id, label, center, size, accent)

centers = {room_id: center for room_id, _, center, _, _ in ROOMS}
add_office(room_roots["direccion"], centers["direccion"])
room_roots["direccion"].location.z = DIRECTION_FLOOR_RISE
box("ROOM_direccion__foundation", (0, centers["direccion"][1], -.43), (11.0, 7.0, 1.06), M["stone_dark"], room_roots["direccion"], .08)
add_electronics(room_roots["electronica"], centers["electronica"])
add_hall(room_roots["hall"], centers["hall"])
add_classroom(room_roots["programacion"], centers["programacion"], programming=True)
add_classroom(room_roots["fisica"], centers["fisica"], physics=True)
add_reception(room_roots["preceptoria"], centers["preceptoria"])
add_visitors(room_roots["visitantes"], centers["visitantes"])
add_classroom(room_roots["matematica"], centers["matematica"], math_room=True)

validate_school_geometry()
setup_camera_and_lights()
configure_scene()
if BLOCKOUT:
    render_blockout()
    print(f"ROXANA_SCHOOL_BLOCKOUT_READY {OUT / 'school-blockout.png'}")
    raise SystemExit(0)
apply_modifiers_and_densify()
join_scene()
report_budget()
bake_vertex_colours()
flatten_materials()
export_glb()
render_previews()
print(f"ROXANA_SCHOOL_READY {OUT / 'instituto-roxana.glb'}")
