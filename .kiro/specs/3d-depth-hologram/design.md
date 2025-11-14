# Design Document

## Overview

The 3D Depth Hologram Mode adds AI-powered depth estimation capabilities to the YouTube Motion Tracking extension, creating five Halloween-themed holographic visual effects. This feature operates as an exclusive alternative to the existing pose detection animation system, ensuring clean separation between Depth Mode and Animation Mode. The architecture leverages TensorFlow.js for real-time depth estimation, WebGL shaders for performant rendering, and integrates seamlessly with the existing Player Popup UI and Theme System.

### Key Design Principles

1. **Exclusive Mode Operation**: Only one detection system (depth or pose) runs at any time
2. **Performance First**: Maintain minimum 15 FPS through adaptive quality and frame skipping
3. **Theme Independence**: Mode switching does not affect active theme settings
4. **Graceful Degradation**: Clear error handling and performance warnings
5. **Minimal Integration Impact**: Leverage existing canvas and UI infrastructure

## Architecture

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     YouTube Video Player                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    content.js (Main Orchestrator)            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Mode Manager                                        │   │
│  │  - Exclusive mode switching (Depth ↔ Animation)      │   │
│  │  - Video playback state monitoring                   │   │
│  │  - Detection lifecycle management                    │   │
│  └──────────────────────────────────────────────────────┘   │
└───┬─────────────────────────────┬───────────────────────────┘
    │                             │
    ▼                             ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   DEPTH MODE PIPELINE     │   │  ANIMATION MODE PIPELINE  │
│                           │   │                           │
│  ┌─────────────────────┐ │   │  ┌─────────────────────┐  │
│  │  depth.js           │ │   │  │  detectUtils.js     │  │
│  │  - DepthEstimator   │ │   │  │  - Pose Detection   │  │
│  │  - PerformanceMonitor│ │   │  │  - Keypoint Mapping │  │
│  └─────────────────────┘ │   │  └─────────────────────┘  │
│           │               │   │           │               │
│           ▼               │   │           ▼               │
│  ┌─────────────────────┐ │   │  ┌─────────────────────┐  │
│  │  depthShaders.js    │ │   │  │  anim.js            │  │
│  │  - WebGL Shaders    │ │   │  │  - Particle Effects │  │
│  │  - 5 Effect Modes   │ │   │  │  - Skeleton Drawing │  │
│  └─────────────────────┘ │   │  └─────────────────────┘  │
└───────────┬───────────────┘   └───────────┬───────────────┘
            │                               │
            └───────────┬───────────────────┘
                        ▼
            ┌───────────────────────┐
            │   Canvas Rendering    │
            │   - canvas (2D)       │
            │   - canvasGL (WebGL)  │
            └───────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Player Popup UI     │
            │   - Mode Toggle       │
            │   - Effect Selection  │
            │   - Settings Sliders  │
            └───────────────────────┘
```

### Mode Management State Machine

```
                    ┌─────────────┐
                    │   INACTIVE  │
                    │  (No Mode)  │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
         Enable Depth            Enable Animation
              │                         │
              ▼                         ▼
    ┌─────────────┐           ┌─────────────┐
    │ DEPTH MODE  │           │ANIMATION MODE│
    │   ACTIVE    │           │   ACTIVE     │
    └──────┬──────┘           └──────┬───────┘
           │                         │
    Video Playing ◄──────────────────┤
           │                         │
           ▼                         ▼
    ┌─────────────┐           ┌─────────────┐
    │Depth Detect │           │Pose Detect  │
    │  RUNNING    │           │  RUNNING    │
    └──────┬──────┘           └──────┬───────┘
           │                         │
    Video Paused ◄───────────────────┤
           │                         │
           ▼                         ▼
    ┌─────────────┐           ┌─────────────┐
    │Depth Detect │           │Pose Detect  │
    │  PAUSED     │           │  PAUSED     │
    └─────────────┘           └─────────────┘
```

## Components and Interfaces

### 1. Mode Manager (content.js extension)

**Responsibility**: Orchestrates exclusive mode switching and detection lifecycle

**Key Methods**:
```javascript
class ModeManager {
  constructor(mainVideo, canvas, canvasGL)
  
