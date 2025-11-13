# Requirements Document

## Introduction

This document specifies the requirements for adding horror video filters to the YouTube Motion Tracking Halloween Edition Chrome extension. The Filter System will apply cinematic horror effects (VHS, Found Footage, X-Ray Lab, Blood Moon, etc.) to YouTube videos using CSS filters and canvas overlays. Filters work additively with existing Halloween animations, allowing both to be visible simultaneously. The feature includes a dedicated UI section for filter selection, independent from animation controls, with the ability to completely disable filters.

## Glossary

- **Filter System**: The subsystem that applies CSS filters and canvas overlays to transform video appearance
- **Horror Filter**: A combination of CSS filter properties and optional canvas overlay effects that create a specific horror aesthetic
- **CSS Filter**: Browser-native filter effects applied to the video element (contrast, saturation, hue-rotate, blur, etc.)
- **Canvas Overlay**: Additional visual effects rendered on canvas layer (scanlines, film grain, vignette, grid patterns)
- **Animation System**: The existing Halloween animation system that tracks body movements
- **Filter Selector**: The UI control in the player popup for choosing horror filters
- **Additive Rendering**: Both filters and animations visible simultaneously without interference
- **mainVideo**: The YouTube video HTML element that filters are applied to
- **Extension**: The YouTube Motion Tracking Halloween Edition Chrome browser extension

## Requirements

### Requirement 1

**User Story:** As a YouTube viewer, I want to apply horror film filters to videos, so that I can transform any video into a horror aesthetic

#### Acceptance Criteria

1. THE Filter System SHALL provide at least 6 distinct horror filter presets (VHS, Found Footage, X-Ray Lab, Blood Moon, Noir, Toxic Waste)
2. WHEN a filter is selected, THE Filter System SHALL apply CSS filter properties to the mainVideo element within 100ms
3. THE Filter System SHALL maintain video playback performance with filters active
4. WHEN a filter is active, THE Filter System SHALL preserve video audio without modification
5. THE Filter System SHALL allow filter changes without interrupting video playback

### Requirement 2

**User Story:** As a YouTube viewer, I want filters to include canvas overlays like scanlines and film grain, so that the horror effects feel more authentic and cinematic

#### Acceptance Criteria

1. THE Filter System SHALL provide at least 4 canvas overlay types (scanlines, film grain, vignette, grid pattern)
2. WHEN a filter with canvas overlay is active, THE Filter System SHALL render the overlay on the canvas layer
3. THE Filter System SHALL use semi-transparent rendering for overlays to maintain video visibility
4. THE Filter System SHALL synchronize canvas overlay rendering with the animation frame loop
5. THE Filter System SHALL ensure canvas overlays do not obscure more than 30% of video content

### Requirement 3

**User Story:** As a YouTube viewer, I want filters to work alongside Halloween animations, so that I can combine horror video effects with motion tracking animations

#### Acceptance Criteria

1. WHEN both a filter and animation are active, THE Filter System SHALL render both effects simultaneously
2. THE Filter System SHALL apply CSS filters to the video element without affecting canvas-rendered animations
3. THE Filter System SHALL ensure animations remain visible and properly alpha-blended over filtered video
4. WHEN switching animations, THE Filter System SHALL maintain the active filter without interruption
5. WHEN switching filters, THE Filter System SHALL maintain the active animation without interruption

### Requirement 4

**User Story:** As a YouTube viewer, I want a dedicated filter section in the UI, so that I can easily distinguish filters from animations

#### Acceptance Criteria

1. THE Filter System SHALL display a visually distinct "Horror Filters" section in the player popup
2. THE Filter System SHALL use different styling for filter buttons compared to animation buttons
3. THE Filter System SHALL display filter icons that represent each filter's visual effect
4. THE Filter System SHALL organize filters in a separate row or section from animations
5. THE Filter System SHALL use a distinct color scheme (e.g., red/dark theme) for the filter section

### Requirement 5

**User Story:** As a YouTube viewer, I want a clear button to remove all filters, so that I can quickly return to normal video appearance

#### Acceptance Criteria

1. THE Filter System SHALL provide a "Clear Filter" or "No Filter" button in the filter section
2. WHEN the clear button is clicked, THE Filter System SHALL remove all CSS filters from the video within 100ms
3. WHEN the clear button is clicked, THE Filter System SHALL remove all canvas overlays
4. THE Filter System SHALL visually indicate when no filter is active
5. THE Filter System SHALL maintain active animations when clearing filters

### Requirement 6

