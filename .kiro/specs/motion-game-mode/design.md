# Design Document - Motion Game Mode

## Overview

The Motion Game Mode extends the existing YouTube Motion Tracking extension by adding an interactive gaming layer that analyzes movements detected in YouTube video content. The system uses the existing MoveNet pose detection pipeline to identify specific body movements performed by people in the video and translates these into game mechanics where a ghost character jumps upward, earning points for the viewer.

This design integrates seamlessly with the existing architecture by:
- Reusing the existing pose detection loop and canvas infrastructure
- Adding new enum classes (GameModeEnum, MotionEnum) following the AnimEnum pattern
- Introducing a motion detection layer that analyzes keypoint data
- Creating game-specific UI components that overlay the video player

## Architecture

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     content.js (Main)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Existing Detection Loop (RAF)                   │ │
│  │  - MoveNet Pose Detection on Video Frames              │ │
│  │  - Keypoint Data Extraction                            │ │
│  └──────────────┬──────────────────────────────────────────┘ │
│                 │                                             │
│                 ├──────────────┬──────────────────────────────┤
│                 │              │                              │
│         ┌───────▼──────┐  ┌───▼──────────────┐              │
│         │ Anim System  │  │  GameMode System │              │
│         │ (existing)   │  │     (NEW)        │              │
│         └──────────────┘  └───┬──────────────┘              │
│                               │                              │
└───────────────────────────────┼──────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
        ┌───────▼────────┐            ┌────────▼─────────┐
        │ MotionDetector │            │  GameMode Class  │
        │                │            │  State Machine   │
        │ - Arm Curl     │            │                  │
        │ - Head Turn    │            │ - INACTIVE       │
        │ - Arm Raise    │            │ - SELECTING      │
        │ - Squat        │            │ - PLAYING        │
        │ - Jumping Jack │            │ - PAUSED         │
        └────────────────┘            └──────┬───────────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        │                     │                     │
                ┌───────▼────────┐   ┌────────▼────────┐  ┌────────▼────────┐
                │ GhostCharacter │   │  JumpMarkers    │  │   GameHUD       │
                │   Rendering    │   │   Rendering     │  │   Display       │
                └────────────────┘   └─────────────────┘  └─────────────────┘
```

### File Structure

```
src/
├── content.js              # Modified: Add game mode integration
├── anim.js                 # Unchanged: Existing animation system
├── animEnum.js             # Unchanged: Existing animation definitions
├── gameModeEnum.js         # NEW: Game mode definitions
├── motionEnum.js           # NEW: Movement type definitions
├── motionDetector.js       # NEW: Movement detection logic
├── gameMode.js             # NEW: Game state machine and orchestration
├── ghostCharacter.js       # NEW: Ghost rendering and animation
├── jumpMarkers.js          # NEW: Progress markers rendering
├── gameHUD.js              # NEW: HUD display component
├── gameConfig.js           # NEW: Configuration constants
├── popup.js                # Modified: Add game mode toggle
├── popup.html              # Modified: Add game mode UI
└── content.css             # Modified: Add game mode styles
```

## Components and Interfaces

### 1. GameModeEnum (gameModeEnum.js)

Defines available game modes following the AnimEnum pattern.

```javascript
class GameModeEnum {
    static ghostJump = new GameModeEnum('ghostJump', '👻🎮', 'Ghost Jump');
    
    constructor(id, icon, displayName) {
        this.id = id;
        this.icon = icon;
        this.displayName = displayName;
    }
    
    static getAllGameModes() {
        return [GameModeEnum.ghostJump];
    }
}
```

### 2. MotionEnum (motionEnum.js)

Defines the five detectable movements with metadata.

```javascript
class MotionEnum {
    static armCurl = new MotionEnum('armCurl', '💪', 'Arm Curl', 
        'Winkel den Arm wie beim Hantel-Heben an');
    static headTurn = new MotionEnum('headTurn', '🔄', 'Head Turn',
        'Drehe deinen Kopf nach links und rechts');
    static armRaise = new MotionEnum('armRaise', '🙋', 'Arm Raise',
        'Hebe deinen Arm über den Kopf');
    static squat = new MotionEnum('squat', '🦵', 'Squat',
        'Gehe in die Knie wie bei einer Kniebeuge');
    static jumpingJack = new MotionEnum('jumpingJack', '🤸', 'Jumping Jack',
        'Springe mit Armen und Beinen auseinander');
    
    constructor(id, icon, displayName, description) {
        this.id = id;
        this.icon = icon;
        this.displayName = displayName;
        this.description = description;
    }
    
