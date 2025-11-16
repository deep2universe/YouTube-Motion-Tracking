/**
 * Motion Detectors
 * Specialized detectors for each motion type using pattern recognition
 */

import { AngleHistoryBuffer, PositionHistoryBuffer } from './motionPatterns.js';

/**
 * Helper function to calculate angle between three points
 */
function calculateAngle(point1, point2, point3) {
    if (!point1 || !point2 || !point3) return 180;
    
    const v1 = { x: point1.x - point2.x, y: point1.y - point2.y };
    const v2 = { x: point3.x - point2.x, y: point3.y - point2.y };
    
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    
    if (mag1 === 0 || mag2 === 0) return 180;
    
    const cosAngle = dot / (mag1 * mag2);
    const clampedCos = Math.max(-1, Math.min(1, cosAngle));
    return Math.acos(clampedCos) * (180 / Math.PI);
}

/**
 * ArmCurlDetector
 * Detects arm curl movements using valley pattern detection
 */
class ArmCurlDetector {
    constructor(config) {
        this.config = config;
        this.leftArmHistory = new AngleHistoryBuffer(config.historyBufferSize);
        this.rightArmHistory = new AngleHistoryBuffer(config.historyBufferSize);
        this.frameCount = 0;
    }
    
    /**
     * Update detector with new keypoints
     * @param {Array} keypoints - Pose keypoints
     * @returns {boolean} True if arm curl detected
     */
    update(keypoints) {
        // Calculate angles for both arms
        const leftAngle = calculateAngle(
            keypoints[5],  // left shoulder
            keypoints[7],  // left elbow
            keypoints[9]   // left wrist
        );
        const rightAngle = calculateAngle(
            keypoints[6],  // right shoulder
            keypoints[8],  // right elbow
            keypoints[10]  // right wrist
        );
        
        // Sample every frame
        const leftConfidence = keypoints[9]?.score || 0;
        const rightConfidence = keypoints[10]?.score || 0;
        
        this.leftArmHistory.addSample(leftAngle, leftConfidence);
        this.rightArmHistory.addSample(rightAngle, rightConfidence);
        
        // Pattern detection every N frames for performance
        this.frameCount++;
        if (this.frameCount % this.config.patternDetectionInterval !== 0) {
            return false;
        }
        
        // Detect valley pattern in either arm
        const leftDetected = this.leftArmHistory.detectValley(
            this.config.armCurl.flexedThreshold,
            this.config.armCurl.extendedThreshold
        );
        const rightDetected = this.rightArmHistory.detectValley(
            this.config.armCurl.flexedThreshold,
            this.config.armCurl.extendedThreshold
        );
        
        return leftDetected || rightDetected;
    }
    
    reset() {
        this.leftArmHistory.clear();
        this.rightArmHistory.clear();
        this.frameCount = 0;
    }
}

/**
 * HeadTurnDetector
 * Detects head turn movements using oscillation pattern detection
 */
class HeadTurnDetector {
    constructor(config) {
        this.config = config;
        this.noseHistory = new PositionHistoryBuffer(config.historyBufferSize);
        this.frameCount = 0;
    }
    
    /**
     * Update detector with new keypoints
     * @param {Array} keypoints - Pose keypoints
     * @returns {boolean} True if head turn detected
     */
    update(keypoints) {
        const nose = keypoints[0];
        if (!nose) return false;
        
        // Sample every frame
        this.noseHistory.addSample(nose.x, nose.y, nose.score);
        
        // Pattern detection every N frames
        this.frameCount++;
        if (this.frameCount % this.config.patternDetectionInterval !== 0) {
            return false;
        }
        
        // Detect oscillation pattern
        return this.noseHistory.detectOscillation(
            this.config.headTurn.oscillationThreshold
        );
    }
    
    reset() {
        this.noseHistory.clear();
        this.frameCount = 0;
    }
}

/**
 * ArmRaiseDetector
 * Detects arm raise movements using peak pattern detection
 */
class ArmRaiseDetector {
    constructor(config) {
        this.config = config;
        this.leftWristHistory = new PositionHistoryBuffer(config.historyBufferSize);
        this.rightWristHistory = new PositionHistoryBuffer(config.historyBufferSize);
        this.frameCount = 0;
    }
    
