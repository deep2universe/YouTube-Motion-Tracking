# Implementation Plan

## Overview
This implementation plan adds horror video filters to the YouTube Motion Tracking Halloween Edition extension. Filters work additively with animations, using CSS filters and canvas overlays. Each task builds incrementally, ensuring the extension remains functional throughout development.

---

## 1. Create FilterEnum Class

Create the filter registry with all horror filter definitions.

- [ ] 1.1 Create new file src/filterEnum.js
  - Define FilterEnum class structure
  - Add constructor with name, displayName, icon, cssFilter, overlayType parameters
  - _Requirements: 8.1, 8.2_

- [ ] 1.2 Add filter definitions to FilterEnum
  - Add 'none' filter (no effect, clear button)
  - Add 'vhs' filter with CSS and scanlines overlay
  - Add 'foundFootage' filter with CSS and grain overlay
  - Add 'xrayLab' filter with CSS and grid overlay
  - Add 'bloodMoon' filter with CSS and vignette overlay
  - Add 'noir' filter with CSS and grain overlay
  - Add 'toxicWaste' filter with CSS and glow overlay
  - _Requirements: 1.1, 9.1, 10.1, 11.1, 12.1_

- [ ] 1.3 Add utility methods to FilterEnum
  - Implement getAllFilters() static method
  - Implement getFilterByName(name) static method
  - _Requirements: 8.3, 8.4_

---

## 2. Create OverlayRenderer Class

Implement canvas overlay rendering for filter effects.

- [ ] 2.1 Add OverlayRenderer class to anim.js
  - Create class with constructor(canvas, ctx)
  - Add overlayType property and animationFrame counter
  - Implement setOverlayType(type) method
  - Implement main render() method with switch statement
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2.2 Implement scanlines overlay
  - Create renderScanlines() method
  - Draw horizontal lines with 2px spacing
  - Use semi-transparent black (rgba(0, 0, 0, 0.5))
  - _Requirements: 2.1, 2.3, 9.3_

- [ ] 2.3 Implement grain overlay
  - Create renderGrain() method
  - Generate random noise particles (5% density)
  - Use ImageData for efficient rendering
  - _Requirements: 2.1, 2.3, 10.3_

- [ ] 2.4 Implement grid overlay
  - Create renderGrid() method
  - Draw 20px grid pattern in green
  - Add animated scanning line moving vertically
  - _Requirements: 2.1, 2.3, 11.3, 11.4_

- [ ] 2.5 Implement vignette overlay
  - Create renderVignette() method
  - Use radial gradient from center to edges
  - Dark edges with transparent center
  - _Requirements: 2.1, 2.3, 10.2, 12.3_

- [ ] 2.6 Implement glow overlay
  - Create renderGlow() method
  - Use radial gradient with green color
  - Subtle glow effect from center
  - _Requirements: 2.1, 2.3_

---

## 3. Create FilterManager Class

Implement filter management and application logic.

- [ ] 3.1 Add FilterManager class to content.js
  - Create class with constructor(videoElement, canvas, ctx)
  - Initialize properties: video, canvas, ctx, currentFilter, overlayRenderer
  - Create OverlayRenderer instance
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3.2 Implement applyFilter() method
  - Get filter definition by name using FilterEnum
  - Apply CSS filter string to video.style.filter
  - Update overlayRenderer overlay type
  - Store current filter reference
  - Persist to Chrome storage
  - _Requirements: 1.2, 1.3, 6.1_

- [ ] 3.3 Implement clearFilter() method
  - Call applyFilter('none') to remove all filters
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 3.4 Implement renderOverlay() method
  - Check if current filter has overlay type
  - Call overlayRenderer.render() if overlay exists
  - _Requirements: 2.2, 2.4_

- [ ] 3.5 Implement loadSavedFilter() method
  - Load 'currentFilter' from Chrome storage
  - Default to 'none' if not found
  - Call applyFilter() with loaded filter name
  - _Requirements: 6.2, 6.3, 6.5_

---

## 4. Integrate FilterManager into Content Script

Add filter management to the main content script initialization and rendering.

- [ ] 4.1 Add filterEnum.js to manifest.json
  - Add src/filterEnum.js to content_scripts files array
  - Ensure it loads before content.js
  - _Requirements: 1.1_

- [ ] 4.2 Initialize FilterManager in content.js
  - Declare global filterManager variable
  - Create FilterManager instance after canvas initialization
  - Call loadSavedFilter() during initialization
  - _Requirements: 3.1, 6.2_

- [ ] 4.3 Integrate overlay rendering into frame loop
  - Add filterManager.renderOverlay() call in startDetection()
  - Render overlays before animations
  - Ensure proper layering (overlay → animation)
  - _Requirements: 2.4, 3.1, 3.2_

- [ ] 4.4 Handle filter persistence independently
  - Ensure filter storage uses separate key from animations
  - Maintain filter state when animations change
  - Maintain animation state when filters change
  - _Requirements: 6.3, 7.1, 7.2_

---

## 5. Create Filter UI Section

Add dedicated filter section to the player popup.

