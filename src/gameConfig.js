/**
 * Game Configuration
 * All configurable parameters for the Motion Game Mode
 */
const GAME_CONFIG = {
    // Game mechanics
    jumpsPerPoint: 10,
    ghostJumpHeight: 60, // pixels
    ghostAnimationSpeed: 200, // milliseconds
    markerAlpha: 0.3,
    hudUpdateInterval: 16, // milliseconds (60fps)
    
    // Detection tuning (optimized for normal movement speed)
    detectionSampleRate: 2, // Analyze every 2nd frame
    cooldownPeriods: {
        armCurl: 400,      // ms - allows ~2.5 curls per second
        headTurn: 500,     // ms - allows ~2 turns per second
        armRaise: 350,     // ms - allows ~3 raises per second
        squat: 700,        // ms - allows ~1.5 squats per second
        jumpingJack: 600   // ms - allows ~1.5 jacks per second
    },
    timeWindowSize: 7, // frames (larger window for better accuracy)
    confidenceThreshold: 0.5, // 50% of frames must be positive (balanced)
    
    // Movement thresholds (relaxed for better detection)
    armCurlAngleThreshold: 60, // degrees (was 45)
    headTurnDistanceThreshold: 20, // pixels (was 30)
    armRaiseHeightThreshold: -30, // pixels above shoulder (was -50, negative = above)
    squatAngleThreshold: 120, // degrees (was 100)
    jumpingJackSpreadThreshold: 1.2 // factor of shoulder width (was 1.3)
};

export default GAME_CONFIG;
