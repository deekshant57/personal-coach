#!/usr/bin/env python3
"""Build PWA icons from the cartoon runner artwork."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "icons"
SRC = ICONS / "runner.png"
BG = (10, 10, 10, 255)


def make_icon(size: int) -> Image.Image:
    src = Image.open(SRC).convert("RGBA")
    canvas = Image.new("RGBA", (size, size), BG)
    scale = min(size / src.width, size / src.height) * 0.88
    w, h = int(src.width * scale), int(src.height * scale)
    resized = src.resize((w, h), Image.Resampling.LANCZOS)
    x = (size - w) // 2
    y = (size - h) // 2 + int(size * 0.04)
    canvas.paste(resized, (x, y), resized)
    return canvas


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source image: {SRC}")
    ICONS.mkdir(parents=True, exist_ok=True)
    for size in (192, 512):
        path = ICONS / f"icon-{size}.png"
        make_icon(size).save(path, "PNG")
        print(f"Wrote {path}")


if __name__ == "__main__":
    main()
