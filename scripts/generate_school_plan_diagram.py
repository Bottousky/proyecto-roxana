"""Generate the master SVG top-down plan from school_plan.py."""

from __future__ import annotations

import html
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BLENDER_SCRIPTS = ROOT / "scripts" / "blender"
sys.path.insert(0, str(BLENDER_SCRIPTS))

from school_plan import (  # noqa: E402
    ANNEX_ROOMS,
    DOORS,
    GRID_UNIT,
    PRIMARY_ROOMS,
    validate_plan,
)


issues = validate_plan()
if issues:
    raise SystemExit("\n".join(issues))

CANVAS_W = 1500
CANVAS_H = 1050
PLOT_X = 110
PLOT_Y = 155
PLOT_W = 1180
PLOT_H = 770
MIN_X, MAX_X = -27.0, 27.0
MIN_Y, MAX_Y = -15.0, 20.0
SCALE = min(PLOT_W / (MAX_X - MIN_X), PLOT_H / (MAX_Y - MIN_Y))

COLORS = {
    "amber": "#c88938",
    "wine": "#8f3948",
    "indigo": "#4b568d",
    "teal": "#277b72",
    "stone": "#8b7259",
    "cyan": "#257a96",
    "green": "#47765b",
    "coral": "#a65344",
}


def sx(x: float) -> float:
    return PLOT_X + (x - MIN_X) * SCALE


def sy(y: float) -> float:
    return PLOT_Y + (MAX_Y - y) * SCALE


def line(x1: float, y1: float, x2: float, y2: float, class_name: str) -> str:
    return (
        f'<line x1="{sx(x1):.2f}" y1="{sy(y1):.2f}" '
        f'x2="{sx(x2):.2f}" y2="{sy(y2):.2f}" class="{class_name}"/>'
    )


def room_rect(room, class_name: str, fill: str) -> str:
    return (
        f'<rect x="{sx(room.x0):.2f}" y="{sy(room.y1):.2f}" '
        f'width="{(room.x1 - room.x0) * SCALE:.2f}" '
        f'height="{(room.y1 - room.y0) * SCALE:.2f}" '
        f'class="{class_name}" fill="{fill}"/>'
    )


def edge_key(x1: float, y1: float, x2: float, y2: float) -> tuple[int, int, int, int]:
    scale = int(round(1 / GRID_UNIT))
    a = (int(round(x1 * scale)), int(round(y1 * scale)))
    b = (int(round(x2 * scale)), int(round(y2 * scale)))
    return (*a, *b) if a <= b else (*b, *a)


edges: Counter[tuple[int, int, int, int]] = Counter()
for room in PRIMARY_ROOMS:
    x = room.x0
    while x < room.x1 - 1e-6:
        nx = min(room.x1, x + GRID_UNIT)
        edges[edge_key(x, room.y0, nx, room.y0)] += 1
        edges[edge_key(x, room.y1, nx, room.y1)] += 1
        x = nx
    y = room.y0
    while y < room.y1 - 1e-6:
        ny = min(room.y1, y + GRID_UNIT)
        edges[edge_key(room.x0, y, room.x0, ny)] += 1
        edges[edge_key(room.x1, y, room.x1, ny)] += 1
        y = ny


parts: list[str] = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1050" viewBox="0 0 1500 1050">',
    """
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="7" stdDeviation="10" flood-color="#000" flood-opacity=".38"/>
      </filter>
      <style>
        text { font-family: Inter, "Segoe UI", sans-serif; }
        .minor-grid { stroke:#233045; stroke-width:.7; opacity:.38; }
        .major-grid { stroke:#34445f; stroke-width:1.3; opacity:.58; }
        .axis { stroke:#70809c; stroke-width:1.8; opacity:.75; }
        .room { fill-opacity:.72; }
        .annex { fill:#0f1724; fill-opacity:.76; stroke:#e6b758; stroke-width:2; stroke-dasharray:8 7; }
        .wall-outer { stroke:#eee4d2; stroke-width:7; stroke-linecap:square; }
        .wall-shared { stroke:#58d1c3; stroke-width:7; stroke-linecap:square; }
        .door-gap { stroke:#101621; stroke-width:11; stroke-linecap:butt; }
        .door { stroke:#f4bd54; stroke-width:5; stroke-linecap:round; }
        .room-title { fill:#fff8e9; font-size:18px; font-weight:800; text-anchor:middle; letter-spacing:1.5px; }
        .room-size { fill:#d2c7b4; font-size:13px; font-weight:600; text-anchor:middle; }
        .coordinate { fill:#7f8da7; font-size:11px; }
        .legend { fill:#c9d2df; font-size:15px; }
        .note { fill:#94a4ba; font-size:14px; }
      </style>
    </defs>
    <rect width="1500" height="1050" fill="#090e18"/>
    <rect x="55" y="95" width="1390" height="885" rx="24" fill="#111a29" stroke="#29364b" filter="url(#shadow)"/>
    <text x="78" y="52" fill="#f6e8d2" font-size="30" font-weight="800">Instituto Roxana — planta cenital maestra</text>
    <text x="79" y="80" fill="#8fa0b9" font-size="16">Grilla absoluta 0,5 m · pisos sin solapes · paredes compartidas con una sola línea de propiedad</text>
    """,
]

