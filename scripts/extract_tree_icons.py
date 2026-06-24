#!/usr/bin/env python3
from pathlib import Path
from collections import deque

from PIL import Image

SHEET_PATH = Path('liveling_frontend/public/assets/nature/trees/forest-trees-sheet.png')
OUT_DIR = Path('liveling_frontend/public/trees/extracted')
OUT_SIZE = 96

ROW_HEIGHT = 34
CROP_SIZE = 34
Y_OFFSET = 0
LEFT_ICON_X = 126
RIGHT_ICON_X = 398
LEFT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
RIGHT_IDS = [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]


def to_alpha_cutout(icon: Image.Image) -> Image.Image:
    icon = icon.convert('RGBA')
    px = icon.load()
    w, h = icon.size

    def is_neutral(r: int, g: int, b: int) -> bool:
        return max(r, g, b) - min(r, g, b) < 20

    # Remove neutral grid lines in full columns/rows first.
    for x in range(w):
        neutral_opaque = 0
        for y in range(h):
            r, g, b, a = px[x, y]
            if a > 0 and is_neutral(r, g, b) and (r + g + b) // 3 < 170:
                neutral_opaque += 1
        if neutral_opaque >= int(h * 0.75):
            for y in range(h):
                r, g, b, _ = px[x, y]
                px[x, y] = (r, g, b, 0)

    for y in range(h):
        neutral_opaque = 0
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0 and is_neutral(r, g, b) and (r + g + b) // 3 < 170:
                neutral_opaque += 1
        if neutral_opaque >= int(w * 0.75):
            for x in range(w):
                r, g, b, _ = px[x, y]
                px[x, y] = (r, g, b, 0)

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            avg = (r + g + b) // 3
            neutral = is_neutral(r, g, b)

            # Remove white/light-gray table background and borders.
            if (r > 245 and g > 245 and b > 245) or (neutral and avg > 188):
                px[x, y] = (r, g, b, 0)

    # Remove any lingering edge pixels to avoid table borders.
    for x in range(w):
        for y in (0, h - 1):
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)
    for y in range(h):
        for x in (0, w - 1):
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)

    # Remove tiny disconnected artifacts (e.g., stray dots from table/adjacent row bleed).
    visited = [[False for _ in range(w)] for _ in range(h)]
    neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    for sy in range(h):
        for sx in range(w):
            if visited[sy][sx] or px[sx, sy][3] == 0:
                continue

            q = deque([(sx, sy)])
            visited[sy][sx] = True
            points = []
            while q:
                x, y = q.popleft()
                points.append((x, y))
                for dx, dy in neighbors:
                    nx, ny = x + dx, y + dy
                    if nx < 0 or ny < 0 or nx >= w or ny >= h:
                        continue
                    if visited[ny][nx] or px[nx, ny][3] == 0:
                        continue
                    visited[ny][nx] = True
                    q.append((nx, ny))

            if len(points) < 8:
                for x, y in points:
                    r, g, b, _ = px[x, y]
                    px[x, y] = (r, g, b, 0)

    bbox = icon.getbbox()
    if not bbox:
        return icon

    return icon.crop(bbox)


def normalize_icon(icon: Image.Image) -> Image.Image:
    trimmed = to_alpha_cutout(icon)
    canvas = Image.new('RGBA', (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0))

    w, h = trimmed.size
    if w == 0 or h == 0:
        return canvas

    max_dim = OUT_SIZE - 12
    scale = min(max_dim / w, max_dim / h)
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))
    resized = trimmed.resize((new_w, new_h), Image.Resampling.NEAREST)

    x = (OUT_SIZE - new_w) // 2
    y = (OUT_SIZE - new_h) // 2
    canvas.alpha_composite(resized, dest=(x, y))
    return canvas


def extract_icon(sheet: Image.Image, icon_id: int) -> Image.Image:
    if icon_id in LEFT_IDS:
        row = LEFT_IDS.index(icon_id)
        x = LEFT_ICON_X
    else:
        row = RIGHT_IDS.index(icon_id)
        x = RIGHT_ICON_X

    y = row * ROW_HEIGHT + Y_OFFSET
    return sheet.crop((x, y, x + CROP_SIZE, y + CROP_SIZE))


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SHEET_PATH).convert('RGBA')

    all_ids = LEFT_IDS + RIGHT_IDS
    for icon_id in all_ids:
        raw = extract_icon(sheet, icon_id)
        cleaned = normalize_icon(raw)
        cleaned.save(OUT_DIR / f'tree_{icon_id:02d}.png')

    print(f'Generated {len(all_ids)} cleaned tree icons in {OUT_DIR}')


if __name__ == '__main__':
    main()
