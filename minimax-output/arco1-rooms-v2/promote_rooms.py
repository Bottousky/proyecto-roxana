#!/usr/bin/env python3
"""Promote lore-generated room art into assets/ohmdal/rooms/pilot-arco1.

Does not overwrite overlay sprites (hearth/lens/dock/boat runtime).
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RAW = Path(__file__).resolve().parent / "raw"
PILOT = ROOT / "assets" / "ohmdal" / "rooms" / "pilot-arco1"
NORM = Path(__file__).resolve().parent / "normalized"
PROMPTS = Path(__file__).resolve().parent / "prompts"
NORMALIZE = ROOT / "scripts" / "normalize_chunk.py"

# job_dir / file_glob -> (dest_name, mode)
# mode: plaza1920 | chunk960 | copy_jpg_png
JOBS: list[tuple[str, str, str, str]] = [
    ("plaza_base", "plaza_base_001.jpg", "plaza-1920-base-v4.png", "plaza1920"),
    ("plaza_castle_open", "plaza_castle_open_001.jpg", "plaza-castillo-abierto-v4.png", "plaza1920"),
    ("taller_base", "taller_base_001.jpg", "taller_base-v4.png", "chunk960"),
    ("puerta_base", "puerta_base_001.jpg", "puerta_base-v4.png", "chunk960"),
    ("puerta_open", "puerta_open_001.jpg", "puerta_open-v4.png", "chunk960"),
    ("manantial_ohm_base", "manantial_ohm_base_001.jpg", "manantial_ohm_base-v4.png", "chunk960"),
    ("castle_gate_base", "castle_gate_base_001.jpg", "castle_gate_base-v4.png", "chunk960"),
    ("castle_gallery_base", "castle_gallery_base_001.jpg", "castle_gallery_base-v4.png", "chunk960"),
    ("castle_branches_base", "castle_branches_base_001.jpg", "castle_branches_base-v4.png", "chunk960"),
    ("castle_heart_base", "castle_heart_base_001.jpg", "castle_heart_base-v4.png", "chunk960"),
    ("forge_yard_base", "forge_yard_base_001.jpg", "forge_yard_base-v4.png", "chunk960"),
    ("forge_infirmary_base", "forge_infirmary_base_001.jpg", "forge_infirmary_base-v4.png", "chunk960"),
    ("forge_longchannel_base", "forge_longchannel_base_001.jpg", "forge_longchannel_base-v4.png", "chunk960"),
    ("forge_hall_base", "forge_hall_base_001.jpg", "forge_hall_base-v4.png", "chunk960"),
    ("terraces_top_base", "terraces_top_base_001.jpg", "terraces_top_base-v4.png", "chunk960"),
    ("terraces_mid_base", "terraces_mid_base_001.jpg", "terraces_mid_base-v4.png", "chunk960"),
    ("terraces_mural_base", "terraces_mural_base_001.jpg", "terraces_mural_base-v4.png", "chunk960"),
    ("terraces_aqueduct_base", "terraces_aqueduct_base_001.jpg", "terraces_aqueduct_base-v4.png", "chunk960"),
    ("lighthouse_hall_base", "lighthouse_hall_base_001.jpg", "lighthouse_hall_base-v4.png", "chunk960"),
    ("lighthouse_bench_base", "lighthouse_bench_base_001.jpg", "lighthouse_bench_base-v4.png", "chunk960"),
    ("clock_tower_base_b", "clock_tower_base_b_001.jpg", "clock_tower_base-v4.png", "chunk960"),
    ("lighthouse_lantern_base", "lighthouse_lantern_base_001.jpg", "lighthouse_lantern_base-v4.png", "chunk960"),
]


def jpg_to_png(src: Path, dest: Path, size: tuple[int, int] | None = None) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as opened:
        image = opened.convert("RGBA")
        if size and image.size != size:
            image = image.resize(size, Image.Resampling.LANCZOS)
        image.save(dest)


def promote_plaza(src: Path, dest: Path) -> None:
    master = NORM / (dest.stem + "-master.png")
    jpg_to_png(src, master, (1920, 1080))
    pixel = Image.open(master).convert("RGBA").resize((960, 540), Image.Resampling.BOX)
    pixel = pixel.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).convert("RGBA")
    out = pixel.resize((1920, 1080), Image.Resampling.NEAREST)
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, optimize=True)
    print(f"OK plaza {dest.name}")


def promote_chunk(src: Path, dest: Path) -> None:
    master = NORM / (dest.stem + "-master.png")
    jpg_to_png(src, master)
    proc = subprocess.run(
        [sys.executable, str(NORMALIZE), str(master), str(dest)],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"{dest.name}: {proc.stderr or proc.stdout}")
    print(proc.stdout.strip())


def main() -> int:
    NORM.mkdir(parents=True, exist_ok=True)
    PILOT.mkdir(parents=True, exist_ok=True)
    for folder, filename, dest_name, mode in JOBS:
        src = RAW / folder / filename
        if not src.exists():
            print(f"MISSING {src}")
            continue
        dest = PILOT / dest_name
        if mode == "plaza1920":
            promote_plaza(src, dest)
        else:
            promote_chunk(src, dest)
        prompt_src = PROMPTS / f"{folder.replace('_b', '')}.prompt.txt"
        if not prompt_src.exists():
            prompt_src = PROMPTS / f"{folder}.prompt.txt"
        if prompt_src.exists():
            shutil.copy2(prompt_src, dest.with_suffix(".prompt.txt"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
