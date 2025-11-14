# Design Document

## Overview

The YouTube UI Theme System extends the existing Halloween YouTube Chrome Extension by transforming the entire YouTube interface with a Halloween aesthetic. The system is designed as a modular, CSS-driven theming layer that integrates seamlessly with the existing video overlay animation system.

### Key Design Principles

1. **CSS-First Architecture**: All visual styling is achieved through CSS, with JavaScript only managing state and DOM class manipulation
2. **Non-Invasive**: The theme can be completely disabled, returning YouTube to its original appearance
3. **Performance-Optimized**: Uses GPU-accelerated animations and minimal DOM manipulation
4. **Modular Structure**: Separate CSS files for different concerns (main theme, particles, controls)
5. **Progressive Enhancement**: Theme enhances the experience without breaking core YouTube functionality

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Content Script                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Theme State Manager                       │  │
│  │  - Load settings from Chrome Storage              │  │
│  │  - Apply/remove theme classes                     │  │
│  │  - Handle user interactions                       │  │
│  │  - Persist state changes                          │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│         ┌────────────────┼────────────────┐             │
│         │                │                │             │
│  ┌──────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐      │
│  │   Theme     │  │ Intensity │  │  Particle   │      │
│  │   Toggle    │  │  Manager  │  │   Manager   │      │
│  └─────────────┘  └───────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Applies CSS Classes
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Document Body                           │
│  Classes: halloween-theme                                │
│           theme-intensity-{low|medium|high}              │
└─────────────────────────────────────────────────────────┘
                          │
                          │ CSS Cascade
                          ▼
┌─────────────────────────────────────────────────────────┐
│              YouTube DOM Elements                        │
│  - Masthead (header)                                     │
│  - Guide (sidebar)                                       │
│  - Video Player                                          │
│  - Thumbnails                                            │
│  - Comments                                              │
│  - Scrollbars                                            │
└─────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── content.js                    # Existing - add theme management code
├── content.css                   # Existing - add theme control styles
├── themes/
│   ├── youtube-theme.css         # NEW - Main theme styles
│   ├── youtube-theme-particles.css  # NEW - Particle effects
│   └── youtube-theme-variables.css  # NEW - CSS custom properties
└── manifest.json                 # Update - add new CSS files
```

## Components and Interfaces

### 1. Theme State Manager

**Responsibility**: Central controller for all theme-related state and operations

**Interface**:
```javascript
class ThemeStateManager {
  constructor() {
    this.state = {
      enabled: false,
      intensity: 'medium',
      particlesEnabled: false
    };
  }
  
  // Load settings from Chrome Storage
  async loadSettings()
  
  // Apply theme to document
  applyTheme()
  
  // Remove theme from document
  removeTheme()
  
  // Toggle theme on/off
  toggleTheme()
  
  // Set intensity level
  setIntensity(level)
  
  // Toggle particle effects
  toggleParticles()
  
  // Update UI controls to reflect state
  updateUI()
  
  // Save state to Chrome Storage
  async saveState()
}
```

**Implementation Details**:
- Singleton pattern - one instance per content script
- Initializes on page load by calling `loadSettings()`
- Listens for custom events from UI controls
- Manages body class names: `halloween-theme`, `theme-intensity-{level}`
- Delegates particle creation/removal to ParticleManager

### 2. Particle Manager

**Responsibility**: Create and manage the particle overlay system

**Interface**:
```javascript
class ParticleManager {
  static PARTICLE_EMOJIS = ['🦇', '🍂', '🍁', '👻', '🕷️'];
  static PARTICLE_COUNT = 12;
  static OVERLAY_ID = 'halloween-particle-overlay';
  
  // Create particle overlay
  static createOverlay()
  
  // Remove particle overlay
  static removeOverlay()
  
  // Check if overlay exists
  static exists()
  
  // Generate random particle configuration
  static generateParticleConfig()
}
```

**Implementation Details**:
- Static class (no instantiation needed)
- Creates fixed-position overlay div with `pointer-events: none`
- Generates 12 particle divs with random:
  - Emoji selection from PARTICLE_EMOJIS array
  - Horizontal position (0-100%)
  - Animation delay (0-8s)
  - Animation duration (8-12s)
- Each particle has class `halloween-particle`
- CSS handles all animation via keyframes

### 3. UI Control Manager

**Responsibility**: Manage the theme control panel UI and user interactions

**Interface**:
```javascript
class UIControlManager {
  constructor(themeStateManager) {
    this.stateManager = themeStateManager;
    this.elements = {};
  }
  
