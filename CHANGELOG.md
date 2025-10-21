# Changelog

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
