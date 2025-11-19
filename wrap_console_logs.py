#!/usr/bin/env python3
"""
Script to wrap all console.log and console.warn statements with DEBUG checks
"""
import re
import sys

def wrap_console_statements(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match unwrapped console.log and console.warn
    # Matches lines that start with whitespace, then console.log or console.warn
    # but NOT preceded by "if (DEBUG)"
    
    lines = content.split('\n')
    modified_lines = []
    
    for i, line in enumerate(lines):
        # Check if this line has console.log or console.warn
        if re.match(r'^(\s+)console\.(log|warn)\(', line):
            # Check if previous line already has "if (DEBUG)"
            if i > 0 and 'if (DEBUG)' in lines[i-1]:
                # Already wrapped, keep as is
                modified_lines.append(line)
            else:
                # Need to wrap it
                indent = re.match(r'^(\s+)', line).group(1)
                modified_lines.append(f'{indent}if (DEBUG) {line.lstrip()}')
        else:
            modified_lines.append(line)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(modified_lines))
    
    print(f"Processed {filepath}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 wrap_console_logs.py <filepath>")
        sys.exit(1)
    
    wrap_console_statements(sys.argv[1])