    static getAllMotions() {
        return [
            MotionEnum.armCurl,
            MotionEnum.headTurn,
            MotionEnum.armRaise,
            MotionEnum.squat,
            MotionEnum.jumpingJack
        ];
    }
}
```



### 3. MotionDetector (motionDetector.js)

Core detection engine that analyzes keypoint data to recognize movements.

```javascript
class MotionDetector {
    constructor(config) {
        this.config = config;
        this.cooldownManagers = {};
        this.timeWindowAnalyzers = {};
        this.squatState = 'STANDING';
        this.frameCounter = 0;
        
        // Initialize cooldown and time window for each motion
        MotionEnum.getAllMotions().forEach(motion => {
            this.cooldownManagers[motion.id] = new CooldownManager(
                config.cooldownPeriods[motion.id]
            );
            this.timeWindowAnalyzers[motion.id] = new TimeWindowAnalyzer(
                config.timeWindowSize
            );
        });
    }
    
    // Main detection method called from content.js
    detect(motionType, keypoints) {
        // Frame sampling optimization
        this.frameCounter++;
        if (this.frameCounter % this.config.detectionSampleRate !== 0) {
            return false;
        }
        
        // Check cooldown
        if (!this.cooldownManagers[motionType].canDetect()) {
            return false;
        }
        
        // Validate keypoints
        if (!this.validateKeypoints(keypoints, motionType)) {
            return false;
        }
        
        // Detect specific movement
        let detected = false;
        switch(motionType) {
            case 'armCurl':
                detected = this.detectArmCurl(keypoints);
                break;
            case 'headTurn':
                detected = this.detectHeadTurn(keypoints);
                break;
            case 'armRaise':
                detected = this.detectArmRaise(keypoints);
                break;
            case 'squat':
                detected = this.detectSquat(keypoints);
                break;
            case 'jumpingJack':
                detected = this.detectJumpingJack(keypoints);
                break;
        }
        
        // Time window validation
        this.timeWindowAnalyzers[motionType].addFrame(detected);
        return this.timeWindowAnalyzers[motionType].isMovementConfirmed();
    }
    
    detectArmCurl(keypoints) {
        // Check both arms
        const leftArm = this.calculateArmAngle(
            keypoints[5], keypoints[7], keypoints[9]  // left shoulder, elbow, wrist
        );
        const rightArm = this.calculateArmAngle(
            keypoints[6], keypoints[8], keypoints[10] // right shoulder, elbow, wrist
        );
        
        return leftArm < this.config.armCurlAngleThreshold || 
               rightArm < this.config.armCurlAngleThreshold;
    }
    
    detectHeadTurn(keypoints) {
        const nose = keypoints[0];
        const leftEar = keypoints[3];
        const rightEar = keypoints[4];
        
        const earMidpoint = (leftEar.x + rightEar.x) / 2;
        const delta = Math.abs(nose.x - earMidpoint);
        
        return delta > this.config.headTurnDistanceThreshold;
    }
    
    detectArmRaise(keypoints) {
        // Check both arms
        const leftRaised = keypoints[9].y < (keypoints[5].y + this.config.armRaiseHeightThreshold);
        const rightRaised = keypoints[10].y < (keypoints[6].y + this.config.armRaiseHeightThreshold);
        
        return leftRaised || rightRaised;
    }
    
    detectSquat(keypoints) {
        // Use average of both legs
        const leftLegAngle = this.calculateLegAngle(
            keypoints[11], keypoints[13], keypoints[15] // left hip, knee, ankle
        );
        const rightLegAngle = this.calculateLegAngle(
            keypoints[12], keypoints[14], keypoints[16] // right hip, knee, ankle
        );
        
        const avgAngle = (leftLegAngle + rightLegAngle) / 2;
        const isSquatting = avgAngle < this.config.squatAngleThreshold;
        
        // State machine: only count transition from SQUATTING to STANDING
        if (isSquatting && this.squatState === 'STANDING') {
            this.squatState = 'SQUATTING';
            return false;
        } else if (!isSquatting && this.squatState === 'SQUATTING') {
            this.squatState = 'STANDING';
            return true; // Complete rep
        }
        return false;
    }
    
