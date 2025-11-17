# Design Document

## Overview

This design document outlines the technical implementation for two independent features:

1. **Canvas Pause Control**: A UI control that allows users to hide all animation overlays and view clean video content
2. **Game Mode Auto-Reset**: Automatic deactivation of game mode when navigating to new videos

Both features integrate seamlessly with the existing YouTube Motion Tracking extension architecture while maintaining backward compatibility with existing functionality.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     YouTube Video Page                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Video Player                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │              Video Element                        │  │ │
│  │  │  ┌────────────────────────────────────────────┐  │  │ │
│  │  │  │  Canvas Overlay (2D + WebGL)              │  │  │ │
│  │  │  │  - Animations / Game Mode                 │  │  │ │
│  │  │  │  - Controlled by isCanvasHidden state     │  │  │ │
│  │  │  └────────────────────────────────────────────┘  │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Player Controls                                  │  │ │
│  │  │  [Extension Button] → Opens Popup                │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Extension Popup                                        │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  [Random Mode] [Stop/Play] [🔲 Pause Canvas]    │  │ │
│  │  │  [Animation Grid...]                              │  │ │
│  │  │  [Game Mode Toggle]                               │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    State Management                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Chrome Storage (Sync)                                  │ │
│  │  - isCanvasHidden: boolean                             │ │
│  │  - gameModeActive: boolean (cleared on video change)   │ │
│  │  - currentAnimationName: string                        │ │
│  │  - isAnimDisabled: boolean                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Event Flow                                │
│                                                               │
│  Video Navigation (background.js)                            │
│         ↓                                                     │
│  chrome.runtime.onMessage → "intPoseDetection"              │
│         ↓                                                     │
│  init() in content.js                                        │
│         ↓                                                     │
│  cleanup() → Remove old elements                             │
│         ↓                                                     │
│  Force Game Mode Reset                                       │
│         ↓                                                     │
│  Set currentAnimation = 'skeletonGlow'                       │
│         ↓                                                     │
│  Clear gameModeActive from storage                           │
│         ↓                                                     │
│  Initialize video with skeleton animation                    │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Feature 1: Canvas Pause Control

#### New State Variables

```javascript
// In content.js global scope
var isCanvasHidden = false;  // Track if canvas is hidden
```

#### New Functions

```javascript
/**
 * Pause canvas - hide overlays and clear content
 */
function pauseCanvas() {
    isCanvasHidden = true;
    
    // Clear canvas content
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (webGLtx && canvasGL) {
        webGLtx.clear(webGLtx.COLOR_BUFFER_BIT);
    }
    
    // Hide canvas elements
    if (canvas) {
        canvas.style.display = 'none';
    }
    if (canvasGL) {
        canvasGL.style.display = 'none';
    }
    
    // Stop random mode if active
    if (isRandomModeActive) {
        stopRandomMode();
    }
    
    // Save state
    saveCanvasHiddenState(true);
    
    // Update button
    updateCanvasPauseButton();
}

/**
 * Resume canvas - show overlays and resume rendering
 */
function resumeCanvas() {
    isCanvasHidden = false;
    
    // Show canvas elements
    if (canvas) {
        canvas.style.display = 'block';
    }
    if (canvasGL) {
        canvasGL.style.display = 'block';
    }
    
    // Save state
    saveCanvasHiddenState(false);
    
    // Update button
    updateCanvasPauseButton();
    
    // Resume animation rendering (handled by startDetection loop)
}

/**
 * Update pause button appearance
 */
function updateCanvasPauseButton() {
    const pauseButton = document.getElementById('canvasPauseButton');
    if (pauseButton) {
        if (isCanvasHidden) {
            pauseButton.textContent = '▶️ Resume Canvas';
            pauseButton.className = 'pdAnimButtonGreen';
        } else {
            pauseButton.textContent = '⏸️ Pause Canvas';
            pauseButton.className = 'pdAnimButtonRed';
        }
    }
}

/**
 * Save canvas hidden state to storage
 */
function saveCanvasHiddenState(value) {
    chrome.storage.sync.set({isCanvasHidden: value});
}

/**
 * Read canvas hidden state from storage
 */
function readCanvasHiddenState() {
    chrome.storage.sync.get(['isCanvasHidden'], function (result) {
        isCanvasHidden = result.isCanvasHidden || false;
        
        // Apply state if canvas exists
        if (isCanvasHidden && canvas && canvasGL) {
            canvas.style.display = 'none';
            canvasGL.style.display = 'none';
        }
    });
}
```

