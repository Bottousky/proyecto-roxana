#!/usr/bin/env python3
"""Generate Ohmdal Arc I room bases with mmx. Lore-only; no old artwork refs."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "raw"
OUT.mkdir(parents=True, exist_ok=True)

STYLE = (
    "16-bit SNES RPG pixel art, top-down 3/4 camera, 48px tiles, empty gameplay map. "
    "Ohmdal: dormant electrical city, worn not ruined. Materials: pale eroded stone, "
    "oxidized copper with NO glow, still water, ceramic, workshop wood, instrument glass. "
    "Afternoon, taupe stone, brown copper, umber wood, dusty sky. Clear walkable floor."
)
NEGATIVE = "no people, text, UI, watermark, glow, lightning, neon, cyberpunk, clutter maze"


def room(prefix: str, w: int, h: int, seed: int, body: str) -> dict:
    prompt = f"{STYLE} {body.strip()} Avoid: {NEGATIVE}"
    if len(prompt) >= 1500:
        raise ValueError(f"{prefix} prompt is {len(prompt)} chars (max 1499)")
    return {"prefix": prefix, "w": w, "h": h, "seed": seed, "prompt": prompt}


JOBS = [
    room(
        "plaza_base", 1920, 1080, 2101,
        "Plaza de Cuenca de Ohm, 1920x1080 courtyard. Stone merlons on perimeter, corners are walls. "
        "N-S paved axis 160px wide at x=960 full height. E-W paved band 160px at y=540 full width. "
        "Four empty paved squares NW NE SW SE. NE: Taller de Lumen stone workshop facade, east arch. "
        "North: closed monumental Puerta de Ohm arch. South: arch to terraces. West: two stacked arches "
        "(upper castle, lower forge). Center-south: empty ceramic-copper Ohm pedestal, no statue, no bell. "
        "SW: Portal Omega stone-copper frame. Four small obelisks. Unlit lamps. Copper in paving.",
    ),
    room(
        "taller_base", 1920, 1080, 2102,
        "Taller de Lumen, closed interior workshop. Implicit ceiling, west window light from plaza. "
        "South-center doorway is the only exit. Walkable wood-stone floor ~75%. West: worn wood workbench "
        "with ceramic trays and glass instruments (Freno bench). Back shelves of insulators and coiled copper. "
        "East: dormant wood-copper generator cabinet, unlit. Dusty afternoon. Human craft, not a fantasy lab.",
    ),
    room(
        "puerta_base", 1920, 1080, 2103,
        "Calzada and Puerta de Ohm, exterior, late afternoon. NORTH: monumental stone gate CLOSED, copper "
        "conduits in jambs, ceramic seals, no cyan glow. SOUTH: paved calzada arch back to plaza, bottom-center. "
        "Center: small still-water stone basin the player walks around, gap to north threshold. "
        "Walkable cobble in lower two thirds. Dry channel hinted beyond the closed leaves. Unlit lamps.",
    ),
    room(
        "manantial_ohm_base", 1920, 1080, 2104,
        "Manantial de Ohm, iconic spring, dusk-cool. Upper-center circular still basin, stone rim, copper "
        "cauce-maestro leaving NW, water DETAINED. South plaza-circle and bottom-center path to the gate. "
        "ENE stone mirador toward a distant dark lake and hinted lighthouse. Walkable south and east of basin; "
        "water is not floor. Low ceramic marker stones, no letters. Misty air over water.",
    ),
    room(
        "castle_gate_base", 1920, 1080, 2105,
        "Patio of Castillo de la Red, fortified distribution court, not a generic castle. East: monumental "
        "portcullis toward Plaza. NW: closed gallery door. South: path toward Forja, sootier stone. Broad "
        "walkable court. Copper conduits in pavement split toward neighborhood paths. Institutional masonry, "
        "repeatable modules, oxidized seals, inspection cabinets. Unlit work lamps. No heraldry flags.",
    ),
    room(
        "castle_gallery_base", 1920, 1080, 2106,
        "Galeria del Castillo, institutional hall. N-S nave. South door to patio, north door deeper in. "
        "Three stone pedestals in a row, each with a dormant unlit copper lamp (district chain). Repeatable "
        "masonry, parchment-amber accents, copper trunks in walls. Walkable central floor, side cabinets.",
    ),
    room(
        "castle_branches_base", 1920, 1080, 2107,
        "Ramales del Castillo, interior. Center: massive oxidized copper trunk splitting into ramales toward "
        "wall mouths, dormant, no glow. South door from gallery, north door to Heart. Walkable ring around "
        "the trunk island. Ceramic fuses and disconnects as readable hardware. Institutional stone.",
    ),
    room(
        "castle_heart_base", 1920, 1080, 2108,
        "Corazon del Castillo, master distributor interior. North wall: three unlit district lamp alcoves. "
        "Center dais: copper distributor mosaic, dormant. South door bottom-center to ramales. Walkable ring. "
        "Floor mosaic of three neighborhoods. Empty low south tables for stones/fuses. Serious, repetitive.",
    ),
    room(
        "forge_yard_base", 1920, 1080, 2109,
        "Patio de la Forja, industrial yard. East gate to Plaza. WN infirmary/forge arch. NE path to Castillo. "
        "Chimneys, hammer racks, still tepid water channel. Heat-dark stone, wood scaffolds, oxidized bus bars. "
        "COLD: no fire, no embers. Walkable dirt-and-stone yard.",
    ),
    room(
        "forge_infirmary_base", 1920, 1080, 2110,
        "Enfermeria de la Forja, protection corridor. West door to yard, east door to long channel, both mid-low. "
        "North wall: ceramic fuses and copper disconnects. Walkable south/center. Wood benches, ceramic trays. "
        "Electrical protection, not a hospital. Warm-dark interior, window slits. No fire.",
    ),
    room(
        "forge_longchannel_base", 1920, 1080, 2111,
        "Canal Largo of the Forja, east-west industrial run. West door infirmary, east door hall. Long cold "
        "copper-stone heat channel along the north wall. Distant unlit furnace silhouette. Narrow walkable "
        "band lower-middle. Soot, dust, oxidized copper. Embers OFF.",
    ),
    room(
        "forge_hall_base", 1920, 1080, 2112,
        "Nave de la Forja. West door from long channel. Three machines to walk around: west bellows, "
        "south-center hammer/anvil, east hearth COLD and dark. South empty wooden trays. West-south dormant "
        "tablero-bus cabinet. Darker stone near hearth. No fire, no people.",
    ),
    room(
        "terraces_top_base", 1920, 1080, 2113,
        "Terraza alta, stepped irrigation looking south down the valley. North path to Plaza, south stairs to "
        "mid terrace. Center high sluice of wood-stone-copper CLOSED, dry channel. Stepped hillside, dry earth, "
        "empty ceramic channels. Afternoon dust. More sky and valley to the south. No flowing water.",
    ),
    room(
        "terraces_mid_base", 1920, 1080, 2114,
        "Terraza media. North path up, south path down, both center. Left irrigation bed damper dirt; right bed "
        "cracked dry — unfair split, water DETAINED. Walkable path between beds. Stone retaining walls, empty "
        "ceramic channels. No flowing water.",
    ),
    room(
        "terraces_mural_base", 1920, 1080, 2115,
        "Terraza del mural. North wall: weathered ceramic-stone mural of tangled channels (Marana), no letters. "
        "Center: distinctive Piedra Unica on a plinth and a small cistern. West path to mid terrace, south path "
        "to aqueduct. Walkable around mural, not through it. Dry afternoon.",
    ),
    room(
        "terraces_aqueduct_base", 1920, 1080, 2116,
        "Acueducto, three-level mouth toward the lake. North path from mural. East opening to lighthouse shore. "
        "Three stacked stone-ceramic channels high/mid/low, EMPTY and dry. Walkable bridges. Distant dark lake "
        "SE, lighthouse tower hinted far right. No flowing water.",
    ),
    room(
        "lighthouse_hall_base", 1920, 1080, 2117,
        "Hall del Faro, lake shore. West door from aqueduct, east door to farero bench. Center: dead bronze-glass "
        "copper lighthouse machine, dark polished lens OFF. North: dark still inland lake. Walkable stone in "
        "lower two thirds. Twilight. Glass relatively bright vs stone. No beam.",
    ),
    room(
        "lighthouse_bench_base", 1920, 1080, 2118,
        "Archivo del Farero, memory workshop. West door from hall, east door to clock tower. Center: wood-bronze-"
        "glass instrument table, dormant. Back shelves of glass instruments, ceramic jars, coiled copper, "
        "unreadable notebook texture. Walkable around table. Cool lake window light.",
    ),
    room(
        "clock_tower_base", 1920, 1080, 2119,
        "Torre del Reloj. West door from bench, east door to lantern climb. Upper-center huge stopped clock face "
        "of bronze, glass, stone, frozen hands, no glow. Walkable stone platform in lower third around tower base. "
        "Gears behind glass, dormant. Twilight sky.",
    ),
    room(
        "lighthouse_lantern_base", 1920, 1080, 2120,
        "Linterna del Faro, high balcony over dark lake. West-lower door from clock tower. Center-left enormous "
        "glass-bronze lens OFF, still the brightest material. Right half: vast inland lake and distant basin "
        "skyline. South-lower empty stone landing (no boat). Walkable balcony on left two-fifths. Twilight. No beam.",
    ),
    room(
        "plaza_castle_open", 1920, 1080, 2121,
        "Same Plaza de Ohm courtyard: merlons, N-S and E-W paved cross, Taller east, empty Ohm pedestal, Portal "
        "Omega SW, four obelisks. WEST castle arch is OPEN, portcullis raised, through-view into cooler "
        "institutional masonry. Other arches unchanged. Afternoon, electrically OFF, no bell, no people.",
    ),
    room(
        "puerta_open", 1920, 1080, 2122,
        "Same Calzada/Puerta de Ohm courtyard, but north monumental leaves OPEN, revealing north calzada toward "
        "a dry manantial channel. No cyan glow. South plaza arch remains. Center still-water basin with walk-around "
        "gap. Late afternoon. No people.",
    ),
    room(
        "forge_hall_hearth_on", 1920, 1080, 2123,
        "Same Nave de la Forja with three machines, but east hearth LIT with contained workshop fire and warm "
        "light. Bellows and hammer remain. Fire is craft, not magic. No neon copper. No people.",
    ),
    room(
        "prop_forge_hearth_on", 1024, 1024, 2124,
        "Isolated 16-bit SNES pixel-art forge hearth ON, three-quarter top-down. Stone mouth, contained orange "
        "fire, bronze frame, oxidized copper pipe. Flat MAGENTA #FF00FF background, no shadow, no floor, no people. "
        "Object only with margin.",
    ),
    room(
        "prop_lighthouse_lens_on", 1024, 1024, 2125,
        "Isolated 16-bit SNES pixel-art lighthouse fresnel lens ON, bronze frame, cool white-cyan instrument light. "
        "Three-quarter top-down. Flat MAGENTA #FF00FF background, no shadow, no beam leaving frame, no people.",
    ),
    room(
        "prop_lighthouse_dock", 1024, 512, 2126,
        "Isolated 16-bit SNES pixel-art stone-and-wood lake dock/landing, three-quarter top-down, weathered. "
        "No boat, no people. Flat MAGENTA #FF00FF background, no shadow.",
    ),
    room(
        "prop_lighthouse_boat", 768, 512, 2127,
        "Isolated 16-bit SNES pixel-art small wooden lake boat with copper fittings, three-quarter top-down, empty. "
        "Flat MAGENTA #FF00FF background, no shadow, no people, no logos.",
    ),
]


def run_job(job: dict) -> None:
    prompt_path = ROOT / "prompts" / f"{job['prefix']}.prompt.txt"
    prompt_path.parent.mkdir(parents=True, exist_ok=True)
    prompt_path.write_text(job["prompt"], encoding="utf-8")
    dest_dir = OUT / job["prefix"]
    dest_dir.mkdir(parents=True, exist_ok=True)
    mmx = Path(r"C:\Users\manue\AppData\Roaming\npm\node_modules\mmx-cli\dist\mmx.mjs")
    cmd = [
        "node", str(mmx), "image", "generate",
        "--prompt", job["prompt"],
        "--width", str(job["w"]),
        "--height", str(job["h"]),
        "--seed", str(job["seed"]),
        "--out-dir", str(dest_dir),
        "--out-prefix", job["prefix"],
        "--non-interactive", "--yes", "--output", "json",
    ]
    print(f"==> {job['prefix']} {job['w']}x{job['h']} chars={len(job['prompt'])}", flush=True)
    proc = subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True)
    (dest_dir / "mmx.stdout.json").write_text(proc.stdout or "", encoding="utf-8")
    if proc.returncode != 0:
        (dest_dir / "mmx.stderr.txt").write_text(proc.stderr or "", encoding="utf-8")
        raise RuntimeError(f"{job['prefix']} failed ({proc.returncode}): {(proc.stderr or proc.stdout)[-800:]}")
    print((proc.stdout or "")[-400:], flush=True)


def main() -> int:
    names = sys.argv[1:]
    jobs = JOBS if not names else [j for j in JOBS if j["prefix"] in names]
    if names and len(jobs) != len(names):
        missing = set(names) - {j["prefix"] for j in jobs}
        print("unknown jobs:", missing)
        return 2
    failed = []
    for job in jobs:
        try:
            run_job(job)
        except Exception as exc:
            print(f"FAIL {job['prefix']}: {exc}", flush=True)
            failed.append(job["prefix"])
    (ROOT / "last-run.json").write_text(json.dumps({"failed": failed}, indent=2), encoding="utf-8")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