    detectJumpingJack(keypoints) {
        // Arms: both wrists above shoulders
        const leftArmUp = keypoints[9].y < keypoints[5].y;
        const rightArmUp = keypoints[10].y < keypoints[6].y;
        
        // Legs: ankles wider than hips
        const hipWidth = Math.abs(keypoints[11].x - keypoints[12].x);
        const ankleWidth = Math.abs(keypoints[15].x - keypoints[16].x);
        const legsSpread = ankleWidth > (hipWidth * this.config.jumpingJackSpreadThreshold);
        
        return leftArmUp && rightArmUp && legsSpread;
    }
    
    // Helper methods
    calculateArmAngle(shoulder, elbow, wrist) {
        const v1 = { x: shoulder.x - elbow.x, y: shoulder.y - elbow.y };
        const v2 = { x: wrist.x - elbow.x, y: wrist.y - elbow.y };
        return this.angleBetweenVectors(v1, v2);
    }
    
    calculateLegAngle(hip, knee, ankle) {
        const v1 = { x: hip.x - knee.x, y: hip.y - knee.y };
        const v2 = { x: ankle.x - knee.x, y: ankle.y - knee.y };
        return this.angleBetweenVectors(v1, v2);
    }
    
    angleBetweenVectors(v1, v2) {
        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
    }
    
    validateKeypoints(keypoints, motionType) {
        const requiredKeypoints = this.getRequiredKeypoints(motionType);
        return requiredKeypoints.every(idx => 
            keypoints[idx] && keypoints[idx].score > 0.3
        );
    }
    
    getRequiredKeypoints(motionType) {
        const keypointMap = {
            'armCurl': [5, 6, 7, 8, 9, 10],
            'headTurn': [0, 3, 4],
            'armRaise': [5, 6, 9, 10],
            'squat': [11, 12, 13, 14, 15, 16],
            'jumpingJack': [5, 6, 9, 10, 11, 12, 15, 16]
        };
        return keypointMap[motionType] || [];
    }
}
```

### 4. CooldownManager

Prevents rapid-fire detections.

```javascript
class CooldownManager {
    constructor(cooldownPeriod = 500) {
        this.lastDetectionTime = 0;
        this.cooldownPeriod = cooldownPeriod;
    }
    
    canDetect() {
        const now = performance.now();
        if (now - this.lastDetectionTime > this.cooldownPeriod) {
            this.lastDetectionTime = now;
            return true;
        }
        return false;
    }
    
    reset() {
        this.lastDetectionTime = 0;
    }
}
```

### 5. TimeWindowAnalyzer

Validates detections across multiple frames.

```javascript
class TimeWindowAnalyzer {
    constructor(windowSize = 5) {
        this.buffer = [];
        this.windowSize = windowSize;
        this.maxAge = 500; // ms
    }
    
    addFrame(detectionResult) {
        this.buffer.push({
            result: detectionResult,
            timestamp: performance.now()
        });
        
        // Remove old frames
        const now = performance.now();
        this.buffer = this.buffer.filter(
            frame => now - frame.timestamp < this.maxAge
        );
        
        // Limit buffer size
        if (this.buffer.length > this.windowSize) {
            this.buffer.shift();
        }
    }
    
    isMovementConfirmed() {
        if (this.buffer.length < 3) return false;
        
        const positiveCount = this.buffer.filter(f => f.result).length;
        const ratio = positiveCount / this.buffer.length;
        return ratio >= 0.6; // 60% threshold
    }
    
    reset() {
        this.buffer = [];
    }
}
```



### 6. GameMode (gameMode.js)

State machine and game orchestration.

```javascript
class GameMode {
    constructor(canvas, ctx, config) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.config = config;
        
        // State
        this.state = 'INACTIVE'; // INACTIVE, SELECTING, PLAYING, PAUSED
        this.selectedMotion = null;
        this.score = 0;
        this.jumps = 0;
        this.highScore = 0;
        
        // Components
        this.ghost = new GhostCharacter(canvas, ctx, config);
        this.markers = new JumpMarkers(config);
        this.hud = new GameHUD(config);
        this.motionDetector = new MotionDetector(config);
        
        // UI Elements
        this.selectionPanel = null;
        this.hudElement = null;
        
