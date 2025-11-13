# Changelog

All notable changes to the YouTube Motion Tracking extension will be documented in this file.

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