  // Create and inject theme controls into popup panel
  injectControls()
  
  // Update toggle button appearance
  updateToggleButton(enabled)
  
  // Update intensity button states
  updateIntensityButtons(level)
  
  // Update particle button text
  updateParticleButton(enabled)
  
  // Attach event listeners
  attachEventListeners()
}
```

**Implementation Details**:
- Injects HTML into existing popup panel between animation controls and grid
- Caches references to control elements
- Dispatches custom events that ThemeStateManager listens for
- Updates button states based on current theme state

### 4. CSS Theme System

**Responsibility**: Define all visual styling for the Halloween theme

**Structure**:

**youtube-theme-variables.css**:
```css
/* CSS Custom Properties organized by intensity */
body.halloween-theme {
  /* Base colors */
  --halloween-primary: #FF6600;
  --halloween-secondary: #8B00FF;
  --halloween-accent: #FFD700;
  
  /* Backgrounds - Medium intensity (default) */
  --halloween-bg-dark: rgba(10, 5, 15, 0.95);
  --halloween-bg-medium: rgba(20, 15, 25, 0.8);
  --halloween-bg-light: rgba(30, 20, 35, 0.6);
  
  /* Effects - Medium intensity */
  --halloween-glow-opacity: 0.4;
  --halloween-shadow-size: 20px;
}

/* Low intensity overrides */
body.halloween-theme.theme-intensity-low {
  --halloween-bg-dark: rgba(10, 5, 15, 0.7);
  --halloween-bg-medium: rgba(20, 15, 25, 0.5);
  --halloween-bg-light: rgba(30, 20, 35, 0.3);
  --halloween-glow-opacity: 0.2;
  --halloween-shadow-size: 10px;
}

/* High intensity overrides */
body.halloween-theme.theme-intensity-high {
  --halloween-bg-dark: rgba(5, 2, 10, 0.98);
  --halloween-bg-medium: rgba(15, 10, 20, 0.95);
  --halloween-bg-light: rgba(25, 15, 30, 0.85);
  --halloween-glow-opacity: 0.7;
  --halloween-shadow-size: 40px;
}
```

**youtube-theme.css**:
Organized into sections for each YouTube UI area:
1. Page Background
2. Masthead (Header)
3. Guide (Sidebar)
4. Video Player
5. Thumbnails
6. Comments
7. Scrollbar
8. Buttons and Interactive Elements

Each section uses:
- Scoped selectors under `body.halloween-theme`
- CSS custom properties for values
- `!important` only where necessary to override YouTube's inline styles
- Transition properties for smooth hover effects

**youtube-theme-particles.css**:
```css
.halloween-particle-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
  overflow: hidden;
}

.halloween-particle {
  position: absolute;
  font-size: 24px;
  opacity: 0.4;
  animation: fall-and-sway linear infinite;
  will-change: transform;
}

