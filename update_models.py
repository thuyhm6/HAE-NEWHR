import os
import re

java_dir = 'src/main/java/com/ait'
xml_dir = 'src/main/resources/com/ait/mapper'

class_packages = {}

# Find all java classes and their packages
for root, dirs, files in os.walk(java_dir):
    for fl in files:
        if fl.endswith('.java'):
            filepath = os.path.join(root, fl)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                # extract package name
                match = re.search(r'package\s+([\w\.]+);', content)
                if match:
                    pkg = match.group(1)
                    classname = fl[:-5] # remove .java
                    class_packages[classname] = pkg + '.' + classname

# Update all xml mappers
for root, dirs, files in os.walk(xml_dir):
    for fl in files:
        if fl.endswith('.xml'):
            filepath = os.path.join(root, fl)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            
            # Find all com.ait.* references in XML and replace them if they changed
            # E.g. com.ait.model.ArItem -> com.ait.ar.attendanceSettings.model.ArItem
            # E.g. com.ait.dto.EmployeeSearchResponse -> com.ait.hrm.empinfo.dto.EmployeeSearchResponse
            
            # Using regex to match com.ait.[something].[ClassName]
            matches = re.finditer(r'com\.ait\.(?:model|dto|vo)\.(\w+)', new_content)
            replacements = {}
            for match in matches:
                classname = match.group(1)
                if classname in class_packages:
                    replacements[match.group(0)] = class_packages[classname]

            for old_fqn, new_fqn in replacements.items():
                new_content = new_content.replace(old_fqn, new_fqn)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated models in {fl}')

print('Done updating models')