#### Modified Functions

```javascript
/**
 * Modified: setNewAnimation
 * Auto-resume canvas when animation is selected
 */
function setNewAnimation(animationId) {
    console.log('content.js setNewAnimation called with:', animationId);
    
    // Auto-resume canvas if it was paused
    if (isCanvasHidden) {
        resumeCanvas();
    }
    
    // Validate animation ID - fallback to default if undefined or invalid
    if(!animationId || animationId === 'undefined') {
        console.log('Invalid animation ID, using default: skeletonGlow');
        animationId = 'skeletonGlow';
    }
    
    if(anim !== null){
        anim.setNewAnimation(animationId);
        currentAnimation=animationId;
        saveCurrentAnimationName(animationId);
    } else {
        console.log('WARNING: anim is null, deferring animation switch to:', animationId);
        currentAnimation = animationId;
        saveCurrentAnimationName(animationId);
    }
}

/**
 * Modified: startDetection
 * Skip rendering when canvas is hidden
 */
function startDetection() {
    if (!isVideoPlay) {
        return;
    }

    // ... existing code ...

    // Skip rendering if canvas is hidden
    if (isCanvasHidden) {
        requestAnimationFrame(startDetection);
        return;
    }

    // ... rest of detection logic ...
}

/**
 * Modified: init
 * Load canvas hidden state
 */
function init() {
    console.log('Init called for new video');
    
    cleanup();
    
    // ... existing code ...
    
    readIsAnimDisabled();
    readCurrentAnimationName();
    readRandomSettings();
    readCanvasHiddenState();  // NEW: Load canvas pause state
    
    // ... rest of init ...
}
```

#### UI Changes

Add new button to popup HTML in `initVideoPlayerPopup()`:

```html
<div style="padding: 0 15px; margin-top: 10px;">
    <button id="animDisabledDiv" class="pdAnimButtonGreen" 
            onclick="document.dispatchEvent(new CustomEvent('changeIsAnimDisabled'));">
        ⏯️ Stop/Play Animation
    </button>
    <button id="canvasPauseButton" class="pdAnimButtonRed" 
            onclick="document.dispatchEvent(new CustomEvent('toggleCanvasPause'));">
        ⏸️ Pause Canvas
    </button>
</div>
```

#### Event Handlers

```javascript
/**
 * Event handler: Toggle canvas pause
 */
document.addEventListener('toggleCanvasPause', function (e) {
    if (isCanvasHidden) {
        resumeCanvas();
    } else {
        pauseCanvas();
    }
});
```

### Feature 2: Game Mode Auto-Reset

#### Modified Functions

