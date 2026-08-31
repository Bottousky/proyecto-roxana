#!/usr/bin/env python3
"""Write per-room prompt files. Native canvas per room; viewport is 960x540."""
from pathlib import Path

OUT = Path(__file__).resolve().parent / "prompts"
OUT.mkdir(parents=True, exist_ok=True)

STYLE = (
    "16-bit SNES/GBA RPG pixel art, top-down three-quarter camera, ~48px tiles, "
    "empty gameplay map of Ohmdal. Electrical city detained not ruined. Six materials "
    "only: pale eroded stone, oxidized copper with NO glow, still detained water, "
    "ceramic insulators, workshop wood, instrument glass. Afternoon light, taupe "
    "stone, brown copper, umber wood, dusty sky. Clear walkable floor, not a clutter maze. "
    "The image IS the whole map: 1 pixel = 1 game pixel. Camera will pan. Do not compose "
    "a single TV screenshot with letterboxing."
)
AVOID = (
    "Avoid: people, animals, Ohm character, hanging bell, text, letters, UI, HUD, "
    "watermark, neon, lightning, magic glow, cyberpunk, isometric 3D, photoreal, "
    "oil painting, HD-2D cinematic, generic medieval castle flags, 16:9 letterbox bars."
)

ROOMS = [
    {
        "file": "01-plaza-1920-base.txt",
        "save": "plaza-1920-base.png",
        "size": "1920x1080",
        "title": "Plaza de la Cuenca de Ohm (hub)",
        "full": """
CANVAS 1920x1080. GAMEPLAY FLOORPLAN first. Walled courtyard, Ohmdal's civic heart. Larger than one screen; the player walks a plus-sign of cobble while the camera pans.

PERIMETER: continuous stone merlons. Corners are WALLS, not floor.

PAVED CROSS:
- North-south paved axis ~160px wide at x=960, FULL height 0..1080.
- East-west paved band ~160px tall at y=540, FULL width 0..1920.
Four quieter paved squares NW NE SW SE.

LANDMARK — Ohm pedestal: empty circular ceramic-and-oxidized-copper pedestal, no statue, no character, no hanging bell. On the N-S axis slightly SOUTH of center (x=960, y=640). Walkable ring. Empty air ABOVE the pedestal (runtime bell later).

EXITS:
- NORTH center: monumental Puerta de Ohm, CLOSED.
- SOUTH center: arch to dry terraces.
- EAST: Taller de Lumen as a REAL workshop HOUSE occupying the east third; east-west band ends in a workshop doorway.
- WEST: TWO stacked arches. Upper = Castillo (cooler stone). Lower = Forja (sootier). Both CLOSED.
SW: Portal Omega empty stone-copper frame. Four unlit obelisks. Unlit lamps. Copper in paving.
NOT a generic castle courtyard.
""",
        "mmx": (
            "CANVAS 1920x1080 Plaza de Ohm walled courtyard, merlons, corners are walls. "
            "N-S paved axis 160px at x=960 full height. E-W band 160px at y=540 full width. "
            "Empty ceramic-copper Ohm pedestal at x=960 y=640, walkable ring, no statue, no bell. "
            "North CLOSED Puerta de Ohm. South terraces arch. East Taller workshop HOUSE. "
            "West TWO stacked arches castle-above forge-below CLOSED. SW Portal Omega frame. "
            "Four unlit obelisks. Civic hub larger than one screen."
        ),
    },
    {
        "file": "02-plaza-castillo-abierto.txt",
        "save": "plaza-castillo-abierto.png",
        "size": "1920x1080",
        "title": "Plaza — mismo plano, arco del Castillo ABIERTO",
        "full": """
CANVAS 1920x1080. EXACT SAME Plaza floorplan, camera, merlons, paved cross, Taller house, Ohm pedestal at (960,640), Portal Omega SW, closed north Puerta, closed south arch, closed lower west forge arch.

ONLY CHANGE: UPPER west castle arch OPEN. Portcullis raised. Through-view into cooler institutional masonry. No glow, no people, no bell.
""",
        "mmx": (
            "CANVAS 1920x1080 same Plaza de Ohm. Empty Ohm pedestal x=960 y=640. ONLY the upper west "
            "castle arch is OPEN with raised portcullis. North Puerta CLOSED. Lower west forge arch CLOSED. "
            "No people, no bell, no glow."
        ),
    },
    {
        "file": "03-taller_base.txt",
        "save": "taller_base.png",
        "size": "960x540",
        "title": "Taller de Lumen (interior, una pantalla)",
        "full": """
CANVAS 960x540 — one-screen interior, like a Pokémon house. Closed workshop of Taller de Lumen. Human craft, not a wizard lab.

Implicit ceiling. Warm dusty afternoon from a WEST window. ONLY EXIT: south-center doorway back to Plaza. No extra doors.

Walkable wood+stone floor ~75% clear.
WEST: worn wood workbench, ceramic trays, glass instruments.
BACK: shelves of insulators, coiled copper, wooden boxes.
EAST: dormant wood-copper generator cabinet, unlit. No fire, no glowing copper.
""",
        "mmx": (
            "CANVAS 960x540 Taller de Lumen one-screen interior. West window light. ONLY south-center doorway. "
            "Walkable wood-stone floor ~75%. West workbench with ceramic trays and glass instruments. Back shelves "
            "of insulators and coiled copper. East dormant generator cabinet. Human craft, not a fantasy lab."
        ),
    },
    {
        "file": "04-puerta_base.txt",
        "save": "puerta_base.png",
        "size": "960x1620",
        "title": "Calzada / Puerta de Ohm — CERRADA (mapa alto)",
        "full": """
CANVAS 960x1620 — TALL map, three screens stacked (Pokemon route). This is a NORTH-SOUTH road, not a square courtyard. Do not compose 16:9.

SOUTH third (y~1080..1620): cobble arriving from Plaza. Bottom-center arch back to Plaza.

MIDDLE third (y~540..1080): LANDMARK — monumental stone Puerta de Ohm, leaves CLOSED. Copper in jambs, ceramic seals, NO cyan glow. A small still-water basin SOUTH of the threshold; player walks AROUND it. Water is not floor.

NORTH third (y~0..540): calzada continuing toward the Manantial, still behind the CLOSED leaves — hint of dry channel beyond, but the leaves block the way. Unlit lamps along the road.

Walkable cobble is a N-S strip. Perimeter is stone retaining walls, not plaza merlons.
""",
        "mmx": (
            "CANVAS 960x1620 TALL Calzada, three screens high, not 16:9. South third: cobble and bottom-center "
            "arch to Plaza. Middle: monumental Puerta de Ohm CLOSED, copper jambs, small still basin with walk-around. "
            "North third: calzada toward manantial blocked by closed leaves. Unlit lamps. Gate road, not a courtyard."
        ),
    },
    {
        "file": "05-puerta_open.txt",
        "save": "puerta_open.png",
        "size": "960x1620",
        "title": "Calzada / Puerta de Ohm — ABIERTA",
        "full": """
CANVAS 960x1620. EXACT SAME tall calzada as the closed version.

ONLY CHANGE: monumental leaves OPEN. The north third is now a walkable calzada toward a dry manantial channel. No cyan glow. No people.
""",
        "mmx": (
            "CANVAS 960x1620 same tall Calzada. North monumental leaves OPEN revealing walkable north road toward "
            "dry manantial channel. South plaza arch remains. Center still-water basin. No cyan glow. No people."
        ),
    },
    {
        "file": "06-manantial_ohm_base.txt",
        "save": "manantial_ohm_base.png",
        "size": "1080x1620",
        "title": "Manantial de Ohm (mapa alto icónico)",
        "full": """
CANVAS 1080x1620 — tall iconic spring, not a square room.

SOUTH third: path from the gate, small plaza-circle, walkable stone.
MIDDLE: approach around the basin rim.
UPPER-CENTER landmark: circular still basin, stone rim, water DETAINED glassy not flowing. Copper cauce-maestro leaving northwest. Water is NOT floor.
ENE: stone mirador toward a distant dark inland lake and hinted lighthouse.

Low ceramic markers with NO letters. Misty dusk-cool air. Cooler than Plaza.
""",
        "mmx": (
            "CANVAS 1080x1620 tall Manantial de Ohm. Upper-center circular still basin, water DETAINED, copper "
            "cauce-maestro NW. South path from the gate. ENE mirador toward distant dark lake and hinted lighthouse. "
            "Walkable south and east of basin. No letters, no people, no glow."
        ),
    },
    {
        "file": "07-castle_gate_base.txt",
        "save": "castle_gate_base.png",
        "size": "1920x1080",
        "title": "Patio del Castillo de la Red",
        "full": """
CANVAS 1920x1080. Fortified DISTRIBUTION COURT, wider than one screen. Institutional masonry, repeatable modules, oxidized seals, inspection cabinets. NOT a fairy-tale castle, NOT flags.

EAST: monumental portcullis toward Plaza.
NW: closed gallery door (deeper in).
SOUTH: sootier path toward Forja.
Broad walkable court. Copper conduits in pavement split toward neighborhood paths. Unlit work lamps. Cooler grey-taupe than Plaza.
""",
        "mmx": (
            "CANVAS 1920x1080 Patio of Castillo de la Red, distribution court not a generic castle. East portcullis "
            "to Plaza. NW closed gallery door. South path to Forja. Broad walkable court. Copper conduits in pavement. "
            "Repeatable institutional masonry, oxidized seals. Unlit lamps. No flags."
        ),
    },
    {
        "file": "08-castle_gallery_base.txt",
        "save": "castle_gallery_base.png",
        "size": "960x1080",
        "title": "Galería del Castillo (nave alta)",
        "full": """
CANVAS 960x1080 — TALL N-S hall, two screens. Not a square room.

SOUTH door to patio (bottom). NORTH door deeper (top).
Landmark: THREE stone pedestals in a row along the nave, each with a dormant unlit copper district lamp.
Walkable central floor. Side cabinets, parchment-amber accents, copper trunks in walls.
Repeatable masonry. No throne, no people, electrically OFF.
""",
        "mmx": (
            "CANVAS 960x1080 tall Galeria del Castillo N-S nave. South door to patio, north door deeper. Three "
            "stone pedestals in a row with dormant unlit copper lamps. Walkable central floor, side cabinets. "
            "Repeatable masonry. No people, no glow."
        ),
    },
    {
        "file": "09-castle_branches_base.txt",
        "save": "castle_branches_base.png",
        "size": "960x1080",
        "title": "Ramales — tronco de cobre",
        "full": """
CANVAS 960x1080. Interior. Landmark MUST dominate: massive oxidized copper TRUNK in the center, splitting into ramales toward wall mouths. Dormant hardware, ceramic fuses. NO glow.

SOUTH door from gallery. NORTH door to Heart.
Walkable RING around the trunk island. The trunk is an obstacle. About branching, not a courtyard.
""",
        "mmx": (
            "CANVAS 960x1080 Ramales interior. Center massive oxidized copper trunk splitting into ramales, dormant. "
            "South door from gallery, north door to Heart. Walkable ring around the trunk island. Ceramic fuses. "
            "Institutional stone. No glow, no people."
        ),
    },
    {
        "file": "10-castle_heart_base.txt",
        "save": "castle_heart_base.png",
        "size": "960x1080",
        "title": "Corazón del Castillo / Repartidor",
        "full": """
CANVAS 960x1080. Master distributor chamber, taller than a single screen.
NORTH WALL: THREE unlit district lamp alcoves.
CENTER dais: copper distributor mosaic, dormant, three-neighborhood floor map.
SOUTH door bottom-center to ramales.
Walkable ring. Empty low south tables. Serious institutional stone. Not a throne room.
""",
        "mmx": (
            "CANVAS 960x1080 Corazon del Castillo. North wall three unlit district lamp alcoves. Center dais copper "
            "distributor mosaic dormant. South door bottom-center. Walkable ring. Empty low tables. No people, no glow."
        ),
    },
    {
        "file": "11-forge_yard_base.txt",
        "save": "forge_yard_base.png",
        "size": "1920x1080",
        "title": "Patio de la Forja (frío)",
        "full": """
CANVAS 1920x1080. Wide industrial YARD. Heat-dark stone, wood scaffolds, oxidized bus bars, chimneys, hammer racks. COLD: no fire, no embers.

EAST gate to Plaza. WN arch to infirmary. NE path to Castillo (cleaner stone).
Walkable dirt-and-stone yard. Still tepid water channel, not flowing. Sootier and darker than Plaza.
""",
        "mmx": (
            "CANVAS 1920x1080 Patio de la Forja industrial yard. East gate to Plaza. WN infirmary arch. NE path to "
            "Castillo. Chimneys, hammer racks, still tepid channel. Heat-dark stone, wood scaffolds. COLD no fire. "
            "Walkable dirt-and-stone. No people."
        ),
    },
    {
        "file": "12-forge_infirmary_base.txt",
        "save": "forge_infirmary_base.png",
        "size": "1440x540",
        "title": "Enfermería — corredor E–O",
        "full": """
CANVAS 1440x540 — WIDE short corridor, one screen tall, 1.5 screens wide. Pokémon-style hallway, not a square room.

WEST door to yard. EAST door to long channel. Both mid-height.
NORTH WALL landmark: ceramic fuses and copper disconnects (fuse gallery).
Walkable south/center. Wood benches, ceramic trays. Window slits. Electrical protection, NOT a hospital. No beds, no fire.
""",
        "mmx": (
            "CANVAS 1440x540 wide Enfermeria corridor. West door to yard, east door to long channel. North wall "
            "ceramic fuses and copper disconnects. Walkable south/center. Wood benches, ceramic trays. Protection "
            "hall not a hospital. No fire, no people."
        ),
    },
    {
        "file": "13-forge_longchannel_base.txt",
        "save": "forge_longchannel_base.png",
        "size": "2400x540",
        "title": "Canal Largo (mapa muy ancho)",
        "full": """
CANVAS 2400x540 — VERY WIDE thin map, one screen tall, 2.5 screens wide. This is a RUN, not a room. Do not compose 16:9.

WEST door from infirmary. EAST door to the hall. Distant unlit furnace silhouette at the far east.
NORTH wall: LONG cold copper-and-stone heat channel, empty of fire, running almost the full 2400px.
Narrow walkable band in the lower-middle. Soot, dust, oxidized copper. Embers OFF. Horizontal industry.
""",
        "mmx": (
            "CANVAS 2400x540 very wide Canal Largo, one screen tall. West door infirmary, east door hall. Long cold "
            "copper-stone heat channel along the entire north wall. Distant unlit furnace at far east. Narrow walkable "
            "band lower-middle. Embers OFF. Not a square room."
        ),
    },
    {
        "file": "14-forge_hall_base.txt",
        "save": "forge_hall_base.png",
        "size": "1920x1080",
        "title": "Nave de la Forja — hogar APAGADO",
        "full": """
CANVAS 1920x1080. Forge nave with space to walk around machines.
WEST door from the long channel.
Three machine ISLANDS (not floor): WEST bellows; SOUTH-CENTER hammer and anvil; EAST hearth COLD and DARK (runtime adds fire later).
South empty wooden trays. West-south dormant tablero-bus cabinet. Darker stone near hearth. No fire, no people.
""",
        "mmx": (
            "CANVAS 1920x1080 Nave de la Forja. West door from long channel. Three machines to walk around: west bellows, "
            "south-center hammer/anvil, east hearth COLD and dark. South empty trays. Dormant tablero-bus. No fire, no people."
        ),
    },
    {
        "file": "15-terraces_top_base.txt",
        "save": "terraces_top_base.png",
        "size": "960x1080",
        "title": "Terraza alta — un escalón",
        "full": """
CANVAS 960x1080 — taller than wide: one hillside STEP looking SOUTH down the valley. More sky/valley in the south half.

NORTH path (top) back to Plaza. SOUTH stairs (bottom) down to mid terrace.
CENTER landmark: high sluice of wood-stone-copper, CLOSED. Dry empty ceramic channels. Dry earth. Afternoon dust. NO flowing water.
""",
        "mmx": (
            "CANVAS 960x1080 Terraza alta, one stepped hillside looking south. North path to Plaza, south stairs down. "
            "Center high sluice CLOSED, dry channels. Dry earth, afternoon dust. More valley to the south. No flowing water."
        ),
    },
    {
        "file": "16-terraces_mid_base.txt",
        "save": "terraces_mid_base.png",
        "size": "960x1080",
        "title": "Terraza media — reparto injusto",
        "full": """
CANVAS 960x1080. One terrace step. NORTH path up, SOUTH path down, both center.
Landmark: unfair split. LEFT bed damper darker dirt. RIGHT bed cracked dry. Water DETAINED.
Walkable path BETWEEN the beds. Stone retaining walls, empty ceramic channels. Agricultural, not civic.
""",
        "mmx": (
            "CANVAS 960x1080 Terraza media. North path up, south path down. Left irrigation bed damper; right bed "
            "cracked dry — unfair split, water DETAINED. Walkable path between beds. Empty ceramic channels. No flowing water."
        ),
    },
    {
        "file": "17-terraces_mural_base.txt",
        "save": "terraces_mural_base.png",
        "size": "960x1080",
        "title": "Terraza del mural + Piedra Única",
        "full": """
CANVAS 960x1080. NORTH WALL: weathered ceramic-stone mural of TANGLED irrigation channels (Maraña). NO letters, NO glyphs.
CENTER: distinctive Piedra Única on a plinth and a small cistern.
WEST path to mid terrace. SOUTH path to aqueduct.
Walkable around the mural, not through it.
""",
        "mmx": (
            "CANVAS 960x1080 Terraza del mural. North wall weathered ceramic-stone mural of tangled channels, no letters. "
            "Center Piedra Unica on a plinth and small cistern. West path to mid terrace, south to aqueduct. Walkable around mural."
        ),
    },
    {
        "file": "18-terraces_aqueduct_base.txt",
        "save": "terraces_aqueduct_base.png",
        "size": "1440x1080",
        "title": "Acueducto — boca al lago",
        "full": """
CANVAS 1440x1080 — wider than a single screen so the east opening to the lake can exist.
NORTH path from the mural.
EAST opening toward lighthouse shore.
Landmark: THREE stacked stone-ceramic channels (high/mid/low), EMPTY and DRY, crossing the frame.
Walkable bridges. Distant dark inland lake to the SE, lighthouse hinted far right. No flowing water.
""",
        "mmx": (
            "CANVAS 1440x1080 Acueducto. North path from mural. East opening to lighthouse shore. Three stacked "
            "stone-ceramic channels EMPTY and dry. Walkable bridges. Distant dark lake SE, lighthouse hinted far right. "
            "No flowing water."
        ),
    },
    {
        "file": "19-lighthouse_hall_base.txt",
        "save": "lighthouse_hall_base.png",
        "size": "1920x1080",
        "title": "Hall del Faro — orilla",
        "full": """
CANVAS 1920x1080. Lake-shore hall, wider than one screen. Twilight. Glass brighter than stone.
WEST door from aqueduct. EAST door to Farero bench.
CENTER: dead bronze-glass-copper lighthouse machine, lens OFF, no beam.
NORTH: dark still inland lake spanning the width.
Walkable stone in the lower two thirds. Shore, not a plaza.
""",
        "mmx": (
            "CANVAS 1920x1080 Hall del Faro lake shore. West door from aqueduct, east door to farero bench. Center dead "
            "bronze-glass lighthouse machine, lens OFF. North dark still inland lake. Walkable stone lower two thirds. "
            "Twilight. No beam, no people."
        ),
    },
    {
        "file": "20-lighthouse_bench_base.txt",
        "save": "lighthouse_bench_base.png",
        "size": "960x540",
        "title": "Archivo del Farero (una pantalla)",
        "full": """
CANVAS 960x540 — one-screen memory workshop, like a Pokémon house interior.
WEST door from hall. EAST door to clock tower.
CENTER: wood-bronze-glass instrument table, walkable around it.
BACK shelves: glass instruments, ceramic jars, coiled copper, unreadable notebook texture (no readable letters).
Cool lake window light.
""",
        "mmx": (
            "CANVAS 960x540 Archivo del Farero one-screen workshop. West door from hall, east door to clock tower. "
            "Center wood-bronze-glass instrument table. Back shelves glass, ceramic jars, coiled copper, unreadable "
            "notebook texture. Cool lake window light. No people, no readable text."
        ),
    },
    {
        "file": "21-clock_tower_base.txt",
        "save": "clock_tower_base.png",
        "size": "960x1620",
        "title": "Torre del Reloj (mapa alto)",
        "full": """
CANVAS 960x1620 — TALL tower map, three screens. Not 16:9.

LOWER third: walkable stone platform around the tower base. WEST door from bench. EAST door toward lantern climb.
UPPER two thirds: HUGE stopped clock face of bronze, glass, and stone. Frozen hands. NO glow. Gears behind glass.
Twilight sky around the face. The clock IS the silhouette.
""",
        "mmx": (
            "CANVAS 960x1620 tall Torre del Reloj. Lower third walkable platform, west door from bench, east door to "
            "lantern. Upper two thirds HUGE stopped clock face bronze-glass-stone, frozen hands, no glow. Gears behind "
            "glass. Twilight. Not a square room."
        ),
    },
    {
        "file": "22-lighthouse_lantern_base.txt",
        "save": "lighthouse_lantern_base.png",
        "size": "1920x1080",
        "title": "Linterna del Faro — lente + lago",
        "full": """
CANVAS 1920x1080. High balcony. Twilight.
WEST-LOWER door from clock tower.
CENTER-LEFT: ENORMOUS glass-bronze Fresnel lens OFF, still the brightest material. No beam, no UI, no text.
RIGHT HALF: vast dark inland lake and distant basin skyline.
SOUTH-LOWER: empty stone landing (no boat).
Walkable balcony on the LEFT two-fifths.
""",
        "mmx": (
            "CANVAS 1920x1080 Linterna del Faro. West-lower door from clock tower. Center-left enormous glass-bronze "
            "lens OFF. Right half vast inland lake and distant skyline. South-lower empty landing, no boat. Walkable "
            "balcony left two-fifths. Twilight. No beam, no text, no people."
        ),
    },
]


def pack(body: str) -> str:
    return f"{STYLE} {body.strip()} {AVOID}"


def main() -> None:
    too_long = []
    for room in ROOMS:
        mmx = pack(room["mmx"])
        if len(mmx) >= 1500:
            too_long.append((room["file"], len(mmx)))
        text = (
            f"# {room['title']}\n"
            f"# Guardar como: {room['save']}\n"
            f"# Lienzo nativo (1px = 1px de juego): {room['size']}\n"
            f"# Viewport del juego: 960x540 — NO es el tamaño de esta sala\n"
            f"# Carpeta: minimax-output/arco1-rooms-manuel/\n"
            f"\n"
            f"===== FULL =====\n"
            f"{pack(room['full'])}\n"
            f"\n"
            f"===== MMX ({len(mmx)} chars) =====\n"
            f"{mmx}\n"
        )
        (OUT / room["file"]).write_text(text, encoding="utf-8")
    if too_long:
        raise SystemExit(f"MMX prompts too long: {too_long}")
    print(f"wrote {len(ROOMS)} prompts to {OUT}")


if __name__ == "__main__":
    main()
