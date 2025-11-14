#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
import re

# Read the CSS file
with open('src/themes/youtube-theme.css', 'r') as f:
    content = f.read()

# Define the replacement function
def replace_selector(match):
    # Get the full selector (e.g., "body.halloween-theme #masthead-container")
    full_selector = match.group(0)
    
    # Split by comma to handle multiple selectors
    selectors = [s.strip() for s in full_selector.split(',')]
    
    # Process each selector
    new_selectors = []
    for selector in selectors:
        if 'body.halloween-theme' in selector:
            # Replace body.halloween-theme with all theme classes
            base_selector = selector.replace('body.halloween-theme', 'THEME_PLACEHOLDER')
            
            # Create versions for all themes
            themes = [
                'body.halloween-theme',
                'body.theme-cyberpunk',
                'body.theme-matrix',
                'body.theme-synthwave',
                'body.theme-deepspace',
                'body.theme-toxic'
            ]
            
            for theme in themes:
                new_selectors.append(base_selector.replace('THEME_PLACEHOLDER', theme))
        else:
            new_selectors.append(selector)
    
    return ',\n'.join(new_selectors)

# Find all selectors that contain body.halloween-theme
# Match from body.halloween-theme to the opening brace {
pattern = r'body\.halloween-theme[^{]*(?={)'

# Replace all occurrences
content = re.sub(pattern, replace_selector, content)

# Write back
with open('src/themes/youtube-theme.css', 'w') as f:
    f.write(content)

print("✓ Fixed all selectors in youtube-theme.css")