```javascript
/**
 * Modified: init
 * Force game mode reset on video navigation
 */
function init() {
    console.log('Init called for new video');
    
    // Cleanup old elements first
    cleanup();
    
    // FORCE GAME MODE RESET ON VIDEO CHANGE
    console.log('[VIDEO CHANGE] Forcing game mode reset');
    isGameModeActive = false;
    
    // Clear game mode from storage
    chrome.storage.sync.set({ gameModeActive: false }, function() {
        console.log('[VIDEO CHANGE] Game mode cleared from storage');
    });
    
    // Force skeleton animation
    currentAnimation = 'skeletonGlow';
    saveCurrentAnimationName('skeletonGlow');
    console.log('[VIDEO CHANGE] Set animation to skeletonGlow');
    
    // Ensure animations are enabled (not disabled)
    isAnimDisabled = false;
    saveIsAnimDisabled(false);
    
    // ... rest of existing init code ...
    
    readIsAnimDisabled();
    readCurrentAnimationName();
    readRandomSettings();
    
    // NOTE: Do NOT call readGameModeState() here anymore
    // Game mode should only be activated by user action, not on video change
    
    initThemeSystem();
    initButtonInPlayer();
    addOnPlayingEvent();
    addLoadedDataEvent();
}

/**
 * Modified: handleVideoPlaying
 * Remove game mode auto-reinitialization
 */
function handleVideoPlaying(event) {
    console.log('Video onplaying event triggered');
    
    if (document.getElementById("canvasdummy") === null) {
        createCanvas();
    }

    if (document.getElementById("canvasdummyGL") === null) {
        createCanvasWebGL();
    }

    try {
        resizeObserver.observe(mainVideo);
    } catch(e) {
        // Already observing, ignore
    }

    if(!canvas || !canvasGL || !ctx) {
        console.error('Canvas elements not properly created!');
        return;
    }
    
    // REMOVED: readGameModeState() call
    // REMOVED: Auto-reinitialize game mode logic
    
    // Only create/update animation object
    if(anim === null){
        console.log('Creating new Anim object');
        anim = new Anim(mainVideo,canvas, canvasGL, ctx, webGLtx);
        
        // Apply skeleton animation (already set in init)
        if(currentAnimation && currentAnimation !== 'undefined') {
            console.log('Applying current animation to new anim object:', currentAnimation);
            anim.setNewAnimation(currentAnimation);
        } else {
            console.log('No current animation set, using default: skeletonGlow');
            currentAnimation = 'skeletonGlow';
            anim.setNewAnimation(currentAnimation);
        }
    }else{
        console.log('Updating existing Anim object canvas');
        anim.updateCanvas(mainVideo,canvas, canvasGL, ctx, webGLtx);
    }
    
    // Initialize FilterManager if not already created
    if(filterManager === null) {
        console.log('Creating new FilterManager object');
        filterManager = new FilterManager(mainVideo, canvas, ctx);
        filterManager.loadSavedFilter();
    }
}

/**
 * Modified: cleanup
 * Ensure game mode is properly cleaned up
 */
function cleanup() {
    console.log('Cleaning up old canvas elements and state');
    
    // ... existing cleanup code ...
    
    // Reset game mode
    if (gameMode) {
        try {
            gameMode.deactivate();
        } catch(e) {
            console.log('Error deactivating game mode:', e);
        }
        gameMode = null;
        console.log('Reset game mode object');
    }
    
    // Reset game mode flag
    isGameModeActive = false;
    
    // ... rest of cleanup ...
}
```

#### Updated Event Handler

```javascript
/**
 * Modified: toggleGameMode event handler
 * Game mode can still be manually activated, but won't persist across videos
 */
document.addEventListener('toggleGameMode', function (e) {
    console.log('[GAME MODE] Toggle event triggered');
    
    isGameModeActive = !isGameModeActive;
    
    if (isGameModeActive) {
        // Force initialization
        const initialized = forceInitialization();
        
        if (!initialized) {
            console.error('[GAME MODE] Initialization failed!');
            setTimeout(() => {
                forceInitialization();
                if (canvas && ctx) {
                    if (!gameMode) {
                        gameMode = new GameMode(canvas, ctx);
                    }
                    if (gameMode) {
                        gameMode.activate();
                        stopRandomMode();
                        isAnimDisabled = true;
                    }
                }
            }, 1000);
            updateGameModeButton();
            return;
        }
        
        setTimeout(() => {
            if (!gameMode && canvas && ctx) {
                try {
                    gameMode = new GameMode(canvas, ctx);
                } catch (error) {
                    console.error('[GAME MODE] Failed to create GameMode:', error);
                    return;
                }
            }
            
            if (gameMode) {
                try {
                    gameMode.activate();
                    stopRandomMode();
                    isAnimDisabled = true;
                } catch (error) {
                    console.error('[GAME MODE] Failed to activate:', error);
                }
            }
            
            updateGameModeButton();
            updateAnimDisabledDiv();
        }, 500);
        
    } else {
        console.log('[GAME MODE] Deactivating game mode');
        if (gameMode) {
            gameMode.deactivate();
        }
        isAnimDisabled = false;
        updateGameModeButton();
        updateAnimDisabledDiv();
    }
    
    // Save state (will be cleared on next video change)
    chrome.storage.sync.set({ gameModeActive: isGameModeActive });
});
```

## Data Models

### State Variables

