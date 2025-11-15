# Implementation Tasks: Halloween Skeleton Animations

## Overview
Detailed task breakdown for implementing 13 new Halloween skeleton animations using Canvas 2D + Proton particle system.

**Total Animations**: 13 (10 particle-based, 3 canvas-only)  
**Particle IDs**: 17-26  
**Estimated Time**: 10.5 hours

---

## Phase 1: Preparation ⏱️ 30 minutes

### Task 1.1: Update AnimEnum.js
- [ ] Add 13 new static animation definitions
  - [ ] skeletonFlames (🔥, ID: 17)
  - [ ] skeletonFrost (❄️, ID: 18)
  - [ ] skeletonLightning (⚡, ID: 19)
  - [ ] skeletonSpectral (👻, ID: 20)
  - [ ] skeletonToxic (☢️, ID: 21)
  - [ ] skeletonInferno (🌋, ID: 22)
  - [ ] skeletonBlood (🩸, ID: 23)
  - [ ] skeletonChains (⛓️, ID: 24)
  - [ ] skeletonShatter (💎, ID: 25)
  - [ ] skeletonVoodoo (🪡, ID: 26)
  - [ ] skeletonShadow (🌑, ID: null)
  - [ ] skeletonBones (🦴, ID: null)
  - [ ] skeletonMummy (🧟, ID: null)
- [ ] Update `getNameArray()` method (add 13 names)
- [ ] Update `getAllAnimations()` method (add 13 objects)
- [ ] Update documentation comments (25 → 38 animations)
- [ ] Add category comment: "HALLOWEEN SKELETON EFFECTS"
- [ ] Test: Verify AnimEnum exports correctly

### Task 1.2: Plan Code Organization
- [ ] Review existing anim.js structure
- [ ] Identify insertion points for new code
- [ ] Plan helper method section location
- [ ] Plan particle initialization method section

---

## Phase 2: Helper Methods ⏱️ 1 hour

### Task 2.1: Skeleton Drawing Helpers

#### drawSkeletonWithGradient()
- [ ] Create method signature: `drawSkeletonWithGradient(keypoints, colorStops, lineWidth)`
- [ ] Implement gradient creation from color stops
- [ ] Apply gradient to skeleton lines
- [ ] Test with sample colors

#### drawSkeletonWithGlow()
- [ ] Create method signature: `drawSkeletonWithGlow(keypoints, color, glowSize)`
- [ ] Set shadowBlur and shadowColor
- [ ] Draw skeleton with glow effect
- [ ] Reset shadow properties after drawing
- [ ] Test glow visibility

#### drawSkeletonWithShadow()
- [ ] Create method signature: `drawSkeletonWithShadow(keypoints, shadowOffsets)`
- [ ] Loop through shadow offsets
- [ ] Draw skeleton at each offset with decreasing alpha
- [ ] Test shadow effect

### Task 2.2: Shape Drawing Helpers

#### drawBone()
- [ ] Create method signature: `drawBone(x1, y1, x2, y2, width)`
- [ ] Calculate angle and length
- [ ] Draw bone shape (wider at ends, narrow in middle)
- [ ] Add gradient shading
- [ ] Add texture lines
- [ ] Add marrow core
- [ ] Test bone appearance

#### drawChainLink()
- [ ] Create method signature: `drawChainLink(x1, y1, x2, y2)`
- [ ] Calculate link count based on distance
- [ ] Draw oval links alternating orientation
- [ ] Add metallic shading
- [ ] Test chain appearance

#### drawBandage()
- [ ] Create method signature: `drawBandage(x1, y1, x2, y2, wrapCount)`
- [ ] Calculate wrap positions
- [ ] Draw bandage strips with offset
- [ ] Add hieroglyphic symbols randomly
- [ ] Test bandage wrapping

#### drawFractureLine()
- [ ] Create method signature: `drawFractureLine(x1, y1, x2, y2, segments)`
- [ ] Create jagged path with random offsets
- [ ] Draw fractured line
- [ ] Test fracture appearance

