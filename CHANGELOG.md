# Changelog

## [1.3.0] - 2025-10-21

### Major Updates
- Complete rebuild and modernization of the extension
- TensorFlow.js updated from v3.16.0 to v4.22.0 (major version upgrade)
- Pose Detection updated from v2.0.0 to v2.1.3
- Fixed all critical bugs preventing extension functionality

### Added
- WebGPU backend support for improved performance
- MediaPipe Pose integration for enhanced detection capabilities
- Comprehensive error handling and null-safety checks
- Build script for Chrome Web Store deployment (build-for-store.sh)
- Extensive documentation:
  - CHROME_STORE_UPLOAD.md - Upload guide
  - TESTING.md - Testing instructions
  - CONSOLE_MESSAGES.md - Console output explanation

### Fixed
- CRITICAL: WebGPU backend initialization error
- CRITICAL: Null reference errors causing extension crashes
- CRITICAL: Popup element not being created properly
- CRITICAL: Button click handlers not working
- YouTube element selectors updated for current YouTube structure
- Video element detection with multiple fallback options
- Player controls integration improved
- Popup timing issues resolved with 500ms initialization delay

### Improved
- Robust DOM element detection with multiple fallback selectors
- Video container detection (html5-video-container, movie_player, etc.)
- Player controls button insertion with timeout handling
- Pose detection now properly waits for backend initialization
- Better error messages and debugging information

### Technical
- Set TensorFlow.js backend explicitly to 'webgl'
- Added proper async/await initialization with tf.ready()
- Removed source maps from production builds
- Package size optimized to ~689 KB

## [1.1.0] - 2025-10-21

### Updated
- Updated TensorFlow.js dependencies to latest versions:
  - @tensorflow-models/pose-detection: 2.0.0 → 2.1.3
  - @tensorflow/tfjs-core: 3.16.0 → 4.22.0
  - @tensorflow/tfjs-backend-webgl: 3.16.0 → 4.22.0
  - @tensorflow/tfjs-converter: 3.16.0 → 4.22.0
- Added @tensorflow/tfjs-backend-webgpu for better performance
- Added @mediapipe/pose for enhanced pose detection capabilities

### Fixed
- Improved YouTube element selectors with multiple fallback options for better compatibility
- Enhanced video element detection to work with current YouTube structure
- Added robust container detection for canvas overlay
- Improved player controls button insertion with timeout handling
- Fixed compatibility issues with modern YouTube layout

### Technical Improvements
- Added fallback selectors for video elements (html5-main-video, video-stream, video)
- Added fallback selectors for video containers (html5-video-container, movie_player, player-container)
- Added fallback selectors for player controls (ytp-right-controls, ytp-chrome-controls)
- Improved error handling in element selection
- Updated build process with latest Parcel version
