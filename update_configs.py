import os
import re

conf_updates = {
    'logging.level.com.ait.mapper=': 'logging.level.com.ait=DEBUG\n#',
    '<mybatis:scan base-package="com.ait.mapper"': '<mybatis:scan base-package="com.ait" annotation="org.apache.ibatis.annotations.Mapper"',
    '<package name="com.ait.mapper"/>': '<!-- <package name="com.ait.mapper"/> -->',
    '<logger name="com.ait.mapper"': '<logger name="com.ait" '
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_content = content
    # For logback files:
    if "logger name=\"com.ait.mapper\"" in new_content:
        new_content = new_content.replace('logger name="com.ait.mapper"', 'logger name="com.ait"')
        
    # For properties files:
    if "logging.level.com.ait.mapper=" in new_content:
        # replace logging.level.com.ait.mapper=XXX with multiple lines
        pattern = r"logging\.level\.com\.ait\.mapper=(.*)"
        def repl(m):
            lvl = m.group(1)
            return f"logging.level.com.ait.ar={lvl}\nlogging.level.com.ait.hrm={lvl}\nlogging.level.com.ait.org={lvl}\nlogging.level.com.ait.sy={lvl}"
        new_content = re.sub(pattern, repl, new_content)
        
    if '<mybatis:scan base-package="com.ait.mapper"' in new_content:
        new_content = new_content.replace('<mybatis:scan base-package="com.ait.mapper"', '<mybatis:scan base-package="com.ait" annotation="org.apache.ibatis.annotations.Mapper"')
        
    if '<package name="com.ait.mapper"/>' in new_content:
        new_content = new_content.replace('<package name="com.ait.mapper"/>', '<!-- <package name="com.ait.mapper"/> -->')
        
    if '<Logger name="com.ait.mapper"' in new_content:
        new_content = new_content.replace('<Logger name="com.ait.mapper"', '<Logger name="com.ait"')
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src/main'):
    for fl in files:
        if fl.endswith(('.properties', '.xml', '.java')):
            process_file(os.path.join(root, fl))

print("Done config updates")
