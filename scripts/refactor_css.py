import os
import re

css_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'css'))
main_css = os.path.join(css_dir, 'inkflow-admin.css')

with open(main_css, 'r', encoding='utf-8') as f:
    content = f.read()

# We want to split based on /* ============================================================
sections = re.split(r'/\* ============================================================\n   (.*?(?=\n   ============================================================ \*/))\n   ============================================================ \*/', content)

# sections[0] is everything before the first divider
# sections[1] is the name of the first section
# sections[2] is the content of the first section

modules = {
    '_variables.css': '',
    '_reset.css': '',
    '_layout.css': '',
    '_components.css': '',
    '_utilities.css': ''
}

header_info = sections[0].strip() + "\n\n"

for i in range(1, len(sections), 2):
    sec_title = sections[i].strip()
    sec_content = sections[i+1]
    
    header_comment = f'/* ============================================================\n   {sec_title}\n   ============================================================ */'
    block = header_comment + sec_content
    
    if "CSS CUSTOM PROPERTIES" in sec_title:
        modules['_variables.css'] += block
    elif "BASE" in sec_title:
        modules['_reset.css'] += block
    elif sec_title in ["SIDEBAR", "LAYOUT", "TOPBAR", "PAGE CONTENT"]:
        modules['_layout.css'] += block
    elif "UTILITIES" in sec_title or "UTILS" in sec_title:
        modules['_utilities.css'] += block
    elif "InkFlow Admin — Shared Stylesheet" in sec_title:
        pass # this is the top header, ignore it or add it to root
    else:
        # Everything else goes to components
        modules['_components.css'] += block

# Write modules
for filename, mod_content in modules.items():
    with open(os.path.join(css_dir, filename), 'w', encoding='utf-8') as f:
        f.write(mod_content.strip() + "\n")

# Re-write main css
new_main_content = """/* ============================================================
   InkFlow Admin — Shared Stylesheet  v1.9.1
   Stack : Bootstrap 5.3.8 + Bootstrap Icons 1.13.1 + Custom
   Theme : Deep Teal-Blue  (#0d6ecc primary)
   ============================================================ */

/* ---------- Google Fonts ---------- */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

/* Modules */
@import './_variables.css';
@import './_reset.css';
@import './_layout.css';
@import './_components.css';
@import './_utilities.css';
"""

with open(main_css, 'w', encoding='utf-8') as f:
    f.write(new_main_content)

print("CSS split successfully!")
