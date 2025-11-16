/**
 * JumpMarkers
 * Renders progress markers showing jump levels
 */

import GAME_CONFIG from './gameConfig.js';

class JumpMarkers {
    constructor(config = GAME_CONFIG) {
        this.config = config;
        this.markerWidth = 80;
    }
    
    /**
     * Draw all 10 jump markers
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {number} currentJump - Current jump level (0-10)
     */
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

export { JumpMarkers };
