"""Prepare the selected Quaternius glTF props with 1K runtime textures.

The vendor archive remains untouched. This script creates an ignored staging copy
that can be packed losslessly to GLB with glTF Transform's `copy` command.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/source/vendor/quaternius/fantasy-props-megakit/raw/Exports/glTF"
STAGING = ROOT / "assets/source/vendor/quaternius/fantasy-props-megakit/normalized-1k"
SELECTED = ("Barrel", "Crate_Wooden", "Workbench")


def promote() -> None:
    STAGING.mkdir(parents=True, exist_ok=True)
    texture_names: set[str] = set()

    for name in SELECTED:
        gltf_source = SOURCE / f"{name}.gltf"
        gltf_target = STAGING / gltf_source.name
        document = json.loads(gltf_source.read_text(encoding="utf-8"))
        gltf_target.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")

        for buffer in document.get("buffers", []):
            uri = buffer.get("uri")
            if uri:
                shutil.copy2(SOURCE / uri, STAGING / uri)
        for image in document.get("images", []):
            uri = image.get("uri")
            if uri:
                texture_names.add(uri)

    for texture_name in sorted(texture_names):
        with Image.open(SOURCE / texture_name) as image:
            image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            image.save(STAGING / texture_name, optimize=True)
        print(f"{texture_name}: 1K")

    print(f"Selected props: {', '.join(SELECTED)}")


if __name__ == "__main__":
    promote()
