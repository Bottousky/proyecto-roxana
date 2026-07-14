#!/usr/bin/env python3
"""Recorta un prop IA y crea una textura ajustada a su tamaño real en Phaser."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--size", required=True, help="tamaño final ANCHOxALTO")
    parser.add_argument("--padding", type=int, default=2)
    parser.add_argument("--colors", type=int, default=128)
    args = parser.parse_args()

    width, height = (int(part) for part in args.size.lower().split("x"))
    if width <= args.padding * 2 or height <= args.padding * 2:
        raise ValueError("el padding no deja área útil")
    with Image.open(args.source) as opened:
        image = opened.convert("RGBA")
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        raise ValueError("el prop está completamente vacío")
    image = image.crop(bbox)

    max_width = width - args.padding * 2
    max_height = height - args.padding * 2
    scale = min(max_width / image.width, max_height / image.height)
    fitted_size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    fitted = image.resize(fitted_size, Image.Resampling.BOX)
    if args.colors:
        fitted = fitted.quantize(
            colors=args.colors,
            method=Image.Quantize.FASTOCTREE,
            dither=Image.Dither.NONE,
        ).convert("RGBA")

    result = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    x = (width - fitted.width) // 2
    y = height - args.padding - fitted.height
    result.alpha_composite(fitted, (x, y))
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    result.save(args.destination, optimize=True)
    print(f"OK {args.source} -> {args.destination} ({width}x{height})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