#### drawDrip()
- [ ] Create method signature: `drawDrip(x, y, length, thickness)`
- [ ] Create bezier curve for drip shape
- [ ] Add droplet at end
- [ ] Test drip appearance

### Task 2.3: Effect Helpers

#### drawLightningArc()
- [ ] Create method signature: `drawLightningArc(x1, y1, x2, y2, jitter)`
- [ ] Create jagged path with random offsets
- [ ] Add branching logic (optional)
- [ ] Draw arc with glow
- [ ] Test lightning appearance

#### drawCrystalSpikes()
- [ ] Create method signature: `drawCrystalSpikes(x, y, count, length)`
- [ ] Calculate spike angles
- [ ] Draw triangular spikes
- [ ] Add gradient shading
- [ ] Test crystal appearance

#### drawVoodooPin()
- [ ] Create method signature: `drawVoodooPin(x, y, angle, length)`
- [ ] Draw pin shaft
- [ ] Draw pin head (circle)
- [ ] Add shadow for depth
- [ ] Test pin appearance

#### drawHieroglyphic()
- [ ] Create method signature: `drawHieroglyphic(x, y, size)`
- [ ] Create simple hieroglyphic shapes (rectangles, lines)
- [ ] Randomize symbol selection
- [ ] Test symbol appearance

---

## Phase 3: Canvas-Only Animations ⏱️ 1.5 hours

### Task 3.1: Skeleton Shadow 🌑

#### Implementation
- [ ] Add case in `setNewAnimation()`: `this.currentAnimation = 'skeletonShadow'`
- [ ] Add drawing logic in `updateKeypoint()`
- [ ] Define shadow count (5)
- [ ] Calculate shadow offsets (circular orbit)
- [ ] Draw shadow copies with decreasing alpha
- [ ] Draw main skeleton in white
- [ ] Animate shadow rotation using time

#### Testing
- [ ] Test shadow visibility
- [ ] Test rotation animation
- [ ] Test alpha blending
- [ ] Verify performance (45+ FPS)

### Task 3.2: Skeleton Bones 🦴

#### Implementation
- [ ] Add case in `setNewAnimation()`: `this.currentAnimation = 'skeletonBones'`
- [ ] Add drawing logic in `updateKeypoint()`
- [ ] Loop through adjacent keypoint pairs
- [ ] Draw bone shape for each pair using `drawBone()`
- [ ] Draw joint sockets at keypoints
- [ ] Add bone texture details

#### Testing
- [ ] Test bone shape appearance
- [ ] Test joint sockets
- [ ] Test texture details
- [ ] Verify anatomical accuracy
- [ ] Verify performance (45+ FPS)

### Task 3.3: Skeleton Mummy 🧟

#### Implementation
- [ ] Add case in `setNewAnimation()`: `this.currentAnimation = 'skeletonMummy'`
- [ ] Add drawing logic in `updateKeypoint()`
- [ ] Loop through adjacent keypoint pairs
- [ ] Draw bandage wrapping using `drawBandage()`
- [ ] Add hieroglyphic symbols randomly
- [ ] Draw unwrapping trails from keypoints
- [ ] Animate trail movement

#### Testing
- [ ] Test bandage wrapping
- [ ] Test hieroglyphic symbols
- [ ] Test unwrapping animation
- [ ] Verify colors (beige/tan)
- [ ] Verify performance (45+ FPS)

---

## Phase 4: Particle Animations - Simple ⏱️ 2 hours

### Task 4.1: Skeleton Flames 🔥 (ID: 17)

#### Canvas Component
- [ ] Add case in `setNewAnimation()`: `this.currentAnimation = 'particle'; this.particleID = 17;`
- [ ] Add drawing logic in `updateKeypoint()`
- [ ] Draw skeleton with orange/red gradient
- [ ] Add glow effect (shadowBlur)