# Grid.
x = MIN_X
while x <= MAX_X + 1e-6:
    grid_class = "major-grid" if abs((x / 2) - round(x / 2)) < 1e-6 else "minor-grid"
    parts.append(line(x, MIN_Y, x, MAX_Y, grid_class))
    x += GRID_UNIT
y = MIN_Y
while y <= MAX_Y + 1e-6:
    grid_class = "major-grid" if abs((y / 2) - round(y / 2)) < 1e-6 else "minor-grid"
    parts.append(line(MIN_X, y, MAX_X, y, grid_class))
    y += GRID_UNIT
parts.append(line(0, MIN_Y, 0, MAX_Y, "axis"))
parts.append(line(MIN_X, 0, MAX_X, 0, "axis"))

# Floors.
for room in PRIMARY_ROOMS:
    parts.append(room_rect(room, "room", COLORS[room.accent]))

# One wall segment per grid edge. Count 2 means a shared boundary.
scale_to_world = GRID_UNIT
for (x1, y1, x2, y2), count in edges.items():
    parts.append(
        line(
            x1 * scale_to_world,
            y1 * scale_to_world,
            x2 * scale_to_world,
            y2 * scale_to_world,
            "wall-shared" if count == 2 else "wall-outer",
        )
    )

# Doors cut a visible gap in the unique wall and lay one threshold over it.
for door in DOORS:
    half = door.width / 2
    if door.axis == "horizontal":
        parts.append(line(door.center - half, door.coordinate, door.center + half, door.coordinate, "door-gap"))
        parts.append(line(door.center - half, door.coordinate, door.center + half, door.coordinate, "door"))
    else:
        parts.append(line(door.coordinate, door.center - half, door.coordinate, door.center + half, "door-gap"))
        parts.append(line(door.coordinate, door.center - half, door.coordinate, door.center + half, "door"))

# Embedded semantic zones.
for annex in ANNEX_ROOMS:
    parts.append(room_rect(annex, "annex", "#0f1724"))
    cx, cy = annex.center
    parts.append(
        f'<text x="{sx(cx):.2f}" y="{sy(cy):.2f}" class="room-size" '
        f'transform="rotate(-90 {sx(cx):.2f} {sy(cy):.2f})">{html.escape(annex.label)}</text>'
    )

# Labels and dimensions.
for room in PRIMARY_ROOMS:
    cx, cy = room.center
    title_y = sy(cy) - 4
    parts.append(f'<text x="{sx(cx):.2f}" y="{title_y:.2f}" class="room-title">{html.escape(room.label)}</text>')
    parts.append(
        f'<text x="{sx(cx):.2f}" y="{title_y + 24:.2f}" class="room-size">'
        f'{room.size[0]:g} × {room.size[1]:g} m</text>'
    )

# Entry and north arrow.
parts.extend(
    [
        line(-2.2, -12, 2.2, -12, "door-gap"),
        line(-2.2, -12, 2.2, -12, "door"),
        f'<text x="{sx(0):.2f}" y="{sy(-13.2):.2f}" class="room-title">ENTRADA</text>',
        '<path d="M1370 185 L1390 130 L1410 185 L1390 171 Z" fill="#f4bd54"/>',
        '<text x="1390" y="208" text-anchor="middle" fill="#f4bd54" font-size="16" font-weight="800">NORTE</text>',
    ]
)

# Legend.
legend_y = 1002
parts.extend(
    [
        f'<line x1="80" y1="{legend_y}" x2="130" y2="{legend_y}" class="wall-outer"/>',
        f'<text x="145" y="{legend_y + 5}" class="legend">muro exterior</text>',
        f'<line x1="335" y1="{legend_y}" x2="385" y2="{legend_y}" class="wall-shared"/>',
        f'<text x="400" y="{legend_y + 5}" class="legend">muro compartido, generado una vez</text>',
        f'<line x1="745" y1="{legend_y}" x2="795" y2="{legend_y}" class="door"/>',
        f'<text x="810" y="{legend_y + 5}" class="legend">puerta / umbral</text>',
        f'<text x="1115" y="{legend_y + 5}" class="note">8 salas · 11 límites compartidos · 0 solapes</text>',
    ]
)

parts.append("</svg>")

output = ROOT / "docs" / "diagramas-instituto" / "plano-cenital-maestro.svg"
output.write_text("\n".join(parts) + "\n", encoding="utf8")
print(output)

