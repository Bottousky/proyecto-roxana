#!/usr/bin/env python3
"""Valida dimensiones, alfa y economía de lienzo de un lote de salas de Ohmdal."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image


CHUNK_SIZE = (960, 540)


def is_chunk(path: Path) -> bool:
    stem = path.stem
    return "_base" in stem or "+prop_" in stem or stem.startswith("plaza+")


def pixel_block_ratio(image: Image.Image, scale: int = 2) -> float:
    pixels = image.convert("RGB").load()
    matching = 0
    total = 0
    for y in range(0, image.height - scale + 1, scale):
        for x in range(0, image.width - scale + 1, scale):
            first = pixels[x, y]
            total += 1
            if all(pixels[x + dx, y + dy] == first for dy in range(scale) for dx in range(scale)):
                matching += 1
    return matching / total if total else 0.0


def inspect(path: Path, style_gate: bool = False) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    try:
        with Image.open(path) as opened:
            image = opened.convert("RGBA")
    except Exception as exc:
        return [f"{path.name}: no se pudo abrir ({exc})"], warnings

    if is_chunk(path) and image.size != CHUNK_SIZE:
        errors.append(f"{path.name}: chunk {image.width}x{image.height}; debe ser 960x540")
    elif is_chunk(path) and style_gate:
        block_ratio = pixel_block_ratio(image)
        if block_ratio < 0.90:
            warnings.append(
                f"{path.name}: solo {block_ratio:.0%} de bloques 2x2 son estables; "
                "parece arte de alta densidad, no un máster 480x270 ampliado"
            )

    if path.stem.startswith("prop_"):
        alpha = image.getchannel("A")
        minimum, maximum = alpha.getextrema()
        if minimum != 0 or maximum != 255:
            errors.append(f"{path.name}: el prop necesita alfa real (extremos {minimum}..{maximum})")
        corners = [
            alpha.getpixel((0, 0)),
            alpha.getpixel((image.width - 1, 0)),
            alpha.getpixel((0, image.height - 1)),
            alpha.getpixel((image.width - 1, image.height - 1)),
        ]
        if any(corner != 0 for corner in corners):
            errors.append(f"{path.name}: las cuatro esquinas deben ser transparentes")
        bbox = alpha.getbbox()
        if not bbox:
            errors.append(f"{path.name}: prop completamente transparente")
        else:
            bbox_area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
            canvas_area = image.width * image.height
            waste = 1 - bbox_area / canvas_area
            if waste > 0.40:
                warnings.append(
                    f"{path.name}: {waste:.0%} del lienzo queda fuera del bounding box; "
                    "recortar antes de usar en runtime"
                )
            if image.width > 1024 or image.height > 1024:
                warnings.append(
                    f"{path.name}: lienzo {image.width}x{image.height}; conservar como máster, "
                    "no cargar directamente en Phaser"
                )
    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    parser.add_argument("--strict", action="store_true", help="trata advertencias como errores")
    parser.add_argument(
        "--style-gate",
        action="store_true",
        help="comprueba la grilla visual 480x270 ampliada 2x",
    )
    args = parser.parse_args()
    if not args.directory.is_dir():
        print(f"ERROR: no existe el directorio {args.directory}", file=sys.stderr)
        return 2

    files = sorted(p for p in args.directory.glob("*.png") if p.is_file())
    if not files:
        print(f"ERROR: no hay PNG finales en {args.directory}", file=sys.stderr)
        return 2

    errors: list[str] = []
    warnings: list[str] = []
    for path in files:
        file_errors, file_warnings = inspect(path, style_gate=args.style_gate)
        errors.extend(file_errors)
        warnings.extend(file_warnings)

    for warning in warnings:
        print(f"WARN  {warning}")
    for error in errors:
        print(f"ERROR {error}")
    print(f"\n{len(files)} PNG · {len(errors)} errores · {len(warnings)} advertencias")
    return 1 if errors or (args.strict and warnings) else 0


if __name__ == "__main__":
    raise SystemExit(main())