  // Mode switching
  enableDepthMode()      // Activates depth, deactivates pose
  enableAnimationMode()  // Activates pose, deactivates depth
  disableAllModes()      // Stops all detection
  
  // State queries
  isDepthModeActive()
  isAnimationModeActive()
  getCurrentMode()       // Returns 'depth' | 'animation' | 'none'
  
  // Video playback monitoring
  onVideoPlay()          // Resume active detection
  onVideoPause()         // Pause active detection
  
  // Detection control
  startActiveDetection()
  stopActiveDetection()
  pauseActiveDetection()
  resumeActiveDetection()
}
```

**State Management**:
```javascript
{
  currentMode: 'none' | 'depth' | 'animation',
  isVideoPlaying: boolean,
  isDetectionRunning: boolean,
  depthEstimator: DepthEstimator | null,
  poseDetector: PoseDetector | null
}
```

### 2. DepthEstimator (depth.js)

**Responsibility**: TensorFlow.js-based depth estimation from video frames

**Interface**:
```javascript
class DepthEstimator {
  constructor(videoElement, canvas)
  
  // Lifecycle
  async init()                    // Load TF.js model
  dispose()                       // Cleanup resources
  
  // Depth estimation
  async estimateDepth(videoFrame) // Returns depth map (2D array)
  getDepthAtPoint(x, y)          // Query depth at coordinate
  
  // Configuration
  setInputResolution(width, height)
  setQuality('low' | 'medium' | 'high')
  
  // State
  isModelLoaded()
  getModelInfo()
}
```

**Model Strategy**:
- Primary: MiDaS v2.1 small (if available)
- Fallback: Placeholder depth estimation based on luminance + gradient
- Input: 256x256 (resized from video frame)
- Output: Depth map normalized to [0, 1]

**Performance Optimizations**:
- Tensor disposal after each frame
- Adaptive resolution based on FPS
- Frame skipping when performance degrades

### 3. PerformanceMonitor (depth.js)

**Responsibility**: Track FPS and computation times, trigger adaptive quality

**Interface**:
```javascript
class PerformanceMonitor {
  constructor()
  
  // Metrics tracking
  recordFrame(frameTime, depthComputeTime)
  getAverageFPS()
  getAverageDepthTime()
  
  // Adaptive decisions
  shouldSkipDepthFrame()          // Returns boolean
  autoAdjustQuality()             // Returns 'low'|'medium'|'high'
  shouldShowWarning()             // Returns boolean
  
  // Benchmarking
  async benchmarkDepthModel()     // Returns avg time in ms
}
```

**Metrics**:
- Rolling 60-frame window for FPS calculation
- Depth computation time per frame
- Warning threshold: 15 FPS
- Frame skip threshold: 20 FPS

### 4. DepthShaderManager (depthShaders.js)

**Responsibility**: WebGL shader compilation and rendering for all 5 effects

**Interface**:
```javascript
class DepthShaderManager {
  constructor(canvasGL, webGLContext)
  
  // Lifecycle
  async init()                    // Compile shaders
  dispose()                       // Cleanup GL resources
  
  // Rendering
  render(videoTexture, depthTexture, mode, intensity, focusDepth)
  
  // Shader management
  compileShader(source, type)
  createProgram(vertexShader, fragmentShader)
  setupUniforms()
  setupAttributes()
}
```

**Shader Uniforms**:
```glsl
uniform sampler2D uVideoTexture;   // Original video frame
uniform sampler2D uDepthTexture;   // Depth map
uniform float uIntensity;          // Effect strength (0-1)
uniform float uFocusDepth;         // Focus plane (0-255)
uniform float uTime;               // Animation time
uniform int uMode;                 // Effect mode (0-4)
```

**Effect Mode Mapping**:
- 0: Phantom Emergence (parallax layers)
- 1: Spectral Scan (scan lines + glitch)
- 2: Graveyard Mist (depth fog)
- 3: Spirit Focus (depth-of-field blur)
- 4: Haunted Aura (edge glow)

### 5. DepthModeEnum (depthModeEnum.js)

**Responsibility**: Define Halloween-themed depth effect modes

**Structure**:
```javascript
class DepthModeEnum {
  static phantomEmergence = new DepthModeEnum('phantomEmergence', '👻 Phantom', 0)
  static spectralScan = new DepthModeEnum('spectralScan', '📡 Spectral', 1)
  static graveyardMist = new DepthModeEnum('graveyardMist', '🌫️ Mist', 2)
  static spiritFocus = new DepthModeEnum('spiritFocus', '🔮 Spirit', 3)
  static hauntedAura = new DepthModeEnum('hauntedAura', '✨ Aura', 4)
  
