# Implementation Plan - Motion Game Mode

## Overview

This implementation plan breaks down the Motion Game Mode feature into discrete, manageable coding tasks. Each task builds incrementally on previous work, ensuring the system remains functional throughout development.

## Task List

- [ ] 1. Create core enum and configuration files
  - Create `src/gameModeEnum.js` with GameModeEnum class definition
  - Create `src/motionEnum.js` with MotionEnum class and all 5 movement definitions
  - Create `src/gameConfig.js` with all configuration constants
  - _Requirements: 1.1, 2.1, 3.1, 18.1-18.5_

- [ ] 2. Implement motion detection utilities
  - [ ] 2.1 Create CooldownManager class in `src/motionDetector.js`
    - Implement constructor with configurable cooldown period
    - Implement `canDetect()` method with timestamp checking
    - Implement `reset()` method
    - _Requirements: 13.1, 15.1_
  
  - [ ] 2.2 Create TimeWindowAnalyzer class in `src/motionDetector.js`
    - Implement frame buffer management
    - Implement `addFrame()` method with timestamp tracking
    - Implement `isMovementConfirmed()` with 60% threshold
    - Implement automatic cleanup of old frames (>500ms)
    - _Requirements: 13.2, 13.3, 13.5_

- [ ] 3. Implement MotionDetector class
  - [ ] 3.1 Create MotionDetector class structure
    - Implement constructor with config parameter
    - Initialize cooldown managers for all 5 movements
    - Initialize time window analyzers for all 5 movements
    - Implement frame counter for sampling
    - _Requirements: 12.1, 14.1_
  
  - [ ] 3.2 Implement helper methods
    - Implement `calculateArmAngle()` using vector math
    - Implement `calculateLegAngle()` using vector math
    - Implement `angleBetweenVectors()` with dot product
    - Implement `validateKeypoints()` with confidence threshold
    - Implement `getRequiredKeypoints()` mapping
    - _Requirements: 14.2, 15.4, 16.2_
  
  - [ ] 3.3 Implement Arm Curl detection
    - Implement `detectArmCurl()` method
    - Calculate angles for both left and right arms
    - Compare against threshold (45 degrees)
    - Handle both arms independently
    - _Requirements: 5.1-5.5_
  
  - [ ] 3.4 Implement Head Turn detection
    - Implement `detectHeadTurn()` method
    - Calculate nose position relative to ear midpoint
    - Compare horizontal delta against threshold (30px)
    - _Requirements: 6.1-6.5_
  
  - [ ] 3.5 Implement Arm Raise detection
    - Implement `detectArmRaise()` method
    - Compare wrist Y position to shoulder Y position
    - Apply hysteresis threshold (20px)
    - Handle both arms independently
    - _Requirements: 7.1-7.5_
  
  - [ ] 3.6 Implement Squat detection
    - Implement `detectSquat()` method
    - Calculate leg angles for both legs
    - Implement state machine (STANDING/SQUATTING)
    - Count only complete transitions (SQUATTING → STANDING)
    - _Requirements: 8.1-8.5_
  
  - [ ] 3.7 Implement Jumping Jack detection
    - Implement `detectJumpingJack()` method
    - Check both wrists above shoulders
    - Check ankle spread wider than hip width
    - Require both conditions simultaneously
    - _Requirements: 9.1-9.5_
  
  - [ ] 3.8 Implement main detect() method
    - Implement frame sampling logic (every 3rd frame)
    - Implement cooldown checking
    - Implement keypoint validation
    - Route to specific detection methods based on motion type
    - Integrate time window validation
    - _Requirements: 4.1-4.5, 12.1, 14.1_