        // Load saved state
        this.loadGameState();
    }
    
    activate() {
        this.state = 'SELECTING';
        this.showMotionSelectionPanel();
    }
    
    deactivate() {
        this.state = 'INACTIVE';
        this.hideAllUI();
        this.saveGameState();
    }
    
    startGame(motionType) {
        this.state = 'PLAYING';
        this.selectedMotion = motionType;
        this.score = 0;
        this.jumps = 0;
        this.ghost.reset();
        
        this.hideMotionSelectionPanel();
        this.showHUD();
        this.updateHUD();
    }
    
    onMovementDetected() {
        if (this.state !== 'PLAYING') return;
        
        this.jumps++;
        this.ghost.jump();
        this.showJumpFeedback();
        
        if (this.jumps >= this.config.jumpsPerPoint) {
            this.score++;
            this.jumps = 0;
            this.ghost.reset();
            this.showPointReward();
            
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.showHighScoreEffect();
            }
        }
        
        this.updateHUD();
        this.saveGameState();
    }
    
    update(keypoints) {
        if (this.state !== 'PLAYING' || !this.selectedMotion) return;
        
        // Detect movement
        const detected = this.motionDetector.detect(this.selectedMotion, keypoints);
        if (detected) {
            this.onMovementDetected();
        }
    }
    
    render() {
        if (this.state !== 'PLAYING') return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render components
        this.markers.draw(this.ctx, this.canvas, this.jumps);
        this.ghost.draw(this.ctx);
    }
    
    // UI Methods
    showMotionSelectionPanel() {
        const videoContainer = document.querySelector('.html5-video-container');
        if (!videoContainer || this.selectionPanel) return;
        
        this.selectionPanel = document.createElement('div');
        this.selectionPanel.id = 'motionSelectionPanel';
        this.selectionPanel.className = 'motion-panel';
        
        let html = '<h3>Choose Your Movement</h3><div class="motion-buttons">';
        
        MotionEnum.getAllMotions().forEach(motion => {
            html += `
                <button class="motion-btn" data-motion="${motion.id}">
                    <span class="motion-icon">${motion.icon}</span>
                    <span class="motion-name">${motion.displayName}</span>
                    <span class="motion-desc">${motion.description}</span>
                </button>
            `;
        });
        
        html += '</div>';
        this.selectionPanel.innerHTML = html;
        
        // Add event listeners
        this.selectionPanel.querySelectorAll('.motion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const motionId = e.currentTarget.dataset.motion;
                this.startGame(motionId);
            });
        });
        
        videoContainer.appendChild(this.selectionPanel);
    }
    
    hideMotionSelectionPanel() {
        if (this.selectionPanel) {
            this.selectionPanel.remove();
            this.selectionPanel = null;
        }
    }
    
    showHUD() {
        const videoContainer = document.querySelector('.html5-video-container');
        if (!videoContainer || this.hudElement) return;
        
        this.hudElement = document.createElement('div');
        this.hudElement.id = 'gameHUD';
        this.hudElement.className = 'game-hud';
        this.hudElement.innerHTML = `
            <div class="hud-motion">
                <span class="hud-motion-icon">${MotionEnum[this.selectedMotion]?.icon || ''}</span>
                <span class="hud-motion-name">${MotionEnum[this.selectedMotion]?.displayName || ''}</span>
            </div>
            <div class="hud-score">
                <span class="hud-label">Score:</span>
                <span class="hud-value" id="scoreValue">0</span>
            </div>
            <div class="hud-jumps">
                <span class="hud-label">Jumps:</span>
                <span class="hud-value" id="jumpsValue">0/10</span>
            </div>
            <div class="hud-highscore">
                <span class="hud-label">Best:</span>
                <span class="hud-value" id="highScoreValue">${this.highScore}</span>
            </div>
            <div class="hud-combo" id="comboIndicator"></div>
        `;
        
        videoContainer.appendChild(this.hudElement);
    }
    
    updateHUD() {
        if (!this.hudElement) return;
        
        const scoreEl = this.hudElement.querySelector('#scoreValue');
        const jumpsEl = this.hudElement.querySelector('#jumpsValue');
        const highScoreEl = this.hudElement.querySelector('#highScoreValue');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (jumpsEl) jumpsEl.textContent = `${this.jumps}/10`;
        if (highScoreEl) highScoreEl.textContent = this.highScore;
    }
    
    hideAllUI() {
        this.hideMotionSelectionPanel();
        if (this.hudElement) {
            this.hudElement.remove();
            this.hudElement = null;
        }
    }
    
    // Feedback Effects
    showJumpFeedback() {
        // Particle effect at ghost position
        if (window.anim && window.anim.proton) {
            this.createJumpParticles(this.ghost.x, this.ghost.y);
        }
        
        // Combo indicator
        const combo = this.hudElement?.querySelector('#comboIndicator');
        if (combo) {
            combo.textContent = 'NICE!';
            combo.style.opacity = '1';
            setTimeout(() => {
                combo.style.opacity = '0';
            }, 500);
        }
    }
    
    showPointReward() {
        // "+1" floating text
        const videoContainer = document.querySelector('.html5-video-container');
        if (!videoContainer) return;
        
        const reward = document.createElement('div');
        reward.className = 'point-reward';
        reward.textContent = '+1';
        reward.style.left = `${this.ghost.x}px`;
        reward.style.top = `${this.ghost.y - 50}px`;
        
        videoContainer.appendChild(reward);
        
        setTimeout(() => reward.remove(), 1000);
    }
    
    showHighScoreEffect() {
        const combo = this.hudElement?.querySelector('#comboIndicator');
        if (combo) {
            combo.textContent = 'NEW HIGH SCORE!';
            combo.style.opacity = '1';
            combo.style.color = '#FFD700';
            setTimeout(() => {
                combo.style.opacity = '0';
                combo.style.color = '';
            }, 2000);
        }
    }
    
    createJumpParticles(x, y) {
        // Use existing Proton system for particle burst
        // Implementation depends on existing Proton setup in anim.js
    }
    
    // State Persistence
    saveGameState() {
        const state = {
            highScore: this.highScore,
            totalGamesPlayed: (this.loadedState?.totalGamesPlayed || 0) + (this.score > 0 ? 1 : 0),
            motionStats: this.loadedState?.motionStats || {}
        };
        
        chrome.storage.local.set({ gameState: state });
    }
    
    loadGameState() {
        chrome.storage.local.get(['gameState'], (result) => {
            if (result.gameState) {
                this.loadedState = result.gameState;
                this.highScore = result.gameState.highScore || 0;
            }
        });
    }
}
```



### 7. GhostCharacter (ghostCharacter.js)

Renders and animates the ghost character.

```javascript
class GhostCharacter {
    constructor(canvas, ctx, config) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.config = config;
        
