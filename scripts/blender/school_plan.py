"""Single source of truth for the Instituto Roxana top-down floor plan.

The plan uses world-space rectangles snapped to a 0.5 m grid. Primary rooms
may touch along complete or partial edges, but their floor areas may never
overlap. Shared boundaries are derived from the rectangles instead of being
authored twice.
"""

from __future__ import annotations

from dataclasses import dataclass
from itertools import combinations


GRID_UNIT = 0.5
EPSILON = 1e-6


@dataclass(frozen=True)
class RoomPlan:
    room_id: str
    label: str
    x0: float
    y0: float
    x1: float
    y1: float
    accent: str
    embedded: bool = False

    @property
    def center(self) -> tuple[float, float]:
        return ((self.x0 + self.x1) / 2, (self.y0 + self.y1) / 2)

    @property
    def size(self) -> tuple[float, float]:
        return (self.x1 - self.x0, self.y1 - self.y0)


@dataclass(frozen=True)
class SharedBoundary:
    room_a: str
    room_b: str
    axis: str
    coordinate: float
    start: float
    end: float

    @property
    def length(self) -> float:
        return self.end - self.start


@dataclass(frozen=True)
class DoorPlan:
    room_a: str
    room_b: str
    axis: str
    coordinate: float
    center: float
    width: float = 1.8


# Primary footprints form one compact, non-overlapping orthogonal complex.
# Coordinates are boundary lines, not mesh centres.
PRIMARY_ROOMS: tuple[RoomPlan, ...] = (
    RoomPlan("matematica", "MATEMÁTICA", -24.0, 6.0, -10.0, 16.0, "amber"),
    RoomPlan("direccion", "DIRECCIÓN", -5.5, 10.0, 5.5, 17.0, "wine"),
    RoomPlan("fisica", "FÍSICA", 10.0, 6.0, 24.0, 16.0, "indigo"),
    RoomPlan("electronica", "ELECTRÓNICA", -24.0, -4.0, -10.0, 6.0, "teal"),
    RoomPlan("hall", "INSTITUTO ROXANA", -10.0, -12.0, 10.0, 10.0, "stone"),
    RoomPlan("programacion", "PROGRAMACIÓN", 10.0, -4.0, 24.0, 6.0, "cyan"),
    RoomPlan("preceptoria", "PRECEPTORÍA", -22.0, -12.0, -10.0, -4.0, "green"),
    RoomPlan("visitantes", "ANFITEATRO", 10.0, -12.0, 22.0, -4.0, "coral"),
)

# These are semantic thresholds inside the Hall, not independent footprints.
ANNEX_ROOMS: tuple[RoomPlan, ...] = (
    RoomPlan("audiovisual", "AUDIOVISUAL", -10.0, -5.0, -9.0, -3.0, "green", True),
    RoomPlan("biblioteca", "BIBLIOTECA", -10.0, 2.5, -9.0, 4.5, "wood", True),
    RoomPlan("logros", "SALA DE LOGROS", 9.0, 2.5, 10.0, 4.5, "gold", True),
)

ROOMS: tuple[RoomPlan, ...] = ANNEX_ROOMS + PRIMARY_ROOMS
ROOM_BY_ID = {room.room_id: room for room in ROOMS}
PRIMARY_BY_ID = {room.room_id: room for room in PRIMARY_ROOMS}
ANNEX_ROOM_IDS = {room.room_id for room in ANNEX_ROOMS}
HALL_CENTER = PRIMARY_BY_ID["hall"].center
HALL_SIZE = PRIMARY_BY_ID["hall"].size


REQUIRED_CONNECTIONS = {
    frozenset(("matematica", "electronica")),
    frozenset(("matematica", "hall")),
    frozenset(("electronica", "hall")),
    frozenset(("electronica", "preceptoria")),
    frozenset(("preceptoria", "hall")),
    frozenset(("direccion", "hall")),
    frozenset(("fisica", "programacion")),
    frozenset(("fisica", "hall")),
    frozenset(("programacion", "hall")),
    frozenset(("programacion", "visitantes")),
    frozenset(("visitantes", "hall")),
}