- [ ] 4. Implement GhostCharacter rendering
  - [ ] 4.1 Create GhostCharacter class in `src/ghostCharacter.js`
    - Implement constructor with canvas, ctx, and config
    - Initialize position variables (x, y, baseY, targetY)
    - Initialize jump tracking (currentJump, maxJumps)
    - Initialize animation state variables
    - _Requirements: 10.1_
  
  - [ ] 4.2 Implement jump animation logic
    - Implement `jump()` method to increment and set target position
    - Implement `reset()` method to return to base position
    - Implement `animateJump()` to trigger animation
    - Implement `update()` with easing function (ease-out cubic)
    - _Requirements: 10.2, 10.4, 10.5_
  
  - [ ] 4.3 Implement ghost rendering
    - Implement `draw()` method with canvas 2D drawing
    - Draw ghost body as circle
    - Draw wavy tail at bottom
    - Draw eyes
    - Add idle bounce animation using sine wave
    - _Requirements: 10.1, 10.3_

- [ ] 5. Implement JumpMarkers rendering
  - Create JumpMarkers class in `src/jumpMarkers.js`
  - Implement `draw()` method with 10 horizontal markers
  - Calculate marker positions based on jump height
  - Render reached markers in gold with 60% opacity
  - Render unreached markers in white with 30% opacity
  - Draw number labels (1-10) next to each marker
  - _Requirements: 11.1-11.5_

- [ ] 6. Implement GameMode state machine
  - [ ] 6.1 Create GameMode class in `src/gameMode.js`
    - Implement constructor with canvas, ctx, and config
    - Initialize state as 'INACTIVE'
    - Initialize score and jump counters
    - Create instances of GhostCharacter, JumpMarkers, MotionDetector
    - _Requirements: 2.1, 17.3_
  
  - [ ] 6.2 Implement state transition methods
    - Implement `activate()` to transition to SELECTING state
    - Implement `deactivate()` to return to INACTIVE state
    - Implement `startGame(motionType)` to transition to PLAYING state
    - _Requirements: 2.1, 2.2, 3.4_
  
  - [ ] 6.3 Implement game logic
    - Implement `onMovementDetected()` to handle jump increments
    - Implement point award logic when jumps reach 10
    - Implement ghost reset after point award
    - Implement score and high score tracking
    - _Requirements: 13.1, 13.2, 13.4_
  
  - [ ] 6.4 Implement update and render methods
    - Implement `update(keypoints)` to call motion detector
    - Implement `render()` to draw markers and ghost
    - Ensure rendering only occurs in PLAYING state
    - _Requirements: 1.1, 10.1, 11.1_

- [ ] 7. Implement Motion Selection Panel UI
  - [ ] 7.1 Create motion selection panel DOM structure
    - Implement `showMotionSelectionPanel()` in GameMode class
    - Create panel div with motion-panel class
    - Generate buttons for all 5 movements dynamically
    - Display icon, name, and description for each movement
    - _Requirements: 2.2, 2.3, 3.2_
  
  - [ ] 7.2 Add motion selection event handlers
    - Add click event listeners to motion buttons
    - Call `startGame(motionType)` on button click
    - Implement `hideMotionSelectionPanel()` method
    - _Requirements: 2.3, 2.4, 3.3_

- [ ] 8. Implement Game HUD
  - [ ] 8.1 Create HUD DOM structure
    - Implement `showHUD()` in GameMode class
    - Create HUD div with game-hud class
    - Display selected motion icon and name
    - Display score, jumps (X/10), and high score
    - Create combo indicator element
    - _Requirements: 12.1-12.4_
  
  - [ ] 8.2 Implement HUD update logic
    - Implement `updateHUD()` method
    - Update score value in DOM
    - Update jumps value in format "X/10"
    - Update high score value
    - _Requirements: 12.5, 13.3_

- [ ] 9. Implement visual feedback effects
  - [ ] 9.1 Implement jump feedback
    - Implement `showJumpFeedback()` method
    - Display "NICE!" in combo indicator
    - Fade out combo indicator after 500ms
    - _Requirements: 15.1, 17.5_
  
  - [ ] 9.2 Implement point reward animation
    - Implement `showPointReward()` method
    - Create "+1" floating text element
    - Position at ghost location
    - Animate upward with fade-out
    - Remove element after animation
    - _Requirements: 15.3_
  
  - [ ] 9.3 Implement high score effect
    - Implement `showHighScoreEffect()` method
    - Display "NEW HIGH SCORE!" in combo indicator
    - Use gold color for text
    - Display for 2 seconds
    - _Requirements: 13.5_
  
  - [ ]* 9.4 Integrate particle effects
    - Implement `createJumpParticles()` method
    - Use existing Proton system from anim.js
    - Create particle burst at ghost position
    - Use ghostly white/blue colors
    - _Requirements: 15.2_