        this.x = canvas.width / 2;
        this.baseY = canvas.height - 100;
        this.y = this.baseY;
        this.targetY = this.baseY;
        this.currentJump = 0;
        this.maxJumps = config.jumpsPerPoint;
        
        // Animation
        this.isAnimating = false;
        this.animationStartTime = 0;
        this.animationDuration = config.ghostAnimationSpeed;
        
        // Visual
        this.size = 50;
        this.bouncePhase = 0;
    }
    
    jump() {
        if (this.currentJump < this.maxJumps) {
            this.currentJump++;
            this.targetY = this.baseY - (this.currentJump * this.config.ghostJumpHeight);
            this.animateJump();
        }
    }
    
    reset() {
        this.currentJump = 0;
        this.targetY = this.baseY;
        this.animateJump();
    }
    
    animateJump() {
        this.isAnimating = true;
        this.animationStartTime = performance.now();
    }
    
    update() {
        if (!this.isAnimating) {
            // Idle bounce animation
            this.bouncePhase += 0.05;
            return;
        }
        
        const elapsed = performance.now() - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);
        
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        
        this.y = this.y + (this.targetY - this.y) * eased;
        
        if (progress >= 1) {
            this.y = this.targetY;
            this.isAnimating = false;
        }
    }
    
    draw(ctx) {
        this.update();
        
        ctx.save();
        
        // Idle bounce effect
        const bounceOffset = Math.sin(this.bouncePhase) * 5;
        const drawY = this.y + bounceOffset;
        
        // Draw ghost body (circle)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(this.x, drawY, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw ghost tail (wavy bottom)
        ctx.beginPath();
        ctx.moveTo(this.x - this.size / 2, drawY);
        for (let i = 0; i <= 4; i++) {
            const waveX = this.x - this.size / 2 + (i * this.size / 4);
            const waveY = drawY + (i % 2 === 0 ? 10 : 0);
            ctx.lineTo(waveX, waveY);
        }
        ctx.lineTo(this.x - this.size / 2, drawY);
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x - 10, drawY - 5, 4, 0, Math.PI * 2);
        ctx.arc(this.x + 10, drawY - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Alternative: Draw emoji
        // ctx.font = '50px Arial';
        // ctx.textAlign = 'center';
        // ctx.textBaseline = 'middle';
        // ctx.fillText('👻', this.x, drawY);
        
        ctx.restore();
    }
}
```

### 8. JumpMarkers (jumpMarkers.js)

Renders progress markers.

```javascript
class JumpMarkers {
    constructor(config) {
        this.config = config;
        this.markerWidth = 80;
    }
    