#### Particle Component
- [ ] Create `cParticleSkeletonFlames()` method
- [ ] Initialize Proton emitter
- [ ] Configure emitter: Point at each keypoint
- [ ] Set particle rate: 5-10 per frame
- [ ] Set particle life: 0.5-1.0 seconds
- [ ] Add behaviors:
  - [ ] Gravity (negative Y for upward)
  - [ ] Color gradient (yellow → orange → red)
  - [ ] Alpha fade (1.0 → 0.0)
  - [ ] Scale shrink (1.0 → 0.5)
- [ ] Set particle count: 200

#### Testing
- [ ] Test fire particle appearance
- [ ] Test upward movement
- [ ] Test color gradient
- [ ] Verify performance (30+ FPS)

### Task 4.2: Skeleton Frost ❄️ (ID: 18)

#### Canvas Component
- [ ] Add case in `setNewAnimation()`
- [ ] Draw skeleton with light blue/white gradient
- [ ] Add crystal spikes at joints using `drawCrystalSpikes()`

#### Particle Component
- [ ] Create `cParticleSkeletonFrost()` method
- [ ] Initialize Proton emitter
- [ ] Configure emitter: Circle around skeleton
- [ ] Set particle rate: 3-5 per frame
- [ ] Set particle life: 2-3 seconds
- [ ] Add behaviors:
  - [ ] Slow gravity (downward)
  - [ ] Random drift (X axis)
  - [ ] Alpha fade (0.7 → 0.0)
  - [ ] Scale grow (0.5 → 1.0)
- [ ] Set particle count: 150
- [ ] Set particle color: White/light blue

#### Testing
- [ ] Test snow particle appearance
- [ ] Test falling animation
- [ ] Test crystal spikes
- [ ] Verify performance (30+ FPS)

### Task 4.3: Skeleton Toxic ☢️ (ID: 21)

#### Canvas Component
- [ ] Add case in `setNewAnimation()`
- [ ] Draw skeleton with bright green color
- [ ] Add pulsing glow effect (animate shadowBlur)

#### Particle Component
- [ ] Create `cParticleSkeletonToxic()` method
- [ ] Initialize Proton emitter
- [ ] Configure emitter: Point at keypoints
- [ ] Set particle rate: 4-6 per frame
- [ ] Set particle life: 1.5-2.5 seconds
- [ ] Add behaviors:
  - [ ] Upward movement (bubbles rising)
  - [ ] Random drift (X axis)
  - [ ] Scale grow (0.5 → 1.5)
  - [ ] Alpha fade (0.9 → 0.0)
