# Changelog

All notable changes to the YouTube Motion Tracking extension will be documented in this file.

## [2.2.0] - Motion Game Mode - 2024-11-16

### 🎮 NEW: Interactive Motion Game Mode

Added a completely new interactive gaming experience that turns YouTube videos into playable content by detecting movements in the video.

### Added

#### Game Mode System
- **👻 Ghost Jump Challenge** - Interactive game where a ghost character jumps based on detected movements in YouTube videos
- **5 Detectable Movements**:
  - 💪 Arm Curl - Bicep curls (angle < 45°)
  - 🔄 Head Turn - Head rotation detection
  - 🙋 Arm Raise - Arms raised above head
  - 🦵 Squat - Complete squat repetitions
  - 🤸 Jumping Jack - Arms and legs spread simultaneously
- **Motion Selection Panel** - Choose which movement to track before starting
- **Game HUD** - Real-time display of score, jumps (X/10), and high score
- **Progress Markers** - 10 visual markers showing jump progress
- **Point System** - 10 detected movements = 1 point

#### Visual Effects
- **Particle Burst Effects** - Proton-based white/blue ghostly particles on each jump
- **Jump Feedback** - "NICE!" text indicator on successful detection
- **Point Reward Animation** - Floating "+1" text when earning points
- **High Score Celebration** - Special effect for new high scores
- **Ghost Animation** - Smooth easing animations with idle bounce effect

#### Technical Features
- **Smart Detection System**:
  - Frame sampling (every 3rd frame) for performance
  - Cooldown periods (400-800ms) to prevent false positives
  - Time window analysis (60% threshold across 5 frames)
  - Confidence filtering (>0.3 score required)
- **State Persistence** - High scores and game stats saved via Chrome Storage
- **Performance Optimized** - <5ms additional latency per frame
- **Error Handling** - Graceful handling of missing keypoints and detection failures
- **Canvas Resize Support** - Game elements reposition correctly on player resize

#### New Files
- `src/gameMode.js` - Main game state machine and orchestration
- `src/motionDetector.js` - Motion detection engine with 5 movement algorithms
- `src/ghostCharacter.js` - Ghost rendering and animation
- `src/jumpMarkers.js` - Progress markers rendering
- `src/gameModeEnum.js` - Game mode definitions
- `src/motionEnum.js` - Movement type definitions
- `src/gameConfig.js` - Configuration constants

### Changed
- **package.json** - Fixed build script to only include entry point files
- **src/content.js** - Integrated game mode into detection loop with toggle support
- **src/content.css** - Added complete game mode styling (motion panel, HUD, animations)

### Technical Details
- Game mode works with video content detection (not webcam)
- Seamless integration with existing animation system
- No conflicts with filters, themes, or random mode
- Animations pause when game mode is active
- Total bundle size: content.js 1.3 MB (includes TensorFlow + Proton + Game Mode)

## [2.1.0] - Halloween Skeleton Effects - 2024-11-15

### 🔥 New Halloween Skeleton Effects Category

Added 13 stunning new skeleton-themed animations with advanced particle effects, bringing the total animation count from 25 to 38.

### Added

#### Particle-Based Skeleton Effects (10 new animations)
- **🔥 Skeleton Flames** - Flickering fire particles rising from all joints with yellow→orange→red gradient
- **❄️ Skeleton Frost** - Falling snow particles with ice crystal effects and light blue colors
- **⚡ Skeleton Lightning** - High-intensity electric particles with white/cyan colors and very short life
- **👻 Skeleton Spectral** - Ghostly white particles with random drift and phasing effect
- **☢️ Skeleton Toxic** - Radioactive green bubbles rising with pulsing glow
- **🌋 Skeleton Inferno** - Intense hellfire with dark red→orange→yellow embers and turbulence
- **🩸 Skeleton Blood** - Dripping blood droplets with gravity and dark red colors
- **⛓️ Skeleton Chains** - Metallic gray/silver sparkles with shimmer effect
- **💎 Skeleton Shatter** - Exploding glass fragments with rotation and light blue/white colors
- **🪡 Skeleton Voodoo** - Mystical purple/red symbols orbiting joints with glow effect

#### Canvas-Based Skeleton Effects (3 new animations)
- **🌑 Skeleton Shadow** - Multiple shadow copies orbiting main skeleton with decreasing alpha
- **🦴 Skeleton Bones** - Anatomically detailed bones with texture, marrow core, and joint sockets
- **🧟 Skeleton Mummy** - Bandage-wrapped skeleton with hieroglyphics and unwrapping trails

### Technical Improvements
- Optimized particle counts for 30+ FPS performance
- Added 13 new particle emitter configurations
- Implemented helper methods for bone drawing, bandage wrapping, and shadow effects
- Extended updateParticles switch with new skeleton effect cases
- Total animation count: 38 (up from 25)

### UI Updates
- Added new "🔥 Skeleton Effects" category in animation panel
- Category appears before Horror Filters section
- All animations use themed emoji icons for easy identification

## [2.0.0] - Halloween Edition - 2024-11-13

### 🎃 Major Halloween Transformation