- [ ] 10. Implement state persistence
  - [ ] 10.1 Implement save functionality
    - Implement `saveGameState()` method
    - Save high score to Chrome local storage
    - Save total games played counter
    - Save per-movement statistics
    - Add error handling for storage failures
    - _Requirements: 18.1, 18.2, 21.4_
  
  - [ ] 10.2 Implement load functionality
    - Implement `loadGameState()` method
    - Load saved state from Chrome local storage
    - Set high score from loaded data
    - Provide default values if no saved state exists
    - _Requirements: 18.3, 18.5_

- [ ] 11. Add CSS styles for game mode
  - Add motion-panel styles to `src/content.css`
  - Add motion-btn styles with hover effects
  - Add game-hud styles with backdrop filter
  - Add point-reward animation keyframes
  - Add combo indicator styles
  - Ensure z-index layering is correct
  - _Requirements: 22.1, 22.2_

- [ ] 12. Integrate game mode toggle in popup
  - [ ] 12.1 Update popup HTML
    - Add game mode toggle button to `src/popup.html`
    - Add game-mode-section div
    - Style button with game-toggle-btn class
    - _Requirements: 2.1_
  
  - [ ] 12.2 Update popup JavaScript
    - Add click event listener for game toggle button in `src/popup.js`
    - Toggle isGameModeActive state variable
    - Update button text to show ON/OFF state
    - Send message to content script with gameMode flag
    - Save game mode state to Chrome sync storage
    - Load saved state on popup initialization
    - _Requirements: 2.3, 2.5_

- [ ] 13. Integrate game mode into content.js
  - [ ] 13.1 Add game mode initialization
    - Import GameMode class and dependencies
    - Create global gameMode variable
    - Implement `initGameMode()` function
    - Initialize with existing canvas and context
    - _Requirements: 17.3, 17.4_
  
  - [ ] 13.2 Integrate into detection loop
    - Modify `startDetection()` function
    - Check if game mode is active and in PLAYING state
    - Call `gameMode.update(keypoints)` with detected keypoints
    - Call `gameMode.render()` to draw game elements
    - Pause animation rendering when game mode is active
    - _Requirements: 1.1, 17.1, 17.5_
  
  - [ ] 13.3 Add message listener for game mode toggle
    - Add chrome.runtime.onMessage listener
    - Handle gameMode message from popup
    - Call `initGameMode()` and `gameMode.activate()` when enabled
    - Call `gameMode.deactivate()` when disabled
    - _Requirements: 2.1, 2.4_
  
  - [ ] 13.4 Handle canvas resize events
    - Update existing ResizeObserver
    - Reposition ghost character on resize
    - Update ghost baseY position
    - Recalculate marker positions
    - _Requirements: 22.3, 22.4, 22.5, 21.5_

- [ ] 14. Add error handling and robustness
  - Add try-catch blocks in `gameMode.update()`
  - Handle missing or invalid keypoints gracefully
  - Validate canvas dimensions before rendering
  - Add console warnings for non-critical errors
  - Ensure game continues on detection failures
  - _Requirements: 21.1, 21.2, 21.3_

- [ ] 15. Performance optimization
  - Verify frame sampling is working (every 3rd frame)
  - Ensure only selected motion is being checked
  - Validate cooldown periods are preventing rapid detections
  - Test time window analysis performance
  - Measure additional latency (<5ms target)
  - _Requirements: 14.1-14.5_

- [ ] 16. Final integration and testing
  - Test complete flow: activate → select motion → play → score
  - Verify all 5 movements detect correctly
  - Test state persistence across page reloads
  - Verify UI elements position correctly on different screen sizes
  - Test with videos containing no people (graceful handling)
  - Test with videos containing multiple people
  - Verify game mode toggle works correctly
  - Test animation system resumes after game mode deactivation
  - _Requirements: All_
