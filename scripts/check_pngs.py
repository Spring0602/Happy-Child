from PIL import Image
import sys

for name in ['yps.png', 'ly.png']:
    path = f'e:/Happy-Child/client/public/assets/sprites/{name}'
    try:
        img = Image.open(path)
        print(f'{name}: format={img.format}, size={img.size}, mode={img.mode}')
    except Exception as e:
        print(f'{name}: ERROR - {e}')
        sys.exit(1)

print('All PNGs are valid.')
