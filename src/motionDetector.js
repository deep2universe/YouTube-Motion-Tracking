/**
 * Motion Detector
 * Analyzes keypoint data to detect specific body movements
 */

import GAME_CONFIG from './gameConfig.js';
import { MotionEnum } from './motionEnum.js';

/**
 * CooldownManager
 * Prevents rapid-fire detections by enforcing cooldown periods
 */
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

/**
 * TimeWindowAnalyzer
 * Validates detections across multiple frames to reduce false positives
 */
class TimeWindowAnalyzer {
    constructor(windowSize = 5) {
        this.buffer = [];
        this.windowSize = windowSize;
        this.maxAge = 500; // milliseconds
    }
    
    addFrame(detectionResult) {
        this.buffer.push({
            result: detectionResult,
            timestamp: performance.now()
        });
        
        // Remove old frames (older than maxAge)
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
        if (this.buffer.length < 3) return false; // Need at least 3 frames
        
        // At least 50% of frames must be positive (balanced threshold)
        const positiveCount = this.buffer.filter(f => f.result).length;
        const ratio = positiveCount / this.buffer.length;
        return ratio >= 0.5; // 50% threshold for good accuracy
    }
    
    reset() {
        this.buffer = [];
    }
}

/**
 * MotionDetector
 * Main detection engine that analyzes keypoint data to recognize movements
 */