    /**
     * Update detector with new keypoints
     * @param {Array} keypoints - Pose keypoints
     * @returns {boolean} True if arm raise detected
     */
    update(keypoints) {
        const leftWrist = keypoints[9];
        const rightWrist = keypoints[10];
        
        if (leftWrist) {
            this.leftWristHistory.addSample(leftWrist.x, leftWrist.y, leftWrist.score);
        }
        if (rightWrist) {
            this.rightWristHistory.addSample(rightWrist.x, rightWrist.y, rightWrist.score);
        }
        
        // Pattern detection every N frames
        this.frameCount++;
        if (this.frameCount % this.config.patternDetectionInterval !== 0) {
            return false;
        }
        
        // Detect peak pattern in either wrist
        const leftDetected = this.leftWristHistory.detectPeak(
            this.config.armRaise.peakThreshold
        );
        const rightDetected = this.rightWristHistory.detectPeak(
            this.config.armRaise.peakThreshold
        );
        
        return leftDetected || rightDetected;
    }
    
    reset() {
        this.leftWristHistory.clear();
        this.rightWristHistory.clear();
        this.frameCount = 0;
    }
}

/**
 * SquatDetector
 * Detects squat movements using state machine and valley detection
 */
class SquatDetector {
    constructor(config) {
        this.config = config;
        this.leftLegHistory = new AngleHistoryBuffer(config.historyBufferSize);
        this.rightLegHistory = new AngleHistoryBuffer(config.historyBufferSize);
        this.state = 'STANDING';
        this.frameCount = 0;
    }
    
    /**
     * Update detector with new keypoints
     * @param {Array} keypoints - Pose keypoints
     * @returns {boolean} True if complete squat detected
     */
    update(keypoints) {
        // Calculate leg angles
        const leftLegAngle = calculateAngle(
            keypoints[11], // left hip
            keypoints[13], // left knee
            keypoints[15]  // left ankle
        );
        const rightLegAngle = calculateAngle(
            keypoints[12], // right hip
            keypoints[14], // right knee
            keypoints[16]  // right ankle
        );
        
        // Sample every frame
        const leftConfidence = keypoints[15]?.score || 0;
        const rightConfidence = keypoints[16]?.score || 0;
        
        this.leftLegHistory.addSample(leftLegAngle, leftConfidence);
        this.rightLegHistory.addSample(rightLegAngle, rightConfidence);
        
        // Get average angle
        const avgAngle = (leftLegAngle + rightLegAngle) / 2;
        const isSquatting = avgAngle < this.config.squat.squatAngleThreshold;
        
        // State machine: only count complete reps
        if (isSquatting && this.state === 'STANDING') {
            this.state = 'SQUATTING';
            return false;
        } else if (!isSquatting && this.state === 'SQUATTING') {
            this.state = 'STANDING';
            return true; // Complete rep!
        }
        
        return false;
    }
    
    reset() {
        this.leftLegHistory.clear();
        this.rightLegHistory.clear();
        this.state = 'STANDING';
        this.frameCount = 0;
    }
}

/**
 * JumpingJackDetector
 * Detects jumping jack movements using synchronized detection
 */
class JumpingJackDetector {
    constructor(config) {
        this.config = config;
        this.state = 'CLOSED';
        this.frameCount = 0;
    }
    
    /**
     * Update detector with new keypoints
     * @param {Array} keypoints - Pose keypoints
     * @returns {boolean} True if jumping jack detected
     */
    update(keypoints) {
        // Check arms: both wrists above shoulders
        const leftArmUp = keypoints[9] && keypoints[5] && 
            keypoints[9].y < keypoints[5].y;
        const rightArmUp = keypoints[10] && keypoints[6] && 
            keypoints[10].y < keypoints[6].y;
        
        // Check legs: ankles wider than hips
        if (!keypoints[11] || !keypoints[12] || !keypoints[15] || !keypoints[16]) {
            return false;
        }
        
        const hipWidth = Math.abs(keypoints[11].x - keypoints[12].x);
        const ankleWidth = Math.abs(keypoints[15].x - keypoints[16].x);
        const legsSpread = ankleWidth > (hipWidth * this.config.jumpingJack.spreadThreshold);
        
        const isOpen = leftArmUp && rightArmUp && legsSpread;
        
        // State machine: count transition from OPEN to CLOSED
        if (isOpen && this.state === 'CLOSED') {
            this.state = 'OPEN';
            return false;
        } else if (!isOpen && this.state === 'OPEN') {
            this.state = 'CLOSED';
            return true; // Complete jack!
        }
        
        return false;
    }
    
    reset() {
        this.state = 'CLOSED';
        this.frameCount = 0;
    }
}

export {
    ArmCurlDetector,
    HeadTurnDetector,
    ArmRaiseDetector,
    SquatDetector,
    JumpingJackDetector
};