    draw(ctx, canvas, currentJump) {
        const markerX = canvas.width / 2 - this.markerWidth / 2;
        const baseY = canvas.height - 100;
        
        for (let i = 0; i < 10; i++) {
            const y = baseY - (i * this.config.ghostJumpHeight);
            const isReached = i < currentJump;
            
            ctx.save();
            
            // Line opacity and color
            ctx.globalAlpha = isReached ? 0.6 : this.config.markerAlpha;
            ctx.strokeStyle = isReached ? '#FFD700' : '#FFFFFF';
            ctx.lineWidth = 2;
            
            // Draw horizontal line
            ctx.beginPath();
            ctx.moveTo(markerX, y);
            ctx.lineTo(markerX + this.markerWidth, y);
            ctx.stroke();
            
            // Draw number label
            ctx.globalAlpha = 1;
            ctx.font = '12px Arial';
            ctx.fillStyle = isReached ? '#FFD700' : '#FFFFFF';
            ctx.textAlign = 'right';
            ctx.fillText((i + 1).toString(), markerX - 10, y + 4);
            
            ctx.restore();
        }
    }
}
```

### 9. GameConfig (gameConfig.js)

Configuration constants.

```javascript
const GAME_CONFIG = {
    // Game mechanics
    jumpsPerPoint: 10,
    ghostJumpHeight: 60,
    ghostAnimationSpeed: 200, // ms
    markerAlpha: 0.3,
    hudUpdateInterval: 16, // ms (60fps)
    
    // Detection tuning
    detectionSampleRate: 3, // Analyze every 3rd frame
    cooldownPeriods: {
        armCurl: 500,
        headTurn: 600,
        armRaise: 400,
        squat: 800,
        jumpingJack: 700
    },
    timeWindowSize: 5, // frames
    confidenceThreshold: 0.6, // 60% of frames must be positive
    
    // Movement thresholds
    armCurlAngleThreshold: 45, // degrees
    headTurnDistanceThreshold: 30, // pixels
    armRaiseHeightThreshold: -50, // pixels above shoulder
    squatAngleThreshold: 100, // degrees
    jumpingJackSpreadThreshold: 1.3 // factor of shoulder width
};

export default GAME_CONFIG;
```

## Data Models

### Game State

```javascript
{
    isActive: boolean,
    selectedMotion: string | null,
    currentScore: number,
    currentJumps: number,
    highScore: number,
    totalGamesPlayed: number,
    motionStats: {
        armCurl: { detected: number, accuracy: number },
        headTurn: { detected: number, accuracy: number },
        armRaise: { detected: number, accuracy: number },
        squat: { detected: number, accuracy: number },
        jumpingJack: { detected: number, accuracy: number }
    }
}
```

### Keypoint Data (from MoveNet)

```javascript
{
    x: number,        // Pixel coordinate
    y: number,        // Pixel coordinate
    score: number,    // Confidence 0-1
    name: string      // e.g., "nose", "left_shoulder"
}
```

## Integration with Existing System

### content.js Modifications

```javascript
// Global game mode instance
let gameMode = null;

// In initialization
function initGameMode() {
    if (!gameMode && canvas && ctx) {
        gameMode = new GameMode(canvas, ctx, GAME_CONFIG);
    }
}

// In detection loop (startDetection function)
function startDetection() {
    if (!detector || !mainVideo) return;
    
    detector.estimatePoses(mainVideo).then((pose) => {
        if (pose && pose.length > 0) {
            const keypoints = pose[0].keypoints;
            
            // Existing animation logic
            if (!gameMode || gameMode.state !== 'PLAYING') {
                if (anim && !isAnimDisabled) {
                    anim.updateKeypoint(keypoints);
                    anim.updateParticles();
                }
            }
            
            // NEW: Game mode logic
            if (gameMode && gameMode.state === 'PLAYING') {
                gameMode.update(keypoints);
                gameMode.render();
            }
        }
        
        if (isVideoPlay && !isAnimDisabled) {
            requestAnimationFrame(startDetection);
        }
    });
}

// Listen for game mode toggle from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.gameMode !== undefined) {
        if (request.gameMode) {
            initGameMode();
            gameMode.activate();
        } else if (gameMode) {
            gameMode.deactivate();
        }
    }
});
```

### popup.html Modifications

```html
<!-- Add to existing popup -->
<div class="game-mode-section">
    <button id="gameToggleButton" class="game-toggle-btn">
        🎮 Game Mode: OFF
    </button>
</div>
```

### popup.js Modifications

```javascript
// Game mode toggle
let isGameModeActive = false;