**User Story:** As a YouTube viewer, I want my filter selection to persist across videos, so that I don't have to reselect my preferred filter for each video

#### Acceptance Criteria

1. THE Filter System SHALL store the selected filter name in Chrome storage
2. WHEN navigating to a new video, THE Filter System SHALL load and apply the previously selected filter within 500ms
3. THE Filter System SHALL persist filter selection independently from animation selection
4. WHEN the extension is reloaded, THE Filter System SHALL restore the last selected filter
5. THE Filter System SHALL handle missing or invalid filter names by defaulting to no filter

### Requirement 7

**User Story:** As a YouTube viewer, I want filters excluded from random animation mode, so that my chosen filter remains stable while animations change

#### Acceptance Criteria

1. WHEN random animation mode is active, THE Filter System SHALL not change the selected filter
2. THE Filter System SHALL maintain the active filter while animations cycle randomly
3. THE Filter System SHALL provide independent random mode controls for filters (if implemented)
4. THE Filter System SHALL clearly indicate that filters are independent from animation randomization
5. THE Filter System SHALL allow manual filter changes while random animation mode is active

### Requirement 8

**User Story:** As a developer, I want a FilterEnum class similar to AnimEnum, so that filters are defined in a maintainable and extensible way

#### Acceptance Criteria

1. THE Filter System SHALL implement a FilterEnum class with static filter definitions
2. THE FilterEnum class SHALL store filter name, CSS filter string, and optional overlay type for each filter
3. THE FilterEnum class SHALL provide methods to retrieve all filter definitions
4. THE FilterEnum class SHALL use a structure similar to AnimEnum for consistency
5. THE FilterEnum class SHALL support adding new filters without modifying core logic

### Requirement 9

**User Story:** As a YouTube viewer, I want VHS filter effects, so that videos look like old VHS tapes

#### Acceptance Criteria

1. THE Filter System SHALL provide a VHS filter with contrast boost, saturation reduction, and hue shift
2. THE VHS filter SHALL include slight blur effect to simulate analog video quality
3. THE VHS filter SHALL render horizontal scanlines as canvas overlay
4. THE VHS filter SHALL optionally include tracking noise or distortion effects
5. THE VHS filter SHALL use warm color tones typical of VHS recordings

### Requirement 10

**User Story:** As a YouTube viewer, I want Found Footage filter effects, so that videos look like amateur horror film recordings

#### Acceptance Criteria

1. THE Filter System SHALL provide a Found Footage filter with desaturated colors and high contrast
2. THE Found Footage filter SHALL include vignette effect darkening the edges
3. THE Found Footage filter SHALL render film grain as canvas overlay
4. THE Found Footage filter SHALL optionally include timestamp overlay in corner
5. THE Found Footage filter SHALL create a handheld camera aesthetic

### Requirement 11

**User Story:** As a YouTube viewer, I want X-Ray Lab filter effects, so that videos have a medical/scientific horror aesthetic

#### Acceptance Criteria

1. THE Filter System SHALL provide an X-Ray Lab filter with high contrast and green phosphorescent tones
2. THE X-Ray Lab filter SHALL optionally invert colors for X-ray appearance
3. THE X-Ray Lab filter SHALL render grid pattern overlay for medical equipment aesthetic
4. THE X-Ray Lab filter SHALL include scanning line effect moving across screen
5. THE X-Ray Lab filter SHALL use green/cyan color palette typical of medical displays

### Requirement 12

**User Story:** As a YouTube viewer, I want Blood Moon filter effects, so that videos have a dark, ominous red atmosphere

#### Acceptance Criteria

1. THE Filter System SHALL provide a Blood Moon filter with red/sepia color tones
2. THE Blood Moon filter SHALL include high contrast and hue rotation toward red
3. THE Blood Moon filter SHALL render dark vignette for ominous atmosphere
4. THE Blood Moon filter SHALL use warm red tones reminiscent of blood or moonlight
5. THE Blood Moon filter SHALL maintain sufficient brightness for video visibility

### Requirement 13

**User Story:** As a developer, I want filters to maintain extension performance, so that the viewing experience remains smooth

#### Acceptance Criteria

1. THE Filter System SHALL maintain 30+ FPS animation performance with filters active
2. THE Filter System SHALL apply CSS filters using GPU acceleration when available
3. THE Filter System SHALL optimize canvas overlay rendering to minimize performance impact
4. THE Filter System SHALL not increase memory usage by more than 20MB when filters are active
5. THE Filter System SHALL handle filter switching without frame drops or stuttering
