---
inclusion: always
---

# Code Conventions & Patterns

## Animation System Architecture

### Animation Types
- **Canvas animations**: Direct 2D drawing (skeletons, pumpkins, heads) - set `currentAnimation` to animation name
- **Particle animations**: Proton-based effects - set `currentAnimation` to `"particle"` and `particleID` to numeric ID
- All particle animation names must start with `"particle"` or `"mystic"` prefix

### Adding New Animations
1. Define in `AnimEnum` class with name, icon (Unicode emoji), and ID (null for canvas, number for particle)
2. Add to `getNameArray()` and `getAllAnimations()` static methods
3. Add case in `Anim.setNewAnimation()` method
4. Implement drawing method in `anim.js` (e.g., `drawSkeletonGlow()` or `cParticleBatSwarm()`)
5. Add update logic in `updateKeypoint()` (canvas) or `updateParticles()` (particle)

### Keypoint Mapping (17-point pose model)
```
0: nose, 1: left_eye, 2: right_eye, 3: left_ear, 4: right_ear
5: left_shoulder, 6: right_shoulder, 7: left_elbow, 8: right_elbow
9: left_wrist, 10: right_wrist, 11: left_hip, 12: right_hip
13: left_knee, 14: right_knee, 15: left_ankle, 16: right_ankle
```

## Code Style

### Naming Conventions
- Canvas animations: descriptive names (e.g., `skeletonGlow`, `pumpkinClassic`)
- Particle animations: prefix with `particle` or `mystic` (e.g., `particleBatSwarm`, `mysticPortal`)
- Drawing methods: `draw<AnimationName>()` for canvas, `cParticle<Name>()` for particle initialization
- Use camelCase for variables and methods

### Event Communication
- Background → Content: `chrome.runtime.onMessage` with `{message: "intPoseDetection"}`
- Popup → Content: `chrome.runtime.onMessage` with `{animation: "animationName"}`
- Internal: CustomEvents dispatched on `document` (e.g., `'changeVisualizationFromPlayer'`, `'changeFilter'`)

### State Management
- Use Chrome storage API for persistence: `chrome.storage.sync.set()` and `chrome.storage.sync.get()`
- Always provide fallback defaults when loading from storage
- Validate animation IDs - fallback to `'skeletonGlow'` if undefined or invalid

### Canvas Management
- Dual canvas system: `canvas` (2D) + `canvasGL` (WebGL)
- Always clear canvas before drawing: `ctx.clearRect(0, 0, canvas.width, canvas.height)`
- Position canvases absolutely over video player
- Handle resize events with `ResizeObserver`

### Cleanup Pattern
- Always cleanup old elements before reinitializing (see `cleanup()` function)
- Destroy Proton emitters: `anim.proton.destroy()`
- Remove event listeners before adding new ones
- Unobserve resize observers from old video elements

### Error Handling
- Check for null/undefined before accessing objects (detector, anim, mainVideo)
- Validate video dimensions before pose detection: `videoWidth !== 0 && videoHeight !== 0`
- Use try-catch for TensorFlow initialization and Proton cleanup
- Provide fallback selectors for YouTube DOM elements (YouTube's DOM changes frequently)

## Performance Considerations

- Use `requestAnimationFrame` for animation loops (never multiple instances)
- Check `isVideoPlay` and `isAnimDisabled` flags before processing
- Skip frames if video not ready or paused
- Reuse Anim object with `updateCanvas()` instead of recreating
- Set `willReadFrequently: true` for 2D context if reading pixel data

## YouTube DOM Compatibility

- YouTube loads videos dynamically - always get last element from collections
- Provide multiple fallback selectors for player elements:
  - `.html5-video-player` → `#movie_player` → `#player`
  - `.html5-main-video` → `video.video-stream` → any `video`
  - `.html5-video-container` → `#player-container` → parent element
- Wait for video `loadeddata` event before initializing UI
- Use setTimeout delays (500ms) for YouTube's player to fully initialize

## UI Patterns

- Popup visibility controlled by `showPlayerPopup` boolean
- Update button states after DOM changes: `updateSelectedButton()`, `updateAnimDisabledDiv()`
- Use CSS classes for state: `.selectButton`, `.active-filter`, `.active-intensity`
- Generate UI dynamically from enum arrays for maintainability

## Theme System Integration

- Theme system works independently from animations (both visible simultaneously)
- Filter system applies CSS filters to video + canvas overlays
- Particle effects can be toggled separately from main theme
- Always update UI controls after popup creation: `uiControlManager.updateAll()` 