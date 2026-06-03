import os
import re

html_dir = r'd:\Java\WorkSpace\New_HR\HR-11-codex\src\main\webapp\WEB-INF\view'
files_to_check = []
for root, _, files in os.walk(html_dir):
    for file in files:
        if file.endswith('.html'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if '#{' not in content:
                    files_to_check.append(path)

print(f"Total files without #{'{'}: {len(files_to_check)}")
