import os
import re
import uuid

html_dir = r'd:\Java\WorkSpace\New_HR\HR-11-codex\src\main\webapp\WEB-INF\view'
messages_vi = r'd:\Java\WorkSpace\New_HR\HR-11-codex\src\main\resources\messages_vi_VN.properties'
messages_en = r'd:\Java\WorkSpace\New_HR\HR-11-codex\src\main\resources\messages_en_US.properties'

# Regex to find Vietnamese characters
vi_regex = re.compile(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]')

# regex to find simple tags containing only text
tag_regex = re.compile(r'(<([a-zA-Z0-9]+)(\s+[^>]*)?>)([^<]*?)(</\2>)', re.IGNORECASE | re.DOTALL)

# list of files that do not have #{
files_to_process = []
for root, _, files in os.walk(html_dir):
    for file in files:
        if file.endswith('.html'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if '#{' not in content:
                    files_to_process.append(path)

translations = {}
msg_counter = 1

def generate_key():
    global msg_counter
    key = f"auto.ui.msg.{msg_counter:04d}"
    msg_counter += 1
    return key

for filepath in files_to_process:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We will search for > text < patterns and replace them with Thymeleaf inline text [[#{key}]]
    # This avoids modifying the HTML structure heavily.
    # We find text nodes using a regex
    # Pattern: > followed by whitespace/newlines, followed by text with Vi chars, followed by <
    # We use a negative lookahead to avoid scripts/styles
    
    # We will just find all texts between > and <
    # Then we replace those that contain Vietnamese characters
    
    def replacer(match):
        pre = match.group(1) # > or spaces
        text = match.group(2)
        post = match.group(3) # <
        
        # if text contains vietnamese
        if vi_regex.search(text):
            stripped_text = text.strip()
            # Check if it contains script or other things (shouldn't because of regex)
            # generate key
            key = generate_key()
            translations[key] = stripped_text
            
            # replace text with [[#{key}]] while keeping whitespace
            replaced = text.replace(stripped_text, f"[[#{{{key}}}]]")
            return f"{pre}{replaced}{post}"
        return match.group(0)

    # regex for > text <
    new_content = re.sub(r'(>)\s*([^<]+)\s*(<)', replacer, content)
    
    # also replace placeholder attributes
    def placeholder_replacer(match):
        attr = match.group(1)
        quote = match.group(2)
        text = match.group(3)
        if vi_regex.search(text):
            key = generate_key()
            translations[key] = text
            # return th:placeholder="#{key}"
            return f' th:{attr}={quote}#{{{key}}}{quote}'
        return match.group(0)
    
    new_content = re.sub(r'\s+(placeholder|title|value)=([\'"])([^\'"]+)\2', placeholder_replacer, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

# Append to properties
if translations:
    with open(messages_vi, 'a', encoding='utf-8') as f:
        f.write('\n# Auto Generated UI Keys\n')
        for k, v in translations.items():
            f.write(f"{k}={v}\n")
            
    with open(messages_en, 'a', encoding='utf-8') as f:
        f.write('\n# Auto Generated UI Keys\n')
        for k, v in translations.items():
            f.write(f"{k}={v}\n")

print(f"Processed {len(files_to_process)} files. Generated {len(translations)} keys.")
