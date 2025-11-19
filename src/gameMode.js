/**
 * GameMode
 * State machine and orchestration for the Motion Game Mode
 */

import GAME_CONFIG from './gameConfig.js';
import { MotionEnum } from './motionEnum.js';
import { MotionDetector } from './motionDetector.js';
import { GhostCharacter } from './ghostCharacter.js';
import { JumpMarkers } from './jumpMarkers.js';

/**
 * Debug flag for gameMode.js
 * Set to true to enable console logging for this file
 * Set to false for production builds (default)
 */
const DEBUG = false;

class GameMode {
    constructor(canvas, ctx, config = GAME_CONFIG) {
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
        this.motionDetector = new MotionDetector(config);
        
        // UI Elements
        this.selectionPanel = null;
        this.hudElement = null;
        
        // Load saved state
        this.loadedState = null;
        this.loadGameState();
    }
    
    // ========== STATE TRANSITION METHODS ==========
    
    /**
     * Activate game mode - show motion selection
     */
    activate() {
        this.state = 'SELECTING';
        this.showMotionSelectionPanel();
    }
    
    /**
     * Deactivate game mode - return to inactive
     */
    deactivate() {
        this.state = 'INACTIVE';
        this.hideAllUI();
        this.saveGameState();
    }
    
    /**
     * Start game with selected motion
     * @param {string} motionType - ID of selected motion
     */
    startGame(motionType) {
        if (DEBUG) console.log('[GAME MODE] Starting game with motion:', motionType);
        this.state = 'PLAYING';
        this.selectedMotion = motionType;
        this.score = 0;
        this.jumps = 0;
        this.ghost.reset();
        
        this.hideMotionSelectionPanel();
        this.showHUD();
        this.updateHUD();
        
        if (DEBUG) console.log('[GAME MODE] Game started. State:', this.state, 'Motion:', this.selectedMotion);
    }
    
    // ========== GAME LOGIC ==========
    
    /**
     * Handle detected movement
     */
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
    
    // ========== UPDATE AND RENDER ==========
    
    /**
     * Update game state with new keypoints
     * @param {Array} keypoints - Pose keypoints from video
     */
    update(keypoints) {
        if (this.state !== 'PLAYING' || !this.selectedMotion) {
            if (this.state !== 'PLAYING') {
                if (DEBUG) console.log('[GAME MODE] Not updating - state is:', this.state);
            }
            return;
        }
        
        // Validate keypoints exist
        if (!keypoints || keypoints.length === 0) {
            if (DEBUG) console.warn('[GAME MODE] No keypoints received');
            return;
        }
        
        // Store keypoints for rendering
        this.lastKeypoints = keypoints;
        
        // Log first time to confirm update is being called
        if (!this._updateLogged) {
            if (DEBUG) console.log('[GAME MODE] Update called with', keypoints.length, 'keypoints');
            if (DEBUG) console.log('[GAME MODE] First keypoint:', keypoints[0]);
            if (DEBUG) console.log('[GAME MODE] Selected motion:', this.selectedMotion);
            this._updateLogged = true;
        }
        
        try {
            // Detect movement
            const detected = this.motionDetector.detect(this.selectedMotion, keypoints);
            if (detected) {
                if (DEBUG) console.log('[GAME MODE] ✓ Movement detected!');
                this.onMovementDetected();
            }
        } catch (error) {
            console.error('[GAME MODE] Motion detection error:', error);
        }
    }
    
    /**
     * Render game elements on canvas
     */
    render() {
        if (this.state !== 'PLAYING') return;
        
        // Log first render to confirm rendering is working
        if (!this._renderLogged) {
            if (DEBUG) console.log('[GAME MODE] Rendering - Canvas:', this.canvas.width, 'x', this.canvas.height);
            if (DEBUG) console.log('[GAME MODE] Ghost position:', this.ghost.x, this.ghost.y);
            this._renderLogged = true;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw skeleton overlay for visual feedback
        if (this.lastKeypoints) {
            this.drawSkeletonOverlay(this.lastKeypoints);
        }
        
        // Render components
        this.markers.draw(this.ctx, this.canvas, this.jumps);
        this.ghost.draw(this.ctx);
    }
    
    // ========== UI METHODS - MOTION SELECTION PANEL ==========
    
    /**
     * Show motion selection panel
     */
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
        
        videoContainer.appendChild(this.selectionPanel);
        
        // Add event listeners
        this.addMotionSelectionListeners();
    }
    