```javascript
// Canvas Pause Control
var isCanvasHidden = false;  // boolean - tracks canvas visibility

// Game Mode Control (existing, modified behavior)
var isGameModeActive = false;  // boolean - tracks game mode state
var gameMode = null;  // GameMode instance or null

// Animation Control (existing)
var currentAnimation = "skeletonGlow";  // string - current animation ID
var isAnimDisabled = false;  // boolean - animation enable/disable
```

### Chrome Storage Schema

```javascript
{
    // New field for canvas pause
    isCanvasHidden: boolean,  // default: false
    
    // Modified behavior: cleared on video change
    gameModeActive: boolean,  // default: false, cleared in init()
    
    // Existing fields (unchanged)
    currentAnimationName: string,  // default: "skeletonGlow"
    isAnimDisabled: boolean,  // default: false
    randomSwitchSec: number,  // default: 10
    isRandomModeActive: boolean,  // default: false
    // ... other existing fields
}
```

## Error Handling

### Canvas Pause Control

1. **Canvas Not Ready**: If canvas elements don't exist when pause is triggered, skip the operation gracefully
2. **Storage Failure**: If Chrome storage fails, continue with in-memory state
3. **Button Not Found**: If pause button doesn't exist in DOM, log warning but don't crash

### Game Mode Auto-Reset

1. **Cleanup Errors**: Wrap game mode deactivation in try-catch to prevent init() failure
2. **Storage Errors**: If storage clear fails, continue with in-memory reset
3. **Animation Not Found**: Fallback to 'skeletonGlow' if animation ID is invalid

## Testing Strategy

### Feature 1: Canvas Pause Control

#### Unit Tests
- Test `pauseCanvas()` clears and hides canvas elements
- Test `resumeCanvas()` shows canvas elements
- Test `updateCanvasPauseButton()` updates button text correctly
- Test storage save/load functions

#### Integration Tests
- Test pause button click hides canvas
- Test animation selection resumes canvas
- Test state persists across page reloads
- Test interaction with random mode (should stop when paused)
- Test interaction with game mode (canvas should hide game mode too)

#### Manual Testing
1. Click pause button → verify canvas disappears, video visible
2. Click any animation → verify canvas reappears with animation
3. Pause canvas, reload page → verify canvas stays paused
4. Pause canvas, switch videos → verify pause state persists
5. Pause canvas while random mode active → verify random mode stops

### Feature 2: Game Mode Auto-Reset

#### Unit Tests
- Test `init()` clears game mode state
- Test `init()` sets skeleton animation
- Test `cleanup()` properly deactivates game mode

#### Integration Tests
- Test game mode active + video change → game mode deactivated
- Test game mode active + video change → skeleton animation shown
- Test storage cleared on video change
- Test UI button shows "OFF" after video change

#### Manual Testing
1. Activate game mode on video A
2. Navigate to video B
3. Verify game mode is OFF
4. Verify skeleton animation is active
5. Verify game mode button shows "OFF"
6. Verify no game mode UI elements visible
7. Verify can manually reactivate game mode on video B

## Performance Considerations

### Canvas Pause Control
- **Minimal Overhead**: Only adds one boolean check in render loop
- **Memory**: No additional memory allocation, just state flag
- **DOM Operations**: Minimal - only show/hide canvas elements

### Game Mode Auto-Reset
- **No Performance Impact**: Only executes during video navigation (infrequent)
- **Cleanup**: Properly disposes game mode resources
- **Storage**: Single storage write per video change

## Security Considerations

- No new security concerns introduced
- Uses existing Chrome storage API (sync)
- No external network requests
- No sensitive data stored

## Backward Compatibility

- Both features are additive and don't break existing functionality
- Existing users will see new pause button (opt-in feature)
- Game mode behavior change is transparent and improves UX
- All existing animations and features continue to work

## Dependencies

- Chrome Extension APIs: `chrome.storage.sync`
- Existing canvas elements: `canvas`, `canvasGL`, `ctx`, `webGLtx`
- Existing state management functions
- Existing UI popup system

## Future Enhancements

### Canvas Pause Control
- Add keyboard shortcut for pause/resume
- Add visual indicator on video when canvas is paused
- Add option to auto-pause on video pause

### Game Mode Auto-Reset
- Add option to persist game mode across videos (user preference)
- Add confirmation dialog before ending game with high score
- Add game statistics tracking across sessions
