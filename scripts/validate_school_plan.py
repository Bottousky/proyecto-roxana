"""Validate the master top-down plan without launching Blender."""

from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BLENDER_SCRIPTS = ROOT / "scripts" / "blender"
sys.path.insert(0, str(BLENDER_SCRIPTS))

from school_plan import (  # noqa: E402
    GRID_UNIT,
    PRIMARY_ROOMS,
    exposed_front_segments,
    shared_boundaries,
    validate_plan,
)


issues = validate_plan()
report = {
    "gridUnitMeters": GRID_UNIT,
    "rooms": [
        {
            "id": room.room_id,
            "bounds": [room.x0, room.y0, room.x1, room.y1],
            "center": list(room.center),
            "size": list(room.size),
            "exposedFrontSegments": exposed_front_segments(room.room_id),
        }
        for room in PRIMARY_ROOMS
    ],
    "sharedBoundaries": [
        {
            "rooms": [boundary.room_a, boundary.room_b],
            "axis": boundary.axis,
            "coordinate": boundary.coordinate,
            "start": boundary.start,
            "end": boundary.end,
            "length": boundary.length,
        }
        for boundary in shared_boundaries()
    ],
    "issues": issues,
}

output = ROOT / "artifacts" / "validation" / "school-plan-validation.json"
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf8")

if issues:
    for issue in issues:
        print(f"ERROR: {issue}")
    raise SystemExit(1)

print(
    f"Plano válido: {len(PRIMARY_ROOMS)} salas, "
    f"{len(report['sharedBoundaries'])} límites compartidos, 0 solapes."
)
print(output)
