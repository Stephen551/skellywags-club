"""Generate /public/og.jpg — the 1200x630 social-share card for skellywags.club."""
import math
import os
import random
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")

W, H = 1200, 630
BG_PRIMARY = (13, 8, 20)
PURPLE_CORE = (155, 95, 192)
PURPLE_DEEP = (107, 47, 160)
ELECTRIC_PINK = (255, 79, 203)
ELECTRIC_BLUE = (79, 195, 247)
GOLD = (212, 160, 23)
TEXT_PRIMARY = (240, 232, 255)
TEXT_MUTED = (144, 128, 170)


def radial_gradient(size, cx, cy, inner, outer, max_r):
    w, h = size
    layer = Image.new("RGBA", size, outer + (255,))
    pixels = layer.load()
    for y in range(h):
        for x in range(w):
            d = math.hypot(x - cx, y - cy)
            t = min(1.0, d / max_r)
            r = int(inner[0] + (outer[0] - inner[0]) * t)
            g = int(inner[1] + (outer[1] - inner[1]) * t)
            b = int(inner[2] + (outer[2] - inner[2]) * t)
            a = int(255 * (1 - t))
            pixels[x, y] = (r, g, b, a)
    return layer


def find_font(candidates, size):
    fonts_dir = os.path.join(os.environ.get("WINDIR", "C:\\Windows"), "Fonts")
    for name in candidates:
        path = os.path.join(fonts_dir, name)
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    try:
        return ImageFont.truetype("arial.ttf", size)
    except Exception:
        return ImageFont.load_default()


def main():
    canvas = Image.new("RGBA", (W, H), BG_PRIMARY + (255,))

    # Soft purple core glow behind everything
    glow = radial_gradient((W, H), int(W * 0.35), int(H * 0.45), PURPLE_CORE, BG_PRIMARY, max_r=int(W * 0.55))
    canvas = Image.alpha_composite(canvas, glow)

    # Subtle pink halo bottom-right
    halo = radial_gradient((W, H), int(W * 0.85), int(H * 0.85), ELECTRIC_PINK, BG_PRIMARY, max_r=int(W * 0.4))
    halo = halo.point(lambda v: int(v * 0.4))
    canvas = Image.alpha_composite(canvas, halo)

    # Stars
    rng = random.Random(7)
    star_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(star_layer)
    for _ in range(110):
        x = rng.randint(0, W - 1)
        y = rng.randint(0, H - 1)
        r = rng.choice([1, 1, 1, 2, 2, 3])
        a = rng.randint(120, 230)
        sd.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, a))
    canvas = Image.alpha_composite(canvas, star_layer)

    # Diagonal lightning streak
    bolt = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bolt)
    bd.line([(40, 360), (430, 230), (380, 280), (760, 150), (700, 200), (1180, 70)],
            fill=ELECTRIC_PINK + (160,), width=2)
    bd.line([(60, 580), (340, 470), (300, 510), (640, 380), (600, 410), (980, 280)],
            fill=ELECTRIC_BLUE + (140,), width=2)
    bolt = bolt.filter(ImageFilter.GaussianBlur(radius=2))
    canvas = Image.alpha_composite(canvas, bolt)

    # Avatar (transparent PNG) on the left, with glow
    avatar_path = os.path.join(PUBLIC, "avatar.png")
    if os.path.exists(avatar_path):
        avatar = Image.open(avatar_path).convert("RGBA")
        target_h = 520
        ratio = target_h / avatar.height
        avatar = avatar.resize((int(avatar.width * ratio), target_h), Image.LANCZOS)
        ax = 30
        ay = (H - avatar.height) // 2

        # Glow underlay
        glow_under = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gu = ImageDraw.Draw(glow_under)
        gu.ellipse((ax - 40, ay + 60, ax + avatar.width + 40, ay + avatar.height + 40),
                   fill=PURPLE_CORE + (140,))
        glow_under = glow_under.filter(ImageFilter.GaussianBlur(radius=40))
        canvas = Image.alpha_composite(canvas, glow_under)

        canvas.alpha_composite(avatar, (ax, ay))

    # Wordmark on right
    word_path = os.path.join(PUBLIC, "skellyword.png")
    text_x = 580
    if os.path.exists(word_path):
        word = Image.open(word_path).convert("RGBA")
        target_w = 540
        ratio = target_w / word.width
        word = word.resize((target_w, int(word.height * ratio)), Image.LANCZOS)
        wy = 90
        canvas.alpha_composite(word, (text_x, wy))

    draw = ImageDraw.Draw(canvas)

    # Channel handle
    handle_font = find_font(["bahnschrift.ttf", "impact.ttf", "ariblk.ttf", "arial.ttf"], 28)
    draw.text((text_x + 4, 60), "@OFFICIALLYSKELLY", font=handle_font, fill=ELECTRIC_PINK)

    # Tagline
    tagline_font = find_font(["seguisbi.ttf", "georgiai.ttf", "ariali.ttf", "arial.ttf"], 36)
    draw.text((text_x + 4, 380), "chaos, bad decisions,", font=tagline_font, fill=TEXT_PRIMARY)
    draw.text((text_x + 4, 425), "and surviving barely.", font=tagline_font, fill=TEXT_PRIMARY)

    # URL pill (gold accent)
    url_font = find_font(["bahnschrift.ttf", "impact.ttf", "arialbd.ttf", "arial.ttf"], 32)
    url_text = "SKELLYWAGS.CLUB"
    bbox = draw.textbbox((0, 0), url_text, font=url_font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pill_x, pill_y = text_x + 4, 510
    pad_x, pad_y = 22, 14
    draw.rounded_rectangle(
        (pill_x - pad_x, pill_y - pad_y, pill_x + tw + pad_x, pill_y + th + pad_y),
        radius=14,
        fill=GOLD,
    )
    draw.text((pill_x, pill_y - 4), url_text, font=url_font, fill=BG_PRIMARY)

    # Final flatten + save as JPEG
    final = Image.new("RGB", (W, H), BG_PRIMARY)
    final.paste(canvas, mask=canvas.split()[3])
    out = os.path.join(PUBLIC, "og.jpg")
    final.save(out, "JPEG", quality=85, optimize=True)
    print(f"wrote {out} ({os.path.getsize(out)} bytes, {W}x{H})")


if __name__ == "__main__":
    main()