  constructor(name, icon, id)
  
  static getNameArray()
  static getAllModes()
  static getModeById(id)
}
```

## Data Models

### Depth Map Structure

```javascript
// 2D array representing depth values
type DepthMap = number[][]  // Values in range [0, 1]

// Example: 720x480 depth map
{
  width: 720,
  height: 480,
  data: [
    [0.1, 0.12, 0.15, ...],  // Row 0 (near objects)
    [0.5, 0.52, 0.48, ...],  // Row 1 (mid-depth)
    [0.9, 0.88, 0.92, ...],  // Row 2 (far objects)
    ...
  ]
}
```

### Mode State

```javascript
{
  // Current operational mode
  activeMode: 'none' | 'depth' | 'animation',
  
  // Depth mode settings
  depthMode: {
    enabled: boolean,
    currentEffect: 'phantomEmergence' | 'spectralScan' | 'graveyardMist' | 
                   'spiritFocus' | 'hauntedAura',
    intensity: number,        // 0-100
    focusDepth: number,       // 0-255 (for Spirit Focus)
    isModelLoaded: boolean,
    isProcessing: boolean
  },
  
  // Animation mode settings (existing)
  animationMode: {
    enabled: boolean,
    currentAnimation: string,
    isDetecting: boolean
  },
  
  // Video playback state
  video: {
    isPlaying: boolean,
    isPaused: boolean,
    currentTime: number
  },
  
  // Performance metrics
  performance: {
    currentFPS: number,
    avgDepthTime: number,
    quality: 'low' | 'medium' | 'high',
    frameSkipEnabled: boolean
  }
}
```

### Chrome Storage Schema

```javascript
{
  // Mode preferences
  'lastActiveMode': 'depth' | 'animation' | 'none',
  'depthModeEnabled': boolean,
  
  // Depth settings
  'selectedDepthEffect': string,
  'depthIntensity': number,
  'depthFocusDepth': number,
  
  // Theme (unchanged by mode switching)
  'activeTheme': string,
  'themeSettings': object
}
```

## Error Handling

### Error Categories

1. **Model Loading Errors**
   - Network failure
   - Incompatible browser
   - TensorFlow.js initialization failure

2. **Runtime Errors**
   - WebGL context loss
   - Out of memory
   - Shader compilation failure

3. **Performance Errors**
   - FPS below threshold
   - Excessive computation time

### Error Handling Strategy

```javascript
class ErrorHandler {
  // Error notification
  showError(type, message, dismissible = true)
  
  // Error types
  static ERROR_TYPES = {
    MODEL_LOAD_FAILED: 'model-load-failed',
    WEBGL_NOT_SUPPORTED: 'webgl-not-supported',
    TFJS_NOT_SUPPORTED: 'tfjs-not-supported',
    PERFORMANCE_TOO_LOW: 'performance-too-low',
    RUNTIME_ERROR: 'runtime-error'
  }
  
  // Graceful degradation
  handleModelLoadFailure()    // Disable depth mode, show error
  handlePerformanceIssue()    // Show warning with options
  handleWebGLContextLoss()    // Attempt recovery or disable
}
```

### Error UI Components

**Error Notification**:
```html
<div class="depth-error-notification">
  <div class="error-icon">⚠️</div>
  <div class="error-message">{message}</div>
  <button class="error-dismiss">Dismiss</button>
</div>
```

**Performance Warning**:
```html
<div class="depth-performance-warning">
  <div class="warning-icon">⚠️</div>
  <div class="warning-message">
    Performance issues detected (FPS < 15)
  </div>
  <div class="warning-actions">
    <button id="lowerQuality">Lower Quality</button>
    <button id="disableDepth">Disable Depth</button>
    <button id="ignoreWarning">Ignore</button>
  </div>