document.getElementById('gameToggleButton').addEventListener('click', () => {
    isGameModeActive = !isGameModeActive;
    
    // Update button text
    const btn = document.getElementById('gameToggleButton');
    btn.textContent = `🎮 Game Mode: ${isGameModeActive ? 'ON' : 'OFF'}`;
    
    // Send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            gameMode: isGameModeActive
        });
    });
    
    // Save state
    chrome.storage.sync.set({ gameModeActive: isGameModeActive });
});

// Load saved state
chrome.storage.sync.get(['gameModeActive'], (result) => {
    if (result.gameModeActive) {
        isGameModeActive = true;
        document.getElementById('gameToggleButton').textContent = '🎮 Game Mode: ON';
    }
});
```



### content.css Modifications

```css
/* Motion Selection Panel */
.motion-panel {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 24px;
    z-index: 9999;
    max-width: 600px;
    color: white;
    font-family: Arial, sans-serif;
}

.motion-panel h3 {
    margin: 0 0 20px 0;
    text-align: center;
    font-size: 24px;
}

.motion-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
}

.motion-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: white;
}

.motion-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 215, 0, 0.6);
    transform: translateY(-2px);
}

.motion-icon {
    font-size: 48px;
}

.motion-name {
    font-size: 16px;
    font-weight: bold;
}

.motion-desc {
    font-size: 12px;
    opacity: 0.8;
    text-align: center;
}

/* Game HUD */
.game-hud {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    border: 2px solid rgba(255, 215, 0, 0.4);
    border-radius: 12px;
    padding: 16px;
    font-family: Arial, sans-serif;
    color: white;
    z-index: 9998;
    min-width: 200px;
}

