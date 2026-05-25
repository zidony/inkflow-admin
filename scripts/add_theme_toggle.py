import os
import re

def add_theme_toggle():
    print("=== Injecting Theme Toggle Button into HTML Pages ===")
    
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    src_dir = os.path.join(root_dir, "src")
    
    html_files = [f for f in os.listdir(src_dir) if f.endswith(".html")]
    print(f"Found {len(html_files)} HTML pages in src/")
    
    # Target element: <div class="topbar-actions">
    # We will replace it to insert the theme toggle button inside it
    target_pattern = re.compile(r'(<div class=["\']topbar-actions["\']\s*>)', re.IGNORECASE)
    
    toggle_html = '\n        <button class="topbar-icon-btn" id="theme-toggle-btn" data-action="toggle-theme" title="切换主题"><i class="bi bi-moon-stars"></i></button>'
    
    modified_count = 0
    for filename in html_files:
        filepath = os.path.join(src_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        if "data-action=\"toggle-theme\"" in content:
            print(f"Skipped (already has theme toggle): {filename}")
            continue
            
        # Check if topbar-actions exists in this HTML page (some pages like login.html might not have a topbar)
        if not target_pattern.search(content):
            print(f"Skipped (no topbar-actions): {filename}")
            continue
            
        # Perform injection
        content = target_pattern.sub(r'\1' + toggle_html, content)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
            
        print(f"Injected theme toggle: {filename}")
        modified_count += 1
        
    print(f"=== Injection complete! Modified {modified_count} files. ===")

if __name__ == "__main__":
    add_theme_toggle()
