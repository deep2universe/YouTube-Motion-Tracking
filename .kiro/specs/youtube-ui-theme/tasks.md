# Implementation Plan

- [x] 1. Create CSS theme foundation files
  - Create `src/themes/` directory structure
  - Create `youtube-theme-variables.css` with CSS custom properties for colors, backgrounds, and effects
  - Define base theme variables and intensity-specific overrides (low, medium, high)
  - _Requirements: 1.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 16.1, 16.2, 16.3_

- [x] 2. Implement main YouTube UI theme styles
  - Create `youtube-theme.css` with styles for all YouTube UI areas
  - Implement page background gradient styling under `body.halloween-theme ytd-app`
  - Implement masthead/header styles (background, borders, logo, search box, icons)
  - Implement sidebar/guide styles (background, borders, items, hover states)
  - Implement video player styles (border, glow, controls, progress bar, volume slider)
  - Implement thumbnail styles (containers, borders, hover effects, titles, channel names)
  - Implement comments section styles (background, borders, author names, text)
  - Implement scrollbar styles (track, thumb, hover states)
  - Implement button and interactive element styles
  - Use CSS custom properties throughout and scope all selectors under `body.halloween-theme`
  - _Requirements: 1.1, 1.2, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 12.1, 12.2, 12.3, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

- [x] 3. Implement particle effects system
  - Create `youtube-theme-particles.css` with particle overlay and animation styles
  - Define `.halloween-particle-overlay` fixed-position container styles with `pointer-events: none` and `z-index: 9998`
  - Define `.halloween-particle` styles with opacity and animation properties
  - Create `@keyframes fall-and-sway` animation with translateY, translateX, and rotate transforms
  - Add `@media (prefers-reduced-motion)` query for accessibility
  - _Requirements: 3.2, 3.3, 3.4, 3.7, 16.2_

- [x] 4. Implement theme control panel UI
  - Add theme control section HTML to `initVideoPlayerPopup()` function in `content.js`
  - Insert section between stop/play button and animation grid with separators
  - Create theme toggle button with ID `themeToggleButton` and initial text "🌙 Enable Halloween UI Theme"
  - Create three intensity buttons (Low, Medium, High) with data-intensity attributes
  - Create particle toggle button with ID `particleToggleButton` and initial text "✨ Particle Effects: OFF"
  - Add CSS styles for theme control buttons to `content.css` (inactive/active states, intensity button styles)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 16.3_

- [x] 5. Implement ParticleManager class
  - Create `ParticleManager` static class in `content.js` with constants for emojis, count, and overlay ID
  - Implement `createOverlay()` method to generate particle overlay with 12 particles
  - Generate random emoji selection, horizontal position (0-100%), animation delay (0-8s), and duration (8-12s) for each particle
  - Implement `removeOverlay()` method to remove particle overlay from DOM
  - Implement `exists()` method to check if overlay is present
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 6. Implement ThemeStateManager class
  - Create `ThemeStateManager` class in `content.js` with state object (enabled, intensity, particlesEnabled)
  - Implement `loadSettings()` async method to retrieve settings from Chrome Storage
  - Implement `applyTheme()` method to add `halloween-theme` and intensity classes to document.body
  - Implement `removeTheme()` method to remove all theme classes from document.body
  - Implement `toggleTheme()` method to switch theme on/off and call ParticleManager if needed
  - Implement `setIntensity(level)` method to update intensity class on document.body
  - Implement `toggleParticles()` method to create/remove particle overlay via ParticleManager
  - Implement `saveState()` async method to persist state to Chrome Storage
  - _Requirements: 1.1, 1.3, 1.4, 2.2, 2.3, 2.5, 3.5, 3.6, 17.1, 17.2, 17.3_

- [x] 7. Implement UIControlManager class
  - Create `UIControlManager` class in `content.js` with reference to ThemeStateManager
  - Implement `updateToggleButton(enabled)` method to update button text and styling based on theme state
  - Implement `updateIntensityButtons(level)` method to add/remove `active-intensity` class on intensity buttons
  - Implement `updateParticleButton(enabled)` method to update button text showing ON/OFF state
  - Implement `attachEventListeners()` method to listen for button clicks and dispatch custom events
  - _Requirements: 4.4, 4.5, 4.8, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8. Integrate theme system with content script initialization
  - Create ThemeStateManager instance in `content.js` main initialization
  - Call `loadSettings()` on page load to retrieve and apply saved theme state
  - Apply theme classes and create particle overlay before page is visible if settings indicate enabled
  - Create UIControlManager instance and inject theme controls into popup panel
  - Add event listeners for custom events (`toggleHalloweenTheme`, `setThemeIntensity`, `toggleParticles`)
  - Wire event handlers to call appropriate ThemeStateManager methods
  - _Requirements: 1.5, 2.4, 17.4, 17.5, 17.6_

- [x] 9. Update manifest.json with theme CSS files
  - Add `src/themes/youtube-theme-variables.css` to content_scripts css array
  - Add `src/themes/youtube-theme.css` to content_scripts css array
  - Add `src/themes/youtube-theme-particles.css` to content_scripts css array
  - Ensure CSS files are loaded in correct order (variables, main theme, particles)
  - _Requirements: 16.4_

- [x] 10. Verify theme functionality and YouTube compatibility
  - Test theme toggle on/off functionality across YouTube pages (home, watch, search, channel)
  - Test intensity level switching and visual differences between Low, Medium, High
  - Test particle effects toggle and animation behavior
  - Verify all YouTube functionality works with theme enabled (navigation, playback, comments, search, subscribe)
  - Verify theme works in theater mode and sidebar expanded/collapsed states
  - Verify settings persist across page reloads and browser restarts
  - _Requirements: 1.5, 2.4, 3.6, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 17.4, 17.5, 17.6_

- [ ] 11. Performance testing and optimization
  - Measure video playback FPS with theme enabled and particles active using Chrome DevTools
  - Verify performance meets ≥55 FPS requirement during video playback
  - Check page load time impact is <200ms
  - Verify no layout thrashing or long tasks in Performance timeline
  - Test on lower-end hardware if available
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
