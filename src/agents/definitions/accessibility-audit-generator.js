
import re
import os
import shutil

pages = {
    "dashboard.ejs": "dashboard.css",
    "analytics-dashboard.ejs": "analytics.css",
    "creator-crm.ejs": "crm.css",
    "dm-automation.ejs": "dm-automation.css"
}

VIEW_DIR = "view"
CSS_DIR = os.path.join("public", "css")

os.makedirs(CSS_DIR, exist_ok=True)


def extract_body_attributes(content):
    match = re.search(r"<body\b([^>]*)>", content, re.IGNORECASE)

    if not match:
        return "", ""

    attrs = match.group(1).strip()

    class_match = re.search(
        r'\bclass\s*=\s*(["\'])(.*?)\1',
        attrs
    )

    body_class = class_match.group(2) if class_match else ""

    if class_match:
        attrs = attrs.replace(class_match.group(0), "", 1)

    return body_class, attrs.strip()


def process_page(page, css_file):
    filepath = os.path.join(VIEW_DIR, page)

    if not os.path.isfile(filepath):
        print(f"Skipping missing file: {filepath}")
        return

    with open(filepath, "r", encoding="utf-8") as file:
        content = file.read()

    # 1. Extract inline CSS
    style_match = re.search(
        r"<style\b[^>]*>(.*?)</style>",
        content,
        re.IGNORECASE | re.DOTALL
    )

    if style_match:
        css_content = style_match.group(1).strip()

        css_path = os.path.join(CSS_DIR, css_file)

        with open(css_path, "w", encoding="utf-8") as file:
            file.write(css_content + "\n")

        content = content[:style_match.start()] + content[style_match.end():]

    # 2. Extract body attributes
    body_class, body_attributes = extract_body_attributes(content)

    # 3. Extract page title
    title_match = re.search(
        r"title\s*:\s*['\"]([^'\"]+)['\"]",
        content
    )

    title = title_match.group(1) if title_match else "CreatorOS"

    # 4. Determine active navigation
    active_nav = page.replace(".ejs", "").replace("-dashboard", "")

    # 5. Generate shared header
    header_data = [
        f"activeNav: '{active_nav}'",
        f"title: '{title}'"
    ]

    if body_class:
        header_data.append(f"bodyClass: '{body_class}'")

    if body_attributes:
        header_data.append(f"bodyAttributes: '{body_attributes}'")

    header_data.append(
        f'''extraHead: '<link rel="stylesheet" href="/css/{css_file}">' '''
    )

    header_str = (
        "<%- include('partials/layout/header', {"
        + ", ".join(header_data)
        + "}) %>\n"
    )

    # 6. Locate topbar
    topbar_match = re.search(
        r"<%-\s*include\(['\"](?:\./)?partials/(?:layout/)?_?topbar[^)]*\)\s*%>",
        content
    )

    if topbar_match:
        start_idx = topbar_match.end()
    else:
        main_match = re.search(r"<main\b[^>]*>", content, re.IGNORECASE)

        if not main_match:
            print(f"Skipping {page}: main/topbar not found")
            return

        start_idx = main_match.start()

    tail = content[start_idx:]

    # 7. Remove closing layout tags
    tail = re.sub(r"</main\s*>", "", tail, flags=re.IGNORECASE)

    # Remove scripts partial
    tail = re.sub(
        r"<%-\s*include\(['\"](?:\./)?partials/(?:layout/)?_?scripts[^)]*\)\s*%>",
        "",
        tail
    )

    # Remove closing body and html tags
    tail = re.sub(
        r"</body\s*>\s*</html\s*>",
        "",
        tail,
        flags=re.IGNORECASE
    )

    # 8. Add shared footer
    tail = tail.rstrip() + "\n<%- include('partials/layout/footer') %>\n"

    final_content = header_str + tail

    # 9. Create backup before modifying original
    shutil.copy2(filepath, filepath + ".bak")

    with open(filepath, "w", encoding="utf-8") as file:
        file.write(final_content)

    print(f"Successfully processed: {page}")


for page, css_file in pages.items():
    process_page(page, css_file)

print("Processing complete.")
