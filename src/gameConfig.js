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
    
    // Pattern detection settings
    patternDetectionInterval: 5, // Run pattern detection every N frames (performance optimization)
    historyBufferSize: 30, // Store last 30 frames (~1 second at 30fps)
    
    // Cooldown periods (prevent rapid re-detection)
    cooldownPeriods: {
        armCurl: 400,      // ms - allows ~2.5 curls per second
        headTurn: 500,     // ms - allows ~2 turns per second
        armRaise: 350,     // ms - allows ~3 raises per second
        squat: 700,        // ms - allows ~1.5 squats per second
        jumpingJack: 600   // ms - allows ~1.5 jacks per second
    },
    
    // Motion-specific thresholds
    armCurl: {
        flexedThreshold: 60,      // Arm is flexed when angle < 60°
        extendedThreshold: 120,   // Arm is extended when angle > 120°
        minValleyDepth: 50        // Valley must be at least this deep
    },
    
    headTurn: {
        oscillationThreshold: 30,  // Minimum horizontal movement in pixels
        minOscillations: 1         // Number of complete oscillations required
    },
    
    armRaise: {
        peakThreshold: 50,         // Minimum vertical movement in pixels
        minPeakHeight: 40          // Peak must be at least this high
    },
    
    squat: {
        squatAngleThreshold: 120,  // Leg angle threshold for squat position
        standingThreshold: 150     // Leg angle threshold for standing position
    },
    
    jumpingJack: {
        spreadThreshold: 1.2,      // Ankle width must be 1.2x hip width
        armHeightThreshold: 0      // Wrists must be above shoulders
    }
};

export default GAME_CONFIG;