class MotionDetector {
    constructor(config = GAME_CONFIG) {
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
    
    // ========== HELPER METHODS ==========
    
    /**
     * Calculate angle between shoulder, elbow, and wrist
     */
    calculateArmAngle(shoulder, elbow, wrist) {
        if (!shoulder || !elbow || !wrist) return 180;
        
        const v1 = { x: shoulder.x - elbow.x, y: shoulder.y - elbow.y };
        const v2 = { x: wrist.x - elbow.x, y: wrist.y - elbow.y };
        return this.angleBetweenVectors(v1, v2);
    }
    
    /**
     * Calculate angle between hip, knee, and ankle
     */
    calculateLegAngle(hip, knee, ankle) {
        if (!hip || !knee || !ankle) return 180;
        
        const v1 = { x: hip.x - knee.x, y: hip.y - knee.y };
        const v2 = { x: ankle.x - knee.x, y: ankle.y - knee.y };
        return this.angleBetweenVectors(v1, v2);
    }
    
    /**
     * Calculate angle between two vectors using dot product
     */
    angleBetweenVectors(v1, v2) {
        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        
        if (mag1 === 0 || mag2 === 0) return 180;
        
        const cosAngle = dot / (mag1 * mag2);
        // Clamp to [-1, 1] to avoid NaN from acos
        const clampedCos = Math.max(-1, Math.min(1, cosAngle));
        return Math.acos(clampedCos) * (180 / Math.PI);
    }
    
    /**
     * Validate that required keypoints exist and have sufficient confidence
     */
    validateKeypoints(keypoints, motionType) {
        const requiredKeypoints = this.getRequiredKeypoints(motionType);
        return requiredKeypoints.every(idx => 
            keypoints[idx] && keypoints[idx].score > 0.2  // Lowered from 0.3 for better detection
        );
    }
    
    /**
     * Get required keypoint indices for each motion type
     */
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
    
    /**
     * Get human-readable name for keypoint index
     */
    getKeypointName(idx) {
        const names = [
            'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
            'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
        ];
        return names[idx] || `kp_${idx}`;
    }
    
    // ========== MOVEMENT DETECTION METHODS ==========
    
    /**
     * Detect Arm Curl movement
     * Checks if arm is bent (angle < 45 degrees)
     */
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
    
    /**
     * Detect Head Turn movement
     * Checks if nose moves horizontally away from ear midpoint
     */
    detectHeadTurn(keypoints) {
        const nose = keypoints[0];
        const leftEar = keypoints[3];
        const rightEar = keypoints[4];
        
        if (!nose || !leftEar || !rightEar) return false;
        
        const earMidpoint = (leftEar.x + rightEar.x) / 2;
        const delta = Math.abs(nose.x - earMidpoint);
        
        return delta > this.config.headTurnDistanceThreshold;
    }
    
    /**
     * Detect Arm Raise movement
     * Checks if wrist is above shoulder
     */
    detectArmRaise(keypoints) {
        // Check both arms
        const leftRaised = keypoints[9] && keypoints[5] && 
            keypoints[9].y < (keypoints[5].y + this.config.armRaiseHeightThreshold);
        const rightRaised = keypoints[10] && keypoints[6] && 
            keypoints[10].y < (keypoints[6].y + this.config.armRaiseHeightThreshold);
        
        return leftRaised || rightRaised;
    }
    
    /**
     * Detect Squat movement
     * Uses state machine to count only complete reps (down and up)
     */
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
    
    /**
     * Detect Jumping Jack movement
     * Requires both arms up AND legs spread simultaneously
     */
    detectJumpingJack(keypoints) {
        // Arms: both wrists above shoulders
        const leftArmUp = keypoints[9] && keypoints[5] && keypoints[9].y < keypoints[5].y;
        const rightArmUp = keypoints[10] && keypoints[6] && keypoints[10].y < keypoints[6].y;
        
        // Legs: ankles wider than hips
        if (!keypoints[11] || !keypoints[12] || !keypoints[15] || !keypoints[16]) {
            return false;
        }
        
        const hipWidth = Math.abs(keypoints[11].x - keypoints[12].x);
        const ankleWidth = Math.abs(keypoints[15].x - keypoints[16].x);
        const legsSpread = ankleWidth > (hipWidth * this.config.jumpingJackSpreadThreshold);
        
        return leftArmUp && rightArmUp && legsSpread;
    }
    
    // ========== MAIN DETECTION METHOD ==========
    
    /**
     * Main detection method called from game loop
     * @param {string} motionType - Type of motion to detect
     * @param {Array} keypoints - Array of keypoint objects from pose detection
     * @returns {boolean} True if movement detected and confirmed
     */
    detect(motionType, keypoints) {
        // Frame sampling optimization
        this.frameCounter++;
        if (this.frameCounter % this.config.detectionSampleRate !== 0) {
            return false;
        }
        
        // Log first detection attempt
        if (!this._detectLogged) {
            console.log('[MOTION DETECTOR] First detect call for:', motionType);
            console.log('[MOTION DETECTOR] Keypoints count:', keypoints.length);
            console.log('[MOTION DETECTOR] Sample keypoint:', keypoints[0]);
            console.log('[MOTION DETECTOR] Keypoint structure:', {
                hasScore: 'score' in keypoints[0],
                hasX: 'x' in keypoints[0],
                hasY: 'y' in keypoints[0],
                keys: Object.keys(keypoints[0])
            });
            this._detectLogged = true;
        }
        
        // Check cooldown
        if (!this.cooldownManagers[motionType].canDetect()) {
            return false;
        }
        
        // Validate keypoints
        const isValid = this.validateKeypoints(keypoints, motionType);
        if (!isValid) {
            // Only log first 5 failures to avoid spam
            if (!this._validationWarnCount) this._validationWarnCount = 0;
            if (this._validationWarnCount < 5) {
                console.warn('[MOTION DETECTOR] Keypoint validation failed for:', motionType);
                const required = this.getRequiredKeypoints(motionType);
                const keypointStatus = required.map(idx => ({
                    idx,
                    name: this.getKeypointName(idx),
                    exists: !!keypoints[idx],
                    score: keypoints[idx]?.score?.toFixed(2) || 'N/A',
                    passesThreshold: keypoints[idx] && keypoints[idx].score > 0.2
                }));
                console.warn('[MOTION DETECTOR] Keypoint status:', keypointStatus);
                console.warn('[MOTION DETECTOR] Full keypoint sample:', keypoints[required[0]]);
                this._validationWarnCount++;
            }
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
            default:
                console.warn('[MOTION DETECTOR] Unknown motion type:', motionType);
                return false;
        }
        
        // Log detection attempts occasionally
        if (this.frameCounter % 90 === 0) { // Every ~3 seconds at 30fps
            const analyzer = this.timeWindowAnalyzers[motionType];
            const positiveCount = analyzer.buffer.filter(f => f.result).length;
            console.log('[MOTION DETECTOR] Status:', motionType, 
                       'detected:', detected,
                       'buffer:', `${positiveCount}/${analyzer.buffer.length}`);
        }
        
        // Time window validation
        this.timeWindowAnalyzers[motionType].addFrame(detected);
        const confirmed = this.timeWindowAnalyzers[motionType].isMovementConfirmed();
        
        if (confirmed) {
            console.log('[MOTION DETECTOR] ✓ Movement CONFIRMED:', motionType);
        }
        
        return confirmed;
    }
}

export { MotionDetector, CooldownManager, TimeWindowAnalyzer };
