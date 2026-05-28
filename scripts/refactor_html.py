import os
import re

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src'))
partials_dir = os.path.join(src_dir, 'partials')

if not os.path.exists(partials_dir):
    os.makedirs(partials_dir)

def get_file_content(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file_content(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

index_html = get_file_content(os.path.join(src_dir, 'index.html'))

# Extract head assets (everything in head except title and charset/viewport)
# We'll just extract the specific block
head_assets = """  <script>
    // Prevent Flash of Unstyled Content (FOUC) on dark mode load
    (function () {
      try {
        const theme = localStorage.getItem('inkflow_theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      } catch (_) {}
    })();
  </script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.css">
  <link rel="stylesheet" href="/assets/css/inkflow-admin.css">"""
write_file_content(os.path.join(partials_dir, 'head_assets.html'), head_assets)

# Extract sidebar
sidebar_match = re.search(r'(<nav id="sidebar">.*?</nav>)', index_html, re.DOTALL)
if sidebar_match:
    write_file_content(os.path.join(partials_dir, 'sidebar.html'), sidebar_match.group(1))

# Extract topbar
topbar_match = re.search(r'(<header id="topbar">.*?</header>)', index_html, re.DOTALL)
if topbar_match:
    topbar_content = topbar_match.group(1)
    # Replace breadcrumb with variable
    topbar_template = re.sub(r'<ol class="breadcrumb mb-0">.*?</ol>', '<ol class="breadcrumb mb-0">\n          {{{breadcrumb}}}\n        </ol>', topbar_content, flags=re.DOTALL)
    write_file_content(os.path.join(partials_dir, 'topbar.html'), topbar_template)

# Extract footer scripts
scripts_content = """  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script type="module" src="/assets/js/inkflow-admin.js"></script>"""
write_file_content(os.path.join(partials_dir, 'scripts.html'), scripts_content)


# Process all HTML files
for file in os.listdir(src_dir):
    if not file.endswith('.html'):
        continue
    filepath = os.path.join(src_dir, file)
    content = get_file_content(filepath)
    
    # 1. Replace head assets
    content = re.sub(
        r'  <script>.*?\}\)\(\);\s*</script>\s*<meta charset="UTF-8">\s*<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        r'  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        content, flags=re.DOTALL
    )
    content = re.sub(
        r'  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css">\s*<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.css">\s*<link rel="stylesheet" href="/assets/css/inkflow-admin.css">',
        r'{{> head_assets }}',
        content, flags=re.DOTALL
    )

    # 2. Replace sidebar
    content = re.sub(r'<nav id="sidebar">.*?</nav>', '{{> sidebar }}', content, flags=re.DOTALL)
    
    # 3. Replace topbar
    # First extract the breadcrumb
    bc_match = re.search(r'<ol class="breadcrumb mb-0">(.*?)</ol>', content, re.DOTALL)
    if bc_match:
        bc_content = bc_match.group(1).strip()
        # Escape quotes for handlebars parameter
        bc_escaped = bc_content.replace('"', "'").replace('\n', ' ').replace('\r', '')
        # Clean multiple spaces
        bc_escaped = re.sub(r'\s+', ' ', bc_escaped)
        topbar_replacement = f'{{{{> topbar breadcrumb="{bc_escaped}" }}}}'
        content = re.sub(r'<header id="topbar">.*?</header>', topbar_replacement, content, flags=re.DOTALL)
    
    # 4. Replace scripts
    content = re.sub(r'  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>\s*<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>\s*<script type="module" src="/assets/js/inkflow-admin.js"></script>', '  {{> scripts }}', content, flags=re.DOTALL)
    
    write_file_content(filepath, content)
    print(f"Refactored {file}")

print("Done refactoring HTML partials.")
