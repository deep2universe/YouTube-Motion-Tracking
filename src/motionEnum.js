/**
 * Motion Enum
 * Defines the five detectable body movements for the game
 */
class MotionEnum {
    // Movement 1: Arm Curl (Bicep exercise)
    static armCurl = new MotionEnum(
        'armCurl',
        '💪',
        'Arm Curl',
        'Bend your arm like lifting a dumbbell'
    );
    
    // Movement 2: Head Turn
    static headTurn = new MotionEnum(
        'headTurn',
        '🔄',
        'Head Turn',
        'Turn your head left and right'
    );
    
    // Movement 3: Arm Raise
    static armRaise = new MotionEnum(
        'armRaise',
        '🙋',
        'Arm Raise',
        'Raise your arm above your head'
    );
    
    // Movement 4: Squat
    static squat = new MotionEnum(
        'squat',
        '🦵',
        'Squat',
        'Bend your knees like doing a squat'
    );
    
    // Movement 5: Jumping Jack
    static jumpingJack = new MotionEnum(
        'jumpingJack',
        '🤸',
        'Jumping Jack',
        'Jump with arms and legs spread apart'
    );
    
    constructor(id, icon, displayName, description) {
        this.id = id;
        this.icon = icon;
        this.displayName = displayName;
        this.description = description;
    }
    
    /**
     * Get all motions as array
     * @returns {MotionEnum[]} Array of motion objects
     */
    static getAllMotions() {
        return [
            MotionEnum.armCurl,
            MotionEnum.headTurn,
            MotionEnum.armRaise,
            MotionEnum.squat,
            MotionEnum.jumpingJack
        ];
    }
    
    /**
     * Get motion by ID
     * @param {string} id - Motion ID
     * @returns {MotionEnum|null} Motion object or null
     */
    static getById(id) {
        const motions = MotionEnum.getAllMotions();
        return motions.find(m => m.id === id) || null;
    }
}

export { MotionEnum };
