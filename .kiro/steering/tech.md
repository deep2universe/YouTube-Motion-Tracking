---
inclusion: always
---

# Technology Stack

## Build System

- **Parcel 2.16.0**: Module bundler and build tool
- **@parcel/config-webextension**: Chrome extension configuration for Parcel
- Uses `--legacy-peer-deps` flag for npm installations due to dependency conflicts

## Core Dependencies

- **@tensorflow/tfjs-core** (4.22.0): TensorFlow.js core library
- **@tensorflow/tfjs-backend-webgl** (4.22.0): WebGL backend for TensorFlow
- **@tensorflow/tfjs-backend-webgpu** (4.22.0): WebGPU backend support
- **@tensorflow/tfjs-converter** (4.22.0): Model conversion utilities
- **@tensorflow-models/pose-detection** (2.1.3): Pose estimation models (MoveNet)
- **@mediapipe/pose** (0.5.x): MediaPipe pose detection support
- **proton-engine** (5.4.3): Particle animation library

## Chrome Extension APIs

- Manifest V3 architecture
- `chrome.runtime`: Message passing between scripts
- `chrome.storage.sync`: Persist animation preferences
- `chrome.webNavigation`: Detect YouTube URL changes
- `chrome.tabs`: Tab management and messaging
- Content scripts injected on `https://www.youtube.com/*`

## Common Commands

### Development
```bash
# Install dependencies
npm install --legacy-peer-deps

# Build extension
npm run build:parcel

# Clean build (removes cache and dist)
npm run build:clean
```

### Production
```bash
# Create production ZIP for Chrome Web Store
./build-for-store.sh
```

### Manual Build Steps
```bash
# Individual build steps (normally run via build:parcel)
npm run copyManifest  # Copy manifest.json to dist
npm run copyHTML      # Copy HTML files to dist
npm run copyImages    # Copy images to dist
npm run copyCSS       # Copy CSS files to dist
```

## Build Output

- Source files in `src/`
- Built extension in `dist/` (load this in Chrome)
- Production packages in `release/` directory
- Parcel cache in `.parcel-cache/` (can be deleted)

## Browser Requirements

- Google Chrome with hardware acceleration enabled
- Extension requires WebGL support for optimal performance
