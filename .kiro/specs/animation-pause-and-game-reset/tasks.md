# Implementation Plan

## Feature 1: Canvas Pause Control

- [x] 1. Add canvas pause state management
  - Add `isCanvasHidden` global variable to content.js
  - Implement `pauseCanvas()` function to clear and hide canvas elements
  - Implement `resumeCanvas()` function to show canvas elements
  - Implement `updateCanvasPauseButton()` function to update button appearance
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 1.11_

- [x] 2. Implement canvas pause storage functions
  - Implement `saveCanvasHiddenState(value)` function using chrome.storage.sync
  - Implement `readCanvasHiddenState()` function to load state on init
  - Call `readCanvasHiddenState()` in `init()` function
  - Apply loaded state to canvas elements if they exist
  - _Requirements: 1.9, 1.10_

- [x] 3. Add pause button to player popup UI
  - Modify `initVideoPlayerPopup()` function in content.js
  - Add new button HTML next to `animDisabledDiv` button
  - Set button ID to `canvasPauseButton`
  - Add onclick handler to dispatch `toggleCanvasPause` CustomEvent
  - Style button with appropriate CSS classes
  - _Requirements: 1.1_

- [x] 4. Implement canvas pause event handler
  - Add `document.addEventListener('toggleCanvasPause')` event listener
  - Call `pauseCanvas()` or `resumeCanvas()` based on current state
  - Update button appearance after state change
  - _Requirements: 1.2, 1.3, 1.6, 1.7, 1.11_

- [x] 5. Modify startDetection to respect pause state
  - Add check for `isCanvasHidden` at start of `startDetection()` function
  - Skip all rendering logic when canvas is hidden
  - Continue requestAnimationFrame loop even when paused
  - Ensure video playback continues uninterrupted
  - _Requirements: 1.4, 1.5_

- [x] 6. Auto-resume canvas on animation selection
  - Modify `setNewAnimation()` function
  - Add check for `isCanvasHidden` at function start
  - Call `resumeCanvas()` if canvas is currently hidden
  - Apply selected animation after resuming
  - _Requirements: 1.6, 1.7, 1.8_

- [x] 7. Integrate pause with random mode
  - Modify `pauseCanvas()` function
  - Add check for `isRandomModeActive`
  - Call `stopRandomMode()` if random mode is active
  - Ensure random mode doesn't restart while paused
  - _Requirements: 1.12_

- [x] 8. Update UI after popup creation
  - Modify `handleVideoLoaded()` function
  - Call `updateCanvasPauseButton()` after popup is created
  - Ensure button reflects current pause state
  - _Requirements: 1.11_

## Feature 2: Game Mode Auto-Reset on Video Navigation

- [x] 9. Force game mode reset in init function
  - Modify `init()` function in content.js
  - After `cleanup()` call, add game mode reset logic
  - Set `isGameModeActive = false`
  - Set `currentAnimation = 'skeletonGlow'`
  - Call `saveCurrentAnimationName('skeletonGlow')`
  - Set `isAnimDisabled = false`
  - Call `saveIsAnimDisabled(false)`
  - _Requirements: 2.2, 2.3, 2.6_

- [x] 10. Clear game mode from storage on video change
  - In `init()` function after game mode reset
  - Call `chrome.storage.sync.set({ gameModeActive: false })`
  - Add console log to confirm storage cleared
  - _Requirements: 2.4, 2.5_

- [x] 11. Remove game mode auto-reinitialization
  - Modify `handleVideoPlaying()` function
  - Remove call to `readGameModeState()`
  - Remove auto-reinitialize game mode logic block
  - Keep only animation object creation/update logic
  - _Requirements: 2.2, 2.3_

- [x] 12. Ensure cleanup properly resets game mode
  - Verify `cleanup()` function deactivates game mode
  - Verify `cleanup()` sets `gameMode = null`
  - Verify `cleanup()` sets `isGameModeActive = false`
  - Add error handling for game mode deactivation
  - _Requirements: 2.9_

- [x] 13. Update game mode button state after video change
  - Modify `handleVideoLoaded()` function
  - Call `updateGameModeButton()` after popup creation
  - Ensure button shows "Game Mode: OFF" text
  - _Requirements: 2.7_

- [x] 14. Verify skeleton animation renders on new video
  - Test that `currentAnimation` is set to 'skeletonGlow' in init
  - Test that animation object applies skeleton animation
  - Test that pose detection activates with skeleton animation
  - Test that canvas overlay shows skeleton animation
  - _Requirements: 2.8, 2.10_

- [x] 15. Test game mode manual reactivation
  - Verify user can manually activate game mode after video change
  - Verify `toggleGameMode` event handler still works
  - Verify game mode state saves to storage when manually activated
  - Verify game mode will reset again on next video change
  - _Requirements: 2.1, 2.2, 2.4_

## Integration and Testing

- [x] 16. Test canvas pause with animations
  - Test pause button hides canvas and clears content
  - Test clicking animation button resumes canvas
  - Test pause state persists across page reloads
  - Test pause works with all animation types (canvas and particle)
  - _Requirements: 1.2, 1.3, 1.6, 1.7, 1.9, 1.10_

- [x] 17. Test canvas pause with game mode
  - Test pause button hides game mode canvas
  - Test game mode UI elements remain visible when canvas paused
  - Test resuming canvas while game mode is active
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 18. Test game mode reset on video navigation
  - Activate game mode on video A
  - Navigate to video B
  - Verify game mode is deactivated
  - Verify skeleton animation is active
  - Verify game mode button shows "OFF"
  - Verify no game mode UI elements visible
  - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.9_

- [x] 19. Test interaction between both features
  - Pause canvas, then switch videos → verify pause state persists
  - Activate game mode, pause canvas, switch videos → verify both reset correctly
  - Test all combinations of states across video changes
  - _Requirements: 1.9, 1.10, 2.1, 2.2, 2.3_

- [x] 20. Verify no regressions in existing functionality
  - Test all existing animations still work
  - Test random mode still works
  - Test theme system still works
  - Test filter system still works
  - Test stop/play animation button still works
  - _Requirements: All_
