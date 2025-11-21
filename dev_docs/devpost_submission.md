# YouTube Motion Tracking - Halloween Edition

## Inspiration

The inspiration came from combining two fascinating technologies: AI-powered pose detection and creative web animations. We wanted to transform the passive experience of watching YouTube videos into something interactive and fun, especially for the Halloween season. The idea was to make any YouTube video feel like a spooky, immersive experience by overlaying real-time motion-tracked Halloween animations. We also saw an opportunity to gamify fitness and dance videos by detecting specific movements, turning workout content into an interactive challenge.

## What it does

YouTube Motion Tracking - Halloween Edition is a Chrome extension that transforms YouTube into a complete Halloween experience with four major features:

**1. AI-Powered Halloween Animations (38 effects)**
- Detects 17 body keypoints in YouTube videos using TensorFlow.js MoveNet
- Overlays spooky animations that track movements in real-time
- Includes skeletons, pumpkins, bats, ghosts, magical effects, and atmospheric particles
- Animations work on any YouTube video with visible people

**2. Motion Game Mode**
- Turns YouTube videos into interactive games
- Detects 5 specific movements: arm curls, head turns, arm raises, squats, and jumping jacks
- Ghost character jumps when movements are detected
- Score tracking system: 10 detected movements = 1 point
- Perfect for fitness videos, dance tutorials, and sports content

**3. Horror Video Filters (7 cinematic effects)**
- VHS Tape - retro analog video with scanlines
- Found Footage - amateur horror film aesthetic
- X-Ray Lab - medical/scientific green look
- Blood Moon - dark red ominous atmosphere
- Film Noir - classic black and white
- Toxic Waste - radioactive green glow
- Filters work additively with animations

**4. Complete YouTube UI Theme**
- Transforms entire YouTube interface with Halloween styling
- 3 intensity levels (Low, Medium, High)
- Optional animated particle effects
- Affects header, sidebar, player, thumbnails, comments, scrollbars
- All YouTube functionality remains intact

## How we built it

**Technologies & Architecture:**

- **TensorFlow.js 4.22.0** - Core AI engine for real-time pose detection using the MoveNet model
- **Proton Engine 5.4.3** - Physics-based particle system for realistic animation effects
- **Chrome Extension Manifest V3** - Modern extension architecture with content scripts and service workers
- **Parcel 2.16.0** - Build system for bundling JavaScript modules
- **WebGL + Canvas 2D** - Dual rendering system for optimal performance

**System Design:**

1. **Background Service Worker** (`background.js`) - Monitors YouTube navigation and triggers pose detection initialization on new videos

2. **Content Script** (`content.js`) - Main orchestrator that:
   - Initializes TensorFlow.js detector with MoveNet model
   - Creates dual canvas system (2D + WebGL) overlaid on video player
   - Manages animation loop via requestAnimationFrame
   - Handles UI controls and user interactions
   - Persists settings via Chrome Storage API

3. **Animation Engine** (`anim.js`) - 2300+ lines implementing:
   - 38 individual animation methods
   - Canvas 2D drawing for skeletons and heads
   - Proton particle system integration
   - Keypoint transformation and rendering

4. **Game Mode System** (`gameMode.js`, `motionDetector.js`) - State machine with:
   - 5 motion detection algorithms
   - Frame sampling and cooldown logic
   - False-positive prevention
   - Ghost character rendering and scoring

5. **Filter System** (`filterEnum.js`) - CSS filter combinations with canvas overlays for cinematic effects

6. **Theme System** (CSS modules) - Modular CSS architecture with:
   - CSS custom properties for theming
   - Intensity-based styling variations
   - Particle animation system
   - YouTube DOM targeting

**Integration:**
All components communicate through Chrome's message passing API and CustomEvents. The dual canvas system ensures animations render smoothly without interfering with video playback. Settings persist across sessions using Chrome's synchronized storage.

## Challenges

**1. Real-time Performance**
- Challenge: Running TensorFlow.js pose detection at 30+ FPS while rendering complex particle animations
- Solution: Implemented frame sampling (every 3rd frame for game mode), optimized particle counts, used GPU-accelerated WebGL rendering, and employed requestAnimationFrame for smooth animation loops

**2. YouTube DOM Compatibility**
- Challenge: YouTube's dynamic DOM structure changes frequently and loads content asynchronously
- Solution: Created multiple fallback selectors for player elements, implemented ResizeObserver for layout changes, added initialization delays, and cleanup patterns to handle navigation

**3. Motion Detection Accuracy**
- Challenge: Preventing false positives in game mode while maintaining responsiveness
- Solution: Developed time window analysis (60% threshold across 5 frames), cooldown periods (400-800ms), confidence filtering (>0.3 score), and movement-specific angle/distance thresholds