- [ ] 5.1 Add filter section HTML to initVideoPlayerPopup()
  - Create filter section container div
  - Add filter section title "🎬 Horror Filters 🎥"
  - Create filter buttons container
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 5.2 Generate filter buttons dynamically
  - Loop through FilterEnum.getAllFilters()
  - Create button for each filter with icon and display name
  - Add data-filter attribute with filter name
  - Add 'active' class to current filter
  - _Requirements: 4.3, 4.4_

- [ ] 5.3 Add filter button click handlers
  - Add event listeners to all filter buttons
  - Call filterManager.applyFilter() on click
  - Update active button styling
  - Remove active class from other filter buttons
  - _Requirements: 1.2, 5.1, 5.4_

- [ ] 5.4 Ensure filter UI is independent from animation UI
  - Separate filter buttons from animation buttons
  - Different styling for filter section
  - Clear visual separation between sections
  - _Requirements: 4.1, 4.2, 4.5, 7.4_

---

## 6. Style Filter UI Section

Apply Halloween-themed styling to the filter section.

- [ ] 6.1 Add filter section container styles to content.css
  - Add margin-top and padding-top for spacing
  - Add border-top with red color for separation
  - _Requirements: 4.2, 4.5_

- [ ] 6.2 Add filter section title styles
  - Red color (#DC143C) with text shadow
  - Center alignment and bold font
  - Appropriate font size (16px)
  - _Requirements: 4.2_

- [ ] 6.3 Add filter button base styles
  - Red gradient background (dark red to crimson)
  - Red border and white text
  - Border radius and padding
  - Box shadow with red glow
  - _Requirements: 4.3, 4.5_

- [ ] 6.4 Add filter button hover and active states
  - Scale transform on hover
  - Enhanced glow on hover
  - Gold border for active filter
  - Different gradient for active state
  - _Requirements: 4.3, 5.4_

- [ ] 6.5 Add special styling for "None" button
  - Gray gradient instead of red
  - Different hover effect
  - Clear visual distinction as "clear filter" button
  - _Requirements: 5.1, 5.4_

---

## 7. Handle Filter and Animation Independence

Ensure filters and animations work together without interference.

- [ ] 7.1 Verify CSS filters don't affect canvas rendering
  - Test that video.style.filter only affects video element
  - Ensure canvas animations render normally over filtered video
  - Verify alpha blending works correctly
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 7.2 Verify overlay rendering doesn't interfere with animations
  - Test that overlays render before animations in frame loop
  - Ensure animations are visible over overlays
  - Check that both use proper alpha values
  - _Requirements: 3.3, 3.4, 3.5_

- [ ] 7.3 Exclude filters from random animation mode
  - Verify random animation switching doesn't change filter
  - Ensure filter persists during random animation cycles
  - Test manual filter changes during random mode
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 7.4 Test filter and animation switching combinations
  - Switch filters while animation is active
  - Switch animations while filter is active
  - Verify both states persist correctly
  - _Requirements: 3.4, 3.5, 6.3_

---

## 8. Testing and Validation

Verify all filters work correctly and meet requirements.

- [ ] 8.1 Test all filter visual effects
  - Test VHS filter (warm tones, blur, scanlines)
  - Test Found Footage filter (desaturated, grain, vignette)
  - Test X-Ray Lab filter (green tones, grid, scanning line)
  - Test Blood Moon filter (red tones, vignette)
  - Test Noir filter (black and white, grain)
  - Test Toxic Waste filter (green tint, glow)
  - Verify "None" clears all filters
  - _Requirements: 1.1, 9.1-9.5, 10.1-10.5, 11.1-11.5, 12.1-12.5_

- [ ] 8.2 Test filter and animation combinations
  - Apply filter with skeleton animations
  - Apply filter with pumpkin animations
  - Apply filter with particle animations
  - Verify both are visible simultaneously
  - Check alpha blending is correct
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8.3 Test filter UI functionality
  - Click each filter button and verify application
  - Verify active button styling updates
  - Test "None" button clears filter
  - Verify filter section is visually distinct
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.4_

- [ ] 8.4 Test filter persistence
  - Select filter and reload page
  - Verify filter persists across page loads
  - Navigate to new video and verify filter persists
  - Test with different filters
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8.5 Test filter independence from animations
  - Change animation while filter is active
  - Change filter while animation is active
  - Enable random animation mode with filter active
  - Verify filter doesn't change during random mode
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8.6 Test performance with filters
  - Measure FPS with filter + animation active
  - Test all filter/animation combinations
  - Verify 30+ FPS maintained
  - Check memory usage stays within limits
  - Test filter switching speed (< 100ms)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

---

## Notes

- All tasks focus on code implementation
- Each task builds incrementally on previous tasks
- Filters are completely independent from animations
- CSS filters provide the main visual effect
- Canvas overlays add additional texture/atmosphere
- UI uses red/dark theme to distinguish from orange animation section
- Performance is maintained through GPU-accelerated CSS filters
- Testing verifies both visual quality and technical requirements

---

## Implementation Status

### 🔲 Not Started (All Sections)
All implementation tasks are pending. Ready to begin with Section 1: Create FilterEnum Class.
