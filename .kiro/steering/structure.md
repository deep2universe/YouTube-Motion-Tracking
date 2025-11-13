---
inclusion: always
---

# Project Structure

## Directory Layout

```
├── src/                    # Source code
│   ├── background.js       # Service worker (monitors URL changes)
│   ├── content.js          # Main content script (pose detection, UI)
│   ├── anim.js             # Animation logic and rendering
│   ├── animEnum.js         # Animation definitions (50+ animations)
│   ├── detectUtils.js      # Pose detection utilities
│   ├── popup.js            # Extension popup script
│   ├── popup.html          # Extension popup UI
│   ├── options.js          # Options page script
│   ├── options.html        # Options page UI
│   ├── content.css         # Styles for injected UI
│   ├── manifest.json       # Chrome extension manifest (V3)
│   └── images/             # Extension icons and assets
├── dist/                   # Built extension (generated)
├── release/                # Production ZIP files (generated)
├── assets/                 # Documentation images
├── dev_docs/               # Developer documentation
└── .parcel-cache/          # Build cache (generated)
```

## Core Files

### background.js
- Service worker that monitors YouTube navigation
- Listens for `onHistoryStateUpdated` events
- Sends `intPoseDetection` message to content script on new video

### content.js
- Main orchestrator (900+ lines)
- Initializes TensorFlow.js detector with MoveNet model
- Creates dual canvas system (2D + WebGL) over video
- Manages video player UI (animation selector popup)
- Handles pose detection loop via `requestAnimationFrame`
- Manages Chrome storage for animation state persistence
- Event listeners: video play/pause, resize, user interactions

### anim.js
- Animation rendering engine (2300+ lines)
- `Anim` class manages all animation implementations
- Methods: `setNewAnimation()`, `initParticles()`, `updateKeypoint()`, `updateProton()`
- Contains individual animation implementations (50+ methods)
- Handles both canvas 2D drawing and Proton particle systems

### animEnum.js
- Defines all 50+ animations with name, icon, and ID
- Two types: canvas animations (null ID) and particle animations (numeric ID)
- Static methods: `getNameArray()`, `getAllAnimations()`
- Icons use Unicode emoji characters

### detectUtils.js
- Utility functions for pose detection
- Transforms keypoints from video coordinates to canvas coordinates
- Handles scaling and positioning calculations

## Code Organization Patterns

### Animation Naming Convention
- Canvas animations: `skeleton`, `skeleton3Times`, `puppetsPlayer`, `spiderWeb`
- Particle animations: prefix with `particle` (e.g., `particleHandsBall`, `particleFireFly`)
- Categories: tracking, physics, visual effects, atmospheric

### Message Passing
- Background → Content: `{message: "intPoseDetection"}`
- Popup → Content: `{animation: "animationName"}`
- Content uses CustomEvents for internal communication

### Canvas System
- `canvas` + `ctx`: 2D context for skeleton/drawing animations
- `canvasGL` + `webGLtx`: WebGL context for Proton particle effects
- Both positioned absolutely over video player

### Keypoint Mapping
Standard 17-point pose model:
0=nose, 1=left_eye, 2=right_eye, 3=left_ear, 4=right_ear, 5=left_shoulder, 6=right_shoulder, 7=left_elbow, 8=right_elbow, 9=left_wrist, 10=right_wrist, 11=left_hip, 12=right_hip, 13=left_knee, 14=right_knee, 15=left_ankle, 16=right_ankle

## Adding New Animations

1. Add entry to `AnimEnum` class in `animEnum.js`
2. Add name to `getNameArray()` and object to `getAllAnimations()`
3. Add case in `anim.js` `setNewAnimation()` method
4. Implement animation method in `anim.js` (e.g., `cParticleNewEffect()`)
5. Add update logic in `updateKeypoint()` or `updateParticles()`

## Build Artifacts

- `dist/`: Contains bundled JS, copied HTML/CSS/images, manifest
- Source maps generated during development builds
- Production builds remove source maps via `build-for-store.sh`
