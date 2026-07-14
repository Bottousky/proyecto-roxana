#!/usr/bin/env python3
"""Normaliza un render IA a 960x540 con una grilla visual de baja resolución."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


TARGET = (960, 540)
TARGET_RATIO = TARGET[0] / TARGET[1]


def centered_crop_16_9(image: Image.Image) -> Image.Image:
    ratio = image.width / image.height
    drift = abs(ratio - TARGET_RATIO) / TARGET_RATIO
    if drift > 0.03:
        raise ValueError(
            f"relación {image.width}:{image.height} demasiado lejos de 16:9 "
            f"({drift:.1%}); regenerar el encuadre"
        )
    if ratio > TARGET_RATIO:
        width = round(image.height * TARGET_RATIO)
        left = (image.width - width) // 2
        return image.crop((left, 0, left + width, image.height))
    height = round(image.width / TARGET_RATIO)
    top = (image.height - height) // 2
    return image.crop((0, top, image.width, top + height))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument(
        "--force-upscale",
        action="store_true",
        help="permite agrandar una fuente menor que 960x540",
    )
    parser.add_argument(
        "--virtual-size",
        default="480x270",
        help="resolución artística antes del escalado nearest (default: 480x270; 'off' la omite)",
    )
    parser.add_argument(
        "--colors",
        type=int,
        default=256,
        help="máximo de colores del pase pixel (default: 256; 0 desactiva)",
    )
    args = parser.parse_args()

    with Image.open(args.source) as opened:
        image = opened.convert("RGBA")
    image = centered_crop_16_9(image)
    if not args.force_upscale and (image.width < TARGET[0] or image.height < TARGET[1]):
        raise ValueError(
            f"fuente {image.width}x{image.height} menor que {TARGET[0]}x{TARGET[1]}; "
            "usar un máster mayor o --force-upscale"
        )
    if args.virtual_size.lower() == "off":
        normalized = image.resize(TARGET, Image.Resampling.NEAREST)
        virtual = None
    else:
        try:
            virtual = tuple(int(part) for part in args.virtual_size.lower().split("x"))
        except ValueError as exc:
            raise ValueError("--virtual-size debe usar formato ANCHOxALTO u 'off'") from exc
        if len(virtual) != 2 or virtual[0] <= 0 or virtual[1] <= 0:
            raise ValueError("--virtual-size debe usar formato ANCHOxALTO u 'off'")
        if virtual[0] / virtual[1] != TARGET_RATIO:
            raise ValueError("la resolución virtual debe ser 16:9")
        if TARGET[0] % virtual[0] or TARGET[1] % virtual[1]:
            raise ValueError("la resolución virtual debe escalar por un entero exacto a 960x540")
        pixel = image.resize(virtual, Image.Resampling.BOX)
        if args.colors:
            if not 2 <= args.colors <= 256:
                raise ValueError("--colors debe estar entre 2 y 256, o ser 0")
            pixel = pixel.quantize(
                colors=args.colors,
                method=Image.Quantize.FASTOCTREE,
                dither=Image.Dither.NONE,
            ).convert("RGBA")
        normalized = pixel.resize(TARGET, Image.Resampling.NEAREST)
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    normalized.save(args.destination, optimize=True)
    mode = "nearest directo" if virtual is None else f"pixel {virtual[0]}x{virtual[1]} -> 960x540"
    print(f"OK {args.source} -> {args.destination} ({mode}, {args.colors or 'sin límite'} colores)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
