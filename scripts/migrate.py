import os
import re
import shutil

def migrate():
    print("=== Starting inkflow-admin codebase migration ===")
    
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    src_dir = os.path.join(root_dir, "src")
    
    # 1. Create src/ directory if not exists
    if not os.path.exists(src_dir):
        os.makedirs(src_dir)
        print("Created src/ directory")
    
    # 2. Find all .html files in the root folder
    html_files = [f for f in os.listdir(root_dir) if f.endswith(".html")]
    print(f"Found {len(html_files)} HTML pages in root directory")
    
    # Define rewriting patterns
    # Matches href="assets/css/inkflow-admin.css"
    css_pattern = re.compile(r'href=["\']assets/css/inkflow-admin\.css["\']', re.IGNORECASE)
    # Matches src="assets/js/inkflow-admin.js"
    js_pattern = re.compile(r'src=["\']assets/js/inkflow-admin\.js["\']', re.IGNORECASE)
    # Matches generic src="assets/... or href="assets/... just in case
    generic_pattern = re.compile(r'(src|href)=["\']assets/([^"\']+)["\']', re.IGNORECASE)
    
    for filename in html_files:
        src_path = os.path.join(root_dir, filename)
        dest_path = os.path.join(src_dir, filename)
        
        with open(src_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Rewrite CSS link
        content = css_pattern.sub('href="/assets/css/inkflow-admin.css"', content)
        
        # Rewrite JS script to module
        content = js_pattern.sub('type="module" src="/assets/js/inkflow-admin.js"', content)
        
        # Fallback for any other assets/ occurrences
        content = generic_pattern.sub(r'\1="/assets/\2"', content)
        
        # Write to src/
        with open(dest_path, "w", encoding="utf-8") as f:
            f.write(content)
            
        print(f"Migrated and refactored: {filename} -> src/{filename}")
        
        # Delete original HTML
        os.remove(src_path)
        print(f"Deleted original: {filename}")
        
    # 3. Move assets/ directory to src/assets/
    old_assets = os.path.join(root_dir, "assets")
    new_assets = os.path.join(src_dir, "assets")
    
    if os.path.exists(old_assets):
        if os.path.exists(new_assets):
            shutil.rmtree(new_assets)
        shutil.move(old_assets, new_assets)
        print("Moved assets/ to src/assets/")
    else:
        print("assets/ folder already moved or not found at root")
        
    print("=== Migration completed successfully! ===")

if __name__ == "__main__":
    migrate()