DOORS: tuple[DoorPlan, ...] = (
    DoorPlan("matematica", "electronica", "horizontal", 6.0, -17.0),
    DoorPlan("electronica", "hall", "vertical", -10.0, 1.0, 2.2),
    DoorPlan("electronica", "preceptoria", "horizontal", -4.0, -16.0),
    DoorPlan("preceptoria", "hall", "vertical", -10.0, -8.0),
    DoorPlan("direccion", "hall", "horizontal", 10.0, 0.0, 2.4),
    DoorPlan("fisica", "programacion", "horizontal", 6.0, 17.0),
    DoorPlan("programacion", "hall", "vertical", 10.0, 1.0, 2.2),
    DoorPlan("programacion", "visitantes", "horizontal", -4.0, 16.0),
    DoorPlan("visitantes", "hall", "vertical", 10.0, -8.0),
)


def room_tuples() -> list[tuple[str, str, tuple[float, float], tuple[float, float], str]]:
    return [
        (room.room_id, room.label, room.center, room.size, room.accent)
        for room in ROOMS
    ]


def positive_overlap(a: RoomPlan, b: RoomPlan) -> tuple[float, float]:
    return (
        max(0.0, min(a.x1, b.x1) - max(a.x0, b.x0)),
        max(0.0, min(a.y1, b.y1) - max(a.y0, b.y0)),
    )


def shared_boundaries() -> list[SharedBoundary]:
    boundaries: list[SharedBoundary] = []
    for a, b in combinations(PRIMARY_ROOMS, 2):
        y_start = max(a.y0, b.y0)
        y_end = min(a.y1, b.y1)
        if y_end - y_start > EPSILON:
            if abs(a.x1 - b.x0) <= EPSILON:
                boundaries.append(SharedBoundary(a.room_id, b.room_id, "vertical", a.x1, y_start, y_end))
            elif abs(b.x1 - a.x0) <= EPSILON:
                boundaries.append(SharedBoundary(a.room_id, b.room_id, "vertical", a.x0, y_start, y_end))

        x_start = max(a.x0, b.x0)
        x_end = min(a.x1, b.x1)
        if x_end - x_start > EPSILON:
            if abs(a.y1 - b.y0) <= EPSILON:
                boundaries.append(SharedBoundary(a.room_id, b.room_id, "horizontal", a.y1, x_start, x_end))
            elif abs(b.y1 - a.y0) <= EPSILON:
                boundaries.append(SharedBoundary(a.room_id, b.room_id, "horizontal", a.y0, x_start, x_end))
    return boundaries


def exposed_front_segments(room_id: str) -> list[tuple[float, float]]:
    """Return uncovered segments of a room's south boundary.

    A north wall of a southern neighbour owns every shared segment. This keeps
    a full wall and a low curb from occupying the same boundary.
    """

    room = PRIMARY_BY_ID[room_id]
    covered: list[tuple[float, float]] = []
    for other in PRIMARY_ROOMS:
        if other.room_id == room_id or abs(other.y1 - room.y0) > EPSILON:
            continue
        start = max(room.x0, other.x0)
        end = min(room.x1, other.x1)
        if end - start > EPSILON:
            covered.append((start, end))

    segments = [(room.x0, room.x1)]
    for cut_start, cut_end in covered:
        next_segments: list[tuple[float, float]] = []
        for start, end in segments:
            if cut_end <= start + EPSILON or cut_start >= end - EPSILON:
                next_segments.append((start, end))
                continue
            if cut_start > start + EPSILON:
                next_segments.append((start, cut_start))
            if cut_end < end - EPSILON:
                next_segments.append((cut_end, end))
        segments = next_segments
    return segments


def validate_plan() -> list[str]:
    issues: list[str] = []
    for room in PRIMARY_ROOMS:
        for coordinate in (room.x0, room.y0, room.x1, room.y1):
            snapped = round(coordinate / GRID_UNIT) * GRID_UNIT
            if abs(coordinate - snapped) > EPSILON:
                issues.append(f"{room.room_id}: {coordinate} no cae en la grilla de {GRID_UNIT} m")
        if room.x1 <= room.x0 or room.y1 <= room.y0:
            issues.append(f"{room.room_id}: rectángulo inválido")

    for a, b in combinations(PRIMARY_ROOMS, 2):
        overlap_x, overlap_y = positive_overlap(a, b)
        if overlap_x > EPSILON and overlap_y > EPSILON:
            issues.append(
                f"{a.room_id}/{b.room_id}: solape de piso {overlap_x:.2f} × {overlap_y:.2f} m"
            )

    connections = {
        frozenset((boundary.room_a, boundary.room_b))
        for boundary in shared_boundaries()
    }
    for required in sorted(REQUIRED_CONNECTIONS, key=lambda item: sorted(item)):
        if required not in connections:
            issues.append(f"falta conexión compartida: {' ↔ '.join(sorted(required))}")
    return issues
