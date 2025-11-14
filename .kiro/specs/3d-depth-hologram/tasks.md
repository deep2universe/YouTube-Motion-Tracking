# Implementation Plan

- [ ] 1. Create core depth estimation infrastructure
  - Implement DepthEstimator class with TensorFlow.js model loading
  - Implement PerformanceMonitor class for FPS tracking and adaptive quality
  - Create placeholder depth estimation algorithm (luminance + gradient based)
  - Add tensor memory management and cleanup
  - _Requirements: 2.1, 2.3, 2.5, 5.1, 5.2_

- [ ] 2. Implement DepthModeEnum registry
  - Create DepthModeEnum class with 5 Halloween-themed effects
  - Define effect names: Phantom Emergence, Spectral Scan, Graveyard Mist, Spirit Focus, Haunted Aura
  - Implement static methods for mode lookup and enumeration
  - _Requirements: 6.1_

- [ ] 3. Build WebGL shader system for depth effects
  - Create DepthShaderManager class with shader compilation
  - Implement shared vertex shader
  - Implement fragment shader with 5 mode-specific rendering paths
  - Add helper functions: Sobel edge detection, Gaussian blur, luminance calculation
  - Implement uniform and attribute setup
  - _Requirements: 6.3, 8.1-8.5, 9.1-9.5, 10.1-10.5, 11.1-11.5, 12.1-12.5_

- [ ] 4. Implement Phantom Emergence effect (Mode 0)
  - Create depth layer separation (3-5 layers)
  - Implement parallax offset calculation based on depth
  - Add chromatic aberration for near objects (depth < 0.3)
  - Apply scaling and offset transformations per layer
  - Composite layers for 3D emergence appearance
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 5. Implement Spectral Scan effect (Mode 1)
  - Create animated horizontal scan lines
  - Implement brightness modulation (30%) based on scan position
  - Add RGB color separation at depth transitions (threshold > 0.1)
  - Apply ghostly cyan-green color tint (20% blend)
  - Add random brightness flicker (50% increase for 5% of edge pixels)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 6. Implement Graveyard Mist effect (Mode 2)
  - Calculate fog density (depth^1.5 * intensity)
  - Blend video with pale gray-green fog color (RGB: 0.55, 0.65, 0.6)
  - Add procedural noise (5% amplitude scaled by fog density)
  - Ensure minimum 80% fog blend for density > 0.8
  - Preserve near object visibility (max 20% fog for depth < 0.2)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 7. Implement Spirit Focus effect (Mode 3)
  - Calculate blur amount from depth-focus distance
  - Apply Gaussian blur for blur amount > 0.01
  - Add ethereal bokeh highlights (20% brightness increase)
  - Ensure real-time focus depth updates (< 50ms latency)
  - Keep sharp focus within 0.05 depth units of focus plane
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 8. Implement Haunted Aura effect (Mode 4)
  - Apply Sobel edge detection to depth map
  - Render colored glow for edge strength > 0.05
  - Interpolate glow color: purple (near) to sickly green (far)
  - Set glow intensity proportional to edge strength * user intensity
  - Add outer glow halo (50% intensity) for strong edges (> 0.2)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 9. Create Mode Manager for exclusive mode operation
  - Implement ModeManager class in content.js
  - Add enableDepthMode() method that deactivates Animation Mode
  - Add enableAnimationMode() method that deactivates Depth Mode
  - Implement mode state queries (isDepthModeActive, isAnimationModeActive, getCurrentMode)
  - Ensure Theme System settings are preserved during mode switches
  - Add mode indicator display in Player Popup
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 10. Implement video playback state monitoring
  - Add video play event listener to resume active detection
  - Add video pause event listener to stop active detection
  - Implement detection pause/resume logic for Depth Mode
  - Implement detection pause/resume logic for Animation Mode
  - Ensure no detection runs when video is paused
  - Maintain last rendered frame when paused
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 11. Build depth mode UI components
  - Add Depth Mode toggle button to Player Popup
  - Create effect selection buttons for 5 Halloween effects
  - Implement intensity slider (0-100, default 70)
  - Implement focus depth slider (0-255, default 128) for Spirit Focus
  - Add CSS styling for depth mode UI section
  - Wire up event listeners for all UI controls
  - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4_

- [ ] 12. Implement settings persistence
  - Save selected depth effect to Chrome storage on change
  - Save intensity value to Chrome storage on slider adjustment
  - Save focus depth value to Chrome storage on slider adjustment
  - Load saved settings on extension initialization
  - Restore last active mode on page load
  - _Requirements: 6.4, 7.5_

- [ ] 13. Integrate depth detection into render loop
  - Modify content.js render loop to check active mode
  - Add depth estimation call when Depth Mode active and video playing
  - Pass depth map to DepthShaderManager for rendering
  - Ensure pose detection only runs when Animation Mode active
  - Implement frame skipping based on PerformanceMonitor feedback
  - _Requirements: 2.2, 5.3_

- [ ] 14. Implement performance adaptation system
  - Execute benchmark test on first Depth Mode activation
  - Track average FPS over 60-frame rolling window
  - Enable frame skipping when FPS drops below 20
  - Automatically adjust depth map resolution based on FPS
  - Display performance warning when FPS < 15 for > 2 seconds
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 14.1_

- [ ] 15. Create performance warning UI
  - Design performance warning notification component
  - Add "Lower Quality" button to reduce resolution and increase frame skipping
  - Add "Disable Depth" button to deactivate Depth Mode
  - Add "Ignore" button to dismiss warning for 30 seconds
  - Implement warning suppression logic
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 16. Implement error handling and notifications
  - Create ErrorHandler class with error type definitions
  - Implement WebGL support detection
  - Implement TensorFlow.js support detection
  - Add model loading timeout (10 seconds)
  - Create error notification UI component with dismiss button
  - Add auto-dismiss after 10 seconds
  - Display appropriate error messages for each error type
  - _Requirements: 2.4, 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 17. Add depth mode initialization and cleanup
  - Implement async initDepthMode() function
  - Load TensorFlow.js model with 5-second timeout
  - Initialize DepthShaderManager and compile shaders
  - Add proper cleanup on mode deactivation
  - Dispose TensorFlow.js tensors and WebGL resources
  - _Requirements: 2.1, 2.4_

- [ ] 18. Wire up mode switching in existing animation system
  - Wrap existing pose detection logic in isAnimationModeActive() check
  - Ensure animation render loop stops when Depth Mode activates
  - Clear animation canvas when switching to Depth Mode
  - Ensure clean state transitions between modes
  - _Requirements: 1.1, 1.2_

- [ ] 19. Update manifest.json permissions if needed
  - Verify TensorFlow.js CDN access permissions
  - Ensure WebGL context creation permissions
  - Add any required content security policy updates
  - _Requirements: 2.1, 2.5_

- [ ] 20. Integration testing and polish
  - Test all 5 depth effects render correctly
  - Verify mode switching preserves theme settings
  - Confirm video pause stops detection for both modes
  - Test performance adaptation on different video resolutions
  - Verify error handling for unsupported browsers
  - Test settings persistence across page reloads
  - Ensure UI is responsive and intuitive
  - _Requirements: All_