@keyframes fall-and-sway {
  0% {
    transform: translateY(-50px) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.4;
  }
  90% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(calc(100vh + 50px)) 
               translateX(100px) 
               rotate(360deg);
    opacity: 0;
  }
}
```

## Data Models

### Theme State

```javascript
{
  enabled: boolean,           // Theme on/off
  intensity: string,          // 'low' | 'medium' | 'high'
  particlesEnabled: boolean   // Particle overlay on/off
}
```

**Storage Keys**:
- `halloweenThemeEnabled`: boolean
- `themeIntensity`: string
- `particlesEnabled`: boolean

### Particle Configuration

```javascript
{
  emoji: string,              // One of: 🦇, 🍂, 🍁, 👻, 🕷️
  left: string,               // CSS percentage: '0%' to '100%'
  animationDelay: string,     // CSS time: '0s' to '8s'
  animationDuration: string   // CSS time: '8s' to '12s'
}
```

## Error Handling

### Chrome Storage Errors

**Scenario**: Chrome Storage API fails (quota exceeded, permissions issue)

**Handling**:
```javascript
try {
  await chrome.storage.sync.set({ halloweenThemeEnabled: true });
} catch (error) {
  console.warn('Failed to save theme settings:', error);
  // Continue with theme application - settings just won't persist
  // Show no error to user as theme still works for current session
}
```

**Rationale**: Theme functionality should not be blocked by storage failures. Settings will apply for the current session even if persistence fails.

### Missing DOM Elements

**Scenario**: YouTube's DOM structure changes and expected elements don't exist

**Handling**:
```javascript
function injectControls() {
  const popupPanel = document.querySelector('#halloween-popup-panel');
  if (!popupPanel) {
    console.warn('Popup panel not found, theme controls not injected');
    return false;
  }
  // Proceed with injection
  return true;
}
```

**Rationale**: Graceful degradation - if controls can't be injected, theme can still be controlled via Chrome Storage or extension options page.

### CSS Loading Failures

**Scenario**: Theme CSS files fail to load

**Handling**:
- Manifest V3 ensures CSS files are bundled with extension
- If files are missing, theme classes will be applied but have no effect
- No JavaScript error handling needed - CSS failures are silent
- User will see no theme change, can disable and re-enable or reinstall extension

### Particle Overlay Conflicts

**Scenario**: Another extension or YouTube feature creates element with same ID

**Handling**:
```javascript
static createOverlay() {
  // Remove any existing overlay first
  this.removeOverlay();
  
  const overlay = document.createElement('div');
  overlay.id = this.OVERLAY_ID;
  // ... create particles
  document.body.appendChild(overlay);
}

static removeOverlay() {
  const existing = document.getElementById(this.OVERLAY_ID);
  if (existing) {
    existing.remove();
  }
}
```

**Rationale**: Always clean up before creating to prevent duplicates. ID collision is unlikely but handled defensively.

## Testing Strategy

### Unit Testing Approach

**Not Recommended**: Traditional unit tests are impractical for this feature because:
- Heavy DOM manipulation and CSS styling
- Requires full YouTube page context
- Chrome Extension APIs (storage, runtime) need browser environment
- Visual effects require manual verification

### Manual Testing Checklist

**Theme Toggle**:
- [ ] Click toggle button - theme applies immediately
- [ ] Click again - theme removes immediately
- [ ] Button text updates correctly
- [ ] Button styling reflects state (purple inactive, orange active)
- [ ] Settings persist after page reload
- [ ] Settings persist after browser restart

**Intensity Levels**:
- [ ] Low: Lighter backgrounds, subtle glows visible
- [ ] Medium: Balanced appearance, default state
- [ ] High: Dark backgrounds, strong glows visible
- [ ] Active button has gold border
- [ ] Only one button active at a time
- [ ] Settings persist after page reload

**Particle Effects**:
- [ ] Toggle on - particles appear and animate
- [ ] Particles fall from top to bottom
- [ ] Particles sway horizontally
- [ ] Particles rotate during fall
- [ ] 12 particles visible
- [ ] Particles don't block clicks
- [ ] Toggle off - particles disappear
- [ ] Settings persist after page reload

**YouTube UI Areas**:
- [ ] Home page: Background, header, sidebar, thumbnails styled
- [ ] Watch page: All above + video player, comments styled
- [ ] Search page: Results thumbnails styled
- [ ] Channel page: Banner area, video grid styled
- [ ] Sidebar expanded: Styles apply correctly
- [ ] Sidebar collapsed: Styles apply correctly
- [ ] Theater mode: Player border and glow visible
- [ ] Fullscreen: No theme visible (expected - fullscreen hides UI)

**Performance**:
- [ ] Video plays at 60fps with theme enabled
- [ ] Video plays at 60fps with theme + particles enabled
- [ ] No lag when scrolling with theme enabled
- [ ] No lag when hovering thumbnails
- [ ] Page load time not noticeably affected
- [ ] Chrome DevTools Performance: No long tasks, no layout thrashing

**Functionality**:
- [ ] All YouTube navigation works
- [ ] Video playback controls work
- [ ] Search works
- [ ] Comments can be posted
- [ ] Likes/dislikes work
- [ ] Subscribe button works
- [ ] Playlist controls work
- [ ] Settings menu accessible

**Cross-Page**:
- [ ] Navigate Home → Watch: Theme persists
- [ ] Navigate Watch → Search: Theme persists
- [ ] Navigate Search → Channel: Theme persists
- [ ] Open new YouTube tab: Theme applies from storage
- [ ] Theme state consistent across all tabs

**Edge Cases**:
- [ ] Enable theme, close browser, reopen: Theme still enabled
- [ ] Change intensity, reload page: Intensity preserved
- [ ] Enable particles, navigate to new video: Particles still active
- [ ] Disable theme while particles active: Both disabled
- [ ] Rapid clicking toggle button: No visual glitches
- [ ] Change intensity rapidly: No class name conflicts

### Browser Testing

**Primary Target**: Google Chrome (latest stable)

**Minimum Version**: Chrome 88+ (Manifest V3 support)

**Testing Browsers**:
- Chrome stable (primary)
- Chrome beta (compatibility check)
- Chromium (open-source verification)

**Not Supported**: Firefox, Safari, Edge (different extension APIs)

### Performance Benchmarks

**Target Metrics**:
- Video playback: ≥55 FPS (requirement)
- Page load time increase: <200ms
- Memory overhead: <10MB
- CPU usage increase: <5%

**Measurement Tools**:
- Chrome DevTools Performance tab
- FPS meter in DevTools rendering settings
- Chrome Task Manager for memory/CPU

**Test Scenarios**:
1. Baseline: YouTube without extension
2. Extension with theme disabled
3. Extension with theme enabled (medium intensity)
4. Extension with theme + particles enabled (high intensity)

## YouTube DOM Selectors Reference

### Critical Selectors

These selectors target YouTube's current DOM structure (as of 2024):

```javascript
// Page container
'ytd-app'