- [ ] Set particle count: 200
- [ ] Set particle color: Bright green (#00FF00)

#### Testing
- [ ] Test bubble appearance
- [ ] Test rising animation
- [ ] Test pulsing glow
- [ ] Verify performance (30+ FPS)

### Task 4.4: Skeleton Spectral 👻 (ID: 20)

#### Canvas Component
- [ ] Add case in `setNewAnimation()`
- [ ] Draw skeleton with semi-transparent white
- [ ] Add alpha pulsing animation (sin wave)

#### Particle Component
- [ ] Create `cParticleSkeletonSpectral()` method
- [ ] Initialize Proton emitter
- [ ] Configure emitter: Circle around skeleton
- [ ] Set particle rate: 2-4 per frame
- [ ] Set particle life: 3-4 seconds
- [ ] Add behaviors:
  - [ ] Random movement (all directions)
  - [ ] Alpha oscillation (0.3 → 0.8 → 0.3)
  - [ ] Slow drift
- [ ] Set particle count: 100
- [ ] Set particle color: White/pale blue

#### Testing
- [ ] Test ghost particle appearance
- [ ] Test random drift
- [ ] Test alpha pulsing
- [ ] Verify performance (30+ FPS)

---

## Phase 5: Particle Animations - Complex ⏱️ 3 hours

### Task 5.1: Skeleton Lightning ⚡ (ID: 19)

#### Canvas Component
- [ ] Add case in `setNewAnimation()`
- [ ] Draw skeleton with bright white/blue color
- [ ] Draw lightning arcs between nearby keypoints using `drawLightningArc()`
- [ ] Add glow effect

#### Particle Component
- [ ] Create `cParticleSkeletonLightning()` method
- [ ] Initialize Proton emitter
- [ ] Configure emitter: Line between keypoints
- [ ] Set particle rate: 20-30 per frame (high for intensity)
- [ ] Set particle life: 0.1-0.3 seconds (very short)
- [ ] Add behaviors:
  - [ ] High velocity along skeleton
  - [ ] Quick alpha fade (1.0 → 0.0)
  - [ ] No gravity
- [ ] Set particle count: 300
- [ ] Set particle color: White/electric blue

#### Testing
- [ ] Test lightning arc appearance
- [ ] Test particle intensity
- [ ] Test branching effect
- [ ] Verify performance (25+ FPS acceptable)

### Task 5.2: Skeleton Inferno 🌋 (ID: 22)

#### Canvas Component
- [ ] Add case in `setNewAnimation()`
- [ ] Draw skeleton with dark red/orange gradient
- [ ] Add multiple glow layers (different colors)
- [ ] Add heat distortion effect (optional)

#### Particle Component
- [ ] Create `cParticleSkeletonInferno()` method
- [ ] Initialize Proton emitter
- [ ] Configure emitter: Point at keypoints
- [ ] Set particle rate: 8-12 per frame
- [ ] Set particle life: 1.0-2.0 seconds
- [ ] Add behaviors:
  - [ ] Upward movement with turbulence
  - [ ] Color gradient (dark red → orange → yellow)
  - [ ] Alpha fade (1.0 → 0.0)
  - [ ] Scale variation (0.5 → 1.5)
- [ ] Set particle count: 400
- [ ] Add smoke particles (gray, slower)

#### Testing
- [ ] Test ember appearance
- [ ] Test smoke effect
- [ ] Test turbulent movement
- [ ] Verify performance (25+ FPS acceptable)

### Task 5.3: Skeleton Blood 🩸 (ID: 23)

#### Canvas Component
- [ ] Add case in `setNewAnimation()`
- [ ] Draw skeleton with dark red color
- [ ] Draw dripping blood from joints using `drawDrip()`
- [ ] Animate drip length

#### Particle Component
- [ ] Create `cParticleSkeletonBlood()` method
- [ ] Initialize Proton emitter
- [ ] Configure emitter: Point at joints
- [ ] Set particle rate: 3-5 per frame
- [ ] Set particle life: 1.0-2.0 seconds
- [ ] Add behaviors:
  - [ ] Gravity (downward)
  - [ ] Splatter on impact (custom behavior)
  - [ ] Alpha fade (0.9 → 0.0)
- [ ] Set particle count: 150
- [ ] Set particle color: Dark red (#8B0000)

#### Testing
- [ ] Test blood droplet appearance
- [ ] Test dripping animation
- [ ] Test splatter effect
- [ ] Verify performance (30+ FPS)

### Task 5.4: Skeleton Chains ⛓️ (ID: 24)

#### Canvas Component
- [ ] Add case in `setNewAnimation()`
- [ ] Draw chain links between joints using `drawChainLink()`
- [ ] Add rust texture overlay
- [ ] Add metallic shading

#### Particle Component
- [ ] Create `cParticleSkeletonChains()` method
- [ ] Initialize Proton emitter
- [ ] Configure emitter: Point at chain links
- [ ] Set particle rate: 2-3 per frame
- [ ] Set particle life: 0.5-1.0 seconds
- [ ] Add behaviors:
  - [ ] Slow movement
  - [ ] Shimmer effect (alpha oscillation)
  - [ ] No gravity
- [ ] Set particle count: 100
- [ ] Set particle color: Gray/silver

#### Testing
- [ ] Test chain link appearance
- [ ] Test metallic sparkles
- [ ] Test rust texture
- [ ] Verify performance (30+ FPS)

### Task 5.5: Skeleton Shatter 💎 (ID: 25)

#### Canvas Component
- [ ] Add case in `setNewAnimation()`
- [ ] Draw fractured skeleton using `drawFractureLine()`
- [ ] Add crack patterns
- [ ] Add glass-like gradient

#### Particle Component
- [ ] Create `cParticleSkeletonShatter()` method
- [ ] Initialize Proton emitter
- [ ] Configure emitter: Point at keypoints
- [ ] Set particle rate: 5-8 per frame
- [ ] Set particle life: 1.0-2.0 seconds
- [ ] Add behaviors:
  - [ ] Outward explosion (radial velocity)
  - [ ] Rotation
  - [ ] Gravity (downward)
  - [ ] Alpha fade (1.0 → 0.0)
- [ ] Set particle count: 250
- [ ] Set particle color: Light blue/white

#### Testing
- [ ] Test fracture appearance
- [ ] Test glass fragments
- [ ] Test explosion effect
- [ ] Verify performance (30+ FPS)

### Task 5.6: Skeleton Voodoo 🪡 (ID: 26)

#### Canvas Component
- [ ] Add case in `setNewAnimation()`
- [ ] Draw skeleton with dark purple color
- [ ] Draw pins through joints using `drawVoodooPin()`
- [ ] Draw puppet strings from top
- [ ] Add pin shadows

#### Particle Component
- [ ] Create `cParticleSkeletonVoodoo()` method
- [ ] Initialize Proton emitter
- [ ] Configure emitter: Circle around joints
- [ ] Set particle rate: 2-3 per frame
- [ ] Set particle life: 2-3 seconds
- [ ] Add behaviors:
  - [ ] Orbit around joints (custom behavior)
  - [ ] Glow effect (alpha oscillation)
  - [ ] Slow rotation
- [ ] Set particle count: 80
- [ ] Set particle color: Purple/red
- [ ] Add mystical symbols (runes, circles)

#### Testing
- [ ] Test pin appearance
- [ ] Test puppet strings
- [ ] Test mystical symbols
- [ ] Test orbit behavior
- [ ] Verify performance (30+ FPS)

---

## Phase 6: Integration & Testing ⏱️ 2 hours

### Task 6.1: Switch Case Integration
- [ ] Verify all 13 cases added to `setNewAnimation()`
- [ ] Verify particle IDs are correct (17-26)
- [ ] Verify canvas-only animations have null ID
- [ ] Test switching between all animations
- [ ] Test switching from new to old animations
- [ ] Test switching from old to new animations

### Task 6.2: Performance Testing

#### Individual Animation Tests
- [ ] Test Skeleton Flames FPS
- [ ] Test Skeleton Frost FPS
- [ ] Test Skeleton Lightning FPS
- [ ] Test Skeleton Spectral FPS
- [ ] Test Skeleton Toxic FPS
- [ ] Test Skeleton Inferno FPS
- [ ] Test Skeleton Blood FPS
- [ ] Test Skeleton Chains FPS
- [ ] Test Skeleton Shatter FPS
- [ ] Test Skeleton Voodoo FPS
- [ ] Test Skeleton Shadow FPS
- [ ] Test Skeleton Bones FPS
- [ ] Test Skeleton Mummy FPS

#### Performance Optimization
- [ ] Identify animations below 30 FPS
- [ ] Reduce particle counts if needed
- [ ] Optimize drawing operations
- [ ] Profile hot paths
- [ ] Re-test after optimizations

### Task 6.3: Visual Refinement

#### Color Adjustments
- [ ] Review Flames colors (yellow/orange/red)
- [ ] Review Frost colors (light blue/white)
- [ ] Review Lightning colors (white/blue)
- [ ] Review Spectral colors (white/pale)
- [ ] Review Toxic colors (bright green)
- [ ] Review Inferno colors (dark red/orange)
- [ ] Review Blood colors (dark red)
- [ ] Review Chains colors (gray/silver)
- [ ] Review Shatter colors (light blue/white)
- [ ] Review Voodoo colors (purple/red)
- [ ] Review Shadow colors (black/gray)
- [ ] Review Bones colors (beige/tan)
- [ ] Review Mummy colors (beige/brown)

#### Effect Intensity
- [ ] Adjust glow sizes
- [ ] Adjust particle densities
- [ ] Adjust animation speeds
- [ ] Balance effect visibility
- [ ] Ensure effects don't overwhelm video

### Task 6.4: Cross-Animation Testing

#### Switching Tests
- [ ] Test rapid animation switching (no crashes)
- [ ] Test switching during particle emission
- [ ] Verify particle cleanup (no leaks)
- [ ] Verify canvas cleanup (no artifacts)

#### Video Content Tests
- [ ] Test with standing pose
- [ ] Test with sitting pose
- [ ] Test with moving person
- [ ] Test with multiple people (uses first detected)
- [ ] Test with different video sizes (480p, 720p, 1080p)

#### Edge Cases
- [ ] Test with no person detected
- [ ] Test with partial person (some keypoints missing)
- [ ] Test with low confidence keypoints
- [ ] Test with video pause/play
- [ ] Test with video seek

---

## Phase 7: Documentation ⏱️ 30 minutes

### Task 7.1: Update CHANGELOG.md
- [ ] Add new version entry
- [ ] Add "New Features" section
- [ ] List all 13 new animations with icons
- [ ] Note total animation count (38)
- [ ] Add performance notes
- [ ] Add any known issues

### Task 7.2: Update README.md
- [ ] Update animation count (25 → 38)
- [ ] Add "Halloween Skeleton Effects" category
- [ ] List all 13 new animations
- [ ] Update feature list
- [ ] Update screenshots (if needed)

### Task 7.3: Create Demo Content
- [ ] Take screenshot of Skeleton Flames
- [ ] Take screenshot of Skeleton Frost
- [ ] Take screenshot of Skeleton Lightning
- [ ] Take screenshot of Skeleton Spectral
- [ ] Take screenshot of Skeleton Toxic
- [ ] Take screenshot of Skeleton Inferno
- [ ] Take screenshot of Skeleton Blood
- [ ] Take screenshot of Skeleton Chains
- [ ] Take screenshot of Skeleton Shatter
- [ ] Take screenshot of Skeleton Voodoo
- [ ] Take screenshot of Skeleton Shadow
- [ ] Take screenshot of Skeleton Bones
- [ ] Take screenshot of Skeleton Mummy
- [ ] Create animated GIF showcasing effects
- [ ] Update assets folder

---

## Final Checklist

### Code Quality
- [ ] All methods have JSDoc comments
- [ ] Code follows existing style conventions
- [ ] No console errors or warnings
- [ ] No ESLint errors
- [ ] Code is DRY (helper methods used)
- [ ] Magic numbers replaced with constants

### Functionality
- [ ] All 13 animations work correctly
- [ ] Animations appear in popup UI
- [ ] Icons display correctly
- [ ] Animation state persists
- [ ] No regressions in existing animations

### Performance
- [ ] All animations meet FPS targets
- [ ] No memory leaks
- [ ] CPU usage is reasonable
- [ ] Works on lower-end hardware

### Documentation
- [ ] CHANGELOG.md updated
- [ ] README.md updated
- [ ] Code comments added
- [ ] Demo content created

### Testing
- [ ] Functional tests passed
- [ ] Visual tests passed
- [ ] Performance tests passed
- [ ] Compatibility tests passed
- [ ] Edge case tests passed

---

## Notes

### Particle ID Assignments
- 17: Skeleton Flames
- 18: Skeleton Frost
- 19: Skeleton Lightning
- 20: Skeleton Spectral
- 21: Skeleton Toxic
- 22: Skeleton Inferno
- 23: Skeleton Blood
- 24: Skeleton Chains
- 25: Skeleton Shatter
- 26: Skeleton Voodoo

### Canvas-Only Animations
- Skeleton Shadow (null)
- Skeleton Bones (null)
- Skeleton Mummy (null)

### Implementation Order Rationale
1. Canvas-only first (simplest, no particles)
2. Simple particles next (basic behaviors)
3. Complex particles last (custom behaviors)

This order allows for incremental testing and learning.

---

**Status**: Ready for Implementation  
**Last Updated**: 2025-11-15  
**Estimated Completion**: 10.5 hours
