import os
import re
from collections import Counter

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src'))
styles = Counter()

for file in os.listdir(src_dir):
    if not file.endswith('.html'): continue
    with open(os.path.join(src_dir, file), 'r', encoding='utf-8') as f:
        content = f.read()
        matches = re.findall(r'style="([^"]+)"', content)
        styles.update(matches)

print("Unique inline styles:")
for style, count in styles.most_common():
    print(f"{count:3d} : {style}")