.hud-motion {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.hud-motion-icon {
    font-size: 24px;
}

.hud-motion-name {
    font-size: 14px;
    font-weight: bold;
}

.hud-score,
.hud-jumps,
.hud-highscore {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.hud-label {
    font-size: 14px;
    opacity: 0.8;
}

.hud-value {
    font-size: 18px;
    font-weight: bold;
    color: #FFD700;
}

.hud-combo {
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    color: #00FF00;
    margin-top: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

/* Point Reward Animation */
.point-reward {
    position: absolute;
    font-size: 48px;
    font-weight: bold;
    color: #FFD700;
    pointer-events: none;
    z-index: 10000;
    animation: floatUp 1s ease-out forwards;
}

@keyframes floatUp {
    0% {
        transform: translateY(0);
        opacity: 1;
    }
    100% {
        transform: translateY(-100px);
        opacity: 0;
    }
}

/* Game Toggle Button in Popup */
.game-toggle-btn {
    width: 100%;
    padding: 12px;
    margin: 10px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.game-toggle-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
```

## Error Handling

### Pose Detection Failures

```javascript
// In GameMode.update()
update(keypoints) {
    if (this.state !== 'PLAYING' || !this.selectedMotion) return;
    
    // Validate keypoints exist
    if (!keypoints || keypoints.length === 0) {
        // Pause game progression but don't reset
        return;
    }
    
    try {
        const detected = this.motionDetector.detect(this.selectedMotion, keypoints);
        if (detected) {
            this.onMovementDetected();
        }
    } catch (error) {
        console.warn('Motion detection error:', error);
        // Continue without throwing
    }
}
```

### Canvas Resize Handling

```javascript
// In content.js
const resizeObserver = new ResizeObserver(() => {
    if (gameMode && gameMode.state === 'PLAYING') {
        // Update canvas dimensions
        canvas.width = mainVideo.videoWidth;
        canvas.height = mainVideo.videoHeight;
        
        // Reposition ghost and markers
        gameMode.ghost.x = canvas.width / 2;
        gameMode.ghost.baseY = canvas.height - 100;
        
        // Reposition HUD
        gameMode.updateHUDPosition();
    }
});

resizeObserver.observe(mainVideo);
```

### Storage Errors

```javascript
saveGameState() {
    try {
        const state = {
            highScore: this.highScore,
            totalGamesPlayed: (this.loadedState?.totalGamesPlayed || 0) + (this.score > 0 ? 1 : 0),
            motionStats: this.loadedState?.motionStats || {}
        };
        
        chrome.storage.local.set({ gameState: state }, () => {
            if (chrome.runtime.lastError) {
                console.warn('Failed to save game state:', chrome.runtime.lastError);
            }
        });
    } catch (error) {
        console.warn('Error saving game state:', error);
    }
}
```

## Testing Strategy

### Unit Tests

1. **MotionDetector Tests**
   - Test each movement detection algorithm with known keypoint configurations
   - Verify angle calculations are accurate
   - Test cooldown manager prevents rapid detections
   - Test time window analyzer validates across frames

2. **CooldownManager Tests**
   - Verify cooldown period is respected
   - Test reset functionality

3. **TimeWindowAnalyzer Tests**
   - Test buffer management (add, remove old frames)
   - Verify 60% threshold calculation
   - Test with various frame patterns

### Integration Tests

1. **Game State Machine**
   - Test state transitions (INACTIVE → SELECTING → PLAYING)
   - Verify UI shows/hides correctly for each state
   - Test game reset and restart

2. **Score Management**
   - Verify jumps increment correctly
   - Test point award at 10 jumps
   - Verify high score tracking
   - Test state persistence

3. **Canvas Integration**
   - Test ghost rendering at various positions
   - Verify markers update correctly
   - Test animation smoothness

### Manual Testing Checklist

1. **Movement Detection Accuracy**
   - Test each movement type with various YouTube videos
   - Verify false positives are minimal
   - Test with different video qualities and frame rates

2. **Performance**
   - Monitor FPS during gameplay
   - Verify <5ms additional latency
   - Test with long gaming sessions (memory leaks)

3. **UI/UX**
   - Test motion selection panel usability
   - Verify HUD doesn't obstruct video
   - Test on different screen sizes
   - Verify animations are smooth

4. **Edge Cases**
   - Test with videos containing no people
   - Test with videos containing multiple people
   - Test with poor lighting conditions
   - Test video player resize during gameplay

## Performance Considerations

### Frame Sampling

Only analyze every 3rd frame to reduce CPU load:

```javascript
this.frameCounter++;
if (this.frameCounter % this.config.detectionSampleRate !== 0) {
    return false;
}
```

### Lazy Evaluation

Only check the selected movement type, not all five:

```javascript
// Only one switch case executes
switch(motionType) {
    case 'armCurl':
        detected = this.detectArmCurl(keypoints);
        break;
    // ...
}
```

### Simple Geometry

Use basic math operations (no complex ML):

```javascript
// Angle calculation using dot product
const dot = v1.x * v2.x + v1.y * v2.y;
const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
```

### Canvas Optimization

Clear only necessary regions:

```javascript
// Instead of clearing entire canvas
// ctx.clearRect(0, 0, canvas.width, canvas.height);

// Clear only game area
ctx.clearRect(ghostX - 100, 0, 200, canvas.height);
```

## Security Considerations

- No external API calls required
- All data stored locally using Chrome Storage API
- No PII collected or transmitted
- No access to user's webcam (only video content analysis)

## Accessibility

- High contrast UI elements (gold on dark background)
- Large, readable fonts in HUD
- Clear visual feedback for all actions
- Keyboard navigation support for motion selection panel

## Future Enhancements

1. **Additional Game Modes**
   - Time attack mode
   - Combo multiplier system
   - Different ghost characters

2. **Statistics Dashboard**
   - Detailed per-movement accuracy
   - Session history
   - Leaderboard (local)

3. **Customization**
   - Adjustable difficulty (detection sensitivity)
   - Custom jump requirements (5, 10, 15, 20)
   - Ghost character skins

4. **Audio Feedback**
   - Jump sound effects
   - Point reward sounds
   - Background music toggle

## Design Decisions and Rationale

### Why Video Content Detection?

- **No Privacy Concerns**: No webcam access required
- **Passive Gameplay**: Users can play while watching content
- **Unique Experience**: Turns any YouTube video into an interactive game
- **Technical Simplicity**: Reuses existing pose detection infrastructure

### Why 10 Jumps Per Point?

- Provides satisfying progression pace
- Allows for meaningful score accumulation
- Balances challenge with accessibility
- Typical workout videos have enough movements

### Why These 5 Movements?

- **Arm Curl**: Simple, common in fitness videos
- **Head Turn**: Easy to detect, accessible
- **Arm Raise**: Very common gesture
- **Squat**: Popular exercise, clear motion
- **Jumping Jack**: Full-body, energetic

### Why Cooldown Periods?

- Prevents false positives from jittery detection
- Ensures intentional movements are counted
- Improves game feel (deliberate vs. accidental)
- Reduces CPU load

### Why Time Window Analysis?

- Smooths out single-frame detection errors
- Increases accuracy without complex ML
- Handles video compression artifacts
- Provides robust detection across video qualities