// Header
'#masthead-container'
'#masthead'
'ytd-masthead'
'#logo'
'#search-form'
'#search-input'

// Sidebar
'#guide'
'ytd-guide-renderer'
'ytd-guide-entry-renderer'
'ytd-guide-section-renderer'

// Video player
'#movie_player'
'.html5-video-player'
'.ytp-chrome-bottom'
'.ytp-progress-bar'
'.ytp-volume-slider'

// Thumbnails
'ytd-thumbnail'
'ytd-video-renderer'
'ytd-grid-video-renderer'
'ytd-compact-video-renderer'
'#video-title'
'#channel-name'

// Comments
'ytd-comments'
'ytd-comment-thread-renderer'
'ytd-comment-renderer'
'#author-text'
'#content-text'

// Scrollbar (browser default)
'::-webkit-scrollbar'
'::-webkit-scrollbar-track'
'::-webkit-scrollbar-thumb'
```

**Selector Strategy**:
- Use YouTube's custom element names (ytd-*) for stability
- Fallback to ID selectors for critical elements
- Avoid deep nesting (max 3 levels)
- Use `:is()` and `:where()` for multiple selectors
- Test selectors in DevTools console before implementation

**Maintenance Note**: YouTube updates its DOM structure periodically. Selectors should be reviewed quarterly and updated if YouTube redesigns occur.

## Integration with Existing Extension

### Popup Panel Integration

**Current Structure** (in `content.js` - `initVideoPlayerPopup()` function):
```html
<div id="halloween-popup-panel">
  <div class="popup-header">🎃 Halloween Animations 👻</div>
  <div class="random-controls">
    <button id="randomModeButton">🎲 Random Mode</button>
    <input type="range" id="randomSlider">
  </div>
  <button id="stopAnimationButton">⏯️ Stop Animation</button>
  
  <!-- INSERT THEME CONTROLS HERE -->
  
  <div class="animation-grid">
    <!-- 25 animation icons -->
  </div>
  <div class="filter-section">
    <!-- 7 filter buttons -->
  </div>
</div>
```

**Injection Point**:
After line where `stopAnimationButton` is created, before animation grid creation.

**Code Modification**:
```javascript
// In initVideoPlayerPopup() function
// After creating stopAnimationButton

// Create theme controls section
const themeSection = createThemeControlsSection();
popupPanel.appendChild(themeSection);

