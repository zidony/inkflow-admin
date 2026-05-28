import os
import re

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src'))
css_dir = os.path.join(src_dir, 'assets', 'css')
utilities_css = os.path.join(css_dir, '_utilities.css')

# Define replacements: { "style string": "class_name" }
# None value means we keep the inline style (e.g. for dynamic vars)
style_mappings = {
    'width:15px;height:15px;cursor:pointer': 'table-check-box',
    'border-bottom:1px solid var(--ink-gray-100)': 'border-bottom border-ink-gray-100',
    'margin-bottom:2px': 'mb-2px',
    'margin-bottom:10px': 'mb-10px',
    'width:28px;height:28px': 'wh-28px',
    'padding:12px 18px': 'p-12-18',
    'max-width:260px': 'mw-260px',
    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:240px': 'text-truncate mw-240px',
    'color:inherit': 'text-inherit',
    'width:110px;height:32px': 'wh-110-32',
    'background:var(--ink-50)': 'bg-ink-50',
    'min-width:240px': 'min-w-240px',
    'width:100px': 'w-100px',
    'width:50px': 'w-50px',
    'font-size:.9rem': 'fs-90',
    'width:140px': 'w-140px',
    'margin:0': 'm-0',
    'text-decoration:none': 'text-decoration-none',
    'min-width:200px': 'min-w-200px',
    'width:120px': 'w-120px',
    'background:#dcfce7': 'bg-success-subtle',
    'background:var(--ink-gray-100)': 'bg-ink-gray-100',
    'cursor:pointer': 'cursor-pointer',
    'height:38px': 'h-38px',
    'aspect-ratio:16/9': 'ratio ratio-16x9',
    'flex:1': 'flex-fill',
    'font-size:.7rem': 'fs-70',
    'border:none': 'border-0',
    'border:none;': 'border-0',
    'width:100%': 'w-100',
    'height:100%': 'h-100',
    'display:block': 'd-block',
    'display:none': 'd-none',
    'text-align:center': 'text-center',
    'padding:20px': 'p-20px',
    'width:auto;height:30px;padding:3px 10px': 'form-select-sm-custom',
    'height:28px;padding:0 10px': 'btn-h28px',
    'padding:0 20px!important': 'px-20px-imp'
}

# Add custom utility CSS
custom_utilities = """
/* ============================================================
   CUSTOM UTILITIES extracted from inline styles
   ============================================================ */
.table-check-box { width: 15px; height: 15px; cursor: pointer; }
.border-ink-gray-100 { border-color: var(--ink-gray-100) !important; }
.mb-2px { margin-bottom: 2px !important; }
.mb-10px { margin-bottom: 10px !important; }
.wh-28px { width: 28px !important; height: 28px !important; }
.p-12-18 { padding: 12px 18px !important; }
.mw-260px { max-width: 260px !important; }
.mw-240px { max-width: 240px !important; }
.text-inherit { color: inherit !important; }
.wh-110-32 { width: 110px !important; height: 32px !important; }
.bg-ink-50 { background-color: var(--ink-50) !important; }
.min-w-240px { min-width: 240px !important; }
.min-w-200px { min-width: 200px !important; }
.w-100px { width: 100px !important; }
.w-140px { width: 140px !important; }
.w-120px { width: 120px !important; }
.w-50px { width: 50px !important; }
.bg-success-subtle { background-color: #dcfce7 !important; }
.bg-ink-gray-100 { background-color: var(--ink-gray-100) !important; }
.cursor-pointer { cursor: pointer !important; }
.h-38px { height: 38px !important; }
.fs-90 { font-size: 0.9rem !important; }
.fs-70 { font-size: 0.7rem !important; }
.p-20px { padding: 20px !important; }
.form-select-sm-custom { width: auto !important; height: 30px !important; padding: 3px 10px !important; }
.btn-h28px { height: 28px !important; padding: 0 10px !important; }
.px-20px-imp { padding-left: 20px !important; padding-right: 20px !important; }
"""

with open(utilities_css, 'a', encoding='utf-8') as f:
    f.write(custom_utilities)

html_files = [f for f in os.listdir(src_dir) if f.endswith('.html')] + \
             [os.path.join('partials', f) for f in os.listdir(os.path.join(src_dir, 'partials')) if f.endswith('.html')]

for file in html_files:
    filepath = os.path.join(src_dir, file)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    def replace_style(match):
        style_str = match.group(1).strip()
        if style_str in style_mappings:
            class_name = style_mappings[style_str]
            return f'class="{class_name}"' # Note: We need to merge this class with existing classes if present. 
            # This is a simplification. A better approach is to use a second regex pass to merge classes.
        return match.group(0) # Keep original if no mapping

    # To handle class merging safely, we do it in a custom way:
    # Find all elements with style="..."
    # If they have class="...", append the new class.
    
    # We will just do a simple replace first.
    def replace_inline(content):
        # Find all tags with style attribute
        def element_replacer(m):
            tag_str = m.group(0)
            style_m = re.search(r'style="([^"]+)"', tag_str)
            if not style_m: return tag_str
            
            style_str = style_m.group(1).strip()
            if style_str not in style_mappings:
                return tag_str
                
            new_classes = style_mappings[style_str]
            
            # Remove the style attribute
            new_tag_str = tag_str.replace(style_m.group(0), '')
            
            # Add to class attribute if exists
            class_m = re.search(r'class="([^"]+)"', new_tag_str)
            if class_m:
                old_classes = class_m.group(1)
                new_tag_str = new_tag_str.replace(f'class="{old_classes}"', f'class="{old_classes} {new_classes}"')
            else:
                # Add class attribute at the end of the opening tag
                new_tag_str = new_tag_str.replace('>', f' class="{new_classes}">', 1)
                
            return new_tag_str
            
        return re.sub(r'<[^>]+style="[^"]+"[^>]*>', element_replacer, content)

    new_content = replace_inline(content)
    # clean up multiple spaces in tags
    new_content = re.sub(r' +class=', ' class=', new_content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Inline styles refactored!")