This release completely transforms the extension into a Halloween-themed special edition with 18 curated spooky animations.

### Added

#### Skeleton Animations (5 new canvas-based animations)
- **Glowing Skeleton** - Pulsating orange/green bones with glow effects
- **Dancing Skeleton** - Animated shaking skeleton with jitter effects
- **X-Ray Vision** - Medical-style green phosphorescent skeleton
- **Zombie Skeleton** - Decaying purple/green skeleton with dripping effects
- **Neon Skeleton** - Bright electric purple/orange glowing skeleton

#### Pumpkin & Head Effects (3 new canvas-based animations)
- **Classic Pumpkin Head** - Traditional jack-o'-lantern with glowing yellow eyes
- **Evil Pumpkin Head** - Sinister pumpkin with red glowing eyes and flickering candle
- **Skull Head** - Floating bone-white skull with animated jaw movement

#### Creature Particle Effects (4 new Proton-based animations)
- **Bat Swarm** - Black bats with purple glow flying from hands
- **Ghost Trail** - Translucent white/blue ghosts following body movements
- **Spider Web** - Gray spiders crawling with web trails from wrists
- **Floating Skulls** - Bone-white skulls orbiting around the body

#### Magical Particle Effects (3 new Proton-based animations)
- **Witch Magic** - Purple/green magic spirals from hands
- **Spell Casting** - Explosive orange/red fire-like bursts from wrists
- **Dark Energy** - Black/purple smoke vortex from body points

#### Atmospheric Particle Effects (3 new Proton-based animations)
- **Creeping Fog** - Low-lying gray mist across bottom of screen
- **Haunted Lightning** - White/cyan electric arcs from keypoints
- **Autumn Leaves** - Falling orange/brown leaves with tumbling motion

#### UI/UX Enhancements
- Complete Halloween theme with dark background (#141414)
- Orange (#FF6600) and purple (#8B00FF) accent colors
- Glowing effects on buttons and selected animations
- Halloween-themed emoji icons for all 18 animations
- Updated scrollbar with orange theme
- Enhanced hover effects with glow and scale animations
- Gold text (#FFD700) for better readability

### Changed
- **Extension name**: "YouTube Motion Tracking" → "YouTube Motion Tracking - Halloween Edition"
- **Version**: 1.4 → 2.0.0 (major version bump)
- **Default animation**: "skeleton" → "skeletonGlow"
- **Animation count**: 50 animations → 18 curated Halloween animations
- **Description**: Updated to highlight Halloween-themed features
- **Color scheme**: Neutral grays → Halloween orange, purple, black, and green
- **Icon theme**: Animal emojis → Halloween emojis (skulls, pumpkins, bats, ghosts, etc.)

### Removed
- All 50 original non-Halloween animations
- Generic animal-themed emoji icons
- Neutral color schemes
- Non-Halloween particle effects (snow, bubbles, rainbows, etc.)
- Non-Halloween canvas animations (puppets, geometric shapes, etc.)

### Technical Details
- Refactored `AnimEnum` class to contain only 18 Halloween animations
- Completely rewrote `anim.js` with Halloween-specific animation methods
- Updated `content.js` to use Halloween defaults
- Redesigned `content.css` with Halloween color palette
- Updated `manifest.json` with Halloween branding
- Maintained all existing performance optimizations
- Preserved TensorFlow.js MoveNet pose detection
- Kept Proton particle engine for physics-based effects
- Maintained dual canvas system (2D + WebGL)

### Performance
- Maintains 30+ FPS with all Halloween animations
- Animation switching completes within 500ms
- Memory usage remains stable during extended use
- WebGL renderer with Canvas fallback for compatibility

### Browser Compatibility
- Google Chrome (latest stable version)
- Chromium-based browsers (Edge, Brave, Opera)
- Requires WebGL support for particle effects
- Requires hardware acceleration for optimal performance

---

## [1.4] - Original Edition - 2024-XX-XX

### Features
- 50+ motion tracking animations
- Skeleton visualizations with multiple variants
- Particle effects using Proton engine
- Canvas-based drawing animations
- Real-time pose detection with TensorFlow.js MoveNet
- In-player animation selector
- Random animation mode
- Animation state persistence

### Technical Stack
- TensorFlow.js 4.22.0 with MoveNet model
- Proton particle engine 5.4.3
- Chrome Extension Manifest V3
- Parcel 2.16.0 build system
- Dual canvas rendering (2D + WebGL)

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- **Major version** (2.x.x): Significant changes, Halloween transformation
- **Minor version** (x.1.x): New features, animations
- **Patch version** (x.x.1): Bug fixes, performance improvements

---

## Future Plans

### Potential Future Editions
- Christmas Edition (winter-themed animations)
- Easter Edition (spring-themed animations)
- Summer Edition (beach and sun-themed animations)
- User-customizable themes

### Planned Enhancements
- Animation intensity controls
- Sound effects for Halloween animations
- Custom pumpkin face designs
- Animation recording/export feature
- Multiplayer/collaborative animations

---

**Note**: The Halloween Edition (v2.0.0) is a complete replacement of the original edition. To use the original 50 animations, please install version 1.4 or earlier.