// Continue with existing animation grid creation
```

### Chrome Storage Integration

**Existing Storage Keys** (from current extension):
- `selectedAnimation`: string
- `randomModeEnabled`: boolean
- `randomInterval`: number
- `selectedFilter`: string

**New Storage Keys** (for theme system):
- `halloweenThemeEnabled`: boolean
- `themeIntensity`: string
- `particlesEnabled`: boolean

**No Conflicts**: Different key names ensure no interference with existing functionality.

### Manifest.json Updates

**Current CSS Array**:
```json
"css": ["content.css"]
```

**Updated CSS Array**:
```json
"css": [
  "content.css",
  "themes/youtube-theme-variables.css",
  "themes/youtube-theme.css",
  "themes/youtube-theme-particles.css"
]
```

**Load Order**: Variables → Main Theme → Particles ensures proper CSS cascade.

### Event System Integration

**Existing Events** (from current extension):
- `changeAnimation`: Triggered by animation icon clicks
- `changeFilter`: Triggered by filter button clicks
- `toggleRandomMode`: Triggered by random mode button

**New Events** (for theme system):
- `toggleHalloweenTheme`: Triggered by theme toggle button
- `setThemeIntensity`: Triggered by intensity buttons
- `toggleParticles`: Triggered by particle toggle button

**Implementation**: All events use `CustomEvent` with `document` as target, consistent with existing pattern.

## Design Decisions and Rationales

### Decision 1: CSS-Only Styling

**Choice**: Use pure CSS for all visual effects, no JavaScript rendering

**Rationale**:
- Performance: CSS animations are GPU-accelerated
- Maintainability: Easier to modify colors, sizes, effects
- Separation of concerns: JavaScript manages state, CSS manages presentation
- Browser optimization: Browser can optimize CSS better than JS

**Alternative Considered**: Canvas-based effects (like existing animations)
**Why Rejected**: Overkill for static UI styling, would impact performance

### Decision 2: Body Class Toggle Pattern

**Choice**: Apply theme by adding/removing classes on `document.body`

**Rationale**:
- Single source of truth: Body class controls entire theme
- CSS cascade: All styles naturally inherit from body selector
- Easy to disable: Remove one class to disable everything
- No inline styles: Keeps DOM clean
- Debuggable: Easy to inspect in DevTools

**Alternative Considered**: Individual element class manipulation
**Why Rejected**: Would require tracking many elements, more complex state management

### Decision 3: Three Intensity Levels

**Choice**: Provide Low, Medium, High intensity options

**Rationale**:
- User preference: Some users want subtle, others want dramatic
- Accessibility: Low intensity helps users sensitive to visual effects
- Flexibility: Medium as sensible default, High for enthusiasts
- Simple choice: Three options are easy to understand, not overwhelming

**Alternative Considered**: Slider with continuous values
**Why Rejected**: More complex to implement, harder to define meaningful intermediate values

### Decision 4: CSS Custom Properties for Theming

**Choice**: Use CSS variables for all theme values

**Rationale**:
- DRY principle: Define colors once, use everywhere
- Easy intensity switching: Override variables per intensity level
- Runtime flexibility: Could allow user color customization in future
- Maintainability: Change one variable to update entire theme

**Alternative Considered**: Separate CSS files per intensity
**Why Rejected**: Code duplication, larger file size, harder to maintain

### Decision 5: Particle System as Optional

**Choice**: Make particle effects a separate toggle, not tied to theme

**Rationale**:
- Performance: Users on slower machines can disable particles
- Preference: Some users may find particles distracting
- Flexibility: Can enjoy theme without particles
- Testing: Easier to isolate performance issues

**Alternative Considered**: Always show particles when theme enabled
**Why Rejected**: Reduces user control, may impact performance unnecessarily

### Decision 6: Static Particle Count

**Choice**: Always create exactly 12 particles

**Rationale**:
- Performance: Fixed count prevents runaway particle creation
- Visual balance: 12 provides good coverage without clutter
- Simplicity: No need for dynamic calculation based on screen size
- Tested value: 12 particles tested to work well on various screen sizes

**Alternative Considered**: Dynamic count based on viewport size
**Why Rejected**: Added complexity, minimal benefit, 12 works for all sizes

### Decision 7: Separate CSS Files

**Choice**: Split theme into three CSS files (variables, main, particles)

**Rationale**:
- Modularity: Each file has clear responsibility
- Maintainability: Easy to find and modify specific aspects
- Reusability: Variables file could be used for other themes
- Load optimization: Browser can cache files separately

**Alternative Considered**: Single large CSS file
**Why Rejected**: Harder to navigate, less modular, harder to maintain

### Decision 8: No Theme in Fullscreen

**Choice**: Don't apply theme styles in fullscreen mode

**Rationale**:
- YouTube hides UI in fullscreen: Nothing to theme
- Video focus: User wants immersive video experience
- Existing animations: Video overlay animations still work in fullscreen
- Performance: Reduces CSS processing during fullscreen

**Alternative Considered**: Apply theme to fullscreen controls
**Why Rejected**: Controls are minimal and auto-hide, not worth complexity

## CSS Specificity Strategy

### Challenge

YouTube uses inline styles and high-specificity selectors. Theme must override these without breaking YouTube's functionality.

### Strategy

1. **Use `!important` selectively**: Only on properties that YouTube sets inline
2. **High specificity selectors**: `body.halloween-theme ytd-element` (2 classes + element)
3. **Attribute selectors**: `[attribute]` for additional specificity when needed
4. **Avoid `!important` on layout**: Never override position, display, width, height with `!important`
5. **Test overrides**: Verify each override doesn't break YouTube functionality

### Example

```css
/* YouTube sets background inline, need !important */
body.halloween-theme ytd-app {
  background: var(--halloween-bg-dark) !important;
}