**4. Filter and Animation Compatibility**
- Challenge: Making CSS filters and canvas animations work simultaneously without visual conflicts
- Solution: Separated concerns - CSS filters apply to video element, animations render on separate canvas layers with proper alpha blending and z-index management

**5. Extension Architecture**
- Challenge: Migrating to Manifest V3 with service workers instead of background pages
- Solution: Restructured message passing, implemented proper cleanup on navigation, used chrome.webNavigation API for URL monitoring

**6. Memory Management**
- Challenge: Preventing memory leaks during extended use and video navigation
- Solution: Implemented comprehensive cleanup functions, destroyed Proton emitters properly, removed event listeners, and unobserved ResizeObservers

## What we learned

**Technical Learnings:**

- **TensorFlow.js in Production**: Learned how to optimize ML models for browser environments, including model selection (MoveNet vs PoseNet), backend configuration (WebGL vs WebGPU), and performance tuning

- **Canvas Performance**: Discovered the importance of dual canvas systems (2D for simple drawings, WebGL for particles), willReadFrequently context hints, and transform-based animations over redrawing

- **Chrome Extension Development**: Mastered Manifest V3 architecture, content script injection timing, storage API patterns, and cross-context communication

- **Particle Physics**: Gained deep understanding of Proton engine's emitter system, behavior chains, and renderer optimization

- **Motion Detection Algorithms**: Learned to calculate angles between keypoints, implement state machines for movement tracking, and balance sensitivity vs accuracy

**Organizational Learnings:**

- **Modular Architecture**: Breaking the system into clear modules (AnimEnum, FilterEnum, GameMode) made the codebase maintainable despite 2300+ lines in the animation engine

- **Iterative Development**: Started with basic skeleton animations, then added particles, filters, game mode, and UI theme - each iteration built on solid foundations

- **Documentation**: Comprehensive code comments and developer documentation proved essential for maintaining complex animation logic

- **User Experience**: Learned the importance of visual feedback (active button states, score displays, particle effects) for intuitive interfaces

## What's next

**Short-term Improvements:**

- **Animation Intensity Controls** - Slider to adjust particle density and effect strength
- **Sound Effects** - Audio feedback for game mode and animation triggers
- **Custom Pumpkin Designer** - Let users create their own jack-o'-lantern faces
- **Performance Dashboard** - Show FPS, detection latency, and resource usage

**Medium-term Features:**

- **Animation Recording** - Export animations as video files or GIFs
- **More Game Modes** - Dance challenges, yoga pose detection, sports move tracking
- **Filter Customization** - User-adjustable CSS filter parameters
- **Accessibility Options** - Reduced motion mode, high contrast themes

**Long-term Vision:**

- **Seasonal Editions** - Christmas (winter animations), Easter (spring), Summer (beach themes)
- **Multiplayer Mode** - Synchronized animations across multiple viewers
- **AI-Generated Animations** - Use generative AI to create custom effects
- **Mobile Support** - Port to mobile browsers with touch controls
- **Chrome Web Store Release** - Public distribution with user reviews and ratings

**Technical Debt:**

- Refactor animation engine into smaller, testable modules
- Implement comprehensive unit tests for motion detection
- Add TypeScript for better type safety
- Optimize bundle size (currently 1.3 MB for content.js)
- Implement lazy loading for animation modules

## Demo

<---->

## Links & Resources

- [GitHub Repository](https://github.com/deep2universe/YouTube-Motion-Tracking)
- [Demo Video](<---->)
- [Installation Guide](https://github.com/deep2universe/YouTube-Motion-Tracking#-installation)
- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Proton Particle Engine](https://github.com/drawcall/Proton)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)

## Technical Specifications

**Performance Metrics:**
- 30+ FPS with all animations active
- <5ms additional latency per frame in Game Mode
- Animation switching: <500ms
- Memory usage: Stable during extended use
- Bundle size: 1.3 MB (includes TensorFlow + Proton)

**Browser Requirements:**
- Google Chrome (latest stable)
- Chromium-based browsers (Edge, Brave, Opera)
- WebGL support required
- Hardware acceleration recommended

**AI Model:**
- MoveNet Thunder (17 keypoints)
- Input resolution: 256x256
- Detection confidence threshold: >0.3
- Frame rate: 30 FPS

## Team

<---->

## Built With

- TensorFlow.js
- Proton Engine
- JavaScript (ES6+)
- WebGL
- Canvas 2D
- Chrome Extension APIs
- Parcel
- CSS3 (Custom Properties, Animations, Filters)

## Try It Out

Since this extension is not yet published on the Chrome Web Store, you can install it locally by following our [installation guide](https://github.com/deep2universe/YouTube-Motion-Tracking#-installation).

---

**Made with 💀 and TensorFlow.js for Halloween 2024**
