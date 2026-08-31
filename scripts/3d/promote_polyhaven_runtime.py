"""Promote curated Poly Haven source maps to 1K Ohmdal runtime derivatives."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/source/vendor/polyhaven"
RUNTIME = ROOT / "assets/runtime/ohmdal/plaza/materials"

SETS = {
    "cobblestone_floor_001": "plaza-cobble-base",
    "mossy_cobblestone": "plaza-cobble-moss",
    "stone_tile_wall": "stone-primary",
    "stone_wall_05": "stone-aged",
    "medieval_wall_01": "plaster-worn",
    "medieval_wood": "wood-workshop",
    "rusty_metal_04": "iron-aged",
}

MAP_NAMES = {
    "diff": "diffuse",
    "nor_gl": "normal",
    "rough": "roughness",
    "ao": "ao",
    "metal": "metalness",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    digest.update(path.read_bytes())
    return digest.hexdigest()


for slug, runtime_name in SETS.items():
    source_dir = SOURCE / slug
    source_provenance = json.loads((source_dir / "provenance.json").read_text(encoding="utf-8"))
    destination = RUNTIME / runtime_name
    destination.mkdir(parents=True, exist_ok=True)
    outputs = []

    for item in source_provenance["downloads"]:
        map_name = item["map"]
        if map_name not in MAP_NAMES:
            continue
        source_path = source_dir / item["file"]
        is_normal = map_name == "nor_gl"
        extension = ".png" if is_normal else ".jpg"
        output_path = destination / f"{MAP_NAMES[map_name]}-1k{extension}"
        with Image.open(source_path) as image:
            image = image.convert("RGB")
            image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            if is_normal:
                image.save(output_path, format="PNG", optimize=True)
            else:
                image.save(output_path, format="JPEG", quality=84, optimize=True, progressive=True)
        outputs.append({
            "map": map_name,
            "path": output_path.relative_to(ROOT).as_posix(),
            "width": 1024,
            "height": 1024,
            "bytes": output_path.stat().st_size,
            "sha256": sha256(output_path),
        })

    runtime_provenance = {
        "id": f"roxana-ohmdal-{runtime_name}-v1",
        "provider": "Poly Haven",
        "sourceAsset": slug,
        "sourceUrl": source_provenance["sourceUrl"],
        "license": "CC0-1.0",
        "sourceResolution": source_provenance["resolution"],
        "runtimeResolution": "1k",
        "processing": "Pillow LANCZOS; JPEG quality 84 or optimized PNG; no displacement",
        "outputs": outputs,
    }
    (destination / "provenance.json").write_text(
        json.dumps(runtime_provenance, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"{runtime_name}: {len(outputs)} maps")
