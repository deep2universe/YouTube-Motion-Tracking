/**
 * Motion Patterns
 * Base classes for pattern detection in motion tracking
 */

/**
 * AngleHistoryBuffer
 * Stores angle measurements over time for pattern detection
 */
class AngleHistoryBuffer {
    constructor(maxSize = 30) {
        this.buffer = [];
        this.maxSize = maxSize;
        this.lastValleyTime = 0;
    }
    
    /**
     * Add a new angle sample to the buffer
     * @param {number} angle - Angle in degrees
     * @param {number} confidence - Keypoint confidence score (0-1)
     */
    addSample(angle, confidence) {
        this.buffer.push({
            timestamp: performance.now(),
            angle: angle,
            confidence: confidence
        });
        
        // Remove old samples (FIFO)
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
    }
    
    /**
     * Get recent angles from buffer
     * @param {number} count - Number of recent angles to retrieve
     * @returns {Array<number>} Array of angles
     */
    getRecentAngles(count = 10) {
        return this.buffer.slice(-count).map(s => s.angle);
    }
    
    /**
     * Get average angle over recent samples
     * @param {number} count - Number of samples to average
     * @returns {number} Average angle
     */
    getAverageAngle(count = 5) {
        if (this.buffer.length === 0) return 180;
        
        const recent = this.buffer.slice(-count);
        const sum = recent.reduce((acc, s) => acc + s.angle, 0);
        return sum / recent.length;
    }
    
    /**
     * Detect valley pattern: high → low → high
     * Represents a complete flexion movement (e.g., arm curl)
     * @param {number} flexedThreshold - Angle threshold for flexed state
     * @param {number} extendedThreshold - Angle threshold for extended state
     * @returns {boolean} True if valley pattern detected
     */
    detectValley(flexedThreshold = 60, extendedThreshold = 120) {
        if (this.buffer.length < 15) return false; // Need enough data
        
        // Prevent rapid re-detection
        const now = performance.now();
        if (now - this.lastValleyTime < 300) return false;
        
        // Find local minimum (valley) in the middle section
        let minIdx = -1;
        let minAngle = Infinity;
        
        const startIdx = 5;
        const endIdx = this.buffer.length - 5;
        
        for (let i = startIdx; i < endIdx; i++) {
            const angle = this.buffer[i].angle;
            const confidence = this.buffer[i].confidence;
            
            // Skip low confidence samples
            if (confidence < 0.3) continue;
            
            // Check if this is a local minimum
            const prevAngles = this.buffer.slice(Math.max(0, i - 3), i).map(s => s.angle);
            const nextAngles = this.buffer.slice(i + 1, Math.min(this.buffer.length, i + 4)).map(s => s.angle);
            
            const prevAvg = prevAngles.length > 0 ? prevAngles.reduce((a, b) => a + b, 0) / prevAngles.length : angle;
            const nextAvg = nextAngles.length > 0 ? nextAngles.reduce((a, b) => a + b, 0) / nextAngles.length : angle;
            
            // Is this a valley?
            if (angle < prevAvg && angle < nextAvg && angle < minAngle) {
                minAngle = angle;
                minIdx = i;
            }
        }
        
        if (minIdx === -1) return false;
        
        // Validate: Was arm extended before?
        const beforeAngles = this.buffer.slice(0, minIdx).map(s => s.angle);
        const beforeAvg = beforeAngles.reduce((a, b) => a + b, 0) / beforeAngles.length;
        
        // Validate: Is arm extended after?
        const afterAngles = this.buffer.slice(minIdx + 1).map(s => s.angle);
        const afterAvg = afterAngles.reduce((a, b) => a + b, 0) / afterAngles.length;
        
        // Validate: Was valley deep enough?
        const deepEnough = minAngle < flexedThreshold;
        const wasExtended = beforeAvg > extendedThreshold;
        const isExtended = afterAvg > extendedThreshold;
        
        if (deepEnough && wasExtended && isExtended) {
            this.lastValleyTime = now;
            return true;
        }
        
        return false;
    }
    
    /**
     * Clear the buffer
     */
    clear() {
        this.buffer = [];
        this.lastValleyTime = 0;
    }
}

/**
 * PositionHistoryBuffer
 * Stores position measurements over time for pattern detection
 */