</div>
```

## Testing Strategy

### Unit Tests

1. **DepthEstimator Tests**
   - Model initialization
   - Depth map generation
   - Tensor cleanup
   - Resolution adaptation

2. **PerformanceMonitor Tests**
   - FPS calculation accuracy
   - Frame skip logic
   - Quality adjustment thresholds

3. **ModeManager Tests**
   - Exclusive mode switching
   - Detection lifecycle
   - Video playback state handling

### Integration Tests

1. **Mode Switching**
   - Depth → Animation transition
   - Animation → Depth transition
   - Theme preservation during switch

2. **Video Playback Integration**
   - Play/pause detection control
   - Video seek handling
   - New video navigation

3. **Performance Adaptation**
   - Frame skipping activation
   - Quality downgrade
   - Warning display

### Manual Testing Checklist

- [ ] All 5 effects render correctly
- [ ] Mode switching is clean (no lingering effects)
- [ ] Theme remains unchanged during mode switch
- [ ] Video pause stops detection
- [ ] Video play resumes detection
- [ ] Performance warning appears at low FPS
- [ ] Error messages display for unsupported browsers
- [ ] Settings persist across sessions
- [ ] UI is responsive and intuitive

### Performance Benchmarks

**Target Metrics**:
- Depth estimation: < 40ms per frame
- Shader rendering: < 10ms per frame
- Total overhead: < 50ms per frame (20 FPS minimum)
- Memory usage: < 500MB additional

**Test Scenarios**:
- 480p video @ 30 FPS
- 720p video @ 30 FPS
- 1080p video @ 30 FPS (with quality adaptation)

## Implementation Notes

### Integration with Existing Code

**content.js modifications**:
- Add ModeManager instantiation
- Modify existing pose detection start/stop logic
- Add video play/pause event listeners
- Integrate depth mode UI into Player Popup

**anim.js modifications**:
- Wrap animation logic in `isAnimationModeActive()` check
- Ensure clean canvas clearing when switching modes

**Minimal changes to**:
- animEnum.js (no changes)
- filterEnum.js (no changes)
- Theme CSS files (no changes)

### File Organization

```
src/
├── depth.js                 (NEW - 20KB)
├── depthModeEnum.js         (NEW - 3KB)
├── depthShaders.js          (NEW - 8KB)
├── content.js               (MODIFIED - add ~3KB)
├── anim.js                  (MODIFIED - add ~1KB)
├── content.css              (MODIFIED - add depth UI styles)
└── popup.html               (MODIFIED - add depth mode section)
```

### WebGL Shader Implementation Details

**Vertex Shader** (shared by all effects):
```glsl
attribute vec2 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
```

**Fragment Shader** (mode-specific logic):
- Single shader with mode switch
- Shared helper functions (Sobel, Gaussian blur, luminance)
- Mode-specific rendering paths

### Performance Optimization Techniques

1. **Adaptive Resolution**
   - High: 720x480 depth maps
   - Medium: 480x320 depth maps
   - Low: 360x240 depth maps

2. **Frame Skipping**
   - Normal: Process every frame
   - Skip 50%: Process every 2nd frame
   - Skip 66%: Process every 3rd frame

3. **Tensor Memory Management**
   - Immediate disposal after use
   - No tensor pooling (simplicity over micro-optimization)
   - Monitor TF.js memory with `tf.memory()`

4. **WebGL Optimization**
   - Single shader program (avoid program switching)
   - Texture reuse where possible
   - Minimize uniform updates

### Browser Compatibility

**Supported**:
- Chrome 100+ (full support)
- Edge 100+ (full support)

**Limited Support**:
- Firefox (WebGL may have issues)

**Not Supported**:
- Safari (TensorFlow.js WebGL backend issues)

### Future Enhancements (Out of Scope)

- Depth map caching for rewatching
- Keyboard shortcuts for quick mode switching
- Onboarding tutorial for first-time users
- Additional Halloween effects (6-10)
- Depth-aware particle integration (requires architectural changes)
