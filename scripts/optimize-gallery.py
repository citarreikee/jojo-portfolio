"""Generate web-sized WebP copies; keep camera originals untouched.
Requires Pillow: python3 -m pip install Pillow
"""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
source = root / 'public/assets/gallery'
target = source / 'webp'
target.mkdir(exist_ok=True)
original_bytes = optimized_bytes = count = 0
for path in sorted(source.iterdir()):
    if not path.is_file() or path.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp'}:
        continue
    # Include the original suffix to avoid collisions between same-stem photos.
    output = target / (path.name + '.webp')
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original)
        image.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
        if image.mode not in ('RGB', 'RGBA'):
            image = image.convert('RGBA' if 'transparency' in image.info else 'RGB')
        image.save(output, 'WEBP', quality=85, method=6)
    with Image.open(output) as check:
        check.verify()
    original_bytes += path.stat().st_size
    optimized_bytes += output.stat().st_size
    count += 1
print(f'{count} photos: {original_bytes:,} -> {optimized_bytes:,} bytes ({1-optimized_bytes/original_bytes:.1%} smaller)')