/* YouTube doesn't set border inline, no !important needed */
body.halloween-theme #masthead-container {
  border-bottom: 2px solid var(--halloween-primary);
}
```

## Accessibility Considerations

### Color Contrast

**Requirement**: WCAG AA level (4.5:1 for normal text, 3:1 for large text)

**Implementation**:
- Gold text (#FFD700) on dark backgrounds: >7:1 ratio ✓
- Orange links (#FF6600) on dark backgrounds: >4.5:1 ratio ✓
- Light gray text (#E0E0E0) on dark backgrounds: >10:1 ratio ✓

**Testing**: Use Chrome DevTools color picker contrast ratio indicator

### Motion Sensitivity

**Consideration**: Particle animations may trigger motion sensitivity

**Mitigation**:
- Particles are optional (disabled by default)
- Slow animation speed (8-12s duration)
- Low opacity (0.4) reduces visual intensity
- Respect `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  .halloween-particle {
    animation-duration: 20s; /* Slower */
    opacity: 0.2; /* More subtle */
  }
}
```

### Focus Indicators

**Requirement**: Keyboard navigation must have visible focus indicators

**Implementation**:
```css
body.halloween-theme button:focus-visible,
body.halloween-theme a:focus-visible {
  outline: 2px solid var(--halloween-accent);
  outline-offset: 2px;
}
```

### Screen Reader Compatibility

**Consideration**: Theme should not interfere with screen readers

**Implementation**:
- No `display: none` on important elements
- Particle overlay has `aria-hidden="true"` (decorative only)
- Button text clearly describes action ("Enable Halloween UI Theme")
- No reliance on color alone for information

## Future Enhancement Opportunities

### 1. Custom Color Schemes

Allow users to customize theme colors beyond Halloween orange/purple.

**Implementation**: Add color picker inputs in options page, store RGB values in Chrome Storage, inject as CSS variables.

### 2. Multiple Theme Presets

Provide additional themes (Christmas, Dark Mode, Retro, etc.)

**Implementation**: Create additional CSS files, add theme selector dropdown, load appropriate CSS based on selection.

### 3. Animation Customization

Let users control particle count, speed, emoji selection.

**Implementation**: Add sliders/inputs in options page, generate particles dynamically based on settings.

### 4. Scheduled Theme Activation

Automatically enable theme during specific date ranges (e.g., October 1-31).

**Implementation**: Add date range picker in options, check current date on page load, auto-enable if in range.

### 5. Per-Video Theme Settings

Remember theme preferences per YouTube channel or video.

**Implementation**: Store settings keyed by channel ID or video ID, load appropriate settings when video changes.

### 6. Theme Sync Across Devices

Sync theme settings across all devices where user is logged into Chrome.

**Implementation**: Already using `chrome.storage.sync`, just ensure all settings use sync not local.

### 7. Theme Preview

Show preview of theme before enabling.

**Implementation**: Create modal with screenshots or iframe showing themed YouTube page.

### 8. Performance Mode

Automatically reduce intensity or disable particles on low-end devices.

**Implementation**: Detect device capabilities (CPU, GPU), adjust settings accordingly, notify user.

## Conclusion

This design provides a comprehensive, performant, and maintainable solution for theming the YouTube interface. The CSS-first architecture ensures excellent performance, while the modular structure allows for easy maintenance and future enhancements. The integration with the existing extension is minimal and non-invasive, preserving all existing functionality while adding powerful new theming capabilities.