class PositionHistoryBuffer {
    constructor(maxSize = 30) {
        this.buffer = [];
        this.maxSize = maxSize;
        this.lastPeakTime = 0;
        this.lastOscillationTime = 0;
    }
    
    /**
     * Add a new position sample to the buffer
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} confidence - Keypoint confidence score (0-1)
     */
    addSample(x, y, confidence) {
        this.buffer.push({
            timestamp: performance.now(),
            x: x,
            y: y,
            confidence: confidence
        });
        
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
    }
    
    /**
     * Detect peak pattern: low → high → low (for vertical movement)
     * Represents raising and lowering (e.g., arm raise)
     * @param {number} peakThreshold - Minimum height difference for peak
     * @returns {boolean} True if peak pattern detected
     */
    detectPeak(peakThreshold = 50) {
        if (this.buffer.length < 15) return false;
        
        const now = performance.now();
        if (now - this.lastPeakTime < 300) return false;
        
        // Find local maximum (peak) in Y position (lower Y = higher position)
        let maxIdx = -1;
        let maxY = -Infinity;
        
        for (let i = 5; i < this.buffer.length - 5; i++) {
            const y = this.buffer[i].y;
            const confidence = this.buffer[i].confidence;
            
            if (confidence < 0.3) continue;
            
            const prevY = this.buffer.slice(Math.max(0, i - 3), i).map(s => s.y);
            const nextY = this.buffer.slice(i + 1, Math.min(this.buffer.length, i + 4)).map(s => s.y);
            
            const prevAvg = prevY.reduce((a, b) => a + b, 0) / prevY.length;
            const nextAvg = nextY.reduce((a, b) => a + b, 0) / nextY.length;
            
            // Is this a peak? (lower Y = higher position)
            if (y < prevAvg && y < nextAvg && y > maxY) {
                maxY = y;
                maxIdx = i;
            }
        }
        
        if (maxIdx === -1) return false;
        
        // Validate: Was position lower before?
        const beforeY = this.buffer.slice(0, maxIdx).map(s => s.y);
        const beforeAvg = beforeY.reduce((a, b) => a + b, 0) / beforeY.length;
        
        // Validate: Is position lower after?
        const afterY = this.buffer.slice(maxIdx + 1).map(s => s.y);
        const afterAvg = afterY.reduce((a, b) => a + b, 0) / afterY.length;
        
        const highEnough = (beforeAvg - maxY) > peakThreshold && (afterAvg - maxY) > peakThreshold;
        
        if (highEnough) {
            this.lastPeakTime = now;
            return true;
        }
        
        return false;
    }
    
    /**
     * Detect oscillation pattern: center → left/right → center
     * Represents side-to-side movement (e.g., head turn)
     * @param {number} oscillationThreshold - Minimum distance for oscillation
     * @returns {boolean} True if oscillation pattern detected
     */
    detectOscillation(oscillationThreshold = 30) {
        if (this.buffer.length < 15) return false;
        
        const now = performance.now();
        if (now - this.lastOscillationTime < 300) return false;
        
        // Calculate center position from first samples
        const centerX = this.buffer.slice(0, 5).reduce((sum, s) => sum + s.x, 0) / 5;
        
        // Find maximum deviation from center
        let maxDeviation = 0;
        let deviationIdx = -1;
        
        for (let i = 5; i < this.buffer.length - 5; i++) {
            const deviation = Math.abs(this.buffer[i].x - centerX);
            if (deviation > maxDeviation) {
                maxDeviation = deviation;
                deviationIdx = i;
            }
        }
        
        if (deviationIdx === -1 || maxDeviation < oscillationThreshold) return false;
        
        // Validate: Did position return to center?
        const recentX = this.buffer.slice(-5).reduce((sum, s) => sum + s.x, 0) / 5;
        const returnedToCenter = Math.abs(recentX - centerX) < oscillationThreshold / 2;
        
        if (returnedToCenter) {
            this.lastOscillationTime = now;
            return true;
        }
        
        return false;
    }
    
    /**
     * Clear the buffer
     */
    clear() {
        this.buffer = [];
        this.lastPeakTime = 0;
        this.lastOscillationTime = 0;
    }
}

export { AngleHistoryBuffer, PositionHistoryBuffer };
