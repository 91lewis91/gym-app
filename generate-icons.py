"""Generate PWA icons for Lewis's Training Log."""
from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('icons', exist_ok=True)

for size in [192, 512]:
    img = Image.new('RGB', (size, size), '#0f0f0f')
    draw = ImageDraw.Draw(img)

    # Gold circle background
    margin = size // 8
    draw.ellipse([margin, margin, size - margin, size - margin], fill='#e8b84b')

    # Dumbbell emoji-style text
    emoji = '🏋️'
    font_size = size // 3
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', font_size)
    except Exception:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), emoji, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - w) // 2 - bbox[0], (size - h) // 2 - bbox[1]), emoji, font=font)

    img.save(f'icons/icon-{size}.png')
    print(f'icons/icon-{size}.png created')