    /**
     * Add event listeners to motion selection panel
     */
    addMotionSelectionListeners() {
        if (!this.selectionPanel) return;
        
        this.selectionPanel.querySelectorAll('.motion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const motionId = e.currentTarget.dataset.motion;
                this.startGame(motionId);
            });
        });
    }
    
    /**
     * Hide motion selection panel
     */
    hideMotionSelectionPanel() {
        if (this.selectionPanel) {
            this.selectionPanel.remove();
            this.selectionPanel = null;
        }
    }
    
    // ========== UI METHODS - HUD ==========
    
    /**
     * Show game HUD
     */
    showHUD() {
        const videoContainer = document.querySelector('.html5-video-container');
        if (!videoContainer || this.hudElement) return;
        
        const selectedMotionObj = MotionEnum.getById(this.selectedMotion);
        
        this.hudElement = document.createElement('div');
        this.hudElement.id = 'gameHUD';
        this.hudElement.className = 'game-hud';
        this.hudElement.innerHTML = `
            <div class="hud-motion">
                <span class="hud-motion-icon">${selectedMotionObj?.icon || ''}</span>
                <span class="hud-motion-name">${selectedMotionObj?.displayName || ''}</span>
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
    
    /**
     * Update HUD values
     */
    updateHUD() {
        if (!this.hudElement) return;
        
        const scoreEl = this.hudElement.querySelector('#scoreValue');
        const jumpsEl = this.hudElement.querySelector('#jumpsValue');
        const highScoreEl = this.hudElement.querySelector('#highScoreValue');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (jumpsEl) jumpsEl.textContent = `${this.jumps}/10`;
        if (highScoreEl) highScoreEl.textContent = this.highScore;
    }
    
    /**
     * Hide all UI elements
     */
    hideAllUI() {
        this.hideMotionSelectionPanel();
        if (this.hudElement) {
            this.hudElement.remove();
            this.hudElement = null;
        }
    }
    
    // ========== FEEDBACK EFFECTS ==========
    
    /**
     * Show jump feedback
     */
    showJumpFeedback() {
        // Visual text feedback
        const combo = this.hudElement?.querySelector('#comboIndicator');
        if (combo) {
            combo.textContent = 'NICE!';
            combo.style.opacity = '1';
            combo.style.color = '#00FF00';
            setTimeout(() => {
                combo.style.opacity = '0';
            }, 500);
        }
        
        // Particle effect at ghost position
        this.createJumpParticles(this.ghost.x, this.ghost.y);
    }
    
    /**
     * Show point reward animation
     */
    showPointReward() {
        const videoContainer = document.querySelector('.html5-video-container');
        if (!videoContainer) return;
        
        const reward = document.createElement('div');
        reward.className = 'point-reward';
        reward.textContent = '+1';
        reward.style.position = 'absolute';
        reward.style.left = `${this.ghost.x}px`;
        reward.style.top = `${this.ghost.y - 50}px`;
        
        videoContainer.appendChild(reward);
        
        setTimeout(() => reward.remove(), 1000);
    }
    
    /**
     * Show high score effect
     */
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
    
    /**
     * Draw skeleton overlay for visual feedback
     * Shows keypoints and connections, highlighting relevant ones for selected motion
     * @param {Array} keypoints - Pose keypoints from detector
     */
    drawSkeletonOverlay(keypoints) {
        if (!keypoints || keypoints.length === 0) return;
        
        this.ctx.save();
        
        // Define skeleton connections
        const connections = [
            [5, 6],   // shoulders
            [5, 7],   // left shoulder to elbow
            [7, 9],   // left elbow to wrist
            [6, 8],   // right shoulder to elbow
            [8, 10],  // right elbow to wrist
            [5, 11],  // left shoulder to hip
            [6, 12],  // right shoulder to hip
            [11, 12], // hips
            [11, 13], // left hip to knee
            [13, 15], // left knee to ankle
            [12, 14], // right hip to knee
            [14, 16], // right knee to ankle
            [0, 1],   // nose to left eye
            [0, 2],   // nose to right eye
            [1, 3],   // left eye to ear
            [2, 4]    // right eye to ear
        ];
        
        // Get relevant keypoints for current motion
        const relevantKeypoints = this.getRelevantKeypoints(this.selectedMotion);
        
        // Draw connections
        this.ctx.lineWidth = 2;
        connections.forEach(([start, end]) => {
            const kp1 = keypoints[start];
            const kp2 = keypoints[end];
            
            if (kp1 && kp2 && kp1.score > 0.2 && kp2.score > 0.2) {
                // Highlight if relevant to current motion
                const isRelevant = relevantKeypoints.includes(start) || relevantKeypoints.includes(end);
                this.ctx.strokeStyle = isRelevant ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 255, 255, 0.4)';
                this.ctx.lineWidth = isRelevant ? 3 : 2;
                
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });
        
        // Draw keypoints
        keypoints.forEach((kp, idx) => {
            if (kp && kp.score > 0.2) {
                const isRelevant = relevantKeypoints.includes(idx);
                const radius = isRelevant ? 6 : 4;
                
                // Outer circle
                this.ctx.fillStyle = isRelevant ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 255, 255, 0.6)';
                this.ctx.beginPath();
                this.ctx.arc(kp.x, kp.y, radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Inner circle
                this.ctx.fillStyle = isRelevant ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(kp.x, kp.y, radius - 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        this.ctx.restore();
    }
    
    /**
     * Get relevant keypoint indices for a motion type
     * @param {string} motionType - Type of motion
     * @returns {Array} Array of keypoint indices
     */
    getRelevantKeypoints(motionType) {
        const keypointMap = {
            'armCurl': [5, 6, 7, 8, 9, 10],           // shoulders, elbows, wrists
            'headTurn': [0, 1, 2, 3, 4],              // nose, eyes, ears
            'armRaise': [5, 6, 9, 10],                // shoulders, wrists
            'squat': [11, 12, 13, 14, 15, 16],        // hips, knees, ankles
            'jumpingJack': [5, 6, 9, 10, 11, 12, 15, 16] // shoulders, wrists, hips, ankles
        };
        return keypointMap[motionType] || [];
    }
    
    /**
     * Create particle burst effect at ghost position
     * @param {number} x - X position for particles
     * @param {number} y - Y position for particles
     */
    createJumpParticles(x, y) {
        // Check if Proton system is available
        if (!window.anim || !window.anim.proton || !window.Proton) {
            return;
        }
        
        try {
            // Create a one-time burst emitter
            const emitter = new Proton.Emitter();
            
            // Burst configuration: emit all particles at once
            emitter.rate = new Proton.Rate(new Proton.Span(12, 18), 1);
            
            // Particle properties
            emitter.addInitialize(new Proton.Mass(1));
            emitter.addInitialize(new Proton.Radius(4, 8));
            emitter.addInitialize(new Proton.Life(0.5, 1.0));
            emitter.addInitialize(new Proton.Velocity(new Proton.Span(2, 5), new Proton.Span(0, 360), 'polar'));
            
            // Visual properties: ghostly white/blue colors
            emitter.addBehaviour(new Proton.Color('#FFFFFF', '#87CEEB'));
            emitter.addBehaviour(new Proton.Alpha(0.9, 0)); // Fade out
            emitter.addBehaviour(new Proton.Scale(1.2, 0.3)); // Shrink
            emitter.addBehaviour(new Proton.Gravity(0.5)); // Slight downward pull
            
            // Set position to ghost location
            emitter.p.x = x;
            emitter.p.y = y;
            
            // Emit once and remove after particles die
            emitter.emit('once');
            window.anim.proton.addEmitter(emitter);
            
            // Clean up emitter after particles are done (1.5 seconds max)
            setTimeout(() => {
                try {
                    emitter.stop();
                    window.anim.proton.removeEmitter(emitter);
                } catch (e) {
                    // Silently fail if cleanup fails
                }
            }, 1500);
            
        } catch (error) {
            if (DEBUG) console.warn('Failed to create jump particles:', error);
        }
    }
    
    // ========== STATE PERSISTENCE ==========
    
    /**
     * Save game state to Chrome storage
     */
    saveGameState() {
        try {
            const state = {
                highScore: this.highScore,
                totalGamesPlayed: (this.loadedState?.totalGamesPlayed || 0) + (this.score > 0 ? 1 : 0),
                motionStats: this.loadedState?.motionStats || {}
            };
            
            chrome.storage.local.set({ gameState: state }, () => {
                if (chrome.runtime.lastError) {
                    if (DEBUG) console.warn('Failed to save game state:', chrome.runtime.lastError);
                }
            });
        } catch (error) {
            if (DEBUG) console.warn('Error saving game state:', error);
        }
    }
    
    /**
     * Load game state from Chrome storage
     */
    loadGameState() {
        try {
            chrome.storage.local.get(['gameState'], (result) => {
                if (result.gameState) {
                    this.loadedState = result.gameState;
                    this.highScore = result.gameState.highScore || 0;
                }
            });
        } catch (error) {
            if (DEBUG) console.warn('Error loading game state:', error);
        }
    }
}

export { GameMode };
