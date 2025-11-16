/**
 * Motion Detector
 * Analyzes keypoint data to detect specific body movements using pattern recognition
 */

import GAME_CONFIG from './gameConfig.js';
import { MotionEnum } from './motionEnum.js';
import {
    ArmCurlDetector,
    HeadTurnDetector,
    ArmRaiseDetector,
    SquatDetector,
    JumpingJackDetector
} from './motionDetectors.js';

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
 * MotionDetector
 * Main detection engine that analyzes keypoint data to recognize movements
 */
class MotionDetector {
    constructor(config = GAME_CONFIG) {
        this.config = config;
        this.cooldownManagers = {};
        this.detectors = {};
        
        // Initialize cooldown managers for each motion
        MotionEnum.getAllMotions().forEach(motion => {
            this.cooldownManagers[motion.id] = new CooldownManager(
                config.cooldownPeriods[motion.id]
            );
        });
        
        // Initialize specialized detectors
        this.detectors.armCurl = new ArmCurlDetector(config);
        this.detectors.headTurn = new HeadTurnDetector(config);
        this.detectors.armRaise = new ArmRaiseDetector(config);
        this.detectors.squat = new SquatDetector(config);
        this.detectors.jumpingJack = new JumpingJackDetector(config);
        
        console.log('[MOTION DETECTOR] Initialized with pattern-based detection');
    }
    
    // ========== HELPER METHODS ==========
    
    /**
     * Validate that required keypoints exist and have sufficient confidence
     */
    validateKeypoints(keypoints, motionType) {
        const requiredKeypoints = this.getRequiredKeypoints(motionType);
        return requiredKeypoints.every(idx => 
            keypoints[idx] && keypoints[idx].score > 0.2
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
    
    // ========== MAIN DETECTION METHOD ==========
    
    /**
     * Main detection method called from game loop
     * @param {string} motionType - Type of motion to detect
     * @param {Array} keypoints - Array of keypoint objects from pose detection
     * @returns {boolean} True if movement pattern detected
     */
    detect(motionType, keypoints) {
        // Log first detection attempt
        if (!this._detectLogged) {
            console.log('[MOTION DETECTOR] Pattern-based detection initialized');
            console.log('[MOTION DETECTOR] Motion type:', motionType);
            console.log('[MOTION DETECTOR] Keypoints count:', keypoints.length);
            console.log('[MOTION DETECTOR] Analyzing every frame for patterns');
            this._detectLogged = true;
        }
        
        // Validate keypoints
        const isValid = this.validateKeypoints(keypoints, motionType);
        if (!isValid) {
            if (!this._validationWarnCount) this._validationWarnCount = 0;
            if (this._validationWarnCount < 3) {
                console.warn('[MOTION DETECTOR] Keypoint validation failed for:', motionType);
                this._validationWarnCount++;
            }
            return false;
        }
        
        // Use specialized detector for motion type
        let detected = false;
        const detector = this.detectors[motionType];
        
        if (!detector) {
            console.warn('[MOTION DETECTOR] No detector found for:', motionType);
            return false;
        }
        
        // Update detector with new keypoints (samples every frame)
        detected = detector.update(keypoints);
        
        // Check cooldown only if movement was detected
        if (detected) {
            if (!this.cooldownManagers[motionType].canDetect()) {
                return false; // Still in cooldown
            }
            
            console.log('[MOTION DETECTOR] ✓ Pattern DETECTED:', motionType);
            return true;
        }
        
        return false;
    }
    
    /**
     * Reset all detectors (useful when switching motion types)
     */
    reset() {
        Object.values(this.detectors).forEach(detector => {
            if (detector.reset) detector.reset();
        });
        Object.values(this.cooldownManagers).forEach(manager => {
            manager.reset();
        });
        console.log('[MOTION DETECTOR] All detectors reset');
    }
}

export { MotionDetector, CooldownManager };
