#!/usr/bin/env python3
"""Build aligned runner frames from the walk-cycle source art."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "icons"
FRAMES_DIR = ICONS / "runner-frames"
SOURCE = ICONS / "runner-source.png"

# Two opposite stride poses — skip open-mouth frame and bleed frame.
FRAME_CELLS = [(0, 1), (0, 2)]

COLS, ROWS = 4, 3
FRAME_SIZE = 160
BLACK_THRESHOLD = 28
FOOT_PADDING = 10
HEADROOM = 8


def key_black(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r <= BLACK_THRESHOLD and g <= BLACK_THRESHOLD and b <= BLACK_THRESHOLD:
                px[x, y] = (0, 0, 0, 0)
    return rgba


def content_box(img: Image.Image) -> tuple[int, int, int, int]:
    alpha = img.split()[-1]
    return alpha.getbbox() or (0, 0, img.width, img.height)


def extract_frame(sheet: Image.Image, row: int, col: int) -> Image.Image:
    sw, sh = sheet.size
    cw, ch = sw // COLS, sh // ROWS
    inset_x = int(cw * 0.04)
    inset_y = int(ch * 0.02)
    return sheet.crop((
        col * cw + inset_x,
        row * ch + inset_y,
        (col + 1) * cw - inset_x,
        (row + 1) * ch - inset_y,
    ))


def foot_anchor(img: Image.Image) -> tuple[float, float]:
    alpha = img.split()[-1]
    px = alpha.load()
    w, h = img.size
    y0 = int(h * 0.82)
    xs: list[int] = []
    ys: list[int] = []
    for y in range(y0, h):
        for x in range(w):
            if px[x, y] > 20:
                xs.append(x)
                ys.append(y)
    if not xs:
        return w / 2, h - 1
    return sum(xs) / len(xs), max(ys)


def prepare_frame(cell: Image.Image) -> tuple[Image.Image, float, float, float, float]:
    keyed = key_black(cell)
    box = content_box(keyed)
    cropped = keyed.crop(box)
    foot_x, foot_y = foot_anchor(cropped)
    return cropped, foot_x, foot_y, cropped.width, cropped.height


def place_frame(
    cropped: Image.Image,
    foot_x: float,
    foot_y: float,
    scale: float,
) -> Image.Image:
    nw = max(1, int(cropped.width * scale))
    nh = max(1, int(cropped.height * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)

    foot_x_s = foot_x * scale
    foot_y_s = foot_y * scale
    anchor_x = FRAME_SIZE / 2
    anchor_y = FRAME_SIZE - FOOT_PADDING

    canvas = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    paste_x = int(anchor_x - foot_x_s)
    paste_y = int(anchor_y - foot_y_s)
    canvas.paste(resized, (paste_x, paste_y), resized)
    return canvas


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source sprite sheet: {SOURCE}")

    ICONS.mkdir(parents=True, exist_ok=True)
    FRAMES_DIR.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SOURCE)

    prepared = []
    for row, col in FRAME_CELLS:
        cell = extract_frame(sheet, row, col)
        prepared.append(prepare_frame(cell))

    max_height = max(item[4] for item in prepared)
    usable_height = FRAME_SIZE - FOOT_PADDING - HEADROOM
    scale = usable_height / max_height

    frames = []
    for cropped, foot_x, foot_y, _w, _h in prepared:
        frames.append(place_frame(cropped, foot_x, foot_y, scale))

    for i, frame in enumerate(frames):
        frame.save(FRAMES_DIR / f"{i:02d}.png", "PNG")

    count = len(frames)
    sprite = Image.new("RGBA", (FRAME_SIZE * count, FRAME_SIZE), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        sprite.paste(frame, (i * FRAME_SIZE, 0), frame)

    sprite.save(ICONS / "runner-sprite.png", "PNG")
    frames[0].save(ICONS / "runner.png", "PNG")

    print(f"Frames: {count}")
    print(f"Wrote {FRAMES_DIR}/*.png")
    print(f"Wrote {ICONS / 'runner-sprite.png'} ({sprite.width}x{sprite.height})")


if __name__ == "__main__":
    main()
