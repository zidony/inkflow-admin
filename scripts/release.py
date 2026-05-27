import os
import json
import zipfile

def release():
    print("=== Starting inkflow-admin automated release packaging ===")
    
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dist_dir = os.path.join(root_dir, "dist")
    release_dir = os.path.join(root_dir, "releases")
    package_json_path = os.path.join(root_dir, "package.json")
    
    # 1. Verify dist/ exists
    if not os.path.exists(dist_dir):
        print("Error: 'dist/' directory does not exist! Please run 'npm run build' first.")
        return
        
    # 2. Get version from package.json
    version = "1.0.0"
    name = "inkflow-admin"
    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, "r", encoding="utf-8") as f:
                pkg = json.load(f)
                version = pkg.get("version", version)
                name = pkg.get("name", name)
        except Exception as e:
            print(f"Warning: could not read package.json: {e}")
            
    # 3. Create releases/ folder if it doesn't exist
    if not os.path.exists(release_dir):
        os.makedirs(release_dir)
        print("Created 'releases/' directory")
        
    folder_name = f"{name}-v{version}"
    zip_filename = f"{folder_name}.zip"
    zip_path = os.path.join(release_dir, zip_filename)
    
    # Remove existing zip if it exists
    if os.path.exists(zip_path):
        os.remove(zip_path)
        print(f"Removed old package: {zip_filename}")
        
    print(f"Creating ZIP archive: releases/{zip_filename}...")
    
    # 4. Perform zipping
    # We will wrap the files in a folder named like the project with its version (e.g. 'inkflow-admin-v2.0.0/')
    # inside the zip for neatness when the user extracts it.
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                file_abs_path = os.path.join(root, file)
                # Compute relative path in ZIP relative to the dist directory
                rel_path = os.path.relpath(file_abs_path, dist_dir)
                # Nest under the versioned root folder in ZIP
                archive_name = os.path.join(folder_name, rel_path)
                zip_file.write(file_abs_path, archive_name)
                
        # Copy any README*.md files in the root folder into the ZIP archive alongside compiled resources
        for file in os.listdir(root_dir):
            if file.lower().startswith("readme") and file.lower().endswith(".md"):
                readme_path = os.path.join(root_dir, file)
                zip_file.write(readme_path, os.path.join(folder_name, file))
                print(f"Added to ZIP: {file}")
                
    print(f"=== Success! Package created: releases/{zip_filename} ===")
    print(f"File size: {os.path.getsize(zip_path) / 1024:.2f} KB")

if __name__ == "__main__":
    release()
