# Opening artwork and font

- `character.svg`: the uploaded character, unchanged. The opening animates its body, face, and detached hands at runtime.
- `gangwon-saeeum.ttf`: the uploaded 강원교육새음 font, unchanged.
- `gangwon-saeeum.woff`: browser-compatible version of that font. Chromium rejects the original legacy `kern` table (`Bad subtable 0 offset 8`). Only that invalid kerning table was removed; glyph outlines and Unicode mappings were verified identical.

To reproduce the web font using Python FontTools:

```python
from fontTools.ttLib import TTFont
font = TTFont('assets/opening/gangwon-saeeum.ttf')
del font['kern']
font.flavor = 'woff'
font.save('assets/opening/gangwon-saeeum.woff')
```

No font conversion is required to run the site. The generated WOFF is served locally.
