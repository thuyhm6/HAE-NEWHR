import os
import re

java_dir = 'src/main/java/com/ait'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # If it's an interface and doesn't have @Mapper
    if 'public interface ' in content and '@Mapper' not in content:
        # Add import if missing
        if 'import org.apache.ibatis.annotations.Mapper;' not in content:
            # find last import or package
            match = re.search(r'import .+?;', content)
            if match:
                content = re.sub(r'(import .+?;)', r'\1\nimport org.apache.ibatis.annotations.Mapper;', content, count=1)
            else:
                content = re.sub(r'(package .+?;)', r'\1\n\nimport org.apache.ibatis.annotations.Mapper;', content, count=1)
        
        # Add @Mapper before public interface
        content = re.sub(r'(public interface \w+)', r'@Mapper\n\1', content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Added @Mapper to {filepath}")

for root, dirs, files in os.walk(java_dir):
    for fl in files:
        if fl.endswith('Mapper.java'):
            process_file(os.path.join(root, fl))

print("Done checking @Mapper annotations")
