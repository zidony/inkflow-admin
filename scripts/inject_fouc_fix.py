import os
import re

def inject_fouc_fix():
    print("=== Injecting Head Theme Blocker to Prevent White Flash (FOUC) ===")
    
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    src_dir = os.path.join(root_dir, "src")
    
    html_files = [f for f in os.listdir(src_dir) if f.endswith(".html")]
    print(f"Found {len(html_files)} HTML pages in src/")
    
    # Target element: <head> (we will insert the blocking script right below it)
    target_pattern = re.compile(r'(<head\s*>)', re.IGNORECASE)
    
    blocking_script = """
  <script>
    // Prevent Flash of Unstyled Content (FOUC) on dark mode load
    (function () {
      try {
        const theme = localStorage.getItem('inkflow_theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      } catch (_) {}
    })();
  </script>"""
    
    modified_count = 0
    for filename in html_files:
        filepath = os.path.join(src_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        if "Prevent Flash of Unstyled Content" in content:
            print(f"Skipped (already has FOUC fix): {filename}")
            continue
            
        if not target_pattern.search(content):
            print(f"Skipped (no <head> tag found): {filename}")
            continue
            
        # Perform injection
        content = target_pattern.sub(r'\1' + blocking_script, content)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
            
        print(f"Injected FOUC fix: {filename}")
        modified_count += 1
        
    print(f"=== Injection complete! Modified {modified_count} files. ===")

if __name__ == "__main__":
    inject_fouc_fix()
