/**
 * GhostCharacter
 * Renders and animates the ghost character for the game
 */

import GAME_CONFIG from './gameConfig.js';

class GhostCharacter {
    constructor(canvas, ctx, config = GAME_CONFIG) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.config = config;
        
        // Position
        this.x = canvas.width / 2;
        this.baseY = canvas.height - 100;
        this.y = this.baseY;
        this.targetY = this.baseY;
        
        // Jump tracking
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
    
    /**
     * Trigger a jump to the next level
     */
    jump() {
        if (this.currentJump < this.maxJumps) {
            this.currentJump++;
            this.targetY = this.baseY - (this.currentJump * this.config.ghostJumpHeight);
            this.animateJump();
        }
    }
    
    /**
     * Reset ghost to starting position
     */
    reset() {
        this.currentJump = 0;
        this.targetY = this.baseY;
        this.animateJump();
    }
    
    /**
     * Start jump animation
     */
    animateJump() {
        this.isAnimating = true;
        this.animationStartTime = performance.now();
    }
    
    /**
     * Update animation state
     */
    update() {
        if (!this.isAnimating) {
            // Idle bounce animation
            this.bouncePhase += 0.05;
            return;
        }
        
        const elapsed = performance.now() - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);
        
        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        
        // Interpolate position
        this.y = this.y + (this.targetY - this.y) * eased;
        
        if (progress >= 1) {
            this.y = this.targetY;
            this.isAnimating = false;
        }
    }
    
    /**
     * Draw the ghost character
     */
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
        
        ctx.restore();
    }
}

export { GhostCharacter };
