import os
import re

java_dir = 'src/main/java/com/ait'
xml_dir = 'src/main/resources/com/ait/mapper'

mapper_packages = {}

# Find all java mappers and their packages
for root, dirs, files in os.walk(java_dir):
    for fl in files:
        if fl.endswith('Mapper.java'):
            filepath = os.path.join(root, fl)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                # extract package name
                match = re.search(r'package\s+([\w\.]+);', content)
                if match:
                    pkg = match.group(1)
                    classname = fl[:-5] # remove .java
                    mapper_packages[classname] = pkg + '.' + classname

# Update all xml mappers
for root, dirs, files in os.walk(xml_dir):
    for fl in files:
        if fl.endswith('.xml'):
            filepath = os.path.join(root, fl)
            classname = fl[:-4] # remove .xml
            if classname in mapper_packages:
                new_namespace = mapper_packages[classname]
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # replace namespace
                new_content = re.sub(r'namespace="[^"]+"', f'namespace="{new_namespace}"', content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f'Updated {fl} to namespace {new_namespace}')

print('Done')
